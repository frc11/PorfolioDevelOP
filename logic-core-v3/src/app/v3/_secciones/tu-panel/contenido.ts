/**
 * EL CONTENIDO DE «TU PANEL» — como DATO. [B6] La sección del Panel (craneada el 2026-10-21): el título que se pinta, tres
 * módulos alternados con su palabra fundida y el CTA a pantalla completa. Ningún componente escribe una frase propia.
 *
 * **Ningún número y ninguna captura falsa.** Los módulos son las maquetas del panel (`_panel-vivo/`), con sus datos de
 * ejemplo y el sello «Ejemplo»; debajo de cada una queda su captura real, de respaldo.
 */

import { sizesPorViewport } from '../../_lib/imagen'
import type { IdDeDemo } from '../../_panel-vivo/catalogo'
import type { Marcador } from '../_contrato/marcadores'
import type { EntradaDePedido } from '../_contrato/pedido'

export const ID = 'tu-panel'

/** El nombre visible del rótulo. Es contenido, no el id. */
export const NOMBRE = 'Tu panel'

/**
 * Un renglón de un título que se pinta: sus palabras y si va en cursiva y subrayado («TODO»). [C2 60b] `cortesEnElTelefono`:
 * antes de qué palabras (su índice) el renglón se parte abajo de 1024 (un salto que desde 1024 no existe).
 */
export interface RenglonQueSePinta {
  readonly palabras: readonly string[]
  readonly destacado?: boolean
  readonly cortesEnElTelefono?: readonly number[]
}

/**
 * [B6] EL TÍTULO — «El panel donde controlás» y, en un segundo renglón, «TODO» en cursiva (se subraya mientras se pinta).
 * [C2 60b] En el teléfono y la tablet, más grande y en tres renglones: «El panel donde», «controlás» y «TODO».
 */
export const TITULO: readonly RenglonQueSePinta[] = [
  { palabras: ['El', 'panel', 'donde', 'controlás'], cortesEnElTelefono: [3] },
  { palabras: ['TODO'], destacado: true },
]

/**
 * [C2 60b] LA PALABRA PÁLIDA DETRÁS DEL TÍTULO (ítem 15) — disimulada, como las palabras fundidas de los módulos: lo que
 * sólo tenés con develOP. Decorativa: no se anuncia. Desde 1024 en un renglón; abajo, en estos dos.
 */
export const PALABRA_DEL_TITULO: readonly [string, string] = ['Lo que nos', 'distingue']

/** Un título como se anuncia: el texto entero, en una línea. */
export const textoDe = (renglones: readonly RenglonQueSePinta[]): string => renglones.flatMap((r) => r.palabras).join(' ')

/** Dónde se ancla una captura de respaldo en su marco. La clase vive en `geometria.ts`. */
export type EncuadreDeCaptura = 'izquierda' | 'centro' | 'derecha'

/** Un módulo del panel: su palabra fundida, su título y su descripción, y la maqueta que lo muestra. */
export interface Tarjeta {
  /** La palabra fundida, pálida, del lado opuesto del módulo. Decorativa: no se anuncia. */
  readonly palabra: string
  readonly titulo: string
  readonly descripcion: string
  /** La maqueta del panel (`_panel-vivo/`). */
  readonly demo: IdDeDemo
  /** La captura real de respaldo (lo que se ve sin JS y mientras la maqueta llega), servida desde `public/`. */
  readonly imagen: string
  readonly alt: string
  readonly encuadre: EncuadreDeCaptura
}

/**
 * [B6] LOS TRES MÓDULOS, en orden: el 1 a la derecha, el 2 a la izquierda y el 3 a la derecha (`geometria.ts`). Las
 * descripciones están escritas con lo que cada maqueta muestra de verdad (las columnas de los leads, las cuatro métricas y
 * sus pestañas, los siete campos de lo que sabe el chatbot): nada que el panel no tenga.
 */
export const TARJETAS: readonly Tarjeta[] = [
  {
    palabra: 'Clientes',
    titulo: 'Cada posible cliente, en un solo lugar',
    descripcion: 'Cada persona que te deja sus datos en tu página o en el chatbot llega al panel con lo que le interesa, cómo llegó y la conversación entera. La ves ordenada entre calientes, tibios y fríos, y con un toque marcás a quién ya contactaste.',
    demo: 'leads',
    imagen: '/recursos/panel/leads.webp',
    alt: 'El panel de leads en tres columnas, calientes, tibios y fríos, con la ficha de un lead de prueba y sus datos de contacto.',
    encuadre: 'derecha',
  },
  {
    palabra: 'Resultados',
    titulo: 'El resumen del mes',
    descripcion: 'Las estadísticas de tu sitio a mano: sesiones, usuarios, rebote y tiempo promedio, con las páginas más vistas y los últimos treinta días, uno por uno. Al lado, cómo te encuentran en Google, tus reseñas y un resumen escrito de lo que pasó en el mes.',
    demo: 'resultados',
    imagen: '/recursos/panel/resultados.webp',
    alt: 'La vista previa de resultados del panel: tráfico del sitio con sesiones, usuarios y un gráfico de los últimos 30 días.',
    encuadre: 'izquierda',
  },
  {
    palabra: 'Chatbot',
    titulo: 'Enseñale a tu chatbot cómo responder',
    descripcion: 'Toda la información que tu chatbot necesita saber de tu negocio, guardada en tu base de datos. Todo lo que ofrecés, las preguntas frecuentes, tus políticas, cómo tiene que hablar y lo que nunca debe decir. Si algo cambia, nos pedís el ajuste desde el panel.',
    demo: 'informacion',
    imagen: '/recursos/panel/modifica-chatbot.webp',
    alt: 'La configuración del chatbot en el panel: lo que sabe el bot sobre el negocio, con la información cargada para responder.',
    encuadre: 'izquierda',
  },
]

/** [B6] EL CARTEL DEL MÓDULO — con la rueda (o el dedo) encima, la página scrollea y el módulo lo dice. */
export const CARTEL = {
  raton: 'Hacé clic para scrollear acá',
  tactil: 'Tocá para scrollear acá',
} as const

/** [B6] EL CTA, a pantalla completa: el titular se pinta como el título; el botón todavía no hace nada (C1 lo despliega). */
export const CTA: { readonly titular: readonly RenglonQueSePinta[]; readonly bajada: string; readonly boton: string; readonly o: string } = {
  titular: [{ palabras: ['Tu', 'panel', 'crece', 'con', 'vos.'] }],
  bajada: 'Sumamos módulos nuevos todo el tiempo, a medida que tu negocio los necesita. Si querés indagar más:',
  boton: 'Probar el panel',
  o: 'o',
}

/**
 * EL NEWSLETTER — a la derecha del CTA. [RONDA 2] F1 · Ya envía: a `/api/newsletter` (`NewsletterDelPanel.tsx`), que hoy
 * recibe y valida; la conexión a la lista real es de la etapa siguiente. Las pruebas nunca lo llaman.
 */
export const NEWSLETTER = {
  id: 'tu-panel-novedades',
  titulo: 'Sé el primero en enterarte de las nuevas features',
  rotulo: 'Tu correo',
  placeholder: 'nombre@dominio',
  rotuloDeEnvio: 'Suscribirme',
  /** [RONDA 2] F1: envía (`/api/newsletter`); lo que dice cuando llegó. */
  listo: '¡Listo! Te avisamos de lo nuevo.',
} as const

/** Las palabras fundidas de los módulos (decorativas: no se anuncian). */
export const PALABRAS_DEL_FONDO: readonly string[] = TARJETAS.map((t) => t.palabra)

/**
 * LA CAPTURA — la medida que se le pide a cada imagen de respaldo, y el marcador que se lee encima mientras falte.
 * `s21-fotos` cruza `fuente`, `ancho` y `alto` contra el archivo del disco.
 */
export const MARCADOR_DE_LA_CAPTURA: Marcador = '[CAPTURA DEL PANEL]'

export const CAPTURA = {
  marcador: MARCADOR_DE_LA_CAPTURA,
  fuente: '/placeholders/panel.png',
  ancho: 1920,
  alto: 1080,
  /** El módulo ocupa a lo sumo el 60 % del ancho (el escritorio angosto): es el que manda el candidato de la escalera. */
  sizes: sizesPorViewport(60),
} as const

/** EL PEDIDO — lo que falta en esta sección. `s7-pedido` cruza esta tabla contra el texto renderizado en los dos sentidos. */
export const PEDIDO: readonly EntradaDePedido[] = []
