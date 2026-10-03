/**
 * [NOCTURNO] B · EL CHAT DE EJEMPLO CON DEVELOP — la conversación del negocio de ejemplo con el equipo: lo que ya se
 * habló, lo que llega en vivo (el equipo contesta) y lo que el equipo responde a lo que escriba el visitante (por la
 * respuesta rápida que eligió o, si escribe libre, una general que dice que es un ejemplo). Sin cifras de develOP: el
 * tiempo de respuesta real del panel no va en la landing.
 */
export interface MensajeDelChat {
  readonly deDevelop: boolean
  readonly texto: string
  readonly haceMin: number
}

export const HISTORIA_DEL_CHAT: readonly MensajeDelChat[] = [
  { deDevelop: false, texto: 'Hola, ¿podemos sumar una sección de preguntas frecuentes a la web?', haceMin: 2 * 24 * 60 },
  { deDevelop: true, texto: '¡Claro! Pasanos las preguntas que más te hacen y la armamos.', haceMin: 2 * 24 * 60 - 40 },
  { deDevelop: false, texto: 'Listo, se las mandé por mail.', haceMin: 24 * 60 },
]

/** Lo que llega solo, uno por paso. */
export const LLEGAN_AL_CHAT: readonly MensajeDelChat[] = [
  { deDevelop: true, texto: 'Recibido 👌 Ya está armada: la vas a ver publicada en un rato.', haceMin: 0 },
  { deDevelop: true, texto: 'Si querés, también la sumamos a lo que sabe tu chatbot, así responde lo mismo.', haceMin: 0 },
]

/** La respuesta del equipo a lo que manda el visitante, según la respuesta rápida que usó (o la general). */
export const RESPUESTAS_DEL_EQUIPO: Readonly<Record<string, string>> = {
  proyecto: 'Te pasamos el avance del proyecto en un rato. ¡Gracias por escribir!',
  bug: 'Gracias por avisar. Lo revisamos y te contamos apenas esté resuelto.',
  mejora: '¡Buena idea! La anotamos y te escribimos para verla juntos.',
  libre: '¡Gracias! En tu panel te responde una persona del equipo (esto es un ejemplo).',
}

export const RITMO_DEL_CHAT_CON_DEVELOP = { llegaMs: 3000, respondeMs: 1600, enviandoMs: 500 } as const
