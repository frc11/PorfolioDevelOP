# 01 — Onboardear un cliente nuevo

**Tiempo estimado:** <10 minutos
**Responsable:** Cualquier miembro del equipo develOP
**Prerequisito:** Contrato firmado, pago inicial confirmado, email del cliente disponible

## Pre-flight check

Antes de empezar, asegurate de tener:

- [ ] Nombre comercial del cliente
- [ ] Industria / rubro
- [ ] Ciudad
- [ ] Website (si tiene)
- [ ] WhatsApp del negocio (con código de país, sin `+`)
- [ ] Email del usuario que va a usar el dashboard
- [ ] Nombre completo del usuario
- [ ] Información del negocio para la KB (puede ser una nota de voz que vas a transcribir)
- [ ] Plan contratado (Starter / Pro / Custom)

## Flow nuevo (post Alpha v2 — automatizado)

1. Login en `/admin/clients/new`
2. Completar wizard de 5 pasos
3. Submit — el sistema crea la Org, el User, el BotConfig, la KB y envía el email de bienvenida automáticamente
4. Listo. El cliente recibe el email con sus credenciales y entra directo al dashboard.

**Lo que ya NO hay que hacer:**
- ❌ Crear User manualmente en Prisma Studio
- ❌ Crear OrgMember manualmente
- ❌ Compartir credenciales por WhatsApp manualmente
- ❌ Setear hash de password a mano

## Paso 1: Wizard de onboarding

Ir a `/admin/clients/new`.

### Step 1 — Empresa y usuario

- **Nombre de la empresa**: nombre comercial. Ej: "Clínica San Miguel"
- **Industria**: elegir del dropdown (afecta templates de KB)
- **Ciudad**: ej "Tucumán"
- **Website**: opcional pero recomendado

⚠ **El slug se genera automáticamente** del nombre. DESPUÉS no se puede cambiar sin migrar URLs.

- **Nombre completo del cliente**: quien va a usar el portal
- **Email del cliente**: donde va a recibir sus credenciales

### Step 2 — Identidad del bot

- **Nombre del bot**: usar sugerencia o nombre custom. Ej "Lucía" para clínica.
- **Tono**: informal rioplatense por defecto. Si el cliente es corporativo, formal.
- **Mensaje de bienvenida**: editarlo con información del cliente.

### Step 3 — Knowledge Base

El template se pre-carga según la industria. Editar las 7 secciones con info real del cliente:

1. **Sobre el negocio**: descripción, años de experiencia, valores
2. **Productos / Servicios**: qué ofrece
3. **Preguntas frecuentes**
4. **Políticas**: cancelaciones, garantías, horarios
5. **Guía de ventas**: cómo manejar objeciones
6. **Ejemplos de tono**: cómo debe hablar el bot
7. **No decir**: información sensible que el bot NO debe revelar

⚠ Esta es la parte que MÁS afecta calidad del bot. Si la info que te pasaron no alcanza, **PARÁ y pedile al cliente** info adicional.

### Step 4 — Apariencia

- **Color**: por default cyan develOP. Si el cliente tiene branding, usar paleta cercana.
- **WhatsApp**: número con código país (`549...` para Argentina, sin `+`). Pre-llenado con `549`.
- **Avatar**: Neuro por defecto.

### Step 5 — Review

Revisar todo. Si algo está mal, click en "← Volver" para corregir.

Click **"Crear cliente y activar bot"**.

## Paso 2: Resultado del wizard

El sistema hace todo en un solo paso:
- Crea la organización con bot y KB configurados
- Crea el usuario con password temporal y `passwordResetRequired=true`
- Envía el email de bienvenida con las credenciales
- Muestra la password temporal en pantalla (solo se ve UNA vez)

### Si el email se envió correctamente

El cliente recibe un email con sus credenciales y un link al portal. Al entrar, el sistema lo redirige automáticamente a `/cambiar-password` para que cambie la password temporal.

### Si el email falla

Aparece el warning con la password temporal en pantalla:
- Copiá la password y enviásela al cliente por WhatsApp/otro canal
- Podés re-enviar desde el panel del cliente en cualquier momento

## Paso 3: Re-enviar credenciales (si es necesario)

Desde el panel del cliente en `/admin/clients/[clientId]`, tab **Overview**:

1. Click en "Re-enviar credenciales"
2. Click en "Confirmar"
3. El sistema genera una nueva password temporal y envía el email
4. Si el email falla, muestra la nueva password temporal en pantalla

## Experiencia del cliente (primer acceso)

1. El cliente recibe el email con sus credenciales
2. Entra a `/login` y usa el email y password temporal
3. El sistema lo redirige automáticamente a `/cambiar-password`
4. El cliente define su nueva password (mín. 8 caracteres con letras y números)
5. El sistema lo lleva directo al dashboard
6. Futuros logins van directo al dashboard sin bloqueo

También puede cambiar la password voluntariamente desde **Dashboard → Cuenta → Perfil → Seguridad**.

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
- [ ] Cliente pudo hacer login y cambiar su password

## Siguiente paso

Ver [02-activar-bot.md](./02-activar-bot.md) para configuraciones adicionales del bot en producción.
