/**
 * INVARIANTE — El precio en diagonales. **[SERVICIOS M2a]**
 *
 * Corre a mano: `npx tsx src/app/v3/_servicios/__tests__/diagonales.invariant.tsx`.
 *
 * La geometría pura (`bloques/precio/geometriaDelPrecio.ts`), la firma de las tres opciones (`tresOpciones.ts`), la coreografía y su
 * bandera (`movimiento/coreografiaDelPrecio.ts`) y el MARCADO de la página de verdad (`renderToStaticMarkup` de `PaginaDeServicio`):
 * la Mediana literal y sin palabras prohibidas, el orden del DOM, lo de debajo de 768 sin cambios (D15), todo a la vista sin movimiento
 * y la bandera fuera de producción. Cada comprobación lleva su control positivo: el MISMO detector contra una entrada armada para fallar.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { Bloque } from '../bloques/Bloque'
import { Calibres } from '../bloques/precio/Calibres'
import {
  PARAMETROS, adentro, cortes, puntos, recorte, type IndiceDePanel, type Orientacion, type ParametrosDeLosCortes,
} from '../bloques/precio/geometriaDelPrecio'
import { tresOpcionesDeLosCalibres, type VistaDeTresOpciones } from '../bloques/precio/tresOpciones'
import { PAGINAS_WEB } from '../datos/paginas-web'
import { COREOGRAFIAS_DEL_PRECIO, COREOGRAFIA_DE_PRODUCCION, coreografiaDe, entradaDelPanel } from '../movimiento/coreografiaDelPrecio'
import { PaginaDeServicio } from '../PaginaDeServicio'
import type { Calibre, Destacada } from '../tipos'
import { aperturas, bloqueDe, elementoConAtributo, textoVisible } from './pagina-detectores'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const PRECIO = ((): { readonly calibres: readonly Calibre[]; readonly destacada: Destacada | null } => {
  if (PAGINAS_WEB.precio.tipo !== 'calibres') throw new Error('paginas-web: el precio ya no es por calibres')
  return PAGINAS_WEB.precio
})()
const pagina = (enDesarrollo: boolean): string => renderToStaticMarkup(<PaginaDeServicio servicio={PAGINAS_WEB} enDesarrollo={enDesarrollo} />)
const WEB_PROD = pagina(false)
const WEB_DEV = pagina(true)
const version = (html: string, cual: 'calibres' | 'diagonales'): string => elementoConAtributo(bloqueDe(html, 'precio') ?? '', `data-precio="${cual}"`) ?? ''
const DIAGONALES = version(WEB_PROD, 'diagonales')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La geometría: tres paneles que llenan la caja, un quiebre por corte, el mismo ángulo en cualquier caja')

const CAJAS: readonly { readonly orientacion: Orientacion; readonly ancho: number; readonly alto: number }[] = [
  { orientacion: 'apaisado', ancho: 1440, alto: 900 },
  { orientacion: 'apaisado', ancho: 1024, alto: 768 },
  { orientacion: 'retrato', ancho: 768, alto: 1024 },
  { orientacion: 'retrato', ancho: 1024, alto: 1366 },
]
const PANELES: readonly IndiceDePanel[] = [0, 1, 2]
/** Una grilla de 64 × 40 puntos (corrida medio paso para no caer en un borde): cada uno tiene que caer adentro de UN solo panel. */
const llenaSinHuecos = (orientacion: Orientacion, ancho: number, alto: number, p: ParametrosDeLosCortes): boolean => {
  const poligonos = PANELES.map((panel) => puntos(orientacion, panel, ancho, alto, p))
  for (let i = 0; i < 64; i++) {
    for (let k = 0; k < 40; k++) {
      const x = ((i + 0.5) / 64) * ancho
      const y = ((k + 0.5) / 40) * alto
      if (poligonos.filter((poligono) => adentro(poligono, x, y)).length !== 1) return false
    }
  }
  return true
}
afirmarIgual(CAJAS.filter((c) => !llenaSinHuecos(c.orientacion, c.ancho, c.alto, PARAMETROS[c.orientacion])).map((c) => `${c.ancho}x${c.alto}`), [], 'los tres paneles llenan la caja sin huecos ni encimados: 2.560 puntos, cada uno en un solo panel, a 1440×900 y 1024×768 (apaisado) y a 768×1024 y 1024×1366 (retrato)')
controlPositivo('  dos cortes cruzados (el segundo antes que el primero) se detectan', { ...PARAMETROS.apaisado, en: [0.7, 0.3] } as ParametrosDeLosCortes, (p: ParametrosDeLosCortes) => llenaSinHuecos('apaisado', 1440, 900, p))
/** Cuántas veces cambia de sentido un corte, sobre el eje que se corre: un quiebre en zigzag son exactamente dos. */
const vueltasDelCorte = (orientacion: Orientacion, p: ParametrosDeLosCortes): number[] =>
  cortes(orientacion, p).map((corte) => {
    const enPx = corte.map(([x, y]) => (orientacion === 'apaisado' ? x.w * 1000 + x.h * 700 : y.w * 1000 + y.h * 700))
    // Los tramos sin corrida no cuentan como vuelta: un corte recto (o con el «zag» quieto) no tiene ninguna.
    const signos = enPx.slice(1).map((v, i) => Math.sign(v - (enPx[i] ?? 0))).filter((s) => s !== 0)
    return signos.slice(1).filter((s, i) => s !== signos[i]).length
  })
const unQuiebrePorCorte = (orientacion: Orientacion, p: ParametrosDeLosCortes): boolean => vueltasDelCorte(orientacion, p).every((v) => v === 2)
afirmar((['apaisado', 'retrato'] as const).every((o) => unQuiebrePorCorte(o, PARAMETROS[o])), 'cada corte tiene un quiebre en zigzag, y uno solo (la corrida cambia de sentido dos veces), en las dos orientaciones')
controlPositivo('  un corte recto se detecta', { ...PARAMETROS.apaisado, quiebre: { centro: 0.62, largo: 0.08, corrida: 0 } } as ParametrosDeLosCortes, (p: ParametrosDeLosCortes) => unQuiebrePorCorte('apaisado', p))
const anguloDelCorte = (pts: readonly (readonly [number, number])[]): number => {
  const [a, b] = [pts[1], pts[2]]
  return a === undefined || b === undefined ? NaN : (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI
}
/** El ángulo del primer tramo del corte de la Simple, en grados, en px reales de cada caja. */
const angulo = (medir: (ancho: number, alto: number) => readonly (readonly [number, number])[], ancho: number, alto: number): number => anguloDelCorte(medir(ancho, alto))
const mismoAngulo = (medir: (ancho: number, alto: number) => readonly (readonly [number, number])[]): boolean => Math.abs(angulo(medir, 1440, 900) - angulo(medir, 1024, 768)) <= 0.1 && Math.abs(angulo(medir, 1440, 900) - angulo(medir, 1280, 1000)) <= 0.1
afirmar(mismoAngulo((ancho, alto) => puntos('apaisado', 0, ancho, alto)), `el corte tiene el mismo ángulo en cualquier caja apaisada (±0,1°): ${angulo((a, h) => puntos('apaisado', 0, a, h), 1440, 900).toFixed(2)}° a 1440×900 y a 1024×768 (la pendiente va en px por px: cqw y cqh)`)
const conLaPendienteEnPorcentaje = (ancho: number, alto: number): readonly (readonly [number, number])[] =>
  puntos('apaisado', 0, ancho, alto).map(([x, y], i): readonly [number, number] => (i === 1 ? [x + (alto - ancho) * 0.1, y] : [x, y]))
controlPositivo('  una pendiente en % del ancho (el ángulo cambia con la caja) se detecta', conLaPendienteEnPorcentaje, mismoAngulo)
const enUnidadesDelContenedor = (css: string): boolean => /^polygon\(/.test(css) && !/\d(px|%|vw|vh|svh)\b/.test(css) && /cqw|cqh/.test(css)
afirmar(PANELES.every((panel) => enUnidadesDelContenedor(recorte('apaisado', panel)) && enUnidadesDelContenedor(recorte('retrato', panel))), 'los recortes se escriben en unidades del contenedor (cqw y cqh), sin px, % ni unidades del viewport')
controlPositivo('  un recorte en % se detecta', 'polygon(0 0, 30% 0, 20% 100%)', enUnidadesDelContenedor)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La firma de las tres opciones, y la Mediana: al centro, en el acento, con su marca y su línea literal')

const VISTA = tresOpcionesDeLosCalibres(PRECIO.calibres, PRECIO.destacada, false)
const tira = (f: () => unknown): boolean => {
  try {
    f()
    return false
  } catch {
    return true
  }
}
afirmar(VISTA.opciones.map((o) => o.nombre).join() === 'Simple,Mediana,Premium' && VISTA.destacada !== null, 'la vista de los calibres: Simple, Mediana y Premium, con la destacada')
afirmar(tira(() => tresOpcionesDeLosCalibres(PRECIO.calibres, { nombre: 'Simple', marca: 'x', linea: 'y' }, false)) && tira(() => tresOpcionesDeLosCalibres([...PRECIO.calibres, ...PRECIO.calibres.slice(0, 1)], PRECIO.destacada, false)), '  y tira con una destacada que no es la del medio, o con cuatro opciones: el slot no sabe pintar otra cosa')
controlPositivo('  una vista que acepta cuatro se detecta', () => undefined, (f: () => unknown) => tira(f))
const LINEA_DE_LA_MEDIANA = 'Todo lo de la Simple, en varias páginas y con catálogo o buscador para mostrar lo que vendés.'
const opcionesDelMarcado = (html: string): string[] => [...html.matchAll(/<li[^>]*data-opcion-del-precio="(\d)"[^>]*>([\s\S]*?)<\/li>/g)].map((m) => m[2] ?? '')
const parrafos = (marcado: string): string[] => [...marcado.matchAll(/<p(?=[\s>])[^>]*>([\s\S]*?)<\/p>/g)].map((m) => textoVisible(m[1] ?? ''))
const laMediana = (html: string): boolean => {
  const [simple, mediana, premium] = opcionesDelMarcado(html)
  const enElAcento = [...html.matchAll(/<li[^>]*data-opcion-del-precio="(\d)"[^>]*class="([^"]*)"/g)].filter((m) => (m[2] ?? '').split(/\s+/).includes('bg-acento')).map((m) => m[1])
  return mediana !== undefined && simple !== undefined && premium !== undefined && JSON.stringify(enElAcento) === JSON.stringify(['1']) &&
    textoVisible(mediana).includes('Recomendada') && parrafos(mediana).includes(LINEA_DE_LA_MEDIANA) &&
    !textoVisible(simple).includes('Recomendada') && !textoVisible(premium).includes('Recomendada')
}
afirmar(laMediana(DIAGONALES) && laMediana(version(WEB_DEV, 'diagonales')), `la Mediana es la del medio, la única en el acento, con «Recomendada» y su línea literal: «${LINEA_DE_LA_MEDIANA}»`)
controlPositivo('  la línea con un carácter cambiado se detecta', DIAGONALES.replace('vendés.', 'vendes.'), laMediana)
controlPositivo('  y el acento en la Simple', DIAGONALES.replace(/(data-opcion-del-precio="0"[^>]*class="[^"]*)bg-fondo/, '$1bg-acento'), laMediana)
const PROHIBIDAS = ['más elegida', 'popular', 'más vendida', 'favorita', 'oferta', 'mejor opción', 'imperdible']
const sinPalabrasProhibidas = (html: string): boolean => PROHIBIDAS.every((p) => !textoVisible(html).toLowerCase().includes(p))
afirmar(sinPalabrasProhibidas(bloqueDe(WEB_PROD, 'precio') ?? '') && sinPalabrasProhibidas(bloqueDe(WEB_DEV, 'precio') ?? ''), `ninguna palabra prohibida en la sección del precio (${PROHIBIDAS.join(', ')})`)
controlPositivo('  un texto con «popular» se detecta', DIAGONALES.replace('Recomendada', 'La más popular'), sinPalabrasProhibidas)
/** Mundo cerrado: lo que se lee en las diagonales es exactamente el título y lo que da la vista, nada más. */
const mundoCerrado = (html: string, vista: VistaDeTresOpciones): boolean => {
  let resto = textoVisible(html)
  const piezas = ['Precio', ...vista.opciones.flatMap((o) => [o.nombre, o.rotuloDelPrecio, o.precio, ...o.lineas]), ...(vista.destacada === null ? [] : [vista.destacada.marca, vista.destacada.linea])]
  for (const pieza of [...piezas].sort((a, b) => b.length - a.length)) resto = resto.replace(pieza, '')
  return resto.trim() === ''
}
afirmar(mundoCerrado(DIAGONALES, VISTA) && mundoCerrado(version(WEB_DEV, 'diagonales'), tresOpcionesDeLosCalibres(PRECIO.calibres, PRECIO.destacada, true)), 'mundo cerrado: todo texto de las diagonales sale de los datos (y del título «Precio»), en los dos modos')
controlPositivo('  un «¡Oferta!» suelto se detecta', DIAGONALES.replace('</ul>', '<p>¡Oferta!</p></ul>'), (h: string) => mundoCerrado(h, VISTA))

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El DOM: el h2 solo para lectores, después la lista, en el orden en que se lee')

const enOrden = (html: string): boolean => {
  const h2 = /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(html)
  const nombres = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => textoVisible(m[1] ?? ''))
  const lista = aperturas(html, 'ul').filter((u) => u.includes('data-pieza="precio-en-diagonales"'))
  return h2 !== null && (/class="([^"]*)"/.exec(h2[0])?.[1] ?? '').split(/\s+/).includes('sr-only') && textoVisible(h2[1] ?? '') === 'Precio' &&
    html.indexOf(h2[0]) < html.indexOf('<ul') && lista.length === 1 && (lista[0] ?? '').includes('role="list"') &&
    JSON.stringify(nombres) === JSON.stringify(['Simple', 'Mediana', 'Premium']) &&
    JSON.stringify([...html.matchAll(/data-opcion-del-precio="(\d)"/g)].map((m) => m[1])) === JSON.stringify(['0', '1', '2'])
}
afirmar(enOrden(DIAGONALES), 'en el DOM: el h2 «Precio» sr-only (D11), y una lista (role="list") con Simple, Mediana y Premium, cada una con su h3, de arriba a la izquierda a abajo a la derecha')
const [OP0, OP1] = [/<li[^>]*data-opcion-del-precio="0"[\s\S]*?<\/li>/.exec(DIAGONALES)?.[0] ?? '', /<li[^>]*data-opcion-del-precio="1"[\s\S]*?<\/li>/.exec(DIAGONALES)?.[0] ?? '']
controlPositivo('  dos cambiadas de lugar se detectan', DIAGONALES.replace(OP0, '§').replace(OP1, OP0).replace('§', OP1), enOrden)
controlPositivo('  y un h2 a la vista', DIAGONALES.replace(' sr-only">Precio</h2>', '">Precio</h2>'), enOrden)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Debajo de 768 nada cambia (D15), y las diagonales existen solo desde 768')

// Lo de antes del M2a: el bloque del precio con los calibres en su grilla. Su contenido tiene que estar tal cual en la versión chica.
const ANTES = (enDesarrollo: boolean): string => {
  const seccion = renderToStaticMarkup(<Bloque nombre="precio" titulo="Precio"><Calibres calibres={PRECIO.calibres} enDesarrollo={enDesarrollo} /></Bloque>)
  return seccion.replace(/^<section[^>]*>/, '').replace(/<\/section>$/, '')
}
const clases = (html: string, atributo: string): string[] => (new RegExp(`<div[^>]*${atributo}[^>]*class="([^"]*)"`).exec(html)?.[1] ?? '').split(/\s+/)
const debajoDe768SinCambios = (html: string, enDesarrollo: boolean): boolean => {
  const chica = version(html, 'calibres')
  const precio = bloqueDe(html, 'precio') ?? ''
  return chica.includes(ANTES(enDesarrollo)) && clases(precio, 'data-precio="calibres"').includes('md:hidden') && !clases(precio, 'data-precio="calibres"').includes('max-md:hidden') &&
    clases(precio, 'data-precio="diagonales"').includes('max-md:hidden') && !clases(precio, 'data-precio="diagonales"').includes('md:hidden') &&
    !/data-opcion-del-precio|Recomendada/.test(chica)
}
afirmar(debajoDe768SinCambios(WEB_PROD, false) && debajoDe768SinCambios(WEB_DEV, true), 'por debajo de 768 se ve el bloque de antes, byte por byte (título y calibres en su grilla), y las diagonales se ocultan; desde 768, al revés')
controlPositivo('  una versión chica con la línea de la Mediana se detecta', WEB_PROD.replace('Varias páginas, buscador o catálogo sin compras</p>', `Varias páginas, buscador o catálogo sin compras</p><p>${LINEA_DE_LA_MEDIANA}</p>`), (h: string) => debajoDe768SinCambios(h, false))
controlPositivo('  y las clases de ocultar cruzadas', WEB_PROD.replace('class="pt-12 md:hidden"', 'class="pt-12 max-md:hidden"'), (h: string) => debajoDe768SinCambios(h, false))

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Sin movimiento (el HTML servido y el movimiento reducido): todo a la vista y quieto, en una pantalla')

/** Cada panel lee su entrada con reserva 1 (opacidad y corrimiento), y nada fija la entrada en el HTML: sin progreso, todo en su lugar. */
const todoALaVista = (html: string): boolean => {
  const paneles = [...html.matchAll(/<li[^>]*data-opcion-del-precio="(\d)"[^>]*>/g)].map((m) => ({ n: m[1] ?? '', apertura: m[0] }))
  return paneles.length === 3 && paneles.every(({ n, apertura }) => {
    const c = (/class="([^"]*)"/.exec(apertura)?.[1] ?? '').split(/\s+/)
    return c.includes(`opacity-[var(--entrada-${n},1)]`) && c.filter((x) => x.startsWith('translate-')).every((x) => x.includes(`var(--entrada-${n},1)`))
  }) && !/--entrada-\d\s*:/.test(html) && !/opacity:\s*0/.test(html)
}
afirmar(todoALaVista(DIAGONALES), 'cada panel lee su entrada con reserva 1 (opacidad y corrimiento) y el HTML no la fija: el HTML servido y el movimiento reducido muestran los tres en su lugar')
controlPositivo('  un panel sin la reserva se detecta', DIAGONALES.replace('opacity-[var(--entrada-1,1)]', 'opacity-[var(--entrada-1)]'), todoALaVista)
controlPositivo('  y uno escondido en el servidor', DIAGONALES.replace('data-opcion-del-precio="2"', 'data-opcion-del-precio="2" style="opacity:0"'), todoALaVista)
/** El alto: tres pantallas SOLO con la preferencia sin reducir; con movimiento reducido, una (la caja anclada no se mueve). */
const altoComoDice = (html: string): boolean => {
  const c = (/<div[^>]*class="([^"]*)"[^>]*style="--alto-del-precio:300svh"/.exec(html)?.[1] ?? '').split(/\s+/)
  return c.includes('h-svh') && c.includes('motion-safe:h-[var(--alto-del-precio)]') && !c.includes('h-[var(--alto-del-precio)]')
}
afirmar(altoComoDice(DIAGONALES), 'la sección mide tres pantallas solo con la variante de movimiento (motion-safe) y una sin ella: con movimiento reducido es una pantalla quieta')
controlPositivo('  el alto alto sin la variante de movimiento se detecta', DIAGONALES.replace('motion-safe:h-[var(--alto-del-precio)]', 'h-[var(--alto-del-precio)]'), altoComoDice)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · La coreografía y su bandera: producción ve la fiel; ?precio=a|b|c solo en desarrollo')

const CONSULTAS = ['', '?precio=a', '?precio=b', '?precio=c', '?precio=zz']
const banderaFueraDeProduccion = (resolver: typeof coreografiaDe): boolean =>
  CONSULTAS.every((q) => resolver(q, false) === COREOGRAFIA_DE_PRODUCCION) && resolver('?precio=b', true) === 'b' && resolver('?precio=c', true) === 'c' && resolver('?precio=zz', true) === COREOGRAFIA_DE_PRODUCCION
afirmar(banderaFueraDeProduccion(coreografiaDe), `la bandera no existe en producción: con cualquier consulta sale «${COREOGRAFIA_DE_PRODUCCION}», la fiel; en desarrollo, ?precio=b y ?precio=c la cambian`)
controlPositivo('  un resolvedor que lee la bandera también en producción se detecta', ((q: string) => coreografiaDe(q, true)) as typeof coreografiaDe, banderaFueraDeProduccion)
const FUENTE_DEL_REPARTO = readFileSync(path.join(AQUI, '../movimiento/RepartoDelPrecio.tsx'), 'utf8')
const leeLaUrlSoloEnDesarrollo = (fuente: string): boolean => fuente.includes("const EN_DESARROLLO = process.env.NODE_ENV !== 'production'") && fuente.includes('(EN_DESARROLLO ? window.location.search : \'\')') && (fuente.match(/location\.search/g) ?? []).length === 1
afirmar(leeLaUrlSoloEnDesarrollo(FUENTE_DEL_REPARTO), '  y el reparto lee la url una sola vez, detrás de NODE_ENV: en el build de producción esa rama no existe')
controlPositivo('  un reparto que lee la url siempre se detecta', FUENTE_DEL_REPARTO.replace('(EN_DESARROLLO ? window.location.search : \'\')', 'window.location.search'), leeLaUrlSoloEnDesarrollo)
/** Cada coreografía: en 0 todo afuera, en 1 todo adentro, y nada retrocede al avanzar (es scrub: subiendo, deshace el camino). */
const coreografiaSana = (entrada: typeof entradaDelPanel): boolean => COREOGRAFIAS_DEL_PRECIO.every((c) => PANELES.every((panel) => {
  const muestras = Array.from({ length: 101 }, (_, i) => entrada(c, panel, i / 100))
  return muestras[0] === 0 && muestras[100] === 1 && muestras.every((v, i) => i === 0 || v >= (muestras[i - 1] ?? 0))
}))
afirmar(coreografiaSana(entradaDelPanel), 'las tres coreografías: en 0 los tres afuera, en 1 los tres en su lugar, y ninguna entrada retrocede al avanzar')
controlPositivo('  una que deja la Premium afuera al final se detecta', ((c, panel, p) => (panel === 2 ? 0 : entradaDelPanel(c, panel, p))) as typeof entradaDelPanel, coreografiaSana)
const enOrdenFiel = PANELES.map((panel) => [0.2, 0.5, 0.8].map((p) => Number(entradaDelPanel('a', panel, p).toFixed(2))))
afirmarIgual(enOrdenFiel, [[0.86, 1, 1], [0, 0.71, 1], [0, 0, 0.57]], '  la fiel (a), en orden: a un quinto la Simple casi llegada; a la mitad la Mediana entrando; a cuatro quintos la Premium entrando')

cerrar('diagonales.invariant')
