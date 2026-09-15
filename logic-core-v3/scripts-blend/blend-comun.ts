/**
 * BANCO DE BLEND-1 — la plomería para medir `mix-blend-mode: difference` sobre
 * el home, y nada más. **Ni una línea de producto.**
 *
 * ── Qué hereda y qué escribe ──────────────────────────────────────────────
 *
 * Hereda TODO lo que ya existe y no vuelve a escribirlo: el cliente de CDP y
 * los perfiles (`scripts-b4/`), la captura y la espera del primer cuadro
 * (`scripts-b4/captura.ts`), la máscara de glifo y `contrasteBajoElGlifoConOpacidad`
 * (`scripts-b8/glifo-alfa.ts`), los lectores de bloques y paneles y el apagado
 * de la tinta (`scripts-b8/lectores.ts`), el ocultamiento por capas
 * (`scripts-b8/ocultar.ts`) y el puente de automatización (`scripts-b5/`).
 *
 * Lo propio son TRES cosas, y ninguna es una fórmula de contraste:
 *
 *   1. **La ventana de 390×844** que la instrucción pide, que no está en
 *      `scripts-b4/perfiles.ts` (ahí viven 375 y 393).
 *   2. **El blend inyectado** (`PONER_EL_BLEND`), que es la entrada del
 *      instrumento: se pone para medir y se saca al terminar.
 *   3. **La zona muerta**, que es la cuenta que decide el sprint.
 *
 * ── ⚠️ POR QUÉ EL BLEND SE MIDE LEÍDO Y NO CALCULADO ──────────────────────
 *
 * `difference` con blanco es `resultado = 255 − fondo` por canal, y sería
 * tentador calcularlo: pasarle a `contrasteBajoElGlifoConOpacidad` una tinta
 * por píxel en vez de un color. **No se hace, y el motivo es el PASO 1.**
 *
 * La cuenta `255 − fondo` sólo describe lo que el navegador pinta **si la
 * cadena de apilamiento está intacta**. Si algún ancestro la corta, el
 * navegador pinta `255 − (lo que haya en el grupo)` —blanco sobre blanco— y la
 * cuenta analítica seguiría devolviendo el número lindo de un blend que no
 * ocurrió. Ése es exactamente el modo de falla que este repo nombra «verde por
 * arnés»: un instrumento que fuerza la entrada que después afirma.
 *
 * Así que el blend se LEE de una captura con el blend puesto (la captura **B**)
 * y la tinta de cada píxel de glifo sale de ahí. La cuenta analítica se calcula
 * igual, pero sólo como **discriminador**: si lo leído y lo calculado coinciden,
 * la cadena está intacta; si lo leído es blanco constante y lo calculado no, la
 * cadena está cortada. Es el discriminador empírico que la lección de agosto
 * pide antes de volver a tocar el código.
 *
 * ── ⚠️ Y POR QUÉ EL CONTROL SÍ USA EL INSTRUMENTO TAL CUAL ────────────────
 *
 * La columna «sin blend» de cada tabla es `contrasteBajoElGlifoConOpacidad`
 * importado de `scripts-b8/glifo-alfa.ts` **sin un solo cambio**, con la misma
 * máscara, el mismo umbral de glifo (24) y la misma composición por opacidad.
 * Es lo que la instrucción pide («no escribas uno nuevo») y es además lo que
 * hace comparable esta tabla con las de B8 y B11.
 *
 * ── Las cuatro reglas de captura de B4-B, heredadas ───────────────────────
 *
 *   1. La escena tarda 300–700 ms en pintar su primer cuadro: `esperarElPrimerCuadro`
 *      antes de cada captura, siempre.
 *   2. Toda captura es de viewport, con el scroll puesto: el escenario es `fixed`.
 *   3. ⚠️ **No se escribe en `docs/` con el navegador abierto**: el dev server
 *      vigila el árbol y recompila bajo la captura. Las intermedias van a `TEMP`,
 *      FUERA del árbol; los JSON se escriben DESPUÉS de cerrar.
 *   4. El preloader no arma bajo webdriver: `PUENTE_DE_AUTOMATIZACION` + la marca
 *      del intro, antes del primer pintado.
 *
 * ── ⚠️ Y LA REGLA DE AGOSTO, QUE ACÁ NO ES OPCIONAL ───────────────────────
 *
 * Con la pestaña ocluida el navegador saltea los rendering steps: no corre
 * `rAF`, `innerWidth` da 0 y toda captura sale con un `clip` degenerado.
 * `verificarLaPagina` lo comprueba y TIRA. Todo lo que este banco mide son
 * cuadros pintados.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import {
  abrirPagina,
  cerrarPagina,
  emular,
  medir,
  verificarLaPagina,
  type EstadoDeLaPagina,
  type Pagina,
} from '../scripts-b4/navegador'
import { perfilPorId, type Perfil } from '../scripts-b4/perfiles'
import { MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from '../scripts-b5/b5-comun'
import { moverElPuntero, verificarQueLaPaginaEstaEntera } from '../scripts-b5/pagina'
import { CHOREO_KEYFRAMES } from '../src/app/v3/_lib/escena/choreography'
import { pantallaDeProgreso, PANTALLAS_DE_SCROLL } from '../src/app/v3/_lib/escena/recorrido'

/** El puerto de ESTE worktree y de la receta canónica (`scripts-movil/movil-comun.ts`). */
export const ORIGEN = 'http://localhost:3000'

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/blend'
export const CARPETA_DE_CAPTURAS = 'docs/rediseno/capturas/blend'

/**
 * Las capturas intermedias, FUERA del árbol. El dev server vigila el repo y una
 * captura escrita adentro lo hace recompilar en medio de la medición; y un
 * directorio intruso adentro del árbol envenena la auto-detección de fuentes de
 * Tailwind 4 (lección de agosto, `.next-s3b`). Afuera no hay ninguna de las dos.
 */
export const TEMP = path.join(process.env.TEMP ?? process.env.TMP ?? '.', 'blend-capturas')

/**
 * LA VENTANA DE 390×844 — la que la instrucción pide. No sale de
 * `scripts-b4/perfiles.ts` porque ahí no está: la tabla tiene 375 (iPhone SE) y
 * 393 (iPhone 15), y 390 es el del iPhone 14/15 base, que es el que MOVIL-1 y
 * VERTICAL-1 ya usaron. Se declara acá con la misma forma para que `emular` y
 * `verificarLaPagina` la traten como a cualquier otra.
 *
 * ⚠️ `dpr: 1`, como los siete perfiles y por el mismo motivo escrito allá: con
 * ×3 el canvas cambia su resolución de render y ninguna cifra sería comparable
 * con las de B8 y B11. El ×3 sólo hace falta para medir COSTO, y para eso está
 * el banco de MOVIL-1 (`scripts-movil/movil-comun.ts`), que es el que el PASO 5
 * reusa.
 */
export const PERFIL_390: Perfil = {
  id: '390',
  nombre: 'iPhone 14/15',
  procedencia:
    'viewport de layout del iPhone 14/15, 390×844 CSS px. Es el que pide la instrucción de BLEND-1 y el que MOVIL-1 y VERTICAL-1 midieron.',
  ancho: 390,
  alto: 844,
  dpr: 1,
  movil: true,
  tactil: true,
  debajoDelUmbral: true,
}

/** Los tres anchos del sprint, en el orden en que se cruza el umbral del escenario (1025). */
export const VENTANAS: readonly Perfil[] = [PERFIL_390, perfilPorId('1440'), perfilPorId('1920')]

/** El envoltorio de la escena. Lo emite `EscenaDelHome.tsx` como `data-escena`. */
export const SELECTOR_DE_LA_ESCENA = '[data-escena]'

/** Cuánto se espera DESPUÉS del primer cuadro para que la escena se asiente (B5, B6, B8). */
export const ASENTAMIENTO_MS = 4000

/**
 * El revelado del contenido (Framer, `whileInView`) llega después del primer
 * cuadro, y el lector de bloques salta lo que está a opacidad cero: en la noche
 * de Trabajos B8 leyó 1 bloque de 9 sin esto. Es el mismo número de B8.
 */
export const ASENTAMIENTO_DE_BLOQUES_MS = 1500

// ─────────────────────────────────────────────────────────────────────────────
// LA ZONA MUERTA — la cuenta que decide el sprint
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ⚠️ **LA ZONA MUERTA SE DEFINE EN EL ESPACIO EN QUE EL BLEND ACTÚA, Y NO ES EL
 * DE LA LUMINANCIA.**
 *
 * `mix-blend-mode` opera sobre los valores de color **tal como están**, o sea
 * sRGB con gamma, canal por canal: `resultado = |fondo − fuente|`, y con fuente
 * blanca, `255 − fondo`. El punto fijo está en 127,5 **de sRGB**, no en el 50 %
 * de luminancia relativa (que cae en sRGB ≈ 188). Definir la zona muerta sobre
 * la luminancia lineal la pondría en el lugar equivocado y el sprint mediría
 * otra cosa.
 *
 * Así que «fondo entre 40 % y 60 % de luminancia» se lee como **el canal sRGB
 * entre el 40 % y el 60 % de su rango**: 102 a 153. Es la banda donde
 * `255 − fondo` cae dentro de ±51 del propio fondo.
 *
 * Y se publica lo que esa banda vale en contraste, que es la cifra que mata o
 * salva al blend: en 127/128 la razón es **1,014:1** (texto invisible) y en los
 * dos bordes de la banda, **2,015:1** — o sea que **TODA la banda está bajo
 * 3:1, y por lo tanto bajo AA en cualquier tamaño.** Un píxel en la zona muerta
 * no es «poco contraste»: es texto que no está.
 *
 * ⚠️ **Y ESTA DEFINICIÓN SUBESTIMA EL PROBLEMA, A PROPÓSITO.** La banda 102–153
 * es el núcleo, no el borde: calculado sobre la misma fórmula, el blend queda
 * **bajo 4,5:1 con el fondo en sRGB [73, 182]** —el **43,0 %** del rango— y
 * **bajo 3:1 en [88, 167]** —el 31,3 %—, contra el 20,3 % que abarca 102–153.
 * O sea que toda cuenta de «zona muerta» de este banco es un **piso**: el
 * fracaso real del blend es más de dos veces más ancho. Se conserva la
 * definición estrecha porque es la que la instrucción declara y la que hace
 * comparables las cifras, y se dice que es conservadora.
 */
export const ZONA_MUERTA = { desde: 102, hasta: 153 } as const

/** El gris sRGB de un píxel, por canal máximo: el blend actúa canal por canal, no sobre la luminancia. */
export function grisDelPixel(datos: Uint8Array, k: number): number {
  return (datos[k] + datos[k + 1] + datos[k + 2]) / 3
}

/** Si un píxel de FONDO cae en la banda donde `255 − fondo ≈ fondo`. */
export function enZonaMuerta(gris: number): boolean {
  return gris >= ZONA_MUERTA.desde && gris <= ZONA_MUERTA.hasta
}

// ─────────────────────────────────────────────────────────────────────────────
// EL BLEND INYECTADO — la entrada del instrumento, reversible
// ─────────────────────────────────────────────────────────────────────────────

const ID_DEL_ESTILO_DEL_BLEND = 'blend1-difference'

/**
 * PONE (o saca) `mix-blend-mode: difference` con tinta blanca sobre los bloques
 * que el lector de `scripts-b8/lectores.ts` ya marcó con `data-b8-bloque`.
 *
 * ⚠️ **Se aplica a los bloques marcados y no a un selector del sistema.** El
 * conjunto medido tiene que ser EXACTAMENTE el mismo que mide el control, o las
 * dos columnas de la tabla no se podrían comparar. El lector marca el elemento
 * que TIENE los nodos de texto propios, que es el nodo correcto: aplicar el
 * blend más arriba mezclaría también los fondos de las tarjetas.
 *
 * ⚠️ **`isolation: isolate` NO se toca acá.** La pregunta del PASO 1 es si la
 * cadena que HOY existe deja pasar el blend; poner `isolation` en algún ancestro
 * para «arreglarlo» sería construir producto, y este sprint no construye. Lo que
 * haría falta para destrabarlo se REPORTA, no se aplica.
 *
 * Devuelve lo que el navegador computó sobre los bloques, para no suponer que tomó.
 */
export function PONER_EL_BLEND(poner: boolean): string {
  const regla = [
    '[data-b8-bloque], [data-b8-campo] {',
    '  mix-blend-mode: difference !important;',
    '  color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;',
    '}',
    '[data-b8-campo]::placeholder { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important }',
  ].join('\n')
  return `(async () => {
  const viejo = document.getElementById(${JSON.stringify(ID_DEL_ESTILO_DEL_BLEND)})
  if (viejo !== null) viejo.remove()
  if (${poner}) {
    const estilo = document.createElement('style')
    estilo.id = ${JSON.stringify(ID_DEL_ESTILO_DEL_BLEND)}
    estilo.textContent = ${JSON.stringify(regla)}
    document.head.appendChild(estilo)
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const bloques = [...document.querySelectorAll('[data-b8-bloque], [data-b8-campo]')]
  if (bloques.length === 0) return { tomo: false, bloques: 0, rebeldes: [] }
  const esperado = ${poner} ? 'difference' : 'normal'
  const rebeldes = bloques
    .filter((el) => getComputedStyle(el).mixBlendMode !== esperado)
    .map((el) => ({ etiqueta: el.tagName.toLowerCase(), modo: getComputedStyle(el).mixBlendMode, color: getComputedStyle(el).color }))
  return { tomo: rebeldes.length === 0, bloques: bloques.length, rebeldes: rebeldes.slice(0, 20) }
})()`
}

export interface BlendPuesto {
  readonly tomo: boolean
  readonly bloques: number
  readonly rebeldes: readonly { readonly etiqueta: string; readonly modo: string; readonly color: string }[]
}

/**
 * BORRA LAS MARCAS DE BLOQUE — y no es limpieza, es corrección.
 *
 * `LECTOR_DE_BLOQUES` pone `data-b8-bloque` y **no lo saca**: es lo que después
 * usa `APAGAR_LA_TINTA` para apagar la tinta de lo que midió. Pero las marcas se
 * ACUMULAN entre llamadas, así que leer la sección 3 después de la 2 deja
 * marcados los bloques de las dos, y un bloque de Números que todavía asoma en
 * cuadro mientras se mide Trabajos se le atribuiría a Trabajos. `c-las-ocho.ts`
 * no lo sufre porque recorre una sección entera antes de pasar a la siguiente y
 * su lector re-marca desde cero cada vez; los instrumentos de este banco leen
 * varias secciones en la misma pose, así que las marcas se borran ANTES de cada
 * lectura. Devuelve cuántas borró, para que se vea que había.
 */
export const BORRAR_LAS_MARCAS = `(async () => {
  const marcados = [...document.querySelectorAll('[data-b8-bloque], [data-b8-campo]')]
  for (const el of marcados) { el.removeAttribute('data-b8-bloque'); el.removeAttribute('data-b8-campo') }
  await new Promise((r) => requestAnimationFrame(r))
  return { borradas: marcados.length, quedan: document.querySelectorAll('[data-b8-bloque], [data-b8-campo]').length }
})()`

export interface MarcasBorradas {
  readonly borradas: number
  readonly quedan: number
}

// ─────────────────────────────────────────────────────────────────────────────
// LOS KEYFRAMES, EN PÍXELES DE SCROLL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Las siete entradas de la coreografía. Se importan del producto —no se
 * copian— porque el sprint que mueva una pose tiene que mover esta tabla sola.
 */
export const KEYFRAMES = CHOREO_KEYFRAMES.map((k) => ({ nombre: k.name, at: k.at }))

/**
 * A QUÉ `scrollY` HAY QUE IR PARA QUE LA CÁMARA ESTÉ EN UN PROGRESO DADO.
 *
 * Es la inversa exacta de lo que corre en producción, compuesta con sus propias
 * funciones y no con una regla de tres:
 *
 *   producción · `pantallaDeScroll` (anclaje.ts:289) →
 *       pantalla = clamp((scrollY − arriba) / (abajo − arriba − ventana)) × PANTALLAS_DE_SCROLL
 *   producción · `progresoDePantalla` (recorrido.ts:135) → progreso
 *
 * y de vuelta con `pantallaDeProgreso`, que el producto exporta. `arriba` y
 * `abajo` son la extensión de las secciones (`extensionDeLasSecciones.ts`: la
 * unión de las cajas de `[data-panel]`), **no el alto del documento**, que es la
 * corrección que V3-B hizo y que una regla de tres sobre `scrollHeight`
 * volvería a perder.
 */
export function scrollDelProgreso(
  progreso: number,
  secciones: { readonly arriba: number; readonly abajo: number },
  ventana: number,
): number {
  const recorrido = secciones.abajo - secciones.arriba - ventana
  if (!(recorrido > 0)) return 0
  const pantalla = pantallaDeProgreso(progreso)
  const fraccion = pantalla / PANTALLAS_DE_SCROLL
  return Math.round(secciones.arriba + Math.min(1, Math.max(0, fraccion)) * recorrido)
}

// ─────────────────────────────────────────────────────────────────────────────
// LA SESIÓN
// ─────────────────────────────────────────────────────────────────────────────

export interface Sesion {
  readonly pagina: Pagina
  readonly estado: EstadoDeLaPagina
  readonly perfil: Perfil
}

/**
 * Abre un Chrome propio (perfil `blend`, para no pisar el de otro lane), deja la
 * página verificada, corre el trabajo y cierra.
 *
 * El `finally` no es cortesía: si la medición tira y el Chrome queda vivo, el
 * `userDataDir` queda tomado y la corrida siguiente no arranca. Y la pausa
 * después de cerrar tampoco: `Browser.close` no espera a que el proceso suelte
 * el perfil.
 */
export async function conLaPagina<T>(
  perfil: Perfil,
  ruta: string,
  trabajo: (s: Sesion) => Promise<T>,
  opciones: { readonly quien?: string; readonly origen?: string; readonly movimientoReducido?: boolean } = {},
): Promise<T> {
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome(opciones.quien ?? 'blend'),
    ancho: perfil.ancho + 40,
    alto: perfil.alto + 140,
    limpiarPerfil: false,
  })
  try {
    const pagina = await abrirPagina(chrome)
    try {
      await emular(pagina, perfil, { movimientoReducido: opciones.movimientoReducido })
      for (const fuente of [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO]) {
        await pagina.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: fuente }, pagina.sessionId)
      }
      const cargada = new Promise<void>((resolver) => {
        pagina.conexion.al('Page.loadEventFired', () => resolver())
      })
      await pagina.conexion.enviar('Page.navigate', { url: `${opciones.origen ?? ORIGEN}${ruta}` }, pagina.sessionId)
      await Promise.race([cargada, new Promise((r) => setTimeout(r, 60_000))])
      const estado = await verificarLaPagina(pagina, perfil)
      return await trabajo({ pagina, estado, perfil })
    } finally {
      await cerrarPagina(pagina)
    }
  } finally {
    await cerrarChrome(chrome)
    await new Promise((r) => setTimeout(r, 900))
  }
}

/**
 * ⚠️ **LA PÁGINA ENTERA, CON UN DISCRIMINADOR QUE VALE A 390 — Y POR QUÉ NO SE
 * USA EL DE B5.**
 *
 * `verificarQueLaPaginaEstaEntera` (`scripts-b5/pagina.ts:92`) detecta «la
 * página se pintó SIN CSS» —el modo de falla que le dio a B5 un titular en
 * serif sobre blanco y 39.628 píxeles de glifo— con un detector geométrico:
 * **ocho paneles con altos múltiplos exactos del viewport**.
 *
 * Ese detector es correcto arriba de 1025, donde cada sección es un `min-h-svh`
 * (o varios) y el contenido entra. **A 390 es falso sin que nada esté roto:** el
 * contenido no entra en 844 px, las secciones crecen con él y sus altos medidos
 * son 3396, 2784, 2913, 2199, 1253 y 1091 — ninguno múltiplo de 844. Correr el
 * chequeo de B5 acá tira siempre, y aflojarlo para todos los anchos perdería la
 * mitad que sí funciona.
 *
 * Así que la mitad geométrica se conserva **sólo del lado donde vale** (el
 * perfil lo dice: `debajoDelUmbral`), y en su lugar entran dos comprobaciones
 * que no dependen del viewport y que una página sin CSS no puede pasar:
 *
 *   · **los custom properties resuelven** — `--color-fondo` es el token que los
 *     instrumentos de B8 ya esperan en `rgb(247, 247, 245)`. Sin la hoja de
 *     estilos no hay variables y el valor sale vacío;
 *   · **la familia tipográfica no es la de defecto del navegador** — que es el
 *     síntoma exacto que B5 vio (serif), y que `HERO-1` dejó cableada en
 *     `data-v3`.
 *
 * Las ocho secciones se exigen en los tres anchos: eso no depende del CSS pero
 * sí de que la página sea el home y haya terminado de montar.
 */
export async function verificarQueElHomeEstaEntero(p: Pagina, perfil: Perfil): Promise<void> {
  if (!perfil.debajoDelUmbral) {
    await verificarQueLaPaginaEstaEntera(p, perfil)
  }
  const estado = await medir<{
    readonly paneles: number
    readonly altos: readonly number[]
    readonly fondo: string
    readonly fondoDelCuerpo: string
    readonly familia: string
    readonly docH: number
  }>(
    p,
    `(() => {
      const ps = [...document.querySelectorAll('[data-panel]')]
      const raiz = getComputedStyle(document.documentElement)
      const alguno = document.querySelector('[data-panel] h1, [data-panel] h2, [data-panel] p')
      return {
        paneles: ps.length,
        altos: ps.map((x) => Math.round(x.getBoundingClientRect().height)),
        fondo: raiz.getPropertyValue('--color-fondo').trim(),
        fondoDelCuerpo: getComputedStyle(document.body).backgroundColor,
        familia: alguno === null ? '(no hay texto)' : getComputedStyle(alguno).fontFamily,
        docH: document.documentElement.scrollHeight,
      }
    })()`,
  )
  const problemas: string[] = []
  if (estado.paneles !== 8) problemas.push(`hay ${estado.paneles} paneles y tienen que ser 8`)
  if (estado.fondo === '') problemas.push('`--color-fondo` no resuelve: la hoja de estilos no llegó')
  if (/^(serif|Times|"Times)/i.test(estado.familia)) problemas.push(`la familia es «${estado.familia}»: la página se pintó sin CSS`)
  if (estado.altos.some((a) => a <= 0)) problemas.push(`hay paneles de alto 0: ${estado.altos.join(', ')}`)
  if (problemas.length > 0) {
    throw new Error(`el home no está entero (¿el dev server recompilando?) — ${problemas.join(' · ')}. docH=${estado.docH}`)
  }
}

/**
 * Deja el home en condiciones de medirse: primer cuadro, asentamiento, el home
 * entero (no a medio compilar) y el puntero en el centro, para que el seguimiento
 * del mouse aporte desplazamiento CERO a la pose.
 */
export async function asentarElHome(s: Sesion): Promise<void> {
  await esperarElPrimerCuadro(s.pagina)
  await new Promise((r) => setTimeout(r, ASENTAMIENTO_MS))
  await verificarQueElHomeEstaEntero(s.pagina, s.perfil)
  await moverElPuntero(s.pagina, s.perfil, Math.round(s.perfil.ancho / 2), Math.round(s.perfil.alto / 2))
}

/** Si la escena montó de verdad. Sin canvas no hay blend que medir y la corrida no vale. */
export async function hayCanvas(p: Pagina): Promise<{ readonly hay: boolean; readonly ancho: number; readonly alto: number }> {
  return medir(
    p,
    `(() => { const c = document.querySelector('canvas'); return c === null ? { hay: false, ancho: 0, alto: 0 } : { hay: true, ancho: c.width, alto: c.height } })()`,
  )
}

export function asegurarCarpetas(): void {
  mkdirSync(TEMP, { recursive: true })
}

export function guardarJson(asunto: string, dato: unknown): string {
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const ruta = `${RAIZ_DE_SALIDAS}/${asunto}.json`
  writeFileSync(ruta, `${JSON.stringify(dato, null, 2)}\n`, 'utf8')
  return ruta
}

export function argumento(nombre: string, defecto: string): string {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`))
  return a === undefined ? defecto : a.slice(nombre.length + 3)
}

export const dos = (n: number): number => Number(n.toFixed(2))
export const cuatro = (n: number): number => Number(n.toFixed(4))
