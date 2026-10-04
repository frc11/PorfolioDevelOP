import * as THREE from 'three'

import { FLOOR_Y } from '../probeScene'
import { DISOLVER_GLSL, DISOLVER_PARS_GLSL } from '../titulos3d/llegada'
import { SOMBRA_DEL_LOGO } from './delLogo'

/**
 * [AJUSTES FINALES] A2 · LA SOMBRA DE LOS TÍTULOS SOBRE EL PISO VIVO — en el producto (era la prueba `sombratitulos=si` de
 * PASADA FINAL C3). La misma idea que la del logo (`delLogo.ts`: los títulos SOLOS vistos desde su luz con una cámara
 * ortográfica que los abraza, un mapa desenfocado y UNA lectura por píxel en el piso), con lo que la del logo no
 * necesitaba, porque acá el único receptor es el piso y lo único que proyecta son letras que flotan por encima:
 *
 *   · **Un mapa de COBERTURA, no de varianza.** Cada texel dice si una letra lo tapa (`b`) y a qué profundidad (`a`, la
 *     profundidad por la cobertura). Desenfocado y con mipmaps, la cobertura filtrada ES la penumbra: la fracción del
 *     piso que las letras tapan en ese entorno. Sin la cota de Chebyshev no hay sangrado de luz ni la grieta clara que
 *     deja una media de profundidades que cruza la del receptor (se vio en la primera versión, con el suelo en el mapa).
 *   · **El borde, según la distancia al piso.** Una letra que flota alto proyecta una sombra más blanda que una que casi
 *     toca el piso (la fuente de luz tiene tamaño). El piso lee primero el nivel más ancho del mapa (¿hay letras cerca, a
 *     qué profundidad?), con eso tiene la distancia de las letras al punto del piso y elige el nivel: la penumbra crece
 *     con esa distancia (`penumbra.porUnidad`), calibrada para que a la distancia del logo sea LA MISMA que la del logo
 *     (la misma dureza de día), y con un tope (`penumbra.tope`) para que un título muy alto siga dibujando sus letras y
 *     no un manchón. Dos lecturas, ninguna búsqueda.
 *   · **Sin dientes ni acné.** El mapa se desenfoca a su resolución (el antialiasing) y después se muestrea por nivel;
 *     nadie se sombrea a sí mismo (sólo los títulos proyectan).
 *   · **Coherente con la luz que hay.** De día la luz es la principal (el sol del arco, la misma dirección que la sombra
 *     del logo) y la sombra oscurece hacia el color del contacto con la misma fuerza que la del logo. De noche la única luz
 *     es cenital (el haz sobre el logo y el cielo de la trama): la cámara de la luz se pone vertical con la noche y la
 *     sombra le quita luz al charco del haz (`noche.charco`) y, apenas, a la sala (`noche.sala`): se lee también donde el
 *     haz no llega, sin ensuciar.
 *
 * Cada letra proyecta donde está: el material del mapa repite la llegada de su título (las letras en camino, con su giro)
 * y su disuelto (el tramado; desenfocado, una sombra que aparece con la letra).
 */
export const SOMBRA_DE_LOS_TITULOS = {
  resolucion: 512,
  /** Largo de la caja de la luz (u): de la luz a los títulos y de ahí al piso, con el sol bajo. */
  lejos: 120,
  /** El desenfoque del nivel nítido (texeles): el antialiasing; la blandura de verdad la pone el nivel. */
  desenfoque: { pasadas: 2, sigma: 2 },
  /** De día: cuánto oscurece con la principal entera (la del logo). */
  fuerza: SOMBRA_DEL_LOGO.fuerza,
  /** De noche: cuánto del charco del haz quita donde está del todo a la sombra, y cuánto de la luz de la sala. */
  noche: { charco: 0.8, sala: 0.35 },
  /** El aire de la caja alrededor de los títulos (el desenfoque no se corta en su borde). */
  margen: 1.2,
  /**
   * La penumbra (sigma, u) por unidad de distancia entre la letra y el piso, su tope (u: la penumbra del logo, así nunca es
   * más blanda que la del logo y las letras se siguen leyendo) y hasta qué nivel del mapa se baja (un nivel por octava:
   * a 512, el 6 es una caja de 64 texeles).
   */
  penumbra: { porUnidad: 0.02, tope: 0.12, hastaLod: 6 },
} as const

const P = SOMBRA_DE_LOS_TITULOS
const f = (x: number): string => x.toFixed(6)

/** La penumbra del logo (sigma, u): su desenfoque en texeles, en el mundo de su caja. */
export const PENUMBRA_DEL_LOGO = SOMBRA_DEL_LOGO.desenfoque.sigma * Math.sqrt(SOMBRA_DEL_LOGO.desenfoque.pasadas) * ((2 * SOMBRA_DEL_LOGO.radio) / SOMBRA_DEL_LOGO.resolucion)
/** La distancia del centro del logo al piso a lo largo de la luz, con el sol a 45° (u): donde la de los títulos es la del logo. */
export const DISTANCIA_DEL_LOGO = -FLOOR_Y * Math.SQRT2

/** El desenfoque del nivel nítido, de punta a punta (texeles): dos pasadas de `sigma`. */
export const BASE_EN_TEXELES = P.desenfoque.sigma * Math.sqrt(P.desenfoque.pasadas)
/** El desvío de una caja de 2^lod texeles (la mipmap), en texeles: 1/√12. */
const DESVIO_DE_LA_CAJA = 1 / Math.sqrt(12)

/**
 * El nivel del mapa que da una penumbra `sigma` (texeles) sobre el nivel nítido: la caja de la mipmap suma su varianza a
 * la del desenfoque. La misma cuenta en JS (el invariante) y en el piso (abajo).
 */
export function lodDeLaPenumbra(sigmaEnTexeles: number): number {
  const faltante = Math.sqrt(Math.max(0, sigmaEnTexeles * sigmaEnTexeles - BASE_EN_TEXELES * BASE_EN_TEXELES))
  return Math.min(P.penumbra.hastaLod, Math.max(0, Math.log2(Math.max(1, faltante / DESVIO_DE_LA_CAJA))))
}

/** La penumbra (sigma, u) de una letra a `distancia` u del piso: crece con la distancia, con su tope. */
export function penumbraEn(distancia: number): number {
  return Math.min(P.penumbra.tope, P.penumbra.porUnidad * Math.max(0, distancia))
}

/** Lo que lee el piso y escribe `SombraDeLosTitulos` en cada cuadro. */
export const SOMBRA_DE_LOS_TITULOS_EN_VIVO = {
  uMapaDeLosTitulos: { value: null as THREE.Texture | null },
  uLuzDeLosTitulos: { value: new THREE.Matrix4() },
  uVistaDeLosTitulos: { value: new THREE.Matrix4() },
  /** Si hay algo que leer (de día o de noche): sin nada, el piso no lee el mapa. */
  uHayDeLosTitulos: { value: 0 },
  /** De día: cuánto oscurece. De noche: cuánta noche hay (0 a 1; cuánto quita lo dicen `noche.charco` y `noche.sala`). */
  uFuerzaDeLosTitulos: { value: 0 },
  uNocheDeLosTitulos: { value: 0 },
  /** Cuánto mundo es un texel del mapa en este cuadro (u): la caja se ajusta a los títulos que se ven. */
  uTexelDeLosTitulos: { value: 0.05 },
}

/**
 * En el piso: `sombraDeLosTitulos( mundo )`, de 0 (a la luz) a 1 (del todo a la sombra). Dos lecturas: la más ancha dice
 * si hay letras cerca y a qué profundidad están (`a / b`), y con la distancia de ahí al piso se elige el nivel; la segunda,
 * en ese nivel, es la cobertura de las letras: la sombra. Lo que el mapa no tapa es luz.
 */
export const SOMBRA_DE_LOS_TITULOS_GLSL = /* glsl */ `
uniform sampler2D uMapaDeLosTitulos;
uniform mat4 uLuzDeLosTitulos;
uniform mat4 uVistaDeLosTitulos;
uniform float uHayDeLosTitulos;
uniform float uFuerzaDeLosTitulos;
uniform float uNocheDeLosTitulos;
uniform float uTexelDeLosTitulos;
float sombraDeLosTitulos( vec3 mundo ) {
	if ( uHayDeLosTitulos <= 0.001 ) return 0.0;
	vec4 recorte = uLuzDeLosTitulos * vec4( mundo, 1.0 );
	vec2 uv = recorte.xy * 0.5 + 0.5;
	if ( uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0 ) return 0.0;
	float receptor = - ( uVistaDeLosTitulos * vec4( mundo, 1.0 ) ).z / ${f(P.lejos)};
	// Lo más ancho: ¿hay letras cerca de acá, y a qué distancia del piso están? (la penumbra crece con ella)
	vec4 ancho = texture2DLodEXT( uMapaDeLosTitulos, uv, ${f(P.penumbra.hastaLod)} );
	if ( ancho.b < 0.001 ) return 0.0;
	float letras = ancho.a / ancho.b;
	if ( receptor <= letras ) return 0.0;
	float distancia = ( receptor - letras ) * ${f(P.lejos)};
	float sigma = max( ${f(BASE_EN_TEXELES)}, min( ${f(P.penumbra.tope)}, ${f(P.penumbra.porUnidad)} * distancia ) / uTexelDeLosTitulos );
	float faltante = sqrt( max( 0.0, sigma * sigma - ${f(BASE_EN_TEXELES * BASE_EN_TEXELES)} ) );
	float lod = clamp( log2( max( 1.0, faltante / ${f(DESVIO_DE_LA_CAJA)} ) ), 0.0, ${f(P.penumbra.hastaLod)} );
	// La cobertura de las letras en esa penumbra: la sombra.
	float cobertura = texture2DLodEXT( uMapaDeLosTitulos, uv, lod ).b;
	vec2 alBorde = min( uv, 1.0 - uv );
	return cobertura * smoothstep( 0.0, 0.04, min( alBorde.x, alBorde.y ) );
}
`

/** De día, hacia el color del contacto como la del logo (después de la del logo y las del pie); de noche, apenas a la sala. */
export const APLICAR_LA_SOMBRA_DE_LOS_TITULOS_GLSL = /* glsl */ `float sombraDeLosTitulosAca = sombraDeLosTitulos( vPiso );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, COLOR_DEL_CONTACTO, sombraDeLosTitulosAca * uFuerzaDeLosTitulos );
		gl_FragColor.rgb *= 1.0 - sombraDeLosTitulosAca * uNocheDeLosTitulos * ${P.noche.sala.toFixed(3)};`

/** El charco del haz, con lo que le quitan los títulos de noche. */
export const CHARCO_CON_LOS_TITULOS_GLSL = ` * ( 1.0 - sombraDeLosTitulosAca * uNocheDeLosTitulos * ${P.noche.charco.toFixed(3)} )`

/** Los sombreadores de la llegada de un título (los mismos que dibujan sus letras: `titulos3d/llegada.ts`). */
export interface LlegadaEnGlsl {
  readonly pars: string
  readonly normal: string
  readonly posicion: string
}

/** Lo que escribe cada letra en el mapa: su profundidad (r), que tapa (b: 1) y la profundidad por la cobertura (a). */
export const TEXEL_DE_LA_LETRA_GLSL = 'gl_FragColor = vec4( vProfundidad, 0.0, 1.0, vProfundidad );'

/**
 * El material del mapa para UN título: sus letras donde están (la llegada, con los uniformes del título: los mismos
 * objetos, así va en el mismo cuadro) y su tramado.
 */
export function materialDeLaSombraDelTitulo(llegada: LlegadaEnGlsl, uniforms: Record<string, THREE.IUniform>): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'sombra de los títulos · cobertura',
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
	${TEXEL_DE_LA_LETRA_GLSL}
}`,
  })
}

/** Una pasada del desenfoque de los cuatro canales: 9 muestras gaussianas en `uPaso` (un texel en x o en y). */
function materialDelDesenfoque(): THREE.ShaderMaterial {
  const w = Array.from({ length: 5 }, (_, i) => Math.exp(-(i * i) / (2 * P.desenfoque.sigma * P.desenfoque.sigma)))
  const suma = w[0] + 2 * (w[1] + w[2] + w[3] + w[4])
  const pesos = w.map((x) => (x / suma).toFixed(6))
  return new THREE.ShaderMaterial({
    name: 'sombra de los títulos · desenfoque',
    uniforms: { uMapa: { value: null }, uPaso: { value: new THREE.Vector2() } },
    depthTest: false,
    depthWrite: false,
    vertexShader: /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4( position.xy, 0.0, 1.0 ); }`,
    fragmentShader: /* glsl */ `
uniform sampler2D uMapa;
uniform vec2 uPaso;
varying vec2 vUv;
void main() {
	vec4 m = texture2DLodEXT( uMapa, vUv, 0.0 ) * ${pesos[0]};
	m += ( texture2DLodEXT( uMapa, vUv + uPaso, 0.0 ) + texture2DLodEXT( uMapa, vUv - uPaso, 0.0 ) ) * ${pesos[1]};
	m += ( texture2DLodEXT( uMapa, vUv + 2.0 * uPaso, 0.0 ) + texture2DLodEXT( uMapa, vUv - 2.0 * uPaso, 0.0 ) ) * ${pesos[2]};
	m += ( texture2DLodEXT( uMapa, vUv + 3.0 * uPaso, 0.0 ) + texture2DLodEXT( uMapa, vUv - 3.0 * uPaso, 0.0 ) ) * ${pesos[3]};
	m += ( texture2DLodEXT( uMapa, vUv + 4.0 * uPaso, 0.0 ) + texture2DLodEXT( uMapa, vUv - 4.0 * uPaso, 0.0 ) ) * ${pesos[4]};
	gl_FragColor = m;
}`,
  })
}

/** Lo que no tapa ninguna letra: lejos (r), sin cobertura (b y a en 0). Se limpia con alfa 0: el fondo de la escena no sabe de alfa. */
export const FONDO_DEL_MAPA = new THREE.Color(1, 0, 0)

/** El mapa: su búfer con mipmaps, el de paso del desenfoque, la cámara de la luz, la escena (los títulos) y la del desenfoque. */
export interface MapaDeLosTitulos {
  readonly bufer: THREE.WebGLRenderTarget
  readonly escena: THREE.Scene
  readonly camara: THREE.OrthographicCamera
  readonly desenfoque: { readonly escena: THREE.Scene; readonly bufer: THREE.WebGLRenderTarget }
  /** Dibuja los títulos en el mapa (limpio con `FONDO_DEL_MAPA` y alfa 0) y lo desenfoca; deja el objetivo que había. */
  readonly dibujar: (gl: THREE.WebGLRenderer) => void
  readonly soltar: () => void
}

const COLOR_DE_ANTES = new THREE.Color()

export function crearMapaDeLosTitulos(): MapaDeLosTitulos {
  // Flotante (la profundidad por la cobertura se divide después), con mipmaps: el piso lee el nivel que le da la penumbra.
  const opciones = { type: THREE.FloatType, format: THREE.RGBAFormat, magFilter: THREE.LinearFilter }
  const bufer = new THREE.WebGLRenderTarget(P.resolucion, P.resolucion, { ...opciones, minFilter: THREE.LinearMipmapLinearFilter, generateMipmaps: true, depthBuffer: true })
  bufer.texture.name = 'sombra de los títulos · mapa'
  const paso = new THREE.WebGLRenderTarget(P.resolucion, P.resolucion, { ...opciones, minFilter: THREE.LinearFilter, generateMipmaps: false, depthBuffer: false })
  paso.texture.name = 'sombra de los títulos · desenfoque'
  const escena = new THREE.Scene()
  escena.name = 'sombra de los títulos'
  const camara = new THREE.OrthographicCamera(-8, 8, 8, -8, 0.05, P.lejos)
  const desenfoque = materialDelDesenfoque()
  const cuadrado = new THREE.PlaneGeometry(2, 2)
  const malla = new THREE.Mesh(cuadrado, desenfoque)
  malla.name = 'sombra de los títulos · desenfoque'
  malla.frustumCulled = false
  const escenaDelDesenfoque = new THREE.Scene()
  escenaDelDesenfoque.add(malla)
  const camaraDelDesenfoque = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const texel = 1 / P.resolucion
  const dibujar = (gl: THREE.WebGLRenderer): void => {
    const previo = gl.getRenderTarget()
    const alfaDeAntes = gl.getClearAlpha()
    gl.getClearColor(COLOR_DE_ANTES)
    gl.setClearColor(FONDO_DEL_MAPA, 0)
    gl.setRenderTarget(bufer)
    gl.render(escena, camara)
    gl.setClearColor(COLOR_DE_ANTES, alfaDeAntes)
    const u = desenfoque.uniforms
    for (let k = 0; k < P.desenfoque.pasadas; k += 1) {
      u.uMapa.value = bufer.texture
      ;(u.uPaso.value as THREE.Vector2).set(texel, 0)
      gl.setRenderTarget(paso)
      gl.render(escenaDelDesenfoque, camaraDelDesenfoque)
      u.uMapa.value = paso.texture
      ;(u.uPaso.value as THREE.Vector2).set(0, texel)
      gl.setRenderTarget(bufer)
      gl.render(escenaDelDesenfoque, camaraDelDesenfoque) // la última escritura: three regenera las mipmaps
    }
    gl.setRenderTarget(previo)
  }
  return {
    bufer,
    escena,
    camara,
    desenfoque: { escena: escenaDelDesenfoque, bufer: paso },
    dibujar,
    soltar: () => {
      bufer.dispose()
      paso.dispose()
      desenfoque.dispose()
      cuadrado.dispose()
    },
  }
}

const ARRIBA = new THREE.Vector3(0, 1, 0)

/** La dirección hacia la luz: la principal de día, vertical de noche (el haz), entre las dos con la noche. */
export function direccionDeLaLuz(principal: THREE.Vector3, noche: number, destino: THREE.Vector3): THREE.Vector3 {
  const n = Math.min(1, Math.max(0, noche))
  destino.copy(principal).normalize()
  if (destino.lengthSq() < 1e-9) destino.copy(ARRIBA)
  return destino.lerp(ARRIBA, n).normalize()
}

/** Cuánto oscurece de día (con el nivel de la principal, 0 a 1) y cuánta noche hay (0 a 1): sin saltos entre las dos. */
export function fuerzasDeLaSombra(nivel: number, noche: number): { readonly dia: number; readonly noche: number } {
  const n = Math.min(1, Math.max(0, noche))
  return { dia: P.fuerza * Math.min(1, Math.max(0, nivel)) * (1 - n), noche: n }
}

const EJE = new THREE.Vector3()
const ARRIBA_DE_LA_CAMARA = new THREE.Vector3()

/**
 * La cámara de la luz sobre la esfera que abraza a los títulos que se ven: desde la luz, a media caja, con su caja
 * ajustada (y el margen). Su «arriba» nunca es paralelo a la luz (de noche mira derecho hacia abajo). Devuelve cuánto
 * mundo es un texel.
 */
export function ajustarLaCamara(camara: THREE.OrthographicCamera, esfera: THREE.Sphere, direccion: THREE.Vector3): number {
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
  return (2 * r) / P.resolucion
}
