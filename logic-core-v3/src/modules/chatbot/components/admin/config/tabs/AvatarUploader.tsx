'use client'

import { useRef, useState } from 'react'
import { Loader2, UploadCloud } from 'lucide-react'

// Sin servicio externo: la imagen se recorta/comprime EN EL NAVEGADOR a un
// cuadrado <=200x200 (WebP) y se devuelve como data URL base64 para guardar en
// avatarImageUrl (Postgres TEXT). Así no inflamos la DB ni dependemos de infra.
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_INPUT_BYTES = 8 * 1024 * 1024 // 8 MB de archivo de entrada (antes de comprimir)
const MAX_DIMENSION = 200 // px (lado del cuadrado de salida)
const OUTPUT_QUALITY = 0.82

interface AvatarUploaderProps {
  onUploaded: (dataUrl: string) => void
}

// Recorta al cuadrado central y escala a <=200x200, devolviendo un data URL WebP.
async function compressToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  try {
    const side = Math.min(bitmap.width, bitmap.height)
    const sx = (bitmap.width - side) / 2
    const sy = (bitmap.height - side) / 2
    const target = Math.min(MAX_DIMENSION, side)

    const canvas = document.createElement('canvas')
    canvas.width = target
    canvas.height = target
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('canvas no disponible')
    }
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, target, target)
    return canvas.toDataURL('image/webp', OUTPUT_QUALITY)
  } finally {
    bitmap.close()
  }
}

export function AvatarUploader({ onUploaded }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Formato no permitido. Usá una imagen JPG, PNG o WebP.')
      return
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError('La imagen es muy pesada (máx 8 MB). Probá con una más chica.')
      return
    }

    setProcessing(true)
    try {
      const dataUrl = await compressToDataUrl(file)
      onUploaded(dataUrl)
    } catch {
      setError('No se pudo procesar la imagen. Probá con otro archivo.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleFile(file)
          // Permite re-elegir el mismo archivo (el onChange no dispara si el
          // value no cambia).
          event.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={processing}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {processing ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
        ) : (
          <UploadCloud className="h-4 w-4" strokeWidth={1.5} />
        )}
        {processing ? 'Procesando…' : 'Subir imagen'}
      </button>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}
