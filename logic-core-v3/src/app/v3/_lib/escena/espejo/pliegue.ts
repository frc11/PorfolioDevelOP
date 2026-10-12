import * as THREE from 'three'

/**
 * [PULIDO 18] P2 · EL PLIEGUE DE LA CÚPULA (`docs/rediseno/DIMENSION-ESPEJO.md`): un tramo de la trama del moiré (los dos cilindros), desde
 * una altura, se dobla y se enrolla hacia adentro, por encima de la escena, como la ciudad de la película; lento, monumental, y vuelve
 * (la amplitud a cero la deja como estaba: la cuenta es la identidad). Es un DOBLEZ CIRCULAR por vértices (Barr, 1984): lo que está
 * arriba de la línea recorre un arco de radio `radio / amplitud`, y la normal gira lo mismo (la luz de la sala sigue respondiendo).
 * Un parche más del material de la trama (encadenado a los que ya tiene); sólo se pone con `?espejo=pliegue`.
 */
export const PLIEGUE = {
  /** Desde qué altura del mundo se dobla (u: apenas arriba del logo, para que el doblez entre en lo que se ve), el radio del doblez
   *  entero (u) y el medio ancho del tramo de la vuelta (rad). */
  desde: 3,
  radio: 7,
  ancho: 1.1,
} as const

/** Las uniformes del pliegue (las mismas en los dos cilindros): (amplitud, el ángulo del tramo, su medio ancho, la altura) y el radio. */
export const PLIEGUE_EN_VIVO = {
  uPliegue: { value: new THREE.Vector4(0, 0, PLIEGUE.ancho, PLIEGUE.desde) },
  uPliegueRadio: { value: PLIEGUE.radio },
}

const PARS = /* glsl */ `
uniform vec4 uPliegue;
uniform float uPliegueRadio;
// El ángulo del doblez de un punto (del objeto) y la dirección horizontal desde el eje; 0 abajo de la línea o fuera del tramo.
float anguloDelPliegue( vec3 p, out vec2 dir, out float curva ) {
	float r = length( p.xz );
	dir = r > 1e-4 ? p.xz / r : vec2( 1.0, 0.0 );
	float fi = atan( p.z, p.x );
	float lejos = abs( atan( sin( fi - uPliegue.y ), cos( fi - uPliegue.y ) ) );
	// El tramo cae suave a lo ancho entero (con una caída corta, las columnas vecinas se doblaban muy distinto: desgarros a los costados).
	float tramo = 1.0 - smoothstep( 0.0, uPliegue.z, lejos );
	tramo = tramo * tramo * ( 3.0 - 2.0 * tramo );
	curva = uPliegue.x * tramo / max( 1e-3, uPliegueRadio );
	return max( 0.0, p.y + modelMatrix[ 3 ].y - uPliegue.w ) * curva;
}
`

const NORMAL = /* glsl */ `#include <beginnormal_vertex>
	{
		vec2 dirN;
		float curvaN;
		float thN = anguloDelPliegue( position, dirN, curvaN );
		float afuera = dot( objectNormal.xz, dirN );
		if ( thN > 0.0 ) objectNormal = vec3( dirN.x * cos( thN ) * afuera, sin( thN ) * afuera, dirN.y * cos( thN ) * afuera );
	}`

const DOBLEZ = /* glsl */ `#include <begin_vertex>
	{
		vec2 dir;
		float curva;
		float th = anguloDelPliegue( transformed, dir, curva );
		if ( th > 0.0 ) {
			float linea = uPliegue.w - modelMatrix[ 3 ].y;
			float r = length( transformed.xz );
			transformed.xz = dir * ( r - ( 1.0 - cos( th ) ) / curva );
			transformed.y = linea + sin( th ) / curva;
		}
	}`

/** Le agrega el pliegue al material de un cilindro de la trama (encadenado a lo que ya le hacían). */
export function conPliegue<T extends THREE.Material>(material: T): T {
  const previo = material.onBeforeCompile.bind(material)
  const clave = material.customProgramCacheKey.bind(material)
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    Object.assign(shader.uniforms, PLIEGUE_EN_VIVO)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${PARS}`)
      .replace('#include <beginnormal_vertex>', NORMAL)
      .replace('#include <begin_vertex>', DOBLEZ)
  }
  material.customProgramCacheKey = () => `${clave()}|pliegue`
  material.needsUpdate = true
  return material
}
