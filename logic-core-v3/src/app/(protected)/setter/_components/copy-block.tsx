'use client'

import { useState } from 'react'
import { Check, ChevronRight, Copy } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

type CopyBlockProps = {
  titulo: string
  instruccion: string
  texto: string
}

/**
 * Bloque copiable para los Gems externos: título + instrucción + botón copiar,
 * y el texto detrás de un plegable.
 *
 * P17 — el preview era un `<pre>` de `max-h-56` SIEMPRE abierto: 224 px por
 * bloque, encima del pliegue, en las ocho pantallas que sirven uno. En mc2, con
 * cuatro bloques, eran 896 px de preview antes del primer control. Era la pieza
 * más grande del cromo del manual, medida.
 *
 * Se pliega, no se saca — es la regla de P4: lo que un novato necesita ver una
 * vez y un experto ya no, va detrás de un título que promete lo que hay adentro
 * («Ver el texto que vas a copiar», con las líneas que trae). Lo que NUNCA se
 * pliega es la salida: el botón «Copiar bloque» sigue arriba, siempre visible,
 * y con él el título y la instrucción que dicen para qué es y dónde se pega.
 *
 * El texto lo arman los builders puros de lib/leados/copy-blocks.
 */
export function CopyBlock({ titulo, instruccion, texto }: CopyBlockProps) {
  const [copiado, setCopiado] = useState(false)
  const lineas = texto.split('\n').length

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      // Fallback para contextos sin Clipboard API (http local, browsers viejos)
      const area = document.createElement('textarea')
      area.value = texto
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
    }
    setCopiado(true)
    window.setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-zinc-200">{titulo}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{instruccion}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={copiar}
          icon={
            copiado ? (
              <Check size={14} strokeWidth={1.5} className="text-emerald-400" />
            ) : (
              <Copy size={14} strokeWidth={1.5} />
            )
          }
        >
          {copiado ? 'Copiado' : 'Copiar bloque'}
        </Button>
      </div>

      <details className="group mt-2">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-300 [&::-webkit-details-marker]:hidden">
          <ChevronRight
            size={12}
            strokeWidth={1.5}
            aria-hidden
            className="shrink-0 transition-transform group-open:rotate-90 motion-reduce:transition-none"
          />
          Ver el texto que vas a copiar ({lineas} {lineas === 1 ? 'línea' : 'líneas'})
        </summary>
        <pre
          className={cn(
            'mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border p-3 font-mono text-[11px] leading-relaxed transition-colors duration-300 motion-reduce:transition-none',
            copiado
              ? 'border-emerald-400/40 bg-emerald-500/[0.06] text-zinc-300'
              : 'border-white/[0.06] bg-black/30 text-zinc-400',
          )}
        >
          {texto}
        </pre>
      </details>
    </div>
  )
}
