/**
 * EL CONTACTO DEL PIE — un solo archivo de datos: el mail, WhatsApp, las redes y la línea
 * legal. **[FINAL 3]** Nada de esto se muestra como marcador: lo que todavía es provisorio
 * lleva su TODO acá y figura como pendiente en el reporte del sprint.
 */

export const MAIL = 'contacto@develop.com.ar'
export const HREF_DEL_MAIL = `mailto:${MAIL}`

/** WhatsApp: el número en formato internacional y el mensaje que llega precargado. */
const NUMERO_DE_WHATSAPP = '5493814154708'
const MENSAJE_DE_WHATSAPP = 'Hola develOP, vi el sitio y quiero contarles mi proyecto.'
export const WHATSAPP = {
  rotulo: 'Escribinos por WhatsApp',
  href: `https://wa.me/${NUMERO_DE_WHATSAPP}?text=${encodeURIComponent(MENSAJE_DE_WHATSAPP)}`,
} as const

export type RedDelPie = 'instagram' | 'linkedin' | 'tiktok' | 'facebook'

/** Las redes, en el orden en que se ven. */
export const REDES: readonly { readonly red: RedDelPie; readonly rotulo: string; readonly href: string }[] = [
  // TODO(FINAL 3): URLs provisorias — reemplazar por los perfiles reales de develOP.
  { red: 'instagram', rotulo: 'Instagram', href: 'https://www.instagram.com/develop.ar' },
  { red: 'linkedin', rotulo: 'LinkedIn', href: 'https://www.linkedin.com/company/develop-ar' },
  { red: 'tiktok', rotulo: 'TikTok', href: 'https://www.tiktok.com/@develop.ar' },
  { red: 'facebook', rotulo: 'Facebook', href: 'https://www.facebook.com/develop.ar' },
]

/** Sin páginas de privacidad ni de términos todavía: la línea legal va sin enlaces. */
export const LINEA_LEGAL = '© 2026 develOP. Todos los derechos reservados.'
