'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { FLOOR_Y, PAPER_COLOR } from '../probeScene'
import { HAZ, VIVO } from './vivo'

/**
 * [ESCENA 2 · exploración] E1 · ÓCULO Y HAZ.
 *
 * - **El óculo**: un techo de papel a la altura de la envolvente, abierto arriba del logo.
 * - **El haz**: un cono abierto del óculo al piso, aditivo, sin volumétrico. Brilla donde el cono
 *   se ve de frente (donde la luz atraviesa más aire) y se apaga en su silueta y en sus dos
 *   puntas.
 * - **La mancha de luz** donde el haz toca el piso.
 * - **Las estrellas**: sólo de noche, detrás del óculo.
 *
 * De día el haz es cálido y se lee por el polvo que lo cruza y por la mancha de luz en el piso; de
 * noche es frío y suave, luz ambiente y no un foco. Cuánto, en cada caso, lo dice el nivel
 * (`NIVELES_DEL_HAZ` en `vivo.ts`). El polvo que cae adentro lo toma el parche del polvo
 * (`polvoVivo.ts`, `uHaz`).
 */
const ALTO = HAZ.arriba - FLOOR_Y
const ESTRELLAS = 70

const VERTEX_DEL_HAZ = /* glsl */ `
varying vec3 vNormal2;
varying vec3 vVista;
varying float vAlto;
void main() {
	vAlto = uv.y;
	vec4 mv = modelViewMatrix * vec4( position, 1.0 );
	vNormal2 = normalize( normalMatrix * normal );
	vVista = normalize( - mv.xyz );
	gl_Position = projectionMatrix * mv;
}
`

const FRAGMENT_DEL_HAZ = /* glsl */ `
uniform float uNoche;
uniform vec3 uHazDia;
uniform vec3 uHazNoche;
varying vec3 vNormal2;
varying vec3 vVista;
varying float vAlto;
void main() {
	float deFrente = pow( abs( dot( normalize( vNormal2 ), normalize( vVista ) ) ), 1.6 );
	float puntas = smoothstep( 0.0, 0.18, vAlto ) * ( 1.0 - smoothstep( 0.72, 1.0, vAlto ) );
	vec3 luz = mix( vec3( 1.0, 0.9, 0.74 ), vec3( 0.72, 0.84, 1.0 ), uNoche );
	float cuanto = mix( uHazDia.x, uHazNoche.x, uNoche );
	gl_FragColor = vec4( luz * deFrente * puntas * cuanto, 1.0 );
}
`

const VERTEX_PLANO = /* glsl */ `
varying vec2 vPlano;
void main() {
	vPlano = position.xy;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

const FRAGMENT_DE_LA_MANCHA = /* glsl */ `
uniform float uNoche;
uniform vec3 uHazDia;
uniform vec3 uHazNoche;
varying vec2 vPlano;
void main() {
	float r = length( vPlano ) / ${HAZ.radioAbajo.toFixed(2)};
	float charco = exp( - r * r * 2.2 );
	vec3 luz = mix( vec3( 1.0, 0.9, 0.74 ), vec3( 0.72, 0.84, 1.0 ), uNoche );
	gl_FragColor = vec4( luz * charco * mix( uHazDia.y, uHazNoche.y, uNoche ), 1.0 );
}
`

const FRAGMENT_DE_LAS_ESTRELLAS = /* glsl */ `
uniform float uNoche;
void main() {
	vec2 c = gl_PointCoord - 0.5;
	float punto = 1.0 - smoothstep( 0.1, 0.5, length( c ) );
	gl_FragColor = vec4( vec3( 0.85, 0.9, 1.0 ) * punto * uNoche, 1.0 );
}
`

const VERTEX_DE_LAS_ESTRELLAS = /* glsl */ `
attribute float aTam;
void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	gl_PointSize = aTam;
}
`

function aditivo(vertexShader: string, fragmentShader: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uNoche: VIVO.uNoche, uHazDia: VIVO.uHazDia, uHazNoche: VIVO.uHazNoche },
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  })
}

export function Haz() {
  const piezas = useMemo(() => {
    const cono = new THREE.CylinderGeometry(HAZ.radioArriba, HAZ.radioAbajo, ALTO, 48, 1, true)
    const techo = new THREE.RingGeometry(HAZ.radioArriba + 0.4, 46, 64, 1)
    const posiciones = new Float32Array(ESTRELLAS * 3)
    const tam = new Float32Array(ESTRELLAS)
    for (let i = 0; i < ESTRELLAS; i += 1) {
      // Una semilla fija: el mismo cielo en cada carga.
      const a = i * 2.39996
      const r = Math.sqrt((i + 0.5) / ESTRELLAS) * 9
      posiciones.set([Math.cos(a) * r, 22 + ((i * 37) % 11), Math.sin(a) * r], i * 3)
      tam[i] = 1.5 + ((i * 53) % 7) * 0.35
    }
    const estrellas = new THREE.BufferGeometry()
    estrellas.setAttribute('position', new THREE.BufferAttribute(posiciones, 3))
    estrellas.setAttribute('aTam', new THREE.BufferAttribute(tam, 1))
    const materiales = {
      haz: aditivo(VERTEX_DEL_HAZ, FRAGMENT_DEL_HAZ),
      mancha: aditivo(VERTEX_PLANO, FRAGMENT_DE_LA_MANCHA),
      estrellas: aditivo(VERTEX_DE_LAS_ESTRELLAS, FRAGMENT_DE_LAS_ESTRELLAS),
      techo: new THREE.MeshStandardMaterial({ color: PAPER_COLOR, roughness: 0.94, side: THREE.DoubleSide }),
    }
    return { cono, techo, estrellas, materiales }
  }, [])

  useEffect(
    () => () => {
      piezas.cono.dispose()
      piezas.techo.dispose()
      piezas.estrellas.dispose()
      for (const m of Object.values(piezas.materiales)) m.dispose()
    },
    [piezas]
  )

  return (
    <group>
      <mesh
        position={[0, HAZ.arriba, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={piezas.techo}
        material={piezas.materiales.techo}
      />
      <points position={[0, HAZ.arriba, 0]} geometry={piezas.estrellas} material={piezas.materiales.estrellas} />
      <mesh
        position={[0, FLOOR_Y + ALTO / 2, 0]}
        geometry={piezas.cono}
        material={piezas.materiales.haz}
        renderOrder={2}
      />
      <mesh
        position={[0, FLOOR_Y + 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={piezas.materiales.mancha}
        renderOrder={1}
      >
        <planeGeometry args={[HAZ.radioAbajo * 3, HAZ.radioAbajo * 3]} />
      </mesh>
    </group>
  )
}
