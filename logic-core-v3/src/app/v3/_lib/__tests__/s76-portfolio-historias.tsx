/**
 * [B1.3] s76 · EL TELÉFONO: LAS HISTORIAS (`docs/rediseno/SPRINT-B1-PORTFOLIO.md` §5.10 y §13, punto 8), sin navegador. Abajo de 768 el
 * MISMO marcado se restiliza por CSS (las dos ramas dicen lo mismo y la sección no mide el ancho): la historia a pantalla completa con
 * el video del teléfono, las barras arriba, la ficha como una hoja que sube desde abajo, los dos toques, el deslizamiento que se asienta
 * de a un proyecto, «la tuya» con el «?», el formulario y WhatsApp, y el título que llega en la aproximación y se va con la caída. Las
 * hojas a 390, 375 y 360 las saca el banco. Cada afirmación con su control positivo.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { marcar } from '../../_secciones/_invariantes/render'
import { PROYECTOS } from '../../_secciones/trabajos/proyectos'
import { asentamiento } from '../../_secciones/trabajos/portfolio/deslizamiento'
import { MedioDeLaTira } from '../../_secciones/trabajos/portfolio/MedioDeLaTira'
import { AFUERA, recorridoDelOrden, type Orden } from '../../_secciones/trabajos/portfolio/orden'
import { ANTES_DEL_PIN, EN_LA_COLA, type IndiceDePaso } from '../../_secciones/trabajos/portfolio/pasos'
import { destinoDeLaRueda } from '../../_secciones/trabajos/portfolio/rueda'
import { CLASE_DE_LA_HOJA, CLASE_DE_LA_HOJA_ABAJO, CLASES_DE_LA_TIRA } from '../../_secciones/trabajos/portfolio/Tira'
import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const PORTFOLIO = '_secciones/trabajos/portfolio'
const clases = (c: string): string[] => c.split(/\s+/)

export function afirmarLasHistorias(): void {
  titulo('B1.3 · 27 · Abajo de 768, las historias: lo decide el CSS y el JS lo lee')

  const trabajos = leer('_secciones/trabajos/Trabajos.tsx')
  const selector = sinComentarios(leer(`${PORTFOLIO}/tramoDelSelector.ts`))
  const loDecideElCss = (t: string, s: string): boolean => t.includes('max-tablet:[--modo-del-portfolio:historias]') && /getPropertyValue\('--modo-del-portfolio'\)\.trim\(\) === 'historias'/.test(s)
  afirmar(loDecideElCss(trabajos, selector), 'la sección escribe `--modo-del-portfolio: historias` abajo de 768 (`max-tablet:`) y el JS lo lee del CSS: no mide el ancho')
  controlPositivo('  el detector ve una consulta del ancho en JS', [trabajos.replace('max-tablet:[--modo-del-portfolio:historias]', ''), "const historias = window.matchMedia('(max-width: 767px)').matches"] as const, ([t, s]: readonly [string, string]) => loDecideElCss(t, s))
  afirmar(clases(CLASES_DE_LA_TIRA.lomo).includes('max-tablet:hidden') && !clases(CLASES_DE_LA_TIRA.activa).some((c) => c.startsWith('max-tablet:hidden')), 'en el teléfono los lomos no se ven: la historia es la tira activa, a pantalla completa')
  const escenario = leer(`${PORTFOLIO}/EscenarioDelPortfolio.tsx`)
  afirmar(/max-escritorio:w-3\/5 max-tablet:w-full'/.test(escenario) && /max-escritorio:w-2\/5 max-tablet:w-full"/.test(escenario) && /hueco-del-logo" aria-hidden="true" className="mt-8 shrink-0 max-tablet:hidden"/.test(escenario), '  el panel y la columna a todo el ancho; el hueco del logo no va (la historia tapa la escena)')

  titulo('B1.3 · 28 · La historia: el video del teléfono a pantalla completa y la ficha como una hoja que sube desde abajo')

  const p = PROYECTOS[0]
  const activo = marcar(<MedioDeLaTira proyecto={p} activa cerca aLaVista reducido={false} />, { anima: true })
  const videos = [...activo.matchAll(/<video[^>]*>/g)].map((m) => m[0])
  afirmar(videos.length === 2 && /data-cual="escritorio"[^>]*\ssrc="\/portfolio\/el-garage\/escritorio\.mp4"/.test(videos[0]) && /data-cual="movil"/.test(videos[1]) && !/\ssrc="/.test(videos[1]) && /object-cover/.test(videos[1]), 'dos videos (el CSS esconde uno) y SÓLO el que está a la vista pide su archivo: en el servidor, el de escritorio; el del teléfono, `object-cover` (se grabó con su proporción)')
  const medio = sinComentarios(leer(`${PORTFOLIO}/MedioDeLaTira.tsx`))
  afirmar(/new ResizeObserver\(\(\) => setCual\(el\.offsetParent !== null \? 'movil' : 'escritorio'\)\)/.test(medio) && /estadoDelVideo\(activa && cual === de, cerca, reducido, aLaVista\)/.test(medio) && /max-tablet:hidden" style=\{\{ aspectRatio: PROPORCION_DEL_MEDIO/.test(medio) && /hidden h-full w-full bg-tinta\/5 max-tablet:block/.test(medio), '  cuál está a la vista lo lee el código del CSS (el del teléfono sin caja = escondido), y el estado de cada video depende de eso')
  controlPositivo('  el detector ve los dos pidiendo su archivo', medio.replace('activa && cual === de', 'activa'), (c: string) => /estadoDelVideo\(activa && cual === de, cerca, reducido, aLaVista\)/.test(c))
  const tira = sinComentarios(leer(`${PORTFOLIO}/Tira.tsx`))
  afirmar(/className="relative px-8 pt-8 max-escritorio:pt-4 max-tablet:absolute max-tablet:inset-0 max-tablet:p-0"/.test(tira), '  el medio, detrás de todo y a pantalla completa en el teléfono')
  const hoja = clases(CLASE_DE_LA_HOJA)
  const esUnaHoja = (h: readonly string[], abajo: string): boolean =>
    h[0] === 'contents' && ['max-tablet:absolute', 'max-tablet:bottom-0', 'max-tablet:max-h-2/3', 'max-tablet:overflow-y-auto', 'max-tablet:transition-transform'].every((c) => h.includes(c)) && abajo === 'max-tablet:translate-y-full' && h.every((c) => c === 'contents' || c.startsWith('max-tablet:') || c.startsWith('motion-reduce:'))
  afirmar(esUnaHoja(hoja, CLASE_DE_LA_HOJA_ABAJO) && /<div data-pieza="hoja-de-la-ficha" className=\{cn\(CLASE_DE_LA_HOJA, !visible && CLASE_DE_LA_HOJA_ABAJO\)\}>\s*\{activa \? <MarcaDeAgua/.test(tira), 'la ficha es una hoja que sube desde abajo cuando la historia entra (con su secuencia), con el nombre, los rótulos, la marca de agua y su scroll propio; desde 768 no existe (`contents`)')
  controlPositivo('  el detector ve una hoja que también cambia el escritorio', [...hoja, 'absolute'], (h: readonly string[]) => esUnaHoja(h, CLASE_DE_LA_HOJA_ABAJO))
  const historia = marcar(<div className={`${CLASE_DE_LA_HOJA} ${CLASE_DE_LA_HOJA_ABAJO}`} />, { anima: false })
  afirmar(!historia.includes('transform:'), '  y sube con clases (`translate`), no con una transformada en línea: la rama quieta no escribe una')

  titulo('B1.3 · 29 · Los gestos: tap a la izquierda o a la derecha; deslizar es el scroll, que se asienta de a un proyecto')

  afirmar(/aria-label=\{CONTENIDO\.historias\.anterior\} onClick=\{\(\) => vivo\.irAl\(-1\)\} className="absolute inset-y-0 left-0 hidden w-1\/3/.test(tira) && /aria-label=\{CONTENIDO\.historias\.siguiente\} onClick=\{\(\) => vivo\.irAl\(1\)\} className="absolute inset-y-0 right-0 hidden w-2\/3/.test(tira) && /\{activa \? <ToquesDeLaHistoria vivo=\{vivo\} \/> : null\}\s*<div data-pieza="hoja-de-la-ficha"/.test(tira), 'dos toques sobre el video y debajo de la hoja (sólo en el teléfono): el tercio de la izquierda, el anterior; el resto, el siguiente')
  const nombre = (tira0: number, s: 1 | -1): string => {
    const d = destinoDeLaRueda(tira0, s)
    return d.tipo === 'paso' ? ['El Garage', 'Esquina', 'Banú', 'la tuya'][d.indice] : d.tipo === 'demos' ? 'Demos' : 'arriba'
  }
  afirmarIgual([nombre(0, 1), nombre(1, -1), nombre(2, 1), nombre(0, -1), nombre(3, 1)], ['Esquina', 'El Garage', 'la tuya', 'arriba', 'Demos'], '  con el modelo de la rueda: de a uno desde el activo; antes del primero, arriba; después de «la tuya», Demos')
  const usePortfolio = sinComentarios(leer(`${PORTFOLIO}/usePortfolio.ts`))
  afirmar(/if \(d\.tipo === 'paso'\) saltarAlPaso\(d\.indice, true\)\s*else ir\(d\)/.test(usePortfolio), '  el proyecto, en silencio (el modelo del hover); las salidas, con su orden')
  const casos: readonly [IndiceDePaso, IndiceDePaso, number, number | null][] = [
    [0, 2, 0.1, 1],
    [0, 3, 0, 1],
    [1, 1, 0.3, 1],
    [1, 1, 0.01, null],
    [3, EN_LA_COLA, 0.2, null],
    [ANTES_DEL_PIN, 2, 0.4, 0],
    [EN_LA_COLA, 1, 0, 3],
    [0, ANTES_DEL_PIN, -0.3, null],
  ]
  afirmarIgual(casos.map(([d, c, v]) => asentamiento(d, c, v)), casos.map(([, , , e]) => e), 'deslizar es el scroll de la página y, quieta, se asienta en el centro de su proyecto, a lo sumo uno más allá del que estaba; lo que sale del selector se deja (es la salida)')
  controlPositivo('  el detector ve un deslizamiento que cruza dos proyectos', (_d: IndiceDePaso, c: IndiceDePaso): number | null => c, (f: (d: IndiceDePaso, c: IndiceDePaso, v: number) => number | null) => f(0, 2, 0.1) === 1)
  const deslizamiento = sinComentarios(leer(`${PORTFOLIO}/useDeslizamientoDelPortfolio.ts`))
  afirmar(/addEventListener\('touchstart', alTocar, \{ passive: true \}\)/.test(deslizamiento) && /addEventListener\('scroll', alMoverse, \{ passive: true \}\)/.test(deslizamiento) && !/preventDefault/.test(deslizamiento) && /useDeslizamientoDelPortfolio\(historias, deslizamiento\)/.test(usePortfolio), '  ningún gesto propio que pelee con el scroll: escuchas pasivos, sin `preventDefault`, y sólo con las historias')

  titulo('B1.3 · 30 · La entrada y la salida: «Portfolio» llega en la aproximación y se va con la caída antes de la historia')

  const texto = (r: readonly { readonly estado: Orden; readonly enS: number }[]): string[] => r.map(({ estado, enS }) => `${estado.escena ? 'E' : 'e'}${estado.encabezado ? 'T' : 't'}@${enS.toFixed(2)}`)
  const EN_LA_APROXIMACION: Orden = { escena: false, encabezado: true }
  const EN_LA_HISTORIA: Orden = { escena: true, encabezado: false }
  afirmarIgual([texto(recorridoDelOrden(EN_LA_APROXIMACION, EN_LA_HISTORIA, 0.6)), texto(recorridoDelOrden(EN_LA_HISTORIA, EN_LA_APROXIMACION, 0.6)), texto(recorridoDelOrden(EN_LA_HISTORIA, AFUERA, 0.6))], [['et@0.00', 'Et@0.60'], ['et@0.00', 'eT@0.70'], ['et@0.00']], 'entrando, el título cae entero y después entra la historia; subiendo, la historia se va y después vuelve el título; bajando a Demos, la historia se va y el título no vuelve')
  const reglaDelTelefono = (u: string): boolean => /historias \? fase === 'antes' && enCuadro : fase === 'adentro'/.test(u)
  afirmar(reglaDelTelefono(usePortfolio), '  en las historias el encabezado se pide en la aproximación (con la sección en el cuadro), no con el panel')
  controlPositivo('  el detector ve la regla del escritorio en el teléfono', usePortfolio.replace("historias ? fase === 'antes' && enCuadro : fase === 'adentro'", "fase === 'adentro'"), reglaDelTelefono)

  titulo('B1.3 · 31 · Las barras arriba y «la tuya» al final, con el «?», el formulario y WhatsApp')

  afirmar(/<BarrasDelPortfolio vivo=\{vivo\} className="hidden shrink-0 px-8 pb-2 max-escritorio:flex"/.test(escenario) && /<PistaDelPortfolio vivo=\{vivo\} className="[^"]*max-escritorio:flex max-tablet:hidden"/.test(escenario), 'las barras de progreso arriba de la historia (las mismas de la tablet); la pista es sólo de la tablet')
  const laTuya = sinComentarios(leer(`${PORTFOLIO}/LaTuya.tsx`))
  afirmar(/<SignoDePregunta visible=\{visible\} reducido=\{vivo\.reducido\} \/>/.test(laTuya) && /<FormularioDeLaTuya visible=\{visible\} reducido=\{vivo\.reducido\} desde=\{3\} \/>/.test(laTuya) && !/ToquesDeLaHistoria/.test(laTuya), 'la última historia es «la tuya»: el «?» que se arma, el formulario corto y WhatsApp (sin los toques, que taparían el formulario: se vuelve deslizando)')
}
