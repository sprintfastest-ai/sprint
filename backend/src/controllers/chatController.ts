import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import pool from '@/db/pool';
import { chatWithCoach } from '@/services/ai';
import { isPremium } from '@/db/queries/subscriptions';

const FREE_DAILY_CHAT_LIMIT = 15;

async function resolveAthleteId(userId: string): Promise<string | null> {
  const { rows } = await pool.query(
    'SELECT id FROM athlete_profiles WHERE user_id = $1 LIMIT 1',
    [userId],
  );
  return (rows[0] as { id: string } | undefined)?.id ?? null;
}

interface AthleteProfile {
  age_group: string | null;
  primary_event: string | null;
  weakness_type: string | null;
}

interface PersonalBest {
  distance_metres: number;
  time_seconds: number;
}

async function buildAthleteContext(athleteId: string | undefined): Promise<string> {
  if (!athleteId) return '';
  const [profileRes, pbRes] = await Promise.all([
    pool.query<AthleteProfile>(
      'SELECT age_group, primary_event, weakness_type FROM athlete_profiles WHERE id = $1 LIMIT 1',
      [athleteId],
    ),
    pool.query<PersonalBest>(
      'SELECT distance_metres, time_seconds FROM personal_bests WHERE athlete_id = $1 AND is_current_pb = TRUE ORDER BY distance_metres ASC',
      [athleteId],
    ),
  ]);

  const profile = profileRes.rows[0];
  if (!profile) return '';

  const parts: string[] = [];
  if (profile.age_group) parts.push(`Age group: ${profile.age_group}`);
  if (profile.primary_event) parts.push(`Primary event: ${profile.primary_event}`);
  if (profile.weakness_type) parts.push(`Current weakness: ${profile.weakness_type.replace(/_/g, ' ')}`);

  if (pbRes.rows.length) {
    const pbStr = pbRes.rows
      .map((pb) => `${pb.distance_metres}m in ${pb.time_seconds}s`)
      .join(', ');
    parts.push(`Personal bests: ${pbStr}`);
  }

  return parts.length ? `\n\nAthlete profile: ${parts.join(', ')}.` : '';
}

export async function sendMessage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    const athleteId = req.user?.athleteId ?? (await resolveAthleteId(userId));
    if (!athleteId) throw new AppError('Athlete profile not found', ERROR_CODES.NOT_FOUND, 404);

    if (!(await isPremium(userId))) {
      const { rows: countRows } = await pool.query<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM chat_messages
         WHERE athlete_id = $1 AND role = 'user' AND created_at >= CURRENT_DATE`,
        [athleteId],
      );
      if ((countRows[0]?.count ?? 0) >= FREE_DAILY_CHAT_LIMIT) {
        throw new AppError(
          `You've reached today's free chat limit (${FREE_DAILY_CHAT_LIMIT} messages). Upgrade to Premium for unlimited AI coaching.`,
          ERROR_CODES.PREMIUM_REQUIRED,
          402,
        );
      }
    }

    const { content } = req.body as { content: string };

    const { rows: history } = await pool.query(
      `SELECT role, content FROM chat_messages
       WHERE athlete_id = $1
       ORDER BY created_at DESC LIMIT 10`,
      [athleteId],
    );

    const geminiHistory = history
      .reverse()
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: m.content }] as [{ text: string }],
      }));

    await pool.query(
      `INSERT INTO chat_messages (athlete_id, role, content) VALUES ($1, 'user', $2)`,
      [athleteId, content],
    );

    const athleteContext = await buildAthleteContext(athleteId);
    const reply = await chatWithCoach(userId, content, geminiHistory, athleteContext);

    const { rows } = await pool.query(
      `INSERT INTO chat_messages (athlete_id, role, content) VALUES ($1, 'assistant', $2)
       RETURNING id, role, content, created_at AS timestamp`,
      [athleteId, reply],
    );

    sendSuccess(res, rows[0], 201);
  } catch (err) {
    next(err);
  }
}

export async function getChatHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    const athleteId = req.user?.athleteId ?? (await resolveAthleteId(userId));
    if (!athleteId) {
      sendSuccess(res, []);
      return;
    }

    const { rows } = await pool.query(
      `SELECT id, role, content, created_at AS timestamp
       FROM chat_messages
       WHERE athlete_id = $1
       ORDER BY created_at ASC`,
      [athleteId],
    );
    sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
}
