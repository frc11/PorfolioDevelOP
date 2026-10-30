/**
 * s84 · [C2-41t] DEMOS EN EL TELÉFONO Y LA TABLET (abajo de 1024) — sin navegador, cada afirmación con su control positivo:
 *
 *   1 · las cuentas del carrusel que asoma (`_componentes/carrusel/asoma.ts`): el lugar de cada tarjeta dando la vuelta sin cruzar el
 *       cuadro, adónde se asienta, el arrastre, el ancho de la tarjeta y la pose de la vecina;
 *   2 · el dedo con la máquina común: un arrastre largo pasa a la siguiente y se asienta ahí; uno corto vuelve;
 *   3 · el muestrario montado: cinco tarjetas en el modo `asoma`, la de ahora sola en el recorrido, las barras de las vistas, la portada
 *       vertical y el enlace en otra pestaña; y el dedo puede arrastrar la tarjeta aunque sea un enlace;
 *   4 · lo común no es una trampa ni sabe de quién lo usa (las piezas nuevas del carrusel);
 *   5 · Demos en el flujo: en lo que sigue al flujo del Portfolio, [L2] una pantalla que pasa con el scroll, en las dos ramas, sin la capa
 *       que crecía desde atrás del logo;
 *   6 · el título se levanta con la pieza del Portfolio (no una copia);
 *   7 · la REGLA DE ALTURAS: [L2] Demos mide una pantalla y el tramo del carrusel le devuelve a la escena la cola.
 *
 * Lo que se mide en el sitio (la entrada deslizando, el título que sube, el dedo, las barras) lo corre `scripts-carga/demos-telefono.ts`.
 *
 *   npx tsx src/app/v3/_lib/__tests__/s84-demos-telefono.invariant.tsx   (`test:s84-demos-telefono`)
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { motionValue } from 'motion/react'

import { CarruselDeTarjetas } from '../../_componentes/carrusel/CarruselDeTarjetas'
import { ASOMA, anchoDeLaTarjeta, destinoEnLaVuelta, poseEnLaVuelta, posicionDelArrastre, relativoEnLaVuelta } from '../../_componentes/carrusel/asoma'
import { CARRUSEL, estadoInicialDelCarrusel, siguienteDelCarrusel } from '../../_componentes/carrusel/maquinaDelCarrusel'
import { marcar } from '../../_secciones/_invariantes/render'
import { CATALOGO_DE_DEMOS } from '../../_secciones/trabajos/demos/catalogo'
import { FORMA_DE_LA_TARJETA_DE_DEMO, PROPS_DEL_CARRUSEL_DE_DEMOS } from '../../_secciones/trabajos/demos/CarruselDeDemos'
import { DemosDelFlujo } from '../../_secciones/trabajos/demos/DemosDelFlujo'
import { TitularQueSeLevanta } from '../../_secciones/trabajos/portfolio/levantarse'
import { PANTALLAS_DESPUES_DEL_FLUJO } from '../../_secciones/trabajos/portfolio/medioDelCarrusel'
import { PX_DE_LA_COLA, PX_DE_LA_SECCION_EN_LA_TABLA } from '../../_secciones/trabajos/portfolio/pasos'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
const veces = (html: string, aguja: string): number => html.split(aguja).length - 1
const N = CATALOGO_DE_DEMOS.length

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Las cuentas del carrusel que asoma: la vuelta no cruza el cuadro, se asienta en la más cercana, el ancho y la vecina')

type Relativo = (i: number, p: number, n: number) => number
/** Recorre la posición de a 0,01 por cinco vueltas: ninguna tarjeta salta de lugar mientras está a la vista (|rel| < 1,5). */
const sinSaltosALaVista = (rel: Relativo): boolean => {
  for (let i = 0; i < N; i++) {
    let antes = rel(i, 0, N)
    for (let k = 1; k <= N * 500; k++) {
      const ahora = rel(i, k / 100, N)
      if (Math.abs(ahora - antes) > 0.5 && Math.min(Math.abs(ahora), Math.abs(antes)) < 1.5) return false
      antes = ahora
    }
  }
  return true
}
const lugares = (rel: Relativo): boolean =>
  [0, 1, 2, 3, 4].map((i) => rel(i, 0, N)).join() === '0,1,2,3,-1' && rel(0, 4, N) === 1 && Math.abs(rel(1, 0.3, N) - 0.7) < 1e-9 && Math.abs(rel(0, 0.3, N) + 0.3) < 1e-9
afirmar(lugares(relativoEnLaVuelta) && sinSaltosALaVista(relativoEnLaVuelta), 'cada tarjeta va en su lugar relativo a la de ahora (0 adelante, 1 la que asoma, −1 la que se fue; después de la última asoma la primera), y la vuelta infinita nunca hace saltar una tarjeta a la vista: salta afuera del cuadro')
controlPositivo('  el detector ve una cinta que da la vuelta en el medio del cuadro', ((i: number, p: number, n: number) => ((((i - p) % n) + n) % n)) as Relativo, (r: Relativo) => sinSaltosALaVista(r))
controlPositivo('  y una sin vuelta (la última no asoma la primera)', ((i: number, p: number) => i - p) as Relativo, lugares)

type Destino = (p: number, i: number, n: number) => number
const asienta = (d: Destino): boolean => d(4, 0, N) === 5 && d(0, 4, N) === -1 && Math.abs(d(0.3, 1, N) - 1) < 1e-9 && Math.abs(d(0.3, 0, N)) < 1e-9 && d(7, 2, N) === 7
afirmar(asienta(destinoEnLaVuelta), 'se asienta en el equivalente más cercano: de la última a la primera es un paso adelante (no rebobina las cinco), de la primera a la última uno atrás, y un arrastre a medias vuelve o sigue desde donde quedó')
controlPositivo('  el detector ve un asiento que rebobina (va al índice tal cual)', ((_p: number, i: number) => i) as Destino, asienta)

afirmar(posicionDelArrastre(2, -150, 300) === 2.5 && posicionDelArrastre(2, 150, 300) === 1.5 && posicionDelArrastre(2, 80, 0) === 2, 'el dedo arrastra: a la izquierda la posición avanza hacia la siguiente, a la derecha vuelve, en la proporción del paso (sin medir, quieta)')
controlPositivo('  el detector ve el arrastre al revés', ((b: number, dx: number, paso: number) => b + dx / paso), (f: typeof posicionDelArrastre) => f(2, -150, 300) === 2.5)

const forma = FORMA_DE_LA_TARJETA_DE_DEMO
const anchos = (f: typeof anchoDeLaTarjeta): boolean =>
  Math.abs(f(370, 450, forma) - 270) < 1e-9 && Math.abs(f(720, 2000, forma) - 720 * forma.fraccion) < 1e-9 && Math.abs(f(370, 0, forma) - 370 * forma.fraccion) < 1e-9 && f(0, 400, forma) === 0
afirmar(anchos(anchoDeLaTarjeta) && forma.fraccion < 0.9 && forma.proporcion < 2 / 3, `la tarjeta llena el alto que le queda (en el teléfono, 450 px de alto dan ${String(anchoDeLaTarjeta(370, 450, forma))} px de ancho) sin pasarse del ${String(forma.fraccion * 100)} % del ancho: siempre asoma la siguiente; vertical, algo más angosta que la portada (2:3) porque lleva el nombre debajo`)
controlPositivo('  el detector ve una tarjeta que ignora el alto (se saldría de la pantalla)', ((a: number, _h: number, f: typeof forma) => a * f.fraccion) as typeof anchoDeLaTarjeta, anchos)

const vecina = poseEnLaVuelta(1)
afirmar(
  poseEnLaVuelta(0).escala === 1 && poseEnLaVuelta(0).opacidad === 1 && vecina.escala === ASOMA.escalaDeLaVecina && vecina.opacidad === ASOMA.opacidadDeLaVecina &&
    poseEnLaVuelta(-2).opacidad === vecina.opacidad && Math.abs(poseEnLaVuelta(0.5).escala - (1 + ASOMA.escalaDeLaVecina) / 2) < 1e-9 && vecina.opacidad >= 0.5 && vecina.escala >= 0.9,
  `la de adelante entera; la que asoma, un poco más chica (${String(ASOMA.escalaDeLaVecina)}) y apagada (${String(ASOMA.opacidadDeLaVecina)}), continua mientras se arrastra (sin saltos)`,
)
afirmar(ASOMA.resorte.stiffness === 380 && ASOMA.resorte.damping === 38 && ASOMA.resorte.mass === 0.9, '  y se asienta con el resorte de la UI del sitio (380 / 38 / 0,9)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El dedo con la máquina común: un arrastre largo pasa y se asienta en la siguiente; uno corto vuelve')

/** Un arrastre de `dx` px con tarjetas a `paso` px desde la tarjeta 0: dónde termina la posición (lo que hace el carrusel al soltar). */
const soltarTras = (dx: number, paso: number): number => {
  const e = { ...estadoInicialDelCarrusel(0, N), enVista: true }
  const durante = posicionDelArrastre(0, dx, paso)
  const p = siguienteDelCarrusel(e, { tipo: 'deslice', dx, dy: 4 }, N)
  return destinoEnLaVuelta(durante, p.estado.indice, N)
}
const cerca = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9
const dedoBien = (f: typeof soltarTras): boolean => cerca(f(-180, 290), 1) && cerca(f(180, 290), -1) && Math.abs(f(-(CARRUSEL.desliceMinPx - 5), 290)) < 1e-9 && Math.abs(f(CARRUSEL.desliceMinPx - 5, 290)) < 1e-9
afirmar(dedoBien(soltarTras), `con la tarjeta siguiendo al dedo, soltar después de ${String(CARRUSEL.desliceMinPx)} px pasa a la siguiente (o a la anterior, dando la vuelta) y se asienta ahí; menos, vuelve a su lugar`)
controlPositivo('  el detector ve un carrusel que se queda donde lo soltó el dedo', ((dx: number, paso: number) => posicionDelArrastre(0, dx, paso)) as typeof soltarTras, dedoBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El muestrario montado: cinco tarjetas grandes en el modo que asoma, una en el recorrido, las barras y la portada vertical')

const montado = marcar(<CarruselDeTarjetas {...PROPS_DEL_CARRUSEL_DE_DEMOS} />, { anima: true })
const muestrario = (m: string): boolean => {
  const ranuras = [...m.matchAll(/<div role="group"[^>]*data-parte="ranura"[^>]*>/g)].map((x) => x[0])
  const vista = /<div data-parte="vista"[^>]*class="([^"]*)"/.exec(m)?.[1] ?? ''
  return (
    ranuras.length === N && ranuras.every((r) => r.includes('data-asoma=""')) && ranuras.filter((r) => r.includes('data-activa="si"')).length === 1 &&
    ranuras.filter((r) => r.includes('aria-hidden="true" inert=""')).length === N - 1 &&
    ['flex-1', 'grid-rows-1', 'touch-pan-y', 'overflow-clip'].every((c) => vista.split(' ').includes(c)) &&
    veces(m, 'data-parte="linea"') === N && veces(m, 'data-parte="tarjeta-de-demo"') === N && /data-flecha="anterior"/.test(m) && /data-flecha="siguiente"/.test(m) &&
    CATALOGO_DE_DEMOS.every((d) => m.includes(encodeURIComponent(d.portada)) || m.includes(d.portada)) && !m.includes('-ventana.webp') &&
    veces(m, 'target="_blank" rel="noopener noreferrer"') === N && veces(m, 'stroke-width="1.5"') >= N + 2
  )
}
afirmar(muestrario(montado), `las ${String(N)} demos en el modo que asoma (cada ranura con su lugar), sólo la de ahora a la vista del lector y del teclado (las otras escondidas e inertes), la vista que llena el alto que queda, una barra por demo, las flechas, la portada VERTICAL (la versión de teléfono de cada sitio) y el enlace en otra pestaña con su ↗ (lucide 1,5)`)
const deAntes = marcar(<CarruselDeTarjetas {...PROPS_DEL_CARRUSEL_DE_DEMOS} asoma={null} claseDeLaVista={undefined} />, { anima: true })
controlPositivo('  el detector ve el muestrario de antes (una tarjeta sola, sin asomar)', deAntes, muestrario)
afirmar(PROPS_DEL_CARRUSEL_DE_DEMOS.vistasLlenas === true, '  y las barras de las demos ya vistas quedan llenas, como las historias (la pieza del Portfolio)')

const comun = sinComentarios(leer('_componentes/carrusel/CarruselDeTarjetas.tsx'))
const elDedoArrastra = (c: string): boolean =>
  /const SE_USA_NORMAL_SI_ASOMA = '[^']*'/.test(c) && !/const SE_USA_NORMAL_SI_ASOMA = '[^']*a\[href\]/.test(c) && /esDe\(e\.target, asoma === null \? SE_USA_NORMAL : SE_USA_NORMAL_SI_ASOMA\)/.test(c) &&
  /if \(asoma === null \|\| d\.intencion !== 'costado'\) return/.test(c) && /deslice\.arrastrar\(e\.clientX - d\.x\)/.test(c) && /if \(vivo\.current\.indice === antes\) deslice\.colocar\(\)/.test(c) &&
  /if \(e\.pointerType === 'mouse' && asoma === null\) e\.currentTarget\.setPointerCapture/.test(c)
afirmar(elDedoArrastra(comun), '  el dedo arrastra la tarjeta aunque sea un enlace (antes el deslice sobre una demo no hacía nada: sólo las flechas), sólo de costado (el vertical es de la página), y la suelta en su lugar si no cambió; con el mouse se captura recién al arrastrar (un clic abre la demo)')
controlPositivo('  el detector ve el enlace que frena el deslice (el muestrario de antes)', comun.replace(/const SE_USA_NORMAL_SI_ASOMA = '[^']*'/, "const SE_USA_NORMAL_SI_ASOMA = 'button, a[href]'"), elDedoArrastra)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Las piezas nuevas del carrusel común no son una trampa y no saben de quién las usa')

const piezas = ['asoma.ts', 'useAsoma.ts', 'Ranuras.tsx'].map((a) => sinComentarios(leer(`_componentes/carrusel/${a}`))).join('\n')
const sanas = (c: string): boolean => !/touch-none|preventDefault|stopPropagation|'wheel'|onWheel|touchmove|onTouchMove|h-svh|min-h-svh|h-screen|_secciones|PROYECTOS|CATALOGO_DE_DEMOS|data-panel/.test(c)
afirmar(sanas(piezas), 'el modo que asoma no cancela ni frena eventos, no escucha la rueda ni el `touchmove`, no tiene el alto de la pantalla y no importa nada de las secciones (lo propio de Demos entra por las props)')
controlPositivo('  el detector ve una pieza que lee las demos', `${piezas}\nimport { CATALOGO_DE_DEMOS } from '../../_secciones/trabajos/demos/catalogo'`, sanas)
controlPositivo('  y una que frena el dedo', `${piezas}\nconst x = (e) => e.preventDefault()`, sanas)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Demos en el flujo: una sección más, pegada en lo que sigue al flujo, en las dos ramas; sin la capa que crecía desde atrás')

const trabajos = sinComentarios(leer('_secciones/trabajos/Trabajos.tsx'))
const enElFlujo = (t: string): boolean =>
  /<div data-pieza="despues-del-flujo" style=\{ESTILO_DE_LO_QUE_SIGUE_AL_FLUJO\}>\s*<DemosDelFlujo reducido=\{vivo\.reducido\} \/>\s*<\/div>/.test(t) &&
  /\{vivo\.carrusel \? null : <CapaDeDemos mostrado=\{vivo\.mostradoDeDemos\}/.test(t) && /vivo\.carrusel \? null : \(/.test(t) && (t.match(/<DemosDelFlujo /g) ?? []).length === 1 && !/aria-hidden="true" data-pieza="despues-del-flujo"/.test(t)
afirmar(enElFlujo(trabajos), 'con el carrusel Demos va en lo que sigue al flujo del Portfolio, pegado al pie de «la tuya», en las dos ramas (con y sin coreografía); la capa del escenario (la que crecía desde escala 0 detrás del logo) no se monta')
const deAntesTrabajos = `${trabajos.replace(/\{vivo\.carrusel \? null : <CapaDeDemos/, '{<CapaDeDemos')}\n<div aria-hidden="true" data-pieza="despues-del-flujo" style={ESTILO_DE_LO_QUE_SIGUE_AL_FLUJO} />`
controlPositivo('  el detector ve la entrada de antes (la capa en el escenario, la caja de después vacía)', deAntesTrabajos, enElFlujo)

const delFlujo = marcar(<DemosDelFlujo reducido={false} />, { anima: true })
// [L2] Ya no se pega: una pantalla (un `svh`) que entra y sale con el scroll, como cualquier sección (antes, `sticky top-0` la cola entera).
const pantalla = (m: string): boolean => {
  const tag = /<div data-pantalla="demos"[^>]*>/.exec(m)?.[0] ?? ''
  const clases = /class="([^"]*)"/.exec(tag)?.[1]?.split(' ') ?? []
  return ['h-svh', 'flex', 'flex-col'].every((c) => clases.includes(c)) && !clases.includes('sticky') && /id="demos"/.test(m) && /<h3[^>]*>[\s\S]*Demos[\s\S]*<\/h3>/.test(m) && !/scale\(|--demos-escala|demos-entrada/.test(m)
}
afirmar(pantalla(delFlujo), '  su pantalla: un `svh` de alto con «Demos» (el destino `#demos` del pie), sin escala y [L2] sin pegarse: entra y sale con el scroll, no crece')
controlPositivo('  el detector ve la capa que crece (escala desde 0)', delFlujo.replace('data-pantalla="demos"', 'data-pantalla="demos" data-x="--demos-escala:0"'), pantalla)
controlPositivo('  [L2] el detector ve la pantalla pegada de antes', delFlujo.replace(/(data-pantalla="demos"[^>]*class=")/, '$1sticky top-0 '), pantalla)
// [L2] 4 · El velo del Portfolio también en Demos del teléfono (Valentino, 41: «a demos y la descrp ponele el mismo velo que en portfolio»):
// el halo en el bloque y el degradé detrás de la bajada, en las mismas reglas de `banda.css` que el encabezado del Portfolio.
const BANDA = leer('_estilos/banda.css').replace(/\/\*[\s\S]*?\*\//g, '')
const conElVelo = (css: string): boolean => {
  const regla = (cola: string): string => (css.match(new RegExp(`[^{}]*\\{[^}]*${cola}[^}]*\\}`, 'g')) ?? []).join('\n')
  const halo = regla('text-shadow: var\\(--halo-sobre-la-escena\\)')
  const degrade = regla('background: var\\(--degrade-del-velo\\)')
  return /\[data-pieza='encabezado-del-portfolio'\],/.test(halo) && /\[data-pantalla='demos'\] \[data-parte='titulo'\],/.test(halo) &&
    /\[data-pieza='encabezado-del-portfolio'\] p::before/.test(degrade) && /\[data-pantalla='demos'\] \[data-parte='titulo'\] p::before,/.test(degrade)
}
afirmar(conElVelo(BANDA), '  [L2] el bloque de Demos del teléfono lleva el halo del Portfolio y su bajada el mismo velo (el degradé detrás), en las mismas reglas: antes sólo lo tenía la capa de escritorio')
controlPositivo('  el detector ve Demos sin el velo (sólo la capa de escritorio, la de antes)', BANDA.replaceAll("  [data-v3] [data-panel='trabajos'] [data-pantalla='demos'] [data-parte='titulo'] p::before,\n", ''), conElVelo)
const capa = sinComentarios(leer('_secciones/trabajos/demos/DemosDelFlujo.tsx'))
afirmar(!/anotarTramo|scale|--demos-escala|requestAnimationFrame|window\.scroll/.test(capa), '  y no escribe nada por cuadro ni mueve la página: la entrada es el scroll del navegador')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El título se levanta desde abajo, con la pieza de «Portfolio» (no una copia), también en el teléfono')

const encabezado = sinComentarios(leer('_secciones/trabajos/portfolio/EncabezadoDelPortfolio.tsx'))
const texto = sinComentarios(leer('_secciones/trabajos/demos/TextoDeDemos.tsx'))
const laMisma = (e: string, d: string, t: string): boolean =>
  /const presencia = usePresencia\(adentro, reducido, PRESENCIA_DEL_ENCABEZADO\)/.test(e) && /useEstiloQueSeLevanta\(presencia\)/.test(e) &&
  /const adentro = useDisparoPorLinea\(titulo\)/.test(d) && /const presencia = usePresencia\(adentro, reducido, PRESENCIA_DEL_ENCABEZADO\)/.test(d) && /levantarse=\{presencia\}/.test(d) &&
  /<TitularQueSeLevanta presencia=\{levantarse\}>\{titular\}<\/TitularQueSeLevanta>/.test(t) && ![e, d, t].some((f) => /110%|rotateX|transformPerspective/.test(f))
afirmar(laMisma(encabezado, capa, texto), '«Demos» y «Portfolio» usan la misma pieza (`levantarse.tsx`): el disparo por línea, la presencia de los títulos y el titular que sube de acostado a parado; ninguno tiene su copia del efecto')
controlPositivo('  el detector ve una copia del efecto en Demos', [encabezado, `${capa}\nconst y = useTransform(presencia, [0, 1], ['110%', '0%'])`, texto] as const, ([e, d, t]: readonly [string, string, string]) => laMisma(e, d, t))
const pose = (p: number): string => /data-parte="se-levanta"[^>]*style="([^"]*)"/.exec(marcar(<TitularQueSeLevanta presencia={motionValue(p)}><h3>Demos</h3></TitularQueSeLevanta>, { anima: true }))?.[1] ?? ''
const seLevanta = (acostado: string, parado: string): boolean => acostado.includes('translateY(110%)') && acostado.includes('rotateX(70deg)') && !parado.includes('rotateX(70deg)') && !parado.includes('translateY(110%)')
afirmar(seLevanta(pose(0), pose(1)), `  sin la presencia, acostado y corrido debajo de su ventana («${pose(0)}»); con ella, en su lugar`)
controlPositivo('  el detector ve un título que sólo se funde (sin levantarse)', ['opacity:0', 'opacity:1'] as const, ([a, b]: readonly [string, string]) => seLevanta(a, b))
const enLaPantalla = (m: string): boolean => /data-parte="titulo" style="opacity:1"><div id="demos"/.test(m) && /data-parte="se-levanta"[^>]*><h3/.test(m)
afirmar(enLaPantalla(delFlujo), '  en la pantalla de Demos el titular va adentro de la pieza y el bloque con el fundido de la presencia (servido: a la vista, como el gatillo quieto); no mira el ancho: en el teléfono no se desactiva')
controlPositivo('  el detector ve el titular sin la pieza', delFlujo.replace('data-parte="se-levanta"', 'data-parte="quieto"'), enLaPantalla)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · REGLA DE ALTURAS: [L2] Demos mide una pantalla y el tramo del carrusel le devuelve a la escena la cola entera')

// [L2] La spec cambió (Valentino, 41: «tengo que scrollear bastante en demos para pasar a servicios»): la caja de después del flujo es la
// pantalla de Demos y nada más. La escena no se corre: el tramo del carrusel llega al final de la sección (s76 §48 lo mide con el flujo que sea).
// [INT] El tramo arranca cuando la sección asoma: su largo suma la aproximación (s76 §48 mide la rampa y lo de afuera).
const unaPantalla = (despues: number, t: string, tramo: string): boolean =>
  despues === 1 && /style=\{ESTILO_DE_LO_QUE_SIGUE_AL_FLUJO\}>\s*<DemosDelFlujo/.test(t) && /height: `\$\{\(PANTALLAS_DESPUES_DEL_FLUJO \* 100\)\.toFixed\(4\)\}svh`/.test(t) &&
  /const largo = PX_DE_LA_APROXIMACION \+ pxQueVeLaEscenaDespuesDelPin\(ancho\)/.test(tramo) && PX_DE_LA_COLA === 2931 && PX_DE_LA_SECCION_EN_LA_TABLA === 6813
const tramo = sinComentarios(leer('_secciones/trabajos/portfolio/tramoDelSelector.ts'))
afirmar(unaPantalla(PANTALLAS_DESPUES_DEL_FLUJO, trabajos, tramo), `Demos va adentro de la caja de lo que sigue al flujo, que mide una pantalla (${(PANTALLAS_DESPUES_DEL_FLUJO * 100).toFixed(0)}svh): ni scroll quieto antes de Servicios ni empujón; el tramo anotado le cuenta a la escena la cola de siempre (${String(PX_DE_LA_COLA)} px de la regla)`)
controlPositivo('  el detector ve la cola de antes (Demos pegado 4,26 pantallas)', 1 + PX_DE_LA_COLA / 900, (d: number) => unaPantalla(d, trabajos, tramo))
controlPositivo('  y el tramo de antes (la escena sin la cola: todo lo de después llegaría antes)', tramo.replace('const largo = PX_DE_LA_APROXIMACION + pxQueVeLaEscenaDespuesDelPin(ancho)', 'const largo = PX_DE_LA_APROXIMACION + PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA[ancho]'), (s: string) => unaPantalla(PANTALLAS_DESPUES_DEL_FLUJO, trabajos, s))

cerrar('s84-demos-telefono.invariant')
