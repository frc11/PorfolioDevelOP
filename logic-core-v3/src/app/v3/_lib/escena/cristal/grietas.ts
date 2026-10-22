import type { IdDePagina } from '../ruta/preset'

/**
 * [NOCTURNO B9] EL CRISTAL QUE SE AGRIETA, LO PURO (`docs/rediseno/SPRINT-B9-NOCTURNO.md`). La firma del sitio: las grietas nacen en
 * varios puntos del muro de cristal y se forman a la vista (~1,5 s), quedan oscuras (~1 s) y después se iluminan con una luz fina (neutra
 * en el home, con el acento en las páginas). Al pasar el punto hacia arriba se cierran en reversa, también a la vista. Se dibujan en el
 * material del cristal (`grietasDelVidrio.ts`), sin partir la geometría; su trazado, en `trazado.ts`; el cuadro, en `grietasEnVivo.ts`.
 *
 * Sin `three` ni nada del lienzo: lo importa el título de una página (`TituloDePagina.tsx`), que viaja con la página.
 */
export const GRIETAS = {
  /**
   * Los tiempos (s): se forman, quedan oscuras, se encienden; al volver, se apagan y se cierran (la formación al revés). Un cuadro largo
   * (la escena dormida, la pestaña oculta) avanza a lo sumo `pasoMaximoS`.
   */
  tiempos: { formarseS: 1.5, oscurasS: 1, encenderseS: 0.7, apagarseS: 0.5, cerrarseS: 1.5, pasoMaximoS: 0.1 },
  /** `?grietas=1|2|3` (telaraña, fractura larga, por las juntas) y `no` (sin dibujarlas: la base del banco). */
  variantes: ['1', '2', '3', 'no'],
  porDefecto: '1',
  /**
   * El tamaño de las formas, en partes de la ventana: su alto o, si es una franja baja (la cámara del home y de las páginas ve sólo el
   * pie del muro, ~55 × 8 u a 1440), esta parte de su ancho.
   */
  tamanoPorElAncho: 0.3,
  /**
   * 1 · TELARAÑA: de 3 a 5 impactos (2 o 3 en el teléfono), separados; de cada uno, rayos en estrella (su largo en partes del tamaño,
   * en pasos que se quiebran apenas), algunos con su rama, y los anillos de la telaraña (a esas partes del largo medio, con algún tramo
   * que falta). Los impactos nacen escalonados (hasta `nacenHasta` de la formación).
   */
  telarana: { impactos: [3, 5], impactosCompacta: [2, 3], rayos: [7, 10], rayosCompacta: [5, 7], largo: [0.16, 0.32], pasos: [4, 6], zigzagGrados: 11, ramas: 0.45, ramaGrados: [20, 40], anillos: [0.28, 0.58], anilloFalta: 0.25, nacenHasta: 0.3, separacion: 0.24 },
  /**
   * 2 · FRACTURA LARGA: pocas líneas (2 o 3; 1 o 2 en el teléfono) que entran por un borde de la ventana y la cruzan hasta el de enfrente,
   * a pasos (u) que se quiebran apenas y vuelven a su rumbo, y se bifurcan (ramas de parte de su largo; alguna con su subrama).
   */
  fractura: { lineas: [2, 3], lineasCompacta: [1, 2], paso: [1.2, 2.2], zigzagGrados: 12, rumbo: 0.3, ramas: [2, 4], ramasCompacta: [1, 2], ramaGrados: [18, 38], ramaLargo: [0.22, 0.5], subrama: 0.35, nacenHasta: 0.25 },
  /**
   * 3 · POR LAS JUNTAS: siguen los bordes de las celdas del cristal (`muro.ts`) y se propagan de celda en celda desde 2 o 3 semillas (1 o
   * 2 en el teléfono): el árbol más corto por las juntas (con su largo un poco al azar, así se ramifica) hasta `alcance` del tamaño, y
   * alguna junta más que cierra una celda.
   */
  juntas: { semillas: [2, 3], semillasCompacta: [1, 2], alcance: 1, alcanceCompacta: 1, azarDelPeso: [0.6, 1.8], cierres: 0.15, nacenHasta: 0.2 },
  /** El grosor de cada tramo (veces el del tronco). */
  grosor: { tronco: 1, rama: 0.7, anillo: 0.6, junta: 0.9 },
  /**
   * El dibujo (px, medio ancho): el núcleo de la luz, la banda oscura y el halo; cuánto oscurece la banda de día y el gris de la grieta
   * oscura de noche (sobre el negro una grieta oscura no se vería); el brillo del núcleo y del halo; la onda de la luz (corre del impacto
   * a las puntas: el ancho de su frente, en partes de la formación) y el margen de la rejilla (u: lo más lejos que pinta una grieta).
   */
  dibujo: { nucleoPx: 0.55, bandaPx: 1.25, haloPx: 2.4, oscurece: 0.5, grisDeNoche: 0.13, brillo: 1.35, halo: 0.22, onda: 0.3, margen: 0.35 },
  /**
   * La rejilla que ve el sombreador (`trazado.ts`): hasta `celdas` celdas casi cuadradas sobre la caja de las grietas (nx × ny según su
   * forma), cada una con la lista de los tramos que pasan cerca, en una textura de `porFila` téxeles de ancho; la tabla de los tramos
   * (ancho × filas téxeles: dos por tramo) y el tope del lazo por celda.
   */
  rejilla: { celdas: 1536, porFila: 64, ancho: 512, filas: 32, lazo: 64 },
  /** La ventana, como mucho (partes de la vuelta del muro). */
  ventanaMaxima: 0.4,
  semilla: 2210,
  /** `?grietas-prueba=si`: un ciclo para verlas solas (s): arranca, encendidas, cerradas. */
  prueba: { arrancaS: 1.5, encendidasS: 3, cerradasS: 2.5 },
} as const

export type VarianteDeLasGrietas = '1' | '2' | '3' | 'no'

/** La variante de la consulta (`?grietas=`); si no es una de las cuatro, la por defecto. */
export function varianteDeLasGrietas(valor: string | null): VarianteDeLasGrietas {
  const v = (GRIETAS.variantes as readonly string[]).find((x) => x === valor)
  return (v ?? GRIETAS.porDefecto) as VarianteDeLasGrietas
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
