/**
 * s78 · C2-31m (cola 2, 2026-10-23) · EL MOIRÉ DEL MOUSE, POR DEFECTO Y SIN LÍNEAS NEGRAS, sin navegador. Cada afirmación con su control
 * positivo. Lo que se ve (las líneas junto al cursor, las fotos antes y después, el costo por cuadro) lo mide `scripts-carga/moire.ts`
 * en el navegador (con `CONTROL=con-lineas`). El plan y el log, en `docs/rediseno/SPRINT-C2-31-moire.md`.
 *
 *   1 · `mouse` es el moiré (sin bandera) y las otras variantes (`0`, `1`, `2`) no tienen código;
 *   2 · la entrada de afuera (para la inclinación del teléfono, tarea 81): el mismo rango que el mouse y el mismo corrimiento;
 *   3 · las líneas negras: eran los costados de la loma que el piso levantaba bajo el cursor (no la trama); en el producto, sin loma;
 *   4 · el costo por cuadro no sube: un dibujo de la trama (B8 dibujaba dos por defecto) y el piso sin el rayo del cursor.
 */
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { BASE_LIMPIA, ENTORNO, entornoPedido, pedidoDeLaUrl } from '../escena/entorno'
import { FORMACION } from '../escena/formacion/enFormacion'
import { punteroDeLaInclinacion } from '../escena/giroscopio'
import { RANGO_DE_LA_ENTRADA, fijarLaEntradaDelMoire, hayEntradaDeAfuera, laEntradaDelMoire, type PosicionDeLaEntrada } from '../escena/moire/entrada'
import * as FIJO from '../escena/moire/fijo'
import { PISO_VIVO } from '../escena/piso/bloques'
import { PUNTERO_DE_LA_ORBITA, moverElPunteroDeLaOrbita } from '../escena/punteroDeLaOrbita'
import { MOIRE_COARSE_CELLS } from '../escena/probeMoire'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const ESCENA = path.join(process.cwd(), 'src/app/v3/_lib/escena')
const leer = (rel: string): string => readFileSync(path.join(ESCENA, rel), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
const fuentes = (dir: string): [string, string][] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e): [string, string][] => {
    const ruta = path.join(dir, e.name)
    if (e.isDirectory()) return e.name === '__tests__' ? [] : fuentes(ruta)
    return /\.tsx?$/.test(e.name) ? [[path.relative(ESCENA, ruta).replace(/\\/g, '/'), sinComentarios(readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n'))]] : []
  })

// ── 1 · `mouse` por defecto, las otras borradas ─────────────────────────────
titulo('1 · el moiré es el que seguía al mouse, sin bandera; `0`, `1` y `2` no tienen código')
const sinBandera = (e: object, url: typeof pedidoDeLaUrl): boolean => !('moire' in e) && ['?moire=0', '?moire=1', '?moire=2', '?moire=mouse'].every((q) => url(q) === null)
afirmar(sinBandera(ENTORNO, pedidoDeLaUrl) && !('moire' in BASE_LIMPIA) && !('moire' in entornoPedido('producto,moire=0')), 'el entorno no tiene la variante del moiré y `?moire=…` ya no pide nada (ni en la URL ni en el banco)')
controlPositivo('  el detector VE la URL de B8 (pasaba `?moire=`)', ((q: string) => (q.startsWith('?moire=') ? `producto,${q.slice(1)}` : null)) as typeof pedidoDeLaUrl, (u: typeof pedidoDeLaUrl) => sinBandera(ENTORNO, u))
const DE_LAS_VARIANTES = ['VARIANTES_DEL_MOIRE', 'MOIRE_POR_DEFECTO', 'varianteDelMoire', 'disposicionDelMoire', 'DESAJUSTE_COPLANAR']
const sinVariantes = (m: object): boolean => DE_LAS_VARIANTES.every((k) => !(k in m)) && 'corrimientoPorElMouse' in m && 'MOUSE_DEL_MOIRE' in m
afirmar(sinVariantes(FIJO), '`moire/fijo.ts` exporta sólo la rendija del mouse (el tope y el corrimiento): sin variantes, defecto ni desajuste', Object.keys(FIJO).join(', '))
controlPositivo('  el detector VE el `fijo.ts` de B8', { ...FIJO, VARIANTES_DEL_MOIRE: ['0', '1', '2', 'mouse'], MOIRE_POR_DEFECTO: '2' }, sinVariantes)
const FUENTES = fuentes(ESCENA)
const RESTOS = /disposicionDelMoire|VARIANTES_DEL_MOIRE|MOIRE_POR_DEFECTO|DESAJUSTE_COPLANAR|varianteDelMoire|PEDIDOS_DEL_MOIRE|entornoDeLaEscena\(\)\.moire|pedido\.moire|sigueAlMouse/
const conRestos = (l: readonly (readonly [string, string])[]): string[] => l.filter(([, c]) => RESTOS.test(c)).map(([r]) => r)
afirmar(conRestos(FUENTES).length === 0, `  y nada en la escena (${String(FUENTES.length)} módulos, sin comentarios) lee una variante`, conRestos(FUENTES).join(', '))
controlPositivo('  el detector VE la pantalla de B8 (elegía las capas por la variante)', [...FUENTES, ['MoireScreen.tsx', 'const disposicion = disposicionDelMoire(entornoDeLaEscena().moire)'] as const], (l: readonly (readonly [string, string])[]) => conRestos(l).length === 0)
const PANTALLA = sinComentarios(leer('MoireScreen.tsx'))
const unaCapa = (c: string): boolean => (c.match(/<mesh\b/g) ?? []).length === 2 && (c.match(/name="trama gruesa"/g) ?? []).length === 1 && !/trama fina|\.map\(\(layer\)|moireMismatch|createDottedGridCellData|store/.test(c)
afirmar(unaCapa(PANTALLA), 'la pantalla dibuja la capa gruesa (y su zócalo): sin la fina, sin el desajuste del slider y sin el store')
controlPositivo('  el detector VE la pantalla de B8 (las dos capas, por variante)', PANTALLA.replace('name="trama gruesa"', "name={layer === layers.coarse ? 'trama gruesa' : 'trama fina'}"), unaCapa)
const DEL_MOUSE = sinComentarios(leer('moire/MoireDelMouse.tsx'))
const siempreMontada = (c: string): boolean => !/return null\s*\n\s*return </.test(c) && /export function MoireDelMouse\(\{ moireRef, quieto \}: Props\) \{\n\s*const puntero = useRef/.test(c) && /laEntradaDelMoire\(punteroDeLaOrbita\(state\.pointer\.x, state\.pointer\.y\)\)/.test(c) && /corrimientoPorElMouse\(moire\.gruesa\.offset, puntero\.current, moire\.gruesa\.repeat\.x\)/.test(c)
afirmar(siempreMontada(DEL_MOUSE), 'la rendija sigue al mouse siempre (no depende de una variante): lee la entrada (el mouse o la de afuera) y corre la gruesa')
controlPositivo('  el detector VE la rendija de B8 (sólo con `?moire=mouse`)', DEL_MOUSE.replace('export function MoireDelMouse({ moireRef, quieto }: Props) {\n', 'export function MoireDelMouse({ moireRef, quieto }: Props) {\n  if (capa === null || quieto) return null\n  return <RendijaDelMouse />\n}\nfunction RendijaDelMouse() {\n'), siempreMontada)
const ESCENARIO = leer('ProbeStage.tsx')
const montaLaRendija = (s: string): boolean => /<MoireDelMouse moireRef=\{moireRef\} quieto=\{reducedMotion\} \/>/.test(s) && /<MoireScreen ref=\{moireRef\} hastaElPiso=/.test(s)
afirmar(montaLaRendija(ESCENARIO), '  el escenario monta la pantalla (sin el store) y la rendija, con el movimiento reducido')
controlPositivo('  el detector VE el escenario de B8 (la pantalla con el store del desajuste)', ESCENARIO.replace('<MoireScreen ref={moireRef} hastaElPiso=', '<MoireScreen ref={moireRef} store={store} hastaElPiso='), montaLaRendija)

// ── 2 · la entrada de afuera ────────────────────────────────────────────────
titulo('2 · la entrada de afuera (la inclinación del teléfono, tarea 81): el rango del mouse y el mismo corrimiento')
// El rango del mouse: el puntero de la órbita en las esquinas de la ventana, y el del giroscopio inclinado de más.
const p = { ...PUNTERO_DE_LA_ORBITA }
const esquinas: number[] = []
for (const [x, y] of [[0, 0], [1440, 900], [720, 450]] as const) {
  moverElPunteroDeLaOrbita(p, x, y, 1440, 900, false)
  esquinas.push(p.x, p.y)
}
const giro = [punteroDeLaInclinacion(90, 90, { beta: 0, gamma: 0 }, 0), punteroDeLaInclinacion(-90, -90, { beta: 0, gamma: 0 }, 0)].flatMap((q) => [q.x, q.y])
const [minMouse, maxMouse] = [Math.min(...esquinas, ...giro), Math.max(...esquinas, ...giro)]
afirmar(RANGO_DE_LA_ENTRADA.min === minMouse && RANGO_DE_LA_ENTRADA.max === maxMouse && minMouse === -1 && maxMouse === 1, `el rango de la entrada es el del mouse (las esquinas de la ventana) y el del giroscopio: de ${String(RANGO_DE_LA_ENTRADA.min)} a ${String(RANGO_DE_LA_ENTRADA.max)}`, `mouse y giroscopio de ${String(minMouse)} a ${String(maxMouse)}`)
/** Lo que sale de la entrada para un valor de afuera (y la suelta otra vez). */
const deAfuera = (q: PosicionDeLaEntrada): PosicionDeLaEntrada => {
  fijarLaEntradaDelMoire(q)
  const r = laEntradaDelMoire({ x: 0.123, y: -0.456 })
  const out = { x: r.x, y: r.y }
  fijarLaEntradaDelMoire(null)
  return out
}
const MOUSE = { x: 0.31, y: -0.62 }
interface LaEntrada {
  readonly fijar: (q: PosicionDeLaEntrada | null) => void
  readonly leer: (m: PosicionDeLaEntrada) => PosicionDeLaEntrada
  readonly hay: () => boolean
}
const LA_DEL_PRODUCTO: LaEntrada = { fijar: fijarLaEntradaDelMoire, leer: laEntradaDelMoire, hay: hayEntradaDeAfuera }
const manda = (e: LaEntrada): boolean => {
  e.fijar(null)
  const sinAfuera = e.leer(MOUSE) === MOUSE && !e.hay()
  e.fijar({ x: 0.4, y: -0.2 })
  const r = e.leer(MOUSE)
  const conAfuera = e.hay() && r.x === 0.4 && r.y === -0.2
  e.fijar(null)
  return sinAfuera && conAfuera && e.leer(MOUSE) === MOUSE && !e.hay()
}
afirmar(manda(LA_DEL_PRODUCTO), 'sin entrada de afuera manda el mouse (el mismo objeto, sin copiarlo); con una, ésa; con `null`, el mouse otra vez')
controlPositivo('  el detector VE una entrada que ignora la de afuera', { ...LA_DEL_PRODUCTO, leer: (m: PosicionDeLaEntrada) => m }, manda)
const acotada = (f: (q: PosicionDeLaEntrada) => PosicionDeLaEntrada): boolean => {
  const a = f({ x: 3, y: -7 })
  const b = f({ x: Number.NaN, y: Number.POSITIVE_INFINITY })
  return a.x === 1 && a.y === -1 && b.x === 0 && b.y === 0
}
afirmar(acotada(deAfuera), '  fuera de rango se acota (como el puntero fuera de la ventana) y lo que no es un número vale 0')
controlPositivo('  el detector VE una entrada en grados sin acotar (la inclinación cruda)', (q: PosicionDeLaEntrada) => ({ x: q.x * 18, y: q.y * 14 }), acotada)
// El mismo corrimiento: para una grilla del rango, la de afuera corre la trama lo mismo que el mouse en esa posición (y el tope es el mismo).
const corre = (q: PosicionDeLaEntrada): [number, number] => {
  const o = { x: 0, y: 0 }
  FIJO.corrimientoPorElMouse(o, q, MOIRE_COARSE_CELLS)
  return [o.x, o.y]
}
const mismoCorrimiento = (f: (q: PosicionDeLaEntrada) => PosicionDeLaEntrada): boolean => {
  for (let x = -1; x <= 1.0001; x += 0.25) for (let y = -1; y <= 1.0001; y += 0.25) {
    const [a, b] = [corre({ x, y }), corre(f({ x, y }))]
    if (Math.abs(a[0] - b[0]) > 1e-12 || Math.abs(a[1] - b[1]) > 1e-12) return false
  }
  return true
}
const tope = (FIJO.MOUSE_DEL_MOIRE.topeGrados / 360) * MOIRE_COARSE_CELLS
afirmar(mismoCorrimiento(deAfuera) && Math.abs(corre(deAfuera({ x: 1, y: 1 }))[0] - tope) < 1e-12, `la de afuera corre la trama lo mismo que el mouse en todo el rango (81 puntos), con el mismo tope (${tope.toFixed(4)} de vuelta de textura)`)
controlPositivo('  el detector VE una entrada con otro rango (de 0 a 1, como una fracción de la pantalla)', (q: PosicionDeLaEntrada) => ({ x: (q.x + 1) / 2, y: (q.y + 1) / 2 }), mismoCorrimiento)
const ENTRADA = sinComentarios(leer('moire/entrada.ts'))
const pura = (c: string): boolean => !/\bwindow\b|deviceorientation|DeviceOrientationEvent|giroscopio|INCLINACION_DEL_TELEFONO|addEventListener/.test(c)
// [C2-81] La 81 la conectó: el giroscopio la fija con cada lectura y la suelta al callar (lo prueba en el tiempo `s78-c2-81`).
afirmar(pura(ENTRADA) && sinComentarios(leer('giroscopio.ts')).includes('fijarLaEntradaDelMoire(INCLINACION_DEL_TELEFONO)') && /fijarLaEntradaDelMoire\(null\)/.test(sinComentarios(leer('giroscopio.ts'))), '  la entrada no escucha el sensor por su cuenta: la fija el giroscopio (conectada por la 81)')
controlPositivo('  el detector VE una entrada que escucha el sensor por su cuenta', `${ENTRADA}\nwindow.addEventListener('deviceorientation', () => undefined)`, pura)

// ── 3 · las líneas negras ───────────────────────────────────────────────────
titulo('3 · las líneas negras junto al cursor: los costados de la loma del piso (no la trama); en el producto, sin loma')
// La loma quieta que la simulación del piso levantaba bajo el cursor (`bloques.ts`, `SIMULACION_GLSL`): el estado estacionario de la
// ecuación de ondas con su resorte al reposo y el del cursor, en la grilla del escenario de la formación, con el tope suave del dibujo.
const LADO = PISO_VIVO.lado * (FORMACION.radioDelEscenario / PISO_VIVO.radioDeReferencia)
function lomaQuieta(presencia: number, corrido: number): { readonly alto: number; readonly escalon: number } {
  const N = 41
  const k2 = (PISO_VIVO.onda.velocidad / LADO) ** 2
  const radio = PISO_VIVO.cursor.radio / LADO
  const h = new Float64Array(N * N)
  const en = (i: number, j: number): number => (i < 0 || j < 0 || i >= N || j >= N ? 0 : h[j * N + i])
  for (let vuelta = 0; vuelta < 3000; vuelta += 1) {
    for (let j = 0; j < N; j += 1) {
      for (let i = 0; i < N; i += 1) {
        const [px, py] = [i - (N - 1) / 2 - corrido, j - (N - 1) / 2 - corrido]
        const g = Math.exp(-(px * px + py * py) / (radio * radio))
        const cruzN = en(i + 1, j) + en(i - 1, j) + en(i, j + 1) + en(i, j - 1)
        const esquinasN = en(i + 1, j + 1) + en(i - 1, j + 1) + en(i + 1, j - 1) + en(i - 1, j - 1)
        const resorte = PISO_VIVO.cursor.rigidez * presencia * g
        h[j * N + i] = ((k2 * (4 * cruzN + esquinasN)) / 6 + resorte * PISO_VIVO.cursor.alto * g) / ((k2 * 20) / 6 + PISO_VIVO.onda.vuelta + resorte)
      }
    }
  }
  const t = PISO_VIVO.onda.tope
  const dibujo = Array.from(h, (x) => t * Math.tanh(x / t))
  let [alto, escalon] = [0, 0]
  for (let j = 0; j < N; j += 1) {
    for (let i = 0; i < N; i += 1) {
      alto = Math.max(alto, dibujo[j * N + i])
      if (i + 1 < N) escalon = Math.max(escalon, Math.abs(dibujo[j * N + i] - dibujo[j * N + i + 1]))
      if (j + 1 < N) escalon = Math.max(escalon, Math.abs(dibujo[j * N + i] - dibujo[(j + 1) * N + i]))
    }
  }
  return { alto, escalon }
}
const suave = (a: number, b: number, x: number): number => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return k * k * (3 - 2 * k)
}
/** La luz del costado de un escalón al pie (donde se junta con la tapa del de adelante), relativa a la tapa: el fragmento de `conPisoVivo`. */
const pieDelCostado = (escalon: number): number => {
  const { costado, rendija, escalon: umbral } = PISO_VIVO.luz
  return 1 + (costado * (1 - rendija[0]) - 1) * suave(umbral[0], umbral[1], escalon)
}
/** Una raya: el pie del costado más oscuro que 0,75 de la tapa (la captura `lote3/01` las tiene en ~0,59 del piso). */
const hayRaya = (escalon: number): boolean => pieDelCostado(escalon) < 0.75
const [enElCentro, enLaEsquina] = [lomaQuieta(1, 0), lomaQuieta(1, 0.5)]
const peor = Math.max(enElCentro.escalon, enLaEsquina.escalon)
const mejor = Math.min(enElCentro.escalon, enLaEsquina.escalon)
afirmar(hayRaya(mejor), `con la loma de antes (presencia 1) cada fila sube hasta ${mejor.toFixed(3)} a ${peor.toFixed(3)} u sobre la de adelante (la loma, ${enElCentro.alto.toFixed(2)} u): el pie del costado queda a ${pieDelCostado(peor).toFixed(2)} a ${pieDelCostado(mejor).toFixed(2)} de la tapa, una raya por fila`, `bloque de ${LADO.toFixed(3)} u`)
const sinLoma = lomaQuieta(0, 0)
afirmar(sinLoma.alto === 0 && !hayRaya(sinLoma.escalon), '  sin presencia del cursor la simulación no levanta nada: ninguna raya')
controlPositivo('  el detector VE la raya de la loma de antes (con presencia)', peor, (e: number) => !hayRaya(e))
// En el producto la presencia queda en cero: sólo se mueve adentro de `if (conLoma)`, y `conLoma` es sólo el defecto del banco.
const PISO = sinComentarios(leer('piso/PisoVivo.tsx'))
const sinLaLoma = (c: string): boolean => {
  const bloque = c.slice(c.indexOf('if (conLoma) {'), c.indexOf('atenderLaOnda(state.camera'))
  const fuera = c.replace(bloque, '')
  return c.includes('const conLoma = useMemo(() => lomaDelCursorPedida(), [])') && bloque.includes('m.presencia +=') && bloque.includes('intersectPlane') &&
    !/m\.presencia \+?=/.test(fuera) && !/intersectPlane/.test(fuera) && /__defectosDeLaIntro\?: unknown \}\)\.__defectosDeLaIntro === LOMA_DEL_CURSOR\.defecto/.test(c) && /defecto: 'sin-loma'/.test(c)
}
afirmar(sinLaLoma(PISO), '[L1] en el producto el cursor empuja el piso (la loma volvió): la presencia (y el rayo al piso) corre salvo con el defecto del banco `sin-loma` (nunca la URL)')
controlPositivo('  el detector VE el piso de antes (la presencia subía con el mouse siempre)', PISO.replace('if (conLoma) {', '{'), sinLaLoma)
// No era la trama: el piso no lee la textura de la trama salvo los cuadros de sol del amanecer (que sólo existen mientras amanece).
const noLeeLaTrama = (c: string): boolean => /conElAmanecer\(material, true\)/.test(c) && !/uTramaGruesa|leerLaTrama|MoireHandle/.test(c)
afirmar(noLeeLaTrama(PISO), '  y no era la trama: el piso sólo la lee en los cuadros de sol del amanecer (`uRayos`, mientras amanece), no junto al cursor')
controlPositivo('  el detector VE un piso que lee la trama', `${PISO}\nconst t = TRAMA_EN_VIVO.uTramaGruesa`, noLeeLaTrama)

// ── 4 · el costo ────────────────────────────────────────────────────────────
titulo('4 · el costo por cuadro no sube')
const dibujosDeLaTrama = (c: string): number => (c.match(/<mesh\b/g) ?? []).length + (c.match(/\.map\(\(layer\) =>/g) ?? []).length
const unDibujo = (c: string): boolean => dibujosDeLaTrama(c) === 2
afirmar(unDibujo(PANTALLA), 'la trama se dibuja en una capa y su zócalo (B8 por defecto: dos capas y el zócalo); la rendija es la misma cuenta por cuadro que `mouse`', `${String(dibujosDeLaTrama(PANTALLA))} mallas`)
controlPositivo('  el detector VE las dos capas de B8', `${PANTALLA}\n{[a, b].map((layer) => null)}`, unDibujo)
const reserva = /new THREE\.|new [A-Z]\w*\(|useMemo|useState|\{ x: |\[\.\.\./
const sinReservas = (c: string): boolean => !reserva.test(c.slice(c.indexOf('useFrame(')))
afirmar(sinReservas(DEL_MOUSE), '  la rendija no reserva nada por cuadro (sólo escribe el corrimiento)')
controlPositivo('  el detector VE una rendija que arma un objeto por cuadro', DEL_MOUSE.replace('const p = laEntradaDelMoire(', 'const p = { x: 0, y: 0, ...laEntradaDelMoire('), sinReservas)

cerrar('s78-c2-31m')
