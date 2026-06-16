import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

type AdminBackButtonProps = {
  href: string
  label: string
}

export function AdminBackButton({ href, label }: AdminBackButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
    >
      <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
      {label}
    </Link>
  )
}
