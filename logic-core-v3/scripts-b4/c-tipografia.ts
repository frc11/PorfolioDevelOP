/**
 * FRENTE C · 2 — LA VERIFICACIÓN ÓPTICA DE LA TIPOGRAFÍA. **RENDERIZA Y MIDE.
 * NO DECIDE.**
 *
 * ── El empate que espera, y que este script NO rompe ──────────────────────
 *
 * `_lib/tipografia.ts` publica las dos métricas leídas del binario: la **cap
 * height de Chivo es 686 contra 720** de la familia de origen (−4,72 %) y la
 * **x-height coincide** (511 contra 510). Compensar una desajusta la otra. La
 * decisión se cerró con cuatro razones medidas y el desvío en píxeles ordena al
 * revés (−22,6 %). **Lo rompe el ojo del humano, mirando las capturas.**
 *
 * ── Qué se mide, y por qué en CANVAS ──────────────────────────────────────
 *
 * La cap height y la x-height RENDERIZADAS, en píxeles: `TextMetrics.
 * actualBoundingBoxAscent` sobre `'H'` y sobre `'x'`, con la misma familia y el
 * mismo tamaño que el DOM. **Es medición de texto en 2D, no lectura del búfer de
 * WebGL**, así que no cae bajo la regla de `B2-DELTAS` §2.1.
 *
 * ── ⚠️ Y por qué se mide ADENTRO DE LOS `<iframe>` ────────────────────────
 *
 * Los seis niveles fluidos son `clamp()` con `vw`, y `vw` se resuelve contra el
 * VIEWPORT. Medirlos en la página de afuera daría el mismo tamaño cuatro veces.
 * Cada marco tiene viewport propio y es del mismo origen, así que
 * `contentDocument` los alcanza: una sola corrida da los ocho niveles en los
 * cuatro anchos de la banda.
 *
 * Control positivo: la misma medición con `monospace` al mismo tamaño tiene que
 * dar OTRA cap height. Sin eso, el número de arriba podría venir de una fuente
 * de respaldo y nadie lo notaría.
 *
 * Corre con `npx tsx scripts-b4/c-tipografia.ts`.
 */

import { capturarRegion } from './captura'
import { cerrarChrome, lanzarChrome, perfilDeChrome } from './cdp'
import { rutaDeCaptura } from './capturas'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina, type Pagina } from './navegador'
import { perfilPorId, type Perfil } from './perfiles'
import { dos, guardarJson, mudarLasCapturas, rutaTemporal, type CapturaPendiente } from './c-comun'

const RUTA_MARCOS = 'http://localhost:3002/v3/tipografia'
const RUTA_MUESTRA = 'http://localhost:3002/v3/tipografia/muestra'

interface NivelMedido {
  readonly nivel: string
  readonly texto: string
  readonly fontSizePx: number
  readonly fontFamily: string
  readonly lineHeight: string
  readonly letterSpacing: string
  readonly fuentePedidaAlLienzo: string
  readonly fuenteQueElLienzoAceptO: string
  readonly familiaDisponible: boolean
  /** ⚠️ Chrome CUANTIZA `actualBoundingBox*` al píxel entero: a 10 px de cuerpo esto sólo puede dar 7. */
  readonly capHeightPx: number
  readonly xHeightPx: number
  /** La misma medición a 1000 px con la misma familia y peso: sin cuantización. Es la cifra fina. */
  readonly capHeightPor1000: number
  readonly xHeightPor1000: number
  /** Lo que la cap height de este nivel MEDIRÍA sin la cuantización del píxel. */
  readonly capHeightFinaPx: number
  readonly xHeightFinaPx: number
  /** Control positivo: lo mismo a 1000 px con `monospace`. Tiene que DIFERIR de `capHeightPor1000`. */
  readonly capHeightPor1000ConMonospace: number
}

interface MarcoMedido {
  readonly indice: number
  readonly anchoDelMarcoPx: number
  readonly viewportDelMarcoPx: number
  readonly niveles: readonly NivelMedido[]
}

/** La lectura, adentro de la página de los cuatro marcos. */
const LECTURA_DE_LOS_MARCOS = `(() => {
  return [...document.querySelectorAll('iframe')].map((marco, indice) => {
    const d = marco.contentDocument
    if (d === null) return { indice, anchoDelMarcoPx: -1, viewportDelMarcoPx: -1, niveles: [] }
    const ctx = d.createElement('canvas').getContext('2d')
    const vista = d.defaultView
    const niveles = [...d.querySelectorAll('[data-muestra]')].map((el) => {
      const cs = vista.getComputedStyle(el)
      // Se arma explícita y NO se usa \`cs.font\`: el atajo computado omite el peso
      // cuando es normal, y con una variable como Chivo el peso cambia la tinta.
      const pedida = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily
      ctx.font = pedida
      const aceptada = ctx.font
      const alta = ctx.measureText('H')
      const equis = ctx.measureText('x')
      // ⚠️ La cifra FINA. \`actualBoundingBox*\` viene cuantizada al píxel entero,
      // así que a 10 px de cuerpo la cap height sólo puede dar 6 o 7 y el
      // cociente contra el em salta 100 unidades por un píxel. A 1000 px la
      // misma medición tiene tres cifras significativas y se escala después.
      const fina = cs.fontStyle + ' ' + cs.fontWeight + ' 1000px ' + cs.fontFamily
      ctx.font = fina
      const altaFina = ctx.measureText('H')
      const equisFina = ctx.measureText('x')
      ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' 1000px monospace'
      const control = ctx.measureText('H')
      const tam = parseFloat(cs.fontSize)
      return {
        nivel: el.dataset.muestra,
        texto: el.textContent.trim(),
        fontSizePx: parseFloat(cs.fontSize),
        fontFamily: cs.fontFamily,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        fuentePedidaAlLienzo: pedida,
        fuenteQueElLienzoAceptO: aceptada,
        familiaDisponible: d.fonts.check(pedida, 'Hx'),
        capHeightPx: alta.actualBoundingBoxAscent,
        xHeightPx: equis.actualBoundingBoxAscent,
        capHeightPor1000: altaFina.actualBoundingBoxAscent,
        xHeightPor1000: equisFina.actualBoundingBoxAscent,
        capHeightFinaPx: (altaFina.actualBoundingBoxAscent * tam) / 1000,
        xHeightFinaPx: (equisFina.actualBoundingBoxAscent * tam) / 1000,
        capHeightPor1000ConMonospace: control.actualBoundingBoxAscent,
      }
    })
    return {
      indice,
      anchoDelMarcoPx: marco.getBoundingClientRect().width,
      viewportDelMarcoPx: vista.innerWidth,
      niveles,
    }
  })
})()`

/**
 * ⚠️ Los marcos van `loading="lazy"` y el contenedor scrollea en horizontal: los
 * de la derecha no cargan hasta que alguien los acerca. Se barre el scroll
 * horizontal de punta a punta y se espera a que los cuatro digan `complete`; sin
 * eso, la mitad de la tabla saldría vacía y parecería que la ruta no los tiene.
 */
async function despertarLosMarcos(p: Pagina): Promise<{ readonly marcos: number; readonly completos: number; readonly anchoDelContenido: number }> {
  return medir(
    p,
    `(async () => {
      const dormir = (t) => new Promise((r) => setTimeout(r, t))
      let scroller = null
      for (const el of document.querySelectorAll('*')) {
        if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1) { scroller = el; break }
      }
      const marcos = [...document.querySelectorAll('iframe')]
      if (scroller !== null) {
        for (let i = 0; i <= 10; i += 1) {
          scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) * (i / 10)
          await dormir(120)
        }
        scroller.scrollLeft = 0
      }
      for (let i = 0; i < 60; i += 1) {
        const listos = marcos.filter((m) => m.contentDocument !== null && m.contentDocument.readyState === 'complete').length
        if (listos === marcos.length) break
        await dormir(150)
      }
      await dormir(600)
      const anchoDelContenido = scroller === null
        ? document.documentElement.scrollWidth
        : scroller.getBoundingClientRect().left + window.scrollX + scroller.scrollWidth
      return {
        marcos: marcos.length,
        completos: marcos.filter((m) => m.contentDocument !== null && m.contentDocument.readyState === 'complete').length,
        anchoDelContenido: Math.ceil(anchoDelContenido),
      }
    })()`,
  )
}

interface SalidaDelPerfil {
  readonly perfil: string
  readonly marcos: readonly MarcoMedido[]
  readonly despertar: { readonly marcos: number; readonly completos: number; readonly anchoDelContenido: number }
  readonly capturaDeLosMarcos: { readonly ruta: string; readonly ancho: number; readonly alto: number; readonly masAltoQueLaVentana: boolean }
  readonly capturaDeLaMuestra: { readonly ruta: string; readonly ancho: number; readonly alto: number; readonly masAltoQueLaVentana: boolean }
}

async function medirUnPerfil(perfil: Perfil, pendientes: CapturaPendiente[]): Promise<SalidaDelPerfil> {
  const chrome = await lanzarChrome({ perfil: perfilDeChrome('c'), ancho: perfil.ancho, alto: perfil.alto + 120 })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    await irA(p, RUTA_MARCOS)
    console.log(`${perfil.id} · marcos: cargada`)
    await verificarLaPagina(p, perfil)
    const despertar = await despertarLosMarcos(p)
    console.log(`${perfil.id} · marcos despiertos: ${JSON.stringify(despertar)}`)
    const marcos = await medir<MarcoMedido[]>(p, LECTURA_DE_LOS_MARCOS)

    // ⚠️ El ancho REAL del contenido, no el viewport: el contenedor scrollea en
    // horizontal a propósito y una captura de viewport mostraría un marco y medio.
    const altoDelDocumento = await medir<number>(p, 'document.documentElement.scrollHeight')
    const tmpMarcos = rutaTemporal(`${perfil.id}-tipografia.png`)
    const rMarcos = await capturarRegion(p, tmpMarcos, {
      y: 0,
      alto: altoDelDocumento,
      ancho: despertar.anchoDelContenido,
    })
    const destinoMarcos = rutaDeCaptura('c', perfil.id, 'tipografia')
    pendientes.push({ temporal: tmpMarcos, destino: destinoMarcos })

    console.log(`${perfil.id} · marcos capturados`)
    // ⚠️ Una pausa entre la navegación y la primera lectura. `irA` resuelve con
    // `Page.loadEventFired`, y un `Runtime.evaluate` disparado en ese mismo
    // instante puede caer sobre el contexto viejo: «Inspected target navigated
    // or closed». Se paga una vez por navegación y no toca ninguna cifra.
    await irA(p, RUTA_MUESTRA)
    await new Promise((r) => setTimeout(r, 500))
    await verificarLaPagina(p, perfil)
    const altoDeLaMuestra = await medir<number>(p, 'document.documentElement.scrollHeight')
    const tmpMuestra = rutaTemporal(`${perfil.id}-tipografia-muestra.png`)
    const rMuestra = await capturarRegion(p, tmpMuestra, { y: 0, alto: altoDeLaMuestra, ancho: perfil.ancho })
    const destinoMuestra = rutaDeCaptura('c', perfil.id, 'tipografia-muestra')
    pendientes.push({ temporal: tmpMuestra, destino: destinoMuestra })

    await cerrarPagina(p)
    return {
      perfil: perfil.id,
      marcos,
      despertar,
      capturaDeLosMarcos: {
        ruta: destinoMarcos,
        ancho: despertar.anchoDelContenido,
        alto: altoDelDocumento,
        masAltoQueLaVentana: rMarcos.masAltoQueLaVentana,
      },
      capturaDeLaMuestra: {
        ruta: destinoMuestra,
        ancho: perfil.ancho,
        alto: altoDeLaMuestra,
        masAltoQueLaVentana: rMuestra.masAltoQueLaVentana,
      },
    }
  } finally {
    await cerrarChrome(chrome)
  }
}

async function principal(): Promise<void> {
  const pendientes: CapturaPendiente[] = []
  const salidas: SalidaDelPerfil[] = []
  for (const id of ['1440', '1920']) salidas.push(await medirUnPerfil(perfilPorId(id), pendientes))
  mudarLasCapturas(pendientes)

  for (const s of salidas) {
    console.log(`\n${s.perfil} · marcos ${s.despertar.completos}/${s.despertar.marcos} · ancho del contenido ${s.despertar.anchoDelContenido}px`)
    for (const m of s.marcos) {
      console.log(`  marco ${m.indice} · viewport ${m.viewportDelMarcoPx}px · ${m.niveles.length} niveles`)
      for (const n of m.niveles) {
        console.log(
          `    ${n.nivel.padEnd(10)} font ${String(dos(n.fontSizePx)).padStart(7)}px · cap ${String(dos(n.capHeightFinaPx)).padStart(6)}px (${n.capHeightPor1000}/1000) · ` +
            `x ${String(dos(n.xHeightFinaPx)).padStart(5)}px (${n.xHeightPor1000}/1000) · al píxel cap ${n.capHeightPx} x ${n.xHeightPx} · ` +
            `control mono ${n.capHeightPor1000ConMonospace}/1000 · fuente ok ${n.familiaDisponible} · peso ${n.fuentePedidaAlLienzo.split(' ')[1]}`,
        )
      }
    }
  }

  const destino = guardarJson('c-tipografia.json', {
    que: 'los ocho niveles renderizados: font-size computado y cap/x-height en píxeles, en los cuatro anchos de la banda',
    instrumento:
      'scripts-b4/c-tipografia.ts · CDP directo · TextMetrics.actualBoundingBoxAscent sobre "H" y "x" en un canvas 2D del MISMO documento del elemento',
    emulado: true,
    noDecide:
      'este script NO rompe el empate de la cap height (686 contra 720) — deja la evidencia para el humano, como pide la instrucción',
    controlPositivo:
      '`capHeightConMonospacePx` es la misma medición con `monospace` al mismo tamaño: si coincidiera con `capHeightPx`, el lienzo no estaría usando la familia del DOM',
    metricasDeclaradas: {
      chivo: { unidadesPorEm: 1000, capHeight: 686, xHeight: 511 },
      instrumentSans: { unidadesPorEm: 1000, capHeight: 720, xHeight: 510 },
      fuente: 'src/app/v3/_lib/tipografia.ts',
    },
    salidas,
  })
  console.log(`\n→ ${destino}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
