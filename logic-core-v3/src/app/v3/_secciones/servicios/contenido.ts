/**
 * EL CONTENIDO DE SERVICIOS — como DATO, con sus marcadores a la vista.
 *
 * ── Por qué está acá y no adentro del JSX ─────────────────────────────────
 *
 * Porque es lo que hay que reemplazar, y lo que hay que poder contar. Un
 * párrafo escrito adentro de un componente no se puede medir en palabras sin
 * renderizarlo, y el canal P3 necesita `palabras.length` ANTES de dibujar nada:
 * el escalonado del patrón se calcula sobre esa cantidad.
 *
 * ── Qué es real y qué es relleno ──────────────────────────────────────────
 *
 *   real      los tres nombres de servicio (salen de `_contrato/acento.ts`, no
 *             se escriben acá), el nombre de la sección (sale de
 *             `_lib/secciones.ts`), el TITULAR —que sólo dice lo que la sección
 *             muestra abajo— y los tres clientes: Esquina, El Garage y
 *             Matsu Automotores.
 *   relleno   los párrafos, los rubros, los once ítems y la línea de caso.
 *             Tienen la LONGITUD y la ESTRUCTURA RETÓRICA de lo definitivo y
 *             llevan `[MÉTRICA]`, `[CIFRA]`, `[TESTIMONIO]`, `[VIDEO]` y
 *             `[PÓSTER]` donde iría una prueba, un archivo o un caso.
 *
 * **Ningún número que se pueda leer como un hecho. Ningún precio, ni de
 * ejemplo.** El único número visible de la sección es el `05` del rótulo, que
 * es estructura del recorrido y está declarado en `NUMEROS_PERMITIDOS`.
 *
 * ── Los párrafos entran en la banda MEDIDA de P3 ──────────────────────────
 *
 * P3 se midió entre 17 y 33 targets, y son palabras, no líneas. Los tres
 * párrafos de acá miden 33, 33 y 31 palabras: entran en la banda medida y
 * además en el rango de 30 a 45 que pide la instrucción. `LONGITUDES` las
 * publica, y el instrumento las imprime en vez de recalcularlas de otra forma.
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
 * La línea de caso es la MISMA en los tres, a propósito.
 *
 * Un caso distinto por servicio obligaría a decidir qué cliente contrató qué
 * frente, y eso no es relleno: sería un hecho inventado sobre un cliente real,
 * que es peor que una cifra inventada. Acá la línea declara que es un hueco y
 * ofrece los tres nombres verdaderos para que se elija el que corresponda.
 */
const CASO =
  'Caso de referencia — [TESTIMONIO], con el cliente que corresponda: ' +
  'Esquina, El Garage o Matsu Automotores.'

/**
 * EL TITULAR DE LA SECCIÓN — el encabezado que la NOMBRA (SITIO-S11, defecto 16).
 *
 * ── Por qué no estaba, y por qué es un defecto y no una omisión ───────────
 *
 * Servicios era la única de las ocho sin un encabezado propio: sus tres
 * servicios entraban como `h2` HERMANOS de los titulares de las otras siete, y
 * el árbol del documento leía tres secciones donde hay una. `s10-acceso` §4 lo
 * publicó como el hallazgo 4 —gravedad baja, dueño esta sección— y su tabla es
 * la especificación de este arreglo.
 *
 * ── Qué hace este texto, y qué NO dice ────────────────────────────────────
 *
 * Nombra el recorrido de la sección y nada más: que son tres frentes y que los
 * atiende el mismo equipo. No hay un número que se pueda leer como un dato —
 * «Tres» es la cuenta de lo que la propia sección muestra abajo, igual que el
 * «Tres proyectos» del titular de Trabajos— y no hay una promesa que la sección
 * no demuestre. `escanearContenido` lo revisa junto con el resto del texto
 * renderizado, así que no hay una segunda regla para el titular.
 *
 * ── Y por qué vive acá y no en `secciones.ts` ─────────────────────────────
 *
 * Porque es COPY, y `secciones.ts` es el recorrido: nombre, número, alto y
 * superficie. El rótulo «Servicios» sí sale de ahí —lo consume
 * `EncabezadoDeSeccion`—; el titular es contenido y se edita acá, como el de
 * las otras siete.
 */
export const TITULAR = 'Tres frentes, y el mismo equipo detrás de los tres.'

export const CONTENIDO: Readonly<Record<IdDeServicio, ContenidoDeUnServicio>> = {
  web: {
    rubro: 'Sitios y tiendas',
    parrafo:
      'Sitios que cargan rápido y se leen igual en un teléfono que en un escritorio. ' +
      'Diseñamos, escribimos y medimos: [MÉTRICA] de velocidad y [CIFRA] de conversión ' +
      'quedan a la vista en tu panel.',
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
    rubro: 'Asistentes y procesos',
    parrafo:
      'Automatizamos lo que hoy alguien copia y pega: turnos, seguimientos, avisos. ' +
      'El asistente responde con los datos de tu negocio y deriva cuando corresponde. ' +
      '[MÉTRICA] de consultas resueltas y [CIFRA] de horas devueltas.',
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
    rubro: 'Sistemas internos',
    parrafo:
      'Cuando la planilla ya no alcanza, construimos el sistema que tu operación necesita: ' +
      'stock, remitos, permisos por rol, historial de cada cambio. ' +
      '[MÉTRICA] de procesos migrados y [CIFRA] de errores evitados.',
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

/**
 * LA RELACIÓN DE ASPECTO DEL HUECO. Es la del video, no una decisión de layout:
 * reservarla es lo que evita el salto el día que entre el archivo.
 */
export const ANCHO_DEL_MEDIO = 1920
export const ALTO_DEL_MEDIO = 1080

/**
 * El `sizes` REAL del hueco, compuesto por el ayudante y no escrito a mano.
 *
 * El medio vive en UNA de las DOS columnas de la grilla del cuerpo, y esa
 * grilla conmuta a dos columnas en `tablet`. Por eso son tres tramos y no dos:
 * arriba del umbral de escritorio la mitad, entre tablet y ese umbral también
 * la mitad, y abajo el viewport entero, que es cuando la grilla colapsa a una
 * columna. Con dos tramos, en la banda del medio el navegador bajaría el doble
 * de lo necesario.
 */
export const SIZES_DEL_MEDIO = sizesPorTresTramos(50, 50, 100)

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
 * Se agrega en SITIO-S7: el lane que escribió la sección declaraba lo
 * provisional en prosa y con marcadores visibles, pero **el pedido no era un
 * dato**, así que no se podía producir un documento con él ni comprobar que no
 * se quedara viejo. `s7-pedido` cruza esta tabla contra el texto renderizado en
 * los dos sentidos: un marcador en pantalla sin entrada acá falla, y una
 * entrada que pide algo que ya no se ve, también.
 *
 * El archivo donde se edita NO se escribe acá: sale del registro.
 */
export const PEDIDO: readonly EntradaDePedido[] = [
  {
    ruta: 'CONTENIDO.web.parrafo',
    clase: 'metrica',
    marcador: '[MÉTRICA]',
    que: 'Qué se mide en un sitio entregado —velocidad— y contra qué se compara.',
    formato: 'Frase con su número y su unidad, adentro del párrafo. Ej.: `1,2 s de carga`.',
  },
  {
    ruta: 'CONTENIDO.web.parrafo',
    clase: 'cifra',
    marcador: '[CIFRA]',
    que: 'La conversión de un sitio entregado, medida sobre datos del cliente.',
    formato: 'Un número con su unidad, adentro del párrafo.',
  },
  {
    ruta: 'CONTENIDO.ia-automatizacion.parrafo',
    clase: 'metrica',
    marcador: '[MÉTRICA]',
    que: 'Cuántas consultas resuelve el bot sin intervención, sobre conversaciones reales.',
    formato: 'Un número con su unidad, adentro del párrafo.',
  },
  {
    ruta: 'CONTENIDO.software.parrafo',
    clase: 'metrica',
    marcador: '[MÉTRICA]',
    que: 'Cuántos procesos se migraron, contados de una lista real.',
    formato: 'Un número entero, adentro del párrafo.',
  },
  {
    ruta: 'CASO_DE_REFERENCIA',
    clase: 'testimonio',
    marcador: '[TESTIMONIO]',
    que: 'El caso de referencia de cada frente, con el cliente que corresponda y qué cambió.',
    formato: 'Dos o tres renglones, con el nombre del cliente. Texto plano.',
  },
  {
    ruta: 'CONTENIDO.<servicio>.medio',
    clase: 'video',
    marcador: '[VIDEO]',
    que: 'El video del frente: qué se ve, en veinte segundos y sin audio necesario.',
    formato: 'MP4 (h264), 1920 × 1080 px (16:9), ≤ 20 s, ≤ 4 MB. Sin audio obligatorio.',
  },
  {
    ruta: 'CONTENIDO.<servicio>.medio',
    clase: 'video',
    marcador: '[PÓSTER]',
    que: 'El primer cuadro del video, para que no arranque negro.',
    formato: 'JPG o WEBP, 1920 × 1080 px (16:9).',
  },
]
