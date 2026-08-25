/**
 * COMPROBACIONES DE S7 · el sol.
 *
 *     npx tsx src/app/probe-escena/__tests__/s7-sol.invariant.ts
 *
 * La primera sección era la más importante de S7: **que el cuerpo del sol y la
 * luz que proyecta la sombra estén sobre el mismo eje.** Un sol dibujado por un
 * lado y una key por el otro son dos soles, y en cuanto uno se mueve el espacio
 * deja de ser creíble.
 *
 * ⚠️ **S11 borró el cuerpo, así que ese chequeo cambió de OBJETO — no
 * desapareció.** La dirección del sol ya no coloca un sprite: alimenta la
 * celosía, que proyecta la rendija sobre todo lo que recibe la key. La garantía
 * es la misma y vale lo mismo: **el eje que dibuja las bandas y el eje que tira la
 * sombra tienen que ser el mismo vector.** Lo que se verifica ahora es que
 * `applyLightRig` escriba en el uniform exactamente lo que le escribe a la key, en
 * el mismo frame.
 *
 * Y la sección 4, que medía dónde vivía el cuerpo, pasó a verificar que el rayo al
 * sol **cruce las dos capas** desde el piso — y se mudó a
 * `s11-proyeccion.invariant.ts`, que es donde vive la proyección.
 */
import * as THREE from 'three'

import { createCelosiaUniforms } from '../_components/celosiaShader'
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
import { MOIRE_FAR_RADIUS, MOIRE_NEAR_RADIUS } from '../_components/probeMoire'
import { PARTICLE_R_MAX } from '../_components/probeParticles'
import { FLOOR_Y, check, report, section } from './harness'

const RAD = Math.PI / 180
const arc: MutableLightLevels = { level: 1, kelvin: 6500, azimuthDeg: 0, elevationDeg: 0 }

// ── 1 · La celosía Y la key son la misma dirección ──────────────────────────

section('La celosía y la luz principal comparten eje')

{
  const targets = createLightRigTargets()
  targets.key = new THREE.DirectionalLight()
  targets.celosia = createCelosiaUniforms()
  const input = createLightRigInput()
  const cache = createLightRigCache()

  let collinear = true
  let worstAngle = 0
  let unit = true
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
    const gobo = targets.celosia.uCelosiaSun.value
    const angle = (key.angleTo(gobo.clone().normalize()) * 180) / Math.PI
    if (angle > worstAngle) worstAngle = angle
    if (angle > 1e-4) collinear = false
    // El shader la usa SIN normalizar: si dejara de ser unitaria, el parámetro de
    // la cuadrática dejaría de estar en unidades de mundo y el cruce se correría.
    if (Math.abs(gobo.length() - 1) > 1e-9) unit = false
  }

  check(
    'la dirección que proyecta la celosía y la key apuntan EXACTAMENTE igual',
    collinear,
    `desvío máximo ${worstAngle.toExponential(1)}° en 101 puntos del recorrido`
  )
  check(
    'y el vector que recibe el shader es unitario',
    unit,
    'el gobo marcha el rayo en unidades de mundo: sin normalizar, el cruce se corre'
  )
  check(
    'la key sigue parada donde va la cámara de sombra',
    Math.abs(targets.key.position.length() - KEY_DISTANCE) < 1e-6,
    `${KEY_DISTANCE} — la celosía no la movió`
  )

  // Con el toggle "la luz sigue a la cámara" los dos tienen que seguir juntos: si
  // la celosía se quedara donde estaba, las bandas vendrían de otro lado que la
  // sombra.
  input.followsCamera = true
  input.cameraAzimuth = 1.2
  applyLightRig(targets, input, cache)
  const followAngle =
    (targets.key.position
      .clone()
      .normalize()
      .angleTo(targets.celosia.uCelosiaSun.value.clone().normalize()) *
      180) /
    Math.PI
  check('con el toggle de luz solidaria, la celosía gira con ella', followAngle < 1e-6)
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

/**
 * ⚠️ **S9 subió el techo de 115° a 180°, y no es aflojar una regla: es que la
 * razón de la vieja dejó de existir.**
 *
 * S7 acotó el barrido porque en su recorrido **la cámara vivía en azimut 0
 * durante más de medio track**, así que un sol que barriera de más dejaba tramos
 * enteros con la cara vista a oscuras. El recorrido definitivo lee contenido en
 * seis azimuts repartidos por toda la vuelta, y con la cámara barriendo 360° el
 * ángulo relativo recorre 180° sí o sí.
 *
 * Lo que sigue siendo la regla —y es la que este check protege— es que **el sol
 * no dé una vuelta**: 180° es un día, de un horizonte al otro.
 *
 * **S11 le agregó un segundo significado a este número**: como el patrón de la
 * celosía está anclado al azimut del sol, esos 180° son también cuánto rota la
 * proyección sobre el piso — 51 celdas finas de fase pasando por un punto fijo.
 * El barrido de las bandas ES el barrido del arco.
 */
const sweep =
  Math.max(...LIGHT_ARC.map((s) => s.azimuthDeg)) - Math.min(...LIGHT_ARC.map((s) => s.azimuthDeg))
check('el barrido es un DÍA, no una vuelta', sweep <= 180, `${sweep}° en todo el recorrido`)

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

/**
 * ⚠️ **La sección 4 se mudó a `s11-proyeccion.invariant.ts`.**
 *
 * Medía que el rayo al sol cruzara las dos capas desde el piso, que es lo que
 * reemplazó a "dónde vive el cuerpo del sol". Es una afirmación sobre la
 * PROYECCIÓN y no sobre el arco, así que vive con las otras — junto con el
 * control positivo que la destapó: la celosía tiene alcance, y ese alcance se
 * abre con el atardecer.
 */

// ── 5 · El orden de dibujo después de borrar el sol ─────────────────────────

section('Los transparentes, sin el sol en el medio')

/**
 * ⚠️ **Reemplaza al chequeo de "ninguna partícula más lejos que el sol".**
 *
 * Aquel protegía el orden entre el cuerpo del sol y el polvo. Sin cuerpo no hay
 * nada que proteger ahí, pero el problema de fondo sigue: three ordena los
 * transparentes por la posición del OBJETO y los cilindros están centrados en el
 * origen. Lo que garantiza que ninguna mota se dibuje delante de la envolvente es
 * que el campo entero viva por DENTRO de los dos radios.
 */
check(
  'el campo de partículas vive por dentro de las dos capas',
  PARTICLE_R_MAX < MOIRE_NEAR_RADIUS && PARTICLE_R_MAX < MOIRE_FAR_RADIUS,
  `polvo hasta ${PARTICLE_R_MAX} contra capas en ${MOIRE_NEAR_RADIUS} y ${MOIRE_FAR_RADIUS}`
)

report('s7 · el sol')
