/**
 * INVARIANTE — SECCIÓN 06 · TU PANEL. [B6] La sección del Panel: el título que se pinta, tres módulos alternados con su
 * palabra fundida y el candado de la rueda, y el CTA a pantalla completa.
 *
 * Renderiza la sección REAL a HTML en sus dos ramas —sin y con coreografía— y afirma sobre el marcado; el pintado, el
 * candado, la geometría (el alto contra la tabla, la escala de las maquetas, la posición del grupo) y el tramo de la escena
 * se afirman contra las funciones puras que usan los componentes. Lo que depende del navegador (dónde termina de pintarse
 * en el píxel, el eje del grupo medido, la rueda de verdad sobre un módulo, el AA con los colores reales) lo mide el banco
 * `scripts-carga/panel-b6.ts`. Cada detector corre además contra una entrada rota (control positivo).
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { RAIZ } from '../../_lib/__tests__/s3-archivos'
import { apagadosDeFoco, arbitrariosSinVar, funcionesDeColorEncontradas, hexEncontrados, literalesConUnidad, quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { FUENTE_DISPLAY, anchoDeTexto, caracteresSinGlifo } from '../../_lib/__tests__/s10-avance'
import { leerAvancesDe } from '../../_lib/__tests__/s10-woff2'
import { LIMITE_DE_LINEAS_DE_CODIGO, contarLineasDeCodigo } from '../../_lib/__tests__/s8-largos'
import { centradoDebajoDeLaBarra } from '../../_componentes/destinosDelViaje'
import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../_lib/navegacion'
import { TRAMO_ESTIRADO, anotarTramo, medidaSinElEstiramiento } from '../../_lib/escena/tramoEstirado'
import { ANCHO_CON_BARRA } from '../../_panel-vivo/DemoDelPanel'
import { escanearLoReal, marcadoresRealesEn, preciosEncontrados, textoVisible } from '../_contrato/escaneo'
import { pantallasDe, seccionDe } from '../_contrato/forma'
import { GESTOS_POR_TIEMPO, USOS_DECLARADOS } from '../_contrato/motion'
import { marcar } from '../_invariantes/render'
import { codigoDeLaSeccion, leer } from '../_invariantes/soporte'
import { GRUPO_POR_DEFECTO, PALABRA_POR_DEFECTO, palabraEnElTelefono, posicionDelGrupo } from './banderas'
import { CANDADO_INICIAL, laRuedaEsDeAdentro, siguienteCandado, type EstadoDelCandado, type EventoDelCandado } from './candado'
import { CARTEL, CTA, ID, NEWSLETTER, TARJETAS, TITULO, textoDe } from './contenido'
import { CONTENIDO_PROHIBIDO_DE_CONTROL, cuentaDe, focalizablesDe, patronesNombrados, sinAriaHidden, textoAccesible } from './deteccion'
import { ALFA_DE_LA_PALABRA, CLASE_DE_LA_PALABRA, CLASE_DE_LA_POSICION, LADOS, MODULO, PANTALLA_DEL_MODULO, RITMO, TIPO, altoDelModulo, altoNaturalEnEscritorio, altoViejoAngosto, ALTOS_VIEJOS_MEDIDOS, escalaDeLaDemo, tamanoDelTitulo } from './geometria'
import { FIN_DEL_PINTADO, avanceDeLaPalabra, avanceDelPintado } from './pintado'
import { tramoDelPanel } from './tramo'
import { TuPanel } from './TuPanel'

const SECCION = seccionDe(ID)
const QUIETO = marcar(<TuPanel seccion={SECCION} />, { anima: false })
const ANIMADO = marcar(<TuPanel seccion={SECCION} />, { anima: true })
const ARCHIVOS = codigoDeLaSeccion(ID)
const CODIGO = ARCHIVOS.map((a) => leer(a)).join('\n')
const fuenteDe = (nombre: string): string => quitarComentarios(leer(ARCHIVOS.find((a) => a.endsWith(`/${nombre}`)) ?? ''))
const V3 = 'src/app/v3'
const delV3 = (ruta: string): string => quitarComentarios(readFileSync(path.join(RAIZ, V3, ruta), 'utf8'))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El contenido, entero y en orden, en las dos ramas')

afirmarIgual(textoDe(TITULO), 'El panel donde controlás TODO', 'el título: «El panel donde controlás» y, en su renglón, «TODO»')
afirmar(TITULO.length === 2 && TITULO[1].destacado === true && TITULO[1].palabras.join() === 'TODO', '  «TODO» va solo en el segundo renglón, destacado (en cursiva y subrayado)')
afirmarIgual(TARJETAS.map((t) => [t.palabra, t.titulo]), [['Clientes', 'Cada cliente, en un solo lugar'], ['Resultados', 'Resumen del mes'], ['Chatbot', 'Enseñale a tu chatbot cómo responder']], 'los tres módulos, en el orden pedido, con su palabra fundida y su título')
afirmarIgual(TARJETAS.map((t) => t.demo), ['leads', 'resultados', 'informacion'], '  y cada uno es la maqueta que le corresponde (los leads, las métricas, lo que sabe el bot)')
afirmar(TARJETAS.every((t) => t.descripcion.length >= 180), 'las descripciones son más largas que las de antes (los títulos de las features, de 20 a 57 caracteres)', TARJETAS.map((t) => String(t.descripcion.length)).join(' · '))
const ORDEN = [textoDe(TITULO), ...TARJETAS.flatMap((t) => [t.titulo, t.descripcion]), textoDe(CTA.titular), CTA.bajada, CTA.boton, NEWSLETTER.titulo, NEWSLETTER.rotulo]
for (const [rama, html] of [['sin coreografía', QUIETO], ['con coreografía', ANIMADO]] as const) {
  const visible = textoAccesible(html).replace(/\s+/g, ' ')
  afirmarIgual(ORDEN.filter((t) => !visible.includes(t)), [], `${rama}: los ${ORDEN.length} textos se anuncian enteros`)
  const posiciones = ORDEN.map((t) => visible.indexOf(t))
  afirmar(posiciones.every((p, i) => i === 0 || p > posiciones[i - 1]), `${rama}: se leen en orden — el título, los tres módulos y el CTA`)
}
afirmarIgual(cuentaDe(QUIETO, /data-pieza="marca-de-seccion"/g), 0, 'sin el puntito de la marca: la sección no monta `MarcaDeSeccion`')
controlPositivo('el comparador de orden ve dos textos cambiados', [5, 3], (p: readonly number[]) => p.every((x, i) => i === 0 || x > p[i - 1]))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Sin coreografía no se escribe una transformada, y el texto es el mismo')

afirmarIgual(cuentaDe(QUIETO, /transform:/g), 0, 'sin coreografía, cero transformadas en el marcado')
afirmar(cuentaDe(ANIMADO, /transform:/g) > 0, 'CONTROL: con coreografía las llegadas sí escriben la suya', `${String(cuentaDe(ANIMADO, /transform:/g))} transformadas`)
afirmar(textoAccesible(QUIETO) === textoAccesible(ANIMADO), 'el texto accesible de las dos ramas es idéntico', `${String(textoAccesible(QUIETO).length)} caracteres`)
const estilos = [...QUIETO.matchAll(/style="([^"]*)"/g)].map((m) => m[1])
const DEL_DATO = /^(color:transparent|min-height:[^;]*|opacity:0\.0285|(--[a-z-]+:[^;]*;?)+)$/
afirmarIgual(estilos.filter((e) => !DEL_DATO.test(e)), [], `los ${String(estilos.length)} estilos en línea salen del dato (variables de \`geometria.ts\`, el alto de la tabla, el alfa de la palabra): ninguno a mano`)
controlPositivo('el filtro de estilos ve uno escrito a mano', ['margin-top:12px'], (l: readonly string[]) => l.every((e) => DEL_DATO.test(e)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Cero cifras inventadas, cero precios, ninguna captura falsa')

const visible = textoVisible(ANIMADO)
afirmarIgual(escanearLoReal(visible), [], `cero hallazgos sobre ${String(visible.length)} caracteres de texto renderizado`)
afirmarIgual(preciosEncontrados(visible), [], '  y cero formas de precio')
afirmarIgual(marcadoresRealesEn(visible), [], '  ni un marcador en pantalla')
afirmar(TARJETAS.every((t) => t.imagen.endsWith('.webp') && t.alt.length > 40), '  cada módulo lleva de respaldo su captura real, con un alt que describe lo que se ve')
controlPositivo('el escáner ve la frase prohibida', CONTENIDO_PROHIBIDO_DE_CONTROL, (t: string) => escanearLoReal(t).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Cero valores fuera de los tokens, archivo por archivo')

console.log(`  ${String(ARCHIVOS.length)} archivos de producto: ${ARCHIVOS.map((a) => a.split('/').pop()).join(' · ')}`)
const COMPARTIDO = `${V3}/_secciones/_contrato/TituloQueSube.tsx`
for (const archivo of [...ARCHIVOS, COMPARTIDO]) {
  const fuente = quitarComentarios(leer(archivo))
  const corto = archivo.split('/').pop() ?? archivo
  afirmar(hexEncontrados(fuente).length + funcionesDeColorEncontradas(fuente).length + literalesConUnidad(fuente).length + arbitrariosSinVar(fuente).length === 0, `${corto}: cero colores a mano, cero literales con unidad y toda clase arbitraria consume var(--token)`, [...hexEncontrados(fuente), ...literalesConUnidad(fuente), ...arbitrariosSinVar(fuente)].join(' ') || 'limpio')
  afirmar(contarLineasDeCodigo(leer(archivo)) <= LIMITE_DE_LINEAS_DE_CODIGO && apagadosDeFoco(fuente).length === 0, `${corto}: no pasa las 300 líneas de código y no apaga el foco`)
}
controlPositivo('el detector de arbitrarios sin token no está ciego', 'className="gap-[16px]"', (t: string) => arbitrariosSinVar(t).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El título se pinta palabra por palabra y termina con su centro en la mitad de la pantalla')

/** El centro (fracción del alto, desde arriba) en el que el avance llega a 1, barriendo de abajo hacia arriba. */
const finDelPintado = (avance: (c: number, a: number) => number, alto: number): number => {
  for (let c = alto; c >= -alto; c -= 1) if (avance(c, alto) >= 1) return c / alto
  return Number.NaN
}
for (const alto of [900, 768, 1080, 844]) {
  const fin = finDelPintado(avanceDelPintado, alto)
  afirmar(fin >= 0.45 && fin <= 0.55, `a ${String(alto)} de alto termina de pintarse con el centro del título al ${(fin * 100).toFixed(1)} % (entre 45 y 55)`)
}
afirmar(FIN_DEL_PINTADO === 0.5 && avanceDelPintado(900, 900) === 0 && avanceDelPintado(1200, 900) === 0, '  y arranca recién con el centro asomando por abajo (a medias a la vista)')
controlPositivo('  el detector VE un pintado que termina arriba (el centro al 15 %)', (c: number, a: number) => Math.min(1, Math.max(0, (a - c) / (a * 0.85))), (f: (c: number, a: number) => number) => {
  const fin = finDelPintado(f, 900)
  return fin >= 0.45 && fin <= 0.55
})
/**
 * Llegando con «Panel» de la barra: el viaje centra la cabecera (el título solo) debajo de la barra (su despeje, el
 * `scroll-padding-top`: 24 + 2 × 12 + 15 × 1,6 = 72 px), sin pasar del tope de la sección. ¿Dónde queda el centro del título?
 */
const DESPEJE = 24 + 2 * 12 + 15 * 1.6
const centroAlViajar = (ancho: number, alto: number, aire: number): number => {
  const h = 2 * TIPO.interlineado * tamanoDelTitulo(ancho, alto)
  return aire + h / 2 - centradoDebajoDeLaBarra(0, aire, aire + h, alto, DESPEJE)
}
for (const [ancho, alto, aire] of [[1376, 900, 0.3 * 900], [960, 768, 0.3 * 768], [1856, 1080, 0.3 * 1080], [704, 1024, 80], [326, 844, 80]] as const) {
  const c = centroAlViajar(ancho, alto, aire)
  afirmar(avanceDelPintado(c, alto) === 1, `${String(ancho)} × ${String(alto)}: con el viaje del menú el título llega con su centro al ${((c / alto) * 100).toFixed(1)} %: pintado entero`)
}
controlPositivo('  el detector VE un título que llega por debajo de la mitad (sin el aire de arriba, centrado en todo el cuadro)', 0.62 * 900, (c: number) => avanceDelPintado(c, 900) === 1)
const n = textoDe(TITULO).split(' ').length
const enOrden = (f: typeof avanceDeLaPalabra): boolean => Array.from({ length: 1001 }, (_, k) => k / 1000).every((p) => Array.from({ length: n - 1 }, (_, i) => f(p, i + 1, n) === 0 || f(p, i, n) === 1).every(Boolean))
afirmar(enOrden(avanceDeLaPalabra) && avanceDeLaPalabra(1, n - 1, n) === 1 && avanceDeLaPalabra(0, 0, n) === 0, `las ${String(n)} palabras se pintan en orden: ninguna arranca antes de que termine la anterior`)
controlPositivo('  el detector VE todas a la vez', ((p: number) => p) as typeof avanceDeLaPalabra, enOrden)
const H2 = /<h2[^>]*data-pieza="titulo-que-se-pinta"[^>]*>[\s\S]*?<\/h2>/.exec(QUIETO)?.[0] ?? ''
afirmar(cuentaDe(H2, /data-palabra=""/g) === n && /id="titular-tu-panel"/.test(H2), `el h2 lleva sus ${String(n)} palabras como piezas y nombra la sección`)
afirmar(/class="[^"]*\bitalic\b[^"]*"[^>]*>TODO<span aria-hidden="true" data-parte="subrayado"/.test(H2) && /data-parte="subrayado" class="[^"]*\borigin-left\b[^"]*\bscale-x-\[var\(--pintado,1\)\]/.test(H2), '  «TODO» en cursiva, con su subrayado que crece desde la izquierda con SU pintado (la misma variable)')
afirmar(!/--pintado:/.test(QUIETO), '  el HTML servido no trae el pintado: sin JS y con movimiento reducido el título sale en tinta plena (AA)')
afirmar(/font-display font-fuerte uppercase/.test(H2) && /text-\[length:min\(calc\(100cqw\/var\(--divisor-del-titulo\)\),var\(--tope-del-titulo\)\)\]/.test(H2), '  en la letra de las palabras fundidas (la cara de display, de mayúsculas) y del tamaño del ancho')
const caraDisplay = leerAvancesDe(FUENTE_DISPLAY)
const enMayusculas = [textoDe(TITULO), textoDe(CTA.titular), ...TARJETAS.map((t) => t.palabra)].map((t) => t.toUpperCase())
afirmarIgual(enMayusculas.flatMap((t) => caracteresSinGlifo(caraDisplay, t)), [], 'la cara de display tiene todas sus letras (con la Á): nada cae a otra fuente')
const RENGLON = TITULO[0].palabras.join(' ').toUpperCase()
/** La razón del ancho en la 700 que se pinta contra la instancia por defecto: 8,19 contra lo que da el binario para «TU NEGOCIO VENDIENDO». */
const A_LA_700 = 8.19 / anchoDeTexto(caraDisplay, 'TU NEGOCIO VENDIENDO', 1, -0.02)
for (const [ancho, alto] of [[1376, 900], [960, 768], [1856, 1080], [704, 1024], [326, 844]] as const) {
  const ocupa = (anchoDeTexto(caraDisplay, RENGLON, tamanoDelTitulo(ancho, alto), -0.02) * A_LA_700) / ancho
  afirmar(ocupa > 0.85 && ocupa < 1, `${String(ancho)} de ancho útil: «${RENGLON}» ocupa el ${(ocupa * 100).toFixed(1)} % del ancho — de lado a lado, sin partirse`)
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Tres módulos alternados, cada grupo en su eje, y la palabra fundida pálida')

afirmarIgual(LADOS, ['derecha', 'izquierda', 'derecha'], 'el 1 a la derecha, el 2 a la izquierda, el 3 a la derecha')
afirmarIgual([...QUIETO.matchAll(/data-pieza="fila-del-panel" data-lado="([a-z]+)"/g)].map((m) => m[1]), [...LADOS], '  y así salen en el marcado')
const grupos = [...QUIETO.matchAll(/data-pieza="grupo-del-modulo" class="([^"]*)"/g)].map((m) => m[1])
const enSuEje = (c: string): boolean => /\bitems-center\b/.test(c) && /\btext-center\b/.test(c) && /\bflex-col\b/.test(c)
afirmar(grupos.length === 3 && grupos.every(enSuEje), 'cada grupo apila la palabra, el título y la descripción centrados en su columna: el mismo eje vertical (el ±1 % lo mide el banco)')
controlPositivo('  el detector VE un grupo alineado a la izquierda', 'flex flex-col items-start', enSuEje)
afirmar(grupos.every((c, i) => c.includes(LADOS[i] === 'derecha' ? 'escritorio:col-start-1' : 'escritorio:col-start-2')), '  cada grupo, del lado opuesto a su módulo')
const TEMA = readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8')
const hex = (re: RegExp): number[] => [1, 3, 5].map((i) => Number.parseInt((re.exec(TEMA)?.[1] ?? '#000000').slice(i, i + 2), 16))
const lineal = (c: number): number => (c / 255 <= 0.03928 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4)
const luz = (rgb: readonly number[]): number => 0.2126 * lineal(rgb[0]) + 0.7152 * lineal(rgb[1]) + 0.0722 * lineal(rgb[2])
const PAPEL = hex(/--color-fondo:\s*(#[0-9A-Fa-f]{6})/)
const TINTA = hex(/--color-tinta:\s*(#[0-9A-Fa-f]{6})/)
const contraste = (luz(PAPEL) + 0.05) / (luz(PAPEL.map((p, i) => ALFA_DE_LA_PALABRA * TINTA[i] + (1 - ALFA_DE_LA_PALABRA) * p)) + 0.05)
afirmar(Math.abs(contraste - 1.0595) < 0.002, 'la palabra fundida queda pálida: la tinta a su alfa sobre el papel da el 1,0595:1 de las palabras del fondo de antes', `${contraste.toFixed(4)}:1`)
const palabras = [...QUIETO.matchAll(/<span aria-hidden="true" data-pieza="palabra-fundida"[^>]*>([^<]*)<\/span>/g)].map((m) => m[1])
afirmarIgual(palabras, TARJETAS.map((t) => t.palabra), '  las tres palabras van `aria-hidden`: no se anuncian')
afirmar(TARJETAS.every((t) => !textoAccesible(QUIETO).split(/\s+/).includes(t.palabra) || ORDEN.some((o) => o.includes(t.palabra))) && sinAriaHidden(QUIETO).length < QUIETO.length, '  y ninguna se anuncia sola (CONTROL: la poda de aria-hidden saca algo)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · `?grupo=final|union` y `?palabra-movil=union|debajo`')

afirmar(posicionDelGrupo(null) === GRUPO_POR_DEFECTO && GRUPO_POR_DEFECTO === 'final' && posicionDelGrupo('union') === 'union' && posicionDelGrupo('otra') === 'final', '`?grupo=`: final por defecto, union a pedido, cualquier otra cosa cae al defecto')
afirmar(palabraEnElTelefono(null) === PALABRA_POR_DEFECTO && PALABRA_POR_DEFECTO === 'union' && palabraEnElTelefono('debajo') === 'debajo', '`?palabra-movil=`: union por defecto, debajo a pedido')
/** Dónde queda el centro del grupo con el pie de su módulo en `pie` y un grupo de `alto` (svh): la cuenta de las dos clases. */
const centroDelGrupo = (clase: string, pie: number, alto: number): number => pie - alto / 2 + (/translate-y-\[calc\(50%\+var\(--medio-entre-filas\)\)\]/.test(clase) ? alto / 2 + RITMO.entreFilas / 2 : 0)
afirmar(centroDelGrupo(CLASE_DE_LA_POSICION.final, 60, 30) === 45 && /\bescritorio:self-end\b/.test(CLASE_DE_LA_POSICION.final), '  final: el pie del grupo, al del módulo')
afirmar(centroDelGrupo(CLASE_DE_LA_POSICION.union, 60, 30) === 60 + RITMO.entreFilas / 2, '  union: el centro del grupo, en la mitad del aire entre su módulo y el siguiente (el siguiente tramo mide lo mismo: también el del CTA)')
afirmar(/max-escritorio:absolute/.test(CLASE_DE_LA_PALABRA.debajo) && /max-escritorio:-z-10/.test(CLASE_DE_LA_PALABRA.debajo) && !/absolute/.test(CLASE_DE_LA_PALABRA.union), '  en el teléfono, debajo va detrás del título; union, en el flujo arriba de él')
afirmar(TIPO.divisorDeLaPalabraAngosta > TIPO.divisorDeLaPalabra, '  y en el teléfono la palabra es mucho más discreta (más chica)')
const ordenEnLaFila = /data-pieza="grupo-del-modulo"[\s\S]*?data-pieza="modulo-del-panel"/.test(/<li data-pieza="fila-del-panel"[\s\S]*?<\/li>/.exec(QUIETO)?.[0] ?? '')
afirmar(ordenEnLaFila, '  apilado, el grupo va antes que su módulo (la palabra, el título, la descripción y el módulo)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · Las maquetas, un poco más chicas, y la sección llena los 700svh de la tabla en todo escritorio (k = 1)')

const fmt = (x: number): string => x.toFixed(2)
for (const [ancho, alto] of [[1376, 900], [960, 768], [1856, 1080], [1216, 720], [1376, 700]] as const) {
  const e = escalaDeLaDemo(ancho, alto)
  afirmar(e >= 0.6 && e <= 1.05 && altoDelModulo(ancho, alto) <= (MODULO.altoMaximo / 100) * alto + 1e-9, `${String(ancho)} × ${String(alto)}: la maqueta a ${fmt(e)} (se lee) y el módulo a ${((altoDelModulo(ancho, alto) / alto) * 100).toFixed(0)} % del alto`)
}
afirmar(MODULO.ancho < 56 && MODULO.anchoAngosto <= 60 && PANTALLA_DEL_MODULO.ancho >= ANCHO_CON_BARRA, 'más chicas que las demos de antes (52 % contra 56 %), y con la barra lateral del panel')
const tabla = pantallasDe(SECCION)
let peor = Number.POSITIVE_INFINITY
for (let ancho = 1024; ancho <= 2560; ancho += 64) for (let alto = 600; alto <= 1440; alto += 40) peor = Math.min(peor, tabla - altoNaturalEnEscritorio(Math.min(ancho - 64, 1920), alto) / (alto / 100) / 100)
afirmar(peor >= 0, `de 1024 a 2560 y de 600 a 1440 de alto, lo fijo entra en los ${String(tabla * 100)}svh: el respiro llena lo que sobra y la sección mide la tabla`, `margen mínimo ${(peor * 100).toFixed(1)}svh`)
controlPositivo('  el chequeo VE módulos que no entran (al 80 % del ancho, sin tope)', 0.8, (f: number) => tabla - (3 * f * 1376 * 0.76 + 3 * 900 + 2 * 900) / 900 >= 0)
afirmar(/escritorio:min-h-\[var\(--alto-de-la-tabla\)\]/.test(QUIETO) && /--alto-de-la-tabla:700svh/.test(QUIETO) && /escritorio:grow/.test(QUIETO), '  el contenido toma el alto de la tabla (del dato) y el respiro es el que crece')

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · El candado: la rueda scrollea la página, el clic habilita adentro y salir lo bloquea')

const correr = (f: typeof siguienteCandado, eventos: readonly EventoDelCandado['tipo'][]): EstadoDelCandado => eventos.reduce((e, tipo) => f(e, { tipo } as EventoDelCandado), CANDADO_INICIAL)
afirmar(!CANDADO_INICIAL.libre && CANDADO_INICIAL.cartel === null, 'arranca bloqueado y sin cartel')
afirmarIgual(correr(siguienteCandado, ['rueda']), { libre: false, cartel: 'raton' }, '  la rueda encima: sigue bloqueado (scrollea la página) y aparece «Hacé clic…»')
afirmarIgual(correr(siguienteCandado, ['rueda', 'clic']), { libre: true, cartel: null }, '  el clic lo habilita y saca el cartel')
afirmarIgual(correr(siguienteCandado, ['rueda', 'clic', 'rueda']), { libre: true, cartel: null }, '  habilitado, la rueda es de adentro: sin cartel')
afirmarIgual(correr(siguienteCandado, ['clic', 'salida']), CANDADO_INICIAL, '  salir lo vuelve a bloquear')
afirmarIgual(correr(siguienteCandado, ['arrastre']), { libre: false, cartel: 'tactil' }, '  en el teléfono, el dedo: «Tocá…»; un toque es el mismo clic')
afirmarIgual(correr(siguienteCandado, ['rueda', 'olvido']), CANDADO_INICIAL, '  y el cartel se va solo')
// [B6 navegador] La página que se mueve saca el módulo de abajo del ratón (un `pointerleave`): el cartel no se corta, se va con su tiempo.
afirmarIgual(correr(siguienteCandado, ['rueda', 'salida']), { libre: false, cartel: 'raton' }, '  bloqueado, salir no corta el cartel (la página que se mueve saca el módulo de abajo del ratón): se va solo, con su fundido')
controlPositivo('  el detector VE el cartel cortado por la salida (lo que midió el banco: el cartel no se veía)', ((e: EstadoDelCandado, ev: EventoDelCandado) => (ev.tipo === 'salida' ? CANDADO_INICIAL : siguienteCandado(e, ev))) as typeof siguienteCandado, (f: typeof siguienteCandado) => correr(f, ['rueda', 'salida']).cartel === 'raton')
// [B6 navegador] Abierto, la rueda es del módulo: el contenido la absorbe si puede; si no, se frena (la página no se mueve).
const recorrido = (scrollTop: number): { scrollTop: number; clientHeight: number; scrollHeight: number } => ({ scrollTop, clientHeight: 400, scrollHeight: 454 })
const absorbeBien = (f: typeof laRuedaEsDeAdentro): boolean => f(recorrido(0), 100, true) && !f(recorrido(54), 100, true) && f(recorrido(54), -100, true) && !f(recorrido(0), -100, true) && !f(recorrido(0), 100, false) && !f(null, 100, true) && !f({ scrollTop: 0, clientHeight: 400, scrollHeight: 400 }, 100, true)
afirmar(absorbeBien(laRuedaEsDeAdentro), '  abierto, el contenido absorbe la rueda mientras tiene recorrido hacia donde va; en su borde, sin recorrido o fuera de él, no (y el módulo la frena)')
controlPositivo('  el detector VE la rueda de antes, que en el borde pasaba a la página', ((c: { scrollTop: number; clientHeight: number; scrollHeight: number } | null, d: number, a: boolean) => a && c !== null) as typeof laRuedaEsDeAdentro, absorbeBien)
const conCartel = siguienteCandado(CANDADO_INICIAL, { tipo: 'rueda' })
afirmar(siguienteCandado(conCartel, { tipo: 'rueda' }) === conCartel, '  cien ruedas de un gesto son el MISMO estado: nada se vuelve a dibujar')
controlPositivo('  el detector VE un candado que se abre con la rueda', ((e: EstadoDelCandado, ev: EventoDelCandado) => (ev.tipo === 'rueda' ? { libre: true, cartel: null } : siguienteCandado(e, ev))) as typeof siguienteCandado, (f: typeof siguienteCandado) => !correr(f, ['rueda']).libre)
afirmarIgual([CARTEL.raton, CARTEL.tactil], ['Hacé clic para scrollear acá', 'Tocá para scrollear acá'], 'el cartel dice lo que pidió Valentino (y su par del dedo)')
const TARJETA = fuenteDe('Tarjeta.tsx')
const conectado = (t: string): boolean => /onWheel=\{\(\) => avisar\('rueda'\)\}/.test(t) && /onTouchMove=\{\(\) => avisar\('arrastre'\)\}/.test(t) && /onClick=\{\(\) => cambiar\(\{ tipo: 'clic' \}\)\}/.test(t) && /if \(e\.pointerType !== 'touch'\) cambiar\(\{ tipo: 'salida' \}\)/.test(t) && /<RuedaDelModulo value=\{candado\.libre\}>/.test(t) && /document\.addEventListener\('pointerdown', afuera, true\)/.test(t) && /data-lenis-prevent=\{candado\.libre \? '' : undefined\}/.test(t) && /el\.addEventListener\('wheel', rueda, \{ passive: false \}\)/.test(t) && /if \(!laRuedaEsDeAdentro\(contenido, e\.deltaY, adentro\)\) e\.preventDefault\(\)/.test(t) && /overscroll-contain/.test(t)
afirmar(conectado(TARJETA), '  el módulo conecta la rueda, el dedo, el clic, la salida del ratón y el toque de afuera, y le pasa el candado a la maqueta; abierto, Lenis no toma la rueda (`data-lenis-prevent` en el marco), el módulo la frena donde el contenido no la absorbe y el dedo no arrastra la página desde el borde')
controlPositivo('  el detector VE el módulo abierto que dejaba pasar la rueda a la página (lo que midió el banco)', TARJETA.replace("data-lenis-prevent={candado.libre ? '' : undefined}", ''), conectado)
controlPositivo('  el detector VE un módulo sin la salida del ratón', TARJETA.replace("if (e.pointerType !== 'touch') cambiar({ tipo: 'salida' })", 'void e'), conectado)
const RUEDA = delV3('_panel-vivo/rueda.ts')
const MARCO = delV3('_panel-vivo/MarcoDelPanel.tsx')
const DEMO = delV3('_panel-vivo/DemoDelPanel.tsx')
const cumple = (r: string, m: string, d: string): boolean => /if \(!libreAhora\.current\) \{\s*el\.removeAttribute\('data-lenis-prevent'\)\s*return\s*\}\s*const puede/.test(r) && /libre \? 'overflow-y-auto' : 'overflow-hidden'/.test(m) && /\$\{libre \? '' : ' max-escritorio:pointer-events-none'\}/.test(d) && /createContext<boolean>\(true\)/.test(r)
afirmar(cumple(RUEDA, MARCO, DEMO), '  la maqueta lo cumple: bloqueada, nunca `data-lenis-prevent` (la rueda la toma Lenis y mueve la página), el contenido sin scroll y, abajo de 1024, sin el dedo; fuera de un módulo, libre como antes')
controlPositivo('  el detector VE la rueda de antes (adentro con recorrido, aunque el módulo esté bloqueado)', [RUEDA.replace(/if \(!libreAhora\.current\) \{[\s\S]*?return\s*\}\s*/, ''), MARCO, DEMO] as const, ([r, m, d]: readonly [string, string, string]) => cumple(r, m, d))
afirmar(/data-parte="cartel"/.test(QUIETO) && /bg-tinta\/60/.test(TARJETA) && /visible \? 'opacity-100' : 'pointer-events-none opacity-0'/.test(TARJETA), '  el cartel va sobre el módulo con su fondo atenuado y, mientras se ve, toma el clic')

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · El CTA: una pantalla, «Probar el panel» que todavía no hace nada, la «o» y el newsletter')

const CTA_HTML = /<div data-pieza="cta-del-panel"[\s\S]*?<\/form>/.exec(QUIETO)?.[0] ?? ''
afirmar(/data-pieza="cta-del-panel" class="[^"]*\bmin-h-svh\b/.test(CTA_HTML) && /<h3[^>]*data-pieza="titulo-que-se-pinta"/.test(CTA_HTML), 'ocupa una pantalla, con el titular pintado como el título')
const boton = /<div data-pieza="probar-el-panel"[^>]*><button([^>]*)>/.exec(CTA_HTML)?.[1] ?? ''
const quieto = (b: string): boolean => /type="button"/.test(b) && !/href=|onclick|disabled/.test(b)
afirmar(quieto(boton) && !/<a [^>]*>[^<]*Probar el panel/.test(QUIETO), '  el botón es un botón (visible y habilitado), sin enlace que se rompa: no hace nada hasta la prueba (C1)')
controlPositivo('  el detector VE un enlace roto', ' href="#"', quieto)
const iBoton = CTA_HTML.indexOf('probar-el-panel')
const iO = CTA_HTML.indexOf('o-del-cta')
const iForm = CTA_HTML.indexOf('<form')
afirmar(iBoton > 0 && iO > iBoton && iForm > iO, '  en orden: el botón, la «o» y el formulario (en escritorio en fila, en el teléfono apilados)')
afirmar(/escritorio:flex-row/.test(CTA_HTML) && /flex w-full flex-col items-center/.test(CTA_HTML), '  la fila se apila abajo de 1024')
const NEWSLETTER_FUENTE = fuenteDe('NewsletterDelPanel.tsx')
afirmar(/enviarAlServidor\('\/api\/newsletter', \{ mail: mail\.trim\(\) \}\)/.test(NEWSLETTER_FUENTE) && /data-pieza="novedades"/.test(CTA_HTML) && !CTA_HTML.includes(NEWSLETTER.listo), '  el newsletter es el que ya envía (redondeado: la pastilla de `pie.css`), sin un «listo» de entrada; esta prueba no lo llama')
afirmar(GESTOS_POR_TIEMPO.some((g) => g.seccion === ID && g.id === 'cta-del-panel') && /<Gatillo className="w-full">/.test(fuenteDe('CtaDelPanel.tsx')), '  la bajada y la fila entran con el gatillo del contrato (declarado como gesto por tiempo)')
afirmarIgual(focalizablesDe(QUIETO).length, 3, 'en el HTML servido, 3 focalizables: «Probar el panel», el campo y el envío del newsletter (lo de cada maqueta llega con ella)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('11 · REGLA DE ALTURAS: abajo de 1024 la escena ve el alto de antes')

const a390 = altoViejoAngosto(326) / 844
afirmar(Math.abs(a390 - 5.8) / 5.8 < 0.05, `el modelo del alto viejo a 390 × 844 da ${a390.toFixed(2)} pantallas contra las ~5,8 medidas en NOCTURNO FINAL C3 (a menos del 5 %)`)
// [NOCTURNO] Y contra la sección vieja medida en el navegador en cuatro anchos: a 25 px o menos (la deriva de lo que viene después).
const desvios = ALTOS_VIEJOS_MEDIDOS.map(([util, medido]) => altoViejoAngosto(util) - medido)
afirmar(desvios.every((d) => Math.abs(d) <= 25), `el modelo contra lo medido en el navegador (390, 768, 820 y 1023): ${desvios.map((d) => d.toFixed(0)).join(', ')} px`)
controlPositivo('  el modelo sin calibrar (el de B6) se pasa', ALTOS_VIEJOS_MEDIDOS, (m: readonly (readonly [number, number])[]) => m.every(([util, medido]) => Math.abs(altoViejoAngosto(util) + (util < 600 ? 117 : 50) - medido) <= 25))
const panel = { isConnected: true, getBoundingClientRect: () => ({ top: 20000 }) } as unknown as Element
const nuevo = 3400
const tramo = tramoDelPanel(panel, nuevo, 326, 844)
afirmar(tramo.arranque === ALTO_DE_VIEWPORT_DE_LA_REFERENCIA && Math.abs(tramo.k * tramo.largo * (844 / 900) - nuevo) < 1e-6, 'el tramo arranca en el tope del panel y mide lo medido (k × largo)', `k ${fmt(tramo.k)}`)
TRAMO_ESTIRADO.valor = null
/** El píxel que la escena ve 500 px después del panel, con el tramo anotado o sin él. */
const despues = (conTramo: boolean): number => {
  const soltar = conTramo ? anotarTramo(tramo) : (): void => undefined
  const y = 20000 + nuevo + 500
  const visto = medidaSinElEstiramiento(y, y, 0, 844, { y: 0, abajo: 0 }).y
  soltar()
  return visto
}
const comoAntes = 20000 + altoViejoAngosto(326) + 500
afirmar(Math.abs(despues(true) - comoAntes) < 1e-6, '  500 px después del panel, la escena ve el píxel que veía con el alto viejo', despues(true).toFixed(1))
controlPositivo('  sin el tramo, lo de después se corre', false, (c: boolean) => Math.abs(despues(c) - comoAntes) < 1e-6)

// ═══════════════════════════════════════════════════════════════════════════
titulo('12 · Los patrones que declaro son los que consumo')

afirmarIgual(patronesNombrados(CODIGO), ['P2'], 'la sección nombra P2 (la llegada de los módulos y las palabras); P1 llega por `TituloQueSube` del contrato')
afirmar(/patron="P1"/.test(leer(COMPARTIDO)) && fuenteDe('Fila.tsx').includes("from '../_contrato/TituloQueSube'"), '  los títulos que vienen desde abajo son la pieza del contrato (importable por otras secciones: B4)')
afirmarIgual(USOS_DECLARADOS.filter((u) => u.seccion === ID).map((u) => u.patron), ['P1', 'P2'], '  y el contrato declara los dos')

cerrar('s6-tu-panel.invariant')
