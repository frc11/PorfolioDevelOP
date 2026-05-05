import { redirect } from 'next/navigation'
import { Users, UserCheck, UserMinus } from 'lucide-react'
import { resolveOrgId } from '@/lib/preview'
import { prisma } from '@/lib/prisma'
import { ImportCSVButton } from './_components/ImportCSVButton'

export const dynamic = 'force-dynamic'

export default async function ContactosPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const [contacts, totalCount, activeCount, optedOutCount] = await Promise.all([
    prisma.emailContact.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        optedOut: true,
        source: true,
        createdAt: true,
      },
    }),
    prisma.emailContact.count({ where: { organizationId } }),
    prisma.emailContact.count({ where: { organizationId, optedOut: false } }),
    prisma.emailContact.count({ where: { organizationId, optedOut: true } }),
  ])

  const stats = [
    { label: 'Total', value: totalCount, icon: Users, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.2)' },
    { label: 'Suscriptos', value: activeCount, icon: UserCheck, color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)' },
    { label: 'Bajas', value: optedOutCount, icon: UserMinus, color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.2)' },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className="flex flex-col gap-3 px-4 py-4"
            style={{
              background: 'rgba(255,255,255,0.025)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
            }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <Icon size={15} strokeWidth={1.5} style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-black" style={{ color }}>{value}</p>
              <p className="text-xs text-zinc-500 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          {contacts.length < totalCount ? `Mostrando ${contacts.length} de ${totalCount}` : `${totalCount} contactos`}
        </p>
        <ImportCSVButton />
      </div>

      {/* Empty state */}
      {contacts.length === 0 && (
        <div
          className="px-5 py-14 text-center"
          style={{
            background: 'rgba(255,255,255,0.025)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
          }}
        >
          <div className="mx-auto flex max-w-xs flex-col items-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
              style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}
            >
              <Users size={24} strokeWidth={1.5} className="text-cyan-400" />
            </div>
            <p className="text-sm font-bold text-zinc-300">Sin contactos todavía</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Importá un CSV con tus contactos para empezar a enviar campañas.
              Formato: <span className="font-mono text-zinc-400">email,firstName,lastName,phone</span>
            </p>
          </div>
        </div>
      )}

      {/* Contacts table */}
      {contacts.length > 0 && (
        <div
          style={{
            background: 'rgba(255,255,255,0.025)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
          }}
          className="overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Email', 'Nombre', 'Teléfono', 'Origen', 'Estado'].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left font-semibold uppercase tracking-widest text-zinc-600"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, i) => (
                  <tr
                    key={c.id}
                    style={i < contacts.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.04)' } : {}}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-zinc-300 font-mono">{c.email}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{c.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-600">{c.source ?? '—'}</td>
                    <td className="px-4 py-3">
                      {c.optedOut ? (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                          Baja
                        </span>
                      ) : (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
                          style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}
                        >
                          Activo
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
