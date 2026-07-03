import { Sparkles } from 'lucide-react'
import { PROMPTS_DISENIO } from '@/lib/leados/prompts-disenio'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'

/**
 * B4·A — Los prompts de diseño prefijados, copiables a Claude Design para pulir
 * la demo ya armada (estética, mobile, motion). Estándar y lead-agnósticos: el
 * contenido vive en `PROMPTS_DISENIO` (editable por Franco en un solo archivo);
 * acá solo se pintan con `CopyBlock` tal cual — un prompt por bloque.
 */
export function PromptsDisenio() {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-zinc-100">
          <Sparkles size={14} strokeWidth={1.5} className="shrink-0 text-cyan-300" />
          Prompts de diseño — pulí la demo en Claude Design
        </p>
        <p className="text-[11px] text-zinc-500">
          Prompts estándar, sin datos del negocio: cuando la demo ya está armada, copiá el que
          necesites y pegalo como mensaje en Claude Design.
        </p>
      </div>
      {PROMPTS_DISENIO.map((prompt) => (
        <CopyBlock
          key={prompt.id}
          titulo={prompt.titulo}
          instruccion={prompt.instruccion}
          texto={prompt.prompt}
        />
      ))}
    </div>
  )
}
