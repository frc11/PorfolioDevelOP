/**
 * [M1] NOSOTROS, PORTFOLIO, EL ANCHO Y LA INTRO DE DÍA — lo que M1 cambió, sin navegador (las fotos y el banco de las tapas están en
 * `M1-resultado.md`). Cada afirmación lleva su control.
 *
 *   1 · la intro de día: el título y el giro del home hacia Quiénes somos; la de noche no cambia
 *   3 · la historia: sube entera y se pintan sólo tres frases
 *   4 · cómo trabajamos: la línea que baja con el scroll
 *   2 · el equipo: la segunda toma por scroll abajo de 1024 y la facultad a su tamaño
 *   5 · los casos: lados alternados, texto escrito (150–250 palabras, sin corchetes), en papel, el color de la marca en AA
 *   6 · las demos: ninguna tapa atraviesa a otra, en ningún cuadro
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { IntroDeLaPagina } from '../../_componentes/pagina/IntroDeLaPagina'
import { SELECTOR_DE_LA_INTRO } from '../../_componentes/pagina/atributoDeLaIntro'
import { CHOREO_KEYFRAMES } from '../escena/choreography'
import { buildTrack, sampleTrack } from '../escena/choreographySampler'
import type { ChoreoKeyframe, MutableChoreoPose } from '../escena/choreographyTypes'
import { encuadreDelGiro } from '../escena/ruta/composicionEnLaEscena'
import {
  COMPOSICION_INICIAL,
  GIRO_EN_PANTALLAS,
  PANTALLAS_DE_LA_INTRO,
  PANTALLAS_DE_LA_INTRO_DE_DIA,
  PISTA_DE_LA_INTRO,
  PISTA_DE_LA_INTRO_DE_DIA,
  TRAMO_DEL_TITULO,
  avanceDeLaIntro,
  avanceDelGiro,
  INTRO_LARGA_MONTADA,
  esIntroDeDia,
  pantallasDeLaIntro,
  tieneIntroLarga,
} from '../escena/ruta/pistaDeLaIntro'
import type { PresetDeLaEscena } from '../escena/ruta/preset'
import { HISTORIA } from '../../nosotros/contenido'
import { FACULTAD, PROCESO } from '../../nosotros/contenido'
import { avanceDeLaLinea } from '../../nosotros/ComoTrabajamos'
import { ladoDelMedio } from '../../portfolio/CasoDelPortfolio'
import { DEMOS, MARCA_SOBRE_EL_PAPEL, RELATOS } from '../../portfolio/contenido'
import {
  ALTO_EN_ANCHOS,
  ALZA,
  APERTURA,
  ESTANTE_EN_REPOSO,
  MS,
  PISADA,
  POSE_DE_LAS_TAPAS,
  corrimiento,
  demoraDelAlza,
  demoraDelCorrimiento,
  elegirLaTapa,
  papelDeLaTapa,
  soltarLaTapa,
  type EstadoDelEstante,
  type PapelDeLaTapa,
} from '../../portfolio/estante'
import { PROYECTOS } from '../../_secciones/trabajos/proyectos'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const RAIZ = process.cwd()
const V3 = path.join(RAIZ, 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · [M1] La intro de día: el título y el giro del home hacia Quiénes somos')

const DIA: PresetDeLaEscena = { id: 'nosotros', tramos: { intro: SELECTOR_DE_LA_INTRO, pie: null }, pista: PISTA_DE_LA_INTRO, noche: 'dia', acento: null, variante: null }
const NOCHE: PresetDeLaEscena = { ...DIA, id: 'base', noche: 'noche' }
const SIN_PISTA: PresetDeLaEscena = { ...DIA, pista: null }

type Larga = typeof tieneIntroLarga
const largaBien = (f: Larga): boolean => f(DIA, true) && !f(DIA, false) && !f(NOCHE, true) && !f(SIN_PISTA, true) && !f(null, true)
afirmar(largaBien(tieneIntroLarga), 'la intro larga es la de una página de día con pista Y con su bloque (Nosotros, Portfolio, el índice del blog); una nota sin bloque, las de noche (servicios) y las sin pista quedan con la corta')
controlPositivo('  el detector ve una que la monta sin bloque (dos pantallas vacías en una nota)', ((p) => p !== null && p.pista !== null && p.noche === 'dia') as Larga, largaBien)

// La escena la toma recién con el marco del giro montado (lo cuenta el marco: con la navegación cliente puede haber dos un instante).
type EsDeDia = typeof esIntroDeDia
const escenaBien = (f: EsDeDia): boolean => {
  INTRO_LARGA_MONTADA.montados = 0
  const sinMarco = !f(DIA)
  INTRO_LARGA_MONTADA.montados = 1
  const conMarco = f(DIA) && !f(NOCHE) && !f(SIN_PISTA) && !f(null)
  INTRO_LARGA_MONTADA.montados = 0
  return sinMarco && conMarco
}
afirmar(escenaBien(esIntroDeDia), 'la escena toma la pista larga sólo de día y con el marco del giro montado')
controlPositivo('  el detector ve una escena que la toma sin el marco', ((p) => p !== null && p.pista !== null && p.noche === 'dia') as EsDeDia, escenaBien)
INTRO_LARGA_MONTADA.montados = 1

const largosBien = (f: typeof pantallasDeLaIntro): boolean => f(DIA) === TRAMO_DEL_TITULO + 2 && f(NOCHE) === PANTALLAS_DE_LA_INTRO && PANTALLAS_DE_LA_INTRO === 1.8
afirmar(largosBien(pantallasDeLaIntro) && PANTALLAS_DE_LA_INTRO_DE_DIA === 3.4, `la de día mide ${String(PANTALLAS_DE_LA_INTRO_DE_DIA)} pantallas (el título, ${String(TRAMO_DEL_TITULO)}, y dos del giro: el hero y Quiénes somos del home); la de noche sigue en 1,8`)
controlPositivo('  el detector ve la de día con el largo de la de noche', (() => PANTALLAS_DE_LA_INTRO) as typeof pantallasDeLaIntro, largosBien)

const avanceBien = (f: typeof avanceDeLaIntro): boolean => {
  const alto = 900
  return Math.abs(f(0, PANTALLAS_DE_LA_INTRO_DE_DIA * alto, alto, PANTALLAS_DE_LA_INTRO_DE_DIA) - 1) < 1e-9 && Math.abs(f(0, 1.7 * alto, alto, PANTALLAS_DE_LA_INTRO_DE_DIA) - 0.5) < 1e-9 && Math.abs(f(0, 1.8 * alto, alto) - 1) < 1e-9
}
afirmar(avanceBien(avanceDeLaIntro), 'el avance de la cámara llega a 1 al final de la intro de día (no a las 1,8 pantallas) y la de noche no cambia')
controlPositivo('  el detector ve el avance que siempre divide por 1,8', ((a: number, y: number, alto: number) => Math.min(1, Math.max(0, (y - a) / (PANTALLAS_DE_LA_INTRO * alto)))) as typeof avanceDeLaIntro, avanceBien)

const deLaAtadura = readFileSync(path.join(V3, '_lib/escena/ataduraAlScroll.ts'), 'utf8')
const ataduraBien = (s: string): boolean => s.includes('avanceDeLaIntro(intro.getBoundingClientRect().top + desplazamiento, desplazamiento, ventana, pantallasDeLaIntro(preset))')
afirmar(ataduraBien(deLaAtadura), 'la lectura del scroll pasa el largo de la intro de la página')
controlPositivo('  el detector ve la lectura sin el largo', deLaAtadura.replace(', pantallasDeLaIntro(preset))', ')'), ataduraBien)

const QS = CHOREO_KEYFRAMES.find((k) => k.name === 'quiénes somos')
const pose = (): MutableChoreoPose => ({ angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 })
const pistaBien = (pista: readonly ChoreoKeyframe[]): boolean => {
  if (QS === undefined) return false
  const track = buildTrack(pista)
  const en = (a: number): MutableChoreoPose => {
    const p = pose()
    sampleTrack(track, a, p)
    return p
  }
  const desde = GIRO_EN_PANTALLAS.desde / PANTALLAS_DE_LA_INTRO_DE_DIA
  const hasta = GIRO_EN_PANTALLAS.hasta / PANTALLAS_DE_LA_INTRO_DE_DIA
  const igual = (p: MutableChoreoPose, angulo: number, altura: number, distancia: number): boolean => Math.abs(p.angleDeg - angulo) < 1e-6 && Math.abs(p.height - altura) < 1e-6 && Math.abs(p.distance - distancia) < 1e-6
  const quieta = igual(en(0), COMPOSICION_INICIAL.angleDeg, COMPOSICION_INICIAL.height, COMPOSICION_INICIAL.distance) && igual(en(desde * 0.9), COMPOSICION_INICIAL.angleDeg, COMPOSICION_INICIAL.height, COMPOSICION_INICIAL.distance)
  const llega = igual(en(hasta), QS.pose.angleDeg, QS.pose.height, QS.pose.distance) && igual(en(1), QS.pose.angleDeg, QS.pose.height, QS.pose.distance)
  const gira = en((desde + hasta) / 2).angleDeg > 20 && en((desde + hasta) / 2).angleDeg < 110
  return quieta && llega && gira && pista[pista.length - 2]?.turn === 'literal'
}
afirmar(pistaBien(PISTA_DE_LA_INTRO_DE_DIA), 'la pista de día: quieta en la composición inicial mientras cae el título, el giro del home hasta la pose de Quiénes somos (130°, −3,6, 14, vuelta literal) y quieta ahí hasta el papel')
controlPositivo('  el detector ve la pista de noche (girar 38°)', PISTA_DE_LA_INTRO, pistaBien)
afirmar(GIRO_EN_PANTALLAS.desde > 0.2 && GIRO_EN_PANTALLAS.hasta === PANTALLAS_DE_LA_INTRO_DE_DIA - 1, 'el giro arranca con el título ya caído (0,2) y termina cuando el bloque fijo se suelta (una pantalla antes del final)')

type Giro = typeof avanceDelGiro
const giroBien = (f: Giro): boolean => f(0) === 0 && f(GIRO_EN_PANTALLAS.desde / PANTALLAS_DE_LA_INTRO_DE_DIA) === 0 && f(GIRO_EN_PANTALLAS.hasta / PANTALLAS_DE_LA_INTRO_DE_DIA) === 1 && f(1) === 1 && f(0.4) > 0 && f(0.4) < 1
afirmar(giroBien(avanceDelGiro), 'el peso del giro: 0 antes, 1 después, entre medio en el giro')
controlPositivo('  el detector ve un peso que es el avance entero', ((a: number) => a) as Giro, giroBien)
const T = { frameX: 0.5, frameY: 0.1 }
const G = { frameX: -0.8, frameY: -0.3 }
type Encuadre = typeof encuadreDelGiro
const encuadreBien = (f: Encuadre): boolean => {
  const a = f(T, G, 0)
  const b = f(T, G, 1)
  const m = f(T, G, 0.5)
  const cerca = (x: number, y: number): boolean => Math.abs(x - y) < 1e-9
  return cerca(a.frameX, T.frameX) && cerca(b.frameX, G.frameX) && cerca(m.frameX, (T.frameX + G.frameX) / 2) && cerca(f(T, G, 2).frameY, G.frameY) && cerca(f(T, G, -1).frameY, T.frameY)
}
afirmar(encuadreBien(encuadreDelGiro), 'el logo pasa del hueco del título al del giro (del lado contrario al bloque), sin salto en las puntas')
controlPositivo('  el detector ve un encuadre que salta al del giro', ((a, b, p) => (p > 0 ? b : a)) as Encuadre, encuadreBien)

const htmlDia = renderToStaticMarkup(<IntroDeLaPagina titulo="Nosotros" bajada={<p>La bajada.</p>} deQueSeTrata={<p>El bloque.</p>} preset={DIA} />)
const htmlNoche = renderToStaticMarkup(<IntroDeLaPagina titulo="Una página" bajada={<p>La bajada.</p>} deQueSeTrata={<p>El bloque.</p>} preset={NOCHE} />)
const marcadoBien = (dia: string, noche: string): boolean =>
  dia.includes(`--pantallas-de-la-intro:${String(PANTALLAS_DE_LA_INTRO_DE_DIA)}`) && dia.includes('data-parte="marco-del-giro"') && dia.indexOf('data-parte="hueco-del-giro"') < dia.indexOf('El bloque.') && dia.includes('sticky top-0') &&
  noche.includes(`--pantallas-de-la-intro:${String(PANTALLAS_DE_LA_INTRO)}`) && !noche.includes('marco-del-giro')
afirmar(marcadoBien(htmlDia, htmlNoche), 'de día, el bloque de la página va en el marco del giro (fijo, una pantalla, con su hueco del logo); de noche, la fila corta de siempre')
controlPositivo('  el detector ve la intro de día con la fila corta', htmlNoche.replace('1.8', String(PANTALLAS_DE_LA_INTRO_DE_DIA)), (d: string) => marcadoBien(d, htmlNoche))
const htmlNota = renderToStaticMarkup(<IntroDeLaPagina titulo="Blog" bajada={<p>La bajada.</p>} preset={DIA} />)
const notaBien = (h: string): boolean => h.includes(`--pantallas-de-la-intro:${String(PANTALLAS_DE_LA_INTRO)}`) && !h.includes('marco-del-giro')
afirmar(notaBien(htmlNota), 'de día sin bloque (una nota del blog), la intro corta: sin dos pantallas de giro vacías')
controlPositivo('  el detector ve la nota con el giro vacío', htmlDia, notaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · [M1] La historia: sube entera y se pintan sólo tres frases')

const FRASES = ['calidad excepcional.', 'Esto no es un proyecto aislado:', 'No tenemos límites.']
const destacadas = (h: typeof HISTORIA): readonly string[] => h.parrafos.flat().filter((t) => t.destacado === true).map((t) => t.texto)
const frasesBien = (h: typeof HISTORIA): boolean => {
  const d = destacadas(h)
  return d.length === 3 && FRASES.every((f) => d.includes(f)) && h.parrafos.length >= 3 && h.parrafos.length <= 4
}
afirmar(frasesBien(HISTORIA), 'exactamente las tres frases importantes del prototipo se pintan; la historia son 3 o 4 párrafos')
controlPositivo('  el detector ve el pintado de todo el texto', { ...HISTORIA, parrafos: HISTORIA.parrafos.map((p) => p.map((t) => ({ ...t, destacado: true }))) }, frasesBien)
const historia = leer('nosotros/Historia.tsx')
const subeBien = (s: string): boolean => s.includes('<Gatillo key={parrafo[0]?.texto} desde="abajo">') && s.includes("tramo.destacado === true ? <FraseQueSePinta") && (s.match(/usePintadoDelBloque/g) ?? []).length === 0
afirmar(subeBien(historia), 'cada párrafo entra con la subida desde abajo del sitio y sólo los tramos destacados llevan el pintado')
controlPositivo('  el detector ve los párrafos sin el gatillo', historia.replace('desde="abajo">', '>'), subeBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · [M1] Cómo trabajamos: la línea baja con el scroll')

type Linea = typeof avanceDeLaLinea
const lineaBien = (f: Linea): boolean => f(900, 2000, 900) === 0 && f(540 - 2000, 2000, 900) === 1 && f(540 - 1000, 2000, 900) === 0.5 && f(-5000, 2000, 900) === 1
afirmar(lineaBien(avanceDeLaLinea) && PROCESO.pasos.length === 5, 'la línea: nada con su tope abajo de la línea de lectura, entera cuando su pie la pasa, proporcional entre medio; los cinco pasos del prototipo')
controlPositivo('  el detector ve una línea que no se acota', ((t: number, l: number, a: number) => (a * 0.6 - t) / l) as Linea, lineaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · [M1] El equipo: la segunda toma por scroll en el teléfono y la facultad a su tamaño')

const equipo = leer('nosotros/Equipo.tsx')
// La clase del tope de la foto, partida (Tailwind lee este archivo: entera, la emitiría).
const TOPE_DE_LA_FOTO = ['max-w-', '[500', 'px]'].join('')
const equipoBien = (s: string): boolean => s.includes('porScroll={!escritorio}') && s.includes("querySelector<HTMLButtonElement>('[data-toque=\"marco\"]')") && s.includes('useAlCruzar(caja, alCambiar, porScroll)') && s.includes(TOPE_DE_LA_FOTO)
afirmar(equipoBien(equipo) && FACULTAD.ancho === 500 && FACULTAD.leyenda === 'FACET · Universidad Nacional de Tucumán' && existsSync(path.join(RAIZ, 'public/v3/nosotros/facultad.webp')), 'abajo de 1024 la foto aprieta el botón del marco al cruzar la mitad (y al volver); la facultad, en webp, a 500 px como mucho, con su leyenda')
controlPositivo('  el detector ve la foto estirada a todo el ancho', equipo.replace(TOPE_DE_LA_FOTO, 'max-w-none'), equipoBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · [M1] Los casos: alternados, escritos y en papel')

type Lado = typeof ladoDelMedio
const ladosBien = (f: Lado): boolean => f(0) === 'izquierda' && f(1) === 'derecha' && f(2) === 'izquierda'
afirmar(ladosBien(ladoDelMedio), 'el primero con la foto a la izquierda, el segundo a la derecha, el tercero a la izquierda')
controlPositivo('  el detector ve todos del mismo lado', (() => 'izquierda') as Lado, ladosBien)

const palabras = (r: { readonly parrafos: readonly string[] }): number => r.parrafos.join(' ').split(/\s+/).filter(Boolean).length
type Relatos = typeof RELATOS
const relatosBien = (r: Relatos): boolean => PROYECTOS.every((p) => {
  const relato = r[p.slug]
  const n = palabras(relato)
  const textos = [relato.titulo, ...relato.parrafos]
  return relato.titulo.length > 0 && relato.titulo !== p.nombre && n >= 150 && n <= 250 && textos.every((t) => !t.includes('[')) && !/\d+\s?%/.test(relato.parrafos.join(' '))
})
afirmar(relatosBien(RELATOS), `cada caso tiene su título y un texto de 150 a 250 palabras (${PROYECTOS.map((p) => `${p.nombre} ${String(palabras(RELATOS[p.slug]))}`).join(', ')}), sin corchetes ni porcentajes`)
controlPositivo('  el detector ve un texto corto', { ...RELATOS, 'el-garage': { titulo: 'Un título', parrafos: ['Un catálogo de muchos filtros.'] } }, relatosBien)
controlPositivo('  el detector ve un marcador', { ...RELATOS, 'banu-scents': { ...RELATOS['banu-scents'], parrafos: [...RELATOS['banu-scents'].parrafos, '[TEXTO]'] } }, relatosBien)

const caso = leer('portfolio/CasoDelPortfolio.tsx')
const papelBien = (s: string): boolean => !s.includes("'invertida'") && !s.includes('"invertida"') && !s.includes('<Ficha') && s.includes('escritorio:sticky') && s.includes('enLaSecuencia(visible, 0, reducido)')
afirmar(papelBien(caso), 'el caso va en el papel (sin la franja de noche), sin la ficha del home, con el medio y el texto clavados y el ritmo de la ficha')
controlPositivo('  el detector ve la franja de noche', `${caso}\nconst x = { 'data-seccion': 'invertida' }`, papelBien)

const luminancia = (hex: string): number => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * (c[0] ?? 0) + 0.7152 * (c[1] ?? 0) + 0.0722 * (c[2] ?? 0)
}
const contraste = (a: string, b: string): number => {
  const [x, y] = [luminancia(a), luminancia(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
const PAPEL = '#F7F7F5'
type Marcas = typeof MARCA_SOBRE_EL_PAPEL
const marcasBien = (m: Marcas): boolean => Object.values(m).every((c) => (c === null || contraste(c, PAPEL) >= 4.5))
afirmar(marcasBien(MARCA_SOBRE_EL_PAPEL), `«Visitar sitio» en el color de cada marca pasado a AA sobre el papel (${Object.entries(MARCA_SOBRE_EL_PAPEL).map(([k, c]) => `${k} ${c === null ? 'la tinta' : contraste(c, PAPEL).toFixed(2)}`).join(', ')})`)
controlPositivo('  el detector ve el naranja de la noche sobre el papel', { ...MARCA_SOBRE_EL_PAPEL, 'el-garage': '#FA9408' }, marcasBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · [M1] Las demos: un texto, y ninguna tapa atraviesa a otra en ningún cuadro')

const demos = leer('portfolio/DemosEnConjunto.tsx')
afirmar(typeof DEMOS.texto === 'string' && !('pasos' in DEMOS) && !demos.includes('COMO_FUNCIONAN') && !demos.includes('<ol'), 'los tres pasos numerados se fueron: un solo texto corrido')
const ventanaBien = (s: string): boolean => s.includes("import { VentanaDeDemo } from '../_secciones/trabajos/demos/VentanaDeDemo'") && s.includes('if (!escritorio ||') && s.includes('data-parte="cara"') && !/z-\d|zIndex|z-\[/.test(s)
afirmar(ventanaBien(demos), 'desde 1024 un clic abre la ventana del home (el Genie) en la página; el apilado de las tapas nunca se toca (sin z-index)')
controlPositivo('  el detector ve la tapa que salta adelante (el prototipo)', demos.replace('className="relative w-', 'className="relative hover:z-10 w-'), ventanaBien)

/** Un punto en anchos de tapa, con y hacia abajo. */
type Punto = readonly [number, number]
const RAD = Math.PI / 180

/** Las cuatro esquinas de la tapa `i` con su corrimiento (`c`, anchos) y su alza (0 en reposo, 1 levantada y derecha). */
function esquinas(i: number, c: number, alza: number): readonly Punto[] {
  const poseDeReposo = POSE_DE_LAS_TAPAS[i % POSE_DE_LAS_TAPAS.length]
  const giro = poseDeReposo.giro * (1 - alza) * RAD
  const dy = (poseDeReposo.baja / 100) * ALTO_EN_ANCHOS * (1 - alza) - ALZA * alza
  const x0 = i * (1 - PISADA) + 0.5 + c
  return ([[-0.5, 0], [0.5, 0], [0.5, -ALTO_EN_ANCHOS], [-0.5, -ALTO_EN_ANCHOS]] as const).map(([x, y]) => [x0 + x * Math.cos(giro) - y * Math.sin(giro), dy + x * Math.sin(giro) + y * Math.cos(giro)] as const)
}

/** Si dos cuadriláteros convexos se pisan (ejes separadores), con una tolerancia de una milésima de ancho. */
function sePisan(a: readonly Punto[], b: readonly Punto[]): boolean {
  for (const poligono of [a, b]) {
    for (let k = 0; k < poligono.length; k += 1) {
      const p = poligono[k]
      const q = poligono[(k + 1) % poligono.length]
      if (p === undefined || q === undefined) continue
      const eje: Punto = [q[1] - p[1], p[0] - q[0]]
      const proy = (pts: readonly Punto[]): readonly [number, number] => {
        const v = pts.map((t) => t[0] * eje[0] + t[1] * eje[1])
        return [Math.min(...v), Math.max(...v)]
      }
      const [amin, amax] = proy(a)
      const [bmin, bmax] = proy(b)
      if (amax <= bmin + 1e-3 || bmax <= amin + 1e-3) return false
    }
  }
  return true
}

/**
 * El recorrido en el tiempo de una secuencia de tapas bajo el mouse (`null`: ninguna), cada una sostenida `ms`, con el estado del estante de
 * la página (`elegirLaTapa`/`soltarLaTapa`: al pasar de una a otra, primero sale de la anterior y en el mismo instante entra a la nueva):
 * cada cuadro de 4 ms, el corrimiento y el alza de cada tapa siguiendo sus transiciones (`estante.ts`, lineales: lo que importa es cuándo
 * arranca cada una; una transición nueva arranca desde donde estaba). `alzaSinEspera`: el control, la elegida se levanta sin esperar.
 * Devuelve el primer cuadro en que una tapa que está ADELANTE de otra que no está en reposo (levantada, subiendo o bajando) la pisa, o `null`.
 */
function primerCruce(secuencia: readonly (number | null)[], ms: number, apertura: number, alzaSinEspera: boolean): string | null {
  const n = POSE_DE_LAS_TAPAS.length
  const c = Array.from({ length: n }, () => 0)
  const alza = Array.from({ length: n }, () => 0)
  const anim = Array.from({ length: n }, () => ({ c: { de: 0, a: 0, t0: 0, dur: 1 }, alza: { de: 0, a: 0, t0: 0, dur: 1 } }))
  let estado: EstadoDelEstante = ESTANTE_EN_REPOSO
  let t = 0
  for (const bajoElMouse of secuencia) {
    if (estado.activa !== null) estado = soltarLaTapa(estado, estado.activa, t)
    if (bajoElMouse !== null) estado = elegirLaTapa(estado, bajoElMouse, t)
    const e = estado
    const papeles: PapelDeLaTapa[] = Array.from({ length: n }, (_, i) => papelDeLaTapa(i, e.activa, e.ultima))
    papeles.forEach((papel, i) => {
      const a = anim[i]
      if (a === undefined) return
      const destinoC = (corrimiento(papel) / APERTURA) * apertura
      const destinoAlza = papel === 'elegida' ? 1 : 0
      if (destinoC !== a.c.a) a.c = { de: c[i] ?? 0, a: destinoC, t0: t + demoraDelCorrimiento(papel, e), dur: MS.correrse }
      if (destinoAlza !== a.alza.a) a.alza = { de: alza[i] ?? 0, a: destinoAlza, t0: t + (alzaSinEspera ? 0 : demoraDelAlza(papel, e)), dur: papel === 'elegida' ? MS.levantarse : MS.bajar }
    })
    const fin = t + ms
    for (; t <= fin; t += 4) {
      for (let i = 0; i < n; i += 1) {
        const a = anim[i]
        if (a === undefined) continue
        const u = (x: { de: number; a: number; t0: number; dur: number }): number => x.de + (x.a - x.de) * Math.min(1, Math.max(0, (t - x.t0) / x.dur))
        c[i] = u(a.c)
        alza[i] = u(a.alza)
      }
      for (let i = 0; i < n; i += 1) {
        if ((alza[i] ?? 0) <= 1e-6) continue
        for (let j = i + 1; j < n; j += 1) if (sePisan(esquinas(i, c[i] ?? 0, alza[i] ?? 0), esquinas(j, c[j] ?? 0, alza[j] ?? 0))) return `t=${String(t)} ms: la ${String(j)} pisa a la ${String(i)} levantada (${(alza[i] ?? 0).toFixed(2)})`
      }
    }
  }
  return null
}

const SECUENCIAS: readonly (readonly (number | null)[])[] = [
  [0, null],
  [1, null],
  [2, null],
  [3, null],
  [4, null],
  [0, 1, 2, 3, 4, null],
  [4, 3, 2, 1, 0, null],
  [2, 0, 4, 1, null, 3, null],
]
const recorridos = (apertura: number, sinEspera: boolean, ms: number): string | null => {
  for (const s of SECUENCIAS) {
    const cruce = primerCruce(s, ms, apertura, sinEspera)
    if (cruce !== null) return `${s.join(',')}: ${cruce}`
  }
  return null
}
const sinCruces = [600, 300, 120, 40].map((ms) => recorridos(APERTURA, false, ms))
afirmar(sinCruces.every((r) => r === null) && MS.espera >= MS.correrse, `ninguna tapa de adelante pisa a una que no está en reposo, en ningún cuadro (cada 4 ms), en las cinco y pasando de una a otra cada 600, 300, 120 y 40 ms (${sinCruces.map((r) => r ?? 'sin cruces').join(' · ')})`)
afirmar(recorridos(0, false, 600) !== null, '  control: sin abrirse (el prototipo), la de adelante la pisa', recorridos(0, false, 600) ?? '')
afirmar(recorridos(APERTURA, true, 600) !== null, '  control: levantándose sin esperar a las vecinas, la de adelante la pisa', recorridos(APERTURA, true, 600) ?? '')
type Elegir = typeof elegirLaTapa
const esperaBien = (f: Elegir): boolean => f(elegirLaTapa(ESTANTE_EN_REPOSO, 0, 0), 1, 10).demora === MS.bajar && f(soltarLaTapa(elegirLaTapa(ESTANTE_EN_REPOSO, 0, 0), 0, 100), 1, 150).demora === MS.bajar - 50 && f(soltarLaTapa(elegirLaTapa(ESTANTE_EN_REPOSO, 0, 0), 0, 100), 1, 1000).demora === 0
afirmar(esperaBien(elegirLaTapa), 'al pasar a otra tapa, las vecinas esperan lo que le falta bajar a la anterior (entera si estaba arriba; nada si ya bajó)')
controlPositivo('  el detector ve el estante que no espera', ((e, i) => ({ ...e, activa: i, ultima: i, demora: 0 })) as Elegir, esperaBien)

// Levantada, ninguna de ADELANTE la tapa: se ve entera (la de atrás queda debajo, como un libro apoyado).
const levantadaLibre = POSE_DE_LAS_TAPAS.every((_, i) => POSE_DE_LAS_TAPAS.every((__, j) => j <= i || !sePisan(esquinas(i, corrimiento('elegida'), 1), esquinas(j, corrimiento(papelDeLaTapa(j, i, i)), 0))))
afirmar(levantadaLibre, 'levantada, la elegida queda entera a la vista: ninguna de adelante la tapa')

cerrar('s92-m1')
