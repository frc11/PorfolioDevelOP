/**
 * B7 · FRENTE B — EL MOTOR DEL BARRIDO: SCROLL REAL, DE PUNTA A PUNTA.
 *
 * ── Por qué el barrido y no la geometría ──────────────────────────────────
 *
 * La geometría es exactamente lo que NO discrimina. `getBoundingClientRect()` en
 * una foto devuelve una caja; que esa caja esté en `top: 0` no dice si el
 * elemento **se quedó** ahí mientras la página subía o si sólo pasaba por ahí.
 * Peor: un `sticky` sin recorrido y un `sticky` roto dan la MISMA foto. Por eso
 * acá se mueve el scroll de verdad —`scrollA` espera dos `requestAnimationFrame`
 * después de cada `scrollTo`— y se leen todas las paradas.
 *
 * ── Y por qué el barrido grueso NO alcanza para publicar un rango ──────────
 *
 * Con un paso de 120 px, el borde de entrada del pin está en algún lugar de una
 * ventana de 120 px y el de salida también: un rango medido así puede errarle
 * por 240 px, que a 1920 es el 11 % del pin. El barrido grueso dice **si** se
 * pega y **cuántas** paradas; los dos bordes se afinan después por bisección
 * hasta 2 px, y esos son los números que se publican como rango.
 *
 * La bisección arranca de un par que el barrido grueso ya demostró: una parada
 * donde NO estaba pegado y la siguiente donde SÍ. No busca a ciegas — acota un
 * intervalo cuyos dos extremos ya están medidos.
 */

import { medir, scrollA, type Pagina } from '../scripts-b4/navegador'

import {
  censoDeCandidatos,
  lecturaDeCandidatos,
  type BarridoDeCandidato,
  type FichaDeCandidato,
  type ParadaDeCandidato,
} from './b-pin-lectores'

export interface OpcionesDeBarrido {
  /** Los controles que NO son `sticky`. Los `sticky` los encuentra el censo solo. */
  readonly selectores: readonly string[]
  readonly desdeY: number
  readonly hastaY: number
  readonly paso: number
  /** Precisión de la bisección de los bordes, en px. */
  readonly precision: number
}

export interface ResultadoDeBarrido {
  readonly paradas: number
  readonly barridos: readonly BarridoDeCandidato[]
}

interface Acumulador {
  pegado: number
  primera: number | null
  ultima: number | null
  min: number
  max: number
  distintas: number
  lecturas: number
  /** El alto del elemento en las paradas en que estuvo PEGADO, y dónde cambió. */
  altoPegadoMin: number
  altoPegadoMax: number
  altoCambiaEnY: number | null
}

async function leer(
  pagina: Pagina,
  selectores: readonly string[],
): Promise<readonly ParadaDeCandidato[]> {
  return medir<readonly ParadaDeCandidato[]>(pagina, lecturaDeCandidatos(selectores))
}

/** ¿Está pegado el candidato `i` con el scroll en `y`? Una lectura, con scroll real. */
async function pegadoEn(
  pagina: Pagina,
  selectores: readonly string[],
  i: number,
  y: number,
): Promise<boolean> {
  await scrollA(pagina, y)
  const lectura = await leer(pagina, selectores)
  return lectura[i]?.pegado === true
}

/**
 * El borde, por bisección sobre un intervalo cuyos extremos ya están medidos.
 *
 * `pegadoEnBajo` dice qué se sabe del extremo bajo; el alto es el contrario. Se
 * devuelve **el píxel de adentro**: el primero pegado cuando se busca la
 * entrada, el último pegado cuando se busca la salida.
 */
async function bisectar(
  pagina: Pagina,
  selectores: readonly string[],
  i: number,
  bajo: number,
  alto: number,
  pegadoEnBajo: boolean,
  precision: number,
): Promise<number> {
  let a = bajo
  let b = alto
  while (b - a > precision) {
    const medio = Math.round((a + b) / 2)
    const pegado = await pegadoEn(pagina, selectores, i, medio)
    if (pegado === pegadoEnBajo) a = medio
    else b = medio
  }
  return pegadoEnBajo ? a : b
}

/**
 * El barrido entero: censo, paso a paso con scroll real, y los dos bordes
 * afinados de cada candidato que se haya pegado alguna vez.
 *
 * ⚠️ La huella se compara en CADA parada contra la del censo. Si el conjunto de
 * `sticky` cambiara a mitad del barrido, `huellasDistintas` deja de ser cero y
 * la fila entera queda marcada: ninguna cifra se publica alineada por fe.
 */
export async function barrer(pagina: Pagina, o: OpcionesDeBarrido): Promise<ResultadoDeBarrido> {
  const fichas = await medir<readonly FichaDeCandidato[]>(pagina, censoDeCandidatos(o.selectores))
  const acc: Acumulador[] = fichas.map(() => ({
    pegado: 0,
    primera: null,
    ultima: null,
    min: Number.POSITIVE_INFINITY,
    max: Number.NEGATIVE_INFINITY,
    distintas: 0,
    lecturas: 0,
    /**
     * El alto del elemento MIENTRAS estuvo pegado, no el del censo. Ver el
     * docblock de `ParadaDeCandidato.alto`: el censo lo lee a `scrollY = 0` y
     * este hijo crece a mitad del pin.
     */
    altoPegadoMin: Number.POSITIVE_INFINITY,
    altoPegadoMax: Number.NEGATIVE_INFINITY,
    altoCambiaEnY: null as number | null,
  }))

  let paradas = 0
  for (let y = o.desdeY; y <= o.hastaY; y += o.paso) {
    const yReal = await scrollA(pagina, y)
    const lectura = await leer(pagina, o.selectores)
    paradas += 1
    for (let i = 0; i < fichas.length; i += 1) {
      const l = lectura[i]
      const a = acc[i]
      if (l === undefined) {
        a.distintas += 1
        continue
      }
      a.lecturas += 1
      if (l.huella !== fichas[i].huella) a.distintas += 1
      if (l.pegado) {
        a.pegado += 1
        if (a.primera === null) a.primera = yReal
        a.ultima = yReal
        if (a.altoPegadoMax !== Number.NEGATIVE_INFINITY && Math.abs(l.alto - a.altoPegadoMax) > 1 && a.altoCambiaEnY === null) {
          a.altoCambiaEnY = yReal
        }
        a.altoPegadoMin = Math.min(a.altoPegadoMin, l.alto)
        a.altoPegadoMax = Math.max(a.altoPegadoMax, l.alto)
      }
      a.min = Math.min(a.min, l.desplazamiento)
      a.max = Math.max(a.max, l.desplazamiento)
    }
  }

  const barridos: BarridoDeCandidato[] = []
  for (let i = 0; i < fichas.length; i += 1) {
    const a = acc[i]
    const min = a.lecturas === 0 ? 0 : a.min
    const max = a.lecturas === 0 ? 0 : a.max
    let entraEnY: number | null = null
    let saleEnY: number | null = null
    if (a.primera !== null && a.ultima !== null) {
      entraEnY =
        a.primera - o.paso >= o.desdeY
          ? await bisectar(pagina, o.selectores, i, a.primera - o.paso, a.primera, false, o.precision)
          : a.primera
      saleEnY =
        a.ultima + o.paso <= o.hastaY
          ? await bisectar(pagina, o.selectores, i, a.ultima, a.ultima + o.paso, true, o.precision)
          : a.ultima
    }
    barridos.push({
      ficha: fichas[i],
      paradas,
      paradasPegado: a.pegado,
      desdeY: a.primera,
      hastaY: a.ultima,
      entraEnY,
      saleEnY,
      desplazamientoMin: Math.round(min * 100) / 100,
      desplazamientoMax: Math.round(max * 100) / 100,
      amplitud: Math.round((max - min) * 100) / 100,
      altoPegadoMin: a.pegado === 0 ? null : Math.round(a.altoPegadoMin * 100) / 100,
      altoPegadoMax: a.pegado === 0 ? null : Math.round(a.altoPegadoMax * 100) / 100,
      altoCambiaEnY: a.altoCambiaEnY,
      huellasDistintas: a.distintas,
    })
  }
  await scrollA(pagina, 0)
  return { paradas, barridos }
}
