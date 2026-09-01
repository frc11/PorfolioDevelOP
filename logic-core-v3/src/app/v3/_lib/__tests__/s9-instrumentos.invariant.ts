/**
 * SITIO-S9 · LA DEUDA DE INSTRUMENTOS — cuatro pendientes que SITIO-S8 dejó
 * anotados, cada uno con el instrumento que lo mide.
 *
 * ⚠️ **§2 vive en `s9-acoplamiento.ts` desde SITIO-S11**, que lo reescribió
 * entero al cerrar el acoplamiento y con eso hizo cruzar las 300 líneas a este
 * archivo. El corte es por tema; la razón completa está en ese módulo.
 *
 * ── Qué custodia, en una línea por tarea ───────────────────────────────────
 *
 *   1. **El marcador de los controles positivos, unificado.** El repo tiene DOS
 *      arneses y el contador del agregado veía 14 de los 18 controles del lane
 *      de la escena. Ahora hay UN marcador y los ve todos.
 *   2. **El acoplamiento de TIPO hacia `/probe-escena`** — CERRADO en S11.
 *   3. **§7.13 apunta a rutas que existen**, que es lo que la mudanza de S8 le
 *      había roto.
 *   4. **El `scroll-padding-top` del sitio viejo aplica a `/v3`**, con el desvío
 *      en píxeles y las dos varas contra las que se lo puede medir.
 *
 * ── ⚠️ LA DECISIÓN DE FONDO DE LA TAREA 1, Y SU RAZÓN ──────────────────────
 *
 * **El marcador es el prefijo `control positivo — ` en la ETIQUETA de un
 * `check()`. Nada más cuenta: ni un título de `section()`, ni un docblock, ni el
 * detalle de una comprobación.**
 *
 * Se eligió así, y no al revés, por tres cosas:
 *
 *   · **La unidad tiene que ser la misma en los dos lanes o el número no se
 *     puede comparar**, que es el objetivo entero. En el lane del SITIO un
 *     control es una llamada a `controlPositivo()`, o sea UNA afirmación. En el
 *     lane de la escena la contraparte es UNA comprobación que le da al
 *     instrumento la entrada equivocada. Un título de sección encabeza un GRUPO:
 *     contarlo como uno subcontaba, y contarlo como el grupo entero pedía un
 *     patrón nuevo. Se movieron las etiquetas.
 *   · **El patrón anclado a la FORMA DE LA LÍNEA se conserva intacto.** §7.25 ya
 *     mordió acá una vez: un contador que buscaba la frase suelta se contaba a
 *     sí mismo describiéndose. `contarControles` no se tocó — se le dieron
 *     líneas que ya sabía leer.
 *   · **El otro patrón, `[control positivo]`, NO queda sin uso**: es el que
 *     emite `controlPositivo()` de `afirmar.ts`, o sea todo el lane del SITIO.
 *     §1 lo afirma sobre el fuente, para que nadie lo borre por parecer muerto.
 *
 * **Lo que este barrido movió y lo que no.** Movió los controles que el propio
 * archivo YA DECLARABA con esa frase —en la etiqueta, en el título de la sección
 * o en el docblock de arriba—. **No inventó controles nuevos**: el lane ejerce
 * unos cuantos más sin declararlos («el instrumento se mueve», «es el control»)
 * y marcarlos sería una decisión de CONTENIDO, no de marcador. Están listados en
 * el reporte de SITIO-S9, con archivo y línea, para el sprint que los tome.
 */

import path from 'node:path'


import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { contarControles } from './s4-corrida'
import { LARGOS_HEREDADOS } from './s8-largos'
import { afirmarElAcoplamientoCerrado } from './s9-acoplamiento'
import { afirmarElScrollPadding } from './s9-scrollPadding'
import {
  archivosDelLaneDeLaEscena,
  bloque713,
  contarLineas,
  etiquetasMarcadas,
  existe,
  leer,
  reclamaSerControl,
  rutasQueNombra,
  titulosDeSeccion,
} from './s9-instrumentos'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · EL MARCADOR DEL LANE DE LA ESCENA — uno solo, y el contador lo ve')

const LANE = archivosDelLaneDeLaEscena()
afirmarIgual(LANE.length, 34, 'los archivos del lane de la escena, derivados de `package.json`')

/**
 * ⚠ **LA MEDICIÓN QUE ABRIÓ LA TAREA, PARA QUE EL NÚMERO NUEVO SE PUEDA LEER.**
 *
 * Antes del barrido, corriendo los 34 con `correr()` de `s4-corrida.ts`:
 * `contarControles` veía **14**, y la frase aparecía en **18** líneas de salida.
 * Los cuatro que se perdían: tres títulos de `section()`
 * —`introSampling.invariant.ts:344`, `s9-composicion.invariant.ts:31` e
 * `introRig.invariant.ts:236`— y una línea de DETALLE
 * (`s11-celosia.invariant.ts:116`), que el patrón anclado descarta a propósito.
 *
 * **Y los 18 nunca fueron los controles: eran las LÍNEAS con la frase.** Contados
 * por comprobación —la unidad del otro lane— los declarados eran 36. Ese número
 * subió porque cambió de unidad, no porque aparecieran controles nuevos.
 *
 * ── ⚠ Y EN SITIO-S10 SUBIÓ OTRA VEZ, Y AHORA SÍ ES PORQUE APARECIERON ──────
 *
 * **36 → 80.** Los 44 nuevos son los controles positivos que `s7e` y `s10e` no
 * tenían, y que §7.33 dejaba anotados con esas palabras: *«corren 10 invariantes
 * y 152 afirmaciones sin un solo control positivo. No es un problema de
 * marcador: no existen.»* Ahora existen, repartidos en los diez archivos, y el
 * reparto pasa de **17 de los 34** a **27**: los diez que no declaraban ninguno.
 *
 * **Actualizar estos dos números NO es aflojar una afirmación, y la distinción
 * importa.** Un umbral se afloja cuando la propiedad que custodia dejó de
 * cumplirse y se baja la vara para que pase. Acá la propiedad es un CENSO —
 * cuántos controles declara el lane— y el sprint existía para moverlo. Es la
 * misma forma de §7.29: *un invariante que se pone en rojo porque el problema
 * que custodiaba se resolvió no es una regresión, es la señal de que el trabajo
 * llegó*. Y como en aquél, **el frente que lo movió lo vio y NO lo tocó** —el
 * archivo no estaba en sus editables— así que la re-medición la hizo el agente
 * principal en la integración.
 *
 * `contarControles` **no se tocó**, y ésa sigue siendo la parte que importa: los
 * 44 nuevos usan el marcador de etiqueta que el contador ya sabía leer, así que
 * el anclaje a la forma de la línea —la protección de §7.25— queda intacto.
 */
const MARCADOS_HOY = 80
/** Los que había antes de SITIO-S10. Se conserva para que el delta se lea. */
const MARCADOS_ANTES_DE_S10 = 36
const marcadosPorArchivo = LANE.map((archivo) => etiquetasMarcadas(leer(archivo)))
afirmarIgual(
  marcadosPorArchivo.reduce((n, m) => n + m, 0),
  MARCADOS_HOY,
  `etiquetas con el marcador en el fuente de los 34 — ${MARCADOS_ANTES_DE_S10} antes de SITIO-S10, ${MARCADOS_HOY} ahora`,
)
console.log(`  · 14 → ${MARCADOS_ANTES_DE_S10} al unificar la unidad (SITIO-S9) → ${MARCADOS_HOY} al escribir los que faltaban (SITIO-S10): +${MARCADOS_HOY - MARCADOS_ANTES_DE_S10}, y éstos SÍ son controles nuevos`)

const conMarcador = LANE.filter((_, i) => marcadosPorArchivo[i] > 0)
afirmarIgual(
  conMarcador.length,
  27,
  `y los ${MARCADOS_HOY} se reparten entre 27 de los 34 archivos — eran 17, y los diez que se sumaron son exactamente los de \`s7e\` y \`s10e\``,
)

/** El contador SÍ ve una etiqueta marcada, en la forma exacta que el arnés imprime. */
afirmarIgual(contarControles('  ok  control positivo — algo  · 3 de 4'), 1, 'el contador ve una etiqueta marcada')

/**
 * ⚠ **EL CONTROL QUE PROTEGE §7.25, Y ES UNA LÍNEA REAL DEL REPO.**
 *
 * `s11-celosia.invariant.ts` cierra su control con el detalle «sin control
 * positivo, un buscador roto daría "una sola vez" contra cualquier cosa». Si el
 * patrón buscara la frase suelta, esa línea sumaría DOS donde hay uno — el
 * escáner contándose a sí mismo describiéndose. Se dejó el texto tal cual, a
 * propósito: es el espécimen vivo de la trampa.
 */
controlPositivo(
  'el contador NO cuenta la frase cuando vive en el DETALLE de la comprobación',
  '  ok  el buscador del ancla sabe decir que NO está  · sin control positivo, un buscador roto daría "una sola vez"',
  (linea: string) => contarControles(linea) === 1,
)
controlPositivo(
  'ni cuando vive en el título de una `section()`',
  '\n── control positivo — el instrumento detecta el cruce ─────────',
  (linea: string) => contarControles(linea) === 1,
)

/** Ningún título de sección reclama ser un control: ése era el marcador viejo. */
const titulosQueReclaman = LANE.flatMap((archivo) =>
  titulosDeSeccion(leer(archivo))
    .filter(reclamaSerControl)
    .map((texto) => `${archivo}: ${texto}`),
)
afirmarIgual(titulosQueReclaman, [], 'ningún `section()` del lane se declara control positivo')
controlPositivo(
  'el detector de títulos SÍ ve uno que reclama serlo',
  "section('control positivo — que estas comprobaciones puedan fallar')",
  (fuente: string) => titulosDeSeccion(fuente).filter(reclamaSerControl).length === 0,
)

/** El patrón de corchetes NO quedó sin uso: es el del lane del SITIO. */
afirmar(
  leer('src/app/v3/_lib/__tests__/afirmar.ts').includes('[control positivo]'),
  '`contarControles` conserva sus DOS patrones porque los dos se usan: el de corchetes lo emite `controlPositivo()` de `afirmar.ts`',
)
afirmarIgual(contarControles('  ok   [control positivo] lo que sea'), 1, 'y el de corchetes sigue contando')

// ═════════════════════════════════════════════════════════════════════════
// §2 vive en `s9-acoplamiento.ts`: la reescritura de SITIO-S11 lo hizo cruzar
// las 300 líneas del repo. El corte es por tema — no comparte una constante con
// lo que queda acá.
afirmarElAcoplamientoCerrado()

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · §7.13 — las rutas existen en el disco, y los largos no se movieron')

const BLOQUE = bloque713(leer('docs/rediseno/DIRECCION-ESCENA.md'))
afirmar(BLOQUE.length > 1000, `§7.13 se encontró y se leyó entero (${BLOQUE.length} caracteres)`)

const RUTAS_713 = rutasQueNombra(BLOQUE)
afirmar(RUTAS_713.length >= 12, `§7.13 nombra ${RUTAS_713.length} rutas repo-relativas`)
afirmarIgual(
  RUTAS_713.filter((ruta) => !existe(ruta)),
  [],
  'y TODAS existen en el disco — que es exactamente lo que la mudanza de S8 le había roto',
)
controlPositivo(
  'el detector de rutas inexistentes no está ciego',
  'src/app/probe-escena/_components/OrbitRig.tsx',
  (ruta: string) => existe(ruta),
)

/** Los seis heredados están nombrados por §7.13, y miden lo que declara la base. */
const heredados = Object.keys(LARGOS_HEREDADOS).sort()
afirmarIgual(
  heredados.filter((ruta) => !RUTAS_713.includes(ruta)),
  [],
  'los seis de `LARGOS_HEREDADOS` están nombrados en §7.13 — `probeMoire.ts` faltaba y SITIO-S9 lo agregó',
)
afirmarIgual(
  heredados
    .map((ruta) => ({ ruta, hoy: contarLineas(leer(ruta)), base: LARGOS_HEREDADOS[ruta] }))
    .filter((medido) => medido.hoy !== medido.base),
  [],
  'y ninguno se movió: los seis miden hoy exactamente su línea de base',
)
console.log(`  · ${heredados.map((ruta) => `${path.basename(ruta)} ${LARGOS_HEREDADOS[ruta]}`).join(' · ')}`)
controlPositivo(
  '`contarLineas` cuenta saltos como `wc -l`, no elementos de `split`',
  'a\nb\n',
  (texto: string) => contarLineas(texto) === 3,
)

// ═══════════════════════════════════════════════════════════════════════════
// ═════════════════════════════════════════════════════════════════════════
// §4 vive en `s9-scrollPadding.ts`, por el mismo corte que §2: la reescritura
// del acoplamiento hizo cruzar las 300 líneas a este archivo.
afirmarElScrollPadding()

cerrar('s9-instrumentos')
