/**
 * PULIDO 18 — el invariante: npm run test:s69-pulido-18
 *
 * Cada cosa con su control positivo (el detector ve el estado de antes). Los recibos medidos, en `docs/rediseno/entregas/pulido-18/`;
 * el log, `docs/rediseno/SPRINT-PULIDO-18.md`.
 *   P1.0 · el plasma A es el producto (sin bandera); `?energia=polvo`, el polvo de antes en su lugar; `?energia=plasma-y-polvo`, los
 *          dos; C se borró con su código y no vuelve; B se queda en su bandera (`?plasma=b`).
 *   P1.b · independientes del logo: viven en el MUNDO (la cáscara, quieta alrededor del lugar de reposo del logo); el logo es un
 *          obstáculo donde esté (su hueco), la fuente de sus ondas y de sus arcos.
 *   P1.a · el piso, un límite real (un mínimo, un colchón, el roce); las partículas y los arcos blandos (la profundidad del pase
 *          compartido); el reflejo tenue en el piso, de noche.
 *   P1.d · más partícula, menos nube: el núcleo con tope, el halo corto, la ley de potencia, las intensidades, la cruz chica; el halo de
 *          los arcos con puntos (sin esquirlas).
 *   P1.c · de día: el cuerpo oscuro, el velo, el especular mínimo; el calor de las calientes refracta la copia del cuadro.
 *   P1.e · la física nueva: la convección, el pinch, la estela del puntero, el viento del scroll; estable y contenida.
 *   P2 · la dimensión espejo (`?espejo=`): las banderas, los disparos (raro y lento; mantener después del gesto del plasma), sólo el
 *        fondo (nunca el logo, los títulos ni los textos), se cura, el pliegue es la identidad en cero, los ecos no tocan el logo.
 */
import { readFileSync } from 'node:fs'
import * as THREE from 'three'

import { BASE_LIMPIA, ENTORNO, PRUEBAS_SUELTAS, entornoPedido, pedidoDeLaUrl } from '../escena/entorno'
import { DE_AFUERA, deAfuera } from '../escena/energia/afuera'
import { BRASAS, azarConSemilla, crearBrasas, crearEntradaDeLasBrasas } from '../escena/energia/brasas'
import { TRAZO } from '../escena/energia/dibujo/arcos'
import { ORDEN_DE_LA_ENERGIA } from '../escena/energia/dibujo/armado'
import { ASPECTO } from '../escena/energia/dibujo/particulas'
import { DIRECCIONES, DIRECCION_RECOMENDADA, direccionDe } from '../escena/energia/direcciones'
import { largo3 } from '../escena/energia/largo'
import { AJUSTES_DEL_ENJAMBRE, SIMULACION_DEL_ENJAMBRE_GLSL } from '../escena/energia/enjambre/simulacion'
import { DEL_MOVIMIENTO, delMovimiento } from '../escena/energia/movimiento'
import { pasoDeLasBrasas } from '../escena/energia/paso'
import { ECOS } from '../escena/espejo/ecos'
import { EFECTOS_DEL_ESPEJO, ESPEJO, amplitudDelCiclo } from '../escena/espejo/espejo'
import { PLIEGUE } from '../escena/espejo/pliegue'
import { PASE, entraALaPasada } from '../escena/pase/pase'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { correrDisparador, doblar, lineasDeCodigo, pisoDeLasBrasas, sinReservasEn, todoJunto } from './s69-ayudas'

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

// ═══════════════════════════════════════════════════════════════════════════
titulo('P1.a · El piso, un límite real; las partículas blandas (la profundidad del pase compartido); el reflejo tenue')

const piso = pisoDeLasBrasas()
const pisoBien = (p: typeof piso): boolean => !p.roto && p.bajoElMinimo === 0 && p.nacenAbajo === 0 && p.enLaBanda < 0.08
afirmar(pisoBien(piso), `  8 s con el campo y un pulso desde arriba: ninguna más abajo de ${String(BRASAS.piso.minimo)} u sobre el piso; en la banda de abajo, el ${(100 * piso.enLaBanda).toFixed(1)} % (casi no se acercan); nacen arriba`)
controlPositivo('  el detector VE una brasa debajo del mínimo (el brillo que atravesaba el piso)', { ...piso, bajoElMinimo: 1 }, pisoBien)
controlPositivo('  y una alfombra de brasas apoyadas', { ...piso, enLaBanda: 0.3 }, pisoBien)

const opaca = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial())
const transparente = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ transparent: true }))
const sinProfundidad = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ depthWrite: false }))
const pasadaBien = (entra: (o: THREE.Object3D) => boolean): boolean =>
  entra(opaca) && entra(new THREE.DirectionalLight()) && !entra(transparente) && !entra(sinProfundidad) && !entra(new THREE.Points()) && !entra(new THREE.Group())
afirmar(pasadaBien(entraALaPasada), '  la pasada de profundidad: lo opaco que escribe profundidad y las luces (los mismos programas); nada transparente, ni puntos, ni lo que no tapa')
controlPositivo('  el detector VE una pasada que mete lo transparente (la trama, el humo)', (o: THREE.Object3D) => o instanceof THREE.Mesh || o instanceof THREE.Light, pasadaBien)

const PASE_SRC = leer('_lib/escena/pase/pase.ts') + leer('_lib/escena/pase/PaseDeLaEscena.tsx')
const PARTICULA = leer('_lib/escena/energia/dibujo/particulas.ts')
const ARCO = leer('_lib/escena/energia/dibujo/arcos.ts')
const REFLEJO_SRC = leer('_lib/escena/energia/dibujo/reflejos.ts')
const PLASMA = leer('_lib/escena/energia/PlasmaYCargas.tsx')
const blandasBien = (pase: string, particula: string, arco: string, reflejo: string, plasma: string, stage: string): boolean =>
  pase.includes('isXRRenderTarget: true') && pase.includes('camara.layers.set(PASE.capa)') && pase.includes('gl.render(escena, camara)') &&
  particula.includes('float blanda = clamp( ( distanciaALoOpaco( gl_FragCoord.xy / uResolucion ) - vDistancia ) / vSuave, 0.0, 1.0 );') && /\* blanda \* blanda \* \( 3\.0 - 2\.0 \* blanda \)/.test(particula) &&
  (arco.match(/distanciaALoOpaco\( gl_FragCoord\.xy \/ uResolucion \) - vDistancia/g) ?? []).length === 2 &&
  plasma.includes('PEDIDOS_DEL_PASE.profundidad += 1') && stage.trimEnd().endsWith('</Canvas>\n  )\n}') && /<PaseDeLaEscena \/>\n\s*<\/Suspense>/.test(stage) &&
  reflejo.includes('if ( alto > uReflejo.x || uNoche < 0.02 || c.w <= 0.05 )') && reflejo.includes('float esPiso = 1.0 - smoothstep(') && /materialDelReflejo\.depthTest = false/.test(leer('_lib/escena/energia/dibujo/armado.ts'))
afirmar(blandasBien(PASE_SRC, PARTICULA, ARCO, REFLEJO_SRC, PLASMA, STAGE), '  las partículas y los arcos se desvanecen contra lo opaco (la profundidad de la pasada, con la cámara del cuadro, el último cuadro antes de dibujar); el reflejo, de noche, sólo de las cercanas al piso y sólo donde se ve el piso')
controlPositivo('  el detector VE la partícula dura (sin la profundidad)', PARTICULA.replace('* blanda * blanda * ( 3.0 - 2.0 * blanda )', ''), (p: string) => blandasBien(PASE_SRC, p, ARCO, REFLEJO_SRC, PLASMA, STAGE))
controlPositivo('  y el pase que no va último', STAGE.replace('<PaseDeLaEscena />\n', '').replace('<OrbitRig', '<PaseDeLaEscena />\n<OrbitRig'), (s: string) => blandasBien(PASE_SRC, PARTICULA, ARCO, REFLEJO_SRC, PLASMA, s))

// ═══════════════════════════════════════════════════════════════════════════
titulo('P1.d · Más partícula, menos nube: núcleos chicos y nítidos, halo corto, ley de potencia, intensidades variadas, la cruz chica')

// La ley de potencia, la misma cuenta que el sombreador (una Pareto truncada): muchas chicas, pocas grandes.
type Tamanos = (u: number) => number
const A_ASPECTO = { ...ASPECTO.chispa, ...(DIRECCIONES.a.aspecto?.brasas ?? {}) }
const [T0, T1] = [A_ASPECTO.uTamano[0], A_ASPECTO.uTamano[1]]
const pareto: Tamanos = (u) => T0 * (1 - u * (1 - (T0 / T1) ** A_ASPECTO.uChispa[0])) ** (-1 / A_ASPECTO.uChispa[0])
const reparto = (t: Tamanos): { mediana: number; grandes: number; maximo: number } => {
  const m = Array.from({ length: 999 }, (_, k) => t((k + 0.5) / 999)).sort((a, b) => a - b)
  return { mediana: m[499] / T0, grandes: m.filter((x) => x > 3 * T0).length / m.length, maximo: m[998] }
}
const leyBien = (t: Tamanos, glsl: string): boolean => {
  const r = reparto(t)
  return r.mediana < 1.6 && r.grandes < 0.15 && r.maximo <= T1 * 1.0001 && glsl.includes('return uTamano.x * pow( 1.0 - azar01( id, 20u ) * ( 1.0 - pow( uTamano.x / uTamano.y, alfa ) ), - 1.0 / alfa );')
}
const rep = reparto(pareto)
afirmar(leyBien(pareto, PARTICULA), `  los tamaños, por una ley de potencia (la misma cuenta que el sombreador): la mediana, ${rep.mediana.toFixed(2)} veces la más chica; más de 3 veces, el ${(100 * rep.grandes).toFixed(1)} %`)
controlPositivo('  el detector VE el reparto de PULIDO 17 (un tercio grandes)', ((u: number) => T0 + (T1 - T0) * u ** 2.6) as Tamanos, (t: Tamanos) => leyBien(t, PARTICULA))
type Aspecto = typeof A_ASPECTO
const nitidaBien = (a: Aspecto, particula: string, arco: string, armado: string): boolean =>
  a.uNucleo[0] <= 2 && a.uLuz[3] <= 2.5 && a.uLuz[2] <= 0.2 && a.uMovida[2] <= 0.1 && a.uMovida[3] <= 2 && a.uTamano[3] <= 4 && a.uChispa[1] <= 0.5 &&
  a.uChispa[2] > 0 && a.uChispa[3] <= 10 && particula.includes('float rNucleo = min( vRadioPx, uNucleo.x * uPixel );') && particula.includes('smoothstep( 0.72, 0.95, e )') &&
  particula.includes('brilloPropio( id )') && armado.includes('new THREE.Points(gh,') && arco.includes('gl_PointSize = 2.0 * radio *') && !/for \(const capa of \[0, 1\]\)/.test(armado)
const ARMADO = leer('_lib/escena/energia/dibujo/armado.ts')
afirmar(nitidaBien(A_ASPECTO, PARTICULA, ARCO, ARMADO), `  el núcleo con tope (${String(A_ASPECTO.uNucleo[0])} px), el halo corto (${String(A_ASPECTO.uLuz[3])} radios, ${String(A_ASPECTO.uLuz[2])}), casi sin desenfoque (${String(A_ASPECTO.uMovida[2])} px por u, hasta ${String(A_ASPECTO.uMovida[3])}), intensidades desde ${String(A_ASPECTO.uChispa[1])}, la cruz de ${String(A_ASPECTO.uChispa[3])} px sólo en las calientes; el halo de los arcos con puntos (sin esquirlas)`)
controlPositivo('  el detector VE el aspecto de PULIDO 17 (el bokeh)', { ...A_ASPECTO, uLuz: [1, 0.2, 0.3, 3] as const, uMovida: [0, 1.6, 0.3, 6] as const }, (a: Aspecto) => nitidaBien(a, PARTICULA, ARCO, ARMADO))
controlPositivo('  y los arcos en dos cintas (las esquirlas)', ARMADO.replace('new THREE.Points(gh,', 'new THREE.Mesh(gh,'), (m: string) => nitidaBien(A_ASPECTO, PARTICULA, ARCO, m))

// ═══════════════════════════════════════════════════════════════════════════
titulo('P1.c · De día: un cuerpo oscuro y nítido, un velo, un especular mínimo y, en las calientes, el calor que refracta lo de atrás')

const diaBien = (particula: string, plasma: string, armado: string): boolean =>
  particula.includes('float cuerpo = exp( - 0.5 * d2 / ( rNucleo * rNucleo ) ) * cola;') && particula.includes('vec2 alBrillo = vLocal - vec2( - 0.5, 0.5 ) * sigma;') &&
  !particula.includes('float punto =') && particula.includes('colorDeAtras( ( gl_FragCoord.xy + corrido ) / uResolucion )') && particula.includes('corridoAtras * corridoAtras') &&
  plasma.includes('if (u.uNoche.value < 0.97) PEDIDOS_DEL_PASE.colorEsteCuadro = true') && armado.includes('m.renderOrder = ORDEN_DE_LA_ENERGIA + k') &&
  ORDEN_DE_LA_ENERGIA > PASE.orden && ORDEN_DE_LA_ENERGIA + 6 < 1 && A_ASPECTO.uCalorDia[0] > 0 && A_ASPECTO.uDia[1] > 0
afirmar(diaBien(PARTICULA, PLASMA, ARMADO), '  de día: el cuerpo oscuro nítido (el núcleo), el especular corrido hacia la luz (sin el punto blanco al centro: los ojos), el calor de las calientes refracta la copia del cuadro y oscurece los medios (el papel queda blanco); la energía se dibuja después de la copia y antes del haz')
controlPositivo('  el detector VE el punto blanco al centro (los ojos)', PARTICULA.replace('float cuerpo =', 'float punto = 1.0;\n\tfloat cuerpo ='), (p: string) => diaBien(p, PLASMA, ARMADO))
controlPositivo('  y el contraste que aclara el papel (los aros)', PARTICULA.replace('corridoAtras * corridoAtras', 'clamp( ( corridoAtras - 0.5 ) * 1.6 + 0.5, 0.0, 1.0 )'), (p: string) => diaBien(p, PLASMA, ARMADO))
// Lo que mostró el mini-banco: de noche, puntitos tenues (el plasma sin presencia); de día, un alfa chico que no se ve sobre el papel
// (colgaba del reposo de la noche), y el arco de día, una banda de humo con el núcleo blanco (invisible sobre el papel).
const VIVO = 'float vivo = mix( uDia.z + ( 1.0 - uDia.z ) * e, uLuz.y + ( 1.0 - uLuz.y ) * e, uNoche );'
const presenciaBien = (a: Aspecto, particula: string, trazoDia: readonly number[]): boolean =>
  a.uLuz[0] >= 2 && a.uLuz[1] >= 0.25 && a.uDia[0] >= 2 && a.uDia[2] >= 0.4 && particula.includes(VIVO) &&
  particula.includes('min( 0.25, humo * uDiaForma.z * vBrillo * 2.0 )') && trazoDia[0] <= 0.12 && trazoDia[2] >= 0.8 && trazoDia[3] === 1
afirmar(presenciaBien(A_ASPECTO, PARTICULA, TRAZO.uArcoDia), `  la presencia: de noche el núcleo en ${String(A_ASPECTO.uLuz[0])} y el reposo en ${String(A_ASPECTO.uLuz[1])}; de día su propio reposo (${String(A_ASPECTO.uDia[2])}), el cuerpo en ${String(A_ASPECTO.uDia[0])}, el velo con tope (no un lunar) y el arco de tinta`)
controlPositivo('  el detector VE los puntitos tenues de la noche (el núcleo en 1,3, el reposo en 0,18)', { ...A_ASPECTO, uLuz: [1.3, 0.18, 0.14, 2] as const }, (a: Aspecto) => presenciaBien(a, PARTICULA, TRAZO.uArcoDia))
controlPositivo('  y el día colgado del reposo de la noche', PARTICULA.replace(VIVO, 'float vivo = uLuz.y + ( 1.0 - uLuz.y ) * e;'), (p: string) => presenciaBien(A_ASPECTO, p, TRAZO.uArcoDia))
controlPositivo('  y el arco de día con el núcleo blanco (la banda de humo)', [0.22, 0.1, 1, 0] as const, (t: readonly number[]) => presenciaBien(A_ASPECTO, PARTICULA, t))

// ═══════════════════════════════════════════════════════════════════════════
titulo('P1.e · La física nueva: convección, el pinch de los arcos, la estela del puntero, el viento del scroll; estable y contenida')

const fuerzaDe = (preparar: (b: ReturnType<typeof crearBrasas>, en: ReturnType<typeof crearEntradaDeLasBrasas>) => void): Float32Array => {
  const b = crearBrasas(1, azarConSemilla(4))
  const en = crearEntradaDeLasBrasas()
  b.lugar.set([0, 1, 0])
  b.velocidad.fill(0)
  preparar(b, en)
  delMovimiento(b, 0, en, 1 / 60)
  return DEL_MOVIMIENTO.slice()
}
const caliente = fuerzaDe((b) => { b.energia[0] = 0.95 })
const fria = fuerzaDe((b) => { b.energia[0] = BRASAS.energia.base })
const pinch = fuerzaDe((b, en) => { b.energia[0] = BRASAS.energia.base; en.arcos.set([-2, 1.5, 0, 2, 1.5, 0, 1]); en.cuantosArcos = 1 })
const estela = fuerzaDe((b, en) => { b.energia[0] = BRASAS.energia.base; en.rayo = { ox: 0, oy: 1, oz: 20, dx: 0, dy: 0, dz: -1 }; en.estela.set([2, 0, 0]) })
const quieto = fuerzaDe((b, en) => { b.energia[0] = BRASAS.energia.base; en.rayo = { ox: 0, oy: 1, oz: 20, dx: 0, dy: 0, dz: -1 } })
interface Nueva { readonly caliente: Float32Array; readonly fria: Float32Array; readonly pinch: Float32Array; readonly estela: Float32Array; readonly quieto: Float32Array }
const nuevaBien = (n: Nueva): boolean =>
  n.caliente[1] > 0.3 && n.fria[1] < 0 && n.fria[1] > -0.1 && n.pinch[1] > 0.5 && n.pinch[3] > 0 && n.estela[0] > 0.5 && Math.abs(n.quieto[0]) < 1e-6
afirmar(nuevaBien({ caliente, fria, pinch, estela, quieto }), `  la caliente sube (${caliente[1].toFixed(2)} u/s²) y la fría baja lento (${fria[1].toFixed(2)}); un arco que golpea a 0,5 u la tira hacia su canal (${pinch[1].toFixed(2)}) y la calienta; el puntero que se mueve la arrastra (${estela[0].toFixed(2)}); quieto, no`)
controlPositivo('  el detector VE una convección al revés', { caliente: fria, fria: caliente, pinch, estela, quieto }, nuevaBien)
controlPositivo('  y un puntero quieto que igual arrastra (frena todo lo que toca)', { caliente, fria, pinch, estela, quieto: estela }, nuevaBien)
const CUADRO_SRC = leer('_lib/escena/energia/cuadro.ts')
const PASO_SRC = leer('_lib/escena/energia/paso.ts')
const vientoBien = (cuadroSrc: string, paso: string): boolean =>
  cuadroSrc.includes('const fuerza = Math.min(W.tope, W.escala * Math.abs(a.lectura.velocidad) * (1 + W.caliente * a.temperatura.valor))') &&
  cuadroSrc.includes('-(cam.getComponent(e) - k.getComponent(e)) / corre') && paso.includes('(b.flujo[i * 3] + en.viento[0] - v[i * 3]) * BRASAS.flujo.sigue')
afirmar(vientoBien(CUADRO_SRC, PASO_SRC), '  el viento del scroll: en contra de la cámara que pasa, tan fuerte como el scroll y más caliente, con tope; lo lleva el campo')
controlPositivo('  el detector VE el campo sin el viento', PASO_SRC.replace('(b.flujo[i * 3] + en.viento[0] - v[i * 3])', '(b.flujo[i * 3] - v[i * 3])'), (p: string) => vientoBien(CUADRO_SRC, p))

const todo = todoJunto()
const establesBien = (t: typeof todo): boolean => !t.roto && t.afuera === 0 && t.bajoElPiso === 0 && t.rapidezMaxima <= BRASAS.fuerzas.tope + 1e-3
afirmar(establesBien(todo), `  20 s con todo a la vez (calientes, arcos que golpean, el puntero que se mueve, el viento al tope): ningún NaN, ninguna fuera de la cáscara ni bajo el piso, la rapidez con su tope (${todo.rapidezMaxima.toFixed(2)} u/s)`)
controlPositivo('  el detector VE una que se escapa', { ...todo, afuera: 1 }, establesBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('P1 · Los módulos nuevos, de menos de 300 líneas; lo de cada cuadro, sin reservas')

const NUEVOS = ['energia/afuera.ts', 'energia/paso.ts', 'energia/movimiento.ts', 'energia/dibujo/reflejos.ts', 'energia/dibujo/particulas.ts', 'energia/dibujo/arcos.ts', 'energia/dibujo/armado.ts', 'energia/cuadro.ts', 'pase/pase.ts', 'pase/PaseDeLaEscena.tsx'] as const
const fuentes = Object.fromEntries(NUEVOS.map((m) => [m, leer(`_lib/escena/${m}`)])) as Record<string, string>
const modulosBien = (f: Record<string, string>): boolean => NUEVOS.every((m) => lineasDeCodigo(f[m] ?? 'x\n'.repeat(999)) <= 300)
afirmar(modulosBien(fuentes), `  ${NUEVOS.map((m) => `${m.split('/').pop() ?? m} ${String(lineasDeCodigo(fuentes[m]))}`).join(' · ')}`)
controlPositivo('  el detector VE un módulo de 301 líneas', { ...fuentes, 'energia/movimiento.ts': 'x\n'.repeat(301) }, modulosBien)
const POR_CUADRO_P1: readonly (readonly [string, string])[] = [['energia/movimiento.ts', 'delMovimiento'], ['energia/cuadro.ts', 'vientoEstelaYCanales'], ['energia/afuera.ts', 'deAfuera'], ['pase/PaseDeLaEscena.tsx', 'profundidad'], ['pase/PaseDeLaEscena.tsx', 'copiarElColor'], ['pase/pase.ts', 'marcarLasCapas']]
const reservasBien = (f: Record<string, string>): boolean => POR_CUADRO_P1.every(([m, fn]) => sinReservasEn(f[m] ?? '', fn))
afirmar(reservasBien(fuentes), `  ${String(POR_CUADRO_P1.length)} funciones de cada cuadro sin crear objetos, arreglos ni funciones`, POR_CUADRO_P1.filter(([m, fn]) => !sinReservasEn(fuentes[m] ?? '', fn)).map(([m, fn]) => `${m}:${fn}`).join(' · '))
controlPositivo('  el detector VE una reserva en el movimiento', { ...fuentes, 'energia/movimiento.ts': (fuentes['energia/movimiento.ts'] ?? '').replace('  let fx = 0\n', '  const tmp = new Float32Array(3)\n  let fx = tmp[0]\n') }, reservasBien)
// La reserva escondida: `Math.hypot` asigna en V8 (un arreglo por llamada; TurboFan no la reduce). En el bucle de las vecinas era casi
// toda la basura del plasma (unos 400 KB por cuadro, recolecciones de hasta 300 ms en el mini-banco); ahora `largo3` (energia/largo.ts).
const CALIENTES = ['brasas.ts', 'vecinas.ts', 'paso.ts', 'afuera.ts', 'movimiento.ts', 'cuadro.ts', 'arcos/arcos.ts', 'arcos/camino.ts', 'arcos/programador.ts', 'dibujo/armado.ts'] as const
const delPlasma = Object.fromEntries(CALIENTES.map((m) => [m, leer(`_lib/escena/energia/${m}`)])) as Record<string, string>
const codigoSolo = (t: string): string => t.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n')
const sinHypotBien = (f: Record<string, string>): boolean => CALIENTES.every((m) => !codigoSolo(f[m] ?? 'Math.hypot(').includes('Math.hypot(')) &&
  sinReservasEn(f['brasas.ts'] ?? '', 'entreEllas') && sinReservasEn(f['vecinas.ts'] ?? '', 'vecinasDe') && Math.abs(largo3(3, 4, 12) - 13) < 1e-12
afirmar(sinHypotBien(delPlasma), `  sin Math.hypot en lo de cada cuadro del plasma (${String(CALIENTES.length)} módulos; la basura por cuadro bajó de ~400 KB a ~16 KB en el mini-banco)`)
controlPositivo('  el detector VE el Math.hypot de vuelta en el bucle de las vecinas', { ...delPlasma, 'brasas.ts': (delPlasma['brasas.ts'] ?? '').replace('const d = Math.sqrt(d2)', 'const d = Math.hypot(dx, dy, dz)') }, sinHypotBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('P2 · La dimensión espejo: `?espejo=`, sus disparos y el prisma; en el fondo, nunca sobre el logo ni los textos; se cura')

const banderasDelEspejo = (f: Traductor, stage: string, moire: string, componente: string): boolean =>
  EFECTOS_DEL_ESPEJO.every((e) => f(`producto,espejo=${e}`).pruebas.espejo === e) && f('producto').pruebas.espejo === 'no' && f('producto,espejo=otro').pruebas.espejo === 'no' &&
  (['ambiente', 'scroll', 'mantener'] as const).every((d) => f(`producto,espejo-disparo=${d}`).pruebas['espejo-disparo'] === d) && f('producto,espejo-prisma=si').pruebas['espejo-prisma'] === 'si' &&
  ENTORNO.pruebas.espejo === 'no' && ENTORNO.pruebas['espejo-prisma'] === 'no' && PRUEBAS_SUELTAS.includes('espejo') &&
  stage.includes('<EspejoDeLaEscena logoGroupRef={logoGroupRef} quieto={reducedMotion} />') && componente.includes("if (espejo === 'no' || quieto) return null") &&
  /if \(entornoDeLaEscena\(\)\.pruebas\.espejo === 'pliegue'\) \{\n\s*conPliegue\(capas\.coarse\.material\)\n\s*conPliegue\(capas\.fine\.material\)/.test(moire)
const MOIRE = leer('_lib/escena/MoireScreen.tsx')
const COMPONENTE = leer('_lib/escena/espejo/EspejoDeLaEscena.tsx')
afirmar(banderasDelEspejo(entornoPedido, STAGE, MOIRE, COMPONENTE), `  \`?espejo=${EFECTOS_DEL_ESPEJO.join('|')}\`, \`?espejo-disparo=ambiente|scroll|mantener\`, \`?espejo-prisma=si\`; en el producto, apagado; con movimiento reducido, nada; el pliegue sólo parchea la trama con su bandera`)
controlPositivo('  el detector VE el pliegue puesto siempre en la trama', MOIRE.replace("if (entornoDeLaEscena().pruebas.espejo === 'pliegue') {", 'if (true) {'), (m: string) => banderasDelEspejo(entornoPedido, STAGE, m, COMPONENTE))
controlPositivo('  y el espejo con movimiento reducido', COMPONENTE.replace("if (espejo === 'no' || quieto) return null", "if (espejo === 'no') return null"), (c: string) => banderasDelEspejo(entornoPedido, STAGE, MOIRE, c))

// El ambiente: raro y lento; cada ciclo llega entero y se cura (vuelve a cero); la zona, lejos del logo y fuera de los textos.
interface Corrida2 { readonly amplitudes: readonly number[]; readonly zonas: readonly (readonly [number, number])[] }
const ciclos = (r: Corrida2): number => r.amplitudes.reduce((n, a, k) => n + (a > 0.99 && (r.amplitudes[k - 1] ?? 0) <= 0.99 ? 1 : 0), 0)
const ambiente = correrDisparador('cristal', 'ambiente', 120, () => undefined)
const ambienteBien = (r: Corrida2): boolean => {
  const n = ciclos(r)
  const curado = r.amplitudes[r.amplitudes.length - 1] < 0.001 || r.amplitudes.slice(-60).some((a) => a < 0.001)
  const lejos = r.zonas.every(([x, y]) => Math.hypot(x - 0, (y + 0.1) * 0.6) > 0.25 * (ESPEJO.zona.lejosDelLogo + 1) - 1e-6 && !(x > -0.95 && x < -0.2 && y > -0.95 && y < -0.55))
  return n >= 3 && n <= 5 && curado && lejos && r.amplitudes.filter((a) => a > 0.002).length / r.amplitudes.length < 0.35
}
afirmar(ambienteBien(ambiente), `  el ambiente: ${String(ciclos(ambiente))} ciclos en 2 minutos (raro y lento: cada uno llega entero y se cura), activo el ${(100 * ambiente.amplitudes.filter((a) => a > 0.002).length / ambiente.amplitudes.length).toFixed(0)} % del tiempo; las zonas, lejos del logo y fuera del texto`)
controlPositivo('  el detector VE un efecto que no se cura (queda roto)', { ...ambiente, amplitudes: ambiente.amplitudes.map((a, k) => (k > 600 ? Math.max(a, 1) : a)) }, ambienteBien)
controlPositivo('  y una zona encima del logo', { ...ambiente, zonas: [...ambiente.zonas, [0, -0.1] as const] }, ambienteBien)
// Mantener: después de la espera (el clic y la carga del plasma van primero) crece donde está el puntero; al soltar se cura; sobre un texto, nada.
const mantener = correrDisparador('caleidoscopio', 'mantener', 6, (en, t) => {
  en.apretado = t >= 1 && t < 4
  en.apretadoDesde = 1
  en.x = 0.5
  en.y = 0.4
})
const sobreTexto = correrDisparador('caleidoscopio', 'mantener', 6, (en, t) => {
  en.apretado = t >= 1 && t < 4
  en.apretadoDesde = 1
  en.sobreTexto = true
})
const mantenerBien = (r: Corrida2, texto: Corrida2): boolean => {
  const a = (t: number): number => r.amplitudes[Math.round(t * 60)] ?? 0
  return a(1 + ESPEJO.mantener.espera - 0.05) === 0 && a(1 + ESPEJO.mantener.espera + ESPEJO.mantener.crece + 0.1) > 0.99 && a(4 + ESPEJO.mantener.cura + 0.1) === 0 &&
    r.zonas.every(([x, y]) => x === 0.5 && y === 0.4) && texto.amplitudes.every((x) => x === 0)
}
afirmar(mantenerBien(mantener, sobreTexto), `  mantener: nada en los primeros ${String(ESPEJO.mantener.espera)} s (el clic y la carga del plasma), crece en ${String(ESPEJO.mantener.crece)} s donde está el puntero, al soltar se cura en ${String(ESPEJO.mantener.cura)} s; sobre un texto, nada`)
controlPositivo('  el detector VE un espejo que empieza con el clic (pisaría el pulso del plasma)', correrDisparador('caleidoscopio', 'ambiente', 6, () => undefined), (r: Corrida2) => mantenerBien(r, sobreTexto))

// Los efectos de pantalla: el pixel y lo que leen tienen que ser fondo (más lejos que el logo); sin amplitud, nada; monocromo sin el prisma.
const PANTALLA_SRC = leer('_lib/escena/espejo/pantalla.ts')
const pantallaBien = (src: string): boolean =>
  src.includes('return colorDeAtras( mix( aqui, desde, esFondo( desde ) ) );') && src.includes('float mascara = zona * esFondo( aqui ) * ( 1.0 - uTextoFuerza * adentroDelTexto( aqui * 2.0 - 1.0 ) );') &&
  src.includes('float radio = uZona.w > 0.002 ? uZona.z * uPixel : 0.0;') && src.includes('vec3 color = leerFondo( aqui, desde );\n\tif ( uPrisma >= 0.5 ) {') && src.includes('if ( mascara * amp < 0.002 || uHayColor < 0.5 ) discard;')
afirmar(pantallaBien(PANTALLA_SRC), '  el cristal, el caleidoscopio y la espiral sólo pintan fondo y sólo leen fondo (la profundidad del pase: nunca un píxel del logo ni de un título), nunca sobre un texto, nada sin amplitud; el prisma, sólo con la bandera')
controlPositivo('  el detector VE una refracción que lee cualquier píxel (el logo corrido)', PANTALLA_SRC.replace('return colorDeAtras( mix( aqui, desde, esFondo( desde ) ) );', 'return colorDeAtras( desde );'), pantallaBien)
controlPositivo('  y el prisma prendido sin la bandera', PANTALLA_SRC.replace('if ( uPrisma >= 0.5 ) {', 'if ( uPrisma >= 0.0 ) {'), pantallaBien)
const cicloBien = (amp: (t: number, c: readonly number[]) => number): boolean => EFECTOS_DEL_ESPEJO.every((e) => {
  const c = ESPEJO.ciclo[e]
  return amp(0, c) === 0 && Math.abs(amp(c[0] + c[1] / 2, c) - 1) < 1e-9 && amp(c[0] + c[1] + c[2], c) === 0 && amp(c[0] + c[1] + c[2] * 0.5, c) > 0.2
})
afirmar(cicloBien(amplitudDelCiclo), '  cada efecto crece, se sostiene y se cura: es una ilusión, nada queda roto')
controlPositivo('  el detector VE un ciclo que no vuelve a cero', ((t: number, c: readonly number[]) => (t > c[0] ? 1 : amplitudDelCiclo(t, c))) as typeof amplitudDelCiclo, cicloBien)
// El pliegue: con amplitud cero la cuenta es la identidad; entero, lo de arriba se enrolla hacia adentro y lo de abajo de la línea no se mueve.
type Doblez = typeof doblar
const pliegueBien = (d: Doblez): boolean => {
  const quieto = d(0, 18, -40, 0, PLIEGUE.desde, PLIEGUE.radio, 1)
  const arriba = d(0, 18, -40, 1, PLIEGUE.desde, PLIEGUE.radio, 1)
  const abajo = d(0, PLIEGUE.desde - 1, -40, 1, PLIEGUE.desde, PLIEGUE.radio, 1)
  return quieto[1] === 18 && quieto[2] === -40 && arriba[2] > -36 && arriba[1] < 18 && abajo[1] === PLIEGUE.desde - 1 && abajo[2] === -40 && leer('_lib/escena/espejo/pliegue.ts').includes('transformed.xz = dir * ( r - ( 1.0 - cos( th ) ) / curva );')
}
afirmar(pliegueBien(doblar), `  el pliegue (la misma cuenta que el sombreador): en cero, la trama como está; entero, desde ${String(PLIEGUE.desde)} u se enrolla hacia adentro (radio ${String(PLIEGUE.radio)}); lo de abajo, quieto`)
controlPositivo('  el detector VE un pliegue que no vuelve (no depende de la amplitud)', ((x: number, y: number, z: number, _a: number, desde: number, radio: number, t: number) => doblar(x, y, z, 1, desde, radio, t)) as Doblez, pliegueBien)
// Los ecos: mallas aparte con la geometría del logo; el logo y su material no se tocan; van detrás (lejos de la cámara).
const ECOS_SRC = leer('_lib/escena/espejo/ecos.ts')
const ecosBien = (src: string): boolean =>
  src.includes('const m = new THREE.Mesh(d.malla.geometry, c.material)') && !/\.material\s*=|d\.malla\.(geometry|matrix|position|rotation|scale)\s*=/.test(src) &&
  src.includes('ATRAS.copy(CENTRO).sub(camara.position).normalize()') && ECOS.copias <= 6
afirmar(ecosBien(ECOS_SRC), `  los ecos: ${String(ECOS.copias)} copias con la geometría del logo y su propio material, detrás (lejos de la cámara), en abanico y espejadas; el logo no se toca`)
controlPositivo('  el detector VE un eco que le cambia el material al logo', `${ECOS_SRC}\nd.malla.material = c.material`, ecosBien)

const ESPEJO_SRC = Object.fromEntries(['espejo.ts', 'armado.ts', 'ecos.ts', 'pantalla.ts', 'pliegue.ts', 'EspejoDeLaEscena.tsx'].map((m) => [m, leer(`_lib/escena/espejo/${m}`)])) as Record<string, string>
const DEL_CUADRO_P2: readonly (readonly [string, string])[] = [['espejo.ts', 'pasoDelDisparador'], ['espejo.ts', 'elegirLaZona'], ['espejo.ts', 'amplitudDelCiclo'], ['armado.ts', 'cuadroDelEspejo'], ['armado.ts', 'elLogoEnLaPantalla'], ['ecos.ts', 'cuadroDeLosEcos'], ['EspejoDeLaEscena.tsx', 'tramoDelScroll']]
const espejoLivianoBien = (f: Record<string, string>): boolean => Object.values(f).every((t) => lineasDeCodigo(t) <= 300) && DEL_CUADRO_P2.every(([m, fn]) => sinReservasEn(f[m] ?? '', fn))
afirmar(espejoLivianoBien(ESPEJO_SRC), `  los módulos del espejo, de menos de 300 líneas; ${String(DEL_CUADRO_P2.length)} funciones de cada cuadro sin reservas`, DEL_CUADRO_P2.filter(([m, fn]) => !sinReservasEn(ESPEJO_SRC[m] ?? '', fn)).map(([m, fn]) => `${m}:${fn}`).join(' · '))
controlPositivo('  el detector VE una reserva en el cuadro de los ecos', { ...ESPEJO_SRC, 'ecos.ts': (ESPEJO_SRC['ecos.ts'] ?? '').replace('  logo.updateMatrixWorld()\n', '  const tmp = new THREE.Matrix4()\n  logo.updateMatrixWorld()\n') }, espejoLivianoBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('Lo mirado y lo medido en el MINI-BANCO (no el sitio: sin memoria para su banco): las hojas, el costo del plasma y de cada efecto')

const recibo = <T,>(nombre: string): T => JSON.parse(readFileSync(`docs/rediseno/entregas/pulido-18/${nombre}`, 'utf8')) as T
interface Hoja { readonly tiempos: readonly number[] | null; readonly errores: number }
const HOJAS = recibo<{ readonly hojas: Readonly<Record<string, Readonly<Record<string, Hoja>>>> }>('mini-secuencias.json').hojas
const P1_HOJAS = ['1-noche', '2-dia', '3-piso-de-cerca', '3b-piso-de-cerca-dia', '4-logo-bajando', '5-puntero', '6-clic', '7-mantener-soltar', '8-clic-dia'] as const
const P2_1440 = ['e-cristal-dia', 'e-cristal-noche', 'e-cristal-prisma', 'e-caleidoscopio-dia', 'e-espiral-dia', 'e-pliegue-dia', 'e-pliegue-noche', 'e-ecos-noche', 'e-ecos-dia'] as const
const P2_390 = ['e-cristal-dia', 'e-cristal-noche', 'e-caleidoscopio-dia', 'e-espiral-dia', 'e-pliegue-dia', 'e-ecos-noche'] as const
const hojasBien = (h: typeof HOJAS): boolean => ([['1440', [...P1_HOJAS, ...P2_1440]], ['390', [...P1_HOJAS, ...P2_390]]] as const).every(([w, nombres]) =>
  nombres.every((n) => { const q = h[w]?.[n]; return q !== undefined && q.errores === 0 && (q.tiempos ?? []).length === 8 }))
afirmar(hojasBien(HOJAS), '  las hojas del mini-banco: P1 (noche, día, piso de cerca de noche y de día, el logo bajando, puntero, clic, mantener y soltar, el clic de día) a 1440 y 390; P2, cada efecto (a 1440 también el prisma, los ecos de día y el pliegue de noche); 8 cuadros cada una, sin errores del compilador')
controlPositivo('  el detector VE una hoja que falta (la del pliegue a 390)', { ...HOJAS, '390': Object.fromEntries(Object.entries(HOJAS['390'] ?? {}).filter(([n]) => n !== 'e-pliegue-dia')) }, hojasBien)

interface Est18 { readonly media: number; readonly p95: number; readonly maximo: number; readonly mayoresDe20: number; readonly cuadros: number }
interface Medida18 { readonly cuadro: Est18; readonly gpu: Est18; readonly errores: number; readonly programasAntes: number; readonly programas: number; readonly heap: { readonly kbPorCuadro: number; readonly recolecciones: number }; readonly repetidas?: readonly { readonly cuadro: Est18 }[] }
interface DelInstrumento { readonly mayoresDe20: number }
interface Medido18 { readonly placa: string; readonly medidas: Readonly<Record<string, Readonly<Record<string, Medida18>>>>; readonly instrumento: Readonly<Record<string, DelInstrumento>> }
const MEDIDO18 = recibo<Medido18>('mini-medido.json')
const EFECTOS18 = ['cristal', 'pliegue', 'caleidoscopio', 'ecos', 'espiral'] as const
const CONFIGS18 = ['escena', 'calma-noche', 'calma-dia', 'maxima-noche', 'maxima-dia', ...EFECTOS18.flatMap((e) => [`${e}-dia`, `${e}-noche`])]
// Ningún cuadro de más de 20 ms (sin vsync, sin el reloj de la GPU) ni de la GPU (con su reloj), en calma, al máximo y con cada efecto
// activo, a 1440 y 390 (un cuadro largo vale sólo si, medido dos veces más, no vuelve: era la máquina); nada se compila durante la
// medición (la escena precompilada, como el sitio); la basura por cuadro, chica (antes del arreglo de `Math.hypot`, 378 KB). Y la
// prueba del instrumento: con el reloj de la GPU se traba un cuadro; sin él, ninguno.
const sinLargos = (e: Est18): boolean => e.mayoresDe20 === 0 && e.maximo <= 20
const medidoBien = (m: Medido18): boolean => m.placa.includes('NVIDIA') && (['1440', '390'] as const).every((w) => CONFIGS18.every((c) => {
  const r = m.medidas[w]?.[c]
  return r !== undefined && r.errores === 0 && r.cuadro.cuadros > 300 && (sinLargos(r.cuadro) || ((r.repetidas ?? []).length >= 2 && (r.repetidas ?? []).every((x) => sinLargos(x.cuadro)))) && r.gpu.cuadros > 300 &&
    r.gpu.maximo <= 20 && r.gpu.p95 <= 2 && r.programas === r.programasAntes && r.heap.kbPorCuadro <= 64
})) && ['si-1', 'si-2', 'si-3'].some((k) => (m.instrumento[k]?.mayoresDe20 ?? 0) > 0) && ['no-1', 'no-2', 'no-3'].every((k) => m.instrumento[k]?.mayoresDe20 === 0)
const de = (w: string, c: string): Medida18 | undefined => MEDIDO18.medidas[w]?.[c]
const maximoDe = (r: Medida18 | undefined): number => (r === undefined ? 99 : !sinLargos(r.cuadro) && (r.repetidas ?? []).length > 0 ? Math.max(...(r.repetidas ?? []).map((x) => x.cuadro.maximo)) : r.cuadro.maximo)
const peor = (w: string): number => Math.max(...CONFIGS18.map((c) => maximoDe(de(w, c))))
const sueltos = (['1440', '390'] as const).flatMap((w) => CONFIGS18.filter((c) => de(w, c) !== undefined && !sinLargos(de(w, c)?.cuadro ?? { mayoresDe20: 1, maximo: 99, media: 0, p95: 0, cuadros: 0 })).map((c) => `${c} a ${w} (${String(de(w, c)?.cuadro.maximo)} ms)`))
afirmar(medidoBien(MEDIDO18), `  la NVIDIA, sin vsync: el plasma A al máximo ${String(de('1440', 'maxima-noche')?.cuadro.media)} ms por cuadro a 1440 (la escena sola ${String(de('1440', 'escena')?.cuadro.media)}) y ${String(de('390', 'maxima-noche')?.cuadro.media)} a 390; el peor cuadro, ${String(peor('1440'))} y ${String(peor('390'))} ms con cada efecto activo (${sueltos.length === 0 ? 'ninguno suelto' : `suelto, sin volver en dos corridas más: ${sueltos.join(', ')}`}); la GPU, a lo sumo ${String(Math.max(...CONFIGS18.map((c) => Math.max(de('1440', c)?.gpu.maximo ?? 99, de('390', c)?.gpu.maximo ?? 99))))} ms; ${String(de('1440', 'maxima-noche')?.heap.kbPorCuadro)} KB de basura por cuadro`)
controlPositivo('  el detector VE un cuadro de 22 ms con un efecto', { ...MEDIDO18, medidas: { ...MEDIDO18.medidas, '1440': { ...MEDIDO18.medidas['1440'], 'cristal-dia': { ...MEDIDO18.medidas['1440']['cristal-dia'], cuadro: { ...MEDIDO18.medidas['1440']['cristal-dia'].cuadro, maximo: 22, mayoresDe20: 1 } } } } }, medidoBien)
controlPositivo('  y un cuadro largo que al repetirlo vuelve', { ...MEDIDO18, medidas: { ...MEDIDO18.medidas, '390': { ...MEDIDO18.medidas['390'], 'cristal-dia': { ...MEDIDO18.medidas['390']['cristal-dia'], repetidas: [{ cuadro: { ...MEDIDO18.medidas['390']['cristal-dia'].cuadro, mayoresDe20: 1, maximo: 70 } }, { cuadro: MEDIDO18.medidas['390']['cristal-dia'].cuadro }] } } } }, medidoBien)
controlPositivo('  y la basura de antes (378 KB por cuadro)', { ...MEDIDO18, medidas: { ...MEDIDO18.medidas, '390': { ...MEDIDO18.medidas['390'], 'calma-noche': { ...MEDIDO18.medidas['390']['calma-noche'], heap: { kbPorCuadro: 378, recolecciones: 1756 } } } } }, medidoBien)
controlPositivo('  y un programa que se compila en medio', { ...MEDIDO18, medidas: { ...MEDIDO18.medidas, '390': { ...MEDIDO18.medidas['390'], 'espiral-noche': { ...MEDIDO18.medidas['390']['espiral-noche'], programas: (MEDIDO18.medidas['390']['espiral-noche']?.programasAntes ?? 0) + 1 } } } }, medidoBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('El banco del SITIO (la memoria volvió al final del sprint): las secuencias de P1 y P2 y lo medido en la NVIDIA')

interface MomentoSitio { readonly hoja: string; readonly tiempos: readonly number[] }
interface SecuenciaSitio { readonly placa: string; readonly momentos: Readonly<Record<string, MomentoSitio>>; readonly consola: readonly string[]; readonly contados: Readonly<Record<string, number>> | null }
const SITIO = recibo<{ readonly secuencias: Readonly<Record<string, SecuenciaSitio>> }>('sitio-secuencias.json').secuencias
const MOMENTOS_SITIO: Readonly<Record<string, readonly string[]>> = {
  'p1-1440': ['noche', 'dia', 'piso', 'logo', 'puntero', 'clic', 'carga'],
  'p1-390': ['noche', 'dia', 'piso', 'clic', 'carga', 'logo'],
  ...Object.fromEntries(EFECTOS18.flatMap((e) => ['1440', '390'].map((w) => [`p2-${e}-${w}`, e === 'ecos' ? ['espejo-dia', 'espejo-noche', 'logo'] : ['espejo-dia', 'espejo-noche']]))),
}
// El aviso de la base (el compilador de D3D, en un programa del sitio: también con el polvo solo).
const DE_LA_BASE = 'warning X4122'
const sitioBien = (s: typeof SITIO): boolean => Object.entries(MOMENTOS_SITIO).every(([k, ms]) => {
  const q = s[k]
  return q !== undefined && q.placa.includes('NVIDIA') && ms.every((m) => { const t = q.momentos[m]?.tiempos ?? []; return t.length === 8 && t.slice(1).every((x, i) => x > t[i]) })
}) && (s['p1-1440']?.contados?.descarga ?? 0) >= 1 && (s['p1-1440']?.contados?.pulso ?? 0) >= 1 &&
  // Después del arreglo del prisma (y del halo de los arcos), con las cachés de programas borradas: en la consola, sólo el de la base.
  (s['p2c-cristal-1440']?.consola ?? ['falta']).every((c) => c.includes(DE_LA_BASE)) && (s['p1b-1440']?.momentos.carga?.tiempos ?? []).length === 8
afirmar(sitioBien(SITIO), '  las hojas del sitio: P1 a 1440 (noche, día, piso, el logo bajando, puntero, clic, mantener y soltar) y a 390 (la resumida con el dedo), con su pulso y su descarga; P2, cada efecto de día y de noche a 1440 y 390 (los ecos, también con el logo bajando); 8 cuadros del compositor en orden; después de los arreglos, la consola sólo con el aviso de la base')
controlPositivo('  el detector VE una hoja de P2 que falta (el pliegue a 390)', Object.fromEntries(Object.entries(SITIO).filter(([k]) => k !== 'p2-pliegue-390')), sitioBien)
controlPositivo('  y el aviso del prisma en la consola (el de antes del arreglo)', { ...SITIO, 'p2c-cristal-1440': { ...SITIO['p2c-cristal-1440'], consola: [...(SITIO['p2c-cristal-1440']?.consola ?? []), 'warning X4000: use of potentially uninitialized variable (f_leerConPrisma)'] } }, sitioBien)

interface EstSitio { readonly media: number; readonly p95: number; readonly maximo: number; readonly mayoresDe20: number; readonly cuadros: number }
type Tramo = 'frio' | 'calma' | 'maxima' | 'noche' | 'efectoDeDia' | 'efectoDeNoche'
type MedidaSitio = Readonly<Partial<Record<Tramo, EstSitio>>> & { readonly placa: string }
interface MedidoSitio { readonly libre: Readonly<Record<string, MedidaSitio>>; readonly vsync: Readonly<Record<string, MedidaSitio>> }
const MEDIDO_SITIO = recibo<{ readonly medido: MedidoSitio }>('sitio-medido.json').medido
const QUIENES = ['polvo', 'producto', ...EFECTOS18.map((e) => `espejo-${e}`)]
// En caliente (la calma, al máximo, la noche y, con un efecto, el efecto de día y de noche), sin vsync: ningún cuadro de más de 20 ms a
// 1440 ni a 390, en la NVIDIA. Con vsync, al máximo y de noche, ninguno; en la calma, a lo sumo los de la base (el campo del logo que se
// publica, el de s68: el polvo solo también lo tiene).
const enCalienteSitio = (m: MedidoSitio): boolean => QUIENES.every((q) => (['1440', '390'] as const).every((w) => {
  const r = m.libre[`${q}-${w}`]
  if (r === undefined || !r.placa.includes('NVIDIA')) return false
  const tramos: readonly Tramo[] = q.startsWith('espejo-') ? ['calma', 'maxima', 'noche', 'efectoDeDia', 'efectoDeNoche'] : ['calma', 'maxima', 'noche']
  return tramos.every((t) => { const e = r[t]; return e !== undefined && e.mayoresDe20 === 0 && e.maximo <= 20 && e.cuadros > 200 })
})) && ['polvo-1440', 'polvo-390', 'producto-1440', 'producto-390'].every((k) => {
  const r = m.vsync[k]
  return r !== undefined && r.maxima?.mayoresDe20 === 0 && r.noche?.mayoresDe20 === 0 && (r.calma?.mayoresDe20 ?? 9) <= 1
}) && ['1440', '390'].every((w) => (m.vsync[`producto-${w}`]?.calma?.mayoresDe20 ?? 9) <= (m.vsync[`polvo-${w}`]?.calma?.mayoresDe20 ?? 0))
const sumaSitio = (w: string): number => (MEDIDO_SITIO.libre[`producto-${w}`]?.maxima?.media ?? 99) - (MEDIDO_SITIO.libre[`polvo-${w}`]?.maxima?.media ?? 0)
const peorEnCaliente = Math.max(...QUIENES.flatMap((q) => ['1440', '390'].flatMap((w) => (['calma', 'maxima', 'noche', 'efectoDeDia', 'efectoDeNoche'] as const).map((t) => MEDIDO_SITIO.libre[`${q}-${w}`]?.[t]?.maximo ?? 0))))
afirmar(enCalienteSitio(MEDIDO_SITIO) && sumaSitio('1440') <= 2.04, `  en caliente, sin vsync, ningún cuadro de más de 20 ms a 1440 ni a 390 (el peor, ${String(peorEnCaliente)} ms); con vsync, en la calma sólo el de la base (${String(MEDIDO_SITIO.vsync['polvo-1440']?.calma?.maximo ?? 0)} ms el polvo solo, ${String(MEDIDO_SITIO.vsync['producto-1440']?.calma?.maximo ?? 0)} con el plasma); el plasma A le suma al polvo +${sumaSitio('1440').toFixed(2)} ms por cuadro al máximo a 1440 (en PULIDO 17, +2,04) y +${sumaSitio('390').toFixed(2)} a 390`)
controlPositivo('  el detector VE una calma con vsync con un tirón que la base no tiene', { ...MEDIDO_SITIO, vsync: { ...MEDIDO_SITIO.vsync, 'producto-390': { ...MEDIDO_SITIO.vsync['producto-390'], calma: { media: 14, p95: 14, maximo: 300, mayoresDe20: 1, cuadros: 370 } } } }, enCalienteSitio)
controlPositivo('  y un cuadro de 22 ms con el pliegue al máximo', { ...MEDIDO_SITIO, libre: { ...MEDIDO_SITIO.libre, 'espejo-pliegue-1440': { ...MEDIDO_SITIO.libre['espejo-pliegue-1440'], maxima: { media: 3.9, p95: 7, maximo: 22, mayoresDe20: 1, cuadros: 1500 } } } }, enCalienteSitio)
// En frío (la primera visita: cachés borradas, el primer scroll rápido), los tirones son del sitio: el polvo solo también los tiene.
const peorDelPolvoEnFrio = Math.max(MEDIDO_SITIO.libre['polvo-1440']?.frio?.maximo ?? 0, MEDIDO_SITIO.libre['polvo-390']?.frio?.maximo ?? 0)
const frioComoElSitio = (m: MedidoSitio): boolean => (m.libre['polvo-1440']?.frio?.mayoresDe20 ?? 0) >= 1 && QUIENES.every((q) => (['1440', '390'] as const).every((w) => (m.libre[`${q}-${w}`]?.frio?.maximo ?? 9e9) <= Math.max(1300, peorDelPolvoEnFrio * 1.6)))
afirmar(frioComoElSitio(MEDIDO_SITIO), `  en frío, los tirones del primer scroll también los tiene el polvo solo (hasta ${String(peorDelPolvoEnFrio)} ms); con el plasma y los efectos, a lo sumo ${String(Math.max(...QUIENES.flatMap((q) => ['1440', '390'].map((w) => MEDIDO_SITIO.libre[`${q}-${w}`]?.frio?.maximo ?? 0))))} ms (la deuda de s68)`)
controlPositivo('  el detector VE un efecto que duplica el tirón en frío', { ...MEDIDO_SITIO, libre: { ...MEDIDO_SITIO.libre, 'espejo-cristal-1440': { ...MEDIDO_SITIO.libre['espejo-cristal-1440'], frio: { media: 9, p95: 20, maximo: 2400, mayoresDe20: 30, cuadros: 300 } } } }, frioComoElSitio)

cerrar('s69-pulido-18')
