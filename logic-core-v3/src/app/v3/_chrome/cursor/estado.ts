import { SECCIONES } from '../../_lib/secciones'
import { SUPERFICIES, type ModoSuperficie } from '../../_lib/superficies'
import { NOCHE_QUE_OSCURECE, type Tono } from '../menu/tono'

/**
 * [INTERFAZ 1] T2 · EL CURSOR DE LA SALA — qué estado y qué tono, según lo que hay bajo el puntero. Puro (salvo leer el
 * DOM que recibe): lo prueba `s37-interfaz1` con un DOM armado a mano.
 *
 * ── Los estados ──────────────────────────────────────────────────────────
 *
 *   · `texto`  — sobre contenido: el punto y el halo (lo medido en nk, COMPONENTS.md §4).
 *   · `enlace` — sobre un link: el punto se va y el halo se abre en un anillo alrededor del cursor nativo.
 *   · `boton`  — sobre un botón o un CTA: el halo crece y se aclara (el gesto lo hace el rollover del botón).
 *   · `demo`   — sobre una demo (un libro de la biblioteca, la cinta): el halo crece, se llena y dice «Abrir».
 *   · `logo`   — sobre el logo de la escena (lo dice la escena: `LOGO_BAJO_EL_PUNTERO`): un anillo grande, el punto queda.
 *   · `oculto` — sobre un campo de texto (manda el cursor de texto del sistema) o fuera de la ventana.
 * El cursor nativo NO se oculta nunca (en nk tampoco: `cursor: none` en 0 de 4.270 elementos).
 *
 * Con `?interfaz=cursor=nk`, el de la referencia: sobre cualquier control se apaga (opacidad 0) y queda el nativo; el
 * logo no tiene estado propio.
 */
export type EstadoDelCursor = 'texto' | 'enlace' | 'boton' | 'demo' | 'logo' | 'oculto'

export const SELECTOR_DE_DEMOS = '[data-pieza="libro"], [data-pieza="cinta"] a, [data-pieza="carrusel"] a'
export const SELECTOR_DE_CAMPOS = 'input, textarea, select, [contenteditable="true"]'
export const SELECTOR_DE_BOTONES = 'button, [role="button"], [data-pieza="cta"], summary'
export const SELECTOR_DE_ENLACES = 'a[href], [role="link"]'

/** El texto del halo sobre una demo. */
export const ETIQUETA_DE_LA_DEMO = 'Abrir'

export function estadoBajo(debajo: Element | null, sobreElLogo: boolean, comoNk = false): EstadoDelCursor {
  if (debajo === null) return 'oculto'
  if (debajo.closest(SELECTOR_DE_CAMPOS) !== null) return 'oculto'
  const demo = debajo.closest(SELECTOR_DE_DEMOS) !== null
  const boton = !demo && debajo.closest(SELECTOR_DE_BOTONES) !== null
  const enlace = !demo && !boton && debajo.closest(SELECTOR_DE_ENLACES) !== null
  if (comoNk) return demo || boton || enlace ? 'oculto' : 'texto'
  if (demo) return 'demo'
  if (boton) return 'boton'
  if (enlace) return 'enlace'
  return sobreElLogo ? 'logo' : 'texto'
}

const SUPERFICIE_DE = new Map(SECCIONES.map((s) => [s.id, s.superficie]))

/** La luminancia relativa de un `rgb()`/`rgba()` computado, y su alfa. */
function leerColor(css: string): { readonly luz: number; readonly alfa: number } | null {
  const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(css)
  if (m === null) return null
  const canal = (v: string): number => {
    const c = Number(v) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return { luz: 0.2126 * canal(m[1]) + 0.7152 * canal(m[2]) + 0.0722 * canal(m[3]), alfa: m[4] === undefined ? 1 : Number(m[4]) }
}

/**
 * El tono de una superficie sin fondo propio en el cuadro. Si deja ver la sala, lo dice la NOCHE de la escena (lo que se
 * ve es la sala): Trabajos es invertida pero, llegando de un salto (un ancla, el foco), la noche de la gota todavía no
 * cayó y la sala está de día; con la regla del menú (invertida → oscuro) el cursor quedaba claro sobre claro. Si no la
 * deja ver, manda la superficie.
 */
function tonoDeLaSala(superficie: ModoSuperficie, noche: number): Tono {
  const s = SUPERFICIES[superficie]
  if (s.dejaVerElCanvas) return noche >= NOCHE_QUE_OSCURECE ? 'oscuro' : 'claro'
  return s.invertida ? 'oscuro' : 'claro'
}

/**
 * El tono de lo que hay bajo el puntero: el del primer fondo OPACO entre el elemento y su panel (una tarjeta, el
 * contacto, la ventana de una demo, la sala invertida de Trabajos: oscuro si su luminancia es baja); si no hay ninguno,
 * se ve la sala, y manda la noche de la escena (`tonoDeLaSala`, con el umbral del botón del menú: `menu/tono.ts`). Se
 * calcula cuando cambia lo que hay debajo, no por
 * cuadro (lee estilos computados).
 */
export function tonoBajo(debajo: Element | null, noche: number, estilo: (el: Element) => string = (el) => getComputedStyle(el).backgroundColor): Tono {
  for (let el = debajo; el !== null && el.tagName !== 'HTML'; el = el.parentElement) {
    const color = leerColor(estilo(el))
    if (color !== null && color.alfa > 0.6) return color.luz < 0.4 ? 'oscuro' : 'claro'
    if (el.hasAttribute('data-panel')) {
      const superficie = SUPERFICIE_DE.get(el.getAttribute('data-panel') ?? '')
      return superficie === undefined ? 'claro' : tonoDeLaSala(superficie, noche)
    }
  }
  return 'claro'
}

/**
 * La persecución en SEGUNDOS (ESTADO-ESCENA §4): la fracción del camino que se recorre en `dtS`, con la constante de
 * tiempo medida en nk (el 63 % del salto en `t63` ms). El cursor de S3 lo hacía con un coeficiente POR CUADRO (0,0483):
 * a 144 Hz llegaba al doble de rápido que a 75. Mismos números medidos, ahora iguales a cualquier frecuencia.
 */
export function fraccionDelPaso(dtS: number, t63Ms: number): number {
  const dt = Math.min(Math.max(dtS, 0), 0.1)
  return 1 - Math.exp(-(dt * 1000) / t63Ms)
}
