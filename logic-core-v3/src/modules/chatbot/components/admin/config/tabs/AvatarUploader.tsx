'use client'

import { useRef, useState } from 'react'
import { Loader2, UploadCloud } from 'lucide-react'

// Mismas reglas que valida la ruta /api/admin/chatbot/avatar-upload — acá es
// solo para feedback inmediato; el server es la fuente de verdad.
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

interface AvatarUploaderProps {
  onUploaded: (url: string) => void
}

export function AvatarUploader({ onUploaded }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Formato no permitido. Usá una imagen JPG, PNG o WebP.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('La imagen supera el límite de 5 MB.')
      return
    }

    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/admin/chatbot/avatar-upload', {
        method: 'POST',
        body,
      })
      const data = (await res.json().catch(() => ({}))) as {
        url?: string
        error?: string
      }
      if (!res.ok || !data.url) {
        setError(data.error ?? 'No se pudo subir la imagen. Intentá de nuevo.')
        return
      }
      onUploaded(data.url)
    } catch {
      setError('No se pudo subir la imagen. Revisá tu conexión e intentá de nuevo.')
    } finally {
      setUploading(false)
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
        disabled={uploading}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
        ) : (
          <UploadCloud className="h-4 w-4" strokeWidth={1.5} />
        )}
        {uploading ? 'Subiendo…' : 'Subir imagen'}
      </button>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}
