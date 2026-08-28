/**
 * El mínimo común de los invariantes de S1.
 *
 * ── `controlPositivo` ──────────────────────────────────────────────────────
 *
 * Es la pieza que impide que una comprobación quede verde por vacío. Toma el
 * MISMO predicado que acaba de pasar y lo corre contra una entrada
 * deliberadamente equivocada: si ahí también pasa, el predicado no mide nada y
 * el invariante falla, aunque la afirmación real haya dado bien.
 *
 * No es ceremonia. En este mismo sprint, el primer comparador de tokens
 * comparaba el TEXTO de las reglas emitidas por Tailwind — y `.rounded-lg`
 * emite `border-radius: var(--radius-lg)` pase lo que pase con el valor, así
 * que un cambio de valor le pasaba por al lado sin que se notara. Lo cazó un
 * control positivo, no una relectura.
 */

let fallas = 0
let afirmaciones = 0

export function afirmar(condicion: boolean, descripcion: string, detalle?: string): void {
  afirmaciones += 1
  if (condicion) {
    console.log(`  ok   ${descripcion}${detalle ? `  — ${detalle}` : ''}`)
    return
  }
  fallas += 1
  console.error(`  FALLA ${descripcion}${detalle ? `  — ${detalle}` : ''}`)
}

export function afirmarIgual(actual: unknown, esperado: unknown, descripcion: string): void {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(esperado)
  afirmar(a === e, descripcion, a === e ? String(a) : `esperado ${e}, obtenido ${a}`)
}

/**
 * Corre el predicado contra una entrada que TIENE que hacerlo fallar.
 * Si no falla, el predicado está ciego y el invariante entero se cae.
 */
export function controlPositivo<T>(
  descripcion: string,
  entradaEquivocada: T,
  predicado: (entrada: T) => boolean,
): void {
  afirmaciones += 1
  let paso: boolean
  try {
    paso = predicado(entradaEquivocada)
  } catch {
    // Que el predicado tire contra una entrada equivocada también sirve: lo
    // que no puede es devolver "está bien".
    paso = false
  }
  if (!paso) {
    console.log(`  ok   [control positivo] ${descripcion}`)
    return
  }
  fallas += 1
  console.error(`  FALLA [control positivo] ${descripcion} — el predicado NO ve el error: está ciego`)
}

export function titulo(texto: string): void {
  console.log(`\n${texto}`)
}

export function cerrar(nombre: string): never {
  console.log(`\n${nombre}: ${afirmaciones} afirmaciones, ${fallas} fallas`)
  if (afirmaciones === 0) {
    console.error('FALLA: cero afirmaciones. Un invariante sin afirmaciones es verde por vacío.')
    process.exit(1)
  }
  process.exit(fallas === 0 ? 0 : 1)
}

/** Razón de contraste WCAG 2.x entre dos colores `#RRGGBB`. */
export function razonDeContraste(hexA: string, hexB: string): number {
  const luminancia = (hex: string): number => {
    const n = Number.parseInt(hex.slice(1), 16)
    const canal = (c: number): number => {
      const s = c / 255
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255)
  }
  const a = luminancia(hexA)
  const b = luminancia(hexB)
  const [alto, bajo] = a > b ? [a, b] : [b, a]
  return (alto + 0.05) / (bajo + 0.05)
}
