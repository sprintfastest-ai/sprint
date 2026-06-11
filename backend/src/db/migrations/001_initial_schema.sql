-- =============================================================================
-- SprintFastest — 001_initial_schema.sql
-- Full production schema. Safe to re-run (idempotent via IF NOT EXISTS).
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at trigger (applied to every table that carries the column)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- USERS & AUTHENTICATION
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email                VARCHAR(320) UNIQUE NOT NULL,
  password_hash        VARCHAR     NOT NULL,
  role                 VARCHAR     NOT NULL CHECK (role IN ('athlete','parent','coach','admin')),
  is_verified          BOOLEAN     NOT NULL DEFAULT FALSE,
  verification_token   VARCHAR,
  reset_token          VARCHAR,
  reset_token_expires  TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at'
  ) THEN
    CREATE TRIGGER trg_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_email        ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role         ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_reset_token  ON users (reset_token) WHERE reset_token IS NOT NULL;

-- ---------------------------------------------------------------------------
-- REFRESH TOKENS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash  VARCHAR     NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id    ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

-- ---------------------------------------------------------------------------
-- ATHLETE PROFILES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS athlete_profiles (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  age_group              VARCHAR     CHECK (age_group IN ('U11','U13','U15','U17','U20')),
  primary_event          VARCHAR,
  training_days_per_week INTEGER     CHECK (training_days_per_week BETWEEN 1 AND 7),
  next_race_date         DATE,
  weakness_type          VARCHAR     CHECK (weakness_type IN ('acceleration','top_speed','speed_endurance')),
  weakness_diagnosed_at  TIMESTAMPTZ,
  streak_count           INTEGER     NOT NULL DEFAULT 0,
  longest_streak         INTEGER     NOT NULL DEFAULT 0,
  last_session_date      DATE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_athlete_profiles_updated_at'
  ) THEN
    CREATE TRIGGER trg_athlete_profiles_updated_at
      BEFORE UPDATE ON athlete_profiles
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_athlete_profiles_user_id    ON athlete_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_age_group  ON athlete_profiles (age_group);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_weakness   ON athlete_profiles (weakness_type);

-- ---------------------------------------------------------------------------
-- PARENT PROFILES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parent_profiles (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parent_profiles_user_id ON parent_profiles (user_id);

-- ---------------------------------------------------------------------------
-- PARENT–ATHLETE LINKS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parent_athlete_links (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id  UUID        NOT NULL REFERENCES parent_profiles (id) ON DELETE CASCADE,
  athlete_id UUID        NOT NULL REFERENCES athlete_profiles (id) ON DELETE CASCADE,
  status     VARCHAR     NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','active','revoked')),
  link_code  VARCHAR     UNIQUE,
  linked_at  TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parent_id, athlete_id)
);

CREATE INDEX IF NOT EXISTS idx_pal_parent_id  ON parent_athlete_links (parent_id);
CREATE INDEX IF NOT EXISTS idx_pal_athlete_id ON parent_athlete_links (athlete_id);
CREATE INDEX IF NOT EXISTS idx_pal_link_code  ON parent_athlete_links (link_code) WHERE link_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pal_status     ON parent_athlete_links (status);

-- ---------------------------------------------------------------------------
-- COACH PROFILES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coach_profiles (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  club_name  VARCHAR,
  bio        TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_coach_profiles_updated_at'
  ) THEN
    CREATE TRIGGER trg_coach_profiles_updated_at
      BEFORE UPDATE ON coach_profiles
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_coach_profiles_user_id ON coach_profiles (user_id);

-- ---------------------------------------------------------------------------
-- COACH–ATHLETE LINKS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coach_athlete_links (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id    UUID        NOT NULL REFERENCES coach_profiles (id) ON DELETE CASCADE,
  athlete_id  UUID        NOT NULL REFERENCES athlete_profiles (id) ON DELETE CASCADE,
  status      VARCHAR     NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','active','removed')),
  invite_code VARCHAR     UNIQUE,
  linked_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coach_id, athlete_id)
);

CREATE INDEX IF NOT EXISTS idx_cal_coach_id    ON coach_athlete_links (coach_id);
CREATE INDEX IF NOT EXISTS idx_cal_athlete_id  ON coach_athlete_links (athlete_id);
CREATE INDEX IF NOT EXISTS idx_cal_invite_code ON coach_athlete_links (invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cal_status      ON coach_athlete_links (status);

-- ---------------------------------------------------------------------------
-- TRAINING PLANS
-- (defined before sessions so sessions can FK → training_plans)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training_plans (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id       UUID        NOT NULL REFERENCES athlete_profiles (id) ON DELETE CASCADE,
  week_start_date  DATE        NOT NULL,
  plan_data        JSONB       NOT NULL DEFAULT '[]',
  is_taper_week    BOOLEAN     NOT NULL DEFAULT FALSE,
  is_coach_override BOOLEAN   NOT NULL DEFAULT FALSE,
  coach_id         UUID        REFERENCES coach_profiles (id) ON DELETE SET NULL,
  ai_model_version VARCHAR,
  generated_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Only one active plan per athlete per week (coach override replaces AI plan)
  UNIQUE (athlete_id, week_start_date, is_coach_override)
);

CREATE INDEX IF NOT EXISTS idx_training_plans_athlete_id      ON training_plans (athlete_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_week            ON training_plans (athlete_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_training_plans_coach_id        ON training_plans (coach_id) WHERE coach_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- SESSIONS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id       UUID        NOT NULL REFERENCES athlete_profiles (id) ON DELETE CASCADE,
  plan_id          UUID        REFERENCES training_plans (id) ON DELETE SET NULL,
  day_number       INTEGER     CHECK (day_number BETWEEN 1 AND 7),
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  drills_completed JSONB       NOT NULL DEFAULT '[]',
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_athlete_id       ON sessions (athlete_id);
CREATE INDEX IF NOT EXISTS idx_sessions_athlete_date     ON sessions (athlete_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_plan_id          ON sessions (plan_id) WHERE plan_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_completed_at     ON sessions (completed_at DESC);

-- ---------------------------------------------------------------------------
-- PERSONAL BESTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS personal_bests (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id     UUID        NOT NULL REFERENCES athlete_profiles (id) ON DELETE CASCADE,
  distance_metres INTEGER    NOT NULL CHECK (distance_metres IN (20,30,60,100,200)),
  time_seconds   DECIMAL(6,2) NOT NULL CHECK (time_seconds > 0),
  is_current_pb  BOOLEAN     NOT NULL DEFAULT TRUE,
  recorded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id     UUID        REFERENCES sessions (id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pbs_athlete_id          ON personal_bests (athlete_id);
CREATE INDEX IF NOT EXISTS idx_pbs_athlete_distance_pb ON personal_bests (athlete_id, distance_metres, is_current_pb);
CREATE INDEX IF NOT EXISTS idx_pbs_current             ON personal_bests (athlete_id, distance_metres)
  WHERE is_current_pb = TRUE;
CREATE INDEX IF NOT EXISTS idx_pbs_session_id          ON personal_bests (session_id) WHERE session_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- DIAGNOSES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnoses (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id            UUID        NOT NULL REFERENCES athlete_profiles (id) ON DELETE CASCADE,
  weakness_type         VARCHAR     NOT NULL CHECK (weakness_type IN ('acceleration','top_speed','speed_endurance')),
  answers               JSONB       NOT NULL DEFAULT '{}',
  drill_prescription    JSONB       NOT NULL DEFAULT '[]',
  previous_diagnosis_id UUID        REFERENCES diagnoses (id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnoses_athlete_id ON diagnoses (athlete_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_created_at ON diagnoses (athlete_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- ACHIEVEMENTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS achievements (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  UUID        NOT NULL REFERENCES athlete_profiles (id) ON DELETE CASCADE,
  badge_type  VARCHAR     NOT NULL,
  metadata    JSONB       NOT NULL DEFAULT '{}',
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (athlete_id, badge_type)
);

CREATE INDEX IF NOT EXISTS idx_achievements_athlete_id ON achievements (athlete_id);

-- ---------------------------------------------------------------------------
-- WEEKLY GOALS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weekly_goals (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id         UUID        NOT NULL REFERENCES athlete_profiles (id) ON DELETE CASCADE,
  week_start_date    DATE        NOT NULL,
  target_sessions    INTEGER     NOT NULL CHECK (target_sessions BETWEEN 1 AND 7),
  completed_sessions INTEGER     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (athlete_id, week_start_date)
);

CREATE INDEX IF NOT EXISTS idx_weekly_goals_athlete_id ON weekly_goals (athlete_id);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_week       ON weekly_goals (athlete_id, week_start_date);

-- ---------------------------------------------------------------------------
-- SUBSCRIPTIONS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  plan                  VARCHAR     NOT NULL DEFAULT 'free' CHECK (plan IN ('free','premium')),
  status                VARCHAR     NOT NULL DEFAULT 'active'
                                    CHECK (status IN ('active','cancelled','expired','trialing')),
  revenue_cat_id        VARCHAR,
  stripe_customer_id    VARCHAR,
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER trg_subscriptions_updated_at
      BEFORE UPDATE ON subscriptions
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id         ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status          ON subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_revenue_cat_id  ON subscriptions (revenue_cat_id) WHERE revenue_cat_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id       ON subscriptions (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- CHAT MESSAGES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID        NOT NULL REFERENCES athlete_profiles (id) ON DELETE CASCADE,
  session_id VARCHAR,          -- logical chat session grouping (not FK to sessions)
  role       VARCHAR     NOT NULL CHECK (role IN ('user','assistant')),
  content    TEXT        NOT NULL,
  audio_url  VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_athlete_id ON chat_messages (athlete_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages (athlete_id, session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages (athlete_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- COACH NOTES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coach_notes (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID        NOT NULL REFERENCES coach_profiles (id) ON DELETE CASCADE,
  athlete_id            UUID        NOT NULL REFERENCES athlete_profiles (id) ON DELETE CASCADE,
  content               TEXT        NOT NULL,
  is_visible_to_athlete BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_coach_notes_updated_at'
  ) THEN
    CREATE TRIGGER trg_coach_notes_updated_at
      BEFORE UPDATE ON coach_notes
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_coach_notes_coach_id   ON coach_notes (coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_notes_athlete_id ON coach_notes (athlete_id);
CREATE INDEX IF NOT EXISTS idx_coach_notes_visible    ON coach_notes (athlete_id, is_visible_to_athlete);

-- ---------------------------------------------------------------------------
-- LEADERBOARD SNAPSHOTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id          UUID        NOT NULL REFERENCES athlete_profiles (id) ON DELETE CASCADE,
  age_group           VARCHAR     NOT NULL,
  week_start_date     DATE        NOT NULL,
  consistency_rank    INTEGER,
  streak_rank         INTEGER,
  pb_improvement_rank INTEGER,
  sessions_this_week  INTEGER     NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (athlete_id, week_start_date)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_age_week    ON leaderboard_snapshots (age_group, week_start_date);
CREATE INDEX IF NOT EXISTS idx_leaderboard_athlete_id  ON leaderboard_snapshots (athlete_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_consistency ON leaderboard_snapshots (age_group, week_start_date, consistency_rank);

-- ---------------------------------------------------------------------------
-- FEATURE ACCESS (premium gating)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feature_access (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  feature    VARCHAR     NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  granted_by VARCHAR     NOT NULL DEFAULT 'subscription',
  UNIQUE (user_id, feature)
);

CREATE INDEX IF NOT EXISTS idx_feature_access_user_id   ON feature_access (user_id);
CREATE INDEX IF NOT EXISTS idx_feature_access_feature   ON feature_access (user_id, feature);
CREATE INDEX IF NOT EXISTS idx_feature_access_expires   ON feature_access (expires_at) WHERE expires_at IS NOT NULL;

-- ---------------------------------------------------------------------------
-- PASSWORD RESET TOKENS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash VARCHAR     NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prt_user_id    ON password_reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_prt_token_hash ON password_reset_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_prt_expires    ON password_reset_tokens (expires_at);

-- =============================================================================
-- DEV SEED  (wrap in a function so it can be called explicitly and skipped
--            in production by simply not calling it)
-- =============================================================================
CREATE OR REPLACE FUNCTION seed_dev_data() RETURNS VOID AS $$
DECLARE
  v_athlete_user_id  UUID;
  v_parent_user_id   UUID;
  v_coach_user_id    UUID;
  v_athlete_prof_id  UUID;
  v_parent_prof_id   UUID;
  v_coach_prof_id    UUID;
  v_plan_id          UUID;
  v_session_id       UUID;
BEGIN
  -- Guard: skip if dev data already exists
  IF EXISTS (SELECT 1 FROM users WHERE email = 'athlete@dev.sprintfastest.com') THEN
    RAISE NOTICE 'Dev seed already applied — skipping.';
    RETURN;
  END IF;

  -- Users (password = "Password1!" bcrypt-hashed at cost 12)
  INSERT INTO users (email, password_hash, role, is_verified)
    VALUES ('athlete@dev.sprintfastest.com',
            '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewvmDqZFwPgN8GKi',
            'athlete', TRUE)
    RETURNING id INTO v_athlete_user_id;

  INSERT INTO users (email, password_hash, role, is_verified)
    VALUES ('parent@dev.sprintfastest.com',
            '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewvmDqZFwPgN8GKi',
            'parent', TRUE)
    RETURNING id INTO v_parent_user_id;

  INSERT INTO users (email, password_hash, role, is_verified)
    VALUES ('coach@dev.sprintfastest.com',
            '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewvmDqZFwPgN8GKi',
            'coach', TRUE)
    RETURNING id INTO v_coach_user_id;

  -- Athlete profile
  INSERT INTO athlete_profiles (
    user_id, age_group, primary_event, training_days_per_week,
    weakness_type, weakness_diagnosed_at, streak_count, longest_streak
  )
    VALUES (v_athlete_user_id, 'U17', '100m', 4,
            'acceleration', NOW() - INTERVAL '7 days', 3, 5)
    RETURNING id INTO v_athlete_prof_id;

  -- Parent profile + link
  INSERT INTO parent_profiles (user_id)
    VALUES (v_parent_user_id)
    RETURNING id INTO v_parent_prof_id;

  INSERT INTO parent_athlete_links (parent_id, athlete_id, status, linked_at)
    VALUES (v_parent_prof_id, v_athlete_prof_id, 'active', NOW());

  -- Coach profile + link
  INSERT INTO coach_profiles (user_id, club_name, bio)
    VALUES (v_coach_user_id, 'SprintFastest Dev Club',
            'Dev coach for local testing.')
    RETURNING id INTO v_coach_prof_id;

  INSERT INTO coach_athlete_links (coach_id, athlete_id, status, linked_at)
    VALUES (v_coach_prof_id, v_athlete_prof_id, 'active', NOW());

  -- Subscription (premium)
  INSERT INTO subscriptions (user_id, plan, status,
    current_period_start, current_period_end)
    VALUES (v_athlete_user_id, 'premium', 'active',
            NOW(), NOW() + INTERVAL '30 days');

  -- Training plan (current week)
  INSERT INTO training_plans (
    athlete_id, week_start_date, plan_data,
    is_taper_week, is_coach_override, ai_model_version, generated_at
  )
    VALUES (
      v_athlete_prof_id,
      DATE_TRUNC('week', NOW())::DATE,
      '[
        {"dayNumber":1,"sessionType":"acceleration","drills":[
          {"name":"Wall drives","sets":3,"reps":8,"distance":0,"restSeconds":90,"cue":"Drive the knee high"},
          {"name":"A-skips","sets":3,"reps":20,"distance":0,"restSeconds":60,"cue":"Punch the ground"}
        ],"coachingCues":["Stay tall","Relax the jaw"]},
        {"dayNumber":3,"sessionType":"top speed","drills":[
          {"name":"Flying 30m","sets":4,"reps":1,"distance":30,"restSeconds":300,"cue":"Reach maximum velocity before the timing gate"}
        ],"coachingCues":["Lean back slightly","High hips"]},
        {"dayNumber":5,"sessionType":"speed endurance","drills":[
          {"name":"300m run","sets":2,"reps":1,"distance":300,"restSeconds":600,"cue":"Maintain form through the bend"}
        ],"coachingCues":["Breathe rhythmically","Pump the arms"]}
      ]'::JSONB,
      FALSE, FALSE, 'gemini-1.5-flash', NOW()
    )
    RETURNING id INTO v_plan_id;

  -- Completed session
  INSERT INTO sessions (
    athlete_id, plan_id, day_number, completed_at,
    drills_completed, notes
  )
    VALUES (
      v_athlete_prof_id, v_plan_id, 1,
      NOW() - INTERVAL '1 day',
      '[{"name":"Wall drives","setsCompleted":3,"repsCompleted":8},{"name":"A-skips","setsCompleted":3,"repsCompleted":20}]'::JSONB,
      'Felt strong on the wall drives today.'
    )
    RETURNING id INTO v_session_id;

  -- Personal bests
  INSERT INTO personal_bests (athlete_id, distance_metres, time_seconds, is_current_pb, session_id)
    VALUES
      (v_athlete_prof_id, 20,  2.81, TRUE, v_session_id),
      (v_athlete_prof_id, 60,  7.42, TRUE, v_session_id),
      (v_athlete_prof_id, 100, 11.30, TRUE, NULL),
      (v_athlete_prof_id, 200, 23.80, TRUE, NULL);

  -- Diagnosis
  INSERT INTO diagnoses (athlete_id, weakness_type, answers, drill_prescription)
    VALUES (
      v_athlete_prof_id,
      'acceleration',
      '{"timeTrial20m":2.95,"timeTrial60m":7.55,"timeTrial200m":24.10}'::JSONB,
      '[{"name":"Sled push 20m","sets":4,"reps":1,"distance":20,"restSeconds":180,"cue":"45-degree lean, drive the arms"}]'::JSONB
    );

  -- Achievement
  INSERT INTO achievements (athlete_id, badge_type, metadata)
    VALUES (v_athlete_prof_id, 'first_session',
            '{"label":"First Session","description":"Completed your first training session"}'::JSONB);

  -- Weekly goal
  INSERT INTO weekly_goals (athlete_id, week_start_date, target_sessions, completed_sessions)
    VALUES (v_athlete_prof_id, DATE_TRUNC('week', NOW())::DATE, 3, 1);

  -- Coach note
  INSERT INTO coach_notes (coach_id, athlete_id, content, is_visible_to_athlete)
    VALUES (v_coach_prof_id, v_athlete_prof_id,
            'Great acceleration session. Focus on the arm drive next week.',
            TRUE);

  -- Leaderboard snapshot
  INSERT INTO leaderboard_snapshots (
    athlete_id, age_group, week_start_date,
    consistency_rank, streak_rank, pb_improvement_rank, sessions_this_week
  )
    VALUES (v_athlete_prof_id, 'U17', DATE_TRUNC('week', NOW())::DATE, 1, 1, 1, 1);

  -- Feature access (all features for dev athlete)
  INSERT INTO feature_access (user_id, feature, granted_by)
    SELECT v_athlete_user_id, f, 'seed'
    FROM UNNEST(ARRAY[
      'training_plan','diagnosis','chat_coach','audio_coaching',
      'leaderboard','parent_dashboard','coach_dashboard',
      'race_taper','re_diagnosis'
    ]) AS f;

  RAISE NOTICE 'Dev seed applied successfully.';
END;
$$ LANGUAGE plpgsql;

-- To seed dev data run: SELECT seed_dev_data();

COMMIT;
