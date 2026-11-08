# Upgrade notes (v0.2 / web 1.1)

## Major bugs and weaknesses fixed
1. **Answers leaked to the browser** and **scores were client-supplied**. The API now strips answers and grades on the server; a forged `score` field is ignored.
2. **Fake authentication** (`X-Demo-Role` header, all submissions attributed to one user). Replaced by register/login, scrypt hashing, signed expiring tokens, `require_role` authorization, login rate limiting.
3. **Only question 1 was ever graded**, and every challenge had the same two generic questions (answer always A). Now 12 challenges x 4 topic-specific questions, all graded.
4. **Silent fake-data fallbacks.** Pages swapped in hardcoded data when the API failed, and `/results`, skills, candidates, leaderboard and students were hardcoded. Everything is now computed from persisted attempts/projects; failures show an error state with retry. Seeded rows are tagged `source="seed"` and labeled "Sample data".
5. **Non-functional UI:** "Add project" was an `alert()`, bell icon did nothing, portfolio "Preview" links went to github.com, shortlist was not persisted, settings only wrote localStorage. All implemented or removed.
6. **Docker:** `NEXT_PUBLIC_API_URL` was set at runtime but is inlined at build time; `next start` was used with `output: "standalone"`. Now a multi-stage build with a build arg.
7. **CORS** hardcoded to one origin; now `CORS_ORIGINS`. `.env` instructions did not match what the code reads; documented.
8. Import-time DB side effects replaced by a FastAPI lifespan; old-schema SQLite files are rebuilt in development; production refuses the default `SECRET_KEY`.
9. Invalid requests now return proper codes (401/403/404/409/422/429, 201/204) with Pydantic validation.

## Verified in the authoring environment (no network, so no npm/pip install)
- Backend: all modules compile; 10 standard-library tests pass (password hashing, token signing/tampering/expiry, grading, scoring, content integrity).
- Frontend: TypeScript strict check passes against stub declarations for react/next/framer-motion/lucide/recharts, with no unused imports. Every frontend API call matches a backend route; all asset references exist; seed data is consistent.

## NOT verified (needs your machine)
`npm install`, `next build`, `next lint`, running FastAPI, `backend/tests/test_api.py`, visual QA in a browser at each breakpoint, and the browser console. Run the commands in README "Tests" and report anything that fails.
