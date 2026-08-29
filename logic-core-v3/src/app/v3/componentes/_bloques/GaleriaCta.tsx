import { Cta, CtaEnlace } from '../../_componentes/chrome/Cta'
import { palabrasDelRotulo, ROTULO_DE_MUESTRA, ROLLOVER_MEDIDO } from '../../_lib/cta'

import { Estado, Ficha } from './Ficha'

/**
 * EL CTA — las dos variantes y sus cuatro estados.
 *
 * ── Qué mirar acá ─────────────────────────────────────────────────────────
 *
 * El vivo, con el puntero y con Tab. El rollover tarda 1,3 segundos: es una
 * transición NARRATIVA, no de feedback, y esa lentitud es medida — la duración
 * más frecuente del sistema es también la más lenta.
 *
 * Y una cosa que en la referencia no pasa: **con Tab, el rollover corre
 * igual**. Ahí el foco no dispara nada y un usuario de teclado no recibe
 * ninguna señal de dónde está.
 *
 * ── La cuenta del rótulo accesible ────────────────────────────────────────
 *
 * La nota de la primera ficha no está escrita a mano: la calcula
 * `palabrasDelRotulo()`, la misma función que corre el invariante. Si alguien
 * sacara el `aria-hidden` de la segunda copia, el número de esta página
 * cambiaría solo — y el invariante fallaría.
 */
export function GaleriaCta() {
  const palabras = palabrasDelRotulo(
    `<span><span>${ROTULO_DE_MUESTRA}</span><span aria-hidden="true">${ROTULO_DE_MUESTRA}</span></span>`,
  )
  const palabrasSinCorreccion = palabrasDelRotulo(
    `<span><span>${ROTULO_DE_MUESTRA}</span><span>${ROTULO_DE_MUESTRA}</span></span>`,
  )

  return (
    <>
      <Ficha
        titulo="CTA de rollover · variante línea"
        nota={`Rótulo accesible: ${palabras} palabras con la corrección, ${palabrasSinCorreccion} sin ella. El intercambio dura ${ROLLOVER_MEDIDO.duraciones.intercambioMs} ms.`}
      >
        <Estado rotulo="vivo — probá con el puntero y con Tab">
          <Cta rotulo={ROTULO_DE_MUESTRA} variante="linea" />
        </Estado>
        <Estado rotulo="reposo">
          <Cta rotulo={ROTULO_DE_MUESTRA} variante="linea" />
        </Estado>
        <Estado rotulo="hover, forzado">
          <Cta rotulo={ROTULO_DE_MUESTRA} variante="linea" forzado="hover" />
        </Estado>
        <Estado rotulo="foco, forzado">
          <Cta rotulo={ROTULO_DE_MUESTRA} variante="linea" forzado="foco" />
        </Estado>
        <Estado rotulo="deshabilitado — el rollover no corre">
          <Cta rotulo={ROTULO_DE_MUESTRA} variante="linea" deshabilitado />
        </Estado>
      </Ficha>

      <Ficha
        titulo="CTA de rollover · variante bloque"
        nota="9 de las 26 apariciones medidas. Misma coreografía, caja a ancho completo."
      >
        <Estado rotulo="vivo">
          <Cta rotulo={ROTULO_DE_MUESTRA} variante="bloque" />
        </Estado>
        <Estado rotulo="hover, forzado">
          <Cta rotulo={ROTULO_DE_MUESTRA} variante="bloque" forzado="hover" />
        </Estado>
      </Ficha>

      <Ficha
        titulo="CTA como enlace"
        nota="La referencia envuelve el botón en un enlace. Acá son dos componentes distintos y nunca anidados: contenido interactivo dentro de un enlace da dos paradas de tabulación para un solo control."
      >
        <Estado rotulo="vivo">
          <CtaEnlace href="#cta" rotulo={ROTULO_DE_MUESTRA} />
        </Estado>
        <Estado rotulo="foco, forzado">
          <CtaEnlace href="#cta" rotulo={ROTULO_DE_MUESTRA} forzado="foco" />
        </Estado>
      </Ficha>
    </>
  )
}
