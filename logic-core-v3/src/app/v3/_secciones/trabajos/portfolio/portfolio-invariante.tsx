/**
 * [B1] §17 DEL INVARIANTE DE TRABAJOS — el selector lateral, sobre el marcado de las dos ramas y sobre su estado puro.
 *
 * Las anclas (los deep links) en su lugar derivado, el acordeón (el patrón de la WAI: cabecera con `aria-expanded` y contenido
 * nombrado), el estado del servidor (El Garage abierto), las referencias de `aria` que existen, los enlaces que salen del sitio,
 * [B1.2c] el formulario corto de «la tuya» (en lugar del botón), el vidrio del panel, las marcas de agua y el teclado (`estado.ts`). [B1.2b] Un paso por
 * proyecto: la tira activa lleva siempre el video y la ficha. Cada detector con su control positivo.
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../../_lib/__tests__/afirmar'

import { marcar } from '../../_invariantes/render'
import { PROYECTOS } from '../proyectos'
import { referenciasColgadas } from '../trabajos-detectores'

import { ANCLAS_DEL_PORTFOLIO } from './anclas'
import { accionDeLaTecla, vistaDelPaso, type TeclaDelSelector } from './estado'
import { NUMERO_DE_WHATSAPP } from '../../cierre/contacto'

import { SignoQueSeArma } from './SignoDePregunta'
import { ANTES_DEL_PIN, EN_LA_COLA, PANTALLAS_POR_PASO, pantallasDelAncla, type IndiceDePaso } from './pasos'

const veces = (html: string, aguja: string): number => html.split(aguja).length - 1
const ordenDeLasTiras = (html: string): string[] => [...html.matchAll(/data-tira="([^"]+)"/g)].map((m) => m[1])
const expandidas = (html: string): string[] => [...html.matchAll(/<button[^>]*id="portfolio-cabecera-([^"]+)"[^>]*aria-expanded="true"/g)].map((m) => m[1])

export function afirmarElSelector(quieto: string, conMotion: string): void {
  titulo('17 · El selector lateral: las anclas, el acordeón, el estado del servidor, el vidrio, las marcas y el teclado')

  for (const a of ANCLAS_DEL_PORTFOLIO) {
    const top = `id="${a.id}" aria-hidden="true" class="pointer-events-none absolute left-0 h-px w-px" style="top:${(pantallasDelAncla(a.paso, PANTALLAS_POR_PASO) * 100).toFixed(4)}svh"`
    afirmar(quieto.includes(top) && conMotion.includes(top), `#${a.id}: el ancla está en las dos ramas, ${(pantallasDelAncla(a.paso, PANTALLAS_POR_PASO) * 100).toFixed(2)}svh debajo del tope (el centro de su paso, una pantalla antes)`)
  }
  afirmarIgual(ANCLAS_DEL_PORTFOLIO.map((a) => a.id), ['portfolio-el-garage', 'portfolio-esquina-estudio', 'portfolio-banu-scents', 'portfolio-la-tuya'], '  los cuatro deep links de la spec, en su orden')

  const ORDEN = [...PROYECTOS.map((p) => p.slug), 'la-tuya']
  afirmarIgual(ordenDeLasTiras(quieto), ORDEN, 'las tiras en el orden fijo de la spec: El Garage, Esquina Estudio, Banú Scents, la tuya')
  afirmarIgual(ordenDeLasTiras(conMotion), ORDEN, '  en las dos ramas')
  afirmarIgual(expandidas(quieto), ['el-garage'], 'en el servidor (y antes del pin) la tira abierta es El Garage: el panel entra con ella')
  afirmarIgual(expandidas(conMotion), ['el-garage'], '  en las dos ramas')
  afirmarIgual(referenciasColgadas(quieto), [], 'cada `aria-controls` y cada `aria-labelledby` nombra un `id` que existe')
  controlPositivo('  el detector ve una referencia colgada', '<button aria-controls="no-existe"></button>', (html: string) => referenciasColgadas(html).length === 0)
  afirmarIgual(veces(quieto, 'role="region"'), 0, 'los contenidos de las tiras NO son `region`: el acordeón no suma puntos de referencia al documento (s10-acceso los cuenta)')
  afirmarIgual(veces(quieto, ' hidden=""'), 2 + 2 + 1 + 2 * PROYECTOS.length + 1, '  van `hidden` el medio y el contenido de las dos cerradas de proyecto, el contenido de la tuya y las dos filas que no se muestran de cada ficha ([B1.2b] la ficha ya no se esconde: va siempre en la activa) y [B1.2c] la pista de la tablet (con el panel afuera)')

  // [B1.2c] «La tuya» lleva el formulario corto en lugar del botón a la hoja de contacto: tres campos, enviar y WhatsApp.
  const formulario = /<div data-pieza="formulario-de-la-tuya"[\s\S]*?<p role="status"/.exec(quieto)?.[0] ?? ''
  const whatsapp = `<a href="https://wa.me/${NUMERO_DE_WHATSAPP}?text=`
  const formularioCorto = (f: string): boolean =>
    [...f.matchAll(/<input [^>]*name="(nombre|medio|mensaje)"/g)].map((m) => m[1]).join(',') === 'nombre,medio,mensaje' && /<button type="submit"/.test(f) &&
    f.includes(whatsapp) && /target="_blank" rel="noopener noreferrer" aria-label="o escribinos por WhatsApp, se abre en una pestaña nueva"/.test(f) && /<form noValidate="" class=/.test(f)
  afirmar(formularioCorto(formulario) && veces(quieto, 'data-abre-contacto="panel"') === 0, '[B1.2c] «la tuya» lleva el formulario corto en lugar del botón: el nombre, «WhatsApp o email» y «¿Qué necesitás?», enviar, y «o escribinos por WhatsApp» (el número del pie, en una pestaña nueva); el formulario, sin nombre propio: no suma un punto de referencia')
  controlPositivo('  el detector ve el botón de antes (sin el formulario)', '<div data-pieza="formulario-de-la-tuya"><button type="button" data-abre-contacto="panel">Clickeá</button><p role="status">', formularioCorto)
  const visitar = [...quieto.matchAll(/<a [^>]*aria-label="Visitar sitio de [^"]*"[^>]*>/g)].map((m) => m[0])
  afirmarIgual(visitar.length, PROYECTOS.length, 'un «Visitar sitio» por proyecto')
  afirmar(visitar.every((a) => a.includes('target="_blank"') && a.includes('rel="noopener noreferrer"') && a.includes('se abre en una pestaña nueva')), '  que abre en una pestaña nueva, sin `opener` ni referente, y lo dice en su nombre')
  const delMedio = [...quieto.matchAll(/<a [^>]*tabindex="-1"[^>]*>/g)].map((m) => m[0])
  afirmar(delMedio.length >= PROYECTOS.length && delMedio.slice(0, PROYECTOS.length).every((a) => a.includes('aria-hidden="true"') && a.includes('target="_blank"')), 'el medio de cada tira lleva el mismo enlace sólo para el mouse: fuera del teclado y de los lectores')

  const panel = /<div data-pieza="panel-del-portfolio"[^>]*>/.exec(quieto)?.[0] ?? ''
  afirmar(/backdrop-filter:blur\(20px\) saturate\(180%\)/.test(panel) && /right-0/.test(panel) && /translate-x-full/.test(panel) && !/data-material|data-lado/.test(quieto), '[B1.2b] el panel, de vidrio y del lado derecho (sin banderas: ni material ni lado en el marcado), afuera en el servidor')
  afirmar(!/data-marca-de-agua=/.test(quieto) && !PROYECTOS.some((p) => p.logo !== null && quieto.includes(p.logo)), '[B1.2b] las marcas de agua no salen en el servidor: se piden y se dibujan recién con la sección cerca')
  const signo = marcar(<div aria-hidden="true" data-marca-de-agua="signo"><SignoQueSeArma reducido /></div>, { anima: false })
  const decorativo = (s: string): boolean => /^<div aria-hidden="true" data-marca-de-agua="signo"><svg focusable="false"/.test(s) && veces(s, '<path') === 6 && !/role=|aria-label/.test(s)
  afirmar(decorativo(signo), '[B1.2b] el «?» de «la tuya» es un SVG decorativo ([B1.2c] el recorte del trazo, la sombra y la pieza del gancho, el filo que se dibuja, la sombra y la pieza del punto)')
  controlPositivo('  el detector ve un «?» que se anuncia', signo.replace('aria-hidden="true" ', ''), decorativo)

  titulo('17b · El estado y el teclado, puros (`estado.ts`)')

  const fases = ([ANTES_DEL_PIN, 0, 1, 2, 3, EN_LA_COLA] as const).map((p: IndiceDePaso) => vistaDelPaso(p))
  afirmarIgual(fases.map((v) => `${v.fase}:${v.tira}`), ['antes:0', 'adentro:0', 'adentro:1', 'adentro:2', 'adentro:3', 'despues:3'], 'antes del pin El Garage, un paso por tira, y en la cola la tuya (subiendo entra con ella)')
  const casos: readonly [TeclaDelSelector, number | null, IndiceDePaso, string][] = [
    ['ArrowRight', 0, 0, '1/1'],
    ['ArrowRight', 1, 0, '2/2'],
    ['ArrowLeft', 2, 2, '1/1'],
    ['ArrowLeft', 0, 0, 'nada'],
    ['ArrowRight', 3, 3, 'nada'],
    ['ArrowRight', null, 1, '2/2'],
    ['Escape', 2, 1, '-/1'],
    ['Escape', null, 3, '-/3'],
    ['ArrowRight', 0, ANTES_DEL_PIN, 'nada'],
    ['Escape', 1, EN_LA_COLA, 'nada'],
  ]
  const comoTexto = (t: TeclaDelSelector, tira: number | null, paso: IndiceDePaso, f = accionDeLaTecla): string => {
    const a = f(t, tira, paso)
    return a === null ? 'nada' : `${a.salto === null ? '-' : String(a.salto)}/${a.foco === null ? '-' : String(a.foco)}`
  }
  afirmarIgual(casos.filter(([t, tira, paso, e]) => comoTexto(t, tira, paso) !== e).map(([t, tira, paso]) => `${t}@${String(tira)}/${paso}`), [], '←/→ van al proyecto de al lado de la cabecera con el foco (o de la activa), sin dar la vuelta, y el foco va con él; Esc devuelve el foco al lomo activo; con el panel afuera, nada (Enter en un lomo es su clic)')
  controlPositivo('  una tecla mal mapeada se ve', ((t: TeclaDelSelector, tira: number | null, paso: IndiceDePaso) => (t === 'Escape' ? null : accionDeLaTecla(t, tira, paso))) as typeof accionDeLaTecla, (f: typeof accionDeLaTecla) => casos.every(([t, tira, paso, e]) => comoTexto(t, tira, paso, f) === e))
}
