/**
 * FRENTE A · LO QUE EL LCP NO VE — la cronología del preloader.
 *
 * ── El hecho que obliga a este script ────────────────────────────────────
 *
 * Con el gate restituido (`a-gate-del-intro.json`: `intoArmo: true`,
 * `overlayVisible: true`), `a-vitales.ts` midió a 1920 un **LCP de 470 ms** y
 * **un solo candidato**: el mismo `#titular-hero` que mide la visita repetida.
 * O sea que **el preloader no movió el LCP ni un milisegundo**.
 *
 * Hay dos explicaciones y son incompatibles:
 *
 *   (a) el preloader no corrió de verdad en esa corrida, y el número es basura;
 *   (b) corrió, el visitante estuvo mirando el overlay durante segundos, y el
 *       LCP igual reportó 470 ms — porque **la oclusión no se descuenta**: un
 *       elemento tapado por otro sigue siendo candidato a LCP, sólo queda fuera
 *       lo que tiene `opacity: 0`.
 *
 * Este script las separa, y no por deducción: **muestrea la página cada 250 ms**
 * durante 10 s con el gate restituido, y saca DOS capturas fechadas. Si a los
 * 1500 ms la foto muestra el overlay y el H1 ya está en `opacity: 1`, es (b) — y
 * entonces la cifra de LCP de este sitio **describe el pintado y no lo que el
 * visitante ve**, que es un defecto de la métrica contra la experiencia y hay
 * que reportarlo con esas palabras.
 *
 * ── ⚠️ Acá se usa `capturar` pelado y no `capturarRegion`, con motivo ────
 *
 * `capturarRegion` hace dos cosas que acá romperían la medición: **scrollea** a
 * la región (el scroll ya está en 0, que es donde vive el hero) y **espera
 * `GRACIA_DE_ESCENA_MS` = 1200 ms** antes de disparar. Esta medición es
 * justamente sobre el eje del tiempo: la foto tiene que salir en el
 * milisegundo pedido y no 1200 ms después. Las dos reglas del banco se cumplen
 * igual —el scroll está en la región que se recorta, y la escena tiene su
 * gracia porque la segunda foto sale a los 6000 ms—, pero por construcción y no
 * por la función.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { readFileSync, unlinkSync } from 'node:fs'
import os from 'node:os'

import { capturar } from './captura'
import { rutaDeCaptura } from './capturas'
import { bandaDeLuminancia } from './color'
import { decodificarPng } from './png'
import { cerrarChrome, lanzarChrome, perfilDeChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { RESTITUIR_EL_GATE } from './a-observador'

const URL_MEDIDA = 'http://localhost:3005/v3'
const SALIDA = 'docs/rediseno/outputs/b4/a-preloader-cronologia.json'
const MUESTREO_MS = 250
const DURACION_MS = 10_000
/** Las dos que quedan en `docs/` como evidencia. */
const FOTOS_MS = [1500, 6000] as const
/** El barrido de luminancia: fotos al scratchpad, se miden y se borran. */
const BARRIDO_MS = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000] as const
/** Debajo de esto la pantalla es el fondo del preloader; el sitio es casi blanco. */
const UMBRAL_DE_PANTALLA_OSCURA = 0.2

interface Muestra {
  readonly t: number
  readonly marcaEnElHtml: boolean
  readonly opacidadDelH1: number
  readonly h1Visible: boolean
  readonly overlayEnElDom: boolean
  readonly opacidadDelOverlay: number | null
  readonly overlays: number
  readonly canvas: number
}

const FUENTE = `
(() => {
  const salida = []
  const h1 = document.getElementById('titular-hero')
  const t0 = performance.now()
  let finDelIntroMs = null
  window.addEventListener('home-intro:finished', () => {
    if (finDelIntroMs === null) finDelIntroMs = Math.round(performance.now() - t0)
  })
  return new Promise((resolver) => {
    const tomar = () => {
      const el = document.getElementById('titular-hero')
      let opac = -1
      let visible = false
      if (el) {
        const cs = getComputedStyle(el)
        opac = Number(cs.opacity)
        const r = el.getBoundingClientRect()
        visible = opac > 0 && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0
      }
      const ov = document.querySelector('[data-home-intro-overlay]')
      const opacOv = ov === null ? null : Number(getComputedStyle(ov).opacity)
      let overlays = 0
      for (const n of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(n)
        if (cs.position !== 'fixed') continue
        const r = n.getBoundingClientRect()
        if (r.width >= innerWidth * 0.9 && r.height >= innerHeight * 0.9 && Number(cs.opacity) > 0.5) overlays += 1
      }
      salida.push({
        t: Math.round(performance.now() - t0),
        marcaEnElHtml: document.documentElement.hasAttribute('data-home-intro'),
        opacidadDelH1: opac,
        h1Visible: visible,
        overlayEnElDom: ov !== null,
        opacidadDelOverlay: opacOv,
        overlays: overlays,
        canvas: document.querySelectorAll('canvas').length,
      })
      if (performance.now() - t0 >= ${DURACION_MS}) { resolver({ h1Existia: h1 !== null, t0DesdeNavegacionMs: Math.round(t0), finDelIntroMs: finDelIntroMs, muestras: salida }); return }
      setTimeout(tomar, ${MUESTREO_MS})
    }
    tomar()
  })
})()`

/** Luminancia relativa media de una captura, con el instrumento del banco. */
function luminanciaMedia(archivo: string): number {
  const img = decodificarPng(readFileSync(archivo))
  const luz = bandaDeLuminancia(img.datos, img.ancho, img.alto)
  let suma = 0
  for (let i = 0; i < luz.length; i += 1) suma += luz[i]
  return Math.round((suma / luz.length) * 10000) / 10000
}

async function principal(): Promise<void> {
  const perfil = perfilPorId('1920')
  const chrome = await lanzarChrome({ perfil: perfilDeChrome('a'), ancho: 1280, alto: 900 })
  let resultado: {
    readonly h1Existia: boolean
    readonly t0DesdeNavegacionMs: number
    readonly finDelIntroMs: number | null
    readonly muestras: readonly Muestra[]
  } | null = null
  const fotos: { readonly tPedidoMs: number; readonly ruta: string; readonly bytes: number }[] = []
  const barrido: { readonly tMs: number; readonly luminanciaMedia: number; readonly archivo: string | null }[] = []
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    await p.conexion.enviar('Network.setCacheDisabled', { cacheDisabled: true }, p.sessionId)
    await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: RESTITUIR_EL_GATE }, p.sessionId)
    await irA(p, URL_MEDIDA, { marcaDeIntro: false })
    await verificarLaPagina(p, perfil)

    const muestreo = medir<{
      h1Existia: boolean
      t0DesdeNavegacionMs: number
      finDelIntroMs: number | null
      muestras: Muestra[]
    }>(p, FUENTE)
    const temp = path.join(os.tmpdir(), 'b4-a-barrido')
    mkdirSync(temp, { recursive: true })
    let anterior = 0
    for (const t of BARRIDO_MS) {
      await new Promise((r) => setTimeout(r, t - anterior))
      anterior = t
      const guardar = FOTOS_MS.includes(t as (typeof FOTOS_MS)[number])
      const ruta = guardar ? rutaDeCaptura('a', perfil.id, `escena-preloader-t${t}`) : path.join(temp, `t${t}.png`)
      mkdirSync(path.dirname(ruta), { recursive: true })
      const bytes = await capturar(p, ruta)
      barrido.push({ tMs: t, luminanciaMedia: luminanciaMedia(ruta), archivo: guardar ? ruta : null })
      if (guardar) fotos.push({ tPedidoMs: t, ruta, bytes })
      else unlinkSync(ruta)
    }
    resultado = await muestreo
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }

  if (resultado === null) throw new Error('no hubo muestreo')
  const m = resultado.muestras
  if (m.length === 0) throw new Error('el muestreo devolvió cero muestras: el instrumento no vio la página')
  const conMarca = m.filter((x) => x.marcaEnElHtml)
  const ultimaConMarca = conMarca.length === 0 ? null : conMarca[conMarca.length - 1].t
  const primeraSinOverlay = m.find((x) => x.overlays === 0)?.t ?? null
  const primeraConElOverlayApagado =
    m.find((x) => !x.overlayEnElDom || (x.opacidadDelOverlay !== null && x.opacidadDelOverlay < 0.01))?.t ?? null
  const primeraH1Visible = m.find((x) => x.h1Visible)?.t ?? null

  const salida = {
    frente: 'a',
    asunto: 'la cronología del preloader contra el LCP, con el gate restituido',
    instrumento: 'scripts-b4/a-preloader-cronologia.ts — muestreo cada 250 ms + Page.captureScreenshot fechado',
    build: { cual: 'prod (.next-probe, 3005)', url: URL_MEDIDA },
    perfil: perfil.id,
    emulado: true,
    estrangulamiento: 'ninguno — acá se mide el eje del tiempo del overlay, no la carga',
    controlPositivo: {
      nombre: 'el muestreo vio la página: hay muestras y el H1 existe en el DOM',
      pasa: m.length > 5 && resultado.h1Existia,
      detalle: `${m.length} muestras · h1Existia=${resultado.h1Existia}`,
    },
    barridoDeLuminancia: {
      definicion:
        'luminancia relativa media de la captura de viewport, con `bandaDeLuminancia` del banco. El fondo del preloader es casi negro; el sitio, casi blanco.',
      umbralDePantallaOscura: UMBRAL_DE_PANTALLA_OSCURA,
      primerCuadroClaroMs: barrido.find((b) => b.luminanciaMedia > UMBRAL_DE_PANTALLA_OSCURA)?.tMs ?? null,
      ultimoCuadroOscuroMs:
        [...barrido].reverse().find((b) => b.luminanciaMedia <= UMBRAL_DE_PANTALLA_OSCURA)?.tMs ?? null,
      cuadros: barrido,
    },
    ejeDelTiempo: {
      nota: 'todos los `t` de este archivo son relativos al arranque del muestreo. `t0DesdeNavegacionMs` es ese arranque medido desde `navigationStart`: sumarlo da la escala en la que está el LCP.',
      t0DesdeNavegacionMs: resultado.t0DesdeNavegacionMs,
    },
    hitos: {
      ultimaMuestraConLaMarcaMs: ultimaConMarca,
      eventoHomeIntroFinishedMs: resultado.finDelIntroMs,
      primeraMuestraConElOverlayApagadoMs: primeraConElOverlayApagado,
      primeraMuestraSinOverlayDePantallaCompletaMs: primeraSinOverlay,
      primeraMuestraConElH1VisibleMs: primeraH1Visible,
      opacidadDelH1EnLaPrimeraMuestra: m[0].opacidadDelH1,
    },
    fotos,
    muestras: m,
  }
  mkdirSync(path.dirname(SALIDA), { recursive: true })
  writeFileSync(SALIDA, `${JSON.stringify(salida, null, 2)}\n`)
  console.log(`muestras: ${m.length} · h1Existia=${resultado.h1Existia} · t0 desde navegación: ${resultado.t0DesdeNavegacionMs} ms`)
  console.log(`última muestra con data-home-intro: ${String(ultimaConMarca)} ms`)
  console.log(`evento home-intro:finished: ${String(resultado.finDelIntroMs)} ms`)
  console.log(`primera muestra con el overlay apagado: ${String(primeraConElOverlayApagado)} ms`)
  console.log(`primera sin overlay de pantalla completa: ${String(primeraSinOverlay)} ms`)
  console.log(`primera con el H1 visible: ${String(primeraH1Visible)} ms · opacidad en t=0: ${m[0].opacidadDelH1}`)
  for (const b of barrido) console.log(`  t+${String(b.tMs).padStart(5)} ms  luminancia media ${b.luminanciaMedia}`)
  for (const f of fotos) console.log(`foto t+${f.tPedidoMs} ms → ${f.ruta} (${(f.bytes / 1024).toFixed(1)} KiB)`)
  console.log(`escrito: ${SALIDA}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
