'use client'

import { useState } from 'react'
import { CheckCircle2, Eye, SendHorizonal, ShieldCheck, Wrench } from 'lucide-react'
import { Button, Callout, Toggle } from '@/components/ui'
import type { Brief, SelfCheck } from '@/lib/leados/contracts'
import { GRUPOS_CHEQUEO, HARD_CHECKS, SOFT_CHECKS, type HardCheck } from '@/lib/leados/flow'
import { GUIA_SELF_CHECK } from '@/lib/leados/guidance-content'
import { promptParaHardCheck } from '@/lib/leados/prompts-disenio'
import { useAutosave } from '@/lib/use-autosave'
import { useStepAction } from '@/lib/use-step-action'
import { useUnsavedGuard } from '@/lib/use-unsaved-guard'
import { enviarARevision, guardarSelfCheck } from '@/app/(protected)/setter/_actions/dossier.actions'
import { AutosaveStatus } from '@/app/(protected)/setter/_components/autosave-status'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { LineaRicaText } from '@/app/(protected)/setter/_components/teach-panel'

/**
 * M14 — el chequeo final (5.4, tramo Chequeo). Presentación del manual sobre el
 * MISMO gate de Construcción del wizard: mismas listas (`HARD_CHECKS` /
 * `SOFT_CHECKS`), mismo puente check-fallado→prompt (`promptParaHardCheck`,
 * parcial y editable), y las MISMAS actions (`guardarSelfCheck`,
 * `enviarARevision` — que re-valida `selfCheckAprobado` server-side; la UI nunca
 * es el gate). El chrome (cómo chequear, el borrador a la vista, el brief) vive en
 * el módulo `m14-chequeo`; acá solo el núcleo: la grilla y el envío a revisión.
 * TODOS los obligatorios en verde habilitan el botón — es EL gate de
 * Construcción; las fases de Construcción siguen sin gatear.
 *
 * P7 · el trabajo no se pierde. Los tildes vivían SOLO en estado de React hasta
 * que alguien tocara «Guardar el chequeo»: salir de la pantalla (y la nav del
 * manual es SPA, así que `beforeunload` ni corría) descartaba en silencio hasta
 * diez verificaciones que cuestan abrir la demo en el celular una por una. Ahora
 * usa el MISMO mecanismo que la ficha y el brief —`useAutosave` sobre la MISMA
 * action `guardarSelfCheck`, sin abrir un camino de escritura nuevo, más
 * `useUnsavedGuard` para el cierre de pestaña en pleno tilde— y el botón de
 * guardar desapareció: con guardado automático era la mitad ambigua del
 * hallazgo (m1 enseña «se guarda solo» y acá había que apretar). Queda UNA sola
 * forma de tildar (`Toggle`) y UNA sola de persistir. El único botón que quedó
 * hace otra cosa: manda a revisión.
 *
 * P7 · los dos grupos. Los obligatorios se presentan repartidos por su `grupo`
 * (`GRUPOS_CHEQUEO`): lo que el setter juzga solo y lo que hoy pide el ojo de
 * Franco. Es SOLO presentación — el gate recorre la lista entera igual.
 */

/** Estado inicial de los duros: lo guardado, mapeado por nombre vigente. */
function durosIniciales(selfCheck: SelfCheck | null): Record<string, boolean> {
  const duros: Record<string, boolean> = {}
  for (const check of HARD_CHECKS) {
    duros[check.id] =
      selfCheck?.itemsDuros.some((item) => item.nombre === check.nombre && item.ok) ?? false
  }
  return duros
}

function softIniciales(selfCheck: SelfCheck | null): string[] {
  if (!selfCheck) return []
  return SOFT_CHECKS.filter((soft) => selfCheck.softFlags.includes(soft.etiqueta)).map(
    (soft) => soft.id,
  )
}

type ChequeoEstado = { duros: Record<string, boolean>; softIds: string[] }

/** Un punto obligatorio: nombre, cómo verificarlo, su tilde y —en rojo— el
 * arreglo concreto. Misma pieza en los dos grupos: una sola forma de tildar. */
function PuntoDuro({
  check,
  ok,
  brief,
  onChange,
}: {
  check: HardCheck
  ok: boolean
  brief: Brief | null
  onChange: (checked: boolean) => void
}) {
  // Puente 4·B: el hard-block en rojo que se arregla refinando la demo ofrece,
  // además del arreglo humano, su prompt copiable a Claude Design. Mapeo parcial
  // y editable (`prompts-disenio.ts`); sin prompt mapeado → solo el arreglo. NO
  // toca el gate: es un atajo, no un bypass (el botón sigue disabled hasta
  // tenerlos todos y el server re-valida igual).
  const promptArreglo = ok ? null : promptParaHardCheck(check.id)
  return (
    <div
      className={`rounded-xl border p-3.5 transition-colors ${
        ok ? 'border-emerald-400/20 bg-emerald-500/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-200">{check.nombre}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{check.comoVerificar}</p>
          {check.id === 'fielAlBrief' && brief && brief.secciones.length > 0 && (
            <p className="mt-1 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-400">El brief pedía:</span>{' '}
              {brief.secciones.join(' · ')}
              {brief.cta ? ` · CTA: ${brief.cta}` : ''}
            </p>
          )}
          {!ok && (
            <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-rose-300/90">
              <Wrench size={12} strokeWidth={1.5} className="mt-0.5 shrink-0" />
              {check.arreglo}
            </p>
          )}
        </div>
        <Toggle checked={ok} onChange={onChange} label={check.nombre} />
      </div>
      {promptArreglo && (
        <div className="mt-3">
          <CopyBlock
            titulo={promptArreglo.titulo}
            instruccion={promptArreglo.instruccion}
            texto={promptArreglo.prompt}
          />
        </div>
      )}
    </div>
  )
}

export function ChequeoForm({
  leadId,
  selfCheck,
  brief,
}: {
  leadId: string
  selfCheck: SelfCheck | null
  brief: Brief | null
}) {
  const [duros, setDuros] = useState<Record<string, boolean>>(() => durosIniciales(selfCheck))
  const [softIds, setSoftIds] = useState<string[]>(() => softIniciales(selfCheck))
  // 4.1: el rebote del server queda FIJO junto al form. El toast se va solo y
  // el setter se quedaba sin saber por qué no salió el envío.
  const [serverError, setServerError] = useState<string | null>(null)
  const accion = useStepAction()

  const todosDurosOk = HARD_CHECKS.every((check) => duros[check.id])
  const faltantesDuros = HARD_CHECKS.filter((check) => !duros[check.id]).length
  const estado: ChequeoEstado = { duros, softIds }

  // P7 — autosave sobre la MISMA action (ownership adentro, jamás transiciona
  // stage). El mount no ensucia: el snapshot arranca en lo que vino del server.
  const autosave = useAutosave<ChequeoEstado>({
    value: estado,
    enabled: true,
    save: (actual) => guardarSelfCheck(leadId, actual),
    // Sin debounce, a diferencia de la ficha y el brief: un tilde es una acción
    // TERMINADA, no una tecla en el medio de una frase — esperar una pausa deja
    // abierta justo la ventana del hallazgo (tildar y salir en el mismo segundo).
    // El coalescing del hook sigue evitando pedidos encimados si se tildan
    // varios seguidos, y un guardado ya en vuelo termina aunque se desmonte:
    // lo único que la salida cancela es un timer pendiente, y acá no hay.
    delayMs: 0,
  })
  useUnsavedGuard(autosave.isDirty)

  const enviar = () => {
    setServerError(null)
    // Guarda el estado actual primero (flags frescos) y después envía: el server
    // re-valida los hard-blocks contra la DB, no contra la UI. Si el guardado
    // rebota, su fallo ES el fallo del envío (mismo camino de error). Con
    // autosave este guardado sigue siendo necesario: es el flush del último
    // tilde, que puede estar todavía en el debounce.
    accion.run(
      async () => {
        const guardado = await guardarSelfCheck(leadId, estado)
        if (!guardado.success) return guardado
        // El indicador no puede quedar diciendo "sin guardar" si el envío falla
        // DESPUÉS de un guardado que sí entró.
        autosave.markSaved()
        return enviarARevision(leadId)
      },
      {
        onError: setServerError,
        successToast: 'Demo enviada a revisión — Franco la ve en su cola.',
      },
    )
  }

  return (
    <div className="space-y-5">
      <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
        <LineaRicaText linea={GUIA_SELF_CHECK.intro} />
      </p>

      {GRUPOS_CHEQUEO.map((grupo) => (
        <section
          key={grupo.id}
          aria-label={grupo.titulo}
          className={
            grupo.id === 'franco'
              ? 'space-y-2 rounded-2xl border border-amber-400/20 bg-amber-400/[0.03] p-4'
              : 'space-y-2 rounded-2xl border border-white/[0.07] bg-white/[0.01] p-4'
          }
        >
          <h3
            className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${
              grupo.id === 'franco' ? 'text-amber-200/90' : 'text-zinc-300'
            }`}
          >
            {grupo.id === 'franco' ? (
              <Eye size={13} strokeWidth={1.5} aria-hidden />
            ) : (
              <ShieldCheck size={13} strokeWidth={1.5} aria-hidden />
            )}
            {grupo.titulo}
          </h3>
          <p className="pb-1 text-xs leading-relaxed text-zinc-500">{grupo.detalle}</p>

          {HARD_CHECKS.filter((check) => check.grupo === grupo.id).map((check) => (
            <PuntoDuro
              key={check.id}
              check={check}
              ok={duros[check.id] === true}
              brief={brief}
              onChange={(checked) => setDuros((actual) => ({ ...actual, [check.id]: checked }))}
            />
          ))}

          {/* Los delatores del ojo de diseño quedan DENTRO del grupo de Franco:
              son el detalle concreto de «No se nota que la hizo una IA». Sub-bloque
              propio porque acá marcar significa «lo vi» (al revés que los duros) y
              porque no bloquean el envío. */}
          {grupo.id === 'franco' && (
            <div className="mt-2 rounded-xl border border-white/[0.06] bg-black/20 p-3.5">
              <p className="text-xs font-semibold text-amber-200/80">
                Delatores de siempre — no bloquean, pero Franco los ve
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                Marcá los que veas en la demo. Ser honesto acá juega a favor: Franco los revisa igual.
              </p>
              <div className="mt-1.5">
                {SOFT_CHECKS.map((soft) => (
                  <label
                    key={soft.id}
                    className="flex cursor-pointer items-center justify-between gap-3 py-1"
                  >
                    <span className="text-xs text-zinc-300">{soft.etiqueta}</span>
                    <Toggle
                      checked={softIds.includes(soft.id)}
                      onChange={(checked) =>
                        setSoftIds((actual) =>
                          checked ? [...actual, soft.id] : actual.filter((id) => id !== soft.id),
                        )
                      }
                      label={soft.etiqueta}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </section>
      ))}

      {todosDurosOk ? (
        <Callout tone="success" icon={CheckCircle2}>
          <span className="font-medium">
            Todos los obligatorios en verde — podés enviar a revisión.
          </span>
        </Callout>
      ) : (
        // Gate proactivo: el botón queda disabled CON el motivo al lado (cuántos
        // faltan + el porqué), no un disabled mudo. El server re-valida igual.
        <Callout tone="neutral" title={GUIA_SELF_CHECK.gate.titulo}>
          <span>
            {faltantesDuros === 1
              ? 'Queda 1 obligatorio en rojo'
              : `Quedan ${faltantesDuros} obligatorios en rojo`}{' '}
            — el arreglo concreto está debajo de cada punto.{' '}
            <LineaRicaText linea={GUIA_SELF_CHECK.gate.detalle} />
          </span>
        </Callout>
      )}

      {serverError && (
        <p role="alert" className="text-xs leading-relaxed text-red-400">
          {serverError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button
          onClick={enviar}
          loading={accion.isPending}
          disabled={!todosDurosOk}
          icon={<SendHorizonal size={14} strokeWidth={1.5} />}
        >
          Enviar a revisión
        </Button>
        <AutosaveStatus
          phase={autosave.phase}
          isDirty={autosave.isDirty}
          busy={accion.isPending}
          errorLabel="No se pudo guardar — tocá de nuevo un punto para reintentar"
        />
        {/* P7: acá está la única promesa de guardado de la pantalla, y es cierta. */}
        <p className="text-[11px] text-zinc-600">
          Se guarda solo a medida que tildás. Podés cerrar y seguir después.
        </p>
      </div>
    </div>
  )
}
