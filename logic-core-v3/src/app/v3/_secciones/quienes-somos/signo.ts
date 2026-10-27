import { BANDA, enUnidadesDelLogo } from '../../_lib/escena/banda'
import { AIRE_DEL_LOGO_SVH } from '../../_lib/escena/finalDelRecorrido'
import { TRAZOS_DEL_SIGNO } from '../_contrato/canales'

import { GEOMETRIA } from './geometria'

/**
 * [C2-30s] EL ≠ EN EL ESPACIO LIBRE DE LA AGENCIA (ítem 3 de la revisión: «más grande y centrado, mismo efecto, mismo tipo»).
 *
 * Desde 1024 el ≠ deja de medir tres renglones del titular pegado al margen: llena el ESPACIO LIBRE de la primera pantalla
 * y va centrado en él. El espacio libre es un rectángulo del DOM (el Bloque de afuera del ≠, contenedor de tamaño):
 *   · arriba y abajo, su fila (la que crece, `repartoDeLaAgencia`): del pie del titular a la cabeza del cuerpo;
 *   · a la izquierda, el margen de la página (el de `Envoltorio`; la columna lateral está vacía y es parte del hueco);
 *   · a la derecha, el logo: el centro del cuadro menos su medio ancho y su aire, en unidades del logo (`enUnidadesDelLogo`,
 *     la reserva que el DOM ya le hace en Por qué develOP: con la banda, un poco más de lo que ocupa, nunca menos).
 * El ≠ es el MISMO objeto más grande: su caja es un cuadrado de lado `ladoDelSigno(libre)` y el cuerpo de su lugar escala con
 * él (`--signo-cuerpo`), así que el volumen (la extrusión y el bisel, en em) y la raya (`--signo-grosor`, en cuerpos) crecen
 * en la misma proporción. El 3D lo mide del DOM como siempre (`trazos3d.ts`). Abajo de 1024 no cambia nada.
 */

/** Cuánto del espacio libre llena la TINTA del ≠ en su lado que manda. [decidido] Grande y con aire alrededor. */
export const RELLENO_DEL_SIGNO = 0.8

/**
 * El medio ancho del logo en el reposo de la agencia, en `svh` (con la banda en 1). [medido] Captura `lote1/02` (1920 × 910,
 * el reposo de Quiénes somos): el logo mide 387 px de ancho, 193,5 / 910 = 21,3 % del alto. PULIDO 10 midió su alto a
 * 1440 × 900 (424 px, el 47,1 %) y la captura da el 47,3 %: el mismo encuadre.
 */
export const MEDIO_ANCHO_DEL_LOGO_SVH = 21.3

/** La reserva del logo desde el centro del cuadro, en `svh`: su medio ancho y su aire (el de los demás huecos del logo). */
export const RESERVA_DEL_LOGO_SVH = MEDIO_ANCHO_DEL_LOGO_SVH + AIRE_DEL_LOGO_SVH

/**
 * La raya del ≠ en cuerpos de su lugar. [derivado] La de antes, 4,5 px (`trazo.css`: el hilo por 4,5), sobre el cuerpo del
 * titular a 1440 (38 px): 4,5 / 38. Así la raya guarda con el ≠ la proporción que tenía a 1440.
 */
export const GROSOR_DEL_SIGNO_EN_CUERPOS = Math.round((4.5 / 38) * 10000) / 10000

/** El margen de la página y el tope del contenido (`--pad-lateral-compacto`, `--container-tope`), en px. */
export const MARGEN_DE_LA_PAGINA_PX = 32
export const TOPE_DEL_CONTENIDO_PX = 1920

/** La tinta del ≠ en fracciones de su caja (de los trazos: las barras de 8 a 92, la diagonal de 16 a 84). [derivado] */
function tintaEnFracciones(): { readonly x0: number; readonly x1: number; readonly y0: number; readonly y1: number } {
  const trazos = [...TRAZOS_DEL_SIGNO.barras, ...TRAZOS_DEL_SIGNO.mitadesDeLaDiagonal]
  const xs = trazos.flatMap((t) => [t.x1, t.x2])
  const ys = trazos.flatMap((t) => [t.y1, t.y2])
  const l = TRAZOS_DEL_SIGNO.lado
  return { x0: Math.min(...xs) / l, x1: Math.max(...xs) / l, y0: Math.min(...ys) / l, y1: Math.max(...ys) / l }
}
export const TINTA_DEL_SIGNO = tintaEnFracciones()
const TINTA_ANCHO = TINTA_DEL_SIGNO.x1 - TINTA_DEL_SIGNO.x0
const TINTA_ALTO = TINTA_DEL_SIGNO.y1 - TINTA_DEL_SIGNO.y0

export interface Rect {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

/** La reserva del logo en px (lo que escribe `enUnidadesDelLogo` en CSS: `max(q/tope svh, min(q svh, q/aspecto vw))`). */
export function reservaDelLogoPx(ancho: number, alto: number): number {
  const q = RESERVA_DEL_LOGO_SVH / 100
  return Math.max((q * alto) / BANDA.tope, Math.min(q * alto, (q * ancho) / BANDA.aspecto))
}

/** El espacio libre en el cuadro (px), con la fila del ≠ (`desde`: el pie del titular; `hasta`: la cabeza del cuerpo). */
export function espacioLibreDelSigno(ancho: number, alto: number, fila: { readonly desde: number; readonly hasta: number }): Rect {
  const mitad = Math.min(ancho / 2 - MARGEN_DE_LA_PAGINA_PX, TOPE_DEL_CONTENIDO_PX / 2)
  return { x: ancho / 2 - mitad, y: fila.desde, ancho: Math.max(0, mitad - reservaDelLogoPx(ancho, alto)), alto: Math.max(0, fila.hasta - fila.desde) }
}

/** El lado de la caja del ≠: su tinta llena `RELLENO_DEL_SIGNO` del lado que manda, y la caja nunca pasa del alto de su fila. */
export function ladoDelSigno(libre: { readonly ancho: number; readonly alto: number }): number {
  return Math.max(0, Math.min((RELLENO_DEL_SIGNO * libre.ancho) / TINTA_ANCHO, (RELLENO_DEL_SIGNO * libre.alto) / TINTA_ALTO, libre.alto))
}

/** La caja del ≠: un cuadrado de ese lado, centrado en el espacio libre (el Bloque es flex y lo centra en los dos ejes). */
export function cajaDelSigno(libre: Rect): Rect {
  const lado = ladoDelSigno(libre)
  return { x: libre.x + (libre.ancho - lado) / 2, y: libre.y + (libre.alto - lado) / 2, ancho: lado, alto: lado }
}

/** La tinta del ≠ en su caja (sin el medio grosor de la raya). */
export function tintaDelSigno(caja: Rect): Rect {
  const t = TINTA_DEL_SIGNO
  return { x: caja.x + t.x0 * caja.ancho, y: caja.y + t.y0 * caja.alto, ancho: TINTA_ANCHO * caja.ancho, alto: TINTA_ALTO * caja.alto }
}

const n = (v: number): string => String(Math.round(v * 1000) / 1000)

/**
 * Las propiedades del espacio libre (las lee el Bloque de afuera y el lugar del ≠). Las del titular van también: de ahí salen
 * `--signo-alto` (tres renglones de su cuerpo) y el interlineado. `cq*` resuelve contra el Bloque (contenedor de tamaño desde
 * 1024); abajo nadie las usa.
 */
export const ESTILO_DEL_SIGNO = {
  ...GEOMETRIA.estilos.titular,
  '--signo-libre-ancho': `calc(min(50vw - var(--pad-lateral-compacto), var(--container-tope) / 2) - ${enUnidadesDelLogo(RESERVA_DEL_LOGO_SVH)})`,
  '--signo-libre-corrimiento': 'calc(var(--columna-lateral) + var(--grilla-canal-amplio))',
  '--signo-lado': `min(calc(100cqw * ${n(RELLENO_DEL_SIGNO / TINTA_ANCHO)}), calc(100cqh * ${n(RELLENO_DEL_SIGNO / TINTA_ALTO)}), 100cqh)`,
  '--signo-cuerpo': 'calc(var(--signo-lado) / (3 * var(--titular-interlineado)))',
} as React.CSSProperties

/**
 * Las clases, desde 1024. `libre`: el Bloque de afuera ES el espacio libre (su fila entera, del margen de la página al aire del
 * logo), contenedor de tamaño (no le suma alto a la fila: la pantalla mide lo mismo) y centra al ≠ en los dos ejes. `lugar`: el
 * lugar del título de volumen, del lado del ≠ y con su cuerpo (el `em` de `--signo-alto`) y su raya.
 */
export const CLASES_DEL_SIGNO = {
  libre: 'escritorio:@container-size escritorio:flex escritorio:items-center escritorio:justify-center escritorio:self-stretch escritorio:justify-self-start escritorio:w-[var(--signo-libre-ancho)] escritorio:-ml-[var(--signo-libre-corrimiento)]',
  lugar: 'escritorio:w-[var(--signo-lado)] escritorio:text-[length:var(--signo-cuerpo)] escritorio:[--signo-grosor:calc(var(--signo-cuerpo)*0.1184)]',
} as const
