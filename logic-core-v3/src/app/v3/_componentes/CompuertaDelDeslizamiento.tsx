'use client'

import dynamic from 'next/dynamic'

import { CONSULTA_SCROLL_SUAVE } from '../_lib/scrollSuave'
import { useAnchoMinimo } from '../_lib/useAnchoMinimo'
import { usePrefiereMenosMovimiento } from '../_lib/usePrefiereMenosMovimiento'

/**
 * LA COMPUERTA DEL DESLIZAMIENTO ABAJO DEL UMBRAL — la mitad que faltaba.
 *
 * ── ⚠️ QUÉ ARREGLA, Y POR QUÉ ERA UNA COMPUERTA Y NO UN BUG ──────────────
 *
 * El deslizamiento del CTA vivía ENTERO adentro del módulo perezoso que monta
 * Lenis, así que heredaba su compuerta de ancho: abajo de 1025
 * `CompuertaDelScrollSuave` devuelve `null`, el `import()` no corre, el escucha
 * no se instala y el `<a href="#trabajos">` hace lo que hace un ancla — **saltar
 * en un cuadro**. Medido antes de tocar nada, muestreando `window.scrollY` con
 * rAF durante el click: `EN VUELO 0` a 375, 768 y 1024 contra `EN VUELO 128` a
 * 1440.
 *
 * Heredar esa compuerta era correcto cuando se escribió, y la razón está escrita
 * en el hook: *«abajo de 1025 no hay instancia, no hay canvas y no hay escena que
 * mirar durante el viaje»*. **Dos de esas tres cosas dejaron de ser ciertas.** El
 * dueño dio vuelta la compuerta del escenario —`EscenarioCompuerta`: «se monta
 * siempre, no hay `return null`»— y desde entonces abajo de 1025 hay canvas, hay
 * escena y la cámara sigue al scroll. Verificado en la misma corrida: `escena` y
 * `lienzo` presentes, y el renderer dibujando, en los cuatro anchos.
 *
 * Lo único que seguía faltando era **quién mueve el scroll despacio**, y eso no
 * necesita a Lenis: `viajeSinLenis.ts` lo hace con un `window.scrollTo` por
 * cuadro, con la misma curva, la misma duración y el mismo destino.
 *
 * ── ⚠️ POR QUÉ ESTA COMPUERTA ES EL COMPLEMENTO EXACTO DE LA OTRA ────────
 *
 * Porque el deslizamiento tiene que instalarse **una sola vez**. Arriba del
 * umbral lo monta `ScrollSuaveDeV3`, que ya llama al hook con la instancia de
 * Lenis en la mano; si esta compuerta también lo montara ahí, habría dos escuchas
 * de click sobre el mismo CTA y el segundo se encontraría con un `<main>` ya
 * inerte. Por eso la primera línea es `if (arribaDelUmbral) return null`: las dos
 * compuertas leen **la misma consulta** —`CONSULTA_SCROLL_SUAVE`, importada, no
 * reescrita— y parten el eje en dos mitades que no se pisan.
 *
 * ── Y `prefers-reduced-motion` sigue siendo un no rotundo ────────────────
 *
 * Un scroll interpolado ES movimiento, lo mueva Lenis o lo mueva un `rAF`. La
 * segunda compuerta de `deberiaCorrerElScrollSuave` no se hereda desde acá
 * —porque la primera ya decidió lo contrario— así que se consulta derecho. Con la
 * preferencia puesta, este módulo no se descarga y el CTA vuelve a ser el ancla
 * nativa, que es exactamente lo que alguien que pidió menos movimiento quiere.
 */
const DeslizamientoSinScrollSuave = dynamic(() => import('./DeslizamientoSinScrollSuave'), { ssr: false })

export function CompuertaDelDeslizamiento() {
  const arribaDelUmbral = useAnchoMinimo(CONSULTA_SCROLL_SUAVE)
  const prefiereMenosMovimiento = usePrefiereMenosMovimiento()

  // Arriba del umbral el deslizamiento ya lo monta `ScrollSuaveDeV3`, con la
  // instancia de Lenis. Montarlo dos veces serían dos escuchas del mismo click.
  if (arribaDelUmbral) return null
  if (prefiereMenosMovimiento) return null

  return <DeslizamientoSinScrollSuave />
}
