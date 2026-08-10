import type { ToolCallContext } from './types'
import { buildCaptureLeadTool } from './captureLead'
import { buildOfferHandoffOptionsTool } from './offerHandoffOptions'
import { buildShowWhatsappHandoffTool } from './showWhatsappHandoff'
import { buildNavigateToPageTool } from './navigateToPage'
import { buildConfirmContactRequestTool } from './confirmContactRequest'

/**
 * Slug → builder de cada tool. El builder recibe el contexto y devuelve
 * la tool armada con su closure. Centraliza el catálogo así el filter de
 * B4.2 no se desincroniza con el set real disponible.
 */
const TOOL_BUILDERS = {
  capture_lead: (ctx: ToolCallContext) => buildCaptureLeadTool(ctx),
  offer_handoff_options: (_ctx: ToolCallContext) => buildOfferHandoffOptionsTool(),
  show_whatsapp_handoff: (ctx: ToolCallContext) => buildShowWhatsappHandoffTool(ctx),
  navigate_to_page: (_ctx: ToolCallContext) => buildNavigateToPageTool(),
  // CONTACT-PATH — espejo server-side de `show_whatsapp_handoff` para el camino
  // "que me contacten". Su `execute` es lo que fuerza el step final: sin un tool
  // server-side ese camino cerraba sin texto (ver confirmContactRequest.ts).
  confirm_contact_request: (ctx: ToolCallContext) => buildConfirmContactRequestTool(ctx),
} as const

export type ToolSlug = keyof typeof TOOL_BUILDERS

/** Lista canónica de slugs disponibles (en orden de declaración). */
export const ALL_TOOL_SLUGS: readonly ToolSlug[] = Object.keys(
  TOOL_BUILDERS,
) as ToolSlug[]

/**
 * BLOQUE VOZ — tools que renderizan una TARJETA en el widget del visitante
 * (ver renderToolCall.tsx). Las CLAVES son el set canónico de "tools
 * cardeadas"; el VALOR es el texto neutral que el transform de respuesta
 * vacía inyecta cuando el run cierra en esa tarjeta sin texto del modelo:
 * la tarjeta ES la respuesta, así que el texto conecta con lo que se ve
 * abajo en vez de disculparse. La mecánica vive en reconcile.ts §3; acá
 * vive SOLO el catálogo.
 *
 * ⚠️ Este mapa vive AL LADO de TOOL_BUILDERS a propósito: si agregás un
 * tool que renderiza tarjeta y no lo sumás acá, el visitante vuelve a ver
 * la disculpa ("Se me complicó generar una respuesta...") pegada a tu
 * tarjeta nueva — el bug del camino 6 del mapa de MUDEZ, de vuelta.
 *
 * `show_whatsapp_handoff` está aunque es server-side (tiene execute): si el
 * modelo no agrega texto en el step siguiente, su tarjeta también queda como
 * única respuesta visible y la situación es idéntica.
 */
export const CARD_RENDERING_TOOL_CONNECTORS: ReadonlyMap<ToolSlug, string> = new Map<
  ToolSlug,
  string
>([
  ['offer_handoff_options', 'Listo. Elegí abajo cómo preferís que sigamos.'],
  ['show_whatsapp_handoff', 'Listo, te dejo el acceso directo a WhatsApp.'],
  ['navigate_to_page', 'Te dejo el enlace acá abajo.'],
])

/**
 * C0.1 — tools restringidas al bot propio de develOP (contención, no el fix
 * definitivo).
 *
 * `navigate_to_page` tiene sus destinos hardcodeados a rutas del sitio de
 * develOP (`VALID_PATHS` en `navigateToPage.ts`). En el bot de un cliente el
 * resultado NO es un link roto: `widget.js` resuelve la navegación con
 * `window.open(BASE_URL + path, '_blank')`, donde `BASE_URL` sale del origin
 * del propio `<script src>` que sirve el widget (típicamente
 * develop.com.ar). O sea: el bot de un cliente le abre a SU visitante una
 * pestaña nueva con una página de VENTAS de develOP — es fuga de tráfico del
 * cliente hacia la agencia, no un 404.
 *
 * El fix definitivo es `BotConfig.allowedNavigationPaths` (requiere
 * migración, ver header de `navigateToPage.ts`) — hasta que exista, estas
 * tools quedan restringidas al único bot propio conocido hoy.
 *
 * Por qué lista + helper y no un `if` con el slug inline: un slug suelto en
 * medio del loop falla en silencio si mañana se renombra el bot o aparece un
 * segundo bot propio de develOP. Con el helper nombrado, el día que
 * `allowedNavigationPaths` exista, esta lista se vacía y `isAgencyOwnedBot`
 * se borra — el punto de salida de esta contención queda evidente en vez de
 * enterrado en un condicional.
 */
export const TOOLS_RESTRICTED_TO_AGENCY_BOT: readonly ToolSlug[] = ['navigate_to_page']

/**
 * Único bot propio de develOP hoy. Mismo idiom de comparación de slug que ya
 * usa el resto del repo para esta distinción (`convert-chatbot-lead.actions.ts`,
 * `ChatWidgetMount.tsx`) — no existe un helper compartido de "org/bot
 * agencia" en el runtime; este vive local a este gate.
 */
const AGENCY_BOT_SLUG = 'develop'

/** true si `botSlug` es el bot propio de develOP. */
export function isAgencyOwnedBot(botSlug: string): boolean {
  return botSlug === AGENCY_BOT_SLUG
}

/**
 * Returns the tool set bound to the given conversation context.
 *
 * Si se pasa `enabledTools`, sólo devuelve las que matchean Y existen
 * en el catálogo. Slugs desconocidos en `enabledTools` se ignoran
 * silenciosamente (cero crash). Si no se pasa o es `null`, devuelve
 * el set completo (comportamiento pre-B4.2).
 *
 * B4.2 — gating de tools por plan:
 *   const plan = await getPlanForOrg(orgId)
 *   const tools = getTools(ctx, plan.tools)  // ← filtra por slugs del plan
 */
export function getTools(
  ctx: ToolCallContext,
  enabledTools: readonly string[] | null = null,
) {
  const allow: ReadonlySet<string> | null =
    enabledTools === null ? null : new Set(enabledTools)

  const result: Partial<Record<ToolSlug, ReturnType<(typeof TOOL_BUILDERS)[ToolSlug]>>> = {}

  for (const slug of ALL_TOOL_SLUGS) {
    if (allow !== null && !allow.has(slug)) continue
    // C0.1 — ver TOOLS_RESTRICTED_TO_AGENCY_BOT arriba.
    if (TOOLS_RESTRICTED_TO_AGENCY_BOT.includes(slug) && !isAgencyOwnedBot(ctx.botSlug)) continue
    result[slug] = TOOL_BUILDERS[slug](ctx)
  }

  return result
}

/**
 * Type of the tool record returned by getTools.
 * Useful for typing the API route handler.
 */
export type ChatbotTools = ReturnType<typeof getTools>
