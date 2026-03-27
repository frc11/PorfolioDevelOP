'use client'

import { useTransition } from 'react'
import { AlertaMetrica, type AlertaMetricaProps } from './AlertaMetrica'
import type { N8nMetrics, WorkflowMetrics } from '@/lib/n8n'
import { sendClientMessageAction } from '@/lib/actions/messages'

const PRIORITY: Record<string, number> = { DANGER: 0, WARNING: 1, INFO: 2, SUCCESS: 3 }

interface Props {
  totals: N8nMetrics['totals']
  workflows: WorkflowMetrics[]
}

export function AutomationsAlertas({ totals, workflows }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleReportWorkflow = (workflowName: string, failCount: number) => {
    startTransition(async () => {
      const fd = new FormData()
      fd.append(
        'content',
        `⚠️ El workflow "${workflowName}" tuvo ${failCount} fallos este mes. Solicitando revisión sin costo adicional.`
      )
      await sendClientMessageAction(null, fd)
    })
  }

  const alertas: AlertaMetricaProps[] = []

  // Per-workflow: failedExecutions > 5 → DANGER
  for (const wf of workflows) {
    if (wf.failedExecutions > 5) {
      const name = wf.name
      const count = wf.failedExecutions
      alertas.push({
        tipo: 'DANGER',
        titulo: `El workflow "${name}" tuvo ${count} fallos este mes`,
        descripcion: 'Lo revisamos sin costo adicional.',
        accion: {
          label: 'Reportar al equipo',
          onAction: () => handleReportWorkflow(name, count),
          disabled: isPending,
        },
      })
    }
  }

  // Global success rate < 90% → WARNING
  if (totals.executions > 0 && totals.successRate < 90) {
    alertas.push({
      tipo: 'WARNING',
      titulo: `Tu tasa de éxito bajó al ${totals.successRate.toFixed(1)}%`,
      descripcion: 'Lo normal es > 95%. Estamos monitoreando.',
    })
  }

  // ROI highlight → SUCCESS
  if (totals.totalRoi > 1000) {
    alertas.push({
      tipo: 'SUCCESS',
      titulo: '¡Tus automatizaciones están generando valor!',
      descripcion: `Generaron $${totals.totalRoi.toLocaleString('es-AR', {
        maximumFractionDigits: 0,
      })} USD este mes. ¡Están trabajando por vos!`,
    })
  }

  alertas.sort((a, b) => PRIORITY[a.tipo] - PRIORITY[b.tipo])
  const visible = alertas.slice(0, 3)

  if (visible.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {visible.map((a, i) => (
        <AlertaMetrica key={`${a.tipo}-${i}`} {...a} />
      ))}
    </div>
  )
}
