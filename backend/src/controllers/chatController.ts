import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import pool from '@/db/pool';
import { chatWithCoach } from '@/services/ai';

export async function sendMessage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.sub;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    const { content } = req.body as { content: string };

    // Fetch last 10 messages for context
    const { rows: history } = await pool.query(
      `SELECT role, content FROM chat_messages
       WHERE user_id = $1
       ORDER BY timestamp DESC LIMIT 10`,
      [userId],
    );

    const geminiHistory = history
      .reverse()
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: m.content }],
      }));

    // Store user message
    await pool.query(
      `INSERT INTO chat_messages (user_id, role, content) VALUES ($1, 'user', $2)`,
      [userId, content],
    );

    const reply = await chatWithCoach(userId, content, geminiHistory);

    // Store assistant reply
    const { rows } = await pool.query(
      `INSERT INTO chat_messages (user_id, role, content) VALUES ($1, 'assistant', $2) RETURNING *`,
      [userId, reply],
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
    const userId = req.user?.sub;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    const { rows } = await pool.query(
      `SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY timestamp ASC`,
      [userId],
    );
    sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
}
