'use client'

import { useEffect, useId, useRef, type FocusEvent, type ReactNode } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * AVANCE POR COMPLETITUD — el acordeón de una sola sección abierta que ordena
 * una pantalla larga en bloques, y abre el siguiente SOLO, sin botón de
 * «siguiente».
 *
 * Este componente es PRESENTACIÓN y MECÁNICA DE FOCO. Qué significa que un
 * bloque esté completo, y a cuál se avanza, lo decide quien lo monta (para la
 * ficha, `ficha-bloques.ts`). Acá adentro no hay ninguna regla de negocio.
 *
 * ── Las tres decisiones que tiene metidas, y por qué ─────────────────────────
 *
 * 1. El bloque plegado NO SE RENDERIZA (no queda oculto con CSS). Dos razones,
 *    y la segunda es la que cierra la discusión: (a) sus campos no pueden
 *    quedar en el orden de tabulación de una zona que no se ve; (b) plegar con
 *    `overflow:hidden` deja a los inputs con su caja intacta, así que un
 *    `toBeVisible()` los da por visibles y una prueba pasa en VERDE sobre el
 *    bug que tendría que ver. Sin montar, presencia y visibilidad dicen lo
 *    mismo y la prueba no puede mentir. Lo escrito no se pierde: el estado del
 *    formulario vive en el padre, no en los inputs.
 *
 * 2. El avance automático se evalúa al SALIR DEL BLOQUE, nunca mientras se
 *    escribe. `onBlur` burbujea (es `focusout`) y trae `relatedTarget`: si el
 *    foco se va a algo que sigue adentro del bloque —tabular de un campo al de
 *    al lado— no pasa nada. Es la misma disciplina que ya usan los nudges de
 *    calidad y el rojo de los links de esta pantalla: nadie quiere que la
 *    pantalla se le mueva mientras tipea.
 *
 * 3. TODAS las cabeceras están siempre, y todas abren con un click, esté
 *    completo lo anterior o no. El avance automático es una invitación, no una
 *    tranca: un negocio sin web tiene que poder seguir, y una pantalla que solo
 *    deja avanzar cumpliendo es una pantalla que sabe fabricar callejones.
 *
 * 4. Con el mouse apretado, el avance ESPERA. Es la parte que no se ve venir y
 *    la que hace falta explicar: al hacer click, el foco se mueve en el
 *    `mousedown`, así que el avance se dispararía ANTES del `mouseup`. Y como
 *    plegar el bloque abierto cambia el alto de todo lo que hay debajo, el botón
 *    que se estaba apretando se corre de lugar entre los dos, el `mouseup` cae
 *    sobre otra cosa y el navegador NO emite el click: el setter aprieta
 *    «Guardar ficha» —o la cabecera de otro bloque— y no pasa absolutamente
 *    nada. Por eso, si hay un puntero apretado, el avance queda pendiente y se
 *    aplica en el task siguiente al `pointerup`, cuando el click ya se despachó.
 *    Con teclado no hay nada que esperar y se aplica en el acto.
 *
 *    Límite conocido: si el botón se suelta fuera de la ventana no llega
 *    `pointerup`, el avance pendiente se descarta en el próximo `pointerdown` y
 *    ese salto se pierde. No rompe nada —el bloque siguiente sigue a un click— y
 *    la alternativa (avanzar igual) es el bug de arriba.
 */

export type EstadoBloque =
  | { tono: 'completo'; texto: string }
  | { tono: 'pendiente'; texto: string }
  | { tono: 'opcional'; texto: string }

export type BloqueSecuencial = {
  id: string
  /** El título visible, ya numerado por quien lo monta si corresponde. */
  titulo: string
  /** Una línea de estado en la cabecera: qué falta, o que ya está. */
  estado: EstadoBloque
  /** El contenido — solo se monta cuando el bloque está abierto. */
  contenido: ReactNode
}

type Props = {
  bloques: readonly BloqueSecuencial[]
  /** El id del bloque desplegado. Componente controlado: el dueño es el padre. */
  abierto: string
  /** Click en una cabecera. */
  onAbrir: (id: string) => void
  /**
   * El foco salió del bloque `id` (se fue a otra parte de la página). El padre
   * decide si eso significa avanzar — acá no se sabe qué es «completo».
   */
  onSalirDelBloque?: (id: string) => void
  'aria-label': string
}

const TONO_CABECERA: Record<EstadoBloque['tono'], string> = {
  completo: 'text-emerald-300/90',
  pendiente: 'text-amber-200/80',
  opcional: 'text-zinc-500',
}

export function BloquesSecuenciales({
  bloques,
  abierto,
  onAbrir,
  onSalirDelBloque,
  'aria-label': ariaLabel,
}: Props) {
  const baseId = useId()
  // El callback vive en un ref porque el efecto de abajo se monta una sola vez y
  // no puede quedarse con una closure vieja del padre.
  const salirRef = useRef(onSalirDelBloque)
  useEffect(() => {
    salirRef.current = onSalirDelBloque
  }, [onSalirDelBloque])
  const punteroApretado = useRef(false)
  const avancePendiente = useRef<string | null>(null)

  // Ver la nota 4 del encabezado: mientras haya un puntero apretado, mover el
  // acordeón le come el click al setter. Se espera al task posterior al
  // `pointerup`, que es cuando `mouseup` y `click` ya se despacharon.
  useEffect(() => {
    const apretar = () => {
      punteroApretado.current = true
      // Un avance que quedó colgado (puntero soltado fuera de la ventana) se
      // descarta acá: aplicarlo tarde movería la pantalla sin motivo visible.
      avancePendiente.current = null
    }
    const soltar = () => {
      punteroApretado.current = false
      setTimeout(() => {
        const id = avancePendiente.current
        avancePendiente.current = null
        if (id) salirRef.current?.(id)
      }, 0)
    }
    window.addEventListener('pointerdown', apretar, true)
    window.addEventListener('pointerup', soltar, true)
    window.addEventListener('pointercancel', soltar, true)
    return () => {
      window.removeEventListener('pointerdown', apretar, true)
      window.removeEventListener('pointerup', soltar, true)
      window.removeEventListener('pointercancel', soltar, true)
    }
  }, [])

  const manejarSalida = (id: string) => (evento: FocusEvent<HTMLDivElement>) => {
    if (!onSalirDelBloque) return
    const destino = evento.relatedTarget
    // El foco sigue adentro del bloque (tabular entre sus campos) → no es salir.
    if (destino instanceof Node && evento.currentTarget.contains(destino)) return
    if (punteroApretado.current) {
      avancePendiente.current = id
      return
    }
    onSalirDelBloque(id)
  }

  return (
    <div aria-label={ariaLabel} className="space-y-2">
      {bloques.map((bloque) => {
        const estaAbierto = bloque.id === abierto
        const cabeceraId = `${baseId}-${bloque.id}-cabecera`
        const cuerpoId = `${baseId}-${bloque.id}-cuerpo`

        return (
          <div
            key={bloque.id}
            onBlur={manejarSalida(bloque.id)}
            className={cn(
              'overflow-hidden rounded-2xl border transition-colors duration-200 motion-reduce:transition-none',
              estaAbierto
                ? 'border-cyan-400/25 bg-cyan-500/[0.04]'
                : 'border-white/[0.08] bg-white/[0.02]',
            )}
          >
            <h3>
              {/*
                Título y estado en dos renglones, en TODOS los anchos. La
                alternativa —estado a la derecha del título, escondido en
                mobile— dejaba a 390px un acordeón donde no se puede saber qué le
                falta a un bloque plegado sin abrirlo uno por uno, que es
                exactamente lo que el plegado tiene que evitar.
              */}
              <button
                type="button"
                id={cabeceraId}
                aria-expanded={estaAbierto}
                aria-controls={cuerpoId}
                onClick={() => onAbrir(bloque.id)}
                className="grid w-full grid-cols-[1fr_auto] items-center gap-x-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400/50 motion-reduce:transition-none"
              >
                <span
                  className={cn(
                    'text-sm font-semibold',
                    estaAbierto ? 'text-white' : 'text-zinc-300',
                  )}
                >
                  {bloque.titulo}
                </span>
                <ChevronDown
                  size={15}
                  strokeWidth={1.5}
                  aria-hidden
                  className={cn(
                    'row-span-2 shrink-0 text-zinc-500 transition-transform duration-200 motion-reduce:transition-none',
                    estaAbierto && 'rotate-180 text-cyan-300/80',
                  )}
                />
                <span
                  className={cn(
                    'mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-medium',
                    TONO_CABECERA[bloque.estado.tono],
                  )}
                >
                  {bloque.estado.tono === 'completo' && (
                    <Check size={12} strokeWidth={1.5} aria-hidden />
                  )}
                  {bloque.estado.texto}
                </span>
              </button>
            </h3>

            {/* Plegado = no montado (ver nota 1 arriba). El estado del bloque
                sigue leyéndose en su cabecera, que nunca se desmonta. */}
            {estaAbierto && (
              <div
                id={cuerpoId}
                role="region"
                aria-labelledby={cabeceraId}
                className="border-t border-white/[0.06] px-4 py-4"
              >
                {bloque.contenido}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
