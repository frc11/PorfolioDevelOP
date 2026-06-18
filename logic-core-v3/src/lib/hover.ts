/**
 * Hover uniforme del admin — igual al pattern del Dashboard.
 * NO incluye `rounded-*` ni `grid` — los aporta el elemento o el wrapper.
 */
export const adminHoverCls =
  'transition duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform hover:scale-[1.015] hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/15 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:hover:shadow-none'

/** Para elementos que ya tenían hover — scale ligeramente más pronunciado. */
export const adminHoverAmplifiedCls =
  'transition duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform hover:scale-[1.02] hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/15 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:hover:shadow-none'
