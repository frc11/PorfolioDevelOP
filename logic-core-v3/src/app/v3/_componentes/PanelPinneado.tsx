import type { Seccion } from '../_lib/secciones'

import { Panel, RotuloDePanel } from './Panel'

/**
 * LA SECCIÓN PINNEADA DE DEMOSTRACIÓN — CSS `sticky`, ni una línea de JS.
 *
 * ── Por qué `sticky` y no una librería de scroll ───────────────────────────
 *
 * Está medido sobre la referencia: **33 de 36 separaciones en 0px y CERO
 * `.pin-spacer`**. El `.pin-spacer` es la huella que deja ScrollTrigger cuando
 * pinnea —un div fantasma que reserva la altura del elemento clavado—, y no
 * hay ninguno. El pinneado de la referencia no es JavaScript.
 *
 * Y hay una consecuencia práctica que vale más que la observación: **el
 * `sticky` sobrevive abajo de la compuerta de 1025**, porque no depende de
 * JavaScript. Mobile conserva el ritmo gratis, sin bajar un byte de más. Si
 * esto se hubiera hecho con JS habría que haberlo pagado dos veces: el peso
 * arriba del umbral, y un mobile sin ritmo abajo.
 *
 * ── Cómo funciona, exactamente ─────────────────────────────────────────────
 *
 *   La <section> mide 300svh  → 300svh de recorrido de scroll.
 *   El hijo `sticky` mide 100svh y se clava en `top: 0`.
 *   Resultado: el panel queda clavado durante 200svh de scroll y después se va.
 *
 * El recorrido es la ALTURA DE LA SECCIÓN menos la del hijo. Cambiar cuánto
 * dura el pin es cambiar `alto` en `secciones.ts` — un valor, no una
 * coreografía.
 *
 * ── La condición que hace que esto ande, y que es fácil de romper ──────────
 *
 * `position: sticky` deja de funcionar en silencio si CUALQUIER ancestro tiene
 * `overflow` distinto de `visible`. Se verificó que la cadena está limpia:
 * `globals.css` no declara `overflow` en `html` ni en `body` (solo
 * `scrollbar-width` y `overscroll-behavior`, que no lo rompen), y ni el
 * envoltorio de `/v3` ni el `<main>` lo declaran.
 * Quien agregue un `overflow-hidden` en cualquier ancestro de esto va a
 * romper el pinneado sin ningún error en consola.
 *
 * Segunda condición, cumplida por construcción: el hijo `sticky` es hijo
 * DIRECTO de la sección que le da recorrido. Un envoltorio intermedio con
 * altura automática le recorta el rango de pegado a cero.
 */
export function PanelPinneado({ seccion }: { seccion: Seccion }) {
  return (
    <Panel seccion={seccion}>
      <div className="sticky top-0 flex h-svh w-full items-center" data-pinneado="sticky">
        <RotuloDePanel seccion={seccion} />
      </div>
    </Panel>
  )
}
