/**
 * PULIDO 17 — el invariante: npm run test:s68-pulido-17
 *
 * Cada cosa con su control positivo (el detector ve el estado de antes). Los recibos medidos, en `docs/rediseno/entregas/pulido-17/`;
 * el log, `docs/rediseno/SPRINT-PULIDO-17.md`.
 *   O1 · `?nosotros=fijo` se borró: Nosotros queda alejado (0,8) y siguiendo el 70 % del giro, sin otra lectura.
 *   O3 · el plasma, de nuevo y en serio (`docs/rediseno/PLASMA.md`; de dónde sale, `REFERENCIAS-PLASMA.md`): lo de PULIDO 16 se borró
 *        (los átomos, sus experimentos de color, campo y sonido, la chispa) y no vuelve; tres direcciones (`?plasma=a|b|c`) sobre
 *        `?energia=plasma` (y `plasma-y-polvo`); el campo sin divergencia y el mismo azar en la CPU y en la GPU; las brasas con la física
 *        de PULIDO 15; el puntero que ordena; la temperatura; los arcos (re-golpes, resplandor, el logo como fuente, el clic contenido,
 *        nunca sobre el texto); la cinta continua; el dibujo sin figuras (de día, energía oscura); el pie; quieto con movimiento
 *        reducido; sin reservas por cuadro.
 *   O4 · lo mirado: las secuencias de cada dirección a 1440 y a 390 (el recibo de sus tiempos).
 *   O5 · lo medido en la NVIDIA: en caliente, ningún cuadro de más de 20 ms; en frío, los tirones son del sitio; el costo de verdad.
 * [PULIDO 18] P1.0 · el plasma A pasó al producto y C se borró con su código (decisión del humano): lo que acá fijaba el polvo como
 * producto y la existencia de C se actualizó con su antes / ahora / por qué al lado; lo medido de C queda en su recibo (historia). s69.
 */
import { existsSync, readFileSync } from 'node:fs'

import { PLANO_DE_NOSOTROS } from '../../_secciones/quienes-somos/geometria'
import { ENTORNO, PRUEBAS_SUELTAS, entornoPedido } from '../escena/entorno'
import { ARCOS, crearArcos, envejecer, golpeEn, residualEn } from '../escena/energia/arcos/arcos'
import { PUNTOS_POR_ARCO, VERTICES_DE_LA_CINTA, crearCinta, rellenarCinta } from '../escena/energia/arcos/cinta'
import { PROGRAMA, programarArcos, type EntornoDeLosArcos } from '../escena/energia/arcos/programador'
import { BRASAS, azarConSemilla, crearBrasas, crearEntradaDeLasBrasas } from '../escena/energia/brasas'
import { pasoDeLasBrasas } from '../escena/energia/paso'
import { TEMPERATURA, calentar, crearTemperatura, pasoDeLaTemperatura } from '../escena/energia/calor'
import { DIRECCIONES, DIRECCION_RECOMENDADA } from '../escena/energia/direcciones'
import { RUIDO, RUIDO_GLSL, mezclar, rotor, ruidoConGradiente } from '../escena/energia/ruido'
import { brilloPorDensidad, cuantosEnlaces } from '../escena/energia/vecinas'
import { SONIDOS } from '../sonido/catalogo'
import { CORTES_DEL_SPRITE } from '../sonido/sprite'
import { afirmar, cerrar, controlPositivo, deudaDeclarada, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const recibo = <T,>(nombre: string): T => JSON.parse(readFileSync(`docs/rediseno/entregas/pulido-17/${nombre}`, 'utf8')) as T

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

// ═══════════════════════════════════════════════════════════════════════════
titulo('O3 · Lo de PULIDO 16 se borró y no vuelve (los átomos, sus experimentos, la chispa)')

const ENERGIA = `${V3}/_lib/escena/energia`
const BORRADOS = ['especies.ts', 'fisica', 'render', 'arcos/bufer.ts', 'interaccion/lineasDeCampo.ts'] as const
const EXPERIMENTOS = ['plasma-color', 'plasma-campo', 'plasma-sonido'] as const
const sinLoDe16 = (existe: (ruta: string) => boolean, f: Traductor, sueltas: readonly string[], cortes: Readonly<Record<string, unknown>>, sonidos: Readonly<Record<string, unknown>>): boolean =>
  BORRADOS.every((r) => !existe(`${ENERGIA}/${r}`)) && EXPERIMENTOS.every((k) => !sueltas.includes(k) && !(k in f(`producto,energia=plasma,${k}=si`).pruebas)) && !('chispa' in cortes) && !('chispa' in sonidos)
afirmar(sinLoDe16(existsSync, entornoPedido, PRUEBAS_SUELTAS, CORTES_DEL_SPRITE, SONIDOS), '  sin los átomos (especies, física, dibujo, búfer, líneas de campo), sin `?plasma-color|campo|sonido=` y sin la chispa en el sprite («sin sonido ni color, descartado»)')
controlPositivo('  el detector VE los átomos de vuelta', (r: string) => r.endsWith('especies.ts') || existsSync(r), (e: (r: string) => boolean) => sinLoDe16(e, entornoPedido, PRUEBAS_SUELTAS, CORTES_DEL_SPRITE, SONIDOS))
controlPositivo('  y la chispa en el sprite', { ...CORTES_DEL_SPRITE, chispa: [14860, 260] }, (c: Readonly<Record<string, unknown>>) => sinLoDe16(existsSync, entornoPedido, PRUEBAS_SUELTAS, c, SONIDOS))
controlPositivo('  y el color de vuelta (la bandera)', [...PRUEBAS_SUELTAS, 'plasma-color'], (s: readonly string[]) => sinLoDe16(existsSync, entornoPedido, s, CORTES_DEL_SPRITE, SONIDOS))

// ═══════════════════════════════════════════════════════════════════════════
titulo('O3 · Las direcciones: [PULIDO 18] el producto, A; C se borró; [PULIDO 19] B se borró con su código y `?plasma=` con ella')

// [PULIDO 18] P1.0 · ANTES: tres direcciones (`plasma=a|b|c`) sobre `energia=plasma`; en el producto, el polvo. DESPUÉS: el plasma A es
// el producto (sin bandera); `plasma=b` elegía B; C se borró. [PULIDO 19] Q0 · AHORA: sólo A (B se borró con su enjambre, su simulación y
// su estilo; `?plasma=` ya no es una prueba: se ignora). POR QUÉ: la decisión del humano (el cristal de la dimensión espejo reemplaza a
// B). Lo demás se afirma igual (el escenario monta el plasma sin pedir nada y el polvo con `energia=`). s69 lo sigue.
const STAGE = leer('_lib/escena/ProbeStage.tsx')
const direccionesBien = (f: Traductor, stage: string): boolean =>
  f('producto').pruebas.energia === 'no' && !('plasma' in f('producto').pruebas) && !('plasma' in ENTORNO.pruebas) && !(PRUEBAS_SUELTAS as readonly string[]).includes('plasma') &&
  f('producto,plasma=b').pruebas.energia === 'no' && f('producto,energia=plasma-y-polvo,plasma=b').pruebas.energia === 'plasma-y-polvo' && !('plasma' in f('producto,plasma=b').pruebas) &&
  stage.includes("{conPlasma && <PlasmaYCargas logoGroupRef={logoGroupRef} quieto={reducedMotion} compacto={calidad === 'compacta'} />}") && !stage.includes('direccionDe(') &&
  stage.includes("const conPlasma = energia !== 'polvo'") && stage.includes("const conPolvo = energia !== 'no'") && stage.includes('{conPolvo && <DepthParticles store={store} />}')
afirmar(direccionesBien(entornoPedido, STAGE), '  sin bandera, A (el producto: el plasma sin pedir nada); `?plasma=` ya no existe (se ignora); con `energia=plasma-y-polvo`, además del polvo')
controlPositivo('  el detector VE el escenario de PULIDO 17 (sin bandera, el polvo)', STAGE.replace("const conPlasma = energia !== 'polvo'", "const conPlasma = energia === 'plasma-y-polvo'"), (s: string) => direccionesBien(entornoPedido, s))
controlPositivo('  y el escenario que todavía elige una dirección', STAGE.replace("compacto={calidad === 'compacta'} />}", "compacto={calidad === 'compacta'} direccion={direccionDe(plasma)} />}"), (s: string) => direccionesBien(entornoPedido, s))
const cadaUna = (d: typeof DIRECCIONES): boolean => d.a.brasas[0] >= 400 && !('b' in d) && !('c' in d) && DIRECCION_RECOMENDADA === 'a' && !existsSync('src/app/v3/_lib/escena/energia/enjambre')
afirmar(cadaUna(DIRECCIONES), `  A, chispas (${String(DIRECCIONES.a.brasas[0])} en la CPU); B y C ya no existen (ni la carpeta del enjambre); sin la bandera, A`)
controlPositivo('  el detector VE a B de vuelta', Object.assign({ b: DIRECCIONES.a }, DIRECCIONES), cadaUna)

// ═══════════════════════════════════════════════════════════════════════════
titulo('O3 · El campo (curl noise): sin divergencia, el mismo azar en la CPU y en la GPU')

type Campo3 = (x: number, y: number, z: number, destino: Float32Array) => void
const DELTA = 1e-3
const divergenciaMedia = (campo: Campo3): number => {
  const q = new Float32Array(3)
  let suma = 0
  let largo = 0
  for (let k = 0; k < 200; k += 1) {
    const [x, y, z] = [Math.sin(k * 1.3) * 9, Math.cos(k * 0.7) * 6, Math.sin(k * 0.37) * 9]
    campo(x, y, z, q)
    largo += Math.hypot(q[0], q[1], q[2]) / 200
    let s = 0
    campo(x + DELTA, y, z, q)
    s += q[0]
    campo(x - DELTA, y, z, q)
    s -= q[0]
    campo(x, y + DELTA, z, q)
    s += q[1]
    campo(x, y - DELTA, z, q)
    s -= q[1]
    campo(x, y, z + DELTA, q)
    s += q[2]
    campo(x, y, z - DELTA, q)
    s -= q[2]
    suma += Math.abs(s / (2 * DELTA)) / 200
  }
  return suma / Math.max(1e-6, largo)
}
const delRotor: Campo3 = (x, y, z, d) => rotor(x, y, z, 3, d, 0)
const N4 = new Float32Array(4)
// El gradiente del mismo ruido: un campo que SÍ tiene divergencia (el control).
const delGradiente: Campo3 = (x, y, z, d) => {
  ruidoConGradiente(x * RUIDO.escala, y * RUIDO.escala, z * RUIDO.escala, 0, N4, 0)
  d[0] = N4[1]
  d[1] = N4[2]
  d[2] = N4[3]
}
const sinDivergencia = (c: Campo3): boolean => divergenciaMedia(c) < 0.01
afirmar(sinDivergencia(delRotor), `  el flujo es el rotor de un potencial: divergencia ~0 (relativa ${divergenciaMedia(delRotor).toExponential(1)}): se arremolina sin juntar ni vaciar`)
controlPositivo('  el detector VE un campo con divergencia (el gradiente del mismo ruido)', delGradiente, sinDivergencia)
const MEZCLAS = ['0x7feb352d', '0x846ca68b', '0x8da6b343', '0xd8163841', '0xcb1ab31f', '0x165667b1'] as const
const mismoAzar = (glsl: string, js: string): boolean => MEZCLAS.every((m) => glsl.includes(`${m}u`) && js.includes(m)) && glsl.includes('% 12u') && js.includes('% 12) * 3') && mezclar(0) === 0 && mezclar(1) !== 1
afirmar(mismoAzar(RUIDO_GLSL, leer('_lib/escena/energia/ruido.ts')), '  el hash de 32 bits es el mismo en JS y en GLSL (las mismas constantes, los mismos 12 gradientes): un núcleo deriva con su nube')
controlPositivo('  el detector VE una constante distinta en el sombreador', RUIDO_GLSL.replace('0x846ca68bu', '0x846ca68cu'), (g: string) => mismoAzar(g, leer('_lib/escena/energia/ruido.ts')))

// ═══════════════════════════════════════════════════════════════════════════
titulo('O3 · Las brasas: la física de PULIDO 15 (lo que gustó), hecha luz; el puntero ordena y energiza')

const DE_PULIDO_15 = { radio: 13, hueco: 4.2, alcance: 3.6, atrae: 0.42, repele: 0.55, cerca: 0.55, choque: 6, amortigua: 1.1, tope: 3, contiene: 1.6, forma: 1.2, reposo: 0.95, resorte: 2.2 } as const
interface FisicaDe15 {
  readonly volumen: { readonly radio: number; readonly hueco: number }
  readonly fuerzas: Readonly<Record<'alcance' | 'atrae' | 'repele' | 'cerca' | 'choque' | 'amortigua' | 'tope' | 'contiene', number>>
  readonly enlace: { readonly forma: number; readonly reposo: number; readonly resorte: number }
}
const comoEn15 = (b: FisicaDe15): boolean =>
  b.volumen.radio === DE_PULIDO_15.radio && b.volumen.hueco === DE_PULIDO_15.hueco && b.fuerzas.alcance === DE_PULIDO_15.alcance && b.fuerzas.atrae === DE_PULIDO_15.atrae &&
  b.fuerzas.repele === DE_PULIDO_15.repele && b.fuerzas.cerca === DE_PULIDO_15.cerca && b.fuerzas.choque === DE_PULIDO_15.choque && b.fuerzas.amortigua === DE_PULIDO_15.amortigua &&
  b.fuerzas.tope === DE_PULIDO_15.tope && b.fuerzas.contiene === DE_PULIDO_15.contiene && b.enlace.forma === DE_PULIDO_15.forma && b.enlace.reposo === DE_PULIDO_15.reposo && b.enlace.resorte === DE_PULIDO_15.resorte
afirmar(comoEn15(BRASAS), '  las fuerzas, la cáscara y los enlaces son los de PULIDO 15 (las opuestas se atraen, las iguales se repelen, los pares que descargan)')
controlPositivo('  el detector VE una atracción distinta', { ...BRASAS, fuerzas: { ...BRASAS.fuerzas, atrae: 0.6 } }, comoEn15)

// Una corrida: 600 brasas, 4 s en calma y 3 s con el puntero cruzando la nube (su rayo, de la cámara hacia el logo).
const azar = azarConSemilla(17)
const brasas = crearBrasas(600, azar)
const entrada = crearEntradaDeLasBrasas()
entrada.piso = -3.5
const RAYO = { ox: 2, oy: 1, oz: 25, dx: 0, dy: 0, dz: -1 }
const PASO = 1 / 60
let roto = false
for (let k = 0; k < 420; k += 1) {
  entrada.tiempo = k * PASO
  entrada.temperatura = 0.25
  entrada.rayo = k >= 240 ? RAYO : null
  pasoDeLasBrasas(brasas, PASO, entrada, azar)
  brilloPorDensidad(brasas, 1 / 60)
  for (let i = 0; i < brasas.n * 3; i += 1) if (!Number.isFinite(brasas.lugar[i]) || !Number.isFinite(brasas.velocidad[i])) roto = true
}
interface Corrida { readonly roto: boolean; readonly afuera: number; readonly bajoElPiso: number; readonly enlaces: number; readonly energia: readonly [number, number]; readonly cerca: number; readonly lejos: number; readonly giro: number; readonly hacia: number; readonly brilloMinimo: number }
const corrida = ((): Corrida => {
  let afuera = 0
  let bajoElPiso = 0
  let [eMin, eMax] = [1, 0]
  let [cerca, nCerca, lejos, nLejos, giro, hacia, brilloMinimo] = [0, 0, 0, 0, 0, 0, 1]
  for (let i = 0; i < brasas.n; i += 1) {
    const [x, y, z] = [brasas.lugar[i * 3], brasas.lugar[i * 3 + 1], brasas.lugar[i * 3 + 2]]
    if (Math.hypot(x, y, z) > BRASAS.volumen.radio * 1.15) afuera += 1
    if (y < entrada.piso) bajoElPiso += 1
    eMin = Math.min(eMin, brasas.energia[i])
    eMax = Math.max(eMax, brasas.energia[i])
    brilloMinimo = Math.min(brilloMinimo, brasas.brillo[i])
    // Desde el rayo (que va por z): lo radial y lo que gira alrededor.
    const [rx, ry] = [x - RAYO.ox, y - RAYO.oy]
    const d = Math.hypot(rx, ry)
    if (d < 2.4) {
      cerca += brasas.energia[i]
      nCerca += 1
      const [vx, vy] = [brasas.velocidad[i * 3], brasas.velocidad[i * 3 + 1]]
      hacia += Math.abs((vx * rx + vy * ry) / Math.max(1e-4, d))
      giro += Math.abs((vy * rx - vx * ry) / Math.max(1e-4, d))
    } else if (d > 7) {
      lejos += brasas.energia[i]
      nLejos += 1
    }
  }
  return { roto, afuera, bajoElPiso, enlaces: cuantosEnlaces(brasas), energia: [eMin, eMax], cerca: cerca / Math.max(1, nCerca), lejos: lejos / Math.max(1, nLejos), giro: giro / Math.max(1, nCerca), hacia: hacia / Math.max(1, nCerca), brilloMinimo }
})()
const corridaBien = (c: Corrida): boolean => !c.roto && c.afuera === 0 && c.bajoElPiso === 0 && c.enlaces > 0 && c.energia[0] >= 0 && c.energia[1] <= 1
afirmar(corridaBien(corrida), `  7 s de física: ningún NaN, ninguna fuera de la cáscara ni bajo el piso (un arco a una brasa bajo el piso se leía como grieta), ${String(corrida.enlaces)} enlaces, la energía entre 0 y 1`)
controlPositivo('  el detector VE una brasa bajo el piso', { ...corrida, bajoElPiso: 1 }, corridaBien)
const punteroBien = (c: Corrida): boolean => c.cerca > c.lejos + 0.15 && c.giro > c.hacia && c.brilloMinimo < 0.9
afirmar(punteroBien(corrida), `  el puntero ENERGIZA (cerca de su rayo ${corrida.cerca.toFixed(2)}, lejos ${corrida.lejos.toFixed(2)}) y ORDENA: las cercanas giran alrededor del rayo más de lo que caen hacia él (${corrida.giro.toFixed(2)} contra ${corrida.hacia.toFixed(2)} u/s: no se apilan en un grumo); lo amontonado brilla menos (hasta ×${corrida.brilloMinimo.toFixed(2)})`)
controlPositivo('  el detector VE un puntero que sólo junta (el grumo blanco del banco)', { ...corrida, giro: corrida.hacia * 0.5 }, punteroBien)

const T = crearTemperatura()
for (let k = 0; k < 200; k += 1) calentar(T, 0.5)
const techo = T.valor
for (let k = 0; k < 60 * 30; k += 1) pasoDeLaTemperatura(T, PASO, 0)
const temperaturaBien = (arriba: number, abajo: number): boolean => arriba < TEMPERATURA.techo && arriba > 0.95 && Math.abs(abajo - TEMPERATURA.base) < 0.01
afirmar(temperaturaBien(techo, T.valor), `  la temperatura se satura (calentada 200 veces: ${techo.toFixed(4)}, nunca el techo) y vuelve sola a la calma (${T.valor.toFixed(3)})`)
controlPositivo('  el detector VE una temperatura que pasa el techo', 1.2, (x: number) => temperaturaBien(x, T.valor))

// ═══════════════════════════════════════════════════════════════════════════
titulo('O3 · Los arcos: los de PULIDO 15, más luminosos y menos dibujados (re-golpes, resplandor), el logo como fuente, pocos')

// [PULIDO 18] P1.b · todo en el mundo: el entorno dice dónde está el logo (acá, en el origen, como antes el centro).
const entornoDePrueba = (seVe: (x: number, y: number, z: number) => boolean): EntornoDeLosArcos => ({
  camara: new Float32Array([0, 2, 26]),
  logo: new Float32Array(3),
  rayo: null,
  maximo: ARCOS.maximo,
  temperatura: 0.25,
  actividadDelLogo: 0,
  seVe,
  bordeDelLogo: (x, y, z, d) => {
    const l = Math.hypot(x, y, z) || 1
    d[0] = (x / l) * 3.4
    d[1] = (y / l) * 3.4
    d[2] = (z / l) * 3.4
    return true
  },
})
interface DeLosArcos { readonly contados: Readonly<Record<string, number>>; readonly maximoALaVez: number; readonly golpes: readonly number[]; readonly logoMasCorto: number; readonly pulso: number; readonly descarga: number }
const correrArcos = (seVe: (x: number, y: number, z: number) => boolean): DeLosArcos => {
  const az = azarConSemilla(5)
  const b = crearBrasas(600, az)
  const en = crearEntradaDeLasBrasas()
  en.piso = -3.5
  const e = crearArcos(az)
  const entorno = entornoDePrueba(seVe)
  const golpes: number[] = []
  let logoMasCorto = Number.POSITIVE_INFINITY
  let [pulso, descarga] = [0, 0]
  for (let k = 0; k < 1500; k += 1) {
    en.tiempo = k * PASO
    pasoDeLasBrasas(b, PASO, en, az)
    envejecer(e, b, PASO, az)
    if (k === 900) {
      e.pedidos.pulso = true
      e.pedidos.donde.set([2, 0, 5])
    }
    if (k === 1200) {
      e.pedidos.descarga = true
      e.pedidos.donde.set([2, 0, 5])
    }
    const antes = { ...e.contados }
    programarArcos(e, b, PASO, entorno, az)
    if (k === 900) pulso = e.contados.pulso - antes.pulso
    if (k === 1200) descarga = e.contados.descarga - antes.descarga
    for (const arco of e.arcos) {
      if (!arco.activo || arco.edad > 0) continue
      golpes.push(arco.golpes)
      if (arco.clase === 'logo' && arco.b >= 0) logoMasCorto = Math.min(logoMasCorto, Math.hypot(b.lugar[arco.b * 3] - arco.puntoA[0], b.lugar[arco.b * 3 + 1] - arco.puntoA[1], b.lugar[arco.b * 3 + 2] - arco.puntoA[2]))
    }
  }
  return { contados: e.contados, maximoALaVez: e.maximoALaVez, golpes, logoMasCorto, pulso, descarga }
}
const visibles = correrArcos(() => true)
const arcosBien = (r: DeLosArcos): boolean =>
  r.contados.par > 0 && r.contados.logo > 0 && r.maximoALaVez <= ARCOS.maximo && r.golpes.length > 0 && r.golpes.every((g) => g >= ARCOS.golpes.cuantos[0] && g <= ARCOS.golpes.cuantos[1]) &&
  r.logoMasCorto >= PROGRAMA.logoMinimo && r.pulso >= PROGRAMA.pulso.arcos[0] && r.pulso <= PROGRAMA.pulso.arcos[1] && r.descarga === 1
afirmar(arcosBien(visibles), `  25 s: ${String(visibles.contados.par)} entre pares y ${String(visibles.contados.logo)} del logo, como mucho ${String(visibles.maximoALaVez)} a la vez (tope ${String(ARCOS.maximo)}); cada uno con 2 o 3 golpes por el mismo canal; los del logo, de ${PROGRAMA.logoMinimo} u o más (más cortos eran una mancha); el clic, ${String(visibles.pulso)} arco(s) (contenido); la descarga al soltar, uno grande`)
controlPositivo('  el detector VE un clic con tres arcos (el de antes)', { ...visibles, pulso: 3 }, arcosBien)
controlPositivo('  y un arco del logo de una mancha', { ...visibles, logoMasCorto: 0.6 }, arcosBien)
const sobreElTexto = correrArcos(() => false)
const nuncaSobreElTexto = (r: DeLosArcos): boolean => Object.values(r.contados).reduce((s, x) => s + x, 0) === 0
afirmar(nuncaSobreElTexto(sobreElTexto), '  donde no se ve (un texto o fuera del cuadro), ningún arco: ni de los pares, ni del logo, ni del clic, ni de la descarga')
controlPositivo('  el detector VE arcos donde se ve todo', visibles, nuncaSobreElTexto)
const desvanece = (golpe: number, resplandor: number, fin: number): boolean => golpe > 0.9 && resplandor > 0.2 && fin < 0.02
const unArco = crearArcos(azarConSemilla(3)).arcos[0]
unArco.golpes = 2
unArco.tiempos[0] = 0
unArco.tiempos[1] = 0.08
unArco.vida = 0.08 + ARCOS.golpes.residual * 2.2
afirmar(desvanece(golpeEn(unArco, 0.081), residualEn(unArco, 0.12), residualEn(unArco, unArco.vida)), '  cada golpe es un destello que se apaga rápido y deja el canal brillando (el resplandor), que termina en cero con su vida (sin corte)')
controlPositivo('  el detector VE un arco que se corta encendido', [1, 0.4, 0.3] as const, ([g, r, f]: readonly [number, number, number]) => desvanece(g, r, f))

// La cinta: una tira continua por camino (sin tramos superpuestos: de noche sumaban dos veces en cada junta); los lugares sin arco no pintan.
const cinta = crearCinta()
const cintaBien = (c: typeof cinta): boolean => {
  if (c.punto.length !== VERTICES_DE_LA_CINTA * 3 || VERTICES_DE_LA_CINTA !== ARCOS.lugares * PUNTOS_POR_ARCO * 2) return false
  for (let k = 0; k < VERTICES_DE_LA_CINTA; k += 1) if (c.forma[k * 4 + 1] !== 0) return false
  return c.indices.every((i) => i < VERTICES_DE_LA_CINTA)
}
rellenarCinta(crearArcos(azarConSemilla(2)), crearBrasas(10, azarConSemilla(2)), cinta)
afirmar(cintaBien(cinta), `  la cinta: ${String(VERTICES_DE_LA_CINTA)} vértices (dos por punto, una tira por camino y por rama), fijos; sin arcos, ancho 0 (no pinta) y nada que subir`)
controlPositivo('  el detector VE un lugar sin arco que pinta', (() => { const c = crearCinta(); c.forma[1] = 1; return c })(), cintaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('O3 · El dibujo: luz suave sin figuras; de día, energía oscura con un brillo claro mínimo; detrás de los textos; sin bloom')

const PARTICULAS = leer('_lib/escena/energia/dibujo/particulas.ts')
const ARCOS_DIBUJO = leer('_lib/escena/energia/dibujo/arcos.ts')
const EFECTOS_DIBUJO = leer('_lib/escena/energia/dibujo/efectos.ts')
const COMUN_DIBUJO = leer('_lib/escena/energia/dibujo/comun.ts')
const dibujoBien = (particulas: string, arcos: string, efectos: string, comun: string): boolean =>
  // La partícula: un núcleo gaussiano y su halo (ninguna figura: ni el disco con borde ni el anillo de PULIDO 15). [PULIDO 18] P1.d ·
  // ANTES el núcleo crecía con la partícula (`exp( - 0.5 * r2 )`); AHORA su radio tiene un tope en px (chico y nítido; el tamaño lo lleva
  // el halo corto). POR QUÉ: «más partícula, menos nube» (los núcleos grandes eran el bokeh). Sigue siendo una gaussiana; s69 lo sigue.
  particulas.includes('float nucleo = exp( - 0.5 * d2 / ( rNucleo * rNucleo ) ) * cola;') && particulas.includes('float halo = uLuz.z * exp( - 0.5 * r2 / ( uLuz.w * uLuz.w ) ) * cola;') &&
  !/smoothstep\(\s*1\.0\s*-\s*px/.test(particulas) && !/\(\s*r\s*-\s*1\.0\s*\)\s*\/\s*grosor/.test(particulas) &&
  // Brilla (titila con su ritmo, destella), respira por regiones, vibra con la energía, viene de la fuente, profundidad de campo con el brillo conservado.
  particulas.includes('float titila =') && particulas.includes('float destello =') && particulas.includes('float respira =') && particulas.includes('vec2 tiembla =') && particulas.includes('float fuente =') && particulas.includes('float conserva =') &&
  // La cara del logo libre y el tope del brillo (flashero con límite).
  particulas.includes('vBrillo = min( uDelante.z,') &&
  // De día: la energía oscura del tamaño de la partícula y el destello claro sólo en las calientes (en reposo, ninguno).
  // [PULIDO 18] P1.0 · sin el estilo de C (`estela`); [PULIDO 19] Q0 · ni el de B (`mota`): `{ chispa: 0 }`.
  particulas.includes('float sigma = max( uDiaForma.y * uPixel, vRadioPx * uDiaForma.x );') && /CLARO_EN_REPOSO[^=]*= \{ chispa: 0 \}/.test(particulas) &&
  // Los arcos: dos pasadas (lo oscuro, después el núcleo), una tira en inglete con las puntas afinadas y la luz que corre.
  arcos.includes('uniform float uCapa;') && arcos.includes('float inglete =') && arcos.includes('float afina =') && arcos.includes('float corre =') &&
  // Los efectos: el piso (de noche) y el toque del logo; sin el disco de la carga.
  /export const EFECTO = \{ piso: 0, logo: 1 \} as const/.test(efectos) && !efectos.includes('carga: 2') &&
  // El tono de la escena (ACES compensado), la salida premultiplicada y los textos con borde suave.
  comun.includes('c = toneMapping( c );') && comun.includes('cubre * ( 1.0 - uNoche )') && comun.includes('textoBorde: 56,') && comun.includes('vec2 borde = uTextoBorde / uResolucion * uPixel;') && !/EffectComposer|UnrealBloom/.test(particulas + arcos + efectos + comun)
afirmar(dibujoBien(PARTICULAS, ARCOS_DIBUJO, EFECTOS_DIBUJO, COMUN_DIBUJO), '  núcleo y halo gaussianos (sin disco ni anillo), titila, destella, respira, vibra, viene de la fuente, desenfoque con el brillo conservado, la cara del logo libre y un tope; de día energía oscura translúcida y el destello sólo caliente; arcos en dos pasadas y en tira; sin la luz de la carga; el tono ACES, sin bloom')
controlPositivo('  el detector VE el disco con borde de PULIDO 15', PARTICULAS.replace('float nucleo = exp( - 0.5 * d2 / ( rNucleo * rNucleo ) ) * cola;', 'float nucleo = 1.0 - smoothstep( 1.0 - px, 1.0 + px, r2 );'), (p: string) => dibujoBien(p, ARCOS_DIBUJO, EFECTOS_DIBUJO, COMUN_DIBUJO))
controlPositivo('  y el destello claro en reposo (los «ojos» de día)', PARTICULAS.replace('{ chispa: 0 }', '{ chispa: 0.3 }'), (p: string) => dibujoBien(p, ARCOS_DIBUJO, EFECTOS_DIBUJO, COMUN_DIBUJO))
controlPositivo('  y la luz de la carga de vuelta', EFECTOS_DIBUJO.replace('export const EFECTO = { piso: 0, logo: 1 } as const', 'export const EFECTO = { piso: 0, logo: 1, carga: 2 } as const'), (e: string) => dibujoBien(PARTICULAS, ARCOS_DIBUJO, e, COMUN_DIBUJO))

// ═══════════════════════════════════════════════════════════════════════════
titulo('O3 · El cuadro: el golpe del pie sin arco (una onda), cerca del encastre se apaga, quieto con movimiento reducido, sin reservas por cuadro')

const CUADRO_TS = leer('_lib/escena/energia/cuadro.ts')
const PLASMA_TSX = leer('_lib/escena/energia/PlasmaYCargas.tsx')
// [PULIDO 18] P1.b · ANTES la onda salía de (0, 0, 0), el centro del logo en sus coordenadas; AHORA, del logo en el mundo (el plasma ya
// no lo sigue). POR QUÉ: las partículas viven en el mundo (pedido del humano); la onda sigue saliendo del logo.
const pieBien = (cuadro: string, plasma: string): boolean =>
  cuadro.includes('if (a.lectura.golpeAhora) ondaDesde(a, a.centro.x, a.centro.y, a.centro.z, f.ahora)') && !cuadro.includes("forzado = 'logo'") &&
  plasma.includes('const CERCA_DEL_FINAL = 0.85') && plasma.includes('u.uCercaDelFinal.value = CERCA_DEL_FINAL * Math.min(1, Math.max(0, EN_VIVO.fin / Math.max(1e-3, FIN_DEL_GOLPE)))') &&
  plasma.includes('u.uApagado.value = EN_VIVO.camara * despues * despues * (3 - 2 * despues)')
afirmar(pieBien(CUADRO_TS, PLASMA_TSX), '  el pie: el golpe del encastre es una onda desde el logo (sin arco: competía con la descarga del filo); hacia el golpe la energía cerca del logo baja hasta un 85 %; después se apaga con la cámara que sube')
controlPositivo('  el detector VE el arco del golpe de PULIDO 16', CUADRO_TS.replace('if (a.lectura.golpeAhora) ondaDesde(a, a.centro.x, a.centro.y, a.centro.z, f.ahora)', "if (a.lectura.golpeAhora) a.arcos.forzado = 'logo'"), (c: string) => pieBien(c, PLASMA_TSX))
const quietoBien = (plasma: string): boolean => /if \(quieto\) \{\n\s*u\.uTiempo\.value = 0\n\s*cuadroQuieto\(a, quietas\.current\)\n\s*return\n\s*\}/.test(plasma)
afirmar(quietoBien(PLASMA_TSX), '  con movimiento reducido: quietas (sin titilar: el reloj del dibujo clavado), sin física, sin arcos ni pulsos')
controlPositivo('  el detector VE el plasma que sigue corriendo con movimiento reducido', PLASMA_TSX.replace('      cuadroQuieto(a, quietas.current)\n      return\n', '      cuadroQuieto(a, quietas.current)\n'), quietoBien)

/** El cuerpo de la función `nombre` en `texto` (de la llave que abre su renglón a la que la cierra), o '' si no está. */
const cuerpo = (texto: string, nombre: string): string => {
  const m = new RegExp(`function ${nombre}\\(`).exec(texto)
  if (m === null) return ''
  const desde = texto.indexOf('{\n', m.index)
  if (desde < 0) return ''
  let nivel = 0
  for (let i = desde; i < texto.length; i += 1) {
    if (texto[i] === '{') nivel += 1
    else if (texto[i] === '}') {
      nivel -= 1
      if (nivel === 0) return texto.slice(desde, i + 1)
    }
  }
  return ''
}
// [PULIDO 18] P1.b · `brasas.ts` se partió (pasaba las 300 líneas): el paso, en `paso.ts`; lo de afuera de cada una, en `afuera.ts`. Los dos
// entran a los módulos y a las funciones de cada cuadro (las mismas comprobaciones, en su lugar nuevo).
const MODULOS = ['PlasmaYCargas.tsx', 'banco.ts', 'brasas.ts', 'grilla.ts', 'dominio.ts', 'paso.ts', 'afuera.ts', 'vecinas.ts', 'calor.ts', 'cuadro.ts', 'direcciones.ts', 'ruido.ts', 'reposo.ts', 'textoEnPantalla.ts', 'arcos/arcos.ts', 'arcos/camino.ts', 'arcos/cinta.ts', 'arcos/programador.ts', 'dibujo/arcos.ts', 'dibujo/armado.ts', 'dibujo/comun.ts', 'dibujo/efectos.ts', 'dibujo/particulas.ts', 'dibujo/red.ts', 'interaccion/interaccion.ts', 'interaccion/puntero.ts'] as const
const ARCHIVOS: Record<string, string | undefined> = Object.fromEntries(MODULOS.map((m) => [m, existsSync(`${ENERGIA}/${m}`) ? readFileSync(`${ENERGIA}/${m}`, 'utf8').replace(/\r\n/g, '\n') : undefined]))
const deCodigo = (t: string): number => t.split('\n').filter((l) => l.trim() !== '' && !/^\s*(\/\/|\*|\/\*)/.test(l)).length
const modulosBien = (a: Record<string, string | undefined>): boolean => MODULOS.every((m) => a[m] !== undefined && deCodigo(a[m] ?? '') <= 300)
afirmar(modulosBien(ARCHIVOS), `  en módulos (${String(MODULOS.length)}), ninguno de más de 300 líneas de código`, MODULOS.map((m) => `${m} ${String(deCodigo(ARCHIVOS[m] ?? ''))}`).filter((x) => Number(x.split(' ')[1]) > 230).join(' · '))
controlPositivo('  el detector VE un módulo de 301 líneas', { ...ARCHIVOS, 'cuadro.ts': 'x\n'.repeat(301) }, modulosBien)
const POR_CUADRO: readonly (readonly [string, readonly string[]])[] = [
  ['cuadro.ts', ['cuadro', 'elPuntero', 'elGesto', 'onda', 'ondaDesde', 'alGolpe', 'lucesYEfectos', 'efecto', 'sobreUnTexto']],
  ['brasas.ts', ['distanciaAlRayo', 'alRayoDesde']],
  // [PULIDO 19] Q1.b · la grilla y las fuerzas entre ellas, en `grilla.ts` (relativa a la caja del dominio).
  ['grilla.ts', ['entreEllas', 'ajustarLaGrilla', 'celdaDe']],
  ['paso.ts', ['pasoDeLasBrasas']],
  ['afuera.ts', ['deAfuera']],
  ['vecinas.ts', ['brilloPorDensidad', 'vecinasDe', 'calentarBrasa']],
  ['calor.ts', ['leerLaEscena', 'pasoDeLaTemperatura', 'calentar', 'frentesDelLogo']],
  ['ruido.ts', ['rotor', 'rotorEnLote', 'rotorDeLaBrasa', 'rotorDelPunto', 'ruidoConGradiente', 'ruidoConGradienteEn', 'mezclar', 'esquina']],
  ['arcos/arcos.ts', ['envejecer', 'golpeEn', 'residualEn', 'extremo', 'activos']],
  ['arcos/programador.ts', ['programarArcos', 'parQueSeVe']],
  ['arcos/cinta.ts', ['rellenarCinta', 'lugar', 'escribir']],
  ['arcos/camino.ts', ['puntoDelCamino']],
  ['dibujo/armado.ts', ['subir']],
  // [PULIDO 19] Q1.d · la red en reposo (su máquina y su relleno).
  ['reposo.ts', ['pasoDeLaRed', 'leerElGesto', 'formar', 'cortar', 'enlazar', 'chasquear', 'soltar']],
  ['dibujo/red.ts', ['rellenarRed']],
]
const RESERVA = /\bnew\s+[A-Z]|=>|(?:[=(,:?]|\breturn)\s*\[|(?:[=(,:?]|\breturn)\s*\{(?!\s*$)|addUpdateRange|\.slice\(|\.map\(|\.filter\(/
const sinReservas = (archivos: Record<string, string | undefined>): string[] => POR_CUADRO.flatMap(([archivo, funciones]) => funciones.filter((fn) => {
  const c = cuerpo(archivos[archivo] ?? '', fn)
  return c === '' || RESERVA.test(c)
}).map((fn) => `${archivo}:${fn}`))
afirmar(sinReservas(ARCHIVOS).length === 0, `  sin reservas por cuadro: ${String(POR_CUADRO.reduce((n, [, f]) => n + f.length, 0))} funciones de cada cuadro sin crear objetos, arreglos ni funciones (los búferes son fijos)`, sinReservas(ARCHIVOS).join(' · '))
controlPositivo('  el detector VE el arreglo nuevo del ruido (el que se coló y se arregló)', { ...ARCHIVOS, 'ruido.ts': (ARCHIVOS['ruido.ts'] ?? '').replace('  const a = esquina(ix, iy, iz, c)\n', '  const [a] = [esquina(ix, iy, iz, c)]\n') }, (a: Record<string, string | undefined>) => sinReservas(a).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('O4 · Mirado: las secuencias (8 cuadros cada ~0,15 s) de cada dirección, a 1440 y a 390, sin errores')

interface Momento { readonly hoja: string; readonly tiempos: readonly number[] }
interface Secuencia { readonly momentos: Readonly<Record<string, Momento>>; readonly golpeMs: number | null; readonly contados: Readonly<Record<string, number>> | null; readonly consola: readonly string[]; readonly errores: readonly string[]; readonly placa: string }
const SECUENCIAS = recibo<Readonly<Record<string, Secuencia>>>('o4-secuencias.json')
const LAS_SEIS = ['a-1440', 'a-390', 'b-1440', 'b-390', 'c-1440', 'c-390'] as const
const MOMENTOS_1440 = ['noche', 'puntero', 'clic', 'carga', 'dia', 'clicdia', 'pie'] as const
const MOMENTOS_390 = ['noche', 'clic', 'carga', 'dia', 'clicdia', 'pie'] as const
const secuenciasBien = (s: Readonly<Record<string, Secuencia>>): boolean => LAS_SEIS.every((k) => {
  const q = s[k]
  if (q === undefined || !q.placa.includes('NVIDIA') || q.consola.length > 0 || q.errores.length > 0 || (q.contados?.descarga ?? 0) < 1 || (q.contados?.pulso ?? 0) < 1) return false
  const pedidos = k.endsWith('1440') ? MOMENTOS_1440 : MOMENTOS_390
  return pedidos.every((m) => {
    const t = q.momentos[m]?.tiempos ?? []
    return t.length === 8 && t.slice(1).every((x, i) => x - t[i] >= 100 && x - t[i] <= 200)
  })
})
afirmar(secuenciasBien(SECUENCIAS), '  las hojas de las tres direcciones: a 1440 calma de noche, el puntero, el clic, mantener y soltar (de noche), calma de día, el clic de día y el pie; a 390 la resumida con el dedo; 8 cuadros del compositor cada 100–200 ms, sin errores en la consola, con su pulso y su descarga')
controlPositivo('  el detector VE una hoja con un salto de 400 ms', { ...SECUENCIAS, 'a-1440': { ...SECUENCIAS['a-1440'], momentos: { ...SECUENCIAS['a-1440'].momentos, clic: { hoja: '', tiempos: [0, 150, 300, 700, 850, 1000, 1150, 1300] } } } }, secuenciasBien)
controlPositivo('  y el dedo que no descarga (el banco de antes)', { ...SECUENCIAS, 'b-390': { ...SECUENCIAS['b-390'], contados: { ...(SECUENCIAS['b-390'].contados ?? {}), descarga: 0 } } }, secuenciasBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('O5 · Lo medido (la NVIDIA): en caliente ningún cuadro de más de 20 ms; en frío, los tirones son del sitio; el costo de verdad')

interface Est { readonly media: number; readonly p95: number; readonly maximo: number; readonly mayoresDe20: number; readonly cuadros: number }
interface DeVsync { readonly frio: Est; readonly calma: Est; readonly maxima: Est; readonly noche: Est; readonly gpuSimulacion: { readonly ms: number } | null; readonly tareaMasLarga: number }
interface DeLibre { readonly calma: Est; readonly maxima: Est; readonly noche: Est }
interface Medido { readonly placa: string; readonly vsync: Readonly<Record<string, DeVsync>>; readonly libre: Readonly<Record<string, DeLibre>>; readonly frioRepetido: Readonly<Record<string, readonly number[]>> }
const MEDIDO = recibo<Medido>('o5-medido.json')
const LAS_BASES = ['polvo-1440', 'polvo-390'] as const
// En caliente (con la sincronía de la pantalla, la de 75 Hz: 13,34 ms): al máximo (la temperatura al tope, scroll, pulsos y cargas) y
// de noche, ningún cuadro de más de 20 ms en ninguna dirección ni ancho.
const enCaliente = (m: Medido): boolean => m.placa.includes('NVIDIA') && [...LAS_SEIS, ...LAS_BASES].every((k) => {
  const r = m.vsync[k]
  return r !== undefined && r.maxima.mayoresDe20 === 0 && r.noche.mayoresDe20 === 0 && r.maxima.maximo <= 20 && r.noche.maximo <= 20 && r.maxima.cuadros > 300
})
const ms = (k: string): string => (MEDIDO.vsync[k] === undefined ? 'falta' : `${MEDIDO.vsync[k].maxima.media.toFixed(2)} (máx. ${String(MEDIDO.vsync[k].maxima.maximo)})`)
afirmar(enCaliente(MEDIDO), `  al máximo y de noche, ningún cuadro de más de 20 ms: A ${ms('a-1440')} y ${ms('a-390')}; B ${ms('b-1440')} y ${ms('b-390')}; C ${ms('c-1440')} y ${ms('c-390')} (1440 y 390); el polvo, ${ms('polvo-1440')}`)
controlPositivo('  el detector VE un cuadro de 22 ms al máximo', { ...MEDIDO, vsync: { ...MEDIDO.vsync, 'c-390': { ...MEDIDO.vsync['c-390'], maxima: { ...MEDIDO.vsync['c-390'].maxima, maximo: 22, mayoresDe20: 1 } } } }, enCaliente)
// La calma: cuando hay un cuadro largo, es el del campo del logo que se publica (lo hornea el polvo con física, siempre montado): el
// polvo solo también lo tiene (o5-campo.ts: el cuadro largo cae justo antes de que el campo quede publicado, con y sin plasma).
const calmaComoLaBase = (m: Medido): boolean => LAS_SEIS.every((k) => (m.vsync[k]?.calma.mayoresDe20 ?? 9) <= 1) && (m.vsync['polvo-1440']?.calma.mayoresDe20 ?? 0) >= 1
afirmar(calmaComoLaBase(MEDIDO), `  en la calma, a lo sumo un cuadro largo (el campo del logo que se publica: el polvo solo también, ${String(MEDIDO.vsync['polvo-1440']?.calma.maximo ?? 0)} ms)`)
controlPositivo('  el detector VE una calma con tirones que no son del campo', { ...MEDIDO, vsync: { ...MEDIDO.vsync, 'a-1440': { ...MEDIDO.vsync['a-1440'], calma: { ...MEDIDO.vsync['a-1440'].calma, mayoresDe20: 6 } } } }, calmaComoLaBase)
// En frío (la primera visita: cachés de shaders, de código y HTTP borradas) el primer scroll rápido tironea con y sin plasma: el
// sitio (las secciones que se montan, el campo del logo). Lo del plasma está armado desde el primer cuadro (la cinta y los efectos
// se dibujan siempre: el precompilado de la escena los arma) y no le suma: el peor de cada dirección queda en lo que dispersa la base.
const peorDeLaBase = Math.max(...(MEDIDO.frioRepetido['polvo-1440'] ?? [0]), MEDIDO.vsync['polvo-390']?.frio.maximo ?? 0)
const frioComoLaBase = (m: Medido): boolean => {
  const mediana = (x: readonly number[]): number => [...x].sort((a, b) => a - b)[Math.floor(x.length / 2)]
  return mediana(m.frioRepetido['b-1440'] ?? [9e9]) <= mediana(m.frioRepetido['polvo-1440'] ?? [0]) * 1.5 && LAS_SEIS.every((k) => (m.vsync[k]?.frio.maximo ?? 9e9) <= Math.max(1300, peorDeLaBase * 1.6))
}
afirmar(frioComoLaBase(MEDIDO), `  en frío, el primer scroll: la base (el polvo) ${(MEDIDO.frioRepetido['polvo-1440'] ?? []).map(String).join(', ')} ms a 1440 (en tres corridas) y ${String(MEDIDO.vsync['polvo-390']?.frio.maximo ?? 0)} a 390; con el plasma, A ${String(MEDIDO.vsync['a-1440']?.frio.maximo ?? 0)}/${String(MEDIDO.vsync['a-390']?.frio.maximo ?? 0)}, B ${(MEDIDO.frioRepetido['b-1440'] ?? []).map(String).join(', ')}/${String(MEDIDO.vsync['b-390']?.frio.maximo ?? 0)}, C ${String(MEDIDO.vsync['c-1440']?.frio.maximo ?? 0)}/${String(MEDIDO.vsync['c-390']?.frio.maximo ?? 0)}: lo mismo que la base`)
controlPositivo('  el detector VE un plasma que duplica el tirón en frío', { ...MEDIDO, frioRepetido: { ...MEDIDO.frioRepetido, 'b-1440': [1500, 1700, 1600] } }, frioComoLaBase)
deudaDeclarada(LAS_SEIS.every((k) => (MEDIDO.vsync[k]?.frio.mayoresDe20 ?? 1) === 0), '  en frío, el primer scroll sin cuadros de más de 20 ms', `la base (sin plasma) tiene ${String(MEDIDO.vsync['polvo-1440']?.frio.mayoresDe20 ?? 0)} a 1440 (hasta ${String(peorDeLaBase)} ms): del sitio (el campo del logo, las secciones que se montan al llegar)`, 'un sprint de la escena de base (el campo del logo y las secciones en la primera visita)')
// El costo de verdad (sin la sincronía: el rAF mide lo que tarda el cuadro): lo que el plasma le suma al polvo solo, por cuadro.
const suma = (m: Medido, d: string, w: number): number => (m.libre[`${d}-${String(w)}`]?.maxima.media ?? 99) - (m.libre[`polvo-${String(w)}`]?.maxima.media ?? 0)
const costoBien = (m: Medido): boolean => (['a', 'b', 'c'] as const).every((d) => ([1440, 390] as const).every((w) => suma(m, d, w) <= 2.5 && (m.libre[`${d}-${String(w)}`]?.maxima.maximo ?? 99) <= 20)) &&
  (['b-1440', 'b-390', 'c-1440', 'c-390'] as const).every((k) => (m.vsync[k]?.gpuSimulacion?.ms ?? 9) <= 0.5)
afirmar(costoBien(MEDIDO), `  sin la sincronía, lo que suma al polvo por cuadro al máximo: A +${suma(MEDIDO, 'a', 1440).toFixed(2)} ms a 1440 (las 600 brasas en la CPU) y +${suma(MEDIDO, 'a', 390).toFixed(2)} a 390; B +${suma(MEDIDO, 'b', 1440).toFixed(2)} y +${suma(MEDIDO, 'b', 390).toFixed(2)}; C +${suma(MEDIDO, 'c', 1440).toFixed(2)} y +${suma(MEDIDO, 'c', 390).toFixed(2)}; la simulación del enjambre en la GPU, ${(MEDIDO.vsync['b-1440']?.gpuSimulacion?.ms ?? 0).toFixed(3)} ms (B, 16.384) y ${(MEDIDO.vsync['c-1440']?.gpuSimulacion?.ms ?? 0).toFixed(3)} ms (C)`)
controlPositivo('  el detector VE una dirección que suma 3 ms por cuadro', { ...MEDIDO, libre: { ...MEDIDO.libre, 'b-1440': { ...MEDIDO.libre['b-1440'], maxima: { ...MEDIDO.libre['b-1440'].maxima, media: (MEDIDO.libre['polvo-1440']?.maxima.media ?? 0) + 3 } } } }, costoBien)

cerrar('s68-pulido-17')
