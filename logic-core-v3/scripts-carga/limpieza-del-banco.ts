/**
 * LA LIMPIEZA DE LOS BANCOS — que una corrida no deje basura en el disco.
 *
 * `~/.cache/b4-medicion` llegó a 100 GB (458 mil archivos): cada corrida creaba un perfil de Chrome nuevo (`…-perfil-${Date.now()}`)
 * que nunca se borraba, y las carpetas de salida acumulaban videos y fotos de todas las corridas. Desde la cola 2 (2026-10-26):
 *
 *   · `perfilDelBanco(nombre)`: un perfil TEMPORAL (en la carpeta temporal del sistema) que se borra al terminar el proceso. Antes de
 *     crearlo, barre los perfiles que dejaron corridas cortadas (los temporales y los viejos con fecha en `b4-medicion`, de más de una
 *     hora) y exige el disco.
 *   · `salidaDelBanco(nombre)`: la carpeta de las fotos y los resultados, VACIADA al empezar (sólo queda la última corrida). Si la
 *     corrida se hace con `BANCO_FOTOS=<carpeta>`, al terminar las fotos y los videos se copian a `<carpeta>/<nombre>/` y la carpeta del
 *     banco se borra entera (así corre el orquestador: las fotos finales van a `C:\nocturno\…\fotos\`).
 *   · `exigirDiscoLibre()`: con menos de 5 GB libres (o `BANCO_DISCO_MINIMO_GB`) el banco no arranca.
 *
 * Los bancos viejos de `scripts-b*` lanzan Chrome por `scripts-b4/cdp.ts` con un perfil FIJO por nombre (no crece por corrida): ése sólo
 * suma el chequeo del disco.
 */
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, statfsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const CACHE = path.join(os.homedir(), '.cache', 'b4-medicion')
const PREFIJO_TEMPORAL = 'banco-'
const UNA_HORA_MS = 60 * 60 * 1000
/** Lo que se lleva de la salida a `BANCO_FOTOS`: fotos y videos (lo que mira el reporte). */
const LO_QUE_QUEDA = /\.(png|jpe?g|webp|webm|mp4|gif)$/i

let discoVisto = false
const alTerminar: (() => void)[] = []
let enganchado = false

function engancharLaSalida(): void {
  if (enganchado) return
  enganchado = true
  process.on('exit', () => {
    for (const f of alTerminar.splice(0)) {
      try {
        f()
      } catch {
        // La limpieza nunca tapa el resultado del banco.
      }
    }
  })
  for (const senal of ['SIGINT', 'SIGTERM'] as const) process.once(senal, () => process.exit(130))
}

/** Sin `BANCO_DISCO_MINIMO_GB` (5 por defecto) libres en el disco del usuario, el banco no arranca. */
export function exigirDiscoLibre(minimoGb = Number(process.env.BANCO_DISCO_MINIMO_GB ?? 5)): void {
  if (discoVisto) return
  const s = statfsSync(os.homedir())
  const libresGb = (s.bavail * s.bsize) / 1024 ** 3
  if (libresGb < minimoGb) {
    console.error(`banco: ${libresGb.toFixed(1)} GB libres en el disco (< ${String(minimoGb)} GB): no arranca. Liberá espacio (¿${CACHE}?).`)
    process.exit(2)
  }
  discoVisto = true
}

const borrar = (dir: string): void => rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })

/** Los perfiles que dejaron corridas cortadas (un corte por memoria o por tiempo no corre el `exit`): más de una hora sin tocar. */
function barrerPerfilesViejos(): void {
  const ahora = Date.now()
  const viejo = (dir: string): boolean => {
    try {
      return ahora - statSync(dir).mtimeMs > UNA_HORA_MS
    } catch {
      return false
    }
  }
  const tmp = os.tmpdir()
  for (const n of readdirSync(tmp)) if (n.startsWith(PREFIJO_TEMPORAL) && viejo(path.join(tmp, n))) borrar(path.join(tmp, n))
  // Los de antes de esta limpieza: un perfil por corrida con la fecha al final (`…-1792776571271`, a veces con un sufijo al azar).
  if (existsSync(CACHE)) for (const n of readdirSync(CACHE)) if (/-\d{13}(-[a-z0-9]{6})?$/.test(n) && viejo(path.join(CACHE, n))) borrar(path.join(CACHE, n))
}

/** Un perfil de Chrome temporal para esta corrida, que se borra al terminar el proceso. */
export function perfilDelBanco(nombre: string): string {
  exigirDiscoLibre()
  try {
    barrerPerfilesViejos()
  } catch {
    // Un perfil que otro Chrome todavía usa no se puede borrar: queda para la próxima.
  }
  const dir = mkdtempSync(path.join(os.tmpdir(), `${PREFIJO_TEMPORAL}${nombre}-`))
  engancharLaSalida()
  alTerminar.push(() => borrar(dir))
  return dir
}

/** La carpeta de salida del banco, vacía al empezar; con `BANCO_FOTOS`, al terminar las fotos se van ahí y la carpeta se borra. */
export function salidaDelBanco(nombre: string): string {
  exigirDiscoLibre()
  const dir = path.join(CACHE, nombre)
  borrar(dir)
  mkdirSync(dir, { recursive: true })
  const destino = process.env.BANCO_FOTOS
  if (destino !== undefined && destino !== '') {
    engancharLaSalida()
    alTerminar.push(() => {
      cpSync(dir, path.join(destino, nombre), { recursive: true, filter: (f) => statSync(f).isDirectory() || LO_QUE_QUEDA.test(f) })
      borrar(dir)
    })
  }
  return dir
}
