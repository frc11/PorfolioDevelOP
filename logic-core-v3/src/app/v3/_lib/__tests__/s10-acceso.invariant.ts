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
 * líneas del repo, así que §5 (los landmarks) vive en `./s10-acceso-landmarks` y
 * §10 (el contraste) en `./s10-acceso-contraste`, que es la única sección que
 * resuelve COLOR. El corte es por tema, no por tamaño.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ALTOS, HUECOS, RAMAS, SUPUESTOS_DEL_BANCO, marcadoConMovimientoReducido, marcadoDelDocumento } from './s10-banco'
import { candidatosALandmark, encabezados, paradasDeTabulacion, saltosDeNivel, tabindexPositivos } from './s10-lectura'
import { atributo, nodosDe } from './s10-recorrido'
import {
  ROTOS, documentoAnunciado, esRepeticionExacta, esRolDeLandmark, marcadoresAnunciados,
  piezasDelDivisor, rotuloDeParada, textoAnunciado, transformadasDe, willChangeDe,
} from './s10-acceso'
import { COLOR, razon } from './s10-acceso-color'
import {
  imprimirArbol, imprimirInventario, imprimirMarcadores, imprimirParadas, publicados, publicar,
 afirmarElInventario } from './s10-acceso-tablas'
import { afirmarElContraste, afirmarElFoco } from './s10-acceso-contraste'
import { afirmarLosLandmarks } from './s10-acceso-landmarks'
import { MARCADORES } from '../../_secciones/_contrato/marcadores'
import { deberiaAnimar } from '../../_secciones/_contrato/motion'
import { DESCUENTO_NACIMIENTO_PX } from '../navegacion'

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
afirmarIgual(PARADAS.length, 16, 'el home entero tiene 16 paradas de tabulación: las 15 de S10 más el enlace de salto')
afirmarIgual(paradasDeTabulacion(ANIMADA).length, 16, '  y la rama animada tiene las mismas 16')
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
afirmarIgual(
  PARADAS.slice(1, 6).map((p) => p.destino),
  ['#quienes-somos', '#trabajos', '#servicios', '#por-que-develop', '#cierre'],
  '  y las CINCO siguientes son los enlaces de la pastilla, en el mismo orden que medía S10',
)

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
afirmar(PARADAS[6].seccion === 'hero', 'la primera parada que vive en el CONTENIDO es la 7ª — y se llega a ella en UNA pulsación desde la 1ª', `${rotuloDeParada(QUIETA, PARADAS[6]).rotulo} → ${PARADAS[6].destino}`)
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
afirmarIgual(encabezados(QUIETA).length, 27, 'la rama quieta publica 27 encabezados: los 26 de S10 más el que nombra a Servicios')
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

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · LOS MARCADORES — cómo suena el recorrido')

const MARCAS = marcadoresAnunciados(QUIETA)
imprimirMarcadores(MARCAS)
afirmarIgual(MARCAS.length, 43, 'son 43 marcadores ANUNCIADOS en la rama quieta — la cifra de la instrucción, verificada')
afirmarIgual(marcadoresAnunciados(ANIMADA).map((m) => m.marcador).sort(), MARCAS.map((m) => m.marcador).sort(), 'y los MISMOS 43 en la animada, marcador por marcador: no falta ninguno — eran 33 en S10, los 10 que Servicios no montaba')
afirmarIgual(MARCAS.map((m) => m.marcador).filter((m) => !(MARCADORES as readonly string[]).includes(m)), [], 'ninguno queda fuera del vocabulario cerrado de `marcadores.ts`')
afirmarIgual(MARCAS.filter((m) => m.contexto === '').length, 0, 'los 43 caen adentro de una frase anunciada: ninguno vive en un subárbol oculto')
publicar({
  n: 9, gravedad: 'media', clase: 'decisión',
  dueño: 'el contenido de relleno — `_contrato/marcadores.ts` declara la forma como deliberada',
  que: 'los 43 se LEEN EN VOZ ALTA. Números anuncia cinco veces seguidas «CIFRA · Proyectos entregados / CIFRA · Clientes activos / …» y Trabajos tres «Lo que cambió · MÉTRICA». NO SE ARREGLA: la regla del sprint es que el contenido inventado parezca inventado',
})

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

// ═════════════════════════════════════════════════════════════════════════
// §9 vive en `s10-acceso-contraste.ts`, con §10: el anillo también es una razón
// de contraste y consume los mismos colores leídos del tema.
afirmarElFoco()

// ═════════════════════════════════════════════════════════════════════════
// §10 vive en `s10-acceso-contraste.ts`: es la única sección que resuelve COLOR.
afirmarElContraste(QUIETA)

// ═══════════════════════════════════════════════════════════════════════════
// §11 vive en `s10-acceso-tablas.ts`, con el registro que lo alimenta: el censo
// y su publicación son la misma pieza.
afirmarElInventario()

cerrar('s10-acceso.invariant')
