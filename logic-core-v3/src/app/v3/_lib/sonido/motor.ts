import { Howl, Howler } from 'howler'

import { crearElAmbiente, type AmbienteGenerativo } from './ambienteGenerativo'
import type { Oido } from './bus'
import { SONIDOS, type Pedido } from './catalogo'
import type { Volumenes } from './preferencia'
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
 * [RONDA 2] F6 · un solo ambiente (Bruma): ya no se elige.
 */
export type EstadoDelSonido = 'cargando' | 'suspendido' | 'listo'

export interface MotorDelSonido extends Oido {
  /** El sonido del sprite tal cual (la página de prueba). */
  readonly sonarCrudo: (s: Sonido) => void
  readonly ambiente: (suena: boolean) => void
  /** [PASADA FINAL] A4 · despierta el contexto si quedó suspendido (se llama dentro de una acción del usuario). */
  readonly despertar: () => void
  /** [PASADA FINAL] A4 · lo real: el archivo cargado y el contexto corriendo (`listo`), o no. */
  readonly estado: () => EstadoDelSonido
  /** La página de prueba: escucharlo aunque el sitio no lo pida (o dejar de probarlo). */
  readonly probarAmbiente: (suena: boolean) => void
  readonly volumen: (s: keyof Volumenes, v: number) => void
  readonly cargado: () => boolean
  readonly soltar: () => void
}

const FUENTES = ['/v3/sonido/sonidos.webm', '/v3/sonido/sonidos.m4a']
const CALLAR_MS = 300

export function crearElMotor(inicial: Volumenes, alCambiar: () => void = () => undefined): MotorDelSonido {
  const volumenes = { ...inicial }
  const sprite: Record<string, [number, number]> = {}
  for (const [nombre, corte] of Object.entries(CORTES_DEL_SPRITE)) sprite[nombre] = [corte[0], corte[1]]
  let cargado = false
  // [PASADA FINAL] A4 · howler suspende el contexto a los 30 s sin un sonido del sprite, y el ambiente generativo (que no es
  // un sonido de howler) se quedaba mudo con el parlante prendido hasta apagarlo y prenderlo. El contexto vive lo que vive
  // el motor: se suelta con él.
  Howler.autoSuspend = false
  const howl = new Howl({
    src: FUENTES,
    sprite,
    preload: true,
    onload: () => {
      cargado = true
      alCambiar()
    },
  })
  Howler.volume(volumenes.general)
  if (Howler.ctx !== undefined) Howler.ctx.onstatechange = alCambiar
  const despertar = (): void => {
    const ctx = Howler.ctx
    if (ctx !== undefined && ctx.state !== 'running') void ctx.resume().then(alCambiar, () => undefined)
  }

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
  const tocar = (suena: boolean): void => {
    if (!suena && generativo === null) return
    elAmbiente()?.tocar(suena)
  }
  let suenaElAmbiente = false
  let probando = false

  return {
    sonar: sonarCrudo,
    sonarCrudo,
    callar,
    ambiente: (suena) => {
      suenaElAmbiente = suena
      if (!probando) tocar(suena)
    },
    probarAmbiente: (suena) => {
      probando = suena
      tocar(suena || suenaElAmbiente)
    },
    cargado: () => cargado,
    despertar,
    estado: () => (!cargado ? 'cargando' : Howler.ctx?.state === 'running' ? 'listo' : 'suspendido'),
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
