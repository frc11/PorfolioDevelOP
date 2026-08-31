/**
 * LAS TABLAS QUE `s9-sentry` PUBLICA sobre el grafo del chunk del SDK.
 *
 * Están acá por la regla de las 300 líneas del repo y por la misma razón que
 * `_lib/escena/__tests__/tablas.ts`: **imprimir una tabla no es afirmar nada**,
 * y mezclar las dos cosas en el mismo archivo hace que cueste ver cuál es cuál.
 * Lo que este módulo hace es formatear números que ya se midieron; quién los
 * afirma es el invariante.
 */

import { BASE_730, BASE_S9 } from '../puertas-de-sentry'
import { kib } from '../../../../app/v3/_lib/__tests__/s3-bundle'
import { cierreTransitivo, pesarModulos, type ModuloDeChunk, type PesoDeModulos } from './grafo-de-chunks'

/** A KiB con una decimal, que es la unidad en la que las bases están escritas. */
export const enKiB = (n: number): number => Number((n / 1024).toFixed(1))

/** Un delta con signo, para que un cero se lea como cero y no como ausencia. */
export const delta = (ahora: number, antes: number): string =>
  `${ahora - antes >= 0 ? '+' : ''}${(ahora - antes).toFixed(1)}`

/** Quién le pide módulos al chunk del SDK, y cuánto arrastra cada uno. */
export function publicarLasPuertas(
  ruta: string,
  mods: ReadonlyMap<string, ModuloDeChunk>,
  puertas: ReadonlyMap<string, ReadonlySet<string>>,
): void {
  console.log(
    `  ${puertas.size} chunks iniciales de ${ruta} le piden módulos al chunk del SDK, con el peso de lo que arrastran:`,
  )
  for (const [chunk, ids] of [...puertas].sort()) {
    const arrastra = pesarModulos(mods, cierreTransitivo(mods, ids))
    console.log(
      `    · ${(chunk.split('/').pop() ?? chunk).padEnd(42)} ${String(ids.size).padStart(2)} módulos` +
        ` → ${kib(arrastra.gzip).padStart(10)} gzip de cierre`,
    )
  }
}

export type CifrasDelTecho = {
  readonly ruta: string
  readonly modulos: number
  readonly puertas: number
  readonly totalGzip: number
  readonly sdkGzip: number
  readonly eager: PesoDeModulos
  readonly diferible: PesoDeModulos
}

/**
 * EL TECHO REAL DE LA SALIDA (a), contra las dos líneas de base.
 *
 * ⚠ Contra §7.30 se publica el desacuerdo con todas las letras, porque ese
 * número es el que decidió que la deferencia valía la pena: **atribuirle al
 * chunk entero lo que se puede diferir sobreestima el lever**, y el orden de
 * magnitud del error cambia la decisión.
 */
export function publicarElTecho(c: CifrasDelTecho): void {
  console.log(
    `  SIGUEN EAGER aunque el cliente los suelte: ${c.eager.modulos} módulos · ` +
      `${kib(c.eager.crudo)} crudo · ${kib(c.eager.gzip)} gzip`,
  )
  console.log(
    `  TECHO DE LO DIFERIBLE:                     ${c.diferible.modulos} módulos · ` +
      `${kib(c.diferible.crudo)} crudo · ${kib(c.diferible.gzip)} gzip`,
  )
  console.log(
    `  ⚠️ contra los ${BASE_730.sdkGzipKiB} KiB gzip que §7.30 le atribuye al chunk entero: el techo real de la ` +
      `salida (a) es ${kib(c.diferible.gzip)}, el ${((c.diferible.gzip / c.sdkGzip) * 100).toFixed(1)}% del chunk. ` +
      `${c.ruta} quedaría en ${((c.totalGzip - c.diferible.gzip) / 1024).toFixed(1)} KiB gzip, no en ${BASE_730.v3SinSdkGzipKiB}.`,
  )
  console.log(
    `  contra la línea de base de SITIO-S9 (${BASE_S9.medidoEn}): ${delta(c.modulos, BASE_S9.modulosDelChunk)} módulos · ` +
      `${delta(c.puertas, BASE_S9.puertasEnLaCargaInicial)} puertas · ` +
      `${delta(enKiB(c.eager.gzip), BASE_S9.siguenEagerGzipKiB)} KiB eager · ` +
      `${delta(enKiB(c.diferible.gzip), BASE_S9.techoDiferibleGzipKiB)} KiB de techo diferible`,
  )
}

/** La salida (b): lo que pesa `browserTracingIntegration`, pesada sola. */
export function publicarLaSalidaB(tracing: PesoDeModulos, sdkGzip: number): void {
  console.log(
    `  SALIDA (b) — sacar tracing: ${kib(tracing.crudo)} crudo · ${kib(tracing.gzip)} gzip — el ` +
      `${((tracing.gzip / sdkGzip) * 100).toFixed(1)}% del chunk, sin costo de captura de errores ` +
      `(${delta(enKiB(tracing.gzip), BASE_S9.tracingGzipKiB)} KiB contra la base de S9). ` +
      'Se prende en `next.config.ts` y cuesta todo el monitoreo de performance: decisión de producto.',
  )
}

/**
 * LO QUE DEVOLVIÓ PODAR EL LOGGING DE DEBUG — en las DOS unidades, y hay que
 * mirar las dos.
 *
 * ⚠ La bandera **funciona** —las guardas `__SENTRY_DEBUG__` pasan de 8 a 0, y
 * eso lo afirma el invariante— y **no devuelve peso**. No es una contradicción:
 * lo que la bandera resuelve es el global, no el cuerpo de los `logger.*`, que
 * el minificador ya trataba como muerto. Publicar sólo el gzip dejaría un
 * «+0,0» que se lee como «no se aplicó»; publicar las dos deja claro que se
 * aplicó y que el lever valía cero.
 */
export function publicarElDebugLogging(sdkCrudo: number, sdkGzip: number): void {
  console.log(
    `  lo que devolvió podar el logging de debug: ${delta(enKiB(sdkCrudo), BASE_S9.sdkCrudoKiB)} KiB crudo y ` +
      `${delta(enKiB(sdkGzip), BASE_S9.sdkGzipKiB)} KiB gzip sobre el chunk del SDK ` +
      `(${kib(sdkGzip)} contra los ${BASE_S9.sdkGzipKiB} de la base con la bandera apagada). ` +
      'La bandera se aplicó —las guardas están en cero— y el lever valía cero.',
  )
}
