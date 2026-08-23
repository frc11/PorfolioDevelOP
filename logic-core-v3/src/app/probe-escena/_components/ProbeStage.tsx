'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'

import { BokehParticles } from './BokehParticles'
import type { ChoreoEditor } from './choreographyEditor'
import { ContactOcclusion } from './ContactOcclusion'
import { DepthParticles } from './DepthParticles'
import { MoireScreen, type MoireHandle } from './MoireScreen'
import { OrbitRig } from './OrbitRig'
import { SunBody } from './SunBody'
import { SunWashout } from './SunWashout'
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
 * La escena. **Cinco cosas y nada más** (S10): el piso con sus marcas, la
 * envolvente de rendijas, el sol, las partículas y el logo.
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
 * **El mundo, vaciado en S10.** S5 lo había poblado con once planos
 * suspendidos, una retícula aérea y tres pilares; los tres se borraron, y con
 * ellos los arcos sueltos del logo. El argumento es uno solo: **geometría sin
 * significado**. Lo que queda tiene todo una razón — el piso da escala y ancla el
 * logo, la envolvente es el fondo con vida, el sol es la fuente que se ve, las
 * partículas son el aire y el logo es la pieza.
 *
 * No hay una sola imagen de "tecnología": ni nodos, ni circuitos, ni pantallas,
 * ni engranajes. Nada orgánico tampoco. Geometría, y nada más que geometría.
 *
 * **La atmósfera, en S6.** Tres puntos de luz en vez de dos, niebla lineal,
 * sombra cuatro veces más barata con una penumbra que ahora se elige, y una
 * oclusión de contacto debajo del logo. Los números y sus porqués están en
 * `probeLighting.ts` (el rig) y `probeAtmosphere.ts` (niebla, sombra y
 * contacto); acá solo se cablean.
 *
 * La regla que ordena todo lo que se agrega: **nada brilla por sí mismo** —todo
 * responde a las mismas luces, así que la sala entera se apaga con el cierre; la
 * única excepción es el sol, que es una fuente, y aun así se apaga con el arco— y
 * **nada compite en peso visual con el logo**, que sigue siendo el único negro
 * puro del cuadro.
 *
 * ⚠️ **El orden de dibujo de los transparentes es explícito y no accidental.**
 * three ordena por la posición del OBJETO, y los cilindros de la envolvente están
 * centrados en el origen: sin `renderOrder` la envolvente se dibuja encima del
 * sol. La cadena queda gruesa → fina → washout → sol → partículas. Ver la nota de
 * `probeMoire.ts`.
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
  /**
   * El cuerpo del sol, su washout y la envolvente de rendijas. Los tres siguen la
   * misma regla que los grupos de arriba: el componente declara la pieza, el
   * único `useFrame` de la escena la mueve.
   */
  const sunRef = useRef<THREE.Sprite>(null)
  const sunWashoutRef = useRef<THREE.Sprite>(null)
  const moireRef = useRef<MoireHandle>(null)

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

        {/*
          EL SOL (S7). No es un objeto más: es el CUERPO de la principal, puesto
          sobre su mismo eje por `applyLightRig` en el mismo frame en que la
          coloca. La escena tenía luz sin fuente; ahora la sombra viene de algo
          que se ve. Su posición y su opacidad las escribe el rig — acá solo se
          declara la pieza. El porqué de cada número está en `probeSun.ts`.
        */}
        <SunBody ref={sunRef} />

        {/*
          EL WASHOUT (S10). El disco aditivo que apaga la trama de la envolvente
          donde el sol pasa. Va sobre el mismo eje que el cuerpo y lo coloca el
          mismo `applyLightRig`. Arranca bajo a propósito: el contraste ya lo
          resolvió el fondo oscuro, y todo lo que este disco suba se lo come.
        */}
        <SunWashout ref={sunWashoutRef} />

        <group ref={logoGroupRef}>
          <ProbeLogo stats={stats} onReady={onReady} />
        </group>

        <StudioFloor />
        <ContactOcclusion />

        {/*
          LA ENVOLVENTE DE RENDIJAS (S10). Dos cilindros coaxiales alrededor de la
          escena, cada uno con una trama de cuadrados derivada del vocabulario del
          sitio: la gruesa es la retícula del hero y BAJA como allá, la fina es la
          misma a la mitad del paso con un punto en cada cruce.

          **Separadas en profundidad**, que es el cambio respecto de S7: la
          separación produce paralaje, así que al orbitar las dos capas se
          desalinean solas y el moiré cambia con el movimiento además del batido
          de la textura.

          Dos draw calls y dos superficies transparentes que cubren el 51% y el
          57% del cuadro en promedio. El aliasing está medido en las DOS
          direcciones contra los cinco recorridos: 26 veces de margen. Los números
          están en `probeMoire.ts`.
        */}
        <MoireScreen ref={moireRef} store={store} />

        {/*
          Los dos campos van en grupos propios porque el rig los hace DERIVAR.
          Cada uno contiene una concha por radio, y el rig gira cada concha a su
          propio ritmo —la interior más rápido—: es rotación diferencial, una
          matriz por concha y cero costo por partícula. El porqué está en
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
          sunRef={sunRef}
          sunWashoutRef={sunWashoutRef}
          moireRef={moireRef}
        />
      </Suspense>
    </Canvas>
  )
}
