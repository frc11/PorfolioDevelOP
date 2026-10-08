import type * as THREE from 'three'

/**
 * [PULIDO 5] D2 · EL LOGO DEL FINAL, LO QUE MÁS SE VE — «el logo se lo siente muy opacado, tiene que ser lo que MÁS se vea».
 * En el quieto, visto desde el cenit, el negro satinado salía gris medio por tres cosas: los reflejos del estudio (desde arriba
 * la cara del logo refleja su cielo claro), la niebla de la sala (la cámara está a más de 40 u) y las motas de polvo posadas
 * encima. En el final (con la cámara que sube, `uLogoDelFinal` de 0 a 1):
 *   · sin niebla en el logo (la niebla de su color se apaga: `fog_fragment`, con el factor por `1 − uLogoDelFinal`);
 *   · con menos reflejo del estudio (`reflejo` del de siempre: queda su satinado, no el gris);
 *   · sin polvo encima (el polvo se apaga en un cilindro sobre el logo y su círculo: `polvo/parche.ts`);
 *   · y, en las variantes `filo` y `tubo+filo` (`anilloDeLuz.ts`), su filo blanco bien marcado: el borde de las tapas del
 *     logo de noche (`logoDeNoche.ts`, `bordeDelLogoDeNoche`) encendido en blanco, sin la noche (`uFiloDelFinal`).
 * El oscurecimiento de la sala es del piso (`uOscuroDelBrillo`): el logo nunca lo tuvo. Los uniformes los escribe
 * `cuadroDelFinal.ts`; los reflejos, `LuzDelLogo.tsx`.
 */
export const LOGO_DEL_FINAL = {
  /** Cuánto del reflejo del estudio queda en el final (1: el de siempre). */
  reflejo: 0.2,
  /** El valor en pantalla del filo (0 = negro): casi blanco. */
  filo: 0.97,
  /** Cuántas veces el ancho del filo del logo de noche (el campo de su contorno llega a 4 veces): bien marcado. */
  anchoDelFilo: 2.2,
  /** El radio del cilindro sin polvo sobre el logo (u): el de la zona lisa y el anillo, con aire. */
  sinPolvo: 4.6,
} as const

export const LOGO_DEL_FINAL_EN_VIVO = {
  /** 0 a 1: cuánto del final tiene el logo (la cámara que sube a mirarlo desde arriba). */
  uLogoDelFinal: { value: 0 },
  /** 0 a 1: cuánto se ve su filo blanco (las variantes con filo). */
  uFiloDelFinal: { value: 0 },
}

/** El reflejo del estudio del logo con `final` (0 a 1) del final: el de la sala por lo que queda en el final. */
export const reflejoDelLogo = (nivel: number, final: number): number => nivel * (1 - (1 - LOGO_DEL_FINAL.reflejo) * Math.min(1, Math.max(0, final)))

const radiancia = (pantalla: number): string => `pow( ${pantalla.toFixed(3)}, 2.2 )`

/** La niebla del logo, apagada con el final (la de three, con su factor por lo que queda). */
const NIEBLA_GLSL = /* glsl */ `
#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor * ( 1.0 - uLogoDelFinal ) );
#endif
`

/**
 * El filo: el borde de las tapas del logo de noche (su campo de distancia al contorno), más ancho y en blanco (si el material
 * tiene el dibujo de noche).
 */
const FILO_GLSL = /* glsl */ `
	#ifdef LOGO_DE_NOCHE_CON_BORDE
		if ( uFiloDelFinal > 0.0 ) {
			float dDelFilo = texture2D( uContornoDelLogo, ( vPlanoDelLogo - uCajaDelContorno.xy ) * uCajaDelContorno.zw ).r * uAlcanceDelContorno;
			float aaDelFilo = max( fwidth( dDelFilo ) * 0.75, uAlcanceDelContorno * 0.00125 );
			float anchoDelFilo = uAnchoDelBorde * ${LOGO_DEL_FINAL.anchoDelFilo.toFixed(2)};
			float filo = vTapaDelLogo * ( 1.0 - smoothstep( anchoDelFilo - aaDelFilo, anchoDelFilo + aaDelFilo, dDelFilo ) );
			totalEmissiveRadiance = mix( totalEmissiveRadiance, vec3( ${radiancia(LOGO_DEL_FINAL.filo)} ), filo * uFiloDelFinal );
		}
	#endif
`

type Shader = Parameters<THREE.Material['onBeforeCompile']>[0]

/** Instala el parche en el material del logo (encadena el `onBeforeCompile` que ya tenga: el del logo de noche, antes). */
export function conElLogoDelFinal(material: THREE.MeshStandardMaterial): void {
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.onBeforeCompile = (shader: Shader, renderer) => {
    previo(shader, renderer)
    Object.assign(shader.uniforms, LOGO_DEL_FINAL_EN_VIVO)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uLogoDelFinal;\nuniform float uFiloDelFinal;')
      .replace('#include <emissivemap_fragment>', `${FILO_GLSL}\n#include <emissivemap_fragment>`)
      .replace('#include <fog_fragment>', NIEBLA_GLSL)
  }
  material.customProgramCacheKey = () => `${clavePrevia()}|logo-del-final`
  material.needsUpdate = true
}
