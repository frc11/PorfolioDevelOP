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
 * ── Las alturas de 05 a 08, corregidas en SITIO-S7 ────────────────────────
 *
 *     05 Servicios       300svh   PINNEADA SIEMPRE · la secuencia de tres
 *                                 canales. Ya estaba construida así; lo que
 *                                 faltaba era que la tabla lo dijera.
 *     06 Tu panel        200svh   dos tiempos. Era 100svh y SUBESTIMABA.
 *     07 Por qué develOP 100svh   una pantalla
 *     08 Cierre          100svh   MEDIDO: 0,82 pantallas a 1440. Ver su fila.
 *
 * Las tres correcciones las pidió SITIO-S6 con su medición y no las pudo
 * escribir: este archivo era del otro lane. Es el ejemplo más limpio de por qué
 * repartir archivos no alcanza para repartir un sprint.
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
  /**
   * TU PANEL — DOS tiempos, y por eso 200svh. **Corrección de SITIO-S7.**
   *
   * S1 le puso `100svh` cuando la sección era un rótulo. SITIO-S6 la construyó
   * con dos tiempos —qué es el panel y cómo se ve; qué se hace ahí adentro— y
   * **no pudo corregir la tabla**, porque este archivo era del otro lane. Lo
   * reportó con el número: `s6-tu-panel` cuenta los `min-h-svh` del marcado y
   * son dos.
   *
   * Los dos tiempos están separados porque el ancla de P4 —`top bottom` →
   * `bottom top`— recorre el alto del bloque MÁS un viewport entero: apretada
   * contra la captura, la lista de capacidades entraría casi entera antes de
   * que alguien la vea.
   *
   * ⚠ El `alto` de la tabla es un `min-height`, así que con 100svh la sección
   * no se rompía: **subestimaba el recorrido**, que es peor que romperse
   * porque no se ve. La cuenta de ritmo salía mal y nadie se enteraba.
   */
  { id: 'tu-panel', numero: '06', nombre: 'Tu panel', superficie: 'papel-opaco', alto: '200svh' },
  { id: 'por-que-develop', numero: '07', nombre: 'Por qué develOP', superficie: 'papel-transparente', alto: '100svh' },
  /**
   * CIERRE — el alto MEDIDO, y por qué se queda en 100svh. **SITIO-S7.**
   *
   * ⚠️ **NO SE REABRE SIN ESTOS DOS NÚMEROS.** SITIO-S6 pidió revisarlo con la
   * premisa *"pasa de una pantalla con el titular en `titulo-xl` más el pie
   * entero"*. Se midió: **la premisa vale sólo a 375, y no a escritorio**, que
   * es el ancho donde este proyecto define el ritmo. Quien quiera cambiar este
   * valor tiene que empezar por acá y no por la intuición — la intuición ya se
   * probó y dio al revés:
   *
   *     @1440 × 900   741 px  →  0,82 pantallas   (las tres columnas EN FILA)
   *     @375  × 667  1029 px  →  1,54 pantallas   (las columnas APILADAS)
   *
   * Las produce `s8-cierre.invariant` sumando cajas de línea y tokens —no está
   * medido en un navegador, y eso está declarado ahí—.
   *
   * ⚠️ **LAS DOS CIFRAS SE MOVIERON EN SITIO-S8, Y NO ES QUE LA SECCIÓN CAMBIÓ
   * DE ALTO: EL MODELO ESTABA MAL.** Publicaba 609 y 913, medidos con UNA sola
   * columna del pie —la de novedades— usada para las tres. Con tres enlaces en
   * la columna del recorrido subestimaba 4 px y nadie lo notaba; al ampliar el
   * pie a las ocho secciones (§7.24) esa columna pasó a ser la más alta y la
   * subestimación llegó a 132 px. El instrumento ahora mide la más alta de las
   * tres, que es lo que gobierna la fila.
   *
   * **Las conclusiones de abajo sobreviven las dos**, y por eso el valor no se
   * toca: 741 < 900 sigue entrando en una pantalla a escritorio, y 1029 > 667
   * sigue pasándose a 375, donde el `min-height` deja crecer la sección. Lo que
   * se achicó es el aire: de 291 px a 159. Si el pie vuelve a crecer —una cuarta
   * columna, más pedidos de contacto— `100svh` deja de contenerlo, y ahora hay
   * un instrumento que se pone rojo el día que pase.
   *
   * **Se queda en `100svh`, y no es conservadurismo:** el `alto` es un
   * `min-height` y la cuenta de ritmo del proyecto es la de ESCRITORIO, que es
   * donde la referencia midió los suyos. A 1440 la sección entra en 0,82
   * pantallas, así que `100svh` ya la contiene con aire; declarar `200svh`
   * metería **1,18 pantallas vacías** en el tramo final del recorrido, que es
   * exactamente el defecto que el pinneo existe para no tener.
   *
   * ⚠ A 375 el contenido SÍ pasa la pantalla —1,54— y ahí manda el
   * `min-height`: la sección crece y no recorta nada. O sea que la premisa de
   * SITIO-S6 era correcta **para el ancho que estaba mirando** y no para el que
   * gobierna la cuenta. Lo que eso cuesta es que el ritmo de mobile —que este
   * proyecto todavía no publica— subestimaría el tramo. Queda anotado, no
   * arreglado: el ritmo de 390 es otro número y SCROLL.md lo publica por
   * separado con razón.
   *
   * **Las tres salidas, para que quien lo reabra no las vuelva a recorrer:**
   * subir el alto mete 1,18 pantallas vacías a 1440; dejarlo en 100svh no
   * recorta nada en ningún ancho; y declarar dos altos por ancho no existe en
   * la tabla —el `alto` es uno y es un mínimo—. Se queda como está.
   */
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
