import type { Metadata } from 'next'

import { Panel, RotuloDePanel } from './_componentes/Panel'
import { PanelPinneado } from './_componentes/PanelPinneado'
import { SECCIONES } from './_lib/secciones'

/**
 * EL HOME NUEVO — el esqueleto, sin contenido.
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
 * ── Las ocho secciones ─────────────────────────────────────────────────────
 *
 * Salen de `_lib/secciones.ts` y esta página no decide nada sobre ellas: ni el
 * orden, ni la altura, ni la superficie. Recorre la tabla. Es lo que hace que
 * cambiar el recorrido de superficies del sitio sea editar ocho valores.
 *
 * La única bifurcación es `pinneada`, y hay exactamente una sección que la
 * lleva (Servicios). Un invariante lo afirma.
 */
export const metadata: Metadata = {
  title: 'v3 — esqueleto de canvas y paneles · develOP',
  description: 'Rediseño en construcción. No forma parte del sitio público.',
  // Mientras /v3 sea un esqueleto no puede competir con el home en el índice.
  // Se saca el día que /v3 REEMPLACE al home, en el mismo sprint.
  robots: { index: false, follow: false, nocache: true },
}

export default function PaginaV3() {
  return (
    <>
      {SECCIONES.map((seccion) =>
        seccion.pinneada ? (
          <PanelPinneado key={seccion.id} seccion={seccion} />
        ) : (
          <Panel key={seccion.id} seccion={seccion}>
            <div className="flex min-h-svh w-full items-center">
              <RotuloDePanel seccion={seccion} />
            </div>
          </Panel>
        ),
      )}
    </>
  )
}
