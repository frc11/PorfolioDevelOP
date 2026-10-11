import { ARCOS, activos, entero, entre, extremo, type Arco, type ClaseDeArco, type Entorno, type EstadoDeLosArcos } from './arcos'
import { CAMINO, PUNTOS_DEL_CAMINO, PUNTOS_DE_RAMA, camino, rama, temblarElCanal } from './camino'
import { ESPECIE, ESPECIES, cargaDe, ionizar, type Particulas } from '../especies'
import { LADO, celda, distanciaAlRayo, type Gas, type RayoDelPuntero } from '../fisica/fisica'

/**
 * [PULIDO 16] N2 · EL PROGRAMADOR DE LOS ARCOS (`arcos.ts`: qué es un arco). Por cuadro: cada arco envejece y da sus golpes (el
 * primero ioniza lo que toca; el re-golpe tiembla un poco el canal); nacen los nuevos —la descarga al soltar el botón, el pulso
 * del clic, al puntero, entre los pares ligados y del logo— bajo el tope, con tasas que suben con la temperatura (saturada).
 * Puro: sin reservas (los puntos de trabajo son fijos).
 */

/** Un lugar libre; si no hay (o se llegó al tope) y `desplaza`, el del más viejo que no sea del puntero. */
function lugarLibre(e: EstadoDeLosArcos, maximo: number, desplaza: boolean): Arco | null {
  if (activos(e) < maximo) {
    for (const a of e.arcos) if (!a.activo) return a
  }
  if (!desplaza) return null
  let viejo: Arco | null = null
  for (const a of e.arcos) if (a.activo && a.clase !== 'cursor' && a.clase !== 'descarga' && (viejo === null || a.edad / a.vida > viejo.edad / viejo.vida)) viejo = a
  if (viejo !== null) viejo.activo = false
  return viejo
}

const A = new Float32Array(3)
const B = new Float32Array(3)
const P = new Float32Array(3)

/** Enciende `arco`: su camino (el líder), sus ramas, sus golpes; el primero ya da (ioniza y deja brillo). */
function encender(e: EstadoDeLosArcos, arco: Arco, clase: ClaseDeArco, a: number, b: number, g: Gas, en: Entorno, azar: () => number, fuerza = 1): void {
  const de = ARCOS.clases[clase]
  arco.activo = true
  arco.clase = clase
  arco.a = a
  arco.b = b
  extremo(arco, g.p, true, A)
  extremo(arco, g.p, false, B)
  arco.a0.set(A)
  arco.b0.set(B)
  arco.alineacion = camino(arco.canal, A[0], A[1], A[2], B[0], B[1], B[2], en.campo, azar, clase === 'logo')
  arco.ramas = entero(azar, de.ramas)
  for (let r = 0; r < arco.ramas; r += 1) {
    const k = Math.round((PUNTOS_DEL_CAMINO - 1) * entre(azar, CAMINO.ramas.desde))
    arco.ramaDesde[r] = k
    arco.ramaHalla[r] = rama(arco.ramaPuntos, r * PUNTOS_DE_RAMA * 3, arco.canal[k * 3], arco.canal[k * 3 + 1], arco.canal[k * 3 + 2], en.campo, en.buscarCarga, azar) ? 1 : 0
  }
  arco.golpes = entero(azar, de.golpes)
  arco.tiempos[0] = 0
  for (let k = 1; k < arco.golpes; k += 1) arco.tiempos[k] = entre(azar, ARCOS.golpes.ventana) * (k / (arco.golpes - 1))
  arco.dados = 0
  arco.edad = 0
  arco.vida = arco.tiempos[arco.golpes - 1] + ARCOS.golpes.residual * 2.6
  arco.brillo = de.brillo * (clase === 'descarga' ? 0.6 + 0.6 * fuerza : 1)
  arco.ancho = de.ancho * (clase === 'descarga' ? 0.7 + 0.5 * fuerza : 1)
  arco.ionizados = 0
  e.contados[clase] += 1
  e.nacidos += 1
  e.maximoALaVez = Math.max(e.maximoALaVez, activos(e))
  golpear(arco, g, azar, en.temperatura)
}

/**
 * Un golpe: el re-golpe tiembla un poco el canal; todos dejan brillo en sus extremos; el primero ioniza (el átomo donde pega y los
 * que toca su camino; los re-golpes, menos), con más chance cuanto más caliente está el gas.
 */
function golpear(arco: Arco, g: Gas, azar: () => number, temperatura: number): void {
  if (arco.dados > 0) temblarElCanal(arco.canal, azar, ARCOS.golpes.temblor)
  const p = g.p
  if (arco.a >= 0) p.brillo[arco.a] = Math.min(2, p.brillo[arco.a] + ESPECIES.brillo.arco)
  if (arco.b >= 0) p.brillo[arco.b] = Math.min(2, p.brillo[arco.b] + ESPECIES.brillo.arco)
  const de = ARCOS.clases[arco.clase].ioniza
  const chance = Math.min(1, (arco.dados === 0 ? de.chance : de.chance * 0.35) * (1 + 0.6 * temperatura))
  // El átomo donde pega el arco.
  if (arco.b >= 0 && p.especie[arco.b] === ESPECIE.atomo && arco.ionizados < de.maximo && azar() < chance) {
    const k = PUNTOS_DEL_CAMINO - 2
    const salida = ionizar(p, arco.b, p.lugar[arco.b * 3] - arco.canal[k * 3], p.lugar[arco.b * 3 + 1] - arco.canal[k * 3 + 1], p.lugar[arco.b * 3 + 2] - arco.canal[k * 3 + 2], entre(azar, ARCOS.eyeccion), azar)
    if (salida >= 0) arco.ionizados += 1
  }
  if (arco.ionizados < de.maximo) ionizarElCamino(arco, g, de.radio, chance, de.maximo, azar)
  arco.dados += 1
}

/** Los átomos cerca del canal se ionizan (con su chance, hasta el máximo): el electrón sale disparado, alejándose del canal. */
function ionizarElCamino(arco: Arco, g: Gas, radio: number, chance: number, maximo: number, azar: () => number): void {
  const p = g.p
  for (let k = 1; k < PUNTOS_DEL_CAMINO - 1 && arco.ionizados < maximo; k += 2) {
    const x = arco.canal[k * 3]
    const y = arco.canal[k * 3 + 1]
    const z = arco.canal[k * 3 + 2]
    const cx = celda(x)
    const cy = celda(y)
    const cz = celda(z)
    for (let ax = Math.max(0, cx - 1); ax <= Math.min(LADO - 1, cx + 1) && arco.ionizados < maximo; ax += 1)
      for (let ay = Math.max(0, cy - 1); ay <= Math.min(LADO - 1, cy + 1) && arco.ionizados < maximo; ay += 1)
        for (let az = Math.max(0, cz - 1); az <= Math.min(LADO - 1, cz + 1) && arco.ionizados < maximo; az += 1)
          for (let i = g.cabeza[(ax * LADO + ay) * LADO + az]; i >= 0; i = g.siguiente[i]) {
            if (p.especie[i] !== ESPECIE.atomo || i === arco.a || i === arco.b) continue
            const dx = p.lugar[i * 3] - x
            const dy = p.lugar[i * 3 + 1] - y
            const dz = p.lugar[i * 3 + 2] - z
            if (dx * dx + dy * dy + dz * dz > radio * radio || azar() > chance) continue
            if (ionizar(p, i, dx + (azar() - 0.5) * 0.2, dy + (azar() - 0.5) * 0.2, dz + (azar() - 0.5) * 0.2, entre(azar, ARCOS.eyeccion), azar) >= 0) {
              arco.ionizados += 1
              if (arco.ionizados >= maximo) break
            }
          }
  }
}

/**
 * Una partícula al azar (pareja entre todas) de las que se ven a menos de `radio` de `centro`: el muestreo de un reservorio, mirando
 * todas una vez (en el teléfono casi todas quedan fuera del cuadro, y unos intentos al azar no encontraban ninguna). −1 si no hay.
 */
function alAlcance(p: Particulas, centro: Float32Array, radio: number, en: Entorno, azar: () => number): number {
  let elegida = -1
  let vistas = 0
  for (let i = 0; i < p.n; i += 1) {
    if (p.especie[i] === ESPECIE.vacio || p.alfa[i] <= 0.5) continue
    const x = p.lugar[i * 3]
    const y = p.lugar[i * 3 + 1]
    const z = p.lugar[i * 3 + 2]
    if (Math.hypot(x - centro[0], y - centro[1], z - centro[2]) >= radio || !en.seVe(x, y, z)) continue
    vistas += 1
    if (azar() * vistas < 1) elegida = i
  }
  return elegida
}

const enLugar = (p: Particulas, i: number, destino: Float32Array): Float32Array => {
  destino[0] = p.lugar[i * 3]
  destino[1] = p.lugar[i * 3 + 1]
  destino[2] = p.lugar[i * 3 + 2]
  return destino
}

/** Una carga (ion o electrón) al azar, mirando a lo sumo `intentos`, que se vea, a su alcance desde el rayo (su punto, a la vista). */
function cargaAlAzar(p: Particulas, intentos: number, azar: () => number, en: Entorno, rayo: RayoDelPuntero): number {
  for (let k = 0; k < intentos; k += 1) {
    const i = Math.floor(azar() * p.n)
    if (cargaDe(p, i) === 0 || p.alfa[i] <= 0.5) continue
    const x = p.lugar[i * 3]
    const y = p.lugar[i * 3 + 1]
    const z = p.lugar[i * 3 + 2]
    if (!en.seVe(x, y, z)) continue
    const d = distanciaAlRayo(x, y, z, rayo, P)
    if (d >= ARCOS.alcances.cursor[0] && d < ARCOS.alcances.cursor[1] && en.seVe(P[0], P[1], P[2])) return i
  }
  return -1
}

/**
 * El paso de los arcos: envejecen, dan sus golpes y se apagan; nacen los nuevos (el puntero, los pedidos del pulso y la descarga,
 * los pares ligados, el logo) bajo el tope. `g` trae la grilla del último subpaso.
 */
export function programarArcos(e: EstadoDeLosArcos, g: Gas, dt: number, en: Entorno, azar: () => number): void {
  const p = g.p
  e.nacidos = 0
  for (const arco of e.arcos) {
    if (!arco.activo) continue
    arco.edad += dt
    if (arco.edad >= arco.vida || (arco.a >= 0 && p.especie[arco.a] === ESPECIE.vacio) || (arco.b >= 0 && p.especie[arco.b] === ESPECIE.vacio)) {
      arco.activo = false
      continue
    }
    while (arco.dados < arco.golpes && arco.edad >= arco.tiempos[arco.dados]) golpear(arco, g, azar, en.temperatura)
    if (arco.clase === 'cursor' && en.rayo !== null && arco.a >= 0) distanciaAlRayo(p.lugar[arco.a * 3], p.lugar[arco.a * 3 + 1], p.lugar[arco.a * 3 + 2], en.rayo, arco.puntoB)
  }
  const forzado = e.forzado
  e.forzado = null
  const calor = 1 + ARCOS.tasas.calor * en.temperatura
  // La descarga al soltar el botón: al grupo de cargas más cercano o, si no hay, al logo.
  if (e.pedidos.descarga) {
    e.pedidos.descarga = false
    descargar(e, g, en, azar)
  }
  // El pulso del clic: empuja, ioniza lo cercano y le tira arcos.
  if (e.pedidos.pulso) {
    e.pedidos.pulso = false
    pulsar(e, g, en, azar)
  }
  // El puntero: si hay cargas a su alcance, un arco le salta.
  if (en.rayo !== null && (forzado === 'cursor' || azar() < ARCOS.tasas.cursor * calor * dt)) {
    const rayo = en.rayo
    const i = cargaAlAzar(p, 60, azar, en, rayo)
    const arco = i >= 0 ? lugarLibre(e, en.maximo, true) : null
    if (arco !== null) {
      distanciaAlRayo(p.lugar[i * 3], p.lugar[i * 3 + 1], p.lugar[i * 3 + 2], rayo, arco.puntoB)
      encender(e, arco, 'cursor', i, -1, g, en, azar)
    }
  }
  // Los pares ligados (un ion y su electrón) descargan entre sí.
  if (forzado === 'par' || azar() < ARCOS.tasas.par * calor * dt) {
    const inicio = Math.floor(azar() * p.n)
    for (let k = 0; k < p.n; k += 1) {
      const i = (inicio + k) % p.n
      const j = g.pareja[i]
      if (j < 0 || cargaDe(p, i) === 0 || cargaDe(p, j) === 0) continue
      enLugar(p, i, A)
      enLugar(p, j, B)
      if (Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]) > ARCOS.alcances.par || !en.seVe(A[0], A[1], A[2]) || !en.seVe(B[0], B[1], B[2])) continue
      const arco = lugarLibre(e, en.maximo, forzado === 'par')
      if (arco !== null) encender(e, arco, 'par', i, j, g, en, azar)
      break
    }
  }
  // El logo, el generador: cada tanto (más seguido con su actividad), hacia una partícula cercana que se vea. De cuatro al azar, el
  // átomo más cercano (lo ioniza: alimenta el ciclo); si no hay átomo, la más cercana (el logo, positivo, junta electrones cerca).
  e.proximoDelLogo -= dt * calor * (1 + 2 * en.actividadDelLogo)
  if (forzado === 'logo' || e.proximoDelLogo <= 0) {
    e.proximoDelLogo = entre(azar, ARCOS.tasas.logo)
    let mejor = -1
    let distancia = Number.POSITIVE_INFINITY
    let atomo = false
    for (let intento = 0, vistos = 0; intento < p.n * 2 && vistos < 4; intento += 1) {
      const i = Math.floor(azar() * p.n)
      if (p.especie[i] === ESPECIE.vacio || p.alfa[i] < 0.6) continue
      const d = Math.hypot(p.lugar[i * 3], p.lugar[i * 3 + 1], p.lugar[i * 3 + 2])
      if (d > ARCOS.alcances.logo || !en.seVe(p.lugar[i * 3], p.lugar[i * 3 + 1], p.lugar[i * 3 + 2])) continue
      vistos += 1
      const esAtomo = p.especie[i] === ESPECIE.atomo
      if ((esAtomo && !atomo) || (esAtomo === atomo && d < distancia)) {
        mejor = i
        distancia = d
        atomo = esAtomo
      }
    }
    if (mejor >= 0 && en.bordeDelLogo(p.lugar[mejor * 3], p.lugar[mejor * 3 + 1], p.lugar[mejor * 3 + 2], P) && en.seVe(P[0], P[1], P[2])) {
      const arco = lugarLibre(e, en.maximo, true)
      if (arco !== null) {
        arco.puntoA.set(P)
        encender(e, arco, 'logo', -1, mejor, g, en, azar)
      }
    }
  }
}

/** El pulso del clic, en `pedidos.donde`: empuja todo hacia afuera, ioniza algunos átomos y tira arcos a las cargas cercanas. */
function pulsar(e: EstadoDeLosArcos, g: Gas, en: Entorno, azar: () => number): void {
  const p = g.p
  const c = e.pedidos.donde
  const radio = ARCOS.alcances.pulso
  let ionizados = 0
  for (let i = 0; i < p.n; i += 1) {
    if (p.especie[i] === ESPECIE.vacio) continue
    const dx = p.lugar[i * 3] - c[0]
    const dy = p.lugar[i * 3 + 1] - c[1]
    const dz = p.lugar[i * 3 + 2] - c[2]
    const d = Math.hypot(dx, dy, dz)
    if (d > radio || d < 1e-4) continue
    const u = 1 - d / radio
    p.velocidad[i * 3] += (ARCOS.pulso.empuje * u * dx) / d
    p.velocidad[i * 3 + 1] += (ARCOS.pulso.empuje * u * dy) / d
    p.velocidad[i * 3 + 2] += (ARCOS.pulso.empuje * u * dz) / d
    if (p.especie[i] === ESPECIE.atomo && ionizados < ARCOS.pulso.ioniza && azar() < u * 0.8 && ionizar(p, i, dx, dy, dz, entre(azar, ARCOS.eyeccion), azar) >= 0) ionizados += 1
  }
  const cuantos = entero(azar, ARCOS.pulso.arcos)
  for (let k = 0; k < cuantos; k += 1) {
    // A las partículas cercanas (las cargas o los átomos, que el arco ioniza).
    const i = alAlcance(p, c, radio, en, azar)
    const arco = i >= 0 ? lugarLibre(e, en.maximo, true) : null
    if (arco === null) break
    arco.puntoA.set(c)
    encender(e, arco, 'pulso', -1, i, g, en, azar)
  }
}

/** La descarga al soltar: un arco grande desde el puntero al grupo de cargas más denso cerca (o al logo). */
function descargar(e: EstadoDeLosArcos, g: Gas, en: Entorno, azar: () => number): void {
  const p = g.p
  const c = e.pedidos.donde
  let mejor = -1
  let vecinos = 0
  for (let i = 0; i < p.n; i += 1) {
    if (cargaDe(p, i) === 0 || p.alfa[i] < 0.5) continue
    const d = Math.hypot(p.lugar[i * 3] - c[0], p.lugar[i * 3 + 1] - c[1], p.lugar[i * 3 + 2] - c[2])
    if (d > ARCOS.alcances.descarga || d < 1 || !en.seVe(p.lugar[i * 3], p.lugar[i * 3 + 1], p.lugar[i * 3 + 2])) continue
    let k = 0
    for (let j = 0; j < p.n; j += 1) if (j !== i && cargaDe(p, j) !== 0 && Math.hypot(p.lugar[j * 3] - p.lugar[i * 3], p.lugar[j * 3 + 1] - p.lugar[i * 3 + 1], p.lugar[j * 3 + 2] - p.lugar[i * 3 + 2]) < 1.6) k += 1
    // El más denso; a igual densidad, el más cerca.
    if (k > vecinos || (k === vecinos && mejor >= 0 && d < Math.hypot(p.lugar[mejor * 3] - c[0], p.lugar[mejor * 3 + 1] - c[1], p.lugar[mejor * 3 + 2] - c[2]))) {
      mejor = i
      vecinos = k
    }
  }
  const arco = lugarLibre(e, en.maximo, true)
  if (arco === null) return
  arco.puntoA.set(c)
  if (mejor >= 0 && vecinos >= 1) {
    encender(e, arco, 'descarga', -1, mejor, g, en, azar, e.pedidos.fuerza)
    return
  }
  // Sin grupo: al logo.
  if (en.bordeDelLogo(c[0], c[1], c[2], arco.puntoB)) encender(e, arco, 'descarga', -1, -1, g, en, azar, e.pedidos.fuerza)
}
