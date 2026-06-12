'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Flame, Lock, MessageCircle, Send } from 'lucide-react'
import type { DossierStage, LeadStatus } from '@prisma/client'
import { Badge, Button, Card, Field } from '@/components/ui'
import type { Evaluacion, Ficha } from '@/lib/leados/contracts'
import { buildOpenerInputBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import {
  CANAL_INSTAGRAM,
  contieneLink,
  formatFechaCorta,
  leadRespondio,
} from '@/lib/leados/flow'
import { registrarOpener } from '@/app/(protected)/setter/_actions/outreach.actions'
import { OpenerInputSchema } from '@/app/(protected)/setter/_actions/outreach.schemas'
import { CanalSeguridad } from '@/app/(protected)/setter/_components/canal-seguridad'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { GuardrailRol } from '@/app/(protected)/setter/_components/guardrail-rol'
import { TextArea } from '@/app/(protected)/setter/_components/text-area'

type OpenerStepProps = {
  leadId: string
  lead: CopyBlockLead
  stage: DossierStage | null
  status: LeadStatus
  ficha: Ficha | null
  evaluacion: Evaluacion | null
  /** Contactos reales ya registrados (0 = opener pendiente). */
  contactos: number
  ultimoContacto: string | null
  proximoToque: string | null
  dmsHoy: number
}

/**
 * Paso 7 — El primer mensaje del flujo invertido: opener dolor-first, solo
 * texto, SIN link (acá la UI sí lo hace imposible: el schema rebota cualquier
 * link, en vivo y server-side). El envío es 100% manual — copiar y pegar en
 * Instagram — y al marcarlo se registra el contacto y la maquinaria arma el
 * follow-up sola.
 */
export function OpenerStep({
  leadId,
  lead,
  stage,
  status,
  ficha,
  evaluacion,
  contactos,
  ultimoContacto,
  proximoToque,
  dmsHoy,
}: OpenerStepProps) {
  const router = useRouter()
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // ── Antes de la evaluación: paso apagado ───────────────────────────────────
  if (stage === null || stage === 'FICHA') {
    return (
      <Card variant="subtle" padding="lg">
        <div className="flex items-center gap-2.5">
          <Lock size={15} strokeWidth={1.5} className="text-zinc-600" />
          <h2 className="text-base font-semibold text-zinc-400">
            Paso 7 — Primer contacto (opener)
          </h2>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
          Se habilita después de registrar la evaluación: el opener sale con veredicto.
        </p>
      </Card>
    )
  }

  // ── Opener ya registrado: resumen y a otra cosa ────────────────────────────
  if (contactos > 0) {
    return (
      <Card variant="subtle" padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <MessageCircle size={15} strokeWidth={1.5} className="text-zinc-500" />
            <h2 className="text-base font-semibold text-zinc-300">
              Paso 7 — Primer contacto (opener)
            </h2>
          </div>
          <Badge tone="emerald" variant="soft">
            Enviado
          </Badge>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          Primer contacto registrado{ultimoContacto ? ` el ${formatFechaCorta(ultimoContacto)}` : ''}.
          {proximoToque
            ? ` Próximo toque: ${formatFechaCorta(proximoToque)}.`
            : ''}{' '}
          La conversación sigue en el Paso 9.
        </p>
      </Card>
    )
  }

  // ── El lead ya respondió sin opener registrado (movida del admin) ──────────
  if (leadRespondio(status)) {
    return (
      <Card variant="subtle" padding="lg">
        <h2 className="text-base font-semibold text-zinc-300">
          Paso 7 — Primer contacto (opener)
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          Este lead ya respondió — no hace falta opener. Registrá la conversación en el
          Paso 9 y seguí con la producción de la demo.
        </p>
      </Card>
    )
  }

  const caliente = evaluacion !== null && evaluacion.score >= 4
  const largo = mensaje.trim().length
  const pasadoDeLargo = largo > CANAL_INSTAGRAM.openerMaxCaracteres
  const tieneLink = contieneLink(mensaje)
  const listoParaCopiar = largo >= 10 && !tieneLink

  const registrar = () => {
    setError(null)
    const parsed = OpenerInputSchema.safeParse({ mensaje })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisá el texto del opener')
      return
    }
    startTransition(async () => {
      const result = await registrarOpener(leadId, parsed.data)
      if (!result.success) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      toast.success(
        result.data.proximoToque
          ? `Opener registrado — próximo toque el ${formatFechaCorta(result.data.proximoToque)}.`
          : 'Opener registrado — quedó en seguimiento.',
      )
      router.refresh()
    })
  }

  // ── Activo: armar, copiar, mandar a mano, registrar ────────────────────────
  return (
    <Card padding="lg" className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-base font-semibold text-zinc-100">
            Paso 7 — Primer contacto (opener)
          </h2>
          {caliente && (
            <Badge tone="amber" variant="soft" icon={<Flame size={10} strokeWidth={1.5} />}>
              Caliente
            </Badge>
          )}
        </div>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">
          Solo texto, dolor-first, corto. Nada de precio y nada de link — el link viaja
          recién con la demo, cuando respondan. Lo mandás VOS desde Instagram (copiar y
          pegar) y acá lo registrás.
        </p>
        {caliente && (
          <p className="mt-2 max-w-xl rounded-xl border border-amber-400/20 bg-amber-500/[0.05] p-3 text-xs leading-relaxed text-amber-200/90">
            Lead caliente: tenés el camino preventivo disponible — podés producir la demo
            sin esperar respuesta y, cuando esté aprobada, acompañar el opener con el
            link desde el Paso 9. No es obligación: si el opener solo alcanza, mejor.
          </p>
        )}
      </div>

      <CanalSeguridad dmsHoy={dmsHoy} />

      {ficha && evaluacion && (
        <CopyBlock
          titulo="Bloque para el Gem de outreach"
          instruccion="Si usás el Gem para redactar el opener, este es su input completo."
          texto={buildOpenerInputBlock(lead, ficha, evaluacion)}
        />
      )}

      <Field
        label="Tu opener (el texto que vas a pegar en Instagram)"
        required
        error={error ?? undefined}
        hint={
          pasadoDeLargo
            ? `Llevás ${largo} caracteres — el recomendado es menos de ${CANAL_INSTAGRAM.openerMaxCaracteres}. Podés seguir, pero corto convierte mejor.`
            : `Menos de ${CANAL_INSTAGRAM.openerMaxCaracteres} caracteres. Que nombre algo real del negocio.`
        }
      >
        <TextArea
          value={mensaje}
          onChange={(event) => setMensaje(event.target.value)}
          invalid={Boolean(error) || tieneLink}
          rows={4}
        />
      </Field>

      {tieneLink && (
        <p className="text-xs font-medium text-rose-400">
          El opener va SIN link — sacalo. El link viaja recién con la demo aprobada
          (segundo mensaje, Paso 9).
        </p>
      )}

      {listoParaCopiar && (
        <CopyBlock
          titulo="Tu opener, listo para pegar"
          instruccion="Copialo, mandalo por DM en Instagram, y volvé a marcarlo acá."
          texto={mensaje.trim()}
        />
      )}

      <GuardrailRol compacto />

      <Button
        onClick={registrar}
        loading={isPending}
        disabled={tieneLink}
        icon={<Send size={14} strokeWidth={1.5} />}
      >
        Ya lo mandé en Instagram — registrar
      </Button>
    </Card>
  )
}
