import { LifeBuoy } from 'lucide-react'
import { stopImpersonationAction } from '@/lib/actions/impersonation'
import { ImpersonationTimer } from '@/components/dashboard/ImpersonationTimer'

export function ImpersonationBanner({
  companyName,
  expiresAt,
}: {
  companyName: string
  expiresAt: string
}) {
  return (
    <div
      className="flex flex-shrink-0 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      style={{
        background: 'rgba(127,29,29,0.42)',
        borderBottom: '1px solid rgba(248,113,113,0.28)',
      }}
    >
      <div className="flex items-start gap-2.5">
        <LifeBuoy size={15} className="mt-0.5 flex-shrink-0 text-red-300" />
        <p className="text-sm text-red-100">
          Estás viendo el portal como <span className="font-semibold">{companyName}</span>. Sesión
          de soporte activa — <span className="font-semibold"><ImpersonationTimer expiresAt={expiresAt} /></span>
        </p>
      </div>

      <form action={stopImpersonationAction}>
        <button
          type="submit"
          className="rounded-full border border-red-300/20 bg-red-400/10 px-4 py-2 text-xs font-semibold text-red-100 transition-colors hover:bg-red-400/15"
        >
          Salir →
        </button>
      </form>
    </div>
  )
}
