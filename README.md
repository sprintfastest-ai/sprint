# SprintIQ

AI-powered sprint training platform for youth track & field athletes. Delivers personalised weekly training plans, weakness diagnosis, audio coaching cues, a parent dashboard, and a coach override layer — all through a React Native mobile app backed by a Node.js API.

---

## Project overview

| Layer | Tech |
|---|---|
| Mobile app | Expo (React Native) · TypeScript strict |
| State management | Zustand |
| Navigation | React Navigation v7 (Stack + Bottom Tabs) |
| HTTP client | Axios with silent JWT refresh |
| Local storage | AsyncStorage |
| Animations | React Native Reanimated |
| Audio coaching | Expo AV |
| Push notifications | Expo Notifications |
| Backend | Node.js (separate repo / `backend/` folder) |
| Hosting | Render |
| CI/CD | GitHub Actions |

---

## Local setup

### Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android emulator, or the Expo Go app on a physical device

### 1. Clone the repository

```bash
git clone https://github.com/travellertope/sprint.git
cd sprint
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the values (see [Environment variables](#environment-variables) below).

### 4. Run the mobile app

```bash
# Start Expo dev server
npm start

# Or target a specific platform directly
npm run ios
npm run android
npm run web
```

### 5. Run the backend (if running locally)

```bash
cd backend
npm install
cp .env.example .env   # fill in backend env vars
npm run dev
```

Point `EXPO_PUBLIC_API_BASE_URL` in your mobile `.env` at `http://localhost:3000/v1` (or your local IP for physical devices).

---

## Environment variables

Create a `.env` file at the project root. **Never commit real values.**

| Variable | Used by | Description |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Mobile app | Base URL of the SprintIQ REST API |
| `EXPO_PUBLIC_WEBSOCKET_URL` | Mobile app | WebSocket server URL for real-time events |

Backend environment variables (set in `backend/.env` or Render dashboard):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign access tokens |
| `JWT_REFRESH_SECRET` | Secret used to sign refresh tokens |
| `OPENAI_API_KEY` | OpenAI key for AI coaching and diagnosis |
| `RENDER_DEPLOY_HOOK` | Render webhook URL (CI uses this — set as GitHub secret) |
| `PORT` | HTTP port the backend listens on |

---

## Branch strategy

```
main          — production; protected; merges trigger CI + Render deploy
develop       — staging; all feature branches merge here first
feature/*     — individual features, e.g. feature/diagnosis-screen
fix/*         — bug fixes
chore/*       — dependency updates, tooling, docs
```

**Workflow:**

1. Branch off `develop`: `git checkout -b feature/my-feature develop`
2. Open a PR into `develop` when ready for review.
3. After QA on staging, open a PR from `develop` → `main`.
4. Merging to `main` triggers the GitHub Actions pipeline (type-check → lint → Render deploy).

---

## CI/CD

The `.github/workflows/deploy.yml` pipeline runs on every push to `main`:

1. **Type check** — `tsc --noEmit`
2. **Lint** — `eslint src --ext .ts,.tsx`
3. **Deploy** — POSTs to `RENDER_DEPLOY_HOOK` (stored as a GitHub Actions secret)

Add the Render deploy hook URL in: **GitHub repo → Settings → Secrets and variables → Actions → `RENDER_DEPLOY_HOOK`**.

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run ios` | Open in iOS Simulator |
| `npm run android` | Open in Android emulator |
| `npm run web` | Open in browser |
| `npm run lint` | Run ESLint across `src/` |
| `npm run type-check` | Run TypeScript compiler check |
