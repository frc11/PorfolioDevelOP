/**
 * EL CTA QUE NO TERMINA DE CRECER — el diagnóstico, medido ANTES de arreglar.
 *
 *     npx tsx scripts-b4/s9-cta.ts
 *
 * La primera corrida fue ANTES de la reescritura —el servidor de desarrollo
 * recarga en caliente, así que después ya no se podía ver el defecto— y quedó en
 * `s9-cta.log`: 46,2 px, 3 de 25 letras. Las siguientes miden el arreglo.
 *
 * Dos preguntas, y son las dos hipótesis que había que separar:
 *
 *   A · **¿la LEY lo deja chico?** Se lo deja POSAR —el tiempo de asentamiento
 *       declarado, con margen— en varios puntos del final del túnel y de la
 *       espera. Si posado sigue chico, no es el ritmo del dedo ni el recorrido:
 *       es la curva.
 *   B · **¿se le ACABA el recorrido?** Es la pista de la referencia —a ella le
 *       sobran ~809 px de pin después de que su CTA termina—. Se baja con rueda a
 *       ritmo de lectura y se anota cuánto mide el CTA en el cuadro en que la
 *       salida empieza a llevárselo. Si ahí mide menos que posado, el recorrido
 *       también le come.
 */

import { writeFileSync } from 'node:fs'

import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const URL_BASE = 'http://localhost:3000'
const PERFIL = perfilPorId('1440')
const SALIDA = `C:/Users/Valentino/.cache/b4-medicion/s9-cta${process.argv.includes('--antes') ? '' : '-despues'}.json`

type Pagina = Awaited<ReturnType<typeof abrirPagina>>

/**
 * Los puntos del recorrido, en px desde el tope de la sección. Derivados a mano
 * de `geometria.ts` con el alto de 7,57 pantallas —y por eso el banco además MIDE
 * dónde empieza la salida, en vez de creerle a esta cuenta—:
 *
 *   túnel     arranca en  +950  (el cartel empieza a huir: 9,5 scrolls de sección)
 *             termina en  +2430 (950 + PX_DEL_TUNEL = 950 + 1480, el tope del CTA)
 *   salida    arranca en  +2982 (6813 − 1131 − 1800, menos el viewport de la aproximación)
 *
 * (Con la espera de 1.839 px la salida arrancaba en +4269; los puntos cambiaron con ella.)
 */
const PUNTOS_POSADOS = [2200, 2430, 2600, 2800, 2950] as const
const ASENTAMIENTO_DECLARADO_MS = 5000
const MARGEN_MS = 1200

interface Lectura {
  readonly y: number
  /** La escala que el lazo escribió en la ventana del CTA. */
  readonly escala: number
  /** Su ancho en pantalla, con todas las transformadas, y el del cuadro. */
  readonly anchoEnPantalla: number
  readonly anchoDelCuadro: number
  /** Su ancho de LAYOUT, sin transformadas: lo que la caja mide antes de escalar. */
  readonly anchoDeLayout: number
  /** Cuántas letras de la frase se descubrieron, y de cuántas. */
  readonly letras: number
  readonly letrasTotales: number
  readonly velo: number
  /** La traslación de la capa: distinta de cero = la salida empezó. */
  readonly salida: number
}

const SONDA = `(() => {
  const v = document.querySelector('[data-pieza="ventana-del-cta"]')
  const capa = document.querySelector('[data-pieza="tunel"]')
  const velo = document.querySelector('[data-pieza="velo-del-cta"]')
  if (v === null || capa === null) return null
  // La escala de la tabla vive en la capa del CTA; antes de la reescritura, en la ventana.
  const conEscala = v.closest('[data-capa="cta"]') || v
  const m = /scale\\(([-0-9.eE+]+)\\)/.exec(conEscala.style.transform || '')
  const t = /translateY\\(([-0-9.eE+]+)px\\)/.exec(capa.style.transform || '')
  let letras = 0
  let total = 0
  for (const el of document.querySelectorAll('[data-palabra]')) {
    const largo = (el.getAttribute('data-palabra') || '').length
    const c = /inset\\(0(?:px)? ([0-9.]+)%/.exec(el.style.clipPath || '')
    const oculto = c === null ? 100 : Number(c[1])
    letras += largo * (1 - oculto / 100)
    total += largo
  }
  return {
    y: window.scrollY,
    escala: m === null ? -1 : Number(m[1]),
    anchoEnPantalla: v.getBoundingClientRect().width,
    anchoDelCuadro: window.innerWidth,
    anchoDeLayout: v.offsetWidth,
    letras,
    letrasTotales: total,
    velo: velo === null ? -1 : Number(getComputedStyle(velo).opacity),
    salida: t === null ? 0 : Number(t[1]),
  }
})()`

async function posarYLeer(p: Pagina, y: number): Promise<Lectura | null> {
  await medir<number>(
    p,
    `(async () => {
      const hasta = performance.now() + ${String(ASENTAMIENTO_DECLARADO_MS + MARGEN_MS)}
      while (performance.now() < hasta) {
        window.scrollTo(0, ${String(y)})
        await new Promise((r) => setTimeout(r, 40))
      }
      return window.scrollY
    })()`,
  )
  return medir<Lectura | null>(p, SONDA)
}

async function unaMuesca(p: Pagina): Promise<void> {
  await p.conexion.enviar(
    'Input.dispatchMouseEvent',
    { type: 'mouseWheel', x: 700, y: 450, deltaX: 0, deltaY: 100, modifiers: 0, pointerType: 'mouse' },
    p.sessionId,
  )
}

function fila(l: Lectura): string {
  const pct = (v: number): string => `${(v * 100).toFixed(2).padStart(6)} %`
  return `y=${String(Math.round(l.y)).padStart(6)}  escala ${l.escala.toFixed(5)}  en pantalla ${l.anchoEnPantalla.toFixed(1).padStart(7)} px = ${pct(l.anchoEnPantalla / l.anchoDelCuadro)} del cuadro  (layout ${l.anchoDeLayout} px)  letras ${l.letras.toFixed(1)}/${l.letrasTotales}  velo ${l.velo.toFixed(3)}  salida ${l.salida.toFixed(1)}`
}

async function principal(): Promise<void> {
  const chrome = await lanzarChrome({
    perfil: 'C:/Users/Valentino/.cache/b4-medicion/s9-cta',
    ancho: PERFIL.ancho,
    alto: PERFIL.alto + 120,
  })
  const salida: { posadas: Lectura[]; aRitmo: Lectura[]; alEmpezarLaSalida: Lectura | null; topDeTrabajos: number } = {
    posadas: [],
    aRitmo: [],
    alEmpezarLaSalida: null,
    topDeTrabajos: 0,
  }
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, `${URL_BASE}/v3`)
    await verificarLaPagina(p, PERFIL)

    const trabajos = (await paneles(p)).find((s) => s.id === 'trabajos')
    if (trabajos === undefined) throw new Error('falta trabajos')
    salida.topDeTrabajos = trabajos.top
    console.log(`\ntrabajos top ${trabajos.top.toFixed(0)}\n\nA · POSADO (${ASENTAMIENTO_DECLARADO_MS + MARGEN_MS} ms en cada punto)`)

    for (const d of PUNTOS_POSADOS) {
      const l = await posarYLeer(p, trabajos.top + d)
      if (l === null) throw new Error('no encontré la ventana del CTA')
      salida.posadas.push(l)
      console.log(`  +${String(d).padStart(4)}  ${fila(l)}`)
    }

    // ⚠️ Lo que decide si la espera alcanza no es un tamaño sino un TIEMPO: cuánto
    // queda la frase entera a la vista antes de que la salida se la lleve, a dos
    // ritmos de rueda —el de alguien que lee y el de alguien que pasa—.
    for (const cadaMs of [300, 150]) {
      console.log(`\nB · A RITMO (una muesca cada ${String(cadaMs)} ms, sin posar)`)
      await posarYLeer(p, trabajos.top + 650)
      salida.aRitmo = []
      salida.alEmpezarLaSalida = null
      let fraseEntera: { t: number; y: number } | null = null
      for (let k = 0; k < 60 && salida.alEmpezarLaSalida === null; k += 1) {
        await unaMuesca(p)
        await medir<number>(p, `new Promise((r) => setTimeout(() => r(1), ${String(cadaMs)}))`)
        const l = await medir<Lectura | null>(p, SONDA)
        if (l === null) continue
        salida.aRitmo.push(l)
        if (fraseEntera === null && l.letras >= l.letrasTotales - 0.01) {
          fraseEntera = { t: Date.now(), y: l.y }
          console.log(`  la frase queda entera en ${fila(l)}`)
        }
        if (salida.alEmpezarLaSalida === null && l.salida < -0.5) {
          salida.alEmpezarLaSalida = l
          console.log(`  la salida empieza a llevárselo en ${fila(l)}`)
          if (fraseEntera !== null) {
            console.log(`  → la frase entera se vio ${String(Date.now() - fraseEntera.t)} ms y ${String(Math.round(l.y - fraseEntera.y))} px de scroll antes de irse`)
          }
        }
      }
      const maximo = salida.aRitmo.reduce((m, l) => Math.max(m, l.anchoEnPantalla), 0)
      console.log(`  máximo en pantalla a ritmo: ${maximo.toFixed(1)} px`)
    }

    writeFileSync(SALIDA, JSON.stringify(salida, null, 1))
    console.log(`\ncrudo en ${SALIDA}`)
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
