/**
 * CIERRE DEL RETOQUE 3D — el invariante: npm run test:s42-cierre-retoque
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   D6 · el túnel lento se borró (código y bandera); la tabla medida de heatbureau sigue igual.
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-3d/cierre/` (el `mirar.txt` y el `LEEME.txt`).
 */
import { readFileSync } from 'node:fs'

import { CAPAS_DEL_TUNEL } from '../../_secciones/trabajos/tunel'
import { PRUEBAS_APAGADAS, entornoPedido } from '../escena/entorno'
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

cerrar('s42-cierre-retoque')
