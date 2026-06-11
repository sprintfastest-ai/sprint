import dotenv from 'dotenv';
dotenv.config();

import pool from './pool';
import logger from '@/utils/logger';

const MIGRATIONS = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL CHECK (role IN ('athlete','parent','coach','admin')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS athlete_profiles (
    user_id                UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    age_group              TEXT NOT NULL,
    events                 TEXT[] NOT NULL DEFAULT '{}',
    training_days_per_week INT NOT NULL DEFAULT 3,
    next_race_date         DATE,
    weakness_type          TEXT CHECK (weakness_type IN ('acceleration','top_speed','speed_endurance'))
  );

  CREATE TABLE IF NOT EXISTS parent_profiles (
    user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    linked_athlete_ids  UUID[] NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS coach_profiles (
    user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    club_name           TEXT NOT NULL DEFAULT '',
    linked_athlete_ids  UUID[] NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS training_plans (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start_date   DATE NOT NULL,
    days              JSONB NOT NULL DEFAULT '[]',
    is_coach_override BOOLEAN NOT NULL DEFAULT FALSE,
    coach_id          UUID REFERENCES users(id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id        UUID NOT NULL REFERENCES training_plans(id),
    times_recorded JSONB NOT NULL DEFAULT '[]',
    completed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS personal_bests (
    athlete_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    distance     INT NOT NULL,
    time_seconds NUMERIC(8,3) NOT NULL,
    recorded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (athlete_id, distance)
  );

  CREATE TABLE IF NOT EXISTS diagnoses (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weakness_type         TEXT NOT NULL,
    drill_prescription    JSONB NOT NULL DEFAULT '[]',
    diagnosed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    previous_diagnosis_id UUID REFERENCES diagnoses(id)
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_type  TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (athlete_id, badge_type)
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    plan       TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','premium')),
    status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','expired')),
    expires_at TIMESTAMPTZ
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       TEXT NOT NULL CHECK (role IN ('user','assistant')),
    content    TEXT NOT NULL,
    timestamp  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS coach_notes (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    athlete_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content               TEXT NOT NULL,
    is_visible_to_athlete BOOLEAN NOT NULL DEFAULT FALSE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

async function migrate(): Promise<void> {
  logger.info('Running migrations…');
  await pool.query(MIGRATIONS);
  logger.info('Migrations complete');
  await pool.end();
}

migrate().catch((err) => {
  logger.error('Migration failed', { error: (err as Error).message });
  process.exit(1);
});
