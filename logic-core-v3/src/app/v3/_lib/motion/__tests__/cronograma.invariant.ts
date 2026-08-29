/**
 * INVARIANTE — el cronograma: las dos trampas de duración y de easing.
 *
 * Corre con `npm run test:s2-cronograma`.
 *
 * ── Las dos trampas que se comprueban acá ──────────────────────────────────
 *
 * **Trampa 1 del sprint (SCROLL.md §9.5, trampa 1):** el `ease` de un tween con
 * escalonado dice `none` y miente, en 235 de 278 casos. Acá se exhibe con
 * números: el conjunto avanza LINEAL con el progreso —eso es lo que el `none` del
 * envoltorio describe correctamente— y aun así cada pieza llega CURVADA. Las dos
 * cosas son verdad a la vez, y por eso leer el `ease` del envoltorio como si
 * describiera la animación es un error.
 *
 * El control positivo de esa afirmación es la implementación equivocada: aplicar
 * la curva al progreso GLOBAL en vez de al local. Da otro número, y el chequeo
 * tiene que verlo.
 *
 * **Trampa 2 del sprint (SCROLL.md §9.5, tercera trampa):** la duración
 * declarada no es la aplicada. El ejemplo medido —P8: 2 s declarados, 32
 * targets, `stagger` 0,2 → 8,2 s aplicados— se reproduce exacto.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { progresoEnRango } from '../anclas'
import {
  avanceDelConjunto,
  duracionAplicada,
  progresoDeHijo,
  proporcionDeUnHijo,
  transicionEnTiempoReal,
  ventanaDeHijo,
  type Cronograma,
} from '../cronograma'
import { CURVAS } from '../curvas'
import { propiedadesDePieza, tramoActivo } from '../fotograma'
import { PATRONES } from '../patrones'

const redondear = (n: number, d = 4): number => Math.round(n * 10 ** d) / 10 ** d

/** El cronograma medido de P8, que es el ejemplo publicado. */
const P8: Cronograma = {
  duracionDeclarada: PATRONES.P8.duracionDeclarada,
  escalonado: PATRONES.P8.escalonado,
  cantidad: 32,
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('K1 · TRAMPA 2 — la duración declarada no es la aplicada')

afirmarIgual(P8.duracionDeclarada, 2, 'P8 declara 2 s')
afirmarIgual(P8.cantidad, 32, 'sobre 32 targets')
afirmarIgual(P8.escalonado, 0.2, 'con escalonado 0,2')
afirmarIgual(
  redondear(duracionAplicada(P8), 2),
  8.2,
  'la duración APLICADA son 8,2 s — el número que SCROLL.md §9.5 publica',
)

controlPositivo(
  'la lectura INGENUA (aplicada = declarada) no reproduce el 8,2',
  (c: Cronograma) => c.duracionDeclarada,
  (ingenua) => redondear(ingenua(P8), 2) === 8.2,
)

afirmarIgual(
  redondear(duracionAplicada({ ...P8, cantidad: 1 }), 2),
  2,
  'con una sola pieza las dos duraciones coinciden — es el caso de P2',
)

for (const id of ['P1', 'P3', 'P4', 'P9'] as const) {
  const p = PATRONES[id]
  const c: Cronograma = {
    duracionDeclarada: p.duracionDeclarada,
    escalonado: p.escalonado,
    cantidad: p.piezas.max,
  }
  console.log(
    `  ${id}: ${p.duracionDeclarada} s declarados × ${p.piezas.max} piezas · escalonado ${p.escalonado} → ${redondear(duracionAplicada(c), 2)} s aplicados`,
  )
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('K2 · La ventana de cada pieza, en proporción y en segundos')

const ultima = ventanaDeHijo(31, P8)
afirmarIgual(redondear(ultima.desdeSegundos, 2), 6.2, 'la pieza 32 arranca a los 6,2 s')
afirmarIgual(redondear(ultima.hasta, 4), 1, 'y termina justo al final del recorrido')
afirmarIgual(
  redondear(ultima.desde, 4),
  redondear(6.2 / 8.2, 4),
  'en proporción arranca en 6,2/8,2 del recorrido',
)

const primera = ventanaDeHijo(0, P8)
afirmarIgual(primera.desde, 0, 'la pieza 1 arranca en 0')
afirmarIgual(
  redondear(primera.hasta, 4),
  redondear(2 / 8.2, 4),
  'y ocupa 2/8,2 del recorrido: casi un cuarto',
)
afirmarIgual(
  redondear(proporcionDeUnHijo(P8), 4),
  redondear(2 / 8.2, 4),
  'que es lo ÚNICO que sobrevive de la duración declarada cuando el avance es scroll',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('K3 · Reversibilidad exacta — en los dos bordes y en los dos sentidos')

let todasEnCero = true
let todasEnUno = true
for (let i = 0; i < P8.cantidad; i++) {
  if (progresoDeHijo(0, i, P8) !== 0) todasEnCero = false
  if (progresoDeHijo(1, i, P8) !== 1) todasEnUno = false
}
afirmar(todasEnCero, 'en progreso 0, las 32 piezas están en 0')
afirmar(todasEnUno, 'en progreso 1, las 32 piezas están en 1')

let monotono = true
for (const i of [0, 7, 15, 31]) {
  let previo = -1
  for (let p = 0; p <= 1.0001; p += 0.01) {
    const v = progresoDeHijo(Math.min(p, 1), i, P8)
    if (v < previo - 1e-12) monotono = false
    previo = v
  }
}
afirmar(monotono, 'y el progreso de cada pieza nunca retrocede al avanzar el global')

// Ida y vuelta: el valor en p es el mismo se llegue subiendo o bajando.
let simetrico = true
for (let p = 0; p <= 1.0001; p += 0.05) {
  const q = Math.min(p, 1)
  if (progresoDeHijo(q, 9, P8) !== progresoDeHijo(q, 9, P8)) simetrico = false
}
afirmar(simetrico, 'y no hay estado interno: el mismo progreso da el mismo valor siempre')

// ═══════════════════════════════════════════════════════════════════════════
titulo('K4 · TRAMPA 1 — el conjunto avanza lineal y cada pieza llega curvada')

// El avance del conjunto ES lineal con el scroll: es lo que hace verdadero el
// `none` del envoltorio. Se comprueba sobre el motor de progreso, que es el que
// mapea scroll a progreso.
const rango = { inicio: 1000, fin: 2000 }
const puntos = [0, 0.25, 0.5, 0.75, 1]
let esLineal = true
for (const t of puntos) {
  const p = progresoEnRango(rango.inicio + t * 1000, rango)
  if (Math.abs(p - t) > 1e-12) esLineal = false
}
afirmar(esLineal, 'el progreso del conjunto es EXACTAMENTE lineal en el scroll — el `none` no miente ahí')

// Y sin embargo la pieza llega curvada.
const cronogramaDeP1: Cronograma = {
  duracionDeclarada: PATRONES.P1.duracionDeclarada,
  escalonado: PATRONES.P1.escalonado,
  cantidad: 6,
}
const curva = CURVAS[PATRONES.P1.curva]
const local = progresoDeHijo(0.5, 2, cronogramaDeP1)
const curvado = curva(local)
afirmar(
  Math.abs(curvado - local) > 0.01,
  'y la pieza 3 de P1 en la mitad del recorrido llega curvada, no lineal',
  `local ${redondear(local, 4)} → curvado ${redondear(curvado, 4)}`,
)

// El control positivo: aplicar la curva al progreso GLOBAL da otro número.
const alReves = progresoDeHijo(curva(0.5), 2, cronogramaDeP1)
afirmar(
  Math.abs(alReves - curvado) > 0.01,
  'aplicar la curva al progreso GLOBAL en vez de al local da otro resultado: el orden importa',
  `orden correcto ${redondear(curvado, 4)} · orden invertido ${redondear(alReves, 4)}`,
)

controlPositivo(
  'el chequeo de linealidad ve una función que NO es lineal',
  CURVAS.principal,
  (f: (t: number) => number) => puntos.every((t) => Math.abs(f(t) - t) < 1e-12),
)

/**
 * El promedio del conjunto SIN curvar tampoco es lineal, y esto es la parte fina
 * de la trampa: en el punto medio SÍ lo es —el escalonado uniforme es simétrico,
 * así que a mitad de recorrido las piezas adelantadas compensan exacto a las
 * atrasadas— y en cualquier otro punto no. Mirar el promedio en 0,5 y concluir
 * "esto es lineal" es la misma clase de error que leer el `ease` del envoltorio.
 * El invariante barre el recorrido entero en vez de mirar un punto.
 */
afirmarIgual(
  redondear(avanceDelConjunto(0.5, P8), 6),
  0.5,
  'a mitad de recorrido el promedio de las 32 piezas SÍ da 0,5 — por simetría del escalonado',
)
let peorDesvio = 0
let dondeDesvia = 0
for (let p = 0; p <= 1.0001; p += 0.005) {
  const q = Math.min(p, 1)
  const desvio = Math.abs(avanceDelConjunto(q, P8) - q)
  if (desvio > peorDesvio) {
    peorDesvio = desvio
    dondeDesvia = q
  }
}
afirmar(
  peorDesvio > 0.01,
  'pero fuera del punto medio se aparta: el promedio tampoco describe la animación',
  `desvío máximo ${redondear(peorDesvio, 4)} en p=${redondear(dondeDesvia, 3)}`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('K5 · LOS DOS MODOS — la misma partición, dos unidades')

const enTiempoReal = transicionEnTiempoReal(31, P8)
afirmarIgual(
  redondear(enTiempoReal.delay, 2),
  6.2,
  'en tiempo real la pieza 32 arranca a los 6,2 SEGUNDOS',
)
afirmarIgual(
  enTiempoReal.duration,
  2,
  'y dura los 2 s declarados: acá la duración declarada SÍ se aplica',
)
afirmarIgual(
  redondear(ventanaDeHijo(31, P8).desde, 6),
  redondear(enTiempoReal.delay / duracionAplicada(P8), 6),
  'y las dos lecturas salen de la misma cuenta: proporción = segundos / total',
)

console.log(
  `  atado-al-scroll: la pieza 32 ocupa [${redondear(ultima.desde, 4)} … 1] del RECORRIDO`,
)
console.log(
  `  tiempo-real    : la pieza 32 ocupa [${redondear(enTiempoReal.delay, 2)} s … ${redondear(enTiempoReal.delay + enTiempoReal.duration, 2)} s] del RELOJ`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('K6 · P7 — la única línea de tiempo del corpus: contigua y continua')

/**
 * P7 es el único de los nueve que no es un tween suelto: son 2 de las 244
 * instancias, y las dos arman una timeline. Un tramo que empiece donde no
 * terminó el anterior produce un salto visible, y un tramo que declare una clave
 * que el otro no declara produce el mismo salto por otra vía —la clave queda sin
 * valor y vuelve a su neutro—. Las dos cosas se afirman acá.
 */
const tramos = PATRONES.P7.tramos ?? []
afirmarIgual(tramos.length, 2, 'P7 tiene dos tramos: llegada y salida')
afirmarIgual(tramos[0].desde, 0, 'el primero arranca en 0')
afirmarIgual(tramos[tramos.length - 1].hasta, 1, 'y el último termina en 1')

let contiguos = true
for (let i = 1; i < tramos.length; i++) {
  if (tramos[i].desde !== tramos[i - 1].hasta) contiguos = false
}
afirmar(contiguos, 'los tramos son contiguos: ninguno empieza donde no terminó el anterior')

const clavesDe = (i: number): string =>
  tramos[i].claves
    .map((k) => k.clave)
    .slice()
    .sort()
    .join(',')
afirmarIgual(
  clavesDe(0),
  clavesDe(1),
  'los dos tramos declaran EL MISMO juego de claves: ninguna se cae a su neutro',
)

// El tramo activo en cada punto, y la continuidad en la frontera.
const frontera = tramos[0].hasta
afirmarIgual(tramoActivo(tramos, 0).tramo.nombre, 'llegada', 'en 0 manda la llegada')
afirmarIgual(tramoActivo(tramos, 1).tramo.nombre, 'salida', 'en 1 manda la salida')
afirmarIgual(
  tramoActivo(tramos, frontera).tramo.nombre,
  'salida',
  'y en la frontera exacta ya manda la salida',
)

const specP7 = {
  claves: PATRONES.P7.claves,
  tramos: PATRONES.P7.tramos,
  curva: PATRONES.P7.curva,
  cronograma: { duracionDeclarada: PATRONES.P7.duracionDeclarada, escalonado: 0, cantidad: 1 },
}
afirmarIgual(
  propiedadesDePieza(specP7, 0, frontera - 1e-9),
  propiedadesDePieza(specP7, 0, frontera),
  'TODAS las propiedades son las mismas a los dos lados de la frontera: no hay salto',
)
afirmarIgual(
  propiedadesDePieza(specP7, 0, frontera),
  { opacity: 1, visibility: 'visible', pointerEvents: 'auto' },
  '  y en la frontera el plano está entero, opaco y clickeable — sin transformada',
)
afirmarIgual(
  propiedadesDePieza(specP7, 0, 0).transform,
  'translate3d(0px, 0px, -3000px) scale(0.6)',
  'y el plano arranca a −3000 con escala 0,6, como se midió',
)
afirmarIgual(
  propiedadesDePieza(specP7, 0, 1).transform,
  'translate3d(0px, 0px, 1000px)',
  'y se va a +1000',
)

controlPositivo(
  'el chequeo de contigüidad ve un hueco entre tramos',
  [
    { desde: 0, hasta: 0.4 },
    { desde: 0.5, hasta: 1 },
  ],
  (falsos: readonly { desde: number; hasta: number }[]) => {
    for (let i = 1; i < falsos.length; i++) {
      if (falsos[i].desde !== falsos[i - 1].hasta) return false
    }
    return true
  },
)

cerrar('cronograma.invariant')
