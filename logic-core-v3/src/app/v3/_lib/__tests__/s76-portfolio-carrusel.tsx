/**
 * [B1.2e] s76 · EL PORTFOLIO DEBAJO DE 1024: EL CARRUSEL (`docs/rediseno/SPRINT-B12E-NOCTURNO.md`), sin navegador. Reemplaza lo que
 * fijaba las historias del Portfolio (B1.2d B §27, §28 y §31, F5 §42 y el cableado de F5b): debajo de 1024 la sección es un flujo que se
 * scrollea —el título, el carrusel común (`s76-carrusel.invariant.tsx`) con los tres proyectos y «la tuya»— y después la cola de siempre.
 * Cada afirmación con su control positivo. Lo que se mide en el sitio lo corre `scripts-carga/carrusel.ts`.
 *
 *   · el modo lo decide el CSS; el escenario queda sólo para Demos; nada se pide al orden; la rueda y el clic afuera no son del Portfolio;
 *   · la tarjeta trae el video y TODA la información de la tira (de `PROYECTOS`, nada inventado); el flujo, en su orden, con sus anclas;
 *   · la REGLA DE ALTURAS: afuera del flujo la escena ve lo de hoy con el medio que sea, el mínimo es la tabla, y el reloj de Demos arranca
 *     donde termina el flujo.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

import { motionValue } from 'motion/react'

import { TRAMO_ESTIRADO, medidaSinElEstiramiento, type TramoEstirado } from '../escena/tramoEstirado'
import { seccionDe } from '../../_secciones/_contrato/forma'
import { marcar } from '../../_secciones/_invariantes/render'
import { CONTENIDO } from '../../_secciones/trabajos/contenido'
import { PROYECTOS, type ProyectoDelPortfolio } from '../../_secciones/trabajos/proyectos'
import { ANCLAS_DEL_PORTFOLIO } from '../../_secciones/trabajos/portfolio/anclas'
import { EscenarioDelPortfolio } from '../../_secciones/trabajos/portfolio/EscenarioDelPortfolio'
import { CLASE_DEL_VALOR_COMPACTO, Ficha } from '../../_secciones/trabajos/portfolio/Ficha'
import { FlujoDelPortfolio, TARJETAS_DEL_CARRUSEL, indiceDelAncla } from '../../_secciones/trabajos/portfolio/FlujoDelPortfolio'
import {
  PANTALLAS_DESPUES_DEL_FLUJO, PANTALLAS_EXTRA_CON_EL_CARRUSEL, PANTALLAS_MINIMAS_DEL_FLUJO, kDelCarrusel, medioDelFlujo, pasoDelCarrusel,
  pxDeLaSalidaDelCarrusel, pxDeLaSeccionConElCarrusel,
} from '../../_secciones/trabajos/portfolio/medioDelCarrusel'
import { ADENTRO, AFUERA, recorridoDelOrden } from '../../_secciones/trabajos/portfolio/orden'
import {
  PANTALLAS_POR_PASO, PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA, PX_DE_LA_APROXIMACION, PX_DE_LA_COLA, PX_DE_LA_SECCION_EN_LA_TABLA, mostradoDeDemos, mostradoDeLaCola,
  pxDeLaSalida, pxDelMostradoDeLaCola, type AnchoDelPortfolio,
} from '../../_secciones/trabajos/portfolio/pasos'
import { TarjetaDelProyecto } from '../../_secciones/trabajos/portfolio/TarjetaDelProyecto'
import { tramoDelCarrusel } from '../../_secciones/trabajos/portfolio/tramoDelSelector'
import type { PortfolioVivo } from '../../_secciones/trabajos/portfolio/usePortfolio'
import {
  CRITERIOS_DEL_CARRUSEL, arrastreLibre, cambiosDelIndice, noOcupaLaPantalla, quieto, reinicioDelReloj, rotaSola, vacioMaximo,
  type MuestraDelRecorrido, type MuestraDelReloj,
} from '../../../../../scripts-carga/carrusel-cuenta'
import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const PORTFOLIO = '_secciones/trabajos/portfolio'
const veces = (html: string, aguja: string): number => html.split(aguja).length - 1

/** Un Portfolio vivo de mentira, para pintar sus piezas en el servidor (el carrusel, o el selector). */
const vivoDeMentira = (carrusel: boolean): PortfolioVivo => ({
  paso: -1, reducido: false, cerca: true, aLaVista: true, mostradoDeDemos: motionValue(0), camara: false, encabezado: false, barra: false, panel: false,
  ordenQuieto: true, avanceDelPaso: motionValue(0), saltarAlPaso: () => undefined, inerteDesde: () => null, deLaRueda: () => false, enVuelo: () => false,
  carrusel, salidaDeLaCola: () => pxDeLaSalida(PANTALLAS_POR_PASO),
})

/** Los archivos de un directorio, recursivo. */
const archivosDe = (dir: string): string[] => readdirSync(dir).flatMap((n) => {
  const p = path.join(dir, n)
  return statSync(p).isDirectory() ? archivosDe(p) : [p]
})

/** La escena midiendo un scroll `y` con un tramo anotado (o ninguno), sobre un panel de tope `tope` y una ventana `h`. */
function medida(tramo: Omit<TramoEstirado, 'panel'> | null, tope: number, y: number, abajo: number, h: number): { y: number; abajo: number } {
  const panel = { isConnected: true, getBoundingClientRect: () => ({ top: tope }) } as unknown as Element
  TRAMO_ESTIRADO.valor = tramo === null ? null : { ...tramo, panel }
  const r = medidaSinElEstiramiento(y, abajo, 0, h, { y: 0, abajo: 0 })
  TRAMO_ESTIRADO.valor = null
  return { y: r.y, abajo: r.abajo }
}

/**
 * El mapeo afuera del flujo, cada 10 px de la regla: la sección con el carrusel (el medio que sea) contra lo que la escena veía hoy en ese
 * ancho (la aproximación, el medio de los pasos descontado hasta lo que veía, y la cola). Devuelve el peor desvío (px).
 */
function desvioAfueraDelFlujo(ancho: AnchoDelPortfolio, medio: number, h: number, descontar: boolean): number {
  const tope = 5073
  const resto = 20000
  const escala = h / 900
  const cero = tope - h
  const nuevo = pxDeLaSeccionConElCarrusel(medio)
  const antes = PX_DE_LA_APROXIMACION + PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA[ancho] + PX_DE_LA_COLA
  const anotado = tramoDelCarrusel({} as Element, ancho, medio)
  const tramo = { k: anotado.k, arranque: anotado.arranque, largo: anotado.largo }
  let peor = 0
  for (let p = -900; p <= nuevo + 900; p += 10) {
    if (p >= PX_DE_LA_APROXIMACION && p < pxDeLaSalidaDelCarrusel(medio)) continue
    const pAntes = p < PX_DE_LA_APROXIMACION ? p : p - (nuevo - antes)
    const n = medida(descontar ? tramo : null, tope, cero + p * escala, tope + nuevo * escala + resto, h)
    const a = medida(null, tope, cero + pAntes * escala, tope + antes * escala + resto, h)
    peor = Math.max(peor, Math.abs(n.y - a.y), Math.abs(n.abajo - a.abajo))
  }
  return peor
}

export function afirmarElCarruselDelPortfolio(): void {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2e · 44 · Debajo de 1024 el Portfolio es el carrusel: lo decide el CSS, y las historias se fueron del Portfolio')

  const trabajos = sinComentarios(leer('_secciones/trabajos/Trabajos.tsx'))
  const selector = sinComentarios(leer(`${PORTFOLIO}/tramoDelSelector.ts`))
  const loDecideElCss = (t: string, s: string): boolean =>
    t.includes('max-escritorio:[--modo-del-portfolio:carrusel]') && !/--modo-del-portfolio:historias|max-tablet:\[--modo-del-portfolio/.test(t) &&
    /getPropertyValue\('--modo-del-portfolio'\)\.trim\(\) === 'carrusel'/.test(s) && !/matchMedia|innerWidth/.test(s)
  afirmar(loDecideElCss(trabajos, selector), 'la sección escribe `--modo-del-portfolio: carrusel` debajo de 1024 (`max-escritorio:`: de 1023 a 768 inclusive y más abajo) y el JS lo lee del CSS: no mide el ancho')
  controlPositivo('  el detector ve el modo de las historias (B1.2d B)', [trabajos.replace('max-escritorio:[--modo-del-portfolio:carrusel]', 'max-escritorio:[--modo-del-portfolio:historias]'), selector] as const, ([t, s]: readonly [string, string]) => loDecideElCss(t, s))
  const delPortfolio = archivosDe(path.join(V3, '_secciones/trabajos')).filter((a) => /\.tsx?$/.test(a) && !/invariant/.test(a)).map((a) => sinComentarios(readFileSync(a, 'utf8')))
  const sinHistorias = (fuentes: readonly string[]): boolean =>
    fuentes.every((f) => !/_componentes\/historias/.test(f)) && !existsSync(path.join(V3, `${PORTFOLIO}/HistoriasDelPortfolio.tsx`)) && !existsSync(path.join(V3, `${PORTFOLIO}/HistoriaDelProyecto.tsx`)) &&
    existsSync(path.join(V3, '_componentes/historias/Historias.tsx'))
  afirmar(sinHistorias(delPortfolio), `  ninguno de los ${String(delPortfolio.length)} archivos de la sección importa las historias (sus dos piezas del Portfolio se borraron); el componente común queda (lo usa el precio de servicios)`)
  controlPositivo('  el detector ve un Portfolio que todavía las importa', [...delPortfolio, "import { Historias } from '../../../_componentes/historias/Historias'"], sinHistorias)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2e · 45 · El escenario queda para Demos; nada se le pide al orden; la rueda y el clic afuera no son del Portfolio')

  const seccion = seccionDe('trabajos')
  const conCarrusel = marcar(<EscenarioDelPortfolio seccion={seccion} vivo={vivoDeMentira(true)}><p data-de-demos="">demos</p></EscenarioDelPortfolio>, { anima: true })
  const soloDemos = (m: string): boolean =>
    m.includes('<div data-pieza="escenario-de-demos" data-paso="-1" data-fase="antes" class="sticky top-0 h-svh w-full overflow-clip"><p data-de-demos="">demos</p></div>') &&!/columna-del-portfolio|panel-del-portfolio|<h2|escenario-del-portfolio/.test(m)
  afirmar(soloDemos(conCarrusel), 'con el carrusel, el escenario es sólo la pantalla pegada de Demos: sin la columna, sin el título, sin el panel y con otro nombre (el diagnóstico de la carga no lo confunde con el selector)')
  controlPositivo('  el detector ve el escenario del selector', marcar(<EscenarioDelPortfolio seccion={seccion} vivo={vivoDeMentira(false)}><p data-de-demos="">demos</p></EscenarioDelPortfolio>, { anima: true }), soloDemos)
  const usePortfolio = sinComentarios(leer(`${PORTFOLIO}/usePortfolio.ts`))
  const cableado = (u: string): boolean =>
    /const pedidoDelOrden = adentro && !carrusel \? ADENTRO : AFUERA/.test(u) && /setCarrusel\(carruselDe\(el\)\)/.test(u) && /anotarElSelector\(el, panel, PANTALLAS_POR_PASO, \(\) => medio\.current\)/.test(u) &&
    /mostrado\.set\(mostradoDeLaCola\(m\.px, pxDeLaSalidaDelCarrusel\(delFlujo\)\)\)/.test(u) && /publicar\(caja\.current, actual, setPaso, pasoDelCarrusel\(m\.px, delFlujo\)\)/.test(u) &&
    !/historias|vieneDeDemos|pideElEncabezado|salirDeLasHistorias/.test(u)
  afirmar(cableado(usePortfolio), '  con el carrusel no se pide nada al orden (ni la cámara con el oscurecido, ni el título del escenario, ni la barra, ni el panel); el reloj de Demos y el paso salen del flujo medido; y lo de las historias se fue')
  controlPositivo('  el detector ve el pedido de escritorio también con el carrusel', usePortfolio.replace('adentro && !carrusel ? ADENTRO : AFUERA', 'adentro ? ADENTRO : AFUERA'), cableado)
  afirmarIgual(recorridoDelOrden(AFUERA, AFUERA, 0.6), [], '  y el orden con lo pedido afuera no muestra nada: la escena no se oscurece ni la cámara se mueve detrás del carrusel')
  controlPositivo('  el detector ve el pedido de adentro (mostraría la cámara)', recorridoDelOrden(AFUERA, ADENTRO, 0.6), (r: readonly unknown[]) => r.length === 0)
  const mandos = sinComentarios(leer(`${PORTFOLIO}/useMandosDelPortfolio.ts`))
  const sinRueda = (m: string): boolean =>
    /const conLaTrampa = !carrusel && !conElDefecto\('rueda-en-la-entrada'\)/.test(m) && /return !carrusel && v\.fase === 'adentro'/.test(m) && /if \(carrusel \|\| antes === 'adentro'/.test(m) &&
    /adentro: \(\) => !carrusel && vistaDelPaso/.test(m) && /ir: \(d\) => ir\(d, true\),/.test(m) && !/historias|SalidaDeLasHistorias/.test(m)
  afirmar(sinRueda(mandos), '  y la rueda con el carrusel no manda, no atrapa la entrada ni se traga nada (ni la inercia que entra), y el clic afuera no sale: el scroll es de la página')
  controlPositivo('  el detector ve la rueda que manda también con el carrusel', mandos.replace("return !carrusel && v.fase === 'adentro'", "return v.fase === 'adentro'"), sinRueda)
  const flujoYTarjeta = ['FlujoDelPortfolio.tsx', 'TarjetaDelProyecto.tsx', 'useDisparoPorLinea.ts', 'useMedioDelCarrusel.ts'].map((a) => sinComentarios(leer(`${PORTFOLIO}/${a}`))).join('\n')
  const sinTrampa = (c: string): boolean => !/touch-none|preventDefault|stopPropagation|'wheel'|touchmove|onTouchMove|sticky/.test(c)
  afirmar(sinTrampa(flujoYTarjeta), '  el flujo y la tarjeta no pegan nada ni cancelan el dedo o la rueda: nada se pega mientras pasan')
  controlPositivo('  el detector ve un flujo pegado', `${flujoYTarjeta}\n<div className="sticky top-0 h-svh" />`, sinTrampa)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2e · 46 · La tarjeta: el video del proyecto y TODA la información de la tira, de `PROYECTOS`')

  const textosDe = (p: ProyectoDelPortfolio): string[] =>
    [p.nombre, p.rubro, p.fecha, p.servicio, p.queHicimos, p.problemaCliente, p.problemaResuelto, p.resultado, p.resena?.texto ?? null, p.resena?.autor ?? null, p.alt].filter((t): t is string => t !== null)
  const tarjeta = (p: ProyectoDelPortfolio, activa: boolean, cerca: boolean): string => marcar(<TarjetaDelProyecto proyecto={p} activa={activa} corre={false} reinicio={0} cerca={cerca} reducido={false} />, { anima: true })
  const entera = (m: string, p: ProyectoDelPortfolio): boolean =>
    textosDe(p).every((t) => m.includes(t)) && new RegExp(`<h3[^>]*>[\\s\\S]*?${p.nombre}[\\s\\S]*?</h3>`).test(m) &&
    new RegExp(`<a href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="Visitar sitio de ${p.nombre}, se abre en una pestaña nueva"`).test(m) &&
    m.includes(`data-marca-de-agua="${p.slug}"`) && veces(m, 'data-fila="') >= 6 && m.includes('Lo que dice el cliente')
  afirmar(PROYECTOS.every((p) => entera(tarjeta(p, true, true), p)), 'cada tarjeta trae todo lo de su tira: el nombre (h3), el rubro, la fecha, qué hicimos, el problema, lo que resolvimos, la reseña y su firma, el servicio (oculto como siempre), «Visitar sitio ↗» con su sitio (aparte, sin referente) y la marca de agua; los textos salen de `PROYECTOS`: ninguno se acortó ni se inventó')
  controlPositivo('  el detector ve la ficha corta de las historias (sin la fecha ni la reseña)', tarjeta(PROYECTOS[0], true, true).replace('Marzo 2026', '').replaceAll('Lo que dice el cliente', ''), (m: string) => entera(m, PROYECTOS[0]))
  const video = (m: string, p: ProyectoDelPortfolio): { readonly src: boolean; readonly poster: boolean } => ({ src: m.includes(`src="${p.medios.video.escritorio}"`), poster: m.includes(`poster="${p.medios.poster.escritorio}"`) })
  const p0 = PROYECTOS[0]
  afirmarIgual([video(tarjeta(p0, true, true), p0), video(tarjeta(p0, false, true), p0), video(tarjeta(p0, true, false), p0)], [{ src: true, poster: true }, { src: false, poster: true }, { src: false, poster: false }], '  el video del recorrido (16:10): sólo la tarjeta activa lo pide, las de al lado tienen su póster listo, y sin la sección cerca nada')
  const elVideo = /<video [^>]*data-cual="escritorio"[^>]*\smuted=""[^>]*\sloop=""[^>]*class="pointer-events-none h-full w-full object-contain"/.test(tarjeta(p0, true, true)) && !/<a [^>]*tabindex="-1"/.test(tarjeta(p0, true, true))
  afirmar(elVideo, '  `muted loop`, contenido, sin el enlace encima (mantener apretado sobre un enlace abre el menú del teléfono)')
  const conFicha = marcar(<Ficha proyecto={p0} visible reducido={false} desde={2} compacta />, { anima: false })
  const sinCompacta = marcar(<Ficha proyecto={p0} visible reducido={false} desde={2} />, { anima: false })
  const compacta = (m: string): boolean => veces(m, CLASE_DEL_VALOR_COMPACTO) === 7
  afirmar(compacta(conFicha) && veces(sinCompacta, CLASE_DEL_VALOR_COMPACTO) === 0, '  en el teléfono la ficha de la tarjeta va en `caption` (los seis valores y la reseña); sin la prop, la de escritorio, igual que siempre')
  controlPositivo('  el detector ve la ficha de escritorio en la tarjeta', sinCompacta, compacta)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2e · 47 · El flujo: el título, el carrusel y «la tuya», en ese orden, con sus anclas')

  const flujo = marcar(<FlujoDelPortfolio seccion={seccion} vivo={vivoDeMentira(true)} />, { anima: true })
  // [C2-40] El título y el carrusel en la MISMA pantalla (`data-pantalla="portfolio"`): entre ella y «la tuya» no empieza otra.
  const enOrden = (m: string): boolean => {
    const p = m.indexOf('data-pantalla="portfolio"')
    const t = m.indexOf('data-parte="titulo"')
    const c = m.indexOf('data-parte="carrusel"')
    const l = m.indexOf('data-pantalla="la-tuya"')
    return p >= 0 && t > p && c > t && l > c && veces(m.slice(p, l), 'data-pantalla=') === 1 && /<h2[^>]*>[\s\S]*Portfolio/.test(m.slice(t, c)) && /aria-roledescription="carrusel"/.test(m.slice(c, l)) &&
      veces(m.slice(c, l), 'data-pieza="tarjeta-del-proyecto"') === PROYECTOS.length && m.slice(l).includes(CONTENIDO.laTuya.nombre) && /data-pieza="formulario-de-la-tuya"/.test(m.slice(l)) &&
      ANCLAS_DEL_PORTFOLIO.every((a) => veces(m, `id="${a.id}"`) === 1) && m.includes(`min-height:${(PANTALLAS_MINIMAS_DEL_FLUJO * 100).toFixed(4)}svh`) && m.includes('data-parte="fundido-del-encabezado"')
  }
  afirmar(enOrden(flujo), 'primero «Portfolio» (con su fundido: nunca asoma cortado) y, en la misma pantalla, el carrusel con las tres tarjetas; debajo «la tuya» con el formulario que ya existe; las cuatro anclas una vez cada una (los proyectos en la pantalla del carrusel, «la tuya» en la suya) y el flujo con su alto mínimo')
  controlPositivo('  el detector ve «la tuya» arriba del carrusel', flujo.replace('data-parte="carrusel"', 'data-x="x"').replace('data-pantalla="la-tuya"', 'data-parte="carrusel"').replace('data-x="x"', 'data-pantalla="la-tuya"'), enOrden)
  controlPositivo('  el detector ve el carrusel en otra pantalla que el título', flujo.replace('data-parte="carrusel"', 'data-pantalla="carrusel" data-parte="carrusel"'), enOrden)
  afirmarIgual(TARJETAS_DEL_CARRUSEL.map((t) => t.id), PROYECTOS.map((p) => p.slug), '  las tarjetas son los tres proyectos, en el orden de la spec (la vuelta es infinita)')
  const anclas = (f: (h: string) => number | null): boolean => f('#portfolio-esquina-estudio') === 1 && f('#portfolio-banu-scents') === 2 && f('#trabajos') === 0 && f('#portfolio-la-tuya') === null && f('') === null
  afirmar(anclas(indiceDelAncla), '  el ancla de un proyecto lleva el carrusel a ese proyecto (y `#trabajos`, a El Garage); «la tuya» no es una tarjeta')
  controlPositivo('  el detector ve un carrusel que toma «la tuya» por una tarjeta', ((h: string) => (h === '#portfolio-la-tuya' ? 3 : indiceDelAncla(h))), anclas)
  const cableadoDelFlujo = (t: string): boolean =>
    /\{vivo\.carrusel \? <FlujoDelPortfolio seccion=\{seccion\} vivo=\{vivo\} \/> : null\}/.test(t) && /data-pieza="despues-del-flujo" style=\{ESTILO_DE_LO_QUE_SIGUE_AL_FLUJO\}/.test(t) &&
    /style=\{vivo\.carrusel \? ESTILO_CON_EL_CARRUSEL : ESTILO_DE_LA_SECCION\}/.test(t) && /\{vivo\.carrusel \? null : ANCLAS_DEL_PORTFOLIO\.map/.test(t) && /salidaDeLaCola=\{vivo\.salidaDeLaCola\}/.test(t)
  afirmar(cableadoDelFlujo(trabajos), '  la sección lo monta con el carrusel (hermano de la caja: no va adentro del pin), con lo que sigue (la cola) y su alto; las anclas de los pasos no van; Demos sabe dónde arranca la cola (el foco del teclado la trae ahí)')
  controlPositivo('  el detector ve el flujo adentro de la caja del pin', trabajos.replace('{vivo.carrusel ? <FlujoDelPortfolio seccion={seccion} vivo={vivo} /> : null}', ''), cableadoDelFlujo)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2e · 48 · La REGLA DE ALTURAS con el carrusel: afuera del flujo la escena ve lo de hoy, con el medio que sea')

  const MEDIOS = [PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA.escritorio, 3400, 4462, 5600]
  for (const ancho of ['tablet', 'movil'] as const) {
    for (const medio of MEDIOS) {
      const peor = Math.max(...[844, 1024, 768, 1180].map((h) => desvioAfueraDelFlujo(ancho, medio, h, true)))
      afirmar(peor < 1e-6, `${ancho}, el flujo de ${String(medio)} px de la regla: k = ${kDelCarrusel(medio, ancho).toFixed(5)}, desvío máximo afuera del flujo ${peor.toExponential(1)} px (a 844, 1024, 768 y 1180 de alto)`)
    }
  }
  controlPositivo('sin el descuento del flujo, lo de después se corre', 'movil' as const, (a: AnchoDelPortfolio) => desvioAfueraDelFlujo(a, PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA.escritorio, 844, false) < 1e-6)
  afirmar(
    Math.abs(PANTALLAS_MINIMAS_DEL_FLUJO * 900 - 2982) < 1e-9 && pxDeLaSeccionConElCarrusel(PANTALLAS_MINIMAS_DEL_FLUJO * 900) === PX_DE_LA_SECCION_EN_LA_TABLA && PANTALLAS_EXTRA_CON_EL_CARRUSEL === 0 &&
      Math.abs(PANTALLAS_DESPUES_DEL_FLUJO - (1 + PX_DE_LA_COLA / 900)) < 1e-12,
    `el flujo mide como mínimo ${(PANTALLAS_MINIMAS_DEL_FLUJO * 100).toFixed(2)}svh (el medio de la tabla): la sección mínima es la tabla (6.813 px de la regla, 757svh), así que el alto mínimo del panel nunca la estira por el final; la variable de los pasos va en cero y después del flujo siguen ${(PANTALLAS_DESPUES_DEL_FLUJO * 100).toFixed(2)}svh (la pantalla de la cola y la cola)`,
  )
  afirmarIgual([kDelCarrusel(2982, 'tablet').toFixed(5), kDelCarrusel(2982, 'movil').toFixed(5)], ['0.80118', '0.66831'], '  con el flujo en su mínimo, k = 2.982 / 3.722 en tablet y 2.982 / 4.462 en el teléfono (la escena recorre el medio que veía, más rápido)')
  afirmar(medioDelFlujo(1688, 844) === 1800 && medioDelFlujo(0, 844) === null && medioDelFlujo(500, 0) === null, '  el medio se mide en el DOM: lo que mide el flujo, en px de la regla de esa ventana (sin medir, nada)')
  afirmarIgual([pasoDelCarrusel(899, 3000), pasoDelCarrusel(900, 3000), pasoDelCarrusel(3899, 3000), pasoDelCarrusel(3900, 3000)], [-1, 0, 0, 4], '  el paso con el carrusel: la aproximación, el flujo (sin pasos: el carrusel rota solo) y la cola cuando el pie del flujo llega arriba del cuadro')

  // El reloj de Demos: el mismo número desde el arranque de la cola, esté donde esté.
  const OFFSETS = [-200, 0, 300, 1131, 2000, 2931]
  const deHoy = OFFSETS.map((d) => mostradoDeDemos(pxDeLaSalida(PANTALLAS_POR_PASO) + d, PANTALLAS_POR_PASO))
  const relojIgual = (reloj: (px: number, salida: number) => number): boolean =>
    [3882, 4500, 6200].every((salida) => OFFSETS.every((d, i) => Math.abs(reloj(salida + d, salida) - (deHoy[i] ?? Number.NaN)) < 1e-12))
  afirmar(relojIgual(mostradoDeLaCola), 'el reloj de Demos con el carrusel arranca donde termina el flujo: desde ahí, el mismo número que con los pasos (el título de Demos sube y el último libro se asienta igual)')
  controlPositivo('  el detector ve el reloj de los pasos con el carrusel (Demos llegaría 2.400 px tarde)', ((px: number) => mostradoDeDemos(px, PANTALLAS_POR_PASO)), relojIgual)
  afirmar([0.62, 0.7, 0.9].every((m) => Math.abs(mostradoDeLaCola(pxDelMostradoDeLaCola(m, 4000), 4000) - m) < 1e-12), '  y al revés (el destino del foco del teclado en Demos), con la cola del carrusel')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2e · 49 · La cuenta del banco (`scripts-carga/carrusel-cuenta.ts`), con medidas armadas')

  const muestra = (y: number, carrusel: number, laTuya = 0, demos = 0): MuestraDelRecorrido => ({ y, enCuadro: true, titulo: 0, carrusel, laTuya, demos })
  const cada = (desde: number, hasta: number, f: (y: number) => MuestraDelRecorrido): MuestraDelRecorrido[] => Array.from({ length: Math.floor((hasta - desde) / 20) + 1 }, (_, i) => f(desde + i * 20))
  const sano = [...cada(0, 900, (y) => muestra(y, 1)), ...cada(920, 1400, (y) => muestra(y, 0)), ...cada(1420, 3000, (y) => muestra(y, 0, 1))]
  const conHueco = [...cada(0, 900, (y) => muestra(y, 1)), ...cada(920, 2200, (y) => muestra(y, 0)), ...cada(2220, 3000, (y) => muestra(y, 0, 0, 1))]
  type Cuenta = { readonly vacio: (m: readonly MuestraDelRecorrido[], alto: number) => number; readonly libre: (a: number, m: number) => boolean; readonly ocupa: (c: number, v: number) => boolean }
  const cuenta = (f: Cuenta): boolean =>
    f.vacio(sano, 844) <= CRITERIOS_DEL_CARRUSEL.vacioPantallas && f.vacio(conHueco, 844) > CRITERIOS_DEL_CARRUSEL.vacioPantallas &&
    f.libre(300, 297) && !f.libre(300, 0) && !f.libre(300, -40) && !f.libre(-300, 120) && f.ocupa(650, 844) && !f.ocupa(844, 844)
  afirmar(cuenta({ vacio: vacioMaximo, libre: arrastreLibre, ocupa: noOcupaLaPantalla }), `el banco ve un hueco de más de una pantalla sin nada a la vista (y deja pasar el respiro de medio), un arrastre atrapado (la página quieta o al revés) y un carrusel que ocupa el cuadro (más del ${String(CRITERIOS_DEL_CARRUSEL.altoMaximo * 100)} %)`)
  controlPositivo('  el detector ve una cuenta que no mira «la tuya» (el respiro sano sería un hueco)', { vacio: (m: readonly MuestraDelRecorrido[], alto: number) => vacioMaximo(m.map((x) => ({ ...x, laTuya: 0 })), alto), libre: arrastreLibre, ocupa: noOcupaLaPantalla }, cuenta)
  controlPositivo('  y una que da por libre la página quieta', { vacio: vacioMaximo, libre: () => true, ocupa: noOcupaLaPantalla }, cuenta)
  const reloj = (cambios: readonly (readonly [number, number])[], hasta: number): MuestraDelReloj[] => {
    const serie: MuestraDelReloj[] = []
    let i = 0
    for (let t = 0; t <= hasta; t += 100) {
      while (i < cambios.length && (cambios[i]?.[0] ?? Infinity) <= t) i += 1
      serie.push({ t, indice: i === 0 ? 0 : (cambios[i - 1]?.[1] ?? 0) })
    }
    return serie
  }
  const rotaBien = reloj([[4000, 1], [14_050, 2], [24_000, 0]], 26_000)
  const rotaRapido = reloj([[4000, 1], [9000, 2], [14_000, 0]], 16_000)
  const sinVuelta = reloj([[4000, 1], [14_000, 2], [24_000, 1]], 26_000)
  afirmar(rotaSola(rotaBien, 3).ok && !rotaSola(rotaRapido, 3).ok && !rotaSola(sinVuelta, 3).ok && quieto(reloj([], 12_000)) && !quieto(rotaBien), '  la rotación: cada 10 s (± 0,7) y de a una, dando la vuelta; un carrusel que corre a 5 s o que no vuelve a la primera se ve; en pausa, quieto')
  controlPositivo('  el detector ve una cuenta que no mira los tiempos', ((s: readonly MuestraDelReloj[], n: number) => ({ ok: cambiosDelIndice(s).length >= 2 && n > 0, intervalos: [] })), (f: typeof rotaSola) => f(rotaBien, 3).ok && !f(rotaRapido, 3).ok)
  afirmar(reinicioDelReloj(reloj([[10_100, 2]], 12_000), 0).ok && !reinicioDelReloj(reloj([[4000, 2]], 12_000), 0).ok, '  el reloj que vuelve a empezar: después de un cambio a mano, el siguiente a los 10 s de ESE cambio (no a los 4, lo que le quedaba al de antes)')
  controlPositivo('  el detector ve un reloj que no volvió a empezar', reloj([[4000, 2]], 12_000), (s: readonly MuestraDelReloj[]) => reinicioDelReloj(s, 0).ok)
}
