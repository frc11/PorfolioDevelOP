/**
 * [B1.2d A2] s76 · LOS AJUSTES DE A (`docs/rediseno/SPRINT-B1-PORTFOLIO.md` §14.4), sin navegador: el medio del panel que baja cuando la
 * píldora corrida se le mete (A2.1) y [F2] la entrada que atrapa la rueda (reemplaza a la ráfaga de A2.3, que salteaba el Portfolio). (El
 * tiempo de la píldora, A2.2, está en el orden: §19 de `s76-portfolio-b12c.tsx`.) Cada afirmación con su control positivo. Lo medido en el
 * sitio lo corre el arnés (`MODO=a2` y `MODO=rafaga` de `scripts-carga/matriz.ts`, y `scripts-carga/entrada.ts`).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { GESTOS_DE_RAFAGA, RAFAGAS, combinacionesDeRafaga, pasoDeLaRafaga, violacionesDeLaEntrada, violacionesDeLaRafaga, type CuadroDeLaEntrada } from '../../../../../scripts-carga/a8'

import { CORRIMIENTO, despejeActual, despejeDelMedio, publicarElPanel, publicarLaPastilla, type PastillaEnReposo, type PedidoDeCorrimiento } from '../../_chrome/barra/corrimiento'
import { PANTALLAS_POR_PASO, PX_DE_LA_APROXIMACION, pasoEn, pxDeLaSalida } from '../../_secciones/trabajos/portfolio/pasos'
import { tiraDeLaEntrada } from '../../_secciones/trabajos/portfolio/rueda'
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
  // [F2] Reemplaza a «A2.3 · La ráfaga: el Portfolio no se recorre» (la spec se dio vuelta: el Portfolio se ve SIEMPRE).
  titulo('F2 · 40 · La entrada atrapa la rueda: el Portfolio se ve siempre, entero y de a uno')

  const salida = pxDeLaSalida(PANTALLAS_POR_PASO)
  type Entrada = (fase: 'antes' | 'adentro' | 'despues', hacia: number, s: 1 | -1, paso: number) => number | null
  const aterriza = (f: Entrada): boolean =>
    f('antes', PX_DE_LA_APROXIMACION, 1, PANTALLAS_POR_PASO) === 0 && f('antes', salida + 2000, 1, PANTALLAS_POR_PASO) === 0 && f('antes', PX_DE_LA_APROXIMACION - 1, 1, PANTALLAS_POR_PASO) === null &&
    f('antes', 0, -1, PANTALLAS_POR_PASO) === null && f('despues', salida - 1, -1, PANTALLAS_POR_PASO) === 3 && f('despues', -500, -1, PANTALLAS_POR_PASO) === 3 &&
    f('despues', salida, -1, PANTALLAS_POR_PASO) === null && f('despues', salida + 900, 1, PANTALLAS_POR_PASO) === null && f('adentro', salida - 1, -1, PANTALLAS_POR_PASO) === null && f('adentro', 2500, 1, PANTALLAS_POR_PASO) === null
  afirmar(aterriza(tiraDeLaEntrada), 'la rueda que lleva la página adentro del tramo desde afuera (una muesca, una ráfaga o el trackpad: lo que mira es adónde va) aterriza en El Garage bajando y en «la tuya» subiendo, por lejos que vaya; la que no llega, o va para el otro lado, o ya está adentro, no')
  controlPositivo('  el detector ve la entrada de B1.2c (atrapa la inercia en el paso al que llega: una ráfaga larga caía en Esquina o más allá)', (fase: 'antes' | 'adentro' | 'despues', hacia: number, s: 1 | -1, paso: number) =>
    fase === 'antes' && s > 0 && hacia >= PX_DE_LA_APROXIMACION ? Math.min(3, pasoEn(hacia, paso)) : fase === 'despues' && s < 0 && hacia < pxDeLaSalida(paso) ? Math.max(0, pasoEn(hacia, paso)) : null, aterriza)
  const rueda = sinComentarios(leer(`${PORTFOLIO}/useRuedaDelPortfolio.ts`))
  const mandos = sinComentarios(leer(`${PORTFOLIO}/useMandosDelPortfolio.ts`))
  const vivo = sinComentarios(leer(`${PORTFOLIO}/usePortfolio.ts`))
  const laEntrada = (r: string, m: string, u: string): boolean =>
    /if \(!enUnDialogo\(\) && \(c\.atrapa\(px\) \|\| c\.entrando\(\)\)\) \{\s*const deLaEntrada: EventoDeLenis = e\s*deLaEntrada\.lenisStopPropagation = true\s*if \(e\.cancelable\) e\.preventDefault\(\)\s*gesto = \{ acumulado: 0, ultimo: ahora, disparado: true \}\s*return\s*\}\s*const activa = c\.manda\(\)/.test(r) &&
    /const hacia = pxDelScroll\(lenis\.targetScroll \+ px \* lenis\.options\.wheelMultiplier, medida\.tope, medida\.alto\)\s*const tira = tiraDeLaEntrada\(vistaDelPaso\(actual\.current\)\.fase, hacia, px > 0 \? 1 : -1, PANTALLAS_POR_PASO\)\s*if \(tira === null\) return false\s*saltar\(tira, false, true\)/.test(m) &&
    // [B1.2e] Con el guardia del carrusel (debajo de 1024 la rueda no manda: s76 §45, con su control).
    /return !carrusel && v\.fase === 'adentro' && pegado\(caja\.current\) && !conDialogo\(caja\.current\) && \(entradaLista\.current \|\| !conLaTrampa\) \? v\.tira : null/.test(m) &&
    /entrando: \(\) => conLaTrampa && adentro\(\) && !entradaLista\.current/.test(m) &&
    /entradaLista\.current = false\s*if \(!orden\.panel\) return undefined[\s\S]*?entradaLista\.current = true\s*\}, reducido \? 0 : ORDEN\.panelS \* 1000\)/.test(u)
  afirmar(laEntrada(rueda, mandos, vivo), '  cableada antes que todo: el evento que entra se traga y vuela al primero del sentido (con el destino de Lenis MÁS este evento); mientras el panel no terminó de entrar (su transición de 700 ms) la rueda se traga entera y no da pasos; recién ahí, un gesto es un paso')
  controlPositivo('  el detector ve la rueda de A2 (sin la entrada: las muescas sueltas avanzaban Esquina y Banú antes de que entrara el panel, F1)', [rueda.replace('if (!enUnDialogo() && (c.atrapa(px) || c.entrando())) {', 'if (false) {'), mandos, vivo] as const, ([r, m, u]: readonly [string, string, string]) => laEntrada(r, m, u))
  controlPositivo('  y la rueda que manda apenas el paso está adentro (sin esperar al panel)', [rueda, mandos.replace(' && (entradaLista.current || !conLaTrampa)', ''), vivo] as const, ([r, m, u]: readonly [string, string, string]) => laEntrada(r, m, u))
  controlPositivo('  y la trampa que mira el destino de Lenis sin el evento de ahora (Lenis lo suma después)', [rueda, mandos.replace('lenis.targetScroll + px * lenis.options.wheelMultiplier', 'lenis.targetScroll'), vivo] as const, ([r, m, u]: readonly [string, string, string]) => laEntrada(r, m, u))
  const losArchivos = ['rueda.ts', 'useRuedaDelPortfolio.ts', 'useMandosDelPortfolio.ts', 'usePortfolio.ts'].map((a) => sinComentarios(leer(`${PORTFOLIO}/${a}`))).join('\n')
  const sinSalteo = (c: string): boolean => !/rafagaDeLaRueda|calibracionDeLaRafaga|entraConLaRafaga|vueloDeLaRafaga|'rafaga'/.test(c)
  afirmar(sinSalteo(losArchivos), '  la ráfaga de A2.3 salió entera (el detector, `?rafaga=` y el salteo)')
  controlPositivo('  el detector ve el salteo de A2.3', `${losArchivos}\nif (!entraConLaRafaga(medida.px, hacia, sentido, PANTALLAS_POR_PASO)) return false`, sinSalteo)

  // ═══════════════════════════════════════════════════════════════════════════
  // [F2] Reemplaza a «A2.3 · La ráfaga en la matriz del arnés».
  titulo('F2 · 41 · La ráfaga y la entrada con la rueda, en el arnés')

  const todas = combinacionesDeRafaga()
  afirmar(todas.length === RAFAGAS.length * GESTOS_DE_RAFAGA.length * 2 && RAFAGAS.length === 4, `las ${String(todas.length)} de la ráfaga: entrar bajando y subiendo, adentro bajando y subiendo, con muescas y con el trackpad, con y sin hover`)
  type Cuadro = { readonly barra: boolean; readonly panel: boolean; readonly paso: number }
  const c = (paso: number, panel = true, barra = panel): Cuadro => ({ barra, panel, paso })
  const cuenta = (f: (r: (typeof RAFAGAS)[number], cs: readonly Cuadro[], desde: number, final: number) => readonly string[]): boolean =>
    f('entrar-bajando', [c(-1, false), c(0, false, false), c(0, false), c(0)], -1, 0).length === 0 &&
    f('entrar-bajando', [c(-1, false), c(0), c(1)], -1, 1).includes('no-aterrizo') && f('entrar-bajando', [c(-1, false), c(0), c(1)], -1, 1).includes('recorrio-de-mas') &&
    f('entrar-bajando', [c(-1, false), c(4, false)], -1, 4).includes('no-aterrizo') && f('entrar-bajando', [c(-1, false), c(0, false, true), c(-1, false)], -1, 0).includes('pildora-sin-panel') &&
    f('entrar-subiendo', [c(4, false), c(3)], 4, 3).length === 0 && f('adentro-bajando', [c(0), c(1)], 0, 1).length === 0 &&
    f('adentro-bajando', [c(0), c(1), c(2)], 0, 2).includes('no-aterrizo') && f('adentro-subiendo', [c(2), c(1)], 2, 1).length === 0
  afirmar(cuenta(violacionesDeLaRafaga), '  la cuenta: entrando aterriza en el primero del sentido y no pasa por otro; adentro, uno solo; la píldora no se corre sin que entre el panel')
  controlPositivo('  el detector ve una cuenta que mira sólo dónde quedó', (r: (typeof RAFAGAS)[number], _cs: readonly Cuadro[], desde: number, final: number): readonly string[] => (final === pasoDeLaRafaga(r, desde) ? [] : ['no-aterrizo']), cuenta)
  const de = (pasos: readonly (readonly [number, boolean])[], gestos: readonly number[] = []): CuadroDeLaEntrada[] =>
    pasos.map(([paso, panel], i) => ({ t: i * 100, y: 0, paso, panel, barra: panel, encabezado: panel, ...(gestos.includes(i) ? { gesto: true as const } : {}) }))
  const sana = de([[-1, false], [0, true], [1, true], [2, true], [3, true], [4, false]], [0, 1, 2, 3, 4, 5])
  const deF1 = de([[-1, false], [0, false], [1, false], [2, true], [3, true], [4, false]], [0, 1, 2, 3, 4, 5])
  const salteada = de([[-1, false], [4, false]], [0])
  const dosPorGesto = de([[-1, false], [0, true], [1, true], [2, true], [3, true], [4, false]], [0, 1, 3, 4, 5])
  const entradaBien = (f: (cs: readonly CuadroDeLaEntrada[], s: 'bajando' | 'subiendo') => readonly string[]): boolean =>
    f(sana, 'bajando').length === 0 && f(deF1, 'bajando').includes('no-aterrizo-en-el-primero') && f(deF1, 'bajando').includes('proyecto-sin-panel') &&
    f(salteada, 'bajando').includes('no-aparecio') && f(dosPorGesto, 'bajando').includes('mas-de-uno-por-gesto') && f([...sana].reverse().map((x, i) => ({ ...x, t: i * 100 })), 'subiendo').length === 0
  afirmar(entradaBien(violacionesDeLaEntrada), '  y la de la entrada de punta a punta (`entrada.ts`, desde Quiénes somos o desde Demos): la de F1 (El Garage y Esquina sin panel), la del salteo (-1 → 4) y dos pasos en un gesto se ven por su nombre')
  controlPositivo('  el detector ve una cuenta que mira sólo si pasó', (cs: readonly CuadroDeLaEntrada[], s: 'bajando' | 'subiendo'): readonly string[] => (cs[cs.length - 1]?.paso === (s === 'bajando' ? 4 : -1) ? [] : ['no-paso']), entradaBien)
}
