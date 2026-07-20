import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '@/middleware/validate';
import { authenticate } from '@/middleware/auth';
import { requireRole } from '@/middleware/roleCheck';
import {
  getLinkedAthletes,
  overridePlan,
  addNote,
  getNotes,
  getMyCoachProfile,
  updateMyCoachProfile,
} from '@/controllers/coachController';

const router = Router();

router.use(authenticate, requireRole('coach', 'admin'));

router.get('/me', getMyCoachProfile);
router.patch(
  '/me',
  body('clubName').optional().isString().trim().isLength({ max: 100 }),
  body('bio').optional().isString().trim().isLength({ max: 500 }),
  validate,
  updateMyCoachProfile,
);

router.get('/:coachId/athletes', param('coachId').isUUID(), validate, getLinkedAthletes);

router.put(
  '/athletes/:athleteId/plans/override',
  param('athleteId').isUUID().withMessage('Invalid athleteId'),
  body('weekStartDate').isDate().withMessage('weekStartDate must be YYYY-MM-DD'),
  body('days').isArray({ min: 1 }).withMessage('days must be a non-empty array'),
  validate,
  overridePlan,
);

router.post(
  '/notes',
  body('athleteId').isUUID().withMessage('Valid athleteId required'),
  body('content').notEmpty().withMessage('content required'),
  body('isVisibleToAthlete').isBoolean().withMessage('isVisibleToAthlete must be boolean'),
  validate,
  addNote,
);

router.get(
  '/:coachId/athletes/:athleteId/notes',
  param('coachId').isUUID(),
  param('athleteId').isUUID(),
  validate,
  getNotes,
);

export default router;
