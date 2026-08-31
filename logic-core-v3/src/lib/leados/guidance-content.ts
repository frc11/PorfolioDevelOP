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
 * CRECIMIENTO: hoy el registro solo tiene la ficha (m1), migrada como
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
// El TIPO de la causa de espera (`turno.ts` es el único lugar donde se decide):
// así el registro de palabras de abajo no puede quedarse corto cuando aparezca
// una causa nueva. Y UNA cadena: el fragmento del link permanente, que la
// tarjeta de cartera también muestra (ver `FALTA_LINK_PERMANENTE`) — vive en el
// módulo hoja porque `flow.ts` no puede importar este archivo bajo ts-node.
import { FALTA_LINK_PERMANENTE, type CausaEspera } from '@/lib/leados/turno'

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
  /**
   * El MISMO campo cuando la herramienta externa que produce su contenido no
   * tiene link cargado: ahí el campo deja de ser obligatorio y el hint tiene que
   * decir por qué y qué hacer. Quién decide cuál de los dos se muestra es
   * `herramientaSinLink()` (`herramientas.ts`), la misma lectura de la que sale
   * la píldora «Link pendiente»; acá viven solo las PALABRAS.
   */
  hintSinHerramienta?: string
  /**
   * Cómo se NOMBRA este dato cuando falta por esa razón, para quien lo lee río
   * abajo (la revisión de Franco, el resumen del setter, el bloque que se pega
   * en la herramienta siguiente). Sin esto, el dato ausente se lee igual que uno
   * que nadie quiso completar.
   */
  faltante?: string
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

/**
 * Un criterio que mira una herramienta de evaluación externa, en el idioma del
 * setter: qué es y por qué pesa en el score. Lo consume m2 (la evaluación)
 * para mostrar «qué mira el Evaluador» sin hardcodear la lista en el componente.
 * El criterio REAL lo aplica el Evaluador externo; acá solo lo explicamos. [evaluación · 3.2]
 */
export type CriterioGuia = {
  /** Nombre del criterio (ej: «Dolor»). */
  nombre: string
  /** Por qué ese criterio mueve el score, en una línea. */
  porQue: string
}

/**
 * Explicación, en el idioma del setter, del GATE de un paso: por qué pasa lo que
 * pasa (un bloqueo, un descarte automático) y cuándo se levanta. NO es el gate
 * —el criterio vive en `flow.ts`/schemas y sigue mandando—: son las PALABRAS que
 * lo vuelven entendible en vez de un botón deshabilitado mudo. El componente
 * elige el TONO (rosa si bloquea, zinc si es un desenlace neutro). [3.2]
 */
export type GateGuia = {
  /** Encabezado: qué está pasando (ej: «El link NO va en el opener»). */
  titulo: string
  /** El porqué + el cuándo, en lenguaje claro (con énfasis donde pega). */
  detalle: LineaRica
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

/**
 * Encabezado de un GRUPO de campos dentro de un paso. [P5-A]
 *
 * Existe para que un bloque de campos no quede suelto entre los demás: el
 * setter tiene que ver de un vistazo que lo de abajo es una cosa sola y para
 * qué se la piden. Como el resto del módulo, solo palabras — qué campos entran
 * en el grupo lo decide el componente.
 */
export type GrupoGuia = {
  /** Título visible del grupo. */
  titulo: string
  /** Una línea de encuadre: para qué sirve lo que se pide adentro. */
  intro: string
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
  /** Instructivo ordenado (how-to mecánico, ej. publicar el draft). El componente lo dibuja como `<ol>`. [3.4] */
  pasos?: readonly string[]
  /**
   * Explicación del RITMO de la cadencia de toques — las PALABRAS, no el cálculo.
   * El cómputo de fechas (+2/+2/+3 y el corte) vive en `follow-up.ts` y manda; acá
   * solo se hace legible para el setter. Lo pinta el seguimiento como pie del
   * recuadro de cadencia. [3.6]
   */
  cadencia?: LineaRica
  /** Estimación de tiempo, si el paso la muestra. */
  duracion?: string
  /** El porqué ampliado del paso — material de enseñanza. [teach · 1.1] */
  porque?: readonly LineaRica[]
  /** Guía campo por campo (clave = id del campo en el form). */
  campos?: Readonly<Record<string, CampoGuia>>
  /** Grupos de campos con título propio dentro del paso (clave = id del grupo). [P5-A] */
  grupos?: Readonly<Record<string, GrupoGuia>>
  /** Ejemplos contrastados esto-sí / esto-no. [ejemplos · 1.2] */
  ejemplos?: readonly EjemploContrastado[]
  /** Criterios que mira un evaluador externo (qué mira y por qué). [evaluación · 3.2] */
  criterios?: readonly CriterioGuia[]
  /** Explicación, en idioma del setter, del gate del paso (no un disabled mudo). [3.2] */
  gate?: GateGuia
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

// ── Contenido: m1 · Ficha de observación (primer consumidor) ────────────────

/**
 * Guía de la ficha de observación (m1). Migrada desde `ficha-step.tsx`
 * como primer consumidor de prueba del esquema. `satisfies PasoGuia` valida la
 * forma pero conserva las claves exactas de `campos` para acceso tipado
 * (`GUIA_FICHA.campos.resenas.hint`). Las claves de `campos` casan 1:1 con el
 * estado del formulario de la ficha; los `value` de las opciones de
 * `igManejadoPor` quedan ATADOS por tipo a `IG_MANEJADO_POR_VALUES` de
 * `contracts.ts` ('' = sin definir todavía) — un typo no compila.
 */
export const GUIA_FICHA = {
  titulo: 'Ficha de observación',
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
    // ── P5-A · Material para construir la demo (grupo `materiales`) ─────────
    resenasUrl: {
      label: '¿Dónde se leen las reseñas?',
      hint: 'Pegá la dirección de la ficha de Google, o de donde estén. Sirve para volver a mirarlas mientras armás la demo.',
      ejemplo: 'Ej: https://maps.app.goo.gl/…',
    },
    imagenesUrl: {
      label: '¿De dónde bajás el logo y las fotos?',
      hint: 'La dirección donde están las imágenes reales: una carpeta de Drive, la web vieja, el perfil con las mejores fotos.',
      ejemplo: 'Ej: https://drive.google.com/…',
    },
    otraRedUrl: {
      label: '¿Está en otra red?',
      hint: 'Además del Instagram que cargaste en el alta: Facebook, TikTok, lo que tenga.',
      ejemplo: 'Ej: https://facebook.com/…',
    },
    queVende: {
      label: '¿Qué vende y a qué precio?',
      hint: 'Sus productos o servicios principales. Si los precios están publicados, copialos tal cual; si no están, dejalo así — no los inventes.',
      ejemplo: 'Ej: milanesa napolitana $8.500 · pizza grande $9.200 · envío $1.200…',
    },
    comoSePresenta: {
      label: '¿Cómo habla el negocio de sí mismo?',
      hint: 'Copiá su bio, su eslogan o el «quiénes somos». Con eso la demo suena a ellos y no a plantilla.',
      ejemplo: 'Ej: bio de IG: «Cocina de barrio desde 1998. Pedidos por WhatsApp»…',
    },
    otros: {
      label: 'Otras observaciones',
      hint: 'Todo lo que viste y no entra arriba. Mejor que sobre a que falte.',
    },
  },
  grupos: {
    materiales: {
      titulo: 'Material para construir la demo',
      intro:
        'Esto viaja al bloque que pegás en la herramienta cuando construís. Todo es opcional: lo que no consigas, dejalo vacío — nada se inventa por vos.',
    },
  },
  validacion: {
    pendienteTitulo:
      'El Evaluador no puede juzgar a ciegas: necesita esta señal mínima para puntuar. Todavía falta:',
    completo: '✓ Señal mínima lista — guardá y pasala por el Evaluador.',
  },
  copyBlock: {
    titulo: 'Bloque para el Evaluador',
    instruccion:
      'Se arma con lo último guardado. Copialo, pegalo en el Evaluador y volvé con el resultado a Evaluación.',
  },
  congelada: {
    resumen: 'Ver la ficha de observación (congelada: el Evaluador ya la leyó)',
    vacia: 'No hay ficha guardada.',
  },
} satisfies PasoGuia

// ── Contenido: m2 · Evaluación (transcribir el veredicto del Evaluador) ─────

/**
 * Guía de la evaluación (m2). El setter NO juzga: pega la ficha en el
 * Evaluador externo y transcribe acá lo que devolvió (score, veredicto,
 * razonamiento). `campos` son los del formulario (score/veredicto/razonamiento);
 * `criterios` explica qué mira el Evaluador; `gate` explica el descarte
 * automático de score 1–2 (el criterio sigue en `dossier.actions.ts`, acá solo
 * el porqué). `porque`/`ejemplos` enseñan la disciplina de transcribir fiel.
 */
export const GUIA_EVALUACION = {
  titulo: 'Evaluación',
  intro: [
    'No juzgás vos: pegás la ficha en el Evaluador (el bloque de esta pantalla), esperás su respuesta y la ',
    { enfasis: 'transcribís acá tal cual' },
    ' — score, veredicto y razonamiento. No hace falta interpretarla.',
  ],
  criterios: [
    { nombre: 'Rubro', porQue: 'hay rubros donde una demo web convierte mucho más que otros' },
    { nombre: 'Dolor', porQue: 'una queja que se repite es un problema que el negocio ya siente' },
    { nombre: 'Decisor', porQue: 'si el IG lo maneja el dueño, hablás directo con quien firma' },
    { nombre: 'Actividad', porQue: 'un negocio que publica seguido también responde mensajes' },
    { nombre: 'Intención', porQue: 'señales de que ya intentaron mejorar su presencia digital' },
  ],
  campos: {
    score: {
      label: 'Score',
      hint: 'El número que dio el Evaluador. 1–2 descarta, 3 avanza, 4–5 sugiere avanzar con prioridad.',
    },
    veredicto: {
      label: 'Veredicto',
      hint: 'El que eligió el Evaluador: Descartar, Avanzar o Avanzar con prioridad. Copialo, no lo cambies.',
    },
    razonamiento: {
      label: 'Razonamiento',
      hint: 'Pegá el razonamiento completo del Evaluador, sin resumirlo.',
    },
  },
  gate: {
    titulo: 'Score 1–2 = descarte automático',
    detalle: [
      'No lo elegís vos y no es un fracaso: ',
      { enfasis: 'filtrar rápido un lead flojo es exactamente el laburo' },
      '. Te ahorrás horas de demo para un negocio que no iba a cerrar. Al confirmar te pedimos el motivo en una línea.',
    ],
  },
  porque: [
    [
      'El que juzga es el Evaluador, no vos: tu trabajo es ',
      { enfasis: 'transcribir fiel' },
      ', no suavizar ni inflar el número para salvar un lead que te cayó simpático. Un score editado ensucia toda la cola que viene después.',
    ],
    [
      'El score marca el camino: ',
      { enfasis: '1–2 descarta, 3 avanza, 4–5 sugiere avanzar con prioridad' },
      ' (y deja construir la demo sin esperar respuesta). La mayoría son 3 —fríos— y eso está bien: es el caso normal.',
    ],
  ],
  ejemplos: [
    {
      tema: 'Transcribir el veredicto',
      asiSi: 'El Evaluador dio 2 → cargás 2 y descartás, aunque el lugar te guste.',
      asiNo: 'Lo subís a 3 «para darle una chance» porque te cayó bien el negocio.',
      porque: 'El score es del Evaluador; pisarlo mete leads flojos a la cola y te quema el tiempo.',
    },
  ],
} satisfies PasoGuia

// ── Contenido: decidir cómo va a ser la demo (el plano, antes de construirla) ─

/**
 * Guía de la pantalla que decide la demo (m6). El setter NO la inventa: corre el
 * Gem de diseño (que lee la ficha + la evaluación), trae su respuesta y la ordena
 * en secciones concretas. `campos` son los del formulario (las claves casan 1:1
 * con los campos que se PIDEN: pegadoGem/titulo/cta/seccionesTexto/concepto —
 * P5-B sacó `notasMarca` de la pregunta porque la ficha ya junta ese material;
 * el valor guardado igual viaja en el payload, ver `brief-form.tsx`). `gate`
 * explica el estado «esperando respuesta» cuando el gate EVALUADA→BRIEF está
 * cerrado —el criterio sigue en `flow.ts: gateBriefAbierto`, acá solo el porqué
 * + el qué-hacer-mientras; el TONO lo elige el componente (zinc: es una espera,
 * no un bloqueo)—. `porque`/`ejemplos` enseñan que el brief es el plano y por
 * qué las secciones concretas convierten.
 */
export const GUIA_BRIEF = {
  titulo: 'Brief de diseño',
  intro: [
    'Copiá el bloque de abajo, pegalo en el ',
    { enfasis: 'Gem de diseño' },
    ' y traé su respuesta acá. El brief es el ',
    { enfasis: 'plano de la demo' },
    ': cuanto más concreto, mejor sale.',
  ],
  campos: {
    pegadoGem: {
      label: 'Respuesta del Gem (pegado completo)',
      hint: 'Pegala entera, sin editar. Los campos de abajo son el resumen estructurado.',
      /**
       * El MISMO campo cuando el Gem de diseño todavía no tiene link cargado:
       * ahí el campo deja de ser obligatorio, porque pedir que se transcriba la
       * salida de algo que no se puede abrir solo se obedece inventándola.
       * `herramientaSinLink('gemDiseno')` decide cuál de los dos hints se ve —
       * el mismo dato del que sale la píldora «Link pendiente» de arriba.
       */
      hintSinHerramienta:
        'Todavía no lo podés traer: el Gem de diseño no tiene link cargado (pedíselo a Franco). Guardá el brief con las secciones que armes vos, y cuando tengas el link volvé y pegalo acá.',
      /**
       * Lo que ve quien LEE el brief después —Franco en la revisión, el setter
       * al volver, y Claude Design en el bloque de construcción— cuando el
       * pegado no está porque la herramienta no se pudo abrir. Una sola frase
       * para las tres superficies: el dato faltante se nombra igual en todas.
       */
      faltante:
        'Sin la respuesta del Gem de diseño: cuando se guardó este brief la herramienta todavía no tenía link cargado.',
    },
    titulo: {
      label: 'Título del brief',
      hint: 'El nombre del negocio sirve — es cómo vas a reconocer esta demo después.',
    },
    cta: {
      label: 'Llamado a la acción (CTA)',
      hint: 'Lo que el visitante tiene que hacer. Ej: «Pedí tu turno por WhatsApp».',
    },
    seccionesTexto: {
      label: 'Secciones de la demo',
      hint: 'Una por línea, en orden. Ej: Hero / Menú / Reseñas / Cómo pedir / Contacto.',
    },
    concepto: {
      label: 'Concepto',
      hint: 'La idea central que propone el Gem, en una o dos líneas.',
    },
  },
  gate: {
    titulo: 'Esperando la respuesta del primer contacto',
    detalle: [
      'El lead avanza, pero el brief se abre cuando ',
      { enfasis: 'el negocio responde el primer contacto' },
      ' —o si Franco le da prioridad—. Mientras tanto, mandá el opener y registrá la conversación en «Registrá lo que pasó»: apenas responda, este paso se abre solo.',
    ],
  },
  porque: [
    [
      'El brief es el ',
      { enfasis: 'plano de la demo' },
      ': quien la construye trabaja con esto, no con la ficha cruda. Un brief flojo o genérico produce una demo floja.',
    ],
    [
      'No lo inventás vos: sale del ',
      { enfasis: 'Gem de diseño' },
      ', que lee la ficha y la evaluación. Tu trabajo es traer su respuesta fiel y ordenarla en secciones concretas —las de ESTE negocio, no las de cualquiera—.',
    ],
  ],
  ejemplos: [
    {
      tema: 'Las secciones de la demo',
      asiSi: 'Hero con el nombre real / Menú con sus platos / Reseñas reales / Cómo pedir por WhatsApp / Contacto.',
      asiNo: 'Inicio / Nosotros / Servicios / Galería / Contacto —las mismas de cualquier plantilla—.',
      porque: 'Las secciones concretas hacen que el dueño se vea a sí mismo; las genéricas dicen «plantilla» y se ignoran.',
    },
  ],
} satisfies PasoGuia

// ── Contenido: pasos que enseñan el «por qué» (FG-1.2) ───────────────────────

/**
 * Guía teach de las superficies que hoy NO enseñan: el «¿por qué importa?»
 * (porque) + el contraste «esto sí / esto no» (ejemplos). Sin `intro`/`campos`:
 * son momentos de enseñanza, no formularios. Lo consume `TeachPanel`. Clonan la
 * concreción de la ficha; el criterio (gates, listas, fechas) sigue en la
 * lógica — acá solo el porqué y los ejemplos, editables por Franco.
 */
export const GUIA_CONSTRUCCION = {
  // Sin numerar: el rail nombra la fase y el h2 de la pantalla lo refleja sin
  // hardcodearlo en el componente (3.7, single-source).
  titulo: 'Construcción de la demo',
  intro: [
    'La demo se construye en ',
    { enfasis: 'Claude Design' },
    ' (herramienta externa): el panel te guía fase por fase, no la arma por vos. Al arrancar, el dossier pasa a «Construcción» y se abren el borrador y el chequeo final.',
  ],
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

export const GUIA_SELF_CHECK = {
  titulo: 'Chequeo final antes de enviar',
  intro: [
    'Revisá la demo publicada punto por punto. Están partidos en dos: los que ',
    { enfasis: 'decidís vos solo' },
    ' y los que al final mira Franco —esos también los marcás vos, con lo que ves—. Todos bloquean el envío mientras queden en rojo. Los delatores de diseño no bloquean, pero viajan a Franco tal como los marques.',
  ],
  gate: {
    titulo: 'El envío se habilita con todos los obligatorios en verde',
    detalle: [
      'No es un trámite: es tu ',
      { enfasis: 'último filtro antes de Franco' },
      '. Marcá cada obligatorio solo cuando lo verificaste en la demo publicada — un check falso vuelve como rechazo y enfría al negocio que espera.',
    ],
  },
  porque: [
    [
      'Es tu ',
      { enfasis: 'último filtro antes de Franco' },
      '. Lo que dejes pasar no desaparece: vuelve como rechazo, y cada rechazo es un ida y vuelta que enfría al negocio que está esperando.',
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

// ── Contenido: m13 · Publicar el borrador (instructivo mecánico) ────────────

/**
 * Guía del borrador (m13). Instructivo mecánico: exportar de Claude Design,
 * publicar en Netlify Drop y traer la URL. `pasos` son las instrucciones
 * ordenadas (el componente las dibuja como `<ol>`); `campos.draftUrl` la
 * etiqueta/hint del input. Sin teach (porque/ejemplos): es mecánico, el porqué
 * va en el `intro` (publicás para que Franco revise, no para el negocio).
 */
export const GUIA_DRAFT = {
  titulo: 'Publicar el borrador',
  intro: [
    'Publicás un borrador para que ',
    { enfasis: 'Franco lo revise' },
    '. Publicar acá NO es enviárselo al negocio: la versión permanente la publica Franco cuando aprueba.',
  ],
  pasos: [
    'En Claude Design: Export → HTML standalone (o el .zip si lo ofrece).',
    'Asegurate de que el archivo se llame index.html (si bajó un .zip, que lo tenga adentro).',
    'Abrí Netlify Drop (el botón de acá arriba) y arrastrá el archivo (o la carpeta) ahí.',
    'Copiá la URL que te da Netlify y pegala acá abajo.',
  ],
  campos: {
    draftUrl: {
      label: 'URL del borrador',
      hint: 'La que te dio Netlify Drop, completa y con https://',
    },
  },
} satisfies PasoGuia

/**
 * Los mismos pasos, para m13 con el borrador CONGELADO por un rechazo. El último
 * de `GUIA_DRAFT.pasos` dice «pegala acá abajo», y en RECHAZADA abajo no hay
 * campo: el motor guarda el link SOLO en CONSTRUCCION (`saveOwnedDraftUrl`), así
 * que esa pantalla muestra el borrador congelado y el botón de reabrir. La
 * munición prometía un campo que no existe — el mismo callejón que P3 cerró en
 * el registro, un piso más arriba.
 *
 * Los tres pasos previos se DERIVAN de la lista viva, no se copian: si Franco
 * edita el instructivo, esta variante lo sigue sola. Solo cambia el destino de
 * la URL, que es lo único que el estado congelado desmiente.
 */
export const GUIA_DRAFT_PASOS_CONGELADO: readonly string[] = [
  ...GUIA_DRAFT.pasos.slice(0, -1),
  'Copiá la URL que te da Netlify — el campo para pegarla se abre cuando reabrís la construcción.',
]

export const GUIA_OPENER = {
  titulo: 'El opener (primer contacto)',
  intro: [
    'Solo texto, ',
    { enfasis: 'dolor-first' },
    ', corto. Nada de precio y nada de link — el link viaja recién con la demo, cuando respondan. Lo mandás VOS desde Instagram (copiar y pegar) y acá lo registrás.',
  ],
  gate: {
    titulo: 'El link NO va en el opener — sacalo',
    detalle: [
      'El opener ',
      { enfasis: 'abre una conversación, no vende' },
      ': un link en el primer mensaje se lee como publicidad y el dueño lo ignora (o Instagram lo manda a spam). El link viaja recién en el ',
      { enfasis: 'segundo mensaje, con la demo ya aprobada' },
      ' — eso lo registrás en «Envío», cuando el negocio respondió.',
    ],
  },
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

// ── Contenido: m5 · Seguimiento de la conversación ──────────────────────────

/**
 * Guía del seguimiento (la conversación después del opener). El setter registra
 * cada toque y la maquinaria mueve estado + cadencia —él nunca calcula fechas—.
 * `intro` encuadra el paso; `cadencia` explica el ritmo +2/+2/+3-stop (el cálculo
 * vive en `follow-up.ts`, acá solo las palabras); `porque`/`ejemplos` enseñan qué
 * hacer cuando el negocio responde y cuando no. El envío del link (momento bisagra)
 * tiene su propia guía en `GUIA_ENVIO`; las objeciones, en `GUIA_OBJECIONES`.
 */
export const GUIA_SEGUIMIENTO = {
  titulo: 'Seguimiento y envío de la demo',
  intro: [
    'Después del opener, registrás acá ',
    { enfasis: 'cada toque de la conversación' },
    '. La maquinaria mueve el estado y la cadencia sola — vos no calculás la próxima fecha, solo marcás lo que pasó.',
  ],
  cadencia: [
    'Tres toques y para: el primero a los ',
    { enfasis: '2 días' },
    ', el segundo otros 2, el tercero a los 3. Si tras los tres no contesta, ',
    { enfasis: 'el lead se enfría' },
    ' — sin más insistencia.',
  ],
  porque: [
    [
      'Si el negocio ',
      { enfasis: 'responde' },
      ', cambia el rumbo: marcás «Respondió», se frenan los toques y podés arrancar la demo. De ahí en más el objetivo es uno solo: la reunión.',
    ],
    [
      'Si ',
      { enfasis: 'no responde' },
      ', registrás el toque y listo: la cadencia agenda el próximo sola. No lo persigas a diario ni le adelantes el link para «tentarlo» — eso quema el lead.',
    ],
  ],
  ejemplos: [
    {
      tema: 'Cuando responde',
      asiSi: 'Contesta «contame más» → marcás «Respondió», se abre el brief y enfocás en cerrar la reunión.',
      asiNo: 'Seguís mandando toques genéricos como si no hubiera contestado.',
      porque: 'Marcar «Respondió» frena la cadencia y abre la demo; ignorarlo te deja insistiendo de más.',
    },
    {
      tema: 'Cuando no responde',
      asiSi: 'Registrás «No respondió» y dejás que la cadencia agende el toque a los 2 días.',
      asiNo: 'Le escribís todos los días o le adelantás el link para apurar.',
      porque: 'Tres toques espaciados respetan al negocio; el acoso (o el link suelto) lo espanta.',
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

// ── Contenido: m16 · Agendar la reunión ─────────────────────────────────────

/**
 * Guía de la agenda (m16). `intro` encuadra el momento; `pasos` es el how-to
 * mecánico (confirmar decisor → buscar horarios → ofrecer → marcar el elegido →
 * confirmar con notas); `gate` explica por qué el paso espera hasta RESPONDIO —el
 * criterio sigue en `agenda.actions.ts: gateAgenda` y manda—. La enseñanza del
 * traspaso (por qué las notas, hablar con quien decide) vive en `GUIA_TRASPASO`.
 */
export const GUIA_AGENDA = {
  titulo: 'Agendar la reunión',
  intro: [
    'Cuando la charla llega a ',
    { enfasis: '«sí, reunámonos»' },
    ', ofrecés 3 horarios reales de la agenda de Franco y confirmás el booking. La confirmación y el recordatorio al prospecto los manda Cal.com solo.',
  ],
  pasos: [
    'Confirmá que hablás con quien decide (el dueño): agendar con alguien que no decide quema un turno de Franco.',
    'Tocá «Buscar horarios libres de Franco» — trae 3 horarios reales de su agenda.',
    'Pasale los 3 al prospecto (el bloque ya los arma) y esperá que elija uno.',
    'Marcá el horario elegido, completá nombre, email y las notas de traspaso, y confirmá.',
  ],
  gate: {
    titulo: 'Se agenda cuando el negocio respondió y acepta reunirse',
    detalle: [
      'Esto no se abre solo: el paso se abre cuando ',
      { enfasis: 'marcás «Respondió» en «Registrá lo que pasó»' },
      ' y en la charla el negocio acepta la reunión. Hasta entonces espera — agendar antes sería ofrecer un turno que nadie pidió.',
    ],
  },
} satisfies PasoGuia

// ── Contenido: tras la construcción · En revisión + envío del link ───────────

/**
 * Las dos notas «lo que sigue» del pie del wizard para los stages donde el setter
 * mayormente ESPERA: EN_REVISION (la pelota la tiene Franco) y APROBADA (el envío
 * vive en «Seguimiento»). La DIRECCIÓN la pone el cartel de arriba (`describirFoco`,
 * 3.1); esto es el pie que dice dónde se entera y a dónde ir — espeja ese cartel,
 * no lo contradice. [3.5]
 */
export const GUIA_REVISION = {
  enRevision: [
    'La demo está en ',
    { enfasis: 'revisión de Franco' },
    '. Cuando la apruebe o pida correcciones, lo ves acá y en tu cartera.',
  ],
  aprobada: [
    'Demo ',
    { enfasis: 'aprobada' },
    ' 🎉 — el envío del link vive en «Envío»: el panel arma el mensaje cuando el flujo lo habilita.',
  ],
} satisfies Record<'enRevision' | 'aprobada', LineaRica>

/**
 * El envío del link (APROBADA): el momento BISAGRA del flujo invertido — el link
 * de la demo SALE acá y solo acá, nunca en el opener ni antes de que Franco la
 * apruebe. El gate (`gateEnvioDemo`, flow.ts — LÍNEA ROJA, no vive acá) pide DOS
 * condiciones independientes: que Franco apruebe (APROBADA + finalUrl) Y que el
 * negocio enganche (respondió o es caliente). Como son dos, el «todavía no»
 * depende de cuál falta — de ahí los tres mensajes de `espera`. Cero lógica: el
 * componente deriva CUÁL mostrar; acá viven solo las palabras (editables por Franco).
 */
export type EnvioGuia = {
  /** Rótulo del momento. */
  titulo: string
  /** El encuadre de la disciplina: el link sale acá y solo acá. */
  intro: LineaRica
  /** Header cuando el gate ABRE (aprobada + enganche + url): «momento de enviar». */
  listo: string
  /** Camino preventivo (lead caliente): el link puede salir antes de que responda. */
  preventivo: LineaRica
  /** El bloque copiable del segundo mensaje (la demo con su link). */
  copyBlock: CopyBlockGuia
  /** Confirmación tras registrar el envío: el foco pasa a la reunión. */
  enviada: LineaRica
  /**
   * El «todavía no», según qué falta. Son CUATRO, no tres: `gateEnvioDemo` pide
   * aprobación + `finalUrl` + enganche, y la aprobación y el link son dos cosas
   * distintas que Franco hace en momentos distintos. Sin el cuarto, la pantalla
   * mandaba a esperar al negocio cuando el negocio ya había contestado y lo que
   * faltaba era el link de Franco (H-02 del manual).
   */
  espera: {
    /** APROBADA con link cargado, pero el negocio no enganchó: falta la respuesta. */
    aprobadaSinEnganche: LineaRica
    /** APROBADA sin link permanente: le toca a Franco, no al negocio. */
    aprobadaSinLink: LineaRica
    /** El negocio enganchó, pero Franco todavía no aprobó: falta la revisión. */
    engancheSinAprobar: LineaRica
    /** Ni enganche ni aprobación todavía: faltan las dos. */
    niEngancheNiAprobada: LineaRica
  }
}

export const GUIA_ENVIO = {
  titulo: 'Enviá el link de la demo',
  intro: [
    'El momento del flujo invertido: el link de la demo ',
    { enfasis: 'sale acá y solo acá' },
    ' — nunca en el opener, nunca antes de que Franco la apruebe.',
  ],
  listo: 'Demo aprobada — momento de enviar el link',
  preventivo: [
    'Camino preventivo (lead ',
    { enfasis: 'priorizado por Franco' },
    '): la estás mandando antes de que responda. Puede acompañar al opener — vos decidís el momento.',
  ],
  copyBlock: {
    titulo: 'Segundo mensaje — la demo con su link',
    instruccion:
      'Base editable: adaptala a la conversación y pegala en Instagram. El link va acá y solo acá.',
  },
  enviada: [
    'El próximo toque ya quedó armado — de acá en adelante el objetivo es ',
    { enfasis: 'UNO: la reunión' },
    '. Preguntá si la pudo ver y proponé un horario.',
  ],
  espera: {
    aprobadaSinEnganche: [
      'La demo está aprobada y su link ya está cargado — sale ',
      { enfasis: 'cuando el negocio conteste' },
      ' (o si Franco le dio prioridad).',
    ],
    aprobadaSinLink: [
      'Franco aprobó la demo pero ',
      { enfasis: FALTA_LINK_PERMANENTE },
      ' — sin ese link no hay nada que mandar, y el negocio no tiene nada que ver con esto. Cuando lo registre, el envío se destraba solo.',
    ],
    engancheSinAprobar: [
      'El link se envía cuando ',
      { enfasis: 'Franco apruebe la demo' },
      ' (la demo pasa por brief, construcción y chequeo final). Hasta ahí, este paso no lo ofrece.',
    ],
    niEngancheNiAprobada: [
      'El link de la demo se envía recién cuando el negocio ',
      { enfasis: 'responde Y Franco la aprueba' },
      ' — nunca antes. Mientras tanto: seguí la cadencia.',
    ],
  },
} satisfies EnvioGuia

// ── Contenido: QUÉ se está esperando (las pantallas de estado) ───────────────

/**
 * Las palabras de cada CAUSA de espera (`causaDeEspera`, turno.ts). El turno ya
 * dice de quién es la pelota; esto dice qué tiene que pasar para que vuelva.
 *
 * Existe porque las pantallas de estado nombraban el turno y nada más: la demo
 * en la cola de revisión y la demo aprobada-sin-link-permanente son dos esperas
 * muy distintas —una dura lo que tarde una revisión, la otra se destraba con un
 * campo— y mostraban EL MISMO texto. El producto ya sabía distinguirlas: lo decía
 * el envío (m15) con el gate cerrado, y el pie del wizard para la revisión. Ese
 * texto no viajaba. Acá NO se reescribe: se referencia el que ya funciona.
 *
 * `null` = esta causa no tiene frase propia porque ya está dicha:
 *   - `accionPropia` la dice entera `TEXTO_TURNO.setter.detalle`;
 *   - `respuesta` la dice el DATO (cuándo es el próximo toque y en cuál va la
 *     cadencia), que es más preciso que cualquier frase fija.
 *
 * `satisfies Record<CausaEspera, …>`: una causa nueva no compila hasta decidir
 * sus palabras — o hasta decidir, explícitamente, que no lleva.
 */
export const GUIA_ESPERA = {
  reunion: [
    'La reunión ',
    { enfasis: 'la corre Franco' },
    ' — el resultado lo carga él cuando termine.',
  ],
  cierre: [
    'El cierre ',
    { enfasis: 'lo decide Franco' },
    ' desde el panel — no se automatiza, y no hay nada del manual para hacer acá.',
  ],
  descarte: [
    'La evaluación ',
    { enfasis: 'descartó el negocio' },
    ' — bien filtrado: el trabajo de este lead terminó acá.',
  ],
  // El pie del wizard para EN_REVISION, tal cual: ya dice qué está pasando y
  // dónde te enterás. No se duplica.
  revision: GUIA_REVISION.enRevision,
  // El «todavía no» que m15 muestra con el gate cerrado. Es EL texto que este
  // sprint vino a hacer viajar: nombra la causa exacta y descarta al negocio.
  linkPermanente: GUIA_ENVIO.espera.aprobadaSinLink,
  accionPropia: null,
  respuesta: null,
} satisfies Record<CausaEspera, LineaRica | null>

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
    // P5-A — el material que la construcción necesita tener junto.
    resenasUrl: 'https://maps.app.goo.gl/ejemplo-cafe-de-barrio',
    imagenesUrl: 'https://drive.google.com/drive/folders/ejemplo-fotos-cafe',
    otraRedUrl: 'https://www.facebook.com/ejemplocafedebarrio',
    queVende:
      'Café de especialidad ($2.800 el flat white), medialunas ($1.400 la unidad), tostados y una carta corta de brunch los fines de semana ($9.500 el plato). Los precios los sacan de las fotos de la carta que subieron en marzo — están publicados en el feed, no en historias.',
    comoSePresenta:
      'Bio de IG: «Café de especialidad en el barrio desde 2019 ☕ Tostado propio. Pedidos por WhatsApp». En los posteos se presentan como el café "de siempre" del barrio y destacan que tuestan ellos mismos.',
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
  titulo: 'Un chequeo final terminado, como lo deja un buen setter',
  porque:
    'No es marcar todo en verde: es verificar cada obligatorio en la demo publicada y marcar los flags de diseño que viste, aunque no bloqueen.',
  lineas: [
    'Los 6 obligatorios en verde, pero cada uno comprobado en serio: abrió la demo en el celular, en incógnito, y tocó el botón de WhatsApp para ver que abriera el chat al número real.',
    'Dejó 2 flags de diseño marcados igual —«más de 3 colores» y «la fuente parece la default»—: no frenan el envío, pero viajan a Franco y muestran que miró con criterio.',
    'Un chequeo impecable, sin un solo flag de diseño marcado y hecho en treinta segundos, suele ser la señal de que NO se miró en serio. Un buen chequeo final casi siempre deja algún flag de diseño.',
  ],
} satisfies SelfCheckEjemplar

/**
 * Registro de la guía por paso. Solo trae las claves YA migradas. Los próximos
 * sprints suman su `GUIA_*` acá. `Partial` es deliberado: declara honestamente
 * qué pasos tienen guía y cuáles no, sin claves vacías.
 */
export const GUIA_PASOS: Partial<Record<GuiaPasoId, PasoGuia>> = {
  ficha: GUIA_FICHA,
  evaluacion: GUIA_EVALUACION,
  brief: GUIA_BRIEF,
  construccion: GUIA_CONSTRUCCION,
  draft: GUIA_DRAFT,
  selfCheck: GUIA_SELF_CHECK,
  opener: GUIA_OPENER,
  seguimiento: GUIA_SEGUIMIENTO,
  objeciones: GUIA_OBJECIONES,
  agenda: GUIA_AGENDA,
  traspaso: GUIA_TRASPASO,
}
