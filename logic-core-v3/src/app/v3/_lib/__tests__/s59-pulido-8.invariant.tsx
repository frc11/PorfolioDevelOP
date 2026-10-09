/**
 * PULIDO 8 — el invariante: npm run test:s59-pulido-8
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   G1 · la limpieza: el volteo con las placas a la vez es el producto; la cascada, `?volteo=` y `?meta=contorno` (la metamorfosis
 *        vieja, con su código: el estado, el ruido y el stencil del lienzo) ya no existen.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-8.md`.
 */
import { existsSync, readFileSync } from 'node:fs'

import { ENTORNO, PRUEBAS_SUELTAS, entornoPedido } from '../escena/entorno'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('G1 · La limpieza: el volteo a la vez, sin la cascada ni la metamorfosis vieja')

// YA NO EXISTEN: `contorno.ts`; en el código de la escena del CTA, nada que la nombre (ni su estado, su ruido o el stencil que
// pedía al lienzo); las claves `meta` y `volteo` de las pruebas (ni pedidas sueltas ni por `?pruebas=`); la cascada del volteo.
// Reemplaza a las aserciones que fijaban `contorno` (`s55` C1, `s56` D1 · 5, `s57` E1 · 1 a 3) y la cascada (`s58` F2 · 2).
const CTA = '_lib/escena/ctaDelFinal'
interface Codigo {
  readonly existe: boolean
  readonly escena: string
  readonly volteo: string
  readonly transformacion: string
  readonly piezas: string
  readonly lienzo: string
}
const codigoDeHoy = (): Codigo => ({
  existe: existsSync(`${V3}/${CTA}/contorno.ts`),
  escena: sinComentarios(leer(`${CTA}/EscenaDelCta.tsx`)),
  volteo: sinComentarios(leer(`${CTA}/volteo.ts`)),
  transformacion: sinComentarios(leer(`${CTA}/transformacion.ts`)),
  piezas: sinComentarios(leer(`${CTA}/piezasDeLaMetamorfosis.ts`)),
  lienzo: sinComentarios(leer('_lib/escena/configuracionDelCanvas.ts')),
})
type Pedido = typeof entornoPedido
const limpiezaBien = (c: Codigo, f: Pedido): boolean => {
  const sinContorno = !c.existe && !/contorno|armarElContorno/.test(c.escena + c.volteo) && !/estadoDeLaMetamorfosis|METAMORFOSIS|ATRAS/.test(c.transformacion + c.escena) &&
    !/RUIDO_DE_LA_METAMORFOSIS/.test(c.piezas) && !/stencil/.test(c.lienzo)
  const sinBanderas = !(PRUEBAS_SUELTAS as readonly string[]).some((k) => k === 'meta' || k === 'volteo') && !('meta' in ENTORNO.pruebas) && !('volteo' in ENTORNO.pruebas) &&
    ['producto,meta=contorno', 'producto,volteo=juntos', 'producto,volteo=cascada'].every((p) => !('meta' in f(p).pruebas) && !('volteo' in f(p).pruebas)) && !/pruebas\.(meta|volteo)/.test(c.escena)
  const sinCascada = !/cascada|juntos|VOLTEOS|\bcada\b/.test(c.volteo) && c.volteo.includes('export const ARRANCA_EL_VOLTEO = FIN_DEL_VOLTEO - VOLTEO.voltea.dura') &&
    c.escena.includes('const meta = armarElVolteo(medidas.valores, renglones, medidas.letras, deLasFuentes, color, VALORES.map((v) => v.titulo))')
  return sinContorno && sinBanderas && sinCascada
}
const hoy = codigoDeHoy()
afirmar(limpiezaBien(hoy, entornoPedido), '1 · `contorno` (su archivo, su estado, su ruido y el stencil del lienzo), la cascada, `?meta=` y `?volteo=` ya no existen: el volteo a la vez es el producto')
controlPositivo('1 · el detector VE `contorno.ts` todavía en el disco', { ...hoy, existe: true }, (c: Codigo) => limpiezaBien(c, entornoPedido))
controlPositivo('  y la bandera `volteo=juntos` todavía pedible', ((p: string) => ({ ...entornoPedido(p), pruebas: { ...entornoPedido(p).pruebas, volteo: 'no' } })) as unknown as Pedido, (f: Pedido) => limpiezaBien(hoy, f))
controlPositivo('  y la cascada de vuelta', { ...hoy, volteo: hoy.volteo.replace('voltea: { dura: 0.2 }', 'voltea: { dura: 0.2, cada: 0.035 }') }, (c: Codigo) => limpiezaBien(c, entornoPedido))
controlPositivo('  y el stencil de vuelta en el lienzo', { ...hoy, lienzo: `${hoy.lienzo}\n  stencil: true,` }, (c: Codigo) => limpiezaBien(c, entornoPedido))

cerrar('s59-pulido-8')
