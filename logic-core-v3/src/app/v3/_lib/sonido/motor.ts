import { Howl, Howler } from 'howler'

import type { Oido } from './bus'
import { FUNDIDO_DEL_AMBIENTE_MS, SONIDOS } from './catalogo'
import type { Volumenes } from './preferencia'
import { CORTES_DEL_SPRITE, type Sonido } from './sprite'

/**
 * [3D Y SONIDO] T2 · EL MOTOR — howler.js (MIT) con UN sprite (`public/v3/sonido/sonidos.{webm,m4a}`: Opus y, para
 * Safari, AAC). Este módulo llega en un `import()` recién cuando alguien prende el sonido (o, si lo había dejado
 * prendido, con su primera acción en la página): antes no se descarga ni howler ni el archivo.
 *
 *   · Un sonido que se pide antes de que el archivo cargue se descarta (un clic que suena medio segundo tarde es peor
 *     que uno que no suena). Los ambientes arrancan al cargar, si les toca.
 *   · Cada uno con su volumen (el del catálogo o el de la página de prueba) por el general (`Howler.volume`).
 *   · `callar` lo funde a cero en 300 ms y lo para (el haz que se apaga a mitad del guion, el amanecer que vuelve).
 *   · El ambiente: el de día y el de noche suenan juntos, en bucle, y la noche que se ve reparte el volumen entre los
 *     dos con un fundido; `null` (movimiento reducido, la pestaña oculta) los funde a cero.
 */
export interface MotorDelSonido extends Oido {
  readonly ambiente: (noche: number | null) => void
  readonly volumen: (s: Sonido | 'general', v: number) => void
  readonly cargado: () => boolean
  readonly soltar: () => void
}

const FUENTES = ['/v3/sonido/sonidos.webm', '/v3/sonido/sonidos.m4a']
const CALLAR_MS = 300

export function crearElMotor(inicial: Volumenes): MotorDelSonido {
  const volumenes = { ...inicial }
  const sprite: Record<string, [number, number] | [number, number, boolean]> = {}
  for (const [nombre, corte] of Object.entries(CORTES_DEL_SPRITE)) sprite[nombre] = corte.length === 3 ? [corte[0], corte[1], true] : [corte[0], corte[1]]
  let cargado = false
  const howl = new Howl({ src: FUENTES, sprite, preload: true, onload: () => {
    cargado = true
    if (nocheDelAmbiente !== null) ambiente(nocheDelAmbiente)
  } })
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

  const sonar = (s: Sonido): void => {
    const de = SONIDOS[s]
    if (!cargado || de.ambiente) return
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

  const callar = (s: Sonido): void => {
    for (const id of vivos(s)) {
      howl.fade(volumenes[s], 0, CALLAR_MS, id)
      window.setTimeout(() => howl.stop(id), CALLAR_MS + 20)
    }
    vivos(s).clear()
  }

  // El ambiente: los dos bucles, cada uno con el volumen que le toca ahora (para fundir desde ahí).
  let nocheDelAmbiente: number | null = null
  const bucles: Partial<Record<'dia' | 'noche', { id: number; vol: number }>> = {}
  const llevar = (s: 'dia' | 'noche', objetivo: number): void => {
    let b = bucles[s]
    if (b === undefined) {
      if (objetivo <= 0) return
      const id = howl.play(s)
      howl.volume(0, id)
      b = { id, vol: 0 }
      bucles[s] = b
    }
    if (Math.abs(objetivo - b.vol) < 0.002) return
    howl.fade(b.vol, objetivo, FUNDIDO_DEL_AMBIENTE_MS, b.id)
    b.vol = objetivo
  }
  const ambiente = (noche: number | null): void => {
    nocheDelAmbiente = noche
    if (!cargado) return
    const n = noche === null ? 0 : Math.min(1, Math.max(0, noche))
    llevar('dia', noche === null ? 0 : (1 - n) * volumenes.dia)
    llevar('noche', noche === null ? 0 : n * volumenes.noche)
  }

  return {
    sonar,
    callar,
    ambiente,
    cargado: () => cargado,
    volumen: (s, v) => {
      volumenes[s] = v
      if (s === 'general') Howler.volume(v)
      else if (s === 'dia' || s === 'noche') ambiente(nocheDelAmbiente)
      else for (const id of vivos(s)) howl.volume(v, id)
    },
    soltar: () => {
      howl.unload()
      sonando.clear()
    },
  }
}
