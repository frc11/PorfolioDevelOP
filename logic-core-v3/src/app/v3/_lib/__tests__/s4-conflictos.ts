import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

import { RAIZ } from './s4-corrida'
import { marcadoresDeConflicto } from './s4-paquete'

/**
 * MARCADORES DE CONFLICTO EN TODO EL REPO — el paso que faltaba en `verificar`.
 *
 * ── El agujero, con su historia ───────────────────────────────────────────
 *
 * El merge de `rediseno/motion` dejó marcadores de conflicto adentro de
 * `package.json`, y **`tsc --noEmit` dio exit 0 dos veces sobre ese árbol
 * roto**: no lee `package.json`. S4 tapó ese caso mirando ese archivo.
 *
 * Lo que S4 no tapó es el resto del repo, y este sprint mergeó dos lanes. Un
 * marcador sin resolver adentro de un `.md`, de un `.css` o de un `.json` que
 * nadie importa no rompe el build, no rompe los tipos, **y se commitea**. El
 * archivo que más se toca en un merge no es el único que un merge toca.
 *
 * ── ⚠️ POR QUÉ EXCLUIR `s4-fixtures/` NO ES UNA CONCESIÓN ─────────────────
 *
 * Esa carpeta contiene DOS `package.json` rotos a propósito —uno con un
 * marcador de conflicto y otro con una clave duplicada— y son las entradas
 * equivocadas contra las que se prueba el detector. Escanearlas haría que el
 * gate fallara **contra su propio arnés**: el instrumento se mediría a sí
 * mismo.
 *
 * Es la CUARTA vez que este modo de falla aparece en el proyecto, y todas en
 * sprints distintos: S3 lo encontró al sacar los instrumentos del padrón de
 * archivos escaneados, S6 al partir sus invariantes en módulos de apoyo, y este
 * mismo sprint dos veces más —un docblock que nombraba una huella del sistema
 * de motion, y otro que ejemplificaba el defecto de `cn()` con las clases
 * exactas que el escáner busca—. La regla que queda, escrita para no tener que
 * volver a descubrirla:
 *
 *   **Todo escáner que lee el repo tiene que declarar qué NO mira, y por qué.
 *   Lo que no mira son sus propios controles.** La exclusión se declara con
 *   nombre y motivo —nunca por una heurística de sufijo, que es exactamente
 *   cómo una exclusión se vuelve silenciosa— y hay una comprobación que exige
 *   que lo excluido SIGA teniendo lo que el detector busca. Una exclusión que
 *   deja de ser necesaria y nadie borra es un agujero que parece una decisión.
 */

/** Lo excluido, con nombre y motivo. No hay una heurística. */
export interface Exclusion {
  /** Prefijo de ruta, relativo a la raíz del proyecto, con barras normales. */
  readonly ruta: string
  readonly motivo: string
  /**
   * Si es `true`, el instrumento EXIGE que ahí adentro haya marcadores. Es lo
   * que impide que la exclusión sobreviva a su razón: el día que los controles
   * dejen de tener marcadores, la exclusión falla y hay que borrarla.
   */
  readonly tieneMarcadoresAPropósito: boolean
}

export const EXCLUSIONES: readonly Exclusion[] = [
  {
    ruta: 'src/app/v3/_lib/__tests__/s4-fixtures',
    motivo:
      'los controles positivos del propio detector: un `package.json` con un marcador de ' +
      'conflicto y otro con una clave duplicada. Escanearlos hace fallar el gate contra su arnés.',
    tieneMarcadoresAPropósito: true,
  },
]

/** Lo que no se recorre nunca: no es código del repo. */
const DIRECTORIOS_IGNORADOS: readonly string[] = [
  'node_modules',
  '.git',
  '.next',
  '.next-probe',
  '.next-setter',
  '.next-galeria',
  '.next-s1-control',
  'out',
  'coverage',
  'test-results',
  'playwright-report',
]

/**
 * Las extensiones que se miran. Un binario con tres `<` seguidos no es un
 * conflicto, y leerlo como texto sería ruido garantizado.
 */
const EXTENSIONES = /\.(ts|tsx|js|jsx|mjs|cjs|json|css|md|yml|yaml|html|sql|prisma|toml)$/

export interface HallazgoDeConflicto {
  readonly archivo: string
  readonly detalle: string
}

function recorrer(relativo: string, acumulado: string[]): string[] {
  const completo = path.join(RAIZ, relativo)
  if (!existsSync(completo)) return acumulado
  for (const entrada of readdirSync(completo, { withFileTypes: true })) {
    const hijo = relativo === '' ? entrada.name : `${relativo}/${entrada.name}`
    if (entrada.isDirectory()) {
      if (DIRECTORIOS_IGNORADOS.includes(entrada.name)) continue
      recorrer(hijo, acumulado)
      continue
    }
    if (EXTENSIONES.test(entrada.name)) acumulado.push(hijo)
  }
  return acumulado
}

export function archivosDelRepo(): string[] {
  return recorrer('', []).sort()
}

export function estaExcluido(archivo: string): boolean {
  return EXCLUSIONES.some((e) => archivo === e.ruta || archivo.startsWith(`${e.ruta}/`))
}

/**
 * Los archivos con marcadores de conflicto sin resolver, fuera de lo excluido.
 *
 * Se reutiliza `marcadoresDeConflicto` de `s4-paquete.ts` —el mismo detector
 * que el gate ya corre sobre `package.json`— para que no haya dos definiciones
 * de qué es un marcador.
 */
export function conflictosEnElRepo(archivos = archivosDelRepo()): HallazgoDeConflicto[] {
  const hallazgos: HallazgoDeConflicto[] = []
  for (const archivo of archivos) {
    if (estaExcluido(archivo)) continue
    const completo = path.join(RAIZ, archivo)
    // Un archivo gigante no puede tener un marcador a principio de línea sin ser
    // texto; leerlo entero igual sería el caso patológico de esta función.
    if (statSync(completo).size > 4 * 1024 * 1024) continue
    for (const detalle of marcadoresDeConflicto(readFileSync(completo, 'utf8'))) {
      hallazgos.push({ archivo, detalle })
    }
  }
  return hallazgos
}

/** Lo mismo, SIN la exclusión. Es el control positivo del gate. */
export function conflictosIncluyendoLoExcluido(archivos = archivosDelRepo()): HallazgoDeConflicto[] {
  const hallazgos: HallazgoDeConflicto[] = []
  for (const archivo of archivos) {
    const completo = path.join(RAIZ, archivo)
    if (statSync(completo).size > 4 * 1024 * 1024) continue
    for (const detalle of marcadoresDeConflicto(readFileSync(completo, 'utf8'))) {
      hallazgos.push({ archivo, detalle })
    }
  }
  return hallazgos
}
