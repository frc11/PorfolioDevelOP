/**
 * EL RECIBO DE `MONTAJE_DEL_TITULAR_KIB` — 706 B, con su método y con lo que
 * este recibo NO puede afirmar.
 *
 * Los recibos anteriores viven en `s5-presupuesto-recibos.ts` (el techo, B4-A,
 * B7 y B6-A), `s5-presupuesto-recibos-del-merge.ts` (B9, B8 y el heredado),
 * `s5-presupuesto-recibos-de-b11.ts` y `s5-presupuesto-recibos-de-b12.ts`. Éste
 * sigue la misma forma y **se aparta en una cosa, que se declara arriba de
 * todo**.
 *
 * ═══ ⚠️ EL MÉTODO NO ES EL DE B11 NI EL DE B12, Y LA DIFERENCIA IMPORTA ═════
 *
 * B11 y B12 midieron su montaje con un **A/B entre dos builds del MISMO árbol**:
 * apagaban cada pieza en el árbol de trabajo sólo durante la medición y la
 * restauraban byte a byte, con el SHA del archivo antes y después. Eso da dos
 * cosas: el total y **el reparto por pieza**.
 *
 * Acá el total está medido y el reparto por pieza NO. El total sale de
 * `s5-peso` sobre este árbol —65.996 B escritos contra los 65.290 del techo
 * pre-titular, o sea **706 B de desvío**, de los cuales 614 son de la primera
 * pasada y 91,6 del ajuste de la línea 2— y ese techo lo fijó el build de B12
 * en esta misma
 * máquina y en este mismo worktree, así que las dos cifras son comparables: es
 * un A/B, con los dos lados en el mismo entorno, y de ahí sale la línea.
 *
 * Lo que falta es el reparto, y **el reparto no se estima: se declara ausente.**
 * Abajo está el INVENTARIO de lo que entró y lo que salió —derivado del código,
 * no del chunk— y está etiquetado como inventario justamente para que nadie lo
 * lea como una medición. Un inventario dice qué piezas hay; una medición dice
 * cuántos bytes pesa cada una, y para eso hacen falta tantos builds como piezas.
 *
 * Lo que costaría cerrarlo: **seis builds** del mismo árbol apagando una pieza
 * cada vez (los dos niveles, el quinto peso, las dos cadenas de clase, el
 * atributo del CTA, la pieza quieta), más uno de control. En esta máquina
 * son ~3 minutos cada uno. Queda como pendiente con su precio escrito, que es la
 * regla del repo para lo que no se hizo.
 *
 * ═══ EL INVENTARIO — qué entró al chunk de `/v3`, y qué salió ═════════════
 *
 * ⚠ DERIVADO DEL CÓDIGO, NO DEL CHUNK. Ver arriba.
 *
 *   ENTRA
 *   · **El noveno nivel de la escala.** `NIVELES` y `NIVELES_TIPOGRAFICOS`
 *     (`_lib/tipografia.ts`) viajan al cliente porque los importan `Textos.tsx`
 *     y `Titular.tsx`, que son componentes de las ocho secciones. Una fila de
 *     `NIVELES_TIPOGRAFICOS` son seis campos con sus cadenas —`text-display`,
 *     `text-fluido-display`, `--text-display`, `58px`, `titulo`, `display`— más
 *     la entrada de `NIVELES`. Es la pieza más grande del inventario y la que no
 *     tiene forma más barata: es lo que hace que el nivel EXISTA para el
 *     sistema, y sin él la línea 1 sería un valor suelto.
 *   · **El quinto peso.** `PESOS` y `CLASE_PESO` viajan por la misma puerta.
 *     `liviano` + `'font-liviano'`, dos veces.
 *   · **Las dos cadenas de clase del titular.** 62 y 79 caracteres, literales y
 *     enteras: Tailwind escanea el código fuente y una clase armada por
 *     concatenación no se emite nunca (la regla que `GEOMETRIA` ya declaraba).
 *   · **El atributo `data-registro` del CTA, con su default.** Dos componentes
 *     (`Cta` y `CtaEnlace`), un parámetro con valor por defecto cada uno y un
 *     atributo en el marcado. El CTA es el componente más usado del sistema —26
 *     apariciones— así que el atributo viaja 26 veces al HTML, pero el
 *     **código** de la prop viaja UNA vez.
 *   · **La segunda pieza de P1 en el titular.** Un `CanalDePieza` más en el JSX
 *     del Hero, con sus seis props.
 *
 *   SALE
 *   · **`TextoPorLineas` deja de importarse en el Hero.** No devuelve bytes: el
 *     componente sigue en el chunk porque `quienes-somos` lo usa. Lo que se va
 *     es UNA referencia.
 *   · **La bajada baja de tres renglones a uno.** 138 caracteres menos de cadena
 *     literal en `contenido.ts`, que sí viaja al cliente.
 *   · **El cepillo se va entero.** Su `EtiquetaDeSeccion`, su `MarcaDeSeccion` y
 *     la cadena del `slogan` salen del árbol del Hero.
 *   · **La línea 1 deja de pasar por un canal.** Al volverse la pieza quieta se
 *     va un `CanalDePieza` con sus seis props y queda un `<span>` pelado.
 *
 * Las tres que devuelven son por qué el neto es 706 y no más.
 *
 * ⚠ **Y lo que la SEGUNDA pasada agrega es una sola pieza, la más cara de la
 * lista:** el DÉCIMO nivel (`display-xl`), otra fila de seis campos en la misma
 * tabla que las ocho secciones importan. 91,6 B medidos, y no tiene forma más
 * barata por la misma razón que el noveno: sin la fila, el nivel no existe para
 * el sistema y el 104 sería un valor suelto.
 *
 * ═══ LO QUE ESTA LÍNEA NO CUBRE, Y NO ES UN OLVIDO ════════════════════════
 *
 * **Los dos `.woff2` nuevos —21.352 B— NO entran acá, y no porque convenga.**
 * `s5-peso` mide `conjuntoInicial()`, que son los `<script src>` de la ruta:
 * **sólo JavaScript**. Una fuente no es un chunk de JS y este techo nunca las
 * contó —las dos de S0, 58,23 KiB entre las dos, tampoco están—. Meterlas acá
 * haría que la línea dejara de ser comparable con las siete anteriores.
 *
 * Así que el peso de las fuentes se publica APARTE, en el reporte del sprint y
 * en el manifiesto del script que las produce, con su cifra: 9,94 KiB la cara de
 * display y 10,91 KiB la itálica, contra los 643 KiB del TTF completo. **Que
 * este techo no las mida no significa que no se descarguen**, y el día que
 * alguien quiera un presupuesto de fuentes ése es un instrumento nuevo, no una
 * línea de éste.
 */

/** Los 706 B de desvío que la línea cubre —614 de la primera pasada y 91,6 del
 *  ajuste de la línea 2—, medidos por `s5-peso` sobre este árbol contra el techo
 *  que fijó el build de B12. */
export const DESVIO_DEL_TITULAR_BYTES = 706

/**
 * El inventario de piezas, para que el reporte no lo transcriba y para que se
 * pueda contar. **Sin bytes por pieza a propósito**: ver el docblock.
 */
export interface PiezaDelTitular {
  readonly pieza: string
  readonly puerta: string
  readonly signo: 'entra' | 'sale'
}

export const INVENTARIO_DEL_TITULAR: readonly PiezaDelTitular[] = [
  {
    pieza: 'el noveno nivel de la escala (`display`), con su fila de seis campos',
    puerta: '`_lib/tipografia.ts`, que importan `Textos.tsx` y `Titular.tsx`',
    signo: 'entra',
  },
  {
    pieza: 'el quinto peso (`liviano` → `font-liviano`), en `PESOS` y en `CLASE_PESO`',
    puerta: '`_lib/tipografia.ts`, la misma puerta',
    signo: 'entra',
  },
  {
    pieza: 'las dos cadenas de clase del titular, literales y enteras (62 y 79 caracteres)',
    puerta: '`_secciones/hero/geometria.ts`',
    signo: 'entra',
  },
  {
    pieza: 'el atributo `data-registro` del CTA con su default, en los dos componentes',
    puerta: '`_componentes/chrome/Cta.tsx`',
    signo: 'entra',
  },
  {
    pieza: 'el DÉCIMO nivel (`display-xl`), otra fila de seis campos — los 91,6 B de la segunda pasada',
    puerta: '`_lib/tipografia.ts`, la misma puerta',
    signo: 'entra',
  },
  {
    pieza: 'la bajada, que baja de tres renglones a uno: 138 caracteres menos',
    puerta: '`_secciones/hero/contenido.ts`',
    signo: 'sale',
  },
  {
    pieza: 'el cepillo entero: su `EtiquetaDeSeccion`, su `MarcaDeSeccion` y la cadena del `slogan`',
    puerta: '`_secciones/hero/Hero.tsx` y `contenido.ts`',
    signo: 'sale',
  },
  {
    pieza: 'la línea 1, que al volverse la pieza quieta deja de pasar por un `CanalDePieza`',
    puerta: '`_secciones/hero/Hero.tsx`',
    signo: 'sale',
  },
]

/** Lo que costaría cerrar el reparto por pieza, escrito para que el pendiente
 *  tenga precio y no sea una intención. */
export const BUILDS_QUE_FALTAN_PARA_EL_REPARTO = 7

// ═══════════════════════════════════════════════════════════════════════════
// ✅ LA PROPUESTA — APLICADA en la parada de PESO-1. El humano la aprobó.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * **APLICADA: `MONTAJE_DEL_TITULAR_KIB` de 0,69 a 0,70.** El texto de abajo es
 * el de la propuesta, INTACTO, porque el criterio con el que se aprobó es lo que
 * hay que poder leer después. Lo único que cambió es el estado.
 *
 * ⚠ **Y una consecuencia que la propuesta no prometía:** subir esta línea da
 * **+10,24 B de techo** y el lane estaba **12,4 B arriba**. No alcanza por 2,2 B.
 * Eso NO es un defecto de esta propuesta —habla del aire de SU línea, que era
 * 0,6 B y ahora es 10,8—: el excedente lo puso otro sprint, y su medición está
 * en `s5-presupuesto-recibos-de-tapado.ts`.
 *
 * La razón, en una línea: **con 0,69 el aire queda en 0,6 B —más chico que el
 * ruido de redondeo del propio build— y con 0,70 queda en 10,8 B, el mismo
 * orden que las dos líneas anteriores (B11 dejó 8,6 y B12 dejó 8,2).**
 *
 * ── Por qué salió tan justo DOS VECES, y por qué no es un error de método ─
 *
 * La convención de B8, B10, B11 y B12 es **el centésimo de arriba**: se divide
 * el desvío por 1024 y se redondea hacia arriba. En la primera pasada dio
 * 614 / 1024 = 0,5996 → 0,60, con 0,4 B de aire; en la segunda da 706 / 1024 =
 * 0,6895 → 0,69, con 0,6 B. No hay nada mal en la cuenta: es que las dos cifras
 * cayeron a menos de un byte de un límite de centésimo, dos veces seguidas. Las
 * líneas anteriores tuvieron la suerte al revés y por eso su aire cayó en la
 * banda de 6 a 10 B sin que nadie lo eligiera.
 *
 * ⚠ **Y la segunda vez tuvo consecuencia:** los 0,4 B de aire de la primera
 * pasada no alcanzaron para el ajuste de la línea 2, así que la línea hubo que
 * volver a moverla. Es exactamente el modo de falla que esta propuesta describe.
 *
 * Lo que la propuesta cambia NO es la convención: es reconocer que **el aire es
 * la parte útil del redondeo** y que un aire de 0,4 B no cumple su función. Un
 * byte de producto, una comilla que el minificador decida escribir distinto, o
 * la misma medición corrida en otra máquina, ponen `s5-peso` en rojo sin que
 * nadie haya agregado nada.
 *
 * ── Qué NO propone ────────────────────────────────────────────────────────
 *
 * **No propone subir el techo de 60.** Sigue intacto: lo que se mueve es la
 * línea con nombre de ESTE sprint, que es revocable sola. Y no propone redondear
 * hacia arriba «por las dudas» en las próximas: el disparador es haber caído
 * abajo del umbral de abajo, y queda escrito.
 *
 * ── El costo, dicho ───────────────────────────────────────────────────────
 *
 * Son **10,2 B más de techo** de los que el hilo usa. Es deuda de presupuesto
 * y se declara como tal: el que venga después los ve en esta cuenta, no en un
 * margen invisible.
 */
export const PROPUESTA_DEL_TITULAR_KIB = 0.70

/** El umbral abajo del cual un aire deja de cumplir su función. Sale de las dos
 *  líneas anteriores —B11 dejó 8,6 B y B12 dejó 8,2— redondeado para abajo. */
export const AIRE_MINIMO_UTIL_BYTES = 8

/** El aire que deja una línea declarada, en bytes. */
export const aireDe = (kib: number): number => kib * 1024 - DESVIO_DEL_TITULAR_BYTES
