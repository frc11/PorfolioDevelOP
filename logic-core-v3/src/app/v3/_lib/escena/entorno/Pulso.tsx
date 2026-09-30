'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { FLOOR_RADIUS, FLOOR_Y } from '../probeScene'
import { ANILLOS_EN_EL_SHADER, VIVO } from './vivo'
import { conDithering } from '../ruidoAzul'

/**
 * [ESCENA 3] E4 · EL PULSO — el dibujo. Un solo plano en el piso con hasta tres anillos analíticos:
 * una llamada y cero geometría por onda. Cuándo nace cada anillo y de qué clase es lo decide la
 * máquina de estados (`maquinaDelPulso.ts`, corrida en `Entorno.tsx`); acá sólo se dibuja lo que dice
 * `uAnillos`.
 *
 * Cada anillo arranca en el borde del logo y desacelera, como una onda que pierde energía. De día
 * oscurece el papel apenas; de noche lo aclara.
 *
 * **[ESCENA 6] Pasa detrás del texto.** Hasta ESCENA 5 el anillo se apagaba sobre las cajas de texto
 * y dejaba un rectángulo del color del piso detrás de cada bloque: se borró. El contraste que le
 * cuesta al texto está medido (`escena6/fondos-texto`).
 */

/** Dónde nace el anillo: el borde del logo sobre el piso. */
export const NACE_EN = 3.6

/**
 * Los anillos, en GLSL: `cuantoDelPulso( r )` es cuánto se mezcla el piso hacia `vec3( uNoche )` a
 * esa distancia del centro. [ESCENA 6] Exportado: con el piso vivo lo pinta el piso mismo.
 */
export const ANILLOS_GLSL = /* glsl */ `
uniform float uTiempo;
uniform float uNoche;
uniform vec4 uAnillos[ ${ANILLOS_EN_EL_SHADER} ];

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

float cuantoDelPulso( float r ) {
	float suma = 0.0;
	for ( int i = 0; i < ${ANILLOS_EN_EL_SHADER}; i++ ) suma += anilloEn( uAnillos[ i ], r );
	return suma * mix( 0.075, 0.12, uNoche );
}
`

const VERTEX = /* glsl */ `
varying vec2 vPlano;
void main() {
	vPlano = position.xy;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

const FRAGMENT = /* glsl */ `
${ANILLOS_GLSL}
varying vec2 vPlano;

void main() {
	float cuanto = cuantoDelPulso( length( vPlano ) );
	if ( cuanto <= 0.0005 * 0.075 ) discard;
	gl_FragColor = vec4( vec3( uNoche ), cuanto );
}
`

export function Pulso() {
  const material = useMemo(
    () =>
      // [CALIDAD 1] B8: el pulso oscurece mezclando: con dithering en el color y el alfa (ruido azul).
      conDithering(new THREE.ShaderMaterial({
        uniforms: {
          uTiempo: VIVO.uTiempo,
          uNoche: VIVO.uNoche,
          uAnillos: VIVO.uAnillos,
        },
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        depthWrite: false,
      }), true),
    []
  )
  useEffect(() => () => material.dispose(), [material])

  return (
    <mesh name="pulso" position={[0, FLOOR_Y + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} material={material} renderOrder={1}>
      <circleGeometry args={[FLOOR_RADIUS, 96]} />
    </mesh>
  )
}
