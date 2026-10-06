/**
 * RETOQUE DEL ENCASTRE — el invariante: npm run test:s51-retoque-encastre
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por ticket:
 *   1A · sin partículas: el vapor se fue entero (se abre el hueco y el logo encaja).
 *   1B · el hueco del tono del piso, un poco más sombreado adentro (no negro); el labio, apenas, y se va al quedar al ras.
 *   1C · sin línea blanca: el piso pisa el borde del logo y queda un pelo debajo de su cara al ras (sin rendija).
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-encastre/mirar.txt`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'

import * as THREE from 'three'

import { CALMA_EN_EL_PISO, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import { HUECO, crearElPozo, trazoDelBorde } from '../escena/final/hueco'
import { poseDelLogo } from '../escena/final/recorridoDelFinal'
import { SIMULACION_GLSL } from '../escena/piso/bloques'
import { conOndaDirigida } from '../escena/piso/ondaDirigida'
import { FLOOR_Y, PAPER_COLOR, PROBE_EXTRUDE, PROBE_SVG_SCALE } from '../escena/probeScene'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1A · Sin partículas: el vapor se fue entero (subida, caída y posado); se abre el hueco y el logo encaja')

const FINAL = '_lib/escena/final'
const delFinal = readdirSync(`${V3}/${FINAL}`).filter((a) => /\.tsx?$/.test(a))
const fuentesDelFinal = delFinal.map((a) => sinComentarios(leer(`${FINAL}/${a}`)))
const componenteDelFinal = sinComentarios(leer(`${FINAL}/FinalDelPie.tsx`))
const sinParticulas = (fuentes: readonly string[], componente: string): boolean =>
  !existsSync(`${V3}/${FINAL}/vapor.ts`) && !existsSync(`${V3}/${FINAL}/explosion.ts`) && fuentes.every((f) => !/THREE\.Points|PointsMaterial|\bvapor\b/i.test(f)) && componente.includes('g.add(estado.pozo.grupo)')
afirmar(sinParticulas(fuentesDelFinal, componenteDelFinal), 'en el final no hay partículas: ningún `Points` en `final/`, sin `vapor.ts` (ni la explosión de CIERRE); al grupo del final sólo se le suma el pozo', `${String(delFinal.length)} archivos en final/`)
controlPositivo('el detector VE el vapor de EL ENCASTRE (sus puntos en el grupo del final)', [fuentesDelFinal, componenteDelFinal.replace('g.add(estado.pozo.grupo)', 'g.add(estado.vapor.puntos, estado.pozo.grupo)')] as const, ([f, c]: readonly [readonly string[], string]) => sinParticulas([...f, c], c))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1B · El hueco del tono del piso, un poco más sombreado adentro (no negro); el labio, apenas, y se va al quedar al ras')

const TAM = { alto: 4.78, espesor: 0.56 } as const
const cuadrado = new THREE.Shape([new THREE.Vector2(-1, -1), new THREE.Vector2(1, -1), new THREE.Vector2(1, 1), new THREE.Vector2(-1, 1)])
const pozo = crearElPozo([cuadrado], TAM.espesor)
const [paredes, fondo] = pozo.grupo.children as THREE.Mesh[]
const colorDe = (m: THREE.Material | THREE.Material[]): THREE.Color => ((Array.isArray(m) ? m[1] : m) as THREE.MeshStandardMaterial).color
const luz = (c: THREE.Color): number => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
const papel = luz(new THREE.Color(PAPER_COLOR))
// Del papel del piso, más sombreado adentro: las paredes entre el 75 % y el papel, el fondo más oscuro que ellas (y no negro).
const tonoDelPiso = (pared: THREE.Color, deFondo: THREE.Color): boolean => luz(pared) < papel && luz(pared) >= 0.75 * papel && luz(deFondo) < luz(pared) && luz(deFondo) >= 0.6 * papel
const [pared, deFondo] = [colorDe(paredes.material), colorDe(fondo.material)]
afirmar(tonoDelPiso(pared, deFondo), 'las paredes y el fondo del pozo son el papel del piso, un poco más sombreado adentro (el fondo, más que las paredes): ni negro ni tinta', `pared ${(luz(pared) / papel).toFixed(2)} · fondo ${(luz(deFondo) / papel).toFixed(2)} del papel`)
controlPositivo('el detector VE el pozo de tinta de EL ENCASTRE', [new THREE.Color('#2a2a2a'), new THREE.Color('#121212')] as const, ([a, b]: readonly [THREE.Color, THREE.Color]) => tonoDelPiso(a, b))
pozo.soltar()
const enElPisoTs = sinComentarios(leer('_lib/escena/final/enElPiso.ts'))
const labioBien = (c: string, cuanto: number): boolean => cuanto <= 0.12 && c.includes('return uApertura * ( 1.0 - min( 1.0, uPoder ) ) * smoothstep( 0.12, 0.45, m.g ) * ( 1.0 - smoothstep( 0.3, 0.6, m.r ) );')
afirmar(labioBien(enElPisoTs, CALMA_EN_EL_PISO.labio), '  el labio del corte oscurece apenas el piso alrededor del hueco abierto y se va cuando el logo queda al ras (con el poder): no queda un contorno', `labio ${String(CALMA_EN_EL_PISO.labio)}`)
controlPositivo('el detector VE el labio de EL ENCASTRE (0,3 y siempre)', enElPisoTs.replace('( 1.0 - min( 1.0, uPoder ) ) * ', ''), (c: string) => labioBien(c, 0.3))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1C · Sin línea blanca: el piso pisa el borde del logo (el corte por adentro del contorno) y queda un pelo debajo de su cara al ras')

// La rendija que queda entre el corte del piso y el canto del logo (u): el corte se corre `borde` del contorno (+ afuera,
// − adentro) y el canto del logo está `canto` afuera (el bisel). Por la rendija se veía el fondo claro de la escena.
const rendija = (borde: number, canto: number): number => Math.max(0, borde - canto)
const canto = PROBE_EXTRUDE.bevelSize * PROBE_SVG_SCALE
const ladoDeLaMascara = 7
const trazo = trazoDelBorde(-(HUECO.solape / ladoDeLaMascara) * HUECO.lado)
const huecoTs = sinComentarios(leer('_lib/escena/final/hueco.ts'))
const sinRendija = (borde: number): boolean => rendija(borde, canto) === 0 && trazo !== null && trazo.color === '#000' && huecoTs.includes('const nitida = dibujar(formas, marco, n, 0, -(HUECO.solape / lado) * n)')
afirmar(sinRendija(-HUECO.solape), 'el corte del piso va por ADENTRO del contorno del logo (lo achica un trazo negro): el piso pisa el borde, no queda rendija por la que se vea el fondo', `pisa ${String(HUECO.solape)} u · canto del logo ${canto.toFixed(3)} u`)
controlPositivo('el detector VE la holgura de EL ENCASTRE (0,035 u por afuera: la línea blanca)', 0.035, sinRendija)
// Y la cara del logo al ras queda encima: el piso calmo y el borde del pozo, un pelo más abajo (sin pelear en el solape).
const simulacion = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
const alRas = { centro: new THREE.Vector3(), rotacionX: 0 }
poseDelLogo(1, TAM, alRas)
const caraDelLogo = alRas.centro.y + TAM.espesor / 2
const pozoAlRas = crearElPozo([cuadrado], TAM.espesor)
const bordeDelPozo = new THREE.Box3().setFromObject(pozoAlRas.grupo).max.y
pozoAlRas.soltar()
const encima = (sim: string, bajo: number): boolean => bajo > 0 && bajo < PROBE_EXTRUDE.bevelThickness * PROBE_SVG_SCALE && sim.includes(`dibujo -= ${String(bajo)} * calmaDelFinal( xz );`) && Math.abs(caraDelLogo - FLOOR_Y) < 1e-9 && Math.abs(bordeDelPozo - (FLOOR_Y - bajo)) < 1e-6
afirmar(encima(simulacion, HUECO.bajoElRas), '  la cara del logo al ras queda encima: el piso calmo (en la simulación) y el borde del pozo, `bajoElRas` más abajo (menos que su bisel: no se ve un escalón)', `${String(HUECO.bajoElRas)} u`)
controlPositivo('  el detector VE el piso calmo justo al ras (pelea con la cara del logo en el solape)', simulacion.replace(`dibujo -= ${String(HUECO.bajoElRas)} * calmaDelFinal( xz );`, ''), (s: string) => encima(s, HUECO.bajoElRas))

cerrar('s51-retoque-encastre')
