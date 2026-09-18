/**
 * TINTA — el contraste de un bloque de texto contra la escena real, a pedido.
 *
 *     npm run tinta -- <seccion> [--anchos=375,768,1440] [--origen=http://localhost:3000]
 *
 * Reusa el instrumento real de B4/B8 (Chrome propio por CDP, captura T/A,
 * máscara de glifo, `contrasteBajoElGlifoConOpacidad`) — el mismo que firmó
 * `s10-acceso-escena.ts` antes de que Modo pulido borrara su invariante. Una
 * sola posición por sección (la de aterrizaje), sin afirmaciones, sin deudas,
 * sin paso nuevo en `verificar`. Imprime una tabla y termina.
 */

import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'
import { moverElPuntero, ocultarPorSelector } from '../scripts-b5/pagina'
import { ASENTAMIENTO_MS, conLaPagina, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION, SELECTOR_DE_LA_ESCENA, type Sesion } from '../scripts-b8/b8-comun'
import { contrasteBajoElGlifoConOpacidad, leerImagen } from '../scripts-b8/glifo-alfa'
import {
  APAGAR_LA_TINTA,
  ESTILAR_EL_PANEL,
  LECTOR_DE_BLOQUES,
  LECTOR_DEL_DOCUMENTO,
  LECTOR_DE_PANELES,
  type Bloque,
  type TintaApagada,
} from '../scripts-b8/lectores'

interface PanelLeido {
  readonly id: string
  readonly superficie: string
  readonly alto: number
  readonly top: number
}

interface Zona {
  readonly ratio: number
  readonly etiqueta: string
  readonly texto: string
  readonly grande: boolean
}

interface ResultadoDeAncho {
  readonly ancho: number
  readonly bloques: number
  readonly peorRatio: number
  readonly pctBajoAA: number
  readonly zonas: readonly Zona[]
}

interface FallaDeAncho {
  readonly ancho: number
  readonly error: string
}

function argumento(nombre: string, defecto: string): string {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`))
  return a === undefined ? defecto : a.slice(nombre.length + 3)
}

/**
 * `asentarElHome` de B8 exige que las ocho secciones sean múltiplo EXACTO del
 * alto del viewport — cierto a 1440/1920/2560, falso a 375/768: ahí las
 * secciones se acomodan al contenido y no a pantallas enteras. Se reemplaza
 * sólo esa comprobación por una que vale en cualquier ancho (ocho paneles,
 * fuentes cargadas); el resto —primer cuadro, asentamiento, puntero centrado— es
 * igual.
 */
async function asentarLaPagina(s: Sesion): Promise<void> {
  await esperarElPrimerCuadro(s.pagina)
  await new Promise((r) => setTimeout(r, ASENTAMIENTO_MS))
  const paneles = await medir<number>(s.pagina, `(async () => { await document.fonts.ready; return document.querySelectorAll('[data-panel]').length })()`)
  if (paneles !== 8) throw new Error(`la página no tiene los 8 paneles (hay ${paneles}) — ¿dev server recompilando?`)
  await moverElPuntero(s.pagina, s.perfil, Math.round(s.perfil.ancho / 2), Math.round(s.perfil.alto / 2))
}

async function medirUnAncho(seccion: string, idAncho: string, origen: string, temp: string): Promise<ResultadoDeAncho> {
  const perfil = perfilPorId(idAncho)
  return conLaPagina(
    perfil,
    '/v3',
    async (s) => {
      await asentarLaPagina(s)

      const paneles = await medir<PanelLeido[]>(s.pagina, LECTOR_DE_PANELES)
      const panel = paneles.find((p) => p.id === seccion)
      if (panel === undefined) throw new Error(`no existe la sección "${seccion}" — hay: ${paneles.map((p) => p.id).join(', ')}`)

      const doc = await medir<{ altoDelDocumento: number; ventana: number; ancho: number }>(s.pagina, LECTOR_DEL_DOCUMENTO)
      const yDeAterrizaje = Math.max(0, Math.min(panel.top, doc.altoDelDocumento - doc.ventana))
      await scrollA(s.pagina, yDeAterrizaje)
      await esperarElPrimerCuadro(s.pagina)
      await new Promise((r) => setTimeout(r, 1500))

      const bloques = (await medir<Bloque[]>(s.pagina, LECTOR_DE_BLOQUES(seccion))).filter((b) => b.enCuadro)
      if (bloques.length === 0) {
        return { ancho: perfil.ancho, bloques: 0, peorRatio: Number.NaN, pctBajoAA: Number.NaN, zonas: [] }
      }

      const rutaT = path.join(temp, `${idAncho}-T.png`)
      const rutaA = path.join(temp, `${idAncho}-A.png`)

      if (!(await ocultarPorSelector(s.pagina, SELECTOR_DE_LA_ESCENA, true))) throw new Error('la escena no quedó oculta')
      const fondoPlano = await medir<string>(s.pagina, ESTILAR_EL_PANEL(seccion, { 'background-color': 'var(--color-fondo)' }))
      if (fondoPlano === 'rgba(0, 0, 0, 0)') throw new Error(`"${seccion}": el fondo plano para la máscara no tomó`)
      await capturar(s.pagina, rutaT)
      await medir(s.pagina, ESTILAR_EL_PANEL(seccion, { 'background-color': null }))
      await ocultarPorSelector(s.pagina, SELECTOR_DE_LA_ESCENA, false)

      const apagada = await medir<TintaApagada>(s.pagina, APAGAR_LA_TINTA(true))
      if (!apagada.tomo) throw new Error(`"${seccion}": la tinta no se apagó — ${JSON.stringify(apagada.rebeldes)}`)
      await capturar(s.pagina, rutaA)
      await medir(s.pagina, APAGAR_LA_TINTA(false))

      const T = leerImagen(rutaT)
      const A = leerImagen(rutaA)

      const zonas: Zona[] = []
      let totalGlifo = 0
      let totalBajoAA = 0
      for (const b of bloques) {
        const opacidad = b.opacidad * b.alfaDeColor
        if (opacidad < 0.02) continue
        const l = contrasteBajoElGlifoConOpacidad(T, A, b.cajas, b.tinta, opacidad, b.grande)
        if (l.pixelesDeGlifo === 0) continue
        totalGlifo += l.pixelesDeGlifo
        totalBajoAA += l.bajoAA
        zonas.push({ ratio: l.peorContraste, etiqueta: b.etiqueta, texto: b.texto, grande: b.grande })
      }
      zonas.sort((p1, p2) => p1.ratio - p2.ratio)

      return {
        ancho: perfil.ancho,
        bloques: zonas.length,
        peorRatio: zonas.length === 0 ? Number.NaN : zonas[0].ratio,
        pctBajoAA: totalGlifo === 0 ? Number.NaN : (totalBajoAA / totalGlifo) * 100,
        zonas: zonas.slice(0, 3),
      }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO], origen, perfilDeChrome: 'tinta' },
  )
}

function imprimir(seccion: string, resultados: readonly (ResultadoDeAncho | FallaDeAncho)[]): void {
  console.log(`\n═══ TINTA — ${seccion} ═══\n`)
  console.log('  ancho   bloques   peor ratio   texto bajo AA')
  for (const r of resultados) {
    if ('error' in r) {
      console.log(`  ${String(r.ancho).padEnd(7)} FALLA — ${r.error}`)
      continue
    }
    const peor = Number.isNaN(r.peorRatio) ? '—' : `${r.peorRatio.toFixed(2)}:1`
    const pct = Number.isNaN(r.pctBajoAA) ? '—' : `${r.pctBajoAA.toFixed(1)}%`
    console.log(`  ${String(r.ancho).padEnd(7)} ${String(r.bloques).padEnd(9)} ${peor.padEnd(12)} ${pct}`)
  }
  for (const r of resultados) {
    if ('error' in r || r.zonas.length === 0) continue
    console.log(`\n  ── ${r.ancho}px — zonas peores ──`)
    r.zonas.forEach((z, i) => {
      const marca = z.grande ? ' (grande, pasa AA a 3:1)' : ''
      console.log(`    ${i + 1}. ${z.ratio.toFixed(2)}:1  ${z.etiqueta.padEnd(6)} "${z.texto}"${marca}`)
    })
  }
  console.log('')
}

async function principal(): Promise<void> {
  const seccion = process.argv.slice(2).find((x) => !x.startsWith('--'))
  if (seccion === undefined) throw new Error('uso: npm run tinta -- <seccion> [--anchos=375,768,1440] [--origen=http://localhost:3000]')
  const anchos = argumento('anchos', '375,768,1440').split(',')
  const origen = argumento('origen', 'http://localhost:3000')

  const temp = mkdtempSync(path.join(tmpdir(), 'tinta-'))
  const t0 = Date.now()
  try {
    const resultados: (ResultadoDeAncho | FallaDeAncho)[] = []
    for (const idAncho of anchos) {
      try {
        resultados.push(await medirUnAncho(seccion, idAncho, origen, temp))
      } catch (e) {
        resultados.push({ ancho: Number(idAncho), error: e instanceof Error ? e.message : String(e) })
      }
    }
    imprimir(seccion, resultados)
    console.log(`  ${((Date.now() - t0) / 1000).toFixed(1)} s total`)
  } finally {
    rmSync(temp, { recursive: true, force: true })
  }
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
