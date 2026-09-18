/**
 * COMPROBACIONES DEL DESTINO — dónde cae el logo de la escena, S8b.
 *
 *     npx tsx src/lib/scene-framing.invariant.ts
 *
 * El preloader aterriza su logo sobre el lugar que la escena le tiene guardado.
 * Ese lugar no es un número escrito a mano: sale de proyectar el primer
 * keyframe del recorrido. Lo que se verifica acá:
 *
 *   1. Que la caja de la tinta, medida aplanando el path, coincida con la que
 *      el probe midió del mesh en runtime. Dos caminos independientes.
 *   2. Que un viewport degenerado devuelva `null` y no basura.
 *   3. El censo de las cinco copias de la fórmula de encuadre (arquitectura/DRY).
 *
 * Dónde cae el destino en píxeles, el descentrado por diseño y el clamp de
 * ancho son composición — se dejaron de afirmar acá (Modo pulido).
 *
 * La cámara y la proyección de un punto cualquiera salieron a
 * `lib/scene-camera.ts` en S13, y las comprueba `scene-camera.invariant.ts`.
 */
import { PROBE_EXTRUDE, PROBE_SVG_SCALE } from '@/app/v3/_lib/escena/probeScene'
import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'
import { SCENE_LOGO_MESH_WORLD } from '@/lib/scene-camera'
import { afirmarLaDeudaDeTravelX } from '@/lib/scene-encuadre-deuda'
import { frameSceneEntry } from '@/lib/scene-framing'

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

// ── 5 · Sin ventana no hay destino ──────────────────────────────────────────

section('5 · Ventana degenerada: `null`, no basura')

check('0 × 0 devuelve null', frameSceneEntry(0, 0) === null)
check('ancho 0 devuelve null', frameSceneEntry(0, 800) === null)
check('alto 0 devuelve null', frameSceneEntry(1440, 0) === null)
check('negativo devuelve null', frameSceneEntry(-1440, -810) === null)

afirmarLaDeudaDeTravelX({ check, section })

console.log(`\nscene-framing: ${passed} en verde, ${failures.length} en rojo`)
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
