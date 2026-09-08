/**
 * B7 · FRENTE B — LO QUE EL BARRIDO TIENE QUE PODER AFIRMAR, Y SUS CONTROLES.
 *
 * Vive aparte de `b-pin.ts` por la regla de las 300 líneas, y el corte es por
 * tema: allá está la corrida —abrir, barrer, imprimir, guardar— y acá está el
 * juicio, que es lo único que puede fallar.
 *
 * ── Las cuatro cosas que se afirman ───────────────────────────────────────
 *
 *   1. **El pin de Servicios anda**, con su rango medido en píxeles y no con un
 *      «se pega»: entra en un `scrollY`, sale en otro, y la resta tiene que dar
 *      lo que declara la tabla del sitio.
 *   2. **Lo que el pin pierde de recorrido es exactamente lo que el hijo
 *      desborda.** Es la mitad que `geometria.ts` dejaba declarada y sin medir:
 *      el rango vale `alto − viewport` *mientras el contenido entre en una
 *      pantalla*, y si no entra, el pin recorre menos de lo que `ANCLA_DEL_PIN`
 *      promete. Por eso se barre también el perfil más apretado de arriba de la
 *      compuerta (1025×768) y no sólo el más holgado — **y ahí el número no es
 *      cero.** La afirmación no es «entra en una pantalla» —eso el código nunca
 *      lo prometió, `min-h-svh` es un piso a propósito— sino la identidad entre
 *      el desborde y la pérdida, que es lo que sí promete.
 *
 *      ⚠️ **Y las dos cantidades se miden POR CAMINOS DISTINTOS, o la identidad
 *      es una tautología.** El desborde sale del alto del hijo leído **en cada
 *      parada del barrido** (`altoPegadoMax`); la pérdida sale del rango
 *      **bisectado con scroll real**. La primera versión de este archivo sacaba
 *      las dos del mismo censo estático y el término se cancelaba: ver el
 *      docblock de la fila, abajo. Con el alto medido durante el pin, el número
 *      de 1025×768 no es 6,55 px sino **30,55 px** — el hijo crece a mitad del
 *      recorrido porque la secuencia cambia de servicio.
 *   3. **El envoltorio inerte es inerte** — en los cuatro perfiles, porque su
 *      cero es de construcción y no de perfil.
 *   4. **El instrumento sabe separar los cuatro casos.** Tres controles del
 *      sitio (un pin que anda, un `<section>` y el padre del pin) y uno
 *      inyectado (un pin roto de verdad). Sin ellos, «todo bien» y «no sé
 *      mirar» son la misma salida.
 *
 * ⚠️ Nada de acá se busca por su nombre cuando se lo puede buscar por lo que ES:
 * el pin, por la clase que el producto exporta; su padre, por ser el padre que
 * el propio censo le adjudicó. Un instrumento que busca por nombre deja de
 * encontrar el día que el nombre cambia — y publica un cero.
 */

import { perfilPorId } from '../scripts-b4/perfiles'
import { CLASE_DEL_STICKY } from '../src/app/v3/_secciones/servicios/geometria'
import { seccionPorId } from '../src/app/v3/_lib/secciones'

import type { BarridoDeCandidato, ClaseDePin } from './b-pin-lectores'
import type { FichaDeSticky } from './lectores-layout'

/** El paso del barrido grueso. 120 px es el de `f0-reproduccion.json`, para poder cruzar. */
export const PASO = 120
/** La precisión de los dos bordes afinados por bisección. */
export const PRECISION = 2

/**
 * Los cuatro perfiles del barrido. `1920` y `1024` son los dos que el frente
 * tiene pedidos —los dos lados de la compuerta—; `1440` y `1025` entran porque
 * la promesa que se está cerrando depende del ALTO del viewport y no del ancho,
 * y 1025×768 es el más bajo de los que montan la secuencia.
 */
export const PERFILES_A_BARRER = ['1920', '1440', '1025', '1024'] as const

/**
 * La huella del pin real, DERIVADA del producto y no escrita.
 *
 * `PanelDeSecuencia` pasa `CLASE_DEL_STICKY` tal cual a `className`, sin `cn()`,
 * así que el atributo del DOM es esa cadena exacta y la huella es su `tagName`
 * más las clases con punto. Si alguien le cambia una clase, este archivo **no
 * encuentra el elemento y falla**, en vez de medir cero y llamarlo defecto —
 * que es exactamente el modo de falla que este frente vino a cerrar.
 */
export const HUELLA_DEL_PIN = `div .${CLASE_DEL_STICKY.trim().split(/\s+/).join('.')}`

export const SECCION_DE_SERVICIOS = seccionPorId('servicios')
export const PASOS = SECCION_DE_SERVICIOS.pasosDeLaSecuencia ?? 0

/** Los controles del SITIO. Ninguno es `sticky`: el censo no los levanta solo. */
export const SELECTOR_DEL_PANEL = 'section[data-panel="servicios"]'
export const SELECTOR_DEL_BLOQUE = '[data-seccion-id="servicios"] > div'
export const SELECTOR_DE_TRABAJOS = '[data-seccion-id="trabajos"][data-pinneado="desde-escritorio"]'
export const CONTROLES = [SELECTOR_DEL_PANEL, SELECTOR_DEL_BLOQUE, SELECTOR_DE_TRABAJOS]

/** El trozo de huella del envoltorio que emite `Seccion.tsx` para esta sección. */
const HUELLA_DEL_ENVOLTORIO = 'data-seccion-id=servicios][data-pinneado=siempre'

export interface Fila {
  readonly huella: string
  readonly clase: ClaseDePin
  readonly porQue: string
  readonly barrido: BarridoDeCandidato
}

export interface Corrida {
  readonly perfil: string
  readonly viewport: string
  readonly altoDelViewport: number
  readonly arribaDeLaCompuerta: boolean
  readonly documento: number
  readonly paradas: number
  readonly filas: readonly Fila[]
  /** El censo del padre, sin traducir, para poder cruzar con `f0-reproduccion.json`. */
  readonly censoDelPadre: readonly FichaDeSticky[]
  readonly desacuerdosConElPadre: readonly string[]
  /** `(pasos − 1) × viewport`: lo que la tabla del sitio dice que el pin debería recorrer. */
  readonly recorridoDerivadoDeLaTabla: number
}

export interface Comprobacion {
  readonly que: string
  readonly ok: boolean
  readonly obtenido: string
}

export function buscar(c: Corrida, trozoDeHuella: string): Fila | undefined {
  return c.filas.find((f) => f.huella.includes(trozoDeHuella))
}

export function arribaDeLaCompuerta(idPerfil: string): boolean {
  return !perfilPorId(idPerfil).debajoDelUmbral
}

export function redondear(n: number): number {
  return Math.round(n * 100) / 100
}

/** El rango MEDIDO de una fila: los dos bordes bisectados. `-1` si no se pegó. */
export function rangoDe(f: Fila): number {
  const entra = f.barrido.entraEnY
  const sale = f.barrido.saleEnY
  return entra === null || sale === null ? -1 : sale - entra
}

/**
 * EL PREDICADO DE LA IDENTIDAD, EXTRAÍDO PARA PODER PONERLO EN ROJO A PROPÓSITO.
 *
 * Vive afuera de `porPerfil` por una sola razón, y es la que lo distingue de la
 * tautología que reemplaza: **una afirmación que no se puede hacer fallar no se
 * puede distinguir de una que no mide nada.** Acá el control la llama con un alto
 * alterado y exige rojo.
 *
 * Lo que dice: el hijo no se recorta (mide al menos una pantalla), y **la
 * pérdida de recorrido medida por scroll** coincide con **el desborde medido por
 * caja** dentro de la resolución de la bisección.
 */
export function desbordeCierra(
  c: { readonly altoDelViewport: number; readonly recorridoDerivadoDeLaTabla: number },
  altoMax: number | null,
  rango: number,
): boolean {
  if (altoMax === null || rango < 0) return false
  const desborde = altoMax - c.altoDelViewport
  const perdida = c.recorridoDerivadoDeLaTabla - rango
  return desborde > -1 && Math.abs(perdida - desborde) <= 2 * PRECISION
}

/** Las afirmaciones de UN perfil: el pin donde tiene que estar, y el envoltorio inerte. */
export function porPerfil(c: Corrida): readonly Comprobacion[] {
  const pin = buscar(c, HUELLA_DEL_PIN)
  const envoltorio = buscar(c, HUELLA_DEL_ENVOLTORIO)
  const inerte: Comprobacion = {
    que: `${c.viewport} · el envoltorio de \`Seccion\` es INERTE — cero recorrido, y no está roto`,
    ok: envoltorio?.clase === 'inerte-sin-recorrido',
    obtenido: envoltorio?.porQue ?? '(no encontrado)',
  }
  if (!c.arribaDeLaCompuerta) {
    return [
      {
        que: `${c.viewport} · abajo de 1025 la secuencia no monta su \`sticky\`: la rama apilada no lo tiene`,
        ok: pin === undefined,
        obtenido: pin?.clase ?? 'ausente, como la rama declara',
      },
      inerte,
    ]
  }
  const disponible = pin === undefined ? -1 : pin.barrido.ficha.recorridoDisponible
  const altoDelPin = pin === undefined ? -1 : pin.barrido.ficha.altoPropio
  const altoMax = pin?.barrido.altoPegadoMax ?? null
  const entra = pin?.barrido.entraEnY ?? null
  const sale = pin?.barrido.saleEnY ?? null
  const rango = entra === null || sale === null ? -1 : sale - entra
  /**
   * ⚠️ **EL RECORRIDO DISPONIBLE, RECALCULADO CON EL ALTO MEDIDO DURANTE EL PIN.**
   *
   * `ficha.recorridoDisponible` sale del censo, o sea del alto del hijo a
   * `scrollY = 0`. Éste sale del alto MÁXIMO que el hijo tuvo mientras estaba
   * pegado. Cuando el contenido no cambia son el mismo número; cuando cambia
   * —que es este caso a 1025×768— difieren en lo que el hijo creció, y **el que
   * describe el pin es éste**.
   */
  const disponibleMedido = altoMax === null ? -1 : pin!.barrido.ficha.altoDelPadre - altoMax
  return [
    {
      que: `${c.viewport} · el pin real de Servicios se pega`,
      ok: pin?.clase === 'pegado',
      obtenido: pin === undefined ? '(no encontrado)' : `${pin.clase} — ${pin.porQue}`,
    },
    {
      /**
       * ⚠️ **ESTA FILA REEMPLAZA A UNA CON TOLERANCIA DE UN PASO ENTERO (120 px),
       * QUE ES LA QUE DEJÓ PASAR UN DESVÍO DE 27,45 px SIN DECIR NADA.**
       *
       * La tolerancia vieja era casi seis veces más grande que la resolución del
       * propio instrumento: un pin que perdiera el 5 % de su recorrido a 1920
       * (108 px) también salía verde. La nueva es `2 × PRECISION` — los dos
       * bordes se afinan por bisección hasta `PRECISION`, así que el rango
       * arrastra el error de los dos y no puede ser más chico que eso.
       *
       * Y se compara contra `disponibleMedido`, no contra el del censo: el
       * desvío de 1025 no era ruido del barrido, era el hijo creciendo. Con la
       * cantidad correcta la tolerancia puede apretarse en vez de aflojarse.
       */
      que: `${c.viewport} ·   su rango MEDIDO (bisección a ${PRECISION} px) cae a menos de ${2 * PRECISION} px del recorrido disponible con el alto medido DURANTE el pin`,
      ok: rango >= 0 && disponibleMedido >= 0 && Math.abs(rango - disponibleMedido) <= 2 * PRECISION,
      obtenido: `${rango} px medidos (scrollY ${entra} → ${sale}) contra ${Math.round(disponibleMedido * 100) / 100} disponibles con el hijo en su alto máximo (${altoMax}); el censo a scrollY 0 habría dicho ${disponible}`,
    },
    {
      que: `${c.viewport} ·   el contenedor mide exactamente los ${PASOS} pasos declarados: el alto de la tabla se cumple al píxel`,
      ok: pin !== undefined && Math.abs(pin.barrido.ficha.altoDelPadre - PASOS * c.altoDelViewport) < 1,
      obtenido: `${pin?.barrido.ficha.altoDelPadre ?? -1} px de contenedor contra ${PASOS} × ${c.altoDelViewport} = ${PASOS * c.altoDelViewport}`,
    },
    {
      /**
       * ⚠️ **ACÁ HABÍA UNA TAUTOLOGÍA, Y VALE MÁS ESCRITA QUE BORRADA.**
       *
       * La versión anterior afirmaba «lo que el pin pierde de recorrido es
       * exactamente lo que el hijo desborda» con los dos lados calculados a
       * partir de las MISMAS dos alturas del censo:
       *
       *     derivado − disponible − (alto − V)
       *       = (pasos−1)·V − (padre − alto) − alto + V
       *       = pasos·V − padre
       *
       * `alto` **se cancela**. El predicado se reducía a `padre === pasos × V`,
       * que es exactamente lo que ya afirma la fila de arriba, así que no podía
       * ponerse en rojo por nada que tuviera que ver con el desborde del hijo.
       * Y había reemplazado a una afirmación que sí daba rojo a 1025: eso es
       * aflojar, aunque el docblock lo cuente.
       *
       * Lo que se afirma ahora **no es derivable de la geometría del censo**: el
       * desborde sale del alto **medido durante el pin** (`altoPegadoMax`, una
       * lectura por parada) y la pérdida sale del rango **medido por scroll
       * real** (los dos bordes, bisectados). Son dos mediciones independientes
       * —una lee cajas, la otra mueve el scroll— y por eso pueden discrepar.
       *
       * A 1025×768 el hijo crece de 774,55 a 798,55 px a mitad del pin: con el
       * alto del censo esta fila publicaba 6,55 px de desborde y la de arriba lo
       * tapaba; con el alto medido da **30,55 px**, y recién ahí las dos cierran.
       *
       * Su control vive en `comprobar`, abajo: alimentado con un alto alterado,
       * el mismo predicado tiene que dar ROJO.
       */
      que: `${c.viewport} ·   el hijo no se recorta, y lo que el pin pierde de recorrido MEDIDO es lo que el hijo desborda MEDIDO`,
      ok: desbordeCierra(c, altoMax, rango),
      obtenido:
        altoMax === null
          ? '(no se pegó: no hay alto durante el pin)'
          : `hijo ${altoMax} sobre ${c.altoDelViewport} de viewport → desborda ${redondear(altoMax - c.altoDelViewport)} px · el pin recorre ${rango} de los ${c.recorridoDerivadoDeLaTabla} declarados → pierde ${redondear(c.recorridoDerivadoDeLaTabla - rango)} px (${redondear(((c.recorridoDerivadoDeLaTabla - rango) / c.recorridoDerivadoDeLaTabla) * 100)} %) · el censo a scrollY 0 leía ${altoDelPin} y habría dicho ${redondear(altoDelPin - c.altoDelViewport)}`,
    },
    inerte,
  ]
}
