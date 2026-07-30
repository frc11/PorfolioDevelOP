/**
 * DEADLINE-ONFINISH — Techo de tiempo a nivel JavaScript para las operaciones
 * async que bloquean el cierre del stream del chatbot.
 *
 * POR QUE NO ALCANZAN LAS OPCIONES DE PRISMA
 * Prisma ya trae defaults (tx interactiva `timeout: 5000` / `maxWait: 2000`,
 * `pool_timeout: 10s`). Si alguno hubiera disparado en prod veriamos `P2028` o
 * `P2024`. No hay codigo de error → el cuelgue esta POR DEBAJO de la capa donde
 * Prisma mide: socket TCP muerto esperando un read que no vuelve, o contencion
 * de lock en Postgres (`lock_timeout = 0` por defecto = espera infinita).
 * Ninguna opcion de configuracion corta ninguno de los dos casos; el unico
 * deadline que si los corta es este: `Promise.race` contra un timer.
 *
 * LIMITE ESTRUCTURAL — ABANDONA, NO CANCELA
 * Prisma 6 no acepta `AbortSignal` por query: cuando el deadline vence, la
 * operacion SIGUE VIVA y puede commitear despues. Dos consecuencias que el
 * llamador tiene que asumir:
 *   1. Un "deadline vencido" significa DESENLACE DESCONOCIDO, no "perdido con
 *      certeza". Para eso existe `onLateSettle`: si la operacion abandonada
 *      resuelve mas tarde, lo reporta (es el discriminador socket-vs-lock —
 *      commit tardio = conexion viva pero lenta; silencio = socket muerto).
 *   2. La operacion abandonada RETIENE su conexion del pool por el resto de la
 *      vida del contenedor. Ver el riesgo de envenenamiento progresivo del pool
 *      documentado en la bitacora: cada abandono cuesta una conexion, y por eso
 *      el bucle de persistencia NO reintenta ante deadline (solo ante error
 *      real) — un reintento retendria una segunda.
 *
 * Cero dependencias nuevas, cero `any`.
 */

/**
 * Error de deadline vencido. Es DISTINGUIBLE del error propio de la operacion
 * (via `isDeadlineExceeded`) porque el llamador decide distinto segun cual sea:
 * un error real de Prisma es transitorio y se reintenta; un deadline es un
 * cuelgue abandonado y NO se reintenta.
 */
export class DeadlineExceededError extends Error {
  readonly label: string
  readonly ms: number

  constructor(label: string, ms: number) {
    super(`Deadline de ${ms}ms excedido en "${label}"`)
    this.name = 'DeadlineExceededError'
    this.label = label
    this.ms = ms
  }
}

/** Type guard: ¿el error es un deadline vencido y no un fallo de la operacion? */
export function isDeadlineExceeded(error: unknown): error is DeadlineExceededError {
  return error instanceof DeadlineExceededError
}

/** Metadatos del settlement tardio de una operacion ya abandonada. Nunca lleva el valor. */
export interface LateSettleInfo {
  /** El `label` con el que se llamo a `withDeadline`. */
  label: string
  /** Deadline que se le habia dado (ms). */
  deadlineMs: number
  /** Cuanto tardo realmente en settlear, desde el arranque de `withDeadline`. */
  elapsedMs: number
  settled: 'fulfilled' | 'rejected'
}

export interface WithDeadlineOptions {
  /**
   * Se invoca SOLO si la operacion settlea DESPUES de que el deadline ya vencio.
   * Es el discriminador socket-vs-lock del sprint. Caveat operativo: en Netlify
   * el contenedor puede congelarse al cerrar la respuesta, asi que la AUSENCIA
   * de este log no prueba nada; su PRESENCIA si es concluyente.
   */
  onLateSettle?: (info: LateSettleInfo) => void
}

/**
 * Resuelve con el valor de `operation` si llega antes de `ms`; rechaza con
 * `DeadlineExceededError` si vence.
 *
 * `ms <= 0` rechaza inmediato sin esperar (presupuesto agotado). Aun asi
 * reporta el settlement tardio: la operacion ya estaba arrancada.
 */
export async function withDeadline<T>(
  operation: Promise<T>,
  ms: number,
  label: string,
  options?: WithDeadlineOptions,
): Promise<T> {
  const startedAt = Date.now()
  let abandoned = false

  // Handler que queda attacheado SIEMPRE, pase lo que pase con la carrera.
  // Es OBLIGATORIO, no opcional: sin un rejection handler propio, el rechazo
  // tardio de una operacion abandonada es un unhandled rejection y Node (>=15,
  // default `--unhandled-rejections=throw`) mata el proceso. Sin esto el helper
  // empeoraria el problema en vez de arreglarlo.
  // La promesa derivada de este `.then` siempre queda cumplida (ninguna de las
  // dos ramas relanza), asi que no introduce un rechazo nuevo.
  const reportLate = (settled: 'fulfilled' | 'rejected'): void => {
    if (!abandoned) return
    options?.onLateSettle?.({
      label,
      deadlineMs: ms,
      elapsedMs: Date.now() - startedAt,
      settled,
    })
  }
  void operation.then(
    () => reportLate('fulfilled'),
    () => reportLate('rejected'),
  )

  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    if (ms <= 0) throw new DeadlineExceededError(label, ms)
    return await Promise.race([
      operation,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new DeadlineExceededError(label, ms)), ms)
      }),
    ])
  } catch (error) {
    // Solo se marca abandonada si gano el TIMER. Si la operacion perdio la
    // carrera rechazando por su cuenta, ya settleo: no hay nada que abandonar
    // y su error se propaga tal cual (el llamador lo distingue con
    // `isDeadlineExceeded`). El orden es seguro: este catch corre en el mismo
    // microtask en que el race rechazo, siempre antes de cualquier settlement
    // posterior de `operation`.
    if (isDeadlineExceeded(error)) abandoned = true
    throw error
  } finally {
    // Sin esto la funcion serverless queda viva esperando un timer huerfano.
    if (timer !== undefined) clearTimeout(timer)
  }
}

/**
 * Presupuesto global de tiempo compartido por varias operaciones en cadena, para
 * que el techo total se respete aunque cada una tenga su propio deadline.
 */
export interface Budget {
  /** Presupuesto total con el que se creo (ms, nunca negativo). */
  readonly totalMs: number
  /** Tiempo transcurrido desde la creacion. */
  elapsedMs(): number
  /** Remanente del presupuesto (nunca negativo). */
  remainingMs(): number
  /**
   * ¿Queda lugar para una operacion de `ms`? Consultar ANTES de crear la
   * promesa: arrancar una query para abandonarla al instante cuesta una
   * conexion del pool a cambio de nada.
   */
  hasRoomFor(ms: number): boolean
  /** El deadline efectivo de una operacion: su presupuesto, techado al remanente. */
  clamp(ms: number): number
}

export function createBudget(totalMs: number): Budget {
  const startedAt = Date.now()
  const total = Math.max(0, totalMs)
  const remainingMs = (): number => Math.max(0, total - (Date.now() - startedAt))
  return {
    totalMs: total,
    elapsedMs: () => Date.now() - startedAt,
    remainingMs,
    hasRoomFor: (ms) => remainingMs() >= ms,
    clamp: (ms) => Math.max(0, Math.min(ms, remainingMs())),
  }
}
