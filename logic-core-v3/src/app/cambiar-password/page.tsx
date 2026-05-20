import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { CambiarPasswordForm } from './CambiarPasswordForm'

export default async function CambiarPasswordPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-2">
            develOP
          </p>
          <h1 className="text-2xl font-semibold text-zinc-100">
            Cambiá tu contraseña
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Por seguridad, necesitás definir una nueva antes de entrar.
          </p>
        </div>

        <CambiarPasswordForm
          forceChange={session.user.passwordResetRequired}
          userEmail={session.user.email ?? ''}
        />
      </div>
    </div>
  )
}
