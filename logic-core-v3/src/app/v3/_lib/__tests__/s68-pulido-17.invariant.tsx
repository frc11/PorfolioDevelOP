/**
 * PULIDO 17 — el invariante: npm run test:s68-pulido-17
 *
 * Cada cosa con su control positivo (el detector ve el estado de antes). Los recibos medidos, en `docs/rediseno/entregas/pulido-17/`;
 * el log, `docs/rediseno/SPRINT-PULIDO-17.md`.
 *   O1 · `?nosotros=fijo` se borró: Nosotros queda alejado (0,8) y siguiendo el 70 % del giro, sin otra lectura.
 */
import { readFileSync } from 'node:fs'

import { PLANO_DE_NOSOTROS } from '../../_secciones/quienes-somos/geometria'
import { ENTORNO, PRUEBAS_SUELTAS, entornoPedido } from '../escena/entorno'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')

// ═══════════════════════════════════════════════════════════════════════════
titulo('O1 · `?nosotros=fijo` se borró: Nosotros, alejado y siguiendo el 70 % del giro')

type Traductor = typeof entornoPedido
// La bandera no existe: no se pide suelta, el pedido no la trae y el producto no la conoce.
const sinLaBandera = (f: Traductor, sueltas: readonly string[]): boolean =>
  !sueltas.includes('nosotros') && !('nosotros' in f('producto,nosotros=fijo').pruebas) && !('nosotros' in ENTORNO.pruebas)
afirmar(sinLaBandera(entornoPedido, PRUEBAS_SUELTAS), '  `nosotros=` no es una prueba: ni suelta en la URL ni en el pedido (`producto,nosotros=fijo` es el producto)')
controlPositivo('  el detector VE la bandera de vuelta (suelta)', [...PRUEBAS_SUELTAS, 'nosotros'], (s: readonly string[]) => sinLaBandera(entornoPedido, s))
controlPositivo('  y en el pedido', ((p: string) => { const e = entornoPedido(p); return { ...e, pruebas: { ...e.pruebas, nosotros: p.includes('nosotros=fijo') ? 'fijo' : 'no' } } }) as Traductor, (f: Traductor) => sinLaBandera(f, PRUEBAS_SUELTAS))

// Un solo plano, el aprobado; los dos títulos lo piden sin elegir (la sección no lee el entorno).
const EQUIPO = leer('_secciones/quienes-somos/equipo.tsx')
const unSoloPlano = (plano: unknown, equipo: string): boolean =>
  JSON.stringify(plano) === JSON.stringify({ alejamiento: 0.8, parteDelMouse: 0.7 }) &&
  (equipo.match(/queda: false, \.\.\.PLANO_DE_NOSOTROS \}\)/g) ?? []).length === 2 && !/entornoDeLaEscena|pruebas\.nosotros|planoDeNosotros/.test(equipo)
afirmar(unSoloPlano(PLANO_DE_NOSOTROS, EQUIPO), '  un solo plano (0,8 y el 70 % de la órbita): los dos títulos de Quiénes somos lo piden, sin consultar el entorno')
controlPositivo('  el detector VE el plano de antes con sus dos lecturas', { seguido: PLANO_DE_NOSOTROS, fijo: { alejamiento: 0.57, parteDelMouse: 0 } }, (p: unknown) => unSoloPlano(p, EQUIPO))
controlPositivo('  y la sección que elige por la bandera', EQUIPO.replace('queda: false, ...PLANO_DE_NOSOTROS })', 'queda: false, ...(entornoDeLaEscena().pruebas.nosotros === \'fijo\' ? FIJO : PLANO_DE_NOSOTROS) })'), (e: string) => unSoloPlano(PLANO_DE_NOSOTROS, e))

cerrar('s68-pulido-17')
