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
 *
 * ⚠️ **Modo pulido sacó el resto** (la forma del arco de un día, el alcance del
 * mapa de sombra, el radio de partícula contra el fondo): era composición.
 */
import * as THREE from 'three'

import { createCelosiaUniforms } from '@/app/v3/_lib/escena/celosiaShader'
import { sampleLightArc } from '@/app/v3/_lib/escena/choreographySampler'
import type { MutableLightLevels } from '@/app/v3/_lib/escena/choreographyTypes'
import {
  applyLightRig,
  createLightRigCache,
  createLightRigInput,
  createLightRigTargets,
} from '@/app/v3/_lib/escena/lightRig'
import { KEY_DISTANCE } from '@/app/v3/_lib/escena/probeLighting'
import { check, report, section } from './harness'

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

  /**
   * ⚠️ **EL CONTROL POSITIVO DEL DETECTOR DE COLINEALIDAD (SITIO-S10).** Lo que
   * afirma la sección es un ángulo por debajo de 1e-4° entre dos vectores, y eso
   * sale en verde también si el comparador estuviera devolviendo siempre 0. Se le
   * da el MISMO comparador con el gobo girado un grado alrededor de Y.
   */
  const key = targets.key.position.clone().normalize()
  const torcido = targets.celosia.uCelosiaSun.value.clone().normalize()
  torcido.applyAxisAngle(new THREE.Vector3(0, 1, 0), 1 * RAD)
  const desvio = (key.angleTo(torcido) * 180) / Math.PI
  check(
    'control positivo — el mismo comparador VE un gobo girado un grado',
    desvio > 1e-4,
    `${desvio.toFixed(3)}° — el umbral de la afirmación es 1e-4°`
  )
  check(
    'control positivo — y el medidor de longitud VE un vector que dejó de ser unitario',
    Math.abs(torcido.clone().multiplyScalar(2).length() - 1) > 1e-9,
    'la afirmación "el vector es unitario" mide la longitud, no la asume'
  )
}

report('s7 · el sol')
