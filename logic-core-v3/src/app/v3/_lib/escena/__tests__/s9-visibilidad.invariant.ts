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
 * ── ⚠️ B6-A: CUATRO opacas, TRES bandas visibles ──────────────────────────
 *
 * B6-A abrió Trabajos y el Cierre sobre la escena (`oscuro-transparente`). Las
 * cuentas de §1.2, las ventanas de §2 y la banda de §4 se reescriben contra la
 * tabla nueva —no se aflojan: se derivan de la misma tabla que antes— y el
 * control «no dice que se ve detrás de Trabajos» pasa a Servicios y a Números,
 * que siguen opacas.
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
import { CUADROS_DE_REANUDACION, MARGEN_DE_REANUDACION, escenaEnCuadro } from '../visibilidad'
import { afirmarLaMaquina } from './s9-visibilidad-maquina'
import {
  DOCUMENTO,
  VENTANA,
  cuadrosDeUnaPasada,
  enPantalla,
  imprimirCuadros,
  marcadoDelPanel,
  medirBanda,
  ventanasFundidas,
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

/**
 * §1.2 · La cuenta real. ⚠️ **B8: seis y dos.** Custodiaba «cuatro y cuatro» (B6-A). B8 abrió Quiénes somos y
 * Números por decisión del humano —«las secciones 1, 2, 3, 4, 7 y 8 ven la sala»— y las únicas opacas que quedan
 * son Servicios y Tu panel, que él pidió así. La cuenta sale de la tabla: si mañana se cierra una, esto lo dice.
 */
const transparentes = ANCLAJE.geometria.filter((g) => g.dejaVerLaEscena)
const opacas = ANCLAJE.geometria.filter((g) => !g.dejaVerLaEscena)
afirmarIgual(
  [transparentes.length, opacas.length],
  [6, 2],
  'B8: son SEIS transparentes y DOS opacas de las ocho (transparentes, opacas)',
)
console.log(`  transparentes: ${transparentes.map((g) => g.id).join(', ')}`)
console.log(`  opacas:        ${opacas.map((g) => g.id).join(', ')}`)

/**
 * De dónde salía el «cinco» de la instrucción de S9, para que la corrección no
 * se lea como un desacuerdo: **cinco era la cuenta sobre las SIETE que llevan
 * recorrido de scroll**, o sea sin el Cierre, que mide una pantalla y es donde
 * el recorrido termina. Sobre las ocho eran seis. Desde B6-A, con Trabajos
 * abierta, eran cuatro sobre las siete; desde B8 son DOS sobre las siete y dos
 * sobre las ocho: las mismas dos, Servicios y Tu panel.
 */
const conRecorrido = ANCLAJE.geometria.filter((g) => g.desdePantalla < ANCLAJE.pantallasDeScroll)
const opacasConRecorrido = conRecorrido.filter((g) => !g.dejaVerLaEscena)
afirmarIgual(
  [conRecorrido.length, opacasConRecorrido.length],
  [7, 2],
  'sobre las SIETE que llevan recorrido, DOS son opacas (con recorrido, opacas)',
)

const pantallasOpacas = opacas.reduce((n, g) => n + g.altoEnPantallas, 0)
afirmarIgual(
  [pantallasOpacas, ANCLAJE.pantallasDelDocumento],
  [5, 18],
  'pantallas de panel opaco sobre pantallas del documento — eran 16 de 18 hasta B6-A y 12 de 18 hasta B8',
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
 * El velo de B6-A no es una punción: es una clase de la hoja `velo.css` sobre
 * un panel que DECLARA dejar ver, y §1 ya afirmó que ese panel no pinta relleno.
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

/**
 * La derivación lista UNA ventana por sección transparente, en pantallas: cada panel se ve desde una pantalla
 * antes de llegar arriba hasta que se va; el Cierre ([16, 17]) cae adentro de la del diferencial ([15, 17]).
 * ⚠️ **B8: seis ventanas y DOS bandas.** Custodiaba cuatro ventanas y tres bandas (B6-A). Con Quiénes somos
 * ([0, 4]) y Números ([3, 8]) abiertas, las cuatro primeras se encadenan en una sola banda de la pantalla 0 a la
 * 11: la escena dibuja de corrido hasta que Trabajos se va. `escenaEnCuadro` pregunta por cualquiera.
 */
afirmarIgual(
  ANCLAJE.ventanasDeLaEscena,
  [
    [0, 1],
    [0, 4],
    [3, 8],
    [7, 11],
    [15, 17],
    [16, 17],
  ],
  'las ventanas salen de la derivación, no de una lista escrita a mano: una por sección transparente (B8: seis)',
)
afirmarIgual(
  ventanasFundidas(ANCLAJE.ventanasDeLaEscena),
  [
    [0, 11],
    [15, 17],
  ],
  '  y fundidas son DOS bandas: del hero a Trabajos de corrido, y el diferencial con el Cierre',
)
controlPositivo(
  'el fundido ve un solape y no cuenta dos veces la misma pantalla',
  [[0, 1], [15, 17], [16, 17]] as const,
  (v) => ventanasFundidas(v).length === v.length,
)

const M = MARGEN_DE_REANUDACION
for (const [p, esperado, porQue] of [
  [0, true, 'el primer píxel: el hero es transparente'],
  [1 - 0.001, true, 'el hero todavía entrega el cuadro'],
  [1 + M, true, 'donde B6-A cerraba la primera ventana: desde B8 Quiénes somos sigue transparente'],
  [2.5, true, 'el medio de Quiénes somos, abierta en B8'],
  [5, true, 'el medio de Números, abierta en B8 — hasta B8 era el medio de tres paneles opacos'],
  [7 - M, true, 'Trabajos asoma con la escena ya encendida: no hay margen que encender (B6-A lo encendía acá)'],
  [9, true, 'el pin de Trabajos: la sala a oscuras, sin velo (B8)'],
  [11 + M, true, 'el borde exterior del margen al salir de Trabajos'],
  [11 + M + 0.001, false, 'y un pelo más allá: Servicios tapa'],
  [13, false, 'el medio de Servicios y Tu panel — los dos paneles opacos que quedan'],
  [15 - M - 0.001, false, 'un pelo antes del margen de la segunda banda'],
  [15 - M, true, 'el margen enciende la escena antes de que el diferencial asome'],
  [16, true, 'el diferencial llena el cuadro'],
  [16.5, true, 'el Cierre asoma: sigue transparente, sin costura (B6-A)'],
  [17, true, 'el final del scroll'],
] as const) {
  afirmar(enPantalla(p) === esperado, `pantalla ${String(p).padEnd(9)} → ${esperado ? 'se ve' : 'suspendida'}`, porQue)
}

// ⚠️ B8: «detrás de Números» dejó de ser un control —Números se abrió—; los dos opacos que quedan son el control.
controlPositivo('el detector NO dice «se ve» detrás de Servicios', 12.5, enPantalla)
controlPositivo('el detector NO dice «se ve» detrás de Tu panel', 14, enPantalla)

afirmar(
  enPantalla(0.5) && enPantalla(5) && enPantalla(9) && enPantalla(16.5),
  'y SÍ ve las dos bandas transparentes donde están, de punta a punta — el detector no es un «false» constante',
)

afirmar(
  escenaEnCuadro(0, 0, 0, 0) &&
    escenaEnCuadro(0, 0, VENTANA, VENTANA) &&
    escenaEnCuadro(Number.NaN, 0, DOCUMENTO, VENTANA),
  'con la pestaña oculta, un documento que no scrollea o una medición que no es número, la escena queda ENCENDIDA',
  'el lado seguro es el comportamiento de hoy, no una pantalla apagada',
)

// ── §3 · LA MÁQUINA — vive en `s9-visibilidad-maquina.ts` desde B6-A ──────

afirmarLaMaquina()

// ── §4 · LOS CUADROS AHORRADOS ──────────────────────────────────────────────

titulo('§4 · cuántos cuadros se ahorran, y con qué supuestos')

/**
 * ⚠️ **B6-A: la banda se DERIVA, no se compara con un 70 % escrito.** Hasta
 * B6-A se afirmaba «más del 70 %» sobre una tabla con dos ventanas. Con tres
 * bandas el número baja —55,9 % con margen, 58,8 % sin margen— y lo que se
 * afirma es la cuenta que lo produce: la banda sin margen es el complemento de
 * las ventanas FUNDIDAS sobre el recorrido, y el margen cuesta exactamente un
 * `MARGEN_DE_REANUDACION` por cada borde de ventana que no sea el del
 * documento. Hasta B8, cuatro bordes: el pie del hero, los dos de Trabajos y la
 * cabeza del diferencial. ⚠️ **B8: DOS bordes** —el pie de Trabajos y la cabeza
 * del diferencial—, porque las cuatro primeras ventanas se fundieron en una.
 *
 * ⚠️ **B8 · «MÁS DE LA MITAD SIGUE SUSPENDIDO» DEJÓ DE SER CIERTO, Y NO SE ESCONDE.** Custodiaba que la banda con
 * margen pasara del 50 % (55,9 % en B6-A). Abrir Quiénes somos y Números —decisión del humano— deja suspendidas
 * sólo las pantallas de Servicios y Tu panel menos dos márgenes: 22,1 %. Lo que se afirma es la CUENTA: la banda es
 * exactamente lo que tapan las dos opacas, el margen cuesta un octavo por borde y el mecanismo sigue ahorrando más
 * de cien veces lo que cuesta. El número se publica con su derivación, no contra un umbral que la decisión dejó sin razón.
 */
const banda = medirBanda()
imprimirCuadros(banda)
const fundidas = ventanasFundidas(ANCLAJE.ventanasDeLaEscena)
const visibleEnPantallas = fundidas.reduce((n, [a, b]) => n + (b - a), 0)
const esperadoSinMargen = 1 - visibleEnPantallas / ANCLAJE.pantallasDeScroll
const bordesInteriores = fundidas.reduce((n, [a, b]) => n + (a > 0 ? 1 : 0) + (b < ANCLAJE.pantallasDeScroll ? 1 : 0), 0)
const costoEsperado = (bordesInteriores * M) / ANCLAJE.pantallasDeScroll
afirmar(
  Math.abs(banda.sinMargen - esperadoSinMargen) < 1e-9,
  `la banda sin margen es el complemento de las ventanas fundidas: ${(100 * esperadoSinMargen).toFixed(1)}% del recorrido`,
  `${visibleEnPantallas} pantallas visibles de ${ANCLAJE.pantallasDeScroll}`,
)
afirmar(
  Math.abs(banda.sinMargen - banda.conMargen - costoEsperado) < 0.002,
  `y el margen cuesta un octavo por borde interior: ${bordesInteriores} bordes → ${(100 * costoEsperado).toFixed(1)} puntos`,
  `${(100 * banda.sinMargen).toFixed(1)}% → ${(100 * banda.conMargen).toFixed(1)}%`,
)
const hueco = fundidas.length === 2 ? fundidas[1][0] - fundidas[0][1] : Number.NaN
afirmar(
  Math.abs(banda.sinMargen - hueco / ANCLAJE.pantallasDeScroll) < 1e-9 && banda.conMargen > 0 && banda.conMargen < banda.sinMargen,
  `lo suspendido es EXACTAMENTE el único hueco —de que Trabajos se va a que el diferencial asoma, ${hueco} pantallas— menos el margen: no es gratis ni es cero`,
  `${(100 * banda.conMargen).toFixed(1)}% contra ${(100 * banda.sinMargen).toFixed(1)}% sin margen — era 80,9 % con dos ventanas y 55,9 % con cuatro (B6-A)`,
)
const ahorro = cuadrosDeUnaPasada(banda)
afirmar(
  CUADROS_DE_REANUDACION < ahorro / 100,
  'el mecanismo cuesta menos del 1% de lo que ahorra en una pasada',
  `ahorra ${ahorro} cuadros, cuesta ${CUADROS_DE_REANUDACION}`,
)

cerrar('s9-visibilidad')
