/**
 * WATCHDOG-2 — suspensión del watchdog durante la ejecución de tools.
 *
 * Mientras `capture_lead`/`show_whatsapp_handoff` corren su `execute()` (DB a
 * Neon, potencialmente fría), NO fluye ningún chunk por el body: sin pausar
 * el watchdog, cortaría la respuesta a mitad de la captura del lead — el
 * momento comercialmente más valioso del producto.
 *
 * CONTADOR, no booleano: el SDK corre las tool calls de un mismo step en
 * paralelo (`Promise.all`, `ai/dist/index.js:7525-7548`). Con un booleano, el
 * primer tool que termina reanudaría el watchdog mientras el segundo sigue
 * en Neon — y ahí sí se corta. Se suspende SOLO en la transición 0→1 y se
 * reanuda SOLO en la transición →0.
 *
 * MS-E6.2 (costura B) — movido VERBATIM desde `handleChatRequest.ts`, donde
 * eran cuatro variables sueltas del scope del request. Cero cambio de
 * comportamiento: misma lógica, mismo orden, mismos números.
 *
 * ESTADO POR REQUEST: los cuatro contadores viven en el closure de este
 * factory, que el handler instancia UNA vez por request. Nunca a nivel de
 * módulo — en serverless un contenedor caliente atiende muchos requests con el
 * mismo módulo cargado, y un contador compartido suspendería el watchdog de una
 * conversación por el tool de otra. Mismo patrón que `createStreamWatchdog`,
 * `createChunkTally` y `createStreamProbe`.
 */
import type { StreamProbe } from './streamProbe'
import type { StreamWatchdogController } from './streamWatchdog'

export interface ToolSuspensionSnapshot {
  toolsInFlight: number
  /** Incluye la suspensión todavía ABIERTA en este instante, si la hay. */
  suspendedMsTotal: number
}

export interface ToolSuspensionController {
  /** Cablear a `experimental_onToolCallStart`. */
  onToolCallStart(): void
  /** Cablear a `experimental_onToolCallFinish` (corre en éxito Y en error). */
  onToolCallFinish(): void
  /** Suelta el timer del techo de seguridad. Idempotente. */
  clearToolMaxTimer(): void
  /** Contadores para `chat.watchdog_fired`. */
  snapshot(): ToolSuspensionSnapshot
}

export interface ToolSuspensionOptions {
  /**
   * Holder del controller del watchdog. Es mutable porque el watchdog recién
   * existe DESPUÉS de que `streamText(...)` retorna, pero estos callbacks se
   * pasan como parte de su config antes de eso.
   */
  watchdogRef: { current: StreamWatchdogController | null }
  probe: StreamProbe
  /** Techo de seguridad ante un tool que ni falla ni resuelve. */
  toolMaxMs: number
}

export function createToolSuspensionController({
  watchdogRef,
  probe,
  toolMaxMs,
}: ToolSuspensionOptions): ToolSuspensionController {
  let toolsInFlight = 0
  let suspendedSinceAt: number | null = null
  let suspendedMsTotal = 0
  let toolMaxTimer: ReturnType<typeof setTimeout> | undefined

  const clearToolMaxTimer = (): void => {
    if (toolMaxTimer !== undefined) {
      clearTimeout(toolMaxTimer)
      toolMaxTimer = undefined
    }
  }

  return {
    clearToolMaxTimer,

    onToolCallStart: (): void => {
      toolsInFlight += 1
      if (toolsInFlight !== 1) return // ya había otro tool en vuelo: no re-suspender
      suspendedSinceAt = Date.now()
      watchdogRef.current?.suspend()
      // Techo de seguridad: un tool colgado no puede dejar el watchdog suspendido
      // para siempre — sería reintroducir el mismo cuelgue de 30s que este sprint
      // entero viene arreglando. NO toca `toolsInFlight`: si el tool eventualmente
      // termina, `onToolCallFinish` corre igual (ver abajo) — solo que a esta
      // altura resumir es un no-op (ya se resumió acá).
      toolMaxTimer = setTimeout(() => {
        probe.mark('watchdog_tool_max_forced', { toolsInFlight })
        watchdogRef.current?.resume()
      }, toolMaxMs)
    },

    onToolCallFinish: (): void => {
      // Piso en 0: una llamada de más (no debería pasar, pero es defensivo) nunca
      // deja el contador negativo, que rompería la próxima transición 0→1.
      toolsInFlight = Math.max(0, toolsInFlight - 1)
      if (toolsInFlight !== 0) return
      clearToolMaxTimer()
      if (suspendedSinceAt !== null) {
        suspendedMsTotal += Date.now() - suspendedSinceAt
        suspendedSinceAt = null
      }
      watchdogRef.current?.resume()
    },

    snapshot: (): ToolSuspensionSnapshot => ({
      toolsInFlight,
      // WATCHDOG-2 — si el disparo ocurrió con tools en vuelo, solo puede ser
      // porque el techo de seguridad forzó el resume de un tool que ni falló ni
      // resolvió (colgado de verdad) — la suspensión normal bloquea por completo
      // el timer, así que en el camino sano `toolsInFlight` acá siempre es 0.
      // Se suma cualquier suspensión todavía abierta en este instante.
      suspendedMsTotal:
        suspendedMsTotal + (suspendedSinceAt !== null ? Date.now() - suspendedSinceAt : 0),
    }),
  }
}
