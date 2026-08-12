/**
 * Acentos de servicio del sistema de diseño (rediseño B1).
 *
 * Los mapas son literales a propósito: Tailwind escanea el fuente y no puede
 * resolver nombres de clase armados en runtime. Un `text-ds-accent-${accent}`
 * no generaría CSS.
 *
 * El Gate 1 se cerró en B2-S4 con la permutación A, que es la que ya tenían los
 * tokens: web cian · IA verde · automatización ámbar · software violeta. No se
 * movió ningún hex. Acá viven los nombres de rol, no los colores; los valores
 * están en `globals.css` y congelados en `CLAUDE.md`.
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
