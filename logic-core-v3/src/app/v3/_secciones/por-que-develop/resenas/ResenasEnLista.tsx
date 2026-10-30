'use client'

import { useRef, type RefObject } from 'react'

import { cn } from '@/lib/utils'

import { AvisoDeScroll } from '../../../_componentes/avisos/AvisoDeScroll'
import { CtaEnlace } from '../../../_componentes/chrome/Cta'
import { Titular } from '../../../_componentes/tipografia/Titular'
import { useTramoDelBloque } from '../../../_lib/escena/useTramoDelBloque'
import { MEZCLA_SOBRE_LA_ESCENA } from '../../../_lib/superficies'
import { usePrefiereMenosMovimiento } from '../../../_lib/usePrefiereMenosMovimiento'
import { RESENAS, TEXTO_DE_LAS_RESENAS, TITULO_DE_LAS_RESENAS, enlaceDelTrabajo, type Resena } from './contenido'
import { estadoDelAviso, type EstadoDelAviso } from './deriva'
import { ResenasParaElLector } from './ResenasParaElLector'
import { CaraDeLaResena } from './TarjetaDeResena'
import { useDerivaDelCarrusel } from './useDerivaDelCarrusel'

/**
 * [NOCTURNO B2] LAS RESEÑAS EN LA LISTA — abajo de 1024 y con movimiento reducido en cualquier ancho (la rama sin escenario): el título y un
 * carrusel PLANO del DOM. [C2-70t] Sin flechas y continuo: se corre solo, despacio, en bucle (`deriva.ts`, `useDerivaDelCarrusel.ts`), y
 * se desliza con el dedo, la rueda horizontal o el trackpad (el scroll nativo de la pista: la deriva sigue desde donde lo dejan). Abajo, el
 * aviso «Deslizá para ver más» (el `AvisoDeScroll` de costado): aparece con el carrusel en pantalla y se va con el primer deslizamiento.
 * Con movimiento reducido no deriva (una sola copia, con encaje) y se desliza a mano. En el teléfono y la tablet, una tarjeta de frente
 * (las vecinas asoman); desde 1024 (movimiento reducido), tres.
 *
 * Cada tarjeta es sólida (el papel, opaco) con su retrato, y debajo su botón «Ver trabajo →» (el `CtaEnlace` de línea del sitio) al
 * trabajo en el Portfolio (el deep link de B1), sólo si la reseña tiene uno: un enlace real (el dedo, el mouse, abrir en otra pestaña),
 * fuera del lector y del teclado. DECISIÓN: la parada del teclado de cada reseña sigue siendo el enlace de `ResenasParaElLector` (con el
 * foco aparece como la pastilla de la barra, el foco visible): las dos ramas anuncian exactamente lo mismo (s10) y cada reseña tiene una
 * sola parada; el botón a la vista en el teclado la duplicaría. Lo que se ve (las tarjetas, sus botones y la copia del bucle) va `aria-hidden`.
 *
 * REGLA DE ALTURAS: abajo de 1024 la sección mide su contenido y este bloque la alarga: se anota como tramo (la escena no lo ve). Desde 1024
 * la sección mide su escenario entero (el alto mínimo) y el bloque no la alarga: no se anota. Quién decide es el CSS (la variable
 * `--resenas-alargan`, 1 abajo de 1024 y 0 desde ahí), no una consulta de JS.
 */
export function ResenasEnLista(): React.JSX.Element {
  const bloque = useRef<HTMLDivElement>(null)
  const pista = useRef<HTMLUListElement>(null)
  const quieto = usePrefiereMenosMovimiento()
  const { enPantalla, deslizado } = useDerivaDelCarrusel(pista, quieto)
  // [L5] El tramo que la escena no ve, con el hook compartido (`useTramoDelBloque`, el FAQ del teléfono también lo usa).
  useTramoDelBloque(bloque, alargaLaSeccion)

  return (
    <div ref={bloque} data-pieza="resenas-en-lista" className="flex flex-col gap-[var(--spacing-8)] [--resenas-alargan:1] escritorio:[--resenas-alargan:0]">
      <ResenasParaElLector />
      <div aria-hidden="true">
        <Titular nivel="titulo-xl" como="p" className={MEZCLA_SOBRE_LA_ESCENA}>
          {`${TITULO_DE_LAS_RESENAS.izquierda} ${TITULO_DE_LAS_RESENAS.derecha}`}
        </Titular>
      </div>
      <PistaDeLasResenas pista={pista} quieto={quieto} />
      <AvisoDelCarrusel estado={estadoDelAviso(enPantalla, deslizado)} />
    </div>
  )
}

/** Quién decide si el bloque alarga la sección es el CSS (`--resenas-alargan`), no una consulta de JS. */
const alargaLaSeccion = (el: HTMLElement): boolean => getComputedStyle(el).getPropertyValue('--resenas-alargan').trim() === '1'

/** La pista: las reseñas y, si deriva, su copia (el bucle sin costura). Sin encaje si deriva: volvería cada paso a la tarjeta más cercana. */
export function PistaDeLasResenas({ pista, quieto, resenas = RESENAS }: { readonly pista?: RefObject<HTMLUListElement | null>; readonly quieto: boolean; readonly resenas?: readonly Resena[] }): React.JSX.Element {
  return (
    // [L5] Abajo de 1024, a sangre: la pista llega a los bordes de la pantalla (las tarjetas entran por la derecha y salen por la izquierda
    // enteras, sin el corte del relleno lateral: lote2/13); el mismo relleno va adentro, así la primera arranca alineada con el título.
    <div aria-hidden="true" className="w-full @container max-escritorio:-mx-[var(--pad-lateral-compacto)] max-escritorio:w-[calc(100%+var(--pad-lateral-compacto)*2)]">
      <ul ref={pista} data-parte="pista" data-deriva={quieto ? 'quieta' : 'viva'} className={cn('flex gap-[var(--spacing-6)] overflow-x-auto overscroll-x-contain pb-[var(--spacing-3)] max-escritorio:px-[var(--pad-lateral-compacto)] max-escritorio:scroll-px-[var(--pad-lateral-compacto)]', quieto && 'snap-x snap-mandatory')}>
        {resenas.map((r) => (
          <TarjetaDeLaLista key={r.clave} resena={r} copia={false} />
        ))}
        {!quieto && resenas.map((r) => <TarjetaDeLaLista key={`copia-${r.clave}`} resena={r} copia />)}
      </ul>
    </div>
  )
}

/** Una tarjeta: la cara (opaca, con su retrato) y su botón al trabajo, si lo hay (del dedo y del puntero: el teclado va por el lector). */
function TarjetaDeLaLista({ resena, copia }: { readonly resena: Resena; readonly copia: boolean }): React.JSX.Element {
  const enlace = enlaceDelTrabajo(resena)
  return (
    <li
      data-pieza="resena-en-lista"
      {...(copia ? { 'data-copia': '' } : {})}
      className="flex shrink-0 snap-center flex-col items-start [--ancho-de-la-tarjeta:min(86cqw,calc(var(--spacing-20)*5))] escritorio:[--ancho-de-la-tarjeta:calc((100cqw-2*var(--spacing-6))/3)]"
    >
      <div className="block h-[calc(var(--ancho-de-la-tarjeta)*0.682)] w-[var(--ancho-de-la-tarjeta)] rounded-[calc(var(--ancho-de-la-tarjeta)*0.073)] shadow-flotante">
        <CaraDeLaResena resena={resena} />
      </div>
      {enlace !== undefined && (
        <CtaEnlace
          href={enlace}
          rotulo={TEXTO_DE_LAS_RESENAS.verTrabajo}
          etiqueta={TEXTO_DE_LAS_RESENAS.enlaceDelLector(resena.nombre, resena.negocio)}
          fueraDelTeclado
          mezcla
          className={cn('-ml-[var(--spacing-2)]', MEZCLA_SOBRE_LA_ESCENA)}
        />
      )}
    </li>
  )
}

/** El aviso, de costado y sobre la escena. Ocupa su lugar siempre (aparecer o irse no cambia el alto del bloque): sólo se desvanece. */
function AvisoDelCarrusel({ estado }: { readonly estado: EstadoDelAviso }): React.JSX.Element {
  return (
    <div data-parte="aviso-del-carrusel" data-estado={estado} className={cn('transition-opacity duration-media ease-salida motion-reduce:transition-none', estado === 'visible' ? 'opacity-100' : 'opacity-0')}>
      <AvisoDeScroll texto={TEXTO_DE_LAS_RESENAS.deslizar} tono="escena" direccion="costado" />
    </div>
  )
}
