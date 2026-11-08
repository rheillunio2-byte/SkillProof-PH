"""Fictional demo data. Rows are tagged source='seed' so the UI can label them as sample data."""
import json
from datetime import timedelta

from sqlalchemy.orm import Session

from .content import CHALLENGES
from .models import Attempt, Challenge, Credential, Portfolio, User, utcnow
from .security import hash_password

DEMO_PASSWORD = "SkillProof!2026"

USERS = [  # id order matters for the attempt seeds below
    ("Alex Morgan", "learner@skillproof.demo", "learner", "Frontend developer · Building accessible products", "Cagayan de Oro"),
    ("Jordan Lee", "recruiter@skillproof.demo", "employer", "Talent partner · Northstar Labs", "Manila"),
    ("Taylor Cruz", "admin@northstar.demo", "institution", "Program coordinator · Northstar Institute", "Cebu"),
    ("Mika Santos", "mika@example.demo", "learner", "Data analyst · Curious problem solver", "Davao"),
    ("Sam Rivera", "sam@example.demo", "learner", "Backend engineer · API enthusiast", "Quezon City"),
]

# (user email, challenge title, score, days ago, seconds taken)
ATTEMPTS = [
    ("learner@skillproof.demo", "Build a responsive pricing page", 75, 14, 612),
    ("learner@skillproof.demo", "Build a responsive pricing page", 100, 10, 488),
    ("learner@skillproof.demo", "Python data cleaner", 75, 8, 701),
    ("learner@skillproof.demo", "Debug a failing component", 100, 5, 455),
    ("learner@skillproof.demo", "Dashboard UX critique", 75, 2, 530),
    ("mika@example.demo", "Explore a CSV dataset", 100, 9, 390),
    ("mika@example.demo", "SQL analytics challenge", 75, 6, 640),
    ("mika@example.demo", "Python data cleaner", 100, 3, 520),
    ("sam@example.demo", "REST API design review", 75, 7, 705),
    ("sam@example.demo", "Normalize a database schema", 50, 4, 760),
    ("sam@example.demo", "Python data cleaner", 75, 1, 600),
]


def seed(db: Session) -> None:
    if db.query(User).count():
        return
    pw = hash_password(DEMO_PASSWORD)
    users = {}
    for name, email, role, headline, location in USERS:
        users[email] = User(name=name, email=email, password_hash=pw, role=role, headline=headline, location=location)
        db.add(users[email])
    chal = {}
    for title, cat, diff, minutes, desc, skills, questions in CHALLENGES:
        chal[title] = Challenge(title=title, category=cat, difficulty=diff, duration=minutes,
                                description=desc, skills=skills, questions=json.dumps(questions))
        db.add(chal[title])
    db.flush()
    now = utcnow()
    for email, title, score, days, secs in ATTEMPTS:
        total = len(json.loads(chal[title].questions))
        db.add(Attempt(user_id=users[email].id, challenge_id=chal[title].id, score=score, total=total,
                       correct=round(score * total / 100), answers="[]", seconds=secs, source="seed",
                       created_at=now - timedelta(days=days)))
    alex, mika = users["learner@skillproof.demo"], users["mika@example.demo"]
    db.add(Portfolio(user_id=alex.id, title="Accessible Product Studio", technologies="React, TypeScript, CSS",
                     description="A component library focused on keyboard access and clear interaction states.",
                     repository_url="https://github.com/example/accessibility-studio", verified=True, source="seed"))
    db.add(Portfolio(user_id=mika.id, title="Local Market Insights", technologies="Python, Pandas, Charts",
                     description="A small data storytelling project exploring public market trends.",
                     repository_url="https://github.com/example/market-insights", verified=False, source="seed"))
    for cid, owner, skill, level, days in [
        ("SP-2026-8F2A91", alex, "Responsive Web Development", 4, 10),
        ("SP-2026-5D1E44", alex, "Debug a failing component", 5, 5),
        ("SP-2026-3B7C20", mika, "Data Analytics", 3, 3),
    ]:
        db.add(Credential(credential_id=cid, user_id=owner.id, recipient=owner.name, skill=skill, level=level,
                          issuer="SkillProof Demo Lab", source="seed", issued_at=now - timedelta(days=days)))
    db.commit()
