/**
 * [L7c] UNA NOTA DEL BLOG — dato tipado, sin base de datos: cada nota es un archivo de esta carpeta (`_notas/<slug>.ts`) y `indice.ts` las
 * junta. Las escribió la IA para que Valentino las vaya moldeando con su voz: sin estadísticas, encuestas ni historias de clientes inventadas.
 */
export type TonoDePortada = 'tinta' | 'papel' | 'web' | 'ia' | 'software' | 'automatizacion'

export interface PortadaDeNota {
  /** La palabra grande de la portada tipográfica (una o dos, cortas). */
  readonly palabra: string
  readonly tono: TonoDePortada
}

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
  readonly portada: PortadaDeNota
  readonly introduccion: readonly string[]
  readonly secciones: readonly SeccionDeNota[]
  /** El cierre: una invitación suave a hablar con develOP. */
  readonly cierre: string
}
