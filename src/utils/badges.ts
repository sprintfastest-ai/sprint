/**
 * Display metadata for badge types. Must stay in sync with
 * backend/src/db/queries/athletes.ts BADGE_DEFINITIONS (badgeType keys).
 */
export interface BadgeInfo {
  type: string;
  label: string;
  description: string;
  icon: string;
}

export const BADGE_CATALOGUE: BadgeInfo[] = [
  { type: 'first_session',     label: 'First Steps',     description: 'Complete your first training session',    icon: 'footsteps' },
  { type: 'streak_3',          label: 'On a Roll',        description: '3-day training streak',                   icon: 'flame' },
  { type: 'streak_7',          label: 'Week Warrior',     description: '7-day training streak',                   icon: 'flame' },
  { type: 'streak_14',         label: 'Unstoppable',      description: '14-day training streak',                  icon: 'flame' },
  { type: 'streak_30',         label: 'Iron Will',        description: '30-day training streak',                  icon: 'flame' },
  { type: 'sessions_10',       label: 'Committed',        description: 'Complete 10 training sessions',           icon: 'barbell' },
  { type: 'sessions_25',       label: 'Dedicated',        description: 'Complete 25 training sessions',           icon: 'barbell' },
  { type: 'sessions_50',       label: 'Veteran',          description: 'Complete 50 training sessions',           icon: 'barbell' },
  { type: 'sessions_100',      label: 'Centurion',        description: 'Complete 100 training sessions',          icon: 'medal' },
  { type: 'first_pb',          label: 'Personal Best',    description: 'Log your first personal best',            icon: 'trophy' },
  { type: 'pb_collector_3',    label: 'PB Collector',     description: 'Log personal bests across 3 distances',   icon: 'trophy' },
  { type: 'pb_collector_5',    label: 'Speed Demon',      description: 'Log personal bests across 5 distances',   icon: 'trophy' },
  { type: 'longest_streak_21', label: 'Consistency King', description: 'Reach a 21-day best streak',              icon: 'ribbon' },
];

export function getBadgeInfo(type: string): BadgeInfo {
  return (
    BADGE_CATALOGUE.find((b) => b.type === type) ?? {
      type,
      label: type,
      description: '',
      icon: 'ribbon',
    }
  );
}
