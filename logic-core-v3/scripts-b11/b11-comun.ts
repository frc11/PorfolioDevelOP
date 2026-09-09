/**
 * BANCO DE B11 — la plomería que comparten los instrumentos de este bloque.
 *
 * ── Por qué un banco propio ────────────────────────────────────────────────
 *
 * Por lo mismo que B6-A y B8 tuvieron el suyo: **el puerto**. `scripts-b8/`
 * clava `ORIGEN` en el 3001 (el dev server de `C:\v3-luz`, que sigue vivo al
 * lado) y esta sesión corre en el **3000**, el de la receta canónica
 * (`docs/rediseno/MEDICION-NAVEGADOR.md`). Medir contra el 3001 sería medir el
 * árbol de otro worktree sin enterarse. Y el perfil de Chrome es propio (`b11`):
 * dos procesos sobre el mismo `userDataDir` y el segundo no arranca.
 *
 * ── Lo que hereda, y de dónde ─────────────────────────────────────────────
 *
 * Todo lo que ya está resuelto se importa tal cual: el cliente de CDP, la
 * receta ejecutable, la captura y los perfiles (`scripts-b4/`); el puente de
 * automatización y el asentamiento del home (`scripts-b8/b8-comun.ts`); y —lo
 * que importa para que las cifras sean comparables— **el instrumento que
 * declaró las deudas**: la máscara de glifo, los lectores de bloques, el
 * ocultamiento y la evaluación de una posición son los de `scripts-b8/`
 * (`c-las-ocho.ts --etiqueta=despues` es el que firma cada fila de
 * `s10-acceso-escena.ts`). Medir con otra copia sería medir con otra vara.
 *
 * ⚠️ `scripts-b6/` y `scripts-b8/` conviven en este árbol con el mismo
 * instrumento bajo dos prefijos de atributo (`b6`/`b8`). `b8-comun.ts` ya lo
 * declara: cuando las ramas se mergearan, las copias de B8 se borraban. No se
 * borraron. Este bloque no lo arregla —no es su scope— y lo reporta.
 *
 * ── El 2560 es un perfil LOCAL, y por qué ─────────────────────────────────
 *
 * La instrucción pide 1440, 1920 y 2560. `scripts-b4/perfiles.ts` tiene siete
 * perfiles y `banco.invariant.ts` afirma que son siete: agregar el octavo ahí
 * es tocar un instrumento custodiado por otro bloque. El 2560×1440 se declara
 * acá, con su procedencia —es «el ancho del peor caso del hero» de la receta,
 * §1 paso 2, y el ancho en el que B1 midió el borde seguro del titular—, con
 * el mismo `dpr` 1 y sin banderas. `verificarLaPagina` lo acepta como a
 * cualquiera: es un `Perfil`.
 *
 * ── ⚠️ LAS CUATRO REGLAS DE CAPTURA DE B4-B, y cómo se cumplen acá ────────
 *
 *   1. La escena tarda 300–700 ms en pintar: gracia antes de cada captura.
 *   2. Un recorte sólo vale con el scroll ahí: acá todo es viewport, con el
 *      scroll puesto por `scrollA` y verificado.
 *   3. **No se escribe en `docs/` con el navegador abierto**: el dev server
 *      vigila el árbol. Los PNG van a `.b11-capturas/` (ignorada) y los JSON y
 *      las capturas del reporte se mudan a `docs/` con TODOS los Chrome ya
 *      cerrados (`mudarPendientes`, al final de cada script).
 *   4. El preloader no arma bajo webdriver: puente + marca del intro, antes del
 *      primer pintado.
 *
 * ── El búfer de WebGL no se lee desde la página ───────────────────────────
 *
 * Toda cifra de la escena de este bloque es `Page.captureScreenshot` de lo
 * compuesto. Ninguna sale de `readPixels` ni de `drawImage`.
 */

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { perfilPorId, type Perfil } from '../scripts-b4/perfiles'
import { moverElPuntero, verificarQueLaPaginaEstaEntera } from '../scripts-b5/pagina'
import { ASENTAMIENTO_MS, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION, conLaPagina, type Sesion } from '../scripts-b8/b8-comun'

export { cuatro, dos, SELECTOR_DE_LA_ESCENA, type Sesion } from '../scripts-b8/b8-comun'

/**
 * Deja el home en condiciones de medirse: primer cuadro, asentamiento, la
 * página ENTERA y el puntero en el centro (desplazamiento cero de la pose). Es
 * `asentarElHome` de B8 con una diferencia que B8 no necesitó porque midió
 * sólo a 1440: **la comprobación de que la página está entera se REINTENTA.**
 *
 * A 1920 la primera lectura devolvió un panel de 3.325 px en una ventana de
 * 1.080 —85 px de más, exactamente una línea de `titulo-xl`— y el documento en
 * 19.525; la corrida anterior sobre el mismo árbol había leído 19.440. Es la
 * fuente web llegando después del primer layout: con la de reserva un titular
 * parte en una línea más, y la página «no está entera» durante un instante. La
 * comprobación no se afloja —una página que nunca cierra sigue tirando—; se le
 * da tiempo, y se publica cuántos intentos hicieron falta.
 */
export async function asentarElHome(s: Sesion): Promise<void> {
  await esperarElPrimerCuadro(s.pagina)
  await new Promise((r) => setTimeout(r, ASENTAMIENTO_MS))
  let ultimo: unknown = null
  for (let intento = 1; intento <= INTENTOS_DE_ENTEREZA; intento += 1) {
    try {
      await verificarQueLaPaginaEstaEntera(s.pagina, s.perfil)
      if (intento > 1) console.log(`  (la página quedó entera en el intento ${intento})`)
      ultimo = null
      break
    } catch (e) {
      ultimo = e
      await new Promise((r) => setTimeout(r, ESPERA_ENTRE_INTENTOS_MS))
    }
  }
  if (ultimo !== null) throw ultimo
  await moverElPuntero(s.pagina, s.perfil, Math.round(s.perfil.ancho / 2), Math.round(s.perfil.alto / 2))
}

const INTENTOS_DE_ENTEREZA = 6
const ESPERA_ENTRE_INTENTOS_MS = 1500

/** 3000: el puerto de ESTA sesión y de la receta. El 3001 es de `C:\v3-luz`. */
export const ORIGEN = 'http://localhost:3000'

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/b11'

/** Las capturas intermedias, fuera de `docs/` y fuera de git (`.gitignore`). */
export const TEMP = '.b11-capturas'

/** A donde se mudan, con el navegador YA cerrado, las capturas que van al reporte. */
export const CARPETA_DE_CAPTURAS = 'docs/rediseno/capturas/b11'

/**
 * 2560×1440, `dpr` 1. Ver el docblock: local a propósito, con procedencia.
 */
export const PERFIL_2560: Perfil = {
  id: '2560',
  nombre: '2560',
  procedencia:
    'el ancho del peor caso del hero (`MEDICION-NAVEGADOR.md` §1 paso 2, «2560x1440x1»), donde B1 midió el borde seguro del titular. Local a B11: `perfiles.ts` es de B4 y su invariante cuenta siete.',
  ancho: 2560,
  alto: 1440,
  dpr: 1,
  movil: false,
  tactil: false,
  debajoDelUmbral: false,
}

/** Los tres anchos de la instrucción, en el orden en que se corren. */
export const PERFILES_DE_B11: readonly Perfil[] = [perfilPorId('1440'), perfilPorId('1920'), PERFIL_2560]

export function perfilDeB11(id: string): Perfil {
  const p = PERFILES_DE_B11.find((x) => x.id === id)
  if (p === undefined) throw new Error(`B11 mide 1440, 1920 y 2560, no «${id}»`)
  return p
}

/** Las seis deudas, por el `data-panel` de su sección, en el orden del recorrido. */
export const LAS_SEIS = ['hero', 'quienes-somos', 'numeros', 'trabajos', 'por-que-develop', 'cierre'] as const
export type IdDeLasSeis = (typeof LAS_SEIS)[number]

export function esDeLasSeis(id: string): id is IdDeLasSeis {
  return (LAS_SEIS as readonly string[]).includes(id)
}

/**
 * Abre el home de ESTE worktree en un Chrome propio, verificado, y corre el
 * trabajo. Es `conLaPagina` de B8 con el origen y el perfil de B11 fijados:
 * no se puede llamar con otro origen por accidente.
 */
export async function conElHome<T>(perfil: Perfil, trabajo: (s: Sesion) => Promise<T>, quien = 'b11', origen: string = ORIGEN): Promise<T> {
  return conLaPagina(perfil, '/v3', trabajo, {
    antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO],
    origen,
    perfilDeChrome: quien,
  })
}

/**
 * EL ORIGEN DE LA LÍNEA DE BASE — el build aislado del árbol INTACTO, servido.
 *
 * B11 encontró un defecto del instrumento (la pastilla, ver `b-bloques.ts`)
 * con el producto ya tocado. Para re-medir el «antes» con el instrumento
 * arreglado sin `checkout` ni `stash` —prohibidos—, se sirve el build de
 * producción de `.next-b11` (el árbol antes del primer cambio de producto,
 * `scripts-b8/peso.ts` lo firma: 63.864 B) con `next start` en el 3005. Es el
 * mismo producto que el dev server servía cuando se midió la primera vez, con
 * dos diferencias declaradas: minificado, y sin la insignia del dev server. El
 * `--origen` se pasa explícito: el 3000 sigue siendo el de la receta.
 */
export const ORIGEN_DEL_BUILD_INTACTO = 'http://localhost:3005'

export function asegurarCarpetas(): void {
  mkdirSync(TEMP, { recursive: true })
}

export function argumento(nombre: string, defecto: string): string {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`))
  return a === undefined ? defecto : a.slice(nombre.length + 3)
}

export interface Pendiente {
  readonly temporal: string
  readonly destino: string
}

const pendientes: Pendiente[] = []

/** Escribe un JSON en el temporal y lo deja pendiente de mudar a `outputs/b11/`. */
export function jsonPendiente(nombre: string, datos: unknown): string {
  asegurarCarpetas()
  const temporal = path.join(TEMP, `${nombre}.json`)
  writeFileSync(temporal, `${JSON.stringify(datos, null, 2)}\n`, 'utf8')
  pendientes.push({ temporal, destino: path.join(RAIZ_DE_SALIDAS, `${nombre}.json`) })
  return temporal
}

/** Deja una captura del temporal pendiente de copiarse a `capturas/b11/` con ese nombre. */
export function capturaPendiente(temporal: string, nombre: string): void {
  pendientes.push({ temporal, destino: path.join(CARPETA_DE_CAPTURAS, nombre) })
}

/** Con TODOS los navegadores cerrados: muda lo pendiente a `docs/` y devuelve las rutas. */
export function mudarPendientes(): readonly string[] {
  const escritos: string[] = []
  for (const p of pendientes.splice(0)) {
    mkdirSync(path.dirname(p.destino), { recursive: true })
    copyFileSync(p.temporal, p.destino)
    escritos.push(p.destino.replace(/\\/g, '/'))
  }
  return escritos
}

/** Cuántas pendientes hay sin mudar. Para el `finally` de los scripts. */
export function pendientesSinMudar(): number {
  return pendientes.length
}

export function pantallas(y: number, ventana: number): number {
  return Math.round((y / ventana) * 1000) / 1000
}
