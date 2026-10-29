/**
 * s78 · C2-71 (2026-10-23) · EL PIE Y EL FAQ DE ESCRITORIO, sin navegador. Cada afirmación con su control positivo. Lo que se ve lo mide
 * el banco (`scripts-carga/faq-del-pie.ts`, lo corre el orquestador); el plan y qué mirar, en `docs/rediseno/SPRINT-C2-71.md`.
 *
 *   1 · el pie se guarda por columnas: el hueco de cada columna se abre, la columna baja tal como es sobre su plataforma, el piso se cierra
 *       y recién ahí sale el FAQ; nada atraviesa el fondo (la «piel» de los inputs era el fondo del pozo del formulario atravesándolo);
 *   2 · los bloques del FAQ son placas como la del formulario: su hueco se abre antes de que suban, su fondo va siempre debajo, del tamaño
 *       del formulario (la derecha) y de su ancho y más alta (la izquierda); en volumen no son de vidrio;
 *   3 · el botón del FAQ: sale después de que el pie se acostó, una sola vez por carga, y tocarlo es el gesto que trae el FAQ;
 *   4 · el bug del pie (`lote2/19`): lo perdido del contexto es del lienzo vivo (uno descartado no deja al nuevo «perdido» para siempre) y
 *       la compilación del pie que falla no lo deja colgado.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as THREE from 'three'

import { FaqEnEscenario } from '../../_componentes/faq/FaqEnEscenario'
import { TEXTO_DEL_BOTON_DEL_FAQ } from '../../_componentes/faq/BotonDelFaq'
import { MEDIDAS_DEL_FAQ, medidasDelFaq, type MedidasDelFaq } from '../../_componentes/faq/useMedidasDelForm'
import { PREGUNTAS_DEL_HOME } from '../../_secciones/cierre/faq'
import { contextoPerdido, vigilarElContexto } from '../escena/contextoDelLienzo'
import { BLOQUES_DE_VOLUMEN, poseDelBloque } from '../escena/pie3d/faqDeVolumen'
import { VOLUMEN_DEL_PIE, armarElBloque } from '../escena/pie3d/geometria'
import { HUECO_DEL_PIE, TECHO_DE_LOS_TEXTOS } from '../escena/pie3d/huecos'
import { hondoDeLaColumna } from '../escena/pie3d/huecosDeLaCaida'
import { FLOOR_Y } from '../escena/probeScene'
import { BOTON_DEL_FAQ, BOTON_EN_VIVO, FAQ_EN_VIVO, MITAD_DEL_CAMBIO_MS, SUBIDA_DEL_BLOQUE, decidirElGestoDelFaq, entrarSinGesto, faseEn, nivelesDelFaq, pasoDelBoton, rearmarElBotonDelFaq, relojDelFaqQuieto, soltarElFaq, subidaDelBloque, type FaseDelFaq, type RelojDelFaq } from '../pie3d/faqDelPie'
import { HUNDIMIENTO_EN_COLUMNAS, SALIDAS_DEL_PIE, columnaDelHundimiento, hundidaParaElViaje } from '../pie3d/salidas'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

;(globalThis as unknown as { React: typeof React }).React = React

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const muestras = (n: number): number[] => Array.from({ length: n + 1 }, (_, i) => i / n)
const M = MITAD_DEL_CAMBIO_MS

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El pie se guarda por columnas: abrir → hundir tal como es → cerrar (y recién ahí el FAQ)')

type Columna = (h: number) => { readonly abre: number; readonly baja: number }
/** El orden: el hueco abierto antes de que la plataforma baje, el piso cerrado sólo con la columna abajo del todo; al final, cerrado y abajo. */
const enOrden = (f: Columna): boolean =>
  muestras(400).every((h) => {
    const { abre, baja } = f(h)
    const abiertoAntes = baja <= 0.02 || abre >= 0.97 || h > HUNDIMIENTO_EN_COLUMNAS.cierraDesde
    const cerradoDespues = h <= HUNDIMIENTO_EN_COLUMNAS.abreHasta || abre >= 0.999 || baja >= 0.999
    return abiertoAntes && cerradoDespues
  }) &&
  f(0).abre === 0 && f(0).baja === 0 && f(1).abre === 0 && f(1).baja === 1
const copia = (f: Columna): Columna => (h) => ({ ...f(h) })
afirmar(enOrden(copia(columnaDelHundimiento)), 'se abre el hueco de la columna (su plataforma al ras), baja la columna entera y recién abajo del todo el piso se cierra encima; al volver, al revés', JSON.stringify(HUNDIMIENTO_EN_COLUMNAS))
controlPositivo('  el detector ve la columna que se hunde mientras el piso todavía se abre', ((h: number) => ({ abre: Math.min(1, h * 2), baja: h })) as Columna, enOrden)
controlPositivo('  y el piso que se cierra con la columna a medio bajar', ((h: number) => ({ abre: h < 0.25 ? h * 4 : Math.max(0, 1 - (h - 0.5) * 2), baja: Math.min(1, Math.max(0, (h - 0.25) * 2)) })) as Columna, enOrden)

/**
 * LA «PIEL» DE LOS INPUTS (`lote2/11`): lo más hondo de la cara del formulario (el fondo de sus pozos, sobre lo que el pozo de la placa
 * deja abajo) nunca pasa debajo del fondo del pozo de su hueco. `pieza(h)`: cuánto baja la pieza; `fondo(h)`: dónde está el fondo (u bajo el
 * piso). La cara del formulario asoma lo hondo de sus pozos (`pozo + 1` px) y la placa mide `formulario` px.
 */
const MPP = 0.018
const sinPiel = (pieza: (h: number) => number, fondo: (h: number) => number): boolean => {
  const fondoDeLosCampos = FLOOR_Y + (VOLUMEN_DEL_PIE.pozo + 1) * MPP - VOLUMEN_DEL_PIE.pozo * MPP
  return muestras(200).every((h) => fondoDeLosCampos - pieza(h) >= FLOOR_Y - fondo(h) - 1e-9)
}
const hondoDeLaDerecha = hondoDeLaColumna({ e: VOLUMEN_DEL_PIE.formulario, mpp: MPP })
const enColumnas = (h: number): number => hondoDeLaDerecha * columnaDelHundimiento(h).baja
afirmar(sinPiel(enColumnas, enColumnas), 'la placa del formulario baja SOBRE su plataforma: el fondo de sus campos nunca pasa debajo del fondo (sin la «piel» de los inputs)')
// Lo de antes: la placa bajaba su espesor y `hundeDeMas` con el fondo de su pozo quieto (su espesor y `hondoDeMas`).
const espesor = VOLUMEN_DEL_PIE.formulario * MPP
controlPositivo('  el detector ve el hundimiento de antes (la placa atravesaba el fondo quieto de su pozo)', (h: number) => (espesor + SALIDAS_DEL_PIE.hundeDeMas) * hundidaParaElViaje(h), (pieza) => sinPiel(pieza, () => espesor + HUECO_DEL_PIE.hondoDeMas))

/** Lo que asoma acostado: un texto apoyado (su espesor y `sube`) o el formulario con su tecla. Abajo del todo, todo debajo del piso. */
const todoAbajo = (hondo: (e: number, mpp: number) => number): boolean =>
  [0.012, 0.018, 0.026].every((mpp) => {
    const textoAsoma = 12 * mpp + TECHO_DE_LOS_TEXTOS.sube
    const formAsoma = (VOLUMEN_DEL_PIE.pozo + 1 + VOLUMEN_DEL_PIE.tecla) * mpp + 0.012
    // La derecha (el formulario) y la izquierda (placas y textos: su pieza más gruesa, una placa).
    return hondo(VOLUMEN_DEL_PIE.formulario, mpp) - Math.max(formAsoma, textoAsoma) >= 0.2 && hondo(VOLUMEN_DEL_PIE.placa, mpp) - textoAsoma >= 0.2
  })
afirmar(todoAbajo((e, mpp) => hondoDeLaColumna({ e, mpp })), 'la plataforma baja lo que asoma su pieza más alta (la tecla del formulario, un texto apoyado) y aire de más: el piso se cierra sobre todo, sin rozar nada')
controlPositivo('  el detector ve una plataforma que baja sólo el espesor (un texto apoyado quedaría asomando)', (e: number, mpp: number) => e * mpp, todoAbajo)

const caida = sinComentarios(leer('_lib/escena/pie3d/caida.ts'))
const huecos = sinComentarios(leer('_lib/escena/pie3d/huecosDeLaCaida.ts'))
/** La columna y su fondo bajan lo mismo (la plataforma): la pieza `hondoDeLaColumna · baja` y el hueco de la columna con ese mismo hondo. */
const juntos = (c: string, h: string): boolean =>
  c.includes('if (hundePorColumnas()) return hundirConSuColumna(grupo, col)') &&
  /const k = columnaDelHundimiento\(SALIDA_EN_VIVO\.delFaq\)\s*grupo\.position\.y -= hondoDeLaColumna\(col\) \* k\.baja/.test(h) &&
  h.includes('formas[k].set(enColumnas.abre, C.radio, hondoDeLaColumna(c.columnas[j]) * enColumnas.baja, 1)') &&
  // [L5] y ninguno con la columna ya hundida y su piso cerrado (se volvían a abrir sobre las piezas hundidas: lote2/15).
  h.includes('if (porColumnas && (enColumnas.abre > 0 ? adentroDeSuColumna(c, i, enColumnas.abre) : enColumnas.baja > 0)) continue')
afirmar(juntos(caida, huecos), 'en la escena, cada pieza de la columna y el fondo de su hueco bajan lo mismo; los huecos de las placas que ya quedaron adentro de la silueta abierta no se escriben (sus paredes no quedan paradas sobre la plataforma)')
controlPositivo('  el detector ve un fondo que no acompaña a la columna', huecos.replace('hondoDeLaColumna(c.columnas[j]) * enColumnas.baja', 'hondoDeLaColumna(c.columnas[j])'), (h) => juntos(caida, h))
controlPositivo('  y los huecos de las placas que siguen parados', huecos.replace('if (porColumnas && (enColumnas.abre > 0 ? adentroDeSuColumna(c, i, enColumnas.abre) : enColumnas.baja > 0)) continue', ''), (h) => juntos(caida, h))
controlPositivo('  [L5] y los que se volvían a abrir con la columna ya hundida (la condición de antes)', huecos.replace('if (porColumnas && (enColumnas.abre > 0 ? adentroDeSuColumna(c, i, enColumnas.abre) : enColumnas.baja > 0)) continue', 'if (porColumnas && enColumnas.abre > 0 && adentroDeSuColumna(c, i, enColumnas.abre)) continue'), (h) => juntos(caida, h))
const todasLasPiezas = (h: string): boolean => /for \(let i = 0; i < n; i \+= 1\) \{\s*const p = c\.piezas\[i\]\s*const h = huellaFinal\(c, i\)/.test(h) && !/if \(!p\.conSombra\) continue[\s\S]*H\[j\] = Math\.min/.test(h)
afirmar(todasLasPiezas(huecos), 'la base de cada columna es la huella de TODAS sus piezas (los textos también: la izquierda ya no se hunde atravesando el piso)')
controlPositivo('  el detector ve una base sólo de las placas (la izquierda, sin base)', huecos.replace('    const h = huellaFinal(c, i)', '    if (!p.conSombra) continue\n    const h = huellaFinal(c, i)'), todasLasPiezas)

/** Entrando: el FAQ abre su hueco recién con el pie abajo y el piso cerrado (nunca los dos huecos abiertos a la vez). */
const despuesDelPie = (n: (r: RelojDelFaq, t: number) => { readonly pie: number; readonly faq: number }): boolean => {
  const r: RelojDelFaq = { fase: 'entrando', desde: 0 }
  return muestras(400).every((u) => {
    const v = n(r, u * 2 * M)
    const col = columnaDelHundimiento(1 - v.pie)
    const [abre, baja] = [col.abre, col.baja]
    return subidaDelBloque(v.faq).abre <= 0 || (abre <= 0 && baja >= 1)
  })
}
afirmar(despuesDelPie(nivelesDelFaq), 'entrando, el piso se abre para el FAQ recién cuando las columnas están abajo y el piso cerrado sobre ellas (el pie sale entero antes)')
controlPositivo('  el detector ve el FAQ que se abre con el pie a medio guardar', (r: RelojDelFaq, t: number) => ({ pie: Math.max(0, 1 - t / M), faq: Math.min(1, Math.max(0, (t - 0.6 * M) / M)) }), despuesDelPie)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Los bloques del FAQ: placas como la del formulario, en el piso')

type Pose = (v: number, mpp: number) => ReturnType<typeof poseDelBloque>
/** El hueco abierto antes de que suba (mientras no está entero, la placa entera debajo del piso); el fondo siempre debajo; el texto al final. */
const subeBien = (p: Pose): boolean =>
  [0.012, 0.018, 0.026].every((mpp) =>
    muestras(400).every((v) => {
      const s = p(v, mpp)
      const fondo = FLOOR_Y - s.hondo
      const abajo = s.caraY - s.espesor
      return abajo - fondo >= HUECO_DEL_PIE.hondoDeMas - 1e-9 && (s.abre >= 0.999 || s.caraY < FLOOR_Y) && (s.texto <= 0 || s.sube >= 0.98)
    }) && p(1, mpp).caraY > FLOOR_Y && p(0, mpp).abre === 0,
  )
afirmar(subeBien(poseDelBloque), 'cada bloque: se abre su hueco con la placa abajo, sube sobre su plataforma (el fondo, siempre debajo) hasta asomar como el formulario, y su texto aparece al final', JSON.stringify(SUBIDA_DEL_BLOQUE))
controlPositivo('  el detector ve una placa que sube antes de que el piso se abra', (v: number, mpp: number) => ({ ...poseDelBloque(v, mpp), caraY: poseDelBloque(Math.min(1, v * 3), mpp).caraY }), subeBien)
controlPositivo('  y una placa que atraviesa el fondo de su pozo', (v: number, mpp: number) => ({ ...poseDelBloque(v, mpp), hondo: poseDelBloque(v, mpp).hondo - 0.2 }), subeBien)

/** La geometría: la del formulario (su espesor, con el bisel del canto) del tamaño de la caja del DOM. */
const comoElFormulario = (g: THREE.BufferGeometry, ancho: number, alto: number): boolean => {
  g.computeBoundingBox()
  const b = g.boundingBox ?? new THREE.Box3()
  const cerca = (x: number, y: number): boolean => Math.abs(x - y) < 0.05
  return cerca(b.min.x, 0) && cerca(b.max.x, ancho) && cerca(b.max.y, 0) && cerca(b.min.y, -alto) && cerca(b.min.z, -VOLUMEN_DEL_PIE.formulario) && cerca(b.max.z, 0) && BLOQUES_DE_VOLUMEN.espesor === VOLUMEN_DEL_PIE.formulario && g.getAttribute('color') !== undefined
}
afirmar(comoElFormulario(armarElBloque({ ancho: 480, alto: 420, radio: 0 }, BLOQUES_DE_VOLUMEN.espesor), 480, 420), 'la placa de cada bloque tiene el volumen del formulario del pie (su espesor y su canto con bisel, el negro de sus vértices) y el tamaño de su caja')
controlPositivo('  el detector ve un bloque plano (el vidrio de antes, sin volumen)', new THREE.BoxGeometry(480, 420, 1).translate(240, -210, -0.5), (g) => comoElFormulario(g, 480, 420))

const medidasBien = (f: (ancho: number, alto: number) => MedidasDelFaq): boolean => {
  const m = f(480, 450)
  const alto = (x: React.CSSProperties | undefined): number => Number(x?.minHeight ?? 0)
  return m.respuesta?.width === 480 && alto(m.respuesta) === 450 && m.preguntas?.width === 480 && alto(m.preguntas) >= 450 && alto(m.preguntas) !== Number(m.preguntas?.width) && Object.keys(f(0, 0)).length === 0
}
afirmar(medidasBien(medidasDelFaq), 'la derecha, del tamaño del formulario (crece si una respuesta no entra); la izquierda, de su ancho y [L5] por lo menos de su alto (era más alta: el espacio vacío abajo, lote2/17; no cuadrada)', `×${String(MEDIDAS_DEL_FAQ.masAlto)}`)
controlPositivo('  el detector ve la izquierda más baja que el formulario', (a: number, h: number) => ({ respuesta: { width: a, minHeight: h }, preguntas: { width: a, minHeight: h - 40 } }), medidasBien)
controlPositivo('  el detector ve la izquierda cuadrada', (a: number, h: number) => ({ respuesta: { width: a, minHeight: h }, preguntas: { width: a, minHeight: a } }), medidasBien)

const enVolumen = renderToStaticMarkup(<FaqEnEscenario preguntas={PREGUNTAS_DEL_HOME} pie="#cierre" volumen activo={false} />)
const enVidrio = renderToStaticMarkup(<FaqEnEscenario preguntas={PREGUNTAS_DEL_HOME} pie="#cierre" volumen={false} activo={false} />)
const veces = (h: string, s: string): number => h.split(s).length - 1
const deVolumenBien = (h: string): boolean =>
  veces(h, 'data-bloque-del-faq="preguntas"') === 1 && veces(h, 'data-bloque-del-faq="respuesta"') === 1 && veces(h, 'data-bloque-del-faq="whatsapp"') === 1 && !h.includes('data-material="vidrio"') && veces(h, 'data-seccion="invertida"') >= 4 && PREGUNTAS_DEL_HOME.every((p) => h.includes(p.respuesta))
afirmar(deVolumenBien(enVolumen), 'con el pie de volumen los tres bloques son placas (su DOM sobre la cara, en la tinta clara) y no vidrio; el texto entero sigue en el HTML')
controlPositivo('  el detector ve los bloques de vidrio (los planos de antes)', enVidrio, deVolumenBien)
afirmar(veces(enVidrio, 'data-material="vidrio"') === 3 && !enVidrio.includes(TEXTO_DEL_BOTON_DEL_FAQ), '  con el pie plano (una página) siguen los de vidrio, sin botón')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El botón del FAQ: después de todo, una vez por carga, y tocarlo es el gesto')

/** Dónde termina el elemento que empieza en `desde` (cuenta los `div` que abren y cierran). */
function finDelDiv(h: string, desde: number): number {
  const etiquetas = /<div[\s>]|<\/div>/g
  etiquetas.lastIndex = desde
  let nivel = 0
  for (let m = etiquetas.exec(h); m !== null; m = etiquetas.exec(h)) {
    nivel += m[0] === '</div>' ? -1 : 1
    if (nivel === 0) return m.index
  }
  return -1
}
const botonFuera = (h: string): boolean => {
  const raiz = h.indexOf('<div data-faq-del-pie="escenario"')
  const fin = raiz < 0 ? -1 : finDelDiv(h, raiz)
  return fin > raiz && h.indexOf(TEXTO_DEL_BOTON_DEL_FAQ) > fin && /data-bloque-del-faq="boton"[^>]*inert=""/.test(h) && /<button type="button" data-pieza="aviso-de-scroll"/.test(h)
}
afirmar(botonFuera(enVolumen), 'el botón (con la presentación de `AvisoDeScroll`, tocable) va fuera de la raíz del FAQ (enfocarlo no lo trae) y nace inerte (la escena lo enciende con su placa arriba)', TEXTO_DEL_BOTON_DEL_FAQ)
controlPositivo('  el detector ve un aviso decorativo (no se puede tocar)', enVolumen.replace('<button type="button" data-pieza="aviso-de-scroll"', '<div aria-hidden="true" data-pieza="aviso-de-scroll"'), botonFuera)

interface Paso { readonly acostado: boolean; readonly fase: FaseDelFaq; readonly pie: number }
type PasoDelBoton = typeof pasoDelBoton
/** Una carga: el pie llega y se acuesta; el botón sale después; se va al FAQ (se hunde con el pie); se vuelve: no sale más. Y en otra carga, sí. */
function carga(paso: PasoDelBoton): { readonly antes: number; readonly despues: number; readonly enElFaq: number; readonly alVolver: number; readonly otraCarga: number } {
  rearmarElBotonDelFaq()
  const b = BOTON_EN_VIVO
  let t = 0
  const correr = (s: number, p: Paso): number => {
    let v = 0
    for (let k = 0; k < s * 60; k += 1) {
      t += 1000 / 60
      v = paso(b, { ahora: t, dt: 1 / 60, acostado: p.acostado, presente: true, fase: p.fase, pie: p.pie, quieto: false })
    }
    return v
  }
  correr(1, { acostado: false, fase: 'fuera', pie: 1 })
  const antes = correr(BOTON_DEL_FAQ.esperaS * 0.9, { acostado: true, fase: 'fuera', pie: 1 })
  const despues = correr(BOTON_DEL_FAQ.esperaS + BOTON_DEL_FAQ.subeS + 0.2, { acostado: true, fase: 'fuera', pie: 1 })
  const enElFaq = correr(0.5, { acostado: true, fase: 'adentro', pie: 0 })
  const alVolver = correr(3, { acostado: true, fase: 'fuera', pie: 1 })
  rearmarElBotonDelFaq()
  const otraCarga = correr(BOTON_DEL_FAQ.esperaS + BOTON_DEL_FAQ.subeS + 0.2, { acostado: true, fase: 'fuera', pie: 1 })
  return { antes, despues, enElFaq, alVolver, otraCarga }
}
const unaVez = (paso: PasoDelBoton): boolean => {
  const c = carga(paso)
  return c.antes === 0 && c.despues === 1 && c.enElFaq === 0 && c.alVolver === 0 && c.otraCarga === 1
}
afirmar(unaVez(pasoDelBoton), 'sale recién con el pie acostado entero (y su espera), se hunde con el pie al ir al FAQ y no vuelve en esa carga; en otra carga (o entrando de nuevo), sí', JSON.stringify(BOTON_DEL_FAQ))
controlPositivo('  el detector ve un botón que vuelve cada vez que se vuelve al pie', ((b: typeof BOTON_EN_VIVO, e: Parameters<PasoDelBoton>[1]) => pasoDelBoton(b, { ...e, fase: 'fuera' }) * e.pie) as PasoDelBoton, unaVez)
controlPositivo('  y uno que sale antes de que el pie termine de acostarse', ((b: typeof BOTON_EN_VIVO, e: Parameters<PasoDelBoton>[1]) => {
  pasoDelBoton(b, e)
  return b.usado ? 0 : 1
}) as PasoDelBoton, unaVez)
rearmarElBotonDelFaq()

/** Tocarlo hace lo mismo que el gesto: desde fuera y con el pie entero entra (lo que el gatillo decide `entra` con un gesto nuevo). */
const comoElGesto = (tocar: (puede: boolean, ahora: number) => boolean): boolean =>
  [true, false].every((puede) => {
    soltarElFaq()
    const gesto = decidirElGestoDelFaq('fuera', { sentido: 1, nuevo: true, origen: 'rueda', puedeEntrar: puede, focoAdentro: false }, false)
    const entro = tocar(puede, 1000)
    const fase = faseEn(FAQ_EN_VIVO, 1001)
    soltarElFaq()
    return entro === (gesto === 'entra') && (fase === 'entrando') === (gesto === 'entra')
  })
afirmar(comoElGesto(entrarSinGesto), 'tocar el botón es el gesto: desde fuera y con el pie entero entra el FAQ (y sin el pie entero, nada)')
controlPositivo('  el detector ve un botón que entra con el pie a medio llegar', (_puede: boolean, ahora: number) => entrarSinGesto(true, ahora), comoElGesto)
const escenario = sinComentarios(leer('_componentes/faq/FaqEnEscenario.tsx'))
const gatillo = sinComentarios(leer('_componentes/faq/useGatilloDelFaq.ts'))
const cableado = (e: string, g: string): boolean => e.includes('if (pedirElFaqSinGesto(true)) botones.current[0]?.focus({ preventScroll: true })') && e.includes('{volumen && <BotonDelFaq alTocar={tocarElBoton} />}') && /const puedeEntrar = \(\): boolean => puedeEntrarElFaq\(deVolumen\.current\)/.test(g) && g.includes('return entrarSinGesto(puedeEntrarElFaq(volumen), performance.now())')
afirmar(cableado(escenario, gatillo), '  y en el código: el botón pide la entrada con la MISMA condición que el gesto (`puedeEntrarElFaq`) y el foco pasa a la primera pregunta')
controlPositivo('  el detector ve un botón con su propia condición', gatillo.replace('return entrarSinGesto(puedeEntrarElFaq(volumen), performance.now())', 'return entrarSinGesto(true, performance.now())'), (g) => cableado(escenario, g))
soltarElFaq()
Object.assign(FAQ_EN_VIVO, relojDelFaqQuieto())

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El bug del pie (`lote2/19`): el form desaparecía al volver al pie')

interface Contexto {
  readonly vigilar: (l: EventTarget) => void
  readonly perdido: () => boolean
}
/** La escena se rehace: el lienzo viejo se descarta y r3f le fuerza la pérdida DESPUÉS de que el nuevo está vigilado. El nuevo no queda perdido. */
const sinVeneno = (c: Contexto): boolean => {
  const viejo = new EventTarget()
  c.vigilar(viejo)
  const nuevo = new EventTarget()
  c.vigilar(nuevo)
  viejo.dispatchEvent(new Event('webglcontextlost'))
  const tras = c.perdido()
  nuevo.dispatchEvent(new Event('webglcontextlost'))
  const alPerderElNuevo = c.perdido()
  nuevo.dispatchEvent(new Event('webglcontextrestored'))
  return !tras && alPerderElNuevo && !c.perdido()
}
afirmar(sinVeneno({ vigilar: vigilarElContexto, perdido: contextoPerdido }), 'un lienzo descartado que pierde su contexto (r3f lo fuerza medio segundo después de soltarlo) no deja al lienzo nuevo «perdido»: el pie de volumen se vuelve a armar (el form vuelve)')
// Lo de antes: lo perdido era uno para toda la página.
function contextoGlobal(): Contexto {
  let perdido = false
  return {
    vigilar: (l) => {
      l.addEventListener('webglcontextlost', () => {
        perdido = true
      })
      l.addEventListener('webglcontextrestored', () => {
        perdido = false
      })
    },
    perdido: () => perdido,
  }
}
controlPositivo('  el detector ve lo perdido de antes (uno para toda la página: el bug de `lote2/19`)', contextoGlobal(), sinVeneno)

const pie = sinComentarios(leer('_lib/escena/pie3d/PieDeVolumen.tsx'))
const noSeCuelga = (f: string): boolean => /try \{\s*compilado = compilarConCuidado\(gl, escena, camara\)\s*\} catch \{/.test(f) && /\(\) => \{\s*s\.compilando = false\s*if \(vivo\) pedir\(\)\s*\}/.test(f) && /try \{\s*calentar\(gl, escena, camara\)\s*\} catch \{/.test(f)
afirmar(noSeCuelga(pie), 'la compilación del pie que tira o falla suelta `compilando` y vuelve a pedir el armado (un `compilando` colgado dejaba el pie sin armar para siempre)')
controlPositivo('  el detector ve la compilación de antes (sin salida si falla)', pie.replace(/\(\) => \{\s*s\.compilando = false\s*if \(vivo\) pedir\(\)\s*\}/, '() => undefined'), noSeCuelga)

cerrar('s78-c2-71')
