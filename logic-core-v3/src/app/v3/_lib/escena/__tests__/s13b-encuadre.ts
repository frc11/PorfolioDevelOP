/**
 * EL ENCUADRE DEL HERO — cuánto logo entra en el cuadro en los tres anchos que
 * V3-B pregunta, y qué le pasa al destino del preloader.
 *
 * ── Las dos preguntas, y por qué van juntas ────────────────────────────────
 *
 * §7.46 / V3-B defecto 2 dice dos cosas: *«medí qué fracción del logo queda
 * dentro del cuadro en 1440, 1920 y 2560 — el humano mira en 1920 y ahí es
 * peor»* y *«ojo con el destino del preloader: el logo del intro aterriza en la
 * pose del hero, así que mover el encuadre mueve dónde aterriza»*. Son la misma
 * geometría leída dos veces —`cameraFraming.ts` para la escena y
 * `scene-framing.ts` para el intro— así que se miden en el mismo archivo, con la
 * pose del recorrido como única fuente.
 *
 * ── ⚠️ DE DÓNDE SALEN LOS ALTOS, QUE ES LA MITAD DE LA MEDICIÓN ────────────
 *
 * Un ancho solo no define un cuadro: la proyección depende del **aspecto**, y el
 * `fov` de esta cámara es vertical. Los tres altos NO se eligen acá — son los que
 * `src/lib/scene-framing.invariant.ts` ya declara para esos mismos tres anchos en
 * su lista de ventanas razonables (`[1440, 810] · [1920, 1080] · [2560, 1440]`),
 * que es además el archivo dueño del destino del preloader. Se afirma sobre su
 * fuente que la lista sigue diciendo eso: sin esa afirmación, este módulo sería
 * una segunda tabla de ventanas y las dos se desincronizarían.
 *
 * A esos tres se les suman **los cuatro cuadros de `s10-logo`** —los tres altos
 * declarados a 1025 más `--fluido-techo` × 900— para que la respuesta cubra el
 * rango entero de aspectos que el repo declara (1,139 a 1,778) y no sólo el que
 * el humano mira.
 */

import { CHOREO_KEYFRAMES } from '../choreography'
import { muestrearLogo } from './s10-logo'
// prettier-ignore
import { ESCENA_REAL, VENTANAS, cajaDelLogo, cobertura, fraccionDentro, type Ventana } from './s10-logo-lectura'
import { frameScenePose, SCENE_ENTRY_POSE } from '@/lib/scene-framing'
import { fuenteDe } from './s13b-soporte'
import type { Track } from '@/app/probe-escena/__tests__/harness'

/** La ruta del archivo que declara las ventanas y es dueño del destino. */
export const RUTA_DEL_ENCUADRE_DEL_INTRO = 'src/lib/scene-framing.invariant.ts'

/** Los tres anchos que V3-B pregunta, con el alto que ya declara ese archivo. */
export const CUADROS_DE_V3B: readonly Ventana[] = [
  { ancho: 1440, alto: 810 },
  { ancho: 1920, alto: 1080 },
  { ancho: 2560, alto: 1440 },
].map((v) => ({ ...v, etiqueta: `${v.ancho}×${v.alto}`, aspecto: v.ancho / v.alto }))

/** ¿El archivo del intro sigue declarando ese par? Se busca la fila literal. */
export function declaraLaVentana(fuente: string, ancho: number, alto: number): boolean {
  return new RegExp(`\\[\\s*${ancho}\\s*,\\s*${alto}\\s*\\]`).test(fuente)
}

/** Los siete cuadros de este frente: los tres de V3-B más los cuatro de `s10-logo`. */
export const CUADROS: readonly Ventana[] = [...CUADROS_DE_V3B, ...VENTANAS]

/** Los tres progresos que retratan la ventana del Hero: entra, medio y sale. */
export const PROGRESOS_DEL_HERO: readonly number[] = [0, 0.0625, 0.125]

export interface FilaDelHero {
  readonly ventana: Ventana
  readonly progreso: number
  readonly dentro: number
  readonly cobertura: number
  /** El borde DERECHO de la caja del logo, en coordenada de cuadro (+1 = borde). */
  readonly derecha: number
  /** Margen que le queda al logo contra el borde derecho del cuadro. */
  readonly margen: number
  readonly tocaElBorde: boolean
}

/**
 * La fracción del logo dentro del cuadro, cuadro por cuadro y progreso por
 * progreso, sobre la pista que se le pase.
 *
 * ⚠ La grilla es la de publicación de `s10-logo` (300 × 220, factor 2,6) y no la
 * gruesa del barrido del diferencial: acá el número que importa es «entra o no
 * entra», y ahí una celda de más o de menos decide.
 */
export function tablaDelHero(pista?: Track): readonly FilaDelHero[] {
  const filas: FilaDelHero[] = []
  for (const ventana of CUADROS) {
    for (const progreso of PROGRESOS_DEL_HERO) {
      const m = muestrearLogo(progreso, ventana.aspecto, ESCENA_REAL, 300, 220, 2.6, pista)
      const caja = cajaDelLogo(m)
      filas.push({
        ventana,
        progreso,
        dentro: fraccionDentro(m),
        cobertura: cobertura(m),
        derecha: caja === null ? Number.NaN : caja.x1,
        margen: caja === null ? Number.NaN : 1 - caja.x1,
        tocaElBorde: m.tocaElBorde,
      })
    }
  }
  return filas
}

export function lineasDelHero(filas: readonly FilaDelHero[]): readonly string[] {
  return [
    'cuadro       aspecto    p       dentro  cobertura  borde der.  margen',
    ...filas.map(
      (f) =>
        `${f.ventana.etiqueta.padEnd(11)} ${f.ventana.aspecto.toFixed(4)}  ${f.progreso.toFixed(4)}  ` +
        `${(f.dentro * 100).toFixed(2).padStart(7)}%  ${(f.cobertura * 100).toFixed(2).padStart(7)}%  ` +
        `${f.derecha.toFixed(3).padStart(9)}  ${f.margen.toFixed(3).padStart(6)}${f.tocaElBorde ? '  ⚠ TOCA' : ''}`,
    ),
  ]
}

// ── El destino del preloader ────────────────────────────────────────────────

export interface DestinoMedido {
  readonly ventana: Ventana
  readonly centroX: number
  readonly centroY: number
  readonly anchoDeTinta: number
  readonly altoDeTinta: number
  readonly recorte: number
}

/**
 * DÓNDE ATERRIZA EL LOGO DEL PRELOADER, proyectando la pose que se le pase.
 *
 * ⚠ **Se le pasa la pose y no se lee de adentro**, para poder proyectar la de
 * HOY y la de ANTES con la misma función y restar. Si esto leyera
 * `SCENE_ENTRY_POSE` por su cuenta, «el destino no se movió» sería una
 * tautología en vez de una medición.
 */
export function destinoEn(ventana: Ventana, pose = SCENE_ENTRY_POSE): DestinoMedido | null {
  const frame = frameScenePose(pose, ventana.ancho, ventana.alto)
  if (frame === null) return null
  return {
    ventana,
    centroX: frame.centerXPx,
    centroY: frame.centerYPx,
    anchoDeTinta: frame.inkWidthPx,
    altoDeTinta: frame.inkHeightPx,
    recorte: frame.widthClamp,
  }
}

/** Cuánto se movió un destino contra otro, en píxeles. */
export function cuantoSeMovio(a: DestinoMedido, b: DestinoMedido): number {
  return Math.max(
    Math.abs(a.centroX - b.centroX),
    Math.abs(a.centroY - b.centroY),
    Math.abs(a.anchoDeTinta - b.anchoDeTinta),
    Math.abs(a.altoDeTinta - b.altoDeTinta),
  )
}

/**
 * LA POSE DE ENTRADA QUE EL PRELOADER LEE, tomada del array de keyframes.
 *
 * `scene-framing.ts` la define como `CHOREO_KEYFRAMES[0].pose` — **el índice
 * cero, no el keyframe llamado `hero`**. La diferencia importa exactamente en
 * este sprint: sacar un keyframe del medio del array no la toca, pero sacar el
 * primero la cambiaría sin que nadie edite `scene-framing.ts`. Se expone acá para
 * poder afirmar que el índice cero **sigue siendo** la pose del hero.
 */
export const PRIMERO_DEL_ARRAY = CHOREO_KEYFRAMES[0]

export function lineasDelDestino(cuadros: readonly Ventana[]): readonly string[] {
  return cuadros.map((v) => {
    const d = destinoEn(v)
    if (d === null) return `${v.etiqueta.padEnd(11)} sin destino`
    return (
      `${v.etiqueta.padEnd(11)} centro (${d.centroX.toFixed(0)}, ${d.centroY.toFixed(0)}) px · ` +
      `tinta ${d.anchoDeTinta.toFixed(0)} × ${d.altoDeTinta.toFixed(0)} px · recorte ×${d.recorte.toFixed(4)}`
    )
  })
}

/** El fuente del archivo del intro, para las afirmaciones sobre sus ventanas. */
export const FUENTE_DEL_INTRO = fuenteDe(RUTA_DEL_ENCUADRE_DEL_INTRO)
