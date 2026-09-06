/**
 * FRENTE C · `prefers-reduced-motion` — lo que B1 no pudo emular.
 *
 *     npx tsx scripts-b4/c-reducido.ts
 *
 * B1 no tenía navegador y esta verificación quedó abierta. Ahora se puede:
 * `Emulation.setEmulatedMedia` pone la preferencia de verdad, y **la herramienta
 * MCP no expone eso** — es una de las razones por las que el banco maneja su
 * propio Chrome (`MEDICION-B4.md` §0).
 *
 * ── La política declarada, contra la que se mide ──────────────────────────
 *
 * `_lib/motion/reducido.ts` dice, textual: **«no se montan»**. No «más rápido»,
 * no «sin desplazamiento»: *el motor de progreso no se instancia, el divisor de
 * líneas no corre, y el contenido se renderiza directamente en su estado final*.
 *
 * Entonces se miden tres cosas, y la tercera es la que importa de verdad:
 *   1. **Cero transformadas y cero `will-change` en estilo en línea.**
 *   2. **El divisor de líneas no corrió**: cero `data-lineas-piezas` en el DOM
 *      (`_lib/motion/lineas.ts`).
 *   3. **El contenido está COMPLETO.** Una preferencia de accesibilidad que
 *      además esconde texto no es una mejora: es un defecto más grave que el
 *      movimiento que evita. Se compara el texto visible con y sin.
 *
 * ── El control positivo, que es obligatorio acá más que en ningún lado ────
 *
 * La misma medición SIN la preferencia **tiene que dar** transformadas y texto
 * partido. Sin esa mitad, la primera pasaría en verde aunque el sistema de
 * movimiento estuviera roto y no montara nada nunca — que es exactamente el modo
 * de falla que `reducido.invariant.tsx` ya cuida en el servidor, y que acá hay
 * que volver a cuidar porque el navegador es otro ambiente.
 */

import { readFileSync } from 'node:fs'

import { rutaDeCaptura } from './capturas'
import { capturarRegion } from './captura'
import { dos, guardarJson, mudarLasCapturas, rutaTemporal, type CapturaPendiente } from './c-comun'
import { cerrarChrome, lanzarChrome, perfilDeChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { documento } from './sitio'

/**
 * Barre el documento entero parando cada media pantalla, porque **el sistema de
 * movimiento se monta al entrar al viewport**: una lectura hecha sólo arriba de
 * todo daría cero transformadas aunque el sistema estuviera vivo más abajo.
 */
const BARRIDO = `(async () => {
  const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
  const paso = Math.round(window.innerHeight / 2)
  const fin = document.documentElement.scrollHeight - window.innerHeight
  let conTransform = 0, conWillChange = 0, conEstilo = 0
  const ejemplos = []
  for (let y = 0; y <= fin; y += paso) {
    window.scrollTo(0, y)
    await raf2()
    await dormir(220)
    for (const el of document.querySelectorAll('*')) {
      const s = el.getAttribute('style')
      if (s === null || s.length === 0) continue
      conEstilo += 1
      if (s.includes('transform')) {
        conTransform += 1
        if (ejemplos.length < 6) ejemplos.push({ y, tag: el.tagName.toLowerCase(), estilo: s.slice(0, 120) })
      }
      if (s.includes('will-change')) conWillChange += 1
    }
  }
  window.scrollTo(0, 0)
  await raf2()
  return {
    conTransform,
    conWillChange,
    conEstilo,
    ejemplos,
    piezasDeLineas: document.querySelectorAll('[data-lineas-piezas]').length,
    textoAccesible: document.querySelectorAll('[data-lineas-accesible]').length,
    textoVisible: document.body.innerText.replace(/\\s+/g, ' ').trim(),
    paneles: document.querySelectorAll('[data-panel]').length,
  }
})()`

interface Barrido {
  readonly conTransform: number
  readonly conWillChange: number
  readonly conEstilo: number
  readonly ejemplos: readonly { readonly y: number; readonly tag: string; readonly estilo: string }[]
  readonly piezasDeLineas: number
  readonly textoAccesible: number
  readonly textoVisible: string
  readonly paneles: number
}

async function barrer(perfilId: string, reducido: boolean, pendientes: CapturaPendiente[]): Promise<Barrido & { readonly alturaDelDocumento: number }> {
  const perfil = perfilPorId(perfilId)
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome('c'),
    ancho: Math.max(perfil.ancho, 520),
    alto: Math.min(perfil.alto + 120, 1160),
  })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil, { movimientoReducido: reducido })
    await irA(p, 'http://localhost:3002/v3')
    await verificarLaPagina(p, perfil)
    const confirmacion = await medir<boolean>(p, `window.matchMedia('(prefers-reduced-motion: reduce)').matches`)
    if (confirmacion !== reducido) {
      throw new Error(`la emulación no tomó: matchMedia devolvió ${confirmacion}, se pidió ${reducido}`)
    }
    const doc = await documento(p)
    const b = await medir<Barrido>(p, BARRIDO)
    if (reducido) {
      const temporal = rutaTemporal(`${perfilId}-reducido.png`)
      await capturarRegion(p, temporal, { y: 0, alto: perfil.alto, ancho: perfil.ancho })
      pendientes.push({ temporal, destino: rutaDeCaptura('c', perfilId, 'reducido') })
    }
    await cerrarPagina(p)
    return { ...b, alturaDelDocumento: doc.alturaPx }
  } finally {
    await cerrarChrome(chrome)
  }
}

async function principal(): Promise<void> {
  const pendientes: CapturaPendiente[] = []
  const filas: Record<string, unknown>[] = []

  for (const perfilId of ['1920', '375']) {
    const con = await barrer(perfilId, true, pendientes)
    const sin = await barrer(perfilId, false, pendientes)

    const palabrasCon = new Set(con.textoVisible.split(' ').filter((w) => w.length > 2))
    const palabrasSin = new Set(sin.textoVisible.split(' ').filter((w) => w.length > 2))
    const faltanConLaPreferencia = [...palabrasSin].filter((w) => !palabrasCon.has(w))

    const fila = {
      perfil: perfilId,
      conLaPreferencia: {
        elementosConTransform: con.conTransform,
        elementosConWillChange: con.conWillChange,
        elementosConEstiloEnLinea: con.conEstilo,
        piezasDeLineas: con.piezasDeLineas,
        textoAccesibleMarcado: con.textoAccesible,
        paneles: con.paneles,
        alturaDelDocumento: con.alturaDelDocumento,
        caracteresDeTexto: con.textoVisible.length,
      },
      sinLaPreferencia: {
        elementosConTransform: sin.conTransform,
        elementosConWillChange: sin.conWillChange,
        elementosConEstiloEnLinea: sin.conEstilo,
        piezasDeLineas: sin.piezasDeLineas,
        textoAccesibleMarcado: sin.textoAccesible,
        paneles: sin.paneles,
        alturaDelDocumento: sin.alturaDelDocumento,
        caracteresDeTexto: sin.textoVisible.length,
        ejemplosDeTransform: sin.ejemplos,
      },
      afirmaciones: [
        { que: 'con la preferencia NO se escribe una sola transformada en línea', pasa: con.conTransform === 0, detalle: `${con.conTransform}` },
        { que: 'ni un solo `will-change`', pasa: con.conWillChange === 0, detalle: `${con.conWillChange}` },
        { que: 'y el divisor de líneas NO corrió', pasa: con.piezasDeLineas === 0, detalle: `${con.piezasDeLineas} piezas` },
        { que: 'las ocho secciones están', pasa: con.paneles === 8, detalle: `${con.paneles} paneles` },
        {
          que: 'y el contenido está COMPLETO: ninguna palabra que se vea sin la preferencia falta con ella',
          pasa: faltanConLaPreferencia.length === 0,
          detalle: faltanConLaPreferencia.length === 0 ? 'ninguna' : faltanConLaPreferencia.slice(0, 12).join(' · '),
        },
      ],
      controlesPositivos: [
        {
          nombre: 'SIN la preferencia el sistema SÍ escribe transformadas — la primera mitad no es verde por vacío',
          pasa: sin.conTransform > 0,
          detalle: `${sin.conTransform} elementos con transform en línea`,
        },
        {
          nombre: 'y SÍ parte el texto en líneas',
          pasa: sin.piezasDeLineas > 0,
          detalle: `${sin.piezasDeLineas} piezas`,
        },
      ],
      relacionDeTexto: dos(con.textoVisible.length / Math.max(1, sin.textoVisible.length)),
      palabrasQueFaltanConLaPreferencia: faltanConLaPreferencia.slice(0, 40),
    }
    filas.push(fila)

    console.log(`\n── ${perfilId} ──`)
    for (const a of fila.afirmaciones) console.log(`  ${a.pasa ? 'ok  ' : 'FALLA'} ${a.que} — ${a.detalle}`)
    for (const c of fila.controlesPositivos) console.log(`  ${c.pasa ? 'ok  ' : 'FALLA'} [control] ${c.nombre} — ${c.detalle}`)
  }

  mudarLasCapturas(pendientes)
  for (const p of pendientes) console.log(`  captura → ${p.destino} (${(readFileSync(p.destino).length / 1024).toFixed(1)} KiB)`)

  const ruta = guardarJson('c-reducido.json', {
    que: '`prefers-reduced-motion: reduce`, emulado con Emulation.setEmulatedMedia',
    instrumento: 'scripts-b4/c-reducido.ts — barrido del documento entero parando cada media pantalla',
    emulado: true,
    politicaDeclarada:
      '`_lib/motion/reducido.ts`: «no se montan». El motor de progreso no se instancia, el divisor de líneas no corre, y el contenido se renderiza directamente en su estado final.',
    porQueBarreYNoMiraArriba:
      'el sistema de movimiento se monta al entrar al viewport: una lectura hecha sólo arriba de todo daría cero transformadas aunque el sistema estuviera vivo más abajo.',
    filas,
  })
  console.log(`\n→ ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
