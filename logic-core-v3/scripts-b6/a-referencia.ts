/**
 * LA REFERENCIA — una navegación, una medición. El instrumento de la PARADA 1 (a).
 *
 *     npx tsx scripts-b6/a-referencia.ts
 *
 * ── Qué mide, y qué NO hace ────────────────────────────────────────────────
 *
 * Perfila `nk.studio` en producción pantalla por pantalla, con el MISMO
 * instrumento que mide el nuestro (`c-bloques.ts`), para que las cifras vayan a
 * la misma tabla: en cada pantalla, cuánta textura de su escena sobrevive a lo
 * que ellos ponen encima (varianza de la vista sin tinta contra varianza de los
 * canvas solos), qué tan oscuro es lo que se ve, y el contraste bajo el glifo de
 * TODO el texto en cuadro, con el peor píxel. De ahí salen las tres clases que
 * la instrucción pide distinguir: pantallas con la escena DESNUDA (pasa ~100 %),
 * VELADA (pasa entre 5 y 95 %) y TAPADA (pasa ~0 %) — y el contraste de su
 * texto en las oscuras.
 *
 * NO copia nada: ni un selector, ni una clase, ni un valor. Sus paneles se
 * inventarían por PROPIEDADES computadas —tamaño, color de fondo, alfa,
 * desenfoque— y se publican como medidas escritas con nuestras palabras. Es una
 * sola navegación con scroll adentro, y se cierra la pestaña
 * (`MEDICION-NAVEGADOR.md` §4).
 */

import { copyFileSync, mkdirSync } from 'node:fs'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'

import { CARPETA_DE_CAPTURAS, PERFIL, PUENTE_DE_AUTOMATIZACION, TEMP, asegurarCarpetas, conLaPagina, dos, guardarJson } from './b6-comun'
import { evaluarLaPosicion, type LecturaDePosicion } from './c-bloques'
import { leerImagen } from './glifo-alfa'
import { APAGAR_LA_TINTA, LECTOR_DE_BLOQUES_EN, type Bloque, type TintaApagada } from './lectores'
import { OCULTAR_NODOS, OCULTAR_TODO_MENOS, OCULTAR_TODO_MENOS_INFORMANDO, type Ocultamiento } from './ocultar'

const ORIGEN_DE_LA_REFERENCIA = 'https://www.nk.studio'

/** Sus canvas GRANDES (≥ un cuarto del viewport): los chicos son logos o medidores. */
const CANVASES = `[...document.querySelectorAll('canvas')].filter((c) => { const r = c.getBoundingClientRect(); return r.width * r.height >= 0.25 * innerWidth * innerHeight })`

interface PanelInventariado {
  readonly etiqueta: string
  readonly alfa: number
  readonly luminanciaDelFondo: number
  readonly backdrop: string
  readonly top: number
  readonly alto: number
  readonly ancho: number
  readonly caracteres: number
}

interface Inventario {
  readonly altoDelDocumento: number
  readonly ventana: number
  readonly canvases: { readonly ancho: number; readonly alto: number; readonly top: number; readonly position: string; readonly positionDelPadre: string }[]
  readonly paneles: PanelInventariado[]
}

/** Todo elemento grande con un fondo pintado o un desenfoque: claro u oscuro, opaco o no. */
const INVENTARIO = `(() => {
  const canvases = [...document.querySelectorAll('canvas')].map((c) => {
    const r = c.getBoundingClientRect()
    return { ancho: r.width, alto: r.height, top: r.top + scrollY, position: getComputedStyle(c).position, positionDelPadre: c.parentElement ? getComputedStyle(c.parentElement).position : '' }
  })
  const paneles = []
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    const m = cs.backgroundColor.match(/[\\d.]+/g)
    if (m === null) continue
    const alfa = m.length > 3 ? Number(m[3]) : 1
    if (alfa === 0 && cs.backdropFilter === 'none') continue
    const r = el.getBoundingClientRect()
    if (r.width * r.height < 0.2 * innerWidth * innerHeight) continue
    const lum = (0.2126 * Number(m[0]) + 0.7152 * Number(m[1]) + 0.0722 * Number(m[2])) / 255
    paneles.push({ etiqueta: el.tagName.toLowerCase(), alfa, luminanciaDelFondo: lum, backdrop: cs.backdropFilter, top: r.top + scrollY, alto: r.height, ancho: r.width, caracteres: (el.innerText || '').trim().length })
  }
  paneles.sort((a, b) => a.top - b.top)
  return { altoDelDocumento: document.documentElement.scrollHeight, ventana: innerHeight, canvases, paneles }
})()`

interface Pantalla {
  readonly scrollY: number
  readonly pantalla: number
  readonly salaMedia: number
  readonly vistaMedia: number
  readonly pasa: number
  readonly desvioDeGrisQuePasa: number
  /** `sin-textura`: su canvas está tan oscuro y plano (var < 1e-4) que la razón no dice nada; se publica lo absoluto. */
  readonly clase: 'desnuda' | 'velada' | 'tapada' | 'sin-textura'
  readonly oscura: boolean
  readonly canvasEnCuadro: number
  /** Sus paneles grandes que cruzan esta pantalla, como «alfa@luminancia». */
  readonly panelesEnCuadro: readonly string[]
  readonly bloques: number
  readonly peorPlena: number
  readonly medianaDeMedianas: number
  readonly fallan: number
  readonly lectura: LecturaDePosicion
}

function clasificar(pasa: number, varianzaDeLaSala: number): Pantalla['clase'] {
  if (Number.isNaN(varianzaDeLaSala) || varianzaDeLaSala < 1e-4) return 'sin-textura'
  if (Number.isNaN(pasa) || pasa < 0.05) return 'tapada'
  return pasa > 0.95 ? 'desnuda' : 'velada'
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const salida = await conLaPagina(
    PERFIL,
    '/',
    async ({ pagina, perfil }) => {
      await esperarElPrimerCuadro(pagina)
      await new Promise((r) => setTimeout(r, 4000))
      const inventario = await medir<Inventario>(pagina, INVENTARIO)
      console.log(`documento ${inventario.altoDelDocumento} px · ${dos(inventario.altoDelDocumento / inventario.ventana)} pantallas · ${inventario.canvases.length} canvas`)
      for (const c of inventario.canvases) console.log(`  canvas ${Math.round(c.ancho)}×${Math.round(c.alto)} en y=${Math.round(c.top)} (${c.position}, padre ${c.positionDelPadre})`)
      console.log(`  ${inventario.paneles.length} paneles grandes con fondo o desenfoque (de arriba a abajo):`)
      for (const p of inventario.paneles) {
        console.log(`    <${p.etiqueta}> ${Math.round(p.ancho)}×${Math.round(p.alto)} en y=${Math.round(p.top)} · fondo lum ${p.luminanciaDelFondo.toFixed(3)} @ alfa ${p.alfa} · backdrop ${p.backdrop} · ${p.caracteres} caracteres`)
      }
      const pantallas: Pantalla[] = []
      const region = { x: 0, y: 0, ancho: perfil.ancho, alto: perfil.alto }
      for (let y = 0; y <= inventario.altoDelDocumento - inventario.ventana; y += inventario.ventana) {
        const logrado = await scrollA(pagina, y)
        await esperarElPrimerCuadro(pagina)
        const real = await medir<number>(pagina, 'window.scrollY')
        if (Math.abs(real - y) > 2) throw new Error(`se pidió y=${y}, el scroll quedó en ${logrado} y después en ${real}: su scroll no es el del documento`)
        const leidos = await medir<Bloque[]>(pagina, LECTOR_DE_BLOQUES_EN('[document.body]'))
        const base = `${TEMP}/referencia-${y}`
        const rutas = { C: `${base}-C.png`, A: `${base}-A.png`, T: `${base}-T.png`, S: `${base}-S.png`, V: `${base}-A.png` }
        await capturar(pagina, rutas.C)
        // Lo que no se deje apagar (un color inline con !important, un <text> de SVG) sale de la cuenta, y se dice.
        const apagada = await medir<TintaApagada>(pagina, APAGAR_LA_TINTA(true))
        const rebeldes = new Set(apagada.rebeldes.map((r) => r.n))
        if (rebeldes.size > 0 && y === 0) console.log(`    ${rebeldes.size} bloque(s) no se dejan apagar (un color inline animado) y se excluyen en todas las pantallas: ${apagada.rebeldes.slice(0, 6).map((r) => `<${r.etiqueta}> ${r.color}`).join(' · ')}…`)
        const bloques = leidos.filter((b) => !rebeldes.has(b.n))
        await capturar(pagina, rutas.A)
        await medir(pagina, APAGAR_LA_TINTA(false))
        // Donde no hay un canvas grande (sus secciones claras, opacas) no hay escena que esconder: T es C.
        const canvasEnCuadro = await medir<number>(pagina, `${CANVASES}.length`)
        if (canvasEnCuadro > 0) {
          if (!(await medir<boolean>(pagina, OCULTAR_NODOS(CANVASES, true)))) throw new Error('los canvas no quedaron ocultos')
          await capturar(pagina, rutas.T)
          await medir(pagina, OCULTAR_NODOS(CANVASES, false))
        } else {
          copyFileSync(rutas.C, rutas.T)
        }
        // Sobre la referencia se tolera lo que no se deje esconder, y se dice; lo que NO se tolera es que sus canvas no queden visibles.
        const oculto = await medir<Ocultamiento>(pagina, OCULTAR_TODO_MENOS_INFORMANDO('[]', CANVASES, true))
        if (!oculto.conservados.every((c) => c.visibility === 'visible') || oculto.marcados === 0) {
          throw new Error(`sus canvas no quedaron solos: ${JSON.stringify(oculto)}`)
        }
        if (oculto.rebeldes.length > 0 && y === 0) console.log(`    ${oculto.rebeldes.length} elemento(s) no se dejan esconder para la captura sin paneles (visibility propia) y quedan en todas las pantallas: ${oculto.rebeldes.slice(0, 8).map((r) => `<${r.etiqueta}>`).join(' ')}…`)
        await esperarElPrimerCuadro(pagina, 300)
        await capturar(pagina, rutas.S)
        if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', CANVASES, false)))) throw new Error('no se restauró lo oculto')
        const A = leerImagen(rutas.A)
        const lectura = evaluarLaPosicion({ C: leerImagen(rutas.C), A, T: leerImagen(rutas.T), S: leerImagen(rutas.S), V: A }, bloques, region, y, rutas)
        const plenas = lectura.bloques.map((b) => b.peorAPlena)
        const medianas = lectura.bloques.map((b) => b.medianaContraste).sort((a, b) => a - b)
        const p: Pantalla = {
          scrollY: y,
          pantalla: y / inventario.ventana,
          salaMedia: lectura.escena.sinPanel.media,
          vistaMedia: lectura.escena.conPanelSinTinta.media,
          pasa: lectura.escena.varianzaConContenido,
          desvioDeGrisQuePasa: lectura.escena.desvioDeGrisQuePasa,
          clase: clasificar(lectura.escena.varianzaConContenido, lectura.escena.sinPanel.varianza),
          oscura: lectura.escena.conPanelSinTinta.media < 0.3,
          canvasEnCuadro,
          panelesEnCuadro: inventario.paneles
            .filter((q) => q.top < y + inventario.ventana && q.top + q.alto > y)
            .map((q) => `${q.alfa}@${q.luminanciaDelFondo.toFixed(2)}${q.backdrop === 'none' ? '' : `+${q.backdrop}`}`),
          bloques: lectura.bloques.length,
          peorPlena: plenas.length === 0 ? Number.NaN : Math.min(...plenas),
          medianaDeMedianas: medianas.length === 0 ? Number.NaN : medianas[Math.floor(medianas.length / 2)],
          fallan: lectura.bloques.filter((b) => !b.pasaAA).length,
          lectura,
        }
        pantallas.push(p)
        const pct = (v: number): string => (Number.isNaN(v) ? '  —  ' : `${(v * 100).toFixed(1).padStart(5)}%`)
        console.log(
          `  pantalla ${String(p.pantalla).padStart(2)} (y=${String(y).padStart(5)})  sala ${p.salaMedia.toFixed(3)} (var ${lectura.escena.sinPanel.varianza.toExponential(1)}) · vista ${p.vistaMedia.toFixed(3)} ${p.oscura ? 'OSCURA' : 'clara '}` +
            ` · pasa ${pct(p.pasa)} lum · ${pct(p.desvioDeGrisQuePasa)} gris → ${p.clase.padEnd(11)} · ${p.canvasEnCuadro} canvas · paneles [${p.panelesEnCuadro.join(' ')}]` +
            ` · ${String(p.bloques).padStart(3)} bloques · peor plena ${Number.isNaN(p.peorPlena) ? '  —  ' : p.peorPlena.toFixed(2).padStart(5)} · mediana ${Number.isNaN(p.medianaDeMedianas) ? '  —  ' : p.medianaDeMedianas.toFixed(2)} · ${p.fallan} fallan AA`,
        )
      }
      return { inventario, pantallas }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION], origen: ORIGEN_DE_LA_REFERENCIA, msMaximo: 90_000 },
  )

  const resumen = (clase: Pantalla['clase']): string => salida.pantallas.filter((p) => p.clase === clase).map((p) => p.pantalla).join(', ') || 'ninguna'
  console.log(`\n  desnudas:    ${resumen('desnuda')}\n  veladas:     ${resumen('velada')}\n  tapadas:     ${resumen('tapada')}\n  sin textura: ${resumen('sin-textura')}`)
  const oscurasConTexto = salida.pantallas.filter((p) => p.oscura && p.bloques > 0)
  console.log(`  oscuras con texto: ${oscurasConTexto.map((p) => `${p.pantalla} (pasa ${(p.pasa * 100).toFixed(1)} %, peor plena ${p.peorPlena.toFixed(2)})`).join(' · ') || 'ninguna'}`)
  mkdirSync(CARPETA_DE_CAPTURAS, { recursive: true })
  for (const p of oscurasConTexto.slice(0, 3)) {
    copyFileSync(p.lectura.capturas.C, `${CARPETA_DE_CAPTURAS}/referencia-pantalla-${p.pantalla}-C.png`)
    copyFileSync(p.lectura.capturas.S, `${CARPETA_DE_CAPTURAS}/referencia-pantalla-${p.pantalla}-S.png`)
  }
  console.log(`  ${guardarJson('a-referencia', salida)}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
