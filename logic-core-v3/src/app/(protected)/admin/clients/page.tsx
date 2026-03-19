import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { DeleteClientButton } from '@/components/admin/DeleteClientButton'

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      user: { select: { name: true, email: true } },
      services: { where: { status: 'ACTIVE' } },
      projects: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Clientes</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {clients.length} {clients.length === 1 ? 'registro' : 'registros'}
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-cyan-400"
        >
          + Agregar cliente
        </Link>
      </div>

      {/* Empty state */}
      {clients.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-10 text-center">
          <p className="text-zinc-500">No hay clientes registrados todavía.</p>
          <Link
            href="/admin/clients/new"
            className="mt-3 inline-block text-sm text-cyan-400 hover:text-cyan-300"
          >
            Crear el primero →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900">
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Empresa</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Email</th>
                <th className="px-4 py-3 text-center font-medium text-zinc-400">Servicios</th>
                <th className="px-4 py-3 text-center font-medium text-zinc-400">Proyectos</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Alta</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="transition-colors hover:bg-zinc-900/60"
                >
                  <td className="px-4 py-3 font-medium text-zinc-100">
                    {client.companyName}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{client.user.email}</td>
                  <td className="px-4 py-3 text-center text-zinc-300">
                    {client.services.length}
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-300">
                    {client.projects.length}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(client.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="text-cyan-400 transition-colors hover:text-cyan-300"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/admin/clients/${client.id}/edit`}
                        className="text-zinc-400 transition-colors hover:text-zinc-100"
                      >
                        Editar
                      </Link>
                      <DeleteClientButton
                        clientId={client.id}
                        companyName={client.companyName}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
