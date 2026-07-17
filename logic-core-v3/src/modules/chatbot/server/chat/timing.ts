/**
 * B2-S1 — Grabador de timings del pipeline de chat, extraído de
 * `handleChatRequest` para que el núcleo de generación (`core.ts`) y la cáscara
 * web lo compartan sin duplicar el patrón de marcas.
 *
 * Antes vivía como tres variables sueltas dentro de `handleChatRequest`
 * (`startTime` / `timings` / `stepStart` + un closure `mark`). Al mover la
 * llamada al provider al núcleo, esas marcas quedan a caballo entre la cáscara
 * (validación, resolución, gating) y el núcleo (intent, prompt, tools, LLM,
 * persistencia) — así que el estado del cursor tiene que viajar entre ambos.
 * Esta clase ES ese estado, con la MISMA semántica que el closure original:
 *
 *   - `mark(key)` mide desde la última marca y AVANZA el cursor.
 *   - `sinceCursor()` mide desde la última marca SIN avanzar (para timings
 *     intermedios como `quota_reserve_ms`, que el original asignaba con
 *     `Date.now() - stepStart` sin mover el cursor).
 *   - `setCursor(at)` reposiciona el cursor (el original hacía `stepStart = llmDoneAt`
 *     antes de medir `post_persist_ms`).
 *   - `timings` es el MISMO record mutable que se persiste en
 *     `metadata.timings` del evento `chat.message_completed`.
 *
 * El canal web crea el recorder al inicio del request y le hace sus marcas de
 * pre-LLM antes de entrar al núcleo; el canal sync crea uno fresco (sus timings
 * naturalmente no traen las marcas de la cáscara web — es otro canal).
 */
export class TimingRecorder {
  /** Record mutable persistido tal cual en metadata.timings. */
  readonly timings: Record<string, number | null> = {}
  /** Inicio del request (para `total_ms` y los deltas de LLM). */
  readonly startTime: number
  private cursor: number

  constructor(startTime: number) {
    this.startTime = startTime
    this.cursor = startTime
  }

  /** Mide desde la última marca y avanza el cursor. */
  mark(key: string): void {
    const now = Date.now()
    this.timings[key] = now - this.cursor
    this.cursor = now
  }

  /** ms desde la última marca, SIN avanzar el cursor (timings intermedios). */
  sinceCursor(): number {
    return Date.now() - this.cursor
  }

  /** Reposiciona el cursor (ej. anclar `post_persist_ms` al fin del stream LLM). */
  setCursor(at: number): void {
    this.cursor = at
  }
}
