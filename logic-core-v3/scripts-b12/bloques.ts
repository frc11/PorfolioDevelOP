/**
 * B12 · EL CONTRASTE BAJO EL GLIFO, BLOQUE POR BLOQUE — el instrumento de las
 * tres preguntas del bloque que se contestan con la misma captura:
 *
 *   §1 · los TÍTULOS de las ocho, ahora que suben a donde estaba el rótulo.
 *   §2 · los BLOQUES DEL PIE, ahora que el `<footer>` no pinta.
 *   §3 · el NEGRO de Trabajos y sus PARTÍCULAS.
 *
 *     npx tsx scripts-b12/bloques.ts --etiqueta=antes [--solo=cierre] [--perfil=1440,1920] [--paso=0.5]
 *
 * ⚠️ **NO ES UNA COPIA DE `scripts-b8/c-las-ocho.ts`: IMPORTA SUS PIEZAS.** La
 * máscara de glifo, los lectores de bloques, el ocultamiento y la evaluación de
 * una posición son los MISMOS módulos que firmaron las deudas de B8 y las
 * re-mediciones de B11. Medir con otra copia sería medir con otra vara. Lo que
 * este archivo agrega es lo que aquél no tiene: **los dos anchos** (aquél clava
 * 1440) y **el desglose del pie por bloque**, que es lo que la PARADA 1 (b)
 * pide como tabla.
 *
 * Las cinco capturas por posición son las de B8:
 *
 *   C — lo que el visitante ve.
 *   A — con la TINTA apagada: el fondo real debajo de cada glifo.
 *   T — con la ESCENA oculta: el texto sobre fondo plano, de donde sale la máscara.
 *   S — con el PANEL oculto: la sala desnuda en esa pose (luminancia, partículas).
 *   V — sólo el panel sobre la sala.
 *
 * ⚠️ El búfer de WebGL no se lee desde la página: todo es `Page.captureScreenshot`.
 */

import { mkdirSync } from 'node:fs'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { type Perfil } from '../scripts-b4/perfiles'
import { ocultarPorSelector } from '../scripts-b5/pagina'
import {
  evaluarLaPosicion,
  imprimirBloques,
  imprimirEscena,
  peorPorBloque,
  veredictoDeLaSeccion,
  type LecturaDeBloque,
  type LecturaDePosicion,
  type Veredicto,
} from '../scripts-b8/c-bloques'
import { leerImagen } from '../scripts-b8/glifo-alfa'
import {
  APAGAR_LA_TINTA,
  ESTILAR_EL_PANEL,
  FONDO_DEL_PANEL,
  LECTOR_DE_BLOQUES,
  LECTOR_DE_PANELES,
  LECTOR_DEL_DOCUMENTO,
  VARIAR_EL_CIERRE,
  raicesDelPanel,
  type Bloque,
  type FondoDelPanel,
  type TintaApagada,
  type VarianteDelCierre,
} from '../scripts-b8/lectores'
import { ESCENA_NUESTRA, OCULTAR_TODO_MENOS } from '../scripts-b8/ocultar'
import { censarParticulas, mediaDeLaCaptura, type CensoDeParticulas } from '../scripts-b8/particulas'

import {
  SELECTOR_DE_LA_ESCENA,
  TEMP,
  argumento,
  asegurarCarpetas,
  asentarElHome,
  conElHome,
  dos,
  jsonPendiente,
  mudarPendientes,
  perfilDeB11,
} from './b12-comun'

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
}

const ETIQUETA = argumento('etiqueta', 'antes')
const SOLO = argumento('solo', '').split(',').filter((s) => s.length > 0)
const PASO = Number(argumento('paso', '0.5'))
const PERFILES: readonly Perfil[] = argumento('perfil', '1440,1920').split(',').map(perfilDeB11)
/**
 * La pregunta de la PARADA 1 (b): `--cierre=oscuro-transparente|papel-transparente|papel-opaco`
 * mide el Cierre en esa variante **sin tocar el producto**. Es `VARIAR_EL_CIERRE`
 * de B8, el mismo que produjo la tabla de §6.3 de `B8-LUZ.md` y las
 * re-mediciones de B11 — con una diferencia: ahora el pie ya NO pinta por hoja,
 * así que el `background-color: transparent !important` que ese lector aplica
 * es un no-op y lo que queda es lo que cambia de verdad, el `data-seccion`.
 */
const VARIANTES: readonly VarianteDelCierre[] = ['oscuro-transparente', 'papel-transparente', 'papel-opaco']
const variantePedida = argumento('cierre', '')
const VARIANTE_DEL_CIERRE: VarianteDelCierre | null = VARIANTES.find((v) => v === variantePedida) ?? null
if (variantePedida !== '' && VARIANTE_DEL_CIERRE === null) {
  throw new Error(`--cierre sólo acepta ${VARIANTES.join(', ')}, no «${variantePedida}»`)
}

/**
 * El contenido de cada sección entra con un revelado; el primer cuadro llega
 * antes de que termine y el lector de bloques —que salta lo que está a opacidad
 * cero— se perdería los que todavía no entraron. Es el mismo asentamiento fijo
 * de B8, con el mismo número.
 */
const ASENTAMIENTO_DE_BLOQUES_MS = 1500

/** Lo que el navegador PINTÓ tiene que ser lo que la superficie declara. */
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
}

function posicionesDe(p: PanelLeido, ventana: number, altoDelDocumento: number): number[] {
  const ys: number[] = []
  const fin = Math.min(p.top + p.alto - ventana, altoDelDocumento - ventana)
  for (let y = p.top; y < fin - 1; y += ventana * PASO) ys.push(Math.round(y))
  ys.push(Math.round(Math.max(p.top, fin)))
  if (p.id === 'cierre' && altoDelDocumento - ventana > fin + 1) ys.push(altoDelDocumento - ventana)
  return [...new Set(ys)].filter((y) => y >= 0)
}

async function medirPerfil(perfil: Perfil): Promise<Record<string, unknown>> {
  return conElHome(
    perfil,
    async (s) => {
      const { pagina } = s
      await asentarElHome(s)
      if (VARIANTE_DEL_CIERRE !== null) {
        if (!(await medir<boolean>(pagina, VARIAR_EL_CIERRE(VARIANTE_DEL_CIERRE)))) throw new Error(`no se pudo variar el Cierre a ${VARIANTE_DEL_CIERRE}`)
        console.log(`⚠ el Cierre se mide como ${VARIANTE_DEL_CIERRE}, sin tocar el producto`)
      }
      const doc = await medir<{ altoDelDocumento: number; ventana: number; ancho: number }>(pagina, LECTOR_DEL_DOCUMENTO)
      const paneles = (await medir<PanelLeido[]>(pagina, LECTOR_DE_PANELES))
        .filter((p) => SOLO.length === 0 || SOLO.includes(p.id))
        .map((p) => (VARIANTE_DEL_CIERRE !== null && p.id === 'cierre' ? { ...p, superficie: VARIANTE_DEL_CIERRE } : p))
      console.log(`\n══ ${perfil.id} · documento ${doc.altoDelDocumento} px · ventana ${doc.ventana} · ${paneles.length} paneles · etiqueta «${ETIQUETA}» · paso ${PASO}`)
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
          const base = `${TEMP}/${ETIQUETA}-${perfil.id}-${panel.id}-${y}`
          const rutas = { C: `${base}-C.png`, A: `${base}-A.png`, T: `${base}-T.png`, S: `${base}-S.png`, V: `${base}-V.png` }
          await capturar(pagina, rutas.C)
          const apagada = await medir<TintaApagada>(pagina, APAGAR_LA_TINTA(true))
          if (!apagada.tomo) throw new Error(`${panel.id}: la tinta no se apagó — ${JSON.stringify(apagada.rebeldes)}`)
          await capturar(pagina, rutas.A)
          await medir(pagina, APAGAR_LA_TINTA(false))
          if (!(await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, true))) throw new Error('la escena no quedó oculta')
          /**
           * T: el panel con el relleno PLANO que su superficie pintaría si fuera
           * opaca, sólo mientras se captura la máscara. Es el arreglo de B8 §11.2:
           * sin él, la tinta CLARA sobre el papel de atrás no tiene glifo que
           * enmascarar y el lector se pierde los bloques.
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
          console.log(
            `      sala entera: gris ${media.gris} · luminancia ${media.luminancia.toFixed(4)}` +
              (censo === null
                ? ''
                : ` · partículas ${censo.cantidad} (${censo.porCienMilPx}/100k px², ⌀ mediana ${censo.diametroMediano} px, p90 ${censo.diametroP90}, pico mediano ${censo.picoMediano} sobre fondo ${censo.fondoGris})`),
          )
          posiciones.push(lectura)
        }
        const fondo = await medir<FondoDelPanel>(pagina, FONDO_DEL_PANEL(panel.id))
        const peores = peorPorBloque(posiciones)
        imprimirBloques(peores)
        const luminancias = sala.map((x) => x.luminancia)
        secciones.push({
          id: panel.id,
          superficieAlMedir: panel.superficie,
          fondo,
          posiciones,
          sala,
          peorPorBloque: peores,
          veredicto: veredictoDeLaSeccion(peores),
          salaMediaMinima: Math.min(...luminancias),
          salaMediaMaxima: Math.max(...luminancias),
        })
      }
      return { perfil: perfil.id, ancho: perfil.ancho, alto: perfil.alto, documento: doc, paso: PASO, secciones }
    },
    'b12-bloques',
  )
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  mkdirSync(TEMP, { recursive: true })
  const filas: Record<string, unknown>[] = []
  for (const perfil of PERFILES) {
    filas.push(await medirPerfil(perfil))
    await new Promise((r) => setTimeout(r, 900))
  }
  jsonPendiente(`bloques-${ETIQUETA}`, {
    etiqueta: ETIQUETA,
    varianteDelCierre: VARIANTE_DEL_CIERRE,
    instrumento:
      'scripts-b8/{c-bloques,lectores,glifo-alfa,ocultar,particulas}.ts — los MISMOS módulos que firmaron las deudas de B8 y las re-mediciones de B11, importados, no copiados. Origen 3000.',
    filas,
  })
  for (const e of mudarPendientes()) console.log(`escrito: ${e}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
