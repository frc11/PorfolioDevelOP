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
 * ⚠️ **ESCENA 2 borró la celosía**, y con ella el segundo consumidor del eje. Lo
 * que queda es la otra mitad de la misma garantía: **la key está EXACTAMENTE
 * donde el arco dice que está el sol**, recalculado acá desde el azimut y la
 * elevación que devuelve `sampleLightArc` y no copiado del rig.
 *
 * ⚠️ **Modo pulido sacó el resto** (la forma del arco de un día, el alcance del
 * mapa de sombra, el radio de partícula contra el fondo): era composición.
 */
import * as THREE from 'three'

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

// ── 1 · La key está sobre el eje del sol que dice el arco ───────────────────

section('La luz principal está donde el arco dice que está el sol')

/** El eje del sol, recalculado desde el arco y no leído del rig. */
function ejeDelArco(azimuthDeg: number, elevationDeg: number): THREE.Vector3 {
  const horizontal = Math.cos(elevationDeg * RAD)
  return new THREE.Vector3(
    Math.sin(azimuthDeg * RAD) * horizontal,
    Math.sin(elevationDeg * RAD),
    Math.cos(azimuthDeg * RAD) * horizontal
  )
}

{
  const targets = createLightRigTargets()
  targets.key = new THREE.DirectionalLight()
  const input = createLightRigInput()
  const cache = createLightRigCache()

  let worstAngle = 0
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
    const angle = (key.angleTo(ejeDelArco(arc.azimuthDeg, arc.elevationDeg)) * 180) / Math.PI
    if (angle > worstAngle) worstAngle = angle
  }

  check(
    'la key apunta EXACTAMENTE al sol del arco en todo el recorrido',
    worstAngle < 1e-4,
    `desvío máximo ${worstAngle.toExponential(1)}° en 101 puntos del recorrido`
  )
  check(
    'y está parada a su distancia de siempre',
    Math.abs(targets.key.position.length() - KEY_DISTANCE) < 1e-6,
    `${KEY_DISTANCE}`
  )

  /**
   * ⚠️ **EL CONTROL POSITIVO DEL COMPARADOR.** Un ángulo por debajo de 1e-4° sale
   * en verde también si el comparador devolviera siempre 0. Se le da el MISMO
   * comparador con el eje del arco girado un grado alrededor de Y.
   */
  const key = targets.key.position.clone().normalize()
  const torcido = ejeDelArco(arc.azimuthDeg + 1, arc.elevationDeg)
  const desvio = (key.angleTo(torcido) * 180) / Math.PI
  check(
    'control positivo — el mismo comparador VE un sol girado un grado',
    desvio > 1e-4,
    `${desvio.toFixed(3)}° — el umbral de la afirmación es 1e-4°`
  )
}

report('s7 · el sol')
