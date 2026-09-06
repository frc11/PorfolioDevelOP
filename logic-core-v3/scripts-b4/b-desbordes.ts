/**
 * FRENTE B · 6 — DESBORDES HORIZONTALES, el defecto más común y más feo en
 * móvil.
 *
 * ── Dos preguntas distintas, y las dos hacen falta ────────────────────────
 *
 * 1. **¿HAY desborde?** `documento()` compara `scrollWidth` del documento contra
 *    `innerWidth`. Es el detector más barato que existe y dice sí o no.
 * 2. **¿QUIÉN lo causa?** El detector de arriba **no lo dice**, y además puede
 *    dar que no hay desborde y haberlo igual: un ancestro con `overflow: hidden`
 *    recorta al hijo que se pasa y `scrollWidth` no se entera. Por eso este
 *    archivo barre el DOM buscando cajas que cruzan el borde derecho del
 *    viewport, y se queda con **el ancestro más alto que lo hace** — el
 *    culpable, no sus hijos, que heredan el problema y ensucian la lista.
 *
 * ── ⚠️ Y se barre el DOCUMENTO ENTERO, no el primer viewport ─────────────
 *
 * Un desborde puede aparecer recién en una sección pinneada, con el contenido ya
 * transformado. Una lectura con el scroll en 0 no lo ve.
 */

import { capturarRegion } from './captura'
import { rutaDeCaptura } from './capturas'
import { medir } from './navegador'
import { PERFILES_DEBAJO_DEL_UMBRAL, perfilPorId, type Perfil } from './perfiles'
import { documento, type Documento } from './sitio'
import { asegurarCarpetaDeCapturas, conLaPagina, dos, FRENTE, guardarJson, procedencia } from './b-comun'

/** Los cuatro del frente, más `1920` como control del otro lado del umbral. */
const A_MEDIR: readonly Perfil[] = [...PERFILES_DEBAJO_DEL_UMBRAL, perfilPorId('1920')]

/** Subpíxel de layout. Menos que esto es redondeo, no desborde. */
const TOLERANCIA_PX = 0.5
/** Cuántos culpables se capturan por perfil. La lista entera va igual al JSON. */
const CAPTURAS_MAXIMAS = 3

interface Culpable {
  readonly etiqueta: string
  readonly clases: string
  readonly panel: string | null
  readonly ruta: string
  readonly derechaPx: number
  readonly izquierdaPx: number
  readonly anchoPx: number
  readonly excesoDerechaPx: number
  readonly excesoIzquierdaPx: number
  readonly documentoY: number
  readonly vistoEnScrollY: number
  readonly recortadoPorAncestro: boolean
}

function fuente(paso: number, hasta: number, tolerancia: number): string {
  return `(async () => {
  const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const ruta = (el) => {
    const p = []
    let n = el
    while (n !== null && n.parentElement !== null) {
      p.push(n.tagName.toLowerCase() + ':' + [...n.parentElement.children].indexOf(n))
      n = n.parentElement
    }
    return p.reverse().join('/')
  }
  const seDesborda = (el) => {
    const e = getComputedStyle(el)
    if (e.display === 'none' || e.visibility === 'hidden') return null
    const r = el.getBoundingClientRect()
    if (r.width <= 0 || r.height <= 0) return null
    const der = r.right - window.innerWidth
    const izq = -r.left
    if (der <= ${tolerancia} && izq <= ${tolerancia}) return null
    return { r, der: Math.max(0, der), izq: Math.max(0, izq) }
  }
  const recortado = (el) => {
    let a = el.parentElement
    while (a !== null) {
      const ea = getComputedStyle(a)
      if (ea.overflowX !== 'visible') return true
      a = a.parentElement
    }
    return false
  }
  const vistos = new Map()
  for (let y = 0; y <= ${hasta}; y += ${paso}) {
    window.scrollTo(0, y)
    await raf2()
    const real = window.scrollY
    for (const el of document.querySelectorAll('body *')) {
      const d = seDesborda(el)
      if (d === null) continue
      // ⚠️ El culpable es el ancestro MÁS ALTO que se desborda. Si el padre
      // también se desborda, este elemento sólo lo hereda y no se lista.
      if (el.parentElement !== null && el.parentElement !== document.body && seDesborda(el.parentElement) !== null) continue
      const k = ruta(el)
      const anterior = vistos.get(k)
      if (anterior !== undefined && anterior.excesoDerechaPx >= d.der) continue
      let panel = null
      let b = el
      while (b !== null) { if (b.dataset && b.dataset.panel !== undefined) { panel = b.dataset.panel; break } b = b.parentElement }
      vistos.set(k, {
        etiqueta: el.tagName.toLowerCase(),
        clases: String(el.className).slice(0, 200),
        panel,
        ruta: k,
        derechaPx: Math.round(d.r.right * 100) / 100,
        izquierdaPx: Math.round(d.r.left * 100) / 100,
        anchoPx: Math.round(d.r.width * 100) / 100,
        excesoDerechaPx: Math.round(d.der * 100) / 100,
        excesoIzquierdaPx: Math.round(d.izq * 100) / 100,
        documentoY: Math.round(d.r.top + real),
        vistoEnScrollY: real,
        recortadoPorAncestro: recortado(el),
      })
    }
  }
  window.scrollTo(0, 0)
  return [...vistos.values()].sort((a, b) => b.excesoDerechaPx - a.excesoDerechaPx)
})()`
}

interface Fila {
  readonly perfil: string
  readonly ancho: number
  readonly debajoDelUmbral: boolean
  readonly documento: Documento
  readonly desbordeDeDocumento: boolean
  readonly excesoDeDocumentoPx: number
  readonly culpables: readonly Culpable[]
  readonly capturas: readonly string[]
}

async function principal(): Promise<void> {
  asegurarCarpetaDeCapturas()
  const filas: Fila[] = []

  for (const perfil of A_MEDIR) {
    const fila = await conLaPagina(perfil, '/v3', async ({ pagina }) => {
      const doc = await documento(pagina)
      const paso = Math.max(1, Math.round(doc.ventanaPx / 2))
      const hasta = Math.max(0, doc.alturaPx - doc.ventanaPx)
      const culpables = await medir<Culpable[]>(pagina, fuente(paso, hasta, TOLERANCIA_PX))
      const capturas: string[] = []
      const anchoDeCaptura = Math.max(doc.anchoDelDocumento, doc.anchoDeLaVentana)
      for (const [i, c] of culpables.slice(0, CAPTURAS_MAXIMAS).entries()) {
        const asunto = culpables.length === 1 ? 'desborde' : `desborde-${i + 1}`
        const destino = rutaDeCaptura(FRENTE, perfil.id, asunto)
        const y = Math.max(0, Math.min(hasta, Math.round(c.documentoY)))
        await capturarRegion(pagina, destino, { y, alto: Math.min(doc.ventanaPx, doc.alturaPx - y), ancho: anchoDeCaptura })
        capturas.push(destino)
      }
      return {
        perfil: perfil.id,
        ancho: perfil.ancho,
        debajoDelUmbral: perfil.debajoDelUmbral,
        documento: doc,
        desbordeDeDocumento: doc.anchoDelDocumento > doc.anchoDeLaVentana,
        excesoDeDocumentoPx: dos(doc.anchoDelDocumento - doc.anchoDeLaVentana),
        culpables,
        capturas,
      }
    })
    filas.push(fila)
    console.log(
      `\n── ${fila.perfil} · scrollWidth ${fila.documento.anchoDelDocumento} vs innerWidth ${fila.documento.anchoDeLaVentana}` +
        `${fila.desbordeDeDocumento ? `  ⚠️ DESBORDE DE DOCUMENTO (+${fila.excesoDeDocumentoPx} px)` : '  (sin desborde de documento)'}` +
        ` · ${fila.culpables.length} cajas cruzan el borde ──`,
    )
    for (const c of fila.culpables.slice(0, 10)) {
      console.log(
        `  ${(c.panel ?? '—').padEnd(16)} <${c.etiqueta}> +${c.excesoDerechaPx} px a la derecha` +
          `${c.excesoIzquierdaPx > 0 ? ` / +${c.excesoIzquierdaPx} px a la izquierda` : ''}` +
          ` · ancho ${c.anchoPx} · y=${c.documentoY} · ${c.recortadoPorAncestro ? 'RECORTADO por un ancestro' : 'NO recortado — empuja el documento'}` +
          `  clases="${c.clases.slice(0, 70)}"`,
      )
    }
  }

  const ruta = guardarJson('desbordes', {
    procedencia: procedencia(
      'scripts-b4/b-desbordes.ts',
      `dos detectores: scrollWidth del documento contra innerWidth, y un barrido del DOM con paso de media pantalla quedándose con el ancestro más alto cuya caja cruza el borde (tolerancia ${TOLERANCIA_PX} px). Sin estrangular. Emulado.`,
    ),
    porQueDosDetectores:
      'un ancestro con overflow-x distinto de visible recorta al hijo que se pasa, y scrollWidth no se entera: el primer detector puede decir «no hay desborde» y haberlo igual. `recortadoPorAncestro` distingue los dos casos fila por fila.',
    filas,
  })
  console.log(`\n→ ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
