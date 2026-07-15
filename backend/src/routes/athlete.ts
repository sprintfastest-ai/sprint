import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '@/middleware/validate';
import { authenticate } from '@/middleware/auth';
import {
  getWeeklyPlan,
  completeSession,
  getSessionHistory,
  getPersonalBests,
  logPersonalBest,
  diagnose,
  getDiagnosisHistory,
  getMyProfile,
  updateMyProfile,
  getAchievements,
} from '@/controllers/athleteController';

const router = Router();

router.use(authenticate);

router.get('/me', getMyProfile);
router.patch(
  '/me',
  body('ageGroup').optional().isIn(['U11', 'U13', 'U15', 'U17', 'U20']).withMessage('Invalid age group'),
  body('primaryEvent').optional().isString().trim().isLength({ max: 50 }),
  body('events').optional().isArray({ max: 10 }).withMessage('events must be an array'),
  body('events.*').optional().isString().trim().isLength({ max: 30 }),
  body('trainingDaysPerWeek').optional().isInt({ min: 1, max: 7 }),
  body('nextRaceDate').optional({ nullable: true }).isDate().withMessage('nextRaceDate must be YYYY-MM-DD'),
  body('onboardingCompleted').optional().isBoolean(),
  validate,
  updateMyProfile,
);

const athleteIdParam = param('athleteId').isUUID().withMessage('Invalid athleteId');

router.get(
  '/:athleteId/plans',
  athleteIdParam,
  query('weekStartDate').isDate().withMessage('weekStartDate must be YYYY-MM-DD'),
  validate,
  getWeeklyPlan,
);

router.post(
  '/:athleteId/sessions',
  athleteIdParam,
  body('planId').isUUID().withMessage('Valid planId required'),
  body('timesRecorded').isArray({ min: 0 }).withMessage('timesRecorded must be an array'),
  validate,
  completeSession,
);

router.get('/:athleteId/sessions', athleteIdParam, validate, getSessionHistory);

router.get('/:athleteId/pbs', athleteIdParam, validate, getPersonalBests);

router.post(
  '/:athleteId/pbs',
  athleteIdParam,
  body('distance').isFloat({ min: 1 }).withMessage('distance required'),
  body('timeSeconds').isFloat({ min: 0.1 }).withMessage('timeSeconds required'),
  validate,
  logPersonalBest,
);

router.get('/:athleteId/diagnoses', athleteIdParam, validate, getDiagnosisHistory);

router.post(
  '/diagnosis',
  body('athleteId').isUUID().withMessage('Valid athleteId required'),
  body('timeTrial20m').isFloat({ min: 1 }).withMessage('timeTrial20m must be a positive number'),
  body('timeTrial60m').isFloat({ min: 1 }).withMessage('timeTrial60m must be a positive number'),
  body('timeTrial200m').isFloat({ min: 1 }).withMessage('timeTrial200m must be a positive number'),
  body('answers').optional().isObject().withMessage('answers must be an object'),
  validate,
  diagnose,
);

router.get('/:athleteId/achievements', athleteIdParam, validate, getAchievements);

export default router;
