'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { TRAMA_GLSL } from '../estrellas/cielo'
import { TRAMA_EN_VIVO, leerLaTrama } from '../estrellas/trama'
import type { MoireHandle } from '../MoireScreen'
import { DIA_DEL_FINAL, NOCHE_DEL_AMANECER, bloqueTapaElCuadro, medirElBloqueOpaco } from '../nocheDisparada'
import { FLOOR_Y } from '../probeScene'
import { MOIRE_NEAR_RADIUS, MOIRE_NEAR_TOP } from '../probeMoire'
import { viajeEnCurso } from '../viaje'
import { DIA_DEL_TEXTO } from './diaDelTexto'
import { AMANECER, PAUSA_S, avanceDelScroll, compuertaEnLaLlegada, diaParaElTexto, momentoEn, pasoDelAmanecer } from './linea'
import { AMANECER_EN_VIVO, conElAmanecerEnElLogo, hayAmanecer } from './luz'

/**
 * [ESCENA 7] T11 · EL AMANECER — el avance del evento y los haces por la trama (`linea.ts` tiene el porqué).
 * Corre mientras la compuerta del amanecer tiene prendido el día; sostiene la noche hasta el cambio, escribe
 * lo que los materiales leen, y dibuja los haces: el sol bajo que pasa por los cuadrados de la trama deja luz
 * en el aire de la sala (una cuenta por píxel a lo largo del rayo: en cada punto, si el camino hacia el sol
 * pasa por un hueco de las dos capas de la trama).
 *
 * [ESCENA 8] T3 · El avance que se muestra persigue al que pide el scroll con una velocidad tope, en las dos
 * direcciones. No se reproduce donde nadie lo ve o no corresponde: al cargar ya adentro del final, en un viaje
 * del menú y con el bloque opaco tapando el cuadro, va derecho al pedido; con menos movimiento, el día llega
 * de una vez. Escribe cuánto día hay para el texto del final (`DIA_DEL_TEXTO`), y si el pie (compartido, no
 * espera) queda a la vista, no deja al amanecer atrás de lo legible.
 *
 * [CALIDAD 1] A1 · En un viaje de día a día el amanecer no corre (ni de ida ni de vuelta por Tu panel): desde el
 * primer cuadro, la compuerta del destino con el día entero (`compuertaEnLaLlegada`), que se sostiene al llegar
 * hasta que el scroll lo alcanza o vuelve para atrás (`sigueEntero`). Los viajes que cambian de luz, como antes.
 */

type VentanaDelBanco = Window & {
  __amanecerDelBanco?: {
    estado: () => { activo: boolean; s: number; avance: number; pedido: number; texto: number; abajo: number; frente: number; rayos: number; resplandor: number; sostiene: boolean }
    /** Deja el amanecer quieto en el segundo `s` (o lo suelta con `null`): para fotografiar cada momento. */
    congelar: (s: number | null) => void
  }
}

interface PropsDelAmanecer {
  readonly moireRef: RefObject<MoireHandle | null>
  readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null>
  /** [ESCENA 8] Con menos movimiento no hay evento: el día llega de una vez en la compuerta. */
  readonly quieto: boolean
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

/** [ESCENA 8] T3 · ¿El pie ya está a la vista? (Su tinta es de día y no espera al amanecer.) */
function pieALaVista(m: { pie: Element | null }): boolean {
  if (m.pie === null || !m.pie.isConnected) m.pie = document.querySelector('[data-panel="cierre"]')
  return m.pie !== null && m.pie.getBoundingClientRect().top < window.innerHeight
}

/** Los haces, alrededor del ojo y sólo mientras hay rayos. */
function mostrarLosHaces(malla: THREE.Mesh, hay: boolean, ojo: THREE.Vector3): boolean {
  malla.visible = hay
  malla.position.copy(ojo)
  return hay
}

function AmanecerPrendido({ moireRef, logoMaterialRef, quieto }: PropsDelAmanecer) {
  const memoria = useRef({ activo: false, avance: 0, pedido: 0, cuadros: 0, pie: null as Element | null, logo: null as THREE.MeshStandardMaterial | null, congelado: null as number | null, entero: false, pedidoAlLlegar: 0 })
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
    malla.name = 'rayos del amanecer'
    malla.frustumCulled = false
    malla.renderOrder = 3
    malla.visible = false
    return { malla, geometria, material }
  }, [])
  useEffect(() => () => {
    haces.geometria.dispose()
    haces.material.dispose()
  }, [haces])

  // Al desmontarse, el texto del final no queda esperando un día que ya nadie escribe.
  useEffect(
    () => () => {
      DIA_DEL_TEXTO.frase.set(1)
      DIA_DEL_TEXTO.abajo.set(1)
    },
    [],
  )

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__amanecerDelBanco = {
      estado: () => ({ activo: memoria.current.activo, s: memoria.current.avance * AMANECER.final, avance: memoria.current.avance, pedido: memoria.current.pedido, texto: DIA_DEL_TEXTO.frase.get(), abajo: DIA_DEL_TEXTO.abajo.get(), frente: AMANECER_EN_VIVO.uFrenteDelDia.value, rayos: AMANECER_EN_VIVO.uRayos.value, resplandor: AMANECER_EN_VIVO.uResplandor.value, sostiene: NOCHE_DEL_AMANECER.sostenida }),
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
    // [ESCENA 8] T3: el avance persigue al que pide el scroll (el borde de Tu panel), con una velocidad tope.
    m.cuadros += 1
    // [CALIDAD 1] A1: en un viaje de día a día, desde el primer cuadro la compuerta del destino (Tu panel corrido allá).
    const luzDelViaje = viajeEnCurso()?.luz ?? null
    const bloque = DIA_DEL_FINAL.activo || luzDelViaje !== null ? medirElBloqueOpaco(document, window.innerHeight) : null
    const enLaLlegada = luzDelViaje !== null && bloque !== null ? compuertaEnLaLlegada(bloque.tuPanel.pie - (luzDelViaje.y1 - window.scrollY), bloque.alto) : null
    const activo = enLaLlegada ?? DIA_DEL_FINAL.activo
    m.pedido = activo && bloque !== null ? avanceDelScroll(bloque.tuPanel.pie, bloque.alto) : 0
    const recien = activo && !m.activo
    m.activo = activo
    if (m.congelado !== null) m.avance = m.congelado / AMANECER.final
    else if (!activo) {
      m.avance = 0
      m.entero = false
    } else {
      const oculto = delta > PAUSA_S || (bloque !== null && bloqueTapaElCuadro(bloque))
      pasoDelAmanecer(m, enLaLlegada !== null, m.pedido, dt, { recien, carga: m.cuadros <= 3, quieto, viaje: viajeEnCurso() !== null, oculto, pie: pieALaVista(m) })
    }
    DIA_DEL_TEXTO.frase.set(m.activo ? diaParaElTexto(m.avance, 'frase') : 1)
    DIA_DEL_TEXTO.abajo.set(m.activo ? diaParaElTexto(m.avance, 'abajo') : 1)
    const momento = momentoEn(m.activo ? m.avance * AMANECER.final : AMANECER.final + 1)
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
