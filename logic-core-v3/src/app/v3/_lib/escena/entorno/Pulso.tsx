'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { FLOOR_RADIUS, FLOOR_Y } from '../probeScene'
import { ANILLOS_EN_EL_SHADER, CAJAS_DE_TEXTO, VIVO } from './vivo'

/**
 * [ESCENA 3] E4 · EL PULSO — el dibujo. Un solo plano en el piso con hasta tres anillos analíticos:
 * una llamada y cero geometría por onda. Cuándo nace cada anillo y de qué clase es lo decide la
 * máquina de estados (`maquinaDelPulso.ts`, corrida en `Entorno.tsx`); acá sólo se dibuja lo que dice
 * `uAnillos`.
 *
 * Cada anillo arranca en el borde del logo y desacelera, como una onda que pierde energía. De día
 * oscurece el papel apenas; de noche lo aclara. Sobre las cajas de texto (`uTexto`) se apaga, con
 * un borde suave: el pulso no le baja el contraste a nada que haya que leer.
 */

/** Dónde nace el anillo: el borde del logo sobre el piso. */
const NACE_EN = 3.6

const VERTEX = /* glsl */ `
varying vec2 vPlano;
void main() {
	vPlano = position.xy;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

const FRAGMENT = /* glsl */ `
uniform float uTiempo;
uniform float uNoche;
uniform vec4 uAnillos[ ${ANILLOS_EN_EL_SHADER} ];
uniform vec4 uTexto[ ${CAJAS_DE_TEXTO} ];
uniform float uPluma;
varying vec2 vPlano;

// Un anillo: (nace, duración, alcance, amplitud). El de reposo es exactamente el de ESCENA 2.
float anilloEn( vec4 a, float r ) {
	if ( a.w <= 0.0 ) return 0.0;
	float t = ( uTiempo - a.x ) / a.y;
	if ( t < 0.0 || t > 1.0 ) return 0.0;
	float frente = ${NACE_EN.toFixed(1)} + ( a.z - ${NACE_EN.toFixed(1)} ) * ( 1.0 - pow( 1.0 - t, 2.2 ) );
	float ancho = 0.35 + 1.4 * t * ( a.z / 26.0 );
	float d = ( r - frente ) / ancho;
	return exp( - d * d ) * pow( 1.0 - t, 1.8 ) * smoothstep( 0.0, 0.06, t ) * a.w;
}

// 0 adentro de cualquier caja de texto, 1 lejos de todas, con la pluma de transición.
float fueraDelTexto() {
	float m = 1.0;
	for ( int i = 0; i < ${CAJAS_DE_TEXTO}; i++ ) {
		vec4 c = uTexto[ i ];
		if ( c.z <= c.x ) continue;
		vec2 dentro = min( gl_FragCoord.xy - c.xy, c.zw - gl_FragCoord.xy );
		m = min( m, 1.0 - smoothstep( - uPluma, 0.0, min( dentro.x, dentro.y ) ) );
	}
	return m;
}

void main() {
	float r = length( vPlano );
	float suma = 0.0;
	for ( int i = 0; i < ${ANILLOS_EN_EL_SHADER}; i++ ) suma += anilloEn( uAnillos[ i ], r );
	if ( suma <= 0.0005 ) discard;
	float cuanto = suma * mix( 0.075, 0.12, uNoche ) * fueraDelTexto();
	gl_FragColor = vec4( vec3( uNoche ), cuanto );
}
`

export function Pulso() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTiempo: VIVO.uTiempo,
          uNoche: VIVO.uNoche,
          uAnillos: VIVO.uAnillos,
          uTexto: VIVO.uTexto,
          uPluma: VIVO.uPluma,
        },
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        depthWrite: false,
      }),
    []
  )
  useEffect(() => () => material.dispose(), [material])

  return (
    <mesh position={[0, FLOOR_Y + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} material={material} renderOrder={1}>
      <circleGeometry args={[FLOOR_RADIUS, 96]} />
    </mesh>
  )
}
