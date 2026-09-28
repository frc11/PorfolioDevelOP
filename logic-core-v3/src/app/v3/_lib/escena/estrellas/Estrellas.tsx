'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import type { NivelDeCalidad } from '../calidad'
import { entornoDeLaEscena } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { azar } from '../formacion/enFormacion'
import { pisoConFormacion } from '../formacion/Formacion'
import { FLOOR_Y } from '../probeScene'
import { MOIRE_FAR_ORDER, MOIRE_FAR_RADIUS } from '../probeMoire'
import type { ProbeRigStore } from '../probeStore'
import { fueraDelTunel } from '../tunelEnLaEscena'

/**
 * [ESCENA 5] ESTRELLAS — el cielo de afuera de la trama, sólo de noche.
 *
 * **A distancia infinita.** Cada estrella es una DIRECCIÓN fija del mundo: giran con la cámara pero
 * no se desplazan con ella, y nunca derivan. El shader la pone, cuadro a cuadro, en esa dirección
 * desde la cámara, detrás de todo lo que hay afuera de la trama y delante del suelo: en el cilindro
 * donde termina el piso de la formación, o sobre el suelo si el rayo lo toca antes. Así las tapan las
 * líneas de la trama (que se dibuja encima), las siluetas de las copias y el escenario, y esa
 * oclusión es la prueba de que están afuera. La bruma no las come: son cielo.
 *
 * **Nítidas y tenues.** Un píxel, sin el desenfoque del polvo, y grises.
 *
 * **Aparecen escalonadas** con el barrido de la noche —cada una tiene su umbral—, y se van antes de
 * que arranque el túnel (DIRECCION-ESCENA §5.1: no son el espacio de Trabajos).
 */

export const ESTRELLAS = {
  cuantas: 9000,
  /** Elevación de las direcciones, en grados: todo lo que la cámara puede ver afuera. */
  elevacion: { desde: -46, hasta: 52 },
  /** Brillo (fracción del blanco). */
  brillo: { desde: 0.3, hasta: 0.65 },
  /** En qué franja de la noche aparecen, repartidas. */
  umbral: { desde: 0.35, hasta: 0.92 },
  /** Cuánto dura la aparición de cada una, en unidades de noche. */
  fundido: 0.06,
  /** Adelante de esto no hay cielo: la capa gruesa. */
  afueraDe: MOIRE_FAR_RADIUS + 0.5,
} as const

const VERTEX = /* glsl */ `
attribute vec3 aDireccion;
attribute float aBrillo;
attribute float aUmbral;
uniform float uNoche;
uniform float uVisible;
uniform float uPixel;
uniform float uRadio;
uniform float uSuelo;
varying float vAlfa;
void main() {
	// Donde la dirección corta el cilindro del cielo, desde la cámara: sin paralaje.
	vec3 o = cameraPosition;
	vec3 d = aDireccion;
	float a = dot( d.xz, d.xz );
	float b = 2.0 * dot( o.xz, d.xz );
	float c = dot( o.xz, o.xz ) - uRadio * uRadio;
	float t = ( - b + sqrt( max( b * b - 4.0 * a * c, 0.0 ) ) ) / ( 2.0 * a );
	// Si el rayo toca el suelo antes, sobre el suelo: el escenario y el ciclorama la tapan donde corresponde.
	if ( d.y < 0.0 ) t = min( t, ( uSuelo - o.y ) / d.y - 0.05 );
	vec3 mundo = o + d * t;
	// Adentro de la trama no hay cielo.
	float afuera = step( ${ESTRELLAS.afueraDe.toFixed(2)}, length( mundo.xz ) );
	gl_Position = projectionMatrix * viewMatrix * vec4( mundo, 1.0 );
	float aparece = smoothstep( aUmbral, aUmbral + ${ESTRELLAS.fundido.toFixed(3)}, uNoche );
	vAlfa = aBrillo * aparece * uVisible * afuera;
	gl_PointSize = vAlfa > 0.001 ? uPixel : 0.0;
}
`

const FRAGMENT = /* glsl */ `
varying float vAlfa;
void main() {
	gl_FragColor = vec4( vec3( vAlfa ), 1.0 );
}
`

interface PropsDeLasEstrellas {
  readonly rig: ProbeRigStore
  readonly calidad: NivelDeCalidad
}

export function Estrellas(props: PropsDeLasEstrellas) {
  if (!entornoDeLaEscena().pruebas.estrellas) return null
  return <EstrellasPrendidas {...props} />
}

function EstrellasPrendidas({ rig, calidad }: PropsDeLasEstrellas) {
  const escenario = pisoConFormacion(calidad)
  const armado = useMemo(() => {
    const r = azar(0x5ea1a7)
    const n = ESTRELLAS.cuantas
    const direccion = new Float32Array(n * 3)
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
      // Muchas tenues y pocas un poco más: la ley de siempre de un cielo.
      brillo[i] = e.brillo.desde + (e.brillo.hasta - e.brillo.desde) * r() ** 2.2
      umbral[i] = e.umbral.desde + (e.umbral.hasta - e.umbral.desde) * r()
    }
    const geometria = new THREE.BufferGeometry()
    // La posición sólo cuenta los puntos: el shader los pone.
    geometria.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    geometria.setAttribute('aDireccion', new THREE.BufferAttribute(direccion, 3))
    geometria.setAttribute('aBrillo', new THREE.BufferAttribute(brillo, 1))
    geometria.setAttribute('aUmbral', new THREE.BufferAttribute(umbral, 1))
    const uniforms = {
      uNoche: VIVO.uNoche,
      uVisible: { value: 1 },
      uPixel: { value: 1 },
      // Con el piso de la formación, el cielo arranca donde termina ese piso; si no, apenas detrás de la trama.
      uRadio: { value: escenario?.hasta ?? ESTRELLAS.afueraDe + 1 },
      uSuelo: { value: FLOOR_Y - (escenario?.desnivel ?? 0) },
    }
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTEX, fragmentShader: FRAGMENT, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })
    const puntos = new THREE.Points(geometria, material)
    puntos.frustumCulled = false
    // Antes que la trama gruesa: la trama se dibuja encima.
    puntos.renderOrder = MOIRE_FAR_ORDER - 2
    return { puntos, geometria, material, uniforms }
  }, [escenario])
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
  // Un píxel CSS, redondeado a píxeles enteros del búfer: nítidas.
  u.uPixel.value = Math.max(1, Math.round(dpr))
}
