import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'

import { CATALOGO_DE_DEMOS } from './demos/catalogo'
import { demosQueSeVen } from './demos/Carrusel'
import {
  FISICA_DEL_CARRUSEL,
  arrastrarLaFila,
  lanzarLaFila,
  posicionDelRenglon,
  velocidadDelRenglon,
  avanzarLaCinta,
  envolver,
  esUnToque,
  intencionDelGesto,
  relajar,
  velocidadDelGesto,
} from './demos/fisicaDelCarrusel'

/**
 * §27 DEL INVARIANTE DE TRABAJOS — **ABAJO DE 1024.** Lo llama `trabajos.invariant`.
 * **[MÓVIL-TRABAJOS]**
 *
 * Tres cosas que el sprint pidió afirmar: el carrusel (relaja a su velocidad de
 * reposo, no le roba el scroll vertical a la página, el toque abre y el arrastre no),
 * el pin medido en `svh`, y que la coreografía que cruza el umbral la pide Trabajos
 * y nadie más. Cada una con su control.
 */

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const leer = (...partes: string[]): string => readFileSync(path.join(AQUI, ...partes), 'utf8')
const sinComentarios = (f: string): string =>
  f
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .filter((l) => !/^\s*\/\//.test(l))
    .join('\n')

const { velocidadDeReposo: V0, constanteDeRelajacion: TAU, tope: TOPE } = FISICA_DEL_CARRUSEL

/** La velocidad a lo largo de `s` segundos en pasos de `dt`, desde `v`. */
function trayectoria(v: number, reposo: number, s: number, dt: number): number[] {
  const salida: number[] = [v]
  let x = { x: 0, v }
  // Pasos contados y no tiempo acumulado: sumar `dt` en coma flotante da un paso de más o de menos.
  for (let k = 0; k < Math.round(s / dt); k += 1) {
    x = avanzarLaCinta(x, reposo, dt, 1e9)
    salida.push(x.v)
  }
  return salida
}

export function afirmarAbajoDe1024(): void {
  titulo('27 · Abajo de 1024: el carrusel, el pin en svh y la coreografía que cruza el umbral')

  // ── EL CARRUSEL RELAJA A SU RITMO ──────────────────────────────────────
  const aFavor = trayectoria(4 * V0 * 10, V0, 5 * TAU, 1 / 60)
  afirmar(
    aFavor.every((v, i) => i === 0 || v <= aFavor[i - 1]) && Math.abs(aFavor[aFavor.length - 1] - V0) < 0.01 * (aFavor[0] - V0),
    `lanzada a favor baja de a poco hasta su ritmo: de ${aFavor[0].toFixed(0)} a ${aFavor[aFavor.length - 1].toFixed(2)} px/s en cinco constantes (reposo ${String(V0)})`,
  )
  const enContra = trayectoria(-30 * V0, V0, 6 * TAU, 1 / 60)
  const cruce = enContra.findIndex((v) => v >= 0)
  afirmar(
    cruce > 0 && enContra[enContra.length - 1] > 0 && Math.abs(enContra[enContra.length - 1] - V0) < 0.01 * Math.abs(enContra[0] - V0),
    `lanzada en contra se frena, se detiene y vuelve a su sentido: pasa por cero en el cuadro ${String(cruce)} y termina en ${enContra[enContra.length - 1].toFixed(2)} px/s`,
  )
  controlPositivo('el chequeo de «relaja» ve una cinta que no relaja', (v: number) => v, (quieta: (v: number) => number) => Math.abs(quieta(4 * V0) - V0) < 0.01 * 3 * V0)
  afirmarIgual(relajar(V0, V0, 3), V0, '  y en su ritmo se queda en su ritmo')
  const lenta = trayectoria(2000, V0, 1, 1 / 30)
  const rapida = trayectoria(2000, V0, 1, 1 / 120)
  afirmar(Math.abs(lenta[lenta.length - 1] - rapida[rapida.length - 1]) < 1, '  y no depende de los cuadros por segundo: a 30 y a 120 cuadros llega a la misma velocidad')
  const recorrido = (dt: number): number => {
    let e = { x: 0, v: 2000 }
    for (let t = 0; t < 1 - 1e-9; t += dt) e = avanzarLaCinta(e, V0, dt, 1e9)
    return e.x + 1e9
  }
  afirmar(Math.abs(recorrido(1 / 30) - recorrido(1 / 120)) < 0.5, '  ni el camino: la posición integra la velocidad exacta del tramo', `${recorrido(1 / 30).toFixed(2)} contra ${recorrido(1 / 120).toFixed(2)} px`)

  // ── EL BUCLE NO TIENE COSTURA ──────────────────────────────────────────
  const largo = 1008
  const fuera = [-3000, -1008, -1, 0, 1, 500, 1008, 5000].map((x) => envolver(x, largo)).filter((x) => !(x >= -largo && x < 0))
  afirmarIgual(fuera, [], 'la pista con la lista duplicada queda siempre en [−largo, 0): el bucle vuelve sin salto')

  // ── EL GESTO: NO SE LE ROBA EL SCROLL VERTICAL A LA PÁGINA ────────────
  afirmarIgual(intencionDelGesto(3, 20), 'vertical', 'un gesto más vertical que horizontal es de la página')
  afirmarIgual(intencionDelGesto(20, 3), 'horizontal', '  uno más horizontal es del carrusel')
  afirmarIgual(intencionDelGesto(5, 5), null, `  y mientras no pasa de ${String(FISICA_DEL_CARRUSEL.umbralDeIntencionPx)} px no se decide nada`)
  const CARRUSEL = sinComentarios(leer('demos/Carrusel.tsx'))
  const HOJA = leer('../../_estilos/demos.css')
  afirmar(/\[data-parte="renglon"\]\s*\{[^}]*touch-action:\s*pan-y/.test(HOJA), 'el renglón es `touch-action: pan-y`: el scroll vertical lo hace el navegador')
  const capturaDentroDeLaIntencion = (fuente: string): boolean => /if \(gesto\.intencion === 'horizontal'\) renglon\.setPointerCapture/.test(fuente) && (fuente.match(/setPointerCapture/g) ?? []).length === 1
  afirmar(capturaDentroDeLaIntencion(CARRUSEL), '  y el carrusel captura el dedo SÓLO después de decidir que el gesto es horizontal')
  controlPositivo(
    'el detector ve un carrusel que captura el dedo al apoyar',
    "const alApoyar = (e) => { caja.setPointerCapture(e.pointerId) }\nif (gesto.intencion === 'horizontal') caja.setPointerCapture(e.pointerId)",
    capturaDentroDeLaIntencion,
  )

  // ── EL TOQUE ABRE; EL ARRASTRE NO ──────────────────────────────────────
  afirmarIgual(
    [esUnToque(3, 120), esUnToque(FISICA_DEL_CARRUSEL.toque.px, 120), esUnToque(3, FISICA_DEL_CARRUSEL.toque.ms)],
    [true, false, false],
    `un toque es menos de ${String(FISICA_DEL_CARRUSEL.toque.px)} px y ${String(FISICA_DEL_CARRUSEL.toque.ms)} ms: en el borde ya es arrastre`,
  )
  afirmar(/suprimirElClic = !esUnToque\(/.test(CARRUSEL) && /if \(!suprimirElClic\) return\s*e\.preventDefault\(\)/.test(CARRUSEL), '  y el clic de un arrastre se cancela; el de un toque sigue al enlace, que abre en otra pestaña')
  afirmar((CARRUSEL.match(/target="_blank"/g) ?? []).length === 1 && /rel="noopener noreferrer"/.test(CARRUSEL), '  cada portada es un enlace a su demo, afuera y sin acceso a esta ventana')

  // ── LA VELOCIDAD DEL GESTO: LOS ÚLTIMOS ~80 ms, CON TOPE ───────────────
  const muestras = [{ t: 0, x: 0 }, { t: 300, x: 900 }, { t: 400, x: 1000 }, { t: 450, x: 1050 }]
  afirmarIgual(velocidadDelGesto(muestras, 450), 1000, 'la velocidad sale de las muestras de la ventana: lo de antes de 80 ms no cuenta')
  afirmarIgual(velocidadDelGesto([{ t: 0, x: 0 }, { t: 10, x: 500 }], 10), TOPE, `  y un tirón queda en el tope de ${String(TOPE)} px/s`)

  // ── MÓVIL 2: CUATRO Y CUATRO, Y UNA SOLA FILA ─────────────────────────
  const todas = CATALOGO_DE_DEMOS.map((d) => d.slug)
  const [arriba, abajo] = demosQueSeVen('movil')
  afirmar(
    arriba.length === 4 && abajo.length === 4 && arriba.every((d) => !abajo.includes(d)) && [...arriba, ...abajo].join() === todas.join(),
    `en el teléfono, arriba ${arriba.join(' · ')} y abajo ${abajo.join(' · ')}: cuatro y cuatro, ninguna repetida entre renglones`,
  )
  afirmarIgual(demosQueSeVen('tablet'), [todas], '  y en tablet un solo renglón con las ocho')
  const quieta = { x: 0, v: V0 }
  const lanzadaAbajo = lanzarLaFila(quieta, -1, 900)
  afirmar(
    velocidadDelRenglon(lanzadaAbajo, -1) === 900 && velocidadDelRenglon(lanzadaAbajo, 1) === -900 && velocidadDelRenglon(quieta, 1) === V0,
    `un lanzamiento de 900 px/s sobre el renglón de abajo cambia la velocidad del de arriba: de ${String(V0)} a ${String(velocidadDelRenglon(lanzadaAbajo, 1))} px/s`,
  )
  let sueltos = lanzadaAbajo
  for (let k = 0; k < 8 * 60; k += 1) sueltos = avanzarLaCinta(sueltos, V0, 1 / 60, 1e9)
  afirmar(Math.abs(velocidadDelRenglon(sueltos, 1) - V0) < 0.1 && Math.abs(velocidadDelRenglon(sueltos, -1) + V0) < 0.1, '  y los dos vuelven juntos a su ritmo: arriba a la derecha y abajo a la izquierda', `${velocidadDelRenglon(sueltos, 1).toFixed(2)} · ${velocidadDelRenglon(sueltos, -1).toFixed(2)} px/s`)
  const arrastrada = arrastrarLaFila(0, 1, 50)
  // Con una pista de 1000 px: en reposo los dos en −1000 (el cero envuelto); arrastrada, uno a −950 y el otro a −50.
  afirmarIgual([posicionDelRenglon(arrastrada, 1, 1000), posicionDelRenglon(arrastrada, -1, 1000)], [-950, -50], '  arrastrar 50 px el de arriba corre 50 px el de abajo, en su sentido: son una sola fila')
  const unaSolaFila = (fuente: string): boolean => (fuente.match(/let fila: EstadoDeLaFila/g) ?? []).length === 1 && !/let estado = \{/.test(fuente) && (fuente.match(/useEffect\(/g) ?? []).length === 1
  afirmar(unaSolaFila(CARRUSEL), '  y el componente guarda UN estado de movimiento para los dos renglones, con un solo lazo')
  controlPositivo('  el detector ve el carrusel de antes, con un estado por renglón', 'let estado = { x: envolver(-desfase * paso, largo), v: 0 }; useEffect(() => {})', unaSolaFila)

  // ── EL PIN Y LAS ANCLAS, EN svh ────────────────────────────────────────
  const EPOCA = sinComentarios(leer('../../_lib/motion/epoca.ts'))
  const anclasEnSvh = (fuente: string): boolean => !/alto:\s*window\.innerHeight/.test(fuente) && /height:100svh/.test(fuente) && (fuente.match(/altoDeLaVentana\(\)/g) ?? []).length >= 2
  afirmar(anclasEnSvh(EPOCA), 'el motor resuelve las anclas contra el `svh` (una sonda de 100svh), no contra `innerHeight`: la barra de Safari no las mueve')
  controlPositivo('el detector ve el motor viejo', 'foto = { epoca: 0, ancho: window.innerWidth, alto: window.innerHeight }', anclasEnSvh)
  const TRABAJOS = sinComentarios(leer('Trabajos.tsx'))
  // MÓVIL 2: el pin angosto lo lleva el bloque; la sección es la caja alta que lo contiene.
  const pinEnSvh = (fuente: string): boolean => /bloque: '[^']*max-escritorio:sticky[^']*max-escritorio:h-svh[^']*'/.test(fuente) && !/\b(h-screen|h-dvh|h-lvh|100vh|100dvh)\b/.test(fuente)
  afirmar(pinEnSvh(TRABAJOS), '  y abajo de 1024 la rama coreografiada se clava con una caja de 100svh: ni vh, ni dvh')
  controlPositivo('el detector ve un pin en dvh', "bloque: 'relative max-escritorio:sticky max-escritorio:top-0 max-escritorio:h-dvh' }", pinEnSvh)

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
  afirmarIgual(laPiden, ['servicios/angosto.tsx', 'por-que-develop/PorQueDevelop.tsx'], '  y fuera de Trabajos la piden sólo la cabeza fija de Servicios y la lista de «Por qué develOP»: el resto sigue quieto abajo de 1024')
  afirmar(/<CoreografiaEnTodoAncho>/.test(TRABAJOS), '  Trabajos sí')
}
