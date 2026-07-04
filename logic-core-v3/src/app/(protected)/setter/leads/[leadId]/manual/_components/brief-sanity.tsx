'use client'

import { useState } from 'react'
import { CheckCircle2, PencilLine } from 'lucide-react'
import { Button } from '@/components/ui'
import type { Brief } from '@/lib/leados/contracts'
import { BriefForm, BriefResumen } from '../../_components/brief-form'

/**
 * 5.6 — El sanity-check del brief guardado que vivía en el chrome del wizard
 * (`brief-step`), traído a M6: ¿el brief menciona lo concreto del negocio o
 * quedó genérico? «Re-pegar» reabre el MISMO `BriefForm` compartido en modo
 * edición (autosave en BRIEF, misma action `guardarBrief`). Solo se ofrece
 * mientras el dossier sigue en BRIEF — después el brief queda de consulta.
 */
export function BriefSanity({
  leadId,
  businessName,
  brief,
}: {
  leadId: string
  businessName: string
  brief: Brief
}) {
  const [editando, setEditando] = useState(false)
  const [sanityOk, setSanityOk] = useState(false)

  if (editando) {
    return (
      <BriefForm
        leadId={leadId}
        businessName={businessName}
        brief={brief}
        autosaveEnabled
        onCancel={() => setEditando(false)}
        onSaved={() => {
          setEditando(false)
          setSanityOk(false)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <BriefResumen brief={brief} />

      {sanityOk ? (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] p-3 text-xs font-medium text-emerald-300">
          <CheckCircle2 size={14} strokeWidth={1.5} />
          Brief verificado. Seguí con las fases de Construcción.
        </p>
      ) : (
        <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] p-4">
          <p className="text-xs font-semibold text-amber-300">Chequeo rápido antes de seguir</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-200/80">
            ¿El brief menciona el negocio real y sus dolores concretos (los de las reseñas que
            copiaste), o quedó genérico? Un brief genérico produce una demo genérica.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSanityOk(true)}>
              Menciona lo concreto — está bien
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<PencilLine size={13} strokeWidth={1.5} />}
              onClick={() => setEditando(true)}
            >
              Quedó genérico — re-pegar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
