'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import * as THREE from 'three'

import {
  CHOREO_CHANNELS,
  CHOREO_KEYFRAMES,
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
  type MutableChoreoPose,
} from './choreography'
import {
  buildTrack,
  dampTowards,
  nearestKeyframeIndex,
  sampleTrack,
  shortestAngleDelta,
  tramoIndexAt,
  wrapAngle360,
} from './choreographySampler'
import {
  AUTO_ORBIT_DEG_PER_S,
  CAMERA_FOV,
  FRAME_TRAVEL_SAFETY,
  KEY_FOLLOW,
  KEY_LIGHT_POSITION,
  ORBIT_TARGET_Y,
  kelvinToSrgb,
} from './probeScene'
import type {
  ProbeMode,
  ProbeParamsStore,
  ProbeRigStore,
  ProbeStatsStore,
} from './probeStore'

/**
 * El único `useFrame` que gobierna la escena. Nada de acá toca React.
 *
 * ── Los dos modos ──────────────────────────────────────────────────────────
 *
 * **`manual`** — el probe de siempre, idéntico: los sliders mandan, la cámara
 * va exactamente donde dicen, sin inercia, sin mouse y sin vira. Es lo que
 * mantiene al instrumento sirviendo para componer posiciones nuevas con
 * precisión, y lo que hace que las mediciones ya publicadas sigan valiendo.
 *
 * **`coreografia`** — el progreso 0→1 maneja la cámara a través del track, y
 * los siete canales resultantes se PUBLICAN al store de parámetros. Los sliders
 * pasan a ser telemetría: muestran el valor exacto de cada frame y la línea
 * copiable sigue funcionando, así que scrubear y copiar una pose es el flujo de
 * calibración.
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

// Temporales del loop, izados al módulo: el `useFrame` corre 60+ veces por
// segundo y no puede ir dejando tres Vector3 por frame para el recolector.
const SCREEN_RIGHT = new THREE.Vector3()
const SCREEN_UP = new THREE.Vector3()
const AIM_TARGET = new THREE.Vector3()

/**
 * El track se construye UNA vez, al importar el módulo: desenvolver el ángulo y
 * validar el orden de los keyframes no depende de nada en runtime. Si los datos
 * estuvieran mal, esto tira acá — y el `StageErrorBoundary` lo contiene.
 */
const TRACK = buildTrack(CHOREO_KEYFRAMES)

const VIRA_YAW_RAD = THREE.MathUtils.degToRad(VIRA_YAW_DEG)
const VIRA_PITCH_RAD = THREE.MathUtils.degToRad(VIRA_PITCH_DEG)
const TWO_PI = Math.PI * 2

/** Ventana de promediado del contador de FPS. */
const FPS_WINDOW_S = 0.5

function createPose(): MutableChoreoPose {
  return {
    angleDeg: 0,
    height: 0,
    distance: 0,
    frameX: 0,
    frameY: 0,
    keyIntensity: 0,
    keyKelvin: 0,
  }
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
  /** El paquete que se publica al store. Reusado: `setMany` no se lo queda. */
  readonly patch: MutableChoreoPose
  /** Puntero amortiguado, en el rango [−1, 1] de r3f. */
  readonly mouse: { x: number; y: number }
}

type OrbitRigProps = {
  store: ProbeParamsStore
  rig: ProbeRigStore
  stats: ProbeStatsStore
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
  /** El grupo que envuelve al logo. Es lo que balancea la vira. */
  logoGroupRef: RefObject<THREE.Group | null>
}

export function OrbitRig({
  store,
  rig,
  stats,
  mode,
  physicsEnabled,
  playing,
  onPlayEnd,
  autoOrbit,
  keyFollowsCamera,
  reducedMotion,
  keyLightRef,
  logoGroupRef,
}: OrbitRigProps) {
  const lastKelvinRef = useRef(-1)
  const shadowModeRef = useRef<boolean | null>(null)
  const modeRef = useRef<ProbeMode | null>(null)
  const framesRef = useRef(0)
  const elapsedRef = useRef(0)

  // Un `useRef` y no un `useState`: estos objetos se ESCRIBEN en cada frame, y
  // `react-hooks/immutability` prohíbe —con razón— mutar lo que devuelve
  // `useState`. Un ref es la vía sancionada para estado mutable que no
  // participa del render. El literal se arma en cada render y React se queda
  // con el primero; acá renderiza solo cuando se hace click en algo, así que no
  // es un costo por frame.
  const scratchRef = useRef<RigScratch>({
    target: createPose(),
    live: createPose(),
    patch: createPose(),
    mouse: { x: 0, y: 0 },
  })

  useFrame((state, delta) => {
    const params = store.current
    const rigValues = rig.current
    const isChoreo = mode === 'coreografia'
    // La física es de la coreografía. En manual el instrumento queda limpio, y
    // bajo movimiento reducido no hay física en ningún modo.
    const physics = isChoreo && physicsEnabled && !reducedMotion

    // 0 · El shadow map se recalcula solo cuando puede haber cambiado.
    //
    // Con las luces fijas al mundo y el objeto quieto, el mapa de profundidad es
    // idéntico frame a frame: apagar `autoUpdate` saca una pasada de render
    // completa de cada frame sin cambiar un píxel. Que la CÁMARA se mueva no lo
    // invalida — una direccional solo depende de la luz y de quién proyecta.
    //
    // Lo que sí lo invalida es la vira, porque mueve al que proyecta. Es el
    // gasto nuevo más grande de este sprint y está detrás de
    // `VIRA_UPDATES_SHADOW` para poder apagarlo.
    //
    // Va acá y no en un `useEffect` porque `state.gl` es el argumento del loop:
    // mutar el renderer que devuelve `useThree` es lo que la regla
    // `react-hooks/immutability` prohíbe, con razón.
    const shadowMoves = keyFollowsCamera || (physics && VIRA_UPDATES_SHADOW)
    if (shadowModeRef.current !== shadowMoves) {
      state.gl.shadowMap.autoUpdate = shadowMoves
      state.gl.shadowMap.needsUpdate = true
      shadowModeRef.current = shadowMoves
    }

    // 1 · De dónde salen los siete números de este frame.
    let angleDeg: number
    let height: number
    let distance: number
    let frameX: number
    let frameY: number
    let keyIntensity: number
    let keyKelvin: number

    if (isChoreo) {
      const { target, live, patch } = scratchRef.current

      // 1a · Avanzar el progreso si está reproduciendo. El guard `< 1` es lo que
      //      impide que `onPlayEnd` se dispare en cada frame posterior al final
      //      mientras React todavía no procesó el cambio de estado.
      if (playing && rigValues.progress < 1) {
        const next = rigValues.progress + rigValues.playSpeed * delta
        if (next >= 1) {
          rig.set('progress', 1)
          onPlayEnd()
        } else {
          rig.set('progress', next)
        }
      }

      const progress = rigValues.progress
      sampleTrack(TRACK, progress, target)

      // 1b · Al ENTRAR al modo, la pose amortiguada arranca desde donde estaban
      //      los sliders: el cambio de modo desliza en vez de saltar.
      //
      //      El ángulo no se copia crudo: `params.angleDeg` está envuelto a
      //      0–360 y `live.angleDeg` es acumulado, así que copiar 0 contra un
      //      objetivo de 360 mandaría a la cámara a dar una vuelta entera para
      //      llegar al mismo lugar. Se siembra con la representación más cercana
      //      al objetivo, que es visualmente el mismo ángulo.
      if (modeRef.current !== 'coreografia') {
        live.angleDeg =
          target.angleDeg + shortestAngleDelta(target.angleDeg, params.angleDeg)
        live.height = params.height
        live.distance = params.distance
        live.frameX = params.frameX
        live.frameY = params.frameY
        live.keyIntensity = params.keyIntensity
        live.keyKelvin = params.keyKelvin
        modeRef.current = 'coreografia'
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

      // 1d · Publicar al panel. UNA notificación para los siete canales, no
      //      siete: con `set` esto serían setenta llamadas de listener por
      //      frame para publicar un solo estado.
      //
      //      El ángulo se publica ENVUELTO a 0–360 (el slider vive en ese
      //      rango); la cámara usa el acumulado, que es el que da la vuelta.
      patch.angleDeg = wrapAngle360(live.angleDeg)
      patch.height = live.height
      patch.distance = live.distance
      patch.frameX = live.frameX
      patch.frameY = live.frameY
      patch.keyIntensity = live.keyIntensity
      patch.keyKelvin = live.keyKelvin
      store.setMany(patch)

      // 1e · Lectura del tramo y del keyframe más cercano. Índices, no nombres:
      //      el store solo transporta números y el panel los traduce.
      rig.set('tramoIndex', tramoIndexAt(progress))
      rig.set('keyframeIndex', nearestKeyframeIndex(TRACK, progress))

      angleDeg = live.angleDeg
      height = live.height
      distance = live.distance
      frameX = live.frameX
      frameY = live.frameY
      keyIntensity = live.keyIntensity
      keyKelvin = live.keyKelvin
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
      keyIntensity = params.keyIntensity
      keyKelvin = params.keyKelvin
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
    const { mouse } = scratchRef.current
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

    // 3b · Encuadre: correr el logo a un costado de la pantalla.
    //
    // Se mueve el TARGET, no la cámara: la posición la fijan ángulo/altura/
    // distancia, así que `angleDeg` sigue significando exactamente "desde qué
    // ángulo se lo mira" por más corrido que esté el logo en pantalla.
    //
    // El offset va en la base de PANTALLA de la cámara (su derecha y su arriba),
    // no en ejes de mundo. Con ejes de mundo el control se rompería al orbitar:
    // en 90° un offset en X mundo apunta hacia la cámara, así que "correr a la
    // derecha" pasaría a ser "acercar".
    //
    // Signo: para que el logo se vea a la DERECHA hay que apuntar a su
    // IZQUIERDA — de ahí el menos.
    const logoWidth = stats.current.logoW
    const logoHeight = stats.current.logoH

    if ((frameX !== 0 || frameY !== 0) && logoWidth > 0 && logoHeight > 0) {
      // Recorrido disponible: cuánto puede correrse el centro del logo antes de
      // que su caja toque el borde. Se calcula por frame porque depende de la
      // distancia y del aspecto del canvas — por eso ±1 es "pegado al costado"
      // en cualquier ventana, y no un desplazamiento fijo en unidades de mundo.
      //
      // La caja es la del logo QUIETO, no su ancho proyectado en este ángulo. A
      // propósito: si el recorrido se achicara al pasar por el perfil, el objeto
      // se deslizaría solo en pantalla mientras la órbita corre.
      const eyeDistance = Math.hypot(distance, height - ORBIT_TARGET_Y)
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV) / 2) * eyeDistance
      const halfWidth = halfHeight * (state.size.width / Math.max(1, state.size.height))

      const travelX = Math.max(0, halfWidth - logoWidth / 2) * FRAME_TRAVEL_SAFETY
      const travelY = Math.max(0, halfHeight - logoHeight / 2) * FRAME_TRAVEL_SAFETY

      SCREEN_RIGHT.set(1, 0, 0).applyQuaternion(state.camera.quaternion)
      SCREEN_UP.set(0, 1, 0).applyQuaternion(state.camera.quaternion)

      AIM_TARGET.set(0, ORBIT_TARGET_Y, 0)
        .addScaledVector(SCREEN_RIGHT, -frameX * travelX)
        .addScaledVector(SCREEN_UP, -frameY * travelY)

      state.camera.lookAt(AIM_TARGET)
    }

    // 4 · Luz principal. El apagado del cierre (3,40 → 0,20 y 6500 → 7850 K)
    // entra por acá como cualquier otro canal del track.
    const keyLight = keyLightRef.current
    if (keyLight) {
      keyLight.intensity = keyIntensity

      // El color solo se recalcula cuando el kelvin cambió: la conversión no es
      // cara, pero correrla por frame para nada es exactamente el tipo de costo
      // que después no se encuentra.
      if (keyKelvin !== lastKelvinRef.current) {
        const { r, g, b } = kelvinToSrgb(keyKelvin)
        keyLight.color.setRGB(r, g, b, THREE.SRGBColorSpace)
        lastKelvinRef.current = keyKelvin
      }

      if (keyFollowsCamera) {
        const keyAzimuth = azimuth + THREE.MathUtils.degToRad(KEY_FOLLOW.azimuthOffsetDeg)
        keyLight.position.set(
          Math.sin(keyAzimuth) * KEY_FOLLOW.distance,
          KEY_FOLLOW.height,
          Math.cos(keyAzimuth) * KEY_FOLLOW.distance
        )
      } else {
        keyLight.position.set(...KEY_LIGHT_POSITION)
      }
    }

    // 5 · Vira en reposo: balanceo lento y continuo del logo. Dos senos de
    // período inconmensurable (13 y 9,5 s) para que la combinación no se lea
    // como un bucle. Es lo que evita que la escena parezca congelada cuando el
    // progreso está quieto.
    const logoGroup = logoGroupRef.current
    if (logoGroup) {
      if (physics) {
        const elapsed = state.clock.elapsedTime
        logoGroup.rotation.y =
          Math.sin((elapsed / VIRA_YAW_PERIOD_S) * TWO_PI) * VIRA_YAW_RAD
        logoGroup.rotation.x =
          Math.sin((elapsed / VIRA_PITCH_PERIOD_S) * TWO_PI + VIRA_PITCH_PHASE) *
          VIRA_PITCH_RAD
      } else if (logoGroup.rotation.x !== 0 || logoGroup.rotation.y !== 0) {
        logoGroup.rotation.set(0, 0, 0)
      }
    }

    // 6 · FPS promediado en ventanas de medio segundo. Sin promedio el número
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
