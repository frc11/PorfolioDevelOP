/**
 * EL FINAL DEL RECORRIDO — los cinco tiempos de «Por qué develOP» y el pie, sobre el
 * scroll. **[FINAL]**
 *
 * La escena se extiende con la coreografía de siempre: el tramo `cierre` corre sobre
 * «Por qué develOP» con su ancla declarada, y adentro de él los keyframes caen donde este
 * archivo dice. No hay un segundo sistema: el progreso de cada tiempo SALE de la recta del
 * tramo —el ancla en el arranque del pin, 1 en el último píxel de scroll—, así que la
 * sección, la cámara y el arco leen la misma cuenta.
 *
 *     A · frase        frontal y centrado; se alcanza ESCONDIDO detrás de Tu Panel
 *     B · valores      más cerca y desde abajo (contrapicado)
 *     C · CTA          el mismo plano; la cámara sube hasta quedar derecha
 *     D · alejamiento  de golpe, lejos (la excepción declarada al techo de velocidad)
 *     E · pie          plano abierto, el logo en el centro
 *
 * Las medidas salen de nk.studio a 1440 × 900 (`docs/rediseno/SPRINT-FINAL.md`, fase 0):
 * la barra de nk mide 343 px en la frase, 580 en los valores, 665 al nivelarse y 172 en el
 * pie, y el alejamiento la achica ×3,9 en 50 px de scroll. Acá se traducen a distancia con
 * el logo de 4,78 de tinta y 35° de campo: de frente ocupa `7,58 / d` del alto del cuadro.
 *
 * No importa nada de la escena: lo leen `choreography.ts`, `anclaje.ts` y `lightArc.ts`, y
 * los tres dependerían de él en círculo si importara a alguno.
 */

import { PANTALLAS_DE_POR_QUE_DEVELOP } from '../secciones'
import { recorridoDeEncuadre } from './encuadre'

/**
 * EL ANCLA DE «POR QUÉ develOP»: el progreso en que la sección llena el cuadro, que es
 * donde arranca su pin. Es la de V3-E (0,8525) y se declara acá para que el anclaje, el
 * arco y los keyframes la lean de un solo lugar.
 */
export const ANCLA_DE_POR_QUE_DEVELOP = 0.8525

/**
 * LOS TIEMPOS, en pantallas contadas desde el arranque del pin (la sección llena el
 * cuadro en 0). Cada uno dice dónde se LLEGA a su pose y hasta dónde se SOSTIENE.
 *
 * ⚠️ La frase llega en −1: es la pantalla en que la sección asoma por el pie del cuadro.
 * Su pose se alcanza en el nudo del tramo anterior, escondida detrás de Tu Panel, así que
 * el primer cuadro en que se ve la escena ya es A.
 */
export const TIEMPOS_DEL_FINAL = {
  // [PASADA FINAL] A3 · la frase se ARMA en las primeras 0,6 pantallas del pin (`armada`: la ventana de su llegada, con
  // un mínimo de 1,4 s para que se vea armarse a cualquier velocidad) y se sostiene quieta UNA pantalla entera (hasta
  // 1,6; [RETOQUE PANEL] T3 la dejaba hasta 1 con la llegada en 0,45). Los valores y el CTA corren detrás.
  frase: { llega: -1, armada: 0.6, hasta: 1.6 },
  valores: { llega: 2.4, hasta: 2.6 },
  cta: { llega: 3.6, hasta: PANTALLAS_DE_POR_QUE_DEVELOP - 1 },
  // El alejamiento D es el camino de `cta.hasta` a `pie.llega`: un cuarto de pantalla.
  pie: { llega: PANTALLAS_DE_POR_QUE_DEVELOP - 1 + 0.25, hasta: PANTALLAS_DE_POR_QUE_DEVELOP },
} as const

/** El progreso del recorrido en una pantalla del final (contada desde el arranque del pin). */
export function progresoDelFinal(pantalla: number): number {
  return ANCLA_DE_POR_QUE_DEVELOP + ((1 - ANCLA_DE_POR_QUE_DEVELOP) * pantalla) / PANTALLAS_DE_POR_QUE_DEVELOP
}

/** Las poses de los cinco tiempos (D es el camino entre C y E). */
export const POSES_DEL_FINAL = {
  frase: { angleDeg: 360, height: 1.6, distance: 20, frameX: 0, frameY: 0 },
  // A 16 y no a los 12 que da nk: la barra de nk es angosta y nuestro logo es ancho (medido en
  // contrapicado a 14: 797 × 547 px a 1440 × 900), así que a 1024 × 768 los valores de los
  // costados no entraban. Contrapicado de 11°; el piso admite −3,584 a 16.
  valores: { angleDeg: 360, height: -3.2, distance: 16, frameX: 0, frameY: 0 },
  // [NOCTURNO FINAL] D3 · C: el CTA va centrado en la pantalla; la cámara se aleja (de 16 a 32) y el logo baja al quinto de
  // abajo, contra el borde (`frameY` −1: del 71 al 95 % del alto). Después, el pie lo sube al centro mientras se achica.
  // [PULIDO 1] P17-A · a la altura del logo, con el logo abajo, la cámara miraba para arriba y entraba el techo del domo (el
  // borde de arriba tocaba la pared a 42,9 de altura, 46 con el mouse abajo; el techo está a 40). Ahora mira desde arriba
  // (a 4,5): el pitch baja y el horizonte queda bajo la cúpula; con el mouse en sus dos puntas el borde de arriba no pasa de
  // 36 en todo el camino. Lo que sube y se aleja lo limita el techo de velocidad del final (s23: subir cuesta recorrido): a
  // 31, el logo queda a 31,3 de ojo (era 32). El dolly-in leve al llegar va por tiempo (`DOLLY_DEL_CTA`): la pista sostiene.
  cta: { angleDeg: 360, height: 4.5, distance: 31, frameX: 0, frameY: -1 },
  pie: { angleDeg: 360, height: 5, distance: 40, frameX: 0, frameY: 0 },
} as const

/**
 * El progreso del pin de la sección (0 al clavarse, 1 al soltarse) en una pantalla del
 * final. Es la cuenta con la que la sección reparte sus piezas sobre el mismo scroll que
 * la cámara.
 */
export function progresoDelPin(pantalla: number): number {
  return pantalla / (PANTALLAS_DE_POR_QUE_DEVELOP - 1)
}

/**
 * EL HUECO QUE EL LOGO DEJA en el cuadro, en `svh`: su medio ancho más el aire. El ancho sale
 * medido —a 14, en el contrapicado de B, mide 797 px de un cuadro de 900 (0,886 del alto), y
 * el alto del cuadro a esa distancia es `0,6306 × 14` de mundo: `7,82 / 0,6306 = 12,4`—, así
 * que la frase, los valores y el pie se apoyan a los costados del logo en cualquier ancho.
 */
const ANCHO_DEL_LOGO_POR_DISTANCIA = 12.4
export const AIRE_DEL_LOGO_SVH = 3
export function huecoDelLogo(distancia: number): number {
  return Math.round((ANCHO_DEL_LOGO_POR_DISTANCIA / distancia / 2) * 1000) / 10 + AIRE_DEL_LOGO_SVH
}

/**
 * **[FINAL 2]** Dónde termina el logo por abajo, en `svh` desde arriba del cuadro, de frente y
 * centrado. Medido en C (a 16): del 26 % al 74 % del alto en 1024×768, 1280×720, 1440×900 y
 * 1920×1080 —el campo es vertical, así que no depende del ancho—: `0,48 × 16 = 7,68`.
 */
const ALTO_DEL_LOGO_POR_DISTANCIA = 7.68
/**
 * [NOCTURNO FINAL] D3 · Dónde empieza el logo por arriba, en `svh`, con su encuadre vertical (`frameY`: ±1 lo deja contra el
 * borde, con la franja de papel del margen de seguridad; negativo, abajo). El recorrido es el de la cámara
 * (`recorridoDeEncuadre`, en por ciento del alto). Medido a 1440 × 900 con −0,9: del 67,8 al 92,9 % (la cuenta, 68,1 y 92,1).
 */
export function arribaDelLogoEncuadrado(distancia: number, frameY: number): number {
  const alto = (ALTO_DEL_LOGO_POR_DISTANCIA / distancia) * 100
  const centro = 50 - frameY * recorridoDeEncuadre(50, alto)
  return Math.round((centro - alto / 2) * 10) / 10
}

/**
 * [PULIDO 1] P17-A · EL DOLLY-IN LEVE AL LLEGAR AL CTA, por tiempo: la pista sostiene la pose del CTA (un sostén es copia
 * exacta de su pose, `s9e`), así que el acercamiento no puede ir en el scroll. Mientras el progreso está en el sostén del CTA
 * la cámara se acerca `u` (de 31,3 a 30,8 de ojo) en `entraS`, con curva suave; fuera, vuelve en el mismo tiempo. Lo aplica
 * el rig (sólo con movimiento); el lugar del CTA cuenta con él.
 */
export const DOLLY_DEL_CTA = { u: 0.5, entraS: 1.6 } as const

/** [PULIDO 1] P17-A · si el progreso está en el sostén del CTA (de que llega a que empieza el alejamiento D). */
export function enElSostenDelCta(progreso: number): boolean {
  return progreso >= progresoDelFinal(TIEMPOS_DEL_FINAL.cta.llega) && progreso <= progresoDelFinal(TIEMPOS_DEL_FINAL.cta.hasta)
}

/** [PULIDO 1] P17-A · un paso del dolly (0 a 1, lineal en el tiempo): hacia 1 en el sostén del CTA, hacia 0 fuera. */
export function pasoDelDolly(k: number, enElCta: boolean, dt: number): number {
  const paso = Math.max(0, dt) / DOLLY_DEL_CTA.entraS
  return enElCta ? Math.min(1, k + paso) : Math.max(0, k - paso)
}

/** [PULIDO 1] P17-A · cuánto se acerca la cámara (mundo) con el dolly en `k`, con la curva suave. */
export function dollyDelCta(k: number): number {
  const u = Math.min(1, Math.max(0, k))
  return DOLLY_DEL_CTA.u * u * u * (3 - 2 * u)
}

export function pieDelLogo(distancia: number): number {
  return 50 + Math.round((ALTO_DEL_LOGO_POR_DISTANCIA / distancia / 2) * 1000) / 10
}
