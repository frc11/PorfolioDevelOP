/**
 * [M3] INTEGRACIONES CON IA · LOS DATOS DE LOS DOS MOMENTOS — puros (sin react) para los tests. Los textos salen de lo que develOP ofrece:
 * 05-TEXTOS (el texto del medio del tercer servicio y el recomendador: «automatizar los pasos que hoy hacés a mano: avisos,
 * recordatorios, cargas y mensajes que salen solos», «te sacaría de encima el trabajo repetitivo») y la página (`posibles`). Ni cifras,
 * ni clientes, ni garantías. La conversación del chat es la del negocio de ejemplo del panel vivo (`_panel-vivo/demos/chatbot/datos.ts`):
 * una sola fuente, dicha como ejemplo.
 */

export const TITULO_DEL_CHAT = 'Así lo ve tu cliente' // C2: provisorio (M3)
export const TEXTOS_DEL_CHAT = [
  'Tu cliente escribe en tu web y el asistente le contesta ahí mismo, a cualquier hora: lo de siempre, con la información de tu negocio.', // 05-TEXTOS, IA (texto del medio)
  'Cuando alguien está listo para comprar, le pide sus datos y te lo pasa. Si no sabe algo, no inventa: deriva a una persona.', // incluye de la página
] as const
/** Lo que dice el chat de sí mismo: que las respuestas son de ejemplo (el negocio de ejemplo del panel). */
export const AVISO_DEL_EJEMPLO = 'Respuestas de ejemplo' // C2: provisorio (M3)
export const ROTULO_DE_PROBALO = 'Probalo como cliente' // C2: provisorio (M3)

export const TITULO_DE_AUTOMATIZACIONES = 'Lo repetitivo, que pase solo' // C2: provisorio (M3)
export const TEXTOS_DE_AUTOMATIZACIONES = [
  'Además del asistente, automatizamos los pasos que hoy hacés a mano: avisos, recordatorios, cargas de datos y mensajes que salen solos.', // 05-TEXTOS, recomendador (automatizacion)
  'Lo conectamos con lo que ya usás, tus planillas o tu sistema de clientes, para que cada dato llegue solo a donde tiene que estar.', // posibles: «Conexión con lo que ya usás»
  'Para un negocio chico es tiempo: te saca de encima el trabajo repetitivo y te quedás con lo que sí necesita a una persona.', // 05-TEXTOS, recomendador (automatizacion)
] as const

/** Lo que hoy se hace a mano, con su tipo (los cuatro de 05-TEXTOS: mensajes, recordatorios, cargas de datos y avisos entre sistemas). */
export const TAREAS = [
  { texto: 'Mandar el recordatorio de cada turno', tipo: 'Recordatorio' },
  { texto: 'Contestar «¿cuánto sale?» otra vez', tipo: 'Mensaje' },
  { texto: 'Pasar cada pedido a la planilla', tipo: 'Carga de datos' },
  { texto: 'Pasar cada interesado a tu sistema de clientes', tipo: 'Aviso entre sistemas' },
  { texto: 'Cargar cada comprobante a mano', tipo: 'Carga de datos' },
] as const
export const PASA_SOLO = 'Pasa solo'

/**
 * [M3] El tilde con histéresis, sobre el avance del cruce del renglón: se tilda al llegar a 1 (su tope pasó la línea de arriba) y se
 * destilda recién al volver a 0 (pasó la de abajo); en el medio, se queda como estaba: no titila en la línea.
 */
export function tildeSiguiente(hecha: boolean, avance: number): boolean {
  if (!hecha && avance >= 1) return true
  if (hecha && avance <= 0) return false
  return hecha
}

/** El tic suena sólo al tildarse, con movimiento y con el renglón a la vista (un salto que pasa por encima no suena). El sonido apagado lo calla el bus. */
export function debeSonar(m: { readonly reducido: boolean; readonly antes: boolean; readonly ahora: boolean; readonly aLaVista: boolean }): boolean {
  return !m.reducido && !m.antes && m.ahora && m.aLaVista
}
