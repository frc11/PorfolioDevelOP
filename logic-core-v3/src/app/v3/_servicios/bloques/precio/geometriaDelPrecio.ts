/**
 * [SERVICIOS M2a] LA GEOMETRÍA DEL PRECIO EN DIAGONALES — pura (sin react ni next): una sola fuente para la página y para el test.
 *
 * Tres paneles que llenan la caja anclada (una pantalla) sin huecos ni encimados, separados por dos cortes paralelos, cada uno con UN
 * quiebre en zigzag. La Simple queda arriba a la izquierda, la Mediana al centro y la Premium abajo a la derecha (M0 §3.1).
 *
 * Las coordenadas van en unidades del contenedor (`cqw` y `cqh`: la caja anclada es un contenedor de tamaño), así la pendiente queda
 * en px por px y el ángulo es el mismo en cualquier caja de una orientación. Hay dos orientaciones, porque a 768 × 1024 un corte casi
 * vertical barre medio ancho de pantalla y deja regiones de 46 px para el texto (M0 §3.1, la tabla):
 *   · APAISADO: cortes «/» casi verticales (los del M0), con el quiebre abajo de la mitad para dejar arriba lugar al texto;
 *   · RETRATO: los mismos cortes transpuestos, casi horizontales y subiendo hacia la derecha; las regiones son tres bandas.
 *
 * `recorte()` da el polígono en CSS (lo que pinta la página); `puntos()` lo da en px para una caja (lo que mide el test). Las dos salen de
 * `cortes()`, que es el único lugar donde están las cuentas.
 */

export type Orientacion = 'apaisado' | 'retrato'
export type IndiceDePanel = 0 | 1 | 2

/**
 * Los parámetros, en fracciones de la caja.
 *   · `en`: dónde cae cada corte, medido sobre el eje que el corte atraviesa (el ancho en apaisado, el alto en retrato), al empezar el quiebre;
 *   · `pendiente`: cuánto se corre el corte por cada px que avanza (px por px);
 *   · `quiebre`: dónde está el quiebre a lo largo del corte, cuánto mide y cuánto se corre (el «zag», en contra de la pendiente).
 */
export interface ParametrosDeLosCortes {
  readonly en: readonly [number, number]
  readonly pendiente: number
  readonly quiebre: { readonly centro: number; readonly largo: number; readonly corrida: number }
}

export const PARAMETROS: Readonly<Record<Orientacion, ParametrosDeLosCortes>> = {
  apaisado: { en: [0.3, 0.7], pendiente: 0.3, quiebre: { centro: 0.62, largo: 0.08, corrida: 0.05 } },
  retrato: { en: [0.36, 0.71], pendiente: 0.15, quiebre: { centro: 0.3, largo: 0.06, corrida: 0.05 } },
}

/**
 * Un término lineal en las dos dimensiones de la caja: `w` fracciones del ancho más `h` fracciones del alto. Se evalúa en px para una
 * caja, o se escribe en CSS con `cqw` y `cqh`.
 */
export interface Termino {
  readonly w: number
  readonly h: number
}
export type Punto = readonly [Termino, Termino]

const t = (w: number, h: number): Termino => ({ w, h })
const mas = (a: Termino, b: Termino): Termino => t(a.w + b.w, a.h + b.h)

/** Los cuatro puntos de un corte, en orden a lo largo del corte: P0 (el borde de la caja), P1 y P2 (el quiebre) y P3 (el otro borde). */
export function cortes(orientacion: Orientacion, p: ParametrosDeLosCortes = PARAMETROS[orientacion]): readonly [readonly Punto[], readonly Punto[]] {
  const inicio = p.quiebre.centro - p.quiebre.largo / 2
  const fin = p.quiebre.centro + p.quiebre.largo / 2
  const uno = (en: number): Punto[] => {
    if (orientacion === 'apaisado') {
      // A lo largo del alto (y crece hacia abajo); el corte se va a la izquierda al bajar. El zag lo corre a la derecha.
      const xQuiebre = t(en, 0)
      const corrida = t(0, p.quiebre.corrida)
      return [
        [mas(xQuiebre, t(0, p.pendiente * inicio)), t(0, 0)],
        [xQuiebre, t(0, inicio)],
        [mas(xQuiebre, corrida), t(0, fin)],
        [mas(mas(xQuiebre, corrida), t(0, -p.pendiente * (1 - fin))), t(0, 1)],
      ]
    }
    // A lo largo del ancho (x crece a la derecha); el corte sube al ir a la derecha. El zag lo baja.
    const yQuiebre = t(0, en)
    const corrida = t(p.quiebre.corrida, 0)
    return [
      [t(0, 0), mas(yQuiebre, t(p.pendiente * inicio, 0))],
      [t(inicio, 0), yQuiebre],
      [t(fin, 0), mas(yQuiebre, corrida)],
      [t(1, 0), mas(mas(yQuiebre, corrida), t(-p.pendiente * (1 - fin), 0))],
    ]
  }
  return [uno(p.en[0]), uno(p.en[1])]
}

const ESQUINA = { nw: [t(0, 0), t(0, 0)], ne: [t(1, 0), t(0, 0)], se: [t(1, 0), t(0, 1)], sw: [t(0, 0), t(0, 1)] } as const satisfies Record<string, Punto>

/** El polígono de cada panel: la Simple, la Mediana y la Premium. */
export function poligono(orientacion: Orientacion, panel: IndiceDePanel, p: ParametrosDeLosCortes = PARAMETROS[orientacion]): readonly Punto[] {
  const [a, b] = cortes(orientacion, p)
  const ida = (c: readonly Punto[]): Punto[] => [...c]
  const vuelta = (c: readonly Punto[]): Punto[] => [...c].reverse()
  if (orientacion === 'apaisado') {
    if (panel === 0) return [ESQUINA.nw, ...ida(a), ESQUINA.sw]
    if (panel === 1) return [...ida(a).slice(0, 1), ...ida(b), ...vuelta(a).slice(0, 3)]
    return [b[0] as Punto, ESQUINA.ne, ESQUINA.se, ...vuelta(b).slice(0, 3)]
  }
  if (panel === 0) return [ESQUINA.nw, ESQUINA.ne, ...vuelta(a)]
  if (panel === 1) return [...ida(a), ...vuelta(b)]
  return [...ida(b), ESQUINA.se, ESQUINA.sw]
}

const redondo = (n: number): string => String(Number(n.toFixed(4)))

function enCss(termino: Termino): string {
  const partes = [termino.w !== 0 ? `${redondo(termino.w * 100)}cqw` : '', termino.h !== 0 ? `${redondo(termino.h * 100)}cqh` : ''].filter((x) => x !== '')
  if (partes.length === 0) return '0'
  if (partes.length === 1) return partes[0] ?? '0'
  return `calc(${partes.join(' + ').replace('+ -', '- ')})`
}

/** El `clip-path` de un panel, en unidades del contenedor. */
export function recorte(orientacion: Orientacion, panel: IndiceDePanel): string {
  return `polygon(${poligono(orientacion, panel).map(([x, y]) => `${enCss(x)} ${enCss(y)}`).join(', ')})`
}

/** El mismo polígono en px, para una caja de `ancho × alto`. */
export function puntos(orientacion: Orientacion, panel: IndiceDePanel, ancho: number, alto: number, p: ParametrosDeLosCortes = PARAMETROS[orientacion]): readonly (readonly [number, number])[] {
  const px = (termino: Termino): number => termino.w * ancho + termino.h * alto
  return poligono(orientacion, panel, p).map(([x, y]) => [px(x), px(y)] as const)
}

/** Si un punto cae adentro de un polígono (par-impar; el borde no cuenta, por eso la grilla del test evita los bordes). */
export function adentro(poligonoEnPx: readonly (readonly [number, number])[], x: number, y: number): boolean {
  let dentro = false
  for (let i = 0, j = poligonoEnPx.length - 1; i < poligonoEnPx.length; j = i++) {
    const [xi, yi] = poligonoEnPx[i] ?? [0, 0]
    const [xj, yj] = poligonoEnPx[j] ?? [0, 0]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro
  }
  return dentro
}

/**
 * DÓNDE VA EL TEXTO DE CADA PANEL: en la parte ancha de su región, al lado del corte, ESCALONADO: la Simple arriba, la Mediana al medio
 * y la Premium abajo, en las dos orientaciones. Cada caja se ancla a una esquina (`x` desde la izquierda o la derecha, `y` desde arriba
 * o abajo) y su `ancho` sale del corte que la limita, con un margen de 1rem al corte y 2rem al borde. La Mediana, además, tiene `alto`:
 * es su franja entera, con el texto centrado adentro (`justify-center`). Arriba se deja `TOPE` libre: la barra fija del sitio pasa por ahí.
 */
export interface CajaDelTexto {
  readonly x: { readonly lado: 'left' | 'right'; readonly valor: string }
  readonly y: { readonly lado: 'top' | 'bottom'; readonly valor: string }
  readonly ancho: string
  readonly alto: string | null
}

const TOPE = 0.16
const PIE = 0.06
/** La franja de la Mediana en apaisado, en fracciones del alto: centrada en la mitad de la caja, con lugar para su texto a 768 de alto. */
const FRANJA_DE_LA_MEDIANA = { desde: 0.3, hasta: 0.7 } as const

/** Un término lineal con rem: `w` fracciones del ancho, `h` del alto y `rem` rems. Se escribe en CSS o se mide en px (1rem = 16 px). */
interface Lineal {
  readonly w: number
  readonly h: number
  readonly rem: number
}
const lineal = (w: number, h: number, rem: number): Lineal => ({ w, h, rem })
const REM_EN_PX = 16

function cssLineal({ w, h, rem }: Lineal): string {
  const partes = [w !== 0 ? `${redondo(w * 100)}cqw` : '', h !== 0 ? `${redondo(h * 100)}cqh` : '', rem !== 0 ? `${redondo(rem)}rem` : ''].filter((x) => x !== '')
  if (partes.length === 0) return '0'
  if (partes.length === 1) return partes[0] ?? '0'
  return `calc(${partes.join(' + ').replace(/\+ -/g, '- ')})`
}
const enPx = ({ w, h, rem }: Lineal, ancho: number, alto: number): number => w * ancho + h * alto + rem * REM_EN_PX

interface CajaLineal {
  readonly x: { readonly lado: 'left' | 'right'; readonly valor: Lineal }
  readonly y: { readonly lado: 'top' | 'bottom'; readonly valor: Lineal }
  readonly ancho: Lineal
  readonly alto: Lineal | null
  /** La franja vertical para la que se calculó el ancho (donde el texto puede estar), desde arriba. */
  readonly franja: readonly [Lineal, Lineal]
}

/**
 * Apaisado: cuánto se corre un corte, en fracciones del alto, a la altura `y` (también en fracciones del alto). Arriba del quiebre se va a
 * la izquierda al bajar, en el quiebre el zag lo corre a la derecha, y abajo sigue yéndose a la izquierda: `cortes()`, leído en una altura.
 */
function corridaDelCorte(p: ParametrosDeLosCortes, y: number): number {
  const inicio = p.quiebre.centro - p.quiebre.largo / 2
  const fin = p.quiebre.centro + p.quiebre.largo / 2
  if (y <= inicio) return p.pendiente * (inicio - y)
  if (y <= fin) return (p.quiebre.corrida * (y - inicio)) / p.quiebre.largo
  return p.quiebre.corrida - p.pendiente * (y - fin)
}
/** Lo más a la derecha y lo más a la izquierda que llega un corte entre dos alturas (es lineal por tramos: basta mirar los vértices). */
function extremosDelCorte(p: ParametrosDeLosCortes, desde: number, hasta: number): { readonly max: number; readonly min: number } {
  const inicio = p.quiebre.centro - p.quiebre.largo / 2
  const fin = p.quiebre.centro + p.quiebre.largo / 2
  const alturas = [desde, hasta, ...[inicio, fin].filter((y) => y > desde && y < hasta)]
  const corridas = alturas.map((y) => corridaDelCorte(p, y))
  return { max: Math.max(...corridas), min: Math.min(...corridas) }
}

function cajaLineal(orientacion: Orientacion, panel: IndiceDePanel): CajaLineal {
  const p = PARAMETROS[orientacion]
  const [en1, en2] = p.en
  const s = p.pendiente
  const inicio = p.quiebre.centro - p.quiebre.largo / 2
  const fin = p.quiebre.centro + p.quiebre.largo / 2
  const j = p.quiebre.corrida
  const pie = lineal(0, 1 - PIE, 0)
  if (orientacion === 'apaisado') {
    // La Simple termina un 4 % antes de que empiece el quiebre; la Premium empieza un 2 % después de que termina.
    const pieArriba = inicio - 0.04
    const topePremium = fin + 0.02
    if (panel === 0) {
      return { x: { lado: 'left', valor: lineal(0, 0, 2) }, y: { lado: 'top', valor: lineal(0, TOPE, 0) }, ancho: lineal(en1, s * (inicio - pieArriba), -4), alto: null, franja: [lineal(0, TOPE, 0), lineal(0, pieArriba, 0)] }
    }
    if (panel === 1) {
      // La franja cruza el quiebre: la caja se aleja de lo más a la derecha que llega el primer corte y de lo más a la izquierda que llega
      // el segundo. El margen de 1rem se mide en perpendicular: sobre un corte inclinado, el borde de la caja corrido 1rem cruza el corte
      // 1rem·s más allá, así que se corre 1rem·(1 + s), más un cuarto de rem de holgura.
      const { desde, hasta } = FRANJA_DE_LA_MEDIANA
      const izquierda = extremosDelCorte(p, desde, hasta).max
      const derecha = extremosDelCorte(p, desde, hasta).min
      return {
        x: { lado: 'left', valor: lineal(en1, izquierda, 1.25 + s) },
        y: { lado: 'top', valor: lineal(0, desde, 0) },
        ancho: lineal(en2 - en1, derecha - izquierda, -2 * (1 + s) - 0.25),
        alto: lineal(0, hasta - desde, 0),
        franja: [lineal(0, desde, 0), lineal(0, hasta, 0)],
      }
    }
    return { x: { lado: 'right', valor: lineal(0, 0, 2) }, y: { lado: 'bottom', valor: lineal(0, PIE, 0) }, ancho: lineal(1 - en2, -(j - s * (topePremium - fin)), -(3 + s)), alto: null, franja: [lineal(0, topePremium, 0), pie] }
  }
  // Retrato: tres bandas. La Simple arriba a la izquierda, sobre el primer corte; la Mediana en la banda del medio, a la derecha del quiebre
  // y centrada entre los dos cortes; la Premium abajo a la derecha, debajo del segundo.
  if (panel === 0) {
    return { x: { lado: 'left', valor: lineal(0, 0, 2) }, y: { lado: 'top', valor: lineal(0, TOPE, 0) }, ancho: lineal(0.62, 0, -2), alto: null, franja: [lineal(0, TOPE, 0), lineal(0, en1, -1)] }
  }
  if (panel === 1) {
    // Arriba, el punto más bajo del primer corte sobre la caja (el fin del zag); abajo, el más alto del segundo (en el borde derecho).
    const tope = lineal(j, en1, 1.5)
    const base = lineal(j - s * (1 - fin), en2, -1.5)
    return { x: { lado: 'left', valor: lineal(fin, 0, 1.5) }, y: { lado: 'top', valor: tope }, ancho: lineal(1 - fin, 0, -3.5), alto: lineal(base.w - tope.w, base.h - tope.h, base.rem - tope.rem), franja: [tope, base] }
  }
  // La Premium arranca en x = 40 %: ahí el segundo corte está más bajo que en todo el resto de su ancho.
  return { x: { lado: 'right', valor: lineal(0, 0, 2) }, y: { lado: 'bottom', valor: lineal(0, PIE, 0) }, ancho: lineal(0.6, 0, -2), alto: null, franja: [lineal(j - s * (0.4 - fin), en2, 1), pie] }
}

export function caja(orientacion: Orientacion, panel: IndiceDePanel): CajaDelTexto {
  const c = cajaLineal(orientacion, panel)
  return {
    x: { lado: c.x.lado, valor: cssLineal(c.x.valor) },
    y: { lado: c.y.lado, valor: cssLineal(c.y.valor) },
    ancho: cssLineal(c.ancho),
    alto: c.alto === null ? null : cssLineal(c.alto),
  }
}

/** La franja vertical del texto de un panel en px, para una caja de `ancho × alto`: desde arriba, `[desde, hasta]`. */
export function franjaDelTexto(orientacion: Orientacion, panel: IndiceDePanel, ancho: number, alto: number): readonly [number, number] {
  const [desde, hasta] = cajaLineal(orientacion, panel).franja
  return [enPx(desde, ancho, alto), enPx(hasta, ancho, alto)]
}

/**
 * Por dónde entra cada panel: un tramo corto A LO LARGO de su corte, para que los bordes se deslicen sobre sí mismos. La Simple llega
 * desde arriba (o desde la izquierda en retrato) y las otras dos desde el otro lado. En unidades del contenedor, como el recorte.
 */
export function corrimiento(orientacion: Orientacion, panel: IndiceDePanel): { readonly x: string; readonly y: string } {
  const p = PARAMETROS[orientacion]
  const largo = Math.hypot(1, p.pendiente)
  const signo = panel === 0 ? -1 : 1
  const tramo = 10
  if (orientacion === 'apaisado') return { x: `${redondo((signo * -p.pendiente * tramo) / largo)}cqh`, y: `${redondo((signo * tramo) / largo)}cqh` }
  return { x: `${redondo((signo * tramo) / largo)}cqw`, y: `${redondo((signo * -p.pendiente * tramo) / largo)}cqw` }
}
