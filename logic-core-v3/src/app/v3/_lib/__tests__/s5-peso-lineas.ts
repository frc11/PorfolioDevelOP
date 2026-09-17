/**
 * LAS LÍNEAS DE PESO DECLARADAS **EN EL MISMO ACTO** — TEXTO-2, TEXTO-3 y COMPO-1.
 *
 * Sale de `s5-peso.invariant.ts` cuando ese archivo cruzó las 300 líneas de
 * código del repo al declararse la cuarta línea seguida, y el corte es por TEMA
 * y no por tamaño: allá quedan la partición del bundle, el techo y las líneas
 * que se declararon DESPUÉS de su sprint; acá, **las que cada sprint trajo con
 * su A/B ya hecho**, que son el mismo bloque de cuatro afirmaciones repetido.
 *
 * ── Qué afirma cada bloque, y por qué son las mismas cuatro ───────────────
 *
 *   1. que el «antes» de su A/B ES el «después» del A/B anterior — que es lo
 *      único que hace que la resta aísle ESE sprint y no arrastre el de abajo;
 *   2. que la línea puesta en el presupuesto es la que su recibo propone;
 *   3. que nace con el aire arriba del umbral;
 *   4. un control positivo con el centésimo equivocado, para que el lector de
 *      aire no pueda estar ciego.
 *
 * ⚠ La cadena de «el antes de uno es el después del otro» es lo que convierte
 * cuatro restas sueltas en un reparto: TAPADO-1 → TEXTO-2 → TEXTO-3 → COMPO-1,
 * cada eslabón verificado al décimo de byte. Romper uno deja a todos los de
 * arriba sin sostén, y por eso se afirman y no se citan.
 *
 * ⚠ TAPADO-1 NO está acá: es la que NO cumplió la regla y por eso la estrenó,
 * así que su bloque se lee junto al techo que la obligó a existir.
 */

import { afirmar, afirmarIgual, controlPositivo } from './afirmar'
import {
  AIRE_DE_LA_PROPUESTA_DE_COMPO2_BYTES,
  CENTESIMO_DE_ABAJO_DE_COMPO2_KIB,
  DESVIO_DE_COMPO2_BYTES,
  ESCRITO_ANTES_DE_COMPO2_BYTES,
  ESCRITO_DESPUES_DE_COMPO2_BYTES,
  INVENTARIO_DE_COMPO2,
  PROPUESTA_DE_COMPO2_KIB,
  RUIDO_ENTRE_BUILDS_BYTES,
  aireDeCompo2,
} from './s5-presupuesto-recibos-de-compo2'
import { AIRE_MINIMO_UTIL_BYTES } from './s5-presupuesto-recibos-del-titular'
import {
  AIRE_DE_LA_PROPUESTA_DE_COMPO1_BYTES,
  CENTESIMO_DE_LA_CONVENCION_DE_COMPO1_KIB,
  DESVIO_DE_COMPO1_BYTES,
  ESCRITO_ANTES_DE_COMPO1_BYTES,
  INVENTARIO_DE_COMPO1,
  PROPUESTA_DE_COMPO1_KIB,
  SHA256_DEL_ARBOL_DE_TEXTO3,
  aireDeCompo1,
} from './s5-presupuesto-recibos-de-compo1'
import {
  AIRE_DE_LA_PROPUESTA_DE_TEXTO2_BYTES,
  CENTESIMO_DE_LA_CONVENCION_KIB,
  DESVIO_DE_TEXTO2_BYTES,
  ESCRITO_DESPUES_DE_TEXTO2_BYTES,
  INVENTARIO_DE_TEXTO2,
  PROPUESTA_DE_TEXTO2_KIB,
  aireDeTexto2,
} from './s5-presupuesto-recibos-de-texto2'
import {
  AIRE_DE_LA_PROPUESTA_DE_TEXTO3_BYTES,
  CENTESIMO_QUE_NO_ALCANZA_KIB,
  DESVIO_DE_TEXTO3_BYTES,
  ESCRITO_ANTES_DE_TEXTO3_BYTES,
  ESCRITO_DESPUES_DE_TEXTO3_BYTES,
  INVENTARIO_DE_TEXTO3,
  PROPUESTA_DE_TEXTO3_KIB,
  aireDeTexto3,
} from './s5-presupuesto-recibos-de-texto3'
import {
  MONTAJE_DE_COMPO1_KIB,
  MONTAJE_DE_COMPO2_KIB,
  MONTAJE_DE_TEXTO2_KIB,
  MONTAJE_DE_TEXTO3_KIB,
  PRESUPUESTO_DEL_LANE_KIB,
} from './s5-presupuesto'

export function afirmarLasLineasDeclaradasEnElMismoActo(): void {
  /**
   * ✅ **LA LÍNEA DE TEXTO-2, DECLARADA EN EL MISMO ACTO.** Es la primera vez que
   * un sprint que toca producto llega acá con su A/B ya hecho y su línea escrita:
   * la regla la dejó TAPADO-1 al no cumplirla —*«un sprint que toca producto
   * declara su línea en el mismo acto»*— y ésta es la primera que nace bajo ella
   * sin haber pasado antes por un rojo ajeno.
   *
   * 🔴 **Y es la SEGUNDA que usa la regla del aire útil**, con el caso más claro
   * que el tablero tuvo: la convención sola daba 0,04 KiB con **0,96 B de aire**
   * —7,04 B debajo del umbral—, así que la línea nace en 0,05, con 11,2 B.
   *
   * ⚠️ Lo que las tres afirmaciones de abajo impiden, igual que en TAPADO-1: que la
   * línea deje de ser la que su recibo mide, que nazca sin aire útil, y que el
   * lector de aire esté ciego. **El techo de 60 no se movió.**
   */
  console.log(
    `    TEXTO-2 declara su linea EN EL MISMO ACTO: ${DESVIO_DE_TEXTO2_BYTES} B medidos, ${INVENTARIO_DE_TEXTO2.length} piezas de inventario DERIVADO (no medido pieza por pieza, y se dice), y el «antes» de su A/B reproduce el «despues» del A/B de TAPADO-1 al decimo de byte: entre los dos sprints nadie agrego producto.`,
  )
  afirmar(
    MONTAJE_DE_TEXTO2_KIB === PROPUESTA_DE_TEXTO2_KIB,
    '✅ la línea de TEXTO-2 es la que su recibo propuso',
    `${MONTAJE_DE_TEXTO2_KIB} KiB por ${DESVIO_DE_TEXTO2_BYTES} B medidos — el techo de ${PRESUPUESTO_DEL_LANE_KIB} no se movió, y la línea sigue siendo revocable sola`,
  )
  afirmar(
    aireDeTexto2(MONTAJE_DE_TEXTO2_KIB) >= AIRE_MINIMO_UTIL_BYTES,
    '  y NACE con el aire arriba del umbral: la regla del aire útil, por segunda vez',
    `${AIRE_DE_LA_PROPUESTA_DE_TEXTO2_BYTES.toFixed(1)} B contra un umbral de ${AIRE_MINIMO_UTIL_BYTES} B — con el centésimo de la convención (${CENTESIMO_DE_LA_CONVENCION_KIB}) eran ${aireDeTexto2(CENTESIMO_DE_LA_CONVENCION_KIB).toFixed(2)} B, ${(AIRE_MINIMO_UTIL_BYTES - aireDeTexto2(CENTESIMO_DE_LA_CONVENCION_KIB)).toFixed(2)} B DEBAJO`,
  )
  controlPositivo(
    'el lector de aire tampoco está ciego acá: con el centésimo de la convención (0,04) el aire cae debajo del umbral',
    CENTESIMO_DE_LA_CONVENCION_KIB,
    (kib: number) => aireDeTexto2(kib) >= AIRE_MINIMO_UTIL_BYTES,
  )

  /**
   * ✅ **LA LÍNEA DE TEXTO-3 — la segunda declarada en el mismo acto, y la primera
   * cuyo A/B no pudo salir de `git`.**
   *
   * Este sprint abrió sobre el árbol de TEXTO-2, que está SIN COMMITEAR, así que
   * devolver los archivos a `HEAD` habría medido los dos juntos. El «antes» se
   * armó por archivo —cinco desde `HEAD`, dos desde el respaldo que TEXTO-2 dejó
   * fuera del árbol, con su sha256 verificado contra el recibo de aquel sprint— y
   * **reprodujo su cierre al décimo de byte**. Esa reproducción es la afirmación
   * de abajo: sin ella la resta no aísla nada.
   *
   * ⚠ Y es la primera de las tres últimas que NO necesita la regla del aire útil:
   * 216 B caen cerca del medio de su centésimo, así que 0,22 deja 9,3 B solo.
   */
  console.log(
    `    TEXTO-3 declara su linea EN EL MISMO ACTO: ${DESVIO_DE_TEXTO3_BYTES} B medidos, ${INVENTARIO_DE_TEXTO3.length} piezas de inventario DERIVADO (no medido pieza por pieza, y se dice). Son muchos bytes para lo que compran y se dice tambien: lo que se paga es el MECANISMO de la banda angosta, no la decision.`,
  )
  afirmarIgual(
    ESCRITO_ANTES_DE_TEXTO3_BYTES,
    ESCRITO_DESPUES_DE_TEXTO2_BYTES,
    '✅ el «antes» del A/B de TEXTO-3 ES el «después» del de TEXTO-2: la resta aísla ESTE sprint y no arrastra el anterior',
  )
  afirmar(
    MONTAJE_DE_TEXTO3_KIB === PROPUESTA_DE_TEXTO3_KIB,
    '  y la línea de TEXTO-3 es la que su recibo propuso',
    `${MONTAJE_DE_TEXTO3_KIB} KiB por ${DESVIO_DE_TEXTO3_BYTES} B medidos — el techo de ${PRESUPUESTO_DEL_LANE_KIB} no se movió, y la línea sigue siendo revocable sola`,
  )
  afirmar(
    aireDeTexto3(MONTAJE_DE_TEXTO3_KIB) >= AIRE_MINIMO_UTIL_BYTES,
    '  y su aire está arriba del umbral SIN necesitar la regla del aire útil',
    `${AIRE_DE_LA_PROPUESTA_DE_TEXTO3_BYTES.toFixed(1)} B contra un umbral de ${AIRE_MINIMO_UTIL_BYTES} B`,
  )
  controlPositivo(
    'el lector de aire ve el centésimo de ABAJO, con el que la línea no alcanza a cubrir lo medido',
    CENTESIMO_QUE_NO_ALCANZA_KIB,
    (kib: number) => aireDeTexto3(kib) >= AIRE_MINIMO_UTIL_BYTES,
  )

  /**
   * ✅ **LA LÍNEA DE COMPO-1 — la tercera declarada en el mismo acto, y la primera
   * que arma su «antes» con TRES fuentes.**
   *
   * Este sprint abrió sobre el árbol de TEXTO-3, que está sin commitear arriba de
   * MOVIL-1 y de TEXTO-2, así que devolver a `HEAD` habría medido cuatro sprints
   * juntos. El «antes» se armó por archivo —ocho desde el respaldo que este sprint
   * copió fuera del árbol ANTES de la primera edición, uno desde `HEAD` con su
   * `git status` publicado, y uno que se borra porque no existía— y **reprodujo el
   * cierre de TEXTO-3 al décimo de byte**. Esa reproducción es la afirmación de
   * abajo: sin ella la resta no aísla nada.
   *
   * ⚠ Y vuelve la regla del aire útil: 589 B caen a 4,9 B del borde de su
   * centésimo, así que la línea sube uno.
   */
  console.log(
    `    COMPO-1 declara su linea EN EL MISMO ACTO: ${DESVIO_DE_COMPO1_BYTES} B medidos, ${INVENTARIO_DE_COMPO1.length} piezas de inventario DERIVADO (no medido pieza por pieza, y se dice), y ${SHA256_DEL_ARBOL_DE_TEXTO3.length} sha256 publicados del arbol de TEXTO-3 para el sprint que venga. Es la cuarta linea mas grande del tablero —detras de B12, B4-A y el titular— y se dice por que: seis cadenas de clase y ocho claves de geometria adentro de un objeto que viaja entero.`,
  )
  afirmarIgual(
    ESCRITO_ANTES_DE_COMPO1_BYTES,
    ESCRITO_DESPUES_DE_TEXTO3_BYTES,
    '✅ el «antes» del A/B de COMPO-1 ES el «después» del de TEXTO-3: la resta aísla ESTE sprint y no arrastra los tres sin commitear que tiene debajo',
  )
  afirmar(
    MONTAJE_DE_COMPO1_KIB === PROPUESTA_DE_COMPO1_KIB,
    '  y la línea de COMPO-1 es la que su recibo propuso',
    `${MONTAJE_DE_COMPO1_KIB} KiB por ${DESVIO_DE_COMPO1_BYTES} B medidos — el techo de ${PRESUPUESTO_DEL_LANE_KIB} no se movió, y la línea sigue siendo revocable sola`,
  )
  afirmar(
    aireDeCompo1(MONTAJE_DE_COMPO1_KIB) >= AIRE_MINIMO_UTIL_BYTES,
    '  y NACE con el aire arriba del umbral: la regla del aire útil, por tercera vez',
    `${AIRE_DE_LA_PROPUESTA_DE_COMPO1_BYTES.toFixed(1)} B contra un umbral de ${AIRE_MINIMO_UTIL_BYTES} B — con el centésimo de la convención (${CENTESIMO_DE_LA_CONVENCION_DE_COMPO1_KIB}) eran ${aireDeCompo1(CENTESIMO_DE_LA_CONVENCION_DE_COMPO1_KIB).toFixed(2)} B, ${(AIRE_MINIMO_UTIL_BYTES - aireDeCompo1(CENTESIMO_DE_LA_CONVENCION_DE_COMPO1_KIB)).toFixed(2)} B DEBAJO`,
  )
  controlPositivo(
    'el lector de aire no está ciego acá tampoco: con el centésimo de la convención (0,58) el aire cae debajo del umbral',
    CENTESIMO_DE_LA_CONVENCION_DE_COMPO1_KIB,
    (kib: number) => aireDeCompo1(kib) >= AIRE_MINIMO_UTIL_BYTES,
  )

  /**
   * ✅ **LA LÍNEA DE COMPO-2 — la cuarta declarada en el mismo acto, la más chica
   * de las cuatro, y la PRIMERA que no necesita la regla del aire útil.**
   *
   * ⚠️ **Y la primera en la que una parte del sprint DEVUELVE peso.** La regla
   * global —la bajada en un renglón en los ocho anchos— saca del chunk dos
   * `<span>`, el separador de texto entre ellos y el `className` del envoltorio
   * que conmutaba: **−70 B**. Sin esa devolución la línea habría sido 256 B.
   *
   * ⚠ **PAPEL-2 NO dejó su bloque acá, y se declara**: su línea (0,76) está en
   * `s5-presupuesto.ts` con su prosa y su A/B, pero no tiene archivo de recibo
   * ni afirmación propia, así que es la única de las quince que nadie vigila
   * desde este archivo. No lo arregla COMPO-2 —es de otro sprint— y queda
   * anotado.
   *
   * ⚠ El «antes» de COMPO-2 no se puede comparar contra una constante de
   * PAPEL-2 porque no existe. Lo que se afirma es la aritmética del A/B —que
   * los dos extremos publicados dan el desvío publicado— más el control que
   * está en el recibo: el «antes» reconstruido reprodujo los **71.960,0 B** que
   * PAPEL-2 publicó en su §10, y los reprodujo en OTRO `distDir`.
   */
  console.log(
    `    COMPO-2 declara su linea EN EL MISMO ACTO: ${DESVIO_DE_COMPO2_BYTES} B medidos, ${INVENTARIO_DE_COMPO2.length} piezas de inventario DERIVADO (no medido pieza por pieza, y se dice, con 15 B publicados SIN atribuir). Es la linea mas chica del tablero despues de TAPADO-1, y se dice por que: la regla global DEVUELVE 70 B de marcado.`,
  )
  afirmarIgual(
    Number((ESCRITO_DESPUES_DE_COMPO2_BYTES - ESCRITO_ANTES_DE_COMPO2_BYTES).toFixed(1)),
    DESVIO_DE_COMPO2_BYTES,
    '✅ los dos extremos del A/B de COMPO-2 dan el desvío publicado: la resta no es un número suelto',
  )
  afirmar(
    DESVIO_DE_COMPO2_BYTES > RUIDO_ENTRE_BUILDS_BYTES * 10,
    '  y el desvío está MUY por encima del ruido entre dos builds del mismo árbol, que también se midió',
    `${DESVIO_DE_COMPO2_BYTES} B contra ${RUIDO_ENTRE_BUILDS_BYTES} B de ruido — 20 veces`,
  )
  afirmar(
    MONTAJE_DE_COMPO2_KIB === PROPUESTA_DE_COMPO2_KIB,
    '  y la línea de COMPO-2 es la que su recibo propuso',
    `${MONTAJE_DE_COMPO2_KIB} KiB por ${DESVIO_DE_COMPO2_BYTES} B medidos — el techo de ${PRESUPUESTO_DEL_LANE_KIB} no se movió, y la línea sigue siendo revocable sola`,
  )
  afirmar(
    aireDeCompo2(MONTAJE_DE_COMPO2_KIB) >= AIRE_MINIMO_UTIL_BYTES,
    '  y su aire está arriba del umbral SIN necesitar la regla del aire útil: la primera en cuatro',
    `${AIRE_DE_LA_PROPUESTA_DE_COMPO2_BYTES.toFixed(1)} B contra un umbral de ${AIRE_MINIMO_UTIL_BYTES} B`,
  )
  controlPositivo(
    'el lector de aire ve el centésimo de ABAJO, con el que la línea no alcanza a cubrir los 186 B medidos',
    CENTESIMO_DE_ABAJO_DE_COMPO2_KIB,
    (kib: number) => aireDeCompo2(kib) >= AIRE_MINIMO_UTIL_BYTES,
  )
}
