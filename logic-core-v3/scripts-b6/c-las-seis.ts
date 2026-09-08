/**
 * LAS SEIS OPACAS CON LA ESCENA REAL DETRÁS — el instrumento de la PARADA 1 (c).
 *
 *     npx tsx scripts-b6/c-las-seis.ts --etiqueta=abierto [--solo=trabajos,cierre] [--paso=0.5]
 *
 * Recorre las ocho secciones del home (las seis opacas y, para comparar, las dos
 * que ya dejan ver la escena), y en cada una barre el scroll de arriba a abajo
 * en pasos de media pantalla. En cada posición saca CUATRO capturas de viewport:
 *
 *   C — lo que el visitante ve.
 *   A — con la TINTA apagada: el fondo real debajo de cada glifo.
 *   T — con la ESCENA oculta: el texto sobre fondo plano, de donde sale la máscara.
 *   S — con el PANEL oculto: la sala desnuda en esa pose (el logo, la varianza).
 *
 * y de ahí, por CADA bloque de texto en cuadro: el contraste bajo el glifo con
 * el peor píxel, cuánto de ese texto cae sobre el logo, y si pasaría a tinta
 * plena. Por cada sección: cuánta varianza de la escena atraviesa el panel y la
 * luminancia media de la sala en esa pose.
 *
 * ── Con qué tabla corre, y por qué hay que decirlo ─────────────────────────
 *
 * Para ver la escena detrás de una sección opaca hay que abrirla. La corrida
 * `abierto` se hace con `secciones.ts` TEMPORALMENTE en las ocho transparentes
 * —las claras en `papel-transparente`, las oscuras en `oscuro-transparente`— y
 * la tabla se restaura desde `HEAD` al terminar. La corrida `control` se hace
 * con la tabla de hoy: detrás de un panel opaco la varianza que pasa tiene que
 * ser cero, y si no lo es el instrumento está ciego. El JSON lleva la etiqueta
 * y la superficie que cada panel declaraba al medirse, leída del marcado.
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
} from './b6-comun'
import {
  imprimirBloques,
  imprimirEscena,
  evaluarLaPosicion,
  peorPorBloque,
  veredictoDeLaSeccion,
  type GeometriaDelVelo,
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
  raicesDelPanel,
  type Bloque,
  type FondoDelPanel,
  type TintaApagada,
} from './lectores'
import { ESCENA_NUESTRA, OCULTAR_TODO_MENOS } from './ocultar'

interface PanelLeido {
  readonly id: string
  readonly superficie: string
  readonly alto: number
  readonly top: number
}

interface LecturaDeSeccion {
  readonly id: string
  readonly superficieAlMedir: string
  readonly fondo: FondoDelPanel
  readonly posiciones: readonly LecturaDePosicion[]
  readonly peorPorBloque: readonly LecturaDeBloque[]
  readonly veredicto: Veredicto
  readonly salaMediaMinima: number
  readonly salaMediaMaxima: number
  readonly varianzaQuePasaMedia: number
  readonly desvioDeGrisQuePasaMedia: number
}

const argumento = (nombre: string, defecto: string): string => {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`))
  return a === undefined ? defecto : a.slice(nombre.length + 3)
}
const ETIQUETA = argumento('etiqueta', 'abierto')
const SOLO = argumento('solo', '').split(',').filter((s) => s.length > 0)
const PASO = Number(argumento('paso', '0.5'))

/** Un estilo que se fuerza sobre TODOS los paneles mientras se mide (ver `d-velo.ts`); vacío = ninguno. */
const ESTILO_FORZADO: Readonly<Record<string, string | null>> = {}

/**
 * Lo que el navegador PINTÓ tiene que ser lo que la superficie declara: un
 * `oscuro-transparente` cuya utilidad del velo no se emitió se vería como
 * `papel-transparente` sin que ninguna cifra lo delate. Se lee del marcado y de
 * `getComputedStyle`, no del código.
 */
function afirmarElFondoPintado(panel: PanelLeido, fondo: FondoDelPanel): void {
  const esperado: Readonly<Record<string, RegExp>> = {
    'papel-opaco': /^rgb\(247, 247, 245\)$/,
    'oscuro-opaco': /^rgb\(14, 14, 14\)$/,
    'papel-transparente': /^rgba\(0, 0, 0, 0\)$/,
    // El velo en gradiente: color transparente y la imagen con las dos alfas del sistema.
    'oscuro-transparente': /^rgba\(0, 0, 0, 0\)$/,
  }
  const patron = esperado[panel.superficie]
  if (patron === undefined) throw new Error(`${panel.id}: superficie desconocida «${panel.superficie}»`)
  if (!patron.test(fondo.backgroundColor)) {
    throw new Error(`${panel.id} declara ${panel.superficie} pero el navegador pintó ${fondo.backgroundColor}: la hoja no se aplicó, o la tabla no es la que se cree`)
  }
  if (panel.superficie === 'oscuro-transparente' && !/linear-gradient\(.*rgba\(14, 14, 14, 0\.8\).*rgba\(14, 14, 14, 0\.4\)/.test(fondo.backgroundImage)) {
    throw new Error(`${panel.id} declara oscuro-transparente pero el navegador pintó «${fondo.backgroundImage}»: el velo en gradiente no está`)
  }
}

/** La geometría del velo tal como la hoja la deriva: el borde de la columna densa y la rampa. */
function geometriaDelVelo(panel: PanelLeido, fondo: FondoDelPanel): GeometriaDelVelo | null {
  if (panel.superficie !== 'oscuro-transparente') return null
  const t = fondo.tokens
  const borde = fondo.veloBorde === '' ? t.tope : t.pad + t.columna + t.canal + t.medio
  return { borde, rampa: t.columna }
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
      const doc = await medir<{ altoDelDocumento: number; ventana: number; ancho: number }>(pagina, LECTOR_DEL_DOCUMENTO)
      const paneles = (await medir<PanelLeido[]>(pagina, LECTOR_DE_PANELES)).filter((p) => SOLO.length === 0 || SOLO.includes(p.id))
      console.log(`documento ${doc.altoDelDocumento} px · ventana ${doc.ventana} · ${paneles.length} paneles · etiqueta «${ETIQUETA}» · paso ${PASO} pantallas`)
      const secciones: LecturaDeSeccion[] = []
      for (const panel of paneles) {
        console.log(`\n── ${panel.id} (${panel.superficie}, ${dos(panel.alto / doc.ventana)} pantallas desde y=${panel.top}) ──`)
        if (Object.keys(ESTILO_FORZADO).length > 0) await medir(pagina, ESTILAR_EL_PANEL(panel.id, ESTILO_FORZADO))
        const posiciones: LecturaDePosicion[] = []
        for (const y of posicionesDe(panel, doc.ventana, doc.altoDelDocumento)) {
          const logrado = await scrollA(pagina, y)
          if (Math.abs(logrado - y) > 1) throw new Error(`${panel.id}: se pidió y=${y} y el scroll quedó en ${logrado}`)
          await esperarElPrimerCuadro(pagina)
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
          await capturar(pagina, rutas.T)
          await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, false)
          if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, true)))) throw new Error('no quedó sólo la escena')
          await esperarElPrimerCuadro(pagina, 300)
          await capturar(pagina, rutas.S)
          if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, false)))) throw new Error('no se restauró lo oculto')
          if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS(raicesDelPanel(panel.id), ESCENA_NUESTRA, true)))) throw new Error(`${panel.id}: no quedó sólo el panel sobre la escena`)
          await esperarElPrimerCuadro(pagina, 300)
          await capturar(pagina, rutas.V)
          if (!(await medir<boolean>(pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, false)))) throw new Error('no se restauró lo oculto')
          const lectura = evaluarLaPosicion(
            { C: leerImagen(rutas.C), A: leerImagen(rutas.A), T: leerImagen(rutas.T), S: leerImagen(rutas.S), V: leerImagen(rutas.V) },
            bloques,
            fondo.rect,
            y,
            rutas,
            geometriaDelVelo(panel, fondo),
          )
          imprimirEscena(lectura)
          posiciones.push(lectura)
        }
        if (Object.keys(ESTILO_FORZADO).length > 0) {
          await medir(pagina, ESTILAR_EL_PANEL(panel.id, Object.fromEntries(Object.keys(ESTILO_FORZADO).map((k) => [k, null]))))
        }
        const fondo = await medir<FondoDelPanel>(pagina, FONDO_DEL_PANEL(panel.id))
        const peores = peorPorBloque(posiciones)
        const medias = posiciones.map((p) => p.escena.sinPanel.media)
        const pasa = posiciones.map((p) => p.escena.varianzaQuePasa).filter((v) => !Number.isNaN(v))
        const pasaGris = posiciones.map((p) => p.escena.desvioDeGrisQuePasa).filter((v) => !Number.isNaN(v))
        const media = (v: number[]): number => (v.length === 0 ? Number.NaN : v.reduce((a, b) => a + b, 0) / v.length)
        const seccion: LecturaDeSeccion = {
          id: panel.id,
          superficieAlMedir: panel.superficie,
          fondo,
          posiciones,
          peorPorBloque: peores,
          veredicto: veredictoDeLaSeccion(peores),
          salaMediaMinima: Math.min(...medias),
          salaMediaMaxima: Math.max(...medias),
          varianzaQuePasaMedia: media(pasa),
          desvioDeGrisQuePasaMedia: media(pasaGris),
        }
        console.log(`  fondo pintado: ${fondo.backgroundColor} · backdrop ${fondo.backdropFilter} · velo ${fondo.velo || '(sin token)'}`)
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
  const ruta = guardarJson(`c-las-seis-${ETIQUETA}`, salida)

  console.log('\n══ RESUMEN ══')
  console.log('  sección          superficie             bloques  fallan  peor    sala media (min–max)  pasa: var. lum. · desvío gris  veredicto')
  const pct = (v: number): string => (Number.isNaN(v) ? '  —  ' : `${(v * 100).toFixed(1).padStart(5)}%`)
  for (const sec of salida.secciones) {
    const peor = Math.min(...sec.peorPorBloque.map((b) => b.peorContraste))
    console.log(
      `  ${sec.id.padEnd(16)} ${sec.superficieAlMedir.padEnd(22)} ${String(sec.peorPorBloque.length).padStart(7)}  ${String(sec.peorPorBloque.filter((b) => !b.pasaAA).length).padStart(6)}  ${Number.isFinite(peor) ? peor.toFixed(2).padStart(5) : '  —  '}   ${sec.salaMediaMinima.toFixed(3)}–${sec.salaMediaMaxima.toFixed(3)}           ${pct(sec.varianzaQuePasaMedia)} · ${pct(sec.desvioDeGrisQuePasaMedia)}         ${sec.veredicto}`,
    )
  }
  console.log(`\n  ${ruta} · ${((Date.now() - t0) / 1000).toFixed(0)} s`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
