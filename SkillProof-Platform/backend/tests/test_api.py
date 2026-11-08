"""Integration tests. Needs: pip install -r requirements-dev.txt ; run: pytest (from backend/)."""
import os, tempfile

os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.mkdtemp()}/test.db"
os.environ["APP_ENV"] = "development"

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.seed import DEMO_PASSWORD


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def login(client, email):
    r = client.post("/api/auth/login", json={"email": email, "password": DEMO_PASSWORD})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


def test_health_and_public_challenges(client):
    assert client.get("/health").json()["status"] == "ok"
    items = client.get("/api/challenges").json()
    assert len(items) == 12


def test_challenge_detail_never_exposes_answers(client):
    data = client.get("/api/challenges/1").json()
    assert len(data["questions"]) == 4
    assert all("answer" not in q for q in data["questions"])
    assert client.get("/api/challenges/999").status_code == 404


def test_auth_required_and_roles(client):
    assert client.get("/api/dashboard").status_code == 401
    assert client.post("/api/auth/login", json={"email": "learner@skillproof.demo", "password": "nope"}).status_code == 401
    employer = login(client, "recruiter@skillproof.demo")
    assert client.get("/api/dashboard", headers=employer).status_code == 403
    assert client.post("/api/attempts", headers=employer, json={"challenge_id": 1, "answers": [0, 0, 0, 0]}).status_code == 403
    assert client.get("/api/candidates", headers=employer).status_code == 200
    learner = login(client, "learner@skillproof.demo")
    assert client.get("/api/candidates", headers=learner).status_code == 403


def test_server_side_grading_and_credential(client):
    h = login(client, "learner@skillproof.demo")
    perfect = client.post("/api/attempts", headers=h, json={"challenge_id": 3, "answers": [2, 0, 1, 2]})
    assert perfect.status_code == 201
    body = perfect.json()
    assert body["score"] == 100 and body["passed"] and body["credential"]["credential_id"].startswith("SP-")
    verify = client.get(f"/api/credentials/{body['credential']['credential_id']}/verify")
    assert verify.status_code == 200 and verify.json()["valid"] is True
    # a client cannot choose its own score
    forged = client.post("/api/attempts", headers=h, json={"challenge_id": 3, "answers": [0, 0, 0, 0], "score": 100})
    assert forged.json()["score"] < 100
    assert client.post("/api/attempts", headers=h, json={"challenge_id": 3, "answers": [0]}).status_code == 422
    assert client.post("/api/attempts", headers=h, json={"challenge_id": 3, "answers": [9, 0, 0, 0]}).status_code == 422


def test_dashboard_skills_leaderboard(client):
    h = login(client, "learner@skillproof.demo")
    d = client.get("/api/dashboard", headers=h).json()
    assert d["stats"]["assessments"] >= 5 and d["has_sample_data"] is True
    assert client.get("/api/skills", headers=h).json()["skills"]
    assert client.get("/api/leaderboard").json()[0]["rank"] == 1


def test_register_and_portfolio_crud(client):
    r = client.post("/api/auth/register", json={"name": "Test User", "email": "new@test.dev", "password": "longenough1"})
    assert r.status_code == 201
    h = {"Authorization": f"Bearer {r.json()['token']}"}
    assert client.post("/api/auth/register", json={"name": "Test User", "email": "NEW@test.dev", "password": "longenough1"}).status_code == 409
    assert client.post("/api/auth/register", json={"name": "T", "email": "bad", "password": "x"}).status_code == 422
    p = client.post("/api/portfolio", headers=h, json={"title": "My app", "description": "A tiny demo project.", "technologies": ["React"],
                                                     "repository_url": "https://github.com/x/y"})
    assert p.status_code == 201 and p.json()["verified"] is False
    assert client.post("/api/portfolio", headers=h, json={"title": "Bad", "description": "A tiny demo project.", "repository_url": "javascript:alert(1)"}).status_code == 422
    assert client.delete(f"/api/portfolio/{p.json()['id']}", headers=h).status_code == 204


def test_shortlist_and_students(client):
    emp = login(client, "recruiter@skillproof.demo")
    cands = client.get("/api/candidates", headers=emp).json()
    cid = cands[0]["id"]
    assert client.post("/api/shortlists", headers=emp, json={"candidate_id": cid}).status_code == 201
    assert client.post("/api/shortlists", headers=emp, json={"candidate_id": cid}).status_code == 201  # idempotent
    assert client.get("/api/shortlists", headers=emp).json() == [cid]
    assert client.delete(f"/api/shortlists/{cid}", headers=emp).status_code == 204
    inst = login(client, "admin@northstar.demo")
    assert client.get("/api/students", headers=inst).json()["summary"]["learners"] >= 3
