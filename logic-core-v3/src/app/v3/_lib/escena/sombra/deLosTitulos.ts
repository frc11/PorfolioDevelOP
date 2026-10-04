import * as THREE from 'three'

import { DISOLVER_GLSL, DISOLVER_PARS_GLSL } from '../titulos3d/llegada'
import { SOMBRA_DEL_LOGO, sombraProyectadaGlsl, type ParametrosDelMapa } from './delLogo'

/**
 * [PASADA FINAL] C3 · LA SOMBRA DE LOS TÍTULOS SOBRE EL PISO VIVO — una prueba (`?pruebas=sombratitulos=si`; apagada en
 * el producto: la decide Valentino). La misma técnica que la del logo (`delLogo.ts`): los títulos SOLOS (nadie más
 * proyecta en este mapa), vistos desde su luz con una cámara ortográfica que abraza a los que se ven, dibujados en cada
 * cuadro como los dos momentos de su profundidad y desenfocados (la penumbra); el piso hace una lectura por píxel.
 *
 *   · **De día** la luz es la principal (el sol del arco): la sombra oscurece hacia el color del contacto, como la del
 *     logo, con el nivel de la principal y el día que hay (`VIVO.uNocheDelLogo`).
 *   · **De noche** la única luz es el haz, cenital y duro, sobre el logo: la cámara de la luz se va poniendo vertical con
 *     la noche y la sombra le QUITA luz al charco del haz (`uNocheDeLosTitulos`). Donde el haz no llega no hay luz que
 *     quitar: no hay sombra. Coherente con la luz que hay, sin una segunda lógica.
 *
 * Cada letra proyecta donde está: el material del mapa repite la llegada de su título (las letras en camino, con su giro)
 * y su disuelto (el tramado; desenfocado, una sombra que aparece con la letra).
 */
export const SOMBRA_DE_LOS_TITULOS: ParametrosDelMapa & { readonly fuerza: number; readonly fuerzaDeNoche: number; readonly margen: number } = {
  // Más grande que el del logo: abraza a todos los títulos que se ven (la caja se ajusta en cada cuadro).
  resolucion: 512,
  radio: 8,
  // Largo: de la luz a los títulos y de ahí al piso, con el sol bajo.
  lejos: 120,
  desenfoque: { pasadas: 2, sigma: 2 },
  varianzaMinima: SOMBRA_DEL_LOGO.varianzaMinima,
  sangrado: SOMBRA_DEL_LOGO.sangrado,
  /** De día: cuánto oscurece con la principal entera (un poco menos que el logo: los títulos son finos y van más alto). */
  fuerza: 0.32,
  /** De noche: cuánto del charco del haz quita donde está del todo a la sombra. */
  fuerzaDeNoche: 0.8,
  /** El aire de la caja alrededor de los títulos (el desenfoque no se corta en su borde). */
  margen: 1.2,
}

const P = SOMBRA_DE_LOS_TITULOS
const f = (x: number): string => x.toFixed(6)

/** Lo que lee el piso y escribe `SombraDeLosTitulos` en cada cuadro. */
export const SOMBRA_DE_LOS_TITULOS_EN_VIVO = {
  uMapaDeLosTitulos: { value: null as THREE.Texture | null },
  uLuzDeLosTitulos: { value: new THREE.Matrix4() },
  uVistaDeLosTitulos: { value: new THREE.Matrix4() },
  /** Si hay algo que leer (de día o de noche): sin nada, el piso no lee el mapa. */
  uHayDeLosTitulos: { value: 0 },
  /** De día: cuánto oscurece. De noche: cuánto del charco del haz quita. */
  uFuerzaDeLosTitulos: { value: 0 },
  uNocheDeLosTitulos: { value: 0 },
}

/**
 * En el piso: `sombraDeLosTitulos( mundo )`. Como la del logo, y además lo que el mapa no tapa (su fondo) es luz: con el
 * sol bajo, el piso puede quedar más lejos que la caja de la luz y la cota de Chebyshev lo daría a la sombra.
 */
export const SOMBRA_DE_LOS_TITULOS_GLSL = sombraProyectadaGlsl({ funcion: 'sombraDeLosTitulos', mapa: 'uMapaDeLosTitulos', luz: 'uLuzDeLosTitulos', vista: 'uVistaDeLosTitulos', fuerza: 'uHayDeLosTitulos' }, P)
  .replace('\tif ( receptor <= m.x ) return 0.0;', '\tif ( receptor <= m.x || m.x > 0.999 ) return 0.0;')
  .replace('uniform float uHayDeLosTitulos;', 'uniform float uHayDeLosTitulos;\nuniform float uFuerzaDeLosTitulos;\nuniform float uNocheDeLosTitulos;')

/** De día, hacia el color del contacto (después de la del logo y las del pie); la de noche va en el charco del haz. */
export const APLICAR_LA_SOMBRA_DE_LOS_TITULOS_GLSL = /* glsl */ `float sombraDeLosTitulosAca = sombraDeLosTitulos( vPiso );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, COLOR_DEL_CONTACTO, sombraDeLosTitulosAca * uFuerzaDeLosTitulos );`

/** El charco del haz, con lo que le quitan los títulos de noche. */
export const CHARCO_CON_LOS_TITULOS_GLSL = ' * ( 1.0 - sombraDeLosTitulosAca * uNocheDeLosTitulos )'

/** Los sombreadores de la llegada de un título (los mismos que dibujan sus letras: `titulos3d/llegada.ts`). */
export interface LlegadaEnGlsl {
  readonly pars: string
  readonly normal: string
  readonly posicion: string
}

/**
 * El material del mapa para UN título: sus letras donde están (la llegada, con los uniformes del título: los mismos
 * objetos, así va en el mismo cuadro) y su tramado; los dos momentos de la profundidad, como el del logo.
 */
export function materialDeLaSombraDelTitulo(llegada: LlegadaEnGlsl, uniforms: Record<string, THREE.IUniform>): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'sombra de los títulos · profundidad',
    side: THREE.DoubleSide,
    uniforms,
    vertexShader: /* glsl */ `${llegada.pars}
varying float vProfundidad;
void main() {
	vec3 objectNormal = vec3( normal );
${llegada.normal}
	vec3 transformed = vec3( position );
${llegada.posicion}
	vec4 vista = viewMatrix * modelMatrix * vec4( transformed, 1.0 );
	vProfundidad = - vista.z / ${f(P.lejos)};
	gl_Position = projectionMatrix * vista;
}`,
    fragmentShader: /* glsl */ `${DISOLVER_PARS_GLSL}
varying float vProfundidad;
void main() {
${DISOLVER_GLSL}
	float d = vProfundidad;
	float dx = dFdx( d );
	float dy = dFdy( d );
	gl_FragColor = vec4( d, d * d + 0.25 * ( dx * dx + dy * dy ), 0.0, 1.0 );
}`,
  })
}

const ARRIBA = new THREE.Vector3(0, 1, 0)

/** La dirección hacia la luz: la principal de día, vertical de noche (el haz), entre las dos con la noche. */
export function direccionDeLaLuz(principal: THREE.Vector3, noche: number, destino: THREE.Vector3): THREE.Vector3 {
  const n = Math.min(1, Math.max(0, noche))
  destino.copy(principal).normalize()
  if (destino.lengthSq() < 1e-9) destino.copy(ARRIBA)
  return destino.lerp(ARRIBA, n).normalize()
}

/** Cuánto oscurece de día y cuánto del haz quita de noche, con el nivel de la principal (0 a 1) y la noche (0 a 1). */
export function fuerzasDeLaSombra(nivel: number, noche: number): { readonly dia: number; readonly noche: number } {
  const n = Math.min(1, Math.max(0, noche))
  return { dia: P.fuerza * Math.min(1, Math.max(0, nivel)) * (1 - n), noche: P.fuerzaDeNoche * n }
}

const EJE = new THREE.Vector3()
const ARRIBA_DE_LA_CAMARA = new THREE.Vector3()

/**
 * La cámara de la luz sobre la esfera que abraza a los títulos que se ven: desde la luz, a media caja, con su caja
 * ajustada (y el margen). Su «arriba» nunca es paralelo a la luz (de noche mira derecho hacia abajo).
 */
export function ajustarLaCamara(camara: THREE.OrthographicCamera, esfera: THREE.Sphere, direccion: THREE.Vector3): void {
  const r = Math.max(0.5, esfera.radius * P.margen)
  camara.left = -r
  camara.right = r
  camara.top = r
  camara.bottom = -r
  camara.near = 0.05
  camara.far = P.lejos
  camara.updateProjectionMatrix()
  camara.position.copy(esfera.center).addScaledVector(direccion, P.lejos / 2)
  ARRIBA_DE_LA_CAMARA.copy(ARRIBA).addScaledVector(direccion, -direccion.dot(ARRIBA))
  if (ARRIBA_DE_LA_CAMARA.lengthSq() < 1e-6) ARRIBA_DE_LA_CAMARA.set(0, 0, -1)
  camara.up.copy(ARRIBA_DE_LA_CAMARA.normalize())
  camara.lookAt(EJE.copy(esfera.center))
  camara.updateMatrixWorld()
}
