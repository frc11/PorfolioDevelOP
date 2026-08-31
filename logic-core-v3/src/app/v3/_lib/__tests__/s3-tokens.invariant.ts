/**
 * INVARIANTE — cero color, tamaño, radio, duración o curva fuera de los
 * tokens. Ni un hex, ni un px suelto.
 *
 * Corre con `npm run test:s3-tokens`.
 *
 * ── Qué afirma, y por qué cada cosa ───────────────────────────────────────
 *
 *   1. El PADRÓN de archivos está completo. Sin esto, todo lo demás pasa en
 *      verde sobre menos código del que cree: un archivo nuevo no escaneado no
 *      hace fallar nada.
 *   2. Cero hex y cero funciones de color literales, en las hojas y en el
 *      código.
 *   3. En el PUNTO DE USO —toda declaración que no es una propiedad
 *      personalizada— no hay un solo literal con unidad fuera de una lista
 *      corta y estructural.
 *   4. El conjunto de propiedades de componente es exactamente el registrado,
 *      con sus valores. Es lo que hace que la excepción del punto 3 no sea un
 *      agujero: los literales existen en un solo lugar, con su procedencia.
 *   5. Cada selector empieza por `[data-v3]`. Ninguna de estas hojas puede
 *      tocar el sitio vivo.
 *   6. Ningún `@media` con un literal de longitud: los breakpoints entran por
 *      las variantes de Tailwind, que se generan desde `--breakpoint-*`.
 *   7. Toda clase de valor arbitrario consume un token por `var()`.
 *
 * Los siete llevan control positivo con la MISMA función que hizo pasar la
 * afirmación, contra una entrada rota a propósito.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import {
  ARCHIVOS_DEL_SPRINT,
  ARCHIVOS_DE_CODIGO,
  ARCHIVOS_DE_ESTILO,
  archivosDeclaradosQueFaltan,
  archivosSinRegistrar,
  leer,
} from './s3-archivos'
import { customPropsDe, declaracionesDe, partesDeSelector, reglas, sinComentarios } from './s3-css'
import {
  arbitrariosSinVar,
  funcionesDeColorEncontradas,
  hexEncontrados,
  literalesConUnidad,
  quitarComentarios,
} from './s3-escaneo'
import { REGISTRO, REGISTRO_POR_NOMBRE } from './s3-registro-de-tokens'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El padrón cubre todo lo que el sprint escribió')

afirmarIgual(archivosSinRegistrar(), [], 'no hay archivos en disco fuera del padrón')
afirmarIgual(archivosDeclaradosQueFaltan(), [], 'no hay archivos del padrón que falten en disco')
afirmar(
  ARCHIVOS_DEL_SPRINT.length >= 30,
  `el padrón tiene ${ARCHIVOS_DEL_SPRINT.length} archivos`,
  `${ARCHIVOS_DE_ESTILO.length} hojas · ${ARCHIVOS_DE_CODIGO.length} de código`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Cero color escrito a mano')

const hexPorArchivo = ARCHIVOS_DEL_SPRINT.map((a) => ({
  archivo: a,
  hallados: hexEncontrados(quitarComentarios(leer(a))),
})).filter((r) => r.hallados.length > 0)
afirmarIgual(hexPorArchivo, [], 'ningún archivo del sprint escribe un hex')

const coloresLiterales = ARCHIVOS_DE_ESTILO.map((a) => ({
  archivo: a,
  hallados: funcionesDeColorEncontradas(sinComentarios(leer(a))),
})).filter((r) => r.hallados.length > 0)
afirmarIgual(coloresLiterales, [], 'ninguna hoja escribe rgb(), hsl() ni oklch()')

controlPositivo('el detector de hex ve un color escrito a mano', '.x { color: #1D5B8F; }', (css) => hexEncontrados(css).length === 0)
controlPositivo(
  'el detector de funciones de color ve un rgba()',
  '.x { background: rgba(17, 17, 17, 0.1); }',
  (css) => funcionesDeColorEncontradas(css).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · En el punto de uso no hay un literal con unidad')

interface Sospecha {
  readonly archivo: string
  readonly prop: string
  readonly valor: string
  readonly literales: readonly string[]
}

function literalesEnUso(css: string, archivo: string): Sospecha[] {
  const salida: Sospecha[] = []
  for (const regla of reglas(css)) {
    for (const { prop, valor } of declaracionesDe(regla.cuerpo)) {
      if (prop.startsWith('--')) continue
      const literales = literalesConUnidad(valor)
      if (literales.length > 0) salida.push({ archivo, prop, valor, literales })
    }
  }
  return salida
}

const enUso = ARCHIVOS_DE_ESTILO.flatMap((a) => literalesEnUso(leer(a), a))
afirmarIgual(enUso, [], 'ninguna declaración normal escribe un valor con unidad')

controlPositivo(
  'el detector ve un padding en px escrito directo',
  '[data-v3] .x { padding-left: 32px; }',
  (css) => literalesEnUso(css, 'control').length === 0,
)
controlPositivo(
  'el detector ve una duración suelta',
  '[data-v3] .x { transition-duration: 1.3s; }',
  (css) => literalesEnUso(css, 'control').length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Las propiedades de componente son exactamente las registradas')

const declaradasEnHojas = new Map<string, string>()
for (const archivo of ARCHIVOS_DE_ESTILO) {
  for (const [nombre, valor] of customPropsDe(leer(archivo))) declaradasEnHojas.set(nombre, valor)
}

const sinRegistrar = [...declaradasEnHojas.keys()].filter((n) => !REGISTRO_POR_NOMBRE.has(n)).sort()
const registradasQueNoExisten = REGISTRO.map((p) => p.nombre)
  .filter((n) => !declaradasEnHojas.has(n))
  .sort()

afirmarIgual(sinRegistrar, [], 'ninguna propiedad de componente sin registrar')
afirmarIgual(registradasQueNoExisten, [], 'ninguna propiedad registrada que ya no exista')
afirmarIgual(declaradasEnHojas.size, REGISTRO.length, `${REGISTRO.length} propiedades de componente`)

const valoresDistintos = REGISTRO.filter((p) => declaradasEnHojas.get(p.nombre) !== p.valor).map(
  (p) => ({ nombre: p.nombre, registrado: p.valor, enLaHoja: declaradasEnHojas.get(p.nombre) }),
)
afirmarIgual(valoresDistintos, [], 'cada propiedad vale en la hoja lo que dice el registro')

const sinProcedencia = REGISTRO.filter((p) => p.procedencia.trim().length < 12).map((p) => p.nombre)
afirmarIgual(sinProcedencia, [], 'las 25 registradas declaran de dónde salen')

const porEvidencia = { medido: 0, derivado: 0, decidido: 0 }
for (const p of REGISTRO) porEvidencia[p.evidencia] += 1
console.log(
  `  reparto: ${porEvidencia.medido} medidas · ${porEvidencia.derivado} derivadas · ${porEvidencia.decidido} decididas`,
)

controlPositivo(
  'el comparador ve una propiedad que la hoja declara y el registro no',
  '[data-v3] .x { --inventada-por-nadie: 7px; }',
  (css) => [...customPropsDe(css).keys()].every((n) => REGISTRO_POR_NOMBRE.has(n)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Todo selector del sprint está acotado a [data-v3]')

/**
 * ⚠ **EL DETECTOR TENÍA UN PROXY, NO LA PROPIEDAD (SITIO-S9).** Lo que se
 * custodia es *«ninguna regla puede alcanzar al sitio vivo»*, y `startsWith`
 * era la forma barata de comprobarlo mientras todas las reglas colgaran del
 * envoltorio. `scroll-padding` no puede: va sobre el CONTENEDOR DE SCROLL, que
 * es el `<html>`, y el `<html>` no lleva la marca. `html:has([data-v3])`
 * cumple la propiedad —**sólo matchea cuando hay un `[data-v3]` en el
 * documento**, o sea nunca en el sitio vivo— y no cumplía el proxy.
 *
 * Se le enseña **esa forma exacta y nada más**, anclada a la cadena completa y
 * no a un `includes('[data-v3]')`: un sustring bastaría para que `html, button`
 * pasara con sólo nombrar la marca en otro lado, que es §7.25 otra vez. Los
 * tres controles positivos de abajo cubren las tres formas de romperlo.
 */
const CONTENEDOR_DE_SCROLL_DE_V3 = 'html:has([data-v3])'

function selectoresFueraDeAlcance(css: string): string[] {
  const acotada = (parte: string): boolean =>
    parte.startsWith('[data-v3]') || parte === CONTENEDOR_DE_SCROLL_DE_V3
  return reglas(css)
    .map((r) => r.selector)
    .filter((s) => !s.startsWith('@'))
    .filter((s) => partesDeSelector(s).some((parte) => !acotada(parte)))
}

const fuera = ARCHIVOS_DE_ESTILO.flatMap((a) => selectoresFueraDeAlcance(leer(a)))
afirmarIgual(fuera, [], 'ninguna regla puede alcanzar al sitio vivo')

controlPositivo(
  'el detector ve un selector global',
  'button:hover { color: red; }',
  (css) => selectoresFueraDeAlcance(css).length === 0,
)
controlPositivo(
  'y lo ve aunque esté en la segunda mitad de una lista de selectores',
  '[data-v3] .a:hover, button { color: red; }',
  (css) => selectoresFueraDeAlcance(css).length === 0,
)
controlPositivo(
  'el `html` pelado NO pasa por parecerse al contenedor de scroll de /v3',
  'html { scroll-padding-top: 1px; }',
  (css) => selectoresFueraDeAlcance(css).length === 0,
)
controlPositivo(
  '  ni un `:has()` que no es el de la marca',
  'html:has(.cualquiera) { scroll-padding-top: 1px; }',
  (css) => selectoresFueraDeAlcance(css).length === 0,
)
controlPositivo(
  '  ni uno que sólo NOMBRA la marca en otro lado: la forma está anclada entera',
  'html, .x[data-v3] { color: red; }',
  (css) => selectoresFueraDeAlcance(css).length === 0,
)
const conLaForma = ARCHIVOS_DE_ESTILO.filter((a) =>
  reglas(leer(a)).some((r) => r.selector === CONTENEDOR_DE_SCROLL_DE_V3),
)
afirmarIgual(
  conLaForma.map((a) => a.split('/').pop()),
  ['navegacion.css'],
  '  y una sola hoja usa esa forma: la que la necesita, el `scroll-padding-top` de las anclas',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Ningún @media con un literal de longitud')

function mediasConLiteral(css: string): string[] {
  return reglas(css)
    .map((r) => (r.contexto.length > 0 ? r.contexto : r.selector))
    .filter((s) => s.startsWith('@media'))
    .filter((s) => literalesConUnidad(s).length > 0)
}

const mediasSospechosas = ARCHIVOS_DE_ESTILO.flatMap((a) => mediasConLiteral(leer(a)))
afirmarIgual([...new Set(mediasSospechosas)], [], 'los breakpoints entran por las variantes, no por una media query escrita')

controlPositivo(
  'el detector ve un breakpoint escrito a mano',
  '@media (min-width: 1025px) { [data-v3] .x { gap: var(--grilla-canal-amplio); } }',
  (css) => mediasConLiteral(css).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Toda clase arbitraria consume un token')

const arbitrarios = ARCHIVOS_DE_CODIGO.map((a) => ({
  archivo: a,
  hallados: arbitrariosSinVar(leer(a)),
})).filter((r) => r.hallados.length > 0)
afirmarIgual(arbitrarios, [], 'ninguna clase arbitraria escribe un valor propio')

controlPositivo(
  'el detector ve una clase arbitraria con un px adentro',
  'const c = "px-[32px] gap-[var(--spacing-2)]"',
  (codigo) => arbitrariosSinVar(codigo).length === 0,
)

cerrar('s3-tokens.invariant')
