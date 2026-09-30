import * as THREE from 'three'

/**
 * [ESCENA 9] T3 · EL TONO, ACES COMPENSADO — [ESCENA 10] T1: el del producto (Neutral como opción y AgX se borraron).
 *
 * [CALIDAD 1] B9 midió AgX y ACES contra Neutral con la exposición compensada y ninguno dejaba los colores canónicos
 * (el papel, el piso, el cielo) en ΔE < 2: ACES corría el piso de día 2,5–2,8. Se había quedado Neutral.
 *
 * **La compensación de acá no es la exposición: es la curva de brillo.** El ACES de three conserva el gris (sus matrices
 * suman 1 por fila), así que lo que lo separa de Neutral en un gris es sólo su curva. El color sale de ACES (su tinte, su
 * saturación, su camino al blanco en lo saturado y brillante) y se escala para que su luminancia siga la curva de
 * Neutral: `ACES(c) · Neutral(L) / ACES(L)`, con `L` la luminancia de la entrada. En un gris da EXACTAMENTE Neutral (el
 * papel, el piso y el logo no se mueven); en un color, la cromaticidad de ACES con el brillo de siempre. Medido en
 * ESCENA 9 (`scripts-escena9/t3-tono.ts`): menos del 0,4 % de los píxeles cambia más de 5 niveles; los blancos cálidos
 * del papel y del piso llegan a ΔE 2,0–2,7 (la regla 10 de ESTADO-ESCENA §4 lo registra).
 *
 * Se instala antes de compilar nada (en el módulo de la configuración del lienzo, como el ruido azul): three usa el
 * tono `Custom` y este cuerpo.
 */
export const TONO_COMPENSADO_GLSL = /* glsl */ `vec3 CustomToneMapping( vec3 color ) {
	// [ESCENA 9] T3 · el color de ACES con el brillo de Neutral: en un gris, Neutral exacto.
	float l = max( dot( color, vec3( 0.2126, 0.7152, 0.0722 ) ), 0.0 );
	float brilloDeHoy = NeutralToneMapping( vec3( l ) ).g;
	float brilloDelTono = ACESFilmicToneMapping( vec3( l ) ).g;
	return saturate( ACESFilmicToneMapping( color ) * ( brilloDeHoy / max( brilloDelTono, 1e-6 ) ) );
}`

const VACIA = 'vec3 CustomToneMapping( vec3 color ) { return color; }'

/** Instala el tono en el trozo de three (una vez, antes de compilar). Devuelve si quedó instalado. */
export function instalarElTono(): boolean {
  const trozo = THREE.ShaderChunk.tonemapping_pars_fragment
  if (!trozo.includes(VACIA)) return trozo.includes('[ESCENA 9] T3 · el color de ACES con el brillo de Neutral')
  THREE.ShaderChunk.tonemapping_pars_fragment = trozo.replace(VACIA, TONO_COMPENSADO_GLSL)
  return true
}
