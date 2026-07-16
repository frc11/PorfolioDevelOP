# Auditoría dirigida PD-1 — cifrado de credenciales de onboarding (READ-ONLY)

Fecha: 2026-07-10. Preparación del/los sprint(s) PD-1. NO es re-auditoría integral: 5 preguntas
para planificar sin romper datos vivos. Método: workflow de 5 subagentes Explore read-only en
paralelo (P1, P2, P4.1+P5, y P3 con doble barrido independiente por código-Prisma y por
marcador/superficie-UI), seguido de verificación sitio-por-sitio de cada candidato P3 y un
crítico de completitud con 12 ángulos adicionales. P4.2 se corrió en el hilo principal como
única consulta a Neon: un `prisma.clientAsset.count()` (solo lectura, solo el número).
Cero cambios al repo salvo este .md. No se stageó ni commiteó nada; no se tocó el árbol
sucio de la corrida paralela (src/modules/chatbot/*).

---

## P1 — Helper de cifrado existente (patrón a espejar)

**Ruta:** `src/modules/chatbot/server/crm/encryptSecret.ts` — 98 líneas, archivo completo verbatim:

```ts
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

/**
 * B5.8 — Cifrado de secrets opcionales del CrmIntegration (header de auth a n8n).
 *
 * AES-256-GCM con key en env CRM_SECRET_KEY (32 bytes hex = 64 chars).
 * GCM provee autenticación además de cifrado: si alguien modifica el ciphertext
 * en la DB, el decrypt falla — no devuelve un secret distinto en silencio.
 *
 * El secret JAMÁS se loguea ni en plano ni cifrado. Solo se decrypta dentro de
 * postToN8n.ts justo antes del fetch, en memoria.
 */

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH_BYTES = 12 // recomendado para GCM
const KEY_LENGTH_BYTES = 32

export class CrmEncryptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CrmEncryptionError'
  }
}

function getKey(): Buffer {
  const raw = process.env.CRM_SECRET_KEY
  if (!raw) {
    throw new CrmEncryptionError(
      'CRM_SECRET_KEY no está configurada. Pedile a develOP que la configure.'
    )
  }
  let key: Buffer
  try {
    key = Buffer.from(raw, 'hex')
  } catch {
    throw new CrmEncryptionError('CRM_SECRET_KEY no es hex válido')
  }
  if (key.length !== KEY_LENGTH_BYTES) {
    throw new CrmEncryptionError(
      `CRM_SECRET_KEY debe ser de ${KEY_LENGTH_BYTES} bytes hex (${KEY_LENGTH_BYTES * 2} chars)`
    )
  }
  return key
}

/**
 * Indica si CRM_SECRET_KEY está configurada correctamente. Útil para la UI:
 * si no lo está, se deshabilita el campo de secret header con un tooltip.
 */
export function isCrmEncryptionConfigured(): boolean {
  try {
    getKey()
    return true
  } catch {
    return false
  }
}

export interface EncryptedSecret {
  encrypted: string // base64
  iv: string        // base64
  tag: string       // base64
}

export function encryptSecret(plaintext: string): EncryptedSecret {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new CrmEncryptionError('No se puede cifrar un valor vacío')
  }
  const key = getKey()
  const iv = randomBytes(IV_LENGTH_BYTES)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  }
}

export function decryptSecret(payload: EncryptedSecret): string {
  const key = getKey()
  const iv = Buffer.from(payload.iv, 'base64')
  const tag = Buffer.from(payload.tag, 'base64')
  const encrypted = Buffer.from(payload.encrypted, 'base64')

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}
```

**Derivación de key:** exclusivamente de `process.env.CRM_SECRET_KEY` (L26). Validación: ausente →
`CrmEncryptionError` (L27-31); `Buffer.from(raw, 'hex')` (L34); longitud exacta 32 bytes / 64 chars
hex (L38-42).

**Observación factual sobre la validación hex (L33-37):** `Buffer.from(raw, 'hex')` en Node NO
lanza ante hex inválido — trunca en silencio en el primer caracter no-hex. El `catch` de L35-37
rara vez se dispara; una key malformada cae en la práctica al chequeo de longitud (L38-42).

**Portabilidad a `src/lib/`:**
- Único import: `node:crypto` (builtin). Cero dependencias npm, cero imports internos de chatbot.
  Globals implícitos: `process.env` y `Buffer` (builtins de Node).
- Cero referencias a contexto de request (headers/session/cookies) ni a otros archivos de
  `chatbot/server`.
- **Conclusión factual: NO hay nada no-trivialmente portable.** El código es autocontenido.
- Matices de acoplamiento semántico (no bloquean, pero están ligados a CRM): nombre de env var
  hardcodeado `CRM_SECRET_KEY` (L26) en 3 mensajes de error; clase `CrmEncryptionError` (L18-23);
  docstring atado a "B5.8 / CrmIntegration / postToN8n.ts" (L3-12).
- Importadores actuales (un move físico los rompería; una réplica del patrón en `src/lib/` no
  los toca):
  1. `src/modules/chatbot/server/crm/postToN8n.ts:1` (import) y `:83` (`decryptSecret(input.encryptedSecret.value)`)
  2. `src/modules/chatbot/server/crm/index.ts:20-25` (barrel reexport)
  3. `src/modules/chatbot/server/admin/integrations/saveCrmIntegration.ts:11` (import) y `:113` (`encryptSecret(data.secret)`)
  4. `scripts/b58-smoke.ts:16-20` (import por ruta directa; llamadas en L136, 141, 152, 164, 175)
- Referencias no-código: `.env.example:233`, `docs/bitacora-roadmap.md` (5 menciones),
  `docs/microaudit-frozen-frontera-CO.md`, `docs/sprints/p3-a-1-gbp-connection.md:89`.

---

## P2 — Punto de ESCRITURA (lo que PD-1 arregla)

**Archivo:** `src/actions/onboarding-actions.ts` — 149 líneas. Drift vs. referencia previa: el
guardado está en L110-132 repartido en DOS `create` (dominio L110-120, redes L122-132);
`OnboardingData` es una `interface` en L27-34.

### (a) Bloques de guardado — VERBATIM

Dos creaciones de `ClientAsset`, dentro de una `prisma.$transaction` (L88-139).

**Bloque 1 — Dominio/Hosting, L110-120:**
```ts
      // 2. Guardar Credenciales Técnicas en Bóveda si existen
      if (data.domainCredentials) {
        await tx.clientAsset.create({
          data: {
            organizationId,
            name: 'Credenciales de Dominio/Hosting',
            url: 'ENCRIPTADO_EN_TEXTO',
            type: 'ACCESS',
            description: data.domainCredentials
          }
        })
      }
```

**Bloque 2 — Redes Sociales, L122-132:**
```ts
      if (data.socialCredentials) {
        await tx.clientAsset.create({
          data: {
            organizationId,
            name: 'Credenciales de Redes Sociales',
            url: 'ENCRIPTADO_EN_TEXTO',
            type: 'ACCESS',
            description: data.socialCredentials
          }
        })
      }
```

Hechos confirmados:
- **Marcador exacto:** `url: 'ENCRIPTADO_EN_TEXTO'` (L115 y L127). Es solo un placeholder en
  `url` — NO hay cifrado real. La credencial va en texto plano a `description`.
- **Construcción de `description`:** asignación directa del campo crudo (sin template, sin
  JSON.stringify, sin concatenación): `description: data.domainCredentials` /
  `description: data.socialCredentials`.
- **`type: 'ACCESS'`** en ambos (L116, L128). Llamada: `tx.clientAsset.create` (uno por asset,
  NO `createMany`).

### (b) Shape completo de OnboardingData — VERBATIM (L27-34)

```ts
interface OnboardingData {
  primaryColor?: string
  secondaryColor?: string
  toneOfVoice?: string
  targetAudience?: string
  domainCredentials?: string
  socialCredentials?: string
}
```

Interface TS pura (no `type`, no schema Zod). Todos los campos `?: string`.

### (c) ¿Pasa por Zod hoy?

**NO para las credenciales.** El archivo importa zod (L8) y tiene UN schema
(`OnboardingProfileSchema`, L19-25, valida solo `companyName` y `logoUrl`) con UN `.safeParse`
(L48-51) — pero pertenece a la OTRA action, `saveOnboardingProfile` (L38-75).
**`completeOnboardingAction(data: OnboardingData)` (L79-148), la que escribe credenciales, NO
valida su input con Zod**: cero `.parse`/`.safeParse` sobre `data`; el único guard es truthy
(`if (data.domainCredentials)`).

### (d) Campos de credenciales persistidos — lista exhaustiva

| Campo en `OnboardingData` | Persiste en | Valores fijos del asset |
|---|---|---|
| `domainCredentials?: string` (L32) | `ClientAsset.description` (L117) | `name: 'Credenciales de Dominio/Hosting'`, `url: 'ENCRIPTADO_EN_TEXTO'`, `type: 'ACCESS'` |
| `socialCredentials?: string` (L33) | `ClientAsset.description` (L129) | `name: 'Credenciales de Redes Sociales'`, `url: 'ENCRIPTADO_EN_TEXTO'`, `type: 'ACCESS'` |

Son los ÚNICOS 2 campos de credenciales. Los otros 4 (`primaryColor`, `secondaryColor`,
`toneOfVoice`, `targetAudience`) van a `clientBrandProfile.upsert` (L91-106), no son credenciales.
No hay campos separados por plataforma de red social ni hosting aparte.

### (e) Otros writes / cantidad / sesión

- Único punto de escritura de `ClientAsset` en el archivo (L111 y L123, ambos dentro de
  `completeOnboardingAction`). Crea hasta 2 assets (uno por `if`).
- **Verificación de sesión débil:** llama `const session = await auth()` (L80) pero `session`
  NO se usa después — ni chequeo de sesión ni de rol. El único gate es
  `resolveOrgId()` (importado de `@/lib/preview`, L5):

```ts
export async function completeOnboardingAction(data: OnboardingData) {
  const session = await auth()
  const organizationId = await resolveOrgId()

  if (!organizationId) {
    return { success: false, error: 'No autorizado' }
  }
```

- **Hallazgo del verificador P3 (cross-check):** dentro de `src/` NO se encontró ningún caller
  de `completeOnboardingAction` — el wizard usa `saveOnboardingProfile` (misma file, L38), que
  NO escribe credenciales. La ruta de escritura de credenciales parece **no cableada hoy**
  (hecho verificado por lectura; la clasificación es tuya). Sin embargo, existen filas vivas
  con el marcador (ver P4.2), es decir la action corrió en algún momento.

---

## P3 — Puntos de LECTURA (lo que NO hay que romper)

Método: doble barrido independiente (por código Prisma / por marcador+superficie UI) → 17
candidatos → verificación sitio-por-sitio con dedup → 15 registros únicos → crítico de
completitud con 12 ángulos extra → **0 lectores nuevos, `complete=true`**.

### Lectores CONFIRMADOS de `description` (4 sitios, 2 superficies) — cada uno debe descifrar si se cifra la escritura

| # | Ruta:línea | Qué hace |
|---|---|---|
| 1 | `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:65` — `VaultPage`, `prisma.clientAsset.findMany` | **CLIENTE.** findMany por `organizationId` SIN `select` → trae la fila completa incl. `description`. Evidencia: `const assets = await prisma.clientAsset.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' },` |
| 2 | `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:175` — render `{asset.description}` | **Punto exacto de consumo cliente.** Rinde el string crudo en un `<p>` con `line-clamp-2` (recorte solo visual — el texto completo va al DOM). Sin máscara ni toggle. Aplica a cualquier `type`, incluido `ACCESS`. Evidencia: `{asset.description && (<p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">{asset.description}` |
| 3 | `src/app/(protected)/admin/clients/[clientId]/_components/tabs/VaultTab.tsx:13` — `VaultTab`, `prisma.clientAsset.findMany` | **ADMIN.** findMany por `organizationId` (= `clientId` de la ruta; se monta en `page.tsx:90` para el tab 'vault') SIN `select`. Evidencia: `const assets = await prisma.clientAsset.findMany({ where: { organizationId: clientId }, orderBy: { createdAt: 'desc' },` |
| 4 | `src/app/(protected)/admin/clients/[clientId]/_components/tabs/VaultTab.tsx:52` — render `{asset.description}` | **Punto exacto de consumo admin.** Rinde `description` crudo en `<p>` con `line-clamp-2`, sin máscara, dentro del `<a href={asset.url}>`. Evidencia: `{asset.description && (<p className="line-clamp-2 text-xs text-zinc-400">{asset.description}</p>)}` |

**Si se cifra la escritura sin descifrar en estas 2 superficies (bóveda cliente + tab Bóveda
admin), ambas muestran texto cifrado.** No hay más lectores de `description`.

### Lectores METADATA-ONLY (8) — leen ClientAsset pero NO tocan `description`; cifrar no los rompe

| Ruta:línea | Qué lee |
|---|---|
| `src/app/(protected)/dashboard/cuenta/boveda/page.tsx:226` | `{isAccess && <VaultRevealButton url={asset.url} />}` — pasa `url`, no description |
| `src/components/dashboard/VaultRevealButton.tsx:9` | Toggle Eye/EyeOff + copy sobre la prop `url` (enmascara con bullets L74, revela L99, `clipboard.writeText(url)` L36). NO recibe description |
| `src/lib/alerts.ts:225` | `organization.findMany > clientAssets: { select: { updatedAt: true }, take: 1 }` — staleness |
| `src/lib/alerts.ts:44` | Tipo `InactiveOrganization.clientAssets: Array<{ updatedAt: Date }>` (anotación, consumida en `getLastActivityDate` L99) |
| `src/app/(protected)/admin/clients/[clientId]/page.tsx:58` | `_count.clientAssets` en `organization.findFirst` (solo conteo) |
| `src/app/(protected)/admin/clients/[clientId]/_components/ClientHeader.tsx:125` | `<StatChip label="Archivos" value={client._count.clientAssets} />` |
| `src/modules/chatbot/server/admin/hardDeleteClient.ts:50` | `_count` en resumen de borrado (árbol de la corrida paralela; incluido por completitud) |
| `scripts/_db-cleanup-inspect.mjs:41` | `_count` en script de inspección |

**Observación del verificador:** para los assets de onboarding, el ÚNICO toggle de ocultamiento
(`VaultRevealButton`) enmascara el placeholder `'ENCRIPTADO_EN_TEXTO'` (que está en `url`),
mientras la credencial real (`description`) ya se rinde en claro arriba (bóveda L175).

### Write paths detectados durante el barrido (no son lectores, pero son scope de PD-1)

| Ruta:línea | Qué escribe |
|---|---|
| `src/actions/onboarding-actions.ts:111` y `:123` | Los 2 `create` de P2 (credenciales onboarding → `description` en claro) |
| `src/actions/agency-actions.ts:103` (`createClientAssetAction`, guard `SUPER_ADMIN` L98-101) | `description: data.description` directo (L109), cualquier `AssetType` — sin cifrar |
| `src/components/admin/managers/VaultManager.tsx:85` | Form admin "Subir a Bóveda": textarea con placeholder `"Contraseña o instrucciones..."` → `createClientAssetAction` (L25). Confirma que `description` es donde el admin pega credenciales en claro |

### Crítico de completitud — 12 ángulos, todos NEGATIVOS (`complete: true`)

1. `src/emails/` (ActionRequiredEmail, TicketReplyEmail): 0 matches de asset/credencial/vault/boveda.
2. PDF/reportes (`src/lib/reports/` client-monthly, executive-weekly): el único `.description` es `insight.description` (`ChatbotInsight`, entidad distinta) en `ClientMonthlyReportPdf.tsx:277`.
3. API routes (35 rutas): ninguna serializa/devuelve ClientAsset.
4. `src/lib/bulk-actions.ts` y exportadores: 0 matches.
5. `prisma/seed.ts:672` es ESCRITOR (upsert); `scripts/` solo `_db-cleanup-inspect.mjs` (_count, ya listado).
6. `tests/`: 0 matches de clientAsset/vault/boveda.
7. include/select anidado desde Organization/User: solo los 3 ya listados (alerts, hardDeleteClient, admin page) — ninguno arrastra `description`; no hay include completo de la relación.
8. `.description` sobre variables asset: solo bóveda page y VaultTab (ya listados); el resto es project/task/insight/feature (entidades distintas).
9. `getOrganizationData`: el símbolo no existe; los 4 archivos con `clientAssets` ya están listados.
10. Raw SQL runtime (`$queryRaw`/`$executeRaw`/tabla `"ClientAsset"`): solo DDL en `prisma/migrations`; nada en runtime.
11. Inventario total `prisma.clientAsset.*`: exactamente 5 sitios — 2 findMany lectores (bóveda:65, VaultTab:13) + 3 create escritores. No hay findFirst/findUnique/aggregate.
12. `VaultManager.tsx` completo: write-only, no lee description almacenada.

---

## P4 — Datos VIVOS en texto plano

### 4.1 — Modelo `ClientAsset` completo (verbatim)

`prisma/schema.prisma:731-744` (líneas post-edición del sprint de índices CO-5/6 de hoy):

```prisma
model ClientAsset {
  id          String    @id @default(cuid())
  name        String
  url         String
  type        AssetType @default(OTHER)
  description String?   @db.Text
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
}
```

Enum del campo `type` — `prisma/schema.prisma:96-103`:

```prisma
enum AssetType {
  DOCUMENT
  IMAGE
  BRANDBOOK
  LOGO
  ACCESS
  OTHER
}
```

**No hay valor "CREDENTIAL" explícito**: el discriminador de assets-credencial en el código es
`type: 'ACCESS'`. Los demás valores se usan para assets no-credencial. Default `OTHER`.

### 4.2 — Conteo de filas con el marcador (única consulta a DB, solo lectura)

```
prisma.clientAsset.count({ where: { url: 'ENCRIPTADO_EN_TEXTO' } })  →  2
```

**Resultado: 2 filas vivas** con el marcador → **SÍ hay backfill de datos existentes** (2
credenciales en texto plano en `description` hoy en Neon). Nota cruzada con P2(e): aunque
`completeOnboardingAction` no tiene caller cableado hoy, estas filas prueban que corrió en
algún momento. Nota adicional: este conteo NO captura el asset `ACCESS` del seed (que guarda
credenciales en `url` con otro formato, ver P5.2) — el marcador solo identifica los assets
creados por onboarding.

---

## P5 — Env y frontera de columnas

### 5.1 — `CRM_SECRET_KEY` e inventario de claves

Bloque completo en `.env.example:225-234` (la var está comentada — línea 234):

```
# ============================================================
# CRM INTEGRATION — Cifrado de secrets del webhook n8n (B5.8)
# ============================================================
# OPCIONAL · Key para cifrar el header de auth opcional del webhook n8n del cliente
# (ej. "X-Webhook-Secret" → valor cifrado AES-256-GCM).
# Formato: 32 bytes en hex (64 chars). Generar con: openssl rand -hex 32
# Si falta, la UI deshabilita el campo de secret header (el cliente puede igual
# configurar la URL del webhook, solo sin header de auth).
# Verificado en: src/modules/chatbot/server/crm/encryptSecret.ts
# CRM_SECRET_KEY=
```

**¿Existe otra KEY DE CIFRADO? NO.** `CRM_SECRET_KEY` es la única clave de cifrado simétrico
del repo (`ENCRYPTION` = 0 coincidencias en .env.example y en `process.env.*`). Inventario
completo del resto, clasificado:

- **Firma HMAC / sesión:** `AUTH_SECRET` (`.env.example:55`), `NEXTAUTH_SECRET` (`:77`,
  comentada, alias legacy), `IMPERSONATION_SECRET` (`:82`), `EMAIL_UNSUBSCRIBE_SECRET` (`:162`,
  comentada; fallback a AUTH_SECRET en `src/lib/email/unsubscribe-token.ts:8-9`),
  `OAUTH_STATE_SECRET` (`src/lib/security/oauth-state.ts:28-29`, fallback a AUTH_SECRET —
  **no declarada en .env.example**).
- **Salt de hashing:** `CHATBOT_IP_HASH_SALT` (`:124`; `src/modules/chatbot/server/safety/ipHash.ts:13`).
- **Bearer de autenticación:** `CRON_SECRET` (`:223`; 7 rutas `/api/cron/*`).
- **OAuth client secrets / API keys:** `GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET` (`:179`),
  `TIENDANUBE_CLIENT_SECRET` (`:188`), `ANTHROPIC_API_KEY`, `N8N_API_KEY`,
  `GOOGLE_PAGESPEED_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_KEY`.

### 5.2 — Frontera de columnas

**Tipo actual de `description`:** `prisma/schema.prisma:736` →
```prisma
  description String?   @db.Text
```
(nullable, `@db.Text` en Postgres).

**TODOS los write-sites de `ClientAsset` (4, en 3 archivos):**

| # | Sitio | `type` | `description` | `url` | ¿Credencial? |
|---|---|---|---|---|---|
| 1 | `src/actions/onboarding-actions.ts:111` (`tx.create`) | `'ACCESS'` | `data.domainCredentials` (credencial en claro) | `'ENCRIPTADO_EN_TEXTO'` (placeholder) | SÍ |
| 2 | `src/actions/onboarding-actions.ts:123` (`tx.create`) | `'ACCESS'` | `data.socialCredentials` (credencial en claro) | `'ENCRIPTADO_EN_TEXTO'` | SÍ |
| 3 | `src/actions/agency-actions.ts:103` (`createClientAssetAction`, solo SUPER_ADMIN) | `data.type` (cualquiera) | `data.description` (texto libre admin) | `data.url` (texto libre) | Depende del admin |
| 4 | `prisma/seed.ts:672` (upsert, array `seed.ts:640-669`) | LOGO / BRANDBOOK / ACCESS / DOCUMENT | Texto descriptivo plano (L646, 653, 660, 667) | Ver nota abajo | Solo `assetHosting` |

**Usos NO-credencial de `description` — SÍ existen** (se romperían si el formato de
`description` cambia globalmente): seed con `LOGO`/`BRANDBOOK`/`DOCUMENT` guarda texto
descriptivo plano en `description`; `createClientAssetAction` permite cualquier `type` con
`description` libre. Es decir, **`description` no es exclusivamente credencial** — un cambio de
formato acotado a credenciales tendría que discriminar por `type === 'ACCESS'`.

**Nota crítica del seed (`assetHosting`, `seed.ts:655-661`):** en el asset `ACCESS` del seed las
credenciales están en **`url`** (`'cPanel: sanmiguel.com.ar | Usuario: admin_sm | Pass: ****'`)
y `description` es solo el rótulo (`'Acceso al panel de hosting'`) — es decir, incluso dentro de
`type: 'ACCESS'` conviven dos layouts distintos (onboarding: credencial en `description`; seed:
credencial en `url`). Hecho reportado; la decisión no es de esta corrida.

**Validación/transformación de `description` en los write-sites: NINGUNA.** onboarding sin Zod
(solo guard truthy); `agency-actions.ts:94-96` firma TS sin Zod, `description` directo (L109),
único check rol `SUPER_ADMIN` (L99); seed hardcodeado.

**¿Campos libres para iv/tag?** NO. Todos los campos actuales del modelo tienen propósito
(`id`, `name`, `url`, `type`, `description`, `createdAt`, `updatedAt`, `organizationId`).
Para replicar el patrón `EncryptedSecret` (`encrypted`/`iv`/`tag`) haría falta **agregar
columnas** o serializar iv+tag+ciphertext dentro del propio `description`. Hecho reportado;
la elección entre ambas es la decisión de diseño de PD-1, fuera de esta corrida.
