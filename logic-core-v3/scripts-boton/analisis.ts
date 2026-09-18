/**
 * EL ANÁLISIS — de la serie por cuadro a las respuestas de los cinco pasos.
 *
 * Vive aparte de los dos conductores por una razón de método: la medición
 * cuesta una navegación y el análisis no cuesta nada, así que el crudo se
 * guarda entero y **se puede volver a analizar sin volver a entrar al sitio**.
 * Todo lo que este archivo hace se puede rehacer sobre el JSON que ya está en
 * disco.
 *
 * ── Las cuatro operaciones ────────────────────────────────────────────────
 *
 *   1. **Anclar.** Los tiempos no valen contra el reloj del conductor —una
 *      llamada de CDP cuesta milisegundos que no son del sitio—: valen contra
 *      el `mouseenter` y el `mouseleave` que la PÁGINA despachó. Los dos
 *      quedaron grabados en la misma serie.
 *   2. **Partir en tramos.** Una propiedad que cambia cuadro a cuadro y después
 *      se queda quieta define un tramo: primer cambio, último cambio, duración.
 *      Dos tramos separados por un hueco de más de `HUECO_MS` son dos gestos.
 *   3. **Descomponer.** Una `matrix()` no dice nada; su giro, su escala y su
 *      traslación sí. Y una escala en X con su origen y su ancho dicen QUÉ
 *      TRAMO DEL PÍXEL se pinta, que es la pregunta del subrayado.
 *   4. **Contrastar la curva.** La curva declarada se evalúa en cada instante
 *      medido y se compara con el avance observado. Una curva que se cita sin
 *      esto es una transcripción; con esto es una medición.
 */

import type { Grabacion, NodoEstatico, SerieDeNodo } from './pagina-de-boton'

/** Dos cambios separados por más que esto son dos tramos distintos. */
export const HUECO_MS = 120

export interface Anclas {
  readonly entradas: readonly number[]
  readonly salidas: readonly number[]
}

/**
 * Los instantes en que la PÁGINA vio entrar y salir el puntero.
 *
 * Se toman los eventos del elemento raíz (`mouseenter` / `mouseleave` sin el
 * sufijo `:hijo`), porque los de los hijos se disparan de más: el rollover
 * mueve las dos copias y el elemento que está bajo el cursor cambia sin que el
 * cursor se mueva — en la referencia eso produjo un `pointerout` a los 496 ms
 * del hover con el puntero quieto.
 */
export function anclasDe(g: Grabacion): Anclas {
  return {
    entradas: g.eventos.filter((e) => e.tipo === 'mouseenter').map((e) => e.t),
    salidas: g.eventos.filter((e) => e.tipo === 'mouseleave').map((e) => e.t),
  }
}

export interface Tramo {
  readonly desde: number
  readonly hasta: number
  readonly duracion: number
  readonly valorInicial: string
  readonly valorFinal: string
  readonly muestras: number
}

/** Parte una serie de cambios en tramos. El primer valor de la serie es el reposo. */
export function tramosDe(cambios: readonly (readonly [number, string])[], hueco = HUECO_MS): readonly Tramo[] {
  if (cambios.length <= 1) return []
  const salida: Tramo[] = []
  let ini = 1
  for (let i = 2; i <= cambios.length; i += 1) {
    const corta = i === cambios.length || cambios[i][0] - cambios[i - 1][0] > hueco
    if (!corta) continue
    salida.push({
      desde: cambios[ini][0],
      hasta: cambios[i - 1][0],
      duracion: Math.round((cambios[i - 1][0] - cambios[ini][0]) * 10) / 10,
      valorInicial: cambios[ini - 1][1],
      valorFinal: cambios[i - 1][1],
      muestras: i - ini,
    })
    ini = i
  }
  return salida
}

export interface Matriz {
  readonly a: number
  readonly b: number
  readonly c: number
  readonly d: number
  readonly e: number
  readonly f: number
}

export function leerMatriz(valor: string): Matriz | null {
  if (valor === 'none') return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
  const m = /^matrix\(([^)]+)\)$/.exec(valor.trim())
  if (m === null) return null
  const n = m[1].split(',').map((x) => Number(x.trim()))
  if (n.length !== 6 || n.some((x) => !Number.isFinite(x))) return null
  return { a: n[0], b: n[1], c: n[2], d: n[3], e: n[4], f: n[5] }
}

export interface Descompuesta {
  readonly escalaX: number
  readonly escalaY: number
  readonly giroGrados: number
  readonly x: number
  readonly y: number
}

/** Descomposición estándar de una matriz 2D: escala, giro y traslación. */
export function descomponer(m: Matriz): Descompuesta {
  const escalaX = Math.hypot(m.a, m.b)
  const giro = Math.atan2(m.b, m.a)
  const det = m.a * m.d - m.b * m.c
  const escalaY = escalaX === 0 ? Math.hypot(m.c, m.d) : det / escalaX
  return {
    escalaX: Math.round(escalaX * 1e6) / 1e6,
    escalaY: Math.round(escalaY * 1e6) / 1e6,
    giroGrados: Math.round(((giro * 180) / Math.PI) * 1e4) / 1e4,
    x: Math.round(m.e * 1e4) / 1e4,
    y: Math.round(m.f * 1e4) / 1e4,
  }
}

/** Evalúa una cúbica de Bézier de CSS: dado el avance de TIEMPO, el de VALOR. */
export function bezier(x1: number, y1: number, x2: number, y2: number, t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  const bx = (u: number): number => 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u ** 2 * x2 + u ** 3
  const by = (u: number): number => 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u ** 2 * y2 + u ** 3
  let lo = 0
  let hi = 1
  for (let i = 0; i < 60; i += 1) {
    const mid = (lo + hi) / 2
    if (bx(mid) < t) lo = mid
    else hi = mid
  }
  return by((lo + hi) / 2)
}

export function leerCurva(curva: string): readonly [number, number, number, number] | null {
  const t = curva.trim()
  if (t === 'ease') return [0.25, 0.1, 0.25, 1]
  if (t === 'linear') return [0, 0, 1, 1]
  if (t === 'ease-in') return [0.42, 0, 1, 1]
  if (t === 'ease-out') return [0, 0, 0.58, 1]
  if (t === 'ease-in-out') return [0.42, 0, 0.58, 1]
  const m = /^cubic-bezier\(([^)]+)\)$/.exec(t)
  if (m === null) return null
  const n = m[1].split(',').map((x) => Number(x.trim()))
  if (n.length !== 4 || n.some((x) => !Number.isFinite(x))) return null
  return [n[0], n[1], n[2], n[3]]
}

export interface ContrasteDeCurva {
  readonly muestras: number
  readonly desvioMaximo: number
  readonly desvioMedio: number
  /** Cuánto DESPUÉS del evento arrancó de verdad la transición, en ms. */
  readonly arranqueRelativo: number
  readonly enCuartos: readonly { readonly t: number; readonly observado: number; readonly esperado: number }[]
}

/**
 * La curva declarada, contrastada contra el avance observado.
 *
 * `avance` convierte el valor crudo en un número entre 0 y 1 (0 = reposo,
 * 1 = final). El desvío máximo se publica siempre: es la única forma de
 * distinguir «la curva es ésta» de «la curva dice ser ésta».
 *
 * ── ⚠️ POR QUÉ EL ARRANQUE ES UNA INCÓGNITA Y NO EL EVENTO ────────────────
 *
 * La transición no empieza cuando la página despacha `mouseenter`: empieza en
 * el primer recálculo de estilo posterior, que cae en el cuadro siguiente. Con
 * el evento como origen, el mismo dato que ajusta perfecto da un desvío de
 * 0,18 sobre una curva de 700 ms — y ese 0,18 se leería como «la curva no es
 * la declarada», que es falso. Acá el arranque se BUSCA en una ventana de
 * ±120 ms y se publica: deja de ser un error escondido y pasa a ser una cifra
 * del reporte, la latencia entre el evento y el primer cuadro animado.
 */
export function contrastarCurva(
  cambios: readonly (readonly [number, string])[],
  t0: number,
  duracionMs: number,
  retardoMs: number,
  curva: string,
  avance: (valor: string) => number | null,
): ContrasteDeCurva | null {
  const puntos = leerCurva(curva)
  if (puntos === null) return null
  const evaluar = (origen: number): { desvios: number[]; us: number[]; obs: number[]; esp: number[]; ts: number[] } => {
    const desvios: number[] = []
    const us: number[] = []
    const obs: number[] = []
    const esp: number[] = []
    const ts: number[] = []
    for (const [t, valor] of cambios) {
      const u = (t - origen - retardoMs) / duracionMs
      if (u < 0 || u > 1) continue
      const o = avance(valor)
      if (o === null) continue
      const e = bezier(puntos[0], puntos[1], puntos[2], puntos[3], u)
      desvios.push(Math.abs(o - e))
      us.push(u)
      obs.push(o)
      esp.push(e)
      ts.push(t - origen)
    }
    return { desvios, us, obs, esp, ts }
  }
  let mejor = t0
  let mejorDesvio = Number.POSITIVE_INFINITY
  for (let d = -20; d <= 120; d += 1) {
    const r = evaluar(t0 + d)
    if (r.desvios.length < 5) continue
    const max = Math.max(...r.desvios)
    if (max < mejorDesvio) {
      mejorDesvio = max
      mejor = t0 + d
    }
  }
  const r = evaluar(mejor)
  if (r.desvios.length === 0) return null
  const enCuartos: { t: number; observado: number; esperado: number }[] = []
  for (const objetivo of [0.25, 0.5, 0.75]) {
    let k = -1
    for (let i = 0; i < r.us.length; i += 1) if (r.us[i] >= objetivo && k < 0) k = i
    if (k >= 0) {
      enCuartos.push({
        t: Math.round(r.ts[k] * 10) / 10,
        observado: Math.round(r.obs[k] * 1e4) / 1e4,
        esperado: Math.round(r.esp[k] * 1e4) / 1e4,
      })
    }
  }
  return {
    muestras: r.desvios.length,
    desvioMaximo: Math.round(Math.max(...r.desvios) * 1e4) / 1e4,
    desvioMedio: Math.round((r.desvios.reduce((a, b) => a + b, 0) / r.desvios.length) * 1e4) / 1e4,
    arranqueRelativo: Math.round((mejor - t0) * 10) / 10,
    enCuartos,
  }
}

/**
 * EL AVANCE DE UNA TRANSFORMADA — por su componente que MÁS se mueve.
 *
 * Una `matrix()` del rollover cambia giro, escala y traslación a la vez, y
 * `a` —que es `cos θ · escala`— recorre de 1 a 0,9945 en todo el gesto: usarla
 * de avance es medir el ruido. Se elige la componente con mayor recorrido entre
 * el valor inicial y el final, y se normaliza con ella.
 */
export function avanceDeTransformada(
  valorInicial: string,
  valorFinal: string,
): ((valor: string) => number | null) | null {
  const m0 = leerMatriz(valorInicial)
  const m1 = leerMatriz(valorFinal)
  if (m0 === null || m1 === null) return null
  const d0 = descomponer(m0)
  const d1 = descomponer(m1)
  const ejes: readonly (keyof Descompuesta)[] = ['escalaX', 'giroGrados', 'x', 'y']
  let eje: keyof Descompuesta = 'escalaX'
  let mayor = -1
  for (const e of ejes) {
    const r = Math.abs(d1[e] - d0[e])
    if (r > mayor) {
      mayor = r
      eje = e
    }
  }
  if (mayor < 1e-6) return null
  const a = d0[eje]
  const b = d1[eje]
  return (valor: string): number | null => {
    const m = leerMatriz(valor)
    if (m === null) return null
    return (descomponer(m)[eje] - a) / (b - a)
  }
}

export interface TramoPintado {
  readonly t: number
  /** El tramo del ancho que ESA capa pinta, en fracción de 0 a 1. */
  readonly desde: number
  readonly hasta: number
}

/**
 * QUÉ TRAMO DEL PÍXEL PINTA UNA CAPA ESCALADA EN X.
 *
 * Es la operación que convierte «scaleX 0,68 con el origen en el borde derecho»
 * en «pinta del 32 % al 100 % del ancho», que es lo único que describe un hueco
 * sin depender de cómo esté implementado. Con el origen en `o` (en px) y el
 * ancho `w`, un punto local `x` va a `o + s(x − o)`, así que la capa cubre
 * `[o + s(0 − o), o + s(w − o)]`.
 */
export function tramoPintado(escalaX: number, origenPx: number, anchoPx: number): { desde: number; hasta: number } {
  const izq = origenPx + escalaX * (0 - origenPx)
  const der = origenPx + escalaX * (anchoPx - origenPx)
  return { desde: Math.min(izq, der) / anchoPx, hasta: Math.max(izq, der) / anchoPx }
}

export function valorEn(cambios: readonly (readonly [number, string])[], t: number): string | null {
  let v: string | null = null
  for (const [tt, vv] of cambios) {
    if (tt > t) break
    v = vv
  }
  return v
}

export function serie(g: Grabacion, clave: string): SerieDeNodo | undefined {
  return g.series.find((s) => s.clave === clave)
}

export function nodo(foto: readonly NodoEstatico[], clave: string): NodoEstatico | undefined {
  return foto.find((n) => n.clave === clave)
}

export function tres(n: number): number {
  return Math.round(n * 1000) / 1000
}
