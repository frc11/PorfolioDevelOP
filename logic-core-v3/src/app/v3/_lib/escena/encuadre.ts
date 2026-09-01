/**
 * LA ARITMÉTICA DEL ENCUADRE, sin `three` — el único lugar donde vive el
 * recorrido lateral y vertical del logo dentro del cuadro.
 *
 * ── Por qué es un módulo aparte y no dos líneas dentro de `cameraFraming.ts` ─
 *
 * Porque `cameraFraming.ts` importa `three` para hacer tres productos
 * vectoriales, y **todo lo que quiera medir esta fórmula sin navegador paga ese
 * paquete entero**. Ésa es, con esas palabras, la razón por la que
 * `probe-escena/__tests__/harness.ts` la REESCRIBIÓ en vez de importarla
 * (`harness.ts:11-14`) — y una fórmula copiada es una fórmula que se arregla en
 * un lado solo. Acá queda como aritmética pura, importable desde el rig y desde
 * cualquier instrumento, para que el arreglo del defecto 14 no tenga dos
 * versiones.
 */

import { FRAME_TRAVEL_SAFETY } from './probeScene'

/**
 * EL RECORRIDO DISPONIBLE EN UN EJE — cuánto se puede correr el centro de la
 * caja antes de que uno de sus bordes coincida con el borde del cuadro.
 *
 * ── ⚠️ EL CODO EN CERO QUE ESTA FUNCIÓN ARREGLA (SITIO-S11, defecto 14) ────
 *
 * Hasta SITIO-S10 esto era `Math.max(0, medioCuadro − medidaDeLaCaja / 2)`, y
 * ese `max(0, …)` **no es un piso: es un codo**. Deja el recorrido clavado en
 * cero sobre toda una semirrecta —cada cuadro en el que la caja es más ancha
 * que el cuadro— y ahí la perilla de composición no mueve el objeto **ni un
 * píxel**, con el valor del keyframe intacto y sin que nada avise.
 *
 * **La medición que lo encontró** (`_lib/escena/__tests__/s10-logo.invariant.ts`
 * §7, y §7.40 de `docs/rediseno/DIRECCION-ESCENA.md`): sobre la pose `demos`
 * —`frameX: 1`, la composición lateral más íntima del recorrido— el codo cae en
 * relación de aspecto **1,213 con la caja del arnés (7,168) y 1,162 con la del
 * mesh medido en runtime (6,863)**. Un cuadro de **1025 × 900 da 1,139**, o sea
 * abajo de los dos: en el alto de pantalla más grande de los tres declarados, y
 * en las DOS cámaras, `frameX: 1` era un valor muerto. El Hero no tenía el
 * problema —su codo está en 0,567, abajo de todo aspecto medido—, y por eso el
 * defecto sobrevivió tres sprints de calibración a ojo sobre 1440 × 900.
 *
 * ── LA CORRECCIÓN: el valor absoluto, que es la continuación de la fórmula ──
 *
 * Muévase el centro `d`, la caja ocupa `[d − m/2, d + m/2]` y el cuadro
 * `[−h, +h]`. Los dos bordes coinciden en `d = ±(h − m/2)`, o sea que **la
 * magnitud del recorrido es `|h − m/2|` de los dos lados del codo**:
 *
 *   · **caja más angosta que el cuadro** (`h > m/2`) — el límite es que el
 *     borde de la caja toque el borde del cuadro DESDE ADENTRO. Es la rama que
 *     siempre funcionó, y `Math.abs` la deja idéntica al carácter.
 *   · **caja más ancha que el cuadro** (`h < m/2`) — el límite es el mismo
 *     borde coincidiendo DESDE AFUERA: empujar hasta que el borde de atrás de
 *     la caja llegue al borde del cuadro, que es lo más lejos que se la puede
 *     correr sin dejar cuadro sin cubrir. Es la rama que el `max(0, …)`
 *     aplastaba a cero.
 *   · **el codo mismo** (`h = m/2`, la caja llena el cuadro exacto) sigue
 *     dando cero, y ahora es **un punto** en vez de una semirrecta. La función
 *     es continua: no hay salto en ningún aspecto.
 *
 * ── ⚠️ QUÉ SE MOVIÓ Y QUÉ NO, medido antes de escribirlo ───────────────────
 *
 * **Ninguna pose cambia, y `FRAME_TRAVEL_SAFETY` tampoco.** Donde la perilla ya
 * funcionaba, `abs` y `max(0, …)` devuelven el MISMO número por construcción —
 * el argumento es positivo—: a 1440 × 900 (1,600), 1025 × 667 (1,537) y
 * 1025 × 844 (1,214) el recorrido de `demos` queda en 1,0049 · 0,8412 · 0,0029
 * clavado, y el control de equivalencia del §2 de `s10-logo.invariant.ts` lo
 * comprueba sobre el muestreo entero a 16/9. Lo único que se mueve es el caso
 * inerte: a **1025 × 900 el recorrido pasa de 0,0000 a 0,1936** (cámara del
 * arnés) y **de 0,0000 a 0,0595** (rig), o sea del 5,8% y del 1,8% del medio
 * ancho del cuadro.
 *
 * **En el eje vertical la corrección es un no-op comprobado, y se aplica igual
 * porque el defecto es el mismo.** `choreography.ts` declara `frameY: 0` en los
 * ocho keyframes y el muestreo del track lo confirma: el máximo de `|frameY|`
 * sobre 2001 progresos es exactamente 0. Con `frameY = 0` el término `frameY ×
 * travelY` es cero valga lo que valga `travelY`, así que arreglar el eje Y no
 * puede mover una composición aprobada — y dejarlo con el codo sería dejar
 * armada la misma trampa para el primer keyframe que use la perilla vertical.
 */
export function recorridoDeEncuadre(medioCuadro: number, medidaDeLaCaja: number): number {
  return Math.abs(medioCuadro - medidaDeLaCaja / 2) * FRAME_TRAVEL_SAFETY
}
