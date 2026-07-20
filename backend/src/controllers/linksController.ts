import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import { findValidInvite, markInviteRedeemed } from '@/db/queries/links';
import { findParentProfileByUserId, createParentProfile } from '@/db/queries/parents';
import { findCoachProfileByUserId } from '@/db/queries/coaches';
import pool from '@/db/pool';

export async function redeemInvite(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);
    if (role !== 'parent' && role !== 'coach') {
      throw new AppError('Only parent or coach accounts can redeem an invite', ERROR_CODES.FORBIDDEN, 403);
    }

    const { code } = req.body as { code: string };
    const invite = await findValidInvite(code.toUpperCase().trim(), role);
    if (!invite) {
      throw new AppError('This code is invalid or has expired.', ERROR_CODES.NOT_FOUND, 404);
    }

    if (role === 'parent') {
      let parentProfile = await findParentProfileByUserId(userId);
      if (!parentProfile) parentProfile = await createParentProfile(userId);

      await pool.query(
        `INSERT INTO parent_athlete_links (parent_id, athlete_id, status, link_code, linked_at)
         VALUES ($1, $2, 'active', $3, NOW())
         ON CONFLICT (parent_id, athlete_id)
         DO UPDATE SET status = 'active', linked_at = NOW()`,
        [parentProfile.id, invite.athlete_id, invite.code],
      );
    } else {
      const coachProfile = await findCoachProfileByUserId(userId);
      if (!coachProfile) throw new AppError('Coach profile not found', ERROR_CODES.NOT_FOUND, 404);

      await pool.query(
        `INSERT INTO coach_athlete_links (coach_id, athlete_id, status, invite_code, linked_at)
         VALUES ($1, $2, 'active', $3, NOW())
         ON CONFLICT (coach_id, athlete_id)
         DO UPDATE SET status = 'active', linked_at = NOW()`,
        [coachProfile.id, invite.athlete_id, invite.code],
      );
    }

    await markInviteRedeemed(invite.id, userId);

    sendSuccess(res, { linked: true }, 201);
  } catch (err) {
    next(err);
  }
}
