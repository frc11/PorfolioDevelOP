'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FILTER_ALL, type FilterOption } from './lead-filters'

const MAX_MATCHES = 8

type LocationTypeaheadProps = {
  /** filters.zone: FILTER_ALL | una ubicación | FILTER_NONE */
  value: string
  /** options.zone (incluye 'Todos'); las candidatas excluyen FILTER_ALL. */
  options: FilterOption[]
  onChange: (zone: string) => void
}

/**
 * Filtro de ubicación como typeahead (Pedido 2). Combobox minimal SIN dep: input +
 * dropdown de matches reales (acotado). Elegir filtra; input vacío = sin filtro de
 * ubicación. Para muchas ubicaciones no se llena de opciones.
 */
export function LocationTypeahead({ value, options, onChange }: LocationTypeaheadProps) {
  const candidates = options.filter((option) => option.value !== FILTER_ALL)
  const selectedLabel = candidates.find((option) => option.value === value)?.label ?? ''

  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const rawId = useId()
  const listId = `loc-${rawId.replace(/:/g, '')}`

  const displayValue = editing ? query : selectedLabel
  const normalizedQuery = query.trim().toLowerCase()
  const matches = (
    normalizedQuery
      ? candidates.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
      : candidates
  ).slice(0, MAX_MATCHES)

  // Cerrar el dropdown al click afuera.
  useEffect(() => {
    if (!open) {
      return
    }
    const handler = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setEditing(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Mantener visible la opción activa al navegar con teclado (la lista tiene scroll).
  useEffect(() => {
    if (!open || activeIndex < 0) {
      return
    }
    const optEl = listRef.current?.children[activeIndex] as HTMLElement | undefined
    optEl?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  const select = (option: FilterOption) => {
    onChange(option.value)
    setEditing(false)
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleInputChange = (text: string) => {
    setQuery(text)
    setEditing(true)
    setOpen(true)
    setActiveIndex(-1)
    if (text.trim() === '') {
      onChange(FILTER_ALL) // input vacío = sin filtro de ubicación
    }
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setOpen(true)
        setActiveIndex((current) => Math.min(current + 1, matches.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((current) => Math.max(current - 1, 0))
        break
      case 'Enter':
        if (open && activeIndex >= 0 && matches[activeIndex]) {
          event.preventDefault()
          select(matches[activeIndex])
        }
        break
      case 'Escape':
        setOpen(false)
        setEditing(false)
        setActiveIndex(-1)
        break
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
        strokeWidth={1.5}
      />
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
        }
        value={displayValue}
        placeholder="Cualquier ubicacion"
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => {
          setEditing(true)
          setQuery(selectedLabel)
          setOpen(true)
        }}
        onKeyDown={handleKeyDown}
        className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-2 pl-9 pr-3 text-sm text-zinc-200 outline-none transition-colors focus:border-cyan-400/30"
      />

      {open && matches.length > 0 ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-white/10 bg-zinc-900/95 p-1 shadow-2xl backdrop-blur-[20px]"
        >
          {matches.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-opt-${index}`}
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => {
                event.preventDefault() // evita el blur antes del select
                select(option)
              }}
              className={cn(
                'cursor-default rounded-lg px-3 py-2 text-sm',
                index === activeIndex ? 'bg-cyan-400/10 text-cyan-300' : 'text-zinc-200',
              )}
            >
              {option.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
