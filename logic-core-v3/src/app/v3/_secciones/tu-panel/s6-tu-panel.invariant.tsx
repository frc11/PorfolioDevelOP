/**
 * INVARIANTE — SECCIÓN 06 · TU PANEL, el caos ordenado (SPRINT PANEL 2).
 *
 * Renderiza la sección REAL a HTML en sus dos ramas —`anima={false}` y
 * `anima={true}`— y afirma sobre el marcado que sale; la geometría del caos, el
 * parallax, el vuelo de la ampliación y el cronograma del remate se afirman
 * contra las funciones puras que usan los componentes. Los barridos de
 * convivencia corren sobre el modelo de `geometria.ts`; el del navegador
 * (`scripts-panel/`) confirma que el DOM coincide.
 *
 * Cada detector corre además contra una entrada rota (control positivo).
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { LIMITE_DE_LINEAS_DE_CODIGO, contarLineasDeCodigo } from '../../_lib/__tests__/s8-largos'
import { RAIZ } from '../../_lib/__tests__/s3-archivos'
import {
  apagadosDeFoco,
  arbitrariosSinVar,
  funcionesDeColorEncontradas,
  hexEncontrados,
  literalesConUnidad,
  quitarComentarios,
} from '../../_lib/__tests__/s3-escaneo'
import { INVENTOS } from '../_contrato/inventado'
import { GESTOS_POR_TIEMPO, USOS_DECLARADOS } from '../_contrato/motion'
import { seccionDe } from '../_contrato/forma'
import { escanearLoReal, marcadoresRealesEn, preciosEncontrados, textoVisible } from '../_contrato/escaneo'
import { marcar } from '../_invariantes/render'
import { codigoDeLaSeccion, leer } from '../_invariantes/soporte'
import { CONTENIDO_PROHIBIDO_DE_CONTROL, aperturasDe, cuentaDe, focalizablesDe, patronesNombrados, sinAriaHidden, textoAccesible } from './deteccion'
import { CAPTURA, DESCRIPCION, ID, NEWSLETTER, NOMBRE, PALABRAS_DEL_FONDO, PUNTOS_DE_Y_MAS, TARJETAS, TITULO, Y_MAS } from './contenido'
import { ALFA_DEL_FONDO, VELOCIDAD_DEL_FONDO } from './Fondo'
import {
  ALTO_DE_LA_IMAGEN,
  TABLA_DEL_CAOS,
  TAMANOS,
  cajasDelCaos,
  cajasEn,
  convivenciaEn,
  corrimientoDelParallax,
  fueraDelCuadro,
  velocidadDe,
  type FilaDelCaos,
} from './geometria'
import { cronogramaDelRemate, curvaComoLinear, salidaExponencial } from './entrada'
import { cajaAmpliada, transformadaEntre, vecino } from './vuelo'
import { PIEZAS_POR_PATRON, TuPanel } from './TuPanel'

const montada = <TuPanel seccion={seccionDe(ID)} />
const QUIETO = marcar(montada, { anima: false })
const ANIMADO = marcar(montada, { anima: true })

const ARCHIVOS = codigoDeLaSeccion(ID)
const CODIGO = ARCHIVOS.map((a) => leer(a)).join('\n')
const fuenteDe = (nombre: string): string => quitarComentarios(leer(ARCHIVOS.find((a) => a.endsWith(`/${nombre}`)) ?? ''))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El contenido, entero y en orden, en las dos ramas')

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
afirmarIgual(TARJETAS.map((t) => t.titulo), ORDEN, 'las ocho features, con el texto y el orden del sprint anterior')
afirmarIgual(TITULO, 'Tu Panel', 'el título de la sección es «Tu Panel»')

const TEXTOS = [TITULO, DESCRIPCION, ...TARJETAS.map((t) => t.titulo), ...TARJETAS.map((t) => t.etiqueta), Y_MAS, NEWSLETTER.titulo, NEWSLETTER.rotulo, NEWSLETTER.ayuda]
for (const [rama, html] of [['sin coreografía', QUIETO], ['con coreografía', ANIMADO]] as const) {
  const visible = textoAccesible(html)
  afirmarIgual(TEXTOS.filter((t) => !visible.includes(t)), [], `${rama}: los ${TEXTOS.length} textos se anuncian enteros`)
  const desdeYMas = visible.slice(visible.indexOf(Y_MAS) + Y_MAS.length).trimStart()
  afirmar(desdeYMas.replace(/\s/g, '').startsWith('.'.repeat(PUNTOS_DE_Y_MAS)), `${rama}:   «${Y_MAS}» con sus ${PUNTOS_DE_Y_MAS} puntos`)
  const posiciones = ORDEN.map((t) => visible.indexOf(t))
  afirmar(posiciones.every((p, i) => i === 0 || p > posiciones[i - 1]), `${rama}: las features se leen en orden`)
}
afirmar(!textoVisible(QUIETO).includes(NOMBRE), `el rótulo de sección («${NOMBRE}») sigue sin leerse (B12)`)
afirmarIgual(cuentaDe(QUIETO, /data-pieza="marca-de-seccion"/g), 0, 'SIN el puntito azul: la sección no monta `MarcaDeSeccion` (la pieza compartida no se toca)')
controlPositivo('el comparador de orden ve dos features cambiadas', [5, 3], (p) => p.every((x, i) => i === 0 || x > p[i - 1]))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Abajo de 1025 no se monta coreografía, y el texto es el mismo')

afirmarIgual(cuentaDe(QUIETO, /transform:/g), 0, 'sin coreografía no se escribe una sola transformada en el marcado')
afirmarIgual(cuentaDe(ANIMADO, /transform:/g), PIEZAS_POR_PATRON.P2, `CONTROL: con coreografía las ${PIEZAS_POR_PATRON.P2} piezas de P2 sí escriben la suya (8 features + 12 del fondo)`)
afirmar(textoAccesible(QUIETO) === textoAccesible(ANIMADO), 'el texto accesible de las dos ramas es idéntico', `${textoAccesible(QUIETO).length} caracteres`)
const estilos = [...QUIETO.matchAll(/style="([^"]*)"/g)].map((m) => m[1])
const DEL_DATO = /^(color:transparent|min-height:[^;]*|(--(x|y|w|arranque-final):[^;]*;?)+(opacity:[\d.]+)?)$/
afirmarIgual(estilos.filter((e) => !DEL_DATO.test(e)), [], `los ${estilos.length} estilos inline salen del optimizador, de la tabla de la sección o de las tablas del caos: ninguno a mano`)
controlPositivo('el filtro de estilos ve uno escrito a mano', ['margin-top:12px'], (l) => l.every((e) => DEL_DATO.test(e)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Cero cifras inventadas y cero capturas falsas')

const visible = textoVisible(ANIMADO)
afirmarIgual(escanearLoReal(visible), [], `cero hallazgos sobre ${visible.length} caracteres de texto renderizado`)
afirmarIgual(preciosEncontrados(visible), [], '  y cero formas de precio')
afirmarIgual(marcadoresRealesEn(visible), [CAPTURA.marcador], `  el único marcador en pantalla es el de la captura que falta: ${CAPTURA.marcador}`)
afirmar(TARJETAS.every((t) => t.imagen !== CAPTURA.fuente || t.alt === ''), 'una feature con el placeholder no describe una pantalla que no existe: `alt` vacío')
afirmar(!('panelFechas' in INVENTOS) && !('panelComparacion' in INVENTOS), 'INVENTOS sigue sin las casillas del panel viejo', `quedan ${Object.keys(INVENTOS).length}`)
afirmarIgual(cuentaDe(quitarComentarios(CODIGO), /conLlave\(/g), 0, '  y la sección no consume ninguna')
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
controlPositivo('el detector de arbitrarios sin token no está ciego', 'className="gap-[16px]"', (t) => arbitrariosSinVar(t).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Foco y hover — cada feature es un botón, y el hover tiene su gemelo de foco')

const TARJETA = fuenteDe('Tarjeta.tsx')
for (const [rama, html] of [['sin coreografía', QUIETO], ['con coreografía', ANIMADO]] as const) {
  afirmarIgual(focalizablesDe(html).length, TARJETAS.length + 1, `${rama}: ${TARJETAS.length + 1} focalizables — una por feature y el campo del newsletter`)
  afirmarIgual(cuentaDe(html, /aria-haspopup="dialog"/g), TARJETAS.length, `${rama}: cada feature avisa que abre un diálogo`)
}
const hovers = [...TARJETA.matchAll(/group-hover:([\w-]+(?:\[[^\]]+\])?)/g)].map((m) => m[1]).sort()
const focos = [...TARJETA.matchAll(/group-focus-visible:([\w-]+(?:\[[^\]]+\])?)/g)].map((m) => m[1]).sort()
afirmarIgual(focos, hovers, `los ${hovers.length} cambios de hover tienen su gemelo en focus-visible`)
afirmar(TARJETA.includes('group-hover:scale-105') && TARJETA.includes('group-hover:translate-x-[var(--spacing-8)]'), 'se quedan la imagen a 1,05 y el título corrido 32 px del sprint anterior')
afirmarIgual(ARCHIVOS.flatMap((a) => apagadosDeFoco(quitarComentarios(leer(a)))), [], 'ningún archivo apaga el anillo de foco')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El caos: una TABLA fija, cuatro tamaños, nada aleatorio')

afirmarIgual(TABLA_DEL_CAOS.length, TARJETAS.length, 'una fila por feature')
afirmarIgual(cuentaDe(quitarComentarios(CODIGO), /Math\.random|crypto\.getRandomValues/g), 0, 'nada se sortea en tiempo de ejecución: la hidratación ve lo mismo que el servidor')
afirmarIgual(Object.keys(TAMANOS).length, 4, 'cuatro clases de tamaño')
afirmar(Object.values(TAMANOS).every((t) => t.ancho <= 45), 'ninguna pasa del 45 % del ancho', Object.values(TAMANOS).map((t) => `${t.ancho} %`).join(' · '))
afirmar(new Set(TABLA_DEL_CAOS.map((f) => f.tamano)).size === 4, 'y las cuatro se usan: tamaños distintos, nada fijo')
const ordenPorAncho = Object.values(TAMANOS).sort((a, b) => a.ancho - b.ancho)
afirmar(ordenPorAncho.every((t, i) => i === 0 || t.velocidad > ordenPorAncho[i - 1].velocidad), 'las más grandes van un poco más rápido (profundidad)')
afirmarIgual(velocidadDe(TABLA_DEL_CAOS.length - 1), 0, 'la última queda asentada: velocidad 0')
afirmar(TABLA_DEL_CAOS[0].columna >= 40, 'la primera llega en el 60 % derecho, al lado del encabezado', `columna ${TABLA_DEL_CAOS[0].columna} %`)
afirmar(VELOCIDAD_DEL_FONDO < 0 && Object.values(TAMANOS).every((t) => t.velocidad > VELOCIDAD_DEL_FONDO), 'el fondo va más lento que cualquier feature: está más lejos')

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · BARRIDO de convivencia sobre el modelo, a tres pantallas')

/** Barre el caos de a 5 px y devuelve el peor caso. */
function barrer(tabla: readonly FilaDelCaos[], ancho: number, alto: number): { max: number; tapados: string[]; altoMaximo: number } {
  const cajas = cajasDelCaos(ancho, alto, tabla)
  const fin = cajas[cajas.length - 1].titulo.arriba + alto
  let max = 0
  const tapados = new Set<string>()
  for (let s = -alto; s <= fin; s += 5) {
    const r = convivenciaEn(cajasEn(cajas, s, alto), alto)
    max = Math.max(max, r.visibles)
    r.tapados.forEach((t) => tapados.add(t))
  }
  return { max, tapados: [...tapados], altoMaximo: Math.max(...cajas.map((c) => (c.imagen.alto + c.titulo.alto) / alto)) }
}
for (const [ancho, alto] of [[1376, 900], [1856, 1080], [1216, 800]] as const) {
  const r = barrer(TABLA_DEL_CAOS, ancho, alto)
  afirmar(r.max <= 3, `${ancho} × ${alto}: nunca más de 3 features a la vez`, `máximo ${r.max}`)
  afirmarIgual(r.tapados, [], `${ancho} × ${alto}: ningún título queda bajo otra imagen`)
  afirmar(r.altoMaximo <= 0.55, `${ancho} × ${alto}: ninguna pasa del 55 % del alto`, `${(r.altoMaximo * 100).toFixed(1)} %`)
}
afirmarIgual(fueraDelCuadro(), [], 'ninguna se sale por los costados (con aire para el título corrido del hover)')
const apretada = TABLA_DEL_CAOS.map((f, i) => (i === 1 ? { ...f, separacion: 8 } : f))
controlPositivo('el barrido ve una fila que junta cuatro', apretada, (t) => barrer(t, 1376, 900).max <= 3)
const encima = TABLA_DEL_CAOS.map((f, i) => (i === 1 ? { ...f, columna: 52, separacion: 30 } : f))
controlPositivo('y ve un título tapado', encima, (t) => barrer(t, 1376, 900).tapados.length === 0)
controlPositivo('y una que se sale', [{ columna: 70, tamano: 'l' as const, separacion: 0 }], (t) => fueraDelCuadro(t).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · Parallax: la imagen adentro del marco (nk) y UNA suscripción')

afirmar(Math.abs(corrimientoDelParallax(683, 571, 900) - -164.261) < 1, 'nk: marco de 571 a 683 px del tope → −164,261', corrimientoDelParallax(683, 571, 900).toFixed(3))
afirmar(Array.from({ length: 301 }, (_, k) => corrimientoDelParallax(-600 + k * 5, 571, 900)).every((y) => y <= 0 && y >= -(ALTO_DE_LA_IMAGEN - 1) * 571), 'el borde de la imagen nunca entra al marco')
const GALERIA = fuenteDe('Galeria.tsx')
afirmarIgual(cuentaDe(quitarComentarios(CODIGO), /addEventListener\('scroll'/g), 1, 'UNA suscripción de scroll para la profundidad, el fondo y las imágenes')
afirmar(/if \(!anima \|\| raiz === null\) return/.test(GALERIA), '  que no se instala sin coreografía (abajo de 1025 o con movimiento reducido)')
afirmar(GALERIA.includes('el.offsetTop'), '  y mide la profundidad con `offsetTop`, que no ve la transformada que escribe')

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · La ampliación se queda: elemento compartido, flechas, Esc, foco')

const caja = cajaAmpliada(1440, 900, 80, 80)
afirmar(Math.abs(caja.width / caja.height - 1.6) < 1e-9, 'la caja final es 16:10', `${caja.width.toFixed(1)} × ${caja.height.toFixed(1)}`)
afirmarIgual(transformadaEntre(caja, caja), 'translate(0px, 0px) scale(1, 1)', 'desde la caja final a sí misma: identidad')
afirmarIgual([vecino(7, 1, 8), vecino(0, -1, 8)], [0, 7], 'las flechas dan la vuelta')
const AMPLIACION = fuenteDe('Ampliacion.tsx')
for (const [que, patron] of [['role="dialog"', /role="dialog"/], ['aria-modal', /aria-modal="true"/], ['Esc', /'Escape'/], ['flechas', /'ArrowRight'[\s\S]*'ArrowLeft'/], ['Tab atrapado', /'Tab'/], ['la cruz', /aria-label="Cerrar"/]] as const) {
  afirmar(patron.test(AMPLIACION), `el diálogo tiene ${que}`)
}
afirmar(/botones\.current\[abierta\]\?\.focus/.test(GALERIA), '  y el foco vuelve a la feature abierta')

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · El remate: llega, SE VA en espejo, y el newsletter no finge un éxito')

const tramos = cronogramaDelRemate(700, 300, PUNTOS_DE_Y_MAS)
const finales = tramos.map((t) => t.delay + t.duration + t.endDelay)
afirmar(finales.every((f) => Math.abs(f - finales[0]) < 1e-9), 'todas las piezas terminan en el mismo instante: invertidas salen en espejo', `${finales[0]} ms`)
afirmar(tramos.every((t) => t.endDelay >= 0), '  sin relleno negativo')
controlPositivo('el control ve un cronograma sin relleno', tramos.map((t) => t.delay + t.duration), (l) => l.every((f) => Math.abs(f - l[0]) < 1e-9))
afirmar(salidaExponencial(0.25) > 0.8 && curvaComoLinear(salidaExponencial).startsWith('linear(0.0000, '), 'la curva es expo.out, pasada como `linear(…)`')
const REMATE = fuenteDe('Remate.tsx')
afirmar(REMATE.includes('reproducir(animaciones, -1)') && REMATE.includes('entrada.boundingClientRect.top > 0'), 'sale en espejo sólo cuando se va por ABAJO (se está subiendo)')
afirmar(GESTOS_POR_TIEMPO.some((g) => g.seccion === ID && g.curva === 'expo.out'), 'declarado en el contrato como gesto por tiempo')

const forma = /<form[\s\S]*?<\/form>/.exec(QUIETO)?.[0] ?? ''
const sinExitoFalso = (html: string): boolean => {
  const f = /<form[\s\S]*?<\/form>/.exec(html)?.[0] ?? ''
  const envios = [...f.matchAll(/<button[^>]*type="submit"[^>]*>/g)].map((m) => m[0])
  return f.length > 0 && envios.length > 0 && envios.every((b) => /\bdisabled=""/.test(b)) && !/<form[^>]*\s(action|method)=/.test(f)
}
afirmar(sinExitoFalso(QUIETO), 'el newsletter no puede fingir un éxito: envío `disabled` y sin `action` — NO HAY DESTINO en el repo')
afirmar(forma.includes(`aria-describedby="${NEWSLETTER.id}-ayuda"`) && forma.includes(NEWSLETTER.ayuda), '  y el motivo se anuncia con `aria-describedby`')
controlPositivo('el predicado ve un envío habilitado', QUIETO.replace(' disabled=""', ''), sinExitoFalso)
controlPositivo('y un <form> con action', QUIETO.replace('<form ', '<form action="/x" '), sinExitoFalso)

// ═══════════════════════════════════════════════════════════════════════════
titulo("11 · El fondo: el contraste del «What's new» de nk, y fuera del árbol de lectura")

const TEMA = readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8')
const hex = (re: RegExp): number[] => {
  const h = re.exec(TEMA)?.[1] ?? '#000000'
  return [1, 3, 5].map((i) => Number.parseInt(h.slice(i, i + 2), 16))
}
const lineal = (c: number): number => (c / 255 <= 0.03928 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4)
const luz = (rgb: readonly number[]): number => 0.2126 * lineal(rgb[0]) + 0.7152 * lineal(rgb[1]) + 0.0722 * lineal(rgb[2])
const PAPEL = hex(/--color-fondo:\s*(#[0-9A-Fa-f]{6})/)
const TINTA = hex(/--color-tinta:\s*(#[0-9A-Fa-f]{6})/)
const mezcla = PAPEL.map((p, i) => ALFA_DEL_FONDO * TINTA[i] + (1 - ALFA_DEL_FONDO) * p)
const contraste = (luz(PAPEL) + 0.05) / (luz(mezcla) + 0.05)
afirmar(Math.abs(contraste - 1.0595) < 0.002, 'la tinta al alfa del fondo sobre el papel da el 1,0595:1 medido en nk', `${contraste.toFixed(4)}:1 · papel ${PAPEL.join(',')} · tinta ${TINTA.join(',')}`)
afirmar(/<div aria-hidden="true" data-pieza="fondo-del-panel"/.test(QUIETO), 'la raíz del fondo lleva `aria-hidden`')
const accesible = textoAccesible(QUIETO)
afirmar(PALABRAS_DEL_FONDO.every((p) => !new RegExp(`(^|\\s)${p}(\\s|$)`).test(accesible) || TEXTOS.some((t) => t.includes(p))), 'ninguna palabra del fondo se anuncia por sí sola')
const soloFondo = /<div aria-hidden="true" data-pieza="fondo-del-panel"[\s\S]*?(?=<div data-pieza="encabezado-del-panel")/.exec(QUIETO)?.[0] ?? ''
afirmar(soloFondo.length > 0, 'el fondo va ANTES del encabezado en el árbol: detrás de todo', `${soloFondo.length} caracteres`)
afirmarIgual(focalizablesDe(soloFondo).length, 0, 'no tiene nada focalizable')
afirmar(/data-pieza="fondo-del-panel" class="[^"]*\bhidden\b[^"]*escritorio:block/.test(QUIETO), 'y sólo existe desde escritorio')
afirmar(sinAriaHidden(QUIETO).length < QUIETO.length, 'CONTROL: la poda de aria-hidden sí saca el fondo del árbol')

// ═══════════════════════════════════════════════════════════════════════════
titulo('12 · Los patrones que declaro son los que consumo')

afirmarIgual(patronesNombrados(CODIGO), ['P1', 'P2'], 'la sección nombra P1 (el título) y P2 (la llegada de la casa)')
afirmarIgual(Object.keys(PIEZAS_POR_PATRON), ['P1', 'P2'], '  la tabla de piezas declara los mismos')
afirmarIgual(USOS_DECLARADOS.filter((u) => u.seccion === ID).map((u) => u.patron), ['P1', 'P2'], '  y el contrato también')
afirmarIgual(aperturasDe(QUIETO, 'li'), TARJETAS.length, 'las features son una lista: un <li> por feature')

cerrar('s6-tu-panel.invariant')
