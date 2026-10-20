/**
 * [B1.2d A2] s76 · LOS AJUSTES DE A (`docs/rediseno/SPRINT-B1-PORTFOLIO.md` §14.4), sin navegador: el medio del panel que baja cuando la
 * píldora corrida se le mete (A2.1) y la ráfaga que no recorre el Portfolio (A2.3). (El tiempo de la píldora, A2.2, está en el orden: §19
 * de `s76-portfolio-b12c.tsx`.) Cada afirmación con su control positivo. Lo medido en el sitio lo corre el arnés (`MODO=a2` y
 * `MODO=rafaga` de `scripts-carga/matriz.ts`).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { GESTOS_DE_RAFAGA, RAFAGAS, combinacionesDeRafaga, violacionesDeLaRafaga } from '../../../../../scripts-carga/a8'

import { CORRIMIENTO, despejeActual, despejeDelMedio, publicarElPanel, publicarLaPastilla, type PastillaEnReposo, type PedidoDeCorrimiento } from '../../_chrome/barra/corrimiento'
import { PANTALLAS_POR_PASO, PX_DE_LA_APROXIMACION, pxDeLaSalida } from '../../_secciones/trabajos/portfolio/pasos'
import { RAFAGA, calibracionDeLaRafaga, entraConLaRafaga, rafagaDeLaRueda, type CalibracionDeLaRafaga, type EventoDelRastro } from '../../_secciones/trabajos/portfolio/rueda'
import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const PORTFOLIO = '_secciones/trabajos/portfolio'

export function afirmarA2(): void {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d A2 · 39 · A2.1 · Con la píldora corrida metida en el panel, el medio baja: 16 px debajo de ella')

  // Medido en el sitio (§14.1): la píldora mide 538 px y el botón de sonido termina en 80; la columna es la mitad y el eje, su medio.
  const PASTILLA: PastillaEnReposo = { ancho: 538, abajo: 76, finDelSonido: 80, puede: true }
  const panel = (ancho: number): PedidoDeCorrimiento => ({ eje: ancho / 4, borde: ancho / 2 })
  type Despeje = (p: PedidoDeCorrimiento | null, q: PastillaEnReposo | null) => number | null
  const reparte = (f: Despeje): boolean =>
    f(panel(1440), PASTILLA) === null && [1280, 1180, 1024].every((a) => f(panel(a), PASTILLA) === PASTILLA.abajo + CORRIMIENTO.aire) &&
    f(panel(1280), { ...PASTILLA, puede: false }) === null && f(null, PASTILLA) === null
  afirmar(reparte(despejeDelMedio), `a 1440 nada (la píldora entra en la columna con su aire); a 1280, 1180 y 1024 el medio arranca ${String(CORRIMIENTO.aire)} px debajo del borde de abajo de la píldora; abajo de 1024 (o en el menú), nada`)
  controlPositivo('  el detector ve un despeje sin el aire (a 1280 la píldora queda a 6 px del panel y el medio no bajaría)', (p: PedidoDeCorrimiento | null, q: PastillaEnReposo | null) => (p === null || q === null || !q.puede ? null : 96 + q.ancho > p.borde ? q.abajo + 16 : null), reparte)
  controlPositivo('  y uno que baja también a 1440', (p: PedidoDeCorrimiento | null, q: PastillaEnReposo | null) => (p === null || q === null || !q.puede ? null : q.abajo + 16), reparte)
  publicarElPanel(panel(1024))
  publicarLaPastilla(PASTILLA)
  const conLasDos = despejeActual()
  publicarLaPastilla(null)
  const sinLaPastilla = despejeActual()
  publicarElPanel(null)
  afirmarIgual([conLasDos, sinLaPastilla], [PASTILLA.abajo + CORRIMIENTO.aire, null], '  el despeje sale del almacén de la barra (la píldora en reposo) y del Portfolio (la geometría del panel), y se suelta con cualquiera de los dos')
  const tira = sinComentarios(leer(`${PORTFOLIO}/Tira.tsx`))
  const hook = sinComentarios(leer('_chrome/barra/useCorrimientoDeLaPastilla.ts'))
  const delPortfolio = sinComentarios(leer(`${PORTFOLIO}/useBarraDelPortfolio.ts`))
  const cableado = (t: string, h: string, p: string): boolean =>
    /const despeje = useDespejeDelMedio\(\)/.test(t) && /id=\{ids\.medio\}[^>]*style=\{despeje === null \? undefined : \{ paddingTop: despeje \}\}/.test(t) &&
    /publicarLaPastilla\(\{ ancho, abajo: el\.getBoundingClientRect\(\)\.bottom, finDelSonido: sonido - origen, puede \}\)/.test(h) &&
    /if \(geometria !== null\) publicarElPanel\(geometria\)/.test(p)
  afirmar(cableado(tira, hook, delPortfolio), '  el medio de cada tira lo lee (sólo su relleno de arriba: la sección no cambia de alto); la barra publica su píldora en reposo y el Portfolio, su panel, SIEMPRE (el medio no salta cuando la píldora vuelve)')
  controlPositivo('  el detector ve un Portfolio que publica el panel sólo con la barra', [tira, hook, delPortfolio.replace('if (geometria !== null) publicarElPanel(geometria)', 'if (geometria !== null && barra) publicarElPanel(geometria)')] as const, ([t, h, p]: readonly [string, string, string]) => cableado(t, h, p))

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d A2 · 40 · A2.3 · La ráfaga: el Portfolio no se recorre')

  type Rafaga = (r: readonly EventoDelRastro[], px: number, t: number, c?: CalibracionDeLaRafaga) => { readonly rastro: readonly EventoDelRastro[]; readonly sentido: 1 | -1 | null }
  const sentidos = (f: Rafaga, eventos: readonly (readonly [number, number])[]): (1 | -1 | null)[] => {
    let rastro: readonly EventoDelRastro[] = []
    return eventos.map(([t, px]) => {
      const r = f(rastro, px, t)
      rastro = r.rastro
      return r.sentido
    })
  }
  const muescas = (n: number, cada: number, signo = 1): (readonly [number, number])[] => Array.from({ length: n }, (_, k) => [k * cada, 100 * signo] as const)
  const trackpad = (n: number, px: number): (readonly [number, number])[] => Array.from({ length: n }, (_, k) => [k * 16, px] as const)
  const reconoce = (f: Rafaga): boolean =>
    sentidos(f, muescas(3, 100)).at(-1) === 1 && sentidos(f, muescas(3, 100, -1)).at(-1) === -1 &&
    sentidos(f, muescas(2, 100)).every((s) => s === null) && sentidos(f, muescas(3, 200)).every((s) => s === null) &&
    sentidos(f, trackpad(19, 20)).at(-1) === 1 && sentidos(f, trackpad(19, 6)).every((s) => s === null) &&
    sentidos(f, [[0, 100], [50, -100], [100, 100], [150, 100]]).every((s) => s === null)
  afirmar(reconoce(rafagaDeLaRueda), `es ráfaga con ${String(RAFAGA.muescas)} muescas en menos de ${String(RAFAGA.ventanaMs)} ms, o con un trackpad a esa velocidad (${String(RAFAGA.pxPorMuesca)} px por muesca); dos muescas, tres espaciadas, un trackpad lento o un cambio de sentido, no`)
  controlPositivo('  el detector ve una ráfaga que no mira el tiempo (tres muescas sueltas la dispararían)', (r: readonly EventoDelRastro[], px: number, t: number) => {
    const rastro = [...r, { t, px }]
    return { rastro, sentido: rastro.length >= 3 ? (1 as const) : null }
  }, reconoce)
  const calibra = (f: (b: string) => CalibracionDeLaRafaga): boolean => {
    const a = f('?rafaga=4-250')
    const b = f('?rafaga=2')
    return a.muescas === 4 && a.ventanaMs === 250 && b.muescas === 2 && b.ventanaMs === RAFAGA.ventanaMs && f('?rafaga=no').muescas === Number.POSITIVE_INFINITY && f('').muescas === RAFAGA.muescas && f('?rafaga=xyz').muescas === RAFAGA.muescas
  }
  afirmar(calibra(calibracionDeLaRafaga), '  calibrable con `?rafaga=` (las muescas y la ventana: `4-250`; `no`, apagada); sin la bandera o con algo que no es un número, la de siempre')
  controlPositivo('  el detector ve una calibración que no lee la URL', () => RAFAGA, calibra)
  const salida = pxDeLaSalida(PANTALLAS_POR_PASO)
  const entra = (f: (px: number, hacia: number, s: 1 | -1, paso: number) => boolean): boolean =>
    f(450, PX_DE_LA_APROXIMACION + 50, 1, PANTALLAS_POR_PASO) && !f(450, PX_DE_LA_APROXIMACION - 50, 1, PANTALLAS_POR_PASO) && !f(salida + 400, salida + 900, 1, PANTALLAS_POR_PASO) &&
    f(salida + 400, salida - 100, -1, PANTALLAS_POR_PASO) && !f(salida + 400, salida + 100, -1, PANTALLAS_POR_PASO) && !f(450, 0, -1, PANTALLAS_POR_PASO)
  afirmar(entra(entraConLaRafaga), '  la ráfaga «entra al tramo» si Lenis la lleva más allá del pin (bajando desde antes de la salida) o más acá de la salida (subiendo desde la cola); si no, es de la página')
  controlPositivo('  el detector ve una entrada que no mira adónde va la página (cualquier ráfaga cerca saltearía)', (px: number, _hacia: number, s: 1 | -1) => (s > 0 ? px < salida : px >= PX_DE_LA_APROXIMACION), entra)
  const rueda = sinComentarios(leer(`${PORTFOLIO}/useRuedaDelPortfolio.ts`))
  const mandos = sinComentarios(leer(`${PORTFOLIO}/useMandosDelPortfolio.ts`))
  const cableadoDeLaRafaga = (r: string, m: string): boolean =>
    /const calibracion = calibracionDeLaRafaga\(window\.location\.search\)/.test(r) &&
    /const r = rafagaDeLaRueda\(rastro, px, ahora, calibracion\)[\s\S]*?if \(r\.sentido !== null && !enUnDialogo\(\) && c\.rafaga\(r\.sentido, px\)\) \{[\s\S]*?return\s*\}\s*const activa = c\.manda\(\)/.test(r) &&
    /if \(vuelo !== null && vuelo === vueloDeLaRafaga\.current\) return true/.test(m) && /const hacia = pxDelScroll\(lenis\.targetScroll \+ px \* lenis\.options\.wheelMultiplier, medida\.tope, medida\.alto\)\s*if \(!entraConLaRafaga\(medida\.px, hacia, sentido, PANTALLAS_POR_PASO\)\) return false/.test(m) &&
    /ir\(destino, true\)\s*vueloDeLaRafaga\.current = enVuelo\.current/.test(m)
  afirmar(cableadoDeLaRafaga(rueda, mandos), '  la ráfaga se mira ANTES que el gesto de a un proyecto: adentro sale (a Demos o hacia arriba, la salida de siempre), afuera saltea si entra al tramo (el paso de destino ya: ni la píldora ni el panel) y el resto de la ráfaga se traga mientras vuela')
  controlPositivo('  el detector ve la rueda de A (sin la ráfaga: el gesto de a un proyecto manda)', [rueda.replace('if (r.sentido !== null && !enUnDialogo() && c.rafaga(r.sentido, px)) {', 'if (false) {'), mandos] as const, ([r, m]: readonly [string, string]) => cableadoDeLaRafaga(r, m))
  controlPositivo('  y la ráfaga que mira el destino de Lenis sin el evento de ahora (Lenis lo suma después: cinco muescas desde la aproximación no llegaban al pin y el Portfolio entraba; lo encontró el arnés)', [rueda, mandos.replace('lenis.targetScroll + px * lenis.options.wheelMultiplier', 'lenis.targetScroll')] as const, ([r, m]: readonly [string, string]) => cableadoDeLaRafaga(r, m))

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d A2 · 41 · A2.3 · La ráfaga en la matriz del arnés')

  const todas = combinacionesDeRafaga()
  afirmar(todas.length === RAFAGAS.length * GESTOS_DE_RAFAGA.length * 2 && RAFAGAS.length === 4, `las ${String(todas.length)} de la ráfaga: entrar bajando y subiendo, adentro bajando y subiendo, con muescas y con el trackpad, con y sin hover`)
  type Cuadro = { readonly barra: boolean; readonly panel: boolean; readonly paso: number }
  const nada: Cuadro = { barra: false, panel: false, paso: 4 }
  const cuenta = (f: (r: (typeof RAFAGAS)[number], c: readonly Cuadro[], desde: number) => readonly string[]): boolean =>
    f('entrar-bajando', [{ ...nada, paso: -1 }, nada], -1).length === 0 && f('entrar-bajando', [{ barra: true, panel: false, paso: 0 }, nada], -1).includes('entro-con-la-rafaga') &&
    f('adentro-bajando', [{ barra: true, panel: true, paso: 0 }, { barra: true, panel: true, paso: 1 }, nada], 0).length === 0 &&
    f('adentro-bajando', [{ barra: true, panel: true, paso: 0 }, { barra: true, panel: true, paso: 1 }, { barra: true, panel: true, paso: 2 }, nada], 0).includes('recorrio-de-mas')
  afirmar(cuenta(violacionesDeLaRafaga), '  la cuenta: una ráfaga que entra no deja correr la píldora ni entrar el panel, y una que sale puede dar a lo sumo el paso de la primera muesca (no recorre los que faltan)')
  controlPositivo('  el detector ve una cuenta que no mira los cuadros', (): readonly string[] => [], cuenta)
}
