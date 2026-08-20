import {
  AERIAL_BEAM_COLOR,
  AERIAL_COLOR,
  FLOOR_Y,
  PILLAR_COLOR,
  PLANE_DARK_COLOR,
  PLANE_PALE_COLOR,
  type BarPlacement,
} from './probeScene'

/**
 * EL ESPACIO ARQUITECTÓNICO (S5) — planos, estructura y pilares.
 *
 * La maqueta a escala real de algo que todavía no se terminó de construir. El
 * logo es la única pieza terminada; todo lo de este archivo es lo que está
 * alrededor mientras se construye: planos suspendidos en el aire, una retícula
 * cruzando por arriba, y unos pocos verticales lejanos que dan la escala.
 *
 * **Reemplaza a los softboxes de S4.** Lo que se conserva es la idea del panel
 * suspendido: masa de tamaño conocido a media distancia, que al orbitar genera
 * paralaje y **tapa cosas** —un ocultamiento es la señal de profundidad más
 * fuerte que existe—. Lo que se va es el estudio de fotos: un softbox tiene
 * marco, tela y una función. Un plano no explica nada, solo ocupa espacio con
 * intención.
 *
 * ── Lo que esta escena NO es ───────────────────────────────────────────────
 *
 * No hay un solo objeto reconocible. Nada de iconografía de tecnología —ni
 * nodos, ni circuitos, ni pantallas, ni engranajes—, que es el imaginario por
 * default de "tecnología" y exactamente lo que este proyecto evita. Nada
 * orgánico tampoco. Geometría, y nada más que geometría.
 *
 * ── La regla de composición que ordena todo ────────────────────────────────
 *
 * **La cuña de adelante queda libre.** Ningún plano vive en |azimut| ≤ 40°,
 * porque ahí es donde se para la cámara durante más de medio recorrido (hero,
 * quiénes somos, números y cierre están todos en azimut 0) y en dos de esos
 * momentos se aleja a 22,3 y a 30 — o sea que un plano a radio 12 en esa
 * dirección se le metería ENTRE la cámara y el logo justo en las poses que más
 * importan.
 *
 * El corolario es lo que hace que la escena funcione: **el fondo de una pose es
 * el azimut opuesto al de su cámara.** Desde el hero, en 0, lo que se ve detrás
 * del logo es lo que está en 180 — y ahí es donde van los planos oscuros
 * grandes. La masa negra del hero y la cuña libre son la misma decisión.
 *
 * El único momento cuyo fondo cae dentro de la cuña libre es el giro de Demos
 * mirando hacia arriba, y ese fondo no es una pared: es el techo. De eso se
 * ocupa la retícula.
 *
 * ── Radios ─────────────────────────────────────────────────────────────────
 *
 * Todos los planos van a radio ≥ 11,8. Fuera del eje, la cámara del recorrido
 * nunca pasa de 7,7, así que no puede atravesar ninguno. En modo manual sí
 * puede: el slider de distancia llega a 30 en cualquier ángulo y ahí la cámara
 * atraviesa la escena. Es propiedad del instrumento, no un defecto — los
 * softboxes de S4 tenían lo mismo a radio 10,4.
 */

const RAD = Math.PI / 180

// ── Los planos suspendidos ──────────────────────────────────────────────────

/**
 * Espesor de un plano. Es una losa, no una lámina: un plano sin canto
 * desaparece cuando la órbita lo cruza de perfil, y con una órbita de 360° eso
 * pasa con todos.
 */
export const PLANE_THICKNESS = 0.09

export type PlanePlacement = {
  readonly azimuthDeg: number
  readonly radius: number
  readonly y: number
  readonly width: number
  readonly height: number
  /** Positivo = el plano se acuesta mirando hacia abajo. 90 sería horizontal. */
  readonly tiltDeg: number
  /** Giro sobre su propio vertical, respecto de quedar encarado al centro. */
  readonly yawDeg: number
  readonly tone: 'dark' | 'pale'
}

/**
 * Once planos. La proporción es de seis a siete oscuros contra cuatro claros, y
 * los oscuros son además los grandes: el sprint pide masa negra real y la masa
 * es área, no cantidad.
 *
 * Ninguno toca el piso — están **suspendidos**, que es la palabra del sprint. El
 * más bajo tiene su borde inferior a casi un metro de mundo del papel.
 */
export const SUSPENDED_PLANES: readonly PlanePlacement[] = [
  // ── El fondo del hero: la masa oscura principal ───────────────────────────
  // Los tres viven en el azimut opuesto a la cámara del primer medio recorrido,
  // así que son lo que se ve DETRÁS del logo durante hero, quiénes somos,
  // números y cierre. Es el elemento que más cambia la escena.
  { azimuthDeg: 152, radius: 17.5, y: 4.2, width: 15, height: 11.5, tiltDeg: -4, yawDeg: 14, tone: 'dark' },
  { azimuthDeg: 187, radius: 20.5, y: 6, width: 21, height: 14, tiltDeg: -2, yawDeg: -8, tone: 'dark' },
  { azimuthDeg: 214, radius: 15.5, y: 1.6, width: 12, height: 9, tiltDeg: 5, yawDeg: 22, tone: 'pale' },

  // ── El costado del giro ──────────────────────────────────────────────────
  // Los cuatro keyframes de Demos barren de 113° a 302°, así que su fondo barre
  // de 293° a 122°. Estos cubren la mitad de ese barrido; los tres de abajo, la
  // otra mitad.
  { azimuthDeg: 238, radius: 13.2, y: 3.4, width: 10, height: 12.5, tiltDeg: 3, yawDeg: -18, tone: 'dark' },
  { azimuthDeg: 266, radius: 18, y: 7.4, width: 14, height: 8, tiltDeg: 12, yawDeg: 9, tone: 'pale' },
  { azimuthDeg: 292, radius: 12.4, y: 0.3, width: 8.5, height: 7.5, tiltDeg: -8, yawDeg: 26, tone: 'dark' },
  { azimuthDeg: 314, radius: 22, y: 5.2, width: 16, height: 10, tiltDeg: 2, yawDeg: -12, tone: 'pale' },

  // ── El costado de portfolio ──────────────────────────────────────────────
  { azimuthDeg: 60, radius: 14.6, y: 2.8, width: 11, height: 10, tiltDeg: -3, yawDeg: 16, tone: 'dark' },
  { azimuthDeg: 88, radius: 19.5, y: 8.6, width: 13, height: 9.5, tiltDeg: 9, yawDeg: -20, tone: 'pale' },
  { azimuthDeg: 118, radius: 11.8, y: 1, width: 7.5, height: 8.5, tiltDeg: -6, yawDeg: 30, tone: 'dark' },

  // ── La losa alta ─────────────────────────────────────────────────────────
  // Casi horizontal, mirando hacia abajo. Es el único plano que se lee como
  // "entrepiso" en vez de "pared", y es lo que impide que todo lo suspendido
  // sea vertical: sin él, la escena tiene paredes y techo, y nada en el medio.
  { azimuthDeg: 250, radius: 13.5, y: 12.5, width: 13, height: 10, tiltDeg: 74, yawDeg: 8, tone: 'dark' },
]

export const PLANE_PLACEMENTS: readonly BarPlacement[] = SUSPENDED_PLANES.map((plane) => {
  const azimuth = plane.azimuthDeg * RAD

  return {
    position: [Math.sin(azimuth) * plane.radius, plane.y, Math.cos(azimuth) * plane.radius],
    scale: [plane.width, plane.height, PLANE_THICKNESS],
    // El azimut arma el marco y la inclinación pasa adentro de ese marco — de
    // eso se encarga el orden YXZ de `InstancedBars`.
    rotation: [plane.tiltDeg * RAD, azimuth + plane.yawDeg * RAD, 0],
    color: plane.tone === 'dark' ? PLANE_DARK_COLOR : PLANE_PALE_COLOR,
  }
})

// ── La retícula aérea ───────────────────────────────────────────────────────

/**
 * Altura de la trama fina. Sale de una cuenta, no de un ojo: el peor caso del
 * recorrido es el keyframe "demos · giro ¾" —cámara a altura −3,50, distancia
 * 6,3, mirando hacia arriba 29°— y con medio campo vertical de 17,5° el cuadro
 * ahí abarca elevaciones de 11,5° a 46,5°. Una retícula a esta altura y con este
 * alcance ocupa la franja de 32° a 46,5°, o sea el tercio superior del cuadro.
 *
 * Más abajo entraría en cuadro durante el hero, que mira desde arriba y no tiene
 * por qué ver el techo. Más arriba se iría del cuadro justo cuando se la mira.
 */
export const AERIAL_Y = 15.5
/** Semi-alcance de la trama. Con menos, se corta antes de llegar al borde del cuadro. */
export const AERIAL_SPAN = 30
export const AERIAL_STEP = 10
/**
 * Lado de la sección. **No es fino porque sí**: una barra oscura que a la
 * distancia mide menos de un píxel titila con el movimiento de la cámara, y
 * arreglar eso después cuesta mucho más que elegir bien el grosor ahora. Con
 * 0,18 a quince unidades de distancia, la barra ocupa del orden de quince
 * píxeles de alto — lejos del régimen donde el aliasing manda.
 */
export const AERIAL_THICKNESS = 0.18
/** Las vigas de la capa alta: más gruesas y más oscuras, se leen detrás. */
export const AERIAL_BEAM_Y = 19.6
export const AERIAL_BEAM_THICKNESS = 0.3
export const AERIAL_BEAM_OFFSETS: readonly number[] = [-12, 0, 12]

/**
 * La retícula: una trama en cruz y tres vigas por encima.
 *
 * **Las dos direcciones no son coplanares**: las que corren en Z se apoyan
 * exactamente sobre las que corren en X, tocándose sin solaparse. Dos familias
 * de cajas cruzadas a la misma altura comparten la cara superior en cada
 * intersección, y ahí el z-buffer titila. Apiladas se lee como lo que un techo
 * de estructura es —vigas y correas—, que es mejor que la alternativa y además
 * gratis.
 */
export const AERIAL_PLACEMENTS: readonly BarPlacement[] = (() => {
  const bars: BarPlacement[] = []
  const length = AERIAL_SPAN * 2 + 2

  for (let offset = -AERIAL_SPAN; offset <= AERIAL_SPAN; offset += AERIAL_STEP) {
    bars.push({
      position: [0, AERIAL_Y, offset],
      scale: [length, AERIAL_THICKNESS, AERIAL_THICKNESS],
      color: AERIAL_COLOR,
    })
    bars.push({
      position: [offset, AERIAL_Y + AERIAL_THICKNESS, 0],
      scale: [AERIAL_THICKNESS, AERIAL_THICKNESS, length],
      color: AERIAL_COLOR,
    })
  }

  for (const offset of AERIAL_BEAM_OFFSETS) {
    bars.push({
      position: [0, AERIAL_BEAM_Y, offset],
      scale: [length + 4, AERIAL_BEAM_THICKNESS, AERIAL_BEAM_THICKNESS],
      color: AERIAL_BEAM_COLOR,
    })
  }

  return bars
})()

// ── Los pilares ─────────────────────────────────────────────────────────────

/** Dónde termina el pilar. Se va del cuadro antes de terminar: por eso "se pierde". */
export const PILLAR_TOP = 34
export const PILLAR_SIDE = 0.42

/**
 * Tres verticales lejanos, muy tenues.
 *
 * Son lo único de la escena que va **del piso hasta salirse del cuadro**, y esa
 * continuidad es la que ancla la profundidad: un objeto que toca el suelo a
 * veinticinco unidades y sigue hacia arriba le da al ojo una regla para medir
 * todo lo demás. Están fuera de la cuña de adelante, igual que los planos, y
 * dentro del radio de la losa (34), así que apoyan en el piso y no en el aire.
 *
 * Tenues a propósito: si tuvieran peso serían tres columnas, y tres columnas son
 * un edificio. Acá son la insinuación de uno.
 */
export const PILLARS: readonly { readonly azimuthDeg: number; readonly radius: number }[] = [
  { azimuthDeg: 165, radius: 27 },
  { azimuthDeg: 202, radius: 30 },
  { azimuthDeg: 68, radius: 25.5 },
]

export const PILLAR_PLACEMENTS: readonly BarPlacement[] = PILLARS.map((pillar) => {
  const azimuth = pillar.azimuthDeg * RAD
  const height = PILLAR_TOP - FLOOR_Y

  return {
    position: [
      Math.sin(azimuth) * pillar.radius,
      FLOOR_Y + height / 2,
      Math.cos(azimuth) * pillar.radius,
    ],
    scale: [PILLAR_SIDE, height, PILLAR_SIDE],
    rotation: [0, azimuth, 0],
    color: PILLAR_COLOR,
  }
})
