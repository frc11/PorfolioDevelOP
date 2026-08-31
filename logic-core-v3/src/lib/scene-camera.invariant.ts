import { PROBE_SVG_SCALE } from '@/app/v3/_lib/escena/probeScene'
import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'
import { projectScenePoint, sceneCameraAt } from '@/lib/scene-camera'
import { SCENE_ENTRY_POSE, frameSceneEntry, frameScenePose } from '@/lib/scene-framing'

/**
 * COMPROBACIONES DE LA CÁMARA DE LA ESCENA — S13.
 *
 *     npx tsx src/lib/scene-camera.invariant.ts
 *
 * `sceneCameraAt` + `projectScenePoint` salieron de adentro de `frameScenePose`
 * porque el preloader necesitó proyectar **puntos que no son el logo**: las
 * partículas de la escena, para medir de qué tamaño y en qué lugar de la
 * pantalla caen en la pose inicial.
 *
 * **Lo que se custodia es que no haya quedado una segunda cámara.** Si las
 * funciones nuevas y `frameScenePose` divergieran, el campo del intro caería en
 * un encuadre distinto del que el logo usa como destino, y nadie se enteraría
 * hasta verlo en pantalla.
 */

let passed = 0
const failures: string[] = []

function check(label: string, condition: boolean, detail = ''): void {
  const line = `${label}${detail ? `  · ${detail}` : ''}`
  if (condition) {
    passed += 1
    console.log(`  ok  ${line}`)
    return
  }
  failures.push(line)
  console.log(`  FALLA  ${line}`)
}

function section(title: string): void {
  console.log(`
── ${title} ${'─'.repeat(Math.max(0, 66 - title.length))}`)
}

const desktop = frameSceneEntry(1440, 810)

// ── Una sola cámara para el logo y para el resto de la escena ─────────────

section('Una sola cámara para el logo y para el resto de la escena')

/**
 * `sceneCameraAt` + `projectScenePoint` salieron de adentro de `frameScenePose`
 * en S13 (`lib/scene-camera.ts`), porque el preloader necesitó proyectar puntos
 * que no son el logo. **El control de que no quedó una segunda cámara es que el
 * ORIGEN, proyectado con las funciones nuevas, caiga exactamente en el centro de
 * la tinta que `frameScenePose` publica** — hasta el último bit, no "parecido".
 */
{
  const camera = sceneCameraAt(SCENE_ENTRY_POSE, 1440, 810)
  const origin = camera ? projectScenePoint(camera, [0, 0, 0], 1440, 810) : null
  check(
    'el origen proyectado ES el centro de la tinta que publica `frameScenePose`',
    origin !== null &&
      desktop !== null &&
      origin.xPx === desktop.centerXPx &&
      origin.yPx === desktop.centerYPx,
    origin ? `(${origin.xPx.toFixed(3)}, ${origin.yPx.toFixed(3)})` : 'sin proyección'
  )
  check(
    'y su `pxPerWorld` es el que dimensiona la tinta',
    origin !== null &&
      desktop !== null &&
      Math.abs(origin.pxPerWorld * PROBE_SVG_SCALE * LOGO_INK_VIEWBOX.height - desktop.inkHeightPx) <
        1e-9,
    origin ? `${origin.pxPerWorld.toFixed(4)} px por unidad de mundo` : ''
  )

  /**
   * Control positivo: sin esto, una proyección que devolviera SIEMPRE el centro
   * pasaría la comprobación de arriba y no comprobaría nada.
   */
  const right = camera ? projectScenePoint(camera, [3, 0, 0], 1440, 810) : null
  const up = camera ? projectScenePoint(camera, [0, 3, 0], 1440, 810) : null
  check(
    'un punto a la derecha del origen proyecta más a la derecha',
    right !== null && origin !== null && right.xPx > origin.xPx + 50,
    right && origin ? `${(right.xPx - origin.xPx).toFixed(0)}px por 3 de mundo` : ''
  )
  check(
    'y uno más alto, más arriba',
    up !== null && origin !== null && up.yPx < origin.yPx - 50,
    up && origin ? `${(origin.yPx - up.yPx).toFixed(0)}px por 3 de mundo` : ''
  )
  check(
    'un punto detrás de la cámara no proyecta',
    camera !== null && projectScenePoint(camera, [0, 0, 4000], 1440, 810) === null
  )
  check(
    'y con un viewport degenerado no hay cámara — el mismo lado seguro',
    sceneCameraAt(SCENE_ENTRY_POSE, 0, 0) === null
  )

  /**
   * Y la rama que `sceneCameraAt` saltea: sin encuadre, el origen tiene que caer
   * en el centro exacto de la pantalla.
   */
  const flat = frameScenePose({ ...SCENE_ENTRY_POSE, frameX: 0, frameY: 0 }, 1440, 810)
  check(
    'sin encuadre el logo cae en el centro de la pantalla',
    flat !== null && Math.abs(flat.centerXPx - 720) < 1e-9 && Math.abs(flat.centerYPx - 405) < 1e-9,
    flat ? `(${flat.centerXPx.toFixed(1)}, ${flat.centerYPx.toFixed(1)})` : ''
  )
}

console.log(`
scene-camera: ${passed} en verde, ${failures.length} en rojo`)
if (failures.length > 0) {
  for (const failure of failures) console.log(`  ✗ ${failure}`)
  process.exitCode = 1
}
// La guarda de «cero comprobaciones», igual que en los dos arneses compartidos:
// un invariante sin comprobaciones sale verde y es indistinguible de uno que
// verificó algo. Puesta en SITIO-S8, al cablear este archivo al gate del repo.
if (passed === 0) {
  console.log('  FALLA  cero comprobaciones. Un invariante sin comprobaciones es verde por vacío.')
  process.exitCode = 1
}
