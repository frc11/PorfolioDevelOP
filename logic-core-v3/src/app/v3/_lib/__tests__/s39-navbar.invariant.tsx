/**
 * SPRINT NAVBAR V3 — el invariante del sprint: el menú propio del home, con sus controles positivos.
 *
 *   T1 · los ítems y los destinos: el orden, Quiénes somos un poco antes, el nudo de Panel y la llegada a la vista de
 *        Portfolio y Por qué develOP (el viaje frena justo antes de su llegada y la recorre sin velo).
 *
 * Lo que necesita navegador está en los bancos de `scripts-navbar/` y sus entregas en `~/.cache/b4-medicion/navbar/`.
 */
import { readFileSync } from 'node:fs'

import { ENLACES_DEL_HOME } from '../../_chrome/enlaces'
import { DURACION_DE_LA_LLEGADA_MS, DURACION_DEL_VIAJE_MS, MARGEN_ANTES_DE_LA_LLEGADA } from '../../_componentes/deslizamiento'
import { antesDeLaLlegada, centradoDebajoDeLaBarra, destinoDelViaje } from '../../_componentes/destinosDelViaje'
import { IDS_DE_SECCION } from '../../_secciones/_contrato/forma'
import { lineaDeLaNoche } from '../../_secciones/trabajos/geometria'
import { AMANECER } from '../escena/amanecer/linea'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { NodoFalso, VENTANA, conDomFalso } from './s27-dom-falso'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

/** El documento falso con las secciones que `antesDeLaLlegada` recorre (la del medio del cuadro, Tu panel). */
function conDocumento<T>(paneles: readonly NodoFalso[], cuerpo: () => T): T {
  const antes = globalThis.document
  const documento = {
    documentElement: { scrollHeight: 30_000 },
    querySelectorAll: (s: string) => (s === '[data-panel]' ? paneles : []),
    querySelector: (s: string) => paneles.find((p) => s === `[data-panel="${p.getAttribute('data-panel') ?? ''}"]`) ?? null,
  }
  Object.assign(globalThis, { document: documento })
  try {
    return cuerpo()
  } finally {
    Object.assign(globalThis, { document: antes })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · Los ítems: el orden pedido, una sola lista para la barra y el menú')

afirmarIgual(ENLACES_DEL_HOME.map((e) => e.rotulo), ['Quiénes somos', 'Portfolio', 'Servicios', 'Panel', 'Por qué develOP', 'Contacto'], 'los seis, en el orden pedido: «Trabajos» pasa a «Portfolio» y «Panel» es nuevo')
const secciones = ENLACES_DEL_HOME.filter((e) => e.destino !== '#contacto')
afirmar(secciones.every((e) => (IDS_DE_SECCION as readonly string[]).includes(e.destino.slice(1)) && e.destino === `#${e.id}`), '  cada uno lleva a una sección de la tabla («Portfolio» sigue siendo `#trabajos`, «Panel» es `#tu-panel`)')
afirmarIgual(ENLACES_DEL_HOME[ENLACES_DEL_HOME.length - 1], { id: 'cierre', rotulo: 'Contacto', destino: '#contacto' }, '  y «Contacto» sigue siendo el de hoy: abre el formulario')
const USAN_LA_LISTA = ['_chrome/menu/MenuMovil.tsx']
afirmar(USAN_LA_LISTA.every((r) => leer(r).includes('ENLACES_DEL_HOME.map(')) && !/ENLACES_DE_MUESTRA/.test(USAN_LA_LISTA.map(leer).join('\n')), '  el menú del teléfono usa la lista del home, no la de muestra de la pastilla compartida')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · Los destinos nuevos: un tramo centrado debajo de la barra')

afirmarIgual(centradoDebajoDeLaBarra(900, 1124, 1650, 900, 72), 901, 'un tramo de 526 px en los 828 libres queda con 151 arriba y 151 abajo')
afirmarIgual(centradoDebajoDeLaBarra(900, 1000, 1200, 900, 72), 900, '  sin asomar la sección de arriba: nunca antes de su tope')
afirmarIgual(centradoDebajoDeLaBarra(900, 1124, 2400, 900, 72), 1052, '  y si no entra, su tope apenas debajo de la barra')
controlPositivo('el chequeo de «sin asomar» vería el centro crudo, antes del tope', 1000 - 72 - (900 - 72 - 200) / 2, (y: number) => y >= 900)

conDomFalso(900, 72, () => {
  VENTANA.scrollY = 0
  const cabecera = new NodoFalso({ tope: 19086 + 80, alto: 540 })
  const tuPanel = new NodoFalso({ tope: 19086, alto: 4119 }, { 'data-panel': 'tu-panel' }).responde('[data-pieza="encabezado-del-panel"]', cabecera)
  afirmarIgual(destinoDelViaje(tuPanel as unknown as HTMLElement), 19086, 'Panel: la cabecera de Tu panel entera a la vista (con lugar de sobra, el tope de la sección: la de arriba no asoma)')
  const alta = new NodoFalso({ tope: 19086 + 80, alto: 1200 })
  const tuPanelAlta = new NodoFalso({ tope: 19086, alto: 4119 }, { 'data-panel': 'tu-panel' }).responde('[data-pieza="encabezado-del-panel"]', alta)
  afirmarIgual(destinoDelViaje(tuPanelAlta as unknown as HTMLElement), 19086 + 80 - 72, '  y si la cabecera no entra, su tope debajo de la barra')
})
afirmar(/'tu-panel': \(panel, v\) => \{/.test(leer('_componentes/destinosDelViaje.ts')), '  Tu panel tiene nudo (antes caía en el ancla: con la barra encima, 72 px de Servicios a la vista)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · La llegada a la vista: Portfolio y Por qué develOP frenan justo antes de su llegada')

afirmar(MARGEN_ANTES_DE_LA_LLEGADA > 0 && MARGEN_ANTES_DE_LA_LLEGADA <= 0.25, `el viaje frena ${String(MARGEN_ANTES_DE_LA_LLEGADA)} de cuadro antes: un respiro de lo de antes, no una pantalla`)
afirmar(DURACION_DE_LA_LLEGADA_MS >= 2000 && DURACION_DE_LA_LLEGADA_MS <= DURACION_DEL_VIAJE_MS, `  y la llegada dura siempre lo mismo (${String(DURACION_DE_LA_LLEGADA_MS)} ms): lo bastante para el barrido de la noche y el amanecer, no más que el viaje`)

conDomFalso(900, 72, () => {
  const caja = new NodoFalso({ tope: 5073 + 360, alto: 2700 })
  const numeros = new NodoFalso({ tope: 2700, alto: 2373 }, { 'data-panel': 'numeros' })
  const trabajos = new NodoFalso({ tope: 5073, alto: 6813 }, { 'data-panel': 'trabajos' }).responde('[data-caja-sin-solape]', caja)
  conDocumento([numeros, trabajos], () => {
    VENTANA.scrollY = 0
    const esperado = Math.floor(5073 + 360 - lineaDeLaNoche(900) - MARGEN_ANTES_DE_LA_LLEGADA * 900)
    const a = antesDeLaLlegada(trabajos as unknown as HTMLElement, 5073)
    afirmarIgual(a, { antes: esperado, seccion: 'numeros' }, 'Trabajos: frena antes de la línea de la gota (la misma de `CapaDeLaGota`), con la luz de la sección que hay ahí')
    VENTANA.scrollY = 6000
    afirmarIgual(antesDeLaLlegada(trabajos as unknown as HTMLElement, 5073), null, '  subiendo (desde Servicios) va derecho: la llegada se construyó bajando')
    VENTANA.scrollY = esperado + 10
    afirmarIgual(antesDeLaLlegada(trabajos as unknown as HTMLElement, 5073), null, '  y ya adentro de la llegada, también')
    VENTANA.scrollY = 0
  })
  const tuPanel = new NodoFalso({ tope: 19086, alto: 4119 }, { 'data-panel': 'tu-panel' })
  const porQue = new NodoFalso({ tope: 23205, alto: 3600 }, { 'data-panel': 'por-que-develop' })
  conDocumento([tuPanel, porQue], () => {
    const esperado = Math.floor(19086 + 4119 - AMANECER.visible * 900 - MARGEN_ANTES_DE_LA_LLEGADA * 900)
    afirmarIgual(antesDeLaLlegada(porQue as unknown as HTMLElement, 23835), { antes: esperado, seccion: 'tu-panel' }, 'Por qué develOP: frena antes de que el pie de Tu panel pida el amanecer, con Tu panel tapando el cuadro')
    afirmarIgual(antesDeLaLlegada(tuPanel as unknown as HTMLElement, 19086), null, 'las demás secciones no tienen llegada a la vista: van derecho a su nudo')
  })
})

const EFECTO = sinComentarios(leer('_componentes/useDeslizamientoDelCta.ts'))
const llegada = EFECTO.slice(EFECTO.indexOf('const recorrerLaLlegada'), EFECTO.indexOf('const alClick'))
const orden = ['zona.removeAttribute(ATRIBUTO_DEL_VELO)', 'zona.inert = false', 'reloj = window.setTimeout(() => terminar(false)', 'terminarElViaje()', 'lenis.scrollTo(destinoEnPx']
afirmar(orden.every((t, i) => llegada.includes(t) && (i === 0 || llegada.indexOf(t) > llegada.indexOf(orden[i - 1]))), 'el segundo tramo: el velo se va, el reloj de seguridad se rearma, la escena deja el viaje y RECIÉN ahí se recorre la llegada')
afirmar(/relojDeArranque = window\.setTimeout\(\(\) => \{[\s\S]*?\}, fundido\)/.test(llegada), '  la llegada arranca cuando el velo terminó de irse (el fundido que declara la hoja)')
afirmar(EFECTO.includes("const llegada = modo === 'salto' ? null : antesDeLaLlegada(seccion, destinoEnPx)") && EFECTO.includes('empezarElViaje(planDelViaje(llegada?.seccion ?? seccion.id, hasta))'), '  con movimiento reducido no hay llegada a la vista (el salto va al nudo), y el viaje tapado lleva la luz de donde frena')
controlPositivo('el chequeo del orden vería la escena soltada después de arrancar la llegada', llegada.replace('terminarElViaje()\n', '').replace('lock: false, onComplete: () => terminar(true) })', 'lock: false, onComplete: () => terminar(true) }); terminarElViaje()'), (f: string) => orden.every((t, i) => f.includes(t) && (i === 0 || f.indexOf(t) > f.indexOf(orden[i - 1]))))

cerrar('s39-navbar')
