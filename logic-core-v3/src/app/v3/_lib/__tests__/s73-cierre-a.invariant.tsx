/**
 * CIERRE A — LOS AJUSTES DECIDIDOS. Cada cosa con su control positivo (el detector ve el estado de antes o uno roto a propósito).
 *   A1 · el hover del navbar no inclina la cámara: la órbita del mouse ignora el puntero sobre la barra y los controles fijos (Contacto,
 *        Login, el sonido, el menú): se queda con el último valor válido y vuelve a seguirlo al salir. En todo el recorrido y en el pie.
 *        Y la vista previa del destino (al pasar por un ítem del menú) ya no gira la cámara: queda en la luz.
 *   A2 · el pie, estable: la órbita del mouse al 40 % y el doble de amortiguada, de pie (el paralaje del recorrido, que entra con el pie)
 *        y acostado (la órbita del final).
 *   A3 · partículas y rayos sólo de noche: de día no hay cargas, arcos ni red; entran y se van con la noche de la energía (el factor del
 *        amanecer y el atardecer), cada una corrida por su azar, su luz y su tamaño juntos, sin saltos. El día de la energía se borró.
 *   A4 · la red de noche, estable: el temblor de los vértices al 20 % y más lento; el titileo, suave y lento.
 *   A6 · el indicador de progreso (el infinito con el porcentaje) se sacó en escritorio y en el teléfono; la esquina de abajo a la derecha,
 *        libre (el chatbot); el teléfono, el parlante a la izquierda y el menú al centro; en escritorio el parlante arriba a la izquierda.
 *   A7 · la caída del pie, un 35 % más corta: el reloj del final corre más rápido; la física, el golpe, el sonido, los huecos y la cámara
 *        cuelgan de él (sincronizados); el rebobinado, también un 35 % más corto.
 */
import { existsSync, readFileSync } from 'node:fs'
import { motionValue } from 'motion/react'
import { CONTROLES_FIJOS, ORBITA_EN_EL_PIE, PUNTERO_DE_LA_ORBITA, enElPie, escalaDeLaOrbita, moverElPunteroDeLaOrbita, perseguirElPunteroDeLaOrbita } from '../escena/punteroDeLaOrbita'
import { crearDesplazamiento, desplazamientoDelMouse, perseguirAlPuntero } from '../escena/modulacionDeLaPose'
import { MOUSE_TAU } from '../escena/choreographyPhysics'
import { ORBITA_DEL_MOUSE, nuevaOrbita, pasoDeLaOrbita } from '../escena/final/orbitaDelMouse'
import { TRAMOS_DEL_PIE } from '../escena/pie3d/coreografia'
import { PROGRESO_DEL_PIE } from '../pie3d/registro'
import { DE_NOCHE, f as glsl } from '../escena/energia/dibujo/comun'
import { FIN_DEL_GOLPE, LOGO_DE_SIEMPRE, REBOBINADO, RELOJ_DEL_FINAL, VIAJE_DEL_FINAL, pasoDelReloj, relojQuieto, segundosDelFinal, type EntradaDelReloj, type RelojDelFinal } from '../escena/final/recorridoDelFinal'
import { CAIDA_AL_HUECO, anguloEnElReloj } from '../escena/final/caidaAlHueco'
import { DIBUJO_DE_LA_RED, VERTICES_DE_LA_RED, armarLaRed } from '../escena/energia/dibujo/red'
import { TRAZO } from '../escena/energia/dibujo/arcos'
import * as THREE from 'three'
import { ANTICIPACION } from '../escena/interfaz/anticipacion'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const DT = 1 / 60
const leer = (ruta: string): string => readFileSync(new URL(ruta, import.meta.url), 'utf8')

// ═══════════════════════════════════════════════════════════════════════════
titulo('A1 · La órbita del mouse ignora el puntero sobre la barra y los controles fijos: se queda con el último válido')

/**
 * Un paseo del mouse a 1440 × 900: abajo a la izquierda de la escena, sube a la barra y la recorre de punta a punta (Contacto, Login, el
 * sonido), y vuelve a la escena abajo a la derecha. La órbita (`perseguirElPunteroDeLaOrbita`, la del recorrido) se persigue tres segundos
 * en cada parada; lo que se mide es dónde quedó al final de la barra (tiene que ser el de la escena, no el de la barra) y al volver.
 */
interface Parada {
  readonly x: number
  readonly y: number
  readonly sobreUnControl: boolean
}
const PASEO: readonly Parada[] = [
  { x: 360, y: 700, sobreUnControl: false },
  { x: 200, y: 32, sobreUnControl: true },
  { x: 720, y: 32, sobreUnControl: true },
  { x: 1300, y: 32, sobreUnControl: true },
  { x: 1400, y: 860, sobreUnControl: true },
  { x: 1100, y: 600, sobreUnControl: false },
]
interface DelPaseo {
  readonly enLaBarra: { readonly x: number; readonly y: number }
  readonly alVolver: { readonly x: number; readonly y: number }
}
function pasear(filtra: boolean): DelPaseo {
  const p = PUNTERO_DE_LA_ORBITA
  p.x = 0
  p.y = 0
  p.hay = false
  const orbita = { x: 0, y: 0 }
  let enLaBarra = { x: 0, y: 0 }
  for (let k = 0; k < PASEO.length; k += 1) {
    const parada = PASEO[k]
    moverElPunteroDeLaOrbita(p, parada.x, parada.y, 1440, 900, filtra && parada.sobreUnControl)
    // El de r3f sigue al cursor siempre (también sobre la barra): la órbita no lo tiene que tomar.
    const r3f = { x: (parada.x / 1440) * 2 - 1, y: 1 - (parada.y / 900) * 2 }
    for (let t = 0; t < 180; t += 1) perseguirElPunteroDeLaOrbita(orbita, false, r3f, DT)
    if (k === 4) enLaBarra = { x: orbita.x, y: orbita.y }
  }
  return { enLaBarra, alVolver: { x: orbita.x, y: orbita.y } }
}
const ESCENA_ANTES = { x: (360 / 1440) * 2 - 1, y: 1 - (700 / 900) * 2 }
const ESCENA_DESPUES = { x: (1100 / 1440) * 2 - 1, y: 1 - (600 / 900) * 2 }
const cerca = (a: { readonly x: number; readonly y: number }, b: { readonly x: number; readonly y: number }, tol: number): boolean => Math.hypot(a.x - b.x, a.y - b.y) <= tol
const quietaEnLaBarra = (x: DelPaseo): boolean => cerca(x.enLaBarra, ESCENA_ANTES, 0.02) && cerca(x.alVolver, ESCENA_DESPUES, 0.05)
const CON = pasear(true)
afirmar(quietaEnLaBarra(CON), `  la órbita al final de la barra queda en el último de la escena (${CON.enLaBarra.x.toFixed(3)}, ${CON.enLaBarra.y.toFixed(3)}; el de la escena ${ESCENA_ANTES.x.toFixed(3)}, ${ESCENA_ANTES.y.toFixed(3)}) y al volver sigue al cursor (${CON.alVolver.x.toFixed(3)}, ${CON.alVolver.y.toFixed(3)})`)
// El control: sin el filtro (la de antes) la órbita se va a la barra.
controlPositivo('  el detector VE la órbita de antes (sigue al cursor sobre la barra)', pasear(false), quietaEnLaBarra)
// Sin ningún movimiento válido todavía, el de r3f (no un cero clavado).
PUNTERO_DE_LA_ORBITA.hay = false
const sinDatos = { x: 0, y: 0 }
for (let t = 0; t < 120; t += 1) perseguirElPunteroDeLaOrbita(sinDatos, false, { x: 0.4, y: -0.3 }, DT)
afirmar(cerca(sinDatos, { x: 0.4, y: -0.3 }, 0.02), `  sin un movimiento válido todavía, sigue al de r3f (${sinDatos.x.toFixed(3)}, ${sinDatos.y.toFixed(3)})`)
// La amortiguación es la de siempre: el mismo paso que `perseguirAlPuntero` con el mismo objetivo.
PUNTERO_DE_LA_ORBITA.hay = false
const igualA = { x: 0, y: 0 }
const igualB = { x: 0, y: 0 }
perseguirElPunteroDeLaOrbita(igualA, false, { x: 0.5, y: 0.5 }, DT)
perseguirAlPuntero(igualB, 0.5, 0.5, DT)
afirmar(igualA.x === igualB.x && igualA.y === igualB.y, `  el mismo amortiguado que antes (${igualA.x.toFixed(4)} = ${igualB.x.toFixed(4)})`)

/** Los controles del selector: cada uno existe en el chrome (un selector que no nombra nada real no congela nada). */
const PIEZAS: readonly (readonly [string, string])[] = [
  ['barra', '../../_chrome/barra/BarraDelHome.tsx'],
  ['sonido-de-la-esquina', '../../_chrome/sonido/ControlDelSonido.tsx'],
  ['control-del-sonido', '../../_chrome/sonido/ControlDelSonido.tsx'],
  ['menu-movil', '../../_chrome/menu/MenuMovil.tsx'],
  ['vidrio', '../../_chrome/menu/MenuDeVidrio.tsx'],
]
const nombradas = (selector: string): string[] => Array.from(selector.matchAll(/data-pieza="([^"]+)"/g), (m) => m[1])
const cubre = (selector: string): boolean => PIEZAS.every(([pieza, archivo]) => nombradas(selector).includes(pieza) && leer(archivo).includes(pieza))
afirmar(cubre(CONTROLES_FIJOS), `  el selector nombra la barra, el sonido y el menú, y cada uno existe en el chrome (${nombradas(CONTROLES_FIJOS).join(', ')})`)
controlPositivo('  el detector VE un selector sin la barra', CONTROLES_FIJOS.replace('[data-pieza="barra"], ', ''), cubre)

// La vista previa del destino (al pasar por un ítem del menú) tampoco gira la cámara: queda en la luz (`s38` T2).
const sinGiroDeLaVista = (a: { readonly giroDeg: number }): boolean => a.giroDeg === 0
afirmar(sinGiroDeLaVista(ANTICIPACION), `  la vista previa del destino no gira la cámara (${String(ANTICIPACION.giroDeg)}°)`)
controlPositivo('  el detector VE la vista previa de antes (7°)', { giroDeg: 7 }, sinGiroDeLaVista)

/** El cableado: la órbita del recorrido (OrbitRig) y la del pie (FinalDelPie) pasan por el filtro. */
const ORBIT = leer('../escena/OrbitRig.tsx')
const FINAL = leer('../escena/final/FinalDelPie.tsx')
const cableado = (orbit: string, final: string): boolean =>
  orbit.includes('perseguirElPunteroDeLaOrbita(mouse, inclinado, state.pointer, delta)') &&
  !/perseguirAlPuntero\(\s*mouse/.test(orbit) &&
  /if \(e\.pointerType !== 'mouse' \|\| sobreUnControlFijo\(e\.target\)\) return/.test(final)
afirmar(cableado(ORBIT, FINAL), '  OrbitRig persigue el puntero de la órbita y FinalDelPie no toma los movimientos sobre un control fijo')
controlPositivo('  el detector VE el pie sin el filtro', [ORBIT, FINAL.replace(' || sobreUnControlFijo(e.target)', '')] as const, (x) => cableado(x[0], x[1]))

// ═══════════════════════════════════════════════════════════════════════════
titulo('A2 · El pie, estable: la órbita del mouse al 40 % y el doble de amortiguada, de pie y acostado')

/**
 * DE PIE: el paralaje del recorrido con el pie entero a la vista (su progreso en 1) contra fuera del pie (en 0): el mouse salta de un
 * costado al otro; el giro (el azimut, con la magnitud del cuadro) y cuánto del camino hizo en `MOUSE_TAU` (el amortiguado).
 */
interface DelSalto {
  readonly giro: number
  readonly aTau: number
}
function salto(progresoDelPie: number): DelSalto {
  PROGRESO_DEL_PIE.valor = motionValue(progresoDelPie)
  const p = PUNTERO_DE_LA_ORBITA
  const estado = { x: -1, y: 0 }
  const d = crearDesplazamiento()
  p.hay = true
  p.x = 1
  p.y = 0
  let aTau = 0
  for (let t = 0; t < 600; t += 1) {
    perseguirElPunteroDeLaOrbita(estado, false, { x: 0, y: 0 }, DT)
    if (Math.abs((t + 1) * DT - MOUSE_TAU) < DT / 2) aTau = (estado.x + 1) / 2
  }
  const fin = desplazamientoDelMouse(d, estado, 20, escalaDeLaOrbita(), 1).angleDeg
  const ini = desplazamientoDelMouse(d, { x: -1, y: 0 }, 20, escalaDeLaOrbita(), 1).angleDeg
  PROGRESO_DEL_PIE.valor = null
  return { giro: fin - ini, aTau }
}
const FUERA = salto(0)
const DE_PIE = salto(1)
const dePieBien = (pie: DelSalto, fuera: DelSalto): boolean => Math.abs(pie.giro / fuera.giro - ORBITA_EN_EL_PIE.escala) < 0.03 && ORBITA_EN_EL_PIE.escala <= 0.45 && fuera.aTau > 0.6 && pie.aTau < 0.75 * fuera.aTau
afirmar(dePieBien(DE_PIE, FUERA), `  de pie: el giro de costado a costado ${DE_PIE.giro.toFixed(2)}° (fuera del pie ${FUERA.giro.toFixed(2)}°: el ${((DE_PIE.giro / FUERA.giro) * 100).toFixed(0)} %) y en ${String(MOUSE_TAU)} s hizo el ${(DE_PIE.aTau * 100).toFixed(0)} % del camino (fuera, el ${(FUERA.aTau * 100).toFixed(0)} %)`)
controlPositivo('  el detector VE el pie de antes (el mismo paralaje que fuera)', FUERA, (x: DelSalto) => dePieBien(x, FUERA))
// Entra con el pie, sin salto: de 0 (asoma) a entero cuando llega su primera pieza, sin escalones.
const rampa = Array.from({ length: 1001 }, (_, k) => {
  PROGRESO_DEL_PIE.valor = motionValue(k / 1000)
  return enElPie()
})
PROGRESO_DEL_PIE.valor = null
const rampaBien = (r: readonly number[]): boolean => r[0] === 0 && r[Math.ceil(TRAMOS_DEL_PIE[0].desde * 1000)] === 1 && r.every((v, k) => k === 0 || (v >= r[k - 1] && v - r[k - 1] < 0.01))
afirmar(rampaBien(rampa) && enElPie() === 0, `  entra con el pie sin salto (de 0 a entero en su progreso 0 a ${String(TRAMOS_DEL_PIE[0].desde)}); sin el pie, entera`)
controlPositivo('  el detector VE una entrada de golpe', rampa.map((v) => (v > 0 ? 1 : 0)), rampaBien)

/** ACOSTADO: la órbita del final, de un costado al otro con el quieto entero: el rango y la velocidad máxima (grados por segundo). */
interface DeLaOrbita {
  readonly h: number
  readonly v: number
  readonly velocidad: number
}
const o = { ...nuevaOrbita(), deja: 1 }
for (let t = 0; t < 600; t += 1) pasoDeLaOrbita(o, { x: -1, y: -1, aspecto: 900 / 1440 }, true, DT)
const h0 = o.h
let velocidad = 0
for (let t = 0; t < 600; t += 1) {
  const antes = o.h
  pasoDeLaOrbita(o, { x: 1, y: 1, aspecto: 900 / 1440 }, true, DT)
  velocidad = Math.max(velocidad, Math.abs(o.h - antes) / DT)
}
const ACOSTADO: DeLaOrbita = { h: (o.h - h0) / 2, v: o.v, velocidad }
// La de antes: ±22° y ±12° con 0,45 s (la velocidad máxima de un salto de punta a punta: el rango entero sobre la constante de tiempo).
const ANTES: DeLaOrbita = { h: 22, v: 12, velocidad: (2 * 22) / 0.45 }
const acostadoBien = (x: DeLaOrbita): boolean => Math.abs(x.h / ANTES.h - 0.4) < 0.03 && Math.abs(x.v / ANTES.v - 0.4) < 0.03 && x.velocidad < 0.3 * ANTES.velocidad && ORBITA_DEL_MOUSE.amortiguaS >= 2 * 0.45
afirmar(acostadoBien(ACOSTADO), `  acostado: ±${ACOSTADO.h.toFixed(2)}° y ±${ACOSTADO.v.toFixed(2)}° (antes ±22° y ±12°), de punta a punta a lo sumo ${ACOSTADO.velocidad.toFixed(1)}°/s (antes ${ANTES.velocidad.toFixed(1)}), amortiguada ${String(ORBITA_DEL_MOUSE.amortiguaS)} s`)
controlPositivo('  el detector VE la órbita acostada de antes', ANTES, acostadoBien)
// El cableado: la magnitud del paralaje del recorrido pasa por la del pie.
const conLaEscala = (orbit: string): boolean => orbit.includes('desplazamientoDelMouse(desplazamiento, mouse, distance, rigValues.mouseScale * escalaDeLaOrbita(), rigValues.progress)')
afirmar(conLaEscala(leer('../escena/OrbitRig.tsx')), '  OrbitRig: el paralaje del recorrido con la escala del pie')
controlPositivo('  el detector VE el paralaje sin la escala', leer('../escena/OrbitRig.tsx').replace(' * escalaDeLaOrbita()', ''), conLaEscala)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A3 · Partículas y rayos sólo de noche: entran y se van con la noche, cada una corrida, sin saltos; sin el día')

/**
 * La entrada (`deNoche`, la misma cuenta que el sombreador): con la noche de la energía `n` (0 de día, 1 de noche) y el azar de cada una.
 * Lo que se mide sobre 200 azares y la noche de 0 a 1 en pasos de 0,001: de día (n = 0) ninguna; de noche entera (n = 1) todas; ningún
 * salto (el mayor cambio de un paso al siguiente); cada una sube sin volver; y el desfase: a mitad del cambio, unas enteras y otras nada.
 */
type Entrada = (azar: number, n: number) => number
const suave = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const DE_NOCHE_TS: Entrada = (azar, n) => suave(DE_NOCHE.desde + azar * DE_NOCHE.desfase, DE_NOCHE.desde + azar * DE_NOCHE.desfase + DE_NOCHE.ancho, n)
interface DeLaEntrada {
  readonly deDia: number
  readonly deNoche: number
  readonly salto: number
  readonly vuelve: boolean
  readonly enteras: number
  readonly nada: number
}
function entrada(e: Entrada): DeLaEntrada {
  let deDia = 0
  let deNoche = 1
  let salto = 0
  let vuelve = false
  let enteras = 0
  let nada = 0
  for (let k = 0; k < 200; k += 1) {
    const azar = (k + 0.5) / 200
    deDia = Math.max(deDia, e(azar, 0))
    deNoche = Math.min(deNoche, e(azar, 1))
    let antes = e(azar, 0)
    for (let i = 1; i <= 1000; i += 1) {
      const v = e(azar, i / 1000)
      salto = Math.max(salto, Math.abs(v - antes))
      if (v < antes - 1e-12) vuelve = true
      antes = v
    }
    const medio = e(azar, 0.5)
    if (medio > 0.99) enteras += 1
    if (medio < 0.01) nada += 1
  }
  return { deDia, deNoche, salto, vuelve, enteras, nada }
}
const entradaBien = (x: DeLaEntrada): boolean => x.deDia === 0 && x.deNoche === 1 && x.salto < 0.01 && !x.vuelve && x.enteras >= 20 && x.nada >= 20
const ENTRADA = entrada(DE_NOCHE_TS)
afirmar(entradaBien(ENTRADA), `  de día ninguna (${String(ENTRADA.deDia)}), de noche todas (${String(ENTRADA.deNoche)}), sin saltos (a lo sumo ${ENTRADA.salto.toFixed(4)} por milésima de noche) y corridas: a mitad del cambio ${String(ENTRADA.enteras)} de 200 enteras y ${String(ENTRADA.nada)} nada`)
controlPositivo('  el detector VE una entrada sin desfase (todas a la vez)', entrada((_, n) => suave(0.3, 0.8, n)), entradaBien)
controlPositivo('  y una de golpe (pop)', entrada((azar, n) => (n >= 0.1 + 0.8 * azar ? 1 : 0)), entradaBien)
controlPositivo('  y la de día (la de antes: ya se ve con la noche en cero)', entrada((azar, n) => 0.4 + 0.6 * DE_NOCHE_TS(azar, n)), entradaBien)

/** El sombreador hace la misma cuenta, y cada dibujo la usa en su luz y en su tamaño (las cargas, su reflejo, los arcos, su halo, la red, los efectos). */
const DIBUJO = (archivo: string): string => leer(`../escena/energia/dibujo/${archivo}`)
const FUENTES_A3 = { comun: DIBUJO('comun.ts'), particulas: DIBUJO('particulas.ts'), arcos: DIBUJO('arcos.ts'), reflejos: DIBUJO('reflejos.ts'), efectos: DIBUJO('efectos.ts'), red: DIBUJO('red.ts') }
type FuentesA3 = typeof FUENTES_A3
const cableadoA3 = (x: FuentesA3): boolean =>
  x.comun.includes('float desde = ${f(DE_NOCHE.desde)} + azar * ${f(DE_NOCHE.desfase)};') && x.comun.includes('return smoothstep( desde, desde + ${f(DE_NOCHE.ancho)}, uNoche );') &&
  x.comun.includes('gl_FragColor = vec4( alTono( noche ), 0.0 );') &&
  x.particulas.includes('float vive = deNoche( azar01( id, 34u ) );') && x.particulas.includes('radio *= max( 0.02, nacer.x ) * vive;') && x.particulas.includes('* nacer.y * vive;') && x.particulas.includes('if ( vive <= 0.0 ||') &&
  x.reflejos.includes('float vive = deNoche( azar01( id, 34u ) );') && x.reflejos.includes('* vive * uPixel;') && x.reflejos.includes('* nacer.y * vive;') &&
  (x.arcos.match(/float vive = deNoche\( azarDeLaSemilla\( aExtra\.y \) \);/g) ?? []).length === 2 && (x.arcos.match(/vGolpe = aForma\.z \* vive;/g) ?? []).length === 2 &&
  x.arcos.includes('* uPixel * afina * vive;') && x.arcos.includes('* afina * ${f(HALO_DEL_ARCO.radio)} ) * vive;') &&
  x.efectos.includes('float k = vEfecto.z * deNoche( vSemilla );') && x.red.includes('canalDelArco( r.punto, r.antes, r.despues, r.forma, r.extra );') && x.red.includes('haloDelArco( r.punto, r.despues, r.forma, r.extra );') &&
  x.red.includes('enElFinal( r.punto - uCentro ) * uTopeDeLaRed;')
afirmar(cableadoA3(FUENTES_A3), '  la cuenta del sombreador es la misma (con sus constantes) y la usan las cargas (luz y tamaño), su reflejo, los arcos y su halo (luz y ancho), la red (con el mismo canal) y los efectos; la salida, sólo luz')
controlPositivo('  el detector VE las cargas que entran sólo de brillo (sin la escala)', { ...FUENTES_A3, particulas: FUENTES_A3.particulas.replace('radio *= max( 0.02, nacer.x ) * vive;', 'radio *= max( 0.02, nacer.x );') }, cableadoA3)
controlPositivo('  y los arcos sin la entrada', { ...FUENTES_A3, arcos: FUENTES_A3.arcos.replace('vGolpe = aForma.z * vive;', 'vGolpe = aForma.z;') }, cableadoA3)
controlPositivo('  y la red con su tope de día', { ...FUENTES_A3, red: FUENTES_A3.red.replace('* uTopeDeLaRed;', '* mix( 1.0, uTopeDeLaRed, uNoche );') }, cableadoA3)
// La cuenta del sombreador, con los números puestos (lo que ve la GPU).
afirmar(glsl(DE_NOCHE.desde) === '0.02' && DE_NOCHE.desde > 0 && DE_NOCHE.desde + DE_NOCHE.desfase + DE_NOCHE.ancho <= 1, `  de día nada (desde ${String(DE_NOCHE.desde)}) y de noche entera todas (hasta ${String(DE_NOCHE.desde + DE_NOCHE.desfase + DE_NOCHE.ancho)})`)

/** Sin el día: ni su módulo, ni sus uniformes, ni lo que tapaba (alfa), ni la copia del cuadro que pedía; la noche de la energía, la del amanecer. */
const PLASMA_A3 = leer('../escena/energia/PlasmaYCargas.tsx')
const sinElDia = (x: FuentesA3, plasma: string): boolean =>
  !existsSync(new URL('../escena/energia/dibujo/dia.ts', import.meta.url)) && !Object.values(x).some((t) => /uTintaDia|uClaroDia|colorDia|aDia\b|uDia\b|uDiaForma|uCalorDia|uArcoDia|uDiaDelArco|uDiaDeLaCarga/.test(t)) &&
  !/colorEsteCuadro|aplicarElDia/.test(plasma) && plasma.includes('u.uNoche.value = nocheDeLaEnergia(VIVO.uNoche.value, AMANECER_EN_VIVO.uBarridoDelDia.value, AMANECER_EN_VIVO.uFrenteDelDia.value)')
afirmar(sinElDia(FUENTES_A3, PLASMA_A3), '  sin el día de la energía: ni `dia.ts`, ni la tinta, ni lo que tapaba, ni el calor sobre la copia del cuadro; la noche, la del amanecer y el atardecer')
controlPositivo('  el detector VE la tinta de día de vuelta', { ...FUENTES_A3, arcos: `${FUENTES_A3.arcos}\nuniform vec3 uTintaDia;` }, (x: FuentesA3) => sinElDia(x, PLASMA_A3))
controlPositivo('  y la copia del cuadro pedida de día', FUENTES_A3, (x: FuentesA3) => sinElDia(x, `${PLASMA_A3}\nif (u.uNoche.value < 0.97) PEDIDOS_DEL_PASE.colorEsteCuadro = true`))

// ═══════════════════════════════════════════════════════════════════════════
titulo('A4 · La red de noche, estable: el temblor al 20 % y más lento, el titileo suave')

/**
 * Lo que mueve a un rayo quieto, con la cuenta del sombreador (`tiembla` y `titila`): el temblor de un punto (su amplitud, en partes del
 * largo del enlace, y su velocidad más alta: la amplitud por el ritmo más rápido) y el titileo (cuánto baja el brillo y su ritmo más
 * rápido, con la semilla en 1). La de antes: 0,012 del largo a 19 + 14 rad/s y el titileo de 0,3 a 4 + 5 rad/s.
 */
interface DelRayo {
  readonly amplitud: number
  readonly velocidad: number
  readonly titileo: number
  readonly ritmo: number
}
const delRayo = (temblor: number, ritmos: { readonly temblor: readonly number[]; readonly titileo: readonly number[] }, titileo: number): DelRayo => ({
  amplitud: temblor * Math.sqrt(3),
  velocidad: temblor * Math.sqrt(3) * (ritmos.temblor[0] + ritmos.temblor[1]) * 1.31,
  titileo,
  ritmo: ritmos.titileo[0] + ritmos.titileo[1],
})
const RAYO_ANTES = delRayo(0.012, { temblor: [19, 14], titileo: [4, 5] }, 0.3)
const RAYO = delRayo(DIBUJO_DE_LA_RED.uRed[3], DIBUJO_DE_LA_RED.ritmos, DIBUJO_DE_LA_RED.uRed[2])
const establesBien = (x: DelRayo): boolean =>
  Math.abs(x.amplitud / RAYO_ANTES.amplitud - 0.2) < 0.03 && x.velocidad <= 0.1 * RAYO_ANTES.velocidad && x.titileo <= 0.5 * RAYO_ANTES.titileo && x.titileo > 0 && x.ritmo <= 0.5 * RAYO_ANTES.ritmo
afirmar(establesBien(RAYO), `  el temblor al ${((RAYO.amplitud / RAYO_ANTES.amplitud) * 100).toFixed(0)} % (${DIBUJO_DE_LA_RED.uRed[3].toFixed(4)} del largo) y a lo sumo ${RAYO.velocidad.toFixed(3)} largos por segundo (antes ${RAYO_ANTES.velocidad.toFixed(3)}); el titileo baja ${String(RAYO.titileo)} (antes ${String(RAYO_ANTES.titileo)}) a lo sumo a ${String(RAYO.ritmo)} rad/s (antes ${String(RAYO_ANTES.ritmo)}): viva, no apagada`)
controlPositivo('  el detector VE la red de antes (el temblor rápido y el titileo hondo)', RAYO_ANTES, establesBien)
controlPositivo('  y una sólo menos amplia (el mismo ritmo)', delRayo(DIBUJO_DE_LA_RED.uRed[3], { temblor: [19, 14], titileo: [4, 5] }, DIBUJO_DE_LA_RED.uRed[2]), establesBien)
// El sombreador, con los ritmos de la tabla.
const ritmosEnElSombreador = (v: string): boolean =>
  v.includes(`float w = ${glsl(DIBUJO_DE_LA_RED.ritmos.temblor[0])} + ${glsl(DIBUJO_DE_LA_RED.ritmos.temblor[1])} * azarDe( s, 60.0 + k );`) &&
  v.includes(`uTiempo * ( ${glsl(DIBUJO_DE_LA_RED.ritmos.titileo[0])} + b.w * ${glsl(DIBUJO_DE_LA_RED.ritmos.titileo[1])} )`) && v.includes('return puntoDe( A, B, s, rama, i ) + d * uRed.w * length( B - A );')
afirmar(ritmosEnElSombreador(VERTICES_DE_LA_RED), '  el sombreador de la red usa esos ritmos y esa amplitud')
controlPositivo('  el detector VE el ritmo de antes en el sombreador', VERTICES_DE_LA_RED.replace(`float w = ${glsl(DIBUJO_DE_LA_RED.ritmos.temblor[0])} +`, 'float w = 19.0 +'), ritmosEnElSombreador)
// La luz que corre por el canal: la de la red, casi quieta (la de los arcos, igual); su material la lleva propia.
const formaDeLaRed = (armarLaRed(4, {}).malla.material as THREE.ShaderMaterial).uniforms.uArcoForma.value as THREE.Vector4
const correBien = (corre: number): boolean => corre > 0 && corre <= 0.3 * TRAZO.uArcoForma[2]
afirmar(correBien(formaDeLaRed.z) && formaDeLaRed.x === TRAZO.uArcoForma[0] && formaDeLaRed.y === TRAZO.uArcoForma[1], `  la luz que corre por los rayos de la red, ${String(formaDeLaRed.z)} (la de los arcos, ${String(TRAZO.uArcoForma[2])}): el mismo canal, casi quieto`)
controlPositivo('  el detector VE la luz que corre de los arcos en la red (la de antes)', TRAZO.uArcoForma[2], correBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A6 · Sin el indicador de progreso: la esquina de abajo a la derecha libre; el parlante a la izquierda y el menú al centro')

/**
 * Lo fijo del chrome: cada caja `fixed` de sus componentes y adónde se ancla (sus clases de lugar). La esquina de abajo a la derecha está
 * libre si ninguna se ancla abajo Y a la derecha a la vez (en ningún ancho). El indicador (el infinito del recorrido) no existe ni se
 * monta; el parlante: abajo de 1024 arriba a la izquierda (con el menú al centro, en el mismo eje), en escritorio arriba a la izquierda,
 * en la fila de la barra (el alto de la barra y el vidrio de Contacto y Login).
 */
const CHROME_A6 = ['ChromeDelHome.tsx', 'sonido/EsquinaDelSonido.tsx', 'sonido/ControlDelSonido.tsx', 'menu/MenuMovil.tsx', 'barra/BarraDelHome.tsx'].map((f) => leer(`../../_chrome/${f}`))
const cajasFijas = (fuentes: readonly string[]): string[] => fuentes.flatMap((t) => Array.from(t.matchAll(/className="([^"]*\bfixed\b[^"]*)"/g), (m) => m[1]))
const abajoALaDerecha = (clases: string): boolean => /(^|\s)([a-z-]+:)*bottom-/.test(clases) && /(^|\s)([a-z-]+:)*right-/.test(clases)
const esquinaLibre = (fuentes: readonly string[]): boolean => cajasFijas(fuentes).length > 0 && !cajasFijas(fuentes).some(abajoALaDerecha) && !fuentes.some((t) => /InfinitoDelRecorrido|infinito-del-recorrido|esquina-del-recorrido/.test(t))
afirmar(esquinaLibre(CHROME_A6) && !existsSync(new URL('../../_chrome/recorrido/InfinitoDelRecorrido.tsx', import.meta.url)), `  la esquina de abajo a la derecha, libre: ninguna de las ${String(cajasFijas(CHROME_A6).length)} cajas fijas del chrome se ancla abajo y a la derecha; el infinito no existe ni se monta`)
controlPositivo('  el detector VE la esquina del infinito (la de antes)', [...CHROME_A6, '<div data-pieza="esquina-del-recorrido" className="pointer-events-none fixed right-[var(--spacing-4)] bottom-[var(--spacing-4)]">'], esquinaLibre)
const ESQUINA_A6 = leer('../../_chrome/sonido/EsquinaDelSonido.tsx')
const SONIDO_A6 = leer('../../_chrome/sonido/ControlDelSonido.tsx')
const MENU_A6 = leer('../../_chrome/menu/MenuMovil.tsx')
const ARRIBA_A6 = 'top-[max(var(--spacing-4),env(safe-area-inset-top))]'
const lugaresBien = (esquina: string, sonido: string, menu: string): boolean => {
  const delMenu = /data-parte="boton-del-menu"[\s\S]*?className="([^"]*)"/.exec(menu)?.[1] ?? ''
  return esquina.includes(`fixed ${ARRIBA_A6} left-[max(var(--spacing-4),env(safe-area-inset-left))]`) && esquina.includes('escritorio:top-[var(--spacing-6)] escritorio:left-[var(--pad-lateral-compacto)]') &&
    delMenu.split(' ').includes(ARRIBA_A6) && delMenu.includes('inset-x-0') && delMenu.includes('mx-auto') &&
    sonido.includes('escritorio:size-[calc(var(--spacing-3)*2+var(--text-cuerpo)*var(--leading-texto))]') && sonido.includes('escritorio:bg-[var(--color-superficie-translucida)] escritorio:backdrop-blur-[var(--blur-panel)]')
}
afirmar(lugaresBien(ESQUINA_A6, SONIDO_A6, MENU_A6), '  el teléfono: el parlante arriba a la izquierda y el menú al centro (el mismo eje, la zona segura); escritorio: el parlante arriba a la izquierda, del alto de la barra y en su vidrio, enfrente de Contacto y Login')
controlPositivo('  el detector VE el parlante de escritorio abajo a la derecha (el de antes)', ESQUINA_A6.replace('escritorio:top-[var(--spacing-6)] escritorio:left-[var(--pad-lateral-compacto)]', 'escritorio:right-[var(--spacing-6)] escritorio:bottom-[var(--spacing-6)]'), (e: string) => lugaresBien(e, SONIDO_A6, MENU_A6))

// ═══════════════════════════════════════════════════════════════════════════
titulo('A7 · La caída del pie, un 35 % más corta: el reloj del final más rápido, con la física y las sincronías; el rebobinado acompaña')

/**
 * La corrida sola (al fondo, con el pie entero, sin gestos) con el reloj del final, cuadro a cuadro: cuánto dura de verdad, cuándo cruza
 * el golpe (`FIN_DEL_GOLPE`: el sonido, la súper onda y el filo se disparan ahí) y el ángulo del logo en el tiempo de verdad (la física:
 * baja, vuelca cada vez más rápido —la gravedad—, toca y rebota). Todo lo de la caída es función de `fin` (los huecos por el ángulo, la
 * cámara por `fin`): con el reloj más rápido van juntos.
 */
const DT_A7 = 1 / 240
const ENTRA: EntradaDelReloj = { alFondo: true, pieEntero: true, rebobinar: false, haciaAbajo: false, sinGestoS: 0, viajeS: 0 }
type PasoA7 = (r: RelojDelFinal, e: EntradaDelReloj, dt: number) => void
interface DeLaCorrida {
  readonly duraS: number
  readonly golpeS: number
  readonly aceleraAntes: boolean
  readonly rebota: boolean
}
function corrida(paso: PasoA7): DeLaCorrida {
  const r = relojQuieto()
  let t = 0
  let golpe = Number.NaN
  const angulos: number[] = []
  for (let i = 0; i < 20 * 240 && r.fin < 1; i += 1) {
    const antes = r.fin
    paso(r, ENTRA, DT_A7)
    t += DT_A7
    if (antes < FIN_DEL_GOLPE && r.fin >= FIN_DEL_GOLPE) golpe = t
    angulos.push(anguloEnElReloj(LOGO_DE_SIEMPRE, segundosDelFinal(r.fin)).a)
  }
  // La velocidad del vuelco (rad/s de verdad) en el último cuarto de segundo antes del golpe: crece (la gravedad); y después del golpe
  // el ángulo vuelve a bajar un poco (el rebote) antes de asentarse.
  const k = Math.round(golpe / DT_A7)
  const vel = (j: number): number => (angulos[j] - angulos[j - 12]) / (12 * DT_A7)
  const aceleraAntes = k > 120 && vel(k - 2) > vel(k - 30) && vel(k - 30) > vel(k - 60) && vel(k - 60) > 0
  const despues = angulos.slice(k, k + Math.round(0.6 / DT_A7))
  const rebota = despues.some((a, j) => j > 0 && a < despues[j - 1] - 1e-4)
  return { duraS: t, golpeS: golpe, aceleraAntes, rebota }
}
const CORRIDA = corrida(pasoDelReloj)
// El de antes: el mismo reloj a un segundo suyo por segundo (con su arranque, la inercia del reloj, a esa escala).
const pasoDeAntes: PasoA7 = (r, e, dt) => pasoDelReloj(r, e, dt / RELOJ_DEL_FINAL.ritmo)
const ANTES_A7 = corrida(pasoDeAntes)
const corridaBien = (c: DeLaCorrida, antes: DeLaCorrida): boolean =>
  Math.abs(c.duraS / antes.duraS - 0.65) < 0.02 && Math.abs(c.golpeS / antes.golpeS - 0.65) < 0.02 && c.aceleraAntes && c.rebota && antes.aceleraAntes && antes.rebota
afirmar(corridaBien(CORRIDA, ANTES_A7), `  sola dura ${CORRIDA.duraS.toFixed(2)} s (antes ${ANTES_A7.duraS.toFixed(2)}: el ${((CORRIDA.duraS / ANTES_A7.duraS) * 100).toFixed(0)} %) y el golpe cae a los ${CORRIDA.golpeS.toFixed(2)} s (antes ${ANTES_A7.golpeS.toFixed(2)}: en su mismo lugar del reloj, ${String(CAIDA_AL_HUECO.golpeS)} de ${String(RELOJ_DEL_FINAL.duracionS)}); el vuelco acelera hasta el golpe y rebota`)
controlPositivo('  el detector VE la caída de antes (la misma duración)', ANTES_A7, (c: DeLaCorrida) => corridaBien(c, ANTES_A7))
// El rebobinado acompaña: desde el final entero y en un viaje del menú, el 65 % de lo de antes (1,4 s y 1 s).
const rebobinadoBien = (tope: number, minimo: number, dentro: number): boolean => Math.abs(tope / 1.4 - 0.65) < 0.01 && Math.abs(minimo / 1 - 0.65) < 0.01 && Math.abs(dentro / 1 - 0.65) < 0.01
afirmar(rebobinadoBien(REBOBINADO.topeS, REBOBINADO.minimoS, VIAJE_DEL_FINAL.dentroS), `  el rebobinado acompaña: desde el final entero ${String(REBOBINADO.topeS)} s (era 1,4), su mínimo ${String(REBOBINADO.minimoS)} (era 1) y en un viaje ${String(VIAJE_DEL_FINAL.dentroS)} (era 1)`)
controlPositivo('  el detector VE el rebobinado de antes', [1.4, 1, 1] as const, (x: readonly number[]) => rebobinadoBien(x[0], x[1], x[2]))

cerrar('s73-cierre-a')
