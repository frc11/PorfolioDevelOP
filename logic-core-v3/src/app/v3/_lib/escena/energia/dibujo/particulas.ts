import * as THREE from 'three'

import { COLOR_DE_LA_ESCENA_GLSL, PROFUNDIDAD_GLSL } from '../../pase/pase'
import { RUIDO_GLSL } from '../ruido'
import { AL_TONO, COMUN } from './comun'

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
// [PULIDO 18] P1.0 · el estilo `estela` se borró con C (la estela por la velocidad sigue: `uMovida.x`). [PULIDO 19] Q0 · y `mota` con B.
export type Estilo = 'chispa'
export type NombreDelAspecto = 'uTamano' | 'uLuz' | 'uDia' | 'uDiaForma' | 'uMovida' | 'uFuente' | 'uDestello' | 'uDelante' | 'uChispa' | 'uCalorDia' | 'uNucleo'
export const NOMBRES_DEL_ASPECTO: readonly NombreDelAspecto[] = ['uTamano', 'uLuz', 'uDia', 'uDiaForma', 'uMovida', 'uFuente', 'uDestello', 'uDelante', 'uChispa', 'uCalorDia', 'uNucleo']

/** Por estilo, las seis uniformes del aspecto (cada una, cuatro números). */
export const ASPECTO: Readonly<Record<Estilo, Readonly<Record<NombreDelAspecto, readonly [number, number, number, number]>>>> = {
  chispa: {
    // El radio del núcleo en el mundo (u, de la más chica a la más grande) y sus topes en px.
    uTamano: [0.022, 0.075, 0.8, 6],
    // De noche: el brillo, la parte que brilla en reposo, el peso del halo y su ancho (en radios del núcleo).
    uLuz: [1.1, 0.22, 0.22, 3],
    // De día: el alfa del cuerpo oscuro, el brillo especular (corrido hacia la luz), la parte que se ve en reposo y desde qué energía
    // el especular está entero. [PULIDO 18] P1.c · un cuerpo oscuro y nítido (el núcleo), un velo tenue alrededor y el especular mínimo: sin el punto
    // blanco al centro (con él, las calientes se leían como ojos o burbujas).
    uDia: [0.6, 0.55, 0.18, 0.6],
    // De día, el velo alrededor del cuerpo: su ancho (radios de la partícula), su mínimo (px) y su alfa.
    uDiaForma: [1.6, 1.2, 0.22, 0],
    // La estela (s de recorrido), el temblor caliente (px), el desenfoque (px por unidad fuera del plano del logo) y su tope.
    uMovida: [0, 1.6, 0.5, 10],
    // La fuente: el radio desde el logo en que se mantiene (u), cuánto se apaga lejos (0 a 1), cuánto respira y su escala (1/u).
    uFuente: [6.5, 0.75, 0.55, 0.22],
    // Los destellos: por segundo en reposo y caliente, cuánto más brilla y cuánto dura (s).
    uDestello: [0.1, 0.8, 2.2, 0.14],
    // La cara del logo libre: cuánto se apaga lo que queda entre la cámara y el logo, el radio de ese cilindro (u) y el tope del brillo.
    uDelante: [0.3, 3.6, 1.6, 0],
    // [PULIDO 18] P1.d · el exponente de la ley de potencia de los tamaños (más alto, más chicas), el brillo propio más bajo (las
    // intensidades varían: muchas tenues, pocas fuertes), cuánto se ve la cruz de las más calientes y su largo (px).
    uChispa: [2.3, 0.35, 0.55, 7],
    // [PULIDO 18] P1.c · de día, el calor de las calientes: cuánto refracta lo de atrás (px), cuánto le sube el contraste, su radio (px)
    // y desde qué energía.
    uCalorDia: [2.2, 0.6, 7, 0.35],
    // [PULIDO 18] P1.d · el tope del radio del núcleo (px): chico y nítido siempre; el tamaño de la chispa lo lleva su halo corto.
    uNucleo: [1.3, 0, 0, 0],
  },
}

/** Las uniformes del aspecto de un estilo (objetos propios de su malla: el banco las ajusta). */
export function uniformesDelAspecto(estilo: Estilo): Record<NombreDelAspecto, { value: THREE.Vector4 }> & { uClaroEnReposo: { value: number } } {
  const a = ASPECTO[estilo]
  const v = (n: NombreDelAspecto): { value: THREE.Vector4 } => ({ value: new THREE.Vector4(a[n][0], a[n][1], a[n][2], a[n][3]) })
  return { uTamano: v('uTamano'), uLuz: v('uLuz'), uDia: v('uDia'), uDiaForma: v('uDiaForma'), uMovida: v('uMovida'), uFuente: v('uFuente'), uDestello: v('uDestello'), uDelante: v('uDelante'), uChispa: v('uChispa'), uCalorDia: v('uCalorDia'), uNucleo: v('uNucleo'), uClaroEnReposo: { value: CLARO_EN_REPOSO[estilo] } }
}

/** De día, el destello blanco en reposo: ninguna (con el punto claro en reposo, la energía oscura se leía como ojos; sobre el logo, como rayones). Sólo calientes. */
export const CLARO_EN_REPOSO: Readonly<Record<Estilo, number>> = { chispa: 0 }

/**
 * [PULIDO 24] V2 · DE DÍA, ATMÓSFERA SECUNDARIA (de noche, igual: aprobada). De día eran puntos negros nítidos del mismo peso sobre todo:
 * se leían como suciedad. Ahora, encima del aspecto: el tope del alfa (grafito translúcido), el tamaño (parte) y cuánto varía entre
 * ellas, cuántas casi no se ven (parte de las partículas) y cuánto, la perspectiva aérea (cuánto se funden con el papel las lejanas, entre
 * qué distancias en veces la del logo) y cuánto más se apagan sobre un texto.
 */
export const DIA_SECUNDARIO = { tope: 0.36, tamano: 0.7, variacion: 0.6, menos: 0.4, casiNada: 0.12, aerea: 0.9, desde: 0.9, hasta: 2.2, textos: 0.98 } as const
const D = DIA_SECUNDARIO
const g = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))

export const ASPECTO_GLSL = /* glsl */ `
uniform vec4 uNucleo;
uniform vec4 uChispa;
uniform vec4 uCalorDia;
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

/**
 * Lo propio de cada chispa (lo comparten la partícula y su reflejo en el piso, `reflejos.ts`): el titileo (dos ritmos; el de las
 * negativas, más rápido) y los destellos (más seguidos con energía); [PULIDO 18] P1.d · el tamaño por una LEY DE POTENCIA (una Pareto
 * truncada entre el mínimo y el máximo: muchas chicas, pocas grandes) y su brillo propio (muchas tenues, pocas fuertes).
 */
export const CHISPA_GLSL = /* glsl */ `
vec2 brillar( uint id, float e, float signo ) {
	float ritmo = mix( 0.5, 2.2, azar01( id, 21u ) ) * ( signo > 0.0 ? 0.75 : 1.35 );
	float fase = azar01( id, 22u ) * 6.2831853;
	float titila = ( 0.76 + 0.24 * sin( uTiempo * ritmo * 6.2831853 + fase ) ) * ( 0.86 + 0.14 * sin( uTiempo * ritmo * 0.31 + fase * 1.7 ) );
	float ventana = uTiempo * 1.7 + azar01( id, 23u );
	float chance = ( uDestello.x + uDestello.y * e ) / 1.7;
	float destello = azar01( id ^ ( uint( floor( ventana ) ) * 0x632be5abu ), 24u ) < chance ? exp( - fract( ventana ) / ( uDestello.w * 1.7 ) ) : 0.0;
	return vec2( titila, destello );
}
float tamanoDeLaChispa( uint id ) {
	float alfa = max( 0.2, uChispa.x );
	return uTamano.x * pow( 1.0 - azar01( id, 20u ) * ( 1.0 - pow( uTamano.x / uTamano.y, alfa ) ), - 1.0 / alfa );
}
float brilloPropio( uint id ) {
	return mix( uChispa.y, 1.0, pow( azar01( id, 27u ), 1.8 ) );
}
`

function vertices(): string {
  return /* glsl */ `
${COMUN}
${RUIDO_GLSL}
${ASPECTO_GLSL}
${CHISPA_GLSL}
attribute vec3 aLugar;
attribute vec3 aVelocidad;
attribute float aEnergia;
attribute float aBrillo;
varying vec2 vLocal;
varying float vLargo;
varying float vRadioPx;
varying vec2 vDia;
varying float vBrillo;
varying float vClaro;
varying float vTexto;
varying float vDistancia;
varying float vSuave;
varying float vCruz;
varying float vCalor;
void main() {
	uint id = uint( gl_InstanceID );
	vec3 p = aLugar;
	float e = aEnergia;
	vec3 vel = aVelocidad;
	float fundido = aBrillo;
	float signo = gl_InstanceID % 2 == 0 ? 1.0 : - 1.0;
	// El titileo y los destellos (lo propio de cada chispa: brillar).
	vec2 suyo = brillar( id, e, signo );
	float titila = suyo.x;
	float destello = suyo.y;
	// Respira con su región (un ruido lento: zonas que se encienden) y se apaga lejos de la fuente.
	float region = ruidoConGradiente( p * uFuente.w + vec3( 0.0, uTiempo * 0.09, uTiempo * 0.05 ), 5u ).x;
	float respira = max( 0.0, 1.0 + uFuente.z * region * 1.6 );
	float lejos = length( p - uCentro ) / uFuente.x;
	float fuente = mix( 1.0, exp( - lejos * lejos ), uFuente.y );
	// La cara del logo libre: lo que queda entre la cámara y el logo, cerca del eje de la mirada, se apaga.
	vec3 eje = uCentro - cameraPosition;
	float hastaElLogo = length( eje );
	eje /= max( 1e-4, hastaElLogo );
	vec3 desdeLaCamara = p - cameraPosition;
	float enElEje = dot( desdeLaCamara, eje );
	float alCostado = length( desdeLaCamara - eje * enElEje );
	fuente *= 1.0 - uDelante.x * ( 1.0 - smoothstep( 0.6 * uDelante.y, uDelante.y, alCostado ) ) * smoothstep( 0.0, 0.12 * hastaElLogo, hastaElLogo - enElEje );
	// El tamaño: muchas chicas, pocas grandes (la ley de potencia); calientes y al destellar, un poco más.
	float radioMundo = tamanoDeLaChispa( id ) * ( 1.0 + 0.35 * e + 0.4 * destello );
	// [PULIDO 18] P1.b · la partícula vive en el mundo (no se suma el centro del logo: no lo sigue).
	vec4 mv = viewMatrix * vec4( p, 1.0 );
	float distancia = max( 0.5, - mv.z );
	float nitido = uEscalaPx * radioMundo / distancia;
	float desenfoque = min( abs( distancia - uFoco ) * uMovida.z, uMovida.w );
	float radio = clamp( sqrt( nitido * nitido + desenfoque * desenfoque ), uTamano.z, uTamano.w + desenfoque );
	// El mismo brillo total: lo que se abre (o lo que no llega al mínimo) se ve más tenue.
	float conserva = mix( min( 1.0, ( nitido * nitido ) / max( 1e-4, radio * radio ) ), 1.0, 0.2 );
	// [PULIDO 24] V2 · de día, más chica y más variada; y algunas casi no se ven (las mismas, menos presentes).
	vDia = vec2( mix( ${g(D.tamano)} * ( ${g(1 - D.variacion / 2)} + ${g(D.variacion)} * azar01( id, 29u ) ), 1.0, uNoche ), azar01( id, 30u ) < ${g(D.menos)} ? ${g(D.casiNada)} : 1.0 );
	radio *= vDia.x;
	float radioPx = radio * uPixel;
	vec4 cP = projectionMatrix * mv;
	vec4 cQ = projectionMatrix * viewMatrix * vec4( p - vel * uMovida.x, 1.0 );
	if ( cP.w <= 0.05 || cQ.w <= 0.05 ) {
		gl_Position = vec4( 2.0, 2.0, 2.0, 1.0 );
		vBrillo = 0.0;
		vClaro = 0.0;
		vTexto = 0.0;
		vLocal = vec2( 0.0 );
		vLargo = 0.0;
		vRadioPx = 1.0;
		vDistancia = 0.0;
		vSuave = 1.0;
		vCruz = 0.0;
		vCalor = 0.0;
		return;
	}
	vec2 mitad = uResolucion * 0.5;
	vec2 sP = cP.xy / cP.w * mitad;
	vec2 sQ = cQ.xy / cQ.w * mitad;
	// Con energía, tiembla. [PULIDO 21] S5 · suave y leve (cada una a su ritmo): saltar a un lugar al azar 30 veces por segundo era el
	// jitter del cúmulo del cursor (ahí todas están calientes).
	vec2 ritmo = 7.0 + 6.0 * vec2( azar01( id, 25u ), azar01( id, 26u ) );
	vec2 tiembla = sin( uTiempo * ritmo + 6.2831853 * vec2( azar01( id, 27u ), azar01( id, 28u ) ) ) * 0.4 * uMovida.y * e * e * uPixel;
	sP += tiembla;
	sQ += tiembla;
	vec2 d = sP - sQ;
	float largo = length( d );
	vec2 dir = largo > 1e-3 ? d / largo : vec2( 1.0, 0.0 );
	vec2 normal = vec2( - dir.y, dir.x );
	// [PULIDO 18] P1.d · la cruz MUY chica de las más calientes (y al destellar fuerte).
	float cruz = uChispa.z * max( smoothstep( 0.72, 0.95, e ), 0.6 * destello );
	// El cuadrado cubre el halo de noche, el humo de día y la cruz (en px).
	// [PULIDO 18] P1.c · de día, el calor de las calientes (refracta lo de atrás): su cuadrado lo cubre.
	float calor = uCalorDia.x > 0.0 ? smoothstep( uCalorDia.w, uCalorDia.w + 0.4, e + 0.5 * destello ) * ( 1.0 - uNoche ) : 0.0;
	float ancho = max( max( radioPx * 3.0 * max( 1.0, uLuz.w ), 3.0 * max( uDiaForma.y * uPixel, radioPx * uDiaForma.x ) * ( 1.0 - uNoche ) ), max( cruz > 0.001 ? uChispa.w * uPixel : 0.0, calor > 0.001 ? 2.2 * uCalorDia.z * uPixel : 0.0 ) );
	float k = position.x * 0.5 + 0.5;
	vec2 s = mix( sQ - dir * ancho, sP + dir * ancho, k ) + normal * position.y * ancho;
	gl_Position = vec4( s / mitad * cP.w, cP.z, cP.w );
	vLocal = vec2( k * ( largo + 2.0 * ancho ) - ancho, position.y * ancho );
	vLargo = largo;
	vRadioPx = radioPx;
	// [PULIDO 18] P1.a · blanda: el halo se desvanece contra lo opaco (el piso, el logo, el pie) en su propio ancho del mundo.
	vDistancia = - mv.z;
	vCruz = cruz;
	vCalor = calor * fuente * fundido;
	vSuave = max( 0.12, 0.6 * ancho * distancia / max( 1.0, uEscalaPx ) );
	vTexto = adentroDelTexto( cP.xy / cP.w );
	float luz = 1.0 + 1.6 * luzDeLosArcos( p );
	// [PULIDO 18] P1.c · de día, lo que se ve en reposo es lo suyo (uDia.z): la energía oscura se ve también quieta.
	float vivo = mix( uDia.z + ( 1.0 - uDia.z ) * e, uLuz.y + ( 1.0 - uLuz.y ) * e, uNoche );
	// La estela reparte su luz a lo largo: más larga, más tenue por punto.
	float reparte = 1.0 / ( 1.0 + 0.35 * largo / radioPx );
	vBrillo = min( uDelante.z, uIntensidad * brilloPropio( id ) * vivo * titila * respira * fuente * ( 1.0 + uDestello.z * destello ) * luz * conserva * reparte * fundido * enElFinal( p - uCentro ) );
	// El destello blanco de día: tenue en reposo (sobre el logo negro se ve; sobre el papel, no), entero en las calientes.
	vClaro = mix( uClaroEnReposo, 1.0, smoothstep( uDia.w, uDia.w + 0.35, e + 0.5 * destello ) ) * fuente * fundido * titila;
}
`
}

const FRAGMENTOS = /* glsl */ `
${COMUN}
${AL_TONO}
${ASPECTO_GLSL}
${PROFUNDIDAD_GLSL}
${COLOR_DE_LA_ESCENA_GLSL}
varying vec2 vLocal;
varying float vLargo;
varying float vRadioPx;
varying vec2 vDia;
varying float vBrillo;
varying float vClaro;
varying float vTexto;
varying float vDistancia;
varying float vSuave;
varying float vCruz;
varying float vCalor;
void main() {
	// La distancia (px) al tramo de la estela (de la cola, 0, a la cabeza, vLargo); la cola más tenue.
	float x = vLocal.x < 0.0 ? vLocal.x : max( 0.0, vLocal.x - vLargo );
	float d2 = x * x + vLocal.y * vLocal.y;
	float r2 = d2 / ( vRadioPx * vRadioPx );
	float cola = vLargo > 0.01 ? mix( 0.3, 1.0, clamp( vLocal.x / vLargo, 0.0, 1.0 ) ) : 1.0;
	// [PULIDO 18] P1.d · el núcleo, chico y nítido: su radio tiene un tope (px); el tamaño de la chispa lo lleva el halo (corto).
	float rNucleo = min( vRadioPx, uNucleo.x * uPixel );
	rNucleo = min( rNucleo, uNucleo.x * uPixel * vDia.x );
	float nucleo = exp( - 0.5 * d2 / ( rNucleo * rNucleo ) ) * cola;
	float halo = uLuz.z * exp( - 0.5 * r2 / ( uLuz.w * uLuz.w ) ) * cola;
	// [PULIDO 18] P1.d · la cruz: dos rayos finos (en la pantalla), cortos.
	float largoDeLaCruz = uChispa.w * uPixel;
	float rayos = vCruz > 0.001 ? exp( - abs( vLocal.y ) / ( 0.45 * uPixel ) - abs( vLocal.x ) / ( 0.3 * largoDeLaCruz ) ) + exp( - abs( vLocal.x ) / ( 0.45 * uPixel ) - abs( vLocal.y ) / ( 0.3 * largoDeLaCruz ) ) : 0.0;
	vec3 luzNoche = uLuzNoche * ( ( nucleo + halo ) * uLuz.x + rayos * vCruz ) * vBrillo;
	// De día: la energía oscura (translúcida, sin borde, del tamaño de la partícula) y el destello blanco (un punto) de las calientes.
	// [PULIDO 18] P1.c · el cuerpo, nítido y del tamaño del núcleo; un brillo especular mínimo corrido hacia la luz (arriba a la
	// izquierda, la principal), sólo en los cuerpos que se ven grandes (en uno chico sería un ojo).
	float sigma = max( uDiaForma.y * uPixel, vRadioPx * uDiaForma.x );
	float humo = exp( - 0.5 * d2 / ( sigma * sigma ) ) * cola;
	float cuerpo = exp( - 0.5 * d2 / ( rNucleo * rNucleo ) ) * cola;
	vec2 alBrillo = vLocal - vec2( - 0.5, 0.5 ) * sigma;
	float especular = exp( - 0.5 * dot( alBrillo, alBrillo ) / ( 0.25 * uPixel * uPixel ) ) * uDia.y * smoothstep( 1.6 * uPixel, 3.0 * uPixel, sigma ) * vBrillo * ( 0.3 + 0.7 * vClaro );
	// El velo, con tope: una cercana y caliente no se vuelve una mancha (un lunar); el cuerpo, translúcido.
	float aDia = min( 0.85, cuerpo * uDia.x * vBrillo * 2.0 + min( 0.25, humo * uDiaForma.z * vBrillo * 2.0 ) + especular );
	vec3 colorDia = mix( uTintaDia, uClaroDia, especular / max( 1e-4, aDia ) );
	// [PULIDO 24] V2 · de día, secundaria: grafito con tope, las lejanas se funden con el papel, algunas casi nada, sobre un texto menos.
	aDia = min( aDia, ${g(D.tope)} ) * vDia.y * ( 1.0 - ${g(D.aerea)} * smoothstep( uFoco * ${g(D.desde)}, uFoco * ${g(D.hasta)}, vDistancia ) ) * ( 1.0 - ${g(D.textos)} * vTexto );
	// El calor (de día, las calientes): lo de atrás (la copia del cuadro), corrido como en el aire que tiembla y con más contraste.
	float radioDelCalor = uCalorDia.z * uPixel;
	float qc = dot( vLocal, vLocal ) / ( radioDelCalor * radioDelCalor );
	float perfil = vCalor > 0.001 && uHayColor > 0.5 ? exp( - qc ) * vCalor : 0.0;
	float tiembla = sin( uTiempo * 23.0 + vLocal.x * 0.9 ) * sin( uTiempo * 17.0 - vLocal.y * 1.1 );
	vec2 corrido = ( vLocal / max( 1e-3, radioDelCalor ) * ( 1.0 - qc ) + vec2( tiembla, - tiembla ) * 0.5 ) * perfil * uCalorDia.x * uPixel;
	// El contraste sólo oscurece los tonos medios (el papel blanco queda blanco: subirlo dibujaba aros claros).
	vec3 corridoAtras = perfil > 0.0 ? colorDeAtras( ( gl_FragCoord.xy + corrido ) / uResolucion ) : vec3( 0.0 );
	vec3 atras = mix( corridoAtras, corridoAtras * corridoAtras, min( 1.0, uCalorDia.y * perfil ) );
	float blanda = clamp( ( distanciaALoOpaco( gl_FragCoord.xy / uResolucion ) - vDistancia ) / vSuave, 0.0, 1.0 );
	float vis = ( 1.0 - uTextoFuerza * vTexto ) * ( 1.0 - uApagado ) * blanda * blanda * ( 3.0 - 2.0 * blanda );
	// La salida (la de SALIDA, con el calor debajo del cuerpo): de día tapa con su alfa; de noche suma.
	float cubre = clamp( aDia * vis, 0.0, 1.0 );
	float velo = clamp( perfil * vis, 0.0, 1.0 ) * ( 1.0 - cubre );
	vec3 noche = luzNoche * vis;
	if ( ( cubre + velo ) * ( 1.0 - uNoche ) < 0.002 && max( noche.r, max( noche.g, noche.b ) ) * uNoche < 0.002 ) discard;
	gl_FragColor = vec4( mix( alTono( colorDia ) * cubre + atras * velo, alTono( noche ), uNoche ), ( cubre + velo ) * ( 1.0 - uNoche ) );
}
`

/** Los sombreadores de las partículas, leídas de atributos (las brasas, en la CPU). [PULIDO 19] Q0 · la textura del enjambre se fue con B. */
export function sombreadoresDeParticulas(): { readonly vertexShader: string; readonly fragmentShader: string } {
  return { vertexShader: vertices(), fragmentShader: FRAGMENTOS }
}
