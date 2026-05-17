'use client'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  format?: (value: number) => string
}

export function Slider({ value, onChange, min, max, step = 1, format }: SliderProps) {
  return (
    <div className="space-y-2">
      <input
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        min={min}
        max={max}
        step={step}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-cyan-400"
      />
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{format ? format(min) : min}</span>
        <span className="font-medium text-cyan-400">
          {format ? format(value) : value}
        </span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  )
}
