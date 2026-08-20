'use client'

import { useCallback, useState } from 'react'

import type { ChoreoEditor } from './choreographyEditor'
import { buildKeyframesSource } from './choreographyExport'

/**
 * EL CAMINO DE VUELTA: de la sesión de edición al archivo.
 *
 * Genera el bloque entero de `CHOREO_KEYFRAMES` —con su doc, sus separadores de
 * tramo y los comentarios de cada keyframe— y lo deja en el portapapeles. El
 * humano lo pega en `choreography.ts` y ahí termina el viaje.
 *
 * **El probe no escribe en disco, y es a propósito.** Podría: es una ruta
 * interna y una Server Action de dos líneas alcanzaría. Pero entonces el archivo
 * pasaría a ser la salida de una herramienta en vez de la fuente de verdad, y la
 * decisión de qué se queda dejaría de ser un acto explícito del humano. El rodeo
 * del portapapeles es la garantía.
 *
 * ── Lo exportado caduca, y eso no se resuelve con un efecto ────────────────
 *
 * Un bloque exportado deja de ser válido en el instante en que se mueve un
 * slider, y un texto viejo a la vista es peor que ningún texto: se pega y se
 * pierde el último ajuste sin enterarse.
 *
 * Lo que se guarda entonces no es el texto sino **el texto junto con la versión
 * del editor de la que salió**, y la vigencia se DERIVA en el render comparando
 * contra la versión actual. Un efecto que hiciera `setText(null)` al cambiar la
 * versión haría lo mismo con un render de más y con la regla
 * `react-hooks/set-state-in-effect` en contra, con razón: esto no es
 * sincronizar con un sistema externo, es una cuenta.
 *
 * El rótulo del botón sale de la misma cuenta, así que tampoco hace falta un
 * temporizador para el "copiado": el aviso dura exactamente mientras lo copiado
 * siga siendo cierto.
 */

type ExportSnapshot = {
  /** Versión del editor en la que se generó. Distinta de la actual = caducó. */
  readonly version: number
  readonly text: string
  readonly copied: boolean
}

type KeyframeExportPanelProps = {
  editor: ChoreoEditor
  version: number
}

export function KeyframeExportPanel({ editor, version }: KeyframeExportPanelProps) {
  const [snapshot, setSnapshot] = useState<ExportSnapshot | null>(null)

  const current = snapshot && snapshot.version === version ? snapshot : null

  const handleExport = useCallback(async () => {
    const text = buildKeyframesSource(editor.keyframes)

    // El texto se muestra ya, sin esperar al portapapeles: la exportación no
    // depende de él. Sin `clipboard` —contexto no seguro, o permiso denegado—
    // queda igual a la vista para copiarlo a mano.
    setSnapshot({ version, text, copied: false })
    if (!navigator.clipboard) return

    try {
      await navigator.clipboard.writeText(text)
      setSnapshot({ version, text, copied: true })
    } catch {
      // Ya está mostrado y sin marca de copiado: no hay nada más que decir.
    }
  }, [editor, version])

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleExport}
        data-probe="editor-export"
        className="rounded-sm border border-neutral-900 bg-neutral-900 px-3 py-2 text-[0.72rem] text-white transition-colors hover:bg-neutral-800"
      >
        {current
          ? current.copied
            ? 'copiado al portapapeles'
            : 'copialo a mano de acá abajo'
          : 'exportar los keyframes'}
      </button>

      {current ? (
        <div className="flex flex-col gap-1">
          <p className="text-[0.66rem] leading-snug text-neutral-500">
            <strong className="font-semibold">Pegá esto ahora</strong>, reemplazando el bloque{' '}
            <code>export const CHOREO_KEYFRAMES</code> de <code>choreography.ts</code>. Copiarlo
            no guarda nada: hasta que no esté pegado, la sesión se pierde al recargar. El texto
            desaparece apenas toques algo más, porque a partir de ahí ya no dice la verdad.
          </p>
          <textarea
            readOnly
            value={current.text}
            aria-label="keyframes exportados"
            data-probe="editor-export-text"
            onFocus={(event) => event.currentTarget.select()}
            className="h-40 w-full resize-y rounded-sm border border-neutral-200 bg-neutral-50 p-2 font-ds-mono text-[0.62rem] leading-relaxed text-neutral-800"
          />
        </div>
      ) : null}
    </div>
  )
}
