'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'

import { BokehParticles } from './BokehParticles'
import type { ChoreoEditor } from './choreographyEditor'
import { ContactOcclusion } from './ContactOcclusion'
import { DepthParticles } from './DepthParticles'
import { InstancedBars } from './InstancedBars'
import { LogoFragments } from './LogoFragments'
import { OrbitRig } from './OrbitRig'
import {
  AERIAL_PLACEMENTS,
  PILLAR_PLACEMENTS,
  PLANE_PLACEMENTS,
} from './probeArchitecture'
import {
  FOG_COLOR,
  FOG_FAR,
  FOG_NEAR,
  SHADOW_BIAS,
  SHADOW_FAR,
  SHADOW_MAP_SIZE,
  SHADOW_NEAR,
  SHADOW_NORMAL_BIAS,
  SHADOW_ORTHO,
  SHADOW_RADIUS,
} from './probeAtmosphere'
import { ProbeLogo } from './ProbeLogo'
import { StudioFloor } from './StudioFloor'
import {
  BOUNCE_COLOR,
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  PAPER_COLOR,
} from './probeScene'
import {
  PROBE_DEFAULTS,
  type ProbeMode,
  type ProbeParamsStore,
  type ProbeRigStore,
  type ProbeStatsStore,
} from './probeStore'

/**
 * La escena. Un espacio arquitectónico abstracto con el logo mate adentro, sin
 * HDRI.
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
 * **El mundo, definido en S5.** La maqueta a escala real de algo que todavía no
 * se terminó de construir: piso claro, luz limpia, planos y estructura
 * suspendidos en el aire, y el logo como única pieza terminada en el centro. No
 * es un taller ni un estudio fotográfico — no hay herramientas ni objetos
 * reconocibles, y no hay una sola imagen de "tecnología": ni nodos, ni
 * circuitos, ni pantallas, ni engranajes. Nada orgánico tampoco.
 *
 * **La atmósfera, en S6.** Tres puntos de luz en vez de dos, niebla lineal,
 * sombra cuatro veces más barata con una penumbra que ahora se elige, y una
 * oclusión de contacto debajo del logo. Los números y sus porqués están en
 * `probeLighting.ts` (el rig) y `probeAtmosphere.ts` (niebla, sombra y
 * contacto); acá solo se cablean.
 *
 * La regla que ordena todo lo que se agrega: **nada brilla por sí mismo** —todo
 * es `meshStandardMaterial` y responde a las mismas luces, así que la sala
 * entera se apaga con el cierre— y **nada compite en peso visual con el logo**,
 * que sigue siendo el único negro puro del cuadro.
 */

type ProbeStageProps = {
  store: ProbeParamsStore
  rig: ProbeRigStore
  stats: ProbeStatsStore
  editor: ChoreoEditor
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
  editor,
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
  const fillLightRef = useRef<THREE.DirectionalLight>(null)
  const rimLightRef = useRef<THREE.DirectionalLight>(null)
  const hemiLightRef = useRef<THREE.HemisphereLight>(null)
  /**
   * El grupo que envuelve al logo. Existe SOLO para la vira: es lo que el rig
   * balancea. `ProbeLogo` no se toca — su propio `<group>` interno lleva la
   * escala y el volteo del SVG, y esta rotación se compone por afuera.
   */
  const logoGroupRef = useRef<THREE.Group>(null)
  /** Los dos campos de partículas. Mismo patrón: el rig los deriva por afuera. */
  const dustGroupRef = useRef<THREE.Group>(null)
  const bokehGroupRef = useRef<THREE.Group>(null)

  return (
    <Canvas
      className="h-full w-full"
      // `PCFShadowMap` explícito, y NO el `PCFSoftShadowMap` que r3f pone con
      // `shadows` en `true`. Suena al revés y no lo es: en three 0.182 el
      // "soft" no tiene entrada en la tabla de defines del shader y compila
      // como `SHADOWMAP_TYPE_BASIC`, o sea una sola muestra sin filtrar. El PCF
      // común es el único que da un disco de muestreo, y su tamaño es
      // `shadow.radius`. La cita del código de three está en `SHADOW_RADIUS`.
      shadows={{ type: THREE.PCFShadowMap }}
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
      {/*
        Fondo y niebla salen de la MISMA constante, y el rig les escribe el mismo
        color apagado en cada frame: si divergieran, se vería una costura en
        cualquier encuadre que destape el fondo detrás del ciclorama.
      */}
      <color attach="background" args={[FOG_COLOR]} />
      <fog attach="fog" args={[FOG_COLOR, FOG_NEAR, FOG_FAR]} />

      <Suspense fallback={null}>
        {/*
          EL RIG DE TRES PUNTOS (S6). Los números, el reparto del apagado y —lo
          más importante— por qué el contraluz funciona en toda la órbita están
          en `probeLighting.ts`. Acá van los cuatro nodos y nada más: posición,
          intensidad y color los escribe `applyLightRig` en cada frame.

          · Hemisférico: el cielo del estudio y el rebote del papel hacia
            arriba. Impide que la cara en sombra se vaya a negro sin forma, y le
            da a la pared del ciclorama la mezcla que dibuja la cove.
          · Principal: 3/4 alto por delante-izquierda, fija al mundo. Es la
            ÚNICA que proyecta sombra.
          · Relleno: opuesto, más bajo y suave, también fijo al mundo.
          · Contraluz: solidario a la cámara en azimut y en altura. Es el que
            recorta el logo del fondo, y el único que se mueve con la vista.
        */}
        <hemisphereLight ref={hemiLightRef} args={[PAPER_COLOR, BOUNCE_COLOR]} />

        <directionalLight
          ref={keyLightRef}
          castShadow
          shadow-mapSize={[SHADOW_MAP_SIZE, SHADOW_MAP_SIZE]}
          shadow-camera-near={SHADOW_NEAR}
          shadow-camera-far={SHADOW_FAR}
          shadow-camera-left={-SHADOW_ORTHO}
          shadow-camera-right={SHADOW_ORTHO}
          shadow-camera-top={SHADOW_ORTHO}
          shadow-camera-bottom={-SHADOW_ORTHO}
          shadow-bias={SHADOW_BIAS}
          shadow-normalBias={SHADOW_NORMAL_BIAS}
          shadow-radius={SHADOW_RADIUS}
        />

        <directionalLight ref={fillLightRef} />
        <directionalLight ref={rimLightRef} />

        <group ref={logoGroupRef}>
          <ProbeLogo stats={stats} onReady={onReady} />
        </group>

        <StudioFloor />
        <ContactOcclusion />

        {/*
          Las tres familias del espacio, cada una un draw call. Ninguna proyecta
          ni recibe sombra, y es una decisión, no un olvido: la ortográfica del
          shadow map cubre solo la esfera del logo, así que nada de esto entraría
          al mapa aunque se lo marcara. Meterlo costaría bajar la resolución
          sobre lo único que importa.
        */}
        <InstancedBars placements={PLANE_PLACEMENTS} roughness={0.92} />
        <InstancedBars placements={AERIAL_PLACEMENTS} roughness={0.85} />
        <InstancedBars placements={PILLAR_PLACEMENTS} roughness={0.95} />

        <LogoFragments />

        {/*
          Los dos campos van en grupos propios porque el rig los hace DERIVAR:
          un giro lento sobre el eje vertical, en sentidos opuestos y con
          períodos inconmensurables. Es el mismo patrón que la vira del logo —
          una matriz, cero costo por partícula— y el porqué está en
          `choreographyPhysics.ts`.
        */}
        <group ref={dustGroupRef}>
          <DepthParticles store={store} />
        </group>
        <group ref={bokehGroupRef}>
          <BokehParticles />
        </group>

        <OrbitRig
          store={store}
          rig={rig}
          stats={stats}
          editor={editor}
          mode={mode}
          physicsEnabled={physicsEnabled}
          playing={playing}
          onPlayEnd={onPlayEnd}
          reducedMotion={reducedMotion}
          autoOrbit={autoOrbit}
          keyFollowsCamera={keyFollowsCamera}
          keyLightRef={keyLightRef}
          fillLightRef={fillLightRef}
          rimLightRef={rimLightRef}
          hemiLightRef={hemiLightRef}
          logoGroupRef={logoGroupRef}
          dustGroupRef={dustGroupRef}
          bokehGroupRef={bokehGroupRef}
        />
      </Suspense>
    </Canvas>
  )
}
