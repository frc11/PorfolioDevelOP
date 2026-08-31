/**
 * INVARIANTE — EL ÁRBOL DEL LAYOUT RAÍZ, SOBRE EL FUENTE.
 *
 * Corre con `npm run test:s8-diferido`. No necesita build.
 *
 * ⚠️⚠️ **Esto custodia el SITIO VIVO.** `src/app/layout.tsx` lo comparten el home
 * actual, el panel de administración, el dashboard de clientes y las landings de
 * producción. La única pregunta que este archivo contesta es: **¿sigue montando
 * exactamente lo mismo, en el mismo orden, después de tocar CÓMO se importa?**
 *
 * ── Lo que este instrumento NO puede hacer, medido y no supuesto ───────────
 *
 * Los invariantes de sección montan su árbol con `react-dom/server`. Acá **no se
 * puede**, y el bloque 1 lo mide en vivo en vez de afirmarlo de palabra: el
 * árbol se lee del FUENTE, que es lo que la instrucción manda cuando montar no
 * se puede —afirmar sobre el fuente antes que inventar un mock—.
 *
 * ── Por qué no hay ningún `dynamic()` acá, y es un RESULTADO ───────────────
 *
 * Los bloques 4 y 5 lo demuestran con dos lecturas del Next instalado:
 * `ssr: false` está PROHIBIDO en un Server Component —y `layout.tsx` lo es— y
 * `next/dynamic` SIN `ssr: false` emite `ReactDOM.preload(…, {as:'script'})`
 * para sus chunks, o sea que los deja en el HTML del primer viaje igual. En un
 * layout de servidor `next/dynamic` no saca un chunk de la carga inicial: le
 * baja la prioridad. Lo único que sí lo saca es dejar de arrastrar un grupo
 * ajeno, y eso es lo que el cambio de este frente hace.
 */

import { ARBOL_DEL_LAYOUT, CONGELADOS_DEL_LAYOUT } from '../contrato'
import { afirmar, afirmarIgual, cerrar, controlPositivo, noCorre, titulo } from '../../../../app/v3/_lib/__tests__/afirmar'
import {
  LAYOUT,
  RAIZ,
  alPedirModulo,
  archivoDelEspecificador,
  diferidosSinServidor,
  existe,
  exportacionesDe,
  huellaDe,
  leer,
  origenDeCadaImport,
  piezasMontadas,
  reexportaDesde,
  sha256,
  sinComentarios,
} from './soporte'

const fuente = leer(LAYOUT)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Montar el layout con react-dom/server NO se puede — medido, no supuesto')

const BLOQUEANTES = ['src/app/layout.tsx', 'src/app/globals.css', 'src/components/layout/SmoothScroll.tsx']
  .map((a) => `${RAIZ}/${a}`)
for (const modulo of BLOQUEANTES) {
  const que = alPedirModulo(modulo)
  afirmar(que !== 'CARGA', `\`${modulo.split('logic-core-v3').pop()}\` no carga fuera del build`, que)
}

controlPositivo(
  'el probador SÍ carga un módulo que existe y es JavaScript',
  'react-dom/server',
  (m: string) => alPedirModulo(m) !== 'CARGA',
)

/**
 * ⚠ **Una afirmación de la primera versión de este bloque estaba MAL y se
 * REEMPLAZA, no se afloja.** Decía que `next/font/google` «no carga»: la había
 * medido desde un directorio fuera del proyecto, donde ni siquiera resolvía el
 * paquete. Desde acá SÍ carga, y lo que pasa es más preciso: **carga vacío** —
 * los generadores los inyecta el loader del build. La conclusión no cambia; la
 * razón, sí, y es la que vale.
 */
afirmar(
  !exportacionesDe('next/font/google').includes('Chivo'),
  '`next/font/google` carga pero llega VACÍO: sus generadores los inyecta el loader del build',
  `exporta ${exportacionesDe('next/font/google').length} nombres`,
)

controlPositivo(
  'el mismo lector SÍ ve exportaciones en un módulo que las tiene',
  'react-dom/server',
  (m: string) => exportacionesDe(m).length === 0,
)

noCorre(
  'comparar el MARCADO del layout antes y después con `react-dom/server`',
  'el árbol no se puede montar fuera del build: `globals.css` y `lenis.css` no son JavaScript y ' +
    '`next/font/google` llega sin sus generadores. Las cuatro mediciones están arriba. El árbol se ' +
    'afirma sobre el FUENTE en los bloques 2 y 3.',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Las TRECE piezas del inventario congelado, montadas y en orden')

const montadas = piezasMontadas(fuente)
const declaradas = ARBOL_DEL_LAYOUT.map((p) => p.nombre)

afirmarIgual(montadas.length, 13, 'el árbol monta trece piezas')
afirmarIgual(montadas, declaradas, 'y son las del inventario congelado, en el mismo orden')

/** Las tres apariciones de la compuerta de runtime no se colapsaron en una. */
afirmarIgual(
  montadas.filter((n) => n === 'PublicOnlyComponents').length,
  3,
  '`PublicOnlyComponents` sigue apareciendo TRES veces: son tres envoltorios distintos',
)
afirmarIgual(montadas.indexOf('children'), declaradas.indexOf('children'), 'y `children` sigue en su lugar del orden')

controlPositivo(
  'el lector del árbol ve una pieza de más',
  '<html><body><PreloaderProvider><Shutter /><Intruso /></PreloaderProvider></body></html>',
  (f: string) => piezasMontadas(f).length === 2,
)
controlPositivo(
  'y NO cuenta una pieza que sólo se nombra en un comentario',
  '<html><body>{/* acá vivía <CustomCursor /> */}<Shutter /></body></html>',
  (f: string) => piezasMontadas(f).includes('CustomCursor'),
)
controlPositivo(
  'ni confunde una etiqueta de cierre con un montaje',
  '<html><body><Shutter></Shutter></body></html>',
  (f: string) => piezasMontadas(f).length !== 1,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Cada pieza viene del módulo que el inventario declara')

const origen = origenDeCadaImport(fuente)

/**
 * ⚠️ **LA ÚNICA DESVIACIÓN DEL INVENTARIO, Y ES DELIBERADA.**
 *
 * `ARBOL_DEL_LAYOUT` declara para `HomeIntroBoot` el módulo
 * `@/components/layout/HomeIntro`, y su propio comentario dice qué es ese campo:
 * *«de dónde se importa HOY, tal cual está escrito en `layout.tsx`»* — la línea
 * de base, no una regla. Este frente la movió a propósito: ahí estaba el peso.
 *
 * La afirmación NO se afloja: se REEMPLAZA por una más fuerte. En vez de
 * comparar dos cadenas se prueba la IDENTIDAD de la pieza siguiendo la cadena de
 * re-export en el disco. Si mañana alguien apunta el import a otra función que
 * se llame igual, esto falla; comparar cadenas tampoco lo habría visto.
 * El porqué y la cifra están escritos arriba del import, en `layout.tsx`.
 */
const DESVIACION = { pieza: 'HomeIntroBoot', declarado: '@/components/layout/HomeIntro' }

let desviaciones = 0
for (const pieza of ARBOL_DEL_LAYOUT) {
  if (pieza.naturaleza === 'envoltorio' && pieza.nombre === 'children') continue
  const escrito = origen[pieza.nombre]
  afirmar(escrito !== undefined, `\`${pieza.nombre}\` se importa en el layout`, escrito ?? '(no está)')
  if (escrito === undefined) continue
  if (escrito === pieza.modulo) continue
  desviaciones += 1
  afirmarIgual(
    { pieza: pieza.nombre, declarado: pieza.modulo },
    DESVIACION,
    'la única pieza que cambió de especificador es la declarada arriba',
  )
  const barril = archivoDelEspecificador(pieza.modulo, LAYOUT)
  const ahora = archivoDelEspecificador(escrito, LAYOUT)
  afirmar(barril !== null && ahora !== null, `  los dos especificadores resuelven a un archivo`, `${barril} · ${ahora}`)
  afirmar(
    barril !== null && reexportaDesde(barril, pieza.nombre) === ahora,
    `  y \`${pieza.modulo}\` re-exporta \`${pieza.nombre}\` desde \`${escrito}\`: es LA MISMA pieza`,
    String(barril !== null ? reexportaDesde(barril, pieza.nombre) : null),
  )
}
afirmarIgual(desviaciones, 1, 'hay exactamente UNA desviación del inventario, y es la declarada')

controlPositivo(
  'el seguidor de re-export no encuentra un binding que el barril no re-exporta',
  'PiezaQueNadieReexporta',
  (b: string) => reexportaDesde('src/components/layout/HomeIntro.tsx', b) !== null,
)
controlPositivo(
  'y el resolutor no inventa un archivo que no existe',
  '@/components/layout/ModuloInventado',
  (e: string) => archivoDelEspecificador(e, LAYOUT) !== null,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Ningún `ssr: false` sobre un envoltorio — y en el layout no puede haberlo')

const conSsrFalso = diferidosSinServidor(fuente)
const envoltorios = new Set(
  ARBOL_DEL_LAYOUT.filter((p) => p.naturaleza !== 'hoja').map((p) => p.nombre),
)
afirmarIgual(
  conSsrFalso.filter((n) => envoltorios.has(n)),
  [],
  'ningún envoltorio ni pieza del `<head>` se pidió con `ssr: false`',
)
afirmarIgual(conSsrFalso, [], '  y de hecho no hay un solo `ssr: false` en el layout')

/**
 * La razón estructural, y es la que cierra el frente: `layout.tsx` es un Server
 * Component —no lleva `'use client'`— y el compilador instalado PROHÍBE
 * `ssr: false` ahí (la cadena del error vive en el binario de SWC de esta
 * instalación; está transcripta en el reporte del frente).
 */
afirmar(!/^\s*['"]use client['"]/m.test(fuente), '`layout.tsx` es un Server Component: no lleva `use client`')

controlPositivo(
  'el detector de `ssr: false` lo ve cuando está',
  "const X = dynamic(() => import('./A'), { ssr: false })",
  (f: string) => diferidosSinServidor(f).length === 0,
)
controlPositivo(
  'y NO se lo atribuye a la llamada de al lado',
  "const Y = dynamic(() => import('./B'))\nconst Z = dynamic(() => import('./C'), { ssr: false })",
  (f: string) => diferidosSinServidor(f).includes('Y'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · `next/dynamic` SIN `ssr:false` no saca el chunk del primer viaje')

/**
 * La instrucción del sprint lo planteó como pregunta empírica. Se contesta
 * leyendo el Next instalado, que es donde está la respuesta: cuando `ssr` es
 * verdadero, `loadable` renderiza `<PreloadChunks>` del lado del servidor, y
 * `PreloadChunks` llama `ReactDOM.preload(href, { as: 'script' })` por cada
 * chunk. O sea que el chunk viaja en el HTML igual, como `<link rel=preload>`.
 */
const LOADABLE = 'node_modules/next/dist/shared/lib/lazy-dynamic/loadable.js'
const PRECARGA = 'node_modules/next/dist/shared/lib/lazy-dynamic/preload-chunks.js'
for (const [archivo, aguja, que] of [
  [LOADABLE, 'PreloadChunks', '`loadable` renderiza `PreloadChunks` en el servidor'],
  [PRECARGA, "as: 'script'", '`PreloadChunks` precarga cada chunk como script'],
  [PRECARGA, 'preload', '  con `ReactDOM.preload`, o sea en el HTML del primer viaje'],
] as const) {
  afirmar(existe(archivo) && leer(archivo).includes(aguja), que, archivo)
}

controlPositivo(
  'el buscador no encuentra una cadena que no está en ese archivo',
  'esta-cadena-no-existe-en-el-next-instalado',
  (a: string) => leer(PRECARGA).includes(a),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Los archivos CONGELADOS no se tocaron en este sprint')

/**
 * Se lee del DISCO y no de `git` (regla 12: un check contra `git` mide el
 * momento del sprint y vence al commitear).
 *
 * ⚠ **LA PRIMERA VERSIÓN DE ESTE BLOQUE COMPARABA `mtime` CONTRA LA FECHA DEL
 * ENCHUFE DE LA FASE 0, Y SE ROMPIÓ SOLA EN LA FASE 2.** El agente principal
 * volvió a editar ese enchufe durante la integración, la vara se movió al
 * presente y el contrapeso —«el detector SÍ ve la escritura de `layout.tsx`»—
 * quedó en rojo sin que ningún congelado se hubiera tocado. Era el defecto de
 * forma de la regla 12 con otra cara: **medía el momento, no el código**, y
 * encima con una vara móvil.
 *
 * No se aflojó (regla 8): se REEMPLAZÓ por la propiedad que se quería afirmar,
 * que es del CONTENIDO. Las huellas están declaradas en el contrato, con `\r`
 * normalizado para que un `core.autocrlf` distinto no las mueva.
 */
for (const [congelado, huella] of Object.entries(CONGELADOS_DEL_LAYOUT)) {
  afirmar(existe(congelado), `\`${congelado}\` está en disco`)
  afirmar(huellaDe(congelado) === huella, `  y su contenido es byte a byte el declarado`, huella.slice(0, 12))
}

controlPositivo(
  'el hasher ve un archivo al que le cambió UN carácter',
  'src/context/PreloaderContext.tsx',
  (a: string) => sha256(`${leer(a)} `) === CONGELADOS_DEL_LAYOUT[a],
)
controlPositivo(
  'y no le pone la huella de un congelado a otro archivo',
  'src/components/layout/Navbar.tsx',
  (a: string) => Object.values(CONGELADOS_DEL_LAYOUT).includes(huellaDe(a) ?? ''),
)

/** Y lo que la huella NO puede probar, dicho en vez de escondido. */
noCorre(
  'que ningún BYTE de los congelados cambió alguna vez',
  'la huella se tomó DURANTE el sprint, así que prueba que el archivo no cambió DESDE ENTONCES. ' +
    'Para lo otro hace falta una registrada antes, y el repo no la tiene.',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · El layout no ganó ni perdió importaciones de producto')

const especificadores = new Set(Object.values(origen))
afirmar(especificadores.has('sonner'), 'sonner sigue siendo un import estático del layout')
afirmar(
  Object.keys(origen).length === 12,
  'el layout importa doce bindings de valor: las diez piezas distintas más las dos fuentes',
  Object.keys(origen).join(' · '),
)
afirmar(
  !sinComentarios(fuente).includes('next/dynamic'),
  'y no apareció ningún `next/dynamic` en el layout raíz',
)

cerrar('s8-diferido.invariant')
