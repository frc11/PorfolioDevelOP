/**
 * PULIDO 19 — TERMINACIÓN DE LA ESCENA (`docs/rediseno/SPRINT-PULIDO-19.md`). Cada cosa con su control positivo (el detector ve el
 * estado de antes o uno roto a propósito).
 *   Q1.b · el dominio de la vista: el plasma cubre el cuadro en cualquier encuadre (la siembra, el envoltorio periódico, el reparto).
 *   Q1.c · nada aparece ni desaparece de golpe: el brillo de cada brasa cambia a lo sumo un tope por cuadro, salvo en un evento (una
 *          que reaparece por una cara del dominio o nace en su celda nueva), que sólo pasa fuera del cuadro o ya apagada.
 *   Q1.d · la red en reposo: quieta se arma (hasta tres enlaces por brasa, cortos en el mundo y en el cuadro, del centro hacia afuera),
 *          frena a las brasas, se corta en cascada con un gesto (en `corteS`, con el chasquido) y nunca se arma en el final del pie.
 */
import { readFileSync } from 'node:fs'

import { BRASAS, azarConSemilla, crearBrasas, crearEntradaDeLasBrasas, type Brasas } from '../escena/energia/brasas'
import { CELDAS_DEL_REPARTO, DOMINIO, alfaDelDominio, armarElDominio, coordenadas, crearDominio, objetivosDelReparto, poblar, repartir, type Dominio } from '../escena/energia/dominio'
import { pasoDeLasBrasas } from '../escena/energia/paso'
import { REPOSO, crearMemoriaDelGesto, crearRed, leerElGesto, pasoDeLaRed, type Red } from '../escena/energia/reposo'
import { FRAGMENTOS_DE_LA_RED, VERTICES_DE_LA_RED } from '../escena/energia/dibujo/red'
import { brilloPorDensidad } from '../escena/energia/vecinas'
import { FLOOR_Y } from '../escena/probeScene'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { lineasDeCodigo, sinReservasEn } from './s69-ayudas'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const DT = 1 / 60
const N = 900

// ═══════════════════════════════════════════════════════════════════════════
titulo('Q1.b · El dominio de la vista: la siembra, el envoltorio periódico y el reparto cubren el cuadro en cualquier encuadre')

/** Una pose como las del recorrido (azimut en grados, altura, distancia; mirando al origen): la cámara del dominio, sin three. */
function poner(d: Dominio, azimutGrados: number, altura: number, distancia: number, aspecto = 1.6): void {
  const az = (azimutGrados * Math.PI) / 180
  const o = [Math.sin(az) * distancia, altura, Math.cos(az) * distancia]
  const largo = Math.hypot(o[0], o[1], o[2])
  const f = [-o[0] / largo, -o[1] / largo, -o[2] / largo]
  // derecha = adelante × arriba del mundo; arriba = derecha × adelante.
  const r0 = [f[1] * 0 - f[2] * 1, f[2] * 0 - f[0] * 0, f[0] * 1 - f[1] * 0]
  const lr = Math.hypot(r0[0], r0[1], r0[2])
  const r = [r0[0] / lr, r0[1] / lr, r0[2] / lr]
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
  for (let e = 0; e < 3; e += 1) {
    d.o[e] = o[e]
    d.r[e] = r[e]
    d.u[e] = u[e]
    d.f[e] = f[e]
  }
  armarElDominio(d, 35, aspecto, largo, FLOOR_Y)
}

/**
 * Cuántas brasas hay en cada celda del cuadro (adentro del dominio) respecto de lo que le toca (por el aire que mira: una celda que mira
 * el piso de cerca pide menos), en centésimos; las celdas que no llegan por encima del piso, −1 (no cuentan).
 */
function porCelda(d: Dominio, b: Brasas): Int32Array {
  const [nx, ny] = DOMINIO.reparto.celdas
  const cuenta = new Int32Array(CELDAS_DEL_REPARTO)
  const objetivo = new Float32Array(CELDAS_DEL_REPARTO)
  objetivosDelReparto(d, b.n, objetivo)
  for (let i = 0; i < b.n; i += 1) {
    const c = coordenadas(d, b.lugar[i * 3], b.lugar[i * 3 + 1], b.lugar[i * 3 + 2])
    if (c.w <= d.w0 || c.w >= d.w1 || Math.abs(c.u) > 1 || Math.abs(c.v) > 1) continue
    cuenta[Math.min(ny - 1, Math.floor(((c.v + 1) / 2) * ny)) * nx + Math.min(nx - 1, Math.floor(((c.u + 1) / 2) * nx))] += 1
  }
  // Las celdas a las que les tocan menos de 2 brasas (un piso cercano: casi sin aire) no cuentan.
  for (let k = 0; k < cuenta.length; k += 1) cuenta[k] = objetivo[k] >= 2 ? Math.round((100 * cuenta[k]) / objetivo[k]) : -1
  return cuenta
}
/** Cubierto: cada celda alcanzable tiene al menos `minimo` centésimos de lo que le toca, y hay celdas alcanzables de sobra. */
const cubierto = (cuenta: Int32Array, minimo = 35): boolean => cuenta.every((c) => c < 0 || c >= minimo) && cuenta.filter((c) => c >= 0).length >= cuenta.length * 0.7

const sembrada = (azimut: number, altura: number, distancia: number, aspecto: number, todas: boolean): Int32Array => {
  const az = azarConSemilla(5)
  const b = crearBrasas(N, az, FLOOR_Y)
  const d = crearDominio()
  poner(d, azimut, altura, distancia, aspecto)
  poblar(d, b, az, todas)
  // Un segundo de reparto (sin física): la siembra es al azar y una celda chica puede salir corta; el reparto la completa enseguida.
  for (let k = 0; k < 60; k += 1) repartir(d, b, az)
  return porCelda(d, b)
}
const HERO = sembrada(0, 6.4, 19, 1.6, true)
const LEJOS = sembrada(360, 5, 40, 1.6, true)
const TELEFONO = sembrada(0, 6.4, 19, 390 / 844, true)
const NUMEROS = sembrada(130, -3.6, 14, 1.6, true)
afirmar([HERO, LEJOS, TELEFONO, NUMEROS].every((c) => cubierto(c)), `  la siembra y un segundo de reparto cubren las ${String(CELDAS_DEL_REPARTO)} celdas del cuadro (cada una con al menos el 35 % de lo que le toca por el aire que mira), en el hero, en el cierre (a 40 u), en el teléfono y en Números (bajo y de costado): la celda alcanzable más vacía tiene el ${String(Math.min(...[HERO, LEJOS, TELEFONO, NUMEROS].map((c) => Math.min(...c.filter((x) => x >= 0)))))} %`)
controlPositivo('  el detector VE la siembra de antes (la esfera alrededor del logo) en el cierre: el centro lleno y los bordes vacíos', sembrada(360, 5, 40, 1.6, false), cubierto)

// ═══════════════════════════════════════════════════════════════════════════
titulo('Q1.c · Nada aparece ni desaparece de golpe: el brillo cambia a lo sumo un tope por cuadro, salvo en un evento fuera del cuadro o ya apagada')

/** Lo que una corrida deja por cuadro: las violaciones (cuadro, brasa, el salto), los eventos y lo cubierto al final. */
interface Corrida {
  readonly violaciones: readonly (readonly [number, number, number])[]
  readonly eventos: number
  readonly eventosAdentro: number
  readonly saltoMaximo: number
  readonly cubiertoAlFinal: boolean
  readonly mudadas: number
}

/** El tope de cambio del brillo por cuadro: el de la vida más el de la densidad (perseguida con inercia, de a cuatro cuadros). */
const TOPE = DT / DOMINIO.fundidoS + (1 - Math.exp((-4 * DT) / BRASAS.densidad.suavizaS)) * 0.6 + 1e-4
/** Un evento vale si la brasa estaba fuera del cuadro (no se veía) o ya apagada (brillo ≤ esto). */
const APAGADA = 0.15

/**
 * Una corrida de `segundos` con la cámara en `pose(t)` (órbita y viaje) y la física entera: cada cuadro, el paso, el reparto y el
 * brillo; después, el salto de cada brasa contra el cuadro anterior. `sabotaje`, si lo hay, toca las brasas después del brillo.
 */
function corrida(segundos: number, pose: (t: number, d: Dominio) => void, sabotaje: ((b: Brasas, k: number) => void) | null = null): Corrida {
  const az = azarConSemilla(11)
  const b = crearBrasas(N, az, FLOOR_Y)
  const en = crearEntradaDeLasBrasas()
  en.piso = FLOOR_Y
  const d = crearDominio()
  en.dominio = d
  pose(0, d)
  poblar(d, b, az, true)
  for (let i = 0; i < b.n; i += 1) b.vida[i] = alfaDelDominio(d, b.lugar[i * 3], b.lugar[i * 3 + 1], b.lugar[i * 3 + 2])
  brilloPorDensidad(b, DT)
  const antes = new Float32Array(b.brillo)
  const adentroAntes = new Uint8Array(b.n)
  const adentro = (i: number): boolean => {
    const c = coordenadas(d, b.lugar[i * 3], b.lugar[i * 3 + 1], b.lugar[i * 3 + 2])
    return c.w > d.w0 && c.w < d.w1 && Math.abs(c.u) <= 1 && Math.abs(c.v) <= 1
  }
  for (let i = 0; i < b.n; i += 1) adentroAntes[i] = adentro(i) ? 1 : 0
  const violaciones: [number, number, number][] = []
  let eventos = 0
  let eventosAdentro = 0
  let saltoMaximo = 0
  let mudadas = 0
  const cuadros = Math.round(segundos / DT)
  for (let k = 1; k <= cuadros; k += 1) {
    const t = k * DT
    en.tiempo = t
    en.temperatura = 0.3
    pose(t, d)
    pasoDeLasBrasas(b, DT, en, az)
    mudadas += repartir(d, b, az)
    brilloPorDensidad(b, DT)
    sabotaje?.(b, k)
    for (let i = 0; i < b.n; i += 1) {
      const salto = Math.abs(b.brillo[i] - antes[i])
      if (b.eventos[i] === 1) {
        eventos += 1
        // Un evento adentro del cuadro y encendida: un pop con nombre.
        if (adentroAntes[i] === 1 && antes[i] > APAGADA) {
          eventosAdentro += 1
          violaciones.push([k, i, salto])
        }
      } else {
        saltoMaximo = Math.max(saltoMaximo, salto)
        if (salto > TOPE) violaciones.push([k, i, salto])
      }
      antes[i] = b.brillo[i]
      adentroAntes[i] = adentro(i) ? 1 : 0
    }
  }
  return { violaciones, eventos, eventosAdentro, saltoMaximo, cubiertoAlFinal: cubierto(porCelda(d, b), 25), mudadas }
}

/** El recorrido de la prueba: 4 s de órbita (0° a 170°, con la altura que baja) y después el viaje al cierre (a 40 u) en 3 s; el resto, quieta. */
const recorrido = (t: number, d: Dominio): void => {
  const orbita = Math.min(1, t / 4)
  const viaje = Math.min(1, Math.max(0, (t - 4) / 3))
  poner(d, 170 * orbita + 190 * viaje, 6.4 - 10 * orbita + 8.6 * viaje, 19 - 5 * orbita + 26 * viaje)
}
const SANA = corrida(10, recorrido)
const sinPops = (c: Corrida): boolean => c.violaciones.length === 0 && c.eventos > 50 && c.eventosAdentro === 0 && c.cubiertoAlFinal && c.mudadas > 0
afirmar(sinPops(SANA), `  10 s de órbita y viaje al cierre (${String(N)} brasas): ${String(SANA.eventos)} eventos (reapariciones y mudanzas, ${String(SANA.mudadas)} mudadas), todos fuera del cuadro o apagadas; fuera de ellos, el salto más grande de brillo por cuadro es ${SANA.saltoMaximo.toFixed(3)} (tope ${TOPE.toFixed(3)}); al llegar, el cuadro cubierto`)
controlPositivo('  el detector VE un pop (la brasa más encendida se apaga de golpe sin evento)', corrida(6, recorrido, (b, k) => { if (k !== 200) return; let m = 0; for (let i = 1; i < b.n; i += 1) if (b.brillo[i] > b.brillo[m]) m = i; b.brillo[m] = 0 }), sinPops)
controlPositivo('  y una reaparición adentro del cuadro, encendida (un salto con nombre pero a la vista: la más encendida)', corrida(6, recorrido, (b, k) => { if (k !== 200) return; let m = 0; for (let i = 1; i < b.n; i += 1) if (b.brillo[i] > b.brillo[m]) m = i; b.eventos[m] = 1; b.brillo[m] = 0 }), sinPops)
controlPositivo('  y la densidad que salta de golpe (la de antes, sin inercia)', corrida(6, recorrido, (b, k) => { if (k % 7 === 0) b.brillo[k % b.n] = b.vida[k % b.n] * 0.5 }), sinPops)

// Con la cámara quieta no hay eventos de sobra: el plasma no parpadea en reposo.
const QUIETA = corrida(6, (_t, d) => poner(d, 0, 6.4, 19))
const quietaBien = (c: Corrida): boolean => c.violaciones.length === 0 && c.eventos < N * 0.6
afirmar(quietaBien(QUIETA), `  quieta en el hero 6 s: ${String(QUIETA.eventos)} eventos (sólo las que se van por el frente o por los lados y vuelven), sin saltos`)
controlPositivo('  el detector VE una quieta que recicla todo el rato', { ...QUIETA, eventos: N * 2 }, quietaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('Q1.d · La red en reposo: quieta se arma, un gesto la corta en cascada, nunca en el final del pie')

interface DeLaRed {
  readonly antesDeTiempo: number
  readonly armadaEn: number
  readonly enlaces: number
  readonly gradoMaximo: number
  readonly largoMaximo: number
  readonly enElCuadroMaximo: number
  readonly frenoArmada: number
  readonly cortadaEn: number
  readonly muereMaximo: number
  readonly frenoSuelta: number
  readonly energiaAntes: number
  readonly energiaDespues: number
  readonly conFinal: number
  readonly formadas: number
}

/** 60 cuadros por segundo con la cámara del hero: quieta hasta `gestoEn` (s), un gesto ahí, y después quieta de nuevo; `fin` desde `finDesde`. */
function correrLaRed(gestoEn: number, finDesde: number, paso: (r: Red, b: Brasas, k: number, en: ReturnType<typeof crearEntradaDeLasBrasas>, gesto: boolean) => void): DeLaRed {
  const az = azarConSemilla(23)
  const b = crearBrasas(N, az, FLOOR_Y)
  const en = crearEntradaDeLasBrasas()
  en.piso = FLOOR_Y
  const d = crearDominio()
  en.dominio = d
  poner(d, 0, 6.4, 19)
  poblar(d, b, az, true)
  for (let i = 0; i < b.n; i += 1) b.vida[i] = alfaDelDominio(d, b.lugar[i * 3], b.lugar[i * 3 + 1], b.lugar[i * 3 + 2])
  const r = crearRed(N)
  const m = crearMemoriaDelGesto()
  let antesDeTiempo = 0
  let armadaEn = -1
  let enlaces = 0
  let gradoMaximo = 0
  let largoMaximo = 0
  let enElCuadroMaximo = 0
  let frenoArmada = 0
  let cortadaEn = -1
  let muereMaximo = 0
  let frenoSuelta = 1
  let energiaAntes = 0
  let energiaDespues = 0
  let conFinal = 0
  for (let k = 1; k <= 600; k += 1) {
    const t = k * DT
    en.tiempo = t
    en.temperatura = 0.2
    const gesto = leerElGesto(m, Math.abs(t - gestoEn) < DT / 2 ? 100 : 0, 0, 0, false, false, t >= finDesde ? 0.5 : 0)
    paso(r, b, k, en, gesto)
    pasoDeLaRed(r, b, d, en, DT, gesto, 0, 0, az)
    pasoDeLasBrasas(b, DT, en, az)
    if (r.fase === 'suelta') repartir(d, b, az)
    brilloPorDensidad(b, DT)
    if (t < REPOSO.esperaS - DT && r.n > 0) antesDeTiempo += 1
    if (t >= finDesde && r.n > 0) conFinal += 1
    if (r.fase === 'armada' && armadaEn < 0) {
      armadaEn = t
      enlaces = r.n
      frenoArmada = r.freno
      for (let i = 0; i < b.n; i += 1) gradoMaximo = Math.max(gradoMaximo, r.grado[i])
      for (let q = 0; q < r.n; q += 1) {
        const i = r.a[q]
        const j = r.b[q]
        largoMaximo = Math.max(largoMaximo, Math.hypot(b.lugar[j * 3] - b.lugar[i * 3], b.lugar[j * 3 + 1] - b.lugar[i * 3 + 1], b.lugar[j * 3 + 2] - b.lugar[i * 3 + 2]))
        const ci = coordenadas(d, b.lugar[i * 3], b.lugar[i * 3 + 1], b.lugar[i * 3 + 2])
        const ui = ci.u
        const vi = ci.v
        const cj = coordenadas(d, b.lugar[j * 3], b.lugar[j * 3 + 1], b.lugar[j * 3 + 2])
        enElCuadroMaximo = Math.max(enElCuadroMaximo, Math.hypot(cj.u - ui, cj.v - vi))
      }
      energiaAntes = b.energia.reduce((s, x) => s + x, 0) / b.n
    }
    if (r.fase === 'cortando' && cortadaEn < 0) {
      cortadaEn = t
      for (let q = 0; q < r.n; q += 1) muereMaximo = Math.max(muereMaximo, r.muere[q])
    }
    if (cortadaEn > 0 && Math.abs(t - (cortadaEn + REPOSO.corteS + REPOSO.destelloS + DT)) < DT / 2) energiaDespues = b.energia.reduce((s, x) => s + x, 0) / b.n
    if (cortadaEn > 0 && t > cortadaEn + REPOSO.sueltaS * 4) frenoSuelta = Math.min(frenoSuelta, r.freno)
  }
  return { antesDeTiempo, armadaEn, enlaces, gradoMaximo, largoMaximo, enElCuadroMaximo, frenoArmada, cortadaEn, muereMaximo, frenoSuelta, energiaAntes, energiaDespues, conFinal, formadas: r.formadas }
}

const sinTocar = (): void => undefined
const LA_RED = correrLaRed(7, 1e9, sinTocar)
// Ningún enlace más largo que el alcance (en el mundo ni en el cuadro) al armarse: una brasa que salta (el envoltorio, una mudanza) pierde sus enlaces.
const redBien = (x: DeLaRed): boolean => x.antesDeTiempo === 0 && x.armadaEn > REPOSO.esperaS && x.armadaEn < REPOSO.esperaS + REPOSO.formaS + REPOSO.enciendeS + 0.1 &&
  x.enlaces >= N * 0.4 && x.gradoMaximo <= REPOSO.porBrasa && x.largoMaximo <= REPOSO.alcance * REPOSO.estirado && x.enElCuadroMaximo <= REPOSO.alcanceEnElCuadro * REPOSO.estirado * Math.SQRT2 + 1e-3 && x.frenoArmada > 0.95 &&
  x.cortadaEn > 7 - DT && x.cortadaEn < 7 + 2 * DT && x.muereMaximo <= REPOSO.corteS + 1e-6 && x.frenoSuelta < 0.05 && x.energiaDespues > x.energiaAntes + 0.1 && x.formadas === 1
afirmar(redBien(LA_RED), `  quieta, la red se arma a los ${LA_RED.armadaEn.toFixed(2)} s (${String(LA_RED.enlaces)} enlaces para ${String(N)} brasas, ≤ ${String(LA_RED.gradoMaximo)} por brasa, ≤ ${LA_RED.largoMaximo.toFixed(2)} u y ≤ ${LA_RED.enElCuadroMaximo.toFixed(3)} del cuadro) y frena (${LA_RED.frenoArmada.toFixed(2)}); el gesto a los 7 s la corta (todos los enlaces mueren en ≤ ${LA_RED.muereMaximo.toFixed(2)} s) con el chasquido (la energía media ${LA_RED.energiaAntes.toFixed(3)} → ${LA_RED.energiaDespues.toFixed(3)}) y suelta el freno (${LA_RED.frenoSuelta.toFixed(3)})`)
controlPositivo('  el detector VE una red que se arma antes de tiempo', { ...LA_RED, antesDeTiempo: 3 }, redBien)
controlPositivo('  y una brasa con cuatro enlaces', { ...LA_RED, gradoMaximo: 4 }, redBien)
controlPositivo('  y un enlace que cruza media pantalla', { ...LA_RED, enElCuadroMaximo: 0.6 }, redBien)
controlPositivo('  y un corte que no termina en corteS', { ...LA_RED, muereMaximo: REPOSO.corteS * 2 }, redBien)
controlPositivo('  y un corte sin chasquido', { ...LA_RED, energiaDespues: LA_RED.energiaAntes }, redBien)
controlPositivo('  y un freno que no se suelta', { ...LA_RED, frenoSuelta: 0.5 }, redBien)
// Y la red que ignora el gesto (la de antes de existir el corte): una corrida con el gesto a los 7 s pero la máquina sorda.
const SORDA = correrLaRed(7, 1e9, (r, _b, k) => { if (k === 7 * 60) r.quietaS = 99 })
controlPositivo('  y una red sorda al gesto (no se corta)', { ...SORDA, cortadaEn: -1 }, redBien)

// En el final del pie no se arma (el final cuenta como gesto): quieta 10 s con `fin` desde el segundo 1.
const EN_EL_FINAL = correrLaRed(1e9, 1, sinTocar)
const finalBien = (x: DeLaRed): boolean => x.conFinal === 0 && x.formadas === 0
afirmar(finalBien(EN_EL_FINAL), '  en el final del pie, quieta 10 s, la red no se arma')
controlPositivo('  el detector VE una red armada en el final', { ...EN_EL_FINAL, conFinal: 12, formadas: 1 }, finalBien)

// El gesto: el scroll que cambia, el puntero (activo) que se mueve, el dedo; nada de eso, quieto.
const gestoBien = (f: typeof leerElGesto): boolean => {
  const m = crearMemoriaDelGesto()
  f(m, 100, 0.1, 0.1, true, false, 0)
  const quieto = !f(m, 100, 0.1, 0.1, true, false, 0)
  const scroll = f(m, 103, 0.1, 0.1, true, false, 0)
  const puntero = f(m, 103, 0.1 + 0.01, 0.1, true, false, 0)
  const punteroQuieto = !f(m, 103, 0.11, 0.1, true, false, 0)
  const dedo = f(m, 103, 0.11, 0.1, false, true, 0)
  const fin = f(m, 103, 0.11, 0.1, false, false, 0.3)
  return quieto && scroll && puntero && punteroQuieto && dedo && fin
}
afirmar(gestoBien(leerElGesto), '  el gesto: el scroll que cambia, el puntero que se mueve, el dedo y el final; quieto, nada')
controlPositivo('  el detector VE un lector que no ve el scroll', (m, _s, x, y, activo, toca, fin) => leerElGesto(m, 0, x, y, activo, toca, fin), gestoBien)

// El dibujo: un solo búfer de segmentos en lote (cuatro vértices por enlace), la máscara de los textos por píxel y el final en el sombreador.
const dibujoBien = (v: string, f: string): boolean => v.includes('attribute vec3 aA') && v.includes('attribute vec3 aB') && v.includes('attribute vec2 aLado') && v.includes('enElFinal(') && f.includes('adentroDelTexto( gl_FragCoord.xy') && f.includes('uTiempo') && v.includes('uPixel')
afirmar(dibujoBien(VERTICES_DE_LA_RED, FRAGMENTOS_DE_LA_RED), '  el dibujo de la red: los dos extremos por vértice (un solo búfer), el ancho en px del dispositivo, la máscara de los textos por píxel, el final y el titileo')
controlPositivo('  el detector VE un dibujo sin la máscara de los textos', VERTICES_DE_LA_RED, (v: string) => dibujoBien(v, FRAGMENTOS_DE_LA_RED.replace('adentroDelTexto( gl_FragCoord.xy', 'float( 0.0 ) * ( gl_FragCoord.xy')))

// ═══════════════════════════════════════════════════════════════════════════
titulo('Q1 · Los módulos nuevos, de menos de 300 líneas; lo de cada cuadro, sin reservas')

const FUENTES: Record<string, string> = Object.fromEntries(['energia/dominio.ts', 'energia/grilla.ts', 'energia/paso.ts', 'energia/cuadro.ts', 'energia/brasas.ts', 'energia/vecinas.ts', 'energia/ruido.ts', 'energia/reposo.ts', 'energia/dibujo/red.ts'].map((m) => [m, leer(`_lib/escena/${m}`)]))
const POR_CUADRO: readonly (readonly [string, string])[] = [['energia/dominio.ts', 'envolver'], ['energia/dominio.ts', 'alfaDe'], ['energia/dominio.ts', 'coordenadasDe'], ['energia/grilla.ts', 'celdaDe'], ['energia/ruido.ts', 'rotorEnLote'], ['energia/ruido.ts', 'rotorDeLaBrasa'], ['energia/ruido.ts', 'rotorDelPunto'], ['energia/ruido.ts', 'ruidoConGradienteEn'], ['energia/brasas.ts', 'alRayoDesde'], ['energia/reposo.ts', 'pasoDeLaRed'], ['energia/reposo.ts', 'leerElGesto'], ['energia/reposo.ts', 'formar'], ['energia/reposo.ts', 'cortar'], ['energia/dibujo/red.ts', 'rellenarRed'], ['energia/dominio.ts', 'repartir'], ['energia/dominio.ts', 'escribir'], ['energia/dominio.ts', 'armarElDominio'], ['energia/grilla.ts', 'ajustarLaGrilla'], ['energia/grilla.ts', 'entreEllas'], ['energia/paso.ts', 'envolverYVivir'], ['energia/cuadro.ts', 'elDominio'], ['energia/vecinas.ts', 'brilloPorDensidad']]
const livianoBien = (f: Record<string, string>): boolean => Object.values(f).every((t) => lineasDeCodigo(t) <= 300) && POR_CUADRO.every(([m, fn]) => sinReservasEn(f[m] ?? '', fn))
afirmar(livianoBien(FUENTES), `  ${Object.entries(FUENTES).map(([m, t]) => `${m.split('/').pop() ?? m} ${String(lineasDeCodigo(t))}`).join(' · ')}; ${String(POR_CUADRO.length)} funciones de cada cuadro sin crear objetos, arreglos ni funciones`, POR_CUADRO.filter(([m, fn]) => !sinReservasEn(FUENTES[m] ?? '', fn)).map(([m, fn]) => `${m}:${fn}`).join(' · '))
controlPositivo('  el detector VE una reserva en el envoltorio', { ...FUENTES, 'energia/dominio.ts': (FUENTES['energia/dominio.ts'] ?? '').replace('  if (!salio) return false\n', '  const tmp = [u, v]\n  if (!salio) return tmp.length < 0\n') }, livianoBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('Q1 · Lo medido en el mini-banco (el recibo): ningún cuadro de más de 20 ms y casi sin basura por cuadro')

// El recibo (`docs/rediseno/entregas/pulido-19/mini-medido.json`): el plasma final de Q1 en calma y al máximo, de noche y de día, de
// cerca y de lejos, a 1440 y 390, sin vsync. La basura por cuadro: un número no entero que cruza una función que TurboFan no inlineó
// se encaja (16 bytes); antes del arreglo eran 61 KB por cuadro a 1440 (`antes` en el recibo); ahora nada de cada brasa cruza una
// llamada como número (`en.dt`, `d.piso`, el rotor en lote, `coordenadasDe`, `alfaDe`, `celdaDe`, `alRayoDesde`).
interface Medida { readonly cuadro: { readonly mayoresDe20: number; readonly media: number; readonly maximo: number } | null; readonly heap: { readonly kbPorCuadro: number } | null; readonly errores: number }
type Medidas = Readonly<Record<string, Readonly<Record<string, Medida>>>>
const RECIBO = JSON.parse(readFileSync('docs/rediseno/entregas/pulido-19/mini-medido.json', 'utf8')) as { readonly medidas: Medidas; readonly antes: Medidas; readonly red: Medidas }
const CONFIGS = { '1440': ['calma-noche', 'calma-dia', 'maxima-noche', 'lejos-noche', 'escena'], '390': ['calma-noche', 'maxima-noche'] } as const
const TOPE_KB = 12
const medidoBien = (m: Medidas): boolean => Object.entries(CONFIGS).every(([w, cs]) => cs.every((c) => {
  const x = m[w]?.[c]
  return x !== undefined && x.cuadro !== null && x.heap !== null && x.cuadro.mayoresDe20 === 0 && x.errores === 0 && x.heap.kbPorCuadro <= TOPE_KB && x.cuadro.media < 4
}))
const r1440 = RECIBO.medidas['1440']?.['calma-noche']
const antes1440 = RECIBO.antes['1440']?.['calma-noche']
afirmar(medidoBien(RECIBO.medidas), `  ${String(Object.values(CONFIGS).reduce((n, cs) => n + cs.length, 0))} mediciones sin cuadros de más de 20 ms ni errores, ≤ ${String(TOPE_KB)} KB de basura por cuadro (1440 calma noche: ${String(r1440?.cuadro?.media)} ms, ${String(r1440?.heap?.kbPorCuadro)} KB; antes del arreglo, ${String(antes1440?.heap?.kbPorCuadro)} KB)`)
controlPositivo('  el detector VE la basura de antes del arreglo (61 KB por cuadro)', { ...RECIBO.medidas, '1440': { ...RECIBO.medidas['1440'], 'calma-noche': antes1440 as Medida } }, medidoBien)
controlPositivo('  y un cuadro de más de 20 ms', { ...RECIBO.medidas, '390': { ...RECIBO.medidas['390'], 'maxima-noche': { ...(RECIBO.medidas['390']?.['maxima-noche'] as Medida), cuadro: { mayoresDe20: 1, media: 1, maximo: 25 } } } }, medidoBien)

// Q1.d · la red en reposo medida (la sección `red` del recibo): con la red armada ningún cuadro de más de 20 ms, y lo que cuesta
// (con menos sin, en calma de noche) acotado.
const CON_RED = { '1440': ['calma-noche', 'calma-noche-sinred', 'calma-dia', 'maxima-noche'], '390': ['calma-noche', 'calma-noche-sinred', 'maxima-noche'] } as const
const COSTO_MS = 0.8
const costoDeLaRed = (m: Medidas, w: string): number => (m[w]?.['calma-noche']?.cuadro?.media ?? 99) - (m[w]?.['calma-noche-sinred']?.cuadro?.media ?? 0)
const redMedidaBien = (m: Medidas): boolean => Object.entries(CON_RED).every(([w, cs]) => cs.every((c) => {
  const x = m[w]?.[c]
  return x !== undefined && x.cuadro !== null && x.heap !== null && x.cuadro.mayoresDe20 === 0 && x.errores === 0 && x.heap.kbPorCuadro <= TOPE_KB
})) && costoDeLaRed(m, '1440') <= COSTO_MS && costoDeLaRed(m, '390') <= COSTO_MS
afirmar(redMedidaBien(RECIBO.red), `  con la red en reposo, ningún cuadro de más de 20 ms ni basura nueva; la red cuesta ${costoDeLaRed(RECIBO.red, '1440').toFixed(2)} ms por cuadro a 1440 y ${costoDeLaRed(RECIBO.red, '390').toFixed(2)} a 390 (≤ ${String(COSTO_MS)})`)
controlPositivo('  el detector VE una red que cuesta 2 ms', { ...RECIBO.red, '1440': { ...RECIBO.red['1440'], 'calma-noche': { ...(RECIBO.red['1440']?.['calma-noche'] as Medida), cuadro: { mayoresDe20: 0, media: (RECIBO.red['1440']?.['calma-noche-sinred']?.cuadro?.media ?? 0) + 2, maximo: 5 } } } }, redMedidaBien)

const bajoBien = (m: Medidas, a: Medidas): boolean => (m['1440']?.['calma-noche']?.heap?.kbPorCuadro ?? 99) * 4 < (a['1440']?.['calma-noche']?.heap?.kbPorCuadro ?? 0)
afirmar(bajoBien(RECIBO.medidas, RECIBO.antes), '  la basura por cuadro bajó al menos cuatro veces respecto de antes del arreglo')
controlPositivo('  el detector VE una basura que no bajó', RECIBO.antes, (m: Medidas) => bajoBien(m, RECIBO.antes))

cerrar('s70-pulido-19')
