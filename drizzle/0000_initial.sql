CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE, password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS memory_facts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, fact_text text NOT NULL, source text NOT NULL CHECK (source IN ('onboarding','chat')), created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS memory_facts_user_idx ON memory_facts(user_id);
CREATE TABLE IF NOT EXISTS chat_messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, role text NOT NULL CHECK (role IN ('user','ai')), content text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS chat_messages_user_idx ON chat_messages(user_id);
CREATE TABLE IF NOT EXISTS mood_scores (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, score integer NOT NULL CHECK (score BETWEEN 1 AND 10), note text, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS mood_scores_user_idx ON mood_scores(user_id);
