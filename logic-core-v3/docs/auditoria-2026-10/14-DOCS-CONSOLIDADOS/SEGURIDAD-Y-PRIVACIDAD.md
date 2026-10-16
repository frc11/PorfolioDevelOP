> BORRADOR de la auditoría 2026-10 (E11, DEC-44). No reemplaza todavía a ningún doc: borrar y reemplazar es un sprint posterior (ver `10-PODA.md` §docs). Cada afirmación lleva su fuente.

# Seguridad y privacidad

> **Borrador E11** · base `57c421bc` · destino propuesto `logic-core-v3/docs/SEGURIDAD-Y-PRIVACIDAD.md`.
> Registro vivo: qué se le puede prometer a un cliente, cómo está armada la defensa y qué sigue abierto. Los hallazgos nuevos de la auditoría 2026-10 (SEC-, BUG-, FAL-) viven en el Atlas; acá se resume lo heredado de docs previos que sigue abierto en la base. **Nunca se escribe un valor de secreto: solo ruta, línea y tipo.**
> Fuentes: rutas relativas a `logic-core-v3/`; `PRIV` = `docs/privacidad-afirmaciones-cliente.md`; `SEG07` = `docs/baselines/2026-07-auditoria-seguridad.md`; `INV` = `docs/auditoria-2026-10/01-INVENTARIO.md`; `CE` = contexto estable del Drive. **[A DECIDIR]** = contradicción sin resolver.

## 1. Qué se le puede afirmar a un cliente sobre sus visitantes

Vale cuando los 3 commits del BLOQUE PRIVACIDAD estén en producción y se haya pasado el checklist de §1.3 (PRIV:8-10). Se escribió para redactar contratos sin prometer lo que el sistema no cumple (PRIV:3-6).

### 1.1 Se puede afirmar

1. Los datos personales de los visitantes no aparecen en los logs de plataforma: el logging usa lista blanca y un test (`test:pii`) falla si algo personal intenta salir (PRIV:23-29).
2. Los mensajes de error no exponen datos personales (PRIV:31-34).
3. La IP no se guarda: solo un hash SHA-256 con salt, que en prod es obligatorio (PRIV:36-41; src/modules/chatbot/server/config/envValidator.ts:61-65).
4. Los datos están aislados de los de otros clientes (PRIV:43-47).
5. El registro de actividad técnica del bot se borra a los 30 días (PRIV:49-52).

### 1.2 No se puede afirmar

1. «Ningún tercero recibe datos»: el aviso de leads llega a Telegram con nombre y contacto, los emails salen por Brevo o Resend y el hosting es Netlify. En el contrato se listan los procesadores (PRIV:58-66). **[A DECIDIR]** el aviso de Telegram.
2. «Todo se borra a los 30 días»: conversaciones, mensajes y leads no tienen retención automática (PRIV:68-72).
3. «Nadie de develOP lee las conversaciones»: el admin las muestra; se puede decir «solo personal autorizado, con fines de soporte» (PRIV:74-77).
4. Retroactividad: antes del bloque hubo nombres y contactos en los logs de Netlify (PRIV:79-83).
5. Irreversibilidad de los hashes de IP históricos, generados con un salt público (PRIV:85-89).

### 1.3 Checklist antes de usarlo en un contrato

- [ ] Los 3 commits del BLOQUE PRIVACIDAD en producción (PRIV:95).
- [ ] Prueba post-deploy: un lead real y verificar en Netlify Logs `redactedKeys` sin datos personales (PRIV:96-98).
- [x] `CHATBOT_IP_HASH_SALT` creada en Netlify el 2026-08-11 (PRIV:99).
- [ ] Retención de logs del plan de Netlify verificada (PRIV:100-101).
- [ ] Decisión sobre el aviso de Telegram reflejada en el contrato (PRIV:102-103).
- [ ] Opcional: limpiar los hashes de IP históricos (PRIV:104-105).

### 1.4 A qué terceros va la PII

| Tercero | Qué recibe | Consentimiento explícito del visitante |
|---|---|---|
| n8n (CRM del cliente) | nombre, email, teléfono, mensaje, intención, categoría, señales | no |
| Brevo | nombre, email, remitente, vista previa del mensaje (al admin de la org) | implícito |
| Google Vertex AI | la conversación completa, con la PII que el visitante escriba | no |
| Google Business / Tiendanube | tokens OAuth, no datos del visitante | no aplica |
| Sentry | stack traces sanitizados, si está activo | implícito |
| Telegram del equipo | nombre y contacto del lead | no |

Fuente: docs/auditoria-seguridad-2026-05.md:366-374 (Apéndice A), más Telegram de PRIV:58-61. El producto captura PII bajo la Ley 25.326: política de privacidad, términos y aviso de captura son requisito de producto (CE:38).

## 2. Cómo está armada la defensa

- **Acceso.** NextAuth v5 en `src/auth.ts` (congelado, zona de Franco); el proxy reparte por rol (src/proxy.ts:10-16); `sessionVersion` invalida el JWT tras un reset (prisma/schema.prisma:294); el OAuth state va firmado con HMAC (`src/lib/security/oauth-state.ts`) (docs/audits/2026-06-revalidacion.md:90).
- **Server actions.** Cada una valida con Zod y verifica sesión y rol; el middleware no alcanza (raíz:CLAUDE.md:58-59; SEG07:45).
- **Multi-tenant.** Helper de aislamiento con lint estructural y golden suite (ARQUITECTURA.md §4). Regla: toda mutación nueva iniciada por el cliente exige un test que pruebe imposible el acceso cruzado (CE:57); al 2026-07-29 no había tests `@isolation` en main (SEG07:66-89).
- **Rate limit** persistente en Neon (prisma/schema.prisma:1765). Regla: todo endpoint que invoque al LLM lleva rate limit (CE:59).
- **Cifrado de credenciales guardadas.** CRM con AES-256-GCM (`CRM_SECRET_KEY`); credenciales de la Bóveda con AES-256-GCM (`ONBOARDING_SECRET_KEY`, prefijo `enc:v1:`) que falla duro si falta la key (drive:Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:8-26; src/lib/crypto/credential-cipher.ts); canal WhatsApp con `MOTOR_CHANNEL_SECRET_KEY` (INV:112).
- **Headers.** `X-Frame-Options: DENY` global salvo `/embed`; `/setter` con `frame-ancestors 'none'`; CSP global en Report-Only (next.config.ts:72-131).
- **Widget.** Origen validado contra `allowedDomains` del bot (src/lib/security/validate-origin.ts).
- **Crons.** `CRON_SECRET` que falla cerrado (src/lib/cron/cron-secret.ts:40-44).

## 3. Abierto en `57c421bc`

### 3.1 Secretos y credenciales en el repo

| Qué | Tipo | Dónde | Origen |
|---|---|---|---|
| `logic-core-v3/enviroment.env` sigue en la historia, alcanzable desde main (alta en 39535583, baja en c351b793); la purga y el force-push nunca se aplicaron; la key se reportó deshabilitada, no verificable | API key de Google Generative AI | `git log --all -- logic-core-v3/enviroment.env` | docs/audits/2026-05-bfg-leak-cleanup.md:11-17, 169-205; docs/bitacora-roadmap.md:6-58 |
| El valor de esa key está escrito en docs del árbol | API key | docs/audits/2026-05-bfg-leak-cleanup.md:94 (prefijos en :143, :189, :204, :262); docs/bitacora-roadmap.md:19, 36, 50 | — |
| Contraseñas de cuentas seed y demo en texto plano | credencial de usuario | STATUS.md:258-259; docs/bitacora-beta.md:15; docs/bitacora-roadmap.md:6375-6377, 7837, 10534; docs/demo-guion.md:15-16; docs/leados-alta-setter.md:25; scripts/b1-verify-setter-ownership.ts; scripts/b2-verify-dossier.ts | grep sobre los docs (solo líneas) |
| Secreto de firma por defecto (literal en el código) si faltan `IMPERSONATION_SECRET`, `AUTH_SECRET` y `NEXTAUTH_SECRET` | secreto de firma | src/lib/impersonation.ts:14-19 | docs/probe-poda-terreno.md:1139 |
| Credencial de Neon dev parcialmente impresa en un transcript | contraseña de base | (el doc no tiene el valor) | docs/diagnostico-visual-2026-08/REPORTE.md:219-222 |

Borrar un doc del árbol no saca el valor de la historia. **[A DECIDIR]** purgar o aceptar el riesgo, y la visibilidad del repo.

### 3.2 Código

| Tema | Evidencia | Origen |
|---|---|---|
| `runPreflightChecks` es `'use server'` sin guard de rol (PA-1) | src/modules/chatbot/server/admin/preflightChecks.ts:1-13 | docs/audit-repo-20260707.md:231 |
| Tokens de terceros en claro: `gbpAccessToken`, `gbpRefreshToken`, `tiendanubeAccessToken`, `calComApiKey` (CO-7) | prisma/schema.prisma:359, 367, 375 | docs/audit-repo-20260707.md:248 |
| El dominio de develOP pasa para cualquier bot antes de mirar `allowedDomains` (S4-01) | src/lib/security/validate-origin.ts:69-73 | SEG07 (S4-01) |
| `QA_ALLOW_LOCALHOST` tiene una segunda superficie de una sola pata | src/lib/security/validate-origin.ts:49 | docs/probe-poda-terreno.md:1138 |
| Gate de email-marketing solo en el layout (S2b-01) | SEG07:45, 60-62 | SEG07 |
| `/api/test-sentry` sigue existiendo | src/app/api/test-sentry/route.ts | SEG07:66-89 |
| `/health` del chatbot es público y devuelve `error.message` y detalle de env (A4.3) | src/app/api/chatbot/[slug]/health/route.ts:7-20 | drive:Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:52 |
| CSP principal en Report-Only | next.config.ts:72 | docs/admin-changelog/Chatbot rdc.md:157 |
| `email.ts` devuelve éxito sin `RESEND_API_KEY` | src/lib/email.ts:15-17 | INV:104 |
| `updateTimeEntry` sin guard de pertenencia | — | docs/admin-changelog/Equipo rdc.md |
| Hashes de IP históricos con salt público, sin limpiar | — | PRIV:85-89 |
| LLM-01 a 04, PII-02 y 03, SSRF-01 y RATELIMIT-02 (reabierto como S4-03) abiertos a julio | — | docs/auditoria-seguridad-2026-05.md; SEG07 |
| Advisories de `next` y de `next-auth` beta | — | **[A DECIDIR]** |

## 4. Reglas

- Nunca loguear valores de env ni exponer errores internos o stack traces al cliente (raíz:CLAUDE.md:24, 62).
- Credenciales vivas jamás en el working directory, ni gitignoreadas (CE:61).
- Antes de commitear un doc: grep de secretos; ningún doc nuevo copia valores.
- **[A DECIDIR]** Los docs que enumeran vulnerabilidades no se publican mientras el repo sea público (SEG07:3576-3606, 3830).
