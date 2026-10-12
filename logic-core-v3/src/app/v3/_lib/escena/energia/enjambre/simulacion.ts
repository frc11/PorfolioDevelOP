import { CAMPO_DEL_LOGO_GLSL } from '../../polvo/campoDelLogo'
import { ARCOS } from '../arcos/arcos'
import { BRASAS } from '../brasas'
import { RUIDO_GLSL } from '../ruido'

/**
 * [PULIDO 17] O3 · EL ENJAMBRE EN LA GPU (la dirección B; C se borró en PULIDO 18; `docs/rediseno/PLASMA.md`). Miles de motas en una textura (el ping-pong
 * de la escena, `gpu/pingPong.ts`: posición y energía en una salida, velocidad y edad en la otra). Todas las fuerzas son CAMPOS, no
 * pares: el curl noise (`ruido.ts`) que rodea al logo sin atravesarlo (su campo de distancia, el del polvo: cerca de la superficie
 * el flujo sólo puede correr de costado), los núcleos calientes (brasas de la CPU: los positivos atraen, los negativos repelen, y
 * hacen girar), el puntero (atrae, hace girar alrededor de su rayo, energiza), las ondas del clic y del logo, los arcos (energizan
 * lo que tienen cerca) y la agitación térmica. Cada mota vive un rato y renace en otro lugar (el medio se renueva solo).
 */
export const ENJAMBRE = {
  /** Dónde viven (u): el radio de la cáscara, el hueco del medio (suave: lo duro es el campo del logo) y el reparto (>1: más adentro). */
  radio: 13,
  hueco: 3.6,
  reparto: 1.5,
  /** Cuánto vive cada mota (s, al azar entre los dos). */
  vida: [6, 14],
  /** El campo: rapidez (u/s), cuánto más rápido caliente, en cuánto lo siguen (1/s) y la rampa del logo (u: a menos, el flujo corre de costado). */
  flujo: { rapidez: 0.55, caliente: 1.2, sigue: 1.1, rampa: 1.2 },
  /** Los núcleos: su fuerza (u³/s²), el suavizado (u²), el giro y cuánto calientan lo que tienen al lado (1/s). */
  nucleos: { maximo: 48, fuerza: 1.1, suave: 0.7, gira: 0.9, calienta: 0.8 },
  /** El logo: el empuje contra la superficie y la corona (cuando está activo, las motas buscan su borde y se encienden). */
  logo: { empuje: 30, corona: 1.6, calienta: 1.4 },
  /** El puntero (desde su rayo, u): alcance, atracción, rechazo pegado, giro y cuánto calienta (1/s). */
  cursor: { alcance: 4.6, atrae: 2.4, cerca: 0.9, rechazo: 9, gira: 2.2, calienta: 2.2 },
  /** Las ondas de los pulsos (como las de las brasas) y las del logo. */
  onda: { rapidez: 10, ancho: 1.1, empuje: 2.4, calienta: 0.85, llega: 11 },
  anillo: { calienta: 0.9, ancho: 1.2 },
  /** Los arcos: cuánto calientan lo que pasa cerca (1/s) y el radio (u). */
  arco: { calienta: 5, radio: 0.55 },
  /** La energía: la de reposo (más con la temperatura), en cuánto se enfría (s) y cuánto tiembla una mota caliente (u/s²). */
  energia: { base: 0.08, porTemperatura: 0.4, apagaS: 0.9, tiembla: 3 },
  /** La amortiguación (1/s), el tope de velocidad (u/s, más caliente) y la cáscara. */
  arrastre: 0.9,
  tope: 3.2,
  contiene: 1.6,
} as const

/** Los ajustes de la simulación que van en uniformes (cada dirección los cambia; el banco, en vivo). [PULIDO 18] P1.0 · sin la superficie de C. */
export type AjustesDelEnjambre = Readonly<Record<'uFlujo' | 'uNucleosAjuste' | 'uReparto' | 'uEnergiaAjuste' | 'uCursorAjuste', readonly [number, number, number, number]>>
export const AJUSTES_DEL_ENJAMBRE: AjustesDelEnjambre = {
  uFlujo: [ENJAMBRE.flujo.rapidez, ENJAMBRE.flujo.caliente, ENJAMBRE.flujo.sigue, ENJAMBRE.flujo.rampa],
  uNucleosAjuste: [ENJAMBRE.nucleos.fuerza, ENJAMBRE.nucleos.suave, ENJAMBRE.nucleos.gira, ENJAMBRE.nucleos.calienta],
  uReparto: [ENJAMBRE.hueco, ENJAMBRE.radio, ENJAMBRE.reparto, ENJAMBRE.contiene],
  uEnergiaAjuste: [ENJAMBRE.energia.base, ENJAMBRE.energia.porTemperatura, ENJAMBRE.energia.apagaS, ENJAMBRE.energia.tiembla],
  uCursorAjuste: [ENJAMBRE.cursor.alcance, ENJAMBRE.cursor.atrae, ENJAMBRE.cursor.gira, ENJAMBRE.cursor.calienta],
}

const f = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))
const E = ENJAMBRE

export const SIMULACION_DEL_ENJAMBRE_GLSL = /* glsl */ `
precision highp float;
precision highp int;
${CAMPO_DEL_LOGO_GLSL}
${RUIDO_GLSL}
uniform sampler2D uEstado[ 2 ];
uniform vec2 uTam;
uniform float uDt;
uniform float uTiempo;
uniform float uTemperatura;
uniform float uNacer;
uniform float uCuadro;
uniform vec4 uNucleos[ ${String(E.nucleos.maximo)} ];
uniform float uCuantosNucleos;
uniform vec3 uRayoO;
uniform vec3 uRayoD;
uniform vec2 uPuntero;
uniform vec4 uPulsos[ 2 ];
uniform vec4 uFrentes[ 2 ];
uniform vec4 uArcosA[ ${String(ARCOS.lugares)} ];
uniform vec4 uArcosB[ ${String(ARCOS.lugares)} ];
uniform float uCuantosArcos;
uniform vec3 uCentro;
uniform mat4 uLogoInverso;
uniform float uActividadDelLogo;
uniform vec4 uFlujo;
uniform vec4 uNucleosAjuste;
uniform vec4 uReparto;
uniform vec4 uEnergiaAjuste;
uniform vec4 uCursorAjuste;
uniform float uPiso;
in vec2 vUv;
layout( location = 0 ) out vec4 salidaLugar;
layout( location = 1 ) out vec4 salidaVelocidad;

vec3 nacer( uint id ) {
	float z = azar01( id, 11u ) * 2.0 - 1.0;
	float fi = azar01( id, 12u ) * 6.2831853;
	float s = sqrt( max( 0.0, 1.0 - z * z ) );
	float r = mix( uReparto.x, uReparto.y, pow( azar01( id, 13u ), uReparto.z ) );
	return vec3( cos( fi ) * s, z, sin( fi ) * s ) * r;
}

float alSegmento( vec3 p, vec3 a, vec3 b ) {
	vec3 ab = b - a;
	float t = clamp( dot( p - a, ab ) / max( dot( ab, ab ), 1e-6 ), 0.0, 1.0 );
	return length( p - a - ab * t );
}

// La onda de un pulso: cuánto de la cresta hay a la distancia d (u del centro de la onda), con su frente en «frente».
float cresta( float d, float frente, float ancho ) {
	return max( 0.0, 1.0 - abs( d - frente ) / ancho );
}

void main() {
	ivec2 c = ivec2( gl_FragCoord.xy );
	uint id = uint( c.y ) * uint( uTam.x ) + uint( c.x );
	vec4 L = texelFetch( uEstado[ 0 ], c, 0 );
	vec4 V = texelFetch( uEstado[ 1 ], c, 0 );
	vec3 p = L.xyz;
	float e = L.w;
	vec3 v = V.xyz;
	float edad = V.w;
	float dt = uDt;
	float vida = ${f(E.vida[0])} + ${f(E.vida[1] - E.vida[0])} * azar01( id, 7u );
	uint generacion = uint( uCuadro ) * 0x27d4eb2du;
	float reposo = uEnergiaAjuste.x + uEnergiaAjuste.y * uTemperatura;
	if ( uNacer > 0.5 ) {
		p = nacer( id ^ generacion );
		v = vec3( 0.0 );
		e = reposo;
		edad = vida * azar01( id, 8u );
	} else if ( edad > vida || dot( p, p ) > 1.6 * uReparto.y * uReparto.y || !( dot( p, p ) < 1e8 ) || !( dot( v, v ) < 1e8 ) ) {
		p = nacer( id ^ generacion );
		v = vec3( 0.0 );
		e = reposo;
		edad = 0.0;
	}
	float gana = 0.0;
	// El campo, que cerca del logo sólo corre de costado (no lo atraviesa).
	vec3 q = ( uLogoInverso * vec4( p, 1.0 ) ).xyz;
	float dl = campoDelLogo( q );
	vec3 nl = vec3( 0.0 );
	if ( dl < 2.5 ) nl = normalize( transpose( mat3( uLogoInverso ) ) * normalDelCampo( q ) );
	vec3 flujo = rotor( p, uTiempo ) * uFlujo.x * ( 1.0 + uFlujo.y * uTemperatura );
	flujo -= nl * dot( flujo, nl ) * ( 1.0 - smoothstep( 0.0, uFlujo.w, dl ) );
	vec3 a = ( flujo - v ) * uFlujo.z;
	// El logo: no se entra; activo, una corona que busca su borde y se enciende.
	if ( dl < 0.3 ) {
		a += nl * ( 0.3 - dl ) * ${f(E.logo.empuje)};
		v -= nl * min( dot( v, nl ), 0.0 ) * smoothstep( 0.3, 0.0, dl );
	}
	if ( dl < 2.2 && uActividadDelLogo > 0.0 ) {
		a -= nl * ( dl - 0.45 ) * ${f(E.logo.corona)} * uActividadDelLogo * smoothstep( 2.2, 1.0, dl );
		gana += uActividadDelLogo * exp( - dl * dl * 2.0 ) * ${f(E.logo.calienta)} * dt;
	}
	// Los núcleos: atraen (positivos) o repelen (negativos), hacen girar y calientan lo que tienen al lado.
	for ( int k = 0; k < ${String(E.nucleos.maximo)}; k ++ ) {
		if ( float( k ) >= uCuantosNucleos ) break;
		vec4 n = uNucleos[ k ];
		vec3 d = n.xyz - p;
		float r2 = dot( d, d ) + uNucleosAjuste.y;
		float inv = inversesqrt( r2 );
		vec3 hacia = d * inv;
		vec3 eje = normalize( vec3( sin( float( k ) * 1.7 ), cos( float( k ) * 2.3 ), sin( float( k ) * 0.9 + 1.0 ) ) );
		a += hacia * n.w * uNucleosAjuste.x * inv * inv + cross( eje, hacia ) * abs( n.w ) * uNucleosAjuste.z * inv * inv;
		gana += abs( n.w ) * uNucleosAjuste.w * exp( - r2 * 0.8 ) * dt;
	}
	// El puntero: atrae hacia su rayo, hace girar alrededor y calienta (más, cargado).
	if ( uPuntero.x > 0.5 ) {
		vec3 sobre = uRayoO + uRayoD * max( 0.0, dot( p - uRayoO, uRayoD ) );
		vec3 d = sobre - p;
		float dr = length( d );
		if ( dr < uCursorAjuste.x && dr > 1e-4 ) {
			float u = 1.0 - dr / uCursorAjuste.x;
			vec3 hacia = d / dr;
			// La carga crece más despacio en el medio (miles de motas: si no, el remolino se satura).
			float carga = mix( 1.0, uPuntero.y, 0.4 );
			float cerca = max( 0.0, 1.0 - dr / ${f(E.cursor.cerca)} );
			a += hacia * ( uCursorAjuste.y * u * carga - ${f(E.cursor.rechazo)} * cerca * cerca ) + cross( uRayoD, hacia ) * uCursorAjuste.z * u * carga;
			gana += uCursorAjuste.w * u * u * carga * dt;
		}
	}
	// Las ondas de los pulsos: el frente empuja hacia afuera y calienta.
	for ( int k = 0; k < 2; k ++ ) {
		vec4 o = uPulsos[ k ];
		if ( o.w < 0.0 ) continue;
		vec3 d = p - o.xyz;
		float r = max( 1e-4, length( d ) );
		float w = cresta( r, ${f(E.onda.rapidez)} * o.w, ${f(E.onda.ancho)} ) * max( 0.0, 1.0 - ${f(E.onda.rapidez)} * o.w / ${f(E.onda.llega)} );
		a += d / r * ${f(E.onda.empuje * E.onda.rapidez / E.onda.ancho)} * w;
		gana += ${f(E.onda.calienta * E.onda.rapidez / E.onda.ancho)} * w * dt;
	}
	// Las ondas del logo: calientan al pasar (desde donde está el logo).
	vec3 dlogo = p - uCentro;
	float delLogo = length( dlogo );
	for ( int k = 0; k < 2; k ++ ) {
		vec4 o = uFrentes[ k ];
		float w0 = ( delLogo - o.x ) / ${f(E.anillo.ancho)};
		float w1 = ( delLogo - o.z ) / ${f(E.anillo.ancho)};
		gana += ${f(E.anillo.calienta)} * ( o.y * exp( - w0 * w0 ) + o.w * exp( - w1 * w1 ) ) * dt;
	}
	// Los arcos: calientan lo que tienen cerca (el medio se enciende a su paso).
	for ( int k = 0; k < ${String(ARCOS.lugares)}; k ++ ) {
		if ( float( k ) >= uCuantosArcos ) break;
		float d = alSegmento( p, uArcosA[ k ].xyz, uArcosB[ k ].xyz ) / ${f(E.arco.radio)};
		gana += uArcosA[ k ].w * ${f(E.arco.calienta)} * exp( - d * d ) * dt;
	}
	// Calientes, tiemblan.
	vec3 azar = vec3( azar01( id ^ generacion, 1u ), azar01( id ^ generacion, 2u ), azar01( id ^ generacion, 3u ) ) * 2.0 - 1.0;
	a += azar * uEnergiaAjuste.w * e;
	// [PULIDO 18] P1.b · la cáscara es del mundo (alrededor del origen: no sigue al logo): afuera vuelven; el hueco, suave, va con el logo.
	float lejos = length( p );
	if ( lejos > uReparto.y ) a -= p / lejos * ( lejos - uReparto.y ) * uReparto.w;
	if ( delLogo < uReparto.x && delLogo > 1e-4 ) a += dlogo / delLogo * ( uReparto.x - delLogo ) * uReparto.w * 0.5;
	// [PULIDO 18] P1.a · el piso, un límite real (el de las brasas): el colchón levanta, lo que baja se frena, lo de costado roza.
	float sobre = p.y - uPiso - ${f(BRASAS.piso.minimo)};
	float roza = 1.0;
	if ( sobre < ${f(BRASAS.piso.banda)} ) {
		float s = 1.0 - max( 0.0, sobre ) / ${f(BRASAS.piso.banda)};
		a.y += ${f(BRASAS.piso.empuje)} * s * s;
		if ( v.y < 0.0 ) v.y *= exp( - ${f(BRASAS.piso.frena)} * s * dt );
		roza = exp( - ${f(BRASAS.piso.roce)} * s * dt );
	}
	v = ( v + a * dt ) * exp( - ${f(E.arrastre)} * dt );
	v.xz *= roza;
	float tope = ${f(E.tope)} * ( 1.0 + uTemperatura );
	float rapidez = length( v );
	if ( rapidez > tope ) v *= tope / rapidez;
	p += v * dt;
	if ( p.y < uPiso + ${f(BRASAS.piso.minimo)} ) {
		p.y = uPiso + ${f(BRASAS.piso.minimo)};
		v.y = max( v.y, 0.0 );
	}
	e = clamp( reposo + ( e - reposo ) * exp( - dt / uEnergiaAjuste.z ) + gana, 0.0, 1.0 );
	salidaLugar = vec4( p, e );
	salidaVelocidad = vec4( v, edad + dt );
}
`
