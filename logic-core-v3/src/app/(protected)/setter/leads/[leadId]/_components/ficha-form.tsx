'use client'

import { useId, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { Button, Field, Input, Select, TextArea } from '@/components/ui'
import { EnlaceFichaSchema, FichaSchema, type Ficha } from '@/lib/leados/contracts'
import { campoFichaFlojo } from '@/lib/leados/ficha-calidad'
import { fichaFaltantes } from '@/lib/leados/flow'
import { GUIA_FICHA } from '@/lib/leados/guidance-content'
import { useAutosave } from '@/lib/use-autosave'
import { useUnsavedGuard } from '@/lib/use-unsaved-guard'
import { guardarFicha } from '@/app/(protected)/setter/_actions/dossier.actions'
import { AutosaveStatus } from '@/app/(protected)/setter/_components/autosave-status'
import { CampoMejora } from '@/app/(protected)/setter/_components/campo-mejora'

/**
 * El REGISTRO de la ficha (4.2): campos + nudges de calidad + gate visible con
 * faltantes + guardar con autosave y guardia — extraído SIN cambio de
 * comportamiento del `FichaStep` para que el wizard y el manual (M1) sean dos
 * presentaciones del MISMO camino de escritura: misma action (`guardarFicha`,
 * ownership adentro, jamás transiciona stage), mismos hooks (`useAutosave` +
 * `useUnsavedGuard`), mismos mensajes (`fichaFaltantes` + `GUIA_FICHA`). El
 * chrome (Card/encabezado en el wizard; layout-tipo en el manual) vive afuera.
 */

type FichaFormState = {
  igManejadoPor: '' | 'DUENO' | 'CM' | 'NO_SABE'
  identidadNotas: string
  presenciaDigital: string
  resenas: string
  contenidoReal: string
  senalesOperativas: string
  // P5-A · material para construir la demo
  resenasUrl: string
  imagenesUrl: string
  otraRedUrl: string
  queVende: string
  comoSePresenta: string
  otros: string
}

/** P5-A: los campos del material que son DIRECCIONES (se validan como tales). */
const CAMPOS_ENLACE = ['resenasUrl', 'imagenesUrl', 'otraRedUrl'] as const
type CampoEnlace = (typeof CAMPOS_ENLACE)[number]

function estadoInicial(ficha: Ficha | null): FichaFormState {
  return {
    igManejadoPor: ficha?.identidad?.igManejadoPor ?? '',
    identidadNotas: ficha?.identidad?.notas ?? '',
    presenciaDigital: ficha?.presenciaDigital ?? '',
    resenas: ficha?.resenas ?? '',
    contenidoReal: ficha?.contenidoReal ?? '',
    senalesOperativas: ficha?.senalesOperativas ?? '',
    // P5-A: una ficha guardada antes del sprint no trae `materiales` — el
    // optional chaining la deja exactamente como estaba, con estos campos vacíos.
    resenasUrl: ficha?.materiales?.resenasUrl ?? '',
    imagenesUrl: ficha?.materiales?.imagenesUrl ?? '',
    otraRedUrl: ficha?.materiales?.otraRedUrl ?? '',
    queVende: ficha?.materiales?.queVende ?? '',
    comoSePresenta: ficha?.materiales?.comoSePresenta ?? '',
    otros: ficha?.otros ?? '',
  }
}

function aObjeto(state: FichaFormState) {
  return {
    identidad: {
      notas: state.identidadNotas,
      igManejadoPor: state.igManejadoPor === '' ? undefined : state.igManejadoPor,
    },
    presenciaDigital: state.presenciaDigital,
    resenas: state.resenas,
    contenidoReal: state.contenidoReal,
    senalesOperativas: state.senalesOperativas,
    materiales: {
      resenasUrl: state.resenasUrl,
      imagenesUrl: state.imagenesUrl,
      otraRedUrl: state.otraRedUrl,
      queVende: state.queVende,
      comoSePresenta: state.comoSePresenta,
    },
    otros: state.otros,
  }
}

/**
 * P5-A — Validación de las direcciones contra el MISMO schema que persiste
 * (`EnlaceFichaSchema`), para que el mensaje del formulario y el del servidor
 * no puedan divergir. Vacío es válido: todo el material es opcional.
 */
function erroresDeEnlace(state: FichaFormState): Partial<Record<CampoEnlace, string>> {
  const errores: Partial<Record<CampoEnlace, string>> = {}
  for (const campo of CAMPOS_ENLACE) {
    const parsed = EnlaceFichaSchema.safeParse(state[campo])
    if (!parsed.success) {
      errores[campo] = parsed.error.issues[0]?.message ?? 'Link inválido'
    }
  }
  return errores
}

function aPayload(state: FichaFormState): Ficha {
  // FichaSchema convierte strings vacíos en undefined — el payload queda limpio
  const parsed = FichaSchema.safeParse(aObjeto(state))
  if (parsed.success) {
    return parsed.data
  }
  // P5-A: una dirección a medio pegar NO puede tirar abajo el autosave ni el
  // aviso de faltantes (que re-arma el payload en cada render). Se re-arma sin
  // los enlaces — el formulario ya los marca en rojo y bloquea el guardado
  // explícito — para que el resto del trabajo escrito se siga guardando solo.
  const sinEnlaces: FichaFormState = { ...state }
  for (const campo of CAMPOS_ENLACE) {
    sinEnlaces[campo] = ''
  }
  return FichaSchema.parse(aObjeto(sinEnlaces))
}

type FichaFormProps = {
  leadId: string
  ficha: Ficha | null
}

export function FichaForm({ leadId, ficha }: FichaFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<FichaFormState>(() => estadoInicial(ficha))
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  // Nudges de CALIDAD por campo: true = "este input quedó flojo, mostrá cómo
  // mejorarlo". Estado SEPARADO del form a propósito — no toca el autosave (que
  // observa `form`) ni los gates. Solo pinta el mensaje de `CampoMejora`.
  const [nudges, setNudges] = useState<Partial<Record<keyof FichaFormState, boolean>>>({})
  // P5-A: una dirección recién se marca en rojo cuando el setter SALE del campo
  // (mismo criterio que los nudges) — nadie quiere ver un error mientras tipea.
  const [enlacesTocados, setEnlacesTocados] = useState<Partial<Record<CampoEnlace, boolean>>>({})
  // Id estable server/client para atar el título del grupo a su `<section>`
  // (mismo criterio que `Field`): único aunque el form se monte más de una vez.
  const materialesId = useId()

  // Autosave del trabajo escrito: reusa `guardarFicha` (parcial-safe, NUNCA
  // transiciona de stage, ownership por `assignedToId` dentro de la action).
  const autosave = useAutosave<FichaFormState>({
    value: form,
    enabled: true,
    save: (estado) => guardarFicha(leadId, aPayload(estado)),
  })
  useUnsavedGuard(autosave.isDirty)

  const faltantesEnVivo = useMemo(() => fichaFaltantes(aPayload(form)), [form])
  const erroresEnlace = useMemo(() => erroresDeEnlace(form), [form])
  const hayEnlaceInvalido = Object.keys(erroresEnlace).length > 0

  const set = <Campo extends keyof FichaFormState>(campo: Campo, valor: FichaFormState[Campo]) => {
    setForm((actual) => ({ ...actual, [campo]: valor }))
    // Apenas edita, el nudge desaparece: nunca molesta MIENTRAS tipea (se
    // re-evalúa solo al salir del campo, en `evaluarCalidad`).
    setNudges((actual) => (actual[campo] ? { ...actual, [campo]: false } : actual))
    // Mismo criterio para el rojo de las direcciones: se apaga al corregir y
    // vuelve a evaluarse al salir del campo.
    setEnlacesTocados((actual) =>
      actual[campo as CampoEnlace] ? { ...actual, [campo]: false } : actual,
    )
  }

  /** El error de una dirección solo se pinta si el setter ya salió del campo. */
  const errorVisibleDe = (campo: CampoEnlace): string | undefined =>
    enlacesTocados[campo] ? erroresEnlace[campo] : undefined

  // Validación de CALIDAD al SALIR del campo (onBlur). ADVISORY: orienta cómo
  // enriquecer un input flojo; NO gatea el avance ni el submit (ver
  // `ficha-calidad.ts`). Lee el valor del evento — siempre el más fresco.
  const evaluarCalidad = (campo: keyof FichaFormState, valor: string) => {
    setNudges((actual) => ({ ...actual, [campo]: campoFichaFlojo(valor) }))
  }

  const guardar = () => {
    setServerError(null)
    // P5-A: validación de cliente antes de mandar (el servidor la repite en
    // `guardarFicha`). Se marcan TODAS las direcciones para que el rojo señale
    // cuál hay que arreglar, aunque el setter no haya pasado por el campo.
    if (hayEnlaceInvalido) {
      setEnlacesTocados(Object.fromEntries(CAMPOS_ENLACE.map((campo) => [campo, true])))
      const mensaje =
        'Revisá los links marcados: pegá la dirección completa (https://…) o dejalos vacíos.'
      setServerError(mensaje)
      toast.error(mensaje)
      return
    }
    startTransition(async () => {
      const result = await guardarFicha(leadId, aPayload(form))
      if (!result.success) {
        setServerError(result.error)
        toast.error(result.error)
        return
      }
      toast.success(
        result.data.faltantes.length === 0
          ? 'Ficha guardada — ya tenés señal para pasar al Evaluador'
          : 'Borrador guardado — podés volver cuando quieras',
      )
      autosave.markSaved()
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label={GUIA_FICHA.campos.igManejadoPor.label}
          hint={GUIA_FICHA.campos.igManejadoPor.hint}
        >
          <Select
            value={form.igManejadoPor}
            onChange={(event) => set('igManejadoPor', event.target.value as FichaFormState['igManejadoPor'])}
            options={[...GUIA_FICHA.campos.igManejadoPor.opciones]}
            aria-label="Quién maneja el Instagram"
          />
        </Field>

        <Field
          label={GUIA_FICHA.campos.identidadNotas.label}
          hint={GUIA_FICHA.campos.identidadNotas.hint}
        >
          <TextArea
            value={form.identidadNotas}
            onChange={(event) => set('identidadNotas', event.target.value)}
            onBlur={(event) => evaluarCalidad('identidadNotas', event.target.value)}
            placeholder={GUIA_FICHA.campos.identidadNotas.ejemplo}
            rows={3}
          />
          {nudges.identidadNotas && GUIA_FICHA.campos.identidadNotas.mejora && (
            <CampoMejora mensaje={GUIA_FICHA.campos.identidadNotas.mejora} />
          )}
        </Field>
      </div>

      <Field
        label={GUIA_FICHA.campos.presenciaDigital.label}
        hint={GUIA_FICHA.campos.presenciaDigital.hint}
      >
        <TextArea
          value={form.presenciaDigital}
          onChange={(event) => set('presenciaDigital', event.target.value)}
          onBlur={(event) => evaluarCalidad('presenciaDigital', event.target.value)}
          placeholder={GUIA_FICHA.campos.presenciaDigital.ejemplo}
        />
        {nudges.presenciaDigital && GUIA_FICHA.campos.presenciaDigital.mejora && (
          <CampoMejora mensaje={GUIA_FICHA.campos.presenciaDigital.mejora} />
        )}
      </Field>

      <Field
        label={GUIA_FICHA.campos.resenas.label}
        hint={GUIA_FICHA.campos.resenas.hint}
      >
        <TextArea
          value={form.resenas}
          onChange={(event) => set('resenas', event.target.value)}
          onBlur={(event) => evaluarCalidad('resenas', event.target.value)}
          placeholder={GUIA_FICHA.campos.resenas.ejemplo}
          rows={5}
        />
        {nudges.resenas && GUIA_FICHA.campos.resenas.mejora && (
          <CampoMejora mensaje={GUIA_FICHA.campos.resenas.mejora} />
        )}
      </Field>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label={GUIA_FICHA.campos.contenidoReal.label}
          hint={GUIA_FICHA.campos.contenidoReal.hint}
        >
          <TextArea
            value={form.contenidoReal}
            onChange={(event) => set('contenidoReal', event.target.value)}
            onBlur={(event) => evaluarCalidad('contenidoReal', event.target.value)}
            placeholder={GUIA_FICHA.campos.contenidoReal.ejemplo}
          />
          {nudges.contenidoReal && GUIA_FICHA.campos.contenidoReal.mejora && (
            <CampoMejora mensaje={GUIA_FICHA.campos.contenidoReal.mejora} />
          )}
        </Field>

        <Field
          label={GUIA_FICHA.campos.senalesOperativas.label}
          hint={GUIA_FICHA.campos.senalesOperativas.hint}
        >
          <TextArea
            value={form.senalesOperativas}
            onChange={(event) => set('senalesOperativas', event.target.value)}
            onBlur={(event) => evaluarCalidad('senalesOperativas', event.target.value)}
            placeholder={GUIA_FICHA.campos.senalesOperativas.ejemplo}
          />
          {nudges.senalesOperativas && GUIA_FICHA.campos.senalesOperativas.mejora && (
            <CampoMejora mensaje={GUIA_FICHA.campos.senalesOperativas.mejora} />
          )}
        </Field>
      </div>

      {/*
        P5-A — El material del negocio, agrupado y con título propio: el setter
        tiene que ver que esto es UNA cosa (lo que la construcción necesita), no
        campos sueltos entre las observaciones. Todo opcional.
      */}
      <section
        aria-labelledby={materialesId}
        className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
      >
        <div>
          <h3 id={materialesId} className="text-sm font-semibold text-zinc-200">
            {GUIA_FICHA.grupos.materiales.titulo}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            {GUIA_FICHA.grupos.materiales.intro}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Field
            label={GUIA_FICHA.campos.resenasUrl.label}
            hint={GUIA_FICHA.campos.resenasUrl.hint}
            error={errorVisibleDe('resenasUrl')}
          >
            <Input
              type="url"
              inputMode="url"
              value={form.resenasUrl}
              onChange={(event) => set('resenasUrl', event.target.value)}
              onBlur={() => setEnlacesTocados((actual) => ({ ...actual, resenasUrl: true }))}
              placeholder={GUIA_FICHA.campos.resenasUrl.ejemplo}
            />
          </Field>

          <Field
            label={GUIA_FICHA.campos.imagenesUrl.label}
            hint={GUIA_FICHA.campos.imagenesUrl.hint}
            error={errorVisibleDe('imagenesUrl')}
          >
            <Input
              type="url"
              inputMode="url"
              value={form.imagenesUrl}
              onChange={(event) => set('imagenesUrl', event.target.value)}
              onBlur={() => setEnlacesTocados((actual) => ({ ...actual, imagenesUrl: true }))}
              placeholder={GUIA_FICHA.campos.imagenesUrl.ejemplo}
            />
          </Field>
        </div>

        <Field
          label={GUIA_FICHA.campos.otraRedUrl.label}
          hint={GUIA_FICHA.campos.otraRedUrl.hint}
          error={errorVisibleDe('otraRedUrl')}
        >
          <Input
            type="url"
            inputMode="url"
            value={form.otraRedUrl}
            onChange={(event) => set('otraRedUrl', event.target.value)}
            onBlur={() => setEnlacesTocados((actual) => ({ ...actual, otraRedUrl: true }))}
            placeholder={GUIA_FICHA.campos.otraRedUrl.ejemplo}
          />
        </Field>

        <Field
          label={GUIA_FICHA.campos.queVende.label}
          hint={GUIA_FICHA.campos.queVende.hint}
        >
          <TextArea
            value={form.queVende}
            onChange={(event) => set('queVende', event.target.value)}
            placeholder={GUIA_FICHA.campos.queVende.ejemplo}
            rows={3}
          />
        </Field>

        <Field
          label={GUIA_FICHA.campos.comoSePresenta.label}
          hint={GUIA_FICHA.campos.comoSePresenta.hint}
        >
          <TextArea
            value={form.comoSePresenta}
            onChange={(event) => set('comoSePresenta', event.target.value)}
            placeholder={GUIA_FICHA.campos.comoSePresenta.ejemplo}
            rows={3}
          />
        </Field>
      </section>

      <Field
        label={GUIA_FICHA.campos.otros.label}
        hint={GUIA_FICHA.campos.otros.hint}
      >
        <TextArea
          value={form.otros}
          onChange={(event) => set('otros', event.target.value)}
          rows={3}
        />
      </Field>

      {faltantesEnVivo.length > 0 ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] p-3">
          <p className="text-xs font-semibold text-amber-300">
            {GUIA_FICHA.validacion.pendienteTitulo}
          </p>
          <ul className="mt-1.5 space-y-1">
            {faltantesEnVivo.map((faltante) => (
              <li key={faltante} className="text-xs leading-relaxed text-amber-200/80">
                · {faltante}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] p-3 text-xs font-medium text-emerald-300">
          {GUIA_FICHA.validacion.completo}
        </p>
      )}

      {serverError && (
        <p role="alert" className="text-xs text-red-400">
          {serverError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button
          onClick={guardar}
          loading={isPending}
          icon={<Save size={15} strokeWidth={1.5} />}
        >
          Guardar ficha
        </Button>
        <AutosaveStatus phase={autosave.phase} isDirty={autosave.isDirty} busy={isPending} />
        <p className="text-[11px] text-zinc-600">
          Se guarda solo mientras escribís. Podés cerrar y seguir después.
        </p>
      </div>
    </div>
  )
}
