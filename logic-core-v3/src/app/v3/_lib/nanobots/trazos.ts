/**
 * [AJUSTES FINALES] A6 · LOS TRAZOS DEL ENJAMBRE — cómo se reparten los nanobots sobre las líneas de un símbolo para que el
 * trazo salga macizo y parejo: por LONGITUD DE ARCO. Hasta acá cada curva se muestreaba al azar en su parámetro (un ángulo,
 * una fracción) y el trazo salía a manchones: denso donde el parámetro corre despacio, ralo donde corre rápido (los flancos
 * de los dientes, los arcos de las esquinas) y con huecos al azar. Ahora cada trazo es una polilínea: se mide, los `n`
 * nanobots de un símbolo se reparten entre sus trazos en proporción a su largo, y sobre cada uno van a PASO CONSTANTE — la
 * misma distancia entre nanobots en todo el símbolo, o sea el mismo grosor de línea. Las superficies (un ojo, el relleno
 * de un nodo) se llenan parejas con la espiral del girasol (Fermat). Sin azar en el plano; sólo un espesor mínimo en z,
 * determinista, que da el brillo del pseudo-3D.
 */
export type Punto = [number, number, number, number]
export type Vertice = readonly [number, number] | readonly [number, number, number]
type Azar = () => number

/** Un trazo: su polilínea, el `w` que lleva cada nanobot (fijo, o según la fracción recorrida) y si se cierra sobre sí. */
export interface Trazo {
  readonly vertices: readonly Vertice[]
  readonly w: number | ((u: number) => number)
  /** Cerrado: el último vértice se une con el primero. */
  readonly cerrado?: boolean
}

/** Reparte `n` entre partes con estos pesos (la última se lleva el resto: suman exacto). */
export function repartir(n: number, pesos: readonly number[]): number[] {
  const total = pesos.reduce((s, p) => s + p, 0)
  const partes = pesos.map((p) => Math.floor((n * p) / total))
  partes[partes.length - 1] += n - partes.reduce((s, p) => s + p, 0)
  return partes
}

const z = (v: Vertice): number => v[2] ?? 0

interface Medido {
  readonly t: Trazo
  readonly vertices: readonly Vertice[]
  /** El largo acumulado hasta cada vértice. */
  readonly acumulado: readonly number[]
  readonly largo: number
}

function medir(t: Trazo): Medido {
  const vertices = t.cerrado ? [...t.vertices, t.vertices[0]] : t.vertices
  const acumulado = [0]
  for (let i = 1; i < vertices.length; i += 1) {
    const [a, b] = [vertices[i - 1], vertices[i]]
    acumulado.push(acumulado[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], z(b) - z(a)))
  }
  return { t, vertices, acumulado, largo: acumulado[acumulado.length - 1] }
}

/** El punto a la fracción `u` del LARGO de la polilínea (no de sus vértices). */
function enLaPolilinea(m: Medido, u: number): [number, number, number] {
  const d = u * m.largo
  let k = 1
  while (k < m.acumulado.length - 1 && m.acumulado[k] < d) k += 1
  const [a, b] = [m.vertices[k - 1], m.vertices[k]]
  const tramo = m.acumulado[k] - m.acumulado[k - 1]
  const f = tramo > 0 ? (d - m.acumulado[k - 1]) / tramo : 0
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, z(a) + (z(b) - z(a)) * f]
}

/** `n` nanobots sobre los trazos: a cada uno los que le tocan por su largo, a paso constante. Da EXACTAMENTE `n`. */
export function trazar(trazos: readonly Trazo[], n: number, espesor: number, azar: Azar): Punto[] {
  const medidos = trazos.map(medir)
  const cuantos = repartir(n, medidos.map((m) => m.largo))
  const puntos: Punto[] = []
  medidos.forEach((m, i) => {
    const w = m.t.w
    for (let k = 0; k < cuantos[i]; k += 1) {
      // Medio paso en cada punta: un trazo cerrado no repite su arranque y dos trazos que se tocan no se encima.
      const u = (k + 0.5) / cuantos[i]
      const [x, y, profundidad] = enLaPolilinea(m, u)
      puntos.push([x, y, profundidad + (azar() - 0.5) * espesor, typeof w === 'function' ? w(u) : w])
    }
  })
  return puntos
}

/** Una curva cerrada muestreada en `lados` vértices (el parámetro va de 0 a 2π). */
export function curva(f: (a: number) => Vertice, lados: number): Vertice[] {
  return Array.from({ length: lados }, (_, i) => f((i / lados) * 2 * Math.PI))
}

export function circulo(cx: number, cy: number, r: number, lados = 64, profundidad = 0): Vertice[] {
  return curva((a) => [cx + r * Math.cos(a), cy + r * Math.sin(a), profundidad], lados)
}

/** Un rectángulo redondeado (centro, medio ancho y medio alto, radio): sus cuatro arcos, en sentido antihorario desde la derecha. */
export function rectanguloRedondeado(cx: number, cy: number, mx: number, my: number, r: number, porEsquina = 10): Vertice[] {
  const centros = [[cx + mx - r, cy + my - r], [cx - mx + r, cy + my - r], [cx - mx + r, cy - my + r], [cx + mx - r, cy - my + r]]
  const vertices: Vertice[] = []
  centros.forEach(([ex, ey], e) => {
    for (let i = 0; i <= porEsquina; i += 1) {
      const a = (e + i / porEsquina) * (Math.PI / 2)
      vertices.push([ex + r * Math.cos(a), ey + r * Math.sin(a)])
    }
  })
  return vertices
}

/** Una superficie llena pareja: `cuantos` nanobots en la espiral del girasol dentro del círculo. */
export function disco(cx: number, cy: number, r: number, cuantos: number, w: number, profundidad = 0): Punto[] {
  const DORADO = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: cuantos }, (_, i) => {
    const rr = r * Math.sqrt((i + 0.5) / cuantos)
    const a = i * DORADO
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a), profundidad, w]
  })
}
