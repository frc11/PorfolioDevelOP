import type { Metadata } from 'next'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Escala } from '../_bloques/Escala'
import { Multiplicadores } from '../_bloques/Multiplicadores'

/**
 * ⚠️ INSTRUMENTO, NO PANTALLA. DEUDA CON FECHA DE BAJA.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ SE BORRA junto con `/v3/tipografia`, que es lo único que la carga.       │
 * │ Baja: el día que /v3 reemplace al home, y a más tardar el 2026-12-31.    │
 * │ No forma parte del sitio: `robots: noindex, nofollow`.                   │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * ── Para qué existe una ruta aparte ───────────────────────────────────────
 *
 * Porque los seis niveles fluidos usan `clamp()` con `vw`, y `vw` se resuelve
 * contra el **viewport**, no contra el contenedor. Tres columnas de 375, 860 y
 * 1440px en una misma página mostrarían el MISMO tamaño en las tres: no
 * demostrarían nada.
 *
 * Un `<iframe>` sí tiene viewport propio. `/v3/tipografia` monta esta ruta
 * tres veces, a tres anchos, y ahí los `clamp()` resuelven de verdad. Es la
 * única forma de ver la banda fluida entera en una sola captura sin escalar
 * nada — y escalar sería justamente lo que arruinaría el juicio óptico.
 *
 * ── El panel opaco ────────────────────────────────────────────────────────
 *
 * El layout de /v3 monta el escenario de prueba `fixed inset-0`. Adentro del
 * iframe eso pintaría dos bandas grises detrás del texto. Este panel es
 * `papel-opaco` —`bg-fondo`, `z-10`— que es el mismo recurso que usan los
 * paneles del esqueleto, no un parche.
 *
 * ── ⚠️ B7 · `D7` — EL `overflow-x-auto` DE LA RAÍZ NO ES COSMÉTICO ────────
 *
 * Sin él esta ruta **desbordaba a 375 y rompía de raíz la medición que existe
 * para permitir**. Medido con la receta del banco: `outerWidth` 375 y
 * `visualViewport.width` 375 —la ventana ERA de 375— pero `innerWidth` 638 y
 * `document.documentElement.scrollWidth` 638. Se ensanchaba el viewport de
 * LAYOUT, que es contra el que resuelve `vw`, así que los seis niveles fluidos
 * devolvían el tamaño de otro ancho: `--text-fluido-titulo-xl` computaba
 * **40,94 px donde su piso declarado son 36**. `scripts-b4/b-tipografia.ts`
 * quedó parado por esto y su docblock lo dice.
 *
 * El culpable, medido elemento por elemento: el bloque de la cap height de
 * `Escala`, cuyo alfabeto es **una sola palabra sin espacios** —27 caracteres
 * en `--text-fluido-titulo-xl`— que no puede cortar en ningún lado y pide
 * **606 px** adentro de una caja de 311. Sumados los 32 de
 * `--pad-lateral-compacto`: 638, el número exacto que se leía.
 *
 * ⚠️ **La salida NO es acortar el alfabeto ni dejarlo cortar.** Las dos
 * arruinarían lo que ese bloque existe para mostrar: la comparación de
 * mayúsculas contra minúsculas necesita las 27 letras seguidas y a tamaño
 * completo. La salida es la que **la ruta madre ya usa** —`overflow-x: auto`
 * sobre el contenedor que lleva lo ancho—: el contenido no entra, y en vez de
 * empujar el viewport, scrollea adentro de su caja.
 *
 * ⚠️ **Y va en la RAÍZ, no en el bloque.** `overflow-x: auto` obliga a
 * `overflow-y` a `auto` también, así que la caja que lo lleve recorta la tinta
 * que se salga de su primer y último renglón —con `--leading-titulo` en 1,09 el
 * glifo asoma un par de píxeles fuera de la caja de línea—. La raíz ya tiene
 * `py-[var(--spacing-8)]` en las dos puntas: nada puede rozar el borde. Puesto
 * sobre el bloque del alfabeto, que no tiene padding vertical, sí podría.
 */
export const metadata: Metadata = {
  title: 'v3 · muestra tipográfica — instrumento interno',
  description: 'Los ocho niveles con texto real. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function PaginaMuestraTipografica() {
  return (
    <div className="bg-fondo text-tinta relative z-10 min-h-svh overflow-x-auto py-[var(--spacing-8)]">
      <Envoltorio>
        <div className="flex flex-col gap-[var(--spacing-12)]">
          <Escala />
          <Multiplicadores />
        </div>
      </Envoltorio>
    </div>
  )
}
