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
 * ── ⚠️ B6-A: el texto sobre el VELO tiene dos varas, y las dos se escriben ──
 *
 * Con Trabajos y el Cierre en `oscuro-transparente` hay texto cuyo fondo es la
 * escena detrás de un velo, y la escena no es un token. Dos varas:
 *
 *   · **La tinta primaria (`--color-tinta`, a cualquier alfa) se afirma contra
 *     el PISO**: el velo denso compuesto sobre BLANCO, el píxel más claro que
 *     una sala puede pintar. Es propio —sale de los tokens— y vale pinte lo
 *     que pinte la escena.
 *   · **Las otras tintas (media, tenue) el piso NO las garantiza** (3,2:1 la
 *     tenue sobre el denso con blanco detrás) y por eso se CITAN: cada una
 *     necesita su fila en `CONTRASTE_CONTRA_LA_ESCENA`, medida sobre la escena
 *     real por el instrumento que la firma, y ≥ AA. Sin fila, rojo.
 */

import { afirmar, afirmarIgual, titulo } from './afirmar'
import { AA, ALFA_CASI, COLOR, cajasDeColor, componer, loRedefineLaInvertida, razon, superficiesDelDocumento, type CajaDeColor } from './s10-acceso-color'
import { CONTRASTE_CONTRA_LA_ESCENA } from './s10-acceso-escena'
import { anillosFlojos, imprimirAnillos, imprimirContraste, type CaidaDelAnillo } from './s10-acceso-tablas'
import { valorDeToken } from './s10-css'
import { HUECOS } from './s10-banco'

/** El píxel más claro que la escena puede pintar detrás de un velo oscuro. */
const BLANCO = '#FFFFFF'
/** La alfa DENSA del velo, la mitad que va detrás del texto. Leída del tema. */
const ALFA_DENSA = Number.parseFloat(valorDeToken('--opacity-densa'))
/** El piso: el velo denso sobre blanco. Sobre `[data-seccion="invertida"]` el velo es el fondo oscuro. */
const VELO_DENSO_SOBRE_BLANCO = componer(COLOR.oscuro, BLANCO, ALFA_DENSA)

export function afirmarElFoco(): void {
  titulo('9 · EL FOCO — qué regla lo pinta, y sobre qué superficie cae cada parada')

  console.log('  regla única, en `theme-develop.css`: `[data-v3] :focus-visible { outline: var(--foco-grosor) solid')
  console.log('  var(--color-foco); outline-offset: var(--foco-desplazamiento) }`, y `--color-foco` ES `var(--color-tinta)`,')
  console.log('  así que `[data-seccion="invertida"]` lo da vuelta sin mencionarlo.')
  const CAIDAS: readonly CaidaDelAnillo[] = [
    { paradas: '1–5', donde: 'la pastilla, flotando sobre una sección clara', anillo: COLOR.tintaClara, sobre: COLOR.papel },
    { paradas: '1–5', donde: 'la pastilla, flotando sobre una invertida (superficie translúcida al 0,6 encima del oscuro)', anillo: COLOR.tintaClara, sobre: componer(COLOR.papel, COLOR.oscuro, ALFA_CASI) },
    { paradas: '6', donde: 'el CTA del Hero — `papel-transparente`', anillo: COLOR.tintaClara, sobre: null },
    { paradas: '7–15', donde: 'el CTA, los 7 enlaces del pie y el campo del Cierre — `oscuro-transparente`: el velo denso con el peor píxel (blanco) detrás', anillo: COLOR.tintaInvertida, sobre: VELO_DENSO_SOBRE_BLANCO },
  ]
  imprimirAnillos(CAIDAS)
  afirmarIgual(anillosFlojos(CAIDAS), [], 'las 15 paradas reciben un anillo de ≥3:1 contra su superficie — el mínimo de un componente de interfaz')
  console.log('  sobre la escena el anillo es la MISMA tinta que el texto, así que hereda las cifras de OTRO instrumento:')
  for (const c of CONTRASTE_CONTRA_LA_ESCENA) console.log(`     ${c.seccion}${c.tinta === undefined ? '' : ` (${c.tinta})`}: ${c.razon.toFixed(2)}:1 — ${c.instrumento}`)
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
  for (const c of CONTRASTE_CONTRA_LA_ESCENA) console.log(`     ${c.seccion}${c.tinta === undefined ? '' : ` (${c.tinta})`}: ${c.razon.toFixed(2)}:1 — ${c.instrumento}`)

  const modoDe = new Map(superficies.map((s) => [s.id, s.modo]))
  const sobreLaEscena = CAJAS.filter((c) => c.fondo === null)
  const claras = sobreLaEscena.filter((c) => modoDe.get(c.seccion) === 'papel-transparente')
  const veladas = sobreLaEscena.filter((c) => modoDe.get(c.seccion) === 'oscuro-transparente')
  afirmarIgual(
    [...new Set(claras.map(tinta))],
    ['--color-tinta@1'],
    '  y la cita de S9 vale para TODO su texto: las dos claras usan una sola tinta, plena y sin alfa',
  )
  afirmar(veladas.length > 0, `hay texto sobre el velo — ${veladas.length} cajas en ${[...new Set(veladas.map((c) => c.seccion))].join(' y ')} (B6-A)`)

  // ── la vara propia: la tinta primaria contra el piso ──────────────────────
  const conPiso = veladas.filter((c) => c.tinta.token === '--color-tinta')
  const razonesDelPiso = conPiso.map((c) => ({ c, r: razon(componer(c.tinta.hex, VELO_DENSO_SOBRE_BLANCO, c.tinta.alfa), VELO_DENSO_SOBRE_BLANCO) }))
  const peorDelPiso = razonesDelPiso.reduce((a, b) => (b.r < a.r ? b : a), { c: conPiso[0], r: Number.POSITIVE_INFINITY })
  console.log(`  velo denso (${ALFA_DENSA}) sobre blanco: ${VELO_DENSO_SOBRE_BLANCO} — el piso de la tinta primaria a cualquier alfa`)
  afirmarIgual(
    razonesDelPiso.filter(({ r }) => r < AA).map(({ c }) => `${c.seccion}/${tinta(c)}`),
    [],
    `la tinta primaria pasa AA sobre el velo con blanco detrás en las ${conPiso.length} cajas — peor ${peorDelPiso.r.toFixed(2)}:1 (${peorDelPiso.c.seccion}, ${tinta(peorDelPiso.c)})`,
  )
  afirmar(
    razon(componer(COLOR.tintaInvertida, VELO_DENSO_SOBRE_BLANCO, 0.3), VELO_DENSO_SOBRE_BLANCO) < AA,
    '  [control positivo] el piso no es «pasa siempre»: la misma tinta a 0,3 no pasa',
  )

  // ── la vara citada: las otras tintas, medidas sobre la escena real ────────
  const sinPiso = [...new Set(veladas.filter((c) => c.tinta.token !== '--color-tinta').map((c) => `${c.seccion}/${tinta(c)}`))].sort()
  const citadas = new Map(CONTRASTE_CONTRA_LA_ESCENA.filter((f) => f.tinta !== undefined).map((f) => [`${f.seccion}/${f.tinta}`, f]))
  afirmarIgual(
    sinPiso.filter((k) => !citadas.has(k)),
    [],
    `cada tinta secundaria sobre el velo tiene su cifra MEDIDA sobre la escena real: ${sinPiso.join(' · ') || 'ninguna'}`,
  )
  afirmarIgual(
    sinPiso.filter((k) => (citadas.get(k)?.razon ?? 0) < AA),
    [],
    '  y todas las citas pasan AA',
  )
  afirmar(
    razon(COLOR.tenueInvertida, VELO_DENSO_SOBRE_BLANCO) < AA,
    `  [control positivo] la tinta tenue NO la garantiza el piso — ${razon(COLOR.tenueInvertida, VELO_DENSO_SOBRE_BLANCO).toFixed(2)}:1: por eso se cita y no se supone`,
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
    'el inventario de fallas de AA está VACÍO: ningún texto del home queda abajo de 4,5:1 contra su superficie',
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
