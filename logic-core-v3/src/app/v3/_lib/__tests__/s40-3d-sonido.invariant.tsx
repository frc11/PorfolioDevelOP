/**
 * SPRINT 3D Y SONIDO — el invariante: npm run test:s40-3d-sonido
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   T0 · el hover de las fotos arranca desde un punto: la máscara nace de 2 px en el centro y se cierra en él; la
 *        duración es la de siempre y la curva de apertura conserva la cola de `--ease-salida` con un arranque rápido.
 *   T1 · los títulos de volumen en el producto: el negro, `titulos=blanco` y `titulos=no`; en un viaje del menú ningún
 *        título llega y al terminar llegan con la llegada repetida de su sección; el DOM esconde su texto recién con el
 *        título armado y sólo desde 1024 (con CSS); abajo de 1024 ni se descarga.
 *
 * Lo que se ve (los clips, la hoja, el costo, la propuesta): `scripts-3d-sonido/`, en `~/.cache/b4-medicion/3d-sonido/`.
 */
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'

import { TituloDeVolumen } from '../../_componentes/titulos3d/TituloDeVolumen'
import { BASE_LIMPIA, ENTORNO, entornoPedido } from '../escena/entorno'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

/** Un `cubic-bezier` evaluado en el tiempo `x` (0 a 1): el progreso. */
function curva(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
  const B = (a: number, b: number, t: number): number => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3
  return (x) => {
    let [lo, hi] = [0, 1]
    for (let i = 0; i < 60; i += 1) {
      const m = (lo + hi) / 2
      if (B(x1, x2, m) < x) lo = m
      else hi = m
    }
    return B(y1, y2, (lo + hi) / 2)
  }
}
const bezierDe = (texto: string): [number, number, number, number] | null => {
  const m = /cubic-bezier\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/.exec(texto)
  return m === null ? null : [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])]
}
/** Cuántos ms tarda la máscara (400 ms) en llegar a un 17 % del ancho de la tarjeta: el rectángulo del que arrancaba antes. */
const msHastaElRectanguloDeAntes = (c: (x: number) => number): number => {
  let ms = 0
  while (ms < 400 && c(ms / 400) < 0.17) ms += 1
  return ms
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('T0 · El hover de las fotos: desde un punto')

const marco = sinComentarios(leer('_secciones/quienes-somos/marco.tsx'))
const cerrado = /'--marco-cerrado': '([^']+)'/.exec(marco)?.[1] ?? ''
const esUnPunto = (v: string): boolean => /^inset\(calc\(50% - (0\.5|1)px\)\)$/.test(v)
afirmar(esUnPunto(cerrado), 'la máscara cerrada es un punto en el centro (1 o 2 px): de ahí crece y ahí se cierra', cerrado)
controlPositivo('el detector VE el rectángulo de antes', 'inset(42% 41%)', esUnPunto)
const entra = /'--marco-entra': '([^']+)'/.exec(marco)?.[1] ?? ''
const sale = /'--marco-sale':\s*'([^']+)'/.exec(marco)?.[1] ?? ''
const deLaCurva = /'--marco-curva': '([^']+)'/.exec(marco)?.[1] ?? ''
const salida = bezierDe(readFileSync('src/app/theme-develop.css', 'utf8').match(/--ease-salida: (cubic-bezier\([^)]+\))/)?.[1] ?? '')
const nueva = bezierDe(deLaCurva)
afirmar(/^clip-path var\(--duracion-media\) var\(--marco-curva\), opacity 0s$/.test(entra) && /clip-path var\(--revelado-sale\) var\(--ease-salida\) var\(--revelado-sale-demora\)/.test(sale), '  la duración es la de siempre (400 ms al abrir; la salida, con su curva y su demora)', entra)
afirmar(nueva !== null && salida !== null && nueva[2] === salida[2] && nueva[3] === salida[3], '  la curva de apertura conserva la cola de `--ease-salida` (se asienta igual): sólo cambia el arranque', deLaCurva)
const rapido = (b: [number, number, number, number] | null): boolean => b !== null && msHastaElRectanguloDeAntes(curva(...b)) <= 50
afirmar(rapido(nueva), '  y desde el punto llega al tamaño del rectángulo de antes (17 %) en 50 ms o menos: no queda un punto casi invisible', `${String(nueva === null ? '?' : msHastaElRectanguloDeAntes(curva(...nueva)))} ms`)
controlPositivo('el detector VE la curva de siempre desde el punto (~109 ms de punto)', salida, rapido)
afirmar(/motion-reduce:\[--marco-cerrado:var\(--marco-abierto\)\]!/.test(marco) && (marco.match(/data-parte="revelado-nombre"/g) ?? []).length === 1, '  lo demás no cambia: con movimiento reducido un fundido; el nombre y el rol, escalonados')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · Los títulos de volumen en el producto: el negro; el blanco para comparar')

afirmar(ENTORNO.titulos === 'negro' && entornoPedido('producto').titulos === 'negro', 'en el producto, el negro satinado del logo')
afirmar(entornoPedido('producto,titulos=blanco').titulos === 'blanco' && entornoPedido('producto,titulos=no').titulos === 'no' && BASE_LIMPIA.titulos === 'no', '  `titulos=blanco` (con banco o en la URL) los pide blancos y `titulos=no` los apaga; la base no los tiene')
const entorno = leer('_lib/escena/entorno.ts')
afirmar(/resuelto = pedido === null \? ENTORNO : \{ \.\.\.ENTORNO, titulos: pedido\.titulos, pruebas: pedido\.pruebas \}/.test(entorno), '  la URL (`?pruebas=titulos=blanco`) cambia el material y nada más del producto')

titulo('T1 · Con los viajes del menú: durante el viaje no llegan; al terminar, la llegada repetida')
const escena3d = sinComentarios(leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx'))
const sostieneEnElViaje = (c: string): boolean => /const enViaje = viajeEnCurso\(\) !== null\s*for \(const a of s\.armados\)/.test(c) && /a\.mostrado\.llegada = persigue\(a\.mostrado\.llegada, enViaje \? 0 : a\.titulo\.llegada, dt\)/.test(c)
afirmar(sostieneEnElViaje(escena3d), 'en un viaje lo pedido es 0 (ninguna letra llega con el velo puesto; la cámara viaja sola), leído una vez por cuadro')
controlPositivo('el detector VE la llegada que corre con el scroll del viaje', escena3d.replace('enViaje ? 0 : a.titulo.llegada', 'a.titulo.llegada'), sostieneEnElViaje)
const dom = sinComentarios(leer('_componentes/titulos3d/TituloDeVolumen.tsx'))
afirmar(/const repetible = useLlegadaDelTitulo\(llegadaDe, llegada \?\? LLEGADO\)/.test(dom) && /llegada: llegada === null \? null : repetible/.test(dom), 'al terminar, la llegada que el viaje repite (`llegadaDelTitulo.ts`, la del retoque 3) es la que persigue el título: las letras desde la profundidad, sin mover la cámara')
const piezas = leer('_secciones/trabajos/piezas.tsx')
const porQue = leer('_secciones/por-que-develop/PorQueDevelop.tsx')
afirmar(/<CanalDeUnaPieza[^>]*llegadaDe=\{seccion\.id\}>[\s\S]{0,400}<TituloDeVolumen [^>]*llegadaDe=\{seccion\.id\} \/>/.test(piezas) && /<TituloDeVolumen [^>]*llegadaDe="por-que-develop" \/>/.test(porQue) && (porQue.match(/llegadaDe="por-que-develop"/g) ?? []).length === 3, '  Portfolio y la frase, con la MISMA sección que su pieza del DOM (la que el viaje nombra al llegar)')

titulo('T1 · El DOM: el texto de siempre hasta que el título está armado; desde 1024')
const html = renderToStaticMarkup(<TituloDeVolumen id="portfolio" texto="Portfolio" lectura={0.47} llegada={null} salida={null} llegadaDe="trabajos" />)
const seLee = (h: string): boolean => h === '<span class="block">Portfolio</span>'
afirmar(seLee(html), 'en el servidor y hasta que la escena avisa: el texto, visible y anunciado (sin WebGL, o mientras llega el módulo, el título se lee)', html)
controlPositivo('el detector VE el texto escondido de entrada (el de la prueba de ESCENA 10)', '<span class="sr-only">Portfolio</span><span aria-hidden="true" class="invisible block">Portfolio</span>', seLee)
afirmar(/\{listo && <span className="sr-only hidden escritorio:block">\{texto\}<\/span>\}/.test(dom) && /className=\{listo \? 'block escritorio:invisible' : 'block'\}/.test(dom), '  armado: desde 1024 el lugar invisible y el texto para el lector; abajo, el de siempre (el corte es de CSS)')
afirmar(/activo: material !== 'no' && escritorio/.test(dom) && /const escritorio = useAnchoMinimo\(CONSULTA_ESCENARIO\)/.test(dom), '  abajo de 1024 ningún título se anota (las secciones no tienen escenario)')
afirmar(/calentar\(gl, escena, camara\)\s*for \(const a of armados\) marcarListo\(a\.titulo\.id, true\)/.test(escena3d) && /marcarListo\(a\.titulo\.id, false\)/.test(escena3d), '  la escena avisa «listo» recién compilado y calentado, y lo retira al soltarlo')
const perezoso = sinComentarios(leer('_lib/escena/PruebasDeLaEscena.tsx'))
afirmar(/const escritorio = useAnchoMinimo\(CONSULTA_ESCENARIO\)/.test(perezoso) && /if \(entornoDeLaEscena\(\)\.titulos === 'no' \|\| !escritorio\) return null/.test(perezoso), '  y abajo de 1024 el módulo de los títulos ni se descarga')

cerrar('s40-3d-sonido')
