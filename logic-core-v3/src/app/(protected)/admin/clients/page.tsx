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
          <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
            Gestión
          </p>
          <h1 className="text-xl font-bold text-zinc-100">Clientes</h1>
          <p className="mt-0.5 text-sm text-zinc-600">
            {clients.length} {clients.length === 1 ? 'registro' : 'registros'}
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-950 transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
        >
          + Agregar cliente
        </Link>
      </div>

      {/* Empty state */}
      {clients.length === 0 ? (
        <div
          className="rounded-xl p-10 text-center"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p className="text-zinc-500">No hay clientes registrados todavía.</p>
          <Link
            href="/admin/clients/new"
            className="mt-3 inline-block text-sm text-cyan-400 hover:text-cyan-300"
          >
            Crear el primero →
          </Link>
        </div>
      ) : (
        <div
          className="overflow-x-auto rounded-xl"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-500">Empresa</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-500">Email</th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-500">Servicios</th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-500">Proyectos</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-500">Alta</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="transition-colors"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <td className="px-4 py-3.5 font-medium text-zinc-100">
                    {client.companyName}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-500">{client.user.email}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-400">
                      {client.services.length}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
                      {client.projects.length}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-zinc-500 tabular-nums">
                    {new Date(client.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="text-xs text-cyan-400 transition-colors hover:text-cyan-300"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/admin/clients/${client.id}/edit`}
                        className="text-xs text-zinc-500 transition-colors hover:text-zinc-200"
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
