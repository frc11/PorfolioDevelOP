import { CAPAS_DEL_ROBOT } from './robot'

/**
 * [AJUSTES FINALES] A6 · LA VIDA DEL ROBOT — lo que el sombreador hace en el tiempo con cada nanobot del robot (`robot.ts`
 * dice cuál es cuál por su `w`): el texto del globo se TIPEA renglón a renglón, se queda, se borra y vuelve a empezar; el
 * FLUJO se enciende tramo a tramo: un pulso recorre el tramo, el nodo al que llega se llena, sigue al siguiente, en la
 * bifurcación va por las dos ramas a la vez, queda todo encendido un rato y se apaga para volver a empezar. Con movimiento
 * reducido, el estado final quieto (todo escrito, todo encendido, sin pulso). Las dos cuentas salen del mismo reloj del
 * enjambre. Los números viven acá; la versión en TypeScript es la copia que corre el invariante (s48), con ellos mismos.
 */
export const RELOJ_DEL_ROBOT = {
  /** El ciclo del texto (s) y sus fases: se escribe hasta `escribe`, se queda, se borra entre `borraDesde` y `borraHasta`, y espera. */
  tipeo: { periodoS: 6, escribe: 0.55, borraDesde: 0.78, borraHasta: 0.86 },
  /** El ciclo del flujo (s), cuánto del ciclo dura cada tramo (los de la bifurcación van juntos) y cuándo se apaga todo. */
  flujo: { periodoS: 8, porTramo: 0.1, reinicio: 0.72 },
} as const

const T = RELOJ_DEL_ROBOT.tipeo
const F = RELOJ_DEL_ROBOT.flujo
const K = CAPAS_DEL_ROBOT

/** Cuánto del texto está escrito a la fase `f` del ciclo (0 a 1). */
export function textoEscrito(f: number): number {
  if (f < T.escribe) return f / T.escribe
  if (f < T.borraDesde) return 1
  if (f < T.borraHasta) return 1 - (f - T.borraDesde) / (T.borraHasta - T.borraDesde)
  return 0
}

const suave = (desde: number, hasta: number, x: number): number => {
  const u = Math.min(1, Math.max(0, (x - desde) / (hasta - desde)))
  return u * u * (3 - 2 * u)
}

/** La vida de un nanobot del robot a los `t` segundos: cuánto se ve (0 a 1) y cuánto brilla el pulso sobre él. */
export function vidaDelRobot(w: number, t: number, quieto: boolean): { readonly ve: number; readonly pulso: number } {
  if (w < K.texto) return { ve: 1, pulso: 0 }
  if (w < K.nodos) {
    const escrito = quieto ? 1 : textoEscrito((t / T.periodoS) % 1)
    return { ve: w - K.texto <= escrito ? 1 : 0, pulso: 0 }
  }
  const fase = quieto ? F.reinicio - 0.01 : (t / F.periodoS) % 1
  const encendido = fase <= F.reinicio
  if (w < K.tramos) {
    const q = (w - K.nodos) * 10
    const k = Math.floor(q + 0.001)
    const llega = (Math.min(k, 3) + 1) * F.porTramo
    return { ve: q - k > 0.25 ? (encendido && fase >= llega ? 1 : 0) : 1, pulso: 0 }
  }
  const q = (w - K.tramos) * 10
  const L = Math.floor(q + 0.001)
  const u = (q - L) / 0.99
  const arranca = Math.min(L, 3) * F.porTramo
  const avance = Math.min(1, Math.max(0, (fase - arranca) / F.porTramo))
  const enElTramo = fase >= arranca && fase <= arranca + F.porTramo
  const pulso = quieto || !encendido || !enElTramo ? 0 : suave(0.08, 0, Math.abs(u - avance))
  return { ve: encendido && u <= avance ? 1 : 0.4, pulso }
}

const n = (x: number): string => x.toFixed(5)

/** La misma cuenta, en GLSL: `vidaDelRobot( d, t, quieto )` → (cuánto se ve, cuánto brilla el pulso). */
export const VIDA_DEL_ROBOT_GLSL = /* glsl */ `
float textoEscrito( float f ) {
	if ( f < ${n(T.escribe)} ) return f / ${n(T.escribe)};
	if ( f < ${n(T.borraDesde)} ) return 1.0;
	if ( f < ${n(T.borraHasta)} ) return 1.0 - ( f - ${n(T.borraDesde)} ) / ${n(T.borraHasta - T.borraDesde)};
	return 0.0;
}
vec2 vidaDelRobot( vec4 d, float t, float quieto ) {
	if ( d.w < ${n(K.texto)} ) return vec2( 1.0, 0.0 );
	if ( d.w < ${n(K.nodos)} ) {
		float escrito = quieto > 0.5 ? 1.0 : textoEscrito( fract( t / ${n(T.periodoS)} ) );
		return vec2( step( d.w - ${n(K.texto)}, escrito ), 0.0 );
	}
	float fase = quieto > 0.5 ? ${n(F.reinicio - 0.01)} : fract( t / ${n(F.periodoS)} );
	float encendido = step( fase, ${n(F.reinicio)} );
	if ( d.w < ${n(K.tramos)} ) {
		float q = ( d.w - ${n(K.nodos)} ) * 10.0;
		float k = floor( q + 0.001 );
		float llega = ( min( k, 3.0 ) + 1.0 ) * ${n(F.porTramo)};
		return vec2( q - k > 0.25 ? encendido * step( llega, fase ) : 1.0, 0.0 );
	}
	float q = ( d.w - ${n(K.tramos)} ) * 10.0;
	float L = floor( q + 0.001 );
	float u = ( q - L ) / 0.99;
	float arranca = min( L, 3.0 ) * ${n(F.porTramo)};
	float avance = clamp( ( fase - arranca ) / ${n(F.porTramo)}, 0.0, 1.0 );
	float enElTramo = step( arranca, fase ) * step( fase, arranca + ${n(F.porTramo)} );
	float pulso = smoothstep( 0.08, 0.0, abs( u - avance ) ) * enElTramo * encendido * ( 1.0 - quieto );
	return vec2( mix( 0.4, 1.0, encendido * step( u, avance ) ), pulso );
}
`
