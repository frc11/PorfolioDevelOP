/**
 * EL PADRÓN DE ARCHIVOS DEL LANE A — declarado antes de escribir una línea.
 *
 * ── Por qué se declara ANTES, y no después ────────────────────────────────
 *
 * Porque las cuatro secciones se construyeron en paralelo, cada una por un
 * subagente que sólo podía escribir dentro de su carpeta. Un padrón escrito
 * después sería un inventario de lo que pasó; escrito antes es **el contrato de
 * entrega**: `archivosDeclaradosQueFaltan()` dice qué subagente no entregó, y
 * `archivosSinRegistrar()` dice quién escribió de más.
 *
 * Es la misma forma que usa `s3-archivos.ts` —lista declarada más recorrido del
 * disco, en los dos sentidos— por la misma razón: un escáner que recorre un
 * directorio no se puede leer, y una lista escrita a mano se queda vieja. Las
 * dos juntas se leen y no se quedan viejas.
 *
 * ⚠ Los propios instrumentos NO se escanean por contenido: sus controles
 * positivos contienen a propósito hex, píxeles sueltos y cifras inventadas
 * —son las entradas equivocadas contra las que se prueba cada detector— así que
 * incluirlos haría fallar las comprobaciones por su propio arnés.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')

const LANE = 'src/app/v3/secciones-a'

/**
 * EL CONTRATO — escrito en la fase 0, antes de despachar a nadie.
 *
 * Seis archivos, y ninguna sección los modifica. Es la respuesta a "¿qué es un
 * archivo compartido?": esto.
 */
export const ARCHIVOS_DEL_CONTRATO = [
  `${LANE}/_contrato/forma.ts`,
  `${LANE}/_contrato/marcadores.ts`,
  `${LANE}/_contrato/pedido.ts`,
  `${LANE}/_contrato/coreografia.tsx`,
  `${LANE}/_contrato/piezas.tsx`,
  `${LANE}/_contrato/medios.tsx`,
  `${LANE}/_contrato/Seccion.tsx`,
  `${LANE}/_contrato/ritmo.ts`,
  `${LANE}/_contrato/registro.ts`,
]

/** Las cuatro carpetas de sección, con su slug y sus tres archivos. */
export interface CarpetaDeSeccion {
  readonly id: string
  readonly carpeta: string
  readonly componente: string
  readonly contenido: string
  readonly invariante: string
}

export const CARPETAS_DE_SECCION: readonly CarpetaDeSeccion[] = [
  {
    id: 'hero',
    carpeta: `${LANE}/hero`,
    componente: `${LANE}/hero/Hero.tsx`,
    contenido: `${LANE}/hero/contenido.ts`,
    invariante: `${LANE}/hero/hero.invariant.tsx`,
  },
  {
    id: 'quienes-somos',
    carpeta: `${LANE}/quienes-somos`,
    componente: `${LANE}/quienes-somos/QuienesSomos.tsx`,
    contenido: `${LANE}/quienes-somos/contenido.ts`,
    invariante: `${LANE}/quienes-somos/quienes-somos.invariant.tsx`,
  },
  {
    id: 'numeros',
    carpeta: `${LANE}/numeros`,
    componente: `${LANE}/numeros/Numeros.tsx`,
    contenido: `${LANE}/numeros/contenido.ts`,
    invariante: `${LANE}/numeros/numeros.invariant.tsx`,
  },
  {
    id: 'trabajos',
    carpeta: `${LANE}/trabajos`,
    componente: `${LANE}/trabajos/Trabajos.tsx`,
    contenido: `${LANE}/trabajos/contenido.ts`,
    invariante: `${LANE}/trabajos/trabajos.invariant.tsx`,
  },
]

/**
 * Las piezas de un componente que no entró en 300 líneas.
 *
 * La regla del repo es que un archivo de más de 300 líneas se parte, y partir
 * una sección no es una excepción a la carpeta cerrada: la pieza queda ADENTRO
 * de su sección y se declara acá. `numeros/Cifra.tsx` salió de `Numeros.tsx`
 * cuando su docblock del defecto de `tailwind-merge` lo pasó de largo.
 *
 * ⚠ Estas piezas SÍ pintan pantalla, así que entran en `ARCHIVOS_ESCANEABLES`
 * —a diferencia de `ARCHIVOS_DE_APOYO`, que son instrumentos.
 */
export const ARCHIVOS_DE_PIEZA = [`${LANE}/numeros/Cifra.tsx`, `${LANE}/trabajos/Proyecto.tsx`]

/** La ruta de demostración. Deuda con fecha de baja, registrada en S4. */
export const ARCHIVOS_DE_RUTA = [`${LANE}/page.tsx`]

/** Los componentes de las cuatro secciones. */
export const ARCHIVOS_DE_COMPONENTE = CARPETAS_DE_SECCION.map((c) => c.componente)

/** Los contenidos: la tabla que Franco edita. Ninguno lleva JSX. */
export const ARCHIVOS_DE_CONTENIDO = CARPETAS_DE_SECCION.map((c) => c.contenido)

/** Los invariantes propios de cada sección. NO se escanean por contenido. */
export const ARCHIVOS_DE_INVARIANTE = CARPETAS_DE_SECCION.map((c) => c.invariante)

/**
 * Los módulos de APOYO de un invariante — declarados uno por uno.
 *
 * Aparecen cuando un invariante no entra en 300 líneas y hay que sacarle las
 * funciones auxiliares y las tablas. **Cuentan como instrumento, no como
 * pantalla**: llevan hex, píxeles sueltos y cifras inventadas a propósito
 * —son las entradas equivocadas contra las que se prueba cada detector— así
 * que entran en el padrón (para que el disco cierre) y quedan FUERA de
 * `ARCHIVOS_ESCANEABLES`.
 *
 * ⚠ Se declaran a mano y no se detectan por el nombre. Una heurística de
 * sufijo (`-piezas`) sería exactamente la clase de exclusión silenciosa que
 * este proyecto viene cazando: un archivo se saca del escaneo porque alguien
 * lo decidió y lo escribió acá, no porque se llame de una manera.
 *
 * ⚠ Ninguno puede terminar en `.invariant.ts(x)`: sería un instrumento sin
 * script, y `s4-cobertura` lo marcaría como huérfano.
 */
export const ARCHIVOS_DE_APOYO = [
  `${LANE}/quienes-somos/quienes-somos-piezas.tsx`,
  `${LANE}/trabajos/trabajos-piezas.ts`,
]

/** Todo lo que el lane escribe adentro de `secciones-a/`. */
export const ARCHIVOS_DEL_LANE = [
  ...ARCHIVOS_DEL_CONTRATO,
  ...ARCHIVOS_DE_COMPONENTE,
  ...ARCHIVOS_DE_PIEZA,
  ...ARCHIVOS_DE_CONTENIDO,
  ...ARCHIVOS_DE_INVARIANTE,
  ...ARCHIVOS_DE_APOYO,
  ...ARCHIVOS_DE_RUTA,
]

/**
 * Lo que se escanea buscando valores fuera de los tokens y cifras inventadas:
 * todo menos los instrumentos.
 */
export const ARCHIVOS_ESCANEABLES = [
  ...ARCHIVOS_DEL_CONTRATO,
  ...ARCHIVOS_DE_COMPONENTE,
  ...ARCHIVOS_DE_PIEZA,
  ...ARCHIVOS_DE_CONTENIDO,
  ...ARCHIVOS_DE_RUTA,
]

/**
 * Los archivos de FUERA del lane que este sprint modificó. Se declaran acá para
 * que el reporte no tenga que acordarse de ellos y para que un instrumento
 * pueda afirmar que la lista es exactamente ésa.
 *
 * `secciones.ts` lleva el recorrido de superficies de las OCHO —decisión de
 * §0.2, y el archivo es uno solo—; `superficies.ts` sólo un docblock que había
 * quedado mintiendo; `superficies.invariant.ts` la afirmación que cambió con la
 * decisión; `s4-rutas-de-demo.ts` el registro de la ruta nueva; `package.json`
 * los scripts de los invariantes.
 */
export const ARCHIVOS_TOCADOS_FUERA_DEL_LANE = [
  'src/app/v3/_lib/secciones.ts',
  'src/app/v3/_lib/superficies.ts',
  'src/app/v3/_lib/__tests__/superficies.invariant.ts',
  'src/app/v3/_lib/__tests__/s4-rutas-de-demo.ts',
  'package.json',
]

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

/** Recorre `secciones-a/` entero, en rutas relativas y con barras normales. */
export function recorrerElLane(): string[] {
  const encontrados: string[] = []
  const bajar = (dir: string): void => {
    for (const entrada of readdirSync(path.join(RAIZ, dir), { withFileTypes: true })) {
      const hijo = `${dir}/${entrada.name}`
      if (entrada.isDirectory()) bajar(hijo)
      else encontrados.push(hijo)
    }
  }
  if (existe(LANE)) bajar(LANE)
  return encontrados.sort()
}

/** Lo que está en disco y no en el padrón: alguien escribió de más. */
export function archivosSinRegistrar(): string[] {
  const declarados = new Set(ARCHIVOS_DEL_LANE)
  return recorrerElLane().filter((archivo) => !declarados.has(archivo))
}

/** Lo que está en el padrón y no en disco: alguien no entregó. */
export function archivosDeclaradosQueFaltan(): string[] {
  return ARCHIVOS_DEL_LANE.filter((archivo) => !existe(archivo))
}

/**
 * Los archivos que una sección escribió FUERA de su carpeta.
 *
 * Es la regla 1 de los subagentes, hecha comprobable: cada uno escribe sólo
 * dentro de lo suyo. La comprobación no puede ser sobre `git` —eso vencería al
 * commitear, regla 12— así que es estructural: el padrón declara qué archivo es
 * de quién, y esto lo verifica contra el disco.
 */
export function duenoDe(archivo: string): string {
  for (const carpeta of CARPETAS_DE_SECCION) {
    if (archivo.startsWith(`${carpeta.carpeta}/`)) return carpeta.id
  }
  if (archivo.startsWith(`${LANE}/_contrato/`)) return 'contrato'
  if (ARCHIVOS_DE_RUTA.includes(archivo)) return 'ruta'
  return 'sin dueño'
}

export const RAIZ_DEL_LANE = LANE
