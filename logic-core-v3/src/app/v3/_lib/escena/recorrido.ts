/**
 * EL MAPEO DEL RECORRIDO CONTRA LAS CATORCE PANTALLAS REALES — **por anclaje**.
 *
 * ⚠ **LA DECISIÓN NO VIVE ACÁ, Y NO SE REPITE.** Qué tramo corre sobre qué
 * secciones, por qué se eligió la lectura *«el tramo OCUPA la sección»* y no
 * *«la pose se alcanza cuando la sección empieza»*, qué keyframe cambia de dueño
 * y por qué se interpola con una recta y no con una curva está escrito —con las
 * cuatro cosas medidas que lo fuerzan— en `anclaje.ts`. Este módulo **implementa
 * ese contrato**. Si alguien quiere discutir el anclaje, el archivo es el otro.
 *
 * ── QUÉ REEMPLAZA, Y POR QUÉ EL REEMPLAZO NO ES UNA PREFERENCIA ────────────
 *
 * Hasta SITIO-S8 acá había una recta única sobre el documento entero —`progreso
 * = scrollY / (alto − ventana)`— declarada PROVISIONAL en su propio docblock, y
 * no estaba mal: era **lo más conservador que se podía defender** mientras §7.2
 * de `DIRECCION-ESCENA.md` siguiera sin decidir. §7.2 se decidió, y con eso la
 * recta única dejó de ser la opción que no toma decisiones y pasó a ser una
 * decisión de composición equivocada — repartía el recorrido a ritmo constante
 * sobre catorce pantallas que **no pesan lo mismo**, y las tres desalineaciones
 * que §7.2 midió eran su consecuencia directa.
 *
 * ── LA FORMA: UNA RECTA POR TRAMOS SOBRE `ANCLAJE.nudos` ──────────────────
 *
 *     pantalla = pantallaDeScroll(scrollY, alto, ventana)      ← `anclaje.ts`
 *     progreso = recta por tramos sobre los nudos              ← acá
 *
 * La primera mitad **es del contrato y no de este módulo**, y ésa es la parte
 * que importa: `pantallaDeScroll` es la coordenada que comparten el mapeo y la
 * visibilidad. Si cada frente tradujera el scroll por su cuenta, la escena se
 * podría encender en una pantalla y posarse en otra sin que ningún invariante de
 * ninguno de los dos lo viera.
 *
 * ── POR QUÉ YA NO HAY UN «ESTIRAMIENTO» ───────────────────────────────────
 *
 * `ESTIRAMIENTO_DE_DOCUMENTO` (×1,750) y `ESTIRAMIENTO_DE_SCROLL` (×1,625)
 * medían **una** cosa: cuánto se estiraba la recta única. Con el anclaje no hay
 * una recta sino seis, y ninguna cifra sola las describe —publicar un promedio
 * sería esconder exactamente lo que el anclaje decidió—. Lo que las reemplaza es
 * `RITMO_POR_SEGMENTO`: el ritmo real de cada segmento, en progreso por pantalla
 * de scroll y como múltiplo del ritmo compuesto (`RITMO_COMPUESTO`, que es
 * `1 / CHOREO_SCREENS` y sale de la coreografía).
 *
 * ── LOS NUDOS SE DEVUELVEN LITERALES, Y NO ES UNA MICRO-OPTIMIZACIÓN ──────
 *
 * En el borde de un segmento las dos funciones cortocircuitan y devuelven el
 * valor del nudo tal cual, sin interpolar. Es lo que hace que
 * `progresoDePantalla(nudo.pantalla) === nudo.progreso` sea una igualdad
 * **exacta** y no una a menos de épsilon; con eso, «la sección llena el cuadro
 * en el progreso de su ancla» se puede afirmar con `===`, que es como este repo
 * distingue una propiedad de una casualidad de redondeo.
 */

import { CHOREO_SCREENS, CHOREO_TRAMOS } from './choreography'
import { ANCLAJE, pantallaDeScroll, type Nudo } from './anclaje'

export { pantallasDe } from './anclaje'

/** Las catorce y las trece. Salen del anclaje: acá no se suma nada. */
export const PANTALLAS_DEL_DOCUMENTO = ANCLAJE.pantallasDelDocumento
export const PANTALLAS_DE_SCROLL = ANCLAJE.pantallasDeScroll

/**
 * El ritmo al que la coreografía fue COMPUESTA: un octavo de progreso por
 * pantalla, porque sus seis tramos reparten [0, 1] sobre `CHOREO_SCREENS`.
 * Es la vara contra la que se lee cada segmento real.
 */
export const RITMO_COMPUESTO = 1 / CHOREO_SCREENS

// ── La aritmética, pura de sus argumentos ───────────────────────────────────

/**
 * Los nudos tienen que crecer en los DOS ejes. Tira —no devuelve un mapeo
 * degradado— porque un nudo fuera de orden no produce un recorrido raro sino un
 * progreso que retrocede, y un progreso que retrocede hace que la cámara
 * deshaga el recorrido en mitad de una sección sin que nada lo reporte.
 *
 * Está separada de `derivarAnclaje` a propósito: aquélla valida **la derivación**
 * y ésta valida **lo que se le pasa a la interpolación**, que puede ser
 * cualquier lista de nudos. Es lo que permite que un invariante corra estas dos
 * funciones contra un mapeo deliberadamente roto.
 */
function exigirOrden(nudos: readonly Nudo[]): void {
  if (nudos.length < 2) throw new Error('recorrido: una recta por tramos necesita dos nudos o más.')
  for (let i = 1; i < nudos.length; i += 1) {
    const a = nudos[i - 1]
    const b = nudos[i]
    if (!(b.pantalla > a.pantalla) || !(b.progreso > a.progreso)) {
      throw new Error(
        `recorrido: el nudo ${i} no avanza — pantalla ${a.pantalla}→${b.pantalla}, progreso ${a.progreso}→${b.progreso}.`,
      )
    }
  }
}

/** Progreso en una pantalla de scroll, sobre una lista de nudos cualquiera. */
export function progresoEnNudos(nudos: readonly Nudo[], pantalla: number): number {
  exigirOrden(nudos)
  const primero = nudos[0]
  const ultimo = nudos[nudos.length - 1]
  if (pantalla <= primero.pantalla) return primero.progreso
  if (pantalla >= ultimo.pantalla) return ultimo.progreso
  for (let i = 1; i < nudos.length; i += 1) {
    const a = nudos[i - 1]
    const b = nudos[i]
    if (pantalla === b.pantalla) return b.progreso
    if (pantalla < b.pantalla) {
      const t = (pantalla - a.pantalla) / (b.pantalla - a.pantalla)
      return a.progreso + t * (b.progreso - a.progreso)
    }
  }
  return ultimo.progreso
}

/** La inversa exacta de la anterior, sobre los mismos nudos. */
export function pantallaEnNudos(nudos: readonly Nudo[], progreso: number): number {
  exigirOrden(nudos)
  const primero = nudos[0]
  const ultimo = nudos[nudos.length - 1]
  if (progreso <= primero.progreso) return primero.pantalla
  if (progreso >= ultimo.progreso) return ultimo.pantalla
  for (let i = 1; i < nudos.length; i += 1) {
    const a = nudos[i - 1]
    const b = nudos[i]
    if (progreso === b.progreso) return b.pantalla
    if (progreso < b.progreso) {
      const t = (progreso - a.progreso) / (b.progreso - a.progreso)
      return a.pantalla + t * (b.pantalla - a.pantalla)
    }
  }
  return ultimo.pantalla
}

/** El progreso del recorrido en una pantalla de scroll del home. */
export function progresoDePantalla(pantalla: number): number {
  return progresoEnNudos(ANCLAJE.nudos, pantalla)
}

/** La pantalla de scroll en la que el recorrido llega a un progreso. */
export function pantallaDeProgreso(progreso: number): number {
  return pantallaEnNudos(ANCLAJE.nudos, progreso)
}

// ── El ritmo, segmento por segmento ─────────────────────────────────────────

export type RitmoDeSegmento = {
  /** El tramo de la coreografía que cierra en este segmento. */
  readonly tramo: string
  readonly desdePantalla: number
  readonly hastaPantalla: number
  /** Pantallas de scroll que dura. */
  readonly pantallas: number
  /** Progreso que cubre. */
  readonly progreso: number
  /** Progreso por pantalla de scroll: el ritmo real. */
  readonly porPantalla: number
  /** Ese ritmo como múltiplo del compuesto. 1 = corre a la velocidad escrita. */
  readonly multiploDelCompuesto: number
}

/**
 * Los seis segmentos entre nudos, con su ritmo. Reemplaza a las dos cifras de
 * estiramiento del provisional — ver la cabecera.
 *
 * El nombre del tramo sale de `CHOREO_TRAMOS` y no del `porQue` del nudo: la
 * derivación ya garantizó que hay un nudo por tramo, en el mismo orden, y leer
 * el nombre de una cadena de prosa sería inventar un acoplamiento frágil.
 */
export const RITMO_POR_SEGMENTO: readonly RitmoDeSegmento[] = ANCLAJE.nudos
  .slice(1)
  .map((b, i): RitmoDeSegmento => {
    const a = ANCLAJE.nudos[i]
    const pantallas = b.pantalla - a.pantalla
    const progreso = b.progreso - a.progreso
    const porPantalla = progreso / pantallas
    return {
      tramo: CHOREO_TRAMOS[i].name,
      desdePantalla: a.pantalla,
      hastaPantalla: b.pantalla,
      pantallas,
      progreso,
      porPantalla,
      multiploDelCompuesto: porPantalla / RITMO_COMPUESTO,
    }
  })

// ── La tabla de las ocho ────────────────────────────────────────────────────

/** Lo que le toca a una sección del recorrido, con el mapeo del anclaje. */
export type TramoDeSeccion = {
  readonly id: string
  /** Pantallas de scroll acumuladas antes de esta sección. */
  readonly desdePantalla: number
  readonly altoEnPantallas: number
  /** Progreso en el que el borde de arriba de la sección toca el de la ventana. */
  readonly llenaDesde: number
  /** Progreso en el que el borde de abajo lo toca. Con altos de 1 pantalla, igual al anterior. */
  readonly llenaHasta: number
  /** Progreso en el que la sección **empieza a verse** (entra por abajo). */
  readonly seVeDesde: number
  /** Progreso en el que **deja de verse** (sale por arriba). */
  readonly seVeHasta: number
  /** Si esta sección deja ver la escena. Sale de la tabla de superficies. */
  readonly dejaVerLaEscena: boolean
}

/**
 * La tabla, derivada. Ocho filas, una por sección, en el orden del recorrido.
 *
 * ⚠ **Se llamaba `MAPEO_PROVISIONAL` y dejó de serlo en SITIO-S9.** El nombre
 * no es cosmético: mientras §7.2 estaba abierta, el nombre era la advertencia de
 * que estos números no se podían citar como decididos. Ahora se pueden, y el
 * nombre lo tiene que decir — un `PROVISIONAL` que sobrevive a su decisión es
 * peor que ninguna marca, porque enseña a ignorar las que quedan.
 *
 * `llena` es el intervalo en el que la sección ocupa la ventana entera —su borde
 * de arriba ya pasó y el de abajo todavía no—; `seVe` es el intervalo en el que
 * aparece en pantalla aunque sea parcialmente. Los dos hacen falta: el primero
 * dice qué pose le toca a la sección, el segundo sobre qué rango de la escena
 * tiene que ser legible su texto. La geometría entera —altos, acumulados y qué
 * superficie deja ver el canvas— viene de `ANCLAJE.geometria`.
 */
export const MAPEO_DE_LAS_SECCIONES: readonly TramoDeSeccion[] = ANCLAJE.geometria.map(
  (g): TramoDeSeccion => ({
    id: g.id,
    desdePantalla: g.desdePantalla,
    altoEnPantallas: g.altoEnPantallas,
    llenaDesde: progresoDePantalla(g.desdePantalla),
    llenaHasta: progresoDePantalla(g.hastaPantalla - 1),
    seVeDesde: progresoDePantalla(g.desdePantalla - 1),
    seVeHasta: progresoDePantalla(g.hastaPantalla),
    dejaVerLaEscena: g.dejaVerLaEscena,
  }),
)

/**
 * Qué tramo de la coreografía le toca a un progreso. `'ninguno'` si ninguno.
 *
 * ⚠ **En un borde devuelve el tramo que TERMINA, no el que empieza**, porque
 * los `[from, to]` de `CHOREO_TRAMOS` son cerrados y `find` corta en el primero.
 * Con el anclaje eso deja de ser un detalle: cada sección llena el cuadro
 * exactamente sobre un nudo, o sea exactamente sobre un borde. Para leer a qué
 * tramo pertenece una sección **no se usa esta función** sino `TRAMOS_ANCLADOS`,
 * que es la declaración; ésta sirve para ubicar un progreso cualquiera.
 */
export function tramoEn(progreso: number): string {
  const tramo = CHOREO_TRAMOS.find((t) => progreso >= t.from && progreso <= t.to)
  return tramo?.name ?? 'ninguno'
}

/**
 * El progreso del recorrido a partir del scroll de la página.
 *
 * ⚠ **Los tres argumentos entran; no se leen de `window` acá.** Es lo que
 * permite que el invariante corra la MISMA función sin DOM, y es además la mitad
 * de la lección de `CLAUDE.md` sobre medir scroll con la pestaña oculta: quien
 * llama es el que tiene que decidir si sus números valen.
 *
 * Con un documento que no scrollea —o con la pestaña oculta, donde el alto da
 * cero— `pantallaDeScroll` devuelve 0 y esto devuelve el progreso del primer
 * nudo, que es la pose del hero: el lado seguro.
 */
export function progresoDelScroll(
  scrollY: number,
  altoDelDocumento: number,
  altoDeLaVentana: number,
): number {
  return progresoDePantalla(pantallaDeScroll(scrollY, altoDelDocumento, altoDeLaVentana))
}
