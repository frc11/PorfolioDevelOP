/**
 * CÓMO SE CONSUME UN PATRÓN DE MOTION EN UNA SECCIÓN — y su variante sin motion.
 *
 * ── Qué se consume y qué se escribe, con la línea exacta ──────────────────
 *
 * El SISTEMA de motion vive en `_lib/motion/` y **no se borra nunca**: las seis
 * curvas, la traducción a CSS real, el cronograma, las anclas, el fotograma, el
 * motor de progreso y el divisor de líneas. Este lane lo consume entero.
 *
 * La GLUE de React que S2 construyó vive en `motion/_componentes/`, que el
 * propio reporte de S2 marca como **deuda con fecha de baja** (la ruta de
 * demostración). De ahí se consumen tres piezas que no tienen ninguna
 * dependencia del demo —`Pieza`, `Piezas`, `LineasDeTexto`— y **no** se consume
 * `BloqueDePatron`, por dos acoplamientos concretos:
 *
 *   · toma un objeto `Ajustes` que son las perillas de la mesa de calibración;
 *   · le escribe al bloque un `min-height` sacado de `altoDelBloqueSvh`, que es
 *     geometría del INSTRUMENTO —cuánto scroll gasta una demostración— y no del
 *     sitio. En una sección eso impondría 50svh a cada bloque de P2.
 *
 * Por eso el bloque medido de este lane es propio (`Bloque.tsx`, unas cincuenta
 * líneas) y usa el mismo hook del sistema. **Queda reportado como hallazgo:** la
 * mitad reutilizable de `BloqueDePatron` está enredada con geometría de demo, y
 * el día que la ruta de demostración se borre, lo que sobrevive es este bloque
 * más el traslado de `Pieza`, `Piezas` y `LineasDeTexto` a `_lib/motion/`.
 *
 * ── Los valores son los MEDIDOS, sin perillas ─────────────────────────────
 *
 * `specDe` del demo multiplica duración y escalonado por los factores de la
 * mesa y puede forzar una curva. Acá no hay perillas: la sección corre en lo
 * medido. La calibración fina la hace el ojo sobre la mesa, no sobre el sitio.
 *
 * ── ⚠️ B4-A · QUÉ SE FUE DE ACÁ, Y POR QUÉ ERA UNA FUGA DE LA COMPUERTA ───
 *
 * Este módulo tenía DOS cosas de naturaleza distinta: lo que el árbol QUIETO
 * consume —`deberiaAnimar`, que resuelve la compuerta, y `USOS_DECLARADOS`, el
 * padrón— y **la glue del bloque ANIMADO**: `ANCLA_DEL_PIN`, `cronogramaDe`,
 * `especificacionDe` e `inerciaDe`, que sólo usa `coreografia-animada.tsx`.
 *
 * Mezcladas, la glue viajaba en la carga inicial de `/v3` porque el módulo
 * entero entra por `CompuertaDelHome` y por `registro.ts`: **503 B medidos sobre
 * el chunk de la página del build** —`{declarado:"top top"…}`, la cuenta del
 * cronograma y la especificación de pieza— del lado equivocado de la compuerta
 * de 1025. No lo vio ningún instrumento: `s7-compuerta` busca las huellas del
 * SISTEMA de motion (`_lib/motion/`) y esto es del CONTRATO.
 *
 * La glue se fue a `bloqueAnimado.ts`, que sólo importa el módulo perezoso. El
 * corte llegada/salida de un patrón con tramos se fue a `asentamiento.ts`, con
 * la primitiva que lo consume. Acá queda lo que el árbol quieto necesita.
 */


/**
 * LA COMPUERTA DE ESTE LANE — pura, para poder afirmar la tabla de verdad sin
 * montar React.
 *
 * | arriba de 1025 | prefiere menos movimiento | anima |
 * |---|---|---|
 * | sí | no | **sí** |
 * | no | no | no |
 * | sí | sí | no |
 * | no | sí | no |
 *
 * ⚠️ Coincide hoy, fila por fila, con `deberiaMontarseElCursor` de `_lib/cursor.ts`.
 * **No se importa aquélla**: es la política del cursor y podría cambiar por
 * razones del cursor —táctil, por ejemplo— arrastrando a las secciones sin que
 * nadie lo pida. El invariante afirma la coincidencia en vez de compartir la
 * implementación: si un día dejan de coincidir, se va a ver, y va a ser una
 * decisión y no un efecto colateral.
 *
 * Las dos filas negativas por sí solas no prueban nada: una compuerta que
 * devolviera `false` siempre las pasaría. Por eso el invariante lleva los dos
 * controles —que existe un caso que SÍ anima, y que el ancho por sí solo puede
 * negarla—, que son los mismos que S3 escribió para el cursor.
 */
export function deberiaAnimar(
  arribaDelUmbral: boolean,
  prefiereMenosMovimiento: boolean,
): boolean {
  if (!arribaDelUmbral) return false
  if (prefiereMenosMovimiento) return false
  return true
}

/**
 * Los nueve patrones que este lane puede consumir, por id, con la razón de su
 * uso. Es un padrón: un patrón que una sección use y no esté acá hace fallar la
 * comprobación, y agregarlo obliga a escribir para qué.
 *
 * La instrucción asigna los patrones sección por sección; esta tabla es esa
 * asignación, en un lugar donde un instrumento la puede recorrer.
 */
export interface UsoDePatron {
  readonly patron: string
  readonly seccion: string
  readonly para: string
}

export const USOS_DECLARADOS: readonly UsoDePatron[] = [
  { patron: 'P2', seccion: 'servicios', para: 'las filas de la secuencia — 60 de sus 77 instancias están en esta página' },
  { patron: 'P3', seccion: 'servicios', para: 'el resaltado progresivo del párrafo, palabra por palabra' },
  { patron: 'P4', seccion: 'servicios', para: 'la lista de cada servicio, ítem por ítem, muy frenada' },
  { patron: 'P1', seccion: 'tu-panel', para: 'el titular, línea por línea' },
  { patron: 'P2', seccion: 'tu-panel', para: 'los bloques' },
  { patron: 'P4', seccion: 'tu-panel', para: 'la lista de capacidades' },
  { patron: 'P1', seccion: 'por-que-develop', para: 'el titular, línea por línea' },
  { patron: 'P5', seccion: 'por-que-develop', para: 'las piezas que aparecen — uno de los pocos usos que el sistema tiene' },
  { patron: 'P1', seccion: 'cierre', para: 'el titular de cierre' },
  { patron: 'P2', seccion: 'cierre', para: 'las columnas del pie, con escalonado' },
]
