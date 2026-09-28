import * as THREE from 'three'

import { VIVO } from '../entorno/vivo'
import { AMANECER_EN_VIVO, AMANECER_GLSL, OSCURECER_GLSL, hayAmanecer } from '../amanecer/luz'
import { NIEBLA_DE_AFUERA, RASANTE_GLSL } from '../niebla/rasante'
import { FOG_COLOR } from '../probeAtmosphere'
import { INK_COLOR } from '../probeScene'

/**
 * [ESCENA 5] EL MATERIAL DE LA COPIA — se dibuja en la sala, opaco, detrás de la trama: la trama es
 * transparente y va después, así que queda por delante sola. No responde a las luces de la sala (un
 * sombreado fijo y de bajo contraste: cielo más una luz de arriba a la izquierda) y no tiene luz propia:
 * de noche se apaga con todo.
 *
 * **[ESCENA 7] Negras como el original.** La tinta del logo (`INK_COLOR`). Negras sobre el papel
 * contrastan mucho más que el gris de ESCENA 6, y lo que las lleva a «apenas visibles» es la NIEBLA DE LA
 * FORMACIÓN, no un tono más claro: cuánto se ve una copia es `cerca` hasta `desde` de la cámara y de ahí
 * cae exponencial con la distancia (`NIEBLA_DE_LA_FORMACION`). Así las filas de adelante se leen, las del
 * medio se van apagando y las últimas se pierden, sin un corte. La bruma de la sala (42 → 110) se comería
 * todo lo que pasa de 110: la copia no la usa, usa ésta.
 *
 * Dos materiales con el mismo sombreado: el de la primera fila (la malla entera, con canto, opaca) y el
 * de la silueta de las de atrás (un cuadrado con la tapa en una textura). La silueta se MEZCLA con lo que
 * tiene atrás: su borde es su alfa. ⚠ No sirve el alfa a cobertura: el lienzo compone el alfa que se
 * escribe, y un borde con alfa parcial deja ver el papel de la página (se leía como un filo blanco).
 */
export const NIEBLA_DE_LA_FORMACION = {
  /** Cuánto se ve la copia más cercana, de día y de noche (1 = sin niebla). */
  cerca: { dia: 0.42, noche: 0.15 },
  /** Desde qué distancia a la cámara empieza a caer, y en cuánto cae a 1/e (u). */
  desde: 36,
  cae: 70,
  /** 6d: con la velocidad plena, qué parte de la niebla se abre. */
  abre: 0.6,
} as const

/** El brillo del barniz: qué parte del aire de la sala refleja (de canto), y el del canto de arriba de la silueta. */
export const BRILLO = { cuanto: 0.55, canto: 0.5 } as const

/**
 * El sombreado fijo de siempre, con la tinta del logo, y el BRILLO de un negro con barniz: lo que el logo
 * tiene y hace que se lea con volumen. De frente casi no refleja; de canto (y en el canto de arriba de la
 * silueta, que mira a la luz de arriba) refleja el aire de la sala (Schlick).
 */
const SOMBREADO = /* glsl */ `
	vec3 n = normalize( vNormalMundo ) * ( gl_FrontFacing ? 1.0 : - 1.0 );
	vec3 alOjo = normalize( cameraPosition - vMundo );
	float luz = 0.45 + 0.25 * ( 0.5 + 0.5 * n.y ) + 0.4 * max( dot( n, uLuz ), 0.0 );
	float fresnel = 0.04 + 0.96 * pow( 1.0 - abs( dot( n, alOjo ) ), 5.0 );
	vec3 color = uTinta * luz + uBrillo * fresnel * ( 0.45 + 0.55 * ( 0.5 + 0.5 * n.y ) );
	#ifdef SILUETA
		// El canto de arriba: se ve si la cámara está más arriba que la copia.
		color += uBrillo * ${BRILLO.canto.toFixed(2)} * canto * smoothstep( - 0.02, 0.12, alOjo.y );
	#endif
	gl_FragColor = vec4( color * mix( 1.0, 0.05, uNoche ), 1.0 );
	#include <colorspace_fragment>
`

const VERTEX_DE_LA_COPIA = /* glsl */ `
varying vec3 vNormalMundo;
varying vec3 vMundo;
varying float vDistancia;
varying float vRasante;
#ifdef SILUETA
	varying vec2 vUv;
#endif
uniform float uAbre;
#ifdef NIEBLA_RASANTE
	uniform float uTiempo;
	${RASANTE_GLSL}
#endif
void main() {
	#ifdef SILUETA
		vUv = uv;
	#endif
	vec4 mundo = modelMatrix * instanceMatrix * vec4( position, 1.0 );
	vMundo = mundo.xyz;
	vNormalMundo = normalize( mat3( modelMatrix ) * mat3( instanceMatrix ) * normal );
	vec4 mvPosition = viewMatrix * mundo;
	vDistancia = - mvPosition.z;
	vRasante = 1.0;
	#ifdef NIEBLA_RASANTE
		// [ESCENA 6] 6c: los bancos que esta copia tiene delante (por vértice: la copia es chica en pantalla).
		vRasante = transmitanciaRasante( cameraPosition, vMundo, uAbre, 0.5 );
	#endif
	gl_Position = projectionMatrix * mvPosition;
}
`

const FRAGMENT_DE_LA_COPIA = /* glsl */ `
uniform float uNoche;
uniform float uVisible;
uniform vec4 uNiebla;
uniform vec3 uLuz;
uniform vec3 uTinta;
uniform vec3 uBrillo;
uniform float uAbre;
uniform vec3 fogColor;
varying vec3 vNormalMundo;
varying vec3 vMundo;
varying float vDistancia;
varying float vRasante;
#ifdef SILUETA
	uniform sampler2D uSilueta;
	varying vec2 vUv;
#endif
#ifdef AMANECER
	${AMANECER_GLSL}
#endif
void main() {
	float alfa = 1.0;
	#ifdef SILUETA
		vec2 silueta = texture2D( uSilueta, vUv ).rg;
		alfa = silueta.r;
		float canto = silueta.g;
		// Lo vacío no escribe profundidad: la copia de atrás tiene que poder verse por ahí.
		if ( alfa < 0.02 ) discard;
	#endif
	${SOMBREADO}
	// La niebla de la formación: plena cerca, y de ahí cae con la distancia (6d la abre con la velocidad).
	float optica = max( 0.0, vDistancia - uNiebla.y ) / uNiebla.z * ( 1.0 - ${NIEBLA_DE_LA_FORMACION.abre.toFixed(2)} * uAbre );
	float seVe = uVisible * mix( uNiebla.x, uNiebla.w, uNoche ) * exp( - optica ) * vRasante;
	gl_FragColor.rgb = mix( fogColor, gl_FragColor.rgb, seVe );
	// ⚠ El lienzo compone el alfa que se escribe: una copia opaca escribe 1, y la silueta su borde.
	gl_FragColor.a = alfa;
	#ifdef AMANECER
		${OSCURECER_GLSL('vMundo')}
	#endif
}
`

export interface UniformsDeLaCopia {
  readonly uVisible: { value: number }
}

const lineal = (hex: string): THREE.Vector3 => {
  const c = new THREE.Color(hex)
  return new THREE.Vector3(c.r, c.g, c.b)
}

/** `silueta`: el material de las filas de atrás, con la textura de la tapa; sin ella, el de la malla entera. */
export function materialDeLaCopia(uniforms: UniformsDeLaCopia, rasante: boolean, silueta: THREE.Texture | null): THREE.ShaderMaterial {
  const n = NIEBLA_DE_LA_FORMACION
  const material = new THREE.ShaderMaterial({
    defines: {
      ...(silueta !== null ? { SILUETA: '' } : {}),
      ...(rasante ? { NIEBLA_RASANTE: '' } : {}),
      ...(hayAmanecer() ? { AMANECER: '' } : {}),
    },
    uniforms: {
      ...AMANECER_EN_VIVO,
      uTiempo: VIVO.uTiempo,
      uAbre: NIEBLA_DE_AFUERA.uAbre,
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      ...uniforms,
      uNoche: VIVO.uNoche,
      uNiebla: { value: new THREE.Vector4(n.cerca.dia, n.desde, n.cae, n.cerca.noche) },
      uLuz: { value: new THREE.Vector3(-0.45, 0.8, 0.4).normalize() },
      uTinta: { value: lineal(INK_COLOR) },
      uBrillo: { value: lineal(FOG_COLOR).multiplyScalar(BRILLO.cuanto) },
      uSilueta: { value: silueta },
    },
    vertexShader: VERTEX_DE_LA_COPIA,
    fragmentShader: FRAGMENT_DE_LA_COPIA,
    fog: true,
    side: silueta !== null ? THREE.FrontSide : THREE.DoubleSide,
    // La silueta se MEZCLA (el borde suave es su alfa) y escribe profundidad: van de atrás hacia adelante.
    transparent: silueta !== null,
  })
  return material
}
