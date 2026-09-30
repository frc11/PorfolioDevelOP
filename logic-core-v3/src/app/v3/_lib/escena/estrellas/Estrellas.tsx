'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, type RefObject } from 'react'
import * as THREE from 'three'

import type { NivelDeCalidad } from '../calidad'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { FORMACION, azar } from '../formacion/enFormacion'
import { pisoConFormacion } from '../formacion/Formacion'
import type { MoireHandle } from '../MoireScreen'
import { FLOOR_Y } from '../probeScene'
import { MOIRE_FAR_ORDER, MOIRE_FAR_RADIUS } from '../probeMoire'
import type { ProbeRigStore } from '../probeStore'
import { fueraDelTunel } from '../tunelEnLaEscena'
import { TRAMA_EN_VIVO, leerLaTrama } from './trama'
import { AMANECER_EN_VIVO, hayAmanecer } from '../amanecer/luz'
import { TRAMA_GLSL, VIA_LACTEA, densidadDeLaBanda, direccionDeLaBanda, polvoDeLaBanda, viaLacteaGlsl } from './cielo'
import { conDithering } from '../ruidoAzul'

/**
 * [ESCENA 5] ESTRELLAS — el cielo de afuera de la trama, sólo de noche. [ESCENA 7] T3: encendido en el
 * producto, como una noche en el campo sin luces (`cielo.ts`): más estrellas y más brillantes, y la vía
 * láctea. Y siempre DETRÁS de la trama: cada estrella lee la trama donde su rayo la cruza.
 *
 * **A distancia infinita.** Cada estrella es una DIRECCIÓN fija del mundo: giran con la cámara pero no
 * se desplazan con ella, y nunca derivan. El shader la pone, cuadro a cuadro, en esa dirección desde la
 * cámara, detrás de todo lo que hay afuera de la trama y delante del suelo: en el cilindro del cielo
 * (más allá de la última fila de la formación), o sobre el suelo si el rayo lo toca antes. Así las tapan
 * las siluetas de las copias y el escenario, y la trama por delante.
 *
 * **Que se lean como estrellas.** Muchas débiles y pocas brillantes, en tres clases: el punto de un
 * píxel, uno apenas más grande (un píxel con sus vecinos a un tercio) y las brillantes, con un halo
 * mínimo. Cada una TITILA a su ritmo, lento y leve, en su lugar. Monocromas. El centro de cada una cae
 * en el centro de un píxel, así que siguen nítidas. Además del campo parejo, la vía láctea reparte las
 * suyas: débiles, más adentro de la banda y menos en las franjas de polvo.
 *
 * **Aparecen escalonadas** con el barrido de la noche —cada una tiene su umbral—, y se van antes de que
 * arranque el túnel (DIRECCION-ESCENA §5.1: no son el espacio de Trabajos).
 */

export const ESTRELLAS = {
  /** El campo parejo y las de la vía láctea. */
  cuantas: 90000,
  enLaBanda: 70000,
  /**
   * Elevación de las direcciones del campo, en grados: todo el cielo que la cámara puede ver afuera. Por
   * debajo de −8° el suelo de la formación ya tapa todo (plano, hasta el horizonte), así que ahí no hace
   * falta ninguna: la misma cantidad queda más densa donde se ve.
   */
  elevacion: { desde: -8, hasta: 40 },
  /**
   * Las tres clases: qué parte del cielo es de cada una, su brillo (fracción del blanco) y su lado en
   * píxeles (1 CSS = 1). La brillante lleva un halo de `halo` sobre su núcleo. Las de la banda, más débiles.
   */
  clases: {
    punto: { parte: 0.72, brillo: [0.3, 0.62], lado: 1 },
    media: { parte: 0.23, brillo: [0.62, 0.95], lado: 3 },
    brillante: { parte: 0.05, brillo: [1, 1], lado: 7 },
  },
  deLaBanda: { punto: 0.9, media: 0.09, brillo: [0.16, 0.42] },
  halo: 0.34,
  /** El titileo: frecuencia (Hz) y cuánto baja el brillo en el valle. */
  titileo: { desde: 0.07, hasta: 0.3, hondo: [0.18, 0.45] },
  /** En qué franja de la noche aparecen, repartidas. */
  umbral: { desde: 0.35, hasta: 0.92 },
  /** Cuánto dura la aparición de cada una, en unidades de noche. */
  fundido: 0.06,
  /** Adelante de esto no hay cielo: la capa gruesa. */
  afueraDe: MOIRE_FAR_RADIUS + 0.5,
} as const

const VERTEX = /* glsl */ `
attribute vec3 aDireccion;
attribute vec4 aEstrella;
uniform float uNoche;
uniform float uVisible;
uniform float uPixel;
uniform float uRadio;
uniform float uSuelo;
uniform float uTiempo;
uniform vec2 uResolucion;
uniform float uEstrellasDelAmanecer;
varying float vAlfa;
varying float vClase;
${TRAMA_GLSL}
void main() {
	// Donde la dirección corta el cilindro del cielo, desde la cámara: sin paralaje.
	vec3 o = cameraPosition;
	vec3 d = aDireccion;
	float a = dot( d.xz, d.xz );
	float b = 2.0 * dot( o.xz, d.xz );
	float c = dot( o.xz, o.xz ) - uRadio * uRadio;
	float t = ( - b + sqrt( max( b * b - 4.0 * a * c, 0.0 ) ) ) / ( 2.0 * a );
	// Si el rayo toca el suelo antes, sobre el suelo: el escenario y el piso de abajo la tapan donde corresponde.
	if ( d.y < 0.0 ) t = min( t, ( uSuelo - o.y ) / d.y - 0.05 );
	vec3 mundo = o + d * t;
	// Adentro de la trama no hay cielo.
	float afuera = step( ${ESTRELLAS.afueraDe.toFixed(2)}, length( mundo.xz ) );
	gl_Position = projectionMatrix * viewMatrix * vec4( mundo, 1.0 );
	float lado = ( aEstrella.z < 0.5 ? 1.0 : ( aEstrella.z < 1.5 ? ${ESTRELLAS.clases.media.lado.toFixed(1)} : ${ESTRELLAS.clases.brillante.lado.toFixed(1)} ) ) * uPixel;
	// El centro, en el centro de un píxel (o en una esquina si el lado es par): nítida aunque ocupe más de uno.
	vec2 px = ( gl_Position.xy / gl_Position.w * 0.5 + 0.5 ) * uResolucion;
	px = mod( lado, 2.0 ) > 0.5 ? floor( px ) + 0.5 : floor( px + 0.5 );
	gl_Position.xy = ( px / uResolucion * 2.0 - 1.0 ) * gl_Position.w;
	// aEstrella: brillo, umbral de la noche, clase y una semilla para el titileo.
	float aparece = smoothstep( aEstrella.y, aEstrella.y + ${ESTRELLAS.fundido.toFixed(3)}, uNoche );
	float f = mix( ${ESTRELLAS.titileo.desde.toFixed(2)}, ${ESTRELLAS.titileo.hasta.toFixed(2)}, fract( aEstrella.w * 7.13 ) );
	float hondo = mix( ${ESTRELLAS.titileo.hondo[0].toFixed(2)}, ${ESTRELLAS.titileo.hondo[1].toFixed(2)}, fract( aEstrella.w * 3.71 ) );
	// Dos senos de razón irracional: no se lee como un parpadeo regular.
	float ola = 0.5 + 0.5 * sin( 6.2832 * ( uTiempo * f + aEstrella.w ) ) * cos( 6.2832 * ( uTiempo * f * 0.618 + aEstrella.w * 1.7 ) );
	float titila = 1.0 - hondo * ola;
	// [ESCENA 7] T11: antes de que entre la luz del amanecer, las estrellas se apagan (1 sin el amanecer).
	vAlfa = aEstrella.x * titila * aparece * uVisible * afuera * uEstrellasDelAmanecer;
	// [ESCENA 7] Detrás de una raya de la trama, no se ve.
	if ( vAlfa > 0.001 ) vAlfa *= delanteDeLaTrama( o, d );
	vClase = aEstrella.z;
	gl_PointSize = vAlfa > 0.001 ? lado : 0.0;
}
`

const FRAGMENT = /* glsl */ `
varying float vAlfa;
varying float vClase;
void main() {
	// En píxeles desde el centro del sprite.
	vec2 q = ( gl_PointCoord - 0.5 );
	float cuanto = 1.0;
	if ( vClase > 0.5 && vClase < 1.5 ) {
		// La media: el píxel del centro entero y sus vecinos a un tercio.
		vec2 k = abs( q ) * ${ESTRELLAS.clases.media.lado.toFixed(1)};
		cuanto = max( k.x, k.y ) < 0.5 ? 1.0 : ( k.x + k.y < 1.6 ? 0.34 : 0.0 );
	} else if ( vClase > 1.5 ) {
		// La brillante: el núcleo de un píxel y un halo mínimo que cae rápido.
		vec2 k = q * ${ESTRELLAS.clases.brillante.lado.toFixed(1)};
		float r = length( k );
		cuanto = max( abs( k.x ) < 0.5 && abs( k.y ) < 0.5 ? 1.0 : 0.0, ${ESTRELLAS.halo.toFixed(2)} * exp( - r * r / 2.2 ) );
	}
	gl_FragColor = vec4( vec3( vAlfa * cuanto ), 1.0 );
}
`

/** Cuánto oscurece el cielo arriba (0–1) y entre qué alturas del rayo (el seno de la elevación) lo hace. */
export const CIELO = { oscuro: 0.55, desde: 0.03, hasta: 0.4 } as const

/**
 * La vía láctea: una cúpula alrededor de la cámara, detrás de todo y de la trama. Suma la luz de la banda
 * y OSCURECE el cielo hacia arriba (`CIELO.oscuro`): una noche en el campo es más negra arriba que en el
 * horizonte, donde el cielo queda del color de la bruma y empalma con el piso del fondo sin una línea.
 */
const VERTEX_DE_LA_CUPULA = /* glsl */ `
varying vec3 vMundo;
void main() {
	vec4 mundo = modelMatrix * vec4( position, 1.0 );
	vMundo = mundo.xyz;
	gl_Position = projectionMatrix * viewMatrix * mundo;
}
`

/** [ESCENA 9] T4 · la noche desde la que la cúpula empieza a sumar (el borde de abajo de su `smoothstep`). */
const NOCHE_DE_LA_CUPULA = 0.5

const FRAGMENT_DE_LA_CUPULA = /* glsl */ `
uniform float uNoche;
uniform float uVisible;
uniform float uEstrellasDelAmanecer;
varying vec3 vMundo;
${TRAMA_GLSL}
${viaLacteaGlsl()}
#ifdef AMANECER
	uniform float uResplandor;
	uniform float uBarridoDelDia;
	uniform float uCieloDelAmanecer;
	uniform vec3 uCieloDeNoche;
	uniform vec3 uSolDelAmanecer;
#endif
void main() {
	vec3 d = normalize( vMundo - cameraPosition );
	float noche = smoothstep( ${NOCHE_DE_LA_CUPULA.toFixed(2)}, 0.9, uNoche ) * uVisible * uEstrellasDelAmanecer;
	float pasa = delanteDeLaTrama( cameraPosition, d );
	float luz = viaLactea( d ) * noche * pasa;
	float oscuro = ${CIELO.oscuro.toFixed(2)} * smoothstep( ${CIELO.desde.toFixed(2)}, ${CIELO.hasta.toFixed(2)}, d.y ) * noche * pasa;
	#ifdef AMANECER
		// [ESCENA 7] T11: el resplandor nace en el horizonte (más del lado del sol); después el cielo pasa de noche
		// a día desde el horizonte hacia arriba (la sala ya es de día: lo de atrás es el cielo de día).
		vec2 alSol = normalize( uSolDelAmanecer.xz );
		float horizonte = exp( - max( d.y, 0.0 ) / 0.08 ) * ( 0.6 + 0.4 * max( 0.0, dot( normalize( d.xz + 1e-5 ), alSol ) ) );
		luz += 0.5 * uResplandor * horizonte * pasa;
		if ( uBarridoDelDia > 0.5 ) {
			float dia = clamp( uCieloDelAmanecer * 1.6 - clamp( d.y / 0.6, 0.0, 1.0 ), 0.0, 1.0 );
			gl_FragColor = vec4( uCieloDeNoche * ( 1.0 - dia ) + vec3( luz ), 1.0 - dia );
			return;
		}
	#endif
	// Mezcla propia: lo de atrás por (1 − oscuro) más la luz de la banda (el alfa sigue en 1).
	gl_FragColor = vec4( vec3( luz ), oscuro );
}
`

/** El radio de la cúpula de la vía láctea: adentro del plano lejano de la cámara (400), afuera de todo. */
const RADIO_DE_LA_CUPULA = 360

type VentanaDelBanco = Window & { __estrellasDelBanco?: { solas: (solas: boolean) => void; cuantas: number } }

interface PropsDeLasEstrellas {
  readonly rig: ProbeRigStore
  readonly calidad: NivelDeCalidad
  readonly moireRef: RefObject<MoireHandle | null>
}

export function Estrellas(props: PropsDeLasEstrellas) {
  if (!entornoDeLaEscena().cielo) return null
  return <EstrellasPrendidas {...props} />
}

/** Las direcciones y los atributos de las estrellas: el campo parejo y las de la vía láctea. */
function armarLasEstrellas(): { direccion: Float32Array; estrella: Float32Array; cuantas: number } {
  const r = azar(0x5ea1a7)
  const e = ESTRELLAS
  const n = e.cuantas + e.enLaBanda
  const direccion = new Float32Array(n * 3)
  const estrella = new Float32Array(n * 4)
  const clases = [e.clases.punto, e.clases.media, e.clases.brillante]
  const s0 = Math.sin((e.elevacion.desde * Math.PI) / 180)
  const s1 = Math.sin((e.elevacion.hasta * Math.PI) / 180)
  const umbral = (): number => e.umbral.desde + (e.umbral.hasta - e.umbral.desde) * r()
  let k = 0
  for (; k < e.cuantas; k += 1) {
    const azimut = r() * Math.PI * 2
    // Uniforme en el seno de la elevación: parejo sobre la esfera.
    const sy = s0 + (s1 - s0) * r()
    const h = Math.sqrt(1 - sy * sy)
    direccion.set([Math.sin(azimut) * h, sy, Math.cos(azimut) * h], k * 3)
    // La clase por su parte del cielo; adentro de cada una, más de las débiles (la ley de un cielo).
    const u = r()
    const clase = u < clases[0].parte ? 0 : u < clases[0].parte + clases[1].parte ? 1 : 2
    const [b0, b1] = clases[clase].brillo
    estrella.set([b0 + (b1 - b0) * r() ** 2.2, umbral(), clase, r()], k * 4)
  }
  // Las de la banda: latitud gaussiana, aceptadas según la luz de la banda (más en el bulbo, menos en el polvo).
  const w = VIA_LACTEA.ancho
  for (let intento = 0; k < n && intento < n * 20; intento += 1) {
    const l = (r() * 2 - 1) * Math.PI
    const b = w * Math.sqrt(-2 * Math.log(Math.max(1e-9, r()))) * Math.cos(2 * Math.PI * r())
    const acepta = densidadDeLaBanda(l, b) / Math.exp(-((b / w) ** 2))
    if (r() > acepta * (1 - 0.1 * polvoDeLaBanda(l, b))) continue
    const d = direccionDeLaBanda(l, b)
    const elevacion = (Math.asin(d[1]) * 180) / Math.PI
    if (elevacion < e.elevacion.desde || elevacion > e.elevacion.hasta) continue
    direccion.set(d, k * 3)
    const u = r()
    const clase = u < e.deLaBanda.punto ? 0 : u < e.deLaBanda.punto + e.deLaBanda.media ? 1 : 2
    const [b0, b1] = clase === 0 ? e.deLaBanda.brillo : clases[clase].brillo
    estrella.set([b0 + (b1 - b0) * r() ** 2.2, umbral(), clase, r()], k * 4)
    k += 1
  }
  return { direccion: direccion.subarray(0, k * 3), estrella: estrella.subarray(0, k * 4), cuantas: k }
}

function EstrellasPrendidas({ rig, calidad, moireRef }: PropsDeLasEstrellas) {
  const escenario = pisoConFormacion(calidad)
  const armado = useMemo(() => {
    const { direccion, estrella, cuantas } = armarLasEstrellas()
    const geometria = new THREE.BufferGeometry()
    // La posición sólo cuenta los puntos: el shader los pone.
    geometria.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cuantas * 3), 3))
    geometria.setAttribute('aDireccion', new THREE.BufferAttribute(direccion, 3))
    geometria.setAttribute('aEstrella', new THREE.BufferAttribute(estrella, 4))
    const trama = TRAMA_EN_VIVO
    const uVisible = { value: 1 }
    const uniforms = {
      ...trama,
      uEstrellasDelAmanecer: AMANECER_EN_VIVO.uEstrellasDelAmanecer,
      uNoche: VIVO.uNoche,
      uVisible,
      uPixel: { value: 1 },
      // Con la formación, el cielo está más allá de la última fila; si no, apenas detrás de la trama.
      uRadio: { value: escenario !== undefined ? FORMACION.radioDelCielo : ESTRELLAS.afueraDe + 1 },
      uSuelo: { value: FLOOR_Y - (escenario?.desnivel ?? 0) },
      uTiempo: VIVO.uTiempo,
      uResolucion: { value: new THREE.Vector2(1, 1) },
    }
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTEX, fragmentShader: FRAGMENT, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })
    const puntos = new THREE.Points(geometria, material)
    puntos.name = 'estrellas'
    puntos.frustumCulled = false
    // Antes que la trama gruesa: la trama se dibuja encima.
    puntos.renderOrder = MOIRE_FAR_ORDER - 2
    const esfera = new THREE.SphereGeometry(RADIO_DE_LA_CUPULA, 64, 32)
    // [CALIDAD 1] B8: la noche oscurece mezclando: con dithering en el color y el alfa (ruido azul).
    const deLaCupula = conDithering(new THREE.ShaderMaterial({
      uniforms: { ...trama, ...AMANECER_EN_VIVO, uNoche: VIVO.uNoche, uVisible },
      defines: hayAmanecer() ? { AMANECER: '' } : {},
      vertexShader: VERTEX_DE_LA_CUPULA,
      fragmentShader: FRAGMENT_DE_LA_CUPULA,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      side: THREE.BackSide,
    }), true)
    const cupula = new THREE.Mesh(esfera, deLaCupula)
    cupula.name = 'vía láctea'
    cupula.frustumCulled = false
    cupula.renderOrder = MOIRE_FAR_ORDER - 3
    return { puntos, cupula, geometria, esfera, material, deLaCupula, uniforms, trama, cuantas }
  }, [escenario])
  useEffect(
    () => () => {
      armado.geometria.dispose()
      armado.material.dispose()
      armado.esfera.dispose()
      armado.deLaCupula.dispose()
    },
    [armado],
  )

  // Para el banco: esconder el resto de los puntos (polvo y bokeh) y mirar sólo el cielo.
  const scene = useThree((state) => state.scene)
  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__estrellasDelBanco = {
      solas: (solas) =>
        scene.traverse((o) => {
          if (o instanceof THREE.Points && o !== armado.puntos) o.visible = !solas
        }),
      cuantas: armado.cuantas,
    }
    return () => {
      delete ventana.__estrellasDelBanco
    }
  }, [scene, armado])

  useFrame((state) => {
    const visible = fueraDelTunel(rig.current.progress)
    alCuadro(armado.uniforms, armado.puntos, armado.cupula, visible, state.viewport.dpr, state.gl)
    leerLaTrama(moireRef.current)
    armado.cupula.position.copy(state.camera.position)
  })

  return (
    <>
      <primitive object={armado.cupula} />
      <primitive object={armado.puntos} />
    </>
  )
}

/**
 * [ESCENA 9] T4 · la cúpula suma algo sólo de noche o en el amanecer: si no, su luz y su oscuro valen cero y se dibujaba
 * igual, cubriendo la pantalla (0,4–0,8 ms de GPU de día a 1440, el doble con dpr 1,5). Las mismas condiciones que
 * anulan su fragmento: la noche por debajo del borde de su `smoothstep`, el túnel, las estrellas apagadas por el amanecer.
 */
function cupulaEnCuadro(visible: number): boolean {
  const a = AMANECER_EN_VIVO
  const deNoche = VIVO.uNoche.value > NOCHE_DE_LA_CUPULA && visible > 0 && a.uEstrellasDelAmanecer.value > 0
  return deNoche || a.uResplandor.value > 0 || a.uBarridoDelDia.value > 0.5
}

function alCuadro(u: { uVisible: { value: number }; uPixel: { value: number }; uResolucion: { value: THREE.Vector2 } }, puntos: THREE.Points, cupula: THREE.Mesh, visible: number, dpr: number, gl: THREE.WebGLRenderer): void {
  u.uVisible.value = visible
  cupula.visible = cupulaEnCuadro(visible)
  // [CALIDAD 1] B12 · si ninguna puede verse (de día, con menos noche que el umbral más bajo; en el túnel; o el amanecer ya
  // las apagó) no se dibujan: el vértice de todas costaba 0,34 ms por cuadro también de día, sin pintar un píxel.
  puntos.visible = visible > 0.001 && VIVO.uNoche.value > ESTRELLAS.umbral.desde && AMANECER_EN_VIVO.uEstrellasDelAmanecer.value > 0.001
  gl.getDrawingBufferSize(u.uResolucion.value)
  // Un píxel CSS, redondeado a píxeles enteros del búfer: nítidas.
  u.uPixel.value = Math.max(1, Math.round(dpr))
}
