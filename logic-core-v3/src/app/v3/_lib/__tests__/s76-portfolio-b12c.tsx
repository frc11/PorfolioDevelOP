/**
 * [B1.2c] s76 · LOS AJUSTES DEL FRENO DE B1.2b (`docs/rediseno/SPRINT-B1-PORTFOLIO.md` §13), sin navegador: el orden de la salida y la
 * entrada, los rótulos de la ficha con los acentos claros (P-H2), la transición entre proyectos, la rueda y el hover (los cuatro casos
 * de Valentino), el formulario corto de «la tuya», el «?» que se arma, las barras y la pista de la tablet, y el título más grande que
 * no se corta. (La cámara de frente y el título en el plano del logo: §9, §9b y §9c de `s76-portfolio-escena.tsx`.) Cada afirmación
 * con su control positivo. El arnés de carga mide la rueda en el sitio (`scripts-carga/rueda.ts`).
 */
import { readFileSync } from 'node:fs'
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
import { validarContacto } from '../../_chrome/contacto/enviarContacto'
import { PROYECTOS } from '../../_secciones/trabajos/proyectos'
import { activaElHover } from '../../_secciones/trabajos/portfolio/Acordeon'
import { estadosDeLasBarras } from '../../_secciones/trabajos/portfolio/BarrasDelPortfolio'
import { PRESENCIA_DEL_ENCABEZADO } from '../../_secciones/trabajos/portfolio/EncabezadoDelPortfolio'
import { CLASE_DEL_ROTULO, Ficha } from '../../_secciones/trabajos/portfolio/Ficha'
import { CAMPOS_DE_LA_TUYA, datosDelFormulario } from '../../_secciones/trabajos/portfolio/FormularioDeLaTuya'
import { AFUERA, ORDEN, recorridoDelOrden, type Orden } from '../../_secciones/trabajos/portfolio/orden'
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
  titulo('B1.2c · 19 · El orden: el título cae entero y recién después vuelven la cámara y el oscurecido (y el panel se retrae); al subir, al revés')

  const ADENTRO: Orden = { escena: true, encabezado: true }
  const comoTexto = (r: readonly { readonly estado: Orden; readonly enS: number }[]): string[] => r.map(({ estado, enS }) => `${estado.escena ? 'E' : 'e'}${estado.encabezado ? 'T' : 't'}@${enS.toFixed(2)}`)
  const caidaConEl3d = LENTOS.llegadaDePortfolioS
  afirmarIgual(comoTexto(recorridoDelOrden(ADENTRO, AFUERA, caidaConEl3d)), ['Et@0.00', 'et@1.40'], 'la salida: primero el título y la bajada (caen enteros, lo que tarda el título 3D: su mínimo de 1,4 s) y DESPUÉS la escena —la cámara, el oscurecido y el panel—')
  controlPositivo('  el detector ve la salida de B1.2b (todo junto: la cámara volvía antes de que terminara la caída)', (): string[] => ['et@0.00'], (f: () => string[]) => JSON.stringify(f()) === JSON.stringify(['Et@0.00', 'et@1.40']))
  afirmarIgual(comoTexto(recorridoDelOrden(AFUERA, ADENTRO, caidaConEl3d)), ['Et@0.00', 'ET@0.70'], `la entrada (al subir, y también bajando): primero llega la cámara (el panel y el oscurecido, ${String(ORDEN.camaraS)} s) y después aparece el título`)
  afirmar(ORDEN.camaraS === PERSECUCION_DEL_PESO_S && ORDEN.panelS === 0.7 && /duration-700/.test(leer(`${PORTFOLIO}/EscenarioDelPortfolio.tsx`)), '  las esperas son las de la escena: la persecución de la cámara y la transición del panel (700 ms)')
  afirmarIgual(comoTexto(recorridoDelOrden(ADENTRO, AFUERA, caidaConEl3d, true)), ['et@0.00'], '  con movimiento reducido, de una')
  // Abajo de 1024 no hay título 3D: lo que cae es el del DOM (la presencia, 0,6 s).
  afirmarIgual(comoTexto(recorridoDelOrden(ADENTRO, AFUERA, PRESENCIA_DEL_ENCABEZADO.s)), ['Et@0.00', 'et@0.60'], '  sin el título 3D (abajo de 1024), la caída es la del DOM: 0,6 s')
  const usePortfolio = sinComentarios(leer(`${PORTFOLIO}/usePortfolio.ts`))
  const escenario = sinComentarios(leer(`${PORTFOLIO}/EscenarioDelPortfolio.tsx`))
  const cableado = (u: string, e: string): boolean =>
    /const caidaS = useTituloListo\('portfolio'\) \? LENTOS\.llegadaDePortfolioS : PRESENCIA_DEL_ENCABEZADO\.s/.test(u) &&
    /useOrdenDeLaEscena\(fase === 'adentro', historias \? fase === 'antes' && enCuadro : fase === 'adentro', caidaS, reducido\)/.test(u) && /PORTFOLIO_EN_LA_ESCENA\.adentro = orden\.escena/.test(u) &&
    /!vivo\.escena && 'translate-x-full'/.test(e) && /<EncabezadoDelPortfolio seccion=\{seccion\} adentro=\{vivo\.encabezado\}/.test(e)
  afirmar(cableado(usePortfolio, escenario), '  y así se cablea: la escena (la cámara y el oscurecido de `PORTFOLIO_EN_LA_ESCENA`, y el panel) y el encabezado salen del orden, no del paso')
  controlPositivo('  el detector ve la escena atada al paso (B1.2b)', usePortfolio.replace('PORTFOLIO_EN_LA_ESCENA.adentro = orden.escena', "PORTFOLIO_EN_LA_ESCENA.adentro = vistaDelPaso(paso).fase === 'adentro'"), (u: string) => cableado(u, escenario))

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
  afirmar(!activaElHover({ ...lomo, mueve: false }, 3, true, null, null) && activaElHover(lomo, 3, true, null, null) && /const mueve = e\.type === 'pointermove'/.test(acordeonDelHover) && /if \(activacion\.current === null\) activacion\.current = puntero\.current/.test(acordeonDelHover), 'un lomo que llega debajo del mouse quieto (la carga, el scroll: `pointerover` sin `pointermove`) no se activa, y recién cargada el primer lugar del puntero es la base; moviéndolo, sí')
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
  const atrapa = (c: string): boolean => /if \(destino > scrollDelPx\(hasta, m\.tope, m\.alto\) \|\| destino < scrollDelPx\(desde, m\.tope, m\.alto\)\) saltarAlPaso\(vistaDelPaso\(paso\)\.tira\)/.test(c) && /gesto = \{ acumulado: 0, ultimo: ahora, disparado: true \}/.test(rueda)
  afirmar(atrapa(usePortfolio), '  la entrada del panel atrapa la inercia de un golpe fuerte (Lenis yendo más allá: se frena en el proyecto en que entra) y ese mismo gesto no da un paso')
  controlPositivo('  el detector ve la entrada sin atrapar', usePortfolio.replace('saltarAlPaso(vistaDelPaso(paso).tira)', 'undefined'), atrapa)
  // El arnés lo encontró (la pila de `PILAS=1`): el salto inmediato llega en el acto, y su llegada pedía el vuelo antes de que existiera.
  const vueloAntesDelSalto = (c: string): boolean =>
    /v\.enVuelo\.current = \{ id, destino: px, cancelar: \(\) => undefined \}\s*const cancelar = saltarA\(/.test(c) && /if \(v\.enVuelo\.current\?\.id !== id\) return/.test(c) && !/cancelar: saltarA\(/.test(c)
  afirmar(vueloAntesDelSalto(sinComentarios(leer(`${PORTFOLIO}/medida.ts`))) && /volarAlPx\(\{ caja, enVuelo, actual, setPaso \}, px, reducido \? 0 : ms, scrollExtra\)/.test(usePortfolio), '  el salto en silencio (el hover, el clic, el tap) no pide su vuelo antes de que exista: el vuelo se arma y después se lanza el salto (el arnés: «Cannot access before initialization» en cada hover, y la marca de vuelo puesta para siempre)')
  controlPositivo('  el detector ve el vuelo armado adentro de su propio inicializador (B1.2b)', 'const vuelo = {\n  destino: px,\n  cancelar: saltarA(y, ms, () => { if (enVuelo.current !== vuelo) return }),\n}\nenVuelo.current = vuelo', vueloAntesDelSalto)
  afirmar(/return v\.fase === 'adentro' && pegado\(caja\.current\) && !conDialogo\(caja\.current\) \? v\.tira : null/.test(usePortfolio) && /else if \(d\.tipo === 'demos'\) irAlPx\(pxDeLaSeccion\(PANTALLAS_POR_PASO\), salida, -2\)/.test(usePortfolio), '  manda sólo con el panel adentro, pegado y sin un diálogo; a Demos va al final del pin (como el viaje del menú), con el tiempo de la salida en orden')

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
  titulo('B1.2c · 25 · Tablet: las barras de progreso, la pista «Seguí bajando» y el tap en un lomo')

  afirmarIgual([estadosDeLasBarras(0, 'antes'), estadosDeLasBarras(1, 'adentro'), estadosDeLasBarras(3, 'despues')], [['vacia', 'vacia', 'vacia', 'vacia'], ['llena', 'activa', 'vacia', 'vacia'], ['llena', 'llena', 'llena', 'llena']], 'una barra por proyecto y la de «la tuya»: las vistas llenas, la del activo con lo recorrido de su paso, las que vienen vacías')
  const escenarioCompleto = leer(`${PORTFOLIO}/EscenarioDelPortfolio.tsx`)
  const barras = leer(`${PORTFOLIO}/BarrasDelPortfolio.tsx`)
  afirmar(/<BarrasDelPortfolio vivo=\{vivo\} className="hidden shrink-0 px-8 pb-2 max-escritorio:flex"/.test(escenarioCompleto) && /<PistaDelPortfolio vivo=\{vivo\} className="absolute inset-x-0 bottom-6 hidden justify-center max-escritorio:flex/.test(escenarioCompleto), '  arriba del panel, abajo de 1024 (en escritorio no), y la pista al pie del panel')
  afirmar(/if \(desde\.current !== null && \(!vivo\.escena \|\| vivo\.paso !== desde\.current\)\) marcarLaPista\(\)/.test(barras) && /window\.sessionStorage\.setItem\(CLAVE_DE_LA_PISTA, 'vista'\)/.test(barras) && /hidden=\{vista \|\| !vivo\.escena\}/.test(barras), '  la pista: la primera vez que entra el panel; se va con el primer paso (o con el panel) y no vuelve en la sesión')
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
    { ancho: 820, columna: 0.4, nivel: 56 },
    { ancho: 1023, columna: 0.4, nivel: 56 },
  ].map((q) => {
    const caja = q.columna * q.ancho - 64
    const tamano = Math.min(q.nivel * CRECIMIENTO_DEL_TITULO, caja / ANCHO_DEL_TITULO_EN_EM)
    return { ...q, caja, tamano }
  })
  afirmar(tamanos.every((q) => q.tamano > q.nivel && q.tamano * avance <= q.caja), 'más grande que su nivel en los cuatro cuadros y entero en su columna', tamanos.map((q) => `${String(q.ancho)}: ${q.nivel.toFixed(0)} → ${q.tamano.toFixed(1)} px`).join(' · '))
  controlPositivo('  el detector ve el ×1,15 sin tope (a 820 se corta)', tamanos[2], (q: (typeof tamanos)[number]) => q.nivel * CRECIMIENTO_DEL_TITULO * avance <= q.caja)
}
