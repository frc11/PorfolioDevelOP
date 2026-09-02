'use client'

import { useMemo, useState } from 'react'
import { Button, Field, Input, TextArea } from '@/components/ui'
import { fail } from '@/lib/action-utils'
import type { Brief } from '@/lib/leados/contracts'
import { GUIA_BRIEF } from '@/lib/leados/guidance-content'
import { faltaPorHerramientaSinLink, herramientaSinLink } from '@/lib/leados/herramientas'
import { useAutosave } from '@/lib/use-autosave'
import { erroresPorCampo, useStepAction } from '@/lib/use-step-action'
import { useUnsavedGuard } from '@/lib/use-unsaved-guard'
import { guardarBrief } from '@/app/(protected)/setter/_actions/dossier.actions'
import { BriefInputSchema, type BriefInput } from '@/app/(protected)/setter/_actions/dossier.schemas'
import { AutosaveStatus } from '@/app/(protected)/setter/_components/autosave-status'
import { useAccionPrincipal } from '../manual/_components/barra-accion'

/**
 * El REGISTRO del brief (5.3, patrón 4.2/5.1/5.2). Extraído SIN cambio de
 * comportamiento del `BriefStep` para que el wizard y el manual (M6) sean dos
 * presentaciones del MISMO camino de escritura: misma action (`guardarBrief` —
 * ownership, gate y transición EVALUADA→BRIEF adentro), mismo schema
 * (`BriefInputSchema`), mismo autosave/guardia. El chrome (intro, ToolGuide,
 * TeachPanel, el bloque del Gem) vive AFUERA; acá solo el núcleo de escritura:
 * los campos, el guardado y el estado de autosave.
 *
 * `autosaveEnabled` lo decide el caller (el wizard SOLO lo prende en el
 * re-pegado BRIEF+editando — la captura inicial en EVALUADA NO se autoguarda a
 * propósito: ese primer guardado ES la transición deliberada). `onCancel`
 * agrega el botón Cancelar (re-pegado del wizard); `onSaved` deja al caller
 * cerrar su propio estado de edición tras un guardado exitoso.
 *
 * P5-B — `notasMarca` YA NO SE PIDE (la ficha lo junta en «¿Cómo habla el
 * negocio de sí mismo?», «¿De dónde bajás el logo y las fotos?» y «Contenido
 * real», y las tres viajan solas al bloque de construcción). Pero sigue en el
 * estado y en el payload A PROPÓSITO: `guardarBrief` persiste el input COMPLETO
 * (`const brief: Brief = input.data`), así que un campo que sale del payload se
 * BORRA en el próximo re-guardado. Ese es exactamente el destino silencioso de
 * `referenciasFicha` (en `BriefSchema`, fuera de `BriefInputSchema`, sin ningún
 * lector). Dejarlo viajar es lo que mantiene legibles los briefs ya guardados.
 * Si alguien lo saca de `BriefFormState`/`aPayloadBrief` "porque no se usa", el
 * dato viejo se pierde a la primera edición y nadie se entera.
 */

type BriefFormState = {
  pegadoGem: string
  titulo: string
  concepto: string
  seccionesTexto: string
  notasMarca: string
  cta: string
}

type FormErrors = Partial<Record<'titulo' | 'secciones' | 'pegadoGem', string>>

function estadoInicial(brief: Brief | null, businessName: string): BriefFormState {
  return {
    pegadoGem: brief?.pegadoGem ?? '',
    titulo: brief?.titulo ?? businessName,
    concepto: brief?.concepto ?? '',
    seccionesTexto: brief?.secciones.join('\n') ?? '',
    notasMarca: brief?.notasMarca ?? '',
    cta: brief?.cta ?? '',
  }
}

/** Form → input del brief: mismo mapeo para el guardado manual y el autosave. */
function aPayloadBrief(state: BriefFormState): BriefInput {
  return {
    pegadoGem: state.pegadoGem,
    titulo: state.titulo,
    concepto: state.concepto || undefined,
    secciones: state.seccionesTexto
      .split('\n')
      .map((linea) => linea.trim())
      .filter(Boolean),
    notasMarca: state.notasMarca || undefined,
    cta: state.cta || undefined,
  }
}

export function BriefForm({
  leadId,
  businessName,
  brief,
  autosaveEnabled = false,
  onCancel,
  onSaved,
}: {
  leadId: string
  businessName: string
  brief: Brief | null
  /** El wizard lo prende SOLO en el re-pegado (BRIEF+editando); el manual jamás. */
  autosaveEnabled?: boolean
  /** Si se pasa, muestra el botón Cancelar (re-pegado del wizard). */
  onCancel?: () => void
  /** Callback tras un guardado exitoso — el caller cierra su estado de edición. */
  onSaved?: () => void
}) {
  const [form, setForm] = useState<BriefFormState>(() => estadoInicial(brief, businessName))
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const { isPending, run } = useStepAction()

  const briefValido = useMemo(() => BriefInputSchema.safeParse(aPayloadBrief(form)).success, [form])

  /** El Gem de diseño no se puede abrir todavía → su pegado no se puede exigir. */
  const gemSinLink = herramientaSinLink('gemDiseno')

  // Autosave SOLO cuando el caller lo habilita (re-pegado BRIEF+editando): ahí
  // `guardarBrief` re-escribe `briefJson` SIN transición. La captura inicial en
  // EVALUADA NO se autoguarda a propósito — ese primer guardado ES la transición
  // deliberada, y la cubre la guardia de salida. Ownership intacto: misma action.
  const autosave = useAutosave<BriefFormState>({
    value: form,
    enabled: autosaveEnabled && briefValido,
    save: async (estado) => {
      const parsed = BriefInputSchema.safeParse(aPayloadBrief(estado))
      if (!parsed.success) return fail('Borrador incompleto')
      return guardarBrief(leadId, parsed.data)
    },
  })

  // Avisar ante cambios sin guardar mientras el form esté montado — incluida la
  // captura inicial en EVALUADA, que el autosave no cubre.
  useUnsavedGuard(autosave.isDirty)

  const set = <Campo extends keyof BriefFormState>(campo: Campo, valor: string) => {
    setForm((actual) => ({ ...actual, [campo]: valor }))
  }

  const guardar = () => {
    setServerError(null)
    const parsed = BriefInputSchema.safeParse(aPayloadBrief(form))
    if (!parsed.success) {
      setErrors(erroresPorCampo<keyof FormErrors>(parsed.error))
      return
    }
    setErrors({})
    run(() => guardarBrief(leadId, parsed.data), {
      onError: setServerError,
      onSuccess: () => {
        autosave.markSaved()
        onSaved?.()
      },
      successToast: 'Brief guardado — dale una leída antes de seguir.',
    })
  }

  // P18 — la acción se pinta en la barra fija de `PantallaManual`. Nunca está
  // bloqueada: la validación es un `safeParse` en el click y los errores se
  // cuelgan de cada campo, así que no hay motivo que mostrar.
  useAccionPrincipal({
    etiqueta: 'Guardar brief',
    onClick: guardar,
    loading: isPending,
  })

  return (
    <div className="space-y-5">
      {/* El asterisco y el bloqueo se van JUNTOS: marcar como obligatorio algo
          que el producto acepta vacío es la contradicción que este campo tenía.
          Los dos salen del mismo `herramientaSinLink('gemDiseno')` que decide el
          `superRefine` del schema y la píldora «Link pendiente» de arriba. */}
      <Field
        label={GUIA_BRIEF.campos.pegadoGem.label}
        required={!gemSinLink}
        error={errors.pegadoGem}
        hint={
          gemSinLink
            ? GUIA_BRIEF.campos.pegadoGem.hintSinHerramienta
            : GUIA_BRIEF.campos.pegadoGem.hint
        }
      >
        <TextArea
          value={form.pegadoGem}
          onChange={(event) => set('pegadoGem', event.target.value)}
          invalid={Boolean(errors.pegadoGem)}
          rows={8}
        />
      </Field>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label={GUIA_BRIEF.campos.titulo.label}
          required
          error={errors.titulo}
          hint={GUIA_BRIEF.campos.titulo.hint}
        >
          <Input
            value={form.titulo}
            onChange={(event) => set('titulo', event.target.value)}
            invalid={Boolean(errors.titulo)}
          />
        </Field>

        <Field label={GUIA_BRIEF.campos.cta.label} hint={GUIA_BRIEF.campos.cta.hint}>
          <Input value={form.cta} onChange={(event) => set('cta', event.target.value)} />
        </Field>
      </div>

      <Field
        label={GUIA_BRIEF.campos.seccionesTexto.label}
        required
        error={errors.secciones}
        hint={GUIA_BRIEF.campos.seccionesTexto.hint}
      >
        <TextArea
          value={form.seccionesTexto}
          onChange={(event) => set('seccionesTexto', event.target.value)}
          invalid={Boolean(errors.secciones)}
          rows={5}
        />
      </Field>

      <Field label={GUIA_BRIEF.campos.concepto.label} hint={GUIA_BRIEF.campos.concepto.hint}>
        <TextArea
          value={form.concepto}
          onChange={(event) => set('concepto', event.target.value)}
          rows={3}
        />
      </Field>

      {serverError && (
        <p role="alert" className="text-xs text-red-400">
          {serverError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <AutosaveStatus phase={autosave.phase} isDirty={autosave.isDirty} busy={isPending} />
      </div>
    </div>
  )
}

/**
 * El brief ya guardado, solo lectura — la MISMA pieza para el sanity-check del
 * wizard (que la envuelve con sus botones «Menciona lo concreto» / «re-pegar»)
 * y para M6 (consulta al volver a la pantalla ya completada). Sin estado ni
 * gates: presenta el brief tal como quedó.
 */
export function BriefResumen({ brief }: { brief: Brief }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-sm font-semibold text-zinc-200">{brief.titulo}</p>
      {brief.concepto && <p className="mt-1 text-xs text-zinc-500">{brief.concepto}</p>}
      {brief.secciones.length > 0 && (
        <p className="mt-2 text-xs text-zinc-500">
          <span className="font-semibold text-zinc-400">Secciones:</span>{' '}
          {brief.secciones.join(' · ')}
        </p>
      )}
      {brief.cta && (
        <p className="mt-1 text-xs text-zinc-500">
          <span className="font-semibold text-zinc-400">CTA:</span> {brief.cta}
        </p>
      )}
      {brief.pegadoGem ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-300">
            Ver respuesta completa del Gem
          </summary>
          <pre className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-white/[0.06] bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-zinc-500">
            {brief.pegadoGem}
          </pre>
        </details>
      ) : (
        /* El pegado ausente se NOMBRA en vez de desaparecer: sin esto, un brief
           guardado contra la pared («Link pendiente») se lee igual que uno donde
           el Gem no aportó nada. Visible siempre — el faltante no se pliega. */
        faltaPorHerramientaSinLink('gemDiseno', brief.pegadoGem) && (
          <p className="mt-3 text-xs leading-relaxed text-amber-200/70">
            {GUIA_BRIEF.campos.pegadoGem.faltante}
          </p>
        )
      )}
    </div>
  )
}
