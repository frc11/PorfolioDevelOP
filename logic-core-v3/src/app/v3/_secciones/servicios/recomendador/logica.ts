import type { IdDeServicio } from '../../_contrato/acento'

/**
 * [C2-51] LA LÓGICA DEL RECOMENDADOR — pura (sin React): las preguntas, las opciones con sus puntos y sus frases, las cinco soluciones
 * y la cuenta que elige dos. Los textos salen de `docs/cola/2026-10-23/05-TEXTOS.md` («El recomendador»), tal cual.
 *
 * LA CUENTA: cada respuesta suma sus puntos a las soluciones que nombra; las dos con más puntos son la recomendación (A la primera,
 * B la segunda). Como Q1 da puntos a dos soluciones, siempre hay por lo menos dos con puntos, y A y B son siempre distintas.
 *
 * EL DESEMPATE (documentado, y lo prueba `s78-c2-51` sobre las 125 combinaciones): se ordena por
 *   1. el total, de mayor a menor;
 *   2. los puntos que la solución sumó en la PREGUNTA 1 (lo que hoy le cuesta al negocio), de mayor a menor: «gana la que sumó en la
 *      pregunta 1», leído como «la que más sumó ahí» (con «sumó algo» a secas, «Pierdo horas…» desempataría hacia gestión, que en esa
 *      respuesta es la secundaria);
 *   3. el orden de la tabla de soluciones (`SOLUCIONES`).
 * Si A y B son del mismo servicio, igual se muestran las dos (son cosas distintas).
 */

export type IdDeSolucion = 'pagina' | 'tienda' | 'gestion' | 'chatbot' | 'automatizacion'

export interface Solucion {
  readonly id: IdDeSolucion
  /** El nombre visible (la tarjeta). En las frases va con la primera letra en minúscula (`enMinuscula`). */
  readonly nombre: string
  /** El servicio de la página y del contacto (`data-precarga`). */
  readonly servicio: IdDeServicio
  /** La tarjeta y el análisis (termina en punto). */
  readonly porQue: string
  /** La frase de B en el análisis. */
  readonly complemento: string
}

/** La tabla de soluciones, en su orden (el último desempate). */
export const SOLUCIONES: readonly Solucion[] = [
  { id: 'pagina', nombre: 'Una página web', servicio: 'web', porQue: 'una página propia, pensada para tu rubro, que te encuentren en Google y que cada visita sepa en segundos qué hacés y cómo escribirte.', complemento: 'te sumaría una página que trabaje de vidriera las 24 horas.' },
  { id: 'tienda', nombre: 'Una tienda online', servicio: 'web', porQue: 'una tienda online donde tus clientes ven el catálogo, eligen y te compran sin que tengas que contestar uno por uno.', complemento: 'te sumaría una tienda para que las ventas no dependan de tu celular.' },
  { id: 'gestion', nombre: 'Un sistema de gestión a medida', servicio: 'software', porQue: 'un sistema hecho para cómo trabaja tu negocio, con todo en un solo lugar y sin planillas sueltas.', complemento: 'ordenaría lo de adentro para que crecer no sea un caos.' },
  { id: 'chatbot', nombre: 'Un chatbot con IA que atienda por vos', servicio: 'ia-automatizacion', porQue: 'un chatbot con IA que conteste por vos a cualquier hora, tome los datos de cada interesado y te los deje ordenados en tu panel.', complemento: 'haría que ninguna consulta quede sin respuesta.' },
  { id: 'automatizacion', nombre: 'Automatizaciones', servicio: 'ia-automatizacion', porQue: 'automatizar los pasos que hoy hacés a mano: avisos, recordatorios, cargas y mensajes que salen solos.', complemento: 'te sacaría de encima el trabajo repetitivo.' },
]

export const IDS_DE_SOLUCION: readonly IdDeSolucion[] = SOLUCIONES.map((s) => s.id)

export function solucion(id: IdDeSolucion): Solucion {
  const s = SOLUCIONES.find((x) => x.id === id)
  if (s === undefined) throw new Error(`solución desconocida: ${id}`)
  return s
}

export type Puntos = Readonly<Partial<Record<IdDeSolucion, number>>>

export interface Opcion {
  readonly texto: string
  readonly puntos: Puntos
  /** La frase para el análisis (`dolor`, `deseo` u `objetivo`, según la pregunta). */
  readonly frase: string
}

export interface Pregunta {
  /** El rótulo del paso en el indicador. */
  readonly paso: string
  readonly texto: string
  readonly opciones: readonly Opcion[]
}

export const PREGUNTAS: readonly [Pregunta, Pregunta, Pregunta] = [
  {
    paso: 'El problema',
    texto: '¿Qué es lo que más te cuesta hoy?',
    opciones: [
      { texto: 'La gente no me encuentra en internet', puntos: { pagina: 3, chatbot: 1 }, frase: 'hoy a tu negocio le cuesta que lo encuentren' },
      { texto: 'Vendo, pero solo por mensaje o en persona', puntos: { tienda: 3, chatbot: 1 }, frase: 'hoy vendés, pero todo pasa por mensajes o en persona' },
      { texto: 'No llego a contestar todos los mensajes', puntos: { chatbot: 3, automatizacion: 1 }, frase: 'hoy se te escapan consultas porque no llegás a contestar todo' },
      { texto: 'Tengo todo desordenado: planillas, papeles, cuadernos', puntos: { gestion: 3, automatizacion: 1 }, frase: 'hoy la información de tu negocio está repartida en planillas y papeles' },
      { texto: 'Pierdo horas en tareas que se repiten', puntos: { automatizacion: 3, gestion: 1 }, frase: 'hoy se te van horas en tareas que se repiten' },
    ],
  },
  {
    paso: 'La solución',
    texto: '¿Qué creés que le vendría mejor a tu negocio?',
    opciones: [
      { texto: 'Verse más profesional y tener más visibilidad', puntos: { pagina: 2, tienda: 1 }, frase: 'verte más profesional y que te vean más' },
      { texto: 'Vender sin estar pendiente todo el día', puntos: { tienda: 2, chatbot: 1 }, frase: 'vender sin estar pendiente todo el día' },
      { texto: 'Atender a cualquier hora', puntos: { chatbot: 2, automatizacion: 1 }, frase: 'atender a cualquier hora' },
      { texto: 'Tener todo en un solo lugar', puntos: { gestion: 2, pagina: 1 }, frase: 'tener todo en un solo lugar' },
      { texto: 'Que lo repetitivo se haga solo', puntos: { automatizacion: 2, gestion: 1 }, frase: 'que lo repetitivo se haga solo' },
    ],
  },
  {
    paso: 'El objetivo',
    texto: '¿Cuál es el próximo objetivo de tu negocio?',
    opciones: [
      { texto: 'Llegar a más clientes', puntos: { pagina: 1, tienda: 1, chatbot: 1 }, frase: 'llegar a más clientes' },
      { texto: 'Vender más', puntos: { tienda: 2, chatbot: 1 }, frase: 'vender más' },
      { texto: 'Ahorrar tiempo y plata', puntos: { automatizacion: 2, gestion: 1 }, frase: 'ahorrar tiempo y plata' },
      { texto: 'Crecer sin perder el control', puntos: { gestion: 2, automatizacion: 1 }, frase: 'crecer sin perder el control' },
      { texto: 'Dar una mejor atención', puntos: { chatbot: 2, pagina: 1 }, frase: 'dar una mejor atención' },
    ],
  },
]

/** Las tres respuestas: el índice de la opción elegida en cada pregunta. */
export type Respuestas = readonly [number, number, number]

/** Todas las combinaciones (5 × 5 × 5 = 125), en orden. */
export function todasLasRespuestas(): readonly Respuestas[] {
  const [p1, p2, p3] = PREGUNTAS
  return p1.opciones.flatMap((_a, a) => p2.opciones.flatMap((_b, b) => p3.opciones.map((_c, c): Respuestas => [a, b, c])))
}

function opcionDe(pregunta: number, r: Respuestas): Opcion {
  const o = PREGUNTAS[pregunta]?.opciones[r[pregunta] ?? -1]
  if (o === undefined) throw new Error(`respuesta fuera de rango en la pregunta ${String(pregunta + 1)}`)
  return o
}

/** Lo que sumó cada solución con estas respuestas. */
export function puntajes(r: Respuestas): Readonly<Record<IdDeSolucion, number>> {
  const total: Record<IdDeSolucion, number> = { pagina: 0, tienda: 0, gestion: 0, chatbot: 0, automatizacion: 0 }
  for (let i = 0; i < PREGUNTAS.length; i++) for (const id of IDS_DE_SOLUCION) total[id] += opcionDe(i, r).puntos[id] ?? 0
  return total
}

/** Las cinco soluciones en el orden de la recomendación: total, después lo sumado en la pregunta 1, después la tabla. */
export function ordenDeLasSoluciones(r: Respuestas): readonly IdDeSolucion[] {
  const total = puntajes(r)
  const primera = opcionDe(0, r).puntos
  return [...IDS_DE_SOLUCION].sort((x, y) => total[y] - total[x] || (primera[y] ?? 0) - (primera[x] ?? 0) || IDS_DE_SOLUCION.indexOf(x) - IDS_DE_SOLUCION.indexOf(y))
}

export interface Recomendacion {
  readonly a: IdDeSolucion
  readonly b: IdDeSolucion
}

export function recomendar(r: Respuestas): Recomendacion {
  const [a, b] = ordenDeLasSoluciones(r)
  if (a === undefined || b === undefined) throw new Error('el recomendador necesita dos soluciones')
  return { a, b }
}

/** La primera letra en minúscula (no toda la frase: «IA» sigue siendo «IA»). */
export const enMinuscula = (t: string): string => t.charAt(0).toLocaleLowerCase('es') + t.slice(1)

/** El análisis, armado con las frases (05-TEXTOS, «El resultado»). */
export function analisis(r: Respuestas, rec: Recomendacion = recomendar(r)): string {
  const a = solucion(rec.a)
  const b = solucion(rec.b)
  return `Por lo que contaste, ${opcionDe(0, r).frase}, y lo que buscás es ${opcionDe(1, r).frase}. Para ${opcionDe(2, r).frase}, lo que más sentido tiene es ${enMinuscula(a.nombre)}: ${a.porQue} Como complemento, ${enMinuscula(b.nombre)} ${b.complemento}`
}

/** El mensaje precargado del contacto (editable). Las opciones van con la primera letra en minúscula: siguen a dos puntos. */
export function mensajeDelContacto(r: Respuestas, elegida: IdDeSolucion): string {
  return `Hice el recomendador y me salió ${enMinuscula(solucion(elegida).nombre)}. Me cuesta: ${enMinuscula(opcionDe(0, r).texto)}. Me vendría bien: ${enMinuscula(opcionDe(1, r).texto)}. Mi objetivo: ${enMinuscula(opcionDe(2, r).texto)}.`
}

export const tituloDelContacto = (id: IdDeSolucion): string => `Hablemos de ${enMinuscula(solucion(id).nombre)}`

/** El servicio, como va en la frase del link (la tabla de soluciones de 05-TEXTOS). */
export const SERVICIO_EN_LA_FRASE: Readonly<Record<IdDeServicio, string>> = { web: 'desarrollo web', software: 'software a medida', 'ia-automatizacion': 'IA y automatizaciones' }

export const rotuloDeLaPagina = (servicio: IdDeServicio): string => `Ver la página de ${SERVICIO_EN_LA_FRASE[servicio]}`

/** Los textos fijos (05-TEXTOS, «El recomendador»). `faltaElegir` no está en 05-TEXTOS: corto, en la voz del sitio. */
export const TEXTOS_DEL_RECOMENDADOR = {
  titulo: '¿No sabés qué necesita tu negocio?',
  parrafos: [
    'Respondé tres preguntas, tocando nomás. Cruzamos lo que hoy te cuesta, lo que te gustaría tener y hacia dónde querés ir, y te decimos qué te conviene y por qué.',
    'Tarda menos de un minuto y no te pedimos nada a cambio. Si te cierra lo que te recomendamos, nos escribís desde ahí mismo.',
  ],
  siguiente: 'Siguiente',
  atras: 'Atrás',
  ver: 'Ver mi recomendación',
  faltaElegir: 'Elegí una opción para seguir.',
  procesando: ['Leyendo tus respuestas…', 'Cruzando lo que te cuesta con lo que buscás…', 'Armando tu recomendación…'],
  resultado: '¡Listo! Esto es lo que vemos en tu negocio.',
  elegi: 'Elegí la que más te cierre.',
  empezarDeNuevo: 'Empezar de nuevo',
  /** El rótulo del campo del mensaje (05-TEXTOS: «los campos Nombre, Email o teléfono y Mensaje»). */
  mensaje: 'Mensaje',
} as const
