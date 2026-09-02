/**
 * EL BANCO DE MEDICIÓN COMPARTIDO DE SITIO-S10 — el home entero, renderizado en
 * las dos ramas, y los anchos de referencia con su razón.
 *
 * ⚠ **LO ESCRIBE EL AGENTE PRINCIPAL EN LA FASE 0, ANTES DE DESPACHAR NADA.**
 * Es la misma forma que SITIO-S9 usó con `anclaje.ts`: lo que los frentes
 * COMPARTEN se escribe una vez, arriba, para que ninguno lo decida por su
 * cuenta. Acá lo compartido es la unidad de medida —qué se renderiza, a qué
 * anchos, y cómo se lee lo que sale— y si cada frente la escribiera, cuatro
 * tablas del mismo sprint dejarían de ser comparables entre sí.
 *
 * ── ⚠ ESTO ES CÁLCULO ESTÁTICO. NO ES UN NAVEGADOR ────────────────────────
 *
 * Regla 10 del sprint, y es la que este archivo existe para hacer cumplible.
 * `renderToStaticMarkup` produce **el marcado que el servidor manda**: no corre
 * un efecto, no aplica una hoja de estilos, no hace layout y no pinta un píxel.
 * Todo lo que salga de acá es un MODELO, y toda cifra derivada de él se publica
 * declarándolo. Los huecos que ningún cálculo estático puede llenar están
 * enumerados abajo en `HUECOS`, con nombre — no se estiman.
 *
 * ── Las dos ramas, y por qué son exactamente dos ───────────────────────────
 *
 * `_secciones/_invariantes/render.tsx` ya las define y no se duplica acá: la
 * rama la decide si las primitivas animadas están instaladas, que es lo mismo
 * que la decide en producción (`CompuertaDelHome`). **La rama quieta es la que
 * se sirve abajo de 1025 Y la que se sirve con `prefers-reduced-motion`**, así
 * que las dos preguntas del sprint —mobile y movimiento reducido— se responden
 * sobre el mismo marcado, con el supuesto declarado.
 *
 * ── Qué compone el documento ───────────────────────────────────────────────
 *
 * `page.tsx` monta tres cosas y el layout pone dos envoltorios:
 *
 *     <div data-v3>          ← `v3/layout.tsx`
 *       <EscenarioCompuerta/>  → `null` en el servidor (`ssr: false`)
 *       <main>                 ← `v3/layout.tsx`
 *         <ChromeDelHome/>     ← la pastilla, primero POR GEOMETRÍA
 *         <IntroDelHome/>      ← el overlay del preloader
 *         <CompuertaDelHome>   ← lo que `marcar()` modela
 *           <Home/>            ← las ocho, recorriendo el registro
 *
 * Los envoltorios del layout **no se escriben acá: se derivan del fuente**
 * (`envoltorioDelLayout` y `s10-esqueleto.ts`). Escribirlos a mano sería una
 * segunda fuente de la estructura del documento, que es exactamente lo que este
 * repo viene sacando.
 *
 * ⚠ **Y DESDE SITIO-S12 SE DERIVA EL ESQUELETO ENTERO, NO SÓLO LOS DOS
 * ENVOLTORIOS.** El modelo viejo componía *«raíz + main + página + los dos
 * cierres»*, o sea **todo adentro del `<main>`**: nada emitido afuera existía
 * para él. Con ese modelo, sacar el pie o la pastilla del `<main>` —que es el
 * arreglo de los defectos 6 y 15 de §7.39— **bajaba** las cifras por ceguera y
 * no por regresión, y un instrumento que penaliza el arreglo correcto no puede
 * quedar de árbitro. El porqué completo está en §7.43 y el patch en
 * `s10-esqueleto.ts`.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createElement } from 'react'

import { SaltarAlContenido } from '../../_chrome/SaltarAlContenido'
import { Navegacion } from '../../_componentes/chrome/Navegacion'
import { marcar } from '../../_secciones/_invariantes/render'
import { RAIZ } from './s5-archivos'
import {
  componentesDelEsqueleto,
  esqueletoDelLayout,
  etiquetasFueraDelMain,
  type PiezaDelLayout,
} from './s10-esqueleto'
import { aperturaDeJsx } from './s10-jsx'

/**
 * La tabla de referencia se re-exporta desde acá: **el banco es UNA puerta**.
 * Los frentes importan `s10-banco` y no tienen que saber en cuál de los dos
 * archivos quedó cada cosa después de una partición.
 */
export * from './s10-referencias'

import { type Rama } from './s10-referencias'

/**
 * El RENDER de la página se re-exporta desde acá por la misma razón: el banco es
 * UNA puerta. `marcadoDelHome`, `marcadoDeSeccion`, los dos de movimiento
 * reducido y la caché viven en `s10-marcado.ts` desde SITIO-S12.
 */
export * from './s10-marcado'

import { conCache, marcadoDelHome } from './s10-marcado'

export interface EnvoltorioDelLayout {
  /** La etiqueta de apertura de la raíz, ya normalizada a HTML. `''` si no está. */
  readonly raiz: string
  /** La del `<main>`. `''` si el layout no tiene ninguno — que sería el hallazgo. */
  readonly main: string
  /**
   * La del `<header>`. `''` si el layout no tiene ninguno, que es lo que da
   * HOY: el defecto 15 de §7.39 es justamente que no hay `banner`.
   */
  readonly cabecera: string
  /**
   * La del `<footer>`. `''` si el layout no tiene ninguno, que es lo que da
   * HOY: el defecto 6 de §7.39 es justamente que no hay `contentinfo`.
   */
  readonly pie: string
}

const RUTA_DEL_LAYOUT = 'src/app/v3/layout.tsx'

/**
 * Los dos envoltorios que `v3/layout.tsx` pone alrededor de la página,
 * **derivados del fuente y no escritos acá**.
 *
 * El layout no se puede renderizar desde un instrumento: importa
 * `next/font/local`, que sólo existe adentro del pipeline de Next. Así que se
 * deriva del JSX la etiqueta con sus atributos, que es lo que decide si el
 * documento tiene un landmark `<main>` y quién lo pone. Devuelve la cadena
 * vacía si no está — **nunca inventa una**, que es lo que haría de esto un
 * instrumento inútil para la pregunta que contesta.
 *
 * ⚠ **La simplificación declarada:** el `className` de la raíz es un literal de
 * plantilla con las dos variables de `next/font`, y esos nombres los genera el
 * build. Se conservan las clases literales y se descartan las interpolaciones,
 * porque ninguna clase de fuente cambia una caja ni un landmark.
 */
export function envoltorioDelLayout(fuente = leerLayout()): EnvoltorioDelLayout {
  return {
    raiz: aperturaDeJsx(fuente, 'div'),
    main: aperturaDeJsx(fuente, 'main'),
    cabecera: aperturaDeJsx(fuente, 'header'),
    pie: aperturaDeJsx(fuente, 'footer'),
  }
}

export function leerLayout(): string {
  return readFileSync(path.join(RAIZ, RUTA_DEL_LAYOUT), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
}

/**
 * LO QUE EL LAYOUT PUEDE MONTAR AFUERA DE LA PÁGINA, por nombre y con su razón.
 *
 * El esqueleto sale del fuente; **qué componente es cada nombre no puede salir
 * del fuente**, porque una cadena no se convierte en un módulo. Eso es lo único
 * que se declara acá, y se declara como CAPACIDAD: lo que el layout monta de
 * verdad lo decide el layout, y el modelo lo lee.
 *
 * `emite: null` significa **el servidor no emite un solo elemento**, con su
 * razón escrita — no «no lo sé renderizar». La diferencia importa: un cero
 * declarado y un cero por ignorancia se leen igual en una tabla, y ése es el
 * modo de falla que este banco existe para no repetir.
 *
 * ⚠ **Un nombre que no esté acá hace TIRAR al modelo, y es a propósito.** El
 * día que un frente monte una pieza nueva afuera del `<main>`, la corrida se
 * cae con el nombre adentro del mensaje y hay que agregar su línea. Saltearla
 * en silencio publicaría una cifra más baja que se lee como un resultado.
 */
export interface PiezaMontable {
  readonly emite: (() => React.ReactNode) | null
  readonly porQue: string
}

export const PIEZAS_MONTABLES: ReadonlyMap<string, PiezaMontable> = new Map<string, PiezaMontable>([
  [
    'EscenarioCompuerta',
    {
      emite: null,
      porQue:
        '`ssr: false`: el servidor devuelve `null` y la escena no aporta un elemento al documento — es el segundo supuesto declarado del banco',
    },
  ],
  [
    'Navegacion',
    {
      emite: () => createElement(Navegacion, {}),
      porQue:
        'la pastilla. Desde SITIO-S12 la monta la PÁGINA afuera del `<main>` (defecto 15); si algún día pasa al layout, el modelo la ve por acá sin cambiar una línea',
    },
  ],
  [
    'SaltarAlContenido',
    {
      emite: () => createElement(SaltarAlContenido),
      porQue: 'el enlace de salto, por la misma razón que la pastilla: viaja con ella',
    },
  ],
])

function emitirPiezas(piezas: readonly PiezaDelLayout[], rama: Rama): string {
  return piezas.map((pieza) => emitirPieza(pieza, rama)).join('')
}

function emitirPieza(pieza: PiezaDelLayout, rama: Rama): string {
  switch (pieza.clase) {
    case 'ranura':
      return marcadoDelHome(rama)
    case 'etiqueta':
      return pieza.autocerrada
        ? `${pieza.apertura}</${pieza.nombre}>`
        : `${pieza.apertura}${emitirPiezas(pieza.hijos, rama)}</${pieza.nombre}>`
    case 'componente': {
      const montable = PIEZAS_MONTABLES.get(pieza.nombre)
      if (montable === undefined) {
        throw new Error(
          `el layout monta <${pieza.nombre}> y el banco no sabe qué es: agregale su línea a PIEZAS_MONTABLES, con su razón`,
        )
      }
      if (pieza.hijos.length > 0) {
        throw new Error(
          `el layout le pasa hijos a <${pieza.nombre}>, y el modelo sólo sabe montar hojas: envolvelos en un componente propio`,
        )
      }
      const nodo = montable.emite
      return nodo === null ? '' : marcar(nodo(), { anima: rama === 'animada' })
    }
  }
}

/**
 * EL DOCUMENTO COMPLETO a partir de UN fuente de layout: el esqueleto que ese
 * layout declara, con la página adentro de su ranura.
 *
 * Toma el fuente por parámetro para que el invariante lo pueda correr contra
 * layouts fabricados y demostrar las dos mitades que hacen falta: que el modelo
 * VE un pie emitido fuera del `<main>`, y que NO lo cuenta cuando está adentro.
 * Sin eso, el patch no se puede usar como gate del arreglo.
 */
export function componerDocumento(fuente: string, rama: Rama): string {
  const esqueleto = esqueletoDelLayout(fuente)
  if (esqueleto === null) {
    throw new Error(`el layout no declara ningún elemento con \`data-v3\`: el banco no sabe dónde empieza el documento`)
  }
  return `${esqueleto.apertura}${emitirPiezas(esqueleto.hijos, rama)}</${esqueleto.nombre}>`
}

/**
 * EL DOCUMENTO COMPLETO: el home adentro del esqueleto que el layout declara.
 *
 * Es lo que hay que mirar para preguntar por landmarks y por orden de
 * tabulación, porque el `<main>` no lo pone la página. El esqueleto entra
 * derivado; el contenido, renderizado.
 */
export function marcadoDelDocumento(rama: Rama): string {
  return conCache(`documento:${rama}`, () => componerDocumento(leerLayout(), rama))
}

/** Los componentes que el layout monta HOY afuera de la página, en orden. */
export function componentesQueMontaElLayout(fuente = leerLayout()): string[] {
  const esqueleto = esqueletoDelLayout(fuente)
  return esqueleto === null ? [] : componentesDelEsqueleto(esqueleto.hijos)
}

/** Las etiquetas literales que el layout emite FUERA del `<main>`, en orden. */
export function etiquetasQueElLayoutEmiteFueraDelMain(fuente = leerLayout()): string[] {
  const esqueleto = esqueletoDelLayout(fuente)
  return esqueleto === null ? [] : etiquetasFueraDelMain(esqueleto.hijos)
}
