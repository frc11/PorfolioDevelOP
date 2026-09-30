/**
 * SPRINT CALIDAD 1 — B8 · el mosaico de ruido azul: b8-ruido-azul.ts [lado] [sigma]
 *
 * Genera un mosaico de ruido azul de `lado`×`lado` con el método de vacío y cúmulo (Ulichney, 1993): la energía de cada
 * celda es la suma de gaussianas (de `sigma` celdas, en un toro) centradas en los unos; se arma un patrón binario de
 * prueba moviendo el uno del cúmulo más apretado al vacío más grande hasta que no cambia, y después se le da un rango
 * a cada celda sacando cúmulos (hacia abajo) y llenando vacíos (hacia arriba). El rango, normalizado, es el umbral de
 * cada píxel. Determinista (la semilla es fija). Imprime el arreglo para `ruidoAzul.ts` y la medida del espectro: la
 * energía de baja frecuencia contra la de ruido blanco (el azul casi no tiene).
 */
const LADO = Number(process.argv[2] ?? 16)
const SIGMA = Number(process.argv[3] ?? 1.5)
const N = LADO * LADO

/** Un generador fijo (mulberry32). */
function azar(semilla: number): () => number {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const gauss = new Float64Array(N)
for (let y = 0; y < LADO; y += 1) {
  for (let x = 0; x < LADO; x += 1) {
    const dx = Math.min(x, LADO - x)
    const dy = Math.min(y, LADO - y)
    gauss[y * LADO + x] = Math.exp(-(dx * dx + dy * dy) / (2 * SIGMA * SIGMA))
  }
}
const energiaEn = (unos: Uint8Array, valor: number, i: number): number => {
  const [xi, yi] = [i % LADO, Math.floor(i / LADO)]
  let e = 0
  for (let j = 0; j < N; j += 1) {
    if (unos[j] !== valor) continue
    const [xj, yj] = [j % LADO, Math.floor(j / LADO)]
    e += gauss[((yi - yj + LADO) % LADO) * LADO + ((xi - xj + LADO) % LADO)]
  }
  return e
}
/** El cúmulo más apretado (la celda con `valor` de más energía) o el vacío más grande (la sin `valor` de menos). */
function extremo(unos: Uint8Array, valor: number, cumulo: boolean): number {
  let [mejor, cual] = [cumulo ? -Infinity : Infinity, -1]
  for (let i = 0; i < N; i += 1) {
    if ((unos[i] === valor) !== cumulo) continue
    const e = energiaEn(unos, valor, i)
    if (cumulo ? e > mejor : e < mejor) [mejor, cual] = [e, i]
  }
  return cual
}

const tirar = azar(0xb10e)
const prototipo = new Uint8Array(N)
const cuantos = Math.max(1, Math.round(N / 10))
for (let k = 0; k < cuantos; ) {
  const i = Math.floor(tirar() * N)
  if (prototipo[i] === 0) {
    prototipo[i] = 1
    k += 1
  }
}
for (let vuelta = 0; vuelta < N * 4; vuelta += 1) {
  const c = extremo(prototipo, 1, true)
  prototipo[c] = 0
  const v = extremo(prototipo, 1, false)
  if (v === c) {
    prototipo[c] = 1
    break
  }
  prototipo[v] = 1
}
const rango = new Int32Array(N).fill(-1)
// Fase 1: sacar cúmulos del prototipo, del rango cuantos−1 al 0.
let patron = prototipo.slice()
for (let r = cuantos - 1; r >= 0; r -= 1) {
  const c = extremo(patron, 1, true)
  patron[c] = 0
  rango[c] = r
}
// Fase 2: llenar vacíos desde el prototipo hasta la mitad.
patron = prototipo.slice()
for (let r = cuantos; r < N / 2; r += 1) {
  const v = extremo(patron, 1, false)
  patron[v] = 1
  rango[v] = r
}
// Fase 3: la otra mitad, con los ceros como minoría: el cúmulo más apretado de ceros se llena.
for (let r = N / 2; r < N; r += 1) {
  const c = extremo(patron, 0, true)
  patron[c] = 1
  rango[c] = r
}
if ([...rango].some((r) => r < 0) || new Set(rango).size !== N) throw new Error('rangos incompletos')

/** La energía de baja frecuencia del mosaico (DFT, radio de frecuencia ≤ lado/8), normalizada; el ruido blanco da ~1. */
function bajaFrecuencia(valores: ArrayLike<number>): number {
  const media = Array.from(valores).reduce((a, b) => a + b, 0) / N
  let [baja, total] = [0, 0]
  for (let v = 0; v < LADO; v += 1) {
    for (let u = 0; u < LADO; u += 1) {
      if (u === 0 && v === 0) continue
      let [re, im] = [0, 0]
      for (let i = 0; i < N; i += 1) {
        const a = (-2 * Math.PI * (u * (i % LADO) + v * Math.floor(i / LADO))) / LADO
        re += (valores[i] - media) * Math.cos(a)
        im += (valores[i] - media) * Math.sin(a)
      }
      const p = re * re + im * im
      const fu = Math.min(u, LADO - u)
      const fv = Math.min(v, LADO - v)
      if (Math.hypot(fu, fv) <= LADO / 8) baja += p
      total += p
    }
  }
  const fraccion = Math.PI * (LADO / 8) ** 2 / (N - 1)
  return baja / total / fraccion
}
const blanco = Float64Array.from({ length: N }, () => tirar())
const umbrales = Array.from(rango, (r) => (r + 0.5) / N)
console.error(`baja frecuencia (1 = ruido blanco): azul ${bajaFrecuencia(umbrales).toFixed(3)}, blanco ${bajaFrecuencia(blanco).toFixed(3)}`)
console.log(umbrales.map((u) => u.toFixed(4)).join(', '))
