/**
 * DÓNDE SE GUARDA TODO — la ruta de una captura, derivada y no escrita.
 *
 * ── Por qué esto es código y no una convención en un `.md` ────────────────
 *
 * Porque tres frentes escriben en paralelo y una convención que se lee no es una
 * convención que se cumple. B1 y B2 dejaron sus capturas con dos formas
 * distintas de nombre —`<seccion>-<ancho>-<antes|despues>.png` en `b1/` y `b2/`,
 * y nombres libres en `b3/`— y el índice de cada bloque hubo que armarlo a ojo.
 *
 * Acá la ruta la produce una función que **valida sus tres partes contra listas
 * cerradas**: un frente no puede inventar un perfil, y una captura de un frente
 * no puede caer en la carpeta de otro. El índice para el reporte se genera
 * leyendo el disco, así que no puede prometer una captura que no existe.
 *
 * ── La forma ──────────────────────────────────────────────────────────────
 *
 *     docs/rediseno/capturas/b4/<frente>/<perfil>-<asunto>.png
 *
 * `<frente>` es `a`, `b` o `c`. `<perfil>` es el `id` de `perfiles.ts`.
 * `<asunto>` es el `id` de una de las ocho secciones, o uno de los asuntos
 * declarados abajo para lo que no es una sección.
 */

import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'

import { PERFILES } from './perfiles'

export const RAIZ_DE_CAPTURAS = 'docs/rediseno/capturas/b4'

export type Frente = 'a' | 'b' | 'c'
export const FRENTES: readonly Frente[] = ['a', 'b', 'c']

/**
 * Los `id` de las ocho secciones, copiados de `_lib/secciones.ts`.
 *
 * ⚠️ Se copian en vez de importarse **a propósito**: `secciones.ts` es un módulo
 * del árbol de `/v3` y este banco es un instrumento que corre en Node sobre el
 * repo. `banco.invariant.ts` afirma que las dos listas coinciden, así que la
 * copia no puede envejecer en silencio — que es la única razón por la que una
 * copia es aceptable.
 */
export const SECCIONES: readonly string[] = [
  'hero',
  'quienes-somos',
  'numeros',
  'trabajos',
  'servicios',
  'tu-panel',
  'por-que-develop',
  'cierre',
]

/**
 * Lo que se captura y no es una sección. Cada uno con su motivo, porque un
 * asunto sin motivo es un archivo suelto que nadie sabe si mirar.
 */
export const ASUNTOS: readonly { readonly id: string; readonly motivo: string }[] = [
  { id: 'documento', motivo: 'la página entera de un tirón (`fullPage`), para ver el recorrido completo.' },
  { id: 'tipografia', motivo: 'la ruta `/v3/tipografia` con sus cuatro marcos.' },
  { id: 'tipografia-muestra', motivo: 'la ruta `/v3/tipografia/muestra` sola, sin los marcos.' },
  { id: 'reducido', motivo: '`prefers-reduced-motion: reduce` puesto.' },
  { id: 'ancla', motivo: 'dónde aterriza un ancla del pie, con la pastilla a la vista.' },
  { id: 'desborde', motivo: 'un desborde horizontal, con la barra de scroll a la vista.' },
  { id: 'escena', motivo: 'un cuadro del recorrido de la escena, por `Page.captureScreenshot`.' },
]

export function rutaDeCaptura(frente: Frente, perfil: string, asunto: string): string {
  if (!FRENTES.includes(frente)) throw new Error(`frente desconocido: ${frente}`)
  if (!PERFILES.some((p) => p.id === perfil)) throw new Error(`perfil desconocido: ${perfil}`)
  const conocido = SECCIONES.includes(asunto) || ASUNTOS.some((a) => asunto.startsWith(a.id))
  if (!conocido) throw new Error(`asunto desconocido: ${asunto}`)
  return `${RAIZ_DE_CAPTURAS}/${frente}/${perfil}-${asunto}.png`
}

export interface EntradaDelIndice {
  readonly frente: Frente
  readonly perfil: string
  readonly asunto: string
  readonly ruta: string
  readonly bytes: number
}

/**
 * El índice, leyendo el disco. Devuelve lo que HAY, no lo que se prometió.
 *
 * ⚠️ Un archivo que no respeta la forma no se saltea en silencio: se devuelve
 * con `perfil` y `asunto` en `'?'`, para que el reporte lo muestre como lo que
 * es —una captura huérfana— en vez de esconderla.
 */
export function indiceDeCapturas(raiz: string = RAIZ_DE_CAPTURAS): readonly EntradaDelIndice[] {
  const filas: EntradaDelIndice[] = []
  for (const frente of FRENTES) {
    const carpeta = path.join(raiz, frente)
    let nombres: string[]
    try {
      nombres = readdirSync(carpeta)
    } catch {
      continue
    }
    for (const nombre of nombres.sort()) {
      if (!nombre.endsWith('.png')) continue
      const ruta = `${raiz}/${frente}/${nombre}`
      const base = nombre.slice(0, -4)
      const perfil = PERFILES.map((p) => p.id).find((id) => base.startsWith(`${id}-`))
      filas.push({
        frente,
        perfil: perfil ?? '?',
        asunto: perfil === undefined ? '?' : base.slice(perfil.length + 1),
        ruta,
        bytes: statSync(path.join(carpeta, nombre)).size,
      })
    }
  }
  return filas
}

/** El índice como tabla de Markdown, que es como entra al reporte. */
export function indiceComoTabla(filas: readonly EntradaDelIndice[]): string {
  const cabecera = '| frente | perfil | asunto | archivo | KiB |\n|---|---|---|---|---|'
  if (filas.length === 0) return `${cabecera}\n| — | — | — | **ninguna captura** | — |`
  const cuerpo = filas
    .map((f) => `| ${f.frente} | ${f.perfil} | ${f.asunto} | \`${f.ruta}\` | ${(f.bytes / 1024).toFixed(1)} |`)
    .join('\n')
  return `${cabecera}\n${cuerpo}`
}
