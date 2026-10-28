/**
 * s78-c21 · [C2-21] (2026-10-23) LA NAVEGACIÓN DESDE LA ESCENA OSCURA, EL DESPLEGABLE, LA PÍLDORA Y EL CHAT — sin navegador, cada
 * afirmación con su control positivo. Lo que mide el navegador está en `scripts-carga/` (navegacion-escena, desplegable, velo y
 * chat-zonas).
 *
 *   1 · la llegada de la escena: el desvío de la cámara, la regla (la cámara, el Portfolio y la noche) y el cableado (el rig la anota, el
 *       viaje la espera antes del velo y del título);
 *   2 · el Portfolio se suelta desde el clic de un viaje que sale de él: el destino fuera del pin y la salida de una;
 *   3 · el desplegable de Servicios: el borde izquierdo, el resaltado que se queda en «Servicios» y el tic de cada ítem;
 *   4 · (las grietas de la página se sacaron en L1: el efecto se rediseña más adelante);
 *   5 · el chat: el geométrico, los colores del home (los de los tokens), las zonas cruciales y el widget del sitio vivo sin tocar.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'


import type { CompanionOverrides } from '@/modules/chatbot/components/LogicCompanion'

import { APARIENCIA_DEL_CHAT, COLORES_DEL_CHAT, LINEA_DEL_CHAT, ZONAS_SIN_CHAT, chatDesvanecido } from '../../_chrome/chat/compuerta'
import { destinoFueraDelPortfolio } from '../../_secciones/trabajos/portfolio/useOrdenDeLaEscena'
import { ADENTRO, AFUERA, recorridoDelOrden } from '../../_secciones/trabajos/portfolio/orden'
import { PANTALLAS_POR_PASO, centroDelPaso, pxDeLaSalida, scrollDelPx } from '../../_secciones/trabajos/portfolio/pasos'
import { ESPERA_MAXIMA_DE_LA_LLEGADA_MS, SIN_CUADROS_MS, TOLERANCIA_DE_LA_LLEGADA, desvioDeLaPose, escenaLlegada, seVeLaSalaEn, type EstadoDeLaLlegada } from '../escena/llegadaDeLaEscena'
import type { PoseDeCinco } from '../escena/viaje'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const RAIZ = process.cwd()
const leer = (rel: string): string => readFileSync(path.join(RAIZ, rel), 'utf8').replace(/\r\n/g, '\n')
const V3 = 'src/app/v3'
const sinComentarios = (c: string): string => c.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La llegada de la escena: la cámara en su pose, el Portfolio y la noche en su punta; el título espera')

const POSE: PoseDeCinco = { angleDeg: 200, height: 3, distance: 12, frameX: 0.1, frameY: -0.05 }
const conDistancia = (f: number): PoseDeCinco => ({ ...POSE, distance: POSE.distance * f })
const desvioBien = (cerca: PoseDeCinco, lejos: PoseDeCinco): boolean =>
  desvioDeLaPose(POSE, POSE) === 0 && desvioDeLaPose(cerca, POSE) <= TOLERANCIA_DE_LA_LLEGADA && desvioDeLaPose(lejos, POSE) > TOLERANCIA_DE_LA_LLEGADA &&
  desvioDeLaPose({ ...POSE, angleDeg: POSE.angleDeg + 360 }, POSE) < 1e-9 && desvioDeLaPose({ ...POSE, frameX: POSE.frameX + 0.02 }, POSE) > TOLERANCIA_DE_LA_LLEGADA
afirmar(desvioBien(conDistancia(1.004), conDistancia(1.03)), `el desvío: la distancia entre las cámaras contra la distancia al logo (0,4 % adentro, 3 % afuera del ${String(TOLERANCIA_DE_LA_LLEGADA * 100)} %), una vuelta entera no cuenta, el encuadre sí`)
controlPositivo('  el detector VE una cámara al 3 % como llegada', [conDistancia(1.03), conDistancia(1.03)] as const, ([a, b]) => desvioBien(a, b))

const LLEGADA: EstadoDeLaLlegada = { viva: POSE, objetivo: POSE, cuadroMs: 1000, ahoraMs: 1016, pesoDelPortfolio: 0, portfolioAdentro: false, noche: 0 }
const reglaBien = (e: EstadoDeLaLlegada): boolean =>
  escenaLlegada(e) && !escenaLlegada({ ...e, viva: conDistancia(1.05) }) && !escenaLlegada({ ...e, pesoDelPortfolio: 0.4 }) && !escenaLlegada({ ...e, pesoDelPortfolio: 1 }) &&
  escenaLlegada({ ...e, pesoDelPortfolio: 1, portfolioAdentro: true }) && !escenaLlegada({ ...e, noche: 0.5 }) && escenaLlegada({ ...e, noche: 1 }) &&
  escenaLlegada({ ...e, viva: conDistancia(1.5), ahoraMs: e.cuadroMs + SIN_CUADROS_MS + 1 })
afirmar(reglaBien(LLEGADA), 'la regla: llegó con la cámara a menos del 1 %, el peso del Portfolio en su punta (0 afuera, 1 adentro) y la noche en una punta; sin cuadros de la escena no espera')
controlPositivo('  el detector VE una regla que no mira el Portfolio', LLEGADA, (e: EstadoDeLaLlegada) => reglaBien(e) && !escenaLlegada({ ...e, pesoDelPortfolio: 0.4 }) && escenaLlegada({ ...e, pesoDelPortfolio: 0.4 }))
afirmar(!seVeLaSalaEn('servicios') && !seVeLaSalaEn('tu-panel') && seVeLaSalaEn('hero') && seVeLaSalaEn('trabajos') && seVeLaSalaEn('por-que-develop') && ESPERA_MAXIMA_DE_LA_LLEGADA_MS <= 1500, `a un destino de papel opaco (Servicios, el Panel) no espera: la sala no se ve; el techo de la espera, ${String(ESPERA_MAXIMA_DE_LA_LLEGADA_MS)} ms`)

const rig = leer(`${V3}/_lib/escena/OrbitRig.tsx`)
const rigBien = (r: string): boolean => {
  const i = r.indexOf('anotarLaCamara(live, target)')
  return i > r.indexOf('SETTLE_EPSILON[channel],') && i < r.indexOf('// 1d · Publicar') && /import \{ TOPE_DEL_CUADRO_DEL_VIAJE_MS, anotarLaCamara, viajeEnCurso \} from '\.\/viaje'/.test(r)
}
afirmar(rigBien(rig), 'el rig anota la cámara viva y la que persigue una vez por cuadro, después de la inercia (el techo de sus líneas lo cuida s8)')
controlPositivo('  el detector VE el rig sin anotarla', rig.replace('anotarLaCamara(live, target)', ''), rigBien)

const efecto = sinComentarios(leer(`${V3}/_componentes/useDeslizamientoDelCta.ts`))
const esperaBien = (f: string): boolean => {
  const terminar = f.slice(f.indexOf('const terminar = (llego: boolean): void => {'), f.indexOf('const alClick = (evento: MouseEvent): void => {'))
  const espera = terminar.indexOf("if (llego && laEscena === 'viajando' && destino !== null) {")
  return espera > 0 && espera < terminar.indexOf('enVuelo = false') && espera < terminar.indexOf('repetirLaLlegadaDelTitulo(') && espera < terminar.indexOf('zona.removeAttribute(ATRIBUTO_DEL_VELO)') &&
    /laEscena = 'esperando'\s*window\.clearTimeout\(reloj\)\s*reloj = undefined\s*cancelarLaEspera = esperarLaLlegada\(destino\.id, \(\) => terminar\(true\)\)\s*return/.test(terminar) &&
    /cancelarLaEspera\?\.\(\)/.test(terminar) && /laEscena = modo === 'salto' \? 'llegada' : 'viajando'/.test(f) && f.includes('onComplete: () => terminar(true)')
}
afirmar(esperaBien(efecto), 'el viaje: llegado el scroll, el velo, la llegada del título y el foco esperan a la escena (con el salto de movimiento reducido, no); una cancelación corta la espera; el reloj de seguridad no la aborta')
controlPositivo('  el detector VE el título en el acto (como antes)', efecto.replace("if (llego && laEscena === 'viajando' && destino !== null) {", 'if (false) {'), esperaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Desde el Portfolio: un viaje que sale lo suelta desde el clic (la cámara, el oscurecido y la píldora)')

const TOPE = 5000
const ALTO = 900
const yDe = (px: number): number => scrollDelPx(px, TOPE, ALTO)
const destinoBien = (f: typeof destinoFueraDelPortfolio): boolean =>
  f(0, TOPE, ALTO) && f(yDe(pxDeLaSalida(PANTALLAS_POR_PASO) + 60), TOPE, ALTO) && !f(yDe(centroDelPaso(0, PANTALLAS_POR_PASO)), TOPE, ALTO) && !f(yDe(centroDelPaso(3, PANTALLAS_POR_PASO)), TOPE, ALTO)
afirmar(destinoBien(destinoFueraDelPortfolio), 'el destino de un viaje, fuera del Portfolio: antes del pin (Home, Quiénes somos) o en la cola (Demos y lo que sigue); adentro de un paso, no')
controlPositivo('  el detector VE una regla que suelta siempre', () => true, destinoBien)

const deUna = recorridoDelOrden(ADENTRO, AFUERA, 1.4, true)
const enOrden = recorridoDelOrden(ADENTRO, AFUERA, 1.4, false)
const salidaBien = (a: typeof deUna, b: typeof enOrden): boolean => a.length === 4 && a.every((x) => x.enS === 0) && (b.find((x) => !x.estado.camara)?.enS ?? 0) > 1.5
afirmar(salidaBien(deUna, enOrden), `irse de una: las cuatro piezas en el acto; en orden, la cámara (la última) se iba a los ${(enOrden.find((x) => !x.estado.camara)?.enS ?? 0).toFixed(2)} s (más 0,7 s de su peso: después de la llegada de cualquier viaje)`)
controlPositivo('  el detector VE la salida en orden como si fuera de una', [enOrden, enOrden] as const, ([a, b]) => salidaBien(a, b))
const orden = sinComentarios(leer(`${V3}/_secciones/trabajos/portfolio/useOrdenDeLaEscena.ts`))
const portfolio = sinComentarios(leer(`${V3}/_secciones/trabajos/portfolio/usePortfolio.ts`))
const soltarBien = (o: string, p: string): boolean =>
  /const deUna = reducido \|\| \(enViaje && !camara && !encabezado && !barra && !panel && !conElDefectoDeLaLlegada\('sin-soltar'\)\)/.test(o) && /siguienteCambio\(actual\.current, cambios\.current, pedidoDeAhora, ahora, titulo\.current, deUna,/.test(o) &&
  /\[camara, encabezado, barra, panel, reducido, enViaje\]/.test(o) && /const sale = useViajeQueSale\(caja\)\s*const adentro = fase === 'adentro' && !sale/.test(p) &&
  /const pedidoDelOrden = adentro && !carrusel \? ADENTRO : AFUERA/.test(p) && /useOrdenDeLaEscena\(pedidoDelOrden, tituloS, reducido\)/.test(p)
afirmar(soltarBien(orden, portfolio), 'cableado: con un viaje que sale (decidido en el clic por su destino), lo pedido es «afuera» y en un viaje se va de una (el `<main>` va apagado: la salida en orden no se ve)')
controlPositivo('  el detector VE el orden de antes en el viaje', orden.replace('titulo.current, deUna,', 'titulo.current, reducido,'), (o: string) => soltarBien(o, portfolio))

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El desplegable de Servicios: su borde izquierdo, el resaltado en «Servicios» y el tic')

const desplegable = sinComentarios(leer(`${V3}/_chrome/barra/DesplegableDeServicios.tsx`))
const hoja = leer(`${V3}/_estilos/barra.css`)
const reglasDelDesplegable = (h: string): string[] => [...h.matchAll(/\[data-parte="desplegable"\][^{]*\{([^}]*)\}/g)].map((m) => m[1] ?? '')
const alineadoBien = (d: string, h: string): boolean => {
  const reglas = reglasDelDesplegable(h)
  const conTranslate = reglas.filter((r) => /\btranslate:/.test(r))
  return /--desplegable-x', `\$\{String\(Math\.min\(ra\.left, b\.getBoundingClientRect\(\)\.left\) - cabecera\.getBoundingClientRect\(\)\.left\)\}px`/.test(d) && !/\(izquierda \+ derecha\) \/ 2/.test(d) &&
    conTranslate.length === 4 && conTranslate.every((r) => /\btranslate: 0 /.test(r))
}
afirmar(alineadoBien(desplegable, hoja), 'el borde izquierdo de la lista en el de «Servicios» (abajo y arriba, abierta y cerrada): sin correrse a la mitad')
controlPositivo('  el detector VE la lista centrada de antes', hoja.replace(/translate: 0 0;/, 'translate: -50% 0;'), (h: string) => alineadoBien(desplegable, h))
// [C2-90] Cerrado y nunca abierto la x del desplegable no está medida: el respaldo no puede ser la mitad de la cabecera (su caja pasaba el borde derecho del teléfono y agrandaba el documento a lo ancho).
const respaldoDeLaX = (h: string): boolean => reglasDelDesplegable(h).some((r) => /\bleft: var\(--desplegable-x, 0(px)?\);/.test(r)) && !/--desplegable-x, *-?\d+(\.\d+)?%/.test(h)
afirmar(respaldoDeLaX(hoja), 'el respaldo de la x de la lista cerrada es 0, no una fracción de la cabecera: sin medir, su caja no pasa el borde derecho (no agranda el documento a lo ancho en el teléfono)')
controlPositivo('  el detector VE el respaldo a la mitad de antes', hoja.replace('--desplegable-x, 0)', '--desplegable-x, 50%)'), (h: string) => respaldoDeLaX(h))
const barra = sinComentarios(leer(`${V3}/_chrome/barra/BarraDelHome.tsx`))
const resaltadoBien = (b: string): boolean =>
  /const alSalir = \(e: PointerEvent\): void => senalar\(enLaLista\(e\.relatedTarget\) \? deServicios\(\) : null\)/.test(b) && /lista\?\.addEventListener\('pointerenter', alEntrarALaLista\)/.test(b) &&
  /lista\?\.addEventListener\('focusin', alEntrarALaLista\)/.test(b) && /const alEntrarALaLista = \(\): void => senalar\(deServicios\(\)\)/.test(b) && /if \(el !== null && el !== senalado\.current\) sonar\('tic'\)/.test(b)
afirmar(resaltadoBien(barra), 'con el mouse (o el foco) en la lista, el resaltado se queda en «Servicios»: al pasar de la píldora a la lista y al entrar a ella (sin un tic de más: es el mismo ítem)')
controlPositivo('  el detector VE el resaltado que volvía al activo', barra.replace('senalar(enLaLista(e.relatedTarget) ? deServicios() : null)', 'senalar(null)'), resaltadoBien)
const ticBien = (d: string): boolean => /data-pieza="desplegable-enlace".*onPointerEnter=\{\(\) => sonar\('tic'\)\} onFocus=\{\(\) => sonar\('tic'\)\}/.test(d) && /import \{ sonar \} from '\.\.\/\.\.\/_lib\/sonido\/bus'/.test(d)
afirmar(ticBien(desplegable), 'cada ítem de la lista hace el tic de la barra (el bus: con el sonido apagado no suena nada)')
controlPositivo('  el detector VE la lista muda', desplegable.replace(" onPointerEnter={() => sonar('tic')}", ''), ticBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El chat: el geométrico, los colores del home, las zonas cruciales y el sitio vivo sin tocar')

const tema = leer('src/app/theme-develop.css')
const token = (nombre: string): string => new RegExp(`--color-${nombre}:\\s*(#[0-9A-Fa-f]{6})`).exec(tema)?.[1]?.toUpperCase() ?? ''
// Compila sólo si lo fijado es asignable a la prop del widget (un objeto, no un literal: las claves de color viajan igual).
const comoProp: CompanionOverrides = APARIENCIA_DEL_CHAT
const coloresBien = (a: typeof APARIENCIA_DEL_CHAT): boolean =>
  a.avatarStyle === 'geometrico' && a.chatSurfaceTint === token('tinta') && a.accentSecondary === token('fondo') && a.accentColor === token('fondo') && a.intensityLevel === 'HIGH' &&
  COLORES_DEL_CHAT.tinta === token('tinta') && comoProp.position === 'bottom_right'
afirmar(coloresBien(APARIENCIA_DEL_CHAT), `los colores del home sobre los de la config: el panel en la tinta (${token('tinta')}, casi opaco) y los chips, el botón y la burbuja en el papel (${token('fondo')}); el avatar, el geométrico (sin la onda: sin el error «attribute r» de su punto)`)
controlPositivo('  el detector VE los chips de la config (la letra roja)', { ...APARIENCIA_DEL_CHAT, accentSecondary: '#EF4444' }, coloresBien)
const companion = leer('src/modules/chatbot/components/LogicCompanion.tsx')
const vivoBien = (c: string): boolean => /export type CompanionOverrides = Partial<Pick<PublicBotConfig, 'avatarStyle' \| 'position'>>/.test(c) && /\(chatbot\.config && overrides \? \{ \.\.\.chatbot\.config, \.\.\.overrides \} : chatbot\.config\)/.test(c)
afirmar(vivoBien(companion), 'el widget del sitio vivo, como lo dejó B11: la prop `overrides` (avatar y esquina) esparcida sobre la config; sin `overrides` (el sitio vivo), la config tal cual')
controlPositivo('  el detector VE el tipo de la prop ensanchado', companion.replace("'avatarStyle' | 'position'", "'avatarStyle' | 'position' | 'accentColor'"), vivoBien)

const zonasBien = (f: typeof chatDesvanecido): boolean => f(true, false) && !f(true, true) && !f(false, false) && !f(false, true)
afirmar(zonasBien(chatDesvanecido) && ZONAS_SIN_CHAT.join() === 'trabajos,servicios' && /^-\d+% 0px -\d+% 0px$/.test(LINEA_DEL_CHAT), 'las zonas cruciales (el Portfolio y Servicios, con su recomendador adentro): cerrado se desvanece; abierto se queda (no se cierra solo); fuera, a la vista')
controlPositivo('  el detector VE un chat que se desvanece abierto', (enZona: boolean) => enZona, zonasBien)
const chat = sinComentarios(leer(`${V3}/_chrome/chat/ChatDelSitio.tsx`))
const servicios = leer(`${V3}/_secciones/servicios/Servicios.tsx`)
const capaBien = (c: string): boolean =>
  /const desvanecido = useDesvanecidoDelChat\(capa, ruta, montado\)/.test(c) && /data-desvanecido=\{desvanecido \? '' : undefined\}\s*inert=\{desvanecido\}/.test(c) && c.includes('data-desvanecido:opacity-0') &&
  c.includes('motion-reduce:transition-none') && /<Recomendador \/>/.test(servicios)
afirmar(capaBien(chat), 'la capa que envuelve al widget: se desvanece con un fundido (sin él con movimiento reducido) y queda inerte; el recomendador va adentro de la sección de Servicios')
controlPositivo('  el detector VE una capa que se esconde pero se alcanza', chat.replace('inert={desvanecido}', ''), capaBien)

cerrar('s78-c21.invariant')
