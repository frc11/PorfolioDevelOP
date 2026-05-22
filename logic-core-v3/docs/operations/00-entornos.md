# Entornos dev / prod — Aislamiento con Neon branching

> **Regla de oro**: dev y prod NUNCA comparten base de datos. Toda operación destructiva (seeds, migrate reset, deletes de prueba) corre **siempre** contra la branch `dev`, jamás contra `main`.

---

## Mapa del entorno

| Entorno | Dónde corre | Archivo de config | Branch de Neon |
|---|---|---|---|
| **Dev local** | `npm run dev` en la máquina de Franco | `.env.local` + `.env` | `dev` (aislada, copia de `main`) |
| **Prod** | Netlify (build + runtime) | Variables del dashboard de Netlify | `main` (autoritativa, datos reales) |

### Por qué dos archivos local (`.env` + `.env.local`)

- **Next.js dev** prioriza `.env.local` sobre `.env` (carga ambos, `.env.local` gana).
- **Prisma CLI 6.x** lee `.env` por default — **no** mira `.env.local`. Si Franco corre `npx prisma migrate status` y `.env` apunta a prod, pega a prod aunque `.env.local` esté bien.

**Solución actual**: poner la URL de la branch `dev` en **ambos** archivos. Así Next.js, Prisma CLI y cualquier script con `dotenv.config()` apuntan al mismo lugar (dev).

### Por qué prod no tiene `.env.production` en el repo

Netlify inyecta las env vars desde su dashboard en tiempo de build. No commiteamos credenciales de prod en ningún archivo. Si alguna vez se necesita un `.env.production`, debe estar también en `.gitignore` (el patrón `.env*` ya lo cubre).

---

## Crear la branch `dev` en Neon (manual, Franco)

Neon permite crear branches instantáneas de la base. Son copias aisladas que comparten storage hasta que divergen (copy-on-write), así que crear una branch es gratis y rápido.

### Pasos en el dashboard de Neon

1. Login en https://console.neon.tech.
2. Abrir el proyecto develOP.
3. En el sidebar, ir a **Branches**.
4. Click **Create branch**.
5. Configurar:
   - **Name**: `dev`
   - **Parent**: `main`
   - **Include data up to**: `Now` (clonar el estado actual; alternativa: timestamp específico).
   - **Compute**: dejar la opción default (compute compartido) salvo que quieras un endpoint separado.
6. Click **Create branch**. Tarda segundos.
7. Una vez creada, en la página de la branch `dev`:
   - Click en **Connection details** (o el botón "Connection string").
   - Seleccionar **Pooled connection** (terminada en `-pooler.sa-east-1...`).
   - Copiar el string completo. Debe verse así:
     ```
     postgresql://neondb_owner:<password>@ep-XXXX-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
     ```

### Pegar el string en local

1. Abrir `logic-core-v3/.env.local`.
2. Reemplazar `__NEON_DEV_BRANCH_URL__` por el string copiado de Neon.
3. Abrir `logic-core-v3/.env`.
4. Reemplazar `__NEON_DEV_BRANCH_URL__` por el **mismo** string (el de la branch dev).

> ⚠️ Verificar que ninguno de los dos archivos quede commiteado: ambos están en `.gitignore` por el patrón `.env*`. Correr `git status` después y confirmar que no aparecen.

---

## Verificación (sin escribir a la base)

Después de pegar el string, correr desde `logic-core-v3/`:

```bash
npx prisma migrate status
```

Resultado esperado:

- Resuelve contra la branch `dev`.
- Reporta el estado de migraciones de esa branch (debería estar igual que prod si recién la cloraste).
- **Cero drift**: las migraciones aplicadas tienen que coincidir con las del filesystem (`prisma/migrations/`).

Si reporta drift, **frenar** y revisar contra qué branch está pegando antes de aplicar nada.

---

## Workflow normal una vez separado

| Acción | Branch que toca | Cómo |
|---|---|---|
| Cambiar schema en local | `dev` | Editar `schema.prisma`, correr `npx prisma migrate dev --name xxx` |
| Ver estado de migraciones local | `dev` | `npx prisma migrate status` |
| Aplicar migraciones a prod | `main` | Netlify lo hace en build (`prisma migrate deploy` en el script de build) o se corre manualmente con `DATABASE_URL` apuntando a `main` |
| Seedear datos de prueba | `dev` | `npm run seed:agency-os` con `.env` apuntando a dev (default) |
| Tirar abajo y recrear datos de dev | `dev` | En el dashboard de Neon: borrar la branch `dev` y crearla de nuevo desde `main`. **Nunca** correr `prisma migrate reset`. |

---

## Resetear la branch `dev` (cuando los datos se ensuciaron)

En vez de `migrate reset` (prohibido por CLAUDE.md), usamos branching:

1. Neon dashboard → **Branches** → seleccionar `dev`.
2. **Delete branch**.
3. Volver a **Create branch** con los mismos parámetros (parent `main`, name `dev`, include data up to `Now`).
4. Copiar el **nuevo** connection string (cambia el endpoint `ep-XXXX`).
5. Pegarlo en `.env` y `.env.local`.
6. Correr `npx prisma migrate status` para verificar.

Esto da una base limpia con los datos actuales de prod, en segundos, sin riesgo de tocar prod.

---

## Variables de entorno dev vs prod

La matriz completa de variables vive en [`docs/env-vars.md`](../env-vars.md). Acá solo las que **difieren** entre dev y prod, que es lo que importa para el split de branches.

| Variable | Dev (`.env` / `.env.local`) | Prod (Netlify env vars) | Comentario |
|---|---|---|---|
| `DATABASE_URL` | URL branch `dev` de Neon | URL branch `main` de Neon | core del split (B0.1) |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://<tu-dominio>` | NextAuth necesita la URL canónica |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://<tu-dominio>` | usada en muchos lugares para construir URLs absolutas |
| `GOOGLE_APPLICATION_CREDENTIALS` | path al archivo JSON (ej `./vertex-credentials.json`) | NO usar — usar `GOOGLE_VERTEX_CREDENTIALS_JSON` | Netlify no permite subir archivos |
| `GOOGLE_VERTEX_CREDENTIALS_JSON` | normalmente vacía (preferir archivo) | sí — JSON inline single-line | alternativa para entornos sin filesystem |
| `CHATBOT_IP_HASH_SALT` | opcional con warning | **obligatoria** | en prod arranca con error si vacía |
| `CRON_SECRET` | opcional (los crons no corren local) | **obligatoria** | Netlify scheduled functions la pasan en `Authorization: Bearer …` |
| `GOOGLE_BUSINESS_PROFILE_REDIRECT_URI` | `http://localhost:3000/api/auth/google-business/callback` | `https://<tu-dominio>/api/auth/google-business/callback` | OAuth callback necesita matchear |
| `NEXT_PUBLIC_BUILD_TIME` | no setear | auto-inyectada por Netlify en build | aparece en `/api/version` |

**Variables que tienen el MISMO valor en dev y prod** (la lista corta — no exhaustiva):
- `AUTH_SECRET`, `IMPERSONATION_SECRET` — secretos generados; el valor *en sí mismo* es distinto pero el uso es idéntico
- `NEXT_PUBLIC_WHATSAPP_NUMBER`, `DEVELOP_ALERTS_EMAIL` — valores del negocio, no del entorno
- `CHATBOT_GCP_PROJECT_ID`, `CHATBOT_GCP_LOCATION` — el proyecto GCP es uno solo (no hay dev/prod aparte)
- API keys de servicios externos (`ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `BREVO_API_KEY`, `GOOGLE_*_API_KEY`, etc.) — si querés sandbox vs prod, conviene tener keys distintas, pero el código no las distingue

---

## Higiene de `.env*` files

Después del incidente del 2026-05-21 con `enviroment.env` (typo, archivo committed con secret en history):

- El `.gitignore` ahora cubre `.env*`, `*.env`, `*environment*`, `*enviroment*`. Cualquier nombre que se parezca queda fuera de git.
- **NUNCA** crees un archivo de configuración con secrets cuyo nombre no esté en esa lista. Si necesitás un nombre exótico, agregalo al `.gitignore` antes de pegarle un valor.
- Antes de commitear cualquier cambio al árbol, correr `git status` y verificar que NO aparece ningún archivo de tipo `*.env`.
- Si tu IDE auto-completa un nombre como `enviroment` (typo común), corregilo a `environment` o usá uno de los nombres canónicos (`.env`, `.env.local`).
- Para reescribir history y borrar secrets que ya están commited, ver runbook BFG: [`docs/audits/2026-05-bfg-leak-cleanup.md`](../audits/2026-05-bfg-leak-cleanup.md).

---

## Regla de oro (repetida porque importa)

- **NUNCA** correr `prisma migrate reset` contra cualquier branch.
- **NUNCA** correr seeds destructivos (los que borran tablas) sin verificar antes que `DATABASE_URL` apunta a `dev` con: `node -e "console.log(process.env.DATABASE_URL)"` después de cargar dotenv.
- **NUNCA** copiar la URL de `main` a `.env.local`. Si tenés dudas de cuál es cuál, el endpoint cambia: `main` y `dev` tienen `ep-XXXX` distintos.
- **NUNCA** commitear secrets, ni siquiera en archivos con typo. El `.gitignore` actual cubre los nombres comunes pero no es infalible.

---

*Última actualización: 2026-05-21. Si la branch `dev` cambia de endpoint (Neon a veces recrea computes), actualizar `.env` y `.env.local` y dejar nota acá.*
