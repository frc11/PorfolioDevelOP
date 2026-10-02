import { Howl, Howler } from 'howler'

import { crearElAmbiente, type Ambiente, type AmbienteGenerativo } from './ambienteGenerativo'
import type { Oido } from './bus'
import { SONIDOS, type Pedido } from './catalogo'
import type { Elegidos, Volumenes } from './preferencia'
import { CORTES_DEL_SPRITE, type Sonido } from './sprite'

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
 * [CIERRE RETOQUE 3D] S1 · sin candidatos de clic: la barra y los CTA piden el pestillo. S2 · el ambiente es generativo
 * (`ambienteGenerativo.ts`): se arma sobre el contexto de howler la primera vez que tiene que sonar (nada de archivo);
 * `ambiente(false)` (movimiento reducido, la pestaña oculta) lo funde a silencio y deja de programar notas.
 */
export interface MotorDelSonido extends Oido {
  /** El sonido del sprite tal cual (la página de prueba). */
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

  const callar = (s: Pedido): void => {
    for (const id of vivos(s)) {
      howl.fade(volumenes[s], 0, CALLAR_MS, id)
      window.setTimeout(() => howl.stop(id), CALLAR_MS + 20)
    }
    vivos(s).clear()
  }

  // El ambiente: se arma sobre el contexto de howler (ya habilitado por la acción) la primera vez que tiene que sonar.
  let generativo: AmbienteGenerativo | null = null
  const elAmbiente = (): AmbienteGenerativo | null => {
    if (generativo === null && Howler.usingWebAudio && Howler.ctx !== undefined && Howler.masterGain !== undefined) generativo = crearElAmbiente(Howler.ctx, Howler.masterGain, volumenes.ambiente)
    return generativo
  }
  const tocar = (a: Ambiente | null): void => {
    if (a === null && generativo === null) return
    elAmbiente()?.tocar(a)
  }
  let suenaElAmbiente = false
  let probando: Ambiente | null = null

  return {
    sonar: sonarCrudo,
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
      else if (s === 'ambiente') generativo?.volumen(v)
      else for (const id of vivos(s)) howl.volume(v, id)
    },
    soltar: () => {
      howl.unload()
      generativo?.soltar()
      generativo = null
      sonando.clear()
    },
  }
}
