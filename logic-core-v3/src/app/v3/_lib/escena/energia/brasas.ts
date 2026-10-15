import type { Dominio } from './dominio'
import { largo3 } from './largo'
import type { Poblacion } from './poblacion'

/**
 * [PULIDO 17] O3 · LAS BRASAS: LAS CARGAS DE PULIDO 15, HECHAS LUZ (`docs/rediseno/PLASMA.md`). Lo que gustó, igual: cargas
 * positivas y negativas en el volumen alrededor del logo, las opuestas se atraen y las iguales se repelen (con un rechazo de corto
 * alcance; por la grilla, lineal en la cantidad), dos opuestas que se acercan se ENLAZAN un rato (sin dibujar el enlace: el
 * enlace es lo que descarga los arcos) y el puntero es una carga fuerte. Lo nuevo: derivan por el campo del curl noise (`ruido.ts`,
 * no un vaivén senoidal), cada una tiene su ENERGÍA (de 0 a 1: la calienta el puntero, un pulso, una onda del logo, un arco; se
 * enfría sola) y la energía las hace TEMBLAR (la agitación térmica). El puntero además ORDENA (las cercanas giran alrededor de su
 * rayo). En la dirección A son las partículas; en B, los núcleos calientes del enjambre. Puro (la prueba lo corre en Node).
 * [PULIDO 18] P1.b · el paso salió a `paso.ts` y lo de afuera de cada una a `afuera.ts` (este archivo pasaba las 300 líneas).
 * [PULIDO 19] Q1.b · la grilla y las fuerzas entre ellas salieron a `grilla.ts` (la grilla es relativa a la caja del dominio de la vista,
 * `dominio.ts`); Q1.c · cada brasa tiene su VIDA (el alfa del dominio, con tope de cambio por cuadro) y su DENSIDAD suavizada: el
 * brillo que se dibuja es el producto. Nada aparece ni desaparece de golpe.
 */
export const BRASAS = {
  /**
   * Dónde viven: una cáscara (u) y el hueco del logo (el logo mide 6,9 de ancho). [PULIDO 18] P1.b · la cáscara es del MUNDO: alrededor
   * del origen (el lugar de reposo del logo), quieta; el hueco va con el logo (un obstáculo donde esté: si baja, las aparta al pasar).
   * [PULIDO 19] Q1.b · con el dominio de la vista (`dominio.ts`) la cáscara es sólo la siembra (antes del primer cuadro con cámara) y el
   * límite sin dominio (las pruebas): en el sitio, el dominio periódico las contiene.
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
  /**
   * El puntero (desde su rayo, u): alcance, fuerza, rechazo pegado, hasta dónde rompe enlaces, el giro alrededor del rayo y cuánto calienta
   * (1/s). [PULIDO 21] S5 · el cúmulo, calmo: cerca del rayo la agitación térmica baja (`calma`, en el centro) y se frenan (`viscosidad`, 1/s).
   */
  cursor: { alcance: 4.6, fuerza: 2, cerca: 1.1, rompe: 3, gira: 2.6, calienta: 1.6, calma: 0.85, viscosidad: 3.5 },
  /**
   * El límite del brillo por densidad: con `vecinas` brasas a menos de `radio` (u), el brillo se divide por (1 + baja · vecinas).
   * [PULIDO 19] Q1.c · y se persigue con inercia (`suavizaS`, s): antes saltaba de golpe cada cuatro cuadros (un pop).
   */
  densidad: { radio: 1, baja: 0.09, suavizaS: 0.8 },
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
  /**
   * [PULIDO 19] Q1 · la semilla del temblor de cada una (un xorshift propio, inline en `afuera.ts`): llamar a `azar()` tres veces por brasa
   * encajaba un número por llamada (Chrome no inlinea el cierre: un HeapNumber de 16 bytes por retorno, ~40 KB de basura por cuadro).
   */
  readonly ruido: Uint32Array
  /**
   * El brillo que se dibuja: la densidad por la vida. [PULIDO 19] Q1.c · `densidad`, el brillo por la densidad local (1: sola; menos,
   * amontonada: un grupo no se satura), perseguido con inercia; `vida`, el alfa del dominio (0 al reaparecer por una cara, 1 adentro
   * del cuadro; [PULIDO 27] Z1 · sin tope: continua en el lugar); `eventos`, qué brasas saltaron en este paso (reaparecieron por una
   * cara, nacieron o murieron: los únicos saltos permitidos).
   */
  readonly brillo: Float32Array
  readonly densidad: Float32Array
  readonly vida: Float32Array
  readonly eventos: Uint8Array
  /**
   * [PULIDO 27] Z1 · la población (`poblacion.ts`): las que están en la reserva (no se ven ni se mueven: esperan para nacer) y cuándo nació
   * cada una (s, el reloj de la escena: el sombreador la hace crecer desde un punto). El reparto de antes (las que se apagaban para
   * mudarse de celda) se fue: una que sobra muere con una explosión y una que falta nace.
   */
  readonly oculta: Uint8Array
  readonly nace: Float32Array
  readonly pareja: Int32Array
  readonly vidaDelEnlace: Float32Array
  readonly enfriado: Float32Array
  readonly fuerza: Float32Array
  readonly cabeza: Int32Array
  readonly siguiente: Int32Array
  /** [PULIDO 19] Q1.b · la grilla de este paso (`grilla.ts`). */
  readonly grilla: Grilla
  paresMirados: number
  turno: number
}

/** [PULIDO 19] Q1.b · cuántas celdas por eje tiene la grilla como mucho (`cabeza` es su cubo). */
export const GRILLA = { celdas: 32 } as const

/** Lo que la grilla recuerda del paso: el origen de la caja, el lado de la celda y cuántas celdas por eje. */
export interface Grilla {
  ox: number
  oy: number
  oz: number
  lado: number
  nx: number
  ny: number
  nz: number
}

export function crearGrilla(): Grilla {
  return { ox: 0, oy: 0, oz: 0, lado: BRASAS.fuerzas.alcance, nx: 1, ny: 1, nz: 1 }
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
  /** [PULIDO 19] Q1.b · el dominio de la vista (`dominio.ts`); sin él (las pruebas), la cáscara de siempre. */
  dominio: Dominio | null
  /**
   * [PULIDO 19] El paso (s): lo escribe `pasoDeLasBrasas`; `afuera.ts` y `movimiento.ts` lo leen de acá y no por parámetro. En el bucle
   * de cada brasa, un número no entero que cruza una función que V8 no inlineó se encaja en un HeapNumber (16 bytes por brasa y
   * cuadro): medido en Chrome, 51 KB de basura por cuadro que eran de `dt`, `piso`, `x, y, z` y `t` cruzando llamadas.
   */
  dt: number
  /** [PULIDO 19] Q1.d · el freno de la red en reposo (0 a 1; se suma a la amortiguación: `REPOSO.frena`). */
  freno: number
  /** [PULIDO 23] U2 · a quién frena: las brasas enlazadas (1); las otras siguen andando. Sin red, todas (null). */
  quietas: Uint8Array | null
  /** [PULIDO 27] Z1 · la población: una que se va de la vista sin haber llegado a apagarse (la cámara corrió de golpe) explota. Sin ella, nada. */
  poblacion: Poblacion | null
}

/** [PULIDO 27] Z1 · el nacimiento de las que no nacieron a la vista (s del reloj de la escena: hace mucho). */
export const NACIO_HACE_MUCHO = -1e4

/** Cuántos arcos entran al paso como mucho (los lugares de los arcos, `arcos/arcos.ts`). */
export const ARCOS_EN_LA_ENTRADA = 6

export function crearEntradaDeLasBrasas(): EntradaDeLasBrasas {
  return { tiempo: 0, temperatura: 0, rayo: null, cargaDelPuntero: 1, pulsos: new Float32Array(8).fill(-1), anillos: new Float32Array(8), logo: new Float32Array(3), viento: new Float32Array(3), estela: new Float32Array(3), arcos: new Float32Array(ARCOS_EN_LA_ENTRADA * 7), cuantosArcos: 0, piso: -100, dominio: null, dt: 1 / 60, freno: 0, quietas: null, poblacion: null }
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
    ruido: new Uint32Array(n),
    brillo: new Float32Array(n).fill(1),
    densidad: new Float32Array(n).fill(1),
    vida: new Float32Array(n).fill(1),
    eventos: new Uint8Array(n),
    oculta: new Uint8Array(n),
    nace: new Float32Array(n).fill(NACIO_HACE_MUCHO),
    pareja: new Int32Array(n).fill(-1),
    vidaDelEnlace: new Float32Array(n),
    enfriado: new Float32Array(n),
    fuerza: new Float32Array(n * 3),
    // Vacías (−1): quien recorra una cadena antes del primer paso no gira para siempre en el índice 0.
    cabeza: new Int32Array(GRILLA.celdas * GRILLA.celdas * GRILLA.celdas).fill(-1),
    siguiente: new Int32Array(n).fill(-1),
    grilla: crearGrilla(),
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
    b.ruido[i] = Math.max(1, Math.floor(azar() * 4294967295))
  }
  return b
}

/** [PULIDO 19] Deshace el enlace de `i` sin empujón: la brasa saltó (reapareció por una cara del dominio, se mudó) y su pareja quedó del otro lado; el resorte la arrastraría por toda la pantalla. */
export function desenlazar(b: Brasas, i: number): void {
  const j = b.pareja[i]
  if (j < 0) return
  b.pareja[i] = -1
  b.pareja[j] = -1
}

/** Suelta el enlace de `i` (y de su pareja): un empujón para separarlos y un rato sin enlazarse. */
export function soltarEnlace(b: Brasas, i: number, azar: () => number): void {
  const j = b.pareja[i]
  if (j < 0) return
  const { empujon, enfria } = BRASAS.enlace
  const dx = b.lugar[j * 3] - b.lugar[i * 3]
  const dy = b.lugar[j * 3 + 1] - b.lugar[i * 3 + 1]
  const dz = b.lugar[j * 3 + 2] - b.lugar[i * 3 + 2]
  const d = Math.max(1e-4, largo3(dx, dy, dz))
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

/**
 * [PULIDO 19] El punto del rayo del puntero más cercano a la brasa en `L[o..o+2]` (en `punto[0..2]`) y la distancia (u, en `punto[3]`):
 * sin números por parámetro ni retorno (en el bucle de cada brasa se encajan: `EntradaDeLasBrasas.dt`).
 */
export function alRayoDesde(L: Float32Array, o: number, r: RayoDelPuntero, punto: Float32Array): void {
  const x = L[o]
  const y = L[o + 1]
  const z = L[o + 2]
  const t = Math.max(0, (x - r.ox) * r.dx + (y - r.oy) * r.dy + (z - r.oz) * r.dz)
  punto[0] = r.ox + r.dx * t
  punto[1] = r.oy + r.dy * t
  punto[2] = r.oz + r.dz * t
  const dx = x - punto[0]
  const dy = y - punto[1]
  const dz = z - punto[2]
  punto[3] = Math.sqrt(dx * dx + dy * dy + dz * dz)
}

const XYZ = new Float32Array(3)
const CERCA = new Float32Array(4)

/** La distancia de (x, y, z) al rayo del puntero (u) y el punto del rayo más cercano, en `punto` (fuera del bucle de cada brasa: los arcos). */
export function distanciaAlRayo(x: number, y: number, z: number, r: RayoDelPuntero, punto: Float32Array): number {
  XYZ[0] = x
  XYZ[1] = y
  XYZ[2] = z
  alRayoDesde(XYZ, 0, r, CERCA)
  punto[0] = CERCA[0]
  punto[1] = CERCA[1]
  punto[2] = CERCA[2]
  return CERCA[3]
}

