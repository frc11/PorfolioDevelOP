/**
 * LAS TRES LLEGADAS DEL SPRINT, medidas en una sola pasada.
 *
 *     npx tsx scripts-b4/s6-llegadas.ts
 *
 *   1. **El cartel de Portfolio llega.** El pedido dice que sigue apareciendo
 *      puesto y que, si el patrón está y aun así no llega, hay que medir DÓNDE
 *      arranca su progreso. Se barre su ventana y se anota cuánto del bloque
 *      está tapado por la línea que lo recorta, cuadro a cuadro.
 *   2. **El cursor del CTA sigue la cabeza de tipeo.** Se barre el crecimiento
 *      de la ventana y se anota dónde está el cursor y dónde termina el texto
 *      visible: tienen que ir juntos.
 *   3. **«Nuestros servicios» llega ANTES de que la sección se pose.** Se barre
 *      la aproximación —antes del pin— y se exige que el bloque ya esté
 *      subiendo ahí.
 *
 * ── ⚠️ Todo se mide con caja de LAYOUT donde hay una escala viva ──────────
 *
 * La ventana del CTA lleva su propia escala, así que los rects de lo de adentro
 * vienen multiplicados por ella. `offsetLeft`/`offsetTop` no los toca ninguna
 * transformada, que es lo que hace comparables dos cuadros con escalas
 * distintas. Donde no hay escala —el cartel, el rodillo— el rect sirve.
 */

import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const URL_BASE = 'http://localhost:3000'
const PERFIL = perfilPorId('1440')

type Pagina = Awaited<ReturnType<typeof abrirPagina>>

/** Deja la página quieta en `y` un rato, RE-PIDIENDO la posición: el sitio tiene
 *  scroll suave y un `scrollTo` solo deja inercia que se va sola. */
async function posarEn(p: Pagina, y: number, ms = 700): Promise<void> {
  await medir<number>(
    p,
    `(async () => {
      const hasta = performance.now() + ${String(ms)}
      while (performance.now() < hasta) {
        window.scrollTo(0, ${String(y)})
        await new Promise((r) => setTimeout(r, 60))
      }
      return window.scrollY
    })()`,
  )
}

interface Tapado {
  readonly top: number
  readonly alto: number
  readonly tapado: number
}

/** Cuánto del bloque queda por DEBAJO del borde de abajo de su ventana. */
const SONDA_DEL_CARTEL = `(() => {
  const caja = document.querySelector('[data-pieza="cartel"]')
  if (caja === null) return null
  const ventana = caja.querySelector('span.relative, [class*="overflow-hidden"]')
  const titular = caja.querySelector('h2')
  if (ventana === null || titular === null) return null
  const r = titular.getBoundingClientRect()
  const v = ventana.getBoundingClientRect()
  return { top: r.top, alto: r.height, tapado: Math.max(0, r.bottom - v.bottom) }
})()`

interface Cursor {
  readonly cursor: number
  readonly texto: number
  readonly escala: number
}

const SONDA_DEL_CURSOR = `(() => {
  const frase = document.querySelector('[data-pieza="frase-del-cta"]')
  const cursor = document.querySelector('[data-pieza="cursor-del-cta"]')
  if (frase === null || cursor === null) return null
  const palabras = [...frase.querySelectorAll('[data-palabra]')]
  // La frase es un CARTEL de tres renglones, asi que la cabeza de tipeo va y
  // vuelve: su x NO es monotona. Lo que se anota es el borde derecho de la
  // parte descubierta de la palabra que se esta escribiendo.
  //
  // OJO: el recorte hay que leerlo como el navegador lo SERIALIZA. Un
  // inset(0 100% 0 0) vuelve con unidades en los ceros, asi que un patron que
  // pida un cero pelado despues del parentesis no matchea nunca y devuelve 0 %
  // de oculto para todas: la primera corrida dio la frase entera descubierta
  // desde el arranque.
  let texto = 0
  for (const pal of palabras) {
    const recorte = pal.style.clipPath || ''
    const m = / ([0-9.]+)%/.exec(recorte)
    const oculto = m === null ? 0 : Number(m[1])
    if (oculto >= 100) continue
    texto = pal.offsetLeft + pal.offsetWidth * (1 - oculto / 100)
  }
  const m2 = /translate\\(([-0-9.]+)px/.exec(cursor.style.transform || '')
  const ventana = document.querySelector('[data-pieza="ventana-del-cta"]')
  const me = /scale\\(([0-9.]+)\\)/.exec(ventana === null ? '' : ventana.style.transform || '')
  return {
    cursor: m2 === null ? -1 : Number(m2[1]),
    texto,
    escala: me === null ? -1 : Number(me[1]),
  }
})()`

const SONDA_DEL_RODILLO = `(() => {
  const ranura = document.querySelector('[data-estado="intro"]')
  if (ranura === null) return null
  const fila = ranura.querySelector('[data-fila="rotulo"]')
  const ventana = ranura.querySelector('[class*="overflow-hidden"]')
  if (fila === null || ventana === null) return null
  const r = fila.getBoundingClientRect()
  const v = ventana.getBoundingClientRect()
  return { top: r.top, alto: r.height, tapado: Math.max(0, r.bottom - v.bottom) }
})()`

async function principal(): Promise<void> {
  const chrome = await lanzarChrome({
    perfil: 'C:/Users/Valentino/.cache/b4-medicion/s6-llegadas',
    ancho: PERFIL.ancho,
    alto: PERFIL.alto + 120,
  })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, `${URL_BASE}/v3`)
    await verificarLaPagina(p, PERFIL)

    const lista = await paneles(p)
    const trabajos = lista.find((s) => s.id === 'trabajos')
    const servicios = lista.find((s) => s.id === 'servicios')
    if (trabajos === undefined || servicios === undefined) throw new Error('faltan paneles')
    console.log(`\ntrabajos top ${trabajos.top.toFixed(0)} · alto ${trabajos.alto.toFixed(0)}`)
    console.log(`servicios top ${servicios.top.toFixed(0)} · alto ${servicios.alto.toFixed(0)}`)

    console.log(`\n1 · EL CARTEL DE PORTFOLIO — su ventana empieza en el px 900 de la seccion`)
    console.log(`   ${'px de seccion'.padStart(14)} ${'top'.padStart(7)} ${'tapado'.padStart(8)} ${'visible'.padStart(9)}`)
    for (const px of [-900, -700, -500, -300, -150, 0, 200, 420, 700, 1200]) {
      await posarEn(p, trabajos.top + px)
      const l = await medir<Tapado | null>(p, SONDA_DEL_CARTEL)
      if (l === null) {
        console.log(`   ${String(px).padStart(14)}   (no hay cartel)`)
        continue
      }
      const vis = l.alto === 0 ? 0 : Math.max(0, l.alto - l.tapado) / l.alto
      console.log(
        `   ${String(px).padStart(14)} ${l.top.toFixed(0).padStart(7)} ${l.tapado.toFixed(0).padStart(8)} ${`${(vis * 100).toFixed(0)} %`.padStart(9)}`,
      )
    }

    console.log(`
2 · EL CURSOR SIGUE LA CABEZA DE TIPEO`)
    console.log(`   ${'px de seccion'.padStart(14)} ${'escala'.padStart(7)} ${'cursor'.padStart(8)} ${'texto'.padStart(8)} ${'desfase'.padStart(8)}`)
    // El CTA arranca en el px 6.036 de la seccion: lo publica `geometria.ts`.
    // El CTA es el cuarto de la cascada: nace cuando la tercera llega al relevo.
    // Su ventana arranca en el px 9.418 de la seccion y llega a su tamano en 13.348.
    for (const px of [9418, 10200, 11000, 11700, 12300, 12800, 13100, 13348, 14000]) {
      await posarEn(p, trabajos.top + px, 1200)
      const l = await medir<Cursor | null>(p, SONDA_DEL_CURSOR)
      if (l === null) {
        console.log(`   ${String(px).padStart(14)}   (no hay CTA)`)
        continue
      }
      console.log(
        `   ${String(px).padStart(14)} ${l.escala.toFixed(3).padStart(7)} ${l.cursor.toFixed(0).padStart(8)} ${l.texto.toFixed(0).padStart(8)} ${(l.cursor - l.texto).toFixed(0).padStart(8)}`,
      )
    }

    console.log(`\n3 · «NUESTROS SERVICIOS» — el pin engancha en el px 0 de la seccion`)
    console.log(`   ${'px de seccion'.padStart(14)} ${'top'.padStart(7)} ${'tapado'.padStart(8)} ${'visible'.padStart(9)}`)
    for (const px of [-900, -700, -500, -300, -150, 0, 300, 600, 900]) {
      await posarEn(p, servicios.top + px)
      const l = await medir<Tapado | null>(p, SONDA_DEL_RODILLO)
      if (l === null) {
        console.log(`   ${String(px).padStart(14)}   (no hay rodillo)`)
        continue
      }
      const vis = l.alto === 0 ? 0 : Math.max(0, l.alto - l.tapado) / l.alto
      console.log(
        `   ${String(px).padStart(14)} ${l.top.toFixed(0).padStart(7)} ${l.tapado.toFixed(0).padStart(8)} ${`${(vis * 100).toFixed(0)} %`.padStart(9)}`,
      )
    }

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
