'use client'

import { startTransition, useCallback, useEffect, useRef, useState } from 'react'

import { Isotipo } from '../../_componentes/marca/Marca'
import { useContacto } from '../contacto/apertura'
import { nocheQueSeVe, tonoBajo } from '../cursor/estado'
import { salaDetrasDelMenu } from '../escena/salaDetrasDelMenu'
import { Menu, type ControlDelMenu } from './MenuDeVidrio'
import { ROTULO_DEL_MENU } from './PanelDelMenu'
import { vaInvertido } from './tono'
import { useTonoDebajo } from './useTonoDebajo'

/**
 * EL MENÚ DEL TELÉFONO — un círculo con el logo arriba al centro y un panel de vidrio líquido. **[CONTACTO]** ·
 * **[NAVBAR] T3 y retoques 1 y 2**
 *
 * Se monta cuando el chrome está en modo menú (abajo de `medio`, o si la barra no entra: lo mide `BarraDelHome`).
 *
 *   · **Se abre con el Genie de las demos, desde el botón, y se cierra igual, de vuelta al botón** (`GenieDelMenu`, la
 *     misma geometría y el mismo reloj que la ventana de una demo). Con movimiento reducido, sin Genie: el fundido de
 *     las demos.
 *   · **[Retoque 1] El panel nace con su vidrio**: durante todo el Genie se ve el vidrio de verdad (desenfoque, tinte,
 *     lente) recortado por la silueta del Genie (`silueta.ts`); las tiras llevan sólo el texto, encima. No hay copia
 *     plana ni relevo: no cambia la opacidad en ningún momento, al abrir ni al cerrar.
 *   · **[Retoque 2] Sin esquinas**: la silueta redondea sus esquinas del radio del panel al del botón, y adentro del
 *     botón (48 × 48, radio 24) es su círculo. El texto se recorta con la misma forma.
 *   · **[Retoque 1] El primer cuadro, en tiempo**: el clic abre todo a mano (el tono, la forma, el reloj) y deja lo de
 *     React (lo que el botón anuncia, la trampa del diálogo) para una transición; el Genie es `memo`. Y montado el
 *     menú, una vez, el vidrio con su lente y las tiras se pintan dos cuadros casi transparentes: así el primer Genie no
 *     compila nada (`precalentar`). Medido en `navbar/retoque/1-transparencia/`.
 *   · **Cubre casi toda la pantalla**, centrado, con `--spacing-4` de margen en los cuatro lados. El vidrio y su tono:
 *     `vidrio.css` (sobre zona oscura, vidrio claro; sobre zona clara, oscuro; el texto en AA contra cualquier fondo).
 *   · Detrás, la sala se desenfoca y se oscurece (`salaDetrasDelMenu`, T1 de INTERFAZ 2) y la página, poco.
 *
 * El panel, su Genie y la trampa están en `MenuDeVidrio.tsx`. Es un diálogo con el foco atrapado (`TrampaDelMenu`, montada sólo mientras está abierto): su botón de cerrar está
 * ADENTRO, en el lugar del botón del menú (que se esconde mientras el panel lo tapa). Esc, el botón o tocar afuera lo
 * cierran; el foco vuelve al botón del menú. «Contacto» abre el formulario cuando el menú terminó de irse.
 */

export { Menu, ROTULO_DEL_MENU }

/** Sobre una zona oscura (la sala de noche, una foto), el vidrio claro; sobre una clara, el oscuro. */
function zonaOscura(): boolean {
  const debajo = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
  if (debajo !== null && (debajo.tagName === 'IMG' || debajo.tagName === 'VIDEO')) return true
  return tonoBajo(debajo, nocheQueSeVe()) === 'oscuro'
}

export function MenuMovil(): React.JSX.Element | null {
  const { modo } = useContacto()
  const [abierto, setAbierto] = useState(false)
  const boton = useRef<HTMLButtonElement>(null)
  const menu = useRef<ControlDelMenu>(null)
  const enMenu = modo === 'menu'
  const invertido = vaInvertido(useTonoDebajo(boton, enMenu))

  // [INTERFAZ 2] T1 · la sala se desenfoca y se oscurece apenas detrás del menú abierto.
  useEffect(() => {
    salaDetrasDelMenu(abierto)
    return () => salaDetrasDelMenu(false)
  }, [abierto])

  // Si el chrome vuelve a la barra, el menú se cierra (ajuste durante el render, no en un efecto).
  const [enMenuAntes, setEnMenuAntes] = useState(enMenu)
  if (enMenuAntes !== enMenu) {
    setEnMenuAntes(enMenu)
    if (!enMenu) setAbierto(false)
  }

  // El panel abierto tapa al botón (su botón de cerrar va en el mismo lugar): a mano, sin volver a dibujar.
  const cubrir = useCallback((si: boolean) => boton.current?.style.setProperty('visibility', si ? 'hidden' : 'visible'), [])
  const alCerrado = useCallback(() => setAbierto(false), [])

  // Al cerrar del todo, con la trampa de foco y el bloqueo de scroll ya soltados.
  // [RETOQUE 3D] N1 · Contacto es un enlace del viaje, como las secciones: al soltar, el foco vuelve al botón.
  const alSoltar = useCallback((): void => {
    boton.current?.focus({ preventScroll: true })
  }, [])

  if (!enMenu) return null
  return (
    // [NAVBAR] Arriba del resto del chrome (el infinito del recorrido, la barra): el panel abierto lo tapa todo.
    <div data-pieza="menu-movil" className="fixed inset-x-0 top-0 z-[var(--z-overlay)]">
      <Menu ref={menu} abierto={abierto} boton={boton} alCubrir={cubrir} alCerrado={alCerrado} alSoltar={alSoltar} />
      <button
        ref={boton}
        type="button"
        data-parte="boton-del-menu"
        data-seccion={invertido ? 'invertida' : undefined}
        aria-label={abierto ? ROTULO_DEL_MENU.cerrar : ROTULO_DEL_MENU.abrir}
        aria-expanded={abierto}
        aria-controls="menu-movil"
        onClick={() => {
          if (abierto) return
          // [Retoque 1] El Genie arranca en este mismo cuadro, a mano; lo de React va después, en una transición.
          menu.current?.abrir(!zonaOscura())
          salaDetrasDelMenu(true)
          startTransition(() => setAbierto(true))
        }}
        className="bg-fondo text-tinta border-borde fixed inset-x-0 top-[var(--spacing-4)] mx-auto grid size-[var(--spacing-12)] place-items-center rounded-full border shadow-[var(--shadow-flotante)] transition-colors duration-[var(--duracion-media)]"
      >
        <Isotipo className="h-[var(--spacing-5)]" />
      </button>
    </div>
  )
}
