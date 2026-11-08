"""Grading and ProofScore logic (pure functions, no framework imports)."""

PASS_SCORE = 70
WEIGHTS = {"assessments": 50, "projects": 30, "credentials": 20}
LEVEL_NAMES = ["Not yet evidenced", "Beginner", "Developing", "Competent", "Advanced", "Expert"]


def grade(questions: list, answers: list) -> dict:
    """Grade answers on the server. `answers[i]` is an option index or None."""
    breakdown, correct = [], 0
    for i, q in enumerate(questions):
        selected = answers[i] if i < len(answers) else None
        ok = selected == q["answer"]
        correct += 1 if ok else 0
        breakdown.append({
            "index": i, "prompt": q["prompt"], "options": q["options"],
            "selected": selected, "correct_index": q["answer"], "is_correct": ok,
        })
    total = len(questions)
    score = round(100 * correct / total) if total else 0
    return {"score": score, "correct": correct, "total": total, "passed": score >= PASS_SCORE, "breakdown": breakdown}


def credential_level(score: int) -> int:
    return 5 if score >= 95 else 4 if score >= 80 else 3


def skill_level(avg_score: float, has_project: bool = False) -> int:
    level = max(1, min(5, round(avg_score / 20)))
    return min(5, level + 1) if has_project and level < 5 else level


def proof_score(avg_assessment: float, verified: int, unverified: int, credentials: int):
    parts = {
        "assessments": round(avg_assessment),
        "projects": min(100, verified * 60 + unverified * 25),
        "credentials": min(100, credentials * 40),
    }
    total = sum(parts[k] * WEIGHTS[k] for k in parts) / 100
    return round(total), parts


def score_label(score: int, has_evidence: bool) -> str:
    if not has_evidence:
        return "Not yet assessed"
    return "Advanced" if score >= 85 else "Competent" if score >= 70 else "Developing" if score >= 50 else "Foundational"
