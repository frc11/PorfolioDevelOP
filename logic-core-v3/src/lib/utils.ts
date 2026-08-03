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
 * Igual que el `twMerge` por defecto para cualquier clase que no sea del sistema
 * de diseño — verificado contra los strings reales de `ui/Button` y de las
 * primitivas admin: 6/6 casos de control dan salida idéntica. Extender el
 * config solo agrega nombres que reconocer, no cambia cómo resuelve los que ya
 * reconocía.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [...DS_FONT_SIZE_CLASSES],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
