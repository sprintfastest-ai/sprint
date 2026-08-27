-- Expands age groups (adds U10, Senior, and 13 Masters tiers V35...V100+)
-- and sprint-event distances (60/75/80/100/150/200/300/400, replacing the
-- old 20/30/60/100/200 personal-bests distance set) per product decision.
--
-- Same reasoning as 005_age_group_u11_removed.sql: a CHECK constraint
-- re-validates the WHOLE row on every UPDATE, not just the column being
-- changed, so both constraints below are widened (union of old + new
-- values) rather than swapped outright — existing rows keep whatever
-- they already have, and application-level validation
-- (backend/src/routes/athlete.ts, isIn([...])) already restricts what can
-- newly be written through the API to the new sets only.
--
-- Masters is a UI-only grouping step (pick "Masters", then a V-tier) — the
-- literal string "Masters" is never stored, only the specific V-tier
-- (e.g. 'V45'), which is why it doesn't appear in the list below.
ALTER TABLE athlete_profiles DROP CONSTRAINT IF EXISTS athlete_profiles_age_group_check;
ALTER TABLE athlete_profiles ADD CONSTRAINT athlete_profiles_age_group_check
  CHECK (age_group IN (
    'U11', 'U13', 'U15', 'U17',                      -- legacy, pre-005, left as-is
    'U12', 'U14', 'U16', 'U18', 'U20',                -- current
    'U10', 'Senior',                                  -- new
    'V35', 'V40', 'V45', 'V50', 'V55', 'V60', 'V65', 'V70', 'V75', 'V80', 'V85', 'V90', 'V95', 'V100+'
  ));

ALTER TABLE personal_bests DROP CONSTRAINT IF EXISTS personal_bests_distance_metres_check;
ALTER TABLE personal_bests ADD CONSTRAINT personal_bests_distance_metres_check
  CHECK (distance_metres IN (20, 30, 60, 100, 200, 75, 80, 150, 300, 400));
