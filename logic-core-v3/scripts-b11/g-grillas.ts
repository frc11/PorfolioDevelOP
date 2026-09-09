/**
 * G · LA GEOMETRÍA DE LAS GRILLAS, LEÍDA DEL NAVEGADOR — para traducir la zona
 * libre (píxeles del viewport) a columnas del sistema, ancho por ancho.
 *
 *     npx tsx scripts-b11/g-grillas.ts [--perfil=1440,1920,2560]
 *
 * No captura nada: lee cajas. Por sección, la caja de contenido del
 * `Envoltorio`, la columna lateral, y cada grilla (`data-pieza="grilla"` con su
 * `data-columnas`, y las composiciones de doce columnas de Quiénes somos y
 * Números por `data-composicion`) con los bordes de sus columnas calculados
 * de la caja y de la canaleta computada. El texto se mueve en columnas; el
 * obstáculo se midió en píxeles: esta tabla es el puente.
 */

import { medir, scrollA } from '../scripts-b4/navegador'

import { LAS_SEIS, PERFILES_DE_B11, argumento, asentarElHome, conElHome, dos, jsonPendiente, mudarPendientes, perfilDeB11 } from './b11-comun'

const LECTOR = `(() => {
  const salida = {}
  const ventana = { ancho: innerWidth, alto: innerHeight }
  for (const panel of document.querySelectorAll('[data-panel]')) {
    const id = panel.dataset.panel
    const contenido = panel.querySelector('[data-parte="contenido"]')
    const rc = contenido === null ? null : contenido.getBoundingClientRect()
    const grillas = []
    for (const g of panel.querySelectorAll('[data-pieza="grilla"], [data-composicion]')) {
      const r = g.getBoundingClientRect()
      const cs = getComputedStyle(g)
      const columnas = cs.gridTemplateColumns.split(' ').filter((c) => c.length > 0)
      const canal = parseFloat(cs.columnGap) || 0
      const bordes = []
      let x = r.left
      for (const c of columnas) {
        const w = parseFloat(c)
        bordes.push({ desde: Math.round(x * 10) / 10, hasta: Math.round((x + w) * 10) / 10 })
        x += w + canal
      }
      grillas.push({
        pieza: g.getAttribute('data-composicion') === null ? 'grilla' : 'composicion',
        nombre: g.getAttribute('data-composicion') ?? g.getAttribute('data-columnas'),
        pantalla: (g.closest('[data-pantalla]') || {}).getAttribute?.('data-pantalla') ?? null,
        x: Math.round(r.left * 10) / 10, ancho: Math.round(r.width * 10) / 10, topDoc: Math.round((r.top + scrollY) * 10) / 10,
        columnas: columnas.length, canal, bordes,
      })
    }
    salida[id] = { contenido: rc === null ? null : { x: Math.round(rc.left * 10) / 10, ancho: Math.round(rc.width * 10) / 10 }, grillas }
  }
  return { ventana, secciones: salida }
})()`

interface Grilla {
  readonly pieza: string
  readonly nombre: string | null
  readonly pantalla: string | null
  readonly x: number
  readonly ancho: number
  readonly topDoc: number
  readonly columnas: number
  readonly canal: number
  readonly bordes: readonly { readonly desde: number; readonly hasta: number }[]
}

interface Lectura {
  readonly ventana: { readonly ancho: number; readonly alto: number }
  readonly secciones: Readonly<Record<string, { readonly contenido: { readonly x: number; readonly ancho: number } | null; readonly grillas: readonly Grilla[] }>>
}

async function principal(): Promise<void> {
  const perfiles = argumento('perfil', PERFILES_DE_B11.map((p) => p.id).join(',')).split(',')
  const todo: Record<string, Lectura> = {}
  for (const id of perfiles) {
    const perfil = perfilDeB11(id)
    todo[id] = await conElHome(perfil, async (s) => {
      await asentarElHome(s)
      // Con el scroll en cero las transformadas de entrada no mueven las grillas: son contenedores, no piezas.
      await scrollA(s.pagina, 0)
      return medir<Lectura>(s.pagina, LECTOR)
    }, 'b11-grillas')
    console.log(`\n═══ ${id} — ventana ${todo[id].ventana.ancho}×${todo[id].ventana.alto}`)
    for (const sec of LAS_SEIS) {
      const l = todo[id].secciones[sec]
      if (l === undefined) continue
      console.log(`── ${sec}: contenido x ${l.contenido?.x ?? '—'} ancho ${l.contenido?.ancho ?? '—'}`)
      for (const g of l.grillas) {
        console.log(`    ${g.pieza.padEnd(11)} ${String(g.nombre).padEnd(9)} ${(g.pantalla ?? '').padEnd(8)} x ${String(g.x).padStart(7)} ancho ${String(g.ancho).padStart(7)} · ${g.columnas} col · canal ${g.canal} · bordes ${g.bordes.map((b) => `${Math.round(b.desde)}–${Math.round(b.hasta)}`).join(' ')}`)
      }
    }
  }
  jsonPendiente('grillas', { perfiles: todo, dos: dos(1) })
  for (const r of mudarPendientes()) console.log(`escrito: ${r}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
