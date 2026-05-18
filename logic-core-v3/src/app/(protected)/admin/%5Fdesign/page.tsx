import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DesignPlaygroundClient } from './_components/DesignPlaygroundClient'

export default async function DesignPlaygroundPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Interno - develOP
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
          Design System
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Galeria viva de componentes y tokens. Referencia visual para disenar features nuevas.
        </p>
      </div>

      <DesignPlaygroundClient />
    </div>
  )
}
