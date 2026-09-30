/**
 * [ESCENA 10] T3 · LA LLEGADA DE LAS LETRAS — cada letra entra desde la profundidad (de atrás del título, con la niebla
 * de la sala), girando sobre su eje vertical una vuelta y cuarto y un poco inclinada, y se ensambla en su lugar; se van
 * igual, al revés. Escalonadas de izquierda a derecha, con el progreso que movía la pieza del DOM (el scroll: se puede
 * ir y volver). Ese progreso cruza su ventana en ~300 px de scroll (medio segundo con la rueda): lo que se muestra lo
 * PERSIGUE con un mínimo de tiempo (`minimoS`, en las dos direcciones; el molde es el amanecer de ESCENA 8), así la
 * llegada se nota a cualquier velocidad. En los primeros tramos de su viaje cada letra se disuelve (un tramado fijo en
 * la pantalla: el material es opaco, sin orden de transparencias). Con movimiento reducido no se mueven: sólo se
 * disuelven en su lugar.
 *
 * Las cifras van en em (el cuerpo del título es 1).
 */
export const LLEGADA_DE_LAS_LETRAS = {
  /** De cuán atrás vienen (em), cuánto más arriba y cuánto giran (vueltas, sobre su eje vertical y sobre el horizontal). */
  profundidad: 16,
  subida: 1.2,
  vueltas: 1.25,
  inclinacion: 0.12,
  /** Qué parte del progreso ocupa cada letra (el resto es el escalonado entre la primera y la última). */
  dura: 0.6,
  /** Hasta qué parte de su llegada se termina de disolver. */
  aparece: 0.35,
  /** La llegada entera (o la ida) no dura menos que esto (s): lo que se muestra persigue al progreso del scroll. */
  minimoS: 1.4,
} as const

/** Un paso de lo que se muestra: persigue al progreso pedido, a lo sumo `dt / minimoS`, en las dos direcciones. */
export function persigue(mostrado: number, pedido: number, dt: number): number {
  const tope = dt / LLEGADA_DE_LAS_LETRAS.minimoS
  return mostrado + Math.max(-tope, Math.min(tope, pedido - mostrado))
}

/** Cuánto llegó la letra de lugar `orden` (0 la primera, 1 la última) con el progreso `p`: arranca después; frena al final. */
export function llegadaDeLaLetra(p: number, orden: number): number {
  const L = LLEGADA_DE_LAS_LETRAS
  const u = Math.min(1, Math.max(0, (p - orden * (1 - L.dura)) / L.dura))
  return 1 - (1 - u) ** 3
}

const f = (x: number): string => x.toFixed(5)

/** El vértice: en `beginnormal` se arma el giro de la letra (y gira la normal); en `begin`, la posición. */
export const LLEGADA_PARS_GLSL = /* glsl */ `
attribute float aLetra;
attribute vec3 aPivote;
uniform float uLlegada;
uniform float uSalida;
uniform float uQuieto;
varying float vAparece;
float llegadaDeLaLetra( float p, float orden ) {
	float u = clamp( ( p - orden * ${f(1 - LLEGADA_DE_LAS_LETRAS.dura)} ) / ${f(LLEGADA_DE_LAS_LETRAS.dura)}, 0.0, 1.0 );
	return 1.0 - pow( 1.0 - u, 3.0 );
}
mat3 giroDeLaLetraEn( float falta ) {
	float a = falta * ${f(LLEGADA_DE_LAS_LETRAS.vueltas * 2 * Math.PI)};
	float b = falta * ${f(LLEGADA_DE_LAS_LETRAS.inclinacion * 2 * Math.PI)};
	mat3 y = mat3( cos( a ), 0.0, - sin( a ), 0.0, 1.0, 0.0, sin( a ), 0.0, cos( a ) );
	mat3 x = mat3( 1.0, 0.0, 0.0, 0.0, cos( b ), sin( b ), 0.0, - sin( b ), cos( b ) );
	return y * x;
}
`

export const LLEGADA_NORMAL_GLSL = /* glsl */ `
	// [ESCENA 10] T3 · cuánto le falta a esta letra (la llegada por lo que no se fue) y su giro.
	float eDeLaLetra = llegadaDeLaLetra( uLlegada, aLetra ) * ( 1.0 - llegadaDeLaLetra( uSalida, aLetra ) );
	float faltaDeLaLetra = ( 1.0 - eDeLaLetra ) * ( 1.0 - uQuieto );
	mat3 giroDeLaLetra = giroDeLaLetraEn( faltaDeLaLetra );
	objectNormal = giroDeLaLetra * objectNormal;
	vAparece = smoothstep( 0.0, ${f(LLEGADA_DE_LAS_LETRAS.aparece)}, eDeLaLetra );
`

export const LLEGADA_POSICION_GLSL = /* glsl */ `
	transformed = aPivote + giroDeLaLetra * ( transformed - aPivote ) + vec3( 0.0, faltaDeLaLetra * ${f(LLEGADA_DE_LAS_LETRAS.subida)}, - faltaDeLaLetra * ${f(LLEGADA_DE_LAS_LETRAS.profundidad)} );
`

/** El fragmento: el tramado que la disuelve (ruido de gradiente intercalado, fijo en la pantalla). */
export const DISOLVER_PARS_GLSL = /* glsl */ `
varying float vAparece;
`
export const DISOLVER_GLSL = /* glsl */ `
	if ( vAparece < 0.999 && fract( 52.9829189 * fract( dot( gl_FragCoord.xy, vec2( 0.06711056, 0.00583715 ) ) ) ) >= vAparece ) discard;
`
