# 01 — Onboardear un cliente nuevo

**Tiempo estimado:** 15-20 minutos
**Responsable:** Franco (primario) / Socio (backup)
**Prerequisito:** Contrato firmado, pago inicial confirmado

## Pre-flight check

Antes de empezar, asegurate de tener:

- [ ] Nombre comercial del cliente
- [ ] Industria / rubro
- [ ] Ciudad
- [ ] Website (si tiene)
- [ ] WhatsApp del cliente
- [ ] Email del usuario primario que va a usar el dashboard
- [ ] Información del negocio para la KB (puede ser una nota de voz que vas a transcribir)
- [ ] Plan contratado (Starter / Pro / Custom)

## Paso 1: Crear cliente en el admin

1. Ir a `/admin/clients/new`
2. Click "Empezar"

### Step 1 — Empresa

- **Nombre de la empresa**: el nombre comercial. Ej: "Clínica San Miguel"
- **Industria**: elegir del dropdown (afecta templates de KB)
- **Ciudad**: ej "Tucumán"
- **Website**: opcional pero recomendado

⚠ **El slug se genera automáticamente** del nombre. Si querés cambiarlo, hacelo ahora — DESPUÉS no se puede sin migrar URLs.

### Step 2 — Identidad del bot

- **Nombre del bot**: usar la sugerencia o un nombre custom. Ej "Lucia" para clínica.
- **Tono**: por default informal rioplatense. Si el cliente es corporativo, formal.
- **Mensaje de bienvenida**: ver las sugerencias por industria. Editalo si el cliente tiene preferencias.

### Step 3 — Knowledge Base

El template se pre-carga con info de la industria. Editar las 7 secciones con info real del cliente:

1. **Sobre el negocio**: descripción de qué hace, años de experiencia, valores
2. **Productos / Servicios**: qué ofrece
3. **Precios**: si tiene precios públicos, ponerlos. Si no, "consultar con asesor"
4. **Diferenciadores**: qué hace distinto a la competencia
5. **Cliente ideal**: a quién venden
6. **Manejo de objeciones**: respuestas típicas a "está caro", "lo pienso", etc.
7. **Cosas que NO decir**: información sensible o que NO deben prometer

⚠ Esta es la parte que MÁS afecta calidad del bot. Si la info que te pasaron no alcanza, **PARÁ y pedile al cliente** info adicional.

### Step 4 — Apariencia

- **Color**: por default cyan develOP. Si el cliente tiene branding, usar paleta curada cercana.
- **WhatsApp**: número con código país (`549...` para Argentina, sin +). Es donde se derivan leads calientes.
- **Mensaje pre-llenado WhatsApp**: lo que aparece cuando un visitante hace click. Ej: "Hola, vengo del sitio. Quiero más info sobre..."

### Step 5 — Review

Revisar TODO. Si algo está mal, volver a editarlo.

Click **"Crear cliente y activar bot"**.

## Paso 2: Crear usuario primario

⚠ El paso 1 crea la organización, pero NO crea el usuario que va a loguear en el dashboard.

1. Ir a `/admin/clients/[clientId]` del cliente recién creado
2. Tab "Overview"
3. Buscar la sección "Información de contacto" — debería decir "Usuario primario: —"
4. (Próximamente UI para crear usuario directo — por ahora, ejecutar manualmente)

**Manual hoy:**

```sql
-- Conectar a Neon vía CLI o dashboard
INSERT INTO users (id, email, name, role, ...) VALUES ('[uuid]', '[email]', '[name]', 'CLIENT', ...);
INSERT INTO org_members (id, organizationId, userId, role) VALUES ('[uuid]', '[orgId]', '[userId]', 'PRIMARY');
```

O usar Prisma Studio: `npx prisma studio`

## Paso 3: Enviar credenciales al cliente

Una vez creado el user primario, mandar al cliente:

```
Hola [nombre],

¡Tu sitio + chatbot ya están armados! Te invitamos a entrar a tu panel de control:

🔗 URL: https://develop-portfolio.netlify.app/login
📧 Usuario: [email del cliente]
🔑 Contraseña: [contraseña temporal]

Cuando entres por primera vez te va a pedir que la cambies.

Adentro vas a ver:
- "Mi proyecto" → estado de tu sitio
- "Mi Chatbot" → métricas en tiempo real
- "Mensajes" → comunicación directa con nosotros

Cualquier duda, escribime por WhatsApp.

Franco — develOP
```

## Paso 4: Configurar alerta Sentry (opcional, plan Pro+)

Si el cliente es Pro o superior, crear alerta dedicada en Sentry para errores de su bot.

## Common pitfalls

❌ **Olvidar pasar el website**: el bot no puede recomendar URLs sin esto
❌ **KB muy genérica**: el bot va a parecer estándar — pedir info específica al cliente
❌ **No verificar el WhatsApp**: si no responde a chequeo manual, no funciona el handoff
❌ **Activar bot sin probar**: SIEMPRE hacer una conversación de prueba antes de avisar al cliente

## Verificación final

Antes de declarar onboarding completo:

- [ ] Bot responde correctamente en `/api/chatbot/[slug]/chat`
- [ ] Welcome message se ve bien
- [ ] Quick replies funcionan
- [ ] WhatsApp handoff abre con el número correcto
- [ ] Pre-flight check del admin: todo verde

## Siguiente paso

Ver [02-activar-bot.md](./02-activar-bot.md) para activar bot en producción.
