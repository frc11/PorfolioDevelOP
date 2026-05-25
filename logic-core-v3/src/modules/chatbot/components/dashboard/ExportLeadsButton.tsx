'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import type { ChatbotLeadStatus } from '@prisma/client'
import type { DateRange } from '@/lib/tz-ar'

interface ExportLeadsButtonProps {
  status: ChatbotLeadStatus | 'all'
  range: DateRange
  showingDq: boolean
  /** Filtro cliente por clase efectiva. 'all' significa sin filtro. */
  classFilter: 'all' | 'hot' | 'warm' | 'cold'
  /** Si false, el botón queda deshabilitado (lista vacía). */
  hasLeads: boolean
}

/**
 * B5.9 — Botón "Exportar" en la vista de leads. Construye la URL del endpoint
 * con los filtros activos y dispara la descarga via anchor invisible.
 *
 * Por qué anchor en vez de window.location: con `<a download>` el browser
 * abre el guardador de archivos en vez de navegar fuera de la SPA. UX más
 * limpia y compatible con polling/state actual de la página.
 *
 * No usamos action / server action: las server actions devuelven JSON, no
 * binarios/streams. El API route con Content-Disposition es la forma correcta.
 */
export function ExportLeadsButton({
  status,
  range,
  showingDq,
  classFilter,
  hasLeads,
}: ExportLeadsButtonProps) {
  const [pending, setPending] = useState(false)

  function handleExport() {
    if (pending || !hasLeads) return
    setPending(true)

    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    if (range !== 'all') params.set('range', range)
    if (showingDq) params.set('view', 'dq')
    if (classFilter !== 'all') params.set('class', classFilter)

    const qs = params.toString()
    const url = qs
      ? `/api/dashboard/chatbot/leads/export?${qs}`
      : '/api/dashboard/chatbot/leads/export'

    // Anchor invisible con download attr — el filename real lo dicta el server.
    const a = document.createElement('a')
    a.href = url
    a.rel = 'noopener'
    // Hint: el server siempre manda Content-Disposition con filename real;
    // este atributo es solo fallback si el server no lo seteara.
    a.download = ''
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast.success(
      showingDq
        ? 'Exportando contactos descartados…'
        : 'Exportando tus contactos…',
    )

    // Reset rápido — la descarga no expone un evento de "done" desde el browser.
    // 1.5s es suficiente para que el click no se duplique por doble-tap.
    setTimeout(() => setPending(false), 1500)
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleExport}
      disabled={pending || !hasLeads}
      icon={<Download className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
      aria-label="Exportar contactos a CSV"
    >
      {pending ? 'Exportando…' : 'Exportar CSV'}
    </Button>
  )
}
