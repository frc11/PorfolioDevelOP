/**
 * NOCTURNO FINAL — el invariante: npm run test:s52-nocturno-final
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por ticket:
 *   A1 · el rebobinado de UN gesto: un gesto hacia arriba al fondo rebobina la cinemática ENTERA, sola y a su velocidad
 *        (no acelerada), sin mover la página; parada, vuelve a empezar a los 2,5 s sin gestos; un gesto nuevo hacia arriba
 *        sube la página; rueda (con su inercia), dedo y teclas.
 *   A2 · los viajes del menú con la cinemática avanzada: primero se deshace con tope (la cámara baja del cenit sin saltos)
 *        y después se viaja ([PULIDO 1] P5 · ya no: en paralelo, s52-pulido-1 P5; el tope queda para salir del fondo); la cámara del final conserva el encuadre del recorrido (no se teletransporta al soltar); el
 *        viaje largo tarda más (velocidad con tope) y un cuadro largo no lo hace saltar.
 *   A3 · Portfolio desde el menú: nada de las Demos al llegar (su aparición alcanza lo pedido en un viaje).
 *   A4 · la sombra cuadrada: en un viaje la altura del sol es la de su luz (la del logo no se estira por el piso); las
 *        piezas del pie no proyectan sombra y fuera de su sección no se dibujan.
 *   A5 · teléfono: al pasar a las Demos la escena de atrás no se congela (se suspende sólo con el bloque opaco tapando).
 *   A6 · «Hablemos» del hero abre el panel de contacto (no lleva al pie).
 *   A7 · «Quiero mi…» de Servicios abre el panel de contacto con su opción marcada.
 *   B1 · el intro del logo: cae desde arriba y llega cuando termina de armarse el titular; la súper onda (la del encastre).
 *   B2 · el piso volcán: el mouse sólo levanta; destellos de lava al azar por las juntas de todo el piso; el atardecer parejo.
 *   B3 · el círculo estable: alrededor del logo, liso y quieto, sin bordes; no reacciona al mouse ni a las ondas.
 *   B4 · el polvo en el pie: en la cinemática no se posa; el que cae no atraviesa las piezas del pie (un cupo se apoya).
 *   C1 · teléfono y tablet: el texto de Trabajos se lee sobre el logo de noche (un halo: la mezcla no atraviesa el pin).
 *   C2 · Tu panel en el teléfono y la tablet: una columna, cada bloque al ancho; las demos se leen (pantalla angosta).
 * Lo que se mira en vivo: `~/.cache/b4-medicion/nocturno-final/mirar.txt`.
 */
import { readFileSync } from 'node:fs'

import * as THREE from 'three'

import { CURVA_DEL_VIAJE, DURACION_DEL_VIAJE_MS, PRELUDIO_MS, duracionDelViaje } from '../../_componentes/deslizamiento'
import { viajarSinLenis } from '../../_componentes/viajeSinLenis'
import { aimWithFraming } from '../escena/cameraFraming'
import { ANCLAS_DEL_HUECO, CALMA_EN_EL_PISO, GOLPE_EN_EL_PISO, conElFinalEnElPiso, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import { FILO } from '../escena/final/filoConPoder'
import { CAIDA_DEL_LOGO, alturaDeLaCaida } from '../escena/intro/caida'
import { SIMULACION_GLSL } from '../escena/piso/bloques'
import { ANCLAS_DEL_DIBUJO, conOndaDirigida } from '../escena/piso/ondaDirigida'
import { elevacionDe } from '../escena/lightArc'
import { ENERGIA_EN_LA_SIMULACION_GLSL } from '../escena/final/luzDeAbajo'
import { FINAL_DEL_PIE, REBOBINADO, RELOJ_DEL_FINAL, camaraDelFinal, expansionDeLaLuz, decidirElGesto, haciaCero, pasoDelReloj, relojDelQuieto, relojQuieto, subida, type EntradaDelReloj, type RelojDelFinal } from '../escena/final/recorridoDelFinal'
import { bloqueTapaElCuadro } from '../escena/nocheDisparada'
import { CAJAS_DEL_PIE_GLSL, POLVO_EN_EL_PIE } from '../escena/pie3d/cajasDelPolvo'
import { ORBIT_TARGET_Y } from '../escena/probeScene'
import { TOPE_DEL_CUADRO_DEL_VIAJE_MS } from '../escena/viaje'
import { SEPARA_LOS_GESTOS_MS, empiezaUnGesto } from '../gestosDelScroll'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { ABRE_EL_PANEL } from '../../_chrome/contacto/apertura'
import { ANCHO_CON_BARRA, DEMO_ANGOSTA, pantallaAngosta } from '../../_panel-vivo/DemoDelPanel'
import { claseEnColumna } from '../../_secciones/tu-panel/geometria'
import { INTERESES, PRECARGA_POR_SERVICIO } from '../../_chrome/contacto/contenido'
import { Hero } from '../../_secciones/hero/Hero'
import { Cierre } from '../../_secciones/cierre/Cierre'
import { WHATSAPP } from '../../_secciones/cierre/contacto'
import { marcar } from '../../_secciones/_invariantes/render'
import { seccionDe } from '../../_secciones/_contrato/forma'
import { CONTENIDO as CONTENIDO_DEL_HERO } from '../../_secciones/hero/contenido'
import { CONTENIDO as CONTENIDO_DE_QUIENES_D1 } from '../../_secciones/quienes-somos/contenido'
import { PARED_ILUMINADA, modoDelAmanecer } from '../../_secciones/por-que-develop/PorQueDevelop'
import { ALTO_DEL_CTA_EN_LISTA_SVH, ARRIBA_DEL_LOGO_EN_EL_CTA_SVH, LUGAR_DEL_CTA_SVH } from '../../_secciones/por-que-develop/geometria'
import { DOLLY_DEL_CTA, POSES_DEL_FINAL, arribaDelLogoEncuadrado } from '../escena/finalDelRecorrido'
import { CHOREO_KEYFRAMES } from '../escena/choreography'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const leerDeLaRaiz = (ruta: string): string => readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const R = RELOJ_DEL_FINAL
const DT = 1 / 60
type PasoDelReloj = (r: RelojDelFinal, e: EntradaDelReloj, dt: number) => void
// [PULIDO 1] P5 · el viaje entra con su duración (`viajeS`; 0: sin viaje), no con un sí o no.
const AL_FONDO: EntradaDelReloj = { alFondo: true, pieEntero: true, rebobinar: false, haciaAbajo: false, sinGestoS: 0, viajeS: 0 }
const entero = (paso: PasoDelReloj): RelojDelFinal => {
  const r = relojQuieto()
  for (let i = 0; i < 1200 && r.fin < 1; i += 1) paso(r, AL_FONDO, DT)
  return r
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('A1 · Rebobinado de UN gesto: entero, solo, a la velocidad de la cinemática; parado vuelve a empezar a los 2,5 s')

interface UnGesto { readonly rebobinaS: number; readonly velocidadMaxima: number; readonly fase: string; readonly paradaS: number }
/** Desde el final entero, UN gesto (un cuadro) y nada más: cuánto tarda en volver a cero, a qué velocidad, y cuánto se queda parado. */
const unGesto = (paso: PasoDelReloj): UnGesto => {
  const r = entero(paso)
  let t = 0
  paso(r, { ...AL_FONDO, rebobinar: true }, DT)
  t += DT
  let velocidadMaxima = 0
  let rebobinaS = Number.POSITIVE_INFINITY
  let antes = r.fin
  for (let i = 0; i < 1200; i += 1) {
    paso(r, { ...AL_FONDO, sinGestoS: t }, DT)
    t += DT
    velocidadMaxima = Math.max(velocidadMaxima, Math.abs(r.fin - antes) / DT)
    antes = r.fin
    if (r.fin === 0) {
      rebobinaS = t
      break
    }
  }
  const fase = r.fase
  let paradaS = 0
  for (let i = 0; i < 600 && r.fin === 0; i += 1) {
    paso(r, { ...AL_FONDO, sinGestoS: t }, DT)
    t += DT
    if (r.fin === 0) paradaS += DT
  }
  return { rebobinaS, velocidadMaxima, fase, paradaS }
}
// [PULIDO 1] P2 · la velocidad cambió por pedido (de la de la cinemática, 6,4 s, a lo avanzado por 1,6 s con curva in-out):
// lo que A1 fija sigue igual de fuerte (entero, solo, hasta parada; el reinicio a los 2,5 s) y la velocidad es la de P2 (el
// detalle, en `s52-pulido-1`): desde el final entero entre 1 y 2 s, sin pasar el pico de su curva (2/`topeS` por segundo).
const unGestoBien = (g: UnGesto): boolean => g.rebobinaS >= 1 && g.rebobinaS <= 2 && Math.abs(g.rebobinaS - REBOBINADO.topeS) < 0.1 && g.velocidadMaxima <= (2 / REBOBINADO.topeS) * 1.001 && g.fase === 'parada' && Math.abs(g.paradaS - R.vuelveAEmpezarS) < 0.05
const g1 = unGesto(pasoDelReloj)
afirmar(unGestoBien(g1), 'UN gesto hacia arriba (un solo cuadro con el pedido) rebobina la cinemática ENTERA, sola, en lo de P2 de PULIDO 1 (1,6 s desde el final entero, nunca más de 2) hasta el logo parado; parada, vuelve a empezar sola a los 2,5 s sin gestos', `rebobina en ${g1.rebobinaS.toFixed(2)} s · a lo sumo ${g1.velocidadMaxima.toFixed(4)}/s · parada ${g1.paradaS.toFixed(2)} s`)
const mientrasSiga: PasoDelReloj = (r, e, dt) => {
  if (r.fase === 'rebobina' && !e.rebobinar) r.fase = 'corre'
  pasoDelReloj(r, e, dt)
}
controlPositivo('el detector VE el de RETOQUE DEL ENCASTRE 1D (rebobina sólo mientras siga el gesto: al soltar, se vuelve a encastrar)', mientrasSiga, (p: PasoDelReloj) => unGestoBien(unGesto(p)))
const acelerado: PasoDelReloj = (r, e, dt) => {
  pasoDelReloj(r, e, dt)
  if (r.fase === 'rebobina') pasoDelReloj(r, e, dt)
}
controlPositivo('  y uno acelerado (rebobina al doble: 0,8 s)', acelerado, (p: PasoDelReloj) => unGestoBien(unGesto(p)))
const sinVolver: PasoDelReloj = (r, e, dt) => {
  pasoDelReloj(r, e, dt)
  if (r.fase === 'corre' && r.fin < 0.01 && !e.haciaAbajo) {
    r.fase = 'parada'
    r.fin = 0
    r.velocidad = 0
  }
}
controlPositivo('  y uno que se queda parado para siempre', sinVolver, (p: PasoDelReloj) => unGestoBien(unGesto(p)))

// Parada con gestos recientes no arranca; hacia abajo arranca ya (parada o rebobinando).
const parada = (): RelojDelFinal => {
  const r = entero(pasoDelReloj)
  pasoDelReloj(r, { ...AL_FONDO, rebobinar: true }, DT)
  for (let i = 0; i < 1200 && r.fin > 0; i += 1) pasoDelReloj(r, { ...AL_FONDO, sinGestoS: 99 }, DT)
  return r
}
const p1 = parada()
for (let i = 0; i < 300; i += 1) pasoDelReloj(p1, { ...AL_FONDO, sinGestoS: 0.5 }, DT)
const conGestos = p1.fin === 0 && p1.fase === 'parada'
const p2 = parada()
pasoDelReloj(p2, { ...AL_FONDO, haciaAbajo: true }, DT)
for (let i = 0; i < 10; i += 1) pasoDelReloj(p2, AL_FONDO, DT)
const r3 = entero(pasoDelReloj)
pasoDelReloj(r3, { ...AL_FONDO, rebobinar: true }, DT)
for (let i = 0; i < 60; i += 1) pasoDelReloj(r3, AL_FONDO, DT)
const enMedio = r3.fin
pasoDelReloj(r3, { ...AL_FONDO, haciaAbajo: true }, DT)
for (let i = 0; i < 60; i += 1) pasoDelReloj(r3, AL_FONDO, DT)
afirmar(conGestos && p2.fase === 'corre' && p2.fin > 0 && r3.fase === 'corre' && r3.fin > enMedio, '  parada con gestos recientes no arranca (espera 2,5 s sin gestos); un gesto hacia abajo la corre ya, parada o a mitad del rebobinado')

// Qué se retiene y qué pide rebobinar.
const enFase = (fase: RelojDelFinal['fase'], fin: number): RelojDelFinal => ({ ...relojQuieto(), fin, fase })
type Decide = typeof decidirElGesto
const decisionBien = (f: Decide): boolean => {
  const corre = enFase('corre', 1)
  const rebobinando = enFase('rebobina', 0.5)
  const nuevoCorriendo = f(corre, true, -1, true, false, 0, false)
  const tope = R.topeDelGestoS
  return nuevoCorriendo.retiene && nuevoCorriendo.rebobina && !f(enFase('corre', 0), true, -1, true, false, 0, false).retiene && !f(corre, true, 1, true, false, 0, false).retiene && !f(corre, false, -1, true, false, 0, false).retiene &&
    f(rebobinando, true, -1, false, true, tope - 0.1, false).retiene && !f(rebobinando, true, -1, false, true, tope - 0.1, false).rebobina && !f(rebobinando, true, -1, false, true, tope + 0.01, false).retiene && f(rebobinando, true, -1, false, true, tope + 2, true).retiene && !f(rebobinando, true, -1, false, false, 0.1, true).retiene &&
    !f(rebobinando, true, -1, true, false, 0, false).retiene && !f(enFase('parada', 0), true, -1, true, false, 0, false).retiene && !f(enFase('espera', 0), true, -1, true, false, 0, false).retiene
}
afirmar(decisionBien(decidirElGesto), '  se retiene el gesto que EMPIEZA hacia arriba al fondo mientras corre o ya terminó (pide el rebobinado) y lo que sigue de ese gesto: durante su tope, y después sólo su cola (la inercia que se apaga; el que sigue girando la rueda, sube); un gesto nuevo rebobinando, parada o esperando al pie sube la página; hacia abajo y fuera del fondo, nunca', `tope ${String(R.topeDelGestoS)} s · cola: a lo sumo ${String(R.colaDelGesto)} del evento más fuerte`)
controlPositivo('  el detector VE una retención de todo lo que sube al fondo mientras no está en cero (el visitante quedaría atrapado)', ((r: RelojDelFinal, alFondo: boolean, sentido: -1 | 1) => (alFondo && sentido < 0 && r.fin > 0 ? { retiene: true, rebobina: true } : { retiene: false, rebobina: false })) as Decide, decisionBien)
controlPositivo('  y una sin cola (la inercia de un trackpad, pasado el tope, subiría la página a mitad del rebobinado)', ((r: RelojDelFinal, alFondo: boolean, sentido: -1 | 1, nuevo: boolean, retenido: boolean, duraS: number) => decidirElGesto(r, alFondo, sentido, nuevo, retenido, duraS, false)) as Decide, decisionBien)

// UN gesto: la rueda hasta un silencio (el trackpad y su inercia son uno), un dedo, una tecla (su repetición no).
type Empieza = typeof empiezaUnGesto
const segmentaBien = (f: Empieza): boolean => {
  const rueda = { origen: 'rueda', sentido: -1, t: 1000 }
  const inercia = [16, 33, 60, 120, SEPARA_LOS_GESTOS_MS - 1].every((d) => !f(rueda, 'rueda', -1, 1000 + d, false))
  return f(null, 'rueda', -1, 0, false) && inercia && f(rueda, 'rueda', -1, 1000 + SEPARA_LOS_GESTOS_MS + 1, false) && f(rueda, 'rueda', 1, 1010, false) && f(rueda, 'tecla', -1, 1010, true) &&
    !f({ origen: 'tecla', sentido: -1, t: 1000 }, 'tecla', -1, 1500, false) && f({ origen: 'tecla', sentido: -1, t: 1000 }, 'tecla', -1, 1050, true) && f({ origen: 'dedo', sentido: -1, t: 1000 }, 'dedo', -1, 1010, true) && !f({ origen: 'dedo', sentido: -1, t: 1000 }, 'dedo', -1, 1400, false)
}
afirmar(segmentaBien(empiezaUnGesto), '  UN gesto: la rueda hasta un silencio de 200 ms (la inercia del trackpad sigue siendo el mismo gesto), cada dedo que se apoya, cada tecla apretada (su repetición no) y cualquier cambio de sentido u origen', `${String(SEPARA_LOS_GESTOS_MS)} ms`)
controlPositivo('  el detector VE una rueda en la que cada evento es un gesto nuevo (la inercia subiría la página)', (() => true) as Empieza, segmentaBien)

// El cableado: el módulo de gestos marca `nuevo`; el final decide con eso y no cuenta el temblor hacia abajo.
const gestos = sinComentarios(leer('_lib/gestosDelScroll.ts'))
const cuadro = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
const cableadoA1 = (g: string, c: string): boolean =>
  g.includes("const g: GestoDeScroll = { sentido, origen, nuevo: empiezaUnGesto(ultimo, origen, sentido, t, apoyo), magnitud }") && g.includes("decidir(sentido, 'tecla', e.timeStamp, !e.repeat, 0)") && g.includes("decidir(sentido, 'dedo', e.timeStamp, apoyo, magnitud)") && g.includes("decidir(sentido, 'rueda', e.timeStamp, false, Math.abs(e.deltaY))") &&
  /if \(g\.nuevo\) \{\s*G\.desde = ahora\s*G\.pico = 0\s*\}/.test(c) && c.includes('const enLaCola = g.magnitud > 0 && g.magnitud <= RELOJ_DEL_FINAL.colaDelGesto * G.pico') && c.includes('const d = decidirElGesto(s.reloj, alFondo, g.sentido, g.nuevo, G.retenido, ahora - G.desde, enLaCola)') && c.includes('if (d.rebobina) G.rebobinar = true') &&
  c.includes('else if (ahora - G.arriba > RELOJ_DEL_FINAL.cambioDeSentidoS) G.abajo = ahora') && c.includes('const rebobinar = s.gestos.rebobinar') && c.includes('s.gestos.rebobinar = false')
afirmar(cableadoA1(gestos, cuadro), '  el cableado: los gestos marcan si empiezan (la tecla, sin su repetición; el dedo, al apoyarse); el final retiene y pide el rebobinado con eso, y un gesto hacia abajo pegado a uno hacia arriba (el temblor de un dedo al levantarse) no la vuelve a correr')
controlPositivo('  el detector VE el temblor hacia abajo contado', [gestos, cuadro.replace('else if (ahora - G.arriba > RELOJ_DEL_FINAL.cambioDeSentidoS) G.abajo = ahora', 'else G.abajo = ahora')] as const, ([g, c]: readonly [string, string]) => cableadoA1(g, c))

// ═══════════════════════════════════════════════════════════════════════════
titulo('A2 · Viajes con la cinemática avanzada: se deshace con tope y después se viaja ([PULIDO 1] P5: en paralelo); sin saltos de cámara; velocidad con tope')

interface Salida { readonly s: number; readonly camaraPorCuadro: number; readonly finPorCuadro: number }
/**
 * Desde el final entero, salir del fondo (la página subió): cuánto tarda en volver a cero y lo más que se mueve la cámara (su
 * subida) en un cuadro. [PULIDO 1] P5 · cambió por pedido: medía con un viaje del menú, que ahora vuelve en paralelo con el
 * recorrido (lo fija s52-pulido-1 P5); salir del fondo pasa por el mismo código de antes y queda con el mismo tope.
 */
const salida = (paso: PasoDelReloj): Salida => {
  const r = entero(paso)
  let camaraPorCuadro = 0
  let finPorCuadro = 0
  for (let i = 1; i <= 600; i += 1) {
    const [antes, k] = [r.fin, subida(r.fin)]
    paso(r, { ...AL_FONDO, alFondo: false }, DT)
    camaraPorCuadro = Math.max(camaraPorCuadro, Math.abs(subida(r.fin) - k))
    finPorCuadro = Math.max(finPorCuadro, Math.abs(r.fin - antes))
    if (r.fin === 0) return { s: i * DT, camaraPorCuadro, finPorCuadro }
  }
  return { s: Number.POSITIVE_INFINITY, camaraPorCuadro, finPorCuadro }
}
const salidaBien = (x: Salida): boolean => x.s < 3 && x.camaraPorCuadro <= (1.25 * DT) / R.salida.camaraS && x.finPorCuadro <= (1.05 * DT) / R.salida.finS
const sa = salida(pasoDelReloj)
afirmar(salidaBien(sa), 'salir del fondo (y antes, un viaje del menú: [PULIDO 1] P5) deshace la cinemática con tope: la cámara (su subida) a lo sumo de punta a punta en 1,2 s, `fin` en 1,2 s; vuelve a cero en menos de 3 s, sin saltos', `${sa.s.toFixed(2)} s · cámara ${(sa.camaraPorCuadro * 60).toFixed(2)}/s como mucho`)
const comoAntes: PasoDelReloj = (r, e, dt) => {
  pasoDelReloj(r, e, dt)
  if (!e.alFondo && r.fin > 0) r.fin = Math.max(0, r.fin - dt / 0.35)
}
controlPositivo('el detector VE la vuelta de antes (0,35 s: la cámara bajaba del cenit 10 u por cuadro)', comoAntes, (p: PasoDelReloj) => salidaBien(salida(p)))

// El giro y el alejamiento del quieto vuelven con tope, sin pasarse, en un tiempo finito.
const vuelta = (paso: typeof haciaCero, desde: number, maxima: number, freno: number): { readonly s: number; readonly maxima: number; readonly cruzo: boolean } => {
  let [x, v, mayor, cruzo] = [desde, 0, 0, false]
  for (let i = 1; i <= 600; i += 1) {
    const r = paso(x, v, maxima, freno, DT)
    if (Math.sign(r.x) === -Math.sign(desde)) cruzo = true
    ;[x, v] = [r.x, r.v]
    mayor = Math.max(mayor, Math.abs(v))
    if (x === 0) return { s: i * DT, maxima: mayor, cruzo }
  }
  return { s: Number.POSITIVE_INFINITY, maxima: mayor, cruzo }
}
const Q = FINAL_DEL_PIE.quieto.vuelta
const vueltaBien = (f: typeof haciaCero): boolean => {
  const giro = vuelta(f, -180, Q.giroS, Q.giroFreno)
  const aleja = vuelta(f, FINAL_DEL_PIE.quieto.alejaHasta, Q.alejaS, Q.alejaFreno)
  return giro.s < 3 && giro.maxima <= Q.giroS + 1e-9 && !giro.cruzo && aleja.s < 3 && aleja.maxima <= Q.alejaS + 1e-9 && !aleja.cruzo
}
afirmar(vueltaBien(haciaCero), '  el giro del quieto (aun media vuelta) y su alejamiento vuelven a cero con tope (90°/s, 9 u/s) y frenando, sin pasarse, en menos de 3 s (antes: 400°/s al arrancar y una cola de segundos)')
const exponencial: typeof haciaCero = (x, _v, _m, _f, dt) => {
  const nx = Math.abs(x * Math.exp(-dt / 0.45)) < 1e-3 ? 0 : x * Math.exp(-dt / 0.45)
  return { x: nx, v: (nx - x) / dt }
}
controlPositivo('  el detector VE la exponencial de antes', exponencial, vueltaBien)
const q = { giro: 170, aleja: 6, giroV: 4.5, alejaV: 0.1 }
for (let i = 0; i < 240; i += 1) relojDelQuieto(0, false, 0, DT, q)
afirmar(q.giro === 0 && q.aleja === 0 && q.giroV === 0, '  y el reloj del quieto la usa (desde 170° y 6 u, en 4 s: cero)')

// La cámara del final con el ENCUADRE del recorrido: con `k` 0 y el giro que vuelve, la del rig (no la centrada en el logo).
const delRig = (): THREE.PerspectiveCamera => {
  const c = new THREE.PerspectiveCamera(35, 1440 / 900, 0.1, 400)
  c.position.set(Math.sin(2.88) * 17.9, 8.2, Math.cos(2.88) * 17.9)
  c.lookAt(0, ORBIT_TARGET_Y, 0)
  aimWithFraming(c, 1440 / 900, 6.86, 4.78, Math.hypot(17.9, 8.2 - ORBIT_TARGET_Y), -0.494, 0)
  c.updateMatrixWorld()
  return c
}
const blanco = new THREE.Vector3(0, -4, 0)
type CamaraDelFinal = typeof camaraDelFinal
const angulo = (a: THREE.Camera, b: THREE.Camera): number => THREE.MathUtils.radToDeg(a.quaternion.angleTo(b.quaternion))
const encuadreBien = (f: CamaraDelFinal): boolean => {
  const rig = delRig()
  const casiSinGiro = delRig()
  f(casiSinGiro, 0, blanco, 1e-4, 0, null)
  // La subida, en 200 pasos, desde la del rig: sin saltos.
  let peor = 0
  let antes = delRig()
  for (let i = 1; i <= 200; i += 1) {
    const c = delRig()
    f(c, i / 200, blanco, 0, 0, null)
    peor = Math.max(peor, angulo(c, antes))
    antes = c
  }
  const arriba = delRig()
  f(arriba, 1, blanco, 0, 0, null)
  const alBlanco = blanco.clone().sub(arriba.position).normalize().dot(arriba.getWorldDirection(new THREE.Vector3()))
  return angulo(casiSinGiro, rig) < 0.01 && peor < 2 && alBlanco > 0.9999
}
afirmar(encuadreBien(camaraDelFinal), '  la cámara del final conserva el ENCUADRE del recorrido: con el giro del quieto volviendo es la del rig (no la centrada en el logo, que saltaba 8° al soltarse); arriba, centrada en el logo; la subida sin saltos')
const centrada: CamaraDelFinal = (c, k, b, giro, aleja, sacudon) => {
  camaraDelFinal(c, k, b, giro, aleja, sacudon)
  if (k <= 0 && giro === 0 && aleja === 0) return
  c.lookAt(new THREE.Vector3(0, ORBIT_TARGET_Y, 0).lerp(b, k))
  c.updateMatrixWorld()
}
controlPositivo('  el detector VE la cámara de antes (mira al centro de la órbita y tira el encuadre)', centrada, encuadreBien)

// [PULIDO 1] P5 · cambió por pedido: el viaje ya NO espera a la escena (esperaba a que el final volviera, hasta 2,2 s, y desde
// el pie quedaba lento). El final vuelve en paralelo con el recorrido, adentro de la misma duración (lo detalla s52-pulido-1
// P5). Lo que se fija acá: el efecto no mira el estado del final; el reloj de seguridad cubre el preludio, el recorrido y el
// margen; y la escena recibe cuánto dura el viaje.
const efecto = sinComentarios(leer('_componentes/useDeslizamientoDelCta.ts'))
const sinEsperaBien = (ef: string): boolean =>
  !/FINAL_EN_REPOSO|ESPERA_MAXIMA_DEL_FINAL_MS|window\.setTimeout\(arrancar, 50\)/.test(ef) && ef.includes('empezarElViaje({ ...planDelViaje(seccion.id, destinoEnPx), duracionMs: PRELUDIO_MS + duracionMs })') &&
  ef.includes('const relojDeSeguridadMs = (duracionMs: number): number => PRELUDIO_MS + duracionMs + MARGEN_DEL_RELOJ_MS') && !/FINAL_EN_REPOSO/.test(cuadro)
afirmar(sinEsperaBien(efecto), '  el viaje desde el pie con la cinemática avanzada NO espera a la escena ([PULIDO 1] P5): sale como cualquiera, y la escena sabe cuánto dura para deshacerla adentro')
controlPositivo('  el detector VE la espera de A2 (no mover el scroll hasta el final en reposo)', efecto.replace('if (lenis === null) {', 'if (!FINAL_EN_REPOSO.valor) { relojDeArranque = window.setTimeout(arrancar, 50); return } if (lenis === null) {'), sinEsperaBien)

// [PULIDO 2] 2 · la velocidad con tope de A2 (a lo sumo 4,5 pantallas por segundo, hasta 7 s: «Inicio → Por qué develOP» en
// 7,7 s, medido) se reemplazó por pedido: la duración es función de la distancia (en pantallas de la escena) con saturación.
// Del click a la llegada: una pantalla o menos, 1,2 s; crece con la distancia, cada vez menos (cóncava); ninguna pasa 2,5 s;
// la más larga del sitio (≈ 34,5 pantallas: «Inicio» desde el pie) entre 2,2 y 2,5 s; desde el encastre, la misma (la
// duración no mira el final: sale de la distancia).
const totalDe = (f: typeof duracionDelViaje, pantallas: number): number => f(pantallas) + PRELUDIO_MS
const duracionBien = (f: typeof duracionDelViaje): boolean => {
  const distancias = Array.from({ length: 80 }, (_, i) => i * 0.5)
  const totales = distancias.map((d) => totalDe(f, d))
  const monotona = totales.every((t, i) => i === 0 || t >= totales[i - 1] - 1e-9)
  const concava = totales.every((t, i) => i < 2 || distancias[i - 2] < 1 || t - totales[i - 1] <= totales[i - 1] - totales[i - 2] + 1e-9)
  return monotona && concava && Math.abs(totalDe(f, 1) - 1200) < 1 && Math.abs(totalDe(f, 0.3) - 1200) < 1 && totalDe(f, -3) === totalDe(f, 3) &&
    totalDe(f, 3) <= 1350 && totales.every((t) => t <= 2500 + 1e-9) && totalDe(f, 34.5) >= 2200 && totalDe(f, 34.5) <= 2500 && totalDe(f, 200) <= 2500
}
afirmar(duracionBien(duracionDelViaje), 'la duración de un viaje es función de la distancia con saturación: las vecinas en ~1,2 s, creciendo cada vez menos, ninguna más de 2,5 s', `1 pantalla: ${String(Math.round(totalDe(duracionDelViaje, 1)))} ms · 8: ${String(Math.round(totalDe(duracionDelViaje, 8)))} ms · 34,5 («Inicio» desde el pie a 1440): ${String(Math.round(totalDe(duracionDelViaje, 34.5)))} ms`)
controlPositivo('  el detector VE la velocidad con tope de A2 (4,5 pantallas por segundo, hasta 7 s)', ((p: number) => Math.min(7000, Math.max(2600, (Math.abs(p) / 4.5) * 1000))) as typeof duracionDelViaje, duracionBien)
controlPositivo('  y la duración fija de antes de A2 (2,6 s para todo)', (() => DURACION_DEL_VIAJE_MS + 400) as typeof duracionDelViaje, duracionBien)

// Un cuadro largo no hace saltar el viaje: el reloj avanza a lo sumo `TOPE_DEL_CUADRO_DEL_VIAJE_MS` por cuadro.
/** El paso de scroll más grande de un cuadro normal y el del cuadro largo (un tirón de 120 ms a mitad de camino). */
function conUnTiron(viajar: typeof viajarSinLenis): { readonly normal: number; readonly tiron: number } {
  const cola: FrameRequestCallback[] = []
  let reloj = 0
  let termino = false
  const ventana = { scrollY: 0, scrollTo: (_x: number, y: number) => { ventana.scrollY = y } }
  const antes = { window: globalThis.window, raf: globalThis.requestAnimationFrame, caf: globalThis.cancelAnimationFrame, now: performance.now }
  Object.assign(globalThis, { window: ventana, requestAnimationFrame: (f: FrameRequestCallback) => cola.push(f), cancelAnimationFrame: () => undefined })
  Object.defineProperty(performance, 'now', { value: () => reloj, configurable: true })
  let [normal, tiron] = [0, 0]
  try {
    viajar(30_000, 7000, CURVA_DEL_VIAJE, () => { termino = true })
    for (let i = 0; i < 2000 && !termino; i += 1) {
      const largo = i === 200
      reloj += largo ? 120 : 1000 / 60
      const y0 = ventana.scrollY
      cola.splice(0).forEach((f) => f(reloj))
      const paso = Math.abs(ventana.scrollY - y0)
      if (largo) tiron = paso
      else normal = Math.max(normal, paso)
    }
  } finally {
    Object.assign(globalThis, { window: antes.window, requestAnimationFrame: antes.raf, cancelAnimationFrame: antes.caf })
    Object.defineProperty(performance, 'now', { value: antes.now, configurable: true })
  }
  return { normal, tiron }
}
const tironBien = (f: typeof viajarSinLenis): boolean => {
  const { normal, tiron } = conUnTiron(f)
  return normal > 0 && tiron <= normal * (TOPE_DEL_CUADRO_DEL_VIAJE_MS / (1000 / 60)) * 1.02
}
const tir = conUnTiron(viajarSinLenis)
afirmar(tironBien(viajarSinLenis), 'un cuadro largo (un tirón de 120 ms a mitad de camino) no hace saltar el viaje: avanza a lo sumo lo de 34 ms (dos cuadros), no los 120', `cuadro normal ${tir.normal.toFixed(0)} px · el del tirón ${tir.tiron.toFixed(0)} px`)
const deParedSinTope: typeof viajarSinLenis = (destino, duracionMs, curva, alTerminar) => {
  const salidaY = window.scrollY
  const arranque = performance.now()
  let vivo = true
  const c = (): void => {
    if (!vivo) return
    const t = Math.min(1, (performance.now() - arranque) / duracionMs)
    window.scrollTo(0, salidaY + (destino - salidaY) * curva(t))
    if (t < 1) requestAnimationFrame(c)
    else {
      vivo = false
      alTerminar()
    }
  }
  requestAnimationFrame(c)
  return () => {
    vivo = false
  }
}
controlPositivo('  el detector VE el reloj de pared sin tope (el tirón saltaba 800 px de página y 17° de cámara)', deParedSinTope, tironBien)
// Y lo mismo con Lenis (su reloj, en el viaje) y en la inercia de la cámara.
// [PULIDO 2] 2 · Lenis lee el reloj del viaje (`relojDelCuadro`, el mismo que el final y el motor sin Lenis), que es el de
// pared con este tope por cuadro en un viaje (lo retenido se devuelve después, a lo sumo el tope por cuadro).
const scrollSuave = sinComentarios(leer('_componentes/ScrollSuaveDeV3.tsx'))
const relojDelViaje = sinComentarios(leer('_lib/escena/viaje.ts'))
const rig = sinComentarios(leer('_lib/escena/OrbitRig.tsx'))
const topesBien = (ss: string, rg: string): boolean =>
  ss.includes('lenis.raf(relojDelCuadro(tiempo))') && relojDelViaje.includes('const paso = actual === null && RELOJ.motores === 0 ? debe : Math.min(debe, TOPE_DEL_CUADRO_DEL_VIAJE_MS)') &&
  rg.includes('const pasoDeLaInercia = Math.min(delta, TOPE_DEL_CUADRO_DEL_VIAJE_MS / 1000)') && /SETTLE_EPSILON\[channel\],\s*pasoDeLaInercia/.test(rg)
afirmar(topesBien(scrollSuave, rig), '  con Lenis, su reloj en un viaje avanza con el mismo tope; y la inercia de la cámara también (con 100 ms de delta recuperaba de golpe lo que venía atrás)')
controlPositivo('  el detector VE a Lenis con el reloj de pared', [scrollSuave.replace('lenis.raf(relojDelCuadro(tiempo))', 'lenis.raf(tiempo)'), rig] as const, ([ss, rg]: readonly [string, string]) => topesBien(ss, rg))

// ═══════════════════════════════════════════════════════════════════════════
titulo('A3 · Portfolio desde el menú: nada de las Demos al llegar (su aparición no persigue al scroll en un viaje)')

// La aparición de las Demos persigue al scroll con un tope (1,8 s de punta a punta): en un viaje que las cruza, al llegar a
// Portfolio seguían a medio irse y su título 3D entraba y salía apenas terminaba el viaje. En un viaje, lo mostrado ES lo
// pedido (el `<main>` está apagado: no hay nada que ver de la persecución).
const capaDeDemos = sinComentarios(leer('_secciones/trabajos/demos/CapaDeDemos.tsx'))
const demosSinPersecucion = (c: string): boolean => /p\.pedida = aparicionPedida\(valor, rigida\.current\)\s*if \(viajeEnCurso\(\) !== null\) \{\s*alcanzar\(p\)\s*llegar\(p\.mostrada\)\s*return\s*\}\s*perseguir\(p, llegar\)/.test(c)
afirmar(demosSinPersecucion(capaDeDemos), 'en un viaje del menú la aparición de las Demos alcanza lo pedido en el acto (al llegar a Portfolio está en cero: su título, su párrafo y sus libros no entran ni salen)')
controlPositivo('el detector VE la persecución de siempre en un viaje', capaDeDemos.replace(/if \(viajeEnCurso\(\) !== null\) \{\s*alcanzar\(p\)\s*llegar\(p\.mostrada\)\s*return\s*\}/, ''), demosSinPersecucion)
// Y los títulos de volumen, en un viaje, desarmados (la regla de 3D Y SONIDO T1, que esto completa).
const titulos = sinComentarios(leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx'))
afirmar(titulos.includes('a.mostrado.llegada = mostradoDelScroll(a.mostrado.llegada, enViaje ? 0 : a.titulo.llegada, asentar, dt, enViaje ? null : a.titulo.minimoS, a.titulo.asiento)'), '  y en un viaje los títulos de volumen van desarmados, sin mínimo: al terminar llegan desde lo que pide el scroll del destino')

// ═══════════════════════════════════════════════════════════════════════════
titulo('A4 · La sombra cuadrada: en un viaje la altura del sol es la de su luz; las piezas del pie no proyectan sombra')

// La «sombra cuadrada» que aparecía usando el menú era la del LOGO, estirada por todo el piso: en un viaje de día la luz
// tiene la fuerza del día (`viaje.ts`), pero la altura del sol seguía al arco del recorrido (en la noche de Trabajos, 3°):
// una sombra de 17 veces su alto. En un viaje, la altura es la que le corresponde a su nivel (`elevacionDe`).
const orbit = sinComentarios(leer('_lib/escena/OrbitRig.tsx'))
// (Después del nivel con la interfaz y del atardecer del final, B2: la altura es la del nivel que queda.)
const alturaDelViaje = (c: string): boolean => {
  const linea = c.indexOf('if (viajeEnCurso() !== null) arc.elevationDeg = elevacionDe(arc.level)')
  // [PULIDO 1] P1 · el atardecer del final ya no toca el nivel del rig (oscurece el piso): la altura va después del último
  // ajuste del nivel que queda (la interfaz), y ninguno la sigue.
  const ultimoNivel = Math.max(c.lastIndexOf('arc.level = nivelConLaInterfaz(arc.level, Math.min(delta, 0.1))'), c.lastIndexOf('arc.level *= '))
  return linea > 0 && linea > ultimoNivel && c.indexOf('arc.level = nivelConLaInterfaz(arc.level, Math.min(delta, 0.1))') > 0
}
const largoDeLaSombra = (grados: number): number => 1 / Math.tan(THREE.MathUtils.degToRad(grados))
afirmar(alturaDelViaje(orbit) && elevacionDe(1) === 36 && largoDeLaSombra(elevacionDe(1)) < 1.4 && largoDeLaSombra(elevacionDe(0.1)) > 15, 'en un viaje del menú la altura del sol es la de su nivel (de día, 36°: la sombra del logo mide 1,4 veces su alto), no la del recorrido (en la noche de Trabajos, 3°: 17 veces, por todo el piso)', `de día ${largoDeLaSombra(elevacionDe(1)).toFixed(2)}× · con la del recorrido ${largoDeLaSombra(elevacionDe(0.1)).toFixed(1)}×`)
controlPositivo('el detector VE la altura del recorrido en un viaje', orbit.replace('if (viajeEnCurso() !== null) arc.elevationDeg = elevacionDe(arc.level)', ''), alturaDelViaje)
// Las piezas del pie no proyectan sombra sobre la escena (sus sombras de contacto en el piso vivo, apagadas).
const armadasDelPie = sinComentarios(leer('_lib/escena/pie3d/armadas.ts'))
const sinSombrasDelPie = (c: string): boolean => c.includes('SOMBRAS_DEL_PIE.uCuantasSombrasDelPie.value = 0') && !c.includes('sombraDe(') && !c.includes('uSombrasDelPie.value[')
afirmar(sinSombrasDelPie(armadasDelPie), '  las placas y piezas del pie no proyectan sombra sobre la escena (ninguna sombra de contacto en el piso vivo); fuera de su sección no se dibujan (ya: sólo con su caja a la vista)')
controlPositivo('  el detector VE las sombras de contacto de antes', armadasDelPie.replace('SOMBRAS_DEL_PIE.uCuantasSombrasDelPie.value = 0', 'if (sombras < MAXIMO_DE_SOMBRAS_DEL_PIE) sombras = sombraDe(a, sombras)'), sinSombrasDelPie)
afirmar(/a\.grupo\.visible = arriba \+ c\.abajo > -MARGEN && arriba \+ c\.arriba < cuadro\.alto \+ MARGEN/.test(armadasDelPie), '  y una pieza del pie se dibuja sólo con su caja del DOM a la vista (con el margen)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('A5 · Teléfono: al pasar a las Demos la escena de atrás no se congela')

// Abajo de 1024 las ventanas de la escena (en pantallas del escritorio) daban por tapada la sala en las Demos, que en el
// teléfono la dejan ver: la escena se suspendía y quedaba su último cuadro, congelado. Ahí se dibuja salvo que el bloque
// opaco (Servicios y Tu panel, seguidos) tape el cuadro entero.
const atadura = sinComentarios(leer('_lib/escena/ataduraAlScroll.ts'))
const enElTelefono = (c: string): boolean => c.includes('const elBloque = medirElBloqueOpacoEn(document, ventana, bloque)') && /escenaEnCuadro\(\s*medida\.y,\s*secciones\.arriba,\s*medida\.abajo,\s*ventana,\s*\) \|\|\s*\(window\.innerWidth < 1024 && elBloque !== null && !bloqueTapaElCuadro\(elBloque\)\)/.test(c)
const caja = (tope: number, pie: number): { tope: number; pie: number } => ({ tope, pie })
const tapa = bloqueTapaElCuadro({ servicios: caja(-400, 2000), tuPanel: caja(2000, 5000), alto: 844 }) && bloqueTapaElCuadro({ servicios: caja(-3000, -10), tuPanel: caja(-10, 900), alto: 844 })
const enLasDemos = !bloqueTapaElCuadro({ servicios: caja(500, 3000), tuPanel: caja(3000, 6000), alto: 844 }) && !bloqueTapaElCuadro({ servicios: caja(-6000, -3000), tuPanel: caja(-3000, 300), alto: 844 })
afirmar(enElTelefono(atadura) && tapa && enLasDemos, 'abajo de 1024 la escena se dibuja mientras se vea algo de la sala (en las Demos, translúcidas, ya no se congela) y se suspende sólo con Servicios y Tu panel tapando el cuadro entero')
controlPositivo('el detector VE la regla de antes (sólo las ventanas del escritorio)', atadura.replace(/ \|\|\s*\(window\.innerWidth < 1024 && elBloque !== null && !bloqueTapaElCuadro\(elBloque\)\)/, ''), enElTelefono)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A6 · «Hablemos» del hero abre el panel de contacto (no lleva al pie)')

// El chrome atiende los `[data-abre-contacto]` en la captura, antes que el viaje: los de `panel` abren la hoja
// (`_chrome/contacto/apertura.ts`). «Hablemos» lo lleva; su `href` (`#contacto`) queda para cuando no hay JavaScript.
const heroHtml = marcar(<Hero seccion={seccionDe('hero')} />, { anima: false })
const hablemos = (h: string): boolean => new RegExp(`<a href="#contacto"[^>]*data-abre-contacto="${ABRE_EL_PANEL}"[^>]*>`).test(h) && (h.match(/data-abre-contacto=/g) ?? []).length === 1
afirmar(hablemos(heroHtml) && CONTENIDO_DEL_HERO.ctaContacto.abre === ABRE_EL_PANEL, '«Hablemos» abre el PANEL de contacto, como el Contacto de la barra (y sólo él: «Mirá los trabajos» sigue viajando)')
controlPositivo('el detector VE el «Hablemos» que viajaba al pie', heroHtml.replace(` data-abre-contacto="${ABRE_EL_PANEL}"`, ''), hablemos)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A7 · «Quiero mi…» de Servicios abre el panel de contacto con su opción marcada')

// Los dos CTA de Servicios (el que rota, desde 1024, y el de cada servicio, en la rama apilada) abren la HOJA con la
// precarga de su servicio en «¿Qué querés hacer?» (antes viajaban al formulario del pie, sin marcar nada).
const ctasDeServicios = ['_secciones/servicios/CtaDelServicio.tsx', '_secciones/servicios/CtaQueRota.tsx'].map((r) => sinComentarios(leer(r)))
const abrenElPanel = (fs: readonly string[]): boolean => fs.every((f) => f.includes(`data-abre-contacto="${ABRE_EL_PANEL}"`) && /data-precarga=\{/.test(f))
const mapeo = PRECARGA_POR_SERVICIO.web.join() === 'web' && PRECARGA_POR_SERVICIO.software.join() === 'software' && PRECARGA_POR_SERVICIO['ia-automatizacion'].join() === 'chatbot,automatizaciones'
const rotulo = (id: string): string => INTERESES.find((i) => i.id === id)?.rotulo ?? '?'
afirmar(abrenElPanel(ctasDeServicios) && mapeo, 'los «Quiero mi…» abren el panel con su opción marcada: web → «Una página web», software → «Software a medida», IA → «Un chatbot con IA» y «Automatizaciones»', [rotulo('web'), rotulo('software'), rotulo('chatbot'), rotulo('automatizaciones')].join(' · '))
controlPositivo('el detector VE los CTA que viajaban al pie', ctasDeServicios.map((f) => f.replace(`data-abre-contacto="${ABRE_EL_PANEL}"`, 'data-abre-contacto=""')), abrenElPanel)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B1 · El intro del logo: cae desde arriba y llega cuando termina de armarse el titular; la súper onda')

// La caída: [PULIDO 1] P6 la cambió por pedido (antes esperaba arriba el 40 % y caía con gravedad): ahora baja a velocidad
// constante en el tramo del titular. Lo que B1 fija sigue igual de fuerte (llega con el titular, con su misma duración; arranca
// con la carga abierta y sólo si la página cargó arriba; la súper onda al llegar; sin montar con movimiento reducido) y lo de
// la curva es más estricto (lineal: todos los pasos iguales). El detalle de P6 (que sigue al titular en volumen), en s52-pulido-1.
const heroFuente = leer('_secciones/hero/Hero.tsx')
const titularFuente = leer('_lib/titulos3d/titular.ts')
const delTitular = Number(/export const LLEGADA_DEL_TITULAR_S = ([0-9.]+)/.exec(titularFuente)?.[1] ?? Number.NaN)
const delMismoReloj = /import \{ LLEGADA_DEL_TITULAR_S \} from '\.\.\/\.\.\/_lib\/titulos3d\/titular'/.test(heroFuente) && !/const LLEGADA_DEL_TITULAR_S =/.test(heroFuente) && (heroFuente.match(/minimoS: LLEGADA_DEL_TITULAR_S/g) ?? []).length === 2
const caidaBien = (h: typeof alturaDeLaCaida): boolean => {
  const muestras = Array.from({ length: 201 }, (_, i) => h(i / 200))
  const pasos = muestras.slice(1).map((y, i) => muestras[i] - y)
  const lineal = pasos.every((d) => Math.abs(d - pasos[0]) < 1e-9 && d > 0)
  return h(0) === CAIDA_DEL_LOGO.alto && h(1) === 0 && h(0.999) > 0 && lineal
}
afirmar(caidaBien(alturaDeLaCaida) && CAIDA_DEL_LOGO.duracionS === delTitular && delMismoReloj, 'el logo baja a velocidad constante y llega a su lugar justo cuando termina de armarse el titular (la misma constante, importada por el hero y por la escena: no hay una copia)', `${String(CAIDA_DEL_LOGO.duracionS)} s · desde ${String(CAIDA_DEL_LOGO.alto)} u`)
controlPositivo('el detector VE una caída que llega antes que el titular', ((u: number) => alturaDeLaCaida(Math.min(1, u * 1.3))) as typeof alturaDeLaCaida, caidaBien)
controlPositivo('  y la de NOCTURNO FINAL B1 (espera arriba el 40 % y cae con gravedad)', ((u: number) => (u <= 0.4 ? CAIDA_DEL_LOGO.alto : u >= 1 ? 0 : CAIDA_DEL_LOGO.alto * (1 - ((u - 0.4) / 0.6) ** 2))) as typeof alturaDeLaCaida, caidaBien)
const caidaTsx = sinComentarios(leer('_lib/escena/intro/CaidaDelLogo.tsx'))
const escenario = sinComentarios(leer('_lib/escena/ProbeStage.tsx'))
const montada = (c: string, e: string): boolean => c.includes('FUENTE.cargaLista = cargaLista()') && c.includes('const dt = Math.min(Math.max(delta, 0), 0.1)') && c.includes('pasoDeLaBajada(s, FUENTE, dt)') && c.includes('FINAL_EN_EL_PISO.uGolpe.value.set(VIVO.uTiempo.value, logo.position.x, logo.position.z, 1)') && c.includes('window.scrollY >= window.innerHeight * CAIDA_DEL_LOGO.arriba') && e.includes('{!reducedMotion && <CaidaDelLogo logoGroupRef={logoGroupRef} />}')
afirmar(montada(caidaTsx, escenario), '  arranca con la carga abierta, sólo si la página cargó arriba (si no, el logo ya está en su lugar), al llegar hace la súper onda desde el logo, y con movimiento reducido no se monta (ni caída ni onda)')
controlPositivo('  el detector VE una caída con movimiento reducido', [caidaTsx, escenario.replace('{!reducedMotion && <CaidaDelLogo logoGroupRef={logoGroupRef} />}', '<CaidaDelLogo logoGroupRef={logoGroupRef} />')] as const, ([c, e]: readonly [string, string]) => montada(c, e))
// La súper onda: la del golpe (la misma del encastre), mucho más grande que antes y dibujada más alta que el tope de siempre.
const sim = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
const G = GOLPE_EN_EL_PISO
type Golpe = { readonly alcance: number; readonly fuerza: number; readonly ancho: number; readonly masAlta: number }
const superOnda = (g: Golpe, s: string): boolean => g.alcance >= 1.7 * 32 && g.fuerza >= 1.6 * 70 && g.ancho >= 1.5 * 1.3 && g.masAlta >= 2 * 0.42 && /float topeDeLaOnda = topeConElGolpe\( [0-9.]+ \);\s*float onda = topeDeLaOnda \* tanh\( nueva \/ topeDeLaOnda \);/.test(s)
afirmar(superOnda(G, sim), '  la súper onda (la de la llegada y la del encastre): llega casi el doble de lejos, más fuerte y más ancha, y se dibuja hasta 1 u más alta que el tope de las ondas de siempre (0,42)', `${String(G.alcance)} u · ${String(G.fuerza)} · ${String(G.ancho)} u · +${String(G.masAlta)} u`)
controlPositivo('  el detector VE el golpe de antes', [{ alcance: 32, fuerza: 70, ancho: 1.3, masAlta: 0 }, sim] as readonly [Golpe, string], ([g, s]: readonly [Golpe, string]) => superOnda(g, s))
// Y la sombra del logo se va con el logo en el aire (cayendo, lejos del piso, cruzaba el cuadro estirada).
const luzDelLogo = sinComentarios(leer('_lib/escena/LuzDelLogo.tsx'))
afirmar(luzDelLogo.includes('* (1 - enElAire)') && /const enElAire = Math\.min\(1, Math\.max\(0, \(logo\.position\.y - SOMBRA_DEL_LOGO\.aire\[0\]\)/.test(luzDelLogo), '  y la sombra del logo se apaga con el logo en el aire (cayendo, lejos del piso, se estiraba por el cuadro)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B2 · El brillo del piso después del encastre (PULIDO 1 P1: zonas blancas); el mouse sólo levanta; la sala se oscurece pareja')

// El dibujo del piso de verdad (el material con el final inyectado).
const dibujoDelPisoB2 = (() => {
  const material = conElFinalEnElPiso(new THREE.MeshStandardMaterial())
  const sombreador = { fragmentShader: [ANCLAS_DEL_DIBUJO.funcion, ...Object.values(ANCLAS_DEL_HUECO)].join('\n'), vertexShader: '', uniforms: {} as Record<string, THREE.IUniform> }
  material.onBeforeCompile(sombreador as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer)
  material.dispose()
  return sombreador.fragmentShader
})()
// [PULIDO 1] P1 · la lava (focos naranjas al azar por las juntas, núcleo y halo gaussianos) y el atardecer cálido (−45 %,
// 3600 K) se reemplazaron por pedido: el brillo son zonas blancas, orgánicas y cuantizadas al bloque, que nacen y mueren
// (el detalle, con sus controles, en s52-pulido-1 P1), y la sala se oscurece apenas y neutra. Lo que B2 fija sigue igual de
// fuerte: el mouse sólo levanta (sin brillo), el brillo espera al encastre (con el poder) y nace fuera del mar calmo, y lo que
// oscurece es la sala entera (el rig de luz, nunca un sector), función de `fin` (al rebobinar, vuelve).
// [PULIDO 2] 4 · el brillo es la luz que sale de abajo, por las juntas (s53-pulido-2 §4): la energía (el poder) y la calma
// están en su sector (`sectorDeLaLuz`); lo que fija esto sigue igual. [PULIDO 3] A1 · en la energía de cada bloque, que calcula
// la simulación (`energiaDeLaLuz`) y el dibujo lee por el vértice; lo que fija esto sigue igual. [PULIDO 6] E2 · sin el mar
// calmo de la luz: llega hasta el borde del logo (la calma pegada al hueco aplana los bloques, no la luz).
const cuadroDeLaLuzB2 = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
const brilloBien = (g: string, c: string): boolean => {
  const juntas = g.slice(g.indexOf('vec3 conLasJuntas( vec3 color, vec2 xz ) {'))
  return juntas.includes('float s = vEnergiaDelBloque;') && ENERGIA_EN_LA_SIMULACION_GLSL.includes('return min( 1.8, e ) * uEnergiaDeLaLuz;') && c.includes('LUZ_DE_ABAJO_EN_VIVO.uEnergiaDeLaLuz.value = LUZ_DEL_BANCO.apagada ? 0 : Math.min(1, s.poder)') && !g.includes('uRastro') && !g.includes('resplandorDelRastro')
}
afirmar(brilloBien(dibujoDelPisoB2, cuadroDeLaLuzB2), 'después del encastre (con el poder) y [PULIDO 6] hasta el borde del logo, el brillo del piso ([PULIDO 2] 4: la luz de abajo, por las juntas); el mouse ya no hace brillo (sólo levanta los bloques)')
controlPositivo('el detector VE un brillo que no espera al encastre', cuadroDeLaLuzB2.replace('Math.min(1, s.poder)', '1'), (c: string) => brilloBien(dibujoDelPisoB2, c))
controlPositivo('  y el brillo bajo el mouse de antes', `${dibujoDelPisoB2}\nvec2 resplandorDelRastro( vec2 xz ) { return vec2( 0.0 ); }`, (g: string) => brilloBien(g, cuadroDeLaLuzB2))
// La sala ENTERA (el nivel del rig de luz: las luces, el ambiente, la niebla, el fondo) baja después del encastre; función
// de `fin` (al rebobinar, vuelve). [PULIDO 1] P1: neutra (sin el tinte cálido) y apenas: 10 a 15 % según `?brillo=`.
// [PULIDO 1] P1 · lo que se oscurece es el PISO ENTERO, en el color que se ve (con el tono de ACES, bajar la luz del rig casi
// no movía su blanco y oscurecía el logo y el pie): parejo, nunca un sector; función de `fin` (al rebobinar, vuelve).
const rigB2 = sinComentarios(leer('_lib/escena/OrbitRig.tsx'))
const cuadroB2 = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
// [PULIDO 2] 4 · sigue parejo (un número para el piso entero); ahora además gradual con lo prendido de la luz (s52-pulido-1 P1).
// [PULIDO 3] A1 · gradual con la expansión de la energía (función de `fin`: `expansionDeLaLuz`), en vez de lo prendido.
const oscuroBien = (g: string): boolean => g.includes('gl_FragColor.rgb *= 1.0 - uOscuroDelBrillo;') && cuadroB2.includes('piso.uOscuroDelBrillo.value = LUZ_DE_ABAJO.oscurece * extendida') && cuadroB2.includes('const expansion = expansionDeLaLuz(fin)') && !/arc\.kelvin \+=/.test(rigB2)
const alRas = FINAL_DEL_PIE.presion.hastaS / R.duracionS
afirmar(oscuroBien(dibujoDelPisoB2) && expansionDeLaLuz(0) === 0 && expansionDeLaLuz(alRas - 0.01) === 0 && expansionDeLaLuz(1) === 1, '  para que se lea, el piso entero se oscurece parejo después del encastre (nunca un sector) y vuelve al rebobinar')
controlPositivo('  el detector VE un oscurecimiento que no está en el piso', dibujoDelPisoB2.replace('gl_FragColor.rgb *= 1.0 - uOscuroDelBrillo;', ''), oscuroBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B3 · El círculo estable: alrededor del logo, liso y quieto, sin bordes; no reacciona al mouse ni a las ondas')

// Un CÍRCULO (antes una elipse angosta en la caja del logo, que sólo ocultaba el dibujo: el rectángulo hundido en
// escalones), de radio acorde (el logo y un margen, no mucho más) y con un borde ancho y suave (varios bloques: sin
// escalones). Adentro, quieto de verdad: los empujes (el mouse, el pulso, el golpe, las ondas) se apagan con la calma y la
// onda se amortigua; y el logo no larga anillos durante el final.
// [PULIDO 2] 4 · «el brillo empieza afuera» se lee ahora en el sector de la luz de abajo (`sectorDeLaLuz`, con su calma:
// el mismo anillo, que le pasa `cuadroDelFinal.ts`; lo fija s51 1F); antes, en `fueraDeLaCalma` del dibujo, que se borró.
// [PULIDO 6] E2 · SIN EL CÍRCULO LISO (decisión: «gana el filo: se borran el anillo y el círculo liso»; «que haya poder
// alrededor suyo»): la calma es un MARGEN pegado al hueco, medido con la distancia al logo (no con el radio): al ras quedan los
// bloques que tocan el filo entero (media diagonal de bloque más el margen, que cubre el filo en su ancho mayor) y en un borde de
// al menos un bloque vuelven al caos; adentro, quieto de verdad como antes (los empujes se apagan y la onda se amortigua). La
// luz ya no se calma (llega hasta el borde mismo del logo): la calma apaga los pistones y las alturas.
const C = CALMA_EN_EL_PISO
const simB3 = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
type Calma = { readonly margen: number; readonly borde: number; readonly amortigua: number }
const margenBien = (sim: string, dib: string, c: Calma): boolean =>
  sim.includes(`float alRas = 0.7072 * uLado + ${c.margen.toFixed(3)};`) && sim.includes(`return uCalmaDelFinal * ( 1.0 - smoothstep( alRas, alRas + ${c.borde.toFixed(1)}, distanciaAlLogo( xz ) ) );`) &&
  /float calmaAqui = calmaDelFinal\( p \* uLado \);\s*fuerza \*= 1\.0 - calmaAqui;\s*amortigua \+= [0-9.]+ \* calmaAqui;/.test(sim) && sim.includes('dibujo *= 1.0 - calmaDelFinal( xz );') &&
  dib.includes('piston = pistonDeLaLuz( xz ) * llego * ( 1.0 - calmaDelFinal( xz ) ) * uEnergiaDeLaLuz;') && dib.includes('return min( 1.8, e ) * uEnergiaDeLaLuz;') &&
  c.margen >= FILO.desde + FILO.ancho * (1 + FILO.crece) && 0.7072 * 0.8 + c.margen + c.borde < 2.5 && c.borde >= 0.8 && c.amortigua >= 10
afirmar(margenBien(simB3, ENERGIA_EN_LA_SIMULACION_GLSL, C), 'una vez encastrado, alrededor del logo un MARGEN al ras pegado al hueco (no el círculo de antes: la energía llega hasta el logo): los bloques que tocan el filo quedan al ras y quietos (los empujes del mouse, del pulso, del golpe y de las ondas se apagan); la luz sale por sus juntas hasta el borde', `al ras hasta ${(0.7072 * 0.8 + C.margen).toFixed(2)} u del logo (desde el centro del bloque) · borde ${String(C.borde)} u · ${String(C.amortigua)}/s más de amortiguación`)
controlPositivo('el detector VE la calma de antes (sólo ocultaba el dibujo: las olas seguían debajo)', [simB3.replace(/float calmaAqui = calmaDelFinal\( p \* uLado \);\s*fuerza \*= 1\.0 - calmaAqui;\s*amortigua \+= [0-9.]+ \* calmaAqui;/, ''), ENERGIA_EN_LA_SIMULACION_GLSL, C] as readonly [string, string, Calma], ([si, di, c]: readonly [string, string, Calma]) => margenBien(si, di, c))
controlPositivo('  y el círculo liso de antes (medido con el radio)', [simB3.replace('distanciaAlLogo( xz ) ) );', 'length( xz ) ) );'), ENERGIA_EN_LA_SIMULACION_GLSL, C] as readonly [string, string, Calma], ([si, di, c]: readonly [string, string, Calma]) => margenBien(si, di, c))
controlPositivo('  y un margen que no cubre el filo (un bloque pegado lo taparía)', [simB3.replace(`+ ${C.margen.toFixed(3)};`, '+ 0.050;'), ENERGIA_EN_LA_SIMULACION_GLSL, { ...C, margen: 0.05 }] as readonly [string, string, Calma], ([si, di, c]: readonly [string, string, Calma]) => margenBien(si, di, c))
const entornoB3 = sinComentarios(leer('_lib/escena/entorno/Entorno.tsx'))
// [PULIDO 6] E2 · la regla se revisó: el círculo ya no existe; los anillos del pulso siguen apagados en el final porque sus ondas
// son las del logo, que ahora nacen en el filo (en la energía y en la física del golpe: `luzDeAbajo.ts`, `enElPiso.ts`).
afirmar(entornoB3.includes('entradas.reducido = quieto || EN_VIVO.fin > 0'), '  y durante el final el logo no larga anillos del pulso: sus ondas son las del logo, que nacen en el filo (antes cruzaban el círculo quieto)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B4 · El polvo en el pie: en la cinemática no se posa; el que cae no atraviesa las piezas del pie (un cupo se apoya)')

// En la cinemática la página está quieta (la cinemática es automática) y el polvo se posaba a los 4 s: ahora el final cuenta
// como movimiento (desde el logo) y el polvo sigue flotando como siempre.
const fisicaB4 = sinComentarios(leer('_lib/escena/polvo/Fisica.tsx'))
const flotaEnElFinal = (c: string): boolean => /if \(!hayOrigen && EN_VIVO\.fin > 0\) \{\s*m\.origen\[0\] = 0\s*m\.origen\[1\] = FLOOR_Y\s*m\.origen\[2\] = 0\s*hayOrigen = true\s*\}\s*if \(!hayOrigen && \(scroll \|\| cursor\)\) \{/.test(c)
afirmar(flotaEnElFinal(fisicaB4), 'durante la cinemática final el polvo no se posa ni cae: el final cuenta como movimiento (desde el logo) y sigue flotando como siempre')
controlPositivo('el detector VE el polvo que se posa en la cinemática (la página quieta)', fisicaB4.replace(/if \(!hayOrigen && EN_VIVO\.fin > 0\) \{[\s\S]*?hayOrigen = true\s*\}\s*/, ''), flotaEnElFinal)
// Lo que cae no atraviesa las piezas del pie (placas, botones, enlaces, el formulario; no el texto suelto): sale por una cara;
// por la de arriba se apoya un cupo (al azar, por mota), sólo si recién la cruzó (no salta desde el costado).
const simB4 = sinComentarios(leer('_lib/escena/polvo/simulacion.ts'))
const armadasB4 = sinComentarios(leer('_lib/escena/pie3d/armadas.ts'))
const choqueBien = (sim: string, ar: string, glsl: string): boolean =>
  /p \+= relajar\( v, objetivo, [^;]+;\s*chocarConElPie\( p, v, azar \);\s*if \( posarseEnElLogo\( p, antes \) \) \{/.test(sim) && sim.includes('${CAJAS_DEL_PIE_GLSL}') &&
  ar.includes("for (const a of s.armadas) if (a.grupo.visible && a.pieza.forma !== 'texto') cajas = escribirLaCaja(cajas, a.viaje.matrixWorld, a.caja)") &&
  glsl.includes('if ( arriba && apoya && h < 0.25 * medida ) { k = j; menor = -1.0; break; }') && glsl.includes('if ( arriba ) continue;') && glsl.includes('if ( hondo.x <= 0.0 || hondo.y <= 0.0 || hondo.z <= 0.0 ) continue;')
afirmar(choqueBien(simB4, armadasB4, CAJAS_DEL_PIE_GLSL) && POLVO_EN_EL_PIE.cupo <= 0.35 && POLVO_EN_EL_PIE.cajas >= 10, '  la mota que cae no atraviesa las piezas del pie (sale por la cara más cercana que no es la de arriba); por la de arriba se apoya sólo un cupo (no se acumula), y sólo si recién la cruzó; la apoyada queda frenada en su cara (si la pieza se mueve, la lleva)', `cupo ${String(POLVO_EN_EL_PIE.cupo * 100)} % · hasta ${String(POLVO_EN_EL_PIE.cajas)} piezas`)
controlPositivo('  el detector VE un polvo que atraviesa las piezas', [simB4.replace(/chocarConElPie\( p, v, azar \);\s*/, ''), armadasB4, CAJAS_DEL_PIE_GLSL] as const, ([si, ar, gl]: readonly [string, string, string]) => choqueBien(si, ar, gl))
controlPositivo('  y uno que apoya a todas (se acumularían)', [simB4, armadasB4, CAJAS_DEL_PIE_GLSL.replace('if ( arriba ) continue;', '')] as const, ([si, ar, gl]: readonly [string, string, string]) => choqueBien(si, ar, gl))

// ═══════════════════════════════════════════════════════════════════════════
titulo('C1 · Teléfono y tablet: el texto de Trabajos se lee sobre el logo de noche')

// La mezcla de s7 no llega al lienzo a través del pin de Trabajos (un sticky: su propio contexto de apilamiento; medido en
// nocturno-final/c1). Abajo de 1024 el texto del cartel y de las demos lleva un halo del color del fondo de su superficie
// (la oscura, en Trabajos): sobre la noche no se ve; sobre el logo, separa las letras de su filo claro.
const banda = leer('_estilos/banda.css')
const enLaBanda = banda.slice(banda.indexOf('@media (width < 1024px) {'), banda.indexOf('/* ── HOVER DONDE HAY'))
const haloBien = (c: string): boolean => /\[data-v3\] \[data-panel='trabajos'\] \[data-pieza='cartel'\],\s*\[data-v3\] \[data-panel='trabajos'\] \[data-capa='demos'\] \{\s*text-shadow: var\(--halo-sobre-la-escena\);/.test(c) && /--halo-sobre-la-escena: 0 0 [0-9.]+em var\(--color-fondo\)/.test(c)
afirmar(haloBien(enLaBanda), 'abajo de 1024 el texto del cartel de Portfolio y el de las demos lleva un halo del fondo de su superficie: se lee sobre el logo de noche (la mezcla no atraviesa el pin)')
controlPositivo('el detector VE el cartel sin halo', enLaBanda.replace('text-shadow: var(--halo-sobre-la-escena);', ''), haloBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('C2 · Tu panel en el teléfono y la tablet: una columna, cada bloque al ancho; las demos se leen')

// Abajo de 1024 cada bloque va a todo el ancho (con los márgenes de la sección) y la demo se dibuja a una pantalla angosta,
// la de su tarjeta: se ve a ~85 % (antes al 35 %: dibujada a ~1000 px en una tarjeta de 300), sin la barra lateral.
const escalaAngosta = (anchoDeLaTarjeta: number): number => anchoDeLaTarjeta / pantallaAngosta(anchoDeLaTarjeta).ancho
const tarjetas = [330, 350, 380, 600, 688, 714]
const angostaBien = (f: typeof pantallaAngosta): boolean => tarjetas.every((w) => { const p = f(w); const e = w / p.ancho; return e >= 0.8 && e <= 0.9 && p.ancho < ANCHO_CON_BARRA && Math.abs(p.alto / p.ancho - DEMO_ANGOSTA.proporcion) < 0.01 })
afirmar(angostaBien(pantallaAngosta), 'abajo de 1024 la demo se dibuja a la pantalla angosta de su tarjeta: se ve a ~85 % (se lee), sin la barra lateral, en 4:5', tarjetas.map((w) => `${String(w)} px → ${escalaAngosta(w).toFixed(2)}`).join(' · '))
controlPositivo('el detector VE la de escritorio en el teléfono (dibujada a 1000 px: al 35 %)', ((w: number) => ({ ancho: Math.max(1000, w), alto: 720 })) as typeof pantallaAngosta, angostaBien)
const demoTsx = sinComentarios(leer('_panel-vivo/DemoDelPanel.tsx'))
const tarjetaTsx = sinComentarios(leer('_secciones/tu-panel/Tarjeta.tsx'))
const columnaBien = (d: string, t: string, clase: (i: number) => string): boolean =>
  d.includes('const enUso = escritorio ? pantalla : pantallaAngosta(el.clientWidth)') && t.includes('max-escritorio:aspect-4/5') && DEMO_ANGOSTA.proporcion === 5 / 4 &&
  [0, 1, 2, 3].every((i) => clase(i).split(' ')[0] === 'w-full' && !/(^| )ml-auto/.test(clase(i)) && /escritorio:@max-6xl:w-(22|18)\/25/.test(clase(i)))
afirmar(columnaBien(demoTsx, tarjetaTsx, claseEnColumna), '  cada bloque a todo el ancho abajo de 1024 (sin la columna escalonada), con el marco de la pantalla angosta; en escritorio, como estaba')
controlPositivo('  el detector VE la columna escalonada de antes', [demoTsx, tarjetaTsx, ((i: number) => (i % 2 === 0 ? 'w-22/25 escritorio:@max-6xl:w-22/25' : 'ml-auto w-18/25 escritorio:@max-6xl:w-18/25')) as typeof claseEnColumna] as const, ([d, t, c]: readonly [string, string, typeof claseEnColumna]) => columnaBien(d, t, c))

// ═══════════════════════════════════════════════════════════════════════════
titulo('C3 · Después de «Y más…»: en el teléfono y la tablet, Tu panel mide su contenido (sin el blanco)')

// Los 700svh son del caos de escritorio; en la columna angosta el contenido mide ~5,8 pantallas a 390 × 844 y lo que sobraba
// (1015 px) era el blanco después del newsletter. Como Servicios y Por qué develOP: abajo de 1024, su contenido. La escena de
// ahí (el amanecer, la noche) se ata a las cajas MEDIDAS, así que no se corre: está medido igual con el alto viejo y el nuevo.
const panelTsx = sinComentarios(leer('_componentes/Panel.tsx'))
type FilaDeAlto = { readonly alto: string; readonly altoAngosto?: 'contenido' }
const sinBlanco = (fila: FilaDeAlto, panel: string): boolean => fila.altoAngosto === 'contenido' && fila.alto === '700svh' && panel.includes("seccion.altoAngosto === 'contenido' ? 'max-escritorio:min-h-0!' : undefined")
afirmar(sinBlanco(seccionDe('tu-panel'), panelTsx), 'abajo de 1024 Tu panel mide su contenido (el piso del alto se apaga); en escritorio sigue en 700svh', `${seccionDe('tu-panel').alto} · ${String(seccionDe('tu-panel').altoAngosto)}`)
controlPositivo('el detector VE la fila de antes (700svh también en el teléfono)', { alto: '700svh' } as FilaDeAlto, (f) => sinBlanco(f, panelTsx))

// ═══════════════════════════════════════════════════════════════════════════
titulo('C4 · El pie angosto: entra en una pantalla y el formulario va en su caja (PULIDO 1 P18: de vidrio)')

// Medido (c4/): a 390 × 844 el pie medía 967 px (el titular se cortaba arriba) y sus campos, sin fondo y adentro de la
// mezcla `difference`, desaparecían sobre el logo negro (también a 768). Ahora entra en 375 × 635, 390 × 664 (un iPhone con
// las barras de Safari) y 768 × 1024. Acá, lo que lo hace: la tarjeta sin mezcla, la grilla del formulario, el relleno.
const pieAngosto = marcar(<Cierre seccion={seccionDe('cierre')} />, { anima: false })
const clasesDe = (html: string): string[] => [...html.matchAll(/class="([^"]*)"/g)].map((m) => m[1])
// [PULIDO 1] P18 · la caja del contacto dejó de ser la tarjeta sólida (el papel, borde y sombra) y es de vidrio líquido
// (`data-material="vidrio"`, el material del menú): lo pidió P18 (la sólida era demasiado invasiva). Lo que C4 fija sigue
// igual de fuerte: UNA caja propia con el rótulo y el formulario, nada que mezcle adentro, mezclan sólo las otras tres.
const tarjetaBien = (html: string): boolean => {
  const cajas = [...html.matchAll(/<div[^>]*data-material="vidrio"[^>]*>/g)]
  const iForm = html.indexOf('<form id="contacto"')
  const iTarjeta = cajas.length === 1 ? (cajas[0].index ?? -1) : -1
  // Entre la caja y el formulario: sólo el rótulo «Contacto»; nada que mezcle adentro de la caja.
  const adentro = iTarjeta >= 0 && iForm > iTarjeta ? html.slice(iTarjeta, html.indexOf('</form>', iForm)) : ''
  return cajas.length === 1 && !cajas[0][0].includes('mix-blend-difference') && adentro.length > 0 && !adentro.includes('mix-blend-difference') && /<h3/.test(adentro) && clasesDe(html).filter((c) => c.includes('mix-blend-difference')).length === 3
}
afirmar(tarjetaBien(pieAngosto), 'abajo de 1024 el contacto va en UNA caja propia (desde PULIDO 1 P18, de vidrio) con su rótulo, sin nada que mezcle adentro; mezclan sólo la identidad, el recorrido y la fila de abajo')
controlPositivo('el detector VE la caja mezclando (los campos de antes)', pieAngosto.replace('<form id="contacto"', '<form data-x="max-escritorio:mix-blend-difference" id="contacto"'), tarjetaBien)
const formularioTsx = sinComentarios(leer('_secciones/cierre/FormularioDelPie.tsx'))
// [PULIDO 3] A2 · cambió por pedido: en la tablet (768 a 1023) el formulario va en columna (un campo por renglón, el mensaje
// con el alto que sobra); en el teléfono, igual que antes (lado a lado). Lo fija `s54-pulido-3` A2.
const grillaBien = (f: string): boolean =>
  f.includes("'grid grid-cols-6 gap-[var(--spacing-3)] tablet:max-escritorio:flex tablet:max-escritorio:flex-1 tablet:max-escritorio:flex-col escritorio:flex escritorio:flex-col escritorio:gap-[var(--spacing-5)]'") &&
  f.includes("{ nombre: 'col-span-3', mail: 'col-span-3', mensaje: 'col-span-4 tablet:max-escritorio:grid tablet:max-escritorio:flex-1 tablet:max-escritorio:grid-rows-[var(--filas-del-mensaje-del-pie)]' }") &&
  f.includes('className="self-start max-escritorio:col-span-2 max-escritorio:self-end escritorio:mt-[var(--spacing-2)]"') &&
  /max-escritorio:bg-tinta max-escritorio:px-\[var\(--spacing-3\)\] max-escritorio:text-fondo/.test(f) &&
  /text-cuerpo max-escritorio:text-base leading-texto/.test(f)
afirmar(grillaBien(formularioTsx), '  el formulario del teléfono: el nombre y el mail lado a lado, el mensaje y Enviar (lleno, de tinta) abajo (en la tablet, en columna); los campos a 16 px (Safari no agranda al tocar); en escritorio, una columna como antes')
controlPositivo('  el detector VE los campos a 15 px en el teléfono', formularioTsx.replace('text-cuerpo max-escritorio:text-base leading-texto', 'text-cuerpo leading-texto'), grillaBien)
const bandaC4 = leer('_estilos/banda.css')
const enLaBandaC4 = bandaC4.slice(bandaC4.indexOf('@media (width < 1024px) {'), bandaC4.indexOf('/* ── HOVER DONDE HAY'))
const rellenoBien = (c: string): boolean => /\[data-v3\] \[data-panel='cierre'\] \[data-pieza='pie'\] \{\s*padding-block: calc\(var\(--spacing-12\) \+ var\(--spacing-6\)\) var\(--spacing-12\);/.test(c)
afirmar(rellenoBien(enLaBandaC4), '  el relleno del pie angosto: 72 px arriba (el botón del menú termina a 64) y 48 abajo (la esquina del recorrido queda a la derecha)')
controlPositivo('  el detector VE el relleno de escritorio (80 y 80)', enLaBandaC4.replace("[data-v3] [data-panel='cierre'] [data-pieza='pie'] {", '[data-v3] [data-x] {'), rellenoBien)
type Rotulos = { readonly rotulo: string; readonly corto: string }
const corto = (w: Rotulos, html: string): boolean => w.rotulo.includes(w.corto) && w.corto.length < w.rotulo.length && html.includes(`<span class="max-tablet:hidden">`) && html.includes(`<span class="tablet:hidden">`)
afirmar(corto(WHATSAPP, pieAngosto) && /max-tablet:text-fluido-titulo-l/.test(sinComentarios(leer('_secciones/cierre/Cierre.tsx'))), '  en el teléfono el titular va un nivel abajo (dos renglones) y WhatsApp con su rótulo corto (el nombre del enlace lo contiene): el mail y WhatsApp en una fila', `«${WHATSAPP.corto}»`)
controlPositivo('  el detector VE un rótulo corto que no está en el largo', { rotulo: WHATSAPP.rotulo, corto: 'WA' } as Rotulos, (w) => corto(w, pieAngosto))

// ═══════════════════════════════════════════════════════════════════════════
titulo('C5 · El menú del teléfono: tres barras, Contacto como un ítem más, sin Login; la franja que cierra (sin cruz)')

const menuMovilC5 = sinComentarios(leer('_chrome/menu/MenuMovil.tsx'))
const panelC5 = sinComentarios(leer('_chrome/menu/PanelDelMenu.tsx'))
const vidrioDelMenuC5 = sinComentarios(leer('_chrome/menu/MenuDeVidrio.tsx'))
const franjaC5 = sinComentarios(leer('_chrome/menu/franja.ts'))
const hojaDelVidrio = leer('_estilos/vidrio.css')
const botonBien = (m: string, p: string): boolean =>
  m.includes('{TRES_BARRAS}') && !/Isotipo/.test(m) && m.includes("data-seccion={invertido ? 'invertida' : undefined}") && /import \{ Menu as TresBarras \} from 'lucide-react'/.test(p) && /<TresBarras aria-hidden="true" strokeWidth=\{1\.5\}/.test(p)
afirmar(botonBien(menuMovilC5, panelC5), 'el botón del menú son las tres barras (era el logo), con el mismo tono por zona que tenía: el del botón (`data-seccion`)')
controlPositivo('el detector VE el logo de antes', [menuMovilC5.replace('{TRES_BARRAS}', '<Isotipo />'), panelC5] as const, ([m, p]) => botonBien(m, p))
const sinLoginNiCruz = (p: string): boolean => !/ENLACE_DE_LOGIN|pie-del-menu|lucide-react'.*\bX\b|\{CRUZ\}/.test(p) && /\{ENLACE_DE_CONTACTO\.rotulo\}\s*<\/button>\s*<\/li>\s*<\/ul>\s*<\/nav>/.test(p)
afirmar(sinLoginNiCruz(panelC5), '  adentro: las secciones y Contacto como la última (abre el panel de contacto); sin Login ni el pie del menú, y sin cruz')
controlPositivo('  el detector VE el Login de antes', panelC5 + '\n<a href={ENLACE_DE_LOGIN.destino}>', sinLoginNiCruz)
// La franja: el círculo del botón (recorte de 48 px redondo, en el centro) que con el panel abierto llega a todo el ancho.
const franjaCss = (c: string): boolean =>
  c.includes('clip-path: inset(0 calc(50% - var(--spacing-6)) round var(--spacing-6));') &&
  /\[data-franja="abierta"\] \[data-parte="franja"\] \{\s*clip-path: inset\(0 0 round var\(--vidrio-radio\) var\(--vidrio-radio\) 0 0\);/.test(c) &&
  /transition-property: clip-path, background-color;\s*transition-duration: var\(--duracion-rapida\);/.test(c) &&
  /\[data-parte="cerrar-el-menu"\] > \* \{\s*position: relative;\s*grid-area: 1 \/ 1;/.test(c) &&
  /@keyframes brillo-de-la-franja \{\s*0% \{\s*background-position: 100% 0;\s*\}\s*55%,\s*100% \{\s*background-position: 0 0;/.test(c) &&
  /@media \(prefers-reduced-motion: reduce\) \{\s*\[data-v3\] \[data-pieza="vidrio"\] \[data-parte="cerrar-el-menu"\] \* \{\s*transition: none !important;\s*animation: none !important;/.test(c)
afirmar(franjaCss(hojaDelVidrio), '  la franja: el círculo del botón se estira a todo el ancho de arriba del vidrio (y vuelve), con «Click para cerrar» en gris y un brillo de izquierda a derecha; las capas, apiladas en el orden del árbol (el recorte, si no, se pintaba encima del rótulo); con movimiento reducido, quieta')
controlPositivo('  el detector VE las capas sin posicionar (el rótulo lavado)', hojaDelVidrio.replace('position: relative;\n  grid-area: 1 / 1;', 'grid-area: 1 / 1;'), franjaCss)
// El cierre: primero la franja se recoge en el círculo (lo que tarda sale de su transición) y recién después el Genie, con
// el botón que reaparece cuando arranca; al abrir, se estira cuando el panel terminó de abrir.
const pokebola = (v: string, f: string): boolean => {
  const i = [v.indexOf('const recogida = estabaAbierto ? msDeLaFranja(caja.current) : 0'), v.indexOf('estirarLaFranja(caja.current, false)\n    if (recogida === 0)'), v.indexOf('const reloj = window.setTimeout(genie, recogida)')]
  const g = v.indexOf('const genie = (): void => {\n      alCubrir(false)')
  return i.every((x) => x > 0) && i[0] < i[1] && i[1] < i[2] && g > 0 && g < i[0] && /if \(!reducido\) requestAnimationFrame\(\(\) => estirarLaFranja\(caja\.current, true\)\)/.test(v) && /transitionDuration/.test(f) && !/\b300\b/.test(f)
}
afirmar(pokebola(vidrioDelMenuC5, franjaC5), '  al tocarla, la franja vuelve al círculo y recién ahí el panel se va en él (como una pokébola que se cierra); al abrir, el círculo se estira cuando el panel terminó de salir')
controlPositivo('  el detector VE el Genie que arranca sin esperar a la franja', [vidrioDelMenuC5.replace('const reloj = window.setTimeout(genie, recogida)', 'genie()\n    const reloj = 0'), franjaC5] as const, ([v, f]) => pokebola(v, f))

// ═══════════════════════════════════════════════════════════════════════════
titulo('D1 · La foto de «Nosotros» se comporta como las del equipo: en el plano de su título, con la misma llegada')

const equipoD1 = sinComentarios(leer('_secciones/quienes-somos/equipo.tsx'))
const deLaFoto = (f: string): string => f.slice(f.indexOf('export function LaFoto'))
const comoLasDelEquipo = (f: string): boolean => {
  const foto = deLaFoto(f)
  const [titulo, plano, llegada, marco] = [foto.indexOf('<TituloDeLaFoto progreso={progreso} />'), foto.indexOf('<div ref={enElPlano}'), foto.indexOf('<Bloque patron="P2" rango="llegada-de-la-foto"'), foto.indexOf('<MarcoDeDosTomas')]
  return (
    f.includes("useTextoDeVolumen<HTMLHeadingElement>({ id: 'nosotros', texto: CONTENIDO.equipo.titulo, fuente: 'chivo-400', gesto: 'levanta', llegada: progreso, queda: false })") &&
    f.includes("useTextoDeVolumen<HTMLHeadingElement>({ id: 'equipo', texto: CONTENIDO.tituloDelEquipo, fuente: 'chivo-400', gesto: 'levanta', llegada: progreso, queda: false })") &&
    foto.includes("useAcompananteDelTitulo<HTMLDivElement>('nosotros')") &&
    titulo > 0 && titulo < plano && plano < llegada && llegada < marco &&
    /<ProgresoAmortiguado progreso=\{progreso\}>\s*\{\(perseguido\) => \(\s*<LlegadaEnCurva progreso=\{perseguido\} sentido="desde-la-derecha"/.test(foto) &&
    !foto.includes('CanalDeUnaPieza')
  )
}
afirmar(comoLasDelEquipo(equipoD1), '«Nosotros» tiene su volumen (se levanta con su máscara, como «El equipo») y la foto va en su plano (perspectiva con el mouse) y llega en curva, como las de las personas (y se va al revés con el scroll para atrás)')
controlPositivo('el detector VE la foto suelta (fuera del plano de su título)', equipoD1.replace("useAcompananteDelTitulo<HTMLDivElement>('nosotros')", 'useRef<HTMLDivElement>(null)'), comoLasDelEquipo)
controlPositivo('el detector VE la llegada de antes (la figura entera con P2)', equipoD1.replace('<LlegadaEnCurva progreso={perseguido} sentido="desde-la-derecha"', '<CanalDeUnaPieza progreso={perseguido} patron="P2"'), comoLasDelEquipo)
// La fuente 3D de los títulos es un subconjunto (`scripts-retoque/fuentes-3d.py`): sin la «N» el título no se armaba.
const glifosD1 = (JSON.parse(leer('_fuentes/chivo-400-titulos.json')) as { readonly glyphs: Record<string, unknown> }).glyphs
const cubreD1 = (g: Record<string, unknown>): boolean => [...CONTENIDO_DE_QUIENES_D1.equipo.titulo].every((c) => c in g)
afirmar(cubreD1(glifosD1) && /'Nosotros'\], 'destino': 'chivo-400-titulos\.json'/.test(leerDeLaRaiz('scripts-retoque/fuentes-3d.py')), '  la fuente 3D de los títulos tiene todas las letras de «Nosotros» (y su generador las pide)')
controlPositivo('  el detector VE la fuente sin la «N»', Object.fromEntries(Object.entries(glifosD1).filter(([k]) => k !== 'N')), cubreD1)

// ═══════════════════════════════════════════════════════════════════════════
titulo('D2 · «Seis razones» se lee en todo el tramo: el amanecer sin la mezcla, en dos tiempos; con el día, la mezcla')

// Medido (d2/, contraste bajo la letra contra lo que se ve alrededor): abajo de 1024 la mezcla daba gris sobre los grises
// del amanecer (390: la frase en 3,8:1 a mitad, razones en 1,9:1 cerca del día; 768: TODO en ~1,1:1 al final). Ahora
// cada tiempo con lo que se lee ahí. Desde 1024 el texto espera al día (`DIA_DEL_TEXTO`) y de día da 11,7:1 (clásico).
type Modo = typeof modoDelAmanecer
const tiempos = (f: Modo): boolean =>
  f(0, 0) === 'noche' && f(PARED_ILUMINADA - 0.01, 0.5) === 'noche' && f(PARED_ILUMINADA, 0) === 'pared' && f(1, 0.99) === 'pared' && f(1, 1) === null && f(0.2, 1) === null
afirmar(tiempos(modoDelAmanecer), 'mientras el piso no está iluminado, sin mezcla: con la pared oscura `noche`, con la pared iluminada `pared`; con el piso iluminado, la mezcla', `pared desde ${String(PARED_ILUMINADA)}`)
controlPositivo('el detector VE la mezcla de antes (en todo el amanecer)', (() => null) as Modo, tiempos)
const bandaD2 = leer('_estilos/banda.css')
const angostaD2 = bandaD2.slice(bandaD2.indexOf('@media (width < 1024px) {'), bandaD2.indexOf('/* ── HOVER DONDE HAY'))
const MEZCLADO = String.raw`\.max-escritorio\\:mix-blend-difference`
const reglasD2 = (c: string): boolean =>
  new RegExp(String.raw`\[data-parte='lista-del-final'\]\[data-amanecer\] ${MEZCLADO} \{\s*mix-blend-mode: normal;`).test(c) &&
  new RegExp(String.raw`\[data-amanecer='noche'\] ${MEZCLADO} \{\s*text-shadow: var\(--halo-del-amanecer\);`).test(c) &&
  new RegExp(String.raw`\[data-amanecer='pared'\] ${MEZCLADO} \{\s*color: var\(--color-tinta\);\s*text-shadow: var\(--halo-del-final\);`).test(c) &&
  new RegExp(String.raw`\[data-amanecer\] \[data-pieza='cta-del-final'\] ${MEZCLADO} \{\s*color: var\(--color-fondo\);\s*text-shadow: var\(--halo-del-amanecer\);`).test(c)
afirmar(reglasD2(angostaD2), '  la hoja (abajo de 1024): sin mezcla mientras amanece; `noche`, el papel con el halo de la tinta; `pared`, la tinta con el halo del papel; el CTA, sobre el piso, el papel hasta el día')
controlPositivo('  el detector VE la lista que sigue mezclando al amanecer', angostaD2.replace('mix-blend-mode: normal;', ''), reglasD2)
const denso = (halo: string, color: string): boolean => (halo.match(new RegExp(String.raw`0 0 0\.1em var\(--color-${color}\)`, 'g')) ?? []).length === 3 && (halo.match(new RegExp(String.raw`0 0 0\.2em var\(--color-${color}\)`, 'g')) ?? []).length === 3
const haloDe = (c: string, nombre: string): string => new RegExp(String.raw`  ${nombre}: ([^;]+);`).exec(c)?.[1] ?? ''
afirmar(denso(haloDe(bandaD2, '--halo-del-amanecer'), 'tinta') && denso(haloDe(bandaD2, '--halo-del-final'), 'fondo'), '  los dos halos son densos: la misma sombra corta apilada (una sola, larga, se diluía y no separaba la letra del fondo)')
controlPositivo('  el detector VE un halo de una sola sombra', '0 0 0.6em var(--color-tinta)', (h) => denso(h, 'tinta'))
const porQueD2 = sinComentarios(leer('_secciones/por-que-develop/PorQueDevelop.tsx'))
const listaD2 = (f: string): boolean =>
  f.includes('<div ref={lista} data-parte="lista-del-final" className="contents">') &&
  f.includes("DIA_DEL_TEXTO.frase.on('change', poner)") && f.includes("DIA_DEL_TEXTO.abajo.on('change', poner)") &&
  f.includes('modoDelAmanecer(DIA_DEL_TEXTO.frase.get(), DIA_DEL_TEXTO.abajo.get())')
afirmar(listaD2(porQueD2), '  la lista se marca con el día del texto (la pared y el piso), sin caja propia (`contents`: la mezcla no se corta)')
controlPositivo('  el detector VE una caja que cortaría la mezcla', porQueD2.replace('className="contents"', 'className="flex flex-col"'), listaD2)

// ═══════════════════════════════════════════════════════════════════════════
titulo('D3 · El CTA del final, centrado en la pantalla, y «Hablanos» bastante más grande')

// Antes, en escritorio, el CTA iba en la franja de abajo (del 77 al 97 % del alto), debajo del logo centrado; en el teléfono,
// alineado a la izquierda; «Hablanos» a 32 px. Ahora: en C la cámara se aleja y baja el logo contra el borde de abajo, el
// CTA va al centro de la pantalla y «Hablanos» va al display (104 px fluido; a 1440 × 900, 100).
// [PULIDO 1] P17-A · cambió por pedido: C mira desde arriba (altura 4,5, distancia 31) para que no entre el techo del domo,
// y el dolly-in leve al llegar va por tiempo en el rig (la pista sostiene); la distancia de ojo ya no es 32 exacta (31,3;
// con el dolly, 30,8). Lo que se fija sigue igual: lejos de B (más del doble, aun con el dolly), el logo contra el borde de
// abajo (`frameY` −1), las dos keyframes de C iguales a su pose y el lugar del CTA desde donde el logo queda más grande.
const poseC = POSES_DEL_FINAL.cta
const keyC = CHOREO_KEYFRAMES.filter((k) => k.name === 'cta' || k.name === 'cta · sostén').map((k) => k.pose)
type PoseC = { readonly distance: number; readonly height: number; readonly frameY: number }
const ojoDe = (p: PoseC): number => Math.hypot(p.distance, p.height) - DOLLY_DEL_CTA.u
const logoAbajo = (p: PoseC, arriba: number): boolean => ojoDe(p) >= 2 * POSES_DEL_FINAL.valores.distance * 0.95 && p.frameY === -1 && arriba > 50 + 3 && arribaDelLogoEncuadrado(16, 0) === 26
const igual = (a: PoseC, b: PoseC): boolean => a.distance === b.distance && a.height === b.height && a.frameY === b.frameY
afirmar(logoAbajo(poseC, ARRIBA_DEL_LOGO_EN_EL_CTA_SVH) && ARRIBA_DEL_LOGO_EN_EL_CTA_SVH === arribaDelLogoEncuadrado(ojoDe(poseC), -1) && keyC.length === 2 && keyC.every((k) => igual(k, poseC)), 'en C la cámara se aleja (de 16 a más del doble; [PULIDO 1] P17-A: desde arriba, con un dolly-in leve por tiempo) y baja el logo contra el borde (`frameY` −1): el logo arranca abajo de la mitad, el lugar del CTA sale de donde el logo queda más grande y la coreografía dice lo mismo', `el logo arranca al ${String(ARRIBA_DEL_LOGO_EN_EL_CTA_SVH)} % del alto; antes, al 26`)
controlPositivo('el detector VE el logo de antes (centrado, a 16)', { distance: 16, height: 0, frameY: 0 } as PoseC, (p) => logoAbajo(p, arribaDelLogoEncuadrado(p.distance, p.frameY)))
const porQueD3 = sinComentarios(leer('_secciones/por-que-develop/PorQueDevelop.tsx'))
// [PULIDO 3B] B1 · el CTA es el de la transformación (`CtaTransformado.tsx`): el mismo centro, el mismo tope del display y la
// misma pantalla clavada en la lista.
const ctaD3B = sinComentarios(leer('_secciones/por-que-develop/CtaTransformado.tsx'))
const centrado = (f: string): boolean =>
  f.includes('className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center px-[var(--pad-lateral-compacto)] text-center"') &&
  // [PULIDO 5] D1 · «HABLANOS» en proporción con la frase, que creció: el lugar entre 2,8 (era entre 3,3); el mismo tope del display.
  f.includes("const TAMANO_DEL_CTA_EN_VOLUMEN = 'escritorio:text-[length:min(var(--text-fluido-display-xl),calc(var(--lugar-del-cta)/2.8))]'") &&
  f.includes('<div className="sticky top-0 flex min-h-[var(--alto-del-cta-en-lista)] flex-col items-center justify-center gap-[var(--spacing-8)] text-center">') &&
  ALTO_DEL_CTA_EN_LISTA_SVH === 100 && LUGAR_DEL_CTA_SVH > 30
afirmar(centrado(ctaD3B), '  el CTA al centro de la pantalla en escritorio (en el lugar que deja el logo, que da el tamaño) y en la lista (una pantalla, centrado en todos los anchos); «Hablanos» al display', `lugar ${String(LUGAR_DEL_CTA_SVH)} svh`)
controlPositivo('  el detector VE el CTA de la lista alineado a la izquierda', porQueD3.replace('flex-col items-center justify-center gap-[var(--spacing-8)] text-center', 'flex-col items-start justify-center gap-[var(--spacing-8)] tablet:items-center tablet:text-center'), centrado)

cerrar('s52-nocturno-final')
