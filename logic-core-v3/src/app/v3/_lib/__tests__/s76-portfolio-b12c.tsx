/**
 * [B1.2c] s76 · LOS AJUSTES DEL FRENO DE B1.2b (`docs/rediseno/SPRINT-B1-PORTFOLIO.md` §13), sin navegador: el orden de la salida y la
 * entrada, los rótulos de la ficha con los acentos claros (P-H2), la transición entre proyectos, la rueda y el hover (los cuatro casos
 * de Valentino), el formulario corto de «la tuya», el «?» que se arma, las barras y la pista de la tablet, y el título más grande que
 * no se corta. (La cámara de frente y el título en el plano del logo: §9, §9b y §9c de `s76-portfolio-escena.tsx`.) Cada afirmación
 * con su control positivo. El arnés de carga mide la rueda en el sitio (`scripts-carga/rueda.ts`).
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { HOME_INTRO_PHASES } from '@/components/layout/home-intro/introTimeline'

import { CASOS_DE_LA_RUEDA, NOMBRES_DE_LOS_PASOS, laRuedaAnduvo } from '../../../../../scripts-carga/rueda'

import { RESULTADO } from '../formularios/gracias'
import { REBOTE_DEL_PIE } from '../escena/final/reboteDelPie'
import { PERSECUCION_DEL_PESO_S } from '../escena/portfolioEnLaEscena'
import { LENTOS } from '../titulos3d/repeticiones'
import { marcar } from '../../_secciones/_invariantes/render'
import { CLASES_DE_ACENTO, FORMAS_PERMITIDAS_SOBRE_OSCURO, FORMAS_PROHIBIDAS_SOBRE_CLARO, idDelServicioLlamado } from '../../_secciones/_contrato/acento'
import { WHATSAPP } from '../../_secciones/cierre/contacto'
import { CORRIMIENTO } from '../../_chrome/barra/corrimiento'
import { validarContacto } from '../../_chrome/contacto/enviarContacto'
import { PROYECTOS } from '../../_secciones/trabajos/proyectos'
import { activaElHover } from '../../_secciones/trabajos/portfolio/Acordeon'
import { PRESENCIA_DEL_ENCABEZADO } from '../../_secciones/trabajos/portfolio/EncabezadoDelPortfolio'
import { CLASE_DEL_ROTULO, Ficha } from '../../_secciones/trabajos/portfolio/Ficha'
import { CAMPOS_DE_LA_TUYA, datosDelFormulario } from '../../_secciones/trabajos/portfolio/FormularioDeLaTuya'
import { ADENTRO, AFUERA, ORDEN, duracionDeLaSalida, recorridoDelOrden, type Orden } from '../../_secciones/trabajos/portfolio/orden'
import { GESTO_QUIETO, RUEDA, destinoDeLaRueda, gestoDeLaRueda, recorridoDeLaRueda, type DestinoDeLaRueda, type GestoDeLaRueda } from '../../_secciones/trabajos/portfolio/rueda'
import { SignoQueSeArma } from '../../_secciones/trabajos/portfolio/SignoDePregunta'
import { SIGNO, alturaDelPunto, duracionDelPunto } from '../../_secciones/trabajos/portfolio/signo'
import { CLASES_DE_LA_TIRA } from '../../_secciones/trabajos/portfolio/Tira'
import { ANCHO_DEL_TITULO_EN_EM, CLASE_DEL_TITULAR, CRECIMIENTO_DEL_TITULO } from '../../_secciones/trabajos/portfolio/tipografia'
import { TRANSICION, avanzarTransicion, muestraSuContenido, pedirTira, quietaEn, type TransicionDeLasTiras } from '../../_secciones/trabajos/portfolio/transicion'
import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'

const RAIZ = process.cwd()
const V3 = path.join(RAIZ, 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const PORTFOLIO = '_secciones/trabajos/portfolio'

/** La razón de contraste WCAG de dos hex. */
function contraste(a: string, b: string): number {
  const lin = (c: number): number => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4)
  const y = (h: string): number => {
    const n = Number.parseInt(h.slice(1), 16)
    return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  }
  const [p, q] = [y(a), y(b)].sort((m, n) => n - m)
  return (p + 0.05) / (q + 0.05)
}

export function afirmarB12c(): void {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2c · 19 · [B1.2d] El orden en cuatro piezas (A10): la cámara, el título, la barra y el panel cuando el título va por el 80 %; al salir, al revés')

  const comoTexto = (r: readonly { readonly estado: Orden; readonly enS: number }[]): string[] =>
    r.map(({ estado: o, enS }) => `${o.camara ? 'C' : 'c'}${o.encabezado ? 'E' : 'e'}${o.barra ? 'B' : 'b'}${o.panel ? 'P' : 'p'}@${enS.toFixed(2)}`)
  const conEl3d = LENTOS.llegadaDePortfolioS
  /** El criterio de A10: lo que llevaba recorrido el título (0…1) cuando arrancó el panel. */
  const delTituloAlPanel = (r: readonly { readonly estado: Orden; readonly enS: number }[], tituloS: number): number => {
    const t = r.find((x) => x.estado.encabezado)?.enS ?? Number.NaN
    const p = r.find((x) => x.estado.panel)?.enS ?? Number.NaN
    return (p - t) / tituloS
  }
  const entrada = recorridoDelOrden(AFUERA, ADENTRO, conEl3d)
  afirmarIgual(comoTexto(entrada), ['Cebp@0.00', 'CEbp@0.70', 'CEBp@1.62', 'CEBP@1.82'], `la entrada: la cámara (${String(ORDEN.camaraS)} s, así el título queda de frente en el plano del logo), el título, la barra (su primer tiempo, ${String(ORDEN.barraPrimerTiempoS)} s, antes del panel: [B1.2d] A2.2) y el panel`)
  // [A2.2] El criterio: la contracción de la píldora (su segundo tiempo, que arranca cuando termina el primero) a ±50 ms de la entrada del panel.
  const contraccionAlPanel = (r: readonly { readonly estado: Orden; readonly enS: number }[]): number => Math.abs((r.find((x) => x.estado.barra)?.enS ?? Number.NaN) + ORDEN.barraPrimerTiempoS - (r.find((x) => x.estado.panel)?.enS ?? Number.NaN))
  afirmar(delTituloAlPanel(entrada, conEl3d) >= 0.8 - 1e-9 && contraccionAlPanel(entrada) <= 0.05 && ORDEN.barraPrimerTiempoS * 2 === ORDEN.barraS, '  el panel arranca con el título al 80 % de su llegada (o más), A LA PAR de la contracción de la píldora (A2.2: ±50 ms)', `${(delTituloAlPanel(entrada, conEl3d) * 100).toFixed(1)} % · ${(contraccionAlPanel(entrada) * 1000).toFixed(0)} ms`)
  controlPositivo('  el detector ve el orden de B1.2d A (los dos tiempos de la barra antes del panel: la contracción iba 200 ms antes)', [{ estado: { camara: true, encabezado: true, barra: true, panel: false }, enS: 1.42 }, { estado: ADENTRO, enS: 1.82 }], (r: readonly { readonly estado: Orden; readonly enS: number }[]) => contraccionAlPanel(r) <= 0.05)
  controlPositivo('  el detector ve el orden de B1.2c (el panel entraba con la cámara, antes que el título)', [{ estado: { camara: true, encabezado: false, barra: false, panel: true }, enS: 0 }, { estado: ADENTRO, enS: 0.7 }], (r: readonly { readonly estado: Orden; readonly enS: number }[]) => delTituloAlPanel(r, conEl3d) >= 0.8 - 1e-9)
  const salida = recorridoDelOrden(ADENTRO, AFUERA, conEl3d)
  afirmarIgual(comoTexto(salida), ['CEBp@0.00', 'CEbp@0.00', 'Cebp@0.42', 'cebp@1.82'], 'la salida, al revés: el panel y con él la barra (A2.2: la expansión de la píldora a la par de la salida del panel, la contracción después), la caída del título cuando al panel le falta el mismo 20 % y la cámara con el título caído entero')
  const expansionALaSalida = (r: readonly { readonly estado: Orden; readonly enS: number }[]): number => Math.abs((r.find((x) => !x.estado.barra)?.enS ?? Number.NaN) - (r.find((x) => !x.estado.panel)?.enS ?? Number.NaN))
  controlPositivo('  el detector ve la salida de B1.2d A (la barra volvía con el panel ya afuera, 700 ms después)', [{ estado: { camara: true, encabezado: true, barra: true, panel: false }, enS: 0 }, { estado: { camara: true, encabezado: false, barra: true, panel: false }, enS: 0.42 }, { estado: { camara: true, encabezado: false, barra: false, panel: false }, enS: 0.7 }], (r: readonly { readonly estado: Orden; readonly enS: number }[]) => expansionALaSalida(r) <= 0.05)
  afirmar(expansionALaSalida(salida) <= 0.05, '  (la expansión de la píldora arranca a ±50 ms de la salida del panel)')
  // Lo pedido se da vuelta a mitad de camino: cada pieza recuerda cuándo cambió, así que el panel nunca se adelanta al 80 % del título.
  const recien = recorridoDelOrden({ camara: true, encabezado: true, barra: false, panel: false }, ADENTRO, conEl3d, false, { camara: -0.7, encabezado: 0, barra: -Infinity, panel: -Infinity })
  afirmarIgual(comoTexto(recien), ['CEBp@0.92', 'CEBP@1.12'], '  con el título recién llegado, la barra y el panel esperan lo suyo desde ese momento (no desde la vuelta)')
  controlPositivo('  el detector ve una vuelta que adelanta el panel (B1.2c: el orden sin relojes por pieza)', ['CEBP@0.00'], (r: string[]) => JSON.stringify(r) === JSON.stringify(['CEBp@0.92', 'CEBP@1.12']))
  afirmarIgual(comoTexto(recorridoDelOrden({ camara: true, encabezado: true, barra: false, panel: false }, AFUERA, conEl3d, false, { camara: -0.7, encabezado: -0.3, barra: -Infinity, panel: -Infinity })), ['Cebp@0.00', 'cebp@1.40'], '  y si se da vuelta para afuera, el título cae desde ahí y la cámara vuelve cuando terminó de caer')
  afirmar(ORDEN.camaraS === PERSECUCION_DEL_PESO_S && ORDEN.panelS === 0.7 && /duration-700/.test(leer(`${PORTFOLIO}/EscenarioDelPortfolio.tsx`)) && ORDEN.barraS === (2 * CORRIMIENTO.tiempoMs) / 1000, '  las esperas son las de la escena: la persecución de la cámara, la transición del panel (700 ms) y los dos tiempos de la barra')
  afirmarIgual(comoTexto(recorridoDelOrden(ADENTRO, AFUERA, conEl3d, true)), ['CEBp@0.00', 'CeBp@0.00', 'Cebp@0.00', 'cebp@0.00'], '  con movimiento reducido, de una')
  // Abajo de 1024 no hay título 3D: lo que llega y cae es el del DOM (la presencia, 0,6 s).
  afirmarIgual(comoTexto(recorridoDelOrden(ADENTRO, AFUERA, PRESENCIA_DEL_ENCABEZADO.s)), ['CEBp@0.00', 'CEbp@0.00', 'Cebp@0.58', 'cebp@1.18'], '  sin el título 3D (abajo de 1024), con los 0,6 s del DOM')
  afirmar(Math.abs(duracionDeLaSalida(conEl3d) - 1.82) < 1e-9, '  la salida de la rueda (a Demos y hacia arriba) dura lo que se ve: el panel y la caída entera del título')
  const usePortfolio = sinComentarios(leer(`${PORTFOLIO}/usePortfolio.ts`))
  const escenario = sinComentarios(leer(`${PORTFOLIO}/EscenarioDelPortfolio.tsx`))
  const cableado = (u: string, e: string): boolean =>
    /const tituloS = useTituloListo\('portfolio'\) \? LENTOS\.llegadaDePortfolioS : PRESENCIA_DEL_ENCABEZADO\.s/.test(u) &&
    /const pedidoDelOrden = \{ camara: adentro, encabezado: historias \? \(fase === 'antes' && enCuadro\) \|\| adentro : adentro, barra: adentro && !historias, panel: adentro \}/.test(u) &&
    /useOrdenDeLaEscena\(pedidoDelOrden, tituloS, reducido\)/.test(u) && /PORTFOLIO_EN_LA_ESCENA\.adentro = orden\.camara/.test(u) && /useBarraDelPortfolio\(caja, orden\.barra\)/.test(u) &&
    /!vivo\.panel && 'translate-x-full'/.test(e) && /<EncabezadoDelPortfolio seccion=\{seccion\} adentro=\{vivo\.encabezado\}/.test(e)
  afirmar(cableado(usePortfolio, escenario), '  y así se cablea: la cámara (con el oscurecido de `PORTFOLIO_EN_LA_ESCENA`), el encabezado, la barra y el panel salen del orden, no del paso')
  controlPositivo('  el detector ve la cámara atada al panel (B1.2c)', usePortfolio.replace('PORTFOLIO_EN_LA_ESCENA.adentro = orden.camara', 'PORTFOLIO_EN_LA_ESCENA.adentro = orden.panel'), (u: string) => cableado(u, escenario))

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2c · 20 · Los rótulos de la ficha: Chivo Mono, mayúsculas, con interletrado, un paso más grandes y en el acento claro (P-H2)')

  const ficha = marcar(<Ficha proyecto={PROYECTOS[0]} visible reducido desde={2} />, { anima: false })
  const rotulos = [...ficha.matchAll(/<dt>([\s\S]*?)<\/dt>/g)].map((m) => m[1])
  const rotuloNuevo = (r: string): boolean => /class="[^"]*\bfont-codigo\b[^"]*\buppercase\b[^"]*\btext-acento-claro\b/.test(r) && /data-nivel="caption"/.test(r) && /tracking-micro/.test(r)
  afirmar(rotulos.length === 6 && rotulos.every(rotuloNuevo) && CLASE_DEL_ROTULO === 'font-codigo uppercase text-acento-claro', 'cada rótulo («Fecha», «El problema», «Qué hicimos», «Lo que resolvimos»…) en Chivo Mono, mayúsculas, el interletrado positivo del sistema, `caption` (un paso arriba de `micro`) y el acento claro', `${String(rotulos.length)} rótulos`)
  controlPositivo('  el detector ve el rótulo de B1.2b (`micro`, la tinta al 60 %)', '<span data-nivel="micro" class="text-micro text-tinta/60">Fecha</span>', rotuloNuevo)
  afirmar(/data-pieza="ficha" data-servicio="web"/.test(ficha) && idDelServicioLlamado('Desarrollo web') === 'web' && idDelServicioLlamado('Nada') === null, '  el acento es el del servicio del proyecto (`data-servicio`, derivado de su dato): los tres son de web')
  const tema = readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8')
  const valor = (t: string): string | undefined => new RegExp(`${t}:\\s*(#[0-9A-Fa-f]{6})`).exec(tema)?.[1]
  const claros = ['web', 'ia-automatizacion', 'software'].map((s) => valor(`--color-acento-${s}-claro`) ?? '?')
  afirmarIgual(claros, ['#8FC0E8', '#7FCBA4', '#AFA0E8'], 'P-H2: los tres acentos claros entran al tema (el de web, #8FC0E8, el que pidió Valentino)')
  afirmar(claros.every((h) => contraste(h, '#0E0E0E') >= 4.5) && claros.every((h) => contraste(h, '#F7F7F5') < 4.5), '  sobre el negro de la sala pasan AA como texto; sobre papel no (sólo van sobre fondo invertido)', claros.map((h) => `${contraste(h, '#0E0E0E').toFixed(2)}:1`).join(' · '))
  controlPositivo('  la cuenta ve el sólido de web como texto sobre oscuro (2,71:1)', '#1D5B8F', (h: string) => contraste(h, '#0E0E0E') >= 4.5)
  const contextual = (css: string): boolean => /--color-acento-claro: var\(--color-acento-web-claro\);/.test(css) && ['web', 'ia-automatizacion', 'software'].every((s) => new RegExp(`\\[data-servicio="${s}"\\] \\{[^}]*--color-acento-claro: var\\(--color-acento-${s}-claro\\);`).test(css))
  afirmar(contextual(tema), '  por su ALIAS (`--color-acento-claro`, el de web por defecto) que los tres `[data-servicio]` retiñen: el mismo mecanismo que el acento')
  controlPositivo('  el detector ve un alias que no se retiñe', tema.replace(/--color-acento-claro: var\(--color-acento-software-claro\);/, ''), contextual)
  afirmar(FORMAS_PERMITIDAS_SOBRE_OSCURO.includes(CLASES_DE_ACENTO.textoClaro) && !FORMAS_PERMITIDAS_SOBRE_OSCURO.includes(CLASES_DE_ACENTO.texto) && FORMAS_PROHIBIDAS_SOBRE_CLARO.includes('text-acento-claro'), '  y la regla de `acento.ts`: sobre fondo invertido el texto de acento es el claro (y sólo él); sobre claro, el claro no va')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2c · 21 · La transición entre proyectos: la salida completa, un respiro y la entrada')

  /** Corre la transición: los pedidos en orden (uno por tic) y después que las fases terminen; la historia de qué tira muestra su contenido. */
  const correr = (desde: number, pedidos: readonly number[], pedir = pedirTira, avanzar = avanzarTransicion): { readonly contenido: number[]; readonly fases: string[] } => {
    let t: TransicionDeLasTiras = quietaEn(desde)
    const contenido: number[] = [desde]
    const fases: string[] = [t.fase]
    const anotar = (): void => {
      fases.push(`${t.fase}:${String(t.ancha)}`)
      const muestra = [0, 1, 2, 3].find((i) => muestraSuContenido(t, i))
      if (muestra !== undefined && contenido[contenido.length - 1] !== muestra) contenido.push(muestra)
    }
    for (const p of pedidos) {
      t = pedir(t, p, false)
      anotar()
    }
    for (let k = 0; k < 6 && t.fase !== 'quieta'; k += 1) {
      t = avanzar(t)
      anotar()
    }
    return { contenido, fases }
  }
  afirmarIgual(correr(0, [1]).fases, ['quieta', 'saliendo:0', 'abriendo:1', 'respiro:1', 'quieta:1'], 'un cambio: el contenido de la que se va se apaga (la tira sigue abierta), las tiras se reacomodan vacías, un respiro, y recién ahí entra la siguiente')
  afirmar(TRANSICION.salidaS >= 0.15 && TRANSICION.respiroS >= 0.15 && TRANSICION.respiroS <= 0.25 && TRANSICION.aperturaS === 0.5 && /duration-500/.test(CLASES_DE_LA_TIRA.base), `  los tiempos: la salida ${String(TRANSICION.salidaS * 1000)} ms, el reacomodo el de la tira (500 ms), el respiro ${String(TRANSICION.respiroS * 1000)} ms (~150–250)`)
  afirmarIgual(correr(0, [1, 2, 3]).contenido, [0, 3], 'con un scroll rápido que cruza varios: va al último, con UNA salida y UNA entrada (ni Esquina ni Banú asoman)')
  const salidas = (f: string[]): number => f.filter((x, i) => x.startsWith('saliendo') && !(f[i - 1] ?? '').startsWith('saliendo')).length
  afirmarIgual(salidas(correr(1, [2, 3, 0]).fases), 1, '  y aunque el destino cambie en el medio, sale una sola vez')
  const deB12b = (t: TransicionDeLasTiras, p: number): TransicionDeLasTiras => quietaEn(p)
  const pisa = (r: { readonly fases: string[] }): boolean => r.fases.includes('saliendo:0') && r.fases.includes('respiro:1')
  afirmar(pisa(correr(0, [1])), '  la siguiente entra recién después de que la anterior se fue')
  controlPositivo('  el detector ve la apertura de B1.2b, que pisaba el cierre (el cambio de una)', correr(0, [1], deB12b), pisa)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2c · 22 · El hover y la rueda: el proyecto activo manda (los cuatro casos)')

  const nombre = (d: DestinoDeLaRueda): string => (d.tipo === 'paso' ? ['El Garage', 'Esquina', 'Banú', 'la tuya'][d.indice] : d.tipo === 'demos' ? 'Demos' : 'arriba')
  afirmarIgual(nombre(recorridoDeLaRueda(0, 2, [1])), 'la tuya', 'hover en Banú + una muesca hacia abajo → «la tuya», no Demos')
  afirmarIgual(nombre(recorridoDeLaRueda(2, 0, [1])), 'Esquina', 'hover en El Garage + una muesca hacia abajo → Esquina')
  afirmarIgual(nombre(recorridoDeLaRueda(0, 1, [-1])), 'El Garage', 'hover en Esquina + una muesca hacia arriba → El Garage')
  afirmarIgual([nombre(destinoDeLaRueda(3, 1)), nombre(destinoDeLaRueda(0, -1)), nombre(recorridoDeLaRueda(0, null, [1, 1, 1, 1]))], ['Demos', 'arriba', 'Demos'], '  después de «la tuya» sigue a Demos; antes del primero sale hacia arriba; de a un proyecto, en orden')
  // Con el mouse quieto la rueda nunca reactiva un lomo: el hover queda inerte desde donde estaba el puntero cuando la rueda tomó el control.
  const lomo = { x: 900, y: 400, indice: 2, fino: true, mueve: true }
  afirmar(!activaElHover(lomo, 3, true, null, { x: 900, y: 400 }) && !activaElHover({ ...lomo, x: 902, y: 401 }, 3, true, null, { x: 900, y: 400 }) && activaElHover({ ...lomo, x: 905 }, 3, true, null, { x: 900, y: 400 }), 'con el mouse quieto (o corrido menos de 4 px) la rueda nunca reactiva un lomo; moviéndolo de verdad, el hover vuelve')
  controlPositivo('  el detector ve el hover de B1.2b (sin la inercia de la rueda)', (e: typeof lomo, tira: number) => e.indice !== tira, (f: (e: typeof lomo, tira: number) => boolean) => !f(lomo, 3))
  // El arnés lo encontró: cargando con el mouse quieto sobre el panel, los lomos que llegaban debajo (`pointerover`) se activaban solos.
  const acordeonDelHover = sinComentarios(leer(`${PORTFOLIO}/Acordeon.tsx`))
  // [B1.2d] Sin la base sembrada con el primer `pointerover` (la última vuelta de B1.3): entrar a un lomo desde la columna y quedarse no lo activaba.
  const sinBaseSembrada = (c: string): boolean => /const mueve = e\.type === 'pointermove'/.test(c) && !/if \(activacion\.current === null\) activacion\.current = puntero\.current/.test(c)
  afirmar(!activaElHover({ ...lomo, mueve: false }, 3, true, null, null) && activaElHover(lomo, 3, true, null, null) && sinBaseSembrada(acordeonDelHover), 'un lomo que llega debajo del mouse quieto (la carga, el scroll: `pointerover` sin `pointermove`) no se activa; [B1.2d] y entrar a un lomo desde la columna lo activa aunque el mouse se quede ahí (sin la base sembrada)')
  controlPositivo('  el detector ve la base sembrada de B1.3', `${acordeonDelHover}\nif (activacion.current === null) activacion.current = puntero.current`, sinBaseSembrada)
  controlPositivo('  el detector ve el hover de antes (el `pointerover` activaba)', (e: typeof lomo, tira: number) => e.indice !== tira, (f: (e: typeof lomo, tira: number) => boolean) => !f({ ...lomo, mueve: false }, 3))
  const muescas = (eventos: readonly (readonly [number, number])[], ocupado: (t: number) => boolean = () => false): number => {
    let g: GestoDeLaRueda = GESTO_QUIETO
    let pasos = 0
    for (const [dy, t] of eventos) {
      const r = gestoDeLaRueda(g, dy, t, ocupado(t))
      g = r.gesto
      if (r.sentido !== null) pasos += 1
    }
    return pasos
  }
  const trackpad = Array.from({ length: 60 }, (_, k) => [6, 1000 + k * 16] as const)
  afirmarIgual([muescas([[100, 1000]]), muescas(trackpad), muescas([[100, 1000], [100, 1400]]), muescas([[100, 1000], [100, 1100]]), muescas([[100, 1000], [100, 1400]], (t) => t > 1000 && t < 1500)], [1, 1, 2, 1, 1], `un gesto es UN paso: una muesca, un deslizamiento del trackpad con su inercia, dos muescas separadas son dos, una ráfaga es una (quieto ${String(RUEDA.quietoMs)} ms) y con un salto en vuelo no cuenta`)
  controlPositivo('  el detector ve la rueda de a píxeles (cada evento, un paso)', (eventos: readonly (readonly [number, number])[]) => eventos.length, (f: (e: readonly (readonly [number, number])[]) => number) => f(trackpad) === 1)
  const rueda = sinComentarios(leer(`${PORTFOLIO}/useRuedaDelPortfolio.ts`))
  const tomaLaRueda = (c: string): boolean => /window\.addEventListener\('wheel', alGirar, \{ passive: false, capture: true \}\)/.test(c) && /paraLenis\.lenisStopPropagation = true/.test(c) && /if \(e\.cancelable\) e\.preventDefault\(\)/.test(c) && /hasAttribute\('data-lenis-prevent'\)/.test(c)
  afirmar(tomaLaRueda(rueda), '  la rueda se toma en la captura, antes de Lenis (que lee `lenisStopPropagation`) y del navegador (`preventDefault`); lo de un diálogo no se toca')
  controlPositivo('  el detector ve la rueda pasiva (Lenis y el navegador correrían la página)', rueda.replace('passive: false', 'passive: true'), tomaLaRueda)
  const lenis = readFileSync(path.join(RAIZ, 'node_modules/lenis/dist/lenis.mjs'), 'utf8')
  afirmar(/if \(event\.lenisStopPropagation\) return;/.test(lenis), '  y el Lenis instalado respeta la marca (`if (event.lenisStopPropagation) return`)')
  // El arnés lo mide en el sitio (`scripts-carga/rueda.ts`, al final de cada tanda): los cuatro casos y «la tuya» → Demos, el paso
  // muestreado cuadro a cuadro con el mouse quieto.
  afirmarIgual(CASOS_DE_LA_RUEDA.map((c) => `${String(c.hover)}${c.muescas.map((m) => (m > 0 ? '↓' : '↑')).join('')}→${NOMBRES_DE_LOS_PASOS[c.espera]}`), ['banu-scents↓→la tuya', 'el-garage↓→Esquina', 'esquina-estudio↑→El Garage', 'esquina-estudio↓↓→la tuya', 'null↓→Demos'], '  el arnés corre los cuatro casos (y «la tuya» → Demos) en el sitio')
  afirmar(laRuedaAnduvo(CASOS_DE_LA_RUEDA[0], [2, 2, 3, 3]) && /const ok = laRuedaAnduvo\(caso, pasos\)/.test(readFileSync(path.join(RAIZ, 'scripts-carga/estres.ts'), 'utf8')), '  y su cuenta: termina donde tiene que terminar y el paso sólo avanza en el sentido de la rueda')
  controlPositivo('  la cuenta ve un lomo que se reactiva con el mouse quieto (vuelve a Banú)', [2, 3, 2, 3], (pasos: number[]) => laRuedaAnduvo(CASOS_DE_LA_RUEDA[0], pasos))
  controlPositivo('  y la rueda que sigue de largo hasta Demos (B1.2b)', [2, 3, 4], (pasos: number[]) => laRuedaAnduvo(CASOS_DE_LA_RUEDA[0], pasos))
  // [B1.2d] Los mandos salieron de `usePortfolio.ts` (`useMandosDelPortfolio.ts`, la regla de las 300 líneas).
  const mandos = sinComentarios(leer(`${PORTFOLIO}/useMandosDelPortfolio.ts`))
  const atrapa = (c: string): boolean => /if \(destino > scrollDelPx\(hasta, medida\.tope, medida\.alto\) \|\| destino < scrollDelPx\(desde, medida\.tope, medida\.alto\)\) saltar\(vistaDelPaso\(paso\)\.tira, false, true\)/.test(c) && /gesto = \{ acumulado: 0, ultimo: ahora, disparado: true \}/.test(rueda)
  afirmar(atrapa(mandos), '  la entrada del panel atrapa la inercia de un golpe fuerte (Lenis yendo más allá: se frena en el proyecto en que entra) y ese mismo gesto no da un paso')
  controlPositivo('  el detector ve la entrada sin atrapar', mandos.replace('saltar(vistaDelPaso(paso).tira, false, true)', 'undefined'), atrapa)
  // El arnés lo encontró (la pila de `PILAS=1`): el salto inmediato llega en el acto, y su llegada pedía el vuelo antes de que existiera.
  const vueloAntesDelSalto = (c: string): boolean =>
    /v\.enVuelo\.current = \{ id, destino: px, y, marca, cancelar: soltar \}\s*const detener = saltarA\(y, ms, soltar, marca\)/.test(c) && /if \(v\.enVuelo\.current\?\.id !== id\) return/.test(c) && !/cancelar: saltarA\(/.test(c)
  afirmar(vueloAntesDelSalto(sinComentarios(leer(`${PORTFOLIO}/medida.ts`))) && /volarAlPx\(\{ caja, enVuelo, actual, setPaso \}, px, reducido \? 0 : ms, scrollExtra\)/.test(usePortfolio), '  el salto en silencio (el hover, el clic, el tap) no pide su vuelo antes de que exista: el vuelo se arma y después se lanza el salto (el arnés: «Cannot access before initialization» en cada hover, y la marca de vuelo puesta para siempre)')
  controlPositivo('  el detector ve el vuelo armado adentro de su propio inicializador (B1.2b)', 'const vuelo = {\n  destino: px,\n  cancelar: saltarA(y, ms, () => { if (enVuelo.current !== vuelo) return }),\n}\nenVuelo.current = vuelo', vueloAntesDelSalto)
  // [F2] Reemplazada por la spec: además, con el panel ya entrado (`entradaLista`; su control está en §40 de `s76-portfolio-a2.tsx`).
  afirmar(/return v\.fase === 'adentro' && pegado\(caja\.current\) && !conDialogo\(caja\.current\) && \(entradaLista\.current \|\| !conLaTrampa\) \? v\.tira : null/.test(mandos) && /else if \(d\.tipo === 'demos'\) irAlPx\(pxDeLaSeccion\(PANTALLAS_POR_PASO\), salidaMs, -2\)/.test(mandos) && /const salidaMs = duracionDeLaSalida\(tituloS\) \* 1000/.test(mandos), '  manda sólo con el panel adentro, pegado y sin un diálogo; a Demos va al final del pin (como el viaje del menú), con el tiempo de la salida en orden')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2c · 23 · «La tuya»: el formulario corto (la validación, el envío y los textos del contacto) y WhatsApp')

  afirmarIgual(CAMPOS_DE_LA_TUYA.map((c) => c.rotulo), ['Nombre', 'WhatsApp o email', '¿Qué necesitás?'], 'tres campos: el nombre (el rótulo del contacto), «WhatsApp o email» y «¿Qué necesitás?»')
  afirmarIgual(datosDelFormulario({ nombre: 'Ana', medio: 'ana@tuempresa.com', mensaje: 'Una tienda' }), { intereses: [], presupuesto: '', empresa: '', nombre: 'Ana', medio: 'ana@tuempresa.com', mensaje: 'Una tienda' }, '  viajan con el MISMO envío del contacto (`enviarContacto`, origen del panel): lo que no se pregunta, vacío')
  afirmar(validarContacto(datosDelFormulario({ nombre: '', medio: '', mensaje: '' })).medio !== undefined && Object.keys(validarContacto(datosDelFormulario({ nombre: '', medio: '+54 9 381 415 4708', mensaje: '' }))).length === 0, '  y con su validación: el único obligatorio es el WhatsApp o el email')
  const formulario = sinComentarios(leer(`${PORTFOLIO}/FormularioDeLaTuya.tsx`))
  const importaDelContacto = (c: string): boolean =>
    /from '\.\.\/\.\.\/\.\.\/_chrome\/contacto\/enviarContacto'/.test(c) && /from '\.\.\/\.\.\/\.\.\/_chrome\/contacto\/contenido'/.test(c) && /RESULTADO\.exito\.titulo/.test(c) && /RESULTADO\.error\.titulo/.test(c) &&
    !new RegExp(`'(${[RESULTADO.exito.titulo, RESULTADO.error.titulo, 'Enviar', 'Enviando…'].join('|')})'`).test(c)
  afirmar(importaDelContacto(formulario), '  la validación, el envío y los textos de gracias y de error se IMPORTAN del contacto: ni uno escrito de nuevo')
  controlPositivo('  el detector ve un texto duplicado', `${formulario}\nconst x = 'Recibido.'`, importaDelContacto)
  afirmar(/<a\s+href=\{WHATSAPP\.href\}/.test(formulario) && WHATSAPP.href.startsWith('https://wa.me/5493814154708?text='), '  «o escribinos por WhatsApp»: el enlace `wa.me` del pie (el número que ya estaba en el repo) con su mensaje precargado')
  afirmar(/fase === 'exito' \|\| fase === 'error'/.test(formulario) && /<p role="alert" className="sr-only">/.test(formulario), '  el gracias y el error, adentro de la tira (y anunciados por las regiones vivas, como en el contacto)')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2c · 24 · El «?»: centrado, se arma en el lenguaje del preloader y el punto cae como las piezas del pie')

  afirmar(SIGNO.trazoS === HOME_INTRO_PHASES.strokeS && SIGNO.rellenoS === HOME_INTRO_PHASES.fillS, `el trazo y el relleno, los del preloader (${String(SIGNO.trazoS)} s y ${String(SIGNO.rellenoS)} s)`)
  afirmar(SIGNO.restitucion === REBOTE_DEL_PIE.restitucion && SIGNO.saltos === REBOTE_DEL_PIE.saltos, `  y el rebote del punto, el de las piezas del pie (restitución ${String(SIGNO.restitucion)}, ${String(SIGNO.saltos)} saltos)`)
  const primerSalto = (2 * Math.sqrt(2 * ((2 * SIGNO.caida) / SIGNO.caidaS ** 2) * SIGNO.caida) * SIGNO.restitucion) / ((2 * SIGNO.caida) / SIGNO.caidaS ** 2)
  const cima = alturaDelPunto(SIGNO.caidaS + primerSalto / 2)
  afirmar(alturaDelPunto(0) === SIGNO.caida && Math.abs(alturaDelPunto(SIGNO.caidaS)) < 1e-9 && Math.abs(cima - SIGNO.caida * SIGNO.restitucion ** 2) < 1e-6 && alturaDelPunto(duracionDelPunto() + 0.01) === 0, `  cae desde ${String(SIGNO.caida)}, toca, rebota a ${cima.toFixed(1)} (0,45² de la caída) y se asienta en ${duracionDelPunto().toFixed(2)} s`)
  controlPositivo('  el detector ve un rebote que no se asienta (restitución 1)', 1, (r: number) => r === SIGNO.restitucion)
  const signo = sinComentarios(leer(`${PORTFOLIO}/SignoDePregunta.tsx`))
  const centrado = (c: string): boolean => /className="pointer-events-none absolute inset-x-8 inset-y-16 flex items-center justify-center"/.test(c) && /preserveAspectRatio="xMidYMid meet"/.test(c) && /className="h-full w-full"/.test(c)
  afirmar(centrado(signo), '  centrado en la tira y adentro de ella: el dibujo entra entero en su caja (`meet`), así que en la tablet parada se achica al ancho de la tira y no se corta')
  controlPositivo('  el detector ve el «?» de B1.2b (pegado a la izquierda, al 80 % del alto)', 'className="pointer-events-none absolute inset-y-0 left-0 my-auto h-4/5 w-auto"', centrado)
  const armado = marcar(<SignoQueSeArma reducido />, { anima: false })
  const armandose = marcar(<SignoQueSeArma reducido={false} />, { anima: true })
  afirmar(/stroke-dashoffset="0"/.test(armado) && /stroke-dashoffset="1"/.test(armandose) && /<SignoQueSeArma key=\{entrada\}/.test(signo), '  con movimiento reducido aparece armado (el trazo entero); si no, arranca sin dibujar, y cada entrada lo monta de nuevo (se rearma)')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2c · 25 · [B1.2d B] Tablet (T2): ya no hay lomos, barras ni pista; el tap en un lomo queda para el escritorio')

  // T2 · debajo de 1024 son las historias (s76 §27): las barras y la pista de la tablet se fueron con su archivo.
  const escenarioCompleto = leer(`${PORTFOLIO}/EscenarioDelPortfolio.tsx`)
  const sinLaTablet = (e: string): boolean => !/BarrasDelPortfolio|PistaDelPortfolio|max-tablet:/.test(e) && !existsSync(path.join(V3, `${PORTFOLIO}/BarrasDelPortfolio.tsx`))
  afirmar(sinLaTablet(escenarioCompleto), 'debajo de 1024 no quedan las barras de progreso ni la pista de la tablet: son historias, con las barras del componente común')
  controlPositivo('  el detector ve el escenario de B1.2c (las barras arriba del panel abajo de 1024)', `${escenarioCompleto}\n<BarrasDelPortfolio vivo={vivo} className="hidden shrink-0 px-8 pb-2 max-escritorio:flex" />`, sinLaTablet)
  afirmar(/alElegir=\{\(\) => vivo\.saltarAlPaso\(indice, true\)\}/.test(leer(`${PORTFOLIO}/Tira.tsx`)), '  tap en un lomo = saltar a ese proyecto con el modelo del hover: activo ya, el scroll en silencio')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2c · 26 · El título, un poco más grande y sin cortarse (a 1440, 1024 y en tablet)')

  const fuente = JSON.parse(leer('_fuentes/chivo-400-titulos.json')) as { readonly resolution: number; readonly glyphs: Record<string, { readonly ha: number }> }
  const avance = [...'Portfolio'].reduce((s, c) => s + (fuente.glyphs[c]?.ha ?? Number.NaN), 0) / fuente.resolution
  afirmar(avance < ANCHO_DEL_TITULO_EN_EM && CLASE_DEL_TITULAR.includes(`*${String(CRECIMIENTO_DEL_TITULO)})`) && (CLASE_DEL_TITULAR.match(new RegExp(`calc\\(100cqw/${String(ANCHO_DEL_TITULO_EN_EM)}\\)`, 'g')) ?? []).length === 2, `«Portfolio» avanza ${avance.toFixed(2)} em en Chivo; la clase lo agranda ×${String(CRECIMIENTO_DEL_TITULO)} hasta el ancho de la columna / ${String(ANCHO_DEL_TITULO_EN_EM)} (con margen)`)
  const fluido = /--text-fluido-display-xl: clamp\((\d+)px, ([\d.]+)rem \+ ([\d.]+)vw, ([\d.]+)px\)/.exec(readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8'))
  const displayXl = (w: number): number => (fluido === null ? Number.NaN : Math.min(Number(fluido[4]), Math.max(Number(fluido[1]), Number(fluido[2]) * 16 + (Number(fluido[3]) * w) / 100)))
  const tamanos = [
    { ancho: 1440, columna: 0.5, nivel: displayXl(1440) },
    { ancho: 1024, columna: 0.5, nivel: displayXl(1024) },
    // [B1.2d B] T2 · en la tablet la columna es todo el ancho (las historias): el título entra con más aire.
    { ancho: 820, columna: 1, nivel: 56 },
    { ancho: 1023, columna: 1, nivel: 56 },
  ].map((q) => {
    const caja = q.columna * q.ancho - 64
    const tamano = Math.min(q.nivel * CRECIMIENTO_DEL_TITULO, caja / ANCHO_DEL_TITULO_EN_EM)
    return { ...q, caja, tamano }
  })
  afirmar(tamanos.every((q) => q.tamano > q.nivel && q.tamano * avance <= q.caja), 'más grande que su nivel en los cuatro cuadros y entero en su columna', tamanos.map((q) => `${String(q.ancho)}: ${q.nivel.toFixed(0)} → ${q.tamano.toFixed(1)} px`).join(' · '))
  // [B1.2d B] La columna angosta de la tablet de B1.2c (el 40 % a 820): ahí el ×1,15 sin tope se cortaba.
  controlPositivo('  el detector ve el ×1,15 sin tope (en una columna angosta, el 40 % a 820, se corta)', { ...tamanos[2], caja: 0.4 * 820 - 64 }, (q: (typeof tamanos)[number]) => q.nivel * CRECIMIENTO_DEL_TITULO * avance <= q.caja)
}
