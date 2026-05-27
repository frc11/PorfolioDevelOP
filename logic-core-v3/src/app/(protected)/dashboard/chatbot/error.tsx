'use client'

import { SectionErrorBoundary } from '@/components/ui'

export default function ChatbotError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <SectionErrorBoundary
      error={error}
      reset={reset}
      section="dashboard.chatbot"
      tone="amber"
    />
  )
}
