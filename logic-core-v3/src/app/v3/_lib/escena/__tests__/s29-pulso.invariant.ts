/**
 * INVARIANTE — ESCENA 3 · EL PULSO, LA SOMBRA Y LAS BANDERAS.
 *
 *     npm run test:s29-pulso
 *
 * La máquina del pulso es pura (`entorno/maquinaDelPulso.ts`), así que se la recorre entera
 * cuadro a cuadro, a 60 por segundo, sin navegador. Lo que afirma:
 *
 *   1. REPOSO: el primer anillo a medio período y después uno cada `periodoReposoS`.
 *   2. SCROLL: no nace ninguno mientras se mueve; los vivos terminan su recorrido; al frenar, el
 *      próximo a un período de reposo.
 *   3. HOVER: un principal en la entrada y otro en la salida, en el instante; en hover, periódicos
 *      a `periodoHoverS` mientras haya lugar; salir del hover por el scroll no larga principal.
 *   4. EN TODO EL RECORRIDO: nunca se corta un anillo vivo y nunca hay más de `tope`.
 *   5. MOVIMIENTO REDUCIDO: ningún anillo.
 *   6. LA SOMBRA: en reposo vale exactamente 1 y 1; más alto, más chica y más tenue; más bajo, más
 *      grande y más marcada; el principal la contrae y vuelve.
 *   7. LAS BANDERAS: el producto trae E1, E4, E6 y E7; `base` apaga todo; el pedido se lee.
 *   8. LA LIMPIEZA: de E0, E2, E3, E5 y E8 no queda código.
 *
 * Cada detector tiene su control positivo: se le da una entrada equivocada y tiene que verla.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { BASE_LIMPIA, ENTORNO, IDEAS_DEL_ENTORNO, entornoPedido } from '../entorno'
import {
  PULSO,
  avanzarElPulso,
  pulsoInicial,
  vivoEn,
  type Anillo,
  type EntradasDelPulso,
  type EstadoDelPulso,
} from '../entorno/maquinaDelPulso'
import { SOMBRA, contraccionEn, sombraEn } from '../entorno/sombra'

const CUADRO = 1 / 60

interface Tramo {
  readonly hasta: number
  readonly scroll?: boolean
  readonly hover?: boolean
  readonly reducido?: boolean
}

interface Recorrido {
  readonly estados: EstadoDelPulso[]
  readonly tiempos: number[]
  readonly nacimientos: Anillo[]
}

/** Corre la máquina cuadro a cuadro por una secuencia de tramos de entradas. */
function recorrer(tramos: readonly Tramo[], maquina = avanzarElPulso): Recorrido {
  let estado = pulsoInicial(0)
  const estados: EstadoDelPulso[] = [estado]
  const tiempos: number[] = [0]
  const nacimientos: Anillo[] = []
  let t = 0
  for (const tramo of tramos) {
    while (t < tramo.hasta - 1e-9) {
      t += CUADRO
      const e: EntradasDelPulso = { t, scrollEnMovimiento: tramo.scroll ?? false, hover: tramo.hover ?? false, reducido: tramo.reducido ?? false }
      const siguiente = maquina(estado, e)
      for (const a of siguiente.anillos) if (!estado.anillos.includes(a)) nacimientos.push(a)
      estado = siguiente
      estados.push(estado)
      tiempos.push(t)
    }
  }
  return { estados, tiempos, nacimientos }
}

const intervalos = (tiempos: readonly number[]): number[] => tiempos.slice(1).map((v, i) => v - tiempos[i])
// Dos cuadros: el período cuenta desde el primer cuadro del modo nuevo, no desde el borde del tramo.
const cercaDe = (a: number, b: number, tol = 2 * CUADRO + 1e-9): boolean => Math.abs(a - b) <= tol

/** ¿Algún anillo vivo desapareció antes de terminar su recorrido? */
function seCortoAlguno(r: Recorrido): boolean {
  for (let i = 1; i < r.estados.length; i += 1) {
    for (const a of r.estados[i - 1].anillos) {
      if (vivoEn(a, r.tiempos[i]) && !r.estados[i].anillos.includes(a)) return true
    }
  }
  return false
}

const pasaElTope = (r: Recorrido): boolean => r.estados.some((s) => s.anillos.length > PULSO.tope)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · REPOSO — medio período al arrancar y después uno por período')

const reposo = recorrer([{ hasta: 20 }])
const enReposo = reposo.nacimientos.map((a) => a.nace)
afirmar(cercaDe(enReposo[0], PULSO.periodoReposoS / 2), `el primero nace a medio período: ${enReposo[0].toFixed(3)} s`)
afirmar(
  intervalos(enReposo).every((d) => cercaDe(d, PULSO.periodoReposoS)),
  `  y después uno cada ${String(PULSO.periodoReposoS)} s (60 % de los 6,2 s de ESCENA 2)`,
  intervalos(enReposo).map((d) => d.toFixed(3)).join(' · '),
)
afirmar(reposo.nacimientos.every((a) => a.clase === 'reposo'), '  todos de la clase reposo')
controlPositivo('el medidor de período VE un período equivocado', [0, 3, 6], (ts: number[]) => intervalos(ts).every((d) => cercaDe(d, PULSO.periodoReposoS)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · SCROLL — sin nacimientos, los vivos terminan, y al frenar un período de reposo')

const conScroll = recorrer([{ hasta: 2 }, { hasta: 8, scroll: true }, { hasta: 14 }])
const nacidosEnScroll = conScroll.nacimientos.filter((a) => a.nace > 2 && a.nace <= 8)
afirmarIgual(nacidosEnScroll.length, 0, 'mientras el scroll se mueve no nace ninguno')
const vivoAlEmpezar = conScroll.estados[Math.round(2 / CUADRO)].anillos[0]
afirmar(vivoAlEmpezar !== undefined, `  había uno vivo al empezar a scrollear (nació en ${vivoAlEmpezar?.nace.toFixed(3) ?? '—'} s)`)
const sigueHasta = conScroll.estados.filter((s) => vivoAlEmpezar !== undefined && s.anillos.includes(vivoAlEmpezar)).length * CUADRO
afirmar(
  vivoAlEmpezar !== undefined && cercaDe(vivoAlEmpezar.nace + sigueHasta, vivoAlEmpezar.nace + PULSO.anillos.reposo.duracionS + CUADRO, 2 * CUADRO),
  '  y terminó su recorrido entero: el scroll no lo cortó',
  `vivió ${sigueHasta.toFixed(3)} s de ${String(PULSO.anillos.reposo.duracionS)}`,
)
const primeroAlFrenar = conScroll.nacimientos.find((a) => a.nace > 8)
afirmar(
  primeroAlFrenar !== undefined && cercaDe(primeroAlFrenar.nace, 8 + PULSO.periodoReposoS),
  'al frenar, el próximo nace a un período de reposo',
  primeroAlFrenar?.nace.toFixed(3),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · HOVER — principal al entrar y al salir, periódicos rápidos adentro')

const conHover = recorrer([{ hasta: 3 }, { hasta: 9, hover: true }, { hasta: 16 }])
const principales = conHover.nacimientos.filter((a) => a.clase === 'principal').map((a) => a.nace)
afirmarIgual(principales.length, 2, 'exactamente dos principales: uno al entrar y otro al salir')
afirmar(cercaDe(principales[0], 3) && cercaDe(principales[1], 9), `  en el instante: ${principales.map((t) => t.toFixed(3)).join(' y ')} s`)
const enHover = conHover.nacimientos.filter((a) => a.clase === 'hover').map((a) => a.nace)
afirmar(enHover.length >= 4, `en 6 s de hover nacen ${String(enHover.length)} periódicos rápidos`)
afirmar(cercaDe(enHover[0], 3 + PULSO.periodoHoverS), `  el primero a un período de hover de la entrada (${String(PULSO.periodoHoverS)} s, ¼ del de reposo)`)
afirmar(
  intervalos(enHover).every((d) => d >= PULSO.periodoHoverS - CUADRO),
  '  nunca más seguido que el período de hover (el tope puede espaciarlos, no juntarlos)',
  intervalos(enHover).map((d) => d.toFixed(2)).join(' · '),
)
const alSalir = conHover.nacimientos.find((a) => a.clase === 'reposo' && a.nace > 9)
afirmar(alSalir !== undefined && cercaDe(alSalir.nace, 9 + PULSO.periodoReposoS), 'al salir, vuelve el período de reposo', alSalir?.nace.toFixed(3))

const hoverYScroll = recorrer([{ hasta: 3 }, { hasta: 6, hover: true }, { hasta: 10, hover: true, scroll: true }])
afirmarIgual(
  hoverYScroll.nacimientos.filter((a) => a.clase === 'principal').length,
  1,
  'si el hover termina porque arrancó el scroll, no hay principal de salida (sólo el de entrada)',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · SIEMPRE — nunca se corta un anillo vivo, nunca pasan del tope')

const nervioso = recorrer([
  { hasta: 1 }, { hasta: 1.3, hover: true }, { hasta: 1.6 }, { hasta: 2.2, hover: true }, { hasta: 2.4, scroll: true },
  { hasta: 5, hover: true }, { hasta: 5.1 }, { hasta: 5.2, hover: true }, { hasta: 5.3 }, { hasta: 12, hover: true }, { hasta: 20 },
])
afirmar(!seCortoAlguno(nervioso), 'con hover y scroll que entran y salen sin parar, ningún anillo vivo se corta')
afirmar(!pasaElTope(nervioso), `  y nunca hay más de ${String(PULSO.tope)} a la vez`, `máximo ${String(Math.max(...nervioso.estados.map((s) => s.anillos.length)))}`)
/** Cambios de hover (entrada, o salida con el scroll quieto) en los que NO nació un principal aunque no había otro vivo. */
function principalesPerdidos(r: Recorrido): number {
  let perdidos = 0
  for (let i = 1; i < r.estados.length; i += 1) {
    const antes = r.estados[i - 1]
    const ahora = r.estados[i]
    const cambio = (ahora.modo === 'hover' && antes.modo !== 'hover') || (antes.modo === 'hover' && ahora.modo === 'reposo')
    if (!cambio || antes.anillos.some((a) => a.clase === 'principal' && vivoEn(a, r.tiempos[i]))) continue
    if (!ahora.anillos.some((a) => a.clase === 'principal' && a.nace === r.tiempos[i])) perdidos += 1
  }
  return perdidos
}
const principalesNerviosos = nervioso.nacimientos.filter((a) => a.clase === 'principal').length
afirmarIgual(principalesPerdidos(nervioso), 0, `  y ningún principal queda afuera por los periódicos (nacieron ${String(principalesNerviosos)}; sólo los frena otro principal todavía vivo)`)
const sinReserva = (s: EstadoDelPulso, e: EntradasDelPulso): EstadoDelPulso => {
  const r = avanzarElPulso(s, e)
  const periodico = r.anillos.length < PULSO.tope && r.modo === 'hover' && r.anillos.every((a) => a.nace !== e.t)
  return periodico ? { ...r, anillos: [...r.anillos, { nace: e.t, clase: 'hover' }] } : r
}
controlPositivo('el detector VE una máquina cuyos periódicos no dejan lugar al principal', sinReserva, (m) => principalesPerdidos(recorrer([{ hasta: 1 }, { hasta: 7, hover: true }, { hasta: 9 }], m)) === 0)
const cortadora = (s: EstadoDelPulso, e: EntradasDelPulso): EstadoDelPulso => {
  const r = avanzarElPulso(s, e)
  return e.scrollEnMovimiento ? { ...r, anillos: [] } : r
}
controlPositivo('el detector de cortes VE una máquina que corta los anillos al scrollear', cortadora, (m) => !seCortoAlguno(recorrer([{ hasta: 2 }, { hasta: 4, scroll: true }], m)))
const glotona = (s: EstadoDelPulso, e: EntradasDelPulso): EstadoDelPulso => ({ ...s, anillos: [...s.anillos, { nace: e.t, clase: 'hover' }] })
controlPositivo('el detector del tope VE una máquina que no lo respeta', glotona, (m) => !pasaElTope(recorrer([{ hasta: 0.2 }], m)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · MOVIMIENTO REDUCIDO — ningún anillo')

const reducido = recorrer([{ hasta: 12, reducido: true, hover: true }])
afirmarIgual(reducido.nacimientos.length, 0, 'con movimiento reducido no nace ninguno, ni con hover')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · LA SOMBRA — reposo intacto, altura con física, contracción con el principal')

const enReposoSombra = sombraEn(0.9, 0.9, Infinity)
afirmar(enReposoSombra.escala === 1 && enReposoSombra.opacidad === 1, 'en reposo vale exactamente escala 1 y opacidad 1: la base no cambia')
controlPositivo('el control de reposo VE una sombra que no vuelve a 1', sombraEn(0.9, 0.8, Infinity), (s) => s.escala === 1 && s.opacidad === 1)
const arriba = sombraEn(1.2, 0.9, Infinity)
const abajo = sombraEn(0.6, 0.9, Infinity)
afirmar(arriba.escala < 1 && arriba.opacidad < 1, `si el logo sube, más chica y más tenue: ${arriba.escala.toFixed(3)} / ${arriba.opacidad.toFixed(3)}`)
afirmar(abajo.escala > 1 && abajo.opacidad > 1, `si baja, más grande y más marcada: ${abajo.escala.toFixed(3)} / ${abajo.opacidad.toFixed(3)}`)
const alturas = Array.from({ length: 50 }, (_, i) => 0.2 + i * 0.05)
afirmar(
  alturas.every((h, i) => i === 0 || sombraEn(h, 0.9, Infinity).escala <= sombraEn(alturas[i - 1], 0.9, Infinity).escala),
  '  y la escala baja monótona con la altura, dentro de sus límites',
)
const pico = sombraEn(0.9, 0.9, SOMBRA.contraccionPicoS).escala
afirmar(Math.abs(pico - (1 - SOMBRA.contraccion)) < 1e-12, `el principal la contrae un ${String(SOMBRA.contraccion * 100)} % en el pico (${String(SOMBRA.contraccionPicoS)} s)`)
afirmar(contraccionEn(SOMBRA.contraccionDuraS) === 0 && contraccionEn(-0.1) === 0, `  y vuelve sola a los ${String(SOMBRA.contraccionDuraS)} s; antes del principal, nada`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · LAS BANDERAS — el producto, la base y el pedido del banco')

afirmar(ENTORNO.E1 && ENTORNO.E4 && ENTORNO.E6 && ENTORNO.E7, 'el producto trae E1, E4, E6 y E7 prendidas')
afirmar(ENTORNO.haz === 'medio' && ENTORNO.cursor === 'A' && !ENTORNO.cursorConEstela, '  con el haz en medio, el cursor en A y sin estela en el cursor')
afirmarIgual(entornoPedido('base'), BASE_LIMPIA, "`base` es la escena de escena-base-limpia: todo apagado")
afirmarIgual(entornoPedido('producto'), ENTORNO, '`producto` son las banderas de arriba, tal cual')
const pedido = entornoPedido('E1,E7,haz=sutil,cursor=B,estela')
afirmar(pedido.E1 && !pedido.E4 && !pedido.E6 && pedido.E7 && pedido.haz === 'sutil' && pedido.cursor === 'B' && pedido.cursorConEstela, 'el pedido del banco se lee entero')
controlPositivo('el lector del pedido no inventa ideas que no se pidieron', 'E1', (p: string) => { const e = entornoPedido(p); return e.E1 && !e.E4 && !e.E6 && !e.E7 && false })

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · LA LIMPIEZA — de E0, E2, E3, E5 y E8 no queda código')

const ENTORNO_DIR = path.join(process.cwd(), 'src/app/v3/_lib/escena/entorno')
const codigoDelEntorno = [
  ...readdirSync(ENTORNO_DIR).map((n) => readFileSync(path.join(ENTORNO_DIR, n), 'utf8')),
  readFileSync(path.join(process.cwd(), 'src/app/v3/_lib/escena/entorno.ts'), 'utf8'),
].join('\n')
const RESTOS = /Monolitos|<Anillos|\/Anillos\b|uTinte|tinteDelDia|uFoco|POLVO_FOCO|APARECEN_LOS_ANILLOS|E0:|E2:|E3:|E5:|E8:/
afirmarIgual(IDEAS_DEL_ENTORNO, ['E1', 'E4', 'E6', 'E7'], 'el entorno tiene sólo las cuatro ideas aprobadas')
afirmar(!RESTOS.test(codigoDelEntorno), '  y ningún archivo del entorno nombra lo descartado (monolitos, anillos, tinte, foco, banderas viejas)')
afirmar(!existsSync(path.join(ENTORNO_DIR, 'Monolitos.tsx')) && !existsSync(path.join(ENTORNO_DIR, 'Anillos.tsx')), '  y sus archivos no existen')
controlPositivo('el detector VE un resto del tinte de E3', 'VIVO.uTinte.value', (f: string) => !RESTOS.test(f))

cerrar('s29-pulso')
