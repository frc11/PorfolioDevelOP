# Onboarding: Módulo Agenda Inteligente

Precio: **$80 USD/mes**
Plataforma: Cal.com Cloud (individual, no self-hosted)

---

## 1. Crear cuenta Cal.com para el cliente

1. Ir a [cal.com](https://cal.com) → Sign up
2. Usar el email de trabajo del cliente (o crear uno tipo `cliente@develop.agency`)
3. Username: elegir algo limpio tipo `nombre-empresa` (ej: `gourmet-baires`)
4. Configurar zona horaria del cliente

---

## 2. Configurar event types

En el dashboard de Cal.com del cliente:

1. **Nuevo Event Type** → completar:
   - Título (ej: "Consulta inicial", "Turno estética")
   - Duración (15 / 30 / 60 min)
   - Descripción opcional
   - Ubicación (videollamada / presencial / por definir)
2. Repetir para cada servicio que ofrece el cliente
3. Configurar **disponibilidad**: días y horarios de atención
4. Activar **confirmación automática** (para cuentas individuales es lo estándar)

---

## 3. Generar API Key

1. En Cal.com: **Settings → Developer → API Keys**
2. Click en **Add** → label descriptivo (ej: `develOP-integration`)
3. Copiar la key generada — se muestra una sola vez

---

## 4. Obtener el Embed URL

El embed URL para el cliente generalmente es:

```
https://cal.com/{username}
```

O si quieren embeber un event type específico:

```
https://cal.com/{username}/{event-slug}
```

Para el embed iframe usar el mismo URL (Cal.com renderiza correctamente dentro de un iframe).

---

## 5. Activar el módulo en BD

### 5a. Ir a Prisma Studio

```bash
cd logic-core-v3
npx prisma studio
```

### 5b. Activar el módulo para la organización

Tabla **organization_module**:
- Buscar la org del cliente
- Si no existe el registro → crear con:
  - `moduleId`: id del `premium_module` con slug `agenda-inteligente`
  - `status`: `ACTIVE`
  - `priceLockedUsd`: `80`

### 5c. Setear los campos Cal.com

Tabla **Organization**, fila del cliente:
- `calComApiKey` → pegar la API key del paso 3
- `calComUsername` → el username elegido (ej: `gourmet-baires`)
- `calComEmbedUrl` → `https://cal.com/{username}` (o URL específica de event type)

---

## 6. Verificar que funciona

1. Entrar al dashboard del cliente como admin: `/dashboard/modules/agenda-inteligente`
2. Debe mostrar el `AgendaOverview` (no el `ConnectAgendaCard`)
3. Los stats van a estar en 0 hasta que haya bookings reales
4. El iframe debe cargar la página de Cal.com del cliente

---

## Notas

- La cache de bookings es **10 minutos** (TTL 600s). Para forzar refresh: `revalidateTag('cal:{organizationId}')` desde un Server Action si se necesita.
- Cal.com free tier es individual y sin white-label. Si el cliente necesita branding propio → evaluar migración a self-hosted (decisión post 5 clientes activos).
- Franco es el único que configura event types y horarios. El cliente NO tiene acceso directo a Cal.com → simplifica el soporte.
