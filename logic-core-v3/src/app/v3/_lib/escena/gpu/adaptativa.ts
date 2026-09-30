/**
 * [CALIDAD 1] B11 · LA CALIDAD ADAPTATIVA — pura: cuándo bajar y cuándo subir un escalón de calidad según el tiempo de
 * cuadro, con histéresis. La aplica `CalidadAdaptativa.tsx`.
 *
 * **Qué se mide.** El intervalo entre cuadros (el `delta` de r3f), con una media exponencial, contra el REFRESCO de la
 * pantalla, que se estima con el percentil 10 de los últimos 240 intervalos (un intervalo corto suelto no lo mueve:
 * medido, con el mínimo un solo cuadro de 7,6 ms en una pantalla de 13,3 hacía bajar de más): el más bajo que se vio,
 * subiendo 0,1 % por recálculo (el refresco de una pantalla casi no cambia; con la ventana sola, un tramo pesado largo
 * lo hacía olvidar y medido quedaba en 17 ms en una pantalla de 13,3). Con vsync, un cuadro a tiempo dura un refresco y uno que se pierde, dos: la media sobre el
 * refresco dice qué fracción se pierde. No se cuentan los cuadros de más de 100 ms (un tirón suelto, la pestaña
 * oculta, la escena que se suspende). Si la página arranca ya pesada, el refresco que ve es el de dos cuadros y no baja
 * nada: falla hacia lo de siempre.
 *
 * **Cuándo cambia.** Baja un escalón si la media pasa `lento` veces el refresco durante `bajaTrasS` seguidos; sube si
 * queda debajo de `holgado` durante `subeTrasS` seguidos, y ese tiempo se DUPLICA cada vez que ya se bajó desde el
 * escalón al que se volvería (así no oscila entre dos). Después de un cambio no decide durante `quietoS`.
 *
 * **Los escalones.** Primero menos motas (con un fundido: ninguna desaparece de golpe) y después menos resolución (el
 * dpr, de a 10 % del tope del nivel: un cambio chico de nitidez). El tope del nivel es el de siempre: 1,5 en `plena`
 * (el de la regla del repo, debajo del 2 que pide el sprint) y 1 en `compacta`.
 *
 * **[B11, seguimiento] El dpr, con la página quieta.** Cambiar el dpr redimensiona el lienzo, y eso congela el hilo
 * 30–60 ms (medido: `gl.setPixelRatio` solo, sin React; b11-redimensionar): con el scroll en marcha es un tirón. Las
 * motas se aplican enseguida (van con fundido); el dpr espera a que el scroll lleve `scrollQuietoMs` quieto, y mientras
 * espera el controlador no decide (todavía no ve el efecto del cambio que pidió).
 */
export const ADAPTATIVA = {
  escalones: [
    { motas: 1, dpr: 1 },
    { motas: 0.8, dpr: 1 },
    { motas: 0.8, dpr: 0.9 },
    { motas: 0.65, dpr: 0.8 },
    { motas: 0.65, dpr: 0.7 },
  ],
  lento: 1.25,
  holgado: 1.08,
  bajaTrasS: 1.5,
  subeTrasS: 6,
  quietoS: 2.5,
  /** Cuánto tiene que llevar quieto el scroll para cambiar el dpr (ms). */
  scrollQuietoMs: 400,
  tauS: 0.4,
  ignorarMs: 100,
  /** La ventana del refresco (cuadros), cada cuánto se recalcula y el percentil. */
  ventana: 240,
  cada: 15,
  percentil: 0.1,
} as const

export interface EstadoAdaptativo {
  escalon: number
  /** La media exponencial del intervalo entre cuadros (ms). */
  media: number
  /** El refresco estimado (ms). */
  refresco: number
  /** Cuánto lleva seguido lento y holgado (s). */
  lento: number
  holgado: number
  /** Cuánto falta para volver a decidir (s). */
  quieto: number
  /** Cuántas veces se bajó DESDE cada escalón (para no volver enseguida). */
  bajadasDesde: number[]
  /** Los últimos intervalos (anillo) y su copia para ordenar: armados una vez, sin reservar por cuadro. */
  intervalos: Float32Array
  orden: Float32Array
  cuantos: number
}

export function estadoAdaptativoInicial(): EstadoAdaptativo {
  return { escalon: 0, media: Number.NaN, refresco: Number.POSITIVE_INFINITY, lento: 0, holgado: 0, quieto: ADAPTATIVA.quietoS, bajadasDesde: ADAPTATIVA.escalones.map(() => 0), intervalos: new Float32Array(ADAPTATIVA.ventana), orden: new Float32Array(ADAPTATIVA.ventana), cuantos: 0 }
}

/**
 * Un cuadro: escribe en `e` (sin reservar) y devuelve si cambió el escalón. `activa` en falso (el banco, que mide
 * configuraciones fijas) sigue midiendo el refresco y la media pero no decide, y deja el escalón en 0. `retenido`: hay
 * un cambio de dpr esperando la página quieta; la pausa vuelve a empezar en cada cuadro, así se decide recién con el
 * cambio hecho y asentado.
 */
export function pasoAdaptativo(e: EstadoAdaptativo, deltaMs: number, activa = true, retenido = false): boolean {
  if (!(deltaMs > 0) || deltaMs > ADAPTATIVA.ignorarMs) return false
  if (retenido) e.quieto = ADAPTATIVA.quietoS
  const dt = deltaMs / 1000
  e.intervalos[e.cuantos % ADAPTATIVA.ventana] = deltaMs
  e.cuantos += 1
  // La pausa (al arrancar y después de cada cambio) siempre descuenta, y mientras dura no se recalcula el refresco ni se
  // decide: el resize del lienzo trae cuadros en ráfaga (medido, 11 ms en una pantalla de 13,3).
  const enPausa = e.quieto > 0
  if (enPausa) e.quieto -= dt
  if (!enPausa && e.cuantos >= ADAPTATIVA.ventana / 4 && e.cuantos % ADAPTATIVA.cada === 0) {
    const k = Math.min(e.cuantos, ADAPTATIVA.ventana)
    e.orden.fill(Number.POSITIVE_INFINITY)
    for (let i = 0; i < k; i += 1) e.orden[i] = e.intervalos[i]
    e.orden.sort()
    const p = e.orden[Math.floor(k * ADAPTATIVA.percentil)]
    e.refresco = Number.isFinite(e.refresco) ? Math.min(p, e.refresco * 1.001) : p
  }
  e.media = Number.isNaN(e.media) ? deltaMs : e.media + (deltaMs - e.media) * (1 - Math.exp(-dt / ADAPTATIVA.tauS))
  if (!Number.isFinite(e.refresco)) return false
  const razon = e.media / e.refresco
  e.lento = razon > ADAPTATIVA.lento ? e.lento + dt : 0
  e.holgado = razon < ADAPTATIVA.holgado ? e.holgado + dt : 0
  if (!activa) {
    const cambio = e.escalon !== 0
    e.escalon = 0
    return cambio
  }
  if (enPausa) return false
  const ultimo = ADAPTATIVA.escalones.length - 1
  if (e.lento >= ADAPTATIVA.bajaTrasS && e.escalon < ultimo) {
    e.bajadasDesde[e.escalon] += 1
    e.escalon += 1
  } else if (e.escalon > 0 && e.holgado >= ADAPTATIVA.subeTrasS * 2 ** e.bajadasDesde[e.escalon - 1]) {
    e.escalon -= 1
  } else return false
  e.lento = 0
  e.holgado = 0
  e.quieto = ADAPTATIVA.quietoS
  return true
}

/** Si el escalón pedido cambia el dpr del que está aplicado: ese cambio espera la página quieta. */
export function dprPendiente(pedido: number, aplicado: number): boolean {
  return ADAPTATIVA.escalones[pedido].dpr !== ADAPTATIVA.escalones[aplicado].dpr
}

/** El dpr de un escalón: una fracción del tope del nivel, sin pasar el de la pantalla ni bajar de 0,5. */
export function dprDelEscalon(escalon: number, topeDelNivel: number, dprDeLaPantalla: number): number {
  const base = Math.min(dprDeLaPantalla, topeDelNivel)
  return Math.max(0.5, Math.round(base * ADAPTATIVA.escalones[escalon].dpr * 100) / 100)
}
