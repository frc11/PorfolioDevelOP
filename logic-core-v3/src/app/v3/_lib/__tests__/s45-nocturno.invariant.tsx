/**
 * SPRINT NOCTURNO (RETOQUES + TU PANEL VIVO) — el invariante: npm run test:s45-nocturno
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   A2 · el pie: la llegada de prueba borrada y la onda en el producto (en s44-pie, que es su invariante).
 *   A4 · la llegada de Portfolio vuelve a ser la larga de ESCENA 10 (persigue al scroll con un mínimo de tiempo), con lo
 *        que arregló F2: se da vuelta con el scroll y al frenar termina armada o desarmada.
 * Lo que se mira en vivo: `~/.cache/b4-medicion/nocturno/LEEME.txt`.
 */
import { readFileSync } from 'node:fs'

import { LLEGADA_DE_LAS_LETRAS, mostradoDelScroll } from '../escena/titulos3d/llegada'
import { ASIENTO, LENTOS } from '../titulos3d/repeticiones'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const DT = 1 / 60

type Seguidor = (mostrado: number, pedido: number, asentar: boolean, dt: number) => number

/** Cuánto tarda lo mostrado en ir de `desde` a `pedido` (s), con el scroll quieto o no; `Infinity` si no llega en 10 s. */
function cuantoTarda(f: Seguidor, desde: number, pedido: number, asentar: boolean, destino: number): number {
  let m = desde
  for (let t = 0; t < 10; t += DT) {
    if (m === destino) return t
    m = f(m, pedido, asentar, DT)
  }
  return Number.POSITIVE_INFINITY
}

/** Se da vuelta con el scroll: medio camino hacia 1 y el scroll vuelve; el cuadro siguiente ya baja. */
function seDaVuelta(f: Seguidor): boolean {
  let m = 0
  for (let t = 0; t < 0.4; t += DT) m = f(m, 1, false, DT)
  const antes = m
  return antes > 0.05 && antes < 0.95 && f(m, 0, false, DT) < antes
}

/** Idas y vueltas rápidas y después quieto a mitad: cada cuadro en [0, 1] y al final en 0 o 1 exactos (el asiento). */
function convergeSiempre(f: Seguidor, asientoS: number): boolean {
  let m = 0
  let azar = 11
  for (let k = 0; k < 900; k += 1) {
    azar = (azar * 9301 + 49297) % 233280
    m = f(m, (k % 50 < 25 ? 1 : 0) * (azar / 233280), false, DT)
    if (!(m >= 0 && m <= 1)) return false
  }
  for (const parado of [0.62, 0.3]) {
    let q = m
    for (let t = 0; t < asientoS + 0.2; t += DT) q = f(q, parado, true, DT)
    if (q !== (parado >= 0.5 ? 1 : 0)) return false
  }
  return true
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('A4 · La llegada de Portfolio: la larga de ESCENA 10, sin perder F2')

const portfolio: Seguidor = (m, p, a, dt) => mostradoDelScroll(m, p, a, dt, LENTOS.llegadaDePortfolioS)
const deF2: Seguidor = (m, p, a, dt) => mostradoDelScroll(m, p, a, dt)
const larga = (f: Seguidor): boolean => cuantoTarda(f, 0, 1, false, 1) >= LENTOS.llegadaDePortfolioS - DT
const tarda = cuantoTarda(portfolio, 0, 1, false, 1)
afirmar(LENTOS.llegadaDePortfolioS === LLEGADA_DE_LAS_LETRAS.minimoS && larga(portfolio) && tarda < LENTOS.llegadaDePortfolioS + 2 * DT, 'con un scroll que salta la ventana entera, las letras llegan en el mínimo de ESCENA 10 (desde la profundidad, girando), no en lo que tarda el scroll', `de 0 a 1 en ${tarda.toFixed(2)} s (F2: ${cuantoTarda(deF2, 0, 1, false, 1).toFixed(2)} s)`)
controlPositivo('el detector VE la llegada corta de F2', deF2, larga)
afirmar(seDaVuelta(portfolio), '  se interrumpe: si el scroll vuelve a mitad de la llegada, las letras se dan vuelta en el cuadro siguiente')
controlPositivo('el detector VE una llegada que termina lo que empezó', ((m: number, p: number, _a: boolean, dt: number) => mostradoDelScroll(m, m > 0 ? 1 : p, false, dt, LENTOS.llegadaDePortfolioS)) as Seguidor, seDaVuelta)
afirmar(convergeSiempre(portfolio, LENTOS.llegadaDePortfolioS), '  nunca queda a medias: con idas y vueltas rápidas cada cuadro es coherente, y al frenar a mitad asienta a la MISMA velocidad (frenar no acorta la llegada) en armado o desarmado del todo')
controlPositivo('el detector VE el seguidor sin asiento (al frenar a mitad queda a mitad)', ((m: number, p: number, _a: boolean, dt: number) => mostradoDelScroll(m, p, false, dt, LENTOS.llegadaDePortfolioS)) as Seguidor, (f: Seguidor) => convergeSiempre(f, LENTOS.llegadaDePortfolioS))
afirmar(cuantoTarda(deF2, 1, 0.4, false, 0.4) <= ASIENTO.alcanceS + DT && convergeSiempre(deF2, ASIENTO.s), '  los demás títulos siguen con F2 tal cual (sin mínimo: alcanzan al scroll en el alcance y asientan en el asiento)')
const piezas = sinComentarios(leer('_secciones/trabajos/piezas.tsx'))
const componente = sinComentarios(leer('_componentes/titulos3d/TituloDeVolumen.tsx'))
const escena = sinComentarios(leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx'))
const enchufada = (c: string): boolean => /<TituloDeVolumen id="portfolio"[^>]*minimoS=\{LENTOS\.llegadaDePortfolioS\}/.test(c)
afirmar(enchufada(piezas) && /salida, queda, corrida, minimoS, activo:/.test(componente) && /if \(a\.titulo\.rearma\) m\.llegada = mostradoDelScroll\(m\.llegada, enViaje \? 0 : a\.titulo\.llegada, asentar, dt, enViaje \? null : a\.titulo\.minimoS\)/.test(escena), '  Portfolio pide su mínimo (sección → registro → escena); en un viaje del menú se desarma rápido, como antes')
controlPositivo('el detector VE a Portfolio sin su mínimo', piezas.replace(' minimoS={LENTOS.llegadaDePortfolioS}', ''), enchufada)

cerrar('s45-nocturno')
