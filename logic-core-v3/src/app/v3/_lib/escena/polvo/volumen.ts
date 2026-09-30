import { FLOOR_Y } from '../probeScene'
import { MOIRE_NEAR_RADIUS } from '../probeMoire'
import { DUST_SHELLS, PARTICLE_R_MAX, PARTICLE_R_MIN, createRandom } from '../probeParticles'

/**
 * [ESCENA 5] EL POLVO PAREJO — puro: la misma densidad en todo el interior de la trama, con una
 * caja que acompaña a la cámara y se repite.
 *
 * **Qué pasaba.** El campo de la base es media esfera alrededor del logo, cargada hacia adentro
 * (uniforme en el RADIO): alrededor del logo hay diez veces más motas por unidad de volumen que a la
 * altura de la cámara, y en el pie —con la cámara a 40— la escena queda vacía salvo una nube.
 *
 * **Cómo.** Las motas viven en una caja de lado `lado` que va DELANTE de la cámara (arranca `atras`
 * detrás de ella). Cada mota está fija en el mundo —el paralaje es el de siempre—, pero la caja se
 * repite: la que sale por una cara entra por la de enfrente, y cerca de las caras se desvanece, así
 * que no se ve el salto. Adentro de la caja la densidad es una sola; afuera de la trama (`radio`) y
 * debajo del piso no hay polvo. Pegada a la lente (`cerca`) la mota se desvanece: son las que pedían
 * un disco de cien píxeles.
 *
 * **El alcance, y por qué es de 24.** La densidad es pareja en el volumen, pero lo que se ve en
 * pantalla es la SUMA a lo largo de cada rayo: una zona que mira lejos junta muchas más motas que una
 * que mira al piso, a pocos metros. Con el polvo hasta 24 de la cámara (una esfera, no la caja: la
 * caja gira con su concha y llegaría más lejos en unas direcciones que en otras) la diferencia entre
 * zonas cae por debajo de la del campo de la base; con 36 subía en las poses cercanas (medido y
 * simulado, `scripts-escena/densidad5.ts`). La caja es la más chica que contiene esa esfera adentro
 * del cuadro en cualquier orientación: 34 de lado. Cuesta las mismas llamadas de dibujo que antes (una por concha) y
 * más motas en el búfer: la caja es más grande que lo que se ve, y las que caen afuera de la sala se
 * mandan detrás de la cámara (no pintan un píxel).
 *
 * La deriva y las conchas son las de siempre (`derivaDelAire.ts`): la caja se repite en el espacio de
 * cada concha, así que girarla es girar la repetición entera. E6 y E7 no cambian: leen la posición
 * ya repetida, como leían la fija.
 */
export const POLVO_PAREJO = {
  lado: 34,
  atras: 4,
  /** Motas en la caja. El `particleCount` del producto (2400 de 3000) dibuja la misma fracción. */
  cuantas: 14000,
  /** Hasta dónde se desvanece contra la lente, y desde dónde deja de haber polvo. */
  cerca: 3.5,
  alcance: 24,
  /** Adentro de la capa fina (38), con un margen. */
  radio: MOIRE_NEAR_RADIUS - 1,
  /** Por encima del piso. */
  piso: FLOOR_Y + 0.4,
  /** La fracción del medio lado en la que se desvanece contra las caras de la caja. */
  fundido: 0.18,
} as const

/** La semilla del campo parejo: propia, para no coincidir con el de la base. */
export const SEMILLA_DEL_POLVO_PAREJO = 0x9a1e70

/** Las motas del campo parejo, uniformes en la caja (siempre las mismas: la semilla es fija). */
export function posicionesDelPolvoParejo(): Float32Array {
  const random = createRandom(SEMILLA_DEL_POLVO_PAREJO)
  const n = POLVO_PAREJO.cuantas
  const positions = new Float32Array(n * 3)
  for (let i = 0; i < n * 3; i += 1) positions[i] = (random() - 0.5) * POLVO_PAREJO.lado
  return positions
}

/** [ESCENA 6] De qué concha es cada mota: tres tramos iguales, en orden. */
export function conchasDelPolvoParejo(n: number): Uint8Array {
  const conchas = DUST_SHELLS.length - 1
  const salida = new Uint8Array(n)
  for (let k = 0; k < conchas; k += 1) salida.fill(k, Math.round((k / conchas) * n), Math.round(((k + 1) / conchas) * n))
  return salida
}

/** Repite `v` en la caja de lado `lado` centrada en `centro` (en cada eje). Es la cuenta del shader. */
export function envolver(v: number, centro: number, lado: number): number {
  const u = v - centro + lado / 2
  return centro + (u - Math.floor(u / lado) * lado) - lado / 2
}

/** El color de siempre, por la distancia al centro (lejos claras, cerca oscuras): el del campo de la base. */
export const TINTE_POR_RADIO = { desde: PARTICLE_R_MIN, hasta: PARTICLE_R_MAX } as const

/**
 * EL VOLUMEN, EN GLSL — va después de `#include <begin_vertex>`: repite `transformed` en la caja,
 * calcula cuánto se ve (`vParejo`) y el color por radio. Usa `uTintaCerca` y `uTintaLejos`.
 */
export const VOLUMEN_GLSL = /* glsl */ `
	{
		mat3 giroDeLaConcha = mat3( modelMatrix );
		vec3 corridaDeLaConcha = modelMatrix[ 3 ].xyz;
		vec3 camaraEnLaConcha = transpose( giroDeLaConcha ) * ( cameraPosition - corridaDeLaConcha );
		vec3 adelante = transpose( giroDeLaConcha ) * ( - vec3( viewMatrix[ 0 ][ 2 ], viewMatrix[ 1 ][ 2 ], viewMatrix[ 2 ][ 2 ] ) );
		vec3 centroDeLaCaja = camaraEnLaConcha + adelante * ${(POLVO_PAREJO.lado / 2 - POLVO_PAREJO.atras).toFixed(2)};
		#ifdef AIRE_INERCIA
			// [ESCENA 6] 6a: todo el volumen corrido por el aire, antes de repetirse.
			transformed += transpose( giroDeLaConcha ) * uDeriva;
		#endif
		transformed = centroDeLaCaja + mod( transformed - centroDeLaCaja + ${(POLVO_PAREJO.lado / 2).toFixed(2)}, ${POLVO_PAREJO.lado.toFixed(2)} ) - ${(POLVO_PAREJO.lado / 2).toFixed(2)};
		vec3 enLaCaja = abs( transformed - centroDeLaCaja ) / ${(POLVO_PAREJO.lado / 2).toFixed(2)};
		float borde = max( enLaCaja.x, max( enLaCaja.y, enLaCaja.z ) );
		vec3 enElMundo = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;
		// [CALIDAD 1] B4 · el corte del volumen (sus caras y el piso), aparte: con física, la mota suelta lo deja de a poco.
		carasDelAire = 1.0 - smoothstep( ${(1 - POLVO_PAREJO.fundido).toFixed(3)}, 1.0, borde );
		pisoDelAire = smoothstep( ${POLVO_PAREJO.piso.toFixed(3)}, ${(POLVO_PAREJO.piso + 0.3).toFixed(3)}, enElMundo.y );
		float lejosDeLaCamara = distance( enElMundo, cameraPosition );
		vParejo = carasDelAire * pisoDelAire * smoothstep( 0.8, CERCA_DEL_POLVO, lejosDeLaCamara ) * ( 1.0 - smoothstep( ${(POLVO_PAREJO.alcance - 4).toFixed(2)}, ${POLVO_PAREJO.alcance.toFixed(2)}, lejosDeLaCamara ) );
		vParejo *= 1.0 - smoothstep( ${(POLVO_PAREJO.radio - 1.5).toFixed(2)}, ${POLVO_PAREJO.radio.toFixed(2)}, length( enElMundo.xz ) );
		#ifdef USE_COLOR
			vColor.rgb = mix( uTintaCerca, uTintaLejos, clamp( ( length( enElMundo ) - ${TINTE_POR_RADIO.desde.toFixed(1)} ) / ${(TINTE_POR_RADIO.hasta - TINTE_POR_RADIO.desde).toFixed(1)}, 0.0, 1.0 ) );
		#endif
	}
`
