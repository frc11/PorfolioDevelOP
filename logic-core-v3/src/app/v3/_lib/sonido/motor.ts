import { Howl, Howler } from 'howler'

import type { Oido } from './bus'
import { FUNDIDO_DEL_AMBIENTE_MS, SONIDOS, type Pedido } from './catalogo'
import type { Elegidos, Volumenes } from './preferencia'
import { CORTES_DEL_AMBIENTE, CORTES_DEL_SPRITE, type Ambiente, type Sonido } from './sprite'

/**
 * [3D Y SONIDO] T2 · EL MOTOR — howler.js (MIT) con UN sprite (`public/v3/sonido/sonidos.{webm,m4a}`: Opus y, para
 * Safari, AAC). Este módulo llega en un `import()` recién cuando alguien prende el sonido (o, si lo había dejado
 * prendido, con su primera acción en la página): antes no se descarga ni howler ni el archivo.
 *
 *   · Un sonido que se pide antes de que el archivo cargue se descarta (un clic que suena medio segundo tarde es peor
 *     que uno que no suena).
 *   · Cada uno con su volumen (el del catálogo o el de la página de prueba) por el general (`Howler.volume`).
 *   · `callar` lo funde a cero en 300 ms y lo para (el haz que se apaga a mitad del guion).
 *
 * [RETOQUE 3D] El clic de la barra y el de los CTA suenan con el candidato elegido (`Elegidos`). Y UN ambiente para toda la
 * página, en su propio archivo (`ambiente-{a,b,c}`), que se descarga recién la primera vez que tiene que sonar: un bucle
 * que se toca entre sus cortes (adentro del colchón: sin costura), con un fundido al entrar, al irse y al cambiar de
 * candidato; `ambiente(false)` (movimiento reducido, la pestaña oculta) lo funde a cero.
 */
export interface MotorDelSonido extends Oido {
  /** El sonido del sprite tal cual (la página de prueba: cada candidato). */
  readonly sonarCrudo: (s: Sonido) => void
  readonly ambiente: (suena: boolean) => void
  /** La página de prueba: tocar un ambiente en particular (o ninguno: el elegido, con `ambiente`). */
  readonly probarAmbiente: (a: Ambiente | null) => void
  readonly elegir: (e: Elegidos) => void
  readonly volumen: (s: keyof Volumenes, v: number) => void
  readonly cargado: () => boolean
  readonly soltar: () => void
}

const FUENTES = ['/v3/sonido/sonidos.webm', '/v3/sonido/sonidos.m4a']
const fuentesDelAmbiente = (a: Ambiente): string[] => [`/v3/sonido/ambiente-${a}.webm`, `/v3/sonido/ambiente-${a}.m4a`]
const CALLAR_MS = 300

export function crearElMotor(inicial: Volumenes, elegidosAlEmpezar: Elegidos): MotorDelSonido {
  const volumenes = { ...inicial }
  let elegidos = elegidosAlEmpezar
  const sprite: Record<string, [number, number]> = {}
  for (const [nombre, corte] of Object.entries(CORTES_DEL_SPRITE)) sprite[nombre] = [corte[0], corte[1]]
  let cargado = false
  const howl = new Howl({ src: FUENTES, sprite, preload: true, onload: () => (cargado = true) })
  Howler.volume(volumenes.general)

  const ultimo = new Map<Sonido, number>()
  const sonando = new Map<Sonido, Set<number>>()
  const vivos = (s: Sonido): Set<number> => {
    let ids = sonando.get(s)
    if (ids === undefined) {
      ids = new Set()
      sonando.set(s, ids)
    }
    return ids
  }
  const delPedido = (p: Pedido): Sonido => (p === 'clic-de-la-barra' ? `barra-${elegidos.barra}` : p === 'clic-del-cta' ? `cta-${elegidos.cta}` : p)

  const sonarCrudo = (s: Sonido): void => {
    const de = SONIDOS[s]
    if (!cargado) return
    const ahora = performance.now()
    if (ahora - (ultimo.get(s) ?? -Infinity) < de.separacionMs) return
    const ids = vivos(s)
    if (de.exclusivo && [...ids].some((id) => howl.playing(id))) return
    ultimo.set(s, ahora)
    const id = howl.play(s)
    howl.volume(volumenes[s], id)
    ids.add(id)
    howl.once('end', () => ids.delete(id), id)
  }

  const callar = (p: Pedido): void => {
    const s = delPedido(p)
    for (const id of vivos(s)) {
      howl.fade(volumenes[s], 0, CALLAR_MS, id)
      window.setTimeout(() => howl.stop(id), CALLAR_MS + 20)
    }
    vivos(s).clear()
  }

  // El ambiente: uno por archivo, descargado la primera vez que suena; el que toca ahora suena, los otros se funden a cero.
  const bucles = new Map<Ambiente, { readonly howl: Howl; id: number | null; vol: number; listo: boolean }>()
  let queSuena: Ambiente | null = null
  const llevar = (a: Ambiente, objetivo: number): void => {
    let b = bucles.get(a)
    if (b === undefined) {
      if (objetivo <= 0) return
      const [desde, dura] = CORTES_DEL_AMBIENTE[a]
      const nuevo = { howl: new Howl({ src: fuentesDelAmbiente(a), sprite: { bucle: [desde, dura, true] }, preload: true }), id: null as number | null, vol: 0, listo: false }
      nuevo.howl.once('load', () => {
        nuevo.listo = true
        llevar(a, queSuena === a ? volumenes.ambiente : 0)
      })
      bucles.set(a, nuevo)
      b = nuevo
    }
    if (!b.listo) return
    if (b.id === null) {
      if (objetivo <= 0) return
      b.id = b.howl.play('bucle')
      b.howl.volume(0, b.id)
      b.vol = 0
    }
    if (Math.abs(objetivo - b.vol) < 0.002) return
    b.howl.fade(b.vol, objetivo, FUNDIDO_DEL_AMBIENTE_MS, b.id)
    b.vol = objetivo
  }
  const tocar = (a: Ambiente | null): void => {
    queSuena = a
    for (const otro of ['a', 'b', 'c'] as const) llevar(otro, otro === a ? volumenes.ambiente : 0)
  }
  let suenaElAmbiente = false
  let probando: Ambiente | null = null

  return {
    sonar: (p) => sonarCrudo(delPedido(p)),
    sonarCrudo,
    callar,
    ambiente: (suena) => {
      suenaElAmbiente = suena
      if (probando === null) tocar(suena ? elegidos.ambiente : null)
    },
    probarAmbiente: (a) => {
      probando = a
      tocar(a ?? (suenaElAmbiente ? elegidos.ambiente : null))
    },
    elegir: (e) => {
      elegidos = e
      if (probando === null && suenaElAmbiente) tocar(e.ambiente)
    },
    cargado: () => cargado,
    volumen: (s, v) => {
      volumenes[s] = v
      if (s === 'general') Howler.volume(v)
      else if (s === 'ambiente') tocar(queSuena)
      else for (const id of vivos(s)) howl.volume(v, id)
    },
    soltar: () => {
      howl.unload()
      for (const b of bucles.values()) b.howl.unload()
      bucles.clear()
      sonando.clear()
    },
  }
}
