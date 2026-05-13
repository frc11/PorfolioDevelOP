# Chatbot — Deploy en Netlify

## Variables de entorno requeridas

Configurar en Netlify UI: Site Settings → Environment Variables.

| Variable | Valor | Notas |
|----------|-------|-------|
| `DATABASE_URL` | `postgres://...neon...` | Production Neon DB |
| `CHATBOT_GOOGLE_API_KEY` | `AIzaSy...` | API key de Google AI Studio (production) |
| `CHATBOT_IP_HASH_SALT` | random string 32+ chars | Generar con `openssl rand -hex 32` |
| `CHATBOT_LLM_PROVIDER` | `google` | (default) |
| `NEXT_PUBLIC_APP_URL` | `https://develop-portfolio.netlify.app` | |

Si están las legacy:
| `GOOGLE_GENERATIVE_AI_API_KEY` | igual a CHATBOT_GOOGLE_API_KEY | fallback compat |

## Build command
`npx prisma generate && npx prisma migrate deploy && npm run build`

`prisma migrate deploy` aplica las migraciones pendientes en la BD de prod.

## Post-deploy smoke test

1. Visitar `https://develop-portfolio.netlify.app/`
2. Avatar debe aparecer en la esquina
3. Click → enviar "hola"
4. Bot debe responder streaming
5. Revisar Netlify Functions logs para confirmar que no hay errores
