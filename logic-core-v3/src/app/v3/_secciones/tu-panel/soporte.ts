/**
 * §11 DEL INVARIANTE DE TU PANEL — EL ASENTAMIENTO DE LA LISTA, afirmado aparte.
 *
 * ⚠ **Vive en su propio archivo por la regla de las 300 líneas del repo**, y el
 * corte es por TEMA y no por tamaño: es la única sección del invariante que
 * afirma sobre el REMAPEO del progreso —lo que B2 agregó y lo que B9 re-derivó—
 * y no sobre el marcado ni sobre el contenido de la sección. Misma costura que
 * `servicios/s6-asentamiento.ts`, que se partió por lo mismo y con el mismo
 * corte.
 *
 * Lo trajo B9: al re-derivar el sobrepaso contra `DESCANSO_ANTES_DE_SALIR_PX`
 * la sección creció y `s7-contrato` §7 puso el archivo en 319 líneas. La regla
 * no se afloja: se parte.
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { ANCLAS, rangoDeScroll } from '../../_lib/motion/anclas'
import { MUESTRAS_DEL_RANGO, esMonotono, fraccionAsentada } from '../_invariantes/asentamiento'
import * as A from './asentamiento'

/** §11 entero. Se llama desde `s6-tu-panel.invariant.tsx`. */
export function afirmarElAsentamiento(): void {
  titulo('11 · B2 · La lista ATERRIZA — y el punto de asentamiento sale del ancla')

  /**
   * ⚠️ AFIRMACIÓN NUEVA. No reemplaza ni afloja ninguna: las diez de arriba
   * siguen valiendo carácter por carácter. Lo que se agrega es la propiedad que
   * `B2-DELTAS.md` §0 mide y que ningún instrumento de este repo tenía: **existe
   * una banda del rango en la que el progreso no se mueve**. Para el
   * comportamiento anterior —el progreso pelado— esa banda es CERO.
   */
  const RANGO_P4 = rangoDeScroll(ANCLAS.P4, { topDoc: 0, alto: A.ALTO_DE_LA_LISTA }, A.ALTO_DE_CALIBRACION)
  const ANCHO_P4 = RANGO_P4.fin - RANGO_P4.inicio
  console.log(`  bloque de la lista ${A.ALTO_DE_LA_LISTA} px sobre una ventana de ${A.ALTO_DE_CALIBRACION} · rango de P4 ${ANCHO_P4} · armada ${A.FRACCION_DE_ARMADO.toFixed(5)}`)
  /**
   * ⚠️ **LA VARA DEL PUNTO DE LLEGADA CAMBIÓ Y LAS DOS AFIRMACIONES SE REESCRIBEN
   * CONTRA LA PROPIEDAD NUEVA, no se aflojan (regla 15, B9).**
   *
   * Decían que el punto de llegada es el fin de P2 (`bottom bottom`, fracción 1
   * del viewport y cero píxeles) y que P4 se pasa de ahí **un viewport entero**.
   * B9 midió la referencia —`https://www.nk.studio/`, 202 elementos animados sin
   * pinnear— y el aterrizaje real cae en 0,70 de pantalla (p50), no en 1,00: el
   * punto de llegada es `bottom bottom-=240px`, o sea el fin de **P1**. Las dos
   * afirmaciones siguen siendo igualdades derivadas de `ANCLAS`; lo que cambia es
   * cuál ancla es la vara, y el sobrepaso de P4 baja de 1080 a 840.
   */
  afirmarIgual(ANCLAS.P1.fin.viewport.fraccion, 1, 'el punto de LLEGADA cuelga del borde inferior del viewport, igual que el de P2')
  afirmarIgual(A.DESCANSO_ANTES_DE_SALIR_PX, -ANCLAS.P1.fin.viewport.px, '  y está `bottom bottom-=240px` arriba de ese borde: el descanso es el desplazamiento del fin de P1, leído del ancla')
  afirmarIgual(
    A.SOBREPASO_DE_LA_LISTA,
    (ANCLAS.P1.fin.viewport.fraccion - ANCLAS.P4.fin.viewport.fraccion) * A.ALTO_DE_CALIBRACION -
      A.DESCANSO_ANTES_DE_SALIR_PX,
    '  y P4 se pasa de ahí un viewport MENOS el descanso: `bottom top` contra `bottom bottom-=240px`, leído de las anclas',
  )
  controlPositivo(
    'con el punto de llegada viejo —descanso 0, o sea `bottom bottom`— la derivación NO reproduce el sobrepaso de hoy',
    0,
    (descanso: number) =>
      (ANCLAS.P1.fin.viewport.fraccion - ANCLAS.P4.fin.viewport.fraccion) * A.ALTO_DE_CALIBRACION - descanso ===
      A.SOBREPASO_DE_LA_LISTA,
  )
  afirmarIgual(A.RANGO_DE_LA_LISTA, ANCHO_P4, '  el rango declarado es el que `rangoDeScroll` calcula con el ancla de P4')
  afirmarIgual(A.FRACCION_DE_ARMADO, (ANCHO_P4 - A.SOBREPASO_DE_LA_LISTA) / ANCHO_P4, 'la fracción de armada está DERIVADA del ancla y del alto medido, no elegida')
  afirmarIgual(A.asentar(0), 0, 'en el borde del rango la armada arranca en cero: la lista entra desde su estado inicial')
  afirmarIgual(A.asentar(A.FRACCION_DE_ARMADO), 1, `  llega a 1 cuando el bloque terminó de entrar, y de ahí no se mueve más`)
  afirmarIgual(A.asentar(1), 1, '  ni en el último píxel del ancla')
  afirmar(esMonotono(A.asentar), 'el remapeo nunca retrocede: ningún ítem se desarma mientras el visitante baja')
  const QUIETA = fraccionAsentada(A.asentar)
  afirmar(Math.abs(QUIETA - (1 - A.FRACCION_DE_ARMADO)) <= 1 / (MUESTRAS_DEL_RANGO - 1), `${(100 * QUIETA).toFixed(1)} % del rango pasa SIN que nada cambie — eso es el aterrizaje, medido sobre el remapeo`, `derivado: ${(100 * (1 - A.FRACCION_DE_ARMADO)).toFixed(1)} %, con ${MUESTRAS_DEL_RANGO} muestras`)
  afirmar(QUIETA * ANCHO_P4 > A.FUSION_DEL_CENSO, `la banda quieta mide ${(QUIETA * ANCHO_P4).toFixed(0)} px y supera el umbral de fusión del censo (${A.FUSION_DEL_CENSO}): el grupo siguiente NO se lee como la cola de éste`)
  controlPositivo('el progreso pelado —lo que la sección hacía— NO deja una sola banda quieta', (l: number) => l, (r) => fraccionAsentada(r) > 0)
  console.log('  [medido en el navegador, 1920×1080, receta de MEDICION-NAVEGADOR.md] con el punto de llegada de B2 los once aterrizajes pasaron de 16320–17280 a 15720–16200,')
  console.log('  y el hueco contra el grupo del primer tiempo bajó de 1.200 px (1,11 pantallas) a 600 (0,56). El grupo sigue siendo UNO: son once ítems escalonados.')
  console.log('  ⚠️ B9 lo vuelve a medir con el punto de llegada corregido: el bloque aterriza en 16440 (era 16200) y su borde inferior pasa de 0,926 a 0,704 del cuadro.')
  console.log('  Y tiene un costo declarado: a 1440 ese +240 deja el grupo de la lista a 240 px del titular de `por-que-develop` y el censo los funde — un acontecimiento menos. En el reporte de B9, con su remedio.')
}
