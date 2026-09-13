/**
 * HERO — LAS CUATRO CUENTAS DEL INVARIANTE: §9, §10, §12b y §13.
 *
 * Sale de `hero.invariant.tsx` cuando ese archivo cruzó las 300 líneas del repo
 * al rehacerse el titular, y el corte es el mismo que Trabajos y Cierre ya
 * tienen (`trabajos/soporte.ts`): **las CUENTAS por un lado y las
 * comprobaciones del MARCADO por el otro.**
 *
 * El discriminador no es el tamaño, es de qué depende cada afirmación:
 *
 *   §9   el aire del pie contra la pastilla — tokens del tema y `navegacion.ts`.
 *   §10  el contraste de la tinta sobre el canvas — dos tokens y una razón.
 *   §12b el ajuste de la línea 1 en su caja — el `.woff2` y la geometría.
 *   §13  el freno de B2 — las anclas de los patrones y una ventana.
 *
 * Ninguna de las cuatro necesita el marcado de la sección salvo §9, que sólo
 * busca una clase y por eso lo recibe como parámetro en vez de volver a
 * renderizar: **el render tiene que seguir siendo UNO**, o las dos mitades
 * podrían estar mirando árboles distintos.
 *
 * ⚠ Se llaman EN SU LUGAR desde el invariante, no al final, para que la salida
 * siga leyéndose §1 → §13 de arriba a abajo. Un lector del reporte no tiene por
 * qué saber que el archivo se partió.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, controlPositivo, razonDeContraste, titulo } from '../../_lib/__tests__/afirmar'
import { cajasDeLaSeccion } from '../../_lib/escena/__tests__/s10-logo-cajas'
import { FUENTE_DISPLAY, anchoDeTexto } from '../../_lib/__tests__/s10-avance'
import { tokenPx } from '../../_lib/__tests__/s10-css'
import { ARCHIVO } from '../../_lib/__tests__/s10-mobile'
import { TEXTO_DEL_TITULAR } from '../../_lib/__tests__/s3-banda-consecuencias'
import { ANCLAS, progresoEnRango, rangoDeScroll } from '../../_lib/motion/anclas'
import { ALTO_PASTILLA_PX, DESCUENTO_NACIMIENTO_PX } from '../../_lib/navegacion'
import { COLORES_DEL_CANVAS_DE_PRUEBA, TINTA_HEX } from '../../_lib/superficies'

import { GEOMETRIA } from './geometria'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
/** El tema, leído: los tokens no se transcriben. Si `--spacing-20` cambia de valor,
 *  la cuenta del aire del pie se mueve con él o falla. */
const TEMA = readFileSync(path.join(AQUI, '../../../../..', 'src/app/theme-develop.css'), 'utf8')

/** Un escalón de espaciado, en px. La raíz de 16 la declara el propio tema al lado
 *  del token, en el comentario que traduce cada rem a su píxel. */
function pxDeEspaciado(escalon: string): number {
  const m = new RegExp(`--spacing-${escalon}:\\s*([\\d.]+)rem`).exec(TEMA)
  if (m === null) throw new Error(`--spacing-${escalon} no está declarado en el tema`)
  return Number.parseFloat(m[1]) * 16
}

export function afirmarElPieDeLaPantalla(quieto: string): void {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('9 · El pie de la pantalla es de la pastilla, y el aire alcanza')

  /** El escalón del padding inferior. La clase que se busca en el marcado y el token
   *  que se mide salen de acá: son UNA fuente, no dos que se desincronizan. */
  const ESCALON_DEL_PIE = '20'
  const AIRE_DEL_PIE_PX = pxDeEspaciado(ESCALON_DEL_PIE)

  afirmar(quieto.includes(`pb-${ESCALON_DEL_PIE}`), `el contenedor de pantalla lleva pb-${ESCALON_DEL_PIE}`)
  afirmar(DESCUENTO_NACIMIENTO_PX > 0, `la pastilla ocupa ${DESCUENTO_NACIMIENTO_PX} px del pie`, `alto ${ALTO_PASTILLA_PX} px más su margen`)
  afirmar(AIRE_DEL_PIE_PX >= DESCUENTO_NACIMIENTO_PX, 'y el aire declarado los cubre', `${AIRE_DEL_PIE_PX} px de aire contra ${DESCUENTO_NACIMIENTO_PX} px de pastilla`)
  controlPositivo('la cuenta ve un escalón que NO alcanza', '4', (e: string) => pxDeEspaciado(e) >= DESCUENTO_NACIMIENTO_PX)
  controlPositivo('y el chequeo de la clase ve un contenedor sin ella', '<div class="flex min-h-svh"></div>', (h: string) => h.includes(`pb-${ESCALON_DEL_PIE}`))

}

export function afirmarElContrasteSobreElCanvas(): void {
  titulo('10 · El contraste de la tinta sobre el canvas — producido, no citado')

  /** ⚠ ESTA CIFRA VALE PARA EL MARCADOR DE POSICIÓN DEL CANVAS, no para la escena.
   *  `COLORES_DEL_CANVAS_DE_PRUEBA` son dos tokens planos; la sala 3D es un gradiente
   *  con luces y NO hereda este número. Cuando la escena exista hay que volver a medir
   *  sobre la pose real, y si ahí no diera AA la salida no es una capa de fondo acá. */
  const AA_TEXTO = 4.5
  const razones = COLORES_DEL_CANVAS_DE_PRUEBA.map((c) => ({ token: c.token, razon: razonDeContraste(TINTA_HEX, c.hex) }))
  afirmar(razones.length > 0, `la cuenta mira ${razones.length} colores del canvas de prueba`)
  for (const { token, razon } of razones) {
    afirmar(razon >= AA_TEXTO, `la tinta sobre ${token} da ${razon.toFixed(2)}:1`, `mínimo AA ${AA_TEXTO}:1`)
  }
  const peor = Math.min(...razones.map((r) => r.razon))
  afirmar(peor >= AA_TEXTO, `el PEOR caso es ${peor.toFixed(2)}:1 y pasa AA para texto normal`)
  controlPositivo('la calculadora ve dos colores que no se separan', ['#E8E8E6', '#DBDBD9'] as const, ([a, b]) => razonDeContraste(a, b) >= AA_TEXTO)

}

export function afirmarElAjusteDeLaLinea1(): void {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('12b · LA LÍNEA 1 ENTRA EN UNA SOLA LÍNEA A 1440 — la cuenta, con el binario')

  /**
   * La única condición de esta composición que se rompe cambiando el copy, y la
   * que fija el valor del nivel `display`. Se vuelve a correr acá **con el
   * `.woff2` que la página sirve**, no con las cifras transcritas del tema: si
   * alguien cambia el texto, la caja, el interletrado o re-subsetea la fuente con
   * otro ancho, esto se pone rojo.
   *
   * Los tres términos y de dónde sale cada uno:
   *
   *   la caja      `cajasDeLaSeccion('hero', 1440)`, el mismo instrumento que usa
   *                `s10-logo` §4 para derivar la banda del titular.
   *   el avance    `hmtx` del binario. ⚠ Es la instancia por DEFECTO (wght 600) y
   *                se pinta en 700, que es 1,08 % más ancho: por eso la
   *                afirmación se hace contra el avance del NAVEGADOR, que se
   *                reconstruye multiplicando por el factor medido y declarado.
   *   el hueco     `letter-spacing` se aplica también después del último carácter,
   *                así que contar `n − 1` huecos SOBREESTIMA. Es el lado
   *                conservador.
   */
  const ANCHO_DE_REFERENCIA = 1440
  const CAJA_DEL_TITULAR = cajasDeLaSeccion('hero', ANCHO_DE_REFERENCIA).find((c) => c.clases.includes('text-fluido-display'))
  afirmar(CAJA_DEL_TITULAR !== undefined, 'el instrumento encuentra la caja de la línea 1 por su clase de tamaño')
  if (CAJA_DEL_TITULAR !== undefined) {
    /** Con tolerancia y no por igualdad de bits: la banda sale de dividir el
     *  ancho de contenido entre cinco y después entre tres, así que llega con la
     *  basura del punto flotante (478,3999999999999). Exigir el bit sería exigir
     *  que la división fuera exacta en binario. */
    afirmar(
      Math.abs(CAJA_DEL_TITULAR.banda.ancho - GEOMETRIA.anchoDeLaCajaDelTitularA1440Px) < 0.001,
      `la caja mide ${GEOMETRIA.anchoDeLaCajaDelTitularA1440Px} px a ${ANCHO_DE_REFERENCIA}, como la geometría declara`,
      `${CAJA_DEL_TITULAR.banda.ancho} px medidos`,
    )
    afirmarIgual(CAJA_DEL_TITULAR.fuente, FUENTE_DISPLAY, '  y el instrumento la mide con la cara de display, no con Chivo')
    afirmarIgual(CAJA_DEL_TITULAR.lineas, 1, '  y entra en UNA línea')

    /** El factor del eje de peso: lo que el 700 con el que se pinta agrega sobre
     *  el 600 que `hmtx` publica. Se calcula, no se escribe. */
    const emDelDefecto = anchoDeTexto(ARCHIVO, TEXTO_DEL_TITULAR, 1, 0)
    const huecos = TEXTO_DEL_TITULAR.length - 1
    const emConTracking = emDelDefecto + huecos * CAJA_DEL_TITULAR.interletradoEm
    const anchoPintado = emConTracking * CAJA_DEL_TITULAR.tamanoPx
    const margen = CAJA_DEL_TITULAR.banda.ancho - anchoPintado
    console.log(
      `  "${TEXTO_DEL_TITULAR}"  ${emDelDefecto.toFixed(4)} em (wght 600, de \`hmtx\`) · ` +
        `${emConTracking.toFixed(4)} em con ${CAJA_DEL_TITULAR.interletradoEm} × ${huecos} huecos · ` +
        `${CAJA_DEL_TITULAR.tamanoPx.toFixed(2)} px  →  ${anchoPintado.toFixed(2)} px en ${CAJA_DEL_TITULAR.banda.ancho} px`,
    )
    afirmar(margen > 0, `la línea 1 entra con ${margen.toFixed(2)} px de margen en el peso por defecto`)
    /** El peso REAL con el que se pinta es 700 y `hmtx` publica el 600, así que
     *  la afirmación que importa es la del peso pintado. El factor está MEDIDO
     *  sobre el mismo binario, instanciando el eje, y se declara acá. */
    const FACTOR_DEL_PESO_700 = 8.567 / 8.475
    const anchoEn700 = emDelDefecto * FACTOR_DEL_PESO_700 * CAJA_DEL_TITULAR.tamanoPx + huecos * CAJA_DEL_TITULAR.interletradoEm * CAJA_DEL_TITULAR.tamanoPx
    const margen700 = CAJA_DEL_TITULAR.banda.ancho - anchoEn700
    afirmar(margen700 > 0, `y en el peso 700 —el que se pinta— entra con ${margen700.toFixed(2)} px`, `factor del eje ${FACTOR_DEL_PESO_700.toFixed(4)} medido sobre el mismo binario`)
    /** **EL 58 ES UN TECHO, NO UNA PREFERENCIA**, y esto es lo que lo dice: con
     *  un píxel más, en el peso que se pinta, la línea se pasa de la caja. */
    const anchoA = (tamano: number): number =>
      (emDelDefecto * FACTOR_DEL_PESO_700 + huecos * CAJA_DEL_TITULAR.interletradoEm) * tamano
    const unoMas = CAJA_DEL_TITULAR.tamanoPx + 1
    afirmar(
      anchoA(unoMas) > CAJA_DEL_TITULAR.banda.ancho,
      `y con ${unoMas.toFixed(0)} px NO entra: ${anchoA(unoMas).toFixed(2)} px contra una caja de ${CAJA_DEL_TITULAR.banda.ancho} — el tamaño del nivel es un TECHO derivado`,
    )
    controlPositivo(
      'la cuenta sabe decir que NO entra: con el techo de la banda (el tamaño a 1920) se pasa',
      tokenPx('--text-fluido-display', 1920),
      (tamano: number) => anchoA(tamano) <= CAJA_DEL_TITULAR.banda.ancho,
    )
  }

  /** La línea 2 entra con aire: es un nivel más abajo y la mitad de caracteres. */
  const CAJA_DE_LA_LINEA_2 = cajasDeLaSeccion('hero', ANCHO_DE_REFERENCIA).find((c) => c.clases.includes('text-fluido-display-xl'))
  afirmar(CAJA_DE_LA_LINEA_2 !== undefined, 'el instrumento también encuentra la caja de la línea 2')
  if (CAJA_DE_LA_LINEA_2 !== undefined) {
    afirmarIgual(CAJA_DE_LA_LINEA_2.lineas, 1, '  y la línea 2 entra en UNA línea')
    afirmar(CAJA_DE_LA_LINEA_2.tamanoPx > (CAJA_DEL_TITULAR?.tamanoPx ?? 0), `  y es MÁS GRANDE que la línea 1 —el titular quedó invertido a propósito—: ${CAJA_DE_LA_LINEA_2.tamanoPx.toFixed(2)} contra ${(CAJA_DEL_TITULAR?.tamanoPx ?? 0).toFixed(2)} px`, `razón ${(CAJA_DE_LA_LINEA_2.tamanoPx / (CAJA_DEL_TITULAR?.tamanoPx ?? 1)).toFixed(3)}`)
  }

}

export function afirmarElFrenoDeB2(): void {
  titulo('13 · B2 · POR QUÉ EL HERO NO PUEDE APORTAR UN ATERRIZAJE — el freno, con su aritmética')

  /**
   * ⚠ **FRENO DECLARADO.** B2 pedía dos acontecimientos acá —«la bajada y el CTA
   * entran DESPUÉS del titular»— y **no se hizo**. Ésta es la razón, y no es una
   * opinión: es el ancla de cada patrón evaluada sobre la caja medida del bloque. Un
   * acontecimiento es un ATERRIZAJE: el píxel donde un bloque deja de cambiar, o sea
   * el `fin` de su rango. Con `fondo = topDoc + alto` y ventana `V`, P2 (`bottom
   * bottom`) cierra en `fondo − V` y P1 (`bottom bottom-=240px`) en `fondo − V + 240`.
   * **El hero mide UNA pantalla** —`s8-chrome` §2 lo clava y §1 lo afirma— así que el
   * fondo de cualquier bloque suyo es ≤ V: **un P2 del hero nunca aterriza adentro de
   * la pantalla**, y un P1 sólo si su fondo pasa de `V − 240` = 840 px, o sea con el
   * texto en los últimos 240 px del cuadro, que son los de la pastilla (§9). Las cajas
   * de abajo están MEDIDAS a 1920×1080, pestaña visible, con `offsetTop`/`offsetHeight`
   * —que la transformada no contamina—, y el censo de `B2-DELTAS.md` §0 (de `y` 0 a
   * 4800, paso 120) lo confirma del otro lado: **cero elementos del hero cambian de
   * estilo en todo el recorrido**; el «1 acontecimiento» que la Fase 0 le atribuía es
   * el grupo de `y` 600, de Quiénes somos.
   *
   * Las tres salidas, para que quien lo reabra no las vuelva a recorrer:
   * (a) `anclaje="seccion"` sube el P1 a `fin` 240 y deja el h1 a 0,8065 de progreso
   * en el PRIMER CUADRO —servido a media entrada, que es lo que la composición del
   * hero decidió no hacer—, y el P2 sigue cerrando en 0; (b) un patrón con fracción
   * de viewport chica en su `fin` sí aterriza adentro (P3 → `fondo − 540`; P4 y P6 →
   * `fondo`), pero `contenido.ts` declara `PATRONES_DE_LA_SECCION = ['P1','P2']` y
   * ese archivo está fuera de este frente; (c) darle dos pantallas al hero, que §1 y
   * `s8-chrome` §2 prohíben.
   */
  const VENTANA_MEDIDA = 1080
  const CAJAS_DEL_HERO = [
    { nombre: 'titular (P1)', par: ANCLAS.P1, topDoc: 403, alto: 142 },
    { nombre: 'bajada + CTA (P2)', par: ANCLAS.P2, topDoc: 577, alto: 143 },
  ] as const
  for (const c of CAJAS_DEL_HERO) {
    const fin = rangoDeScroll(c.par, { topDoc: c.topDoc, alto: c.alto }, VENTANA_MEDIDA).fin
    afirmar(fin <= 0, `el ${c.nombre} cierra su rango en y ${fin}: ARRIBA del documento, así que no hay aterrizaje que medir`, `fondo ${c.topDoc + c.alto} px en una ventana de ${VENTANA_MEDIDA}`)
  }
  const SECCION_ENTERA = { topDoc: 0, alto: VENTANA_MEDIDA }
  afirmarIgual(rangoDeScroll(ANCLAS.P2, SECCION_ENTERA, VENTANA_MEDIDA).fin, 0, 'y ni con la SECCIÓN entera como caja un P2 pasa de cero: es el techo aritmético de una pantalla')
  afirmarIgual(rangoDeScroll(ANCLAS.P1, SECCION_ENTERA, VENTANA_MEDIDA).fin, 240, '  el P1 sí llegaría a 240 con esa caja — el único aterrizaje posible, y uno solo')
  const PROGRESO_AL_CARGAR = progresoEnRango(0, rangoDeScroll(ANCLAS.P1, SECCION_ENTERA, VENTANA_MEDIDA))
  afirmar(PROGRESO_AL_CARGAR < 1, `  y lo que cuesta: el titular llegaría al primer cuadro con ${PROGRESO_AL_CARGAR.toFixed(4)} de progreso`, 'servido a media entrada — la salida (a) del docblock')
  controlPositivo('la cuenta ve un bloque que SÍ aterriza adentro: uno de dos pantallas', { topDoc: 0, alto: 2 * VENTANA_MEDIDA }, (c) => rangoDeScroll(ANCLAS.P2, c, VENTANA_MEDIDA).fin <= 0)
  controlPositivo('  y ve un patrón cuyo `fin` no descuenta viewport: P4 aterriza en el fondo del bloque', ANCLAS.P4, (par) => rangoDeScroll(par, CAJAS_DEL_HERO[1], VENTANA_MEDIDA).fin <= 0)

}
