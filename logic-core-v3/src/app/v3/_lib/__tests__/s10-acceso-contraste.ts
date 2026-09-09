/**
 * §10 DEL INVARIANTE DE ACCESIBILIDAD — EL CONTRASTE DE TEXTO EN LAS OCHO, con
 * las opacas que nadie había medido.
 *
 * Sale del invariante en SITIO-S11 por la regla de las 300 líneas, y el corte es
 * por tema: es la única sección que resuelve COLOR —el resto lee marcado— y la
 * única que consume el modelo de tinta y superficie de `s10-acceso-color.ts`.
 * Acá vivieron los hallazgos 11 y 12 de §7.39, los dos cerrados en la Fase 0 de
 * S11 dando vuelta las tres tintas en el bloque invertido. §9 —el anillo de
 * foco— se mudó con §10 y por la misma razón: también es una razón de contraste,
 * y consume los mismos colores leídos del tema.
 *
 * ── ⚠️ B8: SIN VELO NO HAY PISO, y cada tinta sobre la escena se CITA ─────────
 *
 * B6-A tenía dos varas para el texto sobre la escena: la tinta primaria se
 * afirmaba contra el PISO (el velo denso sobre blanco, un número de los tokens) y
 * las otras se citaban medidas. B8 sacó el velo —un velo oscuro sobre una sala
 * de papel da gris, nunca negro— y con él se fue el piso: **detrás del texto
 * está la sala con la luz que el arco le dé, y eso no es un token.** Queda una
 * sola vara, la de siempre para el hero y el diferencial: **cada (sección,
 * tinta) sobre la escena tiene su fila en `CONTRASTE_CONTRA_LA_ESCENA`, medida
 * sobre la escena real por el instrumento que la firma.** Sin fila, rojo.
 *
 * Y lo que B8 rompió a propósito no se tapa: una fila por debajo de AA lleva su
 * deuda (`deudas-b8.ts`), corre con la condición intacta como `deudaDeclarada`
 * y el agregado la publica aparte. Una fila bajo AA SIN deuda es rojo; una fila
 * con deuda que ya pasa AA también, para que la lista no se quede vieja.
 *
 * ── ⚠️ B11: EL LOGO YA NO ESTÁ DETRÁS DE NINGUNA FILA, y las deudas cambian de dueño ─
 *
 * B11 movió el texto de donde pasa el logo y re-derivó las filas en tres anchos
 * y a lo largo del tramo entero (`s10-acceso-escena.ts`). Lo que sigue abajo de
 * AA ya no es el logo —0 % del tramo en las cuatro secciones que lo tenían— sino
 * el piso de motas, la pared del diferencial y el atardecer sobre la última
 * cifra: cada fila apunta a la deuda que la explica, en UN registro que junta
 * las seis de B8 con las de B11 (`DEUDAS_DECLARADAS`, `deudas-b11.ts`). **La
 * condición no cambió**: `f.razon >= AA`, intacta, y el día que la escena baje
 * el piso las filas pasan a verde solas y el guardia de abajo pide sacarles la
 * deuda.
 */

import { afirmar, afirmarIgual, deudaDeclarada, titulo } from './afirmar'
import { DEUDAS_DECLARADAS } from './deudas-b11'
import { AA, ALFA_CASI, COLOR, cajasDeColor, componer, loRedefineLaInvertida, razon, superficiesDelDocumento, type CajaDeColor } from './s10-acceso-color'
import { CONTRASTE_CONTRA_LA_ESCENA } from './s10-acceso-escena'
import { anillosFlojos, imprimirAnillos, imprimirContraste, type CaidaDelAnillo } from './s10-acceso-tablas'
import { HUECOS } from './s10-banco'

const etiquetaDe = (f: (typeof CONTRASTE_CONTRA_LA_ESCENA)[number]): string =>
  `${f.seccion}${f.tinta === undefined ? '' : ` (${f.tinta})`}`

function imprimirLasCitas(): void {
  for (const c of CONTRASTE_CONTRA_LA_ESCENA) {
    console.log(`     ${etiquetaDe(c)}: ${c.razon.toFixed(2)}:1${c.deuda === undefined ? '' : ` — deuda ${DEUDAS_DECLARADAS[c.deuda].numero}`} — ${c.instrumento}`)
  }
}

export function afirmarElFoco(): void {
  titulo('9 · EL FOCO — qué regla lo pinta, y sobre qué superficie cae cada parada')

  console.log('  regla única, en `theme-develop.css`: `[data-v3] :focus-visible { outline: var(--foco-grosor) solid')
  console.log('  var(--color-foco); outline-offset: var(--foco-desplazamiento) }`, y `--color-foco` ES `var(--color-tinta)`,')
  console.log('  así que `[data-seccion="invertida"]` lo da vuelta sin mencionarlo.')
  /** ⚠️ B8: las paradas 7–15 caían sobre «el velo denso con blanco detrás»; sin velo caen sobre LA ESCENA, como el CTA del Hero. */
  const CAIDAS: readonly CaidaDelAnillo[] = [
    { paradas: '1–5', donde: 'la pastilla, flotando sobre una sección clara', anillo: COLOR.tintaClara, sobre: COLOR.papel },
    { paradas: '1–5', donde: 'la pastilla, flotando sobre una invertida (superficie translúcida al 0,6 encima del oscuro)', anillo: COLOR.tintaClara, sobre: componer(COLOR.papel, COLOR.oscuro, ALFA_CASI) },
    { paradas: '6', donde: 'el CTA del Hero — `papel-transparente`', anillo: COLOR.tintaClara, sobre: null },
    { paradas: '7–15', donde: 'el CTA, los 7 enlaces del pie y el campo del Cierre — `oscuro-transparente` sin velo (B8): la tinta invertida sobre la sala', anillo: COLOR.tintaInvertida, sobre: null },
  ]
  imprimirAnillos(CAIDAS)
  afirmarIgual(anillosFlojos(CAIDAS), [], 'las paradas sobre un token reciben un anillo de ≥3:1 contra su superficie — el mínimo de un componente de interfaz')
  console.log('  sobre la escena el anillo es la MISMA tinta que el texto, así que hereda las cifras de OTRO instrumento:')
  imprimirLasCitas()
  console.log(`  ⚠ HUECO declarado del sprint («${HUECOS[2].nombre}»): ${HUECOS[2].porQue}.`)
  console.log(`     Lo cerraría: ${HUECOS[2].queLoCerraria}. Este frente NO afirma que el anillo se vea; afirma su contraste.`)
}

const tinta = (c: CajaDeColor): string => `${c.tinta.token}@${c.tinta.alfa}`

export function afirmarElContraste(QUIETA: string): void {
  titulo('10 · EL CONTRASTE DE TEXTO EN LAS OCHO — con las opacas que nadie había medido')

  const superficies = superficiesDelDocumento(QUIETA)
  afirmarIgual(superficies.length, 8, 'las ocho secciones declaran su superficie en el propio marcado')
  const CAJAS = cajasDeColor(QUIETA)
  imprimirContraste(CAJAS)
  console.log('  ── las transparentes NO se recalculan contra un token: su fondo es la escena')
  imprimirLasCitas()

  const modoDe = new Map(superficies.map((s) => [s.id, s.modo]))
  const sobreLaEscena = CAJAS.filter((c) => c.fondo === null)
  const seccionesSobreLaEscena = [...new Set(sobreLaEscena.map((c) => c.seccion))]
  afirmarIgual(
    seccionesSobreLaEscena.filter((s) => modoDe.get(s) === 'oscuro-transparente').sort(),
    ['cierre', 'trabajos'],
    `hay texto en tinta invertida sobre la sala en Trabajos y el Cierre (B6-A, sin velo desde B8) — ${seccionesSobreLaEscena.length} secciones escriben sobre la escena en total`,
  )

  // ── la única vara: cada (sección, tinta) sobre la escena, citada ──────────
  const tintasPorSeccion = new Map<string, string[]>()
  for (const c of sobreLaEscena) {
    const lista = tintasPorSeccion.get(c.seccion) ?? []
    if (!lista.includes(tinta(c))) lista.push(tinta(c))
    tintasPorSeccion.set(c.seccion, lista)
  }
  const claves = [...tintasPorSeccion.entries()].flatMap(([s, ts]) => ts.map((t) => `${s}/${t}`)).sort()
  const cubierta = (clave: string): boolean => {
    const [seccion, t] = clave.split('/')
    return CONTRASTE_CONTRA_LA_ESCENA.some((f) => f.seccion === seccion && (f.tinta === undefined || f.tinta === t))
  }
  afirmarIgual(
    claves.filter((k) => !cubierta(k)),
    [],
    `cada tinta sobre la escena tiene su cifra MEDIDA sobre la escena real, por el instrumento que la firma: ${claves.join(' · ')}`,
  )
  /**
   * La cita de S9 vale para TODO el texto de una sección sólo si esa sección usa
   * UNA tinta: una fila sin tinta sobre una sección de dos tintas escondería la
   * segunda. Es la afirmación de S9 («las claras usan una sola tinta»), puesta
   * donde hace falta desde que las transparentes son seis.
   */
  const filasSinTinta = CONTRASTE_CONTRA_LA_ESCENA.filter((f) => f.tinta === undefined)
  afirmarIgual(
    filasSinTinta.filter((f) => (tintasPorSeccion.get(f.seccion) ?? []).length !== 1).map((f) => f.seccion),
    [],
    `una fila sin tinta sólo vale para una sección de UNA tinta — ${filasSinTinta.map((f) => `${f.seccion}: ${(tintasPorSeccion.get(f.seccion) ?? []).join(' ')}`).join(' · ')}`,
  )
  afirmarIgual(
    CONTRASTE_CONTRA_LA_ESCENA.filter((f) => !seccionesSobreLaEscena.includes(f.seccion)).map(etiquetaDe),
    [],
    '  y ninguna fila cita una sección que NO escribe sobre la escena: la tabla no tiene citas huérfanas',
  )

  // ── las citas contra AA: lo que pasa se afirma, lo que B8 rompió se declara ─
  for (const f of CONTRASTE_CONTRA_LA_ESCENA) {
    if (f.deuda === undefined) {
      afirmar(f.razon >= AA, `${etiquetaDe(f)}: la cita pasa AA — ${f.razon.toFixed(2)}:1`, f.instrumento)
    } else {
      deudaDeclarada(
        f.razon >= AA,
        `${etiquetaDe(f)}: la cita pasa AA`,
        `${DEUDAS_DECLARADAS[f.deuda].numero}: ${f.razon.toFixed(2)}:1 — ${f.instrumento}`,
        DEUDAS_DECLARADAS[f.deuda].cierre,
      )
    }
  }
  afirmarIgual(
    CONTRASTE_CONTRA_LA_ESCENA.filter((f) => f.deuda !== undefined && f.razon >= AA).map(etiquetaDe),
    [],
    'ninguna fila declarada como deuda está ya saldada: el día que una pase AA, se le saca la deuda y vuelve a ser afirmación',
  )
  afirmar(
    razon(COLOR.tintaInvertida, COLOR.papel) < 3,
    `  [control positivo] la tinta invertida sobre el papel a pleno sol no llega ni a 3:1 (${razon(COLOR.tintaInvertida, COLOR.papel).toFixed(2)}:1): sin la noche, la banda oscura no se lee`,
  )

  /**
   * ⚠️ **CENSO MOVIDO EN SITIO-S11 — los hallazgos 11 y 12 están cerrados.**
   *
   * S10 afirmaba «hay EXACTAMENTE una falla de AA» y «la invertida NO redefine
   * media ni tenue»: las dos describían el defecto, y las dos dejaron de ser
   * ciertas cuando la Fase 0 lo arregló en la raíz. Se dan vuelta, y con el mismo
   * cuidado con el que estaban escritas: se afirma que el inventario de fallas
   * está VACÍO, que el bloque invertido redefine las tres tintas, y —el control
   * que impide que esto sea verde por vacío— que el detector de redefiniciones
   * sigue sabiendo decir que NO sobre un token que la invertida efectivamente
   * hereda.
   */
  afirmarIgual(
    [...new Set(CAJAS.filter((c) => c.razon !== null && c.razon < AA).map((c) => `${c.seccion}/${c.tinta.token}`))],
    [],
    'el inventario de fallas de AA sobre un TOKEN está VACÍO: ningún texto sobre papel u oscuro queda abajo de 4,5:1 contra su superficie',
  )
  afirmar(loRedefineLaInvertida('--color-tinta'), 'la invertida redefine `--color-tinta`, que es lo que hacía pasar a todo el resto')
  afirmar(loRedefineLaInvertida('--color-tinta-media'), '  y desde SITIO-S11 también `--color-tinta-media`')
  afirmar(loRedefineLaInvertida('--color-tinta-tenue'), '  y `--color-tinta-tenue`: la trampa que produjo el 11 está desarmada en la raíz')
  afirmar(!loRedefineLaInvertida('--color-acento'), '  [control positivo] y el detector sigue sabiendo decir que NO: la invertida NO redefine `--color-acento`, y lo declara con su razón')
  console.log(
    `  ✅ DEFECTOS 11 y 12 — ARREGLADOS en SITIO-S11 · \`theme-develop.css\`, el bloque \`[data-seccion="invertida"]\`. ` +
      `El \`<p>\` de ayuda de novedades pasa de 2,80:1 a ${razon(COLOR.tenueInvertida, COLOR.oscuro).toFixed(2)}:1 sobre ${COLOR.oscuro} — era el ÚNICO fallo de AA del home, y ` +
      `el único texto que explica por qué el envío está deshabilitado. La media, que estaba armada y sin disparar, pasa de 2,51:1 a ` +
      `${razon(COLOR.mediaInvertida, COLOR.oscuro).toFixed(2)}:1. No se tocó ni el marcado del Cierre ni una utilidad: se arregló la CAUSA, que era la asimetría del tema.`,
  )
  console.log(
    `     método: el mismo espejado de S0, corrido al revés — desde ${COLOR.tintaInvertida} y hacia oscuro, el color que da la razón de la tinta ` +
      `de origen contra ${COLOR.oscuro}. media ${COLOR.media}→${COLOR.mediaInvertida} · tenue ${COLOR.tenue}→${COLOR.tenueInvertida}. ` +
      `La separación entre las dos se conserva: ${razon(COLOR.media, COLOR.tenue).toFixed(4)}:1 en el claro contra ${razon(COLOR.mediaInvertida, COLOR.tenueInvertida).toFixed(4)}:1 en la invertida.`,
  )
  console.log(`  el contraejemplo, y es del mismo tema: la MISMA tinta al ${ALFA_CASI} (\`opacity-casi\`) funciona en los dos sentidos —`)
  console.log(`  ${razon(componer(COLOR.tintaClara, COLOR.papel, ALFA_CASI), COLOR.papel).toFixed(2)}:1 sobre el papel y ${razon(componer(COLOR.tintaInvertida, COLOR.oscuro, ALFA_CASI), COLOR.oscuro).toFixed(2)}:1 sobre la invertida — porque cuelga de \`--color-tinta\`, que sí se da vuelta.`)
}
