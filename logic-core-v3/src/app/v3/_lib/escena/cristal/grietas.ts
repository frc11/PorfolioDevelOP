import type { IdDePagina } from '../ruta/preset'

/**
 * [NOCTURNO B9] EL CRISTAL QUE SE AGRIETA, LO PURO (`docs/rediseno/SPRINT-B9-NOCTURNO.md`). La firma del sitio: se forma a la vista
 * (~1,5 s), queda oscuro (~1 s) y en las páginas de servicio se ilumina con una luz fina del acento. Al pasar el punto hacia arriba se
 * cierra en reversa, también a la vista. Se dibuja en el material del cristal (`grietasDelVidrio.ts`); el cuadro, en `grietasEnVivo.ts`.
 *
 * [C2-31g] CADA CELDA SE AGRIETA POR DENTRO (`docs/rediseno/SPRINT-C2-31-grietas.md`; la referencia: el vidrio aristado). Ya no hay una
 * grieta general que cruza el muro (las variantes 1, 2 y 3 de B9 se borraron con su trazado): cada celda tiene su telaraña, con su centro
 * (el de su abanico), sus rayos hasta el borde y sus anillos concéntricos (con la forma de la celda), todas a la vez y al mismo ritmo.
 * `?grietas=centro` (por defecto) la forma de adentro hacia los bordes de cada celda; `?grietas=borde`, de los bordes hacia el centro. Sin
 * brillo en el home: la luz con el acento queda para las páginas de servicio.
 *
 * Sin `three` ni nada del lienzo: lo importa el título de una página (`TituloDePagina.tsx`), que viaja con la página.
 */
export const GRIETAS = {
  /**
   * Los tiempos (s): se forman, quedan oscuras, se encienden; al volver, se apagan y se cierran (la formación al revés). Un cuadro largo
   * (la escena dormida, la pestaña oculta) avanza a lo sumo `pasoMaximoS`.
   */
  tiempos: { formarseS: 1.5, oscurasS: 1, encenderseS: 0.7, apagarseS: 0.5, cerrarseS: 1.5, pasoMaximoS: 0.1 },
  /** [C2-31g] `?grietas=centro|borde`: de dónde arranca la telaraña de cada celda (el centro, por defecto, o el borde). */
  origenes: ['centro', 'borde'],
  porDefecto: 'centro',
  /**
   * [C2-31g] LA TELARAÑA DE CADA CELDA (en el sombreador): de 7 a 11 rayos desde su centro (cuántos y su giro vienen con la celda, `muro.ts`),
   * corridos hasta `desorden` de su sector, con un zigzag (u, a `zigzagPorU`) que nace en el centro; `cortos` de ellos no llegan al borde
   * (paran entre esas partes del camino). Los anillos, a esas partes del camino del centro al borde (la forma de la celda, a escala), cada
   * tramo entre dos rayos corrido hasta `corre` y alguno falta; cada tramo se cierra desde los dos rayos hacia el medio en `barre` de la
   * formación después de que pasó el frente.
   */
  telarana: { rayos: [7, 11], desorden: 0.35, zigzag: 0.06, zigzagPorU: 2.3, cortos: 0.25, corto: [0.45, 0.9], anillos: [0.08, 0.23, 0.41, 0.6, 0.8], corre: 0.035, falta: 0.2, barre: 0.12 },
  /** El grosor de cada línea (veces el del rayo). */
  grosor: { rayo: 1, anillo: 0.65 },
  /**
   * El dibujo (px, medio ancho): el núcleo de la luz, la banda oscura y el halo; cuánto oscurece la banda de día y el gris de la grieta
   * oscura de noche (sobre el negro una grieta oscura no se vería); el brillo del núcleo y del halo; la onda de la luz (corre desde donde
   * nace la grieta: el ancho de su frente, en partes de la formación). [C2-31g intento 2] Sin la faceta (el costo: cada trozo con su azar).
   */
  dibujo: { nucleoPx: 0.55, bandaPx: 1.25, haloPx: 2.4, oscurece: 0.5, grisDeNoche: 0.13, brillo: 1.35, halo: 0.22, onda: 0.3 },
  /** `?grietas-prueba=si`: un ciclo para verlas solas (s): arranca, encendidas, cerradas. */
  prueba: { arrancaS: 1.5, encendidasS: 3, cerradasS: 2.5 },
  /** [C2-31g] El control del banco `CONTROL=general` (una sola telaraña para todo el muro, centrada donde mira la cámara): su radio (u). */
  general: { radio: 30 },
} as const

export type OrigenDeLasGrietas = 'centro' | 'borde'

/** [C2-31g] El origen de la consulta (`?grietas=`); si no es uno de los dos (también los viejos `1`, `2`, `3` y `no`), el por defecto. */
export function origenDeLasGrietas(valor: string | null): OrigenDeLasGrietas {
  const o = (GRIETAS.origenes as readonly string[]).find((x) => x === valor)
  return (o ?? GRIETAS.porDefecto) as OrigenDeLasGrietas
}

/** [C2-31g] Si se iluminan: sólo en una página con acento (las de servicio); en el home, nunca. */
export function brillanLasGrietas(donde: IdDePagina, acento: string | null): boolean {
  return donde !== 'home' && acento !== null
}

export type SentidoDeLasGrietas = 'avance' | 'reversa'

/**
 * EL DISPARADOR — una señal con avance y reversa: quien la pide (el título de una página al terminar de entrar, el enganche del CTA del
 * home) escribe el sentido y la página; el cristal la lee en su cuadro (`vez` cambia con cada pedido). Sin cristal montado, nadie la lee.
 */
export const GRIETAS_EN_VIVO: { sentido: SentidoDeLasGrietas; donde: IdDePagina; vez: number } = { sentido: 'reversa', donde: 'home', vez: 0 }

export function dispararLasGrietas(sentido: SentidoDeLasGrietas, donde: IdDePagina): void {
  GRIETAS_EN_VIVO.sentido = sentido
  GRIETAS_EN_VIVO.donde = donde
  GRIETAS_EN_VIVO.vez += 1
}

/**
 * El enganche del home: [NOCTURNO B3] `ENGANCHE_DE_LAS_GRIETAS.alVolverseElCta` (`resenas/enganches.ts`), llamado al cruzar el cartel de
 * canto (el título que se vuelve el CTA): `ida` (bajando) las forma; `vuelta` (subiendo) las cierra.
 */
export function grietasAlVolverseElCta(sentido: 'ida' | 'vuelta'): void {
  dispararLasGrietas(sentido === 'ida' ? 'avance' : 'reversa', 'home')
}

/** Dónde va cada una: la formación (0 a 1), la espera oscura (0 a 1) y la luz (0 a 1); y para dónde van. */
export interface EstadoDeLasGrietas {
  formacion: number
  espera: number
  luz: number
  sentido: SentidoDeLasGrietas
}

export const grietasCerradas = (): EstadoDeLasGrietas => ({ formacion: 0, espera: 0, luz: 0, sentido: 'reversa' })

/** Lo que se perdona al sumar cuadros (s): sin esto, 90 cuadros de 1/60 dejan la formación a un pelo de 1 y termina un cuadro tarde. */
const EPSILON_S = 1e-9

/** Sube `x` hacia 1 en `s` segundos con lo que queda del paso; devuelve lo que sobra del paso. */
function subir(e: EstadoDeLasGrietas, k: 'formacion' | 'espera' | 'luz', resto: number, s: number): number {
  const falta = (1 - e[k]) * s
  if (resto >= falta - EPSILON_S) {
    e[k] = 1
    return Math.max(0, resto - falta)
  }
  e[k] += resto / s
  return 0
}

function bajar(e: EstadoDeLasGrietas, k: 'formacion' | 'luz', resto: number, s: number): number {
  const falta = e[k] * s
  if (resto >= falta - EPSILON_S) {
    e[k] = 0
    return Math.max(0, resto - falta)
  }
  e[k] -= resto / s
  return 0
}

/**
 * El reloj (en el objeto, sin reservar): AVANCE, se forman, esperan oscuras y se encienden (lo que sobra de un tramo pasa al siguiente);
 * con la luz a medias (un avance en medio de la vuelta) no esperan otra vez. REVERSA, se apagan y recién apagadas se cierran (la espera
 * vuelve a cero: el próximo avance la repite). Con movimiento reducido, de una, sin animación.
 */
export function avanzarLasGrietas(e: EstadoDeLasGrietas, dt: number, reducido: boolean): void {
  const T = GRIETAS.tiempos
  const fin = e.sentido === 'avance' ? 1 : 0
  if (reducido) {
    e.formacion = fin
    e.espera = fin
    e.luz = fin
    return
  }
  let resto = Math.min(T.pasoMaximoS, Math.max(0, dt))
  if (e.sentido === 'avance') {
    if (e.formacion < 1) resto = subir(e, 'formacion', resto, T.formarseS)
    if (e.formacion >= 1 && e.luz <= 0 && e.espera < 1 && resto > 0) resto = subir(e, 'espera', resto, T.oscurasS)
    if (e.formacion >= 1 && (e.espera >= 1 || e.luz > 0) && resto > 0) subir(e, 'luz', resto, T.encenderseS)
    return
  }
  if (e.luz > 0) resto = bajar(e, 'luz', resto, T.apagarseS)
  if (e.luz <= 0) {
    e.espera = 0
    if (resto > 0) bajar(e, 'formacion', resto, T.cerrarseS)
  }
}

export type FaseDeLasGrietas = 'cerradas' | 'formandose' | 'oscuras' | 'encendiendose' | 'encendidas' | 'apagandose' | 'cerrandose'

export function faseDeLasGrietas(e: EstadoDeLasGrietas): FaseDeLasGrietas {
  if (e.sentido === 'avance') {
    if (e.formacion < 1) return 'formandose'
    if (e.luz >= 1) return 'encendidas'
    return e.luz > 0 ? 'encendiendose' : 'oscuras'
  }
  if (e.luz > 0) return 'apagandose'
  return e.formacion > 0 ? 'cerrandose' : 'cerradas'
}

/** La formación que se ve: rápida al quebrarse y más lenta en las puntas (la misma curva al cerrarse, al revés). */
export const formacionVisible = (f: number): number => 1 - (1 - f) * (1 - f)

/** La luz que se ve, suave en los dos extremos. */
export const luzVisible = (l: number): number => l * l * (3 - 2 * l)
