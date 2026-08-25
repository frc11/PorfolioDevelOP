import * as THREE from 'three'

import { celosiaLayers } from './celosiaGeometry'
import { CELOSIA_BAR } from './probeCelosia'
import { MOIRE_FADE, MOIRE_MISMATCH } from './probeMoire'

/**
 * EL GOBO, EN EL SHADER (S11) — la celosía proyectada sobre lo que recibe luz.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * POR QUÉ ANALÍTICO Y NO UN MAPA DE SOMBRAS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Las dos vías se midieron antes de construir, y la del mapa tiene una regresión
 * con número:
 *
 * | | hoy | con el piso adentro del mapa |
 * |---|---:|---:|
 * | ortho que hace falta | ±6,5 | **±34,0** (la losa entera) |
 * | téxel de mundo (1024²) | 0,0127 | **0,0664** — 5,2× más grueso |
 * | disco PCF (radio 4) | 0,051 | 0,266 |
 * | **penumbra del logo** | **~1,5%** de su ancho | **~7,8%** |
 *
 * S6 calibró ese 1,5%. Para conservarlo el mapa tendría que ser **5357²** — en la
 * práctica 8192², 64× la memoria de hoy. Y una segunda direccional con sombra no
 * lo arregla: three multiplica la sombra de cada luz sobre **su propio** aporte,
 * así que partir la key en dos le daría al logo media sombra. Encima las dos
 * capas tendrían que pasar a emisoras con `alphaTest` —binario, o sea que pierde
 * el velo de 0,18 igual—, 7.680 triángulos más en la pasada de profundidad, y el
 * PCF difuminaría el 39% del ancho de la propia barra.
 *
 * **La vía analítica no suma un solo draw call, ni una pasada, ni una textura, ni
 * un byte de dependencia**, y lleva el moiré por construcción porque evalúa las
 * dos capas: no hay resolución de mapa que lo limite. Lo que sí cuesta es ALU por
 * fragmento, y lo que sí tiene que resolver es su propio filtrado — ver
 * `celosiaBar` abajo.
 *
 * ── Dónde se engancha, y por qué ahí ───────────────────────────────────────
 *
 * En `lights_fragment_begin`, justo adentro del bloque
 * `#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )`.
 * Ese bloque existe **solo para la luz que proyecta sombra**, y en esta escena
 * ésa es la key — o sea el sol. La celosía modula exactamente la misma luz que
 * tira la sombra del logo, que es lo correcto: son la misma fuente.
 *
 * Que la key sea la direccional 0 no es suerte: `WebGLLights.setup` ordena el
 * array con `shadowCastingAndTexturingLightsFirst` antes de armar los uniforms.
 * Se verifica contra three, no se razona (`s11-celosia.invariant.ts`).
 *
 * ⚠️ **El `#include` se resuelve DESPUÉS de `onBeforeCompile`.** En ese momento
 * `shader.fragmentShader` todavía dice `#include <lights_fragment_begin>` y el
 * ancla no existe adentro, así que hay que parchear el chunk de
 * `THREE.ShaderChunk` y reemplazar el include entero. Buscar el ancla en
 * `shader.fragmentShader` no encontraría nada y el gobo quedaría en silencio.
 */

/** La línea de three después de la cual se inserta el gobo. Es única en el chunk. */
export const CELOSIA_ANCHOR = 'directionalLightShadow = directionalLightShadows[ i ];'

const GOBO_CALL = 'directLight.color *= celosiaGobo( vCelosiaWorld );'

/** El chunk de three con el gobo adentro. Se arma una vez. */
export const CELOSIA_PATCHED_CHUNK = (() => {
  const chunk = THREE.ShaderChunk.lights_fragment_begin
  const occurrences = chunk.split(CELOSIA_ANCHOR).length - 1
  if (occurrences !== 1) {
    throw new Error(
      `celosiaShader: el ancla aparece ${occurrences} veces en lights_fragment_begin (se espera 1). three cambió el chunk.`
    )
  }
  return chunk.replace(CELOSIA_ANCHOR, `${CELOSIA_ANCHOR}\n\t\t${GOBO_CALL}`)
})()

const VERTEX_PARS = 'varying vec3 vCelosiaWorld;'

/**
 * La posición de mundo, con instanciado.
 *
 * Se calcula acá y no se toma el `worldPosition` de `worldpos_vertex` porque ése
 * es una variable local del chunk y además solo existe bajo ciertos defines. Las
 * 48 marcas son un `InstancedMesh`, así que la matriz de instancia tiene que
 * entrar antes de la de modelo — igual que hace `project_vertex`.
 */
const VERTEX_BODY = [
  'vec4 celosiaModelPosition = vec4( transformed, 1.0 );',
  '#ifdef USE_BATCHING',
  '\tcelosiaModelPosition = batchingMatrix * celosiaModelPosition;',
  '#endif',
  '#ifdef USE_INSTANCING',
  '\tcelosiaModelPosition = instanceMatrix * celosiaModelPosition;',
  '#endif',
  'vCelosiaWorld = ( modelMatrix * celosiaModelPosition ).xyz;',
].join('\n')

/**
 * El gobo.
 *
 * ── Sin una sola rama, y no es estilo ──────────────────────────────────────
 *
 * `fwidth` compara el valor entre píxeles vecinos del mismo quad. Adentro de una
 * rama que no todos los píxeles del quad toman, el resultado no está definido.
 * Por eso los cuatro cruces —dos raíces por capa— se evalúan siempre y lo que
 * decide es una máscara multiplicativa (`valid`), no un `if`.
 *
 * ── Dos raíces por capa ────────────────────────────────────────────────────
 *
 * Desde adentro del cilindro hay un cruce solo. Desde el ciclorama más allá de
 * radio 38 el rayo al sol puede entrar y volver a salir, o sea que esa pared está
 * tapada dos veces. Sin la segunda raíz, el ciclorama del lado del sol quedaría
 * parejo mientras el de enfrente lleva bandas — y la cove no tiene costura donde
 * esconder esa diferencia.
 *
 * ── El filtro, que es lo que la vía analítica tiene que poner de su bolsillo ─
 *
 * La envolvente dibujada tiene mipmaps; el gobo no tiene nada. Medido sobre los
 * cinco recorridos, la huella de un fragmento sobre el piso va de 0,010 celdas
 * (mediana) a **0,52 en el peor rayo rasante**, o sea 1,9 px por celda: por
 * debajo de Nyquist. `fwidth` sobre la fase ensancha el perfil de la barra hasta
 * la huella, y pasada media celda la reemplaza por su propia media —la barra
 * como número— que es exactamente lo que hace un mipmap cuando la trama deja de
 * resolverse. El filtro entra a promediar en el 0,015% de los rayos que tocan
 * piso.
 *
 * De paso resuelve solo el corte de `atan`: en la costura la fase salta una
 * vuelta entera, `fwidth` se dispara y ese píxel devuelve la media en vez de un
 * destello.
 */
const FRAGMENT_PARS = [
  'uniform vec3 uCelosiaSun;',
  'uniform vec4 uCelosiaNear;',
  'uniform vec4 uCelosiaFar;',
  'uniform vec3 uCelosiaKnobs;',
  'varying vec3 vCelosiaWorld;',
  '',
  '#define CELOSIA_TWO_PI 6.283185307179586',
  '',
  'float celosiaBar( const in float phase ) {',
  '\tfloat w = max( fwidth( phase ), 1e-5 );',
  '\tfloat d = abs( phase - floor( phase + 0.5 ) );',
  '\tfloat hard = clamp( ( uCelosiaKnobs.x * 0.5 - d ) / w + 0.5, 0.0, 1.0 );',
  '\treturn mix( hard, uCelosiaKnobs.x, clamp( w * 2.0 - 1.0, 0.0, 1.0 ) );',
  '}',
  '',
  'float celosiaEnvelope( const in float v ) {',
  '\tfloat f = max( uCelosiaKnobs.z, 1e-4 );',
  '\tfloat r = min( clamp( v / f, 0.0, 1.0 ), clamp( ( 1.0 - v ) / f, 0.0, 1.0 ) );',
  '\treturn r * r * ( 3.0 - 2.0 * r );',
  '}',
  '',
  'float celosiaCross( const in vec3 p, const in vec4 layer, const in float drift, const in float t, const in float valid ) {',
  '\tvec3 q = p + uCelosiaSun * t;',
  '\tfloat span = layer.z - layer.y;',
  '\tfloat pitch = CELOSIA_TWO_PI * layer.x / layer.w;',
  '\tfloat u = atan( q.x, q.z ) / CELOSIA_TWO_PI * layer.w;',
  '\tfloat v = ( q.y - layer.y ) / pitch + drift;',
  '\tfloat inside = step( layer.y, q.y ) * step( q.y, layer.z );',
  '\tfloat mark = max( celosiaBar( u ), celosiaBar( v ) );',
  '\treturn 1.0 - valid * inside * celosiaEnvelope( ( q.y - layer.y ) / span ) * mark;',
  '}',
  '',
  'float celosiaLayer( const in vec3 p, const in vec4 layer, const in float drift ) {',
  '\tfloat a = dot( uCelosiaSun.xz, uCelosiaSun.xz );',
  '\tfloat b = 2.0 * dot( p.xz, uCelosiaSun.xz );',
  '\tfloat c = dot( p.xz, p.xz ) - layer.x * layer.x;',
  '\tfloat disc = b * b - 4.0 * a * c;',
  '\tfloat ok = step( 0.0, disc ) * step( 1e-8, a );',
  '\tfloat root = sqrt( max( disc, 0.0 ) );',
  '\tfloat inv = 0.5 / max( a, 1e-8 );',
  '\tfloat tNear = ( - b - root ) * inv;',
  '\tfloat tFar = ( - b + root ) * inv;',
  '\treturn celosiaCross( p, layer, drift, tNear, ok * step( 1e-4, tNear ) )',
  '\t\t* celosiaCross( p, layer, drift, tFar, ok * step( 1e-4, tFar ) );',
  '}',
  '',
  'float celosiaGobo( const in vec3 p ) {',
  '\treturn celosiaLayer( p, uCelosiaNear, 0.0 ) * celosiaLayer( p, uCelosiaFar, uCelosiaKnobs.y );',
  '}',
].join('\n')

/**
 * Los uniforms de la celosía. **Un solo objeto para todos los materiales**: el
 * rig escribe una vez por frame y lo ven el piso, el ciclorama, las marcas y el
 * logo. Si cada material tuviera los suyos, habría que recorrerlos.
 *
 * `uCelosiaNear`/`uCelosiaFar` llevan (radio, abajo, arriba, celdas) **leídos de
 * `probeMoire.ts` a través de `celosiaLayers`**. No hay un solo número de la
 * rendija escrito acá.
 */
export type CelosiaUniforms = {
  readonly uCelosiaSun: { value: THREE.Vector3 }
  readonly uCelosiaNear: { value: THREE.Vector4 }
  readonly uCelosiaFar: { value: THREE.Vector4 }
  /** x = barra · y = deriva de la capa gruesa · z = desvanecido de banda. */
  readonly uCelosiaKnobs: { value: THREE.Vector3 }
}

export function createCelosiaUniforms(): CelosiaUniforms {
  const uniforms: CelosiaUniforms = {
    uCelosiaSun: { value: new THREE.Vector3(0, 1, 0) },
    uCelosiaNear: { value: new THREE.Vector4() },
    uCelosiaFar: { value: new THREE.Vector4() },
    uCelosiaKnobs: { value: new THREE.Vector3(CELOSIA_BAR, 0, MOIRE_FADE) },
  }
  writeCelosiaLayers(uniforms, MOIRE_MISMATCH)
  return uniforms
}

/** Vuelca la tabla de capas de `probeMoire.ts` a los uniforms. */
export function writeCelosiaLayers(uniforms: CelosiaUniforms, mismatch: number): void {
  const [near, far] = celosiaLayers(mismatch)
  uniforms.uCelosiaNear.value.set(near.radius, near.bottom, near.top, near.cells)
  uniforms.uCelosiaFar.value.set(far.radius, far.bottom, far.top, far.cells)
}

/**
 * Le enseña a un material a recibir la celosía.
 *
 * `customProgramCacheKey` no es opcional: sin él three reusaría el programa
 * compilado de otro `MeshStandardMaterial` con los mismos defines y el material
 * quedaría sin el gobo — o al revés, se lo pondría a uno que no lo pidió.
 */
export function applyCelosia(material: THREE.Material, uniforms: CelosiaUniforms): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uCelosiaSun = uniforms.uCelosiaSun
    shader.uniforms.uCelosiaNear = uniforms.uCelosiaNear
    shader.uniforms.uCelosiaFar = uniforms.uCelosiaFar
    shader.uniforms.uCelosiaKnobs = uniforms.uCelosiaKnobs

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERTEX_PARS}`)
      .replace('#include <project_vertex>', `#include <project_vertex>\n${VERTEX_BODY}`)

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAGMENT_PARS}`)
      .replace('#include <lights_fragment_begin>', CELOSIA_PATCHED_CHUNK)
  }
  material.customProgramCacheKey = () => 'celosia-s11'
}

/** Para las comprobaciones: el fuente que se inyecta, tal cual. */
export const CELOSIA_SOURCE = {
  vertexPars: VERTEX_PARS,
  vertexBody: VERTEX_BODY,
  fragmentPars: FRAGMENT_PARS,
  goboCall: GOBO_CALL,
} as const
