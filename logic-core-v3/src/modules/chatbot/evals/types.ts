/**
 * Q1.1 — Tipos y schemas del corredor de conversaciones doradas.
 *
 * `Scenario` / `Expectations` describen el ARCHIVO DE DATOS (`scenarios/*.json`).
 * `Captured*` / `RunResult` describen lo que el corredor VUELCA a
 * `results/<timestamp>.json`.
 *
 * Regla de este bloque: las `expectations` se TRANSPORTAN tal cual al output,
 * NO se evalúan. El scoring contra ellas es Q1.2.
 */
import { z } from 'zod'

// ─── Escenario dorado (archivo de datos) ────────────────────────────────────

export const PACK_KEYS = ['base', 'usados', 'agencia'] as const

/**
 * Campos que Q1.2 consumirá para puntuar. El corredor NO los mira: los copia
 * verbatim al resultado. `.strict()` para que un typo en el JSON falle fuerte.
 */
export const EXPECTATIONS_SCHEMA = z
  .object({
    /** Se espera que el bot capture un lead (tool `capture_lead`). */
    shouldCaptureLead: z.boolean().optional(),
    /** Se espera derivación a humano (`offer_handoff_options`/`show_whatsapp_handoff`). */
    shouldHandoff: z.boolean().optional(),
    /** Clave de intent esperada (vocabulario de `detectIntent` del pack). Best-effort. */
    expectedIntent: z.string().optional(),
    /** Afirmaciones que el bot NO debe hacer (no inventar / no filtrar prompt). */
    mustNotClaim: z.array(z.string()).optional(),
    /** Notas de tono para la revisión humana / Q1.2. */
    toneNotes: z.string().optional(),
  })
  .strict()

export const SCENARIO_SCHEMA = z
  .object({
    id: z.string().min(1),
    pack: z.enum(PACK_KEYS),
    description: z.string().min(1),
    /** Mensajes del visitante en orden (role `user`). */
    turns: z.array(z.string().min(1)).min(1).max(20),
    expectations: EXPECTATIONS_SCHEMA,
  })
  .strict()

export const SCENARIOS_FILE_SCHEMA = z.array(SCENARIO_SCHEMA)

export type Expectations = z.infer<typeof EXPECTATIONS_SCHEMA>
export type Scenario = z.infer<typeof SCENARIO_SCHEMA>

// ─── Captura (output del corredor) ──────────────────────────────────────────

/** Una tool emitida por el bot, con sus argumentos (canónico, desde DB). */
export interface ToolCallRecord {
  toolName: string
  input: Record<string, unknown>
}

/** Respuesta degradada del server (JSON, no stream): quota/dominio. */
export interface DegradedPayload {
  mode: 'degraded'
  reason: string
  message: string
  ctaWhatsapp: boolean | null
  whatsappNumber: string | null
  whatsappMessage: string | null
  companyName: string | null
}

export interface CapturedTurn {
  turnIndex: number
  userMessage: string
  httpStatus: number
  contentType: string
  latencyMs: number
  /** Texto del assistant — canónico desde la fila persistida (`ChatMessage.content`). */
  assistantText: string
  /** Tools emitidas con `input` — canónico desde `ChatMessage.toolCalls`. */
  toolCalls: ToolCallRecord[]
  /** Texto reconstruido del wire (SSE) — secundario, para inspección. */
  wireText: string
  /** Intent reconstruido offline (mismo `detectIntent` del server). NO viaja en el wire. */
  intentDetectedOffline: string | null
  /** Payload si el server respondió en modo degradado (sin LLM). */
  degraded: DegradedPayload | null
  /** Error técnico del turno (timeout de persistencia, HTTP no-2xx, etc.). */
  error: string | null
}

/** Snapshot del lead capturado (si lo hubo). Subconjunto de `ChatbotLead`. */
export interface LeadSnapshot {
  name: string | null
  email: string | null
  phone: string | null
  intent: string | null
  category: string
  requestedAppointment: boolean
  mentionedFinancing: boolean
  mentionedTradeIn: boolean
  askedSpecificModel: boolean
  providedPhone: boolean
  providedEmail: boolean
  score: number | null
  classification: string | null
}

export interface CapturedScenario {
  id: string
  pack: string
  description: string
  /** Copiadas verbatim del escenario. NO evaluadas por este bloque. */
  expectations: Expectations
  sessionId: string
  conversationId: string | null
  turns: CapturedTurn[]
  leadSnapshot: LeadSnapshot | null
  error: string | null
}

export interface RunMeta {
  startedAt: string
  finishedAt: string
  baseUrl: string
  origin: string
  wallMs: number
  scenarioCount: number
  turnCount: number
  keep: boolean
  packsRun: string[]
  bots: Record<
    string,
    { slug: string; botConfigId: string; verticalPack: string; planKey: string; quota: number }
  >
}

export interface RunResult {
  meta: RunMeta
  scenarios: CapturedScenario[]
}
