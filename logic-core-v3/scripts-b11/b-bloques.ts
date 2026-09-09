/**
 * B · EL CONTRASTE DE CADA BLOQUE A LO LARGO DE SU TRAMO — el instrumento que
 * declaró las deudas, corrido más fino y en los tres anchos.
 *
 *     npx tsx scripts-b11/b-bloques.ts --etiqueta=antes [--perfil=1440,1920,2560] [--paso=0.25] [--solo=numeros,cierre] [--cierre=papel-transparente] [--origen=http://localhost:3005]
 *
 * `--cierre=oscuro-transparente|papel-transparente|papel-opaco` mide el Cierre
 * en esa variante con el pie SIN relleno (`VARIAR_EL_CIERRE`, la pregunta de la
 * PARADA 2 de B8), sin tocar el producto: es la única forma de ver dónde cae el
 * logo detrás del texto del pie, porque con el pie como está la sala no se ve.
 *
 * Es `scripts-b8/c-las-ocho.ts` —cinco capturas por posición (C, A, T, S, V),
 * el contraste bajo el glifo con el peor píxel, la fracción del glifo sobre la
 * silueta del logo— con tres diferencias, y ninguna es del método:
 *
 *   1. **Sólo las seis** secciones que ven la escena. Servicios y Tu panel son
 *      opacas por pedido y no tienen deuda.
 *   2. **Paso de un cuarto de pantalla** (B8: media). La instrucción pide la
 *      legibilidad a lo largo del tramo entero; con media pantalla, un bloque de
 *      una pantalla se mide dos veces y el logo se le cruza entre las dos.
 *   3. **Los tres anchos**, con un Chrome por ancho, y —para el cruce con el
 *      mapa de `a-logo.ts`— la caja ATERRIZADA de cada bloque en coordenadas del
 *      documento: la lectura en la que el bloque tiene su opacidad más alta, con
 *      el `scrollY` sumado. Una caja leída a media entrada lleva la transformada
 *      de P2 adentro y no es donde el texto vive.
 *
 * Lo demás es idéntico, importado y no copiado: `evaluarLaPosicion`,
 * `peorPorBloque`, el veredicto, los lectores y el ocultamiento son los de B8.
 * Por eso una cifra de acá se puede restar contra una fila de
 * `s10-acceso-escena.ts`.
 *
 * ── ⚠️ B11 · LA PASTILLA, UN DEFECTO DEL INSTRUMENTO DE B8 QUE SE ARREGLA ──
 *
 * La pastilla de navegación es chrome `sticky`: pasado el umbral vive en los
 * 72 px de arriba del cuadro, centrada, 604 px de ancho, con su propio texto
 * oscuro sobre su propio relleno claro. Todo bloque que sale del cuadro por
 * arriba en esas columnas pasa por debajo de ella, y ahí el instrumento de B8
 * hacía dos cosas mal a la vez: la captura T (escena oculta) sigue mostrando
 * la pastilla, así que **el texto de la pastilla entra en la máscara de glifo
 * del bloque**; y `APAGAR_LA_TINTA` sólo apaga los bloques del panel, así que
 * en A ese texto sigue negro. Resultado: **1,00:1 con cientos de píxeles «bajo
 * AA» que no son del bloque** —«Contacto» adentro de la caja del titular de
 * Números (540 px), medido en el recorte de la captura—. Contaminó filas de
 * la línea de base de B8 y de la primera medición de B11 (el titular de
 * Números, «personas y las», el titular del diferencial).
 *
 * El arreglo no afloja nada: **las cajas de cada bloque se recortan contra el
 * rectángulo de la pastilla en cada posición**, leído del DOM. Lo que queda
 * debajo de la pastilla no es visible y no se mide; lo que la pastilla escribe
 * no es del bloque y no se cuenta. Se publica cuántos bloques se recortaron y
 * cuántos píxeles de caja se descontaron. La geometría de la pastilla es una
 * decisión aprobada por grabación (`_lib/navegacion.ts`) y no se toca.
 *
 * Y para que el «antes» y el «después» lleven el mismo instrumento, el antes se
 * re-mide desde el build aislado del árbol intacto (`--origen`, ver
 * `ORIGEN_DEL_BUILD_INTACTO`). Las corridas sin recorte quedan en
 * `outputs/b11/sin-recorte/` como evidencia del defecto, no como cifra.
 */

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { ocultarPorSelector } from '../scripts-b5/pagina'
import { evaluarLaPosicion, imprimirBloques, imprimirEscena, peorPorBloque, veredictoDeLaSeccion, type LecturaDeBloque, type LecturaDePosicion, type Veredicto } from '../scripts-b8/c-bloques'
import { leerImagen } from '../scripts-b8/glifo-alfa'
import { APAGAR_LA_TINTA, ESTILAR_EL_PANEL, FONDO_DEL_PANEL, LECTOR_DE_BLOQUES, LECTOR_DE_PANELES, LECTOR_DEL_DOCUMENTO, VARIAR_EL_CIERRE, raicesDelPanel, type Bloque, type FondoDelPanel, type TintaApagada, type VarianteDelCierre } from '../scripts-b8/lectores'
import { ESCENA_NUESTRA, OCULTAR_TODO_MENOS } from '../scripts-b8/ocultar'
import { mediaDeLaCaptura } from '../scripts-b8/particulas'

import { existsSync, readFileSync } from 'node:fs'

import { ANCLA_DE_LA_VENTANA_VISIBLE } from '../src/app/v3/_secciones/_contrato/bloqueAnimado'

import { LAS_SEIS, ORIGEN, PERFILES_DE_B11, SELECTOR_DE_LA_ESCENA, TEMP, argumento, asegurarCarpetas, asentarElHome, capturaPendiente, conElHome, dos, esDeLasSeis, jsonPendiente, mudarPendientes, perfilDeB11 } from './b11-comun'

/** La caja de la pastilla de navegación en el cuadro, en esta posición; `null` si no está montada. */
const LECTOR_DE_LA_PASTILLA = `(() => {
  const n = document.querySelector('[data-pieza="navegacion"] [data-parte="pastilla"]')
  if (n === null) return null
  const r = n.getBoundingClientRect()
  return r.width > 0 && r.height > 0 ? { x: r.left, y: r.top, ancho: r.width, alto: r.height } : null
})()`

interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

/** Una caja menos un rectángulo: hasta cuatro cajas (arriba, abajo, izquierda, derecha del recorte). */
function restar(caja: Caja, recorte: Caja): Caja[] {
  const x0 = Math.max(caja.x, recorte.x)
  const y0 = Math.max(caja.y, recorte.y)
  const x1 = Math.min(caja.x + caja.ancho, recorte.x + recorte.ancho)
  const y1 = Math.min(caja.y + caja.alto, recorte.y + recorte.alto)
  if (x1 <= x0 || y1 <= y0) return [caja]
  const partes: Caja[] = []
  if (y0 > caja.y) partes.push({ x: caja.x, y: caja.y, ancho: caja.ancho, alto: y0 - caja.y })
  if (y1 < caja.y + caja.alto) partes.push({ x: caja.x, y: y1, ancho: caja.ancho, alto: caja.y + caja.alto - y1 })
  if (x0 > caja.x) partes.push({ x: caja.x, y: y0, ancho: x0 - caja.x, alto: y1 - y0 })
  if (x1 < caja.x + caja.ancho) partes.push({ x: x1, y: y0, ancho: caja.x + caja.ancho - x1, alto: y1 - y0 })
  return partes.filter((p) => p.ancho > 0 && p.alto > 0)
}

interface Recorte {
  readonly pastilla: Caja | null
  readonly bloquesRecortados: number
  readonly pixelesDescontados: number
}

/** Los bloques con sus cajas recortadas contra la pastilla, y la cuenta de lo que se descontó. */
function recortarLaPastilla(bloques: readonly Bloque[], pastilla: Caja | null): { readonly bloques: Bloque[]; readonly recorte: Recorte } {
  if (pastilla === null) return { bloques: [...bloques], recorte: { pastilla: null, bloquesRecortados: 0, pixelesDescontados: 0 } }
  let recortados = 0
  let descontados = 0
  const salida = bloques.map((b) => {
    const cajas = b.cajas.flatMap((c) => restar(c, pastilla))
    const antes = b.cajas.reduce((n, c) => n + c.ancho * c.alto, 0)
    const despues = cajas.reduce((n, c) => n + c.ancho * c.alto, 0)
    if (Math.round(despues) !== Math.round(antes)) {
      recortados += 1
      descontados += antes - despues
    }
    return { ...b, cajas }
  })
  return { bloques: salida, recorte: { pastilla, bloquesRecortados: recortados, pixelesDescontados: Math.round(descontados) } }
}

interface PanelLeido {
  readonly id: string
  readonly superficie: string
  readonly alto: number
  readonly top: number
}

export interface CajaAterrizada {
  readonly clave: string
  readonly texto: string
  readonly opacidad: number
  readonly scrollY: number
  /** `documento`: `y` lleva el scroll sumado. `viewport`: el pin, la caja no se mueve. */
  readonly espacio: 'documento' | 'viewport'
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
  readonly tamanoPx: number
  readonly grande: boolean
}

interface LecturaDeSeccion {
  readonly id: string
  readonly superficieAlMedir: string
  readonly top: number
  readonly alto: number
  readonly posiciones: readonly LecturaDePosicion[]
  /** Por posición: la pastilla y lo que se le descontó a las cajas (B11). */
  readonly recortes: readonly (Recorte & { readonly scrollY: number })[]
  /** Los bloques crudos por posición —clave, cajas, opacidad— para poder re-evaluar sin volver a abrir el navegador. */
  readonly bloquesPorPosicion: readonly { readonly scrollY: number; readonly bloques: readonly { readonly clave: string; readonly cajas: readonly Caja[]; readonly opacidad: number }[] }[]
  readonly sala: readonly { readonly scrollY: number; readonly gris: number; readonly luminancia: number }[]
  readonly peorPorBloque: readonly LecturaDeBloque[]
  readonly veredicto: Veredicto
  readonly cajasAterrizadas: readonly CajaAterrizada[]
}

/**
 * Las posiciones de `c-las-ocho`: desde que la sección llena el cuadro hasta que
 * su pie toca el de la ventana, más el último píxel de scroll para el Cierre.
 *
 * ⚠️ **Y una más para las secciones de UNA pantalla, que B8 no tenía.** Para
 * ellas `c-las-ocho` fotografía una sola posición —la sección llenando el cuadro
 * exacto— y ahí el bloque de P5 del diferencial está a MEDIA ENTRADA: la regla
 * de B9 lo hace aterrizar `DESCANSO_ANTES_DE_SALIR_PX` (240) después, con su
 * borde inferior a 240 px del pie del cuadro. B8 lo leyó a opacidad 0 y lo
 * saltó (7 bloques); hoy se lee a 0,66–0,76 (17 bloques) y ninguna de las dos es
 * la lectura del texto quieto. La posición `top + 240` es donde el bloque llegó,
 * con la sección un 22 % (1440) afuera por arriba. Se agrega: no reemplaza.
 */
function posicionesDe(p: PanelLeido, ventana: number, altoDelDocumento: number, paso: number): number[] {
  const ys: number[] = []
  const fin = Math.min(p.top + p.alto - ventana, altoDelDocumento - ventana)
  for (let y = p.top; y < fin - 1; y += ventana * paso) ys.push(Math.round(y))
  ys.push(Math.round(Math.max(p.top, fin)))
  if (p.id === 'cierre' && altoDelDocumento - ventana > fin + 1) ys.push(altoDelDocumento - ventana)
  if (p.alto <= ventana + 1 && p.top + DESCANSO_ANTES_DE_SALIR_PX <= altoDelDocumento - ventana) ys.push(Math.round(p.top + DESCANSO_ANTES_DE_SALIR_PX))
  return [...new Set(ys)].filter((y) => y >= 0).sort((a, b) => a - b)
}

/** Los 240 px de la regla de B9, leídos del ancla y no escritos: donde un bloque de una sección de una pantalla ya aterrizó. */
const DESCANSO_ANTES_DE_SALIR_PX = -ANCLA_DE_LA_VENTANA_VISIBLE.fin.viewport.px

const claveDe = (b: Bloque): string => `${b.etiqueta}|${b.pieza ?? ''}|${b.nivel ?? ''}|${b.texto}`

/** La caja aterrizada: la lectura de mayor opacidad de cada bloque, unida y llevada al documento. */
function cajasAterrizadas(lecturas: readonly { scrollY: number; bloques: readonly Bloque[] }[], pinneada: boolean): CajaAterrizada[] {
  const mejor = new Map<string, CajaAterrizada>()
  for (const l of lecturas) {
    for (const b of l.bloques) {
      const opacidad = b.opacidad * b.alfaDeColor
      if (b.cajas.length === 0) continue
      const x0 = Math.min(...b.cajas.map((c) => c.x))
      const y0 = Math.min(...b.cajas.map((c) => c.y))
      const x1 = Math.max(...b.cajas.map((c) => c.x + c.ancho))
      const y1 = Math.max(...b.cajas.map((c) => c.y + c.alto))
      const clave = claveDe(b)
      const previa = mejor.get(clave)
      // A igual opacidad gana la lectura MÁS TARDÍA: un bloque de P2 leído antes
      // de entrar ya declara opacidad 1 en la cadena pero lleva su transformada
      // de entrada puesta (la caja del epígrafe de la foto salía 372 px por
      // debajo del pie de su sección). Después de aterrizar la transformada es
      // identidad y no vuelve a moverse.
      if (previa !== undefined && previa.opacidad > opacidad) continue
      mejor.set(clave, {
        clave,
        texto: b.texto,
        opacidad: Math.round(opacidad * 1000) / 1000,
        scrollY: l.scrollY,
        espacio: pinneada ? 'viewport' : 'documento',
        x: dos(x0),
        y: dos(pinneada ? y0 : y0 + l.scrollY),
        ancho: dos(x1 - x0),
        alto: dos(y1 - y0),
        tamanoPx: b.tamanoPx,
        grande: b.grande,
      })
    }
  }
  return [...mejor.values()]
}

async function medirUnPerfil(idDePerfil: string, etiqueta: string, paso: number, solo: readonly string[], variante: VarianteDelCierre | null, origen: string): Promise<Record<string, unknown>> {
  const perfil = perfilDeB11(idDePerfil)
  return conElHome(perfil, async (s) => {
    const { pagina } = s
    await asentarElHome(s)
    if (variante !== null) {
      if (!(await medir<boolean>(pagina, VARIAR_EL_CIERRE(variante)))) throw new Error(`no se pudo variar el Cierre a ${variante}`)
      console.log(`⚠ el Cierre se mide como ${variante} con el pie sin relleno, sin tocar el producto`)
    }
    const doc = await medir<{ altoDelDocumento: number; ventana: number; ancho: number }>(pagina, LECTOR_DEL_DOCUMENTO)
    const paneles = (await medir<PanelLeido[]>(pagina, LECTOR_DE_PANELES)).filter((p) => esDeLasSeis(p.id) && (solo.length === 0 || solo.includes(p.id)))
    console.log(`${perfil.id} «${etiqueta}»: documento ${doc.altoDelDocumento} px · ventana ${doc.ventana} · ${paneles.length} secciones · paso ${paso} pantallas`)
    const secciones: LecturaDeSeccion[] = []
    for (const panel of paneles) {
      const t0 = Date.now()
      console.log(`\n── ${panel.id} (${panel.superficie}, ${dos(panel.alto / doc.ventana)} pantallas desde y=${panel.top}) ──`)
      const posiciones: LecturaDePosicion[] = []
      const crudas: { scrollY: number; bloques: Bloque[] }[] = []
      const recortes: (Recorte & { readonly scrollY: number })[] = []
      const sala: { scrollY: number; gris: number; luminancia: number }[] = []
      for (const y of posicionesDe(panel, doc.ventana, doc.altoDelDocumento, paso)) {
        const logrado = await scrollA(pagina, y)
        if (Math.abs(logrado - y) > 1) throw new Error(`${panel.id}: se pidió y=${y} y el scroll quedó en ${logrado}`)
        await esperarElPrimerCuadro(pagina)
        await new Promise((r) => setTimeout(r, 1500))
        const fondo = await medir<FondoDelPanel>(pagina, FONDO_DEL_PANEL(panel.id))
        const leidos = await medir<Bloque[]>(pagina, LECTOR_DE_BLOQUES(panel.id))
        crudas.push({ scrollY: y, bloques: leidos })
        const pastilla = await medir<Caja | null>(pagina, LECTOR_DE_LA_PASTILLA)
        const { bloques, recorte } = recortarLaPastilla(leidos, pastilla)
        recortes.push({ ...recorte, scrollY: y })
        const base = `${TEMP}/${etiqueta}-${perfil.id}-${panel.id}-${y}`
        const rutas = { C: `${base}-C.png`, A: `${base}-A.png`, T: `${base}-T.png`, S: `${base}-S.png`, V: `${base}-V.png` }
        await capturar(pagina, rutas.C)
        const apagada = await medir<TintaApagada>(pagina, APAGAR_LA_TINTA(true))
        if (!apagada.tomo) throw new Error(`${panel.id}: la tinta no se apagó — ${JSON.stringify(apagada.rebeldes)}`)
        await capturar(pagina, rutas.A)
        await medir(pagina, APAGAR_LA_TINTA(false))
        if (!(await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, true))) throw new Error('la escena no quedó oculta')
        // T con el relleno plano de su superficie, sólo mientras se captura (MEDICION-NAVEGADOR.md §5).
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
        const lectura = evaluarLaPosicion({ C: leerImagen(rutas.C), A: leerImagen(rutas.A), T: leerImagen(rutas.T), S, V: leerImagen(rutas.V) }, bloques, fondo.rect, y, rutas)
        imprimirEscena(lectura)
        const media = mediaDeLaCaptura(S)
        sala.push({ scrollY: y, gris: media.gris, luminancia: media.luminancia })
        posiciones.push(lectura)
      }
      const peores = peorPorBloque(posiciones)
      const seccion: LecturaDeSeccion = {
        id: panel.id,
        superficieAlMedir: panel.superficie,
        top: panel.top,
        alto: panel.alto,
        posiciones,
        sala,
        peorPorBloque: peores,
        veredicto: veredictoDeLaSeccion(peores),
        cajasAterrizadas: cajasAterrizadas(crudas, panel.id === 'trabajos'),
        recortes,
        bloquesPorPosicion: crudas.map((c) => ({ scrollY: c.scrollY, bloques: c.bloques.map((b) => ({ clave: claveDe(b), cajas: b.cajas, opacidad: Math.round(b.opacidad * b.alfaDeColor * 1000) / 1000 })) })),
      }
      const recortados = recortes.filter((r) => r.bloquesRecortados > 0)
      if (recortados.length > 0) console.log(`  pastilla: ${recortados.map((r) => `y=${r.scrollY} ${r.bloquesRecortados} bloque(s), ${r.pixelesDescontados} px de caja`).join(' · ')}`)
      imprimirBloques(peores)
      console.log(`  ⇒ ${seccion.veredicto.toUpperCase()} — ${peores.length} bloques, ${peores.filter((b) => !b.pasaAA).length} fallan AA en su peor píxel · ${posiciones.length} posiciones · ${((Date.now() - t0) / 1000).toFixed(0)} s`)
      secciones.push(seccion)
      const primera = posiciones[0]
      const peor = posiciones.reduce((a, b) => (Math.min(...b.bloques.map((x) => x.peorContraste)) < Math.min(...a.bloques.map((x) => x.peorContraste)) ? b : a))
      capturaPendiente(primera.capturas.C, `${etiqueta}-${panel.id}-${perfil.id}-pose-C.png`)
      capturaPendiente(primera.capturas.S, `${etiqueta}-${panel.id}-${perfil.id}-pose-S.png`)
      if (peor !== primera) capturaPendiente(peor.capturas.C, `${etiqueta}-${panel.id}-${perfil.id}-peor-y${peor.scrollY}-C.png`)
    }
    return { etiqueta, perfil: perfil.id, paso, varianteDelCierre: variante, origen, documento: doc, secciones }
  }, 'b11-bloques', origen)
}

/** La unión con la tajada anterior de la misma anchura y etiqueta: las secciones nuevas pisan a las viejas, en el orden del recorrido. */
function fusionar(etiqueta: string, id: string, nueva: Record<string, unknown>): Record<string, unknown> {
  const ruta = `${TEMP}/bloques-${etiqueta}-${id}.json`
  if (!existsSync(ruta)) return nueva
  const previa = JSON.parse(readFileSync(ruta, 'utf8')) as { readonly secciones: readonly LecturaDeSeccion[] }
  const nuevas = (nueva as { readonly secciones: readonly LecturaDeSeccion[] }).secciones
  const ids = new Set(nuevas.map((s) => s.id))
  const union = [...previa.secciones.filter((s) => !ids.has(s.id)), ...nuevas]
  const orden = (s: LecturaDeSeccion): number => (LAS_SEIS as readonly string[]).indexOf(s.id)
  return { ...nueva, secciones: union.sort((a, b) => orden(a) - orden(b)) }
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const etiqueta = argumento('etiqueta', 'antes')
  const perfiles = argumento('perfil', PERFILES_DE_B11.map((p) => p.id).join(',')).split(',')
  const paso = Number(argumento('paso', '0.25'))
  const solo = argumento('solo', '').split(',').filter((x) => x.length > 0)
  const VARIANTES: readonly VarianteDelCierre[] = ['oscuro-transparente', 'papel-transparente', 'papel-opaco']
  const pedida = argumento('cierre', '')
  const variante = VARIANTES.find((v) => v === pedida) ?? null
  if (pedida !== '' && variante === null) throw new Error(`--cierre sólo acepta ${VARIANTES.join(', ')}, no «${pedida}»`)
  const origen = argumento('origen', ORIGEN)
  const t0 = Date.now()
  const resumen: string[] = []
  for (const id of perfiles) {
    const salida = fusionar(etiqueta, id, await medirUnPerfil(id, etiqueta, paso, solo, variante, origen))
    jsonPendiente(`bloques-${etiqueta}-${id}`, salida)
    for (const sec of salida.secciones as readonly LecturaDeSeccion[]) {
      const peor = Math.min(...sec.peorPorBloque.map((b) => b.peorContraste))
      resumen.push(`  ${id.padEnd(5)} ${sec.id.padEnd(16)} ${String(sec.peorPorBloque.length).padStart(3)} bloques · ${String(sec.peorPorBloque.filter((b) => !b.pasaAA).length).padStart(3)} fallan · peor ${Number.isFinite(peor) ? peor.toFixed(2) : '—'} · ${sec.veredicto}`)
    }
  }
  for (const r of mudarPendientes()) console.log(`escrito: ${r}`)
  console.log('\n══ RESUMEN ══')
  for (const r of resumen) console.log(r)
  console.log(`  ${((Date.now() - t0) / 1000).toFixed(0)} s`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
