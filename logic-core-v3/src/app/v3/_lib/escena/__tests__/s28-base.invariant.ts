/**
 * INVARIANTE — ESCENA 2 · LA BASE LIMPIA.
 *
 *     npm run test:s28-base
 *
 * Lo que afirma, y por qué:
 *
 *   1. SIN SOMBRAS: ningún fuente de la escena prende un mapa de sombras, ni lo
 *      proyecta ni lo recibe. La sombra del logo giraba con el sol del arco y se
 *      fue; lo que lo apoya es la oclusión de contacto, quieta (§5).
 *   2. SIN CELOSÍA: el gobo de la cúpula no está en ningún material. El factor
 *      de cielo del hemisférico (`probeCelosia.ts`) SÍ se queda: no proyecta nada
 *      y sacarlo movería la luz.
 *   3. SIN MARCAS, SIN REFLEJO, SIN LA BANDERA VIEJA: los archivos no existen y
 *      nadie los nombra en código.
 *   4. LA BRUMA arranca DETRÁS del logo —ni en la pose más lejana del recorrido
 *      se vela— y se come el horizonte: la pared que queda detrás del logo en esa
 *      pose cae entera en la niebla. Las dos cosas se derivan de los keyframes y
 *      de la geometría del estudio, no de los dos números de la niebla.
 *   5. EL APOYO: la oclusión de contacto sigue montada en el escenario.
 *
 * Los barridos de 1–3 leen el CÓDIGO sin comentarios: la prosa que cuenta lo que
 * se borró no cuenta como uso.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { LOGO_BOX_WORLD } from '@/lib/logo-footprint'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { CHOREO_KEYFRAMES } from '../choreography'
import { FOG_FAR, FOG_NEAR } from '../probeAtmosphere'
import { CYC_COVE_RADIUS, FLOOR_RADIUS } from '../probeScene'

const RAIZ = process.cwd()
const ESCENA = 'src/app/v3/_lib/escena'
const leer = (rel: string): string => readFileSync(path.join(RAIZ, rel), 'utf8')

/** El código sin comentarios de bloque (incluidos los de JSX) ni de línea. */
function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

/** Los fuentes de la escena que viajan al producto: todo menos los tests. */
const FUENTES = readdirSync(path.join(RAIZ, ESCENA))
  .filter((n) => /\.(ts|tsx)$/.test(n))
  .map((n) => ({ nombre: n, codigo: sinComentarios(leer(`${ESCENA}/${n}`)) }))

const quienes = (patron: RegExp): string[] => FUENTES.filter((f) => patron.test(f.codigo)).map((f) => f.nombre)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · SIN SOMBRAS — ni mapa, ni quien proyecte, ni quien reciba')

const SOMBRA = /\bcastShadow\b|\breceiveShadow\b|\bshadows=|\bshadow-[a-zA-Z]|\bshadowMap\b/
afirmar(FUENTES.length > 20, `el barrido ve la escena entera: ${FUENTES.length} fuentes`)
afirmarIgual(quienes(SOMBRA), [], 'ningún fuente de la escena usa el mapa de sombras')
controlPositivo('el detector VE una luz que proyecta', '<directionalLight castShadow />', (f: string) => !SOMBRA.test(sinComentarios(f)))
controlPositivo(
  'y el limpiador de comentarios no se come el código que sigue a uno',
  '/* sin sombra */ mesh.receiveShadow = true',
  (f: string) => !SOMBRA.test(sinComentarios(f)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · SIN CELOSÍA — el gobo no está en ningún material; el factor de cielo sí')

const GOBO = /applyCelosia|createCelosiaUniforms|uCelosia|celosiaShader/
afirmarIgual(quienes(GOBO), [], 'nadie aplica, crea ni importa el gobo de la cúpula')
afirmar(!existsSync(path.join(RAIZ, ESCENA, 'celosiaShader.ts')), '  y el módulo del GLSL no existe')
controlPositivo('el detector VE un material con el gobo', 'applyCelosia(slab, celosia)', (f: string) => !GOBO.test(sinComentarios(f)))
afirmar(
  /celosiaSkyFactor\(params\.celosiaBar\)/.test(leer(`${ESCENA}/OrbitRig.tsx`)),
  'el factor de cielo del hemisférico se sigue escribiendo: la luz no se movió',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · SIN MARCAS, SIN REFLEJO, SIN LA BANDERA VIEJA')

const BORRADOS = ['floorMarks.ts', 'InstancedBars.tsx', 'ReflejoDelLogo.tsx', 'variante.ts']
afirmarIgual(
  BORRADOS.filter((n) => existsSync(path.join(RAIZ, ESCENA, n))),
  [],
  `los cuatro archivos se fueron: ${BORRADOS.join(', ')}`,
)
const RESTO = /InstancedBars|MARK_PLACEMENTS|floorMarks|ReflejoDelLogo|__varianteDeLaEscena|recetaDeLaEscena|from '\.\/variante'/
afirmarIgual(quienes(RESTO), [], '  y ningún fuente los nombra en código')
controlPositivo('el detector VE la bandera vieja', "import { recetaDeLaEscena } from './variante'", (f: string) => !RESTO.test(sinComentarios(f)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · LA BRUMA — arranca detrás del logo y se come el horizonte')

const suave = (desde: number, hasta: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - desde) / (hasta - desde)))
  return t * t * (3 - 2 * t)
}
// La niebla de three es `smoothstep` sobre la profundidad; la distancia al ojo
// la acota por arriba, así que medir con ella es el lado conservador.
const lejos = Math.max(...CHOREO_KEYFRAMES.map((k) => Math.hypot(k.pose.distance, k.pose.height)))
const bordeDelLogo = lejos + LOGO_BOX_WORLD / 2
const pared = lejos + FLOOR_RADIUS + CYC_COVE_RADIUS
const noSeVela = ([near, far]: readonly [number, number]): boolean => suave(near, far, bordeDelLogo) < 0.005
const seLoCome = ([, far]: readonly [number, number]): boolean => pared >= far

afirmar(lejos < FOG_NEAR, `el centro del logo nunca entra en la bruma: la pose más lejana lo ve a ${lejos.toFixed(1)}, la bruma arranca en ${FOG_NEAR}`)
afirmar(
  noSeVela([FOG_NEAR, FOG_FAR]),
  '  y su borde más lejano se vela menos del 0,5 %',
  `a ${bordeDelLogo.toFixed(1)} → ${(suave(FOG_NEAR, FOG_FAR, bordeDelLogo) * 100).toFixed(2)} %`,
)
controlPositivo('con la bruma vieja (20 → 150) el mismo medidor VE el velo sobre el logo', [20, 150] as const, noSeVela)
afirmar(
  seLoCome([FOG_NEAR, FOG_FAR]),
  'la pared detrás del logo, en esa misma pose, cae entera en la niebla',
  `a ${pared.toFixed(1)} contra el final de la bruma en ${FOG_FAR}`,
)
controlPositivo('con la bruma vieja la misma pared asoma: el medidor lo ve', [20, 150] as const, seLoCome)
afirmar(
  /<fog attach="fog" args=\{\[FOG_COLOR, FOG_NEAR, FOG_FAR\]\} \/>/.test(leer(`${ESCENA}/ProbeStage.tsx`)),
  'el escenario monta la niebla con esas dos constantes y no con otras',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · EL APOYO — la oclusión de contacto sigue montada')

const APOYO = /<ContactOcclusion\b/
afirmar(APOYO.test(sinComentarios(leer(`${ESCENA}/ProbeStage.tsx`))), 'el escenario monta `<ContactOcclusion>`: es lo que apoya el logo sin sombra')
controlPositivo('el detector no la inventa donde no está', '<StudioFloor />', (f: string) => APOYO.test(f))

cerrar('s28-base')
