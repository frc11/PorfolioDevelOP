/**
 * INVARIANTE — SITIO-S9 · LA ESCENA SE SUSPENDE DONDE NADIE LA VE.
 *
 *     npm run test:s9-visibilidad
 *
 * ── Lo que este archivo tiene que probar, y en qué orden ───────────────────
 *
 * §2.4 de `DIRECCION-ESCENA.md` pide que la escena *"se apague y vuelva"*, y la
 * premisa de SITIO-S9 es que eso puede ser mucho más barato de lo que ese texto
 * imagina: si en las secciones opacas el panel YA tapa la sala, lo que falta no
 * es un efecto visual, es **dejar de renderizar**. Un efecto sería §7.4 y lo
 * decide el humano; suspender el lazo no lo es, porque no cambia un píxel.
 *
 * **Por eso la premisa se mide primero y con instrumento (§1).** Si en alguna
 * sección opaca la sala igual asomara, este invariante se pondría rojo ahí y el
 * resto del sprint no tendría base.
 *
 * ── Los tres controles positivos que hacen que esto no sea verde por vacío ──
 *
 * 1. **El detector de relleno VE un panel transparente donde lo hay** (§1): si
 *    dijera «todas tapan» pasaría en verde con ocho paneles opacos, que es el
 *    recorrido que S1 dejó y que S5 cambió a propósito.
 * 2. **`escenaEnCuadro` dice que NO en el medio de la banda opaca** (§2): un
 *    predicado que devuelve `true` siempre es el cuerpo del enchufe que este
 *    frente vino a reemplazar, y pasaría todas las afirmaciones positivas.
 * 3. **La máquina se compara por IDENTIDAD y no por forma** (§3): una copia
 *    estructuralmente idéntica tiene que fallar la comparación, o el invariante
 *    no estaría afirmando la propiedad que el enchufe necesita.
 *
 * ── Lo que este invariante NO puede probar, y queda dicho ──────────────────
 *
 * Que el navegador efectivamente no dibuje. Eso es de `frameloop='never'` de
 * r3f, del lado del canvas, y acá se afirma la CADENA que lo pide —qué fase
 * pide qué lazo— no su efecto. La cadena entera está en §3.5.
 */

import { CLASES_FUERA_DE_FLUJO } from '../../compuerta'
import { SECCIONES } from '../../secciones'
import { SUPERFICIES, type DefinicionSuperficie } from '../../superficies'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { ANCLAJE } from '../anclaje'
import {
  CUADROS_DE_REANUDACION,
  ESTADO_INICIAL,
  MARGEN_DE_REANUDACION,
  escenaEnCuadro,
  fisicaEn,
  frameloopDe,
  siguiente,
  type EstadoDeLaEscena,
  type EventoDeLaEscena,
} from '../visibilidad'
import {
  DOCUMENTO,
  VENTANA,
  cuadrosDeUnaPasada,
  enPantalla,
  imprimirCuadros,
  marcadoDelPanel,
  medirBanda,
} from './visibilidadMedida'

// ── §1 · LA PREMISA, MEDIDA ANTES DE CONSTRUIR ──────────────────────────────

titulo('§1 · la premisa: ¿el panel opaco ya tapa la sala?')

/** Si una superficie pinta un relleno sólido. La única clase que lo hace. */
const pintaRelleno = (d: DefinicionSuperficie): boolean => d.clases.split(' ').includes('bg-fondo')

/** «Dice que tapa» y «pinta relleno» tienen que ser la MISMA cosa. */
const coherente = (d: DefinicionSuperficie): boolean => d.dejaVerElCanvas !== pintaRelleno(d)

const modos = Object.entries(SUPERFICIES)
afirmar(
  modos.every(([, d]) => coherente(d)),
  'cada superficie que declara tapar el canvas pinta un relleno, y la que no, no',
  modos.map(([m, d]) => `${m}:${pintaRelleno(d) ? 'relleno' : 'sin relleno'}`).join(' · '),
)
const falsa = (clases: string, dejaVerElCanvas: boolean): DefinicionSuperficie => ({ clases, invertida: false, dejaVerElCanvas, detrasDelTexto: 'nada' })
controlPositivo('una superficie que dice tapar SIN pintar relleno se detecta', falsa('text-tinta', false), coherente)
controlPositivo('una que dice dejar ver Y pinta relleno se detecta', falsa('bg-fondo text-tinta', true), coherente)

// §1.2 · La cuenta real, contra la que la instrucción del sprint declara.
const transparentes = ANCLAJE.geometria.filter((g) => g.dejaVerLaEscena)
const opacas = ANCLAJE.geometria.filter((g) => !g.dejaVerLaEscena)
afirmarIgual(
  [transparentes.length, opacas.length],
  [2, 6],
  '⚠ CORRECCIÓN: son SEIS opacas de las ocho, no cinco (transparentes, opacas)',
)
console.log(`  transparentes: ${transparentes.map((g) => g.id).join(', ')}`)
console.log(`  opacas:        ${opacas.map((g) => g.id).join(', ')}`)

/**
 * De dónde sale el «cinco» de la instrucción, para que la corrección no se lea
 * como un desacuerdo: **cinco es la cuenta sobre las SIETE que llevan recorrido
 * de scroll**, o sea sin el Cierre, que mide una pantalla y es donde el
 * recorrido termina. Sobre las ocho son seis.
 */
const conRecorrido = ANCLAJE.geometria.filter((g) => g.desdePantalla < ANCLAJE.pantallasDeScroll)
const opacasConRecorrido = conRecorrido.filter((g) => !g.dejaVerLaEscena)
afirmarIgual(
  [conRecorrido.length, opacasConRecorrido.length],
  [7, 5],
  'el «cinco» de la instrucción es la cuenta sobre las que llevan recorrido (con recorrido, opacas)',
)

const pantallasOpacas = opacas.reduce((n, g) => n + g.altoEnPantallas, 0)
afirmarIgual(
  [pantallasOpacas, ANCLAJE.pantallasDelDocumento],
  [12, 14],
  'pantallas de panel opaco sobre pantallas del documento',
)
console.log(
  `  el ${((100 * pantallasOpacas) / ANCLAJE.pantallasDelDocumento).toFixed(1)}% del documento es panel opaco`,
)

// §1.3 · La pila no tiene huecos: una sección empieza donde termina la anterior.
const sinHuecos = (g: readonly { desdePantalla: number; hastaPantalla: number }[]): boolean =>
  g[0].desdePantalla === 0 && g.every((f, i) => i === 0 || f.desdePantalla === g[i - 1].hastaPantalla)
afirmar(sinHuecos(ANCLAJE.geometria), 'la pila de secciones no deja un hueco por el que se vea la sala')
const conHueco = [{ desdePantalla: 0, hastaPantalla: 1 }, { desdePantalla: 1.5, hastaPantalla: 2.5 }]
controlPositivo('un hueco de media pantalla entre dos secciones se detecta', conHueco, sinHuecos)

titulo('§1.4 · el marcado REAL que emite cada panel, no la intención del componente')

/**
 * Las clases por las que la sala podría asomar a través de un panel que se
 * declara opaco. Es una lista cerrada y corta a propósito: **cada entrada es
 * una forma de puncionar un relleno sólido** —un margen abre un hueco entre
 * paneles, un radio recorta las esquinas, un alfa lo vuelve translúcido, un
 * modo de mezcla lo compone con lo de atrás— y ninguna de las ocho las usa hoy.
 */
const PUNCIONES = /(^|\s)(m[trblxy]?-|rounded|opacity-|bg-transparent|mix-blend-)/
const sinPuncion = (clases: string): boolean => !PUNCIONES.test(clases)

for (const seccion of SECCIONES) {
  const { html, clases } = marcadoDelPanel(seccion)
  const dejaVer = SUPERFICIES[seccion.superficie].dejaVerElCanvas
  afirmar(
    clases.split(' ').includes('bg-fondo') === !dejaVer,
    `${seccion.id.padEnd(16)} emite el relleno que su superficie declara`,
    `${seccion.superficie} · ${dejaVer ? 'sin relleno' : 'bg-fondo'}`,
  )
  afirmar(
    html.includes(`min-height:${seccion.alto}`) && clases.includes('z-10'),
    `${seccion.id.padEnd(16)} declara su alto y va por encima del escenario`,
  )
  afirmar(sinPuncion(clases), `${seccion.id.padEnd(16)} no punciona su relleno`)
}
controlPositivo('un radio en el panel se detecta como punción', 'relative z-10 w-full bg-fondo rounded-3xl', sinPuncion)
controlPositivo('un margen en el panel se detecta como punción', 'relative z-10 w-full bg-fondo mt-8', sinPuncion)

afirmar(
  CLASES_FUERA_DE_FLUJO.includes('z-0') && CLASES_FUERA_DE_FLUJO.includes('fixed'),
  'el escenario está fijo y en z-0 — los paneles, en z-10, van encima',
  CLASES_FUERA_DE_FLUJO,
)

// ── §2 · LAS VENTANAS, DERIVADAS ────────────────────────────────────────────

titulo('§2 · las ventanas de scroll en las que la escena se ve')

afirmarIgual(
  ANCLAJE.ventanasDeLaEscena,
  [
    [0, 1],
    [11, 13],
  ],
  'las ventanas salen de la derivación, no de una lista escrita a mano',
)

const M = MARGEN_DE_REANUDACION
for (const [p, esperado, porQue] of [
  [0, true, 'el primer píxel: el hero es transparente'],
  [1 - 0.001, true, 'el hero todavía entrega el cuadro'],
  [1 + M, true, 'el borde exterior del margen de la primera ventana'],
  [1 + M + 0.001, false, 'un pelo más allá del margen: se suspende'],
  [6, false, 'el medio de la banda opaca — cuatro paneles de distancia'],
  [11 - M - 0.001, false, 'un pelo antes del margen de la segunda ventana'],
  [11 - M, true, 'el margen enciende la escena antes de que el diferencial asome'],
  [12, true, 'el diferencial llena el cuadro'],
  [13, true, 'el final del scroll'],
] as const) {
  afirmar(enPantalla(p) === esperado, `pantalla ${String(p).padEnd(9)} → ${esperado ? 'se ve' : 'suspendida'}`, porQue)
}

controlPositivo('el detector NO dice «se ve» en el medio de la banda opaca', 6, enPantalla)
controlPositivo('el detector NO dice «se ve» detrás de Trabajos', 5.5, enPantalla)

afirmar(
  enPantalla(0.5) && enPantalla(12.5),
  'y SÍ ve las dos secciones transparentes donde están — el detector no es un «false» constante',
)

afirmar(
  escenaEnCuadro(0, 0, 0) && escenaEnCuadro(0, VENTANA, VENTANA) && escenaEnCuadro(Number.NaN, DOCUMENTO, VENTANA),
  'con la pestaña oculta, un documento que no scrollea o una medición que no es número, la escena queda ENCENDIDA',
  'el lado seguro es el comportamiento de hoy, no una pantalla apagada',
)

// ── §3 · LA MÁQUINA ─────────────────────────────────────────────────────────

titulo('§3 · las nueve transiciones')

const CORRIENDO = ESTADO_INICIAL
const SUSPENDIDA = siguiente(CORRIENDO, { tipo: 'cuadro', enCuadro: false })
const REANUDANDO = siguiente(SUSPENDIDA, { tipo: 'cuadro', enCuadro: true })
const ENTRA: EventoDeLaEscena = { tipo: 'cuadro', enCuadro: true }
const SALE: EventoDeLaEscena = { tipo: 'cuadro', enCuadro: false }
const PINTADO: EventoDeLaEscena = { tipo: 'pintado' }

/** Las nueve casillas: fase × evento, con la fase que sale y si el objeto cambia. */
for (const [estado, evento, fase, mismo, nombre] of [
  [CORRIENDO, ENTRA, 'corriendo', true, 'corriendo + entra'],
  [CORRIENDO, SALE, 'suspendida', false, 'corriendo + sale'],
  [CORRIENDO, PINTADO, 'corriendo', true, 'corriendo + pintado (no significa nada acá)'],
  [SUSPENDIDA, ENTRA, 'reanudando', false, 'suspendida + entra'],
  [SUSPENDIDA, SALE, 'suspendida', true, 'suspendida + sale'],
  [SUSPENDIDA, PINTADO, 'suspendida', true, 'suspendida + pintado (el lazo está apagado)'],
  [REANUDANDO, ENTRA, 'reanudando', true, 'reanudando + entra (no se reinicia la cuenta)'],
  [REANUDANDO, SALE, 'suspendida', false, 'reanudando + sale (se apaga sin terminar)'],
  [REANUDANDO, PINTADO, 'reanudando', false, 'reanudando + pintado (avanza la cuenta)'],
] as const satisfies readonly (readonly [EstadoDeLaEscena, EventoDeLaEscena, string, boolean, string])[]) {
  const salida = siguiente(estado, evento)
  afirmar(salida.fase === fase, `${nombre.padEnd(46)} → ${fase}`)
  afirmar(
    (salida === estado) === mismo,
    `${nombre.padEnd(46)} → ${mismo ? 'MISMO objeto (===)' : 'objeto nuevo'}`,
  )
}

controlPositivo(
  'la comparación de arriba es por IDENTIDAD y no por forma',
  { fase: 'corriendo', cuadros: 0 } as EstadoDeLaEscena,
  (copia) => copia === ESTADO_INICIAL,
)

titulo('§3.3 · de suspendida NO se puede pasar a corriendo directo')

const TODOS: readonly EventoDeLaEscena[] = [ENTRA, SALE, PINTADO]
const sinAtajo = (paso: (e: EstadoDeLaEscena, v: EventoDeLaEscena) => EstadoDeLaEscena): boolean =>
  TODOS.every((v) => paso(SUSPENDIDA, v).fase !== 'corriendo')
afirmar(sinAtajo(siguiente), 'ningún evento lleva de suspendida a corriendo sin pasar por reanudando')
controlPositivo('un atajo de suspendida a corriendo se detecta', () => CORRIENDO, sinAtajo)

let estado = SUSPENDIDA
let pintados = 0
estado = siguiente(estado, ENTRA)
while (estado.fase !== 'corriendo' && pintados < 10) {
  estado = siguiente(estado, PINTADO)
  pintados += 1
}
afirmarIgual(
  [estado.fase, pintados],
  ['corriendo', CUADROS_DE_REANUDACION],
  'volver cuesta exactamente CUADROS_DE_REANUDACION cuadros pintados (fase, cuadros)',
)

titulo('§3.5 · qué le pide cada fase al canvas')

for (const [fase, lazo, fisica] of [
  ['corriendo', 'always', true],
  ['suspendida', 'never', false],
  ['reanudando', 'always', false],
] as const) {
  const e: EstadoDeLaEscena = { fase, cuadros: 0 }
  afirmarIgual([frameloopDe(e), fisicaEn(e)], [lazo, fisica], `${fase.padEnd(10)} → lazo y física`)
}
controlPositivo(
  'el lazo NO se apaga en reanudando — si se apagara, el cuadro exacto no se pintaría nunca',
  { fase: 'reanudando', cuadros: 0 } as EstadoDeLaEscena,
  (e) => frameloopDe(e) === 'never',
)
controlPositivo(
  'la física NO corre en reanudando — si corriera, volvería el latigazo desde la pose vieja',
  { fase: 'reanudando', cuadros: 0 } as EstadoDeLaEscena,
  fisicaEn,
)

// ── §4 · LOS CUADROS AHORRADOS ──────────────────────────────────────────────

titulo('§4 · cuántos cuadros se ahorran, y con qué supuestos')

const banda = medirBanda()
imprimirCuadros(banda)
afirmar(
  banda.conMargen > 0.7 && banda.conMargen < banda.sinMargen,
  'más del 70% del recorrido queda suspendido, y el margen cuesta algo — no es gratis ni es cero',
  `${(100 * banda.conMargen).toFixed(1)}% contra ${(100 * banda.sinMargen).toFixed(1)}% sin margen`,
)
const ahorro = cuadrosDeUnaPasada(banda)
afirmar(
  CUADROS_DE_REANUDACION < ahorro / 100,
  'el mecanismo cuesta menos del 1% de lo que ahorra en una pasada',
  `ahorra ${ahorro} cuadros, cuesta ${CUADROS_DE_REANUDACION}`,
)

cerrar('s9-visibilidad')
