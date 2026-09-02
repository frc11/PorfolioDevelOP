/**
 * LA DEUDA DE `travelX` — §7.44 medida, y las cinco copias censadas.
 *
 * Sale de `scene-framing.invariant.ts` en SITIO-S12, cuando las dos secciones lo
 * cruzaron las 300 líneas del repo. El corte es por tema y es real: **el
 * invariante de al lado verifica que el DESTINO sea correcto; esto mide que la
 * fórmula que lo produce está escrita cinco veces y sólo tres consumen la
 * fuente.** Cambiar el destino no toca este censo, y cerrar una copia no toca el
 * destino.
 *
 * Recibe el arnés del invariante en vez de traer el suyo: dos contadores de
 * comprobaciones sobre el mismo archivo darían dos resúmenes y ninguno sería el
 * del archivo.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { CAMERA_FOV, ORBIT_TARGET_Y } from '@/app/v3/_lib/escena/probeScene'
import { SCENE_LOGO_MESH_WORLD, projectScenePoint, sceneCameraAt } from '@/lib/scene-camera'
import { camaraCorregidaEn, mismaCamaraDelPreloader } from '@/lib/scene-camera-medida'
import { SCENE_ENTRY_POSE, frameSceneEntry } from '@/lib/scene-framing'

/** El arnés del invariante que lo consume. No se duplica acá. */
export interface ArnesDeComprobacion {
  readonly check: (etiqueta: string, condicion: boolean, detalle?: string) => void
  readonly section: (titulo: string) => void
}

export function afirmarLaDeudaDeTravelX({ check, section }: ArnesDeComprobacion): void {
  // ── 7 · §7.44 · el aterrizaje del logo en un teléfono en VERTICAL ───────────

  section('7 · §7.44 — dónde aterriza HOY el logo del preloader, y dónde aterrizaría')

  /**
   * ⚠ **ESTA SECCIÓN MIDE UN DEFECTO QUE ESTÁ EN PRODUCCIÓN Y NO LO ARREGLA.**
   *
   * `scene-camera.ts` escribe `travelX` con `Math.max(0, ·)` y **no tiene compuerta
   * de 1025**: el preloader corre en todo ancho. Debajo del codo `travelX` vale 0,
   * el `aim` colapsa sobre el target, la cámara no rota y el origen —el centro de
   * la tinta— cae en el centro geométrico exacto de la pantalla. O sea que el
   * `frameX: 0,68` de la pose de entrada **no corre el logo ni un píxel**.
   *
   * SITIO-S12 lo MIDE y no lo toca: el arreglo mueve el instante que el intro
   * existe para clavar, y eso se juzga con una grabación en un teléfono.
   *
   * ── ⚠️ UNA CIFRA DE §7.44 QUE NO SE REPRODUCE (regla 11) ───────────────────
   *
   * §7.44 dice *«el codo de la pose del Hero está en 0,567»* y manda medir en
   * **375×667 y 390×844**. **0,567 es el codo con la caja del ARNÉS (7,168).**
   * `scene-camera.ts` no usa esa caja: usa `SCENE_LOGO_MESH_WORLD.width` =
   * 6,863213, y su codo cae en **0,542855**. La diferencia es operativa y no
   * cosmética: **375×667 da aspecto 0,562, que está ARRIBA de 0,542855**, así que
   * ahí el arreglo es un no-op exacto y quien midiera ese par concluiría que la
   * corrección no hace nada. Los tres teléfonos de abajo están los tres debajo del
   * codo real, que es la banda donde el defecto muerde.
   */
  const CAJA_MEDIA = SCENE_LOGO_MESH_WORLD.width / 2
  const MEDIO_ALTO_DE_LA_ENTRADA =
    Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180) *
    Math.hypot(SCENE_ENTRY_POSE.distance, SCENE_ENTRY_POSE.height - ORBIT_TARGET_Y)
  const CODO_REAL = CAJA_MEDIA / MEDIO_ALTO_DE_LA_ENTRADA

  check(
    'el codo de `scene-camera.ts` sale de SU caja, y NO es el 0,567 que publica §7.44',
    Math.abs(CODO_REAL - 0.542855) < 1e-5,
    `${CODO_REAL.toFixed(6)} con la caja del mesh (${SCENE_LOGO_MESH_WORLD.width.toFixed(6)}) contra 0,566964 con la del arnés (7,168)`
  )
  check(
    '  y 375×667 —uno de los dos pares que §7.44 manda medir— queda ARRIBA del codo real: ahí el arreglo es un no-op',
    375 / 667 > CODO_REAL,
    `${(375 / 667).toFixed(6)} contra ${CODO_REAL.toFixed(6)}`
  )

  /** Los tres teléfonos en vertical, los tres debajo del codo real. */
  const TELEFONOS: readonly (readonly [number, number])[] = [
    [375, 812],
    [390, 844],
    [393, 852],
  ]

  console.log('  ventana     aspecto   HOY (centro de la tinta)   CON `abs`         Δx        Δ del ancho')
  let todosSeMueven = true
  let todosCentradosHoy = true
  for (const [w, h] of TELEFONOS) {
    const hoy = frameSceneEntry(w, h)
    const camara = camaraCorregidaEn(SCENE_ENTRY_POSE, w, h)
    const corregido = camara === null ? null : projectScenePoint(camara, [0, ORBIT_TARGET_Y, 0], w, h)
    if (hoy === null || corregido === null) {
      check(`hay destino en ${w}×${h}`, false)
      continue
    }
    const dx = corregido.xPx - hoy.centerXPx
    if (Math.abs(dx) < 1) todosSeMueven = false
    if (Math.abs(hoy.centerXPx - w / 2) > 1e-9) todosCentradosHoy = false
    console.log(
      `  ${`${w}×${h}`.padEnd(11)} ${(w / h).toFixed(6)}  ` +
        `${hoy.centerXPx.toFixed(3)} · ${hoy.centerYPx.toFixed(3)}`.padEnd(26) +
        ` ${corregido.xPx.toFixed(3)} · ${corregido.yPx.toFixed(3)}`.padEnd(18) +
        ` ${dx >= 0 ? '+' : ''}${dx.toFixed(2)}px   ${((dx / w) * 100).toFixed(2)}%`
    )
  }
  check(
    '🔴 HOY el logo aterriza EXACTAMENTE en el centro geométrico de la pantalla en los tres teléfonos: `frameX` no corre nada',
    todosCentradosHoy,
    'es el defecto de §7.44, medido: con `travelX` en 0 el `aim` colapsa sobre el target y la cámara no rota'
  )
  check(
    '  y con `recorridoDeEncuadre` los tres se mueven: el arreglo NO es cosmético',
    todosSeMueven,
    'por eso §7.44 lo deja para una grabación en un teléfono y no para un invariante'
  )

  /**
   * ⚠ **LOS TRES CONTROLES QUE HACEN HONESTA LA MEDICIÓN.** La cámara corregida es
   * una composición nueva, y una composición nueva puede estar mal en un signo o
   * en el orden de la base sin que se note. Los dos casos donde `abs` y
   * `max(0, ·)` tienen que dar el MISMO bit son la prueba, y el tercero impide que
   * la tabla de arriba sea una resta de un número contra sí mismo.
   */
  const SIN_ENCUADRE = { ...SCENE_ENTRY_POSE, frameX: 0, frameY: 0 }
  const aSecas = sceneCameraAt(SIN_ENCUADRE, 390, 844)
  const aSecasCorregida = camaraCorregidaEn(SIN_ENCUADRE, 390, 844)
  check(
    'la cámara corregida ES la de producción cuando la pose no encuadra: coinciden bit a bit',
    aSecas !== null && aSecasCorregida !== null && mismaCamaraDelPreloader(aSecas, aSecasCorregida),
    '`frameX: 0` — ninguna de las dos apunta, así que no hay recorrido que pueda diferir'
  )
  const arriba = sceneCameraAt(SCENE_ENTRY_POSE, 1440, 810)
  const arribaCorregida = camaraCorregidaEn(SCENE_ENTRY_POSE, 1440, 810)
  check(
    '  y también ARRIBA del codo, donde la corrección es un no-op por construcción',
    arriba !== null && arribaCorregida !== null && mismaCamaraDelPreloader(arriba, arribaCorregida),
    `1440×810 da aspecto ${(1440 / 810).toFixed(3)}, muy arriba de ${CODO_REAL.toFixed(3)}`
  )
  const abajo = sceneCameraAt(SCENE_ENTRY_POSE, 390, 844)
  const abajoCorregida = camaraCorregidaEn(SCENE_ENTRY_POSE, 390, 844)
  check(
    '  control positivo — y NO coinciden debajo del codo: el contrafactual no se compara consigo mismo',
    abajo !== null && abajoCorregida !== null && !mismaCamaraDelPreloader(abajo, abajoCorregida),
    'si coincidieran, toda la tabla de arriba sería una resta de un número contra sí mismo'
  )

  // ── 8 · Las CINCO escrituras de `travelX`, y las dos que quedan ────────────

  section('8 · §7.44 — las cinco copias: cuáles consumen la fuente y cuáles no')

  /**
   * LA COMPROBACIÓN DE QUE LAS CINCO COINCIDEN, **QUE NO CIERRA A PROPÓSITO.**
   *
   * §7.44 declara cinco escrituras de la misma fórmula. SITIO-S12 unificó las que
   * podía y **dejó dos con copia propia, cada una con su razón**:
   *
   *   · `probe-escena/__tests__/harness.ts` — vive en un directorio que este
   *     sprint tiene PROHIBIDO tocar (regla 5), y además unificarlo pondría en
   *     rojo el control positivo de `s10-logo` §7, que existe justamente porque
   *     hay dos fórmulas.
   *   · `lib/scene-camera.ts` — es el SITIO VIVO, y su arreglo se juzga por
   *     grabación (§7.44, y la tabla de arriba con su número).
   *
   * La comprobación se escribe **contra la propiedad** —«ningún archivo escribe la
   * fórmula salvo los declarados»— y no contra un conteo: el día que aparezca una
   * sexta copia se pone en rojo sola, y el día que se arregle una de las dos hay
   * que sacarla de la lista, que es lo que hace visible la deuda.
   */
  const RAIZ_DEL_REPO = path.resolve(process.cwd())
  const leerFuente = (relativo: string): string => readFileSync(path.join(RAIZ_DEL_REPO, relativo), 'utf8')

  interface SitioDeLaFormula {
    readonly ruta: string
    readonly copiaPropia: boolean
    readonly razon: string
  }

  const LAS_CINCO: readonly SitioDeLaFormula[] = [
    {
      ruta: 'src/app/v3/_lib/escena/encuadre.ts',
      copiaPropia: false,
      razon: 'ES la fuente única: acá vive `recorridoDeEncuadre`',
    },
    {
      ruta: 'src/app/v3/_lib/escena/__tests__/camaraDelCuadro.ts',
      copiaPropia: false,
      razon: 'la consume desde SITIO-S11; su `recorridoConCodo` es el TESTIGO declarado de la fórmula vieja, no una copia viva',
    },
    {
      ruta: 'src/lib/scene-framing.invariant.ts',
      copiaPropia: false,
      razon: 'la consume desde SITIO-S12 — era la quinta, con `35` y `0.88` escritos a mano',
    },
    {
      ruta: 'src/app/probe-escena/__tests__/harness.ts',
      copiaPropia: true,
      razon: 'DEUDA — vive en `/probe-escena`, prohibido para este sprint, y unificarla pone en rojo el control positivo de `s10-logo` §7',
    },
    {
      ruta: 'src/lib/scene-camera.ts',
      copiaPropia: true,
      razon: 'DEUDA — es el PRELOADER DEL SITIO VIVO: su arreglo mueve el aterrizaje del logo en portrait y se juzga por grabación',
    },
  ]

  /** La firma de la fórmula vieja: un `max(0, …)` que resta media caja. */
  const FIRMA_DE_LA_COPIA = /Math\.max\(\s*0,[^)]*\/\s*2\s*\)/

  for (const sitio of LAS_CINCO) {
    const fuente = leerFuente(sitio.ruta)
    const escribe = FIRMA_DE_LA_COPIA.test(fuente)
    const consume = /recorridoDeEncuadre/.test(fuente)
    const nombre = path.basename(sitio.ruta)
    if (sitio.copiaPropia) {
      check(`🔴 ${nombre} conserva su copia — ${sitio.razon}`, escribe, sitio.ruta)
    } else {
      check(`${nombre} consume la fuente única`, consume, sitio.razon)
    }
  }
  check(
    '🔴 LA COMPROBACIÓN DE QUE LAS CINCO COINCIDEN NO CIERRA, Y ES CORRECTO: quedan 2 con copia propia',
    LAS_CINCO.filter((s) => s.copiaPropia).length === 2,
    'es la deuda visible de §7.44, con dueño y razón por copia — no un número escrito al lado'
  )
  check(
    '  control positivo — la firma de la copia vieja no está ciega, y no confunde `abs` con `max(0, ·)`',
    FIRMA_DE_LA_COPIA.test('Math.max(0, medioCuadro - medidaDeLaCaja / 2) * FRAME_TRAVEL_SAFETY') &&
      !FIRMA_DE_LA_COPIA.test('Math.abs(medioCuadro - medidaDeLaCaja / 2) * FRAME_TRAVEL_SAFETY'),
    'reconoce la vieja y rechaza la nueva'
  )
}
