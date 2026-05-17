# Setup de Sentry — Steps manuales

## En Sentry Dashboard

1. Login a https://sentry.io
2. Verificar que el proyecto develOP existe
3. Configurar Alert Rules:

### Alert Rule 1: Errores nuevos en producción
- When: a new issue is created
- Filter: environment equals "production"
- Action: Send notification to email DEVELOP_ALERTS_EMAIL

### Alert Rule 2: Spike de errores
- When: number of events in 1 hour > 50
- Action: Send notification to email

### Alert Rule 3: Errores críticos
- When: issue is from path /api/chatbot/*
- Filter: level equals "error" or "fatal"
- Action: Send notification immediately

## Variables de entorno requeridas

- `NEXT_PUBLIC_SENTRY_DSN` — visible al cliente (browser errors)
- `SENTRY_DSN` — server-side errors
- `SENTRY_AUTH_TOKEN` — para upload de source maps
- `SENTRY_ORG` — slug de organización
- `SENTRY_PROJECT` — slug de proyecto

## Verificación

Después del setup, ejecutar:
```bash
# Provocar error de prueba (con endpoint temporal)
curl https://[dominio]/api/admin/sentry-test
```

Y verificar que aparece en dashboard.
