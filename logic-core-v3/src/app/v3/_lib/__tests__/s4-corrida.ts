/**
 * CORRER UN INVARIANTE Y LEER SU RESULTADO — la pieza de abajo del agregado.
 *
 * ── Por qué un proceso hijo y no un `import()` ────────────────────────────
 *
 * Porque `cerrar()` termina con `process.exit()`. Cargar los invariantes en el
 * mismo proceso mataría al corredor en el primero, que es exactamente el
 * defecto que este sprint viene a arreglar en otra forma.
 *
 * ── Por qué se corre el comando LITERAL de `package.json` ─────────────────
 *
 * El agregado no reconstruye el comando: ejecuta la cadena tal cual está
 * declarada. Si alguien rompe un script en un merge —el caso que destapó todo
 * esto— el corredor se come el error en vez de esquivarlo, y eso es lo que
 * queremos que pase.
 *
 * ── Qué se lee de la salida, y qué pasa si no está ────────────────────────
 *
 * `cerrar()` imprime `nombre: N afirmaciones, M fallas[, K fuera de ventana]`.
 * De ahí salen las tres cifras del resumen. Los controles positivos se cuentan
 * por sus marcas `[control positivo]`.
 *
 * ⚠ Si esa línea NO aparece, el invariante murió antes de cerrar —una excepción
 * al importar, por ejemplo— y **se cuenta como falla aunque el código de salida
 * diga cero**. Un invariante que no llega a resumir no verificó nada, y un
 * corredor que lo dé por bueno es un verde por vacío con más pasos.
 */

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Cinco niveles: __tests__ → _lib → v3 → app → src → raíz del proyecto. */
export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')

export interface Resultado {
  readonly script: string
  readonly comando: string
  readonly codigo: number
  readonly afirmaciones: number
  readonly fallas: number
  readonly fueraDeVentana: number
  readonly controles: number
  /** Si se encontró la línea de resumen de `cerrar()`. */
  readonly resumio: boolean
  readonly ms: number
  readonly salida: string
}

/**
 * ⚠️ **ESTE REPO TIENE DOS ARNESES, Y ESTE LECTOR SÓLO CONOCÍA UNO.**
 *
 * El track del SITIO cierra con `cerrar()` (`afirmar.ts`) y escribe
 * `nombre: N afirmaciones, M fallas[, K fuera de ventana]`. El track de la
 * ESCENA cierra con `report()` (`probe-escena/__tests__/harness.ts` y
 * `home-intro/introChecks.ts`) y escribe **`nombre: N en verde, M en rojo`**.
 *
 * Mientras los 34 invariantes de la escena no tuvieran script, la diferencia no
 * molestaba a nadie. SITIO-S8 los cableó —eran 890 afirmaciones que ningún
 * agregado corría, o sea la regla 14 rota— y ahí apareció: `leerResumen`
 * devolvía `null`, `resumio` quedaba en `false` y **`fallo()` los daba por
 * FALLADOS con 0 afirmaciones contadas, aunque su exit code fuera 0 y no
 * hubiera un solo rojo**. Un lector que no entiende un dialecto no reporta
 * «no entiendo»: reporta «falló».
 *
 * Se enseña el segundo dialecto en vez de reescribir 34 instrumentos, porque lo
 * que estaba mal era el LECTOR y no la salida. Y el nombre pasa a poder llevar
 * espacios: veinte de los veinte de `probe-escena/__tests__/` cierran con cosas
 * como `s10 · el batido y el aliasing`, que es un título y no un identificador.
 * Exigirles un token sería pedirles que se adapten al parser.
 *
 * ⚠️ **«en rojo» NO es «fuera de ventana».** El arnés de la escena no tiene el
 * concepto —`noCorre()` es del otro—, así que sus corridas reportan 0 y eso es
 * exacto: no hay huecos declarados ahí, no es que no se midieran.
 */
const RE_RESUMEN_SITIO = /^.+: (\d+) afirmaciones, (\d+) fallas(?:, (\d+) fuera de ventana)?\s*$/gm
const RE_RESUMEN_ESCENA = /^.+: (\d+) en verde, (\d+) en rojo\s*$/gm

/** La última línea de resumen de la salida, en cualquiera de los dos dialectos. */
export function leerResumen(salida: string): { afirmaciones: number; fallas: number; fueraDeVentana: number } | null {
  const ultimo = (re: RegExp): RegExpExecArray | null => {
    re.lastIndex = 0
    let visto: RegExpExecArray | null = null
    let m: RegExpExecArray | null = re.exec(salida)
    while (m !== null) {
      visto = m
      m = re.exec(salida)
    }
    return visto
  }
  const delSitio = ultimo(RE_RESUMEN_SITIO)
  if (delSitio !== null) {
    return {
      afirmaciones: Number.parseInt(delSitio[1], 10),
      fallas: Number.parseInt(delSitio[2], 10),
      fueraDeVentana: delSitio[3] === undefined ? 0 : Number.parseInt(delSitio[3], 10),
    }
  }
  const deLaEscena = ultimo(RE_RESUMEN_ESCENA)
  if (deLaEscena === null) return null
  return {
    afirmaciones: Number.parseInt(deLaEscena[1], 10),
    fallas: Number.parseInt(deLaEscena[2], 10),
    fueraDeVentana: 0,
  }
}

/**
 * Los controles positivos, en los dos dialectos. El del sitio los marca con
 * `[control positivo]`; el de la escena abre la línea con `ok  control positivo
 * —`, sin corchetes. Contar sólo el primero daba **cero** para los 34 de la
 * escena, y un cero mentiroso en el resumen es peor que no imprimir el número.
 *
 * ⚠️ **El segundo patrón está anclado a la FORMA DE LA LÍNEA y no a la frase
 * suelta, y eso no es prolijidad: la primera versión buscaba `control positivo`
 * en cualquier posición y contaba DOS donde había uno.** Lo destapó el fixture
 * `pasa.invariant.ts`, cuya descripción dice *«y trae un control positivo, para
 * que el contador tenga qué contar»* — o sea que el contador se contaba a sí
 * mismo describiéndose. Es §7.25 otra vez, en su forma más chica: *un escáner
 * que lee texto lee también el texto que lo describe.*
 */
export function contarControles(salida: string): number {
  const conCorchetes = (salida.match(/\[control positivo\]/g) ?? []).length
  const abriendoLinea = (salida.match(/^\s*ok\s+control positivo\b/gm) ?? []).length
  return conCorchetes + abriendoLinea
}

/** Un resultado se considera fallado si falló, si murió, o si no resumió. */
export function fallo(r: Resultado): boolean {
  return r.codigo !== 0 || r.fallas > 0 || !r.resumio
}

export function correr(script: string, comando: string): Resultado {
  const desde = Date.now()
  const proceso = spawnSync(comando, {
    cwd: RAIZ,
    shell: true,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
  })
  const ms = Date.now() - desde
  const stdout = proceso.stdout ?? ''
  const stderr = proceso.stderr ?? ''
  const salida = stderr.length > 0 ? `${stdout}\n[stderr]\n${stderr}` : stdout
  const resumen = leerResumen(salida)
  return {
    script,
    comando,
    codigo: proceso.status === null ? 1 : proceso.status,
    afirmaciones: resumen?.afirmaciones ?? 0,
    fallas: resumen?.fallas ?? 0,
    fueraDeVentana: resumen?.fueraDeVentana ?? 0,
    controles: contarControles(salida),
    resumio: resumen !== null,
    ms,
    salida,
  }
}
