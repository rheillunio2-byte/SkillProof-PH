"""Framework-free tests: python -m unittest discover -s tests -p "test_core.py" (run from backend/)."""
import sys, time, unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.modules.setdefault("app", type(sys)("app")).__path__ = [str(Path(__file__).resolve().parents[1] / "app")]

from app import content, scoring, security  # noqa: E402


class SecurityTests(unittest.TestCase):
    def test_password_roundtrip(self):
        h = security.hash_password("SkillProof!2026")
        self.assertTrue(security.verify_password("SkillProof!2026", h))
        self.assertFalse(security.verify_password("wrong", h))
        self.assertNotEqual(h, security.hash_password("SkillProof!2026"))  # unique salt

    def test_malformed_hash_is_rejected(self):
        self.assertFalse(security.verify_password("x", "garbage"))

    def test_token_roundtrip_and_tamper(self):
        t = security.create_token(7, "learner", "secret")
        self.assertEqual(security.decode_token(t, "secret")["sub"], 7)
        self.assertIsNone(security.decode_token(t, "other-secret"))
        body, sig = t.split(".")
        self.assertIsNone(security.decode_token(body + "." + sig[:-2] + "AA", "secret"))
        self.assertIsNone(security.decode_token("not-a-token", "secret"))

    def test_expired_token(self):
        t = security.create_token(1, "learner", "secret", ttl_seconds=-1)
        self.assertIsNone(security.decode_token(t, "secret"))


class ScoringTests(unittest.TestCase):
    QS = [{"prompt": f"q{i}", "options": ["a", "b", "c", "d"], "answer": i % 4} for i in range(4)]

    def test_perfect_and_zero(self):
        self.assertEqual(scoring.grade(self.QS, [0, 1, 2, 3])["score"], 100)
        self.assertEqual(scoring.grade(self.QS, [3, 3, 3, 2])["score"], 0)

    def test_partial_and_unanswered(self):
        r = scoring.grade(self.QS, [0, 1, None, 0])
        self.assertEqual((r["score"], r["correct"], r["passed"]), (50, 2, False))
        self.assertIsNone(r["breakdown"][2]["selected"])

    def test_pass_mark(self):
        self.assertTrue(scoring.grade(self.QS, [0, 1, 2, 0])["passed"])  # 75%

    def test_levels(self):
        self.assertEqual([scoring.credential_level(s) for s in (70, 80, 95, 100)], [3, 4, 5, 5])
        self.assertEqual(scoring.skill_level(100), 5)
        self.assertEqual(scoring.skill_level(75, True), 5)  # 4 + project evidence
        self.assertEqual(scoring.skill_level(0), 1)

    def test_proof_score(self):
        total, parts = scoring.proof_score(88, 1, 1, 2)
        self.assertEqual(parts, {"assessments": 88, "projects": 85, "credentials": 80})
        self.assertEqual(total, 86)
        self.assertEqual(scoring.proof_score(0, 0, 0, 0)[0], 0)
        self.assertLessEqual(scoring.proof_score(100, 9, 9, 9)[0], 100)


class ContentTests(unittest.TestCase):
    def test_every_question_is_well_formed(self):
        self.assertEqual(len(content.CHALLENGES), 12)
        for title, *_, qs in content.CHALLENGES:
            self.assertEqual(len(qs), 4, title)
            for x in qs:
                self.assertEqual(len(set(x["options"])), 4, x["prompt"])
                self.assertIn(x["answer"], range(4))


if __name__ == "__main__":
    unittest.main()
