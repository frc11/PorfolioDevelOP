/**
 * [RONDA 2] F4 · LA LEGIBILIDAD DEL 3D DE DÍA — [RETOQUE DEL PIE] P1: la variante b, en el producto, en todos los títulos
 * negros (el logo no se toca): de día, los costados de las letras en un gris distinto de la cara (la cara negra recortada
 * contra su canto). Se apaga con la noche (de noche manda su dibujo de siempre). La a (el filo claro), la c y la bandera
 * `filo=` se borraron. Usa la cara del dibujo de noche (`vTapaDelLogo`, `logoDeNoche.ts`), que se instala en el mismo
 * material. Color en lineal.
 */
export const COSTADO_DE_DIA = 0.2

/** El gris de los costados, con la noche del logo (la emisiva, contra la de la noche entera) apagándolo. */
export function costadoDeDiaGlsl(emisionDeLaNoche: number): string {
  const dia = `( 1.0 - clamp( emissive.r / ${emisionDeLaNoche.toFixed(3)}, 0.0, 1.0 ) )`
  return `diffuseColor.rgb = mix( vec3( ${COSTADO_DE_DIA.toFixed(3)} ), diffuseColor.rgb, mix( 1.0, vTapaDelLogo, ${dia} ) );`
}
