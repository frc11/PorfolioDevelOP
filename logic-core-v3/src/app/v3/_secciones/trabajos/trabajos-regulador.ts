/**
 * §24 DEL INVARIANTE DE TRABAJOS — **el regulador: la ráfaga, la garantía y el cartel.**
 *
 * Tres pedidos del mismo sprint, y los tres son sobre el valor que el túnel
 * MUESTRA y no sobre el scroll:
 *
 *   · con muchos scrolls seguidos el túnel no se dispara (la ráfaga): en su
 *     primer segundo no recorre más de un tercio del túnel —lo que da la
 *     velocidad máxima— y no tironea: ni una ráfaga detrás de otra, ni un scroll
 *     que salta en un cuadro, ni un foco que cambia lo hacen ir y volver;
 *   · al despinearse —para abajo o para arriba— el efecto nunca quedó a medio
 *     camino (la garantía), a cualquier velocidad, con el freno puesto o no, y
 *     aun con el cuadro de atraso que hay entre el scroll y lo pintado;
 *   · subiendo, el cartel no vuelve hasta que las capas del túnel están en 0 (la
 *     histéresis), porque los dos leen el MISMO valor amortiguado.
 *
 * Se afirman simulando el lazo con las funciones puras de `regulador.ts` a 60
 * cuadros por segundo. La simulación no es el sitio: la ráfaga real la mide
 * `scripts-b4/s10-rafaga.ts`, y de ahí salen la forma de la ráfaga y la
 * velocidad de página más alta que se usan acá.
 *
 * ⚠ Vive en su propio archivo por la regla de las 300 líneas, con el mismo corte
 * por TEMA que `trabajos-ventanas.ts`.
 */

import { afirmar, afirmarIgual, controlPositivo } from '../../_lib/__tests__/afirmar'
import { leer } from '../_invariantes/soporte'
import {
  BANDA_DEL_EFECTO,
  CARTEL,
  HUIDA_DEL_CARTEL,
  PX_DE_LA_APROXIMACION,
  PX_DE_LA_SECCION,
  PX_DE_UNA_RAFAGA,
  arranqueDeDemos,
  enLaVentana,
  fraccionDeScroll,
  progresoDeLaVentana,
  pxDeLaSeccion,
  pxDelTunelEn,
} from './geometria'
import {
  ATRASO_DEL_RESORTE_PX,
  VELOCIDAD_MAXIMA_DEL_EFECTO_PX_S,
  avanzarLoMostrado,
  enElRiel,
  reposoEn,
  type BandaDelEfecto,
  type EstadoDelTunelMostrado,
} from './regulador'
import {
  ANCHO_CON_EL_ROTULO_ENTERO,
  PX_DEL_TUNEL,
  RESORTE_DEL_ESCENARIO,
  avanzarElResorte,
  huidaConHisteresis,
  poseDelTunel,
  pxParaQueElProyectoMida,
  zetaDe,
} from './tunel'
import { recorridoDelResorte, type EstadoDeUnResorte } from './trabajos-piezas'

const DT = 1000 / 60
const VEL = VELOCIDAD_MAXIMA_DEL_EFECTO_PX_S
const ARRANQUE = pxDeLaSeccion(HUIDA_DEL_CARTEL.bajando.desde)
/** Una banda que no ata a nada: el control de la garantía. */
const SUELTA: BandaDelEfecto = { piso: [{ scroll: 0, efecto: -1e9 }], techo: [{ scroll: 0, efecto: 1e9 }] }
/** Las velocidades del barrido, en px de scroll por segundo: de lento a imposible. */
const VELOCIDADES = [300, 450, 1000, 1650, 3000, 20000]
/** La página más rápida que midió `s10-rafaga` con muescas cada 15 ms, en px/s. */
const VELOCIDAD_DE_PAGINA_MEDIDA = 1890

/**
 * El scroll de una ráfaga de 10 muescas, con la forma que MIDIÓ `s10-rafaga`: el
 * scroll suave del sitio las reparte en ~0,9 s y no parejo —arranca y frena, con
 * un pico de ~1.650 px/s en el medio—. Una rampa pareja escondía el quiebre.
 */
const MS_DE_LA_RAFAGA = 900
const scrollDeLaRafaga = (ms: number): number => {
  const u = Math.min(1, Math.max(0, ms / MS_DE_LA_RAFAGA))
  return PX_DE_UNA_RAFAGA * u * u * (3 - 2 * u)
}

/**
 * `cuantas` ráfagas pegadas desde el arranque del túnel: cuánto túnel se ve en el
 * primer segundo, a qué pico, si tocó un riel, y la velocidad más baja desde que
 * llegó al tope mientras el objetivo sigue atrás del scroll —ahí un quiebre se ve—.
 */
function lasRafagas(cuantas: number, velocidadMaxima: number = VEL, banda: BandaDelEfecto = BANDA_DEL_EFECTO): {
  readonly enUnSegundo: number
  readonly pico: number
  readonly tocoUnRiel: boolean
  readonly minimoSaturado: number
} {
  let e = reposoEn(ARRANQUE)
  let pico = 0
  let enUnSegundo = 0
  let tocoUnRiel = false
  let llego = false
  let minimoSaturado = Number.POSITIVE_INFINITY
  for (let t = DT; t <= 6000 + 1e-9; t += DT) {
    let scroll = ARRANQUE
    for (let r = 0; r < cuantas; r += 1) scroll += scrollDeLaRafaga(t - r * MS_DE_LA_RAFAGA)
    const antes = e.tunel.posicion
    const libre = avanzarLoMostrado(e, scroll, DT, SUELTA, false, 0, velocidadMaxima)
    e = avanzarLoMostrado(e, scroll, DT, banda, false, 0, velocidadMaxima)
    tocoUnRiel ||= libre.tunel.posicion !== e.tunel.posicion
    const v = ((e.tunel.posicion - antes) / DT) * 1000
    pico = Math.max(pico, v)
    llego ||= v >= 0.95 * velocidadMaxima
    if (llego && e.objetivo < scroll - 1) minimoSaturado = Math.min(minimoSaturado, v)
    if (t <= 1000 + 1e-9) enUnSegundo = (e.tunel.posicion - ARRANQUE) / PX_DEL_TUNEL
  }
  return { enUnSegundo, pico, tocoUnRiel, minimoSaturado }
}

/**
 * De punta a punta de la sección a velocidad constante, y devuelve lo mostrado en
 * el cuadro que cruza el despineado. El recorrido se alinea para que ese cuadro lo
 * cruce por un pelo, que es el peor caso; con `conAtraso` el regulador ve el scroll
 * del cuadro ANTERIOR, que es el atraso medido entre el scroll y lo pintado.
 */
function recorrer(v: number, sentido: 'bajando' | 'subiendo', banda: BandaDelEfecto, frenando: boolean, conAtraso = false): {
  readonly final: EstadoDelTunelMostrado
  readonly huida: number
  readonly tocoUnRiel: boolean
} {
  const porCuadro = (v * DT) / 1000
  const signo = sentido === 'bajando' ? 1 : -1
  const borde = sentido === 'bajando' ? PX_DE_LA_SECCION : PX_DE_LA_APROXIMACION
  const n = Math.ceil((sentido === 'bajando' ? PX_DE_LA_SECCION : PX_DE_LA_SECCION - PX_DE_LA_APROXIMACION) / porCuadro)
  const scrollEn = (k: number): number => borde + signo * 1e-3 - signo * (n - k) * porCuadro
  let e = reposoEn(scrollEn(0))
  let huida = sentido === 'bajando' ? 0 : 1
  let tocoUnRiel = false
  for (let k = 1; k <= n; k += 1) {
    const visto = scrollEn(conAtraso ? k - 1 : k)
    const libre = avanzarLoMostrado(e, visto, DT, SUELTA, frenando)
    e = avanzarLoMostrado(e, visto, DT, banda, frenando)
    tocoUnRiel ||= libre.objetivo !== e.objetivo || libre.tunel.posicion !== e.tunel.posicion || libre.escenario.posicion !== e.escenario.posicion
    huida = huidaConHisteresis(huida, fraccionDeScroll(e.tunel.posicion), HUIDA_DEL_CARTEL)
  }
  return { final: e, huida, tocoUnRiel }
}

/** Cuántas veces una traza da vuelta el sentido, y su velocidad más alta en px/s. */
function movimiento(traza: readonly number[]): { readonly vueltas: number; readonly pico: number } {
  let vueltas = 0
  let pico = 0
  let sentido = 0
  for (let i = 1; i < traza.length; i += 1) {
    const d = traza[i] - traza[i - 1]
    pico = Math.max(pico, (Math.abs(d) / DT) * 1000)
    if (Math.abs(d) < 1e-6) continue
    if (sentido !== 0 && Math.sign(d) !== sentido) vueltas += 1
    sentido = Math.sign(d)
  }
  return { vueltas, pico }
}

/** Lo mostrado durante 8 s desde un estado, con la página quieta en `pagina`. */
function traza(e0: EstadoDelTunelMostrado, pagina: number, pisoDelFoco: number): number[] {
  let e = e0
  const puntos = [e.tunel.posicion]
  for (let t = 0; t < 8000; t += DT) {
    e = avanzarLoMostrado(e, pagina, DT, BANDA_DEL_EFECTO, false, pisoDelFoco)
    puntos.push(e.tunel.posicion)
  }
  return puntos
}

export function afirmarElRegulador(cuantas: number): void {
  const REGULADOR = leer('src/app/v3/_secciones/trabajos/regulador.ts')
  const CAPA = leer('src/app/v3/_secciones/trabajos/CapaDelTunel.tsx')
  const TRABAJOS = leer('src/app/v3/_secciones/trabajos/Trabajos.tsx')
  const PIEZAS = leer('src/app/v3/_secciones/trabajos/piezas.tsx')

  // ── LA CONSTANTE, A MANO Y CON SU LÍNEA ────────────────────────────────
  const aMano = (src: string): boolean => /export const VELOCIDAD_MAXIMA_DEL_EFECTO_PX_S = \d+ \/\/ aflojarlo = subirlo/.test(src)
  afirmar(aMano(REGULADOR), `la velocidad máxima del efecto está escrita a mano, con su línea: ${VEL} px/s`)
  controlPositivo('el detector vería la constante derivada', 'export const VELOCIDAD_MAXIMA_DEL_EFECTO_PX_S = PX_DEL_TUNEL / 3', aMano)

  // ── EL RESORTE DEL ESCENARIO ES EL DE ELLOS, Y ES EL QUE LO MUEVE ──────
  afirmarIgual(
    zetaDe(RESORTE_DEL_ESCENARIO).toFixed(2),
    '1.34',
    `el escenario lleva el resorte de la referencia —rigidez ${RESORTE_DEL_ESCENARIO.rigidez}, amortiguamiento ${RESORTE_DEL_ESCENARIO.amortiguamiento}—: ζ = 1,34, y las demás capas siguen en 3,41`,
  )
  const hacia1 = (e: EstadoDeUnResorte, dt: number): EstadoDeUnResorte => avanzarElResorte(e, 1, dt, RESORTE_DEL_ESCENARIO)
  afirmar(recorridoDelResorte(3000, DT, hacia1).maximo <= 1, '  y tampoco rebota: sobreamortiguado, en 3 s de escalón no pasa del objetivo')
  const unPaso = avanzarLoMostrado(reposoEn(ARRANQUE), ARRANQUE + 200, DT, BANDA_DEL_EFECTO, false)
  const conElSuyo = (e: EstadoDelTunelMostrado): boolean =>
    e.escenario.posicion === avanzarElResorte({ posicion: ARRANQUE, velocidad: 0 }, e.objetivo, DT, RESORTE_DEL_ESCENARIO).posicion &&
    e.escenario.posicion !== e.tunel.posicion
  afirmar(conElSuyo(unPaso), '  y el regulador mueve al escenario con ése y a las capas con el del túnel: un cuadro después de arrancar ya van en dos píxeles distintos')
  controlPositivo('  el detector vería el escenario movido por el resorte del túnel', { ...unPaso, escenario: unPaso.tunel }, conElSuyo)
  const pintaLosDos = (src: string): boolean => src.includes('pintar(fraccionDeScroll(e.tunel.posicion), fraccionDeScroll(e.escenario.posicion))')
  afirmar(pintaLosDos(CAPA), '  y el lazo pinta el escenario con SU resorte, no con el de las capas')
  controlPositivo('  el detector vería un lazo que pinta los dos con el mismo', 'pintar(fraccionDeScroll(e.tunel.posicion), fraccionDeScroll(e.tunel.posicion))', pintaLosDos)

  // ── LA RÁFAGA ──────────────────────────────────────────────────────────
  const tope = VEL / PX_DEL_TUNEL
  const una = lasRafagas(1)
  afirmar(una.enUnSegundo <= tope, `una ráfaga de 10 muescas recorre en su primer segundo ${(una.enUnSegundo * 100).toFixed(1)} % del túnel: no más de ${(tope * 100).toFixed(1)} %, lo que da la velocidad máxima`)
  afirmar(una.pico <= VEL + 1e-6, `  y lo mostrado nunca corre más que el efecto: pico de ${una.pico.toFixed(0)} px/s contra ${VEL}`)
  controlPositivo('el chequeo de la ráfaga vería el túnel sin tope, que es el de antes', Number.POSITIVE_INFINITY, (v: number) => lasRafagas(1, v).enUnSegundo <= tope)
  afirmar(!una.tocoUnRiel, `  y el piso deja pasar una ráfaga entera sin tocarla: ${PX_DE_UNA_RAFAGA} px de aire en el arranque del túnel`)
  const pisoSinLaRafaga: BandaDelEfecto = {
    ...BANDA_DEL_EFECTO,
    piso: BANDA_DEL_EFECTO.piso.map((p, i) => (i === 0 ? { ...p, scroll: p.efecto + ATRASO_DEL_RESORTE_PX } : p)),
  }
  controlPositivo('  el chequeo vería el piso con sólo el aire del resorte, que la ráfaga alcanza a los 350 ms', pisoSinLaRafaga, (b: BandaDelEfecto) => !lasRafagas(1, VEL, b).tocoUnRiel)
  const tres = lasRafagas(3)
  afirmar(
    tres.minimoSaturado >= 0.9 * VEL,
    `tres ráfagas pegadas SÍ tocan el piso, y el túnel no tironea: desde que llega al tope no baja de ${tres.minimoSaturado.toFixed(0)} px/s mientras el scroll sigue adelante`,
  )
  controlPositivo('  el chequeo vería el quiebre de cuando el riel soltaba al resorte en reposo (255 px/s)', 255, (v: number) => v >= 0.9 * VEL)

  // ── UN RESORTE QUE TOCA UN RIEL LO LLEVA EL RIEL, HASTA LA VELOCIDAD MÁXIMA ─
  const pisoEn = (s: number): number => enElRiel(BANDA_DEL_EFECTO.piso, s)
  const debajo = (antes: number): EstadoDelTunelMostrado => ({
    scroll: antes,
    levantado: 0,
    objetivo: pisoEn(antes),
    tunel: { posicion: pisoEn(antes) - 300, velocidad: 0 },
    escenario: { posicion: pisoEn(antes) - 300, velocidad: 0 },
  })
  const lento = avanzarLoMostrado(debajo(3990), 4000, DT, BANDA_DEL_EFECTO, false).tunel
  const delRiel = ((pisoEn(4000) - pisoEn(3990)) / DT) * 1000
  const loLleva = (r: EstadoDeUnResorte): boolean => r.posicion === pisoEn(4000) && Math.abs(r.velocidad - delRiel) < 1e-6
  afirmar(loLleva(lento), `un resorte que el piso alcanza sale con la velocidad del riel (${delRiel.toFixed(0)} px/s) y no en reposo: al soltarlo no hay quiebre`)
  controlPositivo('  el detector vería el resorte soltado en reposo', { ...lento, velocidad: 0 }, loLleva)
  const rapido = avanzarLoMostrado(debajo(3950), 4000, DT, BANDA_DEL_EFECTO, false).tunel
  afirmar(rapido.velocidad === VEL, `  y nunca más rápido que el efecto: con el riel a ${(((pisoEn(4000) - pisoEn(3950)) / DT) * 1000).toFixed(0)} px/s sale a ${rapido.velocidad} px/s`)

  // ── UN SALTO DE UN CUADRO O UN FOCO QUE CAMBIA NO LANZAN AL TÚNEL ───────
  const cta = ARRANQUE + PX_DEL_TUNEL
  const captura = ARRANQUE + pxParaQueElProyectoMida(cuantas - 1, ANCHO_CON_EL_ROTULO_ENTERO)
  const enfocado = (pagina: number, piso: number): EstadoDelTunelMostrado => {
    let e = reposoEn(Math.max(pagina, piso), piso)
    for (let t = 0; t < 2000; t += DT) e = avanzarLoMostrado(e, pagina, DT, BANDA_DEL_EFECTO, false, piso)
    return e
  }
  const casos: readonly [string, number[]][] = [
    ['un salto de 1.500 a 2.700 en un cuadro', traza(avanzarLoMostrado(reposoEn(1500), 2700, DT, BANDA_DEL_EFECTO, false), 2700, 0)],
    ['un salto de 1.200 a 4.000', traza(avanzarLoMostrado(reposoEn(1200), 4000, DT, BANDA_DEL_EFECTO, false), 4000, 0)],
    ['un salto para arriba de 4.200 a 2.300', traza(avanzarLoMostrado(reposoEn(4200), 2300, DT, BANDA_DEL_EFECTO, false), 2300, 0)],
    ['soltar el foco del CTA con la página en 2.700', traza(enfocado(2700, cta), 2700, 0)],
    ['pasar el foco del CTA a la última captura', traza(enfocado(2000, cta), 2000, captura)],
    ['soltar el foco de la última captura', traza(enfocado(2000, captura), 2000, 0)],
  ]
  for (const [caso, puntos] of casos) {
    const m = movimiento(puntos)
    afirmar(m.vueltas === 0 && m.pico <= VEL + 1e-6, `${caso}: lo mostrado va en UN sentido (${m.vueltas} vueltas) y a lo sumo a ${m.pico.toFixed(0)} px/s`)
  }
  controlPositivo('  el detector vería el túnel que se pasa y vuelve', [0, 40, 80, 60, 50], (p: number[]) => movimiento(p).vueltas === 0)

  // ── LA GARANTÍA: AL DESPINEARSE, NADA A MEDIO CAMINO ───────────────────
  const demos = pxDeLaSeccion(arranqueDeDemos(cuantas))
  const vuelta = pxDeLaSeccion(HUIDA_DEL_CARTEL.subiendo.desde)
  const terminado = (e: EstadoDelTunelMostrado): boolean => e.tunel.posicion >= demos && e.escenario.posicion >= demos
  const deVuelta = (r: { final: EstadoDelTunelMostrado; huida: number }): boolean => r.final.tunel.posicion <= vuelta + 1e-6 && r.huida === 0
  for (const v of VELOCIDADES) {
    for (const frenando of [false, true]) {
      const abajo = recorrer(v, 'bajando', BANDA_DEL_EFECTO, frenando).final
      afirmar(terminado(abajo), `bajando a ${v} px/s${frenando ? ' con el freno puesto TODO el camino' : ''}: al despinearse lo mostrado está en ${abajo.tunel.posicion.toFixed(0)}, en los demos (${demos}): túnel y salida terminados`)
    }
    const arriba = recorrer(v, 'subiendo', BANDA_DEL_EFECTO, false)
    afirmar(deVuelta(arriba), `subiendo a ${v} px/s: al despinearse arriba lo mostrado está en ${arriba.final.tunel.posicion.toFixed(0)} (≤ ${vuelta.toFixed(0)}): túnel en 0 y el cartel entero`)
  }
  controlPositivo('el chequeo de la garantía vería una banda que no ata a nada', SUELTA, (b: BandaDelEfecto) => VELOCIDADES.every((v) => terminado(recorrer(v, 'bajando', b, false).final)))
  for (const v of [1000, VELOCIDAD_DE_PAGINA_MEDIDA, 3000, 6000]) {
    afirmar(
      terminado(recorrer(v, 'bajando', BANDA_DEL_EFECTO, false, true).final) && deVuelta(recorrer(v, 'subiendo', BANDA_DEL_EFECTO, false, true)),
      `  y con un cuadro de atraso entre el scroll y lo pintado, a ${v} px/s, se cumple igual en los dos sentidos: los rieles llegan una muesca antes`,
    )
  }
  controlPositivo('  el chequeo del atraso vería un cuadro más largo que la muesca de margen (12.000 px/s)', 12000, (v: number) => terminado(recorrer(v, 'bajando', BANDA_DEL_EFECTO, false, true).final))
  for (const v of VELOCIDADES.filter((x) => x < VEL)) {
    afirmar(
      !recorrer(v, 'bajando', BANDA_DEL_EFECTO, false).tocoUnRiel && !recorrer(v, 'subiendo', BANDA_DEL_EFECTO, false).tocoUnRiel,
      `a ${v} px/s, más lento que el efecto, nadie toca un riel en ningún sentido: los rieles dejan ${ATRASO_DEL_RESORTE_PX.toFixed(1)} px de aire`,
    )
  }
  controlPositivo('  el detector de rieles vería a alguien más rápido que el efecto', 3000, (v: number) => !recorrer(v, 'bajando', BANDA_DEL_EFECTO, false).tocoUnRiel)

  // ── EL FRENO: EL OBJETIVO Y LOS DOS RESORTES QUIETOS Y EN REPOSO ────────
  const enMarcha: EstadoDelTunelMostrado = { scroll: 2690, levantado: 0, objetivo: 2600, tunel: { posicion: 2500, velocidad: 300 }, escenario: { posicion: 2550, velocidad: 200 } }
  const quieto = (e: EstadoDelTunelMostrado): boolean =>
    e.objetivo === enMarcha.objetivo && e.tunel.posicion === 2500 && e.tunel.velocidad === 0 && e.escenario.posicion === 2550 && e.escenario.velocidad === 0
  afirmar(quieto(avanzarLoMostrado(enMarcha, 2700, DT, BANDA_DEL_EFECTO, true)), 'mientras frena, el objetivo y los dos resortes quedan quietos y en reposo —velocidad cero—: al soltar retoman desde ahí y no saltan')
  controlPositivo('  el detector vería un freno que deja correr a los resortes', avanzarLoMostrado(enMarcha, 2700, DT, BANDA_DEL_EFECTO, false), quieto)
  const pasaElFreno = (src: string): boolean =>
    src.includes('avanzarLoMostrado(estado.current, pagina, dt, ritmo.banda, frenaSiCorresponde(ahora), pxDeLaSeccion(pisoDelFoco()))')
  afirmar(pasaElFreno(CAPA), '  y el lazo le pasa al regulador el scroll de la página, el freno y el piso del foco, con la banda de su ancho')
  controlPositivo('  el detector vería un lazo que frena fuera del regulador', 'avanzarLoMostrado(estado.current, pagina, dt, ritmo.banda, false, pxDeLaSeccion(pisoDelFoco()))', pasaElFreno)

  // ── LA HISTÉRESIS DEL CARTEL ────────────────────────────────────────────
  afirmarIgual(
    [HUIDA_DEL_CARTEL.bajando.desde, HUIDA_DEL_CARTEL.bajando.hasta],
    [progresoDeLaVentana(CARTEL, CARTEL.huirDesde ?? 1), CARTEL.hasta],
    'bajando, el cartel huye en la ventana de siempre: (c) no cambia',
  )
  const pasos = Array.from({ length: 2001 }, (_, i) => i / 2000)
  const sinVolverEncima = (ley: (anterior: number, p: number) => number): boolean => {
    let h = 1
    for (const p of [...pasos].reverse()) {
      h = ley(h, p)
      const pose = poseDelTunel(pxDelTunelEn(p))
      if (h < 1 && (pose.proyectos.some((s) => s > 0) || pose.cta > 0)) return false
    }
    return h === 0
  }
  afirmar(sinVolverEncima((a, p) => huidaConHisteresis(a, p, HUIDA_DEL_CARTEL)), 'subiendo, el cartel no empieza a volver hasta que las tres capturas y el CTA están en escala 0, y termina entero')
  controlPositivo('  el chequeo vería la huida sin histéresis, que desanda en la misma ventana', (_a: number, p: number) => enLaVentana(p, HUIDA_DEL_CARTEL.bajando), sinVolverEncima)
  let h = 0
  let salto = 0
  for (const p of [...pasos.filter((x) => x <= 0.3), ...pasos.filter((x) => x <= 0.3).reverse()]) {
    const nueva = huidaConHisteresis(h, p, HUIDA_DEL_CARTEL)
    salto = Math.max(salto, Math.abs(nueva - h))
    h = nueva
  }
  afirmar(salto < 0.05, `  y dar vuelta el gesto a mitad de la huida no salta: el paso más grande es ${salto.toFixed(4)} de la huida`)

  // ── LOS DOS LEEN EL MISMO VALOR ─────────────────────────────────────────
  const unSoloValor = (trabajos: string, piezas: string): boolean =>
    (trabajos.match(/useMotionValue\(/g) ?? []).length === 1 &&
    trabajos.includes('<PortadaDeTrabajos seccion={seccion} progreso={progreso} mostrado={mostrado} />') &&
    /<CapaDelTunel progreso=\{progreso\} mostrado=\{mostrado\}/.test(trabajos) &&
    piezas.includes("useMotionValueEvent(mostrado, 'change'") &&
    piezas.includes('huidaConHisteresis(huida.current, p, HUIDA_DEL_CARTEL)')
  afirmar(unSoloValor(TRABAJOS, PIEZAS), 'el cartel y el túnel leen UN valor: lo crea `Trabajos`, lo escribe el túnel y la huida lo lee con histéresis')
  controlPositivo('  el detector vería un cartel que sigue leyendo el scroll', PIEZAS.replace("useMotionValueEvent(mostrado, 'change'", "useMotionValueEvent(progreso, 'change'"), (p: string) => unSoloValor(TRABAJOS, p))
  afirmar(CAPA.includes('mostrado.set(fraccionDeScroll(e.tunel.posicion))'), '  y lo que el túnel publica es lo que su resorte muestra, no el scroll')
  const inicialFijo = (src: string): boolean => src.includes('const [huidaInicial] = useState(() => enLaVentana(progreso.get(), HUIDA_DEL_CARTEL.bajando))')
  afirmar(inicialFijo(PIEZAS), '  y la pose del primer cuadro se calcula UNA vez: un re-render sin scroll no le escribe encima a la histéresis')
  controlPositivo('  el detector vería la pose inicial recalculada en cada render', 'const huidaInicial = enLaVentana(progreso.get(), HUIDA_DEL_CARTEL.bajando)', inicialFijo)
}
