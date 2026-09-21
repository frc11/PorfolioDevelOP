/**
 * P — ¿EL REVELADO SE REPRODUCE, O APARECE DE GOLPE?
 *
 *     npx tsx scripts-blend/p-revelado.ts
 *
 * El pedido dice que el texto de adentro de las fotos aparece instantáneo y
 * tiene que deslizarse. Antes de tocar nada hay que separar las tres causas
 * posibles, y las tres se contestan LEYENDO, no mirando:
 *
 *   1. **¿Hay recorte?** `overflow` computado de la ventana del texto. Sin
 *      `hidden` no hay máscara y el texto se ve venir desde afuera del marco.
 *   2. **¿La duración resuelve a 0?** `transition-duration` y `transition-delay`
 *      computados del texto, en reposo y con el disparador puesto. El bloque de
 *      `prefers-reduced-motion` de `globals.css` fuerza `1ms !important`, así
 *      que un entorno que se reporte `reduce` daría exactamente este síntoma.
 *   3. **¿La transición ARRANCA?** Ésta no se contesta con un estilo computado:
 *      un valor de llegada correcto se ve igual en un elemento que viajó y en
 *      uno que apareció puesto. Se contesta MUESTREANDO `translate` cuadro a
 *      cuadro con rAF mientras el gesto corre: si hay valores ESTRICTAMENTE
 *      entre los dos extremos, viajó; si salta de 100 % a 0 sin nada en el
 *      medio, apareció de golpe.
 *
 * ⚠️ A 375 la foto del EQUIPO no tiene texto adentro a propósito —la descripción
 * se lee afuera y `banda.css` apaga el párrafo—, así que ahí el sujeto es un
 * RETRATO, que sí lo tiene en los ocho anchos.
 */

import { medir } from '../scripts-b4/navegador'
import { VENTANAS, conChrome, enLaVentana, type SesionTapado, type Ventana } from '../scripts-tapado/tapado-comun'

function esperar(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** Reposo: las dos primeras preguntas, más el estado de la caja que contiene al texto. */
const LECTURA_EN_REPOSO = (sel: string) => `(() => {
  const marco = document.querySelector(${JSON.stringify(sel)})
  if (marco === null) return null
  const velo = marco.querySelector('[data-parte="revelado"]')
  const ventana = marco.querySelector('[data-parte="revelado-texto"]')
  const texto = ventana === null ? null : ventana.firstElementChild
  const r = marco.getBoundingClientRect()
  const cs = texto === null ? null : getComputedStyle(texto)
  return {
    centro: { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) },
    veloDisplay: velo === null ? null : getComputedStyle(velo).display,
    veloOpacidad: velo === null ? null : getComputedStyle(velo).opacity,
    ventanaOverflow: ventana === null ? null : getComputedStyle(ventana).overflow,
    ventanaDisplay: ventana === null ? null : getComputedStyle(ventana).display,
    textoHay: texto !== null,
    propiedad: cs === null ? null : cs.transitionProperty,
    duracion: cs === null ? null : cs.transitionDuration,
    demora: cs === null ? null : cs.transitionDelay,
    translate: cs === null ? null : cs.translate,
    reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
})()`

/**
 * Arma el muestreo y DEVUELVE en el acto: el disparador se manda después, desde
 * CDP, y las muestras se recogen solas en `window.__muestras`. Si se esperara
 * acá, el gesto no habría empezado todavía.
 */
const ARMAR_EL_MUESTREO = (sel: string, ms: number) => `(() => {
  const marco = document.querySelector(${JSON.stringify(sel)})
  const ventana = marco === null ? null : marco.querySelector('[data-parte="revelado-texto"]')
  const texto = ventana === null ? null : ventana.firstElementChild
  window.__muestras = []
  if (texto === null) return false
  const t0 = performance.now()
  const tic = () => {
    const t = performance.now() - t0
    window.__muestras.push([Math.round(t), getComputedStyle(texto).translate])
    if (t < ${ms}) requestAnimationFrame(tic)
  }
  requestAnimationFrame(tic)
  return true
})()`

const LEER_LAS_MUESTRAS = `(() => window.__muestras ?? [])()`

interface Reposo {
  readonly centro: { readonly x: number; readonly y: number }
  readonly veloDisplay: string | null
  readonly veloOpacidad: string | null
  readonly ventanaOverflow: string | null
  readonly ventanaDisplay: string | null
  readonly textoHay: boolean
  readonly propiedad: string | null
  readonly duracion: string | null
  readonly demora: string | null
  readonly translate: string | null
  readonly reduce: boolean
}

/** El segundo número de `translate` en px; `none`/`0px` cuentan como 0. */
function desplazamiento(valor: string): number {
  if (valor === 'none' || valor === '') return 0
  const partes = valor.trim().split(/\s+/)
  const y = partes.length >= 2 ? partes[1] : '0'
  const n = Number.parseFloat(y)
  return Number.isNaN(n) ? 0 : n
}

/** El veredicto: ¿hubo cuadros ESTRICTAMENTE entre los dos extremos? */
function resumir(muestras: readonly (readonly [number, string])[]): string {
  if (muestras.length === 0) return 'sin muestras'
  const ys = muestras.map(([t, v]) => [t, desplazamiento(v)] as const)
  const maxAbs = Math.max(...ys.map(([, y]) => Math.abs(y)))
  const piso = maxAbs * 0.08
  const techo = maxAbs * 0.92
  const enVuelo = ys.filter(([, y]) => Math.abs(y) > piso && Math.abs(y) < techo)
  const primera = ys[0]
  const ultima = ys[ys.length - 1]
  const muestra = enVuelo.slice(0, 4).map(([t, y]) => `${t}ms:${y.toFixed(1)}`).join(' ')
  return `${ys.length} cuadros · ${primera[1].toFixed(1)} → ${ultima[1].toFixed(1)} px · EN VUELO ${enVuelo.length}${enVuelo.length === 0 ? ' ← SALTÓ' : ` (${muestra}…)`}`
}

async function gesto(
  s: SesionTapado,
  conHover: boolean,
  punto: { readonly x: number; readonly y: number },
  entrando: boolean,
): Promise<void> {
  const { conexion, sessionId } = s.pagina
  if (conHover) {
    const destino = entrando ? punto : { x: 2, y: 2 }
    await conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseMoved', ...destino }, sessionId)
    return
  }
  for (const type of ['mousePressed', 'mouseReleased']) {
    await conexion.enviar(
      'Input.dispatchMouseEvent',
      { type, x: punto.x, y: punto.y, button: 'left', clickCount: 1 },
      sessionId,
    )
  }
}

async function principal(): Promise<void> {
  const anchos: readonly number[] = [375, 768, 1440]
  const ventanas: readonly Ventana[] = VENTANAS.filter((v) => anchos.includes(v.ancho))
  const SUJETOS = [
    { nombre: 'retrato', sel: '[data-pieza-a="persona"] [data-marco="dos-tomas"]' },
    { nombre: 'equipo ', sel: '[data-pantalla="foto"] [data-marco="dos-tomas"]' },
  ] as const

  await conChrome('blend-revelado', async (chrome) => {
    for (const v of ventanas) {
      await enLaVentana(
        chrome,
        v,
        async (s) => {
          const conHover = await medir<boolean>(s.pagina, `matchMedia('(hover: hover)').matches`)
          console.log(`\n  ═══ ${v.ancho}x${v.alto} · disparador ${conHover ? 'HOVER' : 'TOQUE'}`)

          for (const sujeto of SUJETOS) {
            const top = await medir<number>(
              s.pagina,
              `(() => { const el = document.querySelector(${JSON.stringify(sujeto.sel)}); return el === null ? -1 : Math.round(el.getBoundingClientRect().top + window.scrollY) })()`,
            )
            if (top < 0) {
              console.log(`    ${sujeto.nombre}: no está en el marcado`)
              continue
            }
            await medir<null>(s.pagina, `(() => { window.scrollTo(0, ${top} - Math.round(window.innerHeight / 2)); return null })()`)
            await esperar(800)

            const reposo = await medir<Reposo | null>(s.pagina, LECTURA_EN_REPOSO(sujeto.sel))
            if (reposo === null) {
              console.log(`    ${sujeto.nombre}: no se pudo leer`)
              continue
            }
            console.log(`    ${sujeto.nombre} REPOSO · velo display=${reposo.veloDisplay} opacidad=${reposo.veloOpacidad}`)
            console.log(`             ventana overflow=${reposo.ventanaOverflow} display=${reposo.ventanaDisplay} · texto translate=${reposo.translate}`)
            console.log(`             transition prop=${(reposo.propiedad ?? '').includes('translate') ? 'incluye translate ✓' : `SIN translate → ${reposo.propiedad}`} dur=${reposo.duracion} delay=${reposo.demora} · reduce=${reposo.reduce}`)
            if (!reposo.textoHay) {
              console.log(`             (sin texto adentro: acá no hay nada que revelar)`)
              continue
            }

            // ENTRADA
            await medir<boolean>(s.pagina, ARMAR_EL_MUESTREO(sujeto.sel, 1400))
            await gesto(s, conHover, reposo.centro, true)
            await esperar(1600)
            const entrada = await medir<(readonly [number, string])[]>(s.pagina, LEER_LAS_MUESTRAS)
            // Con el disparador TODAVÍA puesto: acá se leen los valores de ENTRADA,
            // que en reposo no se pueden ver porque ahí gobierna la regla de salida.
            const abierto = await medir<{ dur: string; delay: string } | null>(
              s.pagina,
              `(() => {
                const v = document.querySelector(${JSON.stringify(sujeto.sel)})?.querySelector('[data-parte="revelado-texto"]')?.firstElementChild
                if (!v) return null
                const cs = getComputedStyle(v)
                return { dur: cs.transitionDuration, delay: cs.transitionDelay }
              })()`,
            )
            console.log(`             ENTRADA  ${resumir(entrada)}`)
            console.log(`                      computado con el disparador puesto: dur=${abierto?.dur} delay=${abierto?.delay}`)

            // SALIDA
            await medir<boolean>(s.pagina, ARMAR_EL_MUESTREO(sujeto.sel, 1400))
            await gesto(s, conHover, reposo.centro, false)
            await esperar(1600)
            const salida = await medir<(readonly [number, string])[]>(s.pagina, LEER_LAS_MUESTRAS)
            console.log(`             SALIDA   ${resumir(salida)}`)
          }
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
