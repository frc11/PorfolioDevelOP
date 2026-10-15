/**
 * PULIDO 28 — LOS DETALLES FINALES DEL PIE, LA RED Y EL CRISTAL. Cada cosa con su control positivo (el detector ve el estado de antes o
 * uno roto a propósito).
 *   AA7 · la salida del pie, determinística: una máquina de estados (presente → saliendo → ida); con la rueda lenta, la rápida, el trackpad
 *         y el teclado, desde el final entero y desde el rebobinado, la página no sube hasta que el pie se fue entero, la salida corre en
 *         su tiempo y después el scroll se suelta.
 */
import { empiezaUnGesto, type GestoDeScroll } from '../gestosDelScroll'
import { SALIDAS_DEL_PIE, SALIDA_EN_VIVO, pasoDeLaSalida, pedirLaSalida, type FaseDeLaSalida } from '../pie3d/salidas'
import { RELOJ_DEL_FINAL, decidirElGesto, pasoDelReloj, relojQuieto, type RelojDelFinal } from '../escena/final/recorridoDelFinal'
import { avanceDelPie, salidaDelPie } from '../escena/pie3d/coreografia'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const DT = 1 / 60
/** La fase de la salida (leída por una función: la escriben las de `salidas.ts`). */
const fase = (): FaseDeLaSalida => SALIDA_EN_VIVO.fase

// ═══════════════════════════════════════════════════════════════════════════
titulo('AA7 · La salida del pie: con los cuatro gestos y desde los dos estados, la página no sube hasta que el pie se fue; la salida en su tiempo; después se suelta')

/** Un evento de un gesto hacia arriba: cuándo (s), de dónde, cuánto movería (px) y si es un apoyo (una tecla apretada). */
interface Evento { readonly t: number; readonly origen: GestoDeScroll['origen']; readonly magnitud: number; readonly apoyo: boolean }
/** Los cuatro gestos (como los del banco, `p28-aa7.ts`), cada uno tres veces con una pausa en el medio. */
function gesto(caso: string, desde: number): Evento[] {
  const e: Evento[] = []
  if (caso === 'lenta') for (let k = 0; k < 8; k += 1) e.push({ t: desde + k * 0.35, origen: 'rueda', magnitud: 100, apoyo: false })
  else if (caso === 'rapida') for (let k = 0; k < 30; k += 1) e.push({ t: desde + k * 0.016, origen: 'rueda', magnitud: 240, apoyo: false })
  else if (caso === 'trackpad') for (let k = 0; k < 100; k += 1) e.push({ t: desde + k * 0.016, origen: 'rueda', magnitud: Math.max(2, 70 * Math.exp(-k / 30)), apoyo: false })
  else for (let k = 0; k < 6; k += 1) e.push({ t: desde + k * 0.3, origen: 'tecla', magnitud: 0, apoyo: true })
  return e
}
const CASOS = ['lenta', 'rapida', 'trackpad', 'teclado'] as const
type Decide = typeof decidirElGesto

/** Lo que pasó en una corrida: si la página subió con el pie todavía a la vista, si se fue, cuánto duró la salida y si después se soltó. */
interface Corrida { readonly subioAntes: boolean; readonly seFue: boolean; readonly salidaS: number; readonly soltoDespues: boolean }

/** Una corrida en Node: el reloj del final, la decisión de cada evento, la salida y lo mostrado del pie, cuadro a cuadro (a 60 por segundo). */
function correr(caso: string, desde: 'entero' | 'parado', decide: Decide): Corrida {
  const FONDO = 10000
  const r: RelojDelFinal = desde === 'entero' ? { ...relojQuieto(), fase: 'corre', fin: 1 } : { ...relojQuieto(), fase: 'parada', fin: 0 }
  SALIDA_EN_VIVO.fase = 'presente'
  SALIDA_EN_VIVO.aLaVista = true
  const eventos = [...gesto(caso, 0.1), ...gesto(caso, 3.2), ...gesto(caso, 6.3)]
  let scroll = FONDO
  let mostrado = 1
  let rebobinar = false
  let ultimo: { origen: string; sentido: number; t: number } | null = null
  const G = { desde: 0, pico: 0, retenido: false, gesto: 0 }
  let subioAntes = false
  let empezo = -1
  let termino = -1
  let soltoDespues = false
  let k = 0
  for (let t = 0; t < 9; t += DT) {
    const antes = fase()
    for (; k < eventos.length && eventos[k].t <= t; k += 1) {
      const ev = eventos[k]
      const nuevo = empiezaUnGesto(ultimo, ev.origen, -1, ev.t * 1000, ev.apoyo)
      ultimo = { origen: ev.origen, sentido: -1, t: ev.t * 1000 }
      G.gesto = ev.t
      if (nuevo) {
        G.desde = ev.t
        G.pico = 0
      }
      const enLaCola = ev.magnitud > 0 && ev.magnitud <= RELOJ_DEL_FINAL.colaDelGesto * G.pico
      G.pico = Math.max(G.pico, ev.magnitud)
      const d = decide(r, scroll >= FONDO - 2, -1, nuevo, G.retenido, ev.t - G.desde, enLaCola, { aLaVista: SALIDA_EN_VIVO.aLaVista, fase: fase() })
      G.retenido = d.retiene
      if (d.rebobina) rebobinar = true
      if (d.sale === true) pedirLaSalida()
      if (!d.retiene) {
        if (mostrado > 1e-3) subioAntes = true
        else soltoDespues = true
        scroll -= ev.origen === 'tecla' ? 40 : ev.magnitud
      }
    }
    pasoDelReloj(r, { alFondo: scroll >= FONDO - 2, pieEntero: mostrado >= 0.999, rebobinar, haciaAbajo: false, sinGestoS: t - G.gesto, viajeS: 0 }, DT)
    rebobinar = false
    const pedido = Math.min(1, Math.max(0, (scroll - (FONDO - 900)) / 900))
    mostrado = fase() === 'saliendo' ? salidaDelPie(mostrado, DT, SALIDAS_DEL_PIE.salidaS) : avanceDelPie(mostrado, fase() === 'presente' ? pedido : 0, false, DT, fase() !== 'presente')
    pasoDeLaSalida(mostrado, pedido, scroll)
    if (antes !== 'saliendo' && fase() !== 'presente' && empezo < 0) empezo = t
    if (fase() === 'ida' && termino < 0) termino = t
  }
  SALIDA_EN_VIVO.fase = 'presente'
  SALIDA_EN_VIVO.aLaVista = false
  return { subioAntes, seFue: termino > 0, salidaS: empezo >= 0 && termino > 0 ? termino - empezo : Number.NaN, soltoDespues }
}

const corridas = (decide: Decide): Record<string, Corrida> =>
  Object.fromEntries((['entero', 'parado'] as const).flatMap((desde) => CASOS.map((caso) => [`${desde} ${caso}`, correr(caso, desde, decide)])))
const salidaBien = (c: Record<string, Corrida>): boolean =>
  Object.values(c).every((x) => !x.subioAntes && x.seFue && Math.abs(x.salidaS - SALIDAS_DEL_PIE.salidaS) <= 2 * DT && x.soltoDespues)
const LAS_CORRIDAS = corridas(decidirElGesto)
afirmar(salidaBien(LAS_CORRIDAS), `  rueda lenta, rueda rápida, trackpad y teclado, desde el final entero y desde el rebobinado: la página no sube con el pie a la vista, el pie se va entero en ${String(SALIDAS_DEL_PIE.salidaS)} s y después el scroll se suelta`, Object.entries(LAS_CORRIDAS).map(([k, x]) => `${k}: ${x.subioAntes ? 'subió antes' : 'quieta'}, ${Number.isNaN(x.salidaS) ? 'sin salida' : `${x.salidaS.toFixed(2)} s`}${x.soltoDespues ? ', suelta' : ''}`).join(' · '))

/** El control: la decisión de PULIDO 27 (sólo el gesto que EMPIEZA con el final parado pide la salida; lo retenido se suelta a su tope). */
const DE_PULIDO_27: Decide = (r, alFondo, sentido, nuevo, retenido, duraS, enLaCola, pie) => {
  if (!alFondo || sentido > 0) return { retiene: false, rebobina: false }
  if (pie?.fase === 'saliendo') return { retiene: true, rebobina: false }
  if (pie?.fase === 'ida') return { retiene: false, rebobina: false }
  if (nuevo) return r.fase === 'corre' && r.fin > 0 ? { retiene: true, rebobina: true } : r.fase === 'parada' && pie?.aLaVista === true ? { retiene: true, rebobina: false, sale: true } : { retiene: false, rebobina: false }
  return { retiene: retenido && (duraS < RELOJ_DEL_FINAL.topeDelGestoS || enLaCola), rebobina: false }
}
controlPositivo('  el detector VE la salida de PULIDO 27 (desde el final entero la página subía a mitad del rebobinado, sin salida)', corridas(DE_PULIDO_27), salidaBien)
controlPositivo('  y una salida del mismo largo que un viaje (medio segundo)', Object.fromEntries(Object.entries(LAS_CORRIDAS).map(([k, x]) => [k, { ...x, salidaS: 0.5 }])), salidaBien)

cerrar('s72-pulido-28')
