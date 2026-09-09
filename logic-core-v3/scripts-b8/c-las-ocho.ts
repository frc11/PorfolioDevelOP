/**
 * LAS OCHO CON LA ESCENA REAL DETRÁS — luminancia, partículas y contraste por bloque.
 *
 *     npx tsx scripts-b8/c-las-ocho.ts --etiqueta=antes [--solo=trabajos,cierre] [--paso=0.5]
 *
 * Es `scripts-b6/c-las-seis.ts` (B6-A) sin el velo: recorre las ocho secciones
 * del home y en cada una barre el scroll en pasos de media pantalla. En cada
 * posición saca CINCO capturas de viewport:
 *
 *   C — lo que el visitante ve.
 *   A — con la TINTA apagada: el fondo real debajo de cada glifo.
 *   T — con la ESCENA oculta: el texto sobre fondo plano, de donde sale la máscara.
 *   S — con el PANEL oculto: la sala desnuda en esa pose (su luminancia, sus partículas).
 *   V — sólo el panel sobre la sala: lo que el panel le hace a la escena.
 *
 * y de ahí, por CADA bloque de texto en cuadro, el contraste bajo el glifo con
 * el peor píxel y cuánto de ese texto cae sobre el logo; por cada posición, la
 * luminancia media de la sala y —si es oscura— el censo de partículas con el
 * MISMO instrumento que midió las de la referencia (`particulas.ts`).
 *
 * `--etiqueta=antes` corre sobre HEAD (el velo de B6-A no existe en esta rama:
 * Trabajos y el Cierre son opacas) y es la línea de base de la PARADA 2 (b).
 * `--etiqueta=despues` corre sobre el árbol de B8. El JSON lleva la etiqueta y
 * la superficie que cada panel declaraba al medirse, leída del marcado.
 */

import { copyFileSync, mkdirSync } from 'node:fs'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { ocultarPorSelector } from '../scripts-b5/pagina'

import {
  CARPETA_DE_CAPTURAS,
  MARCA_DE_INTRO,
  PERFIL,
  PUENTE_DE_AUTOMATIZACION,
  SELECTOR_DE_LA_ESCENA,
  TEMP,
  asegurarCarpetas,
  asentarElHome,
  conLaPagina,
  dos,
  guardarJson,
} from './b8-comun'
import {
  imprimirBloques,
  imprimirEscena,
  evaluarLaPosicion,
  peorPorBloque,
  veredictoDeLaSeccion,
  type LecturaDeBloque,
  type LecturaDePosicion,
  type Veredicto,
} from './c-bloques'
import { leerImagen } from './glifo-alfa'
import {
  APAGAR_LA_TINTA,
  ESTILAR_EL_PANEL,
  FONDO_DEL_PANEL,
  LECTOR_DE_BLOQUES,
  LECTOR_DE_PANELES,
  LECTOR_DEL_DOCUMENTO,
  VARIAR_EL_CIERRE,
  type VarianteDelCierre,
  raicesDelPanel,
  type Bloque,
  type FondoDelPanel,
  type TintaApagada,
} from './lectores'
import { ESCENA_NUESTRA, OCULTAR_TODO_MENOS } from './ocultar'
import { censarParticulas, mediaDeLaCaptura, type CensoDeParticulas } from './particulas'

interface PanelLeido {
  readonly id: string
  readonly superficie: string
  readonly alto: number
  readonly top: number
}

interface SalaEnPosicion {
  readonly scrollY: number
  readonly gris: number
  readonly luminancia: number
  readonly particulas: CensoDeParticulas | null
}

interface LecturaDeSeccion {
  readonly id: string
  readonly superficieAlMedir: string
  readonly fondo: FondoDelPanel
  readonly posiciones: readonly LecturaDePosicion[]
  readonly sala: readonly SalaEnPosicion[]
  readonly peorPorBloque: readonly LecturaDeBloque[]
  readonly veredicto: Veredicto
  readonly salaMediaMinima: number
  readonly salaMediaMaxima: number
  readonly varianzaQuePasaMedia: number
}

const argumento = (nombre: string, defecto: string): string => {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`))
  return a === undefined ? defecto : a.slice(nombre.length + 3)
}
const ETIQUETA = argumento('etiqueta', 'antes')
const SOLO = argumento('solo', '').split(',').filter((s) => s.length > 0)
const PASO = Number(argumento('paso', '0.5'))
/** La pregunta de la PARADA 2: `--cierre=oscuro-transparente|papel-transparente|papel-opaco` mide el Cierre en esa variante, sin tocar el producto (ver `VARIAR_EL_CIERRE`). */
const VARIANTES_DEL_CIERRE: readonly VarianteDelCierre[] = ['oscuro-transparente', 'papel-transparente', 'papel-opaco']
const variantePedida = argumento('cierre', '')
const VARIANTE_DEL_CIERRE: VarianteDelCierre | null = VARIANTES_DEL_CIERRE.find((v) => v === variantePedida) ?? null
if (variantePedida !== '' && VARIANTE_DEL_CIERRE === null) {
  throw new Error(`--cierre sólo acepta ${VARIANTES_DEL_CIERRE.join(', ')}, no «${variantePedida}»`)
}
/**
 * El contenido de cada sección entra con un revelado (Framer, `whileInView`).
 * Con la escena dibujando detrás, el primer cuadro llega antes de que el
 * revelado termine y el lector de bloques —que salta lo que está a opacidad
 * cero— se pierde los bloques que todavía no entraron: en la noche de Trabajos
 * leyó 1 bloque de 9. Se le da al contenido un tiempo fijo para asentarse
 * ANTES de leer los bloques; las capturas de la sala no dependen de esto.
 */
const ASENTAMIENTO_DE_BLOQUES_MS = 1500

/**
 * Lo que el navegador PINTÓ tiene que ser lo que la superficie declara. Se lee
 * del marcado y de `getComputedStyle`, no del código. En B8 la superficie
 * `oscuro-transparente` NO lleva velo: color transparente y sin imagen de fondo.
 */
function afirmarElFondoPintado(panel: PanelLeido, fondo: FondoDelPanel): void {
  const esperado: Readonly<Record<string, RegExp>> = {
    'papel-opaco': /^rgb\(247, 247, 245\)$/,
    'oscuro-opaco': /^rgb\(14, 14, 14\)$/,
    'papel-transparente': /^rgba\(0, 0, 0, 0\)$/,
    'oscuro-transparente': /^rgba\(0, 0, 0, 0\)$/,
  }
  const patron = esperado[panel.superficie]
  if (patron === undefined) throw new Error(`${panel.id}: superficie desconocida «${panel.superficie}»`)
  if (!patron.test(fondo.backgroundColor)) {
    throw new Error(`${panel.id} declara ${panel.superficie} pero el navegador pintó ${fondo.backgroundColor}: la tabla no es la que se cree`)
  }
  if (panel.superficie === 'oscuro-transparente' && fondo.backgroundImage !== 'none') {
    throw new Error(`${panel.id} declara oscuro-transparente y el navegador pintó una imagen de fondo «${fondo.backgroundImage}»: en B8 no hay velo`)
  }
}

function posicionesDe(p: PanelLeido, ventana: number, altoDelDocumento: number): number[] {
  const ys: number[] = []
  const fin = Math.min(p.top + p.alto - ventana, altoDelDocumento - ventana)
  for (let y = p.top; y < fin - 1; y += ventana * PASO) ys.push(Math.round(y))
  ys.push(Math.round(Math.max(p.top, fin)))
  if (p.id === 'cierre' && altoDelDocumento - ventana > fin + 1) ys.push(altoDelDocumento - ventana)
  return [...new Set(ys)].filter((y) => y >= 0)
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const t0 = Date.now()
  const salida = await conLaPagina(
    PERFIL,
    '/v3',
    async (s) => {
      const { pagina } = s
      await asentarElHome(s)
      if (VARIANTE_DEL_CIERRE !== null) {
        if (!(await medir<boolean>(pagina, VARIAR_EL_CIERRE(VARIANTE_DEL_CIERRE)))) throw new Error(`no se pudo variar el Cierre a ${VARIANTE_DEL_CIERRE}`)
        console.log(`⚠ el Cierre se mide como ${VARIANTE_DEL_CIERRE} con el pie sin relleno (la pregunta de la PARADA 2), sin tocar el producto`)
      }
      const doc = await medir<{ altoDelDocumento: number; ventana: number; ancho: number }>(pagina, LECTOR_DEL_DOCUMENTO)
      const paneles = (await medir<PanelLeido[]>(pagina, LECTOR_DE_PANELES)).filter((p) => SOLO.length === 0 || SOLO.includes(p.id))
      console.log(`documento ${doc.altoDelDocumento} px · ventana ${doc.ventana} · ${paneles.length} paneles · etiqueta «${ETIQUETA}» · paso ${PASO} pantallas`)
      const secciones: LecturaDeSeccion[] = []
      for (const panel of paneles) {
        console.log(`\n── ${panel.id} (${panel.superficie}, ${dos(panel.alto / doc.ventana)} pantallas desde y=${panel.top}) ──`)
        const posiciones: LecturaDePosicion[] = []
        const sala: SalaEnPosicion[] = []
        for (const y of posicionesDe(panel, doc.ventana, doc.altoDelDocumento)) {
          const logrado = await scrollA(pagina, y)
          if (Math.abs(logrado - y) > 1) throw new Error(`${panel.id}: se pidió y=${y} y el scroll quedó en ${logrado}`)
          await esperarElPrimerCuadro(pagina)
          await new Promise((r) => setTimeout(r, ASENTAMIENTO_DE_BLOQUES_MS))
          const fondo = await medir<FondoDelPanel>(pagina, FONDO_DEL_PANEL(panel.id))
          afirmarElFondoPintado(panel, fondo)
          const bloques = await medir<Bloque[]>(pagina, LECTOR_DE_BLOQUES(panel.id))
          const base = `${TEMP}/${ETIQUETA}-${panel.id}-${y}`
          const rutas = { C: `${base}-C.png`, A: `${base}-A.png`, T: `${base}-T.png`, S: `${base}-S.png`, V: `${base}-V.png` }
          await capturar(pagina, rutas.C)
          const apagada = await medir<TintaApagada>(pagina, APAGAR_LA_TINTA(true))
          if (!apagada.tomo) throw new Error(`${panel.id}: la tinta no se apagó — ${JSON.stringify(apagada.rebeldes)}`)
          await capturar(pagina, rutas.A)
          await medir(pagina, APAGAR_LA_TINTA(false))
          if (!(await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, true))) throw new Error('la escena no quedó oculta')
          /**
           * T: el panel con el relleno PLANO que su superficie pintaría si fuera
           * opaca (`var(--color-fondo)`, que la invertida ya dio vuelta), sólo
           * mientras se captura la máscara. Sin la escena, un panel transparente
           * deja ver el papel, y la tinta CLARA sobre papel no tiene glifo que
           * enmascarar: la primera corrida de B8 leyó 1 bloque de 9 en la noche de
           * Trabajos —el único con relleno propio— y 2 de 25 en el Cierre sin pie.
           * B6-A no lo necesitaba porque el velo pintaba el panel.
           */
          const fondoPlano = await medir<string>(pagina, ESTILAR_EL_PANEL(panel.id, { 'background-color': 'var(--color-fondo)' }))
          if (fondoPlano === 'rgba(0, 0, 0, 0)') throw new Error(`${panel.id}: el relleno plano para la máscara no tomó`)
          await capturar(pagina, rutas.T)
          await medir(pagina, ESTILAR_EL_PANEL(panel.id, { 'background-color': null }))
          await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, false)
          if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, true)))) throw new Error('no quedó sólo la escena')
          await esperarElPrimerCuadro(pagina, 300)
          await capturar(pagina, rutas.S)
          if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, false)))) throw new Error('no se restauró lo oculto')
          if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS(raicesDelPanel(panel.id), ESCENA_NUESTRA, true)))) throw new Error(`${panel.id}: no quedó sólo el panel sobre la escena`)
          await esperarElPrimerCuadro(pagina, 300)
          await capturar(pagina, rutas.V)
          if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, false)))) throw new Error('no se restauró lo oculto')
          const S = leerImagen(rutas.S)
          const lectura = evaluarLaPosicion(
            { C: leerImagen(rutas.C), A: leerImagen(rutas.A), T: leerImagen(rutas.T), S, V: leerImagen(rutas.V) },
            bloques,
            fondo.rect,
            y,
            rutas,
          )
          imprimirEscena(lectura)
          const media = mediaDeLaCaptura(S)
          const censo = media.luminancia < 0.3 ? censarParticulas(S) : null
          sala.push({ scrollY: y, gris: media.gris, luminancia: media.luminancia, particulas: censo })
          console.log(`      sala entera: gris ${media.gris} · luminancia ${media.luminancia.toFixed(4)}` + (censo === null ? '' : ` · partículas ${censo.cantidad} (${censo.porCienMilPx}/100k px², ⌀ mediana ${censo.diametroMediano} px, p90 ${censo.diametroP90}, pico mediano ${censo.picoMediano} sobre fondo ${censo.fondoGris})`))
          posiciones.push(lectura)
        }
        const fondo = await medir<FondoDelPanel>(pagina, FONDO_DEL_PANEL(panel.id))
        const peores = peorPorBloque(posiciones)
        const medias = posiciones.map((p) => p.escena.sinPanel.media)
        const pasa = posiciones.map((p) => p.escena.varianzaQuePasa).filter((v) => !Number.isNaN(v))
        const media = (v: number[]): number => (v.length === 0 ? Number.NaN : v.reduce((a, b) => a + b, 0) / v.length)
        const seccion: LecturaDeSeccion = {
          id: panel.id,
          superficieAlMedir: panel.superficie,
          fondo,
          posiciones,
          sala,
          peorPorBloque: peores,
          veredicto: veredictoDeLaSeccion(peores),
          salaMediaMinima: Math.min(...medias),
          salaMediaMaxima: Math.max(...medias),
          varianzaQuePasaMedia: media(pasa),
        }
        console.log(`  fondo pintado: ${fondo.backgroundColor} · imagen ${fondo.backgroundImage} · backdrop ${fondo.backdropFilter}`)
        imprimirBloques(peores)
        console.log(`  ⇒ ${seccion.veredicto.toUpperCase()} — ${peores.length} bloques, ${peores.filter((b) => !b.pasaAA).length} fallan AA en su peor píxel`)
        secciones.push(seccion)
      }
      return { etiqueta: ETIQUETA, perfil: PERFIL.id, paso: PASO, documento: doc, secciones }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO] },
  )

  // Con el navegador YA cerrado: el JSON y las capturas que van al reporte.
  mkdirSync(CARPETA_DE_CAPTURAS, { recursive: true })
  for (const sec of salida.secciones) {
    const primera = sec.posiciones[0]
    const peor = sec.posiciones.reduce((a, b) =>
      Math.min(...b.bloques.map((x) => x.peorContraste)) < Math.min(...a.bloques.map((x) => x.peorContraste)) ? b : a,
    )
    copyFileSync(primera.capturas.C, `${CARPETA_DE_CAPTURAS}/${ETIQUETA}-${sec.id}-pose-C.png`)
    copyFileSync(primera.capturas.S, `${CARPETA_DE_CAPTURAS}/${ETIQUETA}-${sec.id}-pose-S.png`)
    if (peor !== primera) copyFileSync(peor.capturas.C, `${CARPETA_DE_CAPTURAS}/${ETIQUETA}-${sec.id}-peor-y${peor.scrollY}-C.png`)
  }
  const ruta = guardarJson(`c-las-ocho-${ETIQUETA}`, salida)

  console.log('\n══ RESUMEN ══')
  console.log('  sección          superficie             bloques  fallan  peor    sala media (min–max)   pasa: var. lum.   veredicto')
  const pct = (v: number): string => (Number.isNaN(v) ? '  —  ' : `${(v * 100).toFixed(1).padStart(5)}%`)
  for (const sec of salida.secciones) {
    const peor = Math.min(...sec.peorPorBloque.map((b) => b.peorContraste))
    console.log(
      `  ${sec.id.padEnd(16)} ${sec.superficieAlMedir.padEnd(22)} ${String(sec.peorPorBloque.length).padStart(7)}  ${String(sec.peorPorBloque.filter((b) => !b.pasaAA).length).padStart(6)}  ${Number.isFinite(peor) ? peor.toFixed(2).padStart(5) : '  —  '}   ${sec.salaMediaMinima.toFixed(3)}–${sec.salaMediaMaxima.toFixed(3)}            ${pct(sec.varianzaQuePasaMedia)}         ${sec.veredicto}`,
    )
  }
  console.log(`\n  ${ruta} · ${((Date.now() - t0) / 1000).toFixed(0)} s`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
