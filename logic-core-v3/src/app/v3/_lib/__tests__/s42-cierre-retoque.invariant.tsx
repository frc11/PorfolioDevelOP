/**
 * CIERRE DEL RETOQUE 3D — el invariante: npm run test:s42-cierre-retoque
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   D6 · el túnel lento se borró (código y bandera); la tabla medida de heatbureau sigue igual.
 *   P1 · el polvo en facetas (la variante b) pasó al producto; la a y la c se borraron, con su bandera.
 *   B2 · una muesca levanta el polvo posado en toda la página: también después del último nudo (el progreso en 1).
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-3d/cierre/` (el `mirar.txt` y el `LEEME.txt`).
 */
import { existsSync, readFileSync } from 'node:fs'

import { CAPAS_DEL_TUNEL } from '../../_secciones/trabajos/tunel'
import { BASE_LIMPIA, ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../escena/entorno'
import { FACETAS_DEL_POLVO, FACETAS_VERTEX_GLSL } from '../escena/polvo/facetas'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('D6 · El túnel lento, borrado')

afirmarIgual(CAPAS_DEL_TUNEL, { escenario: { de: 1, a: 1.3, arranca: 199, topa: 1420 }, proyectos: [{ de: 0, a: 0.9, arranca: 810, topa: 1720 }, { de: 0, a: 1.2, arranca: 1303, topa: 1983 }, { de: 0, a: 1.05, arranca: 1636, topa: 2236 }], cta: { de: 0, a: 0.4, arranca: 1873, topa: 2290 } }, 'la tabla medida de heatbureau, la de siempre')
const sinLento = (fuentes: string): boolean => !/LENTO|lento|pruebas\.tunel/.test(fuentes)
const delTunel = ['_secciones/trabajos/Trabajos.tsx', '_secciones/trabajos/ritmo.ts'].map((r) => sinComentarios(leer(r))).join('\n')
afirmar(sinLento(delTunel) && !('tunel' in PRUEBAS_APAGADAS) && !('tunel' in entornoPedido('producto,tunel=lento').pruebas), 'ni el estiramiento ni la clase ni la bandera: `?pruebas=tunel=lento` no pide nada')
controlPositivo('el detector VE el túnel lento', `${delTunel}\nconst lento = useTunelLento()`, sinLento)

// ═══════════════════════════════════════════════════════════════════════════
titulo('P1 · El polvo en facetas, al producto')

const parche = sinComentarios(leer('_lib/escena/polvo/parche.ts'))
const enElProducto = (c: string): boolean => /campo === 'polvo' && e\.nitidez && e\.facetas \? '#define POLVO_FACETAS' : ''/.test(c)
afirmar(ENTORNO.facetas && !BASE_LIMPIA.facetas && !entornoPedido('producto,facetas=no').facetas && enElProducto(parche), 'la variante b es el polvo del producto (con el nítido); el banco la apaga con `facetas=no` (queda el perfil nítido de antes)')
controlPositivo('el detector VE la variante con bandera', parche.replace("e.facetas ? '#define POLVO_FACETAS'", "e.pruebas.polvo === 'b' ? '#define POLVO_FACETAS'"), enElProducto)
afirmar(FACETAS_DEL_POLVO.quedan === 0.6 && FACETAS_DEL_POLVO.tam[0] === 2.4 && FACETAS_DEL_POLVO.tam[1] === 4.4, '  la b tal cual se aprobó: el 60 % de las motas, de 2,4 a 4,4 px, cada una girando a su ritmo')
const soloAspecto = (glsl: string): boolean => !/transformed\s*=/.test(glsl) && /vParejo \*=/.test(glsl) && /gl_PointSize = /.test(glsl)
afirmar(soloAspecto(FACETAS_VERTEX_GLSL), '  cambia cuántas se ven, su tamaño, su brillo y su forma, nunca su lugar: la física aprobada anda igual')
controlPositivo('el detector VE una variante que mueve las motas', `${FACETAS_VERTEX_GLSL}\ntransformed = vec3( 0.0 );`, soloAspecto)
afirmar(!existsSync(`${V3}/_lib/escena/polvo/variantes.ts`) && Object.keys(PRUEBAS_APAGADAS).length === 0 && !/POLVO_VARIANTE|VARIANTE_/.test(parche), '  la a y la c se borraron, con la bandera `polvo=`: no queda ninguna prueba')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B2 · Una muesca levanta el polvo, en toda la página')

const fisica = sinComentarios(leer('_lib/escena/polvo/Fisica.tsx'))
const atadura = sinComentarios(leer('_lib/escena/ataduraAlScroll.ts'))
const despiertaConLaPagina = (c: string): boolean => /const scroll = \(!Number\.isNaN\(m\.progreso\) && Math\.abs\(progreso - m\.progreso\) > 1e-6\) \|\| pagina !== m\.pagina/.test(c)
afirmar(despiertaConLaPagina(fisica) && /const alDesplazar = \(\): void => \{\s*avisarQueSeMovioLaPagina\(\)/.test(atadura), 'el despertar es cualquier scroll de la página, no sólo el del recorrido: después del último nudo (el pie) el progreso queda en 1 y una muesca no lo despertaba', 'medido al final de la página: una muesca, 13.987 posadas → 13.889 levantadas en 2 s')
controlPositivo('el detector VE el despertar sólo por el progreso', fisica.replace(' || pagina !== m.pagina', ''), despiertaConLaPagina)

cerrar('s42-cierre-retoque')
