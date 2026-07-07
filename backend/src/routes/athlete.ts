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
} from '@/controllers/athleteController';

const router = Router();

router.use(authenticate);

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
  validate,
  diagnose,
);

export default router;
