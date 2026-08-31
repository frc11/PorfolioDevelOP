/**
 * LA PLOMERÍA DEL FRENTE `peso` — leer el disco, leer el árbol, leer el build.
 *
 * Vive aparte de los dos invariantes por la razón de `s7-soporte.ts`: **un
 * detector se prueba corriendo la MISMA función contra una entrada rota**, y
 * para eso la función tiene que estar afuera del archivo que la usa. No lleva
 * el sufijo `.invariant` a propósito: los únicos `.invariant.ts` de este frente
 * son los dos declarados en `s8-padron.ts`, y uno suelto sin script en
 * `package.json` es un instrumento que no corre nunca.
 */

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const requerir = createRequire(import.meta.url)

/** Qué pasa al pedirle a Node un módulo: `'CARGA'` o el error que tira. */
export function alPedirModulo(modulo: string): string {
  try {
    requerir(modulo)
    return 'CARGA'
  } catch (e) { return e instanceof Error ? `${e.name}: ${e.message.split('\n')[0]}` : String(e) }
}

/** Los nombres que un módulo exporta cuando Node lo carga. Vacío si no carga. */
export function exportacionesDe(modulo: string): string[] {
  try {
    return Object.keys(requerir(modulo) as object)
  } catch { return [] }
}

/** Seis niveles: __tests__ → carga-diferida → layout → components → src → raíz. */
export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')

export const LAYOUT = 'src/app/layout.tsx'

export const leer = (relativo: string): string => readFileSync(path.join(RAIZ, relativo), 'utf8')

export function existe(relativo: string): boolean {
  try {
    statSync(path.join(RAIZ, relativo))
    return true
  } catch { return false }
}

/**
 * La huella sha256 del CONTENIDO, con los retornos de carro normalizados.
 * Normalizar no es cosmético: `.gitattributes` hace que el mismo archivo se
 * chequee con CRLF en una máquina y con LF en otra, y una huella sobre los
 * bytes crudos diría que cambió cuando lo único que cambió fue el checkout.
 */
export function sha256(contenido: string): string {
  return createHash('sha256').update(contenido.replace(/\r/g, '')).digest('hex')
}

/** La huella de un archivo del disco, o `null` si no está. */
export function huellaDe(relativo: string): string | null {
  return existe(relativo) ? sha256(leer(relativo)) : null
}

// ═══════════════════════════════════════════════════════════════════════════
// EL ÁRBOL, LEÍDO DEL FUENTE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * El código sin comentarios: los de JSX, los de bloque y los de línea. Hace
 * falta y no es cosmético: `layout.tsx` DOCUMENTA en comentarios las piezas que
 * se desmontaron y las que se consumen desde otro lado, y un lector que mirara
 * el archivo entero las contaría como montadas — pondría en rojo justamente el
 * trabajo de haber escrito el porqué. Es §7.25.
 */
export function sinComentarios(fuente: string): string {
  return fuente
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^\s*\/\/[^\n]*$/gm, ' ')
}

/**
 * Las piezas que el árbol MONTA, en orden de documento.
 *
 * Se lee la región entre `<html` y `</html>` —el `<head>` incluido, porque
 * `HomeIntroBoot` vive ahí— y se anotan los elementos de componente (mayúscula
 * inicial) y el hueco de `{children}`. Las etiquetas nativas no son piezas: no
 * se importan y no pesan. Las de CIERRE tampoco cuentan: después de `<` viene
 * una barra y el patrón no matchea.
 */
export function piezasMontadas(fuente: string): string[] {
  const limpio = sinComentarios(fuente)
  const desde = limpio.indexOf('<html')
  const hasta = limpio.lastIndexOf('</html>')
  if (desde < 0 || hasta < 0) return []
  const region = limpio.slice(desde, hasta)
  return [...region.matchAll(/<([A-Z][A-Za-z0-9_]*)|\{\s*children\s*\}/g)].map((m) =>
    m[1] === undefined ? 'children' : m[1],
  )
}

/**
 * De dónde viene cada binding importado: `nombre → especificador`. `import type`
 * se saltea (se borra al compilar) y los de sólo efecto no aportan nombre.
 */
export function origenDeCadaImport(fuente: string): Record<string, string> {
  const limpio = sinComentarios(fuente)
  const mapa: Record<string, string> = {}
  // `[^;]*?` y no `[\s\S]*?`: sin el corte en el punto y coma, un
  // `import './globals.css';` sin `from` deja al motor saltar hasta el próximo
  // `from` y llevarse lo del medio — acá, el objeto de opciones de `next/font`,
  // que entraba a la tabla como si fueran bindings. Lo destapó la 1ª corrida.
  for (const m of limpio.matchAll(/^\s*import\s+(?!type\s)([^;]*?)\s+from\s+["']([^"']+)["']/gm)) {
    const clausula = m[1].trim()
    const especificador = m[2]
    const llaves = clausula.match(/\{([\s\S]*?)\}/)
    if (llaves) {
      for (const parte of llaves[1].split(',')) {
        const nombre = parte.trim().split(/\s+as\s+/).pop()?.trim()
        if (nombre && !nombre.startsWith('type ')) mapa[nombre] = especificador
      }
    }
    const porDefecto = clausula.replace(/\{[\s\S]*?\}/, '').replace(/,/g, ' ').trim()
    if (porDefecto && /^[A-Za-z_$][\w$]*$/.test(porDefecto)) mapa[porDefecto] = especificador
  }
  return mapa
}

/**
 * El archivo del repo al que apunta un especificador, o `null` si es externo
 * (`sonner`) o no existe. Se prueban las cuatro formas que Next resuelve.
 */
export function archivoDelEspecificador(especificador: string, desdeArchivo: string): string | null {
  let base: string
  if (especificador.startsWith('@/')) base = `src/${especificador.slice(2)}`
  else if (especificador.startsWith('.')) {
    base = path.posix.normalize(path.posix.join(path.posix.dirname(desdeArchivo), especificador))
  } else return null
  for (const cola of ['.tsx', '.ts', '/index.tsx', '/index.ts', '']) {
    if (cola !== '' && existe(`${base}${cola}`)) return `${base}${cola}`
    if (cola === '' && existe(base) && /\.tsx?$/.test(base)) return base
  }
  return null
}

/**
 * Si `barril` re-exporta `binding` desde otro módulo, cuál es ese módulo (ya
 * resuelto a un archivo del repo). `null` si no lo re-exporta. Es lo que permite
 * afirmar «es la MISMA pieza» cuando el especificador escrito en `layout.tsx`
 * dejó de ser el barril: la identidad se sigue por la cadena de re-export.
 */
export function reexportaDesde(barril: string, binding: string): string | null {
  if (!existe(barril)) return null
  const limpio = sinComentarios(leer(barril))
  for (const m of limpio.matchAll(/export\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g)) {
    const nombres = m[1].split(',').map((p) => p.trim().split(/\s+as\s+/).pop()?.trim())
    if (nombres.includes(binding)) return archivoDelEspecificador(m[2], barril)
  }
  return null
}

// ═══════════════════════════════════════════════════════════════════════════
// `ssr: false` — QUIÉN LO LLEVA
// ═══════════════════════════════════════════════════════════════════════════

/** El texto entre el paréntesis que abre en `desde` y el que lo cierra. */
function argumentos(fuente: string, desde: number): string {
  let nivel = 0
  for (let i = desde; i < fuente.length; i += 1) {
    if (fuente[i] === '(') nivel += 1
    else if (fuente[i] === ')' && (nivel -= 1) === 0) return fuente.slice(desde + 1, i)
  }
  return fuente.slice(desde + 1)
}

/**
 * Los nombres asignados desde un `dynamic(…)` que lleva `ssr: false`. Se lee sin
 * comentarios y con paréntesis balanceados: un `ssr: false` de OTRA llamada del
 * mismo archivo no se le puede atribuir a ésta.
 */
export function diferidosSinServidor(fuente: string): string[] {
  const limpio = sinComentarios(fuente)
  const nombres: string[] = []
  for (const m of limpio.matchAll(/(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*dynamic\s*\(/g)) {
    const abre = limpio.indexOf('(', m.index + m[0].length - 1)
    if (/ssr\s*:\s*false/.test(argumentos(limpio, abre))) nombres.push(m[1])
  }
  return nombres
}

// ═══════════════════════════════════════════════════════════════════════════
// EL BUILD — el grupo de chunks del HOME, y el piso del framework
// ═══════════════════════════════════════════════════════════════════════════

/** EL TESTIGO DE LA PÁGINA DEL HOME. Módulo de cliente que **sólo** importa
 *  `src/app/page.tsx`: sus chunks son, por construcción, los de su grupo. */
export const TESTIGO_DEL_HOME = 'src/components/layout/HomeWrapper.tsx'

/** EL TESTIGO DEL LAYOUT RAÍZ. Módulo de cliente que **sólo** importa
 *  `src/app/layout.tsx`: sus chunks son los del grupo del layout — lo que toda
 *  ruta paga por tener chrome, y por eso no se le atribuye al home. */
export const TESTIGO_DEL_LAYOUT = 'src/components/layout/Shutter.tsx'

/**
 * Los chunks del grupo al que webpack asignó un módulo de cliente, leídos del
 * manifiesto de referencias en vez de escritos a mano: los nombres traen hash
 * de contenido y una lista escrita a mano se vencería en el próximo build.
 */
export function grupoDeChunks(dist: string, moduloTestigo: string): string[] {
  const manifiesto = path.join(dist, 'server', 'app', 'page_client-reference-manifest.js')
  if (!existsSync(manifiesto)) return []
  const crudo = readFileSync(manifiesto, 'utf8')
  const corte = crudo.indexOf(']=')
  if (corte < 0) return []
  let datos: unknown
  try {
    datos = JSON.parse(crudo.slice(corte + 2).trim().replace(/;$/, ''))
  } catch {
    return []
  }
  if (typeof datos !== 'object' || datos === null) return []
  const modulos = (datos as { clientModules?: unknown }).clientModules
  if (typeof modulos !== 'object' || modulos === null) return []
  for (const [clave, valor] of Object.entries(modulos as Record<string, unknown>)) {
    if (!clave.replace(/\\/g, '/').endsWith(moduloTestigo)) continue
    if (typeof valor !== 'object' || valor === null) continue
    const chunks = (valor as { chunks?: unknown }).chunks
    if (!Array.isArray(chunks)) continue
    return [...new Set(chunks.filter((c): c is string => typeof c === 'string' && c.endsWith('.js')))].sort()
  }
  return []
}

/**
 * LOS CHUNKS QUE SON **SÓLO** DE LA PÁGINA DEL HOME. Los dos grupos comparten
 * casi todos sus chunks de vendor, y ésos los paga toda ruta por tener chrome:
 * atribuírselos al home sería falso. Lo que queda al restarlos es lo que sólo
 * existe porque alguien renderiza el home.
 */
export function soloDeLaPaginaDelHome(dist: string): string[] {
  const delLayout = new Set(grupoDeChunks(dist, TESTIGO_DEL_LAYOUT))
  return grupoDeChunks(dist, TESTIGO_DEL_HOME).filter((c) => !delLayout.has(c))
}

/** Cuáles de esos chunks aparecen en la carga inicial de una ruta. La fuga. */
export const fugaDeChunks = (
  inicialDeLaRuta: readonly string[],
  exclusivosDelHome: readonly string[],
): string[] => exclusivosDelHome.filter((c) => inicialDeLaRuta.includes(c))

/**
 * QUIÉN PIDE UN CHUNK, por nombre de referencia de cliente. El payload de flight
 * serializa cada referencia como `N:I[id,[…chunks…],"Nombre"]`; buscar el chunk y
 * leer el nombre que le sigue convierte «hay fuga» en «la pide ESTE», que es la
 * diferencia entre un rojo y un diagnóstico. Así se identificó al culpable acá.
 */
export function referenciasQuePiden(html: string, chunk: string): string[] {
  // Sólo el payload, nunca las etiquetas `<script src>`: ahí el mismo chunk
  // aparece sin nombre al lado y la ventana podría pescar el de otra entrada.
  const arranque = html.indexOf(':I[')
  if (arranque < 0) return []
  const payload = html.slice(arranque)
  const nombres = new Set<string>()
  for (let i = payload.indexOf(chunk); i >= 0; i = payload.indexOf(chunk, i + 1)) {
    // La ventana cubre el resto del arreglo de chunks de ESA entrada; adentro
    // del arreglo no hay `]`, así que el primer match sólo puede ser el suyo.
    const m = payload.slice(i, i + 1200).match(/\],\\?"([A-Za-z0-9_$*]+)\\?"\]/)
    if (m) nombres.add(m[1])
  }
  return [...nombres].sort()
}

/**
 * El PISO del framework: lo que Next pide en toda ruta sin que ningún componente
 * lo elija — runtime, react-dom, polyfills. Sale de `build-manifest.json`.
 */
export function pisoDelFramework(dist: string): string[] {
  const archivo = path.join(dist, 'build-manifest.json')
  if (!existsSync(archivo)) return []
  let datos: unknown
  try {
    datos = JSON.parse(readFileSync(archivo, 'utf8'))
  } catch { return [] }
  if (typeof datos !== 'object' || datos === null) return []
  const lista = (clave: string): string[] => {
    const v = (datos as Record<string, unknown>)[clave]
    return Array.isArray(v) ? v.filter((f): f is string => typeof f === 'string') : []
  }
  return [...new Set([...lista('rootMainFiles'), ...lista('polyfillFiles')])].sort()
}

/** Las rutas con HTML prerenderizado en el build, en forma de ruta del sitio. */
export function rutasPrerenderizadas(dist: string): string[] {
  const carpeta = path.join(dist, 'server', 'app')
  if (!existsSync(carpeta)) return []
  return readdirSync(carpeta)
    .filter((f) => f.endsWith('.html') && !f.startsWith('_'))
    .map((f) => (f === 'index.html' ? '/' : `/${f.replace(/\.html$/, '')}`))
    .sort()
}
