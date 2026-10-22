/**
 * [NOCTURNO B2] LAS RESEÑAS — el título en que se da vuelta «Seis razones para elegirnos» y lo que dice cada tarjeta del aro.
 *
 * ⚠️ FICTICIAS, CON ASPECTO FINAL: decisión de Valentino (cola del 2026-10-22, B2). Sin la llave de contenido falso, visible ni invisible.
 * Los nombres y los negocios son inventados (ninguno es un cliente real ni nombra uno) y no llevan cifras. Los retratos son placeholders
 * ilustrados y neutros (`public/v3/resenas/`, siluetas; ninguna foto de una persona): la ruta está acá para reemplazarlos. Todo se reemplaza
 * antes de D8 (anotado en D).
 *
 * `proyecto`: el trabajo del Portfolio al que lleva «Ver trabajo →» (el deep link de B1, `#portfolio-<slug>`). Con las reseñas ficticias es
 * un reparto provisorio entre los tres trabajos reales: va con ellas cuando se reemplacen.
 */

import type { SlugDelProyecto } from '../../trabajos/proyectos'

/** El título, partido a los dos lados del logo como la frase que reemplaza. */
export const TITULO_DE_LAS_RESENAS = { izquierda: 'Lo que dicen', derecha: 'nuestros clientes' } as const

export const TEXTO_DE_LAS_RESENAS = {
  /** La pastilla del hover (la de Demos). */
  verTrabajo: 'Ver trabajo →',
  anterior: 'Reseña anterior',
  siguiente: 'Reseña siguiente',
  /** El nombre accesible de cada tarjeta (lleva al Portfolio). */
  enlace: (nombre: string, negocio: string): string => `Reseña de ${nombre}, ${negocio}. Ver el trabajo en el Portfolio`,
} as const

export interface Resena {
  readonly clave: string
  readonly cita: string
  readonly nombre: string
  readonly negocio: string
  /** El retrato (placeholder ilustrado): reemplazar el archivo o la ruta. */
  readonly foto: string
  readonly proyecto: SlugDelProyecto
}

const RETRATOS = ['/v3/resenas/retrato-a.svg', '/v3/resenas/retrato-b.svg', '/v3/resenas/retrato-c.svg', '/v3/resenas/retrato-d.svg'] as const
const TRABAJOS: readonly SlugDelProyecto[] = ['el-garage', 'esquina-estudio', 'banu-scents']

const CRUDAS: readonly (readonly [string, string, string, string])[] = [
  ['espiga', 'Nos entendieron desde la primera charla. El sitio se siente como nuestro local: cálido, ordenado y fácil de recorrer.', 'Mariela Ocampo', 'Panadería La Espiga'],
  ['ibarra', 'Ahora los clientes reservan solos el turno y yo dejé de contestar el teléfono todo el día.', 'Joaquín Ibarra', 'Taller de motos Ibarra'],
  ['ferreyra', 'Cada cambio que pedí lo vi en el panel el mismo día. Nunca tuve que perseguir a nadie.', 'Lucía Ferreyra', 'Estudio contable Ferreyra'],
  ['cerro', 'Antes de diseñar quisieron saber cómo trabajamos. Se nota en cada detalle del sitio.', 'Tomás Robles', 'Bodega Cerro Alto'],
  ['paz', 'Pasamos de una página que nadie miraba a una que nos trae consultas todas las semanas.', 'Carolina Paz', 'Inmobiliaria Paz'],
  ['norte', 'Rápidos y prolijos. Lo que prometieron para el lanzamiento llegó antes de lo pensado.', 'Federico Albarracín', 'Cervecería del Norte'],
  ['vivero', 'El diseño es nuestro de verdad: nadie más tiene algo parecido, y los clientes lo comentan.', 'Valeria Guzmán', 'Vivero Monte Verde'],
  ['diaz', 'Me explicaron todo sin vueltas y sin palabras raras. Por fin entiendo mi propio sitio.', 'Ramiro Díaz', 'Ferretería Díaz'],
  ['medina', 'Se carga al instante en el celular, que es justo donde nos buscan nuestros clientes.', 'Sofía Medina', 'Óptica Medina'],
  ['rumbo', 'El panel me deja ver cómo avanza todo sin mandar un solo mail. Así da gusto.', 'Gonzalo Herrera', 'Viajes Rumbo Norte'],
  ['huellas', 'Trabajar con ellos fue como sumar a alguien al equipo que además entiende de tecnología.', 'Paula Juárez', 'Veterinaria Huellas'],
  ['aroma', 'Hablamos siempre con quienes hacían el sitio. Cero intermediarios, cero sorpresas.', 'Martín Sosa', 'Café Aroma de Barrio'],
]

/** Las reseñas, en el orden del aro (al menos tantas como placas: entre las que se leen nunca se repite una). */
export const RESENAS: readonly Resena[] = CRUDAS.map(([clave, cita, nombre, negocio], i) => ({
  clave,
  cita,
  nombre,
  negocio,
  foto: RETRATOS[i % RETRATOS.length],
  proyecto: TRABAJOS[i % TRABAJOS.length],
}))

/** El deep link de B1 al trabajo de una reseña. */
export const enlaceDelTrabajo = (r: Resena): string => `#portfolio-${r.proyecto}`
