import cron from 'node-cron';
import pool from '@/db/pool';
import { generateWeeklyPlan } from './ai';
import { sendWeeklySummary } from './email';
import { notifyUsers } from './push.service';
import { insertPlan } from '@/db/queries/training';
import logger from '@/utils/logger';

function getNextMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0] as string;
}

/** Monday-start ISO date (YYYY-MM-DD) of the week containing today. */
function currentWeekStartDate(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0] as string;
}

/** ISO weekday: 1 = Monday … 7 = Sunday — matches training_plans.plan_data dayNumber. */
function todayISODow(): number {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

// Every Sunday at 20:00 — generate next week's plans for all athletes
export function scheduleWeeklyPlanGeneration(): void {
  cron.schedule('0 20 * * 0', async () => {
    logger.info('Cron: generating weekly plans');
    const weekStartDate = getNextMonday();

    try {
      const { rows: athletes } = await pool.query<{
        user_id: string;
        age_group: string;
        weakness_type: string | null;
        training_days_per_week: number;
      }>(
        `SELECT user_id, age_group, weakness_type, training_days_per_week
         FROM athlete_profiles`,
      );

      await Promise.allSettled(
        athletes.map(async (a) => {
          try {
            const plan = await generateWeeklyPlan(
              a.user_id,
              a.age_group,
              a.weakness_type as 'acceleration' | 'top_speed' | 'speed_endurance' | null,
              a.training_days_per_week,
              weekStartDate,
            );
            await insertPlan(plan);
            logger.debug('Weekly plan generated', { athleteId: a.user_id });
          } catch (err) {
            logger.error('Failed to generate plan', {
              athleteId: a.user_id,
              error: (err as Error).message,
            });
          }
        }),
      );

      logger.info('Cron: weekly plan generation complete', {
        count: athletes.length,
      });
    } catch (err) {
      logger.error('Cron weekly plan error', { error: (err as Error).message });
    }
  });
}

// Every Sunday at 18:00 — send weekly summaries to parents
export function scheduleWeeklySummaryEmails(): void {
  cron.schedule('0 18 * * 0', async () => {
    logger.info('Cron: sending weekly summary emails');

    try {
      const { rows } = await pool.query<{
        parent_email: string;
        athlete_name: string;
        sessions_count: number;
        week_start: string;
      }>(
        `SELECT
           u_parent.email           AS parent_email,
           u_athlete.email          AS athlete_name,
           COUNT(s.id)::int         AS sessions_count,
           DATE_TRUNC('week', NOW() - INTERVAL '1 week')::DATE::TEXT AS week_start
         FROM parent_profiles pp
         JOIN LATERAL UNNEST(pp.linked_athlete_ids) AS lid(athlete_id) ON TRUE
         JOIN users u_parent  ON u_parent.id  = pp.user_id
         JOIN users u_athlete ON u_athlete.id = lid.athlete_id
         LEFT JOIN sessions s ON s.athlete_id = lid.athlete_id
           AND s.completed_at >= DATE_TRUNC('week', NOW() - INTERVAL '1 week')
           AND s.completed_at <  DATE_TRUNC('week', NOW())
         GROUP BY u_parent.email, u_athlete.email`,
      );

      await Promise.allSettled(
        rows.map((row) =>
          sendWeeklySummary(
            row.parent_email,
            row.athlete_name,
            row.sessions_count,
            row.week_start,
          ),
        ),
      );

      logger.info('Cron: weekly summaries sent', { count: rows.length });
    } catch (err) {
      logger.error('Cron summary email error', { error: (err as Error).message });
    }
  });
}

// Every day at 17:00 — remind athletes with an incomplete session scheduled for today
export function scheduleSessionReminders(): void {
  cron.schedule('0 17 * * *', async () => {
    logger.info('Cron: sending session reminders');

    try {
      const weekStartDate = currentWeekStartDate();
      const dayNumber = todayISODow();

      const { rows } = await pool.query<{ user_id: string }>(
        `SELECT DISTINCT ap.user_id
         FROM training_plans tp
         JOIN athlete_profiles ap ON ap.id = tp.athlete_id
         WHERE tp.week_start_date = $1
           AND EXISTS (
             SELECT 1 FROM jsonb_array_elements(tp.plan_data) AS day
             WHERE (day->>'dayNumber')::int = $2
           )
           AND NOT EXISTS (
             SELECT 1 FROM sessions s
             WHERE s.athlete_id = tp.athlete_id
               AND s.day_number = $2
               AND s.completed_at >= $1::date
           )`,
        [weekStartDate, dayNumber],
      );

      await notifyUsers(
        rows.map((r) => r.user_id),
        {
          title: "Today's session is waiting 🏃",
          body: "Don't break your streak — log today's training session.",
          data: { type: 'session_reminder' },
        },
      );

      logger.info('Cron: session reminders sent', { count: rows.length });
    } catch (err) {
      logger.error('Cron session reminder error', { error: (err as Error).message });
    }
  });
}

export function initScheduler(): void {
  scheduleWeeklyPlanGeneration();
  scheduleWeeklySummaryEmails();
  scheduleSessionReminders();
  logger.info('Scheduled tasks initialised');
}
