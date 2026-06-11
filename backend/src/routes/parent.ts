import { Router } from 'express';
import { param } from 'express-validator';
import { validate } from '@/middleware/validate';
import { authenticate } from '@/middleware/auth';
import { requireRole } from '@/middleware/roleCheck';
import { getLinkedAthletes, getAthleteProgress } from '@/controllers/parentController';

const router = Router();

router.use(authenticate, requireRole('parent', 'admin'));

router.get('/athletes', getLinkedAthletes);

router.get(
  '/athletes/:athleteId/progress',
  param('athleteId').isUUID().withMessage('Invalid athleteId'),
  validate,
  getAthleteProgress,
);

export default router;
