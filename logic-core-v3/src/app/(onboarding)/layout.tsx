import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bienvenido | develOP',
  description: 'Proceso de onboarding VIP para clientes B2B develOP.',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#080a0c] text-zinc-100 flex-col selection:bg-cyan-500/30">
      {/* Premium ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: [
            'radial-gradient(circle at 15% 50%, rgba(6,182,212,0.08), transparent 25%)',
            'radial-gradient(circle at 85% 30%, rgba(16,185,129,0.06), transparent 25%)',
          ].join(', '),
        }}
      />
      <main className="relative z-10 flex flex-1 w-full h-full items-center justify-center">
        {children}
      </main>
    </div>
  )
}
