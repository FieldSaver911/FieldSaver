/** FieldSaver Design Tokens — mirrors the original artifact V object */
export const V = {
  // ── Brand ──────────────────────────────────────────────────────────────────
  primary:        '#0073EA',
  primaryHover:   '#0060C0',
  primaryLight:   '#DCEEFF',
  primaryBg:      '#EAF3FF',

  // ── Backgrounds ────────────────────────────────────────────────────────────
  bgApp:          '#F6F7FB',
  bgSurface:      '#FFFFFF',
  bgHover:        '#F0F2F8',
  bgSelected:     '#DCEEFF',
  bgHighlight:    '#EAF3FF',

  // ── Text ───────────────────────────────────────────────────────────────────
  textPrimary:    '#323338',
  textSecondary:  '#676879',
  textDisabled:   '#ABADB6',

  // ── Borders ────────────────────────────────────────────────────────────────
  border:         '#C3C6D4',
  borderLight:    '#E6E9EF',
  borderFocus:    '#0073EA',

  // ── Semantic ───────────────────────────────────────────────────────────────
  positive:       '#258750',
  positiveBg:     '#E5F5EC',
  negative:       '#D83A52',
  negativeBg:     '#FCEDEF',
  warning:        '#CB6F00',
  warningBg:      '#FDEFD0',

  // ── Sidebar ────────────────────────────────────────────────────────────────
  sidebarBg:      '#1C1F3B',
  sidebarText:    '#FFFFFF',
  sidebarMuted:   'rgba(255,255,255,0.6)',
  sidebarHover:   'rgba(255,255,255,0.07)',
  sidebarActive:  'rgba(255,255,255,0.14)',
  sidebarBorder:  'rgba(255,255,255,0.1)',

  // ── Typography ─────────────────────────────────────────────────────────────
  font:   "'Figtree','Poppins',-apple-system,sans-serif",
  xs:     '11px',
  sm:     '12px',
  md:     '14px',
  lg:     '16px',
  xl:     '18px',

  // ── Radii ──────────────────────────────────────────────────────────────────
  r2:     '4px',
  r3:     '6px',
  r4:     '8px',
  r5:     '12px',
  rFull:  '9999px',

  // ── Spacing ────────────────────────────────────────────────────────────────
  s1:     '4px',
  s2:     '8px',
  s3:     '12px',
  s4:     '16px',
  s5:     '20px',
  s6:     '24px',

  // ── Shadows ────────────────────────────────────────────────────────────────
  shadow1: '0 1px 4px rgba(0,0,0,0.08)',
  shadow2: '0 4px 12px rgba(0,0,0,0.12)',
  shadow3: '0 8px 28px rgba(0,0,0,0.16)',
} as const;

/** Category color scheme for library row categories */
export const CAT = {
  basic:    { bg: '#DCEEFF', text: '#0060C0', dot: '#0073EA' },
  choice:   { bg: '#EDE3FF', text: '#6645CC', dot: '#7C5CBF' },
  advanced: { bg: '#D4F1E4', text: '#1A6641', dot: '#258750' },
  layout:   { bg: '#FDEFD0', text: '#7A4100', dot: '#CB6F00' },
} as const;

/** Maps NEMSIS library category name to a CAT color */
export function categoryColor(category: string): typeof CAT.basic {
  if (category === 'Pertinent Negative') return CAT.layout;
  if (category === 'NOT Value')          return CAT.choice;
  if (category === 'Nillable Marker')    return CAT.advanced;
  return CAT.basic;
}
