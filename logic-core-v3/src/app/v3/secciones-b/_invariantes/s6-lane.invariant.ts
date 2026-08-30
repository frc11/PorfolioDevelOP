/**
 * INVARIANTE — LAS PROPIEDADES DEL CÓDIGO DEL LANE: el reparto, los imports, el
 * acento por alias, el foco y el tamaño.
 *
 * Corre con `npm run test:s6-lane`. Se lee todo del disco: lo que afirma es
 * cierto hoy, mañana y después del merge. **No compara contra `git`** — eso
 * sería un check de frontera y vencería al commitear.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { apagadosDeFoco, quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { ORDEN_DE_SECCIONES_B } from '../_contrato/secciones'
import { IDS_DE_SERVICIO } from '../_contrato/acento'
import {
  ARCHIVO_EXCEPTUADO_DEL_ESCANEO,
  CARPETAS_DE_SECCION,
  CARPETA_DE_CONTRATO,
  CARPETA_DE_INVARIANTES,
  LANE,
  PROHIBIDOS_EN_EL_LANE,
  apoyosDelLane,
  archivosDelLane,
  codigoDelLane,
  codigoDeLaSeccion,
  instrumentosDelLane,
  leer,
  recorrer,
  sinCadenas,
  valoresDeAcentoDelTema,
} from './soporte'

const TODOS = archivosDelLane()
const CODIGO = codigoDelLane()
const INSTRUMENTOS = instrumentosDelLane()

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El reparto — una carpeta por sección, y nadie escribió fuera de la suya')

afirmar(TODOS.length > 0, `el lane tiene ${TODOS.length} archivos`, 'no es verde por vacío')

/** El padrón del andamiaje. Todo archivo del lane cae en uno de estos lugares. */
const LUGARES_DECLARADOS: readonly string[] = [
  CARPETA_DE_CONTRATO,
  CARPETA_DE_INVARIANTES,
  ...Object.values(CARPETAS_DE_SECCION),
]
const RAIZ_DEL_LANE_PERMITIDA: readonly string[] = [`${LANE}/page.tsx`]

const fueraDeLugar = TODOS.filter(
  (a) => !RAIZ_DEL_LANE_PERMITIDA.includes(a) && !LUGARES_DECLARADOS.some((d) => a.startsWith(`${d}/`)),
)
afirmarIgual(fueraDeLugar, [], 'ningún archivo del lane está fuera de los lugares declarados')

for (const id of ORDEN_DE_SECCIONES_B) {
  const carpeta = CARPETAS_DE_SECCION[id]
  const archivos = recorrer(carpeta)
  afirmar(archivos.length > 0, `la sección \`${id}\` existe`, `${archivos.length} archivos en ${carpeta}`)
  const suyos = archivos.filter((a) => /\.invariant\.tsx?$/.test(a))
  afirmarIgual(suyos.length, 1, `  y tiene exactamente UN invariante propio`)
}

controlPositivo(
  'el detector vería un archivo escrito fuera de los lugares declarados',
  [`${LANE}/_s5-servicios/x.tsx`, `${LANE}/otra-carpeta/x.tsx`],
  (lista: string[]) =>
    lista.filter(
      (a) => !RAIZ_DEL_LANE_PERMITIDA.includes(a) && !LUGARES_DECLARADOS.some((d) => a.startsWith(`${d}/`)),
    ).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Ninguna sección importa de otra')

function importsDe(codigo: string): string[] {
  const limpio = quitarComentarios(codigo)
  const desde = [...limpio.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1])
  const dinamicos = [...limpio.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1])
  return [...desde, ...dinamicos]
}

/** Los nombres de carpeta de sección, tal como aparecerían en un import relativo. */
const NOMBRES_DE_CARPETA = Object.fromEntries(
  Object.entries(CARPETAS_DE_SECCION).map(([id, ruta]) => [id, ruta.slice(ruta.lastIndexOf('/') + 1)]),
) as Record<string, string>

const cruces: string[] = []
for (const id of ORDEN_DE_SECCIONES_B) {
  const ajenas = ORDEN_DE_SECCIONES_B.filter((otra) => otra !== id).map((otra) => NOMBRES_DE_CARPETA[otra])
  for (const archivo of codigoDeLaSeccion(id)) {
    for (const especificador of importsDe(leer(archivo))) {
      if (ajenas.some((carpeta) => especificador.includes(carpeta))) {
        cruces.push(`${archivo} → ${especificador}`)
      }
    }
  }
}
afirmarIgual(cruces, [], 'ninguna sección importa de la carpeta de otra')

const importsRevisados = ORDEN_DE_SECCIONES_B.flatMap((id) =>
  codigoDeLaSeccion(id).flatMap((a) => importsDe(leer(a))),
)
afirmar(importsRevisados.length > 0, `el escáner miró ${importsRevisados.length} imports de las cuatro secciones`)

controlPositivo(
  'el detector ve un cruce entre secciones',
  "import { X } from '../_s8-cierre/contenido'",
  (codigo) => !importsDe(codigo).some((e) => e.includes('_s8-cierre')),
)

/** El contrapeso: cada sección SÍ consume el contrato. */
for (const id of ORDEN_DE_SECCIONES_B) {
  const usaElContrato = codigoDeLaSeccion(id).some((a) => importsDe(leer(a)).some((e) => e.includes('_contrato/')))
  afirmar(usaElContrato, `\`${id}\` consume el contrato`, 'si no lo consumiera, estaría construyendo aparte')
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los imports del lane, uno por uno')

const IMPORTS_PERMITIDOS = [
  'react',
  'react-dom',
  'react-dom/server',
  'next',
  'next/font/local',
  'next/dynamic',
  'next/image',
  'lucide-react',
  'motion/react',
  '@/lib/utils',
]

/**
 * ⚠️ ALCANCE: el CÓDIGO DE PRODUCTO, no los instrumentos.
 *
 * No es comodidad: el especificador de un `import` **es una cadena**, así que un
 * control positivo escrito como `"import … from '@prisma/client'"` es
 * indistinguible de un import real para cualquier detector. La primera corrida
 * de este archivo se cayó exactamente así, encontrando lo que ella misma había
 * escrito para probarse. Es la misma excepción declarada que S3 dejó escrita, y
 * acá se acota a la única familia donde vaciar las cadenas no funciona.
 */
const externosPorArchivo = CODIGO.map((archivo) => ({
  archivo,
  externos: importsDe(leer(archivo)).filter(
    (m) => !m.startsWith('.') && !m.startsWith('node:') && !IMPORTS_PERMITIDOS.includes(m),
  ),
})).filter((r) => r.externos.length > 0)

afirmarIgual(externosPorArchivo, [], 'ningún archivo de PRODUCTO importa fuera de la lista blanca')
const importsDeProducto = CODIGO.flatMap((a) => importsDe(leer(a)))
afirmar(importsDeProducto.length > 0, `el escáner miró ${importsDeProducto.length} imports de producto`)

controlPositivo('el escáner ve un import fuera de la lista', "import { PrismaClient } from '@prisma/client'", (codigo) =>
  importsDe(codigo).filter((m) => !m.startsWith('.') && !m.startsWith('node:') && !IMPORTS_PERMITIDOS.includes(m))
    .length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Nada de base de datos, ninguna zona del otro socio, cero `any`')

/**
 * El producto se mira entero; los instrumentos, con las CADENAS VACIADAS.
 *
 * Un instrumento tiene que poder escribir `const x: any = 1` adentro de un
 * string para probar su propio detector, y no por eso usa `any`. Vaciar las
 * cadenas conserva la cobertura —un `any` de verdad sigue estando en el código—
 * sin que el arnés se cuente a sí mismo.
 *
 * La ÚNICA excepción es `soporte.ts`, que declara los patrones como expresiones
 * regulares y no como cadenas. Está nombrada, y su motivo está escrito ahí.
 */
const paraProhibidos = [
  ...CODIGO.map((a) => ({ archivo: a, texto: quitarComentarios(leer(a)) })),
  ...[...INSTRUMENTOS, ...apoyosDelLane()]
    .filter((a) => a !== ARCHIVO_EXCEPTUADO_DEL_ESCANEO)
    .map((a) => ({ archivo: a, texto: sinCadenas(quitarComentarios(leer(a))) })),
]
for (const [nombre, patron] of PROHIBIDOS_EN_EL_LANE) {
  const donde = paraProhibidos.filter((r) => patron.test(r.texto)).map((r) => r.archivo)
  afirmarIgual(donde, [], `ningún archivo del lane usa ${nombre}`)
}
console.log(
  `  alcance: ${CODIGO.length} de producto (enteros) + ${paraProhibidos.length - CODIGO.length} instrumentos ` +
    `(con las cadenas vaciadas) · 1 exceptuado y nombrado: soporte.ts`,
)
afirmar(paraProhibidos.length > CODIGO.length, 'los instrumentos también entran en la revisión, no sólo el producto')

controlPositivo('el detector de `any` lo ve', 'const x: any = 1', (c: string) =>
  !PROHIBIDOS_EN_EL_LANE.some(([, p]) => p.test(c)),
)
controlPositivo('y el de `router.push` también', 'router.push("/a")', (c: string) =>
  !PROHIBIDOS_EN_EL_LANE.some(([, p]) => p.test(c)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El acento entra por `data-servicio` y se consume por ALIAS')

const acentos = valoresDeAcentoDelTema()
afirmarIgual(acentos.length, IDS_DE_SERVICIO.length, `el tema declara ${acentos.length} acentos por servicio`)
console.log(`  ${acentos.map((a) => a.token).join(' · ')}`)

/** El buscador: los VALORES concretos y los NOMBRES por servicio, los dos. */
const buscarAcentoConcreto = (texto: string): string[] => {
  const agujas = [
    ...acentos.map((a) => a.valor),
    ...IDS_DE_SERVICIO.map((id) => `--color-acento-${id}`),
  ]
  return agujas.filter((aguja) => texto.includes(aguja))
}

const codigoDelProducto = CODIGO.map((a) => quitarComentarios(leer(a))).join('\n')
afirmarIgual(
  buscarAcentoConcreto(codigoDelProducto),
  [],
  'ningún archivo de producto nombra el valor concreto de un acento ni su token por servicio',
)

controlPositivo('el buscador ve un valor concreto de acento', acentos[0].valor, (t) => buscarAcentoConcreto(t).length === 0)
controlPositivo('y ve un token por servicio', '--color-acento-web', (t) => buscarAcentoConcreto(t).length === 0)

/** El contrapeso: el alias SÍ se usa, o la afirmación de arriba no dice nada. */
const usosDelAlias = (codigoDelProducto.match(/\b(?:bg|text|border|fill|stroke)-acento\b/g) ?? []).length
const usosDelAtributo = (codigoDelProducto.match(/data-servicio/g) ?? []).length
afirmar(
  usosDelAlias > 0,
  `el alias del acento se consume ${usosDelAlias} vez/veces`,
  'sin esto, "cero valores concretos" sería compatible con "cero acento"',
)
afirmar(usosDelAtributo > 0, `y \`data-servicio\` aparece ${usosDelAtributo} vez/veces en el producto`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El foco: nadie apaga el anillo')

/** Mismo criterio: producto entero, instrumentos con las cadenas vaciadas. */
const apagados = paraProhibidos
  .map((r) => ({ archivo: r.archivo, encontrados: apagadosDeFoco(r.texto) }))
  .filter((r) => r.encontrados.length > 0)
afirmarIgual(apagados, [], 'cero apagados del anillo de foco en todo el lane')

controlPositivo('el detector ve las tres formas de escribirlo', 'outline: none; outline-width: 0; outline-style: none', (t) =>
  apagadosDeFoco(t).length === 0,
)
controlPositivo('y la utilidad de Tailwind', 'className="outline-none"', (t) => apagadosDeFoco(t).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Ningún archivo pasa las 300 líneas')

const medidos = [...CODIGO, ...INSTRUMENTOS].map((archivo) => ({
  archivo,
  lineas: leer(archivo).split('\n').length,
}))
afirmarIgual(
  medidos.filter((m) => m.lineas > 300),
  [],
  `ninguno de los ${medidos.length} archivos del lane pasa las 300 líneas`,
)
const masLargo = [...medidos].sort((a, b) => b.lineas - a.lineas)[0]
console.log(`  el más largo: ${masLargo.archivo.replace(`${LANE}/`, '')} — ${masLargo.lineas} líneas`)
afirmar(INSTRUMENTOS.length > 0, `${INSTRUMENTOS.length} instrumentos incluidos en la cuenta`)

controlPositivo('el medidor ve un archivo de 301 líneas', { archivo: 'inventado.ts', lineas: 301 }, (m) => m.lineas <= 300)

cerrar('s6-lane.invariant')
