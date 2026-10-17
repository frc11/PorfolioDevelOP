/**
 * [B1] §17 DEL INVARIANTE DE TRABAJOS — el selector lateral, sobre el marcado de las dos ramas y sobre su estado puro.
 *
 * Las anclas (los deep links) en su lugar derivado, el acordeón (el patrón de la WAI: cabecera con `aria-expanded` y región
 * nombrada), el estado del servidor (El Garage en portada), las referencias de `aria` que existen, los enlaces que salen del sitio,
 * el botón a la hoja de contacto de siempre y el teclado (`estado.ts`). Cada detector con su control positivo.
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../../_lib/__tests__/afirmar'

import { PROYECTOS } from '../proyectos'
import { referenciasColgadas } from '../trabajos-detectores'

import { ANCLAS_DEL_PORTFOLIO } from './anclas'
import { saltoDeLaTecla, vistaDelPaso, type TeclaDelSelector } from './estado'
import { ANTES_DEL_PIN, EN_LA_COLA, PANTALLAS_POR_PASO, pantallasDelAncla, pasoDeLaPortada, type IndiceDePaso } from './pasos'

const veces = (html: string, aguja: string): number => html.split(aguja).length - 1
const ordenDeLasTiras = (html: string): string[] => [...html.matchAll(/data-tira="([^"]+)"/g)].map((m) => m[1])
const expandidas = (html: string): string[] => [...html.matchAll(/<button[^>]*id="portfolio-cabecera-([^"]+)"[^>]*aria-expanded="true"/g)].map((m) => m[1])

export function afirmarElSelector(quieto: string, conMotion: string): void {
  titulo('17 · El selector lateral: las anclas, el acordeón, el estado del servidor y el teclado')

  for (const a of ANCLAS_DEL_PORTFOLIO) {
    const top = `id="${a.id}" aria-hidden="true" class="pointer-events-none absolute left-0 h-px w-px" style="top:${(pantallasDelAncla(a.paso, PANTALLAS_POR_PASO) * 100).toFixed(4)}svh"`
    afirmar(quieto.includes(top) && conMotion.includes(top), `#${a.id}: el ancla está en las dos ramas, ${(pantallasDelAncla(a.paso, PANTALLAS_POR_PASO) * 100).toFixed(2)}svh debajo del tope (el centro de su portada, una pantalla antes)`)
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
  afirmarIgual(veces(quieto, ' hidden=""'), 3 + 3 + PROYECTOS.length + 2 * PROYECTOS.length, '  van `hidden` el medio y el contenido de las tres cerradas, la ficha de los tres proyectos (en portada) y las dos filas que no se muestran de cada ficha')

  afirmarIgual(veces(quieto, 'data-abre-contacto="panel"'), 1, 'UN botón abre la hoja de contacto de siempre (`data-abre-contacto="panel"`): no hay un modal nuevo')
  afirmar(/<button[^>]*data-abre-contacto="panel"/.test(quieto), '  y es un botón')
  const visitar = [...quieto.matchAll(/<a [^>]*aria-label="Visitar sitio de [^"]*"[^>]*>/g)].map((m) => m[0])
  afirmarIgual(visitar.length, PROYECTOS.length, 'un «Visitar sitio» por proyecto')
  afirmar(visitar.every((a) => a.includes('target="_blank"') && a.includes('rel="noopener noreferrer"') && a.includes('se abre en una pestaña nueva')), '  que abre en una pestaña nueva, sin `opener` ni referente, y lo dice en su nombre')
  const delMedio = [...quieto.matchAll(/<a [^>]*tabindex="-1"[^>]*>/g)].map((m) => m[0])
  afirmar(delMedio.length >= PROYECTOS.length && delMedio.slice(0, PROYECTOS.length).every((a) => a.includes('aria-hidden="true"') && a.includes('target="_blank"')), 'el medio de cada tira lleva el mismo enlace sólo para el mouse: fuera del teclado y de los lectores')
  afirmarIgual(veces(quieto, 'data-signo-de-la-tuya=""'), 1, 'el hueco del «?» está en la tira de la tuya')
  afirmar(/data-signo-de-la-tuya="" aria-hidden="true"/.test(quieto), '  y es decoración para los lectores')
  afirmar(quieto.includes('data-material="tinta"') && quieto.includes('data-lado="der"'), 'sin banderas: el panel «tinta» (el negro de la marca) y del lado derecho')

  titulo('17b · El estado y el teclado, puros (`estado.ts`)')

  const fases = ([ANTES_DEL_PIN, 0, 1, 5, 6, EN_LA_COLA] as const).map((p: IndiceDePaso) => vistaDelPaso(p))
  afirmarIgual(fases.map((v) => `${v.fase}:${v.tira}:${v.vista}`), ['antes:0:portada', 'adentro:0:portada', 'adentro:0:ficha', 'adentro:2:ficha', 'adentro:3:portada', 'despues:3:portada'], 'antes del pin El Garage, cada proyecto en portada y ficha, la tuya sin ficha, y en la cola la tuya (subiendo entra con ella)')
  const casos: readonly [TeclaDelSelector, number, IndiceDePaso, number | null][] = [
    ['ArrowRight', 0, 0, pasoDeLaPortada(1)],
    ['ArrowDown', 1, 2, pasoDeLaPortada(2)],
    ['ArrowLeft', 2, 4, pasoDeLaPortada(1)],
    ['ArrowUp', 0, 0, null],
    ['ArrowRight', 3, 6, null],
    ['Enter', 1, 2, 3],
    ['Enter', 1, 3, 2],
    ['Enter', 3, 6, null],
    ['Enter', 2, 0, pasoDeLaPortada(2)],
    ['Escape', 0, 1, 0],
    ['Escape', 0, 0, null],
  ]
  afirmarIgual(casos.filter(([t, tira, paso, esperado]) => saltoDeLaTecla(t, tira, paso) !== esperado).map(([t, tira, paso]) => `${t}@${tira}/${paso}`), [], '←/↑ y →/↓ van a la portada de la tira de al lado (sin dar la vuelta), Enter abre y cierra la ficha de la activa (y en otra tira va a su portada), Esc vuelve a la portada')
  controlPositivo('  una tecla mal mapeada se ve', (t: TeclaDelSelector, tira: number, paso: IndiceDePaso) => (t === 'Enter' ? null : saltoDeLaTecla(t, tira, paso)), (f: (t: TeclaDelSelector, tira: number, paso: IndiceDePaso) => number | null) => casos.every(([t, tira, paso, e]) => f(t, tira, paso) === e))
}
