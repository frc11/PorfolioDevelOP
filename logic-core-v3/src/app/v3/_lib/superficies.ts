/**
 * LAS TRES SUPERFICIES DE PANEL — un DATO por sección, no una arquitectura.
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
 * superficie como propiedad y el sistema soporta las tres. Cambiar el
 * recorrido de superficies del sitio entero es editar OCHO VALORES en
 * `secciones.ts`, no reescribir el esqueleto. Es lo que hace que la decisión
 * estética sea barata y reversible.
 *
 * **Las ocho arrancan en `papel-opaco`.** Hay un invariante que lo afirma, así
 * que el día que alguien cambie una va a ser porque lo decidió.
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
 */

/** Los tres modos. No hay un cuarto y el invariante lo afirma. */
export type ModoSuperficie = 'papel-opaco' | 'papel-transparente' | 'oscuro-opaco'

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
