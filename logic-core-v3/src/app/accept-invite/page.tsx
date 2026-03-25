import { AcceptInviteForm } from './AcceptInviteForm'
import { InviteBackground } from './InviteBackground'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080a0c] px-4">

      <InviteBackground />

      <AcceptInviteForm token={token} />
    </main>
  )
}
