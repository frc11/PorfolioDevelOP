/**
 * HERO — §15, LAS CUATRO CUENTAS DE PAPEL-2.
 *
 * Sale aparte de `hero.invariant.tsx`, `soporte.ts` y `composicion.ts` por la
 * regla de las 300 líneas del repo, y el corte es el mismo que el de COMPO-1:
 * **acá viven las cuentas de ESTE sprint**, allá las de los anteriores. Las
 * cuatro contestan una pregunta distinta:
 *
 *   §15a  el registro 1 iguala la tinta del registro 2 — la razón recalculada
 *         contra los dos binarios, y los dos `calc()` del tema diciéndola.
 *   §15b  a 320 aplican DOS variantes `max-` a la vez, y gana la que debe: se
 *         lee del CSS CONSTRUIDO, no del fuente.
 *   §15c  el bloque ENTERO —marca incluida— entra en 667 px y en 568.
 *   §15d  la pastilla apagada y el pie que cobra sus 72 px, con `pb-20` vivo.
 *
 * ── ⚠️ POR QUÉ §15b SE LEE DEL BUILD Y NO DEL FUENTE ─────────────────────
 *
 * Porque la pregunta es **del orden de la cascada**, y el orden lo decide
 * Tailwind al emitir, no el archivo donde están escritas las clases. A 320 las
 * tres clases de tamaño del registro 1 aplican a la vez —la base, `max-chico:`
 * y `max-angosto:`— y cuál gana depende de en qué orden salieron las reglas.
 * Afirmarlo mirando el `className` sería afirmar lo que uno quiso, no lo que
 * pasa; y `clasesEfectivas` no puede ayudar, porque su propio docblock declara
 * que los prefijos `max-` los conserva enteros.
 *
 * Si no hay build, §15b **no corre y lo dice** (`noCorre`), que es la tercera
 * salida que `afirmar.ts` existe para dar.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, controlPositivo, noCorre, titulo } from '../../_lib/__tests__/afirmar'
import { FUENTE_DISPLAY, FUENTE_ITALICA, anchoDeTexto } from '../../_lib/__tests__/s10-avance'
import { leerAvancesDe } from '../../_lib/__tests__/s10-woff2'
import { BREAKPOINTS, tokenPx } from '../../_lib/__tests__/s10-css'
import { tracking } from '../../_lib/__tests__/s10-mobile'
import { medidaDelTitular } from '../../_lib/__tests__/s3-banda-consecuencias'
import { CLASE_DE_LA_PASTILLA_APAGADA, PASTILLA_APAGADA_ABAJO_DE_MEDIO } from '../../_chrome/contrato'
import { DESCUENTO_NACIMIENTO_PX } from '../../_lib/navegacion'

import { CONTENIDO } from './contenido'
import { FACTOR_DEL_PESO_700, tamanoDeLaFila3 } from './composicion'
import { GEOMETRIA, TIPOGRAFIA_DEL_TITULAR } from './geometria'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const RAIZ = path.resolve(AQUI, '../../../../..')
const TEMA = readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8')

/** Los dos anchos que este sprint pinta en papel, con el alto del set. */
const PAPEL = [
  { ancho: 320, alto: 568 },
  { ancho: 375, alto: 667 },
] as const

/** Los seis que el §6 del sprint declara intocables. */
const INTOCABLES = [390, 425, 768, 1024, 1440, 1920] as const

/** La tolerancia que el pedido fija para la igualdad de tinta. */
const TOLERANCIA_PX = 2

/** La razón de la caja de tinta del isotipo — `LOGO_INK_VIEWBOX` de `LogoMark`. */
const RAZON_DEL_ISOTIPO = 978.459 / 680.67

/** Lee el número que multiplica adentro de un `calc(var(--x) * N)` del tema. */
function razonDeclaradaEn(token: string): number | null {
  const m = new RegExp(`${token}:\\s*calc\\(var\\(--[a-z0-9-]+\\)\\s*\\*\\s*([\\d.]+)\\)`).exec(TEMA)
  return m === null ? null : Number.parseFloat(m[1])
}

/** El token del registro 2 que cada régimen del registro 1 multiplica. */
function tokenBaseDe(token: string): string | null {
  const m = new RegExp(`${token}:\\s*calc\\(var\\((--[a-z0-9-]+)\\)`).exec(TEMA)
  return m === null ? null : m[1]
}

export function afirmarElPapelDePapel2(quieto: string): void {
  const DISPLAY = leerAvancesDe(FUENTE_DISPLAY)
  const ITALICA = leerAvancesDe(FUENTE_ITALICA)
  const FILA_1 = CONTENIDO.titularFila1.toUpperCase()
  const FILA_2 = CONTENIDO.titularFila2.toUpperCase()
  const FILA_3 = CONTENIDO.titularFila3.toUpperCase()

  /** El avance en `em` de una cadena en la cara de display, con el peso corregido. */
  const emDisplay = (t: string): number =>
    anchoDeTexto(DISPLAY, t, 1, tracking('display')) * FACTOR_DEL_PESO_700
  const emItalica = (t: string): number => anchoDeTexto(ITALICA, t, 1, tracking('titulo'))

  // ═════════════════════════════════════════════════════════════════════════
  titulo('15a · PAPEL-2 · El registro 1 iguala la tinta del registro 2')

  const AVANCE_1 = emDisplay(FILA_1)
  const AVANCE_2 = emDisplay(FILA_2)
  const AVANCE_MAS_ANCHO = Math.max(AVANCE_1, AVANCE_2)
  const AVANCE_3 = emItalica(FILA_3)

  afirmar(
    AVANCE_1 > AVANCE_2,
    `la fila MÁS ANCHA del registro 1 es «${FILA_1}» y es la que fija la razón`,
    `${AVANCE_1.toFixed(5)} em contra ${AVANCE_2.toFixed(5)} de «${FILA_2}»`,
  )

  /**
   * ⚠️ **LA RAZÓN NO SE ESCRIBE: SE RECALCULA.** Los dos tokens del tema llevan
   * el mismo literal, y ése es exactamente el patrón que se desincroniza en
   * silencio —el mismo que `tokens.invariant` §7b ata para los dos 375—. Acá se
   * vuelve a sacar de los binarios y se compara contra los dos.
   */
  const RAZON = AVANCE_3 / AVANCE_MAS_ANCHO
  afirmar(
    Number.isFinite(RAZON) && RAZON > 1,
    `la razón entre los dos registros es ${RAZON.toFixed(5)} — el registro 1 tiene que CRECER, que es lo que el escalón decía`,
    `${AVANCE_3.toFixed(5)} em / ${AVANCE_MAS_ANCHO.toFixed(5)} em`,
  )

  const TOKENS_DEL_REGISTRO_1 = ['--text-display-r1-papel', '--text-display-r1-papel-angosto'] as const
  for (const token of TOKENS_DEL_REGISTRO_1) {
    const declarada = razonDeclaradaEn(token)
    afirmar(
      declarada !== null && Math.abs(declarada - RAZON) < 1e-4,
      `\`${token}\` declara ${declarada ?? '—'}, que ES la razón medida`,
      `desvío ${declarada === null ? '—' : Math.abs(declarada - RAZON).toExponential(2)}`,
    )
  }
  afirmarIgual(
    TOKENS_DEL_REGISTRO_1.map(razonDeclaradaEn),
    [razonDeclaradaEn(TOKENS_DEL_REGISTRO_1[0]), razonDeclaradaEn(TOKENS_DEL_REGISTRO_1[0])],
    '  y los DOS dicen el mismo número: es un hecho medido escrito dos veces, no dos decisiones',
  )
  afirmarIgual(
    TOKENS_DEL_REGISTRO_1.map(tokenBaseDe),
    ['--text-fluido-display-xl', '--text-display-xl-angosto'],
    '  y cada uno multiplica al token del registro 2 que manda en SU régimen',
  )
  controlPositivo(
    'el lector de la razón ve un token que no la declara',
    '--text-display-r1-papel: 74px;',
    (css: string) => /--text-display-r1-papel:\s*calc\(/.test(css),
  )

  /** La igualdad de tinta, que es lo que el pedido mide. */
  for (const { ancho } of PAPEL) {
    const tamano3 = tamanoDeLaFila3(ancho)
    const tamano1 = tamano3 * RAZON
    const tinta3 = AVANCE_3 * tamano3
    const tinta1 = AVANCE_MAS_ANCHO * tamano1
    const caja = medidaDelTitular(ancho)
    afirmar(
      Math.abs(tinta1 - tinta3) <= TOLERANCIA_PX,
      `@${ancho}: «${FILA_1}» a ${tamano1.toFixed(2)} px mide ${tinta1.toFixed(2)} px y «${FILA_3}» a ${tamano3.toFixed(2)} mide ${tinta3.toFixed(2)}`,
      `desvío ${Math.abs(tinta1 - tinta3).toFixed(4)} px contra una tolerancia de ${TOLERANCIA_PX}`,
    )
    afirmar(
      tinta1 <= caja,
      `  y entra en la caja del titular: ${tinta1.toFixed(2)} px contra ${caja.toFixed(2)}`,
      `techo de la caja ${(caja / AVANCE_MAS_ANCHO).toFixed(2)} px de tipografía`,
    )
    afirmar(
      AVANCE_2 * tamano1 < tinta1,
      `  y «${FILA_2}», que es la otra fila, queda por debajo: ${(AVANCE_2 * tamano1).toFixed(2)} px`,
    )
  }

  /**
   * ⚠️ **EL CONTROL QUE HACE QUE ESTO SIGNIFIQUE ALGO.** Sin él, «las dos tintas
   * son iguales» pasaría en verde igual si el registro 1 no hubiera cambiado —
   * que es justamente el estado ANTERIOR, y el que el §3 vino a arreglar.
   */
  for (const { ancho } of PAPEL) {
    const hoy = tokenPx('--text-fluido-display', ancho)
    const tinta3 = AVANCE_3 * tamanoDeLaFila3(ancho)
    afirmar(
      Math.abs(AVANCE_MAS_ANCHO * hoy - tinta3) > TOLERANCIA_PX,
      `y SIN el cambio el escalón está: @${ancho} el registro 1 a ${hoy.toFixed(2)} px mide ${(AVANCE_MAS_ANCHO * hoy).toFixed(2)} contra ${tinta3.toFixed(2)}`,
      `escalón de ${(tinta3 - AVANCE_MAS_ANCHO * hoy).toFixed(2)} px`,
    )
  }

  // ═════════════════════════════════════════════════════════════════════════
  titulo('15b · PAPEL-2 · A 320 aplican DOS `max-`, y gana la de 375')

  /**
   * El orden lo emite Tailwind y se lee del CSS construido. El criterio que se
   * afirma: **todas** las reglas `max-chico:` salen antes que **todas** las
   * `max-angosto:`, así que en el tramo donde las dos aplican —abajo de 375—
   * manda la segunda, que es el régimen más chico. Si Tailwind cambiara ese
   * orden, el registro 1 se pintaría a 74 px en una caja de 256 y se saldría.
   */
  const DIR_CSS = path.join(RAIZ, '.next/static/css')
  if (!existsSync(DIR_CSS)) {
    noCorre('el orden de las dos variantes `max-`', 'no hay build: `.next/static/css` no existe')
  } else {
    const hojas = readdirSync(DIR_CSS).filter((f) => f.endsWith('.css'))
    const conLasDos = hojas
      .map((f) => readFileSync(path.join(DIR_CSS, f), 'utf8'))
      .find((css) => css.includes('.max-chico\\:') && css.includes('.max-angosto\\:'))
    if (conLasDos === undefined) {
      noCorre('el orden de las dos variantes `max-`', 'ninguna hoja construida tiene las dos variantes')
    } else {
      const ultimaChico = conLasDos.lastIndexOf('.max-chico\\:')
      const primeraAngosto = conLasDos.indexOf('.max-angosto\\:')
      afirmar(
        ultimaChico < primeraAngosto,
        'en el CSS construido TODAS las reglas `max-chico:` salen antes que TODAS las `max-angosto:`',
        `última chico en ${ultimaChico}, primera angosto en ${primeraAngosto}`,
      )
      afirmar(
        conLasDos.includes('.max-chico\\:text-display-r1-papel') &&
          conLasDos.includes('.max-angosto\\:text-display-r1-papel-angosto'),
        '  y las dos reglas del registro 1 existen en el build: Tailwind vio las dos clases',
      )
      controlPositivo(
        'el lector del orden ve una hoja con las dos dadas vuelta',
        '.max-angosto\\:x{} .max-chico\\:y{}',
        (css: string) => css.lastIndexOf('.max-chico\\:') < css.indexOf('.max-angosto\\:'),
      )
    }
  }

  afirmar(
    TIPOGRAFIA_DEL_TITULAR.includes('max-chico:text-display-r1-papel') &&
      TIPOGRAFIA_DEL_TITULAR.includes('max-angosto:text-display-r1-papel-angosto'),
    'la tipografía del registro 1 lleva las DOS variantes escritas enteras — Tailwind escanea el fuente y una clase armada no la ve',
  )
  afirmar(
    TIPOGRAFIA_DEL_TITULAR.includes('text-fluido-display '),
    '  y conserva la base sin variante, que es la que pintan los seis anchos intocables',
  )
  afirmar(quieto.includes('max-chico:text-display-r1-papel'), '  y las dos llegan al marcado real')

  // ═════════════════════════════════════════════════════════════════════════
  titulo('15c · PAPEL-2 · La marca arriba, y el bloque entero entra')

  afirmar(quieto.includes('data-pieza="logotipo"'), 'la palabra `develOP` está en el marcado del Hero')
  afirmar(quieto.includes('data-pieza="isotipo"'), '  y el dibujo de la marca también, como SVG del DOM')
  afirmar(
    quieto.indexOf('data-pieza="logotipo"') < quieto.indexOf('data-pieza="isotipo"'),
    '  y en el orden del pedido: primero la palabra, después el dibujo',
  )
  afirmar(
    quieto.indexOf('data-pieza="isotipo"') < quieto.indexOf('data-titular="dos-registros"'),
    '  y los dos ANTES del bloque de texto que ya existía',
  )
  afirmar(
    quieto.includes(GEOMETRIA.claseDeLaMarcaDelHero),
    `  y la marca se apaga de 390 para arriba con \`${GEOMETRIA.claseDeLaMarcaDelHero}\`: los seis anchos intocables no la ven`,
  )
  afirmar(
    GEOMETRIA.claseDeLaMarcaDelHero === 'chico:hidden',
    '  con `display:none` y no `visibility`: un ítem de flex apagado deja de ser ítem y se lleva su hueco',
  )

  /**
   * EL PRESUPUESTO DEL §4 — la parada de PAPEL-2, corrida acá para que quede
   * custodiada y no sólo publicada. El modelo es el mismo de
   * `scripts-papel/a-derivacion.ts`: cajas de línea `tamaño × interlineado`,
   * los huecos de la columna, y las dos piezas de marca arriba.
   *
   * —— ⚠️ **COMPO-2 LE CAMBIÓ TRES TÉRMINOS, Y LOS TRES SON DE ESTE SPRINT**
   *
   *   1. La bajada pasa de DOS renglones a UNO (la regla global).
   *   2. Las dos piezas de marca se multiplican por `factorDeLaMarca` (§1).
   *   3. El relleno de ARRIBA baja de `--spacing-20` al mismo piso que el de
   *      abajo, porque el bloque pasa a ir centrado y un centrado en una caja
   *      con rellenos distintos no es un centrado en el viewport.
   *
   * La afirmación no cambia —«entra, y no al ras»— y por eso el bloque no se
   * borra: se le ponen los términos nuevos. Lo que sí cambia es cuánto sobra, y
   * ahí está el número que el §1 pedía reportar.
   */
  const LEADING_TITULO = tokenPx('--leading-titulo', 0)
  const LEADING_TEXTO = tokenPx('--leading-texto', 0)
  const HUECO = tokenPx('--spacing-2', 0)
  const RELLENO = tokenPx('--spacing-20', 0)
  const PB_SIN_PASTILLA = RELLENO - DESCUENTO_NACIMIENTO_PX

  for (const { ancho, alto } of PAPEL) {
    const tamano1 = tamanoDeLaFila3(ancho) * RAZON
    const registro1 = 2 * tamano1 * LEADING_TITULO
    const registro2 = tamanoDeLaFila3(ancho) * LEADING_TITULO
    const bajada = tokenPx('--text-base', ancho) * LEADING_TEXTO
    const cta = tokenPx('--text-cuerpo', ancho) * LEADING_TEXTO + HUECO * 2
    const logotipo = tokenPx('--text-fluido-caption', ancho) * LEADING_TITULO * GEOMETRIA.factorDeLaMarca
    const isotipo = tamano1 * LEADING_TITULO * GEOMETRIA.factorDeLaMarca
    const total = logotipo + HUECO + isotipo + HUECO + registro1 + HUECO + registro2 + HUECO + bajada + HUECO + cta
    const disponible = alto - PB_SIN_PASTILLA * 2
    afirmar(
      total <= disponible,
      `@${ancho}×${alto}: el bloque con la marca mide ${total.toFixed(2)} px contra ${disponible.toFixed(2)} de alto útil`,
      `sobrante ${(disponible - total).toFixed(2)} px · isotipo ${isotipo.toFixed(2)} × ${(isotipo * RAZON_DEL_ISOTIPO).toFixed(2)}`,
    )
    afirmar(
      disponible - total >= HUECO * 2,
      `  y el respiro NO es al ras: sobra al menos un hueco de columna por lado (${HUECO * 2} px)`,
      `sobrante ${(disponible - total).toFixed(2)} px → ${((disponible - total) / 2).toFixed(2)} por lado`,
    )
    afirmar(
      isotipo * RAZON_DEL_ISOTIPO <= medidaDelTitular(ancho),
      `  y el isotipo entra de ANCHO en la caja del titular: ${(isotipo * RAZON_DEL_ISOTIPO).toFixed(2)} px contra ${medidaDelTitular(ancho).toFixed(2)}`,
      `margen ${(medidaDelTitular(ancho) - isotipo * RAZON_DEL_ISOTIPO).toFixed(2)} px`,
    )
  }

  /**
   * ⚠ El control se arma con el MISMO modelo y un alto imposible: 504,34 px de
   * bloque no entran en un viewport de 400 menos los 16 de relleno. Sin esto,
   * «entra en los dos anchos» pasaría en verde igual si el modelo devolviera
   * cero — que es la forma en que una cuenta de alto se rompe en silencio.
   */
  const entraEn = (alto: number, bloque: number): boolean => bloque <= alto - PB_SIN_PASTILLA * 2
  controlPositivo('el presupuesto ve un viewport en el que NO entra', 400, (alto: number) => entraEn(alto, 504.34))
  afirmar(entraEn(568, 504.34), '  y el mismo modelo dice que SÍ entra en los 568 de 320, que es lo medido arriba')

  // ═════════════════════════════════════════════════════════════════════════
  titulo('15d · PAPEL-2 · La pastilla apagada, y el pie que cobra sus 72 px')

  afirmar(PASTILLA_APAGADA_ABAJO_DE_MEDIO, 'la decisión está DECLARADA en `_chrome/contrato.ts`, no escondida en un JSX')
  /**
   * ⚠️ **COMPO-2 §2b/§3a — LA BANDA DE LA PASTILLA YA NO ES LA DEL PAPEL, Y
   * ESTA AFIRMACIÓN ES LA QUE LO CUSTODIA.** PAPEL-2 afirmaba que las dos
   * bandas eran la MISMA (`max-chico:`), y eso dejó de ser cierto: el papel
   * sigue abajo de 390 y la pastilla se apaga abajo de 860. Afirmar que son
   * iguales habría quedado en rojo; afirmar nada habría dejado la banda sin
   * custodia. Lo que se afirma ahora es la relación verdadera: **la banda de la
   * pastilla CONTIENE a la del papel**, o sea que donde el Hero pinta papel la
   * pastilla sigue sin estar, que es lo que PAPEL-2 necesitaba.
   */
  afirmarIgual(CLASE_DE_LA_PASTILLA_APAGADA, 'max-medio:hidden', '  y la apaga abajo de `--breakpoint-medio` (860): cinco de los ocho anchos del set')
  afirmar(
    BREAKPOINTS.medio > BREAKPOINTS.chico,
    `  y esa banda CONTIENE a la del papel (${BREAKPOINTS.chico} px): donde el Hero pinta papel, la pastilla sigue sin estar`,
    `chico ${BREAKPOINTS.chico} · medio ${BREAKPOINTS.medio}`,
  )
  afirmarIgual(
    GEOMETRIA.claseDelPieSinPastilla,
    `max-chico:pb-${RELLENO - DESCUENTO_NACIMIENTO_PX === 8 ? '2' : '?'}`,
    `  y el pie cobra el sobrante que COMPO-1 §6 ya había medido: ${RELLENO} − ${DESCUENTO_NACIMIENTO_PX} = ${RELLENO - DESCUENTO_NACIMIENTO_PX} px`,
  )
  afirmar(
    quieto.includes('pb-20'),
    '  ⚠ y `pb-20` SIGUE en el marcado: lo que se agrega es una condición, no un reemplazo (`soporte.ts` §9 lo afirma contra la pastilla)',
  )
  afirmar(quieto.includes(GEOMETRIA.claseDelPieSinPastilla), '  y la condición llega al marcado real')
  controlPositivo(
    'el chequeo del pie ve un contenedor al que le sacaron `pb-20`',
    '<div class="flex min-h-svh max-chico:pb-2"></div>',
    (h: string) => h.includes('pb-20'),
  )

  /**
   * ⚠ **LO QUE VIVE SÓLO EN LA BANDA DE PAPEL, AFIRMADO COMO PROPIEDAD.** Se
   * afirma sobre las CLASES y no sobre una captura: una captura dice que hoy no
   * se movió; esto dice que no PUEDE moverse sin que alguien saque una variante.
   *
   * ⚠️ **COMPO-2 SACÓ A LA PASTILLA DE ESTA LISTA, Y NO ES UN AFLOJE.** Su
   * banda dejó de ser la del papel —ahora llega hasta 860— así que afirmarla
   * contra `max-chico:` sería afirmar algo falso; lo que la custodia es la
   * comparación de arriba, que dice cuál es su banda y que contiene a la del
   * papel. Las otras cuatro siguen acá, y se le suman las DOS que agrega el §1
   * de COMPO-2 —el aire de arriba y el centrado—, que son de esta banda.
   *
   * ⚠ De los seis anchos que PAPEL-2 declaraba intocables, COMPO-2 mueve tres
   * por pedido explícito (425, 768 y 1024) y **390, 1440 y 1920 siguen siéndolo**.
   * Lo que esta lista custodia es que nada de la banda de papel se filtre a
   * ninguno de los seis.
   */
  const CLASES_DEL_SPRINT = [
    GEOMETRIA.claseDeLaMarcaDelHero,
    GEOMETRIA.claseDelPieSinPastilla,
    GEOMETRIA.claseDelAireDeArribaEnPapel,
    GEOMETRIA.claseDelBloqueCentradoEnPapel,
    GEOMETRIA.claseDeLaCeldaLateralEnPapel,
    'max-chico:text-display-r1-papel',
    'max-angosto:text-display-r1-papel-angosto',
  ]
  afirmar(
    CLASES_DEL_SPRINT.every((c) => c.startsWith('max-chico:') || c.startsWith('max-angosto:') || c.startsWith('chico:')),
    `las ${CLASES_DEL_SPRINT.length} clases de la banda de papel llevan su variante: ninguna puede pintar en ${INTOCABLES.join(', ')}`,
    CLASES_DEL_SPRINT.join(' · '),
  )
  controlPositivo(
    'el chequeo de la banda ve una clase sin variante, que es la que se filtraría a escritorio',
    ['pb-2'],
    (cs: string[]) => cs.every((c) => c.startsWith('max-chico:') || c.startsWith('max-angosto:') || c.startsWith('chico:')),
  )
}
