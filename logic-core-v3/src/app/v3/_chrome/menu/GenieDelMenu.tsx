'use client'

import { useCallback, useImperativeHandle, useRef, type ReactNode, type Ref } from 'react'

import { esquinasDeLaTira, liderDelGenie, matrizDeLaTira, type Caja } from '../../_secciones/trabajos/demos/genie'

/**
 * [NAVBAR] T3 · EL GENIE DEL MENÚ — el mismo de las demos (`genie.ts`: el embudo y el deslizamiento, la proyección de
 * cada tira) con el panel del menú adentro: sale del botón y vuelve a él.
 *
 * Cada tira es el panel visto por una rendija de su alto, llevado por `matrix3d` a su cuadrilátero. Lo que viaja es una
 * copia PLANA (`vidrio-plano` en `vidrio.css`: el tinte sin el `backdrop-filter`): cuarenta vidrios con desenfoque y
 * lente serían cuarenta lecturas del fondo por cuadro. Al terminar de abrir, el vidrio de verdad toma su lugar.
 *
 * ⚠️ **Lo que es caro es montar y disponer, no mover**, medido con la CPU ×4 (`navbar/t3-menu/costo.json`):
 *   · cada tira lleva SÓLO las piezas que caen en su rendija (el botón de cerrar, los renglones), en el lugar MEDIDO del
 *     panel real (`piezas`), no el panel entero: cuarenta copias de seis renglones eran medio millar de nodos;
 *   · la capa está montada y dispuesta desde que el chrome pasa a modo menú y se muestra con `visibility`: con
 *     `display: none` cada apertura volvía a disponer las cuarenta.
 * Menos tiras que las demos (40 contra 60) porque el panel es texto y no una foto. Las rendijas se pisan un píxel
 * (`SOLAPE`), como en las demos: sin eso queda una costura clara entre dos.
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

export function GenieDelMenu({
  ventana,
  destino,
  piezas,
  fondo,
  ref,
}: {
  /** La caja del panel abierto. */
  readonly ventana: Caja
  /** La caja del botón del menú: de donde sale y adonde vuelve. */
  readonly destino: Caja
  readonly piezas: readonly PiezaDelGenie[]
  /** El panel plano de cada tira (el tinte y el radio), con sus piezas adentro. */
  readonly fondo: (hijos: ReactNode) => ReactNode
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
            <div className="absolute left-0" style={{ top: -i * alto, width: ventana.ancho, height: ventana.alto }}>
              {fondo(
                enLaRendija.map((p) => (
                  <div key={p.clave} className="absolute" style={{ left: p.caja.x, top: p.caja.y, width: p.caja.ancho, height: p.caja.alto }}>
                    {p.nodo}
                  </div>
                )),
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
