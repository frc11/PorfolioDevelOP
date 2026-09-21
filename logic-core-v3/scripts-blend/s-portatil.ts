/**
 * S — PORTÁTIL (1024) DEL LADO DE ESCRITORIO.
 *
 *     npx tsx scripts-blend/s-portatil.ts
 *
 * El corte de composición bajó de 1025 a 1024 y la coreografía se quedó en 1025,
 * así que hay una franja de UN píxel donde la página se compone como escritorio
 * y monta como abajo del umbral. Este banco mide las dos cosas que el pedido
 * nombra —el ≠ en el margen del texto y los tres rótulos en la calle derecha— y
 * el borde, que es lo que prueba que el corte cayó donde se lo mandó:
 *
 *     1023 → composición de abajo   ·   1024 y 1440 → composición de escritorio
 *
 * ⚠️ **Y mide que el logo NO se haya movido**, que es la condición que el sprint
 * puso por escrito. La posición del logo sale de la cámara, no del CSS, así que
 * se lee la cámara de verdad: se instala `window.__THREE_DEVTOOLS__` antes de que
 * cargue la página, three despacha su `WebGLRenderer` ahí y se envuelve su
 * `render(scene, camera)`. Si la pose a 1024 es la misma que a 1023 y que a 1440,
 * el logo está donde estaba.
 */

import { mkdirSync } from 'node:fs'

import { capturar } from '../scripts-b4/captura'
import { medir } from '../scripts-b4/navegador'
import { conChrome, enLaVentana, type Ventana } from '../scripts-tapado/tapado-comun'

const SALIDA = 'docs/rediseno/outputs/portatil'

function esperar(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

const INSTALAR_EL_ESPÍA = `(() => {
  if (window.__THREE_DEVTOOLS__ !== undefined) return
  const et = new EventTarget()
  window.__camara = null
  et.addEventListener('observe', (e) => {
    const o = e.detail
    if (o !== null && typeof o === 'object' && typeof o.render === 'function' && o.domElement !== undefined) {
      const orig = o.render.bind(o)
      o.render = function (escena, camara) {
        window.__camara = camara
        return orig(escena, camara)
      }
    }
  })
  window.__THREE_DEVTOOLS__ = et
})()`

const LECTURA = `(() => {
  const panel = document.querySelector('[data-panel="quienes-somos"]')
  if (panel === null) return null
  const caja = (el) => {
    if (el === null) return null
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) }
  }
  const signo = panel.querySelector('[data-signo="distinto"]')
  const agencia = panel.querySelector('[data-composicion="agencia"]')
  // El titular visible: el primero de los repartos que PINTA.
  const repartos = [...panel.querySelectorAll('[data-composicion="agencia"] div[aria-hidden="true"]')]
  const titular = repartos.find((d) => d.getClientRects().length > 0) ?? null
  const h3 = [...panel.querySelectorAll('h3')].filter((e) => e.getClientRects().length > 0)
  const h4 = [...panel.querySelectorAll('h4')].filter((e) => e.getClientRects().length > 0)
  // La grilla de la calle lateral: la que tiene DOS pistas.
  const grillas = [...panel.querySelectorAll('div')]
    .map((d) => [d, getComputedStyle(d).gridTemplateColumns])
    .filter(([, g]) => typeof g === 'string' && g !== 'none' && g.split(' ').length === 2)
  const bajada = panel.querySelector('p')
  const escena = document.querySelector('[data-escena]')
  return {
    signo: caja(signo),
    signoMargen: signo === null ? null : getComputedStyle(signo).marginInlineStart,
    titular: caja(titular),
    agencia: caja(agencia),
    rotulos: h3.map((e) => ({ texto: (e.textContent ?? '').trim().slice(0, 12), ...caja(e) })),
    nombres: h4.map((e) => ({ texto: (e.textContent ?? '').trim().slice(0, 12), ...caja(e) })),
    grillaLateral: grillas.length === 0 ? null : grillas[0][1],
    mezclaDeLaBajada: bajada === null ? null : getComputedStyle(bajada).mixBlendMode,
    zDeLaEscena: escena === null ? null : getComputedStyle(escena).zIndex,
    ventana: window.innerWidth,
  }
})()`

const POSE = `(() => {
  const c = window.__camara
  if (c === null || c === undefined) return null
  return { x: Number(c.position.x.toFixed(3)), y: Number(c.position.y.toFixed(3)), z: Number(c.position.z.toFixed(3)) }
})()`

interface Caja {
  readonly x: number
  readonly y: number
  readonly w: number
}
interface Lectura {
  readonly signo: Caja | null
  readonly signoMargen: string | null
  readonly titular: Caja | null
  readonly agencia: Caja | null
  readonly rotulos: readonly (Caja & { readonly texto: string })[]
  readonly nombres: readonly (Caja & { readonly texto: string })[]
  readonly grillaLateral: string | null
  readonly mezclaDeLaBajada: string | null
  readonly zDeLaEscena: string | null
  readonly ventana: number
}

const VENTANAS_DEL_SPRINT: readonly Ventana[] = [
  { ancho: 1023, alto: 768, procedencia: 'UN PÍXEL ABAJO del corte de composición nuevo', movil: false },
  { ancho: 1024, alto: 768, procedencia: 'EL CORTE: iPad apaisado y notebook', movil: false },
  { ancho: 1440, alto: 900, procedencia: 'scripts-b4/perfiles.ts — el ancho que define el ritmo', movil: false },
]

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })

  await conChrome('blend-portatil', async (chrome) => {
    for (const v of VENTANAS_DEL_SPRINT) {
      await enLaVentana(
        chrome,
        v,
        async (s) => {
          console.log(`\n  ═══ ${v.ancho}x${v.alto}`)
          await s.pagina.conexion.enviar(
            'Page.addScriptToEvaluateOnNewDocument',
            { source: INSTALAR_EL_ESPÍA },
            s.pagina.sessionId,
          )
          await s.pagina.conexion.enviar('Page.reload', { ignoreCache: false }, s.pagina.sessionId)
          await esperar(7000)

          const poseEnElHero = await medir<{ x: number; y: number; z: number } | null>(s.pagina, POSE)
          console.log(`    pose de la cámara en el hero: ${JSON.stringify(poseEnElHero)}  ← el logo no se puede mover`)
          await capturar(s.pagina, `${SALIDA}/hero-${v.ancho}.png`)

          const top = await medir<number>(
            s.pagina,
            `(() => { const q = document.querySelector('[data-panel="quienes-somos"]'); return q === null ? 0 : Math.round(q.getBoundingClientRect().top + window.scrollY) })()`,
          )
          await medir<null>(s.pagina, `(() => { window.scrollTo(0, ${Math.max(0, top - 40)}); return null })()`)
          await esperar(1200)
          await capturar(s.pagina, `${SALIDA}/quienes-somos-${v.ancho}.png`)

          const l = await medir<Lectura | null>(s.pagina, LECTURA)
          if (l === null) {
            console.log('    no se pudo leer el panel')
            return null
          }
          console.log(`    grilla lateral : ${l.grillaLateral}`)
          console.log(`    mezcla bajada  : ${l.mezclaDeLaBajada} · z de la escena: ${l.zDeLaEscena}`)
          console.log(`    titular en x=${l.titular?.x} (ancho ${l.titular?.w})`)
          console.log(`    ≠ en x=${l.signo?.x} margin-inline-start=${l.signoMargen}`)
          for (const r of l.rotulos) console.log(`    h3 «${r.texto}» x=${r.x}`)
          for (const n of l.nombres) console.log(`    h4 «${n.texto}» x=${n.x}`)

          // Volver arriba para dejar la pose comparable entre anchos.
          await medir<null>(s.pagina, `(() => { window.scrollTo(0, 0); return null })()`)
          await esperar(1500)
          const poseDeVuelta = await medir<{ x: number; y: number; z: number } | null>(s.pagina, POSE)
          console.log(`    pose al volver al hero      : ${JSON.stringify(poseDeVuelta)}`)
          return null
        },
        { asentamientoMs: 4500 },
      )
    }
    return null
  })
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
