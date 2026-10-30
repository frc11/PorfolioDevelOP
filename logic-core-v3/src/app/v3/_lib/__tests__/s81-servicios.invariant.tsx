/**
 * s81 · [B4] LA SECCIÓN SERVICIOS DEL HOME (2026-10-22) — la máquina de gatillos común (la del Portfolio), los tiempos de una
 * transición, el truco de profundidad (contado con la cuenta del sombreador), los datos (acentos, videos, destinos, banderas), el
 * recomendador, la REGLA DE ALTURAS y lo que la sección renderiza sin coreografía. Cada afirmación con su control positivo.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import * as COMUN from '../../_componentes/gatillos/rueda'
import { decidirLaRueda, decidirLaTecla, destinoDelGesto, entradaDelGesto, pasoConHisteresisEnElTramo, type ReglaDeGatillos } from '../../_componentes/gatillos/maquina'
import { duracionDelSalto, saltarA } from '../../_componentes/gatillos/salto'
import { CANTIDAD_DE_PASOS, PANTALLAS_POR_PASO, PX_DE_LA_APROXIMACION, pxDeLaSalida } from '../../_secciones/trabajos/portfolio/pasos'
import * as DEL_PORTFOLIO from '../../_secciones/trabajos/portfolio/rueda'
import * as SALTAR_DEL_PORTFOLIO from '../../_secciones/trabajos/portfolio/saltar'
import { SERVICIOS, IDS_DE_SERVICIO } from '../../_secciones/_contrato/acento'
import { seccionDe } from '../../_secciones/_contrato/forma'
import { colorDelAroDeLaBandera, cursivaDeLaBandera, diagonalDeLaBandera, tangenteDe } from '../../_secciones/servicios/escenario/banderas'
import { tamanoQueEntra } from '../../_secciones/servicios/escenario/ajuste'
import { SIN_OBJETIVO, baseDelObjetivo, seguirElObjetivo } from '../../_componentes/gatillos/maquina'
import { EXTENSION_DE_LA_ORBITA, MODOS_DEL_ARO, extensionDeLaOrbita, proporcionDeLaCaja, unidadDelLugar } from '../nanobots/simbolos'
import { DESTINO_DEL_SERVICIO, VIDEO_DEL_SERVICIO, DISTRIBUCION } from '../../_secciones/servicios/escenario/datos'
import { CANDADO_DE_SERVICIOS_MS, DURACION_DE_LA_TRANSICION_MS, TIEMPOS, avanceDelPanel, avanceDelRenglon, avanceDelSubrayado, capaDelEnjambre, desdeDelTexto, gDelAvance, inicioDelPanel, posicionDelEnjambre, retomarHacia } from '../../_secciones/servicios/escenario/tiempos'
import { recomendar, todasLasRespuestas } from '../../_secciones/servicios/recomendador/logica'
import { Servicios } from '../../_secciones/servicios/Servicios'
import { altoViejoMedido, tramoDeServicios, type AltoViejo } from '../../_secciones/servicios/tramoDeServicios'
import { cambioDeCapa, extensionDelSimbolo, type Caja, type Lugar } from '../nanobots/capa'
import { ACENTOS_DE_SERVICIOS_EN_PAPEL, VERTICE_DE_SERVICIOS, indiceDelModoDelAro, simbolosDeServicios } from '../nanobots/enjambreDeServicios'
import { RED_NEURONAL, conexionesDeLaRed, nodosDeLaRed } from '../nanobots/redNeuronal'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ESCENARIOS_DE_PRUEBA, adentro, lugarDe, nanobotsEn } from './s81-servicios-capa'

;(globalThis as unknown as { React: typeof React }).React = React

const RAIZ = process.cwd()
const V3 = path.join(RAIZ, 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La máquina es la del Portfolio: una sola, común')

afirmar(DEL_PORTFOLIO.gestoDeLaRueda === COMUN.gestoDeLaRueda && DEL_PORTFOLIO.RUEDA === COMUN.RUEDA && SALTAR_DEL_PORTFOLIO.saltarA === saltarA, 'el Portfolio usa la rueda y el salto comunes (`_componentes/gatillos/`): los mismos objetos, no copias')
const igualQueAntes = (f: typeof DEL_PORTFOLIO.destinoDeLaRueda): boolean =>
  [0, 1, 2, 3].every((a) => ([1, -1] as const).every((s) => {
    const d = f(a, s)
    const antes = a + s >= CANTIDAD_DE_PASOS ? 'demos' : a + s < 0 ? 'arriba' : `paso${String(a + s)}`
    return (d.tipo === 'paso' ? `paso${String(d.indice)}` : d.tipo) === antes
  }))
afirmar(igualQueAntes(DEL_PORTFOLIO.destinoDeLaRueda), '  el destino de la rueda del Portfolio sigue igual, con la regla común (de a uno; después de «la tuya», Demos; antes del primero, arriba)')
controlPositivo('  el detector ve un destino que saltea', (a: number, s: 1 | -1) => ({ tipo: 'paso' as const, indice: a + 2 * s }), igualQueAntes)
const entradaIgual = (f: typeof DEL_PORTFOLIO.tiraDeLaEntrada): boolean => {
  const salida = pxDeLaSalida(PANTALLAS_POR_PASO)
  return [-500, 0, PX_DE_LA_APROXIMACION - 1, PX_DE_LA_APROXIMACION, 3000, salida - 1, salida, salida + 900].every((hacia) =>
    (['antes', 'adentro', 'despues'] as const).every((fase) => ([1, -1] as const).every((s) => {
      const antes = fase === 'antes' && s > 0 && hacia >= PX_DE_LA_APROXIMACION ? 0 : fase === 'despues' && s < 0 && hacia < salida ? CANTIDAD_DE_PASOS - 1 : null
      return f(fase, hacia, s, PANTALLAS_POR_PASO) === antes
    })))
}
afirmar(entradaIgual(DEL_PORTFOLIO.tiraDeLaEntrada), '  y la entrada del Portfolio (F2) aterriza igual que antes en toda la grilla, ahora con la regla común')
controlPositivo('  el detector ve la entrada que no atrapa', () => null, entradaIgual)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Un gesto, un paso; la transición se ve entera; la ráfaga se descarta (con un reloj de mentira)')

// [C2-51] La regla de Servicios: el último tramo (de IA al recomendador) sin gatillo. La salida libre la afirma s78-c2-51 entera.
const REGLA: ReglaDeGatillos = { cantidad: 4, pasoPx: 1350, salidaDeAbajoLibre: true }
type Evento = readonly [number, number]
/** Corre la máquina: los eventos (ms, px), el vuelo de un paso y la transición; devuelve los pasos por los que pasó. */
function recorrido(eventos: readonly Evento[], desde: number, decidir: typeof decidirLaRueda = decidirLaRueda, transicionMs = DURACION_DE_LA_TRANSICION_MS): number[] {
  let paso = desde
  let gesto = COMUN.GESTO_QUIETO
  let vueloHasta = Number.NEGATIVE_INFINITY
  let ocupadoHasta = Number.NEGATIVE_INFINITY
  const pasos: number[] = []
  for (const [ahora, px] of eventos) {
    const hacia = paso < 0 ? -200 + px * 20 : paso >= 4 ? 5400 + 200 + px * 20 : (paso + 0.5) * REGLA.pasoPx
    const r = decidir({ paso, enVuelo: ahora < vueloHasta, ocupado: ahora < ocupadoHasta, gesto, px, ahora, hacia }, REGLA)
    gesto = r.gesto
    const ir = (a: number): void => {
      if (a === paso) return
      paso = a
      pasos.push(a)
      vueloHasta = ahora + duracionDelSalto(1)
      ocupadoHasta = ahora + transicionMs
    }
    if (r.decision.tipo === 'entrada') ir(r.decision.paso)
    else if (r.decision.tipo === 'paso' && r.decision.sentido !== null) {
      const d = destinoDelGesto(Math.min(3, Math.max(0, paso)), r.decision.sentido, 4)
      ir(d.tipo === 'paso' ? d.indice : d.tipo === 'despues' ? 4 : -1)
    }
  }
  return pasos
}
const muesca = (t: number, px = 100): Evento => [t, px]
const trackpad = (t0: number, s = 1): Evento[] => Array.from({ length: 70 }, (_, k) => [t0 + k * 16, s * Math.max(2, 40 - k)] as const)
const rafaga = (t0: number): Evento[] => Array.from({ length: 12 }, (_, k) => [t0 + k * 30, 120] as const)
const CASOS: readonly { readonly nombre: string; readonly eventos: readonly Evento[]; readonly desde: number; readonly espera: readonly number[] }[] = [
  { nombre: 'una muesca adentro: un paso', eventos: [muesca(1000)], desde: 0, espera: [1] },
  { nombre: 'el trackpad con su inercia (1,1 s): un paso', eventos: trackpad(1000), desde: 1, espera: [2] },
  { nombre: 'una ráfaga de doce muescas: un paso', eventos: rafaga(1000), desde: 1, espera: [2] },
  // [L3] Reemplazada por la spec (ítem 50: «puede pasar más rápido, con gatillo»): la transición ya no se espera; el vuelo del salto sí.
  { nombre: 'dos muescas a 1 s (la transición corriendo): dos pasos, de a uno (L3)', eventos: [muesca(1000), muesca(2000)], desde: 0, espera: [1, 2] },
  { nombre: 'dos muescas a 300 ms (el salto todavía vuela): un paso', eventos: [muesca(1000), muesca(1300)], desde: 0, espera: [1] },
  { nombre: 'dos muescas a 3 s: dos pasos, de a uno', eventos: [muesca(1000), muesca(4000)], desde: 0, espera: [1, 2] },
  { nombre: 'subiendo desde IA: sale por donde entró, de a uno', eventos: [muesca(1000, -100), muesca(4000, -100), muesca(7000, -100), muesca(10000, -100)], desde: 3, espera: [2, 1, 0, -1] },
  // [C2-51] Reemplazada por la spec (ítem 14: «que el último scroll no sea gatillo»): de IA al recomendador la rueda es de la página.
  { nombre: 'después del último, la salida de abajo es scroll normal (C2-51: ningún gatillo la toma)', eventos: [muesca(1000)], desde: 3, espera: [] },
  { nombre: 'entrando con una ráfaga larga: aterriza en la entrada, no más allá', eventos: rafaga(1000), desde: -1, espera: [0] },
  { nombre: 'subiendo desde el recomendador con el trackpad: aterriza en IA', eventos: trackpad(1000, -1), desde: 4, espera: [3] },
]
// [L3] Servicios traga sólo mientras vuela el salto: su candado es `CANDADO_DE_SERVICIOS_MS` (0), no la transición entera.
const anduvo = (decidir: typeof decidirLaRueda, transicion: number = CANDADO_DE_SERVICIOS_MS): string[] => CASOS.filter((c) => recorrido(c.eventos, c.desde, decidir, transicion).join() !== c.espera.join()).map((c) => c.nombre)
afirmarIgual(anduvo(decidirLaRueda), [], `los ${String(CASOS.length)} casos: un gesto es un paso (quieta ${String(COMUN.RUEDA.quietoMs)} ms), nunca dos; [L3] el gesto siguiente cuenta apenas termina el vuelo (${String(duracionDelSalto(1))} ms), sin esperar la transición; la entrada atrapa`)
const dePixeles: typeof decidirLaRueda = (m) => ({ decision: { tipo: 'paso', sentido: m.px > 0 ? 1 : -1 }, gesto: m.gesto })
controlPositivo('  el detector ve la rueda de a píxeles (cada evento, un paso)', dePixeles, (d) => anduvo(d).length === 0)
controlPositivo('  y la máquina con el candado de antes (la transición entera: dos muescas a 1 s dan UN paso)', DURACION_DE_LA_TRANSICION_MS, (t) => anduvo(decidirLaRueda, t).length === 0)
const sinVuelo: typeof decidirLaRueda = (m, r) => decidirLaRueda({ ...m, enVuelo: false, ocupado: false }, r)
controlPositivo('  y la máquina que no traga ni el vuelo (dos muescas a 300 ms dan dos pasos)', sinVuelo, (d) => anduvo(d).length === 0)
const escenarioDeServicios = leer('_secciones/servicios/escenario/EscenarioDeServicios.tsx')
afirmar(/useGatillos\(\{[^}]*candadoMs: CANDADO_DE_SERVICIOS_MS[^}]*\}\)/.test(escenarioDeServicios) && CANDADO_DE_SERVICIOS_MS < DURACION_DE_LA_TRANSICION_MS, '  [L3] y Servicios le pasa ese candado a la máquina común (el Portfolio y Demos, sin `candadoMs`: la transición entera, como siempre)')
const sinTrampa: typeof decidirLaRueda = (m, r) => (m.paso < 0 ? { decision: { tipo: 'pagina' }, gesto: m.gesto } : decidirLaRueda(m, r))
controlPositivo('  y la entrada sin trampa (la ráfaga entra de largo, F2)', sinTrampa, (d) => anduvo(d).length === 0)
afirmar(decidirLaTecla(1, 4, false, false, false) === 'paso' && decidirLaTecla(1, 4, false, false, true) === 'tragar' && decidirLaTecla(1, 4, false, true, false) === 'tragar' && decidirLaTecla(-1, 4, false, false, false) === 'pagina' && decidirLaTecla(4, 4, true, false, false) === 'tragar', 'el teclado: adentro, una tecla apretada es un paso (su repetición y lo que llega en la transición se tragan); afuera, la página')
controlPositivo('  el detector ve la tecla repetida que avanza', (p: number, n: number, v: boolean, o: boolean) => (p >= 0 && p < n && !v && !o ? 'paso' : 'pagina'), (f: typeof decidirLaTecla) => f(1, 4, false, false, true) === 'tragar')
afirmar(pasoConHisteresisEnElTramo(1, 2 * 1350 + 20, REGLA) === 1 && pasoConHisteresisEnElTramo(1, 2 * 1350 + 40, REGLA) === 2 && entradaDelGesto('antes', 99999, 1, REGLA) === 0, 'el paso por el scroll (la barra, un ancla) con la histéresis del Portfolio (30 px); la entrada aterriza en el primero por lejos que vaya')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los tiempos de una transición (puros)')

afirmar(avanceDelPanel(TIEMPOS.panel.inicio) === 0 && avanceDelPanel(1) === 1 && posicionDelEnjambre(1) === 1 && posicionDelEnjambre(TIEMPOS.enjambre.hasta) === 1 && posicionDelEnjambre(2 + TIEMPOS.nube.desde) === 2 && posicionDelEnjambre(2 + TIEMPOS.nube.hasta) === 3 && posicionDelEnjambre(2.25) < 2.5, 'el panel entra entre su inicio y su cierre; el enjambre llega a mitad de la transición de la entrada, y entre servicios viaja más lento (C2-50: la nube, de 0,05 a 0,9)')
// [C2-50] El cuerpo aparece antes (con el panel por la mitad) y el título se subraya al terminar de llegar: rápido y después desacelera.
const textoTemprano = (f: typeof desdeDelTexto): boolean => [0.15, 0.3].every((i) => Math.abs(avanceDelPanel(f(i), i) - 0.5) < 0.4 && f(i) < i + TIEMPOS.panel.duracion)
afirmar(textoTemprano(desdeDelTexto), 'C2-50: los renglones arrancan con la entrada del panel por la mitad, no con el panel cerrado')
controlPositivo('  el detector ve los renglones que esperan al panel cerrado (B4)', (i: number) => Math.max(0.7, i + TIEMPOS.panel.duracion), textoTemprano)
const subrayaBien = (f: typeof avanceDelSubrayado): boolean => f(TIEMPOS.panel.inicio + TIEMPOS.panel.duracion - 0.01) === 0 && f(1) === 1 && f(TIEMPOS.panel.inicio + TIEMPOS.panel.duracion + TIEMPOS.subrayado.duracion / 4) > 0.5
afirmar(subrayaBien(avanceDelSubrayado), 'C2-50: el subrayado arranca con el panel cerrado, llega en g = 1 y va rápido primero (más de la mitad en el primer cuarto)')
controlPositivo('  el detector ve un subrayado lineal', (g: number) => Math.min(1, Math.max(0, (g - 0.68) / 0.22)), subrayaBien)
const renglonesEnOrden = (f: typeof avanceDelRenglon): boolean => [1, 4, 8, 12].every((n) => Array.from({ length: n }, (_, i) => f(1, i, n)).every((a) => a === 1) && Array.from({ length: n - 1 }, (_, i) => f(0.8, i, n) >= f(0.8, i + 1, n)).every(Boolean) && f(desdeDelTexto(TIEMPOS.panel.inicio) - 0.001, 0, n) === 0)
afirmar(renglonesEnOrden(avanceDelRenglon), 'los renglones se levantan después de que el panel cerró, uno detrás del otro, y en g = 1 están todos en su lugar (con 1 a 12 renglones)')
controlPositivo('  el detector ve el escalonado que no llega (el último a medias al terminar)', (g: number, i: number) => Math.min(1, Math.max(0, (g - 0.7 - i * 0.045) / 0.2)), renglonesEnOrden)
// [L3] Pasar rápido sin teletransportarse: la posición sigue desde donde está. Un doble gesto a 600 ms, cuadro a cuadro (60 por segundo),
// con la posición corriendo lineal hacia la vista como `usePosicionDelEscenario`: ningún cuadro mueve el enjambre más de 0,05.
const retomaBien = (f: typeof retomarHacia): boolean => {
  const a = f(0.4, 1, 2)
  const b = f(0.5, 1, 0)
  return !a.salta && a.ms === DURACION_DE_LA_TRANSICION_MS && !b.salta && Math.abs(b.ms - 0.5 * DURACION_DE_LA_TRANSICION_MS) < 1e-9 && f(0, 0, 2).salta && f(1, 1, 3).salta
}
afirmar(retomaBien(retomarHacia), 'L3: un gesto en medio de la transición la retoma desde donde está (lo que falta, en una transición como mucho); sólo un salto de la VISTA de más de uno (la barra, un ancla) va de golpe')
controlPositivo('  el detector ve el criterio de antes (salta si la posición quedó a más de uno)', ((p: number, v0: number, v: number) => retomarHacia(p, v0, v, true)) as typeof retomarHacia, retomaBien)
/** El mayor salto por cuadro de la posición del enjambre en un doble gesto (vista 0 → 1 en t = 0, → 2 en t = 600 ms). */
function saltoMaximo(retomar: typeof retomarHacia): number {
  const cuadro = 1000 / 60
  let p = 0
  let vista = 0
  let anim = { desde: 0, hasta: 0, t0: 0, ms: 0 }
  let maximo = 0
  for (let t = 0; t <= 5000; t += cuadro) {
    const nueva = t >= 600 ? 2 : 1
    if (nueva !== vista) {
      const r = retomar(p, vista, nueva)
      anim = r.salta ? { desde: nueva, hasta: nueva, t0: t, ms: 0 } : { desde: p, hasta: nueva, t0: t, ms: r.ms }
      vista = nueva
    }
    const antes = posicionDelEnjambre(p)
    p = anim.ms === 0 ? anim.hasta : anim.desde + (anim.hasta - anim.desde) * Math.min(1, (t - anim.t0) / anim.ms)
    maximo = Math.max(maximo, Math.abs(posicionDelEnjambre(p) - antes))
  }
  return p === 2 ? maximo : Number.POSITIVE_INFINITY
}
afirmar(saltoMaximo(retomarHacia) <= 0.05, `  y en un doble gesto a 600 ms el enjambre no salta: a lo sumo ${saltoMaximo(retomarHacia).toFixed(4)} por cuadro (umbral 0,05), y termina en software`)
controlPositivo('  el detector ve el doble gesto que se teletransporta (el criterio de antes)', ((p: number, v0: number, v: number) => retomarHacia(p, v0, v, true)) as typeof retomarHacia, (f) => saltoMaximo(f) <= 0.05)
const continua = (f: typeof posicionDelEnjambre): boolean => Array.from({ length: 3000 }, (_, i) => Math.abs(f((i + 1) / 1000) - f(i / 1000))).every((d) => d <= 0.0025)
afirmar(continua(posicionDelEnjambre), '  la posición del enjambre es continua en todo el recorrido (de la entrada a IA, cruzando cada estado)')
controlPositivo('  el detector ve una posición con un escalón', ((p: number) => (p > 1.5 ? posicionDelEnjambre(p) + 0.3 : posicionDelEnjambre(p))) as typeof posicionDelEnjambre, continua)
const subrayaPorRenglon = (f: typeof avanceDelSubrayado): boolean => [TIEMPOS.panel.inicio, 0.3].every((i) => f(1, i, 0) === 1 && f(1, i, 1) === 1 && f(i + TIEMPOS.panel.duracion + 0.03, i, 0) > f(i + TIEMPOS.panel.duracion + 0.03, i, 1))
afirmar(subrayaPorRenglon(avanceDelSubrayado), 'L3: un subrayado por renglón del título; el segundo arranca un escalón después y los dos llegan en g = 1')
controlPositivo('  el detector ve los dos subrayados juntos', ((g: number, i?: number) => avanceDelSubrayado(g, i, 0)) as typeof avanceDelSubrayado, subrayaPorRenglon)
afirmar(capaDelEnjambre(0, 0.3) === 'detras' && capaDelEnjambre(0.29, 0.3) === 'detras' && capaDelEnjambre(0.3, 0.3) === 'delante' && capaDelEnjambre(1, 0.9) === 'delante' && capaDelEnjambre(2.4, 0.3) === 'delante', 'la capa: detrás del título en la entrada, delante desde el cambio, y delante en los tres servicios')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El truco de profundidad: ningún nanobot sobre el título ni sobre el panel en el cuadro del cambio')

const SIMBOLOS = simbolosDeServicios(3000)
const EXT = SIMBOLOS.map(extensionDelSimbolo)
const CUADRO = (1000 / 60 / (DURACION_DE_LA_TRANSICION_MS * (TIEMPOS.enjambre.hasta - TIEMPOS.enjambre.desde)))
for (const e of ESCENARIOS_DE_PRUEBA) {
  const [desde, hacia]: [Lugar, Lugar] = [lugarDe(e.nube, EXTENSION_DE_LA_ORBITA, 0), lugarDe(e.globo, EXT[1] ?? 1)]
  const cambio = cambioDeCapa(desde, hacia, e.titulo)
  afirmar(cambio !== null, `${e.nombre}: hay un cuadro limpio para el cambio`, cambio === null ? 'el globo pisa el título' : `avance ${cambio.avance.toFixed(3)}, el panel hasta ${cambio.bordeDelPanel.toFixed(0)} px`)
  if (cambio === null) continue
  const g = gDelAvance(cambio.avance)
  const inicio = inicioDelPanel(g, cambio.bordeDelPanel, e.ancho)
  const bordeEnElCambio = e.ancho * avanceDelPanel(g + CUADRO / 2, inicio)
  const sobre = (avance: number, cajas: readonly Caja[]): number => [0, 3.7, 11.2].reduce((n, t) => n + nanobotsEn(avance, t, SIMBOLOS, desde, hacia).filter((p) => cajas.some((c) => adentro(p, c))).length, 0)
  const panel: Caja = { izquierda: 0, arriba: 0, derecha: bordeEnElCambio, abajo: e.alto }
  afirmarIgual([sobre(cambio.avance, e.titulo), sobre(cambio.avance + CUADRO, e.titulo), sobre(cambio.avance, [panel]), sobre(cambio.avance + CUADRO, [panel])], [0, 0, 0, 0], `  ${e.nombre}: con la cuenta del sombreador (3000 nanobots, tres horas), cero sobre el título y cero sobre el panel en el cuadro del cambio y el siguiente`)
  afirmar(inicio + TIEMPOS.panel.duracion <= 1 && desdeDelTexto(inicio) <= 0.9, `  ${e.nombre}: el panel arranca en g ${inicio.toFixed(3)} (antes de que termine de entrar, los nanobots ya salieron) y cierra adentro de la transición`)
  controlPositivo(`  ${e.nombre}: el detector ve el cambio a destiempo (en el avance 0,3, con la nube todavía detrás del título)`, 0.3, (a: number) => sobre(a, e.titulo) === 0)
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Los datos: acentos, videos, destinos, formas y banderas')

const tema = readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8')
const delTema = (id: string): string => (new RegExp(`--color-acento-${id}:\\s*(#[0-9A-Fa-f]{6})`).exec(tema)?.[1] ?? '').toLowerCase()
const acentosBien = (a: Readonly<Record<keyof typeof ACENTOS_DE_SERVICIOS_EN_PAPEL, string>>): boolean => a.web.toLowerCase() === delTema('web') && a.software.toLowerCase() === delTema('software') && a.ia.toLowerCase() === delTema('ia-automatizacion')
afirmar(acentosBien(ACENTOS_DE_SERVICIOS_EN_PAPEL), 'los nanobots toman los acentos OSCUROS del tema (sobre papel), los mismos de `theme-develop.css`', `${ACENTOS_DE_SERVICIOS_EN_PAPEL.web} · ${ACENTOS_DE_SERVICIOS_EN_PAPEL.software} · ${ACENTOS_DE_SERVICIOS_EN_PAPEL.ia}`)
controlPositivo('  el detector ve el acento de marca (el cian de antes) en lugar del oscuro', { ...ACENTOS_DE_SERVICIOS_EN_PAPEL, web: '#06b6d4' }, acentosBien)
// [L7a] Reemplazada por la spec: el CTA de cada servicio va a SU página (`/v3/<slug>`), ya no a la maqueta base.
afirmar(IDS_DE_SERVICIO.every((id) => VIDEO_DEL_SERVICIO[id].fuente.startsWith('/portfolio/') && /^\/v3\/(paginas-web|software-a-medida|ia-y-automatizaciones)$/.test(DESTINO_DEL_SERVICIO[id])) && new Set(Object.values(DESTINO_DEL_SERVICIO)).size === 3, 'los videos, provisorios del Portfolio (una constante por servicio); el CTA de cada uno, a su página (el enganche del viaje)')
afirmar(DISTRIBUCION.web.entrada === 'izquierda' && DISTRIBUCION.software.entrada === 'derecha' && DISTRIBUCION['ia-automatizacion'].entrada === 'arriba' && DISTRIBUCION.software.orden.join() === [...DISTRIBUCION.web.orden].reverse().join(), 'web entra desde la izquierda, software (su espejo) desde la derecha, IA desde arriba')
const red = nodosDeLaRed()
afirmar(SIMBOLOS.every((s) => s.length === 3000 * 4 && s.every(Number.isFinite)) && red.length === 13 && conexionesDeLaRed().length === 3 * 4 + 4 * 4 + 4 * 2 && RED_NEURONAL.capas.join() === '3,4,4,2', 'las cuatro formas dan exactamente n nanobots; la red neuronal: 13 nodos en cuatro capas y 36 conexiones (nada de robot)')
/** La decodificación de `w` del sombreador (`VIDA_DE_LA_RED_GLSL`), en TypeScript: cada nanobot de la red es un nodo o una conexión válida. */
const decodificaBien = (datos: Float32Array): boolean => {
  for (let i = 3; i < datos.length; i += 4) {
    const w = datos[i]
    if (w < 20) {
      const capa = Math.floor(w - 10)
      const indice = Math.floor((w - 10 - capa) * 10 + 0.01)
      if (!(capa >= 0 && capa < RED_NEURONAL.capas.length && indice < (RED_NEURONAL.capas[capa] ?? 0))) return false
      continue
    }
    const q = w - 20
    const capa = Math.floor(q / 100)
    const r = q - capa * 100
    const k = Math.floor(r / 10 + 0.0001)
    const j = Math.floor(r - k * 10 + 0.0001)
    const u = (r - k * 10 - j) / 0.98
    if (!(capa >= 0 && capa < RED_NEURONAL.capas.length - 1 && k < (RED_NEURONAL.capas[capa] ?? 0) && j < (RED_NEURONAL.capas[capa + 1] ?? 0) && u >= -1e-3 && u <= 1 + 1e-3)) return false
  }
  return true
}
afirmar(decodificaBien(SIMBOLOS[3] ?? new Float32Array()), '  y cada nanobot de la red se decodifica en el sombreador como un nodo o una conexión válida (su capa, sus dos nodos y su fracción)')
controlPositivo('  el decodificador ve un `w` fuera de la red', Float32Array.from([0, 0, 0, 20 + 3 * 100]), decodificaBien)
afirmar(VERTICE_DE_SERVICIOS.includes('uniform float uRadioDelPuntero;') && VERTICE_DE_SERVICIOS.includes('float radio = uRadioDelPuntero *'), 'el desarme bajo el mouse de C4, con su radio medido en el símbolo (el lienzo cubre el escenario)')
// [L3] Reemplazada por la spec: la diagonal por defecto es 7; `?titulo-servicio=` y `?fuente-servicio=` se fueron; llegan `?titulo-cursiva=`
// y `?aro-color=`. [L7a] Reemplazada por la spec otra vez (Valentino, 2026-10-29): por defecto `?titulo-cursiva=3` y `?aro-color=tercios`.
const banderasBien = (d: typeof diagonalDeLaBandera): boolean => d(null) === 7 && d('12') === 12 && d('6.5') === 6.5 && d('50') === 7 && d('x') === 7 && cursivaDeLaBandera(null) === '3' && cursivaDeLaBandera('1') === '1' && cursivaDeLaBandera('4') === '3' && colorDelAroDeLaBandera(null) === 'tercios' && colorDelAroDeLaBandera('ola') === 'ola' && colorDelAroDeLaBandera('mezcla') === 'mezcla' && colorDelAroDeLaBandera('arcoiris') === 'tercios' && Math.abs(tangenteDe(7) - 0.1228) < 0.001
afirmar(banderasBien(diagonalDeLaBandera), 'L3 · L7a: `?diagonal=` numérica (7 por defecto, de 0 a 45), `?titulo-cursiva=1|2|3` (3 por defecto) y `?aro-color=mezcla|tercios|ola` (tercios por defecto)')
controlPositivo('  el detector ve la diagonal de C2-50 (6,5 por defecto)', (v: string | null) => (v === null ? 6.5 : Number(v)), banderasBien)
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const banderasDeLaSeccion = ['escenario/banderas.ts', 'escenario/useFuentesDelServicio.ts', 'escenario/PanelDeServicio.tsx', 'escenario/TextoEnDiagonal.tsx', 'movil/ServiciosDeslizar.tsx'].map((r) => sinComentarios(leer(`_secciones/servicios/${r}`))).join('\n')
afirmar(!/titulo-servicio|fuente-servicio|textoCormorant|tituloSerif|claseDelTexto/.test(banderasDeLaSeccion), '  L3: ni `?titulo-servicio=` ni `?fuente-servicio=` (ni sus letras) quedan en la sección')
// [L3] El color del aro sale del ángulo ACTUAL de cada nanobot (antes, del de su semilla: al minuto los colores quedaban mezclados).
const cuerpoDelColor = (v: string): string => /vec3 colorDeLaOrbita\( vec4 d, float t \) \{([\s\S]*?)\n\}/.exec(v)?.[1] ?? ''
const colorPorAngulo = (v: string): boolean => cuerpoDelColor(v).includes('anguloDeLaOrbita( d, t )') && !/atan\( d\.y/.test(cuerpoDelColor(v)) && ['uModoDelAro < 0.5', 'uModoDelAro < 1.5'].every((m) => cuerpoDelColor(v).includes(m)) && /p\.xy = vec2\( 1\.0, uProporcion \) \* dir/.test(v)
afirmar(colorPorAngulo(VERTICE_DE_SERVICIOS), 'L3: el color del aro (mezcla, tercios, ola) sale del ángulo actual de cada nanobot, y la elipse es la de su caja (`uProporcion`)')
controlPositivo('  el detector ve el color de C2-50 (del ángulo de la semilla)', VERTICE_DE_SERVICIOS.replace('float a = anguloDeLaOrbita( d, t );\n\t// La vuelta', 'float a = atan( d.y, d.x );\n\t// La vuelta'), colorPorAngulo)
// [L3] El sombreador decide el modo por su índice (< 0,5 mezcla, < 1,5 tercios, el resto ola): el orden de `MODOS_DEL_ARO` es el contrato.
const ordenDelAro = (modos: readonly string[]): boolean => modos.join() === 'mezcla,tercios,ola' && MODOS_DEL_ARO.every((m) => indiceDelModoDelAro(m) === modos.indexOf(m))
afirmar(ordenDelAro(MODOS_DEL_ARO), '  y el índice de cada modo es el que lee el sombreador (mezcla 0, tercios 1, ola 2)')
controlPositivo('  el detector ve los modos reordenados', ['ola', 'tercios', 'mezcla'], ordenDelAro)
const aroVertical =(u: typeof unidadDelLugar, e: typeof extensionDeLaOrbita, proporcionDe: typeof proporcionDeLaCaja = proporcionDeLaCaja): boolean => {
  // La elipse de la caja (la vertical del teléfono y la achatada de escritorio): sus semiejes en px (× 0,82 × unidad) son la mitad del
  // ancho y del alto, y la cota de capa.ts cubre el más largo.
  return [[320, 428], [985, 328]].every(([w, h]) => {
    const p = proporcionDe(w, h)
    const unidad = u(0, w, h, 1)
    return Math.abs(0.82 * unidad - w / 2) < 0.5 && Math.abs(p * 0.82 * unidad - h / 2) < 0.5 && e(p) * unidad >= Math.max(w, h) / 2
  })
}
afirmar(aroVertical(unidadDelLugar, extensionDeLaOrbita), 'L3: la órbita llena su caja, vertical (el teléfono) o achatada (escritorio): la unidad sale del ancho y el alto de la proporción; la cota del truco de profundidad cubre el semieje largo')
controlPositivo('  el detector ve la órbita de C2-50 (siempre 2:1, sin la proporción de su caja)', (() => 0.5) as typeof proporcionDeLaCaja, (p) => aroVertical(unidadDelLugar, extensionDeLaOrbita, p))
// [C2-50] El bug de 390: sin Lenis la rueda nativa llega tarde. Tres muescas de 100 px desde 250 px antes del ancla, con el scroll quieto.
const entraALaTercera = (base: typeof baseDelObjetivo): boolean => {
  const r: ReglaDeGatillos = { cantidad: 4, pasoPx: 844 }
  let o = SIN_OBJETIVO
  const d = [0, 1, 2].map((k) => {
    const entra = entradaDelGesto('antes', base(o, 750, k * 16) + 100 - 1000, 1, r)
    if (entra === null) o = seguirElObjetivo(o, 750, 100, k * 16, 99999)
    return entra
  })
  return d[0] === null && d[1] === null && d[2] === 0
}
afirmar(entraALaTercera(baseDelObjetivo), 'C2-50: sin Lenis, la muesca que CRUZA el ancla (la tercera) la atrapa la entrada aunque el scroll nativo no se haya movido')
controlPositivo('  el detector ve la cuenta de B4 (el scroll de ahora más el evento: no entra y la inercia pasa el ancla)', ((_o: unknown, y: number) => y) as typeof baseDelObjetivo, entraALaTercera)
const ajustaBien = (f: typeof tamanoQueEntra): boolean => Math.abs(f(14, 60, (t) => t <= 37.3) - 37.3) < 0.3 && f(14, 60, () => true) === 60 && f(14, 60, () => false) === 14
afirmar(ajustaBien(tamanoQueEntra), 'C2-50: el texto del medio toma el cuerpo más grande que entra (de techo a pie), entre el piso y el tope de la hoja')
controlPositivo('  el detector ve el ajuste que se queda en el piso', ((p: number) => p) as typeof tamanoQueEntra, ajustaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El recomendador y la REGLA DE ALTURAS')

// [C2-51] Reemplazada por la spec: el recomendador de B4 (el servicio más votado) pasó a recomendar DOS soluciones con los puntos de
// 05-TEXTOS. Acá, lo mínimo; las 125 combinaciones, el desempate y los textos, en s78-c2-51.
const recomiendaBien = (f: typeof recomendar): boolean => todasLasRespuestas().every((r) => f(r).a !== f(r).b) && f([0, 0, 0]).a === 'pagina' && f([4, 3, 0]).a === 'automatizacion'
afirmar(recomiendaBien(recomendar), 'C2-51: dos soluciones distintas en las 125 combinaciones; «la gente no me encuentra» lleva a la página, y el empate se lo lleva la pregunta 1')
controlPositivo('  el detector ve una recomendación que repite la solución', ((r: Parameters<typeof recomendar>[0]) => ({ a: recomendar(r).a, b: recomendar(r).a })) as typeof recomendar, recomiendaBien)
const tramo = tramoDeServicios(390, 844, 5 * 844, () => 4 * 844)
// [NOCTURNO] El alto viejo medido por el orquestador en el navegador (px, `[data-panel="servicios"]` antes de B4), a 1 px o menos.
const MEDIDOS = [[390, 844, 1661], [768, 1024, 1338], [820, 1180, 1382], [1023, 768, 1555]] as const
const mideComoAntes = (modelo: AltoViejo): boolean => MEDIDOS.every(([w, h, px]) => Math.abs((modelo(w, h) ?? 0) - px) <= 1)
afirmar(mideComoAntes(altoViejoMedido), 'la sección vieja medida a 390, 768, 820 y 1023 (1661, 1338, 1382 y 1555 px): el modelo la da a 1 px o menos')
controlPositivo('  un modelo en pantallas (proporcional al alto del cuadro) no la da', ((w: number, h: number) => (w >= 768 ? 1.3065 : 1.9682) * h) as AltoViejo, mideComoAntes)
// [C2-51] Reemplazada por la spec: desde 1024 la pista es fija y el recomendador crece; el alto viejo es la tabla (8 pantallas).
const ancho = tramoDeServicios(1440, 900, 7470)
afirmar(tramoDeServicios(1440, 900, 7200) === null && tramoDeServicios(1024, 768, 6144) === null && ancho !== null && Math.abs(ancho.k - 7470 / 7200) < 1e-9 && tramoDeServicios(390, 844, 4000, () => null) === null && tramo !== null && Math.abs(tramo.k - 1.25) < 1e-9 && tramo.arranque === 900 && Math.abs(tramo.largo - 3600) < 1e-9, 'desde 1024 el alto viejo es la tabla (800svh): igual, sin tramo; con el recomendador más alto, k = alto nuevo / tabla (C2-51); abajo, k = alto nuevo / alto viejo sobre la sección entera, y sin el alto viejo medido no se anota nada')
afirmar(seccionDe('servicios').alto === '800svh', '  y la tabla sigue diciendo lo de siempre (secciones.ts sin tocar)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Lo que se renderiza sin coreografía (el servidor y menos movimiento)')

const html = renderToStaticMarkup(<Servicios seccion={seccionDe('servicios')} />)
const veces = (aguja: string): number => html.split(aguja).length - 1
// [L3] Reemplazada por la spec: el CTA se fue; a la página llevan el título, el video y «Leer más…» (tres enlaces por servicio, con el viaje).
afirmar(html.includes('id="titular-servicios"') && veces('<h3') === SERVICIOS.length + 1 && veces('data-viaje-del-servicio=') === 3 * SERVICIOS.length && IDS_DE_SERVICIO.every((id) => veces(`href="${DESTINO_DEL_SERVICIO[id]}"`) === 3) && veces('data-parte="leer-mas"') === SERVICIOS.length && !html.includes('Quiero mi'), 'el `h2` de la sección, un `h3` por servicio y el del recomendador; L3: el título, el video y «Leer más…» de cada servicio llevan a su página (el viaje), sin el CTA «Quiero mi…»')
// [C2-51] Reemplazada por la spec: el recomendador va por etapas (el servidor publica la primera: cinco opciones) y con sus textos reales.
afirmar(veces('type="radio"') === 5 && !html.includes('[TEXTO]') && !/desde \$|PRECIOS_DESDE/.test(html), 'el recomendador por etapas (la primera: cinco opciones, con los textos de 05-TEXTOS, sin marcadores), y ningún precio «desde» en el home (P-H8 sin efecto)')
// [C2-50] El orden del teléfono (las pantallas quietas, en el marcado): el título (con sus nanobots), el video, el texto y el CTA.
const ordenBien = (h: string): boolean => {
  const pantallas = h.split('data-pieza="pantalla-de-servicio"').slice(1)
  // [L3] El último, «Leer más…» (el CTA se fue).
  return pantallas.length === 3 && pantallas.every((a) => { const i = [a.indexOf('<h3'), a.indexOf('data-pieza="video-del-servicio"'), a.indexOf('<p'), a.indexOf('data-parte="leer-mas"')]; return i.every((x, k) => x >= 0 && (k === 0 || x > (i[k - 1] ?? 0))) })
}
afirmar(ordenBien(html), 'C2-50: cada servicio en el orden del teléfono: el título, el video, el texto del medio y (L3) «Leer más…»')
controlPositivo('  el detector ve el video arriba del título (B4)', html.split('<h3').join('<h3 data-x=""').replace(/data-pieza="pantalla-de-servicio"/g, 'data-pieza="pantalla-de-servicio"><div data-pieza="video-del-servicio"></div'), ordenBien)
afirmar(html.includes('Los tipos de trabajos que hacemos en develOP.') && html.includes('Landing, sitio institucional, catálogo o tienda online') && html.includes('Se paga la implementación una vez'), 'C2-50: el subtítulo y el texto del medio nuevos (05-TEXTOS, tal cual)')
const fuenteDeLaSeccion = ['escenario/EscenarioDeServicios.tsx', 'escenario/useNanobotsDelEscenario.ts', 'movil/NanobotsQuietos.tsx'].map((r) => leer(`_secciones/servicios/${r}`)).join('\n')
const perezoso = (f: string): boolean => !/^import (?!type)[^\n]*nanobots\/(enjambreDeServicios|capa|enjambre)'/m.test(f) && /import\('\.\.\/\.\.\/\.\.\/_lib\/nanobots\/enjambreDeServicios'\)/.test(f)
afirmar(perezoso(fuenteDeLaSeccion), 'three no entra al paquete de la página: el motor y la cuenta de la capa llegan perezosos')
controlPositivo('  el detector ve el motor importado de entrada', `import { crearEnjambreDeServicios } from '../../../_lib/nanobots/enjambreDeServicios'\n${fuenteDeLaSeccion}`, perezoso)

cerrar('s81-servicios')
