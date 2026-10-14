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
