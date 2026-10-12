/**
 * PULIDO 18 — el invariante: npm run test:s69-pulido-18
 *
 * Cada cosa con su control positivo (el detector ve el estado de antes). Los recibos medidos, en `docs/rediseno/entregas/pulido-18/`;
 * el log, `docs/rediseno/SPRINT-PULIDO-18.md`.
 *   P1.0 · el plasma A es el producto (sin bandera); `?energia=polvo`, el polvo de antes en su lugar; `?energia=plasma-y-polvo`, los
 *          dos; C se borró con su código y no vuelve; B se queda en su bandera (`?plasma=b`).
 *   P1.b · independientes del logo: viven en el MUNDO (la cáscara, quieta alrededor del lugar de reposo del logo); el logo es un
 *          obstáculo donde esté (su hueco), la fuente de sus ondas y de sus arcos.
 */
import { readFileSync } from 'node:fs'

import { BASE_LIMPIA, ENTORNO, PRUEBAS_SUELTAS, entornoPedido, pedidoDeLaUrl } from '../escena/entorno'
import { DE_AFUERA, deAfuera } from '../escena/energia/afuera'
import { BRASAS, azarConSemilla, crearBrasas, crearEntradaDeLasBrasas } from '../escena/energia/brasas'
import { ASPECTO } from '../escena/energia/dibujo/particulas'
import { DIRECCIONES, DIRECCION_RECOMENDADA, direccionDe } from '../escena/energia/direcciones'
import { AJUSTES_DEL_ENJAMBRE, SIMULACION_DEL_ENJAMBRE_GLSL } from '../escena/energia/enjambre/simulacion'
import { pasoDeLasBrasas } from '../escena/energia/paso'
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

// ═══════════════════════════════════════════════════════════════════════════
titulo('P1.b · Independientes del logo: viven en el MUNDO; el logo es un obstáculo, una fuente y el origen de sus arcos')

// Una corrida: 600 brasas en calma 3 s con el logo en su lugar; el logo baja 3 u en 1 s (como en el encastre) y se queda 4 s abajo.
// La nube no lo sigue (su centro casi no se mueve) y el logo, donde queda, la aparta (su hueco, vacío).
interface DeLaBajada { readonly antes: readonly number[]; readonly despues: readonly number[]; readonly enElHueco: number; readonly roto: boolean }
const bajar = (sigueAlLogo: boolean): DeLaBajada => {
  const az = azarConSemilla(23)
  const b = crearBrasas(600, az)
  const en = crearEntradaDeLasBrasas()
  en.piso = -6
  const centroide = (): number[] => {
    const c = [0, 0, 0]
    for (let i = 0; i < b.n; i += 1) for (let k = 0; k < 3; k += 1) c[k] += b.lugar[i * 3 + k] / b.n
    return c
  }
  let antes: number[] = []
  let roto = false
  for (let k = 0; k < 480; k += 1) {
    if (k === 180) antes = centroide()
    const y = k < 180 ? 0 : -3 * Math.min(1, (k - 180) / 60)
    // El control: el plasma de antes vivía en las coordenadas del logo (todo lo que el logo baja, lo bajaba también).
    if (sigueAlLogo) for (let i = 0; i < b.n; i += 1) b.lugar[i * 3 + 1] += y - en.logo[1]
    en.logo[1] = y
    en.tiempo = k / 60
    pasoDeLasBrasas(b, 1 / 60, en, az)
    for (let i = 0; i < b.n * 3; i += 1) if (!Number.isFinite(b.lugar[i])) roto = true
  }
  let enElHueco = 0
  for (let i = 0; i < b.n; i += 1) if (Math.hypot(b.lugar[i * 3], b.lugar[i * 3 + 1] + 3, b.lugar[i * 3 + 2]) < BRASAS.volumen.hueco * 0.7) enElHueco += 1
  return { antes, despues: centroide(), enElHueco, roto }
}
const quietaBien = (r: DeLaBajada): boolean => !r.roto && Math.abs(r.despues[1] - r.antes[1]) < 0.6 && Math.hypot(r.despues[0] - r.antes[0], r.despues[2] - r.antes[2]) < 0.6 && r.enElHueco <= 3
const bajada = bajar(false)
afirmar(quietaBien(bajada), `  el logo baja 3 u y la nube se queda: su centro se mueve ${(bajada.despues[1] - bajada.antes[1]).toFixed(2)} u en y; donde queda el logo, ${String(bajada.enElHueco)} brasas adentro de su hueco (las aparta)`)
controlPositivo('  el detector VE el plasma de antes (en las coordenadas del logo: baja con él)', bajar(true), quietaBien)

// Las ondas del logo y su hueco salen de donde está (no del origen): con el logo arriba, la cresta calienta a la que está a su
// distancia del logo, no a la que está a esa distancia del origen; la de adentro del hueco sale.
const uno = (logoY: number, y: number): number[] => {
  const b = crearBrasas(1, azarConSemilla(1))
  const en = crearEntradaDeLasBrasas()
  en.logo[1] = logoY
  en.anillos[0] = 2
  en.anillos[1] = 1
  b.lugar[0] = 0
  b.lugar[1] = y
  b.lugar[2] = 0
  b.energia[0] = 0
  deAfuera(b, 0, en, 1 / 60, () => 0.5)
  return [DE_AFUERA[1], DE_AFUERA[3]]
}
const desdeElLogo = (f: (logoY: number, y: number) => number[]): boolean => {
  const [, calientaAlLado] = f(8, 10)
  const [, calientaLejos] = f(8, 2)
  const [empujaAdentro] = f(8, 9)
  return calientaAlLado > 0.01 && calientaLejos < calientaAlLado * 0.05 && empujaAdentro > 0.5
}
afirmar(desdeElLogo(uno), '  la cresta de la onda del logo calienta a 2 u del LOGO (no del origen) y su hueco empuja hacia afuera desde donde está')
controlPositivo('  el detector VE las ondas y el hueco medidos desde el origen (el de antes)', (_logoY: number, y: number) => uno(0, y), desdeElLogo)

// Los sombreadores y el cuadro, en el mundo: ninguno le suma el centro del logo a una posición; el piso es el del mundo.
const ENERGIA_SRC = ['dibujo/particulas.ts', 'dibujo/arcos.ts', 'dibujo/efectos.ts', 'enjambre/simulacion.ts', 'cuadro.ts', 'PlasmaYCargas.tsx', 'dibujo/armado.ts', 'banco.ts'].map((m) => leer(`_lib/escena/energia/${m}`)).join('\n')
const enElMundo = (src: string): boolean =>
  !/uCentro \+ (p|aPunto|aAntes|aDespues|aLugar)\b/.test(src) && !/centro\.[xyz]\)?\.project|- a\.centro\.[xyz]|\+ a\.centro\.[xyz]|\.sub\(centro\)/.test(src) &&
  src.includes('vec4 mv = viewMatrix * vec4( p, 1.0 );') && src.includes('f.piso = FLOOR_Y + 0.02') && src.includes('r.ox = camara.position.x') &&
  src.includes('float lejos = length( p - uCentro ) / uFuente.x;') && src.includes('vec3 q = ( uLogoInverso * vec4( p, 1.0 ) ).xyz;')
afirmar(enElMundo(ENERGIA_SRC), '  las partículas, los arcos, los efectos y el enjambre se dibujan donde están (sin sumarles el logo); la fuente y la cara del logo se miden desde el logo')
controlPositivo('  el detector VE el sombreador de antes (la partícula en las coordenadas del logo)', ENERGIA_SRC.replace('vec4 mv = viewMatrix * vec4( p, 1.0 );', 'vec4 mv = viewMatrix * vec4( uCentro + p, 1.0 );'), enElMundo)
controlPositivo('  y el piso relativo al logo', ENERGIA_SRC.replace('f.piso = FLOOR_Y + 0.02', 'f.piso = FLOOR_Y - a.centro.y + 0.02'), enElMundo)

cerrar('s69-pulido-18')
