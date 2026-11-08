# Security notes

This repository is a demo MVP. It is not ready for real learner records or hiring decisions.

- Accounts use scrypt password hashing and HMAC-signed 12-hour bearer tokens. Employer/institution sign-ups are not identity-verified.
- Before production, use a maintained identity provider or secure password authentication, Argon2id/bcrypt hashing, short-lived sessions, CSRF protection, rate limiting, email verification and recovery.
- Role checks are enforced server-side from the signed token (`require_role`). Add tenant scoping before multi-organization use.
- Assessment answers are stripped from API responses and graded on the server; clients cannot submit a score.
- Validate all request bodies with Pydantic models; add audit trails and abuse monitoring.
- Keep secrets in server-side environment variables and rotate them.
- Use HTTPS, secure cookies, restrictive CORS, CSP, dependency scanning and backups.
- Treat candidate scores as evidence summaries, never as automated employment decisions.
- Do not upload sensitive personal information to the demo environment.
