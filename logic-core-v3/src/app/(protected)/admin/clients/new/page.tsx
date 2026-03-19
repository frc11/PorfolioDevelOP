import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ClientForm } from '@/components/admin/ClientForm'
import { createClientAction } from '@/lib/actions/clients'

export default function NewClientPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href="/admin/clients"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ChevronLeft size={14} />
        Volver a clientes
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Agregar cliente</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Se creará un usuario CLIENT y su perfil de empresa asociado.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <ClientForm
          action={createClientAction}
          mode="create"
          cancelHref="/admin/clients"
        />
      </div>
    </div>
  )
}
