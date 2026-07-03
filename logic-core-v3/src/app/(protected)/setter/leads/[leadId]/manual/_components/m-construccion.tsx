import type { Brief, FaseId, Ficha } from '@/lib/leados/contracts'
import { buildConstruccionBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { SHELL_CONSTRUCCION } from '@/lib/leados/flow'
import { promptsParaFase } from '@/lib/leados/prompts-disenio'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import { FaseAutoReporte } from './fase-auto-reporte'

/**
 * M7–M12 — las seis fases de Construcción, UNA pantalla por fase (5.3, patrón
 * 4.2). Un solo módulo parametrizado por `faseId`: el manual explota el paso de
 * Construcción del wizard (un `<ChecklistConstruccion>` 6-en-uno + los tres
 * prompts al final) en seis tareas atómicas, cada una con lo suyo a la vista:
 *   - contexto: el bloque de Construcción re-servido (brief + materiales reales)
 *     — el MISMO builder del wizard (`buildConstruccionBlock`), en cada fase;
 *   - munición: los items de ESTA fase (de `SHELL_CONSTRUCCION`, editable por
 *     Franco) + el/los prompt(s) de diseño que la fase usa —renderizados DENTRO
 *     de la fase (cierra A-10): calidad→estética+motion, mobile→mobile— + el link
 *     a Claude Design;
 *   - registro: el tilde de auto-reporte de la fase (`FaseAutoReporte`, mismo
 *     `guardarProgreso` del wizard).
 * Navegación LIBRE entre las seis (§6-3): tildar no gatea nada — lo garantiza la
 * derivación (`manual.ts`), acá solo se presenta.
 */

/** Contexto: el bloque de Construcción re-servido en CADA fase — así el brief y
 * los materiales están siempre a mano mientras se construye. */
export function ConstruccionContexto({
  lead,
  brief,
  ficha,
}: {
  lead: CopyBlockLead
  brief: Brief | null
  ficha: Ficha | null
}) {
  if (!brief) {
    // Inalcanzable con la guardia del server (m7–m12 exigen BRIEF+) — vacío
    // honesto por si el brief se pierde entre carga y render.
    return (
      <p className="text-xs leading-relaxed text-zinc-500">
        El brief tiene que estar guardado antes de construir la demo.
      </p>
    )
  }
  return (
    <CopyBlock
      titulo="Bloque para Claude Design"
      instruccion="El brief + los materiales reales, listos para pegar como primer mensaje."
      texto={buildConstruccionBlock(lead, brief, ficha)}
    />
  )
}

/** Munición: los items de la fase + el/los prompt(s) de diseño que la fase usa
 * (cierra A-10) + el link a Claude Design. */
export function ConstruccionMunicion({ faseId }: { faseId: FaseId }) {
  const fase = SHELL_CONSTRUCCION.find((shell) => shell.id === faseId)
  const prompts = promptsParaFase(faseId)
  return (
    <div className="space-y-4">
      {fase && fase.items.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Qué hacer en esta fase
          </p>
          <ul className="space-y-1.5 text-xs leading-relaxed text-zinc-400">
            {fase.items.map((item) => (
              <li key={item} className="flex gap-2">
                <span
                  aria-hidden
                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400/60"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* A-10: el prompt prefijado DENTRO de la fase que lo usa (no listado al
          final del paso). Vacío para las fases sin prompt lead-agnóstico. */}
      {prompts.map((prompt) => (
        <CopyBlock
          key={prompt.id}
          titulo={prompt.titulo}
          instruccion={prompt.instruccion}
          texto={prompt.prompt}
        />
      ))}

      <ToolGuide id="claudeDesign" />
    </div>
  )
}

/** Registro: el tilde de auto-reporte de la fase (mismo camino que el checklist
 * del wizard, sin gatear nada). */
export function ConstruccionRegistro({
  leadId,
  faseId,
  titulo,
  completadas,
}: {
  leadId: string
  faseId: FaseId
  titulo: string
  completadas: FaseId[]
}) {
  return (
    <FaseAutoReporte
      leadId={leadId}
      faseId={faseId}
      titulo={titulo}
      completadas={completadas}
    />
  )
}
