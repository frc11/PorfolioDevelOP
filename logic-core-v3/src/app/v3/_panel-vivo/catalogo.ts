/**
 * [NOCTURNO] B · LAS DEMOS DEL PANEL — una por feature de Tu panel (`_secciones/tu-panel/contenido.ts`, `TARJETAS`, que
 * nombra la suya), y el ítem de la barra lateral del panel que cada una marca. El mapeo de cada demo con el módulo real
 * del dashboard, en `docs/rediseno/PANEL-VIVO.md`.
 */
export type IdDeDemo = 'conversaciones' | 'leads' | 'tickets' | 'mensajes' | 'servicios' | 'proyecto' | 'resultados' | 'informacion'

/** Las secciones de la barra lateral del panel real (`components/dashboard/SidebarNav.tsx`), con sus ítems. */
export type ItemDelPanel = 'inicio' | 'proyecto' | 'resultados' | 'servicios' | 'chatbot' | 'mensajes' | 'soporte' | 'plan' | 'referidos' | 'cuenta'

export const ITEM_DE_LA_DEMO: Readonly<Record<IdDeDemo, ItemDelPanel>> = {
  conversaciones: 'chatbot',
  leads: 'chatbot',
  tickets: 'soporte',
  mensajes: 'mensajes',
  servicios: 'servicios',
  proyecto: 'proyecto',
  resultados: 'resultados',
  informacion: 'chatbot',
}

/** El nombre de cada demo para el lector de pantalla («Demo de … con datos de ejemplo»). */
export const NOMBRE_DE_LA_DEMO: Readonly<Record<IdDeDemo, string>> = {
  conversaciones: 'las conversaciones del chatbot',
  leads: 'los leads',
  tickets: 'los tickets de soporte',
  mensajes: 'el chat con el equipo',
  servicios: 'los servicios',
  proyecto: 'el resumen del proyecto',
  resultados: 'los resultados',
  informacion: 'lo que sabe tu chatbot',
}

/** El rótulo que lleva cada demo, arriba a la derecha: todo lo que se ve es de ejemplo. */
export const ROTULO_DE_EJEMPLO = 'Ejemplo'

/** El negocio de ejemplo del panel (la barra de arriba). */
export const NEGOCIO_DE_EJEMPLO = 'Tu negocio'
