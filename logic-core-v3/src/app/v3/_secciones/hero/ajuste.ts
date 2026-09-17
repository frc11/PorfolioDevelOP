/**
 * HERO — §16, LAS CINCO CUENTAS DE COMPO-2.
 *
 * Sale aparte de `hero.invariant.tsx`, `soporte.ts`, `composicion.ts` y
 * `papel.ts` por la regla de las 300 líneas del repo, y el corte es el mismo
 * que el de los dos sprints anteriores: **acá viven las cuentas de ÉSTE**. Las
 * cinco contestan una pregunta distinta:
 *
 *   §16a  la regla GLOBAL — la bajada en un renglón, sin envoltorio que
 *         conmute, y el techo de caracteres re-derivado para una frase entera.
 *   §16b  el FACTOR de la marca — recalculado contra el binario y el `viewBox`,
 *         con los dos techos que lo acotan y las tres clases que lo dicen.
 *   §16c  el registro 1 en la banda portátil — los dos techos medidos, la recta
 *         que los une evaluada en sus dos anclas, y las DOS mitades de la clase.
 *   §16d  el aire que se le devuelve al pie a 768 — que vale exactamente el
 *         renglón que la regla global le sacó al bloque, y sus TRES bandas.
 *   §16e  los tres anchos que siguen intocables, afirmados como PROPIEDAD.
 *
 * ── ⚠️ POR QUÉ ACÁ NO SE AFIRMA NINGUNA SUPERPOSICIÓN ────────────────────
 *
 * Los techos de §16c salen de un barrido **sobre el píxel** —la tinta del `h1`
 * contra la masa negra de la escena, con las dos máscaras de TAPADO-1— y eso no
 * se puede reproducir sin navegador: la escena es WebGL y su búfer no se lee
 * desde la página. Lo que este archivo custodia es que **los números medidos
 * lleguen enteros al tema y a las clases**, que es la mitad que sí es
 * comprobable en estático. La otra mitad vive en `outputs/compo2/` y se vuelve
 * a correr con `scripts-compo2/a-medir.ts`.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'
import { CLASES_DE_TAMANO_DECLARADAS } from '@/lib/utils'

import { afirmar, afirmarIgual, controlPositivo, noCorre, titulo } from '../../_lib/__tests__/afirmar'
import { FUENTE_DISPLAY, FUENTE_ITALICA, FUENTE_TITULO, anchoDeTexto } from '../../_lib/__tests__/s10-avance'
import { leerAvancesDe } from '../../_lib/__tests__/s10-woff2'
import { anchoDeContenido, tokenPx } from '../../_lib/__tests__/s10-css'
import { tracking } from '../../_lib/__tests__/s10-mobile'
import { medidaDelTitular } from '../../_lib/__tests__/s3-banda-consecuencias'

import { CONTENIDO, PEDIDO } from './contenido'
import { FACTOR_DEL_PESO_700, tamanoDeLaFila3 } from './composicion'
import { CORRIMIENTO_DEL_ROCE_EN_768_PX, GEOMETRIA, TIPOGRAFIA_DEL_TITULAR } from './geometria'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const RAIZ = path.resolve(AQUI, '../../../../..')

/** Los dos anchos de papel, que son los que el §1 recompone. */
const PAPEL = [
  { ancho: 320, alto: 568 },
  { ancho: 375, alto: 667 },
] as const

/** Los dos anchos de la banda portátil, con su techo MEDIDO sobre el píxel. */
const PORTATIL = [
  { ancho: 768, techo: 67 },
  { ancho: 1024, techo: 95 },
] as const

/** Los tres que el §5 del sprint declara idénticos al decimal. */
const INTOCABLES = [390, 1440, 1920] as const

/** La razón de la caja de tinta del isotipo, leída de la pieza y no transcrita. */
const RAZON_DEL_ISOTIPO = LOGO_INK_VIEWBOX.width / LOGO_INK_VIEWBOX.height

export function afirmarElAjusteDeCompo2(quieto: string): void {
  const DISPLAY = leerAvancesDe(FUENTE_DISPLAY)
  const ITALICA = leerAvancesDe(FUENTE_ITALICA)
  const ROMANA = leerAvancesDe(FUENTE_TITULO)
  const FILA_1 = CONTENIDO.titularFila1.toUpperCase()
  const FILA_3 = CONTENIDO.titularFila3.toUpperCase()

  const emDisplay = (t: string): number => anchoDeTexto(DISPLAY, t, 1, tracking('display')) * FACTOR_DEL_PESO_700
  const emItalica = (t: string): number => anchoDeTexto(ITALICA, t, 1, tracking('titulo'))
  const emRomana = (t: string): number => anchoDeTexto(ROMANA, t, 1, tracking('texto'))

  const LEADING_TITULO = tokenPx('--leading-titulo', 0)
  const LEADING_TEXTO = tokenPx('--leading-texto', 0)
  const HUECO = tokenPx('--spacing-2', 0)

  // ═════════════════════════════════════════════════════════════════════════
  titulo('16a · COMPO-2 · La regla global: la bajada en UN renglón')

  /**
   * ⚠️ **LO PRIMERO QUE SE AFIRMA ES QUE EL QUIEBRE NO ESTÁ**, y no que la
   * frase entre. Que entre ya lo medía PAPEL-2 —la frase completa nunca dejó de
   * caber, ni siquiera a 320— así que el riesgo de este punto no es de medida:
   * es de REINCIDENCIA. El quiebre era una decisión de composición escrita en
   * `contenido.ts`, y lo que puede volver es la decisión, no el defecto.
   */
  afirmar(
    !('bajadaFila1' in CONTENIDO) && !('bajadaFila2' in CONTENIDO),
    'el contenido declara UNA bajada y no dos filas: el quiebre de COMPO-1 está revocado en la tabla, no escondido en el marcado',
    Object.keys(CONTENIDO).join(' · '),
  )
  afirmarIgual(
    PEDIDO.filter((e) => e.ruta.startsWith('bajada')).length,
    1,
    '  y el pedido tiene UNA entrada de bajada, no dos: lo que Franco tiene que escribir es un renglón',
  )
  afirmarIgual(
    quieto.split(GEOMETRIA.claseDelEnvoltorioDeFilas).length - 1,
    1,
    `  y el envoltorio que conmuta (\`${GEOMETRIA.claseDelEnvoltorioDeFilas}\`) aparece UNA sola vez en el marcado: le queda el registro 1 del titular y nada más`,
  )
  afirmar(
    quieto.includes(`>${CONTENIDO.bajada}<`),
    '  y la bajada llega como un nodo de texto solo, sin `<span>` ni separador que custodiar',
  )
  controlPositivo(
    'el chequeo del envoltorio ve un marcado en el que la bajada lo volvió a llevar',
    `<span class="${GEOMETRIA.claseDelEnvoltorioDeFilas}">a</span><p class="${GEOMETRIA.claseDelEnvoltorioDeFilas}">b</p>`,
    (h: string) => h.split(GEOMETRIA.claseDelEnvoltorioDeFilas).length - 1 === 1,
  )

  /**
   * EL TECHO DE CARACTERES, re-derivado para la frase entera. El ancho que
   * manda es el MÁS ANGOSTO —la caja de la bajada a 320 es el ancho de
   * contenido completo, porque abajo de 768 la sub-grilla de 2 colapsa a una— y
   * el avance es el de ESTA cadena, no un promedio de la fuente.
   */
  const TAMANO_DE_LA_BAJADA = tokenPx('--text-base', 320)
  const TINTA_DE_LA_BAJADA = emRomana(CONTENIDO.bajada) * TAMANO_DE_LA_BAJADA
  const CAJA_MAS_ANGOSTA = anchoDeContenido(320)
  afirmar(
    TINTA_DE_LA_BAJADA <= CAJA_MAS_ANGOSTA,
    `la frase entera entra en un renglón en el ancho que manda: ${TINTA_DE_LA_BAJADA.toFixed(2)} px contra ${CAJA_MAS_ANGOSTA.toFixed(2)} de caja a 320`,
    `margen ${(CAJA_MAS_ANGOSTA - TINTA_DE_LA_BAJADA).toFixed(2)} px · modelo sin kerning, o sea SOBREestimado`,
  )
  const TECHO_DE_CARACTERES = Math.floor(CAJA_MAS_ANGOSTA / (TINTA_DE_LA_BAJADA / CONTENIDO.bajada.length))
  const ENTRADA_DE_LA_BAJADA = PEDIDO.find((e) => e.ruta === 'bajada')
  afirmar(
    ENTRADA_DE_LA_BAJADA !== undefined && ENTRADA_DE_LA_BAJADA.formato.includes(`${TECHO_DE_CARACTERES} caracteres`),
    `  y el pedido declara el techo que sale de esa cuenta: ${TECHO_DE_CARACTERES} caracteres`,
    `${TINTA_DE_LA_BAJADA.toFixed(2)} / ${CONTENIDO.bajada.length} = ${(TINTA_DE_LA_BAJADA / CONTENIDO.bajada.length).toFixed(3)} px por carácter`,
  )
  afirmar(
    CONTENIDO.bajada.length <= TECHO_DE_CARACTERES,
    `  y la frase puesta lo respeta: ${CONTENIDO.bajada.length} caracteres`,
  )
  controlPositivo(
    'el techo de caracteres ve una caja en la que la frase NO entra',
    100,
    (caja: number) => TINTA_DE_LA_BAJADA <= caja,
  )

  // ═════════════════════════════════════════════════════════════════════════
  titulo('16b · COMPO-2 · El factor de la marca, recalculado contra el binario')

  /**
   * ⚠️ **EL FACTOR NO SE ESCRIBE: SE RECALCULA.** Está escrito TRES veces —las
   * dos variantes del isotipo y el tamaño de la palabra— y ése es exactamente
   * el patrón que se desincroniza en silencio, el mismo que PAPEL-2 §15a ata
   * para sus dos `calc()`. Acá se vuelve a sacar del `.woff2` y del `viewBox` y
   * se compara contra los tres literales.
   */
  const AVANCE_1 = emDisplay(FILA_1)
  const FACTOR = AVANCE_1 / (LEADING_TITULO * RAZON_DEL_ISOTIPO)
  afirmar(
    Math.abs(FACTOR - GEOMETRIA.factorDeLaMarca) < 1e-4,
    `el factor declarado (${GEOMETRIA.factorDeLaMarca}) ES la razón medida: ${AVANCE_1.toFixed(5)} em / (${LEADING_TITULO} × ${RAZON_DEL_ISOTIPO.toFixed(5)}) = ${FACTOR.toFixed(5)}`,
    `desvío ${Math.abs(FACTOR - GEOMETRIA.factorDeLaMarca).toExponential(2)}`,
  )
  const LITERAL = String(GEOMETRIA.factorDeLaMarca)
  const CLASES_CON_EL_FACTOR = [GEOMETRIA.claseDelIsotipo, GEOMETRIA.claseDelLogotipoDelHero]
  afirmarIgual(
    CLASES_CON_EL_FACTOR.map((c) => c.split(LITERAL).length - 1),
    [2, 1],
    `  y el literal ${LITERAL} aparece las TRES veces que tiene que aparecer: dos en el isotipo (un régimen cada una) y una en la palabra`,
  )
  afirmar(
    quieto.includes(GEOMETRIA.claseDelIsotipo) && quieto.includes(GEOMETRIA.claseDelLogotipoDelHero),
    '  y las dos clases llegan al marcado real',
  )
  afirmar(
    GEOMETRIA.claseDelLogotipoDelHero.includes('text-[length:'),
    '  ⚠ y la de la palabra lleva la pista `length:`: sin ella `tailwind-merge` no sabe si un `text-[...]` es tamaño o tinta, y se come uno de los dos',
    GEOMETRIA.claseDelLogotipoDelHero,
  )
  controlPositivo(
    'el chequeo del literal ve una clase a la que le sacaron el factor de un régimen',
    ['h-[calc(var(--a)*2.63219)] max-angosto:h-[calc(var(--b))]', 'text-[length:calc(var(--c)*2.63219)]'],
    (cs: string[]) => cs.map((c) => c.split(LITERAL).length - 1).join() === '2,1',
  )

  /**
   * QUÉ COMPRA EL FACTOR, y contra qué dos techos se lo midió. La igualdad que
   * lo define —el ancho de tinta del isotipo contra el del titular— se afirma a
   * los dos anchos de papel, y los dos techos se vuelven a derivar acá.
   */
  for (const { ancho, alto } of PAPEL) {
    const tamano1 = tamanoDeLaFila3(ancho) * (emItalica(FILA_3) / AVANCE_1)
    const isotipoAlto = tamano1 * LEADING_TITULO * GEOMETRIA.factorDeLaMarca
    const isotipoAncho = isotipoAlto * RAZON_DEL_ISOTIPO
    const tintaDelTitular = AVANCE_1 * tamano1
    afirmar(
      Math.abs(isotipoAncho - tintaDelTitular) < 0.5,
      `@${ancho}: el isotipo mide ${isotipoAncho.toFixed(2)} px de ancho y la tinta del titular ${tintaDelTitular.toFixed(2)} — es la MISMA medida, que es lo que el factor define`,
      `desvío ${Math.abs(isotipoAncho - tintaDelTitular).toFixed(4)} px · alto ${isotipoAlto.toFixed(2)} (hoy ${(tamano1 * LEADING_TITULO).toFixed(2)})`,
    )
    const techoPorAncho = medidaDelTitular(ancho) / RAZON_DEL_ISOTIPO / (tamano1 * LEADING_TITULO)
    afirmar(
      GEOMETRIA.factorDeLaMarca <= techoPorAncho,
      `  y queda abajo del techo por ANCHO (×${techoPorAncho.toFixed(4)}): el isotipo no se sale de la caja del titular`,
      `margen ${(medidaDelTitular(ancho) - isotipoAncho).toFixed(2)} px`,
    )
    void alto
  }

  /**
   * ⚠ **EL AIRE DE ARRIBA ES LO QUE HACE QUE EL FACTOR ENTRE, Y SE DICE.** Con
   * `pt-20` puesto el techo por alto a 320 es ×2,22 y el factor no entraría. Lo
   * que lo destraba es que el bloque pasa a ir CENTRADO y el relleno de arriba
   * deja de ser aire para pasar a ser piso — el mismo piso que el de abajo.
   */
  afirmarIgual(
    GEOMETRIA.claseDelAireDeArribaEnPapel,
    `max-chico:pt-${tokenPx('--spacing-20', 0) - 72 === 8 ? '2' : '?'}`,
    `el aire de arriba vale el MISMO escalón que el pie (\`${GEOMETRIA.claseDelPieSinPastilla}\`): con los dos iguales, centrar en la caja de contenido ES centrar en el viewport`,
  )
  afirmarIgual(
    GEOMETRIA.claseDelAireDeArribaEnPapel.replace('pt-', 'p?-'),
    GEOMETRIA.claseDelPieSinPastilla.replace('pb-', 'p?-'),
    '  y son el mismo valor dicho para los dos lados: si alguien mueve uno, esto se pone rojo',
  )
  afirmar(
    quieto.includes(GEOMETRIA.claseDelAireDeArribaEnPapel) && quieto.includes(GEOMETRIA.claseDelBloqueCentradoEnPapel),
    '  y las dos llegan al marcado: el centrado y el piso que lo vuelve cierto',
  )
  afirmar(
    quieto.includes('pt-20') && quieto.includes('pb-20'),
    '  ⚠ y los dos rellenos de siempre SIGUEN en el marcado: lo que se agrega son condiciones, no reemplazos',
  )

  // ═════════════════════════════════════════════════════════════════════════
  titulo('16c · COMPO-2 · El registro 1 en portátil: dos techos y la recta')

  for (const { ancho, techo } of PORTATIL) {
    afirmarIgual(
      Number(tokenPx('--text-display-r1-portatil', ancho).toFixed(4)),
      techo,
      `@${ancho}: el token resuelve al techo MEDIDO sobre el píxel (${techo} px) — la recta de la banda evaluada en su ancla`,
    )
  }
  afirmar(
    tokenPx('--text-display-r1-portatil', 860) > PORTATIL[0].techo &&
      tokenPx('--text-display-r1-portatil', 860) < PORTATIL[1].techo,
    `  y entre las dos anclas interpola: a 860 vale ${tokenPx('--text-display-r1-portatil', 860).toFixed(2)} px`,
    '⚠ ningún ancho entre 768 y 1024 está en el set, así que ese valor NO está medido: es la recta entre dos que sí lo están',
  )
  afirmar(
    tokenPx('--text-display-r1-portatil', 768) > tokenPx('--text-fluido-display', 768),
    `  y CRECE contra lo que había: ${tokenPx('--text-fluido-display', 768).toFixed(2)} → ${tokenPx('--text-display-r1-portatil', 768).toFixed(2)} px a 768`,
    `y ${tokenPx('--text-fluido-display', 1024).toFixed(2)} → ${tokenPx('--text-display-r1-portatil', 1024).toFixed(2)} px a 1024`,
  )

  /** Lo que el §4 pedía como MARGEN: cuánto le falta al registro 1 para igualar
   *  el ancho del registro 2. «Casi, no igual», con el número. */
  for (const { ancho } of PORTATIL) {
    const tintaR1 = AVANCE_1 * tokenPx('--text-display-r1-portatil', ancho)
    const tintaR2 = emItalica(FILA_3) * tamanoDeLaFila3(ancho)
    afirmar(
      tintaR1 < tintaR2,
      `@${ancho}: «${FILA_1}» queda por DEBAJO de «${FILA_3}» — ${tintaR1.toFixed(2)} px contra ${tintaR2.toFixed(2)}`,
      `margen ${(tintaR2 - tintaR1).toFixed(2)} px · ${((tintaR1 / tintaR2) * 100).toFixed(1)} % del registro 2`,
    )
  }

  const CLASES_DEL_TITULAR = TIPOGRAFIA_DEL_TITULAR.split(/\s+/)
  afirmar(
    CLASES_DEL_TITULAR.includes('tablet:text-display-r1-portatil'),
    'la tipografía del registro 1 lleva la clase de la banda portátil, escrita entera — Tailwind escanea el fuente',
  )
  afirmar(
    CLASES_DEL_TITULAR.includes('escritorio:text-fluido-display'),
    '  ⚠ y LA SEGUNDA MITAD, que no es redundante: `tablet:` es `min-width` y no se apaga sola, así que sin esto el tamaño nuevo pintaría también en 1440 y 1920',
    TIPOGRAFIA_DEL_TITULAR,
  )
  afirmar(
    CLASES_DE_TAMANO_DECLARADAS.includes('text-display-r1-portatil'),
    '  y el token está en la lista de tamaños de `src/lib/utils.ts`: sin eso `tailwind-merge` lo toma por COLOR y `cn()` se come uno de los dos',
  )
  afirmar(quieto.includes('tablet:text-display-r1-portatil'), '  y la clase llega al marcado real')
  controlPositivo(
    'el chequeo de las dos mitades ve una tipografía a la que le falta la de apagado',
    'font-display text-fluido-display tablet:text-display-r1-portatil',
    (t: string) => t.split(/\s+/).includes('escritorio:text-fluido-display'),
  )

  /**
   * ⚠ **EL ORDEN LO EMITE TAILWIND Y SE LEE DEL BUILD**, no del fuente — la
   * misma razón por la que PAPEL-2 §15b lee la hoja construida. De 1025 para
   * arriba aplican las DOS (`tablet:` y `escritorio:`) y la que tiene que ganar
   * es la segunda. Sin build, no corre y lo dice.
   */
  const DIR_CSS = path.join(RAIZ, '.next/static/css')
  if (!existsSync(DIR_CSS)) {
    noCorre('el orden de `tablet:` contra `escritorio:`', 'no hay build: `.next/static/css` no existe')
  } else {
    const hojas = readdirSync(DIR_CSS).filter((f) => f.endsWith('.css'))
    const conLasDos = hojas
      .map((f) => readFileSync(path.join(DIR_CSS, f), 'utf8'))
      .find((css) => css.includes('.tablet\\:text-display-r1-portatil'))
    if (conLasDos === undefined) {
      noCorre('el orden de `tablet:` contra `escritorio:`', 'ninguna hoja construida tiene la clase de la banda portátil')
    } else {
      const tablet = conLasDos.lastIndexOf('.tablet\\:')
      const escritorio = conLasDos.indexOf('.escritorio\\:')
      afirmar(
        tablet < escritorio,
        'en el CSS construido TODAS las reglas `tablet:` salen antes que TODAS las `escritorio:`: de 1025 para arriba gana la que apaga',
        `última tablet en ${tablet}, primera escritorio en ${escritorio}`,
      )
      afirmar(
        conLasDos.includes('.escritorio\\:text-fluido-display'),
        '  y la regla que apaga existe en el build: Tailwind vio las dos clases',
      )
      controlPositivo(
        'el lector del orden ve una hoja con las dos dadas vuelta',
        '.escritorio\\:x{} .tablet\\:y{}',
        (css: string) => css.lastIndexOf('.tablet\\:') < css.indexOf('.escritorio\\:'),
      )
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  titulo('16d · COMPO-2 · El renglón que la regla global le sacó al bloque, devuelto')

  /**
   * ⚠️ **EL VALOR NO ES UN ESCALÓN DE LA ESCALA: ES LA MISMA CUENTA QUE PRODUJO
   * EL DEFECTO.** La regla global le saca al bloque una caja de línea de la
   * bajada; el margen se la devuelve. Por eso se escribe
   * `calc(var(--text-base) * var(--leading-texto))` y no `mb-6`: un escalón
   * cercano habría dejado al bloque 1,6 px corrido y nadie habría sabido por
   * qué. Acá se afirma que el `calc()` y la cuenta dicen el mismo número.
   */
  /**
   * ⚠️ **ROCE-1 LE AGREGA UN SEGUNDO TÉRMINO, Y LA AFIRMACIÓN ES QUE SON DOS.**
   * El valor de la banda de 768 ya no es un renglón: es el renglón MENOS el
   * corrimiento que despega la tinta del registro 1 de la silueta del logo
   * (0,62 % → 0,00 %, barrido de a un píxel en `outputs/roce/a-logo768fino.json`).
   * Los dos términos se afirman por separado contra su procedencia —el primero
   * contra los tokens, el segundo contra la constante medida— para que nadie
   * pueda tocar uno creyendo que toca el otro.
   */
  const RENGLON_DE_LA_BAJADA = tokenPx('--text-base', 768) * LEADING_TEXTO
  const CLASE_DE_LA_BANDA_DE_768 = `tablet:mb-[calc(var(--text-base)*var(--leading-texto)-${CORRIMIENTO_DEL_ROCE_EN_768_PX}px)]`
  const CLASES_DEL_AIRE = GEOMETRIA.claseDelAireDelPieEnPortatil.split(/\s+/)
  afirmarIgual(
    CLASES_DEL_AIRE,
    [CLASE_DE_LA_BANDA_DE_768, 'medio:mb-4', 'escritorio:mb-0'],
    `el aire del pie tiene TRES bandas y las tres están escritas: 768–859 el renglón devuelto (${RENGLON_DE_LA_BAJADA.toFixed(2)} px) menos el corrimiento del roce (${CORRIMIENTO_DEL_ROCE_EN_768_PX} px) = ${(RENGLON_DE_LA_BAJADA - CORRIMIENTO_DEL_ROCE_EN_768_PX).toFixed(2)} px, 860–1024 el \`--spacing-4\` de COMPO-1, y de 1025 para arriba nada`,
  )
  afirmar(
    RENGLON_DE_LA_BAJADA === tokenPx('--text-base', 320) * LEADING_TEXTO,
    `  y ese renglón vale lo mismo en todos los anchos (${RENGLON_DE_LA_BAJADA.toFixed(2)} px): \`--text-base\` es fijo, así que lo que la regla global saca es una constante`,
  )
  afirmar(
    CORRIMIENTO_DEL_ROCE_EN_768_PX > 0 && CORRIMIENTO_DEL_ROCE_EN_768_PX < RENGLON_DE_LA_BAJADA,
    `  y el corrimiento del roce (${CORRIMIENTO_DEL_ROCE_EN_768_PX} px) se le RESTA al renglón sin comérselo: el margen queda en ${(RENGLON_DE_LA_BAJADA - CORRIMIENTO_DEL_ROCE_EN_768_PX).toFixed(2)} px, o sea que el bloque sigue arriba de donde lo dejaría la regla global sola`,
    `un corrimiento de ${RENGLON_DE_LA_BAJADA.toFixed(2)} px anularía el margen y metería el registro 2 en la segunda masa (8,53 % medido en COMPO-2)`,
  )
  afirmar(quieto.includes(CLASE_DE_LA_BANDA_DE_768), '  y la banda nueva llega al marcado real')
  afirmar(
    CLASES_DEL_AIRE.indexOf(CLASE_DE_LA_BANDA_DE_768) < CLASES_DEL_AIRE.indexOf('medio:mb-4'),
    '  ⚠ y la de 768 va ANTES que la de 860 en la cadena: las variantes `min-width` se pisan en orden de breakpoint, así que a 1024 tiene que ganar `medio:`',
  )
  controlPositivo(
    'el chequeo del aire ve una cadena a la que le falta la banda de 860',
    [CLASE_DE_LA_BANDA_DE_768, 'escritorio:mb-0'],
    (cs: string[]) => cs.includes('medio:mb-4'),
  )

  // ═════════════════════════════════════════════════════════════════════════
  titulo('16e · COMPO-2 · Los tres anchos intocables, como propiedad')

  /**
   * ⚠ **SE AFIRMA SOBRE LAS CLASES Y NO SOBRE UNA CAPTURA.** Una captura dice
   * que hoy no se movió; esto dice que no PUEDE moverse sin que alguien saque
   * una variante. Las cinco cosas que COMPO-2 agrega o cambia se clasifican en
   * dos grupos, y cada grupo tiene su argumento:
   *
   *   · las de la banda de papel (`max-chico:`) no llegan a 390 por definición;
   *   · las de banda `min-width` (`tablet:`) llegarían a 1440 y a 1920, y por
   *     eso cada una lleva su mitad de apagado en `escritorio:`.
   *
   * Lo que este bloque custodia es la SEGUNDA, que es la que cuesta un sprint
   * cuando falta — `claseDelAireDelPieEnPortatil` la aprendió midiendo 8,8 px
   * de corrimiento en 1440 y 1920.
   */
  const DE_BANDA_ALTA = [
    { clase: 'tablet:text-display-r1-portatil', apaga: 'escritorio:text-fluido-display', donde: TIPOGRAFIA_DEL_TITULAR },
    {
      clase: CLASE_DE_LA_BANDA_DE_768,
      apaga: 'escritorio:mb-0',
      donde: GEOMETRIA.claseDelAireDelPieEnPortatil,
    },
  ]
  for (const { clase, apaga, donde } of DE_BANDA_ALTA) {
    afirmar(
      donde.split(/\s+/).includes(clase) && donde.split(/\s+/).includes(apaga),
      `\`${clase}\` viaja con su apagado \`${apaga}\`: no puede pintar en ${INTOCABLES.filter((a) => a >= 1025).join(' ni ')}`,
      donde,
    )
  }
  afirmar(
    DE_BANDA_ALTA.every(({ clase }) => Number.parseInt(clase.split(':')[0].replace('tablet', '768'), 10) > 425),
    `  y ninguna de las dos llega a 390 ni a 425 por el otro lado: las dos arrancan en \`tablet\` (768)`,
  )
  controlPositivo(
    'el chequeo del apagado ve una clase de banda alta suelta, que es la que se filtra a escritorio',
    { clase: 'tablet:x', apaga: 'escritorio:y', donde: 'tablet:x' },
    (c: { clase: string; apaga: string; donde: string }) =>
      c.donde.split(/\s+/).includes(c.clase) && c.donde.split(/\s+/).includes(c.apaga),
  )
  void HUECO
}
