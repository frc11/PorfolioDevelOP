/**
 * INVARIANTE — el layout está construido al derecho: padding lateral FIJO,
 * columnas FLUIDAS, canaletas FIJAS.
 *
 * Corre con `npm run test:s3-layout`.
 *
 * ── Por qué esto necesita un instrumento y no una relectura ───────────────
 *
 * Porque el error que hay que cazar produce algo que **se ve casi igual**. Un
 * envoltorio con contenedor fijo y padding en `%` da una página que parece la
 * misma en una captura y se siente distinta al angostar la ventana: el aire
 * respira y el texto no, cuando el sistema medido hace exactamente lo
 * contrario. Nadie lo nota mirando una pantalla quieta.
 *
 * La medición, para que las afirmaciones se puedan discutir:
 *   · padding lateral **fijo**: los mismos tres márgenes absolutos (64, 112,
 *     128px) con los mismos conteos a 768 y a 1024;
 *   · columnas **fluidas**: 151 de 177 grillas cambian de ancho entre 1025 y
 *     1920;
 *   · canaletas **fijas**: 177 de 177 idénticas, cero excepciones;
 *   · la canaleta **conmuta** en 1025: 12px abajo, 16px arriba;
 *   · la grilla de 5 columnas **no existe** abajo de 1025.
 */

import { TABLAS_DE_GRILLA } from '../../_componentes/layout/Grilla'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ARCHIVOS_DE_CODIGO, leer } from './s3-archivos'
import { resolver, tokensDelTema } from './s3-css'
import { quitarComentarios } from './s3-escaneo'

const tokens = tokensDelTema()
const envoltorio = leer('src/app/v3/_componentes/layout/Envoltorio.tsx')

/** Un token del sistema, resuelto a número. Falla ruidosamente si no está. */
function px(nombre: string): number {
  const cantidad = resolver(`var(${nombre})`, tokens)
  if (cantidad === null || cantidad.unidad !== 'px') {
    throw new Error(`el token ${nombre} no resuelve a una longitud`)
  }
  return cantidad.n
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El padding lateral es FIJO, y son 32px')

afirmarIgual(px('--pad-lateral-compacto'), 32, '--pad-lateral-compacto vale 32px')
afirmar(
  envoltorio.includes('px-[var(--pad-lateral-compacto)]'),
  'el Envoltorio consume el token por var(), no un valor propio',
)

/**
 * Todo relleno lateral del sprint sale de un token, y de uno de dos: el del
 * envoltorio (`--pad-lateral-compacto`) o la escala de espaciado
 * (`--spacing-*`) para las sangrías propias de un componente.
 *
 * Lo que la afirmación busca es lo que rompe el sistema: un relleno lateral en
 * `%` o en `vw` —que es el patrón habitual y el que la medición contradice— o
 * un px escrito a mano.
 */
function rellenoLateralFueraDelSistema(codigo: string): string[] {
  return [...quitarComentarios(codigo).matchAll(/\b(?:px|pl|pr|ps|pe)-\[([^\]]+)\]/g)]
    .filter((m) => !/var\(--(?:pad-lateral-compacto|spacing-\d+)\)/.test(m[1]))
    .map((m) => m[0])
}

const rellenosRaros = ARCHIVOS_DE_CODIGO.flatMap((a) => rellenoLateralFueraDelSistema(leer(a)))
afirmarIgual(rellenosRaros, [], 'todo relleno lateral del sprint sale de un token')

controlPositivo(
  'el detector ve un relleno lateral fluido',
  'const c = "px-[5vw]"',
  (codigo) => rellenoLateralFueraDelSistema(codigo).length === 0,
)
controlPositivo(
  'y uno en px escrito a mano',
  'const c = "pl-[31px]"',
  (codigo) => rellenoLateralFueraDelSistema(codigo).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Los paneles son A SANGRE y el tope es del CONTENIDO')

afirmar(envoltorio.includes('max-w-full'), 'la caja de afuera no tiene tope: max-w-full')
afirmar(envoltorio.includes('max-w-tope'), 'el tope de 1920 lo lleva la caja de contenido')
afirmarIgual(px('--container-tope'), 1920, '--container-tope vale 1920px')
afirmar(
  tokens.get('--container-dominante') === '100%',
  'el envoltorio dominante medido es 100%',
  tokens.get('--container-dominante'),
)

const topesInventados = ARCHIVOS_DE_CODIGO.flatMap((a) =>
  [...quitarComentarios(leer(a)).matchAll(/\bmax-w-\[([^\]]+)\]/g)]
    .filter((m) => !m[1].includes('var('))
    .map((m) => m[0]),
)
afirmarIgual(topesInventados, [], 'ningún tope de ancho escrito a mano')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Las columnas son FLUIDAS')

/** Una definición de columnas es fluida si no fija un ancho: `grid-cols-N`
 *  emite `repeat(N, minmax(0,1fr))`, y la lateral declara el único ancho
 *  medido —140px— por token, con la otra columna en `minmax(0,1fr)`. */
function columnasNoFluidas(tabla: Readonly<Record<string, string>>): string[] {
  const malas: string[] = []
  for (const [clave, clases] of Object.entries(tabla)) {
    for (const clase of clases.split(/\s+/)) {
      const cuerpo = clase.replace(/^[a-z]+:/, '')
      if (!cuerpo.startsWith('grid-cols-')) continue
      const valor = cuerpo.slice('grid-cols-'.length)
      if (/^\d+$/.test(valor)) continue
      if (valor.startsWith('[') && valor.includes('minmax(0,1fr)') && valor.includes('var(')) continue
      malas.push(`${clave}: ${clase}`)
    }
  }
  return malas
}

afirmarIgual(columnasNoFluidas(TABLAS_DE_GRILLA.columnas), [], 'las seis definiciones de columnas son fluidas')
afirmarIgual(px('--columna-lateral'), 140, 'la única columna con ancho declarado son 140px')
afirmar(
  TABLAS_DE_GRILLA.columnas.lateral.includes('var(--columna-lateral)'),
  'y los 140px entran por token',
)

controlPositivo(
  'el detector ve una columna con ancho fijo',
  { fija: 'grid-cols-[300px_minmax(0,1fr)]' },
  (tabla) => columnasNoFluidas(tabla).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Las canaletas son FIJAS, y conmutan en 1025')

afirmarIgual(px('--grilla-canal-compacto'), 12, 'la canaleta compacta son 12px')
afirmarIgual(px('--grilla-canal-amplio'), 16, 'la canaleta amplia son 16px')

function canaletasFueraDelSistema(tabla: Readonly<Record<string, string>>): string[] {
  return Object.entries(tabla).flatMap(([clave, clases]) =>
    clases
      .split(/\s+/)
      .filter((clase) => !/--grilla-canal-(?:compacto|amplio)/.test(clase))
      .map((clase) => `${clave}: ${clase}`),
  )
}

afirmarIgual(canaletasFueraDelSistema(TABLAS_DE_GRILLA.canal), [], 'las tres canaletas usan sólo los dos tokens')
afirmar(
  TABLAS_DE_GRILLA.canal.conmutado.includes('escritorio:gap-[var(--grilla-canal-amplio)]'),
  'la conmutación pasa por la variante `escritorio:`, generada desde --breakpoint-escritorio',
)

controlPositivo(
  'el detector ve una canaleta escrita a mano',
  { rota: 'gap-[14px]' },
  (tabla) => canaletasFueraDelSistema(tabla).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · La grilla de cinco columnas no existe abajo de 1025')

afirmar(
  TABLAS_DE_GRILLA.columnas[5].includes('escritorio:grid-cols-5'),
  'las cinco columnas cuelgan de la variante `escritorio:`',
)
afirmar(
  TABLAS_DE_GRILLA.columnas[5].includes('grid-cols-1'),
  '  y abajo del umbral cae a una sola columna',
)
afirmar(
  !/(^|\s)grid-cols-5(\s|$)/.test(TABLAS_DE_GRILLA.columnas[5]),
  '  sin una versión incondicional que se cuele a 375px',
)

// Los tres breakpoints del sistema, para que las variantes signifiquen algo.
afirmarIgual(px('--breakpoint-tablet'), 768, '--breakpoint-tablet vale 768px')
afirmarIgual(px('--breakpoint-medio'), 860, '--breakpoint-medio vale 860px')
afirmarIgual(px('--breakpoint-escritorio'), 1025, '--breakpoint-escritorio vale 1025px')

cerrar('s3-layout.invariant')
