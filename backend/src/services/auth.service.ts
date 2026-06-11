import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { withTransaction } from '@/db/pool';
import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyUserEmail,
  setResetToken,
  findValidResetToken,
  consumeResetToken,
  deleteAllRefreshTokensForUser,
} from '@/db/queries/users';
import {
  createAthleteProfile,
  findAthleteProfileByUserId,
} from '@/db/queries/athletes';
import { createCoachProfile } from '@/db/queries/coaches';
import { createParentProfile, createParentAthleteLink } from '@/db/queries/parents';
import { upsertSubscription, isPremium } from '@/db/queries/subscriptions';
import {
  generateJWT,
  generateRefreshToken,
  validateStoredRefreshToken,
  revokeRefreshToken,
} from '@/services/token';
import {
  sendVerificationEmail,
  sendPasswordReset,
  sendParentConsentRequest,
} from '@/services/email';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import logger from '@/utils/logger';
import type { RegisterProfileData, JwtPayload, UserRole, SubscriptionPlan } from '@/types';

const BCRYPT_ROUNDS = 12;
const UNDER_13_AGE_GROUP = 'U11';

// ─── Register ─────────────────────────────────────────────────────────────────

export async function register(
  email: string,
  password: string,
  role: UserRole,
  profileData: RegisterProfileData = {},
): Promise<{ accessToken: string; refreshToken: string; user: object }> {
  const normalisedEmail = email.toLowerCase().trim();

  // Duplicate check before opening a transaction
  const existing = await findUserByEmail(normalisedEmail);
  if (existing) {
    // Return a generic error — don't confirm whether an email is registered
    throw new AppError(
      'Registration failed. Please check your details and try again.',
      ERROR_CODES.CONFLICT,
      409,
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const isUnder13Athlete =
    role === 'athlete' && profileData.ageGroup === UNDER_13_AGE_GROUP;

  let createdUser: Awaited<ReturnType<typeof createUser>>;
  let athleteProfileId: string | undefined;

  await withTransaction(async (client) => {
    // 1. Create the user row
    const { rows: userRows } = await client.query(
      `INSERT INTO users (email, password_hash, role, verification_token)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [normalisedEmail, passwordHash, role, verificationToken],
    );
    createdUser = userRows[0];

    // 2. Create role-specific profile
    if (role === 'athlete') {
      const { rows: profileRows } = await client.query(
        `INSERT INTO athlete_profiles
           (user_id, age_group, primary_event, training_days_per_week)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          createdUser.id,
          profileData.ageGroup ?? null,
          profileData.primaryEvent ?? null,
          profileData.trainingDaysPerWeek ?? null,
        ],
      );
      athleteProfileId = profileRows[0].id as string;
    } else if (role === 'coach') {
      await client.query(
        `INSERT INTO coach_profiles (user_id, club_name, bio) VALUES ($1, $2, $3)`,
        [createdUser.id, profileData.clubName ?? null, profileData.bio ?? null],
      );
    } else if (role === 'parent') {
      await client.query(
        `INSERT INTO parent_profiles (user_id) VALUES ($1)`,
        [createdUser.id],
      );
    }

    // 3. Create free subscription
    await client.query(
      `INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, 'free', 'active')`,
      [createdUser.id],
    );
  });

  logger.info('User registered', { userId: createdUser!.id, role, email: normalisedEmail });

  // 4. Send verification email (non-blocking failure — log and continue)
  sendVerificationEmail(normalisedEmail, verificationToken).catch((err: unknown) =>
    logger.error('Failed to send verification email', {
      userId: createdUser!.id,
      error: (err as Error).message,
    }),
  );

  // 5. Under-13 flow: send parent consent request (no link code yet — that's created on demand)
  if (isUnder13Athlete) {
    logger.info('Under-13 athlete registered — parent consent required', {
      userId: createdUser!.id,
    });
  }

  const accessToken = generateJWT({
    userId: createdUser!.id,
    email: normalisedEmail,
    role,
    subscriptionPlan: 'free',
    isVerified: false,
    athleteId: athleteProfileId,
  });
  const refreshToken = await generateRefreshToken(createdUser!.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: createdUser!.id,
      email: normalisedEmail,
      role,
      isVerified: false,
      createdAt: createdUser!.created_at,
    },
  };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string; user: object }> {
  const normalisedEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(normalisedEmail);

  // Constant-time compare even when user not found (prevents timing attacks)
  const passwordToCheck = user?.password_hash ?? '$2a$12$invalidhashpadding000000000000000000000000000000000000';
  const passwordValid = await bcrypt.compare(password, passwordToCheck);

  if (!user || !passwordValid) {
    logger.warn('Failed login attempt', { email: normalisedEmail });
    throw new AppError(
      'Invalid email or password.',
      ERROR_CODES.INVALID_CREDENTIALS,
      401,
    );
  }

  // Under-13 block: athlete must have an active parent link before they can log in
  if (user.role === 'athlete') {
    const athleteProfile = await findAthleteProfileByUserId(user.id);
    if (athleteProfile?.age_group === UNDER_13_AGE_GROUP) {
      const { rows } = await import('@/db/pool').then((m) => m.default).then((pool) =>
        pool.query(
          `SELECT 1 FROM parent_athlete_links
           WHERE athlete_id = $1 AND status = 'active'
           LIMIT 1`,
          [athleteProfile.id],
        ),
      );
      if (rows.length === 0) {
        logger.warn('Under-13 athlete login blocked — no active parent link', {
          userId: user.id,
        });
        throw new AppError(
          'This account requires parent consent before sign-in. Please ask your parent to link their SprintFastest account.',
          ERROR_CODES.PARENT_CONSENT_REQUIRED,
          403,
        );
      }
    }
  }

  // Resolve subscription plan
  const premium = await isPremium(user.id);
  const subscriptionPlan: SubscriptionPlan = premium ? 'premium' : 'free';

  // Resolve athleteId for token
  let athleteId: string | undefined;
  if (user.role === 'athlete') {
    const profile = await findAthleteProfileByUserId(user.id);
    athleteId = profile?.id;
  }

  const accessToken = generateJWT({
    userId: user.id,
    email: normalisedEmail,
    role: user.role,
    subscriptionPlan,
    isVerified: user.is_verified,
    athleteId,
  });
  const refreshToken = await generateRefreshToken(user.id);

  logger.info('User logged in', { userId: user.id, role: user.role });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: normalisedEmail,
      role: user.role,
      isVerified: user.is_verified,
      createdAt: user.created_at,
    },
  };
}

// ─── Refresh token ────────────────────────────────────────────────────────────

export async function refreshToken(
  token: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const userId = await validateStoredRefreshToken(token);
  if (!userId) {
    throw new AppError(
      'Invalid or expired refresh token.',
      ERROR_CODES.INVALID_REFRESH_TOKEN,
      401,
    );
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError('User not found.', ERROR_CODES.UNAUTHORIZED, 401);
  }

  const premium = await isPremium(userId);
  let athleteId: string | undefined;
  if (user.role === 'athlete') {
    const profile = await findAthleteProfileByUserId(userId);
    athleteId = profile?.id;
  }

  // Rotate: revoke old, issue new
  await revokeRefreshToken(token);
  const newRefreshToken = await generateRefreshToken(userId);
  const accessToken = generateJWT({
    userId,
    email: user.email,
    role: user.role,
    subscriptionPlan: premium ? 'premium' : 'free',
    isVerified: user.is_verified,
    athleteId,
  });

  logger.info('Refresh token rotated', { userId });
  return { accessToken, refreshToken: newRefreshToken };
}

// ─── Verify email ─────────────────────────────────────────────────────────────

export async function verifyEmail(token: string): Promise<void> {
  const user = await verifyUserEmail(token);
  if (!user) {
    throw new AppError(
      'Invalid or expired verification link.',
      ERROR_CODES.INVALID_VERIFICATION_TOKEN,
      400,
    );
  }
  logger.info('Email verified', { userId: user.id });
}

// ─── Password reset ───────────────────────────────────────────────────────────

export async function requestPasswordReset(email: string): Promise<void> {
  const normalisedEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(normalisedEmail);

  // Always respond the same way regardless — prevents email enumeration
  if (!user) {
    logger.debug('Password reset requested for unknown email', { email: normalisedEmail });
    return;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await setResetToken(user.id, tokenHash, expiresAt);

  sendPasswordReset(normalisedEmail, rawToken).catch((err: unknown) =>
    logger.error('Failed to send password reset email', {
      userId: user.id,
      error: (err as Error).message,
    }),
  );

  logger.info('Password reset requested', { userId: user.id });
}

export async function resetPassword(
  rawToken: string,
  newPassword: string,
): Promise<void> {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const record = await findValidResetToken(tokenHash);
  if (!record) {
    throw new AppError(
      'Invalid or expired password reset link.',
      ERROR_CODES.INVALID_RESET_TOKEN,
      400,
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await consumeResetToken(record.id, passwordHash, record.user_id);

  // Invalidate all refresh tokens for security
  await deleteAllRefreshTokensForUser(record.user_id);

  logger.info('Password reset complete', { userId: record.user_id });
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(
  refreshTokenValue: string,
  userId: string,
): Promise<void> {
  await revokeRefreshToken(refreshTokenValue);
  logger.info('User logged out', { userId });
}

// ─── Under-13 parent link generation ─────────────────────────────────────────

export async function generateParentLinkCode(
  athleteUserId: string,
  parentEmail: string,
): Promise<string> {
  const athleteProfile = await findAthleteProfileByUserId(athleteUserId);
  if (!athleteProfile) {
    throw new AppError('Athlete profile not found.', ERROR_CODES.NOT_FOUND, 404);
  }

  // 6-char alphanumeric code, uppercased for readability
  const linkCode = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);

  const parentUser = await findUserByEmail(parentEmail.toLowerCase().trim());
  if (!parentUser) {
    // Send email to un-registered parent — they register first, then use code
    await sendParentConsentRequest(parentEmail, athleteUserId, linkCode);
    // We can't create the link row without a parent profile UUID —
    // the link is created once the parent registers and submits the code.
    return linkCode;
  }

  const parentProfile = await import('@/db/queries/parents').then((m) =>
    m.findParentProfileByUserId(parentUser.id),
  );
  if (!parentProfile) {
    throw new AppError('Parent profile not found.', ERROR_CODES.NOT_FOUND, 404);
  }

  await createParentAthleteLink(parentProfile.id, athleteProfile.id, linkCode);

  await sendParentConsentRequest(parentEmail, athleteUserId, linkCode);

  logger.info('Parent link code generated', {
    athleteId: athleteProfile.id,
    parentEmail,
  });

  return linkCode;
}
