/**
 * [ESCENA 7] T3 · EL CIELO DE UNA NOCHE EN EL CAMPO — puro: la vía láctea y lo que tapa la trama.
 *
 * **La vía láctea.** Una banda sobre un círculo máximo del cielo: una luz difusa de estrellas que no se
 * resuelven, más ancha y más clara hacia el centro de la galaxia, con franjas oscuras de polvo que la
 * parten a lo largo (la «grieta»). Está puesta para que cruce, en diagonal, el cielo que la cámara ve de
 * noche: la cámara mira hacia el azimut −30° a −60°, desde el piso hacia arriba, mientras baja por los
 * números y entra a Trabajos. Monocroma. La misma banda reparte además estrellas débiles: más adentro
 * de la banda y menos en las franjas de polvo (`densidadDeLaBanda`, la misma cuenta que el shader).
 *
 * **Lo que tapa la trama.** Las estrellas y la vía láctea están afuera, así que la trama va SIEMPRE
 * delante. La trama es transparente (su raya tapa el 45 %), así que una estrella brillante detrás de una
 * raya se leía por delante de ella. Ahora cada estrella (y cada píxel de la vía láctea) busca dónde su
 * rayo cruza las dos capas de la trama y lee su textura ahí: detrás de una raya, no se ve (`TRAMA_GLSL`).
 */

/** Una dirección como `[x, y, z]` (unitaria). */
export type Direccion = readonly [number, number, number]

const grados = (g: number): number => (g * Math.PI) / 180

/** La dirección de un azimut y una elevación (el azimut como `atan2(x, z)`, igual que el resto de la escena). */
export function direccionDe(azimut: number, elevacion: number): Direccion {
  const [a, e] = [grados(azimut), grados(elevacion)]
  return [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)]
}

const cruz = (a: Direccion, b: Direccion): Direccion => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const punto = (a: Direccion, b: Direccion): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const unitaria = (a: Direccion): Direccion => {
  const l = Math.hypot(a[0], a[1], a[2])
  return [a[0] / l, a[1] / l, a[2] / l]
}

export const VIA_LACTEA = {
  /** Dónde está el centro de la galaxia (azimut, elevación en grados) y cuánto se inclina la banda ahí contra el horizonte. */
  centro: { azimut: -58, elevacion: 18 },
  inclinacion: 55,
  /** El ancho de la banda (sigma, en radianes de latitud) y cuánto más clara es hacia el centro. */
  ancho: 0.22,
  bulbo: { cuanto: 1.0, ancho: 0.6 },
  /** Las franjas de polvo: cuánto oscurecen en su centro. */
  polvo: 0.82,
  /** El brillo de la luz difusa en el centro de la banda (valor de pantalla, aditivo) y cómo se apaga en el horizonte. */
  brillo: 0.26,
  horizonte: [-0.01, 0.12],
} as const

/** Los ejes de la banda: el polo `n`, el centro `l0` y el tercero `m` (longitud 90°). */
export function ejesDeLaBanda(): { readonly n: Direccion; readonly l0: Direccion; readonly m: Direccion } {
  const v = direccionDe(VIA_LACTEA.centro.azimut, VIA_LACTEA.centro.elevacion)
  const arriba: Direccion = unitaria([-v[0] * v[1], 1 - v[1] * v[1], -v[2] * v[1]])
  const derecha = unitaria(cruz(v, arriba))
  const i = grados(VIA_LACTEA.inclinacion)
  const tangente: Direccion = [Math.cos(i) * derecha[0] + Math.sin(i) * arriba[0], Math.cos(i) * derecha[1] + Math.sin(i) * arriba[1], Math.cos(i) * derecha[2] + Math.sin(i) * arriba[2]]
  const n = unitaria(cruz(v, tangente))
  return { n, l0: v, m: unitaria(cruz(n, v)) }
}

/** La latitud y la longitud de una dirección en la banda (radianes). */
export function enLaBanda(d: Direccion): { readonly b: number; readonly l: number } {
  const { n, l0, m } = ejesDeLaBanda()
  return { b: Math.asin(Math.max(-1, Math.min(1, punto(d, n)))), l: Math.atan2(punto(d, m), punto(d, l0)) }
}

/** La dirección de una latitud y una longitud de la banda. */
export function direccionDeLaBanda(l: number, b: number): Direccion {
  const { n, l0, m } = ejesDeLaBanda()
  const [cb, sb, cl, sl] = [Math.cos(b), Math.sin(b), Math.cos(l), Math.sin(l)]
  return [cb * (cl * l0[0] + sl * m[0]) + sb * n[0], cb * (cl * l0[1] + sl * m[1]) + sb * n[1], cb * (cl * l0[2] + sl * m[2]) + sb * n[2]]
}

/** Las franjas de polvo (0 a 1): la grieta a lo largo de la banda, que ondula y cambia de ancho. Misma cuenta que el shader. */
export function polvoDeLaBanda(l: number, b: number): number {
  const w = VIA_LACTEA.ancho
  const centro = w * (0.16 * Math.sin(2.3 * l + 0.7) + 0.07 * Math.sin(5.1 * l + 2.1))
  const ancho = w * (0.2 + 0.09 * Math.sin(3.7 * l + 1.1))
  const grieta = Math.exp(-(((b - centro) / ancho) ** 2)) * (0.62 + 0.38 * Math.sin(1.9 * l + 0.3))
  const otra = Math.exp(-(((b + 0.55 * w - 0.1 * w * Math.sin(4.3 * l)) / (0.12 * w)) ** 2)) * Math.max(0, Math.sin(2.7 * l - 0.4))
  return Math.min(1, grieta + 0.7 * otra)
}

/** La luz de la banda (sin la textura fina): 1 en el centro de la galaxia sin polvo. */
export function densidadDeLaBanda(l: number, b: number): number {
  const v = VIA_LACTEA
  const bulbo = 1 + v.bulbo.cuanto * Math.exp(-((l / v.bulbo.ancho) ** 2))
  return (bulbo / (1 + v.bulbo.cuanto)) * Math.exp(-((b / v.ancho) ** 2)) * (1 - v.polvo * polvoDeLaBanda(l, b))
}

const vec3 = (a: Direccion): string => `vec3( ${a.map((x) => x.toFixed(6)).join(', ')} )`

/** La vía láctea en GLSL: `viaLactea( d )`, el brillo de pantalla en la dirección `d` (unitaria). */
export function viaLacteaGlsl(): string {
  const { n, l0, m } = ejesDeLaBanda()
  const v = VIA_LACTEA
  return /* glsl */ `
float azarDelCielo( vec3 p ) { return fract( sin( dot( p, vec3( 127.1, 311.7, 74.7 ) ) ) * 43758.5453 ); }
float ruidoDelCielo( vec3 p ) {
	vec3 i = floor( p );
	vec3 f = fract( p );
	vec3 u = f * f * ( 3.0 - 2.0 * f );
	float a = mix( mix( azarDelCielo( i ), azarDelCielo( i + vec3( 1, 0, 0 ) ), u.x ), mix( azarDelCielo( i + vec3( 0, 1, 0 ) ), azarDelCielo( i + vec3( 1, 1, 0 ) ), u.x ), u.y );
	float b = mix( mix( azarDelCielo( i + vec3( 0, 0, 1 ) ), azarDelCielo( i + vec3( 1, 0, 1 ) ), u.x ), mix( azarDelCielo( i + vec3( 0, 1, 1 ) ), azarDelCielo( i + vec3( 1, 1, 1 ) ), u.x ), u.y );
	return mix( a, b, u.z );
}
float grumos( vec3 d ) {
	return 0.5 * ruidoDelCielo( d * 7.0 ) + 0.3 * ruidoDelCielo( d * 17.0 + 3.1 ) + 0.2 * ruidoDelCielo( d * 41.0 + 7.7 );
}
float viaLactea( vec3 d ) {
	const vec3 N = ${vec3(n)};
	const vec3 L0 = ${vec3(l0)};
	const vec3 M = ${vec3(m)};
	// El borde de la banda y de las franjas, desparejo: la latitud corrida por un ruido.
	float b = asin( clamp( dot( d, N ), -1.0, 1.0 ) ) + 0.035 * ( ruidoDelCielo( d * 13.0 ) - 0.5 );
	float l = atan( dot( d, M ), dot( d, L0 ) );
	float w = ${v.ancho.toFixed(3)};
	float centro = w * ( 0.16 * sin( 2.3 * l + 0.7 ) + 0.07 * sin( 5.1 * l + 2.1 ) );
	float ancho = w * ( 0.2 + 0.09 * sin( 3.7 * l + 1.1 ) );
	float grieta = exp( - pow( ( b - centro ) / ancho, 2.0 ) ) * ( 0.62 + 0.38 * sin( 1.9 * l + 0.3 ) );
	float otra = exp( - pow( ( b + 0.55 * w - 0.1 * w * sin( 4.3 * l ) ) / ( 0.12 * w ), 2.0 ) ) * max( 0.0, sin( 2.7 * l - 0.4 ) );
	float polvo = min( 1.0, grieta + 0.7 * otra ) * ( 0.75 + 0.5 * ruidoDelCielo( d * 23.0 + 1.3 ) );
	float bulbo = ( 1.0 + ${v.bulbo.cuanto.toFixed(2)} * exp( - pow( l / ${v.bulbo.ancho.toFixed(2)}, 2.0 ) ) ) / ${(1 + v.bulbo.cuanto).toFixed(2)};
	float luz = bulbo * exp( - pow( b / w, 2.0 ) ) * ( 1.0 - ${v.polvo.toFixed(2)} * min( polvo, 1.0 ) );
	// La luz difusa no es pareja: grumos de estrellas que no se resuelven.
	luz *= 0.6 + 0.6 * grumos( d );
	return luz * ${v.brillo.toFixed(4)} * smoothstep( ${v.horizonte[0].toFixed(3)}, ${v.horizonte[1].toFixed(3)}, d.y );
}
`
}

/**
 * LO QUE TAPA LA TRAMA, en GLSL: `delanteDeLaTrama( o, d )` es qué parte de lo que está afuera, en la
 * dirección `d` desde `o`, se ve a través de las dos capas (0 detrás de una raya, 1 entre rayas). Lee la
 * textura de cada capa donde el rayo la cruza, con su transformación de hoy (la gruesa baja, la fina se
 * corre con el pulso y mezcla dos desajustes, M4) y la envolvente de su banda. Pide `textureLod` (sirve en
 * el vértice).
 */
export const TRAMA_GLSL = /* glsl */ `
uniform sampler2D uTramaGruesa;
uniform sampler2D uTramaFina;
uniform mat3 uMatGruesa;
uniform mat3 uMatFina;
uniform vec2 uRepeticionB;
uniform vec2 uCorrimientoB;
uniform float uMezclaB;
// Por capa: abajo, arriba, fundido de abajo y de arriba (fracción del alto), y el radio en uRadiosDeLaTrama.
uniform vec4 uBandaGruesa;
uniform vec4 uBandaFina;
uniform vec2 uRadiosDeLaTrama;
uniform float uHayTrama;
float envolventeDeLaBanda( float v, vec4 b ) {
	float r = min( clamp( v / b.z, 0.0, 1.0 ), clamp( ( 1.0 - v ) / b.w, 0.0, 1.0 ) );
	return r * r * ( 3.0 - 2.0 * r );
}
vec2 dondeCruza( vec3 o, vec3 d, float radio, vec4 banda ) {
	float a = dot( d.xz, d.xz );
	if ( a < 1e-8 ) return vec2( -1.0 );
	float b = dot( o.xz, d.xz );
	float c = dot( o.xz, o.xz ) - radio * radio;
	float t = ( - b + sqrt( max( b * b - a * c, 0.0 ) ) ) / a;
	vec3 p = o + d * t;
	return vec2( fract( atan( p.x, p.z ) / 6.2831853 ), ( p.y - banda.x ) / ( banda.y - banda.x ) );
}
float rayaDe( float alfa ) {
	// La textura va de la base (0,18) a la raya (1): tapa sólo la raya.
	return smoothstep( 0.35, 0.8, alfa );
}
float delanteDeLaTrama( vec3 o, vec3 d ) {
	if ( uHayTrama < 0.5 ) return 1.0;
	float pasa = 1.0;
	vec2 uv = dondeCruza( o, d, uRadiosDeLaTrama.x, uBandaFina );
	if ( uv.y >= 0.0 && uv.y <= 1.0 ) {
		float a = textureLod( uTramaFina, ( uMatFina * vec3( uv, 1.0 ) ).xy, 0.0 ).g;
		if ( uMezclaB > 0.0 ) a = mix( a, textureLod( uTramaFina, uv * uRepeticionB + uCorrimientoB, 0.0 ).g, uMezclaB );
		pasa *= 1.0 - rayaDe( a ) * envolventeDeLaBanda( uv.y, uBandaFina );
	}
	uv = dondeCruza( o, d, uRadiosDeLaTrama.y, uBandaGruesa );
	if ( uv.y >= 0.0 && uv.y <= 1.0 ) {
		float a = textureLod( uTramaGruesa, ( uMatGruesa * vec3( uv, 1.0 ) ).xy, 0.0 ).g;
		pasa *= 1.0 - rayaDe( a ) * envolventeDeLaBanda( uv.y, uBandaGruesa );
	}
	return pasa;
}
`
