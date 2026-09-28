'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { MOIRE_EN_VIVO } from '../moire/MoireVivo'
import { createGridCellData } from '../moireTextures'
import {
  MOIRE_BASE_ALPHA,
  MOIRE_COARSE_CELLS,
  MOIRE_COLOR,
  MOIRE_DRIFT_PERIOD_S,
  MOIRE_FADE,
  MOIRE_FAR_BOTTOM,
  MOIRE_FAR_ORDER,
  MOIRE_FAR_RADIUS,
  MOIRE_FAR_TOP,
  MOIRE_OPACITY,
  MOIRE_TILE_SIZE,
  lineDuty,
  verticalPitch,
} from '../probeMoire'
import { RELIEVE, RUIDO_GLSL } from './ruido'

/**
 * [ESCENA 5] 5e · R1, LAS PAREDES — la capa gruesa en relieve: cada celda de la trama sale hacia
 * adentro o hacia afuera en escalones, por ruido. Reemplaza a la capa gruesa de `MoireScreen` (que
 * no se dibuja con R1) con la misma textura, el mismo material y la misma banda.
 *
 * Cada celda es una cara (con las líneas de la trama en su borde) y cuatro faldones que la unen con
 * el fondo: donde dos vecinas quedan a distinta altura, el faldón es el costado del escalón. La
 * bajada de la trama (M1a + M2) mueve la GEOMETRÍA, no la textura: las filas bajan con la fase que
 * escribe `MoireVivo` y, al salir de la banda por abajo, vuelven a entrar por arriba con otra fila de
 * ruido (afuera de la banda no se ven). Los escalones son chicos contra la separación entre las dos
 * capas (6), para no romper el moiré.
 */

const FILAS = 10
const ALTO_DE_CELDA = verticalPitch(MOIRE_FAR_RADIUS, MOIRE_COARSE_CELLS)
const HONDO = RELIEVE.paredes.paso * (RELIEVE.paredes.niveles / 2 + 0.6)

const PARS = /* glsl */ `
attribute vec2 aCelda;
attribute vec2 aEsquina;
attribute float aParte;
attribute float aHondo;
uniform float uFase;
uniform float uTiempoDelRuido;
varying float vBanda;
varying float vRelieve;
${RUIDO_GLSL}
vec3 paredEn( out vec3 normalDeLaPared ) {
	float filaCorrida = aCelda.y - uFase;
	float vuelta = floor( filaCorrida / ${FILAS.toFixed(1)} );
	float fila = filaCorrida - vuelta * ${FILAS.toFixed(1)};
	float filaDelRuido = aCelda.y - vuelta * ${FILAS.toFixed(1)};
	float angulo = ( aCelda.x + aEsquina.x ) / ${MOIRE_COARSE_CELLS.toFixed(1)} * 6.2831853;
	float centro = ( aCelda.x + 0.5 ) / ${MOIRE_COARSE_CELLS.toFixed(1)} * 6.2831853;
	vec3 lugarDelRuido = vec3( cos( centro ) * ${RELIEVE.paredes.escalaAngular.toFixed(2)}, sin( centro ) * ${RELIEVE.paredes.escalaAngular.toFixed(2)}, filaDelRuido * ${RELIEVE.paredes.escalaVertical.toFixed(2)} + uTiempoDelRuido );
	float nivel = escalonDelRelieve( ruidoDelRelieve( lugarDelRuido ), ${RELIEVE.paredes.niveles.toFixed(1)} ) - ${((RELIEVE.paredes.niveles - 1) / 2).toFixed(1)};
	float radio = mix( ${MOIRE_FAR_RADIUS.toFixed(2)} - nivel * ${RELIEVE.paredes.paso.toFixed(3)}, ${(MOIRE_FAR_RADIUS + HONDO).toFixed(3)}, aHondo );
	// −1 la celda más hundida, 1 la que más sale: la que sale lleva más trama (se lee más cerca).
	vRelieve = aParte < 0.5 ? nivel / ${((RELIEVE.paredes.niveles - 1) / 2).toFixed(1)} : 0.6;
	float y = ${(MOIRE_FAR_BOTTOM - ALTO_DE_CELDA).toFixed(3)} + ( fila + aEsquina.y ) * ${ALTO_DE_CELDA.toFixed(4)};
	vec3 radial = vec3( sin( angulo ), 0.0, cos( angulo ) );
	vec3 tangente = vec3( cos( angulo ), 0.0, - sin( angulo ) );
	normalDeLaPared = aParte < 0.5 ? radial : ( aParte < 1.5 ? tangente : vec3( 0.0, 1.0, 0.0 ) );
	float v = ( y - ${MOIRE_FAR_BOTTOM.toFixed(2)} ) / ${(MOIRE_FAR_TOP - MOIRE_FAR_BOTTOM).toFixed(2)};
	float rampa = min( clamp( v / ${MOIRE_FADE.toFixed(2)}, 0.0, 1.0 ), clamp( ( 1.0 - v ) / ${MOIRE_FADE.toFixed(2)}, 0.0, 1.0 ) );
	vBanda = rampa * rampa * ( 3.0 - 2.0 * rampa );
	return radial * radio + vec3( 0.0, y - ${(MOIRE_FAR_BOTTOM + (MOIRE_FAR_TOP - MOIRE_FAR_BOTTOM) / 2).toFixed(3)}, 0.0 );
}
`

function geometriaDeLasParedes(): THREE.BufferGeometry {
  const celda: number[] = []
  const esquina: number[] = []
  const parte: number[] = []
  const hondo: number[] = []
  const uv: number[] = []
  const vertice = (c: number, k: number, u: number, v: number, p: number, h: number, tu: number, tv: number): void => {
    celda.push(c, k)
    esquina.push(u, v)
    parte.push(p)
    hondo.push(h)
    uv.push(tu, tv)
  }
  for (let c = 0; c < MOIRE_COARSE_CELLS; c += 1) {
    for (let k = 0; k < FILAS; k += 1) {
      const cuadro = (a: readonly number[], b: readonly number[], cc: readonly number[], d: readonly number[]): void => {
        for (const q of [a, b, cc, a, cc, d]) vertice(c, k, q[0], q[1], q[2], q[3], q[4], q[5])
      }
      // La cara, con la trama.
      cuadro([0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 1, 0], [1, 1, 0, 0, 1, 1], [0, 1, 0, 0, 0, 1])
      // Los faldones, sobre la línea de la trama: se leen como el costado del escalón.
      for (const u of [0, 1]) cuadro([u, 0, 1, 0, 0.002, 0], [u, 1, 1, 0, 0.002, 1], [u, 1, 1, 1, 0.002, 1], [u, 0, 1, 1, 0.002, 0])
      for (const v of [0, 1]) cuadro([0, v, 2, 0, 0, 0.002], [1, v, 2, 0, 1, 0.002], [1, v, 2, 1, 1, 0.002], [0, v, 2, 1, 0, 0.002])
    }
  }
  const g = new THREE.BufferGeometry()
  // La posición la pone el shader: sólo cuenta los vértices (y da una caja para el recorte).
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(parte.length * 3), 3))
  g.setAttribute('aCelda', new THREE.BufferAttribute(new Float32Array(celda), 2))
  g.setAttribute('aEsquina', new THREE.BufferAttribute(new Float32Array(esquina), 2))
  g.setAttribute('aParte', new THREE.BufferAttribute(new Float32Array(parte), 1))
  g.setAttribute('aHondo', new THREE.BufferAttribute(new Float32Array(hondo), 1))
  g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2))
  return g
}

export function Paredes() {
  if (entornoDeLaEscena().pruebas.relieve !== 'R1') return null
  return <ParedesPrendidas />
}

function ParedesPrendidas() {
  const vivo = entornoDeLaEscena().pruebas.relieveVivo
  const armado = useMemo(() => {
    const textura = new THREE.DataTexture(createGridCellData(MOIRE_TILE_SIZE, lineDuty(MOIRE_COARSE_CELLS), MOIRE_BASE_ALPHA), MOIRE_TILE_SIZE, MOIRE_TILE_SIZE, THREE.RGBAFormat)
    textura.wrapS = THREE.RepeatWrapping
    textura.wrapT = THREE.RepeatWrapping
    textura.generateMipmaps = true
    textura.minFilter = THREE.LinearMipmapLinearFilter
    textura.magFilter = THREE.LinearFilter
    textura.anisotropy = 4
    textura.needsUpdate = true
    const uniforms = { uFase: { value: 0 }, uTiempoDelRuido: { value: 0 } }
    const material = new THREE.MeshLambertMaterial({ color: MOIRE_COLOR, alphaMap: textura, transparent: true, opacity: MOIRE_OPACITY, depthWrite: false, side: THREE.DoubleSide })
    // Transparente y de doble cara, three la dibujaría en dos pasadas: desde adentro alcanza con una.
    material.forceSinglePass = true
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms)
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${PARS}`)
        .replace('#include <beginnormal_vertex>', 'vec3 normalDeLaPared;\n\tvec3 lugarDeLaPared = paredEn( normalDeLaPared );\n\tvec3 objectNormal = normalDeLaPared;')
        .replace('#include <begin_vertex>', 'vec3 transformed = lugarDeLaPared;')
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vBanda;\nvarying float vRelieve;')
        .replace('#include <alphamap_fragment>', '#include <alphamap_fragment>\n\tdiffuseColor.a *= vBanda * ( 1.0 + 0.5 * vRelieve );')
    }
    material.customProgramCacheKey = () => 'relieve-paredes'
    const geometria = geometriaDeLasParedes()
    const malla = new THREE.Mesh(geometria, material)
    malla.position.y = MOIRE_FAR_BOTTOM + (MOIRE_FAR_TOP - MOIRE_FAR_BOTTOM) / 2
    malla.frustumCulled = false
    malla.renderOrder = MOIRE_FAR_ORDER
    return { malla, geometria, material, textura, uniforms }
  }, [])
  useEffect(
    () => () => {
      armado.geometria.dispose()
      armado.material.dispose()
      armado.textura.dispose()
    },
    [armado],
  )

  useFrame((state) => {
    // La bajada de la trama: la del moiré vivo, o la de la base si no está.
    alCuadro(armado.uniforms, entornoDeLaEscena().moire ? MOIRE_EN_VIVO.celdasBajadas : state.clock.elapsedTime / MOIRE_DRIFT_PERIOD_S, vivo ? VIVO.uTiempo.value * RELIEVE.velocidad : 0)
  })

  return <primitive object={armado.malla} />
}

function alCuadro(u: { uFase: { value: number }; uTiempoDelRuido: { value: number } }, fase: number, tiempo: number): void {
  u.uFase.value = fase
  u.uTiempoDelRuido.value = tiempo
}
