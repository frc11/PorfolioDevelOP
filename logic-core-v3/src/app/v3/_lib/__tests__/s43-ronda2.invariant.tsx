/**
 * RETOQUE 3D · RONDA 2 — el invariante: npm run test:s43-ronda2
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   F6 · el ambiente: queda Bruma, de fábrica, al 0,5; Vidrio y Gotas se borraron (ya no se elige).
 *   F3 · el encendido del haz (parpadeo y zumbido) sólo con la noche empezando en Portfolio, scrolleando: en un viaje del
 *        menú o fuera de Portfolio, el haz prende callado y sin fallar.
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-3d/ronda2/LEEME.txt`.
 */
import { readFileSync } from 'node:fs'

import { BRUMA } from '../sonido/ambienteGenerativo'
import { CHOREO_TRAMOS } from '../escena/choreography'
import { avanzarElEncendido, encendidoInicial, noPasoDePortfolio } from '../escena/entorno/encendido'
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

// ═══════════════════════════════════════════════════════════════════════════
titulo('F3 · El encendido del haz, sólo en Portfolio')

const apagado = encendidoInicial(0, 0)
const fases = (sinGuion: boolean): string[] => {
  let e = apagado
  const vistas: string[] = []
  for (let t = 1; t < 6; t += 1 / 30) {
    e = avanzarElEncendido(e, 0.9, t, sinGuion)
    if (!vistas.includes(e.fase)) vistas.push(e.fase)
  }
  return vistas
}
afirmar(fases(false).includes('encendiendo') && !fases(true).includes('encendiendo') && fases(true).at(-1) === 'prendido', 'sin guion (un viaje del menú, fuera de Portfolio, movimiento reducido) el haz prende sin pasar por los intentos: ni parpadeo ni zumbido (el sonido se larga sólo al entrar a `encendiendo`)', `con guion: ${fases(false).join(' → ')} · sin: ${fases(true).join(' → ')}`)
let aMitad = encendidoInicial(0, 0)
for (let t = 1; t < 1.6; t += 1 / 30) aMitad = avanzarElEncendido(aMitad, 0.9, t, false)
afirmar(aMitad.fase === 'encendiendo' && avanzarElEncendido(aMitad, 0.9, 1.7, true).fase === 'prendido', '  y si un viaje empieza a mitad del guion, queda prendido (y el zumbido se calla: lo calla el entorno al salir de `encendiendo`)')
const hastaPortfolio = (f: typeof noPasoDePortfolio): boolean => f(0.55, CHOREO_TRAMOS) && f(0.45, CHOREO_TRAMOS) && !f(0.7, CHOREO_TRAMOS) && !f(0.9, CHOREO_TRAMOS)
afirmar(hastaPortfolio(noPasoDePortfolio), '  hasta el final de Portfolio (el tramo `trabajos`, 0,625): la noche la dispara el círculo de entrada a Trabajos, que puede caer antes de su nudo; más abajo (Servicios, Tu panel, el amanecer), sin guion')
controlPositivo('el detector VE la noche de más abajo con guion', (() => true) as typeof noPasoDePortfolio, hastaPortfolio)
const entornoTsx = sinComentarios(leer('_lib/escena/entorno/Entorno.tsx'))
afirmar(/const sinGuion = quieto \|\| viajeEnCurso\(\) !== null \|\| !noPasoDePortfolio\(rig\.current\.progress, CHOREO_TRAMOS\)/.test(entornoTsx) && /encendidoInicial\(noche, t\), noche, t, sinGuion\)/.test(entornoTsx), '  el entorno lo pide así en cada cuadro: con movimiento reducido, en un viaje o fuera de Portfolio, sin guion')

cerrar('s43-ronda2')
