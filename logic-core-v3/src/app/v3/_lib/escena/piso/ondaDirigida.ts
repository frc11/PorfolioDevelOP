import * as THREE from 'three'

import { NACE_EN } from '../entorno/Pulso'
import { ONDA_PEDIDA, vigente } from '../interfaz/pedidos'
import { FLOOR_Y } from '../probeScene'

/**
 * [INTERFAZ 2] T1 · LA ONDA HACIA LO QUE SEÑALÁS — el piso vivo ondea hacia un punto de la pantalla.
 *
 * Los anillos de E4 nacen en el logo y son iguales en todas las direcciones (`bloques.ts`, `empujeDelAnillo`). Ésta
 * nace en el mismo lugar, con el mismo frente (el de un principal, `NACE_EN` → `alcance`, la misma curva) y el mismo
 * empuje sobre la ecuación de ondas del piso, pero sólo hacia un lado: un lóbulo alrededor de la dirección del punto
 * del piso que queda debajo de lo señalado. Así el piso «va» hacia la pieza, con su física (la onda sigue sola, se
 * refleja y se amortigua como cualquier otra).
 *
 * Sólo con la bandera (`responde=si`): el término se INYECTA en la simulación al armarla (`conOndaDirigida`), así la
 * del producto queda exactamente como está. Las dos anclas donde entra se afirman en `s38-interfaz2`.
 */
export const ONDA_DIRIGIDA = {
  duracionS: 2.6,
  /** Hasta dónde llega el frente (u): casi el del principal (33). */
  alcance: 30,
  /** El empuje del frente y su ancho (u). El del principal es 34; ésta empuja de un solo lado y con la cámara al ras: 60. */
  fuerza: 60,
  ancho: 1.1,
  /** Lo cerrado del lóbulo: el coseno a esta potencia (3: la mitad de la fuerza a ±37°). */
  lobulo: 3,
  /** Una onda nueva no corta a otra más joven que esto (s). */
  cadaS: 0.9,
  /** Un punto del piso más cerca del logo que esto (u) no da dirección: no nace. */
  minimo: 1,
  /** A qué altura de la pantalla se busca el piso, en la columna de la pieza (coordenadas normalizadas: −1 es el borde de abajo). */
  alturaDelPiso: -0.8,
  /** La banda del dibujo (la del principal es 1,5): un poco más, porque el lóbulo la deja en un solo lado. */
  banda: 2.5,
} as const

const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))

/** Dónde entra el uniform y dónde se suma el empuje: dos líneas de `SIMULACION_GLSL`. */
export const ANCLAS_DE_LA_ONDA = {
  uniform: 'uniform vec3 uCamara;',
  empuje: 'for ( int i = 0; i < 4; i++ ) fuerza += empujeDelAnillo( uAnillos[ i ], r * uLado );',
} as const

const UNIFORM_GLSL = /* glsl */ `
uniform vec4 uOnda; // nace (reloj de la escena), dirección x z, fuerza (0: ninguna)
float empujeDeLaOnda( vec2 p, float r ) {
	if ( uOnda.w <= 0.0 ) return 0.0;
	float t = ( uTiempo - uOnda.x ) / ${f(ONDA_DIRIGIDA.duracionS)};
	if ( t < 0.0 || t > 1.0 ) return 0.0;
	float frente = ${NACE_EN.toFixed(1)} + ( ${f(ONDA_DIRIGIDA.alcance)} - ${NACE_EN.toFixed(1)} ) * ( 1.0 - pow( 1.0 - t, 2.2 ) );
	float d = ( r - frente ) / ${f(ONDA_DIRIGIDA.ancho)};
	float lobulo = pow( max( 0.0, dot( p / max( length( p ), 0.001 ), uOnda.yz ) ), ${f(ONDA_DIRIGIDA.lobulo)} );
	return uOnda.w * ${f(ONDA_DIRIGIDA.fuerza)} * lobulo * exp( - d * d ) * pow( 1.0 - t, 1.5 ) * smoothstep( 0.0, 0.05, t );
}`

/** La simulación con la onda: el uniform y su función después de `uCamara`, y el empuje junto al de los anillos. */
export function conOndaDirigida(glsl: string): string {
  if (!glsl.includes(ANCLAS_DE_LA_ONDA.uniform) || !glsl.includes(ANCLAS_DE_LA_ONDA.empuje)) {
    throw new Error('[INTERFAZ 2] la simulación del piso cambió: la onda dirigida no encuentra dónde entrar')
  }
  return glsl
    .replace(ANCLAS_DE_LA_ONDA.uniform, `${ANCLAS_DE_LA_ONDA.uniform}${UNIFORM_GLSL}`)
    .replace(ANCLAS_DE_LA_ONDA.empuje, `${ANCLAS_DE_LA_ONDA.empuje}\n\tfuerza += empujeDeLaOnda( p, r * uLado );`)
}

/**
 * Y en el DIBUJO del piso: la banda con la que se ven los anillos (el piso se mezcla hacia `vec3( uNoche )` en el
 * frente, `cuantoDelPulso` de `entorno/Pulso.tsx`), con el mismo ancho y la misma cola que un principal, en el lóbulo.
 * Sin ella, de día y con la cámara al ras (el escenario de Por qué develOP) la onda sólo movía bloques blancos sobre
 * blanco: el relieve casi no se leía.
 */
export const ANCLAS_DEL_DIBUJO = {
  funcion: 'float cuantoDelPulso( float r ) {',
  mezcla: 'cuantoDelPulso( length( vPiso.xz ) )',
} as const

const DIBUJO_GLSL = /* glsl */ `
uniform vec4 uOnda;
float cuantoDeLaOnda( vec2 xz ) {
	if ( uOnda.w <= 0.0 ) return 0.0;
	float t = ( uTiempo - uOnda.x ) / ${f(ONDA_DIRIGIDA.duracionS)};
	if ( t < 0.0 || t > 1.0 ) return 0.0;
	float r = length( xz );
	float frente = ${NACE_EN.toFixed(1)} + ( ${f(ONDA_DIRIGIDA.alcance)} - ${NACE_EN.toFixed(1)} ) * ( 1.0 - pow( 1.0 - t, 2.2 ) );
	float ancho = 0.35 + 1.4 * t * ( ${f(ONDA_DIRIGIDA.alcance)} / 26.0 );
	float d = ( r - frente ) / ancho;
	float lobulo = pow( max( 0.0, dot( xz / max( r, 0.001 ), uOnda.yz ) ), ${f(ONDA_DIRIGIDA.lobulo)} );
	return uOnda.w * ${f(ONDA_DIRIGIDA.banda)} * lobulo * exp( - d * d ) * pow( 1.0 - t, 1.8 ) * smoothstep( 0.0, 0.06, t ) * mix( 0.075, 0.12, uNoche );
}
`

/** El material del piso con la banda de la onda: envuelve el `onBeforeCompile` que dejó `conPisoVivo`. */
export function conLaOndaEnElPiso<T extends THREE.Material>(material: T): T {
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  // Su propio programa (como `conElAmanecer`): con la misma clave, three podría reusar el de sin onda.
  material.customProgramCacheKey = () => `${clavePrevia()}|onda-dirigida`
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    if (!shader.fragmentShader.includes(ANCLAS_DEL_DIBUJO.funcion) || !shader.fragmentShader.includes(ANCLAS_DEL_DIBUJO.mezcla)) {
      throw new Error('[INTERFAZ 2] el dibujo del piso cambió: la banda de la onda no encuentra dónde entrar')
    }
    shader.uniforms.uOnda = ONDA_EN_VIVO.uOnda
    shader.fragmentShader = shader.fragmentShader
      .replace(ANCLAS_DEL_DIBUJO.funcion, `${DIBUJO_GLSL}${ANCLAS_DEL_DIBUJO.funcion}`)
      .replace(ANCLAS_DEL_DIBUJO.mezcla, `( ${ANCLAS_DEL_DIBUJO.mezcla} + cuantoDeLaOnda( vPiso.xz ) )`)
  }
  return material
}

/** El estado de la onda en vivo: el uniform que lee la simulación y lo que se usa para apuntar (armado una vez). */
export const ONDA_EN_VIVO = {
  uOnda: { value: new THREE.Vector4(0, 1, 0, 0) },
  atendida: ONDA_PEDIDA.n,
  rayo: new THREE.Raycaster(),
  plano: new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR_Y),
  punto: new THREE.Vector3(),
  ndc: new THREE.Vector2(),
}

/**
 * Atiende el pedido de la interfaz, si hay uno nuevo y reciente, y decide hacia dónde va la onda: desde el logo hacia
 * el punto del PISO QUE SE VE debajo de la pieza (a su altura en la pantalla no hay piso: la pieza está sobre el
 * horizonte), cerca del borde de abajo del cuadro, en la columna de la pieza.
 *
 * Medido en el primer clip, por qué así: en Por qué develOP la cámara mira al logo casi al ras, y el piso que se ve es
 * un cono angosto alrededor de esa mirada. Una onda hacia el punto del mundo detrás de la pieza corre de costado en la
 * franja del horizonte (comprimida, no se lee); una hacia el costado de la cámara se va de cuadro enseguida. Hacia el
 * piso de abajo de la pieza cruza, por construcción, lo que está en pantalla. Cero reservas.
 */
export function atenderLaOnda(camara: THREE.Camera, t: number, ahora: number): void {
  const o = ONDA_EN_VIVO
  if (ONDA_PEDIDA.n === o.atendida) return
  o.atendida = ONDA_PEDIDA.n
  if (!vigente(ONDA_PEDIDA.cuando, ahora)) return
  const u = o.uOnda.value
  if (u.w > 0 && t - u.x < ONDA_DIRIGIDA.cadaS) return
  camara.updateMatrixWorld()
  o.ndc.set(ONDA_PEDIDA.x, ONDA_DIRIGIDA.alturaDelPiso)
  o.rayo.setFromCamera(o.ndc, camara)
  if (o.rayo.ray.intersectPlane(o.plano, o.punto) === null) return
  const largo = Math.hypot(o.punto.x, o.punto.z)
  if (largo < ONDA_DIRIGIDA.minimo) return
  u.set(t, o.punto.x / largo, o.punto.z / largo, 1)
}
