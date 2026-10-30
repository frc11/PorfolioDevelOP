/**
 * INVARIANTE — El precio en diagonales. **[SERVICIOS M2a]**
 *
 * Corre a mano: `npx tsx src/app/v3/_servicios/__tests__/diagonales.invariant.tsx`.
 *
 * La geometría pura (`bloques/precio/geometriaDelPrecio.ts`), la firma de las tres opciones (`tresOpciones.ts`), la coreografía
 * (`movimiento/coreografiaDelPrecio.ts`) y el MARCADO de la página de verdad (`renderToStaticMarkup` de `PaginaDeServicio`): la Mediana
 * literal y sin palabras prohibidas, el orden del DOM, el reparto del ancho en 768 (§4) y todo a la vista sin movimiento. Cada
 * comprobación lleva su control positivo: el MISMO detector contra una entrada armada para fallar.
 *
 * [M2a, precio b] La versión única, la que eligió Valentino: la coreografía b (entra primero la Mediana, después las otras dos juntas) y
 * las posiciones escalonadas (la Simple arriba, la Mediana al medio y la Premium abajo). RETIRADAS por quitar la funcionalidad, no
 * aflojadas: «la bandera no existe en producción» y «el reparto lee la url solo en desarrollo» (la bandera ya no existe en ningún modo:
 * en su lugar, §6 afirma que no queda rastro de ella), los valores de la fiel (`a`) y las tres coreografías (queda una).
 *
 * [M2b] La §4 cambió con la spec: «por debajo de 768 se ve el bloque de antes, byte por byte» (el D15) se RETIRÓ porque esa versión ya
 * no existe (por debajo de 768 van las historias, que prueba `historias.invariant.tsx`). Queda, con sus controles, que las dos
 * versiones se reparten el ancho en 768 y que la del D15 no vuelve.
 */

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import {
  PARAMETROS, adentro, cortes, franjaDelTexto, puntos, recorte, type IndiceDePanel, type Orientacion, type ParametrosDeLosCortes,
} from '../bloques/precio/geometriaDelPrecio'
import { tresOpcionesDeLosCalibres, type VistaDeTresOpciones } from '../bloques/precio/tresOpciones'
import { PAGINAS_WEB } from '../datos/paginas-web'
import * as COREOGRAFIA from '../movimiento/coreografiaDelPrecio'
import { entradaDelPanel } from '../movimiento/coreografiaDelPrecio'
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
const version = (html: string, cual: 'calibres' | 'historias' | 'diagonales'): string => elementoConAtributo(bloqueDe(html, 'precio') ?? '', `data-precio="${cual}"`) ?? ''
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
/** En retrato los cortes van casi horizontales: los dos tramos largos de cada corte (fuera del zag), a 10° o menos de la horizontal. */
const casiHorizontales = (p: ParametrosDeLosCortes): boolean => [[768, 1024], [1024, 1366]].every(([ancho = 0, alto = 0]) =>
  cortes('retrato', p).every((corte) => {
    const px = corte.map(([x, y]) => [x.w * ancho + x.h * alto, y.w * ancho + y.h * alto] as const)
    return [[0, 1], [2, 3]].every(([i = 0, k = 0]) => {
      const [a, b] = [px[i], px[k]]
      return a !== undefined && b !== undefined && Math.abs((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI) <= 10
    })
  }))
afirmar(casiHorizontales(PARAMETROS.retrato), 'en retrato (768×1024 y 1024×1366) los cortes son casi horizontales: sus tramos largos, a 10° o menos de la horizontal')
controlPositivo('  un retrato con los cortes empinados se detecta', { ...PARAMETROS.retrato, pendiente: 0.5 } as ParametrosDeLosCortes, casiHorizontales)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1b · [precio b] Las posiciones, escalonadas: la Simple arriba, la Mediana al medio y la Premium abajo')

type Franja = (orientacion: Orientacion, panel: IndiceDePanel, ancho: number, alto: number) => readonly [number, number]
const centro = (f: readonly [number, number]): number => (f[0] + f[1]) / 2
/** En cada caja: el centro de la franja de la Simple, más arriba que el de la Mediana, y ese más arriba que el de la Premium; la Mediana, a la mitad (±5 %). */
const escalonadas = (franja: Franja): boolean => CAJAS.every(({ orientacion, ancho, alto }) => {
  const [simple, mediana, premium] = PANELES.map((panel) => centro(franja(orientacion, panel, ancho, alto)))
  return simple !== undefined && mediana !== undefined && premium !== undefined && simple < mediana && mediana < premium &&
    Math.abs(mediana - alto / 2) <= 0.05 * alto && simple < alto / 2 && premium > alto / 2
})
const centros = (o: Orientacion, ancho: number, alto: number): string => PANELES.map((panel) => (centro(franjaDelTexto(o, panel, ancho, alto)) / alto).toFixed(2)).join(' · ')
afirmar(escalonadas(franjaDelTexto), `escalonadas en las cuatro cajas: la Simple arriba, la Mediana al medio (a la mitad del alto, ±5 %) y la Premium abajo. Centros, en fracciones del alto: ${centros('apaisado', 1440, 900)} a 1440×900 y ${centros('retrato', 768, 1024)} a 768×1024`)
controlPositivo('  la Mediana arriba, a la par de la Simple (el M2a), se detecta', ((o, panel, a, h) => franjaDelTexto(o, panel === 1 ? 0 : panel, a, h)) as Franja, escalonadas)
controlPositivo('  y la Simple y la Premium cambiadas de lugar', ((o, panel, a, h) => franjaDelTexto(o, panel === 0 ? 2 : panel === 2 ? 0 : panel, a, h)) as Franja, escalonadas)
/** La caja de la Mediana es su franja entera, con el texto centrado: flex en columna con justify-center y su alto en las dos orientaciones. */
const medianaCentrada = (html: string): boolean => {
  const apertura = /<li[^>]*data-opcion-del-precio="1"[^>]*>\s*<div[^>]*>/.exec(html)?.[0] ?? ''
  const c = (/<div[^>]*class="([^"]*)"/.exec(apertura)?.[1] ?? '').split(/\s+/)
  return ['flex', 'flex-col', 'justify-center', 'landscape:h-[var(--caja-h-a)]', 'portrait:h-[var(--caja-h-r)]'].every((x) => c.includes(x)) &&
    /--caja-h-a:/.test(apertura) && /--caja-h-r:/.test(apertura)
}
afirmar(medianaCentrada(DIAGONALES), '  y el texto de la Mediana va centrado en su franja: su caja es flex en columna con justify-center y lleva el alto de la franja en las dos orientaciones')
controlPositivo('  una Mediana sin centrar se detecta', DIAGONALES.replace('flex flex-col justify-center ', ''), medianaCentrada)

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
titulo('4 · [M2b] Desde 768 las diagonales; por debajo, las historias (la versión del D15 se fue)')

const clases = (html: string, atributo: string): string[] => (new RegExp(`<div[^>]*${atributo}[^>]*class="([^"]*)"`).exec(html)?.[1] ?? '').split(/\s+/)
const seRepartenEl768 = (html: string): boolean => {
  const precio = bloqueDe(html, 'precio') ?? ''
  return clases(precio, 'data-precio="historias"').includes('md:hidden') && !clases(precio, 'data-precio="historias"').includes('max-md:hidden') &&
    clases(precio, 'data-precio="diagonales"').includes('max-md:hidden') && !clases(precio, 'data-precio="diagonales"').includes('md:hidden') &&
    version(html, 'calibres') === ''
}
afirmar(seRepartenEl768(WEB_PROD) && seRepartenEl768(WEB_DEV), 'desde 768 se ven las diagonales y las historias se ocultan; por debajo, al revés. La versión del D15 (los calibres en su grilla) ya no existe, en los dos modos')
controlPositivo('  las clases de ocultar cruzadas se detectan', WEB_PROD.replace('data-precio="historias" class="md:hidden"', 'data-precio="historias" class="max-md:hidden"'), seRepartenEl768)
controlPositivo('  y la versión del D15 todavía montada', WEB_PROD.replace('<div data-precio="diagonales"', '<div data-precio="calibres" class="md:hidden"></div><div data-precio="diagonales"'), seRepartenEl768)

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
titulo('6 · [precio b] La coreografía, una sola: entra primero la Mediana, después las otras dos; la bandera ya no existe')

const MUESTRAS = Array.from({ length: 101 }, (_, i) => i / 100)
/** En 0 todo afuera, en 1 todo adentro, y nada retrocede al avanzar (es scrub: subiendo, deshace el camino). */
const coreografiaSana = (entrada: typeof entradaDelPanel): boolean => PANELES.every((panel) => {
  const muestras = MUESTRAS.map((p) => entrada(panel, p))
  return muestras[0] === 0 && muestras[100] === 1 && muestras.every((v, i) => i === 0 || v >= (muestras[i - 1] ?? 0))
})
afirmar(coreografiaSana(entradaDelPanel), 'la coreografía: en 0 los tres afuera, en 1 los tres en su lugar, y ninguna entrada retrocede al avanzar')
controlPositivo('  una que deja la Premium afuera al final se detecta', ((panel, p) => (panel === 2 ? 0 : entradaDelPanel(panel, p))) as typeof entradaDelPanel, coreografiaSana)
/**
 * La Mediana entra primero: en todo el recorrido va igual o más adelante que las otras dos, llega entera antes de que ellas empiecen, y
 * la Simple y la Premium entran juntas (la misma entrada en cada punto).
 */
const laMedianaPrimero = (entrada: typeof entradaDelPanel): boolean =>
  MUESTRAS.every((p) => entrada(1, p) >= entrada(0, p) && entrada(1, p) >= entrada(2, p) && entrada(0, p) === entrada(2, p)) &&
  MUESTRAS.some((p) => entrada(1, p) === 1 && entrada(0, p) === 0 && entrada(2, p) === 0)
afirmar(laMedianaPrimero(entradaDelPanel), '  entra primero la Mediana, sola y entera, y después la Simple y la Premium, juntas')
controlPositivo('  la Simple primero (la fiel del M2a) se detecta', ((panel, p) => entradaDelPanel(panel === 0 ? 1 : panel === 1 ? 0 : panel, p)) as typeof entradaDelPanel, laMedianaPrimero)
controlPositivo('  y la Premium junto con la Mediana', ((panel, p) => entradaDelPanel(panel === 2 ? 1 : panel, p)) as typeof entradaDelPanel, laMedianaPrimero)
const valores = PANELES.map((panel) => [0.2, 0.5, 0.8].map((p) => Number(entradaDelPanel(panel, p).toFixed(2))))
afirmarIgual(valores, [[0, 0, 0.86], [0.57, 1, 1], [0, 0, 0.86]], '  los valores: a un quinto la Mediana entrando; a la mitad la Mediana entera y las otras afuera; a cuatro quintos la Simple y la Premium casi llegadas')
/** La bandera ya no existe: ningún fuente de _servicios lee la consulta, nombra `?precio=` ni rotula la caja con su coreografía, y la coreografía solo exporta la entrada. */
const raiz = path.join(AQUI, '..')
const fuentes = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const f = path.join(dir, e.name)
  return e.isDirectory() ? (e.name === '__tests__' ? [] : fuentes(f)) : /\.tsx?$/.test(e.name) ? [f] : []
})
const FUENTES = fuentes(raiz).map((f) => ({ f: path.relative(raiz, f).split(path.sep).join('/'), codigo: readFileSync(f, 'utf8') }))
const RASTROS_DE_LA_BANDERA = [/location\.search/, /URLSearchParams/, /useSearchParams/, /\?precio=/, /BANDERA_DEL_PRECIO|COREOGRAFIAS_DEL_PRECIO|coreografiaDe\b/, /data-coreografia-del-precio/]
interface Fuente { readonly f: string; readonly codigo: string }
const conLaBandera = (lista: readonly Fuente[]): string[] => lista.filter((x) => RASTROS_DE_LA_BANDERA.some((r) => r.test(x.codigo))).map((x) => x.f)
afirmarIgual(conLaBandera(FUENTES), [], `  la bandera ya no existe: ningún fuente de _servicios (${String(FUENTES.length)}) lee la consulta, nombra ?precio=, la lista de coreografías o su resolvedor, ni rotula la caja con la coreografía`)
controlPositivo('  un reparto que vuelve a leer la url se detecta', [{ f: 'movimiento/RepartoDelPrecio.tsx', codigo: 'const q = window.location.search' }], (l: readonly Fuente[]) => conLaBandera(l).length === 0)
controlPositivo('  y una caja rotulada con la coreografía', [{ f: 'movimiento/RepartoDelPrecio.tsx', codigo: '<motion.div data-coreografia-del-precio="b">' }], (l: readonly Fuente[]) => conLaBandera(l).length === 0)
const soloLaEntrada = (modulo: Readonly<Record<string, unknown>>): boolean => JSON.stringify(Object.keys(modulo).sort()) === JSON.stringify(['entradaDelPanel'])
afirmar(soloLaEntrada(COREOGRAFIA), '  la coreografía exporta solo la entrada de cada panel: ni variantes, ni la de producción, ni el resolvedor')
controlPositivo('  un módulo que todavía exporta el resolvedor se detecta', { ...COREOGRAFIA, coreografiaDe: () => 'b' }, soloLaEntrada)

cerrar('diagonales.invariant')
