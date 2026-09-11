import { afirmar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { CHOREO_KEYFRAMES } from '../choreography'
// prettier-ignore
import { ARRIBA_DEL_CERO, CAMARAS, CUADROS_SIN_CAMBIO, MAS_ANGOSTO, PEOR_RECORRIDO, PISTA_CON_FRAME_Y, PISTA_REAL, aspectoDeRecorridoNulo, coincidenLasCamaras, frameYMaximo, recorridosDe, tablaDeRecorridos, type RecorridoMedido } from './s10-logo-encuadre'
import { VENTANAS } from './s10-logo-lectura'

/**
 * §7 DE `s10-logo.invariant.ts` — EL ENCUADRE LATERAL, en su propio archivo.
 *
 * Sale del invariante por la regla de las 300 líneas del repo, y es el mismo
 * corte que ya separó al §9 en `s10-logo-columna.ts`: **el invariante llama y
 * acá se afirma.** El contenido no cambió al mudarse; lo que cambió es de quién
 * son las cifras, y eso lo cuenta el aviso de B13 de adentro.
 */
export function afirmarElEncuadreLateral(): void {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('7 · EL ENCUADRE LATERAL — el codo en cero, sacado (SITIO-S11, defecto 14)')

  /**
   * ⚠ **ESTA SECCIÓN CAMBIÓ DE SUJETO EN SITIO-S11.** En SITIO-S10 afirmaba que la
   * palanca `frameX` de `demos` estaba **INERTE** en el cuadro más alto: `travelX =
   * max(0, medioAncho − LOGO_W/2) × 0,88` tenía un codo en cero en aspecto 1,213
   * (arnés) y 1,162 (rig), y 1025×900 da 1,139 — abajo de los dos. Era el censo de
   * un DEFECTO, y el defecto se arregló en `_lib/escena/encuadre.ts`.
   *
   * **Ahora custodia las DOS mitades del arreglo**, y hacen falta las dos: que la
   * perilla vuelva a mover el logo en los cuatro cuadros y en las dos cámaras, y
   * que **donde ya funcionaba no se haya movido nada** — que es lo que garantiza
   * que ninguna pose calibrada a ojo cambió. Sin la segunda, esto sería un retoque
   * de composición disfrazado de arreglo.
   */
  for (const linea of tablaDeRecorridos()) console.log(`  ${linea}`)

  afirmar(
    PEOR_RECORRIDO > 0,
    'PALANCA `frameX` de `demos` — vuelve a MOVER el logo en los CUATRO cuadros y en las DOS cámaras',
    `el más chico de los ocho recorridos es ${PEOR_RECORRIDO.toFixed(4)} de mundo, y en ${MAS_ANGOSTO.etiqueta} era 0,0000`,
  )
  /**
   * ⚠️ **B13 · EL CODO DEJÓ DE MORDER EN TODOS LOS CUADROS.** Con `demos` a 9 el
   * aspecto de recorrido nulo caía en 1,213 (arnés) y 1,162 (rig), y 1025×900
   * —1,139— quedaba abajo: ahí la fórmula vieja daba CERO. A distancia 14 ese
   * aspecto baja a **0,798 y 0,764**, abajo de los cuatro cuadros, así que los 8
   * recorridos caen arriba del cero y las dos fórmulas coinciden en los 8. El
   * arreglo de S11 sigue sosteniendo la perilla; lo que cambió es que ya no hay
   * cuadro donde haga falta, y por eso los controles usan la distancia VIEJA.
   */
  afirmar(
    ARRIBA_DEL_CERO.length === 8 && ARRIBA_DEL_CERO.every((f) => f.corregido === f.conCodo),
    '  y ahora la perilla funciona en TODOS: las dos fórmulas dan el MISMO número en los ocho',
    `${ARRIBA_DEL_CERO.length} de los 8 cuadros caen arriba del aspecto de recorrido nulo (eran 6 con la distancia vieja)`,
  )
  controlPositivo(
    'el comparador no mide la fórmula nueva contra sí misma: con el codo y la distancia VIEJA, el cuadro más alto daba CERO',
    recorridosDe('demos', CAMARAS[0].anchoDeLaCaja, 9).filter((f) => f.ventana.etiqueta === MAS_ANGOSTO.etiqueta),
    (filas: readonly RecorridoMedido[]) => filas.length > 0 && filas.every((f) => f.conCodo > 0),
  )
  afirmar(
    CAMARAS.every((c) => MAS_ANGOSTO.aspecto > aspectoDeRecorridoNulo('demos', c.anchoDeLaCaja)),
    '  el cuadro más alto pasó a estar ARRIBA del aspecto de recorrido nulo: el codo ya no lo alcanza',
    `${MAS_ANGOSTO.etiqueta} da ${MAS_ANGOSTO.aspecto.toFixed(3)} contra ` +
      CAMARAS.map((c) => `${aspectoDeRecorridoNulo('demos', c.anchoDeLaCaja).toFixed(3)} (${c.id})`).join(' y ') +
      ` — con la distancia vieja daban ${CAMARAS.map((c) => aspectoDeRecorridoNulo('demos', c.anchoDeLaCaja, 9).toFixed(3)).join(' y ')}`,
  )
  controlPositivo(
    '  y el comparador no está ciego: con la distancia VIEJA el cuadro más alto SÍ quedaba abajo',
    9,
    (d: number) => CAMARAS.every((c) => MAS_ANGOSTO.aspecto > aspectoDeRecorridoNulo('demos', c.anchoDeLaCaja, d)),
  )
  afirmar(
    aspectoDeRecorridoNulo('hero', CAMARAS[0].anchoDeLaCaja) < MAS_ANGOSTO.aspecto,
    '  el Hero nunca estuvo inerte: su aspecto de recorrido nulo queda abajo de todos los medidos',
    `${aspectoDeRecorridoNulo('hero', CAMARAS[0].anchoDeLaCaja).toFixed(3)} contra ${MAS_ANGOSTO.aspecto.toFixed(3)}`,
  )

  /**
   * ⚠ **LA CÁMARA CON LA QUE SE MIDE ES LA DE PRODUCCIÓN, Y ESO SE COMPRUEBA.**
   * `harness.ts:93-94` conserva su copia de la fórmula —con el codo— y este frente
   * no puede escribir en `/probe-escena`, así que el muestreo pasó a
   * `camaraEnCuadro`, que le pide el recorrido a `encuadre.ts`. Las dos tienen que
   * coincidir **bit a bit** arriba del recorrido nulo y separarse SÓLO abajo: si
   * coincidieran abajo, el arreglo no habría llegado al muestreo; si se separaran
   * arriba, la composición del encuadre estaría mal armada.
   */
  afirmar(
    CUADROS_SIN_CAMBIO.length === VENTANAS.length && CUADROS_SIN_CAMBIO.every((v) => coincidenLasCamaras(v.aspecto)),
    'la cámara del muestreo ES la del arnés donde la corrección es un no-op: coinciden bit a bit',
    `posición y las tres direcciones de pantalla, en los ${CUADROS_SIN_CAMBIO.length} de ${VENTANAS.length} cuadros ` +
      'de arriba del recorrido nulo — con la distancia vieja de `demos` eran 3 de 4',
  )
  /**
   * ⚠️ **B13 · EL CONTROL CAMBIA DE CUADRO PORQUE YA NO HAY NINGUNO ABAJO.** A
   * distancia 14 el recorrido nulo cae en 0,798 y ningún cuadro real queda abajo,
   * así que el control usa un aspecto hipotético más angosto: si las dos cámaras
   * coincidieran también ahí, el arreglo de S11 no llegaría al muestreo.
   */
  controlPositivo(
    'y NO coinciden abajo del recorrido nulo: el arreglo sí llega al muestreo',
    0.7,
    coincidenLasCamaras,
  )

  /**
   * ⚠ **EL EJE VERTICAL SE ARREGLÓ IGUAL, Y ES UN NO-OP COMPROBADO.** El codo
   * estaba en los dos ejes, así que la corrección va en los dos. En el vertical no
   * puede mover nada: `frameY` es cero en los ocho keyframes **y entre ellos**, y
   * el término `frameY × travelY` es cero valga lo que valga `travelY`. Se afirma
   * sobre el MUESTREO del track, que es donde una interpolación podría sorprender.
   */
  afirmar(
    frameYMaximo(PISTA_REAL) === 0,
    'el arreglo del eje VERTICAL no puede mover una composición: `frameY` es 0 en todo el recorrido',
    'máximo de |frameY| sobre 2001 progresos muestreados del track real',
  )
  controlPositivo(
    'el barrido de `frameY` SÍ ve una perilla vertical distinta de cero',
    PISTA_CON_FRAME_Y,
    (pista: typeof PISTA_REAL) => frameYMaximo(pista, 50) === 0,
  )

}
