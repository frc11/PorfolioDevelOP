/**
 * INVARIANTE — ACCESIBILIDAD SOBRE EL HOME COMPUESTO. Las ocho juntas, por
 * primera vez.
 *
 * Corre con `npx tsx src/app/v3/_lib/__tests__/s10-acceso.invariant.ts`.
 *
 * ── Por qué esto no lo cubría ningún invariante anterior ───────────────────
 *
 * Cada sección verificó LO SUYO, y ocho verificaciones locales correctas no
 * suman una del documento: el árbol de encabezados es una propiedad del
 * documento, el orden de tabulación también, y un `text-tinta-tenue` que pasaba
 * AA donde se escribió fallaba montado en la sección invertida. Este archivo
 * recorre el documento entero.
 *
 * ── ⚠ REGLAS 10 Y 11 — ESTO ES CÁLCULO ESTÁTICO ───────────────────────────
 *
 * No hay navegador. Todo sale de `marcadoDelDocumento`, que es el marcado del
 * SERVIDOR, y del tema leído como texto. Un modelo no es una medición: cada
 * cifra dice de qué instrumento salió, y lo que ningún cálculo estático puede
 * contestar está enumerado en `HUECOS` del banco y no se estima.
 *
 * ── ⚠ REGLA 13 — SE AFIRMA LO PROPIO, SE PUBLICA LO HEREDADO ──────────────
 *
 * Los defectos que el sprint decide no arreglar no van en rojo: van publicados,
 * con su gravedad y su dueño. Lo que sí se afirma es que **el inventario es
 * EXACTAMENTE el que se publica** — si aparece uno nuevo, esto se pone en rojo.
 *
 * ⚠️ **SITIO-S11 lo partió.** Dar vuelta el censo lo llevó arriba de las 300
 * líneas del repo, así que §5 (los landmarks) vive en `./s10-acceso-landmarks`.
 * El corte es por tema, no por tamaño. El contraste de texto y del anillo de
 * foco contra la escena era composición y se desarmó (Modo pulido).
 *
 * ⚠️ **B7 lo partió otra vez, por lo mismo.** Arreglar el punto ciego del censo
 * de marcadores volvió a cruzar las 300 líneas, así que §7 —y los dos controles
 * de §1 que la habilitan— viven en `./s10-acceso-censo`. Van juntas a propósito:
 * el censo y la prueba de que su detector no está ciego son una sola pieza.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ALTOS, HUECOS, RAMAS, SUPUESTOS_DEL_BANCO, marcadoConMovimientoReducido, marcadoDelDocumento } from './s10-banco'
import { candidatosALandmark, encabezados, paradasDeTabulacion, saltosDeNivel, tabindexPositivos } from './s10-lectura'
import { atributo, nodosDe } from './s10-recorrido'
import {
  ROTOS, documentoAnunciado, esRepeticionExacta, esRolDeLandmark, piezasDelDivisor,
  rotuloDeParada, textoAnunciado, transformadasDe, willChangeDe,
} from './s10-acceso'
import { DELTA_DEL_PANEL, DELTA_DEL_PORTFOLIO, DELTA_DE_SERVICIOS_B4, afirmarElCenso, afirmarQueElCensoNoEstaCiego } from './s10-acceso-censo'
import { COLOR, razon } from './s10-acceso-color'
import {
  imprimirArbol, imprimirInventario, imprimirParadas, publicados, publicar,
 afirmarElInventario } from './s10-acceso-tablas'
import { afirmarLosLandmarks } from './s10-acceso-landmarks'
import { deberiaAnimar } from '../../_secciones/_contrato/motion'
import { DESCUENTO_NACIMIENTO_PX } from '../navegacion'
import { CATALOGO_DE_DEMOS } from '../../_secciones/trabajos/demos/catalogo'
import { RESENAS } from '../../_secciones/por-que-develop/resenas/contenido'
import { PREGUNTAS_DEL_HOME } from '../../_secciones/cierre/faq'
import { PAGINAS_DEL_PIE, PAGINAS_LEGALES } from '../../_secciones/cierre/contacto'

/**
 * SPRINT DEMOS · lo que suman las demos de Trabajos: una parada por demo y el `h3` de su título.
 * MÓVIL-TRABAJOS · y otra parada por demo en el carrusel de abajo de 1024 (el censo lee el marcado,
 * donde las dos están; en el navegador una de las dos va en `display: none`).
 */
// MÓVIL 2: el carrusel lleva en el marcado sus ocho de arriba y las cuatro de abajo; cada ancho muestra ocho.
// MÓVIL 2: el CTA al terminar cada servicio (se ve abajo de 1024; en el marcado, en las dos ramas).
// [B4] Reemplazada por la spec: la sección nueva lleva el CTA de cada servicio (su página) y el recomendador (nueve opciones y su botón).
// [C2-51] Reemplazada por la spec: el recomendador va por etapas; el marcado publica la primera (cinco opciones y «Siguiente»).
// [INT] Reemplazada por la spec de L3: el CTA de cada servicio se fue y cada uno pone dos paradas, su título y «Leer más…» (el video lleva
// a la página pero no entra al Tab). L3 no corrió esta suite.
const DELTA_DE_SERVICIOS = { paradas: 3 * 2 + 5 + 1 } as const
// SPRINT FINAL: «Por qué develOP» suma el botón «Hablanos» y pasa de 1 h2 + 4 h3 a 1 h2 + 6 h3; sus cinco marcadores se fueron con el contenido viejo.
// FINAL 3 · el pie con datos reales: −1 (Números) +1 mail +1 WhatsApp +4 redes.
const DELTA_DEL_FINAL = { paradas: 1 + 5, encabezados: 2 } as const
/** CONTACTO · + «Hablemos» al lado del CTA del hero, que abre el formulario. */
const DELTA_DEL_CONTACTO = { paradas: 1 } as const
// [CIERRE A] A5 · con cinco demos el renglón de abajo del carrusel es decoración (las cinco ya son paradas arriba): una por demo en el
// estante o la cinta y una en el carrusel. [NOCTURNO B5] Reemplazada por la spec: abajo de 1024 las demos van en el carrusel común de
// B1.2e, que se monta en el cliente (como el del Portfolio): en el marcado servido queda una por demo, en el estante o la cinta.
const DELTA_DE_DEMOS = { paradas: CATALOGO_DE_DEMOS.length, encabezados: 1 } as const
// [Cierre de INTERFAZ 2] + la pausa del panel en vivo de Tu panel (se mueve solo más de cinco segundos: WCAG 2.2.2), en las dos ramas.
const DELTA_DE_LA_VIDA = { paradas: 1 } as const
// [NAVBAR] T1 · «Panel» es un ítem nuevo de la barra (lleva a Tu panel): una parada más, en las dos ramas.
const DELTA_DEL_NAVBAR = { paradas: 1 } as const
/** [RETOQUE 3D] 3I · el contacto del pie es un formulario: + nombre, mail, mensaje y el mail del aviso; − WhatsApp y «Hablanos». */
const DELTA_DEL_RETOQUE = { paradas: 4 - 2 + 1 } as const // N1: + «Login» en la esquina de la barra
// [RETOQUE PANEL] T1: las 8 features dejan de ser botones (su demo llega con sus controles, en el navegador, al acercarse) y se fue
// la pausa del panel en vivo; el título de cada feature pasa a ser un `h3`.
const DELTA_DEL_RETOQUE_PANEL = { paradas: -(8 + 1), encabezados: 8 } as const
/** [RONDA 2] F1 · + WhatsApp (volvió al pie), + el envío del pie y el del newsletter (ya envían: habilitados), − el mail del aviso. */
const DELTA_DE_LA_RONDA2 = { paradas: 1 + 2 - 1 } as const
// [PULIDO 10] J8 · + Demos en el recorrido del pie (un destino nuevo, adentro de Trabajos).
const DELTA_DEL_PULIDO_10 = { paradas: 1 } as const
// [B12a.8 · T0] «Home» primero en la barra (+1, CONTRATO §Navegación) y «Servicios» pasa de botón a enlace a su sección con la flechita
// de la lista al lado (+1: el enlace y el botón). Las dos ramas.
const DELTA_DE_B12A8 = { paradas: 1 + 1 } as const
// [NOCTURNO B2] Las reseñas para el lector y el teclado (`ResenasParaElLector`, iguales en las dos ramas): un enlace por reseña (aparece
// con el foco) y su `h3`. Las tarjetas que se ven (el aro, el carrusel plano) son del puntero: `aria-hidden` y fuera del orden del teclado.
const DELTA_DE_LAS_RESENAS = { paradas: RESENAS.length, encabezados: 1 } as const
// [B6] La sección nueva del Panel: + «Probar el panel» (un botón que todavía no hace nada); los encabezados pasan de 10 (el h2,
// los 8 títulos de las features y el del newsletter) a 5 (el h2 que se pinta, los 3 títulos de los módulos y el titular del CTA;
// el del newsletter va como rótulo del formulario).
const DELTA_DEL_PANEL_B6 = { paradas: 1, encabezados: 5 - 10 } as const
// [B10] El FAQ después del pie (`FaqDelPie`, igual en las dos ramas: el servidor lo sirve cerrado en la pantalla del pie): una parada por
// pregunta (son botones: se recorren con el teclado) y su título. El WhatsApp aparece recién con la primera respuesta (no está en lo servido).
const DELTA_DEL_FAQ = { paradas: PREGUNTAS_DEL_HOME.length, encabezados: 1 } as const
// [C2 · 60c] El CTA del Panel rehecho: el form de las novedades suma «Nombre» (una parada; «Probar ahora» reemplaza a «Probar el
// panel») y las dos columnas llevan su subtítulo como `h4` («Probar el panel» y «Suscribite a las novedades»), iguales en las dos ramas.
const DELTA_DEL_CTA_DEL_PANEL = { paradas: 1, encabezados: 2 } as const
// [L7-INT] Reemplazada por la spec de L7d: el pie plano enlaza las páginas («Páginas») y las legales, un enlace cada una. L7d no corrió esta suite.
const DELTA_DE_LAS_PAGINAS = { paradas: PAGINAS_DEL_PIE.length + PAGINAS_LEGALES.length } as const
// [L7g] Los enlaces al final de las secciones: «Conocé más sobre nosotros» (Quiénes somos) y «Ver todos los trabajos» (Portfolio), uno cada una.
// Las legales del pie 3D no suman acá: sólo existen en el modo de volumen, que el marcado de servidor no sirve.
const DELTA_DE_LOS_ENLACES_DE_SECCION = { paradas: 2 } as const

const QUIETA = marcadoDelDocumento('quieta')
const ANIMADA = marcadoDelDocumento('animada')
const marcado = (rama: (typeof RAMAS)[number]): string => (rama === 'quieta' ? QUIETA : ANIMADA)

// ═══════════════════════════════════════════════════════════════════════════
titulo('0 · Los supuestos, antes de la primera cifra')
for (const s of SUPUESTOS_DEL_BANCO) console.log(`  · ${s}`)
console.log(`  · ${HUECOS.length} huecos declarados por el banco; ninguno se estima acá`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Ningún detector está ciego')

controlPositivo('ve la segunda copia del CTA sin ocultar', ROTOS.ctaSinOcultar, (h) => !esRepeticionExacta(documentoAnunciado(h)))
controlPositivo('ve el divisor con la copia accesible Y las piezas anunciadas', ROTOS.divisorSinOcultar, (h) => !esRepeticionExacta(documentoAnunciado(h)))
controlPositivo('ve un salto de nivel', ROTOS.saltoDeNivel, (h) => saltosDeNivel(encabezados(h)).length === 0)
controlPositivo('ve un `tabindex` positivo', ROTOS.tabindexPositivo, (h) => tabindexPositivos(h).length === 0)
controlPositivo('ve un documento sin `<main>`', ROTOS.sinMain, (h) => candidatosALandmark(h).some((l) => l.rol === 'main'))
controlPositivo('ve un `<input>` sin rótulo', ROTOS.campoSinRotulo, (h) => paradasDeTabulacion(h).every((p) => rotuloDeParada(h, p).rotulo !== ''))
controlPositivo('no confunde un rol cualquiera con un landmark', ROTOS.rolQueNoEsLandmark, esRolDeLandmark)
// Los dos controles del censo de marcadores viven en `s10-acceso-censo.ts`,
// con la sección §7 que los consume. Ver su docblock: el arreglo de B7.
afirmarQueElCensoNoEstaCiego()
controlPositivo('ve una transformada', ROTOS.conTransformada, (h) => transformadasDe(h).length === 0)
controlPositivo('ve un `will-change` por utilidad', ROTOS.conWillChange, (h) => willChangeDe(h).length === 0)
controlPositivo('la razón de contraste distingue dos colores', '#F7F7F5', (c) => razon(c, COLOR.oscuro) < 3)
afirmarIgual(razon('#000000', '#FFFFFF').toFixed(4), '21.0000', 'y la calculadora da el extremo conocido')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · EL ORDEN DE TABULACIÓN COMPLETO — las 16 paradas')

/**
 * ⚠️ **CENSO MOVIDO EN SITIO-S11 — hay UNA PARADA MÁS, y es la que faltaba.**
 *
 * S10 midió 15 paradas y que las CINCO primeras eran la pastilla, que nace al
 * 89–92 % de la primera pantalla: quien tabulaba la encontraba primero y la
 * veía abajo de todo el Hero (WCAG 2.4.3), y no había por dónde escapar. S11
 * escribió el enlace «saltar al contenido» (`_chrome/SaltarAlContenido.tsx`),
 * que entra ANTES que la pastilla y es ahora la parada 1. Las 15 de S10 no se
 * movieron ni cambiaron de orden: se corrieron un lugar.
 *
 * La afirmación de las cinco de la pastilla no se afloja — se parte en dos y
 * queda más precisa: la primera es el salto, y las cinco siguientes son las
 * cinco de siempre, en el mismo orden.
 */
const PARADAS = paradasDeTabulacion(QUIETA)
imprimirParadas(QUIETA, PARADAS)
/**
 * ⚠️ **CENSO MOVIDO EN V3-D — TRES PARADAS MÁS, Y SON LOS TRABAJOS.**
 *
 * Trabajos no tenía un solo control, y la razón escrita era exacta: no había
 * página de caso y **las URLs de los clientes no se inventan**. Los tres
 * dominios de producción llegaron, así que el `h3` de cada proyecto es ahora un
 * `<a>` al sitio. Son paradas 12, 14 y 16 del documento —después del CTA del
 * Hero y antes de las del pie— y las tres llevan a algo.
 *
 * Las 16 de antes no se movieron ni cambiaron de orden: las tres nuevas se
 * intercalan donde vive la sección 04. Lo que la sección 3 afirma sobre la
 * pastilla y el enlace de salto sigue en pie, y se comprueba abajo.
 */
/**
 * ⚠️ **TRES PARADAS MÁS EN MODO PULIDO, Y SÓLO SON PARADAS ABAJO DE 1025.**
 *
 * Los tres marcos de «Quiénes somos» ganaron un control de toque: abajo del
 * umbral el intercambio de foto se abre y se cierra con un clic, porque ahí no
 * hay hover. El control es un `<button>` que `marco.tsx` monta SIEMPRE —el corte
 * de ancho no puede ser una rama de JS: `s7-contrato` §5 prohíbe que una sección
 * consulte la compuerta— y que `escritorio:hidden` apaga de 1025 para arriba.
 *
 * Este censo lee el MARCADO, donde una clase de ancho no se aplica, así que los
 * ve siempre: son 22 en el papel —las de esa cuenta—. En el navegador, arriba
 * del umbral el botón
 * está en `display: none`, que no es esconder sino sacar del árbol de
 * accesibilidad y del orden de tabulación — o sea que el escritorio sigue
 * teniendo las 19 de V3-D, y las tres de más son exactamente el gesto que sólo
 * existe del otro lado.
 */
/**
 * ⚠️ **TRES PARADAS MÁS, Y SON LAS DOS ANCLAS DE CADA TRABAJO.**
 *
 * Cada proyecto de Portfolio ponía UNA parada —el nombre— y hoy pone DOS: el
 * nombre y la captura llevan al sitio del cliente. Una de más por proyecto, por
 * tres proyectos: +3 sobre las 22. Y una cuarta: el CTA con el que termina el
 * túnel, que abajo de 1025 es un enlace al final de la lista y arriba es una
 * ventana de navegador —la misma parada, dibujada distinto—.
 *
 * Llegó a ser CUATRO por proyecto —nombre, rubro, logo y captura— y se bajó: el
 * logo se fue con el rediseño del tramo y el rubro dejó de ser ancla, porque tres
 * paradas seguidas al mismo destino se anuncian tres veces igual. Quedan las dos
 * que hacen falta, y la de la imagen declara su `aria-label`.
 */
// SPRINT DEMOS · + las demos del tramo de Trabajos (el estante arriba de 1025, la cinta abajo), una parada cada una.
afirmarIgual(PARADAS.length, 26 + DELTA_DEL_PANEL.paradas + DELTA_DE_DEMOS.paradas + DELTA_DE_SERVICIOS.paradas + DELTA_DEL_FINAL.paradas + DELTA_DEL_CONTACTO.paradas + DELTA_DE_LA_VIDA.paradas + DELTA_DEL_NAVBAR.paradas + DELTA_DEL_RETOQUE.paradas + DELTA_DE_LA_RONDA2.paradas + DELTA_DEL_RETOQUE_PANEL.paradas + DELTA_DEL_PULIDO_10.paradas + DELTA_DEL_PORTFOLIO.paradas + DELTA_DE_B12A8.paradas + DELTA_DE_LAS_RESENAS.paradas + DELTA_DEL_PANEL_B6.paradas + DELTA_DEL_FAQ.paradas + DELTA_DEL_CTA_DEL_PANEL.paradas + DELTA_DE_LAS_PAGINAS.paradas + DELTA_DE_LOS_ENLACES_DE_SECCION.paradas, `el home entero tiene 26 paradas —las 22 de antes, la captura de cada trabajo y el CTA del final del túnel— más las 8 tarjetas del panel, las ${String(DELTA_DE_DEMOS.paradas)} demos y el CTA de cada servicio, «Hablemos» en el hero, la pausa del panel en vivo, «Panel» en la barra y el formulario del pie; desde RETOQUE PANEL, sin las 8 tarjetas ni la pausa del panel en vivo; desde PULIDO 10, más Demos en el recorrido del pie; desde B1, el Portfolio con una parada más que el túnel; desde B12a.8, «Home» y la flechita de «Servicios»; desde B2, el enlace de cada reseña; desde L7d, las páginas y las legales del pie; desde L7g, el enlace de Quiénes somos y el de Portfolio`)
afirmarIgual(paradasDeTabulacion(ANIMADA).length, 26 + DELTA_DEL_PANEL.paradas + DELTA_DE_DEMOS.paradas + DELTA_DE_SERVICIOS.paradas + DELTA_DEL_FINAL.paradas + DELTA_DEL_CONTACTO.paradas + DELTA_DE_LA_VIDA.paradas + DELTA_DEL_NAVBAR.paradas + DELTA_DEL_RETOQUE.paradas + DELTA_DE_LA_RONDA2.paradas + DELTA_DEL_RETOQUE_PANEL.paradas + DELTA_DEL_PULIDO_10.paradas + DELTA_DEL_PORTFOLIO.paradas + DELTA_DE_B12A8.paradas + DELTA_DE_LAS_RESENAS.paradas + DELTA_DEL_PANEL_B6.paradas + DELTA_DEL_FAQ.paradas + DELTA_DEL_CTA_DEL_PANEL.paradas + DELTA_DE_LAS_PAGINAS.paradas + DELTA_DE_LOS_ENLACES_DE_SECCION.paradas, '  y la rama animada tiene las mismas: el recorrido de teclado no cambia con el ancho')
controlPositivo('[B2] el censo sin las reseñas no cierra: las ramas suman cada una sus enlaces', PARADAS.length - DELTA_DE_LAS_RESENAS.paradas, (n: number) => n === PARADAS.length && paradasDeTabulacion(ANIMADA).length === n)
controlPositivo('[B10] el censo sin el FAQ no cierra: las ramas suman cada una sus preguntas', PARADAS.length - DELTA_DEL_FAQ.paradas, (n: number) => n === PARADAS.length && paradasDeTabulacion(ANIMADA).length === n)
controlPositivo('[L7-INT] el censo sin las páginas del pie no cierra: las ramas suman cada una sus enlaces', PARADAS.length - DELTA_DE_LAS_PAGINAS.paradas, (n: number) => n === PARADAS.length && paradasDeTabulacion(ANIMADA).length === n)
controlPositivo('[L7g] el censo sin los enlaces de sección no cierra: las ramas suman cada una los suyos', PARADAS.length - DELTA_DE_LOS_ENLACES_DE_SECCION.paradas, (n: number) => n === PARADAS.length && paradasDeTabulacion(ANIMADA).length === n)
afirmarIgual(tabindexPositivos(QUIETA), [], 'ningún `tabindex` positivo rompe el orden del documento')
afirmarIgual(
  PARADAS.filter((p) => rotuloDeParada(QUIETA, p).rotulo === '').map((p) => p.etiqueta),
  [], 'las 16 tienen nombre accesible — el `<input>` lo saca de su `<label for>`',
)
afirmarIgual(PARADAS.filter((p) => p.ocultoALectores).map((p) => p.etiqueta), [], 'ninguna parada está adentro de un `aria-hidden`')
afirmarIgual(PARADAS[0].destino, '#hero', 'la PRIMERA parada del documento es el enlace de salto, y apunta a la primera sección de la tabla')
afirmar(
  encabezados(QUIETA).length > 0 && QUIETA.includes('id="hero"'),
  '  y su destino EXISTE en el marcado: el salto aterriza en algo',
)
// [B12a.5] Reemplazada por la spec (D5): «Servicios» es el botón que abre el desplegable (sin destino propio: «Todos los servicios» va
// adentro, con las páginas); cerrado, sus enlaces no son paradas.
// [B12a.8 · T0] Reemplazada por la spec de B12a.8 (CONTRATO §Navegación): «Home» primero y «Servicios» un enlace a su sección, con la
// flechita de la lista (un botón) detrás.
const ITEMS_DE_LA_BARRA = ['#hero', '#quienes-somos', '#trabajos', '#servicios', '<button>', '#tu-panel', '#por-que-develop', '#contacto'] as const
const barraEnSuOrden = (ps: typeof PARADAS): boolean => {
  const d = ps.slice(1, 1 + ITEMS_DE_LA_BARRA.length).map((p) => p.destino ?? `<${p.etiqueta}>`)
  return d.length === ITEMS_DE_LA_BARRA.length && d.every((x, k) => x === ITEMS_DE_LA_BARRA[k])
}
afirmar(
  barraEnSuOrden(PARADAS),
  '  y las OCHO siguientes son los ítems de la barra, en su orden ([B12a.8] «Home» primero; «Servicios», el enlace y su flechita; [NAVBAR] «Panel» nuevo; CONTACTO: el último abre el formulario)',
  JSON.stringify(PARADAS.slice(1, 1 + ITEMS_DE_LA_BARRA.length).map((p) => p.destino ?? `<${p.etiqueta}>`)),
)
controlPositivo('  el detector ve la barra sin «Home» (la de antes de B12a.8)', PARADAS.filter((p, k) => !(k === 1 && p.destino === '#hero')), barraEnSuOrden)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La pastilla: primera al tabular, última de la primera pantalla')

for (const alto of ALTOS) {
  const y = alto - DESCUENTO_NACIMIENTO_PX
  console.log(`  a ${alto}px de alto → nace a ${y}px del tope: al ${((y / alto) * 100).toFixed(1)} % de la primera pantalla`)
}
afirmarIgual(DESCUENTO_NACIMIENTO_PX, 72, 'el nacimiento es `100svh − 72px`, derivado de `_lib/navegacion.ts`')
/**
 * ⚠️ **CENSO MOVIDO EN SITIO-S11 — hallazgos 1 y 2 cerrados, y la cifra que los
 * produjo sigue siendo cierta.** El nacimiento de la pastilla NO se tocó —sigue
 * al 89,2–92,0 % de la primera pantalla, y por eso se sigue imprimiendo arriba—:
 * lo que cambió es que ahora hay ESCAPE. La parada 1 es el enlace de salto, así
 * que el contenido está a UNA pulsación en vez de a cinco. Eso cierra el 2 (no
 * existía el enlace) y el 1 (WCAG 2.4.3 pide un mecanismo para saltear bloques
 * repetidos). La pastilla no se movió en el documento, y no por prudencia: nace
 * donde está (`sticky` de alto cero con la pastilla `absolute` a `100svh − 72`),
 * y bajarla la haría nacer más abajo.
 */
// [RETOQUE 3D] N1: + «Login» en la esquina. [B12a.8 · T0] + «Home» y la flechita de «Servicios»: la 11ª.
afirmar(PARADAS[10].seccion === 'hero' && PARADAS.slice(0, 10).every((p) => p.seccion !== 'hero' || p.destino === '#hero'), 'la primera parada que vive en el CONTENIDO es la 11ª ([B12a.8] ocho ítems de la barra y [RETOQUE 3D] Login) — y se llega a ella en UNA pulsación desde la 1ª', `${rotuloDeParada(QUIETA, PARADAS[9]).rotulo} → ${PARADAS[9].destino}`)
afirmar(PARADAS[0].seccion === null || PARADAS[0].seccion === undefined || PARADAS[0].destino === '#hero', '  y la 1ª es el escape: el enlace de salto vive en el chrome y apunta al contenido')
console.log(
  '  ✅ HALLAZGOS 1 y 2 — CERRADOS en SITIO-S11 · `_chrome/SaltarAlContenido.tsx` + `_estilos/foco.css` — el enlace de salto es la parada 1 ' +
    'del documento en las dos ramas, está fuera de cuadro en reposo y se ve al enfocarlo (17,60:1 sobre su superficie propia). Las cinco ' +
    'paradas de la pastilla siguen naciendo donde nacían; lo que ya no hay es un recorrido sin salida.',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · EL ÁRBOL DE ENCABEZADOS — las dos ramas')

for (const rama of RAMAS) {
  const html = marcado(rama)
  const arbol = encabezados(html)
  const nodos = nodosDe(html)
  console.log(`  ── ${rama}: ${arbol.length} encabezados`)
  imprimirArbol(html, arbol)
  afirmarIgual(arbol.filter((h) => h.nivel === 1).length, 1, `  ${rama}: un solo \`h1\``)
  afirmarIgual(saltosDeNivel(arbol), [], `  ${rama}: cero saltos de nivel`)
  afirmarIgual(arbol.filter((h) => h.ocultoALectores).map((h) => h.texto), [], `  ${rama}: ningún encabezado sale del árbol por \`aria-hidden\``)
  afirmarIgual(
    arbol.filter((h) => esRepeticionExacta(textoAnunciado(html, nodos[h.indice]))).map((h) => h.texto),
    [], `  ${rama}: ningún encabezado se anuncia duplicado por el divisor de líneas`,
  )
}
/**
 * ⚠️ **CENSO MOVIDO EN SITIO-S11 — los hallazgos 3 y 4 están cerrados, y el
 * árbol de las DOS ramas pasa a ser el MISMO.**
 *
 * S10 medía 26 encabezados en la rama quieta y 24 en la animada, y los dos que
 * faltaban eran los de Servicios: arriba de 1025 la secuencia montaba un
 * servicio por vez, así que para un lector de pantalla los otros dos no
 * existían (hallazgo 3). Y Servicios era la única de las ocho sin un encabezado
 * que la nombrara (hallazgo 4). S11 arregló los dos: los tres servicios están
 * siempre en el árbol —la secuencia elige cuál se PINTA, no cuál existe— y la
 * sección tiene su `h2`, con los tres servicios bajados a `h3`.
 *
 * Por eso son 27 y no 26: los 26 de S10 menos los tres `h2` de servicio que
 * pasaron a `h3` —que siguen contando— más el `h2` nuevo de la sección. Y la
 * afirmación de las dos ramas se **fortalece**: en vez de comparar dos números,
 * se exige que los dos árboles sean iguales elemento por elemento, que es lo que
 * el defecto rompía y lo que un número solo no garantiza.
 */
/**
 * El árbol como lo OYE un lector: nivel más texto ANUNCIADO.
 *
 * ⚠️ Se usa `textoAnunciado` y no `h.texto`, y la diferencia no es cosmética.
 * `encabezados()` devuelve el texto CRUDO del subárbol, y en la rama animada los
 * tres titulares que salen de `CanalDeTitular` traen dentro del mismo `h2` la
 * copia accesible del divisor de líneas Y sus piezas visibles —así que el crudo
 * dice la frase dos veces—. Es una propiedad del divisor, no un defecto: las
 * piezas van `aria-hidden`, y la línea de arriba de esta sección ya afirma que
 * ningún encabezado se anuncia duplicado. Comparar los crudos habría puesto en
 * rojo un árbol correcto; comparar lo anunciado compara lo que se oye.
 */
const arbolDe = (html: string): string[] => {
  const nodos = nodosDe(html)
  return encabezados(html).map((h) => `h${h.nivel} ${textoAnunciado(html, nodos[h.indice])}`)
}
// 28 desde que Quiénes somos ganó «El Equipo»: los dos nombres del equipo bajaron de
// `h3` a `h4` —siguen contando— y el rótulo del bloque entró como el `h3` que los junta.
afirmarIgual(encabezados(QUIETA).length, 29 + DELTA_DEL_PANEL.encabezados + DELTA_DE_DEMOS.encabezados + DELTA_DEL_FINAL.encabezados + DELTA_DEL_RETOQUE_PANEL.encabezados + DELTA_DEL_PORTFOLIO.encabezados + DELTA_DE_SERVICIOS_B4.encabezados + DELTA_DE_LAS_RESENAS.encabezados + DELTA_DEL_PANEL_B6.encabezados + DELTA_DEL_FAQ.encabezados + DELTA_DEL_CTA_DEL_PANEL.encabezados, '[RETOQUE PANEL] + los 8 títulos de las features · la rama quieta publica 29 encabezados —los 27 de S11, el rótulo del bloque del equipo y el título de la foto— menos los 4 del panel viejo, más el título de las demos y los dos valores más del final; [B1] y la cabecera de cada tira del Portfolio en lugar del nombre de cada trabajo (una más: la tuya); [B4] y el del recomendador de Servicios; [B2] y el de las reseñas para el lector')
afirmarIgual(arbolDe(ANIMADA), arbolDe(QUIETA), '  y la animada publica EXACTAMENTE el mismo árbol: ya no pierde los dos `h2` de Servicios')
console.log(
  '  ✅ HALLAZGOS 3 y 4 — CERRADOS en SITIO-S11 · `_secciones/servicios/` — `PanelDeSecuencia` monta las TRES capas y la secuencia apaga dos ' +
    'con `sr-only`, que NO las saca del árbol; y `CabeceraDeServicios.tsx` le da a la sección el `h2` que le faltaba, con los tres servicios ' +
    'bajados a `h3` y su tamaño intacto. El árbol animado pasa de 24 a 27 encabezados y de 33 a 43 marcadores (§7).',
)

// ═════════════════════════════════════════════════════════════════════════
// §5 vive en `s10-acceso-landmarks.ts`, que S11 dio vuelta entera.
afirmarLosLandmarks(QUIETA, marcado)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El divisor de líneas y el CTA, sobre las OCHO juntas')

for (const rama of RAMAS) {
  const html = marcado(rama)
  const ctas = nodosDe(html).filter((n) => atributo(n, 'data-pieza') === 'cta')
  afirmar(ctas.length > 0, `  ${rama}: hay ${ctas.length} CTA que la comprobación tuvo que mirar`)
  afirmarIgual(ctas.map((n) => textoAnunciado(html, n)).filter(esRepeticionExacta), [], `  ${rama}: ningún CTA anuncia su rótulo dos veces`)
  afirmarIgual(
    nodosDe(html).filter((n) => atributo(n, 'data-lineas-piezas') !== null && !n.ocultoALectores).length,
    0, `  ${rama}: las ${piezasDelDivisor(html).length} piezas del divisor están FUERA del árbol de accesibilidad`,
  )
}
afirmarIgual(piezasDelDivisor(QUIETA).length, 0, 'en la rama quieta el divisor no monta: no hay nada que ocultar')
afirmar(piezasDelDivisor(ANIMADA).length > 0, `en la animada monta ${piezasDelDivisor(ANIMADA).length} bloques partidos`, 'es el control de la línea de arriba')

// ═════════════════════════════════════════════════════════════════════════
// §7 vive en `s10-acceso-censo.ts`, junto con los controles de §1 que lo
// habilitan: el censo y la prueba de que su detector no está ciego son una
// sola pieza, y B7 la reescribió entera.
afirmarElCenso(QUIETA, ANIMADA)

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · `prefers-reduced-motion` sobre el home ENTERO')

afirmar(!deberiaAnimar(true, true), 'con la preferencia puesta la compuerta del home NO instala primitivas, a cualquier ancho')
afirmar(deberiaAnimar(true, false), '  y sin la preferencia sí — el control que impide que esto sea verde por vacío')
afirmarIgual(transformadasDe(QUIETA), [], 'el árbol que se sirve con la preferencia no escribe una sola transformada')
afirmarIgual(willChangeDe(QUIETA), [], '  ni un solo `will-change`')
afirmarIgual(piezasDelDivisor(QUIETA).length, 0, '  ni una pieza del divisor de líneas')
/**
 * ⚠️ **ESTA COMPROBACIÓN SE FORTALECIÓ EN SITIO-S11.** Decía «es MÁS que el de
 * la rama animada», que era lo máximo afirmable mientras la secuencia montara un
 * servicio por vez: la quieta tenía texto que la animada no. Arreglado el
 * defecto 3, las dos ramas dicen EXACTAMENTE lo mismo, y eso sí se puede
 * comparar cadena contra cadena. Un «>» pasaba en verde con la animada perdiendo
 * cualquier cosa; una igualdad no.
 */
afirmarIgual(documentoAnunciado(QUIETA), documentoAnunciado(ANIMADA), `  y el texto anunciado es EXACTAMENTE el mismo en las dos ramas: ${documentoAnunciado(QUIETA).length} caracteres, idénticos`)
afirmar(transformadasDe(ANIMADA).length > 0, `  control: la rama animada sí escribe ${transformadasDe(ANIMADA).length} transformadas`)
publicar({
  n: 10, gravedad: 'media', clase: 'defecto',
  dueño: 'el banco compartido — `s10-banco.ts`, `marcadoConMovimientoReducido()`. ✅ ARREGLADO en la integración de este mismo sprint',
  que: `ese helper forzaba \`anima: true\` con \`MotionConfig reducedMotion="always"\` y devolvía 52 transformadas y 52 \`will-change\`: un estado que producción NUNCA sirve, porque la compuerta que apaga el movimiento vive en \`CompuertaDelHome\` y con la preferencia puesta no instala una sola primitiva animada. La integración lo hizo devolver el árbol QUIETO —hoy da ${transformadasDe(marcadoConMovimientoReducido()).length} transformadas y ${willChangeDe(marcadoConMovimientoReducido()).length} \`will-change\`— y dejó el estado imposible aparte, como \`marcadoAnimadoConPreferenciaForzada()\`, declarado como control y no como respuesta`,
})

// ═══════════════════════════════════════════════════════════════════════════
// §11 vive en `s10-acceso-tablas.ts`, con el registro que lo alimenta: el censo
// y su publicación son la misma pieza.
afirmarElInventario()

cerrar('s10-acceso.invariant')
