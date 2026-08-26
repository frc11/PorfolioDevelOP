/**
 * LA PENUMBRA (S12) — el sol gana diámetro angular y el borde de la sombra deja
 * de ser filoso.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * EL BORDE SALE DEL MODELO, NO DE UN DESENFOQUE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * S11 dejó la celosía proyectando y el borde de cada banda tan filoso como el
 * render lo permita: lo único que lo ablandaba era el filtro de huella de píxel,
 * que es antialias, no óptica. Por eso el piso se leía como material pintado —
 * un damero de rectángulos blancos— en vez de leerse como luz.
 *
 * **La causa es que el sol no tenía tamaño.** Un sol real mide medio grado de
 * diámetro, y una fuente de tamaño angular α proyecta, detrás de un borde que
 * está a distancia `t`, una penumbra cuyo ancho crece con `t`. De ahí salen dos
 * cosas:
 *
 * - el borde se ablanda y la banda se lee como luz;
 * - **cada pedazo de piso se ablanda según SU propia distancia a la celosía**, y
 *   esa variación es lo que distingue una sombra de una textura.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ TRES COSAS QUE EL DIAGNÓSTICO DEL SPRINT DABA POR CIERTAS Y NO LO SON
 * ════════════════════════════════════════════════════════════════════════════
 *
 * No son notas al pie: son correcciones, medidas, y cambian qué se puede
 * esperar de este archivo. Los números están en `outputs/S12-PENUMBRA.md`.
 *
 * **1 · `R/cos(elevación)`, no `1/tan`. La penumbra NO se ensancha al
 * atardecer.** La distancia de un punto del piso al manto es `R/cos(elevación)`:
 * al bajar el sol el rayo llega ANTES, no después. Medido en el centro de la
 * losa, `t` baja de 47,0 (p=0) a 38,8 (p=1). Lo que crece ×3,6 con
 * `1/tan(elevación)` es la CELDA proyectada —eso sí es cierto y es de S11—, así
 * que la penumbra **como fracción de la banda se achica un 32%** (0,230 → 0,157
 * celdas). En unidades de mundo la familia radial parece ensancharse ×2,4
 * (0,74 → 1,81) pero es solo porque la celda se estiró debajo. Lo que se ve es
 * la fracción: **el cierre no se arregla solo.**
 *
 * **2 · La diferencia entre las dos capas es del 16%, y en relativo se
 * invierte.** En mundo la penumbra de la gruesa es exactamente `44/38 = 1,16×`
 * la de la fina. Pero como fracción de su propia celda va al revés —0,101 contra
 * 0,209 celdas—, o sea que la sombra de la gruesa queda **2,1× más DURA**
 * relativa a su banda, porque su celda es 2,4× más grande. **Lo que rompe la
 * lectura de baldosa no es la diferencia entre capas: es el 6,3× entre el punto
 * del piso más cercano a la celosía y el más lejano** — y ése es geométrico (la
 * razón de distancias) y **no depende de α**. α elige la escala, no la variación.
 *
 * **3 · La creciente de sol abierto ya tenía el borde blando, y no es esto.** Su
 * transición 95→5% mide 14,20 de mundo = **6,1 celdas finas con α = 0**, y la
 * pone `MOIRE_FADE`. Con α = 0,266° sigue en 14,20 —**0,0%**— y ni con α = 1°
 * pasa de 14,55: **+2,5%**.
 *
 * ── De dónde sale el ancho, exactamente ────────────────────────────────────
 *
 * El gobo no muestrea el disco del sol: convierte su tamaño angular en un ancho
 * de FASE y se lo pasa al filtro que ya existe. La cuenta es geométrica y cierra
 * en dos raíces cuadradas.
 *
 * Sea `P` el punto sombreado, `s` la dirección al sol (unitaria), `Q = P + s·t`
 * el cruce contra el manto de la capa y `n` la normal horizontal del cilindro en
 * `Q`. Si el sol se corre un ángulo `dθ`, el cruce se mueve sobre el manto:
 *
 *     dQ = t · [ δ − s · (n·δ) / (n·s) ]      con δ ⊥ s, |δ| = dθ
 *
 * —el segundo término es el que sigue al cruce cuando el rayo entra rasante—. La
 * fase horizontal `u` y la vertical `v` usan las dos el MISMO paso sobre el manto
 * (`pitch = 2πR/celdas`), así que basta proyectar `dQ` sobre la tangente
 * horizontal `t̂` y sobre `ŷ`. Llamando `c = n·s`, el máximo sobre el disco del
 * sol da, después de simplificar con `c² + (s·t̂)² = |s_xz|²`:
 *
 *     ancho_u = 2·tan(α) · (t / pitch) · |s_xz| / |c|
 *     ancho_v = 2·tan(α) · (t / pitch) · √(s_y² + c²) / |c|
 *
 * Los dos en CELDAS de la trama, que es la unidad en la que trabaja la barra —
 * y por eso el número es directamente **qué fracción de la celda mide la
 * penumbra**. El `1/|c|` es la oblicuidad: un rayo que roza el manto ensancha su
 * propia penumbra, que es lo que pasa de verdad.
 *
 * ⚠️ **No hay ningún blur acá.** No se desenfoca el resultado ni se filtra el
 * piso: se ensancha el borde de la barra, por fragmento, con el ancho que la
 * geometría dicta. Con `α = 0` las dos fórmulas dan 0 y el gobo vuelve a ser
 * EXACTAMENTE el de S11 — que es el control de todo este sprint.
 *
 * ── Cómo se combina con el filtro de huella de píxel ───────────────────────
 *
 * No lo reemplaza y no se suma: **el borde efectivo es el mayor de los dos**
 * (`max(fwidth(fase), penumbra)`). Cerca de la cámara manda la penumbra física;
 * en la lonja rasante contra el horizonte, donde la celda no llega a un píxel,
 * manda el filtro. Sumarlos lavaría el piso lejano dos veces.
 *
 * El mismo `celosiaBarFiltered` que ya existía hace las dos cosas sin una línea
 * nueva de perfil: ensancha la rampa hasta el ancho que se le pase y, pasada
 * media celda, reemplaza el patrón por su propia media. Para la penumbra eso
 * también es lo correcto —una penumbra más ancha que la celda ES el promedio de
 * la trama— así que la física y el antialias comparten el mismo perfil.
 */

/**
 * El radio angular del sol, en grados. El sol real mide **0,266°** (medio grado
 * de diámetro) y ése es el punto de partida, pero esto es un estudio estilizado:
 * **la perilla está en el panel y el valor definitivo se calibra mirando.**
 *
 * Lo que el número mueve, en orden de importancia: cuánto se ablanda el borde de
 * la banda, cuánto se DIFERENCIAN las dos capas entre sí, y cuánto contraste se
 * devuelve de los 29,6 puntos que S11 compró. Las tres tiran para lados
 * distintos — la tabla de la tensión está en el reporte del sprint.
 */
export const CELOSIA_SUN_RADIUS_DEG = 0.266

/**
 * El tope del slider. Con la celda fina proyectada a ~2,3 de mundo y el cruce a
 * ~47, un radio de 1° ya deja la penumbra por encima de media celda y el patrón
 * fino se reemplaza por su media: el moiré del piso desaparece. El tope deja ver
 * ese extremo sin que el slider se vuelva inútil.
 */
export const CELOSIA_SUN_RADIUS_MAX_DEG = 1.5

/** Lo que consume el modelo: `2·tan(α)`, el ancho angular COMPLETO del disco. */
export function celosiaSunSpread(radiusDeg: number): number {
  return 2 * Math.tan((Math.max(0, radiusDeg) * Math.PI) / 180)
}

/** El ancho de penumbra de un cruce, en celdas, para las dos familias de barras. */
export type CelosiaPenumbra = {
  /** La familia vertical de la trama: la fase horizontal `u`. */
  readonly u: number
  /** La familia horizontal: la fase vertical `v`. */
  readonly v: number
}

export const CELOSIA_NO_PENUMBRA: CelosiaPenumbra = { u: 0, v: 0 }

/**
 * El ancho de penumbra en un cruce, en celdas de la trama.
 *
 * `q` es el punto donde el rayo cruza el manto, `sun` la dirección al sol,
 * `radius` el radio del cilindro, `pitch` el paso de la trama sobre el manto,
 * `distance` la distancia del punto sombreado a ese cruce —el `t` de la
 * derivación, y **el único término que hace que la penumbra sea por fragmento y
 * distinta capa por capa**— y `spread` el `2·tan(α)` de arriba.
 *
 * El `1e-4` del denominador acota la oblicuidad de un rayo tangente al manto:
 * ahí la penumbra tiende a infinito de verdad, y lo que corresponde —y lo que
 * hace el filtro cuando el ancho pasa media celda— es devolver la media.
 */
export function celosiaPenumbraAt(
  q: readonly [number, number, number],
  sun: readonly [number, number, number],
  radius: number,
  pitch: number,
  distance: number,
  spread: number
): CelosiaPenumbra {
  if (spread <= 0) return CELOSIA_NO_PENUMBRA
  const cosine = (q[0] * sun[0] + q[2] * sun[2]) / radius
  const scale = (spread * distance) / (pitch * Math.max(Math.abs(cosine), 1e-4))
  const horizontal = Math.sqrt(sun[0] * sun[0] + sun[2] * sun[2])
  return {
    u: scale * horizontal,
    v: scale * Math.sqrt(sun[1] * sun[1] + cosine * cosine),
  }
}
