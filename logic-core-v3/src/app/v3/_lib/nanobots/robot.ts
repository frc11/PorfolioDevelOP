import { type Punto, type Trazo, circulo, disco, rectanguloRedondeado, repartir, trazar } from './trazos'

/**
 * [AJUSTES FINALES] A6 · EL ROBOT QUE HABLA Y SU FLUJO — el símbolo de IA y automatización, en dos acentos: el robot del
 * chatbot (la cabeza, la antena, los ojos, la boca) con su GLOBO DE DIÁLOGO arriba a la derecha, donde el texto se tipea
 * renglón a renglón, se borra y vuelve a empezar; y el FLUJO de automatización que sale de la esquina de la cabeza en
 * diagonal hacia abajo a la derecha: tres nodos en línea y, del tercero, una bifurcación en dos. Los nodos son anillos
 * (nuestra forma, no la de n8n) que se llenan cuando el pulso llega. El tiempo lo pone el sombreador (`vida.ts`); acá va
 * la forma, y en `w` lo que cada nanobot es:
 *
 *   0 · el robot              1 · el globo de diálogo (su contorno y su colita)
 *   2 + f · el texto          f (0 a 1): en qué punto del texto está este nanobot, para tipearlo en orden.
 *   3 + (k + r·0,5) / 10      el nodo k: su anillo (r 0, siempre) o su relleno (r 1, cuando el pulso llegó).
 *   4 + (L + u·0,99) / 10     el tramo L, a la fracción u de su recorrido (el pulso lo corre).
 */
export const CAPAS_DEL_ROBOT = { robot: 0, globo: 1, texto: 2, nodos: 3, tramos: 4 } as const

export const ROBOT = {
  cabeza: { cx: -0.43, cy: 0.39, mx: 0.3, my: 0.26, r: 0.1 },
  ojos: { dx: 0.12, dy: 0.05, r: 0.055 },
  boca: { medio: 0.12, dy: -0.12 },
  antena: { alto: 0.1, bolita: 0.035 },
} as const

export const GLOBO_DE_DIALOGO = {
  cx: 0.35,
  cy: 0.61,
  mx: 0.34,
  my: 0.17,
  r: 0.08,
  /** La colita: su base (dos x sobre el borde de abajo) y la punta, que apunta a la cabeza. */
  colita: { base: [0.07, 0.19], punta: [-0.07, 0.37] },
  /** Los renglones: cuánto del ancho interior mide cada uno; la separación entre ellos y el margen a los lados. */
  renglones: [0.78, 0.55, 0.66],
  entre: 0.085,
  margen: 0.07,
} as const

interface Flujo {
  readonly arranque: readonly [number, number]
  readonly nodos: readonly (readonly [number, number])[]
  readonly tramos: readonly (readonly [number, number])[]
  readonly anillo: number
  readonly relleno: number
}

export const FLUJO: Flujo = {
  /** De dónde sale (pegado a la esquina de abajo a la derecha de la cabeza). */
  arranque: [-0.21, 0.11],
  /** Tres nodos en línea, en diagonal, y los dos de la bifurcación (a ±40° de la diagonal, desde el tercero). */
  nodos: [[-0.05, -0.05], [0.17, -0.27], [0.39, -0.49], [0.69, -0.52], [0.42, -0.79]],
  /** Los tramos: de qué nodo a cuál (−1: el arranque). Los dos últimos salen del nodo 2: la bifurcación. */
  tramos: [[-1, 0], [0, 1], [1, 2], [2, 3], [2, 4]],
  /** El radio del anillo de un nodo y el de su relleno. */
  anillo: 0.055,
  relleno: 0.032,
}

export function robot(n: number, azar: () => number): Punto[] {
  const C = ROBOT.cabeza
  const G = GLOBO_DE_DIALOGO
  const K = CAPAS_DEL_ROBOT
  const cimaDeLaCabeza = C.cy + C.my
  const trazos: Trazo[] = [
    { vertices: rectanguloRedondeado(C.cx, C.cy, C.mx, C.my, C.r), w: K.robot, cerrado: true },
    { vertices: [[C.cx, cimaDeLaCabeza], [C.cx, cimaDeLaCabeza + ROBOT.antena.alto]], w: K.robot },
    { vertices: circulo(C.cx, cimaDeLaCabeza + ROBOT.antena.alto + ROBOT.antena.bolita, ROBOT.antena.bolita, 32), w: K.robot, cerrado: true },
    { vertices: [[C.cx - ROBOT.boca.medio, C.cy + ROBOT.boca.dy], [C.cx + ROBOT.boca.medio, C.cy + ROBOT.boca.dy]], w: K.robot },
    { vertices: rectanguloRedondeado(G.cx, G.cy, G.mx, G.my, G.r), w: K.globo, cerrado: true },
    { vertices: [[G.colita.base[0], G.cy - G.my], G.colita.punta, [G.colita.base[1], G.cy - G.my]], w: K.globo },
  ]
  // Los renglones: cada nanobot sabe en qué punto del texto está (de 0 a 1, renglón tras renglón), para tipearse en orden.
  const largos = G.renglones.map((r) => r * 2 * (G.mx - G.margen))
  const total = largos.reduce((s, l) => s + l, 0)
  let antes = 0
  largos.forEach((largo, k) => {
    const [x0, y, desde] = [G.cx - G.mx + G.margen, G.cy + G.entre * (1 - k), antes]
    trazos.push({ vertices: [[x0, y], [x0 + largo, y]], w: (u) => K.texto + 0.999 * ((desde + u * largo) / total) })
    antes += largo
  })
  // Los anillos de los nodos y los tramos, de borde de anillo a borde de anillo, cada nanobot con cuánto del tramo es.
  FLUJO.nodos.forEach(([x, y], k) => trazos.push({ vertices: circulo(x, y, FLUJO.anillo, 40), w: K.nodos + k / 10, cerrado: true }))
  FLUJO.tramos.forEach(([de, a], L) => {
    const p = de < 0 ? FLUJO.arranque : FLUJO.nodos[de]
    const q = FLUJO.nodos[a]
    const largo = Math.hypot(q[0] - p[0], q[1] - p[1])
    const [dx, dy] = [(q[0] - p[0]) / largo, (q[1] - p[1]) / largo]
    const recorte = de < 0 ? 0 : FLUJO.anillo
    trazos.push({ vertices: [[p[0] + dx * recorte, p[1] + dy * recorte], [q[0] - dx * FLUJO.anillo, q[1] - dy * FLUJO.anillo]], w: (u) => K.tramos + (L + 0.99 * u) / 10 })
  })
  // Las superficies (los ojos y los rellenos de los nodos) llevan su parte, por área; el resto, por largo de trazo.
  const [deSuperficies, deTrazos] = repartir(n, [0.09, 0.91])
  const cuantos = repartir(deSuperficies, [3, 3, 1, 1, 1, 1, 1])
  const puntos: Punto[] = [
    ...disco(C.cx - ROBOT.ojos.dx, C.cy + ROBOT.ojos.dy, ROBOT.ojos.r, cuantos[0], K.robot, 0.02),
    ...disco(C.cx + ROBOT.ojos.dx, C.cy + ROBOT.ojos.dy, ROBOT.ojos.r, cuantos[1], K.robot, 0.02),
  ]
  FLUJO.nodos.forEach(([x, y], k) => puntos.push(...disco(x, y, FLUJO.relleno, cuantos[2 + k], K.nodos + (k + 0.5) / 10)))
  // El espesor en z, mínimo: la perspectiva lo vuelve un corrimiento en el plano y una línea maciza no se puede permitir ni medio px.
  return [...puntos, ...trazar(trazos, deTrazos, 0.02, azar)]
}
