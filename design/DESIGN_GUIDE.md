# SprintFastest — Design Guide

> Source of truth for all visual decisions. Read this before building any screen.

## What's in this folder

`figma/` contains the **Figma Make export** — a React web app that renders
every MVP screen inside an iPhone 14 Pro frame. It is **reference-only** and is
never imported by the mobile app.

To browse the designs locally, run the app in the `figma/` folder with any
Vite/React dev server. Routes are defined in `figma/src/app/routes.ts`.

---

## Colour Tokens

These values are extracted directly from every page file in the Figma export.
They are the authoritative colours — do not deviate without updating this table
and `src/utils/tokens.ts` in the same commit.

| Token key       | Hex value   | Usage                                              |
|-----------------|-------------|----------------------------------------------------|
| `blue`          | `#1A6BB5`   | Primary CTA buttons, active nav, selected pills     |
| `orange`        | `#F05A1A`   | Secondary CTAs, icon accent, "Register" link, banners |
| `green`         | `#6DC400`   | Success states, PB badges, streak indicators        |
| `text`          | `#1A1A1A`   | All body copy and headings                          |
| `grey`          | `#6B7280`   | Secondary text, labels, placeholder context         |
| `border`        | `#E0E0E0`   | Card borders, dividers, input outlines              |
| `surface`       | `#FFFFFF`   | Card and sheet backgrounds                          |
| `bg`            | `#F8F9FA`   | Screen background                                   |
| `blueLight`     | `#EBF5FB`   | Blue-tinted info surface (drill cards, tips)        |
| `orangeLight`   | `#FEF3EC`   | Orange-tinted banner bg (U11 notice, warnings)      |
| `danger`        | `#C0392B`   | Destructive actions, error states                   |

**Font stack:** `'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif`

---

## Typography Scale

| Role        | Size | Weight | Usage                        |
|-------------|------|--------|------------------------------|
| Heading 1   | 24px | 700    | Screen title                 |
| Heading 2   | 20px | 700    | Card/section titles          |
| Body        | 16px | 400    | General copy                 |
| Body bold   | 16px | 600    | Stat values, active labels   |
| Caption     | 14px | 400    | Supporting copy, timestamps  |
| Label       | 12px | 600    | All-caps field labels        |

---

## MVP Screens — Page Index

| File                           | Route                 | Status   |
|--------------------------------|-----------------------|----------|
| `LoginScreen.tsx`              | `/login`              | ✅ Ready  |
| `RegisterScreen.tsx`           | `/register`           | ✅ Ready  |
| `HomeScreen.tsx`               | `/home-screen`        | ✅ Ready  |
| `TrainingPlan.tsx`             | `/training-plan`      | ✅ Ready  |
| `ChatCoach.tsx`                | `/chat-coach`         | ✅ Ready  |
| `DiagnosisQuiz.tsx`            | `/diagnosis-quiz`     | ✅ Ready  |
| `DiagnosisResults.tsx`         | `/diagnosis-results`  | ✅ Ready  |
| `ProgressTracker.tsx`          | `/progress-tracker`   | ✅ Ready  |
| `PersonalBests.tsx`            | `/personal-bests`     | ✅ Ready  |
| `LogTime.tsx`                  | `/log-time`           | ✅ Ready  |
| `Achievements.tsx`             | `/achievements`       | ✅ Ready  |
| `BadgeGallery.tsx`             | `/badges`             | ✅ Ready  |
| `DesignSystem.tsx`             | `/` (index)           | ✅ Ready  |
| `ComponentLibrary.tsx`         | `/components`         | ✅ Ready  |

---

## Layout conventions visible in the Figma frames

- **Screen padding:** 24px horizontal, 20px top (below status bar)
- **Card radius:** 16px (`borderRadius: 16`)
- **Card shadow:** `0 2px 12px rgba(0,0,0,0.08)` (subtle, light-mode)
- **Bottom tab bar:** 60px tall, white background, 1px top border `#E0E0E0`; active icon `#1A6BB5`, inactive `#6B7280`
- **Input fields:** white bg, 1px border `#E0E0E0`, radius 10px, 48px min height
- **Primary button:** full-width, `#1A6BB5`, radius 12px, 52px height, white bold text
- **Orange button:** full-width, `#F05A1A`, same shape — used for high-energy CTAs (Create Account, Start Session)
- **Pill selectors:** selected = `#1A6BB5` bg white text; unselected = white bg `#E0E0E0` border grey text
- **Status bar height:** 59px (iPhone 14 Pro Dynamic Island layout); safe area inset 34px bottom

---

## How to use this as a reference

When building a new screen:
1. Open the matching file in `design/figma/src/app/pages/`
2. Each file renders a single 393×852px iPhone frame — read the inline styles for exact spacing, colours, and layout
3. Map colours using the table above — every `C.blue`, `C.orange`, etc. maps directly to `COLORS.*` in `src/utils/tokens.ts`
4. The Figma frames are annotated with athlete name + scenario (e.g. "Marcus · U15 · 100m") to clarify the intended data context

---

## Updating this guide

Any time you get a new Figma Make export:
1. Replace `design/figma/src/` with the new export contents (strip `__MACOSX` and `.DS_Store`)
2. Diff `design/figma/src/styles/theme.css` and any page `const C = ...` blocks for colour changes
3. Update this table and `src/utils/tokens.ts` in the same commit
