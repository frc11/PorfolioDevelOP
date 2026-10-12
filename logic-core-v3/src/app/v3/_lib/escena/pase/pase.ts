import * as THREE from 'three'

/**
 * [PULIDO 18] P1.a · EL PASE COMPARTIDO DE LA ESCENA (`PaseDeLaEscena.tsx` lo corre): lo que la energía y los efectos del espejo leen
 * de la escena, UNA vez por cuadro y sólo si alguien lo pidió (sin pedidos, no cuesta nada).
 *   · LA PROFUNDIDAD de lo opaco (el piso, el logo, las piezas del pie, los títulos): una pasada a media resolución con la cámara del
 *     cuadro y sólo la capa de lo que escribe profundidad, más las luces: los programas son los MISMOS del cuadro (el destino se
 *     declara «como la pantalla»: el mismo tono y el mismo espacio de color; las mismas luces), ninguno nuevo. Corre fuera del cuadro
 *     (antes de dibujarlo, con todo ya movido): una pasada anidada alternaba el estado de las luces y rearmaba los parámetros de cada
 *     material en cada cuadro. Para las partículas BLANDAS: su halo se desvanece contra cualquier superficie (ningún brillo la corta).
 *   · EL COLOR del cuadro dibujado hasta la trama (lo opaco, el cielo, las estrellas y la trama): una copia a resolución completa en
 *     el momento justo (un disparador que se dibuja después de la trama y antes que quien lo lee: `orden`). Para refractar: el calor de
 *     la energía de día y los efectos del espejo (P2). Se pide por cuadro (sólo cuando hace falta: de día, con un efecto vivo).
 */
export const PASE = {
  /** La profundidad, a esta fracción del búfer de dibujo. */
  escala: 0.5,
  /** Cada cuántos cuadros se vuelven a marcar las capas (lo que entra o sale de la escena: el pie, los títulos). */
  marcarCada: 30,
  /** La capa de lo opaco: la cámara de la pasada mira sólo esta. */
  capa: 7,
  /** El disparador del color: después de la trama (−20 y −19) y antes que todo lo que lo lee. */
  orden: -18,
} as const

/** Las uniformes que comparten quienes leen el pase (las mismas referencias: se esparcen en sus materiales). */
export const PASE_EN_VIVO = {
  uProfundidad: { value: null as THREE.Texture | null },
  uHayProfundidad: { value: 0 },
  uCercaLejos: { value: new THREE.Vector2(0.1, 400) },
  uColorDeLaEscena: { value: null as THREE.Texture | null },
  uHayColor: { value: 0 },
}

/**
 * Quién pide qué: la profundidad, cada uno suma al montarse y resta al desmontarse; el color, POR CUADRO (quien lo necesita en este
 * cuadro pone `colorEsteCuadro` en su `useFrame`; el disparador lo copia y lo baja).
 */
export const PEDIDOS_DEL_PASE = { profundidad: 0, colorEsteCuadro: false }

/** ¿Este material es opaco y escribe profundidad (lo tapa)? */
function tapa(m: THREE.Material): boolean {
  return m.visible && !m.transparent && m.depthWrite && m.depthTest
}

/** ¿Entra a la pasada de profundidad? Una malla opaca (todos sus materiales) o una luz (los programas, los del cuadro). */
export function entraALaPasada(o: THREE.Object3D): boolean {
  if (o instanceof THREE.Light) return true
  if (!(o instanceof THREE.Mesh)) return false
  const m: THREE.Material | THREE.Material[] = o.material
  return Array.isArray(m) ? m.length > 0 && m.every(tapa) : tapa(m)
}

const marcar = (o: THREE.Object3D): void => {
  if (entraALaPasada(o)) o.layers.enable(PASE.capa)
  else o.layers.disable(PASE.capa)
}

/** Marca la capa en lo opaco y en las luces, y la saca de lo que dejó de serlo. */
export function marcarLasCapas(escena: THREE.Object3D): void {
  escena.traverse(marcar)
}

/**
 * La distancia (u) a lo opaco que se ve en un punto de la pantalla (de la profundidad de la pasada: perspectiva, 0 a 1); sin
 * pasada, lejísimos. Para el halo blando: `distanciaALoOpaco( uv ) - la de la partícula`.
 */
export const PROFUNDIDAD_GLSL = /* glsl */ `
uniform sampler2D uProfundidad;
uniform float uHayProfundidad;
uniform vec2 uCercaLejos;
float distanciaALoOpaco( vec2 uv ) {
	if ( uHayProfundidad < 0.5 ) return 1e6;
	float d = texture2D( uProfundidad, uv ).r;
	return ( uCercaLejos.x * uCercaLejos.y ) / ( uCercaLejos.y - d * ( uCercaLejos.y - uCercaLejos.x ) );
}
`

/** El color de la escena, en la pantalla (lo que se ve atrás): el mismo espacio que la salida, así que se devuelve tal cual. */
export const COLOR_DE_LA_ESCENA_GLSL = /* glsl */ `
uniform sampler2D uColorDeLaEscena;
uniform float uHayColor;
vec3 colorDeAtras( vec2 uv ) {
	return texture2D( uColorDeLaEscena, clamp( uv, vec2( 0.001 ), vec2( 0.999 ) ) ).rgb;
}
`

/** El destino de la pasada: el color (no se lee) y la profundidad (se lee), declarado «como la pantalla» (los mismos programas). */
export function crearElDestino(): THREE.WebGLRenderTarget {
  const rt = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: true, depthTexture: new THREE.DepthTexture(1, 1), samples: 0 })
  rt.texture.colorSpace = THREE.SRGBColorSpace
  rt.texture.generateMipmaps = false
  // Para three, un destino de XR es la pantalla: el tono y el espacio de color del cuadro (sin esto, cada material compila otra variante).
  return Object.assign(rt, { isXRRenderTarget: true })
}
