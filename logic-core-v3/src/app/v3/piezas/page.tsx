import type { Metadata } from 'next'

import { PiezasDePrueba } from './_bloques/PiezasDePrueba'

/**
 * ⚠️ INSTRUMENTO, NO PANTALLA. [C2 · 20] LAS PIEZAS COMPARTIDAS DE LA COLA 2, a la vista: `EstadoDeEnvio`, `AvisoDeScroll`, `Reluciente`
 * y el autocompletado de /v3, cada una sobre el papel y en una sección invertida. La miran el orquestador y los bancos
 * (`scripts-carga/estado-de-envio.ts`, `scripts-carga/autocompletado.ts`). `noindex`, fuera del sitemap (que no lista /v3). No toca la
 * página base. Se borra cuando las piezas estén montadas en sus secciones y vistas por Valentino.
 *
 * El envío de prueba va a `/api/piezas-de-prueba`, que NO existe (sin banco, da error: nunca toca la base); los bancos lo interceptan
 * con `page.route`. Para mirarlo a mano sin red: `?simular=exito` o `?simular=error` (responde a los 900 ms).
 */
export const metadata: Metadata = {
  title: 'v3 · las piezas compartidas — instrumento interno',
  description: 'El estado de envío, el aviso de scroll, el reluciente y el autocompletado. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Piezas(): React.JSX.Element {
  return <PiezasDePrueba />
}
