/**
 * PULIDO 19 — TERMINACIÓN DE LA ESCENA (`docs/rediseno/SPRINT-PULIDO-19.md`). Cada cosa con su control positivo (el detector ve el
 * estado de antes o uno roto a propósito).
 *   Q1.b · el dominio de la vista: el plasma cubre el cuadro en cualquier encuadre (la siembra, el envoltorio periódico, el reparto).
 *   Q1.c · nada aparece ni desaparece de golpe: el brillo de cada brasa cambia a lo sumo un tope por cuadro, salvo en un evento (una
 *          que reaparece por una cara del dominio o nace en su celda nueva), que sólo pasa fuera del cuadro o ya apagada.
 *   Q1.d · la red en reposo: quieta se arma (hasta tres enlaces por brasa, cortos en el mundo y en el cuadro, del centro hacia afuera),
 *          frena a las brasas, se corta en cascada con un gesto (en `corteS`, con el chasquido) y nunca se arma en el final del pie.
 *   Q2 · las piezas del pie caen después del logo (`caidaDelPie.ts`): sus lugares en el piso no se solapan ni pisan el logo, caen en
 *        una onda desde el logo con la física del logo, sin saltos, y la cámara desde arriba las deja enteras en pantalla.
 *   Q3 · el cristal de fondo (`cristal/`): siempre, pegado a la cúpula (las facetas justas alrededor), refracta la copia del cuadro
 *        sólo en el fondo, con Fresnel, brillo en los biseles y bordes antialiasados; apagado en el túnel y en Tu panel, se va con el
 *        final; sobre un texto, apenas; con movimiento reducido no se monta; lo medido en el mini-banco.
 */
import { readFileSync } from 'node:fs'

import * as THREE from 'three'

import { CRISTAL, amplitudDelCristal, amplitudPorDonde } from '../escena/cristal/cristal'
import { BRASAS, azarConSemilla, crearBrasas, crearEntradaDeLasBrasas, type Brasas } from '../escena/energia/brasas'
import { CELDAS_DEL_REPARTO, DOMINIO, alfaDelDominio, armarElDominio, coordenadas, crearDominio, objetivosDelReparto, poblar, repartir, type Dominio } from '../escena/energia/dominio'
import { pasoDeLasBrasas } from '../escena/energia/paso'
import { REPOSO, crearMemoriaDelGesto, crearRed, leerElGesto, pasoDeLaRed, type Red } from '../escena/energia/reposo'
import { FRAGMENTOS_DE_LA_RED, VERTICES_DE_LA_RED } from '../escena/energia/dibujo/red'
import { brilloPorDensidad } from '../escena/energia/vecinas'
import { ANISOTROPIA_DE_LAS_TRAMAS } from '../escena/gpu/anisotropia'
import { CAIDA_AL_HUECO, caidaIntegrada } from '../escena/final/caidaAlHueco'
import { CAIDA_DEL_PIE, crearLugar, distanciaParaElPie, huellaDelPie, lugaresEnElPiso, poseDeLaPiezaQueCae, type BaseDelPie, type LugarEnElPiso, type PiezaDePie } from '../escena/final/caidaDelPie'
import { sombraDeLaPiezaQueCae } from '../escena/final/sombraDeLaPieza'
import { FINAL_DEL_PIE, RELOJ_DEL_FINAL, alturaDeLaCaida, blancoDelFinal, camaraDelFinal, elevacionDe } from '../escena/final/recorridoDelFinal'
import { colocarLaPieza, profundidadDeLaPieza } from '../escena/pie3d/colocacion'
import { SOMBRA_DEL_PIE, alfaDeLaSombra, blandaDeLaSombra } from '../escena/pie3d/sombras'
import { FLOOR_Y, ORBIT_TARGET_Y } from '../escena/probeScene'
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
  // [PULIDO 22] T1 · la red se forma en ~30 s: la corrida dura hasta 3 s después del gesto (al menos 10 s).
  const cuadros = Math.max(600, gestoEn < 1e6 ? Math.round((gestoEn + 3) / DT) : 0)
  for (let k = 1; k <= cuadros; k += 1) {
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
// [PULIDO 22] T1 · el gesto, 2 s después de armada (antes a los 7 s: se armaba en 1,8 s; ahora en ~30).
const GESTO = Math.ceil(REPOSO.esperaS + REPOSO.formaS + REPOSO.enciendeS + 2)
const LA_RED = correrLaRed(GESTO, 1e9, sinTocar)
// Ningún enlace más largo que el alcance (en el mundo ni en el cuadro) al armarse: una brasa que salta (el envoltorio, una mudanza) pierde sus enlaces.
const redBien = (x: DeLaRed): boolean => x.antesDeTiempo === 0 && x.armadaEn > REPOSO.esperaS && x.armadaEn < REPOSO.esperaS + REPOSO.formaS + REPOSO.enciendeS + 0.1 &&
  x.enlaces >= N * 0.4 && x.gradoMaximo <= REPOSO.porBrasa && x.largoMaximo <= REPOSO.alcance * REPOSO.estirado && x.enElCuadroMaximo <= REPOSO.alcanceEnElCuadro * REPOSO.estirado * Math.SQRT2 + 1e-3 && x.frenoArmada > 0.95 &&
  x.cortadaEn > GESTO - DT && x.cortadaEn < GESTO + 2 * DT && x.muereMaximo <= REPOSO.corteS + 1e-6 && x.frenoSuelta < 0.05 && x.energiaDespues > x.energiaAntes + 0.1 && x.formadas === 1
afirmar(redBien(LA_RED), `  quieta, la red se arma a los ${LA_RED.armadaEn.toFixed(2)} s (${String(LA_RED.enlaces)} enlaces para ${String(N)} brasas, ≤ ${String(LA_RED.gradoMaximo)} por brasa, ≤ ${LA_RED.largoMaximo.toFixed(2)} u y ≤ ${LA_RED.enElCuadroMaximo.toFixed(3)} del cuadro) y frena (${LA_RED.frenoArmada.toFixed(2)}); el gesto a los ${String(GESTO)} s la corta (todos los enlaces mueren en ≤ ${LA_RED.muereMaximo.toFixed(2)} s) con el chasquido (la energía media ${LA_RED.energiaAntes.toFixed(3)} → ${LA_RED.energiaDespues.toFixed(3)}) y suelta el freno (${LA_RED.frenoSuelta.toFixed(3)})`)
controlPositivo('  el detector VE una red que se arma antes de tiempo', { ...LA_RED, antesDeTiempo: 3 }, redBien)
controlPositivo('  y una brasa con cuatro enlaces', { ...LA_RED, gradoMaximo: 4 }, redBien)
controlPositivo('  y un enlace que cruza media pantalla', { ...LA_RED, enElCuadroMaximo: 0.6 }, redBien)
controlPositivo('  y un corte que no termina en corteS', { ...LA_RED, muereMaximo: REPOSO.corteS * 2 }, redBien)
controlPositivo('  y un corte sin chasquido', { ...LA_RED, energiaDespues: LA_RED.energiaAntes }, redBien)
controlPositivo('  y un freno que no se suelta', { ...LA_RED, frenoSuelta: 0.5 }, redBien)
// Y la red que ignora el gesto (la de antes de existir el corte): una corrida con el gesto a los 7 s pero la máquina sorda.
const SORDA = correrLaRed(GESTO, 1e9, (r, _b, k) => { if (k === GESTO * 60) r.quietaS = 99 })
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
// [PULIDO 20] R3 · los enlaces son rayos congelados: la geometría es estática (un solo búfer) y los extremos de cada enlace viajan en una
// textura (antes: los dos extremos por vértice, reescritos cada cuadro); el camino quebrado lo arma el sombreador (`puntoDe`).
const dibujoBien = (v: string, f: string): boolean => v.includes('uniform sampler2D uEnlaces') && v.includes('vec3 puntoDe(') && v.includes('enElFinal(') && f.includes('adentroDelTexto( gl_FragCoord.xy') && f.includes('uTiempo') && v.includes('uPixel')
afirmar(dibujoBien(VERTICES_DE_LA_RED, FRAGMENTOS_DE_LA_RED), '  el dibujo de la red: un solo búfer (estático: [PULIDO 20] R3) con los extremos de cada enlace en una textura y su camino en el sombreador, el ancho en px del dispositivo, la máscara de los textos por píxel, el final y el titileo')
controlPositivo('  el detector VE un dibujo sin la máscara de los textos', VERTICES_DE_LA_RED, (v: string) => dibujoBien(v, FRAGMENTOS_DE_LA_RED.replace('adentroDelTexto( gl_FragCoord.xy', 'float( 0.0 ) * ( gl_FragCoord.xy')))

// ═══════════════════════════════════════════════════════════════════════════
titulo('Q2 · Las piezas del pie caen después del logo y quedan acostadas a su alrededor, enteras en pantalla')

// El pie de 1440 × 900 de pie, como lo coloca la escena en la pose E (la cámara en (0, 5, 40) mirando al origen): las cajas del DOM
// (px) de la columna izquierda y del formulario, cada una con su canto de abajo y de atrás en el mundo (`pie3d/caida.ts` hace lo mismo).
const CAJAS_DEL_PIE = [
  { id: 'logotipo', x: 60, y: 160, ancho: 180, alto: 36, espesor: 6 },
  { id: 'titular', x: 60, y: 220, ancho: 540, alto: 160, espesor: 8 },
  { id: 'mail', x: 60, y: 410, ancho: 300, alto: 48, espesor: 22 },
  { id: 'whatsapp', x: 60, y: 470, ancho: 260, alto: 48, espesor: 22 },
  { id: 'recorrido-1', x: 60, y: 560, ancho: 120, alto: 24, espesor: 4 },
  { id: 'recorrido-2', x: 200, y: 560, ancho: 120, alto: 24, espesor: 4 },
  { id: 'recorrido-3', x: 340, y: 560, ancho: 120, alto: 24, espesor: 4 },
  { id: 'redes-1', x: 60, y: 620, ancho: 48, alto: 48, espesor: 22 },
  { id: 'redes-2', x: 120, y: 620, ancho: 48, alto: 48, espesor: 22 },
  { id: 'legal', x: 60, y: 700, ancho: 400, alto: 18, espesor: 3 },
  { id: 'formulario', x: 827, y: 150, ancho: 553, alto: 600, espesor: 30 },
  { id: 'rotulo', x: 827, y: 110, ancho: 200, alto: 24, espesor: 4 },
] as const
const LOGO = { ancho: 6.9, fondo: 4.78, alto: 4.78, espesor: 0.4 }
function elPieDePie(): { readonly piezas: PiezaDePie[]; readonly lugares: LugarEnElPiso[]; readonly base: BaseDelPie; readonly ultima: number; readonly camara: THREE.PerspectiveCamera } {
  const camara = new THREE.PerspectiveCamera(35, 1440 / 900, 0.1, 500)
  camara.position.set(0, 5, 40)
  camara.lookAt(0, ORBIT_TARGET_Y, 0)
  camara.updateMatrixWorld(true)
  const cuadro = { ancho: 1440, alto: 900 }
  let d = Number.POSITIVE_INFINITY
  for (const c of CAJAS_DEL_PIE) d = Math.min(d, profundidadDeLaPieza(camara, c.x + c.ancho / 2, c.y + c.alto, cuadro.ancho, cuadro.alto))
  const temp = new THREE.Object3D()
  const canto = new THREE.Vector3()
  const piezas = CAJAS_DEL_PIE.map((c) => {
    const mpp = colocarLaPieza(temp, camara, c.x, c.y, cuadro.ancho, cuadro.alto, d)
    temp.updateMatrixWorld(true)
    canto.set(c.ancho / 2, -c.alto, -c.espesor).applyMatrix4(temp.matrixWorld)
    return { ancho: c.ancho * mpp, alto: c.alto * mpp, espesor: Math.max(0.02, c.espesor * mpp), x: canto.x, y: Math.max(FLOOR_Y, canto.y), z: canto.z }
  })
  const base: BaseDelPie = { derechaX: 1, derechaZ: 0, atrasX: 0, atrasZ: -1, logoX: 0, logoZ: 0, logoAncho: LOGO.ancho, logoFondo: LOGO.fondo }
  // [PULIDO 23] U4 · lo que cae son las columnas (la caja de las piezas de cada lado del logo, como en el sitio: `pie3d/caida.ts`), y
  // caen donde están paradas: con las piezas sueltas, las de una misma columna se pisaban (eran del modelo de PULIDO 19, que las apilaba).
  const columnas = [-1, 1].map((lado) => {
    const de = piezas.filter((p) => (p.x < 0 ? -1 : 1) === lado)
    const x0 = Math.min(...de.map((p) => p.x - p.ancho / 2))
    const x1 = Math.max(...de.map((p) => p.x + p.ancho / 2))
    const y0 = Math.min(...de.map((p) => p.y))
    const y1 = Math.max(...de.map((p) => p.y + p.alto))
    return { ancho: x1 - x0, alto: y1 - y0, espesor: Math.max(...de.map((p) => p.espesor)), x: (x0 + x1) / 2, y: y0, z: de[0]?.z ?? 0 }
  }).filter((c) => Number.isFinite(c.ancho))
  return { piezas: columnas, ...enElPiso(columnas, base), camara }
}
function enElPiso(piezas: readonly PiezaDePie[], base: BaseDelPie): { readonly lugares: LugarEnElPiso[]; readonly base: BaseDelPie; readonly ultima: number } {
  const lugares = piezas.map(() => crearLugar())
  const ultima = lugaresEnElPiso(piezas, piezas.length, piezas.map((p) => caidaIntegrada({ alto: p.alto, espesor: p.espesor })), base, lugares)
  return { lugares, base, ultima }
}
const PIE = elPieDePie()
/** La caja acostada de una pieza en el piso (x0, x1, z0, z1): el canto al frente y la cabeza hacia atrás. */
const cajaAcostada = (p: PiezaDePie, l: LugarEnElPiso): readonly [number, number, number, number] => [l.x - p.ancho / 2, l.x + p.ancho / 2, l.z - p.alto, l.z]
const seCruzan = (a: readonly [number, number, number, number], b: readonly [number, number, number, number]): boolean => a[0] < b[1] && b[0] < a[1] && a[2] < b[3] && b[2] < a[3]
interface DelPie { readonly solapes: number; readonly conElLogo: number; readonly fueraDelGolpe: number; readonly ultima: number; readonly fuera: number; readonly aire: number }
function medirElPie(piezas: readonly PiezaDePie[], lugares: readonly LugarEnElPiso[], base: BaseDelPie, ultima: number): DelPie {
  let solapes = 0
  let conElLogo = 0
  let fueraDelGolpe = 0
  let aire = Number.POSITIVE_INFINITY
  const logo: readonly [number, number, number, number] = [-LOGO.ancho / 2, LOGO.ancho / 2, -LOGO.fondo / 2, LOGO.fondo / 2]
  for (let i = 0; i < piezas.length; i += 1) {
    const ci = cajaAcostada(piezas[i], lugares[i])
    for (let j = i + 1; j < piezas.length; j += 1) if (seCruzan(ci, cajaAcostada(piezas[j], lugares[j]))) solapes += 1
    if (seCruzan(ci, logo)) conElLogo += 1
    // [PULIDO 20] R1 · todas tocan en el golpe del logo (antes: la primera arrancaba después, en una onda).
    if (Math.abs(lugares[i].toca - CAIDA_AL_HUECO.golpeS) > 1e-9) fueraDelGolpe += 1
    aire = Math.min(aire, Math.max(logo[0] - ci[1], ci[0] - logo[1]))
  }
  // Desde arriba, a la distancia del pie acostado: las cuatro esquinas de cada pieza acostada y del logo adentro del cuadro con margen.
  const huella = new Float64Array(2)
  huellaDelPie(piezas, piezas.length, lugares, base, huella)
  const camara = new THREE.PerspectiveCamera(35, 1440 / 900, 0.1, 500)
  camara.position.set(0, 5, 40)
  camara.lookAt(0, ORBIT_TARGET_Y, 0)
  camara.updateMatrixWorld(true)
  const blanco = new THREE.Vector3()
  blancoDelFinal(1, blanco)
  camaraDelFinal(camara, alturaDeLaCaida(1, LOGO, elevacionDe(camara.position)), blanco, 0, 0, null, distanciaParaElPie(camara.fov, camara.aspect, huella[0] + CAIDA_DEL_PIE.aire, huella[1] + CAIDA_DEL_PIE.aire))
  const v = new THREE.Vector3()
  let fuera = 0
  const esquinas = [...piezas.map((p, i) => cajaAcostada(p, lugares[i])), logo]
  for (const c of esquinas) for (const [x, z] of [[c[0], c[2]], [c[1], c[2]], [c[0], c[3]], [c[1], c[3]]] as const) {
    v.set(x, FLOOR_Y, z).project(camara)
    if (Math.abs(v.x) > 0.92 || Math.abs(v.y) > 0.92) fuera += 1
  }
  return { solapes, conElLogo, fueraDelGolpe, ultima, fuera, aire }
}
const MEDIDO = medirElPie(PIE.piezas, PIE.lugares, PIE.base, PIE.ultima)
const pieBien = (m: DelPie): boolean => m.solapes === 0 && m.conElLogo === 0 && m.aire >= CAIDA_DEL_PIE.aire - 1e-6 && m.fueraDelGolpe === 0 && m.ultima + CAIDA_DEL_PIE.despuesS <= RELOJ_DEL_FINAL.duracionS + 1e-6 && m.fuera === 0
afirmar(pieBien(MEDIDO), `  el pie de 1440 acostado: sus ${String(PIE.piezas.length)} columnas sin solaparse entre sí ni con el logo (a ≥ ${MEDIDO.aire.toFixed(2)} u de él), todas tocan en el golpe (${String(CAIDA_AL_HUECO.golpeS)} s; [PULIDO 20] R1) y el DOM de la última aparece a los ${MEDIDO.ultima.toFixed(2)} s (el reloj dura ${String(RELOJ_DEL_FINAL.duracionS)}); desde arriba, todas las esquinas y el logo adentro del cuadro con margen`)
controlPositivo('  el detector VE dos piezas en el mismo lugar', { ...MEDIDO, solapes: 1 }, pieBien)
controlPositivo('  y una pieza sobre el logo', { ...MEDIDO, conElLogo: 1 }, pieBien)
controlPositivo('  y una pieza que toca fuera del golpe', { ...MEDIDO, fueraDelGolpe: 1 }, pieBien)
controlPositivo('  y un reloj que termina antes de que se asiente la última', { ...MEDIDO, ultima: RELOJ_DEL_FINAL.duracionS }, pieBien)
controlPositivo('  y una esquina fuera del cuadro', { ...MEDIDO, fuera: 1 }, pieBien)

// La caída de cada pieza es continua en el tiempo (el canto y el ángulo, sin saltos entre cuadros a 60 cps: la bajada es rápida pero
// suave), arranca de pie en la pared y termina acostada en su lugar. [PULIDO 20] R1 · incrustada (antes: al ras) y con el logo: todas tocan
// en el golpe, así que las más altas arrancan antes (antes: una onda desde el logo, las más cercanas antes).
interface DeLaCaida { readonly saltoMaximo: number; readonly anguloMaximo: number; readonly enSuLugar: number; readonly ordenRoto: number; readonly acostadas: number }
function medirLaCaida(piezas: readonly PiezaDePie[], lugares: readonly LugarEnElPiso[], ultima: number): DeLaCaida {
  let saltoMaximo = 0
  let anguloMaximo = 0
  let enSuLugar = 0
  let acostadas = 0
  let ordenRoto = 0
  for (let i = 0; i < piezas.length; i += 1) {
    const p = piezas[i]
    const l = lugares[i]
    let [px, py, pz, pa] = [Number.NaN, 0, 0, 0]
    for (let k = 0; k <= Math.ceil(ultima * 60) + 30; k += 1) {
      const q = poseDeLaPiezaQueCae(p, l, k / 60)
      if (Number.isFinite(px)) {
        saltoMaximo = Math.max(saltoMaximo, Math.hypot(q.x - px, q.y - py, q.z - pz))
        anguloMaximo = Math.max(anguloMaximo, Math.abs(q.a - pa))
      }
      ;[px, py, pz, pa] = [q.x, q.y, q.z, q.a]
    }
    const final = poseDeLaPiezaQueCae(p, l, ultima + 0.5)
    if (Math.abs(final.x - l.x) < 1e-6 && Math.abs(final.z - l.z) < 1e-6 && final.y <= FLOOR_Y + 1e-9 && final.y >= FLOOR_Y - p.espesor && final.quieta) enSuLugar += 1
    if (Math.abs(final.a - Math.PI / 2) < 1e-6 && final.toco) acostadas += 1
    const antes = poseDeLaPiezaQueCae(p, l, 0)
    if (antes.x !== p.x || antes.y !== p.y || antes.z !== p.z || antes.a !== 0) ordenRoto += 1
    for (let j = 0; j < piezas.length; j += 1) if (piezas[i].alto > piezas[j].alto + 1e-6 && lugares[i].cae > lugares[j].cae + 1e-9) ordenRoto += 1
  }
  return { saltoMaximo, anguloMaximo, enSuLugar, ordenRoto, acostadas }
}
const LA_CAIDA = medirLaCaida(PIE.piezas, PIE.lugares, PIE.ultima)
const caidaBien = (c: DeLaCaida): boolean => c.saltoMaximo < 1 && c.anguloMaximo < 0.3 && c.enSuLugar === PIE.piezas.length && c.acostadas === PIE.piezas.length && c.ordenRoto === 0
afirmar(caidaBien(LA_CAIDA), `  cada pieza baja de la pared a su lugar sin saltos (el canto a lo sumo ${LA_CAIDA.saltoMaximo.toFixed(2)} u por cuadro, el ángulo ${(LA_CAIDA.anguloMaximo * 180 / Math.PI).toFixed(1)}°), vuelca sobre su canto y queda acostada e incrustada ahí (${String(LA_CAIDA.acostadas)} de ${String(PIE.piezas.length)}); las más altas arrancan antes (todas tocan en el golpe)`)
controlPositivo('  el detector VE un salto', { ...LA_CAIDA, saltoMaximo: 3 }, caidaBien)
controlPositivo('  y una pieza que no llega a su lugar', { ...LA_CAIDA, enSuLugar: PIE.piezas.length - 1 }, caidaBien)
controlPositivo('  y una alta que arranca después que una chica', { ...LA_CAIDA, ordenRoto: 1 }, caidaBien)

// El cableado: la cámara quieta (sin giro ni alejamiento), la copia de la cámara antes de que el final la suba, la calma del piso
// bajo el pie y los módulos nuevos de menos de 300 líneas sin reservas en lo de cada cuadro. [PULIDO 20] R1 · sin el pulso en cada
// impacto: todas tocan en el golpe y el impacto es el del logo (antes: un pulso chico donde caía cada una).
const DEL_PIE = Object.fromEntries(['final/caidaDelPie.ts', 'pie3d/caida.ts', 'final/cuadroDelFinal.ts', 'final/enElPiso.ts', 'pie3d/armadas.ts'].map((m) => [m, leer(`_lib/escena/${m}`)])) as Record<string, string>
const cableadoBien = (f: Record<string, string>): boolean => FINAL_DEL_PIE.quieto.giroGradosS === 0 && FINAL_DEL_PIE.quieto.alejaHasta === 0 &&
  (f['final/cuadroDelFinal.ts'] ?? '').includes('copiarLaCamara(CAMARA_ANTES_DEL_FINAL, CAMARA_SIN_EL_MOUSE)') && (f['final/cuadroDelFinal.ts'] ?? '').indexOf('copiarLaCamara(CAMARA_ANTES_DEL_FINAL') < (f['final/cuadroDelFinal.ts'] ?? '').indexOf('camaraDelFinal(CAMARA_SIN_EL_MOUSE') &&
  (f['final/enElPiso.ts'] ?? '').includes('float calmaDelPie( vec2 xz )') && !(f['pie3d/caida.ts'] ?? '').includes('pedirLaOnda') &&
  (f['pie3d/armadas.ts'] ?? '').includes('if (enElFinal) aplicarLaCaida(s.caida, k, a, segundos)') &&
  lineasDeCodigo(f['final/caidaDelPie.ts'] ?? '') <= 300 && lineasDeCodigo(f['pie3d/caida.ts'] ?? '') <= 300 && sinReservasEn(f['pie3d/caida.ts'] ?? '', 'armarLaCaida') && sinReservasEn(f['pie3d/caida.ts'] ?? '', 'aplicarLaCaida') && sinReservasEn(f['final/caidaDelPie.ts'] ?? '', 'poseDeLaPiezaQueCae') && sinReservasEn(f['final/caidaDelPie.ts'] ?? '', 'lugaresEnElPiso')
afirmar(cableadoBien(DEL_PIE), '  el cableado: la cámara quieta se queda (sin giro ni alejamiento), el final copia la cámara sin el mouse antes de subirla, el piso se calma bajo el pie (sin pulsos sueltos: el impacto es el del golpe), la caída se aplica a cada pieza; los módulos nuevos de menos de 300 líneas y lo de cada cuadro sin reservas')
controlPositivo('  el detector VE la copia de la cámara después de subirla', { ...DEL_PIE, 'final/cuadroDelFinal.ts': (DEL_PIE['final/cuadroDelFinal.ts'] ?? '').replace('copiarLaCamara(CAMARA_ANTES_DEL_FINAL, CAMARA_SIN_EL_MOUSE)', '') + '\ncopiarLaCamara(CAMARA_ANTES_DEL_FINAL, CAMARA_SIN_EL_MOUSE)' }, cableadoBien)
controlPositivo('  y una reserva en la caída de cada cuadro', { ...DEL_PIE, 'pie3d/caida.ts': (DEL_PIE['pie3d/caida.ts'] ?? '').replace('  if (i >= c.n || s <= 0) return\n', '  const tmp = [i]\n  if (i >= c.n || s <= 0 || tmp.length < 0) return\n') }, cableadoBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('Q3 · El cristal de fondo: dónde se ve; [PULIDO 20] R2 · la malla de celdas se borró (el cristal nuevo, en s71)')

// [PULIDO 20] R2 · el humano: «el de ahora no gustó: una malla de celdas pegada al domo, plana y pareja»; se borra y en su lugar van las
// esquirlas en el borde (s71-pulido-20). Antes acá: las facetas justas alrededor del cilindro y el sombreador de pantalla entera (el
// cilindro, Voronoi, la copia del cuadro sólo en el fondo); ahora: que esa malla ya no está y que el cristal nuevo se monta como el de
// antes (siempre con movimiento; `cristal=no` y `fondo=moire` lo apagan). «Dónde se ve» sigue igual.
// Dónde se ve: 1 lejos de las secciones apagadas, 0 con el medio de la pantalla adentro de una, el fundido entre medio; y se va con el final.
const BANDAS = Float32Array.from([10000, 14000, 30000, 31000])
const dondeBien = (f: typeof amplitudPorDonde, g: typeof amplitudDelCristal): boolean => {
  const alto = 900
  const lejos = f(5000, alto, BANDAS, 2)
  const adentro = f(12000, alto, BANDAS, 2)
  const borde = f(14000 + CRISTAL.donde.fundido * alto * 0.5, alto, BANDAS, 2)
  const casi = f(14000 + CRISTAL.donde.fundido * alto + 1, alto, BANDAS, 2)
  const otra = f(30500, alto, BANDAS, 2)
  let monotona = true
  let antes = 0
  for (let y = 14000; y <= 14000 + CRISTAL.donde.fundido * alto; y += 10) {
    const v = f(y, alto, BANDAS, 2)
    if (v < antes - 1e-9) monotona = false
    antes = v
  }
  return lejos === 1 && adentro === 0 && borde > 0.3 && borde < 0.7 && casi === 1 && otra === 0 && monotona && g(1, 0) === 1 && g(1, 1) === 0 && g(0.5, 0.5) > 0 && g(0.5, 0.5) < 0.5 && g(1, 0.5) === 0.5
}
afirmar(dondeBien(amplitudPorDonde, amplitudDelCristal), `  dónde: 1 lejos de ${CRISTAL.donde.apagadas.join(' y ')}, 0 adentro, el fundido de ${String(CRISTAL.donde.fundido)} pantallas monótono entre medio; y se va con la cámara del final`)
controlPositivo('  el detector VE un cristal que no se apaga en el túnel', ((c: number, alto: number, b: ArrayLike<number>, n: number) => Math.max(0.2, amplitudPorDonde(c, alto, b, n))) as typeof amplitudPorDonde, (f: typeof amplitudPorDonde) => dondeBien(f, amplitudDelCristal))
controlPositivo('  y uno que se queda en el final', ((p: number) => p) as typeof amplitudDelCristal, (g: typeof amplitudDelCristal) => dondeBien(amplitudPorDonde, g))

const VIDRIO_NUEVO = leer('_lib/escena/cristal/vidrio.ts')
const CRISTAL_TSX = leer('_lib/escena/cristal/CristalDeLaEscena.tsx')
const ESCENARIO = leer('_lib/escena/ProbeStage.tsx')
const ENTORNO_TS = leer('_lib/escena/entorno.ts')
const sinCeldasBien = (f: string, tsx: string, esc: string, ent: string): boolean => !f.includes('hastaElCilindro') && !f.includes('semillaDeLaCelda') && !tsx.includes('PEDIDOS_DEL_PASE.colorEsteCuadro') &&
  tsx.includes("pruebas['sin-cristal'] === 'si' || quieto) return null") && esc.includes('<CristalDeLaEscena quieto={reducedMotion} logoGroupRef={logoGroupRef} />') && ent.includes("'sin-cristal': valor('cristal') === 'no' || valor('fondo') === 'moire' ? 'si' : 'no'") && lineasDeCodigo(f) <= 300 && lineasDeCodigo(tsx) <= 300
afirmar(sinCeldasBien(VIDRIO_NUEVO, CRISTAL_TSX, ESCENARIO, ENTORNO_TS), '  la malla de celdas (el cilindro con Voronoi en una pasada de pantalla entera, que leía la copia del cuadro) ya no está; el cristal se monta siempre con movimiento (cristal=no y fondo=moire lo apagan)')
controlPositivo('  el detector VE la malla de celdas de PULIDO 19', `${VIDRIO_NUEVO}\nfloat hastaElCilindro( vec3 o, vec3 d, float radio ) { return 0.0; }`, (f: string) => sinCeldasBien(f, CRISTAL_TSX, ESCENARIO, ENTORNO_TS))
controlPositivo('  y un cristal montado con movimiento reducido', CRISTAL_TSX.replace("pruebas['sin-cristal'] === 'si' || quieto) return null", "pruebas['sin-cristal'] === 'si') return null"), (t: string) => sinCeldasBien(VIDRIO_NUEVO, t, ESCENARIO, ENTORNO_TS))

// ═══════════════════════════════════════════════════════════════════════════
titulo('Q4 · Las piezas que caen tienen sombra de contacto: nada de pie en la pared, la placa con su ribete acostadas, nunca sobre el logo')

// Con el pie de 1440 de Q2: antes de arrancar, ninguna; a mitad de la bajada, más tenue que al ras; a mitad del vuelco, la huella entre
// el canto y la placa; acostada, la placa entera más lo que sobra, con el alfa y la blandura del ras; y ninguna cruza el logo.
// [PULIDO 20] R1 · eso, al asentarse; incrustada (la cara al ras del piso), ninguna (antes: la acostada se quedaba para siempre).
interface DeLasSombras { readonly dePie: number; readonly bajando: number; readonly volcando: number; readonly acostadas: number; readonly sobreElLogo: number; readonly incrustadas: number }
type Caja = readonly [number, number, number, number]
function medirLasSombras(piezas: readonly PiezaDePie[], lugares: readonly LugarEnElPiso[], base: BaseDelPie, ultima: number): DeLasSombras {
  let dePie = 0
  let bajando = 0
  let volcando = 0
  let acostadas = 0
  let sobreElLogo = 0
  let incrustadas = 0
  const logo: Caja = [-LOGO.ancho / 2, LOGO.ancho / 2, -LOGO.fondo / 2, LOGO.fondo / 2]
  const cajaDe = (s: ReturnType<typeof sombraDeLaPiezaQueCae>): Caja => [s.x - s.medioAncho, s.x + s.medioAncho, s.z - s.medioFondo, s.z + s.medioFondo]
  const igual = (a: Caja, b: Caja): boolean => a.every((v, k) => Math.abs(v - b[k]) < 1e-6)
  for (let i = 0; i < piezas.length; i += 1) {
    const p = piezas[i]
    const l = lugares[i]
    if (sombraDeLaPiezaQueCae(p, poseDeLaPiezaQueCae(p, l, 0), base).alfa > 0) dePie += 1
    if (sombraDeLaPiezaQueCae(p, poseDeLaPiezaQueCae(p, l, ultima + 0.5), base).alfa > 0) incrustadas += 1
    const fin = sombraDeLaPiezaQueCae(p, poseDeLaPiezaQueCae(p, l, l.asentada), base)
    const finAlfa = fin.alfa
    const finCaja = cajaDe(fin)
    const acostada = cajaAcostada(p, l)
    const justa: Caja = [acostada[0] - SOMBRA_DEL_PIE.sobra, acostada[1] + SOMBRA_DEL_PIE.sobra, acostada[2] - SOMBRA_DEL_PIE.sobra, acostada[3] + SOMBRA_DEL_PIE.sobra]
    if (igual(finCaja, justa) && Math.abs(finAlfa - alfaDeLaSombra(0)) < 1e-9 && Math.abs(fin.blanda - blandaDeLaSombra(0)) < 1e-9) acostadas += 1
    if (seCruzan(finCaja, logo)) sobreElLogo += 1
    const mitad = sombraDeLaPiezaQueCae(p, poseDeLaPiezaQueCae(p, l, l.bajaS * (1 - CAIDA_DEL_PIE.tramos.abaja / 2)), base)
    if (mitad.alfa > 0 && mitad.alfa < finAlfa) bajando += 1
    const vuelco = sombraDeLaPiezaQueCae(p, poseDeLaPiezaQueCae(p, l, (l.cae + l.toca) / 2), base)
    if (vuelco.medioFondo > p.espesor / 2 + SOMBRA_DEL_PIE.sobra && vuelco.medioFondo < p.alto / 2 + SOMBRA_DEL_PIE.sobra) volcando += 1
  }
  return { dePie, bajando, volcando, acostadas, sobreElLogo, incrustadas }
}
const SOMBRAS = medirLasSombras(PIE.piezas, PIE.lugares, PIE.base, PIE.ultima)
const sombrasBien = (m: DeLasSombras): boolean => m.dePie === 0 && m.bajando === PIE.piezas.length && m.volcando === PIE.piezas.length && m.acostadas === PIE.piezas.length && m.sobreElLogo === 0 && m.incrustadas === 0
afirmar(sombrasBien(SOMBRAS), `  las sombras de contacto de las ${String(PIE.piezas.length)} piezas: ninguna de pie en la pared, más tenues a mitad de la bajada, la huella entre el canto y la placa a mitad del vuelco, al asentarse la placa entera con ${String(SOMBRA_DEL_PIE.sobra)} u de más y el alfa del ras (${alfaDeLaSombra(0).toFixed(2)}), ninguna sobre el logo y ninguna con la pieza incrustada ([PULIDO 20] R1)`)
controlPositivo('  el detector VE una sombra bajo una pieza de pie en la pared', { ...SOMBRAS, dePie: 1 }, sombrasBien)
controlPositivo('  y una sombra acostada que no es la placa', { ...SOMBRAS, acostadas: PIE.piezas.length - 1 }, sombrasBien)
controlPositivo('  y una sombra sobre el logo', { ...SOMBRAS, sobreElLogo: 1 }, sombrasBien)
controlPositivo('  y una sombra bajo una pieza incrustada', { ...SOMBRAS, incrustadas: 1 }, sombrasBien)
controlPositivo('  y una huella que no crece con el vuelco', { ...SOMBRAS, volcando: 0 }, sombrasBien)

// El cableado: sólo en el final (de pie en la pared, ninguna: NOCTURNO FINAL A4 sigue), el rectángulo en la base del pie (no en los
// ejes del mundo), el piso vivo las pinta; los módulos de menos de 300 líneas y lo de cada cuadro sin reservas.
const DE_LAS_SOMBRAS = Object.fromEntries(['pie3d/armadas.ts', 'pie3d/caida.ts', 'pie3d/sombras.ts', 'final/sombraDeLaPieza.ts', 'piso/bloques.ts'].map((m) => [m, leer(`_lib/escena/${m}`)])) as Record<string, string>
const sombrasCableadas = (f: Record<string, string>): boolean => (f['pie3d/armadas.ts'] ?? '').includes('SOMBRAS_DEL_PIE.uCuantasSombrasDelPie.value = enElFinal ? sombrasDeLaCaida(s.caida, segundos) : 0') &&
  (f['pie3d/caida.ts'] ?? '').includes('uBaseDeLasSombrasDelPie.value.set(b.derechaX, b.derechaZ, b.atrasX, b.atrasZ)') && (f['pie3d/caida.ts'] ?? '').includes('k < MAXIMO_DE_SOMBRAS_DEL_PIE') &&
  (f['pie3d/sombras.ts'] ?? '').includes('dot( r, uBaseDeLasSombrasDelPie.xy ), dot( r, uBaseDeLasSombrasDelPie.zw )') && (f['piso/bloques.ts'] ?? '').includes('${APLICAR_LAS_SOMBRAS_DEL_PIE_GLSL}') &&
  lineasDeCodigo(f['final/sombraDeLaPieza.ts'] ?? '') <= 300 && lineasDeCodigo(f['pie3d/caida.ts'] ?? '') <= 300 && sinReservasEn(f['pie3d/caida.ts'] ?? '', 'sombrasDeLaCaida') && sinReservasEn(f['final/sombraDeLaPieza.ts'] ?? '', 'sombraDeLaPiezaQueCae')
afirmar(sombrasCableadas(DE_LAS_SOMBRAS), '  el cableado: las sombras sólo con el final en marcha, el rectángulo en la base del pie, con tope, el piso vivo las pinta; los módulos de menos de 300 líneas y lo de cada cuadro sin reservas')
controlPositivo('  el detector VE sombras en los ejes del mundo', { ...DE_LAS_SOMBRAS, 'pie3d/caida.ts': (DE_LAS_SOMBRAS['pie3d/caida.ts'] ?? '').replace('uBaseDeLasSombrasDelPie.value.set(b.derechaX, b.derechaZ, b.atrasX, b.atrasZ)', '') }, sombrasCableadas)
controlPositivo('  y sombras también de pie en la pared', { ...DE_LAS_SOMBRAS, 'pie3d/armadas.ts': (DE_LAS_SOMBRAS['pie3d/armadas.ts'] ?? '').replace(' = enElFinal ? sombrasDeLaCaida(s.caida, segundos) : 0', ' = sombrasDeLaCaida(s.caida, segundos)') }, sombrasCableadas)
controlPositivo('  y una reserva en la sombra de cada cuadro', { ...DE_LAS_SOMBRAS, 'final/sombraDeLaPieza.ts': (DE_LAS_SOMBRAS['final/sombraDeLaPieza.ts'] ?? '').replace('  const S = SOMBRA_DE_LA_PIEZA\n', '  const S = SOMBRA_DE_LA_PIEZA\n  const tmp = [p.x]\n  if (tmp.length < 0) return S\n') }, sombrasCableadas)

// 2 · La anisotropía de las texturas que se miran de canto (la trama del moiré, las siluetas de la formación): al máximo de la placa
// (16 pedidas; three las acota a lo que hay al subir la textura), en los dos lugares, sin el 4 de antes.
const ANISOTROPIA = { constante: ANISOTROPIA_DE_LAS_TRAMAS, moire: leer('_lib/escena/MoireScreen.tsx'), copia: leer('_lib/escena/formacion/copia.ts'), three: readFileSync('node_modules/three/src/renderers/webgl/WebGLTextures.js', 'utf8') }
const anisotropiaBien = (a: typeof ANISOTROPIA): boolean => a.constante >= 8 && a.constante <= 16 && a.moire.includes('texture.anisotropy = ANISOTROPIA_DE_LAS_TRAMAS') && a.copia.includes('textura.anisotropy = ANISOTROPIA_DE_LAS_TRAMAS') &&
  !/anisotropy = \d/.test(a.moire) && !/anisotropy = \d/.test(a.copia) && a.three.includes('Math.min( texture.anisotropy, capabilities.getMaxAnisotropy() )')
afirmar(anisotropiaBien(ANISOTROPIA), `  la anisotropía de la trama del moiré y de las siluetas de la formación: ${String(ANISOTROPIA_DE_LAS_TRAMAS)} pedidas en los dos lugares (eran 4); three las acota al máximo de la placa al subir la textura`)
controlPositivo('  el detector VE el 4 de antes en la trama', { ...ANISOTROPIA, moire: ANISOTROPIA.moire.replace('texture.anisotropy = ANISOTROPIA_DE_LAS_TRAMAS', 'texture.anisotropy = 4') }, anisotropiaBien)
controlPositivo('  y un three que no acota a la placa', { ...ANISOTROPIA, three: ANISOTROPIA.three.replace('Math.min( texture.anisotropy, capabilities.getMaxAnisotropy() )', 'texture.anisotropy') }, anisotropiaBien)

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
const RECIBO = JSON.parse(readFileSync('docs/rediseno/entregas/pulido-19/mini-medido.json', 'utf8')) as { readonly medidas: Medidas; readonly antes: Medidas; readonly red: Medidas; readonly cristal: Medidas }
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

// Q3 · el cristal medido (la sección `cristal` del recibo): con el cristal ningún cuadro de más de 20 ms, y lo que cuesta (con menos sin,
// en calma de día a 1440, la misma tanda) acotado.
const CON_CRISTAL = { '1440': ['calma-noche-cristal', 'calma-dia-cristal', 'calma-dia', 'lejos-dia-cristal'], '390': ['calma-noche-cristal'] } as const
const COSTO_DEL_CRISTAL_MS = 1.5
const costoDelCristal = (m: Medidas): number => (m['1440']?.['calma-dia-cristal']?.cuadro?.media ?? 99) - (m['1440']?.['calma-dia']?.cuadro?.media ?? 0)
const cristalMedidoBien = (m: Medidas): boolean => Object.entries(CON_CRISTAL).every(([w, cs]) => cs.every((c) => {
  const x = m[w]?.[c]
  return x !== undefined && x.cuadro !== null && x.heap !== null && x.cuadro.mayoresDe20 === 0 && x.errores === 0 && x.heap.kbPorCuadro <= TOPE_KB
})) && costoDelCristal(m) <= COSTO_DEL_CRISTAL_MS
afirmar(cristalMedidoBien(RECIBO.cristal), `  con el cristal, ningún cuadro de más de 20 ms ni basura nueva; el cristal cuesta ${costoDelCristal(RECIBO.cristal).toFixed(2)} ms por cuadro de día a 1440 (≤ ${String(COSTO_DEL_CRISTAL_MS)}; de noche ${String(RECIBO.cristal['1440']?.['calma-noche-cristal']?.cuadro?.media)} ms, a 390 ${String(RECIBO.cristal['390']?.['calma-noche-cristal']?.cuadro?.media)})`)
controlPositivo('  el detector VE un cristal que cuesta 3 ms', { ...RECIBO.cristal, '1440': { ...RECIBO.cristal['1440'], 'calma-dia-cristal': { ...(RECIBO.cristal['1440']?.['calma-dia-cristal'] as Medida), cuadro: { mayoresDe20: 0, media: (RECIBO.cristal['1440']?.['calma-dia']?.cuadro?.media ?? 0) + 3, maximo: 5 } } } }, cristalMedidoBien)

const bajoBien = (m: Medidas, a: Medidas): boolean => (m['1440']?.['calma-noche']?.heap?.kbPorCuadro ?? 99) * 4 < (a['1440']?.['calma-noche']?.heap?.kbPorCuadro ?? 0)
afirmar(bajoBien(RECIBO.medidas, RECIBO.antes), '  la basura por cuadro bajó al menos cuatro veces respecto de antes del arreglo')
controlPositivo('  el detector VE una basura que no bajó', RECIBO.antes, (m: Medidas) => bajoBien(m, RECIBO.antes))

cerrar('s70-pulido-19')
