'use client'

const PRESET_COLORS = [
  { value: '#06b6d4', label: 'Cyan develOP' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#f43f5e', label: 'Rose' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#0ea5e9', label: 'Sky' },
  { value: '#14b8a6', label: 'Teal' },
]

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  nullable?: boolean
}

export function ColorPicker({ value, onChange, nullable }: ColorPickerProps) {
  const swatchValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#06b6d4'

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={swatchValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 cursor-pointer rounded-sm border border-white/10 bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="flex-1 rounded-sm border border-white/10 bg-white/[0.02] px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-400/30 focus:outline-none"
          placeholder={nullable ? 'Sin color' : '#06b6d4'}
        />
        {nullable && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-sm border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
          >
            Limpiar
          </button>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs text-zinc-500">Sugerencias</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => onChange(color.value)}
              title={color.label}
              aria-label={color.label}
              className={`h-6 w-6 rounded-sm border transition-transform hover:scale-110 ${
                value.toLowerCase() === color.value.toLowerCase()
                  ? 'border-white/40 ring-1 ring-white/30'
                  : 'border-white/10'
              }`}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
