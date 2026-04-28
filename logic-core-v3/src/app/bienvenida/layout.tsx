import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function BienvenidaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20">
        {children}
      </div>
    </main>
  )
}
