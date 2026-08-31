/**
 * LAS RUTAS DE DEMOSTRACIÓN, Y LA PREDICCIÓN QUE CIERRAN AL BORRARSE.
 *
 * ── Por qué existe este padrón ────────────────────────────────────────────
 *
 * S2 dejó una predicción diferida —el día que se borren `/v3/motion` y
 * `/v3/motion/control-estatico`, el peso heredado de `/v3` tiene que volver
 * solo ±3,4 KiB— y S3 iba camino a dejar la suya con tres rutas más. **Son el
 * mismo fenómeno**: cada ruta nueva agrega su entrada a las estructuras que
 * viajan en chunks COMPARTIDOS con el home, así que una ruta no le cobra a su
 * propia página sino a las que ya existían.
 *
 * Dos predicciones separadas sobre un solo fenómeno se verifican mal: la
 * primera que se cierre deja a la otra sin línea de base. S4 las unifica en
 * UNA, con la lista completa y un solo número.
 *
 * ── La medición, y qué clase de cifra es ──────────────────────────────────
 *
 *   · S1 midió el heredado de `/v3` en **1381,3 KiB crudo · 23 archivos**
 *     (2026-08-28), cuando ninguna de estas cinco rutas existía.
 *   · S2 midió **+3,4 KiB** tras agregar dos → 1,7 KiB por ruta.
 *   · S4 mide **1386,1 KiB · 24 archivos** con las cinco → **+4,8 KiB**, o sea
 *     0,96 KiB por ruta.
 *
 * ⚠️ **No es lineal ni constante, y las dos observaciones lo dicen**: 1,7 y
 * 0,96 KiB por ruta. Es empírica, de dos observaciones, y sirve para el orden
 * de magnitud — no es una ley. Por eso el techo de regresión de abajo está por
 * encima de la PEOR observada, no en el promedio.
 *
 * ⚠️ El mecanismo exacto **no está identificado**. S2 probó que no es la
 * coreografía (cinco huellas ausentes de la carga inicial, con su control
 * positivo) y que el manifiesto de rutas de Sentry explica sólo el 3,5 % de los
 * bytes. Encontrar un mecanismo plausible y dejar de buscar fue un error que S2
 * ya cometió y retractó; acá no se repite. Lo que cierra la pregunta no es una
 * hipótesis: es el borrado.
 */

/** `/v3/control-estatico` NO está en esta lista: es la ruta gemela que
 *  `bundle.invariant.ts` usa como control positivo, ya estaba en la línea de
 *  base de S1, y vive mientras viva ese instrumento. */
export interface RutaDeDemo {
  readonly ruta: string
  readonly sprint: string
  readonly motivo: string
}

export const RUTAS_DE_DEMO: readonly RutaDeDemo[] = [
  { ruta: '/v3/motion', sprint: 'S2', motivo: 'la galería del sistema de motion' },
  { ruta: '/v3/motion/control-estatico', sprint: 'S2', motivo: 'la gemela con import estático, control de la compuerta' },
  { ruta: '/v3/componentes', sprint: 'S3', motivo: 'la galería del chrome' },
  { ruta: '/v3/tipografia', sprint: 'S3', motivo: 'la escala tipográfica' },
  { ruta: '/v3/tipografia/muestra', sprint: 'S3', motivo: 'la muestra de la escala' },
]

/**
 * LAS DOS QUE SE BORRARON, Y QUÉ MIDE SU BORRADO — SITIO-S7.
 *
 * `/v3/secciones-a` (S5) y `/v3/secciones-b` (S6) eran las rutas donde cada
 * lane mostraba sus cuatro secciones para poder juzgarlas. Las dos declaraban su
 * fecha de baja en el propio archivo: **se borran el día que `/v3` componga las
 * ocho**. Ese día llegó.
 *
 * Se dejan escritas acá, y no se borra la constante, porque el borrado es una
 * MEDICIÓN: el padrón pasó de 7 a 5 rutas, así que el heredado de `/v3` tiene
 * que BAJAR. Es una prueba parcial de la predicción del mapa —quedan cinco
 * rutas, así que no la cierra— pero es evidencia gratis, y sin la lista de lo
 * que se borró el delta no se puede atribuir.
 */
export const RUTAS_BORRADAS: readonly RutaDeDemo[] = [
  {
    ruta: '/v3/secciones-a',
    sprint: 'S5',
    motivo: 'las secciones 1 a 4 en orden, con sus superficies — borrada al componer el home',
  },
  {
    ruta: '/v3/secciones-b',
    sprint: 'S6',
    motivo: 'las secciones 5 a 8, para juzgarlas antes de componer el home — borrada al componerlo',
  },
]

/**
 * EL HEREDADO MEDIDO CON LAS SIETE RUTAS, justo antes del borrado.
 *
 * Es la línea de base contra la que se lee el efecto de borrar las dos. Sale de
 * la corrida de `test:s4-heredado` sobre el build del 2026-08-30, con las siete
 * rutas de demo existiendo: **1386,2 KiB crudo en 24 archivos heredados**,
 * sobre un total de 1391,1 KiB · 424,0 KiB gzip en 25 archivos.
 *
 * ⚠ No es un objetivo ni un techo: es una fotografía, y está acá porque la
 * comparación "antes y después" no se puede hacer sin el antes.
 */
export const HEREDADO_CON_SIETE_RUTAS_KIB = 1386.2
export const HEREDADO_CON_SIETE_RUTAS_ARCHIVOS = 24
export const RUTAS_AL_MEDIR_EL_ANTES = 7

/**
 * ═══ LA OBSERVACIÓN DE SITIO-S7 — UNA MEDICIÓN SIN CAUSA ATRIBUIBLE ═══════
 *
 * Al borrar las dos rutas, el heredado de `/v3` **no bajó**:
 *
 *     antes (7 rutas)   1386,2 KiB · 24 archivos
 *     ahora (5 rutas)   1387,0 KiB · 25 archivos
 *     delta             +0,8 KiB · +1 archivo
 *
 * ⚠️ **Esto NO refuta la predicción, y tratarlo como refutación sería un error
 * de método.** Lo único que se puede afirmar es el número. La causa no.
 *
 * Lo que SÍ quedó descartado, porque se midió: que el delta venga de que `/v3`
 * cambió de contenido. El heredado es **1387,0 KiB para las siete rutas de
 * `/v3`**, incluidas las tres que este sprint no tocó, así que es una propiedad
 * del conjunto compartido y no de esta ruta. Eso lo afirma `s7-compuerta`.
 *
 * Lo que NO se puede descartar: **el mismo commit borró dos rutas y compuso el
 * home**. Componer el home cambia el grafo de módulos, que es de donde webpack
 * saca su partición de chunks compartidos. Dos causas posibles entraron juntas,
 * y cuando dos cambios entran juntos y el resultado se mueve, **no se sabe cuál
 * fue** — es la misma trampa en la que cayó §6.1 de `DIRECCION-ESCENA` al
 * atribuirle a una sola variable el mérito de una corrida que llevaba dos.
 *
 * ── EL EXPERIMENTO LIMPIO — una corrida, y es de una línea ────────────────
 *
 * Dos builds que difieran **sólo** en la existencia de las rutas, sobre el
 * árbol de hoy y sin tocar una línea de código:
 *
 *     git stash push -u -m "s4-prediccion"      # nada que guardar: el árbol ya está
 *     # 1. medir el árbol tal como está (5 rutas)
 *     npm run build && npm run test:s4-heredado
 *     # 2. restaurar las dos rutas borradas y volver a medir (7 rutas)
 *     git checkout <commit-de-SITIO-S6> --  *       src/app/v3/secciones-a/page.tsx src/app/v3/secciones-b/page.tsx
 *     npm run build && npm run test:s4-heredado
 *
 * La diferencia entre esas dos cifras **sí** tiene una sola causa. Es una
 * corrida de dos builds, no un sprint: no hay que construir nada.
 *
 * ⚠️ El paso 2 restaura DOS archivos y no revierte el commit. Las secciones
 * viven en `_secciones/` y las rutas viejas ya no compilan tal cual, así que la
 * corrida necesita apuntar sus imports al contrato unificado — cinco líneas, y
 * se descartan al terminar. **No se commitea**: es un experimento.
 *
 * ── Qué NO cierra igual ──────────────────────────────────────────────────
 *
 * Ni ese experimento cierra la predicción del mapa: quedan cinco rutas. Lo que
 * cierra es la pregunta más chica —*¿borrar una ruta devuelve peso heredado?*—
 * que es la que hoy quedó sin respuesta.
 */
export const EXPERIMENTO_LIMPIO_PENDIENTE = true

/** El heredado de `/v3` con CERO rutas de demo. Medido por S1 el 2026-08-28. */
export const HEREDADO_SIN_DEMOS_KIB = 1381.3
export const HEREDADO_SIN_DEMOS_ARCHIVOS = 23

/**
 * El techo de regresión POR RUTA, no un objetivo.
 *
 * Está por encima de la peor observación (1,7 KiB/ruta de S2) con un margen
 * corto. Sirve para que el chrome viejo no engorde en silencio mientras se
 * espera al sprint del reemplazo, y **no depende de cuántas rutas de demo
 * existan hoy**: el presupuesto crece y se achica con la lista. Borrar una ruta
 * baja el techo; agregar una lo sube en 2 KiB y ni un byte más.
 */
export const TECHO_POR_RUTA_KIB = 2.0

/** La tolerancia de la predicción: una ruta de margen. */
export const TOLERANCIA_PREDICCION_KIB = TECHO_POR_RUTA_KIB

/**
 * Lo que tiene que volver al borrar las rutas de demo, **medido con CINCO**.
 *
 * ⚠ El número es de la corrida de S4, cuando la lista tenía cinco entradas. La
 * lista crece —S5 agregó la sexta— y este número **no se extrapola**: las dos
 * observaciones que existen dan 1,7 y 0,96 KiB por ruta, así que multiplicar
 * por seis sería inventar una linealidad que las propias observaciones
 * desmienten. Lo que no cambia es el destino de la predicción: el heredado
 * tiene que volver a `HEREDADO_SIN_DEMOS_KIB`, sea cual sea el camino.
 */
export const RECUPERO_ESPERADO_KIB = 4.8

/** Cuántas rutas había en la lista cuando se midió el recupero de arriba. */
export const RUTAS_AL_MEDIR_EL_RECUPERO = 5

export function techoHeredadoKiB(cuantasDemos: number): number {
  return HEREDADO_SIN_DEMOS_KIB + cuantasDemos * TECHO_POR_RUTA_KIB
}

/** El texto de la predicción, para que el número no viaje sin su lista. */
export function textoDeLaPrediccion(): string {
  const lista = RUTAS_DE_DEMO.map((r) => `${r.ruta} (${r.sprint})`).join(', ')
  return [
    'PREDICCIÓN DEL MAPA — unificada en S4, hereda la de S2.',
    `  rutas    : ${RUTAS_DE_DEMO.length} — ${lista}`,
    `  qué pasa : al borrarlas TODAS, el heredado de /v3 tiene que volver solo a`,
    `             ${HEREDADO_SIN_DEMOS_KIB} KiB crudo (±${TOLERANCIA_PREDICCION_KIB}), sin tocar ninguna otra cosa.`,
    `  medido   : con ${RUTAS_AL_MEDIR_EL_RECUPERO} rutas el recupero fue ${RECUPERO_ESPERADO_KIB} KiB. Con ${RUTAS_DE_DEMO.length} NO está medido, y`,
    `             no se extrapola: las dos observaciones dan 1,7 y 0,96 KiB por ruta.`,
    '  si vuelve: el delta era el costo de existir de N rutas, sea cual sea el',
    '             mecanismo, y la compuerta nunca tuvo nada que ver.',
    '  si NO    : el diagnóstico estaba mal. El sospechoso deja de ser "agregar',
    '             rutas" y pasa a ser algo que estos sprints dejaron en un chunk',
    '             compartido sin que las huellas lo detecten.',
    '  la cierra: el sprint que REEMPLACE al home, que es el que borra estas rutas.',
    '             No hay que construir nada: esta comprobación se activa sola.',
    '  ⚠️ OJO   : el número de arriba está VENCIDO. Se midió el 2026-08-28, cuando el',
    '             layout raíz arrastraba el grupo de chunks de la página del home a',
    '             toda ruta. SITIO-S8 sacó ese arrastre y el heredado quedó ~270 KiB',
    '             por debajo de esa base CON las cinco rutas puestas. Antes de cerrar',
    '             la predicción hay que volver a medir la base, sin rutas de demo y',
    '             con el layout de hoy: si no, se compara contra un mundo que ya no',
    '             existe. Es la misma corrida de dos builds que ya estaba escrita.',
  ].join('\n')
}
