'use client'

import type { EditableKeyframe } from './choreographyEditor'

/**
 * La lista de keyframes del editor: nombre, `at` y de dónde salió cada uno.
 *
 * Vive aparte del editor por el límite de tamaño de archivo del repo, y porque
 * es lo único del panel que no toca ni el store ni el track: recibe datos y
 * avisa un click. Se re-renderiza solo cuando el editor sube su versión, o sea
 * al duplicar, borrar, resetear o mover un `at` — nunca por frame y nunca por
 * arrastrar un slider de pose.
 *
 * **Las marcas dicen de quién es cada número**, que es lo que evita tocar por
 * error algo que fue medido:
 *
 * - `derivado` — lo inventó Claude en S4 para cubrir un sub-movimiento que las
 *   capturas no expresaban. Cada uno explica en su comentario qué habría que
 *   mirar para corregirlo.
 * - `nuevo` — lo creó el editor duplicando. Es el único que se puede borrar.
 * - `editado` — venía del archivo y se le movió algo en esta sesión.
 *
 * Sin marca = la captura del humano, tal cual entró.
 */

type KeyframeListProps = {
  keyframes: readonly EditableKeyframe[]
  selectedId: number
  onSelect: (id: number) => void
}

const ROW_BASE =
  'flex w-full items-baseline justify-between gap-2 rounded-sm border px-2 py-1 text-left text-[0.68rem] transition-colors'
const ROW_ON = 'border-neutral-900 bg-neutral-900 text-white'
const ROW_OFF = 'border-transparent text-neutral-700 hover:bg-neutral-100'

function badge(keyframe: EditableKeyframe): string {
  if (keyframe.origin === 'editor') return ' · nuevo'
  if (keyframe.derived) return keyframe.edited ? ' · derivado · editado' : ' · derivado'
  return keyframe.edited ? ' · editado' : ''
}

export function KeyframeList({ keyframes, selectedId, onSelect }: KeyframeListProps) {
  return (
    <ul
      className="flex max-h-52 flex-col gap-0.5 overflow-y-auto rounded-sm bg-neutral-100 p-1"
      aria-label="keyframes de la coreografía"
    >
      {keyframes.map((keyframe, index) => {
        const isSelected = keyframe.id === selectedId

        return (
          <li key={keyframe.id}>
            <button
              type="button"
              onClick={() => onSelect(keyframe.id)}
              aria-pressed={isSelected}
              data-probe="editor-keyframe"
              className={`${ROW_BASE} ${isSelected ? ROW_ON : ROW_OFF}`}
            >
              <span className="truncate">
                {index + 1}. {keyframe.name}
                <span className={isSelected ? 'text-neutral-300' : 'text-neutral-400'}>
                  {badge(keyframe)}
                </span>
              </span>
              <span className="font-ds-mono tabular-nums">{keyframe.at.toFixed(3)}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
