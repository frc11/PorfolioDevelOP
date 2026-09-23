/**
 * RECONOCIMIENTO DE heatbureau.com — dónde está el tramo y qué hay adentro.
 *
 *     npx tsx scripts-b4/ref-reconocimiento.ts
 *
 * No mide nada todavía: busca el SELECTOR. Barre la página de punta a punta en
 * saltos grandes y, en cada parada, censa todo lo que podría ser una «capa de
 * imagen» —`img`, `video`, `picture`, y cualquier elemento con `background-image`
 * o con una transformada escrita— y anota su caja, su transformada y sus clases.
 *
 * De acá sale una sola cosa: con qué selector se pide «todas las capas, incluidas
 * las que están fuera del cuadro», para que la tabla de la medición no dependa de
 * lo que se ve.
 *
 * ⚠️ `marcaDeIntro: false`: esa marca es de NUESTRO sitio.
 * ⚠️ Nada de `verificarLaPagina`: sus cinco campos son de nuestra página.
 */

import { writeFileSync } from 'node:fs'

import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir } from './navegador'
import { perfilPorId } from './perfiles'

const SITIO = 'https://www.heatbureau.com/'
const PERFIL = perfilPorId('1440')
const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/ref-tabla'

interface Candidato {
  readonly etiqueta: string
  readonly clases: string
  readonly datos: string
  readonly ancho: number
  readonly alto: number
  readonly x: number
  readonly y: number
  readonly transform: string
  readonly fuente: string
  readonly padre: string
}

interface Parada {
  readonly y: number
  readonly alturaDelDocumento: number
  readonly candidatos: Candidato[]
}

const CENSO = `(() => {
  const vistos = new Set()
  const salida = []
  const meter = (el, fuente) => {
    if (vistos.has(el)) return
    vistos.add(el)
    const r = el.getBoundingClientRect()
    const e = getComputedStyle(el)
    salida.push({
      etiqueta: el.tagName.toLowerCase(),
      clases: (el.className || '').toString().slice(0, 70),
      datos: Object.keys(el.dataset || {}).slice(0, 4).map((k) => k + '=' + String(el.dataset[k]).slice(0, 18)).join(' '),
      ancho: Math.round(r.width),
      alto: Math.round(r.height),
      x: Math.round(r.left),
      y: Math.round(r.top),
      transform: e.transform === 'none' ? 'none' : e.transform.slice(0, 60),
      fuente,
      padre: el.parentElement === null ? '' : (el.parentElement.className || '').toString().slice(0, 50),
    })
  }
  for (const el of document.querySelectorAll('img, video, picture')) meter(el, 'medio')
  for (const el of document.querySelectorAll('*')) {
    const e = getComputedStyle(el)
    if (e.backgroundImage && e.backgroundImage !== 'none') meter(el, 'fondo')
    else if (e.transform && e.transform !== 'none' && /matrix/.test(e.transform)) meter(el, 'transformado')
  }
  return {
    y: window.scrollY,
    alturaDelDocumento: document.documentElement.scrollHeight,
    candidatos: salida.slice(0, 60),
  }
})()`

/**
 * SEGUNDA FASE: la ASCENDENCIA de una capa y su IDENTIDAD.
 *
 * El censo de arriba dice QUE hay capas escaladas; esto dice de quien cuelgan y
 * con que nombre se las puede volver a pedir paso a paso. Sin identidad no hay
 * «en que paso nace y en que paso deja de existir»: sin ella una lista de cajas
 * ordenadas por tamano se reordena sola y parece que las capas se teletransportan.
 */
const ESTRUCTURA = `(() => {
  const escalaDe = (el) => {
    const m = /matrix\\(([-0-9.e]+)/.exec(getComputedStyle(el).transform || '')
    return m === null ? null : Number(m[1])
  }
  const linaje = (el) => {
    const pasos = []
    let n = el
    while (n !== null && n !== document.body && pasos.length < 9) {
      const r = n.getBoundingClientRect()
      pasos.push({
        etiqueta: n.tagName.toLowerCase(),
        clases: (n.className || '').toString(),
        id: n.id || '',
        escala: escalaDe(n),
        posicion: getComputedStyle(n).position,
        caja: [Math.round(r.width), Math.round(r.height)],
        hijos: n.children.length,
      })
      n = n.parentElement
    }
    return pasos
  }
  const imgs = [...document.querySelectorAll('img')]
  return imgs.map((el, i) => {
    const r = el.getBoundingClientRect()
    return {
      i,
      src: (el.getAttribute('src') || '').slice(-70),
      alt: el.getAttribute('alt') || '',
      caja: [Math.round(r.width), Math.round(r.height)],
      linaje: linaje(el),
    }
  })
})()`

async function principal(): Promise<void> {
  const chrome = await lanzarChrome({
    perfil: 'C:/Users/Valentino/.cache/b4-medicion/ref-chrome',
    ancho: PERFIL.ancho,
    alto: PERFIL.alto + 120,
  })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, SITIO, { marcaDeIntro: false })
    // Su carga es pesada: se le da aire antes de censar.
    await medir<number>(p, 'new Promise((r) => setTimeout(() => r(1), 6000))')

    const alto = await medir<number>(p, 'document.documentElement.scrollHeight')
    console.log(`\ndocumento: ${alto} px  (${(alto / PERFIL.alto).toFixed(1)} pantallas de ${PERFIL.alto})`)

    const paradas: Parada[] = []
    for (let y = 0; y <= alto - PERFIL.alto; y += PERFIL.alto) {
      await medir<number>(
        p,
        `(async () => {
          const hasta = performance.now() + 2200
          while (performance.now() < hasta) {
            window.scrollTo(0, ${String(y)})
            await new Promise((r) => setTimeout(r, 60))
          }
          return window.scrollY
        })()`,
      )
      const parada = await medir<Parada>(p, CENSO)
      paradas.push(parada)
      const conTamano = parada.candidatos.filter((c) => c.ancho > 4 && c.alto > 4)
      console.log(`\n── y=${String(parada.y).padStart(6)} · ${conTamano.length} candidatos con tamaño`)
      for (const c of conTamano.slice(0, 10)) {
        console.log(
          `   ${c.fuente.padEnd(12)} ${c.etiqueta.padEnd(7)} ${String(c.ancho).padStart(5)}x${String(c.alto).padStart(4)} en (${String(c.x).padStart(5)},${String(c.y).padStart(5)})  tr=${c.transform.slice(0, 34).padEnd(34)} ${c.clases.slice(0, 32)}`,
        )
      }
    }

    // Segunda fase: parado en el medio del efecto, de quien cuelga cada capa.
    await medir<number>(
      p,
      `(async () => {
        const hasta = performance.now() + 2500
        while (performance.now() < hasta) {
          window.scrollTo(0, 1800)
          await new Promise((r) => setTimeout(r, 60))
        }
        return window.scrollY
      })()`,
    )
    const estructura = await medir<unknown>(p, ESTRUCTURA)
    writeFileSync(`${SALIDA}-estructura.json`, JSON.stringify(estructura, null, 2))
    console.log(`
estructura en ${SALIDA}-estructura.json`)

    writeFileSync(`${SALIDA}-reconocimiento.json`, JSON.stringify(paradas, null, 2))
    console.log(`\ncrudo en ${SALIDA}-reconocimiento.json`)

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
