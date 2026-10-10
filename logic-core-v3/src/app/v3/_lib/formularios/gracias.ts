/**
 * [PULIDO 9] H2 · H3 · LO QUE QUEDA DE UN FORMULARIO ENVIADO (el del pie y el de Contacto). [PULIDO 11] B2 · B3 · ya no es una
 * tarjeta de gracias chica: es la TARJETA DEL RESULTADO, del tamaño de la placa (`TarjetaDeResultado`), con su encastre (el
 * logo que encaja, o que no) y su copy. El hundido y `?gracias=` se borraron: los dos formularios voltean (`volteo.ts`).
 */
export const RESULTADO = {
  exito: { titulo: 'Recibido.', bajada: 'Te contestamos pronto.' },
  error: { titulo: 'No se pudo enviar.' },
  otro: 'Enviar otro mensaje',
  reintentar: 'Reintentar',
} as const

/** Lo que se anuncia al llegar (la región viva de cada formulario). */
export const ANUNCIO_DE_EXITO = `${RESULTADO.exito.titulo} ${RESULTADO.exito.bajada}`

export type TipoDeResultado = 'exito' | 'error'
