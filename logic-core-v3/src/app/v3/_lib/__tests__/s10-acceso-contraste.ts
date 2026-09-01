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
 */

export function afirmarElFoco(): void {
  titulo('9 · EL FOCO — qué regla lo pinta, y sobre qué superficie cae cada parada')

  console.log('  regla única, en `theme-develop.css`: `[data-v3] :focus-visible { outline: var(--foco-grosor) solid')
  console.log('  var(--color-foco); outline-offset: var(--foco-desplazamiento) }`, y `--color-foco` ES `var(--color-tinta)`,')
  console.log('  así que `[data-seccion="invertida"]` lo da vuelta sin mencionarlo.')
  const CAIDAS: readonly CaidaDelAnillo[] = [
    { paradas: '1–5', donde: 'la pastilla, flotando sobre una sección clara', anillo: COLOR.tintaClara, sobre: COLOR.papel },
    { paradas: '1–5', donde: 'la pastilla, flotando sobre una invertida (superficie translúcida al 0,6 encima del oscuro)', anillo: COLOR.tintaClara, sobre: componer(COLOR.papel, COLOR.oscuro, ALFA_CASI) },
    { paradas: '6', donde: 'el CTA del Hero — `papel-transparente`', anillo: COLOR.tintaClara, sobre: null },
    { paradas: '7–15', donde: 'el CTA, los 7 enlaces del pie y el campo del Cierre — `oscuro-opaco`', anillo: COLOR.tintaInvertida, sobre: COLOR.oscuro },
  ]
  imprimirAnillos(CAIDAS)
  afirmarIgual(anillosFlojos(CAIDAS), [], 'las 15 paradas reciben un anillo de ≥3:1 contra su superficie — el mínimo de un componente de interfaz')
  console.log('  sobre la escena el anillo es la MISMA tinta que el texto, así que hereda las cifras de OTRO instrumento:')
  for (const c of CONTRASTE_CONTRA_LA_ESCENA) console.log(`     ${c.seccion}: ${c.razon.toFixed(2)}:1 — ${c.instrumento}`)
  console.log(`  ⚠ HUECO declarado del sprint («${HUECOS[2].nombre}»): ${HUECOS[2].porQue}.`)
  console.log(`     Lo cerraría: ${HUECOS[2].queLoCerraria}. Este frente NO afirma que el anillo se vea; afirma su contraste.`)
}


import { HUECOS } from './s10-banco'

import { afirmar, afirmarIgual, titulo } from './afirmar'
import {
  AA, ALFA_CASI, COLOR, CONTRASTE_CONTRA_LA_ESCENA, cajasDeColor, componer,
  loRedefineLaInvertida, razon, superficiesDelDocumento,
} from './s10-acceso-color'
import { anillosFlojos, imprimirAnillos, imprimirContraste, type CaidaDelAnillo } from './s10-acceso-tablas'

export function afirmarElContraste(QUIETA: string): void {
  titulo('10 · EL CONTRASTE DE TEXTO EN LAS OCHO — con las opacas que nadie había medido')

  afirmarIgual(superficiesDelDocumento(QUIETA).length, 8, 'las ocho secciones declaran su superficie en el propio marcado')
  const CAJAS = cajasDeColor(QUIETA)
  imprimirContraste(CAJAS)
  console.log('  ── las dos transparentes NO se recalculan acá: su fondo es la escena, no un token')
  for (const c of CONTRASTE_CONTRA_LA_ESCENA) console.log(`     ${c.seccion}: ${c.razon.toFixed(2)}:1 — ${c.instrumento}`)
  afirmarIgual(
    [...new Set(CAJAS.filter((c) => c.fondo === null).map((c) => `${c.tinta.token}@${c.tinta.alfa}`))],
    ['--color-tinta@1'],
    '  y la cita vale para TODO su texto: las dos transparentes usan una sola tinta, plena y sin alfa',
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
