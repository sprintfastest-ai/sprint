-- Adds onboarding completion tracking to athlete_profiles.
-- Existing athletes are backfilled to TRUE so they aren't forced through
-- onboarding retroactively; only newly registered athletes default to FALSE.

ALTER TABLE athlete_profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE athlete_profiles SET onboarding_completed = TRUE WHERE onboarding_completed = FALSE;

ALTER TABLE athlete_profiles
  ALTER COLUMN onboarding_completed SET DEFAULT FALSE;
