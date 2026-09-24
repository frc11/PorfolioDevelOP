/**
 * EL CONTENIDO DE SERVICIOS — como DATO, con sus marcadores a la vista.
 *
 * ── Por qué está acá y no adentro del JSX ─────────────────────────────────
 *
 * Porque es lo que hay que reemplazar, y lo que hay que poder contar. Un
 * párrafo escrito adentro de un componente no se puede medir en palabras sin
 * renderizarlo, y el canal P3 necesita `palabras.length` ANTES de dibujar nada.
 *
 * ── Qué es real y qué es relleno ──────────────────────────────────────────
 *
 *   real      los tres nombres de servicio (salen de `_contrato/acento.ts`), el
 *             nombre de la sección (sale de `_lib/secciones.ts`), el TITULAR —que
 *             sólo dice lo que la sección muestra abajo— y los tres clientes:
 *             Esquina, El Garage y Banú, que salen de `_contrato/escaneo.ts`.
 *   relleno   los párrafos, los rubros, los once ítems y la línea de caso.
 *             Tienen la LONGITUD y la ESTRUCTURA RETÓRICA de lo definitivo y
 *             llevan `[MÉTRICA]`, `[CIFRA]`, `[TESTIMONIO]`, `[VIDEO]` y
 *             `[PÓSTER]` donde iría una prueba, un archivo o un caso.
 *
 * **Ningún número que se pueda leer como un hecho. Ningún precio, ni de
 * ejemplo.** El único número visible es el `05` del rótulo: estructura del
 * recorrido, declarada en `NUMEROS_PERMITIDOS`.
 *
 * ── Los párrafos entran en la banda medida de P3 ──────────────────────────
 *
 * P3 se midió entre 17 y 33 targets, y son palabras, no líneas. El dueño
 * confirmó que no hay ni va a haber cifras reales de ningún cliente: la frase
 * de métrica inventada que colgaba al final de cada párrafo —detrás de la
 * llave— se sacó entera, de acá y de `inventado.ts` (era una promesa que no
 * debía existir, no un hueco esperando un dato). El copy real del dueño mide
 * 26, 27 y 23 palabras: entra en la banda sin nada más colgado. `LONGITUDES`
 * las publica y el instrumento las imprime, en vez de recalcularlas de otra
 * forma.
 */

import { sizesPorTresTramos } from '../../_lib/imagen'
import { palabrasDe } from '../../_lib/palabras'
import { IDS_DE_SERVICIO, type IdDeServicio } from '../_contrato/acento'
import type { EntradaDePedido } from '../_contrato/pedido'

/**
 * Once ítems por servicio. Es lo MEDIDO de P4 —`piezas: { min: 11, max: 11 }`—
 * y acá es un contrato: el módulo tira si alguna lista no los tiene.
 */
export const ITEMS_POR_SERVICIO = 11

export interface ContenidoDeUnServicio {
  /** La categoría, arriba del nombre. Es donde el acento entra como TEXTO. */
  readonly rubro: string
  /** El párrafo del canal P3. Se enciende palabra por palabra. */
  readonly parrafo: string
  /** Los once ítems del canal P4. Cortos, con forma de entregable. */
  readonly items: readonly string[]
  /** Qué tiene que mostrar el video. Es el pedido, escrito para que se lea. */
  readonly medio: string
  /** La línea de caso: el hueco del ejemplo, con los clientes reales. */
  readonly caso: string
}

/**
 * La línea de caso es la MISMA en los tres, a propósito. Un caso distinto por
 * servicio obligaría a decidir qué cliente contrató qué frente, y eso no es
 * relleno: sería un hecho inventado sobre un cliente real, que es peor que una
 * cifra inventada. Acá declara que es un hueco y ofrece los tres nombres
 * verdaderos para que se elija el que corresponda.
 */
const CASO =
  'Caso de referencia — [TESTIMONIO], con el cliente que corresponda: ' +
  'Esquina, El Garage o Banú.'

/**
 * EL TITULAR DE LA SECCIÓN — el encabezado que la NOMBRA (SITIO-S11, defecto 16).
 *
 * ── Por qué no estaba, y por qué es un defecto y no una omisión ───────────
 *
 * Servicios era la única de las ocho sin encabezado propio: sus tres servicios
 * entraban como `h2` HERMANOS de los titulares de las otras siete, y el árbol
 * del documento leía tres secciones donde hay una. `s10-acceso` §4 lo publicó
 * como el hallazgo 4 —gravedad baja, dueño esta sección— y su tabla es la
 * especificación de este arreglo.
 *
 * ── Qué hace este texto, y qué NO dice ────────────────────────────────────
 *
 * Nombra el recorrido y nada más: que son tres frentes y que los atiende el
 * mismo equipo. Ningún número que se pueda leer como un dato —«Tres» es la
 * cuenta de lo que la sección muestra abajo, igual que el «Tres proyectos» de
 * Trabajos— y ninguna promesa que la sección no demuestre. `escanearContenido`
 * lo revisa con el resto del texto renderizado: no hay una segunda regla acá.
 *
 * ── Y por qué vive acá y no en `secciones.ts` ─────────────────────────────
 *
 * Porque es COPY, y `secciones.ts` es el recorrido: nombre, número, alto y
 * superficie. El rótulo «Servicios» sí sale de ahí —lo consume
 * `EncabezadoDeSeccion`—; el titular es contenido y se edita acá, como el de
 * las otras siete.
 */
export const TITULAR = 'Nuestros servicios'

/**
 * EL RÓTULO DEL ESTADO QUE ABRE EL RODILLO.
 *
 * El estado 0 tiene la misma anatomía que los tres servicios —número, nombre,
 * subrayado y rótulo— así que necesita su rótulo. Dice lo que la sección es,
 * no lo que vende: los tres rubros de abajo son categorías comerciales, éste
 * es la frase que las junta.
 */
export const ROTULO_DE_LA_INTRO = 'lo que nosotros hacemos'

/**
 * LA ETIQUETA DEL CTA, por servicio.
 *
 * Es la misma frase en primera persona del cliente para los tres, con el
 * servicio cambiado: lo que rota es el objeto, no el verbo. Por eso el botón
 * puede relevar la etiqueta con su propio intercambio sin que el gesto se lea
 * como «apareció otro botón».
 */
export const CTA_POR_SERVICIO: Readonly<Record<IdDeServicio, string>> = {
  web: 'Quiero mi desarrollo web',
  software: 'Quiero mi software a medida',
  'ia-automatizacion': 'Quiero mi integración con IA',
}

/**
 * MÓVIL 2: el nombre en la cabeza fija abajo de 1024, donde el completo no entra en dos
 * renglones. El completo sigue siendo el nombre del servicio: lo anuncia el lector y
 * lo muestra escritorio. Sólo lo lleva el que no entra.
 */
export const NOMBRE_CORTO: Readonly<Partial<Record<IdDeServicio, string>>> = {
  'ia-automatizacion': 'IA y Automatizaciones',
}

export const CONTENIDO: Readonly<Record<IdDeServicio, ContenidoDeUnServicio>> = {
  web: {
    rubro: 'Digitalizá tu negocio',
    parrafo:
      'Ponemos tu negocio online con una página que se entiende sola y que podés ' +
      'manejar vos. No arrancamos de una plantilla: arrancamos de lo que vendés.',
    items: [
      'Diseño y maquetado a medida',
      'Sitio institucional o tienda',
      'Catálogo con buscador',
      'Formularios con aviso al equipo',
      'Novedades autogestionables',
      'Carga de contenido sin tocar código',
      'Optimización de imágenes y fuentes',
      'Metadatos y datos estructurados',
      'Analítica conectada al panel',
      'Hosting, dominio y certificado',
      'Mantenimiento y mejoras continuas',
    ],
    medio: 'Recorrido de un sitio real navegándose en teléfono y en escritorio',
    caso: CASO,
  },
  'ia-automatizacion': {
    rubro: 'Innovando con la última tecnología',
    parrafo:
      'Chatbots y bots de WhatsApp que atienden, responden y levantan pedidos sin ' +
      'que estés del otro lado. Se paga la implementación una vez y un abono ' +
      'mensual.',
    items: [
      'Asistente entrenado con tus datos',
      'Respuestas en el sitio y en WhatsApp',
      'Derivación a una persona cuando hace falta',
      'Toma de turnos y recordatorios',
      'Carga automática de comprobantes',
      'Clasificación de consultas por tema',
      'Resumen diario para el equipo',
      'Conexión con tu CRM y tus planillas',
      'Reglas y límites definidos por vos',
      'Registro de cada conversación',
      'Ajuste sobre lo que realmente pasó',
    ],
    medio: 'Pantalla del asistente respondiendo una consulta y derivando a una persona',
    caso: CASO,
  },
  software: {
    rubro: 'Una solución a tus problemas',
    parrafo:
      'Nos contás lo que hoy se hace a mano y lo convertimos en una herramienta ' +
      'hecha para tu operación. Primero entendemos, después presupuestamos.',
    items: [
      'Relevamiento de tu operación actual',
      'Modelo de datos y permisos por rol',
      'Panel de administración propio',
      'Altas, bajas y cambios auditados',
      'Stock, remitos y comprobantes',
      'Reportes que se exportan',
      'Integración con lo que ya usás',
      'Migración de tus planillas',
      'Ambiente de prueba antes de salir',
      'Capacitación del equipo',
      'Soporte y evolución del sistema',
    ],
    medio: 'Recorrido por el panel del sistema: alta, listado y reporte',
    caso: CASO,
  },
}

/** LA RELACIÓN DE ASPECTO DEL HUECO. Es la del video, no una decisión de layout:
 *  reservarla es lo que evita el salto el día que entre el archivo. */
export const ANCHO_DEL_MEDIO = 1920
export const ALTO_DEL_MEDIO = 1080

/**
 * El `sizes` REAL del hueco, compuesto por el ayudante y no escrito a mano.
 *
 * El medio vive en UNA de las DOS columnas de la grilla del cuerpo, que conmuta
 * a dos en `tablet`. De ahí los tres tramos: la mitad arriba del umbral de
 * escritorio, la mitad entre tablet y ese umbral, y el viewport entero abajo,
 * donde la grilla colapsa. Con dos tramos el navegador bajaría el doble de lo
 * necesario justo en la banda del medio.
 */
export const SIZES_DEL_MEDIO = sizesPorTresTramos(50, 50, 100)
/** ⚠️ B12 §4.3 · el PÓSTER provisional. El video sigue sin existir: uno que se reproduce se leería como el recorrido definitivo. */
export const POSTER_PROVISIONAL = '/placeholders/poster.png'

/** Las palabras de un párrafo. Es la `cantidad` del canal P3. */
export function palabrasDelParrafo(id: IdDeServicio): readonly string[] {
  return palabrasDe(CONTENIDO[id].parrafo)
}

/**
 * Las tres longitudes, para que el instrumento las imprima sin recalcularlas de
 * otra forma que la que usa el componente.
 */
export const LONGITUDES: Readonly<Record<IdDeServicio, number>> = {
  web: palabrasDelParrafo('web').length,
  'ia-automatizacion': palabrasDelParrafo('ia-automatizacion').length,
  software: palabrasDelParrafo('software').length,
}

/**
 * El contrato de los once, comprobado al IMPORTAR y no al renderizar: una lista
 * de diez ítems con `cantidad = 11` desincroniza el escalonado de P4 en
 * silencio —la ventana que sobra es la de la pieza que más tarda— y eso no se
 * ve en pantalla, se calcula.
 */
for (const id of IDS_DE_SERVICIO) {
  const cantidad = CONTENIDO[id].items.length
  if (cantidad !== ITEMS_POR_SERVICIO) {
    throw new Error(
      `_s5-servicios/contenido: "${id}" declara ${cantidad} ítems y P4 está medido en ` +
        `${ITEMS_POR_SERVICIO}. El escalonado se calcula sobre esa cantidad.`,
    )
  }
}

/**
 * EL PEDIDO — lo que falta en esta sección, con su formato.
 *
 * Se agrega en SITIO-S7 para que el pedido sea un DATO y no prosa: `s7-pedido`
 * lo cruza contra el texto renderizado en los dos sentidos. El archivo donde se
 * edita NO se escribe acá: sale del registro.
 *
 * ⚠️ **FALTABAN DOS `[CIFRA]` (V3-D).** Los párrafos de `ia-automatizacion` y de
 * `software` muestran cada uno el suyo —«horas devueltas», «errores evitados»—
 * y sólo el de `web` estaba declarado. `s7-pedido` no lo vio porque cruza CLASES
 * de marcador y no ocurrencias: con uno declarado alcanzaba para los tres. Eran
 * dos agujeros a la vista y fuera de la lista que se le manda a Franco.
 */
export const PEDIDO: readonly EntradaDePedido[] = [
  {
    ruta: 'CASO_DE_REFERENCIA',
    clase: 'testimonio',
    marcador: '[TESTIMONIO]',
    quienLoTrae: 'franco',
    que: 'El caso de referencia de cada frente, con el cliente que corresponda y qué cambió.',
    formato: 'Dos o tres renglones, con el nombre del cliente. Texto plano.',
  },
  {
    ruta: 'CONTENIDO.<servicio>.medio',
    clase: 'video',
    marcador: '[VIDEO]',
    quienLoTrae: 'valentino',
    que: 'El video del frente: qué se ve, en veinte segundos y sin audio necesario.',
    formato: 'MP4 (h264), 1920 × 1080 px (16:9), ≤ 20 s, ≤ 4 MB. Sin audio obligatorio.',
  },
  {
    ruta: 'CONTENIDO.<servicio>.medio',
    clase: 'video',
    marcador: '[PÓSTER]',
    quienLoTrae: 'valentino',
    que: 'El primer cuadro del video, para que no arranque negro.',
    formato: 'JPG o WEBP, 1920 × 1080 px (16:9).',
  },
]
