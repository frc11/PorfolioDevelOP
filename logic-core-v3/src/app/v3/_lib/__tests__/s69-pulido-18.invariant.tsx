/**
 * PULIDO 18 — el invariante: npm run test:s69-pulido-18
 *
 * Cada cosa con su control positivo (el detector ve el estado de antes). Los recibos medidos, en `docs/rediseno/entregas/pulido-18/`;
 * el log, `docs/rediseno/SPRINT-PULIDO-18.md`.
 *   P1.0 · el plasma A es el producto (sin bandera); `?energia=polvo`, el polvo de antes en su lugar; `?energia=plasma-y-polvo`, los
 *          dos; C se borró con su código y no vuelve; B se queda en su bandera (`?plasma=b`).
 */
import { readFileSync } from 'node:fs'

import { BASE_LIMPIA, ENTORNO, PRUEBAS_SUELTAS, entornoPedido, pedidoDeLaUrl } from '../escena/entorno'
import { ASPECTO } from '../escena/energia/dibujo/particulas'
import { DIRECCIONES, DIRECCION_RECOMENDADA, direccionDe } from '../escena/energia/direcciones'
import { AJUSTES_DEL_ENJAMBRE, SIMULACION_DEL_ENJAMBRE_GLSL } from '../escena/energia/enjambre/simulacion'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')

// ═══════════════════════════════════════════════════════════════════════════
titulo('P1.0 · El plasma A es el producto; `?energia=polvo`, el polvo de antes; `plasma-y-polvo`, los dos')

type Traductor = typeof entornoPedido
const STAGE = leer('_lib/escena/ProbeStage.tsx')
/** Lo que el escenario monta con un pedido: las dos condiciones, tal como están escritas en el escenario. */
interface Montado { readonly polvo: boolean; readonly plasma: boolean; readonly direccion: string }
const LAS_CONDICIONES = ["const conPolvo = energia !== 'no'", "const conPlasma = energia !== 'polvo'", '{conPolvo && <DepthParticles store={store} />}', '{conPolvo && <BokehParticles />}', "{conPlasma && <PlasmaYCargas logoGroupRef={logoGroupRef} quieto={reducedMotion} compacto={calidad === 'compacta'} direccion={direccionDe(plasma)} />}"] as const
const montado = (f: Traductor, pedido: string): Montado => {
  const { energia, plasma } = f(pedido).pruebas
  return { polvo: energia !== 'no', plasma: energia !== 'polvo', direccion: direccionDe(plasma) }
}
const desdeLaUrl = (f: Traductor, url: string): Montado => montado(f, pedidoDeLaUrl(url) ?? 'producto')
const productoBien = (f: Traductor, stage: string): boolean => {
  const igual = (m: Montado, polvo: boolean, plasma: boolean, direccion: string): boolean => m.polvo === polvo && m.plasma === plasma && m.direccion === direccion
  return LAS_CONDICIONES.every((c) => stage.includes(c)) && !stage.includes('sinPolvo') &&
    igual(montado(f, 'producto'), false, true, 'a') && ENTORNO.pruebas.energia === 'no' && BASE_LIMPIA.pruebas.energia === 'no' &&
    igual(desdeLaUrl(f, '?energia=polvo'), true, false, 'a') && igual(desdeLaUrl(f, '?energia=plasma-y-polvo'), true, true, 'a') &&
    igual(desdeLaUrl(f, '?energia=plasma'), false, true, 'a') && igual(desdeLaUrl(f, '?plasma=b'), false, true, 'b') &&
    igual(desdeLaUrl(f, '?energia=plasma-y-polvo&plasma=b'), true, true, 'b') && igual(desdeLaUrl(f, '?plasma=c'), false, true, 'a') &&
    igual(desdeLaUrl(f, '?energia=cualquiera'), false, true, 'a') && PRUEBAS_SUELTAS.includes('energia') && PRUEBAS_SUELTAS.includes('plasma')
}
afirmar(productoBien(entornoPedido, STAGE), '  sin pedir nada, el plasma A (y nada del polvo); `?energia=polvo`, sólo el polvo de antes; `?energia=plasma-y-polvo`, los dos; `?energia=plasma` (la de antes), el producto; `?plasma=b`, B; `?plasma=c`, A (C no existe)')
controlPositivo('  el detector VE el escenario de PULIDO 17 (sin bandera, el polvo)', STAGE.replace("const conPolvo = energia !== 'no'", "const sinPolvo = energia === 'plasma'"), (s: string) => productoBien(entornoPedido, s))
controlPositivo('  y un traductor que todavía conoce `energia=plasma` (el plasma pedido, no el producto)', ((p: string) => {
  const e = entornoPedido(p)
  return p.includes('energia=plasma') && !p.includes('plasma-y-polvo') ? { ...e, pruebas: { ...e.pruebas, energia: 'polvo' as const } } : e
}) as Traductor, (f: Traductor) => productoBien(f, STAGE))

// C se borró con su código: ni la dirección, ni su estilo de partícula, ni la superficie del logo en la simulación del enjambre.
const SIMULACION = leer('_lib/escena/energia/enjambre/simulacion.ts')
const sinC = (direcciones: Readonly<Record<string, unknown>>, aspecto: Readonly<Record<string, unknown>>, ajustes: Readonly<Record<string, unknown>>, glsl: string): boolean =>
  !('c' in direcciones) && !('estela' in aspecto) && !('uSuperficie' in ajustes) && !/uSuperficie|nacerEnElLogo|nacerDonde|uniform mat4 uLogo;/.test(glsl) &&
  DIRECCION_RECOMENDADA === 'a' && 'b' in direcciones
afirmar(sinC(DIRECCIONES, ASPECTO, AJUSTES_DEL_ENJAMBRE, SIMULACION_DEL_ENJAMBRE_GLSL + SIMULACION), '  C no existe: ni la dirección, ni la estela como estilo, ni la superficie del logo ni el nacer en ella; queda B (su bandera) y A es la del producto')
controlPositivo('  el detector VE a C de vuelta (la dirección)', { ...DIRECCIONES, c: DIRECCIONES.b }, (d: Readonly<Record<string, unknown>>) => sinC(d, ASPECTO, AJUSTES_DEL_ENJAMBRE, SIMULACION_DEL_ENJAMBRE_GLSL))
controlPositivo('  y su superficie en la simulación', `${SIMULACION_DEL_ENJAMBRE_GLSL}\nuniform vec4 uSuperficie;`, (g: string) => sinC(DIRECCIONES, ASPECTO, AJUSTES_DEL_ENJAMBRE, g))
controlPositivo('  y su estilo', { ...ASPECTO, estela: ASPECTO.mota }, (a: Readonly<Record<string, unknown>>) => sinC(DIRECCIONES, a, AJUSTES_DEL_ENJAMBRE, SIMULACION_DEL_ENJAMBRE_GLSL))

cerrar('s69-pulido-18')
