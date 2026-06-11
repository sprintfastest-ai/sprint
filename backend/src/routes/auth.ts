import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '@/middleware/validate';
import { authenticate } from '@/middleware/auth';
import { authLimiter } from '@/middleware/rateLimiter';
import {
  register,
  login,
  refresh,
  logout,
  me,
  forgotPassword,
} from '@/controllers/authController';

const router = Router();

const PASSWORD_RULES = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters');

const EMAIL_RULES = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Valid email required');

router.post(
  '/register',
  authLimiter,
  EMAIL_RULES,
  PASSWORD_RULES,
  body('role')
    .isIn(['athlete', 'parent', 'coach'])
    .withMessage('Role must be athlete, parent, or coach'),
  validate,
  register,
);

router.post(
  '/login',
  authLimiter,
  EMAIL_RULES,
  PASSWORD_RULES,
  validate,
  login,
);

router.post(
  '/refresh',
  authLimiter,
  body('refreshToken').notEmpty().withMessage('refreshToken required'),
  validate,
  refresh,
);

router.post('/logout', logout);

router.get('/me', authenticate, me);

router.post(
  '/forgot-password',
  authLimiter,
  EMAIL_RULES,
  validate,
  forgotPassword,
);

export default router;
