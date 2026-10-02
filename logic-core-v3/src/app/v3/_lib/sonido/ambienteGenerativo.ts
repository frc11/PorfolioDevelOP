/**
 * [CIERRE RETOQUE 3D] S2 · EL AMBIENTE, GENERATIVO — sin archivo: Web Audio en tiempo real, sobre el contexto de howler
 * (`Howler.ctx`, que ya habilitó la acción de la persona) y su salida general (`Howler.masterGain`: el volumen general
 * vale). Nada de bucles: eventos sueltos y espaciados, con silencios largos de vez en cuando y notas al azar dentro de una
 * escala, así nunca se repite igual.
 *
 * [RONDA 2] F6 · queda UNO, Bruma: colchones lentos de dos o tres notas (re dórico) que entran en segundos y se van más
 * despacio todavía, por una sala (una reverb de ruido que decae, armada acá). Vidrio y Gotas se borraron.
 *
 * Cada voz se arma, suena y se suelta (los osciladores paran solos). `tocar(false)` funde a silencio y deja de programar.
 */
interface Caracter {
  readonly nombre: string
  /** Notas MIDI de la escala, en el registro de la voz. */
  readonly escala: readonly number[]
  /** Segundos entre un evento y el siguiente (al azar adentro). */
  readonly huecoS: readonly [number, number]
  /** De vez en cuando, un silencio largo (probabilidad y segundos). */
  readonly silencio: { readonly probabilidad: number; readonly s: readonly [number, number] }
  /** Cuántas notas por acorde (al azar adentro). */
  readonly notas: readonly [number, number]
  /** Cuánto va a la sala. */
  readonly sala: number
}

export const BRUMA: Caracter = { nombre: 'Bruma', escala: [50, 53, 55, 57, 60, 62, 64, 65, 69], huecoS: [9, 18], silencio: { probabilidad: 0.3, s: [20, 40] }, notas: [2, 3], sala: 0.6 }

/** El volumen de una voz en su pico (antes del ambiente y del general). */
const PICO = 0.05
/** Lo que tarda en entrar y en irse el ambiente entero (s). */
const FUNDIDO_S = 1.6

const frecuencia = (midi: number): number => 440 * 2 ** ((midi - 69) / 12)
const entre = (a: number, b: number): number => a + Math.random() * (b - a)

/** La sala: ruido estéreo que decae (una reverb de convolución armada acá, sin archivo). */
function laSala(ctx: AudioContext, duracionS: number, caida: number): AudioBuffer {
  const n = Math.round(ctx.sampleRate * duracionS)
  const b = ctx.createBuffer(2, n, ctx.sampleRate)
  for (let canal = 0; canal < 2; canal += 1) {
    const d = b.getChannelData(canal)
    for (let i = 0; i < n; i += 1) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** caida
  }
  return b
}

export interface AmbienteGenerativo {
  readonly tocar: (suena: boolean) => void
  readonly volumen: (v: number) => void
  readonly soltar: () => void
}

export function crearElAmbiente(ctx: AudioContext, salida: AudioNode, volumenInicial: number): AmbienteGenerativo {
  const c = BRUMA
  let volumen = volumenInicial
  const maestro = ctx.createGain()
  maestro.gain.value = 0
  maestro.connect(salida)
  const seco = ctx.createGain()
  seco.gain.value = 0.6
  seco.connect(maestro)
  const sala = ctx.createConvolver()
  sala.buffer = laSala(ctx, 4.5, 2.6)
  sala.connect(maestro)

  let suena = false
  let temporizador: number | null = null

  /** Un colchón: tres triángulos apenas desafinados por un pasabajos, que entra y se va despacio; se suelta solo. */
  const alAire = (midi: number, t: number, alcance: number): void => {
    const amp = ctx.createGain()
    amp.gain.value = 0
    const paneo = ctx.createStereoPanner()
    paneo.pan.value = entre(-0.55, 0.55)
    amp.connect(paneo)
    paneo.connect(seco)
    const aLaSala = ctx.createGain()
    aLaSala.gain.value = c.sala
    paneo.connect(aLaSala)
    aLaSala.connect(sala)
    const filtro = ctx.createBiquadFilter()
    filtro.type = 'lowpass'
    filtro.frequency.value = entre(700, 1300)
    filtro.Q.value = 0.4
    filtro.connect(amp)
    const osciladores = [-7, 0, 6].map((cents) => {
      const o = ctx.createOscillator()
      o.type = 'triangle'
      o.frequency.value = frecuencia(midi)
      o.detune.value = cents
      o.connect(filtro)
      return o
    })
    const pico = PICO * alcance
    const entra = entre(2.5, 4)
    const queda = entre(2, 5)
    const sale = entre(5, 8)
    amp.gain.setValueAtTime(0, t)
    amp.gain.linearRampToValueAtTime(pico, t + entra)
    amp.gain.setValueAtTime(pico, t + entra + queda)
    amp.gain.linearRampToValueAtTime(0, t + entra + queda + sale)
    const fin = t + entra + queda + sale + 0.1
    for (const o of osciladores) {
      o.start(t)
      o.stop(fin)
    }
    osciladores[0].onended = () => {
      for (const o of osciladores) o.disconnect()
      filtro.disconnect()
      amp.disconnect()
      paneo.disconnect()
      aLaSala.disconnect()
    }
  }

  /** Un acorde de dos o tres notas, al azar adentro de la escala. */
  const evento = (): void => {
    const t = ctx.currentTime + 0.05
    const cuantas = Math.round(entre(c.notas[0], c.notas[1]))
    const base = Math.floor(Math.random() * (c.escala.length - 4))
    for (const n of [c.escala[base], c.escala[base + 2], c.escala[base + 4]].slice(0, cuantas)) alAire(n, t, entre(0.6, 1))
  }

  const programar = (primero: boolean): void => {
    if (!suena) return
    const espera = primero ? entre(0.8, 2.5) : Math.random() < c.silencio.probabilidad ? entre(c.silencio.s[0], c.silencio.s[1]) : entre(c.huecoS[0], c.huecoS[1])
    temporizador = window.setTimeout(() => {
      if (!suena) return
      evento()
      programar(false)
    }, espera * 1000)
  }

  const llevarA = (objetivo: number): void => {
    const t = ctx.currentTime
    maestro.gain.cancelScheduledValues(t)
    maestro.gain.setValueAtTime(maestro.gain.value, t)
    maestro.gain.linearRampToValueAtTime(objetivo, t + FUNDIDO_S)
  }

  return {
    tocar: (si) => {
      if (si === suena) return
      suena = si
      if (temporizador !== null) window.clearTimeout(temporizador)
      temporizador = null
      if (ctx.state === 'suspended') void ctx.resume()
      llevarA(si ? volumen : 0)
      programar(true)
    },
    volumen: (v) => {
      volumen = v
      if (suena) llevarA(v)
    },
    soltar: () => {
      suena = false
      if (temporizador !== null) window.clearTimeout(temporizador)
      maestro.disconnect()
    },
  }
}
