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
 *
 * La cámara y la proyección de un punto cualquiera salieron a
 * `lib/scene-camera.ts` en S13, y las comprueba `scene-camera.invariant.ts`.
 */
import { CHOREO_KEYFRAMES } from '@/app/v3/_lib/escena/choreography'
import {
  DEFAULT_VARIANT_ID,
  findVariant,
} from '@/app/probe-escena/_components/choreographyVariants'
import { CAMERA_FOV, ORBIT_TARGET_Y, PROBE_EXTRUDE, PROBE_SVG_SCALE } from '@/app/v3/_lib/escena/probeScene'
import { recorridoDeEncuadre } from '@/app/v3/_lib/escena/encuadre'
import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'
import { SCENE_LOGO_MESH_WORLD, projectScenePoint, sceneCameraAt } from '@/lib/scene-camera'
import { afirmarLaDeudaDeTravelX } from '@/lib/scene-encuadre-deuda'
import { afirmarElControlNegativo } from '@/lib/scene-framing-aproximacion'
import {
  DEST_WIDTH_MARGIN,
  SCENE_ENTRY_POSE,
  SCENE_ENTRY_VIEW,
  frameSceneEntry,
  frameScenePose,
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
  'el recorrido activo es el definitivo — el atajo de `scene-framing` sigue valiendo',
  DEFAULT_VARIANT_ID === 'definitiva' &&
    findVariant(DEFAULT_VARIANT_ID).keyframes === CHOREO_KEYFRAMES,
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

/**
 * ⚠️ **Las cifras de esta sección cambiaron en S9 y era esperable.** El destino
 * sale del primer keyframe del recorrido, y S9 cambió el recorrido: la pose de
 * entrada pasó de `h 9 · d 15 · frameX 0,90` a `h 6,4 · d 19 · frameX 0,68`.
 * Lo que NO cambió es de dónde sale el número — sigue leyéndose del track, no
 * hay una sola constante escrita a mano.
 *
 * ⚠️ **Y hay un número histórico que NO hay que volver a usar.** Este archivo
 * publicaba 523 × 364 px, pero `S8-PRELOADER.md` e `introHandoff.ts` dicen
 * 504 × 351 — los dos salieron del MISMO commit, así que el doc quedó con una
 * medición intermedia que el código nunca produjo. S9 corrigió los dos textos.
 * Si alguien vuelve a leer 504 en algún lado, es de ahí.
 */
section('3 · La proyección en 1440×810, con la pose de entrada de S9')

const desktop = frameSceneEntry(1440, 810)
if (!desktop) {
  check('hay destino en 1440×810', false)
} else {
  check(
    'el centro cae en (940, 417)',
    Math.abs(desktop.centerXPx - 940) < 1.5 && Math.abs(desktop.centerYPx - 417) < 1.5,
    `(${desktop.centerXPx.toFixed(0)}, ${desktop.centerYPx.toFixed(0)})`
  )
  check(
    'la tinta mide 445 × 310 px — un 15% más chica que con la calibrada',
    Math.abs(desktop.inkWidthPx - 445) < 2 && Math.abs(desktop.inkHeightPx - 310) < 2,
    `${desktop.inkWidthPx.toFixed(0)} × ${desktop.inkHeightPx.toFixed(0)}px, contra 523 × 364`
  )

  /**
   * ⚠️ **ESTA AFIRMACIÓN DEJÓ DE SER UN UMBRAL Y PASÓ A SER UNA PROPIEDAD
   * (V3-E).** Decía `> 0.7` del ancho, y con `frameX: 0,68` daba 70,7%: era el
   * literal de una pose, no la propiedad que el nombre promete. V3-E movió
   * `frameX` a **0,5** —el eje óptico apuntaba 12,834° AFUERA de la caja del
   * logo y lo que se perdía era la sala, no el logo— y el porcentaje bajó a
   * 65,3%. Bajar el umbral a 0,6 habría sido aflojarlo.
   *
   * Lo que se afirma ahora es lo que la comprobación siempre quiso decir, y se
   * deriva de la MISMA función con el contrafactual: **con `frameX: 0` el
   * destino cae en el centro geométrico, y con la pose viva cae a la derecha de
   * ése.** Sirve para cualquier `frameX > 0` y se rompe si alguien lo pone en 0
   * o negativo, que es exactamente el defecto que hay que ver.
   */
  const centrado = frameScenePose({ ...SCENE_ENTRY_POSE, frameX: 0 }, 1440, 810)
  check(
    'el logo NO cae centrado: la composición lo manda a la derecha',
    centrado !== null &&
      Math.abs(centrado.centerXPx - 720) < 0.5 &&
      desktop.centerXPx > centrado.centerXPx,
    `${((100 * desktop.centerXPx) / 1440).toFixed(1)}% del ancho, contra ${centrado === null ? '?' : ((100 * centrado.centerXPx) / 1440).toFixed(1)}% con \`frameX: 0\``
  )
  check(
    'control positivo — el contrafactual NO se compara consigo mismo: con `frameX: 0` el destino ES el centro',
    centrado !== null && Math.abs(desktop.centerXPx - centrado.centerXPx) > 100,
    centrado === null
      ? 'no hay contrafactual'
      : `${(desktop.centerXPx - centrado.centerXPx).toFixed(1)} px de corrimiento — si diera cero, la afirmación de arriba sería una comparación de un número contra sí mismo`
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
  /**
   * ⚠ **ESTA COMPROBACIÓN ESTABA ESCRITA CONTRA UN LITERAL, Y EL LITERAL ERA EL
   * DEFECTO (SITIO-S12).** Decía `Math.abs(phone.centerXPx - 195) < 1.5` con la
   * etiqueta *«el centro es el de la composición»*. **195 es exactamente 390/2**,
   * o sea el centro geométrico de la pantalla — el número que sale sólo porque
   * `travelX` vale 0 debajo del codo (§7.44). La composición pide `frameX: 0,68`,
   * que en portrait daría 215,4. La afirmación no medía el clamp: clavaba el
   * defecto, y el día que alguien arregle `scene-camera.ts` se habría puesto en
   * rojo como si fuera una regresión.
   *
   * Reescrita contra **la propiedad** que quiso afirmar —regla 15 del proyecto,
   * §7.45.1—: el clamp achica y NO mueve, o sea que el centro es el MISMO con el
   * clamp actuando y con el clamp desactivado. No nombra un número: compara los
   * dos estados del mecanismo que la sección mide.
   */
  const camaraDelTelefono = sceneCameraAt(SCENE_ENTRY_POSE, 390, 844)
  const origenProyectado =
    camaraDelTelefono === null
      ? null
      : projectScenePoint(camaraDelTelefono, [0, ORBIT_TARGET_Y, 0], 390, 844)
  check(
    'el clamp achica, NO mueve: el centro ES la proyección del origen, sin pasar por el clamp',
    origenProyectado !== null &&
      phone.widthClamp < 1 &&
      phone.centerXPx === origenProyectado.xPx &&
      phone.centerYPx === origenProyectado.yPx,
    `x = ${phone.centerXPx.toFixed(3)} · proyección ${origenProyectado ? origenProyectado.xPx.toFixed(3) : 'null'} · clamp ×${phone.widthClamp.toFixed(3)}`
  )
  check(
    '  y el clamp SÍ mueve el TAMAÑO, que es lo único que le toca: la tinta cruda no es la publicada',
    origenProyectado !== null &&
      Math.abs(LOGO_INK_VIEWBOX.width * origenProyectado.pxPerWorld * PROBE_SVG_SCALE - phone.inkWidthPx) > 50,
    origenProyectado
      ? `cruda ${(LOGO_INK_VIEWBOX.width * origenProyectado.pxPerWorld * PROBE_SVG_SCALE).toFixed(0)}px contra ${phone.inkWidthPx.toFixed(0)}px publicados`
      : 'sin proyección'
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

afirmarElControlNegativo({ check, section }, desktop)

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
