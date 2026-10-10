import type Lenis from 'lenis'

/**
 * [PULIDO 12] EL ESTADO DEL SCROLL DE LENIS, EN UN ATRIBUTO Y NO EN UNA CLASE DE `<html>`.
 *
 * Lenis escribe en `<html>` las clases de su estado (`lenis-scrolling` y `lenis-smooth`) cada vez que el scroll arranca y
 * cada vez que para: en cada gesto de la rueda y en cada viaje del menú. Y en esta hoja cualquier cambio de clase en `<html>`
 * (o en `<body>`) recalcula el estilo de la página ENTERA: las reglas de `@tailwindcss/typography` (globales, las usa el
 * chatbot) terminan en `:not(:where([class~="not-prose"], [class~="not-prose"] *))` — un atributo `class` con descendiente
 * universal — y con eso Chrome invalida todo el subárbol ante cualquier clase de un ancestro. Medido a 1440 en Servicios: 6–8
 * ms por cambio (22 ms en un viaje; el cuadro de 27 ms al arrancar y al terminar cada viaje de la matriz); con un atributo
 * `data-` en su lugar, 0.
 *
 * Así que en /v3 Lenis deja en `<html>` sólo las clases que cambian poco (`lenis`, `lenis-stopped`, `lenis-locked`: las de
 * `lenis.css` que importan) y el «scroll suave en curso» va en `ATRIBUTO_DEL_SCROLL_EN_CURSO`, en la raíz de /v3 (`[data-v3]`:
 * las hojas de /v3 se acotan ahí; la regla de `lenis.css` que
 * colgaba de `lenis-smooth`, los iframes sin puntero mientras corre, está en `demos.css` con el atributo: las demos son los iframes de /v3). El método es
 * privado en los tipos de Lenis: se reemplaza en la instancia (`defineProperty`), no en la clase.
 */
export const ATRIBUTO_DEL_SCROLL_EN_CURSO = 'data-scroll-suave-en-curso'

/** Las clases de Lenis que corresponden a su estado, sin las del scroll en curso (`lenis-autoToggle` si la opción está prendida). */
export function clasesQuietas(estado: { readonly isStopped: boolean; readonly isLocked: boolean; readonly options?: { readonly autoToggle?: boolean } }): string[] {
  return ['lenis', ...(estado.options?.autoToggle === true ? ['lenis-autoToggle'] : []), ...(estado.isStopped ? ['lenis-stopped'] : []), ...(estado.isLocked ? ['lenis-locked'] : [])]
}

export function sinClasesDeScroll(lenis: Lenis): void {
  const raiz = document.documentElement
  const actualizar = (): void => {
    const quiero = clasesQuietas(lenis)
    const tengo = Array.from(raiz.classList).filter((c) => c === 'lenis' || c.startsWith('lenis-'))
    // Sólo si cambió algo de lo quieto: en un gesto de la rueda no se toca ninguna clase.
    if (tengo.length !== quiero.length || tengo.some((c) => !quiero.includes(c))) {
      for (const c of tengo) raiz.classList.remove(c)
      for (const c of quiero) raiz.classList.add(c)
    }
    const suave = lenis.isScrolling === 'smooth'
    const deV3 = document.querySelector<HTMLElement>('[data-v3]')
    if (deV3 !== null && deV3.hasAttribute(ATRIBUTO_DEL_SCROLL_EN_CURSO) !== suave) deV3.toggleAttribute(ATRIBUTO_DEL_SCROLL_EN_CURSO, suave)
  }
  Object.defineProperty(lenis, 'updateClassName', { configurable: true, value: actualizar })
  // Lo que Lenis ya escribió al construirse, con la regla nueva.
  actualizar()
}
