/**
 * LA CAMINATA DEL GRAFO DE MÓDULOS — quién viaja en la carga inicial de `/v3`.
 *
 * ⚠ **NO ES UN ESCÁNER NUEVO.** `clausuraPorValor` no lee fuente por su cuenta:
 * usa `sinComentarios`, `especificadoresDe` y `resolverEspecificador` de
 * `soporte.ts`, que son los tres que el barrido de SITIO-S8 ya corría. Lo único
 * que agrega es el recorrido del grafo y un interruptor para los `import()`
 * diferidos.
 *
 * ── Por qué está separado de `s9-soporte.ts` ──────────────────────────────
 *
 * No es una partición por tamaño. Aquél es aritmética pura sobre tablas del
 * repo; éste **lee el disco**. Mezclarlos obligaría a importar `node:fs` para
 * medir un ritmo, y haría que un cambio en el árbol de archivos pudiera romper
 * una comprobación de números.
 *
 * ── Qué se afirma con esto, en una línea ──────────────────────────────────
 *
 * Que abajo de 1025 el mapeo no se monta: la compuerta de
 * `EscenarioCompuerta.tsx` pide la escena con un `import()` diferido, así que
 * ningún módulo alcanzable desde `layout.tsx` y `page.tsx` por imports estáticos
 * de valor llega a `recorrido.ts` ni a `anclaje.ts`. **Se verifica sobre el
 * FUENTE**, que es lo que permite correrlo sin build.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { RAIZ, especificadoresDe, resolverEspecificador, sinComentarios } from './soporte'

// ── La caminata del grafo de módulos ────────────────────────────────────────

/** Los dos módulos que el navegador pide al abrir `/v3`, y de los que se parte. */
export const ENTRADAS_DE_V3: readonly string[] = ['src/app/v3/layout.tsx', 'src/app/v3/page.tsx']

/** Una ruta del repo, absoluta. Las claves de la clausura son absolutas. */
export function enRaiz(relativo: string): string {
  return path.join(RAIZ, relativo)
}

export const RUTA_RECORRIDO = enRaiz('src/app/v3/_lib/escena/recorrido.ts')
export const RUTA_ANCLAJE = enRaiz('src/app/v3/_lib/escena/anclaje.ts')
export const RUTA_COMPUERTA = enRaiz('src/app/v3/_componentes/EscenarioCompuerta.tsx')
export const RUTA_ESCENA = enRaiz('src/app/v3/_lib/escena/EscenaDelHome.tsx')

/**
 * Los módulos alcanzables desde `entradas` siguiendo imports **de valor**.
 *
 * ⚠ **Cómo se apagan los `import()` diferidos, y por qué así.**
 * `especificadoresDe` reconoce un import dinámico por su forma —`import(`—, así
 * que renombrar esa llamada sobre el fuente ya limpio lo saca del conjunto **sin
 * tocar el detector**. Es un reemplazo de una línea en vez de un segundo
 * analizador que tendría que volver a acertar en lo mismo.
 *
 * Los `import type` no cuentan: se borran al compilar y no llegan al bundle. Lo
 * que no es `.ts`/`.tsx` tampoco: un `.css` no arrastra módulos.
 */
export type VeredictoDeLaCompuerta = {
  readonly enLaCarga: number
  readonly conDiferidos: number
  /** ¿Están recorrido.ts, anclaje.ts y EscenaDelHome.tsx en la carga inicial? */
  readonly losTresEnLaCarga: readonly boolean[]
  /** El módulo que ABRE la compuerta sí tiene que estar. */
  readonly compuertaEnLaCarga: boolean
  /** Cruzando el `import()`, los tres tienen que aparecer. */
  readonly losTresConDiferidos: boolean
}

/** La carga inicial de /v3 contra la misma caminata con los diferidos encendidos. */
export function veredictoDeLaCompuerta(): VeredictoDeLaCompuerta {
  const carga = clausuraPorValor(ENTRADAS_DE_V3, false)
  const diferidos = clausuraPorValor(ENTRADAS_DE_V3, true)
  const tres = [RUTA_RECORRIDO, RUTA_ANCLAJE, RUTA_ESCENA]
  return {
    enLaCarga: carga.size,
    conDiferidos: diferidos.size,
    losTresEnLaCarga: tres.map((r) => carga.has(r)),
    compuertaEnLaCarga: carga.has(RUTA_COMPUERTA),
    losTresConDiferidos: tres.every((r) => diferidos.has(r)),
  }
}

export function clausuraPorValor(entradas: readonly string[], conDiferidos: boolean): Set<string> {
  const vistos = new Set<string>()
  const pendientes = entradas.map(enRaiz)
  while (pendientes.length > 0) {
    const archivo = pendientes.pop()
    if (archivo === undefined || vistos.has(archivo)) continue
    vistos.add(archivo)
    const limpio = sinComentarios(readFileSync(archivo, 'utf8'))
    const fuente = conDiferidos ? limpio : limpio.replace(/\bimport\s*\(/g, 'importDiferido(')
    for (const e of especificadoresDe(fuente)) {
      if (e.soloTipo) continue
      const destino = resolverEspecificador(archivo, e.spec)
      if (destino === null || destino === 'ROTO' || !/\.tsx?$/.test(destino)) continue
      pendientes.push(destino)
    }
  }
  return vistos
}
