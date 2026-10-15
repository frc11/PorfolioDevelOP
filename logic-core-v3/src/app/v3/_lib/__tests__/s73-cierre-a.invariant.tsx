/**
 * CIERRE A — LOS AJUSTES DECIDIDOS. Cada cosa con su control positivo (el detector ve el estado de antes o uno roto a propósito).
 *   A1 · el hover del navbar no inclina la cámara: la órbita del mouse ignora el puntero sobre la barra y los controles fijos (Contacto,
 *        Login, el sonido, el menú): se queda con el último valor válido y vuelve a seguirlo al salir. En todo el recorrido y en el pie.
 *        Y la vista previa del destino (al pasar por un ítem del menú) ya no gira la cámara: queda en la luz.
 */
import { readFileSync } from 'node:fs'
import { CONTROLES_FIJOS, PUNTERO_DE_LA_ORBITA, moverElPunteroDeLaOrbita, perseguirElPunteroDeLaOrbita } from '../escena/punteroDeLaOrbita'
import { perseguirAlPuntero } from '../escena/modulacionDeLaPose'
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

cerrar('s73-cierre-a')
