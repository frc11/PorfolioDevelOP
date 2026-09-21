/**
 * D — EL VIAJE ABAJO DEL UMBRAL, Y EL SALTO DE CÁMARA DE ARRIBA.
 *
 *     npx tsx scripts-deslizar/d-banda.ts
 *
 * Dos preguntas que comparten la misma pose, así que comparten corrida:
 *
 *   1. **¿El viaje viaja, o se teletransporta?** Se muestrea `window.scrollY`
 *      cuadro a cuadro con rAF mientras el click corre. Un viaje deja decenas de
 *      cuadros con el scroll ESTRICTAMENTE entre la salida y la llegada; un
 *      ancla nativa salta en uno. Es el mismo discriminador que `p-revelado`
 *      usó para el texto: el valor de llegada es idéntico en los dos casos, así
 *      que sólo el camino distingue.
 *
 *   2. **¿La cámara queda desincronizada al volver para arriba?** La pose no se
 *      publica a `window` en /v3 —sólo el panel de `/probe-escena` la lee—, así
 *      que se lee del OTRO lado: se instala `window.__THREE_DEVTOOLS__` antes de
 *      que cargue la página y three despacha su `WebGLRenderer` ahí
 *      (`three@0.182.0`, cuatro despachos en `three.core.js`). Con el renderer en
 *      la mano se envuelve SU `render(scene, camera)`, que r3f llama una vez por
 *      cuadro, y de ahí sale la cámara de verdad — la que dibuja, no la que un
 *      store dice que debería.
 *
 * ⚠️ **El hook se instala y se RECARGA.** `addScriptToEvaluateOnNewDocument`
 * corre en documentos NUEVOS, y para cuando el trabajo empieza la escena ya
 * montó. Se instala, se recarga, y la marca del intro que pone `enLaVentana`
 * se re-aplica sola por el mismo mecanismo.
 */

import { medir } from '../scripts-b4/navegador'
import { VENTANAS, conChrome, enLaVentana, type SesionTapado, type Ventana } from '../scripts-tapado/tapado-comun'

function esperar(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** Se engancha a los despachos de three y se queda con la cámara de cada cuadro. */
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

const LECTURA_DEL_ENTORNO = `(() => {
  const html = document.documentElement
  const cta = document.querySelector('[data-panel="hero"] a[data-pieza="cta"]')
  const r = cta === null ? null : cta.getBoundingClientRect()
  return {
    lenis: html.hasAttribute('data-v3-scroll-suave'),
    escena: document.querySelector('[data-escena]') !== null,
    lienzo: document.querySelector('[data-escena] canvas') !== null,
    camaraEspiada: window.__camara !== null && window.__camara !== undefined,
    ctaEnPantalla: r === null ? null : { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) },
    scrollY: Math.round(window.scrollY),
    alturaDelDocumento: Math.round(document.documentElement.scrollHeight),
  }
})()`

/** Los cinco números que definen dónde está parada la cámara. */
const POSE = `(() => {
  const c = window.__camara
  if (c === null || c === undefined) return null
  return {
    x: Number(c.position.x.toFixed(3)),
    y: Number(c.position.y.toFixed(3)),
    z: Number(c.position.z.toFixed(3)),
    fov: Number((c.fov ?? 0).toFixed(3)),
    distancia: Number(Math.hypot(c.position.x, c.position.y, c.position.z).toFixed(3)),
  }
})()`

/** Dónde quedó `#trabajos` respecto del borde de arriba: comparable entre anchos. */
const LLEGADA = `(() => {
  const t = document.getElementById('trabajos')
  if (t === null) return null
  return { topDeTrabajos: Math.round(t.getBoundingClientRect().top), scrollY: Math.round(window.scrollY) }
})()`

const ARMAR_EL_MUESTREO_DE_SCROLL = (ms: number) => `(() => {
  window.__scrolls = []
  const t0 = performance.now()
  const tic = () => {
    const t = performance.now() - t0
    window.__scrolls.push([Math.round(t), Math.round(window.scrollY)])
    if (t < ${ms}) requestAnimationFrame(tic)
  }
  requestAnimationFrame(tic)
  return true
})()`

const LEER_LOS_SCROLLS = `(() => window.__scrolls ?? [])()`

/** Muestrea la POSE en el tiempo, para cazar un movimiento que llega solo. */
const ARMAR_EL_MUESTREO_DE_POSE = (ms: number) => `(() => {
  window.__poses = []
  const t0 = performance.now()
  const tic = () => {
    const t = performance.now() - t0
    const c = window.__camara
    if (c !== null && c !== undefined) {
      window.__poses.push([Math.round(t), Number(Math.hypot(c.position.x, c.position.y, c.position.z).toFixed(2)), Math.round(window.scrollY)])
    }
    if (t < ${ms}) requestAnimationFrame(tic)
  }
  requestAnimationFrame(tic)
  return true
})()`

const LEER_LAS_POSES = `(() => window.__poses ?? [])()`

interface Entorno {
  readonly lenis: boolean
  readonly escena: boolean
  readonly lienzo: boolean
  readonly camaraEspiada: boolean
  readonly ctaEnPantalla: { readonly x: number; readonly y: number } | null
  readonly scrollY: number
  readonly alturaDelDocumento: number
}

interface Pose {
  readonly x: number
  readonly y: number
  readonly z: number
  readonly fov: number
  readonly distancia: number
}

/** ¿Viajó o saltó? Cuenta cuadros con el scroll estrictamente entre las dos puntas. */
function veredictoDelViaje(muestras: readonly (readonly [number, number])[]): string {
  if (muestras.length === 0) return 'sin muestras'
  const ys = muestras.map(([, y]) => y)
  const salida = ys[0]
  const llegada = ys[ys.length - 1]
  const lo = Math.min(salida, llegada)
  const hi = Math.max(salida, llegada)
  const margen = (hi - lo) * 0.02
  const enVuelo = ys.filter((y) => y > lo + margen && y < hi - margen).length
  const distintos = new Set(ys).size
  // La cadencia DURANTE el viaje: el hueco más grande entre dos cuadros que se
  // movieron. Es el número que contesta «¿se entrecorta en la banda móvil?».
  const enMovimiento = muestras.filter(([, y]) => y > lo + margen && y < hi - margen)
  let peorHueco = 0
  for (let i = 1; i < enMovimiento.length; i += 1) {
    peorHueco = Math.max(peorHueco, enMovimiento[i][0] - enMovimiento[i - 1][0])
  }
  const medio =
    enMovimiento.length > 1
      ? (enMovimiento[enMovimiento.length - 1][0] - enMovimiento[0][0]) / (enMovimiento.length - 1)
      : 0
  return `${ys.length} cuadros · ${salida} → ${llegada} px (${hi - lo} de recorrido) · EN VUELO ${enVuelo}, valores distintos ${distintos}${enVuelo <= 1 ? '  ← TELETRANSPORTE' : ''}
              cadencia en vuelo: ${medio.toFixed(1)} ms de media, peor hueco ${peorHueco} ms`
}

async function ruedaArriba(s: SesionTapado, punto: { x: number; y: number }, pasos: number): Promise<void> {
  for (let i = 0; i < pasos; i += 1) {
    await s.pagina.conexion.enviar(
      'Input.dispatchMouseEvent',
      { type: 'mouseWheel', x: punto.x, y: punto.y, deltaX: 0, deltaY: -600 },
      s.pagina.sessionId,
    )
    await esperar(60)
  }
}

async function principal(): Promise<void> {
  const anchos: readonly number[] = [375, 768, 1024, 1440]
  const ventanas: readonly Ventana[] = VENTANAS.filter((v) => anchos.includes(v.ancho))

  await conChrome('deslizar-banda', async (chrome) => {
    for (const v of ventanas) {
      await enLaVentana(
        chrome,
        v,
        async (s) => {
          console.log(`\n  ═══ ${v.ancho}x${v.alto}`)

          // El espía va en un documento NUEVO: se instala y se recarga.
          await s.pagina.conexion.enviar(
            'Page.addScriptToEvaluateOnNewDocument',
            { source: INSTALAR_EL_ESPÍA },
            s.pagina.sessionId,
          )
          await s.pagina.conexion.enviar('Page.reload', { ignoreCache: false }, s.pagina.sessionId)
          await esperar(7000)

          const ent = await medir<Entorno>(s.pagina, LECTURA_DEL_ENTORNO)
          console.log(`    lenis=${ent.lenis} escena=${ent.escena} lienzo=${ent.lienzo} cámara-espiada=${ent.camaraEspiada} · doc ${ent.alturaDelDocumento}px`)
          if (ent.ctaEnPantalla === null) {
            console.log('    el CTA del hero no está en pantalla, se saltea')
            return null
          }

          const poseEnElHero = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    pose en el HERO      : ${JSON.stringify(poseEnElHero)}`)

          // ── 1 · ¿viaja o salta? ──────────────────────────────────────────
          await medir<boolean>(s.pagina, ARMAR_EL_MUESTREO_DE_SCROLL(4200))
          for (const type of ['mousePressed', 'mouseReleased']) {
            await s.pagina.conexion.enviar(
              'Input.dispatchMouseEvent',
              { type, x: ent.ctaEnPantalla.x, y: ent.ctaEnPantalla.y, button: 'left', clickCount: 1 },
              s.pagina.sessionId,
            )
          }
          await esperar(4600)
          const scrolls = await medir<(readonly [number, number])[]>(s.pagina, LEER_LOS_SCROLLS)
          console.log(`    EL VIAJE  ${veredictoDelViaje(scrolls)}`)

          const limpio = await medir<{ inerte: boolean; velo: boolean; opacidad: string; foco: string }>(
            s.pagina,
            `(() => {
              const m = document.querySelector('[data-v3] main')
              return {
                inerte: m === null ? false : m.hasAttribute('inert'),
                velo: m === null ? false : m.hasAttribute('data-v3-deslizando'),
                opacidad: m === null ? '?' : getComputedStyle(m).opacity,
                foco: document.activeElement === null ? 'ninguno' : (document.activeElement.id || document.activeElement.tagName),
              }
            })()`,
          )
          console.log(`    vuelve limpio: inerte=${limpio.inerte} velo=${limpio.velo} opacidad=${limpio.opacidad} foco=${limpio.foco}`)

          const llegada = await medir<{ topDeTrabajos: number; scrollY: number } | null>(s.pagina, LLEGADA)
          const poseAlLlegar = await medir<Pose | null>(s.pagina, POSE)
          console.log(`    llegada   : #trabajos a ${llegada?.topDeTrabajos}px del borde (scrollY ${llegada?.scrollY})`)
          console.log(`    pose al LLEGAR       : ${JSON.stringify(poseAlLlegar)}`)

          // ── 2 · volver para arriba y esperar a ver si algo se mueve solo ──
          await medir<boolean>(s.pagina, ARMAR_EL_MUESTREO_DE_POSE(6000))
          await ruedaArriba(s, ent.ctaEnPantalla, 8)
          await esperar(6400)
          const poses = await medir<(readonly [number, number, number])[]>(s.pagina, LEER_LAS_POSES)
          const poseFinal = await medir<Pose | null>(s.pagina, POSE)
          if (poses.length > 0) {
            const ds = poses.map(([, d]) => d)
            const scrollFinal = poses[poses.length - 1][2]
            const quieto = poses.filter(([, , y]) => y === scrollFinal)
            const dsQuieto = quieto.map(([, d]) => d)
            const rangoQuieto = dsQuieto.length > 1 ? Math.max(...dsQuieto) - Math.min(...dsQuieto) : 0
            console.log(`    al VOLVER : ${poses.length} muestras · distancia ${Math.min(...ds).toFixed(2)} → ${Math.max(...ds).toFixed(2)}`)
            console.log(`                con el scroll YA QUIETO en ${scrollFinal}: ${quieto.length} muestras, la distancia se mueve ${rangoQuieto.toFixed(2)}`)
          }
          console.log(`    pose FINAL           : ${JSON.stringify(poseFinal)}`)
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
