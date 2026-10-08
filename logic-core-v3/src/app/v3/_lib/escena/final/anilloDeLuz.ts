/**
 * [PULIDO 5] D2 · LA LUZ DEL ENCASTRE, MARCADA Y SÓLIDA — el círculo de luz difusa de PULIDO 4 no gustó («quiero que sea algo
 * marcado y sólido, como si fuese una sola pieza que se terminó de ensamblar, como si el círculo fuese un tubo incrustado en el
 * piso, sin relieve, que quede ahí pegado»). Se borró. Variantes con `?anillo=` (`varianteDelAnillo`):
 *   tubo (el producto) · un anillo de luz blanca embutido al ras en el borde de la zona lisa (el círculo quieto del piso,
 *     `CALMA_EN_EL_PISO.radio`): bordes nítidos (un píxel de antialias, `fwidth`), brillo parejo, plano contra el piso. Aparece
 *     en segmentos mientras el logo presiona y en el golpe SE ENSAMBLA: los huecos entre segmentos se cierran y desde ahí
 *     queda sólido. Pulsa en intensidad con cada onda (y con el golpe).
 *   disco · toda la zona lisa como una pieza emisiva sólida embutida, de borde nítido y brillo parejo; el logo, recortado
 *     encima (el piso no se dibuja en su hueco).
 *   filo · sin luz en el piso: el logo con su filo blanco bien marcado, como el logo de noche (`logoDelFinal.ts`).
 *   tubo+filo · las dos cosas.
 * Lo dibuja el piso (`enElPiso.ts`) DESPUÉS del oscurecimiento y de la niebla: es la pieza que se ve nítida. Todo es función
 * de `fin` (reversible: al rebobinar se desarma igual) salvo los pulsos, que son de las ondas y del golpe (por tiempo, como
 * la luz de abajo). Los uniformes los escribe `cuadroDelFinal.ts`.
 */
export const ANILLOS_DEL_ENCASTRE = ['tubo', 'disco', 'filo', 'tubo+filo'] as const
export type AnilloDelEncastre = (typeof ANILLOS_DEL_ENCASTRE)[number]
/** El del producto (sin bandera). */
export const ANILLO_DEL_PRODUCTO: AnilloDelEncastre = 'tubo'

export const LUZ_DEL_ANILLO = {
  /** Cuánto se ve el anillo (0: nada; 1: blanco entero): su luz parejo más el pulso. */
  uLuzDelAnillo: { value: 0 },
  /** Cuánto se ensambló (0: en segmentos; 1: sólido). */
  uEnsambleDelAnillo: { value: 0 },
  /** Cuánto se ve el disco (la variante `disco`). */
  uLuzDelDisco: { value: 0 },
}

/**
 * Las medidas. `radio` es el borde de la zona lisa (`CALMA_EN_EL_PISO.radio`, en `enElPiso.ts`: lo afirma `s56`; importarlo
 * haría un ciclo) y el anillo va adentro, al ras de ese borde (`ancho`, u). Su luz parejo (`base`) y lo que suman la onda y el
 * golpe (`onda`, `golpe`; se apagan en `ondaS` y `golpeS` s). Los `segmentos`, el `hueco` entre ellos antes de ensamblarse
 * (fracción de cada uno) y cuánto tarda en cerrarse en el golpe (`ensambleS`). El disco: su luz parejo (`disco`).
 */
export const ANILLO_DE_LUZ = { radio: 4.2, ancho: 0.24, base: 0.86, onda: 0.14, golpe: 0.14, ondaS: 0.32, golpeS: 0.7, segmentos: 12, hueco: 0.5, ensambleS: 0.35, disco: 0.8 } as const

/** El pulso a `desde` s de que nació (la onda o el golpe), que se apaga en `s`: entero al nacer, y cae. */
export function pulsoDelAnillo(desde: number, s: number): number {
  return desde >= 0 && Number.isFinite(desde) ? Math.exp(-desde / s) : 0
}

/** Lo que dibuja cada variante: el tubo, el disco y el filo del logo. */
export function partesDelAnillo(v: AnilloDelEncastre): { readonly tubo: boolean; readonly disco: boolean; readonly filo: boolean } {
  return { tubo: v === 'tubo' || v === 'tubo+filo', disco: v === 'disco', filo: v === 'filo' || v === 'tubo+filo' }
}

const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))
const CENTRO_DEL_ANILLO = ANILLO_DE_LUZ.radio - ANILLO_DE_LUZ.ancho / 2

/**
 * El dibujo (GLSL, en el piso, sobre el color ya en pantalla): el disco hacia el blanco hasta el borde de la zona lisa y el
 * anillo, una banda de `ancho` al ras de ese borde, partida en `segmentos` con su hueco hasta que se ensambla. Los bordes, de un
 * píxel (`fwidth`); ensamblado, sin costuras (el hueco en cero no deja nada).
 */
export const LUZ_DEL_ANILLO_GLSL = /* glsl */ `
uniform float uLuzDelAnillo;
uniform float uEnsambleDelAnillo;
uniform float uLuzDelDisco;
vec3 conElAnillo( vec3 color, vec2 xz ) {
	if ( uLuzDelAnillo <= 0.0 && uLuzDelDisco <= 0.0 ) return color;
	float r = length( xz );
	float aa = max( fwidth( r ), 1e-4 );
	vec3 c = color;
	if ( uLuzDelDisco > 0.0 ) {
		float disco = 1.0 - smoothstep( ${f(ANILLO_DE_LUZ.radio)} - aa, ${f(ANILLO_DE_LUZ.radio)} + aa, r );
		c = mix( c, vec3( 1.0 ), clamp( uLuzDelDisco, 0.0, 1.0 ) * disco );
	}
	if ( uLuzDelAnillo > 0.0 ) {
		float banda = 1.0 - smoothstep( ${f(ANILLO_DE_LUZ.ancho / 2)} - aa, ${f(ANILLO_DE_LUZ.ancho / 2)} + aa, abs( r - ${f(CENTRO_DEL_ANILLO)} ) );
		float hueco = ${f(ANILLO_DE_LUZ.hueco)} * ( 1.0 - clamp( uEnsambleDelAnillo, 0.0, 1.0 ) );
		float lleno = 1.0;
		if ( hueco > 0.0 ) {
			// En cada segmento: 0 en su centro, 1 en su punta. Lleno hasta 1 − hueco; el borde, de un píxel a lo largo del arco.
			float s = atan( xz.y, xz.x ) * ${f(ANILLO_DE_LUZ.segmentos / (2 * Math.PI))};
			float enElSegmento = abs( fract( s ) - 0.5 ) * 2.0;
			float aaDelArco = 2.0 * aa / max( r, 1e-3 ) * ${f(ANILLO_DE_LUZ.segmentos / (2 * Math.PI))};
			lleno = 1.0 - smoothstep( 1.0 - hueco, 1.0 - hueco + 2.0 * aaDelArco, enElSegmento );
		}
		c = mix( c, vec3( 1.0 ), clamp( uLuzDelAnillo, 0.0, 1.0 ) * banda * lleno );
	}
	return c;
}
`
