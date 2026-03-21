'use client'

import { markLeadAsRead } from '@/lib/actions/contact'
import { useTransition } from 'react'

export function MarkLeadReadButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()

    return (
        <button
            onClick={() => startTransition(() => markLeadAsRead(id))}
            disabled={isPending}
            className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-40"
        >
            {isPending ? 'Marcando...' : 'Marcar leído'}
        </button>
    )
}
