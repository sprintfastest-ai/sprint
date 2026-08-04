import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '@/middleware/validate';
import { authenticate } from '@/middleware/auth';
import { registerToken, unregisterToken } from '@/controllers/notificationsController';

const router = Router();

router.use(authenticate);

const tokenField = body('token')
  .isString()
  .trim()
  .isLength({ min: 10 })
  .withMessage('A valid push token is required');

router.post(
  '/register-token',
  tokenField,
  body('platform').isIn(['ios', 'android']).withMessage('platform must be ios or android'),
  validate,
  registerToken,
);

router.delete(
  '/register-token',
  tokenField,
  validate,
  unregisterToken,
);

export default router;
