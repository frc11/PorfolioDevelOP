# 02 — Qué falta

> Madurez de cada herramienta de §6 del plan, con la escala del PROMPT §5.2 (L0 no existe · L1 esqueleto · L2 camino feliz · **L3 listo para cliente** · L4 pulido). **La unidad que se mide es la funcionalidad** (ENMIENDA-01 E7, DEC-25); la madurez de una herramienta es la de su funcionalidad más floja y la de un área, un cálculo agregado. Un L2 o más afirma que algo funciona: exige el camino feliz trazado con `ruta:línea`; si no, queda `L?`. Los faltantes se escriben como `FAL-NNN` bajo su herramienta. La hipótesis de Valentino —«el admin y el portal están muy desarrollados y les faltan sobre todo módulos»— se confirma o se desmiente acá con evidencia, no se asume. Generado por `scripts/auditoria/hallazgos-md.mjs` (funcionalidades de `_crudo/funcionalidades.json`, faltantes de `_crudo/hallazgos.json`).

## Resumen por área

| Área | Herramientas medidas | Funcionalidades | En L3 o más | Faltantes de L3 más comunes | FAL |
|---|---:|---:|---:|---|---:|
| h1 · Acceso | 5 / 5 | 14 | 0 | Sentry (11), autonomía (9), errores (8) | 0 |
| h2 · Portal del cliente | 1 / 16 | 1 | 0 | Sentry (1) | 0 |
| h3 · Chatbot centralizado | 0 / 8 | 0 | 0 | — | 0 |
| h4 · Panel de admin | 0 / 13 | 0 | 0 | — | 0 |
| h5 · Setter y LeadOS | 0 / 7 | 0 | 0 | — | 0 |
| h6 · Entradas públicas que alimentan lo interno | 0 / 2 | 0 | 0 | — | 0 |

## h1 · Acceso

### h1.auth-login — Login (contraseña, magic link, Google)

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 6 funcionalidades: 5×L2, 1×L1).
- Criterios de L3 que faltan en alguna funcionalidad: errores, validación en servidor, mobile, Sentry, sin mocks ni TODO, autonomía, carga, permisos y tenant.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h1.auth-login.google-oauth` Ingreso con Google | L1 | errores, carga, Sentry, sin mocks ni TODO, autonomía | El boton (page.tsx:286-299) inicia OAuth (actions.ts:162-164) pero el signIn callback rechaza toda cuenta sin Account vinculada (user.id = sub, auth.ts:125 y :192-201; callback/index.js:64) y no existe camino que vincule (git grep account.create/linkAccount va |
| `h1.auth-login.login-password` Login con email y contrasena | L2 | errores, validación en servidor, mobile, Sentry, sin mocks ni TODO, autonomía | Camino feliz: page.tsx:347 -> actions.ts:65-111 -> auth.ts:142-169 (bcrypt :157) -> signIn callback auth.ts:192-203 -> jwt auth.ts:209-230 -> redirect actions.ts:102-108 -> proxy.ts:134-146 / layouts |
| `h1.auth-login.logout` Cerrar sesion | L2 | carga, Sentry | admin-topbar.tsx:85 / setter/layout.tsx:76 / DashboardLayoutClient.tsx:150 -> auth-actions.ts:5-7 -> signOut -> /login |
| `h1.auth-login.magic-link` Ingreso por magic link | L2 | errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | page.tsx:204 -> actions.ts:140-151 -> send-token.js:23-33 (signIn callback auth.ts:175-186) -> auth.ts:101-120 -> brevo-service.ts:25-39 -> callback route.ts:3 -> /dashboard (actions.ts:148) |
| `h1.auth-login.ruteo-por-rol` Ruteo y proteccion por rol | L2 | permisos y tenant, errores, validación en servidor, autonomía | proxy.ts:98-168 (SETTER :117-122, admin :148-152, dashboard :154-156) + re-chequeo en Node: admin/layout.tsx:43-49, setter/layout.tsx:28-34, dashboard/layout.tsx:90-92 via preview.ts:6-20 |
| `h1.auth-login.sesion-jwt` Sesion JWT, expiracion e invalidacion | L2 | permisos y tenant, errores, autonomía | jwt refresca de DB en cada auth() (auth.ts:205-231); invalida en Node por version (auth.ts:215-223); cookie explicita (auth-cookies.ts:21-30) |

### h1.auth-recupero — Olvidé / restablecer contraseña

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 2 funcionalidades: 2×L2).
- Criterios de L3 que faltan en alguna funcionalidad: Sentry, validación en servidor, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h1.auth-recupero.restablecer-password` Restablecer contrasena con el token | L2 | validación en servidor, Sentry, autonomía | page.tsx:10-11 -> ResetPasswordForm.tsx:186-188 -> actions.ts:19-40 -> :45-63 token -> :68-84 transaccion -> :87-96 audit -> exito ResetPasswordForm.tsx:146-183 |
| `h1.auth-recupero.solicitar-enlace` Pedir enlace de recupero | L2 | Sentry | login/page.tsx:365-370 -> forgot-password/page.tsx:120 -> actions.ts:29-57 (Zod + limites) -> :73-83 token -> :96-101 Brevo -> exito :109 |

### h1.auth-cambio — Cambio obligatorio de contraseña

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 1 funcionalidades: 1×L2).
- Criterios de L3 que faltan en alguna funcionalidad: Sentry, sin mocks ni TODO, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h1.auth-cambio.cambio-forzado` Cambio obligatorio de contrasena temporal | L2 | Sentry, sin mocks ni TODO, autonomía | auth.ts:168 -> proxy.ts:84-90 -> page.tsx:6-27 -> CambiarPasswordForm.tsx:116-131 -> actions.ts:25-75 (update :51-61, unstable_update :73) -> router.push :126 |

### h1.auth-invite — Aceptar invitación

- Madurez de la herramienta: **L1** (la de su funcionalidad más floja; 2 funcionalidades: 2×L1).
- Criterios de L3 que faltan en alguna funcionalidad: errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h1.auth-invite.aceptar-invitacion` Aceptar invitacion y definir contrasena | L1 | validación en servidor, Sentry, autonomía | AcceptInviteForm.tsx:187 -> actions.ts:15-82 funciona con un token, pero nada vivo entrega tokens de invitacion (h1.auth-invite.emitir-invitacion) |
| `h1.auth-invite.emitir-invitacion` Emitir invitacion | L1 | errores, validación en servidor, Sentry, sin mocks ni TODO, autonomía | inviteClientAction (invitations.ts:43-118) sin callers y sin envio (mensaje falso :116); inviteTeamMemberAction (settings.ts:148-237) en modulo sin importadores, por Resend |

### h1.auth-impersonacion — Ver como cliente (impersonación)

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 3 funcionalidades: 3×L2).
- Criterios de L3 que faltan en alguna funcionalidad: errores, validación en servidor, Sentry, carga.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h1.auth-impersonacion.iniciar` Iniciar sesion de soporte (impersonar) | L2 | errores, validación en servidor, Sentry | ImpersonateButton.tsx:24 -> client.actions.ts:8-9 -> impersonation.ts (actions) :12-47 -> cookie + audit -> /dashboard |
| `h1.auth-impersonacion.navegar-como-cliente` Ver el portal como el cliente | L2 | errores | proxy.ts:154 -> dashboard/layout.tsx:72-77 -> preview.ts:14-17 -> impersonation.ts:54-80 -> banner layout.tsx:148-153 |
| `h1.auth-impersonacion.terminar` Terminar sesion de soporte | L2 | carga, Sentry | ImpersonationBanner.tsx:28 -> impersonation.ts (actions) :50-79 (borra cookie, audita, /admin/clients) |

## h2 · Portal del cliente

### h2.cli-cuenta — Mi cuenta

- Madurez de la herramienta: **L2** (la de su funcionalidad más floja; 1 funcionalidades: 1×L2).
- Criterios de L3 que faltan en alguna funcionalidad: Sentry.

| Funcionalidad | Madurez | Faltan para L3 | Evidencia de la madurez |
|---|---|---|---|
| `h2.cli-cuenta.cambiar-password` Cambiar contrasena desde Mi Cuenta | L2 | Sentry | ProfileForms.tsx:374-394 (invocacion directa) -> profile.ts:191-232 -> unstable_update :239 -> router.refresh (ProfileForms.tsx:392) |

## h3 · Chatbot centralizado

## h4 · Panel de admin

## h5 · Setter y LeadOS (ZONA-FRANCO)

## h6 · Entradas públicas que alimentan lo interno

## ZONA-FRANCO

> Faltantes en herramientas de Franco; se repiten en `09-PARA-FRANCO.md`.
