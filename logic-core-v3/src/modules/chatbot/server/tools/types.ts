import type { z } from 'zod'

/**
 * Context passed to tools that need to perform side effects
 * (DB writes, notifications, etc.).
 *
 * Built per-request in the API route, before invoking streamText().
 */
export interface ToolCallContext {
  conversationId: string
  botConfigId: string
  organizationId: string
  /**
   * EV.3 — Clave del pack vertical del bot (`BotConfig.verticalPack`). Determina
   * la tabla de scoring que usa `capture_lead`. Se resuelve con `getVerticalPack()`
   * (clave desconocida → `base` con warning). Si está ausente en el contexto,
   * captureLead resuelve con `'base'` (el default de la columna).
   *
   * OJO (paridad): la columna `verticalPack` tiene default `'base'`. Un bot que
   * deba puntuar como concesionaria necesita `verticalPack='usados'` explícito
   * (lo setea el seed de EV.2 / un backfill); si quedó en `'base'`, puntúa con la
   * tabla `base`, distinta de la histórica `usados`.
   */
  verticalPack?: string
  /**
   * Optional metadata for richer logging / lead enrichment.
   */
  visitorIpHash?: string
  visitorUserAgent?: string
  /**
   * UTM.1 — Atribución de primer contacto, copiada desde Conversation
   * (resuelta una sola vez en getOrCreateConversation, ver resolver.ts).
   * `undefined` = sin atribución (tráfico directo) — captureLead debe
   * persistir eso como `null`, nunca inventar un placeholder.
   */
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

/**
 * Generic shape of a tool's `execute` result.
 * Tools should return structured data the LLM can reason about.
 */
export interface ToolExecuteResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Result of capture_lead.execute().
 */
export interface CaptureLeadResult {
  leadId: string
  alreadyCaptured: boolean  // true if a lead already existed for this conversation
}

/**
 * Util: infer the input type of a Zod schema for a tool.
 */
export type InferToolInput<Schema extends z.ZodTypeAny> = z.infer<Schema>
