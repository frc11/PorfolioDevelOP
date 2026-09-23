/**
 * INVARIANTE — SECCIÓN 06 · TU PANEL, la galería (SPRINT PANEL).
 *
 * Renderiza la sección REAL a HTML en sus dos ramas —`anima={false}` y
 * `anima={true}`— y afirma sobre el marcado que sale; las cuentas de la galería
 * (parallax, vuelo de la ampliación, entrada de «Y más…») se afirman contra las
 * funciones puras que usan los componentes, con lo medido en nk como vara.
 *
 * Cada detector corre además contra una entrada rota (control positivo).
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { LIMITE_DE_LINEAS_DE_CODIGO, contarLineasDeCodigo } from '../../_lib/__tests__/s8-largos'
import {
  apagadosDeFoco,
  arbitrariosSinVar,
  funcionesDeColorEncontradas,
  hexEncontrados,
  literalesConUnidad,
  quitarComentarios,
} from '../../_lib/__tests__/s3-escaneo'
import { ATRIBUTO_PIEZAS } from '../../_lib/motion/lineas'
import { INVENTOS } from '../_contrato/inventado'
import { GESTOS_POR_TIEMPO, USOS_DECLARADOS } from '../_contrato/motion'
import { seccionDe } from '../_contrato/forma'
import { escanearLoReal, marcadoresRealesEn, preciosEncontrados, textoVisible } from '../_contrato/escaneo'
import { marcar } from '../_invariantes/render'
import { codigoDeLaSeccion, leer } from '../_invariantes/soporte'
import { CONTENIDO_PROHIBIDO_DE_CONTROL, aperturasDe, cuentaDe, focalizablesDe, patronesNombrados, textoAccesible } from './deteccion'
import { CAPTURA, ID, NOMBRE, PUNTOS_DE_Y_MAS, TARJETAS, TITULAR, Y_MAS } from './contenido'
import { ALTO_DE_LA_IMAGEN, corrimientoDelParallax, lugarDe } from './geometria'
import { arranqueDelPunto, curvaComoLinear, salidaExponencial } from './entrada'
import { cajaAmpliada, transformadaEntre, vecino } from './vuelo'
import { PIEZAS_POR_PATRON, TuPanel } from './TuPanel'

const montada = <TuPanel seccion={seccionDe(ID)} />
const QUIETO = marcar(montada, { anima: false })
const ANIMADO = marcar(montada, { anima: true })

const ARCHIVOS = codigoDeLaSeccion(ID)
const CODIGO = ARCHIVOS.map((a) => leer(a)).join('\n')
const fuenteDe = (nombre: string): string => leer(ARCHIVOS.find((a) => a.endsWith(`/${nombre}`)) ?? '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El contenido de la instrucción, entero y en orden, en las dos ramas')

const ORDEN = [
  'Revisá cada conversación de tu chatbot',
  'Recibí los leads ya calificados que consultaron tu página',
  'Creá tickets para que cambiemos lo que necesites',
  'Chateá con nosotros directo, por lo que sea',
  'Pedí servicios nuevos a medida que los sumamos',
  'Mirá el resumen de tu proyecto',
  'Seguí tus resultados',
  'Configurá cómo responde tu chatbot',
]
afirmarIgual(TARJETAS.map((t) => t.titulo), ORDEN, 'las ocho tarjetas, con el texto y el orden de la instrucción')
afirmarIgual(TARJETAS.map((t) => t.etiqueta), ['Chatbot', 'Leads', 'Soporte', 'Soporte', 'Servicios', 'Proyecto', 'Resultados', 'Chatbot'], '  y sus etiquetas')

const TEXTOS = [TITULAR, ...TARJETAS.map((t) => t.titulo), ...TARJETAS.map((t) => t.etiqueta), Y_MAS]
for (const [rama, html] of [['sin coreografía', QUIETO], ['con coreografía', ANIMADO]] as const) {
  const visible = textoVisible(html)
  afirmarIgual(TEXTOS.filter((t) => !visible.includes(t)), [], `${rama}: los ${TEXTOS.length} textos están enteros (titular, 8 títulos, 8 etiquetas y «Y más»)`)
  afirmarIgual(cuentaDe(visible.slice(visible.indexOf(Y_MAS)), /\./g), PUNTOS_DE_Y_MAS, `${rama}:   con sus ${PUNTOS_DE_Y_MAS} puntos detrás`)
  const posiciones = ORDEN.map((t) => visible.indexOf(t))
  afirmar(posiciones.every((p, i) => i === 0 || p > posiciones[i - 1]), `${rama}: y aparecen en el orden de la instrucción`)
}
afirmar(!textoVisible(QUIETO).includes(NOMBRE), `el rótulo de sección («${NOMBRE}») sigue sin leerse (B12)`)
afirmar(!textoVisible(QUIETO).includes('Qué se hace ahí adentro') && !textoVisible(QUIETO).includes('Quién entra'), 'y los tres textos y la lista del diseño anterior se fueron')
controlPositivo('el comparador de orden ve dos tarjetas cambiadas', [5, 3], (p) => p.every((x, i) => i === 0 || x > p[i - 1]))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Abajo de 1025 no se monta coreografía, y el texto es el mismo en las dos ramas')

afirmarIgual(cuentaDe(QUIETO, /transform:/g), 0, 'sin coreografía no se escribe una sola transformada en el marcado')
afirmar(!QUIETO.includes(ATRIBUTO_PIEZAS), '  ni corre el divisor de líneas del titular')
afirmar(ANIMADO.includes(ATRIBUTO_PIEZAS), 'CONTROL: con coreografía el divisor SÍ se monta sobre el titular')
afirmar(textoAccesible(QUIETO) === textoAccesible(ANIMADO), 'el texto accesible de las dos ramas es idéntico', `${textoAccesible(QUIETO).length} caracteres`)
controlPositivo('el comparador ve una rama que dice algo que la otra no', { a: '<p>uno dos</p>', b: '<p>uno dos tres</p>' }, (par) => textoAccesible(par.a) === textoAccesible(par.b))

const estilos = [...QUIETO.matchAll(/style="([^"]*)"/g)].map((m) => m[1])
afirmar(estilos.every((e) => e === 'color:transparent' || e.startsWith('min-height')), `los ${estilos.length} estilos inline son de next/image (color:transparent) o el min-height de la tabla: ninguno a mano`)
afirmarIgual(cuentaDe(CODIGO, /style=\{\{/g), 0, '  y ningún archivo de la sección escribe `style={{`')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Cero cifras inventadas y cero capturas falsas')

const visible = textoVisible(ANIMADO)
afirmarIgual(escanearLoReal(visible), [], `cero hallazgos sobre ${visible.length} caracteres de texto renderizado`)
afirmarIgual(preciosEncontrados(visible), [], '  y cero formas de precio')
afirmarIgual(marcadoresRealesEn(visible), [CAPTURA.marcador], `  el único marcador en pantalla es el de la captura que falta: ${CAPTURA.marcador}`)
afirmarIgual(cuentaDe(QUIETO, /\[CAPTURA DEL PANEL\]/g), TARJETAS.filter((t) => t.imagen === CAPTURA.fuente).length, '  uno por cada tarjeta que sigue con el placeholder')
afirmar(TARJETAS.every((t) => t.imagen !== CAPTURA.fuente || t.alt === ''), 'una tarjeta con el placeholder no describe una pantalla que no existe: `alt` vacío')
afirmar(!('panelFechas' in INVENTOS) && !('panelComparacion' in INVENTOS), 'las dos casillas de INVENTOS del panel viejo se fueron con él', `quedan ${Object.keys(INVENTOS).length}`)
afirmarIgual(cuentaDe(quitarComentarios(CODIGO), /conLlave\(/g), 0, '  y la sección no consume ninguna otra')
controlPositivo('el escáner ve la frase prohibida', CONTENIDO_PROHIBIDO_DE_CONTROL, (t) => escanearLoReal(t).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Cero valores fuera de los tokens, archivo por archivo')

console.log(`  ${ARCHIVOS.length} archivos de producto: ${ARCHIVOS.map((a) => a.split('/').pop()).join(' · ')}`)
for (const archivo of ARCHIVOS) {
  const fuente = quitarComentarios(leer(archivo))
  const corto = archivo.split('/').pop() ?? archivo
  afirmarIgual(hexEncontrados(fuente), [], `${corto}: cero colores a mano`)
  afirmarIgual(funcionesDeColorEncontradas(fuente), [], `${corto}: cero funciones de color`)
  afirmarIgual(literalesConUnidad(fuente), [], `${corto}: cero literales con unidad`)
  afirmarIgual(arbitrariosSinVar(fuente), [], `${corto}: toda clase arbitraria consume var(--token)`)
  afirmar(contarLineasDeCodigo(leer(archivo)) <= LIMITE_DE_LINEAS_DE_CODIGO, `${corto}: no pasa las 300 líneas de código`)
}
controlPositivo('el detector de literales con unidad no está ciego', 'const alto = "44px"', (t) => literalesConUnidad(t).length === 0)
controlPositivo('ni el de arbitrarios sin token', 'className="gap-[16px]"', (t) => arbitrariosSinVar(t).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Foco y hover — cada tarjeta es un botón, y el hover tiene su gemelo de foco')

const TARJETA = quitarComentarios(fuenteDe('Tarjeta.tsx'))
for (const [rama, html] of [['sin coreografía', QUIETO], ['con coreografía', ANIMADO]] as const) {
  afirmarIgual(focalizablesDe(html).length, TARJETAS.length, `${rama}: ${TARJETAS.length} focalizables, uno por tarjeta`)
  afirmarIgual(cuentaDe(html, /aria-haspopup="dialog"/g), TARJETAS.length, `${rama}: y cada uno avisa que abre un diálogo`)
}
const hovers = [...TARJETA.matchAll(/group-hover:([\w-]+(?:\[[^\]]+\])?)/g)].map((m) => m[1]).sort()
const focos = [...TARJETA.matchAll(/group-focus-visible:([\w-]+(?:\[[^\]]+\])?)/g)].map((m) => m[1]).sort()
afirmarIgual(focos, hovers, `los ${hovers.length} cambios de hover tienen su gemelo en focus-visible, clase por clase`)
afirmarIgual([...TARJETA.matchAll(/(?<!group-)hover:/g)].length, 0, '  y no hay un `hover:` suelto: todo cuelga del grupo')
afirmar(TARJETA.includes('group-hover:scale-105'), 'la imagen escala 1,05 (nk: scale(1.05))')
afirmar(/data-parte="marco"[^>]*overflow-hidden/.test(TARJETA) && !/data-parte="marco"[^>]*(scale|translate)/.test(TARJETA), '  adentro de un marco que recorta y no se transforma')
afirmarIgual(ARCHIVOS.flatMap((a) => apagadosDeFoco(quitarComentarios(leer(a)))), [], `ninguno de los ${ARCHIVOS.length} archivos apaga el anillo de foco`)
controlPositivo('el comparador de gemelos ve un hover sin foco', { h: ['scale-105', 'opacity-100'], f: ['scale-105'] }, (x) => JSON.stringify(x.h) === JSON.stringify(x.f))

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · La grilla replica el ritmo de nk')

for (const [rama, html] of [['sin coreografía', QUIETO], ['con coreografía', ANIMADO]] as const) {
  afirmarIgual(aperturasDe(html, 'ul'), 1, `${rama}: la galería es UNA lista`)
  afirmarIgual(aperturasDe(html, 'li'), TARJETAS.length, `${rama}: con un <li> por tarjeta`)
}
afirmarIgual(TARJETAS.map((_, i) => lugarDe(i).columnas), [3, 2, 1, 1, 3, 1, 2, 3], 'columnas: grande · mediana + chica + chica · grande · chica + mediana · grande (nth-child 7n+k)')
afirmar(lugarDe(3).clase.includes('escritorio:col-start-3') && lugarDe(3).clase.includes('-top-[var(--spacing-20)]'), 'la cuarta va a la tercera columna y sube 5 rem, la columna desfasada')
afirmarIgual(TARJETAS.map((_, i) => lugarDe(i).nivel), ['titulo-m', 'titulo-m', 'titulo-s', 'titulo-s', 'titulo-m', 'titulo-m', 'titulo-m', 'titulo-m'], 'títulos de 32 px salvo las dos chicas del bloque M + S + S')

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · El parallax reproduce lo medido en nk y nunca muestra el borde')

const nk = corrimientoDelParallax(683, 571, 900)
afirmar(Math.abs(nk - -164.261) < 1, 'marco de 571 a 683 px del tope, viewport de 900: nk escribe −164,261', nk.toFixed(3))
afirmar(Math.abs(corrimientoDelParallax(883, 571, 900) - -0.3 * 571) < 1e-9, '  a 883 nk escribe −194,556 y deja 23 px de borde fuera de pantalla: acá se acota al sobrante')
const pendiente = corrimientoDelParallax(483, 571, 900) - corrimientoDelParallax(683, 571, 900)
afirmar(Math.abs(pendiente / 200 - 0.1515) < 0.001, '  y viaja 0,1515 px por px de scroll', (pendiente / 200).toFixed(4))
afirmar(Math.abs(corrimientoDelParallax(450 - 571 / 2, 571, 900) - -0.15 * 571) < 0.01, 'con el marco centrado, la imagen queda centrada (−15 % del marco)')
const barrido = Array.from({ length: 301 }, (_, k) => corrimientoDelParallax(-600 + k * 5, 571, 900))
afirmar(barrido.every((y) => y <= 0 && y >= -(ALTO_DE_LA_IMAGEN - 1) * 571), 'en 301 posiciones el corrimiento queda dentro del sobrante: el borde de la imagen no entra al marco')
controlPositivo('el barrido ve un corrimiento sin acotar', [10, -50], (ys) => ys.every((y) => y <= 0 && y >= -171.3))
const GALERIA = quitarComentarios(fuenteDe('Galeria.tsx'))
afirmarIgual(cuentaDe(GALERIA, /addEventListener\('scroll'/g), 1, 'UNA suscripción de scroll para las ocho tarjetas')
afirmarIgual(cuentaDe(quitarComentarios(CODIGO), /addEventListener\('scroll'/g), 1, '  y ninguna otra en toda la sección')
afirmar(/if \(!anima\) return/.test(GALERIA), '  que no se instala sin coreografía (abajo de 1025 o con movimiento reducido)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · La ampliación: elemento compartido, galería y diálogo accesible')

const caja = cajaAmpliada(1440, 900, 80, 80)
afirmar(Math.abs(caja.width / caja.height - 1.6) < 1e-9 && caja.left >= 80 && caja.top >= 80 && caja.left + caja.width <= 1360, 'la caja final es 16:10 y entra con el margen a los cuatro lados', `${caja.width.toFixed(1)} × ${caja.height.toFixed(1)}`)
afirmarIgual(transformadaEntre(caja, caja), 'translate(0px, 0px) scale(1, 1)', 'desde la caja final a sí misma: identidad')
afirmar(transformadaEntre({ left: 100, top: 200, width: 400, height: 250 }, caja).startsWith(`translate(${100 - caja.left}px`), '  y desde el marco arranca exactamente sobre él')
afirmarIgual([vecino(7, 1, 8), vecino(0, -1, 8)], [0, 7], 'las flechas dan la vuelta en los dos extremos')
const AMPLIACION = quitarComentarios(fuenteDe('Ampliacion.tsx'))
for (const [que, patron] of [
  ['role="dialog"', /role="dialog"/],
  ['aria-modal', /aria-modal="true"/],
  ['aria-labelledby', /aria-labelledby=/],
  ['Esc cierra', /'Escape'/],
  ['flechas ← →', /'ArrowRight'[\s\S]*'ArrowLeft'/],
  ['Tab da la vuelta adentro', /'Tab'/],
  ['la cruz visible', /aria-label="Cerrar"/],
  ['click afuera (el velo)', /data-parte="velo" onClick=\{cerrar\}/],
  ['fundido con movimiento reducido', /!reducido/],
] as const) {
  afirmar(patron.test(AMPLIACION), `el diálogo tiene ${que}`)
}
afirmar(/botones\.current\[abierta\]\?\.focus/.test(GALERIA), '  y el foco vuelve a la tarjeta abierta al cerrar')

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · «Y más…» — expo.out de derecha a izquierda, una vez, y los puntos en fila')

afirmarIgual([salidaExponencial(0), salidaExponencial(1)], [0, 1], 'la curva va de 0 a 1')
afirmar(salidaExponencial(0.25) > 0.8, 'primero rápido: más del 80 % del camino en el primer cuarto del tiempo', salidaExponencial(0.25).toFixed(4))
afirmar(curvaComoLinear(salidaExponencial).startsWith('linear(0.0000, ') && curvaComoLinear(salidaExponencial).endsWith(', 1.0000)'), 'y viaja a la Web Animations API como `linear(…)` muestreada')
afirmar([0, 1, 2].map((k) => arranqueDelPunto(k, 700, 300)).every((t, k, a) => t >= 700 && (k === 0 || t > a[k - 1])), 'los puntos arrancan después de la frase, uno detrás del otro')
const YMAS = quitarComentarios(fuenteDe('YMas.tsx'))
afirmar(YMAS.includes('observador.disconnect()') && YMAS.includes('if (!anima'), 'una sola vez (el observador se desconecta), y quieta sin coreografía')
afirmar(GESTOS_POR_TIEMPO.some((g) => g.seccion === ID && g.curva === 'expo.out'), 'declarada en el contrato como gesto por tiempo (no hay patrón del catálogo que lo haga)')
controlPositivo('el control de la curva ve una lineal', (t: number) => t, (c) => c(0.25) > 0.8)

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · Los patrones que declaro son los que consumo')

afirmarIgual(patronesNombrados(CODIGO), ['P1'], 'la sección nombra sólo P1 (el titular)')
afirmarIgual(Object.keys(PIEZAS_POR_PATRON), ['P1'], '  y la tabla de piezas declara el mismo')
afirmarIgual(USOS_DECLARADOS.filter((u) => u.seccion === ID).map((u) => u.patron), ['P1'], '  y el contrato también: P2 y P4 se fueron con los bloques y la lista')
controlPositivo('el buscador ve un patrón que no uso', 'const x = <B patron="P5" />', (c) => patronesNombrados(c).length === 0)

cerrar('s6-tu-panel.invariant')
