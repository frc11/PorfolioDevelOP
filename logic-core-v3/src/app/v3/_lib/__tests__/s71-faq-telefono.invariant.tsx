/**
 * s71 · [C2 · 71t] (cola 2 del 2026-10-23, tarea 71 §6) · EL FAQ DEL TELÉFONO Y LA TABLET: después del pie, sin fondo liso, un acordeón
 * de vidrio líquido. Sin navegador; cada afirmación con su control positivo. Lo que se ve (que abre y cierra al toque, el vidrio en el
 * estilo computado, que la página no desborde y la foto) lo mide `scripts-carga/faq-telefono.ts` (lo corre el orquestador); el plan y
 * qué mirar, en `docs/rediseno/SPRINT-C2-71-telefono.md`.
 *
 *   1 · lo puro: una respuesta abierta a la vez (tocar la abierta la cierra) y las teclas que recorren las preguntas;
 *   2 · el marcado: cada pregunta es un botón en su título, con `aria-expanded` y `aria-controls` hacia su respuesta; las respuestas
 *       cerradas siguen en el HTML (fuera del teclado y del lector, `inert`), sin regiones; el texto entero, también en `FAQPage`;
 *   3 · abrir y cerrar: la fila abierta y la cerrada; con movimiento, el despliegue; con menos movimiento, sin una transición;
 *   4 · el vidrio: sin el fondo liso, el panel lleva el material del sitio (desenfoque, filo, reflejo) y el tono del pie que continúa.
 *
 * Corre con `npm run test:s71-faq-telefono`.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { alternarLaRespuesta, preguntaConLaTecla, tonoDeLaLista } from '../../_componentes/faq/acordeonDelFaq'
import { FaqEnLista, FilaDelFaq } from '../../_componentes/faq/FaqEnLista'
import { IDS_DEL_FAQ, datosEstructuradosDelFaq } from '../../_componentes/faq/preguntas'
import { PREGUNTAS_DEL_HOME } from '../../_secciones/cierre/faq'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

;(globalThis as unknown as { React: typeof React }).React = React

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
const veces = (h: string, s: string): number => h.split(s).length - 1
const N = PREGUNTAS_DEL_HOME.length
const nada = (): void => undefined

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Lo puro: una abierta a la vez y las teclas')

type Alternar = (abierta: number | null, tocada: number) => number | null
const unaPorVez = (f: Alternar): boolean => f(null, 2) === 2 && f(2, 2) === null && f(2, 4) === 4 && f(4, 0) === 0 && f(0, 0) === null
afirmar(unaPorVez(alternarLaRespuesta), 'tocar una cerrada la abre (y cierra la que estaba); tocar la abierta la cierra')
controlPositivo('el detector ve una pregunta que no se cierra al tocarla de nuevo', ((_: number | null, t: number) => t) as Alternar, unaPorVez)

type Tecla = (tecla: string, actual: number, cuantas: number) => number | null
const tecladoEnRonda = (f: Tecla): boolean =>
  f('ArrowDown', 0, N) === 1 && f('ArrowDown', N - 1, N) === 0 && f('ArrowUp', 0, N) === N - 1 && f('Home', 3, N) === 0 && f('End', 1, N) === N - 1 && f('Enter', 2, N) === null && f(' ', 2, N) === null && f('ArrowDown', 0, 0) === null
afirmar(tecladoEnRonda(preguntaConLaTecla), 'las flechas recorren las preguntas en ronda, Inicio y Fin van a la primera y a la última; Enter y Espacio quedan para el botón')
controlPositivo('el detector ve las flechas sin ronda', ((t: string, a: number, n: number) => (t === 'ArrowDown' ? Math.min(a + 1, n - 1) : preguntaConLaTecla(t, a, n))) as Tecla, tecladoEnRonda)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El marcado: botones con su respuesta, el texto entero en el HTML y en FAQPage')

const lista = renderToStaticMarkup(<FaqEnLista preguntas={PREGUNTAS_DEL_HOME} colgada />)
const botonesDe = (h: string): string[] => [...h.matchAll(/<button [^>]*>/g)].map((m) => m[0])
const accesible = (h: string): boolean => {
  const bs = botonesDe(h)
  return (
    bs.length === N &&
    bs.every((b, i) => b.includes(`id="${IDS_DEL_FAQ.pregunta(i)}"`) && b.includes('aria-expanded="false"') && b.includes(`aria-controls="${IDS_DEL_FAQ.respuesta(i)}"`) && b.includes('type="button"') && !b.includes('tabindex="-1"')) &&
    PREGUNTAS_DEL_HOME.every((_, i) => h.includes(`<div id="${IDS_DEL_FAQ.respuesta(i)}" data-abierta="no" inert=""`)) &&
    veces(h, '<h3') === N && /<h3[^>]*><button /.test(h) && h.includes(`id="${IDS_DEL_FAQ.titulo}"`)
  )
}
afirmar(accesible(lista), 'cada pregunta es un botón adentro de su título (`h3`), con `aria-expanded` y `aria-controls` hacia su respuesta; las cerradas, `inert`')
controlPositivo('el detector ve un botón sin `aria-expanded`', lista.replace('aria-expanded="false"', ''), accesible)
controlPositivo('  y uno que apunta a una respuesta que no existe', lista.replace(`aria-controls="${IDS_DEL_FAQ.respuesta(3)}"`, 'aria-controls="otra"'), accesible)
controlPositivo('  y una respuesta cerrada que se alcanza con el teclado', lista.replace(`data-abierta="no" inert=""`, 'data-abierta="no"'), accesible)

const textoEntero = (h: string): boolean => PREGUNTAS_DEL_HOME.every((p) => h.includes(p.pregunta) && h.includes(p.respuesta)) && !h.includes('role="region"') && !/<section[\s>]/.test(h) && !h.includes('wa.me')
afirmar(textoEntero(lista), 'el texto entero de las seis en el HTML (las cerradas también), sin regiones propias ni el WhatsApp (ya está el del pie)')
controlPositivo('el detector ve una respuesta que sólo se monta abierta', lista.replace(PREGUNTAS_DEL_HOME[5].respuesta, ''), textoEntero)
const datos = datosEstructuradosDelFaq(PREGUNTAS_DEL_HOME) as { readonly mainEntity: readonly { readonly name: string; readonly acceptedAnswer: { readonly text: string } }[] }
const enFaqPage = (d: typeof datos): boolean => d.mainEntity.length === N && d.mainEntity.every((q, i) => q.name === PREGUNTAS_DEL_HOME[i].pregunta && q.acceptedAnswer.text === PREGUNTAS_DEL_HOME[i].respuesta)
afirmar(enFaqPage(datos), '  y en los datos estructurados (`FAQPage`), los mismos textos')
controlPositivo('  el detector ve una pregunta de menos en `FAQPage`', { mainEntity: datos.mainEntity.slice(1) }, enFaqPage)
const faqDelPie = sinComentarios(leer('_componentes/faq/FaqDelPie.tsx'))
const datosEnLosDos = (f: string): boolean => {
  const i = f.indexOf('application/ld+json')
  const j = f.indexOf('{escenario ?')
  // [L5] La lista de después del pie (la última) se elige con los datos ya escritos; la de antes del pie (el teléfono del home) no los lleva.
  return i > 0 && j > i && f.lastIndexOf('<FaqEnLista') > j
}
afirmar(datosEnLosDos(faqDelPie), '  los datos se escriben antes de elegir el modo (los lleva también la lista)')
controlPositivo('  el detector ve los datos sólo en el escenario', faqDelPie.replace('application/ld+json', 'x').replace('{escenario ?', '{escenario ? application/ld+json'), datosEnLosDos)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Abrir y cerrar: la fila abierta, la cerrada; con menos movimiento, sin animación')

const fila = (abierta: boolean, reducido: boolean): string =>
  renderToStaticMarkup(
    <ul>
      <FilaDelFaq pregunta={PREGUNTAS_DEL_HOME[0]} indice={0} abierta={abierta} reducido={reducido} alTocar={nada} alApretar={nada} boton={nada} />
    </ul>,
  )
const clasesDelPanel = (h: string): string => /<div id="faq-del-pie-respuesta-0"[^>]*class="([^"]*)"/.exec(h)?.[1] ?? ''
const abreYCierra = (abierta: string, cerrada: string): boolean =>
  abierta.includes('aria-expanded="true"') && /<div id="faq-del-pie-respuesta-0" data-abierta="si"(?! inert)/.test(abierta) && abierta.includes('rotate-180') &&
  cerrada.includes('aria-expanded="false"') && cerrada.includes('data-abierta="no" inert=""') && !cerrada.includes('rotate-180') &&
  clasesDelPanel(abierta) !== clasesDelPanel(cerrada) && abierta.includes(PREGUNTAS_DEL_HOME[0].respuesta) && cerrada.includes(PREGUNTAS_DEL_HOME[0].respuesta)
afirmar(abreYCierra(fila(true, false), fila(false, false)), 'abierta: `aria-expanded` en verdadero, su respuesta alcanzable y con alto, la flecha dada vuelta; cerrada, al revés (el texto, en las dos)')
controlPositivo('el detector ve una fila que no cambia al abrirse', [fila(false, false), fila(false, false)] as const, ([a, c]) => abreYCierra(a, c))
const conDespliegue = (h: string): boolean => /class="grid transition-/.test(h) && h.includes('transition-transform') && h.includes('transition-opacity') && h.includes('motion-reduce:transition-none') && h.includes('duration-')
const sinAnimacion = (h: string): boolean => !h.includes('transition') && !h.includes('duration-')
afirmar(conDespliegue(fila(true, false)) && conDespliegue(fila(false, false)), 'con movimiento, la respuesta se despliega (el alto de la fila, la aparición del texto y el giro de la flecha), y el CSS la corta con menos movimiento')
controlPositivo('el detector ve una fila sin despliegue', fila(true, true), conDespliegue)
afirmar(sinAnimacion(fila(true, true)) && sinAnimacion(fila(false, true)), 'con menos movimiento (la preferencia del sitio), sin una sola transición: se abre de golpe')
controlPositivo('el detector ve una transición con menos movimiento', fila(true, false), sinAnimacion)
const fuente = sinComentarios(leer('_componentes/faq/FaqEnLista.tsx'))
const cableado = (f: string): boolean =>
  f.includes('const reducido = useMovimientoReducido()') && f.includes('reducido={reducido}') && f.includes('alTocar={() => setAbierta((a) => alternarLaRespuesta(a, i))}') && f.includes('preguntaConLaTecla(e.key, i, preguntas.length)') && f.includes('onClick={alTocar}') && f.includes('onKeyDown={alApretar}')
afirmar(cableado(fuente), '  el toque abre y cierra con `alternarLaRespuesta`, las teclas con `preguntaConLaTecla`, y la fila sabe del movimiento reducido del sitio')
controlPositivo('  el detector ve el toque sin cablear', fuente.replace('onClick={alTocar}', ''), cableado)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El vidrio: sin fondo liso; el material del sitio (desenfoque, filo, reflejo) con el tono del pie')

const raizDe = (h: string): string => /<div data-faq-del-pie="lista" class="([^"]*)"/.exec(h)?.[1] ?? 'sin raíz'
const sinFondoLiso = (h: string): boolean => !/(^|\s)bg-/.test(raizDe(h)) && veces(h, 'data-material="vidrio"') === 1 && /<div data-material="vidrio"[^>]*>\s*<h2/.test(h) && h.indexOf('data-material="vidrio"') < h.indexOf('<ul')
afirmar(sinFondoLiso(lista), 'la lista no lleva fondo propio (el papel liso de B10): el título y las preguntas van en UN panel de vidrio, sobre la escena')
controlPositivo('el detector ve el fondo liso de antes', lista.replace('class="text-tinta absolute', 'class="bg-fondo text-tinta absolute'), sinFondoLiso)
controlPositivo('  y las preguntas fuera del vidrio', lista.replace('data-material="vidrio"', 'data-x=""'), sinFondoLiso)

const css = leer('_estilos/vidrio.css').replace(/\/\*[\s\S]*?\*\//g, '')
const reglaDe = (c: string, selector: string): string => {
  const partes = [...c.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].split(',').some((s) => s.trim() === selector))
  return partes.map((m) => m[2]).join(';')
}
const materialBien = (c: string): boolean => {
  const base = reglaDe(c, '[data-v3] [data-material="vidrio"]')
  const reflejo = reglaDe(c, '[data-v3] [data-material="vidrio"]::before')
  const oscuro = reglaDe(c, '[data-v3] [data-material="vidrio"][data-seccion="invertida"]')
  return /(^|;)\s*backdrop-filter:\s*blur\(var\(--vidrio-desenfoque\)\)/.test(base) && /background-color:\s*color-mix\([^;]*transparent\)/.test(base) && /box-shadow:[^;]*inset[^;]*inset/.test(base) && /background-image:\s*linear-gradient/.test(reflejo) && /box-shadow:[^;]*--color-tinta/.test(oscuro)
}
afirmar(materialBien(css), 'el material (`vidrio.css`): el fondo desenfocado y saturado detrás, un tinte semitransparente, el filo de luz y la línea de arriba (dos sombras de adentro), el reflejo que baja (`::before`) y, oscuro, la luz del papel claro')
controlPositivo('el detector ve el material sin desenfoque', css.replace(/(\n\s*)backdrop-filter: blur\(var\(--vidrio-desenfoque\)\) saturate\(var\(--vidrio-saturacion\)\);/, '$1'), materialBien)
controlPositivo('  y sin el reflejo', css.replace(/(\[data-v3\] \[data-material="vidrio"\]::before \{[^}]*?)background-image:[^;]*;/, '$1'), materialBien)

const tonoBien = (f: (d: 'claro' | 'oscuro', inv: boolean) => 'claro' | 'oscuro', fte: string): boolean =>
  f('claro', false) === 'claro' && f('oscuro', false) === 'oscuro' && f('claro', true) === 'oscuro' &&
  /data-material="vidrio"\s*data-seccion=\{oscuro \? 'invertida' : undefined\}/.test(fte) && fte.includes('useTonoDebajo(sonda, cerca)') && /<span ref=\{sonda\} aria-hidden="true" className="[^"]*absolute[^"]*bottom-full/.test(fte)
afirmar(tonoBien(tonoDeLaLista, fuente), 'el tono, el del pie que la lista continúa (la sonda en su borde de arriba, `useTonoDebajo`) y oscuro en la sala invertida de una página; escrito en el propio vidrio (`vidrio.css` da vuelta el filo y el reflejo ahí)')
controlPositivo('el detector ve el tono escrito en la raíz y no en el vidrio', fuente.replace("data-seccion={oscuro ? 'invertida' : undefined}", '').replace('className={cn(\'text-tinta\'', "data-seccion={oscuro ? 'invertida' : undefined} className={cn('text-tinta'"), (f: string) => tonoBien(tonoDeLaLista, f))
controlPositivo('  y una sala invertida que deja el vidrio claro', ((d: 'claro' | 'oscuro') => d) as (d: 'claro' | 'oscuro', inv: boolean) => 'claro' | 'oscuro', (f) => tonoBien(f, fuente))

cerrar('s71-faq-telefono')
