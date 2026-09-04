/**
 * EL REVELADO DE LA ESCENA — cómo la sala VUELVE a verse después de las
 * secciones opacas, sin tocar un solo valor de la escena.
 *
 * ⚠ **ESTE ARCHIVO CAMBIA CÓMO SE REVELA, NO QUÉ HAY.** No lee ni escribe una
 * pose, ni el anclaje, ni el progreso, ni un canal de luz. No importa `three` ni
 * `recorrido.ts` ni `anclaje.ts`: sólo lee la TABLA de secciones para saber
 * cuáles dejan ver el canvas, y las cajas de esos paneles en el DOM. Lo único que
 * produce es una **máscara CSS** que se le aplica al envoltorio de la escena.
 *
 * ── EL DEFECTO QUE VIENE A TAPAR, MEDIDO ANTES DE CONSTRUIR (B3) ────────────
 *
 * El recorrido de superficies deja la escena visible en DOS ventanas —el Hero
 * (pantallas 0–1) y Por qué develOP (pantallas 11–13)— y opaca en el resto. En
 * `s9-visibilidad.invariant.ts` la escena SUSPENDE el render entre medio y
 * REANUDA con la pose exacta un margen antes de reaparecer, así que **la cámara
 * NO da un salto de pose al volver**: eso ya está resuelto y medido (el salto de
 * pose es 0 cuadros; lo que se movió oculto —250° de azimut entre las pantallas
 * 1 y 11— no se ve porque la reanudación pone la pose de HOY).
 *
 * Lo que NO tiene tratamiento es el BORDE: cuando el panel opaco (papel) se va y
 * el panel transparente entra, la escena aparece contra una **costura horizontal
 * dura** —papel arriba, sala 3D abajo, en una línea— que es lo que la instrucción
 * llama «un opacity de cero a uno». Medido con scroll real a 1 y a 3,75
 * pantallas/s: el reingreso dura UNA pantalla de scroll (16 a 60 cuadros según el
 * ritmo) y la costura es un corte neto.
 *
 * ── QUÉ HACE, Y POR QUÉ ES LO CORRECTO Y NO OTRA COSA ──────────────────────
 *
 * Suaviza ESA costura y nada más: la escena entra con una **rampa de máscara**
 * en el borde donde un panel transparente toca uno opaco. Arriba de la costura la
 * máscara es transparente —la escena se oculta y se ve el PISO DE PAPEL que vive
 * detrás del canvas (`bg-fondo`, el mismo papel del panel opaco de arriba)—, y en
 * `REVELADO_FRACCION` de pantalla la escena sube a plena. El corte neto papel→sala
 * pasa a ser papel→papel→sala: un desvanecimiento de profundidad, no un opacity.
 *
 * **Por qué la máscara y no un fundido del canvas entero:** el canvas es
 * `fixed inset-0` detrás de TODO (`z-0`), y arriba de la costura siempre hay un
 * panel opaco (`z-10`) tapándolo. Enmascarar el canvas fuera de la ventana
 * transparente es invisible —el panel opaco ya lo tapa— así que la máscara sólo
 * PINTA en la rendija que el panel transparente descubre. Un `opacity` sobre el
 * envoltorio, en cambio, apagaría también el Hero. La máscara es local por
 * construcción, sin que este módulo sepa dónde está la costura: la geometría del
 * DOM se la da.
 *
 * **Por qué no empeora el contraste del titular (regla del sprint):** la máscara
 * sólo ACLARA la escena cerca de la costura (más papel, menos sala oscura detrás
 * del texto). El titular es DOM `z-10`, no se enmascara. Aclarar el fondo sólo
 * puede subir o dejar igual el contraste; nunca bajarlo. Medido en B3.
 *
 * ── LA RAMPA ES UNA FRACCIÓN DE PANTALLA, NO UN PÍXEL MÁGICO ───────────────
 *
 * `REVELADO_FRACCION` = 0,125, el MISMO octavo que `MARGEN_DE_REANUDACION` de
 * `visibilidad.ts`: el ancho de la rampa coincide con la banda en la que la
 * escena reanuda, así el ablandado ocurre exactamente cuando la sala vuelve a la
 * vida. En píxeles es `fracción × alto de la ventana`, así que escala con el
 * viewport y no hay un número copiado. «Si el salto es chico, el tratamiento es
 * chico»: 0,125 de pantalla es 30–111 ms del reingreso según el ritmo — un
 * ablandado, no una cortina de 1.111 ms.
 */

/**
 * El ancho de la rampa del revelado, como fracción del alto de la ventana.
 *
 * 0,125 = un octavo, el mismo que `MARGEN_DE_REANUDACION`. No se importa de
 * `visibilidad.ts` para no acoplar el revelado a la máquina de fases —son dos
 * cosas que PUEDEN querer moverse por separado— pero la coincidencia es
 * deliberada y está escrita: el ablandado dura lo que dura la reanudación.
 */
import { SECCIONES, SECCIONES_QUE_DEJAN_VER_LA_ESCENA } from '../secciones'
import { ATRIBUTO_DEL_PANEL } from './extensionDeLasSecciones'

export const REVELADO_FRACCION = 0.125

/**
 * Un borde de una ventana transparente, en coordenadas de la VENTANA (viewport).
 *
 * - `entra` — panel opaco ARRIBA, sala ABAJO: bajando, la sala aparece. La rampa
 *   sube de oculto a pleno hacia abajo.
 * - `sale` — sala ARRIBA, panel opaco ABAJO: bajando, la sala se va. La rampa
 *   baja de pleno a oculto hacia abajo.
 */
export interface BordeDeRevelado {
  /** Fila del viewport donde está la costura. */
  readonly row: number
  readonly tipo: 'entra' | 'sale'
}

/** Recorta a [0, ventana] y redondea al décimo de píxel para no ensuciar la cadena. */
function acotar(valor: number, ventana: number): number {
  const v = valor < 0 ? 0 : valor > ventana ? ventana : valor
  return Math.round(v * 10) / 10
}

/**
 * LA MÁSCARA CSS DEL REVELADO, o `null` si no hay ninguna costura que ablandar en
 * el cuadro (y entonces no se aplica máscara: cero costo).
 *
 * Es una función `linear-gradient(to bottom, …)` sobre `mask-image`, donde
 * `#000` = la escena se ve y `transparent` = se ve el papel de atrás. `null`
 * cuando el resultado sería todo negro (la sala llena la ventana) o todo
 * transparente (la sala está enteramente detrás de un opaco): en los dos casos la
 * máscara no cambiaría un píxel y se prefiere no ponerla.
 *
 * Puro: recibe los bordes y el alto, no toca el DOM. Es lo que permite afirmarlo
 * sin navegador y correr el control positivo contra bordes fabricados.
 */
export function maskDeRevelado(
  bordes: readonly BordeDeRevelado[],
  ventana: number,
  rampaPx: number,
): string | null {
  if (!(ventana > 0) || !(rampaPx > 0)) return null

  // Los bordes cuya rampa toca la ventana. Un borde con la costura fuera del
  // rango [−rampa, ventana+rampa] no produce transición visible.
  const activos = bordes
    .filter((b) => Number.isFinite(b.row) && b.row > -rampaPx && b.row < ventana + rampaPx)
    .slice()
    .sort((a, b) => a.row - b.row)
  if (activos.length === 0) return null

  // La escena se ve (α=1) entre la última costura `entra` y la primera `sale`;
  // fuera de eso se oculta. Se arma la curva α(fila) como pares [fila, α] y se
  // vuelca a stops de gradiente. Con las ventanas del home hay a lo sumo un borde
  // por cuadro (Hero y Por qué develOP están a once pantallas), pero la forma
  // soporta los dos de una misma ventana corta sin un caso especial.
  const puntos: Array<{ fila: number; alpha: 0 | 1 }> = []
  const entra = activos.filter((b) => b.tipo === 'entra')
  const sale = activos.filter((b) => b.tipo === 'sale')

  // α arranca en 1 salvo que haya una costura `entra` por encima de todo lo demás.
  const primeraEntra = entra.length > 0 ? entra[0].row : Number.NEGATIVE_INFINITY
  const primeraSale = sale.length > 0 ? sale[0].row : Number.POSITIVE_INFINITY
  let alphaArriba: 0 | 1 = primeraEntra < primeraSale && entra.length > 0 ? 0 : 1

  puntos.push({ fila: 0, alpha: alphaArriba })
  for (const b of activos) {
    if (b.tipo === 'entra') {
      puntos.push({ fila: acotar(b.row, ventana), alpha: 0 })
      puntos.push({ fila: acotar(b.row + rampaPx, ventana), alpha: 1 })
      alphaArriba = 1
    } else {
      puntos.push({ fila: acotar(b.row - rampaPx, ventana), alpha: 1 })
      puntos.push({ fila: acotar(b.row, ventana), alpha: 0 })
      alphaArriba = 0
    }
  }
  puntos.push({ fila: ventana, alpha: alphaArriba })

  // Si toda la curva es un solo valor, la máscara no hace nada: no se pone.
  if (puntos.every((p) => p.alpha === puntos[0].alpha)) return null

  const color = (a: 0 | 1): string => (a === 1 ? '#000' : 'transparent')
  const stops = puntos.map((p) => `${color(p.alpha)} ${p.fila}px`).join(', ')
  return `linear-gradient(to bottom, ${stops})`
}

/** Lo mínimo que este módulo necesita de un elemento del DOM. */
export interface CajaDePanel {
  getBoundingClientRect(): { readonly top: number; readonly bottom: number }
}

/** Lo mínimo que necesita de un documento. */
export interface FuenteDePaneles {
  querySelector(selector: string): CajaDePanel | null
}

/**
 * LOS BORDES DE REVELADO DE UN DOCUMENTO — la capa fina que le pide las cajas al
 * DOM. El núcleo puro es `maskDeRevelado`; esto sólo traduce paneles a bordes.
 *
 * `transparentes` es la lista de ids que dejan ver el canvas —`SECCIONES_QUE_DEJAN_
 * VER_LA_ESCENA` de `secciones.ts`, LEÍDA, no escrita— y `primeroYultimo` marca la
 * primera y la última sección del recorrido: el borde de arriba de la PRIMERA y el
 * de abajo de la ÚLTIMA son bordes del DOCUMENTO, no costuras contra un opaco, y no
 * se ablandan (arriba del Hero está el intro, no un panel). Los demás bordes de una
 * ventana transparente SIEMPRE lindan con un opaco —el recorrido no pone dos
 * transparentes seguidas—, así que son costuras y se ablandan.
 */
export function bordesDeRevelado(
  documento: FuenteDePaneles,
  transparentes: readonly string[],
  atributoDelPanel: string,
  idPrimera: string,
  idUltima: string,
): BordeDeRevelado[] {
  const bordes: BordeDeRevelado[] = []
  for (const id of transparentes) {
    const nodo = documento.querySelector(`[${atributoDelPanel}="${id}"]`)
    if (nodo === null) continue
    const caja = nodo.getBoundingClientRect()
    if (id !== idPrimera) bordes.push({ row: caja.top, tipo: 'entra' })
    if (id !== idUltima) bordes.push({ row: caja.bottom, tipo: 'sale' })
  }
  return bordes
}

/**
 * EL PEGAMENTO — lee las cajas de los paneles transparentes y escribe la máscara
 * en el envoltorio de la escena. Vive acá, y no en `EscenaDelHome.tsx`, para que
 * ese archivo no cruce las 300 líneas y para que el núcleo que se afirma
 * (`maskDeRevelado`) quede separado del que toca el DOM.
 *
 * `activo` es `false` mientras el intro retiene la escena o mientras ningún panel
 * transparente está en cuadro: ahí la máscara se limpia (`''`) sin leer el DOM.
 * `mask-image: ''` NO es un `opacity`: es «sin máscara», o sea la escena entera.
 */
export function aplicarRevelado(el: HTMLElement | null, ventana: number, activo: boolean): void {
  if (el === null) return
  const mask = activo
    ? maskDeRevelado(
        bordesDeRevelado(
          document,
          SECCIONES_QUE_DEJAN_VER_LA_ESCENA,
          ATRIBUTO_DEL_PANEL,
          SECCIONES[0].id,
          SECCIONES[SECCIONES.length - 1].id,
        ),
        ventana,
        ventana * REVELADO_FRACCION,
      )
    : null
  const valor = mask ?? ''
  el.style.setProperty('mask-image', valor)
  el.style.setProperty('-webkit-mask-image', valor)
}
