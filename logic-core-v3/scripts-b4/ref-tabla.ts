/**
 * LA TABLA CRUDA — una fila por capa y por muesca de rueda. La MISMA sonda para
 * heatbureau.com y para nuestra página.
 *
 *     npx tsx scripts-b4/ref-tabla.ts              ← la referencia
 *     npx tsx scripts-b4/ref-tabla.ts --nuestra    ← nuestro túnel, en localhost:3000
 *
 * Esto NO deriva ninguna ley. Maneja la página con muescas de rueda sintéticas
 * de tamaño fijo y, en cada parada, anota la caja en pantalla de TODAS las capas
 * de imagen que existan — las que se ven, las que todavía son un punto y las que
 * ya se fueron del cuadro. Sale un JSON y un TSV sin promediar ni ajustar.
 *
 * ── LO QUE EL RECONOCIMIENTO ENCONTRÓ, Y POR QUÉ CAMBIA EL INSTRUMENTO ────
 *
 * Las capas no son hermanas apiladas: están ANIDADAS una dentro de otra, cada
 * una con su propia `scale()`. El tamaño en pantalla de la capa N es el producto
 * de las escalas de sus N ancestros. Por eso no alcanza con leer una escala: hay
 * que leer la CAJA, que es lo único que ya trae el producto adentro.
 *
 * ── ⚠️ IDENTIDAD POR ELEMENTO, NO POR TAMAÑO NI POR ORDEN ────────────────
 *
 * «En qué paso nace cada capa y en qué paso deja de existir» sólo se puede
 * contestar si la capa k de un paso es la MISMA que la capa k del siguiente.
 * Ordenarlas por tamaño no sirve: cuando una nace, todas se corren un lugar y la
 * tabla mostraría capas teletransportándose. Así que la primera vez que se ve un
 * elemento se le pone un número, guardado en un WeakMap del mundo de la página
 * —que sobrevive entre llamadas— y ese número es su identidad para siempre.
 *
 * ── ⚠️ HAY QUE DEJARLA POSAR, Y CON TOLERANCIA RELATIVA ──────────────────
 *
 * El reconocimiento leyó 1,17224 y 1,3 en el mismo `y` en dos corridas: el valor
 * dibujado persigue al objetivo. Se espera a que las escalas dejen de cambiar
 * con tolerancia RELATIVA: sobre una escala que arranca en 1e-3 una tolerancia
 * absoluta se cumple de entrada y se mide el transitorio creyendo medir el reposo.
 *
 * ── ⚠️ LO ÚNICO QUE CAMBIA SOBRE NUESTRA PÁGINA, Y POR QUÉ ────────────────
 *
 *   · **el censo se acota al túnel.** Nuestra página tiene otras cosas escaladas
 *     y la referencia no; sin acotarlo, el reposo esperaría a otra sección.
 *   · **nuestro CTA no tiene imagen.** El de ella es un `<a>` con un `<img>`
 *     adentro y la regla «imagen con un ancestro escalado» lo ve; el nuestro es
 *     una ventana de texto. Se lo censa por su caja, con la misma regla aplicada
 *     a sus ancestros.
 *   · **cada fila lleva su `y` en la regla de ELLA.** Nuestro túnel arranca en
 *     `top + 950` —donde el cartel empieza a huir— y ahí cae su scroll 810
 *     (`ORIGEN_DEL_TUNEL`), así que `yRef = scrollY − (top + 950) + 810`. Con eso
 *     las dos tablas se superponen muesca por muesca.
 *   · **y antes del túnel se comprueba que no se vea nada.** El cartel llega y se
 *     va por encima del túnel; una capa que pintara ahí lo taparía y la medición
 *     del cartel seguiría en verde.
 */

import { writeFileSync } from 'node:fs'

import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const NUESTRA = process.argv.includes('--nuestra')
const SITIO = NUESTRA ? 'http://localhost:3000/v3' : 'https://www.heatbureau.com/'
const PERFIL = perfilPorId('1440')
const SALIDA = NUESTRA
  ? 'C:/Users/Valentino/.cache/b4-medicion/ref-tabla-nuestra'
  : 'C:/Users/Valentino/.cache/b4-medicion/ref-tabla'

/** Lo que entrega una muesca de rueda. Misma unidad que usa el sprint. */
const PX_POR_MUESCA = 100
/** Tope de pasos: el documento medido son 3.460 px de scroll, 34,6 muescas. */
const PASOS_MAXIMOS = 44

/** Nuestro túnel en px de documento desde el tope de la sección, y el scroll de ella que le toca. */
const ARRANQUE_DEL_TUNEL_DESDE_EL_TOPE = 950
const ORIGEN_DEL_TUNEL_EN_SU_REGLA = 810
/** De dónde a dónde se barre nuestra página, en la regla de ella. */
const Y_REF_INICIAL = 200
const Y_REF_FINAL = 2400

type Pagina = Awaited<ReturnType<typeof abrirPagina>>

interface Capa {
  /** Identidad estable del elemento, puesta la primera vez que se lo ve. */
  readonly id: number
  /** Nuestra página marca sus capas; la referencia no, y ahí vale null. */
  readonly rol: string | null
  readonly src: string
  readonly alt: string
  readonly ancho: number
  readonly alto: number
  readonly x: number
  readonly y: number
  /** Cuántos ancestros con `scale()` tiene: su lugar en la matrioska. */
  readonly profundidad: number
  /** El producto de las escalas de sus ancestros, leído del DOM. */
  readonly escalaAcumulada: number
  /** La escala propia del envoltorio inmediato de esta imagen. */
  readonly escalaPropia: number
  readonly clase: string
}

interface Paso {
  readonly paso: number
  readonly scrollY: number
  /** El `y` de esta fila en la regla de la referencia. En la referencia, su scrollY. */
  readonly yRef: number
  readonly msDePosado: number
  readonly anchoDelCuadro: number
  /** Sólo en nuestra página: la escala del escenario, leída de su elemento. */
  readonly escenarioPropio?: number
  readonly capas: Capa[]
}

/**
 * Censa las capas. Un `img` cuenta como capa si tiene al menos un ancestro con
 * una escala distinta de 1: eso deja afuera al logo y al fondo del hero, que son
 * imágenes de la página y no del efecto, sin nombrar ninguna clase de Framer
 * (que son hashes del build y cambian cuando el sitio se vuelve a publicar).
 */
function censo(raiz: string | null, extra: string | null): string {
  return `(() => {
  const w = window
  if (w.__capas === undefined) w.__capas = { siguiente: 0, mapa: new WeakMap() }
  const reg = w.__capas
  const base = ${raiz === null ? 'document' : `document.querySelector(${JSON.stringify(raiz)})`}
  if (base === null) return { scrollY: w.scrollY, anchoDelCuadro: document.documentElement.clientWidth, capas: [] }
  const escalaDe = (el) => {
    const t = getComputedStyle(el).transform
    if (t === 'none' || t === undefined) return 1
    const m = /matrix\\(([-0-9.e]+)/.exec(t)
    return m === null ? 1 : Number(m[1])
  }
  const elementos = [...base.querySelectorAll('img')]
  ${extra === null ? '' : `for (const el of base.querySelectorAll(${JSON.stringify(extra)})) elementos.push(el)`}
  const capas = []
  for (const el of elementos) {
    let n = el.parentElement
    let producto = 1
    let profundidad = 0
    let propia = 1
    let clase = ''
    while (n !== null && n !== document.body) {
      const s = escalaDe(n)
      if (s !== 1) {
        producto *= s
        profundidad += 1
        if (profundidad === 1) {
          propia = s
          clase = (n.className || '').toString().slice(0, 40)
        }
      }
      n = n.parentElement
    }
    if (profundidad === 0) continue
    if (reg.mapa.has(el) === false) {
      reg.mapa.set(el, reg.siguiente)
      reg.siguiente += 1
    }
    const r = el.getBoundingClientRect()
    const dueño = el.closest('[data-capa]')
    capas.push({
      id: reg.mapa.get(el),
      rol: dueño === null ? null : dueño.getAttribute('data-capa'),
      src: (el.getAttribute('src') || '').slice(-46),
      alt: (el.getAttribute('alt') || el.getAttribute('data-pieza') || '').slice(0, 44),
      ancho: Number(r.width.toFixed(2)),
      alto: Number(r.height.toFixed(2)),
      x: Number(r.left.toFixed(1)),
      y: Number(r.top.toFixed(1)),
      profundidad,
      escalaAcumulada: Number(producto.toPrecision(8)),
      escalaPropia: Number(propia.toPrecision(8)),
      clase,
    })
  }
  return { scrollY: w.scrollY, anchoDelCuadro: document.documentElement.clientWidth, capas }
})()`
}

/** La firma del cuadro: si esto no cambia, la persecución se posó. */
function firma(raiz: string | null): string {
  return `(() => {
  const base = ${raiz === null ? 'document' : `document.querySelector(${JSON.stringify(raiz)})`}
  if (base === null) return []
  const escalas = []
  for (const el of base.querySelectorAll('*')) {
    const t = getComputedStyle(el).transform
    if (t === 'none') continue
    const m = /matrix\\(([-0-9.e]+)/.exec(t)
    if (m !== null && Number(m[1]) !== 1) escalas.push(Number(m[1]))
  }
  return escalas
})()`
}

/** La escala de nuestro escenario, leída de su elemento. */
const ESCENARIO = `(() => {
  const e = document.querySelector('[data-capa="escenario"]')
  const m = e === null ? null : /matrix\\(([-0-9.e]+)/.exec(getComputedStyle(e).transform)
  return m === null ? Number.NaN : Number(m[1])
})()`

const RAIZ = NUESTRA ? '[data-pieza="tunel"]' : null
const CENSO = censo(RAIZ, NUESTRA ? '[data-pieza="ventana-del-cta"]' : null)
const FIRMA = firma(RAIZ)

const MS_ENTRE_LECTURAS = 250
const MS_MAXIMOS_DE_POSADO = 9000
/** Relativa, no absoluta: ver el docblock de arriba. */
const TOLERANCIA_RELATIVA = 1e-4

async function posar(p: Pagina): Promise<number> {
  const arranque = Date.now()
  let previa = await medir<number[]>(p, FIRMA)
  while (Date.now() - arranque < MS_MAXIMOS_DE_POSADO) {
    await medir<number>(p, `new Promise((r) => setTimeout(() => r(1), ${String(MS_ENTRE_LECTURAS)}))`)
    const actual = await medir<number[]>(p, FIRMA)
    const quieta =
      actual.length === previa.length &&
      actual.every((v, i) => Math.abs(v - (previa[i] ?? 0)) <= TOLERANCIA_RELATIVA * Math.max(1e-9, Math.abs(v)))
    previa = actual
    if (quieta) break
  }
  return Date.now() - arranque
}

/** Deja la página en `y` re-pidiendo la posición: el scroll suave se iría solo. */
async function sostenerEn(p: Pagina, y: number): Promise<void> {
  await medir<number>(
    p,
    `(async () => {
      const hasta = performance.now() + 1500
      while (performance.now() < hasta) {
        window.scrollTo(0, ${String(y)})
        await new Promise((r) => setTimeout(r, 40))
      }
      return window.scrollY
    })()`,
  )
}

/** Una muesca de rueda de verdad, no un `scrollTo`: el sitio la maneja él. */
async function unaMuesca(p: Pagina): Promise<void> {
  await p.conexion.enviar(
    'Input.dispatchMouseEvent',
    {
      type: 'mouseWheel',
      x: Math.round(PERFIL.ancho / 2),
      y: Math.round(PERFIL.alto / 2),
      deltaX: 0,
      deltaY: PX_POR_MUESCA,
      modifiers: 0,
      pointerType: 'mouse',
    },
    p.sessionId,
  )
}

function aTsv(pasos: readonly Paso[]): string {
  const filas = ['paso\tscrollY\tyRef\tcapa\trol\tprofundidad\tancho\talto\tx\ty\tescalaAcumulada\tescalaPropia\talt']
  for (const s of pasos) {
    for (const c of s.capas) {
      filas.push(
        [
          s.paso,
          s.scrollY,
          s.yRef,
          c.id,
          c.rol ?? '',
          c.profundidad,
          c.ancho,
          c.alto,
          c.x,
          c.y,
          c.escalaAcumulada,
          c.escalaPropia,
          c.alt,
        ].join('\t'),
      )
    }
  }
  return `${filas.join('\n')}\n`
}

async function principal(): Promise<void> {
  const chrome = await lanzarChrome({
    perfil: `C:/Users/Valentino/.cache/b4-medicion/${NUESTRA ? 'ref-chrome-nuestra' : 'ref-chrome'}`,
    ancho: PERFIL.ancho,
    alto: PERFIL.alto + 120,
  })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    if (NUESTRA) {
      await irA(p, SITIO)
      await verificarLaPagina(p, PERFIL)
    } else {
      await irA(p, SITIO, { marcaDeIntro: false })
      await medir<number>(p, 'new Promise((r) => setTimeout(() => r(1), 7000))')
    }

    // ⚠️ Con la pestaña oculta el navegador no despacha scroll ni corre rAF y
    // toda medición de layout da cero. Se comprueba ANTES de la primera fila.
    const estado = await medir<{ visible: string; ancho: number }>(
      p,
      '({ visible: document.visibilityState, ancho: window.innerWidth })',
    )
    if (estado.visible !== 'visible' || estado.ancho <= 0) {
      throw new Error(`pestaña no medible: ${estado.visible} ${String(estado.ancho)}`)
    }

    const pasos: Paso[] = []
    const antesDelTunel: { scrollY: number; mayorAncho: number; cuantas: number }[] = []
    let arranqueDelTunel = 0
    if (NUESTRA) {
      const trabajos = (await paneles(p)).find((s) => s.id === 'trabajos')
      if (trabajos === undefined) throw new Error('falta trabajos')
      arranqueDelTunel = trabajos.top + ARRANQUE_DEL_TUNEL_DESDE_EL_TOPE
      const aRef = (scrollY: number): number => scrollY - arranqueDelTunel + ORIGEN_DEL_TUNEL_EN_SU_REGLA

      // Antes del túnel —la aproximación, la llegada del cartel y su huida— no
      // se puede ver una sola capa.
      for (let y = trabajos.top - 900; y < arranqueDelTunel; y += 150) {
        await sostenerEn(p, y)
        await posar(p)
        const l = await medir<{ scrollY: number; capas: Capa[] }>(p, CENSO)
        const mayor = l.capas.reduce((m, c) => Math.max(m, c.ancho), 0)
        // Cuántas se censaron, además del máximo: un 0 con cero capas censadas es
        // un túnel que no está, no un túnel que no pinta.
        antesDelTunel.push({ scrollY: l.scrollY, mayorAncho: mayor, cuantas: l.capas.length })
        console.log(`antes del túnel  y=${String(l.scrollY).padStart(6)}  ${String(l.capas.length)} capas censadas, la más ancha: ${mayor.toFixed(2)} px`)
      }

      const inicial = arranqueDelTunel - ORIGEN_DEL_TUNEL_EN_SU_REGLA + Y_REF_INICIAL
      await sostenerEn(p, inicial)
      const pasosQueHacen = Math.round((Y_REF_FINAL - Y_REF_INICIAL) / PX_POR_MUESCA)
      for (let paso = 0; paso <= pasosQueHacen; paso += 1) {
        if (paso > 0) await unaMuesca(p)
        const ms = await posar(p)
        const l = await medir<{ scrollY: number; anchoDelCuadro: number; capas: Capa[] }>(p, CENSO)
        // El escenario no tiene caja propia: se lee de su elemento. En ella sale de
        // su #0, que nunca vale 0; acá del primer proyecto no se puede antes de 810.
        const escenarioPropio = await medir<number>(p, ESCENARIO)
        pasos.push({ paso, scrollY: l.scrollY, yRef: aRef(l.scrollY), msDePosado: ms, anchoDelCuadro: l.anchoDelCuadro, escenarioPropio, capas: l.capas })
        const cajas = l.capas.map((c) => `${c.rol ?? `#${String(c.id)}`}:${c.ancho.toFixed(0)}`).join(' ')
        console.log(`paso ${String(paso).padStart(3)}  y=${String(l.scrollY).padStart(6)}  yRef=${String(aRef(l.scrollY)).padStart(5)}  ${cajas}`)
      }
    } else {
      await medir<number>(p, 'window.scrollTo(0, 0), 1')
      await posar(p)
      let anterior = -1
      for (let paso = 0; paso <= PASOS_MAXIMOS; paso += 1) {
        if (paso > 0) await unaMuesca(p)
        const ms = await posar(p)
        const l = await medir<{ scrollY: number; anchoDelCuadro: number; capas: Capa[] }>(p, CENSO)
        pasos.push({ paso, scrollY: l.scrollY, yRef: l.scrollY, msDePosado: ms, anchoDelCuadro: l.anchoDelCuadro, capas: l.capas })
        const cajas = l.capas.map((c) => `#${String(c.id)}:${c.ancho.toFixed(0)}x${c.alto.toFixed(0)}`).join(' ')
        console.log(
          `paso ${String(paso).padStart(3)}  y=${String(l.scrollY).padStart(5)}  ${String(l.capas.length).padStart(2)} capas  ${cajas}`,
        )
        if (l.scrollY === anterior && paso > 2) {
          console.log('  (el documento no avanza más: se llegó al final)')
          break
        }
        anterior = l.scrollY
      }
    }

    const volcado = NUESTRA ? { arranqueDelTunel, origen: ORIGEN_DEL_TUNEL_EN_SU_REGLA, antesDelTunel, pasos } : pasos
    writeFileSync(`${SALIDA}-crudo.json`, JSON.stringify(volcado, null, 1))
    writeFileSync(`${SALIDA}-crudo.tsv`, aTsv(pasos))
    console.log(`\ncrudo en ${SALIDA}-crudo.json y ${SALIDA}-crudo.tsv`)

    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

principal().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(`\nSE CORTO: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
