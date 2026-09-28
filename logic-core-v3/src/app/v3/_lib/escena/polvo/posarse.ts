import { FLOOR_Y } from '../probeScene'

/**
 * [ESCENA 5] 5b · EL POLVO QUE SE POSA — pura: la quietud, el despertar y la cuenta de cada mota.
 *
 * Después de `empiezaS` sin scroll ni cursor, el polvo baja despacio y a los `asentadoS` está en el
 * piso del escenario; cada mota con su propio retraso (`desparejoS`), para que no bajen en bloque. El
 * scroll o el cursor lo levantan, y el despertar se propaga desde donde empezó el movimiento a
 * `velocidad` unidades por segundo: el cursor, desde el punto del piso que tiene debajo; el scroll,
 * desde la cámara. Con movimiento reducido no se posa.
 *
 * El estado vive en tres instantes (en el reloj de la escena) y un punto: desde cuándo está quieto
 * (`quieto`, infinito mientras hay movimiento), cuándo despertó (`desperto`), desde cuándo estaba
 * quieto antes de despertar (`antes`) y de dónde salió el despertar (`origen`). Con eso el shader
 * sabe, mota por mota, cuánto se había posado cuando le llegó el frente y cuánto le queda subir.
 */
export const POSARSE = {
  empiezaS: 8,
  asentadoS: 25,
  desparejoS: 3,
  velocidad: 16,
  subidaS: 1.8,
  /** Cuánto tiene que pasar sin movimiento para que cuente como quieto. */
  quietudS: 0.25,
  /** Sobre el piso, lo que queda arriba de la mota posada (0 a esto, al azar). */
  alturaPosada: 0.12,
} as const

export interface EstadoDelPolvo {
  readonly quieto: number
  readonly desperto: number
  readonly antes: number
  readonly origen: readonly [number, number, number]
  readonly ultimoMovimiento: number
}

export const NUNCA = 1e9

export function polvoInicial(t: number): EstadoDelPolvo {
  return { quieto: t, desperto: -NUNCA, antes: -NUNCA, origen: [0, 0, 0], ultimoMovimiento: t }
}

/**
 * Un paso: `movimiento` trae el origen si en este cuadro hubo scroll o cursor, o `null`. Con
 * `reducido`, nunca queda quieto.
 */
export function avanzarElPolvo(e: EstadoDelPolvo, t: number, movimiento: readonly [number, number, number] | null, reducido: boolean): EstadoDelPolvo {
  if (reducido) return { ...e, quieto: NUNCA, ultimoMovimiento: t }
  if (movimiento !== null) {
    // Despierta sólo si estaba quieto: mientras sigue el movimiento, el frente ya salió.
    if (e.quieto < NUNCA) return { quieto: NUNCA, desperto: t, antes: e.quieto, origen: movimiento, ultimoMovimiento: t }
    return { ...e, ultimoMovimiento: t }
  }
  if (e.quieto >= NUNCA && t - e.ultimoMovimiento > POSARSE.quietudS) return { ...e, quieto: e.ultimoMovimiento }
  return e
}

/** Cuánto se posó una mota a `s` segundos de quietud, con su retraso (0 en el aire, 1 en el piso). */
export function posadaEn(s: number, retraso: number): number {
  const u = (s - POSARSE.empiezaS - retraso) / (POSARSE.asentadoS - POSARSE.empiezaS)
  const x = Math.min(1, Math.max(0, u))
  return x * x * (3 - 2 * x)
}

/**
 * La cuenta en GLSL: va después del volumen, sobre `transformed` (espacio de la concha; como la
 * concha sólo gira alrededor de y y sube o baja, bajar en el mundo es bajar ahí). Usa `uTiempo`.
 */
export const POSARSE_GLSL = /* glsl */ `
	{
		vec3 enElMundo = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;
		float azar = fract( sin( dot( position, vec3( 12.9898, 78.233, 37.719 ) ) ) * 43758.5453 );
		float retraso = azar * ${POSARSE.desparejoS.toFixed(2)};
		float tramo = ${(POSARSE.asentadoS - POSARSE.empiezaS).toFixed(2)};
		float frente = uPolvoDesperto + distance( enElMundo.xz, uPolvoOrigen.xz ) / ${POSARSE.velocidad.toFixed(2)};
		float antesDelFrente = smoothstep( 0.0, 1.0, ( min( uTiempo, frente ) - uPolvoAntes - ${POSARSE.empiezaS.toFixed(2)} - retraso ) / tramo );
		float posada = antesDelFrente * ( 1.0 - smoothstep( 0.0, ${POSARSE.subidaS.toFixed(2)}, uTiempo - frente ) );
		posada = max( posada, smoothstep( 0.0, 1.0, ( uTiempo - uPolvoQuieto - ${POSARSE.empiezaS.toFixed(2)} - retraso ) / tramo ) );
		float piso = ${FLOOR_Y.toFixed(4)} + 0.02 + azar * ${POSARSE.alturaPosada.toFixed(3)};
		transformed.y += ( piso - enElMundo.y ) * posada;
	}
`
