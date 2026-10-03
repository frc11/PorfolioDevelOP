/**
 * SPRINT NOCTURNO (RETOQUES + TU PANEL VIVO) — el invariante: npm run test:s45-nocturno
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   A2 · el pie: la llegada de prueba borrada y la onda en el producto (en s44-pie, que es su invariante).
 *   A4 · la llegada de Portfolio vuelve a ser la larga de ESCENA 10 (persigue al scroll con un mínimo de tiempo), con lo
 *        que arregló F2: se da vuelta con el scroll y al frenar termina armada o desarmada.
 *   A5 · la salida de «Seis razones / para elegirnos», con el mismo mecanismo y bastante más lenta (se iba volando).
 *   A3 · los enlaces del recorrido del pie viajan como los ítems del menú (el mismo escucha, el mismo plan de la escena y
 *        la misma llegada repetida del título del destino).
 * Lo que se mira en vivo: `~/.cache/b4-medicion/nocturno/LEEME.txt`.
 */
import { readFileSync } from 'node:fs'

import { SELECTOR_DE_LOS_VIAJES } from '../../_componentes/deslizamiento'
import { DESTINOS_DE_LA_RUTA } from '../../_secciones/cierre/contenido'
import { IDS_DE_SECCION } from '../../_secciones/_contrato/forma'
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
afirmar(enchufada(piezas) && /salida, queda, corrida, minimoS,( salidaMinimaS,)? activo:/.test(componente) && /if \(a\.titulo\.rearma\) m\.llegada = mostradoDelScroll\(m\.llegada, enViaje \? 0 : a\.titulo\.llegada, asentar, dt, enViaje \? null : a\.titulo\.minimoS\)/.test(escena), '  Portfolio pide su mínimo (sección → registro → escena); en un viaje del menú se desarma rápido, como antes')
controlPositivo('el detector VE a Portfolio sin su mínimo', piezas.replace(' minimoS={LENTOS.llegadaDePortfolioS}', ''), enchufada)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A5 · «Seis razones / para elegirnos»: la salida, bastante más lenta')

const salida: Seguidor = (m, p, a, dt) => mostradoDelScroll(m, p, a, dt, LENTOS.salidaDeLaFraseS)
const lenta = (f: Seguidor): boolean => cuantoTarda(f, 0, 1, false, 1) >= 1.4 * LENTOS.llegadaDePortfolioS - DT
const seVaEn = cuantoTarda(salida, 0, 1, false, 1)
afirmar(lenta(salida), 'con un scroll que cruza la levantada de una, las letras se van en el mínimo (de vuelta a la profundidad, girando), no en lo que tarda el scroll', `de 0 a 1 en ${seVaEn.toFixed(2)} s (antes, ${cuantoTarda(deF2, 0, 1, false, 1).toFixed(2)} s; la llegada de Portfolio, ${String(LENTOS.llegadaDePortfolioS)} s)`)
controlPositivo('el detector VE la salida que se iba volando', deF2, lenta)
afirmar(seDaVuelta(salida) && convergeSiempre(salida, LENTOS.salidaDeLaFraseS), '  con la robustez de F2: se da vuelta si el scroll vuelve y al frenar a mitad queda ida o armada del todo')
const porQue = sinComentarios(leer('_secciones/por-que-develop/PorQueDevelop.tsx'))
const registro = sinComentarios(leer('_lib/titulos3d/registro.ts'))
const lentaEnLaFrase = (c: string): boolean => /<TituloDeVolumen [^>]*salida=\{volumen\.salida\}[^>]*salidaMinimaS=\{LENTOS\.salidaDeLaFraseS\}[^>]*llegadaDe="por-que-develop" \/>/.test(c)
afirmar(lentaEnLaFrase(porQue) && /salida, queda, corrida, minimoS, salidaMinimaS, activo:/.test(componente) && /rearma, minimoS, salidaMinimaS \}\)/.test(registro) && /a\.mostrado\.salida = mostradoDelScroll\(a\.mostrado\.salida, a\.titulo\.salida, asentar, dt, a\.titulo\.salidaMinimaS\)/.test(escena), '  la frase pide su salida lenta (sección → registro → escena); los demás títulos (sin `salidaMinimaS`) siguen con la de F2')
controlPositivo('el detector VE la frase sin su salida lenta', porQue.replace(' salidaMinimaS={LENTOS.salidaDeLaFraseS}', ''), lentaEnLaFrase)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A3 · Los enlaces del pie viajan como los del menú')

const DEL_PIE = '[data-pieza="recorrido-del-pie"] a[data-pieza="pie-enlace-icono"]'
const columnas = sinComentarios(leer('_secciones/cierre/ColumnasDelPie.tsx'))
const viajan = (selector: string, fuente: string): boolean => selector.split(', ').includes(DEL_PIE) && /<ul data-pieza="recorrido-del-pie"[^>]*>[\s\S]{0,600}<EnlaceDelPieConIcono\s+href=\{destino\.ancla\}/.test(fuente)
afirmar(viajan(SELECTOR_DE_LOS_VIAJES, columnas), 'los enlaces del recorrido del pie entran en el MISMO selector que la barra y el menú: el mismo escucha, el mismo plan de la escena (día y noche) y la misma llegada del título al terminar')
controlPositivo('el detector VE los enlaces del pie afuera del viaje (el salto de antes)', SELECTOR_DE_LOS_VIAJES.replace(`, ${DEL_PIE}`, ''), (sel: string) => viajan(sel, columnas))
const secciones = IDS_DE_SECCION as readonly string[]
afirmar(DESTINOS_DE_LA_RUTA.length > 0 && DESTINOS_DE_LA_RUTA.every((d) => d.ancla.startsWith('#') && secciones.includes(d.ancla.slice(1))), '  cada destino es el ancla de una sección (el viaje la resuelve a su nudo); ninguno es `#contacto` (ése abre el panel)', DESTINOS_DE_LA_RUTA.map((d) => d.ancla).join(' '))

cerrar('s45-nocturno')
