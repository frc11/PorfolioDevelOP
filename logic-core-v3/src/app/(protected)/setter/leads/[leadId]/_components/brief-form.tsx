'use client'

import { useMemo, useRef, useState } from 'react'
import { Button, Field, Input, TextArea } from '@/components/ui'
import { fail } from '@/lib/action-utils'
import {
  autollenar,
  campoDeError,
  diferenciasConLoLeido,
  explicarLectura,
  faltaLaSalidaDelGem,
  valoresDeVueltas,
  vueltaInicial,
  vueltasParaGuardar,
  VUELTA_DE_CAMPO,
  type CampoLeido,
  type CampoVuelta,
  type CamposLeidos,
  type ValoresVueltas,
  type VueltaId,
} from '@/lib/leados/brief-vueltas'
import type { Brief } from '@/lib/leados/contracts'
import { leerEncabezado } from '@/lib/leados/encabezado-documento'
import { GUIA_BRIEF, GUIA_VUELTAS_GEM } from '@/lib/leados/guidance-content'
import { herramientaSinLink } from '@/lib/leados/herramientas'
import { useAutosave } from '@/lib/use-autosave'
import { useStepAction } from '@/lib/use-step-action'
import { useUnsavedGuard } from '@/lib/use-unsaved-guard'
import { guardarBrief } from '@/app/(protected)/setter/_actions/dossier.actions'
import { BriefInputSchema, type BriefInput } from '@/app/(protected)/setter/_actions/dossier.schemas'
import { AutosaveStatus } from '@/app/(protected)/setter/_components/autosave-status'
import { useAccionPrincipal } from '../manual/_components/barra-accion'
import { ResumenVueltas } from './resumen-vueltas'
import { VueltasConElGem } from './vueltas-gem'

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
 *
 * P40 — Arriba de los campos, las cuatro vueltas con el Gem (`VueltasConElGem`).
 * Por la misma razón de P5-B, TODO lo de las vueltas vive en el estado y viaja
 * en el payload, y lo que se guarda de ellas lo decide `vueltasParaGuardar`. Los
 * campos de siempre siguen montados y a la vista: el guardado exige lo mismo que
 * antes (título y secciones), y con el documento de la vuelta 4 las secciones,
 * el tono, la paleta y la tipografía se completan solas desde su encabezado —
 * sin pisar nunca lo que el setter escribió a mano.
 */

type BriefFormState = {
  pegadoGem: string
  titulo: string
  concepto: string
  seccionesTexto: string
  notasMarca: string
  cta: string
  tono: string
  paleta: string
  tipografia: string
} & ValoresVueltas

type CampoConError = 'titulo' | 'secciones' | 'pegadoGem' | 'tono' | 'paleta' | 'tipografia' | CampoVuelta
type FormErrors = Partial<Record<CampoConError, string>>

function estadoInicial(brief: Brief | null, businessName: string): BriefFormState {
  return {
    pegadoGem: brief?.pegadoGem ?? '',
    titulo: brief?.titulo ?? businessName,
    concepto: brief?.concepto ?? '',
    seccionesTexto: brief?.secciones.join('\n') ?? '',
    notasMarca: brief?.notasMarca ?? '',
    cta: brief?.cta ?? '',
    tono: brief?.tono ?? '',
    paleta: brief?.paleta ?? '',
    tipografia: brief?.tipografia ?? '',
    ...valoresDeVueltas(brief),
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
    tono: state.tono || undefined,
    paleta: state.paleta || undefined,
    tipografia: state.tipografia || undefined,
    documento: state.documento || undefined,
    vueltas: vueltasParaGuardar(state),
  }
}

const camposLeidosDe = (state: BriefFormState): CamposLeidos => ({
  concepto: state.concepto,
  seccionesTexto: state.seccionesTexto,
  cta: state.cta,
  tono: state.tono,
  paleta: state.paleta,
  tipografia: state.tipografia,
})

/** Los errores del schema, colgados del campo que los causó (también adentro de una vuelta). */
function erroresDelBrief(issues: readonly { path: PropertyKey[]; message: string }[]): FormErrors {
  const errores: FormErrors = {}
  for (const issue of issues) {
    const campo = campoDeError(issue.path) ?? (issue.path[0] as CampoConError | undefined)
    if (campo && !errores[campo]) errores[campo] = issue.message
  }
  return errores
}

export function BriefForm({
  leadId,
  businessName,
  brief,
  bloqueFicha,
  autosaveEnabled = false,
  onCancel,
  onSaved,
}: {
  leadId: string
  businessName: string
  brief: Brief | null
  /** P40 — la ficha y la evaluación juntas: viajan en el mensaje de la vuelta 1. */
  bloqueFicha: string | null
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
  const [vueltaAbierta, setVueltaAbierta] = useState<VueltaId>(() => vueltaInicial(form))
  // Lo que el lector del encabezado puso en cada campo la última vez: es lo que
  // distingue «lo llenó el documento» (se puede actualizar) de «lo escribió el
  // setter» (no se toca). Ref y no estado: no se dibuja.
  const puestosRef = useRef<Partial<CamposLeidos>>({})
  const [completados, setCompletados] = useState<CampoLeido[]>([])
  const { isPending, run } = useStepAction()

  const briefValido = useMemo(() => BriefInputSchema.safeParse(aPayloadBrief(form)).success, [form])
  const lectura = useMemo(() => leerEncabezado(form.documento), [form.documento])
  const explicacion = explicarLectura(lectura, {
    completados,
    diferencias: diferenciasConLoLeido(camposLeidosDe(form), lectura),
  })

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

  /**
   * P40 — Pegar (o corregir) el documento lee su encabezado y completa los campos
   * que el documento puede llenar. Solo los vacíos o los que llenó el propio
   * lector antes: lo que escribió el setter queda, y la diferencia se muestra.
   */
  const cambiarDocumento = (valor: string) => {
    const resultado = autollenar(camposLeidosDe(form), leerEncabezado(valor), puestosRef.current)
    puestosRef.current = resultado.puestos
    if (!valor.trim()) setCompletados([])
    else if (resultado.completados.length > 0) setCompletados(resultado.completados)
    // Actualizador funcional con SOLO los campos que el lector cambió: una edición
    // de otro campo que entre en el mismo lote no se pisa con el valor de este render.
    const cambios: Partial<CamposLeidos> = Object.fromEntries(
      resultado.completados.map((campo) => [campo, resultado.campos[campo]]),
    )
    setForm((actual) => ({ ...actual, ...cambios, documento: valor }))
  }

  const cambiarVuelta = (campo: CampoVuelta, valor: string) => {
    if (campo === 'documento') cambiarDocumento(valor)
    else set(campo, valor)
  }

  const guardar = () => {
    setServerError(null)
    const parsed = BriefInputSchema.safeParse(aPayloadBrief(form))
    if (!parsed.success) {
      const errores = erroresDelBrief(parsed.error.issues)
      setErrors(errores)
      // Un error adentro de una vuelta plegada no se ve: se abre esa vuelta.
      const enVuelta = (Object.keys(errores) as CampoConError[]).find(
        (campo): campo is CampoVuelta => campo in VUELTA_DE_CAMPO,
      )
      if (enVuelta) setVueltaAbierta(VUELTA_DE_CAMPO[enVuelta])
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

  // Dos renglones y no un input: la paleta que devuelve el Gem trae tres colores
  // con su código y su nombre, y en un input de una línea se corta justo lo que
  // el setter tiene que revisar antes de mandarlo a Claude Design.
  const campoLinea = (campo: 'tono' | 'paleta' | 'tipografia') => (
    <Field label={GUIA_BRIEF.campos[campo].label} hint={GUIA_BRIEF.campos[campo].hint} error={errors[campo]}>
      <TextArea
        value={form[campo]}
        onChange={(event) => set(campo, event.target.value)}
        placeholder={GUIA_BRIEF.campos[campo].ejemplo}
        invalid={Boolean(errors[campo])}
        rows={2}
      />
    </Field>
  )

  return (
    <div className="space-y-5">
      <VueltasConElGem
        valores={form}
        abierta={vueltaAbierta}
        onAbrir={setVueltaAbierta}
        onCambiar={cambiarVuelta}
        bloqueFicha={bloqueFicha}
        lectura={lectura}
        explicacion={explicacion}
        errores={errors}
      />

      <div className="space-y-4 border-t border-white/[0.06] pt-5">
        <div>
          <p className="text-sm font-semibold text-zinc-200">{GUIA_VUELTAS_GEM.loQueViaja}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{GUIA_VUELTAS_GEM.loQueViajaDetalle}</p>
        </div>

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

        <div className="grid gap-4 lg:grid-cols-3">
          {campoLinea('tono')}
          {campoLinea('paleta')}
          {campoLinea('tipografia')}
        </div>

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
            rows={4}
          />
        </Field>
      </div>

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
 *
 * P40 — Suma la dirección visual (tono, paleta, tipografía) y el documento de
 * construcción. Es lo que leen m13 y m14: «qué pedía el brief» incluye ahora
 * cómo tenía que verse. Las vueltas enteras solo en m6 (`conVueltas`): en las
 * pantallas de después, el proceso no es lo que se consulta.
 */
export function BriefResumen({ brief, conVueltas = false }: { brief: Brief; conVueltas?: boolean }) {
  const lineas: { rotulo: string; valor: string | undefined }[] = [
    { rotulo: 'CTA', valor: brief.cta },
    { rotulo: GUIA_BRIEF.campos.tono.label, valor: brief.tono },
    { rotulo: GUIA_BRIEF.campos.paleta.label, valor: brief.paleta },
    { rotulo: GUIA_BRIEF.campos.tipografia.label, valor: brief.tipografia },
  ]
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
      {lineas.map(
        ({ rotulo, valor }) =>
          valor && (
            <p key={rotulo} className="mt-1 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-400">{rotulo}:</span> {valor}
            </p>
          ),
      )}
      {brief.documento && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-300">
            {GUIA_VUELTAS_GEM.resumen.documento}
          </summary>
          <pre className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-white/[0.06] bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-zinc-500">
            {brief.documento}
          </pre>
        </details>
      )}
      {conVueltas && brief.vueltas && <ResumenVueltas vueltas={brief.vueltas} />}
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
           el Gem no aportó nada. Visible siempre — el faltante no se pliega.
           P40: un brief con el documento de las vueltas SÍ trae lo del Gem. */
        faltaLaSalidaDelGem(brief) && (
          <p className="mt-3 text-xs leading-relaxed text-amber-200/70">
            {GUIA_BRIEF.campos.pegadoGem.faltante}
          </p>
        )
      )}
    </div>
  )
}
