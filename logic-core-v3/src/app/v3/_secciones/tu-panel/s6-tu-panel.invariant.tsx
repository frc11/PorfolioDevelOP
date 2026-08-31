/**
 * INVARIANTE — SECCIÓN 06 · TU PANEL.
 *
 * Renderiza la sección REAL a HTML en sus dos ramas —`anima={false}` y
 * `anima={true}`— y afirma sobre el marcado que sale, no sobre el código que lo
 * escribe. Es lo que convierte "abajo de 1025 se lee entera" en una afirmación y
 * no en una intención.
 *
 * Los detectores viven ACÁ y no en un archivo de al lado porque sus controles
 * positivos son, por definición, lo que este lane no puede escribir: la frase con
 * las cifras fabricadas, un color a mano, un píxel suelto, un `outline-none`.
 * `codigoDeLaSeccion()` excluye los `*.invariant.*`, así que puestos acá el arnés
 * no se escanea a sí mismo — la misma excepción declarada que S3 y
 * `_invariantes/soporte.ts` ya dejaron escrita.
 *
 * Cada detector corre además contra una entrada rota, y cada conteo se imprime:
 * al lado de cada cero está cuántos caracteres, archivos o elementos se miraron.
 */

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import {
  apagadosDeFoco,
  arbitrariosSinVar,
  funcionesDeColorEncontradas,
  hexEncontrados,
  literalesConUnidad,
  quitarComentarios,
} from '../../_lib/__tests__/s3-escaneo'
import { sizesPorColumnas } from '../../_lib/imagen'
import { ATRIBUTO_PIEZAS, ATRIBUTO_TEXTO_ACCESIBLE } from '../../_lib/motion/lineas'
import { CLASE_PESO } from '../../_lib/tipografia'
import { escanearContenido, marcadoresEn, preciosEncontrados, textoVisible } from '../_contrato/escaneo'
import { pantallasDe, seccionDe } from '../_contrato/forma'
import { marcar } from '../_invariantes/render'
import { clasesEscritas, codigoDeLaSeccion, leer } from '../_invariantes/soporte'
import {
  CONTENIDO_PROHIBIDO_DE_CONTROL,
  aperturasDe,
  clasesIguales,
  clasesTipograficasPerdidas,
  cuentaDe,
  focalizablesDe,
  patronesNombrados,
  sinAriaHidden,
  textoAccesible,
  valorDe,
} from './deteccion'
import {
  BLOQUES,
  CAPACIDADES,
  CAPTURA,
  COLUMNAS_DE_LA_CAPTURA,
  COLUMNAS_DE_LA_GRILLA,
  ID,
  PANTALLAS_DE_LA_SECCION,
  ALTO_DE_LA_CAPTURA,
  ANCHO_DE_LA_CAPTURA,
  TITULAR,
  TITULO_DE_CAPACIDADES,
} from './contenido'
import { PIEZAS_POR_PATRON, TuPanel } from './TuPanel'

// ── Las dos ramas, renderizadas una sola vez ───────────────────────────────

const montada = <TuPanel seccion={seccionDe(ID)} />
const QUIETO = marcar(montada, { anima: false })
const ANIMADO = marcar(montada, { anima: true })

const ARCHIVOS = codigoDeLaSeccion(ID)
const CODIGO = ARCHIVOS.map((a) => leer(a)).join('\n')
const PIEZAS_ANIMADAS = PIEZAS_POR_PATRON.P2 + PIEZAS_POR_PATRON.P4

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Abajo de 1025 no se monta coreografía — y el texto está entero')

console.log(`  marcado: ${QUIETO.length} caracteres sin coreografía · ${ANIMADO.length} con ella`)
afirmarIgual(cuentaDe(QUIETO, /transform:/g), 0, 'sin coreografía no se escribe una sola transformada')
afirmarIgual(cuentaDe(QUIETO, /will-change/g), 0, '  ni se promueve una capa de composición')
afirmar(!QUIETO.includes(ATRIBUTO_PIEZAS), '  ni corre el divisor de líneas: el titular es un texto, no piezas')
afirmarIgual(cuentaDe(QUIETO, /style="/g), 2, 'los dos únicos estilos inline vienen del DATO: el `min-height` de la tabla y la relación de aspecto del hueco')

const TEXTOS = [TITULAR, TITULO_DE_CAPACIDADES, ...BLOQUES.map((b) => b.texto), ...CAPACIDADES]
afirmarIgual(TEXTOS.filter((t) => !textoVisible(QUIETO).includes(t)), [], `los ${TEXTOS.length} textos de la sección están enteros sin una sola animación`)

titulo('1b · CONTROL POSITIVO — con coreografía esas mismas cosas SÍ aparecen')

afirmarIgual(cuentaDe(ANIMADO, /transform:/g), PIEZAS_ANIMADAS, `${PIEZAS_ANIMADAS} piezas escriben transformada: ${PIEZAS_POR_PATRON.P2} de P2 + ${PIEZAS_POR_PATRON.P4} de P4`)
afirmarIgual(cuentaDe(ANIMADO, /will-change-transform/g), PIEZAS_ANIMADAS, '  y las mismas promueven su capa de composición')
afirmar(ANIMADO.includes(ATRIBUTO_PIEZAS), '  y el divisor de líneas SÍ se monta sobre el titular')
afirmar(ANIMADO.includes(ATRIBUTO_TEXTO_ACCESIBLE), '  con su copia accesible: la frase entera sobrevive al corte en líneas')
console.log('  P1 no aporta piezas en un render de servidor: el divisor está en su fase de medición — la misma lectura de R3 de reducido.invariant.')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El texto es EL MISMO en las dos ramas — la guardia contra un mobile distinto')

const textoQuieto = textoAccesible(QUIETO)
afirmar(textoQuieto === textoAccesible(ANIMADO), 'el texto accesible de las dos ramas es idéntico, carácter por carácter', `${textoQuieto.length} caracteres`)
afirmar(sinAriaHidden(QUIETO) === QUIETO, '  la rama quieta no esconde nada del árbol: no tiene un solo `aria-hidden`')
afirmar(sinAriaHidden(ANIMADO).length < ANIMADO.length, '  y la animada sí — son las piezas visuales del divisor, fuera del árbol', `${ANIMADO.length - sinAriaHidden(ANIMADO).length} caracteres podados`)

controlPositivo('el comparador ve una rama que dice algo que la otra no', { a: '<p>uno dos</p>', b: '<p>uno dos tres</p>' }, (par) => textoAccesible(par.a) === textoAccesible(par.b))
controlPositivo('y el extractor no deja pasar el texto de un subárbol aria-hidden', '<p>uno<span aria-hidden="true"><span>DOS</span></span></p>', (h) => textoAccesible(h).includes('DOS'))

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El contenido inventado PARECE inventado — cero cifras, cero precios')

const visible = textoVisible(ANIMADO)
afirmarIgual(escanearContenido(visible), [], `cero hallazgos sobre ${visible.length} caracteres de texto renderizado`)
afirmarIgual(preciosEncontrados(visible), [], '  y cero formas de precio: no están cerrados y no se inventan ni de ejemplo')
console.log(`  marcadores en pantalla: ${marcadoresEn(visible).join(' · ')}`)
afirmar(marcadoresEn(visible).length > 0, `  el contrapeso: ${marcadoresEn(visible).length} marcadores distintos — cero hallazgos no es cero contenido`)
afirmar(visible.includes('Esquina') && visible.includes('El Garage') && visible.includes('Matsu Automotores'), '  los tres nombres reales están escritos: son clientes verificables, no testimonios inventados')

controlPositivo('el escáner ve la frase prohibida', CONTENIDO_PROHIBIDO_DE_CONTROL, (t) => escanearContenido(t).length === 0)
controlPositivo('y el detector de precios ve el suyo', 'desde $99.000 por mes', (t) => preciosEncontrados(t).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Cero valores fuera de los tokens, archivo por archivo')

console.log(`  ${ARCHIVOS.length} archivos de producto, ${CODIGO.length} caracteres:`)
for (const a of ARCHIVOS) console.log(`    ${a} — ${leer(a).split('\n').length} líneas`)

for (const archivo of ARCHIVOS) {
  const fuente = quitarComentarios(leer(archivo))
  const corto = archivo.split('/').pop() ?? archivo
  afirmarIgual(hexEncontrados(fuente), [], `${corto}: cero colores escritos a mano`)
  afirmarIgual(funcionesDeColorEncontradas(fuente), [], `${corto}: cero funciones de color`)
  afirmarIgual(literalesConUnidad(fuente), [], `${corto}: cero literales con unidad`)
  afirmarIgual(arbitrariosSinVar(fuente), [], `${corto}: toda clase arbitraria consume var(--token)`)
  afirmar(leer(archivo).split('\n').length <= 300, `${corto}: no pasa las 300 líneas`)
}
afirmarIgual(cuentaDe(CODIGO, /style=\{\{/g), 0, 'ningún archivo del producto escribe un estilo inline propio — los dos que hay los ponen `Panel` y `HuecoDeMedio` desde el dato')

controlPositivo('el detector de hex no está ciego', 'color: #0E0E0E', (t) => hexEncontrados(t).length === 0)
controlPositivo('ni el de literales con unidad', 'const alto = "44px"', (t) => literalesConUnidad(t).length === 0)
controlPositivo('ni el de arbitrarios sin token', 'className="gap-[16px]"', (t) => arbitrariosSinVar(t).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4b · `cn()` no se comió ningún TAMAÑO de texto — y lo que sí se come, publicado')

for (const [rama, html] of [['sin coreografía', QUIETO], ['con coreografía', ANIMADO]] as const) {
  const perdidas = clasesTipograficasPerdidas(html)
  const familia = perdidas.filter((p) => p.falta === 'familia')
  afirmarIgual(perdidas.filter((p) => p.falta !== 'familia'), [], `${rama}: los ${cuentaDe(html, /data-nivel="/g)} elementos de texto conservan su TAMAÑO y su PESO`)
  afirmar(
    familia.every((p) => !p.clases.includes(CLASE_PESO.normal)),
    `${rama}: las ${familia.length} pérdidas de familia son todas de elementos con peso ≠ normal`,
    'es la colisión medida de twMerge, no algo que escriba esta sección',
  )
}
afirmar(cuentaDe(QUIETO, /data-nivel="/g) > 0, `  el contrapeso: hay ${cuentaDe(QUIETO, /data-nivel="/g)} elementos con \`data-nivel\` para revisar`)
console.log(
  '  HALLAZGO fuera de este lane: `Textos.tsx` y `Titular.tsx` componen `font-cuerpo` con `font-medio` en el mismo `cn()`.\n' +
    '  `font-medio` no es un peso conocido por tailwind-merge, así que lo toma como FAMILIA y borra `font-cuerpo`. Hoy es\n' +
    '  inerte —`/v3/layout.tsx` ya pone `font-cuerpo` en la raíz y la familia se hereda— pero un `font-titulo` con peso ≠\n' +
    '  normal cambiaría de tipografía en silencio. El arreglo es de `src/lib/utils.ts`, compartido con el sitio vivo.',
)

controlPositivo('el detector ve el tamaño que se comió una clase de color', '<p data-nivel="cuerpo" class="font-cuerpo leading-texto tracking-texto font-normal text-tinta-media">x</p>', (h) => clasesTipograficasPerdidas(h).length === 0)
controlPositivo('y ve el peso que desapareció', '<p data-nivel="caption" class="text-fluido-caption leading-texto tracking-texto font-codigo text-center">x</p>', (h) => !clasesTipograficasPerdidas(h).some((p) => p.falta === 'peso'))

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Foco — la sección no tiene controles, y no captura el foco')

afirmarIgual([...focalizablesDe(QUIETO), ...focalizablesDe(ANIMADO)], [], 'cero elementos focalizables en las dos ramas: esta sección informa, no actúa — el CTA vive en el cierre')
afirmarIgual(ARCHIVOS.flatMap((a) => apagadosDeFoco(quitarComentarios(leer(a)))), [], `ninguno de los ${ARCHIVOS.length} archivos apaga el anillo de foco`)
afirmarIgual([...quitarComentarios(CODIGO).matchAll(/\bhover:[a-z[]/g)].map((m) => m[0]), [], 'ninguna variante `hover:` — y por lo tanto ninguna sin su gemela de foco')

controlPositivo('el buscador de focalizables ve uno que sí está', '<a href="/x">ir</a>', (h) => focalizablesDe(h).length === 0)
controlPositivo('y no cuenta un tabindex="-1" como focalizable', '<div tabindex="-1">no tabula</div>', (h) => focalizablesDe(h).length > 0)
controlPositivo('el detector de apagados ve las tres formas', '.a{outline:none}.b{outline-width:0}.c{outline-style:none}', (t) => apagadosDeFoco(t).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El `sizes` del hueco lo COMPONE el ayudante — nadie lo escribe')

const sizesEsperado = sizesPorColumnas(COLUMNAS_DE_LA_CAPTURA, COLUMNAS_DE_LA_GRILLA)
console.log(`  sizes: ${sizesEsperado}`)
afirmarIgual(valorDe(QUIETO, 'data-sizes'), sizesEsperado, `el \`data-sizes\` del marcado es exactamente sizesPorColumnas(${COLUMNAS_DE_LA_CAPTURA}, ${COLUMNAS_DE_LA_GRILLA})`)
afirmarIgual(CAPTURA.sizes, sizesEsperado, '  y el dato de la sección sale de la misma función con los mismos argumentos')

controlPositivo('un `sizes` escrito a mano NO coincide con el compuesto', '(min-width: 1024px) 60vw, 100vw', (aMano) => aMano === sizesEsperado)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · La lista es una LISTA — `<ul>` con sus `<li>`, contados')

for (const [rama, html] of [['sin coreografía', QUIETO], ['con coreografía', ANIMADO]] as const) {
  afirmarIgual(aperturasDe(html, 'ul'), 1, `${rama}: hay exactamente un <ul>`)
  afirmarIgual(aperturasDe(html, 'li'), CAPACIDADES.length, `${rama}: y ${CAPACIDADES.length} <li>, uno por capacidad`)
}
controlPositivo('el contador ve una lista que no está', '<div><span>uno</span><span>dos</span></div>', (h) => aperturasDe(h, 'li') > 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · Los patrones que declaro son los que consumo — P1, P2 y P4')

/**
 * ⚠ CÓMO SE NOMBRA UN PATRÓN DESDE SITIO-S7: por su ID, no por el objeto.
 *
 * Antes una sección escribía `PATRONES.P2` y le pasaba el objeto medido al
 * canal. Ahora escribe `patron="P2"` y el objeto lo resuelve la implementación
 * animada — **es la condición de la compuerta**: importar `PATRONES` desde una
 * sección metía el sistema de motion entero en la carga inicial.
 *
 * O sea que el detector no cambió de intención, cambió de forma: sigue leyendo
 * qué patrones nombra la sección, en la sintaxis en que hoy los nombra.
 */
afirmarIgual(patronesNombrados(CODIGO), ['P1', 'P2', 'P4'], 'la sección nombra estos tres patrones y ningún otro')
afirmarIgual(Object.keys(PIEZAS_POR_PATRON).sort(), ['P1', 'P2', 'P4'], '  y la tabla de piezas declara los mismos tres')
console.log(`  P1 → ${PIEZAS_POR_PATRON.P1} titular · P2 → ${PIEZAS_POR_PATRON.P2} bloques (${BLOQUES.length} de texto + la captura) · P4 → ${PIEZAS_POR_PATRON.P4} ítems`)
controlPositivo('el buscador ve un patrón que no uso', 'const x = <B patron="P5" />', (c) => patronesNombrados(c).length === 0)
controlPositivo('y no se come lo que dice un comentario', '/* acá menciono patron="P7" */', (c) => patronesNombrados(c).length > 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · La relación de aspecto va en `style`, y la razón está escrita al lado')

afirmar(/style="[^"]*aspect-ratio:/.test(QUIETO), 'el hueco declara su relación de aspecto en estilo inline')
afirmarIgual(
  valorDe(QUIETO, 'data-relacion'),
  `${ANCHO_DE_LA_CAPTURA} / ${ALTO_DE_LA_CAPTURA}`,
  '  con el valor que viene del dato',
)
afirmarIgual(clasesEscritas(QUIETO).filter((c) => c.startsWith('aspect-')), [], '  y ninguna clase de aspecto: una clase armada no la ve el escáner de Tailwind y su regla no se emitiría nunca')
const archivoDelDato = ARCHIVOS.find((a) => a.endsWith('contenido.ts')) ?? ''
afirmar(leer(archivoDelDato).includes('escáner de Tailwind'), '  la razón está escrita en el mismo archivo donde se declara el valor', archivoDelDato)
controlPositivo('el detector ve una clase de aspecto', '<div class="aspect-[16/9]"></div>', (h) => clasesEscritas(h).filter((c) => c.startsWith('aspect-')).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · Cuántas pantallas ocupa — la tabla y el marcado dicen lo mismo')

afirmarIgual(clasesIguales(QUIETO, 'min-h-svh'), PANTALLAS_DE_LA_SECCION, `la sección declara ${PANTALLAS_DE_LA_SECCION} tiempos de una pantalla cada uno, en el marcado`)
const seccion = seccionDe(ID)
console.log(`  la tabla declara alto ${seccion.alto} → ${pantallasDe(seccion)} pantalla(s) · pinneada: ${seccion.pinneada ?? 'no'}`)

/**
 * ⚠ ESTO ERA UN PEDIDO Y AHORA ES UNA AFIRMACIÓN.
 *
 * Este sprint no podía tocar la tabla del recorrido —era del otro lane— así que
 * publicaba el delta: la tabla decía `100svh` para una sección de dos tiempos.
 * SITIO-S7 corrigió la tabla, y con eso la comprobación sube de nivel: los dos
 * tiempos del marcado y el alto declarado **tienen que decir lo mismo**.
 */
afirmarIgual(
  pantallasDe(seccion),
  PANTALLAS_DE_LA_SECCION,
  'el alto de la tabla coincide con los tiempos que la sección construye',
)
afirmar(seccion.pinneada === undefined, 'esta sección NO va pinneada: la única secuencia del sprint es Servicios')
afirmarIgual(/<section id="([^"]*)"/.exec(QUIETO)?.[1], ID, '  la `<section>` sale con el id de la tabla')
afirmarIgual(valorDe(QUIETO, 'data-superficie'), seccion.superficie, '  y su superficie sale de la tabla del sitio: la sección no pinta un solo color')
controlPositivo('el contador de tiempos ve un marcado con menos pantallas de las declaradas', '<div class="flex min-h-svh flex-col"></div>', (h) => clasesIguales(h, 'min-h-svh') === PANTALLAS_DE_LA_SECCION)

cerrar('s6-tu-panel.invariant')
