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
  /**
   * EL ALTO MÍNIMO del bloque. **NO es su alto: es su piso.** (B1)
   *
   * `Panel` lo emite como `min-height` y no como `height` —siempre lo hizo—, o
   * sea que **la sección se dimensiona por su contenido y nunca queda más corta
   * que esta declaración**. Un contenido que se pasa la hace crecer; uno que no
   * llega NO la achica.
   *
   * ── ⚠️ LO QUE B1 MIDIÓ, y que cambia cómo se lee este campo ──────────────
   *
   * Este número **no es el que está sosteniendo el aire muerto del home.** Con
   * el `min-height` de la tabla puesto en cero en runtime, a 1920×1080, seis de
   * las ocho secciones **miden exactamente lo mismo**: lo que fija su alto son
   * los `min-h-svh` que cada sección pone ADENTRO, no esta columna.
   *
   *     hero            1080 declarado · 1080 natural   (1 caja interna)
   *     quiénes somos   2160 declarado · 2160 natural   (2 cajas internas)
   *     números         1080 declarado · 1080 natural   (1 caja interna)
   *     trabajos        3240 declarado · 1080 natural   (0 cajas internas)
   *     servicios       3240 declarado · 3240 natural   (3 cajas internas)
   *     tu panel        2160 declarado · 2160 natural   (2 cajas internas)
   *     por qué develOP 1080 declarado · 1080 natural   (1 caja interna)
   *     cierre          1080 declarado ·  780 natural   (0 cajas internas)
   *
   * O sea: **la resta de una sección se hace en su composición**, y bajar este
   * número sólo cambia algo donde no hay caja interna que lo sostenga.
   *
   * ── ⚠️ POR QUÉ NO SE LLAMA `altoMinimo`, que es lo que es ────────────────
   *
   * Porque `_lib/escena/anclajeDerivacion.ts:182` lee `s.alto` para derivar el
   * anclaje de la escena, y `_lib/escena/` está congelado para B1 (regla 3).
   * Renombrar el campo obligaría a editarlo. El nombre queda; el contrato lo
   * dice acá y `Panel` lo emite. Anotado para el sprint que pueda tocar la
   * escena.
   */
  readonly alto: string
  /**
   * CUÁNTOS PASOS TIENE LA SECUENCIA de una sección pinneada. Sólo las
   * pinneadas lo declaran, y es de donde sale su `alto`. (B1)
   *
   * ── Por qué el alto de una pinneada se DERIVA y no se escribe ───────────
   *
   * Porque no es una preferencia de composición: es el recorrido que la
   * secuencia necesita. Una sección pinneada de `pasos` pasos mide `pasos`
   * pantallas —una para el hijo clavado y una por paso de recorrido menos la
   * del hijo—, así que el pin recorre `pasos − 1` pantallas y cada paso se
   * lleva una. Con tres proyectos y tres servicios eso da los mismos 300svh que
   * la tabla traía escritos a mano, **y ahora la igualdad es comprobable**: el
   * invariante de cada sección afirma este número contra la cantidad de piezas
   * de su `contenido.ts`, que es la única fuente de cuántos pasos hay.
   *
   * El docblock de Trabajos decía *«los 300svh son DECIDIDOS, no medidos»*.
   * Dejan de serlo.
   */
  readonly pasosDeLaSecuencia?: number
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
/**
 * El alto de una sección pinneada, derivado de los pasos de su secuencia. (B1)
 *
 * Una pantalla por paso: la primera la ocupa el hijo clavado y las demás son el
 * recorrido del pin. Con `pasos = 3` da `300svh` y el pin recorre `200svh`, que
 * es exactamente lo que `ANCLA_DEL_PIN` calcula (`alto − viewport`).
 *
 * ⚠ Tira con menos de dos pasos: una secuencia de un paso no tiene recorrido, y
 * un pin de rango cero no clava nada. Es la misma clase de error que
 * `RANGO_MINIMO_PX` evita del otro lado, y acá se prefiere que no compile a que
 * quede un pin inerte que nadie ve fallar.
 */
export function altoDeSecuenciaPinneada(pasos: number): string {
  if (!Number.isInteger(pasos) || pasos < 2) {
    throw new Error(`una secuencia pinneada necesita al menos 2 pasos: recibió ${pasos}`)
  }
  return `${pasos * 100}svh`
}

/** Los pasos de las dos secuencias pinneadas. Su `contenido.ts` es la fuente y
 *  el invariante de cada sección afirma la igualdad; acá viven para que la
 *  tabla no importe contenido, que es la regla que la ordena. */
const PASOS_DE_TRABAJOS = 3
const PASOS_DE_SERVICIOS = 3

export const SECCIONES: readonly Seccion[] = [
  { id: 'hero', numero: '01', nombre: 'Hero', superficie: 'papel-transparente', alto: '100svh' },
  /**
   * QUIÉNES SOMOS — 200svh. ⚠️ **B1 INTENTÓ BAJARLO A 100 Y SE FRENÓ, CON LOS
   * NÚMEROS. No se reabre sin leer esto.**
   *
   * La medición pedía el cambio: 65,09 % de aire muerto a 1920 y la tinta de la
   * sección entrando en una pantalla. Y la comprobación que autorizó el intento
   * —correr `derivarAnclaje` con alturas candidatas— mostraba que **los siete
   * progresos no se movían** (0 · 0,125 · 0,375 · 0,5 · 0,625 · 0,75 · 1) y que
   * el ancla declarada del diferencial seguía en 0,8525.
   *
   * **Esa comprobación era necesaria y NO suficiente, y ahí estuvo el error:
   * daba por hecho que la sección iba a RENDERIZAR el alto nuevo.** No lo hace.
   * Su composición declara DOS cajas de `min-h-svh` y sólo el `[FOTO DEL EQUIPO]`
   * mide 987,72 px, así que **con la tabla en `100svh` la sección sigue midiendo
   * 2160 px** — medido en el navegador, no modelado.
   *
   * Y con la tabla declarando 13 pantallas contra 14 renderizadas, el mapeo
   * proporcional de `pantallaDeScroll` se estira y **cada nudo cae en otro
   * lugar del scroll real**. Con la fórmula del propio módulo y la extensión
   * medida (0 a 15120, ventana 1080):
   *
   *     tramo            cae en    borde real de la sección    desvío
   *     hero               1170              1080               +90 px
   *     quiénes somos      2340              3240              −900 px
   *     números            3510              3240              +270 px
   *     trabajos           7020              7560              −540 px
   *     cierre            14040             14040                +0 px
   *
   * Sólo el último coincide, y no prueba nada: el mapeo está normalizado en las
   * dos puntas y ése cierra siempre. **Los progresos no se mueven; lo que se
   * mueve es DÓNDE los alcanza el visitante**, hasta 900 px. La pose llega en el
   * lugar equivocado, que es exactamente lo que el anclaje existe para impedir.
   *
   * **Qué lo destrabaría, en orden:** primero la composición tiene que entrar en
   * UNA pantalla —o sea que el hueco de la foto baje de ~988 px—, y recién
   * después la tabla. Al revés no: la tabla no achica una sección, sólo le pone
   * un piso. Y ese recorte de la foto deshace el reparto que en B1 llevó a esta
   * sección de 65,09 % a 42,41 % de aire y de 600 a 102 px de banda vacía.
   */
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
  {
    id: 'trabajos',
    numero: '04',
    nombre: 'Trabajos',
    superficie: 'oscuro-opaco',
    alto: altoDeSecuenciaPinneada(PASOS_DE_TRABAJOS),
    pinneada: 'desde-escritorio',
    pasosDeLaSecuencia: PASOS_DE_TRABAJOS,
  },
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
  {
    id: 'servicios',
    numero: '05',
    nombre: 'Servicios',
    superficie: 'papel-opaco',
    alto: altoDeSecuenciaPinneada(PASOS_DE_SERVICIOS),
    pinneada: 'siempre',
    pasosDeLaSecuencia: PASOS_DE_SERVICIOS,
  },
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
