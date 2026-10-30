/**
 * [L7c] UNA NOTA DEL BLOG — dato tipado, sin base de datos: cada nota es un archivo de esta carpeta (`_notas/<slug>.ts`) y `indice.ts` las
 * junta. Las escribió la IA para que Valentino las vaya moldeando con su voz: sin estadísticas, encuestas ni historias de clientes inventadas.
 */
export interface SeccionDeNota {
  readonly subtitulo: string
  readonly parrafos: readonly string[]
}

export interface Nota {
  readonly slug: string
  readonly titulo: string
  /** La bajada: lo que se ve en el carrusel, en las tarjetas y en la metadata. */
  readonly resumen: string
  /** ISO `AAAA-MM-DD`. */
  readonly fecha: string
  /** [M2] La foto de tapa, en `public/v3/blog/` (webp, 4:3, 1600 × 1200). Cambiarla es reemplazar el archivo o esta línea. */
  readonly foto: string
  /** [M2] La frase destacada que se pinta: una frase LITERAL de un párrafo de la nota (no texto nuevo), que se repite grande debajo de él. */
  readonly destacado: string
  readonly introduccion: readonly string[]
  readonly secciones: readonly SeccionDeNota[]
  /** El cierre: una invitación suave a hablar con develOP. */
  readonly cierre: string
}
