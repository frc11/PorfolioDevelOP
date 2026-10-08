/**
 * SPRINT 3D Y SONIDO — el invariante: npm run test:s40-3d-sonido
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   T0 · el hover de las fotos arranca desde un punto: la máscara nace de 2 px en el centro y se cierra en él; la
 *        duración es la de siempre y la curva de apertura conserva la cola de `--ease-salida` con un arranque rápido.
 *   T1 · los títulos de volumen en el producto: el negro, `titulos=blanco` y `titulos=no`; en un viaje del menú ningún
 *        título llega y al terminar llegan con la llegada repetida de su sección; el DOM esconde su texto recién con el
 *        título armado y sólo desde 1024 (con CSS); abajo de 1024 ni se descarga.
 *   T2 · el sonido: con bandera y apagado en el producto; howler y el archivo llegan sólo en un `import()`; sin motor,
 *        nada suena; la elección se guarda con try/catch; un sprite de menos de 200 KB, bajo; dónde suena.
 *
 * Lo que se ve (los clips, la hoja, el costo, la propuesta): `scripts-3d-sonido/`, en `~/.cache/b4-medicion/3d-sonido/`.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'

import { TituloDeVolumen } from '../../_componentes/titulos3d/TituloDeVolumen'
import { BASE_LIMPIA, ENTORNO, entornoPedido } from '../escena/entorno'
import { callar, instalarElSonido, sonar } from '../sonido/bus'
import { SONIDOS, VOLUMEN_GENERAL } from '../sonido/catalogo'
import { guardarPrendido, leerPrendido, leerVolumenes } from '../sonido/preferencia'
import { CORTES_DEL_SPRITE } from '../sonido/sprite'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

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
const escena3d = sinComentarios((leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx') + leer('_lib/escena/titulos3d/armado.ts') + leer('_lib/escena/titulos3d/sincronia.ts')))
// [RETOQUE 3D] B1: entre los dos, el scroll del cuadro (el que se queda va corrido con su escenario).
// [RONDA 2] F2: con el asiento entre la lectura del scroll y el recorrido; lo mostrado, función del scroll.
const sostieneEnElViaje = (c: string): boolean => /const enViaje = viajeEnCurso\(\) !== null\s*const y = window\.scrollY[\s\S]{0,700}?for \(const a of s\.armados\)/.test(c) && /a\.mostrado\.llegada = mostradoDelScroll\(a\.mostrado\.llegada, enViaje \? 0 : a\.titulo\.llegada, asentar, dt, enViaje \? null : a\.titulo\.minimoS, a\.titulo\.asiento\)/.test(c)
afirmar(sostieneEnElViaje(escena3d), 'en un viaje lo pedido es 0 (ninguna letra llega con el velo puesto; la cámara viaja sola), leído una vez por cuadro')
// [PASADA FINAL] A3 · todas las lecturas (la reanudacion del lazo tambien lee lo pedido): el control cambia cada una.
controlPositivo('el detector VE la llegada que corre con el scroll del viaje', escena3d.split('enViaje ? 0 : a.titulo.llegada').join('a.titulo.llegada'), sostieneEnElViaje)
const dom = sinComentarios(leer('_componentes/titulos3d/TituloDeVolumen.tsx'))
afirmar(/const repetible = useLlegadaDelTitulo\(llegadaDe, llegada \?\? LLEGADO\)/.test(dom) && /llegada: llegada === null \? null : repetible/.test(dom), 'al terminar, la llegada que el viaje repite (`llegadaDelTitulo.ts`, la del retoque 3) es la que persigue el título: las letras desde la profundidad, sin mover la cámara')
const piezas = leer('_secciones/trabajos/piezas.tsx')
const porQue = leer('_secciones/por-que-develop/PorQueDevelop.tsx')
afirmar(/<CanalDeUnaPieza[^>]*llegadaDe=\{seccion\.id\}>[\s\S]{0,400}<TituloDeVolumen [^>]*llegadaDe=\{seccion\.id\}( minimoS=\{LENTOS\.llegadaDePortfolioS\})?( queda)? \/>/.test(piezas) && /<TituloDeVolumen [^>]*llegadaDe="por-que-develop"( queda)? \/>/.test(porQue) && (porQue.match(/llegadaDe="por-que-develop"/g) ?? []).length === 3, '  Portfolio y la frase, con la MISMA sección que su pieza del DOM (la que el viaje nombra al llegar)')

titulo('T1 · El DOM: el texto de siempre hasta que el título está armado; desde 1024')
const html = renderToStaticMarkup(<TituloDeVolumen id="portfolio" texto="Portfolio" lectura={0.47} llegada={null} salida={null} llegadaDe="trabajos" />)
const seLee = (h: string): boolean => h === '<span class="block">Portfolio</span>'
afirmar(seLee(html), 'en el servidor y hasta que la escena avisa: el texto, visible y anunciado (sin WebGL, o mientras llega el módulo, el título se lee)', html)
controlPositivo('el detector VE el texto escondido de entrada (el de la prueba de ESCENA 10)', '<span class="sr-only">Portfolio</span><span aria-hidden="true" class="invisible block">Portfolio</span>', seLee)
afirmar(/\{listo && <span className="sr-only hidden escritorio:block">\{texto\}<\/span>\}/.test(dom) && /className=\{listo \? 'block escritorio:invisible' : 'block'\}/.test(dom), '  armado: desde 1024 el lugar invisible y el texto para el lector; abajo, el de siempre (el corte es de CSS)')
afirmar(/activo: material !== 'no' && escritorio/.test(dom) && /const escritorio = useAnchoMinimo\(CONSULTA_ESCENARIO\)/.test(dom), '  abajo de 1024 ningún título se anota (las secciones no tienen escenario)')
// [PASADA FINAL] A1 · el armado por lotes vive en `sincronia.ts`: compila el lote (con las luces de la escena), calienta y recién ahí avisa.
afirmar(/calentar\(t\.gl, t\.escena, t\.camara\)\s*for \(const a of nuevos\) if \(armados\.includes\(a\)\) marcarListo\(a\.titulo\.id, true\)/.test(escena3d) && /marcarListo\(a\.titulo\.id, false\)/.test(escena3d), '  la escena avisa «listo» recién compilado y calentado, y lo retira al soltarlo')
const perezoso = sinComentarios(leer('_lib/escena/PruebasDeLaEscena.tsx'))
// [PULIDO 2] 5 · el montaje suma el CTA del final con `?cta=` (en cualquier ancho); los títulos siguen sólo desde 1024.
afirmar(/const escritorio = useAnchoMinimo\(CONSULTA_ESCENARIO\)/.test(perezoso) && /if \(entornoDeLaEscena\(\)\.titulos === 'no' \|\| \(!escritorio && !conElCta\)\) return null/.test(perezoso) && /\{escritorio && \(\s*<Suspense fallback=\{null\}>\s*<TitulosDeVolumen \{\.\.\.props\} \/>/.test(perezoso) && /const conElCta = varianteDelCta\(\) !== null/.test(perezoso), '  y abajo de 1024 el módulo de los títulos ni se descarga')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T2 · El sonido: con bandera, apagado en el producto')

// [RETOQUE 3D] El sonido pasó al producto (el parlante, apagado por defecto): la bandera `sonido=si` se borró.
afirmar(!('sonido' in ENTORNO.pruebas) && !('sonido' in entornoPedido('producto,sonido=si').pruebas), 'en el producto, sin bandera: el parlante apagado por defecto (`?pruebas=sonido=si` ya no pide nada)')
const montaje = sinComentarios(leer('_chrome/sonido/SonidoDelHome.tsx'))
// [RETOQUE 3D] El parlante pasó al producto (apagado por defecto): se monta siempre, después de hidratar.
afirmar(/const ControlDelSonido = lazy\(\(\) => import\('\.\/ControlDelSonido'\)\)/.test(montaje) && /const PruebaDeSonidos = lazy\(\(\) => import\('\.\/PruebaDeSonidos'\)\)/.test(montaje) && /const control = useSyncExternalStore\(sinCambios, \(\) => true, \(\) => false\)/.test(montaje) && /get\('sonidos'\) === '1'/.test(montaje) && /<SonidoDelHome \/>/.test(leer('_chrome/ChromeDelHome.tsx')), '  el parlante (en el producto, apagado) y la página de prueba (`?sonidos=1`), perezosos y decididos después de hidratar')

/** Los archivos de /v3 que importan howler o el motor sin `import()` (todo lo demás del sitio, sin el sonido). */
const ARCHIVOS_DE_V3 = execFileSync('git', ['ls-files', '-co', '--exclude-standard', V3], { encoding: 'utf8' }).split('\n').filter((r) => /\.(ts|tsx)$/.test(r) && !r.includes('__tests__'))
const importaElMotor = (fuente: string): boolean => /^import (?!type )[^\n]*from '(howler|[^']*sonido\/motor)'/m.test(fuente)
const conElMotor = ARCHIVOS_DE_V3.filter((r) => !r.endsWith('_lib/sonido/motor.ts') && importaElMotor(readFileSync(r, 'utf8')))
afirmar(conElMotor.length === 0 && /import\('\.\.\/\.\.\/_lib\/sonido\/motor'\)/.test(leer('_chrome/sonido/motorCompartido.ts')), 'howler y el archivo se descargan recién al prender: el motor llega sólo en un `import()`', conElMotor.join(', ') || 'ninguno lo importa de entrada')
controlPositivo('el detector VE una importación de entrada', "import { Howl } from 'howler'\n", (f: string) => !importaElMotor(f))

titulo('T2 · Nada suena sin el motor, y el motor llega con una acción')
const oidos: string[] = []
sonar('tic')
instalarElSonido({ sonar: (s) => oidos.push(s), callar: (s) => oidos.push(`-${s}`) })
sonar('clic')
callar('encendido') // [RETOQUE 3D] el amanecer se borró
instalarElSonido(null)
sonar('foto')
afirmarIgual(oidos, ['clic', '-encendido'], 'sin el motor instalado `sonar` y `callar` no hacen nada (el producto); con él, llegan')
const control = sinComentarios(leer('_chrome/sonido/ControlDelSonido.tsx'))
afirmar(/userActivation\?\.hasBeenActive === true\) cargar\(\)/.test(control) && /window\.addEventListener\('pointerdown', cargar, true\)/.test(control) && /window\.addEventListener\('keydown', cargar, true\)/.test(control), '  si quedó prendido de otra visita, el motor espera la primera acción en la página (un toque, una tecla)')
// [RETOQUE 3D] UN ambiente para toda la página (sin día ni noche).
afirmar(/motor\.current\?\.ambiente\(!reducido && document\.visibilityState === 'visible'\)/.test(control), '  con movimiento reducido (o la pestaña oculta), sin ambiente')

titulo('T2 · Lo que se recuerda: con try/catch')
const almacenQueTira = { getItem: (): never => { throw new Error('bloqueado') }, setItem: (): never => { throw new Error('bloqueado') }, removeItem: (): never => { throw new Error('bloqueado') } }
const conAlmacen = <T,>(almacen: unknown, f: () => T): T => {
  const g = globalThis as unknown as { window?: unknown }
  const antes = g.window
  g.window = { localStorage: almacen }
  try {
    return f()
  } finally {
    g.window = antes
  }
}
const sinAlmacen = conAlmacen(almacenQueTira, () => {
  guardarPrendido(false)
  return { prendido: leerPrendido(), volumenes: leerVolumenes() }
})
afirmar(sinAlmacen.prendido === false && sinAlmacen.volumenes.tic === SONIDOS.tic.volumen && sinAlmacen.volumenes.general === VOLUMEN_GENERAL, 'con el almacenamiento bloqueado (ventana privada, vista previa) no tira: apagado y los volúmenes del catálogo')
controlPositivo('el almacén de prueba de verdad tira', almacenQueTira, (a: typeof almacenQueTira) => {
  try {
    a.getItem()
    return true
  } catch {
    return false
  }
})

titulo('T2 · Bajo, corto, un solo sprite')
const pesos = { webm: statSync('public/v3/sonido/sonidos.webm').size, m4a: statSync('public/v3/sonido/sonidos.m4a').size }
const liviano = (p: { webm: number; m4a: number }): boolean => p.webm < 200 * 1024 && p.m4a < 200 * 1024
afirmar(liviano(pesos), 'un sprite de menos de 200 KB en cada formato (Opus y, para Safari, AAC)', `${String(Math.round(pesos.webm / 1024))} KB y ${String(Math.round(pesos.m4a / 1024))} KB`)
controlPositivo('el detector VE un sprite de 250 KB', { webm: 250 * 1024, m4a: 100 }, liviano)
const nombres = Object.keys(CORTES_DEL_SPRITE)
// [RETOQUE 3D] Se fueron el túnel, el amanecer y los ambientes (el ambiente es uno, en su archivo); llegaron los candidatos.
// [CIERRE RETOQUE 3D] S1: el clic de la barra y de los CTA, el pestillo (los otros candidatos se borraron).
afirmarIgual(nombres.sort(), ['abre', 'cierra', 'clic', 'encendido', 'foto', 'pestillo', 'pulso', 'tic'], '  los del pedido, en el mismo archivo')
afirmar(Object.values(CORTES_DEL_SPRITE).every((c) => (c.length as number) === 2 && c[1] <= 6000), '  ninguno es un bucle (el ambiente va aparte); ninguno pasa de 6 s')
afirmar(VOLUMEN_GENERAL <= 0.7 && Object.values(SONIDOS).every((s) => s.volumen <= 1), '  bajo: el general 0,7 (cada uno con el volumen que eligió Valentino)')
const doc = readFileSync('docs/rediseno/SONIDO.md', 'utf8')
afirmar(/CC0/.test(doc) && /howler\.js\*\* 2\.2\.4[^|]*\| MIT/.test(doc) && nombres.every((n) => doc.includes(`\`${n}\``)), '  la fuente y la licencia de cada uno, en `docs/rediseno/SONIDO.md` (generados acá: CC0; howler, MIT)')

titulo('T2 · Dónde suena (en la escena, sólo en un cambio)')
const entornoTsx = sinComentarios(leer('_lib/escena/entorno/Entorno.tsx'))
// [RETOQUE 3D] Sin el soplido del túnel ni el crescendo del amanecer (se borraron).
afirmar(/if \(m\.pulso\.anillos !== antes\.anillos && nacioUnPrincipal\(m\.pulso, t\)\) sonar\('pulso'\)/.test(entornoTsx) && /if \(m\.encendido\.fase === 'encendiendo'\) sonar\('encendido'\)/.test(entornoTsx) && !/sonar\('tunel'\)/.test(entornoTsx), 'el principal que nace y el guion del haz que arranca: preguntados sólo cuando algo cambió')
afirmar(!/sonar\(|callar\(/.test(sinComentarios(leer('_lib/escena/amanecer/Amanecer.tsx'))), '  el amanecer ya no suena')
afirmar(/if \(el !== null && el !== senalado\.current\) sonar\('tic'\)/.test(leer('_chrome/barra/BarraDelHome.tsx')) && (leer('_chrome/menu/MenuDeVidrio.tsx').match(/sonar\('(abre|cierra)'\)/g) ?? []).length === 2 && (leer('_secciones/trabajos/demos/VentanaDeDemo.tsx').match(/sonar\('(abre|cierra)'\)/g) ?? []).length === 2 && (leer('_secciones/quienes-somos/marco.tsx').match(/sonar\('foto'\)/g) ?? []).length === 3, '  en el DOM: la barra (tic), el Genie del menú y de las demos (abre, cierra), las fotos (el mouse, el foco y el toque)')

cerrar('s40-3d-sonido')
