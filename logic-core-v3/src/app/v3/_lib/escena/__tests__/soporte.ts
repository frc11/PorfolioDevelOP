/**
 * LOS DETECTORES DE S8 · ESCENA — funciones puras, para que el control positivo
 * pueda correr **la misma** contra una entrada equivocada.
 *
 * Viven afuera del invariante por la razón de siempre en este repo: un
 * predicado escrito adentro del archivo que lo usa no se puede probar contra un
 * caso roto sin duplicarlo, y un predicado duplicado no es el mismo predicado.
 * Es el patrón de `s7-soporte.ts`.
 *
 * ── ⚠️ TODO ESCÁNER DE FUENTE BORRA COMENTARIOS ANTES DE MIRAR ─────────────
 *
 * Regla del proyecto (§7.25 de `DIRECCION-ESCENA.md`, quinta aparición): *un
 * escáner que lee código fuente lee también los comentarios y las cadenas, y un
 * comentario que ejemplifica lo que el escáner busca es indistinguible de lo
 * que busca.* Este módulo la sufre de forma directa: **su propio docblock nombra
 * la ruta vieja y el prefijo del sistema de motion**, que son dos de las cosas
 * que sus detectores buscan. Por eso `sinComentarios()` corre primero, siempre,
 * y los invariantes de este frente no llaman a ningún detector con el fuente
 * crudo.
 *
 * ── Lo que estos escáneres NO miran, con nombre y motivo ───────────────────
 *
 * - `node_modules/` y `.next/`: no son fuente del proyecto.
 * - Nada más. **No hay exclusión por sufijo**: los propios instrumentos de este
 *   frente entran al barrido de especificadores rotos como cualquier otro
 *   archivo, que es lo que hace que el barrido sirva.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

export const RAIZ = process.cwd()
export const DESTINO = 'src/app/v3/_lib/escena'
export const ORIGEN = 'src/app/probe-escena/_components'

/**
 * Los 29 módulos que SITIO-S8 mudó: la clausura transitiva por VALOR de lo que
 * `ProbeStage.tsx` necesita para renderizar.
 *
 * ⚠ Está escrita y no derivada, y es de la clase que §7.27 dice que **tiene**
 * que estarlo: es la lista de lo que este sprint decidió mover, o sea la
 * decisión misma. Lo que sí se deriva —y es la mitad que importa— es que la
 * clausura por valor del destino no se sale de acá: si mañana alguien le suma
 * un módulo a la escena, el barrido de especificadores lo encuentra igual.
 */
export const MODULOS_MUDADOS: readonly string[] = [
  'BokehParticles.tsx',
  'ContactOcclusion.tsx',
  'DepthParticles.tsx',
  'InstancedBars.tsx',
  'MoireScreen.tsx',
  'OrbitRig.tsx',
  'ProbeLogo.tsx',
  'ProbeStage.tsx',
  'StudioFloor.tsx',
  'bezier.ts',
  'cameraFraming.ts',
  'celosiaGeometry.ts',
  'celosiaPenumbra.ts',
  'celosiaShader.ts',
  'choreography.ts',
  'choreographyPhysics.ts',
  'choreographySampler.ts',
  'choreographyTypes.ts',
  'floorMarks.ts',
  'lightRig.ts',
  'moireTextures.ts',
  'particleTextures.ts',
  'probeAtmosphere.ts',
  'probeCelosia.ts',
  'probeLighting.ts',
  'probeMoire.ts',
  'probeParticles.ts',
  'probeScene.ts',
  'probeStore.ts',
]

/**
 * El subárbol del EDITOR que NO se mudó, y que `createChoreoEditor()` arrastra
 * entero por cargar las cinco variantes al construirse. Es la cifra del freno.
 */
export const SUBARBOL_DEL_EDITOR: readonly string[] = [
  'choreographyEditor.ts',
  'choreographyVariants.ts',
  'variantArquitectonica.ts',
  'variantCalibrada.ts',
  'variantCalibradaNotes.ts',
  'variantDramatica.ts',
  'variantIntima.ts',
  'variantNotes.ts',
  'choreographyNotes.ts',
  'choreographyNotesFrontal.ts',
  'choreographyNotesGiro.ts',
]

/** Borra comentarios de bloque y de línea. Corre ANTES que cualquier detector. */
export function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

/** ¿Existe este archivo, relativo a la raíz del repo? */
export function existe(relativo: string): boolean {
  try {
    return statSync(path.join(RAIZ, relativo)).isFile()
  } catch {
    return false
  }
}

/**
 * Bytes de código vivo: sin comentarios, sin líneas vacías, sin sangría. Es lo
 * que aproxima lo que sobrevive a la minificación. Se exporta con dos nombres
 * —`pesoVivo` para los agregados y `pesoDeUnFuente` para el control positivo—
 * porque son la MISMA función: el control tiene que correr la que se usa.
 */
export function pesoVivo(fuente: string): number {
  const limpio = sinComentarios(fuente)
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join('\n')
  return Buffer.byteLength(limpio, 'utf8')
}

/** Todos los `.ts`/`.tsx` de un directorio, recursivo. */
export function archivosTs(dir: string, acumulado: string[] = []): string[] {
  for (const entrada of readdirSync(dir)) {
    if (entrada === 'node_modules' || entrada === '.next') continue
    const completo = path.join(dir, entrada)
    if (statSync(completo).isDirectory()) archivosTs(completo, acumulado)
    else if (/\.tsx?$/.test(entrada)) acumulado.push(completo)
  }
  return acumulado
}

export type Especificador = {
  readonly spec: string
  /** `true` si la cláusula entera es `import type` / `export type`. */
  readonly soloTipo: boolean
}

/**
 * Los especificadores de un fuente. **Recibe el fuente YA sin comentarios.**
 * Cubre `import … from`, `export … from`, el `import 'x'` de efecto y el
 * `import('x')` dinámico.
 */
export function especificadoresDe(fuenteLimpia: string): Especificador[] {
  const salida: Especificador[] = []
  const conFrom = /(?:^|\n)[ \t]*(?:import|export)([^;]*?)from[ \t]*['"]([^'"]+)['"]/g
  let m: RegExpExecArray | null
  while ((m = conFrom.exec(fuenteLimpia)) !== null) {
    salida.push({ spec: m[2], soloTipo: /^\s+type\s/.test(m[1]) })
  }
  const deEfecto = /(?:^|\n)[ \t]*import[ \t]*['"]([^'"]+)['"]/g
  while ((m = deEfecto.exec(fuenteLimpia)) !== null) salida.push({ spec: m[1], soloTipo: false })
  const dinamico = /import\([ \t]*['"]([^'"]+)['"][ \t]*\)/g
  while ((m = dinamico.exec(fuenteLimpia)) !== null) salida.push({ spec: m[1], soloTipo: false })
  return salida
}

/**
 * Resuelve un especificador del proyecto a un archivo.
 *
 * `null` = es un paquete de `node_modules` y no se resuelve acá.
 * `'ROTO'` = es del proyecto y **no existe**.
 */
export function resolverEspecificador(desdeArchivo: string, spec: string): string | null {
  if (!spec.startsWith('.') && !spec.startsWith('@/')) return null
  const base = spec.startsWith('@/')
    ? path.join(RAIZ, 'src', spec.slice(2))
    : path.resolve(path.dirname(desdeArchivo), spec)
  for (const sufijo of ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '']) {
    const candidato = base + sufijo
    try {
      if (sufijo === '' ? statSync(candidato).isFile() : statSync(candidato).isFile()) return candidato
    } catch {
      // sigue probando
    }
  }
  return 'ROTO'
}

/** Los especificadores del proyecto que no resuelven, con su archivo. */
export function especificadoresRotos(archivos: readonly string[]): string[] {
  const rotos: string[] = []
  for (const archivo of archivos) {
    const limpio = sinComentarios(readFileSync(archivo, 'utf8'))
    for (const { spec } of especificadoresDe(limpio)) {
      if (resolverEspecificador(archivo, spec) === 'ROTO') {
        rotos.push(`${path.relative(RAIZ, archivo).split(path.sep).join('/')} → ${spec}`)
      }
    }
  }
  return rotos
}

/**
 * ¿El fuente importa un VALOR de algún módulo cuyo especificador contenga
 * `aguja`? Un `import type` no cuenta: se borra al compilar y no llega al
 * bundle. **Recibe el fuente crudo y lo limpia por su cuenta.**
 */
export function importaValorDe(fuente: string, aguja: string): boolean {
  return especificadoresDe(sinComentarios(fuente)).some(
    (e) => !e.soloTipo && e.spec.includes(aguja),
  )
}

/** Todos los especificadores que contienen `aguja`, con su naturaleza. */
export function referenciasA(fuente: string, aguja: string): Especificador[] {
  return especificadoresDe(sinComentarios(fuente)).filter((e) => e.spec.includes(aguja))
}

/**
 * ¿El fuente escribe `atributo={IDENTIFICADOR}` en JSX? Es lo que distingue
 * "la marca viaja como valor de atributo" de "la marca está nombrada en un
 * comentario". **Limpia por su cuenta.**
 */
export function escribeAtributo(fuente: string, atributo: string, identificador: string): boolean {
  const limpio = sinComentarios(fuente)
  return new RegExp(`${atributo}=\\{\\s*${identificador}\\s*\\}`).test(limpio)
}

/** ¿El fuente usa el identificador como valor de `className`? */
export function usaClassName(fuente: string, identificador: string): boolean {
  return new RegExp(`className=\\{\\s*${identificador}\\s*\\}`).test(sinComentarios(fuente))
}

/**
 * Qué archivos importan (por valor o por tipo) un módulo que `acepta` reconoce.
 *
 * ⚠ Recibe un PREDICADO sobre el especificador y no una subcadena, porque una
 * subcadena miente: `marcaEscena` está contenido en `marcaEscenario`, que es
 * otro módulo y otro marcador. El predicado ancla el final de la ruta.
 */
export function quienImporta(
  archivos: readonly string[],
  acepta: (spec: string) => boolean,
): string[] {
  return archivos
    .filter((archivo) =>
      especificadoresDe(sinComentarios(readFileSync(archivo, 'utf8'))).some((e) => acepta(e.spec)),
    )
    .map((a) => path.relative(RAIZ, a).split(path.sep).join('/'))
}

/** Alias de `pesoVivo`. El control positivo corre exactamente la misma función. */
export const pesoDeUnFuente = pesoVivo
