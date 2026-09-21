import type { Curva } from '../_lib/motion/curvas'

/**
 * EL VIAJE CUANDO NO HAY LENIS — abajo del umbral de 1025.
 *
 * ── ⚠️ POR QUÉ EXISTE, Y POR QUÉ NO ES «OTRO MOTOR DE SCROLL» ─────────────
 *
 * El deslizamiento del CTA vivía adentro del módulo perezoso que monta Lenis, y
 * la consecuencia estaba escrita como si fuera una decisión: *«abajo de 1025 no
 * hay instancia, no hay canvas y no hay escena que mirar durante el viaje: el
 * pedido no existe ahí»*. **La mitad del medio de esa frase envejeció.** El
 * dueño dio vuelta la compuerta del escenario —`EscenarioCompuerta`: «se monta
 * siempre, no hay `return null`»— así que abajo de 1025 SÍ hay canvas y SÍ hay
 * escena, y la cámara SÍ sigue al scroll: lo único que falta es alguien que
 * mueva el scroll despacio. Medido: a 375, 768 y 1024 el click del CTA mueve el
 * scroll en UN cuadro (`EN VUELO 0`), y a 1440 en 128.
 *
 * Esto NO es un motor de scroll: no intercepta la rueda, no reemplaza la
 * posición, no corre en reposo y no existe fuera de los ~2,9 s del viaje. Es un
 * `window.scrollTo` por cuadro, con la MISMA curva y la MISMA duración que el
 * viaje de arriba del umbral, y termina soltando todo. La decisión de que abajo
 * de 1025 el scroll de la página sea el nativo **no se toca**.
 *
 * ── ⚠️ EL DESTINO SE CALCULA IGUAL QUE LO CALCULA LENIS ──────────────────
 *
 * Arriba del umbral el destino no lo escribe nadie: se lo pasa el `<a>` a
 * `lenis.scrollTo`, que sobre `lenis@1.3.25` (`lenis.mjs:770-778`) hace
 *
 *     target = rect.top + animatedScroll − scrollMarginTop(nodo) − scrollPaddingTop(raíz)
 *
 * que es lo que hace el navegador con un ancla. Acá se reproduce **esa misma
 * cuenta**, no una aproximación: es lo que hace que el pedido «tiene que llevar
 * al mismo lugar que arriba de 1025» sea verificable en vez de opinable. Los 72
 * px salen de `_estilos/navegacion.css` y son los mismos que despejan los quince
 * enlaces del sitio. Medido antes de construir esto: el ancla nativa ya dejaba
 * `#trabajos` a **72 px del borde en los cuatro anchos**, así que ése es el
 * número que hay que reproducir.
 */
export function destinoDelAncla(seccion: HTMLElement): number {
  const rect = seccion.getBoundingClientRect()
  const margen = Number.parseFloat(getComputedStyle(seccion).scrollMarginTop)
  const relleno = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)
  const crudo =
    rect.top + window.scrollY - (Number.isFinite(margen) ? margen : 0) - (Number.isFinite(relleno) ? relleno : 0)
  // El tope del documento, para no pedirle al navegador un destino que no existe:
  // más allá del máximo el scroll se clava y el viaje terminaría antes de tiempo.
  const maximo = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  return Math.min(Math.max(crudo, 0), maximo)
}

/**
 * MUEVE EL SCROLL de donde está hasta `destino`, en `duracionMs`, con `curva`.
 *
 * Devuelve la función que lo cancela. Es idempotente: `terminar` la llama en las
 * cinco salidas, incluida la que corre DESPUÉS de que el viaje terminó solo.
 *
 * ── ⚠️ EL RELOJ ES `performance.now()` Y NO EL ACUMULADO DE CUADROS ───────
 *
 * Sumar `delta` por cuadro hace que el viaje dure más en un dispositivo que
 * pierde cuadros, que es exactamente el dispositivo donde esto corre. Con el
 * reloj de pared la duración es la misma en los dos, y lo que un teléfono
 * lento pierde es suavidad, no tiempo — que es la forma correcta de degradar.
 *
 * ── Y por qué `window.scrollTo` y no `scrollBy` ──────────────────────────
 *
 * Porque `scrollTo` es absoluto: si algo más mueve el scroll a mitad de vuelo
 * —una barra de navegador que aparece, un ancla— el próximo cuadro corrige en
 * vez de acumular el error. Y va sin `behavior`, o sea instantáneo por cuadro:
 * pedirle `smooth` al navegador encima de esto serían dos interpolaciones
 * peleándose por la misma posición.
 */
export function viajarSinLenis(
  destino: number,
  duracionMs: number,
  curva: Curva,
  alTerminar: () => void,
): () => void {
  const salida = window.scrollY
  const recorrido = destino - salida
  const arranque = performance.now()
  let pedido = 0
  let vivo = true

  const cuadro = (): void => {
    if (!vivo) return
    const t = Math.min(1, (performance.now() - arranque) / duracionMs)
    window.scrollTo(0, salida + recorrido * curva(t))
    if (t < 1) {
      pedido = requestAnimationFrame(cuadro)
      return
    }
    vivo = false
    pedido = 0
    alTerminar()
  }

  pedido = requestAnimationFrame(cuadro)

  return () => {
    if (!vivo) return
    vivo = false
    if (pedido !== 0) cancelAnimationFrame(pedido)
    pedido = 0
  }
}
