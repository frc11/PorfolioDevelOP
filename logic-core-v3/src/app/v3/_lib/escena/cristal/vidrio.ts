import * as THREE from 'three'

import { HAZ, LUCES_VIVAS, LUCES_VIVAS_MAXIMO } from '../entorno/vivo'
import { FLOOR_Y } from '../probeScene'
import { CRISTAL } from './cristal'
import { GRIETAS_EN_EL_MAIN, GRIETAS_GLSL, uniformesDeLasGrietas } from './grietasDelVidrio'

/**
 * [PULIDO 20] R2 · EL VIDRIO (`cristal.ts`: lo puro; `muro.ts`: la geometría; `fondo.ts`: lo que refracta). Cada fragmento: la normal de
 * su celda, la REFRACCIÓN por Snell del rayo de la vista leída en el fondo donde el rayo desviado cae a `fondo` u detrás (si eso mira
 * fuera del fondo, se desvanece: nunca estira), el FRESNEL de Schlick con un reflejo tenue del entorno, el BRILLO ESPECULAR de la luz de
 * la sala y, con el prisma (por defecto), el ARCOÍRIS en los cantos (cada canal con su índice). No escribe profundidad.
 *
 * [PULIDO 23] U1 · EL MURO, UN VITRAL ROTO: las celdas comparten sus bordes y en cada borde va la LÍNEA DE QUIEBRE, fina y brillante (por
 * píxel: la distancia al borde en px sale de `aInterior` y su derivada), con el prisma más fuerte cerca. SIN MÁSCARAS: se borraron la
 * elipse central, las cajas del texto y de la barra, el logo y la cercanía de la cámara; lo tapa sólo lo que de verdad está delante (la
 * profundidad: el logo, los títulos y el pie son opacos y escriben profundidad; las partículas y la energía van después). Una sola cara
 * (la de adentro: la cámara siempre está adentro del muro). Quieto: sin giro ni respiración.
 *
 * [PULIDO 26] X4 · DE MEJOR CALIDAD: cada celda es un vidrio con ESPESOR (entra por su cara inclinada, cruza `cuerpo.grosor` y sale por
 * la del cilindro: el corrimiento crece con el ángulo), con los CANTOS BISELADOS (la cara se curva hacia el borde: el borde se lee por cómo
 * dobla lo de atrás, sin línea; de canto, la reflexión total muestra el entorno), un FRESNEL más marcado con el reflejo del entorno y el
 * lóbulo de la luz de la sala, una ABSORCIÓN fría muy leve (más densa en el bisel), algunas celdas ESMERILADAS (la refracción apenas
 * desenfocada), el prisma SÓLO en el bisel y, de noche, los brillos de las luces (las de la energía y el haz) en el bisel. Un solo dibujo.
 */
export const VERTICES_DEL_VIDRIO = (n: number): string => /* glsl */ `
// [PULIDO 23] U1 · el muro de ${String(n)} celdas, quieto.
attribute float aInterior;
attribute float aHondura;
attribute vec4 aBorde;
attribute vec2 aCelda;
varying vec3 vMundo;
varying vec3 vNormal;
varying float vInterior;
varying float vHondura;
varying vec4 vBorde;
varying vec2 vCelda;
void main() {
	vHondura = aHondura;
	vec4 p = modelMatrix * vec4( position, 1.0 );
	vMundo = p.xyz;
	vNormal = normalize( mat3( modelMatrix ) * normal );
	vInterior = aInterior;
	vBorde = vec4( mat3( modelMatrix ) * aBorde.xyz, aBorde.w );
	vCelda = aCelda;
	gl_Position = projectionMatrix * viewMatrix * p;
}
`

const Q = CRISTAL.filo
const f = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))

export const FRAGMENTOS_DEL_VIDRIO = /* glsl */ `
uniform sampler2D uFondo;
uniform vec2 uFondoTam;
uniform float uAmplitud;
uniform float uNoche;
uniform float uPrisma;
uniform vec3 uCamara;
uniform mat4 uVista;
uniform vec3 uLuz;
uniform vec4 uVidrio;
uniform vec4 uBrillo;
uniform vec4 uFilo;
uniform vec4 uCuerpo;
uniform vec4 uAbsorcion;
uniform vec4 uDeNoche;
uniform vec4 uLucesVivas[ ${String(LUCES_VIVAS_MAXIMO)} ];
uniform int uCuantasLucesVivas;
uniform float uVitralFilo;
uniform float uModoDelBrillo;
varying vec3 vMundo;
varying vec3 vNormal;
varying float vInterior;
varying float vHondura;
varying vec4 vBorde;
varying vec2 vCelda;
${GRIETAS_GLSL}
vec2 enElFondo( vec3 p ) {
	vec4 c = uVista * vec4( p, 1.0 );
	return c.xy / max( 1e-4, c.w ) * 0.5 + 0.5;
}
// [PULIDO 24] V1 · la lectura del fondo, acotada (el fondo tiene margen: \`CRISTAL.fondo.sobra\`): nunca se desvanece.
vec2 enElCuadro( vec2 m ) {
	return clamp( m, vec2( 0.002 ), vec2( 0.998 ) );
}
// [PULIDO 26] X4 · a través del vidrio: entra por la cara de adelante (\`nf\`), cruza el grosor y sale por la de atrás (\`nb\`) hasta el
// fondo a \`hondo\` u. Devuelve cuánto pasa (0: la reflexión total en la cara de atrás, con el borde suave); \`camino\`, lo que recorrió adentro.
float atravesar( vec3 v, vec3 nf, vec3 nb, float eta, float hondo, out vec2 m, out float camino ) {
	vec3 r1 = refract( v, nf, 1.0 / eta );
	float c = max( 0.15, - dot( r1, nb ) );
	camino = uCuerpo.x / c;
	float k = 1.0 - eta * eta * ( 1.0 - c * c );
	vec3 r2 = normalize( eta * r1 + ( eta * c - sqrt( max( k, 0.0 ) ) ) * nb );
	m = enElCuadro( enElFondo( vMundo + r1 * camino + r2 * hondo ) );
	return smoothstep( 0.0, 0.2, k );
}
// El entorno que refleja: el cielo por la altura del reflejado (de día, con el lóbulo de la luz de la sala) y de noche, oscuro.
vec3 cielo( vec3 r ) {
	float alto = r.y * 0.5 + 0.5;
	vec3 dia = mix( vec3( 0.78, 0.78, 0.77 ), vec3( 0.98 ), alto ) + ${f(CRISTAL.luz.lobulo)} * pow( max( 0.0, dot( r, uLuz ) ), 6.0 );
	return mix( dia, mix( vec3( 0.01 ), vec3( 0.09, 0.09, 0.1 ), alto ), uNoche );
}
// [PULIDO 26] X4 · de noche, lo que atrapa el vidrio: las luces de la energía (en el bisel) y el haz (la columna sobre el logo: donde el
// rayo reflejado pasa cerca de su eje, con el Fresnel y más en el bisel).
float brillosDeNoche( vec3 nf, vec3 v, float fresnel, float bisel ) {
	float b = 0.0;
	if ( bisel > 0.01 ) {
		for ( int k = 0; k < ${String(LUCES_VIVAS_MAXIMO)}; k ++ ) {
			if ( k >= uCuantasLucesVivas ) break;
			vec4 l = uLucesVivas[ k ];
			vec3 h = normalize( normalize( l.xyz - vMundo ) - v );
			b += l.w * pow( max( 0.0, dot( nf, h ) ), uDeNoche.w );
		}
		b *= uDeNoche.z * bisel;
	}
	vec3 r = reflect( v, nf );
	float t = - dot( vMundo.xz, r.xz ) / max( 1e-4, dot( r.xz, r.xz ) );
	float y = vMundo.y + t * r.y;
	vec2 d = vMundo.xz + r.xz * t;
	float enElHaz = step( 0.0, t ) * smoothstep( ${f(FLOOR_Y)}, ${f(FLOOR_Y + 1)}, y ) * ( 1.0 - smoothstep( ${f(HAZ.arriba - 4)}, ${f(HAZ.arriba)}, y ) );
	b += uDeNoche.x * enElHaz * exp( - dot( d, d ) / ( uDeNoche.y * uDeNoche.y ) ) * ( fresnel + bisel );
	return b * uNoche;
}
void main() {
	float amp = uAmplitud;
	if ( amp < 0.002 ) discard;
	vec3 n = normalize( vNormal );
	vec3 v = normalize( vMundo - uCamara );
	if ( dot( n, v ) > 0.0 ) n = - n;
	// La cara de atrás, la del cilindro (sin la inclinación de la celda): cada celda es un prisma delgado.
	vec3 nb = normalize( vec3( - vMundo.x, 0.0, - vMundo.z ) );
	if ( dot( nb, v ) > 0.0 ) nb = - nb;
	// [PULIDO 26] X4 · el bisel: en el último tramo antes del borde la cara se curva hacia él (en el plano de la celda), sin línea.
	float bisel = 1.0 - smoothstep( 0.0, uCuerpo.y, vInterior * vBorde.w );
	bisel *= bisel;
	vec3 e = vBorde.xyz - n * dot( vBorde.xyz, n );
	e /= max( 1e-4, length( e ) );
	vec3 nf = normalize( n * cos( uCuerpo.z * bisel ) + e * sin( uCuerpo.z * bisel ) );
	if ( dot( nf, v ) > - 0.05 ) nf = normalize( nf - v * ( dot( nf, v ) + 0.05 ) );
	// [PULIDO 24] V1 · cada celda con su inclinación y su hondura (a cuánto lee el fondo), así lo de atrás se desfasa de una a la otra.
	float hondo = uVidrio.y * vHondura;
	vec2 m;
	float camino;
	float pasa = atravesar( v, nf, nb, uVidrio.x, hondo, m, camino );
	vec3 color = texture2D( uFondo, m ).rgb;
	// [PULIDO 26] X4 · algunas celdas, esmeriladas: la refracción apenas desenfocada (seis tomas fijas alrededor, giradas por celda).
	if ( vCelda.x > 0.01 ) {
		vec2 radio = vCelda.x * uCuerpo.w / uFondoTam;
		for ( int k = 0; k < 6; k ++ ) {
			float a = vCelda.y + float( k ) * 1.0472;
			color += texture2D( uFondo, enElCuadro( m + vec2( cos( a ), sin( a ) ) * radio ) ).rgb;
		}
		color /= 7.0;
	}
	// El prisma: sólo en el bisel, una dispersión sutil (cada canal con su índice).
	if ( uPrisma >= 0.5 && bisel > 0.01 ) {
		float d = uVidrio.z * bisel;
		vec2 mr;
		vec2 mb;
		float otro;
		atravesar( v, nf, nb, uVidrio.x - d, hondo, mr, otro );
		atravesar( v, nf, nb, uVidrio.x + d, hondo, mb, otro );
		color.rb = mix( color.rb, vec2( texture2D( uFondo, mr ).r, texture2D( uFondo, mb ).b ), smoothstep( 0.01, 0.2, bisel ) );
	}
	// La absorción: un frío muy leve por lo que recorre adentro, más denso en el bisel. De canto, la reflexión total: algo del entorno.
	color *= exp( - uAbsorcion.xyz * camino * ( 1.0 + uAbsorcion.w * bisel ) );
	vec3 r = reflect( v, nf );
	color = mix( mix( color, cielo( r ), 0.5 ), color, pasa );
	// De día el cuerpo apenas se tiñe. Con \`?vitral-filo=si\`, el filo entre celdas: oscuro, muy fino y tenue.
	color *= 1.0 - uFilo.z * ( 1.0 - uNoche );
	float px = vInterior / max( fwidth( vInterior ), 1e-5 );
	color *= 1.0 - uVitralFilo * ${f(Q.oscurece)} * ( 1.0 - smoothstep( 0.0, ${f(Q.anchoPx)}, px ) );
	// El Fresnel (más marcado) con el reflejo del entorno, el brillo de la luz de la sala (por la cara de la celda: en el bisel sería una
	// banda) y, de noche, las luces que atrapa el bisel.
	float cosV = max( 0.0, dot( - v, nf ) );
	float fresnel = uVidrio.w + ( 1.0 - uVidrio.w ) * pow( 1.0 - cosV, 3.0 );
	color = mix( color, cielo( r ), clamp( fresnel * mix( uBrillo.w, uFilo.w, uNoche ), 0.0, 1.0 ) );
	vec3 h = normalize( uLuz - v );
	// [PULIDO 27] C2 · de noche, por celda (\`celdas\`), parejo (\`medio\`: con la normal del cilindro y el lóbulo de todas juntas) o ninguno.
	float porCelda = pow( max( 0.0, dot( n, h ) ), uBrillo.z );
	float parejo = ${f(CRISTAL.brilloDeNoche.escala)} * pow( max( 0.0, dot( nb, h ) ), ${f(CRISTAL.brilloDeNoche.dureza)} );
	float deNoche = uModoDelBrillo < 0.5 ? porCelda : uModoDelBrillo < 1.5 ? parejo : 0.0;
	float especular = mix( porCelda * uBrillo.x, deNoche * uBrillo.y, uNoche ) * ( 0.4 + fresnel );
	color += vec3( especular + brillosDeNoche( nf, v, fresnel, bisel ) );
	// [NOCTURNO B9] Las grietas (\`grietasDelVidrio.ts\`): la banda oscura y la luz fina, sobre el vidrio ya armado.
${GRIETAS_EN_EL_MAIN}
	gl_FragColor = vec4( color * amp, amp );
}
`

/** Las uniformes del vidrio. [PULIDO 21] S4 · el prisma, por defecto. */
export function uniformesDelVidrio() {
  const C = CRISTAL
  return {
    uFondo: { value: null as THREE.Texture | null },
    uFondoTam: { value: new THREE.Vector2(1, 1) },
    uVitralFilo: { value: 0 },
    uModoDelBrillo: { value: C.brilloDeNoche.modos.indexOf(C.brilloDeNoche.porDefecto) },
    uAmplitud: { value: 0 },
    uNoche: { value: 0 },
    uPrisma: { value: 1 },
    uCamara: { value: new THREE.Vector3() },
    uVista: { value: new THREE.Matrix4() },
    uLuz: { value: new THREE.Vector3(0, 1, 0) },
    uVidrio: { value: new THREE.Vector4(C.vidrio.indice, C.vidrio.fondo, C.vidrio.dispersion, C.vidrio.f0) },
    uBrillo: { value: new THREE.Vector4(C.luz.especular[0], C.luz.especular[1], C.luz.dureza, C.luz.reflejo[0]) },
    uFilo: { value: new THREE.Vector4(C.luz.filo[0], C.luz.filo[1], C.luz.tinta, C.luz.reflejo[1]) },
    // [PULIDO 26] X4 · el cuerpo (grosor, bisel, su curva, el esmerilado), la absorción y de noche (el haz lo pone el cuadro); las luces, compartidas.
    uCuerpo: { value: new THREE.Vector4(C.cuerpo.grosor, C.cuerpo.bisel, THREE.MathUtils.degToRad(C.cuerpo.biselGrados), C.esmerilado.texeles) },
    uAbsorcion: { value: new THREE.Vector4(C.cuerpo.absorcion[0], C.cuerpo.absorcion[1], C.cuerpo.absorcion[2], C.cuerpo.enElBisel) },
    uDeNoche: { value: new THREE.Vector4(0, C.noche.radioDelHaz, C.noche.luces, C.noche.dureza) },
    uLucesVivas: LUCES_VIVAS.uLuces,
    uCuantasLucesVivas: LUCES_VIVAS.uCuantas,
    // [NOCTURNO B9] Las grietas: su rejilla, dónde van, cuánto se formaron y se encendieron, y su color.
    ...uniformesDeLasGrietas(),
  }
}
export type UniformesDelVidrio = ReturnType<typeof uniformesDelVidrio>

/** El muro: transparente, premultiplicado, sin escribir profundidad (sí la lee: lo de adelante lo tapa), una sola cara, antes que las partículas. */
export function armarElVidrio(geometria: THREE.BufferGeometry, uniformes: UniformesDelVidrio, n: number): THREE.Mesh {
  const material = new THREE.ShaderMaterial({ vertexShader: VERTICES_DEL_VIDRIO(n), fragmentShader: FRAGMENTOS_DEL_VIDRIO, uniforms: uniformes, transparent: true, depthWrite: false, depthTest: true, side: THREE.FrontSide, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor })
  const malla = new THREE.Mesh(geometria, material)
  malla.name = 'cristal · muro'
  malla.frustumCulled = false
  malla.renderOrder = CRISTAL.orden
  return malla
}
