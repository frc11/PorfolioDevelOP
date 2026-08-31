import type { Metadata } from 'next'

import { Navegacion } from './_componentes/chrome/Navegacion'
import { CompuertaDelHome } from './_secciones/CompuertaDelHome'
import { Home } from './_secciones/Home'

/**
 * EL HOME NUEVO — las ocho secciones, con la compuerta resuelta arriba.
 *
 * ── Por qué vive en /v3 y no reemplaza al home todavía ─────────────────────
 *
 * Es la misma disciplina con la que se construyó la escena en `/probe-escena`:
 * catorce sprints sin tocar el sitio vivo ni una vez. Y acá tiene una razón
 * extra — esta rama va a recibir merges de `main` durante semanas, y tocar los
 * mismos archivos que el otro socio produce conflictos caros.
 *
 * El reemplazo del home es un sprint chico al final, y es reversible.
 *
 * ── Las tres cosas que esta página hace, y ninguna más ─────────────────────
 *
 *   1. Monta la **pastilla de navegación**, y va PRIMERO por una razón
 *      geométrica: su envoltorio es `sticky` con alto CERO y la pastilla vive
 *      `absolute` adentro, a `100svh − 72px`. Su posición de nacimiento la
 *      define dónde está en el documento, así que tiene que ser lo más arriba
 *      posible o nace tarde. No empuja nada: mide cero.
 *   2. Resuelve **la compuerta de la coreografía, una sola vez**, alrededor de
 *      las ocho. El porqué está en `CompuertaDelHome.tsx`; en una línea: abajo
 *      de 1025 el árbol animado no se descarga, y arriba entra por `import()`
 *      perezoso sin que el contenido se escriba dos veces.
 *   3. Recorre el registro. No lista secciones a mano.
 *
 * ⚠ **Lo que NO monta, y queda anotado:** el cursor propio de S3. Montarlo es
 * una decisión de composición del chrome —si el home nuevo corre con cursor
 * propio o no— y este sprint compone lo que ya estaba construido, no decide lo
 * que nadie decidió. El pie sí está: vive adentro de la sección Cierre, que es
 * donde lo puso el sprint que la construyó.
 */
export const metadata: Metadata = {
  title: 'v3 — el home nuevo · develOP',
  description: 'Rediseño en construcción. No forma parte del sitio público.',
  // Mientras /v3 sea un borrador con contenido de relleno no puede competir con
  // el home en el índice. Se saca el día que /v3 REEMPLACE al home, en el mismo
  // sprint.
  robots: { index: false, follow: false, nocache: true },
}

export default function PaginaV3() {
  return (
    <>
      <Navegacion />
      <CompuertaDelHome>
        <Home />
      </CompuertaDelHome>
    </>
  )
}
