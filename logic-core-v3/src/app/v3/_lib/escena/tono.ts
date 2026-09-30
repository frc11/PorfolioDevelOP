import * as THREE from 'three'

/**
 * [ESCENA 9] T3 · EL TONO, AgX O ACES COMPENSADOS — una prueba (bandera `tono=agx` o `tono=aces`).
 *
 * [CALIDAD 1] B9 midió AgX y ACES contra Neutral con la exposición compensada y ninguno dejaba los colores canónicos
 * (el papel, el piso, el cielo) en ΔE < 2: ACES corre el piso de día 2,5–2,8; AgX no llega al blanco del papel ni con
 * exposición 4. Se quedó Neutral.
 *
 * **La compensación de acá no es la exposición: es la curva de brillo.** Los dos tonos de three conservan el gris (sus
 * matrices suman 1 por fila), así que lo que los separa de Neutral en un gris es sólo su curva. El color sale del tono
 * pedido (su tinte, su saturación, su camino al blanco en lo saturado y brillante) y se escala para que su luminancia
 * siga la curva de Neutral: `tono(c) · Neutral(L) / tono(L)`, con `L` la luminancia de la entrada. En un gris da
 * EXACTAMENTE Neutral (el papel y el piso no se mueven); en un color, la cromaticidad del tono pedido con el brillo de
 * hoy. Lo que se prueba, entonces, es la diferencia que de verdad separa a esos tonos: cómo tratan el color.
 *
 * Se instala antes de compilar nada (en el módulo de la configuración del lienzo, como el ruido azul): three usa el
 * tono `Custom` y este cuerpo. Sin la bandera no cambia nada.
 */
export type TonoDePrueba = 'agx' | 'aces'

/** El cuerpo de `CustomToneMapping` para cada tono (las funciones de three están en el mismo trozo, antes). */
export function tonoCompensadoGlsl(tono: TonoDePrueba): string {
  const f = tono === 'agx' ? 'AgXToneMapping' : 'ACESFilmicToneMapping'
  return /* glsl */ `vec3 CustomToneMapping( vec3 color ) {
	// [ESCENA 9] T3 · el color del tono pedido con el brillo de Neutral: en un gris, Neutral exacto.
	float l = max( dot( color, vec3( 0.2126, 0.7152, 0.0722 ) ), 0.0 );
	float brilloDeHoy = NeutralToneMapping( vec3( l ) ).g;
	float brilloDelTono = ${f}( vec3( l ) ).g;
	return saturate( ${f}( color ) * ( brilloDeHoy / max( brilloDelTono, 1e-6 ) ) );
}`
}

const VACIA = 'vec3 CustomToneMapping( vec3 color ) { return color; }'

/** Instala el tono en el trozo de three (una vez, antes de compilar). Devuelve si lo instaló. */
export function instalarElTono(tono: TonoDePrueba | 'no'): boolean {
  if (tono === 'no') return false
  const trozo = THREE.ShaderChunk.tonemapping_pars_fragment
  if (!trozo.includes(VACIA)) return trozo.includes('[ESCENA 9] T3 · el color del tono pedido')
  THREE.ShaderChunk.tonemapping_pars_fragment = trozo.replace(VACIA, tonoCompensadoGlsl(tono))
  return true
}
