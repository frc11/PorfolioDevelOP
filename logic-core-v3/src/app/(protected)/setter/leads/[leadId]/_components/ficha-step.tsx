'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, Save, Timer } from 'lucide-react'
import { Button, Card, Field, Select } from '@/components/ui'
import { FichaSchema, type Ficha } from '@/lib/leados/contracts'
import { buildFichaCopyBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { fichaFaltantes } from '@/lib/leados/flow'
import { useAutosave } from '@/lib/use-autosave'
import { useUnsavedGuard } from '@/lib/use-unsaved-guard'
import { guardarFicha } from '@/app/(protected)/setter/_actions/dossier.actions'
import { AutosaveStatus } from '@/app/(protected)/setter/_components/autosave-status'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { TextArea } from '@/app/(protected)/setter/_components/text-area'

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

type FichaStepProps = {
  leadId: string
  lead: CopyBlockLead
  ficha: Ficha | null
  /** false una vez registrada la evaluación: la ficha queda congelada. */
  editable: boolean
}

export function FichaStep({ leadId, lead, ficha, editable }: FichaStepProps) {
  const router = useRouter()
  const [form, setForm] = useState<FichaFormState>(() => estadoInicial(ficha))
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Autosave del trabajo escrito: reusa `guardarFicha` (parcial-safe, NUNCA
  // transiciona de stage, ownership por `assignedToId` dentro de la action).
  // Inerte una vez congelada la ficha (`editable` false).
  const autosave = useAutosave<FichaFormState>({
    value: form,
    enabled: editable,
    save: (estado) => guardarFicha(leadId, aPayload(estado)),
  })
  useUnsavedGuard(autosave.isDirty)

  const faltantesEnVivo = useMemo(() => fichaFaltantes(aPayload(form)), [form])
  const faltantesGuardados = fichaFaltantes(ficha)

  const set = <Campo extends keyof FichaFormState>(campo: Campo, valor: FichaFormState[Campo]) => {
    setForm((actual) => ({ ...actual, [campo]: valor }))
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

  // Ficha congelada (post-evaluación): solo lectura, colapsada.
  if (!editable) {
    return (
      <details className="rounded-2xl border border-white/10 bg-white/[0.02]">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 text-sm font-medium text-zinc-300 [&::-webkit-details-marker]:hidden">
          <Eye size={15} strokeWidth={1.5} className="text-zinc-500" />
          Ver la ficha de observación (congelada: el Evaluador ya la leyó)
        </summary>
        <div className="border-t border-white/[0.06] px-5 py-4">
          {ficha ? (
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-400">
              {buildFichaCopyBlock(lead, ficha)}
            </pre>
          ) : (
            <p className="text-xs text-zinc-600">No hay ficha guardada.</p>
          )}
        </div>
      </details>
    )
  }

  return (
    <Card padding="lg" className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Paso 1 — Ficha de observación</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">
            Anotá lo que <span className="font-semibold text-zinc-300">ves</span>, no lo que
            opinás: el diagnóstico lo hace el Evaluador después. Podés guardar a medias y volver.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-zinc-400">
          <Timer size={12} strokeWidth={1.5} />
          ~10 min. Si te pasaste, ya tenés de sobra.
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label="¿Quién maneja el Instagram?"
          hint="El dueño suele hablar en primera persona y responder él mismo; un CM postea prolijo y genérico. Fijate quién contesta los comentarios."
        >
          <Select
            value={form.igManejadoPor}
            onChange={(event) => set('igManejadoPor', event.target.value as FichaFormState['igManejadoPor'])}
            options={[
              { value: '', label: 'Todavía no lo sé' },
              { value: 'DUENO', label: 'El dueño' },
              { value: 'CM', label: 'Un community manager' },
              { value: 'NO_SABE', label: 'No se puede determinar' },
            ]}
            aria-label="Quién maneja el Instagram"
          />
        </Field>

        <Field
          label="Identidad — notas"
          hint="Nombre del dueño si aparece, hace cuánto existe el negocio, cualquier pista de quién decide."
        >
          <TextArea
            value={form.identidadNotas}
            onChange={(event) => set('identidadNotas', event.target.value)}
            placeholder="Ej: la cuenta la firma 'Marce', aparece en las fotos del local…"
            rows={3}
          />
        </Field>
      </div>

      <Field
        label="Presencia digital"
        hint="Qué tienen y qué no: IG, web, Maps, WhatsApp. ¿Última publicación hace cuánto? ¿Responden comentarios y mensajes?"
      >
        <TextArea
          value={form.presenciaDigital}
          onChange={(event) => set('presenciaDigital', event.target.value)}
          placeholder="Ej: IG activo (publican 2-3 veces por semana), sin web, ficha de Maps sin fotos…"
        />
      </Field>

      <Field
        label="Reseñas crudas"
        hint="Copiá textuales las reseñas con queja que se repite — la misma queja 2+ veces vale oro. Las de 5 estrellas vacías no suman."
      >
        <TextArea
          value={form.resenas}
          onChange={(event) => set('resenas', event.target.value)}
          placeholder={'Ej:\n★☆☆☆☆ "Nunca contestan el WhatsApp" (mar 2026)\n★★☆☆☆ "Rico pero tardaron una hora en responder el pedido"'}
          rows={5}
        />
      </Field>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label="Contenido real (logo / fotos / tono)"
          hint="¿Las fotos son del negocio real o stock? ¿Hay logo? ¿Qué tono usan: formal, cercano, descuidado?"
        >
          <TextArea
            value={form.contenidoReal}
            onChange={(event) => set('contenidoReal', event.target.value)}
            placeholder="Ej: fotos reales del local pero oscuras, logo pixelado, tono cercano…"
          />
        </Field>

        <Field
          label="Señales operativas"
          hint="Horarios, si toman pedidos/reservas y por dónde, demoras que mencionen los clientes, delivery o turnos."
        >
          <TextArea
            value={form.senalesOperativas}
            onChange={(event) => set('senalesOperativas', event.target.value)}
            placeholder="Ej: toman pedidos solo por DM, horario en la bio desactualizado…"
          />
        </Field>
      </div>

      <Field
        label="Otras observaciones"
        hint="Todo lo que viste y no entra arriba. Mejor que sobre a que falte."
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
            Para habilitar la evaluación todavía falta:
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
          ✓ Señal mínima lista — guardá y pasala por el Evaluador.
        </p>
      )}

      {serverError && <p className="text-xs text-red-400">{serverError}</p>}

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

      {ficha && faltantesGuardados.length === 0 && (
        <CopyBlock
          titulo="Bloque para el Evaluador"
          instruccion="Se arma con lo último guardado. Copialo, pegalo en el Evaluador y volvé con el resultado al paso 2."
          texto={buildFichaCopyBlock(lead, ficha)}
        />
      )}
    </Card>
  )
}
