/**
 * EL BANCO DEL ENCUADRE DEL HERO — cómo se mide, y la lista de lo que quedó
 * fuera de la zona del frente.
 *
 * ⚠ **Este archivo NO se escanea por tokens.** Igual que `s10-logo.ts` y
 * `s10-logo-lectura.ts`: sus números son coordenadas de cuadro, tamaños de
 * grilla y grados de campo, no valores de diseño.
 *
 * Sale de `s16-encuadre.invariant.ts` por la regla de 300 líneas del repo, y el
 * corte tiene la misma costura que el de `s10-logo`: **acá se mide, allá se
 * afirma.** Nada de este archivo decide si un número está bien.
 *
 * ── LAS TRES MEDICIONES QUE VIVEN ACÁ ─────────────────────────────────────
 *
 *   · `medir` — la caja del logo en el cuadro y **los cuatro aires en la misma
 *     unidad**, que es lo que hace comparable «el margen derecho es el más
 *     chico». Sin la conversión de los verticales a ancho de cuadro esa frase
 *     compararía dos unidades distintas: a 16:9 el alto vale 0,5625 del ancho.
 *   · `desvioDelEje` — cuántos grados le apunta la cámara AFUERA del logo. Es
 *     la misma decisión de `frameX` leída en la unidad de la sala, y no sale de
 *     la grilla: se calcula con `angularOffset` sobre la cámara de producción,
 *     así que no arrastra el tamaño de celda del muestreo.
 *   · `PENDIENTES` — lo que este frente rompió o dejó desactualizado en
 *     archivos que su zona le prohíbe tocar, **detectado sobre el fuente** con
 *     el patrón de `s13b-pendientes.ts`: la lista se vacía sola.
 */

import { CHOREO_KEYFRAMES } from '../choreography'
// prettier-ignore
import { angularOffset, emptyPose, halfFovDeg, makeTrack, type Track } from '@/app/probe-escena/__tests__/harness'
import { muestrearLogo } from './s10-logo'
import { ESCENA_REAL, cajaDelLogo, cobertura, fraccionDentro, type Ventana } from './s10-logo-lectura'
import { PROGRESOS_DEL_HERO, CUADROS } from './s13b-encuadre'
import { camaraEnCuadro } from './camaraDelCuadro'
import { fuenteDe } from './s13b-soporte'

/** El valor con el que V3-E empezó. Se proyecta como hipótesis, no se escribe. */
export const FRAME_X_ANTES = 0.68
/** El de hoy, leído del recorrido: si alguien lo mueve, este banco lo sigue. */
export const FRAME_X_HOY = CHOREO_KEYFRAMES[0].pose.frameX

/** Una pista con el `frameX` del hero cambiado, sobre una COPIA del array. */
export function pistaCon(frameX: number): Track {
  return makeTrack(
    CHOREO_KEYFRAMES.map((k) => (k.name === 'hero' ? { ...k, pose: { ...k.pose, frameX } } : k)),
  )
}

export interface Aires {
  readonly dentro: number
  readonly cobertura: number
  readonly toca: boolean
  readonly x0: number
  readonly x1: number
  /** Los cuatro aires, en fracción de ANCHO de cuadro los cuatro. */
  readonly izquierda: number
  readonly derecha: number
  readonly abajo: number
  readonly arriba: number
}

/** La caja del logo y sus cuatro aires, en un cuadro y un progreso. */
export function medir(
  pista: Track,
  v: Ventana,
  progreso: number,
  columnas = 300,
  filas = 220,
): Aires {
  const m = muestrearLogo(progreso, v.aspecto, ESCENA_REAL, columnas, filas, 2.6, pista)
  const c = cajaDelLogo(m)
  if (c === null) throw new Error(`sin tinta del logo en ${v.etiqueta} · p=${progreso}`)
  return {
    dentro: fraccionDentro(m),
    cobertura: cobertura(m),
    toca: m.tocaElBorde,
    x0: c.x0,
    x1: c.x1,
    izquierda: (c.x0 + 1) / 2,
    derecha: (1 - c.x1) / 2,
    abajo: (c.y0 + 1) / 2 / v.aspecto,
    arriba: (1 - c.y1) / 2 / v.aspecto,
  }
}

export interface Fila extends Aires {
  readonly v: Ventana
  readonly p: number
}

/** Las 21 muestras de la ventana del hero —siete cuadros × tres progresos—. */
export function tabla(frameX: number): readonly Fila[] {
  const pista = pistaCon(frameX)
  return CUADROS.flatMap((v) => PROGRESOS_DEL_HERO.map((p) => ({ ...medir(pista, v, p), v, p })))
}

/**
 * ¿El eje óptico cae DENTRO de la caja del logo?
 *
 * El eje es **x = 0 por definición** —es el centro del cuadro—, así que la
 * pregunta se contesta con el signo del borde izquierdo de la caja: si `x0` es
 * positivo, el eje quedó a la izquierda del logo y la cámara está apuntando a
 * piso vacío.
 */
export const ejeAdentro = (a: Aires): boolean => a.x0 <= 0

/**
 * ¿El margen derecho dejó de ser el más chico de los tres que aprietan?
 *
 * El izquierdo no entra en la cuenta y no es un olvido: la composición del Hero
 * pone el titular a la izquierda, así que ese aire es estructural y siempre es
 * el más grande. Los tres que compiten son el derecho y los dos verticales.
 */
export const derechaNoAprieta = (a: Aires): boolean => a.derecha > a.arriba && a.derecha > a.abajo

/** Las dos condiciones juntas, que son las que eligen el valor. */
export const cumpleElCriterio = (a: Aires): boolean => ejeAdentro(a) && derechaNoAprieta(a)

/** El medio campo horizontal del cuadro, en grados. */
export const medioCampo = (v: Ventana): number => halfFovDeg(v.aspecto).h

/**
 * CUÁNTOS GRADOS LE APUNTA LA CÁMARA AFUERA DEL LOGO, con la cámara de
 * producción y sin pasar por la grilla.
 *
 * `frameX` no corre el logo dentro de un cuadro fijo: **rota la cámara**. Lo
 * que se pierde del lado del logo es exactamente este ángulo de sala, y lo que
 * se gana del otro lado es el mismo — por eso la cifra se publica contra el
 * medio campo y no sola.
 */
export function desvioDelEje(frameX: number, v: Ventana, progreso = 0): number {
  const pose = emptyPose()
  const cam = camaraEnCuadro(pistaCon(frameX), progreso, v.aspecto, pose)
  return angularOffset(cam, [0, 0, 0]).h
}

const pct = (x: number): string => `${(x * 100).toFixed(2)}%`

export function lineasDeLaTabla(filas: readonly Fila[]): readonly string[] {
  return [
    'cuadro       aspecto    p       dentro   cobert     x0       x1      izq     der     abajo   arriba',
    ...filas.map(
      (f) =>
        `${f.v.etiqueta.padEnd(11)} ${f.v.aspecto.toFixed(4)}  ${f.p.toFixed(4)}  ${pct(f.dentro).padStart(7)}  ` +
        `${pct(f.cobertura).padStart(7)}  ${f.x0.toFixed(4).padStart(7)} ${f.x1.toFixed(4).padStart(6)}  ` +
        `${f.izquierda.toFixed(4)}  ${f.derecha.toFixed(4)}  ${f.abajo.toFixed(4)}  ${f.arriba.toFixed(4)}` +
        `${f.toca ? '  ⚠ TOCA' : ''}`,
    ),
  ]
}

export function lineasDeLaBarrida(valores: readonly number[], v: Ventana): readonly string[] {
  return [
    'frameX     x0       der      abajo    arriba   desvío    eje adentro   der no aprieta',
    ...valores.map((fx) => {
      const a = medir(pistaCon(fx), v, 0)
      return (
        `${fx.toFixed(2)}     ${a.x0.toFixed(4).padStart(7)}  ${a.derecha.toFixed(4)}   ${a.abajo.toFixed(4)}   ` +
        `${a.arriba.toFixed(4)}   ${desvioDelEje(fx, v).toFixed(3).padStart(6)}°   ` +
        `${ejeAdentro(a) ? 'sí ' : 'NO '}           ${derechaNoAprieta(a) ? 'sí' : 'NO'}`
      )
    }),
  ]
}

// ── Lo que quedó fuera de la zona ───────────────────────────────────────────

export interface Pendiente {
  readonly archivo: string
  readonly marca: string
  readonly sintoma: string
  readonly arreglo: string
}

/**
 * ⚠ **NO SE AFIRMA QUE EL PENDIENTE EXISTA.** Es el patrón de
 * `s13b-pendientes.ts`: un invariante que se pone rojo porque alguien arregló
 * algo es peor que ninguno. Lo que se afirma es que el detector DISCRIMINA, y
 * la lista se vacía sola a medida que los arreglos se aplican.
 *
 * Los cuatro primeros son **rojos de verdad** en `test:s8e-encuadre`, y los
 * cuatro son el mismo caso: afirmaciones escritas contra el literal que producía
 * `frameX: 0.68`. La regla 15 dice que se REESCRIBEN contra la propiedad nueva,
 * no que se aflojen — y el arreglo de cada una está escrito para poder aplicarlo
 * sin volver a medir nada.
 */
export const PENDIENTES: readonly Pendiente[] = [
  {
    archivo: 'src/lib/scene-framing.invariant.ts',
    marca: 'Math.abs(desktop.centerXPx - 1018) < 1.5',
    sintoma: 'ROJO en `test:s8e-encuadre` — «el centro cae en (1018, 428)», que hoy da (940, 417)',
    arreglo:
      'reescribir los dos literales de §3: 1018 → 940 y 428 → 417, y la etiqueta con ellos',
  },
  {
    archivo: 'src/lib/scene-framing.invariant.ts',
    marca: 'Math.abs(desktop.inkWidthPx - 451) < 2',
    sintoma: 'ROJO — «la tinta mide 451 × 313 px», que hoy da 445 × 310',
    arreglo: '451 → 445 y 313 → 310, y en la etiqueta «un 14% más chica» → «un 15% más chica»',
  },
  {
    archivo: 'src/lib/scene-framing.invariant.ts',
    marca: 'desktop.centerXPx / 1440 > 0.7',
    sintoma:
      'ROJO — «el logo NO cae centrado: la composición lo manda a la derecha», que hoy da 65,3% del ancho',
    arreglo:
      'bajar el umbral a > 0.6 — el logo sigue a la derecha, con 65,3% contra el 50,0% de un encuadre centrado, que es el contrafactual que esa comprobación existe para descartar',
  },
  {
    archivo: 'src/lib/scene-framing.invariant.ts',
    marca: 'Math.abs(desktop.centerYPx - 405) > 20',
    sintoma:
      'DOS ROJOS en §6 — el error contra la aproximación lineal bajó de 22,8 a 12,5 px (umbral 15) y el corrimiento vertical de 22,8 a 12,5 (umbral 20). Lo que la sección afirma sigue siendo cierto: la aproximación sigue sin ver el corrimiento vertical. Sólo que la cámara rota menos, así que el corrimiento es más chico',
    arreglo:
      'bajar los dos umbrales (15 → 8 y 20 → 8) y actualizar el comentario de §6, que cita «5 px en X y 61 px en Y» de la pose vieja y 22,8 de la de S9',
  },
  {
    archivo: 'src/app/v3/_lib/escena/choreography.ts',
    marca: 'hoy da **451 × 313 px** en una ventana de 1440×810',
    sintoma:
      'NINGÚN rojo, y por eso importa: es el docblock de CABECERA del archivo —fuera del comentario del keyframe, que es lo único que este frente podía tocar— y sigue publicando el destino viejo',
    arreglo:
      '451 × 313 px → 445 × 310 px. La elevación de entrada (18,6°) NO se movió: `frameX` no entra en esa cuenta',
  },
  {
    archivo: 'src/components/layout/home-intro/introHandoff.ts',
    marca: 'aterriza en **(1018,4 · 427,8)** con una tinta de 451×313 px',
    sintoma:
      'NINGÚN rojo: es prosa del contrato del intro con el destino viejo. `introLanding.invariant.ts` sigue midiendo 0,0000 px de error en las tres ventanas, así que el relevo está bien y lo único que quedó atrás es el texto',
    arreglo: '(1018,4 · 427,8) → (939,7 · 417,5) y 451×313 → 445×310',
  },
  {
    archivo: 'src/app/v3/_lib/escena/__tests__/s13b-escena.invariant.ts',
    marca: 'V3-B no tocó `frameX`',
    sintoma:
      'NINGÚN rojo: es el DETALLE de una afirmación que sigue en verde porque compara la pose contra sí misma. El texto dice que nadie tocó `frameX` del hero, y V3-E lo tocó',
    arreglo:
      'reescribir el detalle: lo que esa afirmación protege es que el intro proyecte la pose VIVA, y eso vale igual con 0,5 — lo que cambió es el valor, no de dónde sale',
  },
]

/** ¿La marca sigue en el fuente? Lanza si el archivo no se puede leer. */
export const sigueAbierto = (p: Pendiente): boolean => fuenteDe(p.archivo).includes(p.marca)
