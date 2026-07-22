'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { Button, Field, Select, TextArea } from '@/components/ui'
import { FichaSchema, type Ficha } from '@/lib/leados/contracts'
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
  otros: string
}

function estadoInicial(ficha: Ficha | null): FichaFormState {
  return {
    igManejadoPor: ficha?.identidad?.igManejadoPor ?? '',
    identidadNotas: ficha?.identidad?.notas ?? '',
    presenciaDigital: ficha?.presenciaDigital ?? '',
    resenas: ficha?.resenas ?? '',
    contenidoReal: ficha?.contenidoReal ?? '',
    senalesOperativas: ficha?.senalesOperativas ?? '',
    otros: ficha?.otros ?? '',
  }
}

function aPayload(state: FichaFormState): Ficha {
  // FichaSchema convierte strings vacíos en undefined — el payload queda limpio
  return FichaSchema.parse({
    identidad: {
      notas: state.identidadNotas,
      igManejadoPor: state.igManejadoPor === '' ? undefined : state.igManejadoPor,
    },
    presenciaDigital: state.presenciaDigital,
    resenas: state.resenas,
    contenidoReal: state.contenidoReal,
    senalesOperativas: state.senalesOperativas,
    otros: state.otros,
  })
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

  // Autosave del trabajo escrito: reusa `guardarFicha` (parcial-safe, NUNCA
  // transiciona de stage, ownership por `assignedToId` dentro de la action).
  const autosave = useAutosave<FichaFormState>({
    value: form,
    enabled: true,
    save: (estado) => guardarFicha(leadId, aPayload(estado)),
  })
  useUnsavedGuard(autosave.isDirty)

  const faltantesEnVivo = useMemo(() => fichaFaltantes(aPayload(form)), [form])

  const set = <Campo extends keyof FichaFormState>(campo: Campo, valor: FichaFormState[Campo]) => {
    setForm((actual) => ({ ...actual, [campo]: valor }))
    // Apenas edita, el nudge desaparece: nunca molesta MIENTRAS tipea (se
    // re-evalúa solo al salir del campo, en `evaluarCalidad`).
    setNudges((actual) => (actual[campo] ? { ...actual, [campo]: false } : actual))
  }

  // Validación de CALIDAD al SALIR del campo (onBlur). ADVISORY: orienta cómo
  // enriquecer un input flojo; NO gatea el avance ni el submit (ver
  // `ficha-calidad.ts`). Lee el valor del evento — siempre el más fresco.
  const evaluarCalidad = (campo: keyof FichaFormState, valor: string) => {
    setNudges((actual) => ({ ...actual, [campo]: campoFichaFlojo(valor) }))
  }

  const guardar = () => {
    setServerError(null)
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
