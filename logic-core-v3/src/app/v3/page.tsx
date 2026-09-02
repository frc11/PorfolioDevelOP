import type { Metadata } from 'next'

import { ChromeDelHome } from './_chrome/ChromeDelHome'
import { IntroDelHome } from './_intro/IntroDelHome'
import { CompuertaDelHome } from './_secciones/CompuertaDelHome'
import { Home } from './_secciones/Home'

/**
 * EL HOME NUEVO — el chrome, el intro, y las ocho secciones con la compuerta
 * resuelta arriba.
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
 * ── Las cuatro cosas que esta página hace, y ninguna más ───────────────────
 *
 *   1. Monta **el chrome**, y va PRIMERO por una razón geométrica: el
 *      envoltorio de la pastilla de navegación es `sticky` con alto CERO y la
 *      pastilla vive `absolute` adentro, a `100svh − 72px`. Su posición de
 *      nacimiento la define dónde está en el documento, así que tiene que ser
 *      lo más arriba posible o nace tarde. No empuja nada: mide cero.
 *   2. Monta **el intro**, que es el preloader del home. Import ESTÁTICO y no
 *      perezoso: el overlay tiene que viajar en el HTML del servidor, porque el
 *      servidor no conoce `sessionStorage` y quien decide si se ve es el
 *      `<script>` pre-paint del layout raíz. El porqué completo está en
 *      `_intro/contrato.ts`.
 *   3. Resuelve **la compuerta de la coreografía, una sola vez**, alrededor de
 *      las ocho. El porqué está en `CompuertaDelHome.tsx`; en una línea: abajo
 *      de 1025 el árbol animado no se descarga, y arriba entra por `import()`
 *      perezoso sin que el contenido se escriba dos veces.
 *   4. Recorre el registro. No lista secciones a mano.
 *
 * ── Dónde NO está la escena, y por qué ─────────────────────────────────────
 *
 * La escena 3D **no se monta acá**: cuelga de `layout.tsx`, detrás de la
 * compuerta de 1025, porque es PERMANENTE y no una sección. Sobrevive a la
 * navegación entre páginas de /v3 sin remontarse, que es el hallazgo
 * estructural entero —un canvas a viewport completo con paneles de DOM
 * deslizándose encima—. Esta página no la nombra.
 *
 * ── El orden entre las tres capas ──────────────────────────────────────────
 *
 * Lo resuelve `z-index` y no el orden del documento, porque las tres capas
 * están fuera del flujo: escenario `z-0`, contenido `z-10`, pastilla
 * `--z-cabecera` = 100, overlay del intro 9999. El orden del JSX importa por
 * una sola cosa, y es la de arriba: dónde NACE la pastilla.
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
      <ChromeDelHome />
      <IntroDelHome />
      <CompuertaDelHome>
        <main className="relative z-10">
          <Home />
        </main>
      </CompuertaDelHome>
    </>
  )
}
