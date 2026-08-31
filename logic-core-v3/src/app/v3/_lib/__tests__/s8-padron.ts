/**
 * EL PADRÓN DE SITIO-S8 — el contrato de entrega de los cuatro frentes.
 *
 * ⚠ **Escrito en la Fase 0, ANTES de despachar, y ésa es toda su utilidad.**
 * Un padrón escrito después es un inventario de lo que pasó; escrito antes es
 * el contrato: `entregablesQueFaltan()` dice qué frente no entregó y
 * `archivosSinRegistrar()` dice quién escribió de más.
 *
 * Es la forma que `s3-archivos.ts` y `s5-archivos.ts` ya usan —lista declarada
 * más recorrido del disco, en los dos sentidos— por la misma razón: un escáner
 * que recorre un directorio no se puede leer, y una lista escrita a mano se
 * queda vieja. Las dos juntas se leen y no se quedan viejas.
 *
 * ── Y acá hay una razón más, con su caso ───────────────────────────────────
 *
 * §7.21 de `DIRECCION-ESCENA.md`: *una corrida de `ultracode` con cuatro
 * subagentes se puede quedar a mitad por límite de gasto*. Cuando pasa, el
 * corte no avisa, deja el disco a medio llenar y **el reporte del workflow
 * vuelve vacío**. La regla que quedó es «inventariar el disco antes de creerle
 * al reporte», y esto es el inventario. Los scripts de `package.json` apuntan a
 * los instrumentos declarados acá: si un frente no entregó, la derivación de
 * suites falla nombrando el archivo que falta, en vez de pasar en verde.
 *
 * ── El reparto, y por qué son carpetas ajenas entre sí ────────────────────
 *
 * Cada frente escribe SOLO adentro de su carpeta. Lo que necesite de afuera lo
 * REPORTA; no lo escribe. Las excepciones están declaradas una por una en
 * `fueraDeLaCarpeta`, con su motivo — nunca por una heurística de nombre.
 *
 * ⚠ **Repartir archivos no reparte un sprint** (§7.26): el tipo de un dato
 * compartido viaja igual. Por eso los tres contratos —`_lib/escena/contrato.ts`,
 * `_intro/contrato.ts`, `_chrome/contrato.ts`— y el inventario del layout
 * (`components/layout/carga-diferida/contrato.ts`) los escribió el agente
 * principal y **ningún frente los modifica**: son la frontera, y la frontera
 * tiene una forma.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')

export interface AlcanceExterno {
  readonly archivo: string
  readonly motivo: string
}

export interface FrenteDeS8 {
  /** El identificador corto del frente. */
  readonly id: string
  readonly titulo: string
  /** La única carpeta donde este frente puede escribir. */
  readonly carpeta: string
  /** Lo que TIENE que existir al terminar. Si falta, el frente no entregó. */
  readonly entregables: readonly string[]
  /** Sus instrumentos, que además tienen script en `package.json`. */
  readonly instrumentos: readonly string[]
  /** Lo que puede tocar afuera de su carpeta, con su motivo. */
  readonly fueraDeLaCarpeta: readonly AlcanceExterno[]
}

const ESCENA = 'src/app/v3/_lib/escena'
const INTRO = 'src/app/v3/_intro'
const CHROME = 'src/app/v3/_chrome'
const PESO = 'src/components/layout/carga-diferida'

export const FRENTES: readonly FrenteDeS8[] = [
  {
    id: 'escena',
    titulo: 'La escena 3D — la mudanza y el montaje',
    carpeta: ESCENA,
    entregables: [
      `${ESCENA}/contrato.ts`,
      `${ESCENA}/EscenaDelHome.tsx`,
      `${ESCENA}/__tests__/s8-escena.invariant.ts`,
      `${ESCENA}/__tests__/s8-tinta.invariant.ts`,
      `${ESCENA}/__tests__/s8-tres.invariant.ts`,
    ],
    instrumentos: [
      `${ESCENA}/__tests__/s8-escena.invariant.ts`,
      `${ESCENA}/__tests__/s8-tinta.invariant.ts`,
      `${ESCENA}/__tests__/s8-tres.invariant.ts`,
    ],
    fueraDeLaCarpeta: [
      {
        archivo: 'src/app/probe-escena/',
        motivo:
          'Los imports que la mudanza obliga, y NADA más. `/probe-escena` sigue funcionando ' +
          'consumiendo desde el destino: es la herramienta de calibración y se usa. Ni un valor ' +
          'de la escena cambia — mudar no es reescribir.',
      },
    ],
  },
  {
    id: 'intro',
    titulo: 'El preloader — montarlo en el home nuevo',
    carpeta: INTRO,
    entregables: [
      `${INTRO}/contrato.ts`,
      `${INTRO}/IntroDelHome.tsx`,
      `${INTRO}/__tests__/s8-intro.invariant.ts`,
      `${INTRO}/__tests__/s8-relevo.invariant.ts`,
    ],
    instrumentos: [
      `${INTRO}/__tests__/s8-intro.invariant.ts`,
      `${INTRO}/__tests__/s8-relevo.invariant.ts`,
    ],
    fueraDeLaCarpeta: [],
  },
  {
    id: 'chrome',
    titulo: 'El chrome del home — pastilla, pie y cursor',
    carpeta: CHROME,
    entregables: [
      `${CHROME}/contrato.ts`,
      `${CHROME}/ChromeDelHome.tsx`,
      `${CHROME}/__tests__/s8-chrome.invariant.ts`,
    ],
    instrumentos: [`${CHROME}/__tests__/s8-chrome.invariant.ts`],
    fueraDeLaCarpeta: [
      {
        archivo: 'src/app/v3/_secciones/cierre/contenido.ts',
        motivo: 'Ampliar el recorrido del pie de cuatro secciones a las ocho que existen (§7.24).',
      },
      {
        archivo: 'src/app/v3/_secciones/cierre/ColumnasDelPie.tsx',
        motivo: 'Uno de los dos candidatos del rodeo de `peso`. Ver `_chrome/contrato.ts`.',
      },
      {
        archivo: 'src/app/v3/_secciones/cierre/s8-cierre.invariant.tsx',
        motivo:
          'Su instrumento, si una afirmación deja de valer al ampliar el recorrido. Se REEMPLAZA ' +
          'y se explica; nunca se afloja (regla 8).',
      },
      {
        archivo: 'src/app/v3/_secciones/servicios/ContenidoDeServicio.tsx',
        motivo: 'El otro candidato del rodeo de `peso`.',
      },
      {
        archivo: 'src/app/v3/_secciones/servicios/s6-servicios.invariant.tsx',
        motivo: 'Su instrumento, por lo mismo que el de la sección de cierre.',
      },
    ],
  },
  {
    id: 'peso',
    titulo: 'El peso del layout raíz — la compuerta al revés, una capa arriba',
    carpeta: PESO,
    entregables: [
      `${PESO}/contrato.ts`,
      `${PESO}/__tests__/s8-diferido.invariant.ts`,
      `${PESO}/__tests__/s8-peso.invariant.ts`,
    ],
    instrumentos: [
      `${PESO}/__tests__/s8-diferido.invariant.ts`,
      `${PESO}/__tests__/s8-peso.invariant.ts`,
    ],
    fueraDeLaCarpeta: [
      {
        archivo: 'src/app/layout.tsx',
        motivo:
          '⚠️ EL SITIO VIVO. Se cambia CÓMO se importa, nunca QUÉ renderiza. Es de este frente y ' +
          'de nadie más.',
      },
    ],
  },
]

/**
 * Los enchufes: lo que escribió el agente principal en la Fase 0 y **ningún
 * frente modifica**. Están declarados para poder afirmarlo, y para que se lea
 * de un vistazo dónde está la frontera.
 */
export const ENCHUFES: readonly string[] = [
  'src/app/v3/_lib/marcaEscena.ts',
  'src/app/v3/_lib/escena/contrato.ts',
  'src/app/v3/_componentes/EscenarioCompuerta.tsx',
  'src/app/v3/_intro/contrato.ts',
  'src/components/layout/home-intro/introRutas.ts',
  'src/app/v3/_chrome/contrato.ts',
  'src/components/layout/carga-diferida/contrato.ts',
  'src/app/v3/page.tsx',
  'src/app/v3/_lib/__tests__/s8-padron.ts',
  'src/app/v3/_lib/__tests__/s8-largos.ts',
  'src/app/v3/_lib/__tests__/s8-montaje.invariant.ts',
  'package.json',
]

/** El instrumento del agente principal, que corre la integración. */
export const INSTRUMENTO_DEL_MONTAJE = 'src/app/v3/_lib/__tests__/s8-montaje.invariant.ts'

/**
 * Quién puede importar `_lib/marcaEscena.ts`.
 *
 * ⚠ **LO QUE SE PROTEGE ES LA APLICACIÓN, NO EL REPO.** Un instrumento importa
 * la marca porque su trabajo es buscarla en la salida del build, y ninguno entra
 * jamás en un bundle. Lo que no puede pasar es que la importe un módulo que la
 * carga inicial de `/v3` ALCANCE: ahí la marca viajaría con él y la compuerta
 * gotearía sin que nada se queje.
 *
 * La lista se DERIVA de los instrumentos declarados arriba, y eso no es una
 * heurística de sufijo: es la lista que la Fase 0 escribió y que `package.json`
 * cablea. Excluir «todo lo que termine en `.invariant`» sería el agujero que
 * parece una decisión. Un instrumento nuevo que la importe sin estar declarado
 * hace fallar el check, y está bien que lo haga.
 */
export const PUEDEN_IMPORTAR_LA_MARCA: readonly string[] = [
  'src/app/v3/_lib/escena/EscenaDelHome.tsx',
  ...FRENTES.flatMap((f) => f.instrumentos),
  INSTRUMENTO_DEL_MONTAJE,
]

/** Todos los scripts que la Fase 0 declaró, con el archivo al que apuntan. */
export const SCRIPTS_DECLARADOS: Readonly<Record<string, string>> = {
  'test:s8-escena': `${ESCENA}/__tests__/s8-escena.invariant.ts`,
  'test:s8-tinta': `${ESCENA}/__tests__/s8-tinta.invariant.ts`,
  'test:s8-tres': `${ESCENA}/__tests__/s8-tres.invariant.ts`,
  'test:s8-intro': `${INTRO}/__tests__/s8-intro.invariant.ts`,
  'test:s8-relevo': `${INTRO}/__tests__/s8-relevo.invariant.ts`,
  'test:s8-chrome': `${CHROME}/__tests__/s8-chrome.invariant.ts`,
  'test:s8-diferido': `${PESO}/__tests__/s8-diferido.invariant.ts`,
  'test:s8-peso': `${PESO}/__tests__/s8-peso.invariant.ts`,
  'test:s8-montaje': INSTRUMENTO_DEL_MONTAJE,
}

export function leer(relativo: string): string {
  return readFileSync(path.join(RAIZ, relativo), 'utf8')
}

export function existe(relativo: string): boolean {
  try {
    statSync(path.join(RAIZ, relativo))
    return true
  } catch {
    return false
  }
}

/** Recorre una carpeta y devuelve rutas relativas a la raíz, con barras normales. */
export function recorrer(relativo: string, acumulado: string[] = []): string[] {
  if (!existe(relativo)) return acumulado
  for (const entrada of readdirSync(path.join(RAIZ, relativo), { withFileTypes: true })) {
    const hijo = `${relativo}/${entrada.name}`
    if (entrada.isDirectory()) recorrer(hijo, acumulado)
    else acumulado.push(hijo)
  }
  return acumulado.sort()
}

/** Lo declarado que NO está en disco: alguien no entregó. */
export function entregablesQueFaltan(): string[] {
  return FRENTES.flatMap((f) => f.entregables).filter((a) => !existe(a))
}

/**
 * Lo que está en disco adentro de una carpeta de frente y no está declarado.
 *
 * ⚠ No es una falla por sí sola: un frente puede necesitar partir un archivo
 * que pasó las 300 líneas, y la regla del repo es que lo parta. Se PUBLICA y se
 * afirma otra cosa —que ningún archivo suelto termine en `.invariant.ts` sin
 * script, que eso sí es un instrumento que no corre nunca—.
 */
export function archivosSinRegistrar(): string[] {
  const declarados = new Set(FRENTES.flatMap((f) => f.entregables))
  return FRENTES.flatMap((f) => recorrer(f.carpeta)).filter((a) => !declarados.has(a))
}

/**
 * Los ESPECIFICADORES de import de un archivo, estáticos y perezosos.
 *
 * ⚠ Vive acá y no adentro del invariante por la razón de `s7-soporte.ts`: **un
 * detector se prueba corriendo la MISMA función contra una entrada rota**, y
 * para eso tiene que estar afuera del archivo que la usa.
 *
 * Se borran los comentarios —para que un docblock que nombra un módulo no
 * cuente como import (§7.25)— y **no se borran las cadenas**, porque el
 * especificador ES una cadena. Borrarlas es el error que la primera versión de
 * este detector cometió: quedaba ciego y su afirmación pasaba verde por vacío.
 */
export function especificadoresDeImport(fuente: string): string[] {
  const limpio = fuente.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
  return [
    ...[...limpio.matchAll(/^\s*import\s[\s\S]*?from\s+'([^']+)'/gm)].map((m) => m[1]),
    ...[...limpio.matchAll(/import\(\s*'([^']+)'\s*\)/g)].map((m) => m[1]),
  ]
}

/** El frente dueño de un archivo, o `sin dueño`. */
export function duenoDe(archivo: string): string {
  for (const frente of FRENTES) {
    if (archivo === frente.carpeta || archivo.startsWith(`${frente.carpeta}/`)) return frente.id
    if (frente.fueraDeLaCarpeta.some((e) => archivo === e.archivo || archivo.startsWith(e.archivo))) {
      return frente.id
    }
  }
  if (ENCHUFES.includes(archivo)) return 'enchufe'
  return 'sin dueño'
}
