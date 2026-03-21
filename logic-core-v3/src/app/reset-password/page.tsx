import { ResetPasswordForm } from './ResetPasswordForm'

// ─── Page (Server Component) ──────────────────────────────────────────────────
// Recibe el token desde URL params y lo pasa al form como prop.

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080a0c] px-4">

      {/* Ambient glows */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 90% 50% at 50% -5%, rgba(6,182,212,0.12) 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 40% at 85% 80%, rgba(16,185,129,0.06) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <ResetPasswordForm token={token} />
    </main>
  )
}
