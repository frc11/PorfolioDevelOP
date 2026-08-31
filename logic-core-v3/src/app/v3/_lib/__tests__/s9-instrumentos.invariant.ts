/**
 * SITIO-S9 · LA DEUDA DE INSTRUMENTOS — cuatro pendientes que SITIO-S8 dejó
 * anotados, cada uno con el instrumento que lo mide.
 *
 * ── Qué custodia, en una línea por tarea ───────────────────────────────────
 *
 *   1. **El marcador de los controles positivos, unificado.** El repo tiene DOS
 *      arneses y el contador del agregado veía 14 de los 18 controles del lane
 *      de la escena. Ahora hay UN marcador y los ve todos.
 *   2. **El acoplamiento de TIPO hacia `/probe-escena`**, medido en vez de
 *      prometido: cero bytes, y un día de baja que el build NO va a mostrar.
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

import { DESTINOS_DE_LA_RUTA } from '../../_secciones/cierre/contenido'
import { BORDE_INFERIOR_EN_REPOSO_PX } from '../navegacion'

import { afirmar, afirmarIgual, cerrar, controlPositivo, noCorre, titulo } from './afirmar'
import { contarControles } from './s4-corrida'
import { resolver, tokensDelTema } from './s3-css'
import { LARGOS_HEREDADOS } from './s8-largos'
import {
  aPx,
  archivosDelLaneDeLaEscena,
  bloque713,
  contarLineas,
  declaracionCss,
  etiquetasMarcadas,
  existe,
  importaValorDe,
  leer,
  reclamaSerControl,
  rutasQueNombra,
  titulosDeSeccion,
  usosDeValor,
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
 * por comprobación —la unidad del otro lane— los declarados son 36. El número
 * subió porque cambió de unidad, no porque aparecieran controles nuevos.
 */
const MARCADOS_HOY = 36
const marcadosPorArchivo = LANE.map((archivo) => etiquetasMarcadas(leer(archivo)))
afirmarIgual(
  marcadosPorArchivo.reduce((n, m) => n + m, 0),
  MARCADOS_HOY,
  'etiquetas con el marcador en el fuente de los 34 (la corrida real de S9 dio el mismo número)',
)
console.log(`  · 14 → ${MARCADOS_HOY} controles visibles; 18 líneas con la frase → ${MARCADOS_HOY}, ya sin diferencia`)

const conMarcador = LANE.filter((_, i) => marcadosPorArchivo[i] > 0)
afirmarIgual(conMarcador.length, 17, 'y los 36 se reparten entre 17 de los 34 archivos — la mitad del lane no declara ninguno')

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

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · EL ACOPLAMIENTO DE TIPO HACIA /probe-escena — medido, no prometido')

const TRES = [
  'src/app/v3/_lib/escena/pistaDelHome.ts',
  'src/app/v3/_lib/escena/OrbitRig.tsx',
  'src/app/v3/_lib/escena/ProbeStage.tsx',
]
const EDITOR = 'src/app/probe-escena/_components/choreographyEditor.ts'
const IMPORT_DE_TIPO =
  /^import type \{ ChoreoEditor \} from '@\/app\/probe-escena\/_components\/choreographyEditor'$/m

for (const archivo of TRES) {
  const fuente = leer(archivo)
  afirmar(
    IMPORT_DE_TIPO.test(fuente),
    `${path.basename(archivo)} lo trae con \`import type\`, que el compilador borra por especificación`,
  )
  afirmarIgual(usosDeValor(fuente, 'ChoreoEditor'), [], `y ${path.basename(archivo)} no lo usa como VALOR en ninguna posición`)
  afirmar(!importaValorDe(fuente, 'probe-escena'), `y no importa un VALOR del panel: el costo en bytes es cero`)
}
controlPositivo(
  'el detector de import de VALOR no está ciego',
  "import { createChoreoEditor } from '@/app/probe-escena/_components/choreographyEditor'",
  (fuente: string) => !importaValorDe(fuente, 'probe-escena'),
)

/** El símbolo no tiene valor en runtime ni aunque alguien lo importara mal. */
afirmar(
  /^export type ChoreoEditor = \{$/m.test(leer(EDITOR)),
  '`ChoreoEditor` es un alias de TIPO — no existe en tiempo de ejecución, así que el costo es cero por construcción y no por convención',
)
afirmar(
  leer('tsconfig.json').includes('"isolatedModules": true'),
  'y con `isolatedModules` el borrado no depende de mirar el módulo del otro lado',
)

/**
 * ⚠ **EL DÍA QUE `/probe-escena` SE BORRE, EL BUILD NO SE VA A QUEJAR.**
 *
 * `tsc --noEmit` corta con TS2307 en los tres archivos (más un TS2304 por cada
 * uso del nombre). `npm run build` NO: `next.config.ts` declara
 * `typescript.ignoreBuildErrors`. El acoplamiento **no tiene guardia en el
 * build**, y ése es el número que importa del freno.
 */
afirmar(
  /ignoreBuildErrors:\s*true/.test(leer('next.config.ts')),
  'el build ignora los errores de tipo: la rotura sólo se ve corriendo `tsc --noEmit`',
)
afirmar(existe(EDITOR), `y hoy el panel existe (${contarLineas(leer(EDITOR))} líneas), así que la rotura todavía no ocurrió`)

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
/**
 * Resuelve un `calc()` de tokens a píxeles, con los tokens REALES del tema.
 * Devuelve `null` si algún `var()` no existe: un token inventado tiene que
 * fallar, no valer cero.
 */
function resolverEnPx(expresion: string): number | null {
  const cantidad = resolver(expresion, tokensDelTema())
  return cantidad === null || cantidad.unidad !== 'px' ? null : cantidad.n
}

titulo('4 · scroll-padding-top — el del sitio viejo, y el que /v3 declara encima')

const GLOBALS = leer('src/app/globals.css')
afirmarIgual(
  declaracionCss(GLOBALS, 'scroll-padding-top'),
  'var(--spacing-ds-nav)',
  '`globals.css` lo declara sobre el `<html>`, adentro de `@layer base`',
)
const NAV = declaracionCss(GLOBALS, '--spacing-ds-nav')
const SCROLL_PADDING_PX = NAV === null ? Number.NaN : (aPx(NAV) ?? Number.NaN)
afirmarIgual(SCROLL_PADDING_PX, 64, '`--spacing-ds-nav` = 4rem = 64px, que es el alto de la barra fija del sitio VIEJO')
controlPositivo('el conversor de unidades no acepta cualquier cosa', '4em', (valor: string) => aPx(valor) !== null)

/** /v3 hereda la regla porque el layout raíz importa `globals.css`. */
afirmar(
  leer('src/app/layout.tsx').includes('./globals.css'),
  'el layout raíz importa `globals.css`, así que la regla del `<html>` alcanza también a `/v3`',
)
afirmar(
  /pathname\.startsWith\('\/v3'\)/.test(leer('src/components/layout/SmoothScroll.tsx')),
  'y Lenis NO corre en /v3: el scroll es NATIVO, así que `scroll-padding-top` gobierna de verdad el aterrizaje',
)

/**
 * ⚠️ **LA VARA ES LA PASTILLA, Y LA DECIDIÓ EL HUMANO EN LA PARADA DE SITIO-S9.**
 *
 * Había dos, y las dos se midieron. Contra la **pastilla** —que en reposo ocupa
 * de `--spacing-6` (24) a 24 + su alto (48), o sea hasta **72 px**— el heredado
 * quedaba **8 px corto** y el borde de la sección se metía abajo de ella. Contra
 * el **borde del bloque** —cada sección es N × 100svh y su borde superior quiere
 * el borde del viewport— el valor correcto habría sido 0, y sobraban los 64
 * enteros. **Se eligió la pastilla:** un ancla que aterriza debajo de la pastilla
 * no sirve.
 */
const BORDE_INFERIOR_PASTILLA_PX = BORDE_INFERIOR_EN_REPOSO_PX
afirmarIgual(BORDE_INFERIOR_PASTILLA_PX, 72, 'la pastilla en reposo termina a 72px del borde superior (24 de reposo + 48 de alto)')
afirmarIgual(BORDE_INFERIOR_PASTILLA_PX - SCROLL_PADDING_PX, 8, 'y el heredado se quedaba 8px corto contra esa vara — el desvío que este sprint arregla')
afirmarIgual(DESTINOS_DE_LA_RUTA.length, 7, 'son SIETE las anclas que el pie ofrece, todas con el mismo aterrizaje')

/**
 * ⚠️ **EL ARREGLO NO TOCA CSS GLOBAL, Y ESO NO ERA GRATIS.** `scroll-padding` va
 * sobre el CONTENEDOR DE SCROLL, que es el `<html>`, y el `<html>` no lleva
 * `[data-v3]` —la marca vive en el envoltorio de `v3/layout.tsx`—. La salida es
 * `html:has([data-v3])`, que **sólo matchea cuando hay un `[data-v3]` en el
 * documento**: cumple la propiedad que el repo custodia —ninguna hoja de /v3
 * alcanza al sitio vivo— aunque no cumpliera el `startsWith` con el que
 * `s3-tokens` §5 la comprobaba. Ese detector aprendió la forma, anclada entera y
 * con tres controles positivos.
 */
const HOJA_NAV = leer('src/app/v3/_estilos/navegacion.css')
afirmar(
  HOJA_NAV.includes('html:has([data-v3])'),
  'la hoja de /v3 declara el `scroll-padding-top` sobre el contenedor de scroll, acotado con `:has()`',
)
afirmar(
  !GLOBALS.includes('[data-v3]') && declaracionCss(GLOBALS, 'scroll-padding-top') === 'var(--spacing-ds-nav)',
  '  y `globals.css` NO se tocó: el sitio vivo conserva sus 64px',
)

/**
 * El valor de la hoja no es un 72 escrito: es la MISMA cuenta que
 * `_lib/navegacion.ts` deriva de los cuatro tokens. Se comprueba resolviendo la
 * declaración contra `theme-develop.css`, no comparando texto — así, si mañana
 * alguien mueve `--spacing-3`, el número se mueve en los dos lados o esto falla.
 */
const DECLARADO = declaracionCss(HOJA_NAV, 'scroll-padding-top')
afirmar(DECLARADO !== null, '  y lo declara con un `calc()` de tokens, no con un literal', DECLARADO ?? '(nada)')
afirmarIgual(
  resolverEnPx(DECLARADO ?? ''),
  BORDE_INFERIOR_PASTILLA_PX,
  '  y ese `calc()` resuelve EXACTAMENTE al borde inferior de la pastilla en reposo',
)
controlPositivo(
  'el resolvedor no da por bueno un calc con un token que no existe',
  'calc(var(--no-existe) + var(--spacing-6))',
  (expr: string) => resolverEnPx(expr) !== null,
)

noCorre(
  'el aterrizaje REAL de las siete anclas, medido en el navegador',
  'el sprint prohíbe abrir un navegador, y una medición de scroll con la pestaña no visible da cero (lección de Aug 2026). Los 72 px son geométricos, derivados de los tokens; quien confirme el aterrizaje tiene que hacerlo con la pestaña al frente',
)

cerrar('s9-instrumentos')
