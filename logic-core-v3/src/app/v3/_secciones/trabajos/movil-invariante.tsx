import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'

import { marcar } from '../_invariantes/render'

import { CarruselDeTarjetas } from '../../_componentes/carrusel/CarruselDeTarjetas'

import { CarruselDeDemos, PROPS_DEL_CARRUSEL_DE_DEMOS } from './demos/CarruselDeDemos'
import { CATALOGO_DE_DEMOS } from './demos/catalogo'

/**
 * §27 DEL INVARIANTE DE TRABAJOS — **ABAJO DE 1024.** Lo llama `trabajos.invariant`.
 * **[MÓVIL-TRABAJOS]**
 *
 * Tres cosas que el sprint pidió afirmar: el carrusel ([NOCTURNO B5] el común de B1.2e,
 * con las demos), el pin medido en `svh`, y que la coreografía que cruza el umbral la
 * pide Trabajos y nadie más. Cada una con su control.
 */

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const leer = (...partes: string[]): string => readFileSync(path.join(AQUI, ...partes), 'utf8')
const sinComentarios = (f: string): string =>
  f
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .filter((l) => !/^\s*\/\//.test(l))
    .join('\n')

export function afirmarAbajoDe1024(): void {
  titulo('27 · Abajo de 1024: el carrusel de las demos, el pin en svh y la coreografía que cruza el umbral')

  // ── [NOCTURNO B5] EL CARRUSEL DE LAS DEMOS ES EL DEL PORTFOLIO (B1.2e) ──
  // Reemplazada por la spec (decisión de Valentino: «en el teléfono, el carrusel del Portfolio»). Lo que se afirmaba de la cinta de
  // antes (su física: relajar, el bucle sin costura, el lanzamiento, los dos renglones de una sola fila) se fue con ella. El carrusel
  // común no le roba el scroll a la página y no es una trampa (s76-carrusel lo afirma sobre el componente); acá, que las demos lo usan.
  const DEMOS = sinComentarios(leer('demos/CarruselDeDemos.tsx'))
  const usaElComun = (fuente: string): boolean =>
    /import \{ CarruselDeTarjetas, type EstadoDeLaTarjeta, type PropsDelCarrusel \} from '\.\.\/\.\.\/\.\.\/_componentes\/carrusel\/CarruselDeTarjetas'/.test(fuente) && /<CarruselDeTarjetas \{\.\.\.PROPS_DEL_CARRUSEL_DE_DEMOS\} \/>/.test(fuente) &&
    !/onPointerDown|onTouchMove|setPointerCapture|'wheel'|requestAnimationFrame/.test(fuente)
  afirmar(usaElComun(DEMOS) && !existsSync(path.join(AQUI, 'demos/Carrusel.tsx')) && !existsSync(path.join(AQUI, 'demos/fisicaDelCarrusel.ts')), 'las demos de abajo de 1024 van en el carrusel común de B1.2e (el del Portfolio), sin gestos propios; la cinta de antes y su física se fueron')
  controlPositivo('el detector ve un carrusel de demos con su propio dedo', `${DEMOS}\nconst alApoyar = (e) => e.currentTarget.setPointerCapture(e.pointerId)`, usaElComun)
  // Se monta en el cliente (servido, sus tarjetas de afuera escribirían su transformada): el servidor no lo sirve.
  afirmarIgual(marcar(<CarruselDeDemos />, { anima: true }), '', '  y se monta en el cliente, como el del Portfolio: servido no escribe nada (sus tarjetas de afuera llevan su corrimiento)')
  // Lo que monta el cliente: el carrusel común con lo propio de las demos.
  const marcado = marcar(<CarruselDeTarjetas {...PROPS_DEL_CARRUSEL_DE_DEMOS} />, { anima: true })
  const anclas = [...marcado.matchAll(/<a [^>]*data-parte="tarjeta-de-demo"[^>]*>/g)].map((m) => m[0])
  const tarjetasBien = (as: readonly string[]): boolean =>
    as.length === CATALOGO_DE_DEMOS.length &&
    CATALOGO_DE_DEMOS.every((d, i) => as[i]?.includes(`href="${d.url}"`) === true && as[i]?.includes(`data-demo="${d.slug}"`) === true && as[i]?.includes('target="_blank"') === true && as[i]?.includes('rel="noopener noreferrer"') === true) &&
    as.filter((a) => !a.includes('tabindex="-1"')).length === 1 && !(as[0] ?? '').includes('tabindex="-1"')
  afirmar(tarjetasBien(anclas) && /aria-label="Las demos" data-pieza="carrusel-de-tarjetas"/.test(marcado), `las ${String(CATALOGO_DE_DEMOS.length)} demos, en el orden del catálogo, cada una un enlace a su demo en otra pestaña (afuera y sin acceso a esta ventana); sólo la activa es parada de teclado (las otras, montadas e inertes, fuera del recorrido)`)
  controlPositivo('  el detector ve las tarjetas de afuera en el recorrido', anclas.map((a) => a.replace(' tabindex="-1"', '')), tarjetasBien)
  controlPositivo('  y una demo que falta', anclas.slice(1), tarjetasBien)

  // ── EL PIN Y LAS ANCLAS, EN svh ────────────────────────────────────────
  const EPOCA = sinComentarios(leer('../../_lib/motion/epoca.ts'))
  const anclasEnSvh = (fuente: string): boolean => !/alto:\s*window\.innerHeight/.test(fuente) && /height:100svh/.test(fuente) && (fuente.match(/altoDeLaVentana\(\)/g) ?? []).length >= 2
  afirmar(anclasEnSvh(EPOCA), 'el motor resuelve las anclas contra el `svh` (una sonda de 100svh), no contra `innerHeight`: la barra de Safari no las mueve')
  controlPositivo('el detector ve el motor viejo', 'foto = { epoca: 0, ancho: window.innerWidth, alto: window.innerHeight }', anclasEnSvh)
  const TRABAJOS = sinComentarios(leer('Trabajos.tsx'))
  // [B1] el pin lo lleva el escenario del Portfolio, en todo ancho y en las dos ramas; la sección es la caja alta que lo contiene.
  const ESCENARIO = sinComentarios(leer('portfolio/EscenarioDelPortfolio.tsx'))
  const pinEnSvh = (fuente: string): boolean => /className="sticky top-0 h-svh\b/.test(fuente) && !/\b(h-screen|h-dvh|h-lvh|100vh|100dvh)\b/.test(fuente)
  afirmar(pinEnSvh(ESCENARIO) && !/\b(h-screen|h-dvh|h-lvh|100vh|100dvh)\b/.test(TRABAJOS), '  y el escenario del Portfolio se clava con una caja de 100svh, también abajo de 1024: ni vh, ni dvh')
  controlPositivo('el detector ve un pin en dvh', 'className="sticky top-0 h-dvh w-full"', pinEnSvh)

  // ── LA COREOGRAFÍA QUE CRUZA EL UMBRAL LA PIDE SÓLO TRABAJOS ───────────
  const COMPUERTA = sinComentarios(leer('../CompuertaDelHome.tsx'))
  afirmar(/deberiaAnimar\(true, !politica\.montaElMotorDeProgreso\)/.test(COMPUERTA), 'la compuerta del home la resuelve con la MISMA política de movimiento, sin el ancho')
  // MÓVIL 2: Servicios la pide para su cabeza fija de abajo de 1024 (`angosto.tsx`), y sólo ahí.
  const carpetas = ['hero', 'quienes-somos', 'numeros', 'servicios', 'tu-panel', 'por-que-develop', 'cierre']
  const laPiden = carpetas.flatMap((c) =>
    readdirSync(path.join(AQUI, '..', c))
      .filter((f) => /\.tsx?$/.test(f) && !/invariant|invariante/.test(f))
      .filter((f) => /<CoreografiaEnTodoAncho>/.test(sinComentarios(leer('..', c, f))))
      .map((f) => `${c}/${f}`),
  )
  // SPRINT FINAL: «Por qué develOP» la pide para que su lista de abajo de 1024 llegue con el gesto de la casa.
  afirmarIgual(laPiden, ['servicios/angosto.tsx', 'por-que-develop/PorQueDevelop.tsx', 'cierre/Cierre.tsx'], '  y fuera de Trabajos la piden sólo la cabeza fija de Servicios, la lista de «Por qué develOP» y el pie: el resto sigue quieto abajo de 1024')
  afirmar(/<CoreografiaEnTodoAncho>/.test(TRABAJOS), '  Trabajos sí')
}
