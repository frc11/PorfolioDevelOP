import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../../_lib/__tests__/afirmar'
import { arranqueDeDemos, arranqueDeLaSalida } from '../geometria'

import { MS_DEL_LIQUIDO, poseDeLaApertura, resorteCritico, type Caja } from './apertura'
import { Biblioteca } from './Biblioteca'
import { CATALOGO_DE_DEMOS } from './catalogo'
import { siguienteFoco } from './dialogo'
import { escalaDeDemos } from './entrada'

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

  // ── LA APERTURA: EL RESORTE NO REBOTA ─────────────────────────────────
  let pasa = false
  for (let k = 0; k <= 100; k += 1) if (resorteCritico(k / 100) > 1) pasa = true
  afirmar(!pasa && resorteCritico(1) === 1, 'el tiempo sólido es un resorte crítico: llega a 1 sin pasarse nunca')
  const pieza: Caja = { x: 900, y: 500, ancho: 160, alto: 240 }
  const final: Caja = { x: 144, y: 90, ancho: 1152, alto: 720 }
  afirmarIgual(poseDeLaApertura(0, pieza, final).caja, pieza, '  la ventana nace con la caja exacta de su pieza')
  afirmar(poseDeLaApertura(MS_DEL_LIQUIDO + 1, pieza, final).liquido === 0, '  y el filtro líquido se apaga al terminar el tiempo líquido, con la ventana todavía chica')
}
