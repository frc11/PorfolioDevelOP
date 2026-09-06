/**
 * EL CENSO DE ACONTECIMIENTOS — el instrumento de `B2-DELTAS` §0, partido en
 * dos mitades para que la mitad que decide se pueda probar sin navegador.
 *
 * ── Qué es un acontecimiento ──────────────────────────────────────────────
 *
 * Un **aterrizaje** es la última parada del barrido en la que un elemento cambió
 * su estilo en línea: algo que estaba cambiando **deja de cambiar** ahí. Un
 * **acontecimiento** es un grupo de aterrizajes separados por menos de dos
 * pasos. El **hueco** entre dos acontecimientos es la distancia del final de uno
 * al principio del siguiente, y es el «no pasa nada» que se mide.
 *
 * Corre igual en un sitio propio y en uno ajeno porque no lee un selector de
 * nadie: los dos escriben la animación como estilo en línea.
 *
 * ── Por qué está partido ──────────────────────────────────────────────────
 *
 * B2 hizo las dos mitades adentro de la página y devolvió el resumen. Eso
 * funciona y **no se puede probar**: la regla de agrupamiento —lo único que
 * decide cuántos acontecimientos hay— vivía en un `evaluate_script` que nadie
 * podía correr contra un caso construido.
 *
 * Acá la página hace lo que sólo la página puede hacer (barrer el scroll y leer
 * el DOM) y devuelve **el histograma de aterrizajes**, que son unas doscientas
 * entradas; el agrupamiento corre en Node, sobre esa lista, y tiene control
 * positivo. La regla es la misma, carácter por carácter, y ahora se puede
 * demostrar.
 *
 * ── ⚠️ Las dos trampas que B2 pagó y que la fuente de abajo evita ─────────
 *
 *   1. **La clave es la RUTA del DOM**, no el índice de `querySelectorAll`. Con
 *      nodos cacheados el instrumento daba 94 elementos activos contra 190:
 *      cuando un componente reemplaza contenido —los tres servicios de la
 *      secuencia pinneada— los nodos viejos quedan desconectados, su estilo se
 *      congela, y el instrumento los contaba «aterrizando» todos juntos en el
 *      mismo píxel. Un número plausible y equivocado.
 *   2. **Alta y baja son MONTAJES, no aterrizajes.** Un cambio real exige que la
 *      ruta exista en las dos paradas.
 */

/** Lo que la página devuelve. Todo JSON-serializable. */
export interface LecturaDelCenso {
  /** `[y del aterrizaje, cuántos elementos aterrizaron ahí]`. */
  readonly aterrizajes: readonly (readonly [number, number])[]
  readonly montajes: readonly { readonly y: number; readonly alta: number; readonly baja: number }[]
  /** `window.innerHeight` en el momento del barrido. Es la unidad de «pantallas». */
  readonly ventana: number
  readonly paso: number
  readonly desde: number
  readonly hasta: number
  /**
   * Cuántos elementos tenían estilo en línea en cada parada.
   *
   * ⚠️ **Es lo que separa «cero acontecimientos» de «el instrumento no vio la
   * página».** Si esta serie es toda cero, el sistema de movimiento no está
   * montado —que abajo de 1025 es lo esperado y es el hallazgo—; si tiene
   * valores y aun así no hay aterrizajes, es otra cosa y hay que mirarla.
   */
  readonly estiloPorParada: readonly number[]
  readonly visibilityState: string
  readonly innerWidth: number
}

export interface Grupo {
  readonly ini: number
  readonly fin: number
  readonly piezas: number
}

export interface Censo {
  readonly acontecimientos: number
  readonly grupos: readonly Grupo[]
  readonly huecosPx: readonly number[]
  readonly huecosPantallas: readonly number[]
  readonly huecoMaximoPantallas: number | null
  readonly huecoMedioPantallas: number | null
  readonly piezasTotales: number
}

/**
 * EL AGRUPAMIENTO — la regla de B2, en Node y con control positivo.
 *
 * `y - grupo.fin <= 2 * paso` funde. La ventana de fusión es por eso `2 · paso`
 * en píxeles, y **eso importa cuando se comparan dos viewports distintos**: con
 * el paso clavado en píxeles, la ventana de fusión vale una fracción distinta de
 * pantalla en cada perfil. Quien compare perfiles tiene que decir con qué paso
 * midió cada uno.
 */
export function agrupar(lectura: LecturaDelCenso): Censo {
  const { paso, ventana } = lectura
  if (paso <= 0) throw new Error('paso inválido')
  if (ventana <= 0) throw new Error('ventana inválida: la pestaña no estaba visible')

  const ordenados = [...lectura.aterrizajes].sort((a, b) => a[0] - b[0])
  const grupos: Grupo[] = []
  for (const [y, piezas] of ordenados) {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo !== undefined && y - ultimo.fin <= 2 * paso) {
      grupos[grupos.length - 1] = { ini: ultimo.ini, fin: y, piezas: ultimo.piezas + piezas }
    } else {
      grupos.push({ ini: y, fin: y, piezas })
    }
  }

  const huecosPx: number[] = []
  for (let i = 1; i < grupos.length; i += 1) huecosPx.push(grupos[i].ini - grupos[i - 1].fin)
  const huecosPantallas = huecosPx.map((h) => Math.round((100 * h) / ventana) / 100)

  return {
    acontecimientos: grupos.length,
    grupos,
    huecosPx,
    huecosPantallas,
    huecoMaximoPantallas: huecosPantallas.length === 0 ? null : Math.max(...huecosPantallas),
    huecoMedioPantallas:
      huecosPantallas.length === 0
        ? null
        : Math.round((100 * huecosPantallas.reduce((a, b) => a + b, 0)) / huecosPantallas.length) / 100,
    piezasTotales: grupos.reduce((a, g) => a + g.piezas, 0),
  }
}

/**
 * LA MITAD QUE CORRE ADENTRO DE LA PÁGINA, como fuente para `evaluate_script`.
 *
 * Se devuelve como texto porque el frente la pega en la llamada del navegador y
 * no la importa: adentro de la página no hay módulos de este repo. Que la
 * genere una función y no esté escrita a mano en tres lugares es todo el punto.
 *
 * `esperas` es el asentamiento de §0: una animación atada al scroll con inercia
 * sigue moviéndose después de que el scroll paró, así que en cada parada se
 * espera a que las firmas dejen de cambiar. Con `esperas` en 0 la parada lee de
 * una y el instrumento mide la página en movimiento — que es una medición
 * distinta y peor.
 */
export function fuenteDelCenso(opciones: {
  readonly desde: number
  readonly hasta: number
  readonly paso: number
  readonly esperas?: number
  readonly msPorEspera?: number
}): string {
  const { desde, hasta, paso } = opciones
  const esperas = opciones.esperas ?? 8
  const ms = opciones.msPorEspera ?? 140
  return `async () => {
  const DESDE = ${desde}, HASTA = ${hasta}, PASO = ${paso}, ESPERAS = ${esperas}, MS = ${ms}
  const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const dormir = (t) => new Promise((r) => setTimeout(r, t))
  const ruta = (el) => {
    const p = []
    let n = el
    while (n !== null && n.parentElement !== null) {
      p.push(n.tagName.toLowerCase() + ':' + [...n.parentElement.children].indexOf(n))
      n = n.parentElement
    }
    return p.reverse().join('/')
  }
  const leer = () => {
    const f = {}
    for (const el of document.querySelectorAll('*')) {
      const s = el.getAttribute('style')
      if (s !== null && s.length > 0) f[ruta(el)] = s
    }
    return f
  }
  const iguales = (a, b) => {
    const ka = Object.keys(a), kb = Object.keys(b)
    if (ka.length !== kb.length) return false
    for (const k of ka) if (a[k] !== b[k]) return false
    return true
  }
  const M = [], estiloPorParada = []
  for (let y = DESDE; y <= HASTA; y += PASO) {
    window.scrollTo(0, y)
    await raf2()
    let f = leer()
    for (let i = 0; i < ESPERAS; i += 1) {
      await dormir(MS)
      const g = leer()
      if (iguales(f, g)) break
      f = g
    }
    M.push({ y: window.scrollY, f })
    estiloPorParada.push(Object.keys(f).length)
  }
  const reales = new Map(), montajes = []
  for (let k = 1; k < M.length; k += 1) {
    const a = M[k - 1].f, b = M[k].f
    let alta = 0, baja = 0
    for (const c of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const ea = a[c] !== undefined, eb = b[c] !== undefined
      if (ea && eb) {
        if (a[c] !== b[c]) {
          if (!reales.has(c)) reales.set(c, [])
          reales.get(c).push(M[k].y)
        }
      } else if (eb) alta += 1
      else baja += 1
    }
    if (alta + baja > 0) montajes.push({ y: M[k].y, alta, baja })
  }
  const hist = {}
  for (const ys of reales.values()) {
    const h = ys[ys.length - 1]
    hist[h] = (hist[h] ?? 0) + 1
  }
  return {
    aterrizajes: Object.keys(hist).map(Number).sort((p, q) => p - q).map((y) => [y, hist[y]]),
    montajes,
    ventana: window.innerHeight,
    paso: PASO,
    desde: DESDE,
    hasta: HASTA,
    estiloPorParada,
    visibilityState: document.visibilityState,
    innerWidth: window.innerWidth,
  }
}`
}

/**
 * La vara de B2, repetida acá para que un frente no la escriba a mano: **ningún
 * hueco por encima de 1,56 pantallas** (el máximo de la referencia a 1440), con
 * la banda a la que se apunta entre 0,67 y 1,11.
 */
export const HUECO_MAXIMO_DE_LA_REFERENCIA_PANTALLAS = 1.56
