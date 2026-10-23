/**
 * s84 · [NOCTURNO B5] DEMOS (la cola 40-B5 del 2026-10-22) — sin navegador, cada afirmación con su control positivo:
 *
 *   1 · la parada, en números: dónde aterrizan los dos vuelos que llegan a Demos, adónde sale, que no pisa a Servicios y que la llegada
 *       pedida está entera donde empieza (`demos/parada.ts`);
 *   2 · la parada con un reloj de mentira: la ráfaga que sobra se descarta, la llegada se ve entera y sólo un gesto nuevo sale;
 *   3 · ninguna sección lanza un vuelo encima del de otra (`vueloAjeno`);
 *   4 · el cableado: la máquina común con un paso, la llegada de la capa y la salida a «la tuya»;
 *   5 · el abanico más grande (al menos el 85 % de la columna del título a 1440 y a 1024, sin salirse ni taparlo);
 *   6 · las placas 3D: su espesor y la mirada de la escena;
 *   7 · el hover de las reseñas (se levanta, suena, su nombre) y el clic con el Genie;
 *   8 · las cinco demos y, abajo de 1024, el carrusel común (el agua que salió la afirma s38).
 *
 * [C2-41e] (la cola 2 del 2026-10-23, Demos en escritorio): §5 el abanico del tamaño justo; §7 el hover en un área quieta;
 *   9 · Demos es el espejo del Portfolio (el título y la bajada con su medida y a su altura);
 *  10 · el abanico en el plano del título 3D;
 *  11 · la primera pantalla de Demos: la cámara en la pose del Portfolio (sin la franja del piso), sin el oscurecido;
 *  12 · la carga: preconexión con Demos a la vista, el iframe desde el clic y la pantalla de carga como portada;
 *  13 · la bajada nueva.
 * Lo que se ve (la franja, las alturas, el hover con el mouse quieto, el primer cuadro de cada demo) lo mide `scripts-carga/demos-escritorio.ts`.
 *
 * Lo que se mide en el sitio (los gestos de verdad, Lenis, los tiempos) lo corre `scripts-carga/demos-parada.ts` (con su control).
 *
 *   npx tsx src/app/v3/_lib/__tests__/s84-demos.invariant.tsx   (`test:s84-demos`)
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { decidirLaRueda, decidirLaTecla, destinoDelGesto, HISTERESIS_DEL_GATILLO_PX, pasoConHisteresisEnElTramo, type ReglaDeGatillos } from '../../_componentes/gatillos/maquina'
import { GESTO_QUIETO, gestoDisparado, type GestoDeLaRueda } from '../../_componentes/gatillos/rueda'
import { CLAVE_DEL_VUELO } from '../../_componentes/gatillos/salto'
import { vueloAjeno, type VueloDelGatillo } from '../../_componentes/gatillos/vuelo'
import { marcar } from '../../_secciones/_invariantes/render'
import { Biblioteca, LADOS_DE_LA_PLACA } from '../../_secciones/trabajos/demos/Biblioteca'
import { CATALOGO_DE_DEMOS, MEDIDA_DE_LA_VENTANA, TEXTO_DE_DEMOS } from '../../_secciones/trabajos/demos/catalogo'
import { MARGEN_DE_LA_VISTA, anunciarDemos, olvidarDemos, seccionDeDemosEnElCuadro } from '../../_secciones/trabajos/demos/enLaEscena'
import { aparicionPedida } from '../../_secciones/trabajos/demos/entrada'
import { PARADA_DE_DEMOS, llegadaEnCurso, reglaDeLaParada } from '../../_secciones/trabajos/demos/parada'
import { ORIGENES_DE_LAS_DEMOS } from '../../_secciones/trabajos/demos/precarga'
import { PANTALLAS_POR_PASO, mostradoDeDemos, pxDeLaSeccion, pxDelScroll } from '../../_secciones/trabajos/portfolio/pasos'
import { mezclarConElPortfolio } from '../escena/poseDelPortfolio'
import { PORTFOLIO_EN_LA_ESCENA, objetivoDeLaPose } from '../escena/portfolioEnLaEscena'
import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../navegacion'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La parada, en números: los vuelos que llegan caen en ella, la salida cae en Servicios y la llegada está entera')

/** Los altos de la matriz desde 1024 (abajo de 1024 no hay parada: el Portfolio es un flujo). */
const ALTOS = [900, 768] as const
const H = HISTERESIS_DEL_GATILLO_PX

interface Chequeo {
  readonly delPortfolio: boolean
  readonly deServicios: boolean
  readonly aServicios: boolean
  readonly sinPisar: boolean
  readonly entera: boolean
}

/** La parada con `mitad` en un alto: cada condición por separado (el fin del pin en px de scroll es cualquiera). */
function chequeoDeLaParada(mitad: number, alto: number): Chequeo {
  const fin = 20_000
  const r = reglaDeLaParada(fin, alto, mitad)
  const R: ReglaDeGatillos = { cantidad: 1, pasoPx: r.pasoPx }
  const enElTramo = (y: number): number => y - r.inicio
  // El vuelo del Portfolio desde «la tuya» (`useMandosDelPortfolio`: el final del pin, dos píxeles antes), desde afuera.
  const delPortfolio = pasoConHisteresisEnElTramo(-1, enElTramo(fin - 2), R) === 0
  // La salida de arriba de Servicios (`useGatillos`: una ventana antes de su pista, que arranca en el pie de Trabajos), desde después.
  const inicioDeServicios = fin + alto
  const deServicios = pasoConHisteresisEnElTramo(1, enElTramo(inicioDeServicios - alto), R) === 0
  // La salida de abajo de la parada (una ventana después de su pista) cae en el primer paso de Servicios, pasada su histéresis. El paso
  // de Servicios mide al menos una ventana (su pista, al menos cinco).
  const enServicios = r.inicio + r.pasoPx + alto - inicioDeServicios
  const aServicios = enServicios >= H + 1 && enServicios < alto
  // Adentro de la parada (con su histéresis) Servicios todavía no empezó: las dos máquinas nunca están adentro a la vez.
  const sinPisar = r.inicio + r.pasoPx + H < inicioDeServicios
  // Donde la parada empieza a contar (su histéresis), la llegada que pide el scroll ya está entera (la regla de 900 del Portfolio).
  const tope = fin + alto - (pxDeLaSeccion(PANTALLAS_POR_PASO) * alto) / ALTO_DE_VIEWPORT_DE_LA_REFERENCIA
  const entera = aparicionPedida(mostradoDeDemos(pxDelScroll(r.inicio + H, tope, alto), PANTALLAS_POR_PASO), false) === 1
  return { delPortfolio, deServicios, aServicios, sinPisar, entera }
}
const todoBien = (c: Chequeo): boolean => c.delPortfolio && c.deServicios && c.aServicios && c.sinPisar && c.entera
const paradaBien = (mitad: number): boolean => ALTOS.every((alto) => todoBien(chequeoDeLaParada(mitad, alto)))

afirmar(paradaBien(PARADA_DE_DEMOS.mitad), `con media ventana a cada lado del fin del pin (a 1440 × 900 y a 1024 × 768): el vuelo del Portfolio desde «la tuya» y la salida de arriba de Servicios aterrizan EN la parada; su salida de abajo cae en el primer paso de Servicios pasada su histéresis (${String(H)} px); adentro de la parada Servicios todavía no empezó; y donde empieza la llegada pedida ya está entera`)
controlPositivo('  el detector ve una parada sin ancho (la salida de Servicios queda en su borde y la vuelta se clava afuera)', 0, paradaBien)
controlPositivo('  y una tan ancha que pisa a Servicios', 1.2, paradaBien)
controlPositivo('  y una que empieza antes de que la llegada esté pedida entera', 3, (m: number) => ALTOS.every((alto) => chequeoDeLaParada(m, alto).entera))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La parada con un reloj de mentira: la ráfaga se descarta, la llegada se ve entera, sólo un gesto nuevo sale')

type Evento = readonly [number, number]
const R1: ReglaDeGatillos = { cantidad: 1, pasoPx: 900 }
type Decidir = typeof decidirLaRueda

/** Corre la parada desde adentro: los eventos (ms, px), con la llegada corriendo hasta `llegadaHasta`. Devuelve cuándo y adónde sale. */
function recorrido(eventos: readonly Evento[], llegadaHasta: number, gestoInicial: GestoDeLaRueda, decidir: Decidir = decidirLaRueda, conLlegada = true): { readonly ms: number; readonly hacia: 'antes' | 'despues' } | null {
  let gesto = gestoInicial
  for (const [ahora, px] of eventos) {
    const ocupado = conLlegada && ahora < llegadaHasta
    const r = decidir({ paso: 0, enVuelo: false, ocupado, gesto, px, ahora, hacia: 0.5 * R1.pasoPx }, R1)
    gesto = r.gesto
    if (r.decision.tipo === 'paso' && r.decision.sentido !== null) {
      const d = destinoDelGesto(0, r.decision.sentido, 1)
      return { ms: ahora, hacia: d.tipo === 'despues' ? 'despues' : 'antes' }
    }
  }
  return null
}
const rafaga = (t0: number, s = 1, n = 12): Evento[] => Array.from({ length: n }, (_, k) => [t0 + k * 30, 120 * s] as const)
const trackpad = (t0: number, s = 1, n = 120): Evento[] => Array.from({ length: n }, (_, k) => [t0 + k * 16, s * Math.max(2, 80 * 0.97 ** k)] as const)
const muesca = (t: number, s = 1): Evento => [t, 100 * s]

interface Caso {
  readonly nombre: string
  readonly eventos: readonly Evento[]
  readonly llegadaHasta: number
  /** El gesto con que entra: el que trajo la página (ya dado afuera) o uno quieto. */
  readonly traido: boolean
  readonly espera: { readonly ms: number; readonly hacia: 'antes' | 'despues' } | null
}
const CASOS: readonly Caso[] = [
  // La cola de la ráfaga que lanzó el vuelo del Portfolio (el gesto ya dio su paso afuera) sigue entrando mientras Demos llega.
  { nombre: 'la cola de la ráfaga del Portfolio, con la llegada corriendo: nada; una muesca nueva: Servicios', eventos: [...rafaga(0), muesca(3000)], llegadaHasta: 1500, traido: true, espera: { ms: 3000, hacia: 'despues' } },
  { nombre: 'la inercia del trackpad más larga que la llegada: nada (es el mismo gesto); un trackpad nuevo: Servicios', eventos: [...trackpad(0), ...trackpad(5000)], llegadaHasta: 800, traido: true, espera: { ms: 5000, hacia: 'despues' } },
  { nombre: 'una muesca NUEVA con la llegada corriendo: se traga; otra después: Servicios', eventos: [muesca(500), muesca(2500)], llegadaHasta: 1500, traido: false, espera: { ms: 2500, hacia: 'despues' } },
  { nombre: 'subiendo: la cola de la ráfaga de Servicios, nada; una muesca nueva hacia arriba: «la tuya»', eventos: [...rafaga(0, -1), muesca(3000, -1)], llegadaHasta: 0, traido: true, espera: { ms: 3000, hacia: 'antes' } },
  { nombre: 'sin gesto nuevo, Demos se queda (una ráfaga larga que no para)', eventos: rafaga(0, 1, 80), llegadaHasta: 1000, traido: true, espera: null },
]
const corre = (decidir: Decidir, conLlegada = true): string[] =>
  CASOS.filter((c) => JSON.stringify(recorrido(c.eventos, c.llegadaHasta, c.traido ? gestoDisparado(-10) : GESTO_QUIETO, decidir, conLlegada)) !== JSON.stringify(c.espera)).map((c) => c.nombre)
afirmarIgual(corre(decidirLaRueda), [], `los ${String(CASOS.length)} casos de la parada: la ráfaga y la inercia que sobran se descartan, la llegada se ve entera, Demos se queda hasta un gesto nuevo (la rueda quieta 160 ms) y el gesto nuevo sale al vecino del sentido`)
controlPositivo('  el detector ve la parada que no espera la llegada (`parada-sin-llegada`)', false, (con: boolean) => corre(decidirLaRueda, con).length === 0)
const dePixeles: Decidir = (m) => ({ decision: { tipo: 'paso', sentido: m.px > 0 ? 1 : -1 }, gesto: m.gesto })
controlPositivo('  y la rueda de a píxeles (la ráfaga sigue de largo, la de antes)', dePixeles, (d: Decidir) => corre(d).length === 0)
afirmar(decidirLaTecla(0, 1, false, true, false) === 'tragar' && decidirLaTecla(0, 1, false, false, false) === 'paso' && decidirLaTecla(0, 1, false, false, true) === 'tragar', 'el teclado: con la llegada corriendo una tecla se traga; llegada, una tecla apretada sale (su repetición, no)')
afirmar(llegadaEnCurso({ pedida: 1, mostrada: 0.4 }) && llegadaEnCurso({ pedida: 0, mostrada: 0.4 }) && !llegadaEnCurso({ pedida: 1, mostrada: 1 }) && !llegadaEnCurso(null), '  la llegada corre mientras lo mostrado no alcanzó a lo pedido (en las dos direcciones); sin capa, no')
controlPositivo('  el detector ve una llegada que se da por terminada antes de tiempo', (l: { pedida: number; mostrada: number } | null) => l !== null && l.mostrada < 0.5, (f: (l: { pedida: number; mostrada: number } | null) => boolean) => f({ pedida: 1, mostrada: 0.6 }) && !f({ pedida: 1, mostrada: 1 }))

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Ninguna sección lanza un vuelo encima del de otra')

const lenisCon = (marca: string | null): { readonly userData: Readonly<Record<string, unknown>> } => ({ userData: marca === null ? {} : { [CLAVE_DEL_VUELO]: marca } })
const propio: VueloDelGatillo = { id: Symbol('propio'), y: 0, marca: 'gatillo-1', cancelar: () => undefined }
const ajenoBien = (f: typeof vueloAjeno): boolean =>
  f(lenisCon('portfolio-3'), null) && f(lenisCon('portfolio-3'), propio) && f(lenisCon('gatillo-2'), propio) && !f(lenisCon('gatillo-1'), propio) && !f(lenisCon(null), null) && !f(null, null)
afirmar(ajenoBien(vueloAjeno), 'un viaje con marca que no es el propio (el del Portfolio a Demos, el de la parada a Servicios) es ajeno; el propio, sin marca o sin Lenis, no')
controlPositivo('  el detector ve la máquina de B4, que no miraba a los demás (la entrada de al lado pisaba el vuelo)', () => false, ajenoBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El cableado: la máquina común con un paso, la llegada de la capa y la salida a «la tuya»')

const GATILLOS = sinComentarios(leer('_componentes/gatillos/useGatillos.ts'))
const PARADA = sinComentarios(leer('_secciones/trabajos/demos/ParadaDeDemos.tsx'))
const TRABAJOS = sinComentarios(leer('_secciones/trabajos/Trabajos.tsx'))
const CAPA = sinComentarios(leer('_secciones/trabajos/demos/CapaDeDemos.tsx'))
const cableada = (parada: string, trabajos: string, capa: string, gatillos: string): boolean =>
  /useGatillos\(\{ pista, cantidad: 1, activa, tactil: false, reducido, duracionMs: 0, ocupada, salidaDeArriba, nombre: 'demos' \}\)/.test(parada) &&
  /llegadaEnCurso\(LLEGADA_DE_DEMOS\.persecucion\)/.test(parada) && /scrollDeLaTuya\(\)/.test(parada) &&
  /\{vivo\.carrusel \? null : <ParadaDeDemos reducido=\{vivo\.reducido\} \/>\}/.test(trabajos) &&
  /LLEGADA_DE_DEMOS\.persecucion = p/.test(capa) &&
  /ajustes\.current\.ocupada\?\.\(\) === true/.test(gatillos) && /ajustes\.current\.salidaDeArriba\?\.\(\) \?\? inicio\.current - window\.innerHeight/.test(gatillos) &&
  /const vuela = \(enVuelo\.current !== null \|\| vueloAjeno\(lenis, enVuelo\.current\)\) && !sinCandado/.test(gatillos)
afirmar(cableada(PARADA, TRABAJOS, CAPA, GATILLOS), 'la parada es la máquina común (`useGatillos`) con un paso, sin dedo, con la llegada de la capa como su transición y la salida de arriba a «la tuya»; Trabajos la monta sólo desde 1024 (sin el carrusel); la capa publica su persecución; y la máquina común traga con el vuelo de otra sección')
controlPositivo('  el detector ve una parada montada también con el carrusel', PARADA, (p: string) => cableada(p, TRABAJOS.replace('{vivo.carrusel ? null : <ParadaDeDemos', '{<ParadaDeDemos'), CAPA, GATILLOS))
controlPositivo('  y una máquina que no espera la transición propia', GATILLOS.replace(' || ajustes.current.ocupada?.() === true', ''), (g: string) => cableada(PARADA, TRABAJOS, CAPA, g))
afirmar(existsSync(path.join(process.cwd(), 'scripts-carga/demos-parada.ts')), '  y su banco en el sitio (la matriz: rueda, ráfaga, trackpad y teclado, bajando y subiendo, con `CONTROL=sin-parada` y `parada-sin-llegada`)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · [C2-41e] El abanico del tamaño justo: placas entre las de antes (160 px) y las de B5 (242 y 167), y llena la columna del espejo')

const DEMOS_CSS = leer('_estilos/demos.css').replace(/\/\*[\s\S]*?\*\//g, '')
/** Lo que el estante declara (los valores de la hoja, no copias). La placa es `max(piso, porcentaje)`; la de B5, sólo el porcentaje. */
function medidasDelEstante(css: string): { readonly piso: number; readonly ancho: number; readonly giro: number; readonly perspectiva: number; readonly solape: number } {
  const conPiso = /--libro-ancho: max\(calc\(var\(--spacing-8\) \* ([\d.]+)\), ([\d.]+)%\);/.exec(css)
  const soloPorcentaje = /--libro-ancho: ([\d.]+)%;/.exec(css)
  // `--spacing-8`: 2 rem, 32 px.
  const piso = conPiso === null ? 0 : 32 * Number(conPiso[1])
  const ancho = Number(conPiso?.[2] ?? soloPorcentaje?.[1] ?? Number.NaN)
  const giro = Number(/--libro-giro: ([\d.]+)deg;/.exec(css)?.[1] ?? Number.NaN)
  const perspectiva = 32 * Number(/--libro-perspectiva: calc\(var\(--spacing-8\) \* ([\d.]+)\);/.exec(css)?.[1] ?? Number.NaN)
  const solape = Number(/margin-inline-start: min\(\s*calc\(var\(--libro-ancho\) \* (-[\d.]+)\),\s*calc\(\(100% - var\(--libro-ancho\)\) \/ \(var\(--libros\) - 1\) - var\(--libro-ancho\)\)\s*\);/.exec(css)?.[1] ?? Number.NaN)
  return { piso, ancho, giro, perspectiva, solape }
}
type Estante = ReturnType<typeof medidasDelEstante>
/** El ancho de una placa en una columna de `W` px. */
const placaEn = (W: number, m: Estante): number => Math.max(m.piso, (W * m.ancho) / 100)
/**
 * Lo que se VE del abanico en una columna de `W` px, sobre su ancho: cada placa girada `giro` sobre su centro y vista por su propia
 * cámara (la perspectiva desde su centro: `perspective()` en su transformada), en el lugar que le da el solape de la hoja. Sin la mirada
 * (el mouse quieto). Devuelve la fracción y si se sale de la columna.
 */
function abanicoEn(W: number, m: Estante, n = 5): { readonly fraccion: number; readonly adentro: boolean } {
  const w = placaEn(W, m)
  const paso = w + Math.min(w * m.solape, (W - w) / (n - 1) - w)
  const a = w / 2
  const t = (m.giro * Math.PI) / 180
  const d = m.perspectiva
  const izquierda = a + (-a * Math.cos(t) * d) / (d - a * Math.sin(t))
  const derecha = a + (n - 1) * paso + (a * Math.cos(t) * d) / (d + a * Math.sin(t))
  return { fraccion: (derecha - izquierda) / W, adentro: izquierda >= 0 && derecha <= W + 0.5 }
}
/** La columna de B5: el envoltorio (32 px de cada lado) y la grilla de dos columnas con 32 px en el medio. */
const columnaDeB5 = (ancho: number): number => (ancho - 2 * 32 - 32) / 2
const CAPA_TSX = sinComentarios(leer('_secciones/trabajos/demos/CapaDeDemos.tsx'))
const grillaDeSiempre = /claseDeContenido="grid h-full grid-cols-2 items-center gap-8 /.test(CAPA_TSX) && /px-\[var\(--pad-lateral-compacto\)\]/.test(leer('_componentes/layout/Envoltorio.tsx')) && /--pad-lateral-compacto: 32px;/.test(readFileSync(path.join(process.cwd(), 'src/app/theme-develop.css'), 'utf8'))
/** [C2-41e] La columna del espejo (§9): la de la grilla menos el paso de 16 px de la izquierda (`--spacing-4`) = la mitad menos 64, la del Portfolio. */
const pasoDelEspejo = /<div data-parte="columna-de-demos" className="[^"]* escritorio:pl-4 /.test(CAPA_TSX) ? 16 : 0
const columnaDelEspejo = (ancho: number): number => columnaDeB5(ancho) - pasoDelEspejo
const tamanoJusto = (css: string, columna: (ancho: number) => number): boolean => {
  const m = medidasDelEstante(css)
  const [a1440, a1024] = [placaEn(columna(1440), m), placaEn(columna(1024), m)]
  return a1440 > 160 && a1440 < 242 && a1024 > 160 && a1024 < 167
}
const llena = (css: string, columna: (ancho: number) => number): boolean => [1440, 1024].every((ancho) => {
  const r = abanicoEn(columna(ancho), medidasDelEstante(css))
  return r.fraccion >= 0.85 && r.adentro
})
const enCadaAncho = [1440, 1024].map((ancho) => `${String(ancho)}: placas de ${placaEn(columnaDelEspejo(ancho), medidasDelEstante(DEMOS_CSS)).toFixed(0)} px, el abanico en el ${(abanicoEn(columnaDelEspejo(ancho), medidasDelEstante(DEMOS_CSS)).fraccion * 100).toFixed(1)} % de ${String(columnaDelEspejo(ancho))} px`).join(' · ')
afirmar(grillaDeSiempre && pasoDelEspejo === 16 && tamanoJusto(DEMOS_CSS, columnaDelEspejo) && llena(DEMOS_CSS, columnaDelEspejo), `las placas, más chicas que las de B5 y más grandes que las de antes del agrandamiento, y el abanico llena la columna del espejo sin salirse (${enCadaAncho})`)
controlPositivo('  el detector ve las placas de B5 (el 36 % de la columna de entonces: 242 px a 1440 y 167 a 1024)', DEMOS_CSS.replace(/--libro-ancho: [^;]+;/, '--libro-ancho: 36%;'), (c: string) => tamanoJusto(c, columnaDeB5))
controlPositivo('  y las de antes del agrandamiento (160 px a 1440)', DEMOS_CSS.replace(/--libro-ancho: [^;]+;/, '--libro-ancho: 23.8095%;'), (c: string) => tamanoJusto(c, columnaDeB5))
controlPositivo('  y un abanico que no llena la columna (placas de 160 px con el solape fijo de antes)', DEMOS_CSS.replace(/--libro-ancho: [^;]+;/, '--libro-ancho: max(calc(var(--spacing-8) * 5.125), 20%);').replace(/margin-inline-start: min\(\s*calc\(var\(--libro-ancho\) \* -0\.42\),[^;]*;/, 'margin-inline-start: calc(var(--libro-ancho) * -0.42);'), (c: string) => llena(c, columnaDelEspejo))
// Debajo del título: el estante va después del texto (título y párrafo) en la misma columna; nada lo pone encima.
const debajo = (c: string): boolean => {
  const texto = c.indexOf('<TextoDeDemos ')
  const estante = c.indexOf('<Biblioteca ')
  return texto >= 0 && estante > texto && !/absolute|fixed/.test(c.slice(texto, estante))
}
afirmar(debajo(CAPA_TSX), '  y va debajo del título y su párrafo, en el flujo de la misma columna (no lo tapa)')
controlPositivo('  el detector ve el estante arriba del texto', CAPA_TSX.replace('<TextoDeDemos ', '<X ').replace('<Biblioteca ', '<TextoDeDemos ').replace('<X ', '<Biblioteca '), debajo)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Placas 3D fijas en el mundo: espesor y la mirada de la escena (la misma de los títulos y los valores)')

const BIBLIOTECA = sinComentarios(leer('_secciones/trabajos/demos/Biblioteca.tsx'))
const conLaMirada = (b: string, css: string): boolean =>
  /suscribirALaMirada\(\(m\) => el\.style\.setProperty\('--mirada', giroDeLaPieza\(m\)\)\)/.test(b) &&
  /\[data-v3\] \[data-pieza="libro"\] > \[data-parte="cara"\] \{[^}]*transform-style: preserve-3d;[^}]*transform: perspective\(var\(--libro-perspectiva\)\) var\(--mirada\);[^}]*\}/.test(css) &&
  !/\[data-pieza="libro"\] > \[data-parte="cara"\] \{[^}]*transition/.test(css)
afirmar(conLaMirada(BIBLIOTECA, DEMOS_CSS), 'cada placa se ve con la mirada de la escena (`giroDeLaPieza`: los mismos topes, el suavizado de la cámara y la exageración del CSS), al revés de lo que el mouse le suma a la cámara: fija en el mundo; la cámara de la placa no tiene transición (no se arrastra detrás del mouse)')
controlPositivo('  el detector ve una cámara con transición (se quedaría atrás de la mirada)', DEMOS_CSS.replace('transform: perspective(var(--libro-perspectiva)) var(--mirada);', 'transform: perspective(var(--libro-perspectiva)) var(--mirada);\n  transition: transform 100ms;'), (css: string) => conLaMirada(BIBLIOTECA, css))
controlPositivo('  y una biblioteca que no escucha la mirada', BIBLIOTECA.replace("el.style.setProperty('--mirada', giroDeLaPieza(m))", 'undefined'), (b: string) => conLaMirada(b, DEMOS_CSS))
const ESTANTE = marcar(<Biblioteca alAbrir={() => undefined} alejada={false} />, { anima: true })
const conEspesor = (h: string): boolean =>
  (h.match(/<span data-parte="cara"><span data-parte="placa"><span data-parte="portada">/g) ?? []).length === CATALOGO_DE_DEMOS.length &&
  (h.match(/<span aria-hidden="true" data-parte="canto" data-lado="/g) ?? []).length === CATALOGO_DE_DEMOS.length * LADOS_DE_LA_PLACA.length &&
  LADOS_DE_LA_PLACA.every((l) => new RegExp(`\\[data-parte="canto"\\]\\[data-lado="${l}"\\] \\{`).test(DEMOS_CSS)) && /--libro-espesor: var\(--spacing-3\);/.test(DEMOS_CSS)
afirmar(conEspesor(ESTANTE), `las ${String(CATALOGO_DE_DEMOS.length)} placas con su espesor: la portada y ${String(LADOS_DE_LA_PLACA.length)} cantos (el dorso y los cuatro costados, decoración: \`aria-hidden\`), cada uno con su regla`)
controlPositivo('  el detector ve las portadas planas de antes (sin cantos)', ESTANTE.replace(/<span aria-hidden="true" data-parte="canto" data-lado="[a-z]+"><\/span>/g, ''), conEspesor)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · La gramática de las reseñas: el hover levanta la placa, suena y muestra su nombre; el clic abre el Genie de siempre')

const hoverBien = (b: string, css: string): boolean =>
  (b.match(/sonar\('tic'\)/g) ?? []).length === 2 && /if \(e\.pointerType !== 'mouse' && e\.pointerType !== 'pen'\) return\s*sonar\('tic'\)/.test(b) &&
  /el\.textContent = TEXTO_DE_DEMOS\.cartelDeLaPieza\(demo\.nombre\)/.test(b) &&
  /:is\(:hover, :focus-visible\) > \[data-parte="cara"\] > \[data-parte="placa"\] \{\s*transform: translateY\(calc\(-1 \* var\(--libro-alza\)\)\)/.test(css)
afirmar(hoverBien(BIBLIOTECA, DEMOS_CSS) && TEXTO_DE_DEMOS.cartelDeLaPieza('Noir').includes('Noir'), 'el hover (y el foco del teclado): la placa se levanta un poco (el alza del estante, 24 px) y se pone de frente, suena el tic de la barra (con el sonido apagado, nada) y aparece su nombre en la pastilla de la barra')
controlPositivo('  el detector ve un hover mudo', BIBLIOTECA.replace(/sonar\('tic'\)/g, 'void 0'), (b: string) => hoverBien(b, DEMOS_CSS))
controlPositivo('  y una placa que no se levanta', DEMOS_CSS.replace(/(:is\(:hover, :focus-visible\) > \[data-parte="cara"\] > \[data-parte="placa"\] \{\s*)transform: translateY\(calc\(-1 \* var\(--libro-alza\)\)\)/, '$1transform: translateY(0)'), (css: string) => hoverBien(BIBLIOTECA, css))
// [C2-41e] El área que detecta el hover es el hueco (el ancla, quieto): lo que se transforma (la cara, la placa, los cantos) va sin puntero,
// y ninguna regla del hover o del foco mueve el ancla. Antes la placa recibía el puntero y asomaba fuera del hueco: vibraba (`lote1/14`).
const areaQuieta = (css: string, b: string): boolean =>
  /\[data-v3\] \[data-pieza="libro"\] > \[data-parte="cara"\] \{[^}]*pointer-events: none;/.test(css) &&
  !/\[data-pieza="libro"\]:is\(:hover, :focus-visible\) \{[^}]*transform/.test(css) && !/\[data-pieza="libro"\]:focus-visible \{[^}]*transform/.test(css) &&
  /<span data-parte="cara" style=\{areaMovil \? \{ pointerEvents: 'auto' \} : undefined\}>/.test(b) && /useState\(\(\) => conElDefectoDeDemos\('area-movil'\)\)/.test(b)
afirmar(areaQuieta(DEMOS_CSS, BIBLIOTECA), '[C2-41e] el hover se detecta en el hueco quieto de cada pieza: la cara (cámara, placa y cantos) no recibe el puntero y el hover no mueve el ancla (sólo el banco, con `CONTROL=area-movil`, le devuelve el puntero a la placa)')
controlPositivo('  el detector ve la placa que recibe el puntero (la de antes: vibraba)', DEMOS_CSS.replace(/(\[data-v3\] \[data-pieza="libro"\] > \[data-parte="cara"\] \{[^}]*)pointer-events: none;/, '$1'), (c: string) => areaQuieta(c, BIBLIOTECA))
controlPositivo('  y un hover que levanta el ancla entera', DEMOS_CSS.replace('[data-v3] [data-pieza="libro"]:is(:hover, :focus-visible) {', '[data-v3] [data-pieza="libro"]:is(:hover, :focus-visible) {\n    transform: translateY(-24px);'), (c: string) => areaQuieta(c, BIBLIOTECA))
afirmar(existsSync(path.join(process.cwd(), 'scripts-carga/demos-escritorio.ts')), '  y su banco en el sitio: el mouse quieto 3 s sobre el borde de cada placa, contando las entradas y salidas (`MODO=hover`, con `CONTROL=area-movil`)')
const VENTANA = sinComentarios(leer('_secciones/trabajos/demos/VentanaDeDemo.tsx'))
const elGenie = (b: string, v: string): boolean => /e\.preventDefault\(\)\s*esconderElCartel\(\)\s*alAbrir\(demo, e\.currentTarget\)/.test(b) && /cajaDe\(pieza\.querySelector\('\[data-parte="cara"\]'\) \?\? pieza\)/.test(v) && /<GenieDeDemo ref=\{pintor\}/.test(v)
afirmar(elGenie(BIBLIOTECA, VENTANA), '  el clic abre la demo con el despliegue de siempre (el Genie sale de la placa entera: su cámara, `[data-parte="cara"]`, y vuelve a ella)')
controlPositivo('  el detector ve un clic que abre otra pestaña', BIBLIOTECA.replace('alAbrir(demo, e.currentTarget)', "window.open(demo.url, '_blank')"), (b: string) => elGenie(b, VENTANA))

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · Las cinco, y en el teléfono el carrusel del Portfolio')

afirmarIgual(CATALOGO_DE_DEMOS.map((d) => d.slug).sort(), ['bold', 'ethereal', 'niche', 'noir', 'skyline'], 'las cinco demos: Ethereal, Niche, Nexo (NEXO Bold), Noir y Skyline')
const QUIETOS = sinComentarios(leer('_secciones/trabajos/demos/DemosQuietos.tsx'))
const enLasDosRamas = (capa: string, quietos: string): boolean => /<CarruselDeDemos className="escritorio:hidden" alMontarse=\{alMontarElCarrusel\} \/>/.test(capa) && /<CarruselDeDemos className="escritorio:hidden" \/>/.test(quietos) && !/<Carrusel\b/.test(capa + quietos)
afirmar(enLasDosRamas(CAPA_TSX, QUIETOS), '  abajo de 1024, en las dos ramas, el carrusel común de B1.2e con las demos (s5-trabajos §27 afirma sus tarjetas); la cinta que corría sola se fue')
controlPositivo('  el detector ve la cinta de antes', CAPA_TSX.replace('<CarruselDeDemos className="escritorio:hidden" alMontarse={alMontarElCarrusel} />', '<Carrusel enMarcha={carruselEnMarcha} />'), (c: string) => enLasDosRamas(c, QUIETOS))

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · [C2-41e] Desde 1024 Demos es el espejo del Portfolio: el título y la bajada con su medida y a su altura, y el abanico debajo')

const TEXTO_TSX = sinComentarios(leer('_secciones/trabajos/demos/TextoDeDemos.tsx'))
const ESPEJO_TS = sinComentarios(leer('_secciones/trabajos/demos/espejo.ts'))
const ENCABEZADO_DEL_PORTFOLIO = sinComentarios(leer('_secciones/trabajos/portfolio/EncabezadoDelPortfolio.tsx'))
const ESCENARIO_DEL_PORTFOLIO = sinComentarios(leer('_secciones/trabajos/portfolio/EscenarioDelPortfolio.tsx'))
const esEspejo = (css: string, texto: string, capa: string, hook: string): boolean => {
  const columna = /<div data-parte="columna-de-demos" className="([^"]*)">/.exec(capa)?.[1].split(' ') ?? []
  const bloque = /<div id="demos" className="([^"]*)">/.exec(texto)?.[1].split(' ') ?? []
  const tiene = (clases: readonly string[], ...buscadas: readonly string[]): boolean => buscadas.every((b) => clases.includes(b))
  return (
    // La columna, desde 1024: contenedor del título, centrada, arranca donde el espejo mide el título del Portfolio (hasta medir, el tope
    // de la hoja). Las dos clases con valor van armadas por partes (el escaneo de Tailwind lee los tests).
    tiene(columna, 'flex', 'flex-col', 'gap-8', 'escritorio:items-center', 'escritorio:self-start', 'escritorio:pl-4', 'escritorio:text-center') &&
    columna.includes('escritorio:pt-' + '[var(--demos-tope-del-titulo)]') && columna.includes('escritorio:' + '[container-type:inline-size]') &&
    /\[data-v3\] \[data-capa="demos"\] \{\s*--demos-tope-del-titulo: 22svh;\s*\}/.test(css) &&
    // Las separaciones del Portfolio: su bajada va a `mt-6` del título (24 px) y su hueco a `mt-8` (32 px: la columna de Demos, `gap-8`).
    tiene(bloque, 'escritorio:items-center', 'escritorio:gap-6') && /className="mt-6"/.test(ENCABEZADO_DEL_PORTFOLIO) && /className="mt-8 shrink-0/.test(ESCENARIO_DEL_PORTFOLIO) &&
    /useEspejoDelPortfolio\(capa\)/.test(capa) &&
    // La medida del título y de la bajada: las del Portfolio, importadas (no copiadas).
    /import \{ CLASE_DEL_TITULAR, MEDIDA_DEL_CUERPO_CH \} from '\.\.\/portfolio\/tipografia'/.test(texto) && /CLASE_DEL_TITULAR\.split\(' '\)\.filter\(\(c\) => c\.startsWith\('escritorio:'\)\)/.test(texto) &&
    /const MEDIDA_DEL_TEXTO_CH = MEDIDA_DEL_CUERPO_CH/.test(texto) && /className=\{cn\(CLASE_DEL_TITULAR_DEL_CARTEL, TITULAR_DEL_PORTFOLIO_EN_ESCRITORIO\)\}/.test(texto) && /cn\(CLASE_DEL_CUERPO_DE_DEMOS, CUERPO_DEL_PORTFOLIO_EN_ESCRITORIO\)/.test(texto) &&
    // El espejo mide el encabezado del Portfolio sin transformadas y lo vuelve a medir cuando cambia de tamaño.
    /\[data-pieza="encabezado-del-portfolio"\]/.test(hook) && /y \+= e\.offsetTop/.test(hook) && /el\.style\.setProperty\(VARIABLE_DEL_TOPE, valor\)/.test(hook) && /new ResizeObserver\(medir\)/.test(hook) && /conElDefectoDeDemos\('sin-espejo'\)/.test(hook)
  )
}
afirmar(esEspejo(DEMOS_CSS, TEXTO_TSX, CAPA_TSX, ESPEJO_TS), 'la columna de Demos es la del Portfolio dada vuelta: contenedor del título (que lleva la medida de escritorio del de Portfolio, importada), centrada, arranca a la altura del título del Portfolio (lo mide `espejo.ts` sin transformadas, con un `ResizeObserver`), la bajada a 24 px con la letra y la medida de la del Portfolio, y el abanico a 32 px (lo que se ve lo mide `scripts-carga/demos-escritorio.ts`, `MODO=espejo`: |Δy| ≤ 2 px)')
controlPositivo('  el detector ve la columna centrada de antes (sin el tope del espejo)', CAPA_TSX.replace(' escritorio:pt-' + '[var(--demos-tope-del-titulo)]', ''), (c: string) => esEspejo(DEMOS_CSS, TEXTO_TSX, c, ESPEJO_TS))
controlPositivo('  y la separación de antes entre el título y la bajada (16 px)', TEXTO_TSX.replace(' escritorio:gap-6', ''), (t: string) => esEspejo(DEMOS_CSS, t, CAPA_TSX, ESPEJO_TS))
controlPositivo('  y el título de Demos con su medida de antes', TEXTO_TSX.replace('className={cn(CLASE_DEL_TITULAR_DEL_CARTEL, TITULAR_DEL_PORTFOLIO_EN_ESCRITORIO)}', 'className={CLASE_DEL_TITULAR_DEL_CARTEL}'), (t: string) => esEspejo(DEMOS_CSS, t, CAPA_TSX, ESPEJO_TS))
controlPositivo('  y una capa que no mide al Portfolio', CAPA_TSX.replace('useEspejoDelPortfolio(capa)', 'void capa'), (c: string) => esEspejo(DEMOS_CSS, TEXTO_TSX, c, ESPEJO_TS))
const medidaDeLaBajada = (texto: string): boolean => /<div id="demos" className="[^"]*">/.test(texto) && /<div ref=\{enElPlano\} style=\{\{ maxWidth: `\$\{MEDIDA_DEL_TEXTO_CH\}ch` \}\}>/.test(texto)
afirmar(medidaDeLaBajada(TEXTO_TSX), '  la medida va en la bajada, como en el Portfolio (en el bloque, el título del tamaño del de Portfolio no entraba y su ventana lo recortaba)')
controlPositivo('  el detector ve la medida en el bloque (la de antes)', TEXTO_TSX.replace(/<div id="demos" className="([^"]*)">/, '<div id="demos" className="$1" style={{ maxWidth: `${MEDIDA_DEL_TEXTO_CH}ch` }}>').replace('<div ref={enElPlano} style={{ maxWidth: `${MEDIDA_DEL_TEXTO_CH}ch` }}>', '<div ref={enElPlano}>'), medidaDeLaBajada)

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · [C2-41e] El abanico, fijo debajo del título: en el plano del título 3D, como su bajada')

const enElPlanoDelTitulo = (capa: string): boolean => /const abanico = useAcompananteDelTitulo<HTMLDivElement>\('demos'\)/.test(capa) && /<div ref=\{abanico\} data-parte="abanico" className="max-escritorio:hidden escritorio:self-stretch">\s*<Biblioteca /.test(capa) && /useAcompananteDelTitulo<HTMLDivElement>\('demos'\)/.test(TEXTO_TSX)
afirmar(enElPlanoDelTitulo(CAPA_TSX), 'el abanico es un acompañante del título «Demos» (como la bajada): la escena lo lleva cada cuadro al plano del título, así queda debajo de él con el paralaje y la órbita, y la perspectiva de cada placa (la mirada) sigue encima')
controlPositivo('  el detector ve el abanico en el plano de la pantalla (el de antes)', CAPA_TSX.replace('<div ref={abanico} data-parte="abanico"', '<div data-parte="abanico"'), enElPlanoDelTitulo)

// ═══════════════════════════════════════════════════════════════════════════
titulo('11 · [C2-41e] La primera pantalla de Demos: la cámara se queda en la pose del Portfolio (sin la franja del piso) y sin el oscurecido')

afirmarIgual([objetivoDeLaPose({ adentro: false, demos: false }), objetivoDeLaPose({ adentro: true, demos: false }), objetivoDeLaPose({ adentro: false, demos: true }), objetivoDeLaPose({ adentro: true, demos: true })], [0, 1, 1, 1], 'el peso de la pose va a 1 con el panel adentro o con Demos a la vista')
/** Del Portfolio a Demos: el panel sale y Demos queda a la vista (`demos`), un segundo de cuadros; devuelve los dos pesos. */
function delPortfolioADemos(conDemos: boolean): { readonly pose: number; readonly oscurecido: number } {
  const e = PORTFOLIO_EN_LA_ESCENA
  Object.assign(e, { adentro: true, demos: false, reducido: false, peso: 1, pesoDelOscurecido: 1, hueco: null, columna: 0.5 })
  e.adentro = false
  e.demos = conDemos
  for (let k = 0; k < 60; k++) mezclarConElPortfolio({ angleDeg: 555, height: 4.5, distance: 20, frameX: -0.85, frameY: 0 }, 1 / 60, 1.6, 50, 6.863, 4.779)
  const r = { pose: e.peso, oscurecido: e.pesoDelOscurecido }
  Object.assign(e, { adentro: false, demos: false, peso: 0, pesoDelOscurecido: 0 })
  return r
}
const enDemosBien = (conDemos: boolean): boolean => {
  const r = delPortfolioADemos(conDemos)
  return r.pose === 1 && r.oscurecido === 0
}
afirmar(enDemosBien(true), 'del Portfolio a Demos la cámara NO se mueve (el peso de la pose queda en 1: el logo en su hueco, la primera pantalla es la sala como en el Portfolio) y el oscurecido del panel se va en su tiempo (0 al segundo)')
controlPositivo('  el detector ve la cámara de antes (vuelve a la pose del scroll: la franja clara del piso abajo, `lote1/13`)', false, enDemosBien)
/** Demos a la vista para una llegada pedida, con o sin escenario de escritorio, con la sección en la mitad de arriba del cuadro o no. */
function aLaVista(pedida: number, escritorio: boolean, enElCuadro: boolean): boolean {
  anunciarDemos(pedida, escritorio)
  seccionDeDemosEnElCuadro(enElCuadro)
  const r = PORTFOLIO_EN_LA_ESCENA.demos
  olvidarDemos()
  return r
}
const vistaBien = (f: typeof aLaVista): boolean => f(0.3, true, true) && f(1, true, true) && !f(0, true, true) && !f(0.3, false, true) && !f(1, true, false)
afirmar(vistaBien(aLaVista), '  la capa lo avisa con la llegada pedida (Demos a la vista desde que el título arranca), sólo con el escenario pegado de escritorio y mientras la sección ocupa la mitad de arriba del cuadro: lo pedido se queda en 1 en Servicios y más abajo, y ahí la cámara vuelve a la del scroll')
controlPositivo('  el detector ve una vista que sólo mira lo pedido (la cámara quedaría clavada en la pose del Portfolio el resto de la página)', (p: number, e: boolean): boolean => p > 0 && e, vistaBien)
const EN_LA_ESCENA_TS = sinComentarios(leer('_secciones/trabajos/demos/enLaEscena.ts'))
const avisa = (capa: string): boolean => /useSeccionDeDemosEnElCuadro\(capa\)/.test(capa) && /rootMargin: MARGEN_DE_LA_VISTA/.test(EN_LA_ESCENA_TS) && MARGEN_DE_LA_VISTA === '0px 0px -50% 0px' && /anunciarDemos\(p\.pedida, conEscenario\.current\)/.test(capa) && /anunciarDemos\(aparicionPedida\(valor, rigida\.current\), conEscenario\.current\)/.test(capa) && /olvidarDemos\(\)/.test(capa) && /conEscenario\.current = el !== null && el\.closest\('\[data-pieza="escenario-del-portfolio"\]'\) !== null/.test(capa)
afirmar(avisa(CAPA_TSX), '  en cada cambio del scroll y al leer el ancho, y se olvida al desmontarse')
controlPositivo('  el detector ve una capa que no avisa con el scroll', CAPA_TSX.replace('anunciarDemos(aparicionPedida(valor, rigida.current), conEscenario.current)', 'void 0'), avisa)

// ═══════════════════════════════════════════════════════════════════════════
titulo('12 · [C2-41e] La carga de cada demo: preconexión con Demos a la vista, el iframe desde el clic y la pantalla de carga como portada')

afirmarIgual(ORIGENES_DE_LAS_DEMOS.length, CATALOGO_DE_DEMOS.length, `una preconexión por demo: ${String(ORIGENES_DE_LAS_DEMOS.length)} orígenes distintos (cada template es su sitio)`)
const ESCENA_DE_DEMOS = EN_LA_ESCENA_TS
const PRECARGA = sinComentarios(leer('_secciones/trabajos/demos/precarga.ts'))
const precargaBien = (escena: string, precarga: string, ventana: string): boolean =>
  /if \(aLaVista\) preconectarLasDemos\(\)/.test(escena) && /if \(preconectadas \|\| typeof document === 'undefined' \|\| conElDefectoDeDemos\('sin-precarga'\)\) return/.test(precarga) &&
  /l\.rel = 'preconnect'/.test(precarga) && /export const MS_DE_INTENCION = 150/.test(precarga) &&
  /\{abierta \|\| temprano \? \(\s*<iframe/.test(ventana) && /const \[temprano\] = useState\(\(\) => !conElDefectoDeDemos\('sin-precarga'\)\)/.test(ventana)
afirmar(precargaBien(ESCENA_DE_DEMOS, PRECARGA, VENTANA), 'con Demos a la vista, una preconexión a cada demo (una vez); con el puntero quieto 150 ms, su documento; y el iframe se monta con el clic y carga escondido durante el Genie (antes, recién con la ventana abierta: 560 ms después)')
controlPositivo('  el detector ve el iframe de antes (recién con la ventana abierta)', VENTANA.replace(/\{abierta \|\| temprano \? \(/, '{abierta ? ('), (v: string) => precargaBien(ESCENA_DE_DEMOS, PRECARGA, v))
controlPositivo('  y una capa a la vista que no preconecta', ESCENA_DE_DEMOS.replace('if (aLaVista) preconectarLasDemos()', ''), (e: string) => precargaBien(e, PRECARGA, VENTANA))

/** Las medidas de un .webp (VP8, VP8L o VP8X), leídas de su cabecera. */
function medidasDelWebp(archivo: string): { readonly ancho: number; readonly alto: number } | null {
  if (!existsSync(archivo)) return null
  const b = readFileSync(archivo)
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null
  const tipo = b.toString('ascii', 12, 16)
  if (tipo === 'VP8 ') return { ancho: b.readUInt16LE(26) & 0x3fff, alto: b.readUInt16LE(28) & 0x3fff }
  if (tipo === 'VP8L') {
    const bits = b.readUInt32LE(21)
    return { ancho: (bits & 0x3fff) + 1, alto: ((bits >> 14) & 0x3fff) + 1 }
  }
  if (tipo === 'VP8X') return { ancho: b.readUIntLE(24, 3) + 1, alto: b.readUIntLE(27, 3) + 1 }
  return null
}
const esDeLaVentana = (r: string): boolean => {
  const m = medidasDelWebp(path.join(process.cwd(), 'public', r))
  return m !== null && m.ancho === MEDIDA_DE_LA_VENTANA.ancho && m.alto === MEDIDA_DE_LA_VENTANA.alto
}
afirmar(CATALOGO_DE_DEMOS.every((d) => esDeLaVentana(d.ventana)) && existsSync(path.join(process.cwd(), 'scripts-carga/demos-portadas-de-carga.ts')), `la portada de cada ventana es una captura de ${String(MEDIDA_DE_LA_VENTANA.ancho)} × ${String(MEDIDA_DE_LA_VENTANA.alto)} (la textura del Genie y lo que se ve mientras carga): en Ethereal, Noir, Skyline y Niche, el primer cuadro de su pantalla de carga; Nexo, la de siempre (\`scripts-carga/demos-portadas-de-carga.ts\`)`)
controlPositivo('  el detector ve una portada que no es de la ventana (la cara del libro, 800 × 1200)', '/demos/ethereal.webp', esDeLaVentana)

// ═══════════════════════════════════════════════════════════════════════════
titulo('13 · [C2-41e] La bajada nueva (05-TEXTOS.md, tal cual), una sola para los dos anchos')

const BAJADA = 'Una muestra de lo que somos capaces de hacer. Se adaptan a cualquier rubro: si te gusta alguna, la hacemos tuya. Tocá una para explorarla.'
const bajadaBien = (t: { readonly parrafo: string }, texto: string): boolean => t.parrafo === BAJADA && /\{TEXTO_DE_DEMOS\.parrafo\}<\/Cuerpo>/.test(texto) && !/enEscritorio|enMovil/.test(texto)
afirmar(bajadaBien(TEXTO_DE_DEMOS, TEXTO_TSX), `la bajada de Demos es la de Valentino, sin frases por ancho: «${BAJADA}»`)
controlPositivo('  el detector ve la bajada de antes', { parrafo: 'Son sitios de ejemplo hechos por develOP, con clientes ficticios. Muestran lo que se puede hacer y se adaptan a cualquier rubro.' }, (t: { readonly parrafo: string }) => bajadaBien(t, TEXTO_TSX))


cerrar('s84 · Demos (B5)')
