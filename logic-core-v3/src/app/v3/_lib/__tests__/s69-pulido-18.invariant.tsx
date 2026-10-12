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
 */
import { readFileSync } from 'node:fs'
import * as THREE from 'three'

import { BASE_LIMPIA, ENTORNO, PRUEBAS_SUELTAS, entornoPedido, pedidoDeLaUrl } from '../escena/entorno'
import { DE_AFUERA, deAfuera } from '../escena/energia/afuera'
import { BRASAS, azarConSemilla, crearBrasas, crearEntradaDeLasBrasas } from '../escena/energia/brasas'
import { ORDEN_DE_LA_ENERGIA } from '../escena/energia/dibujo/armado'
import { ASPECTO } from '../escena/energia/dibujo/particulas'
import { DIRECCIONES, DIRECCION_RECOMENDADA, direccionDe } from '../escena/energia/direcciones'
import { AJUSTES_DEL_ENJAMBRE, SIMULACION_DEL_ENJAMBRE_GLSL } from '../escena/energia/enjambre/simulacion'
import { DEL_MOVIMIENTO, delMovimiento } from '../escena/energia/movimiento'
import { pasoDeLasBrasas } from '../escena/energia/paso'
import { PASE, entraALaPasada } from '../escena/pase/pase'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { lineasDeCodigo, pisoDeLasBrasas, sinReservasEn, todoJunto } from './s69-ayudas'

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

cerrar('s69-pulido-18')
