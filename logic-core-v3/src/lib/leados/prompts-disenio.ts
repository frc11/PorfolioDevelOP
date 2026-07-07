/**
 * LeadOS Bloque 4·A — Librería de PROMPTS DE DISEÑO prefijados.
 *
 * Prompts ESTANDARIZADOS y LEAD-AGNÓSTICOS que el setter copia a Claude Design
 * (o al Gem de diseño) para REFINAR una demo ya construida: «pulí la estética»,
 * «adaptá a mobile», «mejorá el motion». No llevan datos del negocio — el mismo
 * prompt sirve para cualquier lead.
 *
 * Sin Prisma ni 'use server': son strings tipados puros, importables tanto desde
 * server components como desde client components (mismo patrón que
 * `herramientas.ts` / `guidance-content.ts` / `SHELL_CONSTRUCCION`). Franco
 * agrega o corrige un prompt editando SOLO este archivo, sin tocar componentes.
 *
 * ORTOGONAL a `copy-blocks.ts`: aquel arma los bloques con los DATOS del lead (la
 * ficha, el brief, los materiales) que viajan a las herramientas — es la capa de
 * datos, sensible y compartida. Esto es la capa de DIRECCIÓN de diseño, sin
 * datos: un bloque de copy-blocks lleva el negocio; un prompt de acá lleva el
 * criterio de diseño. Dos capas distintas — no se fusionan.
 *
 * SEMILLA (Bloque 4·A): este registro nace sembrado COSECHANDO la prosa de
 * diseño que ya vivía dispersa —las directivas «CALIDAD (no negociable)» del lab
 * FG-2 y las fases «Calidad y motion» / «Mobile» del shell de construcción—,
 * reescrita del registro «instrucción al setter» al registro «prompt para la
 * IA». El contenido FINO lo cura Franco después (tarea paralela); acá queda la
 * ESTRUCTURA + una semilla utilizable, lista para ampliar entrada por entrada.
 *
 * CRECIMIENTO: agregar un prompt = sumar su `id` al union y appendear una entrada
 * al array (todo en ESTE archivo; un typo no compila). El `id` la identifica
 * (key de React, futura referencia); el orden del array es el de presentación.
 * Nada de entradas vacías: solo prompts con contenido real.
 */

/** Identificador estable de un prompt de diseño (key de React + referencia futura). */
export type PromptDisenioId = 'estetica' | 'mobile' | 'motion'

/**
 * Un prompt de diseño prefijado. Los tres campos de texto casan 1:1 con las
 * props de `CopyBlock` (`titulo` / `instruccion` / `texto` = `prompt`), así el
 * componente lo entrega tal cual, sin volver a meter contenido en el JSX.
 */
export type PromptDisenio = {
  /** Identificador estable (no se muestra). */
  id: PromptDisenioId
  /** Título visible — va como `CopyBlock.titulo`. */
  titulo: string
  /** Una línea de cuándo/para qué usarlo — va como `CopyBlock.instruccion`. */
  instruccion: string
  /** El prompt completo, listo para pegar — va como `CopyBlock.texto`. */
  prompt: string
}

/**
 * La librería. Lead-agnóstica por diseño: ningún prompt nombra al negocio ni usa
 * sus datos. Orden del array = orden de presentación. Semilla del Bloque 4·A
 * (ver cabecera): el contenido es utilizable hoy y Franco lo afina sin tocar
 * componentes. Cada `prompt` se arma como líneas unidas por saltos (los `''` son
 * renglones en blanco, para que el bloque pegado se lea aireado en Claude Design).
 */
export const PROMPTS_DISENIO: readonly PromptDisenio[] = [
  {
    id: 'estetica',
    titulo: 'Pulí la estética',
    instruccion:
      'Cuando la demo ya está armada pero se ve floja: apretá paleta, jerarquía y espaciado.',
    prompt: [
      'Subile el nivel de diseño a esta demo sin cambiar el contenido ni las secciones:',
      '',
      '- Limitá la paleta a 2–3 colores tomados de la marca del negocio; sacá los colores sueltos que no aportan.',
      '- Jerarquía clara: un solo título grande por sección, con subtítulos y cuerpo bien diferenciados.',
      '- Espaciados consistentes entre secciones y dentro de cada bloque — nada apretado, nada disperso.',
      '- Alineaciones prolijas y márgenes parejos en toda la página.',
      '',
      'Es solo pulido visual: no agregues secciones nuevas ni reescribas los textos.',
    ].join('\n'),
  },
  {
    id: 'mobile',
    titulo: 'Adaptá a mobile',
    instruccion:
      'Para que se vea impecable en el celular — donde la abre la mayoría de los dueños.',
    prompt: [
      'Revisá y arreglá la versión mobile de esta demo (la mayoría la abre desde el celular):',
      '',
      '- Nada cortado ni desbordado: todo el contenido entra en el ancho de la pantalla.',
      '- Textos legibles sin hacer zoom; títulos que no se parten de forma rara.',
      '- Imágenes que escalan bien, sin estirarse ni deformarse.',
      '- El botón de contacto siempre visible y alcanzable con el pulgar.',
      '',
      'Mantené el mismo contenido y el mismo orden de secciones: es solo el ajuste responsive.',
    ].join('\n'),
  },
  {
    id: 'motion',
    titulo: 'Mejorá el motion y los estados',
    instruccion:
      'Animaciones sutiles y estados de hover/focus que se sientan diseñados, sin marear.',
    prompt: [
      'Sumá motion y estados interactivos sutiles, sin distraer del mensaje:',
      '',
      '- Animaciones de entrada suaves al hacer scroll (fade o slide cortos), nada que maree ni tarde.',
      '- Estados de hover y focus diseñados en botones y links — que se note que responden al mouse y al teclado.',
      '- Transiciones cortas y consistentes; preferí transform y opacity, no animar el layout.',
      '- Respetá «reduce motion»: si el sistema del usuario lo pide, bajá o sacá las animaciones.',
      '',
      'El motion tiene que aclarar el flujo, no decorar: nada de efectos llamativos por agregar.',
    ].join('\n'),
  },
]

// ── Bloque 4·B — puente self-check (HARD_CHECK en rojo) → prompt de diseño ────

/**
 * Mapeo editable HARD_CHECK.id → prompt de esta librería. El puente del Bloque
 * 4·B: por cada hard-block del self-check que se ARREGLA refinando la demo en
 * Claude Design, el self-check muestra —al lado del arreglo humano— su prompt
 * copiable. Self-check es el ÚNICO gate cuyo bloqueo se resuelve mejorando un
 * artefacto (la demo): acá es donde la salida (4.1) y el prompt (4·A) se enganchan.
 *
 * PARCIAL A PROPÓSITO. La mayoría de los hard-blocks NO se arreglan con un prompt
 * de diseño lead-agnóstico, así que NO tienen entrada (sin entrada → el self-check
 * muestra solo el arreglo humano, como antes). Estado de los seis hard-blocks:
 *   - `mobile`        → 'mobile'   ✓ se pule en Claude Design (responsive).
 *   - `carga`         → (ninguno)  se re-publica en Netlify; no es diseño.
 *   - `linksWhatsapp` → (ninguno)  arreglo funcional; candidato a un futuro
 *                       prompt «QA de links/CTA» si Franco lo suma a la librería.
 *   - `sinRelleno`    → (ninguno)  reemplazar el relleno con datos REALES del
 *                       negocio: necesita datos del lead → no es lead-agnóstico.
 *   - `datosReales`   → (ninguno)  ídem: assets reales del negocio.
 *   - `fielAlBrief`   → (ninguno)  ídem: necesita el brief del lead.
 *
 * CRECER LA COBERTURA = sumar una línea acá apuntando a un `PromptDisenioId`
 * existente (un promptId con typo NO compila por la anotación del tipo). Si el
 * prompt todavía no existe, primero se agrega arriba en `PROMPTS_DISENIO`. Las
 * claves se tipan `string` a propósito: los ids de HARD_CHECKS son `string` (no
 * un union literal), y este archivo NO importa `flow-content` para no acoplar la
 * capa de DIRECCIÓN de diseño a la de gates (misma ortogonalidad que con
 * `copy-blocks.ts`). Una clave con typo queda inerte: nunca matchea un check.
 */
export const HARD_CHECK_PROMPT: Readonly<Record<string, PromptDisenioId>> = {
  mobile: 'mobile',
}

/**
 * El prompt de diseño mapeado a un hard-check, o `null` si no hay. Puro y
 * lead-agnóstico: lo usa el self-check para ofrecer, junto al arreglo humano de
 * un check en rojo, el prompt copiable a Claude Design que lo arregla. NO toca
 * el gate `selfCheckAprobado` (sigue mandando en `flow.ts`): es solo el ATAJO de
 * arreglo, una capa de UI por encima del gate intacto.
 */
export function promptParaHardCheck(hardCheckId: string): PromptDisenio | null {
  const promptId: PromptDisenioId | undefined = HARD_CHECK_PROMPT[hardCheckId]
  if (promptId === undefined) return null
  return PROMPTS_DISENIO.find((prompt) => prompt.id === promptId) ?? null
}

// ── Bloque 5.3 — puente fase de Construcción → prompts de diseño (cierra A-10) ─

/**
 * Mapeo editable `FaseId` → prompts de esta librería. El puente del tramo 5.3:
 * cada pantalla de Construcción del manual (M7–M12) renderiza —DENTRO de la fase
 * que lo usa— el prompt prefijado que la resuelve, en vez de listar los tres
 * genéricamente al final del paso (lo que hacía `<PromptsDisenio />` en el wizard;
 * hallazgo A-10 de la auditoría: "el checklist y los prompts viven desconectados
 * dentro del mismo paso"). Solo dos fases se pulen con un prompt lead-agnóstico:
 *   - `calidad` → 'estetica' + 'motion'  (paleta/jerarquía/espaciado + motion/estados).
 *   - `mobile`  → 'mobile'               (responsive).
 * Las otras cuatro (estructura/personalización/assets/cta) NO tienen prompt: o son
 * estructurales, o necesitan datos del negocio (no lead-agnósticas). Sin entrada,
 * la fase muestra solo sus items.
 *
 * MISMO precedente que `HARD_CHECK_PROMPT` (el patrón que la auditoría señala como
 * ya probado en el repo): las claves se tipan `string` a propósito —sin acoplar
 * esta capa de DIRECCIÓN de diseño al enum `FaseId` de `contracts`—; los valores
 * se tipan `PromptDisenioId` (un typo NO compila). Una clave con typo queda inerte:
 * nunca matchea una fase. CRECER LA COBERTURA = editar una línea acá apuntando a
 * `PromptDisenioId` existentes (si el prompt no existe, primero se agrega arriba).
 */
export const FASE_PROMPTS: Readonly<Record<string, readonly PromptDisenioId[]>> = {
  calidad: ['estetica', 'motion'],
  mobile: ['mobile'],
}

/**
 * Los prompts de diseño mapeados a una fase de Construcción, en orden de
 * presentación (`[]` si la fase no tiene). Puro y lead-agnóstico: lo usa la
 * pantalla de la fase (M7–M12) para ofrecer, junto a los items de la fase, el
 * prompt copiable a Claude Design que la resuelve. NO toca el checklist ni ningún
 * gate: es solo la DIRECCIÓN de diseño, servida donde se usa.
 */
export function promptsParaFase(faseId: string): PromptDisenio[] {
  const ids = FASE_PROMPTS[faseId]
  if (ids === undefined) return []
  return ids
    .map((id) => PROMPTS_DISENIO.find((prompt) => prompt.id === id))
    .filter((prompt): prompt is PromptDisenio => prompt !== undefined)
}
