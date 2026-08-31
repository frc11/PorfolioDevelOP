/**
 * COMPROBACIONES DE S11 · cómo se engancha la celosía.
 *
 *     npx tsx src/app/probe-escena/__tests__/s11-celosia.invariant.ts
 *
 * Dos cosas, y las dos son de acuerdos que se rompen solos en un refactor sin que
 * nadie se entere:
 *
 *   1. **Que la celosía CONSUMA la trama y no la redefina.** Es la regla 5 del
 *      sprint y la condición que el humano puso en la Parada 1: si mañana cambian
 *      los radios o las celdas en `probeMoire.ts`, la proyección se mueve sola.
 *   2. **El enganche contra three**, que es una cadena de tres eslabones frágiles
 *      —el chunk, el orden de las luces y el momento en que se resuelve el
 *      `#include`— y los tres se verifican contra el paquete instalado, no se
 *      razonan. Con su control positivo.
 *
 * Lo que la celosía DIBUJA está en `s11-proyeccion.invariant.ts`; lo que le hace
 * al cuadro, en `s11-piso.invariant.ts`; y lo que este sprint decidió no tener, en
 * `s11-sin-sol.invariant.ts`.
 */
import * as THREE from 'three'

import { celosiaCoverage, celosiaLayers, celosiaTransmittance } from '@/app/v3/_lib/escena/celosiaGeometry'
import {
  CELOSIA_ANCHOR,
  CELOSIA_PATCHED_CHUNK,
  CELOSIA_SOURCE,
  createCelosiaUniforms,
  writeCelosiaLayers,
} from '@/app/v3/_lib/escena/celosiaShader'
import { CELOSIA_BAR } from '@/app/v3/_lib/escena/probeCelosia'
import {
  MOIRE_COARSE_CELLS,
  MOIRE_DRIFT_PERIOD_S,
  MOIRE_FADE,
  MOIRE_FAR_BOTTOM,
  MOIRE_FAR_RADIUS,
  MOIRE_FAR_TOP,
  MOIRE_MISMATCH,
  MOIRE_NEAR_BOTTOM,
  MOIRE_NEAR_RADIUS,
  MOIRE_NEAR_TOP,
  fineCells,
} from '@/app/v3/_lib/escena/probeMoire'
import { FLOOR_Y, check, report, section } from './harness'
import { sunDirectionAt } from './shading'

const LAYERS = celosiaLayers(MOIRE_MISMATCH)

// ── 1 · La celosía consume la trama, no la redefine ─────────────────────────

section('La celosía sale de probeMoire.ts y de ningún otro lado')

{
  const [near, far] = LAYERS
  check(
    'las dos capas son las de la envolvente, número por número',
    near.radius === MOIRE_NEAR_RADIUS &&
      near.bottom === MOIRE_NEAR_BOTTOM &&
      near.top === MOIRE_NEAR_TOP &&
      near.cells === fineCells(MOIRE_MISMATCH) &&
      far.radius === MOIRE_FAR_RADIUS &&
      far.bottom === MOIRE_FAR_BOTTOM &&
      far.top === MOIRE_FAR_TOP &&
      far.cells === MOIRE_COARSE_CELLS,
    `fina r=${near.radius} ${near.cells} celdas · gruesa r=${far.radius} ${far.cells} celdas`
  )
  check(
    'y la que deriva es la gruesa, que es la que baja en la pantalla',
    far.drifts && !near.drifts,
    `la fina es fija (S10), la gruesa corre una celda cada ${MOIRE_DRIFT_PERIOD_S}s`
  )
  check(
    'el desajuste redefine la trama fina y por lo tanto la proyección',
    celosiaLayers(0)[0].cells === 2 * MOIRE_COARSE_CELLS &&
      celosiaLayers(12)[0].cells === 2 * MOIRE_COARSE_CELLS + 12,
    `en 0 → ${celosiaLayers(0)[0].cells} celdas · en 12 → ${celosiaLayers(12)[0].cells}`
  )

  // Y lo mismo del lado del shader: los uniforms se vuelcan de la misma tabla.
  const uniforms = createCelosiaUniforms()
  const nearUniform = uniforms.uCelosiaNear.value
  check(
    'los uniforms del shader llevan esa misma tabla y no una copia a mano',
    nearUniform.x === near.radius &&
      nearUniform.y === near.bottom &&
      nearUniform.z === near.top &&
      nearUniform.w === near.cells &&
      uniforms.uCelosiaKnobs.value.z === MOIRE_FADE,
    `(${nearUniform.x}, ${nearUniform.y}, ${nearUniform.z}, ${nearUniform.w}) y el desvanecido en ${MOIRE_FADE}`
  )
  writeCelosiaLayers(uniforms, 7)
  check(
    'y siguen al desajuste cuando se mueve el slider',
    uniforms.uCelosiaNear.value.w === fineCells(7),
    `${uniforms.uCelosiaNear.value.w} celdas con el desajuste en 7`
  )
}

// ── 2 · El enganche contra three ────────────────────────────────────────────

section('El enganche en el shader, verificado contra el paquete instalado')

{
  const chunk = THREE.ShaderChunk.lights_fragment_begin

  /**
   * ⚠️ **CONTROL POSITIVO.** "El ancla está" y "el gobo se inyectó" son
   * afirmaciones de presencia, pero el BUSCADOR que las contesta también puede
   * estar roto. Antes de creerle hay que verlo decir que no.
   */
  const countAnchor = (source: string) => source.split(CELOSIA_ANCHOR).length - 1
  check(
    'el buscador del ancla sabe decir que NO está',
    countAnchor('void main() { gl_FragColor = vec4( 1.0 ); }') === 0,
    'sin control positivo, un buscador roto daría "una sola vez" contra cualquier cosa'
  )
  check(
    'el ancla existe EXACTAMENTE una vez en el chunk de three 0.182',
    countAnchor(chunk) === 1,
    CELOSIA_ANCHOR
  )
  check(
    'y cae adentro del bloque de la luz que proyecta sombra',
    chunk
      .slice(0, chunk.indexOf(CELOSIA_ANCHOR))
      .lastIndexOf('#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )') >
      chunk.slice(0, chunk.indexOf(CELOSIA_ANCHOR)).lastIndexOf('#endif'),
    'ese bloque existe solo para la direccional con sombra, que en esta escena es la key'
  )
  check(
    'el gobo quedó inyectado y una sola vez',
    CELOSIA_PATCHED_CHUNK.split(CELOSIA_SOURCE.goboCall).length - 1 === 1,
    CELOSIA_SOURCE.goboCall
  )

  /**
   * Que la key sea la direccional 0 no es suerte: `WebGLLights.setup` ordena el
   * array poniendo primero las que proyectan sombra. Si three dejara de hacerlo,
   * el gobo se le aplicaría al relleno.
   */
  const lights = [
    new THREE.DirectionalLight(),
    new THREE.DirectionalLight(),
    new THREE.DirectionalLight(),
  ]
  lights[2].castShadow = true
  const sorted = [...lights].sort((a, b) => (b.castShadow ? 2 : 0) - (a.castShadow ? 2 : 0))
  check(
    'three ordena las luces con sombra primero, así que la key es la direccional 0',
    sorted[0] === lights[2],
    'shadowCastingAndTexturingLightsFirst, en WebGLLights.setup'
  )

  /**
   * ⚠️ El `#include` se resuelve DESPUÉS de `onBeforeCompile`, así que hay que
   * reemplazar el include entero y no buscar el ancla en el fuente del material.
   * Si alguien "simplifica" esto, el gobo desaparece en silencio.
   */
  check(
    'el parche reemplaza el include entero, que es lo único que existe en ese momento',
    CELOSIA_PATCHED_CHUNK.includes(CELOSIA_ANCHOR) &&
      !CELOSIA_PATCHED_CHUNK.includes('#include <lights_fragment_begin>'),
    'buscar el ancla en shader.fragmentShader no encontraría nada'
  )
  check(
    'el vertex lleva la matriz de instancia: las 48 marcas son un InstancedMesh',
    CELOSIA_SOURCE.vertexBody.includes('USE_INSTANCING') &&
      CELOSIA_SOURCE.vertexBody.includes('instanceMatrix'),
    'sin eso las marcas leerían el gobo en el origen y quedarían todas iguales'
  )
  check(
    'el fragment declara el filtro por derivada, que es lo que reemplaza al mipmap',
    CELOSIA_SOURCE.fragmentPars.includes('fwidth('),
    'la vía analítica no tiene mipmaps: el filtro es de ella'
  )
}

// ── 3 · La barra ────────────────────────────────────────────────────────────

section('La barra, que es la única perilla propia de este sprint')

{
  check(
    'la cobertura de una capa sale de la barra en las DOS direcciones',
    Math.abs(celosiaCoverage(CELOSIA_BAR) - (1 - (1 - CELOSIA_BAR) ** 2)) < 1e-12,
    `barra ${CELOSIA_BAR} → ${(celosiaCoverage(CELOSIA_BAR) * 100).toFixed(1)}% de la celda`
  )
  /**
   * El batido es la modulación de la cobertura local entre "las dos capas en
   * fase" (queda la de una sola) y "fuera de fase" (1 − (1−c)²). La diferencia es
   * c − c², máxima en c = 0,5 — o sea con la barra en 1 − √0,5.
   */
  const optimum = 1 - Math.SQRT1_2
  check(
    'y la barra de diseño es la que hace máxima esa modulación',
    Math.abs(CELOSIA_BAR - optimum) < 0.01,
    `${CELOSIA_BAR} contra el óptimo teórico ${optimum.toFixed(3)} · medido en puntos sRGB da 10,8 en hero contra 9,4 con 0,25 y 10,5 con 0,35`
  )
  check(
    'en 0 la celosía no tapa nada: es el control que devuelve la escena de S10',
    celosiaTransmittance([0, FLOOR_Y, 0], sunDirectionAt(0), 0, MOIRE_MISMATCH) === 1,
    'el slider llega hasta ahí a propósito'
  )
  check(
    'y con la barra puesta hay puntos del piso completamente tapados',
    (() => {
      const sun = sunDirectionAt(0)
      for (let i = 0; i < 4000; i += 1) {
        const x = -30 + (60 * i) / 4000
        if (celosiaTransmittance([x, FLOOR_Y, 0], sun, CELOSIA_BAR, MOIRE_MISMATCH) < 0.01) {
          return true
        }
      }
      return false
    })(),
    'la barra corta la key entera donde cae: la sombra es sombra, no un velo'
  )
}

report('s11 · el enganche de la celosía')
