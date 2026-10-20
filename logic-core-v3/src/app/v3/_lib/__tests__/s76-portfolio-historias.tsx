/**
 * [B1.2d B] s76 · LAS HISTORIAS (`docs/rediseno/SPRINT-B1-PORTFOLIO.md` §14.5 y §14.6), sin navegador. Reemplaza las de B1.3 (§27 a
 * §31: las historias eran el mismo acordeón restilizado y el scroll las avanzaba): debajo de 1024 el Portfolio monta las historias del
 * componente común (P-H19, `_componentes/historias/`), con tiempo, toques, deslices y salidas, y el scroll no las avanza. Cada afirmación
 * con su control positivo. Lo que se mide en el sitio (la ficha ≤ 25 %, los gestos con el dedo) lo corre `scratchpad/cola2/historias-sitio.ts`.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import type { MotionValue } from 'motion/react'
import type { ReactNode } from 'react'

import { BARRAS_SOBRE_ACENTO, Historias, type ColorDeLasBarras } from '../../_componentes/historias/Historias'
import {
  ESTADO_INICIAL, HISTORIAS, barrasDeLasHistorias, gestoDelPuntero, siguienteDeLasHistorias,
  type EstadoDeLasHistorias, type EventoDeLasHistorias, type ItemDeHistoria, type PasoDeLasHistorias,
} from '../../_componentes/historias/maquinaDeLasHistorias'
import { marcar } from '../../_secciones/_invariantes/render'
import { PROYECTOS } from '../../_secciones/trabajos/proyectos'
import { ENTRADA_DE_LAS_HISTORIAS } from '../../_secciones/trabajos/portfolio/EscenarioDelPortfolio'
import { SUBIDA_DEL_ENCABEZADO_SVH } from '../../_secciones/trabajos/portfolio/EncabezadoDelPortfolio'
import { HistoriaDelProyecto } from '../../_secciones/trabajos/portfolio/HistoriaDelProyecto'
import { ITEMS_DE_LAS_HISTORIAS } from '../../_secciones/trabajos/portfolio/HistoriasDelPortfolio'
import { AFUERA, NUNCA, pideElEncabezado, recorridoDelOrden, type Orden } from '../../_secciones/trabajos/portfolio/orden'
import { LO_QUE_SE_VE, violacionesDeLasHistorias, type CuadroDeLasHistorias } from '../../../../../scripts-carga/historias-cuenta'
import { recorteDiagonal } from '../../_componentes/historias/corteDiagonal'
import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const PORTFOLIO = '_secciones/trabajos/portfolio'
const veces = (html: string, aguja: string): number => html.split(aguja).length - 1

type Maquina = (e: EstadoDeLasHistorias, ev: EventoDeLasHistorias, items: readonly ItemDeHistoria[], d?: number) => PasoDeLasHistorias
/** Una serie de eventos desde el arranque: el último estado, las salidas y cuántos tics. */
function correr(m: Maquina, items: readonly ItemDeHistoria[], eventos: readonly EventoDeLasHistorias[]): { readonly e: EstadoDeLasHistorias; readonly salidas: string[]; readonly tics: number } {
  let e = ESTADO_INICIAL
  const salidas: string[] = []
  let tics = 0
  for (const ev of eventos) {
    const p = m(e, ev, items)
    e = p.estado
    if (p.salida !== null) salidas.push(p.salida)
    if (p.porElUsuario) tics += 1
  }
  return { e, salidas, tics }
}

export function afirmarLasHistorias(): void {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d B · 27 · T2 · Debajo de 1024, todo es historias (la tablet parada y la acostada, como el teléfono)')

  const trabajos = sinComentarios(leer('_secciones/trabajos/Trabajos.tsx'))
  const selector = sinComentarios(leer(`${PORTFOLIO}/tramoDelSelector.ts`))
  const loDecideElCss = (t: string, s: string): boolean => t.includes('max-escritorio:[--modo-del-portfolio:historias]') && !t.includes('max-tablet:[--modo-del-portfolio') && /getPropertyValue\('--modo-del-portfolio'\)\.trim\(\) === 'historias'/.test(s) && !/matchMedia|innerWidth/.test(s)
  afirmar(loDecideElCss(trabajos, selector), 'la sección escribe `--modo-del-portfolio: historias` debajo de 1024 (`max-escritorio:`, o sea de 1023 a 768 inclusive y más abajo) y el JS lo lee del CSS: no mide el ancho')
  controlPositivo('  el detector ve el corte de B1.3 (abajo de 768: la tablet seguía con lomos)', [trabajos.replace('max-escritorio:[--modo-del-portfolio:historias]', 'max-tablet:[--modo-del-portfolio:historias]'), selector] as const, ([t, s]: readonly [string, string]) => loDecideElCss(t, s))
  const escenario = sinComentarios(leer(`${PORTFOLIO}/EscenarioDelPortfolio.tsx`))
  const montaLasHistorias = (c: string): boolean =>
    /\{vivo\.historias \? \(\s*<AnimatePresence mode="wait">\s*\{vivo\.panel \? \(\s*<motion\.div key="historias"[\s\S]*?<HistoriasDelPortfolio [^>]*alSalir=\{vivo\.salirDeLasHistorias\} \/>/.test(c) &&
    /\) : \(\s*<div className="relative min-h-0 flex-1">\s*<Acordeon vivo=\{vivo\} \/>/.test(c) && !/BarrasDelPortfolio|PistaDelPortfolio/.test(c)
  afirmar(montaLasHistorias(escenario), '  el escenario monta las historias (mientras el panel está adentro) en vez del acordeón; las barras y la pista de la tablet se fueron')
  controlPositivo('  el detector ve el escenario de B1.3 (el acordeón en todo ancho, con las barras de la tablet)', escenario.replace('{vivo.historias ? (', '{false ? (') + '\n<BarrasDelPortfolio />', montaLasHistorias)
  afirmar(/max-escritorio:w-full max-escritorio:justify-start/.test(escenario) && /max-escritorio:w-full max-escritorio:translate-x-0/.test(escenario) && /hueco-del-logo" aria-hidden="true" className="mt-8 shrink-0 max-escritorio:hidden"/.test(escenario), '  la columna a todo el ancho con el título arriba y el panel en su lugar (no se desliza: las historias entran con un fundido)')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d B · 28 · T4 · La historia de un proyecto: el video del teléfono a pantalla completa y la ficha corta, abajo')

  const p = PROYECTOS[0]
  const historia = marcar(<HistoriaDelProyecto proyecto={p} pausada={false} cerca aLaVista reducido={false} />, { anima: true })
  const lejos = marcar(<HistoriaDelProyecto proyecto={p} pausada={false} cerca={false} aLaVista reducido={false} />, { anima: true })
  afirmar(/<video [^>]*data-cual="movil"[^>]*\sloop=""[^>]*class="h-full w-full object-cover"[^>]*src="\/portfolio\/el-garage\/movil\.mp4"/.test(historia) && /\smuted=""/.test(historia) && !/\ssrc="/.test(lejos), 'el video del teléfono, `muted loop`, a pantalla completa (`object-cover`); sin la sección cerca, nada se pide')
  const ficha = /<div data-pieza="ficha-de-la-historia"[\s\S]*$/.exec(historia)?.[0] ?? ''
  const fichaCorta = (f: string): boolean =>
    /data-fila="uno"[\s\S]*El Garage[\s\S]*Concesionaria[\s\S]*No tenía catálogo/.test(f) && /data-fila="dos"[\s\S]*Un catálogo de muchos filtros[\s\S]*Visitar sitio/.test(f) &&
    !/<dt|Marzo 2026|Con la página tienen todo ordenado|data-marca-de-agua|\[TESTIMONIO\]|Lo que dice el cliente/.test(f)
  afirmar(fichaCorta(ficha) && /absolute inset-x-0 bottom-0/.test(ficha) && /safe-area-inset-bottom/.test(ficha), '  la ficha: fila 1, el nombre y el rubro a la izquierda y el problema a la derecha; fila 2, qué hicimos y «Visitar sitio»; abajo, en el área segura, y NADA más (sin rótulos, fecha, lo resuelto, reseña ni marca de agua)')
  controlPositivo('  el detector ve la ficha entera de escritorio (con sus rótulos y la reseña)', `${ficha}<dt>Fecha</dt><dd>Marzo 2026</dd>`, fichaCorta)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d B · 29 · P-H19 · Las historias, puras y comunes: con 3 pasos (el precio de servicios) y con 4 (el Portfolio)')

  const TRES: readonly ItemDeHistoria[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
  const tiempo = (ms: number): EventoDeLasHistorias => ({ tipo: 'tiempo', ms })
  const reglas = (m: Maquina): boolean => {
    const arranque = correr(m, TRES, [tiempo(3000), { tipo: 'toque', fraccion: 0.9 }])
    const pasa = correr(m, TRES, [tiempo(HISTORIAS.duracionMs - 1), tiempo(2)])
    const pausada = correr(m, TRES, [{ tipo: 'mantener' }, tiempo(HISTORIAS.duracionMs * 2)])
    const suelta = correr(m, TRES, [{ tipo: 'mantener' }, { tipo: 'soltar' }, tiempo(HISTORIAS.duracionMs)])
    const atras = correr(m, TRES, [{ tipo: 'toque', fraccion: 0.9 }, { tipo: 'toque', fraccion: 0.1 }])
    const costados = correr(m, TRES, [{ tipo: 'deslice', dx: -80, dy: 5 }, { tipo: 'deslice', dx: -80, dy: 5 }, { tipo: 'deslice', dx: 80, dy: -5 }])
    const arriba = correr(m, TRES, [{ tipo: 'deslice', dx: 4, dy: -120 }])
    const abajo = correr(m, TRES, [{ tipo: 'deslice', dx: 4, dy: 120 }])
    const ultimo = correr(m, TRES, [tiempo(HISTORIAS.duracionMs), tiempo(HISTORIAS.duracionMs), tiempo(HISTORIAS.duracionMs * 3)])
    const despues = correr(m, TRES, [{ tipo: 'toque', fraccion: 0.9 }, { tipo: 'toque', fraccion: 0.9 }, { tipo: 'toque', fraccion: 0.9 }])
    return arranque.e.indice === 1 && arranque.e.transcurridoMs === 0 && arranque.e.reinicio === 1 &&
      pasa.e.indice === 1 && pasa.tics === 0 && pausada.e.indice === 0 && suelta.e.indice === 1 &&
      atras.e.indice === 0 && atras.tics === 2 && costados.e.indice === 1 && costados.tics === 3 &&
      arriba.salidas.join() === 'adelante' && abajo.salidas.join() === 'atras' && arriba.e.indice === 0 &&
      ultimo.e.indice === 2 && ultimo.salidas.length === 0 && despues.e.indice === 2 && despues.salidas.join() === 'adelante'
  }
  afirmar(reglas(siguienteDeLasHistorias), 'cada ítem arranca de cero (`reinicio` lo vuelve a montar); a los 10 s pasa solo (sin sonar); mantener pausa y soltar sigue; un toque a la izquierda vuelve y a la derecha avanza; de costado, igual; arriba sale adelante y abajo atrás; el último con tiempo se queda lleno; después del último, un toque sale')
  controlPositivo('  el detector ve una máquina que no pausa (mantener no frena el tiempo)', ((e, ev, it, d) => siguienteDeLasHistorias({ ...e, pausada: false }, ev, it, d)) as Maquina, reglas)
  controlPositivo('  y una que suena con el tiempo (dos sonidos por historia: el de B1.3)', ((e, ev, it, d) => {
    const r = siguienteDeLasHistorias(e, ev, it, d)
    return { ...r, porElUsuario: r.estado.indice !== e.indice }
  }) as Maquina, reglas)
  const CUATRO = ITEMS_DE_LAS_HISTORIAS
  const conLaTuya = (m: Maquina): boolean => {
    const quieta = correr(m, CUATRO, [{ tipo: 'toque', fraccion: 0.9 }, { tipo: 'toque', fraccion: 0.9 }, { tipo: 'toque', fraccion: 0.9 }, tiempo(HISTORIAS.duracionMs * 5)])
    const enfocada = correr(m, CUATRO, [{ tipo: 'foco', adentro: true }, { tipo: 'toque', fraccion: 0.9 }, { tipo: 'deslice', dx: -90, dy: 0 }, tiempo(HISTORIAS.duracionMs * 2)])
    return quieta.e.indice === 3 && quieta.salidas.length === 0 && enfocada.e.indice === 0 && enfocada.salidas.length === 0
  }
  afirmar(CUATRO.length === 4 && CUATRO[3]?.sinTiempo === true && conLaTuya(siguienteDeLasHistorias), '  el Portfolio: cuatro (los tres proyectos y «la tuya», sin tiempo: se queda hasta que el usuario sale); con un campo enfocado, nada avanza (ni el tiempo, ni un toque, ni un deslice)')
  controlPositivo('  el detector ve una máquina que no mira el foco', ((e, ev, it, d) => siguienteDeLasHistorias({ ...e, enfocada: false }, ev, it, d)) as Maquina, conLaTuya)
  afirmarIgual([gestoDelPuntero(3, 4, false), gestoDelPuntero(30, 2, false), gestoDelPuntero(1, 1, true)], ['toque', 'deslice', 'nada'], '  el puntero: hasta 10 px es un toque; más, un deslice; si se mantuvo (pausó), al soltar no es nada')
  afirmarIgual(barrasDeLasHistorias({ ...ESTADO_INICIAL, indice: 1, transcurridoMs: HISTORIAS.duracionMs / 2 }, TRES), [1, 0.5, 0], '  las barras: las vistas llenas, la de ahora con su avance (lineal en 10 s), las que vienen vacías')
  const montadas = marcar(<Historias items={TRES} etiqueta="El precio" rotulos={{ anterior: 'Anterior', siguiente: 'Siguiente' }} alSalir={() => undefined} renderItem={(it) => <p data-item={it.id}>{it.id}</p>} />, { anima: true })
  const conTres = (m: string): boolean =>
    /<div role="group" aria-roledescription="historias" aria-label="El precio" data-pieza="historias" data-indice="0"/.test(m) && veces(m, 'data-parte="barra"') === 3 && /data-item="a"/.test(m) && !/data-item="b"/.test(m) &&
    /<button type="button" data-toque="anterior" class="sr-only">Anterior<\/button>/.test(m) && /touch-none/.test(m)
  afirmar(conTres(montadas), '  montadas FUERA del Portfolio con tres pasos: un grupo con nombre, tres barras, sólo el primer ítem pintado y los dos controles del teclado')
  controlPositivo('  el detector ve las del Portfolio de B1.3 (cuatro fijas)', montadas.replace('data-parte="barra"', 'data-parte="barra"></span><span data-parte="barra"'), conTres)
  const comunes = ['_componentes/historias/maquinaDeLasHistorias.ts', '_componentes/historias/Historias.tsx'].map((r) => sinComentarios(leer(r))).join('\n')
  const independientes = (c: string): boolean => !/PortfolioVivo|usePortfolio|data-panel|_secciones\/trabajos/.test(c)
  afirmar(independientes(comunes), '  y no dependen del Portfolio: ni `PortfolioVivo` ni `[data-panel]` (lo propio entra por `items`, `renderItem` y `alSalir`)')
  controlPositivo('  el detector ve una pieza que lee el Portfolio', `${comunes}\nimport type { PortfolioVivo } from '../../_secciones/trabajos/portfolio/usePortfolio'`, independientes)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d B · 30 · T8 y T1 · El scroll nunca avanza las historias, y un solo sonido por toque')

  // [P-H31b] Reemplazada por la spec (servicios: «el freno de arrastre del Portfolio pasa al componente: que lo tenga cualquier uso»): el
  // freno vive en el componente común y frena mientras las historias están montadas y presentes, que es el `historias && panel` del
  // Portfolio (las monta con el panel, adentro de un `AnimatePresence`); el Portfolio ya no frena por su cuenta.
  const freno = sinComentarios(leer('_componentes/historias/frenoDelArrastre.ts'))
  const conFreno = sinComentarios(leer('_componentes/historias/Historias.tsx'))
  const delPortfolio = sinComentarios(leer(`${PORTFOLIO}/usePortfolio.ts`))
  const mandos = sinComentarios(leer(`${PORTFOLIO}/useMandosDelPortfolio.ts`))
  const quieto = ([s, c, p, m]: readonly [string, string, string, string]): boolean =>
    /document\.addEventListener\('touchmove', frenar, \{ passive: false \}\)/.test(s) && /closest\('\[data-lenis-prevent\]'\)/.test(s) &&
    /const presentes = useIsPresent\(\)\s*useFrenoDelArrastre\(presentes\)/.test(c) && !/touchmove|useSinScrollEnLasHistorias/.test(p) &&
    /ir: \(d\) => \(historias \? salir\(/.test(m) && !/useDeslizamientoDelPortfolio|asentamiento/.test(m)
  afirmar(quieto([freno, conFreno, delPortfolio, mandos]), 'mientras corren (montadas y presentes), el dedo no mueve la página (fuera de un diálogo), lo frena el componente común, y la rueda no avanza: sale (abajo a Demos, arriba al título); el asentamiento del scroll de B1.3 se fue')
  controlPositivo('  el detector ve el deslizamiento de B1.3 (el scroll avanzaba de a un proyecto)', [freno, conFreno, delPortfolio, `${mandos}\nuseDeslizamientoDelPortfolio(historias, deslizamiento)`] as const, quieto)
  controlPositivo('  y un freno que sigue frenando durante la salida (montadas, ya no presentes)', [freno, conFreno.replace('useFrenoDelArrastre(presentes)', 'useFrenoDelArrastre(true)'), delPortfolio, mandos] as const, quieto)
  const componente = sinComentarios(leer('_componentes/historias/Historias.tsx'))
  const unSonido = (c: string): boolean => /if \(p\.porElUsuario\) sonar\('tic'\)/.test(c) && /onPointerUp=\{alSubir\}/.test(c) && !/<button[^>]*onClick=\{\(\) => aplicar\.current\(\{ tipo: 'toque', fraccion: 0\.8/.test(c)
  afirmar(unSonido(componente), '  un toque es del puntero sobre la superficie (no un botón: el sonido global no suma un «clic») y suena UN tic, sólo si el cambio lo pidió un gesto')
  controlPositivo('  el detector ve el tic de cada cambio, también el del tiempo', componente.replace('if (p.porElUsuario) sonar(\'tic\')', 'if (p.estado.indice !== antes.indice) sonar(\'tic\')'), unSonido)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d B · 31 · T3 · La entrada: el título sube por delante del logo y queda arriba; recién ahí entran las historias')

  const usePortfolio = sinComentarios(leer(`${PORTFOLIO}/usePortfolio.ts`))
  // [F5b] Reemplazada por la spec (Valentino, 2026-10-20: «de Demos se vuelve directo a las historias; el título aparece solo al salir de las
  // historias hacia arriba y al entrar desde arriba»): adentro, el título se queda sólo si se entró desde arriba.
  type Pide = (h: boolean, f: 'antes' | 'adentro' | 'despues', c: boolean, d: boolean) => boolean
  const reglaDelTitulo = (f: Pide): boolean =>
    f(true, 'antes', true, false) && f(true, 'antes', true, true) && !f(true, 'antes', false, false) && f(true, 'adentro', true, false) && !f(true, 'adentro', true, true) &&
    !f(true, 'despues', true, false) && f(false, 'adentro', true, true) && !f(false, 'antes', true, false)
  const cableadoDeLaRegla = (u: string): boolean =>
    /if \(fase === 'despues' && !vieneDeDemos\) setVieneDeDemos\(true\)/.test(u) && /if \(fase === 'antes' && vieneDeDemos\) setVieneDeDemos\(false\)/.test(u) &&
    /const encabezado = pideElEncabezado\(historias, fase, enCuadro, vieneDeDemos && !conElDefecto\('titulo-desde-demos'\)\)/.test(u) && /const pedidoDelOrden = \{ camara: adentro, encabezado, barra: adentro && !historias, panel: adentro \}/.test(u)
  afirmar(reglaDelTitulo(pideElEncabezado) && cableadoDeLaRegla(usePortfolio), '[F5b] en las historias el título se pide en la aproximación y, adentro, se QUEDA si se entró desde arriba (no cae antes de que entren); desde Demos se vuelve directo a las historias, sin el título, hasta volver a la aproximación')
  controlPositivo('  el detector ve la regla de F5 (adentro siempre: al volver desde Demos el título subía un segundo antes de la historia)', ((h, f, c) => (h ? (f === 'antes' && c) || f === 'adentro' : f === 'adentro')) as Pide, reglaDelTitulo)
  controlPositivo('  y la de B1.3 (el título caía antes de la historia)', ((h, f, c) => (h ? f === 'antes' && c : f === 'adentro')) as Pide, reglaDelTitulo)
  controlPositivo('  y el cableado que no recuerda de dónde se entró', usePortfolio.replace("if (fase === 'despues' && !vieneDeDemos) setVieneDeDemos(true)", ''), cableadoDeLaRegla)
  const texto = (r: readonly { readonly estado: Orden; readonly enS: number }[]): string[] =>
    r.map(({ estado: o, enS }) => `${o.camara ? 'C' : 'c'}${o.encabezado ? 'E' : 'e'}${o.barra ? 'B' : 'b'}${o.panel ? 'P' : 'p'}@${enS.toFixed(2)}`)
  const EN_LA_APROXIMACION: Orden = { camara: false, encabezado: true, barra: false, panel: false }
  const EN_LA_HISTORIA: Orden = { camara: true, encabezado: true, barra: false, panel: true }
  const yaLlego = { camara: -Infinity, encabezado: -1, barra: -Infinity, panel: -Infinity }
  afirmarIgual(texto(recorridoDelOrden(EN_LA_APROXIMACION, EN_LA_HISTORIA, 0.6, false, yaLlego, { historias: true })), ['CEbp@0.00', 'CEbP@0.00'], '  entrando con el título ya arriba (llegó en la aproximación), la historia entra enseguida y el título se queda')
  // [F5] Reemplazada por la spec: el título caía DESPUÉS de la historia (a los 0,58 s, con la escena oscura detrás) y quedaba pegado mientras
  // la página volaba a Demos (medido: 770 ms entero). Ahora todo va a la par de la salida.
  const aDemos = ['CEbp@0.00', 'Cebp@0.00', 'cebp@0.00']
  afirmarIgual(texto(recorridoDelOrden(EN_LA_HISTORIA, AFUERA, 0.6, false, NUNCA, { historias: true })), aDemos, '  y bajando a Demos, [F5] todo a la par de la salida: la historia, la caída del título y el oscurecido')
  controlPositivo('  el detector ve la salida de B (la historia, y después el título, con la escena oscura)', texto(recorridoDelOrden(EN_LA_HISTORIA, AFUERA, 0.6)), (r: string[]) => JSON.stringify(r) === JSON.stringify(aDemos))
  const encabezado = sinComentarios(leer(`${PORTFOLIO}/EncabezadoDelPortfolio.tsx`))
  const sube = (c: string): boolean => /const subida = useTransform\(presencia, \(p\) => `\$\{\(\(1 - p\) \* SUBIDA_DEL_ENCABEZADO_SVH\)\.toFixed\(3\)\}svh`\)/.test(c) && /return subeDesdeAbajo \? <motion\.div data-parte="subida-del-encabezado" style=\{conElDefecto\('historias-de-antes'\) \? \{ y: subida \} : \{ y: subida, opacity: presencia \}\}>\{encabezado\}<\/motion\.div> : encabezado/.test(c)
  afirmar(sube(encabezado) && SUBIDA_DEL_ENCABEZADO_SVH > 40 && /subeDesdeAbajo=\{vivo\.historias\}/.test(escenario), `  el título viene desde abajo (${String(SUBIDA_DEL_ENCABEZADO_SVH)} svh, por delante del logo: el DOM va sobre el lienzo) con su presencia; en escritorio, el marcado de siempre`)
  controlPositivo('  el detector ve el título que aparece en su lugar (sin subir)', encabezado.replace('return subeDesdeAbajo ?', 'return false ?'), sube)
  // [F5] Reemplazada por la spec: además, con un fundido atado a la presencia (P2 sólo desplaza: en 0 quedaba el 40 % del título).
  controlPositivo('  [F5] y el de B (la subida sin el fundido: el título quedaba huérfano sobre Demos)', encabezado.replace(" : { y: subida, opacity: presencia }}", ' : { y: subida }}'), sube)
  afirmar(ENTRADA_DE_LAS_HISTORIAS.duracionS >= 0.6 && ENTRADA_DE_LAS_HISTORIAS.duracionS <= 0.8 && ENTRADA_DE_LAS_HISTORIAS.subidaPx > 0 && ENTRADA_DE_LAS_HISTORIAS.subidaPx <= 32, `  las historias entran tranquilas: un fundido con una subida corta (${String(ENTRADA_DE_LAS_HISTORIAS.subidaPx)} px, ${String(ENTRADA_DE_LAS_HISTORIAS.duracionS * 1000)} ms)`)
  const salidas = (m: string): boolean => /\(hacia === 'adelante' \? irAlPx\(pxDeLaSeccion\(PANTALLAS_POR_PASO\), salidaMs, -2\) : irAlPx\(PX_JUSTO_ANTES_DEL_PIN, salidaMs\)\)/.test(m)
  afirmar(salidas(mandos), '  y las salidas: deslizar hacia arriba vuela a Demos; hacia abajo, al título (justo antes del pin)')
  controlPositivo('  el detector ve una salida hacia abajo que se va al principio de la sección', mandos.replace('irAlPx(PX_JUSTO_ANTES_DEL_PIN, salidaMs))', 'irAlPx(0, salidaMs))'), salidas)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('F5 · 42 · Las historias: el título cae a la par de la salida y el oscurecido va con ellas')

  const alTitulo: Orden = { camara: false, encabezado: true, barra: false, panel: false }
  const aLaHistoria = (o: { readonly historias?: boolean }): string[] => texto(recorridoDelOrden(EN_LA_HISTORIA, alTitulo, 0.6, false, NUNCA, o))
  afirmarIgual(aLaHistoria({ historias: true }), ['CEbp@0.00', 'cEbp@0.00'], 'deslizando hacia abajo (al título) el oscurecido se va con la historia y el título se queda: como en la aproximación')
  controlPositivo('  el detector ve la de escritorio (la cámara esperaba al título, que no se va: la escena quedaba oscura con el título solo)', aLaHistoria({}), (r: string[]) => JSON.stringify(r) === JSON.stringify(['CEbp@0.00', 'cEbp@0.00']))
  // [F5b] Reemplazada por la spec: volviendo desde Demos el título subía primero y se veía un segundo antes de la historia (medido en el sitio,
  // `historias.ts`: el título de 0 a 0,96 con las historias en 0). Ahora no se pide: el oscurecido y la historia juntos, directo.
  const DESDE_DEMOS: Orden = { camara: true, encabezado: false, barra: false, panel: true }
  const deDemos = (pedido: Orden): string[] => texto(recorridoDelOrden(AFUERA, pedido, 0.6, false, NUNCA, { historias: true }))
  afirmarIgual(deDemos(DESDE_DEMOS), ['Cebp@0.00', 'CebP@0.00'], '  [F5b] volviendo desde Demos, directo a las historias: el oscurecido y la historia juntos, sin el título')
  controlPositivo('  el detector ve la vuelta de F5 (el título sube primero y, al 80 %, la historia)', deDemos(EN_LA_HISTORIA), (r: string[]) => JSON.stringify(r) === JSON.stringify(['Cebp@0.00', 'CebP@0.00']))
  const alTituloDesdeDemos = texto(recorridoDelOrden(DESDE_DEMOS, alTitulo, 0.6, false, NUNCA, { historias: true }))
  afirmarIgual(alTituloDesdeDemos, ['Cebp@0.00', 'cebp@0.00', 'cEbp@0.00'], '  [F5b] y saliendo después hacia la sección anterior, el título sube a la par de la historia que se funde (debajo de ella: sin un hueco vacío entre las dos)')
  controlPositivo('  el detector ve el título que espera a que la historia termine de irse (0,7 s sin nada a la vista)', ['Cebp@0.00', 'cebp@0.00', 'cEbp@0.70'], (r: string[]) => JSON.stringify(r) === JSON.stringify(['Cebp@0.00', 'cebp@0.00', 'cEbp@0.00']))
  const vivo = sinComentarios(leer(`${PORTFOLIO}/usePortfolio.ts`))
  const elOrden = sinComentarios(leer(`${PORTFOLIO}/useOrdenDeLaEscena.ts`))
  const cae = (e: string, u: string, o: string): boolean =>
    /const duracion = subeDesdeAbajo && !adentro && !conElDefecto\('historias-de-antes'\) \? duracionDeLaSalida\(PRESENCIA_DEL_ENCABEZADO\.s\) : PRESENCIA_DEL_ENCABEZADO\.s/.test(e) &&
    /animate\(presencia, adentro \? 1 : 0, \{ duration: duracion,/.test(e) && /useOrdenDeLaEscena\(pedidoDelOrden, tituloS, reducido, historias\)/.test(u) &&
    /\{ historias: historias && !conElDefecto\('historias-de-antes'\), pildoraConElPanel: conElDefecto\('pildora-con-el-panel'\) \}/.test(o)
  afirmar(cae(encabezado, vivo, elOrden), '  cableado: en las historias el título cae lo que dura TODA la salida (`duracionDeLaSalida`: se va mientras llega Demos) y el orden sabe que son las historias')
  controlPositivo('  el detector ve la caída corta de B (0,6 s: quedaba un hueco hasta que llegaba Demos)', [encabezado.replace('duracionDeLaSalida(PRESENCIA_DEL_ENCABEZADO.s) : PRESENCIA_DEL_ENCABEZADO.s', 'PRESENCIA_DEL_ENCABEZADO.s : PRESENCIA_DEL_ENCABEZADO.s'), vivo, elOrden] as const, ([e, u, o]: readonly [string, string, string]) => cae(e, u, o))
  controlPositivo('  y el orden que no sabe de las historias', [encabezado, vivo.replace('useOrdenDeLaEscena(pedidoDelOrden, tituloS, reducido, historias)', 'useOrdenDeLaEscena(pedidoDelOrden, tituloS, reducido)'), elOrden] as const, ([e, u, o]: readonly [string, string, string]) => cae(e, u, o))

  // La cuenta del arnés (`scripts-carga/historias-cuenta.ts`), con cuadros armados.
  const c = (t: number, paso: number, titulo: number, historias: number, demos: number, camara = historias > 0.5): CuadroDeLasHistorias => ({ t, paso, enCuadro: true, titulo, historias, demos, camara })
  const cada = (desde: number, hasta: number, f: (t: number) => CuadroDeLasHistorias): CuadroDeLasHistorias[] => Array.from({ length: Math.floor((hasta - desde) / 30) + 1 }, (_, i) => f(desde + i * 30))
  const sana = [...cada(0, 900, (t) => c(t, 0, 1, 1, 0)), ...cada(930, 2100, (t) => c(t, 4, Math.max(0, 1 - (t - 930) / 1180), Math.max(0, 1 - (t - 930) / 700), Math.min(1, Math.max(0, (t - 1500) / 400)), false))]
  const deB = [...cada(0, 900, (t) => c(t, 0, 1, 1, 0)), ...cada(930, 5000, (t) => c(t, 4, t < 1700 ? 1 : 0.4, Math.max(0, 1 - (t - 930) / 700), Math.min(1, Math.max(0, (t - 1500) / 400)), t < 1700))]
  const vacia = [...cada(0, 900, (t) => c(t, 0, 1, 1, 0)), ...cada(930, 2400, (t) => c(t, 4, 0, Math.max(0, 1 - (t - 930) / 200), t > 2000 ? 1 : 0, false))]
  const oscura = cada(0, 1200, (t) => c(t, 3, 1, 0, 0, true))
  // [F5b] La vuelta desde Demos: directo a la historia (sana), o con el título que sube antes (el defecto).
  const desdeDemos = cada(0, 600, (t) => c(t, 4, 0, 0, 1, false))
  const directa = [...desdeDemos, ...cada(630, 1500, (t) => c(t, 3, 0, Math.min(1, (t - 630) / 400), Math.max(0, 1 - (t - 630) / 300), true))]
  const conTitulo = [...desdeDemos, ...cada(630, 1500, (t) => c(t, 3, Math.min(1, (t - 630) / 300), t < 1100 ? 0 : 1, 0, t >= 1100))]
  type Cuenta = (cs: readonly CuadroDeLasHistorias[]) => { readonly violaciones: readonly string[] }
  const cuenta = (f: Cuenta): boolean =>
    f(sana).violaciones.length === 0 && ['titulo-huerfano', 'titulo-pegado'].every((v) => f(deB).violaciones.includes(v)) &&
    f(vacia).violaciones.includes('fondo-vacio') && f(oscura).violaciones.includes('oscuro-sin-historias') &&
    f(directa).violaciones.length === 0 && f(conTitulo).violaciones.includes('titulo-desde-demos')
  afirmar(cuenta(violacionesDeLasHistorias), `  la cuenta del arnés: una salida a la par no viola nada; la de B (el título pegado ${String(LO_QUE_SE_VE.pegadoMs)} ms y huérfano sobre Demos), un hueco sin nada, la escena oscura sin historias y [F5b] el título que vuelve desde Demos se ven por su nombre`)
  controlPositivo('  el detector ve una cuenta que no mira a Demos', (cs: readonly CuadroDeLasHistorias[]) => violacionesDeLasHistorias(cs.map((x) => ({ ...x, demos: 0, paso: 0 }))), cuenta)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('P-H31 · 43 · Para el precio de servicios: una transición propia, el freno en cualquier uso y las barras sobre el acento')

  // a · La transición entra por prop: el ítem va envuelto (en reposo, en 1) y, sin cambio, no hay un saliente. Sin ella, el Portfolio tal cual.
  const Sonda = ({ avance, sentido, children }: { readonly avance: MotionValue<number>; readonly sentido: 1 | -1; readonly children: ReactNode }): React.JSX.Element => (
    <div data-parte="sonda" data-avance={String(avance.get())} data-sentido={String(sentido)}>{children}</div>
  )
  const conLasNuevas = marcar(<Historias items={TRES} etiqueta="El precio" rotulos={{ anterior: 'Anterior', siguiente: 'Siguiente' }} alSalir={() => undefined} renderItem={(it) => <p data-item={it.id}>{it.id}</p>} transicion={{ ms: 600, Envoltorio: Sonda }} colorDeLasBarras={BARRAS_SOBRE_ACENTO} />, { anima: true })
  const envuelta = (m: string): boolean =>
    /<div data-parte="sonda" data-avance="1" data-sentido="1"><p data-item="a">a<\/p><\/div>/.test(m) && !m.includes('data-parte="saliente"') &&
    veces(m, 'style="background-color:color-mix(in srgb, var(--color-fondo) 25%, transparent)"') === 3 && !m.includes('bg-tinta')
  afirmar(envuelta(conLasNuevas), 'con `transicion`, el ítem va envuelto en la de la página (en reposo, avance 1); sin un cambio no hay saliente; con `colorDeLasBarras`, las tres barras en el papel y ninguna en la tinta')
  controlPositivo('  el detector ve el ítem sin envolver', conLasNuevas.replace('<div data-parte="sonda" data-avance="1" data-sentido="1">', '<div>'), envuelta)
  const marcadoDelPortfolio = (m: string, fuente: string): boolean =>
    !m.includes('data-parte="sonda"') && !m.includes('data-parte="saliente"') && !m.includes('style="background-color') &&
    veces(m, 'class="relative h-0.5 flex-1 overflow-hidden rounded-full bg-tinta/25"') === 3 && /<span class="absolute inset-y-0 left-0 bg-tinta" style="width:0(?:\.00)?%"><\/span>/.test(m) &&
    !/transicion=|colorDeLasBarras=/.test(fuente)
  const fuenteDelPortfolio = sinComentarios(leer(`${PORTFOLIO}/HistoriasDelPortfolio.tsx`))
  afirmar(marcadoDelPortfolio(montadas, fuenteDelPortfolio), '  sin las dos props (el Portfolio no las pasa), el marcado de antes: sin envoltorio, sin saliente y las barras de la tinta, con sus clases de siempre')
  controlPositivo('  el detector ve un Portfolio con las barras del acento', [conLasNuevas, fuenteDelPortfolio] as const, ([m, f]: readonly [string, string]) => marcadoDelPortfolio(m, f))
  controlPositivo('  y uno que pasa una transición', [montadas, `${fuenteDelPortfolio}\ntransicion={CORTE}`] as const, ([m, f]: readonly [string, string]) => marcadoDelPortfolio(m, f))

  // La transición de prueba de la galería (un corte diagonal, `_componentes/historias/corteDiagonal.tsx`): crece, y desde la punta del sentido.
  // El área que deja ver un recorte (0 a 10.000, en % cuadrados), por la fórmula del cordón.
  const areaDelRecorte = (recorte: string): number => {
    if (recorte === 'none') return 10_000
    const puntos = [...recorte.matchAll(/(-?[\d.]+)% (-?[\d.]+)%/g)].map((m) => [Number(m[1]), Number(m[2])] as const)
    let doble = 0
    for (let i = 0; i < puntos.length; i++) {
      const a = puntos[i]
      const b = puntos[(i + 1) % puntos.length]
      if (a !== undefined && b !== undefined) doble += a[0] * b[1] - b[0] * a[1]
    }
    return Math.abs(doble) / 2
  }
  type Recorte = typeof recorteDiagonal
  const corteBien = (r: Recorte): boolean => ([1, -1] as const).every((s) => {
    const areas = [0, 0.25, 0.5, 0.75].map((a) => areaDelRecorte(r(a, s)))
    const punta = s === 1 ? '100% 100%' : '0% 0%'
    return (areas[0] ?? 1) < 1 && areas.every((x, k) => k === 0 || x > (areas[k - 1] ?? 0)) && r(1, s) === 'none' && r(0.1, s).includes(punta)
  })
  afirmar(corteBien(recorteDiagonal), '  el corte de prueba: de nada a todo, siempre creciendo; hacia adelante desde abajo a la derecha, hacia atrás desde arriba a la izquierda; en reposo, sin recorte')
  controlPositivo('  el detector ve un corte que no mira el sentido', ((a) => recorteDiagonal(a, 1)) as Recorte, corteBien)

  // c · Las barras sobre un acento (WCAG 1.4.11): el relleno contra el acento y contra la pista, ≥ 3:1 con los tres acentos del tema.
  const tema = leer('../theme-develop.css')
  const hex = (re: RegExp): string => re.exec(tema)?.[1] ?? '#000000'
  const PAPEL = hex(/--color-fondo:\s*(#[0-9A-Fa-f]{6})/)
  const TINTA = hex(/--color-tinta:\s*(#[0-9A-Fa-f]{6})/)
  const ACENTOS = [...tema.matchAll(/--color-acento-(web|ia-automatizacion|software):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => ({ id: m[1] ?? '', hex: m[2] ?? '#000000' }))
  type Rgb = readonly [number, number, number]
  const rgb = (h: string): Rgb => [Number.parseInt(h.slice(1, 3), 16), Number.parseInt(h.slice(3, 5), 16), Number.parseInt(h.slice(5, 7), 16)]
  const lineal = (c: number): number => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4)
  const luz = (c: Rgb): number => 0.2126 * lineal(c[0]) + 0.7152 * lineal(c[1]) + 0.0722 * lineal(c[2])
  const razon = (a: Rgb, b: Rgb): number => (Math.max(luz(a), luz(b)) + 0.05) / (Math.min(luz(a), luz(b)) + 0.05)
  const sobre = (c: Rgb, alfa: number, fondo: Rgb): Rgb => [c[0] * alfa + fondo[0] * (1 - alfa), c[1] * alfa + fondo[1] * (1 - alfa), c[2] * alfa + fondo[2] * (1 - alfa)]
  // Un color de la prop: `var(--color-fondo|tinta)`, o su `color-mix` con transparente al N %.
  const resolver = (css: string, fondo: Rgb): Rgb => {
    const m = /var\(--color-(fondo|tinta)\)(?: (\d+)%)?/.exec(css)
    const base = rgb(m?.[1] === 'tinta' ? TINTA : PAPEL)
    return sobre(base, m?.[2] === undefined ? 1 : Number(m[2]) / 100, fondo)
  }
  const peores = (c: ColorDeLasBarras): { readonly contraElAcento: number; readonly contraLaPista: number } => {
    const r = ACENTOS.map((a) => {
      const acento = rgb(a.hex)
      const relleno = resolver(c.relleno, acento)
      return { contraElAcento: razon(relleno, acento), contraLaPista: razon(relleno, resolver(c.pista, acento)) }
    })
    return { contraElAcento: Math.min(...r.map((x) => x.contraElAcento)), contraLaPista: Math.min(...r.map((x) => x.contraLaPista)) }
  }
  const legibles = (c: ColorDeLasBarras): boolean => ACENTOS.length === 3 && peores(c).contraElAcento >= 3 && peores(c).contraLaPista >= 3
  const peor = peores(BARRAS_SOBRE_ACENTO)
  const deLaTinta: ColorDeLasBarras = { pista: 'color-mix(in srgb, var(--color-tinta) 25%, transparent)', relleno: 'var(--color-tinta)' }
  afirmar(legibles(BARRAS_SOBRE_ACENTO), `  las barras sobre el acento: el relleno ${peor.contraElAcento.toFixed(2)}:1 contra el acento y ${peor.contraLaPista.toFixed(2)}:1 contra la pista, el peor de los tres acentos (≥ 3:1; las de la tinta daban ${peores(deLaTinta).contraElAcento.toFixed(2)}:1)`)
  controlPositivo('  el detector ve las barras de la tinta (las de antes)', deLaTinta, legibles)
  controlPositivo('  y una pista tan clara como el relleno', { ...BARRAS_SOBRE_ACENTO, pista: 'color-mix(in srgb, var(--color-fondo) 80%, transparent)' }, legibles)

}
