/**
 * N — LAS CAPTURAS DE CONTROL Y LA VERIFICACIÓN DE `@variant`.
 *
 *     npx tsx scripts-blend/n-control.ts
 *
 * Dos cosas en una pasada, porque las dos necesitan la misma pose:
 *
 *   1. **Que `@variant max-escritorio` haya compilado de verdad.** El invariante
 *      afirma sobre el FUENTE de `trazo.css`; que la directiva exista no prueba
 *      que Tailwind la emitió. Acá se lee el `background-color` computado de la
 *      raya del titular y el `stroke` de los trazos del ≠ a los dos lados del
 *      corte: abajo tienen que ser el papel, arriba la tinta.
 *   2. **Las capturas de control**, hero y «Quiénes somos», en los cinco anchos
 *      del mapa de cortes.
 */

import { mkdirSync } from 'node:fs'

import { capturar } from '../scripts-b4/captura'
import { medir } from '../scripts-b4/navegador'
import { VENTANAS, conChrome, enLaVentana, type Ventana } from '../scripts-tapado/tapado-comun'

import { guardarJson } from './blend-comun'
import { esperar, scrollA } from './f-comun'

const SALIDA = 'docs/rediseno/outputs/movil'
const ANCHOS: readonly number[] = [320, 375, 425, 768, 1440]

const LECTOR = `(() => {
  const uno = (sel, prop) => {
    const el = document.querySelector(sel)
    if (el === null) return null
    return getComputedStyle(el)[prop]
  }
  const panel = document.querySelector('[data-panel="hero"]')
  const titular = document.querySelector('[data-panel="quienes-somos"] h2 ~ div, [data-panel="quienes-somos"] [data-composicion="agencia"] div[aria-hidden="true"]')
  const marca = document.querySelector('[data-panel="hero"] [data-marca], [data-panel="hero"] svg[data-isotipo]')
  return {
    ventana: window.innerWidth,
    rayaDelTitular: uno('[data-trazo] [data-parte="linea"]', 'backgroundColor'),
    barraDelSigno: uno('[data-signo="distinto"] [data-parte="barra"] line', 'stroke'),
    diagonalDelSigno: uno('[data-signo="distinto"] [data-parte="diagonal"] line', 'stroke'),
    mezclaDelTitularDelHero: uno('[data-panel="hero"] h1', 'mixBlendMode'),
    mezclaDelCta: uno('[data-panel="hero"] a[data-pieza]', 'mixBlendMode'),
    mezclaDelTitularDeQs: titular === null ? null : getComputedStyle(titular).mixBlendMode,
    fondoDelHero: panel === null ? null : getComputedStyle(panel).backgroundColor,
    hayMarcaEnElHero: marca !== null,
    respiran: document.querySelectorAll('[data-respira]').length,
    avisos: document.querySelectorAll('[data-aviso="toque"]').length,
    ctaConMezcla: (() => {
      const c = document.querySelector('[data-panel="hero"] [data-pieza="cta"]')
      return c === null ? null : (c.hasAttribute('data-mezcla') ? 'marcado ' : 'SIN marcar ') + getComputedStyle(c).color
    })(),
    hero: (() => {
      const t = document.querySelector('[data-panel="hero"] h1')
      const pantalla = document.querySelector('[data-panel="hero"] [data-pantalla="hero"]')
      if (t === null || pantalla === null) return null
      const r = t.getBoundingClientRect()
      const p = pantalla.getBoundingClientRect()
      return {
        tamano: getComputedStyle(t).fontSize,
        alto: Math.round(r.height),
        desdeElPie: Math.round(p.bottom - r.bottom),
        pantalla: Math.round(p.height),
      }
    })(),
    subrayadoDelCta: (() => {
      const c = document.querySelector('[data-panel="hero"] [data-pieza="cta"] [data-parte="subrayado"]')
      if (c === null) return null
      const b = getComputedStyle(c, '::before').backgroundColor
      const a = getComputedStyle(c, '::after').backgroundColor
      return b + ' / ' + a
    })(),
    signo: (() => {
      const s = document.querySelector('[data-signo="distinto"]')
      const cont = document.querySelector('[data-panel="quienes-somos"] [data-parte="contenido"]')
      if (s === null) return null
      const r = s.getBoundingClientRect()
      const c = cont === null ? null : cont.getBoundingClientRect()
      return { x: Math.round(r.x), ancho: Math.round(r.width), margen: c === null ? null : Math.round(c.x) }
    })(),
    fotoDelEquipo: (() => {
      const marcos = [...document.querySelectorAll('[data-marco="dos-tomas"]')]
      const f = marcos.length === 0 ? null : marcos[marcos.length - 1]
      const fig = document.querySelector('[data-pantalla="foto"] figure')
      const persona = [...document.querySelectorAll('[data-pieza-a="persona"]')].pop()
      if (f === null) return null
      const r = f.getBoundingClientRect()
      const pr = persona === undefined ? null : persona.getBoundingClientRect()
      return {
        ancho: Math.round(r.width),
        alto: Math.round(r.height),
        desdeValentino: pr === null ? null : Math.round(r.top + window.scrollY - (pr.bottom + window.scrollY)),
        pieVisible: fig === null ? null : [...fig.querySelectorAll('p')].filter((e) => !e.className.includes('sr-only')).length,
      }
    })(),
    renglonesDelTitular: (() => {
      const divs = [...document.querySelectorAll('[data-panel="quienes-somos"] [data-composicion="agencia"] div[aria-hidden="true"]')]
      const visible = divs.filter((d) => d.getClientRects().length > 0)
      return visible.length === 0 ? 0 : visible[0].children.length
    })(),
    signoCentrado: (() => {
      const e = document.querySelector('[data-signo="distinto"]')
      return e === null ? null : getComputedStyle(e).marginInlineStart
    })(),
    laFoto: (() => {
      const fig = document.querySelector('[data-pantalla="foto"] figure')
      if (fig === null) return null
      const h3 = fig.querySelector('h3')
      const p = fig.querySelector('p')
      const ve = (e) => e !== null && e.getClientRects().length > 0 && getComputedStyle(e).clip === 'auto'
      return {
        titulo: h3 === null ? null : (h3.textContent || '').trim(),
        descripcionVisible: p === null ? false : !p.className.split(/\s+/).some((c) => c === 'sr-only') || ve(p),
        claseDeLaDescripcion: p === null ? null : p.className.slice(0, 40),
      }
    })(),
    botones: document.querySelectorAll('[data-toque="marco"]').length,
    botonesQuePintan: [...document.querySelectorAll('[data-toque="marco"]')].filter((b) => getComputedStyle(b).display !== 'none').length,
    qs: (() => {
      const leer = (sel) => { const e = document.querySelector(sel); return e === null ? null : getComputedStyle(e).fontSize }
      const caja = (sel) => { const e = document.querySelector(sel); if (e === null) return null; const r = e.getBoundingClientRect(); return Math.round(r.width) }
      return {
        titular: leer('[data-panel="quienes-somos"] [data-composicion="agencia"] div[aria-hidden="true"] span'),
        bajada: leer('[data-panel="quienes-somos"] [data-composicion="agencia"] p'),
        equipo: leer('[data-composicion="equipo"] h3'),
        nombre: leer('[data-pieza-a="persona"] h4'),
        descripcion: leer('[data-pieza-a="persona"] p'),
        anchoDelTitular: caja('[data-panel="quienes-somos"] [data-composicion="agencia"] div[aria-hidden="true"]'),
        anchoDeLaBajada: caja('[data-panel="quienes-somos"] [data-composicion="agencia"] p'),
        anchoDeLaDescripcion: caja('[data-pieza-a="persona"] p'),
      }
    })(),
    topDeQuienesSomos: (() => {
      const q = document.querySelector('[data-panel="quienes-somos"]')
      return q === null ? 0 : Math.round(q.getBoundingClientRect().top + window.scrollY)
    })(),
  }
})()`

interface Lectura {
  readonly ventana: number
  readonly rayaDelTitular: string | null
  readonly barraDelSigno: string | null
  readonly diagonalDelSigno: string | null
  readonly mezclaDelTitularDelHero: string | null
  readonly mezclaDelCta: string | null
  readonly mezclaDelTitularDeQs: string | null
  readonly fondoDelHero: string | null
  readonly hayMarcaEnElHero: boolean
  readonly respiran: number
  readonly avisos: number
  readonly ctaConMezcla: string | null
  readonly hero: { readonly tamano: string; readonly alto: number; readonly desdeElPie: number; readonly pantalla: number } | null
  readonly qs: Readonly<Record<string, string | number | null>> | null
  readonly subrayadoDelCta: string | null
  readonly signo: { readonly x: number; readonly ancho: number; readonly margen: number | null } | null
  readonly fotoDelEquipo: { readonly ancho: number; readonly alto: number; readonly desdeValentino: number | null; readonly pieVisible: number | null } | null
  readonly renglonesDelTitular: number
  readonly signoCentrado: string | null
  readonly laFoto: { readonly titulo: string | null; readonly descripcionVisible: boolean; readonly claseDeLaDescripcion: string | null } | null
  readonly botones: number
  readonly botonesQuePintan: number
  readonly topDeQuienesSomos: number
}

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const ventanas: readonly Ventana[] = VENTANAS.filter((v) => ANCHOS.includes(v.ancho))
  const salida: Lectura[] = []

  await conChrome('blend-control', async (chrome) => {
    for (const v of ventanas) {
      const l = await enLaVentana(
        chrome,
        v,
        async (s) => {
          const lectura = await medir<Lectura>(s.pagina, LECTOR)
          await capturar(s.pagina, `${SALIDA}/hero-${v.ancho}.png`)
          await scrollA(s.pagina, Math.max(0, lectura.topDeQuienesSomos - 60))
          await esperar(1100)
          await capturar(s.pagina, `${SALIDA}/quienes-somos-${v.ancho}.png`)
          return lectura
        },
        { asentamientoMs: 4500 },
      )
      console.log(`\n  === ${v.ancho}x${v.alto}`)
      console.log(`    hero: fondo ${l.fondoDelHero} · marca arriba del titular: ${l.hayMarcaEnElHero ? 'SIGUE' : 'no'}`)
      console.log(`    mezcla: titular del hero ${l.mezclaDelTitularDelHero} · CTA ${l.mezclaDelCta} · titular de qs ${l.mezclaDelTitularDeQs}`)
      console.log(`    trazos: raya ${l.rayaDelTitular} · barra del ≠ ${l.barraDelSigno} · diagonal ${l.diagonalDelSigno}`)
      console.log(`    CTA: ${l.ctaConMezcla} · respiran ${l.respiran} fotos · avisos de texto ${l.avisos}`)
      if (l.hero !== null) console.log(`    hero: titular ${l.hero.tamano} · alto ${l.hero.alto} · ${l.hero.desdeElPie} px del pie · pantalla ${l.hero.pantalla}`)
      console.log(`    subrayado del CTA: ${l.subrayadoDelCta}`)
      if (l.signo !== null) console.log(`    ≠ en x=${l.signo.x} (margen del contenido ${l.signo.margen}) ancho ${l.signo.ancho}`)
      if (l.fotoDelEquipo !== null)
        console.log(
          `    foto del equipo ${l.fotoDelEquipo.ancho}x${l.fotoDelEquipo.alto} · ${l.fotoDelEquipo.desdeValentino} px de Valentino · pies visibles ${l.fotoDelEquipo.pieVisible}`,
        )
      console.log(`    renglones del titular: ${l.renglonesDelTitular} · ≠ margin-inline-start ${l.signoCentrado}`)
      console.log(`    la foto: título «${l.laFoto?.titulo}» · descripción visible ${l.laFoto?.descripcionVisible} · botones ${l.botonesQuePintan}/${l.botones} pintan`)
      if (l.qs !== null) {
        console.log(`    qs tamaños: titular ${l.qs.titular} · equipo ${l.qs.equipo} · nombre ${l.qs.nombre} · bajada ${l.qs.bajada} · descripción ${l.qs.descripcion}`)
        console.log(`    qs anchos: titular ${l.qs.anchoDelTitular} · bajada ${l.qs.anchoDeLaBajada} · descripción ${l.qs.anchoDeLaDescripcion}`)
      }
      salida.push(l)
    }
    return null
  })
  console.log(`\n  ${guardarJson('n-control', { anchos: salida })}`)
  console.log(`  capturas en ${SALIDA}/`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
