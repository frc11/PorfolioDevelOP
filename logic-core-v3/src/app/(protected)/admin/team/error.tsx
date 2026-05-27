'use client'

import { AdminErrorBoundary } from '../_components/AdminErrorBoundary'

export default function AdminTeamError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <AdminErrorBoundary error={error} reset={reset} context="team" />
}
