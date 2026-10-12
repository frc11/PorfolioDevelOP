/**
 * PULIDO 18 — las corridas y las cuentas que usa `s69-pulido-18.invariant.tsx` (para que el invariante quede corto): la física con el
 * piso de verdad, todo junto durante 20 s, las líneas de código de un módulo y si una función de cada cuadro reserva algo.
 */
import { BRASAS, azarConSemilla, crearBrasas, crearEntradaDeLasBrasas } from '../escena/energia/brasas'
import { pasoDeLasBrasas } from '../escena/energia/paso'
import { FLOOR_Y } from '../escena/probeScene'

/** 8 s con el campo, el piso de verdad y un pulso que empuja desde arriba: quién bajó del mínimo, quién nació abajo, cuántas en la banda. */
export function pisoDeLasBrasas(): { roto: boolean; bajoElMinimo: number; nacenAbajo: number; enLaBanda: number } {
  const az = azarConSemilla(31)
  const b = crearBrasas(600, az, FLOOR_Y)
  const en = crearEntradaDeLasBrasas()
  en.piso = FLOOR_Y
  const minimo = FLOOR_Y + BRASAS.piso.minimo
  let nacenAbajo = 0
  for (let i = 0; i < b.n; i += 1) if (b.lugar[i * 3 + 1] < minimo + BRASAS.piso.banda * 0.5 - 1e-4) nacenAbajo += 1
  let roto = false
  let bajoElMinimo = 0
  for (let k = 0; k < 480; k += 1) {
    en.tiempo = k / 60
    en.temperatura = 0.4
    // Un pulso desde arriba cada 2 s (el clic de alguien sobre la nube): empuja hacia el piso.
    en.pulsos[0] = 0
    en.pulsos[1] = 8
    en.pulsos[2] = 0
    en.pulsos[3] = (k % 120) / 60
    pasoDeLasBrasas(b, 1 / 60, en, az)
    for (let i = 0; i < b.n; i += 1) {
      if (!Number.isFinite(b.lugar[i * 3 + 1])) roto = true
      if (b.lugar[i * 3 + 1] < minimo - 1e-4) bajoElMinimo += 1
    }
  }
  let enLaBanda = 0
  for (let i = 0; i < b.n; i += 1) if (b.lugar[i * 3 + 1] < minimo + 0.35) enLaBanda += 1
  return { roto, bajoElMinimo, nacenAbajo, enLaBanda: enLaBanda / b.n }
}

/** 20 s con todo a la vez: la mitad caliente, dos arcos que golpean, el puntero que se mueve, el viento al tope y la temperatura arriba. */
export function todoJunto(): { roto: boolean; afuera: number; bajoElPiso: number; rapidezMaxima: number } {
  const az = azarConSemilla(37)
  const b = crearBrasas(600, az, FLOOR_Y)
  const en = crearEntradaDeLasBrasas()
  en.piso = FLOOR_Y
  en.viento.set([BRASAS.viento.tope, 0, 0])
  let roto = false
  let afuera = 0
  let bajoElPiso = 0
  let rapidezMaxima = 0
  for (let k = 0; k < 1200; k += 1) {
    const t = k / 60
    en.tiempo = t
    en.temperatura = 0.9
    for (let i = 0; i < b.n; i += 2) b.energia[i] = 0.9
    en.arcos.set([Math.sin(t) * 3, 1, 0, Math.sin(t) * 3 + 2, 2, 1, 1, -2, 3, -1, 1, 0, 2, 0.8])
    en.cuantosArcos = 2
    en.rayo = { ox: Math.cos(t) * 4, oy: 1, oz: 25, dx: 0, dy: 0, dz: -1 }
    en.estela.set([-Math.sin(t) * 4, 0, 0])
    en.cargaDelPuntero = 1 + 2 * Math.abs(Math.sin(t * 0.3))
    pasoDeLasBrasas(b, 1 / 60, en, az)
    for (let i = 0; i < b.n; i += 1) {
      const [x, y, z] = [b.lugar[i * 3], b.lugar[i * 3 + 1], b.lugar[i * 3 + 2]]
      if (!Number.isFinite(x + y + z)) roto = true
      if (k > 600 && Math.hypot(x, y, z) > BRASAS.volumen.radio * 1.15) afuera += 1
      if (y < FLOOR_Y + BRASAS.piso.minimo - 1e-4) bajoElPiso += 1
      rapidezMaxima = Math.max(rapidezMaxima, Math.hypot(b.velocidad[i * 3], b.velocidad[i * 3 + 1], b.velocidad[i * 3 + 2]))
    }
  }
  return { roto, afuera, bajoElPiso, rapidezMaxima }
}

/** Las líneas de código (sin las vacías ni los comentarios). */
export const lineasDeCodigo = (t: string): number => t.split('\n').filter((l) => l.trim() !== '' && !/^\s*(\/\/|\*|\/\*)/.test(l)).length

/** El cuerpo de la función `nombre` (de la llave que abre su renglón a la que la cierra), o '' si no está. */
function cuerpo(texto: string, nombre: string): string {
  const m = new RegExp(`function ${nombre}\\(`).exec(texto)
  if (m === null) return ''
  const desde = texto.indexOf('{\n', m.index)
  if (desde < 0) return ''
  let nivel = 0
  for (let i = desde; i < texto.length; i += 1) {
    if (texto[i] === '{') nivel += 1
    else if (texto[i] === '}') {
      nivel -= 1
      if (nivel === 0) return texto.slice(desde, i + 1)
    }
  }
  return ''
}

/** Lo que reserva por cuadro (la regla de s68): crear objetos, arreglos, funciones, o copiar. */
const RESERVA = /\bnew\s+[A-Z]|=>|(?:[=(,:?]|\breturn)\s*\[|(?:[=(,:?]|\breturn)\s*\{(?!\s*$)|addUpdateRange|\.slice\(|\.map\(|\.filter\(/

/** ¿La función `nombre` de `texto` existe y no reserva nada? */
export function sinReservasEn(texto: string, nombre: string): boolean {
  const c = cuerpo(texto.replace(/\r\n/g, '\n'), nombre)
  return c !== '' && !RESERVA.test(c)
}
