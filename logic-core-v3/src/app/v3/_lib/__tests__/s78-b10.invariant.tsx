/**
 * s78 · B10 (2026-10-22) · EL FAQ DESPUÉS DEL PIE, sin navegador. Cada afirmación con su control positivo. Lo que se ve (el pie que se
 * hunde, los bloques que nacen, la respuesta que sube, el WhatsApp con la primera) lo mide el banco en el navegador
 * (`scripts-carga/faq-del-pie.ts`, lo corre el orquestador); el plan y qué mirar, en `docs/rediseno/SPRINT-B10-NOCTURNO.md`.
 *
 *   1 · el reloj del FAQ: entrando el pie se hunde y después sube el FAQ (saliendo, al revés), nunca los dos arriba, en el tiempo del
 *       cambio del formulario del pie; dar la vuelta a mitad de camino no salta; el pie de volumen se hunde con ese reloj;
 *   2 · el hundimiento en el DOM: la curva de la placa del formulario (primero baja, después el piso se cierra), sin estilo en su lugar;
 *   3 · el gatillo: qué hace con cada gesto; el FAQ toma el gesto ANTES que el final del pie (no rebobina el encastre) y su cola;
 *   4 · el bloque de la derecha: la respuesta que se hunde y la nueva que sube en su lugar, y el WhatsApp con la primera;
 *   5 · el marcado: el texto entero en el HTML y en los datos estructurados de FAQ; las preguntas son botones (el teclado); la lista
 *       del teléfono sin efectos ni WhatsApp; el WhatsApp con el número del repo; seis preguntas por página, sin cifras;
 *   6 · dónde va: después del pie, en el home y en el cierre de una página, sin sumarle alto al layout (la escena no se corre).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { FaqDelPie } from '../../_componentes/faq/FaqDelPie'
import { FaqEnLista } from '../../_componentes/faq/FaqEnLista'
import { estiloDelNivel, pisoDelNivel } from '../../_componentes/faq/hundimientoEnElDom'
import { MAXIMO_DE_PREGUNTAS, TEXTOS_DEL_FAQ, WHATSAPP_DEL_FAQ, datosEstructuradosDelFaq, jsonParaElScript, type PreguntaFrecuente } from '../../_componentes/faq/preguntas'
import { nivelDelWhatsApp, pasoDeLaRespuesta, pedirLaRespuesta, relojDeLaRespuestaQuieto, type RelojDeLaRespuesta } from '../../_componentes/faq/relojDeLaRespuesta'
import { primeroDelFaq } from '../../_componentes/faq/useGatilloDelFaq'
import { CierreDeLaPagina } from '../../_componentes/pagina/cierre/CierreDeLaPagina'
import { PREGUNTAS_DE_LA_BASE } from '../../pagina-base/faq'
import { PRESET as PRESET_DE_LA_BASE } from '../../pagina-base/preset'
import { NUMERO_DE_WHATSAPP } from '../../_secciones/cierre/contacto'
import { PREGUNTAS_DEL_HOME } from '../../_secciones/cierre/faq'
import { PARTES_DEL_CIERRE } from '../escena/ruta/atributoDelCierre'
import { CAMBIO_DEL_PIE, pisoDelHundimiento } from '../formularios/volteo'
import { retenerLosGestos, tomarLosGestos, type DecisionDelPrimero, type GestoDeScroll } from '../gestosDelScroll'
import { FAQ_EN_VIVO, MITAD_DEL_CAMBIO_MS, decidirElGestoDelFaq, entrar, faseEn, nivelesDelFaq, relojDelFaqQuieto, salir, soltarElFaq, type DecisionDelFaq, type FaseDelFaq, type GestoAnteElFaq, type RelojDelFaq } from '../pie3d/faqDelPie'
import { pasoDelHundimiento } from '../pie3d/salidas'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

;(globalThis as unknown as { React: typeof React }).React = React

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const cerca = (a: number, b: number, e = 1e-9): boolean => Math.abs(a - b) < e
const M = MITAD_DEL_CAMBIO_MS
const muestras = Array.from({ length: 401 }, (_, i) => (i / 400) * 2 * M)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El reloj del FAQ: el cambio del formulario del pie, entre el pie y el FAQ')

afirmar(cerca(2 * M, CAMBIO_DEL_PIE.s * 1000), 'el cambio entero dura lo que el del formulario del pie (`CAMBIO_DEL_PIE`): la mitad para hundirse, la mitad para subir', `${String(CAMBIO_DEL_PIE.s)} s`)

type Niveles = (r: RelojDelFaq, ahora: number) => { readonly pie: number; readonly faq: number }
/** Entrando: el pie baja entero en la primera mitad y el FAQ sube en la segunda; nunca los dos arriba; al final, adentro. */
const entraEnOrden = (n: Niveles): boolean => {
  const r: RelojDelFaq = { fase: 'entrando', desde: 0 }
  return (
    muestras.every((t) => n(r, t).pie * n(r, t).faq === 0) &&
    cerca(n(r, 0).pie, 1) && cerca(n(r, M).pie, 0) && cerca(n(r, M).faq, 0) && cerca(n(r, 1.5 * M).faq, 0.5) && cerca(n(r, 2 * M).faq, 1) &&
    faseEn(r, 2 * M) === 'adentro' && faseEn(r, 2 * M - 1) === 'entrando'
  )
}
afirmar(entraEnOrden(nivelesDelFaq), 'entrando: el pie se hunde en la primera mitad, el FAQ sube en la segunda (nunca los dos arriba) y al terminar queda adentro')
controlPositivo('  el detector ve el FAQ que sube mientras el pie todavía se hunde', ((r: RelojDelFaq, t: number) => ({ pie: Math.max(0, 1 - t / M), faq: Math.min(1, t / (2 * M)) })) as Niveles, entraEnOrden)

const saleEnOrden = (n: Niveles): boolean => {
  const r: RelojDelFaq = { fase: 'saliendo', desde: 0 }
  return muestras.every((t) => n(r, t).pie * n(r, t).faq === 0) && cerca(n(r, 0).faq, 1) && cerca(n(r, M).faq, 0) && cerca(n(r, 2 * M).pie, 1) && faseEn(r, 2 * M) === 'fuera'
}
afirmar(saleEnOrden(nivelesDelFaq), 'saliendo, al revés: el FAQ se hunde primero y después vuelve el pie (al terminar, fuera)')
controlPositivo('  el detector ve el pie que vuelve con el FAQ arriba', ((r: RelojDelFaq, t: number) => ({ pie: Math.min(1, t / M), faq: 1 - Math.min(1, t / M) })) as Niveles, saleEnOrden)

/** Dar la vuelta a mitad de camino (salir mientras entra, entrar mientras sale) sigue desde donde estaba: sin saltos. */
const vueltaSinSalto = (dar: (r: RelojDelFaq, ahora: number) => boolean): boolean =>
  [0.3, 0.7, 1, 1.4, 1.9].every((k) => {
    const r: RelojDelFaq = { fase: 'entrando', desde: 0 }
    const t = k * M
    const antes = nivelesDelFaq(r, t)
    dar(r, t)
    const despues = nivelesDelFaq(r, t)
    return r.fase === 'saliendo' && cerca(antes.pie, despues.pie) && cerca(antes.faq, despues.faq)
  })
afirmar(vueltaSinSalto(salir), 'salir mientras entra da la vuelta en el punto en que iba (el espejo del tiempo): ningún bloque salta')
controlPositivo('  el detector ve la salida que empieza de cero', (r: RelojDelFaq, ahora: number) => {
  r.fase = 'saliendo'
  r.desde = ahora
  return true
}, vueltaSinSalto)
const r1 = relojDelFaqQuieto()
afirmar(entrar(r1, 0) && !entrar(r1, 10) && salir(r1, 3 * M) && !salir(r1, 3 * M + 1) && faseEn(r1, 5 * M) === 'fuera' && entrar(r1, 5 * M), '  entrar dos veces no reinicia; salir desde adentro corre el cambio entero; terminado, se puede volver a entrar')

/** El pie de volumen se hunde con ese reloj (`pasoDelHundimiento`, lo que la escena ya usa para hundirlo en sus huecos antes de un viaje). */
const hundeConElFaq = (paso: (ahora: number, enViaje: boolean) => number): boolean => {
  const ahora = 1e6
  Object.assign(FAQ_EN_VIVO, { fase: 'adentro' as FaseDelFaq, desde: ahora - 10 * M })
  const adentro = paso(ahora, false)
  Object.assign(FAQ_EN_VIVO, { fase: 'entrando' as FaseDelFaq, desde: ahora - M / 2 })
  const mitad = paso(ahora, false)
  soltarElFaq()
  const fuera = paso(ahora, false)
  return cerca(adentro, 1) && cerca(mitad, 0.5) && fuera === 0
}
afirmar(hundeConElFaq(pasoDelHundimiento), 'el pie de volumen se hunde con el FAQ: entero (las piezas en sus huecos, el piso cerrado) mientras está adentro; a medias entrando; nada fuera')
controlPositivo('  el detector ve un hundimiento que ignora al FAQ', (() => 0) as (a: number, v: boolean) => number, hundeConElFaq)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El hundimiento en el DOM: la curva de la placa del formulario')

const niveles = Array.from({ length: 101 }, (_, i) => i / 100)
const mismaCurva = (piso: (n: number) => { readonly cerrado: number; readonly hondo: number }): boolean =>
  niveles.every((n) => {
    const p = pisoDelHundimiento((1 - n) / 2)
    const d = piso(n)
    return cerca(d.cerrado, p.cerrado) && cerca(d.hondo, p.baja)
  }) &&
  // Primero baja (el piso abierto) y recién abajo el piso se cierra: con medio nivel arriba, abierto; con medio abajo, hondo entero.
  niveles.filter((n) => n >= 0.5).every((n) => piso(n).cerrado === 0) && niveles.filter((n) => n <= 0.5).every((n) => cerca(piso(n).hondo, 1))
afirmar(mismaCurva(pisoDelNivel), 'el FAQ y el pie plano se hunden con la curva de la placa 3D del formulario (`pisoDelHundimiento`): primero bajan por su hueco, después el piso se cierra')
controlPositivo('  el detector ve un piso que se cierra antes de que baje', (n: number) => ({ cerrado: pisoDelNivel(n).hondo, hondo: pisoDelNivel(n).cerrado }), mismaCurva)
const estilosBien = (f: typeof estiloDelNivel): boolean => {
  const arriba = f(1)
  const abajo = f(0)
  return arriba.clipPath === '' && arriba.transform === '' && arriba.opacity === '' && abajo.clipPath.startsWith('inset(50.000%') && /translateZ\(-\d/.test(abajo.transform)
}
afirmar(estilosBien(estiloDelNivel), '  en su lugar, sin estilo (el vidrio entero, con su desenfoque); hundido, recortado hasta no tener área (no se ve ni recibe el puntero, sigue en el documento)')
controlPositivo('  el detector ve un bloque que queda recortado en su lugar', ((n: number) => ({ ...estiloDelNivel(n), clipPath: 'inset(0%)' })) as typeof estiloDelNivel, estilosBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El gatillo: seguir scrolleando después del pie trae el FAQ, subir lo saca, y el final del pie no se entera')

const gesto = (sentido: -1 | 1, nuevo: boolean, otros: Partial<GestoAnteElFaq> = {}): GestoAnteElFaq => ({ sentido, nuevo, origen: 'rueda', puedeEntrar: true, focoAdentro: false, ...otros })
type Decidir = (f: FaseDelFaq, g: GestoAnteElFaq, guarda: boolean) => DecisionDelFaq
const tablaBien = (d: Decidir): boolean =>
  d('fuera', gesto(1, true), false) === 'entra' &&
  d('fuera', gesto(1, false), false) === 'sigue' &&
  d('fuera', gesto(1, true, { puedeEntrar: false }), false) === 'sigue' &&
  d('fuera', gesto(-1, true), false) === 'sigue' &&
  d('adentro', gesto(-1, true), false) === 'sale' &&
  d('adentro', gesto(-1, false), false) === 'toma' &&
  d('adentro', gesto(1, true), false) === 'toma' &&
  d('entrando', gesto(-1, true), false) === 'sale' &&
  d('saliendo', gesto(1, true), false) === 'entra' &&
  d('saliendo', gesto(-1, false), false) === 'toma' &&
  d('fuera', gesto(-1, false), true) === 'toma' &&
  d('fuera', gesto(-1, true), true) === 'sigue' &&
  d('adentro', gesto(-1, true, { origen: 'tecla', focoAdentro: true }), false) === 'suelta'
afirmar(tablaBien(decidirElGestoDelFaq), 'un gesto NUEVO hacia abajo con el pie entero al fondo entra; uno nuevo hacia arriba sale; la cola de un gesto que lo movió se retiene; con el foco adentro, las teclas son del FAQ')
controlPositivo('  el detector ve un FAQ que deja pasar la subida (el final rebobinaría el encastre)', ((f: FaseDelFaq, g: GestoAnteElFaq, guarda: boolean) => (f === 'adentro' && g.sentido < 0 ? 'sigue' : decidirElGestoDelFaq(f, g, guarda))) as Decidir, tablaBien)

// Con los gestos de verdad (`gestosDelScroll.ts`), en una ventana de mentira: el final del pie es un retenedor que rebobina con la subida.
type Escucha = (e: unknown) => void
const escuchas = new Map<string, Escucha>()
;(globalThis as unknown as { window: unknown }).window = {
  addEventListener: (tipo: string, f: Escucha): void => {
    escuchas.set(tipo, f)
  },
  removeEventListener: (tipo: string): void => {
    escuchas.delete(tipo)
  },
}
let reloj = 0
/** Una rueda (con un silencio antes: un gesto nuevo): si quedó retenida. */
function rueda(dy: number): boolean {
  reloj += 1000
  let retenida = false
  escuchas.get('wheel')?.({ deltaX: 0, deltaY: dy, ctrlKey: false, timeStamp: reloj, cancelable: true, preventDefault: () => (retenida = true), stopPropagation: () => undefined })
  return retenida
}
interface Ensayo {
  readonly subeAdentro: { readonly retenida: boolean; readonly finalLaVio: boolean; readonly fase: FaseDelFaq }
  readonly subeFuera: { readonly finalLaVio: boolean }
  readonly bajaFuera: { readonly retenida: boolean; readonly finalLaVio: boolean; readonly fase: FaseDelFaq }
}
function ensayo(primero: (g: GestoDeScroll) => DecisionDelPrimero): Ensayo {
  const vistos: number[] = []
  const soltarElFinal = retenerLosGestos((g) => {
    vistos.push(g.sentido)
    return g.sentido < 0
  })
  const soltar = tomarLosGestos(primero)
  Object.assign(FAQ_EN_VIVO, { fase: 'adentro' as FaseDelFaq, desde: performance.now() - 10 * M, guardaHasta: Number.NEGATIVE_INFINITY })
  const r1 = rueda(-100)
  const subeAdentro = { retenida: r1, finalLaVio: vistos.length > 0, fase: FAQ_EN_VIVO.fase }
  soltarElFaq()
  vistos.length = 0
  rueda(-100)
  const subeFuera = { finalLaVio: vistos.length > 0 }
  vistos.length = 0
  const r3 = rueda(100)
  const bajaFuera = { retenida: r3, finalLaVio: vistos.length > 0, fase: FAQ_EN_VIVO.fase }
  soltar()
  soltarElFinal()
  soltarElFaq()
  return { subeAdentro, subeFuera, bajaFuera }
}
const ensayoBien = (e: Ensayo): boolean =>
  e.subeAdentro.retenida && !e.subeAdentro.finalLaVio && e.subeAdentro.fase === 'saliendo' && e.subeFuera.finalLaVio && e.bajaFuera.retenida && !e.bajaFuera.finalLaVio && e.bajaFuera.fase === 'entrando'
const delFaq = ensayo(primeroDelFaq(() => true, () => false))
afirmar(ensayoBien(delFaq), 'con los gestos de verdad: subir con el FAQ adentro lo saca y el final del pie NO ve ese gesto (no rebobina el encastre); fuera, el final lo ve como siempre; bajar al fondo lo trae', JSON.stringify(delFaq))
controlPositivo('  el detector ve un FAQ que es un retenedor más (el final ve la subida)', ensayo(() => 'sigue'), ensayoBien)
afirmar(escuchas.size === 0, '  sin nadie que los pida, los escuchas de los gestos se van')

const escenarioTsx = sinComentarios(leer('_componentes/faq/FaqEnEscenario.tsx'))
const flechasBien = (c: string): boolean => /e\.key === 'ArrowDown' \? 1 : e\.key === 'ArrowUp' \? -1 : 0/.test(c) && /e\.preventDefault\(\)\s*botones\.current\[\(i \+ paso \+ preguntas\.length\) % preguntas\.length\]\?\.focus\(\)/.test(c)
afirmar(flechasBien(escenarioTsx), '  el teclado: las preguntas son botones (Tab) y las flechas pasan de una a la otra (dando la vuelta)')
controlPositivo('  el detector ve las flechas que no recorren', escenarioTsx.replace("e.key === 'ArrowDown' ? 1", "e.key === 'ArrowDown' ? 0"), flechasBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El bloque de la derecha: se hunde lo que estaba y sube la respuesta en su lugar; con la primera, el WhatsApp')

interface Corrida {
  readonly aMitadBajando: number
  readonly mostradoAntes: number | 'aviso'
  readonly mostradoDespues: number | 'aviso'
  readonly aMitadSubiendo: number
  readonly quieto: boolean
  readonly ultimaGana: number | 'aviso'
  readonly otroAlTerminar: boolean
  readonly whatsapp: readonly number[]
}
function corrida(paso: typeof pasoDeLaRespuesta, whatsApp: typeof nivelDelWhatsApp): Corrida {
  const r: RelojDeLaRespuesta = relojDeLaRespuestaQuieto()
  pedirLaRespuesta(r, 0)
  paso(r, 0)
  const aMitadBajando = paso(r, M / 2).nivel
  const mostradoAntes = r.mostrado
  paso(r, M + 1)
  const mostradoDespues = r.mostrado
  const aMitadSubiendo = paso(r, 1.5 * M + 1).nivel
  const fin = paso(r, 2 * M + 2)
  const quieto = fin.nivel === 1 && !fin.enCurso
  const w = [whatsApp(r, M), whatsApp(r, 1.5 * M), whatsApp(r, 2 * M + 1)]
  // Otra (1) mientras se hunde la 0, y enseguida otra (2): sube la última.
  pedirLaRespuesta(r, 1)
  paso(r, 3 * M)
  pedirLaRespuesta(r, 2)
  paso(r, 3.5 * M)
  paso(r, 4 * M + 1)
  const ultimaGana = r.mostrado
  // Y una más (3) mientras sube la 2: al terminar, otro cambio.
  pedirLaRespuesta(r, 3)
  const alTerminar = paso(r, 5 * M + 2)
  const otroAlTerminar = alTerminar.enCurso && r.mostrado === 2
  return { aMitadBajando, mostradoAntes, mostradoDespues, aMitadSubiendo, quieto, ultimaGana, otroAlTerminar, whatsapp: [...w, whatsApp(r, 6 * M)] }
}
const corridaBien = (c: Corrida): boolean =>
  cerca(c.aMitadBajando, 0.5) && c.mostradoAntes === 'aviso' && c.mostradoDespues === 0 && cerca(c.aMitadSubiendo, 0.5, 1e-3) && c.quieto && c.ultimaGana === 2 && c.otroAlTerminar &&
  cerca(c.whatsapp[0], 0) && cerca(c.whatsapp[1], 0.5, 1e-3) && cerca(c.whatsapp[2], 1) && cerca(c.whatsapp[3], 1)
const laCorrida = corrida(pasoDeLaRespuesta, nivelDelWhatsApp)
afirmar(corridaBien(laCorrida), 'tocar una pregunta: el aviso se hunde (media mitad, nivel 0,5), a cubierto se cambian y sube la respuesta; con otra mientras se hunde, sube la última; mientras sube, al terminar otro cambio; el WhatsApp sube con la primera respuesta y se queda', JSON.stringify(laCorrida))
controlPositivo('  el detector ve el WhatsApp que sube con el aviso (antes de la primera respuesta)', corrida(pasoDeLaRespuesta, () => 1), corridaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El marcado: el texto en el HTML y en los datos estructurados; el teclado; la lista del teléfono')

const html = renderToStaticMarkup(<FaqDelPie preguntas={PREGUNTAS_DEL_HOME} pie="#cierre" colgada />)
const veces = (s: string, t: string): number => s.split(t).length - 1
const json = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1] ?? ''
interface DatosLeidos {
  readonly '@type'?: string
  readonly mainEntity?: readonly { readonly '@type'?: string; readonly name?: string; readonly acceptedAnswer?: { readonly text?: string } }[]
}
const datosBien = (texto: string, preguntas: readonly PreguntaFrecuente[]): boolean => {
  let d: DatosLeidos
  try {
    d = JSON.parse(texto) as DatosLeidos
  } catch {
    return false
  }
  const e = d.mainEntity ?? []
  return d['@type'] === 'FAQPage' && e.length === preguntas.length && e.every((q, i) => q['@type'] === 'Question' && q.name === preguntas[i].pregunta && q.acceptedAnswer?.text === preguntas[i].respuesta)
}
afirmar(datosBien(json, PREGUNTAS_DEL_HOME), 'los datos estructurados de FAQ (`FAQPage`, schema.org) con las seis preguntas y sus respuestas, en el HTML del servidor')
controlPositivo('  el detector ve los datos sin una respuesta', json.replace(/"acceptedAnswer":\{[^}]*\}/, '"acceptedAnswer":{}'), (t: string) => datosBien(t, PREGUNTAS_DEL_HOME))
const textoBien = (h: string): boolean => PREGUNTAS_DEL_HOME.every((p) => veces(h, p.pregunta) >= 2 && veces(h, p.respuesta) >= 2) && h.includes(TEXTOS_DEL_FAQ.aviso) && h.includes(TEXTOS_DEL_FAQ.titulo)
afirmar(textoBien(html), 'el texto entero va en el HTML (cada pregunta y TODAS las respuestas, además de en los datos), aunque en escritorio se vea una por vez')
controlPositivo('  el detector ve una respuesta que sólo está en los datos', html.replace(`>${PREGUNTAS_DEL_HOME[2].respuesta}<`, '><'), textoBien)
const tecladoBien = (h: string): boolean =>
  veces(h, '<button type="button"') === PREGUNTAS_DEL_HOME.length &&
  PREGUNTAS_DEL_HOME.every((_, i) => h.includes(`id="faq-del-pie-pregunta-${String(i)}" aria-expanded="false" aria-controls="faq-del-pie-respuesta-${String(i)}"`) && h.includes(`id="faq-del-pie-respuesta-${String(i)}" hidden=""`))
afirmar(tecladoBien(html), 'las preguntas se recorren con el teclado: un botón por pregunta, con `aria-expanded` y `aria-controls` hacia su respuesta; las que no se ven, `hidden`')
controlPositivo('  el detector ve preguntas que no son botones', html.replaceAll('<button type="button"', '<div'), tecladoBien)
const cerradoBien = (h: string): boolean =>
  /data-faq-del-pie="escenario" data-fase="fuera"[^>]*class="absolute inset-x-0 bottom-0 z-10 h-svh pointer-events-none"/.test(h) && veces(h, 'clip-path:inset(50.000%') === 3 && !h.includes('wa.me') && !h.includes('transform:')
afirmar(cerradoBien(html), 'del servidor sale el escenario cerrado: en la pantalla del pie (fuera del flujo), sin puntero, los tres bloques recortados en su hueco (sólo el recorte: lo servido no escribe transformadas) y sin el WhatsApp hasta la primera respuesta')
controlPositivo('  el detector ve un WhatsApp antes de la primera respuesta', html.replace('</ul>', `</ul><a href="${WHATSAPP_DEL_FAQ}">x</a>`), cerradoBien)
controlPositivo('  y una transformada en lo servido', html.replace('clip-path:inset(50.000%', 'transform:none;clip-path:inset(50.000%'), cerradoBien)
const sinMarcasBien = (h: string): boolean => !/<section[\s>]/.test(h) && !h.includes('role="region"') && /<div aria-hidden="true" class="hidden"><script type="application\/ld\+json">/.test(h) && veces(h, '<h2') === 1
afirmar(sinMarcasBien(html), '  sin regiones propias (el home sigue con una por sección; el FAQ se encuentra por su título, un `h2`) y los datos en una caja sin lugar que el lector no anuncia')
controlPositivo('  el detector ve una región de más', html.replace('<div data-faq-del-pie', '<section data-faq-del-pie'), sinMarcasBien)

const listaHtml = renderToStaticMarkup(<FaqEnLista preguntas={PREGUNTAS_DEL_HOME} colgada />)
// [C2 · 71t] cambió por diseño (la 71 §6): la lista es un acordeón de vidrio, sin el fondo liso del papel; cada pregunta es un botón que
// abre su respuesta (lo del acordeón y el vidrio, con sus controles, en `s71-faq-telefono`). Lo de B10 sigue: sin hundimiento ni WhatsApp.
const listaBien = (h: string): boolean => !h.includes('wa.me') && !h.includes('clip-path') && veces(h, '<h3') === PREGUNTAS_DEL_HOME.length && veces(h, '<button type="button"') === PREGUNTAS_DEL_HOME.length && PREGUNTAS_DEL_HOME.every((p) => h.includes(p.respuesta)) && /data-faq-del-pie="lista"[^>]*class="text-tinta absolute inset-x-0 top-full"/.test(h)
afirmar(listaBien(listaHtml), 'en el teléfono (y con menos movimiento), la lista: cada pregunta (un título con su botón) con su respuesta en el HTML, sin el hundimiento del escenario y sin el bloque de WhatsApp')
controlPositivo('  el detector ve el escenario (con efectos y WhatsApp) en el teléfono', html, listaBien)
const enElFlujo = (h: string): boolean => /data-faq-del-pie="lista"[^>]*class="text-tinta relative"/.test(h)
afirmar(enElFlujo(renderToStaticMarkup(<FaqEnLista preguntas={PREGUNTAS_DEL_HOME} colgada={false} />)), '  en una página la lista va en el flujo (después del pie del cierre); en el home, colgada')
controlPositivo('  el detector ve la lista colgada en una página', listaHtml, enElFlujo)

const whatsappBien = (url: string, fuente: string): boolean =>
  url.startsWith(`https://wa.me/${NUMERO_DE_WHATSAPP}?text=`) && /\{conWhatsApp && \(\s*<a href=\{WHATSAPP_DEL_FAQ\}/.test(fuente) && fuente.includes('<DosCopias>{TEXTOS_DEL_FAQ.dudas}</DosCopias>') && TEXTOS_DEL_FAQ.dudas === '¿Te quedaron dudas? Escribinos'
afirmar(whatsappBien(WHATSAPP_DEL_FAQ, escenarioTsx), '«¿Te quedaron dudas? Escribinos» va a WhatsApp con el número del repo (el del pie, `contacto.ts`), y existe recién con la primera respuesta', NUMERO_DE_WHATSAPP)
controlPositivo('  el detector ve otro número', WHATSAPP_DEL_FAQ.replace(NUMERO_DE_WHATSAPP, '5490000000000'), (u: string) => whatsappBien(u, escenarioTsx))
controlPositivo('  y un WhatsApp que está desde el principio', escenarioTsx.replace('{conWhatsApp && (', '{true && ('), (f: string) => whatsappBien(WHATSAPP_DEL_FAQ, f))

const conLaEtiqueta = { ...datosEstructuradosDelFaq([{ pregunta: 'x', respuesta: '</script><script>alert(1)</script>' }]), linea: `a${String.fromCharCode(0x2028)}b` }
const seguroBien = (f: (d: Record<string, unknown>) => string): boolean => {
  const s = f(conLaEtiqueta)
  return !/<\/script/i.test(s) && !s.includes(String.fromCharCode(0x2028)) && JSON.stringify(JSON.parse(s)) === JSON.stringify(conLaEtiqueta)
}
afirmar(seguroBien(jsonParaElScript), '  el JSON del bloque no lo puede cerrar un texto (`<` escapado) ni lo corta un separador de renglón, y se lee igual')
controlPositivo('  el detector ve el JSON sin escapar', (d: Record<string, unknown>) => JSON.stringify(d), seguroBien)

const preguntasBien = (ps: readonly PreguntaFrecuente[]): boolean => ps.length === MAXIMO_DE_PREGUNTAS && new Set(ps.map((p) => p.pregunta)).size === ps.length && ps.every((p) => p.pregunta.endsWith('?') && !/\d/.test(p.pregunta + p.respuesta))
afirmar(preguntasBien(PREGUNTAS_DEL_HOME) && preguntasBien(PREGUNTAS_DE_LA_BASE), 'seis preguntas por página (las del home, sobre develOP; las de la base, como la de Páginas web), distintas y sin cifras inventadas')
controlPositivo('  el detector ve una cifra inventada', [...PREGUNTAS_DE_LA_BASE.slice(0, 5), { pregunta: '¿Cuánto tarda?', respuesta: 'Tres semanas, 21 días.' }], preguntasBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Dónde va: después del pie, en el home y en el cierre de una página, sin sumarle alto al layout')

const cierreHtml = renderToStaticMarkup(<CierreDeLaPagina preset={PRESET_DE_LA_BASE} preguntas={PREGUNTAS_DE_LA_BASE} />)
const PARTE_DEL_PIE = `data-parte="${PARTES_DEL_CIERRE.pie}"`
const enLaPaginaBien = (h: string): boolean => h.indexOf('data-faq-del-pie') > h.indexOf(PARTE_DEL_PIE) && h.indexOf(PARTE_DEL_PIE) > 0 && PREGUNTAS_DE_LA_BASE.every((p) => h.includes(p.respuesta)) && veces(h, 'data-columna-del-pie=""') === 3
afirmar(enLaPaginaBien(cierreHtml), 'en el cierre de una página, después del pie, con las preguntas de la página; las tres columnas del pie marcadas para hundirse en su lugar')
controlPositivo('  el detector ve el FAQ antes del pie', cierreHtml.replace('data-faq-del-pie', 'x').replace(PARTE_DEL_PIE, `data-faq-del-pie ${PARTE_DEL_PIE}`), enLaPaginaBien)
afirmar(!renderToStaticMarkup(<CierreDeLaPagina preset={PRESET_DE_LA_BASE} />).includes('data-faq-del-pie'), '  sin preguntas, no hay FAQ')
const base = leer('pagina-base/page.tsx')
const cierre = sinComentarios(leer('_secciones/cierre/Cierre.tsx'))
const montadoBien = (b: string, c: string): boolean => b.includes('<CierreDeLaPagina preset={PRESET} preguntas={PREGUNTAS_DE_LA_BASE} />') && /<FaqDelPie preguntas=\{PREGUNTAS_DEL_HOME\} pie=\{`#\$\{seccion\.id\}`\} lugar="antes" \/>\s*(\{\}\s*)?<CoreografiaEnTodoAncho>/.test(c) && /<\/CoreografiaEnTodoAncho>\s*(\{\}\s*)?<FaqDelPie preguntas=\{PREGUNTAS_DEL_HOME\} pie=\{`#\$\{seccion\.id\}`\} colgada lugar="despues" \/>\s*<\/Seccion>/.test(c)
afirmar(montadoBien(base, cierre), 'la página base le pasa sus preguntas al cierre; el home monta el FAQ en su pie, después del pie, con las suyas ([L5] y en el teléfono, antes del pie)')
controlPositivo('  el detector ve el home sin el FAQ', [base, cierre.replace(/<FaqDelPie[^>]*\/>/, '')] as const, ([b, c]) => montadoBien(b, c))

// La REGLA DE ALTURAS: el escenario va dentro de la pantalla del pie y la lista cuelga fuera del layout; el final mide el LAYOUT.
const final = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
const encuadre = sinComentarios(leer('_lib/escena/final/encuadreDelPie.ts'))
const alturasBien = (h: string, l: string, f: string, e: string): boolean =>
  /class="absolute inset-x-0 bottom-0 z-10 h-svh/.test(h) && /data-faq-del-pie="lista" class="text-tinta absolute inset-x-0 top-full"/.test(l) &&
  f.includes('s.fondo = Math.max(0, document.documentElement.offsetHeight - window.innerHeight)') && e.includes('const corre = Math.max(0, document.documentElement.offsetHeight - vista.alto) - window.scrollY') && !/scrollHeight/.test(e)
afirmar(alturasBien(html, listaHtml, final, encuadre), 'el FAQ no le suma alto al layout: el escenario va en la pantalla del pie y la lista cuelga después (desborde, no alto): el final del pie y su encuadre miden el layout (el encastre corre al fondo del pie) y la escena (las secciones) no se corre')
controlPositivo('  el detector ve la lista en el flujo del home', [html, listaHtml.replace(' absolute inset-x-0 top-full', ''), final, encuadre] as const, ([h, l, f, e]) => alturasBien(h, l, f, e))
controlPositivo('  y el encuadre del final que mide el desborde', [html, listaHtml, final, encuadre.replace('document.documentElement.offsetHeight - vista.alto', 'document.documentElement.scrollHeight - vista.alto')] as const, ([h, l, f, e]) => alturasBien(h, l, f, e))
const encuadreSinFaq = (e: string): boolean => e.includes('if (e.closest(SELECTOR_DEL_FAQ) !== null) continue')
afirmar(encuadreSinFaq(encuadre), '  lo del FAQ en lista (dentro de la sección del pie) no cuenta como algo que tapa el logo del final')
controlPositivo('  el detector ve el encuadre que cuenta el FAQ', encuadre.replace('if (e.closest(SELECTOR_DEL_FAQ) !== null) continue', ''), encuadreSinFaq)

cerrar('s78-b10')
