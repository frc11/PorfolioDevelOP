/**
 * ⚠️ EL RECIBO DE LA LLAVE — lo que pesa el contenido inventado de B12 §4, y
 * por qué NO es un montaje del lane.
 *
 * ── La diferencia con los otros cuatro recibos, y es toda la razón ────────
 *
 * `s5-presupuesto-recibos*.ts` declaran MONTAJES: producto que se construyó y
 * que se queda. Esto no. Esto es **andamio**: veinte casillas de contenido falso
 * que existen para que el dueño del proyecto pueda mirar el sitio poblado antes
 * de que exista el contenido real, y que se van con `CONTENIDO_INVENTADO`.
 *
 * Por eso va en su propia línea, **fuera de `MONTAJES_DECLARADOS_KIB`**: el
 * techo del lane —60 del original más los montajes con nombre— no se movió ni un
 * byte por §4, y se puede seguir leyendo solo. La instrucción lo pide con esas
 * palabras: *«el peso del contenido de mentira se declara como PESO DE LA LLAVE,
 * aparte del montaje de B12… No subas el techo.»*
 *
 * ── ⚠️ LA CORRECCIÓN QUE HAY QUE LEER: APAGAR LA LLAVE DEVUELVE 0 BYTES ───
 *
 * La instrucción dice *«porque se va cuando la llave se apaga»*, y **eso, medido,
 * no es cierto — y se publica en vez de taparse.** El A/B es del mismo árbol,
 * mismo entorno, misma orden, cambiando UNA cosa:
 *
 *     `CONTENIDO_INVENTADO = true`    71.325 B de carga inicial propia
 *     `CONTENIDO_INVENTADO = false`   71.325 B — la MISMA cifra, al byte
 *
 * La razón es del empaquetador y no del diseño: `INVENTOS` es un objeto en
 * tiempo de ejecución, así que sus veinte cadenas viajan en el chunk **aunque
 * `conLlave` devuelva siempre la otra cara**. Ningún minificador puede borrar
 * una propiedad de un objeto que alguien importa.
 *
 * Lo que la llave apagada SÍ devuelve es la pantalla: los marcadores vuelven, la
 * franja desaparece y el build de producción pasa. **Lo que devuelve los bytes es
 * BORRAR LAS VEINTE ENTRADAS de `_contrato/inventado.ts`**, que es una edición en
 * un archivo, a la vista, y está medida abajo: 1.064 B.
 *
 * ── El método, y por qué es el mismo de B8 y del recibo de B12 ────────────
 *
 * Cada renglón se midió **apagando su pieza en el árbol de trabajo sólo durante
 * la medición y restaurándola byte a byte**, con el SHA-1 antes y después. Los
 * dos builds son del mismo árbol, mismo entorno y misma orden
 * (`CIRCLE_NODE_TOTAL=2`, `--max-old-space-size=6144`), a `.next` y a
 * `.next-b12llave`.
 *
 *     inventado.ts    91f1dc02…   antes y después
 *     layout.tsx      2f2cb8cc…   antes y después
 *     medios.tsx      4dd60a16…   antes y después
 *     QuienesSomos    f80d74ba…   ·  TuPanel 1303f60c…  ·  ContenidoDeServicio 2764fd87…
 */

export interface ReciboDeLaLlave {
  /** Qué se apagó para medir. */
  readonly pieza: string
  /** Bytes que agrega a la carga inicial de `/v3`, medidos A/B. */
  readonly bytes: number
  /** Qué se pierde si se saca, y qué hace falta para recuperar los bytes. */
  readonly nota: string
}

/**
 * ⚠️ **EL REPARTO, Y LA NOTICIA ES DÓNDE ESTÁ EL PESO.** El texto inventado —lo
 * que uno diría que es «el contenido de mentira»— es la CUARTA parte. Lo que
 * pesa es la maquinaria que lo hace reversible y comprobable: las dos caras de
 * cada casilla, los veinte `conLlave` y el tercer estado del marco de medio.
 *
 * Es el precio de que esto se pueda apagar. Escribir `23` a mano adentro de
 * `contenido.ts` habría costado los 1.064 B solos — y habría sido exactamente la
 * deuda que develOP ya tiene publicada.
 */
export const RECIBOS_DE_LA_LLAVE: readonly ReciboDeLaLlave[] = [
  {
    pieza:
      'LA MAQUINARIA · `_contrato/inventado.ts` (las 20 casillas con su `marcador` y su `pedido`, `conLlave`) + `_contrato/llave.ts` + los 20 usos en los seis `contenido.ts`',
    bytes: 2422,
    nota:
      'es el resto, y sale por diferencia: 4.303 B totales menos los tres renglones medidos. Lo que compra es lo único que hace legítimo a §4 — que cada mentira tenga escrito a qué marcador vuelve, que ninguna sección pueda escribir la suya, y que un instrumento pueda enumerarlas. Sin esto, «apagar» sería buscar y reemplazar a mano.',
  },
  {
    pieza: 'EL TEXTO INVENTADO · las 20 cadenas de `mentira`',
    bytes: 1064,
    nota:
      'medido vaciando las veinte (`mentira: \'\'`) y restaurando el archivo byte a byte: 71.325 B contra 70.261 B. **Es lo único que se va borrando las entradas**, y es el número que contesta «cuánto pesa el contenido de mentira».',
  },
  {
    pieza:
      'LOS PLACEHOLDERS DE FOTO · el tercer estado de `_contrato/medios.tsx` (`provisional`) y sus tres usos: la foto del equipo, la captura del panel y el póster de Servicios',
    bytes: 817,
    nota:
      'medido sacando la rama y volviendo los tres a `fuente={null}`: 71.325 B contra 70.508 B. ⚠️ **Los archivos NO entran acá**: 355,0 + 339,4 + 339,4 KiB de PNG en `public/` que `s5-peso` no mide, porque mide lo que el lane ESCRIBE en JS. Se publican en el reporte y en `s21-fotos`.',
  },
  {
    pieza: 'LA MARCA EN PANTALLA · `_contrato/MarcaDeLaLlave.tsx` y su montaje en el layout',
    bytes: 0,
    nota:
      '⚠️ **CERO, y no es un redondeo: es un componente de SERVIDOR.** Medido sacándolo del layout y reconstruyendo: 71.325 B contra 71.325 B. El aviso viaja en el HTML y su código no llega al navegador. La propiedad más visible de §4 es la más barata.',
  },
]

/**
 * La suma de los renglones: **4.303 B**.
 *
 * ⚠️ **La medición del árbol FINAL da 4.294,8 B, o sea 8,2 B menos, y la
 * diferencia NO se apropia: se publica.** Cada A/B de arriba se midió apagando
 * una pieza distinta, así que la suma es un MODELO del reparto y la cifra que
 * manda es la del árbol que se commitea. Es la misma disciplina con la que B10
 * publicó los 28,5 B del heredado y con la que el recibo de B12 publicó sus
 * 8,6 B. La línea de `s5-presupuesto.ts` sale de la medición final.
 */
export const PESO_DE_LA_LLAVE_EN_BYTES: number = RECIBOS_DE_LA_LLAVE.reduce((t, r) => t + r.bytes, 0)
