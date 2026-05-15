# Chatbot — Procedure de Deploy a Netlify

## Pre-deploy (en local)

### 1. Health check local
```bash
npm run dev
```

En otra terminal:
```bash
curl http://localhost:3000/api/chatbot/develop/health
```

Esperado: `200 OK` con `"ok": true` en TODOS los checks.

Si NO está OK:
- Visitar http://localhost:3000/admin/chatbot/health para ver detalle
- Corregir lo que indica
- Reintentar

### 2. Smoke test real
```bash
curl http://localhost:3000/api/chatbot/develop/smoke
```

Esperado: `200 OK` con respuesta real de Gemini. Confirma que la API key funciona y el modelo es accesible.

Si falla:
- Verificar `CHATBOT_GOOGLE_API_KEY` en `.env.local`
- Verificar en Google Cloud Console que la "Generative Language API" esté habilitada
- Verificar que la key no tenga restricciones de IP/referrer

### 3. Test manual del chat
Abrir http://localhost:3000 → el avatar debe aparecer abajo a la derecha → click → enviar "hola" → debe responder streaming.

Si pasa: continuar.
Si no: revisar `/admin/chatbot/activity` para ver qué falló.

### 4. Build local
```bash
npm run build
```

Debe pasar PASS. Si falla, NO seguir.

## Configurar env vars en Netlify

En Netlify UI: Site settings → Environment variables.

| Variable | Valor | Notas |
|---|---|---|
| `DATABASE_URL` | `postgres://...neon...` | Production Neon DB |
| `CHATBOT_GOOGLE_API_KEY` | `AIzaSy...` | Misma que en .env.local |
| `CHATBOT_IP_HASH_SALT` | `<openssl rand -hex 32>` | Generar uno NUEVO para prod |
| `CHATBOT_LLM_PROVIDER` | `google` | Default |
| `AUTH_SECRET` | `<openssl rand -base64 32>` | Para NextAuth |
| `NEXT_PUBLIC_APP_URL` | `https://develop-portfolio.netlify.app` | URL pública |
| `NEXTAUTH_URL` | mismo que NEXT_PUBLIC_APP_URL | Para NextAuth |

⚠ **IMPORTANTE:** El `CHATBOT_IP_HASH_SALT` de prod DEBE ser distinto al de development. Generá uno nuevo.

## Deploy

```bash
git add .
git commit -m "feat: chatbot MVP"
git push origin main
```

Netlify detecta el push y arranca el build. Mirar el log de Netlify para confirmar que:
1. `prisma generate` corrió
2. `prisma migrate deploy` aplicó las migraciones
3. `npm run build` pasó

Si alguno falla, arreglarlo localmente y re-push.

## Post-deploy verification

### 1. Health check en producción
```bash
curl https://develop-portfolio.netlify.app/api/chatbot/develop/health
```

Esperado: `200 OK` con todo healthy.

### 2. Smoke test en producción
```bash
curl https://develop-portfolio.netlify.app/api/chatbot/develop/smoke
```

Esperado: `200 OK` con respuesta real. Consume ~10 tokens.

### 3. Test visual
- Visitar https://develop-portfolio.netlify.app/
- Avatar debe aparecer en esquina inferior derecha
- Click → enviar "hola" → bot responde

### 4. Revisar Activity Log
- Visitar https://develop-portfolio.netlify.app/admin/chatbot/activity
- Debe verse el evento de tu mensaje recién enviado

### 5. Revisar Netlify Function Logs
Netlify UI → Functions → Logs. Buscar:
- ✓ No errores de tipo `chatbot.unhandled_error`
- ✓ Eventos `chat.message_completed` con costos razonables

## Rollback si algo sale mal

Si después del deploy algo está roto:

```bash
# Opción 1: Netlify UI → Deploys → Rollback al deploy anterior
# Opción 2: revertir el commit y push
git revert HEAD
git push origin main
```

Si revertís, también revertir cualquier migración Prisma que NO sea backward-compatible (poco probable en este punto del MVP).

## Errores comunes y soluciones

| Error | Causa probable | Solución |
|---|---|---|
| `403 PERMISSION_DENIED` (Google API) | Generative Language API no habilitada en Cloud Console | Habilitarla |
| `400 API_KEY_INVALID` | Key restrictions (IP/HTTP referrer) | Remover restricciones durante setup |
| `prisma migrate deploy` falla en build | Migración requiere modificar datos existentes | Aplicar manualmente con SQL primero |
| Bot no aparece en landing | `LogicCompanion` no montado en wrapper público | Confirmar mounting en `PublicOnlyComponents` |
| Chat se abre pero no responde | API key faltante en Netlify env vars | Configurar en Netlify UI y re-deploy |
| Cuota agotada en prod inmediatamente | `monthlyQuota` muy bajo en BotConfig | Cambiar desde `/admin/chatbot/config` |

## Monitoreo continuo

### Diario
- Revisar `/admin/chatbot/activity` para errores nuevos
- Revisar `/admin/chatbot/conversations` para cantidad de conversaciones

### Semanal
- Revisar Google Cloud Console billing → confirmar que el costo está dentro de lo esperado (~$0.01/conversación)
- Revisar Netlify Function Logs para warnings

### Mensual
- Verificar que el trial de Google Cloud no se haya agotado (90 días desde activación)
- Considerar `cleanupOldEvents(30)` para purgar eventos viejos (ejecutar manualmente o cron)
