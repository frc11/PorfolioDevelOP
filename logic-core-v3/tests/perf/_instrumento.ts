import type { Page, Request } from '@playwright/test'

/**
 * P28 — El instrumento que descompone la latencia de una acción con registro.
 *
 * Qué mide, y por qué así:
 *
 *   - `acuseControlMs` — el control responde. Es la PRIMERA repintada del DOM
 *     posterior al clic: en estas superficies el clic sincroniza estado de React
 *     (spinner, `aria-pressed`, botón apagado) antes de cualquier viaje, así que
 *     la primera mutación ES esa señal. Señal 1 del invariante del acuse.
 *   - `acuseResultadoMs` — el resultado se anuncia: el toast de sonner o el
 *     `role="status"` del autoguardado diciendo «Guardado». Señal 2.
 *   - `reflejoMs` — la pantalla muestra el estado nuevo: la PRIMERA repintada de
 *     `main` posterior a que vuelva el último árbol del servidor. Ese es el
 *     instante en que la respuesta del server llega a la pantalla, y es lo único
 *     que se puede afirmar sin elegir a mano un texto por acción.
 *
 *     No es «la última ráfaga de mutaciones»: se probó y da 2 ms en casi todas.
 *     Framer Motion escribe `style` en cada cuadro durante sus transiciones, así
 *     que `main` muta a 60 fps y TODA la acción queda dentro de una sola ráfaga
 *     continua — el instrumento decía «instantáneo» en pantallas que todavía
 *     mostraban lo viejo. Cruzar el reloj del DOM con el de la red saca la
 *     animación del medio.
 *   - `viajes` — cada request al servidor disparado por la acción, con su
 *     duración: el POST de la server action (`Next-Action`) y los GET de árbol
 *     (RSC). De acá sale «cuántos viajes hace una acción que podría hacer uno».
 *
 * El reloj es el de la página (`performance.now()`), no el de Node: no mete el
 * ida y vuelta del protocolo de Playwright en el número. El `t0` lo pone un
 * listener en fase de captura sobre el `click`/`input` real, no una llamada
 * previa desde el test — con eso el cero es el clic y no «poco antes del clic».
 */

export type Viaje = {
  /**
   * `accion` = POST de server action (`Next-Action`).
   * `rsc` = GET de árbol que la acción provoca — el `router.refresh()` y las
   *   navegaciones.
   * `prefetch` = GET de árbol que el router dispara SOLO para tener listos los
   *   `<Link>` de la pantalla nueva (`Next-Router-Prefetch`). Se cuenta aparte
   *   porque no está en el camino crítico: la pantalla ya se pintó cuando salen,
   *   y sumarlos infla el total hasta dar residuales negativos.
   */
  tipo: 'accion' | 'rsc' | 'prefetch'
  ms: number
  /** ms desde el clic hasta que ese request arrancó. */
  desdeClicMs: number
}

export type Medicion = {
  acuseControlMs: number | null
  acuseResultadoMs: number | null
  reflejoMs: number | null
  viajes: Viaje[]
  /** Suma de las duraciones de los POST de server action. */
  accionMs: number
  /** Suma de las duraciones de los GET de árbol que la acción provoca. */
  rscMs: number
  viajesAccion: number
  viajesRsc: number
  viajesPrefetch: number
  /**
   * ¿El texto de `main` es distinto del que había al momento del clic? Es la
   * pregunta literal del sprint —«¿la pantalla muestra el estado nuevo?»— y se
   * contesta comparando, no infiriendo: un reflejo temprano puede ser el acuse
   * pintándose, no el árbol del servidor.
   */
  cambioPantalla: boolean
  /** Primer instante (desde el clic) en que el TEXTO de `main` difiere del que
   *  había al hacer clic. `null` = nunca difirió dentro de la ventana medida. */
  cambioTextoMs: number | null
  /**
   * El CAMINO CRÍTICO de red: los intervalos de acción+refresh unidos (sin
   * contar dos veces lo que corre en paralelo), desde el clic. Es lo que hay que
   * comparar contra el reflejo — la suma pelada cuenta solapados y da negativo.
   */
  redCriticaMs: number
}

/** Ventana de silencio que da por cerrada la actividad de la pantalla. */
const QUIETUD_MS = 1200
/** Tolerancia al cruzar el reloj de la red con el del DOM. */
const TOLERANCIA_MS = 30
/** Piso de observación por acción (ver `cosechar`). */
const PISO_OBSERVACION_MS = 6000

type EstadoPagina = {
  /** Texto de `main` en el instante de armar: la línea de base del reflejo. */
  textoInicial: string
  cambioTexto: number | null
  t0: number | null
  acuseControl: number | null
  acuseResultado: number | null
  /** Mutaciones DENTRO del área de trabajo (`main`) — las que son «la pantalla». */
  mutaciones: number[]
}

declare global {
  interface Window {
    __p28?: EstadoPagina
    __p28off?: () => void
  }
}

/**
 * Arma la instrumentación en la página. Idempotente: desarma la anterior antes
 * de montar la nueva (si no, dos observers duplican las mutaciones y la ráfaga
 * se lee el doble de densa).
 */
export async function armarPagina(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__p28off?.()

    const estado: EstadoPagina = {
      textoInicial: document.querySelector('main')?.textContent ?? '',
      cambioTexto: null,
      t0: null,
      acuseControl: null,
      acuseResultado: null,
      mutaciones: [],
    }
    window.__p28 = estado

    const marcarT0 = () => {
      if (estado.t0 === null) estado.t0 = performance.now()
    }
    // Captura: corre en el clic REAL, antes de cualquier handler de React.
    document.addEventListener('click', marcarT0, true)
    document.addEventListener('input', marcarT0, true)

    const hayResultadoAnunciado = (): boolean => {
      if (document.querySelector('[data-sonner-toast]')) return true
      const estados = Array.from(document.querySelectorAll('[role="status"]'))
      return estados.some((nodo) => /Guardado/.test(nodo.textContent ?? ''))
    }

    // Solo cuenta como «la pantalla» lo que muta DENTRO de `main`. Medido: el
    // toast de sonner se anima con mutaciones continuas durante ~2 s desde un
    // portal en `body`; contándolas, todo el intervalo quedaba en UNA sola
    // ráfaga y el reflejo se leía en el milisegundo 2 — el instrumento decía
    // «instantáneo» justo donde la pantalla todavía mostraba lo viejo.
    const enAreaDeTrabajo = (nodo: Node | null): boolean => {
      const elemento = nodo === null ? null : nodo.nodeType === 1 ? (nodo as Element) : nodo.parentElement
      return elemento !== null && elemento.closest('main') !== null
    }

    const observer = new MutationObserver((registros) => {
      if (estado.t0 === null) return
      const ahora = performance.now()
      if (registros.some((registro) => enAreaDeTrabajo(registro.target))) {
        estado.mutaciones.push(ahora)
        if (estado.acuseControl === null) estado.acuseControl = ahora
        if (
          estado.cambioTexto === null &&
          (document.querySelector('main')?.textContent ?? '') !== estado.textoInicial
        ) {
          estado.cambioTexto = ahora
        }
      }
      if (estado.acuseResultado === null && hayResultadoAnunciado()) {
        estado.acuseResultado = ahora
      }
    })
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    })

    window.__p28off = () => {
      observer.disconnect()
      document.removeEventListener('click', marcarT0, true)
      document.removeEventListener('input', marcarT0, true)
    }
  })
}

type MarcaRequest = { tipo: Viaje['tipo']; inicio: number }
type RequestMarcado = Request & { __p28?: MarcaRequest }
type ViajeCrudo = { tipo: Viaje['tipo']; inicioEpoch: number; ms: number }

export type Red = {
  viajes: ViajeCrudo[]
  enVuelo: () => number
  /** Epoch del último evento de red instrumentado (arranque o fin). */
  ultimoEvento: () => number
  soltar: () => void
}

/**
 * Engancha la red de la página. Solo mira los dos requests que una acción con
 * registro produce: el POST de server action (header `Next-Action`) y los GET de
 * árbol (header `RSC`). Todo lo demás —estáticos, imágenes— no participa.
 */
export function engancharRed(page: Page): Red {
  const viajes: ViajeCrudo[] = []
  let enVuelo = 0
  let ultimoEvento = Date.now()

  const onRequest = (request: Request) => {
    const headers = request.headers()
    const esAccion = Boolean(headers['next-action'])
    const esRsc = Boolean(headers['rsc'] ?? headers['next-router-state-tree'])
    if (!esAccion && !esRsc) return
    const esPrefetch = Boolean(headers['next-router-prefetch'])
    enVuelo += 1
    ultimoEvento = Date.now()
    ;(request as RequestMarcado).__p28 = {
      tipo: esAccion ? 'accion' : esPrefetch ? 'prefetch' : 'rsc',
      inicio: Date.now(),
    }
  }

  const onFinished = (request: Request) => {
    const marca = (request as RequestMarcado).__p28
    if (!marca) return
    delete (request as RequestMarcado).__p28
    enVuelo -= 1
    ultimoEvento = Date.now()
    viajes.push({ tipo: marca.tipo, inicioEpoch: marca.inicio, ms: Date.now() - marca.inicio })
  }

  page.on('request', onRequest)
  page.on('requestfinished', onFinished)
  page.on('requestfailed', onFinished)

  return {
    viajes,
    enVuelo: () => enVuelo,
    ultimoEvento: () => ultimoEvento,
    soltar: () => {
      page.off('request', onRequest)
      page.off('requestfinished', onFinished)
      page.off('requestfailed', onFinished)
    },
  }
}

/**
 * Espera a que la acción termine y devuelve la medición. «Terminar» son DOS
 * condiciones, no una:
 *
 *   1. no queda ningún request instrumentado en vuelo, y
 *   2. `main` lleva `QUIETUD_MS` sin mutar.
 *
 * La primera no estaba y costó una corrida entera de números falsos: cuando la
 * pantalla no cambia con el clic (el autoguardado de la ficha, por ejemplo),
 * `main` se aquietaba a los 12 ms y la cosecha devolvía ANTES de que el POST
 * terminara — el viaje ni siquiera figuraba en la tabla, y la acción aparecía
 * con cero viajes y reflejo instantáneo. Medir el silencio de la pantalla sin
 * mirar la red mide, otra vez, la nada.
 *
 * Si no se cumplen dentro de `topeMs`, corta y devuelve lo que haya: un número
 * recortado se ve en la tabla; un throw perdería la corrida entera.
 */
export async function cosechar(page: Page, red: Red, topeMs = 30_000): Promise<Medicion> {
  const arranque = Date.now()
  const limite = arranque + topeMs
  // PISO de observación. Las condiciones de quietud alcanzan para las acciones
  // que se reflejan enseguida, pero hay una familia que tarda SEGUNDOS después
  // de que el último árbol volvió: ahí la ventana corta antes del commit y la
  // acción sale como «la pantalla no cambió», que es exactamente el defecto que
  // hay que medir, no esconder. Se observa siempre este mínimo.
  const piso = arranque + PISO_OBSERVACION_MS
  for (;;) {
    const quieto = await page.evaluate((quietud) => {
      const estado = window.__p28
      if (!estado) return true
      const ultima = estado.mutaciones[estado.mutaciones.length - 1] ?? estado.t0 ?? performance.now()
      return performance.now() - ultima >= quietud
    }, QUIETUD_MS)
    // El tercer freno, y el que faltaba: que haya pasado la ventana de silencio
    // DESDE EL ÚLTIMO EVENTO DE RED. Entre que el POST termina y el
    // `router.refresh()` sale hay un hueco de decenas de ms en el que no queda
    // nada en vuelo y la pantalla está quieta: sin esto la cosecha cortaba ahí,
    // justo antes del segundo viaje, y la acción quedaba registrada como «no
    // cambió la pantalla» cuando en realidad cambiaba medio segundo después.
    const redQuieta = Date.now() - red.ultimoEvento() >= QUIETUD_MS
    if (Date.now() >= piso && quieto && redQuieta && red.enVuelo() === 0) break
    if (Date.now() >= limite) break
    await new Promise((listo) => setTimeout(listo, 50))
  }

  const crudo = await page.evaluate(
    () => {
      const estado = window.__p28
      if (!estado) throw new Error('P28: la página no está instrumentada')
      return {
        t0: estado.t0,
        // Offset del reloj de la página al epoch, para cruzar DOM con red.
        t0Epoch: Date.now() - (performance.now() - (estado.t0 ?? performance.now())),
        acuseControl: estado.acuseControl,
        acuseResultado: estado.acuseResultado,
        mutaciones: estado.mutaciones.slice(),
        cambioPantalla: (document.querySelector('main')?.textContent ?? '') !== estado.textoInicial,
        cambioTexto: estado.cambioTexto,
      }
    },
  )

  const t0 = crudo.t0
  const rel = (valor: number | null): number | null =>
    t0 === null || valor === null ? null : Math.round(valor - t0)

  const viajes: Viaje[] = red.viajes
    .filter((viaje) => viaje.inicioEpoch >= crudo.t0Epoch - 250)
    .map((viaje) => ({
      tipo: viaje.tipo,
      ms: viaje.ms,
      desdeClicMs: Math.max(0, Math.round(viaje.inicioEpoch - crudo.t0Epoch)),
    }))

  const deAccion = viajes.filter((viaje) => viaje.tipo === 'accion')
  const deRsc = viajes.filter((viaje) => viaje.tipo === 'rsc')
  const dePrefetch = viajes.filter((viaje) => viaje.tipo === 'prefetch')

  // EL REFLEJO: la primera repintada de `main` posterior al último árbol que
  // vuelve del servidor. `null` = el árbol llegó y no cambió nada en pantalla.
  const finUltimoArbol = [...deAccion, ...deRsc].reduce(
    (maximo, viaje) => Math.max(maximo, viaje.desdeClicMs + viaje.ms),
    Number.NEGATIVE_INFINITY,
  )
  const mutacionesRel = crudo.mutaciones.map((marca) => Math.round(marca - (t0 ?? marca)))
  const reflejo =
    finUltimoArbol === Number.NEGATIVE_INFINITY
      ? null
      : (mutacionesRel.find((marca) => marca >= finUltimoArbol - TOLERANCIA_MS) ?? null)

  return {
    acuseControlMs: rel(crudo.acuseControl),
    acuseResultadoMs: rel(crudo.acuseResultado),
    reflejoMs: reflejo,
    viajes,
    accionMs: deAccion.reduce((suma, viaje) => suma + viaje.ms, 0),
    rscMs: deRsc.reduce((suma, viaje) => suma + viaje.ms, 0),
    viajesAccion: deAccion.length,
    viajesRsc: deRsc.length,
    viajesPrefetch: dePrefetch.length,
    cambioPantalla: crudo.cambioPantalla,
    cambioTextoMs: rel(crudo.cambioTexto),
    redCriticaMs: unionDeIntervalos([...deAccion, ...deRsc]),
  }
}

/** Unión de los intervalos [inicio, fin) — no cuenta dos veces lo simultáneo. */
function unionDeIntervalos(viajes: readonly Viaje[]): number {
  if (viajes.length === 0) return 0
  const tramos = viajes
    .map((viaje) => [viaje.desdeClicMs, viaje.desdeClicMs + viaje.ms] as const)
    .sort((a, b) => a[0] - b[0])
  let total = 0
  let [desde, hasta] = tramos[0]!
  for (const [inicio, fin] of tramos.slice(1)) {
    if (inicio > hasta) {
      total += hasta - desde
      desde = inicio
      hasta = fin
    } else if (fin > hasta) {
      hasta = fin
    }
  }
  return Math.round(total + (hasta - desde))
}

/** La mediana de una lista (con longitud par, la de arriba del par central). */
export function mediana(valores: readonly number[]): number {
  if (valores.length === 0) return 0
  const orden = [...valores].sort((a, b) => a - b)
  return orden[Math.floor(orden.length / 2)]!
}

export function peor(valores: readonly number[]): number {
  return valores.length === 0 ? 0 : Math.max(...valores)
}
