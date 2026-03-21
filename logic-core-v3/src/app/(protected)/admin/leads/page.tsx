import { prisma } from '@/lib/prisma'
import { Inbox } from 'lucide-react'
import { MarkLeadReadButton } from '@/components/admin/MarkLeadReadButton'

const SERVICE_LABELS: Record<string, string> = {
    web: 'Desarrollo Web',
    software: 'Software a Medida',
    automation: 'Automatización',
    ai: 'IA',
    other: 'Otro',
}

export default async function LeadsPage() {
    const leads = await prisma.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' },
    })

    const unread = leads.filter((l) => !l.read).length

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-amber-500/70">
                        Formulario de contacto
                    </p>
                    <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
                        Leads
                        {unread > 0 && (
                            <span
                                className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold"
                                style={{
                                    background: 'rgba(245,158,11,0.15)',
                                    border: '1px solid rgba(245,158,11,0.3)',
                                    color: '#fbbf24',
                                }}
                            >
                                {unread} nuevos
                            </span>
                        )}
                    </h1>
                    <p className="mt-0.5 text-sm text-zinc-600">
                        {leads.length} {leads.length === 1 ? 'consulta' : 'consultas'} recibidas
                    </p>
                </div>
            </div>

            {/* Empty state */}
            {leads.length === 0 ? (
                <div
                    className="flex flex-col items-center gap-4 rounded-2xl py-20 text-center"
                    style={{
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                        border: '1px solid rgba(255,255,255,0.07)',
                    }}
                >
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ background: 'rgba(245,158,11,0.08)' }}
                    >
                        <Inbox size={20} className="text-amber-400/60" />
                    </div>
                    <p className="text-sm text-zinc-600">Todavía no hay consultas del formulario de contacto.</p>
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
                        <thead>
                            <tr
                                style={{
                                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                                    background: 'rgba(255,255,255,0.02)',
                                }}
                            >
                                {['Estado', 'Nombre', 'Email', 'Empresa', 'Servicio', 'Fecha', 'Acciones'].map((h) => (
                                    <th
                                        key={h}
                                        className="px-5 py-3.5 text-left text-[10px] font-semibold tracking-[0.14em] uppercase text-zinc-600"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => (
                                <tr
                                    key={lead.id}
                                    style={{
                                        borderTop: '1px solid rgba(255,255,255,0.04)',
                                        background: lead.read ? '' : 'rgba(245,158,11,0.02)',
                                    }}
                                >
                                    {/* Status */}
                                    <td className="px-5 py-4">
                                        {lead.read ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                                Leído
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                                Nuevo
                                            </span>
                                        )}
                                    </td>

                                    {/* Name */}
                                    <td className="px-5 py-4">
                                        <span className="font-medium text-zinc-100">{lead.name}</span>
                                        {lead.phone && (
                                            <p className="text-xs text-zinc-600 mt-0.5">{lead.phone}</p>
                                        )}
                                    </td>

                                    {/* Email */}
                                    <td className="px-5 py-4 text-zinc-400">{lead.email}</td>

                                    {/* Company */}
                                    <td className="px-5 py-4 text-zinc-500">{lead.company ?? '—'}</td>

                                    {/* Service */}
                                    <td className="px-5 py-4">
                                        {lead.service ? (
                                            <span
                                                className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium"
                                                style={{
                                                    background: 'rgba(245,158,11,0.08)',
                                                    border: '1px solid rgba(245,158,11,0.15)',
                                                    color: 'rgba(251,191,36,0.8)',
                                                }}
                                            >
                                                {SERVICE_LABELS[lead.service] ?? lead.service}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-700">—</span>
                                        )}
                                    </td>

                                    {/* Date */}
                                    <td className="px-5 py-4 tabular-nums text-zinc-600 text-xs">
                                        {new Date(lead.createdAt).toLocaleDateString('es-AR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                        })}
                                        <p className="text-zinc-700">
                                            {new Date(lead.createdAt).toLocaleTimeString('es-AR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            {/* Message preview in tooltip-like detail */}
                                            <details className="group">
                                                <summary className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors list-none">
                                                    Ver mensaje
                                                </summary>
                                                <p className="mt-2 text-xs text-zinc-400 leading-relaxed max-w-[240px] bg-zinc-900/60 rounded-lg p-3 border border-zinc-800">
                                                    {lead.message}
                                                </p>
                                            </details>
                                            {!lead.read && <MarkLeadReadButton id={lead.id} />}
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
