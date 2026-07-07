'use client'

import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type OptionHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsClient } from '@/lib/use-is-client'
import { useFieldControl } from './field-context'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[]
  invalid?: boolean
}

interface NormalizedOption {
  value: string
  label: string
  disabled: boolean
}

interface PanelPosition {
  top?: number
  bottom?: number
  left: number
  width: number
}

const PANEL_MAX_H = 248
const GAP = 4

function calcPosition(trigger: HTMLElement): PanelPosition {
  const rect = trigger.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom - GAP
  const flipUp = spaceBelow < PANEL_MAX_H && rect.top > spaceBelow
  return {
    top: flipUp ? undefined : rect.bottom + GAP,
    bottom: flipUp ? window.innerHeight - rect.top + GAP : undefined,
    left: rect.left,
    width: rect.width,
  }
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  return ''
}

// Children.toArray aplana arrays de .map() pero no recorre Fragments — ningún
// call site los usa. Nodos que no son <option> se ignoran (sin <optgroup> en el repo).
function normalizeOptions(
  options: SelectOption[] | undefined,
  children: ReactNode,
): NormalizedOption[] {
  if (options) {
    return options.map((opt) => ({
      value: opt.value,
      label: opt.label,
      disabled: opt.disabled ?? false,
    }))
  }
  return Children.toArray(children).flatMap((child) => {
    if (
      !isValidElement<OptionHTMLAttributes<HTMLOptionElement>>(child) ||
      child.type !== 'option'
    ) {
      return []
    }
    const text = extractText(child.props.children)
    return [
      {
        // Nullish, no falsy: el placeholder <option value=""> conserva ''.
        // Sin value, el texto ES el value (semántica nativa de <option>).
        value: child.props.value != null ? String(child.props.value) : text,
        label: child.props.label ?? text,
        disabled: child.props.disabled ?? false,
      },
    ]
  })
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      invalid,
      className,
      children,
      id,
      title,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      ...selectProps
    },
    ref,
  ) => {
    // Asociación con el Field contenedor; el caller siempre gana sobre el contexto.
    const field = useFieldControl()
    const normalized = useMemo(() => normalizeOptions(options, children), [options, children])
    const isControlled = selectProps.value !== undefined

    const [internalValue, setInternalValue] = useState(() =>
      String(selectProps.defaultValue ?? normalized[0]?.value ?? ''),
    )

    const selectedValue = isControlled ? String(selectProps.value) : internalValue
    const selectedOption = normalized.find((opt) => opt.value === selectedValue) ?? normalized[0]

    const [open, setOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const [panelPos, setPanelPos] = useState<PanelPosition | null>(null)

    const selectRef = useRef<HTMLSelectElement | null>(null)
    const buttonRef = useRef<HTMLButtonElement | null>(null)
    const wrapperRef = useRef<HTMLDivElement | null>(null)
    const panelRef = useRef<HTMLDivElement | null>(null)
    const listboxRef = useRef<HTMLUListElement | null>(null)

    const rawId = useId()
    const listboxId = `lb-${rawId.replace(/:/g, '')}`
    const mounted = useIsClient()

    const assignSelectRef = useCallback(
      (node: HTMLSelectElement | null) => {
        selectRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    const commitValue = useCallback(
      (val: string) => {
        if (!isControlled) setInternalValue(val)
        const selectEl = selectRef.current
        if (selectEl) {
          // Native setter ensures React's synthetic onChange fires correctly
          const nativeSetter = Object.getOwnPropertyDescriptor(
            HTMLSelectElement.prototype,
            'value',
          )?.set
          if (nativeSetter) nativeSetter.call(selectEl, val)
          else selectEl.value = val
          selectEl.dispatchEvent(new Event('change', { bubbles: true }))
        }
        setOpen(false)
        buttonRef.current?.focus()
      },
      [isControlled],
    )

    const openPanel = useCallback(() => {
      if (!buttonRef.current) return
      setPanelPos(calcPosition(buttonRef.current))
      const currentIdx = normalized.findIndex(
        (opt) => opt.value === selectedValue && !opt.disabled,
      )
      const firstEnabled = normalized.findIndex((opt) => !opt.disabled)
      setActiveIndex(currentIdx >= 0 ? currentIdx : firstEnabled)
      setOpen(true)
    }, [normalized, selectedValue])

    // Focus listbox when opened — rAF so portal has painted
    useEffect(() => {
      if (!open) return
      const frameId = requestAnimationFrame(() => listboxRef.current?.focus())
      return () => cancelAnimationFrame(frameId)
    }, [open])

    // Click-outside — checks both wrapperRef and panelRef (portal breaks containment)
    useEffect(() => {
      if (!open) return
      const handleMouseDown = (e: MouseEvent) => {
        const target = e.target as Node
        if (wrapperRef.current?.contains(target) || panelRef.current?.contains(target)) return
        setOpen(false)
      }
      document.addEventListener('mousedown', handleMouseDown)
      return () => document.removeEventListener('mousedown', handleMouseDown)
    }, [open])

    // Scroll/resize close — capture phase; filters scroll internal del panel
    useEffect(() => {
      if (!open) return
      const handleScroll = (e: Event) => {
        if (panelRef.current?.contains(e.target as Node)) return
        setOpen(false)
      }
      const handleResize = () => setOpen(false)
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('scroll', handleScroll, true)
        window.removeEventListener('resize', handleResize)
      }
    }, [open])

    // Scroll active option into view (uses children index — no CSS selector, ID-safe)
    useEffect(() => {
      if (!open || activeIndex < 0) return
      const optEl = listboxRef.current?.children[activeIndex] as HTMLElement | undefined
      optEl?.scrollIntoView({ block: 'nearest' })
    }, [activeIndex, open])

    const handleButtonKeyDown = useCallback(
      (e: KeyboardEvent<HTMLButtonElement>) => {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
          e.preventDefault()
          if (!open) openPanel()
        }
      },
      [open, openPanel],
    )

    const handleListboxKeyDown = useCallback(
      (e: KeyboardEvent<HTMLUListElement>) => {
        const enabledIndices = normalized.reduce<number[]>((acc, opt, i) => {
          if (!opt.disabled) acc.push(i)
          return acc
        }, [])

        switch (e.key) {
          case 'ArrowDown': {
            e.preventDefault()
            const next = enabledIndices.find((i) => i > activeIndex)
            if (next !== undefined) setActiveIndex(next)
            break
          }
          case 'ArrowUp': {
            e.preventDefault()
            const prev = [...enabledIndices].reverse().find((i) => i < activeIndex)
            if (prev !== undefined) setActiveIndex(prev)
            break
          }
          case 'Home': {
            e.preventDefault()
            if (enabledIndices.length > 0) setActiveIndex(enabledIndices[0])
            break
          }
          case 'End': {
            e.preventDefault()
            if (enabledIndices.length > 0) setActiveIndex(enabledIndices[enabledIndices.length - 1])
            break
          }
          case 'Enter':
          case ' ': {
            e.preventDefault()
            const opt = normalized[activeIndex]
            if (opt && !opt.disabled) commitValue(opt.value)
            break
          }
          case 'Escape': {
            e.preventDefault()
            setOpen(false)
            buttonRef.current?.focus()
            break
          }
          case 'Tab': {
            setOpen(false)
            break
          }
        }
      },
      [activeIndex, normalized, commitValue],
    )

    return (
      <div ref={wrapperRef} className="relative">
        {/*
          Select real, visualmente oculto pero PRESENTE en el form: sr-only (no
          display:none por claridad, aunque ambos se envían en FormData) y sin
          `disabled` propio — un control disabled queda excluido del submit, así
          que solo lo deshabilita el caller vía spread. Sin JS el trigger no
          funciona (regresión consciente, registrada en CLAUDE.md): el valor por
          defecto igual se envía.
        */}
        <select
          ref={assignSelectRef}
          {...selectProps}
          tabIndex={-1}
          aria-hidden={true}
          className="sr-only pointer-events-none"
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <button
          ref={buttonRef}
          type="button"
          id={id ?? field.controlId}
          title={title}
          disabled={selectProps.disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby ?? field.describedBy}
          onClick={() => (open ? setOpen(false) : openPanel())}
          onKeyDown={handleButtonKeyDown}
          className={cn(
            'w-full appearance-none rounded-xl border bg-white/[0.02] pl-3 py-2 text-sm text-zinc-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 text-left disabled:cursor-not-allowed disabled:opacity-50',
            invalid
              ? 'border-red-400/40 focus:border-red-400/60'
              : 'border-white/10 focus:border-cyan-400/30',
            className,
            'pr-10',
          )}
        >
          <span className="block truncate">{selectedOption?.label || ' '}</span>
        </button>

        <ChevronDown
          size={16}
          strokeWidth={1.5}
          aria-hidden={true}
          className={cn(
            'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-transform duration-150',
            open && 'rotate-180',
          )}
        />

        {mounted &&
          createPortal(
            <AnimatePresence>
              {open && panelPos && (
                <motion.div
                  ref={panelRef}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                  style={{
                    position: 'fixed',
                    top: panelPos.top,
                    bottom: panelPos.bottom,
                    left: panelPos.left,
                    width: panelPos.width,
                    zIndex: 210,
                  }}
                  className="rounded-xl border border-white/[0.08] bg-zinc-900/95 backdrop-blur-[20px] backdrop-saturate-[180%] shadow-2xl overflow-hidden"
                >
                  <ul
                    ref={listboxRef}
                    role="listbox"
                    id={listboxId}
                    tabIndex={-1}
                    aria-label={ariaLabel ?? title}
                    aria-activedescendant={
                      activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
                    }
                    onKeyDown={handleListboxKeyDown}
                    className="max-h-60 overflow-y-auto overscroll-contain py-1 focus:outline-none"
                  >
                    {normalized.map((opt, i) => {
                      const isSelected = opt.value === selectedValue
                      const isActive = i === activeIndex
                      return (
                        <li
                          key={opt.value}
                          id={`${listboxId}-opt-${i}`}
                          role="option"
                          aria-selected={isSelected}
                          aria-disabled={opt.disabled || undefined}
                          onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
                          onMouseDown={(e) => {
                            e.preventDefault() // prevent blur on button
                            if (!opt.disabled) commitValue(opt.value)
                          }}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 text-sm cursor-default select-none transition-colors',
                            opt.disabled && 'opacity-40 cursor-not-allowed',
                            isActive && !opt.disabled
                              ? 'bg-cyan-400/10 text-cyan-300'
                              : 'text-zinc-200',
                          )}
                        >
                          <span className="flex-1 truncate">{opt.label}</span>
                          {isSelected && (
                            <Check size={14} strokeWidth={1.5} className="shrink-0 text-cyan-400" />
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body,
          )}
      </div>
    )
  },
)

Select.displayName = 'Select'
