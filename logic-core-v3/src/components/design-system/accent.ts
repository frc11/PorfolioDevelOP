/**
 * Acentos de servicio del sistema de diseño (rediseño B1).
 *
 * Los mapas son literales a propósito: Tailwind escanea el fuente y no puede
 * resolver nombres de clase armados en runtime. Un `text-ds-accent-${accent}`
 * no generaría CSS.
 *
 * ⚠ Los VALORES de estos cuatro tokens tienen una decisión pendiente de Franco
 * (Gate 1): el código y CLAUDE.md asignan los mismos cuatro hex a servicios
 * distintos. Acá viven los nombres de rol, no los colores — cuando se resuelva
 * la permutación se cambian los hex en `globals.css` y este archivo no se toca.
 */

export type ServiceAccent = 'web' | 'ia' | 'automation' | 'software'

export const SERVICE_ACCENTS: readonly ServiceAccent[] = [
  'web',
  'ia',
  'automation',
  'software',
] as const

export const accentTextClass: Record<ServiceAccent, string> = {
  web: 'text-ds-accent-web',
  ia: 'text-ds-accent-ia',
  automation: 'text-ds-accent-automation',
  software: 'text-ds-accent-software',
}

export const accentBgClass: Record<ServiceAccent, string> = {
  web: 'bg-ds-accent-web',
  ia: 'bg-ds-accent-ia',
  automation: 'bg-ds-accent-automation',
  software: 'bg-ds-accent-software',
}

export const accentBorderClass: Record<ServiceAccent, string> = {
  web: 'border-ds-accent-web',
  ia: 'border-ds-accent-ia',
  automation: 'border-ds-accent-automation',
  software: 'border-ds-accent-software',
}
