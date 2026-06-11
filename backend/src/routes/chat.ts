import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '@/middleware/validate';
import { authenticate } from '@/middleware/auth';
import { sendMessage, getChatHistory } from '@/controllers/chatController';

const router = Router();

router.use(authenticate);

router.post(
  '/message',
  body('content')
    .notEmpty()
    .withMessage('content required')
    .isLength({ max: 2000 })
    .withMessage('Message too long'),
  validate,
  sendMessage,
);

router.get('/history', getChatHistory);

export default router;
