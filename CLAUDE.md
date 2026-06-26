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
COLORS.orangeLight  = '#FEF3EC'   // Warning surface — banners, U11 notice
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
| `DiagnosisQuiz.tsx` | `src/screens/main/DiagnosisQuizScreen.tsx` | Phase 3 |
| `DiagnosisResults.tsx` | `src/screens/main/DiagnosisResultsScreen.tsx` | Phase 3 |
| `PersonalBests.tsx` | `src/screens/main/PersonalBestsScreen.tsx` | Phase 3 |
| `Achievements.tsx` | `src/screens/main/AchievementsScreen.tsx` | Phase 3 |
| `BadgeGallery.tsx` | `src/screens/main/BadgeGalleryScreen.tsx` | Phase 3 |

---

## Navigation Structure

```
RootNavigator
├── AuthNavigator (Stack) — shown when !isAuthenticated
│   ├── Login
│   ├── Register
│   ├── ForgotPassword
│   └── ResetPassword  { token: string }
└── MainNavigator (Bottom Tabs) — shown when isAuthenticated
    ├── Home        → HomeScreen
    ├── Training    → TrainingPlanScreen
    ├── Chat        → ChatCoachScreen
    ├── Progress    → ProgressScreen (sub-tabs: PBs / Log Time / History)
    └── Profile     → ProfileScreen
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
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET  /api/v1/athletes/me`
- `WS   /ws` — chat, audio handlers

**JWT:** 15min access / 30d refresh. Payload: `{ userId, email, role, subscriptionPlan, isVerified, athleteId? }`

---

## Development Phases

### Phase 1 — Foundation ✅ COMPLETE
- [x] Auth screens: Login, Register, ForgotPassword, ResetPassword
- [x] Backend API + WebSocket server
- [x] Database schema (17 tables, Neon PostgreSQL)
- [x] AI service (Gemini)
- [x] Email service (Resend)
- [x] All 6 external services configured and live

### Phase 2 — Core App Screens (MVP) ← CURRENT
- [ ] Bottom tab navigator (Home / Training / Chat / Progress / Profile)
- [ ] HomeScreen — dashboard: streak card, today's session, weekly ring, PB, AI insight
- [ ] TrainingPlanScreen — day strip selector, drill list with expandable cues, complete session
- [ ] ChatCoachScreen — WebSocket chat, streaming AI responses, user/AI bubbles
- [ ] ProgressScreen — sub-tabs: PBs grid with sparkline, Log Time hero input, History
- [ ] Wire all screens to live backend API

**MVP breakpoint:** All Phase 2 screens complete + tested on device → TestFlight submission

### Phase 3 — Advanced Features
- [ ] DiagnosisQuizScreen — weakness assessment flow
- [ ] DiagnosisResultsScreen — AI-generated recommendations
- [ ] PersonalBestsScreen — dedicated PB timeline
- [ ] AchievementsScreen + BadgeGalleryScreen — gamification
- [ ] Parent/Coach flows — account linking, coach notes

### Phase 4 — Monetisation & Launch
- [ ] Paywall screen + RevenueCat SDK integration
- [ ] Push notifications (expo-notifications)
- [ ] App Store / Play Store submission via EAS
- [ ] Production hardening (NODE_ENV=production, rate limits, monitoring)

### Phase 3.5 — Audio Chat Beta (post-MVP v1.1)
- [ ] Microphone permission handling (expo-av installed)
- [ ] Record → chunk → stream UI in ChatCoachScreen
- [ ] AI audio response playback
- [ ] Beta label in UI
- Backend WebSocket handlers already built: `audio:start_session`, `audio:chunk`, `audio:end_session`

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
