-- create the database
CREATE DATABASE fwdp;
-- change to new db
\c fwdp;

-- create the users table
CREATE TABLE users (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       email TEXT NOT NULL,
       password_hash TEXT NOT NULL,
       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
       updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
       CONSTRAINT users_email_unique UNIQUE(email)
);
ALTER TABLE users ADD pending_email TEXT;

-- create an index for great speedup when searching on email
CREATE UNIQUE INDEX users_email_lower_idx ON users (LOWER(email));

-- create the user
CREATE USER fwdp with password 'fwdp';
GRANT ALL ON DATABASE fwdp TO fwdp;
GRANT ALL ON users TO fwdp;

-- create email_verification_tokens
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMPTZ;
CREATE TABLE email_verification_tokens (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     token_hash TEXT NOT NULL UNIQUE,
     expires_at TIMESTAMPTZ NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_email_verification_tokens_user_id
     ON email_verification_tokens(user_id);

-- create the todo list table
CREATE TABLE todos (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     completed BOOLEAN NOT NULL DEFAULT FALSE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_todos_user_id ON todos(user_id);
GRANT ALL ON todos TO fwdp;
