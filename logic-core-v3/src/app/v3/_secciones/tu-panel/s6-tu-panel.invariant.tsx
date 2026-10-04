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
import { ANCHO_CON_BARRA } from '../../_panel-vivo/DemoDelPanel'
import { CONTENIDO_DEL_CAOS, TABLA_DEL_CAOS, TAMANOS, cajasDelCaos, cajasEn, convivenciaEn, escalaDeLaDemo, fueraDelCuadro, velocidadDe, type FilaDelCaos } from './geometria'
import { DISPARO_DEL_REMATE, LENTITUD_DEL_REMATE, cronogramaDelRemate, curvaComoLinear, margenDelDisparo, salidaExponencial } from './entrada'
import { ENTRADAS_AL_TRAMO, cruceDelTramo, gestoDelCruce, puestoTras } from '../_contrato/cruce'
import { cruceDelTramo as cruceDeTrabajos, gestoDelCruce as gestoDeTrabajos } from '../trabajos/gota'
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

const TEXTOS = [TITULO, DESCRIPCION, ...TARJETAS.map((t) => t.titulo), ...TARJETAS.map((t) => t.etiqueta), Y_MAS, NEWSLETTER.titulo, NEWSLETTER.rotulo]
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
// [INTERFAZ 1] T1: más la del titular, que lleva la inercia de los títulos (su envoltorio escribe su `skewY`).
afirmarIgual(cuentaDe(ANIMADO, /data-inercia/g), 1, 'el titular lleva la inercia de los títulos')
afirmarIgual(cuentaDe(ANIMADO, /transform:/g), PIEZAS_POR_PATRON.P2 + 1, `CONTROL: con coreografía las ${PIEZAS_POR_PATRON.P2} piezas de P2 sí escriben la suya (8 features + 12 del fondo), más la inclinación del titular`)
afirmar(textoAccesible(QUIETO) === textoAccesible(ANIMADO), 'el texto accesible de las dos ramas es idéntico', `${textoAccesible(QUIETO).length} caracteres`)
const estilos = [...QUIETO.matchAll(/style="([^"]*)"/g)].map((m) => m[1])
// [RETOQUE PANEL] T1 · + las medidas de cada demo (su proporción). [AJUSTES FINALES] A8: el alto angosto se fue.
const DEL_DATO = /^(color:transparent|min-height:[^;]*|(--(x|y|w|proporcion|arranque-final):[^;]*;?)+(opacity:[\d.]+)?)$/
// MÓVIL 2: la palabra quieta de abajo de 1024 lleva sólo el alfa del fondo, que es de la tabla.
const ALFA_SOLO = `opacity:${String(ALFA_DEL_FONDO)}`
afirmarIgual(estilos.filter((e) => !DEL_DATO.test(e) && e !== ALFA_SOLO), [], `los ${estilos.length} estilos inline salen del optimizador, de la tabla de la sección o de las tablas del caos: ninguno a mano`)
controlPositivo('el filtro de estilos ve uno escrito a mano', ['margin-top:12px'], (l) => l.every((e) => DEL_DATO.test(e)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Cero cifras inventadas y cero capturas falsas')

const visible = textoVisible(ANIMADO)
afirmarIgual(escanearLoReal(visible), [], `cero hallazgos sobre ${visible.length} caracteres de texto renderizado`)
afirmarIgual(preciosEncontrados(visible), [], '  y cero formas de precio')
// RECURSOS: las ocho capturas llegaron. Ningún marcador en pantalla y cada tarjeta describe su pantalla.
afirmarIgual(marcadoresRealesEn(visible), [], '  ni un marcador en pantalla: las ocho capturas son reales')
afirmar(TARJETAS.every((t) => t.imagen !== CAPTURA.fuente && t.imagen.endsWith('.webp') && t.alt.length > 40), '  las ocho tarjetas usan su captura en webp y un alt que describe lo que se ve')
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
titulo('5 · [RETOQUE PANEL] T1 · Cada feature es su demo, usable en su lugar: sin botón que abra, sin hover que agrande')

const TARJETA = fuenteDe('Tarjeta.tsx')
for (const [rama, html] of [['sin coreografía', QUIETO], ['con coreografía', ANIMADO]] as const) {
  // Lo enfocable de cada demo llega con la demo (en el navegador, al acercarse); en el HTML del servidor quedan el campo y
  // el botón del newsletter. La tarjeta se enfoca sólo desde el código (`tabindex="-1"`: adonde lleva «Saltar la demo»).
  afirmarIgual(focalizablesDe(html).length, 2, `${rama}: 2 focalizables en el HTML del servidor — el campo y el botón del newsletter`)
  afirmarIgual(cuentaDe(html, /aria-haspopup="dialog"/g), 0, `${rama}: ninguna feature abre un diálogo (la demo grande se fue)`)
  afirmarIgual(cuentaDe(html, /<li data-pieza="feature-del-panel"[^>]*tabindex="-1"[^>]*aria-labelledby=/g), TARJETAS.length, `${rama}: cada feature se puede enfocar desde el código y se nombra con su título`)
}
afirmar(!/group-hover:|hover:scale/.test(TARJETA) && !/<button/.test(TARJETA), 'la tarjeta no es un botón y nada se agranda con el hover')
afirmar(/<DemoEnSuLugar demo=\{tarjeta\.demo\} pantalla=\{fila\.pantalla\} respaldo=\{respaldo\} \/>/.test(TARJETA), '  la demo va en su lugar, con su pantalla y la captura de respaldo debajo')
afirmar(ARCHIVOS.every((a) => !/Ampliacion\.tsx$|vuelo\.ts$|borde\.ts$/.test(a)) && !/Ampliacion|cajaAmpliada|useBordeDelPanel/.test(quitarComentarios(CODIGO)), '  la ampliación, su cuenta y la prueba de los bordes se borraron')
afirmarIgual(ARCHIVOS.flatMap((a) => apagadosDeFoco(quitarComentarios(leer(a)))), [], 'ningún archivo apaga el anillo de foco')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · [PASADA FINAL] B1 · El caos: una TABLA fija, tres tamaños, nada aleatorio, y cada demo con su pantalla')

afirmarIgual(TABLA_DEL_CAOS.length, TARJETAS.length, 'una fila por feature')
afirmarIgual(cuentaDe(quitarComentarios(CODIGO), /Math\.random|crypto\.getRandomValues/g), 0, 'nada se sortea en tiempo de ejecución: la hidratación ve lo mismo que el servidor')
afirmarIgual(Object.keys(TAMANOS).length, 3, 'tres clases de tamaño')
afirmar(Object.values(TAMANOS).every((t) => t.ancho >= 42 && t.ancho <= 56), 'del 42 al 56 % del ancho: más grandes que las miniaturas del nocturno (22 a 42), más chicas que las demos a lo ancho del retoque (64 a 100); ninguna a lo ancho', Object.values(TAMANOS).map((t) => `${String(t.ancho)} %`).join(' · '))
controlPositivo('  el chequeo vería una a lo ancho', [{ ancho: 100 }], (l: readonly { ancho: number }[]) => l.every((t) => t.ancho >= 42 && t.ancho <= 56))
afirmar(new Set(TABLA_DEL_CAOS.map((f) => f.tamano)).size === 3, 'y las tres se usan: tamaños distintos, nada fijo')
const ordenPorAncho = Object.values(TAMANOS).sort((a, b) => a.ancho - b.ancho)
afirmar(ordenPorAncho.every((t, i) => i === 0 || t.velocidad > ordenPorAncho[i - 1].velocidad), 'las más grandes van un poco más rápido (profundidad)')
afirmarIgual(velocidadDe(TABLA_DEL_CAOS.length - 1), 0, 'la última queda asentada: velocidad 0')
afirmar(TABLA_DEL_CAOS[0].columna >= 40, 'la primera llega en el 60 % derecho, al lado del encabezado', `columna ${String(TABLA_DEL_CAOS[0].columna)} %`)
afirmar(VELOCIDAD_DEL_FONDO < 0 && Object.values(TAMANOS).every((t) => t.velocidad > VELOCIDAD_DEL_FONDO), 'el fondo va más lento que cualquier feature: está más lejos')
afirmar(TABLA_DEL_CAOS.every((f) => f.pantalla.ancho >= 760 && f.pantalla.alto >= 700), 'cada demo se dibuja a una pantalla de panel de verdad (ninguna de menos de 760 × 700: más alta que la del retoque, se ve más panel); abajo de 1024 la misma, a escala ([AJUSTES FINALES] A8)')
afirmar(TABLA_DEL_CAOS.filter((f) => f.pantalla.ancho >= ANCHO_CON_BARRA).length >= 4, `  las anchas (desde ${String(ANCHO_CON_BARRA)} px) llevan la barra lateral del panel; las angostas la cierran`)
afirmar(/data-profundidad=\{velocidadDe\(indice\)\}/.test(TARJETA) && /CLASE_DEL_LUGAR\.asentada : CLASE_DEL_LUGAR\.flota/.test(TARJETA), '  cada tarjeta lleva su profundidad y flota en su lugar; la última, asentada en el flujo')

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · BARRIDO de convivencia sobre el modelo, a tres pantallas; y la escala de cada demo')

/** Barre el caos de a 5 px y devuelve el peor caso. */
function barrer(tabla: readonly FilaDelCaos[], ancho: number, alto: number): { max: number; tapados: string[]; pisadas: string[]; altoMaximo: number } {
  const cajas = cajasDelCaos(ancho, alto, tabla)
  const fin = cajas[cajas.length - 1].titulo.arriba + alto
  let max = 0
  const tapados = new Set<string>()
  const pisadas = new Set<string>()
  for (let s = -alto; s <= fin; s += 5) {
    const r = convivenciaEn(cajasEn(cajas, s, alto), alto)
    max = Math.max(max, r.visibles)
    r.tapados.forEach((t) => tapados.add(t))
    r.pisadas.forEach((t) => pisadas.add(t))
  }
  return { max, tapados: [...tapados], pisadas: [...pisadas], altoMaximo: Math.max(...cajas.map((c) => (c.imagen.alto + c.titulo.alto) / alto)) }
}
for (const [ancho, alto] of [[1376, 900], [1856, 1080], [1216, 800]] as const) {
  const r = barrer(TABLA_DEL_CAOS, ancho, alto)
  afirmar(r.max <= 3, `${String(ancho)} × ${String(alto)}: nunca más de 3 features a la vez`, `máximo ${String(r.max)}`)
  afirmarIgual(r.tapados, [], `${String(ancho)} × ${String(alto)}: ningún título queda bajo otra imagen`)
  afirmarIgual(r.pisadas, [], `${String(ancho)} × ${String(alto)}: ninguna demo se pisa con otra`)
  afirmar(r.altoMaximo <= 0.8, `${String(ancho)} × ${String(alto)}: ninguna pasa del 80 % del alto (se ve entera con su título)`, `${(r.altoMaximo * 100).toFixed(1)} %`)
}
afirmarIgual(fueraDelCuadro(), [], 'ninguna se sale por los costados')
const apretada = TABLA_DEL_CAOS.map((f, i) => (i === 1 ? { ...f, separacion: 8 } : f))
controlPositivo('el barrido ve dos demos que se pisan', apretada, (t: readonly FilaDelCaos[]) => barrer(t, 1376, 900).pisadas.length === 0)
controlPositivo('y una que se sale', [{ ...TABLA_DEL_CAOS[0], columna: 70 }], (t: readonly FilaDelCaos[]) => fueraDelCuadro(t).length === 0)
const escalas = (anchoUtil: number): number[] => TABLA_DEL_CAOS.map((_, i) => escalaDeLaDemo(i, anchoUtil))
const fmt = (e: readonly number[]): string => e.map((x) => x.toFixed(2)).join(' · ')
const a1440 = escalas(1376)
afirmar(a1440.every((e) => e >= 0.65 && e <= 0.9), '1440: el panel entero a escala reducida, de 0,65 a 0,9 (se lee y se usa; antes, a tamaño casi real y a lo ancho)', fmt(a1440))
controlPositivo('  el chequeo vería una miniatura del nocturno (22 % del ancho, dibujada a 1120)', [0.27], (e: readonly number[]) => e.every((x) => x >= 0.65 && x <= 0.9))
const a1920 = escalas(1856)
afirmar(a1920.every((e) => e >= 0.85 && e <= 1.15), '1920: de 0,85 a 1,15', fmt(a1920))
const enColumna = escalas(960)
afirmar(CONTENIDO_DEL_CAOS === 1152 && enColumna.every((e) => e >= 0.6 && e <= 1.1), '1024 (en columna, hasta 72rem de contenido): de 0,6 a 1,1', fmt(enColumna))

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · UNA suscripción de scroll: la profundidad de las features y del fondo, leyendo todo antes de escribir')

const GALERIA = fuenteDe('Galeria.tsx')
afirmarIgual(cuentaDe(quitarComentarios(CODIGO), /addEventListener\('scroll'/g), 1, 'UNA suscripción de scroll para la profundidad')
afirmar(/if \(!anima \|\| raiz === null\) return/.test(GALERIA) && GALERIA.includes('p.el.offsetTop'), '  que sólo corre con la coreografía, y mide con `offsetTop` (no ve la transformada que escribe)')
const leeAntesDeEscribir = (g: string): boolean => {
  const lecturas = g.indexOf('bordes.set(p.padre, p.padre.getBoundingClientRect().top)')
  const escrituras = g.indexOf('p.el.style.transform = ')
  return lecturas > 0 && escrituras > lecturas && !/getBoundingClientRect\(\)[\s\S]{0,200}style\.transform[\s\S]{0,200}getBoundingClientRect\(\)/.test(g)
}
afirmar(leeAntesDeEscribir(GALERIA), '  [PASADA FINAL] B3 · por cuadro lee los bordes (uno por contenedor) y recién después escribe las transformadas: ninguna lectura entre escrituras')
controlPositivo('  el detector VE el cuadro de antes (una lectura por pieza, intercalada con cada escritura)', GALERIA.replace('bordes.set(p.padre, p.padre.getBoundingClientRect().top)', 'bordes.set(p.padre, 0)').replace('p.el.style.transform = ', 'p.el.style.transform = String(p.padre.getBoundingClientRect().top) + '), leeAntesDeEscribir)
afirmar(VELOCIDAD_DEL_FONDO < 0, '  y el fondo va más lento que el scroll: está más lejos', String(VELOCIDAD_DEL_FONDO))

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · [PASADA FINAL] B2 · El marco es un módulo que flota: esquinas redondeadas y una sombra suave, sin halo ni filtros')

const marco = /<div\s+data-parte="marco"[\s\S]*?className="([^"]*)"/.exec(TARJETA)?.[1] ?? ''
const flota = (c: string): boolean => /\brounded-\[calc\(var\(--radius-fuerte\)\*1\.6\)\]/.test(c) && /\boverflow-hidden\b/.test(c) && /\bshadow-\[0_var\(--spacing-1\)_var\(--spacing-2\)_var\(--tw-shadow-color\),0_var\(--spacing-6\)_var\(--spacing-12\)_calc\(var\(--spacing-5\)\*-1\)_var\(--tw-shadow-color\)\]/.test(c) && /\bshadow-tinta\/25\b/.test(c) && /\bcontain-layout\b/.test(c) && /\bcontain-paint\b/.test(c)
afirmar(flota(marco), 'esquinas redondeadas (el radio fuerte × 1,6), la demo recortada adentro, la sombra en dos capas (el contacto y la ambiental, tinta al 25 %) y `contain` para que lo que pasa adentro no le cueste a la página', marco)
controlPositivo('  el detector VE el marco de antes (sin esquinas ni sombra)', 'relative w-full h-[var(--alto-angosto)]', flota)
afirmar(!/mask-image|backdrop-|\bblur-|\[filter:|\bbrightness-|--sangrado|data-borde/.test(quitarComentarios(CODIGO)), '  sin máscaras, sin desenfoques, sin filtros de fondo y sin el sangrado fundido de antes')
afirmar(!/panelBorde|panelborde/.test(quitarComentarios(readFileSync(path.join(RAIZ, 'src/app/v3/_lib/escena/entorno.ts'), 'utf8'))), '  la prueba `panelborde` ya no existe en el entorno')
afirmar(!/data-borde=/.test(QUIETO) && /data-parte="marco"/.test(QUIETO), '  y el HTML del servidor trae el marco sin la pieza del borde')

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · El remate: llega, SE VA en espejo, y el newsletter no finge un éxito')

const tramos = cronogramaDelRemate(700, 300, PUNTOS_DE_Y_MAS)
const finales = tramos.map((t) => t.delay + t.duration + t.endDelay)
afirmar(finales.every((f) => Math.abs(f - finales[0]) < 1e-9), 'todas las piezas terminan en el mismo instante: invertidas salen en espejo', `${finales[0]} ms`)
afirmar(tramos.every((t) => t.endDelay >= 0), '  sin relleno negativo')
controlPositivo('el control ve un cronograma sin relleno', tramos.map((t) => t.delay + t.duration), (l) => l.every((f) => Math.abs(f - l[0]) < 1e-9))
afirmar(salidaExponencial(0.25) > 0.8 && curvaComoLinear(salidaExponencial).startsWith('linear(0.0000, '), 'la curva es expo.out, pasada como `linear(…)`')
const REMATE = fuenteDe('Remate.tsx')
afirmar(REMATE.includes('gestoDelCruce(cruce)') && !REMATE.includes('isIntersecting)') && !/entrada\.isIntersecting\)\s*\{/.test(REMATE), 'el remate decide por el DISPARO POR LÍNEA del contrato, no por visibilidad')
afirmar(REMATE.includes('margenDelDisparo(DISPARO_DEL_REMATE)') && margenDelDisparo(DISPARO_DEL_REMATE) === `0% 0% -${DISPARO_DEL_REMATE}% 0%`, `  con la línea a ${DISPARO_DEL_REMATE} % del cuadro desde abajo (entra ni bien asoma y se va bien abajo)`, margenDelDisparo(DISPARO_DEL_REMATE))
afirmar(LENTITUD_DEL_REMATE > 1, `  y ${LENTITUD_DEL_REMATE} veces más lento que los tokens`)

// SPRINT PANEL 3 · las cuatro entradas, como §19 de Trabajos.
const CASOS = {
  'arriba-bajando': { cruza: true, tope: 300, pie: 700 },
  'arriba-subiendo': { cruza: false, tope: 700, pie: 1100 },
  'abajo-bajando': { cruza: false, tope: -900, pie: -500 },
  'abajo-subiendo': { cruza: true, tope: -200, pie: 200 },
} as const
const GESTO_ESPERADO = { 'arriba-bajando': 'ida', 'arriba-subiendo': 'vuelta', 'abajo-bajando': 'nada', 'abajo-subiendo': 'nada' } as const
for (const entrada of ENTRADAS_AL_TRAMO) {
  const c = CASOS[entrada]
  afirmarIgual(cruceDelTramo(c), entrada, `${entrada}: se reconoce`)
  afirmarIgual(gestoDelCruce(cruceDelTramo(c)), GESTO_ESPERADO[entrada], `  y su gesto es «${GESTO_ESPERADO[entrada]}»${entrada === 'abajo-bajando' ? ' — pasarlo bajando NO lo saca' : ''}`)
  afirmarIgual([cruceDelTramo(c), gestoDelCruce(cruceDelTramo(c))], [cruceDeTrabajos(c), gestoDeTrabajos(cruceDeTrabajos(c))], '  y es EXACTAMENTE lo que decide Trabajos (`trabajos/gota.ts`): es el mismo mecanismo, no uno propio')
}
afirmar(ENTRADAS_AL_TRAMO.every((e) => puestoTras(e) === (e !== 'arriba-subiendo')), 'al cargar se posa: puesto en todo cruce salvo debajo de la línea')
controlPositivo('el control ve un disparo por visibilidad (salir por arriba lo sacaría)', (c: { cruza: boolean }): string => (c.cruza ? 'ida' : 'vuelta'), (f) => f(CASOS['abajo-bajando']) === 'nada')
afirmar(GESTOS_POR_TIEMPO.some((g) => g.seccion === ID && g.curva === 'expo.out'), 'declarado en el contrato como gesto por tiempo')

// [RONDA 2] F1: el newsletter ENVÍA (a `/api/newsletter`, `NewsletterDelPanel.tsx`): el envío habilitado y sin `action`
// (lo manda el script, no el navegador a esta misma página); el resultado, en sus regiones vivas, sin un «listo» de entrada.
const enviaDeVerdad = (html: string, fuente: string): boolean => {
  const f = /<form[\s\S]*?<\/form>/.exec(html)?.[0] ?? ''
  const envios = [...f.matchAll(/<button[^>]*type="submit"[^>]*>/g)].map((m) => m[0])
  return f.length > 0 && envios.length > 0 && envios.every((b) => !/\bdisabled=""/.test(b)) && !/<form[^>]*\s(action|method)=/.test(f) && /enviarAlServidor\('\/api\/newsletter', \{ mail: mail\.trim\(\) \}\)/.test(fuente) && /role="status"/.test(f) && !f.includes(NEWSLETTER.listo)
}
const NEWSLETTER_FUENTE = fuenteDe('NewsletterDelPanel.tsx')
afirmar(enviaDeVerdad(QUIETO, NEWSLETTER_FUENTE), 'el newsletter envía al endpoint propio: habilitado, sin `action`, y el «listo» sólo con la respuesta')
controlPositivo('el predicado ve un envío deshabilitado', [QUIETO.replace('type="submit"', 'type="submit" disabled=""'), NEWSLETTER_FUENTE], ([h, f]: string[]) => enviaDeVerdad(h, f))

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

// ═══════════════════════════════════════════════════════════════════════════
titulo('M2 · Abajo de 1024: «Y más...» y el formulario se ven, llegan y vuelven')

const FUENTE_DEL_REMATE = quitarComentarios(fuenteDe('Remate.tsx'))
const remateEnTodoAncho = (f: string): boolean =>
  /const anima = useMovimientoEnTodoAncho\(\)/.test(f) && /if \(!anima \|\| raiz === null\) \{\s*setEstado\('quieto'\)\s*return\s*\}/.test(f)
afirmar(remateEnTodoAncho(FUENTE_DEL_REMATE), 'el remate llega y vuelve con la política de movimiento EN TODO ANCHO, y sin movimiento vuelve a quedar a la vista')
controlPositivo('  el chequeo vería el remate de antes, que abajo de 1024 no llegaba y al cruzar el umbral quedaba invisible', FUENTE_DEL_REMATE.replace('useMovimientoEnTodoAncho()', 'useCoreografiaActiva()'), remateEnTodoAncho)
const enElPapel = /data-pieza="remate-del-panel" data-estado="([^"]*)"/.exec(QUIETO)?.[1]
afirmarIgual(enElPapel, 'quieto', '  y en el papel (sin coreografía) está quieto y visible: ni «Y más...» ni el formulario llevan `invisible`')
afirmarIgual(cuentaDe(/data-pieza="remate-del-panel"[\s\S]*?<\/form>/.exec(QUIETO)?.[0] ?? '', /\binvisible\b/g), 0, '  (el marcado del remate no trae la clase que lo esconde)')

cerrar('s6-tu-panel.invariant')
