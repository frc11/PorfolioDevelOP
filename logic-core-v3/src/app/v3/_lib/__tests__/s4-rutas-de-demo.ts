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
  {
<<<<<<< HEAD
    ruta: '/v3/secciones-a',
    sprint: 'S5',
    motivo: 'las secciones 1 a 4 en orden, con sus superficies — se borra al componer el home',
=======
    ruta: '/v3/secciones-b',
    sprint: 'S6',
    motivo: 'las secciones 5 a 8, para juzgarlas antes de componer el home',
>>>>>>> rediseno/secciones-b
  },
]

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
  ].join('\n')
}
