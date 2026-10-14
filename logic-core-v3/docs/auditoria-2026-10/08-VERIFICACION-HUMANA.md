# 08 — Verificación humana

> Lo que no se puede probar leyendo código (runtime, base de datos, navegador, mobile real, cuentas externas). Cada entrada es `VH-NNN` con la plantilla de DEC-30: hallazgo(s) que verifica · entorno · precondiciones · pasos · resultado esperado · señal de falla · si escribe en la base o manda emails. **Nunca correr una verificación que escribe contra la base compartida con Franco o contra producción sin la alternativa local indicada.**

### [VH-001] La clave de Google AI filtrada está revocada
- Verifica: [SEC-001] · Prioridad: baja
- Entorno: consola de Google Cloud / Google AI Studio del proyecto de develOP (solo lectura).
- Precondiciones: acceso de owner al proyecto.
- Pasos: 1) Abrir *APIs & Services → Credentials* (o AI Studio → API keys). 2) Buscar la clave por su prefijo (está en `docs/audits/2026-05-bfg-leak-cleanup.md:94`; no copiarla a otro lado). 3) Ver su estado.
- Resultado esperado: la clave no existe o está deshabilitada.
- Señal de falla: la clave figura activa → revocarla ya y crear una nueva fuera del repo.
- ¿Escribe en la base o manda emails?: no.

### [VH-002] Ninguna base expuesta conserva las contraseñas de prueba del repo
- Verifica: [SEC-002], [SEC-003], [SEC-004] · Prioridad: baja (ENMIENDA-01 P1)
- Entorno: la base de producción (y la de dev) en modo lectura, o la pantalla de login de cada entorno desplegado.
- Precondiciones: conocer las cuentas de `README.md:29-30`, `docs/leados-alta-setter.md:25` y `scripts/set-matsu-password.ts:16-17`.
- Pasos: 1) En cada entorno desplegado (prod y previews), intentar el login con cada par email/contraseña del repo. 2) Si hay acceso de lectura a la base: confirmar si esas cuentas existen (`SELECT email, role FROM "User" WHERE email IN (…)`), sin modificar nada.
- Resultado esperado: ningún login entra; en producción esas cuentas no existen o tienen otra contraseña.
- Señal de falla: algún login entra → cambiar esa contraseña (o borrar la cuenta) antes del primer cliente real.
- ¿Escribe en la base o manda emails?: no (solo intentos de login; un login fallido puede sumar al rate limit de la cuenta).

### [VH-003] `DATABASE_URL_TEST` apunta a una base de test aislada
- Verifica: DEC-47 (pregunta P5 de F0) · Prioridad: media
- Entorno: GitHub → Settings → Secrets and variables → Actions del repo `frc11/PorfolioDevelOP`.
- Precondiciones: permisos de admin del repo.
- Pasos: 1) Ver si existe el secret `DATABASE_URL_TEST` (el valor no se puede leer). 2) Confirmar con quien lo cargó a qué base apunta (host de Neon y branch).
- Resultado esperado: no existe, o apunta a una base/branch de test que se puede migrar y ensuciar sin riesgo.
- Señal de falla: apunta a la Neon compartida con Franco o a producción → el CI (`raíz:.github/workflows/ci.yml:162-170`, `:212-223`) migra y escribe ahí en cada push sin `[skip ci]`.
- ¿Escribe en la base o manda emails?: no.

### [VH-004] Estado de las migraciones en la base real
- Verifica: baseline F1.6 (no disponible sin `DATABASE_URL`) · Prioridad: media
- Entorno: una máquina con el `.env.local` que apunta a la base a verificar (dev o prod), en modo solo lectura.
- Precondiciones: Node y dependencias instaladas.
- Pasos: 1) `cd logic-core-v3`. 2) `npx prisma migrate status`. 3) Copiar la salida completa.
- Resultado esperado: «Database schema is up to date!» con 86 migraciones.
- Señal de falla: migraciones pendientes o «drift detected» → no correr `migrate reset` (regla del repo); reportar.
- ¿Escribe en la base o manda emails?: no (`migrate status` solo lee).

### [VH-005] Revivir una sesion invalidada con POST /api/auth/session
- Verifica: [SEC-006] · Prioridad: alta
- Entorno: local (npm run dev o start:qa) con DB de desarrollo, nunca la Neon compartida
- Precondiciones: Cuenta de prueba con contrasena conocida; dos navegadores (o normal + incognito) y curl
- Pasos: 1) En A y B iniciar sesion con la misma cuenta y abrir /dashboard 2) En B: DevTools > Application > Cookies, copiar el valor de authjs.session-token 3) En A: cambiar la contrasena en /dashboard/cuenta/perfil 4) curl -c jar.txt -b 'authjs.session-token=<valor copiado>' http://localhost:3000/api/auth/csrf (anotar csrfToken) 5) curl -i -b jar.txt -b 'authjs.session-token=<valor copiado>' -H 'Content-Type: application/json' -d '{"csrfToken":"<token>","data":{}}' http://localhost:3000/api/auth/session 6) Si respondio Set-Cookie authjs.session-token nuevo: curl -i -b 'authjs.session-token=<nuevo>' http://localhost:3000/dashboard
- Resultado esperado: El POST no entrega cookie valida (body null y cookie limpiada) y /dashboard redirige a /login
- Señal de falla: El POST devuelve Set-Cookie con un token nuevo y con el /dashboard renderiza los datos del cliente
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-006] Bucle de redirecciones tras invalidar la sesion en otro navegador o reenviar credenciales
- Verifica: [BUG-001] · Prioridad: media
- Entorno: local con DB de desarrollo
- Precondiciones: Cliente de prueba logueado en el navegador B; admin en otro navegador
- Pasos: 1) En B dejar abierta una sesion del cliente en /dashboard 2) Desde el admin, en la ficha del cliente, usar 'Reenviar credenciales' (o cambiar la contrasena desde el navegador A) 3) En B recargar /dashboard 4) En B escribir /login en la barra
- Resultado esperado: B termina en /login mostrando el formulario y puede entrar con la contrasena nueva
- Señal de falla: ERR_TOO_MANY_REDIRECTS o 307 alternados /login <-> /dashboard en la pestana Network
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-007] Fuerza bruta por el endpoint nativo de Credentials y clave de IP del limitador
- Verifica: [SEC-007] · Prioridad: alta
- Entorno: local, nunca produccion
- Precondiciones: Cuenta de prueba
- Pasos: 1) curl -c jar.txt http://localhost:3000/api/auth/csrf (guardar csrfToken) 2) Repetir 10 veces: curl -b jar.txt -X POST -d 'csrfToken=<t>&email=<cuenta>&password=Incorrecta1' http://localhost:3000/api/auth/callback/credentials 3) Probar la contrasena correcta por el mismo endpoint y mirar si llega Set-Cookie authjs.session-token 4) Comparar con 6 intentos fallidos en el formulario de /login 5) (clave de IP) Enviar 11 veces el formulario de /reset-password con un token invalido de 64 hex y el mismo header X-Forwarded-For: 1.2.3.4 (curl a la server action o desde DevTools) 6) (clave de IP) El intento 11 debe decir 'Demasiados intentos' 7) (clave de IP) Repetir con X-Forwarded-For: 5.6.7.8
- Resultado esperado: Ambos caminos bloquean tras pocos intentos
- Señal de falla: 10+ intentos sin bloqueo por el endpoint nativo y el siguiente correcto crea sesion
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-008] AUTH_URL en produccion y X-Forwarded-Host en el magic link
- Verifica: [SEC-008] · Prioridad: baja
- Entorno: configuracion de Netlify (lectura) y deploy preview
- Precondiciones: Acceso al panel de Netlify; cuenta de prueba
- Pasos: 1) Netlify > Site configuration > Environment variables: verificar AUTH_URL o NEXTAUTH_URL = https://develop.com.ar en Production 2) Solo si faltara: en un deploy preview pedir magic link por curl a /api/auth/signin/resend (con csrf) agregando -H 'X-Forwarded-Host: example.com' y mirar el host del link recibido
- Resultado esperado: La variable existe y el link siempre apunta a develop.com.ar
- Señal de falla: Variable ausente o link con example.com
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-009] Duracion real de la cookie de sesion
- Verifica: [SEC-010] · Prioridad: media
- Entorno: local
- Precondiciones: Cuenta de prueba
- Pasos: 1) Iniciar sesion 2) Navegar a /dashboard y a otra ruta del portal 3) DevTools > Cookies > authjs.session-token: mirar Expires
- Resultado esperado: Vence a ~8 h
- Señal de falla: Vence a ~30 dias y se renueva en cada navegacion
- ¿Escribe en la base o manda emails?: no

### [VH-010] Boton 'Continuar con Google'
- Verifica: [UX-002] · Prioridad: media
- Entorno: deploy preview o produccion
- Precondiciones: Cuenta Google cuyo email exista como cliente
- Pasos: 1) /login > Continuar con Google 2) Completar el consentimiento
- Resultado esperado: Entra al portal o ve un mensaje claro
- Señal de falla: Error de Google (invalid_client) o vuelta a /login?error=unauthorized sin mensaje
- ¿Escribe en la base o manda emails?: no

### [VH-011] Open redirect por callbackUrl en /login
- Verifica: [SEC-011] · Prioridad: media
- Entorno: local o deploy preview
- Precondiciones: Sesion iniciada
- Pasos: 1) Abrir http://localhost:3000/login?callbackUrl=/%5Cexample.com 2) Abrir http://localhost:3000/login?callbackUrl=/%09/example.com
- Resultado esperado: Se queda en el sitio (portal o admin)
- Señal de falla: El navegador termina en example.com
- ¿Escribe en la base o manda emails?: no

### [VH-012] Cliente archivado conserva acceso
- Verifica: [SEC-014] · Prioridad: media
- Entorno: local con DB de desarrollo
- Precondiciones: Cliente de prueba con credenciales
- Pasos: 1) Archivar el cliente desde /admin/clients 2) Iniciar sesion como ese cliente 3) Navegar el portal y usar una action (p. ej. guardar perfil)
- Resultado esperado: Definir: si archivar es baja, el login se rechaza con mensaje
- Señal de falla: Portal completo operativo
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-013] Una sesión SUPER_ADMIN invalidada sigue leyendo páginas de /admin por navegación parcial (RSC)
- Verifica: [SEC-023] · Prioridad: alta
- Entorno: Local: npm run dev:qa (puerto 3002) contra la base del .env, con dos navegadores o perfiles (A y B)
- Precondiciones: Cuenta SUPER_ADMIN de prueba (seed) con la contraseña conocida y forma de restaurarla al final. No usar /api/qa/login para A: su token no trae sessionVersion.
- Pasos: 1) En A, entrar por /login con la cuenta SUPER_ADMIN, abrir /admin y después /admin/team. 2) En A, abrir DevTools > Network, hacer clic en 'Referidos' del menú lateral y copiar como cURL la request a /admin/referrals que lleva los headers 'RSC: 1' y 'Next-Router-State-Tree'. 3) En B, entrar con la misma cuenta y cambiar la contraseña en /cambiar-password (sube sessionVersion). 4) En A, sin recargar, hacer clic en 'Equipo', 'Proyectos', 'Referidos' y 'Leads'. 5) Ejecutar en una terminal el cURL copiado en el paso 2 (lleva la cookie vieja de A) y buscar en la respuesta emails de referidos o nombres de organizaciones. 6) Control: recargar A con F5. Debería terminar en /login o en el bucle de BUG-001. 7) Restaurar la contraseña de la cuenta de prueba.
- Resultado esperado: Después del paso 3, A deja de ver datos de /admin: los clics y el cURL devuelven redirección a /login o error, nunca datos.
- Señal de falla: En el paso 4 A sigue mostrando las listas, o el cURL del paso 5 devuelve 200 con el payload RSC que contiene emails de referidos, organizaciones o usuarios.
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-014] /api/qa/login alcanzable desde la LAN con 'Host: localhost'
- Verifica: [SEC-024] · Prioridad: media
- Entorno: PC de desarrollo con npm run dev:qa corriendo, más otro dispositivo en la misma red (o la misma PC usando su IP de LAN)
- Precondiciones: Persona super-admin sembrada (seed). No hace falta ninguna credencial.
- Pasos: 1) Correr npm run dev:qa y anotar la URL 'Network' que imprime Next (http://<IP-LAN>:3002). 2) Desde otro dispositivo de la red: curl -i -X POST http://<IP-LAN>:3002/api/qa/login -H "Host: localhost:3002" -H "Content-Type: application/json" -d "{\"persona\":\"super-admin\"}" 3) Si responde 200, copiar el valor de la cookie authjs.session-token del Set-Cookie y pedir: curl -i http://<IP-LAN>:3002/admin -H "Cookie: authjs.session-token=<valor>" 4) Control: repetir el paso 2 sin el header Host. Debe dar 403 host_not_localhost.
- Resultado esperado: El paso 2 responde 403, o la conexión se rechaza porque el servidor solo escucha en 127.0.0.1.
- Señal de falla: El paso 2 responde 200 con la cookie y el paso 3 devuelve el HTML del panel admin.
- ¿Escribe en la base o manda emails?: no

### [VH-015] El rate limit por IP (y la IP de auditoría) se esquiva rotando X-Forwarded-For en Netlify
- Verifica: [SEC-025], [SEC-026] · Prioridad: media
- Entorno: Producción en Netlify (develop.com.ar) o un deploy preview con la misma configuración
- Precondiciones: Ninguna cuenta para los pasos 1 a 3 (token inventado). Solo escribe filas en la tabla rate_limit. El paso 4 usa una cuenta de prueba.
- Pasos: 1) Abrir https://develop.com.ar/reset-password?token=<64 caracteres hex inventados> con DevTools > Network abierto. 2) Enviar el formulario 11 veces con contraseñas iguales de 8+ caracteres. La 11ª respuesta debe decir 'Demasiados intentos'. 3) Copiar como cURL el último POST y repetirlo 11 veces agregando -H "X-Forwarded-For: 203.0.113.N" con N distinto en cada intento. 4) Opcional, para la auditoría: con una cuenta de prueba, cambiar la contraseña desde una request con X-Forwarded-For: 203.0.113.99 y revisar la IP en /admin/audit-log.
- Resultado esperado: Con cualquier X-Forwarded-For el límite sigue vigente ('Demasiados intentos' durante 15 min), y la auditoría guarda la IP real.
- Señal de falla: Con un X-Forwarded-For nuevo por intento vuelve 'Este enlace no es válido o ya expiró' (el límite no corta), o el audit-log muestra 203.0.113.99.
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-016] Las páginas de auth cargan dentro de un iframe ajeno
- Verifica: [SEC-027] · Prioridad: baja
- Entorno: Producción (develop.com.ar) desde Chrome
- Precondiciones: Ninguna
- Pasos: 1) Crear un archivo local prueba-iframe.html con <iframe src="https://develop.com.ar/login" width="800" height="600"></iframe> y otro iframe a https://develop.com.ar/forgot-password. 2) Abrirlo con doble clic en Chrome. 3) Control: cambiar un iframe a https://develop.com.ar/dashboard. Debe quedar en blanco o rechazado por X-Frame-Options: DENY.
- Resultado esperado: Los iframes de /login y /forgot-password quedan rechazados, igual que /dashboard.
- Señal de falla: La pantalla de login se ve y se puede usar dentro del iframe.
- ¿Escribe en la base o manda emails?: no

### [VH-017] Impersonación en dos pestañas escribe en el cliente equivocado
- Verifica: [SEC-029] · Prioridad: media
- Entorno: local (npm run dev) con la base del .env (Neon compartida): usar solo orgs de prueba
- Precondiciones: Cuenta SUPER_ADMIN; dos orgs de prueba X e Y con valores distintos de 'ticket promedio' en el inicio del portal
- Pasos: 1) Pestaña A: /admin/clients -> 'Ver como cliente' en X; queda en /dashboard con el banner de X. 2) Pestaña B: /admin/clients -> 'Ver como cliente' en Y. 3) Volver a la pestaña A sin recargar, editar el ticket promedio en el inicio y guardar. 4) Recargar ambas pestañas y comparar el ticket promedio de X y de Y (o en /admin/clients/<id>).
- Resultado esperado: La acción de la pestaña A se rechaza o pide recargar, o el valor queda en X.
- Señal de falla: El valor guardado desde la pestaña de X aparece en Y y X queda igual.
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-018] Base caída durante la sesión: rebote en vez de pantalla de error
- Verifica: [BUG-006] · Prioridad: media
- Entorno: local (npm run dev)
- Precondiciones: Poder reiniciar el server cambiando DATABASE_URL en .env.local a un host inexistente, con el mismo AUTH_SECRET
- Pasos: 1) Iniciar sesión como cliente de prueba y abrir /dashboard. 2) Parar el server, poner un host inválido en DATABASE_URL y volver a levantarlo. 3) Abrir /dashboard con la misma cookie y mirar la pestaña Network. 4) Mirar la terminal y el proyecto de Sentry. 5) Restaurar DATABASE_URL.
- Resultado esperado: Pantalla de error (error.tsx) con 'Reintentar' y un evento en Sentry.
- Señal de falla: Cadena /dashboard -> /login -> /dashboard hasta ERR_TOO_MANY_REDIRECTS; en la terminal '[auth][error] JWTSessionError'; nada en Sentry.
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-019] Filas viejas en rate_limit
- Verifica: [SEC-031] · Prioridad: media
- Entorno: consola SQL de Neon, solo lectura
- Precondiciones: Acceso de lectura a la base de producción o de dev
- Pasos: 1) SELECT count(*) AS total, count(*) FILTER (WHERE "expiresAt" < now() - interval '1 day') AS vencidas, min("createdAt") FROM rate_limit; 2) SELECT split_part(key, ':', 1) AS scope, count(*) FROM rate_limit GROUP BY 1 ORDER BY 2 DESC;
- Resultado esperado: vencidas cerca de 0 (hay purga).
- Señal de falla: vencidas mayor a 0 y creciendo con el tiempo; scopes con miles de claves de un solo uso.
- ¿Escribe en la base o manda emails?: no

### [VH-020] Nombre de empresa gigante
- Verifica: [SEC-032] · Prioridad: media
- Entorno: local o QA, solo con un cliente de prueba (nunca producción)
- Precondiciones: Cliente de prueba con bot; Vertex activo solo si se quiere medir tokens
- Pasos: 1) Mi Cuenta -> Perfil: pegar un nombre de empresa de 20.000 caracteres y guardar. 2) Ver /admin/clients y el detalle del cliente. 3) Si Vertex está activo, mandar un mensaje al bot de ese cliente y mirar tokensIn en el log chat.llm_request_finished. 4) Restaurar el nombre.
- Resultado esperado: El servidor rechaza nombres largos (p. ej. más de 100).
- Señal de falla: Se guarda; tokensIn del turno crece del orden de 7 x 20.000 / 4 tokens.
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-021] Magic link abierto antes por un escáner
- Verifica: [BUG-007] · Prioridad: media
- Entorno: QA o local con Brevo y una casilla de prueba
- Precondiciones: Usuario de prueba registrado
- Pasos: 1) Pedir un magic link desde /login. 2) Copiar la URL del botón del mail sin abrirla y hacer un GET (curl -s -o /dev/null "<url>") para simular el escáner. 3) Hacer clic en el botón del mail en el navegador. 4) Opcional: repetir con una casilla de Microsoft 365 con Safe Links.
- Resultado esperado: El cliente entra al portal.
- Señal de falla: Página de error de Auth.js (Verification) en inglés.
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-022] Pedir recuperación varias veces
- Verifica: [UX-004] · Prioridad: media
- Entorno: local o QA con Brevo configurado y una casilla propia de prueba
- Precondiciones: Usuario de prueba con esa casilla
- Pasos: 1) /forgot-password con el email de prueba. 2) Repetir el pedido enseguida. 3) Abrir el PRIMER mail e intentar restablecer. 4) Pedir dos veces más dentro de la misma hora y contar los mails que llegan.
- Resultado esperado: El sistema avisa que solo vale el último enlace y el error ofrece pedir otro; o los enlaces previos siguen válidos hasta vencer.
- Señal de falla: El primer link dice 'no es válido o ya expiró' sin link para pedir otro; el cuarto pedido muestra 'te mandamos un mail' y no llega nada.
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-023] Errores de auth ausentes en Sentry
- Verifica: [FAL-003] · Prioridad: media
- Entorno: producción o preview: solo lectura de Sentry y de los logs de funciones de Netlify
- Precondiciones: Acceso a Sentry y a Netlify
- Pasos: 1) En Netlify -> Functions -> logs, buscar líneas '[auth][error]'. 2) En Sentry, buscar eventos 'CallbackRouteError', 'JWTSessionError', 'AdapterError' o '[auth]' en el mismo período.
- Resultado esperado: Cada error de auth de los logs tiene su evento en Sentry.
- Señal de falla: Hay líneas '[auth][error]' en Netlify y ningún evento en Sentry.
- ¿Escribe en la base o manda emails?: no

### [VH-024] Contraseña de más de 128 caracteres
- Verifica: [BUG-009] · Prioridad: baja
- Entorno: local o QA
- Precondiciones: Cliente de prueba con contraseña conocida
- Pasos: 1) Mi Cuenta -> contraseña (o /cambiar-password): definir una nueva de 130 caracteres con mayúscula y número. 2) Cerrar sesión. 3) Entrar con esa contraseña.
- Resultado esperado: O se rechaza al definirla, o el login la acepta.
- Señal de falla: Se guarda y el login responde 'La contraseña debe tener entre 8 y 128 caracteres.'
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-025] Link de email con la sesión vencida
- Verifica: [UX-005] · Prioridad: baja
- Entorno: local o QA
- Precondiciones: Cliente de prueba con un ticket
- Pasos: 1) Cerrar sesión. 2) Abrir /dashboard/soporte/<id> (como lo haría el link del email de ticket). 3) Confirmar que la URL es /login?callbackUrl=... 4) Entrar con contraseña.
- Resultado esperado: Aterriza en el ticket pedido.
- Señal de falla: Aterriza en /dashboard.
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-026] Copia de la cookie después de cerrar sesión
- Verifica: [SEC-033] · Prioridad: baja
- Entorno: local o QA
- Precondiciones: Cliente de prueba
- Pasos: 1) Entrar como cliente de prueba. 2) DevTools -> Application -> Cookies: copiar el valor de authjs.session-token (o __Secure-authjs.session-token). 3) Cerrar sesión desde el portal. 4) En una ventana privada, crear esa cookie con el valor copiado y abrir /dashboard.
- Resultado esperado: Redirige a /login.
- Señal de falla: Entra al dashboard con la sesión cerrada.
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-027] Email Marketing Pro accesible para un cliente que lo contrató
- Verifica: [BUG-012] · Prioridad: alta
- Entorno: Neon dev + app local o QA
- Precondiciones: Org QA con un usuario ORG_MEMBER y su contraseña
- Pasos: 1) SQL de lectura: SELECT slug, status FROM premium_module ORDER BY "sortOrder"; 2) Como SUPER_ADMIN activar Email Marketing Pro para la org QA 3) Loguearse como el cliente QA 4) Mirar si el sidebar muestra 'Email marketing' 5) Abrir /dashboard/modules/email-marketing
- Resultado esperado: El ítem aparece y el módulo abre
- Señal de falla: Sin ítem en el sidebar y redirección a /dashboard
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-028] Nested connect en WabaChannel no cruza tenants
- Verifica: [SEC-035] · Prioridad: media
- Entorno: Neon dev con playwright.integration (base compartida: usar prefijos de corrida y limpiar)
- Precondiciones: Dos orgs sembradas por el spec, cada una con canal y plantilla
- Pasos: 1) Agregar al test (h) de tests/integration/motor-isolation.spec.ts: await expect(forOrg(a.orgId).wabaChannel.update(a.channelId, { templates: { connect: [{ id: b.templateId }] } } as never)).rejects.toThrow(IsolationError) 2) Después leer la plantilla de B con unsafeGlobalQuery y comparar su organizationId 3) npm run test:integration
- Resultado esperado: IsolationError y la plantilla de B sigue en B
- Señal de falla: La promesa resuelve y la plantilla queda con organizationId de A
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-029] Helper con id undefined
- Verifica: [BUG-013] · Prioridad: media
- Entorno: Neon dev, script tsx o spec de integración
- Precondiciones: Org de prueba con al menos 2 ChatbotInsight PENDING
- Pasos: 1) Ejecutar forOrg(org).chatbotInsight.update(undefined as never, { status: 'DISMISSED' }) 2) Contar insights DISMISSED de esa org
- Resultado esperado: Lanza error y no cambia ninguna fila
- Señal de falla: Cambian todas las filas de la org
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-030] Estado de migraciones y drift físico en dev y en prod
- Verifica: [BUG-014], [DEU-014] · Prioridad: media
- Entorno: Terminal local; primero Neon dev y después la branch main (prod), siempre en modo lectura
- Precondiciones: DATABASE_URL apuntando al destino a revisar; no correr migrate deploy, dev ni reset
- Pasos: 1) cd logic-core-v3 2) npx prisma migrate status 3) npx prisma migrate diff --from-url "$env:DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script > drift.sql 4) Abrir drift.sql y revisar si tiene sentencias
- Resultado esperado: 'Database schema is up to date!' con 86 migraciones y drift.sql vacío
- Señal de falla: Migraciones pendientes (sobre todo las 12 posteriores al 2026-06-28) o sentencias en drift.sql (columnas de la reconciliación, enums de alertas)
- ¿Escribe en la base o manda emails?: no

### [VH-031] Credenciales en reposo: cuántas están en claro
- Verifica: [SEC-036] · Prioridad: media
- Entorno: Prod (solo lectura)
- Precondiciones: Acceso de lectura; nunca seleccionar los valores
- Pasos: 1) SELECT count(*) FILTER (WHERE "gbpRefreshToken" IS NOT NULL) AS gbp, count(*) FILTER (WHERE "gbpRefreshToken" LIKE 'enc:v1:%') AS gbp_cifrados, count(*) FILTER (WHERE "tiendanubeAccessToken" IS NOT NULL) AS tn, count(*) FILTER (WHERE "calComApiKey" IS NOT NULL) AS cal FROM "Organization"; 2) SELECT count(*) FILTER (WHERE type = 'ACCESS') AS acceso, count(*) FILTER (WHERE type = 'ACCESS' AND url LIKE 'enc:v1:%') AS acceso_cifrado FROM "ClientAsset"; 3) SELECT count(*) FROM "AgencySettings" WHERE "osTelegramBotToken" IS NOT NULL;
- Resultado esperado: Ninguna credencial en claro
- Señal de falla: Conteos de no cifrados mayores a 0
- ¿Escribe en la base o manda emails?: no

### [VH-032] Dos bots bajo el mismo origen
- Verifica: [BUG-018] · Prioridad: baja
- Entorno: App local o preview contra Neon dev
- Precondiciones: Dos bots activos con slugs A y B
- Pasos: 1) Abrir /embed/<slugA> y mandar un mensaje 2) En la misma pestaña abrir /embed/<slugB> y mandar un mensaje 3) Revisar los logs del server y la tabla chatbot_conversation
- Resultado esperado: Cada bot crea su conversación y responde (con la credencial de Vertex vencida, mirar solo la creación de la conversación)
- Señal de falla: El segundo request falla con P2002 / error en getOrCreateConversation
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción

### [VH-033] Orgs duplicadas y proyectos mal asignados por v2-unify en prod
- Verifica: [BUG-019] · Prioridad: media
- Entorno: Prod (solo lectura)
- Precondiciones: Acceso de lectura a la branch main
- Pasos: 1) SELECT id, slug, "companyName" FROM "Organization" WHERE id LIKE 'os-org-%' OR slug LIKE 'agency-os-%'; 2) SELECT p.id, p.name, o."companyName", l."businessName" FROM "Project" p JOIN "Organization" o ON o.id = p."organizationId" JOIN "OsLead" l ON l.id = p."osLeadId"; 3) Comparar a ojo companyName contra businessName
- Resultado esperado: 0 filas en la primera consulta y nombres coherentes en la segunda
- Señal de falla: Orgs sintéticas presentes o proyectos en un cliente que no corresponde
- ¿Escribe en la base o manda emails?: no

### [VH-034] Cold start de Neon en login y contacto
- Verifica: [BUG-020] · Prioridad: media
- Entorno: App local contra Neon dev
- Precondiciones: Neon dev sin tráfico al menos 5 minutos (auto-suspend)
- Pasos: 1) Esperar el suspend 2) Loguearse con un usuario de prueba 3) Enviar el formulario de contacto público con datos de prueba
- Resultado esperado: Ambos responden, aunque lento, sin error
- Señal de falla: Error de conexión, timeout o pantalla de error.tsx
- ¿Escribe en la base o manda emails?: sí — correrlo solo contra una base local propia y sin emails reales; nunca contra la Neon compartida con Franco ni contra producción
