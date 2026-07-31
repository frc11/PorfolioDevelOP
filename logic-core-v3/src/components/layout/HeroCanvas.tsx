"use client"

import { Canvas, useThree, useLoader } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { SVGLoader } from 'three-stdlib'
import { Environment } from '@react-three/drei'
import { HeroArtifact } from '@/components/3d/HeroArtifact'

// HDRI self-hosteado (public/hdri): el preset 'studio' de drei lo bajaba de
// raw.githubusercontent.com en cada visita. Mismo archivo, mismo look, servido
// desde el propio origen.
//
// No es opcional: el material del artefacto es `metalness={1}` / `roughness={0}`
// / `clearcoat={1}` — un espejo. Sin entorno que reflejar se renderiza negro
// plano. `ambientLight` sola no lo resuelve.
const HDRI_STUDIO_PATH = '/hdri/studio_small_03_1k.hdr'

/**
 * Feed de puntero. El canvas va con `pointer-events: none` (no debe interceptar
 * ni un click del hero), así que r3f no actualiza `state.pointer` por su cuenta.
 *
 * La normalización es relativa al CENTRO DE LA CAJA del canvas pero con la
 * escala del viewport: así el artefacto orienta hacia el cursor en toda la
 * pantalla, no solo cuando el mouse pasa por encima.
 *
 * El rect se cachea y se refresca en resize/scroll en vez de medirse en cada
 * `pointermove`: un `getBoundingClientRect()` por evento de mouse es una
 * lectura de layout por frame.
 */
function PointerSync() {
  const { pointer, gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement
    let rect = canvas.getBoundingClientRect()

    const measure = () => {
      rect = canvas.getBoundingClientRect()
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (rect.width <= 0 || rect.height <= 0) return

      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      pointer.x = (event.clientX - centerX) / (window.innerWidth / 2)
      pointer.y = -(event.clientY - centerY) / (window.innerHeight / 2)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('resize', measure, { passive: true })
    window.addEventListener('scroll', measure, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [pointer, gl])

  return null
}

/**
 * Señal de "listo". Comparte el cache de `useLoader` con `HeroArtifact` (mismo
 * SVG) → suspende hasta que está cargado. Al montar (post-Suspense) espera dos
 * frames — logo extruido y pintado — y recién ahí avisa, para que el fade de
 * entrada no revele una caja vacía.
 */
function ReadySignal({ onReady }: { onReady: () => void }) {
  useLoader(SVGLoader, '/logodevelOP.svg')

  useEffect(() => {
    let raf1 = 0
    let raf2 = 0
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => onReady())
    })

    return () => {
      window.cancelAnimationFrame(raf1)
      window.cancelAnimationFrame(raf2)
    }
  }, [onReady])

  return null
}

/**
 * El logo, siempre en su estado final (`phase='done'`: escala 1, opacidad 1,
 * orientado al puntero). `HeroArtifact` está congelado — se consume tal cual.
 *
 * La escala se deriva del aspecto de la caja para que el objeto no se recorte
 * en cajas que no sean cuadradas.
 */
function HeroLogo() {
  const { size } = useThree()

  const aspect = size.width / Math.max(size.height, 1)
  const scale = Math.min(1.28, Math.max(1.02, aspect * 0.78))

  return (
    <group scale={scale} position={[0, 0.02, 0]}>
      <HeroArtifact phase="done" />
    </group>
  )
}

/**
 * Canvas del artefacto del hero. Se monta SOLO desde `HeroArtifactLayer`
 * (desktop, diferido) y llena la caja de su wrapper — r3f lo dimensiona solo,
 * sin sincronización manual de tamaño.
 *
 * **Sin EffectComposer**, a diferencia del hero anterior, por dos razones que
 * apuntan al mismo lado:
 *
 * 1. La dirección es monocroma. `ChromaticAberration` es, literalmente, meter
 *    color: parte los bordes en RGB. Contra "instrumento de precisión" no va.
 * 2. La lección aprendida del repo dice que en canvas chicos y transparentes el
 *    composer pinta un cuadrado oscuro del tamaño del canvas (Windows/ANGLE,
 *    inalcanzable desde shaders), y que ahí NO se usa. El hero viejo se salvaba
 *    por ser un canvas de página full-bleed; este es in-box, o sea exactamente
 *    el caso prohibido.
 *
 * De paso, saca `@react-three/postprocessing` del set de chunks que el home
 * llega a pedir, y con él se va el gate `postFxReady` que existía solo para
 * esquivar ese cuadrado.
 *
 * `DotMatrixMesh` tampoco se monta más acá: la grilla de puntos se desconectó
 * del home (B2-S2). El archivo `canvas/DotMatrix.tsx` sigue vivo — lo usan
 * `/login`, `/forgot-password` y `/accept-invite`.
 */
export default function HeroCanvas({
  frameloop,
  onReady,
}: {
  // 'always' con el artefacto en viewport; 'demand' fuera de él (el gate vive
  // en HeroArtifactLayer). Fuera de pantalla no se renderiza ni un frame.
  frameloop: 'always' | 'demand'
  onReady: () => void
}) {
  return (
    <Canvas
      className="h-full w-full"
      frameloop={frameloop}
      camera={{ position: [0, 0, 13], fov: 30 }}
      gl={{
        alpha: true,
        powerPreference: 'high-performance',
        antialias: false,
        stencil: false,
        depth: true,
      }}
      dpr={[1, 1.5]}
    >
      <PointerSync />
      <Suspense fallback={null}>
        <ReadySignal onReady={onReady} />

        <ambientLight intensity={1.5} />
        <Environment files={HDRI_STUDIO_PATH} />

        <HeroLogo />
      </Suspense>
    </Canvas>
  )
}
