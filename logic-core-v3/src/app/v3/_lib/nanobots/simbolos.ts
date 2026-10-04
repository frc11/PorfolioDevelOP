import { sembrar } from '../escena/titulos3d/llegada'

/**
 * [PASADA FINAL] C4 · LOS SÍMBOLOS DEL ENJAMBRE — dónde va cada nanobot en cada estado del rodillo de Servicios, calculado
 * una vez (en la CPU, al montar) y mandado a la GPU: el morph es del sombreador. Cada símbolo da EXACTAMENTE `n` puntos
 * (x, y, z, w) en un espacio de −1 a 1; `w` es lo que el sombreador necesita para animarlo:
 *
 *   0 · nube      el enjambre suelto, flotando (el estado «Nuestros servicios»). w: 0.
 *   1 · globo     Desarrollo web: un globo de red — meridianos, paralelos, nodos y conexiones (arcos por encima). w: 0
 *                 la red, 1 un nodo (más grande), 2 una conexión.
 *   2 · engranajes  Software a medida: dos engranajes que encajan (12 y 8 dientes, sus círculos primitivos tangentes) con
 *                 su cubo y sus rayos. w: 0 el grande, 1 el chico (cada uno gira sobre su centro, al revés y en razón).
 *   3 · robot     IA y automatización: el robot de un chatbot (la cabeza, la antena, los ojos, la boca y el globito de
 *                 diálogo) y un flujo de automatización (nodos conectados) que sale en diagonal hacia abajo a la derecha.
 *                 w: 0 el robot; 1 + s el flujo (s: de 0 a 1, cuánto del recorrido del flujo, para el pulso que lo corre).
 *
 * Determinista (`sembrar`): los mismos puntos en cada carga y en el invariante.
 */
export const CUANTOS_SIMBOLOS = 4

/** Cuántos nanobots: en el panel de escritorio y en la cabeza angosta del teléfono (menos). Sin three: lo lee la sección. */
export const PUNTOS_DEL_ENJAMBRE = { ancho: 3000, angosto: 900 } as const

/** Los engranajes: centros, dientes y radios (de pie y de punta), con sus círculos primitivos tangentes. */
export const ENGRANAJES = (() => {
  const a = { centro: [-0.3, 0.2] as const, dientes: 12, pie: 0.46, punta: 0.58, cubo: 0.16, rayos: 5 }
  const b = { dientes: 8, pie: 0.29, punta: 0.4, cubo: 0.1, rayos: 4 }
  const primitivo = (g: { readonly pie: number; readonly punta: number }): number => (g.pie + g.punta) / 2
  // El chico, sobre la diagonal de abajo a la derecha, a la suma de los primitivos (encajan).
  const direccion = [0.809 / Math.hypot(0.809, 0.588), -0.588 / Math.hypot(0.809, 0.588)] as const
  const d = primitivo(a) + primitivo(b)
  const centroB = [a.centro[0] + d * direccion[0], a.centro[1] + d * direccion[1]] as const
  // El contacto: un diente del grande frente a un hueco del chico.
  const contacto = Math.atan2(direccion[1], direccion[0])
  const faseA = contacto - (0.25 * 2 * Math.PI) / a.dientes
  const faseB = contacto + Math.PI - (0.75 * 2 * Math.PI) / b.dientes
  return { a: { ...a, fase: faseA, primitivo: primitivo(a) }, b: { ...b, centro: centroB, fase: faseB, primitivo: primitivo(b) }, razon: a.dientes / b.dientes }
})()

type Punto = [number, number, number, number]
type Azar = () => number

/** Reparte `n` entre partes con estos pesos (la última se lleva el resto: suman exacto). */
function repartir(n: number, pesos: readonly number[]): number[] {
  const total = pesos.reduce((s, p) => s + p, 0)
  const partes = pesos.map((p) => Math.floor((n * p) / total))
  partes[partes.length - 1] += n - partes.reduce((s, p) => s + p, 0)
  return partes
}

/** Un punto sobre un segmento (con un poco de grosor). */
function enSegmento(a: readonly number[], b: readonly number[], u: number, azar: Azar, grosor: number, w: number): Punto {
  return [a[0] + (b[0] - a[0]) * u + (azar() - 0.5) * grosor, a[1] + (b[1] - a[1]) * u + (azar() - 0.5) * grosor, (a[2] ?? 0) + (azar() - 0.5) * grosor, w]
}

function nube(n: number, azar: Azar): Punto[] {
  return Array.from({ length: n }, () => {
    // Una esfera blanda: más densa en el medio, con el borde que se deshace.
    const r = 0.82 * Math.cbrt(azar()) ** 1.4
    const t = azar() * 2 * Math.PI
    const c = azar() * 2 - 1
    const s = Math.sqrt(1 - c * c)
    return [r * s * Math.cos(t), r * c * 0.9, r * s * Math.sin(t), 0]
  })
}

function enLaEsfera(lat: number, lon: number, r: number): [number, number, number] {
  return [r * Math.cos(lat) * Math.sin(lon), r * Math.sin(lat), r * Math.cos(lat) * Math.cos(lon)]
}

function globo(n: number, azar: Azar): Punto[] {
  const R = 0.8
  const [deMeridianos, deParalelos, deNodos, deConexiones] = repartir(n, [0.3, 0.25, 0.15, 0.3])
  const puntos: Punto[] = []
  const MERIDIANOS = 10
  const PARALELOS = [-60, -30, 0, 30, 60].map((g) => (g * Math.PI) / 180)
  for (let i = 0; i < deMeridianos; i += 1) {
    const lon = (Math.floor(azar() * MERIDIANOS) / MERIDIANOS) * 2 * Math.PI
    const lat = (azar() - 0.5) * Math.PI
    puntos.push([...enLaEsfera(lat, lon, R), 0])
  }
  for (let i = 0; i < deParalelos; i += 1) {
    const lat = PARALELOS[Math.floor(azar() * PARALELOS.length)]
    puntos.push([...enLaEsfera(lat, azar() * 2 * Math.PI, R), 0])
  }
  // Los nodos: en cruces de meridianos y paralelos, apretados.
  const nodos = Array.from({ length: 16 }, () => [PARALELOS[Math.floor(azar() * PARALELOS.length)], (Math.floor(azar() * MERIDIANOS) / MERIDIANOS) * 2 * Math.PI] as const)
  for (let i = 0; i < deNodos; i += 1) {
    const [lat, lon] = nodos[i % nodos.length]
    const p = enLaEsfera(lat + (azar() - 0.5) * 0.05, lon + (azar() - 0.5) * 0.05, R)
    puntos.push([...p, 1])
  }
  // Las conexiones: arcos de gran círculo entre nodos, por encima de la superficie (la red que los une).
  const pares = Array.from({ length: 9 }, (_, k) => [nodos[k % nodos.length], nodos[(k * 5 + 3) % nodos.length]] as const)
  for (let i = 0; i < deConexiones; i += 1) {
    const [[la1, lo1], [la2, lo2]] = pares[i % pares.length]
    const u = azar()
    const a = enLaEsfera(la1, lo1, 1)
    const b = enLaEsfera(la2, lo2, 1)
    const m = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]
    const largo = Math.hypot(m[0], m[1], m[2]) || 1
    const alto = R * (1 + 0.12 * Math.sin(Math.PI * u))
    puntos.push([(m[0] / largo) * alto, (m[1] / largo) * alto, (m[2] / largo) * alto, 2])
  }
  return puntos
}

/** El radio del contorno de un engranaje en el ángulo `t` (sin girar): punta en los dientes, pie en los huecos, flancos rectos. */
export function radioDelDiente(g: { readonly dientes: number; readonly pie: number; readonly punta: number; readonly fase: number }, t: number): number {
  const u = (((t - g.fase) * g.dientes) / (2 * Math.PI)) % 1
  const v = u < 0 ? u + 1 : u
  // Un diente ocupa la mitad del paso, con flancos de un décimo.
  const alto = v < 0.1 ? v / 0.1 : v < 0.4 ? 1 : v < 0.5 ? (0.5 - v) / 0.1 : 0
  return g.pie + (g.punta - g.pie) * alto
}

function engranajes(n: number, azar: Azar): Punto[] {
  const puntos: Punto[] = []
  const [deA, deB] = repartir(n, [0.62, 0.38])
  for (const [g, cuantos, w] of [[ENGRANAJES.a, deA, 0], [ENGRANAJES.b, deB, 1]] as const) {
    const [deContorno, deCubo, deRayos, deCara] = repartir(cuantos, [0.5, 0.14, 0.18, 0.18])
    for (let i = 0; i < deContorno; i += 1) {
      const t = azar() * 2 * Math.PI
      const r = radioDelDiente(g, t)
      puntos.push([g.centro[0] + r * Math.cos(t), g.centro[1] + r * Math.sin(t), (azar() - 0.5) * 0.12, w])
    }
    for (let i = 0; i < deCubo; i += 1) {
      const t = azar() * 2 * Math.PI
      puntos.push([g.centro[0] + g.cubo * Math.cos(t), g.centro[1] + g.cubo * Math.sin(t), (azar() - 0.5) * 0.12, w])
    }
    for (let i = 0; i < deRayos; i += 1) {
      const t = g.fase + (Math.floor(azar() * g.rayos) / g.rayos) * 2 * Math.PI
      const r = g.cubo + (g.pie * 0.88 - g.cubo) * azar()
      puntos.push([g.centro[0] + r * Math.cos(t), g.centro[1] + r * Math.sin(t), (azar() - 0.5) * 0.08, w])
    }
    // La corona (un anillo apenas adentro del pie): el cuerpo del engranaje.
    for (let i = 0; i < deCara; i += 1) {
      const t = azar() * 2 * Math.PI
      const r = g.pie * (0.82 + 0.06 * azar())
      puntos.push([g.centro[0] + r * Math.cos(t), g.centro[1] + r * Math.sin(t), (azar() - 0.5) * 0.12, w])
    }
  }
  return puntos
}

/** Un punto del contorno de un rectángulo redondeado (centro, medio ancho y medio alto, radio), a la fracción `u` de su recorrido. */
export function enRectanguloRedondeado(cx: number, cy: number, mx: number, my: number, r: number, u: number): [number, number] {
  const [l1, l2, arco] = [2 * (mx - r), 2 * (my - r), (Math.PI / 2) * r]
  const tramos = [l1, arco, l2, arco, l1, arco, l2, arco]
  let d = u * tramos.reduce((s, x) => s + x, 0)
  let k = 0
  while (k < 7 && d > tramos[k]) {
    d -= tramos[k]
    k += 1
  }
  const f = tramos[k] > 0 ? Math.min(1, d / tramos[k]) : 0
  // Los lados, de arriba en sentido horario; las esquinas, con su centro y su ángulo de arranque.
  if (k === 0) return [cx - mx + r + f * l1, cy + my]
  if (k === 2) return [cx + mx, cy + my - r - f * l2]
  if (k === 4) return [cx + mx - r - f * l1, cy - my]
  if (k === 6) return [cx - mx, cy - my + r + f * l2]
  const esquina = (k - 1) / 2
  const centros = [[cx + mx - r, cy + my - r], [cx + mx - r, cy - my + r], [cx - mx + r, cy - my + r], [cx - mx + r, cy + my - r]]
  const angulo = [Math.PI / 2, 0, -Math.PI / 2, Math.PI][esquina] - f * (Math.PI / 2)
  return [centros[esquina][0] + r * Math.cos(angulo), centros[esquina][1] + r * Math.sin(angulo)]
}

/** El flujo: del robot hacia abajo a la derecha, nodo a nodo (con una rama), y cuánto del recorrido es cada tramo. */
export const FLUJO = {
  nodos: [[0.18, -0.22], [0.42, -0.46], [0.66, -0.7], [0.74, -0.24]] as const,
  tramos: [[[0.08, -0.1], [0.18, -0.22]], [[0.18, -0.22], [0.42, -0.46]], [[0.42, -0.46], [0.66, -0.7]], [[0.42, -0.46], [0.74, -0.24]]] as const,
  lado: 0.07,
}

function robot(n: number, azar: Azar): Punto[] {
  const puntos: Punto[] = []
  const [deCabeza, deAntena, deOjos, deBoca, deGlobito, deFlujo] = repartir(n, [0.3, 0.06, 0.12, 0.05, 0.1, 0.37])
  const cabeza = { cx: -0.32, cy: 0.24, mx: 0.38, my: 0.3, r: 0.12 }
  for (let i = 0; i < deCabeza; i += 1) {
    const [x, y] = enRectanguloRedondeado(cabeza.cx, cabeza.cy, cabeza.mx, cabeza.my, cabeza.r, azar())
    puntos.push([x, y, (azar() - 0.5) * 0.1, 0])
  }
  for (let i = 0; i < deAntena; i += 1) {
    // El palo y la bolita de arriba.
    if (azar() < 0.55) puntos.push(enSegmento([cabeza.cx, cabeza.cy + cabeza.my], [cabeza.cx, cabeza.cy + cabeza.my + 0.14], azar(), azar, 0.015, 0))
    else {
      const t = azar() * 2 * Math.PI
      puntos.push([cabeza.cx + 0.045 * Math.cos(t), cabeza.cy + cabeza.my + 0.19 + 0.045 * Math.sin(t), (azar() - 0.5) * 0.05, 0])
    }
  }
  for (let i = 0; i < deOjos; i += 1) {
    const ojo = i % 2 === 0 ? -0.16 : 0.16
    const r = 0.075 * Math.sqrt(azar())
    const t = azar() * 2 * Math.PI
    puntos.push([cabeza.cx + ojo + r * Math.cos(t), cabeza.cy + 0.06 + r * Math.sin(t), 0.02, 0])
  }
  for (let i = 0; i < deBoca; i += 1) puntos.push(enSegmento([cabeza.cx - 0.13, cabeza.cy - 0.14], [cabeza.cx + 0.13, cabeza.cy - 0.14], azar(), azar, 0.012, 0))
  // El globito de diálogo, abajo a la izquierda de la cabeza (es un chatbot): su contorno y su colita.
  for (let i = 0; i < deGlobito; i += 1) {
    if (azar() < 0.8) {
      const [x, y] = enRectanguloRedondeado(-0.72, -0.32, 0.17, 0.1, 0.08, azar())
      puntos.push([x, y, 0, 0])
    } else puntos.push(enSegmento([-0.6, -0.2], [-0.5, -0.08], azar(), azar, 0.012, 0))
  }
  // El flujo: los tramos y los nodos, cada punto con s (cuánto del recorrido desde el robot: la rama sigue del nodo 1).
  const largos = FLUJO.tramos.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]))
  const arranque = [0, largos[0], largos[0] + largos[1], largos[0] + largos[1]]
  const deLosNodos = [largos[0], largos[0] + largos[1], largos[0] + largos[1] + largos[2], largos[0] + largos[1] + largos[3]]
  const total = Math.max(...deLosNodos)
  const [deTramos, deNodos] = repartir(deFlujo, [0.45, 0.55])
  for (let i = 0; i < deTramos; i += 1) {
    const k = Math.floor(azar() * FLUJO.tramos.length)
    const u = azar()
    const [a, b] = FLUJO.tramos[k]
    const p = enSegmento(a, b, u, azar, 0.014, 0)
    puntos.push([p[0], p[1], p[2], 1 + Math.min(0.999, (arranque[k] + u * largos[k]) / total)])
  }
  for (let i = 0; i < deNodos; i += 1) {
    const k = i % FLUJO.nodos.length
    const [nx, ny] = FLUJO.nodos[k]
    const [x, y] = enRectanguloRedondeado(nx, ny, FLUJO.lado, FLUJO.lado, 0.03, azar())
    puntos.push([x, y, (azar() - 0.5) * 0.05, 1 + Math.min(0.999, deLosNodos[k] / total)])
  }
  return puntos
}

/** Los cuatro símbolos, `n` puntos cada uno (en el orden del rodillo). */
export function simbolosDelEnjambre(n: number, semilla = 0xb07): readonly Float32Array[] {
  const azar = sembrar(semilla)
  return [nube, globo, engranajes, robot].map((f) => {
    const puntos = f(n, azar)
    const datos = new Float32Array(n * 4)
    puntos.forEach((p, i) => datos.set(p, i * 4))
    return datos
  })
}
