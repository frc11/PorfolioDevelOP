/**
 * INVARIANTE — LOS EXTRACTORES DEL BANCO: que VEAN, y que no inventen.
 *
 * Corre con `npm run test:s10-lectura`.
 *
 * Sale de `s10-banco.invariant.ts` cuando ese archivo cruzó las 300 líneas, y la
 * costura es la misma que tiene el fuente: **`s10-banco.ts` renderiza y declara;
 * `s10-recorrido.ts` y `s10-lectura.ts` leen.** Acá se prueba lo segundo.
 *
 * ── Por qué cada extractor se corre contra un marcado ROTO ─────────────────
 *
 * Porque un extractor ciego no produce un error: produce una tabla **vacía que
 * se lee como un resultado limpio** —«cero saltos de encabezado», «cero paradas
 * fuera de orden»— y es exactamente el modo de falla que este repo viene cazando
 * desde S10 de la escena. Los cuatro frentes de SITIO-S10 publicaron cifras que
 * salen de acá; si un detector no ve, todas mienten a la vez.
 *
 * ── Tres de estas comprobaciones son ARREGLOS que los frentes encontraron ──
 *
 * El banco no salió bien de la Fase 0, y las tres correcciones están marcadas en
 * su lugar: `landmarks()` contaba `role="img"`, `cajasDeTexto` no veía el
 * titular del Hero, y el helper de movimiento reducido modelaba un estado que
 * producción no sirve. **Que los encontraran los consumidores y no el autor es
 * el argumento entero a favor de escribir el banco antes de despachar**: sin él
 * cada frente habría escrito su propio extractor y nadie habría podido comparar
 * un error contra otro.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { marcadoDeSeccion, marcadoDelDocumento } from './s10-banco'
import {
  cajasDeTexto,
  candidatosALandmark,
  encabezados,
  esRolDeLandmark,
  landmarks,
  paradasDeTabulacion,
  saltosDeNivel,
  tabindexPositivos,
} from './s10-lectura'
import { nodosDe, textoDe, type Nodo } from './s10-recorrido'
import { NIVELES_TIPOGRAFICOS } from '../tipografia'

const DOC = marcadoDelDocumento('quieta')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El recorrido del marcado cuenta anidamiento, y los extractores VEN')

const nodos = nodosDe(DOC)
afirmar(nodos.length > 400, `el recorrido ve ${nodos.length} elementos en el documento`)
afirmar(
  nodos.some((n: Nodo) => n.ancestros.includes('main')),
  'y la cadena de ancestros llega: hay elementos adentro del `<main>`',
)
afirmar(
  nodos.some((n: Nodo) => n.ocultoALectores) && nodos.some((n: Nodo) => !n.ocultoALectores),
  'el detector de `aria-hidden` distingue los dos lados',
  `${nodos.filter((n: Nodo) => n.ocultoALectores).length} ocultos de ${nodos.length}`,
)
controlPositivo(
  'el recorrido NO se come el cierre de dos `span` anidados —el defecto que `marcado.ts` ya pagó',
  '<span aria-hidden="true"><span>a</span></span><p>visible</p>',
  (html: string) => nodosDe(html).filter((n: Nodo) => n.etiqueta === 'p')[0].ocultoALectores,
)
afirmarIgual(
  textoDe('<p>hola <b>mundo</b></p>', nodosDe('<p>hola <b>mundo</b></p>')[0]),
  'hola mundo',
  'el texto de un subárbol sale sin etiquetas y con espacios normalizados',
)
controlPositivo('el lector de texto no pega dos palabras al sacar una etiqueta', '<p>a<b>b</b></p>', (html: string) =>
  textoDe(html, nodosDe(html)[0]) === 'ab',
)

const arbol = encabezados(DOC)
afirmar(arbol.length > 8, `el árbol de encabezados tiene ${arbol.length} entradas`)
controlPositivo('el detector de saltos ve un h2 → h4', [{ nivel: 2, texto: 'a', seccion: null, ocultoALectores: false, indice: 0 }, { nivel: 4, texto: 'b', seccion: null, ocultoALectores: false, indice: 1 }], (a: Parameters<typeof saltosDeNivel>[0]) => saltosDeNivel(a).length === 0)

const paradas = paradasDeTabulacion(DOC)
afirmar(paradas.length > 5, `el orden de tabulación tiene ${paradas.length} paradas`)
controlPositivo('el contador no cuenta un `<a>` sin href', '<a>x</a>', (h: string) => paradasDeTabulacion(h).length > 0)
controlPositivo('ni un control `disabled`', '<button disabled="">x</button>', (h: string) => paradasDeTabulacion(h).length > 0)
controlPositivo('ni un `tabindex="-1"`', '<div tabindex="-1">x</div>', (h: string) => paradasDeTabulacion(h).length > 0)
afirmar(paradasDeTabulacion('<a href="#a">x</a>').length === 1, '  y sí cuenta un `<a href>`: no está ciego')
controlPositivo('el detector de `tabindex` positivo ve uno', '<div tabindex="3">x</div>', (h: string) => tabindexPositivos(h).length === 0)

const cajas = cajasDeTexto(DOC)
afirmar(cajas.length > 50, `el banco ve ${cajas.length} cajas de texto con su nivel`)
afirmar(
  cajas.every((c) => c.nivel in NIVELES_TIPOGRAFICOS),
  'y las ocho niveles que declaran son los del sistema: ninguno inventado',
  [...new Set(cajas.map((c) => c.nivel))].sort().join(' · '),
)
/**
 * ⚠ **LAS DOS VÍAS SON UN ARREGLO DE LA INTEGRACIÓN, Y LO ENCONTRÓ EL FRENTE DEL
 * LOGO.** El titular del Hero sale por `TextoPorLineas`, que NO emite
 * `data-nivel`: el extractor no veía la caja más grande de la sección más
 * importante y devolvía una lista que se leía completa.
 */
const porAtributo = cajas.filter((c) => c.via === 'atributo')
const porClase = cajas.filter((c) => c.via === 'clase')
afirmar(porAtributo.length > 0 && porClase.length > 0, `  y por las DOS vías: ${porAtributo.length} por \`data-nivel\` y ${porClase.length} deducidas de la utilidad de tamaño`)
afirmar(
  cajasDeTexto(marcadoDeSeccion('hero', 'quieta')).some((c) => c.nodo.etiqueta === 'h1'),
  '  y el titular del Hero —que sale por `TextoPorLineas`, sin `data-nivel`— YA se ve',
)
afirmarIgual(
  cajasDeTexto('<h1 data-texto-por-lineas="entero" class="text-fluido-titulo-xl leading-titulo">x</h1>').map((c) => `${c.nivel}:${c.via}`),
  ['titulo-xl:clase'],
  '  y un titular con la forma exacta de `TextoPorLineas` se lee con su nivel deducido',
)
controlPositivo('el lector de cajas no ve ninguna donde no hay ni `data-nivel` ni utilidad de tamaño', '<p class="uppercase">y</p>', (h: string) => cajasDeTexto(h).length > 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Los landmarks tienen ALCANCE: un `<footer>` no siempre es uno')

const candidatos = candidatosALandmark(DOC)
const reales = landmarks(DOC)
afirmar(reales.length > 0 && reales.length < candidatos.length, `${reales.length} landmarks de ${candidatos.length} candidatos: el alcance descarta`)
afirmar(
  reales.some((l) => l.rol === 'main'),
  'el `<main>` del layout aporta su landmark',
)
controlPositivo(
  'el detector NO cuenta como `contentinfo` el `<footer>` de un `<blockquote>`',
  '<blockquote><footer>x</footer></blockquote>',
  (h: string) => landmarks(h).some((l) => l.rol === 'contentinfo'),
)
afirmar(
  landmarks('<footer>x</footer>').some((l) => l.rol === 'contentinfo'),
  '  y sí lo cuenta cuando está en la raíz: el detector no está ciego',
)
controlPositivo(
  'ni cuenta como `form` un `<form>` sin nombre accesible',
  '<form><input/></form>',
  (h: string) => landmarks(h).some((l) => l.rol === 'form'),
)
/**
 * ⚠ **Y EL FILTRO DE ROLES ES UN ARREGLO DE LA INTEGRACIÓN, DEL FRENTE DE
 * ACCESIBILIDAD.** `landmarks()` filtraba por «tiene rol» y contaba los cuatro
 * `<figure role="img">` del home: publicaba 6 landmarks donde hay 2.
 */
afirmar(
  reales.every((l) => esRolDeLandmark(l.rol)),
  'todos los landmarks publicados tienen un rol de la lista de ARIA, no un rol cualquiera',
  reales.map((l) => l.rol).join(' · '),
)
controlPositivo(
  'el filtro NO cuenta un `role="img"` como landmark',
  '<figure role="img" aria-label="x"></figure>',
  (h: string) => landmarks(h).length > 0,
)
afirmar(
  landmarks('<div role="search"></div>').length === 1,
  '  y sí cuenta un `role="search"`, que sí es de landmark: el filtro no está ciego',
)
afirmar(
  landmarks('<form aria-label="x"><input/></form>').some((l) => l.rol === 'form'),
  '  y sí con nombre: tampoco está ciego de este lado',
)

// ═══════════════════════════════════════════════════════════════════════════

cerrar('s10-lectura.invariant')
