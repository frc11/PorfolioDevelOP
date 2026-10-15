/**
 * CIERRE A — LOS AJUSTES DECIDIDOS. Cada cosa con su control positivo (el detector ve el estado de antes o uno roto a propósito).
 *   A1 · el hover del navbar no inclina la cámara: la órbita del mouse ignora el puntero sobre la barra y los controles fijos (Contacto,
 *        Login, el sonido, el menú): se queda con el último valor válido y vuelve a seguirlo al salir. En todo el recorrido y en el pie.
 *        Y la vista previa del destino (al pasar por un ítem del menú) ya no gira la cámara: queda en la luz.
 *   A2 · el pie, estable: la órbita del mouse al 40 % y el doble de amortiguada, de pie (el paralaje del recorrido, que entra con el pie)
 *        y acostado (la órbita del final).
 */
import { readFileSync } from 'node:fs'
import { motionValue } from 'motion/react'
import { CONTROLES_FIJOS, ORBITA_EN_EL_PIE, PUNTERO_DE_LA_ORBITA, enElPie, escalaDeLaOrbita, moverElPunteroDeLaOrbita, perseguirElPunteroDeLaOrbita } from '../escena/punteroDeLaOrbita'
import { crearDesplazamiento, desplazamientoDelMouse, perseguirAlPuntero } from '../escena/modulacionDeLaPose'
import { MOUSE_TAU } from '../escena/choreographyPhysics'
import { ORBITA_DEL_MOUSE, nuevaOrbita, pasoDeLaOrbita } from '../escena/final/orbitaDelMouse'
import { TRAMOS_DEL_PIE } from '../escena/pie3d/coreografia'
import { PROGRESO_DEL_PIE } from '../pie3d/registro'
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

cerrar('s73-cierre-a')
