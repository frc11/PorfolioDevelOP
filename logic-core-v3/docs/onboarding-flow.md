# Flow de Onboarding — develOP

> Auditado el 2026-04-27. Código verificado contra las fuentes, sin modificaciones al flow.

---

## Resumen del estado

| Check | Estado |
|---|---|
| Ruta `/bienvenida` existe | ✅ `src/app/bienvenida/page.tsx` |
| Layout protege la ruta | ✅ Requiere sesión activa |
| Middleware redirige correctamente | ✅ `src/proxy.ts` |
| `completeOnboardingAction` escribe en BD | ✅ `onboardingCompleted: true` |
| Redirect post-completion a `/dashboard` | ✅ `router.push('/dashboard')` |
| Re-visita de `/bienvenida` tras completar redirige a `/dashboard` | ✅ Doble guardia (page + middleware) |
| Sin riesgo de redirect loop | ✅ Verificado (ver análisis abajo) |

---

## Ubicación de archivos

```
src/app/bienvenida/
├── layout.tsx                         # Layout wrapper (guard de sesión)
├── page.tsx                           # Server Component (guard de org + redirect)
├── _actions/
│   └── complete-onboarding.ts         # Server Action activa del wizard
└── _components/
    ├── BienvenidaWizard.tsx           # Orchestrador del wizard (client component)
    ├── Step1Empresa.tsx               # Step 1 — Datos de la empresa
    ├── Step2Conexiones.tsx            # Step 2 — Conexiones técnicas
    └── Step3Tour.tsx                  # Step 3 — Tour del dashboard
```

> [!WARNING]
> **Archivo legacy a deprecar:** `src/actions/onboarding-actions.ts` contiene una segunda
> `completeOnboardingAction` con firma distinta (brand profile, credenciales de acceso).
> Esta función **ya no está conectada al wizard activo** y debe eliminarse o documentarse
> explícitamente como obsoleta para evitar confusión futura.

---

## Trigger de redirect a `/bienvenida`

El redirect se dispara desde **tres capas independientes**, en orden de prioridad:

### 1. Middleware Edge (`src/proxy.ts`)
```
Matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/bienvenida']
```

Reglas relevantes:
- Si **no autenticado** + ruta protegida → `/login`
- Si **autenticado en `/login`** + `!onboardingCompleted` → `/bienvenida`
- Si **autenticado en `/bienvenida`** + `onboardingCompleted === true` → `/dashboard`
- Si **SUPER_ADMIN** en `/bienvenida` (sin impersonación) → `/admin`

El flag `onboardingCompleted` en el middleware **se lee del JWT**, no de la BD. Se actualiza en el siguiente refresh de token (`trigger === 'update'`).

### 2. Server Component de la página (`src/app/bienvenida/page.tsx`)
```ts
if (org.onboardingCompleted && org.companyName?.trim()) {
  redirect('/dashboard')
}
```
Segunda barrera: lee directo de BD. Si el JWT está desactualizado pero la BD ya dice `true`, aquí se redirige igual.

### 3. Dashboard layout (`src/app/(protected)/dashboard/layout.tsx`)
```ts
if ((!client.onboardingCompleted || !client.companyName?.trim()) && !preview && !isBienvenida) {
  redirect('/bienvenida')
}
```
Tercer guardia: evita acceso al dashboard si el onboarding está incompleto.

---

## Análisis de riesgo de redirect loop

**¿Por qué no hay loop?**

| Condición | Resultado |
|---|---|
| Usuario en `/bienvenida` + `onboardingCompleted: false` | → Permite pasar (middleware hace `NextResponse.next()`) |
| Usuario en `/bienvenida` + `onboardingCompleted: true` | → Redirige a `/dashboard` (middleware) |
| Dashboard layout revisa `isBienvenida` | La ruta `/bienvenida` no está dentro de `(protected)/dashboard`, por lo que el dashboard layout **nunca se ejecuta** para `/bienvenida` |

El chequeo `isBienvenida` en el dashboard layout es actualmente **código muerto** (no puede ser `true` porque `/bienvenida` no está bajo el route group `(protected)`). Es seguro pero innecesario.

> [!NOTE]
> El `onboardingCompleted` en el JWT se recalcula en `auth.ts` usando `getUserAccessState()`, que
> evalúa `organization.onboardingCompleted && organization.companyName?.trim()`. Esto significa
> que incluso sin un `session.update()` explícito, el próximo `jwt()` callback refrescará el flag.

---

## Steps del wizard (3 steps)

### Step 1 — Tu empresa (`Step1Empresa.tsx`)

**Campos capturados:**

| Campo | Tipo | Requerido | Se guarda en |
|---|---|---|---|
| `companyName` | `string` | ✅ Sí | `Organization.companyName` |
| `contactEmail` | `string (email)` | No | ❌ **No se persiste** (ver nota) |
| `whatsapp` | `string` | No | `Organization.whatsapp` |
| `rubro` | enum (8 opciones) | No | `ClientBrandProfile.targetAudience` como string `"Rubro: automotive"` |

> [!WARNING]
> **Bug conocido (no arreglar en este sprint):** El campo `contactEmail` del Step 1 se
> muestra en el formulario y se valida en el schema Zod, pero **no existe como columna en
> `Organization`**. El action incluye un TODO: `// TODO: Agregar contactEmail a Organization`.
> El valor se descarta silenciosamente al guardar. La UI debería o bien ocultarlo o mostrar
> un aviso de que se usará el email de la cuenta.

Opciones de rubro disponibles:
- `automotive` — Concesionaria / Automotor
- `health` — Salud / Consultorio
- `fitness` — Gimnasio / Fitness
- `beauty` — Estética / Peluquería
- `gastronomy` — Gastronomía / Restaurante
- `retail` — Comercio / Retail
- `real-estate` — Inmobiliaria
- `other` — Otro

### Step 2 — Conexiones técnicas (`Step2Conexiones.tsx`)

**Campos capturados:**

| Campo | Tipo | Requerido | Se guarda en |
|---|---|---|---|
| `ga4MeasurementId` | `string` | No | `Organization.analyticsPropertyId` |

**WhatsApp Business:** placeholder visual (opacidad 60%), sin input funcional. Mensaje: *"Próximamente — lo configuramos juntos en tu primera reunión."*

El step tiene botón "Saltear por ahora" que avanza sin persistir nada.

### Step 3 — Tour del dashboard (`Step3Tour.tsx`)

Sin inputs. Solo muestra las 4 zonas del dashboard:
1. Métricas en tiempo real
2. Estado de tu proyecto
3. Comunicación directa
4. Reportes ejecutivos

Al presionar "Entrar al dashboard" se dispara `handleComplete()` → `completeOnboardingAction()` → `router.push('/dashboard')` + `router.refresh()`.

---

## Server Action activa: `completeOnboardingAction`

**Archivo:** `src/app/bienvenida/_actions/complete-onboarding.ts`

**Schema Zod:**
```ts
CompleteOnboardingSchema = z.object({
  companyName: z.string().min(2),
  contactEmail: z.string().email().optional(),  // ⚠️ Capturado pero no persistido
  whatsapp: z.string().optional(),
  ga4MeasurementId: z.string().optional(),
  rubro: z.enum([...8 rubros]).optional(),
})
```

**Escrituras en BD:**
```ts
// Organization
prisma.organization.update({
  companyName,
  whatsapp,
  analyticsPropertyId: ga4MeasurementId,  // ← mapeo de campo
  onboardingCompleted: true,               // ← el flag clave
})

// ClientBrandProfile (solo si rubro está presente)
prisma.clientBrandProfile.upsert({
  targetAudience: `Rubro: ${rubro}`,
})
```

**Post-completion:**
```ts
revalidatePath('/dashboard', 'layout')
return { ok: true }
// El wizard hace router.push('/dashboard') + router.refresh()
```

> [!NOTE]
> El `revalidatePath('/dashboard', 'layout')` invalida el cache del dashboard layout, lo que
> fuerza a que el próximo request lea el `onboardingCompleted: true` fresco de BD. El JWT
> se actualizará en el próximo callback (no inmediatamente), pero el middleware usará la
> versión desactualizada del token hasta el próximo login o refresh manual. En la práctica
> esto no produce problemas porque el `router.refresh()` del wizard fuerza un re-render
> que dispara el jwt callback con `trigger === 'update'`.

---

## Cómo resetear onboarding para test manual

Usando Prisma Studio o una query directa:

```sql
UPDATE "Organization"
SET "onboardingCompleted" = false,
    "companyName" = NULL
WHERE "id" = '<organization-id>';
```

O con tsx/ts-node:
```ts
await prisma.organization.update({
  where: { id: 'TU_ORG_ID' },
  data: { onboardingCompleted: false, companyName: null }
})
```

Después de esto, **cerrar sesión y volver a loguearse** para que el JWT se regenere con
`onboardingCompleted: false`. Si no se cierra sesión, el middleware seguirá usando el JWT
anterior y no redirigirá.

---

## Providers de autenticación soportados

| Provider | Redirect post-login |
|---|---|
| Credentials (email + password) | Pre-calcula `redirectTo` leyendo BD antes de `signIn()` |
| Magic Link (Resend) | Hardcodeado a `/dashboard` (❌ no pasa por lógica de onboarding) |
| Google OAuth | Hardcodeado a `/dashboard` (❌ no pasa por lógica de onboarding) |

> [!WARNING]
> **Inconsistencia:** Los providers Magic Link y Google OAuth no evalúan si el usuario
> necesita onboarding. Redirigen a `/dashboard`, donde el layout los atrapa y redirige a
> `/bienvenida`. El UX funciona correctamente, pero el redirect es menos directo que con
> Credentials. Documentado como deuda técnica.

---

## Datos que captura actualmente

| Dato | Dónde | Requerido |
|---|---|---|
| `companyName` | `Organization.companyName` | ✅ |
| `whatsapp` | `Organization.whatsapp` | No |
| `ga4MeasurementId` | `Organization.analyticsPropertyId` | No |
| `rubro` | `ClientBrandProfile.targetAudience` (string "Rubro: X") | No |

---

## Datos que NO captura todavía

| Dato | Campo sugerido | Motivo de ausencia |
|---|---|---|
| `contactEmail` | `Organization.contactEmail` (no existe aún) | Campo en el form pero no persistido — TODO en action |
| WhatsApp Business API | Desconocido | Placeholder en UI; se configura "en la primera reunión" |
| Logo de la empresa | `Organization.logoUrl` | Presente en action legacy (`saveOnboardingProfile`), ausente en wizard activo |
| `primaryColor` / `secondaryColor` / `toneOfVoice` | `ClientBrandProfile.*` | Solo en action legacy, no en wizard activo |
| Credenciales de dominio/hosting | `ClientAsset` | Solo en action legacy |
| Credenciales de redes sociales | `ClientAsset` | Solo en action legacy |

---

## TODO — Futura extensión del wizard

### Prioridad Alta

- [ ] **Persistir `contactEmail`**: Agregar columna `Organization.contactEmail` (o usar el campo existente de `AgencySettings`) y escribirlo en `completeOnboardingAction`. Actualmente se descarta silenciosamente.

- [ ] **Deprecar `src/actions/onboarding-actions.ts`**: El archivo legacy tiene dos funciones ya no conectadas al wizard activo. Debe eliminarse o marcarse con `@deprecated` para evitar que se reutilice por error.

### Prioridad Media

- [ ] **Persistir `rubro` correctamente**: Actualmente se guarda como string `"Rubro: automotive"` en `ClientBrandProfile.targetAudience`. Sería mejor agregar una columna `Organization.rubro` con el enum definido, o al menos una columna `ClientBrandProfile.rubroKey` tipada.

- [ ] **Onboarding diferenciado por rubro**: Después de seleccionar el rubro, mostrar módulos premium recomendados para ese vertical (usando el catálogo `PremiumModule.validRubros`).

- [ ] **Consistencia de providers OAuth/Magic Link**: Hacer que Google y Resend evalúen `onboardingCompleted` antes de determinar el `redirectTo`, en lugar de depender del redirect del dashboard layout.

### Prioridad Baja

- [ ] **Step adicional para configuraciones técnicas**: Evaluar si agregar un Step 4 opcional con:
  - Conexión Google Search Console (Site URL)
  - GA4 Measurement ID (ya está en Step 2, mover aquí)
  - WhatsApp Business (cuando esté disponible la integración)
  - Este step solo debería mostrarse si el plan del cliente incluye módulos que lo requieran.

- [ ] **Recuperación del onboarding**: Si el usuario cierra el wizard a mitad de camino, los datos de Step 1 se pierden (no se persisten hasta el Step 3). Considerar auto-save parcial en Step 1 (`companyName` + `whatsapp`).

- [ ] **Limpieza del chequeo `isBienvenida`** en `dashboard/layout.tsx`: El código `const isBienvenida = pathname.startsWith('/bienvenida')` es código muerto porque `/bienvenida` no está dentro del route group `(protected)`. Puede eliminarse sin riesgo.

---

## Flujo completo (diagrama)

```
Usuario → /login
    │
    ├── Credentials: pre-calcula redirectTo en BD
    │       ├── SUPER_ADMIN → /admin
    │       ├── needsOnboarding → /bienvenida
    │       └── onboarding OK → /dashboard
    │
    ├── Google / Magic Link → /dashboard (siempre)
    │       └── dashboard layout atrapa y redirige a /bienvenida si incompleto
    │
    └── /bienvenida
            │
            ├── layout.tsx — guard: !session → /login
            ├── page.tsx — guard: !org → /login
            │             guard: onboardingCompleted && companyName → /dashboard
            │
            └── BienvenidaWizard (3 steps)
                    │
                    ├── Step 1: companyName* | contactEmail | whatsapp | rubro
                    ├── Step 2: ga4MeasurementId (optional, skippable)
                    └── Step 3: Tour → "Entrar al dashboard"
                                │
                                └── completeOnboardingAction()
                                        │
                                        ├── DB: Organization.onboardingCompleted = true
                                        ├── DB: Organization.companyName, whatsapp, analyticsPropertyId
                                        ├── DB: ClientBrandProfile.targetAudience (si rubro)
                                        ├── revalidatePath('/dashboard', 'layout')
                                        └── router.push('/dashboard') + router.refresh()
```
