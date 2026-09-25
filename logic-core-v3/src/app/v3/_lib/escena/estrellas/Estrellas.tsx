'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { azar } from '../formacion/enFormacion'
import { MOIRE_FAR_ORDER, MOIRE_FAR_RADIUS } from '../probeMoire'
import type { ProbeRigStore } from '../probeStore'
import { fueraDelTunel } from '../tunelEnLaEscena'

/**
 * [ESCENA 4] ESTRELLAS A LO LEJOS — sólo de noche, detrás de la cúpula, vistas a través de la trama.
 *
 * **Se distinguen del polvo** (que de noche ya parece estrellas) por tres cosas: son más chicas (un
 * píxel y medio como mucho), más tenues, y QUIETAS. Cada estrella es una DIRECCIÓN fija del mundo, no
 * un punto: el shader la pone, cuadro a cuadro, sobre un cilindro apenas detrás de la trama gruesa
 * (`RADIO`) en esa dirección desde la cámara. Así no derivan y no tienen paralaje, mientras el polvo
 * de adelante se mueve contra ellas: eso es lo que vende la profundidad. Estar en ese cilindro las
 * deja detrás de la trama (que se dibuja encima) y delante del ciclorama; donde el piso o el logo se
 * interponen, las tapan.
 *
 * **Aparecen escalonadas** con el barrido de la noche: cada una tiene su umbral de noche, así que la
 * sala se estrella de a poco al atardecer y se apaga igual con la vuelta al día.
 *
 * **No son el espacio de Trabajos** (DIRECCION-ESCENA §5.1, a futuro): son pocas, chicas, grises y
 * sólo detrás de la cúpula, y se van antes de que arranque el túnel.
 */

export const ESTRELLAS = {
  cuantas: 520,
  /** El cilindro donde se dibujan: apenas detrás de la trama gruesa (44). */
  radio: MOIRE_FAR_RADIUS + 2,
  /** Elevación de las direcciones, en grados: de un poco bajo el horizonte hasta arriba. */
  elevacion: { desde: -16, hasta: 34 },
  /** Tamaño en píxeles CSS y brillo (fracción del blanco). */
  tam: { desde: 0.7, hasta: 1.5 },
  brillo: { desde: 0.25, hasta: 0.6 },
  /** En qué franja de la noche aparecen, repartidas. */
  umbral: { desde: 0.35, hasta: 0.92 },
  /** Cuánto dura la aparición de cada una, en unidades de noche. */
  fundido: 0.06,
} as const

const VERTEX = /* glsl */ `
attribute vec3 aDireccion;
attribute float aTam;
attribute float aBrillo;
attribute float aUmbral;
uniform float uNoche;
uniform float uVisible;
uniform float uPixel;
varying float vAlfa;
void main() {
	// Donde la dirección corta el cilindro, desde la cámara: la estrella sigue a la cámara y no tiene paralaje.
	vec2 o = cameraPosition.xz;
	vec2 d = aDireccion.xz;
	float a = dot( d, d );
	float b = 2.0 * dot( o, d );
	float c = dot( o, o ) - ${(ESTRELLAS.radio * ESTRELLAS.radio).toFixed(1)};
	float t = ( - b + sqrt( max( b * b - 4.0 * a * c, 0.0 ) ) ) / ( 2.0 * a );
	vec3 mundo = cameraPosition + aDireccion * t;
	vec4 mv = viewMatrix * vec4( mundo, 1.0 );
	gl_Position = projectionMatrix * mv;
	float aparece = smoothstep( aUmbral, aUmbral + ${ESTRELLAS.fundido.toFixed(3)}, uNoche );
	vAlfa = aBrillo * aparece * uVisible;
	gl_PointSize = vAlfa > 0.001 ? aTam * uPixel : 0.0;
}
`

const FRAGMENT = /* glsl */ `
varying float vAlfa;
void main() {
	float r = length( gl_PointCoord - 0.5 ) * 2.0;
	float punto = 1.0 - smoothstep( 0.4, 1.0, r );
	if ( punto * vAlfa < 0.004 ) discard;
	gl_FragColor = vec4( vec3( 0.86 ), punto * vAlfa );
}
`

interface PropsDeLasEstrellas {
  readonly rig: ProbeRigStore
}

export function Estrellas(props: PropsDeLasEstrellas) {
  if (!entornoDeLaEscena().escena4.estrellas) return null
  return <EstrellasPrendidas {...props} />
}

function EstrellasPrendidas({ rig }: PropsDeLasEstrellas) {
  const armado = useMemo(() => {
    const r = azar(0x5ea1a7)
    const n = ESTRELLAS.cuantas
    const direccion = new Float32Array(n * 3)
    const tam = new Float32Array(n)
    const brillo = new Float32Array(n)
    const umbral = new Float32Array(n)
    const e = ESTRELLAS
    for (let i = 0; i < n; i += 1) {
      const azimut = r() * Math.PI * 2
      // Uniforme en el seno de la elevación: parejo sobre la esfera.
      const s0 = Math.sin((e.elevacion.desde * Math.PI) / 180)
      const s1 = Math.sin((e.elevacion.hasta * Math.PI) / 180)
      const sy = s0 + (s1 - s0) * r()
      const h = Math.sqrt(1 - sy * sy)
      direccion.set([Math.sin(azimut) * h, sy, Math.cos(azimut) * h], i * 3)
      // Muchas chicas y tenues, pocas un poco más: la ley de siempre de un cielo.
      const u = r() ** 2.2
      tam[i] = e.tam.desde + (e.tam.hasta - e.tam.desde) * u
      brillo[i] = e.brillo.desde + (e.brillo.hasta - e.brillo.desde) * u
      umbral[i] = e.umbral.desde + (e.umbral.hasta - e.umbral.desde) * r()
    }
    const geometria = new THREE.BufferGeometry()
    // La posición sólo cuenta los puntos: el shader los pone.
    geometria.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    geometria.setAttribute('aDireccion', new THREE.BufferAttribute(direccion, 3))
    geometria.setAttribute('aTam', new THREE.BufferAttribute(tam, 1))
    geometria.setAttribute('aBrillo', new THREE.BufferAttribute(brillo, 1))
    geometria.setAttribute('aUmbral', new THREE.BufferAttribute(umbral, 1))
    const uniforms = { uNoche: VIVO.uNoche, uVisible: { value: 1 }, uPixel: { value: 1 } }
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTEX, fragmentShader: FRAGMENT, transparent: true, depthWrite: false, toneMapped: false })
    const puntos = new THREE.Points(geometria, material)
    puntos.frustumCulled = false
    // Antes que la trama gruesa: la trama se dibuja encima.
    puntos.renderOrder = MOIRE_FAR_ORDER - 2
    return { puntos, geometria, material, uniforms }
  }, [])
  useEffect(
    () => () => {
      armado.geometria.dispose()
      armado.material.dispose()
    },
    [armado],
  )

  useFrame((state) => {
    alCuadro(armado.uniforms, fueraDelTunel(rig.current.progress), state.viewport.dpr)
  })

  return <primitive object={armado.puntos} />
}

function alCuadro(u: { uVisible: { value: number }; uPixel: { value: number } }, visible: number, dpr: number): void {
  u.uVisible.value = visible
  u.uPixel.value = dpr
}
