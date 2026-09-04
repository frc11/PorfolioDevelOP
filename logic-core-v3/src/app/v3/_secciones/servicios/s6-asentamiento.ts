/**
 * §14 DEL INVARIANTE DE SERVICIOS — EL ASENTAMIENTO, afirmado aparte.
 *
 * ⚠ **Vive en su propio archivo por la regla de las 300 líneas del repo**, y el
 * corte es por TEMA y no por tamaño: es la única sección del invariante que
 * afirma sobre el REMAPEO del progreso —lo que B2 agregó— y no sobre el marcado
 * ni sobre el contenido de la sección. Misma costura que `s13b-soporte.ts` y
 * `s9-soporte.ts`: acá se afirma un tema, allá el resto.
 *
 * ⚠️ **AFIRMA UNA PROPIEDAD NUEVA Y NO REEMPLAZA A NINGUNA.** El defecto que
 * cierra está medido en el navegador y transcripto en `asentamiento.ts`: las
 * ventanas de P2, P3 y P4 cierran las tres en `local = 1`, que es el píxel
 * EXACTO donde la secuencia cambia de servicio. O sea que la fracción del tramo
 * en la que un servicio estaba terminado y quieto era **cero**, y el censo de
 * acontecimientos de `B2-DELTAS.md` §0 leía la secuencia entera como UN
 * aterrizaje de 2.040 px con 131 piezas.
 *
 * Lo que se afirma es la PROPIEDAD, no el número de una pantalla: **existe una
 * banda del tramo en la que el progreso no se mueve**, y mide lo que la
 * derivación dice. El control positivo es la identidad —o sea el comportamiento
 * anterior— y tiene que fallar.
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { canalesSincronizados, desincronizaciones } from '../_contrato/secuencia'
import { leer } from '../_invariantes/soporte'
import { cuenta } from './deteccion'
// prettier-ignore
import { ALTO_DE_CALIBRACION, BANDA_QUIETA, BANDA_QUIETA_EN_PASOS, FRACCION_DE_ARMADO, FUSION_DEL_CENSO, HUECO_PREVISTO, HUECO_PREVISTO_EN_PANTALLAS, PASO_DEL_CENSO, TRAMO_CALIBRADO, asentar } from './asentamiento'
import { esMonotono, fraccionAsentada } from '../_invariantes/asentamiento'
import { CANTIDAD_DE_TRAMOS } from './ServiciosEnSecuencia'

/** §14 entero. Se llama desde `s6-servicios.invariant.tsx`, bajo su `titulo`. */
export function afirmarElAsentamiento(): void {
  titulo('14 · Cada servicio ATERRIZA — la armada termina y el servicio se queda quieto')
  /**
   * ⚠️ **AFIRMACIÓN NUEVA DE B2, Y NO REEMPLAZA A NINGUNA.** El defecto que cierra
   * está medido en el navegador y transcripto en `asentamiento.ts`: las ventanas
   * de P2, P3 y P4 cierran las tres en `local = 1`, que es el píxel EXACTO donde
   * la secuencia cambia de servicio. O sea que la fracción del tramo en la que un
   * servicio estaba terminado y quieto era **cero**, y el censo de acontecimientos
   * de `B2-DELTAS.md` §0 leía la secuencia entera como UN aterrizaje de 2.040 px.
   *
   * Lo que se afirma acá es la propiedad, no el número de la pantalla: **existe una
   * banda del tramo en la que el progreso no se mueve**, y mide lo que la
   * derivación dice. El control positivo es la identidad, o sea el comportamiento
   * anterior — tiene que fallar, y falla.
   */
  console.log(`  paso del censo ${PASO_DEL_CENSO} · umbral de fusión ${FUSION_DEL_CENSO} · banda quieta ${BANDA_QUIETA} (${BANDA_QUIETA_EN_PASOS} pasos)`)
  console.log(`  tramo calibrado ${TRAMO_CALIBRADO} sobre una ventana de ${ALTO_DE_CALIBRACION} · armada ${FRACCION_DE_ARMADO} del tramo`)
  console.log(`  hueco previsto entre dos servicios: ${HUECO_PREVISTO} px = ${HUECO_PREVISTO_EN_PANTALLAS} pantallas`)

  afirmar(BANDA_QUIETA > FUSION_DEL_CENSO, `la banda quieta (${BANDA_QUIETA}) supera el umbral de fusión del censo (${FUSION_DEL_CENSO}): dos servicios NO se leen como uno`)
  afirmarIgual(FRACCION_DE_ARMADO, (TRAMO_CALIBRADO - BANDA_QUIETA) / TRAMO_CALIBRADO, 'la fracción de armada está DERIVADA del paso del censo y del tramo, no elegida')
  afirmarIgual(asentar(0), 0, 'en el borde del tramo la armada arranca en cero — el servicio entra desde su estado inicial')
  afirmarIgual(asentar(FRACCION_DE_ARMADO), 1, `y llega a 1 en ${FRACCION_DE_ARMADO} del tramo: ahí el servicio está entero`)
  afirmarIgual(asentar(1), 1, '  y de ahí al reemplazo no se mueve más')
  afirmar(esMonotono(asentar), 'el remapeo nunca retrocede: ningún canal se desarma mientras el visitante baja')
  afirmarIgual(fraccionAsentada(asentar), 1 - FRACCION_DE_ARMADO, `la mitad del tramo pasa SIN que nada cambie — eso es el aterrizaje, medido sobre el remapeo`)
  controlPositivo('el progreso pelado del tramo —lo que la sección hacía— NO deja una sola banda quieta', (l: number) => l, (r) => fraccionAsentada(r) > 0)
  controlPositivo('  y un remapeo que retrocede no pasa la monotonía', (l: number) => 1 - l, (r) => esMonotono(r))

  /** La otra mitad: que el remapeo se aplique UNA vez, sobre el número que los
   *  cinco canales comparten. Aplicado canal por canal serían cinco relojes que
   *  se ven parecidos y no lo son — el control positivo de §8, otra vez. */
  const SECUENCIA = quitarComentarios(leer('src/app/v3/_secciones/servicios/ServiciosEnSecuencia.tsx'))
  afirmarIgual(cuenta(SECUENCIA, /\basentar\s*\(/g), 1, 'el asentamiento se aplica UNA sola vez, sobre el progreso que los cinco canales leen')
  afirmarIgual(cuenta(quitarComentarios(leer('src/app/v3/_secciones/servicios/ContenidoDeServicio.tsx')), /\basentar\s*\(/g), 0, '  y ningún canal lo aplica por su cuenta')
  controlPositivo('el contador vería un remapeo por canal', 'asentar(a); asentar(b); asentar(c)', (t) => cuenta(t, /\basentar\s*\(/g) === 1)

  // Lo que el asentamiento NO toca: los valores medidos de los tres patrones.
  afirmarIgual(desincronizaciones(canalesSincronizados, CANTIDAD_DE_TRAMOS), [], 'y la simultaneidad de los cinco canales sigue intacta: un solo número remapeado los mueve a los cinco')
}
