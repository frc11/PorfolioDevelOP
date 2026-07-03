'use client'

import { Flame, Lock } from 'lucide-react'
import type { DossierStage, LeadStatus } from '@prisma/client'
import { Badge, Card } from '@/components/ui'
import type { Evaluacion, Ficha } from '@/lib/leados/contracts'
import { buildOpenerInputBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { leadRespondio } from '@/lib/leados/flow'
import { GUIA_OPENER } from '@/lib/leados/guidance-content'
import { CanalSeguridad } from '@/app/(protected)/setter/_components/canal-seguridad'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { LineaRicaText, TeachPanel } from '@/app/(protected)/setter/_components/teach-panel'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import { OpenerForm, OpenerResumen } from './opener-form'

type OpenerStepProps = {
  leadId: string
  lead: CopyBlockLead
  stage: DossierStage | null
  status: LeadStatus
  /** admin-1b: campo persistido que marca Franco — habilita el camino preventivo. */
  caliente: boolean
  ficha: Ficha | null
  evaluacion: Evaluacion | null
  /** Contactos reales ya registrados (0 = opener pendiente). */
  contactos: number
  ultimoContacto: string | null
  proximoToque: string | null
  dmsHoy: number
}

/**
 * El opener — primer mensaje del flujo invertido: dolor-first, solo
 * texto, SIN link (acá la UI sí lo hace imposible: el schema rebota cualquier
 * link, en vivo y server-side). El envío es 100% manual — copiar y pegar en
 * Instagram — y al marcarlo se registra el contacto y la maquinaria arma el
 * follow-up sola.
 *
 * El CHROME del wizard (intro, teach, canal, el bloque del Gem) vive acá; el
 * núcleo de escritura y el resumen «Enviado» son piezas compartidas
 * (`OpenerForm`/`OpenerResumen`) para que el manual (M4) sea otra presentación
 * del MISMO camino — comportamiento idéntico, suites como testigo.
 */
export function OpenerStep({
  leadId,
  lead,
  stage,
  status,
  caliente,
  ficha,
  evaluacion,
  contactos,
  ultimoContacto,
  proximoToque,
  dmsHoy,
}: OpenerStepProps) {
  // ── Antes de la evaluación: paso apagado ───────────────────────────────────
  if (stage === null || stage === 'FICHA') {
    return (
      <Card variant="subtle" padding="lg">
        <div className="flex items-center gap-2.5">
          <Lock size={15} strokeWidth={1.5} className="text-zinc-600" />
          <h2 className="text-base font-semibold text-zinc-400">
            Primer contacto (opener)
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
    return <OpenerResumen ultimoContacto={ultimoContacto} proximoToque={proximoToque} />
  }

  // ── El lead ya respondió sin opener registrado (movida del admin) ──────────
  if (leadRespondio(status)) {
    return (
      <Card variant="subtle" padding="lg">
        <h2 className="text-base font-semibold text-zinc-300">
          Primer contacto (opener)
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          Este lead ya respondió — no hace falta opener. Registrá la conversación en
          «Seguimiento» y seguí con la producción de la demo.
        </p>
      </Card>
    )
  }

  // ── Activo: armar, copiar, mandar a mano, registrar ────────────────────────
  return (
    <Card padding="lg" className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-base font-semibold text-zinc-100">
            Primer contacto (opener)
          </h2>
          {caliente && (
            <Badge tone="amber" variant="soft" icon={<Flame size={10} strokeWidth={1.5} />}>
              Caliente
            </Badge>
          )}
        </div>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">
          <LineaRicaText linea={GUIA_OPENER.intro} />
        </p>
        {caliente && (
          <p className="mt-2 max-w-xl rounded-xl border border-amber-400/20 bg-amber-500/[0.05] p-3 text-xs leading-relaxed text-amber-200/90">
            Lead caliente: tenés el camino preventivo disponible — podés producir la demo
            sin esperar respuesta y, cuando esté aprobada, acompañar el opener con el
            link desde «Seguimiento». No es obligación: si el opener solo alcanza, mejor.
          </p>
        )}
      </div>

      <TeachPanel id="opener" />

      <CanalSeguridad dmsHoy={dmsHoy} />

      <ToolGuide id="gemOutreach" />

      {ficha && evaluacion && (
        <CopyBlock
          titulo="Bloque para el Gem de outreach"
          instruccion="Si usás el Gem para redactar el opener, este es su input completo."
          texto={buildOpenerInputBlock(lead, ficha, evaluacion)}
        />
      )}

      <OpenerForm leadId={leadId} />
    </Card>
  )
}
