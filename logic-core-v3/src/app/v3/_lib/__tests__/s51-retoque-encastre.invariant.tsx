/**
 * RETOQUE DEL ENCASTRE — el invariante: npm run test:s51-retoque-encastre
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por ticket:
 *   1A · sin partículas: el vapor se fue entero (se abre el hueco y el logo encaja).
 *   1B · el hueco del tono del piso, un poco más sombreado adentro (no negro); el labio, apenas, y se va al quedar al ras.
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-encastre/mirar.txt`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'

import * as THREE from 'three'

import { CALMA_EN_EL_PISO } from '../escena/final/enElPiso'
import { crearElPozo } from '../escena/final/hueco'
import { PAPER_COLOR } from '../escena/probeScene'
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

cerrar('s51-retoque-encastre')
