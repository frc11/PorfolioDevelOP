/**
 * develOP Design Tokens
 *
 * Fuente unica de verdad para spacing, colors, radii, typography.
 * Importar desde aca en lugar de hardcodear valores.
 *
 * REGLA DE COLOR — no decorativo, siempre con razon.
 *   1. SEMANTICO (estado): success / warning / danger / info.
 *      Verde = bueno/resuelto. Ambar = atencion/pendiente. Rojo = problema/error. Azul = info.
 *   2. MARCA / ACCION: brand (cyan) para lo accionable y el estado activo.
 *   3. IDENTIDAD POR SERVICIO: service.web / service.ia / service.automation / service.software.
 *      Usar solo donde el contexto sea ese servicio (modulo premium, card de servicio en landing).
 *   4. NEUTRO: todo lo demas — surface / border / text en escala de grises sobre dark.
 *
 * Si un icono o card no comunica estado, no comunica accion, ni representa un servicio,
 * es NEUTRO. No hay color decorativo.
 */

// ===========================================
// COLORS
// ===========================================
export const colors = {
  // Brand
  brand: {
    primary: '#06b6d4', // cyan-500
    primaryHover: '#22d3ee', // cyan-400
    primaryLight: '#67e8f9', // cyan-300
    primaryDark: '#0891b2', // cyan-600
  },

  // Backgrounds
  surface: {
    base: '#09090b', // zinc-950
    raised: '#18181b', // zinc-900
    overlay: 'rgba(24, 24, 27, 0.8)',
    glass: 'rgba(255, 255, 255, 0.02)',
    glassHover: 'rgba(255, 255, 255, 0.04)',
    glassEmphasis: 'rgba(255, 255, 255, 0.06)',
  },

  // Borders
  border: {
    subtle: 'rgba(255, 255, 255, 0.05)',
    default: 'rgba(255, 255, 255, 0.1)',
    emphasis: 'rgba(255, 255, 255, 0.2)',
    strong: 'rgba(255, 255, 255, 0.3)',
  },

  // Text
  text: {
    primary: '#fafafa', // zinc-50
    secondary: '#e4e4e7', // zinc-200
    tertiary: '#a1a1aa', // zinc-400
    muted: '#71717a', // zinc-500
    disabled: '#52525b', // zinc-600
  },

  // Semantic
  success: {
    base: '#10b981', // emerald-500
    light: '#34d399', // emerald-400
    bg: 'rgba(16, 185, 129, 0.06)',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  warning: {
    base: '#f59e0b', // amber-500
    light: '#fbbf24', // amber-400
    bg: 'rgba(245, 158, 11, 0.06)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  danger: {
    base: '#ef4444', // red-500
    light: '#f87171', // red-400
    bg: 'rgba(239, 68, 68, 0.06)',
    border: 'rgba(239, 68, 68, 0.3)',
  },
  info: {
    base: '#3b82f6', // blue-500
    light: '#60a5fa', // blue-400
    bg: 'rgba(59, 130, 246, 0.06)',
    border: 'rgba(59, 130, 246, 0.3)',
  },

  // Accents para modulos especificos
  accent: {
    violet: '#8b5cf6',
    emerald: '#10b981',
    rose: '#f43f5e',
    amber: '#f59e0b',
  },

  // Identidad por SERVICIO — usar SOLO donde el contexto sea ese servicio
  // (modulo premium, card de servicio en landing). Nunca decorativo.
  service: {
    web: '#06b6d4', // cyan-500 — Web Development
    ia: '#8b5cf6', // violet-500 — IA / Chatbots
    automation: '#10b981', // emerald-500 — Automation
    software: '#f59e0b', // amber-500 — Software / Custom
  },
} as const

// ===========================================
// SPACING (en px, mapean a Tailwind units)
// ===========================================
export const spacing = {
  xs: 4, // 1 (p-1)
  sm: 8, // 2
  md: 12, // 3
  base: 16, // 4
  lg: 20, // 5
  xl: 24, // 6
  '2xl': 32, // 8
  '3xl': 48, // 12
  '4xl': 64, // 16
} as const

// ===========================================
// BORDER RADIUS
// ===========================================
// Escala unica — sm para controles, md para cards, lg para modales/hero.
// Usar tokens nombrados (input/card/modal) cuando el contexto este claro.
export const radii = {
  none: '0',
  sm: '0.375rem', // 6px — inputs, botones, swatches, chips
  md: '0.75rem', // 12px — cards, tiles, paneles
  lg: '1rem', // 16px — modales, dialogos, sheets
  xl: '1.5rem', // 24px — hero containers
  full: '9999px',
} as const

// ===========================================
// TYPOGRAPHY
// ===========================================
export const typography = {
  fontFamily: {
    sans: 'system-ui, -apple-system, sans-serif',
    mono: 'ui-monospace, "SF Mono", Menlo, monospace',
  },

  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    eyebrow: '0.24em',
  },

  lineHeight: {
    tight: 1.2,
    snug: 1.4,
    normal: 1.6,
    relaxed: 1.75,
  },
} as const

// ===========================================
// SHADOWS
// ===========================================
export const shadows = {
  none: 'none',
  subtle: '0 1px 2px rgba(0, 0, 0, 0.1)',
  default: '0 4px 12px rgba(0, 0, 0, 0.2)',
  elevated: '0 10px 30px rgba(0, 0, 0, 0.3)',
  modal: '0 25px 60px rgba(0, 0, 0, 0.5)',
} as const

// ===========================================
// MOTION
// ===========================================
export const motion = {
  duration: {
    instant: 0.1,
    fast: 0.15,
    normal: 0.25,
    slow: 0.4,
    slower: 0.6,
  },

  easing: {
    standard: [0.25, 0.46, 0.45, 0.94] as const,
    decel: [0, 0, 0.2, 1] as const,
    accel: [0.4, 0, 1, 1] as const,
    spring: { type: 'spring', stiffness: 300, damping: 30 } as const,
  },
} as const

// ===========================================
// BREAKPOINTS (matching Tailwind defaults)
// ===========================================
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// ===========================================
// Z-INDEX SCALE
// ===========================================
export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 20,
  dropdown: 30,
  overlay: 40,
  modal: 50,
  toast: 60,
  tooltip: 70,
} as const
