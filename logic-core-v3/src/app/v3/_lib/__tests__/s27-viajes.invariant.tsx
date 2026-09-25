/**
 * s27 · LOS VIAJES — el navbar lleva a cada sección con el gesto del hero. **[VIAJES]**
 *
 * Custodia la mecánica que se puede afirmar sin navegador: qué enlaces viajan, que el viaje dura
 * siempre lo mismo, de dónde sale cada destino y qué noche se ve durante el viaje. Lo que pide un
 * navegador vivo —que el destino caiga en su nudo en los cuatro anchos y que el estado después del
 * viaje sea el del scroll— lo mide `scripts-viajes/`, con sus propios controles.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { RAIZ } from './s4-corrida'
import { quitarComentarios } from './s3-escaneo'
import {
  DURACION_DEL_DESLIZAMIENTO_S,
  DURACION_DEL_VIAJE_MS,
  CURVA_DEL_VIAJE,
  SELECTOR_DE_LOS_VIAJES,
  SELECTOR_DEL_CTA_DEL_HERO,
} from '../../_componentes/deslizamiento'
import { viajarSinLenis } from '../../_componentes/viajeSinLenis'
import { Navegacion } from '../../_componentes/chrome/Navegacion'
import { Menu } from '../../_chrome/menu/MenuMovil'
import { IDS_DE_SECCION } from '../../_secciones/_contrato/forma'
import { destinoDelViaje } from '../../_componentes/destinosDelViaje'
import { ANCLA_DE_LA_MASCARA, ANCLA_DE_LA_VENTANA_VISIBLE, ANCLA_DEL_TRAZO } from '../../_secciones/_contrato/bloqueAnimado'
import { MARCA_COREOGRAFIA_DEL_HOME } from '../../_secciones/_contrato/marcaCoreografia'
import { VENTANA_DE_LA_SUBIDA_DE_LA_FRASE } from '../../_secciones/por-que-develop/geometria'
import { posicionDeAncla } from '../motion/anclas'
import { LIGHT_ARC } from '../escena/lightArc'
import { RIM_NIGHT_LEVEL } from '../escena/probeLighting'
import { DIA_DEL_FINAL, NOCHE_DISPARADA, aplicarElDiaDelFinal, nivelConLaNocheDisparada, nocheEfectiva, suscribirAlDiaDelFinal } from '../escena/nocheDisparada'
import { claseDelViaje, empezarElViaje, nivelEntre, terminarElViaje, type ViajeEnCurso } from '../escena/viaje'
import { NodoFalso, VENTANA, conDomFalso } from './s27-dom-falso'

const leer = (relativo: string): string => readFileSync(path.join(RAIZ, relativo), 'utf8')
const EFECTO = quitarComentarios(leer('src/app/v3/_componentes/useDeslizamientoDelCta.ts'))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Qué viaja: el CTA del hero, la barra y el menú móvil, con el mismo gesto')

const partes = SELECTOR_DE_LOS_VIAJES.split(', ')
afirmarIgual(partes[0], SELECTOR_DEL_CTA_DEL_HERO, 'el primero sigue siendo el CTA del hero: el gesto es el suyo, no otro')
afirmar(/closest<HTMLAnchorElement>\(SELECTOR_DE_LOS_VIAJES\)/.test(EFECTO), '  y el efecto escucha la lista entera con UN solo `closest`: no hay un segundo gesto')
const literales: readonly [string, string][] = [
  ['src/app/v3/_componentes/chrome/Navegacion.tsx', 'data-pieza="navegacion"'],
  ['src/app/v3/_componentes/chrome/Navegacion.tsx', 'data-pieza="nav-enlace"'],
  ['src/app/v3/_chrome/menu/MenuMovil.tsx', 'data-pieza="menu-movil"'],
  ['src/app/v3/_chrome/menu/MenuMovil.tsx', 'data-parte="item-del-menu"'],
]
for (const [archivo, literal] of literales) {
  afirmar(SELECTOR_DE_LOS_VIAJES.includes(literal) && leer(archivo).includes(literal), `  \`${literal}\` está en el selector y lo EMITE \`${path.basename(archivo)}\` tal cual`)
}
const nada = (): void => undefined
const hrefsDe = (html: string, marca: string): string[] => [...html.matchAll(new RegExp(`<a[^>]*${marca}[^>]*>`, 'g'))].map((m) => /href="([^"]+)"/.exec(m[0])?.[1] ?? '?')
const BARRA = hrefsDe(renderToStaticMarkup(<Navegacion />), 'data-pieza="nav-enlace"')
const MENU = hrefsDe(renderToStaticMarkup(<Menu invertido={false} alCerrar={nada} alContacto={nada} alDesmontar={nada} />), 'data-parte="item-del-menu"')
const esSeccion = (href: string): boolean => (IDS_DE_SECCION as readonly string[]).includes(href.slice(1))
afirmarIgual(BARRA.filter(esSeccion), ['#quienes-somos', '#trabajos', '#servicios', '#por-que-develop'], 'la barra lleva a cuatro secciones de la tabla')
afirmarIgual(MENU, ['#quienes-somos', '#trabajos', '#servicios', '#por-que-develop'], '  y el menú móvil a las mismas cuatro (su «Contacto» es un botón)')
afirmarIgual(BARRA.filter((h) => !esSeccion(h)), ['#contacto'], '«Contacto» no viaja: `#contacto` no es una sección, el efecto lo deja pasar y lo abre el formulario')
afirmar(/const seccion = document\.getElementById\(ancla\.slice\(1\)\)\s*if \(seccion === null\) return/.test(EFECTO), '  y el efecto sale ANTES del `preventDefault` cuando el ancla no es una sección')
controlPositivo('  el chequeo de secciones vería un destino inventado', '#inventada', esSeccion)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Duración constante: cambia la velocidad, no el tiempo')

/** Corre `viajarSinLenis` con un reloj falso a 60 Hz y devuelve en qué instante terminó. */
function cuantoTarda(desde: number, hasta: number, viajar: typeof viajarSinLenis): number {
  const cola: FrameRequestCallback[] = []
  let reloj = 0
  let termino: number | null = null
  const ventana = { scrollY: desde, scrollTo: (_x: number, y: number) => { ventana.scrollY = y } }
  const antes = { window: globalThis.window, raf: globalThis.requestAnimationFrame, caf: globalThis.cancelAnimationFrame, now: performance.now }
  Object.assign(globalThis, { window: ventana, requestAnimationFrame: (f: FrameRequestCallback) => cola.push(f), cancelAnimationFrame: () => undefined })
  Object.defineProperty(performance, 'now', { value: () => reloj, configurable: true })
  try {
    viajar(hasta, DURACION_DEL_VIAJE_MS, CURVA_DEL_VIAJE, () => { termino = reloj })
    for (let i = 0; i < 10_000 && termino === null; i += 1) {
      reloj += 1000 / 60
      const cuadro = cola.splice(0)
      cuadro.forEach((f) => f(reloj))
    }
  } finally {
    Object.assign(globalThis, { window: antes.window, requestAnimationFrame: antes.raf, cancelAnimationFrame: antes.caf })
    Object.defineProperty(performance, 'now', { value: antes.now, configurable: true })
  }
  return termino ?? Number.POSITIVE_INFINITY
}
const CUADRO_MS = 1000 / 60
const corto = cuantoTarda(0, 900, viajarSinLenis)
const largo = cuantoTarda(0, 21_000, viajarSinLenis)
afirmar(Math.abs(corto - largo) < CUADRO_MS, 'sin Lenis, 900 px y 21.000 px tardan lo mismo (dentro de un cuadro)', `${corto.toFixed(1)} ms contra ${largo.toFixed(1)} ms`)
afirmar(Math.abs(largo - DURACION_DEL_VIAJE_MS) <= CUADRO_MS, `  y lo que tardan es \`DURACION_DEL_VIAJE_MS\` (${String(DURACION_DEL_VIAJE_MS)} ms)`)
/** Un viaje por velocidad: la duración sale de la distancia. Tiene que dar distinto. */
const porVelocidad: typeof viajarSinLenis = (destino, _ms, curva, alTerminar) => viajarSinLenis(destino, Math.abs(destino - window.scrollY) / 8, curva, alTerminar)
controlPositivo('  el chequeo vería un viaje que va por velocidad', porVelocidad, (f: typeof viajarSinLenis) => Math.abs(cuantoTarda(0, 900, f) - cuantoTarda(0, 21_000, f)) < CUADRO_MS)
afirmarIgual((EFECTO.match(/duration:/g) ?? []).length, 1, 'con Lenis hay UNA sola duración en el efecto')
afirmar(EFECTO.includes('duration: DURACION_DEL_DESLIZAMIENTO_S') && EFECTO.includes('DURACION_DEL_VIAJE_MS,'), '  y es la constante, la misma que recibe el motor de abajo: ninguna se calcula con la distancia')
afirmarIgual(DURACION_DEL_DESLIZAMIENTO_S * 1000, DURACION_DEL_VIAJE_MS, '  la de Lenis va en segundos, derivada de los mismos milisegundos')
const LIBRERIA = leer('node_modules/lenis/dist/lenis.mjs')
afirmar(LIBRERIA.includes('if (this.duration && this.easing) {') && LIBRERIA.includes('const linearProgress = clamp(0, this.currentTime / this.duration, 1);'), '  y Lenis, con `duration` y `easing`, anima por TIEMPO: el `lerp` (que va por distancia) sólo corre sin duración')
afirmar(!/\blerp\s*:/.test(EFECTO), '  el efecto no le pasa `lerp`')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los destinos: un nudo de la coreografía de cada sección, no un píxel')

const BLOQUE = `[data-arbol="${MARCA_COREOGRAFIA_DEL_HOME}"]`
const bloque = (tope: number, alto: number, rango: string): NodoFalso => new NodoFalso({ tope, alto }, { 'data-rango': rango, 'data-arbol': MARCA_COREOGRAFIA_DEL_HOME })
const PAR_DEL_RANGO: Readonly<Record<string, typeof ANCLA_DEL_TRAZO>> = {
  'ventana-visible': ANCLA_DE_LA_VENTANA_VISIBLE,
  'ventana-del-trazo': ANCLA_DEL_TRAZO,
  'ventana-de-la-mascara': ANCLA_DE_LA_MASCARA,
}
const fin = (b: NodoFalso, v: number): number => {
  const caja = b.getBoundingClientRect()
  return posicionDeAncla(PAR_DEL_RANGO[b.getAttribute('data-rango') ?? ''].fin, { topDoc: caja.top + VENTANA.scrollY, alto: caja.height }, v)
}

/** Quiénes somos: título, trazo, ≠ y cuerpo en la primera pantalla; «El equipo» en la segunda. */
function quienesSomos(topeDelTitulo: number): NodoFalso {
  const titulo = bloque(topeDelTitulo, 100, 'ventana-de-la-mascara')
  return new NodoFalso({ tope: 900, alto: 2700 }, { 'data-panel': 'quienes-somos' })
    .lista(BLOQUE, [titulo, bloque(topeDelTitulo, 100, 'ventana-del-trazo'), bloque(900 + 450, 120, 'ventana-del-trazo'), bloque(900 + 600, 150, 'ventana-visible'), bloque(900 + 1000, 200, 'ventana-de-la-mascara')])
    .responde('[data-composicion="agencia"] > [data-arbol]', titulo)
}
/** El reposo sin el despeje del título: la ventana más tardía de la primera pantalla y nada más. */
const entradaDe = (panel: NodoFalso, v: number): number => Math.ceil(Math.max(...panel.querySelectorAll(BLOQUE).slice(0, 4).map((b) => fin(b, v))))

conDomFalso(900, 72, () => {
  VENTANA.scrollY = 0
  const qs = quienesSomos(900 + 224)
  afirmarIgual(destinoDelViaje(qs as unknown as HTMLElement), entradaDe(qs, 900), 'Quiénes somos: el fin de la ventana más tardía de la primera pantalla (la de «El equipo» no cuenta)')
})
conDomFalso(768, 72, () => {
  const bajo = quienesSomos(900 + 150)
  const destino = destinoDelViaje(bajo as unknown as HTMLElement)
  afirmar(900 + 150 - destino >= 72, '  y si ahí el título ya quedó debajo de la barra (1024 × 768), el último píxel con el título despejado', `el título queda a ${String(900 + 150 - destino)} px del borde`)
  controlPositivo('  el chequeo vería un reposo que mete el título debajo de la barra', entradaDe(bajo, 768), (d: number) => 900 + 150 - d >= 72)
})
conDomFalso(900, 72, () => {
  const titulo = bloque(5073 + 300, 180, 'ventana-de-la-mascara')
  const trabajos = new NodoFalso({ tope: 5073.4, alto: 6813 }, { 'data-panel': 'trabajos' }).responde(`[data-pieza="cartel"] ${BLOQUE}`, titulo)
  afirmarIgual(destinoDelViaje(trabajos as unknown as HTMLElement), 5074, 'Trabajos: el pin del cartel, hacia arriba (el primer píxel pegado), cuando «Portfolio» ya terminó de subir antes (la huida arranca una pantalla después)')
  const tarde = bloque(5073 + 600, 180, 'ventana-de-la-mascara')
  const trabajosTarde = new NodoFalso({ tope: 5073, alto: 6813 }, { 'data-panel': 'trabajos' }).responde(`[data-pieza="cartel"] ${BLOQUE}`, tarde)
  afirmarIgual(destinoDelViaje(trabajosTarde as unknown as HTMLElement), Math.ceil(fin(tarde, 900)), '  y el fin de su subida, si termina después del pin')

  const servicios = new NodoFalso({ tope: 11885.6, alto: 7200 }, { 'data-panel': 'servicios' })
  afirmarIgual(destinoDelViaje(servicios as unknown as HTMLElement), 11885, 'Servicios: el pin, hacia abajo al píxel entero (uno más ya es el 01)')
  controlPositivo('  el chequeo vería un redondeo hacia arriba, que en Servicios ya es el 01', Math.ceil(11885.6), (d: number) => d <= 11885.6)

  const pin = new NodoFalso({ tope: 23205, alto: 3600 })
  const escenario = new NodoFalso({ tope: 23205, alto: 900 }).cercano(BLOQUE, pin)
  const porQue = new NodoFalso({ tope: 23205, alto: 3600 }, { 'data-panel': 'por-que-develop' }).responde('[data-pieza="escenario-del-final"]', escenario)
  afirmarIgual(destinoDelViaje(porQue as unknown as HTMLElement), Math.ceil(23205 + VENTANA_DE_LA_SUBIDA_DE_LA_FRASE.hasta * (3600 - 900)), 'Por qué develOP: el fin de la subida de la frase, hacia arriba (el primer píxel con la frase en su lugar), que es el arranque del primer valor')
  const enLista = new NodoFalso({ tope: 20845, alto: 3000 }, { 'data-panel': 'por-que-develop' })
  afirmarIgual(destinoDelViaje(enLista as unknown as HTMLElement), 20845, '  y en lista (abajo de 1024, sin pin), la frase arriba: el tope de la sección')

  afirmarIgual(destinoDelViaje(new NodoFalso({ tope: 0, alto: 900 }, { 'data-panel': 'hero' }) as unknown as HTMLElement), 0, 'el Hero: su tope')
  const cierre = new NodoFalso({ tope: 27000, alto: 900 }, { 'data-panel': 'cierre' })
  afirmarIgual(destinoDelViaje(cierre as unknown as HTMLElement), 27000 - 72, 'una sección sin nudo vuelve al ancla: su tope menos lo que tapa la barra')
})
const DESTINOS = quitarComentarios(leer('src/app/v3/_componentes/destinosDelViaje.ts')).replace(/'[^']*'|`[^`]*`/g, '')
const sinPixeles = (f: string): boolean => !/[^\w.]\d{2,}/.test(f)
afirmar(sinPixeles(DESTINOS), 'y ningún destino está escrito en píxeles: el módulo no tiene un solo número de dos cifras')
controlPositivo('  el detector vería un destino escrito a mano', 'trabajos: () => 5072,', sinPixeles)
afirmar(EFECTO.includes('const destinoEnPx = destinoDelViaje(seccion)') && EFECTO.includes('lenis.scrollTo(destinoEnPx, {') && EFECTO.includes('destinoEnPx,'), 'los dos motores y el salto van al MISMO píxel, medido en el click')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La noche durante el viaje')

const NOCHE_ANTES = NOCHE_DISPARADA.cantidad
const diaADia: ViajeEnCurso = { destino: 'por-que-develop', clase: 'dia-a-dia', luz: { desde: 1, hasta: 0.95, y0: 0, y1: 20_000 } }
/** El nivel mínimo que se ve recorriendo TODO el arco con la noche disparada puesta, con o sin viaje de día a día. */
function peorNivel(conViaje: boolean): number {
  return conDomFalso(900, 72, () => {
    NOCHE_DISPARADA.cantidad = 1
    if (conViaje) empezarElViaje(diaADia)
    let peor = Number.POSITIVE_INFINITY
    for (let i = 0; i <= 200; i += 1) {
      VENTANA.scrollY = (20_000 * i) / 200
      const arco = LIGHT_ARC[Math.min(LIGHT_ARC.length - 1, Math.floor((i / 200) * LIGHT_ARC.length))].level
      peor = Math.min(peor, nivelConLaNocheDisparada(arco))
    }
    terminarElViaje()
    return peor
  })
}
afirmar(peorNivel(true) >= RIM_NIGHT_LEVEL, 'de día a día, cruzando todo el arco y con la noche disparada puesta, la luz nunca baja al umbral de la noche', `peor ${peorNivel(true).toFixed(3)} contra ${String(RIM_NIGHT_LEVEL)}`)
controlPositivo('  el chequeo vería el mismo recorrido sin viaje, que sí pasa por la noche', false, (v: boolean) => peorNivel(v) >= RIM_NIGHT_LEVEL)
afirmar([0, 0.25, 0.5, 0.75, 1].every((f) => { const n = nivelEntre({ desde: 1, hasta: 0.9, y0: 100, y1: 900 }, 100 + 800 * f); return n <= 1 && n >= 0.9 }), '  la luz va de la de salida a la de llegada y no sale de ese rango')
afirmarIgual([claseDelViaje('dia', 'dia'), claseDelViaje('noche', 'dia'), claseDelViaje('dia', 'noche')], ['dia-a-dia', 'noche-a-dia', 'dia-a-noche'], 'las clases salen de la luz que se VE en cada punta')

const bloqueTapando = { servicios: { tope: -100, pie: 2000 }, tuPanel: { tope: 2000, pie: 4000 }, alto: 900 }
NOCHE_DISPARADA.cantidad = 0.3
DIA_DEL_FINAL.activo = true
empezarElViaje({ destino: 'trabajos', clase: 'dia-a-noche', luz: null })
afirmarIgual(nocheEfectiva(), 0.3, 'en un viaje que cambia de luz el día del final no corta: la noche es la del reloj')
aplicarElDiaDelFinal(bloqueTapando)
afirmarIgual(NOCHE_DISPARADA.cantidad, 0.3, '  y la noche no se repone de golpe detrás del bloque: se vería')
terminarElViaje()
aplicarElDiaDelFinal(bloqueTapando)
afirmarIgual(NOCHE_DISPARADA.cantidad, 1, '  sin viaje sí se repone, como siempre (tapado, no se ve)')
let avisos = 0
const baja = suscribirAlDiaDelFinal(() => {
  avisos += 1
})
aplicarElDiaDelFinal({ servicios: { tope: -3000, pie: -1000 }, tuPanel: { tope: -1000, pie: 500 }, alto: 900 })
aplicarElDiaDelFinal({ servicios: { tope: -3000, pie: -1000 }, tuPanel: { tope: -1000, pie: 500 }, alto: 900 })
baja()
afirmarIgual(avisos, 1, '  el cambio del día avisa una vez por cambio, no por cuadro')
NOCHE_DISPARADA.cantidad = NOCHE_ANTES
DIA_DEL_FINAL.activo = false
const GOTA = quitarComentarios(leer('src/app/v3/_secciones/trabajos/CapaDeLaGota.tsx'))
afirmar(/suscribirAlDiaDelFinal\(\(dia\) => \{\s*if \(viajeEnCurso\(\)\?\.luz === null\) arrancar\(dia \? 'vuelta' : 'ida'\)/.test(GOTA), 'el barrido recorre ese cambio con su propio reloj: la vuelta al hacerse de día, la ida al hacerse de noche')
afirmar(/cruceDelTramo\(\{ cruza, tope: r\.top, pie: r\.bottom \}\) === 'arriba-subiendo' \? 0 : 1/.test(GOTA), '  y al llegar asienta la noche con la regla de las cuatro entradas: la que dejaría el scroll')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El túnel y el rodillo llegan asentados')

const TUNEL = quitarComentarios(leer('src/app/v3/_secciones/trabajos/CapaDelTunel.tsx'))
afirmar(TUNEL.includes('if (viajeEnCurso() !== null) reposarEn(scrollDeAhora())'), 'durante el viaje el túnel no reproduce su zoom: lo mostrado va con la página, quieto')
afirmar(/suscribirAlViaje\(\(\) => \{\s*if \(viajeEnCurso\(\) !== null\) return\s*reposarEn\(scrollDeAhora\(\)\)/.test(TUNEL), '  y al terminar se asienta: resortes y regulador en su reposo para ese punto')
const DISPARO = quitarComentarios(leer('src/app/v3/_secciones/servicios/disparo.ts'))
afirmar(DISPARO.includes('if (viajeEnCurso() !== null) posicion.jump(destino)') && DISPARO.includes('if (viajeEnCurso() === null) posicion.jump(objetivo.get())'), 'el rodillo de Servicios no rota durante el viaje y llega posado')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · La escena durante el viaje: dibuja entera, y se suelta cuando el velo volvió')

const ATADURA = quitarComentarios(leer('src/app/v3/_lib/escena/ataduraAlScroll.ts'))
afirmar(/const enCuadro =\s*viajando \|\|/.test(ATADURA) && ATADURA.includes('!quieta && enCuadro && !viajando &&'), 'con el `<main>` apagado la sala dibuja también en la banda opaca, y sin la máscara del revelado')
afirmar(EFECTO.includes('relojDeLaEscena = window.setTimeout(terminarElViaje, duracionDelFundido(zona))'), '  y la escena sigue de viaje hasta que el velo termina de volver: en un destino opaco no asoma la sala de abajo')

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Movimiento reducido: un salto con un fundido corto')

const COMPUERTA = quitarComentarios(leer('src/app/v3/_componentes/CompuertaDelDeslizamiento.tsx'))
afirmar(COMPUERTA.includes('if (prefiereMenosMovimiento) return <DeslizamientoSinScrollSuave modo="salto" />'), 'con movimiento reducido se monta el salto, en cualquier ancho')
afirmar(EFECTO.includes("window.scrollTo({ top: destinoEnPx, behavior: 'instant' })"), '  que va al MISMO nudo, sin recorrido')
afirmar(/@media \(prefers-reduced-motion: reduce\)[\s\S]*transition-duration: var\(--duracion-rapida\) !important/.test(leer('src/app/v3/_estilos/deslizamiento.css')), '  tapado por el fundido del velo, que la regla global dejaría en 1 ms')

cerrar('s27-viajes.invariant')
