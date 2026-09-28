'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { PISO_DE_ABAJO } from '../formacion/armado'
import { FORMACION } from '../formacion/enFormacion'
import { PAPER_COLOR } from '../probeScene'
import { ALTO_DEL_PISO_GLSL, RELIEVE, RUIDO_GLSL, TIEMPO_DEL_PISO } from './ruido'

/**
 * [ESCENA 5] 5e · R2, EL PISO DE AFUERA — el suelo donde está la formación es un campo de bloques:
 * una grilla de columnas cuadradas de papel, con la tapa a una altura escalonada por ruido. Las copias
 * se paran sobre el bloque que tienen debajo (la misma cuenta, `ALTO_DEL_PISO_GLSL`). Una sola malla
 * instanciada; cada bloque es una caja sin la cara de abajo.
 */

const PARS = /* glsl */ `
uniform float uTiempoDelRuido;
${RUIDO_GLSL}
${ALTO_DEL_PISO_GLSL}
`

/** Los centros de los bloques: la grilla recortada al anillo del piso de abajo. */
function centros(): [number, number][] {
  const lado = RELIEVE.piso.lado
  const desde = FORMACION.radioDelEscenario + lado * 0.3
  const hasta = FORMACION.radioDelPisoDeAbajo - lado * 0.6
  const n = Math.ceil(hasta / lado) + 1
  const salida: [number, number][] = []
  for (let i = -n; i <= n; i += 1) {
    for (let j = -n; j <= n; j += 1) {
      const x = (i + 0.5) * lado
      const z = (j + 0.5) * lado
      const r = Math.hypot(x, z)
      if (r >= desde && r <= hasta) salida.push([x, z])
    }
  }
  return salida
}

function cajaSinFondo(): THREE.BufferGeometry {
  const caja = new THREE.BoxGeometry(1, 1, 1).toNonIndexed()
  caja.translate(0, -0.5, 0)
  // Sin la cara de abajo (los triángulos con normal −y): no se ve nunca.
  const normal = caja.getAttribute('normal')
  const quedan: number[] = []
  for (let t = 0; t < normal.count; t += 3) if (normal.getY(t) > -0.99) quedan.push(t)
  const salida = new THREE.BufferGeometry()
  for (const nombre of ['position', 'normal', 'uv'] as const) {
    const a = caja.getAttribute(nombre)
    const datos = new Float32Array(quedan.length * 3 * a.itemSize)
    quedan.forEach((t, i) => {
      for (let k = 0; k < 3; k += 1) for (let c = 0; c < a.itemSize; c += 1) datos[(i * 3 + k) * a.itemSize + c] = a.getComponent(t + k, c)
    })
    salida.setAttribute(nombre, new THREE.BufferAttribute(datos, a.itemSize))
  }
  caja.dispose()
  return salida
}

export function PisoDeBloques() {
  if (entornoDeLaEscena().pruebas.relieve !== 'R2') return null
  return <PisoPrendido />
}

function PisoPrendido() {
  const vivo = entornoDeLaEscena().pruebas.relieveVivo
  const armado = useMemo(() => {
    const lugares = centros()
    const geometria = cajaSinFondo()
    const material = new THREE.MeshLambertMaterial({ color: PAPER_COLOR })
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, TIEMPO_DEL_PISO)
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${PARS}`)
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n\tif ( transformed.y > -0.01 ) transformed.y += altoDelPiso( instanceMatrix[ 3 ].xz, uTiempoDelRuido );')
    }
    material.customProgramCacheKey = () => 'relieve-piso'
    const malla = new THREE.InstancedMesh(geometria, material, lugares.length)
    const lado = RELIEVE.piso.lado * 0.97
    const m = new THREE.Matrix4()
    lugares.forEach(([x, z], i) => {
      // El bloque va de un metro abajo del piso hasta su tapa; `altoDelPiso` sube la tapa.
      m.makeScale(lado, 1, lado).setPosition(x, PISO_DE_ABAJO + 0.002, z)
      malla.setMatrixAt(i, m)
    })
    malla.instanceMatrix.needsUpdate = true
    malla.frustumCulled = false
    return { malla, geometria, material }
  }, [])
  useEffect(
    () => () => {
      armado.malla.dispose()
      armado.geometria.dispose()
      armado.material.dispose()
    },
    [armado],
  )

  useFrame(() => {
    TIEMPO_DEL_PISO.uTiempoDelRuido.value = vivo ? VIVO.uTiempo.value * RELIEVE.velocidad : 0
  })

  return <primitive object={armado.malla} />
}
