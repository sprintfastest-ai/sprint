# Google Play Store Listing Assets — Prompt Collection

This folder contains ready-to-paste prompts for generating every visual
asset the Play Console "Store listing" page requires, using **Figma Make**
or **Gemini** (Nano Banana / Imagen). Each file covers one asset category.

## Files

| File | Asset | Count needed | Output size |
|---|---|---|---|
| `01-feature-graphic.md` | Feature Graphic | 1 | 1024 × 500 px |
| `02-phone-screenshots.md` | Phone screenshots | 4–8 | 1080 × 1920 px (9:16) |
| `03-tablet-7in-screenshots.md` | 7-inch tablet screenshots | 4 | 1200 × 1920 px (5:8) |
| `04-tablet-10in-screenshots.md` | 10-inch tablet screenshots | 4 | 1600 × 2560 px (5:8) |

## Brand reference (used in every prompt)

- **App name:** SprintFastest — never "SprintIQ"
- **Tagline:** "Track. Train. Dominate."
- **Colors:** Blue `#1A6BB5` (primary), Orange `#F05A1A` (accent/CTA), Green
  `#6DC400` (success/streak), Dark text `#1A1A1A`, Light background `#F8F9FA`
- **Icon:** the runner mark in `src/assets/icon.png` — a stylised sprinting
  figure in a blue → orange → green gradient sweep, on a solid `#1A6BB5`
  rounded-square background
- **Typography:** Inter / SF Pro, bold headlines, clean sans-serif body copy
- **Tone:** energetic, youth-athlete-focused, data-driven but encouraging —
  not corporate, not overly playful

## How to use these prompts

1. Open the file for the asset you need.
2. Copy one prompt block at a time into Figma Make or Gemini.
3. If the tool supports reference images, attach `src/assets/icon.png` and/or
   a real on-device screenshot so the AI matches your actual UI instead of
   inventing one.
4. Generate at 2–4x the target size when possible, then downscale for
   crisper text and edges.
5. Export as PNG (no alpha for the Feature Graphic — Play Console rejects
   transparency there).

## Play Console technical requirements (current as of writing)

- **Feature Graphic:** JPG or 24-bit PNG (**no alpha channel**), exactly
  1024 × 500 px.
- **Screenshots (phone/7"/10"):** JPEG or 24-bit PNG, min 2 required per
  device type you support (phone is mandatory; tablets are optional but
  recommended if you want your listing to look right on tablet Play Store
  pages). Each side between 320px and 3840px, aspect ratio between 16:9
  and 9:16 for the long/short edge pairing used below.
- Do not include device bezels/frames baked into a screenshot AND rely on
  Play Console's own device-frame overlay — pick one. The prompts below
  generate **framed, presentation-style** screenshots (device mockup +
  marketing caption), which is what most competitive listings use. If you'd
  rather submit raw, unframed screenshots and let Play auto-frame them,
  strip the "device mockup" instructions from each prompt.
