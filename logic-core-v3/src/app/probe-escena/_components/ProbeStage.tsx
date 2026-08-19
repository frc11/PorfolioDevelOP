'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'

import { BokehParticles } from './BokehParticles'
import { DepthParticles } from './DepthParticles'
import { LogoFragments } from './LogoFragments'
import { OrbitRig } from './OrbitRig'
import { ProbeLogo } from './ProbeLogo'
import { Softboxes } from './Softboxes'
import { StudioFloor } from './StudioFloor'
import {
  BOUNCE_COLOR,
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  HEMI_INTENSITY,
  KEY_LIGHT_POSITION,
  PAPER_COLOR,
  RIM_LIGHT_INTENSITY,
  RIM_LIGHT_POSITION,
  SHADOW_MAP_SIZE,
  SHADOW_ORTHO,
} from './probeScene'
import {
  PROBE_DEFAULTS,
  type ProbeMode,
  type ProbeParamsStore,
  type ProbeRigStore,
  type ProbeStatsStore,
} from './probeStore'

/**
 * La escena. Un estudio fotográfico de papel con el logo mate adentro, sin HDRI.
 *
 * **Sin HDRI es media respuesta del probe.** El artefacto del hero es un espejo
 * (`metalness=1`, `clearcoat=1`) y por eso necesita 1,27 MiB de entorno
 * comprimido solo para tener algo que reflejar. Un material mate se resuelve con
 * luces analíticas, que pesan cero bytes. Lo que se pierde son los reflejos
 * fotográficos; lo que se gana es que el objeto se lee igual de sólido desde
 * cualquier ángulo, que es justo lo que una órbita de 360° necesita.
 *
 * **Sin EffectComposer**, por la lección ya documentada del repo (canvas chico y
 * transparente + composer = cuadrado oscuro en Windows/ANGLE). Acá el canvas es
 * opaco y de página, así que el composer sería legal, pero no hace falta nada de
 * post: el bloom sobre un objeto negro mate no aporta.
 *
 * **Todo lo que S4 agrega pertenece al mismo mundo.** Softboxes, marcas de piso,
 * ciclorama, partículas desenfocadas y arcos sueltos de la marca: nada orgánico,
 * nada que brille por sí mismo, nada que compita en peso visual con el logo.
 */

type ProbeStageProps = {
  store: ProbeParamsStore
  rig: ProbeRigStore
  stats: ProbeStatsStore
  mode: ProbeMode
  physicsEnabled: boolean
  playing: boolean
  onPlayEnd: () => void
  reducedMotion: boolean
  autoOrbit: boolean
  keyFollowsCamera: boolean
  onReady: () => void
}

export default function ProbeStage({
  store,
  rig,
  stats,
  mode,
  physicsEnabled,
  playing,
  onPlayEnd,
  reducedMotion,
  autoOrbit,
  keyFollowsCamera,
  onReady,
}: ProbeStageProps) {
  const keyLightRef = useRef<THREE.DirectionalLight>(null)
  /**
   * El grupo que envuelve al logo. Existe SOLO para la vira: es lo que el rig
   * balancea. `ProbeLogo` no se toca — su propio `<group>` interno lleva la
   * escala y el volteo del SVG, y esta rotación se compone por afuera.
   */
  const logoGroupRef = useRef<THREE.Group>(null)

  return (
    <Canvas
      className="h-full w-full"
      shadows
      // La posición inicial la pisa `OrbitRig` en el primer frame; se declara
      // igual para que el primer render no salga desde el origen.
      camera={{
        fov: CAMERA_FOV,
        near: CAMERA_NEAR,
        far: CAMERA_FAR,
        position: [0, PROBE_DEFAULTS.height, PROBE_DEFAULTS.distance],
      }}
      gl={{
        // Canvas opaco: el fondo lo pinta la escena, no el CSS de atrás.
        alpha: false,
        // El hero lo tiene en false. Acá va en true a propósito: lo que se juzga
        // son los cantos de un objeto negro contra papel blanco, y sin
        // antialias el escalonado del borde se confunde con el objeto.
        antialias: true,
        powerPreference: 'high-performance',
        // r3f pone ACES por default. Neutral (Khronos PBR Neutral) conserva el
        // blanco del papel en vez de lavarlo, y mantiene el matiz de la luz de
        // color cuando se mueve la temperatura.
        toneMapping: THREE.NeutralToneMapping,
      }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={[PAPER_COLOR]} />

      <Suspense fallback={null}>
        {/*
          Rig FIJO al mundo — ver la nota larga en `probeScene.ts`. Tres piezas:

          · Hemisférico: el cielo del estudio y el rebote del papel hacia
            arriba. Es lo que impide que la cara en sombra se vaya a negro
            absoluto y quede sin forma. Con el ciclorama hace un trabajo extra:
            la pared, que tiene la normal horizontal, recibe la mezcla de cielo
            y piso, y esa diferencia con el suelo es lo que dibuja la cove.
          · Principal: 3/4 alto por delante-izquierda. Es la única que proyecta
            sombra y la única que la coreografía maneja (intensidad y
            temperatura, con el apagado del cierre adentro).
          · Contraluz: fija atrás-derecha, baja. Le pone canto al objeto cuando
            la cámara pasa por detrás, para que ese medio giro no sea una
            silueta plana.
        */}
        <hemisphereLight args={[PAPER_COLOR, BOUNCE_COLOR, HEMI_INTENSITY]} />

        <directionalLight
          ref={keyLightRef}
          position={KEY_LIGHT_POSITION}
          intensity={PROBE_DEFAULTS.keyIntensity}
          castShadow
          shadow-mapSize={[SHADOW_MAP_SIZE, SHADOW_MAP_SIZE]}
          shadow-camera-near={2}
          shadow-camera-far={60}
          shadow-camera-left={-SHADOW_ORTHO}
          shadow-camera-right={SHADOW_ORTHO}
          shadow-camera-top={SHADOW_ORTHO}
          shadow-camera-bottom={-SHADOW_ORTHO}
          // La pieza es fina: con el bias por default la sombra se le despega
          // del canto. Con la extrusión de S4 (espesor 0,56 contra 0,119) el
          // margen es todavía más holgado, así que estos valores siguen bien.
          shadow-bias={-0.0002}
          shadow-normalBias={0.008}
        />

        <directionalLight position={RIM_LIGHT_POSITION} intensity={RIM_LIGHT_INTENSITY} />

        <group ref={logoGroupRef}>
          <ProbeLogo stats={stats} onReady={onReady} />
        </group>

        <StudioFloor />
        <Softboxes />
        <LogoFragments />
        <DepthParticles store={store} />
        <BokehParticles />

        <OrbitRig
          store={store}
          rig={rig}
          stats={stats}
          mode={mode}
          physicsEnabled={physicsEnabled}
          playing={playing}
          onPlayEnd={onPlayEnd}
          reducedMotion={reducedMotion}
          autoOrbit={autoOrbit}
          keyFollowsCamera={keyFollowsCamera}
          keyLightRef={keyLightRef}
          logoGroupRef={logoGroupRef}
        />
      </Suspense>
    </Canvas>
  )
}
