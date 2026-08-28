import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '@/middleware/validate';
import { authenticate } from '@/middleware/auth';
import { contactSupport } from '@/controllers/supportController';

const router = Router();

router.use(authenticate);

router.post(
  '/contact',
  body('subject').isString().trim().isLength({ min: 1, max: 120 }).withMessage('Subject is required'),
  body('message').isString().trim().isLength({ min: 1, max: 5000 }).withMessage('Message is required'),
  validate,
  contactSupport,
);

export default router;
