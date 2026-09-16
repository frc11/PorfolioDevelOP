/**
 * BANCO DE CAMARA-1 — la palanca de DISTANCIA de cámara, medida y no aplicada.
 *
 * ── ⚠️ ESTE BLOQUE NO APLICA NADA ────────────────────────────────────────
 *
 * Todo lo de acá corre sobre COPIAS de `CHOREO_KEYFRAMES` armadas con
 * `makeTrack`, que es la misma palanca que `s10-vertical` usa para barrer
 * `frameX` sin tocar el árbol. `choreography.ts` no se escribe.
 *
 * ── LA GEOMETRÍA, en una línea ───────────────────────────────────────────
 *
 * El `fov` es VERTICAL y vale 35° (`probeScene.CAMERA_FOV`), así que el medio
 * alto del cuadro a la distancia del ojo es `tan(17,5°) × eyeDistance` y el
 * medio ancho es eso **por el aspecto**. `eyeDistance = hypot(distance, height)`.
 * Alejar la cámara agranda el cuadro y achica la tinta del logo dentro de él:
 * es la única palanca que ESCALA. `frameX` traslada, y por eso no resuelve nada
 * cuando la tinta es más ancha que el cuadro.
 *
 * ── ⚠️ EL TECHO DE LA PALANCA NO ES UNA OPINIÓN: ES LA PARED DE LA SALA ──
 *
 * `probeScene.ts` declara el piso como un disco de radio **34**
 * (`FLOOR_RADIUS`) y la pared como un cove que sube desde ahí hasta radio 76 a
 * 42 unidades de alto (`CYC_COVE_RADIUS`). Una cámara más lejos que el radio de
 * la sala A SU ALTURA queda AFUERA del cuarto y lo que se ve deja de ser la
 * escena. `radioDeLaSala` devuelve ese radio y `TECHO_DE_DISTANCIA` le descuenta
 * una holgura declarada.
 */

import { join as pathJoin } from 'node:path'

import { CHOREO_KEYFRAMES } from '@/app/v3/_lib/escena/choreography'
import { FLOOR_Y } from '@/app/v3/_lib/escena/probeScene'
import { makeTrack, type Track } from '@/app/probe-escena/__tests__/harness'
import { muestrearLogo } from '@/app/v3/_lib/escena/__tests__/s10-logo'
import { ESCENA_REAL, cajaDelLogo, cobertura } from '@/app/v3/_lib/escena/__tests__/s10-logo-lectura'
import type { CajaEnCuadro } from '@/app/v3/_lib/escena/__tests__/s10-logo'

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/camara'
export const CARPETA_DE_CAPTURAS = 'docs/rediseno/capturas/camara'

/**
 * El temporal de este banco, FUERA del arbol. La regla del repo es explicita:
 * nunca un respaldo adentro del arbol que se respalda.
 */
export const TEMP_DEL_BANCO = pathJoin(process.env.TEMP ?? process.env.TMP ?? '.', 'camara-1')

export interface Ventana {
  readonly ancho: number
  readonly alto: number
  readonly procedencia: string
  /** `true` si el ancho cae del lado que este bloque puede tocar (< 1025). */
  readonly enAlcance: boolean
}

/**
 * LAS OCHO, heredadas de TAPADO-1 sin mover un número: seis en alcance y las dos
 * de escritorio, que entran a la tabla **para poder afirmar que no se mueven**.
 */
export const VENTANAS: readonly Ventana[] = [
  { ancho: 320, alto: 568, procedencia: 'par de TAPADO-1 — iPhone SE de 1.a gen', enAlcance: true },
  { ancho: 375, alto: 667, procedencia: 'scripts-b4/perfiles.ts — iPhone SE 2.a/3.a gen', enAlcance: true },
  { ancho: 390, alto: 844, procedencia: 's10-referencias.VIEWPORTS_MEDIDOS', enAlcance: true },
  { ancho: 425, alto: 844, procedencia: 'par de TAPADO-1 — «Mobile L» de DevTools', enAlcance: true },
  { ancho: 768, alto: 1024, procedencia: 'scripts-b4/perfiles.ts — iPad en retrato', enAlcance: true },
  { ancho: 1024, alto: 768, procedencia: 'scripts-b4/perfiles.ts — un pixel abajo del umbral', enAlcance: true },
  { ancho: 1440, alto: 900, procedencia: 'scripts-b4/perfiles.ts — CERRADO, no se toca', enAlcance: false },
  { ancho: 1920, alto: 1080, procedencia: 'scripts-b4/perfiles.ts — CERRADO, no se toca', enAlcance: false },
]

/**
 * EL MARGEN QUE PIDE LA INSTRUCCIÓN: 5 % del cuadro a cada lado. El cuadro va de
 * −1 a +1, así que la tinta tiene que vivir dentro de ±0,90.
 */
export const MARGEN = 0.05
export const LIMITE = 1 - MARGEN

/** La malla del barrido: gruesa, para acotar. Celda 0,0325 en coordenada de cuadro. */
export const MALLA_GRUESA = { columnas: 160, filas: 160 } as const
/** La malla de publicación. Celda 0,0118. */
export const MALLA_FINA = { columnas: 440, filas: 440 } as const
/** El campo extendido, el mismo de S16 y de `s10-logo`: sin él la caja se recorta al borde. */
export const CAMPO = 2.6

/** Una pista con la DISTANCIA de un keyframe cambiada, sobre una copia del array. */
export function pistaConDistancia(nombre: string, distance: number): Track {
  return makeTrack(
    CHOREO_KEYFRAMES.map((k) => (k.name === nombre ? { ...k, pose: { ...k.pose, distance } } : k)),
  )
}

/** Una pista con la distancia de TODOS los keyframes multiplicada. */
export function pistaEscalada(factor: number): Track {
  return makeTrack(
    CHOREO_KEYFRAMES.map((k) => ({ ...k, pose: { ...k.pose, distance: k.pose.distance * factor } })),
  )
}

/** El radio de la sala a una altura dada. Sale de `frameProbe.cycloramaRadius`. */
export function radioDeLaSala(y: number): number {
  const FLOOR_RADIUS = 34
  const h = y - FLOOR_Y
  if (h <= 0) return FLOOR_RADIUS
  if (h >= 42) return FLOOR_RADIUS + 42
  return FLOOR_RADIUS + 42 * Math.sqrt(Math.max(0, 1 - ((42 - h) / 42) ** 2))
}

/**
 * ⚠ **LA HOLGURA CONTRA LA PARED, declarada.** Cuatro unidades de mundo: con la
 * cámara pegada a la pared el cuadro se llena de cove y el ciclorama deja de
 * leerse como una sala. No es una medición, es un límite conservador de este
 * banco — y se publica al lado de cada cifra que lo toque.
 */
export const HOLGURA_CONTRA_LA_PARED = 4

export function techoDeDistancia(height: number): number {
  return radioDeLaSala(height) - HOLGURA_CONTRA_LA_PARED
}

export interface Medida {
  readonly caja: CajaEnCuadro
  readonly ancho: number
  readonly altoCaja: number
  /** Qué fracción del CUADRO ocupa la tinta. La «presencia» de la escena. */
  readonly cobertura: number
  readonly entra: boolean
}

export function medir(
  nombre: string,
  progreso: number,
  ventana: Ventana,
  distancia: number,
  malla: { readonly columnas: number; readonly filas: number } = MALLA_FINA,
): Medida | null {
  const m = muestrearLogo(
    progreso,
    ventana.ancho / ventana.alto,
    ESCENA_REAL,
    malla.columnas,
    malla.filas,
    CAMPO,
    pistaConDistancia(nombre, distancia),
  )
  const c = cajaDelLogo(m)
  if (c === null) return null
  return {
    caja: c,
    ancho: c.x1 - c.x0,
    altoCaja: c.y1 - c.y0,
    cobertura: cobertura(m),
    entra: c.x0 >= -LIMITE && c.x1 <= LIMITE && c.y0 >= -LIMITE && c.y1 <= LIMITE,
  }
}

export interface BandaLibre {
  /** Píxeles libres ARRIBA de la tinta. */
  readonly arribaPx: number
  /** Píxeles libres ABAJO de la tinta. */
  readonly abajoPx: number
  /** La banda que la tinta ocupa, en píxeles de viewport. */
  readonly tintaDesdePx: number
  readonly tintaHastaPx: number
}

/**
 * LA BANDA LIBRE, en píxeles de viewport.
 *
 * El cuadro tiene +1 arriba y −1 abajo; la pantalla tiene la fila 0 arriba. La
 * conversión es `px = (1 − y) / 2 × alto`, y por eso el borde SUPERIOR de la
 * tinta sale de `y1`.
 */
export function bandaLibre(caja: CajaEnCuadro, alto: number): BandaLibre {
  const desde = ((1 - caja.y1) / 2) * alto
  const hasta = ((1 - caja.y0) / 2) * alto
  return {
    arribaPx: Math.max(0, desde),
    abajoPx: Math.max(0, alto - hasta),
    tintaDesdePx: desde,
    tintaHastaPx: hasta,
  }
}

export interface Solucion {
  readonly distanciaDeHoy: number
  /** La distancia mínima que hace entrar la tinta con margen, o `null` si no hay. */
  readonly distanciaNecesaria: number | null
  readonly factor: number | null
  /** El techo de la sala a la altura de este keyframe. */
  readonly techo: number
  /** `true` si ya entra con la distancia de hoy. */
  readonly yaEntra: boolean
}

/**
 * LA DISTANCIA QUE HACE ENTRAR LA TINTA, por barrido y refinamiento.
 *
 * ⚠ **No se bisecciona sobre el barrido crudo, y el motivo es el encuadre.** El
 * recorrido lateral es `|medioCuadro − caja/2|`: al alejar la cámara ese valor
 * pasa POR CERO y vuelve a crecer, así que la tinta no se mueve de forma
 * monótona dentro del cuadro. Se barre de a 0,25 con la malla gruesa hasta el
 * primer valor que entra y recién ahí se refina, y el refinamiento comprueba que
 * el intervalo siga cumpliendo.
 */
export function distanciaNecesaria(nombre: string, progreso: number, ventana: Ventana, height: number): Solucion {
  const k = CHOREO_KEYFRAMES.find((x) => x.name === nombre)
  if (k === undefined) throw new Error(`keyframe desconocido: ${nombre}`)
  const d0 = k.pose.distance
  const techo = techoDeDistancia(height)

  const hoy = medir(nombre, progreso, ventana, d0, MALLA_FINA)
  if (hoy !== null && hoy.entra) {
    return { distanciaDeHoy: d0, distanciaNecesaria: d0, factor: 1, techo, yaEntra: true }
  }

  let encontrada: number | null = null
  for (let d = d0; d <= techo + 1e-9; d += 0.25) {
    const m = medir(nombre, progreso, ventana, d, MALLA_GRUESA)
    if (m !== null && m.entra) {
      encontrada = d
      break
    }
  }
  if (encontrada === null) {
    return { distanciaDeHoy: d0, distanciaNecesaria: null, factor: null, techo, yaEntra: false }
  }

  // Refinamiento con la malla fina entre el paso anterior y el encontrado.
  let bajo = Math.max(d0, encontrada - 0.25)
  let alto = encontrada
  for (let i = 0; i < 7; i += 1) {
    const medio = (bajo + alto) / 2
    const m = medir(nombre, progreso, ventana, medio, MALLA_FINA)
    if (m !== null && m.entra) alto = medio
    else bajo = medio
  }
  // La malla fina puede mover el borde: se confirma el resultado y, si no entra,
  // se sube de a 0,05 hasta que entre. Publicar un valor que no cumple seria
  // exactamente el modo de falla que este repo viene cazando.
  let final = alto
  for (let i = 0; i < 40; i += 1) {
    const m = medir(nombre, progreso, ventana, final, MALLA_FINA)
    if (m !== null && m.entra) break
    final += 0.05
    if (final > techo) return { distanciaDeHoy: d0, distanciaNecesaria: null, factor: null, techo, yaEntra: false }
  }
  return { distanciaDeHoy: d0, distanciaNecesaria: final, factor: final / d0, techo, yaEntra: false }
}

export function dos(n: number): number {
  return Number(n.toFixed(2))
}
export function tres(n: number): number {
  return Number(n.toFixed(3))
}
/** Alias con nombre largo, para los consumidores que ya usan `dos`/`tres` de otro banco. */
export const dosDecimales = dos
export const cuatroDecimales = (n: number): number => Number(n.toFixed(4))

export function argumento(nombre: string, defecto: string): string {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`))
  return a === undefined ? defecto : a.slice(nombre.length + 3)
}
