/**
 * LAS OCHO SECCIONES DEL SITIO v3 — el recorrido, como tabla.
 *
 * Cada entrada es un bloque con su altura declarada, su superficie y su nombre
 * visible como texto plano, para poder identificarlo mirando la página.
 *
 * ⚠ **Esta tabla NO tiene contenido y no va a tenerlo.** El contenido de cada
 * sección vive en su propia carpeta, como dato, separado de su componente
 * (`secciones-a/<sección>/contenido.ts`). Acá está el RECORRIDO: qué va,
 * en qué orden, cuánto mide y sobre qué superficie.
 *
 * ── El hallazgo estructural que ordena todo esto ───────────────────────────
 *
 * La referencia NO es una pila de secciones con fondo: es un canvas permanente
 * a viewport completo con paneles de DOM deslizándose encima. Por eso el
 * escenario está en `layout.tsx` y no acá, y por eso esta lista es solo el
 * FLUJO DEL DOCUMENTO. La consecuencia práctica es la que importa: la capa 3D
 * se enchufa y se desenchufa sin tocar una línea de esta tabla.
 *
 * ── Las alturas ────────────────────────────────────────────────────────────
 *
 * En `svh` y no en `vh`: en mobile la barra del navegador entra y sale, y con
 * `vh` cada panel salta cuando se esconde. `svh` es la altura chica y estable.
 *
 * Las separaciones son CERO. Está medido —33 de 36 separaciones en 0px— y no
 * es un descuido de la referencia: el ritmo vive en el pinneado, no en el aire
 * entre bloques. Ningún panel declara margen.
 */

import type { ModoSuperficie } from './superficies'

export interface Seccion {
  /** Ancla y `data-panel`. Estable: la coreografía va a apuntar acá. */
  readonly id: string
  /** El número que se ve en la columna lateral de 140px. */
  readonly numero: string
  /** El nombre visible, en texto plano. Es todo el "contenido" que hay. */
  readonly nombre: string
  /** La superficie. El recorrido entero está abajo, en el docblock de la tabla. */
  readonly superficie: ModoSuperficie
  /** Altura declarada del bloque. */
  readonly alto: string
  /**
   * Si la sección es una secuencia pinneada con `sticky`, y **desde dónde**.
   * Son DOS —Trabajos y Servicios— y el invariante lo afirma.
   *
   * ── Por qué el pinneo tiene DOS modos y no es un booleano ────────────────
   *
   * Porque el `sticky` es CSS puro y por lo tanto **cruza la compuerta de
   * 1025**: sobrevive donde la coreografía no existe. S1 lo celebró con razón
   * —"mobile conserva el ritmo gratis, sin bajar un byte de más"— y para
   * Servicios sigue siendo verdad.
   *
   * Para Trabajos **no**, y está medido: abajo de 768 la grilla de tres colapsa
   * a una columna, las tres capturas apiladas más sus rótulos miden ~810 px, y
   * el hijo `sticky` mide `100svh` (~555–667 px en un teléfono). El contenido
   * desborda su propia caja clavada. Y arriba de eso, abajo de 1025 **no hay
   * coreografía**: el pin no está sosteniendo ningún gesto, sólo está clavando
   * una caja que no entra. Un pin que desborda no compra nada.
   *
   *   `siempre`           el `sticky` rige en todos los anchos.
   *   `desde-escritorio`  el `sticky` rige sólo desde 1025; abajo la sección
   *                       scrollea y cada proyecto ocupa su pantalla.
   *
   * ⚠ **Es una decisión declarada acá, en la tabla, y no un arreglo escondido
   * en una clase.** Vive en el mismo lugar que el alto y la superficie porque
   * es de la misma naturaleza —cómo se comporta la sección en el recorrido— y
   * porque es lo único que los dos lanes comparten. `Seccion.tsx` la lee y
   * emite las variantes; ningún componente decide esto por su cuenta.
   */
  readonly pinneada?: 'siempre' | 'desde-escritorio'
}

/**
 * ── EL RECORRIDO DE SUPERFICIES — decidido en SITIO-S5 §0.2 ────────────────
 *
 * S1 dejó las ocho en `papel-opaco` a propósito: la decisión estética no era
 * suya. **SITIO-S5 la toma, y la escribe entera** —incluidas las cuatro de
 * S6— porque este archivo es uno solo y partir la tabla en dos lanes sería
 * partirla en dos conflictos.
 *
 *     01 Hero              papel-transparente   ← la escena se ve
 *     02 Quiénes somos     papel-opaco
 *     03 Números           papel-opaco
 *     04 Trabajos          oscuro-opaco         ← la escena desaparece
 *     05 Servicios         papel-opaco
 *     06 Tu panel          papel-opaco
 *     07 Por qué develOP   papel-transparente   ← la escena vuelve
 *     08 Cierre            oscuro-opaco
 *
 * **Tres momentos de escena, no ocho.** Aparece, desaparece y vuelve: eso es
 * lo que la hace valer. Si los ocho paneles dejaran ver el canvas, el canvas
 * dejaría de ser un acontecimiento y pasaría a ser el fondo.
 *
 * ── Las alturas de las cuatro primeras, y de dónde salen ───────────────────
 *
 * De SITIO-S5, que es el sprint que les puso contenido:
 *
 *     01 Hero            100svh   una pantalla, no pinneada
 *     02 Quiénes somos   200svh   dos pantallas — el tramo más largo del
 *                                 recorrido de la escena
 *     03 Números         100svh   una pantalla
 *     04 Trabajos        300svh   PINNEADA DESDE 1025 · un hijo `sticky` de
 *                                 100svh deja 200svh clavados. Abajo del
 *                                 umbral no se pinnea y cada proyecto ocupa
 *                                 una de las tres pantallas — ver `pinneada`.
 *
 * ⚠ Los 300svh de Trabajos son **DECIDIDOS, no medidos**: son tres proyectos
 * entrando por P7, a razón de una pantalla de scroll por proyecto, y es el
 * mismo orden de magnitud que la única otra secuencia pinneada del esqueleto.
 * Lo que sí está medido es que la secuencia cuenta como **UN momento** y no
 * como tres pantallas (SCROLL.md §6).
 *
 * Las alturas de 05 a 08 quedan como las dejó S1: son del lane de S6.
 */
export const SECCIONES: readonly Seccion[] = [
  { id: 'hero', numero: '01', nombre: 'Hero', superficie: 'papel-transparente', alto: '100svh' },
  { id: 'quienes-somos', numero: '02', nombre: 'Quiénes somos', superficie: 'papel-opaco', alto: '200svh' },
  { id: 'numeros', numero: '03', nombre: 'Números', superficie: 'papel-opaco', alto: '100svh' },
  /**
   * TRABAJOS — la segunda secuencia pinneada, y la primera con contenido.
   *
   * `oscuro-opaco`: la sección invertida. El canvas no se ve, y el acento no
   * puede ir como texto — sobre `#0E0E0E` los tres dan 2,71 · 2,99 · 2,46, o
   * sea que no llegan ni a 3:1. Va como relleno o como subrayado. La regla
   * está escrita en `theme-develop.css`, en el bloque de la sección invertida.
   */
  { id: 'trabajos', numero: '04', nombre: 'Trabajos', superficie: 'oscuro-opaco', alto: '300svh', pinneada: 'desde-escritorio' },
  /**
   * SERVICIOS — la sección pinneada que S1 dejó como demostración.
   *
   * Es la más coreografiada de la referencia, así que es la que sirve para
   * demostrar que el mecanismo funciona. 300svh de recorrido con un hijo
   * `sticky` de 100svh: el panel queda clavado 200svh de scroll.
   *
   * **Sin una línea de JavaScript.** Es CSS `sticky` puro, y por eso sobrevive
   * abajo de la compuerta de 1025 — mobile conserva el ritmo gratis.
   */
  { id: 'servicios', numero: '05', nombre: 'Servicios', superficie: 'papel-opaco', alto: '300svh', pinneada: 'siempre' },
  { id: 'tu-panel', numero: '06', nombre: 'Tu panel', superficie: 'papel-opaco', alto: '100svh' },
  { id: 'por-que-develop', numero: '07', nombre: 'Por qué develOP', superficie: 'papel-transparente', alto: '100svh' },
  { id: 'cierre', numero: '08', nombre: 'Cierre', superficie: 'oscuro-opaco', alto: '100svh' },
]

/**
 * Cuántas secciones dejan ver el canvas. Es la cifra del recorrido —tres
 * momentos de escena— y la produce esta línea, no la prosa de un reporte.
 */
export const SECCIONES_QUE_DEJAN_VER_LA_ESCENA: readonly string[] = SECCIONES.filter(
  (s) => s.superficie === 'papel-transparente',
).map((s) => s.id)

/** Una sección por id. Tira si no existe: un id inventado es un error, no un
 *  `undefined` que se propaga hasta una pantalla en blanco. */
export function seccionPorId(id: string): Seccion {
  const encontrada = SECCIONES.find((s) => s.id === id)
  if (encontrada === undefined) throw new Error(`sección desconocida: ${id}`)
  return encontrada
}
