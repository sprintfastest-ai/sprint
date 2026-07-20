import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '@/middleware/validate';
import { authenticate } from '@/middleware/auth';
import { redeemInvite } from '@/controllers/linksController';

const router = Router();

router.use(authenticate);

router.post(
  '/redeem',
  body('code').notEmpty().isLength({ min: 6, max: 8 }).withMessage('A valid code is required'),
  validate,
  redeemInvite,
);

export default router;
