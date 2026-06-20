'use server'

import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { prisma } from '@/lib/prisma'
import { seedOnboardingTasksForOrg } from '@/lib/onboarding/seed-tasks-for-org'
import { z } from 'zod'

// P1-12: convierte el valor de FormData a string sin un `as` que enmascare el
// tipo real (FormDataEntryValue puede ser File). No-string → ''.
function formString(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : ''
}

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value

const REQUIRED_FIELDS_MSG = 'Todos los campos obligatorios deben estar completos.'

// P1-12: reemplaza el regex manual de email por Zod. Mensajes en español para
// preservar el contrato del form (useActionState muestra el string devuelto).
const CreateClientSchema = z.object({
  companyName: z.string().min(1, REQUIRED_FIELDS_MSG),
  email: z
    .string()
    .min(1, REQUIRED_FIELDS_MSG)
    .email('El email no tiene un formato valido.'),
  password: z
    .string()
    .min(1, REQUIRED_FIELDS_MSG)
    .min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  name: z.string().min(1, REQUIRED_FIELDS_MSG),
  logoUrl: z.preprocess(
    emptyToUndefined,
    z.string().url('La URL del logo no es válida.').optional()
  ),
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function uniqueSlug(base: string, excludeOrgId?: string): Promise<string> {
  let slug = slugify(base)
  let counter = 1

  while (true) {
    const existing = await prisma.organization.findFirst({
      where: {
        slug,
        ...(excludeOrgId ? { NOT: { id: excludeOrgId } } : {}),
      },
    })

    if (!existing) return slug

    slug = `${slugify(base)}-${counter}`
    counter += 1
  }
}

export async function createClientAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  // FIX 1 — guard de auth. createClientAction crea org+user+member: mutación
  // exclusiva de SUPER_ADMIN. Una server action es un POST público, así que el
  // gate del layout no alcanza; validamos rol ANTES de procesar el input.
  // requireSuperAdmin() lanza 'Unauthorized' si el caller no es super-admin
  // (mismo patrón que lead/ticket/demo/inbound/activity actions).
  await requireSuperAdmin()

  const parsed = CreateClientSchema.safeParse({
    companyName: formString(formData.get('companyName')).trim(),
    email: formString(formData.get('email')).trim(),
    password: formString(formData.get('password')),
    name: formString(formData.get('name')).trim(),
    logoUrl: formString(formData.get('logoUrl')).trim(),
  })

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? REQUIRED_FIELDS_MSG
  }

  const { companyName, password, name } = parsed.data
  // FIX 3 — email casing. Normalizamos a lowercase para alinear con el login
  // (auth.ts lowercasea el email al autenticar). Sin esto, un cliente creado
  // con mayúsculas nunca podría loguear: el findUnique del login no matchearía.
  // Solo afecta usuarios NUEVOS; no toca registros existentes.
  const email = parsed.data.email.toLowerCase()
  const logoUrl = parsed.data.logoUrl ?? null

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return 'Ya existe un usuario con ese email.'
  }

  const slug = await uniqueSlug(companyName)
  const hashedPassword = await bcrypt.hash(password, 12)

  let newOrgId: string | undefined
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: Role.ORG_MEMBER,
          emailVerified: new Date(),
        },
      })

      const org = await tx.organization.create({
        data: { companyName, slug, logoUrl },
      })

      newOrgId = org.id

      await tx.orgMember.create({
        data: { userId: user.id, organizationId: org.id, role: 'ADMIN' },
      })
    })
  } catch {
    return 'Error al crear el cliente. Intenta de nuevo.'
  }

  if (newOrgId) {
    await seedOnboardingTasksForOrg(newOrgId).catch((e) =>
      console.error('[Onboarding] Error seeding tasks:', e),
    )
  }

  revalidatePath('/admin/clients')
  revalidateTag('admin-clients', {})
  redirect('/admin/clients')
}

export async function updateClientAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  // Auth guard — updateClientAction muta org+user: SUPER_ADMIN exclusivo.
  // Server action = POST público; el gate del layout no alcanza.
  await requireSuperAdmin()

  const clientId = (formData.get('clientId') as string | null) ?? ''
  const companyName = (formData.get('companyName') as string | null)?.trim() ?? ''
  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const logoUrl = (formData.get('logoUrl') as string | null)?.trim() || null
  const analyticsPropertyId =
    (formData.get('analyticsPropertyId') as string | null)?.trim() || null
  const siteUrl = (formData.get('siteUrl') as string | null)?.trim() || null
  const n8nWorkflowIds = ((formData.get('n8nWorkflowIds') as string | null) ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  if (!clientId) return 'ID de cliente invalido.'
  if (!companyName || !name) {
    return 'Nombre de empresa y contacto son obligatorios.'
  }

  const org = await prisma.organization.findUnique({
    where: { id: clientId },
    select: {
      companyName: true,
      members: {
        where: { role: 'ADMIN' },
        select: { userId: true },
        take: 1,
      },
    },
  })

  if (!org) return 'Cliente no encontrado.'

  const slug = companyName !== org.companyName ? await uniqueSlug(companyName, clientId) : undefined
  const adminUserId = org.members[0]?.userId

  try {
    await prisma.$transaction([
      prisma.organization.update({
        where: { id: clientId },
        data: {
          companyName,
          logoUrl,
          analyticsPropertyId,
          siteUrl,
          n8nWorkflowIds,
          ...(slug ? { slug } : {}),
        },
      }),
      ...(adminUserId
        ? [
            prisma.user.update({
              where: { id: adminUserId },
              data: {
                name,
              },
            }),
          ]
        : []),
    ])
  } catch {
    return 'Error al actualizar el cliente. Intenta de nuevo.'
  }

  revalidatePath('/admin/clients')
  revalidatePath(`/admin/clients/${clientId}`)
  revalidatePath('/admin', 'layout')
  revalidatePath('/dashboard', 'layout')
  revalidateTag('admin-clients', {})
  redirect(`/admin/clients/${clientId}`)
}



