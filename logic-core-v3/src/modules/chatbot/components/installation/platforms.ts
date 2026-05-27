/**
 * Plataformas para las que mostramos instrucciones específicas de instalación
 * del widget. Curado a las PyME reales que atendemos (no las 10 del research).
 * Agregar una plataforma nueva: una línea acá + un caso en PlatformInstructions.
 */
export const INSTALL_PLATFORMS = [
  { id: 'html', label: 'HTML estático', icon: '📄' },
  { id: 'wordpress', label: 'WordPress', icon: '🔌' },
  { id: 'tiendanube', label: 'Tiendanube', icon: '🛒' },
  { id: 'shopify', label: 'Shopify', icon: '🛍️' },
  { id: 'wix', label: 'Wix', icon: '🟦' },
  { id: 'squarespace', label: 'Squarespace', icon: '⬛' },
  { id: 'other', label: 'Otro / Custom', icon: '⚙️' },
] as const

export type InstallPlatformId = (typeof INSTALL_PLATFORMS)[number]['id']

/** Base URL pública del bundle del widget. Fallback prod si la env var no está. */
export const WIDGET_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://develop.com.ar'

/**
 * Snippet de embed que el cliente pega en su sitio. El `data-bot` lleva el slug
 * REAL del bot (multi-tenant: el wrapper toma el slug del session autenticada).
 */
export function buildEmbedSnippet(botSlug: string): string {
  return `<script src="${WIDGET_APP_URL}/widget.js" data-bot="${botSlug}" data-theme="dark"></script>`
}
