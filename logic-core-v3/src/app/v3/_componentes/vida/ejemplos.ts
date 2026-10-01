/**
 * [INTERFAZ 2] T3 · LOS DATOS DE EJEMPLO de la vida propia de las secciones opacas (Tu panel y Servicios).
 *
 * Es un producto funcionando, no un dato: nombres que dicen que son de ejemplo, tipos de pedido genéricos, ninguna
 * cifra de negocio (ni montos, ni porcentajes, ni clientes reales: `CONTENIDO_INVENTADO`). El único número es el
 * contador del panel, que cuenta los pedidos de ESTE ejemplo desde uno y vuelve a empezar: la tarjeta entera dice
 * «datos de ejemplo» arriba, y el contador no existe fuera de la animación (no está en el marcado del servidor).
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

/** El contador del panel: lo que se lee arriba del número. */
export const CONTADOR_DE_EJEMPLO = 'Pedidos del ejemplo'

/** Hasta cuánto sube el contador antes de volver a empezar (una ronda corta: no parece un acumulado real). */
export const TOPE_DEL_CONTADOR = 9

/**
 * Servicios: cómo se ve cada servicio funcionando, paso por paso. La misma línea que el panel (algo que pasa solo,
 * de ejemplo), contada como el recorrido de UN pedido por lo que develOP construye.
 */
export const PROCESOS_DE_EJEMPLO: Readonly<Record<'web' | 'software' | 'ia-automatizacion', readonly string[]>> = {
  web: ['Alguien llega desde una búsqueda', 'Recorre el catálogo', 'Completa el formulario', 'Te llega la consulta'],
  software: ['Entra un pedido', 'Se descuenta del stock', 'Se arma el comprobante', 'Se avisa al cliente'],
  'ia-automatizacion': ['«¿Tienen envío a domicilio?»', 'El asistente responde al instante', 'Toma los datos del pedido', 'Te deja el pedido listo'],
}

export const ROTULO_DEL_PROCESO = 'Así funciona · ejemplo'
