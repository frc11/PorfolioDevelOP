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
import {
  CAPA_DEL_VACIO,
  CARTEL,
  PX_DE_LA_SECCION,
  arranqueDeDemos,
  fraccionDeScroll,
  progresoDeLaVentana,
  pxDeLaEspera,
  pxDelTunelEn,
  ventanaDeLaEspera,
  ventanaDeLaSalida,
  ventanaDelTunel,
} from './geometria'
import {
  CAPAS_DEL_TUNEL,
  ESCALA_QUE_LLENA_EL_CUADRO,
  PANTALLAS_DEL_ESPACIO_DE_DEMOS,
  PX_DEL_ESPACIO_DE_DEMOS,
  PX_DEL_VACIO,
  PX_DE_LA_SALIDA,
  PX_MINIMOS_DE_LA_ESPERA_DEL_CTA,
  PX_POR_SCROLL,
  RAMPA_DEL_VACIO,
  fraccionDelVacio,
  poseDelTunel,
  recorteDelVacio,
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
   * ⚠️ **LA SALIDA ES EL VACÍO, y su ventana dura lo que ya duraba.** La ventana
   * no se movió —la espera al 30 % y los demos están fijos a los dos lados—; lo
   * que cambió es lo que pasa adentro: el vacío, la próxima capa del túnel, nace
   * en 0 donde la ventana arranca y llena el cuadro antes de que termine.
   */
  afirmarIgual(
    Number(((salida.hasta - salida.desde) * PX_DE_LA_SECCION).toFixed(0)),
    PX_DE_LA_SALIDA,
    `  la ventana de la salida mide ${PX_DE_LA_SALIDA} px de scroll`,
  )
  afirmarIgual(PX_DE_LA_SALIDA, SALIDA_QUE_NO_SE_TOCA, `  y dura los ${SALIDA_QUE_NO_SE_TOCA} px que ya duraba: la espera y los demos no se mueven`)
  const vacioEn = (progreso: number): number => fraccionDelVacio(poseDelTunel(pxDelTunelEn(progreso)), CAPA_DEL_VACIO, pxDelTunelEn(progreso))
  afirmarIgual(vacioEn(espera.hasta), 0, '  el vacío no existe antes de la salida: la espera muestra el CTA entero')
  const alNacer = vacioEn(salida.desde + fraccionDeScroll(PX_POR_SCROLL))
  afirmar(alNacer > 0 && alNacer < 0.15, `  y nace diminuto en el centro: una muesca adentro de la ventana ocupa ${(alNacer * 100).toFixed(1)} % del cuadro`)
  const llena = (px: number): boolean => px <= PX_DE_LA_SALIDA
  afirmar(
    llena(PX_DEL_VACIO) && vacioEn(salida.hasta) === 1 && vacioEn(arranqueDeDemos(cuantas)) === 1,
    `  y llena el cuadro en ${PX_DEL_VACIO.toFixed(0)} px, antes de que la ventana termine: en los demos no queda nada del túnel`,
  )
  const conLaRampaDelCta = (ESCALA_QUE_LLENA_EL_CUADRO * (CAPAS_DEL_TUNEL.cta.topa - CAPAS_DEL_TUNEL.cta.arranca)) / CAPAS_DEL_TUNEL.cta.a
  controlPositivo(`  el chequeo vería el vacío con la rampa del CTA, que tarda ${conLaRampaDelCta.toFixed(0)} px y no entra`, conLaRampaDelCta, llena)
  const pendiente = (c: { de: number; a: number; arranca: number; topa: number }): number => (c.a - c.de) / (c.topa - c.arranca)
  afirmar(
    Math.abs(pendiente(CAPA_DEL_VACIO) - pendiente(RAMPA_DEL_VACIO)) < 1e-12 && RAMPA_DEL_VACIO === CAPAS_DEL_TUNEL.proyectos[CAPAS_DEL_TUNEL.proyectos.length - 1],
    '  su rampa es la de la última captura de la tabla: la misma pendiente, recta con clamp desde 0',
  )
  afirmarIgual(
    Number((ESCALA_QUE_LLENA_EL_CUADRO * CAPAS_DEL_TUNEL.cta.a * CAPAS_DEL_TUNEL.proyectos.reduce<number>((m, c) => m * c.a, CAPAS_DEL_TUNEL.escenario.a)).toFixed(9)),
    1,
    '  y va anidada adentro del CTA: con su escala final, su cadena mide el cuadro entero',
  )
  let salto = 0
  let anterior = 0
  let seAchica = false
  for (let i = 0; i <= 2000; i += 1) {
    const v = vacioEn(salida.desde + ((salida.hasta - salida.desde) * i) / 2000)
    salto = Math.max(salto, Math.abs(v - anterior))
    seAchica ||= v < anterior
    anterior = v
  }
  afirmar(!seAchica && salto < 0.01, `  y crece sin achicarse ni saltar: el paso más grande entre dos muestras de 0,57 px es ${(salto * 100).toFixed(3)} % del cuadro — subiendo es la misma función al revés`)
  /**
   * ⚠️ **EL AGUJERO VA EN % DE LA CAJA, y por eso vale a cualquier alto.** La
   * salida vieja fallaba a 1.300: trasladaba 1.131 px y el cuadro medía más. El
   * agujero no mide píxeles: a la mitad de su recorrido es el rectángulo del 25 %
   * al 75 % de la caja, que es el cuadro, con su proporción, a 900 o a 1.300.
   */
  const aLaMitad = recorteDelVacio(0.5, margenDelRecorte)
  afirmar(
    aLaMitad.startsWith('polygon(evenodd, ') && aLaMitad.endsWith('25.000% 25.000%, 75.000% 25.000%, 75.000% 75.000%, 25.000% 75.000%, 25.000% 25.000%)'),
    '  el agujero es el marco menos un rectángulo centrado en % de la caja: a la mitad, del 25 % al 75 % en los dos ejes',
  )
  afirmar(aLaMitad.includes(`-${margenDelRecorte}px -${margenDelRecorte}px`), `  y el marco de afuera deja los ${margenDelRecorte} px del margen del recorte, como \`overflow-clip-margin\``)
  afirmarIgual([recorteDelVacio(0, margenDelRecorte), recorteDelVacio(1, margenDelRecorte)], ['none', 'inset(50%)'], '  sin vacío la caja no se recorta; lleno, no pinta NADA: ni una captura, ni el CTA, ni un anillo de foco')
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
