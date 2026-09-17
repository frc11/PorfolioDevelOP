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
 * ⚠️ **LA DECISIÓN ESTÁ TOMADA: EL HOME NUEVO LLEVA CURSOR PROPIO (B5).**
 *
 * Nació en `false` en SITIO-S8, y ese `false` no era una preferencia: era la
 * forma de dejar ESCRITO que nadie había decidido. *«Un cursor que no se monta
 * porque nadie escribió el componente y un cursor que no se monta porque se
 * decidió que no se ven igual en la pantalla y son cosas distintas»* — la
 * constante existía para distinguirlas, y ahora existe para registrar cuál fue
 * la decisión y quién la tomó.
 *
 * **La toma B5, con las tres cosas que faltaban medidas:**
 *
 *   · **Qué cuesta en bytes**: el chunk perezoso pasa a pedirse arriba de 1025 y
 *     no viajaba antes. La cifra la publica `s3-peso` sobre el build.
 *   · **Qué cuesta en accesibilidad**: nada, y estaba escrito desde S3 — **el
 *     cursor nativo nunca se oculta**, `cursor: none` no aparece en un solo
 *     archivo del árbol, y el propio se dibuja ENCIMA, no en su lugar. Hay un
 *     instrumento que lo afirma.
 *   · **Con qué retardo**: el hueco `[decidido]` de `SEGUIMIENTO` se cerró
 *     midiendo el transitorio de la referencia. Ver `_lib/cursor.ts`.
 *
 * Las dos compuertas de S3 siguen adelante de ésta y no se tocaron: **abajo de
 * 1025 no se monta** y **con `prefers-reduced-motion` tampoco**. Esta constante
 * es la tercera condición y es de otra naturaleza — las de S3 preguntan si el
 * cursor CORRESPONDE en este dispositivo; ésta pregunta si el home lo lleva.
 *
 * ⚠ El `CustomCursor` del sitio VIEJO se desmontó en B2-S2 y se borró en B2-S4
 * por la razón contraria —escondía el del sistema con `cursor:none` global— y
 * el layout raíz lo documenta. **No son la misma pieza y el precedente no
 * decidió ésta**, pero quien la tomó tenía que saber que existe.
 */
export const CURSOR_PROPIO_EN_EL_HOME = true

/**
 * ⏳ **LA PASTILLA, APAGADA DE 859 PARA ABAJO — Y SIGUE SIENDO TEMPORAL.**
 *
 * ── Qué es y quién lo pidió ───────────────────────────────────────────────
 *
 * El dueño va a **rehacer la navegación** y quiere planificar las vistas
 * angostas sin ella. El pedido de PAPEL-2 fue literal: «desmontala en los
 * anchos de papel; no la rediseñes, no la conviertas en hamburguesa: sólo que
 * no esté». **COMPO-2 extiende esa misma banda a 425 y a 768** con el mismo
 * pedido y la misma salida —«el dueño va a poner hamburguesa»—, así que acá
 * sigue sin haber ningún rediseño: hay una pieza que deja de estar en cinco
 * anchos del set y una constante que declara que eso es provisorio.
 *
 * ── ⚠️ POR QUÉ LA CONSTANTE CAMBIÓ DE NOMBRE ────────────────────────────
 *
 * Se llamaba `PASTILLA_APAGADA_EN_PAPEL` y la banda ERA la del papel. Ya no lo
 * es: el papel opaco del Hero sigue viviendo abajo de `--breakpoint-chico`
 * (390) y la pastilla pasa a apagarse abajo de `--breakpoint-medio` (860). Un
 * nombre que dice «en papel» sobre una banda que no es la del papel es la clase
 * de dato que se lee mal una sola vez y alcanza. Es el mismo criterio con el
 * que COMPO-1 renombró `TIPOGRAFIA_DE_LA_SEGUNDA_LINEA` cuando dejó de haber
 * una segunda línea.
 *
 * ── De dónde sale 860, y por qué no hay corte nuevo ──────────────────────
 *
 * La banda que el pedido describe es «320, 375, 390, 425 y 768 sin pastilla;
 * 1024, 1440 y 1920 con pastilla» —el §4 del sprint dice textual que a 1024 el
 * dueño la quiere—. El único corte declarado que cae entre 768 y 1024 es
 * `--breakpoint-medio` (860), que ya existía y que COMPO-1 estrenó para el aire
 * del pie. `max-medio:` emite `@media (width < 860px)`, que es exactamente esa
 * partición. **No se declara un breakpoint nuevo porque no hace falta uno.**
 *
 * ── Por qué es una clase y no una rama ────────────────────────────────────
 *
 * `ChromeDelHome` es un componente de SERVIDOR: no tiene ancho en su render, y
 * el hook que sí lo lee devuelve `false` en el servidor y en la hidratación a
 * propósito. Una rama de JS pintaría el primer cuadro CON la pastilla y la
 * sacaría después. Es el mismo argumento con el que `superficies.ts` justifica
 * que la banda de papel sea CSS: **la única puerta es una media query**.
 *
 * `hidden` y no `visibility`: el envoltorio es `sticky` con `block-size: 0`,
 * así que lo que hay que apagar no es su caja —ya mide cero— sino la pastilla
 * `absolute` que cuelga de él y las cinco paradas de tabulación que trae.
 * `display:none` se lleva las dos cosas y además saca la pieza del árbol de
 * accesibilidad, que es lo correcto para algo que no está.
 *
 * ── ⚠️ LO QUE ESTO SE LLEVA, DICHO Y NO ESCONDIDO ────────────────────────
 *
 * Abajo de 860 el documento **pierde dos landmarks**: el `banner` —que es este
 * envoltorio con `como="header"`— y la `navigation` que cuelga de él. Quedan 9
 * de los 11 que `s10-acceso-landmarks` cuenta, y el `<main>` pasa a abrir el
 * documento. `SaltarAlContenido` NO se toca y sigue siendo el primer foco de la
 * página, así que el atajo de teclado que importa sigue estando.
 *
 * **Eso es una regresión de accesibilidad, ahora en CINCO anchos del set en vez
 * de dos, y se declara como tal.** Es aceptable sólo porque es temporal y
 * porque la navegación que la repara es el sprint que viene. El día que la
 * pastilla se rehaga, esta constante y su clase se van juntas — y si la
 * navegación nueva tampoco aparece abajo de 860, entonces el reemplazo tiene
 * que traer su propio landmark.
 *
 * ── ⚠️ Y LO QUE **NO** SE LLEVA: LOS 72 px DEL PIE DEL HERO ──────────────
 *
 * PAPEL-2 cobró esos 72 px abajo de 390 (`max-chico:pb-2`) porque los
 * necesitaba para la marca. **En 425 y en 768 no se cobran, y es una
 * instrucción explícita del dueño: el bloque se queda donde está hoy.** Medido
 * con la pastilla apagada y `pb-20` intacto, el tope de la columna no se mueve
 * un centésimo (425: 492,13 px con y sin ella; 768: 644,38 con y sin ella), y
 * si se soltaran los 72 el bloque caería y la superposición a 425 pasaría de
 * 4,33 % a 14,82 %. Así que acá los 72 px quedan como aire muerto a propósito.
 */
export const PASTILLA_APAGADA_ABAJO_DE_MEDIO = true

/** La clase que la apaga. Va acá y no en el JSX para que la constante de arriba
 *  y el mecanismo se lean juntos, y para que el instrumento afirme la MISMA
 *  cadena que se renderiza. */
export const CLASE_DE_LA_PASTILLA_APAGADA = 'max-medio:hidden'

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
