import * as THREE from 'three'

import { FINAL_EN_EL_PISO } from '../final/enElPiso'
import { FLOOR_Y, INK_COLOR } from '../probeScene'

/**
 * [NOCTURNO B3] EL HUECO ANULAR EN EL PISO, BAJO EL ARO — mientras el título se da vuelta y se vuelve el CTA, en el piso se abre un anillo
 * justo debajo del camino de las placas y las reseñas bajan por ahí. Función pura del avance de la apertura (`abre`, 0 a 1): para atrás, se
 * cierra.
 * [L5] UN HUECO DE VERDAD («el piso no moleste ahí, se abra, se escondan las reseñas, y se cierre»: lote2/12). Era una ranura oscura pegada al
 * piso: las placas se hundían en el piso entero (su cara las cortaba) y los bloques que el mouse levantaba las atravesaban. Ahora el piso
 * no se dibuja en la corona abierta y alrededor queda al ras (`uAnilloDelAro`, `final/enElPiso.ts`), y debajo hay un pozo de tinta: dos
 * paredes (la de adentro y la de afuera de la corona) y el fondo. Las placas caben en la corona (su huella sale 0,11 del radio contra
 * 0,31 de medio ancho): bajan sin tocar el piso.
 */
export const HUECO_DEL_ARO = {
  /** El ancho de la ranura abierta (mundo, a escala 1). */
  ancho: 0.62,
  /** [L5] Lo hondo del pozo (mundo, a escala 1): más que lo que bajan las placas (`HONDO_DE_LA_BAJADA`). */
  hondo: 3.6,
} as const

const VERTICE = /* glsl */ `
varying vec2 vXZ;
void main() {
  vec4 mundo = modelMatrix * vec4(position, 1.0);
  vXZ = mundo.xz;
  gl_Position = projectionMatrix * viewMatrix * mundo;
}
`

const FRAGMENTO = /* glsl */ `
uniform float uRadio;
uniform float uAncho;
uniform float uAbre;
uniform vec3 uColor;
varying vec2 vXZ;
void main() {
  float d = abs(length(vXZ) - uRadio);
  float medio = max(1e-4, 0.5 * uAncho * uAbre);
  if (d > medio) discard;
  gl_FragColor = vec4(uColor, 1.0);
}
`

export interface HuecoArmado {
  readonly grupo: THREE.Group
  readonly fondo: THREE.Mesh<THREE.RingGeometry, THREE.ShaderMaterial>
  readonly adentro: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>
  readonly afuera: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>
  readonly uniforms: { readonly uRadio: { value: number }; readonly uAncho: { value: number }; readonly uAbre: { value: number }; readonly uColor: { value: THREE.Color } }
  readonly radio: number
  readonly medio: number
}

/** El pozo para un aro de radio `radio` y su escala `k`: el fondo (cubre la ranura abierta entera) y las dos paredes (de radio 1, se escalan). */
export function armarElHueco(radio: number, k: number): HuecoArmado {
  const ancho = HUECO_DEL_ARO.ancho * k
  const hondo = HUECO_DEL_ARO.hondo * k
  const uniforms = { uRadio: { value: radio }, uAncho: { value: ancho }, uAbre: { value: 0 }, uColor: { value: new THREE.Color(INK_COLOR) } }
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTICE, fragmentShader: FRAGMENTO })
  const fondo = new THREE.Mesh(new THREE.RingGeometry(Math.max(0.01, radio - ancho), radio + ancho, 128, 1), material)
  fondo.rotation.x = -Math.PI / 2
  fondo.position.y = FLOOR_Y - hondo
  fondo.name = 'resenas · el fondo del pozo'
  const pared = (lado: THREE.Side, nombre: string): THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial> => {
    const geometria = new THREE.CylinderGeometry(1, 1, hondo, 128, 1, true)
    const malla = new THREE.Mesh(geometria, new THREE.MeshBasicMaterial({ color: INK_COLOR, side: lado }))
    malla.position.y = FLOOR_Y - hondo / 2
    malla.name = nombre
    return malla
  }
  // La de adentro se ve desde afuera (su cara de siempre); la de afuera, desde adentro.
  const adentro = pared(THREE.FrontSide, 'resenas · la pared de adentro del pozo')
  const afuera = pared(THREE.BackSide, 'resenas · la pared de afuera del pozo')
  const grupo = new THREE.Group()
  grupo.name = 'resenas · el hueco del aro'
  grupo.add(fondo, adentro, afuera)
  grupo.visible = false
  return { grupo, fondo, adentro, afuera, uniforms, radio, medio: ancho / 2 }
}

/** El hueco abierto `abre` (0 a 1): el pozo y el anillo del piso. Sin abrir no se dibuja y el piso queda entero. */
export function abrirElHueco(h: HuecoArmado, abre: number): void {
  const u = Math.min(1, Math.max(0, abre))
  h.uniforms.uAbre.value = u
  h.grupo.visible = u > 0.001
  const medio = Math.max(1e-3, h.medio * u)
  h.adentro.scale.set(Math.max(0.01, h.radio - medio), 1, Math.max(0.01, h.radio - medio))
  h.afuera.scale.set(h.radio + medio, 1, h.radio + medio)
  FINAL_EN_EL_PISO.uAnilloDelAro.value.set(h.radio, h.medio, h.grupo.visible ? u : 0)
}

export function soltarElHueco(h: HuecoArmado): void {
  h.fondo.geometry.dispose()
  h.fondo.material.dispose()
  for (const p of [h.adentro, h.afuera]) {
    p.geometry.dispose()
    p.material.dispose()
  }
  FINAL_EN_EL_PISO.uAnilloDelAro.value.set(0, 0, 0)
}
