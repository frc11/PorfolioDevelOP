import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import type { Ficha } from '@/lib/leados/contracts'
import { buildFichaCopyBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { GUIA_FICHA } from '@/lib/leados/guidance-content'
import { rutaManual } from '@/lib/leados/manual'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'

/**
 * M2 — «Llevá la ficha al Evaluador» (5.1, tramo Evaluación del patrón 4.2).
 * Tarea EXTERNA con vuelta: acá no se escribe nada — el manual re-sirve la
 * munición del viaje y la vuelta es navegación (m3 ya está habilitada por la
 * derivación: no hay dato que persista «ya fui al Evaluador»).
 *   - contexto: la ficha re-servida como bloque copiable (el MISMO builder del
 *     wizard, `buildFichaCopyBlock` — lo que se lleva al Gem);
 *   - munición: el link al Gem Evaluador (fuente `herramientas.ts`, la misma
 *     pieza `ToolGuide` del wizard);
 *   - registro: el registro de vuelta — volviste con el resultado → m3.
 */

/** Instrucción propia de M2 (la de `GUIA_FICHA.copyBlock` apunta al «paso 2»
 * del wizard — numeración que acá no existe). */
const INSTRUCCION_BLOQUE_M2 =
  'Se arma con lo último guardado — copialo y pegalo en el Evaluador.'

/** Contexto: la ficha que esta tarea lleva al Evaluador, lista para copiar. */
export function M2Contexto({ lead, ficha }: { lead: CopyBlockLead; ficha: Ficha | null }) {
  if (!ficha) {
    // Inalcanzable con la guardia del server (m2 exige señal mínima) — vacío
    // honesto por si la ficha se pierde entre carga y render.
    return (
      <p className="text-xs leading-relaxed text-zinc-500">
        La ficha todavía no está guardada — completala en la pantalla anterior.
      </p>
    )
  }
  return (
    <CopyBlock
      titulo={GUIA_FICHA.copyBlock.titulo}
      instruccion={INSTRUCCION_BLOQUE_M2}
      texto={buildFichaCopyBlock(lead, ficha)}
    />
  )
}

/** Munición: la herramienta externa del viaje — link + qué es / qué le das. */
export function M2Municion() {
  return <ToolGuide id="evaluador" />
}

/** Registro: la vuelta. Sin estado ni gates — solo el salto a m3. */
export function M2Registro({ leadId, evaluada }: { leadId: string; evaluada: boolean }) {
  if (evaluada) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs leading-relaxed text-zinc-500">
          <CheckCircle2 size={13} strokeWidth={1.5} aria-hidden className="text-emerald-400/80" />
          El veredicto ya quedó registrado — esta pantalla queda de consulta.
        </p>
        <Link
          href={rutaManual(leadId, 'm3')}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-zinc-200"
        >
          Ver el veredicto
          <ArrowRight size={12} strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
    )
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs leading-relaxed text-zinc-400">
        ¿Volviste con la respuesta del Evaluador? El veredicto se registra en la pantalla
        siguiente.
      </p>
      <Link
        href={rutaManual(leadId, 'm3')}
        className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-medium text-cyan-200 transition-colors hover:bg-cyan-500/20"
      >
        Registrar el veredicto
        <ArrowRight size={12} strokeWidth={1.5} aria-hidden />
      </Link>
    </div>
  )
}
