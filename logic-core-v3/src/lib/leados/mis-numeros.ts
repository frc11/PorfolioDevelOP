/**
 * LeadOS 0.5.x — "Mis números" del setter. La cara propia de lo que el admin ya
 * mide: el setter ve SUS leads activos y SU ratio descarte/avance — solo lo
 * suyo, de nadie más. NO es ranking ni comparación: es el mismo criterio sobrio
 * que "Tu semana" (la actividad), aplicado al volumen de cartera y al filtro.
 *
 * Aislamiento (regla de oro, sin grieta):
 *   - los `leads` llegan YA filtrados por `assignedToId = userId` (`listOwnedLeads`,
 *     vía `ownedListWhere`): la cartera de ENTRADA nunca alcanza a otro setter;
 *   - el ratio se calcula con `calcularRatioSetters` (MISMA fuente pura que la
 *     cola de revisión y la carga de asignación del admin — cero recálculo), pero
 *     cada fila se atribuye al `userId` de la sesión. No se lee NINGÚN setterId de
 *     los leads: aunque entrara una fila ajena, jamás se bucketea bajo otro id.
 *
 * Atribución por dueño ACTUAL (igual que el admin): una evaluación de un lead que
 * hoy es del setter cuenta para el setter — idéntico criterio que `/admin/leados`
 * y `setter-carga.ts` (que atribuyen por `lead.assignedTo`). Reuso, no una regla
 * nueva. Pura: `ahora` se inyecta en el core (espejo de `derivarProgresoSemana`).
 */
import type { LeadStatus } from '@prisma/client'
import { EvaluacionSchema } from './contracts.ts'
import {
  calcularRatioSetters,
  leadActivo,
  pctDescarte,
  type EvaluacionDeSetter,
  type RatioConteo,
} from './revision.ts'

/**
 * Forma MÍNIMA que necesitan los números: estado comercial + el blob de
 * evaluación del dossier. `OwnedLeadWithDossier` (lo que pasa el page) es más
 * ancho y encaja por estructura; el chequeo de invariante arma fixtures triviales
 * sin tocar tipos de Prisma.
 */
export type LeadParaNumeros = {
  status: LeadStatus
  dossier: { evaluacionJson: unknown } | null
}

export type MiCriterio = {
  /** Conteo total descarte/avance (todas las evaluaciones de su cartera). */
  total: RatioConteo
  /** Mismo conteo, ventana móvil de 30 días (por `evaluacion.fecha`). */
  ultimos30d: RatioConteo
  /** % de descarte total (0–100). null si todavía no evaluó nada. */
  pctTotal: number | null
  /** % de descarte de los últimos 30 días. null si no evaluó en la ventana. */
  pct30d: number | null
  /** Evaluaciones sin fecha (pre-B5): cuentan en el total, no en los 30 días. */
  sinFecha: number
}

export type MisNumeros = {
  /** Leads vivos en la cartera (no CERRADO/PERDIDO) — el trabajo del momento. */
  activos: number
  /** Total de leads en la cartera — contexto del número de activos. */
  enCartera: number
  /** Resumen del criterio descarte/avance. null = todavía no evaluó nada. */
  criterio: MiCriterio | null
}

/**
 * Arma las filas del ratio atribuidas SIEMPRE al `userId` de la sesión. Separada
 * y exportada a propósito: el chequeo de invariante verifica que toda fila lleva
 * el id propio (jamás uno derivado del lead) — la garantía de que el cálculo
 * compartido no puede bucketear los números de otro setter.
 */
export function filasCriterioPropio(
  leads: readonly LeadParaNumeros[],
  userId: string,
): EvaluacionDeSetter[] {
  return leads.flatMap<EvaluacionDeSetter>((lead) => {
    // Reusa el contrato zod (misma fuente que `parseEvaluacion`), sin arrastrar
    // `flow.ts` (que importa `@/lib/follow-up`) al grafo del chequeo de invariante.
    const parsed = EvaluacionSchema.safeParse(lead.dossier?.evaluacionJson ?? null)
    if (!parsed.success) return []
    // setterLabel vacío: el setter ya sabe quién es; no se muestra acá.
    return [{ setterId: userId, setterLabel: '', evaluacion: parsed.data }]
  })
}

/**
 * Core PURO: `ahora` inyectado para que el chequeo de invariante sea
 * determinístico. Reusa `calcularRatioSetters`/`pctDescarte` tal cual — el único
 * setter posible en el resultado es `userId` (todas las filas llevan su id), así
 * que tomamos el primero (o ninguno).
 */
export function calcularMisNumeros(
  leads: readonly LeadParaNumeros[],
  userId: string,
  ahora: Date,
): MisNumeros {
  const activos = leads.reduce((n, lead) => (leadActivo(lead.status) ? n + 1 : n), 0)

  const filas = filasCriterioPropio(leads, userId)
  const ratio = calcularRatioSetters(filas, ahora).at(0) ?? null

  const criterio: MiCriterio | null = ratio
    ? {
        total: ratio.total,
        ultimos30d: ratio.ultimos30d,
        pctTotal: pctDescarte(ratio.total),
        pct30d: pctDescarte(ratio.ultimos30d),
        sinFecha: ratio.sinFecha,
      }
    : null

  return { activos, enCartera: leads.length, criterio }
}

/**
 * Entrada del Server Component: estampa `ahora` ACÁ (no en el render) para
 * respetar `react-hooks/purity`, mismo patrón que `buildHomeLeads`. Recibe los
 * leads YA cargados — cero queries nuevas.
 */
export function derivarMisNumeros(
  leads: readonly LeadParaNumeros[],
  userId: string,
): MisNumeros {
  return calcularMisNumeros(leads, userId, new Date())
}
