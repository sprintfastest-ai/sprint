import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import logger from '@/utils/logger';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import type { AthleteProfile, PersonalBest, TrainingPlan, Session, Diagnosis, Drill, ChatMessage, WeaknessType } from '@/types';

// ─── Public input type ────────────────────────────────────────────────────────

/**
 * A single answer from the athlete's diagnostic quiz.
 * questionId must match one of the keys expected by the weakness classifier.
 */
export interface DiagnosisAnswer {
  questionId: string;
  answer: string | number;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

const MODEL_NAME = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

let _genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!_genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new AppError('GEMINI_API_KEY is not set', ERROR_CODES.AI_ERROR, 503);
    }
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
}

function getModel(): GenerativeModel {
  return getClient().getGenerativeModel({ model: MODEL_NAME });
}

/**
 * Strips Markdown code fences Gemini sometimes wraps around JSON responses,
 * then parses and returns the result as T.
 * Throws AI_ERROR if the string is not valid JSON.
 */
function parseJson<T>(raw: string, context: string): T {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    logger.error('ai.service: malformed JSON from Gemini', { context, raw: raw.slice(0, 500) });
    throw new AppError(
      `Gemini returned malformed JSON for ${context}`,
      ERROR_CODES.AI_ERROR,
      503,
    );
  }
}

/**
 * Wraps a Gemini API call with exponential-backoff retry (max 3 attempts)
 * on 429 rate-limit responses. Also records model, token usage, and latency.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
): Promise<T> {
  const MAX_ATTEMPTS = 3;
  const BASE_DELAY_MS = 1_000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const t0 = Date.now();
    try {
      const result = await fn();
      logger.debug(`ai.service: ${label} succeeded`, {
        model: MODEL_NAME,
        attempt,
        latencyMs: Date.now() - t0,
      });
      return result;
    } catch (err) {
      const isRateLimit =
        err instanceof Error &&
        (err.message.includes('429') || err.message.toLowerCase().includes('rate limit') || err.message.toLowerCase().includes('quota'));

      if (!isRateLimit || attempt === MAX_ATTEMPTS) {
        logger.error(`ai.service: ${label} failed`, {
          model: MODEL_NAME,
          attempt,
          latencyMs: Date.now() - t0,
          error: (err as Error).message,
        });
        if (err instanceof AppError) throw err;
        throw new AppError('AI service temporarily unavailable', ERROR_CODES.AI_ERROR, 503);
      }

      const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
      logger.warn(`ai.service: ${label} rate-limited, retrying`, {
        model: MODEL_NAME,
        attempt,
        retryAfterMs: delay,
      });
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  // Unreachable but satisfies TypeScript
  throw new AppError('AI service temporarily unavailable', ERROR_CODES.AI_ERROR, 503);
}

// ─── 1-hour in-memory plan cache ─────────────────────────────────────────────

interface CacheEntry {
  plan: Omit<TrainingPlan, 'id' | 'createdAt'>;
  expiresAt: number;
}

const planCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1_000; // 1 hour

function buildCacheKey(profile: AthleteProfile, weekNumber: number): string {
  // Stable key: only the fields that affect plan generation
  return JSON.stringify({
    ageGroup: profile.ageGroup,
    events: [...profile.events].sort(),
    trainingDaysPerWeek: profile.trainingDaysPerWeek,
    weeknessType: profile.weaknessType,
    nextRaceDate: profile.nextRaceDate,
    weekNumber,
  });
}

// ─── Sprint coaching knowledge base ─────────────────────────────────────────

const SPRINT_SYSTEM_PROMPT = `
You are SprintFastest AI — an expert sprint coach assistant embedded in the SprintFastest training app.
You possess deep knowledge of youth and elite sprint development. Always be concise, encouraging, and evidence-based.

━━━ SPRINT PHASES ━━━
1. Drive Phase (0–30 m): The acceleration window. Athlete is inclined forward at ~45°, generating
   horizontal force. Focus: powerful push-back against the track, low heel recovery, arm drive.
2. Acceleration Phase (30–60 m): The body rises gradually. Stride length and frequency both increase.
   Focus: progressive transition to upright posture, maintaining force production.
3. Maximum Velocity Phase (60–80 m): Peak speed is reached. Posture is fully upright, ground contact
   time is shortest. Focus: elastic energy return, high knee lift, relaxed upper body.
4. Speed Endurance Phase (80 m+): Maintaining speed against fatigue. Lactate tolerance and running
   economy determine how much the athlete decelerates. Focus: maintaining form under fatigue.

━━━ WEAKNESS DEFINITIONS ━━━
• Acceleration Issue: Slow 0–30 m split relative to final time. Root cause is poor Drive Phase mechanics
  — insufficient forward lean, weak push-back, or premature postural rise. Cue: "Stay low and long."
• Top Speed Issue: Good start but fails to reach age-appropriate top speed. Root cause is poor stride
  frequency and/or stride length at maximum velocity — often caused by low knee drive or excessive
  braking. Cue: "Drive the knee high and land under the hip."
• Speed Endurance Issue: Good start and top speed (0–60 m competitive) but significant fade after 60 m.
  Root cause is insufficient lactate buffering and inability to maintain mechanics under fatigue.
  Cue: "Breathe out fast, keep your arms quick."

━━━ AGE GROUP TRAINING PRINCIPLES ━━━
• U11 / U13 — Technique and fun focus. Very low volume, no speed-endurance work, no block starts.
  Priority: ABC drills, coordination, love of the sport.
• U15 — Introduce structured speed work. Short acceleration runs (20–30 m), introduction to blocks,
  low-volume tempo. Still technique-led; maximum effort limited to 90–95 %.
• U17 / U20 — Full training load. Event-specific work, race-pace speed endurance, full block starts,
  strength-speed sessions. Maximum effort allowed.

━━━ CORE DRILLS LIBRARY ━━━
• A-Skip: Rhythmic skipping with high knee drive. Activates hip flexors, reinforces foot strike timing.
• B-Skip: A-Skip with an added pawing action. Develops hamstring activation and stride mechanics.
• High Knees: Fast, continuous knee drive in place or over 20 m. Builds frequency and hip flexor power.
• Bounding: Explosive alternating single-leg jumps for distance. Develops stride length and power.
• Wall Drives: Leaning on wall at 45°, driving alternate knees upward. Reinforces Drive Phase position.
• Block Starts: Practice from starting blocks (U15+). Develops explosive first-step reaction.
• Flying 30s: Sprint through a 30 m zone after a 30 m build-up. Trains maximum velocity mechanics.
• Wicket Runs: Sprinting over evenly-spaced wickets. Regulates stride length and frequency.
• Tempo Runs: 60–80 % effort runs over 100–200 m with short rest. Builds aerobic base and recovery.
• Speed Endurance Runs: 90–100 % effort over 80–150 m with full recovery. Targets lactate tolerance (U17+).

━━━ COACHING CUE LIBRARY ━━━
"Drive your arms" — arms drive the legs; keep elbows at ~90 °, hands relaxed.
"Stay low in the drive phase" — resist early postural rise in first 30 m.
"Tall posture at top speed" — crown of head to ceiling, no forward lean at max velocity.
"Quick ground contact" — minimal time on the ground, especially past 60 m.
"Knee drive, not heel kick" — focus lift on the front side, not the back side.

━━━ SESSION STRUCTURE ━━━
Warm-up (10 min): Light jog, dynamic stretching, stride-outs.
Technical Drills (15 min): 2–3 drills from the library above.
Main Set (20 min): The primary training stimulus (speed, strength, endurance).
Cool-down (5 min): Easy jog, static stretching, debrief.

Only answer questions about sprint training, biomechanics, race preparation, recovery,
and nutrition for sprinters. Gently redirect off-topic questions back to sprint performance.
Address the athlete directly. Never claim to be human.
`.trim();

// ─── generateTrainingPlan ────────────────────────────────────────────────────

/**
 * Shape of the JSON Gemini returns for a training plan.
 * Validated before being returned to callers.
 */
interface RawTrainingPlanJson {
  athleteId: string;
  weekStartDate: string;
  isCoachOverride: boolean;
  days: Array<{
    dayNumber: number;
    sessionType: string;
    drills: Array<{
      name: string;
      sets: number;
      reps: number;
      distance: number;
      restSeconds: number;
      cue: string;
    }>;
    coachingCues: string[];
  }>;
}

function validatePlanJson(raw: unknown, context: string): RawTrainingPlanJson {
  const plan = raw as RawTrainingPlanJson;
  if (
    !plan ||
    !Array.isArray(plan.days) ||
    plan.days.length === 0 ||
    plan.days.some(
      (d) =>
        typeof d.dayNumber !== 'number' ||
        typeof d.sessionType !== 'string' ||
        !Array.isArray(d.drills) ||
        !Array.isArray(d.coachingCues),
    )
  ) {
    logger.error('ai.service: training plan JSON failed validation', { context });
    throw new AppError(
      'Gemini returned an invalid training plan structure',
      ERROR_CODES.AI_ERROR,
      503,
    );
  }
  return plan;
}

/**
 * Generates a 7-day sprint training plan personalised to the athlete's profile
 * and current personal bests. Applies automatic taper logic if `nextRaceDate`
 * is within 7 days of the plan's week start.
 *
 * Results are cached in-memory for 1 hour keyed on profile + weekNumber so
 * the same athlete re-requesting the same week does not incur a duplicate
 * Gemini API call.
 *
 * @param profile    - Athlete's current profile (age group, events, weakness, etc.)
 * @param pbs        - Array of personal bests for context.
 * @param weekNumber - ISO week number (1–53) used for cache-keying.
 * @returns          Unsaved TrainingPlan (without id / createdAt — caller persists it).
 * @throws           AppError with ERROR_CODES.AI_ERROR on malformed response.
 */
export async function generateTrainingPlan(
  profile: AthleteProfile,
  pbs: PersonalBest[],
  weekNumber: number,
): Promise<Omit<TrainingPlan, 'id' | 'createdAt'>> {
  const cacheKey = buildCacheKey(profile, weekNumber);
  const cached = planCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    logger.debug('ai.service: training plan cache hit', {
      userId: profile.userId,
      weekNumber,
    });
    return cached.plan;
  }

  // Taper detection — reduce volume if race is within 7 days
  let taperInstruction = '';
  if (profile.nextRaceDate) {
    const raceMs = new Date(profile.nextRaceDate).getTime();
    const daysUntilRace = (raceMs - Date.now()) / (1_000 * 60 * 60 * 24);
    if (daysUntilRace >= 0 && daysUntilRace <= 7) {
      taperInstruction = `
IMPORTANT — TAPER WEEK: The athlete races on ${profile.nextRaceDate} (${Math.round(daysUntilRace)} days away).
Apply a competition taper: reduce total volume by 40 %, keep intensity high (short, sharp efforts only),
eliminate all speed-endurance work, ensure 2 complete rest days before race day, and label the race day
as sessionType "rest/race".`;
    }
  }

  const pbSummary =
    pbs.length > 0
      ? pbs.map((pb) => `${pb.distance}m: ${pb.timeSeconds}s`).join(', ')
      : 'No personal bests recorded yet.';

  const prompt = `${SPRINT_SYSTEM_PROMPT}

━━━ TASK: GENERATE WEEKLY TRAINING PLAN ━━━
Athlete profile:
  - Age group: ${profile.ageGroup}
  - Events: ${profile.events.join(', ') || 'not specified'}
  - Training days per week: ${profile.trainingDaysPerWeek}
  - Primary weakness: ${profile.weaknessType ?? 'not yet diagnosed'}
  - Personal bests: ${pbSummary}
${taperInstruction}

Generate a ${profile.trainingDaysPerWeek}-day training plan for week ${weekNumber}.
Rest days should fill the remaining days of the 7-day week.

Return ONLY a valid JSON object — no markdown, no explanation — matching this exact structure:
{
  "athleteId": "${profile.userId}",
  "weekStartDate": "<ISO-8601 date for Monday of week ${weekNumber}>",
  "isCoachOverride": false,
  "days": [
    {
      "dayNumber": 1,
      "sessionType": "acceleration",
      "drills": [
        {
          "name": "Wall Drives",
          "sets": 3,
          "reps": 8,
          "distance": 0,
          "restSeconds": 90,
          "cue": "Drive the knee, keep the ankle dorsiflexed"
        }
      ],
      "coachingCues": ["Stay low and long", "Drive the arms"]
    }
  ]
}
Produce exactly 7 day objects (dayNumber 1–7). Rest days have an empty drills array and sessionType "rest".`;

  const plan = await withRetry(async () => {
    const model = getModel();
    const t0 = Date.now();
    const result = await model.generateContent(prompt);
    const usage = result.response.usageMetadata;
    logger.info('ai.service: generateTrainingPlan API call', {
      model: MODEL_NAME,
      promptTokens: usage?.promptTokenCount ?? null,
      candidateTokens: usage?.candidatesTokenCount ?? null,
      latencyMs: Date.now() - t0,
      userId: profile.userId,
      weekNumber,
    });
    const raw = parseJson<RawTrainingPlanJson>(result.response.text(), 'generateTrainingPlan');
    return validatePlanJson(raw, 'generateTrainingPlan');
  }, 'generateTrainingPlan');

  const output: Omit<TrainingPlan, 'id' | 'createdAt'> = {
    athleteId: profile.userId,
    weekStartDate: plan.weekStartDate,
    days: plan.days,
    isCoachOverride: false,
  };

  planCache.set(cacheKey, { plan: output, expiresAt: Date.now() + CACHE_TTL_MS });

  return output;
}

// ─── runDiagnosis ─────────────────────────────────────────────────────────────

interface DiagnosisJson {
  weaknessType: WeaknessType;
  explanation: string;
  drillPrescription: Array<{
    name: string;
    sets: number;
    reps: number;
    distance: number;
    restSeconds: number;
    cue: string;
  }>;
}

/**
 * Classifies an athlete's primary sprint weakness from diagnostic quiz answers
 * and returns a targeted drill prescription.
 *
 * Quiz answers are forwarded verbatim to Gemini alongside the weakness definitions
 * so the model can reason about which phase is limiting performance. The returned
 * `drillPrescription` contains 4–6 drills matched to the identified weakness.
 *
 * @param answers - Ordered array of { questionId, answer } pairs from the quiz.
 * @returns       Weakness classification, explanation, and drill prescription.
 * @throws        AppError with ERROR_CODES.AI_ERROR on malformed response.
 */
export async function runDiagnosis(
  answers: DiagnosisAnswer[],
): Promise<{ weaknessType: WeaknessType; drillPrescription: Drill[]; explanation: string }> {
  const answersText = answers
    .map((a) => `  ${a.questionId}: ${a.answer}`)
    .join('\n');

  const prompt = `${SPRINT_SYSTEM_PROMPT}

━━━ TASK: DIAGNOSE ATHLETE WEAKNESS ━━━
The athlete has completed a diagnostic quiz. Their answers:
${answersText}

Using the weakness definitions above (Acceleration Issue, Top Speed Issue, Speed Endurance Issue),
classify the athlete's primary weakness and prescribe 4–6 targeted drills.

Return ONLY a valid JSON object — no markdown, no explanation:
{
  "weaknessType": "acceleration",
  "explanation": "Your 0–30m times indicate ...",
  "drillPrescription": [
    {
      "name": "Wall Drives",
      "sets": 4,
      "reps": 8,
      "distance": 0,
      "restSeconds": 90,
      "cue": "Stay at 45 degrees, drive the knee"
    }
  ]
}
weaknessType must be exactly one of: acceleration, top_speed, speed_endurance.`;

  return withRetry(async () => {
    const model = getModel();
    const t0 = Date.now();
    const result = await model.generateContent(prompt);
    const usage = result.response.usageMetadata;
    logger.info('ai.service: runDiagnosis API call', {
      model: MODEL_NAME,
      promptTokens: usage?.promptTokenCount ?? null,
      candidateTokens: usage?.candidatesTokenCount ?? null,
      latencyMs: Date.now() - t0,
    });
    const raw = parseJson<DiagnosisJson>(result.response.text(), 'runDiagnosis');
    if (!['acceleration', 'top_speed', 'speed_endurance'].includes(raw.weaknessType)) {
      throw new AppError(
        `Gemini returned unknown weaknessType: ${raw.weaknessType}`,
        ERROR_CODES.AI_ERROR,
        503,
      );
    }
    return {
      weaknessType: raw.weaknessType,
      explanation: raw.explanation,
      drillPrescription: raw.drillPrescription as Drill[],
    };
  }, 'runDiagnosis');
}

// ─── streamChatResponse ───────────────────────────────────────────────────────

/**
 * Streams an AI coaching reply to a chat message, calling `onToken` for each
 * text chunk as it arrives. Returns the fully assembled response string when
 * the stream is complete.
 *
 * History is injected into the Gemini chat session so the model maintains
 * conversational context. The athlete's profile is woven into the system turn
 * so responses are personalised to their age group and primary events.
 *
 * @param message  - The athlete's latest message.
 * @param history  - Prior messages in the conversation (oldest first).
 * @param profile  - Athlete profile for personalised context.
 * @param onToken  - Callback invoked with each streamed text token.
 * @returns        The fully assembled reply string.
 * @throws         AppError with ERROR_CODES.AI_ERROR on API failure.
 */
export async function streamChatResponse(
  message: string,
  history: ChatMessage[],
  profile: AthleteProfile,
  onToken: (token: string) => void,
): Promise<string> {
  const personalisation = `
The athlete you are coaching:
  - Age group: ${profile.ageGroup}
  - Events: ${profile.events.join(', ') || 'not specified'}
  - Primary weakness: ${profile.weaknessType ?? 'not yet diagnosed'}
Address them directly in the second person. Keep replies ≤ 120 words unless they ask for detail.`.trim();

  const systemUser = `${SPRINT_SYSTEM_PROMPT}\n\n${personalisation}`;

  const geminiHistory: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [
    { role: 'user', parts: [{ text: systemUser }] },
    {
      role: 'model',
      parts: [
        {
          text: `Understood. I'm your SprintFastest coach — ask me anything about your ${profile.events.join(' / ') || 'sprint'} training, recovery, or race prep.`,
        },
      ],
    },
    ...history.map((m) => ({
      role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
      parts: [{ text: m.content }] as [{ text: string }],
    })),
  ];

  return withRetry(async () => {
    const model = getModel();
    const chat = model.startChat({ history: geminiHistory });
    const t0 = Date.now();
    const streamResult = await chat.sendMessageStream(message);

    let fullReply = '';
    for await (const chunk of streamResult.stream) {
      const token = chunk.text();
      if (token) {
        fullReply += token;
        onToken(token);
      }
    }

    const usage = (await streamResult.response).usageMetadata;
    logger.info('ai.service: streamChatResponse API call', {
      model: MODEL_NAME,
      promptTokens: usage?.promptTokenCount ?? null,
      candidateTokens: usage?.candidatesTokenCount ?? null,
      latencyMs: Date.now() - t0,
      historyLength: history.length,
      replyLength: fullReply.length,
    });

    return fullReply;
  }, 'streamChatResponse');
}

// ─── generateInsight ──────────────────────────────────────────────────────────

/**
 * Analyses an athlete's recent sessions, personal bests, and latest diagnosis
 * to produce a personalised 1–2 sentence coaching insight.
 *
 * Examples of output:
 *   "Your 60m times have improved 3% over the last 4 weeks — your acceleration
 *    work is paying off."
 *   "Your session frequency dropped this week — consistency is key to speed
 *    development."
 *
 * @param sessions  - Recent completed sessions (last 4–8 weeks recommended).
 * @param pbs       - Athlete's personal best records.
 * @param diagnosis - Most recent weakness diagnosis.
 * @returns         A concise coaching insight string (1–2 sentences).
 * @throws          AppError with ERROR_CODES.AI_ERROR on API failure.
 */
export async function generateInsight(
  sessions: Session[],
  pbs: PersonalBest[],
  diagnosis: Diagnosis,
): Promise<string> {
  const sessionSummary =
    sessions.length > 0
      ? sessions
          .slice(-8) // last 8 sessions max — enough context without bloating prompt
          .map((s) => {
            const times =
              s.timesRecorded.length > 0
                ? s.timesRecorded.map((t) => `${t.distance}m ${t.timeSeconds}s`).join(', ')
                : 'no times recorded';
            return `${s.completedAt}: ${times}`;
          })
          .join('\n')
      : 'No sessions recorded.';

  const pbSummary =
    pbs.length > 0
      ? pbs.map((pb) => `${pb.distance}m: ${pb.timeSeconds}s`).join(', ')
      : 'No personal bests recorded.';

  const prompt = `${SPRINT_SYSTEM_PROMPT}

━━━ TASK: GENERATE COACHING INSIGHT ━━━
Recent sessions (newest last):
${sessionSummary}

Personal bests: ${pbSummary}
Diagnosed weakness: ${diagnosis.weaknessType}
Diagnosis date: ${diagnosis.diagnosedAt}

In 1–2 sentences, give the athlete a specific, encouraging, evidence-based coaching insight
based on their recent data. Mention a concrete trend if one is visible (e.g. time improvement,
drop in frequency, PB progress). If data is sparse, give a motivational principle related to
their weakness. Do NOT use markdown. Return only the insight text.`;

  return withRetry(async () => {
    const model = getModel();
    const t0 = Date.now();
    const result = await model.generateContent(prompt);
    const usage = result.response.usageMetadata;
    logger.info('ai.service: generateInsight API call', {
      model: MODEL_NAME,
      promptTokens: usage?.promptTokenCount ?? null,
      candidateTokens: usage?.candidatesTokenCount ?? null,
      latencyMs: Date.now() - t0,
      sessionCount: sessions.length,
      pbCount: pbs.length,
    });
    return result.response.text().trim();
  }, 'generateInsight');
}
