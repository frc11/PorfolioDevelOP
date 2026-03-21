import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PREVIEW_COOKIE } from '@/lib/preview'
import { Eye, ArrowLeft } from 'lucide-react'

async function exitPreview() {
  'use server'
  const jar = await cookies()
  jar.delete(PREVIEW_COOKIE)
  redirect('/admin/clients')
}

export function PreviewBanner({ companyName }: { companyName: string }) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-between px-6 py-2"
      style={{
        background: 'rgba(245,158,11,0.08)',
        borderBottom: '1px solid rgba(245,158,11,0.2)',
      }}
    >
      <div className="flex items-center gap-2">
        <Eye size={13} className="text-amber-400" />
        <span className="text-xs text-amber-300">
          Modo preview —{' '}
          <span className="font-semibold">{companyName}</span>
        </span>
      </div>

      <form action={exitPreview}>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs text-amber-400 transition-all hover:text-amber-200"
          style={{ border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <ArrowLeft size={11} />
          Salir del preview
        </button>
      </form>
    </div>
  )
}
