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
 * Los dos envoltorios del layout **no se escriben acá: se derivan del fuente**
 * (`envoltorioDelLayout`). Escribirlos a mano sería una segunda fuente de la
 * estructura del documento, que es exactamente lo que este repo viene sacando.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createElement, Fragment } from 'react'

import { ChromeDelHome } from '../../_chrome/ChromeDelHome'
import { REGISTRO } from '../../_secciones/_contrato/registro'
import { Home } from '../../_secciones/Home'
import { marcar } from '../../_secciones/_invariantes/render'
import { RAIZ } from './s5-archivos'

/**
 * La tabla de referencia se re-exporta desde acá: **el banco es UNA puerta**.
 * Los frentes importan `s10-banco` y no tienen que saber en cuál de los dos
 * archivos quedó cada cosa después de una partición.
 */
export * from './s10-referencias'

import { type Rama } from './s10-referencias'

// ── El marcado ──────────────────────────────────────────────────────────────

/** El árbol de la página: el chrome y las ocho, en el orden de `page.tsx`. */
const HOME = (): React.JSX.Element =>
  createElement(Fragment, null, createElement(ChromeDelHome), createElement(Home))


const cache = new Map<string, string>()

function conCache(clave: string, producir: () => string): string {
  const guardado = cache.get(clave)
  if (guardado !== undefined) return guardado
  const producido = producir()
  cache.set(clave, producido)
  return producido
}

/**
 * EL HOME ENTERO en una rama: el chrome y las ocho, en el orden de `page.tsx`.
 *
 * ⚠ **Sin el overlay del intro, y NO por una decisión de alcance: no se puede.**
 * `HomeIntro` consume `usePreloader`, que tira fuera de `PreloaderProvider`
 * —un contexto del sitio vivo, que este sprint tiene prohibido tocar—, así que
 * `renderToStaticMarkup` corta con *«usePreloader must be used within a
 * PreloaderProvider»*. Queda declarado como hueco (`HUECO_DEL_INTRO`) en vez de
 * omitido en silencio: lo que el overlay le agregue al orden de tabulación de la
 * primera visita **este sprint no lo mide**.
 */
export function marcadoDelHome(rama: Rama): string {
  return conCache(`home:${rama}`, () => marcar(HOME(), { anima: rama === 'animada' }))
}

/** Una sección sola, en una rama. Mismo componente que monta el home. */
export function marcadoDeSeccion(id: string, rama: Rama): string {
  return conCache(`seccion:${id}:${rama}`, () => {
    const entrada = REGISTRO.find((m) => m.id === id)
    if (entrada === undefined) throw new Error(`sección desconocida en el banco: ${id}`)
    return marcar(createElement(entrada.Componente, { seccion: entrada.seccion }), {
      anima: rama === 'animada',
    })
  })
}

/**
 * EL MARCADO QUE SE SIRVE CON `prefers-reduced-motion` PUESTA.
 *
 * ⚠ **ESTE HELPER ESTABA MAL Y LO ENCONTRÓ EL FRENTE DE ACCESIBILIDAD EN
 * SITIO-S10.** Forzaba `anima: true` con `MotionConfig reducedMotion="always"`,
 * y con eso devolvía **52 transformadas y 52 `will-change`**: un estado que
 * producción NUNCA sirve. La compuerta que apaga el movimiento no vive en
 * `MotionConfig` sino en `CompuertaDelHome`, que el banco no monta —
 * `deberiaAnimar(arribaDelUmbral, !politica.montaElMotorDeProgreso)` da `false`
 * con la preferencia puesta, en cualquier ancho, y ahí las primitivas animadas
 * ni siquiera se instalan.
 *
 * **Lo que producción sirve es el ÁRBOL QUIETO**, y eso es lo que devuelve esto
 * ahora. La preferencia se sigue forzando en el motor porque no cuesta nada y
 * cierra la otra mitad: si alguna primitiva quieta escribiera una transformada
 * por su cuenta, con la preferencia puesta tendría que dejar de hacerlo igual.
 *
 * Un helper que modela un estado que nadie sirve no es conservador: **es una
 * respuesta a otra pregunta**, y se lee igual de bien.
 */
export function marcadoConMovimientoReducido(): string {
  return conCache('home:reducido', () => marcar(HOME(), { anima: false, preferencia: 'always' }))
}

/**
 * EL CONTROL, y no se sirve nunca: el árbol animado CON la preferencia puesta.
 *
 * No existe en producción —la compuerta lo impide— y por eso está separado y
 * dicho. Sirve para una sola cosa: demostrar que un detector de transformadas
 * **no está ciego**. Un «cero transformadas» sobre el árbol quieto no prueba
 * nada si el detector tampoco las ve donde sí están.
 */
export function marcadoAnimadoConPreferenciaForzada(): string {
  return conCache('home:animado-con-preferencia', () =>
    marcar(HOME(), { anima: true, preferencia: 'always' }),
  )
}

export interface EnvoltorioDelLayout {
  /** La etiqueta de apertura de la raíz, ya normalizada a HTML. `''` si no está. */
  readonly raiz: string
  /** La del `<main>`. `''` si el layout no tiene ninguno — que sería el hallazgo. */
  readonly main: string
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
  }
}

/** La primera apertura de `etiqueta` en un JSX, pasada a HTML. `''` si no hay. */
function aperturaDeJsx(fuente: string, etiqueta: string): string {
  const m = new RegExp(`<${etiqueta}\\b([^>]*?)>`, 's').exec(fuente)
  if (m === null) return ''
  const atributos = m[1]
    // `className={\`a ${x} b\`}` → `class="a b"`; `className="a b"` → `class="a b"`.
    .replace(/className=\{`([^`]*)`\}/g, (_, cuerpo: string) => `class="${sinInterpolaciones(cuerpo)}"`)
    .replace(/className=/g, 'class=')
    .replace(/\s+/g, ' ')
    .trim()
  return atributos === '' ? `<${etiqueta}>` : `<${etiqueta} ${atributos}>`
}

function sinInterpolaciones(cuerpo: string): string {
  return cuerpo
    .replace(/\$\{[^}]*\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function leerLayout(): string {
  return readFileSync(path.join(RAIZ, RUTA_DEL_LAYOUT), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
}

/**
 * EL DOCUMENTO COMPLETO: el home adentro de los envoltorios del layout.
 *
 * Es lo que hay que mirar para preguntar por landmarks y por orden de
 * tabulación, porque el `<main>` no lo pone la página. Los dos envoltorios
 * entran derivados; el contenido, renderizado.
 */
export function marcadoDelDocumento(rama: Rama): string {
  return conCache(`documento:${rama}`, () => {
    const { raiz, main } = envoltorioDelLayout()
    return `${raiz}${main}${marcadoDelHome(rama)}</main></div>`
  })
}
