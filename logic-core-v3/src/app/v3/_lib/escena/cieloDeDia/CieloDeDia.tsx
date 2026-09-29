'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import type { NivelDeCalidad } from '../calidad'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { pisoConFormacion } from '../formacion/Formacion'
import { CELESTE, CIELO_DE_DIA, CIELO_DE_DIA_GLSL, diaDelCielo } from './nubes'

/**
 * [ESCENA 8] T4 · EL CIELO DE DÍA (`nubes.ts` tiene el porqué). [CALIDAD 1] A2: en el producto, el pintado celeste
 * (el banco lo apaga con `cielo-dia=no`). Sólo con la formación (es el cielo de afuera). Una cúpula del mundo con el
 * cielo, las nubes pintadas y los paneles, que se dibuja ANTES que la cúpula de la noche: de noche la tapa, y en el
 * amanecer la destapa desde el horizonte.
 */

interface PropsDelCielo {
  readonly calidad: NivelDeCalidad
}

type VentanaDelBanco = Window & { __cieloDeDiaDelBanco?: { dia: () => number; mostrar: (si: boolean) => void } }

export function CieloDeDia({ calidad }: PropsDelCielo) {
  if (!entornoDeLaEscena().cieloDeDia || pisoConFormacion(calidad) === undefined) return null
  return <CieloPrendido />
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
	gl_FragColor = vec4( mix( uNiebla, cieloPintado( d ), uDia ), 1.0 );
}
`

/** Un color del celeste, codificado (los shaders de la escena escriben el color de pantalla tal cual). */
const codificado = (hex: string): THREE.Color => new THREE.Color(hex).convertLinearToSRGB()

function armar() {
  const uniforms = {
    uAlto: { value: codificado(CELESTE.alto) },
    uNube: { value: codificado(CELESTE.nube) },
    uSombra: { value: codificado(CELESTE.sombra) },
    uNiebla: { value: new THREE.Color() },
    uDia: { value: 1 },
  }
  const esfera = new THREE.SphereGeometry(CIELO_DE_DIA.radio, 96, 48)
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX_DE_LA_CUPULA,
    fragmentShader: FRAGMENT_DE_LA_CUPULA,
    side: THREE.BackSide,
    depthWrite: false,
    toneMapped: false,
  })
  const cupula = new THREE.Mesh(esfera, material)
  cupula.name = 'cielo de día'
  cupula.frustumCulled = false
  // Última de lo opaco (lo de adelante ya escribió su profundidad) y sin escribir la suya: las estrellas la pisan.
  cupula.renderOrder = 1000
  const soltar = (): void => {
    esfera.dispose()
    material.dispose()
  }
  return { cupula, uniforms, soltar }
}

/** Por cuadro: cuánto día hay y la bruma de este cuadro. */
function alCuadro(a: ReturnType<typeof armar>, niebla: THREE.Color | null): void {
  a.uniforms.uDia.value = diaDelCielo(VIVO.uNoche.value)
  if (niebla !== null) a.uniforms.uNiebla.value.copy(niebla).convertLinearToSRGB()
}

function CieloPrendido() {
  const armado = useMemo(() => armar(), [])
  useEffect(() => () => armado.soltar(), [armado])
  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    // Para comparar en la misma carga: con el cielo y sin él (queda el fondo de antes).
    ventana.__cieloDeDiaDelBanco = {
      dia: () => armado.uniforms.uDia.value,
      mostrar: (si) => {
        armado.cupula.visible = si
      },
    }
    return () => {
      delete ventana.__cieloDeDiaDelBanco
    }
  }, [armado])
  useFrame((state) => alCuadro(armado, state.scene.fog?.color ?? null))
  return <primitive object={armado.cupula} />
}
