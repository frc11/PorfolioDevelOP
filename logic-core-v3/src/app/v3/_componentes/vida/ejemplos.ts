/**
 * [INTERFAZ 2] T3 · LOS DATOS DE EJEMPLO de la vida propia de las secciones opacas (Tu panel; la de Servicios se
 * borró en el cierre final).
 *
 * Es un producto funcionando, no un dato: nombres que dicen que son de ejemplo, tipos de pedido genéricos, ninguna
 * cifra (ni montos, ni porcentajes, ni clientes reales, ni contadores: `CONTENIDO_INVENTADO`). [Cierre de INTERFAZ 2]
 * El contador del panel se fue: queda la barra de actividad, sin número.
 */

/** El rótulo que va arriba de todo lo que se mueve solo. */
export const ROTULO_DE_EJEMPLO = 'En vivo · datos de ejemplo'

/** Quién manda cada pedido del ejemplo. */
export const QUIEN_DE_EJEMPLO = 'Cliente de ejemplo'

/** Lo que entra al panel, en orden, en una ronda. */
export const PEDIDOS_DE_EJEMPLO: readonly { readonly que: string; readonly desde: string }[] = [
  { que: 'Nuevo pedido', desde: 'Tienda online' },
  { que: 'Consulta respondida', desde: 'Chat del sitio' },
  { que: 'Turno agendado', desde: 'WhatsApp' },
  { que: 'Presupuesto pedido', desde: 'Formulario' },
  { que: 'Lead calificado', desde: 'Chat del sitio' },
]

/** La barra de actividad del panel (sin número: decisión del cierre de INTERFAZ 2). */
export const ROTULO_DE_LA_ACTIVIDAD = 'Actividad'

