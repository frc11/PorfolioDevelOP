'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import type { NivelDeCalidad } from '../calidad'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { pisoConFormacion } from '../formacion/Formacion'
import { MOIRE_FAR_ORDER } from '../probeMoire'
import { CIELO_DE_DIA, CIELO_DE_DIA_GLSL, TONOS, diaDelCielo, nubesDeBloques, nubesDePolvo, type TonoDelCielo, type VarianteDelCielo } from './nubes'

/**
 * [ESCENA 8] T4 · EL CIELO DE DÍA — con bandera y apagado (`cielo-dia=<variante>-<tono>` en el banco; `nubes.ts`
 * tiene el porqué). Sólo con la formación (es el cielo de afuera). Una cúpula del mundo con el cielo (y, en el
 * pintado, las nubes y los paneles) y, en las otras dos, las nubes: cubos o polvo. Todo se dibuja ANTES que la
 * cúpula de la noche, que de noche lo tapa y en el amanecer lo destapa desde el horizonte.
 */

interface PropsDelCielo {
  readonly calidad: NivelDeCalidad
  /** Con menos movimiento las nubes no derivan. */
  readonly quieto: boolean
}

type VentanaDelBanco = Window & { __cieloDeDiaDelBanco?: { variante: string; dia: () => number; mostrar: (si: boolean) => void } }

export function CieloDeDia({ calidad, quieto }: PropsDelCielo) {
  const pedido = entornoDeLaEscena().pruebas.cieloDeDia
  if (pedido === 'no' || pisoConFormacion(calidad) === undefined) return null
  const [variante, tono] = pedido.split('-') as [VarianteDelCielo, TonoDelCielo]
  return <CieloPrendido variante={variante} tono={tono} quieto={quieto} />
}

const VERTEX_DE_LA_CUPULA = /* glsl */ `
varying vec3 vMundo;
void main() {
	vec4 mundo = modelMatrix * vec4( position, 1.0 );
	vMundo = mundo.xyz;
	gl_Position = projectionMatrix * viewMatrix * mundo;
}
`

const FRAGMENT_DE_LA_CUPULA = /* glsl */ `
varying vec3 vMundo;
${CIELO_DE_DIA_GLSL}
void main() {
	// La dirección desde el centro del mundo: la cúpula es del mundo (un ciclorama), no del infinito.
	vec3 d = normalize( vMundo );
	#ifdef CIELO_PINTADO
		vec3 color = cieloPintado( d );
	#else
		vec3 color = cieloSolo( d.y );
	#endif
	gl_FragColor = vec4( mix( uNiebla, color, uDia ), 1.0 );
}
`

const VERTEX_DE_LOS_BLOQUES = /* glsl */ `
varying vec3 vNormal;
varying vec3 vMundo;
void main() {
	vec4 local = vec4( position, 1.0 );
	vec3 n = normal;
	#ifdef USE_INSTANCING
		local = instanceMatrix * local;
		n = mat3( instanceMatrix ) * n;
	#endif
	vec4 mundo = modelMatrix * local;
	vNormal = normalize( mat3( modelMatrix ) * n );
	vMundo = mundo.xyz;
	gl_Position = projectionMatrix * viewMatrix * mundo;
}
`

const FRAGMENT_DE_LOS_BLOQUES = /* glsl */ `
varying vec3 vNormal;
varying vec3 vMundo;
${CIELO_DE_DIA_GLSL}
void main() {
	vec3 n = normalize( vNormal );
	// La luz del día sobre los bloques, como en el piso vivo: la tapa, entera; el costado que mira a la sala (el
	// que se ve), casi entero, y los de canto, menos; abajo, la sombra de la nube.
	vec3 alCentro = normalize( vec3( - vMundo.x, 0.0, - vMundo.z ) );
	float luz = n.y > 0.5 ? 1.0 : ( n.y < - 0.5 ? 0.15 : 0.35 + 0.6 * max( 0.0, dot( n, alCentro ) ) );
	vec3 color = mix( uSombra, uNube, luz );
	float alto = normalize( vMundo - cameraPosition ).y;
	// Lejos: un poco del cielo delante, y la bruma cerca del horizonte.
	color = mix( color, cieloSolo( alto ), 0.12 + 0.88 * brumaDelCielo( alto ) );
	gl_FragColor = vec4( mix( uNiebla, color, uDia ), 1.0 );
}
`

const VERTEX_DEL_POLVO = /* glsl */ `
attribute vec2 aPunto;
uniform float uPixel;
varying float vBrillo;
varying float vLado;
varying float vAlto;
void main() {
	vec4 mundo = modelMatrix * vec4( position, 1.0 );
	gl_Position = projectionMatrix * viewMatrix * mundo;
	gl_PointSize = aPunto.y * uPixel;
	vBrillo = aPunto.x;
	vLado = gl_PointSize;
	vAlto = normalize( mundo.xyz - cameraPosition ).y;
}
`

const FRAGMENT_DEL_POLVO = /* glsl */ `
varying float vBrillo;
varying float vLado;
varying float vAlto;
${CIELO_DE_DIA_GLSL}
void main() {
	// La mota nítida del polvo (T10 de ESCENA 7): un disco con el borde de un píxel.
	float r = length( gl_PointCoord - 0.5 );
	float borde = 0.75 / max( vLado, 1.0 );
	float a = 1.0 - smoothstep( 0.5 - borde, 0.5, r );
	vec3 color = mix( uSombra, uNube, clamp( ( vBrillo - 0.8 ) / 0.2, 0.0, 1.0 ) );
	color = mix( color, cieloSolo( vAlto ), brumaDelCielo( vAlto ) );
	gl_FragColor = vec4( color, a * 0.92 * uDia );
}
`

/** Un color del tono, codificado (los shaders de la escena escriben el color de pantalla tal cual). */
const codificado = (hex: string): THREE.Color => new THREE.Color(hex).convertLinearToSRGB()

function armar(variante: VarianteDelCielo, tono: TonoDelCielo) {
  const t = TONOS[tono]
  const uniforms = {
    uAlto: { value: codificado(t.alto) },
    uNube: { value: codificado(t.nube) },
    uSombra: { value: codificado(t.sombra) },
    uNiebla: { value: new THREE.Color() },
    uDia: { value: 1 },
    uPixel: { value: 1 },
  }
  const esfera = new THREE.SphereGeometry(CIELO_DE_DIA.radio, 96, 48)
  const deLaCupula = new THREE.ShaderMaterial({
    uniforms,
    defines: variante === 'pintado' ? { CIELO_PINTADO: '' } : {},
    vertexShader: VERTEX_DE_LA_CUPULA,
    fragmentShader: FRAGMENT_DE_LA_CUPULA,
    side: THREE.BackSide,
    depthWrite: false,
    toneMapped: false,
  })
  const cupula = new THREE.Mesh(esfera, deLaCupula)
  cupula.frustumCulled = false
  // Última de lo opaco (lo de adelante ya escribió su profundidad) y sin escribir la suya: las estrellas la pisan.
  cupula.renderOrder = 1000
  const nubes = new THREE.Group()
  const soltar: (() => void)[] = [() => esfera.dispose(), () => deLaCupula.dispose()]
  let bloques: THREE.InstancedMesh | null = null
  if (variante === 'bloques') {
    const columnas = nubesDeBloques()
    const caja = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTEX_DE_LOS_BLOQUES, fragmentShader: FRAGMENT_DE_LOS_BLOQUES, toneMapped: false })
    bloques = new THREE.InstancedMesh(caja, material, columnas.length)
    const m = new THREE.Matrix4()
    const giro = new THREE.Quaternion()
    const eje = new THREE.Vector3(0, 1, 0)
    columnas.forEach((c, i) => bloques?.setMatrixAt(i, m.compose(new THREE.Vector3(c.x, c.y, c.z), giro.setFromAxisAngle(eje, c.giro), new THREE.Vector3(c.lado, c.alto, c.lado))))
    bloques.frustumCulled = false
    bloques.renderOrder = 999
    nubes.add(bloques)
    soltar.push(() => caja.dispose(), () => material.dispose())
  } else if (variante === 'particulas') {
    const { posiciones, puntos: atributos, cuantos } = nubesDePolvo()
    const geometria = new THREE.BufferGeometry()
    geometria.setAttribute('position', new THREE.BufferAttribute(posiciones, 3))
    geometria.setAttribute('aPunto', new THREE.BufferAttribute(atributos, 2))
    geometria.setDrawRange(0, cuantos)
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTEX_DEL_POLVO, fragmentShader: FRAGMENT_DEL_POLVO, transparent: true, depthWrite: false, toneMapped: false })
    const puntos = new THREE.Points(geometria, material)
    puntos.frustumCulled = false
    // Detrás de la trama y de la cúpula de la noche, delante de las siluetas (que escriben su profundidad).
    puntos.renderOrder = MOIRE_FAR_ORDER - 5
    nubes.add(puntos)
    soltar.push(() => geometria.dispose(), () => material.dispose())
  }
  return { cupula, nubes, bloques, uniforms, soltar: () => soltar.forEach((f) => f()) }
}

/** Por cuadro: cuánto día hay, la bruma de este cuadro, el píxel, y la deriva de las nubes (nada con menos movimiento). */
function alCuadro(a: ReturnType<typeof armar>, niebla: THREE.Color | null, dpr: number, dt: number, variante: VarianteDelCielo): void {
  const dia = diaDelCielo(VIVO.uNoche.value)
  a.uniforms.uDia.value = dia
  if (niebla !== null) a.uniforms.uNiebla.value.copy(niebla).convertLinearToSRGB()
  a.uniforms.uPixel.value = dpr
  if (variante !== 'pintado') a.nubes.rotation.y += dt * (variante === 'bloques' ? CIELO_DE_DIA.bloques.deriva : CIELO_DE_DIA.particulas.deriva)
  // Los bloques escriben su profundidad: de noche taparían estrellas. Se van antes de que asomen.
  if (a.bloques !== null) a.bloques.visible = dia > 0.01
}

/** Para el banco: el cielo entero, prendido o apagado. */
function mostrarElCielo(a: ReturnType<typeof armar>, si: boolean): void {
  a.cupula.visible = si
  a.nubes.visible = si
}

function CieloPrendido({ variante, tono, quieto }: { readonly variante: VarianteDelCielo; readonly tono: TonoDelCielo; readonly quieto: boolean }) {
  const armado = useMemo(() => armar(variante, tono), [variante, tono])
  useEffect(() => () => armado.soltar(), [armado])
  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    // Para comparar en la misma carga: con el cielo y sin él (queda el fondo del producto).
    ventana.__cieloDeDiaDelBanco = { variante: `${variante}-${tono}`, dia: () => armado.uniforms.uDia.value, mostrar: (si) => mostrarElCielo(armado, si) }
    return () => {
      delete ventana.__cieloDeDiaDelBanco
    }
  }, [armado, variante, tono])
  useFrame((state, delta) => alCuadro(armado, state.scene.fog?.color ?? null, state.viewport.dpr, quieto ? 0 : Math.min(delta, 0.1), variante))
  return (
    <>
      <primitive object={armado.cupula} />
      <primitive object={armado.nubes} />
    </>
  )
}
