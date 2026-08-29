import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '@/middleware/validate';
import { authenticate } from '@/middleware/auth';
import {
  registerToken,
  unregisterToken,
  listNotifications,
  markRead,
  markAllRead,
} from '@/controllers/notificationsController';

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

router.get(
  '/',
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  validate,
  listNotifications,
);

router.patch(
  '/read-all',
  markAllRead,
);

router.patch(
  '/:notificationId/read',
  param('notificationId').isUUID().withMessage('Invalid notificationId'),
  validate,
  markRead,
);

export default router;
