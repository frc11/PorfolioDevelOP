import type { Metadata } from 'next'

import { ProbeEscena } from './_components/ProbeEscena'

/**
 * Probe de la escena 3D — instrumento interno, NO parte del sitio público.
 *
 * Existe para contestar una sola pregunta antes de construir la coreografía del
 * home: el logo es una extrusión plana de un SVG, ¿aguanta que la cámara lo
 * orbite 360°? Acá no hay coreografía, ni scroll, ni inercia: hay una escena
 * manipulable y un humano mirando.
 *
 * `noindex, nofollow` y sin un solo link entrante — se llega escribiendo la
 * URL, igual que a `/styleguide`. La ruta está además en `CHROME_FREE_PREFIXES`
 * (`components/layout/publicRoute.ts`) para que el chrome público —navbar,
 * shutter, launcher del chat— no pinte encima de la escena que se está
 * juzgando.
 */
export const metadata: Metadata = {
  title: 'Probe — escena 3D con órbita de cámara · develOP',
  description: 'Página interna del rediseño. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function ProbeEscenaPage() {
  return <ProbeEscena />
}
