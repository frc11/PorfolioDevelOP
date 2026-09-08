/**
 * B7 · FRENTE C — EL SELLO DE CORRIDA, Y POR QUÉ EXISTE.
 *
 * ── El defecto que lo obliga, con su número ────────────────────────────────
 *
 * `c-contraste.ts` escribe DOS cosas: un JSON versionado en
 * `docs/rediseno/outputs/b7/` con la **geometría** (las cajas de texto, elemento
 * por elemento) y unos PNG en `os.tmpdir()` con los **píxeles** (la máscara y el
 * fondo). `c-palancas.ts` y `c-mapa.ts` vuelven a leer las dos cosas para
 * re-derivar el contraste con otra tinta o con otro umbral.
 *
 * Los PNG **se pisan en cada corrida y no llevan identidad**. Así que correr
 * `c-palancas antes` con el tmpdir del «después» adentro no falla, no advierte,
 * y publica una quimera: **la caja del antes sobre los píxeles del después.**
 * Medido: el agregado cae de 22.387 a 16.777 píxeles de glifo —la diferencia,
 * 5.610, es exactamente el glifo del testimonio, cuya caja del «antes» aterriza
 * en papel en blanco en la máscara del «después»— y tres de los cinco techos
 * cambian sin que nada avise: 16,70 % → 7,77 %, 24,02 % → 16,22 %,
 * 77,08 % → 85,07 %. El cuarto coincide por casualidad, que es lo peor de todo:
 * **hace que la corrida corrupta PAREZCA una reproducción.**
 *
 * ── La regla que sale ─────────────────────────────────────────────────────
 *
 * **Una medición que se parte en dos artefactos tiene que poder demostrar que
 * los dos son de la misma corrida.** No alcanza con que el que la corre se
 * acuerde: el modo de falla es silencioso, y el silencio es el problema. Acá el
 * sello viaja en el JSON y en un manifiesto al lado de los PNG, y el consumidor
 * **tira** en vez de publicar.
 *
 * El sello no es un reloj: es el **contenido**. Nombre del asunto, la lista de
 * archivos y su tamaño en bytes. Dos corridas que produjeran píxel por píxel lo
 * mismo tendrían el mismo sello, y eso es correcto — lo que se quiere excluir no
 * es «otra corrida» sino «otros píxeles».
 */

import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

/** El nombre del manifiesto adentro de la carpeta de capturas. */
export const MANIFIESTO = 'c-sello.json'

export interface Sello {
  readonly asunto: string
  readonly archivos: number
  readonly bytes: number
  readonly huella: string
}

/** El sello del CONTENIDO de una carpeta de capturas. Nada de relojes. */
export function sellarCarpeta(carpeta: string, asunto: string): Sello {
  const nombres = readdirSync(carpeta)
    .filter((n) => n.endsWith('.png'))
    .sort()
  const hash = createHash('sha256')
  let bytes = 0
  for (const n of nombres) {
    const b = statSync(path.join(carpeta, n)).size
    bytes += b
    hash.update(`${n}:${b}\n`)
  }
  const sello: Sello = {
    asunto,
    archivos: nombres.length,
    bytes,
    huella: hash.digest('hex').slice(0, 16),
  }
  writeFileSync(path.join(carpeta, MANIFIESTO), `${JSON.stringify(sello, null, 2)}\n`, 'utf8')
  return sello
}

/**
 * ⚠️ **TIRA.** Es la mitad que faltaba: sin esto el consumidor publica la
 * quimera. El mensaje dice exactamente qué no coincide, porque el que lo lea
 * probablemente esté a punto de creerle a un número.
 */
export function exigirElSello(carpeta: string, esperado: Sello | undefined, contexto: string): void {
  if (esperado === undefined) {
    throw new Error(
      `${contexto}: el JSON no trae sello de corrida. Fue producido por una versión anterior del ` +
        'instrumento, cuando los píxeles y la geometría no se podían atar. Volvé a correr `c-contraste.ts`, ' +
        'o publicá esas cifras como NO re-derivables — que es lo que son.',
    )
  }
  const ruta = path.join(carpeta, MANIFIESTO)
  if (!existsSync(ruta)) {
    throw new Error(
      `${contexto}: no hay manifiesto en ${carpeta}. Los PNG que están ahí no se pueden atribuir a ` +
        `la corrida «${esperado.asunto}» del JSON, así que cualquier cifra derivada de ellos sería una quimera.`,
    )
  }
  const actual = JSON.parse(readFileSync(ruta, 'utf8')) as Sello
  if (actual.huella !== esperado.huella) {
    throw new Error(
      `${contexto}: los píxeles NO son los de este JSON.\n` +
        `  JSON     → asunto «${esperado.asunto}» · ${esperado.archivos} PNG · ${esperado.bytes} B · ${esperado.huella}\n` +
        `  capturas → asunto «${actual.asunto}» · ${actual.archivos} PNG · ${actual.bytes} B · ${actual.huella}\n` +
        '  Volvé a correr `c-contraste.ts` con el mismo sufijo antes de derivar nada.',
    )
  }
}
