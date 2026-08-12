import { tool } from 'ai'
import { z } from 'zod'

/**
 * Tool `navigate_to_page` — CLIENT-SIDE.
 *
 * MVP: hardcoded list of valid paths (develOP site).
 * Phase 1.5: paths come from BotConfig.allowedNavigationPaths per org.
 * See README "Deferred Decisions" for context.
 *
 * The `z.enum` prevents the LLM from inventing routes ("/precios-secretos"
 * would fail validation, model receives the error and self-corrects).
 *
 * C0.1 — VALID_PATHS son rutas del sitio de develOP. En el bot de un cliente
 * esto NO produce un 404: el embed (`public/widget.js`) resuelve la
 * navegación con `window.open(BASE_URL + path, '_blank')`, donde `BASE_URL`
 * sale del origin del script que sirve el widget (típicamente
 * develop.com.ar) — el resultado es una pestaña nueva con una página de
 * VENTAS de develOP abierta desde el sitio del cliente. Fuga de tráfico, no
 * un link roto. Hasta que exista `BotConfig.allowedNavigationPaths` (Phase
 * 1.5, arriba), este tool queda restringido al bot propio de develOP — ver
 * `TOOLS_RESTRICTED_TO_AGENCY_BOT` en `getTools.ts`.
 */

export const VALID_PATHS = [
  '/web-development',
  '/ai-implementations',
  '/process-automation',
  '/software-development',
  '/#nosotros',
  '/#portfolio',
  '/process-automation#calculadora',
  '/#servicios',
] as const

export type ValidPath = (typeof VALID_PATHS)[number]

export const navigateToPageInputSchema = z.object({
  path: z.enum(VALID_PATHS).describe('Ruta válida a la que navegar dentro del sitio'),
  reason: z.string().min(10).max(200).describe(
    'Mensaje breve para el usuario explicando qué va a ver. Ej: "Te llevo a la sección de IA, ahí están los casos reales y el comparativo de costos."'
  ),
})

export type NavigateToPageInput = z.infer<typeof navigateToPageInputSchema>

export const NAVIGATE_TO_PAGE_DESCRIPTION = `Navega al usuario a una sección específica del sitio para mostrarle más información visual.

USAR: cuando el usuario pregunta por algo cubierto en otra página (ej: precios de un servicio, ver casos de éxito, calcular ROI).

NO USAR: para responder preguntas que se pueden contestar en texto. No usar para rutas no listadas.

Rutas válidas:
- "/web-development" — página del servicio Web Development
- "/ai-implementations" — página del servicio IA
- "/process-automation" — página del servicio Automatizaciones
- "/software-development" — página del servicio Software a medida
- "/#nosotros" — sección "Nosotros" en home
- "/#portfolio" — sección Portfolio en home
- "/process-automation#calculadora" — calculadora de ahorro en la landing de Automatizaciones
- "/#servicios" — overview de servicios en home`

export function buildNavigateToPageTool() {
  return tool({
    description: NAVIGATE_TO_PAGE_DESCRIPTION,
    inputSchema: navigateToPageInputSchema,
    // No execute — client-side tool.
  })
}
