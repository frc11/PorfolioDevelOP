'use client'

import { AdminErrorBoundary } from '../_components/AdminErrorBoundary'

export default function TicketsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <AdminErrorBoundary error={error} reset={reset} context="tickets" />
}
