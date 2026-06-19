import type { listAlerts } from '@/modules/chatbot/server/admin/manageAlerts'

// Tipos compartidos por AlertsClient, AlertCard y AlertColumnOverview.
// Aislados acá para evitar ciclos de import (AlertsClient importa los componentes,
// los componentes necesitan el tipo de fila).

export type AlertRow = Awaited<ReturnType<typeof listAlerts>>[number]

export type ColumnId = 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED'
