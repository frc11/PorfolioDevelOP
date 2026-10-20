/**
 * [B1.2d] s76 · EL SUBSPRINT A DE LOS AJUSTES DEL FRENO DE B1.2c + B1.3 (`docs/rediseno/SPRINT-B1-PORTFOLIO.md` §14), sin navegador: el
 * vuelo con dueño y con fin (A8), la rueda que termina lo que empieza (A3), la píldora que se corre (A1), el clic afuera (A11),
 * «Visitar sitio» con el botón del sitio (A2) y `#trabajos` que entra al Portfolio. (El orden de cuatro piezas, A10: §19 de
 * `s76-portfolio-b12c.tsx`; el reloj de Demos, A9: §6 de `s76-portfolio-mapeo.ts`; las fallas del diagnóstico: s75.) Cada afirmación con
 * su control positivo. La matriz de A8 la corre el arnés en el sitio (`scripts-carga/matriz.ts`).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { ENTRADAS, IDAS_Y_VUELTAS, combinaciones, violaciones, type FotoDelPortfolio } from '../../../../../scripts-carga/a8'

import { CORRIMIENTO, corrimientoPedido, izquierdaCorrida, pedirElCorrimiento, tiemposDelCorrimiento, type Bordes } from '../../_chrome/barra/corrimiento'
import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { marcar } from '../../_secciones/_invariantes/render'
import { activaElHover } from '../../_secciones/trabajos/portfolio/Acordeon'
import { ANCLAS_DEL_PORTFOLIO } from '../../_secciones/trabajos/portfolio/anclas'
import { conElDefecto, vueloPisado, type Vuelo } from '../../_secciones/trabajos/portfolio/medida'
import { HISTERESIS_PX, PX_DE_LA_APROXIMACION, PX_JUSTO_ANTES_DEL_PIN, pasoConHisteresis, pasoEn, PANTALLAS_POR_PASO } from '../../_secciones/trabajos/portfolio/pasos'
import { CLAVE_DEL_VUELO } from '../../_secciones/trabajos/portfolio/saltar'
import { anclaDelHash } from '../../_secciones/trabajos/portfolio/useAnclaDeLaCarga'
import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'

const RAIZ = process.cwd()
const V3 = path.join(RAIZ, 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const PORTFOLIO = '_secciones/trabajos/portfolio'

export function afirmarB12d(): void {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d · 32 · A8 · Un vuelo con dueño y con fin: nunca queda colgado')

  const vuelo = (marca: string | null): Vuelo => ({ id: Symbol('vuelo'), destino: 0, y: 0, marca, cancelar: () => undefined })
  const pisado = (f: (v: Vuelo, l: { readonly userData: Readonly<Record<string, unknown>> } | null) => boolean): boolean =>
    !f(vuelo('portfolio-1'), { userData: { [CLAVE_DEL_VUELO]: 'portfolio-1' } }) &&
    f(vuelo('portfolio-1'), { userData: {} }) &&
    f(vuelo('portfolio-1'), { userData: { [CLAVE_DEL_VUELO]: 'portfolio-2' } }) &&
    !f(vuelo(null), { userData: {} }) &&
    !f(vuelo('portfolio-1'), null)
  afirmar(pisado(vueloPisado), 'un vuelo con Lenis es suyo mientras Lenis lleve su marca (`userData`): la rueda, otro viaje o un ancla la reemplazan y el vuelo se suelta; uno inmediato o sin Lenis no se mira (llega en el acto, o por cuadro)')
  controlPositivo('  el detector ve el vuelo de B1.3 (sólo lo soltaba su llegada)', (): boolean => false, pisado)
  const lenis = readFileSync(path.join(RAIZ, 'node_modules/lenis/dist/lenis.mjs'), 'utf8')
  afirmar(/this\.userData = userData \?\? \{\};/.test(lenis) && /onComplete\?\.\(this\);\s*this\.userData = \{\};/.test(lenis) && /if \(programmatic\) this\.targetScroll = value;/.test(lenis), '  el Lenis instalado pone la marca con cada `scrollTo` y la vacía al llegar; y en un viaje programado lleva el `targetScroll` con el valor animado (por eso la marca y no el destino)')
  const saltar = sinComentarios(leer(`${PORTFOLIO}/saltar.ts`))
  const medida = sinComentarios(leer(`${PORTFOLIO}/medida.ts`))
  const usePortfolio = sinComentarios(leer(`${PORTFOLIO}/usePortfolio.ts`))
  const conDuenoYFin = (s: string, m: string, u: string): boolean =>
    /userData: \{ \[CLAVE_DEL_VUELO\]: marca \}/.test(s) &&
    /const soltar = \(\): void => \{\s*window\.clearTimeout\(vence\)/.test(m) &&
    /vence = window\.setTimeout\(soltar, ms \+ VUELO\.margenMs\)/.test(m) &&
    /if \(pisado !== null && vueloPisado\(pisado, lenis\?\.de \?\? null\)\) pisado\.cancelar\(\)/.test(u) &&
    /return \(\) => vuelo\.current\?\.cancelar\(\)/.test(u)
  afirmar(conDuenoYFin(saltar, medida, usePortfolio), '  la marca viaja en el `scrollTo`; la lectura del scroll suelta el vuelo pisado; vence a lo que dura más un margen; y el vencimiento se borra al soltar (ningún temporizador huérfano), también al desmontar')
  controlPositivo('  el detector ve el vuelo sin vencimiento', [saltar, medida.replace('vence = window.setTimeout(soltar, ms + VUELO.margenMs)', ''), usePortfolio] as const, ([s, m, u]: readonly [string, string, string]) => conDuenoYFin(s, m, u))
  controlPositivo('  y la lectura que no suelta el vuelo pisado (A8.1)', [saltar, medida, usePortfolio.replace('pisado.cancelar()', 'undefined')] as const, ([s, m, u]: readonly [string, string, string]) => conDuenoYFin(s, m, u))
  const rueda = sinComentarios(leer(`${PORTFOLIO}/useRuedaDelPortfolio.ts`))
  const seTragaEnVuelo = (r: string): boolean =>
    /const enVuelo = ocupado && !conElDefecto\('vuelo-sin-dueno'\)/.test(r) && /if \(activa === null && !enVuelo\) \{/.test(r) &&
    /if \(e\.cancelable\) e\.preventDefault\(\)\s*if \(activa === null\) \{\s*gesto = \{ acumulado: 0, ultimo: ahora, disparado: true \}\s*return\s*\}/.test(r)
  afirmar(seTragaEnVuelo(rueda), '  mientras dura un vuelo, la rueda es del Portfolio aunque el panel ya no mande (el vuelo a Demos y hacia arriba publican su destino en el acto): la inercia y las muescas que siguen no se lo pisan')
  controlPositivo('  el detector ve la rueda de B1.3 (con el paso de destino, las muescas iban a Lenis y le pisaban el viaje)', rueda.replace('if (activa === null && !enVuelo) {', 'if (activa === null) {'), seTragaEnVuelo)
  afirmar(!conElDefecto('vuelo-sin-dueno') && /__defectosDelPortfolio/.test(medida) && !/URLSearchParams|location\.search/.test(medida), '  el defecto de A8.1 (para el control positivo del arnés) sólo se pide antes de cargar (`window.__defectosDelPortfolio`): nunca la URL ni el producto')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d · 33 · A3 · La rueda dispara la transición y termina sí o sí: el hover espera')

  const lomo = { x: 900, y: 400, indice: 2, fino: true, mueve: true }
  afirmar(!activaElHover(lomo, 3, true, null, null, true) && !activaElHover({ ...lomo, x: 901 }, 3, true, { x: 900, y: 400 }, null, true) && activaElHover(lomo, 3, true, null, null, false), 'durante una transición que pidió la rueda, un `pointermove` (de 1 px o de cien) no activa ningún lomo; terminada, sí')
  controlPositivo('  el detector ve el hover de B1.2c (un milímetro de mouse cortaba la transición de la rueda)', (e: typeof lomo, tira: number) => e.indice !== tira && e.mueve, (f: (e: typeof lomo, tira: number) => boolean) => !f(lomo, 3))
  const acordeon = sinComentarios(leer(`${PORTFOLIO}/Acordeon.tsx`))
  const mandos = sinComentarios(leer(`${PORTFOLIO}/useMandosDelPortfolio.ts`))
  const cableadoA3 = (a: string, u: string, m: string): boolean =>
    /const deLaRueda = vivo\.deLaRueda\(\) && \(vivo\.enVuelo\(\) \|\| transicion\.fase !== 'quieta'\)/.test(a) &&
    /if \(transicion\.fase === 'quieta'\) activacion\.current = puntero\.current/.test(a) &&
    /deLaRueda\.current = rueda/.test(u) && /saltar\(i, inmediato, false\)/.test(u) && /ir: \(d\) => \(historias \? salir\([\s\S]*?\) : ir\(d, true\)\)/.test(m)
  afirmar(cableadoA3(acordeon, usePortfolio, mandos), '  la transición de la rueda es su vuelo más el cambio de tiras; al terminar, la base del hover es el puntero de ese momento (hace falta un movimiento nuevo). El hover, el clic, las teclas y los toques no la marcan: ahí cruzar lomos sigue yendo al último')
  controlPositivo('  el detector ve el hover que no espera a que la transición termine', [acordeon.replace("(vivo.enVuelo() || transicion.fase !== 'quieta')", 'vivo.enVuelo()'), usePortfolio, mandos] as const, ([a, u, m]: readonly [string, string, string]) => cableadoA3(a, u, m))

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d · 34 · A1 · La píldora se corre a la columna, en dos tiempos')

  // Medido en el sitio (§14.1): la píldora mide 538 px, el botón de sonido termina en 80, la columna es la mitad y el eje, su medio.
  const ANCHO = 538
  const SONIDO = 80
  const destino = (ancho: number): number => izquierdaCorrida({ eje: ancho / 4, borde: ancho / 2 }, ANCHO, SONIDO)
  const aDelEje = (ancho: number): number => Math.abs(destino(ancho) + ANCHO / 2 - ancho / 4) / ancho
  afirmar(aDelEje(1920) < 1e-9 && aDelEje(1440) <= 0.01 && destino(1440) === SONIDO + CORRIMIENTO.aire, 'centrada en el eje del título si entra entre el botón de sonido y el panel con su aire (a 1920, exacta); si no, en el margen después del botón de sonido (a 1440 queda a 0,35 % del eje)', `1440: ${(aDelEje(1440) * 100).toFixed(2)} %`)
  afirmarIgual([destino(1280), destino(1024)], [SONIDO + CORRIMIENTO.aire, SONIDO + CORRIMIENTO.aire], '  a 1280 y a 1024, en el margen: la píldora no entra entre el sonido y el panel (su borde derecho, a 6 px del panel a 1280 y 122 px adentro a 1024: va al FRENO)')
  controlPositivo('  el detector ve la píldora siempre centrada (a 1024 pisaría el botón de sonido)', (p: { readonly eje: number; readonly borde: number }, ancho: number) => p.eje - ancho / 2, (f: (p: { readonly eje: number; readonly borde: number }, ancho: number, sonido: number) => number) => f({ eje: 256, borde: 512 }, ANCHO, SONIDO) >= SONIDO + CORRIMIENTO.aire)
  const enCasa: Bordes = { l: 451, r: 989 }
  const corrida: Bordes = { l: 96, r: 634 }
  const ida = tiemposDelCorrimiento(enCasa, corrida)
  const vuelta = tiemposDelCorrimiento(corrida, enCasa)
  const dosTiempos = (t: readonly [Bordes, Bordes], desde: Bordes, hasta: Bordes): boolean =>
    t[1].l === hasta.l && t[1].r === hasta.r && t[0].r - t[0].l >= desde.r - desde.l && (t[0].l === hasta.l ? t[0].r === desde.r : t[0].l === desde.l && t[0].r === hasta.r)
  afirmar(dosTiempos(ida, enCasa, corrida) && ida[0].l === 96 && ida[0].r === 989 && dosTiempos(vuelta, corrida, enCasa) && vuelta[0].l === 96 && vuelta[0].r === 989, 'yendo: primero el borde izquierdo se estira (la píldora se ensancha, el derecho quieto) y después el derecho se comprime; volviendo, el espejo. Nunca más angosta que su ancho: los ítems no se salen', JSON.stringify(ida))
  controlPositivo('  el detector ve un corrimiento de un tiempo (la píldora entera se traslada)', [corrida, corrida] as const, (t: readonly [Bordes, Bordes]) => dosTiempos(t, enCasa, corrida))
  afirmar(CORRIMIENTO.tiempoMs * 2 === 400 && CORRIMIENTO.consulta === '(min-width: 1024px)', '  unos 400 ms entre los dos tiempos, sólo desde 1024')
  pedirElCorrimiento({ eje: 360, borde: 720 })
  const pedido = corrimientoPedido()
  pedirElCorrimiento(null)
  afirmar(pedido?.eje === 360 && corrimientoPedido() === null, '  el pedido pasa por un almacén de módulo (como el del contacto) y se suelta con `null`')
  const hook = sinComentarios(leer('_chrome/barra/useCorrimientoDeLaPastilla.ts'))
  const barra = sinComentarios(leer('_chrome/barra/BarraDelHome.tsx'))
  const delPortfolio = sinComentarios(leer(`${PORTFOLIO}/useBarraDelPortfolio.ts`))
  const soloLaPildora = (h: string, b: string, p: string): boolean =>
    /useCorrimientoDeLaPastilla\(pastillaRef\)/.test(b) && !/data-parte="esquina"/.test(h) && !/pointer-events|pointerEvents|inert/.test(h) &&
    /window\.matchMedia\(CORRIMIENTO\.consulta\)\.matches && cabecera\.getAttribute\('data-modo'\) !== 'menu'/.test(h) &&
    /for \(const a of animaciones\.current\) a\.cancel\(\)/.test(h) && /const ahora = bordesDe\(el, origen\)/.test(h) &&
    /pedirElCorrimiento\(barra \? geometria : null\)/.test(p) && /const pedir = \(\): void => \{\s*const geometria = geometriaDelPanel\(escenarioDe\(caja\.current\)\)/.test(p) && /return \(\) => \{\s*window\.removeEventListener\('resize', pedir\)\s*pedirElCorrimiento\(null\)/.test(p)
  afirmar(soloLaPildora(hook, barra, delPortfolio), '  se mueve sólo la píldora (la esquina no), sigue usándose durante todo el movimiento, sale de donde está si lo pedido cambia a mitad de camino, y el Portfolio la suelta al salir y al desmontarse')
  // [A2.1] La geometría del panel se publica siempre (el despeje del medio), pero el corrimiento se pide sólo con la barra.
  controlPositivo('  el detector ve un Portfolio que pide el corrimiento sin la barra (la píldora se correría antes de tiempo)', [hook, barra, delPortfolio.replace('pedirElCorrimiento(barra ? geometria : null)', 'pedirElCorrimiento(geometria)')] as const, ([h, b, p]: readonly [string, string, string]) => soloLaPildora(h, b, p))
  controlPositivo('  el detector ve un corrimiento que arranca de su lugar de reposo (saltaría si se da vuelta en el medio)', [hook.replace('const ahora = bordesDe(el, origen)', 'const ahora = enReposo(el, origen)'), barra, delPortfolio] as const, ([h, b, p]: readonly [string, string, string]) => soloLaPildora(h, b, p))

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d · 35 · A11 · El clic afuera: justo antes del pin, con la salida normal')

  afirmar(PX_JUSTO_ANTES_DEL_PIN < PX_DE_LA_APROXIMACION && pasoEn(PX_JUSTO_ANTES_DEL_PIN, PANTALLAS_POR_PASO) === -1 && pasoConHisteresis(-1, PX_DE_LA_APROXIMACION + HISTERESIS_PX - 1, PANTALLAS_POR_PASO) === -1, `cae debajo del pin (px ${String(PX_JUSTO_ANTES_DEL_PIN)}: el Portfolio afuera) y la histéresis lo deja afuera hasta que el scroll vuelva a pasar el pin`)
  controlPositivo('  el detector ve un destino en el pin (el redondeo lo dejaría adentro)', PX_DE_LA_APROXIMACION, (px: number) => pasoEn(px, PANTALLAS_POR_PASO) === -1)
  const clic = sinComentarios(leer(`${PORTFOLIO}/useClicAfueraDelPanel.ts`))
  const afuera = (c: string, m: string): boolean =>
    /'\[data-pieza="panel-del-portfolio"\], a, button, input, textarea, select, label, \[role="button"\], \[data-pieza="barra"\], \[data-pieza="sonido-de-la-esquina"\]'/.test(c) &&
    /!c\.adentro\(\) \|\| !window\.matchMedia\(CORRIMIENTO\.consulta\)\.matches/.test(c) && /window\.getSelection\(\)/.test(c) &&
    // La matriz lo encontró: el escenario se vuelve a montar con la rama con coreografía, así que se escucha en la caja y se mira el de ahora.
    /el\.addEventListener\('click', alClic\)/.test(c) && /escenarioDe\(el\)\?\.contains\(e\.target\) !== true/.test(c) &&
    /salir: \(\) => irAlPx\(PX_JUSTO_ANTES_DEL_PIN, salidaMs\)/.test(m)
  afirmar(afuera(clic, mandos), '  desde 1024 y con el panel adentro, un clic en la columna que no sea el panel, los lomos, un control, la barra ni el sonido (ni el fin de una selección) sale con la duración de la salida; sin pista visual')
  controlPositivo('  el detector ve un clic afuera que también contaría el panel', [clic.replace('[data-pieza="panel-del-portfolio"], ', ''), mandos] as const, ([c, m]: readonly [string, string]) => afuera(c, m))
  controlPositivo('  y el oyente colgado del escenario del montaje (se quedaba en uno desconectado: el clic no hacía nada)', [clic.replace("el.addEventListener('click', alClic)", "escenario.addEventListener('click', alClic)"), mandos] as const, ([c, m]: readonly [string, string]) => afuera(c, m))

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d · 36 · A2 · «Visitar sitio» es el botón simple del sitio, importado')

  const cta = marcar(<CtaEnlace href="https://el-garage.com.ar" rotulo="Visitar sitio ↗" etiqueta="Visitar sitio de El Garage, se abre aparte" externo />, { anima: false })
  afirmar(/<a href="https:\/\/el-garage\.com\.ar" target="_blank" rel="noopener noreferrer" aria-label="Visitar sitio de El Garage, se abre aparte" data-pieza="cta" data-variante="linea"/.test(cta) && /data-parte="copia-b" aria-hidden="true"/.test(cta), 'el `CtaEnlace` del sitio (el rollover de dos copias y su subrayado), con el enlace externo y su nombre accesible')
  const tira = sinComentarios(leer(`${PORTFOLIO}/Tira.tsx`))
  const delSitio = (t: string): boolean => /<CtaEnlace\s+href=\{proyecto\.url\}\s+rotulo=\{`\$\{CONTENIDO\.ficha\.visitar\} ↗`\}/.test(t) && /\bexterno\b/.test(t) && !/hover:underline/.test(t)
  afirmar(delSitio(tira), '  y la tira lo importa: no copia su estilo')
  controlPositivo('  el detector ve el enlace de B1.3 (`hover:underline`)', `${tira}\n<a className="hover:underline">Visitar sitio</a>`, delSitio)
  const cualquiera = marcar(<CtaEnlace href="#contacto" rotulo="Hablemos" />, { anima: false })
  afirmar(!/target=|aria-label=/.test(cualquiera), '  los demás `CtaEnlace` del sitio renderizan igual que antes (sin `target` ni etiqueta)')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d · 37 · `#trabajos` entra al Portfolio (como el «Portfolio» de la barra)')

  afirmar(anclaDelHash('#trabajos') === ANCLAS_DEL_PORTFOLIO[0] && anclaDelHash(`#${ANCLAS_DEL_PORTFOLIO[1].id}`) === ANCLAS_DEL_PORTFOLIO[1] && anclaDelHash('#servicios') === undefined, '`#trabajos` lleva a El Garage, como la barra (el salto nativo caía en la aproximación: el logo solo); los deep links siguen igual')
  controlPositivo('  el detector ve el ancla de B1.3 (sólo los deep links)', (h: string) => ANCLAS_DEL_PORTFOLIO.find((a) => `#${a.id}` === h), (f: (h: string) => (typeof ANCLAS_DEL_PORTFOLIO)[number] | undefined) => f('#trabajos') === ANCLAS_DEL_PORTFOLIO[0])
  afirmar(/window\.addEventListener\('hashchange', alCambiarElHash\)/.test(sinComentarios(leer(`${PORTFOLIO}/useAnclaDeLaCarga.ts`))), '  y también cuando el hash cambia sin recargar')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d · 38 · A8 · La matriz del arnés: cada combinación y la cuenta del invariante (`scripts-carga/a8.ts`)')

  const todas = combinaciones()
  // [F2] Reemplazada por la spec: las 12 de la rueda rápida (el trackpad con su inercia) vuelven, porque ya no saltean el Portfolio: quedan
  // atrapadas en la entrada (A2.3 las había pasado a la ráfaga).
  const deLaRuedaRapida = todas.filter((c) => c.entrada.startsWith('rueda-') && c.velocidad === 'rapida')
  afirmar(todas.length === 90 && new Set(todas.map((c) => `${c.entrada}|${c.salida}|${String(c.hover)}|${c.velocidad}`)).size === 90 && deLaRuedaRapida.length === 12 && ENTRADAS.every((e) => todas.some((c) => c.entrada === e)) && IDAS_Y_VUELTAS === 3, `las ${String(todas.length)} combinaciones: ${String(ENTRADAS.length)} entradas por las tres salidas, con y sin hover, lentas y rápidas (las de un salto, una vez; [F2] la rueda rápida es el trackpad con su inercia), cada una con tres idas y vueltas`)
  controlPositivo('  el detector ve la matriz de A2.3 (sin la rueda rápida)', combinaciones().filter((c) => !(c.entrada.startsWith('rueda-') && c.velocidad === 'rapida')), (cs: readonly (typeof todas)[number][]) => cs.length === 90 && cs.filter((c) => c.entrada.startsWith('rueda-') && c.velocidad === 'rapida').length === 12)
  const fotoAdentro: FotoDelPortfolio = { ancho: 1440, quieta: true, paso: 0, panelAdentro: true, ordenQuieto: true, enVuelo: false, barra: true, panelIzq: 720, bordeDelPanel: 720, eje: 360, finDelSonido: 80, pastilla: { l: 96, r: 634 }, pastillaEnLinea: true, fallas: [] }
  const fotoAfuera: FotoDelPortfolio = { ...fotoAdentro, paso: 4, panelAdentro: false, barra: false, panelIzq: 1440, pastilla: { l: 451, r: 989 }, pastillaEnLinea: false }
  const fotoColgada: FotoDelPortfolio = { ...fotoAfuera, quieta: false, enVuelo: true, fallas: ['portfolio-colgado: un salto en vuelo con la página quieta'] }
  const cuenta = (f: (x: FotoDelPortfolio, e: 'adentro' | 'afuera') => readonly string[]): boolean =>
    f(fotoAdentro, 'adentro').length === 0 && f(fotoAfuera, 'afuera').length === 0 &&
    ['no-se-asento', 'vuelo-colgado', 'diagnostico'].every((v) => f(fotoColgada, 'afuera').includes(v)) && f(fotoColgada, 'adentro').includes('no-entro') &&
    f({ ...fotoAdentro, panelIzq: 1440 }, 'adentro').includes('panel-fuera-de-lugar') && f({ ...fotoAdentro, pastilla: { l: 451, r: 989 }, pastillaEnLinea: false }, 'adentro').includes('barra-fuera-de-lugar')
  afirmar(cuenta(violaciones), '  la cuenta: una foto sana, adentro y afuera, no viola nada; el vuelo colgado de A8.1 (y que después no entra), el panel fuera de su lugar y la píldora sin correr se ven por su nombre')
  controlPositivo('  el detector ve una cuenta que no mira nada', (): readonly string[] => [], cuenta)
}
