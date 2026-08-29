import type { Metadata } from 'next'

import Coreografia from '../_componentes/Coreografia'

/**
 * ⚠️ INSTRUMENTO, NO PANTALLA. ESTA RUTA ES DEUDA CON FECHA DE BAJA.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ SE BORRA junto con `/v3/motion`. Al borrarla hay que borrar también la    │
 * │ afirmación B3 de `_lib/motion/__tests__/motion-bundle.invariant.ts` — o   │
 * │ reemplazarla por el control equivalente con build aislado                 │
 * │ (`E2E_DIST_DIR`), que no deja ruta.                                       │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * ── Para qué existe ────────────────────────────────────────────────────────
 *
 * Es **el control positivo de la compuerta, para el chunk de la coreografía**.
 *
 * `/v3/motion` afirma que el chunk de motion NO está entre los archivos que pide
 * su carga inicial. Sola, esa afirmación pasa en verde por dos motivos distintos
 * e indistinguibles: porque la compuerta funciona, o porque el buscador está
 * ciego —el módulo no compiló, la marca se podó, el HTML se leyó mal—.
 *
 * Esta ruta lo distingue. Importa **el mismo módulo** de forma **estática**, en
 * el **mismo build**, y el invariante corre **la misma función de chequeo** sobre
 * las dos:
 *
 *     /v3/motion                   la marca NO está en la carga inicial  (la tesis)
 *     /v3/motion/control-estatico  la marca SÍ está en la carga inicial  (el control)
 *
 * Es la misma arquitectura que S1 montó para el escenario, con la marca de la
 * coreografía en vez de la del canvas. Dos chunks distintos detrás de la misma
 * compuerta, cada uno con su control.
 *
 * ── Por qué el import de acá es estático de verdad ─────────────────────────
 *
 * `import Coreografia from '…'` en un Server Component: el componente es cliente
 * (`'use client'`), así que Next lo trata como frontera de cliente y su chunk
 * entra en la carga inicial de ESTA ruta. Sin `next/dynamic`, sin `ssr: false`,
 * sin compuerta de ancho — la coreografía se monta en todos los anchos, que es
 * exactamente lo que esta ruta tiene que demostrar que pasa cuando alguien se
 * olvida de la compuerta.
 */
export const metadata: Metadata = {
  title: 'v3 · control estático de motion — instrumento interno',
  description:
    'Control positivo de la compuerta de 1025 para el chunk de la coreografía. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function PaginaControlEstaticoDeMotion() {
  return <Coreografia />
}
