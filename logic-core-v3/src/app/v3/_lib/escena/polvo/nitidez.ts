/**
 * [ESCENA 7] T10 · EL POLVO NÍTIDO — puro: cuánto mide una mota en pantalla y cuándo se desenfoca.
 *
 * **Qué pasaba.** Cada mota era un disco de borde blando que crecía con la cercanía (0,17 × la altura del
 * cuadro / la distancia): a 10 u medía 8 px y a 4 u, 20 px. Casi todo el polvo se leía desenfocado, y
 * esos discos grises opacaban la escena. Y encima el bokeh: 90 discos de hasta 240 px.
 *
 * **Ahora.** La mota es un punto chico y definido: su lado en pantalla queda entre `tam` (en píxeles CSS),
 * con el borde de un píxel (antialias, no blando). Sólo las MUY cercanas —más cerca que `desenfocaDesde`—
 * se desenfocan: crece un círculo de confusión que va de 0 a unos pocos píxeles, con el borde blando y la
 * luz repartida (más grande, más tenue). Pegada a la lente todavía se desvanece, pero más cerca que antes
 * (`cerca`), así que quedan unas pocas desenfocadas y chicas, no una nube. El bokeh queda en pocos discos
 * y más chicos (`BOKEH_NITIDO`).
 */
export const NITIDEZ = {
  /** El lado de una mota en foco, en píxeles CSS: la más lejana y la más cercana. */
  tam: [1.4, 3.2],
  /** Desde qué distancia a la cámara se desenfoca (u), y cuántos píxeles crece por cada vez que se acerca a la mitad. */
  desenfocaDesde: 3.2,
  desenfoque: 5,
  /** Hasta dónde se desvanece contra la lente (u; antes 3,5). */
  cerca: 2.0,
} as const

/**
 * [ESCENA 7] T13 · el enfoque que busca (con bandera): cuánto se desenfoca una mota lejos del foco mientras
 * busca (px por cada vez la distancia del foco) y el tope (px).
 */
export const ENFOQUE = { px: 7, tope: 6 } as const

/** El bokeh: cuántos discos quedan (de 90), su tamaño en el mundo (antes 1,2) y su opacidad (antes 0,2). */
export const BOKEH_NITIDO = { cuantos: 30, tam: 0.34, opacidad: 0.16 } as const

/** El lado de una mota en pantalla (px CSS) a una distancia `d` (u), según el lado sin nitidez `sinNitidez`. */
export function ladoDeLaMota(sinNitidez: number, d: number): { enFoco: number; desenfoque: number } {
  const enFoco = Math.min(NITIDEZ.tam[1], Math.max(NITIDEZ.tam[0], sinNitidez))
  const desenfoque = Math.max(0, NITIDEZ.desenfocaDesde / Math.max(d, 0.1) - 1) * NITIDEZ.desenfoque
  return { enFoco, desenfoque }
}

/** En el vértice, antes del destello de las motas: el lado nítido y el desenfoque de las muy cercanas. Pide `uPixel`. */
export const NITIDEZ_VERTEX_GLSL = /* glsl */ `
	#ifdef POLVO_NITIDO
	{
		float lejosN = - mvPosition.z;
		float enFoco = clamp( gl_PointSize, ${NITIDEZ.tam[0].toFixed(2)} * uPixel, ${NITIDEZ.tam[1].toFixed(2)} * uPixel );
		float coc = max( 0.0, ${NITIDEZ.desenfocaDesde.toFixed(2)} / max( lejosN, 0.1 ) - 1.0 ) * ${NITIDEZ.desenfoque.toFixed(2)} * uPixel;
		#ifdef POLVO_ENFOQUE
			// [ESCENA 7] T13: mientras el foco busca, lo que no está a la distancia del foco se desenfoca un poco.
			coc += uBusca * min( ${ENFOQUE.tope.toFixed(1)}, ${ENFOQUE.px.toFixed(1)} * abs( 1.0 - uFoco / max( lejosN, 0.1 ) ) ) * uPixel;
		#endif
		vDesenfoque = coc / ( coc + enFoco );
		gl_PointSize = enFoco + coc;
		vLadoN = gl_PointSize;
	}
	#endif
`

/**
 * En el fragmento, en lugar del perfil blando del sprite: un disco de borde de un píxel, y el desenfocado
 * con el borde blando y la luz repartida. `r` es la distancia al centro del punto (0 a 0,5).
 */
export const NITIDEZ_FRAGMENT_GLSL = /* glsl */ `
		float bordeN = 0.75 / max( vLadoN, 1.0 );
		float nitida = 1.0 - smoothstep( 0.5 - bordeN, 0.5, r );
		float blanda = ( 1.0 - smoothstep( 0.18, 0.5, r ) ) * mix( 1.0, 0.3, vDesenfoque );
		diffuseColor.a *= mix( nitida, blanda, vDesenfoque );
`
