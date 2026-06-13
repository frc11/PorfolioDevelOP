import { ShieldAlert } from 'lucide-react'
import { GUARDRAIL_ROL } from '@/lib/leados/flow'
import { CopyBlock } from './copy-block'

type GuardrailRolProps = {
  /** true = solo la regla en una línea (Paso 7); false = con guion copiable. */
  compacto?: boolean
}

/**
 * B6 — Guardrail de rol DURO, visible y repetido en la superficie de
 * conversación: el setter nunca cotiza ni negocia. Ante precio/condiciones,
 * el guion fijo deriva a reunión con el equipo.
 */
export function GuardrailRol({ compacto = false }: GuardrailRolProps) {
  if (compacto) {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-500/[0.04] p-3 text-xs leading-relaxed text-rose-200/90">
        <ShieldAlert size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-rose-400" />
        <span>
          <span className="font-semibold text-rose-300">{GUARDRAIL_ROL.regla}</span>{' '}
          Si preguntan precio: &ldquo;te paso con el equipo en una reunión&rdquo; — nada más.
        </span>
      </p>
    )
  }

  return (
    <div className="space-y-3 rounded-2xl border border-rose-400/20 bg-rose-500/[0.04] p-4">
      <div className="flex items-center gap-2">
        <ShieldAlert size={15} strokeWidth={1.5} className="text-rose-400" />
        <p className="text-xs font-semibold text-rose-300">{GUARDRAIL_ROL.regla}</p>
      </div>
      <p className="text-xs leading-relaxed text-zinc-400">{GUARDRAIL_ROL.jugada}</p>
      <CopyBlock
        titulo="Guion fijo ante precio o condiciones"
        instruccion="Copialo tal cual cuando la charla derive a números. La jugada es agendar."
        texto={GUARDRAIL_ROL.guion}
      />
    </div>
  )
}
