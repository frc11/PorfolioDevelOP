import { FLOOR_Y } from '../../probeScene'
import { PROFUNDIDAD_GLSL } from '../../pase/pase'
import { RUIDO_GLSL } from '../ruido'
import { AL_TONO, COMUN, SALIDA } from './comun'
import { ASPECTO_GLSL, CHISPA_GLSL } from './particulas'

/**
 * [PULIDO 18] P1.a · EL REFLEJO TENUE EN EL PISO (barato, sin luces): de noche, cada chispa cerca del piso se ve también espejada debajo
 * de él, más ancha y más tenue (el papel es mate: un reflejo difuso) y cada vez menos cuanto más alta; titila y destella con su chispa
 * (`CHISPA_GLSL`). Sólo donde lo que se ve en ese píxel es el PISO (la profundidad del pase: si el logo o una pieza del pie están
 * delante, lo tapan) y no sobre un texto. Las mismas brasas y sus atributos: un dibujo más, sin física; las altas no llegan al
 * rasterizador. [CIERRE A] A3 · entra con la noche junto con su chispa (el mismo azar: `deNoche`).
 */
export const REFLEJO = {
  /** Hasta qué altura sobre el piso se refleja (u), en cuánto se apaga con la altura (u), cuánto refleja y cuánto se abre (px por u). */
  uReflejo: [2.6, 0.8, 0.22, 3.5],
  /** El piso (y). */
  piso: FLOOR_Y,
} as const

export const VERTICES_DE_LOS_REFLEJOS = /* glsl */ `
${COMUN}
${RUIDO_GLSL}
${ASPECTO_GLSL}
${CHISPA_GLSL}
uniform vec4 uReflejo;
uniform float uPiso;
attribute vec3 aLugar;
attribute float aEnergia;
attribute float aBrillo;
attribute float aNace;
varying vec2 vLocal;
varying float vRadioPx;
varying float vBrillo;
varying float vHastaElPiso;
varying float vTexto;
void main() {
	uint id = uint( gl_InstanceID );
	vec3 p = aLugar;
	float alto = p.y - uPiso;
	float e = aEnergia;
	float signo = gl_InstanceID % 2 == 0 ? 1.0 : - 1.0;
	vec3 espejo = vec3( p.x, 2.0 * uPiso - p.y, p.z );
	vec4 mv = viewMatrix * vec4( espejo, 1.0 );
	vec4 c = projectionMatrix * mv;
	vLocal = vec2( 0.0 );
	vRadioPx = 1.0;
	vBrillo = 0.0;
	vHastaElPiso = 0.0;
	vTexto = 0.0;
	float vive = deNoche( azar01( id, 34u ) );
	if ( alto > uReflejo.x || vive <= 0.0 || c.w <= 0.05 ) {
		gl_Position = vec4( 2.0, 2.0, 2.0, 1.0 );
		return;
	}
	vec2 suyo = brillar( id, e, signo );
	float distancia = max( 0.5, - mv.z );
	float radio = clamp( uEscalaPx * tamanoDeLaChispa( id ) * ( 1.0 + 0.35 * e ) / distancia + uReflejo.w * alto, uTamano.z, 2.0 * uTamano.w + uReflejo.w * uReflejo.x );
	// [PULIDO 27] Z1 · al nacer, como su chispa (\`alNacer\`).
	vec2 nacer = alNacer( aNace );
	vRadioPx = radio * max( 0.02, nacer.x ) * vive * uPixel;
	float ancho = vRadioPx * 3.0;
	vec2 mitad = uResolucion * 0.5;
	vec2 s = c.xy / c.w * mitad + position.xy * ancho;
	gl_Position = vec4( s / mitad * c.w, c.z, c.w );
	vLocal = position.xy * ancho;
	// Dónde está el piso en ese rayo (la distancia a lo largo de la mirada): ahí tiene que estar lo opaco que se ve.
	vec3 rayo = normalize( espejo - cameraPosition );
	vec3 adelante = - vec3( viewMatrix[ 0 ][ 2 ], viewMatrix[ 1 ][ 2 ], viewMatrix[ 2 ][ 2 ] );
	vHastaElPiso = ( uPiso - cameraPosition.y ) / min( - 1e-3, rayo.y ) * dot( rayo, adelante );
	vTexto = adentroDelTexto( c.xy / c.w );
	float vivo = uLuz.y + ( 1.0 - uLuz.y ) * e;
	vBrillo = uReflejo.z * uIntensidad * brilloPropio( id ) * vivo * suyo.x * ( 1.0 + uDestello.z * suyo.y ) * aBrillo * exp( - alto / uReflejo.y ) * nacer.y * vive;
}
`

export const FRAGMENTOS_DE_LOS_REFLEJOS = /* glsl */ `
${COMUN}
${AL_TONO}
${PROFUNDIDAD_GLSL}
varying vec2 vLocal;
varying float vRadioPx;
varying float vBrillo;
varying float vHastaElPiso;
varying float vTexto;
void main() {
	float r2 = dot( vLocal, vLocal ) / ( vRadioPx * vRadioPx );
	float difuso = 0.65 * exp( - 0.5 * r2 ) + 0.35 * exp( - r2 / 18.0 );
	// Sólo sobre el piso: lo opaco que se ve está donde el piso cruza ese rayo (con el mar que sube y baja).
	float esPiso = 1.0 - smoothstep( 0.35, 0.9, abs( distanciaALoOpaco( gl_FragCoord.xy / uResolucion ) - vHastaElPiso ) );
	vec3 luzNoche = uLuzNoche * difuso * vBrillo * esPiso;
	float vis = ( 1.0 - uTextoFuerza * vTexto ) * ( 1.0 - uApagado );
	${SALIDA}
}
`
