/**
 * BANCO DE TAPADO-1 — la VERDAD DE PANTALLA contra la que se juzga el instrumento.
 *
 * ── Por qué este banco existe, y por qué es de navegador ──────────────────
 *
 * `s10-logo` y `s10-vertical` miden la escena **analíticamente**: marchan rayos
 * contra la silueta del logo y saben leer fuera del cuadro, que es algo que una
 * captura no puede. Eso es correcto y no se toca. Lo que ninguno de los dos
 * tiene es **dónde cae el texto en la pantalla**: `s10-logo-cajas.ts` lo declara
 * en su supuesto 4 —«la posición VERTICAL del bloque no se deriva»— y quien mide
 * barre todas las posiciones y publica el rango.
 *
 * Este banco contesta esa mitad **midiéndola**, no modelándola: abre la página,
 * lee los rectángulos reales y fotografía lo compuesto. Es el discriminador
 * empírico que `CLAUDE.md` pide cuando un número es correcto en estático y la
 * pantalla dice otra cosa.
 *
 * ── LA TÉCNICA: TINTA CONTRA TINTA, con tres capturas del mismo cuadro ────
 *
 * El texto y el logo son el MISMO negro (`TINTA_HEX` y `INK_COLOR`), así que una
 * sola captura no los separa, y restar dos tampoco: donde el texto cae sobre el
 * logo, esconderlo no mueve el píxel. El detalle de esa falla —que este banco
 * cometió y midió— está en `mascaras.ts`. Lo que se toma son TRES cuadros con el
 * mismo layout, separados por una hoja de estilos:
 *
 *   · **A** — la página como se ve. Es la del reporte; no se mide.
 *   · **C** — el texto SIN la escena: el fondo queda plano y la tinta dibujada
 *     se separa por umbral, sin depender de lo que haya detrás.
 *   · **D** — la escena SOLA: la masa negra que quede ahí es del logo y de nada
 *     más.
 *
 * Y la cifra que el sprint pide es la intersección: **qué fracción de la tinta
 * del titular cae sobre la masa negra del logo**.
 *
 * ── ⚠️ SE MIDE RECARGANDO, NUNCA REDIMENSIONANDO ─────────────────────────
 *
 * El nivel de calidad de la escena se decide al montar (`key={calidad}`), así
 * que una ventana redimensionada deja un estado intermedio que no es ningún
 * ancho real. Cada ancho de este banco abre **una pestaña nueva**, le pone las
 * métricas ANTES de navegar y carga de cero.
 *
 * ── ⚠️ Y SE VERIFICA LA VENTANA ANTES DE CREER UN NÚMERO ─────────────────
 *
 * Con la pestaña ocluida el navegador saltea los rendering steps: `innerWidth`
 * da 0 y `requestAnimationFrame` no corre. `verificarVentana` tira en vez de
 * avisar, porque todo lo que este banco mide son cuadros.
 */

import { mkdirSync } from 'node:fs'
import path from 'node:path'

import { cerrarChrome, lanzarChrome, type ChromeLanzado } from '../scripts-b4/cdp'
import { MARCA_DE_INTRO, abrirPagina, cerrarPagina, medir, type Pagina } from '../scripts-b4/navegador'

/** El puerto de ESTE worktree. */
export const ORIGEN = 'http://localhost:3000'

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/tapado'
export const CARPETA_DE_CAPTURAS = 'docs/rediseno/capturas/tapado'

/**
 * Las capturas intermedias, FUERA del árbol: el dev server vigila el repo y una
 * captura escrita adentro lo hace recompilar en medio de la medición.
 */
export const TEMP = path.join(process.env.TEMP ?? process.env.TMP ?? '.', 'tapado-capturas')

export interface Ventana {
  readonly ancho: number
  readonly alto: number
  /** De dónde sale el par. Un tamaño sin procedencia es un número inventado. */
  readonly procedencia: string
  readonly movil: boolean
}

/**
 * LOS OCHO ANCHOS, con el alto declarado y su fuente.
 *
 * ⚠ **El alto no es una propiedad del ancho** (`s10-referencias.ts` lo declara
 * así) y acá importa más que en ningún otro banco: la pregunta del sprint es
 * vertical. Los que este repo ya publica se heredan de `scripts-b4/perfiles.ts`;
 * los DOS que no —320 y 425— se marcan como pares de este sprint.
 */
export const VENTANAS: readonly Ventana[] = [
  { ancho: 320, alto: 568, procedencia: 'PAR DE ESTE SPRINT — 320x568 es el viewport de layout del iPhone SE de 1.a gen; este repo no lo tenia', movil: true },
  { ancho: 375, alto: 667, procedencia: 'scripts-b4/perfiles.ts — iPhone SE 2.a/3.a gen', movil: true },
  { ancho: 390, alto: 844, procedencia: 's10-referencias.VIEWPORTS_MEDIDOS — el telefono que S0 midio', movil: true },
  { ancho: 425, alto: 844, procedencia: 'PAR DE ESTE SPRINT — 425 es el preset «Mobile L» de DevTools y el ancho que el humano capturo; el alto se toma del par de 390 para que la unica variable sea el ancho', movil: true },
  { ancho: 768, alto: 1024, procedencia: 'scripts-b4/perfiles.ts — iPad en retrato', movil: true },
  { ancho: 1024, alto: 768, procedencia: 'scripts-b4/perfiles.ts — un pixel abajo del umbral', movil: false },
  { ancho: 1440, alto: 900, procedencia: 'scripts-b4/perfiles.ts — el ancho donde el proyecto define el ritmo', movil: false },
  { ancho: 1920, alto: 1080, procedencia: 'scripts-b4/perfiles.ts — --container-tope', movil: false },
]

/**
 * ⚠️ **`deviceScaleFactor` 1, y es la regla de `MEDICION-NAVEGADOR.md`.** Con
 * x2 la captura pesa cuatro veces y el canvas 3D cambia su resolución de render,
 * con lo cual ninguna cifra sería comparable con las x1 ya publicadas. Acá
 * compra además que **un píxel de la captura sea un píxel de CSS**, o sea que la
 * máscara del glifo y el `getBoundingClientRect` vivan en la misma unidad sin
 * una conversión que haya que creerle.
 */
export const DPR = 1

/** Cuánto se le da a la escena para armarse antes de capturar. */
export const ASENTAMIENTO_MS = 4000

export interface EstadoDeLaVentana {
  readonly visibilityState: string
  readonly innerWidth: number
  readonly innerHeight: number
  readonly dpr: number
  readonly rafCorre: boolean
  readonly hayCanvas: boolean
}

/** Tira, no avisa: con la pestaña ocluida toda medición de layout da cero. */
export async function verificarVentana(p: Pagina, v: Ventana): Promise<EstadoDeLaVentana> {
  const estado = await medir<EstadoDeLaVentana>(
    p,
    `(async () => {
      const rafCorre = await new Promise((r) => {
        const t = setTimeout(() => r(false), 1500)
        requestAnimationFrame(() => { clearTimeout(t); r(true) })
      })
      return {
        visibilityState: document.visibilityState,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        dpr: window.devicePixelRatio,
        rafCorre,
        hayCanvas: document.querySelector('canvas') !== null,
      }
    })()`,
  )
  const problemas: string[] = []
  if (estado.visibilityState !== 'visible') problemas.push(`visibilityState="${estado.visibilityState}"`)
  if (estado.innerWidth !== v.ancho) problemas.push(`innerWidth=${estado.innerWidth}, se pidio ${v.ancho}`)
  if (estado.innerHeight !== v.alto) problemas.push(`innerHeight=${estado.innerHeight}, se pidio ${v.alto}`)
  if (estado.dpr !== DPR) problemas.push(`devicePixelRatio=${estado.dpr}, se pidio ${DPR}`)
  if (!estado.rafCorre) problemas.push('requestAnimationFrame NO corrio en 1,5 s')
  if (!estado.hayCanvas) problemas.push('no hay canvas: la escena no monto y medir la superposicion sin logo no dice nada')
  if (problemas.length > 0) throw new Error(`la ventana no esta en condiciones de medirse — ${problemas.join(' · ')}`)
  return estado
}

export interface SesionTapado {
  readonly pagina: Pagina
  readonly ventana: Ventana
}

/** Abre UN Chrome para toda la corrida. Las ventanas van en pestañas nuevas. */
export async function conChrome<T>(quien: string, trabajo: (c: ChromeLanzado) => Promise<T>): Promise<T> {
  const chrome = await lanzarChrome({
    perfil: `C:\\Users\\Valentino\\.cache\\b4-medicion\\${quien}`,
    ancho: 1300,
    alto: 1000,
    limpiarPerfil: false,
  })
  try {
    return await trabajo(chrome)
  } finally {
    await cerrarChrome(chrome)
    await new Promise((r) => setTimeout(r, 700))
  }
}

/**
 * UNA PESTAÑA NUEVA POR ANCHO, con las métricas puestas ANTES de navegar.
 *
 * Es la regla del sprint escrita en código: el nivel de calidad se decide al
 * montar, así que redimensionar no produce el ancho que se pide. La pestaña se
 * abre, se emula, se navega y se cierra.
 */
export async function enLaVentana<T>(
  chrome: ChromeLanzado,
  ventana: Ventana,
  trabajo: (s: SesionTapado) => Promise<T>,
  opciones: { readonly ruta?: string; readonly asentamientoMs?: number } = {},
): Promise<T> {
  const pagina = await abrirPagina(chrome)
  try {
    await pagina.conexion.enviar(
      'Emulation.setDeviceMetricsOverride',
      {
        width: ventana.ancho,
        height: ventana.alto,
        deviceScaleFactor: DPR,
        mobile: ventana.movil,
        screenWidth: ventana.ancho,
        screenHeight: ventana.alto,
      },
      pagina.sessionId,
    )
    await pagina.conexion.enviar(
      'Emulation.setTouchEmulationEnabled',
      { enabled: ventana.movil, maxTouchPoints: 5 },
      pagina.sessionId,
    )
    await pagina.conexion.enviar(
      'Emulation.setEmulatedMedia',
      { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] },
      pagina.sessionId,
    )
    await pagina.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: MARCA_DE_INTRO }, pagina.sessionId)
    /**
     * ⚠️ **HASTA TRES CARGAS, Y EL MOTIVO ESTÁ MEDIDO.** Contra el dev server
     * con webpack, una de cada varias cargas deja la página sin el nodo
     * `[data-escena]`: el chunk perezoso de la escena llega tarde o se está
     * recompilando, y cuatro segundos de asentamiento no alcanzan. Medir ahí
     * daría una superposición de 0 % por AUSENCIA DE LOGO, que es la peor clase
     * de cero: el que se parece al bueno. Recargar es la salida honesta —cada
     * intento es una recarga limpia, que es lo que el sprint pide— y el tope
     * hace que una escena que nunca monta siga siendo un error.
     */
    let montada = false
    for (let intento = 1; intento <= 3 && !montada; intento += 1) {
      const cargada = new Promise<void>((resolver) => {
        pagina.conexion.al('Page.loadEventFired', () => resolver())
      })
      await pagina.conexion.enviar(
        intento === 1 ? 'Page.navigate' : 'Page.reload',
        intento === 1 ? { url: `${ORIGEN}${opciones.ruta ?? '/v3'}` } : { ignoreCache: false },
        pagina.sessionId,
      )
      await Promise.race([cargada, new Promise((r) => setTimeout(r, 90_000))])
      montada = await medir<boolean>(
        pagina,
        `(async () => {
          const hasta = Date.now() + ${opciones.asentamientoMs ?? ASENTAMIENTO_MS} + 8000
          while (Date.now() < hasta) {
            if (document.querySelector('[data-escena]') !== null) {
              await new Promise((r) => setTimeout(r, ${opciones.asentamientoMs ?? ASENTAMIENTO_MS}))
              return document.querySelector('[data-escena]') !== null
            }
            await new Promise((r) => setTimeout(r, 150))
          }
          return false
        })()`,
      )
      if (!montada) console.warn(`    (aviso) a ${ventana.ancho}: la escena no monto en el intento ${intento}; recargando`)
    }
    if (!montada) throw new Error(`a ${ventana.ancho}: la escena no monto en tres cargas — no hay [data-escena] en el DOM`)
    await verificarVentana(pagina, ventana)
    return await trabajo({ pagina, ventana })
  } finally {
    await cerrarPagina(pagina)
  }
}

export function asegurarCarpetas(): void {
  mkdirSync(TEMP, { recursive: true })
}

export function argumento(nombre: string, defecto: string): string {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`))
  return a === undefined ? defecto : a.slice(nombre.length + 3)
}

export const dos = (n: number): number => Number(n.toFixed(2))
export const cuatro = (n: number): number => Number(n.toFixed(4))

/**
 * LAS CAPAS, CON UNA HOJA DE ESTILOS Y NO CON `style.visibility` INLINE.
 *
 * ⚠️ **El inline no aguanta, y se aprendió fallando.** `scripts-b8/ocultar.ts`
 * escribe `el.style.visibility` y comprueba el resultado; a 390 devolvió `false`
 * en medio del barrido —la escena vive en un árbol de React que vuelve a
 * commitear mientras la medición corre y pisa el atributo `style`—. Una hoja con
 * `!important` en el `<head>` no la puede pisar ningún commit, y además dice en
 * UNA regla lo que el recorrido de nodos decía en un bucle.
 */
export const HOJA_DE_CAPAS = 'tapado-capas'

/** La regla que deja SÓLO la escena. `visibility` de un hijo gana sobre la del padre. */
export const SOLO_LA_ESCENA = `body *{visibility:hidden!important}[data-escena],[data-escena] *{visibility:visible!important}`
/** La regla que saca la escena y deja todo lo demás. */
export const SIN_LA_ESCENA = `[data-escena],[data-escena] *{visibility:hidden!important}`

/**
 * LA COMPOSICIÓN ANTERIOR DEL HERO, como regla — para poder medir el ANTES sin
 * tocar el árbol.
 *
 * El cambio de este sprint es UNA declaración (`justify-end` abajo del
 * breakpoint en vez de `justify-center` en todos lados), así que el estado
 * anterior se reproduce exactamente con una regla que la pise. Medir el antes
 * así es mejor que revertir el archivo y volver a construir: **es el mismo
 * árbol, el mismo bundle y la misma escena**, con una sola variable cambiada,
 * que es la condición para poder atribuir una diferencia.
 */
export const COMPOSICION_CENTRADA = `[data-pantalla="hero"]{justify-content:center!important}`

/**
 * Pone (o saca, con cadena vacía) la hoja y devuelve lo que el navegador dice.
 *
 * ⚠️ **Espera a que el nodo de la escena EXISTA antes de mirar.** `EscenaDelHome`
 * viaja en un chunk perezoso y `EscenarioCompuerta` lo remonta con `key={calidad}`
 * cuando el hook de ancho se resuelve; a 425 la comprobación encontró
 * `[data-escena]` en `null` después de cuatro segundos de asentamiento. Esperarlo
 * acá convierte una carrera en una espera, y el tope hace que una escena que
 * nunca monta siga siendo un error y no un cero silencioso.
 */
export function PONER_CAPA(regla: string): string {
  return `(async () => {
  const id = ${JSON.stringify(HOJA_DE_CAPAS)}
  const hasta = Date.now() + 8000
  while (document.querySelector('[data-escena]') === null && Date.now() < hasta) {
    await new Promise((r) => setTimeout(r, 120))
  }
  let hoja = document.getElementById(id)
  if (hoja === null) { hoja = document.createElement('style'); hoja.id = id; document.head.appendChild(hoja) }
  hoja.textContent = ${JSON.stringify(regla)}
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const escenas = [...document.querySelectorAll('[data-escena]')]
  const titular = document.querySelector('[data-pantalla="hero"] h1')
  return {
    escena: escenas.length === 0 ? 'n/d' : [...new Set(escenas.map((e) => getComputedStyle(e).visibility))].join('+'),
    titular: titular === null ? 'n/d' : getComputedStyle(titular).visibility,
    cuantasEscenas: escenas.length,
  }
})()`
}

export interface EstadoDeCapas {
  readonly escena: string
  readonly titular: string
  readonly cuantasEscenas: number
}
