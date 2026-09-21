/**
 * E — ¿CUÁL DE LOS DOS ESTADOS QUEDA VIEJO DESPUÉS DEL VIAJE?
 *
 *     npx tsx scripts-deslizar/e-desincronia.ts
 *
 * La pose de la cámara se compone de DOS entradas, y el síntoma —«de la nada
 * pega un zoom, y un clic lo arregla»— no dice cuál de las dos falla:
 *
 *   · **el PROGRESO**, que `useEscenaAtadaAlScroll` recalcula SÓLO cuando entra
 *     un evento de `scroll`, `resize`, `visibilitychange` o un cambio de etapa
 *     del intro. Si ninguno entra, el último número escrito se queda.
 *   · **el PUNTERO**, que r3f actualiza con `pointermove` sobre el `<html>`
 *     (`fuenteDeEventos.ts`) y que `OrbitRig` le SUMA a la pose del track.
 *
 * Cada uno se despierta con un evento distinto, y ahí está el discriminador:
 *
 *   A · un `resize` sintético recalcula el PROGRESO y no toca el puntero.
 *   B · un `pointermove` en el MISMO punto no cambia ninguno de los dos.
 *   C · un `pointermove` a otro punto mueve SÓLO el puntero — y de paso mide
 *       cuánta cámara puede mover un puntero viejo, que es el tamaño máximo del
 *       «zoom» que un desajuste de esa entrada podría explicar.
 *   D · un CLIC, que es lo que el síntoma dice que lo arregla.
 *
 * Si la pose se mueve en A, el viejo es el progreso. Si se mueve en C y en D
 * pero no en A, el viejo es el puntero. La rueda no despierta al puntero: un
 * `wheel` no es un evento de puntero, así que scrollear sin mover el mouse deja
 * al puntero clavado donde estaba — que es exactamente el gesto del síntoma.
 */

import { medir } from '../scripts-b4/navegador'
import { VENTANAS, conChrome, enLaVentana, type SesionTapado, type Ventana } from '../scripts-tapado/tapado-comun'

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

const POSE = `(() => {
  const c = window.__camara
  if (c === null || c === undefined) return null
  return {
    x: Number(c.position.x.toFixed(2)),
    y: Number(c.position.y.toFixed(2)),
    z: Number(c.position.z.toFixed(2)),
    d: Number(Math.hypot(c.position.x, c.position.y, c.position.z).toFixed(2)),
    scrollY: Math.round(window.scrollY),
    inerte: document.querySelector('[data-v3] main')?.hasAttribute('inert') ?? null,
  }
})()`

interface Pose {
  readonly x: number
  readonly y: number
  readonly z: number
  readonly d: number
  readonly scrollY: number
  readonly inerte: boolean | null
}

/** Cuánto se movió la cámara entre dos poses, en unidades de mundo. */
function delta(a: Pose | null, b: Pose | null): string {
  if (a === null || b === null) return '—'
  const dist = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z)
  return `${dist.toFixed(3)} u`
}

function ver(p: Pose | null): string {
  return p === null ? 'null' : `(${p.x}, ${p.y}, ${p.z}) d=${p.d} scrollY=${p.scrollY}`
}

async function puntero(s: SesionTapado, x: number, y: number): Promise<void> {
  await s.pagina.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }, s.pagina.sessionId)
}

async function clic(s: SesionTapado, x: number, y: number): Promise<void> {
  for (const type of ['mousePressed', 'mouseReleased']) {
    await s.pagina.conexion.enviar(
      'Input.dispatchMouseEvent',
      { type, x, y, button: 'left', clickCount: 1 },
      s.pagina.sessionId,
    )
  }
}

async function principal(): Promise<void> {
  const anchos: readonly number[] = [1440]
  const ventanas: readonly Ventana[] = VENTANAS.filter((v) => anchos.includes(v.ancho))

  await conChrome('deslizar-desincronia', async (chrome) => {
    for (const v of ventanas) {
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

          // ⚠️ **PRECONDICIÓN VERIFICADA, NO SUPUESTA.** Una corrida anterior
          // arrancó en `scrollY=6896` —el `reload` restauró la posición— y el
          // clic cayó donde el CTA ya no estaba: todas las cifras salieron
          // mezcladas con un scroll que se movía solo. Acá se fuerza el tope, se
          // COMPRUEBA, y recién después se lee la caja del CTA.
          await medir<null>(s.pagina, `(() => { window.scrollTo(0, 0); return null })()`)
          await esperar(1500)
          const enElTope = await medir<number>(s.pagina, `Math.round(window.scrollY)`)
          if (enElTope !== 0) {
            console.log(`    ⚠️ no se pudo volver al tope (scrollY=${enElTope}); la corrida no vale`)
            return null
          }

          const cta = await medir<{ x: number; y: number } | null>(
            s.pagina,
            `(() => { const a = document.querySelector('[data-panel="hero"] a[data-pieza="cta"]'); if (a === null) return null; const r = a.getBoundingClientRect(); if (r.top < 0 || r.bottom > window.innerHeight) return null; return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) } })()`,
          )
          if (cta === null) {
            console.log('    el CTA del hero no está entero en pantalla')
            return null
          }

          // Puntero parado en el CTA, y desde acá NO se mueve salvo cuando la
          // prueba lo pide: así el puntero es una variable controlada.
          await puntero(s, cta.x, cta.y)
          await esperar(600)
          const antesDelViaje = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    antes del viaje : ${ver(antesDelViaje)}`)

          // ── EL VIAJE ─────────────────────────────────────────────────────
          await clic(s, cta.x, cta.y)
          await esperar(400)
          const enPleno = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    (control: a los 400 ms el <main> es inerte=${enPleno?.inerte} — si es false, el clic no disparó el viaje)`)
          await esperar(3800)
          const alLlegar = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    al llegar       : ${ver(alLlegar)}  main inerte=${alLlegar?.inerte}`)

          // ── A · ¿está viejo el PROGRESO? ─────────────────────────────────
          await medir<null>(s.pagina, `(() => { window.dispatchEvent(new Event('resize')); return null })()`)
          await esperar(900)
          const trasResize = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    A · tras resize : ${ver(trasResize)}   Δ=${delta(alLlegar, trasResize)}  ← si se mueve, el PROGRESO estaba viejo`)

          // ── B · el mismo punto: no tiene que mover nada ───────────────────
          await puntero(s, cta.x, cta.y)
          await esperar(900)
          const trasMismoPunto = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    B · mismo punto : ${ver(trasMismoPunto)}   Δ=${delta(trasResize, trasMismoPunto)}`)

          // ── C · otro punto: mueve SÓLO el puntero ────────────────────────
          await puntero(s, 40, 40)
          await esperar(1200)
          const trasOtroPunto = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    C · otro punto  : ${ver(trasOtroPunto)}   Δ=${delta(trasMismoPunto, trasOtroPunto)}  ← cuánta cámara mueve el PUNTERO`)

          // ── La rueda para arriba, SIN mover el puntero ────────────────────
          for (let i = 0; i < 14; i += 1) {
            await s.pagina.conexion.enviar(
              'Input.dispatchMouseEvent',
              { type: 'mouseWheel', x: 40, y: 40, deltaX: 0, deltaY: -700 },
              s.pagina.sessionId,
            )
            await esperar(70)
          }
          await esperar(2500)
          const arribaDeTodo = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    rueda arriba    : ${ver(arribaDeTodo)}`)

          // ¿Se mueve sola, sin que entre ningún evento? Tres lecturas seguidas.
          await esperar(1500)
          const quieta1 = await medir<Pose | null>(s.pagina, POSE)
          await esperar(1500)
          const quieta2 = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    sola, +1,5 s    : ${ver(quieta1)}   Δ=${delta(arribaDeTodo, quieta1)}`)
          console.log(`    sola, +3,0 s    : ${ver(quieta2)}   Δ=${delta(quieta1, quieta2)}`)

          // ── A' · el resize otra vez, ya arriba ───────────────────────────
          await medir<null>(s.pagina, `(() => { window.dispatchEvent(new Event('resize')); return null })()`)
          await esperar(900)
          const trasResize2 = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    A'· resize arriba: ${ver(trasResize2)}   Δ=${delta(quieta2, trasResize2)}  ← si se mueve, el PROGRESO estaba viejo`)

          // ── D · el clic que «lo arregla» ─────────────────────────────────
          await clic(s, 40, 40)
          await esperar(1200)
          const trasClic = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    D · tras el clic: ${ver(trasClic)}   Δ=${delta(trasResize2, trasClic)}  ← lo que el CLIC cambia`)

          // ══ E · EL FEED DE PUNTERO DURANTE EL VIAJE ══════════════════════
          // El viaje pone `inert` en el `<main>`, y r3f escucha `pointermove` en
          // el `<html>` CONTANDO con que burbujee desde el contenido
          // (`fuenteDeEventos.ts`). Un subárbol inerte no despacha eventos de
          // puntero, así que la pregunta es si el puntero queda congelado
          // durante el viaje y pega un salto cuando el `<main>` vuelve.
          console.log(`
    ── E · el puntero mientras el <main> es inerte ──`)
          await puntero(s, cta.x, cta.y)
          await esperar(1000)
          const eBase = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    E0 · en el hero, puntero en el CTA : ${ver(eBase)}`)

          await clic(s, cta.x, cta.y)
          await esperar(700) // el preludio terminó, el viaje está corriendo
          const eEnVuelo = await medir<Pose | null>(s.pagina, POSE)
          // Mover el puntero MIENTRAS el main es inerte.
          await puntero(s, 40, 40)
          await esperar(400)
          const eTrasMoverEnVuelo = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    E1 · en vuelo (inerte=${eEnVuelo?.inerte}), puntero movido a (40,40): Δ=${delta(eEnVuelo, eTrasMoverEnVuelo)} (mezclado con el viaje)`)

          await esperar(3600) // que termine el viaje y se saque el inert
          const eAlLlegar = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    E2 · ya llegó (inerte=${eAlLlegar?.inerte}), puntero SIGUE en (40,40): ${ver(eAlLlegar)}`)

          // Un movimiento de UN pixel, ya sin inert: si el puntero venía
          // congelado, acá se destapa el salto.
          await puntero(s, 41, 41)
          await esperar(1400)
          const eTrasUnPixel = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    E3 · +1 px de puntero, sin scroll  : ${ver(eTrasUnPixel)}   Δ=${delta(eAlLlegar, eTrasUnPixel)}  ← el SALTO del puntero congelado`)
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
