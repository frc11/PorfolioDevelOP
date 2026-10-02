/**
 * [CIERRE RETOQUE 3D] S2 · EL AMBIENTE, GENERATIVO — sin archivo: Web Audio en tiempo real, sobre el contexto de howler
 * (`Howler.ctx`, que ya habilitó la acción de la persona) y su salida general (`Howler.masterGain`: el volumen general
 * vale). Nada de bucles: eventos sueltos y espaciados (una nota, un acorde, una frase corta), con silencios largos de vez
 * en cuando y notas al azar dentro de una escala, así nunca se repite igual. Muy bajo. Tres caracteres para elegir en
 * `/v3?sonidos=1`:
 *
 *   a · Vidrio — campanitas FM, altas y raras, sobre la pentatónica de do; cada una se apaga en varios segundos.
 *   b · Bruma — colchones lentos de dos o tres notas (re dórico) que entran en segundos y se van más despacio todavía.
 *   c · Gotas — frases cortas de punteos (mi menor pentatónica) con un eco que se pierde en la sala.
 *
 * Cada voz se arma, suena y se suelta (los osciladores paran solos). `tocar(null)` funde a silencio y deja de programar;
 * la sala (una reverb de ruido que decae, armada acá) y el eco son los mismos para los tres.
 */
export type Ambiente = 'a' | 'b' | 'c'
type Voz = 'vidrio' | 'colchon' | 'gota'

interface Caracter {
  readonly nombre: string
  readonly voz: Voz
  /** Notas MIDI de la escala, en el registro de la voz. */
  readonly escala: readonly number[]
  /** Segundos entre un evento y el siguiente (al azar adentro). */
  readonly huecoS: readonly [number, number]
  /** De vez en cuando, un silencio largo (probabilidad y segundos). */
  readonly silencio: { readonly probabilidad: number; readonly s: readonly [number, number] }
  /** Cuántas notas por evento (al azar adentro). */
  readonly notas: readonly [number, number]
  /** Cuánto va a la sala y al eco. */
  readonly sala: number
  readonly eco: number
}

export const CARACTERES: Readonly<Record<Ambiente, Caracter>> = {
  a: { nombre: 'Vidrio', voz: 'vidrio', escala: [72, 74, 76, 79, 81, 84, 86, 88], huecoS: [3.5, 11], silencio: { probabilidad: 0.25, s: [16, 30] }, notas: [1, 2], sala: 0.75, eco: 0.25 },
  b: { nombre: 'Bruma', voz: 'colchon', escala: [50, 53, 55, 57, 60, 62, 64, 65, 69], huecoS: [9, 18], silencio: { probabilidad: 0.3, s: [20, 40] }, notas: [2, 3], sala: 0.6, eco: 0 },
  c: { nombre: 'Gotas', voz: 'gota', escala: [64, 66, 67, 71, 74, 76, 78, 79, 83], huecoS: [5, 14], silencio: { probabilidad: 0.3, s: [18, 35] }, notas: [2, 4], sala: 0.55, eco: 0.45 },
}

/** El volumen de cada voz en su pico (antes del ambiente y del general: muy bajo). */
const PICO: Readonly<Record<Voz, number>> = { vidrio: 0.09, colchon: 0.05, gota: 0.08 }
/** Lo que tarda en entrar y en irse el ambiente entero (s). */
const FUNDIDO_S = 1.6

const frecuencia = (midi: number): number => 440 * 2 ** ((midi - 69) / 12)
const entre = (a: number, b: number): number => a + Math.random() * (b - a)
const unoDe = <T>(lista: readonly T[]): T => lista[Math.floor(Math.random() * lista.length)]

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
  readonly tocar: (a: Ambiente | null) => void
  readonly volumen: (v: number) => void
  readonly soltar: () => void
}

export function crearElAmbiente(ctx: AudioContext, salida: AudioNode, volumenInicial: number): AmbienteGenerativo {
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
  const eco = ctx.createDelay(1)
  eco.delayTime.value = 0.43
  const vuelta = ctx.createGain()
  vuelta.gain.value = 0.38
  eco.connect(vuelta)
  vuelta.connect(eco)
  eco.connect(sala)
  eco.connect(seco)

  let actual: Ambiente | null = null
  let temporizador: number | null = null

  /** Una voz al aire: su envolvente arranca en `t` y la voz se suelta sola al terminar. */
  const alAire = (c: Caracter, midi: number, t: number, alcance: number): void => {
    const f = frecuencia(midi)
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
    if (c.eco > 0) {
      const alEco = ctx.createGain()
      alEco.gain.value = c.eco
      paneo.connect(alEco)
      alEco.connect(eco)
    }
    const pico = PICO[c.voz] * alcance
    const osciladores: OscillatorNode[] = []
    let fin = t
    if (c.voz === 'vidrio') {
      // Una campanita FM: el modulador (3,5 veces) se apaga antes que la nota.
      const portadora = ctx.createOscillator()
      portadora.frequency.value = f
      const modulador = ctx.createOscillator()
      modulador.frequency.value = f * 3.5
      const indice = ctx.createGain()
      indice.gain.setValueAtTime(f * 1.6, t)
      indice.gain.exponentialRampToValueAtTime(f * 0.01, t + 1.6)
      modulador.connect(indice)
      indice.connect(portadora.frequency)
      portadora.connect(amp)
      const cola = entre(3, 5.5)
      amp.gain.setValueAtTime(0, t)
      amp.gain.linearRampToValueAtTime(pico, t + 0.012)
      amp.gain.exponentialRampToValueAtTime(0.0001, t + cola)
      fin = t + cola + 0.1
      osciladores.push(portadora, modulador)
    } else if (c.voz === 'colchon') {
      // Un colchón: tres triángulos apenas desafinados por un pasabajos, que entra y se va despacio.
      const filtro = ctx.createBiquadFilter()
      filtro.type = 'lowpass'
      filtro.frequency.value = entre(700, 1300)
      filtro.Q.value = 0.4
      filtro.connect(amp)
      for (const cents of [-7, 0, 6]) {
        const o = ctx.createOscillator()
        o.type = 'triangle'
        o.frequency.value = f
        o.detune.value = cents
        o.connect(filtro)
        osciladores.push(o)
      }
      const entra = entre(2.5, 4)
      const queda = entre(2, 5)
      const sale = entre(5, 8)
      amp.gain.setValueAtTime(0, t)
      amp.gain.linearRampToValueAtTime(pico, t + entra)
      amp.gain.setValueAtTime(pico, t + entra + queda)
      amp.gain.linearRampToValueAtTime(0, t + entra + queda + sale)
      fin = t + entra + queda + sale + 0.1
    } else {
      // Una gota: un seno con su cuarto armónico, que se apaga más rápido (un punteo de madera y vidrio).
      const o = ctx.createOscillator()
      o.frequency.value = f
      const armonico = ctx.createOscillator()
      armonico.frequency.value = f * 4
      const brillo = ctx.createGain()
      brillo.gain.setValueAtTime(0.25, t)
      brillo.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
      armonico.connect(brillo)
      brillo.connect(amp)
      o.connect(amp)
      const cola = entre(0.7, 1.4)
      amp.gain.setValueAtTime(0, t)
      amp.gain.linearRampToValueAtTime(pico, t + 0.004)
      amp.gain.exponentialRampToValueAtTime(0.0001, t + cola)
      fin = t + cola + 0.1
      osciladores.push(o, armonico)
    }
    for (const o of osciladores) {
      o.start(t)
      o.stop(fin)
    }
    osciladores[0].onended = () => {
      for (const o of osciladores) o.disconnect()
      amp.disconnect()
      paneo.disconnect()
    }
  }

  /** Un evento: una nota, un acorde (el colchón) o una frase corta (las gotas), al azar adentro de la escala. */
  const evento = (c: Caracter): void => {
    const t = ctx.currentTime + 0.05
    const cuantas = Math.round(entre(c.notas[0], c.notas[1]))
    if (c.voz === 'colchon') {
      const base = Math.floor(Math.random() * (c.escala.length - 4))
      const acorde = [c.escala[base], c.escala[base + 2], c.escala[base + 4]].slice(0, cuantas)
      for (const n of acorde) alAire(c, n, t, entre(0.6, 1))
      return
    }
    let cuando = t
    for (let k = 0; k < cuantas; k += 1) {
      alAire(c, unoDe(c.escala), cuando, entre(0.5, 1))
      cuando += c.voz === 'gota' ? entre(0.28, 0.75) : entre(0.6, 1.8)
    }
  }

  const programar = (primero: boolean): void => {
    if (actual === null) return
    const c = CARACTERES[actual]
    const espera = primero ? entre(0.8, 2.5) : Math.random() < c.silencio.probabilidad ? entre(c.silencio.s[0], c.silencio.s[1]) : entre(c.huecoS[0], c.huecoS[1])
    temporizador = window.setTimeout(() => {
      if (actual === null) return
      evento(CARACTERES[actual])
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
    tocar: (a) => {
      if (a === actual) return
      actual = a
      if (temporizador !== null) window.clearTimeout(temporizador)
      temporizador = null
      if (ctx.state === 'suspended') void ctx.resume()
      llevarA(a === null ? 0 : volumen)
      programar(true)
    },
    volumen: (v) => {
      volumen = v
      if (actual !== null) llevarA(v)
    },
    soltar: () => {
      actual = null
      if (temporizador !== null) window.clearTimeout(temporizador)
      maestro.disconnect()
    },
  }
}
