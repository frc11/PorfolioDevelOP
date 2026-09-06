/**
 * FRENTE B · 5 — LOS PINES QUE SOBREVIVEN ABAJO DEL UMBRAL, con scroll real.
 *
 * ── ⚠️ POR QUÉ NUNCA POR GEOMETRÍA ───────────────────────────────────────
 *
 * `MEDICION-NAVEGADOR.md` §2: «un pin *verificado* comparando alturas no está
 * verificado: `position: sticky` se apaga en silencio con cualquier ancestro de
 * `overflow` distinto de `visible`, sin un error en consola, **y la geometría de
 * la caja no cambia cuando eso pasa**». Acá el scroll se mueve de verdad y en
 * cada parada se lee dónde quedó el elemento pegado.
 *
 * ── Cómo se decide que un pin ANDA ────────────────────────────────────────
 *
 * Está pegado en una parada cuando su `top` de viewport se queda clavado en su
 * offset de `sticky` mientras el scroll avanza. **Arranca** en la primera parada
 * pegada, **suelta** en la última, y recorre la diferencia. Se exige recorrer más
 * de un paso: una sola parada pegada no es un pin, es el instante en que la caja
 * pasa por el offset.
 *
 * Un `position: sticky` que no queda pegado en ninguna parada es un sticky
 * apagado — y para poder decir por qué sin tocar código, cada uno reporta el
 * primer ancestro con `overflow` distinto de `visible`.
 *
 * ── ⚠️ Y por qué el barrido corre ADENTRO de la página ───────────────────
 *
 * Un barrido de ~250 paradas con dos llamadas de CDP por parada tarda minutos y
 * se cruza con la recarga sola de `next dev` (medida en `b-vigilia-canvas.json`).
 * Adentro de la página el mismo barrido tarda segundos. Es la misma partición
 * que usa `censo.ts`: la página hace lo que sólo la página puede hacer.
 */

import { medir } from './navegador'
import { perfilPorId, type Perfil } from './perfiles'
import { documento } from './sitio'
import { conLaPagina, dos, guardarJson, procedencia } from './b-comun'

/** Los cuatro del frente, más `1025` y `1920` como control del otro lado. */
const A_MEDIR: readonly Perfil[] = ['375', '393', '768', '1024', '1025', '1920'].map(perfilPorId)

/** Tolerancia para decir «se quedó clavado». Subpíxel de layout, no más. */
const TOLERANCIA_PX = 1.5
const PASO_PX = 60

interface Sticky {
  readonly clases: string
  readonly etiqueta: string
  readonly panel: string | null
  readonly topDeclarado: string
  readonly offsetPx: number
  readonly altoPx: number
  readonly ancestroQueRecorta: string | null
  readonly overflowDelAncestro: string | null
  /** `[scrollY, top de viewport]` en cada parada del barrido. */
  readonly serie: readonly (readonly [number, number])[]
}

function fuente(hasta: number): string {
  return `(async () => {
  const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const stickies = []
  for (const el of document.querySelectorAll('*')) {
    const e = getComputedStyle(el)
    if (e.position !== 'sticky') continue
    let recorta = null, overflow = null
    let a = el.parentElement
    while (a !== null) {
      const ea = getComputedStyle(a)
      const o = ea.overflow + ' ' + ea.overflowX + ' ' + ea.overflowY
      if (o !== 'visible visible visible') { recorta = a.tagName.toLowerCase() + '.' + String(a.className); overflow = o; break }
      a = a.parentElement
    }
    let panel = null
    let b = el
    while (b !== null) { if (b.dataset && b.dataset.panel !== undefined) { panel = b.dataset.panel; break } b = b.parentElement }
    stickies.push({
      el,
      clases: String(el.className),
      etiqueta: el.tagName.toLowerCase(),
      panel,
      topDeclarado: e.top,
      offsetPx: e.top === 'auto' ? 0 : parseFloat(e.top),
      altoPx: Math.round(el.getBoundingClientRect().height * 100) / 100,
      ancestroQueRecorta: recorta,
      overflowDelAncestro: overflow,
      serie: [],
    })
  }
  for (let y = 0; y <= ${hasta}; y += ${PASO_PX}) {
    window.scrollTo(0, y)
    await raf2()
    const real = window.scrollY
    for (const s of stickies) s.serie.push([real, Math.round(s.el.getBoundingClientRect().top * 100) / 100])
  }
  window.scrollTo(0, 0)
  return stickies.map((s) => ({
    clases: s.clases, etiqueta: s.etiqueta, panel: s.panel, topDeclarado: s.topDeclarado,
    offsetPx: s.offsetPx, altoPx: s.altoPx, ancestroQueRecorta: s.ancestroQueRecorta,
    overflowDelAncestro: s.overflowDelAncestro, serie: s.serie,
  }))
})()`
}

interface Pin {
  readonly panel: string | null
  readonly etiqueta: string
  readonly clases: string
  readonly offsetPx: number
  readonly altoPx: number
  readonly ancestroQueRecorta: string | null
  readonly overflowDelAncestro: string | null
  readonly anda: boolean
  readonly arrancaEnScrollY: number | null
  readonly sueltaEnScrollY: number | null
  readonly recorrePx: number | null
  readonly recorrePantallas: number | null
  readonly paradasPegado: number
  readonly paradasTotales: number
}

function resolver(s: Sticky, ventana: number): Pin {
  const pegado = s.serie.filter(([y, top]) => y > 0 && Math.abs(top - s.offsetPx) <= TOLERANCIA_PX).map(([y]) => y)
  const arranca = pegado.length === 0 ? null : Math.min(...pegado)
  const suelta = pegado.length === 0 ? null : Math.max(...pegado)
  const recorre = arranca === null || suelta === null ? null : suelta - arranca
  return {
    panel: s.panel,
    etiqueta: s.etiqueta,
    clases: s.clases,
    offsetPx: s.offsetPx,
    altoPx: s.altoPx,
    ancestroQueRecorta: s.ancestroQueRecorta,
    overflowDelAncestro: s.overflowDelAncestro,
    anda: recorre !== null && recorre > PASO_PX,
    arrancaEnScrollY: arranca,
    sueltaEnScrollY: suelta,
    recorrePx: recorre,
    recorrePantallas: recorre === null ? null : dos(recorre / ventana),
    paradasPegado: pegado.length,
    paradasTotales: s.serie.length,
  }
}

async function principal(): Promise<void> {
  const filas: {
    readonly perfil: string
    readonly ancho: number
    readonly debajoDelUmbral: boolean
    readonly stickyEncontrados: number
    readonly pinesQueAndan: number
    readonly pines: readonly Pin[]
  }[] = []

  for (const perfil of A_MEDIR) {
    const fila = await conLaPagina(perfil, '/v3', async ({ pagina }) => {
      const doc = await documento(pagina)
      const hasta = Math.max(0, doc.alturaPx - doc.ventanaPx)
      const crudos = await medir<Sticky[]>(pagina, fuente(hasta))
      const pines = crudos.map((s) => resolver(s, doc.ventanaPx))
      return {
        perfil: perfil.id,
        ancho: perfil.ancho,
        debajoDelUmbral: perfil.debajoDelUmbral,
        stickyEncontrados: crudos.length,
        pinesQueAndan: pines.filter((p) => p.anda).length,
        pines,
      }
    })
    filas.push(fila)
    console.log(`\n── ${perfil.id} · ${fila.stickyEncontrados} con position:sticky · ${fila.pinesQueAndan} andan ──`)
    for (const p of fila.pines) {
      console.log(
        `  ${(p.panel ?? '(sin panel)').padEnd(16)} ${p.anda ? 'ANDA' : 'NO  '} ` +
          `arranca ${String(p.arrancaEnScrollY ?? '—').padStart(6)} · suelta ${String(p.sueltaEnScrollY ?? '—').padStart(6)} · ` +
          `recorre ${String(p.recorrePx ?? '—').padStart(6)} px (${p.recorrePantallas ?? '—'} pantallas) · ` +
          `top:${p.offsetPx} · alto ${p.altoPx} · recorta: ${p.ancestroQueRecorta ?? 'ninguno'}`,
      )
    }
  }

  const ruta = guardarJson('pines', {
    procedencia: procedencia(
      'scripts-b4/b-pines.ts',
      `barrido de scroll REAL con paso ${PASO_PX} px; «pegado» = el top de viewport queda a ${TOLERANCIA_PX} px del offset declarado, y se exige recorrer más de un paso. Nunca por geometría. Sin estrangular. Emulado.`,
    ),
    b1CitadoNoComparable: {
      fuente: 'B1, a 1920, con un instrumento que ya no existe en el repo',
      pines: [
        { panel: 'trabajos', deScrollY: 4320, aScrollY: 6480 },
        { panel: 'servicios', deScrollY: 7560, aScrollY: 9720 },
      ],
      advertencia: 'se cita; el 1920 de este JSON es el que se mide con este banco.',
    },
    reglaDelFuente: 'compuerta.ts: «El `sticky` SÍ cruza» el umbral de 1025.',
    filas,
  })
  console.log(`\n→ ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
