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
import { CATALOGO_DE_DEMOS, TEXTO_DE_DEMOS } from '../../_secciones/trabajos/demos/catalogo'
import { aparicionPedida } from '../../_secciones/trabajos/demos/entrada'
import { PARADA_DE_DEMOS, llegadaEnCurso, reglaDeLaParada } from '../../_secciones/trabajos/demos/parada'
import { PANTALLAS_POR_PASO, mostradoDeDemos, pxDeLaSeccion, pxDelScroll } from '../../_secciones/trabajos/portfolio/pasos'
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
titulo('5 · El abanico, más grande: al menos el 85 % de la columna del título a 1440 y a 1024, sin salirse de ella')

const DEMOS_CSS = leer('_estilos/demos.css').replace(/\/\*[\s\S]*?\*\//g, '')
/** Lo que el estante declara (los valores de la hoja, no copias). */
function medidasDelEstante(css: string): { readonly ancho: number; readonly giro: number; readonly perspectiva: number; readonly solape: number } {
  const ancho = Number(/--libro-ancho: ([\d.]+)%;/.exec(css)?.[1] ?? Number.NaN)
  const giro = Number(/--libro-giro: ([\d.]+)deg;/.exec(css)?.[1] ?? Number.NaN)
  // La perspectiva en pasos del espaciado (`--spacing-8`: 2 rem, 32 px).
  const perspectiva = 32 * Number(/--libro-perspectiva: calc\(var\(--spacing-8\) \* ([\d.]+)\);/.exec(css)?.[1] ?? Number.NaN)
  const solape = Number(/margin-inline-start: min\(\s*calc\(var\(--libro-ancho\) \* (-[\d.]+)\),\s*calc\(\(100% - var\(--libro-ancho\)\) \/ \(var\(--libros\) - 1\) - var\(--libro-ancho\)\)\s*\);/.exec(css)?.[1] ?? Number.NaN)
  return { ancho, giro, perspectiva, solape }
}
/**
 * Lo que se VE del abanico en una columna de `W` px, sobre su ancho: cada placa girada `giro` sobre su centro y vista por su propia
 * cámara (la perspectiva desde su centro: `perspective()` en su transformada), en el lugar que le da el solape de la hoja. Sin la mirada
 * (el mouse quieto). Devuelve la fracción y si se sale de la columna.
 */
function abanicoEn(W: number, m: { readonly ancho: number; readonly giro: number; readonly perspectiva: number; readonly solape: number }, n = 5): { readonly fraccion: number; readonly adentro: boolean } {
  const w = (W * m.ancho) / 100
  const paso = w + Math.min(w * m.solape, (W - w) / (n - 1) - w)
  const a = w / 2
  const t = (m.giro * Math.PI) / 180
  const d = m.perspectiva
  const izquierda = a + (-a * Math.cos(t) * d) / (d - a * Math.sin(t))
  const derecha = a + (n - 1) * paso + (a * Math.cos(t) * d) / (d + a * Math.sin(t))
  return { fraccion: (derecha - izquierda) / W, adentro: izquierda >= 0 && derecha <= W + 0.5 }
}
/** La columna del título en cada ancho: el envoltorio (32 px de cada lado) y la grilla de dos columnas con 32 px en el medio. */
const columnaEn = (ancho: number): number => (ancho - 2 * 32 - 32) / 2
const CAPA_TSX = sinComentarios(leer('_secciones/trabajos/demos/CapaDeDemos.tsx'))
const grillaDeSiempre = /claseDeContenido="grid h-full grid-cols-2 items-center gap-8 /.test(CAPA_TSX) && /px-\[var\(--pad-lateral-compacto\)\]/.test(leer('_componentes/layout/Envoltorio.tsx')) && /--pad-lateral-compacto: 32px;/.test(readFileSync(path.join(process.cwd(), 'src/app/theme-develop.css'), 'utf8'))
const masGrande = (css: string): boolean => [1440, 1024].every((ancho) => {
  const r = abanicoEn(columnaEn(ancho), medidasDelEstante(css))
  return r.fraccion >= 0.85 && r.adentro
})
const enCadaAncho = [1440, 1024].map((ancho) => `${String(ancho)}: ${(abanicoEn(columnaEn(ancho), medidasDelEstante(DEMOS_CSS)).fraccion * 100).toFixed(1)} % de ${String(columnaEn(ancho))} px`).join(' · ')
afirmar(grillaDeSiempre && masGrande(DEMOS_CSS), `el abanico se ve en al menos el 85 % de la columna del título y no se sale de ella (${enCadaAncho}); la placa, un ${String(medidasDelEstante(DEMOS_CSS).ancho)} % de la columna`)
const DE_ANTES = DEMOS_CSS.replace('--libro-ancho: 36%;', '--libro-ancho: 23.8095%;').replace('--libro-perspectiva: calc(var(--spacing-8) * 40);', '--libro-perspectiva: calc(var(--spacing-8) * 30);')
const deAntesA1440 = (abanicoEn(columnaEn(1440), medidasDelEstante(DE_ANTES)).fraccion * 100).toFixed(1)
controlPositivo(`  el detector ve el estante de antes (placas de 160 px: a 1440 se veía en el ${deAntesA1440} % de la columna)`, DE_ANTES, masGrande)
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

cerrar('s84 · Demos (B5)')
