/**
 * FRENTE B · 7 — EL ÁREA DE TOQUE de todo lo interactivo.
 *
 * ── Las DOS varas, y se usan las dos porque son distintas ─────────────────
 *
 * · **WCAG 2.5.8 «Target Size (Minimum)», nivel AA de WCAG 2.2 → 24×24 CSS px.**
 * · **WCAG 2.5.5 «Target Size», nivel AAA → 44×44 CSS px.**
 *
 * Un objetivo de 30×30 cumple la vara AA y no la AAA: reportar una sola cifra
 * escondería justamente el tramo donde está casi todo. Por eso la tabla parte en
 * tres —abajo de 24, entre 24 y 44, y 44 o más— y la lista de los que están
 * abajo de 24 va entera, con su tamaño y su selector.
 *
 * ── ⚠️ Se mide la caja TOCABLE, no la del glifo ──────────────────────────
 *
 * `getBoundingClientRect()` de un elemento devuelve su **caja de borde**, que
 * incluye el padding: es exactamente el área que recibe el toque. Medir el
 * `<svg>` de adentro daría 16×16 en un botón de 44×44 y sería un falso defecto.
 *
 * ── Y por qué se barre el documento entero ───────────────────────────────
 *
 * Un objetivo puede estar en `opacity: 0` hasta que su sección entra al cuadro,
 * y una caja de 0×0 no se puede medir. Se barre el scroll, se mide en cada
 * parada y se guarda **la caja más grande vista** de cada objetivo: la de cuando
 * el objetivo estaba realmente ahí para tocarse.
 */

import { medir } from './navegador'
import { PERFILES_DEBAJO_DEL_UMBRAL, perfilPorId, type Perfil } from './perfiles'
import { documento } from './sitio'
import { conLaPagina, dos, guardarJson, procedencia } from './b-comun'

/** Los cuatro del frente, más `1920` como control del otro lado del umbral. */
const A_MEDIR: readonly Perfil[] = [...PERFILES_DEBAJO_DEL_UMBRAL, perfilPorId('1920')]

export const VARA_AA_PX = 24
export const VARA_AAA_PX = 44

const SELECTOR = 'a, button, input, select, textarea, [role=button], [role=link], [role=tab], [tabindex]'

interface Objetivo {
  readonly etiqueta: string
  readonly selector: string
  readonly panel: string | null
  readonly texto: string
  readonly anchoPx: number
  readonly altoPx: number
  readonly menorLadoPx: number
  readonly documentoY: number
  readonly cumpleAA: boolean
  readonly cumpleAAA: boolean
  readonly tipo: string
}

function fuente(paso: number, hasta: number): string {
  return `(async () => {
  const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const selectorDe = (el) => {
    const partes = []
    let n = el
    let saltos = 0
    while (n !== null && n.tagName !== 'BODY' && saltos < 4) {
      let p = n.tagName.toLowerCase()
      if (n.id !== '') { p += '#' + n.id; partes.unshift(p); break }
      const clases = String(n.className).trim().split(/\\s+/).filter((c) => c.length > 0).slice(0, 2)
      if (clases.length > 0) p += '.' + clases.join('.')
      partes.unshift(p)
      n = n.parentElement
      saltos += 1
    }
    return partes.join(' > ')
  }
  const ruta = (el) => {
    const p = []
    let n = el
    while (n !== null && n.parentElement !== null) {
      p.push(n.tagName.toLowerCase() + ':' + [...n.parentElement.children].indexOf(n))
      n = n.parentElement
    }
    return p.reverse().join('/')
  }
  const mejores = new Map()
  const mirar = () => {
    const real = window.scrollY
    for (const el of document.querySelectorAll(${JSON.stringify(SELECTOR)})) {
      const e = getComputedStyle(el)
      if (e.display === 'none' || e.visibility === 'hidden') continue
      if (el.hasAttribute('disabled')) continue
      if (el.getAttribute('aria-hidden') === 'true') continue
      if (el.tagName === 'INPUT' && el.type === 'hidden') continue
      const r = el.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0) continue
      const k = ruta(el)
      const menor = Math.min(r.width, r.height)
      const antes = mejores.get(k)
      if (antes !== undefined && antes.menorLadoPx >= Math.round(menor * 100) / 100) continue
      let panel = null
      let b = el
      while (b !== null) { if (b.dataset && b.dataset.panel !== undefined) { panel = b.dataset.panel; break } b = b.parentElement }
      mejores.set(k, {
        etiqueta: el.tagName.toLowerCase(),
        selector: selectorDe(el),
        panel,
        texto: (el.textContent ?? '').trim().replace(/\\s+/g, ' ').slice(0, 48),
        anchoPx: Math.round(r.width * 100) / 100,
        altoPx: Math.round(r.height * 100) / 100,
        menorLadoPx: Math.round(menor * 100) / 100,
        documentoY: Math.round(r.top + real),
        tipo: el.tagName === 'INPUT' ? 'input:' + el.type : (el.getAttribute('role') ?? el.tagName.toLowerCase()),
      })
    }
  }
  for (let y = 0; y <= ${hasta}; y += ${paso}) {
    window.scrollTo(0, y)
    await raf2()
    await new Promise((r) => setTimeout(r, 90))
    mirar()
  }
  window.scrollTo(0, 0)
  return [...mejores.values()].sort((a, b) => a.menorLadoPx - b.menorLadoPx)
})()`
}

interface Fila {
  readonly perfil: string
  readonly ancho: number
  readonly debajoDelUmbral: boolean
  readonly objetivos: number
  readonly abajoDe24: number
  readonly entre24y44: number
  readonly de44oMas: number
  readonly losQueFallanAA: readonly Objetivo[]
  readonly todos: readonly Objetivo[]
}

async function principal(): Promise<void> {
  const filas: Fila[] = []
  for (const perfil of A_MEDIR) {
    const fila = await conLaPagina(perfil, '/v3', async ({ pagina }) => {
      const doc = await documento(pagina)
      const paso = Math.max(1, Math.round(doc.ventanaPx / 2))
      const hasta = Math.max(0, doc.alturaPx - doc.ventanaPx)
      const crudos = await medir<Omit<Objetivo, 'cumpleAA' | 'cumpleAAA'>[]>(pagina, fuente(paso, hasta))
      const objetivos: Objetivo[] = crudos.map((o) => ({
        ...o,
        cumpleAA: o.anchoPx >= VARA_AA_PX && o.altoPx >= VARA_AA_PX,
        cumpleAAA: o.anchoPx >= VARA_AAA_PX && o.altoPx >= VARA_AAA_PX,
      }))
      return {
        perfil: perfil.id,
        ancho: perfil.ancho,
        debajoDelUmbral: perfil.debajoDelUmbral,
        objetivos: objetivos.length,
        abajoDe24: objetivos.filter((o) => !o.cumpleAA).length,
        entre24y44: objetivos.filter((o) => o.cumpleAA && !o.cumpleAAA).length,
        de44oMas: objetivos.filter((o) => o.cumpleAAA).length,
        losQueFallanAA: objetivos.filter((o) => !o.cumpleAA),
        todos: objetivos,
      }
    })
    filas.push(fila)
    console.log(
      `\n── ${fila.perfil} · ${fila.objetivos} objetivos · abajo de 24: ${fila.abajoDe24} · ` +
        `entre 24 y 44: ${fila.entre24y44} · 44 o más: ${fila.de44oMas} ──`,
    )
    for (const o of fila.losQueFallanAA) {
      console.log(
        `  ⚠️ ${o.anchoPx}×${o.altoPx} px · ${(o.panel ?? '—').padEnd(16)} <${o.etiqueta}> "${o.texto}"  ${o.selector}`,
      )
    }
  }

  const ruta = guardarJson('toque', {
    procedencia: procedencia(
      'scripts-b4/b-toque.ts',
      `caja de borde (getBoundingClientRect, incluye padding) de ${SELECTOR}, con barrido de scroll de media pantalla quedándose con la caja MÁS GRANDE vista de cada objetivo. Sin estrangular. Emulado: el modelo de puntero es \`touch\` en los perfiles móviles, pero no hay dedo real.`,
    ),
    varas: {
      aa: { px: VARA_AA_PX, criterio: 'WCAG 2.5.8 Target Size (Minimum), nivel AA de WCAG 2.2' },
      aaa: { px: VARA_AAA_PX, criterio: 'WCAG 2.5.5 Target Size, nivel AAA' },
      nota: 'ninguna de las dos excepciones de 2.5.8 (objetivo en línea dentro de un bloque de texto, y objetivo cuyo tamaño lo fija el agente de usuario) se aplica automáticamente acá: la lista de fallos es de CANDIDATOS medidos, y quién queda exceptuado lo decide una persona mirando el contexto.',
    },
    filas,
  })
  console.log(`\n→ ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
