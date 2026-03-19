import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ProfileForm, PasswordForm } from '@/components/dashboard/ProfileForms'
import { Building2, Lock } from 'lucide-react'

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-4 flex items-center gap-2 border-b border-zinc-800 pb-4">
        <Icon size={15} className="text-cyan-400" />
        <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default async function ProfilePage() {
  const session = await auth()
  const clientId = session?.user?.clientId
  const userId = session?.user?.id
  if (!clientId || !userId) redirect('/login')

  const [user, client] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    prisma.client.findUnique({
      where: { id: clientId },
      select: { companyName: true, logoUrl: true },
    }),
  ])

  if (!user || !client) redirect('/login')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Mi perfil</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Gestioná los datos de tu cuenta y empresa
        </p>
      </div>

      {/* Company + contact data */}
      <Section title="Datos de empresa y contacto" icon={Building2}>
        <ProfileForm
          name={user.name ?? ''}
          email={user.email ?? ''}
          companyName={client.companyName}
          logoUrl={client.logoUrl}
        />
      </Section>

      {/* Password */}
      <Section title="Seguridad" icon={Lock}>
        <PasswordForm />
      </Section>
    </div>
  )
}
