import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { DeleteClientButton } from '@/components/admin/DeleteClientButton'

export default async function ClientsPage() {
  const orgs = await prisma.organization.findMany({
    include: {
      members: {
        where: { role: 'ADMIN' },
        select: { user: { select: { name: true, email: true } } },
        take: 1,
      },
      services: { where: { status: 'ACTIVE' } },
      projects: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
            Gestión
          </p>
          <h1 className="text-xl font-bold text-zinc-100">Clientes</h1>
          <p className="mt-0.5 text-sm text-zinc-600">
            {orgs.length} {orgs.length === 1 ? 'registro' : 'registros'}
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-950 transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
        >
          + Agregar cliente
        </Link>
      </div>

      {/* Empty state */}
      {orgs.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 rounded-2xl py-20 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(6,182,212,0.1)' }}
          >
            <Users size={20} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">No hay clientes registrados todavía.</p>
            <Link
              href="/admin/clients/new"
              className="mt-2 inline-block text-sm text-cyan-400 transition-colors hover:text-cyan-300"
            >
              Crear el primero →
            </Link>
          </div>
        </div>
      ) : (
        <div
          className="overflow-x-auto rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <table className="w-full text-sm">
            {/* Table head */}
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold tracking-[0.14em] uppercase text-zinc-600">
                  Empresa
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold tracking-[0.14em] uppercase text-zinc-600">
                  Email
                </th>
                <th className="px-5 py-3.5 text-center text-[10px] font-semibold tracking-[0.14em] uppercase text-zinc-600">
                  Servicios
                </th>
                <th className="px-5 py-3.5 text-center text-[10px] font-semibold tracking-[0.14em] uppercase text-zinc-600">
                  Proyectos
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold tracking-[0.14em] uppercase text-zinc-600">
                  Alta
                </th>
                <th className="px-5 py-3.5 text-right text-[10px] font-semibold tracking-[0.14em] uppercase text-zinc-600">
                  Acciones
                </th>
              </tr>
            </thead>

            {/* Table body */}
            <tbody>
              {orgs.map((org) => {
                const adminUser = org.members[0]?.user
                return (
                  <tr
                    key={org.id}
                    className="group transition-colors"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    {/* Company */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                          style={{
                            background: 'rgba(6,182,212,0.1)',
                            color: 'rgb(34,211,238)',
                          }}
                        >
                          {org.companyName[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-zinc-100">{org.companyName}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-zinc-500">{adminUser?.email ?? '—'}</td>

                    {/* Services */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className="inline-flex items-center justify-center rounded-lg px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          background: 'rgba(6,182,212,0.1)',
                          border: '1px solid rgba(6,182,212,0.2)',
                          color: 'rgb(34,211,238)',
                        }}
                      >
                        {org.services.length}
                      </span>
                    </td>

                    {/* Projects */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className="inline-flex items-center justify-center rounded-lg px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          background: 'rgba(59,130,246,0.1)',
                          border: '1px solid rgba(59,130,246,0.2)',
                          color: 'rgb(147,197,253)',
                        }}
                      >
                        {org.projects.length}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 tabular-nums text-zinc-600">
                      {new Date(org.createdAt).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/clients/${org.id}`}
                          className="text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300"
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/admin/clients/${org.id}/edit`}
                          className="text-xs text-zinc-500 transition-colors hover:text-zinc-200"
                        >
                          Editar
                        </Link>
                        <DeleteClientButton
                          clientId={org.id}
                          companyName={org.companyName}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
