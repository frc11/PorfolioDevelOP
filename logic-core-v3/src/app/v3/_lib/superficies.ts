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
 * y el invariante ahora afirma ESE recorrido, tabla contra tabla. Son tres
 * momentos de escena —aparece, desaparece y vuelve— y no ocho.
 * **B6-A abrió dos más** —Trabajos y el Cierre, en `oscuro-transparente`— y
 * son cinco momentos: la escena vuelve en el medio del recorrido.
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
 * ── ⚠️ B6-A · LA CUARTA: `oscuro-transparente`, que faltaba ────────────────
 *
 * La tabla tenía tres modos y la referencia usa cuatro: *«los claros opacos,
 * los oscuros transparentes»* —Franco lo midió—. Sus paneles oscuros dejan ver
 * el canvas, y por eso su home se siente un mundo continuo y no una página con
 * dos ventanas. Acá el recorrido de S5 dejaba la escena visible en DOS de las
 * ocho, y el humano lo grabó al lado de la referencia: *«sólo en el hero se ve
 * el logo y la animación de atrás, en el resto no»*.
 *
 * **El velo NO es una opacidad sobre el panel.** Bajar la opacidad de la
 * `<section>` atenúa el texto con ella y se pierden las dos cosas a la vez. El
 * velo es un FONDO semitransparente y el texto va encima a opacidad plena. Es
 * la misma diferencia que hay entre un vidrio ahumado y una foto desteñida.
 *
 * **Y es un gradiente, no una alfa plana: lo decidió la PARADA 1 con los
 * números.** Medido en la pose de Trabajos con la escena real detrás
 * (`docs/rediseno/outputs/b6/d-velo.json`): con alfa plana 0,60 la tinta plena
 * queda en 4,98:1 y el texto secundario en 2,90:1, y pasa el 40,0 % del desvío
 * de gris de la sala. Con 0,80 detrás de la columna de texto y 0,40 en la zona
 * desnuda pasan los dos niveles —6,65:1 y 4,76:1— y pasa el 60,6 %. Es el
 * único velo que deja leer los dos niveles de tinta Y deja ver más sala. El
 * desenfoque quedó descartado por inútil (5,12:1, 34,6 %) y por deuda.
 *
 * **La referencia no vela.** Su sala es casi negra (luminancia media 0,001 a
 * 0,066) y su texto va directo sobre el canvas; sus únicos paneles oscuros con
 * texto son tarjetas chicas de desenfoque puro. La nuestra en la pose de
 * Trabajos tiene media 0,74: por eso acá hace falta un velo y allá no.
 *
 * **Cuesta tres tokens, y están registrados.** `--color-velo-denso` y
 * `--color-velo-ralo` en `theme-develop.css`, en los dos temas, con sus alfas
 * sacadas de la escala de opacidad: 0,40 es `--opacity-media`, que ya existía,
 * y 0,80 es `--opacity-densa`, el escalón nuevo, derivado: es el primero con el
 * que el texto secundario pasa AA sobre el velo (0,70 daba 4,09:1; 0,80, 4,84).
 * La forma del gradiente —dónde termina la columna de texto, cuánto mide la
 * rampa— vive en `_estilos/velo.css` con las cuentas a la vista, sobre tokens
 * de layout. La clase `velo` es de esa hoja; `superficies.invariant` §1 y §3b
 * afirman que la hoja la define, que consume los dos tokens y que el piso de
 * contraste cierra con el peor píxel posible detrás.
 *
 * **Sin escena, sin velo.** La hoja enciende el gradiente sólo cuando la escena
 * está montada (`[data-v3]:has([data-escena])`); abajo del umbral el panel es
 * el sólido de siempre. Un velo sobre nada sería una banda gris sobre el papel.
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

/**
 * LA CLASE DEL VELO. La define `_estilos/velo.css` sobre `[data-v3]`, y consume
 * `--color-velo-denso` y `--color-velo-ralo`. Va como constante exportada para
 * que el invariante afirme la MISMA cadena que el panel pinta y la que la hoja
 * declara, y para que no se puedan desincronizar en silencio.
 */
export const CLASE_DEL_VELO = 'velo'

/** Los dos tokens que el velo consume. El invariante los busca en la hoja y en el tema. */
export const TOKENS_DEL_VELO = ['--color-velo-denso', '--color-velo-ralo'] as const

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
   * Sección invertida con VELO: el canvas se ve a través de un fondo en
   * gradiente —denso detrás del texto, ralo en la zona desnuda— y el texto va
   * encima a opacidad plena. (B6-A)
   */
  'oscuro-transparente': {
    clases: `${CLASE_DEL_VELO} text-tinta`,
    invertida: true,
    dejaVerElCanvas: true,
    detrasDelTexto: 'el escenario, detrás de var(--color-velo-denso) —rgba(14, 14, 14, 0.80)— en la columna de texto',
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
