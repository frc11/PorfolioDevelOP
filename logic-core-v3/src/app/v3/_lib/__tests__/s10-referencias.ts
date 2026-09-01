/**
 * LOS ANCHOS, LOS ALTOS, LAS RAMAS Y LOS HUECOS — la tabla de referencia del
 * sprint, con la razón de cada entrada.
 *
 * Sale de `s10-banco.ts` para que ese archivo sea sólo el renderizador y éste
 * sólo la tabla. La costura es la misma que el repo usa en todos lados: **un
 * archivo decide y el otro ejecuta.** Cambiar un ancho de referencia no toca el
 * render, y arreglar el render no puede mover una razón.
 *
 * ⚠ **Ningún número de acá se eligió a ojo.** Cada ancho dice qué pregunta
 * contesta y cada alto cita el archivo del repo que lo midió. Un ancho sin razón
 * es un ancho que el próximo sprint borra o duplica sin enterarse.
 */

export type Rama = 'quieta' | 'animada'

export const RAMAS: readonly Rama[] = ['quieta', 'animada']

/** Qué se sirve en cada rama. Es la traducción del sprint, no una preferencia. */
export const QUE_SIRVE_CADA_RAMA: Readonly<Record<Rama, string>> = {
  quieta: 'abajo de 1025, y en cualquier ancho con `prefers-reduced-motion`',
  animada: 'desde 1025 y sin preferencia de movimiento reducido',
}

export interface AnchoDeReferencia {
  readonly px: number
  readonly porQue: string
}

/**
 * LOS CINCO ANCHOS, con su razón. La lista es del sprint y cada entrada dice
 * qué pregunta contesta ese ancho: un ancho sin razón es un ancho que el
 * próximo sprint borra o duplica sin saberlo.
 */
export const ANCHOS_DE_REFERENCIA: readonly AnchoDeReferencia[] = [
  { px: 375, porQue: 'el PISO de la banda fluida (`--fluido-piso`): los seis niveles llegan a su mínimo' },
  { px: 390, porQue: 'el teléfono que S0 midió — `LAYOUT.md` publica sus doce volcados a 390' },
  { px: 768, porQue: 'tablet, y el primer breakpoint del sistema (`--breakpoint-tablet`)' },
  { px: 1024, porQue: 'justo ABAJO del umbral de la escena: sin coreografía y sin `escritorio:`' },
  { px: 1025, porQue: 'justo ARRIBA: `--breakpoint-escritorio`, donde la escena y la coreografía existen' },
]

export const ANCHOS: readonly number[] = ANCHOS_DE_REFERENCIA.map((a) => a.px)

export interface AltoDeclarado {
  readonly px: number
  readonly fuente: string
}

/**
 * LOS ALTOS, y por qué se declaran aparte de los anchos.
 *
 * Porque **el alto no es una propiedad del ancho**: el mismo teléfono girado
 * cambia los dos, y una ventana de escritorio de 1025 puede medir cualquier
 * cosa. Emparejarlos a ojo metería un número inventado en la tabla del sprint.
 * Los tres que están acá son los únicos que este repo MIDIÓ o ya publica.
 *
 * ⚠ Para 768, 1024 y 1025 **no hay alto medido en este repo**, así que lo que
 * dependa del alto —el umbral de la pastilla, cuántas pantallas ocupa una
 * sección— se publica evaluado en los TRES y no en uno elegido.
 */
export const ALTOS_DECLARADOS: readonly AltoDeclarado[] = [
  { px: 667, fuente: 'el alto con el que este repo ya publica 375 (`_lib/secciones.ts`, fila del Cierre; §7.28)' },
  { px: 844, fuente: 'el alto del teléfono que S0 midió a 390 (`docs/rediseno/s0/LAYOUT.md` §3.5)' },
  { px: 900, fuente: 'el alto de referencia de escritorio de S0, con el que se compuso todo (§7.28)' },
]

export const ALTOS: readonly number[] = ALTOS_DECLARADOS.map((a) => a.px)

/** Los pares que este repo SÍ midió juntos. Todo lo demás se cruza. */
export const VIEWPORTS_MEDIDOS: readonly { readonly ancho: number; readonly alto: number }[] = [
  { ancho: 375, alto: 667 },
  { ancho: 390, alto: 844 },
]

/** Los supuestos del banco. Van al lado de toda cifra que salga de acá. */
export const SUPUESTOS_DEL_BANCO: readonly string[] = [
  'el marcado es el del SERVIDOR: no corrió ningún efecto, así que el divisor de líneas está en su fase de medición (texto plano) — lo dice `_invariantes/render.tsx`',
  '`EscenarioCompuerta` devuelve `null` en el servidor (`ssr: false`), así que la escena no aporta un solo elemento al documento',
  'la rama quieta es la que se sirve abajo de 1025 y también con `prefers-reduced-motion`: son el mismo árbol, no dos',
  'el orden del documento se toma como el orden de tabulación; ninguna hoja lo reordena con `order` ni con `position`, y eso NO se puede ver desde el marcado',
]

export interface Hueco {
  readonly nombre: string
  readonly porQue: string
  readonly queLoCerraria: string
}

/**
 * El overlay del preloader, que este banco NO puede renderizar. Está declarado
 * como hueco y no omitido: la diferencia es que un hueco se lee en el reporte.
 */
export const HUECO_DEL_INTRO: Hueco = {
  nombre: 'el overlay del intro dentro del documento',
  porQue:
    '`HomeIntro` consume `usePreloader` y tira fuera de `PreloaderProvider`, que es del sitio vivo y este sprint no lo toca',
  queLoCerraria:
    'montar el proveedor en el instrumento, o medirlo en un navegador con la primera visita de la sesión',
}

/**
 * LO QUE ESTE SPRINT NO PUEDE MEDIR, enumerado. **No se estima ninguno.**
 *
 * Un hueco declarado y un cero se ven igual en una tabla, y ésa es la
 * confusión que este repo lleva diez sprints cazando. Acá se nombran para que
 * el reporte los publique como huecos y no como resultados.
 */
export const HUECOS: readonly Hueco[] = [
  {
    nombre: 'LCP',
    porQue: 'es un tiempo, y un tiempo pide un navegador pintando con la pestaña al frente',
    queLoCerraria: 'una corrida con la pestaña visible; con la pestaña ocluida da cero por construcción',
  },
  {
    nombre: 'Lighthouse',
    porQue: 'es una corrida de auditoría sobre una página servida, no una propiedad del código',
    queLoCerraria: 'un servidor levantado y una corrida de Lighthouse — fuera del scope de este sprint',
  },
  {
    nombre: 'el anillo de foco REALMENTE visible',
    porQue: 'que una regla de foco exista en la hoja no dice que se vea sobre el fondo que le toca',
    queLoCerraria: 'una captura por elemento con el foco puesto',
  },
  {
    nombre: 'cuántas líneas ocupa cada texto',
    porQue: 'depende del ancho de glifo de Chivo y del algoritmo de corte del navegador',
    queLoCerraria: 'medir cajas en un navegador; acá se modela con supuestos declarados en cada frente',
  },
  {
    nombre: 'el orden REAL de los dos `rAF`',
    porQue: 'es una propiedad del planificador del navegador en tiempo de ejecución',
    queLoCerraria: 'una traza con la pestaña al frente — ver §7.34 de `DIRECCION-ESCENA.md`',
  },
  HUECO_DEL_INTRO,
]
