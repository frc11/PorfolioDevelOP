import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../../_lib/__tests__/afirmar'
import { arranqueDeDemos, arranqueDeLaSalida } from '../geometria'

import { MS_DEL_GENIE, TIRAS_DEL_GENIE, esquinasDeLaTira, filaDelGenie, liderDelGenie, proyectar, type Caja } from './genie'
import { Biblioteca } from './Biblioteca'
import { CATALOGO_DE_DEMOS } from './catalogo'
import { siguienteFoco } from './dialogo'
import { LLEGADA, conSobrepaso, enElTramo, escalaDeDemos, poseDelLibro, tramoDelLibro } from './entrada'

/**
 * §25 DEL INVARIANTE DE TRABAJOS — **LAS DEMOS.** Lo llama `trabajos.invariant`.
 *
 * Los cuatro que pidió el sprint —foco atrapado y devuelto, una sola demo viva,
 * la página quieta con la ventana abierta y las piezas focalizables— y tres que
 * sostienen lo demás: la copia del catálogo atada al sitio vivo, el cartel con la
 * pastilla del navbar y la entrada sin ley nueva. Cada uno con su control.
 */

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const leer = (...partes: string[]): string => readFileSync(path.join(AQUI, ...partes), 'utf8')

const VENTANA = leer('VentanaDeDemo.tsx')
const DIALOGO = leer('dialogo.ts')
const CAPA = leer('CapaDeDemos.tsx')
const HOJA = leer('../../../_estilos/demos.css')
const NAVEGACION = leer('../../../_estilos/navegacion.css')
const VIVO = leer('../../../../../components/sections/web-development/WebTemplatesImmersive.tsx')

/** Los pares nombre → URL del sitio vivo, leídos de su fuente. */
function catalogoDelSitioVivo(fuente: string): { nombre: string; url: string }[] {
  return [...fuente.matchAll(/name: "([^"]+)",[\s\S]*?url: "([^"]+)"/g)].map((m) => ({ nombre: m[1], url: m[2] }))
}

/** Las declaraciones de una regla, por su selector exacto. */
function declaracionesDe(hoja: string, selector: string): Map<string, string> {
  const inicio = hoja.indexOf(`${selector} {`)
  const cuerpo = inicio < 0 ? '' : hoja.slice(inicio + selector.length + 2, hoja.indexOf('}', inicio))
  const mapa = new Map<string, string>()
  for (const linea of cuerpo.split(';')) {
    const [prop, ...valor] = linea.split(':')
    if (prop !== undefined && valor.length > 0) mapa.set(prop.trim(), valor.join(':').trim())
  }
  return mapa
}

const PASTILLA = ['border', 'border-radius', 'background-color', 'backdrop-filter', 'box-shadow'] as const
const copiaLaPastilla = (hoja: string): boolean => {
  const nav = declaracionesDe(NAVEGACION, '[data-v3] [data-pieza="navegacion"] > [data-parte="pastilla"]')
  const cartel = declaracionesDe(hoja, '[data-v3] [data-pieza="cartel-de-demos"]')
  return PASTILLA.every((p) => nav.get(p) !== undefined && nav.get(p) === cartel.get(p))
}

/** Las paradas del estante: anclas con destino y sin `tabindex="-1"`. */
const piezasFocalizables = (html: string): number =>
  (html.match(/<a [^>]*data-pieza="libro"[^>]*>/g) ?? []).filter((a) => a.includes('href="') && !a.includes('tabindex="-1"')).length

const pausaLaPagina = (dialogo: string, ventana: string): boolean =>
  dialogo.includes("html.style.overflow = 'hidden'") &&
  dialogo.includes('html.style.overflow = overflowAntes') &&
  ventana.includes('data-lenis-prevent=""') &&
  !/\.stop\(\)/.test(sinComentarios(dialogo + ventana))

/** El código sin sus comentarios: la prosa puede nombrar lo que el código no hace. */
function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}

const unaSolaViva = (capa: string, ventana: string): boolean =>
  (ventana.match(/<iframe\b/g) ?? []).length === 1 &&
  capa.includes('useState<{ readonly demo: Demo; readonly pieza: HTMLAnchorElement } | null>(null)') &&
  capa.includes('{abierta === null ? null : (')

const devuelveElFoco = (ventana: string): boolean => ventana.includes('requestAnimationFrame(() => pieza.focus({ preventScroll: true }))')

export function afirmarLasDemos(): void {
  titulo('25 · Las demos: el catálogo, la entrada, el estante y la ventana')

  // ── EL CATÁLOGO ES UNA COPIA ATADA ────────────────────────────────────
  const vivo = catalogoDelSitioVivo(VIVO)
  afirmarIgual(
    CATALOGO_DE_DEMOS.map((d) => ({ nombre: d.nombre, url: d.url })),
    vivo,
    `el catálogo de /v3 es el del sitio vivo, en su orden: ${String(vivo.length)} demos, mismos nombres y mismas URLs`,
  )
  controlPositivo('  el detector ve una demo del sitio vivo que la copia perdió', VIVO.replace('name: "YAKU Nebula"', 'name: "YAKU Nebula 2"'), (f: string) =>
    JSON.stringify(catalogoDelSitioVivo(f)) === JSON.stringify(CATALOGO_DE_DEMOS.map((d) => ({ nombre: d.nombre, url: d.url }))),
  )

  // ── LA ENTRADA: SIN LEY NUEVA ─────────────────────────────────────────
  const n = 3
  afirmarIgual(escalaDeDemos(arranqueDeLaSalida(n)), 0, 'la capa de demos está en cero donde nace el vacío')
  afirmarIgual(escalaDeDemos(arranqueDeDemos(n)), 1, '  y en 1 exacto al final de la ventana de la salida: el vacío ya llenó el cuadro')
  let noBaja = true
  for (let k = 0; k <= 200; k += 1) {
    const a = arranqueDeLaSalida(n) + ((arranqueDeDemos(n) - arranqueDeLaSalida(n)) * k) / 200
    const b = a + (arranqueDeDemos(n) - arranqueDeLaSalida(n)) / 200
    if (escalaDeDemos(b) < escalaDeDemos(a)) noBaja = false
  }
  afirmar(noBaja, '  y en el medio crece sin volver atrás: es la misma recta con clamp del vacío')

  // ── LA LLEGADA, ESCALONADA Y ATADA AL VACÍO ───────────────────────────
  const libros = CATALOGO_DE_DEMOS.length
  const tramos = [LLEGADA.titulo, LLEGADA.parrafo, ...CATALOGO_DE_DEMOS.map((_, i) => tramoDelLibro(i, libros))]
  afirmar(tramos.every((t) => t.desde >= 0.6), 'hasta el 60 % del vacío no llega nada: sólo crece el vacío y se ve la escena')
  afirmarIgual(tramoDelLibro(libros - 1, libros).hasta, 1, `  y el último de los ${String(libros)} libros se asienta en el 100 % exacto: cuando el vacío llena el cuadro`)
  afirmar(CATALOGO_DE_DEMOS.every((_, i) => i === 0 || tramoDelLibro(i, libros).desde > tramoDelLibro(i - 1, libros).desde), '  los libros llegan de izquierda a derecha, uno detrás del otro')
  afirmar(LLEGADA.titulo.desde < LLEGADA.parrafo.desde && LLEGADA.parrafo.desde <= LLEGADA.libros.desde, '  el orden es título, párrafo y libros')
  let pico = 0
  for (let k = 0; k <= 100; k += 1) pico = Math.max(pico, conSobrepaso(k / 100))
  afirmar(pico > 1.05 && conSobrepaso(1) === 1, `el sobrepaso elástico es la FORMA de la curva: llega a ${pico.toFixed(3)} y termina en 1`)
  afirmarIgual(poseDelLibro(1), { transform: 'none', opacidad: 1 }, '  y un libro asentado queda sin transformada y entero')
  afirmar(enElTramo(0.5, LLEGADA.titulo) === 0 && enElTramo(0.9, LLEGADA.titulo) === 1, '  el título está abajo antes de su tramo y en su lugar después')
  const sinReloj = (capa: string): boolean => {
    const codigo = sinComentarios(capa)
    return codigo.includes('llegar(escala.current)') && !/requestAnimationFrame|setTimeout|setInterval|performance\.now/.test(codigo)
  }
  afirmar(sinReloj(CAPA), '  la llegada no tiene reloj propio: es una función de la fracción del vacío, así que subiendo se deshace exacta y al revés')
  controlPositivo('  el detector ve una llegada con reloj', `${CAPA}\nrequestAnimationFrame(() => llegar(escala.current))\n`, sinReloj)

  // ── EL ESTANTE: UNA PIEZA FOCALIZABLE POR DEMO ────────────────────────
  const estante = renderToStaticMarkup(<Biblioteca alAbrir={() => undefined} alejada={false} />)
  afirmarIgual(piezasFocalizables(estante), CATALOGO_DE_DEMOS.length, `las ${String(CATALOGO_DE_DEMOS.length)} piezas son anclas con destino y sin tabindex negativo: todas son paradas de teclado`)
  afirmar((estante.match(/aria-haspopup="dialog"/g) ?? []).length === CATALOGO_DE_DEMOS.length, '  y cada una anuncia que abre un diálogo')
  controlPositivo('  el detector ve una pieza sacada del recorrido', estante.replace('data-pieza="libro"', 'tabindex="-1" data-pieza="libro"'), (h: string) => piezasFocalizables(h) === CATALOGO_DE_DEMOS.length)

  // ── EL CARTEL ES LA PASTILLA DEL NAVBAR ───────────────────────────────
  afirmar(copiaLaPastilla(HOJA), '  el cartel declara las cinco propiedades de la pastilla del navbar con los MISMOS tokens: borde, radio, superficie, desenfoque y sombra')
  controlPositivo('  el detector ve un cartel con otra sombra', HOJA.replace(/box-shadow: var\(--shadow-flotante\);(\s*)pointer-events: none;/, 'box-shadow: none;$1pointer-events: none;'), copiaLaPastilla)

  // ── EL DIÁLOGO: FOCO ATRAPADO Y DEVUELTO ──────────────────────────────
  const tres = ['a', 'b', 'c'].map((id) => ({ id }) as unknown as HTMLElement)
  afirmar(siguienteFoco(tres, tres[2], false) === tres[0] && siguienteFoco(tres, tres[0], true) === tres[2], 'el foco da la vuelta adentro del diálogo en las dos puntas: Tab al final vuelve al primero, Shift+Tab al principio va al último')
  afirmar(DIALOGO.includes("document.addEventListener('focusin', alEntrarElFoco)") && DIALOGO.includes('!el.contains(destino)'), '  y un foco que se escapa del diálogo vuelve adentro')
  afirmar(devuelveElFoco(VENTANA), '  y al cerrar vuelve a la pieza que lo abrió, un cuadro después de desmontarse')
  controlPositivo('  el detector ve un cierre que no devuelve el foco', VENTANA.replace('requestAnimationFrame(() => pieza.focus({ preventScroll: true }))', 'void 0'), devuelveElFoco)
  afirmar(VENTANA.includes('role="dialog"') && VENTANA.includes('aria-modal="true"') && VENTANA.includes('aria-label={`${demo.nombre} — demo en vivo`}'), '  es un diálogo modal con el nombre del template como título')

  // ── UNA SOLA DEMO VIVA ────────────────────────────────────────────────
  afirmar(unaSolaViva(CAPA, VENTANA), 'una sola demo viva: el estado guarda UNA, la ventana tiene UN iframe y al cerrar se desmonta entera')
  controlPositivo('  el detector ve una ventana con dos iframes', VENTANA.replace('<iframe', '<iframe src="" /><iframe'), (v: string) => unaSolaViva(CAPA, v))

  // ── LA PÁGINA QUIETA CON LA VENTANA ABIERTA ───────────────────────────
  afirmar(pausaLaPagina(DIALOGO, VENTANA), 'con la ventana abierta la página no se mueve: `overflow: hidden` en el <html>, devuelto al cerrar, y `data-lenis-prevent` en el diálogo — sin `lenis.stop()`, que el repo prohíbe')
  controlPositivo('  el detector ve un diálogo que deja correr la página', DIALOGO.replace("html.style.overflow = 'hidden'", 'void 0'), (d: string) => pausaLaPagina(d, VENTANA))
  controlPositivo('  y ve un diálogo que frena el motor de scroll', `${DIALOGO}\nlenis.stop()\n`, (d: string) => pausaLaPagina(d, VENTANA))

  // ── LA APERTURA Y EL CIERRE: EL GENIE ─────────────────────────────────
  afirmarElGenie()
}

/** El Genie: la geometría contra los cuadros que describió el pedido. */
function afirmarElGenie(): void {
  const ventana: Caja = { x: 144, y: 90, ancho: 1152, alto: 720 }
  const libro: Caja = { x: 1040, y: 470, ancho: 160, alto: 240 }
  const lider = liderDelGenie(ventana, libro)
  afirmarIgual(lider, 'abajo', 'con el libro debajo del centro de la ventana, lidera el borde de abajo: es el Genie de minimizar hacia el Dock')
  afirmarIgual(liderDelGenie(ventana, { ...libro, y: 60 }), 'arriba', '  y con el destino arriba, lidera el de arriba: el lado sale del destino, no se fija')
  const plana = [0, 0.5, 1].map((v) => filaDelGenie(v, 0, ventana, libro, lider))
  afirmar(plana.every((f, k) => f.izquierda === ventana.x && f.derecha === ventana.x + ventana.ancho && f.y === ventana.y + [0, 0.5, 1][k] * ventana.alto), 'en 0 la ventana está plana: cada fila en su lugar, con su ancho entero')
  const adentro = [0, 1].map((v) => filaDelGenie(v, 1, ventana, libro, lider))
  afirmar(adentro[0].y === libro.y && adentro[1].y === libro.y + libro.alto && adentro.every((f) => f.izquierda === libro.x && f.derecha === libro.x + libro.ancho), '  y en 1 está entera adentro del libro')
  // Cuadro 2: el borde de abajo se tira hacia el destino y el de arriba sigue recto y ancho.
  const arriba = filaDelGenie(0, 0.2, ventana, libro, lider)
  const abajo = filaDelGenie(1, 0.2, ventana, libro, lider)
  afirmar(arriba.izquierda === ventana.x && arriba.derecha === ventana.x + ventana.ancho, 'al empezar, el borde de ARRIBA sigue recto y ancho')
  const barreIzquierda = abajo.izquierda - ventana.x
  const barreDerecha = ventana.x + ventana.ancho - abajo.derecha
  afirmar(barreIzquierda > 40 && barreIzquierda > 4 * barreDerecha, `  y el de ABAJO se tira al libro: su esquina izquierda barre ${barreIzquierda.toFixed(0)} px y la derecha ${barreDerecha.toFixed(0)} — el borde del lado del destino queda casi vertical`)
  const espejo = filaDelGenie(1, 0.2, ventana, { ...libro, x: 200 }, lider)
  afirmar(ventana.x + ventana.ancho - espejo.derecha > 4 * (espejo.izquierda - ventana.x), '  y con el libro a la izquierda la curva cambia de lado: la deriva el destino')
  // Cuadros 3–4: cada fila se comprime más cuanto más cerca está del fondo.
  const m = 0.6
  const alturaDeFila = (v: number): number => filaDelGenie(v + 0.05, m, ventana, libro, lider).y - filaDelGenie(v, m, ventana, libro, lider).y
  afirmar(alturaDeFila(0.9) < alturaDeFila(0.1), `a mitad del viaje las filas de abajo están más comprimidas que las de arriba (${alturaDeFila(0.9).toFixed(1)} px contra ${alturaDeFila(0.1).toFixed(1)} px por cada 5 %)`)
  // Cuadro 5: al final baja y se angosta también el borde de arriba.
  const tarde = filaDelGenie(0, 0.85, ventana, libro, lider)
  afirmar(tarde.y > ventana.y + 50 && tarde.derecha - tarde.izquierda < ventana.ancho * 0.8, '  y al final el borde de arriba también baja y se angosta: la ventana entera se desliza por el embudo')
  afirmar(MS_DEL_GENIE >= 500 && MS_DEL_GENIE <= 600, `el Genie dura ${String(MS_DEL_GENIE)} ms: los 500–600 del pedido`)
  // Las tiras: cuadriláteros que comparten el borde, llevados por una proyectiva exacta.
  const alto = ventana.alto / TIRAS_DEL_GENIE
  const esquinas = esquinasDeLaTira(TIRAS_DEL_GENIE - 1, TIRAS_DEL_GENIE, 0.4, ventana, libro, lider, 0)
  const puestas = [proyectar(esquinas, ventana.ancho, alto, 0, 0), proyectar(esquinas, ventana.ancho, alto, ventana.ancho, 0), proyectar(esquinas, ventana.ancho, alto, ventana.ancho, alto), proyectar(esquinas, ventana.ancho, alto, 0, alto)]
  const error = Math.max(...puestas.map((p, k) => Math.hypot(p.x - esquinas[k].x, p.y - esquinas[k].y)))
  afirmar(error < 0.01, `la transformada de cada tira lleva sus cuatro esquinas a su cuadrilátero (error ${error.toExponential(1)} px): los bordes curvos se unen fila a fila, sin escalera`)
  const siguiente = esquinasDeLaTira(TIRAS_DEL_GENIE - 2, TIRAS_DEL_GENIE, 0.4, ventana, libro, lider, 0)
  afirmar(Math.hypot(siguiente[3].x - esquinas[0].x, siguiente[3].y - esquinas[0].y) < 1e-9, '  y dos tiras vecinas comparten el borde exacto: no hay hueco entre filas')
  controlPositivo('  el detector ve una transformada afín donde hacía falta una proyectiva', esquinas, (q: readonly [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }]) => {
    const afin = { x: q[1].x - q[0].x + q[3].x, y: q[1].y - q[0].y + q[3].y }
    return Math.hypot(afin.x - q[2].x, afin.y - q[2].y) < 0.01
  })
}
