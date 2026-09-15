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

import { lineasDeCodigo } from '@/app/v3/_lib/__tests__/s8-largos'

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

  // ── 8 · Las CINCO escrituras de `travelX`, y la que queda ─────────────────

  section('8 · §7.44 — las cinco copias: quién es fuente, quién consume, quién es testigo')

  /**
   * EL CENSO DE LA FÓRMULA, **QUE YA NO TIENE DOS COPIAS SINO UNA.**
   *
   * §7.44 declara cinco escrituras de la misma aritmética. SITIO-S12 unificó las
   * que podía y dejó dos con copia propia; **ENCUADRE-1 cerró la del arnés**
   * —`harness.ts` importa `recorridoDeEncuadre`— y queda una sola: la del sitio
   * vivo, que se juzga por grabación.
   *
   * ── ⚠️ DOS COSAS CAMBIARON ACÁ, Y NINGUNA ES «BAJAR LA VARA» ──────────────
   *
   * **1 · El escáner lee CÓDIGO, no el archivo crudo — §7.25 otra vez.** La
   * firma es una regex sobre el fuente, y tres de los cinco archivos NOMBRAN la
   * fórmula vieja en un comentario para explicarla. Medido sobre el árbol de
   * ENCUADRE-1: `harness.ts` daba `escribe = true` por una línea de su docblock
   * que dice *«`cameraAt` escribía `Math.max(0, medioCuadro − caja/2)`»*, o sea
   * que **el censo habría seguido en verde declarando una copia que ya no
   * existía**, y `encuadre.ts` —la fuente— también matchea en crudo por el mismo
   * motivo. Se descartan los comentarios con `lineasDeCodigo`, que es la misma
   * pieza que usa el censo de la lente (`s16-arnes.invariant.ts` §3).
   *
   * **2 · El ROL reemplaza al booleano.** `camaraDelCuadro.ts` consumía la
   * fuente y ahora no: desde ENCUADRE-1 guarda el CONTRAFACTUAL
   * (`recorridoConCodo` + `camaraConCodo`), o sea que escribe la fórmula vieja a
   * propósito. Con un booleano de dos valores eso sólo se podía escribir como
   * «copia propia» —que es falso— o como «consume» —que también—. Son cuatro
   * roles y cada uno tiene su comprobación distinta.
   *
   * Se afirma **contra la propiedad** y no contra un conteo: el día que aparezca
   * una sexta escritura se pone en rojo sola, y el día que se arregle la que
   * queda hay que sacarla de la lista, que es lo que hace visible la deuda.
   */
  const RAIZ_DEL_REPO = path.resolve(process.cwd())
  const codigoDe = (relativo: string): string =>
    lineasDeCodigo(readFileSync(path.join(RAIZ_DEL_REPO, relativo), 'utf8')).join('\n')

  type RolDeLaFormula = 'fuente' | 'consume' | 'testigo' | 'copiaPropia'

  interface SitioDeLaFormula {
    readonly ruta: string
    readonly rol: RolDeLaFormula
    readonly razon: string
  }

  const LAS_CINCO: readonly SitioDeLaFormula[] = [
    {
      ruta: 'src/app/v3/_lib/escena/encuadre.ts',
      rol: 'fuente',
      razon: 'ES la fuente única: acá vive `recorridoDeEncuadre`, y su código no escribe la vieja',
    },
    {
      ruta: 'src/app/probe-escena/__tests__/harness.ts',
      rol: 'consume',
      razon: 'la consume desde ENCUADRE-1 — era la copia que §7.44 declaraba como deuda, y el arreglo es el que `camaraDelCuadro.ts` tenía escrito',
    },
    {
      ruta: 'src/lib/scene-framing.invariant.ts',
      rol: 'consume',
      razon: 'la consume desde SITIO-S12 — era la quinta, con `35` y `0.88` escritos a mano',
    },
    {
      ruta: 'src/app/v3/_lib/escena/__tests__/camaraDelCuadro.ts',
      rol: 'testigo',
      razon:
        'TESTIGO declarado: escribe la vieja a propósito (`recorridoConCodo` + `camaraConCodo`) para que §7 de `s10-logo` tenga contrafactual. Sin él, ese control positivo compara la fórmula nueva contra sí misma',
    },
    {
      ruta: 'src/lib/scene-camera.ts',
      rol: 'copiaPropia',
      razon:
        'DEUDA — es el PRELOADER DEL SITIO VIVO: su arreglo mueve el aterrizaje del logo en portrait y se juzga por grabación',
    },
  ]

  /** La firma de la fórmula vieja: un `max(0, …)` que resta media caja. */
  const FIRMA_DE_LA_COPIA = /Math\.max\(\s*0,[^)]*\/\s*2\s*\)/

  for (const sitio of LAS_CINCO) {
    const codigo = codigoDe(sitio.ruta)
    const escribe = FIRMA_DE_LA_COPIA.test(codigo)
    const consume = /recorridoDeEncuadre/.test(codigo)
    const nombre = path.basename(sitio.ruta)
    if (sitio.rol === 'fuente') {
      check(`${nombre} ES la fuente`, consume && !escribe, sitio.razon)
    } else if (sitio.rol === 'consume') {
      check(`${nombre} consume la fuente única, y no escribe la vieja`, consume && !escribe, sitio.razon)
    } else if (sitio.rol === 'testigo') {
      check(`${nombre} guarda el TESTIGO de la fórmula vieja`, escribe && !consume, sitio.razon)
    } else {
      check(`\u{1F534} ${nombre} conserva su copia — ${sitio.razon}`, escribe, sitio.ruta)
    }
  }

  /**
   * ⚠ **EL CONTEO BAJÓ DE 2 A 1 PORQUE UNA COPIA SE CERRÓ, NO PORQUE SE AFLOJE
   * LA VARA.** La comprobación sigue siendo la misma —«queda deuda, y ésta es»—
   * y sigue marcada 🔴: el día que `scene-camera.ts` consuma la fuente, esta
   * línea se pone en rojo y hay que sacarla de la lista. Es lo que hace visible
   * que la deuda se pagó.
   */
  const conCopiaPropia = LAS_CINCO.filter((s) => s.rol === 'copiaPropia')
  check(
    '\u{1F534} LA COMPROBACIÓN DE QUE LAS CINCO COINCIDEN NO CIERRA, Y ES CORRECTO: queda 1 con copia propia',
    conCopiaPropia.length === 1 && conCopiaPropia[0].ruta === 'src/lib/scene-camera.ts',
    'ENCUADRE-1 cerró la de `harness.ts`; la del preloader sigue abierta y se juzga por grabación'
  )
  check(
    '  control positivo — la firma de la copia vieja no está ciega, y no confunde `abs` con `max(0, ·)`',
    FIRMA_DE_LA_COPIA.test('Math.max(0, medioCuadro - medidaDeLaCaja / 2) * FRAME_TRAVEL_SAFETY') &&
      !FIRMA_DE_LA_COPIA.test('Math.abs(medioCuadro - medidaDeLaCaja / 2) * FRAME_TRAVEL_SAFETY'),
    'reconoce la vieja y rechaza la nueva'
  )
  /**
   * ⚠ **EL CONTROL QUE PRUEBA QUE DESCARTAR COMENTARIOS ERA EL ARREGLO.** Sobre
   * el archivo CRUDO, `harness.ts` matchea la firma —por su docblock— y sobre su
   * código no. Si alguien devuelve el escáner al fuente crudo, el censo vuelve a
   * declarar una copia que no existe, y esta línea lo dice con los dos valores.
   */
  const crudoDelArnes = readFileSync(
    path.join(RAIZ_DEL_REPO, 'src/app/probe-escena/__tests__/harness.ts'),
    'utf8'
  )
  check(
    '  control positivo — el escáner lee CÓDIGO: en crudo el arnés todavía «escribe» la fórmula, en un comentario',
    FIRMA_DE_LA_COPIA.test(crudoDelArnes) &&
      !FIRMA_DE_LA_COPIA.test(codigoDe('src/app/probe-escena/__tests__/harness.ts')),
    'si el censo leyera el archivo crudo daría por viva una copia borrada — §7.25, el escáner que lee el texto que lo describe'
  )
}
