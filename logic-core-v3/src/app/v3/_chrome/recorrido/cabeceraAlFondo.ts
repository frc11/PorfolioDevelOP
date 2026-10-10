'use client'

import { useEffect } from 'react'

/**
 * [PULIDO 13] K5 · AL FONDO, SI EL PIE NO ENTRA, LA CABECERA SE RETIRA — abajo de 1024 los controles fijos (el parlante, el menú y
 * el progreso) flotan arriba. En el reposo de cada sección nada queda debajo (la zona de la cabecera, `barra.css`); al fondo, si el
 * pie es más alto que la pantalla, lo de arriba del pie (cortado por el borde) quedaba debajo de ellos y no hay relleno que lo
 * arregle. Ahí se retiran (`data-cabecera-retirada` en la raíz de /v3: el pie ya trae el recorrido y el contacto) y vuelven al
 * subir. Sólo con la cabecera del teléfono (con la barra a la vista, no).
 */
export const CABECERA_AL_FONDO = { atributo: 'data-cabecera-retirada', toleranciaPx: 2 } as const

/** ¿Se retira? Al fondo (con la tolerancia de un scroll suave) y con el pie más alto que la pantalla (su borde de arriba, afuera). */
export function retiradaAlFondo(scroll: number, alto: number, total: number, arribaDelPie: number): boolean {
  return scroll + alto >= total - CABECERA_AL_FONDO.toleranciaPx && arribaDelPie < -CABECERA_AL_FONDO.toleranciaPx
}

export function useCabeceraAlFondo(activa: boolean): void {
  useEffect(() => {
    const raiz = document.querySelector('[data-v3]')
    if (raiz === null) return undefined
    if (!activa) {
      raiz.removeAttribute(CABECERA_AL_FONDO.atributo)
      return undefined
    }
    let cuadro = 0
    const medir = (): void => {
      cuadro = 0
      const pie = document.querySelector('[data-pieza="pie"]')
      const retirada = pie !== null && retiradaAlFondo(window.scrollY, window.innerHeight, document.documentElement.scrollHeight, pie.getBoundingClientRect().top)
      // Sólo al cambiar: un atributo de la raíz recalcula la página.
      if (raiz.hasAttribute(CABECERA_AL_FONDO.atributo) !== retirada) raiz.toggleAttribute(CABECERA_AL_FONDO.atributo, retirada)
    }
    const pedir = (): void => {
      if (cuadro === 0) cuadro = window.requestAnimationFrame(medir)
    }
    medir()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir, { passive: true })
    return () => {
      window.cancelAnimationFrame(cuadro)
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      raiz.removeAttribute(CABECERA_AL_FONDO.atributo)
    }
  }, [activa])
}
