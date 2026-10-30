/**
 * [SERVICIOS S1a] LOS TIPOS DE LAS PÁGINAS DE SERVICIO — plan: `docs/servicios/SPRINT-S0.md` §8.1.
 *
 * Datos puros: este archivo no importa componentes, ni react, ni next. Sus dos imports son de tipo y se
 * borran al compilar, así que no hay ciclos en runtime.
 *
 * Una regla recorre todo el modelo: `null` (o `[]`) quiere decir «el dato todavía no existe» ([a definir]).
 * La interfaz nunca lo completa con un número o un texto inventado (`formato.ts`).
 */

import type { IdDeServicio } from '../_secciones/_contrato/acento'
import type { PreguntaFrecuente } from '../_componentes/faq/preguntas'
import type { FUENTE_DE_PROYECTOS } from './datos/fuenteDeProyectos'

/** Los tres servicios, en el orden del SPEC (§4). El tipo se deriva de la lista: una sola fuente. */
export const SLUGS_DE_SERVICIO = ['paginas-web', 'software-a-medida', 'ia-y-automatizaciones'] as const
export type ServicioSlug = (typeof SLUGS_DE_SERVICIO)[number]

export function esServicioSlug(valor: string): valor is ServicioSlug {
  return SLUGS_DE_SERVICIO.some((slug) => slug === valor)
}

/** El slug de un proyecto del portfolio. Se deriva de la fuente (O-6): servicios no lo escribe. */
export type ProyectoSlug = (typeof FUENTE_DE_PROYECTOS)[number]['slug']

/** USD. `null` = el dato todavía no existe ([a definir]): la UI nunca inventa un número. */
export type Usd = number | null

export interface Calibre {
  readonly nombre: string
  readonly desde: number
  readonly descripcion: string
  /** Lo propio del calibre. Vacío = no se muestra (el SPEC no lo da). */
  readonly incluye: readonly string[]
  /** Si trae panel para editar. `null` = [a definir] (SPEC §11: la Simple). */
  readonly autogestionable: boolean | null
}

export interface Plan {
  readonly nombre: string
  readonly mensual: number
  readonly conversaciones: number
  readonly soporte: string
  readonly cambiosWeb: string
  /** `null` = [a definir] (SPEC §7.3). */
  readonly funcionalidades: readonly string[] | null
}

/** [M2a] La opción destacada del precio en diagonales: va al medio, con su marca y una línea. Ningún otro texto de venta. */
export interface Destacada {
  /** El nombre de la opción del medio: si no lo es, la vista tira (`bloques/precio/tresOpciones.ts`). */
  readonly nombre: string
  readonly marca: string
  readonly linea: string
}

export type Precio =
  | { readonly tipo: 'calibres'; readonly calibres: readonly Calibre[]; readonly destacada: Destacada | null }
  | { readonly tipo: 'proyecto'; readonly desde: number; readonly nota: string }
  | {
      readonly tipo: 'planes'
      readonly planes: readonly Plan[]
      readonly implementacionDesde: Usd
      readonly nota: string
    }

export interface ItemDeExtra {
  readonly nombre: string
  readonly detalle: string
  /** El precio tal como lo publica el SPEC («Desde USD 50», «Siempre incluidos»). `null` = [a definir]. */
  readonly precio: string | null
}

export interface Extra {
  readonly titulo: string
  readonly items: readonly ItemDeExtra[]
  readonly nota: string | null
}

/** Caso del portfolio (fuente única: PROYECTOS) o caso propio de servicios. */
export type Caso =
  | { readonly tipo: 'proyecto'; readonly slug: ProyectoSlug; readonly texto: string }
  | {
      readonly tipo: 'propio'
      readonly nombre: string
      readonly rubro: string | null
      readonly texto: string | null
      /** Captura con datos ficticios. `null` mientras no exista (SPEC §11). */
      readonly imagen: string | null
    }

export interface CtaDelPanel {
  readonly rotulo: string
  /** `null` = [a definir] (B7/C1). Con D11, en IA es '/login'. */
  readonly href: string | null
}

/** [M3] Una versión del video de trabajos: el archivo, su póster (el primer cuadro) y sus medidas. Las escribe `scripts-servicios/montar.ts`. */
export interface VersionDelVideo {
  readonly video: string
  readonly poster: string
  readonly ancho: number
  readonly alto: number
}

/** [M3] El video de trabajos (slot 6): dos versiones (la que toca sale de la orientación de la pantalla) y la línea que va sobre el velo. */
export interface VideoDeTrabajos {
  readonly horizontal: VersionDelVideo
  readonly vertical: VersionDelVideo
  /** Las demos del montaje, por su slug en el catálogo del home (`datos/fuenteDeDemos.ts`). */
  readonly demos: readonly string[]
  /** Dictada (M3): separa los sitios de clientes de las demos propias, con los nombres de las dos fuentes. */
  readonly linea: string
}

export interface Prueba {
  readonly casos: readonly Caso[]
  /** Una línea propia; por ejemplo, «2 sistemas más en desarrollo» (SPEC §7.2). [M3] Sin slot que la muestre: queda para la réplica. */
  readonly nota: string | null
  /** [M3] Sin slot que lo muestre (el slot 6 es solo de Páginas web): queda para la réplica, con la demo del panel. */
  readonly ctaPanel: CtaDelPanel | null
  /** [M3] `null` = el slot 6 no se monta. Solo Páginas web lo tiene. */
  readonly video: VideoDeTrabajos | null
}

/** [L7a] Un paso de Cómo trabajamos: su nombre y qué pasa en él. */
export interface PasoDelProceso {
  readonly nombre: string
  readonly texto: string
}

/** [L7a] Una pieza con nombre y una frase: los ejemplos para un negocio y «Lo que podemos construir». */
export interface PiezaConTexto {
  readonly nombre: string
  readonly texto: string
}

export interface Articulo {
  readonly titulo: string
  /** `null` mientras no exista el blog. */
  readonly href: string | null
}

export interface Servicio {
  readonly slug: ServicioSlug
  /**
   * El id del mismo servicio en el home. Es TODO el acento de la página: los dos tokens del tema salen de él (el oscuro sobre papel y,
   * [M1] P-H2, el claro sobre la noche: `estiloDelAcento.ts`). Los datos no guardan ningún color. También es la precarga del contacto.
   */
  readonly idEnElHome: IdDeServicio
  /** [M1] Es el `h1` de la página (el mismo texto que el título 3D de B12a). */
  readonly nombre: string
  /** Copy provisorio (// C2). El title se arma con LOGOTIPO: la marca no va escrita suelta (D10). */
  readonly seo: { readonly title: string; readonly description: string }
  readonly problema: { readonly titulo: string; readonly texto: string }
  readonly queHacemos: { readonly titulo: string; readonly texto: string }
  /** [L7a] Los párrafos de Qué hacemos, debajo del texto: el servicio contado con más detalle. */
  readonly detalle: readonly string[]
  /** [L7a] Ejemplos típicos para un negocio chico: qué se arma y para quién. */
  readonly ejemplos: readonly PiezaConTexto[]
  /** [L7a] «Lo que podemos construir»: lo honesto en lugar de casos cuando el servicio no tiene trabajos propios publicados. Vacío = no se muestra. */
  readonly posibles: readonly PiezaConTexto[]
  /** [L7a] Lo que el cliente tiene en la mano al terminar. */
  readonly entrega: readonly string[]
  /** [L7a] Lo que pasa después de la entrega, en párrafos. */
  readonly despues: readonly string[]
  readonly incluye: readonly string[]
  /** Vacío = no se muestra. */
  readonly aparte: readonly string[]
  readonly precio: Precio
  readonly extra: Extra | null
  readonly proceso: { readonly pasos: readonly PasoDelProceso[]; readonly plazo: string }
  readonly prueba: Prueba
  /** [L7a] Las 6 preguntas de la página: van al FAQ del cierre (`CierreDeLaPagina`), no al cuerpo. */
  readonly faq: readonly PreguntaFrecuente[]
  /**
   * El SPEC no da el rótulo del botón (D10). `texto` es `null` cuando no hay un párrafo dicho por el SPEC o dictado: el bloque se
   * arma sin párrafo, no con uno inventado.
   */
  readonly cta: { readonly titulo: string; readonly texto: string | null; readonly boton: string }
  readonly articulos: readonly Articulo[]
}
