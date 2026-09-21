import { afirmar, afirmarIgual } from './afirmar'
import { nodosDe, type Nodo } from './s10-recorrido'
import { clasesEfectivas } from './s10-css'

/**
 * EL DETECTOR DE CONTEXTOS DE APILAMIENTO Y EL RECORRIDO DE LA CADENA.
 *
 * Salió de `s7-mezcla.invariant.ts` cuando ese archivo pasó las 300 líneas de
 * código, y el corte es por TEMA: acá está la HERRAMIENTA —qué clase abre un
 * contexto de apilamiento y cuál no— y allá lo que se AFIRMA con ella. La
 * herramienta no sabe qué cadena se está midiendo; el invariante no sabe cómo
 * se decide si una clase apila.
 *
 * Son dos piezas del mismo tema y por eso viven juntas: **qué clase apila** y
 * **cómo se recorre la cadena de ancestros hasta `[data-v3]` para preguntárselo
 * a cada eslabón**. La segunda no sirve sin la primera.
 *
 * ⚠️ **La puerta no se movió.** `s7-mezcla.invariant.ts` re-exporta
 * `abrenContexto`, así que cualquier instrumento que ya lo importaba de allá
 * sigue funcionando sin tocar una línea. Y sus ocho afirmaciones y sus cuatro
 * controles positivos se quedaron allá: la herramienta se mudó, su prueba no.
 */

/**
 * ⚠️ **ES EL GEMELO EN CLASES DEL DETECTOR DE PROPIEDADES COMPUTADAS.**
 *
 * `scripts-blend/a-cadena.ts` tiene el detector que lee `getComputedStyle` —CSS
 * Positioned Layout §9 más CSS Compositing §5.1— y es el que decide de verdad.
 * Acá no hay navegador, así que se pregunta lo mismo sobre la clase de Tailwind
 * que emitiría cada propiedad. Las dos listas dicen lo mismo y ninguna es la
 * copia de la otra: ésta se afirma con sus controles positivos, y el banco
 * confirma en el navegador lo que ésta deriva del marcado.
 *
 * ⚠️ `z-*` NO abre contexto por sí solo: hace falta que el elemento esté
 * posicionado. Por eso la regla es de PAR y no de clase suelta — si no, `z-10`
 * sobre un elemento estático daría un corte inventado. `fixed` y `sticky` sí
 * abren solos.
 *
 * ⚠️ **Y GANA LA ÚLTIMA, SIN ESO EL DETECTOR MIENTE.** `clasesEfectivas`
 * devuelve las clases activas al ancho **conservando el orden**, y su propio
 * docblock dice por que: quien las lee se queda con la ultima que coincide, que
 * es lo que hace la cascada. Una seccion lleva `z-10 max-escritorio:z-auto`, o
 * sea que a 768 la lista trae LAS DOS — y un detector que no resuelva el grupo
 * reporta un corte que no existe. Paso: la primera version de este archivo dio
 * tres cortes falsos contra un arbol que el navegador ya media sin ninguno.
 *
 * Por eso las propiedades con neutro se resuelven por GRUPO (la ultima gana) y
 * solo las que no tienen neutro escrito en este arbol se marcan por presencia.
 */
interface Grupo {
  readonly nombre: string
  readonly re: RegExp
  /** El valor que NO abre contexto. */
  readonly neutro: string
  /** Si ademas hace falta que el elemento este posicionado. */
  readonly pidePosicion?: boolean
}

const GRUPOS: readonly Grupo[] = [
  { nombre: 'z-index', re: /^-?z-/, neutro: 'z-auto', pidePosicion: true },
  { nombre: 'opacity', re: /^opacity-/, neutro: 'opacity-100' },
  { nombre: 'mix-blend', re: /^mix-blend-/, neutro: 'mix-blend-normal' },
  { nombre: 'isolation', re: /^(isolate|isolation-auto)$/, neutro: 'isolation-auto' },
  { nombre: 'will-change', re: /^will-change-/, neutro: 'will-change-auto' },
  { nombre: 'transform', re: /^transform(-none)?$/, neutro: 'transform-none' },
  { nombre: 'filter', re: /^filter(-none)?$/, neutro: 'filter-none' },
]

/** La posicion efectiva: `fixed` y `sticky` abren contexto por si solos. */
const POSICION = /^(static|relative|absolute|fixed|sticky)$/

/** Lo que no tiene neutro escrito en este arbol: cualquier aparicion cuenta. */
const SUELTAS: readonly RegExp[] = [
  /^backdrop-/,
  /^mask-/,
  /^\[mask-image:/,
  /^\[clip-path:/,
  /^(blur|grayscale|invert|sepia)(-|$)/,
  /^(drop-shadow|saturate|contrast|brightness|hue-rotate)-/,
  /^-?(translate|rotate|scale|skew)(-|$)/,
  /^perspective(-|$)/,
  /^contain-(paint|layout|strict|content)$/,
]

/**
 * ⚠️ **UNA CLASE PLANTADA SE ESCRIBE PARTIDA, O TAILWIND LA EMITE — Y UNA DE
 * ELLAS ROMPE EL BUILD.**
 *
 * El escaner de fuentes de Tailwind 4 mira TODOS los archivos del proyecto que
 * `.gitignore` no excluye, y este invariante es uno. Las clases que los controles
 * positivos plantan como defecto no son clases de la pagina: si el escaner las ve,
 * las emite igual. La mascara arbitraria que planta el cuarto control emitio una
 * regla `mask-image` con una `url()` adentro, el `css-loader` salio a resolver
 * ese nombre como modulo y el build entero cayo con `Cannot find module`, con la
 * culpa puesta en `globals.css:4` — un archivo que no se toco. Es el mismo
 * sintoma que la leccion de agosto (`distDir` intruso) por otra puerta: **un
 * error de build que apunta a un archivo verificablemente sano es contaminacion
 * del escaneo, no del archivo.**
 *
 * ⚠️ Y el docblock cuenta: el escaner extrae candidatos del TEXTO del archivo,
 * comentarios incluidos. La primera correccion partio la cadena en el control y
 * dejo la clase deletreada aca arriba — habria vuelto a romper el build igual.
 * Por eso esta prosa la describe y no la escribe.
 *
 * Se parte la cadena, que es el truco que el repo ya usa y documenta en
 * `Seccion.tsx:208` («`${prefijo}sticky` no la ve el escaner de Tailwind, la
 * regla no se emite»). El valor en tiempo de corrida es identico.
 */
export const plantada = (...partes: readonly string[]): string => partes.join('')

const ultima = (clases: readonly string[], re: RegExp): string | undefined =>
  [...clases].reverse().find((c) => re.test(c))

/** Las clases de una lista ya resuelta al ancho que abren un contexto de apilamiento. */
export function abrenContexto(clases: readonly string[]): string[] {
  const posicion = ultima(clases, POSICION)
  const posicionado = posicion !== undefined && posicion !== 'static'
  const culpables: string[] = []
  if (posicion === 'fixed' || posicion === 'sticky') culpables.push(posicion)
  for (const g of GRUPOS) {
    const efectiva = ultima(clases, g.re)
    if (efectiva === undefined || efectiva === g.neutro) continue
    if (g.pidePosicion === true && !posicionado) continue
    culpables.push(efectiva)
  }
  for (const c of clases) if (SUELTAS.some((re) => re.test(c))) culpables.push(c)
  return culpables
}

export function claseDe(n: Nodo): string {
  const m = /class="([^"]*)"/.exec(n.atributos)
  return m === null ? '' : m[1]
}

/** Los ancestros de un nodo, del más cercano a la raíz del render, por profundidad. */
export function cadenaDe(nodos: readonly Nodo[], objetivo: Nodo): Nodo[] {
  const cadena: Nodo[] = []
  let buscada = objetivo.profundidad - 1
  for (let i = objetivo.indice - 1; i >= 0 && buscada >= 0; i -= 1) {
    if (nodos[i].profundidad === buscada) {
      cadena.push(nodos[i])
      buscada -= 1
    }
  }
  return cadena
}

export interface Eslabon {
  readonly quien: string
  readonly clases: string
}

/**
 * LA CADENA COMPLETA DE UNA PIEZA: los ancestros que el render de su sección
 * trae, más los tres de afuera que viven en `Panel.tsx`, `page.tsx` y
 * `layout.tsx`. El último no entra en la lista porque es el GRUPO y se afirma
 * aparte: tiene que abrir contexto, no dejar de abrirlo.
 */
/**
 * ⚠️ **LA COLA VIENE POR PARÁMETRO Y NO SE LEE ACÁ.** Los dos últimos eslabones
 * —el `<section data-panel>` y el `<main>`— viven afuera del marcado de la
 * sección, así que quien llama los lee de su fuente y los pasa. Era lo único que
 * ataba esta herramienta a UN árbol concreto; sin eso sirve para cualquier
 * cadena, que es lo que la vuelve una herramienta y no un trozo de invariante.
 */
export function cadenaCompleta(
  html: string,
  etiqueta: string,
  buscar: (n: Nodo, clases: string) => boolean,
  cola: readonly Eslabon[],
): readonly Eslabon[] {
  const nodos = nodosDe(html)
  const pieza = nodos.find((n) => buscar(n, claseDe(n)))
  afirmar(pieza !== undefined, `${etiqueta} está en el marcado y lleva el blend`)
  if (pieza === undefined) throw new Error(`sin ${etiqueta} no hay cadena que verificar`)
  const dentro = cadenaDe(nodos, pieza).map(claseDe)
  afirmar(dentro.length > 0, `  y tiene ${dentro.length} ancestros adentro de la sección`)
  return [...dentro.map((clases, i) => ({ quien: `${etiqueta} · ancestro ${i + 1}`, clases })), ...cola]
}

export function afirmarQueLaCadenaLlega(cadena: readonly Eslabon[], etiqueta: string, anchos: readonly number[]): void {
  for (const ancho of anchos) {
    const culpables = cadena.flatMap((a) => abrenContexto(clasesEfectivas(a.clases, ancho)).map((c) => `${a.quien}: ${c}`))
    afirmarIgual(culpables, [], `a ${ancho} ningún ancestro de ${etiqueta} abre contexto de apilamiento`)
  }
}
