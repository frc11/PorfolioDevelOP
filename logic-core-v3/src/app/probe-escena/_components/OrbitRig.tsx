'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { aimWithFraming } from './cameraFraming'
import {
  BOKEH_BOB_AMPLITUDE,
  BOKEH_BOB_PERIOD_S,
  BOKEH_SPIN_DEG_S,
  DUST_BOB_AMPLITUDE,
  DUST_BOB_PERIOD_S,
  DUST_SPIN_DEG_S,
  MOUSE_ANGLE_DEG,
  MOUSE_EPSILON,
  MOUSE_HEIGHT_FACTOR,
  MOUSE_TAU,
  SETTLE_EPSILON,
  SETTLE_TAU,
  VIRA_PITCH_DEG,
  VIRA_PITCH_PERIOD_S,
  VIRA_PITCH_PHASE,
  VIRA_UPDATES_SHADOW,
  VIRA_YAW_DEG,
  VIRA_YAW_PERIOD_S,
} from './choreographyPhysics'
import type { ChoreoEditor } from './choreographyEditor'
import {
  dampTowards,
  nearestKeyframeIndex,
  sampleLightArc,
  sampleTrack,
  shortestAngleDelta,
  tramoIndexAt,
  wrapAngle360,
} from './choreographySampler'
import {
  CHOREO_CHANNELS,
  type MutableChoreoPose,
  type MutableLightLevels,
} from './choreographyTypes'
import {
  applyLightRig,
  createLightRigCache,
  createLightRigInput,
  createLightRigTargets,
  type LightRigCache,
  type LightRigInput,
  type LightRigTargets,
} from './lightRig'
import type { MoireHandle } from './MoireScreen'
import { MOIRE_DRIFT_PERIOD_S } from './probeMoire'
import { KEY_AZIMUTH_DEG, KEY_ELEVATION_DEG, KEY_INTENSITY } from './probeLighting'
import { AUTO_ORBIT_DEG_PER_S, ORBIT_TARGET_Y } from './probeScene'
import type {
  ProbeMode,
  ProbeParamsStore,
  ProbeRigStore,
  ProbeStatsStore,
} from './probeStore'

/**
 * El único `useFrame` que gobierna la escena. Nada de acá toca React.
 *
 * ── Los tres modos ─────────────────────────────────────────────────────────
 *
 * **`manual`** — el probe de siempre, idéntico: los sliders mandan, la cámara
 * va exactamente donde dicen, sin inercia, sin mouse y sin vira. Es lo que
 * mantiene al instrumento sirviendo para componer posiciones nuevas con
 * precisión, y lo que hace que las mediciones ya publicadas sigan valiendo.
 * Acá el slider de intensidad es el **maestro del rig entero**: mueve el nivel,
 * y con él las tres luces, el ambiente y la niebla, igual que lo haría el arco.
 *
 * **`coreografia`** — el progreso 0→1 maneja la cámara a través del track y la
 * luz a través del arco, y los siete valores resultantes se PUBLICAN al store de
 * parámetros. Los sliders pasan a ser telemetría: muestran el valor exacto de
 * cada frame y la línea copiable sigue funcionando.
 *
 * **`editor`** (S5) — la misma matemática, clavada en el `at` del keyframe
 * seleccionado, sin física. Ahí el store de parámetros es ENTRADA para los cinco
 * canales de pose: lo escribe el humano con los sliders y el panel lo vuelca
 * sobre el keyframe, así que el loop **no publica la pose**. Sí publica los dos
 * valores de luz, que no son del keyframe sino del arco: es lo que hace que se
 * componga la pose con la luz que ese momento va a tener de verdad.
 *
 * ── La luz, desde S6 ───────────────────────────────────────────────────────
 *
 * Ya no es un par de canales de la pose. Es un **rig de tres puntos** (ver
 * `probeLighting.ts`) modulado por una **curva de progreso** (`LIGHT_ARC`), y
 * todo lo que este loop hace con eso es muestrear la curva y pasarle el
 * resultado a `applyLightRig` junto con dónde está la cámara — que el contraluz
 * necesita para ser contraluz en toda la órbita.
 *
 * ── El track es vivo ───────────────────────────────────────────────────────
 *
 * Sale de `editor.track`, que se rearma solo después de cada edición. Por eso lo
 * que se ajusta en modo `editor` es exactamente lo que `coreografia` reproduce,
 * sin recargar.
 *
 * ── La física, y qué queda afuera de lo que se publica ─────────────────────
 *
 * La inercia SÍ se publica (es la posición real de la cámara), pero el offset
 * de mouse y la vira NO: son modulación, no pose. Por eso la línea que se copia
 * del panel es la pose limpia del track, sin el mouse encima — que es lo único
 * que sirve para volver a pegarla como keyframe.
 *
 * ── La regla dura ──────────────────────────────────────────────────────────
 *
 * Cero `setState` por frame. Lo único que sale del loop hacia React es
 * `onPlayEnd`, y corre **una vez por pasada**, al llegar el progreso a 1.
 */

const VIRA_YAW_RAD = THREE.MathUtils.degToRad(VIRA_YAW_DEG)
const VIRA_PITCH_RAD = THREE.MathUtils.degToRad(VIRA_PITCH_DEG)
const DUST_SPIN_RAD_S = THREE.MathUtils.degToRad(DUST_SPIN_DEG_S)
const BOKEH_SPIN_RAD_S = THREE.MathUtils.degToRad(BOKEH_SPIN_DEG_S)
const TWO_PI = Math.PI * 2

/** Ventana de promediado del contador de FPS. */
const FPS_WINDOW_S = 0.5

function createPose(): MutableChoreoPose {
  return { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }
}

/** Los siete números que el panel muestra: los cinco de pose más los dos de luz. */
type PublishPatch = MutableChoreoPose & { keyIntensity: number; keyKelvin: number }

function createPatch(): PublishPatch {
  return { ...createPose(), keyIntensity: 0, keyKelvin: 0 }
}

/**
 * Estado mutable del loop. Va en un solo objeto creado una vez porque son
 * scratchpads, no estado de UI: se escriben en cada frame y nunca se leen desde
 * el render.
 */
type RigScratch = {
  /** La pose exacta que dicta el track en este progreso. */
  readonly target: MutableChoreoPose
  /** La pose amortiguada — la que la cámara realmente usa. */
  readonly live: MutableChoreoPose
  /** El paquete de los siete canales. Reusado: `setMany` no se lo queda. */
  readonly patch: PublishPatch
  /**
   * El paquete de SOLO los dos canales de luz, para el modo editor. Existe
   * aparte porque ahí publicar la pose sería pisarle el dato al keyframe que se
   * está componiendo (y el ángulo envuelto le comería la vuelta entera al
   * cierre, que es 360 y se publicaría como 0).
   */
  readonly lightPatch: { keyIntensity: number; keyKelvin: number }
  /** Lo que el arco dicta en este progreso. */
  readonly arc: MutableLightLevels
  /** Puntero amortiguado, en el rango [−1, 1] de r3f. */
  readonly mouse: { x: number; y: number }
  readonly lightTargets: LightRigTargets
  readonly lightInput: LightRigInput
  readonly lightCache: LightRigCache
}

type OrbitRigProps = {
  store: ProbeParamsStore
  rig: ProbeRigStore
  stats: ProbeStatsStore
  /**
   * El track vivo. Se lee `editor.track` por frame: es un getter con caché que
   * solo rearma la tabla de ángulos cuando una edición la invalidó.
   */
  editor: ChoreoEditor
  mode: ProbeMode
  /** Inercia + mouse + vira. Apagado deja ver el track crudo. */
  physicsEnabled: boolean
  playing: boolean
  /** Se dispara UNA vez, al terminar la pasada. Nunca por frame. */
  onPlayEnd: () => void
  autoOrbit: boolean
  keyFollowsCamera: boolean
  reducedMotion: boolean
  keyLightRef: RefObject<THREE.DirectionalLight | null>
  fillLightRef: RefObject<THREE.DirectionalLight | null>
  rimLightRef: RefObject<THREE.DirectionalLight | null>
  hemiLightRef: RefObject<THREE.HemisphereLight | null>
  /** El grupo que envuelve al logo. Es lo que balancea la vira. */
  logoGroupRef: RefObject<THREE.Group | null>
  /** Los dos campos de partículas. Es lo que deriva (ver `choreographyPhysics.ts`). */
  dustGroupRef: RefObject<THREE.Group | null>
  bokehGroupRef: RefObject<THREE.Group | null>
  /** El cuerpo del sol. Lo coloca `applyLightRig`, sobre el eje de la principal. */
  sunRef: RefObject<THREE.Sprite | null>
  /** La pantalla de rendijas. El loop le desplaza la trama que se mueve. */
  moireRef: RefObject<MoireHandle | null>
}

export function OrbitRig({
  store,
  rig,
  stats,
  editor,
  mode,
  physicsEnabled,
  playing,
  onPlayEnd,
  autoOrbit,
  keyFollowsCamera,
  reducedMotion,
  keyLightRef,
  fillLightRef,
  rimLightRef,
  hemiLightRef,
  logoGroupRef,
  dustGroupRef,
  bokehGroupRef,
  sunRef,
  moireRef,
}: OrbitRigProps) {
  const shadowModeRef = useRef<boolean | null>(null)
  const modeRef = useRef<ProbeMode | null>(null)
  const framesRef = useRef(0)
  const elapsedRef = useRef(0)
  // La niebla y el fondo se declaran en el JSX de `ProbeStage` y viven en la
  // escena, no en un ref: se resuelven en el primer frame y no se vuelven a
  // buscar. El `instanceof` corre una sola vez por cada uno.
  const fogRef = useRef<THREE.Fog | null>(null)
  const backgroundRef = useRef<THREE.Color | null>(null)

  // Un `useRef` y no un `useState`: estos objetos se ESCRIBEN en cada frame, y
  // `react-hooks/immutability` prohíbe —con razón— mutar lo que devuelve
  // `useState`. Un ref es la vía sancionada para estado mutable que no
  // participa del render. El literal se arma en cada render y React se queda
  // con el primero; acá renderiza solo cuando se hace click en algo, así que no
  // es un costo por frame.
  const scratchRef = useRef<RigScratch>({
    target: createPose(),
    live: createPose(),
    patch: createPatch(),
    lightPatch: { keyIntensity: 0, keyKelvin: 0 },
    arc: {
      level: 1,
      kelvin: 6500,
      azimuthDeg: KEY_AZIMUTH_DEG,
      elevationDeg: KEY_ELEVATION_DEG,
    },
    mouse: { x: 0, y: 0 },
    lightTargets: createLightRigTargets(),
    lightInput: createLightRigInput(),
    lightCache: createLightRigCache(),
  })

  useFrame((state, delta) => {
    const params = store.current
    const rigValues = rig.current
    const scratch = scratchRef.current
    const isChoreo = mode === 'coreografia'
    const isEditor = mode === 'editor'
    // `editor` es el track clavado en un keyframe: misma matemática, distinto
    // dueño de los cinco números de pose.
    const trackDriven = isChoreo || isEditor
    // La física es de la coreografía. En manual el instrumento queda limpio, en
    // el editor pelearía con el slider que se está arrastrando, y bajo
    // movimiento reducido no hay física en ningún modo.
    const physics = isChoreo && physicsEnabled && !reducedMotion

    // 0 · El shadow map se recalcula solo cuando puede haber cambiado.
    //
    // Con las luces fijas al mundo y el objeto quieto, el mapa de profundidad es
    // idéntico frame a frame: apagar `autoUpdate` saca una pasada de render
    // completa de cada frame sin cambiar un píxel. Que la CÁMARA se mueva no lo
    // invalida — una direccional solo depende de la luz y de quién proyecta, y
    // el contraluz, que sí sigue a la cámara, no proyecta ninguna.
    //
    // Lo que sí lo invalida es la vira, porque mueve al que proyecta. Sigue
    // siendo el gasto que `VIRA_UPDATES_SHADOW` permite apagar; desde S6 cuesta
    // la cuarta parte, porque el mapa bajó de 2048² a 1024².
    //
    // **Y desde S7 lo invalida algo más: el sol se mueve.** La principal recorre
    // un arco ligado al progreso, así que en cuanto el recorrido avanza la luz
    // cambia de dirección y la sombra con ella — que es justamente lo que hace
    // que el espacio se lea como real. Por eso `trackDriven` entra en la cuenta.
    // No suma costo sobre lo que ya había: en coreografía la vira ya obligaba a
    // recalcular el mapa en cada cuadro. En manual, con el sol quieto y sin
    // vira, el mapa sigue congelándose como desde S4.
    //
    // Va acá y no en un `useEffect` porque `state.gl` es el argumento del loop:
    // mutar el renderer que devuelve `useThree` es lo que la regla
    // `react-hooks/immutability` prohíbe, con razón.
    const shadowMoves = keyFollowsCamera || trackDriven || (physics && VIRA_UPDATES_SHADOW)
    if (shadowModeRef.current !== shadowMoves) {
      state.gl.shadowMap.autoUpdate = shadowMoves
      state.gl.shadowMap.needsUpdate = true
      shadowModeRef.current = shadowMoves
    }

    // 1 · De dónde salen los cinco números de pose de este frame.
    let angleDeg: number
    let height: number
    let distance: number
    let frameX: number
    let frameY: number

    const { target, live, patch, lightPatch, arc } = scratch

    if (trackDriven) {
      const track = editor.track

      // 1a · Avanzar el progreso si está reproduciendo. El guard `< 1` es lo que
      //      impide que `onPlayEnd` se dispare en cada frame posterior al final
      //      mientras React todavía no procesó el cambio de estado.
      //
      //      Solo en coreografía: en el editor el progreso lo clava el keyframe
      //      seleccionado y reproducir movería la cámara lejos de lo que se está
      //      ajustando.
      if (isChoreo && playing && rigValues.progress < 1) {
        const next = rigValues.progress + rigValues.playSpeed * delta
        if (next >= 1) {
          rig.set('progress', 1)
          onPlayEnd()
        } else {
          rig.set('progress', next)
        }
      }

      const progress = rigValues.progress
      sampleTrack(track, progress, target)
      sampleLightArc(progress, arc)

      // 1b · Al ENTRAR al modo, la pose amortiguada arranca desde donde estaban
      //      los sliders: el cambio de modo desliza en vez de saltar.
      //
      //      El ángulo no se copia crudo: `params.angleDeg` está envuelto a
      //      0–360 y `live.angleDeg` es acumulado, así que copiar 0 contra un
      //      objetivo de 360 mandaría a la cámara a dar una vuelta entera para
      //      llegar al mismo lugar. Se siembra con la representación más cercana
      //      al objetivo, que es visualmente el mismo ángulo.
      if (modeRef.current !== mode) {
        live.angleDeg =
          target.angleDeg + shortestAngleDelta(target.angleDeg, params.angleDeg)
        live.height = params.height
        live.distance = params.distance
        live.frameX = params.frameX
        live.frameY = params.frameY
        modeRef.current = mode
      }

      // 1c · Inercia: la cámara PERSIGUE la pose del progreso, no salta a ella.
      //      Cuando el progreso se detiene, sigue asentándose un momento.
      const settleScale = rigValues.settleScale
      for (const channel of CHOREO_CHANNELS) {
        live[channel] = physics
          ? dampTowards(
              live[channel],
              target[channel],
              SETTLE_TAU[channel] * settleScale,
              SETTLE_EPSILON[channel],
              delta
            )
          : target[channel]
      }

      // 1d · Publicar al panel. UNA notificación para todos los canales, no una
      //      por canal: con `set` esto serían decenas de llamadas de listener
      //      por frame para publicar un solo estado.
      //
      //      El ángulo se publica ENVUELTO a 0–360 (el slider vive en ese
      //      rango); la cámara usa el acumulado, que es el que da la vuelta.
      //
      //      **En el editor se publica SOLO la luz, y no es un ahorro: es
      //      correctitud.** Ahí los cinco de pose son entrada y el panel vuelca
      //      lo que dicen sobre el keyframe; si el loop escribiera encima, el
      //      ángulo envuelto le pisaría el dato al cierre —360 se publicaría
      //      como 0— y la vuelta entera se perdería sola. Los dos de luz sí van:
      //      no son del keyframe, son del arco, y verlos es la mitad de poder
      //      componer una pose para el momento que le toca.
      if (isChoreo) {
        patch.angleDeg = wrapAngle360(live.angleDeg)
        patch.height = live.height
        patch.distance = live.distance
        patch.frameX = live.frameX
        patch.frameY = live.frameY
        patch.keyIntensity = KEY_INTENSITY * arc.level
        patch.keyKelvin = arc.kelvin
        store.setMany(patch)

        // 1e · Lectura del tramo y del keyframe más cercano. Índices, no
        //      nombres: el store solo transporta números y el panel los
        //      traduce. En el editor la lectura la da la lista, que nombra al
        //      keyframe seleccionado sin pasar por el loop.
        rig.set('tramoIndex', tramoIndexAt(progress))
        rig.set('keyframeIndex', nearestKeyframeIndex(track, progress))
      } else {
        lightPatch.keyIntensity = KEY_INTENSITY * arc.level
        lightPatch.keyKelvin = arc.kelvin
        store.setMany(lightPatch)
      }

      angleDeg = live.angleDeg
      height = live.height
      distance = live.distance
      frameX = live.frameX
      frameY = live.frameY
    } else {
      modeRef.current = 'manual'

      // Órbita automática, solo en manual: en coreografía pelearía con el track
      // por el mismo valor. `delta` viene acotado por r3f, así que un frame
      // largo (pestaña que vuelve del fondo) no pega un salto de ángulo.
      if (autoOrbit) {
        store.set('angleDeg', (params.angleDeg + AUTO_ORBIT_DEG_PER_S * delta) % 360)
      }

      angleDeg = params.angleDeg
      height = params.height
      distance = params.distance
      frameX = params.frameX
      frameY = params.frameY

      // El slider de intensidad es el maestro del rig: se lo lee como una
      // FRACCIÓN de la luz plena, así que mover uno solo sube y baja las tres
      // luces, el ambiente y la niebla con las mismas proporciones que usa el
      // arco. Un slider que moviera únicamente la principal daría un modo manual
      // que se ilumina distinto que la coreografía, y ahí las mediciones
      // dejarían de ser comparables.
      arc.level = params.keyIntensity / KEY_INTENSITY
      arc.kelvin = params.keyKelvin
    }

    // 2 · Offset de mouse. MODULA la posición del progreso, no la reemplaza.
    //
    // El feed es `state.pointer` de r3f — sin listener propio, por la lección ya
    // documentada del repo: r3f v9 lo actualiza por su cuenta sobre la caja del
    // canvas. Se amortigua con su propia constante de tiempo para que arrastre
    // en vez de saltar.
    //
    // La altura se escala por la distancia: así el desplazamiento EN PANTALLA es
    // el mismo a 6,3 que a 30. Un offset fijo en unidades de mundo sería un
    // cimbronazo de cerca y nada de lejos.
    const { mouse } = scratch
    if (physics) {
      mouse.x = dampTowards(mouse.x, state.pointer.x, MOUSE_TAU, MOUSE_EPSILON, delta)
      mouse.y = dampTowards(mouse.y, state.pointer.y, MOUSE_TAU, MOUSE_EPSILON, delta)

      const magnitude = rigValues.mouseScale
      angleDeg += mouse.x * MOUSE_ANGLE_DEG * magnitude
      height += mouse.y * MOUSE_HEIGHT_FACTOR * distance * magnitude
    } else {
      mouse.x = 0
      mouse.y = 0
    }

    // 3 · Cámara sobre la órbita. Ángulo 0° = de frente al logo (se lee bien);
    // 90° y 270° son los perfiles; 180° es de atrás, con el logo espejado.
    const azimuth = THREE.MathUtils.degToRad(angleDeg)
    state.camera.position.set(
      Math.sin(azimuth) * distance,
      height,
      Math.cos(azimuth) * distance
    )
    state.camera.lookAt(0, ORBIT_TARGET_Y, 0)

    // 3b · Encuadre: correr el logo a un costado de la pantalla moviendo el
    //      TARGET y no la cámara. La geometría está en `cameraFraming.ts`.
    const logoWidth = stats.current.logoW
    const logoHeight = stats.current.logoH

    if ((frameX !== 0 || frameY !== 0) && logoWidth > 0 && logoHeight > 0) {
      aimWithFraming(
        state.camera,
        state.size.width / Math.max(1, state.size.height),
        logoWidth,
        logoHeight,
        Math.hypot(distance, height - ORBIT_TARGET_Y),
        frameX,
        frameY
      )
    }

    // 4 · El rig de luz entero: las tres luces, el hemisférico, la niebla y el
    //     fondo. El contraluz necesita saber dónde está la cámara —en azimut y
    //     en altura— porque es lo único que lo hace ser contraluz en toda la
    //     órbita; ver la nota larga en `probeLighting.ts`.
    if (!fogRef.current && state.scene.fog instanceof THREE.Fog) {
      fogRef.current = state.scene.fog
    }
    if (!backgroundRef.current && state.scene.background instanceof THREE.Color) {
      backgroundRef.current = state.scene.background
    }

    const targets = scratch.lightTargets
    targets.key = keyLightRef.current
    targets.fill = fillLightRef.current
    targets.rim = rimLightRef.current
    targets.hemi = hemiLightRef.current
    targets.fog = fogRef.current
    targets.background = backgroundRef.current
    targets.sun = sunRef.current

    const lightInput = scratch.lightInput
    lightInput.level = arc.level
    lightInput.kelvin = arc.kelvin
    lightInput.sunAzimuthDeg = arc.azimuthDeg
    lightInput.sunElevationDeg = arc.elevationDeg
    lightInput.cameraAzimuth = azimuth
    lightInput.cameraHeight = height
    lightInput.followsCamera = keyFollowsCamera

    applyLightRig(targets, lightInput, scratch.lightCache)

    // 5 · Vira en reposo: balanceo lento y continuo del logo. Dos senos de
    // período inconmensurable (13 y 9,5 s) para que la combinación no se lea
    // como un bucle. Es lo que evita que la escena parezca congelada cuando el
    // progreso está quieto.
    const elapsed = state.clock.elapsedTime
    const logoGroup = logoGroupRef.current
    if (logoGroup) {
      if (physics) {
        logoGroup.rotation.y = Math.sin((elapsed / VIRA_YAW_PERIOD_S) * TWO_PI) * VIRA_YAW_RAD
        logoGroup.rotation.x =
          Math.sin((elapsed / VIRA_PITCH_PERIOD_S) * TWO_PI + VIRA_PITCH_PHASE) *
          VIRA_PITCH_RAD
      } else if (logoGroup.rotation.x !== 0 || logoGroup.rotation.y !== 0) {
        logoGroup.rotation.set(0, 0, 0)
      }
    }

    // 6 · La deriva del aire: los dos campos de partículas giran despacio sobre
    // el eje vertical, en sentidos opuestos y con períodos inconmensurables.
    // Una matriz por campo y cero costo por partícula — el porqué está en
    // `choreographyPhysics.ts`. A diferencia de la vira, esto NO se apaga con la
    // física: apagar la física es para juzgar el track crudo de la cámara, y el
    // aire no interfiere con eso. Sí se apaga con movimiento reducido.
    const dust = dustGroupRef.current
    if (dust) {
      if (reducedMotion) {
        if (dust.rotation.y !== 0) dust.rotation.y = 0
        if (dust.position.y !== 0) dust.position.y = 0
      } else {
        dust.rotation.y = elapsed * DUST_SPIN_RAD_S
        dust.position.y =
          Math.sin((elapsed / DUST_BOB_PERIOD_S) * TWO_PI) * DUST_BOB_AMPLITUDE
      }
    }

    const bokeh = bokehGroupRef.current
    if (bokeh) {
      if (reducedMotion) {
        if (bokeh.rotation.y !== 0) bokeh.rotation.y = 0
        if (bokeh.position.y !== 0) bokeh.position.y = 0
      } else {
        bokeh.rotation.y = elapsed * BOKEH_SPIN_RAD_S
        bokeh.position.y =
          Math.sin((elapsed / BOKEH_BOB_PERIOD_S) * TWO_PI) * BOKEH_BOB_AMPLITUDE
      }
    }

    // 6b · La trama de rendijas que se desplaza. UNA escritura por frame sobre el
    //      `offset` de una textura: el moiré no cuesta nada por píxel de más que
    //      la propia superficie, porque lo que se mueve es la matriz de UV.
    //
    //      El módulo mantiene el offset en [0,1): la textura repite, así que
    //      envolver es invisible y evita que el número crezca sin techo durante
    //      una sesión larga.
    //
    //      Se apaga con movimiento reducido, igual que la deriva del aire y la
    //      vira. NO se apaga con el toggle de física: apagar la física es para
    //      juzgar el track crudo de la cámara y el fondo no interfiere con eso.
    const moire = moireRef.current
    if (moire) {
      moire.slats.offset.x = reducedMotion ? 0 : (elapsed / MOIRE_DRIFT_PERIOD_S) % 1
    }

    // 7 · FPS promediado en ventanas de medio segundo. Sin promedio el número
    // titila tanto que no se puede leer mientras se juzga la escena.
    framesRef.current += 1
    elapsedRef.current += delta
    if (elapsedRef.current >= FPS_WINDOW_S) {
      stats.set('fps', Math.round(framesRef.current / elapsedRef.current))
      framesRef.current = 0
      elapsedRef.current = 0
    }
  })

  return null
}
