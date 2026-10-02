/**
 * [RONDA 2] F4 · LA LEGIBILIDAD DEL 3D DE DÍA — una PRUEBA (`?pruebas=filo=a|b|c`; el producto no cambia). Los títulos 3D
 * negros, vistos de costado, no se leen de día: la cara y los costados son el mismo negro. Tres variantes, sólo en los
 * títulos (el logo no se toca), que se apagan con la noche (de noche manda su dibujo de siempre):
 *
 *   a · un filo claro y fino en el contorno de la cara de adelante;
 *   b · los costados en un gris distinto de la cara (la cara negra recortada contra su canto);
 *   c · las dos.
 *
 * Usa el campo de distancias al contorno y la cara del dibujo de noche (`logoDeNoche.ts`: `uContornoDelLogo` y
 * `vTapaDelLogo`), que se instalan en el mismo material. El filo de noche (`bordeDelLogoDeNoche()`) es grueso para la
 * Chivo 400 de día (deja las letras huecas): éste mide `ancho` em. Colores en lineal.
 */
export type FiloDeDia = 'a' | 'b' | 'c'

export const FILO_DE_DIA = { filo: 0.62, ancho: 0.006, costado: 0.2 } as const

const f = (x: number): string => x.toFixed(3)

export function filoDeDiaGlsl(v: FiloDeDia): string {
  const dia = `( 1.0 - clamp( emissive.r / EMISION_DE_LA_NOCHE, 0.0, 1.0 ) )`
  const costado = `diffuseColor.rgb = mix( vec3( ${f(FILO_DE_DIA.costado)} ), diffuseColor.rgb, mix( 1.0, vTapaDelLogo, ${dia} ) );`
  const filo = `{
	float dDeDia = texture2D( uContornoDelLogo, ( vPlanoDelLogo - uCajaDelContorno.xy ) * uCajaDelContorno.zw ).r * uAlcanceDelContorno;
	float aaDeDia = max( fwidth( dDeDia ) * 0.75, uAlcanceDelContorno * 0.00125 );
	float filoDeDia = vTapaDelLogo * ( 1.0 - smoothstep( ${f(FILO_DE_DIA.ancho)} - aaDeDia, ${f(FILO_DE_DIA.ancho)} + aaDeDia, dDeDia ) );
	diffuseColor.rgb = mix( diffuseColor.rgb, vec3( ${f(FILO_DE_DIA.filo)} ), filoDeDia * ${dia} );
}`
  return v === 'a' ? filo : v === 'b' ? costado : `${costado}\n${filo}`
}
