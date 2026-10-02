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
export function persigue(mostrado: number, pedido: number, dt: number, minimoS: number = LLEGADA_DE_LAS_LETRAS.minimoS): number {
  const tope = dt / minimoS
  return mostrado + Math.max(-tope, Math.min(tope, pedido - mostrado))
}

/** Cuánto llegó la letra de lugar `orden` (0 la primera, 1 la última) con el progreso `p`: arranca después; frena al final. */
export function llegadaDeLaLetra(p: number, orden: number): number {
  const L = LLEGADA_DE_LAS_LETRAS
  const u = Math.min(1, Math.max(0, (p - orden * (1 - L.dura)) / L.dura))
  return 1 - (1 - u) ** 3
}

const f = (x: number): string => x.toFixed(5)

/**
 * [RETOQUE 3D] LAS LLEGADAS NUEVAS. `letras`: la de ESCENA 10 (de atrás y girando). `azar` (3A, el hero): cada letra sale
 * de un lugar distinto de la sala (`aDesde`, sembrado) y se ensambla girando. `levanta` (3C, «El equipo»): la palabra
 * acostada hacia adelante sobre el pie de atrás de su caja se levanta (de _ a |), letra por letra; lo que queda debajo de
 * ese pie no se dibuja (la línea la tapa): aparece de la nada recién cuando se levanta.
 */
export type LlegadaDelTitulo = 'letras' | 'azar' | 'levanta'

/** De dónde sale cada letra en `letras` (em): la de ESCENA 10, de atrás y un poco más arriba. */
export const DESDE_DE_LAS_LETRAS: readonly [number, number, number] = [0, LLEGADA_DE_LAS_LETRAS.subida, -LLEGADA_DE_LAS_LETRAS.profundidad]

/** `azar`: la caja de la sala de donde salen (em, alrededor del título; nunca de delante de la cámara) y la semilla. */
export const AZAR_DE_LAS_LETRAS = { x: [-38, 38], y: [-10, 18], z: [-55, -6], semilla: 0x24e5 } as const

/** Un generador chico y determinista (mulberry32): el mismo azar en cada carga, el mismo en el invariante. */
export function sembrar(semilla: number): () => number {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** El vértice: en `beginnormal` se arma el giro de la letra (y gira la normal); en `begin`, la posición. */
export const LLEGADA_PARS_GLSL = /* glsl */ `
attribute float aLetra;
attribute vec3 aPivote;
attribute vec3 aDesde;
uniform float uLlegada;
uniform float uSalida;
uniform float uQuieto;
uniform float uLevanta;
uniform vec2 uPieDeLaPalabra;
varying float vAparece;
varying float vSobreElPie;
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
	// [RETOQUE 3D] \`levanta\`: sin el giro propio; la letra se acuesta hacia adelante sobre el pie de atrás de la palabra.
	mat3 giroDeLaLetra = giroDeLaLetraEn( faltaDeLaLetra * ( 1.0 - uLevanta ) );
	float acostada = faltaDeLaLetra * uLevanta * ${f(Math.PI / 2)};
	mat3 alzado = mat3( 1.0, 0.0, 0.0, 0.0, cos( acostada ), sin( acostada ), 0.0, - sin( acostada ), cos( acostada ) );
	objectNormal = alzado * giroDeLaLetra * objectNormal;
	vAparece = smoothstep( 0.0, ${f(LLEGADA_DE_LAS_LETRAS.aparece)}, eDeLaLetra );
	// La que se levanta aparece por la línea, no por el tramado (salvo con movimiento reducido, que no se mueve).
	vAparece = mix( vAparece, 1.0, uLevanta * ( 1.0 - uQuieto ) );
`

export const LLEGADA_POSICION_GLSL = /* glsl */ `
	vec3 pieDeLaLetra = vec3( transformed.x, uPieDeLaPalabra );
	vec3 enCamino = aPivote + giroDeLaLetra * ( transformed - aPivote ) + faltaDeLaLetra * aDesde;
	transformed = mix( enCamino, pieDeLaLetra + alzado * ( transformed - pieDeLaLetra ), uLevanta );
	// Cuánto queda arriba del pie (em): debajo, la línea lo tapa.
	vSobreElPie = ( transformed.y - uPieDeLaPalabra.x ) * uLevanta + ( 1.0 - uLevanta );
`

/** El fragmento: el tramado que la disuelve (ruido de gradiente intercalado, fijo en la pantalla). */
export const DISOLVER_PARS_GLSL = /* glsl */ `
varying float vAparece;
varying float vSobreElPie;
`
export const DISOLVER_GLSL = /* glsl */ `
	if ( vAparece < 0.999 && fract( 52.9829189 * fract( dot( gl_FragCoord.xy, vec2( 0.06711056, 0.00583715 ) ) ) ) >= vAparece ) discard;
	if ( vSobreElPie < 0.002 ) discard;
`
