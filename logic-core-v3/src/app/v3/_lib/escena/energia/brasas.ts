/**
 * [PULIDO 17] O3 · LAS BRASAS: LAS CARGAS DE PULIDO 15, HECHAS LUZ (`docs/rediseno/PLASMA.md`). Lo que gustó, igual: cargas
 * positivas y negativas en el volumen alrededor del logo, las opuestas se atraen y las iguales se repelen (con un rechazo de corto
 * alcance; por la grilla, lineal en la cantidad), dos opuestas que se acercan se ENLAZAN un rato (sin dibujar el enlace: el
 * enlace es lo que descarga los arcos) y el puntero es una carga fuerte. Lo nuevo: derivan por el campo del curl noise (`ruido.ts`,
 * no un vaivén senoidal), cada una tiene su ENERGÍA (de 0 a 1: la calienta el puntero, un pulso, una onda del logo, un arco; se
 * enfría sola) y la energía las hace TEMBLAR (la agitación térmica). El puntero además ORDENA (las cercanas giran alrededor de su
 * rayo). En la dirección A son las partículas; en B, los núcleos calientes del enjambre. Puro (la prueba lo corre en Node).
 * [PULIDO 18] P1.b · el paso salió a `paso.ts` y lo de afuera de cada una a `afuera.ts` (este archivo pasaba las 300 líneas).
 */
export const BRASAS = {
  /**
   * Dónde viven: una cáscara (u) y el hueco del logo (el logo mide 6,9 de ancho). [PULIDO 18] P1.b · la cáscara es del MUNDO: alrededor
   * del origen (el lugar de reposo del logo), quieta; el hueco va con el logo (un obstáculo donde esté: si baja, las aparta al pasar).
   */
  volumen: { radio: 13, hueco: 4.2 },
  /**
   * [PULIDO 18] P1.a · EL PISO ES UN LÍMITE REAL (el brillo lo atravesaba): ninguna baja de `minimo` (u sobre el piso: por encima de la
   * cresta más alta del mar y del bloque que levanta el cursor); en la `banda` de arriba de ese mínimo un colchón las levanta
   * (`empuje`, u/s², creciente hacia abajo), lo que bajan se frena (`frena`, 1/s) y lo que corren de costado roza (`roce`, 1/s): se
   * deslizan y casi no se acercan. Nacen arriba del mínimo.
   */
  piso: { minimo: 0.85, banda: 1.6, empuje: 2.4, frena: 5, roce: 0.9 },
  /** Entre ellas (u, s; masa 1), las de PULIDO 15: el alcance, atraer y repeler, el rechazo de cerca, la amortiguación, el tope y la cáscara. */
  fuerzas: { alcance: 3.6, atrae: 0.42, repele: 0.55, cerca: 0.55, choque: 6, amortigua: 1.1, tope: 3, contiene: 1.6 },
  /** El campo: la rapidez que les da (u/s, más con la temperatura) y en cuánto lo siguen (1/s). */
  flujo: { rapidez: 0.42, caliente: 0.9, sigue: 0.8 },
  /** Los enlaces de PULIDO 15: a qué distancia se forman, su largo y su resorte, cuánto duran (s), el empujón al soltarse y el rato sin volver. */
  enlace: { forma: 1.2, reposo: 0.95, resorte: 2.2, vida: [2.5, 7], empujon: 0.9, enfria: [3, 7] },
  /** El puntero (desde su rayo, u): alcance, fuerza, rechazo pegado, hasta dónde rompe enlaces, el giro alrededor del rayo y cuánto calienta (1/s). */
  cursor: { alcance: 4.6, fuerza: 2, cerca: 1.1, rompe: 3, gira: 2.6, calienta: 1.6 },
  /** El límite del brillo por densidad: con `vecinas` brasas a menos de `radio` (u), el brillo se divide por (1 + baja · vecinas). */
  densidad: { radio: 1, baja: 0.09 },
  /** La energía: la de reposo (más con la temperatura), en cuánto se enfría (s) y cuánto tiembla una brasa caliente (u/s²). */
  energia: { base: 0.1, porTemperatura: 0.45, apagaS: 0.8, tiembla: 2.2 },
  /** La onda de un pulso (el clic, la descarga): rapidez del frente (u/s), su ancho (u), el empuje (u/s) y cuánto calienta; dura hasta `llega`. */
  onda: { rapidez: 10, ancho: 1.1, empuje: 2.4, calienta: 0.85, llega: 11 },
  /** Las ondas del logo (su pulso): cuánto calientan por segundo en la cresta (por su amplitud) y el ancho de la cresta (u). */
  anillo: { calienta: 0.9, ancho: 1.2 },
  /**
   * [PULIDO 18] P1.e · el movimiento nuevo (`movimiento.ts`). La CONVECCIÓN: cuánto sube una brasa por su energía sobre la de reposo
   * (u/s² por unidad) y cuánto baja fría. El PINCH de un arco: su alcance (u), la fuerza hacia el canal en el golpe (u/s²) y cuánto
   * calienta (1/s). La ESTELA del puntero: su alcance (u desde el rayo), cuánto arrastra (1/s) y desde qué rapidez del puntero arrastra
   * entera (u/s). El VIENTO del scroll: cuánto viento por pantalla por segundo de scroll (u/s), en contra de la cámara que pasa (el
   * aire), su tope (u/s), cuánto más con la temperatura y en cuánto se asienta (s).
   */
  conveccion: { sube: 0.7, baja: 0.05 },
  pinch: { radio: 1.3, fuerza: 3.2, calienta: 0.5 },
  estela: { radio: 2.6, arrastra: 1.8, desde: 0.6 },
  viento: { escala: 0.35, tope: 1.6, caliente: 1.5, asienta: 0.35 },
} as const

export interface Brasas {
  readonly n: number
  readonly lugar: Float32Array
  readonly velocidad: Float32Array
  /** El campo en cada una (se recalcula en cuadros alternos: es suave). */
  readonly flujo: Float32Array
  readonly signo: Int8Array
  /** Por brasa: el tamaño (0–1, muchas chicas), dos fases y el ritmo del titileo. */
  readonly semilla: Float32Array
  readonly energia: Float32Array
  /** El brillo por la densidad local (1: sola; menos, amontonada: un grupo no se satura). */
  readonly brillo: Float32Array
  readonly pareja: Int32Array
  readonly vidaDelEnlace: Float32Array
  readonly enfriado: Float32Array
  readonly fuerza: Float32Array
  readonly cabeza: Int32Array
  readonly siguiente: Int32Array
  paresMirados: number
  turno: number
}

/** El rayo del puntero, en el mundo: el origen (la cámara) y la dirección (unitaria). */
export interface RayoDelPuntero { readonly ox: number; readonly oy: number; readonly oz: number; readonly dx: number; readonly dy: number; readonly dz: number }

/** Lo que entra de afuera en cada paso (un solo objeto reescrito: sin reservas). [PULIDO 18] P1.b · todo en el mundo. */
export interface EntradaDeLasBrasas {
  /** La hora del campo (s) y la temperatura de la escena (0 a 1). */
  tiempo: number
  temperatura: number
  rayo: RayoDelPuntero | null
  /** La carga del puntero (1: la suya; hasta 3, cargado). */
  cargaDelPuntero: number
  /** Las ondas de los pulsos: (x, y, z, edad en s) × 2; edad negativa: ninguna. */
  readonly pulsos: Float32Array
  /** Los frentes de las ondas del logo (u desde su centro) y su fuerza, × 4 (fuerza 0: ninguna). */
  readonly anillos: Float32Array
  /** Dónde está el logo ahora (su centro): el hueco y las ondas salen de ahí. */
  readonly logo: Float32Array
  /** [PULIDO 18] P1.e · el viento del scroll (u/s), la velocidad del puntero en la nube (u/s) y los canales de los arcos que golpean: (a, b, fuerza) × `cuantosArcos`. */
  readonly viento: Float32Array
  readonly estela: Float32Array
  readonly arcos: Float32Array
  cuantosArcos: number
  /** El piso (y): nada pasa por debajo (un arco a una brasa bajo el piso se ve como una grieta). */
  piso: number
}

/** Cuántos arcos entran al paso como mucho (los lugares de los arcos, `arcos/arcos.ts`). */
export const ARCOS_EN_LA_ENTRADA = 6

export function crearEntradaDeLasBrasas(): EntradaDeLasBrasas {
  return { tiempo: 0, temperatura: 0, rayo: null, cargaDelPuntero: 1, pulsos: new Float32Array(8).fill(-1), anillos: new Float32Array(8), logo: new Float32Array(3), viento: new Float32Array(3), estela: new Float32Array(3), arcos: new Float32Array(ARCOS_EN_LA_ENTRADA * 7), cuantosArcos: 0, piso: -100 }
}

/** Un azar con semilla (mulberry32): las mismas brasas y los mismos arcos en cada carga de la página (y en el banco). */
export function azarConSemilla(semilla: number): () => number {
  let s = semilla >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const F = BRASAS.fuerzas
/** La grilla: celdas del alcance de las fuerzas (cada brasa mira sólo las vecinas); `vecinas.ts` la usa también. */
export const LADO = Math.ceil((2 * (BRASAS.volumen.radio + F.alcance)) / F.alcance)
const MITAD = (LADO * F.alcance) / 2
export const celda = (v: number): number => Math.min(LADO - 1, Math.max(0, Math.floor((v + MITAD) / F.alcance)))

/** Un punto al azar en la cáscara (la dirección uniforme, el radio por la raíz cúbica: parejas en el volumen), en `destino` desde `o`. */
export function enLaCascara(azar: () => number, destino: Float32Array, o: number): void {
  const { radio, hueco } = BRASAS.volumen
  const z = azar() * 2 - 1
  const fi = azar() * Math.PI * 2
  const s = Math.sqrt(1 - z * z)
  const r = Math.cbrt(hueco ** 3 + azar() * (radio ** 3 - hueco ** 3))
  destino[o] = Math.cos(fi) * s * r
  destino[o + 1] = z * r
  destino[o + 2] = Math.sin(fi) * s * r
}

/** Las brasas, en la cáscara y arriba del piso (`piso`: su altura; sin piso, en toda la cáscara). */
export function crearBrasas(n: number, azar: () => number, piso = Number.NEGATIVE_INFINITY): Brasas {
  const b: Brasas = {
    n,
    lugar: new Float32Array(n * 3),
    velocidad: new Float32Array(n * 3),
    flujo: new Float32Array(n * 3),
    signo: new Int8Array(n),
    semilla: new Float32Array(n * 4),
    energia: new Float32Array(n).fill(BRASAS.energia.base),
    brillo: new Float32Array(n).fill(1),
    pareja: new Int32Array(n).fill(-1),
    vidaDelEnlace: new Float32Array(n),
    enfriado: new Float32Array(n),
    fuerza: new Float32Array(n * 3),
    cabeza: new Int32Array(LADO * LADO * LADO),
    siguiente: new Int32Array(n),
    paresMirados: 0,
    turno: 0,
  }
  const arriba = piso + BRASAS.piso.minimo + BRASAS.piso.banda * 0.5
  for (let i = 0; i < n; i += 1) {
    enLaCascara(azar, b.lugar, i * 3)
    for (let intento = 0; intento < 32 && b.lugar[i * 3 + 1] < arriba; intento += 1) enLaCascara(azar, b.lugar, i * 3)
    b.lugar[i * 3 + 1] = Math.max(b.lugar[i * 3 + 1], arriba)
    b.signo[i] = i % 2 === 0 ? 1 : -1
    b.semilla[i * 4] = azar() ** 2.2
    b.semilla[i * 4 + 1] = azar() * Math.PI * 2
    b.semilla[i * 4 + 2] = azar() * Math.PI * 2
    b.semilla[i * 4 + 3] = 0.6 + azar() * 1.8
    b.enfriado[i] = azar() * 2
  }
  return b
}

/** Suelta el enlace de `i` (y de su pareja): un empujón para separarlos y un rato sin enlazarse. */
export function soltarEnlace(b: Brasas, i: number, azar: () => number): void {
  const j = b.pareja[i]
  if (j < 0) return
  const { empujon, enfria } = BRASAS.enlace
  const dx = b.lugar[j * 3] - b.lugar[i * 3]
  const dy = b.lugar[j * 3 + 1] - b.lugar[i * 3 + 1]
  const dz = b.lugar[j * 3 + 2] - b.lugar[i * 3 + 2]
  const d = Math.max(1e-4, Math.hypot(dx, dy, dz))
  for (let lado = 0; lado < 2; lado += 1) {
    const k = lado === 0 ? i : j
    const s = lado === 0 ? -1 : 1
    b.velocidad[k * 3] += (s * empujon * dx) / d
    b.velocidad[k * 3 + 1] += (s * empujon * dy) / d
    b.velocidad[k * 3 + 2] += (s * empujon * dz) / d
    b.pareja[k] = -1
    b.enfriado[k] = enfria[0] + azar() * (enfria[1] - enfria[0])
  }
}

/** La distancia de (x, y, z) al rayo del puntero (u) y el punto del rayo más cercano, en `punto`. */
export function distanciaAlRayo(x: number, y: number, z: number, r: RayoDelPuntero, punto: Float32Array): number {
  const t = Math.max(0, (x - r.ox) * r.dx + (y - r.oy) * r.dy + (z - r.oz) * r.dz)
  punto[0] = r.ox + r.dx * t
  punto[1] = r.oy + r.dy * t
  punto[2] = r.oz + r.dz * t
  return Math.hypot(x - punto[0], y - punto[1], z - punto[2])
}

/** Las fuerzas entre ellas por la grilla (cada par una vez) y los enlaces que se forman. */
export function entreEllas(b: Brasas, azar: () => number): void {
  const { lugar, fuerza, signo, pareja } = b
  const E = BRASAS.enlace
  b.cabeza.fill(-1)
  for (let i = 0; i < b.n; i += 1) {
    const k = (celda(lugar[i * 3]) * LADO + celda(lugar[i * 3 + 1])) * LADO + celda(lugar[i * 3 + 2])
    b.siguiente[i] = b.cabeza[k]
    b.cabeza[k] = i
  }
  let mirados = 0
  for (let i = 0; i < b.n; i += 1) {
    const cx = celda(lugar[i * 3])
    const cy = celda(lugar[i * 3 + 1])
    const cz = celda(lugar[i * 3 + 2])
    for (let ax = Math.max(0, cx - 1); ax <= Math.min(LADO - 1, cx + 1); ax += 1) for (let ay = Math.max(0, cy - 1); ay <= Math.min(LADO - 1, cy + 1); ay += 1) for (let az = Math.max(0, cz - 1); az <= Math.min(LADO - 1, cz + 1); az += 1) {
      for (let j = b.cabeza[(ax * LADO + ay) * LADO + az]; j >= 0; j = b.siguiente[j]) {
        if (j <= i) continue
        mirados += 1
        const dx = lugar[j * 3] - lugar[i * 3]
        const dy = lugar[j * 3 + 1] - lugar[i * 3 + 1]
        const dz = lugar[j * 3 + 2] - lugar[i * 3 + 2]
        const d = Math.hypot(dx, dy, dz)
        if (d >= F.alcance || d < 1e-5) continue
        const opuestas = signo[i] !== signo[j]
        const u = 1 - d / F.alcance
        let f = opuestas ? F.atrae * u : -F.repele * u
        if (d < F.cerca) f -= F.choque * (1 - d / F.cerca) ** 2
        const fx = (f * dx) / d
        const fy = (f * dy) / d
        const fz = (f * dz) / d
        fuerza[i * 3] += fx
        fuerza[i * 3 + 1] += fy
        fuerza[i * 3 + 2] += fz
        fuerza[j * 3] -= fx
        fuerza[j * 3 + 1] -= fy
        fuerza[j * 3 + 2] -= fz
        if (opuestas && d < E.forma && pareja[i] < 0 && pareja[j] < 0 && b.enfriado[i] <= 0 && b.enfriado[j] <= 0) {
          pareja[i] = j
          pareja[j] = i
          b.vidaDelEnlace[i] = E.vida[0] + azar() * (E.vida[1] - E.vida[0])
        }
      }
    }
  }
  b.paresMirados = mirados
}
