import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ClientForm } from '@/components/admin/ClientForm'
import { createClientAction } from '@/lib/actions/clients'
import { FadeIn } from '@/components/dashboard/FadeIn'

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; name?: string; email?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <div>
          <Link
            href="/admin/clients"
            className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <ChevronLeft size={14} />
            Volver a clientes
          </Link>
          <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
            Clientes
          </p>
          <h1 className="text-xl font-bold text-zinc-100">Agregar cliente</h1>
          <p className="mt-0.5 text-sm text-zinc-600">
            Se creará un usuario CLIENT y su perfil de empresa asociado.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <ClientForm
          action={createClientAction}
          mode="create"
          initialValues={{
            clientId: '',
            companyName: params.company ?? '',
            name: params.name ?? '',
            email: params.email ?? '',
          }}
          cancelHref="/admin/clients"
        />
      </FadeIn>
    </div>
  )
}
