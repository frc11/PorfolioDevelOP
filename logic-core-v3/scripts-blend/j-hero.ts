/**
 * J — ¿LLEGA LA CADENA DE MEZCLA EN EL HERO, EN LA BANDA MOVIL?
 *
 *     npx tsx scripts-blend/j-hero.ts [--anchos=320,375,425]
 *
 * La bajada de «Quienes somos» ya mezcla contra la escena abajo de 1025, y la
 * condicion que lo hace posible es que ningun ancestro abra un contexto de
 * apilamiento entre el parrafo y `[data-v3]`. Esa condicion se verifico para ESA
 * seccion y no se hereda: **el hero tiene su propia estructura** —su marca, su
 * grilla de la caja del titular, su columna lateral, su regimen de papel abajo
 * de 390— y cualquiera de esos envoltorios podria abrir uno.
 *
 * Asi que se pregunta lo mismo, para el titular y para la bajada del hero, en
 * los tres anchos de la banda: quien es el ancestro mas cercano que abre
 * contexto, y si el canvas esta adentro.
 *
 * El detector no se copia: se lee del fuente de `a-cadena.ts` (ver `f-comun.ts`).
 * Las ventanas salen de `scripts-tapado/tapado-comun.ts`, que es donde 320 y 425
 * ya estan declarados con su procedencia.
 */

import { medir } from '../scripts-b4/navegador'
import { VENTANAS, conChrome, enLaVentana, type Ventana } from '../scripts-tapado/tapado-comun'

import { argumento, guardarJson } from './blend-comun'
import { fuenteDelDetector } from './f-comun'

const TITULAR = '[data-panel="hero"] h1'
const BAJADA = '[data-panel="hero"] [data-nivel]'

function lector(): string {
  return [
    '(() => {',
    fuenteDelDetector(),
    '  const lienzo = document.querySelector("canvas")',
    '  const escena = document.querySelector("[data-escena]")',
    '  const nombre = (el) => el.tagName.toLowerCase() + [...el.attributes].filter((a) => a.name.startsWith("data-")).map((a) => "[" + a.name + "]").join("") + (typeof el.className === "string" && el.className !== "" ? "." + el.className.split(/\\s+/).slice(0, 3).join(".") : "")',
    '  const subir = (sel) => {',
    '    const el = document.querySelector(sel)',
    '    if (el === null) return { hay: false }',
    '    const cadena = []',
    '    let corte = null',
    '    let n = el.parentElement',
    '    while (n !== null) {',
    '      const razones = apila(n)',
    '      const nodo = { nodo: nombre(n), razones, contieneElCanvas: lienzo !== null && n.contains(lienzo) }',
    '      cadena.push(nodo)',
    '      if (razones.length > 0 && corte === null) corte = nodo',
    '      if (n === document.documentElement) break',
    '      n = n.parentElement',
    '    }',
    '    const cs = getComputedStyle(el)',
    '    const r = el.getBoundingClientRect()',
    '    return {',
    '      hay: true,',
    '      texto: (el.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 44),',
    '      color: cs.color,',
    '      blend: cs.mixBlendMode,',
    '      caja: { x: Math.round(r.x), y: Math.round(r.y), ancho: Math.round(r.width), alto: Math.round(r.height) },',
    '      corta: corte,',
    '      llegaAlCanvas: corte === null ? lienzo !== null : corte.contieneElCanvas,',
    '      cortantes: cadena.filter((c) => c.razones.length > 0).slice(0, 4),',
    '    }',
    '  }',
    '  const panel = document.querySelector("[data-panel=\\"hero\\"]")',
    '  const csPanel = panel === null ? null : getComputedStyle(panel)',
    '  return {',
    '    ventana: window.innerWidth,',
    `    titular: subir(${JSON.stringify(TITULAR)}),`,
    `    bajada: subir(${JSON.stringify(BAJADA)}),`,
    '    hayCanvas: lienzo !== null,',
    '    escenaVisible: escena === null ? null : getComputedStyle(escena).visibility + " z=" + getComputedStyle(escena).zIndex,',
    '    superficieDelHero: panel === null ? null : (panel.getAttribute("data-superficie") || "-") + " bg=" + (csPanel === null ? "-" : csPanel.backgroundColor),',
    '  }',
    '})()',
  ].join('\n')
}

interface Razon {
  readonly propiedad: string
  readonly valor: string
}

interface Nodo {
  readonly nodo: string
  readonly razones: readonly Razon[]
  readonly contieneElCanvas: boolean
}

interface Pieza {
  readonly hay: boolean
  readonly texto?: string
  readonly color?: string
  readonly blend?: string
  readonly caja?: { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number }
  readonly corta?: Nodo | null
  readonly llegaAlCanvas?: boolean
  readonly cortantes?: readonly Nodo[]
}

interface Lectura {
  readonly ventana: number
  readonly titular: Pieza
  readonly bajada: Pieza
  readonly hayCanvas: boolean
  readonly escenaVisible: string | null
  readonly superficieDelHero: string | null
}

function contar(que: string, p: Pieza): void {
  if (!p.hay) {
    console.log(`    ${que.padEnd(8)} NO ESTÁ en el marcado`)
    return
  }
  const corta = p.corta ?? null
  console.log(`    ${que.padEnd(8)} «${p.texto}»  caja ${p.caja?.ancho}x${p.caja?.alto} en (${p.caja?.x},${p.caja?.y})`)
  console.log(`             color ${p.color} · blend ${p.blend}`)
  console.log(`             corta en: ${corta === null ? '(nada corta)' : corta.nodo}`)
  if (corta !== null) console.log(`             por: ${corta.razones.map((r) => `${r.propiedad}=${r.valor}`).join(' + ')}`)
  console.log(`             LLEGA AL CANVAS: ${p.llegaAlCanvas === true ? 'SÍ' : 'NO'}`)
}

async function principal(): Promise<void> {
  const pedidos = argumento('anchos', '320,375,425').split(',')
  const ventanas: readonly Ventana[] = VENTANAS.filter((v) => pedidos.includes(String(v.ancho)))
  if (ventanas.length === 0) throw new Error(`ningún ancho coincide con --anchos=${pedidos.join(',')}`)

  const salida: Lectura[] = []
  await conChrome('blend-hero', async (chrome) => {
    for (const v of ventanas) {
      const l = await enLaVentana(chrome, v, async (s) => medir<Lectura>(s.pagina, lector()), { asentamientoMs: 4500 })
      console.log(`\n  === ${v.ancho}x${v.alto}`)
      console.log(`    escena: ${l.escenaVisible} · canvas ${l.hayCanvas ? 'montado' : 'NO montado'}`)
      console.log(`    hero: superficie ${l.superficieDelHero}`)
      contar('titular', l.titular)
      contar('bajada', l.bajada)
      salida.push(l)
    }
    return null
  })
  console.log(`\n  ${guardarJson('j-hero', { anchos: salida })}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
