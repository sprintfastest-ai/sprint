-- Standalone invite-code table for parent/coach linking. Doesn't require the
-- invitee to have an account yet, unlike parent_athlete_links/coach_athlete_links
-- (whose parent_id/coach_id are NOT NULL FKs) — the invite just remembers
-- "this code is good for linking to this athlete" until someone redeems it.

CREATE TABLE IF NOT EXISTS link_invites (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(8)  NOT NULL UNIQUE,
  athlete_id  UUID        NOT NULL REFERENCES athlete_profiles (id) ON DELETE CASCADE,
  relationship VARCHAR    NOT NULL CHECK (relationship IN ('parent', 'coach')),
  expires_at  TIMESTAMPTZ NOT NULL,
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID        REFERENCES users (id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_link_invites_code ON link_invites (code);
CREATE INDEX IF NOT EXISTS idx_link_invites_athlete_id ON link_invites (athlete_id);
