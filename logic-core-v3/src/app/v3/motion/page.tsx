import type { Metadata } from 'next'

import { CompuertaDeMotion } from './_componentes/CompuertaDeMotion'

/**
 * ⚠️ INSTRUMENTO, NO PANTALLA. ESTA RUTA ES DEUDA CON FECHA DE BAJA.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ SE BORRA cuando el sitio esté armado y las secciones consuman el sistema │
 * │ de motion directamente. Es la mesa de calibración, no una página.        │
 * │ Al borrarla hay que borrar también:                                      │
 * │   · `/v3/motion/control-estatico` (su control positivo)                   │
 * │   · las afirmaciones B2 y B3 de `_lib/motion/__tests__/motion-bundle`     │
 * │   · `_componentes/` entero — el sistema vive en `_lib/motion/`, que se    │
 * │     queda.                                                               │
 * │ Lo que NO se borra: `src/app/v3/_lib/motion/`. Ése es el sistema.         │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * ── Para qué existe ────────────────────────────────────────────────────────
 *
 * Los nueve patrones se juzgan por grabación, no por captura: son movimiento, y
 * una captura de un movimiento no dice nada. Esta ruta es donde se graban.
 *
 * Tiene un bloque por patrón con su nombre y sus números medidos a la vista, y
 * un panel de calibración que varía duración, escalonado y curva sin recompilar.
 * P1 aparece tres veces —uno, tres y seis líneas— porque ése es el rango que la
 * medición encontró en la referencia y porque lo que hay que juzgar ahí no es el
 * gesto sino cómo escala el escalonado.
 *
 * ── `noindex` ─────────────────────────────────────────────────────────────
 *
 * Igual que `/v3` y `/v3/control-estatico`. Es un instrumento interno con texto
 * de relleno: indexarlo sería publicar una página que no dice nada.
 */
export const metadata: Metadata = {
  title: 'v3 · los nueve patrones de motion — instrumento interno',
  description:
    'Mesa de calibración de la coreografía de v3. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function PaginaDeMotion() {
  return <CompuertaDeMotion />
}
