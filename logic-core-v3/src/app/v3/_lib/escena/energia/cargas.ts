/**
 * [PULIDO 15] M2 · LA ENERGÍA NUEVA: PLASMA + CARGAS (`?energia=plasma`: exploración; sin la bandera, el polvo de siempre). Los
 * destellos de PULIDO 14 no gustaron y se borraron. El humano eligió la combinación de dos bocetos, «arcos de plasma» y «cargas
 * sueltas», llevada a la escena en 3D:
 *   · CARGAS: unos cientos, positivas (un punto lleno con halo) y negativas (un anillo fino), flotando en el volumen alrededor del
 *     logo con profundidad (lejos, chicas y tenues; cerca, grandes y nítidas). Las opuestas se atraen y las iguales se repelen, con
 *     un rechazo de corto alcance, amortiguación y un poco de agitación. Las fuerzas, con una grilla (cada carga mira sólo las
 *     celdas vecinas: lineal en la cantidad, no O(n²)).
 *   · ENLACES QUE DESCARGAN: dos opuestas que se acercan se enlazan; mientras siguen cerca, cada tanto salta entre ellas un arco de
 *     plasma corto (`arcos.ts`). Cada enlace dura unos segundos y el par se suelta solo (con un empujón y un rato sin enlazarse).
 *   · EL LOGO ES LA FUENTE: cada tanto suelta un arco hacia una carga cercana.
 *   · EL PUNTERO (el mouse o el dedo) es una carga fuerte: atrae a las negativas, empuja a las positivas y rompe los enlaces que
 *     toca; quieto cerca de cargas, los arcos saltan a él (como tocar una bola de plasma).
 * Contenido: del orden de cientos de cargas y, como mucho, cinco arcos a la vez (cuatro en el teléfono), con frecuencias bajas.
 * Este módulo es la física (pura: sin three ni el DOM, la prueba la corre en Node); los arcos, `arcos.ts`; el dibujo,
 * `sombreadores.ts` y `PlasmaYCargas.tsx`.
 */

export const PLASMA = {
  /** Cuántas cargas (la mitad de cada signo) en escritorio y en el teléfono. */
  cargas: { escritorio: 320, compacta: 180 },
  /** Dónde viven: una cáscara alrededor del centro del logo (u): el radio y el hueco del medio (el logo mide 6,9 de ancho). */
  volumen: { radio: 13, hueco: 4.2 },
  /**
   * Las fuerzas (u, s; masa 1): el alcance de la grilla (atracción y repulsión entre cargas), cuánto se atraen las opuestas y se
   * repelen las iguales, el rechazo de corto alcance (debajo de `cerca`, entre todas), la amortiguación (1/s), la agitación
   * (u/s²), el tope de velocidad (u/s) y el resorte que las devuelve a la cáscara.
   */
  fuerzas: { alcance: 3.6, atrae: 0.42, repele: 0.55, cerca: 0.55, choque: 6, amortigua: 1.1, agita: 0.32, tope: 3, contiene: 1.6 },
  /**
   * Los enlaces: a qué distancia se forma (u), su largo de reposo y su resorte, cuánto dura (s, al azar en el tramo), el empujón al
   * soltarse (u/s) y el rato sin volver a enlazarse (s).
   */
  enlace: { forma: 1.2, reposo: 0.95, resorte: 2.2, vida: [2.5, 7], empujon: 0.9, enfria: [3, 7] },
  /**
   * El puntero, una carga fuerte sobre su rayo (la línea de la cámara al cursor): su alcance (u desde el rayo), su fuerza, el
   * rechazo pegado al rayo, hasta dónde rompe enlaces y desde dónde y hasta dónde le saltan arcos (las que ya se le pegaron dan un
   * arco de pocos px: salta desde las que vienen).
   */
  cursor: { alcance: 4.6, fuerza: 4.2, cerca: 0.6, rompe: 3, arco: [0.9, 3.2] },
  /** El brillo que deja un arco en sus cargas (se suma) y en cuánto se apaga (s). */
  brillo: { arco: 1, apagaS: 0.45 },
} as const

/** El estado de las cargas: posiciones relativas al centro del logo (u), velocidades, signos, enlaces y la grilla (sin alocar). */
export interface Cargas {
  readonly n: number
  readonly lugar: Float32Array
  readonly velocidad: Float32Array
  readonly signo: Int8Array
  /** Por carga: el tamaño (0–1) y las tres fases de la agitación. */
  readonly semilla: Float32Array
  readonly pareja: Int32Array
  readonly vidaDelEnlace: Float32Array
  readonly enfriado: Float32Array
  readonly brillo: Float32Array
  readonly fuerza: Float32Array
  readonly cabeza: Int32Array
  readonly siguiente: Int32Array
  /** Cuántos pares miró la grilla en el último paso (para la prueba: lineal en la cantidad). */
  paresMirados: number
}

/** El rayo del puntero, en coordenadas relativas al centro del logo: el origen (la cámara) y la dirección (unitaria). */
export interface RayoDelPuntero {
  readonly ox: number
  readonly oy: number
  readonly oz: number
  readonly dx: number
  readonly dy: number
  readonly dz: number
}

/** Un azar con semilla (mulberry32): las cargas y los arcos son los mismos en cada carga de la página (y en el banco). */
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

const LADO = Math.ceil((2 * (PLASMA.volumen.radio + PLASMA.fuerzas.alcance)) / PLASMA.fuerzas.alcance)
const MITAD = (LADO * PLASMA.fuerzas.alcance) / 2

/** Las cargas nuevas: parejas en la cáscara (la dirección uniforme y el radio con la raíz cúbica), la mitad de cada signo. */
export function crearCargas(n: number, azar: () => number): Cargas {
  const c: Cargas = {
    n,
    lugar: new Float32Array(n * 3),
    velocidad: new Float32Array(n * 3),
    signo: new Int8Array(n),
    semilla: new Float32Array(n * 4),
    pareja: new Int32Array(n).fill(-1),
    vidaDelEnlace: new Float32Array(n),
    enfriado: new Float32Array(n),
    brillo: new Float32Array(n),
    fuerza: new Float32Array(n * 3),
    cabeza: new Int32Array(LADO * LADO * LADO),
    siguiente: new Int32Array(n),
    paresMirados: 0,
  }
  const { radio, hueco } = PLASMA.volumen
  for (let i = 0; i < n; i += 1) {
    const z = azar() * 2 - 1
    const fi = azar() * Math.PI * 2
    const s = Math.sqrt(1 - z * z)
    const r = Math.cbrt(hueco ** 3 + azar() * (radio ** 3 - hueco ** 3))
    c.lugar[i * 3] = Math.cos(fi) * s * r
    c.lugar[i * 3 + 1] = z * r
    c.lugar[i * 3 + 2] = Math.sin(fi) * s * r
    c.signo[i] = i % 2 === 0 ? 1 : -1
    // Muchas chicas y pocas grandes; las fases de la agitación.
    c.semilla[i * 4] = azar() ** 2
    c.semilla[i * 4 + 1] = azar() * Math.PI * 2
    c.semilla[i * 4 + 2] = azar() * Math.PI * 2
    c.semilla[i * 4 + 3] = azar() * Math.PI * 2
    c.enfriado[i] = azar() * 2
  }
  return c
}

const celda = (v: number): number => Math.min(LADO - 1, Math.max(0, Math.floor((v + MITAD) / PLASMA.fuerzas.alcance)))

/** Suelta el enlace de `i` (y de su pareja): un empujón para separarlos y un rato sin enlazarse. */
export function soltarEnlace(c: Cargas, i: number, azar: () => number): void {
  const j = c.pareja[i]
  if (j < 0) return
  const { empujon, enfria } = PLASMA.enlace
  const [dx, dy, dz] = [c.lugar[j * 3] - c.lugar[i * 3], c.lugar[j * 3 + 1] - c.lugar[i * 3 + 1], c.lugar[j * 3 + 2] - c.lugar[i * 3 + 2]]
  const d = Math.max(1e-4, Math.hypot(dx, dy, dz))
  for (const [k, s] of [[i, -1], [j, 1]] as const) {
    c.velocidad[k * 3] += (s * empujon * dx) / d
    c.velocidad[k * 3 + 1] += (s * empujon * dy) / d
    c.velocidad[k * 3 + 2] += (s * empujon * dz) / d
    c.pareja[k] = -1
    c.enfriado[k] = enfria[0] + azar() * (enfria[1] - enfria[0])
  }
}

/** La distancia de la carga `i` al rayo del puntero (u) y el punto del rayo más cercano, en `punto`. */
export function distanciaAlRayo(c: Cargas, i: number, r: RayoDelPuntero, punto: Float32Array): number {
  const [x, y, z] = [c.lugar[i * 3] - r.ox, c.lugar[i * 3 + 1] - r.oy, c.lugar[i * 3 + 2] - r.oz]
  const t = Math.max(0, x * r.dx + y * r.dy + z * r.dz)
  punto[0] = r.ox + r.dx * t
  punto[1] = r.oy + r.dy * t
  punto[2] = r.oz + r.dz * t
  return Math.hypot(c.lugar[i * 3] - punto[0], c.lugar[i * 3 + 1] - punto[1], c.lugar[i * 3 + 2] - punto[2])
}

const PUNTO = new Float32Array(3)

/** Un paso de la física (`dt` en s, `t` el reloj): fuerzas por la grilla, enlaces, el puntero, la cáscara y la integración. */
export function pasoDeLasCargas(c: Cargas, dt: number, t: number, rayo: RayoDelPuntero | null, azar: () => number): void {
  const F = PLASMA.fuerzas
  const E = PLASMA.enlace
  const { n, lugar, velocidad: v, fuerza, signo, pareja } = c
  fuerza.fill(0)
  // La grilla: una lista por celda (la cabeza y el siguiente), armada de nuevo en cada paso.
  c.cabeza.fill(-1)
  for (let i = 0; i < n; i += 1) {
    const k = (celda(lugar[i * 3]) * LADO + celda(lugar[i * 3 + 1])) * LADO + celda(lugar[i * 3 + 2])
    c.siguiente[i] = c.cabeza[k]
    c.cabeza[k] = i
  }
  let mirados = 0
  for (let i = 0; i < n; i += 1) {
    const [cx, cy, cz] = [celda(lugar[i * 3]), celda(lugar[i * 3 + 1]), celda(lugar[i * 3 + 2])]
    for (let ax = Math.max(0, cx - 1); ax <= Math.min(LADO - 1, cx + 1); ax += 1) {
      for (let ay = Math.max(0, cy - 1); ay <= Math.min(LADO - 1, cy + 1); ay += 1) {
        for (let az = Math.max(0, cz - 1); az <= Math.min(LADO - 1, cz + 1); az += 1) {
          for (let j = c.cabeza[(ax * LADO + ay) * LADO + az]; j >= 0; j = c.siguiente[j]) {
            // Cada par una vez (j > i), con la fuerza y su contraria.
            if (j <= i) continue
            mirados += 1
            const [dx, dy, dz] = [lugar[j * 3] - lugar[i * 3], lugar[j * 3 + 1] - lugar[i * 3 + 1], lugar[j * 3 + 2] - lugar[i * 3 + 2]]
            const d = Math.hypot(dx, dy, dz)
            if (d >= F.alcance || d < 1e-5) continue
            const opuestas = signo[i] !== signo[j]
            const u = 1 - d / F.alcance
            // Positiva: hacia j (atracción); negativa: lejos de j.
            let f = opuestas ? F.atrae * u : -F.repele * u
            if (d < F.cerca) f -= F.choque * (1 - d / F.cerca) ** 2
            const [fx, fy, fz] = [(f * dx) / d, (f * dy) / d, (f * dz) / d]
            fuerza[i * 3] += fx
            fuerza[i * 3 + 1] += fy
            fuerza[i * 3 + 2] += fz
            fuerza[j * 3] -= fx
            fuerza[j * 3 + 1] -= fy
            fuerza[j * 3 + 2] -= fz
            // Dos opuestas libres que se acercan se enlazan.
            if (opuestas && d < E.forma && pareja[i] < 0 && pareja[j] < 0 && c.enfriado[i] <= 0 && c.enfriado[j] <= 0) {
              pareja[i] = j
              pareja[j] = i
              const vida = E.vida[0] + azar() * (E.vida[1] - E.vida[0])
              c.vidaDelEnlace[i] = vida
              c.vidaDelEnlace[j] = vida
            }
          }
        }
      }
    }
  }
  c.paresMirados = mirados
  for (let i = 0; i < n; i += 1) {
    const j = pareja[i]
    // El enlace: un resorte a su largo de reposo; al terminar su vida, el par se suelta solo.
    if (j > i) {
      c.vidaDelEnlace[i] -= dt
      if (c.vidaDelEnlace[i] <= 0) {
        soltarEnlace(c, i, azar)
      } else {
        const [dx, dy, dz] = [lugar[j * 3] - lugar[i * 3], lugar[j * 3 + 1] - lugar[i * 3 + 1], lugar[j * 3 + 2] - lugar[i * 3 + 2]]
        const d = Math.max(1e-4, Math.hypot(dx, dy, dz))
        const f = E.resorte * (d - E.reposo)
        for (const [k, s] of [[i, 1], [j, -1]] as const) {
          fuerza[k * 3] += (s * f * dx) / d
          fuerza[k * 3 + 1] += (s * f * dy) / d
          fuerza[k * 3 + 2] += (s * f * dz) / d
        }
      }
    }
    c.enfriado[i] = Math.max(0, c.enfriado[i] - dt)
  }
  const P = PLASMA.cursor
  const { radio, hueco } = PLASMA.volumen
  const apaga = Math.exp(-dt / PLASMA.brillo.apagaS)
  const frena = Math.exp(-F.amortigua * dt)
  for (let i = 0; i < n; i += 1) {
    let [fx, fy, fz] = [fuerza[i * 3], fuerza[i * 3 + 1], fuerza[i * 3 + 2]]
    // El puntero: atrae a las negativas hacia su rayo y empuja a las positivas; rompe los enlaces que toca.
    if (rayo !== null) {
      const d = distanciaAlRayo(c, i, rayo, PUNTO)
      if (d < P.alcance && d > 1e-4) {
        const u = 1 - d / P.alcance
        let f = signo[i] < 0 ? P.fuerza * u : -P.fuerza * u
        if (d < P.cerca) f -= F.choque * (1 - d / P.cerca) ** 2
        fx += (f * (PUNTO[0] - lugar[i * 3])) / d
        fy += (f * (PUNTO[1] - lugar[i * 3 + 1])) / d
        fz += (f * (PUNTO[2] - lugar[i * 3 + 2])) / d
        if (d < P.rompe && pareja[i] >= 0) soltarEnlace(c, i, azar)
      }
    }
    // La agitación: un vaivén suave, distinto por carga.
    const s = c.semilla
    fx += F.agita * Math.sin(t * 0.7 + s[i * 4 + 1])
    fy += F.agita * Math.sin(t * 0.53 + s[i * 4 + 2])
    fz += F.agita * Math.sin(t * 0.61 + s[i * 4 + 3])
    // La cáscara: afuera del radio vuelven; adentro del hueco (el logo), salen.
    const [x, y, z] = [lugar[i * 3], lugar[i * 3 + 1], lugar[i * 3 + 2]]
    const r = Math.max(1e-4, Math.hypot(x, y, z))
    const sobra = r > radio ? -(r - radio) : r < hueco ? hueco - r : 0
    if (sobra !== 0) {
      fx += (F.contiene * sobra * x) / r
      fy += (F.contiene * sobra * y) / r
      fz += (F.contiene * sobra * z) / r
    }
    let [vx, vy, vz] = [(v[i * 3] + fx * dt) * frena, (v[i * 3 + 1] + fy * dt) * frena, (v[i * 3 + 2] + fz * dt) * frena]
    const rapidez = Math.hypot(vx, vy, vz)
    if (rapidez > F.tope) {
      vx *= F.tope / rapidez
      vy *= F.tope / rapidez
      vz *= F.tope / rapidez
    }
    v[i * 3] = vx
    v[i * 3 + 1] = vy
    v[i * 3 + 2] = vz
    lugar[i * 3] += vx * dt
    lugar[i * 3 + 1] += vy * dt
    lugar[i * 3 + 2] += vz * dt
    c.brillo[i] *= apaga
  }
}

/** Cuántos enlaces hay (pares). */
export function cuantosEnlaces(c: Cargas): number {
  let k = 0
  for (let i = 0; i < c.n; i += 1) if (c.pareja[i] > i) k += 1
  return k
}
