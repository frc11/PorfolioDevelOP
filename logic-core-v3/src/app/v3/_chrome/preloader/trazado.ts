/**
 * [B12c] EL TRAZADO DE LA FLECHA — puro: de la caja de la frase y la del botón del sonido (las reales, medidas en el cliente) a un
 * camino. Sale de alrededor de la frase (la rodea por abajo), hace un rizo a mitad de camino y termina en el borde del botón, apuntando a
 * su centro: la punta queda EXACTAMENTE donde está el botón (el disco), sin dibujarlo. `s78-preloader` lo prueba a 1440, 1024 y 390.
 *
 * Se arma con puntos de paso y una Catmull-Rom (uniforme) pasada a cúbicas: continua en la tangente, y la del final es la dirección de la
 * punta (el último tramo va derecho al centro del botón).
 */
export interface Punto {
  readonly x: number
  readonly y: number
}

export interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

export interface Trazado {
  /** El atributo `d` del camino. */
  readonly d: string
  readonly puntos: readonly Punto[]
  /** Dónde termina (en el borde del botón) y hacia dónde apunta (unitario, hacia el centro). */
  readonly punta: Punto
  readonly direccion: Punto
  /** El centro del botón y su radio (el disco). */
  readonly centro: Punto
  readonly radio: number
}

export const TRAZADO = {
  /** Lo más cerca que pasa de un borde de la ventana (px). */
  margen: 12,
  /** El aire con la frase: una parte del lado corto de la ventana, entre dos topes (px). */
  aire: { parte: 0.035, min: 12, max: 28 },
  /** El radio del rizo, igual. */
  rizo: { parte: 0.07, min: 18, max: 44 },
  /** Cuánto se cruza el rizo consigo mismo (en radios). */
  cruce: 0.25,
  /** El último tramo derecho antes de la punta (px como mucho). */
  recta: 60,
} as const

const acotar = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v))
const mas = (a: Punto, b: Punto): Punto => ({ x: a.x + b.x, y: a.y + b.y })
const menos = (a: Punto, b: Punto): Punto => ({ x: a.x - b.x, y: a.y - b.y })
const por = (a: Punto, k: number): Punto => ({ x: a.x * k, y: a.y * k })
const largo = (a: Punto): number => Math.hypot(a.x, a.y)
const unitario = (a: Punto): Punto => {
  const l = largo(a)
  return l === 0 ? { x: 0, y: -1 } : por(a, 1 / l)
}

/** El centro y el radio del disco del botón (redondo: la mitad del lado corto). */
export const discoDelBoton = (b: Caja): { readonly centro: Punto; readonly radio: number } => ({ centro: { x: b.x + b.ancho / 2, y: b.y + b.alto / 2 }, radio: Math.min(b.ancho, b.alto) / 2 })

/** Catmull-Rom uniforme a cúbicas: `M … C …`, con un decimal. */
export function caminoPorLosPuntos(p: readonly Punto[]): string {
  const f = (v: number): string => v.toFixed(1)
  if (p.length === 0) return ''
  let d = `M ${f(p[0].x)} ${f(p[0].y)}`
  for (let i = 0; i < p.length - 1; i += 1) {
    const p0 = p[Math.max(0, i - 1)]
    const p1 = p[i]
    const p2 = p[i + 1]
    const p3 = p[Math.min(p.length - 1, i + 2)]
    const c1 = mas(p1, por(menos(p2, p0), 1 / 6))
    const c2 = menos(p2, por(menos(p3, p1), 1 / 6))
    d += ` C ${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`
  }
  return d
}

export function trazarLaFlecha(frase: Caja, boton: Caja, ventana: { readonly ancho: number; readonly alto: number }): Trazado {
  const { margen } = TRAZADO
  const corto = Math.min(ventana.ancho, ventana.alto)
  const adentro = (q: Punto): Punto => ({ x: acotar(q.x, margen, ventana.ancho - margen), y: acotar(q.y, margen, ventana.alto - margen) })
  const g = acotar(TRAZADO.aire.parte * corto, TRAZADO.aire.min, TRAZADO.aire.max)
  const cx = frase.x + frase.ancho / 2
  const cy = frase.y + frase.alto / 2
  const abajo = frase.y + frase.alto
  // Rodea la frase por abajo, de derecha a izquierda, y sale por su costado izquierdo.
  const w0 = adentro({ x: cx + 0.32 * frase.ancho, y: abajo + g })
  const w1 = adentro({ x: cx - 0.05 * frase.ancho, y: abajo + 1.5 * g })
  const w2 = adentro({ x: frase.x - g, y: cy + 0.15 * frase.alto })
  const { centro, radio } = discoDelBoton(boton)
  // El rizo, a mitad de camino hacia el botón, del lado que da al centro de la ventana (no se sale del cuadro).
  const hacia = menos(centro, w2)
  const u = unitario(hacia)
  const base = mas(w2, por(u, 0.45 * largo(hacia)))
  const normal = { x: -u.y, y: u.x }
  const alCentro = menos({ x: ventana.ancho / 2, y: ventana.alto / 2 }, base)
  const n = normal.x * alCentro.x + normal.y * alCentro.y >= 0 ? normal : por(normal, -1)
  const rho = Math.min(acotar(TRAZADO.rizo.parte * corto, TRAZADO.rizo.min, TRAZADO.rizo.max), 0.2 * largo(hacia))
  const k = mas(base, por(n, rho))
  const cruce = por(u, TRAZADO.cruce * rho)
  const sale = adentro(mas(base, cruce))
  const rizo = [menos(base, cruce), mas(k, por(u, rho)), mas(k, por(n, rho)), menos(k, por(u, rho))].map(adentro)
  // La punta: en el borde del disco, apuntando a su centro; antes, un tramo derecho.
  const direccion = unitario(menos(centro, sale))
  const punta = menos(centro, por(direccion, radio))
  const recta = Math.min(TRAZADO.recta, 0.18 * largo(menos(punta, sale)))
  const antes = menos(punta, por(direccion, recta))
  const puntos = [w0, w1, w2, ...rizo, sale, antes, punta]
  return { d: caminoPorLosPuntos(puntos), puntos, punta, direccion, centro, radio }
}
