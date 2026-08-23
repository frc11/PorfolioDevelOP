import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * LA TINTA DEL LOGO, RASTERIZADA — para poder medir qué fracción del cuadro cubre
 * de verdad y no cuánto mide la caja que la contiene.
 *
 * S10 necesitaba contestar "qué fracción del cuadro queda en tinta" sin los
 * planos, y la respuesta con la caja del logo habría estado 2,3 veces de más: la
 * marca llena el **42,8%** de su propia caja. Así que se aplana el `path` real y
 * se lo rasteriza una vez.
 *
 * **Es un solo subpath cerrado** (un `M`, un `z`), así que aplanarlo da un
 * polígono simple y el test de cruce alcanza. Comandos presentes: `M v q l a c A
 * H z`.
 *
 * **Verificado contra una medición independiente:** la caja que sale de acá tiene
 * que dar EXACTAMENTE `LOGO_INK_VIEWBOX` (`ui/LogoMark.tsx`), que S8b midió por
 * otro camino. Lo comprueba `s10-escena.invariant.ts` — un arco mal
 * parametrizado correría la caja y el chequeo lo vería.
 */

export type Point = { x: number; y: number }

function readPath(): string {
  const source = readFileSync(join(process.cwd(), 'src/components/ui/LogoMark.tsx'), 'utf8')
  // `[\s\S]` y no la flag `s`: el target de este repo es anterior a ES2018.
  const match = source.match(/export const LOGO_PATH_D =[\s\S]*?'([^']*)'/)
  if (!match) throw new Error('no se encontró LOGO_PATH_D en ui/LogoMark.tsx')
  return match[1]
}


function tokenize(d: string): (string | number)[] {
  const out: (string | number)[] = []
  const pattern = /([MmLlHhVvCcSsQqTtAaZz])|(-?\d*\.?\d+(?:e-?\d+)?)/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(d)) !== null) {
    out.push(match[1] !== undefined ? match[1] : Number(match[2]))
  }
  return out
}

/** Muestras por segmento curvo. El mismo número que usó la medición de S8b. */
const CURVE_STEPS = 400
function cubic(p0: Point, p1: Point, p2: Point, p3: Point, out: Point[]): void {
  for (let i = 1; i <= CURVE_STEPS; i += 1) {
    const t = i / CURVE_STEPS
    const u = 1 - t
    out.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    })
  }
}

function quadratic(p0: Point, p1: Point, p2: Point, out: Point[]): void {
  for (let i = 1; i <= CURVE_STEPS; i += 1) {
    const t = i / CURVE_STEPS
    const u = 1 - t
    out.push({ x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y })
  }
}

/** Arco elíptico por la parametrización de CENTRO de la spec de SVG. */
function ellipticalArc(
  p0: Point,
  rxIn: number,
  ryIn: number,
  rotationDeg: number,
  largeArc: boolean,
  sweep: boolean,
  p1: Point,
  out: Point[]
): void {
  const phi = (rotationDeg * Math.PI) / 180
  const cosPhi = Math.cos(phi)
  const sinPhi = Math.sin(phi)
  const dx = (p0.x - p1.x) / 2
  const dy = (p0.y - p1.y) / 2
  const x1 = cosPhi * dx + sinPhi * dy
  const y1 = -sinPhi * dx + cosPhi * dy

  let rx = Math.abs(rxIn)
  let ry = Math.abs(ryIn)
  const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry)
  if (lambda > 1) {
    const scale = Math.sqrt(lambda)
    rx *= scale
    ry *= scale
  }

  const numerator = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1
  const denominator = rx * rx * y1 * y1 + ry * ry * x1 * x1
  const factor = (largeArc !== sweep ? 1 : -1) * Math.sqrt(Math.max(0, numerator / denominator))
  const cxp = (factor * rx * y1) / ry
  const cyp = (-factor * ry * x1) / rx
  const cx = cosPhi * cxp - sinPhi * cyp + (p0.x + p1.x) / 2
  const cy = sinPhi * cxp + cosPhi * cyp + (p0.y + p1.y) / 2

  const angle = (ux: number, uy: number, vx: number, vy: number) => {
    const sign = ux * vy - uy * vx < 0 ? -1 : 1
    const cos = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy))
    return sign * Math.acos(Math.min(1, Math.max(-1, cos)))
  }

  const start = angle(1, 0, (x1 - cxp) / rx, (y1 - cyp) / ry)
  let delta = angle((x1 - cxp) / rx, (y1 - cyp) / ry, (-x1 - cxp) / rx, (-y1 - cyp) / ry)
  if (!sweep && delta > 0) delta -= 2 * Math.PI
  if (sweep && delta < 0) delta += 2 * Math.PI

  for (let i = 1; i <= CURVE_STEPS; i += 1) {
    const t = start + (delta * i) / CURVE_STEPS
    out.push({
      x: cx + rx * Math.cos(t) * cosPhi - ry * Math.sin(t) * sinPhi,
      y: cy + rx * Math.cos(t) * sinPhi + ry * Math.sin(t) * cosPhi,
    })
  }
}

/** El contorno de la tinta, en unidades del viewBox de 1024 (Y hacia abajo). */
export function flattenLogoPath(): Point[] {
  const tokens = tokenize(readPath())
  const points: Point[] = []
  let index = 0
  let current: Point = { x: 0, y: 0 }
  let start: Point = { x: 0, y: 0 }
  let command = ''

  const next = () => tokens[index++] as number

  while (index < tokens.length) {
    if (typeof tokens[index] === 'string') command = tokens[index++] as string

    switch (command) {
      // Un `M` con más pares implícitos se lee como `L`, que es la spec.
      case 'M':
        current = { x: next(), y: next() }
        start = { ...current }
        points.push({ ...current })
        command = 'L'
        break
      case 'L':
        current = { x: next(), y: next() }
        points.push({ ...current })
        break
      case 'l':
        current = { x: current.x + next(), y: current.y + next() }
        points.push({ ...current })
        break
      case 'H':
      case 'h':
        current = { x: command === 'H' ? next() : current.x + next(), y: current.y }
        points.push({ ...current })
        break
      case 'V':
      case 'v':
        current = { x: current.x, y: command === 'V' ? next() : current.y + next() }
        points.push({ ...current })
        break
      case 'c': {
        const c1 = { x: current.x + next(), y: current.y + next() }
        const c2 = { x: current.x + next(), y: current.y + next() }
        const end = { x: current.x + next(), y: current.y + next() }
        cubic(current, c1, c2, end, points)
        current = end
        break
      }
      case 'C': {
        const c1 = { x: next(), y: next() }
        const c2 = { x: next(), y: next() }
        const end = { x: next(), y: next() }
        cubic(current, c1, c2, end, points)
        current = end
        break
      }
      case 'q': {
        const c1 = { x: current.x + next(), y: current.y + next() }
        const end = { x: current.x + next(), y: current.y + next() }
        quadratic(current, c1, end, points)
        current = end
        break
      }
      case 'Q': {
        const c1 = { x: next(), y: next() }
        const end = { x: next(), y: next() }
        quadratic(current, c1, end, points)
        current = end
        break
      }
      case 'a': {
        const rx = next()
        const ry = next()
        const rotation = next()
        const large = next() !== 0
        const sweep = next() !== 0
        const end = { x: current.x + next(), y: current.y + next() }
        ellipticalArc(current, rx, ry, rotation, large, sweep, end, points)
        current = end
        break
      }
      case 'A': {
        const rx = next()
        const ry = next()
        const rotation = next()
        const large = next() !== 0
        const sweep = next() !== 0
        const end = { x: next(), y: next() }
        ellipticalArc(current, rx, ry, rotation, large, sweep, end, points)
        current = end
        break
      }
      case 'z':
      case 'Z':
        points.push({ ...start })
        current = { ...start }
        break
      default:
        throw new Error(`comando de path no soportado: ${command}`)
    }
  }

  return points
}

export type LogoMask = {
  /** La caja de la tinta en el viewBox de 1024, y qué fracción de ella es tinta. */
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly fill: number
  /** ¿Hay tinta en (u, v) de la caja? `v` va hacia ABAJO, como el SVG. */
  at(u: number, v: number): boolean
}

/**
 * Rasteriza el contorno por cruce de rayo horizontal, fila por fila. Con un
 * subpath simple y cerrado, las intersecciones ordenadas se emparejan de a dos y
 * el interior queda entre pares.
 */
export function buildLogoMask(columns = 1024): LogoMask {
  const polygon = flattenLogoPath()
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const point of polygon) {
    if (point.x < minX) minX = point.x
    if (point.x > maxX) maxX = point.x
    if (point.y < minY) minY = point.y
    if (point.y > maxY) maxY = point.y
  }

  const width = maxX - minX
  const height = maxY - minY
  const rows = Math.max(1, Math.round((columns * height) / width))
  const bits = new Uint8Array(columns * rows)
  const crossings: number[] = []
  let inked = 0
  for (let row = 0; row < rows; row += 1) {
    const y = minY + ((row + 0.5) / rows) * height
    crossings.length = 0
    for (let k = 0; k + 1 < polygon.length; k += 1) {
      const a = polygon[k]
      const b = polygon[k + 1]
      if (a.y === b.y) continue
      if (y < Math.min(a.y, b.y) || y >= Math.max(a.y, b.y)) continue
      crossings.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x))
    }
    crossings.sort((p, q) => p - q)
    for (let k = 0; k + 1 < crossings.length; k += 2) {
      const from = Math.max(0, Math.ceil(((crossings[k] - minX) / width) * columns - 0.5))
      const to = Math.min(columns - 1, Math.floor(((crossings[k + 1] - minX) / width) * columns - 0.5))
      for (let column = from; column <= to; column += 1) {
        if (bits[row * columns + column] === 1) continue
        bits[row * columns + column] = 1
        inked += 1
      }
    }
  }

  return {
    x: minX,
    y: minY,
    width,
    height,
    fill: inked / (columns * rows),
    at(u, v) {
      if (u < 0 || u >= 1 || v < 0 || v >= 1) return false
      const column = Math.min(columns - 1, Math.floor(u * columns))
      const row = Math.min(rows - 1, Math.floor(v * rows))
      return bits[row * columns + column] === 1
    },
  }
}
