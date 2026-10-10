/**
 * [PULIDO 10] J1 · LOS SOLAPES — pura: entre las cajas de texto del reposo de una sección (las del DOM que se ven y las de los
 * títulos en volumen) y contra la silueta proyectada del logo. La usan el banco (`pulido-10/_scripts/solapes.ts`, que mide en
 * el navegador) y `s61` (que lee sus recibos y prueba el detector con un solape puesto).
 *
 * - Dos cajas de GRUPOS distintos (dos bloques de texto) que se cruzan más de `tolerancia` px en los dos ejes: un solape. Los
 *   renglones de un mismo bloque no cuentan (un interlineado ajustado los toca).
 * - Una caja con alguna celda de la silueta del logo adentro (la caja achicada `tolerancia` px por lado): un solape con el logo.
 */
export interface Caja {
  readonly id: string
  readonly grupo: string
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

export interface Silueta {
  readonly celda: number
  readonly cols: number
  readonly filas: number
  readonly ocupadas: readonly number[]
}

export interface Solape {
  readonly tipo: 'texto' | 'logo'
  readonly a: string
  readonly b: string
  readonly area: number
}

export const TOLERANCIA_DE_SOLAPE = 2

export function solapesDe(cajas: readonly Caja[], silueta: Silueta | null, tolerancia: number = TOLERANCIA_DE_SOLAPE): Solape[] {
  const salida: Solape[] = []
  for (let i = 0; i < cajas.length; i += 1) {
    for (let j = i + 1; j < cajas.length; j += 1) {
      const [a, b] = [cajas[i], cajas[j]]
      if (a.grupo === b.grupo) continue
      const dx = Math.min(a.x + a.ancho, b.x + b.ancho) - Math.max(a.x, b.x)
      const dy = Math.min(a.y + a.alto, b.y + b.alto) - Math.max(a.y, b.y)
      if (dx > tolerancia && dy > tolerancia) salida.push({ tipo: 'texto', a: a.id, b: b.id, area: Math.round(dx * dy) })
    }
  }
  if (silueta === null) return salida
  const ocupada = new Set(silueta.ocupadas)
  for (const c of cajas) {
    const [x0, x1, y0, y1] = [c.x + tolerancia, c.x + c.ancho - tolerancia, c.y + tolerancia, c.y + c.alto - tolerancia]
    if (x1 <= x0 || y1 <= y0) continue
    let n = 0
    const [c0, c1] = [Math.max(0, Math.floor(x0 / silueta.celda)), Math.min(silueta.cols - 1, Math.floor(x1 / silueta.celda))]
    const [f0, f1] = [Math.max(0, Math.floor(y0 / silueta.celda)), Math.min(silueta.filas - 1, Math.floor(y1 / silueta.celda))]
    for (let f = f0; f <= f1; f += 1) {
      for (let k = c0; k <= c1; k += 1) {
        const [cx, cy] = [(k + 0.5) * silueta.celda, (f + 0.5) * silueta.celda]
        if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1 && ocupada.has(f * silueta.cols + k)) n += 1
      }
    }
    if (n > 0) salida.push({ tipo: 'logo', a: c.id, b: 'logo', area: n * silueta.celda * silueta.celda })
  }
  return salida
}
