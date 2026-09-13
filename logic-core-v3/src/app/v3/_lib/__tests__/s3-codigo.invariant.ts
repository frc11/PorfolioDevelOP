/**
 * INVARIANTE PERMANENTE — las propiedades del CÓDIGO de S3: qué importa, qué
 * no puede nombrar, y cuánto mide.
 *
 * Corre con `npm run test:s3-codigo`. **Entra en el agregado**, porque lo que
 * afirma es cierto hoy, mañana y después del merge: se lee del disco, no de
 * `git`.
 *
 * ── De dónde sale este archivo ────────────────────────────────────────────
 *
 * De partir `s3-frontera.invariant.ts` en dos, que era el arreglo del
 * Problema 3 de S4. Ese archivo mezclaba dos naturalezas distintas bajo el
 * mismo nombre:
 *
 *   · **propiedades del código** — los imports, las prohibiciones y el tamaño.
 *     Se verifican leyendo archivos y **no vencen nunca**. Están acá.
 *   · **propiedades del momento** — todo lo que compara el árbol de trabajo
 *     contra `HEAD`. Vencen al commitear. Quedaron en `s3-frontera`, que corre
 *     aparte y antes del commit.
 *
 * Mezcladas, las segundas arrastraban a las primeras: al mergear los tres
 * sprints, cinco afirmaciones de momento fallaron y con ellas cayó el archivo
 * entero, incluidas las siete que sí eran del código.
 *
 * ── Qué afirma ────────────────────────────────────────────────────────────
 *
 *   1. Ningún archivo del sprint importa fuera de una lista blanca corta.
 *   2. Cero base de datos, cero zonas del otro socio, cero `any`, cero
 *      `router.push`.
 *   3. Ningún archivo pasa las 300 líneas de CÓDIGO — la regla del repo,
 *      aplicada también a los instrumentos.
 */

import { readdirSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ARCHIVOS_DE_CODIGO, ARCHIVOS_DEL_SPRINT, RAIZ, leer } from './s3-archivos'
import { quitarComentarios } from './s3-escaneo'
import { LIMITE_DE_LINEAS_DE_CODIGO, medir } from './s8-largos'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Los imports del sprint, uno por uno')

/**
 * La lista blanca. Todo lo demás es una dependencia nueva o un cruce de
 * frontera, y las dos cosas tienen que fallar acá antes que en una revisión.
 */
const IMPORTS_PERMITIDOS = [
  'react',
  'react-dom',
  'react-dom/server',
  'next',
  'next/font/local',
  'next/dynamic',
  'next/image',
  'lucide-react',
  '@/lib/utils',
]

function importsDe(codigo: string): string[] {
  const limpio = quitarComentarios(codigo)
  const desde = [...limpio.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1])
  const dinamicos = [...limpio.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1])
  return [...desde, ...dinamicos]
}

const externosPorArchivo = ARCHIVOS_DE_CODIGO.map((archivo) => ({
  archivo,
  externos: importsDe(leer(archivo)).filter(
    (m) => !m.startsWith('.') && !m.startsWith('node:') && !IMPORTS_PERMITIDOS.includes(m),
  ),
})).filter((r) => r.externos.length > 0)

afirmarIgual(externosPorArchivo, [], 'ningún archivo importa fuera de la lista blanca')

const cuantosImports = ARCHIVOS_DE_CODIGO.reduce((n, a) => n + importsDe(leer(a)).length, 0)
afirmar(cuantosImports > 0, `el escáner miró ${cuantosImports} imports`, 'no es verde por vacío')
afirmar(
  ARCHIVOS_DE_CODIGO.length > 0,
  `sobre ${ARCHIVOS_DE_CODIGO.length} archivos de código del padrón`,
  'y el padrón no está vacío',
)

controlPositivo(
  'el escáner ve un import fuera de la lista',
  "import { PrismaClient } from '@prisma/client'",
  (codigo) =>
    importsDe(codigo).filter(
      (m) => !m.startsWith('.') && !m.startsWith('node:') && !IMPORTS_PERMITIDOS.includes(m),
    ).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Nada de base de datos, y ninguna zona del otro socio')

const PROHIBIDOS_EN_CODIGO: readonly [string, RegExp][] = [
  ['prisma', /\bprisma\b/i],
  ['PrismaClient', /\bPrismaClient\b/],
  ['OsLead', /\bOsLead\w*/],
  ['ActivityChannel', /\bActivityChannel\b/],
  ['/setter', /['"@/][^'"]*\/setter\b/],
  ['/leados', /['"@/][^'"]*\/leados\b/],
  ['router.push', /\brouter\.push\s*\(/],
  ['any', /:\s*any\b|<any>|\bas\s+any\b/],
]

for (const [nombre, patron] of PROHIBIDOS_EN_CODIGO) {
  const donde = ARCHIVOS_DE_CODIGO.filter((a) => patron.test(quitarComentarios(leer(a))))
  afirmarIgual(donde, [], `ningún archivo del sprint usa ${nombre}`)
}

controlPositivo(
  'el detector de `any` lo ve',
  'const x: any = 1',
  (codigo) => !PROHIBIDOS_EN_CODIGO.some(([, p]) => p.test(codigo)),
)
controlPositivo(
  'y el de `router.push` también',
  'router.push("/a")',
  (codigo) => !PROHIBIDOS_EN_CODIGO.some(([, p]) => p.test(codigo)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Ningún archivo pasa las 300 líneas de CÓDIGO')

/**
 * ⚠ CAMBIO DE FUENTE, S4 — y es un endurecimiento, no una relajación.
 *
 * La lista de instrumentos salía de `git status`: los archivos tocados cuyo
 * nombre empieza con `s3-`. Eso medía **los instrumentos que este sprint
 * escribió**, y después del commit medía CERO — la afirmación "N instrumentos
 * incluidos en la cuenta" fallaba con N=0 y, peor, la regla de las 300 líneas
 * dejaba de cubrir a nadie.
 *
 * Ahora sale del DISCO: todos los instrumentos de S3 que existen, los haya
 * tocado este árbol de trabajo o no. Cubre estrictamente más archivos que
 * antes y no depende del momento.
 */
const DIR_INSTRUMENTOS = 'src/app/v3/_lib/__tests__'

function instrumentosDeS3(): string[] {
  return readdirSync(path.join(RAIZ, DIR_INSTRUMENTOS))
    .filter((nombre) => /^s3-.*\.tsx?$/.test(nombre))
    .map((nombre) => `${DIR_INSTRUMENTOS}/${nombre}`)
    .sort()
}

const INSTRUMENTOS = instrumentosDeS3()
const TODOS = [...new Set([...ARCHIVOS_DEL_SPRINT, ...INSTRUMENTOS])]

/** B4-A: la cuenta del repo, no una copia. Ver `contarLineas` en `s8-largos.ts`.
 *  HERO-4: lo que se AFIRMA son las líneas de CÓDIGO; las totales se publican al
 *  lado para que el número grande no quede escondido detrás del chico. */
const medidos = TODOS.map((archivo) => medir(archivo, leer(archivo)))
const largos = medidos.filter((r) => r.codigo > LIMITE_DE_LINEAS_DE_CODIGO)

afirmarIgual(largos, [], `ninguno de los ${TODOS.length} archivos pasa las ${LIMITE_DE_LINEAS_DE_CODIGO} líneas de código`)

const masLargo = [...medidos].sort((a, b) => b.codigo - a.codigo)[0]
console.log(`  el más largo: ${masLargo.archivo} — ${masLargo.codigo} de código, ${masLargo.lineas} totales`)

afirmar(
  INSTRUMENTOS.length > 0,
  `${INSTRUMENTOS.length} instrumentos de S3 incluidos en la cuenta`,
  INSTRUMENTOS.map((i) => path.basename(i)).join(' · '),
)

controlPositivo(
  'el medidor ve un archivo de más de 300 líneas DE CÓDIGO',
  { archivo: 'inventado.ts', lineas: 301, codigo: 301 },
  (r) => r.codigo <= LIMITE_DE_LINEAS_DE_CODIGO,
)
/** ⚠️ HERO-4 · Y el control de que la unidad CAMBIÓ: 900 líneas de prosa y una
 *  de código pasan, que es exactamente lo que la regla vieja no dejaba. */
controlPositivo(
  '  y la unidad es CÓDIGO: un archivo de 900 renglones con una sola línea de código pasa',
  { archivo: 'inventado.ts', lineas: 900, codigo: 1 },
  (r) => r.lineas <= LIMITE_DE_LINEAS_DE_CODIGO,
)

cerrar('s3-codigo.invariant')
