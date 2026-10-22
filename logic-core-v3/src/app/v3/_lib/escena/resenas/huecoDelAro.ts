import * as THREE from 'three'

import { FLOOR_Y, INK_COLOR } from '../probeScene'

/**
 * [NOCTURNO B3] EL HUECO ANULAR EN EL PISO, BAJO EL ARO — mientras el título se da vuelta y se vuelve el CTA, en el piso se abre un anillo
 * justo debajo del camino de las placas y las reseñas bajan por ahí. El piso no se corta (su sombreador es del final del pie, `final/
 * hueco.ts`, y no se toca): el anillo es una ranura oscura pegada al piso (un degradé de la tinta, más oscuro en el medio, que se abre desde
 * la línea del aro hacia sus bordes) y las placas, al bajar, pasan por debajo de la cara del piso, que las tapa (la profundidad): se las ve
 * hundirse en la ranura. Función pura del avance de la apertura (`abre`, 0 a 1): para atrás, se cierra.
 */
export const HUECO_DEL_ARO = {
  /** El ancho de la ranura abierta (mundo, a escala 1) y cuánto sobre el piso va (para no pelearse con él). */
  ancho: 0.62,
  sobreElPiso: 0.004,
  /** Lo oscuro del medio (alfa de la tinta). */
  fondo: 0.92,
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
uniform float uFondo;
uniform vec3 uColor;
varying vec2 vXZ;
void main() {
  float d = abs(length(vXZ) - uRadio);
  float medio = max(1e-4, 0.5 * uAncho * uAbre);
  float adentro = 1.0 - smoothstep(medio * 0.55, medio, d);
  if (adentro <= 0.0) discard;
  gl_FragColor = vec4(uColor, adentro * uFondo * smoothstep(0.0, 0.15, uAbre));
}
`

export interface HuecoArmado {
  readonly malla: THREE.Mesh<THREE.RingGeometry, THREE.ShaderMaterial>
  readonly uniforms: { readonly uRadio: { value: number }; readonly uAncho: { value: number }; readonly uAbre: { value: number }; readonly uFondo: { value: number }; readonly uColor: { value: THREE.Color } }
}

/** El anillo para un aro de radio `radio` y su escala `k` (la geometría cubre la ranura abierta entera). */
export function armarElHueco(radio: number, k: number): HuecoArmado {
  const ancho = HUECO_DEL_ARO.ancho * k
  const uniforms = { uRadio: { value: radio }, uAncho: { value: ancho }, uAbre: { value: 0 }, uFondo: { value: HUECO_DEL_ARO.fondo }, uColor: { value: new THREE.Color(INK_COLOR) } }
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTICE, fragmentShader: FRAGMENTO, transparent: true, depthWrite: false })
  const malla = new THREE.Mesh(new THREE.RingGeometry(Math.max(0.01, radio - ancho), radio + ancho, 128, 1), material)
  malla.rotation.x = -Math.PI / 2
  malla.position.y = FLOOR_Y + HUECO_DEL_ARO.sobreElPiso
  malla.renderOrder = -1
  malla.name = 'resenas · el hueco del aro'
  malla.visible = false
  return { malla, uniforms }
}

/** El hueco abierto `abre` (0 a 1): sin abrir no se dibuja. */
export function abrirElHueco(h: HuecoArmado, abre: number): void {
  const u = Math.min(1, Math.max(0, abre))
  h.uniforms.uAbre.value = u
  h.malla.visible = u > 0.001
}

export function soltarElHueco(h: HuecoArmado): void {
  h.malla.geometry.dispose()
  h.malla.material.dispose()
}
