/**
 * [ESCENA 5] 5a · EL LOGO NO SE ATRAVIESA — puro: la forma del logo en tres piezas simples y la
 * cuenta que saca una mota de adentro.
 *
 * **La forma.** No se usa la malla: dos TOROS (los dos cuencos de la «cp», acostados en el plano del
 * logo) y una CÁPSULA (el palo), en coordenadas del SVG (caja de 1024), sacadas del trazo del archivo:
 * el cuenco de la «c» es el arco de radio 257 que pasa por (38, 371) y (248, 207); el de la «p», el
 * de radio 256 con el agujero de 153; el palo baja de y 640 a 860 entre x 532 y 665. El tubo de cada
 * toro es un poco más grueso que el trazo (53) para cubrir también el espesor de la extrusión.
 *
 * **La cuenta.** En el espacio del logo (su grupo, con la vira): la distancia con signo a la pieza
 * más cercana; si una mota queda a menos de dos holguras, se la corre hacia afuera por la normal y
 * queda entre una y dos (repartidas, no pegadas a la superficie). [ESCENA 7] La holgura es fija. Con E7 la misma cuenta corre después del empuje del cursor, así
 * que lo que el cursor empuja contra el logo se desliza por su borde en vez de meterse.
 */

export const FORMA_DEL_LOGO_SVG = {
  c: { x: 278, y: 462, radio: 203, tubo: 60 },
  p: { x: 745, y: 457, radio: 205, tubo: 60 },
  palo: { x: 598, desde: 640, hasta: 862, radio: 70 },
} as const

/**
 * La holgura, en unidades de mundo: la mota queda entre una y dos holguras de la forma. [ESCENA 7] T7: fija
 * (hasta ESCENA 6 sumaba hasta 3,2 con la velocidad de la cámara y se abría una burbuja que después se
 * cerraba a la fuerza); lo que el aire hace alrededor del logo lo hace la física (`simulacion.ts`).
 */
export const HOLGURA = { polvo: 0.45, bokeh: 1.0 } as const

/** Las piezas en el espacio del grupo del logo: el centro de la caja de su trazo va al origen. */
export interface FormaDelLogo {
  readonly c: readonly [number, number, number, number]
  readonly p: readonly [number, number, number, number]
  readonly palo: readonly [number, number, number, number]
}

export function formaDelLogo(centroSvg: { readonly x: number; readonly y: number }, escala: number): FormaDelLogo {
  const f = FORMA_DEL_LOGO_SVG
  const x = (sx: number): number => (sx - centroSvg.x) * escala
  const y = (sy: number): number => -(sy - centroSvg.y) * escala
  return {
    c: [x(f.c.x), y(f.c.y), f.c.radio * escala, f.c.tubo * escala],
    p: [x(f.p.x), y(f.p.y), f.p.radio * escala, f.p.tubo * escala],
    palo: [x(f.palo.x), y(f.palo.desde), y(f.palo.hasta), f.palo.radio * escala],
  }
}

/**
 * La distancia con signo a la forma (negativa adentro). Pura, para el invariante: es la misma que
 * `DISTANCIA_AL_LOGO_GLSL`.
 */
export function distanciaAlLogo(q: readonly [number, number, number], f: FormaDelLogo): number {
  const toro = (t: readonly [number, number, number, number]): number => Math.hypot(Math.hypot(q[0] - t[0], q[1] - t[1]) - t[2], q[2]) - t[3]
  const y = Math.min(Math.max(q[1], f.palo[2]), f.palo[1])
  const palo = Math.hypot(q[0] - f.palo[0], q[1] - y, q[2]) - f.palo[3]
  return Math.min(toro(f.c), toro(f.p), palo)
}

/** La misma cuenta en GLSL, con su normal: `uLogoC`, `uLogoP` y `uLogoPalo` son las piezas de arriba. */
export const DISTANCIA_AL_LOGO_GLSL = /* glsl */ `
uniform vec4 uLogoC;
uniform vec4 uLogoP;
uniform vec4 uLogoPalo;
uniform mat4 uLogo;
uniform mat4 uLogoInverso;
float alToro( vec3 q, vec4 t, out vec3 n ) {
	vec2 d = q.xy - t.xy;
	float l = max( length( d ), 1e-4 );
	vec3 alCentroDelTubo = vec3( t.xy + d / l * t.z, 0.0 );
	vec3 v = q - alCentroDelTubo;
	float lv = max( length( v ), 1e-4 );
	n = v / lv;
	return lv - t.w;
}
float alPalo( vec3 q, vec4 p, out vec3 n ) {
	vec3 enElEje = vec3( p.x, clamp( q.y, p.z, p.y ), 0.0 );
	vec3 v = q - enElEje;
	float lv = max( length( v ), 1e-4 );
	n = v / lv;
	return lv - p.w;
}
// Saca la mota (en el mundo) de adentro de la forma: las que quedan a menos de dos holguras se
// reparten entre una y dos holguras, sin amontonarse en la superficie.
vec3 afueraDelLogo( vec3 mundo, float holgura ) {
	vec3 q = ( uLogoInverso * vec4( mundo, 1.0 ) ).xyz;
	vec3 n1; vec3 n2; vec3 n3;
	float d1 = alToro( q, uLogoC, n1 );
	float d2 = alToro( q, uLogoP, n2 );
	float d3 = alPalo( q, uLogoPalo, n3 );
	float d = min( d1, min( d2, d3 ) );
	vec3 n = d == d1 ? n1 : ( d == d2 ? n2 : n3 );
	if ( d >= 2.0 * holgura ) return mundo;
	float u = clamp( ( d + 0.6 ) / ( 2.0 * holgura + 0.6 ), 0.0, 1.0 );
	return ( uLogo * vec4( q + n * ( holgura * ( 1.0 + u * u ) - d ), 1.0 ) ).xyz;
}
`
