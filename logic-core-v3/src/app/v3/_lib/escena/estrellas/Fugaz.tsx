'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena, hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { TRAMA_GLSL } from './cielo'
import { TRAMA_EN_VIVO } from './trama'
import { FORMACION } from '../formacion/enFormacion'
import { AIRE } from '../polvo/parche'
import { MOIRE_FAR_ORDER } from '../probeMoire'
import type { ProbeRigStore } from '../probeStore'
import { fueraDelTunel } from '../tunelEnLaEscena'

/**
 * [ESCENA 7] T13 · ESTRELLA FUGAZ — [ESCENA 8] aprobada: encendida en el producto (`fugaz`; el banco la
 * apaga con `fugaz=no`). De noche, afuera de la trama, cada 5 a 10 s (la noche dura poco): un trazo tenue y rápido que cruza un pedazo del cielo que se está mirando, con la cola
 * que se apaga. Está en el infinito, como las estrellas: detrás de la trama (la lee, como ellas) y de las
 * siluetas de la formación. Una llamada de dibujo, sólo mientras cruza.
 *
 * Es una CINTA con ancho en píxeles, no una línea: una línea de WebGL mide siempre 1 px y, con la cola
 * apagándose, se perdía entre las estrellas (que miden 2 o 3). Fina en la cola, un poco más ancha en la
 * cabeza, con el borde de un píxel.
 */
export const FUGAZ = {
  /** Cada cuánto (s, entre los dos) y cuánto dura (s). */
  cada: [5, 10],
  dura: [0.45, 0.75],
  /**
   * Dónde nace y cuánto recorre, en el cuadro (de −1 a 1 por eje): nace arriba, en la franja que el logo deja
   * libre, y cae de costado hacia el centro sin salir de ella. Con los dos extremos adentro, el trazo entero
   * queda adentro (un arco alrededor del ojo se proyecta como una recta). `borde`: hasta dónde llega en x;
   * `aire`: cuánto se aparta del logo.
   */
  nace: { y: [0.45, 0.8] },
  recorre: { x: [0.22, 0.4], y: [0.12, 0.26] },
  borde: 0.85,
  aire: 0.06,
  /** Qué parte del recorrido es la cola, y lo mínimo que un extremo sube sobre el horizonte (seno). */
  cola: 0.3,
  horizonte: 0.06,
  /** Qué tan tenue (0 a 1, en la cabeza) y el ancho del trazo en la cola y en la cabeza (px CSS). */
  brillo: 0.8,
  ancho: [0.8, 2.2],
  /** Desde qué noche (0 a 1). */
  noche: 0.85,
} as const

const TRAMOS = 40

const VERTEX = /* glsl */ `
attribute float aK;
attribute float aLado;
uniform vec3 uDesde;
uniform vec3 uHasta;
uniform float uProgreso;
uniform float uBrillo;
uniform vec2 uResolucion;
uniform float uPixel;
varying float vAlfa;
varying float vLado;
varying float vMitad;
${TRAMA_GLSL}
vec3 arco( float u ) {
	float c = clamp( dot( uDesde, uHasta ), -1.0, 1.0 );
	float a = acos( c );
	if ( a < 1e-4 ) return uDesde;
	return normalize( ( sin( ( 1.0 - u ) * a ) * uDesde + sin( u * a ) * uHasta ) / sin( a ) );
}
vec4 enElCielo( vec3 d ) {
	return projectionMatrix * viewMatrix * vec4( cameraPosition + d * ${(FORMACION.radioDelCielo - 20).toFixed(1)}, 1.0 );
}
void main() {
	// La cabeza va en uProgreso; la cola, detrás, apagándose.
	float u = clamp( uProgreso - ${FUGAZ.cola.toFixed(2)} * ( 1.0 - aK ), 0.0, 1.0 );
	vec3 d = arco( u );
	vec4 p = enElCielo( d );
	// En pantalla el trazo es una recta (sale de las dos puntas): la cinta se abre a lo ancho de ella.
	vec4 a = enElCielo( uDesde );
	vec4 b = enElCielo( uHasta );
	vec2 recta = normalize( ( b.xy / b.w - a.xy / a.w ) * uResolucion + 1e-6 );
	float mitad = 0.5 * mix( ${FUGAZ.ancho[0].toFixed(2)}, ${FUGAZ.ancho[1].toFixed(2)}, aK ) * uPixel + 0.5;
	p.xy += vec2( - recta.y, recta.x ) * aLado * mitad * 2.0 / uResolucion * p.w;
	gl_Position = p;
	vLado = aLado * mitad;
	vMitad = mitad;
	float aparece = smoothstep( 0.0, 0.15, uProgreso ) * ( 1.0 - smoothstep( 0.75, 1.0, uProgreso ) );
	vAlfa = uBrillo * aK * sqrt( aK ) * aparece * step( 0.03, d.y ) * delanteDeLaTrama( cameraPosition, d );
}
`

const FRAGMENT = /* glsl */ `
varying float vAlfa;
varying float vLado;
varying float vMitad;
void main() {
	// vLado: la distancia al eje, en px; el borde se apaga en el último píxel.
	float borde = 1.0 - smoothstep( vMitad - 1.0, vMitad, abs( vLado ) );
	gl_FragColor = vec4( vec3( vAlfa * borde ), 1.0 );
}
`

interface PropsDeLaFugaz {
  readonly rig: ProbeRigStore
}

type VentanaDelBanco = Window & { __fugazDelBanco?: { cuantas: () => number; ya: (fija?: number) => void; donde: () => number[] } }

export function Fugaz(props: PropsDeLaFugaz) {
  if (!entornoDeLaEscena().fugaz) return null
  return <FugazPrendida {...props} />
}

/** Un número entre dos, con el azar de la escena (determinista por cuántas van). */
const entre = (a: number, b: number, n: number): number => a + (b - a) * (0.5 + 0.5 * Math.sin(n * 12.9898 + 4.1414))

/**
 * La n-ésima: dónde nace y dónde termina en el cuadro (x, y de la salida; x, y de la llegada; de −1 a 1),
 * adentro de la franja libre `[a, b]` (en x). Cae hacia el centro del cuadro; `null` si no entra.
 */
export function trayectoriaDeLaFugaz(n: number, [a, b]: readonly [number, number]): readonly [number, number, number, number] | null {
  const f = FUGAZ
  const largo = entre(f.recorre.x[0], f.recorre.x[1], n * 4.7)
  if (b - a < largo) return null
  const medio = (a + b) / 2
  const aLaDerecha = Math.abs(medio) > 0.1 ? medio < 0 : entre(-1, 1, n * 3.1) > 0
  const sx = aLaDerecha ? entre(a, b - largo, n * 1.7) : entre(a + largo, b, n * 1.7)
  const sy = entre(f.nace.y[0], f.nace.y[1], n * 2.3)
  return [sx, sy, sx + (aLaDerecha ? largo : -largo), sy - entre(f.recorre.y[0], f.recorre.y[1], n * 3.1)]
}

/** Lo que el logo tapa en el cuadro y la franja libre más ancha que deja, en x (de −1 a 1). */
export function franjaLibre(logo: { readonly x0: number; readonly x1: number; readonly y0: number; readonly y1: number } | null): readonly [number, number] {
  const { borde, aire, nace, recorre } = FUGAZ
  // Si el logo no llega a la altura donde cruzan, todo el ancho está libre.
  if (logo === null || logo.y0 > nace.y[1] || logo.y1 < nace.y[0] - recorre.y[1]) return [-borde, borde]
  const izquierda: readonly [number, number] = [-borde, Math.min(borde, logo.x0 - aire)]
  const derecha: readonly [number, number] = [Math.max(-borde, logo.x1 + aire), borde]
  return izquierda[1] - izquierda[0] >= derecha[1] - derecha[0] ? izquierda : derecha
}

function FugazPrendida({ rig }: PropsDeLaFugaz) {
  const armado = useMemo(() => {
    // La cinta: dos vértices por tramo (a cada lado del eje) y dos triángulos entre tramos.
    const k = new Float32Array(TRAMOS * 2).map((_v, i) => Math.floor(i / 2) / (TRAMOS - 1))
    const lado = new Float32Array(TRAMOS * 2).map((_v, i) => (i % 2 === 0 ? -1 : 1))
    const indices: number[] = []
    for (let i = 0; i < TRAMOS - 1; i += 1) indices.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2)
    const geometria = new THREE.BufferGeometry()
    geometria.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAMOS * 2 * 3), 3))
    geometria.setAttribute('aK', new THREE.BufferAttribute(k, 1))
    geometria.setAttribute('aLado', new THREE.BufferAttribute(lado, 1))
    geometria.setIndex(indices)
    const uniforms = { ...TRAMA_EN_VIVO, uDesde: { value: new THREE.Vector3(0, 1, 0) }, uHasta: { value: new THREE.Vector3(0, 1, 0) }, uProgreso: { value: 0 }, uBrillo: { value: 0 }, uResolucion: { value: new THREE.Vector2(1, 1) }, uPixel: { value: 1 } }
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTEX, fragmentShader: FRAGMENT, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
    const linea = new THREE.Mesh(geometria, material)
    linea.name = 'fugaz'
    linea.frustumCulled = false
    linea.renderOrder = MOIRE_FAR_ORDER - 1
    linea.visible = false
    return { linea, geometria, material, uniforms }
  }, [])
  useEffect(() => () => {
    armado.geometria.dispose()
    armado.material.dispose()
  }, [armado])
  const memoria = useRef({ proxima: Number.NaN, desde: Number.NaN, dura: 0, cuantas: 0, saltadas: 0, donde: [0, 0, 0, 0], fija: Number.NaN })

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__fugazDelBanco = {
      cuantas: () => memoria.current.cuantas,
      donde: () => memoria.current.donde,
      // `fija`: la deja clavada en ese momento de su cruce (0 a 1), para una foto.
      ya: (fija?: number) => {
        memoria.current.proxima = VIVO.uTiempo.value
        memoria.current.fija = fija ?? Number.NaN
      },
    }
    return () => {
      delete ventana.__fugazDelBanco
    }
  }, [])

  useFrame((state) => {
    const m = memoria.current
    const t = VIVO.uTiempo.value
    const noche = VIVO.uNoche.value >= FUGAZ.noche && fueraDelTunel(rig.current.progress) > 0.99
    if (!noche) {
      m.proxima = Number.NaN
      apagar(armado.linea)
      return
    }
    if (Number.isNaN(m.proxima)) m.proxima = t + entre(FUGAZ.cada[0], FUGAZ.cada[1], m.cuantas + 0.5)
    if (Number.isNaN(m.desde) && t >= m.proxima) {
      // Nace en la parte de arriba del cuadro y cae de costado, hacia el centro.
      const n = m.cuantas + m.saltadas
      const camara = state.camera
      const f = FUGAZ
      const tr = trayectoriaDeLaFugaz(n, franjaLibre(logoEnElCuadro(camara)))
      const [sx, sy, ex, ey] = tr ?? [0, 0, 0, 0]
      const desde = direccionEn(camara, sx, sy)
      const hasta = direccionEn(camara, ex, ey)
      if (tr === null || Math.min(desde.y, hasta.y) < f.horizonte) {
        // No hay cielo libre donde cruzar (la cámara mira el piso, o el logo tapa el cielo): esta no sale.
        m.saltadas += 1
        m.proxima = t + entre(f.cada[0], f.cada[1], n + 0.5)
      } else {
        armado.uniforms.uDesde.value.copy(desde)
        armado.uniforms.uHasta.value.copy(hasta)
        m.donde = [sx, sy, ex, ey]
        m.desde = t
        m.dura = entre(f.dura[0], f.dura[1], n * 5.9)
        m.cuantas += 1
      }
    }
    if (!Number.isNaN(m.desde)) {
      const p = Number.isNaN(m.fija) ? (t - m.desde) / m.dura : m.fija
      if (p >= 1) {
        m.desde = Number.NaN
        m.proxima = t + entre(FUGAZ.cada[0], FUGAZ.cada[1], m.cuantas + 0.5)
        apagar(armado.linea)
      } else prender(armado.linea, armado.uniforms, p, state.gl, state.viewport.dpr)
    }
  })

  return <primitive object={armado.linea} />
}

/**
 * La caja del logo en el cuadro (de −1 a 1): las piezas de la forma del logo (`uLogoC`, `uLogoP`,
 * `uLogoPalo`, en el espacio del logo) con su trazo, llevadas al mundo con `uLogo` y proyectadas.
 */
function logoEnElCuadro(camara: THREE.Camera): { x0: number; x1: number; y0: number; y1: number } | null {
  const [c, p, palo] = [AIRE.uLogoC.value, AIRE.uLogoP.value, AIRE.uLogoPalo.value]
  if (c.z <= 0 || p.z <= 0) return null
  const trazo = 0.45
  const x0 = Math.min(c.x - c.z, p.x - p.z, palo.x - palo.w) - trazo
  const x1 = Math.max(c.x + c.z, p.x + p.z, palo.x + palo.w) + trazo
  const y0 = Math.min(c.y - c.z, p.y - p.z, palo.y, palo.z) - trazo
  const y1 = Math.max(c.y + c.z, p.y + p.z, palo.y, palo.z) + trazo
  const caja = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity }
  const v = new THREE.Vector3()
  for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [-0.3, 0.3]) {
    v.set(x, y, z).applyMatrix4(AIRE.uLogo.value).project(camara)
    caja.x0 = Math.min(caja.x0, v.x)
    caja.x1 = Math.max(caja.x1, v.x)
    caja.y0 = Math.min(caja.y0, v.y)
    caja.y1 = Math.max(caja.y1, v.y)
  }
  return caja
}

/** La dirección (desde la cámara) del punto del cuadro (x, y), de −1 a 1. */
function direccionEn(camara: THREE.Camera, x: number, y: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, 0.5).unproject(camara).sub(camara.position).normalize()
}

function apagar(linea: THREE.Mesh): void {
  linea.visible = false
}

interface UniformsQueCambian {
  readonly uProgreso: { value: number }
  readonly uBrillo: { value: number }
  readonly uResolucion: { value: THREE.Vector2 }
  readonly uPixel: { value: number }
}

function prender(linea: THREE.Mesh, u: UniformsQueCambian, p: number, gl: THREE.WebGLRenderer, dpr: number): void {
  linea.visible = true
  u.uProgreso.value = p
  u.uBrillo.value = FUGAZ.brillo
  // El ancho va en píxeles: la cinta necesita el tamaño del lienzo.
  gl.getDrawingBufferSize(u.uResolucion.value)
  u.uPixel.value = dpr
}
