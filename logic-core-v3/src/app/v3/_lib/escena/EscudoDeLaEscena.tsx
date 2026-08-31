'use client'

import { Component, type ReactNode } from 'react'

/**
 * CONTENCIÓN DEL CANVAS EN EL HOME.
 *
 * `<Canvas>` re-lanza hacia afuera cualquier error de su árbol, así que sin
 * esto un fallo de WebGL —o la validación del track, que corre adentro del
 * `useFrame`— se lleva puesta **la página entera**: las ocho secciones, la
 * pastilla de navegación y el pie. La escena es ornamento; el contenido no.
 *
 * ── Por qué es un archivo propio y no el del probe ─────────────────────────
 *
 * `ProbeEscena.tsx` tiene uno con el mismo trabajo (`StageErrorBoundary`) y
 * **no lo exporta**: es privado de ese módulo, que además es el panel de
 * calibración y no se muda. Importarlo obligaría a exportarlo, o sea a tocar un
 * archivo del panel por una razón que no es la mudanza.
 *
 * ── Y por qué el fallback es `null` y no un cartel ─────────────────────────
 *
 * Porque acá el error no deja a nadie sin nada que mirar: abajo del escudo hay
 * un `fixed inset-0` de ornamento y **encima está el home entero**, que se
 * renderiza igual. Un cartel de error sobre el home sería peor que la falla. El
 * probe sí pone uno porque ahí el canvas ES la página.
 */
export class EscudoDeLaEscena extends Component<{ children: ReactNode }, { fallo: boolean }> {
  state = { fallo: false }

  static getDerivedStateFromError() {
    return { fallo: true }
  }

  componentDidCatch(error: Error) {
    console.warn('v3/escena: el canvas falló y quedó contenido. El home sigue entero.', error)
  }

  render() {
    return this.state.fallo ? null : this.props.children
  }
}
