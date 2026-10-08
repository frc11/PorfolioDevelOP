/**
 * [PULIDO 4] C2 · LA LUZ DEL CÍRCULO — el brillo del logo de PULIDO 3B · B0 (su filo encendido y un pulso en el logo) no gustó:
 * se sacó y el logo volvió a como era. El brillo pasó a TODA la zona circular lisa alrededor del logo, el círculo quieto del
 * piso (`CALMA_EN_EL_PISO`: entero hasta `radio`): se ilumina en blanco con la energía extendida, FUERA del oscurecimiento de la
 * sala (se dibuja después), y pulsa con cada onda de energía (`onda`) y con fuerza en el golpe (`golpe`, más largo): el
 * borde se abre y un halo sale del círculo. El logo, negro, se lee recortado contra esa luz. Lo dibuja el piso (`enElPiso.ts`);
 * los uniformes los escribe `cuadroDelFinal.ts`.
 */
export const LUZ_DEL_CIRCULO = {
  /** La luz del círculo (0 a `base`): con la energía extendida. */
  uLuzDelCirculo: { value: 0 },
  /** El pulso (0 a `golpe`): la onda que nace o el golpe. */
  uPulsoDelCirculo: { value: 0 },
}

/**
 * La luz con la energía entera (`base`: el blanco que ya se lee como luz, sin quemar las juntas), cuánto suma la onda y cuánto
 * el golpe, cuánto duran (s), el radio del círculo (u: el del círculo quieto), su borde (u: se abre con el pulso) y el halo que
 * sale con el pulso (u de alcance y cuánto).
 */
// `radio` es el del círculo quieto (`CALMA_EN_EL_PISO.radio`, en `enElPiso.ts`: lo afirma `s55`; importarlo haría un ciclo).
export const CIRCULO_DE_LUZ = { base: 0.62, onda: 0.32, golpe: 0.75, ondaS: 0.32, golpeS: 0.7, radio: 4.2, borde: 1.6, halo: 6, enElHalo: 0.3 } as const

/** El pulso a `desde` s de que nació (la onda o el golpe), que se apaga en `s`: entero al nacer, y cae. */
export function pulsoDelCirculo(desde: number, s: number): number {
  return desde >= 0 && Number.isFinite(desde) ? Math.exp(-desde / s) : 0
}

const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))

/** El dibujo (GLSL, en el piso): el círculo hacia el blanco con su luz y su pulso, con el borde que se abre y el halo. */
export const LUZ_DEL_CIRCULO_GLSL = /* glsl */ `
uniform float uLuzDelCirculo;
uniform float uPulsoDelCirculo;
vec3 conLaLuzDelCirculo( vec3 color, vec2 xz ) {
	float luz = uLuzDelCirculo + uPulsoDelCirculo;
	if ( luz <= 0.0 ) return color;
	float r = length( xz );
	float disco = 1.0 - smoothstep( ${f(CIRCULO_DE_LUZ.radio)}, ${f(CIRCULO_DE_LUZ.radio)} + ${f(CIRCULO_DE_LUZ.borde)} * ( 1.0 + uPulsoDelCirculo ), r );
	float halo = ${f(CIRCULO_DE_LUZ.enElHalo)} * uPulsoDelCirculo * ( 1.0 - smoothstep( ${f(CIRCULO_DE_LUZ.radio)}, ${f(CIRCULO_DE_LUZ.radio + CIRCULO_DE_LUZ.halo)}, r ) );
	return mix( color, vec3( 1.0 ), clamp( luz, 0.0, 1.0 ) * disco ) + vec3( halo );
}
`
