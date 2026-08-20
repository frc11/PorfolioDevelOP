import * as THREE from 'three'

import {
  FILL_AZIMUTH_DEG,
  FILL_DISTANCE,
  FILL_ELEVATION_DEG,
  FILL_FOLLOW_AZIMUTH_OFFSET_DEG,
  FILL_INTENSITY,
  FOG_DIM_GAMMA,
  HEMI_DIM_GAMMA,
  HEMI_INTENSITY,
  KEY_AZIMUTH_DEG,
  KEY_DISTANCE,
  KEY_ELEVATION_DEG,
  KEY_FOLLOW_AZIMUTH_OFFSET_DEG,
  KEY_INTENSITY,
  RIM_AZIMUTH_OFFSET_DEG,
  RIM_DIM_SHARE,
  RIM_DISTANCE,
  RIM_HEIGHT_BASE,
  RIM_HEIGHT_TRACK,
  RIM_INTENSITY,
} from './probeLighting'
import { FOG_COLOR } from './probeAtmosphere'
import { kelvinToSrgb } from './probeScene'

/**
 * LA APLICACIÓN DEL RIG DE LUZ — lo que el `useFrame` escribe cada cuadro.
 *
 * Vive afuera de `OrbitRig.tsx` porque es una función sobre objetos de three sin
 * nada de React adentro: se puede leer, contar y corregir sin entrar al loop.
 * El porqué de cada número está en `probeLighting.ts`; acá está el cómo.
 *
 * ── Las dos cosas que no se recalculan por frame ───────────────────────────
 *
 * La conversión de kelvin a color y el color de la niebla son cuentas baratas
 * pero **constantes durante tramos enteros del recorrido** (la meseta del arco
 * dura media coreografía). El caché guarda el último valor de cada una y
 * compara: correr una conversión por frame para escribir el mismo número es
 * exactamente el tipo de costo que después no se encuentra.
 */

/**
 * Los objetos de three que el rig maneja. Cualquiera puede ser `null`: el canvas
 * monta por partes.
 *
 * **Es mutable a propósito**, igual que la entrada de abajo: el loop guarda una
 * sola instancia de cada uno y le reescribe los campos por frame. Un literal
 * nuevo en cada cuadro sería dejarle dos objetos por frame al recolector, que es
 * exactamente lo que la disciplina de este módulo no hace.
 */
export type LightRigTargets = {
  key: THREE.DirectionalLight | null
  fill: THREE.DirectionalLight | null
  rim: THREE.DirectionalLight | null
  hemi: THREE.HemisphereLight | null
  fog: THREE.Fog | null
  /** El color de fondo de la escena, si es un color plano. Sigue a la niebla. */
  background: THREE.Color | null
}

export function createLightRigTargets(): LightRigTargets {
  return { key: null, fill: null, rim: null, hemi: null, fog: null, background: null }
}

/** Lo que el rig necesita saber de este frame. */
export type LightRigInput = {
  /** Nivel general del arco. 1 = luz plena. */
  level: number
  kelvin: number
  /** Azimut de la cámara, en radianes. El rim es solidario a él. */
  cameraAzimuth: number
  /** Altura de la cámara. El rim la sigue (ver la tabla en `probeLighting.ts`). */
  cameraHeight: number
  /** El toggle del panel: la principal y el relleno pasan a ser solidarios. */
  followsCamera: boolean
}

export function createLightRigInput(): LightRigInput {
  return { level: 1, kelvin: 6500, cameraAzimuth: 0, cameraHeight: 0, followsCamera: false }
}

export type LightRigCache = {
  lastKelvin: number
  lastFogLevel: number
  readonly warm: THREE.Color
  readonly fogBase: THREE.Color
  readonly fogTint: THREE.Color
}

export function createLightRigCache(): LightRigCache {
  return {
    // −1 fuerza el primer cálculo: ningún kelvin ni nivel real puede valer eso.
    lastKelvin: -1,
    lastFogLevel: -1,
    warm: new THREE.Color(),
    // El color entra desde una cadena sRGB, así que three lo guarda ya en
    // espacio lineal: multiplicarlo por el nivel es apagarlo de verdad, no
    // oscurecer un valor con gamma adentro.
    fogBase: new THREE.Color(FOG_COLOR),
    fogTint: new THREE.Color(),
  }
}

const RAD = Math.PI / 180

/** Posición de una luz fija, en polares alrededor del origen. */
function place(
  light: THREE.DirectionalLight,
  azimuthDeg: number,
  elevationDeg: number,
  distance: number
): void {
  const azimuth = azimuthDeg * RAD
  const elevation = elevationDeg * RAD
  const horizontal = Math.cos(elevation) * distance

  light.position.set(
    Math.sin(azimuth) * horizontal,
    Math.sin(elevation) * distance,
    Math.cos(azimuth) * horizontal
  )
}

/** Ídem, pero con el azimut relativo al de la cámara. */
function placeFollowing(
  light: THREE.DirectionalLight,
  cameraAzimuth: number,
  offsetDeg: number,
  elevationDeg: number,
  distance: number
): void {
  const azimuth = cameraAzimuth + offsetDeg * RAD
  const elevation = elevationDeg * RAD
  const horizontal = Math.cos(elevation) * distance

  light.position.set(
    Math.sin(azimuth) * horizontal,
    Math.sin(elevation) * distance,
    Math.cos(azimuth) * horizontal
  )
}

export function applyLightRig(
  targets: LightRigTargets,
  input: LightRigInput,
  cache: LightRigCache
): void {
  const { level, kelvin, cameraAzimuth, cameraHeight, followsCamera } = input

  // 1 · El color de la temperatura, compartido por la principal y el relleno.
  if (kelvin !== cache.lastKelvin) {
    const { r, g, b } = kelvinToSrgb(kelvin)
    cache.warm.setRGB(r, g, b, THREE.SRGBColorSpace)
    cache.lastKelvin = kelvin
  }

  // 2 · Principal. Es la única que proyecta sombra.
  const key = targets.key
  if (key) {
    key.intensity = KEY_INTENSITY * level
    key.color.copy(cache.warm)

    if (followsCamera) {
      placeFollowing(key, cameraAzimuth, KEY_FOLLOW_AZIMUTH_OFFSET_DEG, KEY_ELEVATION_DEG, KEY_DISTANCE)
    } else {
      place(key, KEY_AZIMUTH_DEG, KEY_ELEVATION_DEG, KEY_DISTANCE)
    }
  }

  // 3 · Relleno. Baja proporcional, igual que la principal: las dos son fuentes.
  const fill = targets.fill
  if (fill) {
    fill.intensity = FILL_INTENSITY * level
    fill.color.copy(cache.warm)

    if (followsCamera) {
      placeFollowing(
        fill,
        cameraAzimuth,
        FILL_FOLLOW_AZIMUTH_OFFSET_DEG,
        FILL_ELEVATION_DEG,
        FILL_DISTANCE
      )
    } else {
      place(fill, FILL_AZIMUTH_DEG, FILL_ELEVATION_DEG, FILL_DISTANCE)
    }
  }

  // 4 · Contraluz. SIEMPRE solidario a la cámara —el toggle no lo toca, porque
  //     ya lo es— y con su altura siguiendo a la de la cámara: es lo que hace
  //     que el filo exista en toda la órbita y a cualquier altura.
  //
  //     Se queda en blanco neutro mientras la sala se enfría hacia 7700 K. Así
  //     el filo se lee como una fuente distinta de la principal en vez de como
  //     la misma luz repartida, y en el cierre queda apenas más cálido que el
  //     ambiente, que es lo que lo despega.
  const rim = targets.rim
  if (rim) {
    rim.intensity = RIM_INTENSITY * (1 - (1 - level) * RIM_DIM_SHARE)

    const azimuth = cameraAzimuth + RIM_AZIMUTH_OFFSET_DEG * RAD
    rim.position.set(
      Math.sin(azimuth) * RIM_DISTANCE,
      RIM_HEIGHT_BASE + cameraHeight * RIM_HEIGHT_TRACK,
      Math.cos(azimuth) * RIM_DISTANCE
    )
  }

  // 5 · Ambiente. Baja MÁS rápido que las fuentes: es lo que cierra las sombras
  //     cuando la sala se apaga, en vez de dejar todo gris parejo.
  const hemi = targets.hemi
  if (hemi) hemi.intensity = HEMI_INTENSITY * Math.pow(level, HEMI_DIM_GAMMA)

  // 6 · La niebla y el fondo. El aire está iluminado por el ambiente, así que se
  //     apaga con él: sin esto, la escena se oscurecería con un fondo blanco
  //     papel intacto detrás, que es la contradicción que arruina un cierre.
  const fogLevel = Math.pow(level, FOG_DIM_GAMMA)
  if (fogLevel !== cache.lastFogLevel) {
    cache.fogTint.copy(cache.fogBase).multiplyScalar(fogLevel)
    cache.lastFogLevel = fogLevel
  }

  if (targets.fog) targets.fog.color.copy(cache.fogTint)
  // El ciclorama tapa el cuadro entero en todo el recorrido, así que el fondo
  // casi nunca se ve; seguirlo igual es una línea y cierra el caso del modo
  // manual, donde la cámara sí puede componer un encuadre que lo destape.
  if (targets.background) targets.background.copy(cache.fogTint)
}
