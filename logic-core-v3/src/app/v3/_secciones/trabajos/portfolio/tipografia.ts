/**
 * [B1] LA TIPOGRAFÍA DEL ENCABEZADO DEL PORTFOLIO — lo que el cartel del túnel tenía y el encabezado sigue usando (el túnel se fue
 * al archivo, `_archivo/tunel-portfolio/`): el cuerpo en `titulo-s` con el interlineado de `cuerpo`, su medida en `ch`, y la llegada
 * de un viaje sin recorte (PULIDO 10 J7).
 */

import { CLASE_INTERLETRADO, CLASE_INTERLINEADO, NIVELES_TIPOGRAFICOS } from '../../../_lib/tipografia'

/**
 * [B1.2c] EL TITULAR, UN POCO MÁS GRANDE (plan §13, punto 1): su nivel (`display-xl` desde 1024; abajo, en el 40 % que deja el panel,
 * `titulo-xl`) por `CRECIMIENTO_DEL_TITULO`, sin pasar de lo que entra en la columna: su ancho (`cqw`: la columna es el contenedor)
 * sobre el avance de «Portfolio» con margen (`ANCHO_DEL_TITULO_EN_EM`; el de Chivo 400 es 4,16 em, s76 lo lee de la fuente). Nada se
 * corta en ningún ancho. Las clases van enteras (el escáner de Tailwind las ve) y s76 compara sus números con las constantes.
 */
export const CRECIMIENTO_DEL_TITULO = 1.15
export const ANCHO_DEL_TITULO_EN_EM = 4.25
export const CLASE_DEL_TITULAR =
  'escritorio:text-[length:min(calc(var(--text-fluido-display-xl)*1.15),calc(100cqw/4.25))] max-escritorio:text-[length:min(calc(var(--text-titulo-xl)*1.15),calc(100cqw/4.25))]'

/** La medida de la bajada, en `ch` (va en línea: el número no se deletrea en una clase). */
export const MEDIDA_DEL_CUERPO_CH = 50

/** El cuerpo: el tamaño de `titulo-s` con el interlineado y el interletrado de `cuerpo` (un párrafo no se lee con el de un título). */
export const CLASE_DEL_CUERPO = [
  'font-cuerpo',
  NIVELES_TIPOGRAFICOS['titulo-s'].claseFija,
  CLASE_INTERLINEADO[NIVELES_TIPOGRAFICOS.cuerpo.interlineado],
  CLASE_INTERLETRADO[NIVELES_TIPOGRAFICOS.cuerpo.interletrado],
  'max-escritorio:text-[length:var(--text-cuerpo)]',
].join(' ')

/** [C2 · 40] Los rótulos, los ejemplos y la letra de los campos de «la tuya»: el tamaño de la bajada (sin su interlineado de párrafo). */
export const CLASE_DEL_TEXTO_DEL_FORMULARIO = [NIVELES_TIPOGRAFICOS['titulo-s'].claseFija, 'max-escritorio:text-[length:var(--text-cuerpo)]'].join(' ')

/**
 * [PULIDO 10] J7 · LA LLEGADA DE UN VIAJE, SIN RECORTE. P2 sube el titular adentro de la ventana que recorta: con el scroll se lee
 * como una aparición, pero en la llegada repetida de un viaje el primer cuadro a la vista era el titular cortado. Mientras se
 * repite, la ventana no recorta y el titular arranca invisible: entero o invisible, nunca cortado.
 */
export const FUNDIDO_DE_LA_LLEGADA = 0.35

/** La opacidad del titular según la repetición de la llegada (−1, sin repetir: entero). */
export const opacidadDeLaLlegada = (r: number): number => (r < 0 ? 1 : Math.min(1, r / FUNDIDO_DE_LA_LLEGADA))

/** Si la ventana recorta según la repetición de la llegada (sólo sin repetir). */
export const recorteDeLaLlegada = (r: number): 'hidden' | 'visible' => (r < 0 ? 'hidden' : 'visible')
