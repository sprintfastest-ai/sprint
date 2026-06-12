/**
 * Design tokens derived from the SprintFastest Figma design system.
 * Import from here in all screens to ensure consistent styling.
 */
export const COLORS = {
  // Brand
  primary:    '#1A6BB5',  // CTA blue — Log In button, active selectors
  orange:     '#F05A1A',  // Energetic orange — icons, Create Account, accent line
  // Surfaces
  background: '#F8F9FA',
  surface:    '#FFFFFF',
  // Text
  textPrimary:   '#222222',
  textSecondary: '#7F8C8D',
  // Semantic
  error:      '#C0392B',
  success:    '#1E8449',
  // Borders
  border:     '#DDE1E7',
  borderFocus:'#1A6BB5',
  // U11 banner
  bannerBg:   '#FEF3EC',
  bannerBorder:'#F05A1A',
  // Input
  inputBg:    '#FFFFFF',
  inputPlaceholder: '#B0B7C3',
} as const;

export const FONT = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 100,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
