# SprintFastest — Claude Code Guide

> AI-powered sprint training platform for youth track & field athletes.
> **Always use the name SprintFastest** — never SprintIQ, even if a prompt says otherwise.

---

## Repository Structure

```
sprint/
├── src/                        # React Native (Expo) mobile app
│   ├── api/                    # API client + auth API callers
│   ├── components/ui/          # Shared UI components
│   ├── hooks/                  # useAuth and other hooks
│   ├── navigation/             # Stack + Tab navigators, types
│   ├── screens/
│   │   └── auth/               # Login, Register, ForgotPassword, ResetPassword
│   ├── store/                  # Zustand stores (authStore.ts)
│   └── utils/tokens.ts         # Design tokens (colours, fonts, spacing, radius)
├── backend/                    # Node.js Express API
│   └── src/
│       ├── controllers/        # Route handlers
│       ├── db/                 # Pool, migrations, query files
│       ├── routes/             # Express routers
│       ├── services/           # AI, auth, email, token, access
│       ├── utils/logger.ts     # Shared logger
│       └── websocket/          # WS server, registry, handlers
├── design/
│   ├── DESIGN_GUIDE.md         # Colour tokens, typography, layout conventions
│   └── figma/src/app/pages/    # Figma Make export — iPhone 14 Pro reference frames
└── CLAUDE.md                   # This file
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | Expo SDK 53, React Native, TypeScript strict |
| Navigation | React Navigation v7 — Stack + Bottom Tab |
| State | Zustand v5 (`useAuthStore`) |
| API client | Axios with JWT interceptor + silent refresh queue |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Neon) — 17 tables, UUID PKs |
| AI | Google Gemini (`@google/generative-ai`) |
| Email | Resend via Nodemailer SMTP |
| Subscriptions | RevenueCat |
| Hosting | Render (EU Frankfurt) |
| Mobile builds | Expo EAS |

---

## Design Tokens

All values live in `src/utils/tokens.ts` and must match `design/DESIGN_GUIDE.md`.

```ts
COLORS.primary      = '#1A6BB5'   // Blue — CTA buttons, active tabs, focus borders
COLORS.orange       = '#F05A1A'   // Orange — secondary CTAs, accent line, icons
COLORS.green        = '#6DC400'   // Green — success, PB badges, streaks
COLORS.textPrimary  = '#1A1A1A'   // All headings and body copy
COLORS.textSecondary= '#6B7280'   // Labels, timestamps, placeholders
COLORS.border       = '#E0E0E0'   // Card borders, input outlines
COLORS.surface      = '#FFFFFF'   // Card / sheet backgrounds
COLORS.background   = '#F8F9FA'   // Screen background
COLORS.blueLight    = '#EBF5FB'   // Info surface — drill cards, coach tips
COLORS.orangeLight  = '#FEF3EC'   // Warning surface — banners, under-13 (U12) notice
COLORS.error        = '#C0392B'   // Destructive, form errors
```

**Layout constants (from Figma frames):**
- Input height: `48px`, border-radius: `12px`, focus border: `2px blue`
- Primary button: height `48px`, border-radius `10px`, background `#1A6BB5`
- Orange button: same shape, background `#F05A1A`
- Card shadow: `0 2px 12px rgba(0,0,0,0.08)`, radius `16px`
- Bottom tab bar: `60px` tall, white bg, `1px` top border `#E0E0E0`
- Screen horizontal padding: `20px`

---

## Figma Reference Files

Location: `design/figma/src/app/pages/`

These are **React web files** (not React Native). They render iPhone 14 Pro frames (393×852px) and are reference-only — never imported by the mobile app. Use them to extract exact spacing, colours, and component structure.

| Figma File | RN Screen | Route |
|-----------|-----------|-------|
| `LoginScreen.tsx` | `src/screens/auth/LoginScreen.tsx` | Auth stack |
| `RegisterScreen.tsx` | `src/screens/auth/RegisterScreen.tsx` | Auth stack |
| `ForgotPasswordScreen.tsx` | `src/screens/auth/ForgotPasswordScreen.tsx` | Auth stack |
| `ResetPasswordScreen.tsx` | `src/screens/auth/ResetPasswordScreen.tsx` | Auth stack |
| `HomeScreen.tsx` | `src/screens/main/HomeScreen.tsx` | Tab: Home |
| `TrainingPlan.tsx` | `src/screens/main/TrainingPlanScreen.tsx` | Tab: Training |
| `ChatCoach.tsx` | `src/screens/main/ChatCoachScreen.tsx` | Tab: Chat |
| `LogTime.tsx` | `src/screens/main/ProgressScreen.tsx` | Tab: Progress |
| `ProgressTracker.tsx` | `src/screens/main/ProgressScreen.tsx` | Tab: Progress |
| `DiagnosisQuiz.tsx` | `src/screens/athlete/DiagnosisQuizScreen.tsx` | Athlete stack (modal) |
| `DiagnosisResults.tsx` | `src/screens/athlete/DiagnosisResultsScreen.tsx` | Athlete stack (modal) |
| `PersonalBests.tsx` | folded into `src/screens/athlete/ProgressScreen.tsx` (PBs sub-tab) | Tab: Progress |
| `Achievements.tsx` | `src/screens/athlete/AchievementsScreen.tsx` | Athlete stack |
| `BadgeGallery.tsx` | folded into `src/screens/athlete/AchievementsScreen.tsx` (badge grid) | Athlete stack |

Note: `PersonalBestsScreen.tsx` and `BadgeGalleryScreen.tsx` as separate files were never built — their
Figma content was implemented as sub-views of `ProgressScreen` and `AchievementsScreen` instead. Actual
screen files also live under `src/screens/{athlete,coach,parent}/`, not `src/screens/main/`.

---

## Navigation Structure

Real structure as implemented (differs from the originally planned single "MainNavigator" — the app grew
separate role-based navigators for athlete/coach/parent, plus onboarding and modal screens not in the
original plan):

```
RootNavigator (Stack) — role-based root switch
├── Auth           → AuthNavigator (Stack) — shown when !isAuthenticated
│   ├── Login
│   ├── Register
│   ├── ForgotPassword
│   └── ResetPassword  { token: string }
├── Onboarding     → OnboardingScreen — first-run profile setup for new athletes
├── AthleteTabs    → AthleteStackNavigator (Stack)
│   ├── Tabs → AthleteNavigator (Bottom Tabs: Dashboard "Home" / Training / Progress / Chat / Profile)
│   ├── DiagnosisQuiz     (modal)
│   ├── DiagnosisResults  (modal)
│   ├── Achievements
│   └── Paywall           (modal) — RevenueCat purchase/restore flow
├── CoachTabs      → CoachStackNavigator (Stack)
│   ├── Tabs → CoachNavigator (Bottom Tabs: Athletes / Profile)
│   └── AthleteDetail — roster athlete's plan/notes/progress
└── ParentTabs     → ParentStackNavigator (Stack)
    ├── Tabs → ParentNavigator (Bottom Tabs: Overview / Profile)
    └── AthleteDetail — linked athlete's PBs/sessions/diagnosis
```

---

## Backend API

**Base URL:** `https://sprintfastest-api.onrender.com`
**Health check:** `GET /health`
**API prefix:** `/api/v1`

Key endpoints:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/request-reset`
- `POST /api/v1/auth/reset-password`
- `GET  /api/v1/athletes/me`
- `POST /api/v1/chat/message` — typed chat; the mobile app uses this REST endpoint, not the WS `chat:send`
  handler below (that handler exists and is registered, but no client currently calls it)
- `WS   /ws` — `audio:*` handlers (Voice Chat, live), `chat:*` handlers (built, currently unused by the app)

**JWT:** 15min access / 30d refresh. Payload: `{ userId, email, role, subscriptionPlan, isVerified, athleteId? }`

---

## Development Phases

> **Note on this checklist (verified 2026-08-04):** an audit of every screen and backend route found Phases
> 2–4 substantially built and live-wired already — this section had drifted badly out of date (it still
> called Phase 2 "current" and Phases 3–4 "not started"). Checkboxes below now reflect what's actually
> wired to the real backend/DB, not just present as a file. See "Known gaps" at the end of each phase for
> the few things that are genuinely still mock/stub.

### Phase 1 — Foundation ✅ COMPLETE
- [x] Auth screens: Login, Register, ForgotPassword, ResetPassword
- [x] Backend API + WebSocket server
- [x] Database schema (20+ tables across 4 migrations, Neon PostgreSQL)
- [x] AI service (Gemini)
- [x] Email service (Resend)
- [x] All 6 external services configured and live

### Phase 2 — Core App Screens (MVP) ✅ COMPLETE
- [x] Bottom tab navigator — actual tabs: Dashboard ("Home") / Training / Progress / Chat / Profile
      (`src/navigation/AthleteNavigator.tsx`)
- [x] AthleteDashboardScreen — live plan/PB/session/profile data via `useTraining`/`profileApi`
- [x] TrainingScreen — `trainingApi.getWeeklyPlan/completeSession/getSessionHistory`
- [x] ChatScreen — `chatApi.getHistory/sendMessage`, live REST (not WS — see Backend API note below)
- [x] ProgressScreen — `trainingApi.getPersonalBests/logPersonalBest`, PBs sub-tab includes the
      dedicated PB timeline originally planned as a separate PersonalBestsScreen
- [x] All Phase 2 screens wired to live backend API
- [x] Dashboard "AI insight" card — real `GET /athletes/:athleteId/insight` (Gemini, 4h in-memory
      cache per athlete); notification bell now opens Profile

### Phase 3 — Advanced Features ✅ COMPLETE
- [x] DiagnosisQuizScreen — `diagnosisApi.runDiagnosis()` → real `/athletes/diagnosis`
- [x] DiagnosisResultsScreen — renders the real diagnosis object from nav params
- [x] AchievementsScreen — `achievementsApi.getAchievements()` → real `achievements` table; badge
      gallery grid folded in here rather than a separate BadgeGalleryScreen
- [x] Parent/Coach flows — separate `CoachStackNavigator`/`ParentStackNavigator` (2-tab + detail stack
      each), account linking via `linksApi.redeemInvite`, coach notes, all live-wired

### Phase 4 — Monetisation & Launch
- [x] Paywall screen + RevenueCat SDK integration — real `react-native-purchases` purchase/restore flow
      (`src/services/purchases.ts`), real webhook signature verification server-side
- [x] Push notifications (expo-notifications) — permission flow, token registration, real triggers
      (badge unlocks, coach notes, daily session reminders)
- [x] AthleteProfileScreen's "Change Password" (real `request-reset` call) and "Notifications"
      (real permission status + Settings deep-link) settings rows
- [ ] App Store / Play Store submission via EAS
- [ ] Production hardening (NODE_ENV=production, rate limits, monitoring)

### Phase 3.5 — Audio Chat Beta (post-MVP v1.1) ✅ COMPLETE
- [x] Microphone permission handling (expo-av + NSMicrophoneUsageDescription)
- [x] Record → chunk → stream UI in ChatScreen (src/hooks/useAudioChat.ts)
- [x] AI audio response playback — Gemini transcribes + replies in one multimodal
      call (no separate STT service); reply text is spoken on-device via expo-speech
      rather than server-synthesized audio
- [x] Beta label in UI
- Backend: `audio:start_session` / `audio:chunk` / `audio:end_session` fully implemented
  in `backend/src/websocket/handlers/audio.handler.ts`. Voice exchanges are persisted to
  the same `chat_messages` table as typed chat and count against the same free-tier
  daily limit.

---

## External Services

| Service | Purpose | Config |
|---------|---------|--------|
| Neon PostgreSQL | Database | `DATABASE_URL` in backend `.env` |
| Google Gemini | AI coaching | `GEMINI_API_KEY`, `GEMINI_MODEL=gemini-1.5-flash` |
| Resend | Transactional email | `SMTP_*` vars, domain: `sprintfastest.com` |
| RevenueCat | Subscriptions/IAP | `REVENUECAT_WEBHOOK_SECRET`, webhook: `/api/v1/subscription/webhook` |
| Render | Backend hosting | Auto-deploys from `main` branch |
| Expo EAS | Mobile builds | Project ID in `app.json`, `eas.json` configured |

---

## Key Rules

1. **Always SprintFastest** — never SprintIQ anywhere in code or copy
2. **Follow Figma exactly** — read the reference frame before building any screen
3. **Use design tokens** — never hardcode colours or spacing; always use `COLORS.*`, `SPACING.*`, `RADIUS.*`, `FONT.*` from `src/utils/tokens.ts`
4. **No SVG library** — `react-native-svg` not installed; use `⚡` emoji for lightning bolt, solid line for gradient
5. **No LinearGradient** — `expo-linear-gradient` not installed; use solid colour fallbacks
6. **SafeAreaView** — always wrap screens in `SafeAreaView` from `react-native-safe-area-context`
7. **Push to main** — Render auto-deploys from `main` branch; feature work on `claude/*` branches, merge to main to deploy
