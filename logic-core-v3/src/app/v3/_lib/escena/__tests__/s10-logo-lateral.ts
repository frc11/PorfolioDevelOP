import { afirmar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { CHOREO_KEYFRAMES } from '../choreography'
// prettier-ignore
import { ARRIBA_DEL_CERO, CAMARAS, CUADROS_SIN_CAMBIO, MAS_ANGOSTO, PEOR_RECORRIDO, PISTA_CON_FRAME_Y, PISTA_REAL, aspectoDeRecorridoNulo, coincidenConElCodo, frameYMaximo, recorridosDe, tablaDeRecorridos, type RecorridoMedido } from './s10-logo-encuadre'
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
   * ⚠ **EL SUJETO DE ESTE PAR CAMBIÓ EN ENCUADRE-1; LA PROPIEDAD, NO.**
   *
   * Hasta acá se comparaba **la cámara del muestreo contra la del arnés**: el
   * arnés conservaba la fórmula con el codo (`harness.ts:93-94`) y el muestreo
   * pasaba por `camaraEnCuadro` para pedirle el recorrido a `encuadre.ts`.
   * Unificado el arnés, esas dos son la MISMA función y compararlas sería verde
   * por construcción — la enfermedad que `s16-arnes` acaba de cerrar del otro
   * lado.
   *
   * El contrafactual pasa a ser **la fórmula vieja explícita**
   * (`camaraConCodo`, sobre `recorridoConCodo`, el testigo declarado), y las dos
   * mitades que este par custodia siguen siendo exactamente las mismas: arriba
   * del recorrido nulo las dos cámaras tienen que coincidir **bit a bit** —o el
   * arreglo habría movido una composición calibrada a ojo— y abajo tienen que
   * separarse —o el arreglo no estaría llegando a la cámara con la que se mide—.
   */
  afirmar(
    CUADROS_SIN_CAMBIO.length === VENTANAS.length && CUADROS_SIN_CAMBIO.every((v) => coincidenConElCodo(v.aspecto)),
    'la cámara de HOY ES la del codo donde la corrección es un no-op: coinciden bit a bit',
    `posición y las tres direcciones de pantalla, en los ${CUADROS_SIN_CAMBIO.length} de ${VENTANAS.length} cuadros ` +
      'de arriba del recorrido nulo — o sea que ninguna pose calibrada a ojo se movió al unificar',
  )
  /**
   * ⚠️ **B13 · EL CONTROL USA UN ASPECTO HIPOTÉTICO PORQUE YA NO HAY CUADRO
   * REAL ABAJO.** A distancia 14 el recorrido nulo de `demos` cae en 0,798 y los
   * cuatro cuadros declarados quedan arriba, así que el control baja a 0,7: si
   * las dos cámaras coincidieran también ahí, `cameraAt` no estaría usando la
   * fórmula corregida y toda la tabla de arriba sería una resta de un número
   * contra sí mismo.
   *
   * ⚠️ En VERTICAL sí hay cuadros reales abajo: 390×844 da **0,4621**, debajo
   * del recorrido nulo de los cinco keyframes con encuadre (0,5525 a 0,7983).
   * Ahí las dos fórmulas se separan de verdad — ver §7.60 de `DIRECCION-ESCENA`.
   */
  controlPositivo(
    'y NO coinciden abajo del recorrido nulo: `cameraAt` sí usa la fórmula corregida',
    0.7,
    coincidenConElCodo,
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
