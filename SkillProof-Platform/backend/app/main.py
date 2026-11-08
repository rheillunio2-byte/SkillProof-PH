import json
import os
import secrets
import time
from collections import Counter, defaultdict
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import inspect, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine, get_db
from .models import Attempt, Challenge, Credential, Portfolio, Shortlist, User, utcnow
from .schemas import AttemptIn, LoginIn, ProfileIn, ProjectIn, RegisterIn, ShortlistIn
from .scoring import (LEVEL_NAMES, PASS_SCORE, WEIGHTS, credential_level, grade, proof_score, score_label,
                      skill_level)
from .security import create_token, decode_token, hash_password, verify_password
from .seed import seed
from .content import SKILL_CLUSTERS

APP_ENV = os.getenv("APP_ENV", "development")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-secret-change-me")
SEED_DEMO_DATA = os.getenv("SEED_DEMO_DATA", "true" if APP_ENV != "production" else "false").lower() == "true"
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",") if o.strip()]
DEMO_NOTICE = "Prototype scoring: objective questions only, no proctoring or code execution. Not a certification."

if APP_ENV == "production" and SECRET_KEY == "dev-only-secret-change-me":
    raise RuntimeError("Set a strong SECRET_KEY before running with APP_ENV=production")


def ensure_schema() -> None:
    """Create tables. In development, rebuild a DB created by an older schema (demo data only)."""
    insp = inspect(engine)
    if insp.has_table("users") and "password_hash" not in {c["name"] for c in insp.get_columns("users")}:
        if APP_ENV == "production":
            raise RuntimeError("Database schema is outdated; apply migrations before starting.")
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(_: FastAPI):
    ensure_schema()
    if SEED_DEMO_DATA:
        with SessionLocal() as db:
            seed(db)
    yield


app = FastAPI(title="SkillProof API", version="0.2.0", lifespan=lifespan,
              description="Prototype API for the SkillProof skills-evidence platform.")
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=False,
                   allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"], allow_headers=["Authorization", "Content-Type"])

# ---------------------------------------------------------------- helpers
bearer = HTTPBearer(auto_error=False)
_failed_logins: dict = defaultdict(list)  # in-memory limiter; use Redis or similar in production


def iso(dt):
    return dt.isoformat() + "Z" if dt else None


def split(text):
    return [s.strip() for s in (text or "").split(",") if s.strip()]


def user_out(u: User) -> dict:
    return {"id": u.id, "name": u.name, "email": u.email, "role": u.role, "headline": u.headline, "location": u.location}


def challenge_out(c: Challenge, with_questions: bool = False) -> dict:
    out = {"id": c.id, "title": c.title, "category": c.category, "difficulty": c.difficulty, "duration": c.duration,
           "description": c.description, "skills": split(c.skills)}
    questions = json.loads(c.questions or "[]")
    out["question_count"] = len(questions)
    if with_questions:  # correct answers are deliberately stripped
        out["questions"] = [{"prompt": x["prompt"], "options": x["options"]} for x in questions]
    return out


def current_user(creds: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)) -> User:
    unauthorized = HTTPException(401, "Authentication required", headers={"WWW-Authenticate": "Bearer"})
    if not creds:
        raise unauthorized
    payload = decode_token(creds.credentials, SECRET_KEY)
    user = db.get(User, payload["sub"]) if payload else None
    if not user:
        raise unauthorized
    return user


def require_role(*roles: str):
    def dependency(user: User = Depends(current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(403, f"This action requires a {' or '.join(roles)} account")
        return user
    return dependency


def best_attempts(attempts):
    best = {}
    for a in attempts:
        if a.challenge_id not in best or a.score > best[a.challenge_id].score:
            best[a.challenge_id] = a
    return best


def build_profile(db: Session, user: User, chal: dict) -> dict:
    attempts = db.query(Attempt).filter(Attempt.user_id == user.id).order_by(Attempt.created_at).all()
    projects = db.query(Portfolio).filter(Portfolio.user_id == user.id).order_by(Portfolio.created_at.desc()).all()
    creds = db.query(Credential).filter(Credential.user_id == user.id).order_by(Credential.issued_at.desc()).all()
    best = best_attempts(attempts)
    evidence = {name: {"scores": [], "projects": 0, "verified": False, "available": 0}
                for c in chal.values() for name in split(c.skills)}
    for c in chal.values():
        for name in split(c.skills):
            evidence[name]["available"] += 1
    for a in best.values():
        for name in split(chal[a.challenge_id].skills):
            evidence[name]["scores"].append(a.score)
    for p in projects:
        for tech in split(p.technologies):
            e = evidence.setdefault(tech, {"scores": [], "projects": 0, "verified": False, "available": 0})
            e["projects"] += 1
            e["verified"] = e["verified"] or p.verified
    skills = []
    for name, e in evidence.items():
        if e["scores"]:
            level = skill_level(sum(e["scores"]) / len(e["scores"]), e["projects"] > 0)
        elif e["projects"]:
            level = 3 if e["verified"] else 2
        else:
            level = 0
        parts = []
        if e["scores"]:
            parts.append(f"{len(e['scores'])} assessment{'s' if len(e['scores']) > 1 else ''} · best {max(e['scores'])}%")
        if e["projects"]:
            parts.append(f"{e['projects']} project{'s' if e['projects'] > 1 else ''}")
        skills.append({"name": name, "level": level, "level_name": LEVEL_NAMES[level], "cluster": SKILL_CLUSTERS.get(name, "Other"),
                       "evidence": " · ".join(parts) or "No evidence yet", "assessments_available": e["available"]})
    skills.sort(key=lambda s: (-s["level"], s["name"]))
    avg = sum(a.score for a in best.values()) / len(best) if best else 0
    verified = sum(1 for p in projects if p.verified)
    valid_creds = sum(1 for c in creds if c.status == "valid")
    total, parts = proof_score(avg, verified, len(projects) - verified, valid_creds)
    return {"attempts": attempts, "projects": projects, "creds": creds, "best": best, "skills": skills, "avg": round(avg),
            "proof_score": total, "breakdown": parts, "has_evidence": bool(best or projects or creds)}


def chal_map(db: Session) -> dict:
    return {c.id: c for c in db.query(Challenge).all()}


def cred_out(c: Credential) -> dict:
    return {"credential_id": c.credential_id, "recipient": c.recipient, "skill": c.skill, "level": c.level,
            "level_name": LEVEL_NAMES[c.level], "issuer": c.issuer, "status": c.status, "source": c.source, "issued_at": iso(c.issued_at)}


def attempt_out(a: Attempt, chal: dict) -> dict:
    c = chal.get(a.challenge_id)
    return {"id": a.id, "challenge_id": a.challenge_id, "title": c.title if c else "Removed challenge", "category": c.category if c else "",
            "score": a.score, "correct": a.correct, "total": a.total, "seconds": a.seconds, "source": a.source, "created_at": iso(a.created_at)}


def project_out(p: Portfolio) -> dict:
    return {"id": p.id, "title": p.title, "description": p.description, "technologies": split(p.technologies),
            "repository_url": p.repository_url, "verified": p.verified, "source": p.source, "created_at": iso(p.created_at)}


# ---------------------------------------------------------------- public
@app.get("/health")
def health():
    return {"status": "ok", "service": "skillproof-api", "env": APP_ENV}


@app.get("/api/stats")
def stats(db: Session = Depends(get_db)):
    return {"challenges": db.query(Challenge).count(), "learners": db.query(User).filter_by(role="learner").count(),
            "assessments": db.query(Attempt).count(), "credentials": db.query(Credential).count()}


@app.get("/api/challenges")
def challenges(q: str = "", category: str = "", difficulty: str = "", db: Session = Depends(get_db)):
    query = db.query(Challenge)
    if q:
        like = f"%{q[:80]}%"
        query = query.filter(or_(Challenge.title.ilike(like), Challenge.description.ilike(like), Challenge.skills.ilike(like)))
    if category:
        query = query.filter(Challenge.category == category)
    if difficulty:
        query = query.filter(Challenge.difficulty == difficulty)
    return [challenge_out(c) for c in query.order_by(Challenge.id).all()]


@app.get("/api/challenges/{challenge_id}")
def challenge_detail(challenge_id: int, db: Session = Depends(get_db)):
    c = db.get(Challenge, challenge_id)
    if not c:
        raise HTTPException(404, "Challenge not found")
    return challenge_out(c, with_questions=True)


@app.get("/api/leaderboard")
def leaderboard(db: Session = Depends(get_db)):
    chal = chal_map(db)
    rows = []
    for u in db.query(User).filter_by(role="learner").all():
        best = best_attempts(db.query(Attempt).filter_by(user_id=u.id).all())
        if not best:
            continue
        cats = Counter(chal[a.challenge_id].category for a in best.values())
        rows.append({"user_id": u.id, "name": u.name, "points": sum(a.score for a in best.values()), "assessments": len(best),
                     "badge": f"{cats.most_common(1)[0][0]} focus"})
    rows.sort(key=lambda r: (-r["points"], r["name"]))
    return [{**r, "rank": i + 1} for i, r in enumerate(rows[:20])]


@app.get("/api/credentials/{credential_id}/verify")
def verify_credential(credential_id: str, db: Session = Depends(get_db)):
    c = db.query(Credential).filter_by(credential_id=credential_id.strip().upper()).first()
    if not c:
        raise HTTPException(404, "No matching credential record exists.")
    return {**cred_out(c), "valid": c.status == "valid", "demo": True,
            "message": "Record found in the SkillProof prototype registry. This is demo data, not an accredited credential."}


# ---------------------------------------------------------------- auth
@app.post("/api/auth/register", status_code=201)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if db.query(User).filter_by(email=email).first():
        raise HTTPException(409, "An account with this email already exists")
    user = User(name=payload.name.strip(), email=email, password_hash=hash_password(payload.password), role=payload.role)
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "An account with this email already exists")
    return {"token": create_token(user.id, user.role, SECRET_KEY), "user": user_out(user)}


_DUMMY_HASH = hash_password("not-a-real-password")


@app.post("/api/auth/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    now = time.time()
    _failed_logins[email] = [t for t in _failed_logins[email] if now - t < 900]
    if len(_failed_logins[email]) >= 10:
        raise HTTPException(429, "Too many failed attempts. Try again in a few minutes.")
    user = db.query(User).filter_by(email=email).first()
    ok = verify_password(payload.password, user.password_hash if user else _DUMMY_HASH)
    if not user or not ok:
        _failed_logins[email].append(now)
        raise HTTPException(401, "Invalid email or password")
    _failed_logins.pop(email, None)
    return {"token": create_token(user.id, user.role, SECRET_KEY), "user": user_out(user)}


@app.get("/api/auth/me")
def me(user: User = Depends(current_user)):
    return user_out(user)


@app.patch("/api/auth/me")
def update_me(payload: ProfileIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    user.name, user.headline, user.location = payload.name.strip(), payload.headline.strip(), payload.location.strip()
    db.commit()
    return user_out(user)


# ---------------------------------------------------------------- learner
@app.post("/api/attempts", status_code=201)
def submit_attempt(payload: AttemptIn, user: User = Depends(require_role("learner")), db: Session = Depends(get_db)):
    challenge = db.get(Challenge, payload.challenge_id)
    if not challenge:
        raise HTTPException(404, "Challenge not found")
    questions = json.loads(challenge.questions or "[]")
    if len(payload.answers) != len(questions):
        raise HTTPException(422, f"Expected {len(questions)} answers, received {len(payload.answers)}")
    if any(a is not None and not 0 <= a < len(questions[i]["options"]) for i, a in enumerate(payload.answers)):
        raise HTTPException(422, "An answer index is out of range")
    result = grade(questions, payload.answers)
    attempt = Attempt(user_id=user.id, challenge_id=challenge.id, score=result["score"], correct=result["correct"],
                      total=result["total"], answers=json.dumps(payload.answers), seconds=payload.seconds, source="live")
    db.add(attempt)
    credential = None
    if result["passed"]:
        level = credential_level(result["score"])
        credential = db.query(Credential).filter_by(user_id=user.id, skill=challenge.title, status="valid").first()
        if credential is None:
            while True:
                cid = f"SP-{utcnow().year}-{secrets.token_hex(3).upper()}"
                if not db.query(Credential).filter_by(credential_id=cid).first():
                    break
            credential = Credential(credential_id=cid, user_id=user.id, recipient=user.name, skill=challenge.title,
                                    level=level, issuer="SkillProof Demo Lab", source="live")
            db.add(credential)
        elif level > credential.level:
            credential.level = level
    db.commit()
    db.refresh(attempt)
    return {"attempt_id": attempt.id, **result, "pass_mark": PASS_SCORE, "seconds": attempt.seconds,
            "credential": cred_out(credential) if credential else None, "notice": DEMO_NOTICE}


@app.get("/api/attempts")
def my_attempts(user: User = Depends(require_role("learner")), db: Session = Depends(get_db)):
    chal = chal_map(db)
    rows = db.query(Attempt).filter_by(user_id=user.id).order_by(Attempt.created_at.desc()).all()
    return [attempt_out(a, chal) for a in rows]


@app.get("/api/skills")
def my_skills(user: User = Depends(require_role("learner")), db: Session = Depends(get_db)):
    p = build_profile(db, user, chal_map(db))
    return {"proof_score": p["proof_score"], "breakdown": p["breakdown"], "weights": WEIGHTS, "skills": p["skills"]}


@app.get("/api/credentials")
def my_credentials(user: User = Depends(require_role("learner")), db: Session = Depends(get_db)):
    return [cred_out(c) for c in db.query(Credential).filter_by(user_id=user.id).order_by(Credential.issued_at.desc()).all()]


@app.get("/api/portfolio")
def my_portfolio(user: User = Depends(require_role("learner")), db: Session = Depends(get_db)):
    return [project_out(p) for p in db.query(Portfolio).filter_by(user_id=user.id).order_by(Portfolio.created_at.desc()).all()]


@app.post("/api/portfolio", status_code=201)
def add_project(payload: ProjectIn, user: User = Depends(require_role("learner")), db: Session = Depends(get_db)):
    techs = list(dict.fromkeys(t.strip() for t in payload.technologies if t.strip()))
    project = Portfolio(user_id=user.id, title=payload.title.strip(), description=payload.description.strip(),
                        technologies=", ".join(techs), repository_url=payload.repository_url, verified=False, source="live")
    db.add(project)
    db.commit()
    db.refresh(project)
    return project_out(project)


@app.delete("/api/portfolio/{project_id}", status_code=204)
def delete_project(project_id: int, user: User = Depends(require_role("learner")), db: Session = Depends(get_db)):
    project = db.get(Portfolio, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(404, "Project not found")
    db.delete(project)
    db.commit()


ACHIEVEMENTS = [
    ("first-step", "First step", "Complete your first assessment", lambda p, c: len(p["attempts"]), 1),
    ("high-scorer", "High scorer", "Reach a score of 90% or more", lambda p, c: max([a.score for a in p["attempts"]] or [0]), 90),
    ("explorer", "Explorer", "Attempt 3 different categories",
     lambda p, c: len({c[a.challenge_id].category for a in p["attempts"] if a.challenge_id in c}), 3),
    ("credentialed", "Credentialed", "Earn 2 credentials", lambda p, c: len(p["creds"]), 2),
    ("builder", "Builder", "Add a portfolio project", lambda p, c: len(p["projects"]), 1),
]


@app.get("/api/dashboard")
def dashboard(user: User = Depends(require_role("learner")), db: Session = Depends(get_db)):
    chal = chal_map(db)
    p = build_profile(db, user, chal)
    attempts = p["attempts"]
    attempted = {a.challenge_id for a in attempts}
    todo = [c for c in chal.values() if c.id not in attempted]
    if len(todo) < 3:
        todo += [chal[cid] for cid, _ in sorted(((cid, a.score) for cid, a in p["best"].items()), key=lambda x: x[1])]
    events = [{"type": "assessment", "title": f"Completed {chal[a.challenge_id].title}", "detail": f"{a.score}% score", "source": a.source,
               "at": iso(a.created_at)} for a in attempts if a.challenge_id in chal]
    events += [{"type": "credential", "title": f"Credential issued · {c.skill}", "detail": f"Level {c.level}", "source": c.source,
                "at": iso(c.issued_at)} for c in p["creds"]]
    events += [{"type": "project", "title": f"Added project · {x.title}", "detail": "Portfolio", "source": x.source,
                "at": iso(x.created_at)} for x in p["projects"]]
    events.sort(key=lambda e: e["at"], reverse=True)
    achievements = []
    for key, title, desc, progress, target in ACHIEVEMENTS:
        value = progress(p, chal)
        achievements.append({"id": key, "title": title, "description": desc, "progress": min(value, target), "target": target,
                             "earned": value >= target})
    known = [s for s in p["skills"] if s["level"] > 0]
    return {
        "user": user_out(user), "proof_score": p["proof_score"], "proof_label": score_label(p["proof_score"], p["has_evidence"]),
        "breakdown": p["breakdown"],
        "stats": {"assessments": len(attempts), "skills": len(known), "credentials": len(p["creds"]), "projects": len(p["projects"]),
                  "verified_projects": sum(1 for x in p["projects"] if x.verified), "average_score": p["avg"]},
        "has_sample_data": any(x.source == "seed" for x in [*attempts, *p["creds"], *p["projects"]]),
        "trend": [{"label": a.created_at.strftime("%b %d"), "score": a.score} for a in attempts],
        "skills": known[:8], "credentials": [cred_out(c) for c in p["creds"][:3]], "events": events[:6],
        "recommended": [challenge_out(c) for c in todo[:3]], "achievements": achievements,
    }


# ---------------------------------------------------------------- employer
def candidate_rows(db: Session):
    chal = chal_map(db)
    for u in db.query(User).filter_by(role="learner").order_by(User.id).all():
        p = build_profile(db, u, chal)
        if not p["has_evidence"]:
            continue
        yield u, p


@app.get("/api/candidates")
def candidates(user: User = Depends(require_role("employer")), db: Session = Depends(get_db)):
    out = []
    for u, p in candidate_rows(db):
        out.append({"id": u.id, "name": u.name, "headline": u.headline, "location": u.location, "proof_score": p["proof_score"],
                    "level": score_label(p["proof_score"], True), "assessments": len(p["best"]), "credentials": len(p["creds"]),
                    "skills": [s["name"] for s in p["skills"] if s["level"] > 0][:4],
                    "sample": any(a.source == "seed" for a in p["attempts"])})
    return sorted(out, key=lambda c: -c["proof_score"])


@app.get("/api/shortlists")
def list_shortlist(user: User = Depends(require_role("employer")), db: Session = Depends(get_db)):
    return [r.candidate_id for r in db.query(Shortlist).filter_by(employer_id=user.id).all()]


@app.post("/api/shortlists", status_code=201)
def add_shortlist(payload: ShortlistIn, user: User = Depends(require_role("employer")), db: Session = Depends(get_db)):
    candidate = db.get(User, payload.candidate_id)
    if not candidate or candidate.role != "learner":
        raise HTTPException(404, "Candidate not found")
    if not db.query(Shortlist).filter_by(employer_id=user.id, candidate_id=candidate.id).first():
        db.add(Shortlist(employer_id=user.id, candidate_id=candidate.id))
        db.commit()
    return {"saved": True, "candidate_id": candidate.id}


@app.delete("/api/shortlists/{candidate_id}", status_code=204)
def remove_shortlist(candidate_id: int, user: User = Depends(require_role("employer")), db: Session = Depends(get_db)):
    db.query(Shortlist).filter_by(employer_id=user.id, candidate_id=candidate_id).delete()
    db.commit()


# ---------------------------------------------------------------- institution
@app.get("/api/students")
def students(user: User = Depends(require_role("institution")), db: Session = Depends(get_db)):
    rows, chal = [], chal_map(db)
    for u in db.query(User).filter_by(role="learner").order_by(User.id).all():
        p = build_profile(db, u, chal)
        last = p["attempts"][-1].created_at if p["attempts"] else None
        rows.append({"id": u.id, "name": u.name, "email": u.email, "assessments": len(p["best"]), "average_score": p["avg"],
                     "competencies": sum(1 for s in p["skills"] if s["level"] > 0), "credentials": len(p["creds"]),
                     "last_active": iso(last), "status": "Active" if p["attempts"] else "No activity"})
    active = [r for r in rows if r["assessments"]]
    return {"summary": {"learners": len(rows), "active": len(active), "assessments": sum(r["assessments"] for r in rows),
                        "average_score": round(sum(r["average_score"] for r in active) / len(active)) if active else 0,
                        "credentials": sum(r["credentials"] for r in rows)},
            "students": rows}
