/**
 * B9 · LO QUE COMPARTEN LAS MEDICIONES DE SINCRONÍA.
 *
 * ── Qué mide este bloque, y por qué hace falta un instrumento nuevo ────────
 *
 * B4-B dejó el banco (`scripts-b4/`) con todo lo caro ya resuelto: un Chrome
 * propio por CDP, los siete perfiles, la verificación de la pestaña al frente y
 * el censo de acontecimientos de B2. **Nada de eso se reescribe acá**; este
 * archivo lo usa.
 *
 * Lo que el banco NO tiene es la pregunta de B9: **para cada instancia de
 * patrón, en qué píxeles de scroll está EN CUADRO y en qué píxeles se está
 * ANIMANDO**. El censo mide el sitio entero —cuántos acontecimientos hay y a qué
 * distancia—; acá se mide instancia por instancia, y la unidad no es el
 * acontecimiento sino el desfase entre dos ventanas.
 *
 * ── ⚠️ La ventana visible se MIDE, no se deriva ───────────────────────────
 *
 * La instrucción lo pide con esas palabras: *«medí el elemento renderizado, no
 * lo declarado»*. Así que la ventana visible de un bloque no sale de
 * `secciones.ts` ni de `topDoc + alto`: sale de preguntarle a cada parada del
 * barrido si la caja del bloque toca el cuadro. Eso además hace correcto el caso
 * pinneado —un hijo `sticky` no se mueve con el documento— sin ninguna rama.
 *
 * ── ⚠️ La ventana de animación también, y con la definición de B2 ─────────
 *
 * Un bloque «se está animando» en una parada si la firma de los estilos en línea
 * de sus descendientes cambió respecto de la parada anterior. Es exactamente la
 * regla de `scripts-b4/censo.ts` —un aterrizaje es la última parada donde algo
 * cambió— aplicada por bloque en vez de al documento entero. Se reusa la
 * definición a propósito: dos definiciones de «se movió» producirían dos tablas
 * que parecen la misma y no lo son.
 *
 * ── ⚠️ Y por qué el barrido se asienta en cada parada ─────────────────────
 *
 * P1, P3, P8 y P9 declaran `scrub` numérico, que el sistema reproduce con un
 * resorte: siguen moviéndose después de que el scroll paró. Sin asentamiento, el
 * instrumento mide la página en movimiento y ve cambios en paradas donde el
 * rango ya se consumió. Es el mismo `esperas` de `fuenteDelCenso`.
 */

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/** ⚠️ EL PUERTO DE ESTE WORKTREE ES EL 3002. El 3001 es de la sesión vecina. */
export const SITIO = 'http://localhost:3002/v3'

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/b9'

/**
 * ⚠️ **NO SE ESCRIBE UN BYTE EN EL REPO CON EL NAVEGADOR ABIERTO.** `docs/` no
 * está en `.gitignore`, así que un archivo nuevo ahí cae adentro del árbol que
 * vigilan el `next dev` de este worktree y la auto-detección de fuentes de
 * Tailwind 4. `c-comun.ts` lo midió: escribiendo en destino, dos lecturas de la
 * misma corrida dieron `top` de 1.066 y de −1.979 px. Se escribe en el temporal
 * y se muda al final.
 */
export const RAIZ_TEMPORAL = path.join(os.tmpdir(), 'b9-sincronia')

export interface Pendiente {
  readonly temporal: string
  readonly destino: string
}

export function rutaTemporal(nombre: string): string {
  mkdirSync(RAIZ_TEMPORAL, { recursive: true })
  return path.join(RAIZ_TEMPORAL, nombre)
}

export function mudar(pendientes: readonly Pendiente[]): readonly string[] {
  const escritos: string[] = []
  for (const p of pendientes) {
    mkdirSync(path.dirname(p.destino), { recursive: true })
    copyFileSync(p.temporal, p.destino)
    escritos.push(p.destino)
  }
  return escritos
}

/** Guarda un JSON en el temporal y devuelve el par para mudarlo después. */
export function jsonPendiente(nombre: string, datos: unknown): Pendiente {
  const temporal = rutaTemporal(nombre)
  writeFileSync(temporal, `${JSON.stringify(datos, null, 2)}\n`, 'utf8')
  return { temporal, destino: path.join(RAIZ_DE_SALIDAS, nombre) }
}

/** Dos decimales, que es la resolución con la que este bloque publica. */
export function dos(n: number): number {
  return Math.round(n * 100) / 100
}

/** Tres decimales, para fracciones de pantalla chicas. */
export function tres(n: number): number {
  return Math.round(n * 1000) / 1000
}

/** Lo que la página devuelve por bloque en cada parada del barrido. */
export interface ParadaDeBloque {
  /** Hash de la firma de estilos en línea de los descendientes. */
  readonly h: number
  /** `getBoundingClientRect().top` — relativo al cuadro, o sea YA con el `sticky` aplicado. */
  readonly t: number
  /** Alto de la caja renderizada. */
  readonly a: number
  /** Opacidad en línea mínima entre los descendientes que la declaren; `-1` si ninguno. */
  readonly o: number
  /** Cuántos descendientes con estilo en línea tenía el bloque en esa parada. */
  readonly n: number
}

export interface IdentidadDeBloque {
  readonly indice: number
  readonly seccion: string | null
  /** Ordinal del bloque DENTRO de su sección, que es lo que lo hace comparable entre corridas. */
  readonly ordinal: number
  readonly anclaje: string | null
  readonly clase: string
  readonly texto: string
  /** `offsetTop` acumulado: inmune a `sticky` y a transformadas. Para cruzar con la caja. */
  readonly topDeFlujo: number
  readonly altoDeFlujo: number
}

export interface LecturaDeSincronia {
  readonly bloques: readonly IdentidadDeBloque[]
  readonly paradas: readonly number[]
  /** `[bloque][parada]`. */
  readonly serie: readonly (readonly ParadaDeBloque[])[]
  readonly ventana: number
  readonly paso: number
  readonly alturaDelDocumento: number
  readonly paneles: readonly { readonly id: string; readonly top: number; readonly alto: number }[]
  readonly visibilityState: string
  readonly innerWidth: number
}

/**
 * LA MITAD QUE CORRE ADENTRO DE LA PÁGINA.
 *
 * Se devuelve como texto porque adentro de la página no hay módulos de este
 * repo — es la misma forma que `fuenteDelCenso` de `scripts-b4/censo.ts`.
 *
 * ⚠️ **La caja se lee con `getBoundingClientRect` a propósito**: la pregunta de
 * B9 es si el bloque está EN CUADRO, y lo que está en cuadro es la caja
 * transformada. `topDeFlujo` se publica al lado, tomado por acumulación de
 * `offsetTop`, para que quien lea la tabla pueda ver si el bloque estaba
 * desplazado cuando se lo midió.
 */
export function fuenteDelBarrido(opciones: {
  readonly paso: number
  readonly esperas?: number
  readonly msPorEspera?: number
}): string {
  const { paso } = opciones
  const esperas = opciones.esperas ?? 8
  const ms = opciones.msPorEspera ?? 140
  return `async () => {
  const PASO = ${paso}, ESPERAS = ${esperas}, MS = ${ms}
  const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const dormir = (t) => new Promise((r) => setTimeout(r, t))

  const bloques = [...document.querySelectorAll('[data-arbol]')]
  const porSeccion = {}
  const identidad = bloques.map((el, i) => {
    const panel = el.closest('[data-panel]')
    const seccion = panel === null ? null : panel.getAttribute('data-panel')
    const clave = seccion === null ? '(sin panel)' : seccion
    porSeccion[clave] = (porSeccion[clave] ?? 0) + 1
    let top = 0, n = el
    while (n !== null) { top += n.offsetTop; n = n.offsetParent }
    return {
      indice: i,
      seccion,
      ordinal: porSeccion[clave] - 1,
      anclaje: el.getAttribute('data-anclaje'),
      clase: el.getAttribute('class') ?? '',
      texto: (el.textContent ?? '').trim().replace(/\\s+/g, ' ').slice(0, 90),
      topDeFlujo: top,
      altoDeFlujo: el.offsetHeight,
    }
  })

  // Hash barato y estable de la firma: sólo hace falta detectar CAMBIO.
  const hash = (s) => {
    let h = 5381
    for (let i = 0; i < s.length; i += 1) h = (((h * 33) ^ s.charCodeAt(i)) >>> 0)
    return h
  }
  const leerBloque = (el) => {
    const partes = []
    let opacidad = -1, n = 0
    for (const d of el.querySelectorAll('[style]')) {
      const s = d.getAttribute('style')
      if (s === null || s.length === 0) continue
      partes.push(s)
      n += 1
      const m = /(?:^|;)\\s*opacity:\\s*([0-9.]+)/.exec(s)
      if (m !== null) {
        const v = Number(m[1])
        if (opacidad < 0 || v < opacidad) opacidad = v
      }
    }
    const r = el.getBoundingClientRect()
    return {
      h: hash(partes.join('|')),
      t: Math.round(r.top * 10) / 10,
      a: Math.round(r.height * 10) / 10,
      o: opacidad < 0 ? -1 : Math.round(opacidad * 1000) / 1000,
      n,
    }
  }
  const firmaEntera = () => bloques.map(leerBloque)
  const igualesFirmas = (a, b) => {
    for (let i = 0; i < a.length; i += 1) {
      if (a[i].h !== b[i].h || a[i].t !== b[i].t || a[i].a !== b[i].a) return false
    }
    return true
  }

  const HASTA = document.documentElement.scrollHeight - window.innerHeight
  const paradas = [], serie = bloques.map(() => [])
  for (let y = 0; y <= HASTA; y += PASO) {
    window.scrollTo(0, y)
    await raf2()
    let f = firmaEntera()
    for (let i = 0; i < ESPERAS; i += 1) {
      await dormir(MS)
      const g = firmaEntera()
      if (igualesFirmas(f, g)) break
      f = g
    }
    paradas.push(window.scrollY)
    for (let b = 0; b < bloques.length; b += 1) serie[b].push(f[b])
  }

  const paneles = [...document.querySelectorAll('[data-panel]')].map((el) => {
    const r = el.getBoundingClientRect()
    return { id: el.getAttribute('data-panel'), top: Math.round((r.top + window.scrollY) * 10) / 10, alto: Math.round(r.height * 10) / 10 }
  })

  return {
    bloques: identidad,
    paradas,
    serie,
    ventana: window.innerHeight,
    paso: PASO,
    alturaDelDocumento: document.documentElement.scrollHeight,
    paneles,
    visibilityState: document.visibilityState,
    innerWidth: window.innerWidth,
  }
}`
}

export interface Desfase {
  readonly bloque: IdentidadDeBloque
  /** Primera y última parada en la que la caja del bloque tocaba el cuadro. */
  readonly entraEnCuadro: number | null
  readonly saleDeCuadro: number | null
  /** Primera parada en la que su firma cambió respecto de la anterior, y la última. */
  readonly empiezaAMoverse: number | null
  readonly terminaDeMoverse: number | null
  /** `empiezaAMoverse − entraEnCuadro`. Positivo = arranca tarde. */
  readonly desfaseDeEntradaPx: number | null
  readonly desfaseDeEntradaPantallas: number | null
  /** `terminaDeMoverse − saleDeCuadro`. Positivo = termina después de salir. */
  readonly desfaseDeSalidaPx: number | null
  readonly desfaseDeSalidaPantallas: number | null
  /** Fracción del recorrido de la animación que transcurre con el bloque fuera del cuadro. */
  readonly fraccionFueraDeCuadro: number | null
  /** Dónde está la caja, en fracciones de pantalla desde el tope del cuadro, al empezar y al terminar. */
  readonly cuadroAlEmpezar: { readonly top: number; readonly fondo: number } | null
  readonly cuadroAlTerminar: { readonly top: number; readonly fondo: number } | null
  /** Opacidad en línea mínima cuando el bloque está centrado en el cuadro. */
  readonly opacidadAlCentro: number | null
  /** El peor de los dos desfases, en pantallas y en valor absoluto. Es la clave de orden. */
  readonly peorDesfasePantallas: number | null
}

/**
 * De la serie cruda a la tabla de desfases. **Corre en Node y no en la página**:
 * es la mitad que decide, y partirla es lo que la hace comprobable — la misma
 * razón por la que `censo.ts` está partido.
 */
export function desfases(lectura: LecturaDeSincronia): readonly Desfase[] {
  const { paradas, ventana } = lectura
  return lectura.bloques.map((bloque, b) => {
    const serie = lectura.serie[b]

    const enCuadro = serie.map((s) => s.t < ventana && s.t + s.a > 0)
    const iEntra = enCuadro.indexOf(true)
    const iSale = enCuadro.lastIndexOf(true)

    const cambios: number[] = []
    for (let k = 1; k < serie.length; k += 1) if (serie[k].h !== serie[k - 1].h) cambios.push(k)

    // El movimiento EMPIEZA en la parada anterior al primer cambio: entre esa y
    // la siguiente es donde ocurrió. Terminar es el aterrizaje de B2: la última
    // parada en la que cambió.
    const iEmpieza = cambios.length === 0 ? -1 : cambios[0] - 1
    const iTermina = cambios.length === 0 ? -1 : cambios[cambios.length - 1]

    const entraEnCuadro = iEntra < 0 ? null : paradas[iEntra]
    const saleDeCuadro = iSale < 0 ? null : paradas[iSale]
    const empiezaAMoverse = iEmpieza < 0 ? null : paradas[iEmpieza]
    const terminaDeMoverse = iTermina < 0 ? null : paradas[iTermina]

    const desfaseDeEntradaPx =
      empiezaAMoverse === null || entraEnCuadro === null ? null : empiezaAMoverse - entraEnCuadro
    const desfaseDeSalidaPx =
      terminaDeMoverse === null || saleDeCuadro === null ? null : terminaDeMoverse - saleDeCuadro

    let fraccionFueraDeCuadro: number | null = null
    if (iEmpieza >= 0 && iTermina >= iEmpieza) {
      const total = iTermina - iEmpieza + 1
      let fuera = 0
      for (let k = iEmpieza; k <= iTermina; k += 1) if (!enCuadro[k]) fuera += 1
      fraccionFueraDeCuadro = tres(fuera / total)
    }

    const cuadroDe = (i: number): { top: number; fondo: number } | null =>
      i < 0 ? null : { top: tres(serie[i].t / ventana), fondo: tres((serie[i].t + serie[i].a) / ventana) }

    // La opacidad cuando el CENTRO de la caja está más cerca del centro del
    // cuadro: es el momento en que el visitante lo está mirando de lleno.
    let opacidadAlCentro: number | null = null
    let mejor = Number.POSITIVE_INFINITY
    for (let k = 0; k < serie.length; k += 1) {
      if (!enCuadro[k] || serie[k].o < 0) continue
      const d = Math.abs(serie[k].t + serie[k].a / 2 - ventana / 2)
      if (d < mejor) {
        mejor = d
        opacidadAlCentro = serie[k].o
      }
    }

    const enPantallas = (px: number | null): number | null => (px === null ? null : tres(px / ventana))
    const dEnt = enPantallas(desfaseDeEntradaPx)
    const dSal = enPantallas(desfaseDeSalidaPx)
    const peor =
      dEnt === null && dSal === null
        ? null
        : Math.max(Math.abs(dEnt ?? 0), Math.abs(dSal ?? 0))

    return {
      bloque,
      entraEnCuadro,
      saleDeCuadro,
      empiezaAMoverse,
      terminaDeMoverse,
      desfaseDeEntradaPx,
      desfaseDeEntradaPantallas: dEnt,
      desfaseDeSalidaPx,
      desfaseDeSalidaPantallas: dSal,
      fraccionFueraDeCuadro,
      cuadroAlEmpezar: cuadroDe(iEmpieza),
      cuadroAlTerminar: cuadroDe(iTermina),
      opacidadAlCentro,
      peorDesfasePantallas: peor === null ? null : tres(peor),
    }
  })
}
