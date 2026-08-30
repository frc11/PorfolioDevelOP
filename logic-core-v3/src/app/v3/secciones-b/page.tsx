import type { Metadata } from 'next'

import { RECORRIDO } from './_contrato/recorrido'

/**
 * `/v3/secciones-b` — LAS SECCIONES 5 A 8, PARA PODER JUZGARLAS.
 *
 * ── Qué es y qué NO es ────────────────────────────────────────────────────
 *
 * Es una ruta de trabajo, no el sitio. Existe porque las cuatro secciones hay
 * que verlas en su superficie, con su altura y en su orden, y eso no se puede
 * hacer leyendo código. **No es la composición del home**: `/v3/page.tsx` es
 * del sprint que integre las ocho, y este lane tiene prohibido tocarlo.
 *
 * ── El orden y las superficies salen del DATO ─────────────────────────────
 *
 * Esta página no decide nada: recorre `RECORRIDO`, que sale de
 * `ORDEN_DE_SECCIONES_B`, y cada sección lee su superficie y su altura de
 * `_lib/secciones.ts` — el archivo que escribe el otro lane y que este lane
 * consume sin tocar. El día que ahí cambie una superficie, esta ruta la refleja
 * sin una línea de diferencia.
 *
 * ── Lo que se sirve abajo de 1025 ─────────────────────────────────────────
 *
 * Las cuatro secciones enteras, sin una sola transformada. La compuerta es de
 * ancho y el ancho no existe en el servidor, así que el HTML servido es el
 * árbol quieto y la coreografía entra en el re-render del cliente. No hay
 * pantalla en blanco ni contenido distinto: es el mismo texto.
 *
 * ── DEUDA CON FECHA DE BAJA ───────────────────────────────────────────────
 *
 * **Esta ruta se borra el día que las ocho secciones se compongan en el home**,
 * y a más tardar el 2026-12-31. Al borrarla hay que sacar también su fila de
 * `RUTAS_DE_DEMO` en `_lib/__tests__/s4-rutas-de-demo.ts`, que es la lista con
 * la que la PREDICCIÓN DEL MAPA se cierra sola. Está registrada ahí desde este
 * sprint, con su motivo.
 *
 * Lleva `noindex, nofollow, nocache` como las otras cinco rutas de trabajo de
 * `/v3`: mientras el sitio nuevo sea un borrador no puede competir con el home
 * en el índice.
 */
export const metadata: Metadata = {
  title: 'v3 — secciones 5 a 8 · develOP',
  description: 'Rediseño en construcción. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function PaginaSeccionesB() {
  return (
    <>
      {RECORRIDO.map(({ id, montable: Seccion }) => (
        <Seccion key={id} />
      ))}
    </>
  )
}
