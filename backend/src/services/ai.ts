import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '@/utils/logger';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import type { TrainingPlan, Diagnosis, WeaknessType } from '@/types';

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  }
  return genAI;
}

function getModel() {
  return getClient().getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite-preview-06-17',
  });
}

async function generateJson<T>(prompt: string): Promise<T> {
  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const json = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(json) as T;
  } catch (err) {
    logger.error('Gemini API error', { error: (err as Error).message });
    throw new AppError('AI service unavailable', ERROR_CODES.AI_ERROR, 503);
  }
}

export async function generateWeeklyPlan(
  athleteId: string,
  ageGroup: string,
  weaknessType: WeaknessType | null,
  trainingDaysPerWeek: number,
  weekStartDate: string,
): Promise<Omit<TrainingPlan, 'id' | 'createdAt'>> {
  const prompt = `
You are an expert sprint coach. Generate a ${trainingDaysPerWeek}-day sprint training plan for a ${ageGroup} athlete.
${weaknessType ? `Their primary weakness is: ${weaknessType}.` : ''}
Week start date: ${weekStartDate}.

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "athleteId": "${athleteId}",
  "weekStartDate": "${weekStartDate}",
  "isCoachOverride": false,
  "days": [
    {
      "dayNumber": 1,
      "sessionType": "acceleration",
      "drills": [
        {
          "name": "Wall drives",
          "sets": 3,
          "reps": 8,
          "distance": 0,
          "restSeconds": 90,
          "cue": "Drive the knee, keep the ankle dorsiflexed"
        }
      ],
      "coachingCues": ["Stay tall", "Relax the shoulders"]
    }
  ]
}
`;
  return generateJson<Omit<TrainingPlan, 'id' | 'createdAt'>>(prompt);
}

export async function runDiagnosis(
  athleteId: string,
  timeTrial20m: number,
  timeTrial60m: number,
  timeTrial200m: number,
  previousWeaknessType?: WeaknessType,
): Promise<Omit<Diagnosis, 'diagnosedAt'>> {
  const prompt = `
You are an expert sprint biomechanics coach. Given these time trial results:
- 20m: ${timeTrial20m}s
- 60m: ${timeTrial60m}s
- 200m: ${timeTrial200m}s
${previousWeaknessType ? `Previous diagnosed weakness: ${previousWeaknessType}` : ''}

Diagnose the athlete's primary weakness from: acceleration, top_speed, speed_endurance.
Then prescribe 4–6 targeted drills.

Return ONLY valid JSON (no markdown):
{
  "athleteId": "${athleteId}",
  "weaknessType": "acceleration",
  "drillPrescription": [
    {
      "name": "Resisted sled push",
      "sets": 4,
      "reps": 1,
      "distance": 20,
      "restSeconds": 180,
      "cue": "Lean forward at 45 degrees, drive the arms"
    }
  ]
}
`;
  return generateJson<Omit<Diagnosis, 'diagnosedAt'>>(prompt);
}

export async function generateCoachingCue(
  drillName: string,
  weaknessType: WeaknessType,
  ageGroup: string,
): Promise<string> {
  const prompt = `
You are an expert sprint coach speaking directly to a ${ageGroup} athlete.
Give a single, encouraging, actionable coaching cue (max 15 words) for the drill: "${drillName}".
The athlete's weakness is: ${weaknessType}.
Return ONLY the cue text, no quotes, no explanation.
`;
  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    logger.error('Gemini cue error', { error: (err as Error).message });
    throw new AppError('AI service unavailable', ERROR_CODES.AI_ERROR, 503);
  }
}

export async function chatWithCoach(
  _userId: string,
  message: string,
  history: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }>,
): Promise<string> {
  try {
    const model = getModel();
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'You are an expert sprint coach assistant for SprintFastest. Be concise, encouraging, and evidence-based. Only answer questions about sprint training, recovery, nutrition for sprinters, and race preparation.' }],
        },
        {
          role: 'model',
          parts: [{ text: "Understood. I'm your sprint coach — ask me anything about training, recovery, or race prep." }],
        },
        ...history,
      ],
    });
    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (err) {
    logger.error('Gemini chat error', { error: (err as Error).message });
    throw new AppError('AI service unavailable', ERROR_CODES.AI_ERROR, 503);
  }
}
