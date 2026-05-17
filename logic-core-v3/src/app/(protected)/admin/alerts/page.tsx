import { listAlerts } from '@/modules/chatbot/server/admin/manageAlerts'
import { AlertsClient } from './AlertsClient'

export default async function AlertsPage() {
  const alerts = await listAlerts()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Sistema / Alertas
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
          Alertas del sistema
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Issues detectados automaticamente cada 15 minutos
        </p>
      </div>

      <AlertsClient initialAlerts={alerts} />
    </div>
  )
}
