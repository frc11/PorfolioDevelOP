import { FLOOR_Y } from '../probeScene'
import { HAZ } from '../entorno/vivo'

/**
 * [ESCENA 5] 5d · LAS MOTAS DEL HAZ — de noche, el polvo que está en la columna de E1 va más lento y
 * destella, como en un rayo de sol en una habitación.
 *
 * **Más lento.** Las conchas giran enteras alrededor del eje (`derivaDelAire.ts`), y el eje es el
 * del haz: una mota adentro de la columna gira ahí adentro. Para frenarla se la gira para atrás una
 * parte del giro de su concha (`frenoEnElHaz`), sólo de noche y sólo en la columna. El ángulo de
 * vuelta se ACUMULA en el cuadro (`uContraGiro`, uno por concha): así, cuando llega la noche, la
 * mota no salta; empieza a quedarse atrás.
 *
 * **Destella.** Cada mota del haz tiene su frecuencia y su fase: un pico breve de brillo y tamaño.
 */
export const MOTAS = {
  /** Qué parte del giro de la concha se le quita a una mota en el centro del haz. */
  frenoEnElHaz: 0.7,
  /** Cuánto crece y cuánto se aclara en el pico del destello. */
  destello: { tam: 0.8, brillo: 1.6 },
  /** Frecuencias del destello (Hz) y lo angosto del pico. */
  frecuencia: { desde: 0.18, hasta: 0.55 },
  pico: 28,
} as const

/** La columna del haz, a la altura `y`: 1 en el eje, 0 afuera. Es la cuenta de E1 (`polvoVivo.ts`). */
const EN_EL_HAZ = /* glsl */ `
float enLaColumna( vec3 mundo ) {
	float alto = clamp( ( mundo.y - ${FLOOR_Y.toFixed(4)} ) / ( ${HAZ.arriba.toFixed(1)} - ${FLOOR_Y.toFixed(4)} ), 0.0, 1.0 );
	float radio = mix( ${HAZ.radioAbajo.toFixed(2)}, ${HAZ.radioArriba.toFixed(2)}, alto );
	return 1.0 - smoothstep( 0.55, 1.0, length( mundo.xz ) / radio );
}
`

export const MOTAS_PARS_GLSL = /* glsl */ `
uniform float uContraGiro[ 3 ];
uniform float uMotas;
varying float vDestello;
${EN_EL_HAZ}
`

/** Después del volumen: frena la mota en la columna (girándola para atrás) y calcula su destello. */
export const MOTAS_GLSL = /* glsl */ `
	{
		vec3 enElMundo = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;
		float w = enLaColumna( enElMundo ) * uMotas;
		float a = - w * uContraGiro[ CONCHA_DEL_POLVO ];
		float ca = cos( a );
		float sa = sin( a );
		transformed.xz = vec2( ca * transformed.x + sa * transformed.z, - sa * transformed.x + ca * transformed.z );
		float azar = fract( sin( dot( position, vec3( 39.3468, 11.1354, 83.1552 ) ) ) * 24634.6345 );
		float f = mix( ${MOTAS.frecuencia.desde.toFixed(2)}, ${MOTAS.frecuencia.hasta.toFixed(2)}, azar );
		vDestello = w * pow( 0.5 + 0.5 * sin( 6.2832 * ( uTiempo * f + azar ) ), ${MOTAS.pico.toFixed(1)} );
	}
`

export const MOTAS_TAM_GLSL = /* glsl */ `
	gl_PointSize *= 1.0 + ${MOTAS.destello.tam.toFixed(2)} * vDestello;
`

export const MOTAS_FRAGMENT_GLSL = /* glsl */ `
	diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 1.0 ), vDestello );
	diffuseColor.a = min( 1.0, diffuseColor.a * ( 1.0 + ${MOTAS.destello.brillo.toFixed(2)} * vDestello ) );
`
