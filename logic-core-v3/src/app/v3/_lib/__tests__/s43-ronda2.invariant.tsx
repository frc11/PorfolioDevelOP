/**
 * RETOQUE 3D · RONDA 2 — el invariante: npm run test:s43-ronda2
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   F6 · el ambiente: queda Bruma, de fábrica, al 0,5; Vidrio y Gotas se borraron (ya no se elige).
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-3d/ronda2/LEEME.txt`.
 */
import { readFileSync } from 'node:fs'

import { BRUMA } from '../sonido/ambienteGenerativo'
import { VOLUMEN_DEL_AMBIENTE } from '../sonido/catalogo'
import { leerVolumenes } from '../sonido/preferencia'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('F6 · El ambiente: Bruma, al 0,5')

const generativo = sinComentarios(leer('_lib/sonido/ambienteGenerativo.ts'))
const soloBruma = (c: string): boolean => /export const BRUMA: Caracter = /.test(c) && !/Vidrio|Gotas|'vidrio'|'gota'/.test(c) && !/CARACTERES/.test(c)
afirmar(soloBruma(generativo) && BRUMA.nombre === 'Bruma', 'queda un solo ambiente, Bruma (colchones lentos en re dórico); Vidrio y Gotas se borraron')
controlPositivo('el detector VE un ambiente de más', `${generativo}\nconst VIDRIO = { nombre: 'Vidrio' }`, soloBruma)
const delElegir = ['_lib/sonido/motor.ts', '_lib/sonido/preferencia.ts', '_chrome/sonido/PruebaDeSonidos.tsx', '_chrome/sonido/motorCompartido.ts'].map((r) => sinComentarios(leer(r))).join('\n')
afirmar(!/Elegidos|elegir\(|leerElegidos|guardarElegidos/.test(delElegir), '  ya no se elige: ni la preferencia, ni el motor, ni la página de prueba (escucharlo y moverle el volumen)')
const almacenQueTira = { getItem: (): never => { throw new Error('bloqueado') }, setItem: (): never => { throw new Error('bloqueado') } }
const g = globalThis as unknown as { window?: unknown }
const antes = g.window
g.window = { localStorage: almacenQueTira }
const deFabrica = leerVolumenes()
g.window = antes
afirmar(VOLUMEN_DEL_AMBIENTE === 0.5 && deFabrica.ambiente === 0.5, '  de fábrica al 0,5 (con el almacenamiento bloqueado, también: try/catch)')
afirmar(/const CLAVE_DE_LOS_VOLUMENES = 'develop-v3-sonido-volumenes-2'/.test(sinComentarios(leer('_lib/sonido/preferencia.ts'))), '  la clave de los volúmenes es nueva: el 0,5 vale aunque en el navegador hubiera quedado el volumen de antes')

cerrar('s43-ronda2')
