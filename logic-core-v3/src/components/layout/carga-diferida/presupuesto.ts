/**
 * EL PRESUPUESTO DE PESO — el techo y el piso, con su forma de regla 13.
 *
 * Sale de `contrato.ts` en SITIO-S8, cuando re-fijar el techo lo habría cruzado
 * las 300 líneas. No cambia una sola medición: son los mismos datos, en un
 * archivo donde se leen.
 */

/**
 * ⚠️ **EL TECHO SE RE-FIJÓ EN SITIO-S8, Y NO PARA QUE PASE: PARA QUE MIDA ALGO.**
 *
 * Eran «300 KiB gzip de la carga inicial de `/v3`», y ese número **no lo puede
 * cumplir nadie**: el PISO del framework —`rootMainFiles` + `polyfillFiles` de
 * `build-manifest.json`, lo que Next pide en TODA ruta sin que ningún componente
 * lo elija— mide **248,3 KiB gzip**, de los cuales **142,1 son el SDK de
 * navegador de Sentry**, que entra por `src/instrumentation-client.ts` y no es
 * de `/v3` ni del layout. Contra 300, eso deja 51,7 KiB para el chrome entero,
 * los límites de error y la ruta. **Un presupuesto que nadie puede cumplir es un
 * presupuesto que nadie mira.**
 *
 * La forma nueva es la de la regla 13, que es la que el repo ya usa para todo lo
 * demás: **se AFIRMA lo propio y se PUBLICA lo heredado con su dueño.**
 *
 *   · **lo propio** = todo lo que la carga inicial pide POR ENCIMA del piso: el
 *     chrome del layout raíz más lo de `/v3`. Eso sí lo puede mover alguien, y
 *     por eso es lo que se afirma. Hoy mide **129,2 KiB gzip** en 19 archivos.
 *   · **el piso** se publica con su dueño y su número, y no se afirma: ningún
 *     sprint de este track lo puede tocar.
 *
 * El número **no se eligió: se conservó**. Son los mismos 300 del sprint, ahora
 * sobre lo que de verdad depende del código de este repo. Con 129,2 medidos
 * quedan **170,8 KiB de aire**, y eso también es información: dice que el
 * problema del peso NO está en el chrome del layout.
 *
 * ⚠️ **Y la cifra que abre el pendiente:** sin el chunk de Sentry la carga
 * inicial de `/v3` mide **235,3 KiB gzip** — o sea que **el total estaría abajo
 * de los 300 originales**. Medido directo sobre el build; restar las dos cifras
 * ya redondeadas da 235,4, y la buena es la medida. Es el único lever del tamaño
 * del problema y vive fuera de este sprint: queda abierto como ítem propio en §7
 * de `DIRECCION-ESCENA.md`.
 */
export const TECHO_PROPIO_GZIP_KIB = 300

/**
 * El piso del framework, medido sobre el build de la integración. Se PUBLICA con
 * atribución; no se afirma. `sentryGzipKiB` es la parte que lleva el SDK de
 * navegador, identificada por la huella `browserTracingIntegration`.
 */
export const PISO_DEL_FRAMEWORK = {
  archivos: 5,
  crudoKiB: 787.8,
  gzipKiB: 248.3,
  sentryGzipKiB: 142.1,
  deQuien: 'Next (rootMainFiles + polyfillFiles) y el SDK de navegador de Sentry (instrumentation-client.ts)',
} as const

/**
 * ⚠️ **EL CHUNK DEL SDK SE IDENTIFICA POR CONTENIDO, NO POR NOMBRE — SITIO-S10.**
 *
 * Acá vivía `CHUNK_DE_SENTRY = '7149'`, el prefijo del chunk escrito a mano, y
 * `s8-peso.invariant.ts` lo usaba con un `includes()` para publicar «sin Sentry
 * `/v3` mediría X». **Era una fragilidad reportada en §7.30 y no arreglada:** el
 * nombre de un chunk lo elige webpack y cambia con el grafo, así que el día que
 * renumerara, el filtro no habría sacado NADA, la cifra publicada habría pasado a
 * ser el total entero — más alta, o sea peor— y **no habría habido un solo rojo**.
 * Un descuento que falla hacia el lado que no se nota es peor que no tenerlo.
 *
 * El reemplazo identifica el portador por su HUELLA (`browserTracingIntegration`,
 * en `puertas-de-sentry.ts`), que es la misma forma que `s9-sentry.invariant.ts`
 * ya usaba. Y el modo de fallar se da vuelta: **cuando no hay portador, esto
 * devuelve `null` y no la lista entera**, así que el invariante se pone en rojo
 * en vez de publicar el total disfrazado de descuento.
 *
 * Las dos entradas que devuelven `null`, y las dos son la misma clase de mentira:
 * ningún chunk lleva la huella, o el portador que se pasó no está en el conjunto
 * que se está descontando (un chunk de otra ruta, o un nombre inventado).
 */
export function descontarElSdk(
  archivos: readonly string[],
  portador: string | null,
): readonly string[] | null {
  if (portador === null || !archivos.includes(portador)) return null
  return archivos.filter((f) => f !== portador)
}

export interface CifrasDelTecho {
  readonly totalGzip: number
  readonly archivos: number
  readonly pisoGzip: number
  readonly archivosDelPiso: number
  readonly sobreElPisoGzip: number
  /** `null` = no se pudo descontar por huella. Ver `descontarElSdk`. */
  readonly sinSentryGzip: number | null
  readonly faltabaEnLaBase: number
}

/**
 * Imprime el techo con su aritmética a la vista. **No afirma nada**: la
 * afirmación vive en el invariante, y acá está lo que se publica —el piso con su
 * dueño, y la cifra sin Sentry, que es la que abre el pendiente—.
 *
 * Vive afuera del invariante por la razón de siempre en este repo: el archivo
 * cruzaba las 300 líneas y la regla es partir.
 */
export function publicarElTecho(c: CifrasDelTecho): void {
  const kib = (n: number): string => `${(n / 1024).toFixed(1)} KiB`
  const enKiB = (n: number): number => Number((n / 1024).toFixed(1))
  const pctDelTecho = ((PISO_DEL_FRAMEWORK.sentryGzipKiB / TECHO_PROPIO_GZIP_KIB) * 100).toFixed(1)

  console.log(`  /v3 entero: ${kib(c.totalGzip)} gzip · ${c.archivos} archivos`)
  console.log(`    PISO del framework (se publica, no se afirma): ${kib(c.pisoGzip)} gzip en ${c.archivosDelPiso} archivos`)
  console.log(`      de quién: ${PISO_DEL_FRAMEWORK.deQuien}`)
  console.log(
    `      de los cuales ${PISO_DEL_FRAMEWORK.sentryGzipKiB} KiB gzip son el SDK de navegador de Sentry ` +
      `— el ${pctDelTecho}% del techo`,
  )
  console.log(
    `    SOBRE EL PISO (se afirma): ${kib(c.sobreElPisoGzip)} gzip en ${c.archivos - c.archivosDelPiso} ` +
      'archivos — el chrome del layout raíz más lo de /v3',
  )
  console.log(
    c.sinSentryGzip === null
      ? '  ⚠️ NO SE PUDO DESCONTAR el chunk del SDK: ningún archivo de la carga inicial lleva la huella. ' +
          'La cifra «sin Sentry» NO se publica — publicarla sería publicar el total entero con otro nombre.'
      : `  ⚠️ SIN el chunk del SDK de Sentry, /v3 mediría ${kib(c.sinSentryGzip)} gzip: ABAJO de los ` +
          `${TECHO_PROPIO_GZIP_KIB} del techo original. Entra por \`instrumentation-client.ts\`, que no es de ` +
          '/v3 ni del layout: es el único lever de este tamaño y vive fuera de este sprint.',
  )
  console.log(
    `  contra la carga inicial ENTERA, el techo original de ${TECHO_PROPIO_GZIP_KIB} sigue sin alcanzarse: ` +
      `faltan ${(enKiB(c.totalGzip) - TECHO_PROPIO_GZIP_KIB).toFixed(1)} KiB ` +
      `(en la línea de base faltaban ${c.faltabaEnLaBase.toFixed(1)}).`,
  )
  console.log(
    '  NO SE ALCANZA DESDE ESTE FRENTE, y sigue siendo cierto: este frente sólo puede tocar ' +
      '`src/app/layout.tsx`, y ni sacando el chrome entero —que no se puede: dos envoltorios están ' +
      'CONGELADOS y `next/font` no se difiere— la cuenta cierra sola.',
  )
}
