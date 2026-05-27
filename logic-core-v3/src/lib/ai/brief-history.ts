import { prisma } from '@/lib/prisma'
import type { HealthScoreResult } from '@/lib/health-score'
import type { WeekResultsData } from '@/lib/dashboard/week-results'

export type ExecutiveBriefSnapshotItem = {
  id: string
  organizationId: string
  content: string
  periodKey: string
  createdAt: Date
  healthScores: HealthScoreResult
  weekResults: WeekResultsData
}

/**
 * Devuelve los últimos `n` snapshots del executive brief de una organización,
 * ordenados del más reciente al más antiguo. Se usa para comparar el brief
 * semanal contra semanas anteriores (lo consume el reporte semanal B6.2).
 *
 * Los JSON guardados (healthScores, weekResults) se castean a su shape de
 * dominio. Vienen de la propia escritura tipada de `persistBriefSnapshot`,
 * así que la forma es estable.
 */
export async function getBriefHistory(
  organizationId: string,
  n: number,
): Promise<ExecutiveBriefSnapshotItem[]> {
  const take = Math.max(1, Math.min(52, Math.floor(n)))

  const rows = await prisma.executiveBriefSnapshot.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take,
  })

  return rows.map((row) => ({
    id: row.id,
    organizationId: row.organizationId,
    content: row.content,
    periodKey: row.periodKey,
    createdAt: row.createdAt,
    healthScores: row.healthScores as unknown as HealthScoreResult,
    weekResults: row.weekResults as unknown as WeekResultsData,
  }))
}
