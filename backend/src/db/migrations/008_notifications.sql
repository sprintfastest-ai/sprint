-- Real notification history, backing the bell icon's list (previously it
-- just navigated to Profile — no actual notification data existed
-- anywhere, push.service.ts's notifyUser/notifyUsers were pure
-- fire-and-forget to Expo's push API with nothing persisted).
--
-- One row per notification per recipient, written alongside every push
-- send in push.service.ts so the in-app list stays in sync with what
-- push notifications are actually triggered (badge unlocks, coach notes,
-- session reminders) without duplicating logic at each call site. Written
-- regardless of whether the user has a registered push token, so the
-- in-app list is complete even for someone who denied push permission.
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title      VARCHAR     NOT NULL,
  body       VARCHAR     NOT NULL,
  type       VARCHAR     NOT NULL,
  data       JSONB       NOT NULL DEFAULT '{}',
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread   ON notifications (user_id) WHERE is_read = FALSE;
