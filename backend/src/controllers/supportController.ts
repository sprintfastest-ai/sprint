import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import { sendSupportRequest } from '@/services/email';

export async function contactSupport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const email = req.user?.email;
    const role = req.user?.role;
    if (!email || !role) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    const { subject, message } = req.body as { subject: string; message: string };
    await sendSupportRequest(email, role, subject, message);

    sendSuccess(res, { sent: true }, 201);
  } catch (err) {
    next(err);
  }
}
