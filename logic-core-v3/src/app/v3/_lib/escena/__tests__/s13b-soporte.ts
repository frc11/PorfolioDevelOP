/**
 * LO QUE V3-B MIDE SOBRE EL RECORRIDO — la velocidad del arranque y los dos
 * acoplamientos con el DOM, separados de las afirmaciones.
 *
 * Misma costura que `s9-soporte.ts` y `visibilidadMedida.ts`: **acá se mide,
 * allá se afirma** — el control positivo tiene que poder correr LA MISMA función
 * contra una entrada rota, y eso no se puede si vive adentro de la afirmación.
 *
 * ── ⚠️ CÓMO SE MIDE «ANTES», SI EL KEYFRAME YA NO ESTÁ ─────────────────────
 *
 * V3-B borró `hero · sostén`, así que la pista de ANTES hay que reconstruirla.
 * **No se escribe una pose a mano** —sería una segunda copia de un valor
 * calibrado— sino que se aplica la DEFINICIÓN de sostén que el repo ya tenía
 * escrita (`probe-escena/__tests__/s9-recorrido.invariant.ts`: *«Un sostén es una
 * copia EXACTA de la pose anterior»*): la pose del keyframe que lo precede,
 * puesta en el `to` de su tramo.
 *
 * Y la reconstrucción **se valida contra un sostén que SÍ existe**: `cierre ·
 * sostén` sigue en el archivo, así que reconstruirlo tiene que devolver el mismo
 * objeto, canal por canal. Sin ese control, «así era antes» sería una afirmación
 * sobre un dato que este archivo se inventó.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, controlPositivo } from '../../__tests__/afirmar'
import { SUPERFICIES } from '../../superficies'
import { CHOREO_KEYFRAMES, CHOREO_TRAMOS } from '../choreography'
// prettier-ignore
import { ATRIBUTO_DEL_PANEL, SELECTOR_DE_LAS_SECCIONES, extensionDe, medirLasSecciones } from '../extensionDeLasSecciones'
import type { ChoreoEase, ChoreoKeyframe } from '../choreographyTypes'
import { RITMO_POR_SEGMENTO } from '../recorrido'
// prettier-ignore
import { emptyPose, makeTrack, speedAt, type Track } from '@/app/probe-escena/__tests__/harness'
import { sampleTrack } from '../choreographySampler'

/** La raíz del repo. `process.cwd()` es donde corre `npx tsx`. */
const RAIZ = process.cwd()

export const fuenteDe = (relativo: string): string =>
  readFileSync(path.join(RAIZ, relativo), 'utf8').replace(/\r\n/g, '\n')

// ── La reconstrucción del sostén ────────────────────────────────────────────

/**
 * EL SOSTÉN DE UN KEYFRAME, construido con la definición y no escrito.
 *
 * Devuelve `null` si el keyframe base no está: un sostén de algo que no existe
 * no es un objeto degradado, es una pregunta mal hecha.
 */
export function reconstruirSosten(
  base: string,
  at: number,
  ease: ChoreoEase,
  turn?: 'short' | 'literal',
): ChoreoKeyframe | null {
  const anterior = CHOREO_KEYFRAMES.find((k) => k.name === base)
  if (anterior === undefined) return null
  return { at, name: `${base} · sostén`, ease, ...(turn === undefined ? {} : { turn }), pose: anterior.pose }
}

/** Los cinco canales de dos poses, comparados uno por uno. */
export function mismaPose(a: ChoreoKeyframe, b: ChoreoKeyframe): boolean {
  return (
    a.pose.angleDeg === b.pose.angleDeg &&
    a.pose.height === b.pose.height &&
    a.pose.distance === b.pose.distance &&
    a.pose.frameX === b.pose.frameX &&
    a.pose.frameY === b.pose.frameY
  )
}

/** El `to` del tramo que lleva ese nombre. Es dónde cae su sostén. */
export function cierreDelTramo(nombre: string): number {
  const tramo = CHOREO_TRAMOS.find((t) => t.name === nombre)
  if (tramo === undefined) throw new Error(`tramo desconocido: ${nombre}`)
  return tramo.to
}

/** El sostén del hero, tal como estaba antes de V3-B. */
export const SOSTEN_DEL_HERO = reconstruirSosten('hero', cierreDelTramo('hero'), 'shift')

/** La pista de HOY: la del archivo, sin el sostén del hero. */
export const PISTA_SIN_SOSTEN: Track = makeTrack(CHOREO_KEYFRAMES)

/**
 * La pista de ANTES: la de hoy con el sostén reconstruido insertado en su lugar.
 * Se ordena por `at` para no depender de dónde caiga en el array.
 */
export const PISTA_CON_SOSTEN: Track = makeTrack(
  (SOSTEN_DEL_HERO === null ? [...CHOREO_KEYFRAMES] : [...CHOREO_KEYFRAMES, SOSTEN_DEL_HERO]).sort(
    (a, b) => a.at - b.at,
  ),
)

// ── La velocidad, en las DOS unidades ───────────────────────────────────────

/**
 * ⚠ **LAS DOS UNIDADES, Y POR QUÉ HACEN FALTA LAS DOS.**
 *
 * `speedAt` (del arnés) mide en **alturas de cuadro por unidad de PROGRESO**, que
 * es la unidad con la que se compuso el recorrido y la que `choreography.ts`
 * publica (pico 75,3 · tirón 31,2). Es la unidad correcta para comparar dos
 * coreografías entre sí.
 *
 * **No es la unidad de «queda violento».** Lo que el humano controla es el
 * SCROLL, y cada tramo reparte su progreso sobre una cantidad distinta de
 * pantallas: el tramo `demos` corre a 0,025 de progreso por pantalla y el
 * `cierre` a 0,250 — diez veces más—, así que el mismo número de alturas por
 * unidad de progreso se siente diez veces más rápido en uno que en otro. La
 * segunda unidad es **alturas de cuadro por PANTALLA DE SCROLL**, que es el
 * producto de la primera por el ritmo del segmento, y es la que se compara
 * contra el resto del recorrido para decidir si el arranque es violento.
 */
export interface PerfilDeSegmento {
  readonly tramo: string
  readonly pantallas: number
  readonly ritmo: number
  /** Pico de `speedAt` en el segmento: alturas de cuadro por unidad de progreso. */
  readonly porProgreso: number
  /** El mismo pico en alturas de cuadro por PANTALLA de scroll. */
  readonly porPantalla: number
}

/**
 * EL MARGEN CON EL QUE SE ESQUIVAN LOS BORDES, y por qué existe.
 *
 * `speedAt` es una diferencia centrada de ventana ±5×10⁻⁴, así que **en** el
 * borde de un tramo la ventana se mete en el segmento siguiente y devuelve el
 * arranque de ÉSE, no la velocidad de éste. Es el instrumento, no la cámara —
 * `probe-escena/__tests__/s9-recorrido.invariant.ts` ya lo declara con esas
 * palabras y por eso muestrea hasta 0,1245 y no hasta 0,125. Acá el margen es
 * explícito y del triple de la ventana, para los dos bordes de cada segmento.
 */
export const MARGEN_DEL_BORDE = 1.5e-3

/** El perfil de los seis segmentos sobre una pista, en las dos unidades. */
export function perfilDeSegmentos(pista: Track, muestras = 400): readonly PerfilDeSegmento[] {
  let acumulado = 0
  return RITMO_POR_SEGMENTO.map((r) => {
    const desde = acumulado
    acumulado += r.progreso
    const util = r.progreso - 2 * MARGEN_DEL_BORDE
    let pico = 0
    for (let i = 0; i <= muestras; i += 1) {
      const p = desde + MARGEN_DEL_BORDE + (util * i) / muestras
      const v = speedAt(pista, p)
      if (v > pico) pico = v
    }
    return {
      tramo: r.tramo,
      pantallas: r.pantallas,
      ritmo: r.porPantalla,
      porProgreso: pico,
      porPantalla: pico * r.porPantalla,
    }
  })
}

/** El pico del recorrido entero, en alturas de cuadro por PANTALLA de scroll. */
export function picoPorPantalla(perfil: readonly PerfilDeSegmento[]): number {
  return perfil.reduce((m, s) => Math.max(m, s.porPantalla), 0)
}

/**
 * EL MAYOR ESCALÓN DE VELOCIDAD EN UN NUDO, en alturas por pantalla de scroll.
 *
 * Es el tirón de `s9-composicion` llevado a la unidad del scroll, y en un nudo
 * salta por DOS motivos a la vez: la curva del keyframe cambia de pendiente y el
 * ritmo del segmento cambia de valor. Los dos los siente el mismo dedo, así que
 * se miden juntos.
 */
export function escalonEnElNudo(pista: Track, indice: number, epsilon = MARGEN_DEL_BORDE): number {
  let acumulado = 0
  for (let i = 0; i <= indice; i += 1) acumulado += RITMO_POR_SEGMENTO[i].progreso
  const antes = speedAt(pista, acumulado - epsilon) * RITMO_POR_SEGMENTO[indice].porPantalla
  const despues = speedAt(pista, acumulado + epsilon) * RITMO_POR_SEGMENTO[indice + 1].porPantalla
  return Math.abs(despues - antes)
}

/** El mayor de esos escalones, y en qué nudo cae. */
export function mayorEscalonEnLosNudos(pista: Track): { readonly nudo: string; readonly valor: number } {
  let peor = { nudo: '', valor: 0 }
  for (let i = 0; i < RITMO_POR_SEGMENTO.length - 1; i += 1) {
    const valor = escalonEnElNudo(pista, i)
    if (valor > peor.valor) {
      peor = { nudo: `${RITMO_POR_SEGMENTO[i].tramo} → ${RITMO_POR_SEGMENTO[i + 1].tramo}`, valor }
    }
  }
  return peor
}

/** El azimut de una pista en un progreso. Desenvuelto, como lo publica el track. */
export function azimutEn(pista: Track, progreso: number): number {
  const pose = emptyPose()
  sampleTrack(pista, progreso, pose)
  return pose.angleDeg
}

/** La pose entera de una pista en un progreso, como texto de una línea. */
export function poseEn(pista: Track, progreso: number): string {
  const pose = emptyPose()
  sampleTrack(pista, progreso, pose)
  return (
    `azimut ${pose.angleDeg.toFixed(1)}° · altura ${pose.height.toFixed(2)} · ` +
    `distancia ${pose.distance.toFixed(2)} · frameX ${pose.frameX.toFixed(3)}`
  )
}

// ── Los dos acoplamientos con el DOM, leídos del fuente ─────────────────────

/** La ruta del componente que emite la `<section>` de cada sección. */
export const RUTA_DEL_PANEL = 'src/app/v3/_componentes/Panel.tsx'

/**
 * ¿La `<section>` de `Panel.tsx` sigue emitiendo el atributo con el que
 * `extensionDeLasSecciones.ts` la agarra?
 *
 * Se busca el atributo **atado al `id` de la sección**, no la cadena suelta: un
 * `data-panel` en cualquier otro lado del archivo no serviría para seleccionar
 * las ocho.
 */
export function emiteElAtributo(fuente: string, atributo: string): boolean {
  return new RegExp(`\\n\\s*${atributo}=\\{seccion\\.id\\}`).test(fuente)
}

/**
 * ¿Las clases que `Panel.tsx` le pone a la `<section>` llevan alguna
 * transformación?
 *
 * Es la condición de validez de `getBoundingClientRect` que `CLAUDE.md`
 * documenta. Se mira el `className` del panel —la cadena literal más las clases
 * de las tres superficies— y no el archivo entero: una utilidad de transform en
 * un comentario o en otro componente no mueve esta caja.
 */
export const UTILIDADES_DE_TRANSFORM =
  /\b(?:-?translate-[xyz]?|-?rotate|-?skew-[xy]|scale-?[xy]?|transform)\b/

export function clasesConTransform(clases: readonly string[]): readonly string[] {
  return clases.filter((c) => UTILIDADES_DE_TRANSFORM.test(c))
}

/**
 * §3a DEL INVARIANTE — los dos acoplamientos con el DOM, y los tres bordes de
 * `extensionDeLasSecciones`.
 *
 * Vive acá por la regla de las 300 líneas, y el corte es por tema: son las
 * afirmaciones sobre el FUENTE y sobre la MEDICIÓN, no sobre el mapeo. Los dos
 * detectores que corre están arriba en este mismo archivo, que es lo que permite
 * que sus controles positivos corran la MISMA función.
 */
export function afirmarLosAcoplamientosConElDom(): void {
  const PANEL = fuenteDe(RUTA_DEL_PANEL)
  afirmar(
    emiteElAtributo(PANEL, ATRIBUTO_DEL_PANEL),
    `\`Panel.tsx\` sigue emitiendo \`${ATRIBUTO_DEL_PANEL}={seccion.id}\` — es de donde agarra el selector`,
    SELECTOR_DE_LAS_SECCIONES,
  )
  controlPositivo(
    'y el detector no da verde con un atributo que el panel no emite',
    'data-inventado',
    (atributo: string) => emiteElAtributo(PANEL, atributo),
  )
  const CLASES_DEL_PANEL = ['relative', 'z-10', 'w-full', ...Object.values(SUPERFICIES).flatMap((s) => s.clases.split(/\s+/))]
  afirmar(
    clasesConTransform(CLASES_DEL_PANEL).length === 0,
    'ninguna clase de la `<section>` lleva `transform` — la condición de `getBoundingClientRect`',
    CLASES_DEL_PANEL.filter((c) => c.length > 0).join(' · '),
  )
  controlPositivo(
    'el detector de transformaciones ve una: no es un `false` constante',
    ['relative', 'translate-y-4'],
    (clases: readonly string[]) => clasesConTransform(clases).length === 0,
  )

  afirmarIgual(
    medirLasSecciones({ querySelectorAll: () => [] }, 0),
    null,
    'sin secciones que medir la extensión es `null` — no un cero que se propaga',
  )
  afirmarIgual(
    medirLasSecciones(
      {
        querySelectorAll: () => [
          { getBoundingClientRect: () => ({ top: -1200, bottom: -300 }) },
          { getBoundingClientRect: () => ({ top: -300, bottom: 600 }) },
        ],
      },
      1200,
    ),
    { arriba: 0, abajo: 1800 },
    'y con dos cajas devuelve el envolvente en coordenadas del DOCUMENTO: se le suma el `scrollY` de la misma lectura',
  )
  controlPositivo(
    'una caja con un borde que no es número descarta la medición en vez de propagar NaN',
    [{ arriba: 0, abajo: Number.NaN }],
    (cajas: readonly { arriba: number; abajo: number }[]) => extensionDe(cajas) !== null,
  )
}
