/**
 * INVARIANTE — cuántas mediciones ocurren, y cuándo NO ocurren.
 *
 * Corre con `npm run test:s2-epoca`.
 *
 * ── La cifra que este archivo produce ──────────────────────────────────────
 *
 * El sprint pide reportar cuántas mediciones ocurren en un ciclo de vida típico.
 * Ese número no se puede afirmar mirando un `useEffect` con un `setTimeout`
 * adentro, así que el núcleo de la decisión es un reductor puro y el número sale
 * de correrle una secuencia de eventos.
 *
 * ── El control positivo es un reductor INGENUO ─────────────────────────────
 *
 * El que uno escribiría sin la lección: medir en cada `resize` y no mirar la
 * visibilidad de la pestaña. Los tres escenarios se corren contra los dos, y las
 * cifras tienen que separarse. Si dieran lo mismo, el reposo y la guardia de
 * visibilidad serían decoración.
 *
 * ── Por qué la guardia de visibilidad ──────────────────────────────────────
 *
 * Con la pestaña ocluida el navegador saltea los rendering steps y
 * `window.innerWidth` devuelve 0. Una medición tomada ahí no es imprecisa: es
 * cero, y el texto queda partido con un ancho de cero para siempre. Es una
 * lección ya pagada en este repo, no una precaución teórica.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import {
  EPOCA_INICIAL,
  REPOSO_MS,
  correrEventos,
  medicionesPorInstancia,
  reducirEpoca,
  type EstadoDeEpoca,
  type EventoDeMedicion,
} from '../epoca'

/** El reductor INGENUO: mide en cada resize y no mira la visibilidad. */
function reducirIngenuo(estado: EstadoDeEpoca, evento: EventoDeMedicion): EstadoDeEpoca {
  if (evento === 'resize' || evento === 'fuentes') {
    return { ...estado, epoca: estado.epoca + 1 }
  }
  return estado
}
const correrIngenuo = (eventos: readonly EventoDeMedicion[]): number =>
  eventos.reduce(reducirIngenuo, EPOCA_INICIAL).epoca

/** Una ráfaga de arrastre de ventana: veinte `resize` y un reposo al final. */
const RAFAGA: readonly EventoDeMedicion[] = [
  ...(Array.from({ length: 20 }, () => 'resize') as EventoDeMedicion[]),
  'reposo',
]

// ═══════════════════════════════════════════════════════════════════════════
titulo('E1 · El ciclo de vida típico')

const TIPICO_CON_FUENTES: readonly EventoDeMedicion[] = ['fuentes']
const TIPICO_SIN_FUENTES: readonly EventoDeMedicion[] = []

afirmarIgual(
  medicionesPorInstancia(TIPICO_SIN_FUENTES),
  1,
  'fuentes ya cargadas al montar → UNA medición por instancia (la del montaje)',
)
afirmarIgual(
  medicionesPorInstancia(TIPICO_CON_FUENTES),
  2,
  'fuentes en vuelo → DOS: la del montaje y la de `document.fonts.ready`',
)

console.log(
  `  cota superior del ciclo típico: 2 mediciones por instancia · 1 lectura de layout cada una`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('E2 · La ráfaga de arrastre — veinte resize, UNA medición')

afirmarIgual(correrEventos(RAFAGA).epoca, 1, 'veinte `resize` y un reposo mueven la época UNA vez')
afirmarIgual(
  medicionesPorInstancia(RAFAGA),
  2,
  '  o sea 2 mediciones por instancia: el montaje más la del reposo',
)

controlPositivo(
  'el reductor INGENUO (sin reposo) mide veinte veces la misma ráfaga',
  RAFAGA,
  (eventos) => correrIngenuo(eventos) === 1,
)
console.log(`  con reposo: 1 época · sin reposo: ${correrIngenuo(RAFAGA)} épocas`)
console.log(`  ventana de reposo declarada: ${REPOSO_MS} ms`)

afirmarIgual(
  correrEventos(['resize', 'resize', 'resize']).epoca,
  0,
  'sin el reposo, la ráfaga no mueve la época en absoluto: el `resize` solo anota',
)
afirmar(correrEventos(['resize']).pendiente, '  pero queda anotada como pendiente')

// ═══════════════════════════════════════════════════════════════════════════
titulo('E3 · Pestaña oculta — no se mide, y no se pierde')

const OCULTA: readonly EventoDeMedicion[] = ['oculto', 'resize', 'resize', 'reposo']
afirmarIgual(
  correrEventos(OCULTA).epoca,
  0,
  'con la pestaña oculta NO se mide: ahí `innerWidth` da 0 y la medición sería falsa',
)
afirmar(correrEventos(OCULTA).pendiente, '  y la medición queda pendiente, no descartada')
afirmarIgual(
  correrEventos([...OCULTA, 'visible']).epoca,
  1,
  'al volver a estar visible, se mide una vez',
)

afirmarIgual(
  correrEventos(['oculto', 'fuentes', 'visible']).epoca,
  1,
  'lo mismo con las fuentes: si llegan con la pestaña oculta, esperan',
)

controlPositivo(
  'el reductor INGENUO mide con la pestaña oculta',
  OCULTA,
  (eventos) => correrIngenuo(eventos) === 0,
)
console.log(`  con guardia: 0 épocas · sin guardia: ${correrIngenuo(OCULTA)} épocas`)

afirmarIgual(
  correrEventos(['visible']).epoca,
  0,
  'y volver a estar visible SIN nada pendiente no gasta una medición',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('E4 · El reductor es puro y total')

const EVENTOS: readonly EventoDeMedicion[] = ['fuentes', 'resize', 'reposo', 'visible', 'oculto']
for (const evento of EVENTOS) {
  const a = reducirEpoca(EPOCA_INICIAL, evento)
  const b = reducirEpoca(EPOCA_INICIAL, evento)
  afirmarIgual(a, b, `\`${evento}\` da el mismo estado siempre`)
}
afirmarIgual(EPOCA_INICIAL.epoca, 0, 'el estado inicial arranca en la época 0')
afirmar(EPOCA_INICIAL.visible, '  y asume visible: la capa de DOM lo corrige al cablearse')

// Una secuencia larga y desordenada no puede bajar la época ni desbordar.
let estado = EPOCA_INICIAL
let nuncaBaja = true
const desordenada: EventoDeMedicion[] = []
for (let i = 0; i < 500; i++) desordenada.push(EVENTOS[i % EVENTOS.length])
for (const evento of desordenada) {
  const siguiente = reducirEpoca(estado, evento)
  if (siguiente.epoca < estado.epoca) nuncaBaja = false
  estado = siguiente
}
afirmar(nuncaBaja, 'y en 500 eventos desordenados la época nunca retrocede', `época final ${estado.epoca}`)

cerrar('epoca.invariant')
