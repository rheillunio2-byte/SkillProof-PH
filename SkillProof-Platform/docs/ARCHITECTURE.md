# Architecture

The Next.js App Router frontend provides public marketing pages and role-specific workspaces. It calls a FastAPI REST service. SQLAlchemy models persist demo challenges, users, attempts, portfolios and credentials. SQLite is the default local database; PostgreSQL can be selected by changing `DATABASE_URL`.

The initial relational schema is documented in `backend/app/migrations/001_initial.sql`. The MVP initializes local tables through SQLAlchemy `metadata.create_all`; the SQL file is a PostgreSQL migration reference and is not an Alembic-managed migration chain.

The assessment flow currently grades objective demo questions only. A real verification pipeline should distinguish automated objective scoring, code test outcomes, human rubric review and verified project provenance. Each evidence type should retain evaluator, timestamp, rubric version and audit history.
