/**
 * LeadOS FG-1.0 — Fuente ÚNICA del CONTENIDO DE GUÍA del flujo del setter.
 *
 * Sin Prisma, sin 'use server': es contenido puro, importable tanto desde
 * server components como desde client components (mismo patrón que
 * `herramientas.ts` / `SHELL_CONSTRUCCION` en `flow.ts`). Cada paso del flujo
 * guarda acá su guía — títulos, encuadre, porqués, etiquetas/hints/ejemplos de
 * cada campo, mensajes de validación y razones de self-check — así Franco
 * corrige una palabra editando SOLO este archivo, sin tocar componentes y sin
 * que la guía diverja cuando se actualice la capacitación.
 *
 * REGLA DE LÍMITE — esto es CONTENIDO, no lógica:
 *   - Acá viven las PALABRAS (qué se le dice al setter).
 *   - El CRITERIO (qué falta en la ficha, qué hard-check bloquea, qué gate
 *     abre) sigue en `flow.ts` / `contracts.ts`. Este módulo nunca decide;
 *     solo provee el copy que envuelve esas decisiones.
 *   - La ESTRUCTURA (qué campos hay, autosave, qué control usar) vive en el
 *     componente. Este módulo no dibuja: aporta el texto que el componente pinta.
 *
 * HERMANO de `herramientas.ts`: aquel registra las herramientas EXTERNAS (qué
 * son / qué esperar / dónde se abren + sus URLs); este registra la guía del
 * PASO. Son dos capas distintas — no se fusionan.
 *
 * CRECIMIENTO: hoy el registro solo tiene la ficha (Paso 1), migrada como
 * primer consumidor de prueba. Los tipos ya cubren lo que consumen los
 * próximos sprints —teach (1.1), ejemplos esto-sí/esto-no (1.2), validación de
 * calidad (1.3) y razones de self-check (FG-4)—; cada uno suma su contenido al
 * registro sin reescribir el esquema. No se listan pasos sin contenido todavía
 * (misma disciplina que la nav del setter: nada de claves vacías).
 *
 * ÚNICO import: el const de valores del enum de `contracts.ts` (dato puro, no
 * lógica) — para que sea el TIPO, no la prosa, el que garantice que las opciones
 * de un selector no se desincronizan del dominio (ver `GUIA_FICHA.igManejadoPor`).
 */
import { IG_MANEJADO_POR_VALUES } from '@/lib/leados/contracts'

// ── Primitivas de copy ───────────────────────────────────────────────────────

/**
 * Un fragmento de una línea de copy: texto plano, o un trozo enfatizado. La
 * primitiva mínima para resaltar UNA palabra clave dentro de una frase sin
 * volver a meter markup en el componente — el resalte es parte del mensaje de
 * enseñanza (ej: «lo que VES, no lo que opinás»), por eso vive con el contenido.
 * Lo reusa el material de teach (1.1).
 */
export type Segmento = string | { enfasis: string }

/** Una línea de copy compuesta por segmentos (texto + fragmentos resaltados). */
export type LineaRica = readonly Segmento[]

/** Opción de un control de selección: el valor del dominio + su copy visible. */
export type CampoOpcion = {
  /** Valor del dominio — casa con el estado del form / el enum del contrato. */
  value: string
  /** Texto visible de la opción. */
  label: string
}

// ── Guía de un campo ─────────────────────────────────────────────────────────

/**
 * Guía de UN campo del paso: su etiqueta, el porqué (hint) y un ejemplo
 * concreto. El componente decide cómo renderizarlo y con qué control; este
 * módulo solo aporta las palabras. La clave del campo en el `Record` ES su id
 * (casa con el estado del formulario).
 */
export type CampoGuia = {
  /** Etiqueta visible del control. */
  label: string
  /** El porqué/cómo en una línea — hoy se muestra como hint del campo. [teach · 1.1] */
  hint: string
  /** Ejemplo concreto (va como placeholder) — el «esto-sí» del campo. [ejemplos · 1.2] */
  ejemplo?: string
  /**
   * Orientación al SALIR del campo si el input quedó flojo: cómo enriquecerlo,
   * con contexto («¿cuántos seguidores? ¿con qué frecuencia postea?»). ADVISORY
   * —solo orienta, no bloquea ni gatea el avance—. El CUÁNDO mostrarlo lo decide
   * `ficha-calidad.ts` (heurística pura); acá viven solo las PALABRAS. [validación de calidad · 1.3]
   */
  mejora?: string
  /** Opciones, si el campo es un selector. */
  opciones?: readonly CampoOpcion[]
}

// ── Capas que consumen los próximos sprints ──────────────────────────────────

/**
 * Par esto-sí / esto-no para ilustrar un criterio. Lo consume la galería de
 * ejemplos (1.2). El esquema queda listo; los pasos lo rellenan cuando 1.2
 * corra (la ficha de hoy ilustra con `CampoGuia.ejemplo`, no con pares).
 */
export type EjemploContrastado = {
  /** Qué ejemplifica (ej: «Reseñas que valen»). */
  tema: string
  /** El «esto sí» — un ejemplo bien hecho. */
  asiSi: string
  /** El «esto no» — el anti-ejemplo a evitar. */
  asiNo: string
  /** Por qué uno sirve y el otro no. */
  porque?: string
}

/**
 * Mensajes de validación de CALIDAD del paso. Lo consume 1.3. El criterio (qué
 * falta) lo calcula la lógica pura (`flow.ts: fichaFaltantes`, y el detalle de
 * cada faltante); acá viven solo los encabezados que envuelven ese cálculo.
 */
export type ValidacionGuia = {
  /** Encabezado del bloque «todavía falta…» (la lista la arma la lógica). */
  pendienteTitulo: string
  /** Mensaje cuando el paso ya alcanzó la señal/calidad mínima. */
  completo: string
}

/**
 * Razón de UN ítem de self-check: por qué importa, en el idioma del setter. Lo
 * consume FG-4 (y el self-check). `checkId` casa con `HARD_CHECKS`/`SOFT_CHECKS`
 * de `flow.ts` (la lista vigente manda; acá solo el porqué, no el ítem).
 */
export type SelfCheckRazon = {
  checkId: string
  razon: string
}

/** Guía del bloque copiable que el paso entrega a una herramienta externa. */
export type CopyBlockGuia = {
  titulo: string
  instruccion: string
}

/** Copy del modo congelado/solo-lectura, para los pasos que lo tienen. */
export type CongeladaGuia = {
  /** Texto del resumen plegable (lo que abre el `<details>`). */
  resumen: string
  /** Mensaje cuando no hay nada guardado para mostrar. */
  vacia: string
}

// ── Guía completa de un paso ─────────────────────────────────────────────────

/**
 * Guía de un paso o superficie del flujo. `titulo` es el mínimo (toda entrada
 * tiene nombre); el resto es opcional — un paso-formulario (ficha) trae `intro`
 * + `campos`, una superficie solo-teach (construcción, objeciones, traspaso)
 * trae `porque` + `ejemplos`. Cada entrada declara solo lo que su pantalla usa.
 * Cero lógica: solo palabras tipadas.
 */
export type PasoGuia = {
  /** Nombre de la entrada (la ficha lo usa de h2; las teach-only, de rótulo). */
  titulo: string
  /** Encuadre del paso — el «qué hacés y por qué». Opcional: las teach-only no lo usan. [teach] */
  intro?: LineaRica
  /** Estimación de tiempo, si el paso la muestra. */
  duracion?: string
  /** El porqué ampliado del paso — material de enseñanza. [teach · 1.1] */
  porque?: readonly LineaRica[]
  /** Guía campo por campo (clave = id del campo en el form). */
  campos?: Readonly<Record<string, CampoGuia>>
  /** Ejemplos contrastados esto-sí / esto-no. [ejemplos · 1.2] */
  ejemplos?: readonly EjemploContrastado[]
  /** Mensajes de validación de calidad. [validación · 1.3] */
  validacion?: ValidacionGuia
  /** Razones de los ítems de self-check. [FG-4] */
  selfCheckRazones?: readonly SelfCheckRazon[]
  /** Guía del bloque copiable que el paso entrega a una herramienta. */
  copyBlock?: CopyBlockGuia
  /** Copy del modo congelado/solo-lectura, si el paso lo tiene. */
  congelada?: CongeladaGuia
}

/**
 * Pasos/acciones del flujo del setter que esta capa cubre. Son superficies
 * REALES, no se inventan: la mayoría mapea a un step-component; `objeciones`
 * (⊂ seguimiento) y `traspaso` (⊂ agenda) son MOMENTOS de enseñanza dentro de
 * un paso, no pasos sueltos — por eso el step más amplio (`seguimiento`,
 * `agenda`) sigue disponible para su propia guía. El registro `GUIA_PASOS` solo
 * trae las claves que YA tienen guía migrada.
 */
export type GuiaPasoId =
  | 'ficha'
  | 'evaluacion'
  | 'brief'
  | 'construccion'
  | 'opener'
  | 'seguimiento'
  | 'draft'
  | 'selfCheck'
  | 'agenda'
  | 'objeciones'
  | 'traspaso'

// ── Contenido: Paso 1 · Ficha de observación (primer consumidor) ─────────────

/**
 * Guía de la ficha de observación (Paso 1). Migrada desde `ficha-step.tsx`
 * como primer consumidor de prueba del esquema. `satisfies PasoGuia` valida la
 * forma pero conserva las claves exactas de `campos` para acceso tipado
 * (`GUIA_FICHA.campos.resenas.hint`). Las claves de `campos` casan 1:1 con el
 * estado del formulario de la ficha; los `value` de las opciones de
 * `igManejadoPor` quedan ATADOS por tipo a `IG_MANEJADO_POR_VALUES` de
 * `contracts.ts` ('' = sin definir todavía) — un typo no compila.
 */
export const GUIA_FICHA = {
  titulo: 'Paso 1 — Ficha de observación',
  intro: [
    'Anotá lo que ',
    { enfasis: 'ves' },
    ', no lo que opinás: el diagnóstico lo hace el Evaluador después. Podés guardar a medias y volver.',
  ],
  duracion: '~10 min. Si te pasaste, ya tenés de sobra.',
  campos: {
    igManejadoPor: {
      label: '¿Quién maneja el Instagram?',
      hint: 'El dueño suele hablar en primera persona y responder él mismo; un CM postea prolijo y genérico. Fijate quién contesta los comentarios.',
      // `satisfies` ata los value al enum del dominio: '' o un IG_MANEJADO_POR_VALUES.
      opciones: [
        { value: '', label: 'Todavía no lo sé' },
        { value: 'DUENO', label: 'El dueño' },
        { value: 'CM', label: 'Un community manager' },
        { value: 'NO_SABE', label: 'No se puede determinar' },
      ] satisfies readonly { value: '' | (typeof IG_MANEJADO_POR_VALUES)[number]; label: string }[],
    },
    identidadNotas: {
      label: 'Identidad — notas',
      hint: 'Nombre del dueño si aparece, hace cuánto existe el negocio, cualquier pista de quién decide.',
      ejemplo: "Ej: la cuenta la firma 'Marce', aparece en las fotos del local…",
      mejora:
        'Podés sumar: ¿quién decide —dueño o encargado—? ¿su nombre si aparece? ¿hace cuánto abrió? Cuanto más concreto, mejor lo lee el Evaluador.',
    },
    presenciaDigital: {
      label: 'Presencia digital',
      hint: 'Qué tienen y qué no: IG, web, Maps, WhatsApp. ¿Última publicación hace cuánto? ¿Responden comentarios y mensajes?',
      ejemplo: 'Ej: IG activo (publican 2-3 veces por semana), sin web, ficha de Maps sin fotos…',
      mejora:
        'Eso queda corto. Bajá lo que se ve: ¿cuántos seguidores? ¿cada cuánto postean? ¿tienen web, Maps, WhatsApp? ¿responden mensajes y comentarios?',
    },
    resenas: {
      label: 'Reseñas crudas',
      hint: 'Copiá textuales las reseñas con queja que se repite — la misma queja 2+ veces vale oro. Las de 5 estrellas vacías no suman.',
      ejemplo:
        'Ej:\n★☆☆☆☆ "Nunca contestan el WhatsApp" (mar 2026)\n★★☆☆☆ "Rico pero tardaron una hora en responder el pedido"',
      mejora:
        'Sumá material: pegá reseñas textuales, sobre todo la queja que se repite (2+ veces vale oro). Las de 5★ vacías no aportan.',
    },
    contenidoReal: {
      label: 'Contenido real (logo / fotos / tono)',
      hint: '¿Las fotos son del negocio real o stock? ¿Hay logo? ¿Qué tono usan: formal, cercano, descuidado?',
      ejemplo: 'Ej: fotos reales del local pero oscuras, logo pixelado, tono cercano…',
      mejora:
        '¿Podés detallar? ¿Las fotos son del negocio real o stock? ¿Hay logo propio? ¿Qué tono usan: formal, cercano, descuidado?',
    },
    senalesOperativas: {
      label: 'Señales operativas',
      hint: 'Horarios, si toman pedidos/reservas y por dónde, demoras que mencionen los clientes, delivery o turnos.',
      ejemplo: 'Ej: toman pedidos solo por DM, horario en la bio desactualizado…',
      mejora:
        'Bajá la operación: ¿toman pedidos o reservas y por dónde? ¿horarios al día? ¿demoras que mencionan los clientes? ¿delivery o turnos?',
    },
    otros: {
      label: 'Otras observaciones',
      hint: 'Todo lo que viste y no entra arriba. Mejor que sobre a que falte.',
    },
  },
  validacion: {
    pendienteTitulo: 'Para habilitar la evaluación todavía falta:',
    completo: '✓ Señal mínima lista — guardá y pasala por el Evaluador.',
  },
  copyBlock: {
    titulo: 'Bloque para el Evaluador',
    instruccion:
      'Se arma con lo último guardado. Copialo, pegalo en el Evaluador y volvé con el resultado al paso 2.',
  },
  congelada: {
    resumen: 'Ver la ficha de observación (congelada: el Evaluador ya la leyó)',
    vacia: 'No hay ficha guardada.',
  },
} satisfies PasoGuia

// ── Contenido: pasos que enseñan el «por qué» (FG-1.2) ───────────────────────

/**
 * Guía teach de las superficies que hoy NO enseñan: el «¿por qué importa?»
 * (porque) + el contraste «esto sí / esto no» (ejemplos). Sin `intro`/`campos`:
 * son momentos de enseñanza, no formularios. Lo consume `TeachPanel`. Clonan la
 * concreción de la ficha; el criterio (gates, listas, fechas) sigue en la
 * lógica — acá solo el porqué y los ejemplos, editables por Franco.
 */
const GUIA_CONSTRUCCION = {
  titulo: 'Construcción de la demo',
  porque: [
    [
      'La demo es la carnada del flujo invertido: si parece una plantilla, el negocio no se reconoce y no responde. Con ',
      { enfasis: 'sus fotos, sus reseñas y su rubro' },
      ', se ve a sí mismo — y ahí engancha.',
    ],
    [
      'No la armás a ciegas: el ',
      { enfasis: 'brief es el plano' },
      ' y la ',
      { enfasis: 'ficha, la materia prima' },
      '. Salirte del brief o meter relleno genérico es lo que la vuelve descartable.',
    ],
  ],
  ejemplos: [
    {
      tema: 'Assets del negocio',
      asiSi: 'El logo real bajado de su Instagram y 3–5 fotos del local en el hero.',
      asiNo: 'Un logo inventado y fotos de stock de un café cualquiera.',
      porque: 'Con stock ve una plantilla; con lo suyo, ve su negocio.',
    },
    {
      tema: 'Fidelidad al brief',
      asiSi: 'Las secciones que pidió el brief, en ese orden, con el CTA de WhatsApp al número real.',
      asiNo: 'Secciones de más «para que se vea completa» y un botón de contacto genérico.',
      porque: 'El brief ya decidió qué convence a ESTE negocio; el ruido lo diluye.',
    },
  ],
} satisfies PasoGuia

const GUIA_SELF_CHECK = {
  titulo: 'Self-check antes de enviar',
  porque: [
    [
      'Es tu ',
      { enfasis: 'último filtro antes de Franco' },
      '. Lo que dejes pasar no desaparece: vuelve como rechazo, y cada rechazo es un round-trip que enfría al negocio que está esperando.',
    ],
    [
      'Los obligatorios son dealbreakers; los del «ojo de diseño» no bloquean, pero Franco los ve igual. ',
      { enfasis: 'Marcarlos honestamente' },
      ' juega a tu favor; ocultarlos solo retrasa.',
    ],
  ],
  ejemplos: [
    {
      tema: 'Probar de verdad',
      asiSi: 'Abrís la URL en tu celular, en incógnito, y tocás el botón de WhatsApp para ver que abra el chat.',
      asiNo: 'La marcás en verde «porque debería andar».',
      porque: 'El obligatorio es «lo verifiqué», no «lo supongo».',
    },
    {
      tema: 'Honestidad en los flags',
      asiSi: 'Ves 4 colores y marcás «más de 3 colores» aunque no bloquee el envío.',
      asiNo: 'Lo dejás sin marcar para que «pase más limpio».',
      porque: 'Franco lo ve en la demo igual; marcarlo muestra criterio.',
    },
  ],
} satisfies PasoGuia

const GUIA_OPENER = {
  titulo: 'El opener (primer contacto)',
  porque: [
    [
      'El opener no vende: ',
      { enfasis: 'abre una conversación' },
      '. Dolor-first —algo real que viste— hace que el dueño sienta que le hablás a él, no que le pegaste un volante.',
    ],
    [
      'Sin link y sin precio a propósito: el link viaja recién con la demo y el precio lo maneja Franco. ',
      { enfasis: 'Meter cualquiera de los dos mata la respuesta' },
      '.',
    ],
  ],
  ejemplos: [
    {
      tema: 'El primer mensaje',
      asiSi: '«Vi que en los comentarios te preguntan el horario y quedan sin respuesta — se nota que perdés consultas ahí.»',
      asiNo: '«Hola! Hacemos páginas web profesionales para negocios, ¿te interesa?»',
      porque: 'El primero nombra un dolor real suyo; el segundo es un folleto que se ignora.',
    },
  ],
} satisfies PasoGuia

const GUIA_OBJECIONES = {
  titulo: 'Objeciones de precio',
  porque: [
    [
      'Vos ',
      { enfasis: 'nunca cotizás ni negociás' },
      ' — no es tu cancha. Toda objeción de precio o condiciones se responde con una sola jugada: ',
      { enfasis: 'agendar la reunión' },
      '.',
    ],
    [
      'Discutir el precio por DM es perder: o regalás un número que no controlás, o entrás en una negociación que no te toca. Deflectar a la reunión mantiene el objetivo intacto.',
    ],
  ],
  ejemplos: [
    {
      tema: '«¿Cuánto sale?»',
      asiSi: '«De los números se encarga el equipo en una reunión cortita — ¿te queda mejor mañana o pasado?»',
      asiNo: '«Arranca en $X, pero depende de lo que necesites…»',
      porque: 'El primero protege el precio y empuja a la reunión; el segundo te mete a negociar solo.',
    },
  ],
} satisfies PasoGuia

const GUIA_TRASPASO = {
  titulo: 'Traspaso a la reunión',
  porque: [
    [
      'La reunión es el handoff: Franco entra a cerrar con lo que ',
      { enfasis: 'vos le dejaste' },
      '. Sin notas entra a ciegas y la reunión se quema; con buenas notas entra sabiendo qué duele y cómo hablarle.',
    ],
    [
      'Antes de ofrecer horarios, confirmá que hablás con ',
      { enfasis: 'quien decide' },
      '. Agendar con alguien que no decide quema un turno de la agenda de Franco.',
    ],
  ],
  ejemplos: [
    {
      tema: 'Notas de traspaso',
      asiSi: '«Dueña, Marce. Le duele perder pedidos por no contestar a tiempo. Quiere algo simple. Tono cercano, tuteala. No le hables de SEO: la asusta.»',
      asiNo: '«Quiere una web.»',
      porque: 'La primera deja a Franco listo para cerrar; la segunda lo obliga a empezar de cero.',
    },
  ],
} satisfies PasoGuia

// ── Contenido: ejemplos del ESTADO IDEAL (para las pantallas vacías) ─────────

/*
 * Una pantalla en blanco no enseña: el setter no tiene un «así se ve bien» para
 * comparar lo suyo. Estos ejemplos llenan ese hueco. NO son placeholders —son
 * contenido representativo de verdad, una ficha buena y un self-check bueno—.
 * Los consume `EjemploIdeal` en el empty/inicio del paso. Hermanos de los
 * `ejemplos` esto-sí/esto-no (que enseñan UN criterio): estos muestran el
 * ARTEFACTO entero terminado para contrastar contra el propio.
 */

/**
 * Ficha modelo: el valor que un buen setter dejó en cada campo. Las claves
 * casan 1:1 con `GUIA_FICHA.campos` —el tipo obliga a cubrirlos todos y el
 * componente reusa SUS labels, no se duplican acá—. `igManejadoPor` guarda el
 * value del enum; el componente resuelve su label desde las opciones.
 */
export type FichaEjemplar = {
  /** Rótulo del caso: de qué negocio es la ficha, para dar contexto. */
  titulo: string
  /** Qué hace buena a esta ficha, en una línea. */
  porque: string
  /** Valor modelo por campo (clave = id de campo de `GUIA_FICHA.campos`). */
  campos: Readonly<Record<keyof typeof GUIA_FICHA.campos, string>>
}

export const GUIA_FICHA_EJEMPLAR = {
  titulo: 'Café de barrio · Instagram activo, pero pierde consultas',
  porque:
    'Anota lo que se VE, no opiniones: datos concretos de cada red, reseñas textuales con la queja que se repite y señales operativas. Con esto el Evaluador decide sin tener que adivinar.',
  campos: {
    igManejadoPor: 'DUENO',
    identidadNotas:
      "La cuenta la firma 'Marce', la dueña: aparece atendiendo en varias fotos y responde los comentarios en primera persona. El café abrió en 2019 (lo dice un posteo de aniversario). Decide ella.",
    presenciaDigital:
      'IG activo, publican 3-4 veces por semana. No tienen web. Ficha de Google Maps creada pero sin fotos ni horario cargado. WhatsApp en la bio. Tardan en los DM: hay comentarios pidiendo precio sin respuesta hace días.',
    resenas:
      '★★☆☆☆ "Riquísimo, pero tardaron 40 min en contestar el pedido por Instagram" (abr 2026)\n★☆☆☆☆ "Escribí tres veces al WhatsApp y nunca me respondieron" (mar 2026)\nLa misma queja —no contestan a tiempo— se repite en 4 reseñas distintas.',
    contenidoReal:
      'Fotos reales del local y de los platos, con buena luz natural. Logo propio, simple (no es stock). Tono cercano, tutean, usan emojis. Las historias destacadas están sin portada y desordenadas.',
    senalesOperativas:
      'Toman pedidos solo por DM y WhatsApp, no hay carta online. Horario de la bio desactualizado (dice 19h; en un posteo reciente avisan que ahora cierran 21h). Hacen delivery por la zona pero no lo aclaran en ningún lado fijo.',
    otros:
      'Tienen una segunda sucursal que casi no aparece en el IG; en los comentarios preguntan seguido "¿la de Centro sigue abierta?" y queda sin respuesta.',
  },
} satisfies FichaEjemplar

/**
 * Self-check modelo: cómo queda uno bien hecho. NO re-lista el checklist (ese
 * vive en `flow.ts: HARD_CHECKS/SOFT_CHECKS` y el step ya lo dibuja); modela la
 * FORMA del artefacto terminado y el criterio —verificar de verdad, marcar los
 * flags con honestidad— para comparar contra el propio.
 */
export type SelfCheckEjemplar = {
  titulo: string
  porque: string
  /** Líneas del ejemplo terminado: qué hizo un buen setter, no el ítem suelto. */
  lineas: readonly string[]
}

export const GUIA_SELF_CHECK_EJEMPLAR = {
  titulo: 'Un self-check terminado, como lo deja un buen setter',
  porque:
    'No es marcar todo en verde: es verificar cada obligatorio en la demo publicada y marcar los flags de diseño que viste, aunque no bloqueen.',
  lineas: [
    'Los 6 obligatorios en verde, pero cada uno comprobado en serio: abrió la demo en el celular, en incógnito, y tocó el botón de WhatsApp para ver que abriera el chat al número real.',
    'Dejó 2 flags de diseño marcados igual —«más de 3 colores» y «la fuente parece la default»—: no frenan el envío, pero viajan a Franco y muestran que miró con criterio.',
    'Un sheet impecable, sin un solo flag y hecho en treinta segundos, suele ser la señal de que NO se miró en serio. Un buen self-check casi siempre deja algún flag.',
  ],
} satisfies SelfCheckEjemplar

/**
 * Registro de la guía por paso. Solo trae las claves YA migradas. Los próximos
 * sprints suman su `GUIA_*` acá. `Partial` es deliberado: declara honestamente
 * qué pasos tienen guía y cuáles no, sin claves vacías.
 */
export const GUIA_PASOS: Partial<Record<GuiaPasoId, PasoGuia>> = {
  ficha: GUIA_FICHA,
  construccion: GUIA_CONSTRUCCION,
  selfCheck: GUIA_SELF_CHECK,
  opener: GUIA_OPENER,
  objeciones: GUIA_OBJECIONES,
  traspaso: GUIA_TRASPASO,
}
