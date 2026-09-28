'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import type { NivelDeCalidad } from '../calidad'
import { entornoDeLaEscena, hayBanco } from '../entorno'
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
 * **[ESCENA 6] Que se lean como estrellas.** Un cielo de verdad: muchas débiles y pocas brillantes.
 * Tres clases: el punto de un píxel (la mayoría), uno apenas más grande (un píxel con sus vecinos a un
 * tercio) y las brillantes, con un halo mínimo alrededor del núcleo. Cada una TITILA a su ritmo,
 * lento y leve, en su lugar: el polvo se mueve y las estrellas no, y esa diferencia es la que las
 * separa. Monocromas. El centro de cada una cae en el centro de un píxel, así que siguen nítidas.
 *
 * **Aparecen escalonadas** con el barrido de la noche —cada una tiene su umbral—, y se van antes de
 * que arranque el túnel (DIRECCION-ESCENA §5.1: no son el espacio de Trabajos).
 */

export const ESTRELLAS = {
  cuantas: 60000,
  /**
   * Elevación de las direcciones, en grados: todo el cielo que la cámara puede ver afuera. Por debajo
   * de −20° ningún rayo de ninguna pose llega al cilindro del cielo por encima del piso (lo afirma el
   * invariante), así que ahí no hacía falta ninguna: la misma cantidad queda más densa donde se ve.
   */
  elevacion: { desde: -20, hasta: 34 },
  /**
   * Las tres clases: qué parte del cielo es de cada una, su brillo (fracción del blanco) y su lado en
   * píxeles (1 CSS = 1). La brillante lleva un halo de `halo` sobre su núcleo.
   */
  clases: {
    punto: { parte: 0.74, brillo: [0.22, 0.5], lado: 1 },
    media: { parte: 0.21, brillo: [0.5, 0.85], lado: 3 },
    brillante: { parte: 0.05, brillo: [0.95, 1], lado: 7 },
  },
  halo: 0.3,
  /** El titileo: frecuencia (Hz) y cuánto baja el brillo en el valle. */
  titileo: { desde: 0.07, hasta: 0.3, hondo: [0.18, 0.45] },
  /** En qué franja de la noche aparecen, repartidas. */
  umbral: { desde: 0.35, hasta: 0.92 },
  /** Cuánto dura la aparición de cada una, en unidades de noche. */
  fundido: 0.06,
  /** Adelante de esto no hay cielo: la capa gruesa. */
  afueraDe: MOIRE_FAR_RADIUS + 0.5,
} as const

const VERTEX = /* glsl */ `
attribute vec3 aDireccion;
attribute vec4 aEstrella;
uniform float uNoche;
uniform float uVisible;
uniform float uPixel;
uniform float uRadio;
uniform float uSuelo;
uniform float uTiempo;
uniform vec2 uResolucion;
varying float vAlfa;
varying float vClase;
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
	float lado = ( aEstrella.z < 0.5 ? 1.0 : ( aEstrella.z < 1.5 ? ${ESTRELLAS.clases.media.lado.toFixed(1)} : ${ESTRELLAS.clases.brillante.lado.toFixed(1)} ) ) * uPixel;
	// El centro, en el centro de un píxel (o en una esquina si el lado es par): nítida aunque ocupe más de uno.
	vec2 px = ( gl_Position.xy / gl_Position.w * 0.5 + 0.5 ) * uResolucion;
	px = mod( lado, 2.0 ) > 0.5 ? floor( px ) + 0.5 : floor( px + 0.5 );
	gl_Position.xy = ( px / uResolucion * 2.0 - 1.0 ) * gl_Position.w;
	// aEstrella: brillo, umbral de la noche, clase y una semilla para el titileo.
	float aparece = smoothstep( aEstrella.y, aEstrella.y + ${ESTRELLAS.fundido.toFixed(3)}, uNoche );
	float f = mix( ${ESTRELLAS.titileo.desde.toFixed(2)}, ${ESTRELLAS.titileo.hasta.toFixed(2)}, fract( aEstrella.w * 7.13 ) );
	float hondo = mix( ${ESTRELLAS.titileo.hondo[0].toFixed(2)}, ${ESTRELLAS.titileo.hondo[1].toFixed(2)}, fract( aEstrella.w * 3.71 ) );
	// Dos senos de razón irracional: no se lee como un parpadeo regular.
	float ola = 0.5 + 0.5 * sin( 6.2832 * ( uTiempo * f + aEstrella.w ) ) * cos( 6.2832 * ( uTiempo * f * 0.618 + aEstrella.w * 1.7 ) );
	float titila = 1.0 - hondo * ola;
	vAlfa = aEstrella.x * titila * aparece * uVisible * afuera;
	vClase = aEstrella.z;
	gl_PointSize = vAlfa > 0.001 ? lado : 0.0;
}
`

const FRAGMENT = /* glsl */ `
varying float vAlfa;
varying float vClase;
void main() {
	// En píxeles desde el centro del sprite.
	vec2 q = ( gl_PointCoord - 0.5 );
	float cuanto = 1.0;
	if ( vClase > 0.5 && vClase < 1.5 ) {
		// La media: el píxel del centro entero y sus vecinos a un tercio.
		vec2 k = abs( q ) * ${ESTRELLAS.clases.media.lado.toFixed(1)};
		cuanto = max( k.x, k.y ) < 0.5 ? 1.0 : ( k.x + k.y < 1.6 ? 0.34 : 0.0 );
	} else if ( vClase > 1.5 ) {
		// La brillante: el núcleo de un píxel y un halo mínimo que cae rápido.
		vec2 k = q * ${ESTRELLAS.clases.brillante.lado.toFixed(1)};
		float r = length( k );
		cuanto = max( abs( k.x ) < 0.5 && abs( k.y ) < 0.5 ? 1.0 : 0.0, ${ESTRELLAS.halo.toFixed(2)} * exp( - r * r / 2.2 ) );
	}
	gl_FragColor = vec4( vec3( vAlfa * cuanto ), 1.0 );
}
`

type VentanaDelBanco = Window & { __estrellasDelBanco?: { solas: (solas: boolean) => void } }

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
    const estrella = new Float32Array(n * 4)
    const e = ESTRELLAS
    const clases = [e.clases.punto, e.clases.media, e.clases.brillante]
    for (let i = 0; i < n; i += 1) {
      const azimut = r() * Math.PI * 2
      // Uniforme en el seno de la elevación: parejo sobre la esfera.
      const s0 = Math.sin((e.elevacion.desde * Math.PI) / 180)
      const s1 = Math.sin((e.elevacion.hasta * Math.PI) / 180)
      const sy = s0 + (s1 - s0) * r()
      const h = Math.sqrt(1 - sy * sy)
      direccion.set([Math.sin(azimut) * h, sy, Math.cos(azimut) * h], i * 3)
      // La clase por su parte del cielo; adentro de cada una, más de las débiles (la ley de un cielo).
      const u = r()
      const clase = u < clases[0].parte ? 0 : u < clases[0].parte + clases[1].parte ? 1 : 2
      const [b0, b1] = clases[clase].brillo
      estrella.set([b0 + (b1 - b0) * r() ** 2.2, e.umbral.desde + (e.umbral.hasta - e.umbral.desde) * r(), clase, r()], i * 4)
    }
    const geometria = new THREE.BufferGeometry()
    // La posición sólo cuenta los puntos: el shader los pone.
    geometria.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    geometria.setAttribute('aDireccion', new THREE.BufferAttribute(direccion, 3))
    geometria.setAttribute('aEstrella', new THREE.BufferAttribute(estrella, 4))
    const uniforms = {
      uNoche: VIVO.uNoche,
      uVisible: { value: 1 },
      uPixel: { value: 1 },
      // Con el piso de la formación, el cielo arranca donde termina ese piso; si no, apenas detrás de la trama.
      uRadio: { value: escenario?.hasta ?? ESTRELLAS.afueraDe + 1 },
      uSuelo: { value: FLOOR_Y - (escenario?.desnivel ?? 0) },
      uTiempo: VIVO.uTiempo,
      uResolucion: { value: new THREE.Vector2(1, 1) },
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

  // Para el banco: esconder el resto de los puntos (polvo y bokeh) y mirar sólo el cielo.
  const scene = useThree((state) => state.scene)
  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__estrellasDelBanco = {
      solas: (solas) =>
        scene.traverse((o) => {
          if (o instanceof THREE.Points && o !== armado.puntos) o.visible = !solas
        }),
    }
    return () => {
      delete ventana.__estrellasDelBanco
    }
  }, [scene, armado])

  useFrame((state) => {
    alCuadro(armado.uniforms, fueraDelTunel(rig.current.progress), state.viewport.dpr, state.gl)
  })

  return <primitive object={armado.puntos} />
}

function alCuadro(u: { uVisible: { value: number }; uPixel: { value: number }; uResolucion: { value: THREE.Vector2 } }, visible: number, dpr: number, gl: THREE.WebGLRenderer): void {
  u.uVisible.value = visible
  gl.getDrawingBufferSize(u.uResolucion.value)
  // Un píxel CSS, redondeado a píxeles enteros del búfer: nítidas.
  u.uPixel.value = Math.max(1, Math.round(dpr))
}
