# Guía de Despliegue en Vercel - DevelOP SaaS

Este repositorio está optimizado para un despliegue "Zero-Config" en Vercel, con soporte completo para Next.js 16, Prisma y Tailwind CSS v4.

## 1. Requisitos Previos

- Una cuenta en [Vercel](https://vercel.com).
- Un proyecto en GitHub/GitLab con este código.
- Una base de datos PostgreSQL (ej. Supabase, Railway o Vercel Postgres).

## 2. Configuración en el Panel de Vercel

### Variables de Entorno (Environment Variables)

Configura las siguientes llaves en tu Dashboard de Vercel (Project Settings > Environment Variables):

| Key | Value | Descripción |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | URL de conexión a tu DB |
| `AUTH_SECRET` | `openssl rand -base64 32` | Secreto para NextAuth.js |
| `RESEND_API_KEY` | `re_...` | API Key de [Resend](https://resend.com) |
| `N8N_API_URL` | `https://...` | Tu instancia de n8n |
| `N8N_API_KEY` | `key_...` | API Key de n8n |
| `NEXT_PUBLIC_APP_URL` | `https://tu-dominio.vercel.app` | URL pública de la app |

### Configuración del Build

Generalmente Vercel detecta Next.js automáticamente. Asegúrate de:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install`

## 3. Post-Install de Prisma

El proyecto ya incluye un script `postinstall` en `package.json` para generar el cliente de Prisma durante el despliegue:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

Esto garantiza que `npx prisma generate` se ejecute antes del build en Vercel.

## 4. Migración de Base de Datos

Una vez que el despliegue sea exitoso (o durante el primer build), debes aplicar las migraciones a tu base de datos de producción:

```bash
npx prisma migrate deploy
```

*Nota: Se recomienda ejecutar esto localmente apuntando a la DB de producción por seguridad, o usar un [Vercel Deployment Protection Bypass](https://vercel.com/docs/security/deployment-protection) si lo automatizas.*

## 5. Auditoría de Producción (Finalizada)

- [x] Sin `console.log` en módulos críticos.
- [x] Tipado estricto en Server Actions y Components.
- [x] Píxel de Tracking verificado (CORS habilitado).
- [x] FOMO B2B (Unlocked Features) configurado.

---
© 2026 DevelOP - Advanced Agentic Systems.
