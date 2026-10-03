/**
 * RETOQUE DEL PIE + FILO — el invariante: npm run test:s44-pie
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   P1 · el filo de día: la b (los costados en otro gris) en todos los títulos 3D negros; la a, la c y la bandera, borradas.
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-3d/pie/LEEME.txt`.
 */
import { readFileSync } from 'node:fs'

import { ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../escena/entorno'
import { COSTADO_DE_DIA, costadoDeDiaGlsl } from '../escena/titulos3d/filo'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('P1 · El filo de día: la b, en el producto')

const glsl = costadoDeDiaGlsl(2)
const esLaB = (g: string): boolean => /mix\( vec3\( 0\.200 \), diffuseColor\.rgb, mix\( 1\.0, vTapaDelLogo, /.test(g) && /emissive\.r \/ 2\.000/.test(g) && !/uContornoDelLogo/.test(g)
afirmar(esLaB(glsl) && COSTADO_DE_DIA === 0.2, 'de día, los costados en un gris (0,2 lineal) distinto de la cara; se apaga con la noche del logo; sin el filo claro de la a')
controlPositivo('el detector VE el filo claro de la a', `${glsl}\nfloat d = texture2D( uContornoDelLogo, vPlanoDelLogo ).r;`, esLaB)
const material = sinComentarios(leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx'))
const enTodos = (c: string): boolean =>
  /if \(variante === 'blanco'\) shader\.fragmentShader = [^\n]*FILO_DE_DIA_GLSL[^\n]*\n\s*else shader\.fragmentShader = shader\.fragmentShader\.replace\('#include <map_fragment>', `#include <map_fragment>\\n\$\{costadoDeDiaGlsl\(EMISION_EN_LA_NOCHE\)\}`\)/.test(c) &&
  /customProgramCacheKey = \(\) => `titulo-de-volumen-\$\{variante\}`/.test(c)
afirmar(enTodos(material), '  en todos los títulos negros (el hero, El equipo, Portfolio, la frase, las demos): sin condición; el blanco sigue con su filo oscuro')
controlPositivo('el detector VE la b todavía con bandera', material.replace("else shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>'", "else if (filo !== 'no') shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>'"), enTodos)
const sinBandera = (e: typeof ENTORNO, codigo: string): boolean => !('filo' in e.pruebas) && !/pruebas\.filo|filoDeDiaGlsl|FILO_DE_DIA\b/.test(codigo)
afirmar(sinBandera(ENTORNO, material) && !('filo' in PRUEBAS_APAGADAS) && !('filo' in entornoPedido('producto,filo=a').pruebas), '  la a, la c y la bandera se borraron: `?pruebas=filo=a` ya no pide nada')
controlPositivo('el detector VE la bandera', { ...ENTORNO, pruebas: { filo: 'a' } } as unknown as typeof ENTORNO, (e) => sinBandera(e, material))
const delLogo = ['_lib/escena/logoDeNoche.ts', '_lib/escena/logoEmision.ts'].map(leer).join('\n')
afirmar(!/filo'|costadoDeDiaGlsl/.test(delLogo), '  el logo no se toca')

cerrar('s44-pie')
