/**
 * INVARIANTE — EL CHROME DEL HOME: la pastilla, el pie y el cursor apagado.
 *
 * Corre con `npm run test:s8-chrome`.
 *
 * ── Qué custodia, y por qué cada cosa está acá ─────────────────────────────
 *
 *   1. **La pastilla se monta como hija DIRECTA del flujo.** Un `<div>` de más
 *      entre el `<main>` y el envoltorio `sticky` le deja el rango de pegado en
 *      cero y la pastilla deja de viajar **sin un solo error en consola**. Y
 *      desde SITIO-S11, que **el enlace de salto va antes, fuera del flujo**: es
 *      la primera parada del documento y no le mueve el nacimiento a la pastilla.
 *   2. **El umbral sigue valiendo contra el Hero REAL.** Se deriva de tokens y
 *      la derivación supone una primera pantalla de `100svh`: se comprueba
 *      contra la tabla del recorrido, no contra la memoria.
 *   3. **La cadena de ancestros sigue sin `overflow` recortado.** `sticky` se
 *      apaga en silencio si un ancestro lo tiene.
 *   4. **El pie enlaza las OCHO, derivadas**, y ningún `href` lleva a la nada.
 *   5. **El cursor está detrás de la constante, y la constante está en `false`.**
 *   6. **El rodeo de `peso` está restaurado, y se dice DÓNDE estaba.**
 *
 * Los detectores y las entradas rotas viven en `./soporte.ts`, afuera de este
 * archivo, para que cada control positivo corra LA MISMA función contra una
 * entrada fabricada.
 */

import { createElement } from 'react'

import { CURSOR_MIN_ANCHO_PX, deberiaMontarseElCursor } from '../../_lib/cursor'
import { MARCA_CURSOR } from '../../_lib/marcaCursor'
import {
  ALTO_PASTILLA_PX,
  DESCUENTO_NACIMIENTO_PX,
  DESCUENTO_UMBRAL_PX,
  ENLACES_DE_MUESTRA,
  TOKENS_DEL_UMBRAL,
  umbralPx,
} from '../../_lib/navegacion'
import { SECCIONES } from '../../_lib/secciones'
import { marcadoDelDocumento } from '../../_lib/__tests__/s10-banco'
import { paradasDeTabulacion } from '../../_lib/__tests__/s10-lectura'
import { afirmar, afirmarIgual, cerrar, controlPositivo, noCorre, titulo } from '../../_lib/__tests__/afirmar'
import { DIST, conjuntoInicial, contiene, kib, pesar, todosLosChunks } from '../../_lib/__tests__/s3-bundle'
import { Cierre } from '../../_secciones/cierre/Cierre'
import { ANCLAS_QUE_EXISTEN, CTA_DE_CIERRE, DESTINOS_DE_LA_RUTA } from '../../_secciones/cierre/contenido'
import { pantallasDe, seccionDe } from '../../_secciones/_contrato/forma'
import { marcar } from '../../_secciones/_invariantes/render'
import {
  CANDIDATOS_DEL_RODEO,
  CURSOR_PROPIO_EN_EL_HOME,
  EXPORT_DEL_CHROME,
  GATEADO_POR_SU_CUENTA,
  MODULO_DEL_CHROME,
  PIEZAS_QUE_SE_CONSUMEN,
} from '../contrato'
import { ChromeDelHome } from '../ChromeDelHome'
import { ROTULO_DEL_SALTO } from '../SaltarAlContenido'
import * as S from './soporte'

const CHROME = S.leer(MODULO_DEL_CHROME)
const CHROME_LIMPIO = S.sinComentariosNiCadenas(CHROME)
const MARCADO = marcar(createElement(ChromeDelHome), { anima: false })
const PIE = marcar(createElement(Cierre, { seccion: seccionDe('cierre') }), { anima: false })

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Lo que el chrome emite: el salto primero, y el envoltorio `sticky` sin envoltorio')

afirmar(S.existe(MODULO_DEL_CHROME), `el módulo existe: \`${MODULO_DEL_CHROME}\``)
afirmar(CHROME_LIMPIO.includes(`export function ${EXPORT_DEL_CHROME}(`), `y exporta \`${EXPORT_DEL_CHROME}\` con nombre, que es lo que el home importa`)
afirmar(MARCADO.includes('data-pieza="navegacion"'), 'el chrome monta la pastilla')

/**
 * ⚠️ LAS DOS AFIRMACIONES QUE SOSTIENEN EL MECANISMO — y son de naturaleza
 * distinta, así que se afirman por separado.
 *
 * El envoltorio de la pastilla es `sticky` con `block-size: 0`, y un `sticky` se
 * pega dentro de su CONTENEDOR DE BLOQUE: su rango de pegado es el alto del
 * contenedor menos el suyo. **(a) Nada lo puede ENVOLVER** —un `<div>` de alto
 * automático mediría lo que mide su contenido, cero, y el rango quedaría en cero:
 * la pastilla se iría con el scroll—, y eso lo dice el marcado. **(b) Lo que lo
 * precede no puede ocupar ALTO** —SITIO-S11 puso el enlace de salto antes que la
 * pastilla, y si midiera un píxel le correría el nacimiento—, y eso sólo lo puede
 * decir la hoja: `position: static` ahí rompe la cuenta de §2 sin cambiar una
 * línea de marcado. Por eso «el primer elemento es la pastilla» se partió en dos
 * en vez de aflojarse; el porqué del salto está en `_estilos/foco.css` y en
 * `_chrome/SaltarAlContenido.tsx`. Las dos fallan igual que el pinneo de
 * `_contrato/Seccion.tsx`: sin error, sin aviso, y con un marcado que se ve bien.
 */
afirmarIgual(S.profundidadDeLaPieza(MARCADO, 'navegacion'), 0, 'el envoltorio de la pastilla NO está envuelto: es hijo directo del fragmento, así que su contenedor de bloque es el `<main>` y el rango de pegado es el alto de las ocho secciones')
controlPositivo('el detector ve un envoltorio intermedio', S.MARCADO_CON_ENVOLTORIO, (h: string) => S.profundidadDeLaPieza(h, 'navegacion') === 0)
controlPositivo('y no se pone verde con un marcado vacío', '', (h: string) => S.profundidadDeLaPieza(h, 'navegacion') === 0)

const FOCO_CSS = S.leer('src/app/v3/_estilos/foco.css')
const SEL_SALTO = '[data-v3] [data-pieza="salto"]'
afirmarIgual(S.declaracionCss(FOCO_CSS, SEL_SALTO, 'position'), 'absolute', 'en reposo el enlace de salto está FUERA DEL FLUJO: no ocupa alto, así que la pastilla nace exactamente donde nacía')
afirmarIgual(S.declaracionCss(FOCO_CSS, `${SEL_SALTO}:focus-visible`, 'position'), 'fixed', '  y al enfocarlo se ve contra el VIEWPORT: el foco puede volver acá con `Shift+Tab` desde cualquier punto del recorrido')
controlPositivo('el detector ve un enlace de salto DENTRO del flujo', S.CSS_DEL_SALTO_EN_FLUJO, (c: string) => S.declaracionCss(c, SEL_SALTO, 'position') === 'absolute')
controlPositivo('y sabe decir que una propiedad NO está declarada, que es distinto de estar en otro valor', FOCO_CSS, (c: string) => S.declaracionCss(c, SEL_SALTO, 'display') !== null)

/* La primera parada del DOCUMENTO, con el banco y el lector de SITIO-S10 —acá no se escribe
   una segunda forma de contar paradas—: cierra los hallazgos 1 y 2 de `s10-acceso` §2 y §3. */
const PARADAS = paradasDeTabulacion(marcadoDelDocumento('quieta'))
afirmarIgual(PARADAS[0].rotulo, ROTULO_DEL_SALTO, `la PRIMERA de las ${PARADAS.length} paradas del documento es el enlace de salto: quien tabula ya no entra por los cinco de la pastilla`)
afirmarIgual(paradasDeTabulacion(marcadoDelDocumento('animada'))[0].rotulo, ROTULO_DEL_SALTO, '  en las DOS ramas: el enlace es marcado y una hoja, no cuelga de la coreografía')
afirmarIgual(PARADAS[0].destino, `#${SECCIONES[0].id}`, '  y salta a la PRIMERA sección de la tabla, no al `<main>` —que empieza ANTES que la pastilla y no saltearía nada—')
afirmar(marcadoDelDocumento('quieta').includes(`id="${SECCIONES[0].id}"`), '  y ese id EXISTE en el marcado del documento: el salto aterriza en algo')
controlPositivo('el buscador del ancla no está ciego', 'id="no-existe-en-el-documento"', (m: string) => marcadoDelDocumento('quieta').includes(m))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El umbral, derivado de tokens y verificado contra el Hero REAL')

afirmarIgual(ALTO_PASTILLA_PX, 2 * TOKENS_DEL_UMBRAL.rellenoVertical.px + TOKENS_DEL_UMBRAL.tamanoDeTexto.px * TOKENS_DEL_UMBRAL.interlineado.factor, `alto de la pastilla: 2×${TOKENS_DEL_UMBRAL.rellenoVertical.px} + ${TOKENS_DEL_UMBRAL.tamanoDeTexto.px}×${TOKENS_DEL_UMBRAL.interlineado.factor} = ${ALTO_PASTILLA_PX} px`)
afirmarIgual(DESCUENTO_NACIMIENTO_PX, TOKENS_DEL_UMBRAL.margenAlPie.px + ALTO_PASTILLA_PX, `nacimiento: 100svh − ${DESCUENTO_NACIMIENTO_PX} px`)
afirmarIgual(DESCUENTO_UMBRAL_PX, DESCUENTO_NACIMIENTO_PX + TOKENS_DEL_UMBRAL.reposo.px, `UMBRAL: 100svh − ${DESCUENTO_UMBRAL_PX} px`)
afirmarIgual(umbralPx(900), 900 - DESCUENTO_UMBRAL_PX, `a 900 px de viewport son ${umbralPx(900)} px`)

/**
 * ⚠️ **EL UMBRAL DEPENDE DE LA GEOMETRÍA DEL HERO, y por eso se comprueba acá.**
 *
 * `_lib/navegacion.ts` deriva el número de tres tokens, y `s3-navegacion` ya
 * recorre esa cuenta. Lo que ESE instrumento no puede ver es la premisa: la
 * derivación supone que **la primera pantalla mide `100svh`** y que la pastilla
 * nace cerca de su pie. Eso es una propiedad de la COMPOSICIÓN —de qué sección
 * va primera en la tabla— y sólo se puede afirmar con el home montado.
 */
const primera = SECCIONES[0]
afirmarIgual(primera.id, 'hero', 'la primera sección del recorrido es el Hero: es sobre él que nace la pastilla')
afirmarIgual(pantallasDe(primera), 1, `y mide UNA pantalla (\`${primera.alto}\`), que es la premisa de la derivación`)
afirmar(primera.pinneada === undefined, '  y no va pinneada: si lo estuviera, la primera pantalla duraría más de un viewport y el nacimiento caería sobre otra cosa')

const TEMA = S.leer('src/app/theme-develop.css')
const ESCALON = /pb-(\d+)/.exec(S.sinComentarios(S.leer('src/app/v3/_secciones/hero/Hero.tsx')))?.[1] ?? ''
const AIRE = S.pxDeEspaciado(ESCALON, TEMA)
afirmar(ESCALON.length > 0, `el Hero reserva el aire del pie con \`pb-${ESCALON}\``)
afirmar(AIRE >= DESCUENTO_NACIMIENTO_PX, `y ese aire (${AIRE} px, leído del tema) cubre los ${DESCUENTO_NACIMIENTO_PX} px que la pastilla ocupa: el número SIGUE VALIENDO con el Hero real`)
controlPositivo('la cuenta ve un escalón que NO alcanza', '4', (e: string) => S.pxDeEspaciado(e, TEMA) >= DESCUENTO_NACIMIENTO_PX)
console.log(`  la cuenta, entera: reposo ${TOKENS_DEL_UMBRAL.reposo.px} + alto ${ALTO_PASTILLA_PX} + margen ${TOKENS_DEL_UMBRAL.margenAlPie.px} → nace en 100svh − ${DESCUENTO_NACIMIENTO_PX}, umbral en 100svh − ${DESCUENTO_UMBRAL_PX}. A 900 de viewport: nace en ${900 - DESCUENTO_NACIMIENTO_PX}, se fija a los ${umbralPx(900)} px de scroll.`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La cadena de ancestros del `sticky` sigue sin `overflow` recortado')

/**
 * Los cuatro ancestros del envoltorio, de adentro hacia afuera:
 * `<main>` → `<div data-v3>` → `<body>` → `<html>`. No hay un quinto: el chrome
 * es hijo directo del `<main>` (bloque 1) y `/v3` no lleva chrome público
 * —`publicRoute.ts` lo declara sin barra ni Shutter—, así que nada más se
 * interpone.
 */
const ANCESTROS_CSS = ['html', 'body', ':root', '*', 'main', '[data-v3]']
const HOJAS = ['src/app/globals.css', 'src/app/theme-develop.css', ...['cta', 'navegacion', 'cursor', 'pie', 'foco'].map((h) => `src/app/v3/_estilos/${h}.css`)]
for (const hoja of HOJAS) {
  afirmarIgual(S.overflowsSobreAncestros(S.leer(hoja), ANCESTROS_CSS), [], `\`${hoja}\` no recorta el overflow de ningún ancestro`)
}
controlPositivo('el detector ve un overflow recortado sobre un ancestro', S.CSS_CON_OVERFLOW, (c: string) => S.overflowsSobreAncestros(c, ANCESTROS_CSS).length === 0)
controlPositivo('y NO lo ve cuando el selector no es un ancestro', '.tarjeta { overflow: hidden; }', (c: string) => S.overflowsSobreAncestros(c, ANCESTROS_CSS).length > 0)

const LAYOUTS = ['src/app/layout.tsx', 'src/app/v3/layout.tsx', 'src/app/v3/page.tsx', MODULO_DEL_CHROME]
for (const archivo of LAYOUTS) {
  afirmarIgual(S.clasesDeOverflow(S.leer(archivo)), [], `\`${archivo}\` no escribe una utilidad de overflow`)
}
controlPositivo('el detector ve un `overflow-x-hidden` de Tailwind', S.TSX_CON_OVERFLOW, (f: string) => S.clasesDeOverflow(f).length === 0)
controlPositivo('y NO lo confunde con el comentario que lo explica', '// reemplazó al overflow:hidden de EarlyScrollLock', (f: string) => S.clasesDeOverflow(f).length > 0)

/**
 * ⚠️ LA ÚNICA COSA QUE PODRÍA PONER `overflow: clip` EN EL `<html>` DE /v3.
 *
 * `lenis/dist/lenis.css` viaja en el bundle del sitio entero y trae
 * `.lenis…lenis-stopped { overflow: clip }` sobre el `<html>`. La regla necesita
 * la clase, y la clase la escribe Lenis al construirse: `SmoothScroll` **se sale
 * antes para `/v3`**, así que nunca se aplica. Esa salida temprana no es una
 * optimización — es lo que sostiene el `sticky` de la pastilla y el de las dos
 * secciones pinneadas.
 */
const SMOOTH = S.sinComentarios(S.leer('src/components/layout/SmoothScroll.tsx'))
afirmar(/pathname\.startsWith\('\/v3'\)/.test(SMOOTH) && /return/.test(SMOOTH), 'Lenis NO corre en /v3: `SmoothScroll` se sale antes, así que su clase —y su `overflow: clip`— nunca llegan al `<html>`')
controlPositivo('el lector ve un SmoothScroll sin esa salida', "if (isPortal) { return }", (f: string) => /pathname\.startsWith\('\/v3'\)/.test(f))

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El pie enlaza las OCHO, DERIVADAS, y ningún href lleva a la nada')

afirmarIgual(ANCLAS_QUE_EXISTEN.length, SECCIONES.length, `las anclas que existen son las ${SECCIONES.length} de la tabla`)
afirmarIgual(DESTINOS_DE_LA_RUTA.length, SECCIONES.length - 1, `y el pie ofrece ${DESTINOS_DE_LA_RUTA.length}: todas menos el Cierre, que no se enlaza a sí mismo`)
afirmarIgual(
  DESTINOS_DE_LA_RUTA.map((d) => d.ancla),
  SECCIONES.filter((s) => s.id !== 'cierre').map((s) => `#${s.id}`),
  'en el ORDEN DEL RECORRIDO, derivado de la tabla y no escrito al lado',
)
afirmarIgual(
  DESTINOS_DE_LA_RUTA.map((d) => d.rotulo),
  SECCIONES.filter((s) => s.id !== 'cierre').map((s) => s.nombre),
  '  y con los rótulos de la misma fila: el nombre y el destino no se pueden desincronizar',
)
const HREFS_DEL_PIE = S.hrefsDe(PIE)
afirmarIgual(S.aLaNada(HREFS_DEL_PIE, ANCLAS_QUE_EXISTEN), [], `los ${HREFS_DEL_PIE.length} enlaces del pie renderizado apuntan a un ancla que existe`)
afirmarIgual(S.aLaNada(ENLACES_DE_MUESTRA.map((e) => e.destino), ANCLAS_QUE_EXISTEN), [], `y los ${ENLACES_DE_MUESTRA.length} de la pastilla también — son de muestra, pero no llevan a la nada`)
controlPositivo('el detector ve un href a la nada', S.HREFS_A_LA_NADA, (l: readonly string[]) => S.aLaNada(l, ANCLAS_QUE_EXISTEN).length === 0)
controlPositivo('y no se pone verde con la lista vacía de anclas', ['#hero'], (l: readonly string[]) => S.aLaNada(l, []).length === 0)

/**
 * ⚠️ **LO QUE ESTE CAMBIO ROMPIÓ Y ESTE SPRINT NO ARREGLA.** Se publica con el
 * número y no se afirma: la salida es de CONTENIDO y la decide el humano.
 */
console.log(`  ⚠️ EL CTA DEL CIERRE CAMBIÓ DE DESTINO. Toma \`DESTINOS_DE_LA_RUTA[0].ancla\`, que con las cuatro de antes era \`#servicios\` y con las ocho en orden de recorrido es \`${CTA_DE_CIERRE.destino}\`. Su rótulo —«${CTA_DE_CIERRE.rotulo}»— ya no corresponde. Las dos salidas: cambiar el rótulo, o desatar el destino del \`[0]\`. Ninguna se tomó acá.`)
afirmar(ANCLAS_QUE_EXISTEN.includes(CTA_DE_CIERRE.destino), '  lo que SÍ se puede afirmar: el CTA sigue apuntando a un ancla que EXISTE, así que no es un botón muerto')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · EL RODEO DE `peso` — restaurado, y NO estaba en Servicios')

/**
 * ⚠️ **LA INSTRUCCIÓN DECÍA «SERVICIOS» Y EL RODEO NO ESTABA AHÍ** (regla 8: una
 * afirmación incorrecta se reemplaza y se explica, nunca se afloja).
 *
 * §7.24 y la instrucción de este sprint dicen que *«`peso="medio"` sigue
 * esquivado en Servicios»*, y ninguna de las dos da la línea. El único rodeo con
 * su motivo escrito al lado está en `cierre/ColumnasDelPie.tsx`, y en Servicios
 * lo que hay es OTRA cosa: un rodeo del MISMO defecto de `cn()` pero sobre el
 * COLOR, que SITIO-S7 ya sacó al arreglar la raíz. Restaurar algo en Servicios
 * para que la frase quedara cierta habría sido inventar composición.
 */
const RODEO = 'src/app/v3/_secciones/cierre/ColumnasDelPie.tsx'
const SERVICIOS = 'src/app/v3/_secciones/servicios/ContenidoDeServicio.tsx'
afirmarIgual([...CANDIDATOS_DEL_RODEO], [RODEO, SERVICIOS], 'los dos candidatos que la Fase 0 dejó localizados')
afirmar(/peso="medio"/.test(S.sinComentarios(S.leer(RODEO))), `el rodeo estaba en \`${RODEO}\` y SITIO-S8 lo restaura`)
afirmarIgual([...S.sinComentarios(S.leer(SERVICIOS)).matchAll(/\speso=/g)].length, 0, `y en \`${SERVICIOS}\` no hay un solo \`peso=\`: no había nada que restaurar ahí`)

const CLASES_DEL_MARCADOR = S.clasesDelElementoCon(PIE, '\\[ENLACE\\]')
afirmar(CLASES_DEL_MARCADOR.includes('font-medio'), 'en pantalla: la pieza del pie recupera `font-medio`', CLASES_DEL_MARCADOR.join(' '))
afirmar(CLASES_DEL_MARCADOR.includes('font-codigo'), '  y conserva `font-codigo`: los dos conviven, que es lo que `cn()` no sabía hacer')
afirmar(!CLASES_DEL_MARCADOR.includes('font-normal'), '  y el `font-normal` del componente ya no gana')
controlPositivo('el lector de clases ve la pieza SIN el peso', S.MARCADO_SIN_PESO, (h: string) => S.clasesDelElementoCon(h, '\\[ENLACE\\]').includes('font-medio'))
console.log('  ⚠️ QUÉ CAMBIA EN PANTALLA: los dos marcadores `[ENLACE]` de la columna de contacto pasan de `--font-weight-normal` (400) a `--font-weight-medio` (500). Es composición, y por eso se reporta. Queda ASIMÉTRICO con la línea de cierre de `Cierre.tsx`, que tiene la misma forma y sigue en 400: ese archivo no es de este frente.')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El cursor propio, detrás de la constante — y la constante en `false`')

// Se ensancha a `boolean` para poder AFIRMARLO: con el literal, `tsc` sabe la
// respuesta y la comparación no podría fallar nunca.
const decision: boolean = CURSOR_PROPIO_EN_EL_HOME
afirmar(decision === false, 'la decisión que nadie tomó SIGUE sin tomarse: `CURSOR_PROPIO_EN_EL_HOME` está en `false`')
afirmar(CHROME_LIMPIO.includes('CURSOR_PROPIO_EN_EL_HOME'), 'y el chrome la LEE: el montaje del cursor cuelga de ella, no de un comentario')
afirmar(S.importsDe(CHROME).includes('../_componentes/chrome/CursorCompuerta'), '  montando la compuerta que YA EXISTE desde S3, no una nueva')
afirmar(!MARCADO.includes(MARCA_CURSOR), 'con la constante en `false` el cursor no aparece en el marcado')
controlPositivo('el buscador de la marca no está ciego', `<div data-marca="${MARCA_CURSOR}"></div>`, (h: string) => !h.includes(MARCA_CURSOR))

/** Las dos compuertas de S3 siguen enteras: el chrome agrega una tercera, no las reemplaza. */
afirmarIgual(GATEADO_POR_SU_CUENTA.filter((a) => !S.existe(a)), [], 'la pieza gateada por su cuenta existe')
for (const [ancho, menos, esperado] of [[true, false, true], [false, false, false], [true, true, false], [false, true, false]] as const) {
  afirmarIgual(deberiaMontarseElCursor(ancho, menos), esperado, `  compuertas de S3: arriba del umbral=${ancho}, menos movimiento=${menos} → ${esperado}`)
}
// §7.25: se mira el fuente SIN comentarios. El docblock de `ChromeDelHome`
// EXPLICA el umbral de 1025 —eso es correcto y es la mitad del trabajo—; lo que
// no puede es declararlo. Un detector que mirara el archivo entero pondría en
// rojo justamente el haberlo escrito.
afirmarIgual([...CHROME_LIMPIO.matchAll(/\bmatchMedia\b|\b1025\b/g)].map((m) => m[0]), [], 'y el chrome no reimplementa ninguna de las dos: no nombra `matchMedia` ni el umbral')
controlPositivo('el detector ve el umbral declarado en código', 'const UMBRAL = 1025', (f: string) => [...S.sinComentariosNiCadenas(f).matchAll(/\bmatchMedia\b|\b1025\b/g)].length === 0)
console.log(`  el umbral de montaje del cursor sigue siendo el único del sistema: ${CURSOR_MIN_ANCHO_PX} px, importado y no reescrito.`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Nada del chrome se monta abajo de 1025 salvo lo declarado')

/**
 * La pastilla es la excepción, y no es una concesión: es CSS `sticky` puro. Lo
 * que lo hace verdad es que el chrome no importe una línea de JavaScript de
 * comportamiento — ni el sistema de motion, ni un hook, ni `next/dynamic`.
 */
const PROHIBIDOS: readonly [string, RegExp][] = [
  ['el sistema de motion', /_lib\/motion\//],
  ['las primitivas de coreografía', /_contrato\/coreografia/],
  ['`next/dynamic`', /^next\/dynamic$/],
]
for (const [nombre, patron] of PROHIBIDOS) {
  afirmarIgual(S.importsDe(CHROME).filter((m) => patron.test(m)), [], `el chrome no importa ${nombre}`)
}
afirmar(!/'use client'/.test(CHROME_LIMPIO), 'y no lleva `use client`: es un componente de servidor — la pastilla es marcado y clases')
controlPositivo('el detector de imports ve uno del sistema de motion', "import { X } from '../_lib/motion/patrones'", (f: string) => S.importsDe(f).filter((m) => /_lib\/motion\//.test(m)).length === 0)
afirmarIgual(PIEZAS_QUE_SE_CONSUMEN.filter((a) => !S.existe(a)), [], `las ${PIEZAS_QUE_SE_CONSUMEN.length} piezas que el chrome consume existen: no se reescribió ninguna`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · EL PESO — qué costaría prender el cursor, sobre la salida del build')

if (!S.existe('.next')) {
  noCorre('el peso del chunk perezoso del cursor', 'no hay build en `.next`. Corré `npm run build` y volvé a correr esto.')
} else {
  const chunks = todosLosChunks()
  const conLaMarca = chunks.filter((f) => contiene(f, MARCA_CURSOR))
  const peso = pesar(conLaMarca)
  afirmar(chunks.length > 0, `el build tiene ${chunks.length} chunks para buscar`)
  afirmar(conLaMarca.length > 0, `la marca del cursor está en ${conLaMarca.length} chunk(s)`, conLaMarca.join(' · '))
  console.log(`  ⚠️ EL NÚMERO DE LA DECISIÓN: prender \`CURSOR_PROPIO_EN_EL_HOME\` haría que /v3 pida ${kib(peso.crudo)} crudo · ${kib(peso.gzip)} gzip DE MÁS, y sólo arriba de ${CURSOR_MIN_ANCHO_PX} px y sin \`prefers-reduced-motion\`. El chunk es autocontenido: su único import de valor fuera de React son dos módulos de datos de \`_lib\`. La hoja \`cursor.css\` ya viaja hoy —el layout de /v3 la importa— así que prenderlo NO agrega CSS.`)
  const inicial = conjuntoInicial('/v3')
  if (inicial.length === 0) {
    noCorre('la marca del cursor fuera de la carga inicial de /v3', `no hay HTML prerenderizado de /v3 en ${DIST}`)
  } else {
    afirmarIgual(inicial.filter((f) => contiene(f, MARCA_CURSOR)), [], `con la constante en \`false\`, ningún archivo de la carga inicial de /v3 (${inicial.length}) lleva la marca del cursor`)
    afirmar(conLaMarca.length > 0 && inicial.filter((f) => contiene(f, MARCA_CURSOR)).length === 0, '  y el chequeo distingue las dos cosas: encuentra la marca en el build y NO la encuentra en la carga inicial')
  }
  controlPositivo('el buscador no encuentra una marca que no existe', 'v3-cursor-que-no-existe-en-ningun-chunk', (m: string) => chunks.some((f) => contiene(f, m)))
}

cerrar('s8-chrome.invariant')
