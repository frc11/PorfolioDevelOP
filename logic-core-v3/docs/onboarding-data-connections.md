# Onboarding de conexiones de datos para nuevos clientes

**Última actualización:** 2026-05-04

> Procedimiento para activar GA4 + Search Console reales en el portal de un cliente.
> Tiempo estimado: 15–20 minutos por cliente.
> Mejor hacerlo con el cliente disponible por WhatsApp para aceptar invitaciones rápido.

---

## Pre-requisitos

- Cliente tiene GA4 instalado en su sitio (**NO** Universal Analytics / UA)
- Cliente tiene su sitio verificado en Search Console
- Tenés acceso a Prisma Studio del entorno de producción
- La variable `GOOGLE_SERVICE_ACCOUNT_KEY` está seteada en `.env.local` / Netlify

---

## Service Account de develOP

Email de la service account que debe agregar el cliente:

```
develop-data-reader@PROJECT_ID.iam.gserviceaccount.com
```

*(Reemplazar `PROJECT_ID` con el ID real del proyecto en Google Cloud — ver la key JSON)*

---

## Paso 1 — Permisos en GA4 del cliente

1. El cliente abre su propiedad en [analytics.google.com](https://analytics.google.com)
2. **Admin** → **Property Access Management**
3. Click **"+"** → **"Add users"**
4. Email: `develop-data-reader@PROJECT_ID.iam.gserviceaccount.com`
5. Rol: **Viewer**
6. Guardar
7. Copiar el **Property ID** → formato numérico `123456789`
   - ⚠️ NO es el Measurement ID que empieza con `G-XXXXX`
   - Se encuentra en Admin → Property Settings → Property ID

---

## Paso 2 — Permisos en Search Console del cliente

1. El cliente abre [search.google.com/search-console](https://search.google.com/search-console)
2. Seleccionar la propiedad del sitio
3. **Settings** → **Users and permissions**
4. **Add user** → email de la service account → rol **Owner** o **Full**
5. Confirmar la URL exacta del sitio (con o sin www, con barra final):
   - Ejemplo: `https://www.dominio.com.ar/`
   - Esta URL debe coincidir exactamente con la propiedad verificada

---

## Paso 3 — Setear IDs en la Organization

En **Prisma Studio** (o con una Server Action), editar la `Organization` del cliente:

| Campo | Valor |
|-------|-------|
| `analyticsPropertyId` | Property ID numérico de GA4 (ej: `123456789`) |
| `siteUrl` | URL exacta del sitio con barra final (ej: `https://www.dominio.com.ar/`) |

---

## Paso 4 — Verificación

1. Loguear como el cliente al dashboard
2. Ir a `/dashboard/resultados/trafico`
3. Esperar 5–10 segundos la primera carga (sin cache aún)
4. Verificar:
   - Datos reales visibles (no "data preview")
   - Banner cyan de modo demo **no aparece**

---

## Troubleshooting

| Síntoma | Causa más probable | Solución |
|---------|-------------------|----------|
| "Access denied" | Service account no fue agregada o rol incorrecto | Verificar paso 1/2, esperar hasta 30 min para propagación |
| "Property not found" | Property ID incorrecto | Confirmar que es el numérico, no el `G-XXXXX` |
| Sigue mostrando mock / banner cyan | Permisos no propagados | Esperar 30 min y reintentark; ver `console.error` en server logs |
| "No data" en búsquedas | GA4 no tiene datos para ese rango aún | Puede tomar 24–48hs para que aparezcan datos nuevos |
| "Resource not found" en Search Console | URL no coincide con la propiedad verificada | Verificar URL exacta (www vs no-www, barra final) |

---

## Setup inicial de la Service Account (una sola vez)

Si el proyecto de Google Cloud no existe o la service account no está creada:

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear proyecto `develOP` (si no existe)
3. Habilitar APIs:
   - **Google Analytics Data API (GA4)**
   - **Google Search Console API**
4. **Credentials** → **Create credentials** → **Service account**
5. Nombre sugerido: `develop-data-reader`
6. Generar key JSON → descargar
7. Pegar el JSON completo en `.env.local`:

```bash
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

*(El JSON entero en una sola línea, con las comillas del objeto JSON dentro del valor)*

En Netlify: **Site settings** → **Environment variables** → agregar la misma variable.
