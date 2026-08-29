/**
 * EL PADRÓN DE ARCHIVOS DEL SPRINT — una sola lista, para todos los
 * instrumentos.
 *
 * ── Por qué está declarada y además verificada ────────────────────────────
 *
 * Un escáner que recorre un directorio no puede quedar desactualizado, pero
 * tampoco se puede leer: nadie sabe qué cubrió. Una lista escrita se lee, pero
 * se queda vieja en el primer archivo nuevo y la comprobación empieza a pasar
 * en verde sobre menos código del que cree.
 *
 * Acá están las dos: la lista se declara, y `archivosSinRegistrar()` recorre
 * los directorios del sprint y devuelve lo que está en disco y no en la lista
 * —mientras `archivosDeclaradosQueFaltan()` mira el sentido inverso, que un
 * renombre también rompe—. Agregar un componente sin registrarlo hace fallar
 * todos los instrumentos a la vez, que es exactamente lo que tiene que pasar.
 *
 * ⚠ Los propios instrumentos NO se escanean, y hay que decirlo: sus controles
 * positivos contienen hex y píxeles sueltos A PROPÓSITO —son las entradas
 * equivocadas contra las que se prueba cada detector— así que incluirlos haría
 * fallar las comprobaciones por su propio arnés.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')

const V3 = 'src/app/v3'

/** Las cinco hojas del chrome. Todo el movimiento de estado vive acá. */
export const ARCHIVOS_DE_ESTILO = [
  `${V3}/_estilos/cta.css`,
  `${V3}/_estilos/navegacion.css`,
  `${V3}/_estilos/cursor.css`,
  `${V3}/_estilos/pie.css`,
  `${V3}/_estilos/foco.css`,
]

/** Los componentes. Ninguno importa un `.css`: por eso los instrumentos los
 *  pueden cargar y renderizar. */
export const ARCHIVOS_DE_COMPONENTE = [
  `${V3}/_componentes/chrome/Cta.tsx`,
  `${V3}/_componentes/chrome/CursorCompuerta.tsx`,
  `${V3}/_componentes/chrome/CursorPropio.tsx`,
  `${V3}/_componentes/chrome/Navegacion.tsx`,
  `${V3}/_componentes/chrome/Novedades.tsx`,
  `${V3}/_componentes/chrome/Pie.tsx`,
  `${V3}/_componentes/chrome/PiePiezas.tsx`,
  `${V3}/_componentes/layout/Envoltorio.tsx`,
  `${V3}/_componentes/layout/Grilla.tsx`,
  `${V3}/_componentes/medios/Imagen.tsx`,
  `${V3}/_componentes/tipografia/Textos.tsx`,
  `${V3}/_componentes/tipografia/Titular.tsx`,
]

/** Los datos y los hooks. Sin JSX, para que se puedan afirmar sin React. */
export const ARCHIVOS_DE_DATOS = [
  `${V3}/_lib/cta.ts`,
  `${V3}/_lib/cursor.ts`,
  `${V3}/_lib/imagen.ts`,
  `${V3}/_lib/marcaCursor.ts`,
  `${V3}/_lib/navegacion.ts`,
  `${V3}/_lib/tipografia.ts`,
  `${V3}/_lib/usePrefiereMenosMovimiento.ts`,
]

/** Las dos rutas de demostración y sus bloques. Deuda con fecha de baja. */
export const ARCHIVOS_DE_RUTA = [
  `${V3}/componentes/page.tsx`,
  `${V3}/componentes/_bloques/Ficha.tsx`,
  `${V3}/componentes/_bloques/GaleriaCta.tsx`,
  `${V3}/componentes/_bloques/GaleriaLayout.tsx`,
  `${V3}/componentes/_bloques/GaleriaMedios.tsx`,
  `${V3}/componentes/_bloques/GaleriaNavegacion.tsx`,
  `${V3}/componentes/_bloques/GaleriaPie.tsx`,
  `${V3}/tipografia/page.tsx`,
  `${V3}/tipografia/muestra/page.tsx`,
  `${V3}/tipografia/_bloques/Escala.tsx`,
  `${V3}/tipografia/_bloques/Multiplicadores.tsx`,
]

/** Todo lo que el sprint escribe y que las comprobaciones tienen que cubrir. */
export const ARCHIVOS_DEL_SPRINT = [
  ...ARCHIVOS_DE_ESTILO,
  ...ARCHIVOS_DE_COMPONENTE,
  ...ARCHIVOS_DE_DATOS,
  ...ARCHIVOS_DE_RUTA,
]

/** Los `.tsx` y `.ts` — todo menos las hojas de estilo. */
export const ARCHIVOS_DE_CODIGO = [
  ...ARCHIVOS_DE_COMPONENTE,
  ...ARCHIVOS_DE_DATOS,
  ...ARCHIVOS_DE_RUTA,
]

/** Los directorios que son enteramente de este sprint. */
const DIRECTORIOS_PROPIOS = [
  `${V3}/_estilos`,
  `${V3}/_componentes/chrome`,
  `${V3}/_componentes/layout`,
  `${V3}/_componentes/medios`,
  `${V3}/_componentes/tipografia`,
  `${V3}/componentes`,
  `${V3}/tipografia`,
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

/** Recorre los directorios propios y devuelve lo que encuentra, en rutas
 *  relativas a la raíz y con barras normales. */
export function recorrerDirectoriosPropios(): string[] {
  const encontrados: string[] = []
  const bajar = (dir: string): void => {
    for (const entrada of readdirSync(path.join(RAIZ, dir), { withFileTypes: true })) {
      const hijo = `${dir}/${entrada.name}`
      if (entrada.isDirectory()) bajar(hijo)
      else encontrados.push(hijo)
    }
  }
  for (const dir of DIRECTORIOS_PROPIOS) if (existe(dir)) bajar(dir)
  return encontrados.sort()
}

/**
 * Los archivos que están en disco y no en el padrón.
 *
 * Devuelve la lista en vez de un booleano para que el instrumento pueda
 * nombrarlos: "hay 2 archivos sin registrar" no dice cuáles.
 */
export function archivosSinRegistrar(): string[] {
  const declarados = new Set(ARCHIVOS_DEL_SPRINT)
  return recorrerDirectoriosPropios().filter((archivo) => !declarados.has(archivo))
}

/** Y los que están en el padrón y no en disco: un renombre deja las dos
 *  listas desalineadas en los dos sentidos, y sólo una se nota sola. */
export function archivosDeclaradosQueFaltan(): string[] {
  return ARCHIVOS_DEL_SPRINT.filter((archivo) => !existe(archivo))
}
