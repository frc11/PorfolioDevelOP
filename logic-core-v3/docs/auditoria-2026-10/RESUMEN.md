# RESUMEN — Auditoría de renovación develOP · 2026-10

> Una página. Base auditada: `origin/main` @ `57c421bc` (último commit 2026-09-06). Corrida de solo lectura del 2026-10-13 al 2026-10-16: no se cambió una línea de la app. Todo número de esta página sale de un entregable de `docs/auditoria-2026-10/`, que tiene la evidencia `ruta:línea`. Contexto que da Valentino (ENMIENDA-01 §0): **no hay clientes reales** y las credenciales del repo son de prueba, así que el impacto se lee como «bloqueante para el primer cliente real».

## Estado general

- **Cobertura:** profunda 1.267 / 1.298 archivos; los 31 restantes son candidatos a poda de confianza ALTA y se leyeron en superficial (`10-PODA.md`). Superficial 691 / 691. Los nueve dominios cerraron con `[DOMINIO-ABIERTO]` por el tope de ciclos (D1 y D6 con los de DEC-26 y E4; los otros siete con DEC-50), ninguno por falta de cobertura.
- **Hallazgos:** 571 (**CRÍTICA 2 · ALTA 23 · MEDIA 258 · BAJA 288**) en `02` y `03`, más 9 de diseño (`04`) y 15 ideas (`05`). 174 verificaciones manuales en `08`. La auditoría ciega de F6 no encontró ninguna causa raíz nueva, y las 26 CRÍTICA/ALTA se sostuvieron al releerlas (tres bajaron a MEDIA por la rúbrica).
- **Madurez:** 445 funcionalidades en 52 herramientas. Por funcionalidad: L3 19 · L2 365 · L1 48 · L0 7 · sin medir 6. **Ninguna herramienta llega entera a L3**: su madurez es la de su funcionalidad más floja, con la regla de `02-PENDIENTE.md`, y da L2 23 · L1 23 · L0 5 · L? 1. Lo que más falta para L3 en todas las áreas es lo mismo: errores capturados en Sentry, estados de error con mensaje útil y que el cliente pueda terminar la tarea sin ayuda (`02-PENDIENTE.md`, Resumen por área).
- **La hipótesis de Valentino** («el admin y el portal están muy desarrollados y les faltan módulos») **se confirma a medias:** las pantallas existen y el camino feliz anda en casi todas, pero lo que falta no son módulos sino la plomería de activación (GA4, Google Business, módulos premium, crons sin disparador) y la verdad de los datos (leads de toda la agencia contados como del cliente, tendencias fijas). Los cuatro módulos premium tienen un bloqueante cada uno (`02`, medición de D2).
- **Hoy, dos cosas no funcionan y nadie se entera:** el chatbot de develOP y el de todos los clientes no responde porque la credencial de Vertex está vencida (dato de Valentino; BUG-145), y el health dice «Todo OK» (BUG-063). El backup diario de la base **nunca corrió bien**: 140 corridas fallidas por falta del secret (consultado en GitHub el 2026-10-15; BUG-171).
- **Avance 1.0 propuesto:** 16 de 351 funcionalidades en L3 o más (**4,6 %**), con el alcance que propone la auditoría (`alcance_propuesto` en `06-ATLAS/atlas.curado.json`; el `alcance` real lo deciden Valentino y Franco). **Barrera de 1.0:** 20 de las 25 CRÍTICA/ALTA abiertas están en nodos propuestos para la 1.0.

## Top 10 riesgos

| # | Riesgo | IDs | Zona |
|---|---|---|---|
| 1 | Un anónimo agota en minutos el cupo mensual de cualquier bot de cliente y el gasto de Vertex: el Origin de develOP vale para todos los bots | SEC-057 (CRÍTICA), SEC-074 | libre |
| 2 | El magic link no tiene rate limit: cualquiera dispara emails ilimitados por Brevo a cualquier cuenta | SEC-005 (CRÍTICA) | libre |
| 3 | El chatbot no responde (Vertex vencida) y ni el health ni el panel lo muestran | BUG-145, BUG-063 | libre |
| 4 | Lo programado no corre: el backup diario nunca funcionó; los crons del reporte ejecutivo, del brief IA y del detector de alertas no tienen disparador en Netlify | BUG-171, BUG-047, FAL-016 | libre |
| 5 | Credenciales de terceros (Google Business, Tiendanube, Cal.com, Telegram) en claro en la base, y el overview del chatbot manda la fila entera al navegador | SEC-036, SEC-037 | libre (B-12: el cifrado no cambia columnas) |
| 6 | Datos entre clientes: los contactos de toda la agencia cuentan como leads del cliente; el motor de reseñas puede responder reseñas de otro cliente | SEC-048, SEC-051 | libre |
| 7 | Email marketing: las acciones no verifican el módulo ni validan, y la baja no llega a Brevo (quien se dio de baja sigue recibiendo) | SEC-044, BUG-021 | libre |
| 8 | Sesiones: la invalidación por cambio de contraseña se revive, un admin degradado o borrado sigue leyendo `/admin`, y el login no tiene freno real contra fuerza bruta | SEC-006, SEC-023, SEC-007 | SEC-006: `auth.ts`, FROZEN + ZONA-FRANCO (B-09); SEC-023 y SEC-007: libre (B-10, B-08) |
| 9 | Repo público con credenciales: el email y la contraseña de las cuentas de prueba (en el seed de marzo a junio y en docs), y una clave vieja de Google AI en dos documentos y en el historial | SEC-002, SEC-001 | libre (purgar la historia es decisión de Valentino) |
| 10 | Módulos premium que el cliente paga y no puede usar: Email Marketing Pro inalcanzable, «Conectar mi tienda» da 401, Agenda contra la API v1 apagada de Cal.com | BUG-012, BUG-032, TEC-002 | libre |

## Top 10 oportunidades

| # | Oportunidad | Dónde |
|---|---|---|
| 1 | Las preguntas que el bot no supo contestar, respondidas desde Análisis (destraba el motor de descubrimientos) | IDEA-001 |
| 2 | Aviso al 80 % de la cuota, al dueño y a develOP, antes de que el bot se degrade | IDEA-002 |
| 3 | «Lo que Google te trajo»: llamadas, «cómo llegar» y clics, con la integración de Google Business que ya existe | IDEA-003 |
| 4 | «Pedile la reseña» al marcar Vendido, por WhatsApp o email | IDEA-004 |
| 5 | SLA de soporte: lo que develOP no contestó, escalado por Telegram | IDEA-005 |
| 6 | Podar: 386 candidatos, 31.203 LOC (165 de confianza ALTA, 14.635 LOC) sin leer línea por línea lo que se va | `10-PODA.md` |
| 7 | Soltar 15 de los 22 congelados con la política protegido/libre: destraba los arreglos de `auth.ts`, el schema y la renovación visual | `11-CONGELADOS.md` |
| 8 | Llevar el sistema de diseño de `rediseno/home` al portal sin tocar `ui/*`, en nueve pasos | `04-DISENO.md` §3 |
| 9 | Pasar las reglas de `CLAUDE.md` de prosa a mecanismo (gate de eslint en CI, hooks de Claude Code, invariantes) y atar el Atlas a cada sprint | `13-CLAUDE-MD-PROPUESTO.md` |
| 10 | De las 143 entradas de la lista de docs: 10 documentos vivos nuevos (VISION, ARQUITECTURA, ROADMAP, DECISIONES, OPERACIONES…), 15 que se mantienen y 128 a borrar o consolidar, con 37 contradicciones listadas para decidir | `14-DOCS-CONSOLIDADOS/` |

## Qué hacer primero

El backlog (`07-BACKLOG.md`) tiene **204 tarjetas** (Ahora 24 · Próximo 63 · Después 117), una por causa raíz, y cubre los 571 hallazgos. Sumando S=1, M=3 y L=8 da **635 puntos**: 72 de Ahora y 551 de las 179 tarjetas que tocan nodos propuestos para la 1.0. Orden sugerido:

1. **Esta semana, casi sin código:**
   - B-01: renovar la credencial de Vertex e inventariar cuándo vence cada credencial.
   - B-02: cargar los secrets del backup y que su falla avise.
   - B-03: sacar del repo las contraseñas de prueba y confirmar que ninguna base las conserva (VH-002).
   - B-05: que Sentry reciba en producción.
2. **Las dos CRÍTICA**, con su base común:
   - B-06: un helper de IP confiable.
   - B-07: el techo de gasto del chat público (SEC-057).
   - B-08: el rate limit real del acceso (SEC-005).
3. **El resto de Ahora** (aislamiento entre clientes, `/admin`, crons, email marketing y módulos premium): B-10 a B-24. B-09 y B-27 tocan `auth.ts`, así que esperan la decisión de congelados y a Franco.
4. **Decisiones que solo pueden tomar Valentino y Franco**, y que destraban sprints:
   - El `alcance` 1.0 de cada nodo en `atlas.curado.json`.
   - La política de niveles para los congelados (B-89).
   - Qué hacer con la rama `p25/rafaga-tildes` de LeadOS (B-31).
   - Las decisiones abiertas de diseño del portal (B-175).
   - Los 37 «a decidir» de los docs (B-90).

## Números de la renovación (ENMIENDA-01 E12)

- **Poda (LOC por confianza):** ALTA 165 fichas · 14.635 LOC · MEDIA 141 · 4.726 LOC · BAJA 26 · 3.492 LOC · esperar el merge de `rediseno/home` 54 · 8.350 LOC · **total 386 · 31.203 LOC**. Docs: 143 (mantener 15 · borrar 54 · consolidar 74). Nada se borró en esta corrida.
- **Congelados a soltar:** de 22, descongelar 15 · reemplazar 3 · después del merge de `rediseno/home` 4 · mantener 0 (`11-CONGELADOS.md`).
- **Planeado contra lo real:** 1.351 ítems — hecho 597 · parcial 229 · no empezado 457 · abandonado 29 · contradicho 39 (`12-PLANEADO.md`).
- **Avance 1.0 propuesto:** 16 / 351 (4,6 %). Trabajo restante en nodos 1.0: 551 puntos en 179 tarjetas abiertas. Barrera: 20 CRÍTICA/ALTA abiertas en nodos 1.0.
- **Credenciales y cuentas externas** (una línea por servicio; detalle en `01-INVENTARIO.md` §6.1 y la revisión de vencimientos en VH-134; «¿se entera?» = si el sistema detecta que venció):
  - **Vertex AI:** vencida hoy según Valentino; se cae el chatbot de todos · se entera a medias (Sentry si hay DSN; el health da ok).
  - **Anthropic:** insights de Resultados y borrador de respuestas a reseñas · no se entera.
  - **Brevo:** magic link, reset, bienvenida, reportes, avisos y email marketing · no se entera (el magic link muestra éxito igual).
  - **Resend (restos):** tres avisos que todavía salen por Resend · no se entera (sin key devuelve éxito).
  - **Google OAuth:** «Continuar con Google», que hoy no completa para nadie por el código · no se entera.
  - **GA4 y Search Console:** Tráfico y SEO · no se entera (muestra datos demo con banner).
  - **Google Business Profile:** Reputación y Motor de reseñas · no se entera (la conexión sigue «OPERATIONAL»).
  - **Tiendanube:** resumen de la tienda · no se entera (muestra ceros).
  - **Cal.com:** Agenda · no aplica hoy: usa la API v1, apagada según el propio repo.
  - **PageSpeed:** velocidad del sitio · no se entera.
  - **Telegram:** avisos de leads al equipo · no se entera; es el único que se rota desde la UI.
  - **Meta / WhatsApp (360dialog):** el motor de WhatsApp, hoy latente · no se entera.
  - **n8n:** leads del formulario de contacto al CRM · no se entera (el pie muestra éxito).
  - **Neon:** todo · a medias (Sentry si hay DSN; sin timeouts).
  - **Netlify:** el sitio, los deploys y las scheduled functions · fuera del código (avisos por email).
  - **Sentry:** todo el monitoreo · no, por definición (sin DSN queda inerte); según la bitácora seguía inactivo en producción (`docs/bitacora-roadmap.md:17135`); se confirma con VH-135.
  - **`CRON_SECRET` y secretos propios:** los crons que quedan y las sesiones · solo en los logs de Netlify; los propios no vencen, pero rotar `AUTH_SECRET` sin preparar los demás rompe links y OAuth en curso.

## Dónde está cada cosa

`00-PLAN-Y-LOG.md` (plan, decisiones y log) · `01-INVENTARIO.md` · `02-PENDIENTE.md` · `03-MEJORAS.md` · `04-DISENO.md` · `05-IDEAS.md` · `06-ATLAS/` (el mapa; la puerta es su `README.md`) · `07-BACKLOG.md` · `08-VERIFICACION-HUMANA.md` · `09-PARA-FRANCO.md` · `10-PODA.md` · `11-CONGELADOS.md` · `12-PLANEADO.md` · `13-CLAUDE-MD-PROPUESTO.md` · `14-DOCS-CONSOLIDADOS/` · `_reportes/` (un reporte por dominio y fase).
