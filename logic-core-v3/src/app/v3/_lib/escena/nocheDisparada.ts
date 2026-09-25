/**
 * ⚠️ **LA NOCHE DISPARADA — por qué la sala se invierte en TODOS los anchos, y
 * no sólo a 1440.**
 *
 * La noche de la sala no la pinta nadie: la produce el arco del sol. Cuando
 * `arc.level` baja de `RIM_NIGHT_LEVEL` (0,34), `particleGlow.ts` mezcla el
 * difuso de las motas hacia el blanco y `logoEmision.ts` le prende al logo su
 * emisión. Esos dos módulos SON la inversión —logo gris claro, motas blancas
 * sobre fondo oscuro, la grilla apenas insinuada— y funcionan perfecto.
 *
 * El problema no era la inversión: era CUÁNDO llega.
 *
 * ── ⚠️ La deriva, medida ───────────────────────────────────────────────────
 *
 * `pantallaDeScroll` convierte scroll real → pantalla con **una sola proporción
 * global**, pero los nudos del anclaje salen de los `alto` DECLARADOS en
 * `secciones.ts`. Mientras las dos cuentas coinciden no pasa nada. Medido sobre
 * la extensión real de los ocho paneles: el documento real es **+0,2 % a 1440,
 * +3,9 % a 768 y +27,8 % a 375** (12.012 px declarados contra 15.358 medidos).
 * A 375 eso corre la sección entera casi dos décimas de progreso, y el arco
 * todavía está en nivel 1,000 —día pleno— donde la tabla dice que ya anocheció.
 *
 * Arreglar la deriva es arreglar `pantallaDeScroll` para todas las secciones, y
 * eso mueve el anclaje del diferencial y de todo lo que viene después: es un
 * sprint, no una línea.
 *
 * ── Lo que hace este módulo, que es lo que el efecto necesita ──────────────
 *
 * La conversión a noche **no es una fase del arco, es un estado**: lo prende el
 * disparo del círculo de Trabajos y lo retira la vuelta, con su propia curva. Mientras está prendido,
 * el nivel del arco se acota por abajo a la noche. No suma, no interpola y no
 * puede aclarar nada: es un `min`. Por eso no depende de ningún ancho.
 *
 * Y cuando el arco llega solo a la noche —cosa que pasa adentro de Trabajos en
 * los tres anchos, sólo que en momentos distintos— el `min` deja de hacer nada
 * sin que nadie lo apague: el relevo entre el estado y el arco es continuo por
 * construcción, no por sincronía.
 *
 * ── La forma: un objeto mutable compartido, igual que `BRILLO_DE_LA_NOCHE` ──
 *
 * El rig lo lee por cuadro dentro del `useFrame`. Un `useState` acá sería un
 * render del árbol por cuadro con la escena dibujando al lado. La sección
 * escribe `activa`; `OrbitRig` la lee y nunca la escribe.
 */

import { NIVEL_DE_LA_NOCHE } from './lightArc'
import { nivelEntre, viajeEnCurso } from './viaje'

/**
 * ⚠️ **EL ESTADO ES UNA CANTIDAD, NO UN BOOLEANO — y la ida no cambió un bit.**
 *
 * Era `activa: boolean`. La IDA sigue siendo la misma: el disparo escribe `1` de
 * una vez, y con `1` la cuenta de abajo devuelve exactamente el mismo `min` que
 * devolvía antes. Lo que la cantidad agrega es la VUELTA: scrolleando para
 * arriba la sala tiene que DES-invertirse con la duración y la curva de la gota,
 * y no de golpe. Con un booleano eso no se puede expresar —apagarlo es un corte—
 * y el corte es justo el defecto que la vuelta viene a cerrar.
 *
 * La escribe el disparo de Trabajos (`CapaDeLaGota`); la lee el rig.
 */
export const NOCHE_DISPARADA = { cantidad: 0 }

/**
 * El nivel del arco con la noche disparada encima.
 *
 * Con `cantidad = 1` es el `min` de siempre: nunca aclara, nunca suma. Entre 0 y
 * 1 interpola entre lo que dice el arco y ese mismo `min`, que es lo que hace
 * que la vuelta se vea como un desvanecido de la noche y no como un interruptor.
 * Sigue sin poder aclarar nada: el extremo al que tiende es el `min`.
 */
export function nivelConLaNocheDisparada(nivel: number): number {
  const c = nocheEfectiva()
  const tope = nivel > NIVEL_DE_LA_NOCHE ? NIVEL_DE_LA_NOCHE : nivel
  const natural = c <= 0 ? nivel : c >= 1 ? tope : nivel + (tope - nivel) * c
  NIVEL_NATURAL.valor = natural
  // [VIAJES] En un viaje de día a día la luz va de una punta a la otra sin pasar por la noche.
  const luz = viajeEnCurso()?.luz ?? null
  return luz === null ? natural : nivelEntre(luz, window.scrollY)
}

/** [VIAJES] El último nivel natural que calculó la escena: la luz de salida de un viaje. */
export const NIVEL_NATURAL = { valor: 1 }

/**
 * **[FINAL 2] EL DÍA DEL FINAL** — de «Por qué develOP» al pie la sala vuelve a ser de día,
 * y la noche disparada deja de regir. No es un segundo sistema de color: es una compuerta
 * sobre la MISMA cantidad, que la gota sigue escribiendo como siempre.
 *
 * El cambio se esconde detrás del bloque opaco que forman Servicios y Tu panel (los dos
 * `papel-opaco`, contiguos): rige desde que el MEDIO del bloque pasa el medio del cuadro.
 * Ese punto cae con el bloque tapando el cuadro entero en todos los anchos, así que el
 * cambio no se ve bajando ni subiendo. Y como es una función de la posición y no de la
 * historia, un salto de scroll (Fin, Inicio, el menú) cae siempre del lado correcto.
 *
 * La escribe la atadura al scroll en el mismo cuadro en que escribe el progreso; la lee
 * el rig a través de `nocheEfectiva`.
 */
export const DIA_DEL_FINAL = { activo: false }

/** La noche que la sala muestra: la cantidad de la gota, salvo en el día del final. */
export function nocheEfectiva(): number {
  // [VIAJES] En un viaje que cambia de luz el día del final no corta: la noche la mueve el reloj del barrido.
  const viaje = viajeEnCurso()
  if (viaje !== null && viaje.luz === null) return NOCHE_DISPARADA.cantidad
  return DIA_DEL_FINAL.activo ? 0 : NOCHE_DISPARADA.cantidad
}

/** [VIAJES] Quién se entera cuando el día del final cambia: el barrido, para recorrer el cambio con su reloj. */
const oyentesDelDia = new Set<(activo: boolean) => void>()
export function suscribirAlDiaDelFinal(f: (activo: boolean) => void): () => void {
  oyentesDelDia.add(f)
  return () => {
    oyentesDelDia.delete(f)
  }
}

/** Una caja en coordenadas del cuadro. */
export interface CajaEnElCuadro {
  readonly tope: number
  readonly pie: number
}

/** El bloque opaco del final (Servicios arriba, Tu panel abajo) y el alto del cuadro. */
export interface BloqueOpaco {
  readonly servicios: CajaEnElCuadro
  readonly tuPanel: CajaEnElCuadro
  readonly alto: number
}

/** El bloque tapa el cuadro entero: nada de la sala se ve en ninguna fila. */
export function bloqueTapaElCuadro(b: BloqueOpaco): boolean {
  return b.servicios.tope <= 0 && b.tuPanel.pie >= b.alto && b.servicios.pie >= b.tuPanel.tope - 1
}

/** ¿Rige el día del final en esta posición? Arriba del bloque no; abajo sí; tapado, el medio. */
export function diaDelFinalEn(b: BloqueOpaco): boolean {
  if (b.servicios.tope > 0) return false
  if (b.tuPanel.pie < b.alto) return true
  return (b.servicios.tope + b.tuPanel.pie) / 2 < b.alto / 2
}

/**
 * La noche que corresponde tapada, en la mitad de arriba del bloque: la de abajo del tramo
 * de Trabajos, que es 1 —la misma regla con que la gota se restaura al montarse—. Sólo se
 * repone ahí, donde no se ve; así demos vuelve a verse de noche aunque se haya llegado al
 * final con un salto que pasó por encima del disparo.
 */
export function nocheQueSeRepone(b: BloqueOpaco, cantidad: number): number | null {
  return bloqueTapaElCuadro(b) && !diaDelFinalEn(b) && cantidad < 1 ? 1 : null
}

interface CajaMedible {
  getBoundingClientRect(): { readonly top: number; readonly bottom: number }
}

/** Lee el bloque del documento. `null` si falta alguno de los dos paneles. */
export function medirElBloqueOpaco(
  documento: { querySelector(selector: string): CajaMedible | null },
  alto: number,
): BloqueOpaco | null {
  const servicios = documento.querySelector('[data-panel="servicios"]')?.getBoundingClientRect()
  const tuPanel = documento.querySelector('[data-panel="tu-panel"]')?.getBoundingClientRect()
  if (servicios === undefined || tuPanel === undefined) return null
  return { servicios: { tope: servicios.top, pie: servicios.bottom }, tuPanel: { tope: tuPanel.top, pie: tuPanel.bottom }, alto }
}

/** El paso por cuadro: pone la compuerta y, si corresponde, repone la noche escondida. */
export function aplicarElDiaDelFinal(b: BloqueOpaco | null): void {
  if (b === null) return
  const antes = DIA_DEL_FINAL.activo
  DIA_DEL_FINAL.activo = diaDelFinalEn(b)
  if (DIA_DEL_FINAL.activo !== antes) oyentesDelDia.forEach((f) => f(DIA_DEL_FINAL.activo))
  const repuesta = nocheQueSeRepone(b, NOCHE_DISPARADA.cantidad)
  // [VIAJES] Durante un viaje no se repone de golpe: la sala se ve, y la noche la mueve el reloj del barrido.
  if (repuesta !== null && viajeEnCurso() === null) NOCHE_DISPARADA.cantidad = repuesta
}
