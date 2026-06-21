import { Lightbulb } from 'lucide-react'

/**
 * Nudge de CALIDAD que aparece al SALIR de un campo flojo de la ficha: explica
 * cómo enriquecerlo, en tono de AYUDA (nunca de error ni de bloqueo).
 *
 * Neutro a propósito (disciplina B9): nada de amber/rojo —que en este form
 * significan gate-pendiente/error— ni de cyan accionable. `role="status"` para
 * que se anuncie al aparecer (aparece recién al blur, así que no interrumpe).
 *
 * Presentación pura: el texto viene de 1.0 (`GUIA_FICHA.campos[campo].mejora`) y
 * el CUÁNDO mostrarlo lo decide `ficha-calidad.ts`. No gatea, no bloquea.
 */
export function CampoMejora({ mensaje }: { mensaje: string }) {
  return (
    <p
      role="status"
      className="flex items-start gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-[11px] leading-relaxed text-zinc-400"
    >
      <Lightbulb
        size={12}
        strokeWidth={1.5}
        aria-hidden={true}
        className="mt-0.5 shrink-0 text-zinc-500"
      />
      <span>{mensaje}</span>
    </p>
  )
}
