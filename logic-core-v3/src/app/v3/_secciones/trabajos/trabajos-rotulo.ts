/**
 * §21 DEL INVARIANTE DE TRABAJOS — el rótulo del proyecto y su banda.
 *
 * ⚠ **Vive en su propio archivo por la regla de las 300 líneas**, y el corte es
 * por TEMA, igual que el de `servicios/s6-traspaso.ts`: todo lo de acá afirma
 * sobre el RÓTULO —cuánto mide comparado con su captura, cuándo aparece y dónde
 * deja el piso del foco al que lo enfoca—.
 *
 * El defecto que lo trajo: «El Garage» se leía gigante encima de una captura
 * chiquita, con su caja más ancha que la de la captura que lo nombra. La causa
 * era la contra-escala —el rótulo deshacía la escala de su captura para medir
 * siempre lo mismo en pantalla— y el arreglo es que escale CON ella.
 */

import { afirmar, afirmarIgual, controlPositivo } from '../../_lib/__tests__/afirmar'
import { leer } from '../_invariantes/soporte'
import { afirmarLaTablaYElNacimiento } from './trabajos-nacimiento'
import {
  ANCHO_CON_EL_ROTULO_ENTERO,
  BANDA_DEL_ROTULO,
  FRACCION_DEL_ROTULO,
  opacidadDelRotulo,
  poseDelTunel,
  pxParaQueElProyectoMida,
  transformDelRotulo,
} from './tunel'

const FUENTE_DE_LA_CAPA = leer('src/app/v3/_secciones/trabajos/CapaDelTunel.tsx')

/**
 * Lo que la capa ESCRIBE en el `transform` del rótulo. Tiene que ser
 * `transformDelRotulo()` —una escala de 1— o el escondido: nada que se divida por
 * el ancho, que es la contra-escala que hacía leer «El Garage» gigante.
 */
const escribeElRotuloSinContraEscala = (src: string): boolean => {
  const m = /rotulo\.style\.setProperty\('transform',([^\n]*)\)/.exec(src)
  return m !== null && m[1].includes('transformDelRotulo()') && !m[1].includes('/') && transformDelRotulo() === 'scale(1)'
}

/** Si enfocar la captura `i` la deja en un ancho donde su rótulo se lee entero. */
const pisoConElRotuloEntero = (anchoDelPiso: number, cuantas: number): boolean =>
  Array.from({ length: cuantas }, (_, i) => i).every(
    (i) => opacidadDelRotulo(poseDelTunel(pxParaQueElProyectoMida(i, anchoDelPiso)).anchos[i]) === 1,
  )

export function afirmarElRotulo(cuantas: number, conMotion: string): void {
  // §22 —la tabla es la especificación, y nada nace ni muere— vive en
  // `trabajos-nacimiento.ts`.
  afirmarLaTablaYElNacimiento(cuantas, conMotion)

  // ── EL RÓTULO NUNCA ES MÁS ANCHO QUE SU CAPTURA ─────────────────────────
  /**
   * ⚠️ **POR CONSTRUCCIÓN, y por eso se afirma sobre lo que la capa escribe.** El
   * rótulo vive adentro de la caja de su captura y no lleva escala propia: mide
   * `FRACCION_DEL_ROTULO` de ella en cualquier punto de la cadena. Un barrido del
   * modelo daría esa misma razón en todas las muestras sin poder fallar, así que
   * lo que se mira es el `transform` que el lazo le escribe al rótulo en el
   * navegador. El control es la contra-escala vieja, `1 / ancho`.
   */
  afirmar(
    escribeElRotuloSinContraEscala(FUENTE_DE_LA_CAPA),
    `el lazo le escribe al rótulo una escala de 1 o lo esconde, y nada más: escala con su captura y mide ${(FRACCION_DEL_ROTULO * 100).toFixed(2)} % de ella, así que nunca es más ancho`,
  )
  controlPositivo(
    'el detector vería la contra-escala vieja, que desbordaba la captura',
    "rotulo.style.setProperty('transform', `scale(${(1 / ancho).toFixed(4)})`)",
    escribeElRotuloSinContraEscala,
  )

  // ── EL PISO DEL FOCO DEJA EL NOMBRE ENTERO ──────────────────────────────
  /**
   * ⚠️ **ENFOCAR UNA CAPTURA TIENE QUE DEJAR SU NOMBRE A LA VISTA.** El piso caía
   * en el borde de la banda del rótulo —el ancho donde el nombre ENTRA en su
   * captura— y ahí la opacidad todavía vale 0: el enlace enfocado y su anillo
   * quedaban invisibles. Lo encontró la revisión adversarial de este sprint. El
   * piso tiene que caer donde el rótulo está entero, en las tres.
   */
  afirmar(
    pisoConElRotuloEntero(ANCHO_CON_EL_ROTULO_ENTERO, cuantas),
    `enfocar cualquiera de las ${cuantas} capturas la lleva a ${ANCHO_CON_EL_ROTULO_ENTERO.toFixed(4)} del cuadro, donde su rótulo está en opacidad 1`,
  )
  controlPositivo('  el detector vería el piso en el borde de la banda, que dejaba el nombre en 0', FRACCION_DEL_ROTULO, (a: number) => pisoConElRotuloEntero(a, cuantas))
  const pisoDeLaCapa = (src: string): boolean =>
    src.includes('pxParaQueElProyectoMida(enfocada, ANCHO_CON_EL_ROTULO_ENTERO)') &&
    src.includes("enfocada === 'cta'") &&
    src.includes('progresoDelPxDelTunel(PX_DEL_TUNEL)')
  afirmar(
    pisoDeLaCapa(FUENTE_DE_LA_CAPA),
    '  y es ese piso el que la capa usa, con uno propio para el CTA —el final del túnel—: su enlace no vive en una captura y sin él quedaba en escala 0 al enfocarlo',
  )
  controlPositivo('  el detector vería el piso viejo, sin el CTA', 'pxParaQueElProyectoMida(enfocada, FRACCION_DEL_ROTULO)', pisoDeLaCapa)

  /**
   * ⚠️ **Y LA BANDA ABRE DONDE EL RÓTULO ENTRA, que es el mismo número.** Una
   * captura de `FRACCION_DEL_ROTULO` del cuadro mide exactamente el ancho
   * natural del rótulo más largo: es el ancho por debajo del cual la ley vieja
   * desbordaba. Abajo de eso no hay rótulo.
   */
  afirmarIgual(
    BANDA_DEL_ROTULO.desde,
    FRACCION_DEL_ROTULO,
    `la banda del rótulo abre donde el rótulo ENTRA en su captura (${(FRACCION_DEL_ROTULO * 100).toFixed(2)} % del cuadro), no al nacer`,
  )
  afirmarIgual(opacidadDelRotulo(0), 0, '  así que al nacer no hay rótulo: la captura es un punto y el nombre no cabe')
  afirmar(
    BANDA_DEL_ROTULO.desde > 0,
    `  CONTROL: la apertura (${BANDA_DEL_ROTULO.desde}) está por encima del nacimiento en 0, que es lo que hace que haya un tramo sin rótulo`,
  )

}
