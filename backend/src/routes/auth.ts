import { Router } from 'express';
import { validate } from '@/middleware/validate';
import { authenticate } from '@/middleware/auth';
import { authLimiter } from '@/middleware/rateLimiter';
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateVerifyEmail,
  validateRequestReset,
  validateResetPassword,
  validateLogout,
} from '@/middleware/validate';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  verifyEmailHandler,
  requestResetHandler,
  resetPasswordHandler,
  logoutHandler,
  meHandler,
} from '@/controllers/auth.controller';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', authLimiter, validateRegister, validate, registerHandler);

// POST /api/v1/auth/login
router.post('/login', authLimiter, validateLogin, validate, loginHandler);

// POST /api/v1/auth/refresh
router.post('/refresh', authLimiter, validateRefreshToken, validate, refreshHandler);

// POST /api/v1/auth/verify-email
router.post('/verify-email', validateVerifyEmail, validate, verifyEmailHandler);

// POST /api/v1/auth/request-reset
router.post('/request-reset', authLimiter, validateRequestReset, validate, requestResetHandler);

// POST /api/v1/auth/reset-password
router.post('/reset-password', validateResetPassword, validate, resetPasswordHandler);

// DELETE /api/v1/auth/logout
router.delete('/logout', validateLogout, validate, logoutHandler);

// GET /api/v1/auth/me  (protected)
router.get('/me', authenticate, meHandler);

export default router;
