import fs from 'fs'
import os from 'os'
import path from 'path'

/**
 * P39 — EL REGISTRO DE LO SEMBRADO. Lo único que cubre una corrida interrumpida.
 *
 * El teardown de cada spec borra por id en `afterAll`. Una corrida matada antes
 * de llegar ahí (Ctrl+C, la máquina que se suspende, un proceso bajado a mano)
 * deja sus filas para siempre: así se juntaron 65 leads de siembra hasta P37. Un
 * borrado al arrancar por CRITERIO («todo lo que tenga un stamp de 13 dígitos»)
 * se llevaría también lo de una corrida viva en otro checkout y lo que alguien
 * sembró a mano con el mismo formato. Por eso esto no busca nada: ANOTA.
 *
 * Cada id que entra a un tracker se escribe en un archivo de este proceso ANTES
 * de volver del `push`; cada id que el teardown borra se anota como baja. Al
 * arrancar la corrida siguiente (`limpieza-al-arrancar.ts`), los archivos de
 * procesos que ya no existen tienen exactamente lo que quedó sin borrar — y eso,
 * y nada más, se borra por id.
 *
 * Solo anota cuando la corrida lo activó (el `globalSetup` de las suites que
 * limpian lo suyo): la siembra de la galería (`m0-galeria-seed.ts`) usa el mismo
 * tracker y NO borra a propósito — si anotara, la próxima suite la borraría.
 *
 * Límites, dichos: un proceso matado entre el INSERT y el `push` (milisegundos)
 * deja una fila sin anotar; y si el sistema reusa el PID de un proceso muerto
 * antes de la próxima corrida, su archivo se toma por vivo y se deja para la
 * siguiente. En los dos casos el error es por el lado seguro: queda una fila, no
 * se borra una ajena.
 */

export type TablaSembrada = 'aviso' | 'lead' | 'usuario'
export const TABLAS_SEMBRADAS: readonly TablaSembrada[] = ['aviso', 'lead', 'usuario']

/** La corrida activa el registro dejando acá el directorio; los workers lo heredan. */
const VARIABLE_ACTIVADORA = 'SIEMBRA_REGISTRO_DIR'

/** Directorio del registro para una base: uno por host, fuera del repo. */
export function directorioDelRegistro(databaseUrl: string): string {
  const host = new URL(databaseUrl).hostname.replace(/[^a-zA-Z0-9.-]/g, '_')
  return path.join(os.tmpdir(), 'develop-siembra-en-curso', host)
}

/** Lo llama el `globalSetup`: desde acá, todo tracker de esta corrida anota. */
export function activarRegistro(databaseUrl: string): string {
  const dir = directorioDelRegistro(databaseUrl)
  fs.mkdirSync(dir, { recursive: true })
  process.env[VARIABLE_ACTIVADORA] = dir
  return dir
}

// El inicio del proceso va en el nombre: un PID reusado más tarde escribe en OTRO
// archivo y no mezcla sus altas con las pendientes de un muerto.
const INICIO_DEL_PROCESO = Math.round(Date.now() - process.uptime() * 1000)
const pendientesPropios = new Map<TablaSembrada, Set<string>>(TABLAS_SEMBRADAS.map((t) => [t, new Set<string>()]))

function archivoPropio(dir: string): string {
  return path.join(dir, `${process.pid}-${INICIO_DEL_PROCESO}.jsonl`)
}

function anotar(tipo: 'alta' | 'baja', tabla: TablaSembrada, ids: readonly string[]): void {
  const dir = process.env[VARIABLE_ACTIVADORA]
  if (!dir || ids.length === 0) return
  const pendientes = pendientesPropios.get(tabla)
  for (const id of ids) {
    if (tipo === 'alta') pendientes?.add(id)
    else pendientes?.delete(id)
  }
  const archivo = archivoPropio(dir)
  if (tipo === 'baja' && [...pendientesPropios.values()].every((s) => s.size === 0)) {
    // Todo lo de este proceso quedó borrado: el archivo ya no tiene nada que decir.
    fs.rmSync(archivo, { force: true })
    return
  }
  fs.appendFileSync(archivo, ids.map((id) => JSON.stringify({ [tipo]: tabla, id })).join('\n') + '\n')
}

/** Anota como borradas las filas que el teardown ya sacó. */
export function anotarBajas(tabla: TablaSembrada, ids: readonly string[]): void {
  anotar('baja', tabla, ids)
}

/**
 * La lista de ids de un tracker: un array común cuyo `push` anota antes de
 * agregar. Así queda cubierto todo `tracker.leadIds.push(...)`, también los de
 * las specs que crean filas sin pasar por las fábricas del helper.
 *
 * Y cuyo `splice` da de baja lo que saca: un id que sale del tracker sin pasar por
 * el teardown ya no le toca a la limpieza — o la prueba lo borró ella misma
 * (`dossier-gates` «cascade» borra el lead y lo quita), o decidió conservarlo.
 * Sin esto, cada corrida de leados dejaba un registro con un pendiente fantasma.
 */
export function listaAnotada(tabla: TablaSembrada): string[] {
  const lista: string[] = []
  Object.defineProperty(lista, 'push', {
    enumerable: false,
    value: (...ids: string[]): number => {
      anotar('alta', tabla, ids)
      return Array.prototype.push.apply(lista, ids)
    },
  })
  const spliceOriginal = Array.prototype.splice as (this: string[], ...args: unknown[]) => string[]
  Object.defineProperty(lista, 'splice', {
    enumerable: false,
    value: (...args: unknown[]): string[] => {
      anotar('alta', tabla, args.slice(2).filter((x): x is string => typeof x === 'string'))
      const quitados = spliceOriginal.apply(lista, args)
      anotar('baja', tabla, quitados)
      return quitados
    },
  })
  return lista
}

export type CorridaInterrumpida = {
  archivo: string
  pid: number
  pendientes: Record<TablaSembrada, string[]>
}

function procesoVivo(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (error: unknown) {
    // EPERM: existe pero no es nuestro — vivo igual.
    return (error as NodeJS.ErrnoException).code === 'EPERM'
  }
}

function leerPendientes(archivo: string): Record<TablaSembrada, string[]> {
  const pendientes = new Map<TablaSembrada, Set<string>>(TABLAS_SEMBRADAS.map((t) => [t, new Set<string>()]))
  for (const linea of fs.readFileSync(archivo, 'utf8').split('\n')) {
    if (!linea.trim()) continue
    let entrada: unknown
    try {
      entrada = JSON.parse(linea)
    } catch {
      // Una línea cortada por el proceso matado a mitad de escritura: no trae un id entero.
      continue
    }
    if (typeof entrada !== 'object' || entrada === null) continue
    const { alta, baja, id } = entrada as { alta?: unknown; baja?: unknown; id?: unknown }
    if (typeof id !== 'string') continue
    const tabla = TABLAS_SEMBRADAS.find((t) => t === alta || t === baja)
    if (!tabla) continue
    if (alta !== undefined) pendientes.get(tabla)?.add(id)
    else pendientes.get(tabla)?.delete(id)
  }
  return {
    aviso: [...(pendientes.get('aviso') ?? [])],
    lead: [...(pendientes.get('lead') ?? [])],
    usuario: [...(pendientes.get('usuario') ?? [])],
  }
}

/** Los registros del directorio, separados en los de procesos muertos y los vivos. */
export function corridasDelRegistro(dir: string): { interrumpidas: CorridaInterrumpida[]; vivas: string[] } {
  if (!fs.existsSync(dir)) return { interrumpidas: [], vivas: [] }
  const interrumpidas: CorridaInterrumpida[] = []
  const vivas: string[] = []
  for (const nombre of fs.readdirSync(dir)) {
    const coincide = /^(\d+)-\d+\.jsonl$/.exec(nombre)
    if (!coincide) continue
    const archivo = path.join(dir, nombre)
    const pid = Number(coincide[1])
    if (procesoVivo(pid)) vivas.push(archivo)
    else interrumpidas.push({ archivo, pid, pendientes: leerPendientes(archivo) })
  }
  return { interrumpidas, vivas }
}

/** Después de borrar lo pendiente de una corrida muerta, su registro se descarta. */
export function descartarRegistro(archivo: string): void {
  fs.rmSync(archivo, { force: true })
}
