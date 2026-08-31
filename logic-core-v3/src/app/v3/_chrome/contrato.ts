/**
 * EL ENCHUFE DEL CHROME — el punto de montaje y su contrato.
 *
 * ⚠ **ESTE ARCHIVO NO LO ESCRIBE EL SUBAGENTE.** Lo escribió el agente
 * principal en la Fase 0 de SITIO-S8, antes de despachar. Acá vive además **la
 * decisión que nadie tomó**, apagada, para que ningún subagente la pueda
 * prender por su cuenta.
 *
 * ── Qué es el enchufe ──────────────────────────────────────────────────────
 *
 *   1. `src/app/v3/_chrome/ChromeDelHome.tsx` — lo que se monta. Lo escribe el
 *      subagente. Export **nombrado** `ChromeDelHome`, sin props.
 *   2. `src/app/v3/page.tsx` — dónde. Va **primero**, y no es estilo: ver abajo.
 *   3. Este archivo — el contrato y la constante apagada.
 *
 * ── Por qué el chrome va PRIMERO en el documento ───────────────────────────
 *
 * Por geometría, no por orden de lectura. El envoltorio de la pastilla de
 * navegación es `position: sticky` con `block-size: 0` y la pastilla vive
 * `absolute` adentro, a `top: 100svh − 72px`. Su posición de NACIMIENTO la
 * define dónde está en el documento: si nace tarde, nace abajo. Como mide cero,
 * no empuja nada, así que ponerlo arriba de todo no cuesta un píxel.
 *
 * El overlay del intro y el escenario son `fixed`, o sea que están fuera del
 * flujo y no compiten por esa posición. El orden entre ellos es indiferente
 * para el layout y se resuelve por `z-index`: escenario `z-0`, contenido
 * `z-10`, pastilla `--z-cabecera` = 100, overlay del intro 9999.
 *
 * ── Qué NO es este sprint ──────────────────────────────────────────────────
 *
 * La instrucción dice que S7 «no montó el chrome». **Eso es media verdad y
 * conviene corregirlo antes de trabajar sobre la premisa equivocada:** S7 sí
 * monta la pastilla de navegación (`page.tsx`), y el pie sí está montado —vive
 * adentro de la sección Cierre, que es donde lo puso el sprint que la
 * construyó—. Lo que efectivamente NO estaba montado es el **cursor propio**, y
 * §7.23 de `DIRECCION-ESCENA.md` lo dice con esas palabras.
 *
 * Así que este frente son tres trabajos y ninguno es «montar el chrome de
 * cero»:
 *
 *   · **verificar la pastilla contra el Hero real** — su umbral se compone
 *     desde tokens (`_lib/navegacion.ts`) y la derivación supone una primera
 *     pantalla de `100svh`. Hay que confirmar que el número sigue valiendo con
 *     el Hero que hoy existe, y que la cadena de ancestros sigue sin un
 *     `overflow` recortado, que apagaría el `sticky` en silencio;
 *   · **completar el recorrido del pie** — enlaza cuatro secciones y existen
 *     ocho (§7.24). `ANCLAS_QUE_EXISTEN` ya se deriva de las ocho porque eso es
 *     un hecho; `SECCIONES_QUE_EL_PIE_ENLAZA` quedó en cuatro porque ampliarlo
 *     es contenido, y este sprint es el que lo hace;
 *   · **montar el cursor apagado** — ver la constante de abajo.
 *
 * ── La compuerta del cursor ya existe: se reusa ────────────────────────────
 *
 * `_componentes/chrome/CursorCompuerta.tsx` tiene sus DOS compuertas de montaje
 * desde S3 —abajo de 1025 no se monta, y con `prefers-reduced-motion` tampoco—
 * y las dos devuelven `null`, así que el `import()` perezoso no se ejecuta y el
 * chunk no se pide. No se construye otra. Lo único que este sprint agrega es
 * una tercera condición, arriba de las dos: la decisión de composición.
 */

/**
 * ⚠️ **QUE EL HOME NUEVO TENGA CURSOR PROPIO ES UNA DECISIÓN QUE NADIE TOMÓ.**
 *
 * Está en `false` a propósito y **este sprint no la prende**. La constante
 * existe para que la decisión sea de una línea el día que se tome, y para que
 * mientras tanto sea VISIBLE: un cursor que no se monta porque nadie escribió
 * el componente y un cursor que no se monta porque se decidió que no, se ven
 * igual en la pantalla y son cosas distintas. Esta línea las distingue.
 *
 * ── Qué costaría prenderla ─────────────────────────────────────────────────
 *
 * El subagente lo mide y lo reporta con números: el peso del chunk perezoso que
 * pasaría a pedirse arriba de 1025, y qué cambia en pantalla. Lo que ya se sabe
 * sin medir, porque está escrito en `_lib/cursor.ts`, es que **el cursor nativo
 * nunca se oculta** —`cursor: none` no aparece en un solo archivo del sprint— y
 * que el propio se dibuja encima, no en su lugar. O sea que prenderlo no tiene
 * el costo de accesibilidad del cursor custom clásico; el costo es de
 * composición y de bytes.
 *
 * ⚠ El `CustomCursor` del sitio VIEJO se desmontó en B2-S2 y se borró en B2-S4
 * por la razón contraria —escondía el del sistema con `cursor:none` global— y
 * el layout raíz lo documenta. **No son la misma pieza y el precedente no
 * decide ésta**, pero quien tome la decisión tiene que saber que existe.
 */
export const CURSOR_PROPIO_EN_EL_HOME = false

/** El módulo que se monta, con su ruta exacta. Para poder afirmar que existe. */
export const MODULO_DEL_CHROME = 'src/app/v3/_chrome/ChromeDelHome.tsx'

/** Cómo lo pide el home. Se afirma contra el fuente de `page.tsx`. */
export const IMPORT_DEL_CHROME = './_chrome/ChromeDelHome'

/** El nombre exportado. */
export const EXPORT_DEL_CHROME = 'ChromeDelHome'

/**
 * Las piezas construidas que el chrome CONSUME. No se copian, no se reescriben
 * y no se les cambia un valor: están terminadas desde S3 y desde S6/S7.
 */
export const PIEZAS_QUE_SE_CONSUMEN: readonly string[] = [
  'src/app/v3/_componentes/chrome/Navegacion.tsx',
  'src/app/v3/_componentes/chrome/CursorCompuerta.tsx',
  'src/app/v3/_componentes/chrome/Pie.tsx',
  'src/app/v3/_secciones/cierre/ColumnasDelPie.tsx',
]

/**
 * Los DOS archivos de fuera de `_chrome/` que este frente puede tocar, con el
 * alcance exacto de cada uno. Están declarados como dato —y no dejados a
 * criterio— porque los dos viven adentro de una sección, y la regla del sprint
 * es que nadie cambia el comportamiento de una sección. Estos dos cambios son
 * de CONTENIDO y los pide la instrucción, uno por uno.
 */
export const ALCANCE_FUERA_DEL_CHROME = [
  {
    archivo: 'src/app/v3/_secciones/cierre/contenido.ts',
    alcance: 'SECCIONES_QUE_EL_PIE_ENLAZA — ampliar el recorrido de cuatro a las ocho que existen',
    porque:
      'ANCLAS_QUE_EXISTEN ya se deriva de las ocho: la lista de lo que EXISTE es un hecho. ' +
      'La de lo que el pie OFRECE quedó en cuatro porque ampliarla es contenido, y §7.24 la dejó anotada.',
  },
  {
    archivo: 'src/app/v3/_secciones/servicios/ContenidoDeServicio.tsx',
    alcance: '`peso="medio"` — restaurar el rodeo que el arreglo de `cn()` dejó sin razón',
    porque:
      'Era un parche del defecto de `cn()` que SITIO-S7 arregló en la raíz (`src/lib/utils.ts`). ' +
      'Un arreglo de raíz que deja los parches es código muerto que esconde el arreglo. ' +
      '⚠ Restaurarlo CAMBIA el peso tipográfico en pantalla: hay que reportar qué cambia.',
  },
] as const

/**
 * ⚠ **DÓNDE ESTÁ EL RODEO, Y POR QUÉ HAY QUE BUSCARLO ANTES DE TOCAR NADA.**
 *
 * La instrucción dice «`peso="medio"` sigue esquivado en **Servicios**» y §7.24
 * dice lo mismo, pero **ninguna de las dos da la línea**, y el barrido de la
 * Fase 0 encontró que el único rodeo con su motivo escrito al lado no está en
 * Servicios: está en `cierre/ColumnasDelPie.tsx:131`, con el comentario *«SIN
 * `peso`. Ver la nota de `cn()` arriba: con `peso="medio"` esta misma línea
 * perdía la familia Y el peso, en silencio»*, y su regla declarada en el
 * docblock del archivo (*«`font-codigo` sólo sin `peso`»*).
 *
 * Los candidatos que la Fase 0 dejó localizados, para que el subagente no
 * vuelva a barrer:
 *
 *   · `cierre/ColumnasDelPie.tsx:131` — el rodeo CON su motivo escrito. Es el
 *     que mejor encaja con la descripción, y **está en el pie**, que es de este
 *     frente.
 *   · `servicios/ContenidoDeServicio.tsx:107` — un `<Caption>` sin `peso`, con
 *     un comentario vecino que habla del MISMO defecto de `cn()` pero sobre el
 *     color, no sobre el peso.
 *   · `_contrato/medios.tsx:144` y `_componentes/tipografia/Textos.tsx:143` —
 *     los dos ya llevan `peso="medio"`: el rodeo ahí ya se sacó.
 *
 * **Si el rodeo no está en Servicios, se dice.** Regla 8 del sprint: ninguna
 * afirmación se afloja, y una que resulte incorrecta se reemplaza y se explica.
 * Lo que no se puede hacer es restaurar algo en Servicios para que la frase
 * quede cierta.
 */
export const CANDIDATOS_DEL_RODEO: readonly string[] = [
  'src/app/v3/_secciones/cierre/ColumnasDelPie.tsx',
  'src/app/v3/_secciones/servicios/ContenidoDeServicio.tsx',
]

/**
 * La regla de la compuerta para el chrome, escrita para poder afirmarla:
 * **nada del chrome se monta abajo de 1025 salvo lo que ya está gateado por su
 * cuenta.** La pastilla es la excepción declarada y no es una concesión: es CSS
 * `sticky` puro, o sea que no baja un byte de JavaScript de más y funciona en
 * los dos lados del umbral. El cursor tiene su compuerta desde S3.
 */
export const GATEADO_POR_SU_CUENTA: readonly string[] = [
  'src/app/v3/_componentes/chrome/CursorCompuerta.tsx',
]
