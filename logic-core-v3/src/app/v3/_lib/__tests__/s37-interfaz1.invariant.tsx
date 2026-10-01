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
import { renderToStaticMarkup } from 'react-dom/server'

import { estadoBajo, fraccionDelPaso, tonoBajo } from '../../_chrome/cursor/estado'
import { DosCopias } from '../../_componentes/rollover/DosCopias'
import { textoVisible } from '../../_secciones/_contrato/escaneo'
import { quitarSubarbolesConAtributo } from '../../_secciones/_invariantes/marcado'
import { ROLLOVER_MEDIDO } from '../cta'
import { SEGUIMIENTO_DE_LA_REFERENCIA } from '../cursor'

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

// ═══════════════════════════════════════════════════════════════════════════
titulo('T2 · 1 · El rollover de dos copias: la geometría medida, en em; entra animado y vuelve de un cuadro')

const ROLLOVER = leer('_estilos/rollover.css')
const PX_DEL_CTA = 15 // `--text-cuerpo`, donde se midió el CTA (theme-develop.css)
const propiedad = (nombre: string): string => (new RegExp(`--rollover-${nombre}:\\s*([^;]+);`).exec(ROLLOVER)?.[1] ?? '').trim()
const em = (nombre: string): number => Number.parseFloat(propiedad(nombre))
const { salida, entrada } = ROLLOVER_MEDIDO
afirmarIgual(
  [em('salida-x'), em('salida-y'), em('entrada-x'), em('entrada-y')].map((v) => Math.round(v * 100) / 100),
  [salida.x, salida.y, entrada.x, entrada.y].map((px) => Math.round((px / PX_DEL_CTA) * 100) / 100),
  'los desplazamientos son los medidos en el CTA (ROLLOVER_MEDIDO, px) divididos por su tamaño de texto: el mismo gesto a cualquier tamaño',
)
afirmarIgual([propiedad('giro-salida'), propiedad('giro-entrada')], [`${String(salida.giroGrados)}deg`, `${String(entrada.giroGrados)}deg`], 'y los giros, los medidos: 6° la que sale, 10° la que entra')
const bloques = ROLLOVER.replace(/\/\*[\s\S]*?\*\//g, '').split('}')
const base = bloques.filter((b) => b.includes('[data-copia') && !b.includes(':hover') && !b.includes(':focus-visible'))
afirmar(base.length >= 2 && base.every((b) => !b.includes('transition')), 'la transición vive SÓLO en la regla de estado: al salir el rótulo vuelve de un cuadro (BOTON-1)')
const hoverAfuera = ROLLOVER.replace(/\/\*[\s\S]*?\*\//g, '').split('@media (hover: hover) and (pointer: fine)')[0]
afirmar(!hoverAfuera.includes(':hover'), 'el hover, sólo con el puntero fino (en una pantalla táctil quedaría pegado después de tocar)')
afirmar(hoverAfuera.includes(':focus-visible'), '  y el foco del teclado lo dispara siempre')
controlPositivo('el chequeo de la transición ve una regla de reposo con transición', ['[data-copia="b"] { transition: opacity 1s; }'], (bs: readonly string[]) => bs.every((b) => !b.includes('transition')))

const rollover = renderToStaticMarkup(<a href="#x"><DosCopias>Escribinos por WhatsApp</DosCopias></a>)
afirmarIgual(veces(rollover, 'Escribinos por WhatsApp'), 2, 'dos copias del rótulo en el marcado')
afirmarIgual(textoVisible(quitarSubarbolesConAtributo(rollover, 'aria-hidden')), 'Escribinos por WhatsApp', '  y el nombre del link, UNA vez: la segunda va aria-hidden (en nk el lector lee las dos pegadas)')
controlPositivo('el chequeo del nombre ve dos copias sin aria-hidden', rollover.replace('aria-hidden="true"', ''), (h: string) => textoVisible(quitarSubarbolesConAtributo(h, 'aria-hidden')) === 'Escribinos por WhatsApp')
const DONDE_HAY_ROLLOVER = [
  ['_secciones/cierre/PiezasDeContacto.tsx', 2],
  ['_secciones/trabajos/Proyecto.tsx', 1],
  ['_secciones/trabajos/CapaDelTunel.tsx', 1],
] as const
for (const [ruta, n] of DONDE_HAY_ROLLOVER) afirmarIgual(veces(leer(ruta), '<DosCopias>'), n, `${ruta}: ${String(n)} rollover(s)`)
afirmarIgual(veces(leer('layout.tsx'), "import './_estilos/rollover.css'") + veces(leer('layout.tsx'), "import './_estilos/cursor-sala.css'"), 2, 'las dos hojas nuevas entran por el layout, como las demás (un componente que importa CSS rompe los invariantes que corren en Node)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T2 · 2 · El cursor de la sala: el estado y el tono de lo que hay debajo')

/** Un DOM mínimo: lo que `estado.ts` lee (closest, el ancestro, los atributos y el tag). */
class Nodo {
  readonly parentElement: Nodo | null
  constructor(
    readonly tagName: string,
    private readonly atributos: Readonly<Record<string, string>> = {},
    padre: Nodo | null = null,
  ) {
    this.parentElement = padre
  }
  getAttribute(n: string): string | null {
    return this.atributos[n] ?? null
  }
  hasAttribute(n: string): boolean {
    return n in this.atributos
  }
  /** Un selector simple: `tag`, `[attr]`, `[attr="v"]`, `tag[attr]`. */
  private es(simple: string): boolean {
    const m = /^([a-z]*)((?:\[[^\]]+\])*)$/i.exec(simple)
    if (m === null) return false
    if (m[1] !== '' && m[1].toUpperCase() !== this.tagName) return false
    return [...m[2].matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)].every((a) => (a[2] === undefined ? this.hasAttribute(a[1]) : this.getAttribute(a[1]) === a[2]))
  }
  closest(selector: string): Nodo | null {
    for (const alternativa of selector.split(',').map((s) => s.trim())) {
      const partes = alternativa.split(/\s+/)
      for (let n: Nodo | null = this; n !== null; n = n.parentElement) {
        if (!n.es(partes[partes.length - 1])) continue
        let ok = true
        let arriba = n.parentElement
        for (let k = partes.length - 2; k >= 0 && ok; k -= 1) {
          while (arriba !== null && !arriba.es(partes[k])) arriba = arriba.parentElement
          ok = arriba !== null
          arriba = arriba?.parentElement ?? null
        }
        if (ok) return n
      }
    }
    return null
  }
}
const como = (n: Nodo | null): Element | null => n as unknown as Element | null

const html = new Nodo('HTML')
const trabajos = new Nodo('SECTION', { 'data-panel': 'trabajos', 'data-seccion': 'invertida' }, html)
const hero = new Nodo('SECTION', { 'data-panel': 'hero' }, html)
const parrafo = new Nodo('P', {}, hero)
const link = new Nodo('A', { href: '#x' }, hero)
const textoDelLink = new Nodo('SPAN', { 'data-copia': 'a' }, link)
const cta = new Nodo('A', { href: '#c', 'data-pieza': 'cta' }, hero)
const libro = new Nodo('A', { href: '#d', 'data-pieza': 'libro' }, trabajos)
const cinta = new Nodo('DIV', { 'data-pieza': 'cinta' }, trabajos)
const demoDeLaCinta = new Nodo('A', { href: '#e' }, cinta)
const campo = new Nodo('INPUT', {}, hero)
afirmarIgual(
  [parrafo, textoDelLink, cta, libro, demoDeLaCinta, campo, null].map((n) => estadoBajo(como(n), false)),
  ['texto', 'enlace', 'boton', 'demo', 'demo', 'oculto', 'oculto'],
  'contenido → texto · link (también desde su rótulo) → enlace · CTA → botón · libro y cinta → demo · campo y afuera → oculto',
)
afirmarIgual([estadoBajo(como(parrafo), true), estadoBajo(como(link), true)], ['logo', 'enlace'], 'sobre el logo (lo dice la escena) → logo; un link encima del logo gana')
afirmarIgual([parrafo, link, cta, libro].map((n) => estadoBajo(como(n), true, true)), ['texto', 'oculto', 'oculto', 'oculto'], 'la variante nk: sobre cualquier control se apaga, y el logo no tiene estado propio')
controlPositivo('el chequeo de estados ve un cursor que confunde el libro con un link', ['enlace'], (e: readonly string[]) => e[0] === 'demo')

const sinFondo = (): string => 'rgba(0, 0, 0, 0)'
afirmarIgual(
  [tonoBajo(como(parrafo), 0, sinFondo), tonoBajo(como(libro), 1, sinFondo), tonoBajo(como(libro), 0, sinFondo)],
  ['claro', 'oscuro', 'claro'],
  'el tono: el hero de día, claro; Trabajos de noche, oscuro; Trabajos con la sala todavía de día (un salto), claro',
)
const fondoOscuro = (el: Element): string => (el === como(cinta) ? 'rgb(14, 14, 14)' : 'rgba(0, 0, 0, 0)')
afirmarIgual(tonoBajo(como(demoDeLaCinta), 0, fondoOscuro), 'oscuro', 'un fondo opaco oscuro debajo (una ventana, una tarjeta) manda sobre la sala')
controlPositivo('el chequeo del tono ve un cursor claro sobre la sala de noche', 'claro', (t: string) => t === 'oscuro')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T2 · 3 · El cursor: en segundos, sin reservas, detrás de su compuerta, con el nativo siempre a la vista')

const recorrido = (hz: number): number => {
  let x = 0
  for (let t = 0; t < 0.3; t += 1 / hz) x += (100 - x) * fraccionDelPaso(1 / hz, SEGUIMIENTO_DE_LA_REFERENCIA.t63Ms.nucleo)
  return x
}
afirmar(Math.abs(recorrido(60) - recorrido(144)) < 1.5, `la persecución es la misma a 60 y 144 Hz (en 0,3 s: ${recorrido(60).toFixed(1)} y ${recorrido(144).toFixed(1)} de 100 px)`)
let restante = 1
for (let k = 0; k < 120; k += 1) restante *= 1 - fraccionDelPaso(SEGUIMIENTO_DE_LA_REFERENCIA.t63Ms.nucleo / 1000 / 120, SEGUIMIENTO_DE_LA_REFERENCIA.t63Ms.nucleo)
afirmar(Math.abs(restante - Math.exp(-1)) < 1e-9, '  y en t63 (la constante medida en nk) recorrió el 63 %')
controlPositivo('el chequeo de los hz ve el coeficiente por cuadro del cursor de S3', [60, 144], (hzs: readonly number[]) => {
  const porCuadro = (hz: number): number => {
    let x = 0
    for (let t = 0; t < 0.3; t += 1 / hz) x += (100 - x) * 0.0483
    return x
  }
  return Math.abs(porCuadro(hzs[0]) - porCuadro(hzs[1])) < 1.5
})
const cursor = leer('_chrome/cursor/CursorDeLaSala.tsx')
const pasoDelCursor = cuerpoDe(cursor, 'const paso = (ahora: number): void =>')
afirmar(pasoDelCursor.includes('fraccionDelPaso(') && !reserva.test(pasoDelCursor), 'el paso del cursor no reserva nada por cuadro (ni arreglos, ni objetos, ni cierres)')
afirmar(!cursor.includes('useState') && !/set[A-Z]\w*\(/.test(pasoDelCursor), '  ni pasa por React: atributos `data-` y propiedades de CSS')
const compuerta = leer('_chrome/cursor/CompuertaDelCursor.tsx')
afirmar(compuerta.includes("'(hover: hover) and (pointer: fine)'") && compuerta.includes('deberiaMontarseElCursor(') && compuerta.includes('ssr: false'), 'la compuerta: la de S3 (1024 y sin movimiento reducido) + el puntero fino, y el componente se descarga sólo si monta')
afirmar(!leer('_estilos/cursor-sala.css').includes('cursor: none'), 'el cursor nativo no se oculta en ninguna parte (como en nk)')
afirmar(leer('_lib/escena/entorno/Entorno.tsx').includes('LOGO_BAJO_EL_PUNTERO.sobre = m.hover'), 'el estado del logo lo escribe la escena con su propio hover (las compuertas de E4 ya aplicadas)')

cerrar('s37-interfaz1')
