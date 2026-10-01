'use client'

import { memo, useCallback, useImperativeHandle, useRef, type ReactNode, type Ref } from 'react'

import { esquinasDeLaTira, liderDelGenie, matrizDeLaTira, type Caja } from '../../_secciones/trabajos/demos/genie'

/**
 * [NAVBAR] T3 · EL GENIE DEL MENÚ — el mismo de las demos (`genie.ts`: el embudo y el deslizamiento, la proyección de
 * cada tira) con el panel del menú: sale del botón y vuelve a él.
 *
 * [NAVBAR] Retoque 1 · Las tiras llevan SÓLO EL TEXTO del panel (el botón de cerrar y los renglones, en su lugar
 * medido), sin fondo: el material es el vidrio de verdad, recortado por la silueta del Genie (`silueta.ts`), que viaja
 * debajo. Antes cada tira llevaba una copia plana del panel y al terminar el vidrio la relevaba: se veía el salto de
 * sólido a transparente. La capa la recorta la misma silueta: nada del texto asoma fuera de la forma.
 *
 * ⚠️ **Lo que es caro es montar y disponer, no mover** (medido con la CPU ×4): cada tira lleva sólo las piezas que caen
 * en su rendija, y la capa está montada desde el modo menú y se muestra con `visibility`. Es `memo`: abrir el menú no la
 * vuelve a dibujar. 40 tiras (las demos usan 60): el panel es texto, no una foto. Las rendijas se pisan un píxel
 * (`SOLAPE`), como en las demos.
 */
export const TIRAS_DEL_MENU = 40
const SOLAPE = 1 / 720

export interface ControlDelGenieDelMenu {
  readonly pintar: (m: number) => void
}

/** Una pieza del panel en su lugar medido (relativo al panel), con lo que se pinta. */
export interface PiezaDelGenie {
  readonly clave: string
  readonly caja: Caja
  readonly nodo: ReactNode
}

function GenieDelMenuSinMemo({
  ventana,
  destino,
  piezas,
  ref,
}: {
  /** La caja del panel abierto. */
  readonly ventana: Caja
  /** La caja del botón del menú: de donde sale y adonde vuelve. */
  readonly destino: Caja
  readonly piezas: readonly PiezaDelGenie[]
  readonly ref?: Ref<ControlDelGenieDelMenu>
}): React.JSX.Element {
  const tiras = useRef<(HTMLDivElement | null)[]>([])
  const alto = ventana.alto / TIRAS_DEL_MENU
  const lider = liderDelGenie(ventana, destino)

  const pintar = useCallback(
    (m: number): void => {
      for (let i = 0; i < TIRAS_DEL_MENU; i += 1) {
        const tira = tiras.current[i]
        if (tira === null || tira === undefined) continue
        const esquinas = esquinasDeLaTira(i, TIRAS_DEL_MENU, m, ventana, destino, lider, SOLAPE)
        tira.style.setProperty('transform', matrizDeLaTira(esquinas, ventana.ancho, alto + ventana.alto * SOLAPE))
      }
    },
    [ventana, destino, lider, alto],
  )
  useImperativeHandle(ref, () => ({ pintar }), [pintar])

  return (
    <div data-parte="genie-del-menu" aria-hidden="true" inert className="pointer-events-none fixed inset-0">
      {Array.from({ length: TIRAS_DEL_MENU }, (_, i) => {
        const [arriba, abajo] = [i * alto, (i + 1) * alto + ventana.alto * SOLAPE]
        const enLaRendija = piezas.filter((p) => p.caja.y < abajo && p.caja.y + p.caja.alto > arriba)
        return (
          <div
            key={i}
            ref={(el) => {
              tiras.current[i] = el
            }}
            className="absolute top-0 left-0 origin-top-left overflow-hidden will-change-transform"
            style={{ width: ventana.ancho, height: alto + ventana.alto * SOLAPE, transform: 'scale(0)' }}
          >
            <div className="text-tinta absolute left-0" style={{ top: -i * alto, width: ventana.ancho, height: ventana.alto }}>
              {enLaRendija.map((p) => (
                <div key={p.clave} className="absolute" style={{ left: p.caja.x, top: p.caja.y, width: p.caja.ancho, height: p.caja.alto }}>
                  {p.nodo}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const GenieDelMenu = memo(GenieDelMenuSinMemo)
