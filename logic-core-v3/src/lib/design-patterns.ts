/**
 * Patrones de Tailwind canonicos.
 * En lugar de hardcodear clases, usar estos building blocks.
 */

export const patterns = {
  // Containers
  card: {
    base: 'rounded-2xl border border-white/10 bg-white/[0.02]',
    interactive:
      'rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors',
    elevated: 'rounded-3xl border border-white/10 bg-white/[0.02]',
    glass: 'rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur',
    dashed: 'rounded-2xl border border-dashed border-white/10 bg-white/[0.02]',
  },

  // Section padding
  section: {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  },

  // Buttons
  button: {
    primary:
      'inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-cyan-300 transition-colors disabled:opacity-50',
    secondary:
      'inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.08] transition-colors disabled:opacity-50',
    ghost:
      'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.05] transition-colors',
    danger:
      'inline-flex items-center justify-center gap-2 rounded-2xl bg-red-400/15 border border-red-400/30 px-5 py-2.5 text-sm text-red-200 hover:bg-red-400/25 transition-colors',
    sm: {
      primary:
        'inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-cyan-300',
      secondary:
        'inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08]',
    },
  },

  // Inputs
  input: {
    base: 'w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400/30',
    invalid:
      'w-full rounded-xl border border-red-400/40 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-red-400/60',
  },

  // Typography
  text: {
    eyebrow: 'text-[10px] uppercase tracking-[0.24em] text-zinc-500',
    h1: 'text-3xl font-semibold tracking-tight text-zinc-100',
    h2: 'text-2xl font-semibold text-zinc-100',
    h3: 'text-lg font-semibold text-zinc-100',
    h4: 'text-base font-medium text-zinc-200',
    body: 'text-sm text-zinc-300 leading-relaxed',
    bodyMuted: 'text-sm text-zinc-400',
    caption: 'text-xs text-zinc-500',
    mono: 'font-mono text-xs text-zinc-300',
  },

  // Layout
  pageContainer: 'space-y-6',
  sectionGap: 'space-y-6',
  formGap: 'space-y-4',
} as const

// Re-exports para uso conveniente
export { patterns as p }
