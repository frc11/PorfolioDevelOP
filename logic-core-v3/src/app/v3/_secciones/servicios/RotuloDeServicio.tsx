'use client'

import { cn } from '@/lib/utils'

import { Caption } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import {
  CLASES_DE_ACENTO,
  numeroDeServicio,
  numeroEnLaSecuencia,
  type Servicio,
} from '../_contrato/acento'
import { CONTENIDO, ROTULO_DE_LA_INTRO, TITULAR } from './contenido'
import { CLASE_DEL_RENGLON_DEL_NOMBRE, NIVEL_DEL_NOMBRE } from './geometria'

/**
 * EL RÓTULO — una anatomía, CUATRO instancias, y tres formas de emitirla.
 *
 * ── La anatomía, que ahora es la misma para los cuatro estados ────────────
 *
 *     rótulo        la categoría, arriba
 *     número        `00`–`03`, a la izquierda del nombre
 *     nombre        el título
 *     subrayado     la línea de abajo
 *
 * ⚠️ **El estado que abre el rodillo la comparte.** Antes «Nuestros servicios»
 * era un titular pelado y quedaba más arriba que los otros tres, con otra
 * silueta: se leía como un cartel y no como el primer estado de una secuencia.
 * Ahora lleva su `00`, su rótulo y su subrayado, y se apoya en la misma línea.
 *
 * Lo único que NO comparte es el color: su rótulo va en tinta media y su
 * subrayado en tinta, no en el acento de ningún servicio — todavía no hay
 * servicio del que hablar, y teñirlo con el acento del primero prometería algo
 * que el estado no dice.
 *
 * ── Las tres formas, y por qué hacen falta las tres ───────────────────────
 *
 * El rótulo tiene que estar en dos lugares a la vez sin anunciarse dos veces.
 * En la rama pinneada lo que se VE vive en el rodillo, a la izquierda, y lo que
 * se ANUNCIA vive adentro de su bloque de la tira, a la derecha — que es el
 * único orden que coincide con el de la rama apilada.
 *
 *   `encabezado`   el rótulo REAL: `<h3>` de verdad. Lo usa la rama apilada,
 *                  donde se ve y se anuncia.
 *   `decorativo`   la copia VISUAL del rodillo: mismos niveles tipográficos,
 *                  mismas clases, pero en `<span>`. Vive bajo un contenedor
 *                  `aria-hidden`, así que no aporta una palabra a lo anunciado.
 *   `RotuloAnunciado`  la copia ACCESIBLE de la tira: `sr-only`, rótulo y
 *                  nombre y NADA más.
 *
 * ── ⚠️ Por qué `decorativo` usa `<span>` y no `<h3>` ──────────────────────
 *
 * Porque `encabezados()` (`s10-lectura.ts:97-99`) filtra **por etiqueta**, no
 * por visibilidad: un `<h3>` adentro de un `aria-hidden` seguiría entrando al
 * árbol y `s10-acceso` §4 afirma que ningún encabezado sale del árbol por
 * `aria-hidden`. Con `<span>` el árbol de encabezados de las dos ramas queda
 * idéntico —un `h2` y tres `h3`, en el mismo orden— sin tocar una afirmación.
 *
 * ── ⚠️ Y por qué `RotuloAnunciado` NO lleva el subrayado ni el número ──────
 *
 * Porque el `sr-only` de la columna derecha está ACOTADO a propósito: envuelve
 * el rótulo y el nombre, y nada más. Nunca un párrafo, un medio, un caso ni un
 * bloque entero. Ésa es la puerta por la que el modelo de capas volvió tres
 * veces —apagar contenido con `sr-only` hasta que la sección entera es un
 * intercambio— y queda cerrada con una afirmación de `s6-servicios`, no con una
 * intención. El número y el subrayado van `aria-hidden` donde se ven, así que no
 * anunciarlos acá no pierde nada: lo anunciado sigue siendo rótulo + nombre,
 * que es carácter por carácter lo que anuncia la rama apilada.
 */

/**
 * La línea de abajo del bloque, y **la única `y` fija de los cuatro estados**.
 *
 * El bloque se apoya ABAJO de su ranura (`CLASE_DE_LA_RANURA`), así que esta
 * regla cae siempre en el mismo lugar y el título crece hacia arriba desde acá.
 *
 * Va como RELLENO —`bg-*`— y no como borde ni como texto: es la única forma del
 * acento que funciona en las dos superficies, y sobre la invertida un borde de
 * acento no llega ni a 3:1. `aria-hidden` porque es una regla decorativa: no
 * dice nada que el nombre de arriba no diga.
 */
function ReglaDeAcento({ clase }: { readonly clase: string }): React.JSX.Element {
  return <span aria-hidden="true" className={`${clase} block h-[var(--foco-grosor)] w-full`} />
}

interface PiezasDelRotulo {
  readonly numero: string
  readonly rubro: string
  readonly nombre: string
  /** El color del rótulo: el acento de un servicio, o tinta media en la intro. */
  readonly claseDelRubro: string
  /** El relleno del subrayado: el acento, o tinta plena en la intro. */
  readonly claseDeLaRegla: string
}

function BloqueDeRotulo({
  piezas,
  decorativo,
}: {
  readonly piezas: PiezasDelRotulo
  readonly decorativo: boolean
}): React.JSX.Element {
  return (
    <div data-fila="rotulo" className="flex flex-col gap-[var(--spacing-3)]">
      {/* El color va DIRECTO en el componente de texto: SITIO-S7 arregló `cn()`
          en `src/lib/utils.ts` y el envoltorio que protegía el tamaño se fue. */}
      <Caption como={decorativo ? 'span' : 'p'} className={cn(piezas.claseDelRubro, 'uppercase')}>
        {piezas.rubro}
      </Caption>
      {/* El número reemplazó a la barra `/`. Sale del mismo formateador para los
          cuatro estados, así que el `00` y los tres `0N` no se pueden desviar.
          Va `aria-hidden`: el encabezado dice el nombre y nada más. */}
      <div className="flex items-baseline gap-[var(--spacing-3)]">
        <span aria-hidden="true" className="text-tinta-tenue">
          {piezas.numero}
        </span>
        <Titular
          nivel={NIVEL_DEL_NOMBRE}
          como={decorativo ? 'span' : 'h3'}
          className={CLASE_DEL_RENGLON_DEL_NOMBRE}
        >
          {piezas.nombre}
        </Titular>
      </div>
      <ReglaDeAcento clase={piezas.claseDeLaRegla} />
    </div>
  )
}

export interface RotuloDeServicioProps {
  readonly servicio: Servicio
  /** La copia visual del rodillo: mismas clases, sin encabezado. */
  readonly decorativo?: boolean
}

export function RotuloDeServicio({
  servicio,
  decorativo = false,
}: RotuloDeServicioProps): React.JSX.Element {
  return (
    <BloqueDeRotulo
      decorativo={decorativo}
      piezas={{
        numero: numeroDeServicio(servicio.id),
        rubro: CONTENIDO[servicio.id].rubro,
        nombre: servicio.nombre,
        claseDelRubro: CLASES_DE_ACENTO.texto,
        claseDeLaRegla: CLASES_DE_ACENTO.relleno,
      }}
    />
  )
}

/**
 * EL ESTADO QUE ABRE EL RODILLO — la sección, con la anatomía de un servicio.
 *
 * Siempre decorativo: el `h2` real de la sección vive `sr-only` arriba del
 * panel, porque el rodillo entero es `aria-hidden`.
 */
export function RotuloDeLaIntro(): React.JSX.Element {
  return (
    <BloqueDeRotulo
      decorativo
      piezas={{
        numero: numeroEnLaSecuencia(0),
        rubro: ROTULO_DE_LA_INTRO,
        nombre: TITULAR,
        claseDelRubro: 'text-tinta-media',
        claseDeLaRegla: 'bg-tinta',
      }}
    />
  )
}

/**
 * LA COPIA ACOTADA que la tira anuncia. Rótulo y nombre, nada más.
 *
 * `sr-only` y no `aria-hidden` invertido: es la única forma que esconde de la
 * pantalla sin sacar del árbol de accesibilidad — `geometria.ts` ya enumeró las
 * cinco que no sirven y por qué.
 */
export function RotuloAnunciado({ servicio }: { readonly servicio: Servicio }): React.JSX.Element {
  return (
    <div data-rotulo="anunciado" className="sr-only">
      <Caption como="p">{CONTENIDO[servicio.id].rubro}</Caption>
      <Titular nivel={NIVEL_DEL_NOMBRE} como="h3">
        {servicio.nombre}
      </Titular>
    </div>
  )
}
