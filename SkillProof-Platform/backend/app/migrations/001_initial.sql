-- SkillProof reference schema (PostgreSQL). Mirrors app/models.py.
-- The local prototype creates equivalent tables via SQLAlchemy metadata; in development an
-- older SQLite file is rebuilt automatically. In production, apply real migrations instead.
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY, name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE, password_hash VARCHAR(300) NOT NULL,
  role VARCHAR(30) NOT NULL, headline VARCHAR(180) NOT NULL DEFAULT '', location VARCHAR(120) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_users_role ON users(role);
CREATE TABLE challenges (
  id BIGSERIAL PRIMARY KEY, title VARCHAR(180) NOT NULL, category VARCHAR(80) NOT NULL,
  difficulty VARCHAR(30) NOT NULL, duration INTEGER NOT NULL DEFAULT 30, description TEXT NOT NULL,
  skills TEXT NOT NULL DEFAULT '', questions TEXT NOT NULL DEFAULT '[]'  -- JSON incl. answers; never sent to clients
);
CREATE INDEX ix_challenges_category ON challenges(category);
CREATE TABLE assessment_attempts (
  id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id), challenge_id BIGINT NOT NULL REFERENCES challenges(id),
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100), correct INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL DEFAULT 0,
  answers TEXT NOT NULL DEFAULT '[]', seconds INTEGER NOT NULL DEFAULT 0, status VARCHAR(30) NOT NULL DEFAULT 'graded',
  source VARCHAR(10) NOT NULL DEFAULT 'live', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_attempts_user ON assessment_attempts(user_id);
CREATE TABLE portfolios (
  id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id), title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL, technologies TEXT NOT NULL DEFAULT '', repository_url VARCHAR(500) NOT NULL DEFAULT '',
  verified BOOLEAN NOT NULL DEFAULT FALSE, source VARCHAR(10) NOT NULL DEFAULT 'live', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE credentials (
  id BIGSERIAL PRIMARY KEY, credential_id VARCHAR(80) NOT NULL UNIQUE, user_id BIGINT REFERENCES users(id),
  recipient VARCHAR(120) NOT NULL, skill VARCHAR(120) NOT NULL, level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  issuer VARCHAR(180) NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'valid', source VARCHAR(10) NOT NULL DEFAULT 'live',
  issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE shortlists (
  id BIGSERIAL PRIMARY KEY, employer_id BIGINT NOT NULL REFERENCES users(id), candidate_id BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT uq_shortlist_pair UNIQUE (employer_id, candidate_id)
);
