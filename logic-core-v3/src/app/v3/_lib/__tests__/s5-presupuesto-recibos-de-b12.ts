/**
 * LOS RECIBOS DE B12 — el montaje del bloque, medido, con su alternativa.
 *
 * ── Por qué existe este archivo, y por qué es el CUARTO ───────────────────
 *
 * El techo de `s5-peso` se mueve de una sola forma en este repo: **el sprint
 * mide su montaje con dos builds del mismo árbol, lo reparte pieza por pieza,
 * escribe qué se perdería si no se subiera, y el humano lo sube en su parada.**
 * B4-A, B6-A, B7, B8, B9 y B11 pasaron por ahí; sus recibos viven en
 * `s5-presupuesto-recibos.ts`, `…-del-merge.ts` y `…-de-b11.ts`. Éste es el de
 * B12, y es el primero que le pide al humano una línea de MÁS DE UN KiB.
 *
 * ── ⚠️ EL MÉTODO, y en qué se diferencia del de B11 ───────────────────────
 *
 * B11 midió su A/B contra el build del árbol INTACTO, hecho **antes** de tocar
 * el producto (`.next-b11`). B12 no lo tiene: cuando el peso se destapó el
 * producto ya estaba cambiado, y el sprint tiene prohibido `checkout`, `stash`
 * y `restore` (regla 1). El método que queda es el que B8 usó para medir la
 * salida barata de `D-B8.3`: **apagar la pieza en el árbol de trabajo SÓLO
 * durante la medición y restaurarla byte a byte, con el SHA-1 antes y después.**
 *
 *     Trabajos.tsx   79484340aa6427271ebebf9e396ecbd06a77ece0   antes y después
 *
 * Los dos builds son del mismo árbol, con el mismo entorno y el mismo comando
 * (`CIRCLE_NODE_TOTAL=2`, `--max-old-space-size=6144`), a `.next` y a
 * `.next-b12`, y la cifra la lee `s5-peso.invariant.ts` con su propia partición.
 *
 * ⚠️ Lo que este método NO puede dar, y se declara: el reparto es por PIEZA
 * APAGABLE, no por línea. Lo que no se puede apagar sin romper la sección —el
 * corte de `piezas.tsx`, el `Envoltorio` que bajó a cada plano, la cabecera sin
 * rótulo, la vuelta del arco, el fondo del formulario— entra en el RESTO, y el
 * resto se publica junto, con lo que lo compone enumerado.
 */

export interface ReciboDeB12 {
  /** Qué se apagó para medir, o qué compone el resto. */
  readonly pieza: string
  /** Bytes crudos que agrega a la carga inicial de `/v3`, medidos A/B. */
  readonly bytes: number
  /** Qué se pierde si no se sube el techo. */
  readonly alternativa: string
}

/**
 * ⚠️ **DOS RENGLONES PIDEN TECHO Y EL RESTO DEL BLOQUE DEVUELVE BYTES.** Es el
 * hallazgo del reparto y conviene leerlo así:
 *
 *     todo B12                63,8 KiB escritos   **−1.384,4 B de aire**
 *     sin la gota             62,3 KiB escritos   **+95,6 B de aire**
 *     sin la gota ni la banda 62,2 KiB escritos   (la banda son 176 B)
 *
 * O sea que §1 (los rótulos afuera), §2 (el pie sin relleno, el Cierre dado
 * vuelta, el fondo del formulario, la tinta de los marcadores a plena), §3.1 (la
 * noche más profunda y el blanco de las motas) y §3.3 (la composición centrada,
 * la portada, el corte de `piezas.tsx`) **juntos DEVUELVEN 87 B** contra los
 * 8,6 B de aire que B11 dejó: sacar dos piezas de texto de las ocho secciones y
 * una `Grilla` del rótulo pesa menos que lo que la portada y el centrado
 * agregan.
 *
 * Lo que se paga son las DOS piezas nuevas, y las dos las pidió el humano por
 * su nombre.
 */
export const RECIBOS_DE_B12: readonly ReciboDeB12[] = [
  {
    pieza:
      'LA GOTA · `trabajos/gota.ts` (el núcleo puro: radio, máscara radial y estado) + `trabajos/CapaDeLaGota.tsx` (la capa que la escribe por cuadro sobre un `ref`) + `VENTANA_DE_LA_GOTA` en `trabajos/geometria.ts`',
    bytes: 1304,
    alternativa:
      'se pierde la transición de entrada a la noche: el pedido textual del humano fue «que la transición de escena a Star Wars tenga un efecto de gota o algo exótico y deluxe». Sin ella, Trabajos entra sólo por la luz —el sol cayendo en una pantalla de scroll, gris 221 → 24,5— sin ninguna forma reconocible que lo marque, que es exactamente lo que B6-A ya había intentado con un velo y el humano rechazó. **Apagarla es DOS líneas** (el `<CapaDeLaGota>` y su import en `Trabajos.tsx`) y devuelve el techo a donde B11 lo dejó, con 95,6 B de aire.',
  },
  {
    pieza:
      'LA BANDA DEL PIE · el velo LOCAL de `cierre/Cierre.tsx` + su regla en `_estilos/pie.css` (el fondo, el relleno y el margen que lo compensa)',
    bytes: 176,
    alternativa:
      'se pierden 16 de los 20 bloques del pie que hoy están en 17,60:1. Sin la banda, con el pie transparente y la tinta dada vuelta, quedaban **8 de 24 bloques bajo AA a 1920 y 8 de 23 a 1440** (peor 2,45:1); con ella quedan **4 y 2, y los seis son el titular**, que es donde el humano quiere que la sala se vea. La palanca la pidió él en la PARADA 1 —«un velo LOCAL en la banda del pie, no en la sección entera»— y es la única de las cuatro medidas que cierra sin tapar la sala. Sacarla es borrar un `<div>` y una regla.',
  },
  {
    pieza: 'LA MEDICIÓN QUE SE DESCARTÓ · envolver la banda en un COMPONENTE con `props` y `cn()` en vez de escribir el `<div>` inline',
    bytes: 0,
    alternativa:
      '⚠️ **NO se aplicó, y cuesta 81 B.** El `<div>` de la banda pasó las 300 líneas de `Cierre.tsx` y la primera salida fue partirlo en `cierre/BandaDelPie.tsx`. El A/B entre dos builds del mismo árbol lo midió: **8,2 B de aire con el `<div>` inline contra −74,8 B con el componente**. Y el segundo intento —mudar el componente a `chrome/Pie.tsx`, un módulo que ya estaba en el grafo— **devolvió exactamente lo mismo**: o sea que el costo NO es la frontera de archivo (B4-A ya había medido que partir con UN consumidor sale gratis) sino la FUNCIÓN con `props` y `cn()`. Lo que se hizo en cambio fue acortar dos docblocks heredados de B1 sin perder una sola cifra. Se publica con 0 B porque no está en el árbol: es lo que NO se pagó.',
  },
  {
    pieza:
      'EL RESTO DEL BLOQUE, junto y NETO: los rótulos afuera de las ocho (−), la cabecera sin número ni nombre (−), el pie sin relleno y el Cierre dado vuelta (−), el fondo del formulario (+), los marcadores a tinta plena (−), la vuelta del arco (+), la portada de Trabajos y el centrado del plano (+), el corte de `piezas.tsx` (+)',
    bytes: -87,
    alternativa:
      'ninguna: es una devolución. Se publica para que la cuenta cierre y para que se lea que el bloque NO engordó por todos lados — engordó por dos piezas nuevas.',
  },
]

/**
 * La suma de los renglones: **1.393 B**.
 *
 * ⚠️ **La medición del árbol FINAL da 1.384,4 B, o sea 8,6 B menos, y la
 * diferencia NO se apropia: se publica.** Cada A/B de arriba se midió sobre un
 * árbol intermedio distinto —la gota se apagó antes de que existiera la banda, y
 * la banda se midió antes de que el CTA entrara adentro— así que la suma de los
 * tres es un MODELO del reparto y la cifra que manda es la del árbol que se
 * commitea. Es la misma disciplina con la que B10 publicó los 28,5 B del
 * heredado sin dárselos a nadie. La línea del techo sale de la medición final,
 * no de esta suma.
 *
 * ⚠️ El humano autorizó **1,28 KiB** en la PARADA 1, con la cifra que había ahí:
 * la gota sola (1.304 B). En la misma parada pidió PROBAR la banda local del pie
 * y dejarla si cerraba —cerró: de 8 bloques bajo AA a 4 y 2—, y la banda son
 * 176 B más. La línea que se declara abajo cubre las dos piezas, y **la
 * diferencia contra lo autorizado está escrita acá y en el reporte**, no
 * escondida en el redondeo.
 */
export const MONTAJE_DE_B12_EN_BYTES: number = RECIBOS_DE_B12.reduce((t, r) => t + r.bytes, 0)

/**
 * ⚠️ **LA MEDICIÓN QUE SE DESCARTÓ, publicada igual (regla 12).**
 *
 * Se probó escribir la suscripción a mano —`useEffect` + `progreso.on('change',
 * …)`— en vez de `useMotionValueEvent`, con la hipótesis de que el hook metía
 * un módulo nuevo de `motion/react` en la carga inicial. **La hipótesis era
 * falsa y el A/B lo dice: la versión a mano pesa 40 B MÁS** (−1.248,4 B de aire
 * contra −1.208,4). El cierre con su arreglo de dependencias minifica peor que
 * la llamada al hook, que ya viaja empaquetada con el resto del sistema. Queda
 * el hook, y la razón está escrita en `CapaDeLaGota.tsx` para que nadie la
 * vuelva a «optimizar».
 */
export const HOOK_A_MANO_CUESTA_MAS_B = 40
