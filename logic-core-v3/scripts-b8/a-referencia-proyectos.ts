/**
 * LA REFERENCIA, SEGUNDA NAVEGACIÓN — sólo su sección de proyectos, contra el scroll.
 *
 *     npx tsx scripts-b8/a-referencia-proyectos.ts
 *
 * ⚠️ **Por qué hay una segunda navegación, y se declara.** `a-referencia.ts`
 * buscó planos con `matrix3d` porque eso es lo que B2 había medido en su
 * momento, y en las 23 pantallas de hoy no hay ninguno: su efecto de proyectos
 * es 2D —opacidad y, si la hay, escala— sobre un campo negro. La primera
 * navegación dejó la luminancia, el contraste, las partículas y el fondo; ésta
 * lee lo que aquélla no leía: TODO elemento con transformación (2D o 3D) u
 * opacidad menor que uno en su región de proyectos, cada octavo de pantalla,
 * para saber desde qué escala vienen, cuánto scroll tardan, cuántos proyectos
 * hay en cuadro a la vez y de qué piezas se compone cada uno.
 *
 * Por propiedad computada, sin un selector suyo. La región se toma de la
 * primera corrida: las pantallas de sala negra (luminancia < 0,005), más una
 * pantalla a cada lado.
 */

import { readFileSync } from 'node:fs'

import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'

import { PERFIL, PUENTE_DE_AUTOMATIZACION, RAIZ_DE_SALIDAS, asegurarCarpetas, conLaPagina, guardarJson } from './b8-comun'

const ORIGEN_DE_LA_REFERENCIA = 'https://www.nk.studio'
const ATRIBUTO = 'data-b8-pieza'

interface PiezaLeida {
  readonly id: number
  readonly etiqueta: string
  readonly transformacion: 'ninguna' | '2d' | '3d'
  readonly escala: number
  readonly z: number
  readonly opacidad: number
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
  readonly enCuadro: boolean
  readonly esMedio: boolean
  readonly medios: number
  readonly caracteres: number
  readonly cuerpoPx: number
  readonly texto: string
  readonly filtro: string
  readonly mezcla: string
}

/** Cada elemento visible del viewport con transformación u opacidad < 1, sin ancestro que ya cumpla lo mismo. */
const LECTOR = `(() => {
  const marca = ${JSON.stringify(ATRIBUTO)}
  if (window.__b8Pieza === undefined) window.__b8Pieza = 0
  const cs = (el) => getComputedStyle(el)
  const animado = (el) => { const s = cs(el); return s.transform !== 'none' || parseFloat(s.opacity) < 1 }
  const opacidadEfectiva = (el) => { let o = 1; let n = el; while (n !== null && n !== document.documentElement) { o *= parseFloat(cs(n).opacity); n = n.parentElement } return o }
  const salida = []
  for (const el of document.querySelectorAll('body *')) {
    if (!animado(el)) continue
    const r = el.getBoundingClientRect()
    if (r.width < 24 || r.height < 12) continue
    if (r.bottom < -innerHeight || r.top > 2 * innerHeight) continue
    let a = el.parentElement, anidado = false
    while (a !== null && a !== document.body) { if (animado(a)) { anidado = true; break } a = a.parentElement }
    if (anidado) continue
    const s = cs(el)
    const m = (s.transform.match(/-?[0-9.e+-]+/g) || []).map(Number)
    let tipo = 'ninguna', escala = 1, z = 0
    if (s.transform.startsWith('matrix3d(') && m.length === 16) { tipo = '3d'; escala = Math.hypot(m[0], m[1]); z = m[14] }
    else if (s.transform.startsWith('matrix(') && m.length === 6) { tipo = '2d'; escala = Math.hypot(m[0], m[1]) }
    if (!el.hasAttribute(marca)) { el.setAttribute(marca, String(window.__b8Pieza)); window.__b8Pieza += 1 }
    let cuerpo = 0
    for (const t of [el, ...el.querySelectorAll('*')]) { const fs = parseFloat(cs(t).fontSize); if (fs > cuerpo && (t.textContent || '').trim().length > 0) cuerpo = fs }
    const tag = el.tagName.toLowerCase()
    salida.push({
      id: Number(el.getAttribute(marca)), etiqueta: tag, transformacion: tipo, escala, z,
      opacidad: opacidadEfectiva(el),
      x: r.left, y: r.top, ancho: r.width, alto: r.height,
      enCuadro: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
      esMedio: tag === 'img' || tag === 'video' || tag === 'picture' || tag === 'canvas',
      medios: el.querySelectorAll('img, video, picture, canvas').length,
      caracteres: (el.innerText || '').trim().length,
      cuerpoPx: cuerpo,
      texto: (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 30),
      filtro: s.filter, mezcla: s.mixBlendMode,
    })
  }
  return salida
})()`

interface Muestra {
  readonly scrollY: number
  readonly piezas: readonly PiezaLeida[]
}

interface Primera {
  readonly pantallas: readonly { readonly scrollY: number; readonly salaMedia: number; readonly canvasEnCuadro: number }[]
  readonly inventario: { readonly ventana: number; readonly altoDelDocumento: number }
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const primera = JSON.parse(readFileSync(`${RAIZ_DE_SALIDAS}/a-referencia.json`, 'utf8')) as Primera
  const ventana = primera.inventario.ventana
  const negras = primera.pantallas.filter((p) => p.canvasEnCuadro > 0 && p.salaMedia < 0.005)
  if (negras.length === 0) throw new Error('la primera corrida no encontró pantallas de sala negra: no hay región que barrer')
  const desde = Math.max(0, negras[0].scrollY - ventana)
  const hasta = Math.min(primera.inventario.altoDelDocumento - ventana, negras[negras.length - 1].scrollY + ventana)
  const paso = ventana / 8
  console.log(`región de proyectos (sala negra ± una pantalla): y=${desde} → ${hasta}, cada ${paso} px`)

  const salida = await conLaPagina(
    PERFIL,
    '/',
    async ({ pagina }) => {
      await esperarElPrimerCuadro(pagina)
      await new Promise((r) => setTimeout(r, 4000))
      const muestras: Muestra[] = []
      for (let y = desde; y <= hasta; y += paso) {
        try {
          await scrollA(pagina, y)
          await new Promise((r) => setTimeout(r, 150))
          const piezas = await medir<PiezaLeida[]>(pagina, LECTOR)
          muestras.push({ scrollY: y, piezas })
          const enCuadro = piezas.filter((p) => p.enCuadro && p.opacidad > 0.05)
          console.log(`  y=${String(y).padStart(5)}  ${enCuadro.length} piezas visibles: ` + enCuadro.slice(0, 8).map((p) => `${p.id}<${p.etiqueta}${p.esMedio ? '·medio' : ''}> ${p.transformacion} esc ${p.escala.toFixed(2)} op ${p.opacidad.toFixed(2)} ${Math.round(p.ancho)}×${Math.round(p.alto)}@${Math.round(p.y)} «${p.texto.slice(0, 14)}»`).join(' | '))
        } catch (e) {
          console.log(`  y=${y} falló: ${e instanceof Error ? e.message.slice(0, 120) : String(e)}`)
        }
      }
      // ¿Animan por tiempo con el scroll quieto?
      const medio = desde + Math.round((hasta - desde) / 2 / paso) * paso
      await scrollA(pagina, medio)
      await new Promise((r) => setTimeout(r, 400))
      const antes = await medir<PiezaLeida[]>(pagina, LECTOR)
      await new Promise((r) => setTimeout(r, 700))
      const despues = await medir<PiezaLeida[]>(pagina, LECTOR)
      const porId = new Map(despues.map((p) => [p.id, p]))
      const seMovieron = antes.filter((p) => { const d = porId.get(p.id); return d !== undefined && (Math.abs(d.escala - p.escala) > 0.005 || Math.abs(d.opacidad - p.opacidad) > 0.02 || Math.abs(d.y - p.y) > 1) })
      console.log(`  con el scroll quieto en y=${medio} durante 700 ms: ${seMovieron.length} de ${antes.length} piezas cambiaron de escala, opacidad o posición`)
      return { desde, hasta, paso, muestras, porTiempo: { scrollY: medio, cambiaron: seMovieron.length, de: antes.length } }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION], origen: ORIGEN_DE_LA_REFERENCIA, msMaximo: 90_000 },
  )

  // ── Las trazas: por pieza, qué hizo a lo largo del scroll ──
  const trazas = new Map<number, { readonly pieza: PiezaLeida; puntos: { y: number; escala: number; opacidad: number; top: number }[] }>()
  for (const m of salida.muestras) {
    for (const p of m.piezas) {
      const t = trazas.get(p.id) ?? { pieza: p, puntos: [] }
      t.puntos.push({ y: m.scrollY, escala: p.escala, opacidad: p.opacidad, top: p.y })
      trazas.set(p.id, t)
    }
  }
  console.log('\n  trazas (piezas que cambian de escala u opacidad a lo largo del barrido):')
  for (const t of trazas.values()) {
    const esc = t.puntos.map((q) => q.escala)
    const op = t.puntos.map((q) => q.opacidad)
    const visibles = t.puntos.filter((q) => q.opacidad > 0.05)
    if (Math.max(...esc) - Math.min(...esc) < 0.01 && Math.max(...op) - Math.min(...op) < 0.05) continue
    const primero = visibles[0]
    const pleno = t.puntos.find((q) => q.opacidad >= 0.95)
    console.log(
      `    ${t.pieza.id} <${t.pieza.etiqueta}${t.pieza.esMedio ? '·medio' : ''}> ${t.pieza.transformacion} ${Math.round(t.pieza.ancho)}×${Math.round(t.pieza.alto)} cuerpo ${t.pieza.cuerpoPx.toFixed(0)} px medios ${t.pieza.medios} «${t.pieza.texto}»` +
        ` · escala ${Math.min(...esc).toFixed(3)}→${Math.max(...esc).toFixed(3)} · opacidad ${Math.min(...op).toFixed(2)}→${Math.max(...op).toFixed(2)}` +
        ` · visible de y=${primero?.y ?? '—'} a ${visibles[visibles.length - 1]?.y ?? '—'} (${visibles.length * salida.paso} px de scroll)` +
        (pleno === undefined ? ' · nunca llega a opacidad plena' : ` · plena desde y=${pleno.y}`),
    )
  }
  const porPaso = salida.muestras.map((m) => ({ y: m.scrollY, visibles: m.piezas.filter((p) => p.enCuadro && p.opacidad > 0.1 && p.cuerpoPx >= 40).length }))
  console.log(`  nombres grandes (≥40 px) en cuadro a la vez, por paso: máximo ${Math.max(...porPaso.map((p) => p.visibles))}, mediana ${porPaso.map((p) => p.visibles).sort((a, b) => a - b)[Math.floor(porPaso.length / 2)]}`)
  console.log(`  ${guardarJson('a-referencia-proyectos', { ...salida, trazas: [...trazas.values()] })}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
