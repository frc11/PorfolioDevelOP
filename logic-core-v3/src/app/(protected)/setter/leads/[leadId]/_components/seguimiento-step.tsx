'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CalendarClock, CheckCircle2, Lock, Rocket, Send } from 'lucide-react'
import type { DossierStage, LeadStatus } from '@prisma/client'
import { Badge, Button, Card, Field, Input } from '@/components/ui'
import type { Evaluacion } from '@/lib/leados/contracts'
import {
  buildDemoMensajeBlock,
  buildObjecionInputBlock,
  type CopyBlockLead,
} from '@/lib/leados/copy-blocks'
import {
  cadenciaInfo,
  formatFechaCorta,
  gateEnvioDemo,
  leadRespondio,
  PLANTILLAS_FOLLOW_UP,
  STATUS_LABELS,
} from '@/lib/leados/flow'
import {
  enviarDemoAprobada,
  registrarResultado,
} from '@/app/(protected)/setter/_actions/outreach.actions'
import {
  ResultadoInputSchema,
  type ResultadoContacto,
} from '@/app/(protected)/setter/_actions/outreach.schemas'
import { CanalSeguridad } from '@/app/(protected)/setter/_components/canal-seguridad'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { GuardrailRol } from '@/app/(protected)/setter/_components/guardrail-rol'
import { TeachPanel } from '@/app/(protected)/setter/_components/teach-panel'
import { TextArea } from '@/app/(protected)/setter/_components/text-area'
import { HerramientaLauncher } from '@/app/(protected)/setter/_components/tool-guide'

type SeguimientoStepProps = {
  leadId: string
  lead: CopyBlockLead
  stage: DossierStage | null
  status: LeadStatus
  evaluacion: Evaluacion | null
  /** Contactos reales registrados (opener + toques). */
  contactos: number
  /** Conteo de SIN_RESPUESTA (opener incluido) — alimenta cadenciaInfo. */
  followUpCount: number
  proximoToque: string | null
  reactivateAt: string | null
  finalUrl: string | null
  demoEnviadaAt: string | null
  dmsHoy: number
}

type OpcionResultado = {
  valor: ResultadoContacto
  etiqueta: string
  detalle: string
}

const OPCIONES: OpcionResultado[] = [
  {
    valor: 'SIN_RESPUESTA',
    etiqueta: 'No respondió — mandé un follow-up',
    detalle: 'Registra el toque; la fecha del próximo la calcula el sistema solo.',
  },
  {
    valor: 'RESPONDIO',
    etiqueta: 'Respondió',
    detalle:
      'Abre la producción de la demo (Paso 3 — Brief) y frena el follow-up. ¿Aceptó reunirse? Eso se agenda más abajo, en «Agendar la reunión».',
  },
  // B7: 'CALL_AGENDADA' ya no se registra a mano — la reunión se agenda en
  // «Agendar la reunión» con horarios reales, y el booking confirmado mueve el estado.
  {
    valor: 'POSTERGADO',
    etiqueta: 'Postergar',
    detalle: 'Pausa el contacto hasta la fecha que elijas; el panel lo retoma ahí.',
  },
  {
    valor: 'RECHAZADO',
    etiqueta: 'Rechazó',
    detalle: 'Queda registrado; el cierre del lead lo decide Franco.',
  },
]

function toastDeResultado(resultado: string, proximoToque: string | null): string {
  switch (resultado) {
    case 'SIN_RESPUESTA':
      return proximoToque
        ? `Toque registrado — próximo follow-up el ${formatFechaCorta(proximoToque)}.`
        : 'Toque registrado — la cadencia ya cortó: sin más toques automáticos.'
    case 'RESPONDIO':
      return 'Respondió 🎉 — se abrió el brief (Paso 3). A producir la demo.'
    case 'POSTERGADO':
      return 'Postergado — el panel lo retoma en la fecha que marcaste.'
    default:
      return 'Registrado. Franco lo ve en el pipeline y decide el cierre.'
  }
}

/**
 * La conversación después del opener: registrar cada toque (la
 * maquinaria mueve status y cadencia, el setter nunca calcula fechas) y el
 * momento clave del flujo invertido: enviar el link de la demo aprobada —
 * SOLO cuando el lead respondió (o es caliente) y Franco aprobó con URL
 * final. Antes de eso, el envío directamente no se ofrece.
 */
export function SeguimientoStep({
  leadId,
  lead,
  stage,
  status,
  evaluacion,
  contactos,
  followUpCount,
  proximoToque,
  reactivateAt,
  finalUrl,
  demoEnviadaAt,
  dmsHoy,
}: SeguimientoStepProps) {
  const router = useRouter()
  const [resultado, setResultado] = useState<ResultadoContacto | null>(null)
  const [nota, setNota] = useState('')
  const [fechaReactivacion, setFechaReactivacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [enviandoDemo, startEnvioDemo] = useTransition()

  const score = evaluacion?.score ?? null
  const respondio = leadRespondio(status)
  const demoEnviada = Boolean(demoEnviadaAt)
  const puedeEnviar =
    !demoEnviada && gateEnvioDemo({ status, score, stage, finalUrl })
  const cadencia = cadenciaInfo(followUpCount)
  const activo = contactos > 0 || respondio || puedeEnviar || demoEnviada

  // ── Sin conversación todavía: paso apagado ─────────────────────────────────
  if (!activo) {
    return (
      <Card variant="subtle" padding="lg">
        <div className="flex items-center gap-2.5">
          <Lock size={15} strokeWidth={1.5} className="text-zinc-600" />
          <h2 className="text-base font-semibold text-zinc-400">
            Seguimiento y envío de la demo
          </h2>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
          Se abre cuando registrás el primer contacto (el opener). Acá vas a seguir la
          conversación, registrar lo que pase y — en el momento correcto — enviar la demo.
        </p>
      </Card>
    )
  }

  const registrar = () => {
    setError(null)
    const payload = {
      resultado: resultado ?? undefined,
      nota,
      reactivateAt: fechaReactivacion || undefined,
    }
    const parsed = ResultadoInputSchema.safeParse(payload)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisá lo que registraste')
      return
    }
    startTransition(async () => {
      const result = await registrarResultado(leadId, parsed.data)
      if (!result.success) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      toast.success(toastDeResultado(result.data.resultado, result.data.proximoToque))
      setResultado(null)
      setNota('')
      setFechaReactivacion('')
      router.refresh()
    })
  }

  const registrarEnvioDemo = () => {
    startEnvioDemo(async () => {
      const result = await enviarDemoAprobada(leadId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(
        result.data.yaEnviada
          ? 'Ese envío ya estaba registrado — no se duplica nada.'
          : 'Demo enviada registrada 🚀 — ahora el objetivo es la reunión.',
      )
      router.refresh()
    })
  }

  const minReactivacion = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  return (
    <Card padding="lg" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-zinc-100">
          Seguimiento y envío de la demo
        </h2>
        <Badge tone="zinc" variant="outline">
          {STATUS_LABELS[status]}
        </Badge>
      </div>

      {/* Estado de la cadencia — la calcula la maquinaria, acá solo se muestra */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <CalendarClock size={13} strokeWidth={1.5} />
          Toques de follow-up: <span className="font-semibold text-zinc-300">{cadencia.toquesHechos} de {PLANTILLAS_FOLLOW_UP.length}</span>
        </span>
        {status === 'POSTERGADO' && reactivateAt ? (
          <span>
            Postergado — se retoma el{' '}
            <span className="font-semibold text-zinc-300">{formatFechaCorta(reactivateAt)}</span>
          </span>
        ) : proximoToque && !respondio ? (
          <span>
            Próximo toque:{' '}
            <span className="font-semibold text-zinc-300">{formatFechaCorta(proximoToque)}</span>
          </span>
        ) : null}
        {cadencia.agotada && !respondio && status !== 'POSTERGADO' && (
          <span className="text-amber-300/90">
            Cadencia completa — sin más toques: si no respondió, el lead se enfría solo.
          </span>
        )}
      </div>

      {/* ── El envío del link: el momento clave del flujo invertido ─────────── */}
      {demoEnviada ? (
        <p className="flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] p-3 text-xs leading-relaxed text-emerald-300">
          <CheckCircle2 size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" />
          <span>
            Demo enviada{demoEnviadaAt ? ` el ${formatFechaCorta(demoEnviadaAt)}` : ''}. El
            follow-up ya quedó armado — de acá en adelante el objetivo es UNO: la reunión.
            Preguntá si la pudo ver y proponé un horario.
          </span>
        </p>
      ) : puedeEnviar && finalUrl ? (
        <div className="space-y-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.05] p-4">
          <div className="flex items-center gap-2">
            <Rocket size={15} strokeWidth={1.5} className="text-emerald-400" />
            <p className="text-xs font-semibold text-emerald-300">
              Demo aprobada — momento de enviar el link
            </p>
          </div>
          {!respondio && (
            <p className="text-xs leading-relaxed text-amber-200/90">
              Camino preventivo (lead caliente): la estás mandando antes de que responda.
              Puede acompañar al opener — vos decidís el momento.
            </p>
          )}
          <CopyBlock
            titulo="Segundo mensaje — la demo con su link"
            instruccion="Base editable: adaptala a la conversación y pegala en Instagram. El link va acá y solo acá."
            texto={buildDemoMensajeBlock(lead, finalUrl)}
          />
          <Button
            onClick={registrarEnvioDemo}
            loading={enviandoDemo}
            icon={<Send size={14} strokeWidth={1.5} />}
          >
            Ya la envié — registrar
          </Button>
        </div>
      ) : (
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-relaxed text-zinc-500">
          {stage === 'APROBADA'
            ? 'La demo está aprobada — el link se libera cuando el negocio responda (o si el lead fuera caliente).'
            : respondio
              ? 'El link se envía cuando Franco apruebe la demo (la producción pasa por brief, construcción y self-check). Hasta ahí, este paso no lo ofrece.'
              : 'El link de la demo se envía recién cuando el negocio responde Y Franco la aprueba — nunca antes. Mientras tanto: seguí la cadencia.'}
        </p>
      )}

      {/* ── Registrar lo que pasó ────────────────────────────────────────────── */}
      {contactos > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-zinc-300">Registrá lo que pasó</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {OPCIONES.map((opcion) => {
              const seleccionada = resultado === opcion.valor
              return (
                <button
                  key={opcion.valor}
                  type="button"
                  onClick={() => setResultado(opcion.valor)}
                  aria-pressed={seleccionada}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    seleccionada
                      ? 'border-cyan-400/40 bg-cyan-500/[0.08]'
                      : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <p className={`text-xs font-semibold ${seleccionada ? 'text-cyan-300' : 'text-zinc-200'}`}>
                    {opcion.etiqueta}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
                    {opcion.detalle}
                  </p>
                </button>
              )
            })}
          </div>

          {resultado === 'POSTERGADO' && (
            <Field label="¿Cuándo retomamos el contacto?" required>
              <Input
                type="date"
                min={minReactivacion}
                value={fechaReactivacion}
                onChange={(event) => setFechaReactivacion(event.target.value)}
              />
            </Field>
          )}

          {resultado !== null && (
            <Field
              label="Nota (opcional)"
              hint="Qué dijo, qué tono tenía — lo que ayude al próximo toque o a Franco."
            >
              <TextArea value={nota} onChange={(event) => setNota(event.target.value)} rows={2} />
            </Field>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          <Button
            onClick={registrar}
            loading={isPending}
            disabled={resultado === null}
            variant="secondary"
          >
            Registrar resultado
          </Button>
        </div>
      ) : (
        <p className="text-xs leading-relaxed text-zinc-600">
          Cuando registres el opener vas a poder registrar acá cada toque de la
          conversación.
        </p>
      )}

      {/* ── Mensaje del próximo toque (cadencia templada, sin link) ─────────── */}
      {!respondio &&
        !demoEnviada &&
        status !== 'POSTERGADO' &&
        contactos > 0 &&
        cadencia.proximoToque !== null && (
          <CopyBlock
            titulo={`Mensaje base del toque ${cadencia.proximoToque} de ${PLANTILLAS_FOLLOW_UP.length}`}
            instruccion="Adaptalo al negocio antes de mandarlo — templado, sin link y sin precio."
            texto={PLANTILLAS_FOLLOW_UP[cadencia.proximoToque - 1]}
          />
        )}

      <CanalSeguridad dmsHoy={dmsHoy} />

      <GuardrailRol />

      <details>
        <summary className="cursor-pointer text-xs font-medium text-zinc-500 hover:text-zinc-300">
          ¿Te tiraron una objeción? Armá el input del Gem
        </summary>
        <div className="mt-3 space-y-3">
          <TeachPanel id="objeciones" collapsible={false} />
          <CopyBlock
            titulo="Bloque para el Gem de outreach — objeciones"
            instruccion="Pegale la objeción al final. El Gem deflecta a reunión: nunca cotiza."
            texto={buildObjecionInputBlock(lead)}
          />
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-600">Abrí el Gem para pegarlo:</span>
            <HerramientaLauncher id="gemOutreach" />
          </div>
        </div>
      </details>
    </Card>
  )
}
