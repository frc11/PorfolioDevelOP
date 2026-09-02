'use client'

import { Component, type ReactNode } from 'react'

/**
 * CONTENCIÓN DEL CANVAS DEL LOGO — y, sobre todo, **el aviso de que dejó de
 * dibujar**.
 *
 * ── Por qué existe (V3-A) ──────────────────────────────────────────────────
 *
 * `<Canvas>` re-lanza hacia afuera cualquier error de su árbol
 * (`react-three-fiber`: `if (error) throw error`), así que un fallo de WebGL o
 * del `SVGLoader` se llevaba puesto el overlay entero. Pero el problema grave no
 * era la página: era el **silencio**. Desde `swapEndS` el SVG vale 0 exacto y el
 * logo lo dibuja únicamente el mesh; si el mesh se caía, no quedaba nadie —
 * y el relevo, que era de una sola vía, no tenía cómo volver.
 *
 * Por eso el escudo **no sólo contiene: avisa**. `onCaido` apaga el `painted`
 * del motor y `introRelay.ts` devuelve el logo al SVG en el cuadro siguiente. El
 * acomodamiento pierde el volumen y la sombra, que es el fallback que
 * `IntroLogo3D.tsx` siempre prometió, en vez de perder el logo.
 *
 * ── Por qué no se reusa `EscudoDeLaEscena` ─────────────────────────────────
 *
 * Vive en `app/v3/_lib/escena/`, hace un trabajo parecido y **no avisa a nadie**
 * — su fallback es `null` y punto, porque allá el error deja al home entero
 * intacto. Acá el fallback tiene que producir un efecto en otro componente.
 * Importarlo obligaría a cambiarlo, y ese archivo es de otro frente.
 *
 * ── Y por qué el fallback es `null` ────────────────────────────────────────
 *
 * Porque el que dibuja el logo pasa a ser el SVG, que ya está montado, en la
 * misma caja y con el mismo color. No hay nada que poner en el lugar del canvas.
 */
type Props = {
  children: ReactNode
  /** Se dispara una vez, cuando el árbol del canvas tira. */
  onCaido: () => void
}

export class IntroLogoEscudo extends Component<Props, { caido: boolean }> {
  state = { caido: false }

  static getDerivedStateFromError() {
    return { caido: true }
  }

  componentDidCatch(error: Error) {
    this.props.onCaido()
    console.warn('home-intro: el canvas del logo falló; el SVG toma el vuelo.', error)
  }

  render() {
    return this.state.caido ? null : this.props.children
  }
}
