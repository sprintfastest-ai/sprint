/**
 * SprintFastest design tokens — extracted directly from the Figma Make export.
 * See design/DESIGN_GUIDE.md for the full token reference table.
 *
 * Every value here must stay in sync with design/DESIGN_GUIDE.md.
 * When a new Figma export arrives, diff the `const C = ...` blocks in
 * design/figma/src/app/pages/ and update here in the same commit.
 */
export const COLORS = {
  // ── Brand ────────────────────────────────────────────────────────────────────
  /** Primary CTA — Log In button, active pills, selected tabs, stepper btns */
  primary:      '#1A6BB5',
  /** Energetic orange — Create Account btn, icons, accent line, Register link */
  orange:       '#F05A1A',
  /** Success / PB / streak — badges and progress indicators */
  green:        '#6DC400',

  // ── Surfaces ─────────────────────────────────────────────────────────────────
  background:   '#F8F9FA',   // screen bg
  surface:      '#FFFFFF',   // card / sheet bg

  // ── Text ─────────────────────────────────────────────────────────────────────
  /** All headings and body copy */
  textPrimary:   '#1A1A1A',
  /** Supporting labels, timestamps, placeholders */
  textSecondary: '#6B7280',

  // ── Semantic ──────────────────────────────────────────────────────────────────
  error:        '#C0392B',   // destructive / form errors
  /** Blue-tinted surface — drill cards, coach tip banners */
  blueLight:    '#EBF5FB',
  /** Orange-tinted surface — U11 consent notice, warning banners */
  orangeLight:  '#FEF3EC',

  // ── Borders ────────────────────────────────────────────────────────────────
  border:       '#E0E0E0',
  borderFocus:  '#1A6BB5',

  // ── Inputs ───────────────────────────────────────────────────────────────────
  inputBg:          '#FFFFFF',
  inputPlaceholder: '#B0B7C3',

  // ── Aliases kept for backward compatibility ───────────────────────────────────
  /** @deprecated use orangeLight */
  bannerBg:     '#FEF3EC',
  /** @deprecated use orange */
  bannerBorder: '#F05A1A',
  /** @deprecated use green */
  success:      '#6DC400',
} as const;

/** Typography scale — matched to Figma frame annotations */
export const FONT = {
  /** Screen titles — 24px / 700 */
  h1: { fontSize: 24, fontWeight: '700' as const },
  /** Card / section titles — 20px / 700 */
  h2: { fontSize: 20, fontWeight: '700' as const },
  /** General body copy — 16px / 400 */
  body: { fontSize: 16, fontWeight: '400' as const },
  /** Bold body — stat values, active labels — 16px / 600 */
  bodyBold: { fontSize: 16, fontWeight: '600' as const },
  /** Supporting copy, timestamps — 14px / 400 */
  caption: { fontSize: 14, fontWeight: '400' as const },
  /** All-caps field labels — 12px / 600 */
  label: { fontSize: 12, fontWeight: '600' as const },
} as const;

/** Border radius scale */
export const RADIUS = {
  sm:   8,
  md:   10,   // inputs, small cards
  lg:   16,   // main cards
  btn:  12,   // buttons
  pill: 100,  // pills / badges
} as const;

/** Spacing scale — 4px base unit */
export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;
