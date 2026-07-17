/**
 * B2-S1 — Perfil de tools por canal.
 *
 * El pipeline de generación del bot corre por dos canales:
 *   - `web`  → el widget del sitio (streaming al navegador).
 *   - `sync` → el consumo interno del Motor WhatsApp (una llamada, texto completo).
 *
 * De las 4 tools del catálogo, tres son UI del WIDGET: `offer_handoff_options`,
 * `navigate_to_page` y `show_whatsapp_handoff` emiten tool-calls que el cliente
 * renderiza (tarjetas / navegación). Sin un cliente que las pinte no tienen
 * sentido, así que en el canal `sync` NI SE REGISTRAN. Solo `capture_lead`
 * (server-side, persiste el lead) corre en ambos canales.
 *
 * El perfil es un parámetro del núcleo: el canal decide el SET de slugs
 * candidatos ANTES del gating por plan; el plan lo recorta después (getTools).
 */
import { ALL_TOOL_SLUGS, type ToolSlug } from '../tools'

/** Canal por el que corre el pipeline de generación del bot. */
export type ChatChannel = 'web' | 'sync'

/**
 * Perfil de tools por canal: qué herramientas del catálogo tienen sentido en
 * ese canal, con independencia del plan.
 *   - `web`  → las 4 (capture_lead + las 3 client-side del widget).
 *   - `sync` → solo `capture_lead` (las otras 3 son UI del widget).
 */
export const CHANNEL_TOOL_PROFILES: Record<ChatChannel, readonly ToolSlug[]> = {
  web: ALL_TOOL_SLUGS,
  sync: ['capture_lead'],
}

/**
 * Slugs efectivos para (canal, plan): intersección del perfil del canal con lo
 * que el plan habilita. El ORDEN y el armado final los fija `getTools`
 * (recorre ALL_TOOL_SLUGS) — acá solo se decide el SET.
 *
 * Para `web` el perfil es el catálogo completo, así que el resultado es
 * `plan.tools ∩ catálogo`. `getTools` ya ignora slugs desconocidos del plan,
 * de modo que el set efectivo de tools del widget es EXACTAMENTE el de hoy:
 * este filtro no cambia el comportamiento del canal web.
 */
export function resolveChannelToolSlugs(
  channel: ChatChannel,
  planTools: readonly string[],
): string[] {
  const channelAllowed = new Set<string>(CHANNEL_TOOL_PROFILES[channel])
  return planTools.filter((slug) => channelAllowed.has(slug))
}
