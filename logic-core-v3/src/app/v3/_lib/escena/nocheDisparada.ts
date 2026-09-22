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
  const c = NOCHE_DISPARADA.cantidad
  if (c <= 0) return nivel
  const tope = nivel > NIVEL_DE_LA_NOCHE ? NIVEL_DE_LA_NOCHE : nivel
  return c >= 1 ? tope : nivel + (tope - nivel) * c
}
