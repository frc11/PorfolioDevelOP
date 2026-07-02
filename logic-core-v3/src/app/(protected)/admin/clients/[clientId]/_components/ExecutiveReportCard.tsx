import { Card, CardTitle } from '@/components/ui'
import { SendExecutiveReportButton } from './SendExecutiveReportButton'

interface Props {
  clientId: string
}

export function ExecutiveReportCard({ clientId }: Props) {
  return (
    <Card variant="elevated" padding="lg" className="space-y-4">
      <div>
        <CardTitle>Reporte ejecutivo semanal</CardTitle>
        <p className="mt-1 text-[11px] text-zinc-500">
          Dispara manualmente el envío del reporte ejecutivo semanal (el mismo
          que corre por cron los lunes) para esta organización. Útil para
          verificar o reintentar sin esperar al cron. Si ya se envió esta
          semana, no reenvía.
        </p>
      </div>
      <SendExecutiveReportButton organizationId={clientId} />
    </Card>
  )
}
