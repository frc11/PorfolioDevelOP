'use client'

import { Fragment, useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { CapaId } from '@/lib/leados/bloque-construccion'
import { SEPARADOR_DE_CAPAS } from '@/lib/leados/prompt-construccion'

export type CapaEnPantalla = {
  id: CapaId
  rotulo: string
  cuerpo: string
  fija: boolean
}

/**
 * P42 — EL BLOQUE DE «CONSTRUIR», a la vista y entero.
 *
 * Es lo único que el setter manda, así que deja de ser un preview plegado: el
 * `CopyBlock` de siempre lo guardaba detrás de «Ver el texto que vas a copiar» y,
 * abierto, lo recortaba a 224 px con scroll propio. Con mil palabras adentro eso
 * era pegar algo que no se puede leer. Acá el texto se muestra completo, sin tope
 * de alto, con los rótulos de las tres capas resaltados para que se vea qué parte
 * es de este negocio y qué parte pone el producto.
 *
 * UN solo botón de copiar, y copia exactamente lo que se ve: copia `texto`, el
 * que arma `armarBloqueConstruccion`, y el `<pre>` dibuja esas mismas capas con
 * los mismos separadores (necesita las capas por separado para resaltar los
 * rótulos). Que las dos cosas coincidan lo verifica la suite del setter,
 * comparando el portapapeles con la pantalla y con el producto.
 *
 * Sin tarjeta propia a propósito: vive dentro del bloque de trabajo, que ya es la
 * única tarjeta de la pantalla. El marco lo lleva el texto, no un contenedor
 * alrededor del botón.
 *
 * El orden, de arriba hacia abajo: qué es y el botón; dónde se pega (la
 * herramienta, con su link o con qué falta y a quién pedírselo); qué le falta al
 * documento, si le falta algo; y el texto. Copiar queda en el primer pliegue
 * también a 390, y la pared del link pendiente se lee antes del texto largo. La
 * columna de lectura la pone la pantalla (`mc1-construir.tsx`), no este bloque.
 */
export function BloqueTresCapas({
  texto,
  capas,
  aviso,
  herramienta,
}: {
  /** Lo que se copia: el texto que arma `armarBloqueConstruccion`, tal cual. */
  texto: string
  /** Las mismas capas, para dibujarlas con sus rótulos resaltados. */
  capas: readonly CapaEnPantalla[]
  /** Qué le falta al documento, dicho al setter. `null` si no falta nada. */
  aviso: string | null
  /** Dónde se pega: la guía de la herramienta, que la pantalla resuelve en el server. */
  herramienta: ReactNode
}) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      // Fallback para contextos sin Clipboard API (http local, browsers viejos).
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
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-xl">
          <p className="text-sm font-semibold text-zinc-100">Bloque para Claude Design</p>
          <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
            Pegalo entero como primer mensaje de un proyecto nuevo y esperá a que termine. Son tres
            partes: las instrucciones, el documento de este negocio y el piso de calidad.
          </p>
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

      {herramienta}

      {aviso && (
        <p role="note" className="max-w-xl text-xs leading-relaxed text-amber-200/85">
          {aviso}
        </p>
      )}

      <pre
        data-bloque="construccion"
        className={cn(
          'whitespace-pre-wrap break-words rounded-xl border p-3 font-mono text-xs leading-relaxed transition-colors duration-300 motion-reduce:transition-none sm:p-4',
          copiado ? 'border-emerald-400/40 bg-emerald-500/[0.05]' : 'border-white/[0.06] bg-black/30',
        )}
      >
        {capas.map((capa, indice) => (
          <Fragment key={capa.id}>
            {indice > 0 ? SEPARADOR_DE_CAPAS : null}
            <span data-capa={capa.id} className="font-semibold text-zinc-100">
              {capa.rotulo}
            </span>
            {SEPARADOR_DE_CAPAS}
            <span className={capa.fija ? 'text-zinc-400' : 'text-zinc-200'}>{capa.cuerpo}</span>
          </Fragment>
        ))}
      </pre>
    </div>
  )
}
