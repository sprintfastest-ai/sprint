-- Device push tokens for Expo push notifications. One row per installed
-- device/app instance; `token` is globally unique because Expo issues one
-- push token per (device, app) pair — re-registering under a new user
-- (e.g. logout/login on a shared device) simply reassigns it.

CREATE TABLE IF NOT EXISTS push_tokens (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token        VARCHAR     NOT NULL UNIQUE,
  platform     VARCHAR     NOT NULL CHECK (platform IN ('ios','android')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens (user_id);
