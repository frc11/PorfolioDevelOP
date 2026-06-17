import { NextResponse, type NextRequest } from 'next/server'
import { put } from '@vercel/blob'
import { auth } from '@/auth'
import { applyAuthRateLimit } from '@/lib/security/auth-rate-limit'

export const runtime = 'nodejs'

// Subida de la imagen de avatar del bot a Vercel Blob. Solo SUPER_ADMIN.
// Tipos aceptados y límite de peso validados server-side; el cliente valida
// igual para feedback inmediato, pero la fuente de verdad es esta ruta.
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminId = session.user.id ?? 'unknown'

  // Rate limit por admin (precedente: resendCredentialsPerAdmin) — anti
  // doble-click y anti abuso de cuenta comprometida.
  const limit = await applyAuthRateLimit({
    scope: 'avatarUploadPerAdmin',
    identifier: adminId,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: 'Demasiadas subidas seguidas. Esperá un momento e intentá de nuevo.',
        retryAfterSeconds: limit.retryAfterSeconds,
      },
      { status: 429 },
    )
  }

  // El token del blob lo provee el entorno (NUNCA hardcodeado). Sin él no se
  // puede subir — devolvemos estado de configuración (no el valor) a un admin.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'El almacenamiento de imágenes no está configurado todavía.' },
      { status: 503 },
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Petición inválida.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 })
  }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Formato no permitido. Usá una imagen JPG, PNG o WebP.' },
      { status: 415 },
    )
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'La imagen supera el límite de 5 MB.' },
      { status: 413 },
    )
  }

  try {
    const ext = EXT_BY_TYPE[file.type] ?? 'bin'
    const blob = await put(`bot-avatars/avatar.${ext}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    })
    return NextResponse.json({ url: blob.url })
  } catch {
    // Sin stack traces ni detalles internos al cliente.
    return NextResponse.json(
      { error: 'No se pudo subir la imagen. Intentá de nuevo en unos segundos.' },
      { status: 500 },
    )
  }
}
