/**
 * COMPROBACIONES DEL DESTINO — dónde cae el logo de la escena, S8b.
 *
 *     npx tsx src/lib/scene-framing.invariant.ts
 *
 * El preloader aterriza su logo sobre el lugar que la escena le tiene guardado.
 * Ese lugar no es un número escrito a mano: sale de proyectar el primer
 * keyframe del recorrido. Lo que se verifica acá:
 *
 *   1. Que el atajo siga siendo cierto — el recorrido activo ES `CHOREO_KEYFRAMES`.
 *   2. Que la caja de la tinta, medida aplanando el path, coincida con la que
 *      el probe midió del mesh en runtime. Dos caminos independientes.
 *   3. Que la proyección dé los números publicados en el reporte de S8b.
 *   4. Que el clamp de ancho (§7.6) haga lo que dice, y solo donde hace falta.
 *   5. Que un viewport degenerado devuelva `null` y no basura.
 */
import { CHOREO_KEYFRAMES } from '@/app/probe-escena/_components/choreography'
import {
  DEFAULT_VARIANT_ID,
  findVariant,
} from '@/app/probe-escena/_components/choreographyVariants'
import { PROBE_EXTRUDE, PROBE_SVG_SCALE } from '@/app/probe-escena/_components/probeScene'
import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'
import {
  DEST_WIDTH_MARGIN,
  SCENE_ENTRY_POSE,
  SCENE_ENTRY_VIEW,
  SCENE_LOGO_MESH_WORLD,
  frameSceneEntry,
} from '@/lib/scene-framing'

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
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 66 - title.length))}`)
}

// ── 1 · El destino se lee del recorrido activo ──────────────────────────────

section('1 · El destino sale del recorrido, y del recorrido ACTIVO')

check(
  'el recorrido activo es la base — el atajo de `scene-framing` sigue valiendo',
  DEFAULT_VARIANT_ID === 'base' && findVariant(DEFAULT_VARIANT_ID).keyframes === CHOREO_KEYFRAMES,
  `activo: ${DEFAULT_VARIANT_ID}`
)
check(
  '`SCENE_ENTRY_POSE` ES el primer keyframe, no una copia',
  SCENE_ENTRY_POSE === CHOREO_KEYFRAMES[0].pose,
  `"${CHOREO_KEYFRAMES[0].name}" · ángulo ${SCENE_ENTRY_POSE.angleDeg} · altura ${SCENE_ENTRY_POSE.height} · distancia ${SCENE_ENTRY_POSE.distance} · frameX ${SCENE_ENTRY_POSE.frameX}`
)
check(
  'el primer keyframe está en el progreso 0',
  CHOREO_KEYFRAMES[0].at === 0
)
check(
  'la pose de revelación sale de la misma pose: elevación = atan(altura / distancia)',
  Math.abs(
    SCENE_ENTRY_VIEW.pitchDeg -
      (Math.atan2(SCENE_ENTRY_POSE.height, SCENE_ENTRY_POSE.distance) * 180) / Math.PI
  ) < 1e-9,
  `azimut ${SCENE_ENTRY_VIEW.yawDeg}° · elevación ${SCENE_ENTRY_VIEW.pitchDeg.toFixed(1)}°`
)

// ── 2 · Dos mediciones independientes de la misma caja ──────────────────────

section('2 · La caja de la tinta: el path aplanado contra el mesh medido')

const meshWidth = (LOGO_INK_VIEWBOX.width + PROBE_EXTRUDE.bevelSize * 2) * PROBE_SVG_SCALE
const meshHeight = (LOGO_INK_VIEWBOX.height + PROBE_EXTRUDE.bevelSize * 2) * PROBE_SVG_SCALE
check(
  'aplanar el path + bisel da los 6,86 × 4,78 que `PROBE-ESCENA.md` publica del mesh',
  Math.abs(meshWidth - 6.86) < 0.01 && Math.abs(meshHeight - 4.78) < 0.01,
  `${meshWidth.toFixed(3)} × ${meshHeight.toFixed(3)}`
)
check(
  '`SCENE_LOGO_MESH_WORLD` se deriva del bisel, no está copiado',
  SCENE_LOGO_MESH_WORLD.width === meshWidth && SCENE_LOGO_MESH_WORLD.height === meshHeight
)
check(
  'la tinta NO está centrada en el cuadrado de 1024 — por eso el viewBox va recortado',
  Math.abs(LOGO_INK_VIEWBOX.y + LOGO_INK_VIEWBOX.height / 2 - 512) > 30,
  `centro en y = ${(LOGO_INK_VIEWBOX.y + LOGO_INK_VIEWBOX.height / 2).toFixed(1)} · desvío ${(LOGO_INK_VIEWBOX.y + LOGO_INK_VIEWBOX.height / 2 - 512).toFixed(1)} unidades`
)

// ── 3 · La proyección, contra los números publicados ────────────────────────

section('3 · La proyección en 1440×810, contra el reporte de S8b')

const desktop = frameSceneEntry(1440, 810)
if (!desktop) {
  check('hay destino en 1440×810', false)
} else {
  check(
    'el centro cae en (1086, 466)',
    Math.abs(desktop.centerXPx - 1086) < 1.5 && Math.abs(desktop.centerYPx - 466) < 1.5,
    `(${desktop.centerXPx.toFixed(0)}, ${desktop.centerYPx.toFixed(0)})`
  )
  check(
    'la tinta mide 524 × 365 px',
    Math.abs(desktop.inkWidthPx - 524) < 2 && Math.abs(desktop.inkHeightPx - 365) < 2,
    `${desktop.inkWidthPx.toFixed(0)} × ${desktop.inkHeightPx.toFixed(0)}px`
  )
  check(
    'el logo NO cae centrado: la composición lo manda a la derecha',
    desktop.centerXPx / 1440 > 0.7,
    `${((100 * desktop.centerXPx) / 1440).toFixed(1)}% del ancho`
  )
  check('en desktop el clamp no hace falta', desktop.widthClamp === 1)
}

// La relación lockup↔destino tiene que ser la misma en cualquier desktop: es lo
// que hace que el chasquido se sienta igual a 810 que a 1080 de alto.
const big = frameSceneEntry(1920, 1080)
if (desktop && big) {
  check(
    'el destino escala con el alto de la ventana, no con la resolución',
    Math.abs(desktop.inkHeightPx / 810 - big.inkHeightPx / 1080) < 1e-6,
    `${(desktop.inkHeightPx / 810).toFixed(4)} del alto en las dos`
  )
}

// ── 4 · El clamp de ancho (§7.6) ────────────────────────────────────────────

section('4 · El clamp de ancho: solo donde hace falta, y con el número correcto')

const phone = frameSceneEntry(390, 844)
if (!phone) {
  check('hay destino en 390×844', false)
} else {
  check(
    'en 390×844 el clamp SÍ actúa — sin él el logo desbordaría',
    phone.widthClamp < 1,
    `×${phone.widthClamp.toFixed(3)}`
  )
  check(
    'y deja la tinta justo en el margen',
    Math.abs(phone.inkWidthPx - DEST_WIDTH_MARGIN * 390) < 0.5,
    `${phone.inkWidthPx.toFixed(0)}px = ${DEST_WIDTH_MARGIN} × 390`
  )
  check(
    'el clamp achica, NO mueve: el centro es el de la composición',
    Math.abs(phone.centerXPx - 195) < 1.5,
    `x = ${phone.centerXPx.toFixed(0)}`
  )
  check(
    'el ancho de la tinta nunca pasa del margen, en ninguna ventana razonable',
    [
      [320, 568],
      [390, 844],
      [768, 1024],
      [1024, 768],
      [1280, 800],
      [1440, 810],
      [1920, 1080],
      [2560, 1440],
      [3840, 2160],
    ].every(([w, h]) => {
      const frame = frameSceneEntry(w, h)
      return frame !== null && frame.inkWidthPx <= DEST_WIDTH_MARGIN * w + 0.5
    }),
    '9 ventanas'
  )
  check(
    'el margen es el mismo `LOGO_WIDTH_MARGIN` de la calibración A',
    DEST_WIDTH_MARGIN === 0.86
  )
}

// ── 5 · Sin ventana no hay destino ──────────────────────────────────────────

section('5 · Ventana degenerada: `null`, no basura')

check('0 × 0 devuelve null', frameSceneEntry(0, 0) === null)
check('ancho 0 devuelve null', frameSceneEntry(0, 800) === null)
check('alto 0 devuelve null', frameSceneEntry(1440, 0) === null)
check('negativo devuelve null', frameSceneEntry(-1440, -810) === null)

// ── 6 · Control negativo ────────────────────────────────────────────────────

section('6 · Control negativo: la proyección no es la aproximación lineal')

/**
 * La aproximación que S8 usaba —`frameX × travel / halfWidth`— ignora que el
 * `lookAt` con el target corrido ROTA la cámara. Si algún día alguien la
 * "simplifica" así, esto se pone en verde... y el logo aterriza 5 px corrido y
 * 61 px más arriba de donde la escena lo va a tener.
 */
if (desktop) {
  const TAN = Math.tan((35 * Math.PI) / 360)
  const eye = Math.hypot(SCENE_ENTRY_POSE.distance, SCENE_ENTRY_POSE.height)
  const halfW = TAN * eye * (1440 / 810)
  const travelX = Math.max(0, halfW - SCENE_LOGO_MESH_WORLD.width / 2) * 0.88
  const approxX = (0.5 + (SCENE_ENTRY_POSE.frameX * travelX) / halfW / 2) * 1440
  check(
    'la proyección real NO coincide con la aproximación lineal',
    Math.abs(desktop.centerXPx - approxX) > 2,
    `real ${desktop.centerXPx.toFixed(0)} vs aproximada ${approxX.toFixed(0)} · ${Math.abs(desktop.centerXPx - approxX).toFixed(1)}px`
  )
  check(
    'y la aproximación tampoco ve el corrimiento vertical',
    Math.abs(desktop.centerYPx - 405) > 20,
    `real y = ${desktop.centerYPx.toFixed(0)} · centro de pantalla 405`
  )
}

console.log(`\nscene-framing: ${passed} en verde, ${failures.length} en rojo`)
if (failures.length > 0) {
  for (const failure of failures) console.log(`  ✗ ${failure}`)
  process.exitCode = 1
}
