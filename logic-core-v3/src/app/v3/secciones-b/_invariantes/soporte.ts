/**
 * LA PLOMERÍA DE LOS INSTRUMENTOS DEL LANE — leer archivos y recorrer el árbol.
 *
 * Lo que lee MARCADO —atributos, anidamiento, poda de subárboles— vive en
 * `marcado.ts`: salió de acá el día que este archivo cruzó las 300 líneas.
 *
 * Vive aparte de los invariantes por la misma razón que `s3-escaneo.ts` y
 * `s3-archivos.ts`: **un detector se prueba corriendo la MISMA función contra
 * una entrada rota**, y para eso la función tiene que estar afuera del archivo
 * que la usa. Un detector que se prueba a sí mismo con otra copia del código no
 * prueba nada.
 *
 * ⚠️ Los propios instrumentos NO se escanean, y hay que decirlo: sus controles
 * positivos contienen a propósito hex, píxeles sueltos y la frase con cifras
 * inventadas que el lane existe para no escribir. Incluirlos haría fallar las
 * comprobaciones por culpa de su propio arnés. Es la misma excepción declarada
 * que S3 dejó escrita.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Cinco niveles: _invariantes → secciones-b → v3 → app → src → raíz. */
export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')

/** La carpeta del lane, relativa a la raíz del proyecto y con barras normales. */
export const LANE = 'src/app/v3/secciones-b'

export const CARPETA_DE_CONTRATO = `${LANE}/_contrato`
export const CARPETA_DE_INVARIANTES = `${LANE}/_invariantes`

/** Una carpeta por sección; nadie escribe fuera de la suya. */
export const CARPETAS_DE_SECCION: Readonly<Record<string, string>> = {
  servicios: `${LANE}/_s5-servicios`,
  'tu-panel': `${LANE}/_s6-tu-panel`,
  'por-que-develop': `${LANE}/_s7-por-que-develop`,
  cierre: `${LANE}/_s8-cierre`,
}

export function existe(relativo: string): boolean {
  try {
    statSync(path.join(RAIZ, relativo))
    return true
  } catch {
    return false
  }
}

export function leer(relativo: string): string {
  return readFileSync(path.join(RAIZ, relativo), 'utf8')
}

/** Todos los archivos de una carpeta, recursivo, en rutas relativas a la raíz. */
export function recorrer(relativo: string, acumulado: string[] = []): string[] {
  if (!existe(relativo)) return acumulado
  for (const entrada of readdirSync(path.join(RAIZ, relativo), { withFileTypes: true })) {
    const hijo = `${relativo}/${entrada.name}`
    if (entrada.isDirectory()) recorrer(hijo, acumulado)
    else acumulado.push(hijo)
  }
  return acumulado.sort()
}

/** El árbol entero del lane, la ruta incluida. */
export function archivosDelLane(): string[] {
  return recorrer(LANE)
}

/** Los `.ts`/`.tsx` de PRODUCTO: ni instrumentos ni sus módulos de apoyo. */
export function codigoDelLane(): string[] {
  return archivosDelLane().filter(
    (a) =>
      /\.tsx?$/.test(a) &&
      !a.startsWith(`${CARPETA_DE_INVARIANTES}/`) &&
      !/\.invariant\.tsx?$/.test(a) &&
      !MODULOS_DE_APOYO.some((apoyo) => a.endsWith(`/${apoyo}`)),
  )
}

/** Los instrumentos del lane, estén donde estén. */
export function instrumentosDelLane(): string[] {
  return archivosDelLane().filter((a) => /\.invariant\.tsx?$/.test(a))
}

/**
 * Los módulos de apoyo de los instrumentos. No son producto y no son
 * invariantes: son la plomería que salió de un invariante al partirse.
 *
 * Se listan aparte para que la regla de las 300 líneas los cubra igual —el
 * tamaño se mide sobre todo lo que el lane escribe— sin que los escáneres de
 * contenido los miren.
 */
export function apoyosDelLane(): string[] {
  return archivosDelLane().filter((a) => MODULOS_DE_APOYO.some((apoyo) => a.endsWith(`/${apoyo}`)))
}

/**
 * LOS MÓDULOS DE APOYO DE UN INSTRUMENTO — no son producto y no se escanean.
 *
 * Cuando un invariante de sección cruza las 300 líneas, lo que sale es su
 * plomería: los detectores puros y las entradas rotas contra las que se prueban.
 * Las dos secciones que tuvieron que partirse eligieron por separado los mismos
 * dos nombres, así que la convención existe: acá se declara.
 *
 * ⚠️ **Por qué importa que estén excluidos:** un módulo de apoyo guarda a
 * propósito lo que el lane prohíbe —un hex, un píxel suelto, la frase con cifras
 * inventadas—, porque es la entrada equivocada contra la que corre el control
 * positivo. Escanearlo hace fallar la comprobación contra su propio arnés. Es la
 * tercera vez que este defecto aparece en el sprint, y por eso deja de
 * arreglarse caso por caso y pasa a estar en la función que reparte el alcance.
 */
export const MODULOS_DE_APOYO: readonly string[] = ['deteccion.ts', 'soporte.ts']

/**
 * Los archivos de PRODUCTO de una sección, para que su propio invariante se mire
 * a sí mismo sin recorrer el lane entero.
 */
export function codigoDeLaSeccion(id: string): string[] {
  const carpeta = CARPETAS_DE_SECCION[id]
  if (carpeta === undefined) throw new Error(`secciones-b: no hay carpeta declarada para "${id}"`)
  return recorrer(carpeta).filter(
    (a) =>
      /\.tsx?$/.test(a) &&
      !/\.invariant\.tsx?$/.test(a) &&
      !MODULOS_DE_APOYO.some((apoyo) => a.endsWith(`/${apoyo}`)),
  )
}

/**
 * LO QUE NINGÚN ARCHIVO DEL LANE PUEDE NOMBRAR.
 *
 * ⚠️ **La tabla vive acá, y este archivo es la ÚNICA excepción declarada del
 * escaneo.** El motivo es concreto y lo encontró la segunda corrida: los
 * patrones son EXPRESIONES REGULARES, no cadenas, así que `sinCadenas` no las
 * vacía y el detector se encontraba a sí mismo. Sacándolos acá, el invariante
 * que los usa —y los cuatro de sección, que es donde importa— sí se escanean.
 *
 * Un archivo exceptuado tiene que ser uno donde no pueda esconderse nada, y éste
 * lo es: no tiene lógica de producto, no renderiza, y su contenido entero son
 * lectores de disco y detectores.
 */
export const ARCHIVO_EXCEPTUADO_DEL_ESCANEO = `${CARPETA_DE_INVARIANTES}/soporte.ts`

export const PROHIBIDOS_EN_EL_LANE: readonly (readonly [string, RegExp])[] = [
  ['prisma', /\bprisma\b/i],
  ['PrismaClient', /\bPrismaClient\b/],
  ['OsLead', /\bOsLead\w*/],
  ['ActivityChannel', /\bActivityChannel\b/],
  ['/setter', /['"@/][^'"]*\/setter\b/],
  ['/leados', /['"@/][^'"]*\/leados\b/],
  ['router.push', /\brouter\.push\s*\(/],
  ['any', /:\s*any\b|<any>|\bas\s+any\b/],
]

/**
 * El código sin el CONTENIDO de sus cadenas, conservando las comillas.
 *
 * ── El defecto que esto arregla, y lo encontró la primera corrida ─────────
 *
 * `s6-lane.invariant.ts` se escaneaba a sí mismo y se caía con OCHO fallas: sus
 * propios controles positivos contienen `@prisma/client`, `router.push`,
 * `const x: any = 1` y las tres formas de apagar el anillo de foco. El
 * instrumento estaba encontrando lo que él mismo había escrito para probarse.
 *
 * Es el mismo modo de falla que S1 documentó con Tailwind —nombrar un token lo
 * rescata de la poda— y que S3 resolvió sacando los instrumentos del padrón
 * escaneado. Acá se resuelve mejor donde se puede: en vez de exceptuar el
 * archivo entero, se le vacían las cadenas. Un `any` de verdad sigue estando en
 * el código; un `any` adentro de un string de control, no.
 *
 * ⚠️ NO sirve para buscar imports: el especificador de un `import` ES una
 * cadena. Para eso el alcance sigue siendo el código de producto.
 */
export function sinCadenas(codigo: string): string {
  return codigo
    .replace(/`(?:[^`\\]|\\.)*`/g, '``')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
}

/**
 * Las clases de utilidad que escribe un texto. Se usa para preguntar por
 * `text-acento`, `bg-acento` y compañía sin depender de dónde estén escritas.
 */
export function clasesEscritas(texto: string): string[] {
  return [...texto.matchAll(/class(?:Name)?="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean)
}

/**
 * LA ENTRADA DEL CONTROL POSITIVO DEL ESCÁNER DE CONTENIDO.
 *
 * Es la frase que este lane existe para no escribir, y tiene que hacer saltar a
 * los tres detectores: cifras con símbolo, precio y números sin declarar.
 *
 * **Vive acá y no en `_contrato/contenido.ts` por una razón concreta:** contiene
 * dígitos pegados a `%` y a `$`, o sea exactamente lo que el escáner de tokens
 * rechaza. En un archivo de producto haría fallar la comprobación contra su
 * propio arnés. Los instrumentos están declarados como no escaneados justamente
 * para poder guardar acá las entradas rotas.
 */
export const CONTENIDO_PROHIBIDO_DE_CONTROL =
  'Crecimos +340% en 3 meses, con planes desde $99.000 por mes y ×2 de leads.'

/**
 * Los tres valores concretos del acento, LEÍDOS del tema en vez de escritos.
 *
 * Si mañana alguien cambia un acento, el buscador lo sigue: una lista escrita a
 * mano quedaría vieja y el detector empezaría a pasar en verde sobre un color
 * que ya no es ése. Y de paso: escribirlos acá los metería en el repositorio
 * como literales, que es exactamente lo que la regla prohíbe.
 */
export function valoresDeAcentoDelTema(): { readonly token: string; readonly valor: string }[] {
  const css = leer('src/app/theme-develop.css').replace(/\/\*[\s\S]*?\*\//g, '')
  return [...css.matchAll(/(--color-acento-[a-z-]+)\s*:\s*([^;]+);/g)].map((m) => ({
    token: m[1],
    valor: m[2].trim(),
  }))
}
