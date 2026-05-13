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
   * Optional metadata for richer logging / lead enrichment.
   */
  visitorIpHash?: string
  visitorUserAgent?: string
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
