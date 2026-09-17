/**
 * HERO — §14, LAS CINCO CUENTAS DE COMPO-1.
 *
 * Sale aparte de `hero.invariant.tsx` y de `soporte.ts` por la regla de las 300
 * líneas del repo, y el corte es el de siempre: **acá viven las CUENTAS de este
 * sprint**, allá las comprobaciones del marcado que ya existían. Las cinco
 * contestan una pregunta distinta y ninguna necesita el navegador:
 *
 *   §14a  la fila 3 («LAS 24 HS») entra en UN renglón de 320 a 1024, con el
 *         tamaño que le corresponde a cada ancho — y por qué la banda angosta
 *         hace falta.
 *   §14b  las dos filas del registro 1 entran cada una en la caja más angosta.
 *   §14c  la sangría del CTA es EXACTAMENTE el relleno que `cta.css` declara.
 *   §14d  el aire del pie en portátil sale de los tokens de la pastilla.
 *   §14e  abajo de 1025 la medida del titular es el ancho de contenido entero.
 *
 * ── ⚠️ LA CARA CON LA QUE SE MIDE CADA COSA, Y POR QUÉ IMPORTA ───────────
 *
 * El registro 2 es **Chivo itálica** y `caraDelNivel` elige la cara por NIVEL,
 * que no sabe de estilo: `s10-avance.ts` lo declara como límite de su medidor y
 * deja la ruta del binario escrita para el día que importe. **Hoy importa**: la
 * cuenta de §14a decide si el titular se parte en dos renglones en un teléfono.
 * Así que acá se abre `FUENTE_ITALICA` con `leerAvancesDe`, que es lo que ese
 * docblock dice que hay que hacer.
 *
 * ⚠ Los dos supuestos que quedan, declarados: la tabla es la instancia POR
 * DEFECTO del eje de peso —y la fila 3 se pinta en 300, o sea MÁS angosta— y no
 * hay kerning. Los dos empujan hacia sobreestimar el ancho, o sea que un «entra»
 * de acá es un entra con margen. El registro 1 va al revés —se pinta en 700 y la
 * tabla publica el 600— y por eso su cuenta aplica el factor de peso MEDIDO que
 * `soporte.ts` §12b ya derivó contra el mismo binario.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { FUENTE_DISPLAY, FUENTE_ITALICA, anchoDeTexto } from '../../_lib/__tests__/s10-avance'
import { leerAvancesDe } from '../../_lib/__tests__/s10-woff2'
import { terminosDe } from '../../_lib/__tests__/s3-banda'
import { medidaDelTitular } from '../../_lib/__tests__/s3-banda-consecuencias'
import { BREAKPOINTS, anchoDeContenido, tokenPx } from '../../_lib/__tests__/s10-css'
import { tracking } from '../../_lib/__tests__/s10-mobile'
import { DESCUENTO_NACIMIENTO_PX } from '../../_lib/navegacion'

import { CONTENIDO } from './contenido'
import { GEOMETRIA } from './geometria'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const RAIZ = path.resolve(AQUI, '../../../../..')
const CTA_CSS = readFileSync(path.join(RAIZ, 'src/app/v3/_estilos/cta.css'), 'utf8')

/** Los seis anchos de abajo de 1025 que el sprint mide. Los mismos que
 *  `scripts-tapado/VENTANAS`, sin los dos de escritorio. */
const ANCHOS_DE_ABAJO = [320, 375, 390, 425, 768, 1024] as const

/**
 * EL FACTOR DEL EJE DE PESO — el 700 con el que se pinta el registro 1 sobre el
 * 600 que `hmtx` publica. Medido sobre el mismo binario instanciando el eje, y
 * declarado UNA sola vez para que las dos cuentas que lo usan —§12b, en
 * `soporte.ts`, y §14b acá— no se puedan separar.
 */
export const FACTOR_DEL_PESO_700 = 8.567 / 8.475

/**
 * EL TAMAÑO CON EL QUE SE PINTA LA FILA 3 A UN ANCHO — la conmutación de la
 * banda angosta, resuelta acá porque `clasesEfectivas` no sabe de variantes
 * `max-`.
 *
 * ⚠ Es la única parte del modelo de composición que este sprint tiene que
 * escribir a mano, y se declara: `s10-css.clasesEfectivas` trata los prefijos
 * que no son `--breakpoint-*` como estados y los conserva enteros, así que a 320
 * seguiría viendo `text-fluido-display-xl`. La conmutación está en una sola
 * línea y el invariante la comprueba contra los DOS tokens.
 */
export function tamanoDeLaFila3(ancho: number): number {
  return ancho < BREAKPOINTS.angosto
    ? tokenPx('--text-display-xl-angosto', ancho)
    : tokenPx('--text-fluido-display-xl', ancho)
}

export function afirmarLaComposicionDeCompo1(quieto: string): void {
  // ═════════════════════════════════════════════════════════════════════════
  titulo('14a · COMPO-1 · La fila 3 entra en UN renglón de 320 a 1024')

  const ITALICA = leerAvancesDe(FUENTE_ITALICA)
  const TRACKING_DEL_REGISTRO_2 = tracking('titulo')
  const TEXTO_DE_LA_FILA_3 = CONTENIDO.titularFila3.toUpperCase()

  afirmar(TRACKING_DEL_REGISTRO_2 < 0, `el interletrado del registro 2 es ${TRACKING_DEL_REGISTRO_2} em, leído del token`)

  const tintaDeLaFila3 = (ancho: number, tamano: number): number =>
    anchoDeTexto(ITALICA, TEXTO_DE_LA_FILA_3, tamano, TRACKING_DEL_REGISTRO_2)

  for (const ancho of ANCHOS_DE_ABAJO) {
    const caja = medidaDelTitular(ancho)
    const tamano = tamanoDeLaFila3(ancho)
    const tinta = tintaDeLaFila3(ancho, tamano)
    afirmar(
      tinta <= caja,
      `@${ancho}: «${TEXTO_DE_LA_FILA_3}» mide ${tinta.toFixed(2)} px a ${tamano.toFixed(2)} px y entra en una caja de ${caja.toFixed(2)}`,
      `margen ${(caja - tinta).toFixed(2)} px`,
    )
  }

  /**
   * ⚠️ **EL CONTROL QUE HACE QUE LA BANDA ANGOSTA SIGNIFIQUE ALGO.** Sin esto,
   * «entra en los seis anchos» pasaría en verde igual si la banda no existiera
   * y el nivel entrara solo — que es justamente lo que NO pasa a 320.
   */
  const CAJA_A_320 = medidaDelTitular(320)
  const CON_EL_NIVEL_A_320 = tintaDeLaFila3(320, tokenPx('--text-fluido-display-xl', 320))
  afirmar(
    CON_EL_NIVEL_A_320 > CAJA_A_320,
    `y a 320 SIN la banda angosta NO entra: ${CON_EL_NIVEL_A_320.toFixed(2)} px contra una caja de ${CAJA_A_320.toFixed(2)} — por eso existe el corte`,
    `se pasa por ${(CON_EL_NIVEL_A_320 - CAJA_A_320).toFixed(2)} px`,
  )

  /**
   * ⚠️ **Y POR QUÉ NO ALCANZA CON BAJAR EL PISO DEL `clamp()`.** A 320 el nivel
   * NO está gobernado por su piso sino por su recta: el término preferido vale
   * más que el techo que la caja admite, así que ningún valor del piso lo baja.
   * Es la refutación de la salida obvia, y va acá porque es una cuenta.
   */
  const TERMINOS = terminosDe('display-xl')
  afirmar(TERMINOS !== null, 'el nivel `display-xl` tiene los tres términos de un clamp() para poder mirarlos')
  if (TERMINOS !== null) {
    const RECTA_A_320 = TERMINOS.recta(320)
    const TECHO_QUE_LA_CAJA_ADMITE = (CAJA_A_320 / CON_EL_NIVEL_A_320) * tokenPx('--text-fluido-display-xl', 320)
    afirmar(
      RECTA_A_320 > TECHO_QUE_LA_CAJA_ADMITE,
      `bajar el PISO no arregla 320: la recta del clamp vale ${RECTA_A_320.toFixed(2)} px ahí, ${(RECTA_A_320 - TECHO_QUE_LA_CAJA_ADMITE).toFixed(2)} px por arriba de los ${TECHO_QUE_LA_CAJA_ADMITE.toFixed(2)} que la caja admite`,
      'el piso sólo manda cuando la recta queda por debajo de él',
    )
  }

  /** El 55 es un TECHO y no una preferencia: con un píxel más no entra. */
  const UNO_MAS = tokenPx('--text-display-xl-angosto', 0) + 1
  afirmar(
    tintaDeLaFila3(320, UNO_MAS) > CAJA_A_320,
    `y el valor de la banda es un TECHO: con ${UNO_MAS.toFixed(0)} px la fila mide ${tintaDeLaFila3(320, UNO_MAS).toFixed(2)} px y se pasa de ${CAJA_A_320.toFixed(2)}`,
  )
  afirmar(quieto.includes('max-angosto:text-display-xl-angosto'), 'y la clase que conmuta el tamaño llega al marcado, acotada a la banda')
  controlPositivo('el chequeo de la clase acotada ve un titular sin ella', '<span class="text-fluido-display-xl italic">x</span>', (h: string) => h.includes('max-angosto:text-display-xl-angosto'))

  // ═════════════════════════════════════════════════════════════════════════
  titulo('14b · COMPO-1 · Las dos filas del registro 1 entran en la caja más angosta')

  const DISPLAY = leerAvancesDe(FUENTE_DISPLAY)
  const TRACKING_DEL_REGISTRO_1 = tracking('display')
  const CAJA_MAS_ANGOSTA = medidaDelTitular(320)
  const TAMANO_A_320 = tokenPx('--text-fluido-display', 320)

  for (const fila of [CONTENIDO.titularFila1, CONTENIDO.titularFila2]) {
    const texto = fila.toUpperCase()
    const tinta = anchoDeTexto(DISPLAY, texto, TAMANO_A_320, TRACKING_DEL_REGISTRO_1) * FACTOR_DEL_PESO_700
    afirmar(
      tinta <= CAJA_MAS_ANGOSTA,
      `@320: «${texto}» mide ${tinta.toFixed(2)} px a ${TAMANO_A_320.toFixed(2)} px y entra en ${CAJA_MAS_ANGOSTA.toFixed(2)}`,
      `margen ${(CAJA_MAS_ANGOSTA - tinta).toFixed(2)} px`,
    )
  }

  /** Y el control del otro lado: las DOS juntas NO entran a 320, que es la razón
   *  por la que el quiebre existe y no es una preferencia de forma. */
  const JUNTAS = `${CONTENIDO.titularFila1} ${CONTENIDO.titularFila2}`.toUpperCase()
  const TINTA_JUNTAS = anchoDeTexto(DISPLAY, JUNTAS, TAMANO_A_320, TRACKING_DEL_REGISTRO_1) * FACTOR_DEL_PESO_700
  afirmar(
    TINTA_JUNTAS > CAJA_MAS_ANGOSTA,
    `y las dos JUNTAS no entran a 320: ${TINTA_JUNTAS.toFixed(2)} px contra ${CAJA_MAS_ANGOSTA.toFixed(2)} — el quiebre no inventa un corte, lo declara donde ya caía`,
  )

  // ═════════════════════════════════════════════════════════════════════════
  titulo('14c · COMPO-1 · La sangría del CTA es EXACTAMENTE el relleno de `cta.css`')

  /**
   * ⚠️ **ESTE ES EL CHEQUEO QUE IMPIDE QUE EL ARREGLO SE VUELVA UN NÚMERO
   * SUELTO.** El CTA arranca 8 px a la derecha del resto de la columna porque
   * `_estilos/cta.css` le pone `padding: var(--spacing-2)`; la clase del Hero lo
   * cancela con el MISMO escalón en negativo. Si mañana alguien cambia el
   * relleno del componente, el Hero queda corrido en la otra dirección y nada
   * más se pondría rojo. Acá se leen los DOS del archivo que los declara.
   */
  const RELLENO = /\bpadding:\s*var\(--spacing-(\d+)\)/.exec(CTA_CSS)
  afirmar(RELLENO !== null, '`cta.css` declara el relleno del CTA con un escalón del sistema')
  if (RELLENO !== null) {
    afirmarIgual(
      Number.parseInt(RELLENO[1], 10),
      GEOMETRIA.escalonDeLaSangriaDelCta,
      `el relleno del componente y la sangría del Hero son el MISMO escalón (--spacing-${RELLENO[1]})`,
    )
  }
  afirmarIgual(
    GEOMETRIA.claseDeLaSangriaDelCta,
    `-ml-${GEOMETRIA.escalonDeLaSangriaDelCta}`,
    'y la clase escrita dice ese escalón, en negativo',
  )
  afirmar(quieto.includes(GEOMETRIA.claseDeLaSangriaDelCta), '  y llega al marcado')
  controlPositivo(
    'el comparador ve un relleno que NO coincide con la sangría',
    'padding: var(--spacing-3)',
    (css: string) => Number.parseInt(/--spacing-(\d+)/.exec(css)![1], 10) === GEOMETRIA.escalonDeLaSangriaDelCta,
  )

  // ═════════════════════════════════════════════════════════════════════════
  titulo('14d · COMPO-1 · El aire del pie en portátil sale de los tokens de la pastilla')

  /**
   * La cuenta entera, y ni un número escrito a mano:
   *
   *   aire de hoy   = `--spacing-20` (el `pb` del Hero) − DESCUENTO_NACIMIENTO_PX
   *   aire que quiere la pastilla = `--spacing-6` (su margen al pie y su reposo)
   *   lo que falta  = la resta, y tiene que ser un escalón declarado
   */
  const AIRE_DE_HOY = tokenPx('--spacing-20', 0) - DESCUENTO_NACIMIENTO_PX
  const AIRE_QUE_QUIERE_LA_PASTILLA = tokenPx('--spacing-6', 0)
  const LO_QUE_FALTA = AIRE_QUE_QUIERE_LA_PASTILLA - AIRE_DE_HOY
  afirmar(AIRE_DE_HOY > 0, `con el bloque apoyado abajo quedan ${AIRE_DE_HOY} px entre la caja del CTA y la pastilla`, `${tokenPx('--spacing-20', 0)} px de pb menos los ${DESCUENTO_NACIMIENTO_PX} que la pastilla ocupa`)
  afirmar(LO_QUE_FALTA > 0, `y la pastilla quiere ${AIRE_QUE_QUIERE_LA_PASTILLA} px de su propio token: faltan ${LO_QUE_FALTA}`)
  const ESCALON_DEL_AIRE = /medio:mb-(\d+)/.exec(GEOMETRIA.claseDelAireDelPieEnPortatil)
  afirmar(ESCALON_DEL_AIRE !== null, 'la clase del aire declara un escalón de espaciado', GEOMETRIA.claseDelAireDelPieEnPortatil)
  if (ESCALON_DEL_AIRE !== null) {
    afirmarIgual(
      tokenPx(`--spacing-${ESCALON_DEL_AIRE[1]}`, 0),
      LO_QUE_FALTA,
      `y ese escalón vale exactamente lo que falta: --spacing-${ESCALON_DEL_AIRE[1]} = ${LO_QUE_FALTA} px`,
    )
  }
  afirmar(quieto.includes(GEOMETRIA.claseDelAireDelPieEnPortatil), '  y llega al marcado, acotada a la banda `medio`')
  /**
   * ⚠️ **LA CLASE TIENE QUE DECIR DÓNDE TERMINA, Y ESO ES UNA AFIRMACIÓN
   * APARTE.** Las variantes de ancho son `min-width`: `medio:` se prende en 860
   * y no se apaga solo. Sin `escritorio:mb-0` el margen llegaba a 1440 y a 1920
   * —donde el bloque va CENTRADO— y los corría 8,8 px para arriba, que es
   * exactamente lo que este sprint tenía prohibido. Se afirma el PAR, igual que
   * `hero.invariant` §1 hace con el fondo de la banda angosta.
   */
  afirmar(
    GEOMETRIA.claseDelAireDelPieEnPortatil.split(/\s+/).includes('escritorio:mb-0'),
    '  y dice DÓNDE TERMINA: de 1025 para arriba el margen vuelve a cero, o el bloque centrado se correría 8,8 px',
    GEOMETRIA.claseDelAireDelPieEnPortatil,
  )
  controlPositivo(
    'el chequeo del par ve una clase a la que le falta la mitad de escritorio',
    'medio:mb-4',
    (c: string) => c.split(/\s+/).includes('escritorio:mb-0'),
  )
  afirmar(
    BREAKPOINTS.tablet < BREAKPOINTS.medio && BREAKPOINTS.medio < BREAKPOINTS.escritorio,
    `la banda que gana aire es ${BREAKPOINTS.medio} a ${BREAKPOINTS.escritorio - 1}: el único corte declarado entre tablet y escritorio`,
  )
  controlPositivo('la cuenta ve un escalón que NO cierra la resta', '12', (e: string) => tokenPx(`--spacing-${e}`, 0) === LO_QUE_FALTA)

  // ═════════════════════════════════════════════════════════════════════════
  titulo('14e · COMPO-1 · Abajo de 1025 la medida es el ancho de contenido ENTERO')

  afirmarIgual(
    GEOMETRIA.claseDeLaColumnaLateral,
    'tablet:grid-cols-1 escritorio:grid-cols-[var(--columna-lateral)_minmax(0,1fr)]',
    'la clase dice las DOS mitades: colapsa en tablet y vuelve en escritorio',
  )
  afirmar(quieto.includes(GEOMETRIA.claseDeLaColumnaLateral), '  y llega al marcado')
  for (const ancho of [768, 1024]) {
    afirmarIgual(
      Number(medidaDelTitular(ancho).toFixed(2)),
      Number(anchoDeContenido(ancho).toFixed(2)),
      `@${ancho}: la medida es el contenido entero (${anchoDeContenido(ancho)} px), sin los ${tokenPx('--columna-lateral', 0)} px de la columna lateral ni su canaleta`,
    )
  }
  /** Y el control del otro lado: en 1025 la columna lateral vuelve —y con ella
   *  la grilla de 5 y la medida de 3 de 5—, así que la medida deja de ser el
   *  contenido entero. Sin esto, «abajo de 1025 la medida es el contenido»
   *  pasaría en verde igual si lo fuera en TODO ancho. */
  afirmar(
    medidaDelTitular(BREAKPOINTS.escritorio) < anchoDeContenido(BREAKPOINTS.escritorio),
    `y de ${BREAKPOINTS.escritorio} para arriba deja de serlo: la medida vale ${medidaDelTitular(BREAKPOINTS.escritorio).toFixed(2)} px sobre un contenido de ${anchoDeContenido(BREAKPOINTS.escritorio).toFixed(2)}`,
    'ahí vuelven la columna lateral, la grilla de 5 y la medida de 3 de 5',
  )
  controlPositivo(
    'el chequeo de la clase ve una que sólo trae la mitad de tablet',
    '<div class="grid tablet:grid-cols-1">',
    (h: string) => h.includes(GEOMETRIA.claseDeLaColumnaLateral),
  )
}
