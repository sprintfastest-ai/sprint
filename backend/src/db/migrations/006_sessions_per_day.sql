-- Captures whether an athlete sometimes trains twice in one day, as a
-- separate dimension from training_days_per_week (how many days a week).
-- These are genuinely different things — an athlete training 5 days/week
-- with occasional double sessions isn't representable by widening the
-- existing 1-7 day-count column, so this is its own field rather than a
-- sentinel value stuffed into that one.
--
-- Note: the weekly training plan generator (backend/src/services/ai.ts)
-- does not yet use this to actually schedule double-session days — it's
-- captured for profile completeness (and future use) only, for now.
ALTER TABLE athlete_profiles
  ADD COLUMN IF NOT EXISTS sessions_per_day INTEGER NOT NULL DEFAULT 1
    CHECK (sessions_per_day IN (1, 2));
