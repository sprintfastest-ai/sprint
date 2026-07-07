import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import pool from '@/db/pool';
import { chatWithCoach } from '@/services/ai';

async function resolveAthleteId(userId: string): Promise<string | null> {
  const { rows } = await pool.query(
    'SELECT id FROM athlete_profiles WHERE user_id = $1 LIMIT 1',
    [userId],
  );
  return (rows[0] as { id: string } | undefined)?.id ?? null;
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

    const reply = await chatWithCoach(userId, content, geminiHistory);

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
