import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Tamaños de fuente del sistema de diseño del sitio público (rediseño B1),
 * declarados en el `@theme static` de `src/app/globals.css`.
 *
 * Hay que enumerarlos porque `tailwind-merge` no puede adivinar si
 * `text-<nombre-custom>` es un tamaño o un color: los dos utilities se escriben
 * igual. Sin esta lista los clasifica en el mismo grupo y **descarta uno de los
 * dos** en silencio — medido en runtime: `text-ds-canvas` desaparecía del CTA
 * primario (texto del mismo color que su fondo, ilegible) y `text-ds-eyebrow`
 * desaparecía de Eyebrow y MonoLabel (12px mono con tracking .18em quedaba en
 * 16px sans sin tracking).
 *
 * ⚠ Al agregar un token `--text-ds-*` nuevo en globals.css, agregarlo también
 * acá. Si falta, el componente que lo use pierde el tamaño o el color sin
 * ningún error de build ni de tipos.
 */
const DS_FONT_SIZE_CLASSES = [
  'text-ds-display-xl',
  'text-ds-display-lg',
  'text-ds-subhead',
  'text-ds-lead',
  'text-ds-body',
  'text-ds-eyebrow',
  'text-ds-data',
  'text-ds-control',
] as const

/**
 * ── LO MISMO PARA EL SISTEMA v3, AGREGADO EN SITIO-S7 ─────────────────────
 *
 * El defecto que el bloque de arriba describe **no era exclusivo del sistema
 * viejo**: los tokens de `/v3` (`src/app/theme-develop.css`) caen en la misma
 * trampa, y la lista nunca se había extendido a ellos. Lo encontraron los dos
 * lanes de secciones por separado, con las mismas dos formas y medidas con el
 * `cn` de este repo:
 *
 *     cn('text-fluido-micro', 'text-tinta-media')  →  'text-tinta-media'
 *          ← desaparece el TAMAÑO: los rótulos salían a tamaño heredado
 *     cn('font-cuerpo', 'font-medio')              →  'font-medio'
 *          ← desaparece la FAMILIA: el titular caía a la familia de cuerpo
 *
 * Y una TERCERA forma, que es la peor porque no necesita que nadie pase una
 * clase por `className`: `tailwind-merge` conoce `font-medium`/`font-semibold`,
 * no `font-medio`/`font-semi`/`font-fuerte`, así que los clasifica como FAMILIA
 * y cualquier `<Caption peso="medio">` perdía `font-cuerpo` por su cuenta.
 *
 * Por eso son DOS listas y no una: los `--text-*` van al grupo `font-size` —el
 * mismo arreglo que el sistema viejo— y los pesos van al grupo `font-weight`,
 * que es de dónde nunca tendrían que haber salido.
 *
 * ⚠ Las dos listas se derivan de `src/app/v3/_lib/tipografia.ts` y de los
 * tokens de `theme-develop.css`, y **no se importan de ahí**: `src/lib/` es
 * código compartido con el sitio vivo y no puede depender del árbol de `/v3`.
 * Lo que impide que se desincronicen es un instrumento —`test:s7-cn`— que
 * compara esta lista contra los tokens declarados en el CSS y contra la tabla
 * de niveles, y falla si falta uno.
 */
const V3_FONT_SIZE_CLASSES = [
  'text-micro',
  'text-caption',
  'text-cuerpo',
  'text-base',
  'text-titulo-s',
  'text-titulo-m',
  'text-titulo-l',
  'text-titulo-xl',
  'text-fluido-micro',
  'text-fluido-caption',
  'text-fluido-titulo-s',
  'text-fluido-titulo-m',
  'text-fluido-titulo-l',
  'text-fluido-titulo-xl',
  // El noveno nivel, del titular del hero rehecho. Las DOS entran: sin la
  // fija, `cn('text-display', 'text-tinta')` se come el tamaño.
  'text-display',
  'text-fluido-display',
  // El décimo nivel, la línea 2 del titular. Mismo motivo que el noveno.
  'text-display-xl',
  'text-fluido-display-xl',
  // COMPO-1: el décimo nivel resuelto en la banda angosta (320–374), donde la
  // fila 3 del titular no entra en un renglón. No es un nivel más de la escala
  // —no está en `NIVELES`— pero SÍ es un `--text-*`, así que sin esta entrada
  // `tailwind-merge` lo clasificaría como color y `cn()` se comería el tamaño
  // o la tinta. Es el mismo defecto que las dos listas de arriba existen para
  // evitar, y `test:s7-cn` §1 lo exige leyendo el tema.
  'text-display-xl-angosto',
  // RENGLON: el registro 2 atado a su columna, para que «LAS 24 HS» no se parta.
  'text-display-xl-columna',
  // PAPEL-2: el registro 1 igualado al registro 2 en la banda de papel, en sus
  // dos regímenes (abajo de 390 y abajo de 375). Mismo motivo que la entrada de
  // arriba: no son niveles de `NIVELES` pero SÍ son `--text-*`, así que sin
  // ellas `tailwind-merge` los toma por color. Y acá el riesgo es CONCRETO: las
  // tres clases de tamaño del registro 1 viajan juntas en el mismo `cn()`.
  'text-display-r1-papel',
  'text-display-r1-papel-angosto',
  // COMPO-2: el registro 1 en la banda portátil (768–1024), con los dos techos
  // medidos sobre el píxel. Mismo motivo que las tres de arriba, y el mismo
  // riesgo concreto: ahora son CINCO clases de tamaño del registro 1 viajando
  // en el mismo `cn()`.
  'text-display-r1-portatil',
] as const

/**
 * Los CUATRO pesos de `/v3` cuyo nombre no está en la lista de
 * `tailwind-merge`. `font-normal` NO entra: ése sí lo reconoce, y agregarlo
 * sería declarar dos veces lo mismo. `font-liviano` (300) entró con la línea 2
 * del titular del hero: sin él, `cn('font-liviano', 'font-titulo')` lo
 * clasifica como FAMILIA y la itálica sale en el peso equivocado.
 */
const V3_FONT_WEIGHT_CLASSES = ['font-liviano', 'font-medio', 'font-semi', 'font-fuerte'] as const

/** Para el instrumento: las listas, sin que tenga que releer este archivo. */
export const CLASES_DE_TAMANO_DECLARADAS: readonly string[] = [
  ...DS_FONT_SIZE_CLASSES,
  ...V3_FONT_SIZE_CLASSES,
]
export const CLASES_DE_PESO_DECLARADAS: readonly string[] = [...V3_FONT_WEIGHT_CLASSES]

/**
 * Igual que el `twMerge` por defecto para cualquier clase que no sea del sistema
 * de diseño — verificado contra los strings reales de `ui/Button` y de las
 * primitivas admin: 6/6 casos de control dan salida idéntica. Extender el
 * config solo agrega nombres que reconocer, no cambia cómo resuelve los que ya
 * reconocía.
 *
 * ⚠ Esa propiedad —que agregar nombres no cambia lo que ya resolvía— **dejó de
 * ser una afirmación de confianza en SITIO-S7**: `test:s7-cn` corre las dos
 * configuraciones, la de antes del arreglo y la de ahora, sobre el corpus de
 * cadenas de clase del sitio vivo extraído del propio código, y exige salida
 * idéntica en todas. El control positivo es el corpus de `/v3`, donde las dos
 * configuraciones TIENEN que diferir.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [...DS_FONT_SIZE_CLASSES, ...V3_FONT_SIZE_CLASSES],
      'font-weight': [...V3_FONT_WEIGHT_CLASSES],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
