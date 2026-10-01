/**
 * SPRINT INTERFAZ 1 — el invariante del sprint: una sección por ticket, con sus controles positivos.
 *
 * T1 · el sistema de movimiento del texto (una familia, un canal, la misma caja en las dos ramas, la accesibilidad) y el
 * texto con inercia (la curva, el resorte en segundos, la velocidad en px/s, una lectura por cuadro y cero reservas).
 *
 * Lo que necesita navegador (que la inclinación se vea, que nada se corra al cargar) está en los bancos de
 * `scripts-interfaz1/` y sus entregas en `~/.cache/b4-medicion/interfaz1/`.
 */
import { readFileSync } from 'node:fs'
import { useMotionValue } from 'motion/react'
import type { ReactNode } from 'react'

import { Cuerpo, EtiquetaDeSeccion } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { CanalDeTexto, ConInercia } from '../../_secciones/_contrato/canales'
import { marcar } from '../../_secciones/_invariantes/render'
import { INERCIA_DEL_TEXTO, inclinacionObjetivo, pasoDelResorte, type EstadoDelResorte } from '../motion/inercia'
import { FAMILIA_DEL_TEXTO, type TipoDeTexto } from '../motion/texto'
import { SALTO_QUE_NO_ES_GESTO_PX, velocidadDelCuadro } from '../velocidadDelScroll'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const veces = (texto: string, aguja: string): number => texto.split(aguja).length - 1

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · 1 · Una sola familia: la misma curva, una escala de duraciones, una forma por tipo')

const TIPOS: readonly TipoDeTexto[] = ['titulo', 'parrafo', 'etiqueta']
const curvas = new Set(TIPOS.map((t) => FAMILIA_DEL_TEXTO[t].curva))
afirmarIgual([...curvas], ['principal'], 'los tres tipos comparten UNA curva: principal (power1.out)')
afirmar(
  FAMILIA_DEL_TEXTO.titulo.duracionDeclarada > FAMILIA_DEL_TEXTO.parrafo.duracionDeclarada &&
    FAMILIA_DEL_TEXTO.parrafo.duracionDeclarada > FAMILIA_DEL_TEXTO.etiqueta.duracionDeclarada,
  'las duraciones bajan con el tamaño del texto: título > párrafo > etiqueta',
)
afirmarIgual(TIPOS.map((t) => FAMILIA_DEL_TEXTO[t].pieza), ['linea', 'linea', 'palabra'], 'el título y el párrafo por línea; la etiqueta por palabra')
afirmar(
  TIPOS.every((t) => FAMILIA_DEL_TEXTO[t].claves.some((k) => k.clave === 'yPercent' && k.desde >= 100 && k.hasta === 0)),
  'los tres suben desde una altura de sí mismos (yPercent ≥ 100 → 0): con la máscara, aparecen; sin ella, pasarían de largo',
)
controlPositivo(
  'el chequeo de la curva única ve una familia con dos curvas',
  ['principal', 'simetrica'],
  (c: readonly string[]) => new Set(c).size === 1,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · 2 · El canal del texto: el MISMO elemento en las dos ramas, el texto entero para el lector')

function Prueba({ tipo, texto, render }: { readonly tipo: TipoDeTexto; readonly texto: string; readonly render: (c: ReactNode) => ReactNode }): React.JSX.Element {
  const progreso = useMotionValue(0.5)
  return (
    <CanalDeTexto progreso={progreso} tipo={tipo} texto={texto}>
      {render}
    </CanalDeTexto>
  )
}

const CASOS = [
  { tipo: 'titulo', texto: 'Lo que sigue lo armamos con vos', render: (c: ReactNode) => <Titular nivel="titulo-xl" como="h2" id="t" className="text-balance">{c}</Titular>, raiz: '<h2 id="t"' },
  { tipo: 'parrafo', texto: 'Tu acceso al proyecto. Ves cómo va y pedís lo que necesites.', render: (c: ReactNode) => <Cuerpo className="text-tinta-media">{c}</Cuerpo>, raiz: '<p data-pieza="texto"' },
  { tipo: 'etiqueta', texto: 'El recorrido', render: (c: ReactNode) => <EtiquetaDeSeccion como="h3" sangria={false}>{c}</EtiquetaDeSeccion>, raiz: '<h3 data-pieza="etiqueta-de-seccion"' },
] as const

/** La etiqueta de apertura de la raíz, entera (con sus clases). */
const apertura = (html: string): string => html.slice(0, html.indexOf('>') + 1)
/** El texto que lee un lector: todo menos lo que cuelga de un `aria-hidden`. Basta para este marcado (sin anidar `aria-hidden`). */
function textoAccesible(html: string): string {
  const sinOcultos = html.replace(/<span aria-hidden="true"[^>]*>[\s\S]*?<\/span><\/span><\/span>|<span aria-hidden="true"[^>]*>[\s\S]*$/g, '')
  return sinOcultos.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

for (const c of CASOS) {
  const quieto = marcar(<Prueba tipo={c.tipo} texto={c.texto} render={c.render} />, { anima: false })
  const animado = marcar(<Prueba tipo={c.tipo} texto={c.texto} render={c.render} />, { anima: true })
  const reducido = marcar(<Prueba tipo={c.tipo} texto={c.texto} render={c.render} />, { anima: false, preferencia: 'always' })
  afirmar(quieto.startsWith(c.raiz) && animado.startsWith(c.raiz), `${c.tipo}: la raíz es el elemento del consumidor en las dos ramas`, apertura(animado))
  afirmarIgual(apertura(animado), apertura(quieto), `  y es IDÉNTICA (etiqueta, id y clases): nada se corre al instalarse la coreografía`)
  afirmar(quieto.includes(`>${c.texto}<`) && !quieto.includes('aria-hidden'), '  la rama quieta (abajo de 1024, o con menos movimiento) es el texto entero, sin piezas')
  afirmarIgual(reducido, quieto, '  y con `prefers-reduced-motion` es exactamente esa rama')
  afirmar(animado.includes('class="sr-only"') && animado.includes(c.texto), '  la animada lleva el texto entero en un sr-only')
  afirmar(animado.includes('aria-hidden="true"'), '  y las piezas, fuera del árbol de accesibilidad')
  afirmar(!/<(p|h[1-6])[^>]*>(?:(?!<\/\1>)[\s\S])*<div/.test(animado), '  sin un `<div>` adentro del elemento de frase: las piezas son `span`')
  afirmarIgual(veces(animado, 'data-inercia'), c.tipo === 'titulo' ? 1 : 0, `  con la inercia sólo si es título`)
}
const etiqueta = marcar(<Prueba tipo="etiqueta" texto="El recorrido" render={CASOS[2].render} />, { anima: true })
afirmarIgual(veces(etiqueta, 'overflow-hidden'), 2, 'la etiqueta se parte en sus dos palabras, cada una en su ventana que recorta')
afirmar(textoAccesible(etiqueta) === 'El recorrido', 'y lo que lee el lector es la etiqueta entera, una vez', textoAccesible(etiqueta))
controlPositivo(
  'el chequeo del lector ve una etiqueta con las piezas a la vista (sin aria-hidden)',
  etiqueta.replace(/aria-hidden="true"/g, ''),
  (html: string) => textoAccesible(html) === 'El recorrido',
)
controlPositivo(
  'el chequeo de la raíz idéntica ve una rama animada con otra clase',
  ['<p class="a">', '<p class="a b">'],
  ([a, b]: readonly string[]) => a === b,
)

function ConInerciaDePrueba(): React.JSX.Element {
  return (
    <ConInercia como="div">
      <span>renglones</span>
    </ConInercia>
  )
}
afirmarIgual(marcar(<ConInerciaDePrueba />, { anima: false }), '<div class="block"><span>renglones</span></div>', 'la inercia sola: en la rama quieta, un envoltorio en bloque sin transformada')
afirmar(marcar(<ConInerciaDePrueba />, { anima: true }).includes('data-inercia'), '  y en la animada, el mismo envoltorio con la inclinación')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · 3 · Dónde entra el sistema: las secciones migradas, y las excepciones declaradas')

const MIGRADAS = [
  ['_secciones/quienes-somos/QuienesSomos.tsx', 1, 1],
  ['_secciones/quienes-somos/equipo.tsx', 3, 0],
  ['_secciones/trabajos/piezas.tsx', 1, 1],
  ['_secciones/tu-panel/TuPanel.tsx', 1, 0],
  ['_secciones/por-que-develop/PorQueDevelop.tsx', 0, 2],
  ['_secciones/cierre/Cierre.tsx', 1, 0],
  ['_secciones/cierre/ColumnasDelPie.tsx', 1, 0],
] as const
for (const [ruta, canales, inercias] of MIGRADAS) {
  const fuente = leer(ruta)
  afirmarIgual([veces(fuente, '<CanalDeTexto '), veces(fuente, '<ConInercia')], [canales, inercias], `${ruta}: ${String(canales)} textos por el canal y ${String(inercias)} títulos con la inercia sola`)
}
afirmar(leer('_secciones/_contrato/coreografia-animada.tsx').includes('<Inclinado>'), 'los titulares de `CanalDeTitular` (Tu panel, las demos) llevan la inercia')
afirmar(!leer('_secciones/hero/Hero.tsx').includes('CanalDeTexto'), 'el hero, NO (excepción declarada: su titular es el LCP y lo que se ve en el primer cuadro no se parte sin un cuadro de cambio)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · 4 · La inercia: la curva, el resorte en segundos, la velocidad en px/s')

const { umbralPxS, saturacionPxS, topeGrados } = INERCIA_DEL_TEXTO
afirmarIgual([inclinacionObjetivo(0), inclinacionObjetivo(umbralPxS), inclinacionObjetivo(-umbralPxS)], [0, 0, 0], 'hasta el umbral, nada: leer pasando no inclina un título')
afirmarIgual([inclinacionObjetivo(saturacionPxS), inclinacionObjetivo(saturacionPxS * 3)], [topeGrados, topeGrados], `y nunca pasa del tope (${String(topeGrados)}°)`)
afirmar(inclinacionObjetivo(-2500) === -inclinacionObjetivo(2500) && inclinacionObjetivo(2500) > 0, 'conserva el signo: bajando se inclina para un lado, subiendo para el otro')
let monotona = true
for (let v = 0, antes = 0; v <= saturacionPxS; v += 50) {
  const g = inclinacionObjetivo(v)
  if (g < antes) monotona = false
  antes = g
}
afirmar(monotona, 'y crece sin saltos ni retrocesos con la velocidad')

type Paso = (e: EstadoDelResorte, objetivo: number, dt: number) => void

/**
 * Una frenada: 0,4 s con el objetivo arriba (2°) y después a cero, a `hz` cuadros por segundo; la trayectoria
 * interpolada cada 50 ms (los cuadros de 75 o 144 Hz no caen justo en esos instantes).
 */
function frenada(hz: number, paso: Paso = pasoDelResorte): number[] {
  const e: EstadoDelResorte = { x: 0, v: 0 }
  const dt = 1 / hz
  const [ts, xs] = [[0], [0]]
  for (let k = 1; k * dt <= 2; k += 1) {
    paso(e, (k - 1) * dt < 0.4 ? 2 : 0, dt)
    ts.push(k * dt)
    xs.push(e.x)
  }
  const muestras: number[] = []
  for (let n = 0, i = 0; n <= 39; n += 1) {
    const t = n * 0.05
    while (ts[i + 1] < t) i += 1
    muestras.push(xs[i] + ((xs[i + 1] - xs[i]) * (t - ts[i])) / (ts[i + 1] - ts[i]))
  }
  return muestras
}
const separacion = (a: readonly number[], b: readonly number[]): number => Math.max(...a.map((x, i) => Math.abs(x - b[i])))
const a60 = frenada(60)
const diferencia = Math.max(...[75, 120, 144].map((hz) => separacion(frenada(hz), a60)))
afirmar(diferencia < 0.05, `el mismo gesto da la misma inclinación a 60, 75, 120 y 144 Hz (el resorte es exacto en segundos: ${diferencia.toFixed(3)}° de 2°)`)
const pasada = Math.min(...a60.slice(8))
afirmar(pasada < -0.02, `al frenar vuelve con resorte: pasa de largo un poco (${pasada.toFixed(3)}°) y se asienta`)
afirmar(Math.abs(a60[a60.length - 1]) < 0.01, '  y a los 1,55 s de frenar está quieto')
/** Un resorte integrado POR CUADRO (el paso fijo de 1/60 s, dure lo que dure el cuadro): lo que no hay que hacer. */
const porCuadro: Paso = (e, objetivo) => pasoDelResorte(e, objetivo, 1 / 60)
controlPositivo(
  'el chequeo de los hz ve un resorte integrado por cuadro (el mismo paso sin importar el tiempo)',
  [60, 144],
  (hzs: readonly number[]) => separacion(frenada(hzs[0], porCuadro), frenada(hzs[1], porCuadro)) < 0.05,
)

afirmarIgual(
  [Math.round(velocidadDelCuadro(0, 20, 1000 / 60)), Math.round(velocidadDelCuadro(0, 8.333, 1000 / 144))],
  [1200, 1200],
  'la velocidad sale en px/s: 20 px a 60 Hz y 8,3 px a 144 Hz son el mismo gesto',
)
afirmarIgual(velocidadDelCuadro(0, SALTO_QUE_NO_ES_GESTO_PX + 1, 16), 0, 'un salto de más de 400 px en un cuadro (el foco, un ancla) no inclina nada')
controlPositivo('el chequeo del salto ve una velocidad que no corta', SALTO_QUE_NO_ES_GESTO_PX + 1, (s: number) => (s * 1000) / 16 === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · 5 · Una lectura por cuadro, un resorte para todos, cero setState y cero reservas por cuadro')

const scroll = leer('_componentes/ScrollSuaveDeV3.tsx')
afirmarIgual(veces(scroll, 'VELOCIDAD_DEL_SCROLL.pxPorSegundo ='), 2, 'Lenis escribe la velocidad en UN lugar por cuadro (y la pone en 0 al irse)')
const inercia = leer('_lib/motion/inercia.ts')
/** El cuerpo de una función del fuente, contando llaves desde la que abre después de la firma. */
function cuerpoDe(fuente: string, firma: string): string {
  const inicio = fuente.indexOf('{', fuente.indexOf(firma) + firma.length)
  let nivel = 0
  for (let i = inicio; i < fuente.length; i += 1) {
    if (fuente[i] === '{') nivel += 1
    if (fuente[i] === '}') nivel -= 1
    if (nivel === 0) return fuente.slice(inicio + 1, i)
  }
  return ''
}
const cuerpoDelPaso = cuerpoDe(inercia, 'function paso({ delta }: { readonly delta: number }): void')
const cuerpoDelResorte = cuerpoDe(inercia, 'export function pasoDelResorte(e: EstadoDelResorte, objetivo: number, dtS: number): void')
afirmar(cuerpoDelPaso.includes('pasoDelResorte(') && cuerpoDelResorte.includes('Math.exp('), 'el paso del cuadro y el del resorte existen y se leen')
const reserva = /\bnew\b|\[[^\]]|=>|\.map\(|\.filter\(|\.forEach\(|\{ *\w+ *:/
afirmar(!reserva.test(cuerpoDelPaso) && !reserva.test(cuerpoDelResorte), 'el paso del cuadro y el del resorte no reservan nada: ni `new`, ni arreglos, ni objetos, ni cierres')
afirmar(!/set[A-Z]\w*\(/.test(cuerpoDelPaso) && !inercia.includes('useState'), '  ni toca React: escribe un MotionValue (`inclinacion.set`)')
afirmarIgual(veces(inercia, 'motionValue(0)'), 1, 'una sola inclinación para todos los títulos (un MotionValue del módulo)')
afirmar(inercia.includes('frame.update(paso, true)') && inercia.includes('cancelFrame(paso)'), 'el bucle corre en el cuadro de motion mientras haya títulos, y se apaga con el último')
controlPositivo('el chequeo de reservas ve un paso que arma un objeto', 'const e = { x: 0 }', (c: string) => !reserva.test(c))

cerrar('s37-interfaz1')
