import { SECCIONES } from '../../_lib/secciones'

/**
 * [INTERFAZ 2] T4 · EL RECORRIDO DE LA PÁGINA — lo que comparten las dos variantes del indicador (el logo que se dibuja
 * y el reloj del día): qué secciones se nombran, dónde empieza cada una en el avance de la página y cuál se está viendo.
 * Pura: el invariante la recorre sin navegador.
 *
 * El avance es el del documento (`scrollY / (alto − ventana)`): el que una persona siente al bajar. Cada sección empieza
 * donde su tope llega al borde de arriba del cuadro.
 */

/** Los nombres para el indicador: los de las secciones, salvo dos que no son nombres para una persona. */
const ROTULOS: Readonly<Record<string, string>> = { hero: 'Inicio', cierre: 'Contacto' }

/** Números está vacía (un `h2` para lectores): no se nombra en el recorrido. */
export const SECCIONES_DEL_RECORRIDO: readonly { readonly id: string; readonly rotulo: string }[] = SECCIONES.filter((s) => s.id !== 'numeros').map((s) => ({
  id: s.id,
  rotulo: ROTULOS[s.id] ?? s.nombre,
}))

/**
 * El avance (0 → 1) en que empieza cada sección: cuando su tope cruza la MITAD del cuadro (la misma línea con que la barra
 * marca la sección activa, `NavegacionDelHome`). La primera, en cero. Con el borde de arriba, el Cierre (que mide una
 * pantalla y es la última) empezaría en 1: nunca se vería empezar.
 */
export function iniciosDelRecorrido(topes: readonly number[], maximo: number, alto: number): number[] {
  return topes.map((t, i) => (i === 0 || maximo <= 0 ? 0 : Math.max(0, Math.min(1, (t - alto / 2) / maximo))))
}

/** La sección que se está viendo en el avance `p`: la última que ya empezó. */
export function seccionEn(p: number, inicios: readonly number[]): number {
  let i = 0
  for (let k = 0; k < inicios.length; k += 1) if (p + 1e-6 >= inicios[k]) i = k
  return i
}

/**
 * EL AVANCE DEL RECORRIDO (0 → 1): cada sección se lleva un tramo IGUAL del indicador, y adentro de su tramo avanza con
 * su scroll. Con el avance de la página tal cual, las secciones cortas (el hero, Quiénes somos) quedaban amontonadas al
 * principio y sus puntos uno encima del otro (medido: `t4-recorrido/`); así cada punto tiene su lugar, y lo que tarda
 * en dibujarse cada tramo es lo que se tarda en recorrer la sección.
 */
export function avanceDelRecorrido(p: number, inicios: readonly number[]): number {
  const n = inicios.length
  const i = seccionEn(p, inicios)
  const desde = inicios[i]
  const hasta = i + 1 < n ? inicios[i + 1] : 1
  const t = hasta - desde <= 1e-9 ? 1 : Math.max(0, Math.min(1, (p - desde) / (hasta - desde)))
  return (i + t) / n
}

/** Al revés: qué avance de la página corresponde a un avance del recorrido (para pintar la luz en el reloj). */
export function avanceDeLaPagina(r: number, inicios: readonly number[]): number {
  const n = inicios.length
  const x = Math.max(0, Math.min(1, r)) * n
  const i = Math.min(n - 1, Math.floor(x))
  const desde = inicios[i]
  const hasta = i + 1 < n ? inicios[i + 1] : 1
  return desde + (hasta - desde) * (x - i)
}

/** La sección del tramo `r` del recorrido (lo que se toca en el trazo o en el disco). */
export function seccionDelTramo(r: number, n: number): number {
  return Math.max(0, Math.min(n - 1, Math.floor(r * n)))
}

/** Lo que mide el DOM, una vez (y al cambiar de alto): dónde empieza cada sección en el avance de la página. */
export function medirElRecorrido(documento: Document, scrollY: number, alto: number): readonly number[] {
  const maximo = Math.max(0, documento.documentElement.scrollHeight - alto)
  const topes = SECCIONES_DEL_RECORRIDO.map((s) => {
    const el = documento.querySelector<HTMLElement>(`[data-panel="${s.id}"]`)
    return el === null ? 0 : el.getBoundingClientRect().top + scrollY
  })
  return iniciosDelRecorrido(topes, maximo, alto)
}

/**
 * [V1] EL TRAZO DEL LOGO, por su línea central (en el `viewBox` de 1024 del archivo): primero el infinito —el cuenco
 * de la «c», la diagonal y el cuenco de la «p», que se cierra con la diagonal— y aparte el palo de la «p», que baja
 * desde el pie del cuenco. Sacado de los círculos de `formaDelLogo.ts` (los centros y radios de los dos cuencos) y
 * verificado encima del logo (`interfaz2/t4-recorrido/trazo-sobre-el-logo.png`).
 */
export const TRAZO_DEL_INFINITO = 'M438 337 A203 203 0 1 0 433.5 592.5 L588 325 A205 205 0 0 1 950 457 A205 205 0 0 1 618.8 618.5'
export const TRAZO_DEL_PALO = 'M618.8 618.5 Q598 640 598 690 L598 862'
/** El grueso del trazo: el tubo del logo (60 de 1024). */
export const GRUESO_DEL_TRAZO = 58

/**
 * Cuánto de cada trazo está dibujado en el avance del recorrido `r` (de `n` tramos): el infinito se arma con las
 * secciones hasta Por qué develOP y el palo con la última, el Cierre: al final de la página se completa el palo.
 */
export function dibujado(r: number, n: number): { readonly infinito: number; readonly palo: number } {
  const corte = (n - 1) / n
  const q = Math.max(0, Math.min(1, r))
  return { infinito: Math.min(1, q / corte), palo: Math.max(0, Math.min(1, (q - corte) * n)) }
}
