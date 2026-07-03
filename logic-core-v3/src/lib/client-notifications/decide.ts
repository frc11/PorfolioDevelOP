/**
 * P2.A — Lógica PURA de decisión del aviso de lead al CLIENTE (dueño del negocio).
 *
 * Separada del envío a propósito: acá vive el "¿avisar? ¿destacado o normal?
 * ¿cap superado → digest?" sin tocar DB, Brevo ni la sesión. El orquestador
 * (`notify.ts`) hace los side effects y delega estas decisiones puras, así el
 * invariante (`client-notifications.invariant.ts`) las prueba sin server ni Neon.
 *
 * Diseño (gating por plan existente — `planAllows(plan, 'leadScoring')`):
 *  - TODOS los planes: aviso de "nuevo lead" (datos factuales, sin jerga).
 *  - Pro/Business (los que tienen la clasificación habilitada): el lead caliente
 *    dispara un aviso DESTACADO y el lenguaje de clasificación SOLO aparece ahí.
 */

// Espejo de `LeadScoreClassification` (scoring/calculateLeadScore.ts:86) y del
// enum `LeadClassification` de Prisma (schema.prisma:1502). Es un string union
// estable; se replica acá para que este módulo de decisión sea PURO — sin
// arrastrar el runtime de scoring/Prisma al invariante. Si cambian los valores
// del enum, actualizar esta línea en paralelo (mismo patrón que PLAN_FALLBACK).
export type LeadClassification = 'hot' | 'warm' | 'cold' | 'dq'

export type LeadEmailTemplate = 'hot' | 'normal'

export type NotifyDecision =
  | { notify: false; reason: 'disqualified' }
  | { notify: true; template: LeadEmailTemplate; bypassCap: boolean }

/**
 * ¿Avisar? ¿Con qué template? ¿Saltea el cap anti-spam?
 *
 *  - `dq` (spam / empleo / proveedor): NO se avisa. No es un lead comprador; no
 *    despertamos al dueño por basura. Es el único caso que no manda mail.
 *  - `hot` + plan con clasificación (Pro/Business): template "caliente",
 *    DESTACADO, y **saltea el cap** — un caliente siempre avisa: es el valor de
 *    pagar más.
 *  - resto (`warm`/`cold`, o `hot` en Starter): template "normal", factual,
 *    sujeto al cap. El lenguaje de clasificación NO aparece (solo el template
 *    "caliente" lo usa).
 */
export function decideLeadNotification(input: {
  classification: LeadClassification
  hasLeadScoring: boolean
}): NotifyDecision {
  if (input.classification === 'dq') {
    return { notify: false, reason: 'disqualified' }
  }
  if (input.classification === 'hot' && input.hasLeadScoring) {
    return { notify: true, template: 'hot', bypassCap: true }
  }
  return { notify: true, template: 'normal', bypassCap: false }
}

export type Delivery = 'individual' | 'digest' | 'suppress'

/**
 * Dada la decisión + el estado de los dos rate-limits, resuelve el MODO de
 * entrega. Puro: el caller corre los `checkRateLimit` y pasa los booleanos.
 *
 *  - `bypassCap` (caliente en Pro+): siempre `individual`.
 *  - normal con cupo del cap disponible: `individual`.
 *  - normal SIN cupo del cap, pero con cupo de digest: `digest` (un aviso
 *    agrupado por hora — "tenés N leads nuevos", en vez de silenciar).
 *  - normal sin cupo de cap NI de digest: `suppress` (ya se digesteó esta hora;
 *    no spameamos con un digest por cada lead).
 */
export function resolveDelivery(input: {
  bypassCap: boolean
  capAllowed: boolean
  digestAllowed: boolean
}): Delivery {
  if (input.bypassCap) return 'individual'
  if (input.capAllowed) return 'individual'
  if (input.digestAllowed) return 'digest'
  return 'suppress'
}

/**
 * `where` (org-scoped) para contar los leads notificables de la última ventana
 * al armar el digest. Extraído como función pura para que el invariante pruebe
 * el AISLAMIENTO multi-tenant: el filtro SIEMPRE ancla en `organizationId` (vía
 * la relación `botConfig`), así que org A jamás cuenta leads de org B. Excluye
 * `dq` (no se notifican) para que el conteo del digest coincida con lo avisado.
 */
export function digestCountWhere(organizationId: string, since: Date) {
  return {
    botConfig: { organizationId },
    capturedAt: { gte: since },
    NOT: { classification: 'dq' as const },
  }
}
