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
 *             `_lib/secciones.ts`) y los tres clientes: Esquina, El Garage y
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
import { palabrasDe } from '../../_lib/motion/lineas'
import { IDS_DE_SERVICIO, type IdDeServicio } from '../_contrato/acento'

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
export const RELACION_DEL_MEDIO = '16 / 9'

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
