/**
 * LAS CUATRO SUPERFICIES DE PANEL — un DATO por sección, no una arquitectura.
 *
 * ── La decisión que este sprint NO toma ────────────────────────────────────
 *
 * En la referencia los paneles claros son opacos y los oscuros son
 * transparentes: se ve el canvas oscuro a través de ellos.
 *
 * develOP invierte el tema por defecto —papel claro, sección oscura como
 * excepción— y su escena es UNA SALA CLARA. Esa relación se da vuelta entera,
 * y hay que diseñarla, no asumirla: nadie decidió todavía qué panel deja ver
 * la sala y cuál no.
 *
 * **La solución del esqueleto es no decidir.** Cada panel declara su
 * superficie como propiedad y el sistema soporta las cuatro. Cambiar el
 * recorrido de superficies del sitio entero es editar OCHO VALORES en
 * `secciones.ts`, no reescribir el esqueleto. Es lo que hace que la decisión
 * estética sea barata y reversible.
 *
 * **S1 dejó las ocho en `papel-opaco`** con un invariante que lo afirmaba, así
 * que el día que alguien cambiara una iba a ser porque lo decidió.
 * **SITIO-S5 lo decidió**: el recorrido está escrito entero en `secciones.ts`
 * y el invariante ahora afirma ESE recorrido, tabla contra tabla.
 * **B6-A abrió Trabajos y el Cierre** con un velo, y **B8 abrió las dos que
 * faltaban y sacó el velo**: seis de las ocho ven la sala; Servicios y Tu panel
 * quedan opacas por pedido del humano.
 *
 * ── Por qué `oscuro-opaco` no cuesta un token ──────────────────────────────
 *
 * No pinta un hex ni declara un color propio: pone `data-seccion="invertida"`,
 * que es el bloque que `theme-develop.css` ya trae de S0. Ese bloque redefine
 * `--color-fondo` y `--color-tinta`, así que las MISMAS clases `bg-fondo
 * text-tinta` que usa `papel-opaco` pintan la sección invertida.
 * Y el anillo de foco se da vuelta solo, sin que este archivo lo mencione,
 * porque `--color-foco` es `var(--color-tinta)`.
 * Esto depende de `@theme static` y NO funcionaría con `@theme inline`: ahí el
 * valor queda incrustado en la utilidad y el override no llega. Medido.
 *
 * ── ⚠️ B8 · LA CUARTA, `oscuro-transparente`, YA NO LLEVA VELO ────────────
 *
 * B6-A la construyó con un fondo en gradiente —0,80 detrás del texto, 0,40 en
 * la zona desnuda— sobre la escena, y el humano la grabó: Trabajos «no se
 * parece en nada» a la referencia y el pie del Cierre «sigue con el fondo
 * oscuro». Los dos tienen la misma causa y es de concepción, no de ejecución:
 *
 * > **Un velo oscuro sobre una sala de papel blanco da GRIS. Nunca da negro.**
 *
 * La sala en Trabajos era una sala blanca con el sol a 36° (luminancia media
 * 0,74 contra 0,001 de la referencia, `docs/rediseno/outputs/b6/`), y ningún
 * velo la vuelve la noche de la referencia: la lava y la deja gris. Y en el
 * Cierre pasaba lo contrario: la sala ya estaba en penumbra (el arco en 0,34),
 * el velo encima, y quedaba negro — abierto en el código, cerrado a la vista.
 *
 * **La oscuridad no la da un velo: la da la luz.** `nivel = sin(elevación)/
 * sin(36°)` es la palanca (`_lib/escena/lightArc.ts`), y con ella el fondo
 * oscuro de Trabajos sale de la física del mundo —el sol se pone— y no de un
 * vidrio ahumado encima. Por eso esta superficie es ahora exactamente
 * `papel-transparente` con la tinta dada vuelta: sin fondo, sin gradiente, sin
 * tokens propios. Los tres tokens del velo y la hoja `_estilos/velo.css` se
 * fueron con él.
 *
 * ⚠️ **Lo que esto rompe a propósito, y dónde está anotado.** Sin velo, el
 * contraste de la tinta sobre la escena depende de la luz de cada pose y del
 * texto que cae sobre el logo; lo que falla se declara como deuda con su
 * número (`deudaDeclarada`, `_lib/__tests__/afirmar.ts`) y es el insumo del
 * bloque siguiente, que acomoda la información a la coreografía. Ver
 * `docs/rediseno/outputs/B8-LUZ.md`.
 */

/** Los cuatro modos. No hay un quinto y el invariante lo afirma. */
export type ModoSuperficie =
  | 'papel-opaco'
  | 'papel-transparente'
  | 'oscuro-opaco'
  | 'oscuro-transparente'

export interface DefinicionSuperficie {
  /** Las utilidades que pinta el panel. Cero color fuera de los tokens. */
  readonly clases: string
  /** Si escribe `data-seccion="invertida"` — el mecanismo de S0. */
  readonly invertida: boolean
  /** Si el escenario se ve a través del panel. */
  readonly dejaVerElCanvas: boolean
  /** Qué color queda detrás del texto, para la cuenta de contraste. */
  readonly detrasDelTexto: string
}

export const SUPERFICIES: Readonly<Record<ModoSuperficie, DefinicionSuperficie>> = {
  /** Fondo papel sólido; el canvas no se ve. */
  'papel-opaco': {
    clases: 'bg-fondo text-tinta',
    invertida: false,
    dejaVerElCanvas: false,
    detrasDelTexto: 'var(--color-fondo)',
  },
  /** El canvas se ve; el contenido flota en la sala. */
  'papel-transparente': {
    clases: 'text-tinta',
    invertida: false,
    dejaVerElCanvas: true,
    detrasDelTexto: 'el escenario',
  },
  /**
   * Sección invertida sólida; el canvas no se ve. Mismas clases que
   * `papel-opaco` — lo que cambia es el atributo, no la utilidad.
   */
  'oscuro-opaco': {
    clases: 'bg-fondo text-tinta',
    invertida: true,
    dejaVerElCanvas: false,
    detrasDelTexto: 'var(--color-fondo) redefinido a #0E0E0E',
  },
  /**
   * Sección invertida que deja ver el canvas: la tinta clara directo sobre la
   * sala, sin velo (B8). La oscuridad detrás la pone el arco del sol, no un
   * fondo. Mismas clases que `papel-transparente`; cambia el atributo.
   */
  'oscuro-transparente': {
    clases: 'text-tinta',
    invertida: true,
    dejaVerElCanvas: true,
    detrasDelTexto: 'el escenario, con la luz que el arco le dé en esa pose',
  },
}

/**
 * Los colores que pinta el canvas de prueba, en orden de aparición.
 *
 * Están acá y no en el componente porque son la entrada de la cuenta de
 * contraste: `superficies.invariant.ts` calcula la razón de la tinta contra
 * cada uno y reporta el peor caso. Un número del reporte tiene que tener un
 * instrumento que lo produzca, y el instrumento tiene que leer el MISMO valor
 * que pinta la pantalla.
 *
 * Son dos tokens del sistema, no dos hex elegidos: `--color-superficie-2` y
 * `--color-superficie-3`. Se eligieron esos dos porque son los escalones que
 * más se separan del papel sin salir de la base clara — es decir, los que
 * hacen que un panel `papel-transparente` se DISTINGA de uno `papel-opaco`,
 * que es lo único que el marcador de posición tiene que demostrar.
 */
export const COLORES_DEL_CANVAS_DE_PRUEBA = [
  { token: '--color-superficie-2', hex: '#E8E8E6' },
  { token: '--color-superficie-3', hex: '#DBDBD9' },
] as const

/** La tinta primaria. Mismo valor que `--color-tinta` en `theme-develop.css`. */
export const TINTA_HEX = '#111111'
