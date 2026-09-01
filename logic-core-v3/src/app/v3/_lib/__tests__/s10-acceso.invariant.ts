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
 * documento, el orden de tabulación también, y un `text-tinta-tenue` que pasa
 * AA en el componente donde se escribió falla cuando lo montan adentro de la
 * sección invertida. Este archivo recorre el documento entero.
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
 * Este frente MIDE; el único que cambia código de producto es otro. Así que
 * los defectos no van en rojo: van publicados, con su gravedad y su dueño. Lo
 * que sí se afirma es que **el inventario es EXACTAMENTE el que se publica** —
 * si aparece uno nuevo, esto se pone en rojo.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ALTOS, HUECOS, RAMAS, SUPUESTOS_DEL_BANCO, marcadoConMovimientoReducido, marcadoDelDocumento } from './s10-banco'
import { candidatosALandmark, encabezados, paradasDeTabulacion, saltosDeNivel, tabindexPositivos } from './s10-lectura'
import { atributo, nodosDe } from './s10-recorrido'
import {
  ROTOS, documentoAnunciado, esRepeticionExacta, esRolDeLandmark, marcadoresAnunciados,
  piezasDelDivisor, rotuloDeParada, textoAnunciado, transformadasDe, willChangeDe,
} from './s10-acceso'
import {
  AA, ALFA_CASI, COLOR, CONTRASTE_CONTRA_LA_ESCENA, cajasDeColor, componer,
  loRedefineLaInvertida, razon, superficiesDelDocumento,
} from './s10-acceso-color'
import {
  anillosFlojos, imprimirAnillos, imprimirArbol, imprimirContraste, imprimirInventario,
  imprimirLandmarks, imprimirMarcadores, imprimirParadas, publicados, publicar, type CaidaDelAnillo,
} from './s10-acceso-tablas'
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
titulo('2 · EL ORDEN DE TABULACIÓN COMPLETO — las 15 paradas')

const PARADAS = paradasDeTabulacion(QUIETA)
imprimirParadas(QUIETA, PARADAS)
afirmarIgual(PARADAS.length, 15, 'el home entero tiene 15 paradas de tabulación')
afirmarIgual(paradasDeTabulacion(ANIMADA).length, 15, '  y la rama animada tiene las mismas 15')
afirmarIgual(tabindexPositivos(QUIETA), [], 'ningún `tabindex` positivo rompe el orden del documento')
afirmarIgual(
  PARADAS.filter((p) => rotuloDeParada(QUIETA, p).rotulo === '').map((p) => p.etiqueta),
  [], 'las 15 tienen nombre accesible — el `<input>` lo saca de su `<label for>`',
)
afirmarIgual(PARADAS.filter((p) => p.ocultoALectores).map((p) => p.etiqueta), [], 'ninguna parada está adentro de un `aria-hidden`')
afirmarIgual(
  PARADAS.slice(0, 5).map((p) => p.destino),
  ['#quienes-somos', '#trabajos', '#servicios', '#por-que-develop', '#cierre'],
  'las CINCO primeras son los enlaces de la pastilla de navegación',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La pastilla: primera al tabular, última de la primera pantalla')

for (const alto of ALTOS) {
  const y = alto - DESCUENTO_NACIMIENTO_PX
  console.log(`  a ${alto}px de alto → nace a ${y}px del tope: al ${((y / alto) * 100).toFixed(1)} % de la primera pantalla`)
}
afirmarIgual(DESCUENTO_NACIMIENTO_PX, 72, 'el nacimiento es `100svh − 72px`, derivado de `_lib/navegacion.ts`')
afirmar(PARADAS[5].seccion === 'hero', 'la primera parada que vive en el CONTENIDO es la 6ª', `${rotuloDeParada(QUIETA, PARADAS[5]).rotulo} → ${PARADAS[5].destino}`)
publicar({
  n: 1, gravedad: 'media', clase: 'defecto',
  dueño: 'el chrome del home — `_chrome/ChromeDelHome.tsx` + `_lib/navegacion.ts`',
  que: 'las paradas 1 a 5 de 15 son la pastilla, que nace al 89,2–92,0 % de la primera pantalla (595 / 772 / 828 px según el alto declarado): quien tabula la encuentra PRIMERO y la ve ABAJO de todo el Hero. Orden de foco y orden visual no coinciden (WCAG 2.4.3)',
})
publicar({
  n: 2, gravedad: 'media', clase: 'defecto',
  dueño: 'el chrome del home — nadie escribió el enlace de salto',
  que: 'no hay enlace «saltar al contenido»: son 5 paradas de navegación antes de la primera del contenido, en las dos ramas',
})

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
afirmarIgual(encabezados(QUIETA).length, 26, 'la rama quieta publica 26 encabezados')
afirmarIgual(encabezados(ANIMADA).length, 24, 'la animada publica 24: dos menos, y son los de Servicios')
publicar({
  n: 3, gravedad: 'alta', clase: 'defecto',
  dueño: 'la sección Servicios — `_secciones/servicios/ServiciosEnSecuencia.tsx`',
  que: 'arriba de 1025 y sin movimiento reducido, la secuencia monta UN servicio por vez: el árbol pierde los `h2` «IA y automatización» y «Software a medida» y 10 de los 43 marcadores. Quien navegue por encabezados sin scrollear no alcanza dos tercios de la sección. Abajo de 1025 y con la preferencia puesta están los tres',
})
publicar({
  n: 4, gravedad: 'baja', clase: 'defecto',
  dueño: 'la sección Servicios',
  que: 'Servicios es la única de las ocho sin un encabezado que la nombre: sus tres servicios entran como `h2` hermanos de los titulares de las otras siete secciones',
})

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · LOS LANDMARKS — los que hay, y los que no llegan a serlo')

const CANDIDATOS = candidatosALandmark(QUIETA)
imprimirLandmarks(CANDIDATOS)
afirmarIgual(CANDIDATOS.filter((l) => esRolDeLandmark(l.rol)).map((l) => l.rol), ['main', 'navigation'], 'el documento tiene DOS landmarks: `main` y `navigation`')
afirmar(CANDIDATOS[0].etiqueta === 'main', 'el `<main>` EXISTE, y lo pone `src/app/v3/layout.tsx` — no la página', 'la referencia no lo tiene en 5 de sus 6 URLs')
afirmarIgual(CANDIDATOS.length, 17, 'de 17 candidatos, 15 no llegan a landmark')
afirmarIgual(CANDIDATOS.filter((l) => l.etiqueta === 'section' && l.rol === null).length, 8, 'las OCHO `<section>` quedan sin nombre accesible: ninguna aporta una `region`')
publicar({
  n: 5, gravedad: 'alta', clase: 'defecto',
  dueño: 'la sección Cierre — el `<footer data-pieza="pie">` vive adentro de `<section id="cierre">`',
  que: 'el sitio NO tiene landmark `contentinfo`. Un `<footer>` adentro de contenido seccionante no mapea a `contentinfo` (HTML-AAM), y éste está adentro de una `<section>`: el pie no se alcanza navegando por regiones',
})
publicar({
  n: 6, gravedad: 'media', clase: 'defecto',
  dueño: 'las ocho secciones — `_secciones/_contrato/Seccion.tsx`',
  que: 'ninguna `<section>` apunta con `aria-labelledby` a su propio titular, así que el documento tiene 2 landmarks y no 10: navegar por regiones no sirve para recorrer el home',
})
publicar({
  n: 7, gravedad: 'baja', clase: 'defecto',
  dueño: 'el chrome — `<nav>` se monta adentro del `<main>` del layout',
  que: 'el `navigation` está ANIDADO en el `main`, así que un «saltar al contenido principal» no saltearía la navegación; y no hay `banner`',
})
publicar({
  n: 8, gravedad: 'baja', clase: 'defecto',
  dueño: 'el banco compartido — `s10-lectura.ts`, `landmarks()`. ✅ ARREGLADO en la integración de este mismo sprint',
  que: '`landmarks()` filtraba por «tiene rol», no por «tiene rol DE LANDMARK»: contaba los 4 `<figure role="img">` y publicaba 6 landmarks donde hay 2. Los 4 `role="img"` son correctos; el que se equivocaba era el filtro. La integración le puso la lista de los ocho roles de ARIA (`esRolDeLandmark`) con dos controles positivos —un `role="img"` no cuenta, un `role="search"` sí—, y este invariante lo verifica arriba con su propia lista, que sigue siendo independiente de la del banco',
})

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
afirmarIgual(marcadoresAnunciados(ANIMADA).length, 33, 'y 33 en la animada: los 10 que Servicios no monta')
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
afirmar(documentoAnunciado(QUIETA).length > documentoAnunciado(ANIMADA).length, '  y el texto anunciado sigue completo: es MÁS que el de la rama animada')
afirmar(transformadasDe(ANIMADA).length > 0, `  control: la rama animada sí escribe ${transformadasDe(ANIMADA).length} transformadas`)
publicar({
  n: 10, gravedad: 'media', clase: 'defecto',
  dueño: 'el banco compartido — `s10-banco.ts`, `marcadoConMovimientoReducido()`. ✅ ARREGLADO en la integración de este mismo sprint',
  que: `ese helper forzaba \`anima: true\` con \`MotionConfig reducedMotion="always"\` y devolvía 52 transformadas y 52 \`will-change\`: un estado que producción NUNCA sirve, porque la compuerta que apaga el movimiento vive en \`CompuertaDelHome\` y con la preferencia puesta no instala una sola primitiva animada. La integración lo hizo devolver el árbol QUIETO —hoy da ${transformadasDe(marcadoConMovimientoReducido()).length} transformadas y ${willChangeDe(marcadoConMovimientoReducido()).length} \`will-change\`— y dejó el estado imposible aparte, como \`marcadoAnimadoConPreferenciaForzada()\`, declarado como control y no como respuesta`,
})

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · EL FOCO — qué regla lo pinta, y sobre qué superficie cae cada parada')

console.log('  regla única, en `theme-develop.css`: `[data-v3] :focus-visible { outline: var(--foco-grosor) solid')
console.log('  var(--color-foco); outline-offset: var(--foco-desplazamiento) }`, y `--color-foco` ES `var(--color-tinta)`,')
console.log('  así que `[data-seccion="invertida"]` lo da vuelta sin mencionarlo.')
const CAIDAS: readonly CaidaDelAnillo[] = [
  { paradas: '1–5', donde: 'la pastilla, flotando sobre una sección clara', anillo: COLOR.tintaClara, sobre: COLOR.papel },
  { paradas: '1–5', donde: 'la pastilla, flotando sobre una invertida (superficie translúcida al 0,6 encima del oscuro)', anillo: COLOR.tintaClara, sobre: componer(COLOR.papel, COLOR.oscuro, ALFA_CASI) },
  { paradas: '6', donde: 'el CTA del Hero — `papel-transparente`', anillo: COLOR.tintaClara, sobre: null },
  { paradas: '7–15', donde: 'el CTA, los 7 enlaces del pie y el campo del Cierre — `oscuro-opaco`', anillo: COLOR.tintaInvertida, sobre: COLOR.oscuro },
]
imprimirAnillos(CAIDAS)
afirmarIgual(anillosFlojos(CAIDAS), [], 'las 15 paradas reciben un anillo de ≥3:1 contra su superficie — el mínimo de un componente de interfaz')
console.log('  sobre la escena el anillo es la MISMA tinta que el texto, así que hereda las cifras de OTRO instrumento:')
for (const c of CONTRASTE_CONTRA_LA_ESCENA) console.log(`     ${c.seccion}: ${c.razon.toFixed(2)}:1 — ${c.instrumento}`)
console.log(`  ⚠ HUECO declarado del sprint («${HUECOS[2].nombre}»): ${HUECOS[2].porQue}.`)
console.log(`     Lo cerraría: ${HUECOS[2].queLoCerraria}. Este frente NO afirma que el anillo se vea; afirma su contraste.`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · EL CONTRASTE DE TEXTO EN LAS OCHO — con las opacas que nadie había medido')

afirmarIgual(superficiesDelDocumento(QUIETA).length, 8, 'las ocho secciones declaran su superficie en el propio marcado')
const CAJAS = cajasDeColor(QUIETA)
imprimirContraste(CAJAS)
console.log('  ── las dos transparentes NO se recalculan acá: su fondo es la escena, no un token')
for (const c of CONTRASTE_CONTRA_LA_ESCENA) console.log(`     ${c.seccion}: ${c.razon.toFixed(2)}:1 — ${c.instrumento}`)
afirmarIgual(
  [...new Set(CAJAS.filter((c) => c.fondo === null).map((c) => `${c.tinta.token}@${c.tinta.alfa}`))],
  ['--color-tinta@1'],
  '  y la cita vale para TODO su texto: las dos transparentes usan una sola tinta, plena y sin alfa',
)
afirmarIgual(
  [...new Set(CAJAS.filter((c) => c.razon !== null && c.razon < AA).map((c) => `${c.seccion}/${c.tinta.token}`))],
  ['cierre/--color-tinta-tenue'],
  'el inventario de fallas de AA es EXACTAMENTE uno, y es el que se publica abajo',
)
afirmar(!loRedefineLaInvertida('--color-tinta-tenue'), 'y la causa: `[data-seccion="invertida"]` NO redefine `--color-tinta-tenue`')
afirmar(!loRedefineLaInvertida('--color-tinta-media'), '  ni `--color-tinta-media` — el mismo defecto está armado y todavía sin disparar')
afirmar(loRedefineLaInvertida('--color-tinta'), '  sí redefine `--color-tinta`, que es lo que hace que todo el resto pase')
publicar({
  n: 11, gravedad: 'alta', clase: 'defecto',
  dueño: 'la sección Cierre — el `<p id="cierre-novedades-ayuda">` del formulario de novedades',
  que: `\`text-tinta-tenue\` (${COLOR.tenue}) adentro de \`oscuro-opaco\` da ${razon(COLOR.tenue, COLOR.oscuro).toFixed(2)}:1 sobre ${COLOR.oscuro}: no llega a AA (4,5) ni siquiera a 3:1. Y es el texto que explica por qué el envío está deshabilitado — el único que aclara un control apagado`,
})
publicar({
  n: 12, gravedad: 'media', clase: 'defecto',
  dueño: '`theme-develop.css` — el bloque `[data-seccion="invertida"]`',
  que: `la trampa que produjo el 11: el bloque invertido redefine \`--color-tinta\` pero NO \`--color-tinta-media\` ni \`--color-tinta-tenue\`. Hoy las 15 \`text-tinta-media\` caen todas en secciones claras; el día que una sección con tinta media pase a invertida da ${razon(COLOR.media, COLOR.oscuro).toFixed(2)}:1 y nada se queja`,
})
console.log(`  el contraejemplo, y es del mismo tema: la MISMA tinta al ${ALFA_CASI} (\`opacity-casi\`) funciona en los dos sentidos —`)
console.log(`  ${razon(componer(COLOR.tintaClara, COLOR.papel, ALFA_CASI), COLOR.papel).toFixed(2)}:1 sobre el papel y ${razon(componer(COLOR.tintaInvertida, COLOR.oscuro, ALFA_CASI), COLOR.oscuro).toFixed(2)}:1 sobre la invertida — porque cuelga de \`--color-tinta\`, que sí se da vuelta.`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('11 · EL INVENTARIO, ordenado por gravedad')
imprimirInventario()
afirmarIgual(publicados().length, 12, 'se publicaron 12 hallazgos')
afirmarIgual(publicados().filter((p) => p.clase === 'decisión').length, 1, '  once defectos y UNA decisión de contenido, separadas y no mezcladas')
afirmarIgual(publicados().filter((p) => p.gravedad === 'alta').length, 3, '  tres de gravedad alta: Servicios (3), el `contentinfo` (5) y la tinta tenue del Cierre (11)')

cerrar('s10-acceso.invariant')
