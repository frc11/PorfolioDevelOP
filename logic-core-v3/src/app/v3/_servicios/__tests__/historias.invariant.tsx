/**
 * INVARIANTE — El precio en el teléfono, con las historias comunes. **[SERVICIOS M2b]**
 *
 * Corre a mano: `npx tsx src/app/v3/_servicios/__tests__/historias.invariant.tsx`.
 *
 * Por debajo de 768 el precio de Páginas web son las historias del home (`_componentes/historias/`, P-H19), importadas tal cual. Lo
 * que se afirma: los tres pasos en orden; la marca y la línea literal solo en la Mediana; cuándo se montan (nunca desde 768, nunca con
 * movimiento reducido, solo con la caja pegada); el texto real en el HTML servido, legible sin animación; adónde sale cada gesto; que
 * el componente va sin cambios; y que no hay `data-servicio`. Cada comprobación lleva su control positivo: el MISMO detector contra una
 * entrada armada para fallar. Plan: `docs/servicios/SPRINT-M2b.md`.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'

import { Historias } from '../../_componentes/historias/Historias'
import { afirmar, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import {
  CONSULTA_DEBAJO_DE_768, cajaPegada, destinoDeLaSalida, montarLasHistorias, pasosDelPrecio, type MomentoDelTelefono, type PasoDelPrecio,
} from '../bloques/precio/historiasDelPrecio'
import { ETIQUETA_DE_LAS_HISTORIAS, ROTULOS_DE_LAS_HISTORIAS } from '../bloques/precio/rotulos'
import { tresOpcionesDeLosCalibres, type VistaDeTresOpciones } from '../bloques/precio/tresOpciones'
import { PAGINAS_WEB } from '../datos/paginas-web'
import { pantallaDelPaso } from '../movimiento/PrecioEnHistorias'
import { PaginaDeServicio } from '../PaginaDeServicio'
import { bloqueDe, elementoConAtributo, sinComentarios, textoVisible } from './pagina-detectores'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const RAIZ = path.join(AQUI, '..')
const leer = (relativo: string): string => readFileSync(path.join(RAIZ, relativo), 'utf8')

if (PAGINAS_WEB.precio.tipo !== 'calibres') throw new Error('paginas-web: el precio ya no es por calibres')
const { calibres, destacada } = PAGINAS_WEB.precio
const VISTA = tresOpcionesDeLosCalibres(calibres, destacada, false)
const PASOS = pasosDelPrecio(VISTA)
const pagina = (enDesarrollo: boolean): string => renderToStaticMarkup(<PaginaDeServicio servicio={PAGINAS_WEB} enDesarrollo={enDesarrollo} />)
const WEB_PROD = pagina(false)
const WEB_DEV = pagina(true)
/** La versión del teléfono, tal como llega en el HTML servido. */
const telefono = (html: string): string => elementoConAtributo(bloqueDe(html, 'precio') ?? '', 'data-precio="historias"') ?? ''
const TELEFONO = telefono(WEB_PROD)
const LINEA_DE_LA_MEDIANA = 'Todo lo de la Simple, en varias páginas y con catálogo o buscador para mostrar lo que vendés.'
/** Los pasos de la lista quieta, en el orden del DOM: su índice y su marcado. */
const pasosDelMarcado = (html: string): { readonly n: string; readonly marcado: string }[] =>
  [...html.matchAll(/<div[^>]*data-paso-del-precio="(\d)"[^>]*>([\s\S]*?)<\/div><\/div><\/div><\/div>/g)].map((m) => ({ n: m[1] ?? '', marcado: m[0] }))
const clasesDe = (apertura: string): string[] => (/\sclass="([^"]*)"/.exec(apertura)?.[1] ?? '').split(/\s+/)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Los tres pasos, en orden: Simple, Mediana y Premium')

const enOrden = (pasos: readonly PasoDelPrecio[]): boolean =>
  JSON.stringify(pasos.map((p) => [p.indice, p.opcion.nombre])) === JSON.stringify([[0, 'Simple'], [1, 'Mediana'], [2, 'Premium']]) &&
  new Set(pasos.map((p) => p.id)).size === 3
afirmar(enOrden(PASOS), 'los pasos de las historias son tres, en el orden de la vista: Simple, Mediana y Premium, cada uno con su id')
controlPositivo('  la Premium primero se detecta', [...PASOS].reverse(), enOrden)
controlPositivo('  y dos con el mismo id', PASOS.map((p) => ({ ...p, id: 'opcion' })), enOrden)
/** En el HTML servido: una lista (role="list") con los tres pasos en orden, cada uno con su h3. */
const listaEnOrden = (html: string): boolean => {
  const nombres = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => textoVisible(m[1] ?? ''))
  return /<ul role="list" data-pieza="precio-en-lista"/.test(html) && JSON.stringify(pasosDelMarcado(html).map((p) => p.n)) === JSON.stringify(['0', '1', '2']) &&
    JSON.stringify(nombres) === JSON.stringify(['Simple', 'Mediana', 'Premium'])
}
afirmar(listaEnOrden(TELEFONO) && listaEnOrden(telefono(WEB_DEV)), 'en el HTML servido, la versión del teléfono trae la lista quieta con los tres pasos en ese orden, cada uno con su h3, en los dos modos')
const [P0, P1] = pasosDelMarcado(TELEFONO).map((p) => p.marcado)
controlPositivo('  dos pasos cambiados de lugar se detectan', TELEFONO.replace(P0 ?? '', '§').replace(P1 ?? '', P0 ?? '').replace('§', P1 ?? ''), listaEnOrden)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La Mediana: «Recomendada» y su línea literal, en el acento, y en ningún otro paso')

const parrafos = (marcado: string): string[] => [...marcado.matchAll(/<p(?=[\s>])[^>]*>([\s\S]*?)<\/p>/g)].map((m) => textoVisible(m[1] ?? ''))
/** La Mediana lleva la marca y la línea (un párrafo entero, literal) y es la única en el acento; la Simple y la Premium no las llevan. */
const laMediana = (marcados: readonly string[]): boolean => {
  const [simple, mediana, premium] = marcados
  const enElAcento = marcados.map((m) => clasesDe(/<div[^>]*data-paso-del-precio[^>]*>/.exec(m)?.[0] ?? '').includes('bg-acento'))
  return simple !== undefined && mediana !== undefined && premium !== undefined && JSON.stringify(enElAcento) === JSON.stringify([false, true, false]) &&
    textoVisible(mediana).includes('Recomendada') && parrafos(mediana).includes(LINEA_DE_LA_MEDIANA) &&
    [simple, premium].every((m) => !textoVisible(m).includes('Recomendada') && !textoVisible(m).includes(LINEA_DE_LA_MEDIANA))
}
const PANTALLAS = PASOS.map((paso) => renderToStaticMarkup(<>{pantallaDelPaso(paso)}</>))
afirmar(laMediana(PANTALLAS), `cada paso de las historias (lo que pinta su renderItem): la Mediana con «Recomendada» y su línea literal, «${LINEA_DE_LA_MEDIANA}», en el acento; la Simple y la Premium sin ellas`)
afirmar(laMediana(pasosDelMarcado(TELEFONO).map((p) => p.marcado)) && laMediana(pasosDelMarcado(telefono(WEB_DEV)).map((p) => p.marcado)), '  y lo mismo en la lista quieta del HTML servido, en los dos modos')
controlPositivo('  la línea con un carácter cambiado se detecta', PANTALLAS.map((m) => m.replace('vendés.', 'vendes.')), laMediana)
controlPositivo('  la marca en la Simple', PANTALLAS.map((m, i) => (i === 0 ? m.replace('<h3', '<span>Recomendada</span><h3') : m)), laMediana)
controlPositivo('  y el acento en la Premium', PANTALLAS.map((m, i) => (i === 2 ? m.replace('bg-fondo', 'bg-acento') : m)), laMediana)
/** Mundo cerrado: lo que se lee en el teléfono es el título y lo que da la vista, nada más. */
const mundoCerrado = (html: string, vista: VistaDeTresOpciones): boolean => {
  let resto = textoVisible(html)
  const piezas = ['Precio', ...vista.opciones.flatMap((o) => [o.nombre, o.rotuloDelPrecio, o.precio, ...o.lineas]), ...(vista.destacada === null ? [] : [vista.destacada.marca, vista.destacada.linea])]
  for (const pieza of [...piezas].sort((a, b) => b.length - a.length)) resto = resto.replace(pieza, '')
  return resto.trim() === ''
}
afirmar(mundoCerrado(TELEFONO, VISTA) && mundoCerrado(telefono(WEB_DEV), tresOpcionesDeLosCalibres(calibres, destacada, true)), 'mundo cerrado: todo texto del teléfono sale de los datos (y del título «Precio»), en los dos modos')
controlPositivo('  un «¡Oferta!» suelto se detecta', TELEFONO.replace('</ul>', '<p>¡Oferta!</p></ul>'), (h: string) => mundoCerrado(h, VISTA))

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Cuándo se montan: por debajo de 768, sin movimiento reducido y con la caja pegada; desde 768, nunca')

const MOMENTOS: readonly MomentoDelTelefono[] = [false, true].flatMap((debajoDe768) => [false, true].flatMap((reducido) => [false, true].map((pegada) => ({ debajoDe768, reducido, pegada }))))
const soloAbajoQuietoNoYPegada = (f: typeof montarLasHistorias): boolean => MOMENTOS.every((m) => f(m) === (m.debajoDe768 && !m.reducido && m.pegada))
afirmar(soloAbajoQuietoNoYPegada(montarLasHistorias), 'en las ocho combinaciones, se montan SOLO por debajo de 768, sin movimiento reducido y con la caja pegada: desde 768 no se montan nunca')
controlPositivo('  una regla que no mira el ancho se detecta', ((m: MomentoDelTelefono) => !m.reducido && m.pegada) as typeof montarLasHistorias, soloAbajoQuietoNoYPegada)
controlPositivo('  y una que no mira el movimiento reducido', ((m: MomentoDelTelefono) => m.debajoDe768 && m.pegada) as typeof montarLasHistorias, soloAbajoQuietoNoYPegada)
/** La consulta es la de `max-md:` (el md de Tailwind, 48rem), y ninguna hoja redefine ese corte. */
const HOJAS = ['../theme-develop.css', '../globals.css'].map((r) => readFileSync(path.join(RAIZ, '..', r), 'utf8')).join('\n')
const esLaDeMaxMd = (consulta: string, hojas: string): boolean => consulta === '(width < 48rem)' && !/--breakpoint-md\s*:|--breakpoint-\*\s*:/.test(hojas) && /@import\s+["']tailwindcss["']/.test(hojas)
afirmar(esLaDeMaxMd(CONSULTA_DEBAJO_DE_768, HOJAS), `la consulta de matchMedia es la de max-md: «${CONSULTA_DEBAJO_DE_768}», el md por defecto de Tailwind, que el tema no redefine`)
controlPositivo('  una consulta en px de otro corte se detecta', '(max-width: 1023px)', (c: string) => esLaDeMaxMd(c, HOJAS))
controlPositivo('  y un tema que mueve el md', `${HOJAS}\n@theme { --breakpoint-md: 40rem; }`, (h: string) => esLaDeMaxMd(CONSULTA_DEBAJO_DE_768, h))
/** El componente las monta UNA vez, adentro de la rama de `montarLasHistorias`, con el ancho de `matchMedia` y falso en el servidor. */
const CLIENTE = sinComentarios(leer('movimiento/PrecioEnHistorias.tsx'))
const montaComoDice = (codigo: string): boolean =>
  (codigo.match(/<Historias\b/g) ?? []).length === 1 &&
  /const montadas = montarLasHistorias\(\{ debajoDe768, reducido, pegada \}\)/.test(codigo) &&
  /\{montadas \? \(\s*<motion\.div key="historias"[^>]*>\s*<Historias\b/.test(codigo) &&
  /useSyncExternalStore\(suscribirseAlAncho, debajoDe768Ahora, enElServidor\)/.test(codigo) &&
  /const enElServidor = \(\): boolean => false/.test(codigo) && /matchMedia\(CONSULTA_DEBAJO_DE_768\)/.test(codigo)
afirmar(montaComoDice(CLIENTE), '  el componente las monta una sola vez, en la rama de montarLasHistorias, con el ancho de matchMedia (falso en el servidor)')
controlPositivo('  unas historias montadas fuera de la rama se detectan', CLIENTE.replace('{montadas ? (', '{true ? ('), montaComoDice)
/** En el HTML servido (cualquier ancho) no hay historias: el servidor no las monta. Y la versión del teléfono se oculta desde 768. */
const servidoSinHistorias = (html: string): boolean => !/data-pieza="historias"/.test(html) && clasesDe(/<div data-precio="historias"[^>]*>/.exec(html)?.[0] ?? '').includes('md:hidden')
afirmar(servidoSinHistorias(WEB_PROD) && servidoSinHistorias(WEB_DEV), '  el HTML servido no trae las historias (se montan en el cliente) y la versión del teléfono va con md:hidden')
controlPositivo('  unas historias en el HTML servido se detectan', WEB_PROD.replace('<ul role="list" data-pieza="precio-en-lista"', '<div data-pieza="historias"></div><ul role="list" data-pieza="precio-en-lista"'), servidoSinHistorias)
/** La caja pegada: la sección alta arranca arriba del tope y termina debajo del pie. */
const pegadaComoDice = (f: typeof cajaPegada): boolean =>
  f({ top: 0, bottom: 844 }, 844) && f({ top: -600, bottom: 1088 }, 844) && !f({ top: 1, bottom: 1688 }, 844) && !f({ top: -845, bottom: 843 }, 844) && !f({ top: 0, bottom: 0 }, 0)
afirmar(pegadaComoDice(cajaPegada), '  la caja está pegada mientras la sección alta cubre el cuadro (tope arriba, pie abajo); un px antes o después, no')
controlPositivo('  una regla que no mira el pie se detecta', ((alta: { readonly top: number }) => alta.top <= 0.5) as typeof cajaPegada, pegadaComoDice)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Texto real y movimiento reducido: los tres se leen quietos; con movimiento, solo el CSS arma la caja anclada')

/** Lo que solo existe con movimiento lleva `motion-safe:`: el alto alto, el anclaje y esconder el segundo y el tercer paso. */
const ALTO_ALTO = ['motion-safe:h-', '[var(--alto-de-las-historias)]'].join('')
const quietoSinMovimiento = (html: string): boolean => {
  const alta = clasesDe(/<div[^>]*data-pieza="precio-en-historias"[^>]*>/.exec(html)?.[0] ?? '')
  const caja = clasesDe(/<div[^>]*data-pieza="precio-en-historias"[^>]*><div[^>]*>/.exec(html)?.[0]?.replace(/^<div[^>]*>/, '') ?? '')
  const items = [...html.matchAll(/<li class="([^"]*)">/g)].map((m) => (m[1] ?? '').split(/\s+/))
  return alta.includes(ALTO_ALTO) && !alta.some((c) => c.startsWith('h-')) && /--alto-de-las-historias:200svh/.test(html) &&
    caja.includes('motion-safe:sticky') && !caja.includes('sticky') &&
    items.length === 3 && items.every((c) => !c.includes('hidden')) && JSON.stringify(items.map((c) => c.includes('motion-safe:hidden'))) === JSON.stringify([false, true, true])
}
afirmar(quietoSinMovimiento(TELEFONO), 'sin movimiento (movimiento reducido o sin la variante) los tres pasos se leen uno debajo del otro: el alto de dos pantallas, el anclaje y esconder la Mediana y la Premium van solo con motion-safe')
controlPositivo('  un paso escondido siempre se detecta', TELEFONO.replace('motion-safe:hidden', 'hidden'), quietoSinMovimiento)
controlPositivo('  y una caja anclada también con movimiento reducido', TELEFONO.replace('motion-safe:sticky', 'sticky'), quietoSinMovimiento)
/** Con movimiento reducido no se monta nada que anime: las historias no (§3) y la lista no tiene opacidad ni corrimiento en el servidor. */
const sinAnimacionEnElServidor = (html: string): boolean => !/opacity:\s*0|transform:|translate/.test(html)
afirmar(sinAnimacionEnElServidor(TELEFONO), '  y la lista quieta no trae opacidad cero ni corrimientos: se lee sin animación')
controlPositivo('  una lista escondida en el servidor se detecta', TELEFONO.replace('data-pieza="precio-en-lista"', 'data-pieza="precio-en-lista" style="opacity:0"'), sinAnimacionEnElServidor)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El componente común, tal cual: los pasos, cómo se pinta cada uno y adónde sale')

/** Lo que se le pasa a `Historias`: los ítems, el renderItem, la salida, la etiqueta y los rótulos. Nada que cambie su comportamiento. */
const usoTalCual = (codigo: string): boolean => {
  const props = /<Historias\s+([^>]*?)\/>/.exec(codigo)?.[1] ?? ''
  const nombres = [...props.matchAll(/(\w+)=\{/g)].map((m) => m[1]).sort()
  return /import \{ Historias \} from '\.\.\/\.\.\/_componentes\/historias\/Historias'/.test(codigo) &&
    JSON.stringify(nombres) === JSON.stringify(['alSalir', 'etiqueta', 'items', 'renderItem', 'rotulos'])
}
afirmar(usoTalCual(CLIENTE), 'el componente es el común (`_componentes/historias/Historias`) y recibe solo items, renderItem, alSalir, etiqueta y rótulos: ni su duración ni sus clases cambian')
controlPositivo('  uno con su propia duración se detecta', CLIENTE.replace('<Historias items=', '<Historias duracionMs={4000} items='), usoTalCual)
/** Montadas con los tres pasos: arrancan en la Simple, con su texto real, tres barras y los dos controles del teclado. */
const MONTADAS = renderToStaticMarkup(
  <Historias items={PASOS} renderItem={pantallaDelPaso} alSalir={() => undefined} etiqueta={ETIQUETA_DE_LAS_HISTORIAS} rotulos={ROTULOS_DE_LAS_HISTORIAS} />,
)
const arrancanEnLaSimple = (html: string): boolean =>
  /data-indice="0"/.test(html) && /data-paso-del-precio="0"/.test(html) && !/data-paso-del-precio="[12]"/.test(html) && textoVisible(html).includes('Simple') &&
  (html.match(/data-parte="barra"/g) ?? []).length === 3 && html.includes(ROTULOS_DE_LAS_HISTORIAS.anterior) && html.includes(ROTULOS_DE_LAS_HISTORIAS.siguiente) &&
  html.includes(`aria-label="${ETIQUETA_DE_LAS_HISTORIAS}"`)
afirmar(arrancanEnLaSimple(MONTADAS), '  montadas, arrancan en la Simple (el mismo paso que deja a la vista la lista quieta), con su texto real, tres barras y los dos controles del teclado')
controlPositivo('  unas que arrancan en la Mediana se detectan', MONTADAS.replace('data-paso-del-precio="0"', 'data-paso-del-precio="1"'), arrancanEnLaSimple)
/** Adónde va la página: adelante, al final de la sección alta (lo que sigue, arriba: el CTA del precio); atrás, al título. */
const BORDES = { titulo: 1200, finDeLaAlta: 4000 }
const salidasComoDice = (f: typeof destinoDeLaSalida): boolean => f('adelante', BORDES) === 4000 && f('atras', BORDES) === 1200
afirmar(salidasComoDice(destinoDeLaSalida), 'las salidas: deslizar arriba (o pasar la Premium) va al final de la sección alta, con el CTA del precio arriba; deslizar abajo vuelve al título')
controlPositivo('  las dos salidas cambiadas se detectan', ((hacia, b) => (hacia === 'adelante' ? b.titulo : b.finDeLaAlta)) as typeof destinoDeLaSalida, salidasComoDice)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Sin data-servicio')

const FUENTES_DEL_M2B = ['bloques/Precio.tsx', 'bloques/precio/historiasDelPrecio.ts', 'bloques/precio/PantallaDelPaso.tsx', 'bloques/precio/ContenidoDeLaOpcion.tsx', 'movimiento/PrecioEnHistorias.tsx']
const sinDataServicio = (textos: readonly string[]): boolean => textos.every((t) => !t.includes('data-servicio'))
afirmar(sinDataServicio([bloqueDe(WEB_PROD, 'precio') ?? '', bloqueDe(WEB_DEV, 'precio') ?? '', MONTADAS, ...PANTALLAS, ...FUENTES_DEL_M2B.map((f) => sinComentarios(leer(f)))]), `ni el precio servido, ni las historias montadas, ni los ${FUENTES_DEL_M2B.length} fuentes del M2b llevan data-servicio`)
controlPositivo('  un paso con data-servicio se detecta', [PANTALLAS[1]?.replace('data-paso-del-precio', 'data-servicio="web" data-paso-del-precio') ?? ''], sinDataServicio)

cerrar('historias.invariant')
