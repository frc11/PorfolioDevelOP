import { cargaLista, hayPrimerCuadro } from '../carga'
import { laEscenaCayo } from '../escena/caida'
import { DIA_DEL_FINAL, NOCHE_DISPARADA, bloqueTapaElCuadro, medirElBloqueOpaco } from '../escena/nocheDisparada'
import { letrasDelDom } from '../escena/titulos3d/colocacion'
import { suscribirAlViaje, viajeEnCurso } from '../escena/viaje'
import { progresoEnRango, rangoDeScroll, type ParDeAnclas } from '../motion/anclas'
import { fotoDeLaEpocaActual } from '../motion/epoca'
import { PIEZAS_DEL_PIE, pieListo } from '../pie3d/registro'
import { RELEVO_DE_LOS_TITULOS, TITULOS_DE_VOLUMEN, tituloListo } from '../titulos3d/registro'
import { lineaDeLaNoche } from '../../_secciones/trabajos/geometria'
import { cantidadDeLaNoche, cruceDelTramo } from '../../_secciones/trabajos/gota'
import { EVENTOS, IMPRESIONES, VISTOS, anotar, fuenteCargadaPara, type BloqueVisto, type EventoDeLaCarga } from './anotar'
import { UMBRALES_DE_LA_CARGA, fallasDe, type BloqueDelDiag, type EstadoDelDiag, type FallaDeLaCarga, type RotuloDelDiag, type TextoDelDiag } from './fallas'

/**
 * [CIERRE A-ter] A13 · `window.__v3diag` (sólo con `?diag=carga`; lo carga `anotar.ts`): el estado de la carga en cada momento, para el
 * arnés de estrés. Lee lo que el producto anotó (`anotar.ts`) y lo que ya tiene a mano (los registros de los títulos y del pie, la
 * carga, la escena, la época, la noche); `fallas` lo pasa por `fallasDe` (`fallas.ts`). Medir acá fuerza el layout: el arnés lo llama
 * en momentos sueltos, nunca por cuadro.
 */

/** La referencia de los bloques: el rango de cada uno en una carga limpia (la toma el arnés). */
export type ReferenciaDeLosBloques = Readonly<Record<string, { readonly inicio: number; readonly fin: number }>>

export interface EstadoCompleto extends EstadoDelDiag {
  readonly fuentes: { readonly estado: string; readonly caras: readonly string[] }
  readonly escena: { readonly lienzo: boolean; readonly contexto: 'vivo' | 'perdido' | 'sin'; readonly primerCuadro: boolean; readonly caida: boolean; readonly cargaLista: boolean }
  readonly lenis: { readonly scroll: number; readonly destino: number; readonly moviendose: string; readonly frenado: boolean } | null
  readonly rangos: Readonly<Record<string, { readonly inicio: number; readonly fin: number } | null>>
  /** El rango de cada bloque medido ahora en el layout (sin lo pegado ni lo transformado): para comparar con el que midió. */
  readonly rangosDelLayout: Readonly<Record<string, { readonly inicio: number; readonly fin: number }>>
}

/** Lo liviano (sin medir el layout): para esperar la llegada de un viaje sin tocar la página. */
export interface PulsoDeLaCarga {
  readonly t: number
  readonly scrollY: number
  readonly viaje: string | null
  readonly lenis: string | null
  readonly visible: boolean
  readonly listo: boolean
  /** La escena dibujó su primer cuadro (o se cayó): la página terminó de cargar lo que se ve. */
  readonly escenaLista: boolean
}

interface Diagnostico {
  readonly version: 1
  readonly pulso: () => PulsoDeLaCarga
  readonly estado: (referencia?: ReferenciaDeLosBloques) => EstadoCompleto
  readonly fallas: (referencia?: ReferenciaDeLosBloques) => FallaDeLaCarga[]
  readonly eventos: () => readonly EventoDeLaCarga[]
}

type VentanaDelDiag = Window & { __v3diag?: Diagnostico }

/**
 * [CIERRE A-ter] A13b · lo que la placa del formulario imprime (lo mismo que mide `pie3d/medida.ts`: los rótulos, la tecla y el relieve de la
 * tarjeta), cada uno con lo que se ve de su propio DOM: el formulario entero queda vivo a propósito, sus textos impresos no.
 */
function rotulosDelFormulario(raiz: Element): RotuloDelDiag[] {
  return [...raiz.querySelectorAll('label, [data-forma="principal"], [data-relieve]')]
    .map((e) => ({ rotulo: (e.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 24), domOpacidad: opacidadEfectiva(e) }))
    .filter((r) => r.rotulo !== '')
}

/** Lo que se ve del DOM de un texto (0 a 1): su opacidad y la de sus ancestros; sin caja, oculto, apagado por filtro o transparente, 0. */
function opacidadEfectiva(el: Element): number {
  if (!el.isConnected) return 0
  const propio = getComputedStyle(el)
  if (propio.visibility !== 'visible' || /,\s*0\)$|^transparent$/.test(propio.color)) return 0
  let o = 1
  for (let e: Element | null = el; e !== null && o > 0; e = e.parentElement) {
    const s = getComputedStyle(e)
    if (s.display === 'none' || /opacity\(0(\.0*)?%?\)/.test(s.filter)) return 0
    o *= parseFloat(s.opacity)
  }
  return o
}

function enPantalla(el: Element): boolean {
  const r = el.getBoundingClientRect()
  return el.isConnected && r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth
}

/** Lo más que se corrió una letra entre la impresión y ahora (em); con otra cantidad de letras, 9,99. */
function letrasCorridas(antes: readonly number[] | null, el: HTMLElement): number | null {
  if (antes === null) return null
  const ahora = letrasDelDom(el)?.x ?? null
  if (ahora === null) return null
  if (ahora.length !== antes.length) return 9.99
  return ahora.reduce((m, x, k) => Math.max(m, Math.abs(x - antes[k])), 0)
}

/** Hace cuánto (ms) se marcó listo `id` por última vez (de la línea de tiempo); `null` si no se sabe. */
function listoHace(id: string, ahora: number): number | null {
  for (let k = EVENTOS.length - 1; k >= 0; k -= 1) if (EVENTOS[k].que === 'listo' && EVENTOS[k].id === id) return ahora - EVENTOS[k].t
  return null
}

function textos(): TextoDelDiag[] {
  const ahora = Math.round(performance.now())
  const lista: TextoDelDiag[] = []
  const viaje = viajeEnCurso() !== null
  for (const t of TITULOS_DE_VOLUMEN.values()) {
    const id = `titulo:${t.id}`
    const i = IMPRESIONES.get(id) ?? null
    const armado = VISTOS.titulos?.find((a) => a.titulo.id === t.id) ?? null
    const listo = tituloListo(t.id)
    const debe = !viaje && !RELEVO_DE_LOS_TITULOS.relevado(t.id) && t.llegada >= UMBRALES_DE_LA_CARGA.llegado && t.salida <= 1 - UMBRALES_DE_LA_CARGA.llegado && (t.queda && !t.rearma ? cargaLista() : true)
    lista.push({ id, sistema: 'titulo', listoHaceMs: listoHace(id, ahora), listo, enPantalla: enPantalla(t.lugar), domOpacidad: opacidadEfectiva(t.lugar), impreso: i, fuenteCargadaAhora: fuenteCargadaPara(t.lugar), letrasCorridasEm: listo && i !== null ? letrasCorridas(i.letras, t.lugar) : null, dibujada: armado === null ? null : armado.malla.visible, debeDibujarse: debe })
  }
  const elPie = pieListo()
  for (const p of PIEZAS_DEL_PIE.values()) {
    const id = `pie:${p.id}`
    lista.push({ id, sistema: 'pie', listoHaceMs: listoHace('pie', ahora), listo: elPie, enPantalla: enPantalla(p.elemento), domOpacidad: opacidadEfectiva(p.elemento), impreso: IMPRESIONES.get(id) ?? null, fuenteCargadaAhora: fuenteCargadaPara(p.elemento), letrasCorridasEm: null, dibujada: null, debeDibujarse: false, ...(p.forma === 'formulario' ? { rotulos: rotulosDelFormulario(p.elemento) } : {}) })
  }
  for (const [id, i] of IMPRESIONES) {
    if (!id.startsWith('tarjeta:')) continue
    lista.push({ id, sistema: 'tarjeta', listoHaceMs: ahora - i.t, listo: i.elemento.isConnected, enPantalla: enPantalla(i.elemento), domOpacidad: opacidadEfectiva(i.elemento), impreso: i, fuenteCargadaAhora: fuenteCargadaPara(i.elemento), letrasCorridasEm: null, dibujada: null, debeDibujarse: false })
  }
  return lista
}

/** La caja de un elemento en el layout, como si nada estuviera pegado ni transformado (px del documento). */
function cajaDelLayout(el: HTMLElement): { readonly topDoc: number; readonly alto: number } {
  const pegados: [HTMLElement, string][] = []
  for (let a: HTMLElement | null = el; a !== null; a = a.parentElement) {
    if (getComputedStyle(a).position !== 'sticky') continue
    pegados.push([a, a.style.position])
    a.style.position = 'static'
  }
  let y = 0
  for (let a: HTMLElement | null = el; a !== null; a = a.offsetParent instanceof HTMLElement ? a.offsetParent : null) y += a.offsetTop
  const alto = el.offsetHeight
  for (const [a, antes] of pegados) a.style.position = antes
  return { topDoc: y, alto }
}

/** Un resumen corto y estable de un texto (djb2, en base 36). */
function resumen(s: string): string {
  let h = 5381
  for (let k = 0; k < s.length; k += 1) h = ((h << 5) + h + s.charCodeAt(k)) | 0
  return (h >>> 0).toString(36)
}

/** Cada bloque con su id estable (su sección, su anclaje y su orden): en el orden del documento, y si no, en el de montaje. */
function bloquesConId(): [string, BloqueVisto, HTMLElement][] {
  const vivos = [...VISTOS.bloques].flatMap((b): [BloqueVisto, HTMLElement][] => {
    const el = b.elemento()
    return el === null || !el.isConnected ? [] : [[b, el]]
  })
  vivos.sort(([, a], [, b]) => (a === b ? 0 : a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
  const vistos = new Map<string, number>()
  return vivos.map(([b, el]) => {
    const seccion = el.closest('[data-panel]')?.getAttribute('data-panel') ?? el.querySelector('[data-panel]')?.getAttribute('data-panel') ?? el.closest('section')?.id ?? '?'
    const base = `${seccion}|${el.tagName === 'SECTION' ? 'seccion' : (el.closest('[data-rango]')?.getAttribute('data-rango') ?? 'propia')}|${resumen(JSON.stringify(b.anclas))}`
    const k = vistos.get(base) ?? 0
    vistos.set(base, k + 1)
    return [`${base}|${String(k)}`, b, el]
  })
}

interface DeLosBloques {
  readonly lista: BloqueDelDiag[]
  readonly rangos: Record<string, { inicio: number; fin: number } | null>
  readonly delLayout: Record<string, { inicio: number; fin: number }>
}
function bloques(referencia: ReferenciaDeLosBloques | undefined, alto: number): DeLosBloques {
  const y = scrollY
  const lista: BloqueDelDiag[] = []
  const rangos: Record<string, { inicio: number; fin: number } | null> = {}
  const delLayout: Record<string, { inicio: number; fin: number }> = {}
  for (const [id, b, el] of bloquesConId()) {
    const guardado = b.rango()
    rangos[id] = guardado === null ? null : { inicio: guardado.inicio, fin: guardado.fin }
    const layout = rangoDeScroll(b.anclas as ParDeAnclas, cajaDelLayout(el), alto)
    delLayout[id] = { inicio: layout.inicio, fin: layout.fin }
    const ref = referencia?.[id]
    const esperado = progresoEnRango(y, ref ?? layout)
    lista.push({ id, enPantalla: enPantalla(el), medido: guardado !== null, progreso: guardado === null ? 0 : progresoEnRango(y, guardado), esperado })
  }
  return { lista, rangos, delLayout }
}

/** La noche que deja el scroll (la regla de las cuatro entradas de `CapaDeLaGota`); `null` donde no rige (tapada o con el día del final). */
function nocheEsperada(): number | null {
  const panel = document.querySelector('[data-panel="trabajos"]')
  const caja = panel?.querySelector('[data-caja-sin-solape]') ?? panel
  const opaco = medirElBloqueOpaco(document, innerHeight)
  if (caja === null || caja === undefined || DIA_DEL_FINAL.activo || (opaco !== null && bloqueTapaElCuadro(opaco))) return null
  const r = caja.getBoundingClientRect()
  const cruza = r.top < lineaDeLaNoche(innerHeight) && r.bottom > 0
  return cantidadDeLaNoche(cruceDelTramo({ cruza, tope: r.top, pie: r.bottom }) === 'arriba-subiendo' ? 0 : 1)
}

function contexto(): 'vivo' | 'perdido' | 'sin' {
  const lienzo = document.querySelector('[data-escena] canvas')
  if (!(lienzo instanceof HTMLCanvasElement)) return 'sin'
  const gl = lienzo.getContext('webgl2')
  return gl === null ? 'sin' : gl.isContextLost() ? 'perdido' : 'vivo'
}

function estado(referencia?: ReferenciaDeLosBloques): EstadoCompleto {
  const foto = fotoDeLaEpocaActual()
  const { lista, rangos, delLayout } = bloques(referencia, foto.alto > 0 ? foto.alto : innerHeight)
  const remate = document.querySelector<HTMLElement>('[data-pieza="remate-del-panel"]')
  const tunel = VISTOS.tunel
  const lenis = VISTOS.lenis
  return {
    t: Math.round(performance.now()),
    visible: document.visibilityState === 'visible' && innerWidth > 0,
    scrollY,
    viaje: viajeEnCurso()?.destino ?? null,
    epoca: { epoca: foto.epoca, alto: foto.alto },
    textos: textos(),
    bloques: lista,
    noche: { actual: NOCHE_DISPARADA.cantidad, esperada: nocheEsperada() },
    remate: remate === null ? null : { enPantalla: enPantalla(remate), estado: remate.getAttribute('data-estado') },
    tunel: tunel === null ? null : { enPantalla: enPantalla(tunel.panel), corriendo: tunel.corriendo(), mostrado: tunel.mostrado(), pedido: tunel.pedido() },
    fuentes: { estado: document.fonts.status, caras: [...document.fonts].map((f) => `${f.family} ${f.style} ${f.weight}: ${f.status}`) },
    escena: { lienzo: document.querySelector('[data-escena] canvas') !== null, contexto: contexto(), primerCuadro: hayPrimerCuadro(), caida: laEscenaCayo(), cargaLista: cargaLista() },
    lenis: lenis === null ? null : { scroll: lenis.scroll, destino: lenis.targetScroll, moviendose: String(lenis.isScrolling), frenado: lenis.isStopped },
    rangos,
    rangosDelLayout: delLayout,
  }
}

/** Los eventos del lienzo (su contexto) y de las fuentes, en la línea de tiempo. */
function escuchar(): void {
  const vistos = new WeakSet<HTMLCanvasElement>()
  const alLienzo = (): void => {
    const lienzo = document.querySelector('[data-escena] canvas')
    if (!(lienzo instanceof HTMLCanvasElement) || vistos.has(lienzo)) return
    vistos.add(lienzo)
    anotar('lienzo')
    lienzo.addEventListener('webglcontextlost', () => anotar('contexto-perdido'))
    lienzo.addEventListener('webglcontextrestored', () => anotar('contexto-repuesto'))
  }
  new MutationObserver(alLienzo).observe(document.body, { childList: true, subtree: true })
  alLienzo()
  document.fonts.addEventListener('loadingdone', (e) => anotar('fuentes-cargadas', '', [...e.fontfaces].map((f) => `${f.family} ${f.style} ${f.weight}`).join(' · ')))
  document.fonts.addEventListener('loadingerror', (e) => anotar('fuentes-error', '', [...e.fontfaces].map((f) => f.family).join(' · ')))
  void document.fonts.ready.then(() => anotar('fuentes-listas', '', document.fonts.status))
  document.addEventListener('visibilitychange', () => anotar('visibilidad', '', document.visibilityState))
  // Cada clic en un ancla del documento: si lo tomó el viaje (`preventDefault`) o fue el salto nativo.
  document.addEventListener(
    'click',
    (e) => {
      const enlace = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null
      if (enlace === null) return
      window.setTimeout(() => anotar('clic', enlace.getAttribute('href') ?? '', e.defaultPrevented ? 'viaje' : 'NATIVO'), 0)
    },
    true,
  )
  suscribirAlViaje(() => {
    const v = viajeEnCurso()
    anotar(v === null ? 'fin-del-viaje' : 'viaje', v?.destino ?? '', `scroll ${String(Math.round(scrollY))}`)
  })
}

export function publicarElDiagnostico(): void {
  const ventana = window as VentanaDelDiag
  if (ventana.__v3diag !== undefined) return
  escuchar()
  const pulso = (): PulsoDeLaCarga => ({ t: Math.round(performance.now()), scrollY, viaje: viajeEnCurso()?.destino ?? null, lenis: VISTOS.lenis === null ? null : String(VISTOS.lenis.isScrolling), visible: document.visibilityState === 'visible', listo: document.readyState === 'complete', escenaLista: hayPrimerCuadro() || laEscenaCayo() })
  ventana.__v3diag = { version: 1, pulso, estado, fallas: (referencia) => fallasDe(estado(referencia)), eventos: () => [...EVENTOS] }
  anotar('diagnostico')
}
