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
import { diagonalDeLaBandera, modoDeLaBandera, tangenteDe } from '../../_secciones/servicios/escenario/banderas'
import { DESTINO_DEL_SERVICIO, VIDEO_DEL_SERVICIO, DISTRIBUCION } from '../../_secciones/servicios/escenario/datos'
import { DURACION_DE_LA_TRANSICION_MS, TIEMPOS, avanceDelPanel, avanceDelRenglon, capaDelEnjambre, desdeDelTexto, gDelAvance, inicioDelPanel, posicionDelEnjambre } from '../../_secciones/servicios/escenario/tiempos'
import { servicioRecomendado } from '../../_secciones/servicios/recomendador/preguntas'
import { Servicios } from '../../_secciones/servicios/Servicios'
import { altoViejoMedido, tramoDeServicios, type AltoViejo } from '../../_secciones/servicios/tramoDeServicios'
import { cambioDeCapa, extensionDelSimbolo, type Caja, type Lugar } from '../nanobots/capa'
import { ACENTOS_DE_SERVICIOS_EN_PAPEL, VERTICE_DE_SERVICIOS, simbolosDeServicios } from '../nanobots/enjambreDeServicios'
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

const REGLA: ReglaDeGatillos = { cantidad: 4, pasoPx: 1350 }
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
  { nombre: 'dos muescas a 1 s (la transición corriendo): un paso', eventos: [muesca(1000), muesca(2000)], desde: 0, espera: [1] },
  { nombre: 'dos muescas a 3 s: dos pasos, de a uno', eventos: [muesca(1000), muesca(4000)], desde: 0, espera: [1, 2] },
  { nombre: 'subiendo desde IA: sale por donde entró, de a uno', eventos: [muesca(1000, -100), muesca(4000, -100), muesca(7000, -100), muesca(10000, -100)], desde: 3, espera: [2, 1, 0, -1] },
  { nombre: 'después del último, la salida de abajo (el recomendador)', eventos: [muesca(1000)], desde: 3, espera: [4] },
  { nombre: 'entrando con una ráfaga larga: aterriza en la entrada, no más allá', eventos: rafaga(1000), desde: -1, espera: [0] },
  { nombre: 'subiendo desde el recomendador con el trackpad: aterriza en IA', eventos: trackpad(1000, -1), desde: 4, espera: [3] },
]
const anduvo = (decidir: typeof decidirLaRueda, transicion = DURACION_DE_LA_TRANSICION_MS): string[] => CASOS.filter((c) => recorrido(c.eventos, c.desde, decidir, transicion).join() !== c.espera.join()).map((c) => c.nombre)
afirmarIgual(anduvo(decidirLaRueda), [], `los ${String(CASOS.length)} casos: un gesto es un paso (quieta ${String(COMUN.RUEDA.quietoMs)} ms), nunca dos; la transición (${String(DURACION_DE_LA_TRANSICION_MS)} ms) se ve entera; la entrada atrapa`)
const dePixeles: typeof decidirLaRueda = (m) => ({ decision: { tipo: 'paso', sentido: m.px > 0 ? 1 : -1 }, gesto: m.gesto })
controlPositivo('  el detector ve la rueda de a píxeles (cada evento, un paso)', dePixeles, (d) => anduvo(d).length === 0)
controlPositivo('  y la máquina sin candado (la transición se corta: dos muescas a 1 s dan dos pasos)', 0, (t) => anduvo(decidirLaRueda, t).length === 0)
const sinTrampa: typeof decidirLaRueda = (m, r) => (m.paso < 0 ? { decision: { tipo: 'pagina' }, gesto: m.gesto } : decidirLaRueda(m, r))
controlPositivo('  y la entrada sin trampa (la ráfaga entra de largo, F2)', sinTrampa, (d) => anduvo(d).length === 0)
afirmar(decidirLaTecla(1, 4, false, false, false) === 'paso' && decidirLaTecla(1, 4, false, false, true) === 'tragar' && decidirLaTecla(1, 4, false, true, false) === 'tragar' && decidirLaTecla(-1, 4, false, false, false) === 'pagina' && decidirLaTecla(4, 4, true, false, false) === 'tragar', 'el teclado: adentro, una tecla apretada es un paso (su repetición y lo que llega en la transición se tragan); afuera, la página')
controlPositivo('  el detector ve la tecla repetida que avanza', (p: number, n: number, v: boolean, o: boolean) => (p >= 0 && p < n && !v && !o ? 'paso' : 'pagina'), (f: typeof decidirLaTecla) => f(1, 4, false, false, true) === 'tragar')
afirmar(pasoConHisteresisEnElTramo(1, 2 * 1350 + 20, REGLA) === 1 && pasoConHisteresisEnElTramo(1, 2 * 1350 + 40, REGLA) === 2 && entradaDelGesto('antes', 99999, 1, REGLA) === 0, 'el paso por el scroll (la barra, un ancla) con la histéresis del Portfolio (30 px); la entrada aterriza en el primero por lejos que vaya')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los tiempos de una transición (puros)')

afirmar(avanceDelPanel(TIEMPOS.panel.inicio) === 0 && avanceDelPanel(1) === 1 && posicionDelEnjambre(1) === 1 && posicionDelEnjambre(TIEMPOS.enjambre.hasta) === 1 && posicionDelEnjambre(2.25) === 2.5, 'el panel entra entre su inicio y su cierre; el enjambre llega a mitad de la transición')
const renglonesEnOrden = (f: typeof avanceDelRenglon): boolean => [1, 4, 8, 12].every((n) => Array.from({ length: n }, (_, i) => f(1, i, n)).every((a) => a === 1) && Array.from({ length: n - 1 }, (_, i) => f(0.8, i, n) >= f(0.8, i + 1, n)).every(Boolean) && f(desdeDelTexto(TIEMPOS.panel.inicio) - 0.001, 0, n) === 0)
afirmar(renglonesEnOrden(avanceDelRenglon), 'los renglones se levantan después de que el panel cerró, uno detrás del otro, y en g = 1 están todos en su lugar (con 1 a 12 renglones)')
controlPositivo('  el detector ve el escalonado que no llega (el último a medias al terminar)', (g: number, i: number) => Math.min(1, Math.max(0, (g - 0.7 - i * 0.045) / 0.2)), renglonesEnOrden)
afirmar(capaDelEnjambre(0, 0.3) === 'detras' && capaDelEnjambre(0.29, 0.3) === 'detras' && capaDelEnjambre(0.3, 0.3) === 'delante' && capaDelEnjambre(1, 0.9) === 'delante' && capaDelEnjambre(2.4, 0.3) === 'delante', 'la capa: detrás del título en la entrada, delante desde el cambio, y delante en los tres servicios')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El truco de profundidad: ningún nanobot sobre el título ni sobre el panel en el cuadro del cambio')

const SIMBOLOS = simbolosDeServicios(3000)
const EXT = SIMBOLOS.map(extensionDelSimbolo)
const CUADRO = (1000 / 60 / (DURACION_DE_LA_TRANSICION_MS * (TIEMPOS.enjambre.hasta - TIEMPOS.enjambre.desde)))
for (const e of ESCENARIOS_DE_PRUEBA) {
  const [desde, hacia]: [Lugar, Lugar] = [lugarDe(e.nube, EXT[0] ?? 1), lugarDe(e.globo, EXT[1] ?? 1)]
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
afirmar(IDS_DE_SERVICIO.every((id) => VIDEO_DEL_SERVICIO[id].fuente.startsWith('/portfolio/') && DESTINO_DEL_SERVICIO[id] === '/v3/pagina-base'), 'los videos, provisorios del Portfolio (una constante por servicio); el CTA de cada uno, a la maqueta base (el enganche del viaje)')
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
afirmar(diagonalDeLaBandera('30') === 30 && diagonalDeLaBandera('12') === 12 && diagonalDeLaBandera(null) === 20 && diagonalDeLaBandera('45') === 20 && modoDeLaBandera('gatillo') === 'gatillo' && modoDeLaBandera(null) === 'deslizar' && Math.abs(tangenteDe(20) - 0.364) < 0.001, '`?diagonal=30|20|12` (20 por defecto) y `?servicios-movil=deslizar|gatillo` (deslizar por defecto)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El recomendador y la REGLA DE ALTURAS')

const recomiendaBien = (f: typeof servicioRecomendado): boolean => f(['web', 'web', 'software']) === 'web' && f(['web', 'software', 'ia-automatizacion']) === 'ia-automatizacion' && f(['software', null, 'web']) === null && f(['ia-automatizacion', 'web', 'web']) === 'web'
afirmar(recomiendaBien(servicioRecomendado), 'el más elegido; si empatan, el de la última respuesta; nada hasta que estén las tres')
controlPositivo('  el detector ve el recomendador que responde con preguntas sin contestar', (r: readonly (string | null)[]) => (r.find((x) => x !== null) ?? null) as ReturnType<typeof servicioRecomendado>, recomiendaBien)
const tramo = tramoDeServicios(390, 844, 5 * 844, () => 4 * 844)
// [NOCTURNO] El alto viejo medido por el orquestador en el navegador (px, `[data-panel="servicios"]` antes de B4), a 1 px o menos.
const MEDIDOS = [[390, 844, 1661], [768, 1024, 1338], [820, 1180, 1382], [1023, 768, 1555]] as const
const mideComoAntes = (modelo: AltoViejo): boolean => MEDIDOS.every(([w, h, px]) => Math.abs((modelo(w, h) ?? 0) - px) <= 1)
afirmar(mideComoAntes(altoViejoMedido), 'la sección vieja medida a 390, 768, 820 y 1023 (1661, 1338, 1382 y 1555 px): el modelo la da a 1 px o menos')
controlPositivo('  un modelo en pantallas (proporcional al alto del cuadro) no la da', ((w: number, h: number) => (w >= 768 ? 1.3065 : 1.9682) * h) as AltoViejo, mideComoAntes)
afirmar(tramoDeServicios(1440, 900, 7200) === null && tramoDeServicios(1024, 768, 6144, () => 3 * 768) === null && tramoDeServicios(390, 844, 4000, () => null) === null && tramo !== null && Math.abs(tramo.k - 1.25) < 1e-9 && tramo.arranque === 900 && Math.abs(tramo.largo - 3600) < 1e-9, 'desde 1024 no hay tramo (la sección llena los 800svh de la tabla: k = 1); abajo, k = alto nuevo / alto viejo sobre la sección entera, y sin el alto viejo medido no se anota nada')
afirmar(seccionDe('servicios').alto === '800svh', '  y la tabla sigue diciendo lo de siempre (secciones.ts sin tocar)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Lo que se renderiza sin coreografía (el servidor y menos movimiento)')

const html = renderToStaticMarkup(<Servicios seccion={seccionDe('servicios')} />)
const veces = (aguja: string): number => html.split(aguja).length - 1
afirmar(html.includes('id="titular-servicios"') && veces('<h3') === SERVICIOS.length + 1 && veces('data-viaje-del-servicio=') === SERVICIOS.length && veces('href="/v3/pagina-base"') === SERVICIOS.length, 'el `h2` de la sección, un `h3` por servicio y el del recomendador, y un CTA por servicio a su página (el viaje)')
afirmar(veces('type="radio"') === 9 && html.includes('[TEXTO]') && !/desde \$|PRECIOS_DESDE/.test(html), 'el recomendador con sus tres preguntas de tres opciones (marcadas: `[TEXTO]`), y ningún precio «desde» en el home (P-H8 sin efecto)')
const fuenteDeLaSeccion = ['escenario/EscenarioDeServicios.tsx', 'escenario/useNanobotsDelEscenario.ts', 'movil/NanobotsQuietos.tsx'].map((r) => leer(`_secciones/servicios/${r}`)).join('\n')
const perezoso = (f: string): boolean => !/^import (?!type)[^\n]*nanobots\/(enjambreDeServicios|capa|enjambre)'/m.test(f) && /import\('\.\.\/\.\.\/\.\.\/_lib\/nanobots\/enjambreDeServicios'\)/.test(f)
afirmar(perezoso(fuenteDeLaSeccion), 'three no entra al paquete de la página: el motor y la cuenta de la capa llegan perezosos')
controlPositivo('  el detector ve el motor importado de entrada', `import { crearEnjambreDeServicios } from '../../../_lib/nanobots/enjambreDeServicios'\n${fuenteDeLaSeccion}`, perezoso)

cerrar('s81-servicios')
