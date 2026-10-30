/**
 * [B12a.2] LA PISTA DE LA INTRO DE UNA PÁGINA — de la composición inicial (avance 0) a la pose de la intro (avance 1), en
 * `PANTALLAS_DE_LA_INTRO` pantallas de scroll sobre el bloque de la intro (plan `docs/rediseno/SPRINT-B12a.md` §5 y §10). [B12a.8] La
 * pose se estira a lo largo de la intro entera (2,5 pantallas).
 *
 * ── La composición inicial, compartida ──────────────────────────────────
 *
 * Todas las páginas arrancan de la misma pose: la del hero del home (`CHOREO_KEYFRAMES[0]`) con el logo CENTRADO. Se copia, no se toca:
 * esa pose es el destino del preloader del sitio vivo (`src/lib/scene-framing.ts:144`) y moverla movería el intro de producción.
 *
 * ── La pose de la intro: GIRAR ───────────────────────────────────────────
 *
 * Valentino la eligió entre tres (2026-10-20; eran `?intro=1|2|3`: acercarse, girar y subir, y la bandera se fue con las otras dos): un
 * cuarto de vuelta corto alrededor del logo, a media altura (se ve su espesor). Deja el logo centrado (el título va encima) y queda adentro
 * del rango del recorrido del home (alturas y distancias que el home ya usa).
 */

import { buildTrack, sampleLightArc, type ChoreoTrack } from '../choreographySampler'
import type { ChoreoKeyframe, ChoreoPose, MutableLightLevels } from '../choreographyTypes'
import { hayBanco } from '../entorno'
import { NIVEL_DE_LA_NOCHE } from '../lightArc'

import { presetActual, type PresetDeLaEscena } from './preset'
import { nivelConLaNocheDelViaje, nocheDelViaje } from './viajeDelServicio'

/**
 * Lo que dura la intro, en pantallas de scroll: el avance va de 0 a 1 en eso. [B12a.8] 2,5 (era 1,5: la parte 3D quedaba corta): el
 * título con su bajada, «de qué se trata» sobre la escena y, en la última pantalla, el papel. Calibrable: el bloque lo lee (su alto es
 * una variable de CSS con este número). [L7a] 1,8: «poca animación al principio y pasa rápido al fondo» (Valentino, ESTRUCTURA-PAGINAS):
 * el papel asoma pasada una pantalla escasa de scroll.
 */
export const PANTALLAS_DE_LA_INTRO = 1.8

/**
 * [B12a.8] El tramo del título, en pantallas del alto de la intro: el `h1` y la bajada van fijos arriba mientras dura; después pasa «de
 * qué se trata» (el resto de la intro, sobre la escena todavía) y entra el papel. [L7a] 1,4: tiene que pasar de 1 + la anticipación de la
 * caída (`CAIDA_DEL_TITULO.antes`, 0,2) o el título caería sin scroll; con 1,4 cae a las 0,2 pantallas.
 */
export const TRAMO_DEL_TITULO = 1.4

/** La composición inicial: la pose del hero del home con el logo centrado (`frameX` 0). */
export const COMPOSICION_INICIAL: ChoreoPose = { angleDeg: 0, height: 6.4, distance: 19, frameX: 0, frameY: 0 }

/** La pose de la intro (avance 1): girar. */
export const POSE_DE_LA_INTRO: ChoreoPose = { angleDeg: 38, height: 5.2, distance: 15, frameX: 0, frameY: 0 }

/**
 * La pista de la intro, COMPARTIDA (P-H29 g): de la composición inicial a la pose de la intro. La declara cada página en su preset (`pista`);
 * es el mismo arreglo siempre, así la escena la arma una sola vez.
 */
export const PISTA_DE_LA_INTRO: readonly ChoreoKeyframe[] = [
  { at: 0, name: 'composicion-inicial', pose: COMPOSICION_INICIAL },
  { at: 1, name: 'intro-girar', ease: 'linear', pose: POSE_DE_LA_INTRO },
]

/**
 * [M1] LA INTRO DE DÍA — la apertura del home hasta Quiénes somos (Valentino: «que sea la intro y luego hace el giro de nosotros y luego
 * ahí entra el blanco»): el tramo del título (`TRAMO_DEL_TITULO`, como la de noche) y el GIRO del home hacia Quiénes somos, dos pantallas
 * con el bloque de la página fijo del lado contrario al logo; después, el papel. Las páginas de noche (servicios) siguen con la suya.
 */
export const PANTALLAS_DEL_GIRO = 2
export const PANTALLAS_DE_LA_INTRO_DE_DIA = TRAMO_DEL_TITULO + PANTALLAS_DEL_GIRO

/** El giro, en pantallas de scroll desde el tope de la intro: arranca con el título ya caído y termina cuando el bloque se suelta. */
export const GIRO_EN_PANTALLAS = { desde: 0.6, hasta: PANTALLAS_DE_LA_INTRO_DE_DIA - 1 } as const

/** La pose de Quiénes somos en el home (`CHOREO_KEYFRAMES`, `at: 0.375`): el destino del giro. Su encuadre lo pone el hueco del bloque. */
export const POSE_DE_QUIENES_SOMOS: ChoreoPose = { angleDeg: 130, height: -3.6, distance: 14, frameX: -0.8, frameY: 0 }

/** La pista de día: quieta en la composición inicial (el hero), el giro con la curva y la vuelta literal del home, y quieta en Quiénes somos. */
export const PISTA_DE_LA_INTRO_DE_DIA: readonly ChoreoKeyframe[] = [
  { at: 0, name: 'composicion-inicial', pose: COMPOSICION_INICIAL },
  { at: GIRO_EN_PANTALLAS.desde / PANTALLAS_DE_LA_INTRO_DE_DIA, name: 'hero', ease: 'linear', pose: COMPOSICION_INICIAL },
  { at: GIRO_EN_PANTALLAS.hasta / PANTALLAS_DE_LA_INTRO_DE_DIA, name: 'quienes-somos', ease: 'shift', turn: 'literal', pose: POSE_DE_QUIENES_SOMOS },
  { at: 1, name: 'sosten', ease: 'linear', pose: POSE_DE_QUIENES_SOMOS },
]

/**
 * Si la página PUEDE llevar la intro de día (de día y con pista). La lleva si además tiene su bloque («de qué se trata»): sin bloque (una
 * nota del blog) quedaría un giro de dos pantallas vacías, y se queda con la intro corta. El DOM lo decide (`tieneIntroLarga`) y avisa a la
 * escena montando el marco del giro (`INTRO_LARGA_MONTADA`).
 */
export const esDeDiaConPista = (preset: PresetDeLaEscena | null): boolean => preset !== null && preset.pista !== null && preset.noche === 'dia'

/** Lo que decide el DOM de la intro: de día, con pista y con su bloque. */
export const tieneIntroLarga = (preset: PresetDeLaEscena | null, hayBloque: boolean): boolean => esDeDiaConPista(preset) && hayBloque

/** Cuántos marcos del giro hay montados (con la navegación cliente la página nueva se monta antes de que se vaya la vieja): la escena sabe así que la intro de esta página es la larga. */
export const INTRO_LARGA_MONTADA: { montados: number } = { montados: 0 }

/** Lo que lee la escena: la intro de esta página es la de día (la página lo permite y el DOM montó el giro). */
export const esIntroDeDia = (preset: PresetDeLaEscena | null): boolean => esDeDiaConPista(preset) && INTRO_LARGA_MONTADA.montados > 0

/** Lo que dura la intro de una página, en pantallas: la de día o la de noche. */
export const pantallasDeLaIntro = (preset: PresetDeLaEscena | null): number => (esIntroDeDia(preset) ? PANTALLAS_DE_LA_INTRO_DE_DIA : PANTALLAS_DE_LA_INTRO)

/** Cuánto del giro pasó (0…1) en un avance de la intro de día: el peso del encuadre del bloque contra el del título. */
export function avanceDelGiro(avance: number): number {
  const desde = GIRO_EN_PANTALLAS.desde / PANTALLAS_DE_LA_INTRO_DE_DIA
  const hasta = GIRO_EN_PANTALLAS.hasta / PANTALLAS_DE_LA_INTRO_DE_DIA
  const t = (avance - desde) / (hasta - desde)
  return t <= 0 ? 0 : t >= 1 ? 1 : t
}

/**
 * El avance de la intro (0…1): 0 con el tope del bloque en el tope del cuadro, 1 después de `pantallas` pantallas (las de la intro de la
 * página; sin ellas, `PANTALLAS_DE_LA_INTRO`). `arriba`: el tope del bloque en el documento, medido en el LAYOUT (nunca con `scrollHeight`:
 * lección de PULIDO 19).
 */
export function avanceDeLaIntro(arriba: number, scrollY: number, alto: number, pantallas: number = PANTALLAS_DE_LA_INTRO): number {
  if (!(alto > 0)) return 0
  return Math.min(1, Math.max(0, (scrollY - arriba) / (pantallas * alto)))
}

/**
 * El avance de la intro de la página de ahora (0…1): lo escribe la lectura del scroll y lo lee el rig en su cuadro (y, desde B12a.7, la
 * variante: §3.4). Es un canal propio, NO el progreso del rig: ese lo leen también los títulos, el polvo, la formación y el entorno con
 * el significado del home, y en una página quedan en el del hero.
 */
export const AVANCE_DE_LA_INTRO: { current: number } = { current: 0 }

// Sólo con banco: el avance, para medirlo en el sitio (la intro a `PANTALLAS_DE_LA_INTRO` pantallas, ± 1 %).
if (hayBanco()) (window as Window & { __avanceDeLaIntro?: () => number }).__avanceDeLaIntro = () => AVANCE_DE_LA_INTRO.current

const pistas = new WeakMap<PresetDeLaEscena, { readonly track: ChoreoTrack; readonly noche: boolean }>()
const pistasLargas = new WeakMap<PresetDeLaEscena, { readonly track: ChoreoTrack; readonly noche: boolean }>()

/**
 * La pista de la página de ahora (y si es de noche), o `null`: el home (su pista es `CHOREO_KEYFRAMES`) o una página sin pista. La lee
 * el rig en su cuadro; cada pista se arma una vez por preset (sin crear nada por cuadro).
 */
export function pistaDeLaPagina(): { readonly track: ChoreoTrack; readonly noche: boolean } | null {
  const preset = presetActual()
  if (preset === null || preset.pista === null) return null
  // [M1] Con la intro larga, la apertura de día (el giro de Quiénes somos); si no, la pista que declara la página. Una caché por cada una.
  const larga = esIntroDeDia(preset)
  const cache = larga ? pistasLargas : pistas
  let pagina = cache.get(preset)
  if (pagina === undefined) {
    pagina = { track: buildTrack(larga ? PISTA_DE_LA_INTRO_DE_DIA : preset.pista), noche: preset.noche === 'noche' }
    cache.set(preset, pagina)
  }
  return pagina
}

/**
 * La luz del cuadro: en el home, la del recorrido; en una página, la del principio del recorrido y, con la noche del preset, acotada a la
 * noche. Va ANTES de la noche disparada, así el nivel natural que ella publica (el que leen los módulos de noche) ya es el de la página.
 */
export function luzDeLaPagina(pagina: { readonly noche: boolean } | null, progreso: number, arc: MutableLightLevels): void {
  sampleLightArc(pagina === null ? progreso : 0, arc)
  // [B12b] Con el viaje del CTA de un servicio la noche entra de a poco (fuera de un viaje, el mínimo de siempre, exacto).
  if (pagina?.noche === true) arc.level = nivelConLaNocheDelViaje(arc.level, NIVEL_DE_LA_NOCHE, nocheDelViaje(performance.now()))
}
