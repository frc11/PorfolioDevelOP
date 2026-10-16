> BORRADOR de la auditoría 2026-10 (E11, DEC-44). No reemplaza todavía a ningún doc: borrar y reemplazar es un sprint posterior (ver `10-PODA.md` §docs). Cada afirmación lleva su fuente.

# Historial

> **Borrador E11** · base `57c421bc` · destino propuesto `logic-core-v3/docs/HISTORIAL.md`.
> No es un changelog: es el mapa para encontrar en git lo que la poda saca del árbol. Todos los docs listados existen en `57c421bc`. Para recuperar uno: primero `git ls-tree 57c421bc -- logic-core-v3/docs/<ruta>` (en Git Bash, `git show` da falsos negativos de ausencia: docs/bitacora-beta-3.md:10968-10971) y después `git show 57c421bc:logic-core-v3/docs/<ruta>`.
> Varios contienen secretos o contraseñas (SEGURIDAD-Y-PRIVACIDAD.md §3.1): recuperarlos para leer está bien; copiarlos a un doc nuevo, no.

## 1. Eras

| Período | Qué pasó | Dónde está contado |
|---|---|---|
| mar–abr 2026 | Sitio portfolio, Entrega 2 del dashboard, limpieza previa | docs/research/2026-04-entrega-2-pre-research.md; docs/audit/2026-04-dashboard-cleanup-audit.md; docs/onboarding-flow.md; logic-core-v3/__dev_task.md |
| 2026-05-16 → 05-20 | Fase Alpha (21 sprints): limpieza del admin, wizard de onboarding, design system, editor de KB, e2e; MVP del chatbot S0–S23; «v1.0» declarada | docs/sprints/alpha-*.md; docs/releases/v1.0.0.md; logic-core-v3/CHANGELOG.md; docs/chatbot-sprints.md; docs/sprint-alpha-3-kb-editor.md |
| 2026-05-21 → 08-12 | Bitácora de roadmap: B0 (purga del leak preparada), performance, prompt, planes y gating (B4), scoring, CRM y CSV (B5), reportes (B6), widget (B8), multi-tenant (B11), RC (B12), B14 (rate limit, backups, Sentry), EV y P1–P5 del panel, INFRA, COST y crons, runtime del stream (WATCHDOG, MUDEZ, VOZ, PRIVACIDAD, CARRERAS, que quedó en curso) | docs/bitacora-roadmap.md |
| 2026-05-21 → 06-05 | Auditorías de base, profunda y de seguridad; revalidación | docs/audits/*; docs/auditoria-seguridad-2026-05.md; docs/baselines/2026-05-*.md |
| 2026-06-12 → 06-14 | LeadOS B7–B9: wizard, hardening, refresh visual | docs/b7-probe-cal-com.md; docs/b8a-*.md; docs/b9-*.md |
| 2026-06-14 → 06-28 | Lanes del admin y del portal en worktrees | docs/admin-changelog/*; docs/client-portal/*; raíz:lane-*.md; logic-core-v3/_lane-*.md; logic-core-v3/CHANGELOG-cuenta.md |
| 2026-06-17 → 06-25 | Beta de LeadOS: guard de seeds, cabina del setter, capa de guía, laboratorio FG-2 | docs/bitacora-beta.md; docs/experimentos/* |
| 2026-06-25 → 06-29 | Foco y modo dirección; franja admin D4 | docs/bitacora-beta-2.md |
| 2026-06-29 → 09-06 | Manual paso a paso, AUD-1/AUD-2/A3, remediación, poda P1–P23, gate de CI, EL TRONCO (25 sprints a main) | docs/bitacora-beta-3.md; docs/auditorias/*; docs/manual-usuario/*; docs/metodo/*; docs/baselines/p*.json |
| 2026-07-04 → 07-09 | Runtime y panel: UTM, GBP, Motor de Reseñas, campañas, evals Q1, INFRA.1 y .2; auditoría integral y consolidación del plano A | docs/sprints/{utm-1,p3-a-*,p4-1,q1-*,infra-*}.md; docs/audit-repo-20260707.md; docs/consolidacion-planoA-runtime.md; docs/audit-chatbot-runtime.md |
| 2026-07-06 → 07-10 | Motor WhatsApp B0–B1 | docs/motor-whatsapp/bitacora.md |
| 2026-07-29 | Auditoría de seguridad dedicada (75 hallazgos) | docs/baselines/2026-07-auditoria-seguridad.md |
| 2026-07-30 → 08-12 | Rediseño del sitio y vuelta a la home clásica | docs/bitacora-rediseno.md; docs/sprints/sprint-b0*.md; docs/probe-*.md; raíz:DESIGN.md; raíz:PRODUCT.md |
| 2026-08-13 → 08-31 | Censo de superficies, viabilidad de OSLead VII, red de verificación, diagnósticos visuales, corrida de recorrido | docs/auditorias/A1..C0; docs/diagnostico-visual-*; docs/verificacion-arranque-oslead-vii.md; docs/corrida-recorrido-2026-08-31/ |
| 2026-09-06 | Base auditada `57c421bc` | — |
| 2026-10 | Auditoría 2026-10 y estos docs vivos | docs/auditoria-2026-10/ |

## 2. Versiones

**[A DECIDIR]** Hubo una release v1.0.0 declarada el 2026-05-20 (docs/releases/v1.0.0.md:3-12), retirada y re-tageada como v0.9.0-rc.1 (docs/bitacora-roadmap.md:7660-7662); `package.json:3` dice 0.1.0 y no hay tags `v*` locales.

## 3. Duplicaciones conocidas (no restaurar dos veces)

- docs/bitacora-roadmap.md:10530-10802 es docs/bitacora-beta.md:11-283 con 4 líneas de diferencia.
- docs/bitacora-beta.md:1639-1728 repite los sprints 0.2 y 0.3 de bitacora-beta-2.md.
- docs/admin-changelog/Admin Operaciones rdc.md es idéntico a Dashboard rdc.md.
- logic-core-v3/CHANGELOG-cuenta.md casi duplica docs/client-portal/changelog/cuenta.md.
- Las copias del Drive de Olme (`Admin - Registro de cambios/`, `Cliente - Registro de cambios/`) repiten docs/admin-changelog/ y docs/client-portal/changelog/ salvo formato. Solo en Drive: «Chatbot_ registro de cambios» (une Chatbot rdc.md y raíz:lane-LOG.md) y «Portal General_ registro de cambios».

## 4. Docs que quedan después de la poda

- Los 10 docs vivos: VISION, ARQUITECTURA, ROADMAP, DECISIONES, OPERACIONES, LECCIONES, SEGURIDAD-Y-PRIVACIDAD, LEADOS, DISENO e HISTORIAL.
- Insumos de herramientas y agentes: raíz:CLAUDE.md, logic-core-v3/AGENTS.md, logic-core-v3/README.md, raíz:DESIGN.md, raíz:PRODUCT.md, raíz:.github/skills/impeccable/.
- Producto para setters: docs/BRIEF-VISION-FLUJO-SETTER-v3.md, docs/manual-usuario/ (capítulos, galería y método de redacción), docs/experimentos/fg2-brief-experimento.md hasta decidir FG-2.
- Datos: docs/impeccable-baseline.json; README de evals en src/modules/chatbot/evals/README.md.
- La auditoría: docs/auditoria-2026-10/ (fuente del Atlas, del que se regeneran ARQUITECTURA y ROADMAP).
