/**
 * EL CENSO DE `travelX` — §7.44, las copias de la fórmula.
 *
 * Sale de `scene-framing.invariant.ts` en SITIO-S12, cuando las dos secciones lo
 * cruzaron las 300 líneas del repo. El corte es por tema y es real: **el
 * invariante de al lado verifica que el DESTINO sea correcto; esto mide dónde
 * vive la fórmula que lo produce.** Cambiar el destino no toca este censo, y
 * cerrar una copia no toca el destino.
 *
 * ⚠️ **Modo pulido bajó el censo de CINCO sitios a CUATRO.** `scene-framing.
 * invariant.ts` consumía `recorridoDeEncuadre` sólo desde las secciones de
 * destino/clamp que eran composición; al desarmarlas, el archivo dejó de tocar
 * la fórmula por completo y se retira del censo — no queda un fantasma.
 *
 * Recibe el arnés del invariante en vez de traer el suyo: dos contadores de
 * comprobaciones sobre el mismo archivo darían dos resúmenes y ninguno sería el
 * del archivo.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { lineasDeCodigo } from '@/app/v3/_lib/__tests__/s8-largos'

/** El arnés del invariante que lo consume. No se duplica acá. */
export interface ArnesDeComprobacion {
  readonly check: (etiqueta: string, condicion: boolean, detalle?: string) => void
  readonly section: (titulo: string) => void
}

export function afirmarLaDeudaDeTravelX({ check, section }: ArnesDeComprobacion): void {
  // ── 8 · Las escrituras de `travelX`, y la que queda ───────────────────────

  section('8 · §7.44 — las copias: quién es fuente, quién consume, quién es testigo')

  /**
   * EL CENSO DE LA FÓRMULA, **QUE YA NO TIENE DOS COPIAS SINO UNA.**
   *
   * §7.44 declaraba cinco escrituras de la misma aritmética. SITIO-S12 unificó
   * las que podía y dejó dos con copia propia; **ENCUADRE-1 cerró la del
   * arnés** —`harness.ts` importa `recorridoDeEncuadre`— y **Modo pulido cerró
   * la de `scene-framing.invariant.ts`**, no arreglándola sino retirándola: la
   * sección que la consumía era composición y se desarmó, así que ese sitio ya
   * no tiene relación con la fórmula. Quedan CUATRO sitios y una sola deuda: la
   * del sitio vivo, que se juzga por grabación.
   *
   * ── ⚠️ DOS COSAS CAMBIARON ACÁ, Y NINGUNA ES «BAJAR LA VARA» ──────────────
   *
   * **1 · El escáner lee CÓDIGO, no el archivo crudo — §7.25 otra vez.** La
   * firma es una regex sobre el fuente, y varios de los archivos NOMBRAN la
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
   * una escritura nueva se pone en rojo sola, y el día que se arregle la que
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

  const LOS_CUATRO: readonly SitioDeLaFormula[] = [
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

  for (const sitio of LOS_CUATRO) {
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
  const conCopiaPropia = LOS_CUATRO.filter((s) => s.rol === 'copiaPropia')
  check(
    '\u{1F534} LA COMPROBACIÓN DE QUE LOS CUATRO COINCIDEN NO CIERRA, Y ES CORRECTO: queda 1 con copia propia',
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
