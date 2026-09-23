/**
 * §23 DEL INVARIANTE DE TRABAJOS — **las cuatro ventanas del recorrido.**
 *
 * El tramo se reparte en cuatro ventanas que se tocan sin huecos —túnel,
 * espera, salida y demos— y las cuatro tienen que caber adentro del pin. Acá se
 * afirma ese encaje y nada más: ni el ritmo, ni el rótulo, ni el nacimiento.
 *
 * ⚠ Vive en su propio archivo por la regla de las 300 líneas, con el mismo corte
 * por TEMA que `trabajos-rotulo.ts` y `trabajos-nacimiento.ts`.
 */

import { afirmar, afirmarIgual, controlPositivo } from '../../_lib/__tests__/afirmar'
import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../_lib/navegacion'
import { leer } from '../_invariantes/soporte'
import {
  CARTEL,
  PX_DE_LA_SECCION,
  arranqueDeDemos,
  fraccionDeScroll,
  progresoDeLaVentana,
  pxDeLaEspera,
  ventanaDeLaEspera,
  ventanaDeLaSalida,
  ventanaDelTunel,
} from './geometria'
import {
  PANTALLAS_DEL_ESPACIO_DE_DEMOS,
  PX_DEL_ESPACIO_DE_DEMOS,
  PX_DE_LA_SALIDA,
  PX_MINIMOS_DE_LA_ESPERA_DEL_CTA,
} from './tunel'

/** El largo que la salida tenía antes de este sprint, que no la toca. */
const SALIDA_QUE_NO_SE_TOCA = 1131

export function afirmarLasVentanas(cuantas: number, margenDelRecorte: number): void {
  // ── LAS CUATRO VENTANAS ENTRAN EN LA SECCIÓN, EN ORDEN Y SIN PISARSE ───
  const tunel = ventanaDelTunel(cuantas)
  const espera = ventanaDeLaEspera(cuantas)
  const salida = ventanaDeLaSalida(cuantas)
  afirmarIgual(
    tunel.desde,
    progresoDeLaVentana(CARTEL, CARTEL.huirDesde ?? 1),
    'el túnel arranca en el instante EXACTO en que el cartel empieza a huir: es una derivación, no dos números escritos aparte',
  )
  afirmarIgual(
    [tunel.hasta, espera.hasta, salida.hasta].map((v) => v.toFixed(4)),
    [espera.desde, salida.desde, arranqueDeDemos(cuantas)].map((v) => v.toFixed(4)),
    '  y las cuatro ventanas se tocan sin huecos: túnel → espera → salida → demos',
  )
  /**
   * ⚠️ **EL RECORRIDO TERMINA DONDE EL PIN SE DESPEGA, Y ESO NO ES UN AJUSTE.**
   *
   * El espacio de demos tiene que quedar ADENTRO del pin: si terminara después,
   * el visitante lo atravesaría con el panel ya despegándose y con servicios
   * entrando por abajo — que es exactamente lo que se reportó como «no se
   * percibe». Así que la última ventana llega a 1 por construcción.
   */
  afirmarIgual(
    Number(arranqueDeDemos(cuantas).toFixed(6)),
    Number((1 - fraccionDeScroll(PX_DEL_ESPACIO_DE_DEMOS)).toFixed(6)),
    '  y el tramo de demos termina donde el pin se despega: se cuenta desde el final, no desde el principio',
  )
  afirmarIgual(
    Number(((1 - arranqueDeDemos(cuantas)) * PX_DE_LA_SECCION).toFixed(0)),
    PX_DEL_ESPACIO_DE_DEMOS,
    `  el espacio de demos mide los ${PX_DEL_ESPACIO_DE_DEMOS} px declarados —${PANTALLAS_DEL_ESPACIO_DE_DEMOS} pantallas— de sala de noche sola, con la sección todavía clavada`,
  )
  afirmar(
    PX_DEL_ESPACIO_DE_DEMOS > ALTO_DE_VIEWPORT_DE_LA_REFERENCIA,
    `  CONTROL: y son más de UNA pantalla, que es lo que el despineado ya daba y se reportó como que no se percibe`,
  )
  /**
   * ⚠️ **LA SALIDA VA A 1:1 CON EL SCROLL, y dura lo que ya duraba.**
   *
   * El largo de la VENTANA tiene que ser exactamente igual al de la traslación,
   * porque ésa es la igualdad que hace que se lea como scroll y no como un
   * deslizamiento impuesto. El largo es el de antes —este sprint no toca la
   * salida— y lo que lo hace suficiente es el recorte, que viaja con la capa: con
   * el alto del cuadro más el margen del recorte, el cuadro ya quedó vacío.
   */
  afirmarIgual(
    Number(((salida.hasta - salida.desde) * PX_DE_LA_SECCION).toFixed(0)),
    PX_DE_LA_SALIDA,
    `  la salida recorre ${PX_DE_LA_SALIDA} px en ${PX_DE_LA_SALIDA} px de scroll: 1:1, que es lo que la hace indistinguible de un scroll normal`,
  )
  afirmarIgual(PX_DE_LA_SALIDA, SALIDA_QUE_NO_SE_TOCA, `  y dura los ${SALIDA_QUE_NO_SE_TOCA} px que ya duraba: el túnel cambió, la salida no`)
  const vacia = (px: number): boolean => px >= ALTO_DE_VIEWPORT_DE_LA_REFERENCIA + margenDelRecorte
  afirmar(
    vacia(PX_DE_LA_SALIDA),
    `  y alcanza: con ${ALTO_DE_VIEWPORT_DE_LA_REFERENCIA + margenDelRecorte} px —el cuadro más los ${margenDelRecorte} del margen del recorte, que viaja con la capa— el cuadro ya está vacío`,
  )
  controlPositivo('el detector vería una salida que se corta con el contenido todavía a la vista', 850, vacia)
  /**
   * ⚠️ **Y LA OTRA MITAD DE LA IGUALDAD: cuánto se traslada la capa.** El largo
   * de la ventana es `PX_DE_LA_SALIDA` por definición; lo que hace el 1:1 es que
   * la capa se traslade la fracción de ESA ventana por ESE mismo largo. Se lee del
   * fuente, y el control es la levantada vieja, 2,6 veces el dedo.
   */
  const unoAUno = (src: string): boolean =>
    src.includes('enLaVentana(p, VENTANA_DE_LA_SALIDA) * PX_DE_LA_SALIDA') && src.includes('VENTANA_DE_LA_SALIDA = ventanaDeLaSalida(')
  afirmar(unoAUno(leer('src/app/v3/_secciones/trabajos/CapaDelTunel.tsx')), '  y la capa se traslada la fracción de esa ventana por ese mismo largo: un píxel de scroll, un píxel de traslación')
  controlPositivo('  el detector vería la levantada vieja', 'enLaVentana(p, VENTANA_DE_LA_SALIDA) * (1.3 * 900)', unoAUno)
  controlPositivo(
    'el detector vería la levantada vieja, que iba 2,6 veces más rápido que el dedo',
    { recorre: 1.3 * ALTO_DE_VIEWPORT_DE_LA_REFERENCIA, en: 450 },
    (v: { recorre: number; en: number }) => Math.abs(v.recorre - v.en) < 1,
  )
  afirmar(
    pxDeLaEspera(cuantas) >= PX_MINIMOS_DE_LA_ESPERA_DEL_CTA,
    `  la ventana del CTA se queda quieta en su máximo ${pxDeLaEspera(cuantas).toFixed(0)} px, que no baja del piso declarado de ${PX_MINIMOS_DE_LA_ESPERA_DEL_CTA}`,
  )
  controlPositivo(
    'el detector vería una espera por debajo del piso',
    PX_MINIMOS_DE_LA_ESPERA_DEL_CTA - 1,
    (px: number) => px >= PX_MINIMOS_DE_LA_ESPERA_DEL_CTA,
  )
}
