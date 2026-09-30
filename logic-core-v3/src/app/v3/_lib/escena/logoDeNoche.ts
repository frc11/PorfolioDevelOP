import * as THREE from 'three'

import { EMISION_EN_LA_NOCHE } from './logoEmision'

/**
 * [ESCENA 9] T2 · EL LOGO DE NOCHE — una prueba (bandera `logo-noche=<variante>`): de noche los COSTADOS (todo el
 * perímetro extruido: bisel y pared) van en negro sólido, y las TAPAS (la cara de adelante y la de atrás) con el gris
 * claro de hoy y un borde bien marcado en su contorno. De día el logo no cambia: todo sale de la emisión, que de día es
 * cero (`logoEmision.ts`).
 *
 * **Por qué se veía lavado.** De noche el logo emite 0,16 PAREJO en todas sus caras (B13): costados y tapas salen del
 * mismo gris (97 de 255 sobre una sala de 20), así que la pieza se lee como una silueta plana, sin espesor ni canto.
 *
 * **Cómo.** Un parche sobre el material del logo (el mismo que ya parchean el rebote y el amanecer; `ProbeLogo` lo
 * instala sólo con la bandera). Qué cara es cuál sale de la normal de la geometría: las tapas son planas y su normal es
 * ±z exacta (B7 no las suavizó); la de los costados, nunca (el primer anillo del bisel queda a más de 8°). El borde es
 * la distancia al contorno de la tapa en su plano: el contorno del SVG (los mismos puntos que usa la extrusión) en un
 * campo de distancia 2D horneado una vez al cargar (`hornearElContorno`), leído con antialias analítico (`fwidth`).
 * Durante el amanecer, el gris que el logo guarda hasta que lo alcanza el día (`LOGO_DE_NOCHE`) lleva el mismo dibujo.
 *
 * **Las variantes** (el grosor en unidades del SVG, el logo mide ~1000; `luz` es el valor en pantalla del borde, 0 =
 * negro): el borde es una tinta sobre la tapa, así que se prueba negro fino y grueso y uno claro.
 */
export type VarianteDelLogoDeNoche = 'fino' | 'grueso' | 'claro'

export const VARIANTES_DEL_LOGO_DE_NOCHE: Readonly<Record<VarianteDelLogoDeNoche, { readonly ancho: number; readonly luz: number }>> = {
  /** Negro, fino: una línea de tinta de ~1,5 px a 1440 en el hero de noche. */
  fino: { ancho: 7, luz: 0 },
  /** Negro, grueso: el doble y un poco más; la tapa gris queda como un relleno dentro de un marco. */
  grueso: { ancho: 16, luz: 0 },
  /** Claro: un filo casi blanco, del ancho del fino y medio; recorta la tapa contra los costados negros. */
  claro: { ancho: 10, luz: 0.88 },
}

/** Hasta dónde sabe distancias el campo del contorno (unidades del SVG) y cuántas unidades por celda. */
export const CONTORNO = { alcance: 40, celda: 2 } as const

/** Negro sólido de noche: el valor en pantalla de los costados mientras el amanecer guarda la noche. */
const NEGRO_DE_NOCHE = 0.03

/** El campo de distancia al contorno de las tapas, en el plano de la geometría (unidades del SVG, ya centrada). */
export interface ContornoDelLogo {
  readonly textura: THREE.DataTexture
  /** La esquina de la caja y 1 / su tamaño: la uv de un punto del plano es `(p − min) · inv`. */
  readonly caja: THREE.Vector4
}

/**
 * Hornea la distancia (sin signo, topada en `CONTORNO.alcance`) de cada celda al contorno más cercano: sólo las celdas
 * a menos del alcance de algún tramo, recorriendo cada tramo por su caja. `centro` es lo que la geometría se corrió.
 * Pura salvo la textura: el invariante la usa con un contorno de prueba.
 */
export function distanciasAlContorno(contornos: readonly (readonly THREE.Vector2[])[], min: readonly [number, number], n: readonly [number, number]): Uint8Array {
  const { alcance, celda } = CONTORNO
  const d = new Float32Array(n[0] * n[1]).fill(alcance)
  for (const puntos of contornos) {
    for (let k = 0; k < puntos.length; k += 1) {
      const a = puntos[k]
      const b = puntos[(k + 1) % puntos.length]
      const [dx, dy] = [b.x - a.x, b.y - a.y]
      const largo2 = dx * dx + dy * dy
      const i0 = Math.max(0, Math.floor((Math.min(a.x, b.x) - alcance - min[0]) / celda))
      const i1 = Math.min(n[0] - 1, Math.ceil((Math.max(a.x, b.x) + alcance - min[0]) / celda))
      const j0 = Math.max(0, Math.floor((Math.min(a.y, b.y) - alcance - min[1]) / celda))
      const j1 = Math.min(n[1] - 1, Math.ceil((Math.max(a.y, b.y) + alcance - min[1]) / celda))
      for (let j = j0; j <= j1; j += 1) {
        const y = min[1] + (j + 0.5) * celda
        for (let i = i0; i <= i1; i += 1) {
          const x = min[0] + (i + 0.5) * celda
          const u = largo2 > 0 ? Math.min(1, Math.max(0, ((x - a.x) * dx + (y - a.y) * dy) / largo2)) : 0
          const e = Math.hypot(x - a.x - u * dx, y - a.y - u * dy)
          if (e < d[j * n[0] + i]) d[j * n[0] + i] = e
        }
      }
    }
  }
  const salida = new Uint8Array(d.length)
  for (let k = 0; k < d.length; k += 1) salida[k] = Math.round((d[k] / alcance) * 255)
  return salida
}

/** El contorno de las tapas (los puntos que usa `ExtrudeGeometry` con sus `curveSegments`), corrido por `centro`. */
export function hornearElContorno(formas: readonly THREE.Shape[], curvas: number, centro: THREE.Vector3): ContornoDelLogo {
  const contornos: THREE.Vector2[][] = []
  for (const f of formas) {
    const { shape, holes } = f.extractPoints(curvas)
    for (const c of [shape, ...holes]) contornos.push(c.map((p) => new THREE.Vector2(p.x - centro.x, p.y - centro.y)))
  }
  const caja = new THREE.Box2()
  for (const c of contornos) for (const p of c) caja.expandByPoint(p)
  const margen = CONTORNO.alcance + CONTORNO.celda
  const min: [number, number] = [caja.min.x - margen, caja.min.y - margen]
  const n: [number, number] = [Math.ceil((caja.max.x - caja.min.x + 2 * margen) / CONTORNO.celda), Math.ceil((caja.max.y - caja.min.y + 2 * margen) / CONTORNO.celda)]
  const textura = new THREE.DataTexture(distanciasAlContorno(contornos, min, n), n[0], n[1], THREE.RedFormat, THREE.UnsignedByteType)
  textura.minFilter = THREE.LinearFilter
  textura.magFilter = THREE.LinearFilter
  textura.wrapS = THREE.ClampToEdgeWrapping
  textura.wrapT = THREE.ClampToEdgeWrapping
  textura.unpackAlignment = 1
  textura.needsUpdate = true
  return { textura, caja: new THREE.Vector4(min[0], min[1], 1 / (n[0] * CONTORNO.celda), 1 / (n[1] * CONTORNO.celda)) }
}

/** Lo que el parche lee: si está prendido (0 = como el producto: para comparar en el mismo cuadro), el borde y el campo. */
export interface UniformsDelLogoDeNoche {
  readonly uLogoDeNoche: { value: number }
  readonly uAnchoDelBorde: { value: number }
  readonly uLuzDelBorde: { value: number }
  readonly uContornoDelLogo: { value: THREE.Texture | null }
  readonly uCajaDelContorno: { value: THREE.Vector4 }
}

/** Los uniforms de una variante (o del producto, con `no`). */
export function aplicarVariante(u: UniformsDelLogoDeNoche, variante: VarianteDelLogoDeNoche | 'no'): void {
  u.uLogoDeNoche.value = variante === 'no' ? 0 : 1
  if (variante === 'no') return
  u.uAnchoDelBorde.value = VARIANTES_DEL_LOGO_DE_NOCHE[variante].ancho
  u.uLuzDelBorde.value = VARIANTES_DEL_LOGO_DE_NOCHE[variante].luz
}

/** La luz del borde en pantalla, como radiancia para la emisión (la inversa de sRGB; Neutral es la identidad hasta ~0,8). */
const radianciaDe = (pantalla: string): string => `pow( ${pantalla}, 2.2 )`

const VERTICE_PARS = /* glsl */ `
varying vec2 vPlanoDelLogo;
varying float vTapaDelLogo;
`

const VERTICE = /* glsl */ `
	// [ESCENA 9] T2 · las tapas son planas: su normal de geometría es ±z exacta; la de los costados, nunca.
	vPlanoDelLogo = position.xy;
	vTapaDelLogo = step( 0.999, abs( normal.z ) );
`

const FRAGMENTO_PARS = /* glsl */ `
#define LOGO_DE_NOCHE_CON_BORDE
varying vec2 vPlanoDelLogo;
varying float vTapaDelLogo;
uniform float uLogoDeNoche;
uniform float uAnchoDelBorde;
uniform float uLuzDelBorde;
uniform sampler2D uContornoDelLogo;
uniform vec4 uCajaDelContorno;
// Cuánto borde hay en este punto de la tapa (0 en los costados), con antialias analítico.
float bordeDelLogoDeNoche() {
	float d = texture2D( uContornoDelLogo, ( vPlanoDelLogo - uCajaDelContorno.xy ) * uCajaDelContorno.zw ).r * ${CONTORNO.alcance.toFixed(1)};
	float aa = max( fwidth( d ) * 0.75, 0.05 );
	return vTapaDelLogo * ( 1.0 - smoothstep( uAnchoDelBorde - aa, uAnchoDelBorde + aa, d ) );
}
// El color en pantalla del logo de noche mientras el amanecer lo guarda (\`gris\`: el de hoy, parejo).
vec3 colorDelLogoDeNoche( float gris ) {
	vec3 c = mix( vec3( ${NEGRO_DE_NOCHE.toFixed(2)} ), vec3( gris ), vTapaDelLogo );
	c = mix( c, vec3( uLuzDelBorde ), bordeDelLogoDeNoche() );
	return mix( vec3( gris ), c, uLogoDeNoche );
}
`

const FRAGMENTO = /* glsl */ `
	{
		// [ESCENA 9] T2 · de noche: los costados sin emisión (negro sólido), las tapas con la de hoy y su borde.
		float noche = clamp( emissive.r / ${EMISION_EN_LA_NOCHE.toFixed(3)}, 0.0, 1.0 );
		vec3 conBorde = mix( totalEmissiveRadiance * vTapaDelLogo, vec3( ${radianciaDe('uLuzDelBorde')} ) * noche, bordeDelLogoDeNoche() );
		totalEmissiveRadiance = mix( totalEmissiveRadiance, conBorde, uLogoDeNoche );
	}
`

type Shader = Parameters<THREE.Material['onBeforeCompile']>[0]

/**
 * Instala el parche en el material del logo, con la variante pedida, y devuelve sus uniforms (el banco los cambia para
 * comparar las variantes en el mismo cuadro). Encadena el `onBeforeCompile` que ya tuviera; los que se instalan después
 * (el rebote, el amanecer) lo encadenan a él. Su código va ANTES de la emisiva del mapa: el rebote suma después.
 */
export function conLogoDeNoche(material: THREE.MeshStandardMaterial, contorno: ContornoDelLogo, variante: VarianteDelLogoDeNoche): UniformsDelLogoDeNoche {
  const u: UniformsDelLogoDeNoche = {
    uLogoDeNoche: { value: 1 },
    uAnchoDelBorde: { value: 0 },
    uLuzDelBorde: { value: 0 },
    uContornoDelLogo: { value: contorno.textura },
    uCajaDelContorno: { value: contorno.caja },
  }
  aplicarVariante(u, variante)
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.onBeforeCompile = (shader: Shader, renderer) => {
    previo(shader, renderer)
    Object.assign(shader.uniforms, u)
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\n${VERTICE_PARS}`).replace('#include <begin_vertex>', `#include <begin_vertex>\n${VERTICE}`)
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>\n${FRAGMENTO_PARS}`).replace('#include <emissivemap_fragment>', `${FRAGMENTO}\n#include <emissivemap_fragment>`)
  }
  material.customProgramCacheKey = () => `${clavePrevia()}|logo-de-noche`
  material.needsUpdate = true
  return u
}
