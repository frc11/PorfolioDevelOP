import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Mail } from 'lucide-react'
import { resolveOrgId } from '@/lib/preview'
import { isModuleActive } from '@/lib/modules/check-activation'

export const dynamic = 'force-dynamic'

const TABS = [
  { label: 'Campañas', href: '/dashboard/modules/email-marketing/campaigns' },
  { label: 'Contactos', href: '/dashboard/modules/email-marketing/contactos' },
] as const

export default async function EmailMarketingLayout({ children }: { children: React.ReactNode }) {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const isActive = await isModuleActive(organizationId, 'email-marketing')
  if (!isActive) redirect('/dashboard')

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)' }}
          >
            <Mail size={18} strokeWidth={1.5} className="text-cyan-400" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-zinc-100">Email Marketing</h1>
        </div>
        <p className="text-sm text-zinc-500 pl-12">
          Enviá campañas de email a tus contactos y seguí los resultados en tiempo real.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'text-cyan-300'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              style={isActive ? {
                background: 'rgba(6,182,212,0.12)',
                border: '1px solid rgba(6,182,212,0.2)',
              } : {}}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
