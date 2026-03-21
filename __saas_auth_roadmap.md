# SaaS Auth Roadmap — develOP Platform
**Auditoría arquitectónica de autenticación · 2026-03-20**

---

## Índice

1. [Estado actual del sistema](#1-estado-actual-del-sistema)
2. [Mapa de vulnerabilidades y brechas](#2-mapa-de-vulnerabilidades-y-brechas)
3. [Fase 1 — Hardening crítico (0 a 2 semanas)](#3-fase-1--hardening-crítico)
4. [Fase 2 — Experiencia de autenticación SaaS (2 a 6 semanas)](#4-fase-2--experiencia-de-autenticación-saas)
5. [Fase 3 — Estándares Enterprise (6 a 12 semanas)](#5-fase-3--estándares-enterprise)
6. [Schema Prisma objetivo](#6-schema-prisma-objetivo)
7. [Checklist de seguridad final](#7-checklist-de-seguridad-final)

---

## 1. Estado actual del sistema

### Archivos auditados

| Archivo | Responsabilidad |
|---|---|
| `src/auth.ts` | Configuración NextAuth v5, provider Credentials, callbacks JWT/session |
| `src/middleware.ts` | Guard de rutas por rol (SUPER_ADMIN / CLIENT) |
| `src/app/login/page.tsx` | UI del formulario de login (Client Component) |
| `src/app/login/actions.ts` | Server Action que invoca `signIn('credentials', ...)` |
| `prisma/schema.prisma` | Modelos User, Account, Session, VerificationToken |

### Flujo actual (diagrama)

```
Browser → /login (page.tsx)
           ↓ form submit
         loginAction (actions.ts)  ←── no validación, no rate limit
           ↓ signIn('credentials')
         auth.ts → authorize()
           ↓ prisma.user.findUnique + bcrypt.compare
         JWT generado → cookie httpOnly
           ↓
         middleware.ts → redirect por rol
           ↓
         /admin  (SUPER_ADMIN)
         /dashboard (CLIENT)
```

### Fortalezas identificadas

- ✅ Contraseñas hasheadas con bcrypt (bcryptjs).
- ✅ JWT httpOnly cookie vía NextAuth v5.
- ✅ Separación de roles en middleware con redirect automático.
- ✅ Modelos `Account`, `Session` y `VerificationToken` presentes en schema (listo para OAuth).
- ✅ `onDelete: Cascade` en relaciones críticas.
- ✅ Campo `emailVerified` en modelo User (estructura lista).

---

## 2. Mapa de vulnerabilidades y brechas

### 🔴 Crítico — Bloquea producción SaaS

#### V-01: Sin Rate Limiting en login
**Archivo:** `src/app/login/actions.ts`

El Server Action no tiene ningún mecanismo de limitación de intentos. Un atacante puede ejecutar fuerza bruta ilimitada contra cualquier cuenta.

```
POST /login → loginAction → signIn → authorize() [sin límite de velocidad]
```

**Impacto:** Compromiso total de cuentas de cliente en minutos con diccionarios comunes.

---

#### V-02: Email no verificado permite acceso completo
**Archivo:** `src/auth.ts` línea 17–39

El campo `emailVerified` existe en el schema pero nunca se comprueba en `authorize()`. Cualquier usuario creado manualmente con `emailVerified: null` puede ingresar al sistema.

```typescript
// Código actual — la verificación NO se comprueba:
const user = await prisma.user.findUnique({ ... })
if (!user?.password) return null
const isValid = await bcrypt.compare(...)  // ← salta directo aquí
```

**Impacto:** Usuarios con emails falsos o no verificados operan con acceso completo.

---

#### V-03: Sin flujo de contraseña olvidada
**Archivos:** `src/app/login/` (no existe `forgot-password/`)

El modelo `VerificationToken` está en el schema pero no se usa. No hay página, acción ni lógica de reset de contraseña. Si un cliente pierde su contraseña, el único recovery es intervención manual del SUPER_ADMIN en la base de datos.

**Impacto:** Churn garantizado. Un SaaS B2B sin self-service password reset es inviable.

---

#### V-04: Sin validación de inputs en Server Action
**Archivo:** `src/app/login/actions.ts`

```typescript
// Código actual — sin ninguna validación:
await signIn('credentials', {
  email: formData.get('email') as string,   // cast directo
  password: formData.get('password') as string,  // sin validar longitud
  redirectTo: '/dashboard',
})
```

No se valida formato de email, longitud mínima/máxima de contraseña, ni presencia de caracteres nulos. Un payload malformado llega directo a bcrypt y a la DB.

---

#### V-05: Mismatch JWT strategy + PrismaAdapter
**Archivo:** `src/auth.ts` líneas 8–9

```typescript
adapter: PrismaAdapter(prisma),   // ← diseñado para database sessions
session: { strategy: 'jwt' },     // ← usa JWT, nunca escribe en Session
```

Con `strategy: 'jwt'`, NextAuth ignora el adapter para las sesiones. La tabla `Session` en PostgreSQL jamás recibe datos. El adapter solo sirve para OAuth (Account). Esto genera confusión arquitectónica y puede causar comportamientos inesperados en futuras versiones de NextAuth.

---

### 🟠 Alto — Limita escalabilidad SaaS

#### V-06: Sin proveedor OAuth (Google / GitHub)
**Archivo:** `src/auth.ts`

Solo existe `Credentials`. En B2B SaaS, el 70%+ de los clientes espera "Continuar con Google". Sin OAuth, el onboarding crea fricción desde el primer contacto.

---

#### V-07: Sin Magic Links (autenticación sin contraseña)
Para clientes ocasionales o invitados de alto perfil, un Magic Link es más seguro que credenciales (no hay contraseña que robar).

---

#### V-08: Sin Account Lockout tras intentos fallidos
No existe ningún mecanismo para bloquear temporalmente una cuenta después de N intentos fallidos. Complementa a V-01.

---

#### V-09: Sistema de roles binario — no escalable
**Archivo:** `prisma/schema.prisma` línea 12–15

```prisma
enum Role {
  SUPER_ADMIN
  CLIENT       // ← un solo rol para todos los clientes
}
```

Para un SaaS B2B real, los clientes necesitan al menos:
- `CLIENT_ADMIN` — puede gestionar su propia organización.
- `CLIENT_MEMBER` — acceso de solo lectura/operación.
- `SUPER_ADMIN` — acceso total (interno develOP).

---

#### V-10: Sin capa de Organization / Tenant
**Archivo:** `prisma/schema.prisma`

Relación actual: `User (1:1) → Client`. Esto impide que un cliente empresa tenga múltiples usuarios. En B2B SaaS, la unidad de facturación es la **organización**, no el usuario individual.

---

#### V-11: Sin flujo de invitación de usuarios
Los nuevos usuarios CLIENT son creados manualmente por SUPER_ADMIN. No existe flujo de invitación por email con token de un solo uso. Esto no escala.

---

### 🟡 Medio — Mejoras de seguridad y experiencia

#### V-12: Sin 2FA / MFA
Para clientes enterprise, la autenticación de dos factores es frecuentemente un requisito contractual (SOC 2, ISO 27001).

#### V-13: Sin Audit Log de sesiones
No se registran: intentos de login fallidos, IPs, user-agents, horarios de acceso. Imposible hacer forensics si hay una brecha.

#### V-14: Duración de sesión no configurada explícitamente
NextAuth usa 30 días por defecto. Para un SaaS enterprise, sessions de 8 horas con refresh token son el estándar.

#### V-15: Matcher del middleware demasiado estrecho
**Archivo:** `src/middleware.ts` líneas 39–41

```typescript
matcher: ['/admin/:path*', '/dashboard/:path*', '/login'],
```

Rutas como `/api/protected/*`, `/settings`, `/billing` no están cubiertas. Si se agregan nuevas secciones protegidas y se olvida actualizar el matcher, quedan expuestas.

---

## 3. Fase 1 — Hardening crítico

> **Objetivo:** Cerrar las vulnerabilidades que bloquean un lanzamiento seguro.
> **Timeline:** 0–2 semanas · **Prioridad:** BLOQUEANTE

---

### Fix V-01: Rate Limiting con Upstash Redis

**Instalar:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Crear:** `src/lib/rate-limit.ts`
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const loginRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 intentos por 15 minutos
  analytics: true,
  prefix: 'ratelimit:login',
})
```

**Modificar:** `src/app/login/actions.ts`
```typescript
'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { loginRateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  // 1. Rate limiting por IP
  const ip = (await headers()).get('x-forwarded-for') ?? 'anonymous'
  const { success, remaining } = await loginRateLimit.limit(ip)

  if (!success) {
    return `Demasiados intentos. Esperá 15 minutos. (${remaining} restantes)`
  }

  // 2. Validación de inputs
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !email.includes('@') || email.length > 254) {
    return 'Email inválido.'
  }
  if (!password || password.length < 8 || password.length > 128) {
    return 'Contraseña inválida.'
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Email o contraseña incorrectos.'
        default:
          return 'Ocurrió un error. Intentá de nuevo.'
      }
    }
    throw error
  }
  return null
}
```

**Variables de entorno requeridas:**
```env
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

> **Alternativa sin Redis:** usar `next-rate-limit` con almacenamiento en memoria (solo para single-instance, no apto para producción multi-pod).

---

### Fix V-02: Verificación de email en authorize()

**Modificar:** `src/auth.ts`
```typescript
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) return null

  const user = await prisma.user.findUnique({
    where: { email: credentials.email as string },
    include: { client: { select: { id: true } } },
  })

  if (!user?.password) return null

  // ✅ NUEVO: Verificar email antes de comparar contraseña
  if (!user.emailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED')
  }

  const isValid = await bcrypt.compare(
    credentials.password as string,
    user.password
  )
  if (!isValid) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? undefined,
    role: user.role,
    clientId: user.client?.id ?? undefined,
  }
},
```

**Manejar el error en** `actions.ts`:
```typescript
case 'CredentialsSignin':
  return 'Email o contraseña incorrectos.'
// ✅ NUEVO:
default:
  if ((error.cause as Error)?.message === 'EMAIL_NOT_VERIFIED') {
    return 'Por favor verificá tu email antes de ingresar.'
  }
  return 'Ocurrió un error. Intentá de nuevo.'
```

---

### Fix V-05: Separar JWT strategy del adapter correctamente

**Modificar:** `src/auth.ts`
```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Con JWT strategy, el adapter solo sirve para OAuth providers.
  // Si solo usamos Credentials ahora, podemos omitir el adapter
  // hasta agregar OAuth (Fase 2). Esto elimina la confusión.
  // adapter: PrismaAdapter(prisma),  ← comentar hasta Fase 2

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,      // ✅ 8 horas (estándar enterprise)
    updateAge: 60 * 60,        // Refrescar si hay actividad cada 1h
  },
  pages: { signIn: '/login' },
  // ...
})
```

> Cuando se implemente OAuth en Fase 2, se reintroduce el adapter ya que Google/GitHub requieren guardar tokens en `Account`.

---

### Fix V-15: Middleware matcher más robusto

**Modificar:** `src/middleware.ts`
```typescript
export const config = {
  matcher: [
    // Rutas protegidas actuales
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
    // ✅ NUEVO: API routes protegidas
    '/api/admin/:path*',
    '/api/client/:path*',
    // Excluir assets estáticos y Next internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

> **Nota:** El último pattern es amplio — evaluar si conviene un enfoque de allowlist (solo rutas conocidas) vs. blocklist (excluir assets).

---

## 4. Fase 2 — Experiencia de autenticación SaaS

> **Objetivo:** Añadir OAuth, Magic Links y Forgot Password.
> **Timeline:** 2–6 semanas

---

### Feature A: OAuth con Google

**Instalar / ya incluido en NextAuth v5.**

**Variables de entorno:**
```env
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

**Modificar:** `src/auth.ts`
```typescript
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'  // ✅ NUEVO
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),  // ✅ Reintroducir para OAuth
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: { signIn: '/login' },
  providers: [
    Google({
      // Restringir a dominios corporativos si necesario:
      // authorization: { params: { hd: 'tudominio.com' } },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'CLIENT',  // Los usuarios OAuth son clientes por defecto
          emailVerified: new Date(),  // Google ya verificó el email
        }
      },
    }),
    Credentials({ /* ... igual que antes ... */ }),
  ],
  callbacks: {
    jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.clientId = user.clientId
        token.provider = account?.provider ?? 'credentials'
      }
      return token
    },
    session({ session, token }) {
      session.user.role = token.role
      session.user.clientId = token.clientId
      session.user.provider = token.provider
      return session
    },
  },
})
```

**UI — Agregar botón en** `login/page.tsx`:
```tsx
import { signIn } from '@/auth'

// Dentro del form o debajo de él:
<form action={async () => {
  'use server'
  await signIn('google', { redirectTo: '/dashboard' })
}}>
  <button type="submit" className="w-full rounded-xl border border-white/10 py-3 text-sm">
    <GoogleIcon /> Continuar con Google
  </button>
</form>
```

> **Consideración de seguridad:** Si se permite OAuth de Google sin restricción de dominio, cualquier cuenta Google puede registrarse. Implementar un allowlist de emails o restricción por `hd` (hosted domain) para clientes enterprise.

---

### Feature B: Magic Links

**Instalar:**
```bash
npm install @auth/core  # ya incluido, usar Resend o Nodemailer
npm install resend
```

**Variables de entorno:**
```env
AUTH_RESEND_KEY=re_...
EMAIL_FROM=no-reply@develop.com.ar
```

**Agregar provider en** `src/auth.ts`:
```typescript
import Resend from 'next-auth/providers/resend'

providers: [
  Resend({
    from: process.env.EMAIL_FROM,
    sendVerificationRequest: async ({ identifier, url, provider }) => {
      const resend = new Resend(provider.apiKey)
      await resend.emails.send({
        from: provider.from,
        to: identifier,
        subject: 'Tu acceso a develOP',
        html: magicLinkTemplate(url),  // template personalizado
      })
    },
  }),
  // ...
]
```

**Nota:** Magic Links usan la tabla `VerificationToken` que ya existe en el schema. ✅

---

### Feature C: Forgot Password / Reset Password

Este es el flujo más complejo. Requiere:

1. **Tabla de reset tokens** (puede reutilizar `VerificationToken` o crear una dedicada).
2. **Server Action** para solicitar reset.
3. **Server Action** para confirmar reset.
4. **2 páginas nuevas:** `/forgot-password` y `/reset-password`.
5. **Envío de email** con token de un solo uso y expiración.

#### Schema adicional requerido:
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

#### `src/app/forgot-password/actions.ts`:
```typescript
'use server'

import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.AUTH_RESEND_KEY)

export async function forgotPasswordAction(
  _: string | null,
  formData: FormData
): Promise<string | null> {
  const email = formData.get('email') as string

  if (!email || !email.includes('@')) {
    return 'Email inválido.'
  }

  // ✅ Siempre devolver el mismo mensaje (evitar user enumeration)
  const successMsg = 'Si el email existe, recibirás un enlace en minutos.'

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return successMsg  // No revelar si existe o no

  // Invalidar tokens anteriores
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null }
  })

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt }
  })

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: 'Restablecer contraseña — develOP',
    html: resetPasswordTemplate(resetUrl, user.name ?? email),
  })

  return successMsg
}
```

#### `src/app/reset-password/actions.ts`:
```typescript
'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function resetPasswordAction(
  _: string | null,
  formData: FormData
): Promise<string | null> {
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (password !== confirm) return 'Las contraseñas no coinciden.'
  if (password.length < 8) return 'Mínimo 8 caracteres.'
  if (password.length > 128) return 'Contraseña demasiado larga.'

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!record) return 'Token inválido o expirado.'
  if (record.usedAt) return 'Este enlace ya fue usado.'
  if (record.expiresAt < new Date()) return 'El enlace expiró. Solicitá uno nuevo.'

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        password: hashedPassword,
        emailVerified: new Date(),  // Verificar email implícitamente
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },  // Marcar como usado (no borrar, para auditoría)
    }),
  ])

  return null  // null = éxito, redirigir en la página
}
```

---

### Feature D: Flujo de invitación de clientes

Reemplazar la creación manual de usuarios por un flujo de invitación:

```typescript
// src/lib/actions/invitations.ts
'use server'

import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { auth } from '@/auth'

export async function inviteClientAction(email: string, companyName: string) {
  const session = await auth()
  if (session?.user.role !== 'SUPER_ADMIN') throw new Error('Unauthorized')

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días

  // Crear usuario pendiente
  await prisma.user.create({
    data: {
      email,
      role: 'CLIENT',
      // password null — debe setearla en el onboarding
      client: {
        create: {
          companyName,
          slug: companyName.toLowerCase().replace(/\s+/g, '-'),
        }
      }
    }
  })

  // Guardar token de invitación
  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt }
  })

  const inviteUrl = `${process.env.NEXTAUTH_URL}/accept-invite?token=${token}`
  // Enviar email de bienvenida con inviteUrl
}
```

---

## 5. Fase 3 — Estándares Enterprise

> **Objetivo:** Roles granulares, multi-tenancy, MFA, auditoría.
> **Timeline:** 6–12 semanas

---

### Feature E: Sistema de roles granular

**Schema nuevo:**
```prisma
enum Role {
  SUPER_ADMIN   // Equipo develOP — acceso total
  ORG_ADMIN     // Admin de organización cliente
  ORG_MEMBER    // Miembro de organización cliente (read-mostly)
}
```

**Migración:** Los `CLIENT` actuales se convierten en `ORG_ADMIN` de su organización.

---

### Feature F: Multi-tenancy con Organization

```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  logoUrl     String?
  plan        Plan     @default(FREE)
  createdAt   DateTime @default(now())

  members     OrgMember[]
  services    Service[]
  projects    Project[]
  messages    Message[]
  invoices    Invoice[]
}

model OrgMember {
  id             String   @id @default(cuid())
  userId         String
  organizationId String
  role           OrgRole  @default(MEMBER)
  joinedAt       DateTime @default(now())

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
}

enum OrgRole {
  ADMIN
  MEMBER
  VIEWER
}

enum Plan {
  FREE
  STARTER
  PROFESSIONAL
  ENTERPRISE
}
```

**Estrategia de migración:** Convertir cada `Client` actual en una `Organization`, convertir el `User` propietario en `OrgMember` con rol `ADMIN`.

---

### Feature G: 2FA con TOTP

**Instalar:**
```bash
npm install @otplib/preset-default qrcode
```

**Schema adicional:**
```prisma
model TwoFactorAuth {
  id        String    @id @default(cuid())
  userId    String    @unique
  secret    String    // Encriptado en reposo con AES-256
  enabled   Boolean   @default(false)
  backupCodes String[] // Hasheados con bcrypt
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Flujo:**
1. Usuario activa 2FA en Settings → se genera secret TOTP.
2. Se muestra QR code → usuario escanea con Google Authenticator / Authy.
3. Usuario confirma con primer código → 2FA habilitado.
4. En cada login, después de credentials válidas, se solicita el TOTP.
5. Se proveen 10 backup codes hasheados para recovery.

---

### Feature H: Audit Log de autenticación

```prisma
model AuthEvent {
  id         String        @id @default(cuid())
  userId     String?
  email      String?
  event      AuthEventType
  ip         String?
  userAgent  String?
  metadata   Json?
  createdAt  DateTime      @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([createdAt])
  @@index([event])
}

enum AuthEventType {
  LOGIN_SUCCESS
  LOGIN_FAILURE
  LOGOUT
  PASSWORD_RESET_REQUESTED
  PASSWORD_RESET_COMPLETED
  EMAIL_VERIFIED
  TWO_FACTOR_ENABLED
  TWO_FACTOR_VERIFIED
  INVITATION_SENT
  INVITATION_ACCEPTED
  ACCOUNT_LOCKED
  SUSPICIOUS_ACTIVITY
}
```

**Logging en** `authorize()`:
```typescript
async authorize(credentials) {
  const email = credentials?.email as string

  try {
    // ... lógica de auth ...

    if (!isValid) {
      await prisma.authEvent.create({
        data: { email, event: 'LOGIN_FAILURE', ip: getClientIP() }
      })
      return null
    }

    await prisma.authEvent.create({
      data: { userId: user.id, email, event: 'LOGIN_SUCCESS', ip: getClientIP() }
    })

    return { /* ... */ }
  } catch (error) {
    await prisma.authEvent.create({
      data: { email, event: 'SUSPICIOUS_ACTIVITY', metadata: { error: String(error) } }
    })
    return null
  }
}
```

---

### Feature I: Account Lockout automático

Tras 10 intentos fallidos en 1 hora → cuenta bloqueada temporalmente.

```prisma
// Agregar al modelo User:
model User {
  // ... campos actuales ...
  failedLoginAttempts Int      @default(0)
  lockedUntil         DateTime?
}
```

```typescript
// En authorize():
if (user.lockedUntil && user.lockedUntil > new Date()) {
  const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)
  throw new Error(`ACCOUNT_LOCKED:${minutesLeft}`)
}

if (!isValid) {
  const attempts = user.failedLoginAttempts + 1
  const lockedUntil = attempts >= 10
    ? new Date(Date.now() + 60 * 60 * 1000)  // 1 hora
    : null

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: attempts, lockedUntil }
  })
  return null
}

// Login exitoso — resetear contador
await prisma.user.update({
  where: { id: user.id },
  data: { failedLoginAttempts: 0, lockedUntil: null }
})
```

---

## 6. Schema Prisma objetivo

Versión final del schema tras implementar todas las fases:

```prisma
// Estado objetivo — no copiar directamente, migrar en fases

model User {
  id                  String    @id @default(cuid())
  name                String?
  email               String    @unique
  emailVerified       DateTime?
  image               String?
  password            String?
  role                Role      @default(ORG_MEMBER)
  failedLoginAttempts Int       @default(0)
  lockedUntil         DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  accounts     Account[]
  sessions     Session[]
  twoFactor    TwoFactorAuth?
  authEvents   AuthEvent[]
  orgMembships OrgMember[]
  resetTokens  PasswordResetToken[]
}

enum Role {
  SUPER_ADMIN
  ORG_ADMIN
  ORG_MEMBER
}
```

---

## 7. Checklist de seguridad final

### Fase 1 (Crítico — semanas 0-2)
- [ ] Rate limiting implementado en `loginAction` (Upstash o equivalente)
- [ ] Validación de inputs (email format, password length) en Server Action
- [ ] Verificación de `emailVerified` en `authorize()`
- [ ] Duración de sesión explícita (maxAge: 8h)
- [ ] Middleware matcher actualizado para cubrir API routes
- [ ] `NEXTAUTH_SECRET` con mínimo 32 caracteres aleatorios en producción
- [ ] `NEXTAUTH_URL` configurado correctamente en producción

### Fase 2 (Experiencia — semanas 2-6)
- [ ] Google OAuth configurado y probado
- [ ] Magic Links con Resend funcionando
- [ ] Forgot Password flow completo (solicitud + reset + invalidación)
- [ ] Flujo de invitación de clientes implementado
- [ ] Templates de email con branding develOP

### Fase 3 (Enterprise — semanas 6-12)
- [ ] Schema migrado a Organization / OrgMember
- [ ] Roles granulares (ORG_ADMIN, ORG_MEMBER, VIEWER)
- [ ] 2FA/TOTP implementado con backup codes
- [ ] Audit Log activo en todos los eventos de auth
- [ ] Account Lockout automático (10 intentos / 1 hora)
- [ ] Panel de sesiones activas para clientes (listar + revocar)
- [ ] Notificación por email en login desde nuevo dispositivo/IP

### Headers de seguridad HTTP (independiente — hacer ahora)
Agregar en `next.config.ts`:
```typescript
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // ajustar según necesidad
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.anthropic.com",  // ajustar
    ].join('; '),
  },
]
```

---

*Documento generado por Claude Code — develOP Platform · Auditoría 2026-03-20*
*Este documento es de planificación. No modifica ningún archivo fuente.*
