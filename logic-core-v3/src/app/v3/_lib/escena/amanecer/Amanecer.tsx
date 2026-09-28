'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { TRAMA_GLSL } from '../estrellas/cielo'
import { TRAMA_EN_VIVO, leerLaTrama } from '../estrellas/trama'
import type { MoireHandle } from '../MoireScreen'
import { NOCHE_DEL_AMANECER, suscribirAlDiaDelFinal } from '../nocheDisparada'
import { FLOOR_Y } from '../probeScene'
import { MOIRE_NEAR_RADIUS, MOIRE_NEAR_TOP } from '../probeMoire'
import { AMANECER, momentoEn, progresoPorScroll } from './linea'
import { AMANECER_EN_VIVO, conElAmanecerEnElLogo, hayAmanecer } from './luz'

/**
 * [ESCENA 7] T11 · EL AMANECER — el reloj del evento y los haces por la trama (`linea.ts` tiene el porqué).
 * Arranca cuando la compuerta del amanecer prende el día; sostiene la noche hasta el cambio, escribe lo que
 * los materiales leen, y dibuja los haces: el sol bajo que pasa por los cuadrados de la trama deja luz en
 * el aire de la sala (una cuenta por píxel a lo largo del rayo: en cada punto, si el camino hacia el sol
 * pasa por un hueco de las dos capas de la trama).
 */

type VentanaDelBanco = Window & {
  __amanecerDelBanco?: {
    estado: () => { activo: boolean; s: number; frente: number; rayos: number; resplandor: number; sostiene: boolean }
    /** Deja el amanecer quieto en el segundo `s` (o lo suelta con `null`): para fotografiar cada momento. */
    congelar: (s: number | null) => void
  }
}

interface PropsDelAmanecer {
  readonly moireRef: RefObject<MoireHandle | null>
  readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null>
}

export function Amanecer(props: PropsDelAmanecer) {
  if (!hayAmanecer()) return null
  return <AmanecerPrendido {...props} />
}

/** Los haces: cuántos tramos por píxel, cuánta luz por unidad de aire, y el aire de la sala. */
const HACES = { pasos: 20, luz: 0.0035, alto: 10 } as const

const VERTEX_DE_LOS_HACES = /* glsl */ `
varying vec3 vMundo;
void main() {
	vec4 mundo = modelMatrix * vec4( position, 1.0 );
	vMundo = mundo.xyz;
	gl_Position = projectionMatrix * viewMatrix * mundo;
}
`

const FRAGMENT_DE_LOS_HACES = /* glsl */ `
uniform float uRayos;
uniform vec3 uSolDelAmanecer;
uniform float uTiempo;
varying vec3 vMundo;
${TRAMA_GLSL}
float azarDelAire( vec3 p ) { return fract( sin( dot( p, vec3( 127.1, 311.7, 74.7 ) ) ) * 43758.5453 ); }
float ruidoDelAire( vec3 p ) {
	vec3 i = floor( p );
	vec3 f = fract( p );
	vec3 u = f * f * ( 3.0 - 2.0 * f );
	float a = mix( mix( azarDelAire( i ), azarDelAire( i + vec3( 1, 0, 0 ) ), u.x ), mix( azarDelAire( i + vec3( 0, 1, 0 ) ), azarDelAire( i + vec3( 1, 1, 0 ) ), u.x ), u.y );
	float b = mix( mix( azarDelAire( i + vec3( 0, 0, 1 ) ), azarDelAire( i + vec3( 1, 0, 1 ) ), u.x ), mix( azarDelAire( i + vec3( 0, 1, 1 ) ), azarDelAire( i + vec3( 1, 1, 1 ) ), u.x ), u.y );
	return mix( a, b, u.z );
}
void main() {
	if ( uRayos < 0.001 ) discard;
	vec3 o = cameraPosition;
	vec3 d = normalize( vMundo - o );
	// El aire de la sala: del ojo hasta la pared de la trama fina, o hasta el piso si el rayo lo toca antes.
	float a = dot( d.xz, d.xz );
	float b = dot( o.xz, d.xz );
	float c = dot( o.xz, o.xz ) - ${(MOIRE_NEAR_RADIUS - 1).toFixed(1)} * ${(MOIRE_NEAR_RADIUS - 1).toFixed(1)};
	float largo = a > 1e-6 ? ( - b + sqrt( max( b * b - a * c, 0.0 ) ) ) / a : 60.0;
	if ( d.y < 0.0 ) largo = min( largo, ( ${FLOOR_Y.toFixed(3)} - o.y ) / d.y );
	if ( d.y > 0.0 ) largo = min( largo, ( ${MOIRE_NEAR_TOP.toFixed(1)} - o.y ) / d.y );
	float paso = max( largo, 0.0 ) / ${HACES.pasos.toFixed(1)};
	float corrido = fract( 52.9829189 * fract( dot( gl_FragCoord.xy, vec2( 0.06711056, 0.00583715 ) ) ) );
	float suma = 0.0;
	for ( int i = 0; i < ${HACES.pasos}; i++ ) {
		vec3 p = o + d * ( ( float( i ) + corrido ) * paso );
		// El aire de la sala: más denso abajo, y desparejo (se mueve despacio).
		float aire = ( 0.45 + 0.55 * ruidoDelAire( p * 0.18 + vec3( 0.0, uTiempo * 0.05, 0.0 ) ) ) * exp( - max( 0.0, p.y - ${FLOOR_Y.toFixed(3)} ) / ${HACES.alto.toFixed(1)} );
		suma += delanteDeLaTrama( p, uSolDelAmanecer ) * aire * paso;
	}
	// Contra el sol se ve más (el aire dispersa hacia adelante).
	float fase = 0.3 + 0.9 * pow( max( 0.0, dot( d, uSolDelAmanecer ) ), 8.0 );
	gl_FragColor = vec4( vec3( 0.92 ) * suma * ${HACES.luz.toFixed(4)} * fase * uRayos, 1.0 );
}
`

/** Los haces, alrededor del ojo y sólo mientras hay rayos. */
function mostrarLosHaces(malla: THREE.Mesh, hay: boolean, ojo: THREE.Vector3): boolean {
  malla.visible = hay
  malla.position.copy(ojo)
  return hay
}

function AmanecerPrendido({ moireRef, logoMaterialRef }: PropsDelAmanecer) {
  const memoria = useRef({ activo: false, s: 0, inicio: 0, fin: 0, scroll: Number.NaN, logo: null as THREE.MeshStandardMaterial | null, congelado: null as number | null })
  const haces = useMemo(() => {
    // Una esfera alrededor del ojo, sin prueba de profundidad: el rayo lo corta la cuenta (la pared o el piso).
    const geometria = new THREE.SphereGeometry(20, 32, 16)
    const material = new THREE.ShaderMaterial({
      uniforms: { ...TRAMA_EN_VIVO, uRayos: AMANECER_EN_VIVO.uRayos, uSolDelAmanecer: AMANECER_EN_VIVO.uSolDelAmanecer, uTiempo: VIVO.uTiempo },
      vertexShader: VERTEX_DE_LOS_HACES,
      fragmentShader: FRAGMENT_DE_LOS_HACES,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthTest: false,
    })
    const malla = new THREE.Mesh(geometria, material)
    malla.frustumCulled = false
    malla.renderOrder = 3
    malla.visible = false
    return { malla, geometria, material }
  }, [])
  useEffect(() => () => {
    haces.geometria.dispose()
    haces.material.dispose()
  }, [haces])

  useEffect(
    () =>
      suscribirAlDiaDelFinal((activo) => {
        const m = memoria.current
        m.activo = activo
        m.s = 0
        if (!activo) return
        // Dónde tiene que estar terminado: cuando el tope de Por qué develOP llega a `titulo` del cuadro.
        const porQue = document.querySelector('[data-panel="por-que-develop"]')?.getBoundingClientRect()
        m.inicio = window.scrollY
        m.fin = porQue === undefined ? m.inicio : porQue.top + window.scrollY - AMANECER.titulo * window.innerHeight
      }),
    [],
  )

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__amanecerDelBanco = {
      estado: () => ({ activo: memoria.current.activo, s: memoria.current.s, frente: AMANECER_EN_VIVO.uFrenteDelDia.value, rayos: AMANECER_EN_VIVO.uRayos.value, resplandor: AMANECER_EN_VIVO.uResplandor.value, sostiene: NOCHE_DEL_AMANECER.sostenida }),
      congelar: (s) => {
        memoria.current.congelado = s
      },
    }
    return () => {
      delete ventana.__amanecerDelBanco
    }
  }, [])

  useFrame((state, delta) => {
    const m = memoria.current
    const dt = Math.min(delta, 0.1)
    // El logo guarda su gris de noche hasta que el frente lo alcanza (una sola vez por material).
    const logo = logoMaterialRef.current
    if (logo !== null && m.logo !== logo) {
      conElAmanecerEnElLogo(logo)
      m.logo = logo
    }
    const scroll = window.scrollY
    const velocidad = Number.isNaN(m.scroll) || dt <= 0 ? 0 : Math.abs(scroll - m.scroll) / window.innerHeight / dt
    m.scroll = scroll
    if (m.congelado !== null) m.s = m.congelado
    else if (m.activo && m.s < AMANECER.final) {
      // El reloj corre más rápido con el scroll, y no puede quedar atrás del título de Por qué develOP.
      m.s += dt * (1 + AMANECER.acelera * velocidad)
      m.s = Math.max(m.s, progresoPorScroll(scroll, m.inicio, m.fin) * AMANECER.final)
    }
    const momento = momentoEn(m.activo ? m.s : AMANECER.final + 1)
    const u = AMANECER_EN_VIVO
    // Mientras sostiene la noche, el cielo de noche que el cielo del amanecer va a destapar.
    if (m.activo && momento.sostieneLaNoche && state.scene.fog !== null) u.uCieloDeNoche.value.copy(state.scene.fog.color).convertLinearToSRGB()
    NOCHE_DEL_AMANECER.sostenida = m.activo && momento.sostieneLaNoche
    u.uEstrellasDelAmanecer.value = m.activo ? momento.estrellas : 1
    u.uResplandor.value = m.activo ? momento.resplandor : 0
    u.uBarridoDelDia.value = m.activo && momento.barre ? 1 : 0
    u.uFrenteDelDia.value = momento.frente
    u.uRayos.value = m.activo ? momento.rayos : 0
    u.uCieloDelAmanecer.value = m.activo && momento.barre ? momento.cielo : m.activo && !momento.sostieneLaNoche ? 1 : 0
    if (mostrarLosHaces(haces.malla, u.uRayos.value > 0.001, state.camera.position)) leerLaTrama(moireRef.current)
  })

  return <primitive object={haces.malla} />
}
