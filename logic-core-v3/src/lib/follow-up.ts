const DAY_IN_MS = 24 * 60 * 60 * 1000

export function calculateNextFollowUp(currentFollowUpNumber: number): Date | null {
  if (currentFollowUpNumber === 1 || currentFollowUpNumber === 2) {
    return new Date(Date.now() + 2 * DAY_IN_MS)
  }

  if (currentFollowUpNumber === 3) {
    return new Date(Date.now() + 3 * DAY_IN_MS)
  }

  return null
}

export function countFollowUps(activities: { result: string | null }[]): number {
  return activities.filter((activity) => activity.result === 'SIN_RESPUESTA').length
}
