/**
 * [B4] LOS TIEMPOS DE UNA TRANSICIÓN — puros. Entre dos estados vecinos la sección corre UNA transición por tiempo (el gatillo), y
 * todo lo que se mueve es función de su avance `g` (de 0 a 1): el panel que entra, el enjambre que viaja, el cambio de capa y los
 * renglones que se levantan. Al subir, `g` vuelve de 1 a 0 por el mismo camino: cada servicio sale por donde entró, los renglones
 * bajan primero, el panel se va y los nanobots vuelven; el cambio de capa ocurre en el mismo `g` (la misma geometría).
 *
 *   0 ────── 0,5                el enjambre viaja de la entrada a web (su traspaso con retraso, resorte y dispersión)
 *    0,05 ──────────── 0,9      [C2-50] entre dos servicios viaja más lento, hecho una NUBE grande y volumétrica (el sombreador)
 *       0,15 ─────── 0,68       el panel entra, con una desaceleración final (en web, más tarde si hace falta: ver `inicioDelPanel`)
 *            0,415 ───── 1      [C2-50] los renglones se levantan en 2D, uno por uno, desde que el panel va por la MITAD (ítem 13)
 *                  0,68 ─ 0,9   [C2-50] el título del servicio se subraya al terminar de llegar: rápido y después desacelera
 */

export const DURACION_DE_LA_TRANSICION_MS = 2200

export const TIEMPOS = {
  enjambre: { desde: 0, hasta: 0.5 },
  nube: { desde: 0.05, hasta: 0.9 },
  subrayado: { duracion: 0.22 },
  panel: { inicio: 0.15, duracion: 0.53 },
  texto: { desde: 0.7, porLinea: 0.045, duracion: 0.2 },
} as const

const acotar = (x: number): number => Math.min(1, Math.max(0, x))

/** La desaceleración final del panel (easeOutCubic) y su inversa. */
export const curvaDelPanel = (t: number): number => 1 - (1 - acotar(t)) ** 3
export const inversaDeLaCurvaDelPanel = (y: number): number => 1 - Math.cbrt(1 - acotar(y))

/** Cuánto entró el panel (0 afuera, 1 cerrado) con la transición en `g`, si arranca en `inicio`. */
export const avanceDelPanel = (g: number, inicio: number = TIEMPOS.panel.inicio): number => curvaDelPanel((g - inicio) / TIEMPOS.panel.duracion)

/** El avance del traspaso del enjambre (0…1, lineal: el resorte lo pone cada nanobot). */
export const avanceDelEnjambre = (g: number): number => acotar((g - TIEMPOS.enjambre.desde) / (TIEMPOS.enjambre.hasta - TIEMPOS.enjambre.desde))

/** El `g` de un avance del enjambre (para pasar el cambio de capa, que se calcula en avance, a la transición). */
export const gDelAvance = (avance: number): number => TIEMPOS.enjambre.desde + acotar(avance) * (TIEMPOS.enjambre.hasta - TIEMPOS.enjambre.desde)

/** La posición que lee el motor del enjambre: el estado de partida más el avance de su traspaso. */
export function posicionDelEnjambre(posicion: number): number {
  const k = Math.min(3, Math.max(0, Math.floor(posicion)))
  if (k >= 3) return 3
  return k + (k === 0 ? avanceDelEnjambre(posicion) : avanceDeLaNube(posicion - k))
}

/** [C2-50] El avance del viaje entre dos servicios: más largo (la nube se ve viajar). */
export const avanceDeLaNube = (g: number): number => acotar((g - TIEMPOS.nube.desde) / (TIEMPOS.nube.hasta - TIEMPOS.nube.desde))

/**
 * Cuánto se levantó el renglón `i` de `n` (0 abajo, 1 en su lugar): con el panel cerrado, uno detrás del otro. El escalonado se
 * aprieta para que el último llegue justo con la transición (en `g` = 1 están todos en su lugar).
 */
export function avanceDelRenglon(g: number, i: number, n: number, desde: number = TIEMPOS.texto.desde): number {
  const d = Math.min(desde, 0.9)
  const duracion = Math.min(TIEMPOS.texto.duracion, 1 - d)
  const paso = n > 1 ? Math.min(TIEMPOS.texto.porLinea, (1 - d - duracion) / (n - 1)) : 0
  const t = acotar((g - d - i * paso) / duracion)
  return 1 - (1 - t) ** 3
}

/**
 * [B4] El arranque del panel de web con el truco de profundidad: en el `g` del cambio de capa, su borde no puede haber alcanzado al
 * enjambre (`borde`, px desde la izquierda; `ancho`, el del escenario). Arranca en lo de siempre o más tarde, lo que haga falta.
 */
export function inicioDelPanel(gDelCambio: number, borde: number, ancho: number): number {
  if (!(ancho > 0)) return TIEMPOS.panel.inicio
  const permitido = acotar(borde / ancho)
  const pedido = Math.max(TIEMPOS.panel.inicio, gDelCambio - TIEMPOS.panel.duracion * inversaDeLaCurvaDelPanel(permitido))
  // El panel cierra adentro de la transición: si no alcanza, cierra justo al final (y el banco lo marca).
  return Math.min(1 - TIEMPOS.panel.duracion, pedido)
}

/** [C2-50] Los renglones arrancan con el panel por la MITAD de su entrada (ítem 13: antes que el resto); si el panel arranca más tarde, ellos también. */
export const desdeDelTexto = (inicio: number): number => inicio + TIEMPOS.panel.duracion / 2

/** [C2-50] Cuánto se subrayó el título (0 → 1): desde que el panel cerró, rápido y después desacelera (easeOutQuart); llega antes del final. */
export function avanceDelSubrayado(g: number, inicio: number = TIEMPOS.panel.inicio): number {
  const desde = Math.min(inicio + TIEMPOS.panel.duracion, 1 - TIEMPOS.subrayado.duracion)
  const t = acotar((g - desde) / TIEMPOS.subrayado.duracion)
  return 1 - (1 - t) ** 4
}

/** La capa del lienzo de los nanobots: detrás del título hasta el cambio (en la transición de la entrada a web), delante desde ahí. */
export function capaDelEnjambre(posicion: number, gDelCambio: number): 'detras' | 'delante' {
  if (posicion <= 0) return 'detras'
  if (posicion >= 1) return 'delante'
  return posicion >= gDelCambio ? 'delante' : 'detras'
}

/** Sin el enjambre medido todavía: un cambio a mitad del viaje y el panel en su tiempo de siempre. */
export const G_DEL_CAMBIO_SIN_MEDIR = 0.3
