'use client'

import dynamic from 'next/dynamic'

import { CONSULTA_ESCENARIO, ESCENARIO_MIN_ANCHO_PX } from '../../_lib/compuerta'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'

/**
 * LA COMPUERTA DE 1025, PARA LA COREOGRAFÍA.
 *
 * ── Reusa el mecanismo de S1, no construye otro ────────────────────────────
 *
 * El umbral, la consulta de media query y el hook son LOS MISMOS que usa el
 * escenario: `ESCENARIO_MIN_ANCHO_PX`, `CONSULTA_ESCENARIO` y `useAnchoMinimo`,
 * importados de `_lib/`. Si alguien mueve el umbral, se mueven las dos cosas a la
 * vez, que es exactamente la propiedad que hace que sea UNA compuerta y no dos.
 *
 * Lo único propio es el módulo perezoso —la coreografía en vez del escenario— y
 * su marca, porque son dos chunks distintos y hay que poder pesarlos por
 * separado.
 *
 * ── Por qué `ssr: false` no es opcional ────────────────────────────────────
 *
 * Igual que en S1: el ancho no existe en el servidor, y con `ssr: false` webpack
 * emite el módulo en un chunk asíncrono aparte. Con un import estático la
 * coreografía entera —los nueve patrones, el divisor de líneas y el motor de
 * progreso— viajaría en la carga inicial en TODOS los anchos, mobile incluido, y
 * la compuerta sería decorativa. Eso no es una afirmación de confianza: la ruta
 * gemela `/v3/motion/control-estatico` hace exactamente el import estático y
 * `motion-bundle.invariant.ts` comprueba que ahí la marca SÍ aparece.
 *
 * ── Qué se ve abajo del umbral ─────────────────────────────────────────────
 *
 * Un texto que explica qué falta y por qué. No es un placeholder decorativo: sin
 * él la ruta quedaría en blanco, y una pantalla en blanco no distingue "la
 * compuerta funciona" de "esto está roto". Es DOM plano, sin una sola importación
 * del sistema de motion — si importara algo, la marca viajaría con él.
 */

const Coreografia = dynamic(() => import('./Coreografia'), { ssr: false })

function AbajoDelUmbral(): React.JSX.Element {
  return (
    <div className="bg-fondo min-h-svh px-[var(--pad-lateral-compacto)] py-20">
      <div className="max-w-tope mx-auto flex flex-col gap-4">
        <p className="font-codigo text-micro tracking-micro text-tinta-media uppercase">
          abajo de {ESCENARIO_MIN_ANCHO_PX} px
        </p>
        <h1 className="font-titulo text-titulo-m leading-titulo tracking-titulo">
          La coreografía no se descarga acá
        </h1>
        <p className="font-cuerpo text-cuerpo leading-texto tracking-texto">
          No está escondida con CSS: el módulo no se importa, así que el navegador nunca pide su
          chunk. Es la misma compuerta que gobierna el escenario, y es de ancho, no de táctil: un
          escritorio con pantalla táctil queda arriba del umbral. Para ver los nueve patrones,
          ensanchá la ventana a {ESCENARIO_MIN_ANCHO_PX} px o más.
        </p>
      </div>
    </div>
  )
}

export function CompuertaDeMotion(): React.JSX.Element {
  const arribaDelUmbral = useAnchoMinimo(CONSULTA_ESCENARIO)

  if (!arribaDelUmbral) return <AbajoDelUmbral />

  return <Coreografia />
}
