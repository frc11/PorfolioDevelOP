/**
 * INVARIANTE — las fronteras del sprint. Lo que NO tocó, lo que NO importó y
 * lo que NO agregó.
 *
 * Corre con `npm run test:s3-frontera`.
 *
 * ── Por qué esto es un instrumento y no un párrafo del reporte ────────────
 *
 * "No toqué `theme-develop.css`", "no agregué dependencias", "no toqué base de
 * datos" son exactamente el tipo de afirmación que se escribe de memoria al
 * cerrar y que nadie puede contradecir sin repetir el trabajo. Acá las produce
 * `git` y un escáner de imports, así que el reporte cita una corrida en vez de
 * una intención.
 *
 * ── Qué afirma ────────────────────────────────────────────────────────────
 *
 *   1. Los archivos prohibidos están **intactos**: `/v3/page.tsx`, el home,
 *      `/probe-escena`, `home-intro/` y los seis congelados. Medido con
 *      `git status --porcelain`.
 *   1b. `theme-develop.css` SÍ cambió —la corrección aprobada en la parada—
 *      y se compara token por token contra HEAD: el único nombre nuevo es el
 *      declarado, y ningún valor previo se movió.
 *   2. `package.json` cambió **sólo en `scripts`**. Ni una dependencia nueva.
 *      Medido contra `git show HEAD:package.json`.
 *   3. Ningún archivo del sprint importa base de datos, ni las zonas del otro
 *      socio, ni ningún módulo fuera de una lista blanca corta.
 *   4. Cero `any`, cero `router.push`.
 *   5. Ningún archivo pasa las 300 líneas — la regla del repo, aplicada
 *      también a los instrumentos.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ARCHIVOS_DE_CODIGO, ARCHIVOS_DEL_SPRINT, leer } from './s3-archivos'
import { quitarComentarios } from './s3-escaneo'
import { enElRepo, git, PREFIJO, rutasTocadas, tokensDeclaradosEn } from './s3-git'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Los archivos prohibidos están intactos')

/**
 * Las rutas que la instrucción declara intocables, tal cual las nombra.
 *
 * ⚠ `theme-develop.css` NO está en esta lista, y la ausencia es deliberada:
 * S3 le agregó un token con aprobación explícita en la parada. Sacarlo de acá
 * sin más dejaría el archivo sin guardia, así que la afirmación se muda a §1b
 * y se vuelve más filosa que "intacto": que su ÚNICO cambio contra HEAD sea la
 * corrección declarada, y que ningún valor previo se haya movido.
 */
const PROHIBIDOS = [
  'src/app/v3/page.tsx',
  'src/app/page.tsx',
  'src/components/3d/HeroArtifact.tsx',
  'src/context/TransitionContext.tsx',
  'src/context/PreloaderContext.tsx',
  'prisma/schema.prisma',
  'auth.ts',
  'src/lib/prisma.ts',
]

/** Los prefijos de directorio que tampoco se tocan. */
const DIRECTORIOS_PROHIBIDOS = [
  'src/app/probe-escena/',
  'src/components/home-intro/',
  'src/app/setter/',
  'src/app/(protected)/setter/',
  'src/app/leados/',
]

/** Lo que `git status` reporta como tocado, en rutas relativas a la raíz. */
const tocados = git('status', '--porcelain')
  .split('\n')
  .map((linea) => linea.slice(3).trim().replace(/^"|"$/g, ''))
  .filter((ruta) => ruta.length > 0)

const prohibidosEnElRepo = PROHIBIDOS.map(enElRepo)
const directoriosEnElRepo = DIRECTORIOS_PROHIBIDOS.map(enElRepo)

const prohibidosTocados = tocados.filter(
  (ruta) => prohibidosEnElRepo.includes(ruta) || directoriosEnElRepo.some((d) => ruta.startsWith(d)),
)
afirmarIgual(prohibidosTocados, [], `ninguno de los ${PROHIBIDOS.length} archivos prohibidos fue tocado`)

/**
 * EL CONTRAPESO, y es el que encontró el error de prefijo.
 *
 * Si las rutas del padrón y las de `git status` no hablan el mismo idioma, la
 * afirmación de arriba pasa en verde SIEMPRE. La única forma de saber que se
 * están comparando de verdad es exigir que las rutas del propio sprint —que
 * seguro están tocadas, porque son altas— aparezcan en la lista.
 */
const propiosVistosPorGit = ARCHIVOS_DEL_SPRINT.map(enElRepo).filter((ruta) =>
  tocados.some((t) => t === ruta || (t.endsWith('/') && ruta.startsWith(t))),
)
afirmar(
  propiosVistosPorGit.length > 0,
  `git status ve ${propiosVistosPorGit.length} de los ${ARCHIVOS_DEL_SPRINT.length} archivos del sprint`,
  'sin esto la afirmación de arriba pasaría en verde aunque comparara peras con manzanas',
)
afirmar(tocados.length > 0, `y ve ${tocados.length} rutas tocadas en total`)

controlPositivo(
  'el filtro reconocería un prohibido si apareciera en la lista de tocados',
  [enElRepo('src/app/v3/page.tsx'), enElRepo('src/app/v3/_estilos/cta.css')],
  (rutas) => rutas.filter((r) => prohibidosEnElRepo.includes(r)).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1b · El sistema cambió SÓLO en la corrección aprobada')

/**
 * El archivo del sistema se compara contra HEAD token por token. Lo que se
 * afirma no es que no se tocó —se tocó— sino las dos cosas que importan:
 * qué se agregó, y que **nada de lo que ya estaba se movió**.
 *
 * Un token que cambia de valor en silencio es el peor cambio posible en este
 * archivo: no rompe nada, no da error, y mueve la mitad del sitio.
 */
const TEMA = 'src/app/theme-develop.css'
const CORRECCION_DE_S3 = ['--color-superficie-translucida']

const temaAntes = tokensDeclaradosEn(git('show', `HEAD:${enElRepo(TEMA)}`))
const temaAhora = tokensDeclaradosEn(leer(TEMA))

const nombresNuevos = [...temaAhora.keys()].filter((n) => !temaAntes.has(n)).sort()
const nombresPerdidos = [...temaAntes.keys()].filter((n) => !temaAhora.has(n)).sort()
const valoresMovidos = [...temaAntes.entries()]
  .filter(([n, v]) => temaAhora.has(n) && temaAhora.get(n) !== v)
  .map(([n, v]) => ({ token: n, antes: v, ahora: temaAhora.get(n) }))

afirmarIgual(nombresNuevos, CORRECCION_DE_S3, 'el único token nuevo es la corrección declarada')
afirmarIgual(nombresPerdidos, [], 'no se perdió ninguno')
afirmarIgual(valoresMovidos, [], 'y ningún valor previo se movió')
afirmar(
  temaAntes.size > 80,
  `el comparador leyó ${temaAntes.size} tokens en HEAD y ${temaAhora.size} ahora`,
  'no es verde por vacío',
)

controlPositivo(
  'el comparador de valores vería uno movido',
  new Map([...temaAhora, ['--color-fondo', '#000000']]),
  (mapa) =>
    [...temaAntes.entries()].filter(([n, v]) => mapa.has(n) && mapa.get(n) !== v).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Sin dependencias nuevas — package.json cambió sólo en scripts')

interface Paquete {
  readonly dependencies?: Record<string, string>
  readonly devDependencies?: Record<string, string>
  readonly scripts?: Record<string, string>
}

const antes = JSON.parse(git('show', `HEAD:${enElRepo('package.json')}`)) as Paquete
const ahora = JSON.parse(leer('package.json')) as Paquete

afirmarIgual(ahora.dependencies, antes.dependencies, '`dependencies` idéntico a HEAD')
afirmarIgual(ahora.devDependencies, antes.devDependencies, '`devDependencies` idéntico a HEAD')

const scriptsNuevos = Object.keys(ahora.scripts ?? {}).filter((k) => !(k in (antes.scripts ?? {})))
const scriptsCambiados = Object.keys(antes.scripts ?? {}).filter(
  (k) => (antes.scripts ?? {})[k] !== (ahora.scripts ?? {})[k],
)
afirmar(scriptsNuevos.length > 0, `${scriptsNuevos.length} scripts nuevos`, scriptsNuevos.join(' · '))
afirmarIgual(scriptsCambiados, [], 'y ningún script previo se modificó')

controlPositivo(
  'el comparador de dependencias vería un agregado',
  { ...antes.dependencies, 'una-dependencia-nueva': '^1.0.0' },
  (deps) => JSON.stringify(deps) === JSON.stringify(antes.dependencies),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los imports del sprint, uno por uno')

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

controlPositivo(
  'el escáner ve un import fuera de la lista',
  "import { PrismaClient } from '@prisma/client'",
  (codigo) =>
    importsDe(codigo).filter(
      (m) => !m.startsWith('.') && !m.startsWith('node:') && !IMPORTS_PERMITIDOS.includes(m),
    ).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Nada de base de datos, y ninguna zona del otro socio')

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
titulo('5 · Ningún archivo pasa las 300 líneas')

/** Los instrumentos también. La regla del repo no tiene una excepción para el
 *  arnés, y un invariante de 600 líneas es tan ilegible como un componente. */
const INSTRUMENTOS = tocados
  .filter((r) => /_lib\/__tests__\/s3-/.test(r))
  .map((r) => r.slice(PREFIJO.length))
const TODOS = [...new Set([...ARCHIVOS_DEL_SPRINT, ...INSTRUMENTOS])]

const largos = TODOS.map((archivo) => ({ archivo, lineas: leer(archivo).split('\n').length })).filter(
  (r) => r.lineas > 300,
)
afirmarIgual(largos, [], `ninguno de los ${TODOS.length} archivos pasa las 300 líneas`)

const masLargo = TODOS.map((archivo) => ({ archivo, lineas: leer(archivo).split('\n').length })).sort(
  (a, b) => b.lineas - a.lineas,
)[0]
console.log(`  el más largo: ${masLargo.archivo} — ${masLargo.lineas} líneas`)

afirmar(INSTRUMENTOS.length > 0, `${INSTRUMENTOS.length} instrumentos incluidos en la cuenta`)

cerrar('s3-frontera.invariant')
