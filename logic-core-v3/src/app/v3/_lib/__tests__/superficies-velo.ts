/**
 * §3b DEL INVARIANTE DE SUPERFICIES — LOS PISOS DEL VELO EN GRADIENTE (B6-A).
 *
 * Sale de `superficies.invariant.ts` por las 300 líneas del repo, y el corte
 * es por tema: allá se afirma el MARCADO de los cuatro modos y el recorrido de
 * las ocho; acá, la ARITMÉTICA del velo: qué contraste garantizan sus dos
 * mitades con el peor píxel posible detrás, calculado desde los tokens con la
 * misma composición del censo de accesibilidad.
 */

import { afirmar, afirmarIgual, controlPositivo, razonDeContraste, titulo } from './afirmar'
import { componer } from './s10-acceso-color'
import { SECCION_INVERTIDA, tokensDelBloque, tokensDelTema } from './s3-css'

export function afirmarElVelo(): void {
titulo('3b · El velo en gradiente: los pisos de la tinta con el peor píxel detrás (B6-A)')

/**
 * En una sección OSCURA el peor caso se da vuelta. En el Hero el peor píxel es
 * el logo —lo más oscuro de la sala, 1,00:1 contra la tinta oscura, medido en
 * SITIO-S10—; con tinta clara el peor píxel es el MÁS CLARO que la escena pueda
 * pintar, que como límite es el blanco puro. Las dos mitades del velo se
 * componen sobre ese blanco. Son LÍMITES, no medidas: la sala real en cada
 * pose la mide `scripts-b6/` sobre `Page.captureScreenshot`, y sus cifras se
 * citan en `s10-acceso-escena.ts`. Acá se afirma el piso que el sistema
 * garantiza pinte lo que pinte la escena.
 *
 * Se compone con `componer` de `s10-acceso-color.ts` —la MISMA composición a 8
 * bits del censo de accesibilidad, no una segunda escritura— y se mide con la
 * calculadora del arnés, que arriba se controló contra cifras conocidas.
 */
const tema = tokensDelTema()
const invertido = tokensDelBloque(SECCION_INVERTIDA)
const TINTA_SOBRE_EL_VELO = invertido.get('--color-tinta') ?? ''
const TENUE_SOBRE_EL_VELO = invertido.get('--color-tinta-tenue') ?? ''
const rgba = (valor: string | undefined): { hex: string; alfa: number } | null => {
  const m = /rgba\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)[\s,/]+([\d.]+)\s*\)/.exec(valor ?? '')
  if (m === null) return null
  return { hex: `#${[1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, '0')).join('')}`.toUpperCase(), alfa: Number(m[4]) }
}
const denso = rgba(invertido.get('--color-velo-denso'))
const ralo = rgba(invertido.get('--color-velo-ralo'))
afirmar(denso !== null && ralo !== null, 'las dos mitades del velo invertido son `rgba()` legibles', `${invertido.get('--color-velo-denso')} · ${invertido.get('--color-velo-ralo')}`)
const DENSO = denso ?? { hex: '#000000', alfa: 0 }
const RALO = ralo ?? { hex: '#000000', alfa: 0 }
afirmarIgual(DENSO.alfa, Number(tema.get('--opacity-densa')), `la alfa densa ES \`--opacity-densa\` (${tema.get('--opacity-densa')}): el escalón que B6-A agregó a la escala, con su medición`)
afirmarIgual(RALO.alfa, Number(tema.get('--opacity-media')), `la alfa rala ES \`--opacity-media\` (${tema.get('--opacity-media')}), que ya estaba en la escala`)
afirmarIgual([DENSO.hex, RALO.hex], [invertido.get('--color-fondo')?.toUpperCase(), invertido.get('--color-fondo')?.toUpperCase()], '  y las dos son el fondo invertido, canal por canal')
afirmar(/^#[0-9A-F]{6}$/i.test(TINTA_SOBRE_EL_VELO) && /^#[0-9A-F]{6}$/i.test(TENUE_SOBRE_EL_VELO), '  y las tintas invertidas se leen del bloque, no se transcriben', `${TINTA_SOBRE_EL_VELO} · ${TENUE_SOBRE_EL_VELO}`)

const BLANCO = '#FFFFFF'
const AA = 4.5
const OPACIDAD_CASI = Number(tema.get('--opacity-casi'))
const densoSobreBlanco = componer(DENSO.hex, BLANCO, DENSO.alfa)
const raloSobreBlanco = componer(RALO.hex, BLANCO, RALO.alfa)
const plenaSobreDenso = razonDeContraste(TINTA_SOBRE_EL_VELO, densoSobreBlanco)
const casiSobreDenso = razonDeContraste(componer(TINTA_SOBRE_EL_VELO, densoSobreBlanco, OPACIDAD_CASI), densoSobreBlanco)
const tenueSobreDenso = razonDeContraste(TENUE_SOBRE_EL_VELO, densoSobreBlanco)
const plenaSobreRalo = razonDeContraste(TINTA_SOBRE_EL_VELO, raloSobreBlanco)
console.log(`  denso ${DENSO.hex} @ ${DENSO.alfa} sobre blanco → ${densoSobreBlanco} · ralo ${RALO.hex} @ ${RALO.alfa} sobre blanco → ${raloSobreBlanco}`)
console.log(`  sobre el denso: tinta plena ${plenaSobreDenso.toFixed(4)}:1 · a opacity-casi ${casiSobreDenso.toFixed(4)}:1 · tinta tenue ${tenueSobreDenso.toFixed(4)}:1`)
console.log(`  sobre el ralo:  tinta plena ${plenaSobreRalo.toFixed(4)}:1`)
afirmar(plenaSobreDenso >= AA, `la tinta PLENA pasa AA sobre el denso con BLANCO detrás — ${plenaSobreDenso.toFixed(2)}:1: el piso vale pinte lo que pinte la escena`)
afirmar(casiSobreDenso >= AA, `  y la tinta a \`opacity-casi\` también — ${casiSobreDenso.toFixed(2)}:1: por eso el denso es 0,80 y no 0,60`)
afirmar(tenueSobreDenso < AA, `  la tinta TENUE no la garantiza el piso — ${tenueSobreDenso.toFixed(2)}:1: sobre el velo se cita medida, no se supone (\`s10-acceso\` §10)`)
afirmar(plenaSobreRalo < AA, `la mitad RALA no deja pasar ni la tinta plena — ${plenaSobreRalo.toFixed(2)}:1: por eso va sólo donde no hay texto`)
afirmar(plenaSobreDenso > plenaSobreRalo && casiSobreDenso > plenaSobreRalo, '  y el denso es el que pone el piso, no el ralo')

controlPositivo(
  'con la alfa rala detrás del texto la tinta plena NO pasaría: el piso lo pone el denso, no «cualquier velo»',
  RALO.alfa,
  (alfa) => razonDeContraste(TINTA_SOBRE_EL_VELO, componer(DENSO.hex, BLANCO, alfa)) >= AA,
)
controlPositivo(
  'y la composición no es una función que devuelve el frente: con alfa 0 el velo ES el fondo',
  0,
  (alfa) => componer(DENSO.hex, BLANCO, alfa) !== BLANCO,
)
}
