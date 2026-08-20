-- U11 is removed as an age-group tier; the app now starts at U12
-- (U12, U14, U16, U18, U20). Existing athletes already stored as U11, U13,
-- U15, or U17 are deliberately left as-is — no data migration, per product
-- decision — so the CHECK constraint is widened to the union of old and new
-- values rather than swapped outright.
--
-- Swapping it to the new-only list would have looked cleaner, but a CHECK
-- constraint re-validates the WHOLE row on every UPDATE, not just the
-- column being changed — so any future profile update for an existing
-- U11/U13/U15/U17 athlete (even one that doesn't touch age_group at all)
-- would start failing. Widening avoids that; application-level validation
-- (backend/src/routes/athlete.ts, isIn([...])) already restricts what can
-- newly be written through the API to the new five values only, so old
-- values can never be freshly chosen going forward even though they
-- remain valid for rows that already have them.
ALTER TABLE athlete_profiles DROP CONSTRAINT IF EXISTS athlete_profiles_age_group_check;
ALTER TABLE athlete_profiles ADD CONSTRAINT athlete_profiles_age_group_check
  CHECK (age_group IN ('U11', 'U13', 'U15', 'U17', 'U12', 'U14', 'U16', 'U18', 'U20'));
