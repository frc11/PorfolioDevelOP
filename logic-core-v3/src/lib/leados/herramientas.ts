/**
 * LeadOS — Registro de las herramientas EXTERNAS que el setter usa a lo largo
 * del flujo (Evaluador, Gem de diseño, Claude Design, Netlify Drop, Gem de
 * outreach). Sin Prisma ni 'use server': es contenido puro, importable tanto
 * desde server components como desde client components.
 *
 * Esta constante es la ÚNICA copia del contenido de orientación + los links
 * (mismo patrón que SHELL_CONSTRUCCION / CANAL_INSTAGRAM en flow.ts): la UI lo
 * consume tal cual, así Franco corrige una descripción o carga un link nuevo
 * editando SOLO este archivo, sin tocar componentes.
 *
 * ALCANCE deliberado: SOLO qué ES la herramienta, qué esperar (qué le das /
 * qué te devuelve) y dónde se abre. NO incluye "cómo dirigir la IA" ni
 * ejemplos de prompt — eso es otra capa (prompts/fundamentos), no esta.
 *
 * MIGRACIÓN: cuando exista la fuente única de contenido (FG-1.0), este registro
 * debería moverse o consumirse desde ahí. Hoy queda localizado acá a propósito.
 */

export type HerramientaId =
  | 'evaluador'
  | 'gemDiseno'
  | 'claudeDesign'
  | 'netlifyDrop'
  | 'gemOutreach'

export type Herramienta = {
  id: HerramientaId
  /** Nombre visible de la herramienta. */
  nombre: string
  /** Una o dos líneas: qué ES, en castellano simple. */
  queEs: string
  /** Qué le das de entrada (lo que pegás o arrastrás). */
  queLeDas: string
  /** Qué te devuelve (la salida que traés de vuelta al panel). */
  queTeDevuelve: string
  /** Dónde aparece en el flujo — etiqueta corta para el panel de accesos. */
  dondeSeUsa: string
  /**
   * Link para abrirla en una pestaña nueva. `null` = todavía no lo tenemos
   * cargado: la UI muestra el acceso como "pendiente" en vez de un link roto.
   * Cargar el real reemplazando el null (no inventar URLs).
   */
  url: string | null
}

/**
 * El registro. Las URLs marcadas `null` (// TODO: URL) esperan el link real de
 * Franco: son Gems privados / herramientas con acceso propio, no deducibles del
 * código. Netlify Drop sí tiene URL pública estable.
 */
export const HERRAMIENTAS: Record<HerramientaId, Herramienta> = {
  evaluador: {
    id: 'evaluador',
    nombre: 'Chat de evaluación (Sonnet)',
    queEs:
      'Un chat de Sonnet que lee la ficha del negocio y dice si vale la pena invertir tiempo en una demo: le pegás la ficha y te devuelve su lectura.',
    queLeDas:
      'El bloque de la ficha que armaste en Ficha (el botón «Copiar bloque» está acá arriba), como primer mensaje del chat.',
    queTeDevuelve:
      'Un score del 1 al 5, un veredicto (descartar / avanzar / avanzar con prioridad) y el razonamiento. Eso es lo que traés de vuelta al panel.',
    dondeSeUsa: 'Evaluación',
    url: null, // TODO: URL — chat de evaluación en Sonnet (pedir a Franco)
  },
  gemDiseno: {
    id: 'gemDiseno',
    nombre: 'Gem de diseño',
    queEs:
      'Una IA que convierte la ficha + la evaluación en el brief de la demo: el plano de qué secciones lleva y qué dice cada una.',
    queLeDas:
      'El bloque «para el Gem de diseño» que está acá arriba (la ficha y la evaluación juntas).',
    // P5-B: la lista tiene que nombrar los campos que la pantalla PIDE. Decía
    // «y notas de marca» — ese ya no se completa acá (lo junta la ficha), así
    // que prometía un campo inexistente justo arriba del formulario.
    queTeDevuelve:
      'El brief estructurado: título, concepto, secciones en orden y CTA. Lo pegás y completás los campos de abajo.',
    dondeSeUsa: 'Brief',
    url: null, // TODO: URL — Gem privado de diseño/brief (pedir a Franco)
  },
  claudeDesign: {
    id: 'claudeDesign',
    nombre: 'Claude Design',
    queEs:
      'La herramienta donde se construye la demo de verdad: a partir del brief arma la landing de una página. El panel te guía fase por fase, no la construye por vos.',
    queLeDas:
      'El bloque «para Claude Design» de acá arriba (el brief + los materiales reales del negocio), como primer mensaje.',
    queTeDevuelve:
      'La demo lista para exportar como index.html — que después publicás en Netlify Drop, en «Borrador».',
    dondeSeUsa: 'Construcción',
    url: null, // TODO: URL — acceso a Claude Design que usa el equipo (pedir a Franco)
  },
  netlifyDrop: {
    id: 'netlifyDrop',
    nombre: 'Netlify Drop',
    queEs:
      'Un publicador gratis: arrastrás el archivo de la demo y te da una dirección web pública para revisarla o compartirla. No necesitás cuenta para empezar.',
    queLeDas:
      'El index.html que exportaste de Claude Design (o el .zip que lo contiene adentro).',
    queTeDevuelve:
      'Una URL pública (algo.netlify.app). Esa es la que se registra como «URL del borrador».',
    // P9 — `dondeSeUsa` es el rótulo del rail de herramientas: nombra la pantalla
    // por su nombre del manual, no por lo que se hace ahí. Decía «Publicar el
    // borrador» y «Primer contacto», que no son nombres de ninguna pantalla.
    dondeSeUsa: 'Borrador',
    url: 'https://app.netlify.com/drop',
  },
  gemOutreach: {
    id: 'gemOutreach',
    nombre: 'Gem de outreach',
    queEs:
      'Una IA que redacta los mensajes del primer contacto y ayuda con las objeciones — siempre dolor-first, sin precio y sin link. Usarla es opcional: si te sale solo, mejor.',
    queLeDas:
      'El bloque «para el Gem de outreach» (el del opener, o el de objeciones en «Registrá lo que pasó» si te tiraron una).',
    queTeDevuelve:
      'Un mensaje listo para adaptar y pegar en Instagram. Vos lo revisás antes de mandarlo.',
    dondeSeUsa: 'Opener y Seguimiento',
    url: null, // TODO: URL — Gem privado de outreach (pedir a Franco)
  },
}

/** Orden de presentación en el panel de accesos «Tus herramientas». */
export const HERRAMIENTAS_ORDEN: HerramientaId[] = [
  'evaluador',
  'gemDiseno',
  'claudeDesign',
  'netlifyDrop',
  'gemOutreach',
]

/**
 * ¿Esta herramienta NO se puede abrir todavía? Es el MISMO dato del que sale la
 * píldora «Link pendiente» del rail y de `ToolGuide` (`url === null`) — una sola
 * lectura, así el registro de abajo y el acceso de arriba no pueden divergir.
 *
 * Por qué existe como función y no como `!HERRAMIENTAS[id].url` repetido: desde
 * este sprint el dato decide algo más que un estilo de píldora — decide si el
 * campo que pide TRANSCRIBIR la salida de esa herramienta se puede exigir. Un
 * campo obligatorio cuya herramienta no se puede abrir es una pantalla imposible
 * de obedecer: la única forma de completarlo es inventar el contenido, y un dato
 * inventado viaja al resto del recorrido como si fuera real.
 *
 * Cargar la URL real en el registro de arriba vuelve a exigir el campo y apaga
 * las marcas de faltante, SIN tocar ningún componente.
 */
export function herramientaSinLink(id: HerramientaId): boolean {
  return HERRAMIENTAS[id].url === null
}

/**
 * ¿Este dato FALTA porque la herramienta que lo produce no se puede abrir?
 *
 * La diferencia que marca es la que pide el producto: un campo vacío puede ser
 * una decisión del setter (dejó el CTA en blanco) o una pared (no pudo abrir el
 * Gem). Quien consume el dato río abajo necesita distinguirlas, porque en el
 * segundo caso el dato no está y nadie lo omitió a propósito.
 */
export function faltaPorHerramientaSinLink(
  id: HerramientaId,
  valor: string | null | undefined,
): boolean {
  return !valor?.trim() && herramientaSinLink(id)
}
