/**
 * FIX-BRIEF — Construcción determinística del input del brief ejecutivo.
 *
 * Módulo puro (sin IO, sin DB, sin LLM) para que "qué números y deltas ve
 * Gemini" sea testeable y, sobre todo, para GARANTIZAR que el brief se alimente
 * EXACTAMENTE de los mismos números que las 4 tarjetas del mail — nunca de una
 * versión paralela que pueda contradecirlas.
 *
 * La fuente de verdad son las cards del template (`email/templates/executive-weekly.ts`):
 *   1. Health Score — delta en PUNTOS (snapshot actual − snapshot previo).
 *   2. Leads        — delta en %.
 *   3. Conversaciones — delta en %.
 *   4. Tareas       — delta en %.
 *
 * Este módulo NO expone las sub-dimensiones (Salud Digital/Comercial/Operativa):
 * no se muestran en ninguna card, así que el brief no puede citarlas (era el
 * origen del "58%" que el dueño leía y no podía verificar).
 */

/** Unidad del delta, igual que la card: puntos (Health) o porcentaje (resto). */
export type DeltaUnit = 'points' | 'percent'

export type BriefMetric = {
  /** Etiqueta EXACTA de la card que ve el dueño. */
  label: string
  /** Valor mostrado en la card (número duro). */
  value: number
  /** Sufijo del valor en el texto (ej. '/100' en Health, '' en el resto). */
  valueSuffix: string
  /** Delta vs la semana anterior. `null` = sin semana previa con qué comparar. */
  delta: number | null
  unit: DeltaUnit
}

export type BriefMetricsInput = {
  health: BriefMetric
  leads: BriefMetric
  conversations: BriefMetric
  tasks: BriefMetric
}

export type BriefPromptInput = {
  companyName: string
  metrics: BriefMetricsInput
}

/**
 * Delta del Health Score EXACTAMENTE como lo calcula la card (`build.ts`):
 * total de esta semana menos el de la semana anterior (en puntos). `null` si no
 * hay semana previa — igual que la card, que muestra "sin datos previos".
 * Mantener este cálculo idéntico al de `build.ts` es lo que evita la contradicción.
 */
export function cardHealthDelta(currentTotal: number, previousTotal: number | null): number | null {
  return previousTotal === null ? null : currentTotal - previousTotal
}

/**
 * Elige el total de Health de la "semana anterior" con la MISMA regla que la
 * card (`build.ts` usa `getBriefHistory(org, 2)` → `previous = history[1]`):
 * el snapshot más reciente de un período DISTINTO al actual.
 * - Si el snapshot de esta semana aún no existe (primera generación): la semana
 *   previa es el más reciente (índice 0).
 * - Si ya existe (regeneración intra-semana): se saltea y toma el anterior, así
 *   el delta sigue siendo vs la semana pasada y no ~0 contra uno mismo.
 * `null` si no hay ningún período previo (primera semana del negocio).
 */
export function pickPreviousHealthTotal(
  history: ReadonlyArray<{ periodKey: string; healthTotal: number }>,
  currentPeriodKey: string,
): number | null {
  const previous = history.find((snapshot) => snapshot.periodKey !== currentPeriodKey)
  return previous ? previous.healthTotal : null
}

/**
 * Coerción número|string → número, misma semántica que `build.ts:toNumber`, para
 * que el valor que ve el brief sea idéntico al de la card incluso en el borde.
 */
function toNumberSafe(value: number | string): number {
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Ensambla el input de métricas del brief a partir de las mismas piezas que
 * `build.ts` usa para las cards. El delta de Health se deriva con `cardHealthDelta`;
 * los de Leads/Conversaciones/Tareas son los `trend` del mismo `weekResults`.
 */
export function buildBriefMetricsInput(args: {
  healthTotal: number
  previousHealthTotal: number | null
  leads: { value: number | string; trend: number | null }
  conversations: { value: number | string; trend: number | null }
  tasks: { value: number | string; trend: number | null }
}): BriefMetricsInput {
  return {
    health: {
      label: 'Health Score',
      value: args.healthTotal,
      valueSuffix: '/100',
      delta: cardHealthDelta(args.healthTotal, args.previousHealthTotal),
      unit: 'points',
    },
    leads: {
      label: 'Leads',
      value: toNumberSafe(args.leads.value),
      valueSuffix: '',
      delta: args.leads.trend,
      unit: 'percent',
    },
    conversations: {
      label: 'Conversaciones',
      value: toNumberSafe(args.conversations.value),
      valueSuffix: '',
      delta: args.conversations.trend,
      unit: 'percent',
    },
    tasks: {
      label: 'Tareas',
      value: toNumberSafe(args.tasks.value),
      valueSuffix: '',
      delta: args.tasks.trend,
      unit: 'percent',
    },
  }
}

/**
 * Frase de dirección PRE-INTERPRETADA a partir del signo del delta. Le sacamos
 * al modelo la posibilidad de leer mal el signo: recibe "bajó 4 puntos", no un
 * "-4" que podría narrar como suba.
 */
function describeDelta(metric: BriefMetric): string {
  if (metric.delta === null) {
    return 'sin comparación con la semana anterior (primera medición)'
  }

  const magnitude = Math.abs(metric.delta)

  if (metric.unit === 'percent') {
    if (metric.delta === 0) return 'igual que la semana anterior (0%)'
    return `${metric.delta > 0 ? 'subió' : 'bajó'} ${magnitude}% vs la semana anterior`
  }

  // points
  const noun = magnitude === 1 ? 'punto' : 'puntos'
  if (metric.delta === 0) return 'igual que la semana anterior (0 puntos)'
  return `${metric.delta > 0 ? 'subió' : 'bajó'} ${magnitude} ${noun} vs la semana anterior`
}

function metricLine(metric: BriefMetric): string {
  return `- ${metric.label}: ${metric.value}${metric.valueSuffix} — ${describeDelta(metric)}.`
}

/**
 * System prompt ENDURECIDO. Exportado como constante para que el invariante
 * pueda verificar que las reglas anti-invención siguen presentes (si alguien
 * las borra, el test rompe).
 */
export const BRIEF_SYSTEM_PROMPT = `Sos el asistente ejecutivo de develOP, una agencia argentina de tecnología y automatizaciones. Escribís el resumen ejecutivo SEMANAL del negocio digital del cliente, en español rioplatense, para el dueño del negocio (no un técnico).

ESTILO:
- Máximo 3 oraciones, alrededor de 280 caracteres.
- Lenguaje claro, sin jerga técnica. Sin emojis.
- Tono directo y premium, como un consultor que conoce al cliente.
- Cerrá con una recomendación accionable o un dato concreto de la lista.

VERACIDAD (obligatorio, no negociable):
- Comentá SOLO los números de la lista "Datos de la semana". No inventes, estimes ni cites ninguna otra métrica, porcentaje ni cifra que no esté en esa lista.
- Respetá EXACTAMENTE la dirección de cada dato. Si un número bajó, no digas que subió, escaló, creció, mejoró ni se duplicó. Si subió, no digas que bajó. Si quedó igual, no lo cuentes como cambio.
- No afirmes ninguna tendencia que no esté respaldada por un dato de la lista.

TONO SEGÚN LOS DATOS:
- Métrica que subió: contala con energía, sin exagerar más allá del número.
- Métrica que bajó: mencionala como oportunidad para esta semana, nunca como reproche, pero honesta, sin disfrazar la caída.
- Si la semana fue floja (varias métricas planas o en baja): decilo corto y honesto, en una o dos oraciones, sin inventar optimismo.`

/**
 * Arma el user prompt con las 4 métricas de las cards y sus deltas reales. Deja
 * explícito que esos son los únicos números que el modelo puede comentar.
 */
export function buildBriefUserPrompt(input: BriefPromptInput): string {
  const { companyName, metrics } = input
  return `Cliente: ${companyName}

Datos de la semana (son EXACTAMENTE los números que el dueño ve en las tarjetas del mail; los únicos que podés comentar):
${metricLine(metrics.health)}
${metricLine(metrics.leads)}
${metricLine(metrics.conversations)}
${metricLine(metrics.tasks)}

Escribí el resumen ejecutivo de la semana respetando las reglas.`
}

/**
 * FIX-BRIEF — Corte de versión de generación. Todo brief cacheado ANTES de este
 * instante se generó con el prompt viejo (que podía contradecir las cards). Se
 * fuerza UNA regeneración; tras la primera generación post-corte, el guard no
 * vuelve a dispararse. Sin migración: se apoya en la columna existente
 * `cachedExecutiveBriefAt`. Si el deploy es posterior a esta fecha, se puede
 * subir el valor para arrastrar cualquier brief generado antes del deploy.
 */
export const BRIEF_LOGIC_CUTOFF = new Date('2026-07-02T00:00:00.000Z')

/** `true` si el brief cacheado se generó con la lógica vigente (post-corte). */
export function isBriefCacheCurrent(cachedAt: Date | null): boolean {
  return cachedAt !== null && cachedAt.getTime() >= BRIEF_LOGIC_CUTOFF.getTime()
}
