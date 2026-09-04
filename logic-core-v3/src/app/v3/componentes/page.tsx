import type { Metadata } from 'next'

import { CursorCompuerta } from '../_componentes/chrome/CursorCompuerta'
import { Navegacion } from '../_componentes/chrome/Navegacion'
import { Envoltorio } from '../_componentes/layout/Envoltorio'
import { Grilla } from '../_componentes/layout/Grilla'
import { Cuerpo, EtiquetaDeSeccion } from '../_componentes/tipografia/Textos'
import { Titular } from '../_componentes/tipografia/Titular'
import { CURSOR_MIN_ANCHO_PX } from '../_lib/cursor'

import { Estado, Ficha } from './_bloques/Ficha'
import { GaleriaCta } from './_bloques/GaleriaCta'
import { GaleriaLayout } from './_bloques/GaleriaLayout'
import { GaleriaMarca } from './_bloques/GaleriaMarca'
import { GaleriaMedios } from './_bloques/GaleriaMedios'
import { GaleriaNavegacion } from './_bloques/GaleriaNavegacion'
import { GaleriaPie } from './_bloques/GaleriaPie'

/**
 * ⚠️ INSTRUMENTO, NO PANTALLA. DEUDA CON FECHA DE BAJA.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ SE BORRA con `_bloques/` y con el atributo `data-forzado` de las hojas   │
 * │ de `_estilos/`, que existe sólo para esta ruta.                          │
 * │ Baja: el día que /v3 reemplace al home, y a más tardar el 2026-12-31.    │
 * │ `robots: noindex, nofollow`. No forma parte del sitio.                   │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * ── Para qué existe ───────────────────────────────────────────────────────
 *
 * Cada componente del sprint con todos sus estados, **incluido el foco por
 * teclado**. Los invariantes afirman que el foco existe y que el rollover
 * aplica los valores medidos; lo que ninguno puede decir es si se ve bien. Esa
 * parte la mira una persona, y esta ruta es donde la mira.
 *
 * Las piezas están montadas de verdad: la pastilla de navegación viaja con el
 * scroll y el cursor se monta arriba de 1025. No hay capturas ni maquetas.
 */
export const metadata: Metadata = {
  title: 'v3 · componentes — instrumento interno',
  description: 'Cada componente con sus estados. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function PaginaComponentes() {
  return (
    <div className="bg-fondo text-tinta relative z-10 min-h-svh pb-[var(--spacing-20)]">
      {/* Montados de verdad, no en una ficha: los dos dependen del viewport. */}
      <CursorCompuerta />
      <Navegacion />

      <div className="pt-[var(--spacing-12)]">
        <Envoltorio>
          <div className="flex flex-col gap-[var(--spacing-4)]">
            <EtiquetaDeSeccion>Instrumento interno · deuda con fecha de baja</EtiquetaDeSeccion>
            <Titular nivel="titulo-l" como="h1">
              Los componentes y sus estados
            </Titular>
            <Cuerpo className="max-w-[var(--breakpoint-medio)]">
              Cada ficha muestra la pieza viva primero y las copias con el estado congelado después.
              Lo congelado no reemplaza a lo real: si se separaran, se vería en la misma ficha.
              Recorré la página con Tab — en la referencia el foco no dispara nada y no hay ningún
              indicador visible.
            </Cuerpo>
          </div>
        </Envoltorio>
      </div>

      <div className="pt-[var(--spacing-12)]">
        <Envoltorio>
          <Grilla columnas={2} canal="conmutado">
            <GaleriaLayout />
            <GaleriaCta />
            <GaleriaMarca />
            <GaleriaNavegacion />
            <FichaDelCursor />
            <GaleriaMedios />
            <GaleriaPie />
          </Grilla>
        </Envoltorio>
      </div>
    </div>
  )
}

/**
 * El cursor no cabe en una ficha: es una capa fija que persigue al puntero.
 * Lo que la ficha puede decir es qué mirar y cuáles son las dos compuertas.
 */
function FichaDelCursor() {
  return (
    <Ficha
      titulo="Cursor de dos capas"
      nota={`Montado arriba de ${CURSOR_MIN_ANCHO_PX}px y sólo sin prefers-reduced-motion. Las dos compuertas son de montaje: abajo del umbral el chunk ni se descarga.`}
    >
      <Estado rotulo="qué mirar, con el puntero">
        <Cuerpo>
          El núcleo persigue al puntero y el halo va por detrás — son dos coeficientes distintos, y
          esa relación está medida. Sobre cualquier control las dos capas se apagan y queda el
          cursor nativo, que <strong>nunca se oculta</strong>: el propio se dibuja encima, no en su
          lugar.
        </Cuerpo>
      </Estado>
      <Estado rotulo="el color acompaña a la sección">
        <Cuerpo>
          Pasá el puntero sobre el pie invertido de la última ficha. El cursor copia el atributo de
          la sección y el bloque que ya trae el sistema le da vuelta la tinta y el borde. No hay un
          token nuevo ni una clase condicional.
        </Cuerpo>
      </Estado>
      <Estado rotulo="cómo comprobar las dos compuertas sin código">
        <Cuerpo>
          Angostá la ventana por debajo del umbral: el cursor desaparece del árbol, no se esconde.
          Activá la preferencia de menos movimiento en el sistema operativo: tampoco se monta.
        </Cuerpo>
      </Estado>
    </Ficha>
  )
}
