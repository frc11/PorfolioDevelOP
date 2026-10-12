import * as THREE from 'three'

import { ENJAMBRE } from '../enjambre/simulacion'
import { RUIDO_GLSL } from '../ruido'
import { AL_TONO, COMUN, SALIDA, f } from './comun'

/**
 * [PULIDO 17] O3 · CÓMO SE VE UNA PARTÍCULA DE ENERGÍA (`docs/rediseno/PLASMA.md`). Ninguna figura: un núcleo con caída gaussiana y
 * su halo (otra gaussiana, ancha y tenue), en un cuadrado que mira a la cámara y se estira con la velocidad en la pantalla (la
 * estela: desenfoque de movimiento). BRILLA: titila con su ritmo (las positivas lento y parejo, las negativas rápido), DESTELLA de vez
 * en cuando (más seguido caliente) y RESPIRA con su región (un ruido lento en el espacio: zonas que se encienden y se apagan, no cada
 * una por su lado). VIBRA: con energía, tiembla en la pantalla. Viene de la FUENTE: lejos del logo se apaga. Profundidad de campo:
 * lo que está lejos del plano del logo se abre (más grande y más tenue, el mismo brillo total). DE DÍA, energía oscura: un humo de
 * grafito muy translúcido y ancho (no una mota) y, sólo en las calientes, un destello blanco de un punto. Todo lo que se ajusta va en
 * uniformes (el banco las cambia en vivo: `banco.ts`, `ajustar`); `ASPECTO` son los valores de cada estilo.
 */
// [PULIDO 18] P1.0 · el estilo `estela` se borró con C (la estela por la velocidad sigue: `uMovida.x`).
export type Estilo = 'chispa' | 'mota'
export type NombreDelAspecto = 'uTamano' | 'uLuz' | 'uDia' | 'uDiaForma' | 'uMovida' | 'uFuente' | 'uDestello' | 'uDelante'
export const NOMBRES_DEL_ASPECTO: readonly NombreDelAspecto[] = ['uTamano', 'uLuz', 'uDia', 'uDiaForma', 'uMovida', 'uFuente', 'uDestello', 'uDelante']

/** Por estilo, las seis uniformes del aspecto (cada una, cuatro números). */
export const ASPECTO: Readonly<Record<Estilo, Readonly<Record<NombreDelAspecto, readonly [number, number, number, number]>>>> = {
  chispa: {
    // El radio del núcleo en el mundo (u, de la más chica a la más grande) y sus topes en px.
    uTamano: [0.022, 0.075, 0.8, 6],
    // De noche: el brillo, la parte que brilla en reposo, el peso del halo y su ancho (en radios del núcleo).
    uLuz: [1.1, 0.22, 0.22, 3],
    // De día: el alfa de la energía oscura, (sin uso), el alfa del destello blanco y desde qué energía aparece entero.
    uDia: [0.2, 0, 0.9, 0.6],
    // De día, la forma de la energía oscura: su ancho (radios de la partícula) y su mínimo (px).
    uDiaForma: [1.5, 1.6, 0, 0],
    // La estela (s de recorrido), el temblor caliente (px), el desenfoque (px por unidad fuera del plano del logo) y su tope.
    uMovida: [0, 1.6, 0.5, 10],
    // La fuente: el radio desde el logo en que se mantiene (u), cuánto se apaga lejos (0 a 1), cuánto respira y su escala (1/u).
    uFuente: [6.5, 0.75, 0.55, 0.22],
    // Los destellos: por segundo en reposo y caliente, cuánto más brilla y cuánto dura (s).
    uDestello: [0.1, 0.8, 2.2, 0.14],
    // La cara del logo libre: cuánto se apaga lo que queda entre la cámara y el logo, el radio de ese cilindro (u) y el tope del brillo.
    uDelante: [0.3, 3.6, 1.6, 0],
  },
  mota: {
    uTamano: [0.012, 0.04, 0.6, 4],
    uLuz: [0.7, 0.08, 0.3, 2.5],
    uDia: [0.03, 0, 0.7, 0.55],
    uDiaForma: [2.2, 3, 0, 0],
    uMovida: [0.02, 1, 0.4, 7],
    uFuente: [5.5, 0.85, 0.75, 0.25],
    uDestello: [0.04, 0.6, 2.6, 0.12],
    uDelante: [0.7, 3.6, 1.1, 0],
  },
}

/** Las uniformes del aspecto de un estilo (objetos propios de su malla: el banco las ajusta). */
export function uniformesDelAspecto(estilo: Estilo): Record<NombreDelAspecto, { value: THREE.Vector4 }> & { uClaroEnReposo: { value: number } } {
  const a = ASPECTO[estilo]
  const v = (n: NombreDelAspecto): { value: THREE.Vector4 } => ({ value: new THREE.Vector4(a[n][0], a[n][1], a[n][2], a[n][3]) })
  return { uTamano: v('uTamano'), uLuz: v('uLuz'), uDia: v('uDia'), uDiaForma: v('uDiaForma'), uMovida: v('uMovida'), uFuente: v('uFuente'), uDestello: v('uDestello'), uDelante: v('uDelante'), uClaroEnReposo: { value: CLARO_EN_REPOSO[estilo] } }
}

/** De día, el destello blanco en reposo: ninguna (con el punto claro en reposo, la energía oscura se leía como ojos; sobre el logo, como rayones). Sólo calientes. */
export const CLARO_EN_REPOSO: Readonly<Record<Estilo, number>> = { chispa: 0, mota: 0 }

const ASPECTO_GLSL = /* glsl */ `
uniform vec4 uTamano;
uniform vec4 uLuz;
uniform vec4 uDia;
uniform vec4 uDiaForma;
uniform vec4 uMovida;
uniform vec4 uFuente;
uniform vec4 uDestello;
uniform vec4 uDelante;
uniform float uIntensidad;
uniform float uClaroEnReposo;
`

function vertices(desdeTextura: boolean, idDesde: number): string {
  return /* glsl */ `
${COMUN}
${RUIDO_GLSL}
${ASPECTO_GLSL}
${desdeTextura ? 'uniform sampler2D uLugares;\nuniform sampler2D uVelocidades;\nuniform float uLado;' : 'attribute vec3 aLugar;\nattribute vec3 aVelocidad;\nattribute float aEnergia;\nattribute float aBrillo;'}
varying vec2 vLocal;
varying float vLargo;
varying float vRadioPx;
varying float vBrillo;
varying float vClaro;
varying float vTexto;
void main() {
	uint id = uint( gl_InstanceID ) + ${String(idDesde)}u;
${desdeTextura
    ? `	ivec2 t = ivec2( gl_InstanceID % int( uLado ), gl_InstanceID / int( uLado ) );
	vec4 L = texelFetch( uLugares, t, 0 );
	vec4 V = texelFetch( uVelocidades, t, 0 );
	vec3 p = L.xyz;
	float e = L.w;
	vec3 vel = V.xyz;
	float vida = ${f(ENJAMBRE.vida[0])} + ${f(ENJAMBRE.vida[1] - ENJAMBRE.vida[0])} * azar01( uint( gl_InstanceID ), 7u );
	float fundido = smoothstep( 0.0, 0.8, V.w ) * smoothstep( vida, vida - 1.2, V.w );`
    : `	vec3 p = aLugar;
	float e = aEnergia;
	vec3 vel = aVelocidad;
	float fundido = aBrillo;`}
	float signo = gl_InstanceID % 2 == 0 ? 1.0 : - 1.0;
	// El titileo (dos ritmos; el de las negativas, más rápido) y los destellos (más seguidos con energía).
	float ritmo = mix( 0.5, 2.2, azar01( id, 21u ) ) * ( signo > 0.0 ? 0.75 : 1.35 );
	float fase = azar01( id, 22u ) * 6.2831853;
	float titila = ( 0.76 + 0.24 * sin( uTiempo * ritmo * 6.2831853 + fase ) ) * ( 0.86 + 0.14 * sin( uTiempo * ritmo * 0.31 + fase * 1.7 ) );
	float ventana = uTiempo * 1.7 + azar01( id, 23u );
	float chance = ( uDestello.x + uDestello.y * e ) / 1.7;
	float destello = azar01( id ^ ( uint( floor( ventana ) ) * 0x632be5abu ), 24u ) < chance ? exp( - fract( ventana ) / ( uDestello.w * 1.7 ) ) : 0.0;
	// Respira con su región (un ruido lento: zonas que se encienden) y se apaga lejos de la fuente.
	float region = ruidoConGradiente( p * uFuente.w + vec3( 0.0, uTiempo * 0.09, uTiempo * 0.05 ), 5u ).x;
	float respira = max( 0.0, 1.0 + uFuente.z * region * 1.6 );
	float lejos = length( p ) / uFuente.x;
	float fuente = mix( 1.0, exp( - lejos * lejos ), uFuente.y );
	// La cara del logo libre: lo que queda entre la cámara y el logo, cerca del eje de la mirada, se apaga.
	vec3 eje = uCentro - cameraPosition;
	float hastaElLogo = length( eje );
	eje /= max( 1e-4, hastaElLogo );
	vec3 desdeLaCamara = uCentro + p - cameraPosition;
	float enElEje = dot( desdeLaCamara, eje );
	float alCostado = length( desdeLaCamara - eje * enElEje );
	fuente *= 1.0 - uDelante.x * ( 1.0 - smoothstep( 0.6 * uDelante.y, uDelante.y, alCostado ) ) * smoothstep( 0.0, 0.12 * hastaElLogo, hastaElLogo - enElEje );
	// El tamaño: muchas chicas, pocas grandes; calientes y al destellar, un poco más.
	float radioMundo = mix( uTamano.x, uTamano.y, pow( azar01( id, 20u ), 2.6 ) ) * ( 1.0 + 0.35 * e + 0.4 * destello );
	vec4 mv = viewMatrix * vec4( uCentro + p, 1.0 );
	float distancia = max( 0.5, - mv.z );
	float nitido = uEscalaPx * radioMundo / distancia;
	float desenfoque = min( abs( distancia - uFoco ) * uMovida.z, uMovida.w );
	float radio = clamp( sqrt( nitido * nitido + desenfoque * desenfoque ), uTamano.z, uTamano.w + desenfoque );
	// El mismo brillo total: lo que se abre (o lo que no llega al mínimo) se ve más tenue.
	float conserva = mix( min( 1.0, ( nitido * nitido ) / max( 1e-4, radio * radio ) ), 1.0, 0.2 );
	float radioPx = radio * uPixel;
	vec4 cP = projectionMatrix * mv;
	vec4 cQ = projectionMatrix * viewMatrix * vec4( uCentro + p - vel * uMovida.x, 1.0 );
	if ( cP.w <= 0.05 || cQ.w <= 0.05 ) {
		gl_Position = vec4( 2.0, 2.0, 2.0, 1.0 );
		vBrillo = 0.0;
		vClaro = 0.0;
		vTexto = 0.0;
		vLocal = vec2( 0.0 );
		vLargo = 0.0;
		vRadioPx = 1.0;
		return;
	}
	vec2 mitad = uResolucion * 0.5;
	vec2 sP = cP.xy / cP.w * mitad;
	vec2 sQ = cQ.xy / cQ.w * mitad;
	// Con energía, tiembla (30 veces por segundo, una vuelta al azar de hasta «tiembla» px).
	uint cuadro = uint( floor( uTiempo * 30.0 ) );
	vec2 tiembla = ( vec2( azar01( id ^ cuadro * 0x165667b1u, 25u ), azar01( id ^ cuadro * 0x165667b1u, 26u ) ) * 2.0 - 1.0 ) * uMovida.y * e * e * uPixel;
	sP += tiembla;
	sQ += tiembla;
	vec2 d = sP - sQ;
	float largo = length( d );
	vec2 dir = largo > 1e-3 ? d / largo : vec2( 1.0, 0.0 );
	vec2 normal = vec2( - dir.y, dir.x );
	// El cuadrado cubre el halo de noche y el humo de día (en px).
	float ancho = max( radioPx * 3.0 * max( 1.0, uLuz.w ), 3.0 * max( uDiaForma.y * uPixel, radioPx * uDiaForma.x ) * ( 1.0 - uNoche ) );
	float k = position.x * 0.5 + 0.5;
	vec2 s = mix( sQ - dir * ancho, sP + dir * ancho, k ) + normal * position.y * ancho;
	gl_Position = vec4( s / mitad * cP.w, cP.z, cP.w );
	vLocal = vec2( k * ( largo + 2.0 * ancho ) - ancho, position.y * ancho );
	vLargo = largo;
	vRadioPx = radioPx;
	vTexto = adentroDelTexto( cP.xy / cP.w );
	float luz = 1.0 + 1.6 * luzDeLosArcos( p );
	float vivo = uLuz.y + ( 1.0 - uLuz.y ) * e;
	// La estela reparte su luz a lo largo: más larga, más tenue por punto.
	float reparte = 1.0 / ( 1.0 + 0.35 * largo / radioPx );
	vBrillo = min( uDelante.z, uIntensidad * vivo * titila * respira * fuente * ( 1.0 + uDestello.z * destello ) * luz * conserva * reparte * fundido * enElFinal( p ) );
	// El destello blanco de día: tenue en reposo (sobre el logo negro se ve; sobre el papel, no), entero en las calientes.
	vClaro = mix( uClaroEnReposo, 1.0, smoothstep( uDia.w, uDia.w + 0.35, e + 0.5 * destello ) ) * fuente * fundido * titila;
}
`
}

const FRAGMENTOS = /* glsl */ `
${COMUN}
${AL_TONO}
${ASPECTO_GLSL}
varying vec2 vLocal;
varying float vLargo;
varying float vRadioPx;
varying float vBrillo;
varying float vClaro;
varying float vTexto;
void main() {
	// La distancia (px) al tramo de la estela (de la cola, 0, a la cabeza, vLargo); la cola más tenue.
	float x = vLocal.x < 0.0 ? vLocal.x : max( 0.0, vLocal.x - vLargo );
	float d2 = x * x + vLocal.y * vLocal.y;
	float r2 = d2 / ( vRadioPx * vRadioPx );
	float cola = vLargo > 0.01 ? mix( 0.3, 1.0, clamp( vLocal.x / vLargo, 0.0, 1.0 ) ) : 1.0;
	float nucleo = exp( - 0.5 * r2 ) * cola;
	float halo = uLuz.z * exp( - 0.5 * r2 / ( uLuz.w * uLuz.w ) ) * cola;
	vec3 luzNoche = uLuzNoche * ( nucleo + halo ) * vBrillo * uLuz.x;
	// De día: la energía oscura (translúcida, sin borde, del tamaño de la partícula) y el destello blanco (un punto) de las calientes.
	float sigma = max( uDiaForma.y * uPixel, vRadioPx * uDiaForma.x );
	float humo = exp( - 0.5 * d2 / ( sigma * sigma ) ) * cola;
	float punto = exp( - 0.5 * d2 / ( 0.64 * uPixel * uPixel ) ) * vClaro * uDia.z;
	float aDia = min( 0.9, humo * uDia.x * vBrillo * 2.0 + punto );
	vec3 colorDia = mix( uTintaDia, uClaroDia, punto / max( 1e-4, aDia ) );
	float vis = ( 1.0 - uTextoFuerza * vTexto ) * ( 1.0 - uApagado );
	${SALIDA}
}
`

/** Los sombreadores de las partículas, leídas de atributos (las brasas, en la CPU) o de la textura del enjambre. */
export function sombreadoresDeParticulas(desdeTextura: boolean, idDesde = 0): { readonly vertexShader: string; readonly fragmentShader: string } {
  return { vertexShader: vertices(desdeTextura, idDesde), fragmentShader: FRAGMENTOS }
}
