/**
 * Acentos de servicio del sistema de diseño (rediseño B1 / S1-cimiento).
 *
 * Los mapas son literales a propósito: Tailwind escanea el fuente y no puede
 * resolver nombres de clase armados en runtime. Un `text-ds-accent-${accent}`
 * no generaría CSS.
 *
 * Tres servicios, no cuatro: el ámbar murió en S1-cimiento. IA y
 * Automatización son un solo servicio (verde) — decisión no negociable del
 * documento del rediseño. web cian-azulado · IA verde · software violeta.
 * Acá viven los nombres de rol, no los colores; los valores están en
 * `globals.css` y congelados en `CLAUDE.md`.
 */

export type ServiceAccent = 'web' | 'ia' | 'software'

export const SERVICE_ACCENTS: readonly ServiceAccent[] = [
  'web',
  'ia',
  'software',
] as const

export const accentTextClass: Record<ServiceAccent, string> = {
  web: 'text-ds-accent-web',
  ia: 'text-ds-accent-ia',
  software: 'text-ds-accent-software',
}

export const accentBgClass: Record<ServiceAccent, string> = {
  web: 'bg-ds-accent-web',
  ia: 'bg-ds-accent-ia',
  software: 'bg-ds-accent-software',
}

export const accentBorderClass: Record<ServiceAccent, string> = {
  web: 'border-ds-accent-web',
  ia: 'border-ds-accent-ia',
  software: 'border-ds-accent-software',
}
