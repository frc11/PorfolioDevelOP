/**
 * BLEND-1 · E — UN INSTRUMENTO DE COSTO QUE SÍ DISCRIMINA, y el costo del blend.
 *
 *     npx tsx scripts-blend/e-fps.ts [--repeticiones=3]
 *
 * Contesta las dos preguntas que MOVIL-1 dejó abiertas (PASO 5).
 *
 * ── (a) ⚠️ POR QUÉ EL BANCO DE MOVIL-1 NO DISCRIMINABA ────────────────────
 *
 * Porque medía **cuadros por segundo con el vsync puesto**. El monitor de esta
 * máquina va a 75 Hz, así que mientras la escena tenga cualquier holgura el
 * navegador entrega 75 cuadros y ni uno más: todas las configuraciones dieron
 * 74,9x. No es que la escena cueste lo mismo — es que **el techo del
 * instrumento estaba debajo del piso de la diferencia.** Un contador de fps
 * sólo separa dos configuraciones cuando las dos ya perdieron la carrera.
 *
 * El arreglo es sacar el techo: `--disable-gpu-vsync` y
 * `--disable-frame-rate-limit` desacoplan `requestAnimationFrame` del refresco,
 * y entonces el intervalo entre cuadros **es** el tiempo que el renderizador
 * tarda. Con holgura eso da 200, 400 o 900 cuadros por segundo, y ahí una
 * diferencia del 20 % se ve.
 *
 * ⚠️ **El instrumento se declara ROTO si el desacople no ocurre.** Si con las
 * banderas puestas la corrida sigue dando ~75 fps, las banderas no tomaron y
 * toda comparación sería la de MOVIL-1 otra vez. Se comprueba y se dice.
 *
 * ── LOS CONTROLES, que es lo que hace válido al instrumento ───────────────
 *
 * La instrucción pide validarlo: *«una configuración deliberadamente pesada
 * tiene que dar peor»*. Van DOS controles positivos, de naturalezas distintas,
 * y uno negativo:
 *
 *   · **`dpr-3` contra `dpr-1`** — el mismo árbol rasterizando 9 veces más
 *     píxeles (el techo de `dpr` de r3f muerde recién con `deviceScaleFactor`
 *     alto, que es la lección que `movil-comun.ts` escribió). Control de
 *     **relleno de la escena**.
 *   · **`desenfoque`** — un `backdrop-filter: blur(24px)` a pantalla completa
 *     sobre el canvas. Es el control de **relleno del compositor**, que es
 *     exactamente la naturaleza del costo del blend: obliga a releer el fondo
 *     cada cuadro. Si el instrumento no ve ESTO, no puede ver el blend.
 *   · **`sin-escena`** (negativo) — la escena oculta: el piso de la página sin
 *     WebGL. Acota cuánto del costo total es la escena.
 *
 * ── (b) EL COSTO DEL BLEND ────────────────────────────────────────────────
 *
 * Se mide en DOS estados, y la diferencia entre ellos es el punto:
 *
 *   · **`blend-trabado`** — el blend puesto sobre el árbol de hoy. La cadena
 *     está cortada (`a-cadena.ts`), así que el compositor mezcla contra el
 *     grupo de la sección, que es ESTÁTICO. Es el costo del blend que hoy se
 *     podría poner, y **no** es el costo de la pregunta.
 *   · **`blend-destrabado`** — el blend con la cadena llegando al canvas
 *     (la misma inyección de `b-contraste.ts`). Acá sí el fondo es un canvas
 *     vivo y el compositor tiene que releerlo cada cuadro. **Éste es el número
 *     que la pregunta (b) pide**, y hay que restarle el costo del destrabe
 *     solo, que también se mide (`destrabado`).
 *
 * ── ⚠️ QUÉ NO COMPRA ESTE BANCO ───────────────────────────────────────────
 *
 * No compra la GPU de un teléfono, ni su térmica, ni WebKit: abajo corre Blink
 * sobre la GPU de esta máquina. Mide **cuánto cambia el costo entre dos
 * configuraciones sobre el mismo hardware**, que es la comparación que la
 * decisión necesita — no cuántos cuadros hace un iPhone.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, medir, type Pagina } from '../scripts-b4/navegador'
import { MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from '../scripts-b5/b5-comun'
import { LECTOR_DE_BLOQUES_EN, type Bloque } from '../scripts-b8/lectores'
import { ORIGEN, PONER_EL_BLEND, RAIZ_DE_SALIDAS, argumento, dos, type BlendPuesto } from './blend-comun'

/** La ventana del sprint, y el `deviceScaleFactor` que hace morder el techo de `dpr` de r3f. */
const VENTANA = { ancho: 390, alto: 844 } as const

/**
 * ⚠️ **LAS DOS BANDERAS, Y LO QUE CADA UNA HACE.**
 *
 * `--disable-gpu-vsync` desengancha la presentación del refresco del monitor;
 * `--disable-frame-rate-limit` saca además el tope interno que Chrome aplica
 * cuando no hay vsync. Las dos juntas: sin una, la otra no alcanza.
 */
const BANDERAS_SIN_VSYNC: readonly string[] = ['--disable-gpu-vsync', '--disable-frame-rate-limit']

/** Cuánto dura cada ventana de conteo. Con el vsync apagado, 3 s son miles de cuadros. */
const DURACION_MS = 3000
/** Cuánto se le da a la escena para armarse antes de medir (el de MOVIL-1). */
const ASENTAMIENTO_MS = 5000

const ID_DEL_DESTRABE = 'blend1-destrabe-fps'

const REGLA_DEL_DESTRABE = [
  'body { background-color: var(--color-fondo) !important }',
  '[data-v3] { background-color: transparent !important; isolation: isolate !important }',
  '[data-escena] { z-index: -1 !important }',
  'main { z-index: auto !important }',
  '[data-panel] { z-index: auto !important }',
].join('\n')

function HOJA(id: string, css: string, poner: boolean): string {
  return `(async () => {
  const viejo = document.getElementById(${JSON.stringify(id)})
  if (viejo !== null) viejo.remove()
  if (${poner}) {
    const e = document.createElement('style')
    e.id = ${JSON.stringify(id)}
    e.textContent = ${JSON.stringify(css)}
    document.head.appendChild(e)
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  return document.getElementById(${JSON.stringify(id)}) !== null === ${poner}
})()`
}

/**
 * El velo de desenfoque a pantalla completa: el control de relleno del compositor.
 *
 * ⚠️ El estilo va **inline en el nodo** y no en una hoja aparte: la primera
 * versión creaba el div y dejaba su CSS en una constante que nunca se inyectaba,
 * así que el «control positivo» era un div transparente y no desenfocaba nada —
 * o sea que habría dado igual que la base y el instrumento se habría declarado
 * roto por un defecto propio. El `return` comprueba el valor COMPUTADO, que es
 * lo que lo hubiera atrapado.
 */
function PONER_EL_DESENFOQUE(radioPx: number | null): string {
  const estilo = `position:fixed;inset:0;z-index:50;pointer-events:none;backdrop-filter:blur(${radioPx ?? 0}px);-webkit-backdrop-filter:blur(${radioPx ?? 0}px)`
  return `(async () => {
  const previo = document.getElementById('blend1-velo-desenfoque')
  if (previo !== null) previo.remove()
  if (${radioPx !== null}) {
    const velo = document.createElement('div')
    velo.id = 'blend1-velo-desenfoque'
    velo.setAttribute('style', ${JSON.stringify(estilo)})
    document.body.appendChild(velo)
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const v = document.getElementById('blend1-velo-desenfoque')
  if (${radioPx === null}) return v === null
  return v !== null && getComputedStyle(v).backdropFilter.includes('blur')
})()`
}

/**
 * UN SOLO NODO A PANTALLA COMPLETA CON `mix-blend-mode: difference`.
 *
 * ⚠️ **Es el discriminador de la pregunta (b), y separa dos costos que se
 * confunden.** El blend del sprint iría en ~289 bloques de texto, y un blend
 * cuesta por DOS motivos distintos:
 *
 *   · **por nodo** — cada elemento mezclado necesita su propia superficie de
 *     render y su propio arranque de grupo;
 *   · **por área** — el compositor tiene que RELEER el fondo debajo de lo
 *     mezclado, que es lo que la instrucción nombra.
 *
 * Con 289 nodos los dos costos se suman y no se pueden atribuir. Un solo nodo
 * que cubre el cuadro ENTERO tiene el área máxima y el conteo mínimo: si cuesta
 * como los 289, el costo es del área (releer el fondo); si cuesta como la base,
 * el costo es del conteo de nodos.
 */
function PONER_UN_NODO_CON_BLEND(poner: boolean): string {
  const estilo = 'position:fixed;inset:0;z-index:20;pointer-events:none;mix-blend-mode:difference;background:#ffffff'
  return `(async () => {
  const previo = document.getElementById('blend1-un-nodo')
  if (previo !== null) previo.remove()
  if (${poner}) {
    const n = document.createElement('div')
    n.id = 'blend1-un-nodo'
    n.setAttribute('style', ${JSON.stringify(estilo)})
    document.body.appendChild(n)
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const v = document.getElementById('blend1-un-nodo')
  if (${!poner}) return v === null
  return v !== null && getComputedStyle(v).mixBlendMode === 'difference'
})()`
}

/** La escena oculta: el piso de la página sin WebGL. */
function OCULTAR_LA_ESCENA(ocultar: boolean): string {
  return `(async () => {
  const e = document.querySelector('[data-escena]')
  if (e === null) return false
  e.style.visibility = ${ocultar ? "'hidden'" : "''"}
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  return getComputedStyle(e).visibility === ${ocultar ? "'hidden'" : "'visible'"}
})()`
}

interface Cuadros {
  readonly cuadros: number
  readonly msTotal: number
  readonly fps: number
  readonly p50Ms: number
  readonly p95Ms: number
  readonly p99Ms: number
  readonly peorMs: number
  /** Cuadros que tardaron más de 16,7 ms: los que un teléfono a 60 Hz perdería. */
  readonly largos: number
}

/**
 * CUENTA CUADROS MIENTRAS LA PÁGINA SCROLLEA, y publica la distribución de
 * intervalos, no sólo el promedio.
 *
 * ⚠️ **Scrollea, y no es decoración.** Con la página quieta la escena puede no
 * redibujar —el progreso sólo cambia cuando alguien scrollea (`ataduraAlScroll`
 * lo dice)— y se mediría el costo de una página estática. El barrido recorre el
 * tramo donde la escena se ve.
 */
function CONTAR(duracionMs: number, desde: number, hasta: number): string {
  return `(async () => {
  const intervalos = []
  let previo = performance.now()
  const t0 = previo
  const fin = t0 + ${duracionMs}
  let n = 0
  await new Promise((resolver) => {
    const paso = (ahora) => {
      const frac = Math.min(1, (ahora - t0) / ${duracionMs})
      window.scrollTo(0, Math.round(${desde} + frac * (${hasta} - ${desde})))
      intervalos.push(ahora - previo)
      previo = ahora
      n += 1
      if (ahora >= fin) { resolver(); return }
      requestAnimationFrame(paso)
    }
    requestAnimationFrame(paso)
  })
  const ms = performance.now() - t0
  const orden = intervalos.slice(1).sort((a, b) => a - b)
  const en = (q) => orden.length === 0 ? NaN : orden[Math.min(orden.length - 1, Math.floor(q * orden.length))]
  return {
    cuadros: n,
    msTotal: ms,
    fps: (n / ms) * 1000,
    p50Ms: en(0.5),
    p95Ms: en(0.95),
    p99Ms: en(0.99),
    peorMs: orden.length === 0 ? NaN : orden[orden.length - 1],
    largos: orden.filter((x) => x > 16.7).length,
  }
})()`
}

interface Configuracion {
  readonly id: string
  readonly que: string
  readonly dpr: number
  readonly preparar: readonly string[]
  readonly limpiar: readonly string[]
}

/**
 * ⚠️ **EL CONTROL DE `dpr` NO EXISTE A 390, Y NO ES QUE FALLÓ: ES IMPOSIBLE.**
 *
 * La primera corrida de este banco lo usó y dio `lienzo ×1.00` en las dos ramas
 * —o sea que dpr 1 y dpr 3 rasterizaban EL MISMO canvas y el «control» comparaba
 * un número contra sí mismo, que es «verde por arnés» exacto—. La causa está en
 * el producto: `_lib/escena/ajustes.ts:183` clava `dpr: [1, 1]` en la calidad
 * compacta, que es la que corre abajo de 1025, y r3f acota contra eso. La fila
 * `dpr-1` se conserva en la tabla **como recibo de que no varía nada**, y NO se
 * usa para validar el instrumento.
 *
 * En su lugar va un **control GRADUADO de compositor**: el mismo velo con dos
 * radios de desenfoque, 8 y 64 px. Exigir monotonía —`blur64` peor que `blur8`,
 * y `blur8` peor que la base— es mucho más fuerte que un solo umbral, porque un
 * instrumento que sólo mide ruido no produce un orden. Y es de la MISMA
 * naturaleza que el blend: releer el fondo del compositor cada cuadro.
 */
const CONFIGURACIONES: readonly Configuracion[] = [
  { id: 'base', que: 'la escena de hoy a 390, tal cual', dpr: 3, preparar: [], limpiar: [] },
  { id: 'dpr-1', que: 'RECIBO (no control): a 390 el producto ya clava dpr [1,1], así que el lienzo no cambia', dpr: 1, preparar: [], limpiar: [] },
  { id: 'sin-escena', que: 'CONTROL negativo: la escena oculta, el piso de la página sin WebGL', dpr: 3, preparar: [OCULTAR_LA_ESCENA(true)], limpiar: [OCULTAR_LA_ESCENA(false)] },
  { id: 'blur-8', que: 'CONTROL positivo graduado (1/2): backdrop-filter blur(8px) a pantalla completa', dpr: 3, preparar: [PONER_EL_DESENFOQUE(8)], limpiar: [PONER_EL_DESENFOQUE(null)] },
  { id: 'blur-64', que: 'CONTROL positivo graduado (2/2): blur(64px) — tiene que dar PEOR que blur-8', dpr: 3, preparar: [PONER_EL_DESENFOQUE(64)], limpiar: [PONER_EL_DESENFOQUE(null)] },
  { id: 'blend-trabado', que: '(b) el blend sobre el árbol de hoy: la cadena está cortada, el fondo del grupo es estático', dpr: 3, preparar: ['__BLEND_ON__'], limpiar: ['__BLEND_OFF__'] },
  { id: 'destrabado', que: '(b) la inyección del destrabe SOLA, para poder restarla', dpr: 3, preparar: [HOJA(ID_DEL_DESTRABE, REGLA_DEL_DESTRABE, true)], limpiar: [HOJA(ID_DEL_DESTRABE, REGLA_DEL_DESTRABE, false)] },
  { id: 'blend-destrabado', que: '(b) EL NÚMERO DE LA PREGUNTA: el blend en los 289 bloques de texto, mezclando contra el canvas vivo', dpr: 3, preparar: [HOJA(ID_DEL_DESTRABE, REGLA_DEL_DESTRABE, true), '__BLEND_ON__'], limpiar: ['__BLEND_OFF__', HOJA(ID_DEL_DESTRABE, REGLA_DEL_DESTRABE, false)] },
  {
    id: 'blend-un-nodo',
    que: '(b) EL DISCRIMINADOR DEL COSTO: UN solo nodo a pantalla completa con difference sobre el canvas vivo',
    dpr: 3,
    preparar: [HOJA(ID_DEL_DESTRABE, REGLA_DEL_DESTRABE, true), PONER_UN_NODO_CON_BLEND(true)],
    limpiar: [PONER_UN_NODO_CON_BLEND(false), HOJA(ID_DEL_DESTRABE, REGLA_DEL_DESTRABE, false)],
  },
]

async function correr(pagina: Pagina, config: Configuracion, desde: number, hasta: number): Promise<Cuadros> {
  for (const paso of config.preparar) {
    if (paso === '__BLEND_ON__') {
      const r = await medir<BlendPuesto>(pagina, PONER_EL_BLEND(true))
      if (!r.tomo) throw new Error(`${config.id}: el blend no tomó — ${JSON.stringify(r.rebeldes.slice(0, 2))}`)
    } else if (!(await medir<boolean>(pagina, paso))) {
      throw new Error(`${config.id}: un paso de preparación no tomó`)
    }
  }
  await esperarElPrimerCuadro(pagina, 600)
  const lectura = await medir<Cuadros>(pagina, CONTAR(DURACION_MS, desde, hasta))
  for (const paso of config.limpiar) {
    if (paso === '__BLEND_OFF__') await medir<BlendPuesto>(pagina, PONER_EL_BLEND(false))
    else await medir<boolean>(pagina, paso)
  }
  return lectura
}

async function principal(): Promise<void> {
  const repeticiones = Number(argumento('repeticiones', '3'))
  const t0 = Date.now()
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome('blend-fps'),
    ancho: VENTANA.ancho + 40,
    alto: VENTANA.alto + 140,
    limpiarPerfil: false,
    banderasExtra: BANDERAS_SIN_VSYNC,
  })
  const corridas: { readonly config: string; readonly que: string; readonly dpr: number; readonly repeticion: number; readonly lectura: Cuadros; readonly factorDelLienzo: number }[] = []
  try {
    const pagina = await abrirPagina(chrome)
    try {
      for (const fuente of [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO]) {
        await pagina.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: fuente }, pagina.sessionId)
      }
      let dprActual = -1
      for (let r = 0; r < repeticiones; r += 1) {
        for (const config of CONFIGURACIONES) {
          if (config.dpr !== dprActual) {
            await pagina.conexion.enviar(
              'Emulation.setDeviceMetricsOverride',
              { width: VENTANA.ancho, height: VENTANA.alto, deviceScaleFactor: config.dpr, mobile: true, screenWidth: VENTANA.ancho, screenHeight: VENTANA.alto },
              pagina.sessionId,
            )
            await pagina.conexion.enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] }, pagina.sessionId)
            const cargada = new Promise<void>((resolver) => {
              pagina.conexion.al('Page.loadEventFired', () => resolver())
            })
            await pagina.conexion.enviar('Page.navigate', { url: `${ORIGEN}/v3` }, pagina.sessionId)
            await Promise.race([cargada, new Promise((x) => setTimeout(x, 60_000))])
            await esperarElPrimerCuadro(pagina)
            await new Promise((x) => setTimeout(x, ASENTAMIENTO_MS))
            /**
             * ⚠️ **HAY QUE MARCAR LOS BLOQUES ANTES DE PODER PONER EL BLEND.**
             * `PONER_EL_BLEND` apunta a `[data-b8-bloque]`, y esa marca la pone
             * el lector de `scripts-b8/lectores.ts`. Sin esto el blend no
             * encuentra a nadie y la corrida mediría la página sin blend
             * creyendo que lo tiene puesto. Se marca el DOCUMENTO entero —no una
             * sección— porque lo que se mide es costo por cuadro, y el
             * compositor paga por todo lo que hay en el árbol.
             */
            const marcados = await medir<Bloque[]>(pagina, LECTOR_DE_BLOQUES_EN('[document.body]'))
            if (marcados.length === 0) throw new Error('el lector no marcó un solo bloque de texto: el blend no tendría a quién aplicarse')
            console.log(`  (dpr ${config.dpr}: ${marcados.length} bloques de texto marcados)`)
            dprActual = config.dpr
          }
          const estado = await medir<{ readonly visibilityState: string; readonly innerWidth: number; readonly dpr: number; readonly alto: number; readonly canvas: number; readonly cssAncho: number }>(
            pagina,
            `(() => { const c = document.querySelector('canvas'); return { visibilityState: document.visibilityState, innerWidth: innerWidth, dpr: devicePixelRatio, alto: document.documentElement.scrollHeight, canvas: c === null ? 0 : c.width, cssAncho: c === null ? 0 : c.clientWidth } })()`,
          )
          if (estado.visibilityState !== 'visible' || estado.innerWidth !== VENTANA.ancho) {
            throw new Error(`la página no está en condiciones — visibilityState=${estado.visibilityState}, innerWidth=${estado.innerWidth}`)
          }
          if (estado.canvas === 0) throw new Error('no hay canvas: sin escena la comparación no dice nada')
          // El barrido: de la primera pantalla al 80 % del recorrido, donde la escena se ve.
          const maximo = estado.alto - VENTANA.alto
          const lectura = await correr(pagina, config, 0, Math.round(maximo * 0.8))
          const factor = estado.cssAncho === 0 ? 0 : estado.canvas / estado.cssAncho
          corridas.push({ config: config.id, que: config.que, dpr: config.dpr, repeticion: r + 1, lectura, factorDelLienzo: factor })
          console.log(
            `  r${r + 1} ${config.id.padEnd(18)} dpr=${config.dpr} lienzo ×${factor.toFixed(2)} · ${lectura.fps.toFixed(1).padStart(7)} fps · p50 ${lectura.p50Ms.toFixed(2).padStart(6)} ms · p95 ${lectura.p95Ms.toFixed(2).padStart(6)} · p99 ${lectura.p99Ms.toFixed(2).padStart(6)} · peor ${lectura.peorMs.toFixed(1).padStart(6)} · largos ${lectura.largos}`,
          )
        }
      }
    } finally {
      await cerrarPagina(pagina)
    }
  } finally {
    await cerrarChrome(chrome)
    await new Promise((r) => setTimeout(r, 900))
  }

  // ── El veredicto del instrumento, antes de creerle una sola comparación ──
  const mediana = (v: readonly number[]): number => {
    const o = v.slice().sort((a, b) => a - b)
    return o.length === 0 ? Number.NaN : o[Math.floor(o.length / 2)]
  }
  const resumen = CONFIGURACIONES.map((c) => {
    const propias = corridas.filter((x) => x.config === c.id)
    return {
      id: c.id,
      que: c.que,
      dpr: c.dpr,
      corridas: propias.length,
      fpsMediano: dos(mediana(propias.map((x) => x.lectura.fps))),
      p50Mediano: dos(mediana(propias.map((x) => x.lectura.p50Ms))),
      p95Mediano: dos(mediana(propias.map((x) => x.lectura.p95Ms))),
      largosMedianos: mediana(propias.map((x) => x.lectura.largos)),
      factorDelLienzo: dos(mediana(propias.map((x) => x.factorDelLienzo))),
    }
  })

  /**
   * ⚠️ **EL VEREDICTO SE JUZGA SOBRE `fps`, NO SOBRE `p50`.**
   *
   * `performance.now()` viene acotado a 0,1 ms por seguridad, así que con la
   * escena en 0,5–0,7 ms por cuadro el p50 sólo puede tomar seis valores y una
   * diferencia real del 3 % se ve como 0 o como 20 %. `fps` sale de
   * `cuadros / msTotal` sobre 3 segundos y miles de cuadros: ahí la resolución
   * alcanza. El p50 y el p95 se siguen publicando —la forma de la distribución
   * importa— pero no deciden.
   */
  const base = resumen.find((r) => r.id === 'base')
  const destrabado = resumen.find((r) => r.id === 'destrabado')
  const blendDestrabado = resumen.find((r) => r.id === 'blend-destrabado')
  const blendTrabado = resumen.find((r) => r.id === 'blend-trabado')
  const blur8 = resumen.find((r) => r.id === 'blur-8')
  const blur64 = resumen.find((r) => r.id === 'blur-64')
  const dpr1 = resumen.find((r) => r.id === 'dpr-1')
  const desacoplado = base !== undefined && base.fpsMediano > 90
  const masCaro = (r: { readonly fpsMediano: number } | undefined, q: { readonly fpsMediano: number } | undefined, margen: number): boolean =>
    r !== undefined && q !== undefined && r.fpsMediano < q.fpsMediano * (1 - margen)
  const controlGraduado = masCaro(blur8, base, 0.03) && masCaro(blur64, blur8, 0.03)

  /**
   * ⚠️ **LA SEGUNDA VARA, Y POR QUÉ HACE FALTA.**
   *
   * El control graduado de desenfoque contesta «¿este instrumento ve el relleno
   * de GPU?». Si contesta NO, no se sigue que el instrumento no sirva para
   * NADA: se sigue que no sirve para esa pregunta. La vara que decide si sirve
   * para ESTA comparación es otra: **¿la diferencia que mide es más grande que
   * su propio ruido?** El ruido se estima con la dispersión de las filas que NO
   * llevan blend —todas miden la misma página— y la diferencia es la del blend.
   * Si la separación es varias veces el ruido, la comparación vale aunque el
   * control de GPU falle.
   */
  const sinBlend = resumen.filter((r) => !r.id.includes('blend') && r.id !== 'dpr-1')
  const fpsSinBlend = sinBlend.map((r) => r.fpsMediano)
  const ruidoPct =
    fpsSinBlend.length < 2 || base === undefined
      ? Number.NaN
      : ((Math.max(...fpsSinBlend) - Math.min(...fpsSinBlend)) / base.fpsMediano) * 100
  const separacionPct =
    base === undefined || blendDestrabado === undefined
      ? Number.NaN
      : ((base.fpsMediano - blendDestrabado.fpsMediano) / base.fpsMediano) * 100
  const separaContraElRuido = !Number.isNaN(ruidoPct) && !Number.isNaN(separacionPct) && separacionPct > ruidoPct * 5
  const valido = desacoplado && separaContraElRuido

  console.log('\n══ ¿EL INSTRUMENTO DISCRIMINA? ══')
  console.log(`  1. rAF desacoplado del refresco (base > 90 fps): ${desacoplado ? 'SÍ' : 'NO'} — base ${base?.fpsMediano ?? '—'} fps contra los 74,9 de MOVIL-1`)
  console.log(
    `  2. control graduado de RELLENO DE GPU (base > blur-8 > blur-64 en fps, 3 % de margen): ${controlGraduado ? 'SÍ' : 'NO'} — ${base?.fpsMediano ?? '—'} → ${blur8?.fpsMediano ?? '—'} → ${blur64?.fpsMediano ?? '—'} fps`,
  )
  console.log(
    `  3. separación contra su propio ruido (la del blend > 5× la dispersión de las filas sin blend): ${separaContraElRuido ? 'SÍ' : 'NO'} — separación ${separacionPct.toFixed(1)} % contra ruido ${ruidoPct.toFixed(1)} %`,
  )
  console.log(`  (recibo: dpr-1 da lienzo ×${dpr1?.factorDelLienzo ?? '—'} igual que dpr-3 — el producto clava dpr [1,1] a 390, así que no es un control)`)
  console.log(
    `  ⇒ ${
      valido
        ? `SIRVE PARA ESTA COMPARACIÓN y NO para relleno de GPU: mide ritmo del HILO PRINCIPAL. El costo del blend de abajo vale; una pregunta de relleno de GPU necesita otro instrumento.`
        : 'NO PASA NINGUNA DE SUS DOS VARAS: las comparaciones de abajo se publican como no concluyentes'
    }`,
  )

  console.log('\n══ RESUMEN (mediana de las repeticiones) ══')
  console.log('  configuración       dpr  lienzo    fps     ms/cuadro  p50 ms  p95 ms  largos   contra base (fps)')
  for (const r of resumen) {
    const delta = base === undefined || r.id === 'base' ? '' : `${r.fpsMediano < base.fpsMediano ? '' : '+'}${(((r.fpsMediano - base.fpsMediano) / base.fpsMediano) * 100).toFixed(1)} %`
    console.log(
      `  ${r.id.padEnd(18)} ${String(r.dpr).padStart(3)}  ×${r.factorDelLienzo.toFixed(2)}  ${r.fpsMediano.toFixed(1).padStart(7)}  ${(1000 / r.fpsMediano).toFixed(3).padStart(9)}  ${r.p50Mediano.toFixed(2).padStart(6)}  ${r.p95Mediano.toFixed(2).padStart(6)} ${String(r.largosMedianos).padStart(7)}   ${delta}`,
    )
  }

  const costoDelBlend =
    destrabado === undefined || blendDestrabado === undefined
      ? null
      : {
          fpsSinBlend: destrabado.fpsMediano,
          fpsConBlend: blendDestrabado.fpsMediano,
          msPorCuadroSinBlend: dos(1000 / destrabado.fpsMediano),
          msPorCuadroConBlend: dos(1000 / blendDestrabado.fpsMediano),
          deltaMs: Number((1000 / blendDestrabado.fpsMediano - 1000 / destrabado.fpsMediano).toFixed(3)),
          caidaDeFpsPct: dos(((destrabado.fpsMediano - blendDestrabado.fpsMediano) / destrabado.fpsMediano) * 100),
        }
  console.log('\n══ (b) EL COSTO DEL BLEND SOBRE UN CANVAS VIVO ══')
  if (costoDelBlend === null) console.log('  no se pudo medir')
  else {
    console.log(`  destrabado SIN blend: ${costoDelBlend.fpsSinBlend} fps = ${costoDelBlend.msPorCuadroSinBlend} ms por cuadro`)
    console.log(`  destrabado CON blend: ${costoDelBlend.fpsConBlend} fps = ${costoDelBlend.msPorCuadroConBlend} ms por cuadro`)
    console.log(`  ⇒ el blend contra el canvas vivo cuesta ${costoDelBlend.deltaMs} ms por cuadro — una caída del ${costoDelBlend.caidaDeFpsPct} % del ritmo`)
    if (blendTrabado !== undefined && base !== undefined) {
      console.log(
        `  (y con la cadena CORTADA, que es el blend que hoy se podría poner: ${blendTrabado.fpsMediano} contra ${base.fpsMediano} fps de base = ${dos(((base.fpsMediano - blendTrabado.fpsMediano) / base.fpsMediano) * 100)} % — no es el costo de la pregunta, es el de mezclar contra un grupo estático)`,
      )
    }
  }

  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const ruta = path.join(RAIZ_DE_SALIDAS, 'e-fps.json')
  writeFileSync(
    ruta,
    `${JSON.stringify(
      {
        cuando: new Date().toISOString(),
        ventana: VENTANA,
        banderas: BANDERAS_SIN_VSYNC,
        duracionMs: DURACION_MS,
        repeticiones,
        instrumento: { desacoplado, controlGraduadoDeRellenoDeGpu: controlGraduado, ruidoPct: dos(ruidoPct), separacionPct: dos(separacionPct), separaContraElRuido, valido, queMide: 'ritmo del hilo principal con el vsync apagado; ciego al relleno de GPU (el control graduado de desenfoque da 0 %)' },
        resumen,
        costoDelBlend,
        corridas,
      },
      null,
      2,
    )}\n`,
    'utf8',
  )
  console.log(`\n  ${ruta} · ${((Date.now() - t0) / 1000).toFixed(0)} s`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
