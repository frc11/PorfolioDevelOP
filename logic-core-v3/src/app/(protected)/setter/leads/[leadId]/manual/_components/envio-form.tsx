'use client'

import { Rocket, Send } from 'lucide-react'
import { Button } from '@/components/ui'
import { buildDemoMensajeBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { GUIA_ENVIO } from '@/lib/leados/guidance-content'
import { useStepAction } from '@/lib/use-step-action'
import { enviarDemoAprobada } from '@/app/(protected)/setter/_actions/outreach.actions'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { LineaRicaText } from '@/app/(protected)/setter/_components/teach-panel'

/**
 * M15 — la acción de envío, presentada en el manual (5.4, tramo Envío). Es
 * SÓLO la rama «gate abierto»: la demo aprobada, lista para mandar. NO reimplementa
 * el gate — lo decide `gateEnvioDemo` (flow.ts) server-side en el módulo `m15-envio`,
 * y la MISMA action existente (`enviarDemoAprobada`) lo re-valida en el server antes
 * de registrar (línea inviolable: acción y gate intactos, acá sólo se presentan).
 * El mensaje copiable sale del MISMO builder del wizard (`buildDemoMensajeBlock`).
 */
export function EnvioForm({
  leadId,
  lead,
  finalUrl,
  respondio,
}: {
  leadId: string
  lead: CopyBlockLead
  finalUrl: string
  respondio: boolean
}) {
  const envio = useStepAction()

  const registrarEnvioDemo = () => {
    envio.run(() => enviarDemoAprobada(leadId), {
      successToast: (data) =>
        data.yaEnviada
          ? 'Ese envío ya estaba registrado — no se duplica nada.'
          : 'Demo enviada registrada 🚀 — ahora el objetivo es la reunión.',
    })
  }

  return (
    <div className="space-y-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.05] p-4">
      <div className="flex items-center gap-2">
        <Rocket size={15} strokeWidth={1.5} className="text-emerald-400" />
        <p className="text-xs font-semibold text-emerald-300">{GUIA_ENVIO.listo}</p>
      </div>
      {!respondio && (
        <p className="text-xs leading-relaxed text-amber-200/90">
          <LineaRicaText linea={GUIA_ENVIO.preventivo} />
        </p>
      )}
      <CopyBlock
        titulo={GUIA_ENVIO.copyBlock.titulo}
        instruccion={GUIA_ENVIO.copyBlock.instruccion}
        texto={buildDemoMensajeBlock(lead, finalUrl)}
      />
      <Button onClick={registrarEnvioDemo} loading={envio.isPending} icon={<Send size={14} strokeWidth={1.5} />}>
        Ya la envié — registrar
      </Button>
    </div>
  )
}
