/**
 * INVARIANTE — los ocho niveles existen y se consumen en el árbol del sprint.
 *
 * Corre con `npm run test:s3-tipografia`.
 *
 * ── Las afirmaciones ──────────────────────────────────────────────────────
 *
 *   1. Los ocho niveles existen en `theme-develop.css` con el valor que la
 *      tabla del sprint dice, y **seis tienen contraparte fluida y dos no**.
 *      Que falten los dos es tan importante como que estén los seis: `cuerpo`
 *      y `base` se midieron invariantes entre 768 y 1920.
 *   2. Los tres interlineados y los CUATRO interletrados se consumen. El
 *      cuarto —`--tracking-display`— no lo usa ningún componente medido, y por
 *      eso lo ejercita la ruta de demostración: un token que no se usa en
 *      ningún lado es un token que nadie puede juzgar.
 *   3. Los ocho niveles se consumen en el árbol del sprint.
 *
 * ⚠️ **Modo pulido sacó las anclas del `clamp()` por ancho y la cap height
 * real del binario** (eran composición), y con ellas `s3-banda-afirmaciones.ts`
 * y `s3-banda-referencia.ts` enteros: la banda de punta a punta, el titular del
 * Hero como fracción de ventana, la tinta contra el alto declarado y qué hace
 * la referencia arriba de 1440.
 */

import {
  CLASE_INTERLETRADO,
  CLASE_INTERLINEADO,
  INTERLETRADOS,
  INTERLINEADOS,
  NIVELES,
  NIVELES_TIPOGRAFICOS,
} from '../tipografia'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ARCHIVOS_DE_CODIGO, leer } from './s3-archivos'
import { tokensDelTema } from './s3-css'

const tokens = tokensDelTema()
const fuenteDelSprint = ARCHIVOS_DE_CODIGO.map((a) => leer(a)).join('\n')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Los DIEZ niveles, y los OCHO que además son fluidos')

afirmarIgual(NIVELES.length, 10, 'la tabla declara DIEZ niveles — los ocho medidos de S0 y los dos DERIVADOS del titular del hero: `display` (58) y `display-xl` (104)')

const tokensQueFaltan = NIVELES.filter((n) => !tokens.has(NIVELES_TIPOGRAFICOS[n].token))
afirmarIgual(tokensQueFaltan, [], 'los diez tokens existen en theme-develop.css')

const valoresDistintos = NIVELES.filter(
  (n) => tokens.get(NIVELES_TIPOGRAFICOS[n].token) !== NIVELES_TIPOGRAFICOS[n].valorFijo,
).map((n) => ({ nivel: n, enElTema: tokens.get(NIVELES_TIPOGRAFICOS[n].token) }))
afirmarIgual(valoresDistintos, [], 'y valen lo que la tabla del sprint dice')

const conFluido = NIVELES.filter((n) => NIVELES_TIPOGRAFICOS[n].claseFluida !== null)
const sinFluido = NIVELES.filter((n) => NIVELES_TIPOGRAFICOS[n].claseFluida === null)
afirmarIgual(conFluido.length, 8, 'OCHO niveles tienen contraparte fluida')
afirmarIgual(sinFluido, ['cuerpo', 'base'], 'y los dos que no son los medidos INVARIANTES')

const fluidosQueFaltan = conFluido.filter((n) => !tokens.has(`--text-fluido-${n}`))
afirmarIgual(fluidosQueFaltan, [], 'los ocho --text-fluido-* existen en el tema')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los tres interlineados y los cuatro interletrados se consumen')

const interlineadosSinUso = INTERLINEADOS.filter(
  (i) => !fuenteDelSprint.includes(CLASE_INTERLINEADO[i]),
)
afirmarIgual(interlineadosSinUso, [], 'los tres --leading-* se usan en el árbol del sprint')

const interletradosSinUso = INTERLETRADOS.filter(
  (i) => !fuenteDelSprint.includes(CLASE_INTERLETRADO[i]),
)
afirmarIgual(interletradosSinUso, [], 'los cuatro --tracking-* también, `display` incluido')

const tokensDeMultiplicador = [
  ...INTERLINEADOS.map((i) => `--leading-${i}`),
  ...INTERLETRADOS.map((i) => `--tracking-${i}`),
]
afirmarIgual(
  tokensDeMultiplicador.filter((t) => !tokens.has(t)),
  [],
  'y los siete existen en el tema',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Los ocho niveles se consumen')

const nivelesSinUso = NIVELES.filter((n) => {
  const { claseFija, claseFluida } = NIVELES_TIPOGRAFICOS[n]
  return !fuenteDelSprint.includes(claseFija) && !fuenteDelSprint.includes(claseFluida ?? ' ')
})
afirmarIgual(nivelesSinUso, [], 'ningún nivel quedó sin consumir')

controlPositivo(
  'el buscador de consumo ve un nivel que nadie usa',
  'text-nivel-que-no-existe',
  (clase) => fuenteDelSprint.includes(clase),
)

cerrar('s3-tipografia.invariant')
