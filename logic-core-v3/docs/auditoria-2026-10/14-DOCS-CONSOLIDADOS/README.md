# 14 — Docs consolidados (borradores)

> E11 de la ENMIENDA-01 y DEC-44. Valentino pidió que todo lo conversado y craneado quede resumido en pocos documentos vivos y que el resto se borre. **En esta corrida solo se redacta: no se borró ni se editó ningún doc existente.** La lista de borrado está en `10-PODA.md` §docs. Armado por tres extractores y una síntesis de solo lectura (run `wf_7cfe2151-e7b`), sobre 292 docs de `docs/`, la raíz del repo y los insumos de Drive.

## Estructura propuesta (10 documentos vivos)

| Documento | Para qué | Reemplaza |
|---|---|---|
| [VISION.md](VISION.md) | Qué es develOP, cómo gana plata, a quién le vende, qué vende hoy (oferta, planes y módulos tal como los siembra el código, precios), qué promete y qué descartó. Es la puerta de entrada para cualquier persona o agente sin contexto. | logic-core-v3/STATUS.md (identidad y clientes), docs/probe-monolito-censo.md (servicios, rubros, claims), docs/sprints/p3-a-2-venta.md (venta del Motor de Reseñas), docs/onboarding-modulo-agenda.md (precio), docs/demo-guion.md (pitch). Resume y cita, sin reemplazarlos, los docs de Franco en Drive (contexto estable, contexto profundo, handoff de producto) y raíz:PRODUCT.md. |
| [ARQUITECTURA.md](ARQUITECTURA.md) | Resumen generado desde el Atlas (06-ATLAS/arquitectura.md): zonas y roles, cómo fluyen los datos, aislamiento multi-tenant, runtime del chatbot, integraciones y datos. Suma lo que los sprints dejaron fijado y el Atlas no repite. | docs/auditorias/A1-CENSO-SUPERFICIES-2026-08.md, docs/audit-chatbot-runtime.md, docs/sprints/utm-1-captura.md, docs/sprints/infra-1-observabilidad.md e infra-2-cold-start-retry.md (parte técnica), docs/sprints/p3-a-1-gbp-connection.md, docs/b7-probe-cal-com.md, docs/motor-whatsapp/bitacora.md, docs/baselines/2026-05-chatbot-runtime.md, docs/regression/*.md, docs/metodo/MAPA-LEADOS.md (parte de aislamiento). |
| [ROADMAP.md](ROADMAP.md) | Alcance propuesto por herramienta desde atlas.curado.json (36 para 1.0, 14 para después, 1 descartada), esqueleto de hitos y del backlog (se llena después desde el backlog de la auditoría) y el insumo heredado de los backlogs viejos, ya verificado contra 57c421bc. | docs/roadmap-pendientes.md, docs/consolidacion-planoA-runtime.md, los roadmaps del Drive (ROADMAP-MEJORA-post-auditoria, ROADMAP-CHATBOT-bloques-C, DERIVACION-chat-panel, Ideas de nuevas features), los pendientes de STATUS.md, de operations/b14-deploy-checklist.md, de AUDITORIA-CIERRE-2026-07, de manual-usuario/BACHES-* y HALLAZGOS-MANUAL-v3, de verificacion-arranque-oslead-vii y del compilado OSLEAD «Documento sin título». |
| [DECISIONES.md](DECISIONES.md) | Registro único de decisiones vigentes, deduplicadas, con fecha, fuente y evidencia en el código; una sección de vigencia sin confirmar y otra de decisiones reemplazadas para no reabrirlas. Las contradictorias no están: van a a_decidir. | Las decisiones dispersas en docs/bitacora-roadmap.md, bitacora-beta.md, bitacora-beta-2.md, bitacora-beta-3.md, bitacora-rediseno.md, docs/sprints/*, docs/audits/2026-05-auditoria-db.md, docs/admin-changelog/*, docs/client-portal/changelog/*, STATUS.md (decisiones de Alpha v2) y los handoffs del Drive (D-C1 a D-C4, sesión de evolución). |
| [OPERACIONES.md](OPERACIONES.md) | Cómo se opera el sistema: deploy, crons, backups y recuperación, entornos y migraciones, credenciales con qué se cae si vencen (E10, 01-INVENTARIO §6.1), variables de entorno, CI y QA local, observabilidad y alertas, y los runbooks condensados. | docs/operations/* (13), docs/chatbot-deploy.md, docs/env-vars.md, docs/netlify-env-vars.md, docs/leados-alta-setter.md, docs/onboarding-data-connections.md, docs/onboarding-modulo-agenda.md (setup), logic-core-v3/DEPLOY.md, docs/microaudit-frozen-frontera-CO.md (protocolo de migraciones), docs/testing-strategy.md, docs/audits/2026-05-cleanup-db-dev.md, docs/baselines/2026-05-admin-performance.md. |
| [LECCIONES.md](LECCIONES.md) | Solo las lecciones vigentes, deduplicadas y agrupadas (verificar, no creerle a los docs, git y entorno, datos, serverless, UI, negocio, método), cada una con la regla que deja y su fuente. | docs/metodo/LECCIONES-LEADOS.md, docs/metodo/PROPUESTA-CIMIENTO.md (parte), docs/auditorias/C0-RED-DE-VERIFICACION-2026-08.md, las secciones de lecciones de docs/admin-changelog/* y docs/client-portal/changelog/general.md, docs/sprints/alpha-RESUMEN-FINAL.md (lecciones) y las lecciones dispersas en las bitácoras. |
| [SEGURIDAD-Y-PRIVACIDAD.md](SEGURIDAD-Y-PRIVACIDAD.md) | Qué se le puede y qué no se le puede afirmar a un cliente sobre los datos de sus visitantes, a qué terceros va la PII, cómo está armada la defensa y qué sigue abierto en 57c421bc (incluidos los secretos y contraseñas que viven en docs). | docs/privacidad-afirmaciones-cliente.md, docs/auditoria-seguridad-2026-05.md (Apéndice A y estado), docs/baselines/2026-07-auditoria-seguridad.md (resumen), docs/audit-repo-20260707.md (seguridad), docs/audits/2026-05-bfg-leak-cleanup.md (procedimiento, sin el valor), docs/probe-poda-terreno.md (hallazgos de seguridad). |
| [LEADOS.md](LEADOS.md) | Zona de Franco: para qué existe el Panel del Setter, qué hace el código hoy, el motor y sus líneas rojas, qué traba al setter, el trabajo reportado y no integrado de OSLead VII y qué docs de LeadOS quedan. La ley escrita sigue siendo el brief v3, que se mantiene. | docs/metodo/MAPA-LEADOS.md, docs/HANDOFF-LEADOS-CIERRE.md, docs/MUNICION-PROMPTS-Y-SKILL.md (como anexo), docs/auditorias/REGRESION-FINAL-2026-07.md, AUDITORIA-CIERRE-2026-07.md, A3-VIABILIDAD-*.md, docs/corrida-recorrido-2026-08-31/REPORTE.md, docs/diagnostico-visual-admin-2026-08/REPORTE.md, docs/verificacion-arranque-oslead-vii.md, docs/PILOTO-DEMO-FIRST.md y el lado setter de las bitácoras beta. |
| [DISENO.md](DISENO.md) | Sistemas visuales vigentes por superficie (sitio público con la home clásica en producción y el rediseño en rama; portal y admin; LeadOS; 3D), la línea base de performance y qué no tocar. | docs/bitacora-rediseno.md (diseño), docs/design-system.md, docs/design-system-audit.md, docs/impeccable-baseline.md, docs/auditoria-total-pre-deploy.md (NO TOCAR), docs/probe-bundle-inicial.md, docs/probe-motion-sitio.md, docs/b9-plan-visual.md, docs/auditoria-consistencia-setter.md (reglas). Referencia, sin reemplazar, raíz:DESIGN.md y raíz:PRODUCT.md. |
| [HISTORIAL.md](HISTORIAL.md) | No es un changelog: es el mapa de eras y el índice para recuperar de git (57c421bc) lo que la poda saca del árbol, con las duplicaciones conocidas y la lista de docs que quedan después de la poda. | logic-core-v3/CHANGELOG.md, CHANGELOG-cuenta.md, _CHANGELOG-lane-project.md y _lane-*.md, raíz:lane-*.md, docs/releases/v1.0.0.md, docs/chatbot-sprints.md, docs/sprints/alpha-*.md, docs/admin-changelog/*, docs/client-portal/*, docs/b8a-*/b9-changelog, docs/ev4-transcripts y ev5-transcripts, y los registros de cambios del Drive de Olme. |

## A decidir (contradicciones entre fuentes; no se resuelven acá)

1. **Qué es develOP y si hay cliente pago en producción**
   - develOP es un chatbot multi-tenant para PyMEs LATAM (logic-core-v3/STATUS.md:16)
   - Es una agencia de web, IA y automatización; los ingresos vienen de webs por proyecto; el chatbot está construido y todavía sin cliente pago en producción (docs/_insumos/drive/Franco/Work Flow/Proyecto DevelOP/Contexto/develOP-contexto-estable-v1.0.md:8, 13-14)
   - El cliente piloto es Concesionaria San Miguel, de USD 4.000 (docs/audits/2026-05-auditoria-profunda.md:16)
   - matsu es un cliente real (docs/audits/2026-06-revalidacion-dashboard-chatbot.md:209)
   - Matsu contratado con onboarding pendiente; San Miguel es data mock (logic-core-v3/STATUS.md:174-184)
   - Matsu en Business con override de USD 0 hasta el 2026-08-22 (docs/bitacora-roadmap.md:2423-2426)
2. **Precios públicos en el sitio y precio de la página web**
   - No hay pricing público en el sitio; un solo CTA a WhatsApp (PRODUCT.md:41, 75 (raíz))
   - El home publica precios «desde»: $800, $300, $200 y $1.500 USD (src/components/sections/home/OurServices.tsx:70, 88, 106, 124)
   - Página web: lista USD 1.000, piso USD 800 (docs/_insumos/drive/Franco/Work Flow/handoff-producto-develop.md:49, 155)
   - El portal aparece como prueba de capacidad, no como catálogo con pricing (develOP-contexto-estable-v1.0.md:19)
3. **Precio de setup del chatbot**
   - Piso de setup sembrado: 700 (Starter), 900 (Pro), 1.000 (Business) (prisma/seeds/sync-plans.ts:71, 87, 103)
   - Setup del chatbot ~USD 300–400, número a confirmar por Franco (handoff-producto-develop.md:58, 166)
4. **Precio del Motor de Reseñas**
   - Precio no cerrado: la pantalla de venta muestra [FALTA:precio] (docs/sprints/p3-a-2-venta.md:84-86; LockedView.tsx:151)
   - La vitrina lo vende a 60 USD/mes (src/lib/data/premium-modules.ts:31)
5. **Módulos premium activos con la integración caída y alcance de los módulos**
   - Motor de Reseñas, Email Marketing, Agenda y Tienda están ACTIVE en el catálogo (src/lib/data/premium-modules.ts:34, 48, 63, 78)
   - Cal.com v1 está apagada: hay que migrar a v2 (la Agenda no funciona) (docs/auditoria-2026-10/01-INVENTARIO.md:109)
   - Propone los 4 módulos para «después» del primer cliente (docs/auditoria-2026-10/06-ATLAS/atlas.curado.json:124, 131, 138, 145)
6. **Ediciones ilimitadas desde el panel**
   - Ediciones chicas gratis e ilimitadas desde el panel (handoff-producto-develop.md:62)
   - «Ediciones ilimitadas desde el panel» es una promesa que el producto no cumple (riesgo Matsu) (docs/_insumos/drive/Franco/Work Flow/Proyecto DevelOP/Contexto/develOP-contexto-profundo-v1.0.md:13)
7. **Prueba social: qué caso es publicable y los claims del home**
   - Existe un caso real publicable: Concesionaria San Miguel (develOP-contexto-profundo-v1.0.md:36)
   - El garage (USD 400) es nombrable a confirmar; Matsu no es caso de éxito; San Miguel sin dato medible publicable (handoff-producto-develop.md:146-148)
   - No hay casos de estudio publicados ni testimonios verificados (PRODUCT.md:75 (raíz))
   - El home pinta claims sin fuente: +340 % consultas, 94 % respuesta automática, 23 h/semana, «CASO REAL / CLIENTES REALES» (docs/probe-monolito-censo.md:411-460)
8. **Rol del setter en la estrategia comercial**
   - El setter es el paso 6: después de 2–3 cierres propios de Franco y un guion probado (develOP-contexto-profundo-v1.0.md:12; develOP-contexto-estable-v1.0.md:13)
   - Toba arranca apenas la herramienta esté lista (docs/BRIEF-VISION-FLUJO-SETTER-v3.md:33)
9. **Recorrido del setter: demo-first o contacto primero**
   - Demo-first: se llega con la demo hecha y el primer contacto ya lleva el link (docs/BRIEF-VISION-FLUJO-SETTER-v3.md:11, 80-88)
   - Primero el mensaje sin link ni precio; la demo después; el link solo con la aprobación de Franco (docs/manual-usuario/00-INDICE.md:43-51; src/lib/leados/flow.ts:92)
   - El código rechaza links en el opener a propósito; cambiarlo es decisión de Franco (docs/HANDOFF-LEADOS-CIERRE.md:75)
   - El brief reemplaza el Gem de diseño por Sonnet + Claude Design y Cal.com por una grilla fija (diferido); el código sigue con Cal.com v2 (docs/BRIEF-VISION-FLUJO-SETTER-v3.md:63, 146-147; src/lib/integrations/cal-com-v2.ts:20)
10. **Qué brief del setter rige**
   - El brief v3 del repo tiene 11 secciones y no tiene recon (docs/BRIEF-VISION-FLUJO-SETTER-v3.md)
   - Cita §9, §12, §20.1 y §21–23 del brief v3 (docs/HANDOFF-LEADOS-CIERRE.md:36, 56, 81-84)
   - El v4 y el doc de corrección viven en docs/decisiones-oslead-vii sin commitear; el doc de corrección no existe (docs/auditorias/A3-VIABILIDAD-BIS-2026-08.md:17-56; Documento sin título.md:691)
   - docs/brief-vision-flujo-setter.md no existía cuando los sprints lo citaban (docs/bitacora-beta-3.md:1209-1210)
11. **Trabajo de OSLead VII reportado como hecho**
   - P43, M14, calibración, M1, G2 y F1–F4 implementados, con suites en verde (docs/_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md:1-4, 322-365, 427-455, 477-491, 580-641, 643-680)
   - Ningún símbolo está en 57c421bc ni en commit alguno; solo un WIP 506e0059 en origin/p25/rafaga-tildes (git log --all -S'obtenerAnguloWow' / 'ESTADO_ITEM_CHEQUEO' / 'registrarCorteFicha' (vacíos))
12. **Navegación en los portales y en /setter**
   - Portales con <Link>, router.refresh() y redirect(); router.push() solo con comentario; triggerTransition() no aplica en portales (CLAUDE.md:12-20 (raíz))
   - El rail del setter navega SOLO por triggerTransition («decisión cerrada · CLAUDE.md») (src/app/(protected)/setter/_components/setter-nav.tsx:45-47; docs/bitacora-beta.md:268)
   - Contradicción viva, abierta como C-26 (docs/bitacora-beta-3.md:1803-1806)
   - En el admin siempre Link y router.refresh(); nunca router.push() directo (docs/admin-changelog/Admin Completo rdc.md:58)
13. **Glassmorphism**
   - Patrón de stack: bg-white/[0.04] backdrop-blur-[20px] backdrop-saturate-[180%] border-white/[0.08] (CLAUDE.md:97 (raíz))
   - El portal usa glassmorphism sutil (docs/design-system.md:7)
   - No usar backdrop-blur ni glassmorphism en ninguna superficie (DESIGN.md:92, 291 (raíz))
   - El glassmorphism se elimina y hay que despatronarlo de CLAUDE.md (docs/probe-motion-sitio.md:434, 466)
14. **Librería de animación**
   - Stack con Framer Motion (CLAUDE.md:3, 80 (raíz); PRODUCT.md:56 (raíz))
   - motion/react, nunca framer-motion (develOP-contexto-estable-v1.0.md:45, 60)
   - package.json tiene motion y no framer-motion; 3 archivos importan framer-motion (About.tsx, Portfolio.tsx, KineticText.tsx) (package.json:153; git grep en 57c421bc)
15. **Colores de servicio en los docs**
   - Web cian, IA verde, automatización ámbar, software violeta (Gate 1 cerrado, opción del código) (CLAUDE.md:99-103 (raíz); DESIGN.md:120-125 (raíz))
   - IA violeta, automatizaciones esmeralda, software ámbar (logic-core-v3/AGENTS.md:56-58)
   - Software índigo (o índigo/violeta) (PRODUCT.md:54 (raíz); develOP-contexto-estable-v1.0.md:69)
16. **Proveedor de IA en las convenciones**
   - IA: Anthropic SDK (Claude Haiku 4.5) (logic-core-v3/AGENTS.md:22)
   - Vertex/Gemini primario (gemini-2.5-flash en los tres planes); Anthropic secundario (prisma/seeds/sync-plans.ts:73, 89, 105; develOP-contexto-estable-v1.0.md:46)
17. **Dirección visual y stack del sitio público**
   - Geist + Geist Mono; no se incorporan familias nuevas; sin backdrop-blur (DESIGN.md:166-170, 291 (raíz); PRODUCT.md:67 (raíz))
   - Instrument Sans, GSAP + ScrollTrigger, Lenis, Sanity y canvas WebGL persistente: decidido, no se reabre (docs/_insumos/drive/Franco/Work Flow/04-MAPA (1).md:89-104; 05-PROMPT-CORTO.md:19-34)
   - Dirección estética abierta (silent luxury o instrumento de precisión) (develOP-contexto-profundo-v1.0.md:169)
   - El código usa Geist y no tiene gsap ni sanity (src/app/layout.tsx:2; package.json)
18. **3D del hero**
   - NO TOCAR: el Hero 3D above the fold es diseño (docs/auditoria-total-pre-deploy.md:103)
   - Eliminar el canvas 3D del hero, ya decidido (docs/probe-motion-sitio.md:428)
   - En main el Hero sigue con R3F, postprocessing y Environment (src/components/layout/Hero.tsx:3-9)
19. **WhatsApp como canal**
   - WhatsApp directo queda fuera de la evolución del chatbot (docs/_insumos/drive/Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:37)
   - Descartado como canal: es un proyecto entero, no una feature (develOP-contexto-profundo-v1.0.md:205)
   - Migrar a BSP oficial 360dialog antes del primer cliente pago (develOP-contexto-profundo-v1.0.md:240)
   - Motor WhatsApp B0–B1 construido y latente (docs/motor-whatsapp/bitacora.md:17, 352, 468, 583; docs/auditoria-2026-10/01-INVENTARIO.md:112)
   - Integración a medias; no se promete (handoff-producto-develop.md:38)
   - WhatsApp Autopilot en el catálogo como COMING_SOON a USD 150 (src/lib/data/premium-modules.ts:84-94)
20. **Plataforma de deploy y crons registrados solo en vercel.json**
   - Despliegue zero-config en Vercel (logic-core-v3/DEPLOY.md:1-3)
   - La config activa es Netlify; vercel.json es legado (netlify.toml:1-32; develOP-contexto-estable-v1.0.md:51)
   - os-follow-up, regenerate-briefs y send-executive-reports solo están en vercel.json y no corren (BUG-047) (vercel.json:2-15; docs/auditoria-2026-10/06-ATLAS/arquitectura.md:72)
   - detect-bot-issues corre cada 15 minutos (docs/operations/cron-jobs.md:6; docs/operations/alerts-types.md:5)
   - vercel.json «hoy no existe» (docs/roadmap-pendientes.md:14)
21. **Migraciones en el deploy**
   - Netlify aplica prisma migrate deploy en el build (docs/operations/00-entornos.md:86; docs/chatbot-deploy.md:71-74)
   - El build solo corre prisma generate y npm run build (netlify.toml:2)
   - Migraciones aditivas contra branch de Neon, nunca producción directa (develOP-contexto-estable-v1.0.md:56)
22. **Entornos: una base o dos**
   - Una sola base para dev y prod: .env y .env.local apuntan al mismo Neon (docs/audits/2026-05-auditoria-db.md:57)
   - La Neon es compartida entre dev y prod (docs/audits/2026-06-revalidacion-dashboard-chatbot.md:21, 189)
   - Branch dev para local y main para prod; los cleanups no se replicaron en main (docs/operations/00-entornos.md:9-19; docs/audits/2026-06-revalidacion.md:24, 34)
23. **Plan de Neon y cold start**
   - Pendiente decidir el upgrade a Neon Launch (docs/sprints/alpha-RESUMEN-FINAL.md:77; logic-core-v3/STATUS.md:233)
   - Decidido: pg_dump propio, sin pagar Launch (docs/bitacora-roadmap.md:9450)
   - Ping cada 4 min ya y Launch cuando haya clientes con uso diario (docs/baselines/2026-05-admin-performance.md:75-107)
   - Cold start de ~1 s en el primer hit (logic-core-v3/STATUS.md:203)
   - Cold start de 14–30 s, más que el corte de ~10 s de la Function free (docs/sprints/infra-2-cold-start-retry.md:18-20)
24. **Política y estado de los backups**
   - Respaldo y recuperación: decisión pendiente, no práctica establecida (docs/_insumos/drive/Franco/Work Flow/develOP-manual-flujo (1).md:723)
   - Backups diarios cifrados con restore-test implementados (docs/operations/neon-backups.md:5-8; .github/workflows/db-backup.yml:41 (raíz))
   - El workflow nunca corrió por falta de secrets (BUG-171) (docs/auditoria-2026-10/06-ATLAS/arquitectura.md:75)
   - Plan de DR creado (docs/sprints/alpha-0-7-baseline-observability.md:20-21)
   - Backups de Neon sin verificar (docs/sprints/alpha-pre-cierre-RESUMEN.md:63)
25. **Estado de Sentry**
   - Sentry instalado, completado y parte del rc feature-complete (docs/sprints/alpha-0-7-baseline-observability.md:14; docs/bitacora-roadmap.md:9547; docs/operations/b14-deploy-checklist.md:281-283)
   - Sin DSN en prod Sentry es un no-op silencioso, inactivo (docs/sprints/infra-1-observabilidad.md:18; docs/bitacora-roadmap.md:17135; docs/privacidad-afirmaciones-cliente.md:65)
   - Sin NEXT_PUBLIC_SENTRY_DSN en el build el SDK queda inerte (docs/auditoria-2026-10/01-INVENTARIO.md:116)
26. **Proveedor de email**
   - Brevo canónico: migrar los consumidores de Resend y quitar la dependencia (docs/audit-repo-20260707.md:258)
   - Resend transaccional y Brevo campañas (develOP-contexto-estable-v1.0.md:48)
   - RESEND_API_KEY para emails (docs/netlify-env-vars.md:29)
   - Las alertas salen por Brevo (docs/operations/alerts-types.md:31)
   - Runtime con Resend, admin con Brevo (docs/consolidacion-planoA-runtime.md:91)
   - Brevo para transaccionales y marketing, Resend para avisos (DEU-070) (docs/auditoria-2026-10/06-ATLAS/arquitectura.md:73)
27. **Versión y criterio de release**
   - v1.0.0 oficialmente released (docs/releases/v1.0.0.md:3-12; docs/sprints/alpha-RESUMEN-FINAL.md:92; logic-core-v3/STATUS.md:4)
   - v1.0.0 ya no era cierto: se re-tagea v0.9.0-rc.1 (docs/bitacora-roadmap.md:7660-7662)
   - Recomienda v1.0.0-rc.1; la v1.0.0 la firma Matsu tras 30 días en prod (docs/bitacora-roadmap.md:9694-9705; docs/operations/b14-deploy-checklist.md:325-332)
   - v0.9.0-rc.1, no en producción (HANDOFF-cierre-sesion-evolucion.md:9)
   - package.json en 0.1.0 y sin tags v* locales (package.json:3)
28. **Trabajo post-turno del chatbot: outbox o fire-and-forget**
   - Leads del bot al CRM externo vía patrón outbox/async (develOP-contexto-estable-v1.0.md:37)
   - Se acepta hoy que notifyClient, Telegram y syncLeadToCrm se pierdan con el freeze; el outbox va en un sprint con migración (docs/bitacora-roadmap.md:17140-17161)
29. **Aviso de Telegram con PII de visitantes**
   - Decisión de producto pendiente: mantener el aviso con nombre y contacto y declararlo en el contrato, o mandar solo un identificador (docs/privacidad-afirmaciones-cliente.md:58-66)
   - Pendiente desde el BLOQUE PRIVACIDAD, sin registro posterior (docs/bitacora-roadmap.md:16897)
30. **Purga del secret filtrado en la historia**
   - Purgar enviroment.env con git-filter-repo y force-push coordinado con el socio (docs/audits/2026-05-bfg-leak-cleanup.md:169-205)
   - El force-push nunca se aplicó; el archivo sigue alcanzable desde main (docs/bitacora-roadmap.md:45-48; docs/audits/2026-06-revalidacion.md:22, 40)
   - La key estaba deshabilitada o rotada antes del hallazgo (no verificable) (docs/audits/2026-05-bfg-leak-cleanup.md:17, 204)
31. **Visibilidad del repo y docs que enumeran vulnerabilidades**
   - Pasar el repo a privado o mover docs/auditoria*, audits y baselines a un repo privado; no publicar este doc mientras el repo sea público (docs/baselines/2026-07-auditoria-seguridad.md:73, 3594-3606, 3830)
   - El repo es público; por eso los artifacts del backup se cifran (docs/operations/neon-backups.md:49-52)
32. **Dependencias con advisories: next y next-auth beta**
   - P0: 14 advisories en Next 16.2.1 (docs/auditoria-seguridad-2026-05.md:22, 72-85)
   - El P0 estaba sobredimensionado: 2 moderate (docs/audits/2026-06-revalidacion.md:90)
   - Reabierto: next 16.2.9 suma 9 advisories (4 alcanzables) y next-auth beta.31 trae 2 críticas (docs/baselines/2026-07-auditoria-seguridad.md:3404, 3452)
   - NextAuth v5 beta se mantiene pinneada hasta que haya stable (develOP-contexto-estable-v1.0.md:44)
33. **Experimento FG-2 y su laboratorio**
   - Gate abierto: no se construye el formulario estructurado sin correr el experimento 5 contra 5 (docs/experimentos/fg2-brief-experimento.md:3-5)
   - El log y la decisión están vacíos: el experimento nunca se corrió (docs/experimentos/fg2-brief-experimento.md:166-201)
   - /admin/fg2-lab y _experimental son descartables y se borran tomada la decisión (docs/bitacora-beta.md:1534-1536)
   - Propone descartar la herramienta h5.adm-fg2lab (docs/auditoria-2026-10/06-ATLAS/atlas.curado.json:341)
34. **Rol CLIENT**
   - ORG_MEMBER / CLIENT → /dashboard/* (CLAUDE.md:109 (raíz))
   - Roles: SUPER_ADMIN, ORG_MEMBER, CLIENT, SETTER (develOP-contexto-estable-v1.0.md:32)
   - El proxy solo conoce SUPER_ADMIN, ORG_MEMBER y SETTER (src/proxy.ts:10-16)
   - CLIENT es redirigido a /login (docs/client-portal/relevamiento-global.md:20, 625-629)
35. **Alcance 1.0 del setter sin la revisión de demos**
   - Propone las 5 herramientas del setter para 1.0 (docs/auditoria-2026-10/06-ATLAS/atlas.curado.json:299-327)
   - Propone la revisión de demos (h5.adm-revision-demos) para después (docs/auditoria-2026-10/06-ATLAS/atlas.curado.json:334)
   - El link de la demo solo sale con la demo APROBADA por Franco; su revisión no se automatiza (src/lib/leados/flow.ts:92; docs/BRIEF-VISION-FLUJO-SETTER-v3.md:100-101)
36. **Dónde viven el método y el estado volátil**
   - El método vive en la carpeta WF/ del repo; el estado volátil en STATUS.md, bitacora-roadmap.md, roadmap-pendientes.md y chatbot-sprints.md (develOP-contexto-estable-v1.0.md:75, 80-81)
   - El Cimiento y el Manual de Flujo no existen en el repo (docs/metodo/PROPUESTA-CIMIENTO.md:6-11)
   - No hay WF/ en 57c421bc; los documentos están en el Drive de Franco (git ls-tree 57c421bc; docs/_insumos/drive/Franco/Work Flow/)
   - Propone 10 docs vivos que reemplazan STATUS, bitácoras y roadmap-pendientes (E11 (esta propuesta))
37. **Asignación de modelos y esfuerzo**
   - Tope Opus 4.8, Fable retirado, ultracode solo en builds arquitectónicos (HANDOFF-cierre-sesion-evolucion.md:13, 42)
   - Correr el manual M1 v2 con Fable + ultracode (docs/SPRINT-M1-MANUAL-v2.md:12)
   - Opus ejecuta, Sonnet evalúa en paralelo, Fable audita (docs/_insumos/drive/Franco/Work Flow/Iniciar Nuevo Chat/config-ejecucion-claude-desktop.md:9-14)
   - Planificar con Opus, ejecutar con Sonnet, explorar con Haiku (docs/_insumos/drive/Franco/Work Flow/Iniciar Nuevo Chat/develOP-cimiento-chat (7) (1).md:157-165)
   - Lo mecánico va a Sonnet 4.6 con esfuerzo máximo (docs/consolidacion-planoA-runtime.md:47)
