/**
 * COMPROBACIONES DE S7 · el sol.
 *
 *     npx tsx src/app/probe-escena/__tests__/s7-sol.invariant.ts
 *
 * La primera sección es la más importante de todo el sprint: **que el cuerpo del
 * sol y la luz que proyecta la sombra estén sobre el mismo eje.** Un sol
 * dibujado por un lado y una key por el otro son dos soles, y en cuanto uno se
 * mueve el espacio deja de ser creíble. Es exactamente el tipo de acuerdo que se
 * rompe solo en un refactor sin que nadie se entere.
 */
import * as THREE from 'three'

import { LIGHT_ARC } from '../_components/choreography'
import { sampleLightArc } from '../_components/choreographySampler'
import type { MutableLightLevels } from '../_components/choreographyTypes'
import {
  applyLightRig,
  createLightRigCache,
  createLightRigInput,
  createLightRigTargets,
} from '../_components/lightRig'
import { KEY_DISTANCE, KEY_ELEVATION_DEG } from '../_components/probeLighting'
import { SHADOW_FAR, SHADOW_NEAR } from '../_components/probeAtmosphere'
import { SUN_RADIUS, sunOpacityFor } from '../_components/probeSun'
import { MOIRE_RADIUS } from '../_components/probeMoire'
import { AERIAL_SPAN } from '../_components/probeArchitecture'
import { FLOOR_Y, check, report, section, type Vec3 } from './harness'

const RAD = Math.PI / 180
const arc: MutableLightLevels = { level: 1, kelvin: 6500, azimuthDeg: 0, elevationDeg: 0 }

function sunAt(p: number, radius = SUN_RADIUS): Vec3 {
  sampleLightArc(p, arc)
  const horizontal = Math.cos(arc.elevationDeg * RAD) * radius
  return [
    Math.sin(arc.azimuthDeg * RAD) * horizontal,
    Math.sin(arc.elevationDeg * RAD) * radius,
    Math.cos(arc.azimuthDeg * RAD) * horizontal,
  ]
}

// ── 1 · El sol Y la key son el mismo objeto ─────────────────────────────────

section('El sol y la luz principal comparten eje')

{
  const targets = createLightRigTargets()
  targets.key = new THREE.DirectionalLight()
  targets.sun = new THREE.Sprite(new THREE.SpriteMaterial())
  const input = createLightRigInput()
  const cache = createLightRigCache()

  let collinear = true
  let worstAngle = 0
  let opacityOk = true
  for (let i = 0; i <= 100; i += 1) {
    const p = i / 100
    sampleLightArc(p, arc)
    input.level = arc.level
    input.kelvin = arc.kelvin
    input.sunAzimuthDeg = arc.azimuthDeg
    input.sunElevationDeg = arc.elevationDeg
    input.cameraAzimuth = p * Math.PI * 2
    input.cameraHeight = 3
    applyLightRig(targets, input, cache)

    const key = targets.key.position.clone().normalize()
    const sun = targets.sun.position.clone().normalize()
    const angle = (key.angleTo(sun) * 180) / Math.PI
    if (angle > worstAngle) worstAngle = angle
    if (angle > 1e-4) collinear = false

    const material = targets.sun.material as THREE.SpriteMaterial
    if (Math.abs(material.opacity - sunOpacityFor(arc.level)) > 1e-9) opacityOk = false
  }

  check(
    'el cuerpo del sol y la key apuntan EXACTAMENTE en la misma dirección',
    collinear,
    `desvío máximo ${worstAngle.toExponential(1)}° en 101 puntos del recorrido`
  )
  check(
    'están a distancias distintas y es a propósito',
    Math.abs(targets.key.position.length() - KEY_DISTANCE) < 1e-6 &&
      Math.abs(targets.sun.position.length() - SUN_RADIUS) < 1e-6,
    `key a ${KEY_DISTANCE} (cámara de sombra), cuerpo a ${SUN_RADIUS}`
  )
  check('el cuerpo se apaga con el arco, proporcional al nivel', opacityOk)

  // Con el toggle "la luz sigue a la cámara" los dos tienen que seguir juntos:
  // si el sol se quedara donde estaba, la sombra vendría de otro lado.
  input.followsCamera = true
  input.cameraAzimuth = 1.2
  applyLightRig(targets, input, cache)
  const followAngle =
    (targets.key.position.clone().normalize().angleTo(targets.sun.position.clone().normalize()) *
      180) /
    Math.PI
  check('con el toggle de luz solidaria, el sol se mueve con ella', followAngle < 1e-6)
}

// ── 2 · El arco: una tabla, dos curvas que no pueden contradecirse ──────────

section('El arco del sol')

const EL0 = KEY_ELEVATION_DEG
let relationOk = true
const relation: string[] = []
for (const stop of LIGHT_ARC) {
  const expected = (Math.asin(stop.level * Math.sin(EL0 * RAD)) * 180) / Math.PI
  relation.push(`${stop.level.toFixed(2)}→${stop.elevationDeg}°`)
  if (Math.abs(expected - stop.elevationDeg) > 0.06) relationOk = false
}
check(
  'la elevación SALE del nivel: nivel = sin(elev)/sin(36°)',
  relationOk,
  relation.join(' · ')
)

check(
  'el arco arranca en la elevación que S6 calibró para la key',
  LIGHT_ARC[0].elevationDeg === KEY_ELEVATION_DEG,
  `${LIGHT_ARC[0].elevationDeg}°`
)

let descends = true
let sweeps = true
for (let i = 1; i < LIGHT_ARC.length; i += 1) {
  if (LIGHT_ARC[i].elevationDeg > LIGHT_ARC[i - 1].elevationDeg) descends = false
  if (LIGHT_ARC[i].azimuthDeg < LIGHT_ARC[i - 1].azimuthDeg) sweeps = false
}
check('la elevación nunca sube: el sol baja y no vuelve', descends)
check('el azimut barre en un solo sentido: es un día, no un péndulo', sweeps)
check(
  'el sol nunca baja del horizonte',
  LIGHT_ARC.every((stop) => stop.elevationDeg > 0),
  `mínimo ${Math.min(...LIGHT_ARC.map((s) => s.elevationDeg))}°`
)

const sweep =
  Math.max(...LIGHT_ARC.map((s) => s.azimuthDeg)) - Math.min(...LIGHT_ARC.map((s) => s.azimuthDeg))
check('el barrido es ACOTADO, no una vuelta', sweep <= 115, `${sweep}° en todo el recorrido`)

// ── 3 · La sombra entra en el mapa ──────────────────────────────────────────

section('La sombra del sol bajo')

{
  const top = 3.584
  let worstDepth = 0
  let worstElevation = 0
  let reach = 0
  for (let i = 0; i <= 200; i += 1) {
    sampleLightArc(i / 200, arc)
    const elevation = arc.elevationDeg * RAD
    const shadow = (top - FLOOR_Y) / Math.tan(elevation)
    const depth = KEY_DISTANCE + shadow * Math.cos(elevation) - FLOOR_Y * Math.sin(elevation)
    if (depth > worstDepth) {
      worstDepth = depth
      worstElevation = arc.elevationDeg
      reach = shadow
    }
  }
  check(
    'la punta de la sombra más larga entra en el rango del shadow map',
    worstDepth < SHADOW_FAR,
    `a ${worstElevation.toFixed(1)}° la sombra mide ${reach.toFixed(1)} y su profundidad es ${worstDepth.toFixed(1)} contra un FAR de ${SHADOW_FAR}`
  )
  check(
    'el objeto sigue entrando por el lado cercano del rango',
    KEY_DISTANCE - 5.08 > SHADOW_NEAR,
    `el punto más cercano del logo está a ${(KEY_DISTANCE - 5.08).toFixed(1)} y NEAR es ${SHADOW_NEAR}`
  )
}

// ── 4 · Dónde vive el cuerpo del sol ────────────────────────────────────────

section('El cuerpo del sol contra la escena')

{
  let aboveFloor = true
  let insideScreen = true
  let insideGrid = true
  let minHeight = Infinity
  let maxRadius = 0
  for (let i = 0; i <= 200; i += 1) {
    const p = sunAt(i / 200)
    const radius = Math.hypot(p[0], p[2])
    minHeight = Math.min(minHeight, p[1])
    maxRadius = Math.max(maxRadius, radius)
    if (p[1] <= FLOOR_Y) aboveFloor = false
    if (radius >= MOIRE_RADIUS) insideScreen = false
    if (Math.abs(p[0]) > AERIAL_SPAN + 1 || Math.abs(p[2]) > AERIAL_SPAN + 1) insideGrid = false
  }
  check('el sol nunca se mete abajo del papel', aboveFloor, `altura mínima ${minHeight.toFixed(1)}`)
  check(
    'el sol siempre queda POR DELANTE de la pantalla de rendijas',
    insideScreen,
    `radio horizontal máximo ${maxRadius.toFixed(1)} contra una pantalla en ${MOIRE_RADIUS}`
  )
  check(
    'el sol queda dentro del cuadrado de la retícula, así que las barras lo cruzan',
    insideGrid,
    `±${AERIAL_SPAN} en X y en Z`
  )
}

report('s7 · el sol')
