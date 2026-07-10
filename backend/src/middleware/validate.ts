import type { Request, Response, NextFunction } from 'express';
import { validationResult, body, type ValidationChain } from 'express-validator';
import { sendError } from '@/utils/response';
import { ERROR_CODES, AGE_GROUPS } from '@/utils/constants';

// ─── Middleware runner ────────────────────────────────────────────────────────

export function validate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg as string)
      .join('; ');
    sendError(res, message, ERROR_CODES.VALIDATION_ERROR, 422);
    return;
  }
  next();
}

// ─── Reusable field validators ────────────────────────────────────────────────

const emailField = () =>
  body('email')
    .isEmail()
    .withMessage('A valid email address is required.')
    .normalizeEmail();

const passwordField = (fieldName = 'password') =>
  body(fieldName)
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number.');

const roleField = () =>
  body('role')
    .isIn(['athlete', 'parent', 'coach', 'admin'])
    .withMessage('Role must be one of: athlete, parent, coach, admin.');

// ─── Auth schemas ─────────────────────────────────────────────────────────────

export const validateRegister: ValidationChain[] = [
  emailField(),
  passwordField(),
  roleField(),
  body('profileData.ageGroup')
    .optional()
    .isIn([...AGE_GROUPS])
    .withMessage(`Age group must be one of: ${AGE_GROUPS.join(', ')}.`),
  body('profileData.trainingDaysPerWeek')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Training days per week must be between 1 and 7.'),
  body('profileData.primaryEvent')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Primary event must be 50 characters or fewer.'),
  body('profileData.clubName')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Club name must be 100 characters or fewer.'),
];

export const validateLogin: ValidationChain[] = [
  body('email').notEmpty().withMessage('Email is required.').isString(),
  body('password').notEmpty().withMessage('Password is required.'),
];

export const validateRefreshToken: ValidationChain[] = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required.'),
];

export const validateVerifyEmail: ValidationChain[] = [
  body('token')
    .notEmpty()
    .isLength({ min: 32 })
    .withMessage('A valid verification token is required.'),
];

export const validateRequestReset: ValidationChain[] = [
  emailField(),
];

export const validateResetPassword: ValidationChain[] = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required.'),
  passwordField('newPassword'),
];

export const validateLogout: ValidationChain[] = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required.'),
];
