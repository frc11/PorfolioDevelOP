# 10 — Poda

> Triage de poda de la ENMIENDA-01 E2 (DEC-36). Generado por `scripts/auditoria/poda.mjs` + `poda-md.mjs` sobre `origin/main`, con `origin/rediseno/home` como referencia de lo que no se toca; fecha de referencia 2026-10-13. knip: **NO disponible**. Las señales son candidatos, no verdad: la confianza ALTA exige dos señales independientes, «nada encontrado» en la búsqueda de qué rompe y que no sea zona congelada, de Franco ni de `rediseno/home`. **No se borra nada en esta corrida.**

## Resumen

| Categoría | ALTA | MEDIA | BAJA | Esperar rediseño | LOC |
|---|---|---|---|---|---|
| Archivos | 19 | 1 | 15 | 34 | 14015 |
| Server actions sin llamador | 0 | 10 | 0 | 0 | 0 |
| Rutas sin entrada | 0 | 3 | 0 | 0 | 189 |
| Configuraciones y docs de plataforma muertos | 0 | 2 | 0 | 0 | 81 |
| Scripts one-off y sueltos | 73 | 15 | 0 | 0 | 16083 |
| Salidas generadas y temporales commiteadas | 30 | 0 | 0 | 0 | 835 |
| Valores de enum sin uso | 0 | 0 | 2 | 0 | 0 |
| Ramas | 43 | 5 | 9 | 20 | 0 |
| **Total** | **165** | **36** | **26** | **54** | **31203** |

## Regla por defecto para F2 (PODA-ALTA)

Los archivos de confianza ALTA (categorías archivo y script, fuera de `rediseno/home`) que el ledger tenía como **profundo** pasan a lectura **superficial** (estado `superficial`, nota `PODA-ALTA`): **31 archivos, 4648 LOC** que quedan fuera de la lectura profunda. Lista: `_crudo/lista-poda-alta.txt`. Si Valentino decide conservar alguno, se audita en ese momento.

## Archivos

### [POD-001] src/actions/admin/onboarding-tasks.ts
- Archivos · `src/actions/admin/onboarding-tasks.ts` · 64 LOC · Nodo(s): lib.actions · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 161 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «onboarding-tasks» y specifier «@/actions/admin/onboarding-tasks» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-002] src/actions/metrics-actions.ts
- Archivos · `src/actions/metrics-actions.ts` · 54 LOC · Nodo(s): lib.actions · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 140 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «metrics-actions» y specifier «@/actions/metrics-actions» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-003] src/actions/task-approvals.ts
- Archivos · `src/actions/task-approvals.ts` · 136 LOC · Nodo(s): lib.actions · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 151 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «task-approvals» y specifier «@/actions/task-approvals» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-004] src/app/(protected)/admin/clients/_actions/client.schemas.ts
- Archivos · `src/app/(protected)/admin/clients/_actions/client.schemas.ts` · 19 LOC · Nodo(s): h4.adm-clientes · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 151 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «client.schemas» y specifier «@/app/(protected)/admin/clients/_actions/client.schemas» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-005] src/app/(protected)/admin/projects/_components/convert-lead-dialog.tsx
- Archivos · `src/app/(protected)/admin/projects/_components/convert-lead-dialog.tsx` · 279 LOC · Nodo(s): h4.adm-proyectos · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 139 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «convert-lead-dialog» y specifier «@/app/(protected)/admin/projects/_components/convert-lead-dialog» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-013] src/components/dashboard/AnalyticsPeriodSelector.tsx
- Archivos · `src/components/dashboard/AnalyticsPeriodSelector.tsx` · 27 LOC · Nodo(s): lib.componentes-dashboard · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 200 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «AnalyticsPeriodSelector» y specifier «@/components/dashboard/AnalyticsPeriodSelector» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-014] src/components/dashboard/AnimatedTaskList.tsx
- Archivos · `src/components/dashboard/AnimatedTaskList.tsx` · 28 LOC · Nodo(s): lib.componentes-dashboard · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «AnimatedTaskList» y specifier «@/components/dashboard/AnimatedTaskList» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-015] src/components/dashboard/CurrentMilestone.tsx
- Archivos · `src/components/dashboard/CurrentMilestone.tsx` · 79 LOC · Nodo(s): lib.componentes-dashboard · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «CurrentMilestone» y specifier «@/components/dashboard/CurrentMilestone» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-016] src/components/dashboard/DownloadReportButton.tsx
- Archivos · `src/components/dashboard/DownloadReportButton.tsx` · 139 LOC · Nodo(s): lib.componentes-dashboard · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 204 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «DownloadReportButton» y specifier «@/components/dashboard/DownloadReportButton» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-017] src/components/dashboard/LeakMeter.tsx
- Archivos · `src/components/dashboard/LeakMeter.tsx` · 116 LOC · Nodo(s): lib.componentes-dashboard · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 140 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «LeakMeter» y specifier «@/components/dashboard/LeakMeter» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-018] src/components/dashboard/TicketStatusSelector.tsx
- Archivos · `src/components/dashboard/TicketStatusSelector.tsx` · 78 LOC · Nodo(s): lib.componentes-dashboard · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 112 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «TicketStatusSelector» y specifier «@/components/dashboard/TicketStatusSelector» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-019] src/components/dashboard/UpsellCard.tsx
- Archivos · `src/components/dashboard/UpsellCard.tsx` · 180 LOC · Nodo(s): lib.componentes-dashboard · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «UpsellCard» y specifier «@/components/dashboard/UpsellCard» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-023] src/components/onboarding/OnboardingWizard.tsx
- Archivos · `src/components/onboarding/OnboardingWizard.tsx` · 500 LOC · Nodo(s): h4.adm-clientes · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «OnboardingWizard» y specifier «@/components/onboarding/OnboardingWizard» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-045] src/components/ui/HeroTitle.tsx
- Archivos · `src/components/ui/HeroTitle.tsx` · 150 LOC · Nodo(s): lib.ui · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «HeroTitle» y specifier «@/components/ui/HeroTitle» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: decidir (Valentino): está congelado en esta corrida
- Zona: congelado

### [POD-046] src/lib/actions/invitations.ts
- Archivos · `src/lib/actions/invitations.ts` · 118 LOC · Nodo(s): h1.auth-invite · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 161 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «invitations» y specifier «@/lib/actions/invitations» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-047] src/lib/client-health.ts
- Archivos · `src/lib/client-health.ts` · 36 LOC · Nodo(s): lib.client-health · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 200 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «client-health» y specifier «@/lib/client-health» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-048] src/lib/cn.ts
- Archivos · `src/lib/cn.ts` · 6 LOC · Nodo(s): lib.cn · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 200 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «cn» y specifier «@/lib/cn» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-049] src/lib/design-patterns.ts
- Archivos · `src/lib/design-patterns.ts` · 70 LOC · Nodo(s): lib.design-patterns · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 148 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «design-patterns» y specifier «@/lib/design-patterns» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-050] src/modules/chatbot/components/admin/config/Toggle.tsx
- Archivos · `src/modules/chatbot/components/admin/config/Toggle.tsx` · 34 LOC · Nodo(s): h3.adm-chatbots · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 149 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «Toggle» y specifier «@/modules/chatbot/components/admin/config/Toggle» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-051] src/modules/chatbot/prisma/update-proactive-prompts.ts
- Archivos · `src/modules/chatbot/prisma/update-proactive-prompts.ts` · 60 LOC · Nodo(s): lib.chatbot.prisma · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 96 días y sin importadores; entrada de CLI (package.json o carpeta de scripts/evals/seeds)
- Qué rompe si se borra: nada encontrado (nombre base «update-proactive-prompts» y specifier «@/modules/chatbot/prisma/update-proactive-prompts» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-052] src/app/(protected)/admin/fg2-lab/_components/fg2-lab-client.tsx
- Archivos · `src/app/(protected)/admin/fg2-lab/_components/fg2-lab-client.tsx` · 305 LOC · Nodo(s): h5.adm-fg2lab · Señales: marcado en el código (« * 🧪 EXPERIMENTAL / DESCARTABLE»)
- Qué rompe si se borra: referencias: src/app/(protected)/admin/fg2-lab/page.tsx (nombre base «fg2-lab-client» y specifier «@/app/(protected)/admin/fg2-lab/_components/fg2-lab-client» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: decidir (Franco)
- Zona: ZONA-FRANCO

### [POD-053] src/app/(protected)/admin/fg2-lab/_components/medicion-panel.tsx
- Archivos · `src/app/(protected)/admin/fg2-lab/_components/medicion-panel.tsx` · 195 LOC · Nodo(s): h5.adm-fg2lab · Señales: marcado en el código (« * 🧪 EXPERIMENTAL / DESCARTABLE»)
- Qué rompe si se borra: referencias: src/app/(protected)/admin/fg2-lab/_components/fg2-lab-client.tsx (nombre base «medicion-panel» y specifier «@/app/(protected)/admin/fg2-lab/_components/medicion-panel» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: decidir (Franco)
- Zona: ZONA-FRANCO

### [POD-054] src/app/(protected)/setter/leads/[leadId]/_components/brief-form.tsx
- Archivos · `src/app/(protected)/setter/leads/[leadId]/_components/brief-form.tsx` · 284 LOC · Nodo(s): h5.set-lead · Señales: marcado en el código (« * Si alguien lo saca de `BriefFormState`/`aPayloadBrief` "porque no se usa»)
- Qué rompe si se borra: referencias: src/app/(protected)/setter/leads/[leadId]/manual/_components/brief-sanity.tsx, src/app/(protected)/setter/leads/[leadId]/manual/_components/m13-borrador.tsx, src/app/(protected)/setter/leads/[leadId]/manual/_components/m14-chequeo.tsx, src/app/(protected)/setter/leads/[leadId]/manual/_components/m6-brief.tsx (nombre base «brief-form» y specifier «@/app/(protected)/setter/leads/[leadId]/_components/brief-form» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: decidir (Franco)
- Zona: ZONA-FRANCO

### [POD-058] src/lib/actions/clients.ts
- Archivos · `src/lib/actions/clients.ts` · 227 LOC · Nodo(s): h4.adm-clientes · Señales: huérfano de depcruise; último commit hace 115 días y sin importadores
- Qué rompe si se borra: referencias: src/actions/admin/onboarding-tasks.ts, src/actions/agency-actions.ts, src/app/(protected)/admin/_components/AdminErrorBoundary.tsx, src/app/(protected)/admin/_components/admin-sidebar.tsx, src/app/(protected)/admin/clients/[clientId]/_components/ClientHeader.tsx, src/app/(protected)/admin/clients/[clientId]/_components/ClientSwitcher.tsx +33 (nombre base «clients» y specifier «@/lib/actions/clients» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-059] src/lib/actions/gbp-connection.ts
- Archivos · `src/lib/actions/gbp-connection.ts` · 58 LOC · Nodo(s): h2.cli-resenas · Señales: huérfano de depcruise; último commit hace 101 días y sin importadores
- Qué rompe si se borra: referencias: package.json (nombre base «gbp-connection» y specifier «@/lib/actions/gbp-connection» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-060] src/lib/actions/leads.ts
- Archivos · `src/lib/actions/leads.ts` · 68 LOC · Nodo(s): h4.adm-leads · Señales: huérfano de depcruise; último commit hace 200 días y sin importadores
- Qué rompe si se borra: referencias: next.config.ts, prisma/seeds/backfill-vertical-pack.ts, scripts/b7-qa-agenda.ts, scripts/qa-corridas/_p21-corrida.ts, scripts/qa-corridas/_p23/capturas.ts, scripts/qa-corridas/_p23/censo-ubicaciones.ts +84 (nombre base «leads» y specifier «@/lib/actions/leads» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-061] src/lib/actions/services.ts
- Archivos · `src/lib/actions/services.ts` · 91 LOC · Nodo(s): h4.adm-config · Señales: huérfano de depcruise; último commit hace 130 días y sin importadores
- Qué rompe si se borra: referencias: next.config.ts, src/app/(protected)/admin/settings/_actions/settings.actions.ts, src/components/dashboard/CurrentPlanCard.tsx, src/components/dashboard/LeakMeter.tsx, src/components/dashboard/SidebarNav.tsx, src/lib/actions/settings.ts (nombre base «services» y specifier «@/lib/actions/services» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-062] src/lib/actions/settings.ts
- Archivos · `src/lib/actions/settings.ts` · 364 LOC · Nodo(s): h4.adm-config · Señales: huérfano de depcruise; último commit hace 139 días y sin importadores
- Qué rompe si se borra: referencias: src/app/(protected)/admin/_components/admin-sidebar.tsx, src/app/(protected)/admin/leados/page.tsx, src/app/(protected)/admin/settings/_actions/settings.actions.ts, src/lib/alerts.ts, src/modules/chatbot/components/dashboard/ClientDashboardTabs.tsx, src/modules/chatbot/components/preview/types.ts +5 (nombre base «settings» y specifier «@/lib/actions/settings» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-063] src/lib/leados/_experimental/fg2-brief-lab.ts
- Archivos · `src/lib/leados/_experimental/fg2-brief-lab.ts` · 375 LOC · Nodo(s): lib.leados · Señales: marcado en el código (« * 🧪 EXPERIMENTAL / DESCARTABLE»)
- Qué rompe si se borra: referencias: scripts/_experimental/fg2-gen-prompts.ts, src/app/(protected)/admin/fg2-lab/_components/fg2-lab-client.tsx, src/app/(protected)/admin/fg2-lab/_components/medicion-panel.tsx, src/app/(protected)/admin/fg2-lab/page.tsx, src/lib/leados/_experimental/fg2-casos-gastro.ts (nombre base «fg2-brief-lab» y specifier «@/lib/leados/_experimental/fg2-brief-lab» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: decidir (Franco)
- Zona: ZONA-FRANCO

### [POD-064] src/lib/leados/_experimental/fg2-casos-gastro.ts
- Archivos · `src/lib/leados/_experimental/fg2-casos-gastro.ts` · 210 LOC · Nodo(s): lib.leados · Señales: marcado en el código (« * 🧪 EXPERIMENTAL / DESCARTABLE»)
- Qué rompe si se borra: referencias: scripts/_experimental/fg2-gen-prompts.ts, src/app/(protected)/admin/fg2-lab/_components/fg2-lab-client.tsx (nombre base «fg2-casos-gastro» y specifier «@/lib/leados/_experimental/fg2-casos-gastro» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: decidir (Franco)
- Zona: ZONA-FRANCO

### [POD-065] src/modules/chatbot/evals/runner.ts
- Archivos · `src/modules/chatbot/evals/runner.ts` · 366 LOC · Nodo(s): lib.chatbot.evals · Señales: huérfano de depcruise; último commit hace 96 días y sin importadores; entrada de CLI (package.json o carpeta de scripts/evals/seeds)
- Qué rompe si se borra: referencias: package.json, prisma/seeds/backfill-vertical-pack.ts (nombre base «runner» y specifier «@/modules/chatbot/evals/runner» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-066] src/modules/chatbot/evals/scoring/evaluate.ts
- Archivos · `src/modules/chatbot/evals/scoring/evaluate.ts` · 92 LOC · Nodo(s): lib.chatbot.evals · Señales: huérfano de depcruise; último commit hace 100 días y sin importadores; entrada de CLI (package.json o carpeta de scripts/evals/seeds)
- Qué rompe si se borra: referencias: package.json, scripts/qa-corridas/_p23/censo-ubicaciones.ts (nombre base «evaluate» y specifier «@/modules/chatbot/evals/scoring/evaluate» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-067] src/modules/chatbot/evals/seed-eval-bots.ts
- Archivos · `src/modules/chatbot/evals/seed-eval-bots.ts` · 223 LOC · Nodo(s): lib.chatbot.evals · Señales: huérfano de depcruise; último commit hace 96 días y sin importadores; entrada de CLI (package.json o carpeta de scripts/evals/seeds)
- Qué rompe si se borra: referencias: package.json (nombre base «seed-eval-bots» y specifier «@/modules/chatbot/evals/seed-eval-bots» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-068] src/modules/chatbot/prisma/seed.ts
- Archivos · `src/modules/chatbot/prisma/seed.ts` · 378 LOC · Nodo(s): lib.chatbot.prisma · Señales: huérfano de depcruise; último commit hace 96 días y sin importadores; entrada de CLI (package.json o carpeta de scripts/evals/seeds)
- Qué rompe si se borra: referencias: prisma.config.ts, prisma/seeds/backfill-vertical-pack.ts, scripts/b3-qa-assign-leads.ts, scripts/b4-qa-construccion.ts, scripts/b5-qa-review-queue.ts, scripts/b6-qa-outreach.ts +7 (nombre base «seed» y specifier «@/modules/chatbot/prisma/seed» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-069] src/modules/motor/services/sendMessage.ts
- Archivos · `src/modules/motor/services/sendMessage.ts` · 256 LOC · Nodo(s): h3.vis-whatsapp · Señales: huérfano de depcruise; último commit hace 95 días y sin importadores
- Qué rompe si se borra: referencias: src/lib/notifications/telegram.ts, src/modules/motor/domain/window.ts, tests/integration/motor-outbound.spec.ts (nombre base «sendMessage» y specifier «@/modules/motor/services/sendMessage» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: decidir (Valentino)
- Zona: libre

## Server actions sin llamador

### [POD-070] src/app/(protected)/admin/leads/_actions/lead.actions.ts: listLeads, getLeadById
- Server actions sin llamador · `src/app/(protected)/admin/leads/_actions/lead.actions.ts` · 0 LOC · Nodo(s): h4.adm-leads · Señales: export sin ninguna mención por nombre fuera de su archivo
- Qué rompe si se borra: nada encontrado (git grep de cada nombre en 1624 archivos)
- Confianza de poda: MEDIA
- Propuesta: decidir (Franco)
- Zona: ZONA-FRANCO

### [POD-071] src/app/(protected)/admin/projects/_actions/maintenance.actions.ts: createMaintenancePayment
- Server actions sin llamador · `src/app/(protected)/admin/projects/_actions/maintenance.actions.ts` · 0 LOC · Nodo(s): h4.adm-proyectos · Señales: export sin ninguna mención por nombre fuera de su archivo
- Qué rompe si se borra: nada encontrado (git grep de cada nombre en 1624 archivos)
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-072] src/app/(protected)/admin/projects/_actions/milestone.actions.ts: unmarkMilestonePaid
- Server actions sin llamador · `src/app/(protected)/admin/projects/_actions/milestone.actions.ts` · 0 LOC · Nodo(s): h4.adm-proyectos · Señales: export sin ninguna mención por nombre fuera de su archivo
- Qué rompe si se borra: nada encontrado (git grep de cada nombre en 1624 archivos)
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-073] src/app/(protected)/admin/projects/_actions/project.actions.ts: getProjectById
- Server actions sin llamador · `src/app/(protected)/admin/projects/_actions/project.actions.ts` · 0 LOC · Nodo(s): h4.adm-proyectos · Señales: export sin ninguna mención por nombre fuera de su archivo
- Qué rompe si se borra: nada encontrado (git grep de cada nombre en 1624 archivos)
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-074] src/app/(protected)/admin/team/_actions/task.actions.ts: reorderTasks, listTasksByUser
- Server actions sin llamador · `src/app/(protected)/admin/team/_actions/task.actions.ts` · 0 LOC · Nodo(s): h4.adm-equipo · Señales: export sin ninguna mención por nombre fuera de su archivo
- Qué rompe si se borra: nada encontrado (git grep de cada nombre en 1624 archivos)
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-075] src/app/(protected)/admin/team/_actions/time-entry.actions.ts: updateTimeEntry, listTimeEntriesByUser
- Server actions sin llamador · `src/app/(protected)/admin/team/_actions/time-entry.actions.ts` · 0 LOC · Nodo(s): h4.adm-equipo · Señales: export sin ninguna mención por nombre fuera de su archivo
- Qué rompe si se borra: nada encontrado (git grep de cada nombre en 1624 archivos)
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-076] src/lib/actions/contact.ts: contactFormAction, markLeadAsRead
- Server actions sin llamador · `src/lib/actions/contact.ts` · 0 LOC · Nodo(s): h6.vis-contacto · Señales: export sin ninguna mención por nombre fuera de su archivo
- Qué rompe si se borra: nada encontrado (git grep de cada nombre en 1624 archivos)
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-077] src/lib/actions/messages.ts: sendMessageAction, markAdminMessagesAsReadAction, markMessagesAsReadAction
- Server actions sin llamador · `src/lib/actions/messages.ts` · 0 LOC · Nodo(s): h2.cli-mensajes · Señales: export sin ninguna mención por nombre fuera de su archivo
- Qué rompe si se borra: nada encontrado (git grep de cada nombre en 1624 archivos)
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-078] src/lib/actions/notifications.ts: markNotificationReadAction
- Server actions sin llamador · `src/lib/actions/notifications.ts` · 0 LOC · Nodo(s): h2.cli-shell · Señales: export sin ninguna mención por nombre fuera de su archivo
- Qué rompe si se borra: nada encontrado (git grep de cada nombre en 1624 archivos)
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-079] src/lib/actions/projects.ts: createProjectAction, updateProjectAction, createTaskAction, updateTaskStatusAction, deleteTaskAction
- Server actions sin llamador · `src/lib/actions/projects.ts` · 0 LOC · Nodo(s): h4.adm-proyectos · Señales: export sin ninguna mención por nombre fuera de su archivo
- Qué rompe si se borra: nada encontrado (git grep de cada nombre en 1624 archivos)
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

## Rutas sin entrada

### [POD-080] /admin/fg2-lab (src/app/(protected)/admin/fg2-lab/page.tsx)
- Rutas sin entrada · `src/app/(protected)/admin/fg2-lab/page.tsx` · 92 LOC · Nodo(s): h5.adm-fg2lab · Señales: ruta sin link, redirect, href ni push que la nombre
- Qué rompe si se borra: nada encontrado (literal «/admin/fg2-lab» en 1624 archivos; las URL armadas con constantes no se ven)
- Confianza de poda: MEDIA
- Propuesta: decidir (Franco)
- Zona: ZONA-FRANCO

### [POD-081] /admin/settings/alerts (src/app/(protected)/admin/settings/alerts/page.tsx)
- Rutas sin entrada · `src/app/(protected)/admin/settings/alerts/page.tsx` · 42 LOC · Nodo(s): h4.adm-config · Señales: ruta sin link, redirect, href ni push que la nombre
- Qué rompe si se borra: nada encontrado (literal «/admin/settings/alerts» en 1624 archivos; las URL armadas con constantes no se ven)
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-082] /admin/settings/reports (src/app/(protected)/admin/settings/reports/page.tsx)
- Rutas sin entrada · `src/app/(protected)/admin/settings/reports/page.tsx` · 55 LOC · Nodo(s): h4.adm-config · Señales: ruta sin link, redirect, href ni push que la nombre
- Qué rompe si se borra: nada encontrado (literal «/admin/settings/reports» en 1624 archivos; las URL armadas con constantes no se ven)
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

## Configuraciones y docs de plataforma muertos

### [POD-083] DEPLOY.md
- Configuraciones y docs de plataforma muertos · `DEPLOY.md` · 65 LOC · Nodo(s): doc.deploy · Señales: describe un deploy en Vercel con Resend y n8n; la configuración viva es Netlify
- Qué rompe si se borra: nada en runtime
- Confianza de poda: MEDIA
- Propuesta: fusionar con el doc de operaciones de 14-DOCS-CONSOLIDADOS y después borrar
- Zona: libre

### [POD-084] vercel.json
- Configuraciones y docs de plataforma muertos · `vercel.json` · 16 LOC · Nodo(s): lib.plataforma.vercel · Señales: declara 3 crons de Vercel en un deploy de Netlify (netlify.toml); hay que mover los crons antes de borrarlo
- Qué rompe si se borra: se pierde la única declaración de os-follow-up, regenerate-briefs y send-executive-reports
- Confianza de poda: MEDIA
- Propuesta: fusionar con netlify.toml (mover los 3 crons) y después borrar
- Zona: libre

## Scripts one-off y sueltos

### [POD-085] find_unused.js
- Scripts one-off y sueltos · `find_unused.js` · 65 LOC · Nodo(s): lib.plataforma.find-unused · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 222 días
- Qué rompe si se borra: nada encontrado (nombre base «find_unused» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-086] replace_analytics.js
- Scripts one-off y sueltos · `replace_analytics.js` · 274 LOC · Nodo(s): lib.plataforma.replace-analytics · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 193 días
- Qué rompe si se borra: nada encontrado (nombre base «replace_analytics» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-087] script_aiscene.js
- Scripts one-off y sueltos · `script_aiscene.js` · 331 LOC · Nodo(s): lib.plataforma.script-aiscene · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 193 días
- Qué rompe si se borra: nada encontrado (nombre base «script_aiscene» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-088] script_analytics.js
- Scripts one-off y sueltos · `script_analytics.js` · 141 LOC · Nodo(s): lib.plataforma.script-analytics · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 193 días
- Qué rompe si se borra: nada encontrado (nombre base «script_analytics» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-089] script_leads.js
- Scripts one-off y sueltos · `script_leads.js` · 250 LOC · Nodo(s): lib.plataforma.script-leads · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 193 días
- Qué rompe si se borra: nada encontrado (nombre base «script_leads» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-090] script_magnetic.js
- Scripts one-off y sueltos · `script_magnetic.js` · 89 LOC · Nodo(s): lib.plataforma.script-magnetic · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 193 días
- Qué rompe si se borra: nada encontrado (nombre base «script_magnetic» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-091] script_maps.js
- Scripts one-off y sueltos · `script_maps.js` · 328 LOC · Nodo(s): lib.plataforma.script-maps · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 193 días
- Qué rompe si se borra: nada encontrado (nombre base «script_maps» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-092] script.js
- Scripts one-off y sueltos · `script.js` · 40 LOC · Nodo(s): lib.plataforma.script · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 193 días
- Qué rompe si se borra: nada encontrado (nombre base «script» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-093] script2.js
- Scripts one-off y sueltos · `script2.js` · 226 LOC · Nodo(s): lib.plataforma.script2 · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 193 días
- Qué rompe si se borra: nada encontrado (nombre base «script2» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-094] script3.js
- Scripts one-off y sueltos · `script3.js` · 216 LOC · Nodo(s): lib.plataforma.script3 · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 193 días
- Qué rompe si se borra: nada encontrado (nombre base «script3» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-095] scripts/_b13-2-fix-demo-bots.mjs
- Scripts one-off y sueltos · `scripts/_b13-2-fix-demo-bots.mjs` · 62 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 139 días
- Qué rompe si se borra: nada encontrado (nombre base «_b13-2-fix-demo-bots» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-096] scripts/_b13-2-list-bots.mjs
- Scripts one-off y sueltos · `scripts/_b13-2-list-bots.mjs` · 16 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 139 días
- Qué rompe si se borra: nada encontrado (nombre base «_b13-2-list-bots» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-097] scripts/_b13-dev.log
- Scripts one-off y sueltos · `scripts/_b13-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 144 días
- Qué rompe si se borra: nada encontrado (nombre base «_b13-dev.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-098] scripts/_b13-latency-b13-1779420902364.json
- Scripts one-off y sueltos · `scripts/_b13-latency-b13-1779420902364.json` · 398 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 144 días
- Qué rompe si se borra: nada encontrado (nombre base «_b13-latency-b13-1779420902364.json» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-099] scripts/_b13-latency-stdout.log
- Scripts one-off y sueltos · `scripts/_b13-latency-stdout.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 144 días
- Qué rompe si se borra: nada encontrado (nombre base «_b13-latency-stdout.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-100] scripts/_b13-latency-test.mjs
- Scripts one-off y sueltos · `scripts/_b13-latency-test.mjs` · 219 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 144 días
- Qué rompe si se borra: nada encontrado (nombre base «_b13-latency-test» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-101] scripts/_b14-2-pages-b14-2-pages-1779840621756.json
- Scripts one-off y sueltos · `scripts/_b14-2-pages-b14-2-pages-1779840621756.json` · 419 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 139 días
- Qué rompe si se borra: nada encontrado (nombre base «_b14-2-pages-b14-2-pages-1779840621756.json» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-102] scripts/_b14-2-prod-bot-latency.mjs
- Scripts one-off y sueltos · `scripts/_b14-2-prod-bot-latency.mjs` · 216 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 139 días
- Qué rompe si se borra: nada encontrado (nombre base «_b14-2-prod-bot-latency» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-103] scripts/_b14-2-prod-coldstart.mjs
- Scripts one-off y sueltos · `scripts/_b14-2-prod-coldstart.mjs` · 169 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 139 días
- Qué rompe si se borra: nada encontrado (nombre base «_b14-2-prod-coldstart» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-104] scripts/_b14-2-prod-pages-ttfb.mjs
- Scripts one-off y sueltos · `scripts/_b14-2-prod-pages-ttfb.mjs` · 164 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 139 días
- Qué rompe si se borra: nada encontrado (nombre base «_b14-2-prod-pages-ttfb» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-105] scripts/_b14-4-smoke-prod.mjs
- Scripts one-off y sueltos · `scripts/_b14-4-smoke-prod.mjs` · 267 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 139 días
- Qué rompe si se borra: nada encontrado (nombre base «_b14-4-smoke-prod» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-106] scripts/_b14-5-scrub-smoke.mjs
- Scripts one-off y sueltos · `scripts/_b14-5-scrub-smoke.mjs` · 186 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 139 días
- Qué rompe si se borra: nada encontrado (nombre base «_b14-5-scrub-smoke» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-107] scripts/_b14-analyze.mjs
- Scripts one-off y sueltos · `scripts/_b14-analyze.mjs` · 112 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 144 días
- Qué rompe si se borra: nada encontrado (nombre base «_b14-analyze» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-108] scripts/_b14-dev.log
- Scripts one-off y sueltos · `scripts/_b14-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 144 días
- Qué rompe si se borra: nada encontrado (nombre base «_b14-dev.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-109] scripts/_b32-baseline-run.log
- Scripts one-off y sueltos · `scripts/_b32-baseline-run.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_b32-baseline-run.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-110] scripts/_b32-dev.log
- Scripts one-off y sueltos · `scripts/_b32-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_b32-dev.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-111] scripts/_b33-dev.log
- Scripts one-off y sueltos · `scripts/_b33-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_b33-dev.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-112] scripts/_b35-dev.log
- Scripts one-off y sueltos · `scripts/_b35-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_b35-dev.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-113] scripts/_b36-dev.log
- Scripts one-off y sueltos · `scripts/_b36-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_b36-dev.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-114] scripts/_b52-test-scoring.ts
- Scripts one-off y sueltos · `scripts/_b52-test-scoring.ts` · 180 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_b52-test-scoring» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-115] scripts/_b53-baseline-run.log
- Scripts one-off y sueltos · `scripts/_b53-baseline-run.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_b53-baseline-run.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-116] scripts/_b53-baseline-run2.log
- Scripts one-off y sueltos · `scripts/_b53-baseline-run2.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_b53-baseline-run2.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-117] scripts/_b53-test-scoring.ts
- Scripts one-off y sueltos · `scripts/_b53-test-scoring.ts` · 262 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_b53-test-scoring» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-118] scripts/_b54-test-scoring.ts
- Scripts one-off y sueltos · `scripts/_b54-test-scoring.ts` · 365 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_b54-test-scoring» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-119] scripts/_db-cleanup-execute.mjs
- Scripts one-off y sueltos · `scripts/_db-cleanup-execute.mjs` · 170 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 144 días
- Qué rompe si se borra: nada encontrado (nombre base «_db-cleanup-execute» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-120] scripts/_db-cleanup-inspect.mjs
- Scripts one-off y sueltos · `scripts/_db-cleanup-inspect.mjs` · 160 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 144 días
- Qué rompe si se borra: nada encontrado (nombre base «_db-cleanup-inspect» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-121] scripts/_db-cleanup-inspect2.mjs
- Scripts one-off y sueltos · `scripts/_db-cleanup-inspect2.mjs` · 91 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 144 días
- Qué rompe si se borra: nada encontrado (nombre base «_db-cleanup-inspect2» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-122] scripts/_ms1-dev.log
- Scripts one-off y sueltos · `scripts/_ms1-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_ms1-dev.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-123] scripts/_ms4-dev.log
- Scripts one-off y sueltos · `scripts/_ms4-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_ms4-dev.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-124] scripts/_ms4-full-run.log
- Scripts one-off y sueltos · `scripts/_ms4-full-run.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_ms4-full-run.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-125] scripts/_ms4-full-run2.log
- Scripts one-off y sueltos · `scripts/_ms4-full-run2.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_ms4-full-run2.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-126] scripts/_ms4-smoke-run.log
- Scripts one-off y sueltos · `scripts/_ms4-smoke-run.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_ms4-smoke-run.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-127] scripts/_ms4-smoke-run2.log
- Scripts one-off y sueltos · `scripts/_ms4-smoke-run2.log` · 0 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «_ms4-smoke-run2.log» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-128] scripts/b4-qa-construccion.ts
- Scripts one-off y sueltos · `scripts/b4-qa-construccion.ts` · 153 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 123 días
- Qué rompe si se borra: nada encontrado (nombre base «b4-qa-construccion» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-129] scripts/b5-qa-review-queue.ts
- Scripts one-off y sueltos · `scripts/b5-qa-review-queue.ts` · 202 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 123 días
- Qué rompe si se borra: nada encontrado (nombre base «b5-qa-review-queue» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-130] scripts/b58-smoke.ts
- Scripts one-off y sueltos · `scripts/b58-smoke.ts` · 246 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 141 días
- Qué rompe si se borra: nada encontrado (nombre base «b58-smoke» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-131] scripts/b59-smoke.ts
- Scripts one-off y sueltos · `scripts/b59-smoke.ts` · 228 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 141 días
- Qué rompe si se borra: nada encontrado (nombre base «b59-smoke» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-132] scripts/b6-qa-outreach.ts
- Scripts one-off y sueltos · `scripts/b6-qa-outreach.ts` · 203 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 123 días
- Qué rompe si se borra: nada encontrado (nombre base «b6-qa-outreach» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-133] scripts/b7-qa-agenda.ts
- Scripts one-off y sueltos · `scripts/b7-qa-agenda.ts` · 210 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 123 días
- Qué rompe si se borra: nada encontrado (nombre base «b7-qa-agenda» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-134] scripts/b7-smoke-calcom.ts
- Scripts one-off y sueltos · `scripts/b7-smoke-calcom.ts` · 106 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 123 días
- Qué rompe si se borra: nada encontrado (nombre base «b7-smoke-calcom» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-135] scripts/b9-4-dedupe-kb-develop.mjs
- Scripts one-off y sueltos · `scripts/b9-4-dedupe-kb-develop.mjs` · 252 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 141 días
- Qué rompe si se borra: nada encontrado (nombre base «b9-4-dedupe-kb-develop» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-136] scripts/encode-vertex-creds.js
- Scripts one-off y sueltos · `scripts/encode-vertex-creds.js` · 12 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 150 días
- Qué rompe si se borra: nada encontrado (nombre base «encode-vertex-creds» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-137] scripts/p41-inject-campaigns.ts
- Scripts one-off y sueltos · `scripts/p41-inject-campaigns.ts` · 47 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 100 días
- Qué rompe si se borra: nada encontrado (nombre base «p41-inject-campaigns» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-138] scripts/qa-corridas/_p21-corrida.ts
- Scripts one-off y sueltos · `scripts/qa-corridas/_p21-corrida.ts` · 353 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 40 días
- Qué rompe si se borra: nada encontrado (nombre base «_p21-corrida» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-139] scripts/qa-corridas/_p23/capturas.ts
- Scripts one-off y sueltos · `scripts/qa-corridas/_p23/capturas.ts` · 122 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 39 días
- Qué rompe si se borra: nada encontrado (nombre base «capturas» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-140] scripts/qa-corridas/_verify-b61.ts
- Scripts one-off y sueltos · `scripts/qa-corridas/_verify-b61.ts` · 192 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 103 días
- Qué rompe si se borra: nada encontrado (nombre base «_verify-b61» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-141] scripts/qa-corridas/_verify-home-aviso.ts
- Scripts one-off y sueltos · `scripts/qa-corridas/_verify-home-aviso.ts` · 104 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 103 días
- Qué rompe si se borra: nada encontrado (nombre base «_verify-home-aviso» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-142] scripts/qa-corridas/_verify-scroll-gap.ts
- Scripts one-off y sueltos · `scripts/qa-corridas/_verify-scroll-gap.ts` · 100 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 103 días
- Qué rompe si se borra: nada encontrado (nombre base «_verify-scroll-gap» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-143] scripts/qa-corridas/capturar-franja.ts
- Scripts one-off y sueltos · `scripts/qa-corridas/capturar-franja.ts` · 280 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 41 días
- Qué rompe si se borra: nada encontrado (nombre base «capturar-franja» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-144] scripts/qa-corridas/corrida-1-import-csv.ts
- Scripts one-off y sueltos · `scripts/qa-corridas/corrida-1-import-csv.ts` · 253 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 103 días
- Qué rompe si se borra: nada encontrado (nombre base «corrida-1-import-csv» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-145] scripts/qa-corridas/medir-cartera.ts
- Scripts one-off y sueltos · `scripts/qa-corridas/medir-cartera.ts` · 532 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 39 días
- Qué rompe si se borra: nada encontrado (nombre base «medir-cartera» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-146] scripts/qa-corridas/medir-panel-setter.ts
- Scripts one-off y sueltos · `scripts/qa-corridas/medir-panel-setter.ts` · 288 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 40 días
- Qué rompe si se borra: nada encontrado (nombre base «medir-panel-setter» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-147] scripts/qa-corridas/p19-capturas.ts
- Scripts one-off y sueltos · `scripts/qa-corridas/p19-capturas.ts` · 201 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 41 días
- Qué rompe si se borra: nada encontrado (nombre base «p19-capturas» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-148] scripts/qa-corridas/rejection-reloop.ts
- Scripts one-off y sueltos · `scripts/qa-corridas/rejection-reloop.ts` · 260 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 103 días
- Qué rompe si se borra: nada encontrado (nombre base «rejection-reloop» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-149] scripts/regression/diag-timings.ts
- Scripts one-off y sueltos · `scripts/regression/diag-timings.ts` · 150 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 142 días
- Qué rompe si se borra: nada encontrado (nombre base «diag-timings» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-150] scripts/seed-matsu-chatbot.ts
- Scripts one-off y sueltos · `scripts/seed-matsu-chatbot.ts` · 552 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 112 días
- Qué rompe si se borra: nada encontrado (nombre base «seed-matsu-chatbot» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-151] scripts/seed-matsu-notifications.ts
- Scripts one-off y sueltos · `scripts/seed-matsu-notifications.ts` · 329 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 111 días
- Qué rompe si se borra: nada encontrado (nombre base «seed-matsu-notifications» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-152] scripts/seed-matsu-onboarding.ts
- Scripts one-off y sueltos · `scripts/seed-matsu-onboarding.ts` · 218 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 108 días
- Qué rompe si se borra: nada encontrado (nombre base «seed-matsu-onboarding» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-153] scripts/seed-matsu-week-results.ts
- Scripts one-off y sueltos · `scripts/seed-matsu-week-results.ts` · 190 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 108 días
- Qué rompe si se borra: nada encontrado (nombre base «seed-matsu-week-results» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-154] scripts/seed-messages-demo.ts
- Scripts one-off y sueltos · `scripts/seed-messages-demo.ts` · 190 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 116 días
- Qué rompe si se borra: nada encontrado (nombre base «seed-messages-demo» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-155] scripts/set-matsu-password.ts
- Scripts one-off y sueltos · `scripts/set-matsu-password.ts` · 48 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 140 días
- Qué rompe si se borra: nada encontrado (nombre base «set-matsu-password» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-156] scripts/utm1-smoke.mjs
- Scripts one-off y sueltos · `scripts/utm1-smoke.mjs` · 224 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 100 días
- Qué rompe si se borra: nada encontrado (nombre base «utm1-smoke» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-157] test-chat.mjs
- Scripts one-off y sueltos · `test-chat.mjs` · 26 LOC · Nodo(s): lib.plataforma.test-chat · Señales: script de un sprint o suelto en la raíz; sin referencias por nombre ni en package.json; último commit hace 151 días
- Qué rompe si se borra: nada encontrado (nombre base «test-chat» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs); package.json scripts)
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-158] scripts/_b13-latency-analyze.mjs
- Scripts one-off y sueltos · `scripts/_b13-latency-analyze.mjs` · 197 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; último commit hace 144 días
- Qué rompe si se borra: referencias: scripts/_b13-latency-test.mjs
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-159] scripts/_b14-2-cleanup-bench-prod.ts
- Scripts one-off y sueltos · `scripts/_b14-2-cleanup-bench-prod.ts` · 143 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; último commit hace 139 días
- Qué rompe si se borra: referencias: scripts/_b14-2-seed-bench-prod.ts
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-160] scripts/_b14-2-seed-bench-prod.ts
- Scripts one-off y sueltos · `scripts/_b14-2-seed-bench-prod.ts` · 216 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; último commit hace 139 días
- Qué rompe si se borra: referencias: scripts/_b14-4-smoke-prod.mjs
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-161] scripts/b1-verify-setter-ownership.ts
- Scripts one-off y sueltos · `scripts/b1-verify-setter-ownership.ts` · 121 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; último commit hace 123 días
- Qué rompe si se borra: referencias: scripts/b3-qa-assign-leads.ts, scripts/v1-qa-wizard-states.ts
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-162] scripts/b2-verify-dossier.ts
- Scripts one-off y sueltos · `scripts/b2-verify-dossier.ts` · 307 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; último commit hace 104 días
- Qué rompe si se borra: referencias: playwright.leados.config.ts, tests/leados/dossier-gates.spec.ts
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-163] scripts/b3-qa-assign-leads.ts
- Scripts one-off y sueltos · `scripts/b3-qa-assign-leads.ts` · 111 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; último commit hace 123 días
- Qué rompe si se borra: referencias: scripts/b5-qa-review-queue.ts, src/lib/leados/_experimental/fg2-casos-gastro.ts
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-164] scripts/cleanup-messages-demo.ts
- Scripts one-off y sueltos · `scripts/cleanup-messages-demo.ts` · 64 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; último commit hace 116 días
- Qué rompe si se borra: referencias: scripts/seed-messages-demo.ts
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-165] scripts/qa-corridas/_p23/censo-ubicaciones.ts
- Scripts one-off y sueltos · `scripts/qa-corridas/_p23/censo-ubicaciones.ts` · 234 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; último commit hace 39 días
- Qué rompe si se borra: referencias: src/lib/leados/copy-sin-ubicacion.invariant.ts
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-166] scripts/qa-corridas/barrido-derivacion.ts
- Scripts one-off y sueltos · `scripts/qa-corridas/barrido-derivacion.ts` · 477 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; último commit hace 41 días
- Qué rompe si se borra: referencias: src/lib/leados/paso-admitido.invariant.ts, tests/setter/24-paso-que-corresponde.spec.ts
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-167] scripts/qa-corridas/medir-pliegue-manual.ts
- Scripts one-off y sueltos · `scripts/qa-corridas/medir-pliegue-manual.ts` · 738 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; último commit hace 41 días
- Qué rompe si se borra: referencias: src/app/(protected)/setter/leads/[leadId]/manual/_components/pantalla-manual.tsx, tests/setter/22-cromo-primer-pliegue.spec.ts, tests/setter/23-accion-a-la-vista.spec.ts, tests/setter/25-franja-recorrido.spec.ts
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-168] scripts/regression/cases.ts
- Scripts one-off y sueltos · `scripts/regression/cases.ts` · 373 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; último commit hace 130 días
- Qué rompe si se borra: referencias: scripts/regression/run-baseline.ts
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-169] scripts/regression/purge.ts
- Scripts one-off y sueltos · `scripts/regression/purge.ts` · 115 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; último commit hace 143 días
- Qué rompe si se borra: referencias: scripts/regression/run-baseline.ts, src/modules/chatbot/evals/cleanup.ts, src/modules/chatbot/evals/shared.ts
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-170] scripts/regression/run-baseline.ts
- Scripts one-off y sueltos · `scripts/regression/run-baseline.ts` · 620 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; último commit hace 130 días
- Qué rompe si se borra: referencias: src/modules/chatbot/evals/capture.ts, src/modules/chatbot/evals/client.ts
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-171] scripts/seed-matsu.ts
- Scripts one-off y sueltos · `scripts/seed-matsu.ts` · 198 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; último commit hace 143 días
- Qué rompe si se borra: referencias: prisma/seed-guard.ts, prisma/seeds/backfill-vertical-pack.ts, scripts/seed-matsu-chatbot.ts, scripts/seed-matsu-notifications.ts
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-172] scripts/v1-qa-wizard-states.ts
- Scripts one-off y sueltos · `scripts/v1-qa-wizard-states.ts` · 482 LOC · Nodo(s): lib.scripts · Señales: script de un sprint o suelto en la raíz; último commit hace 41 días
- Qué rompe si se borra: referencias: scripts/qa-corridas/medir-pliegue-manual.ts, scripts/qa-corridas/rejection-reloop.ts
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

## Salidas generadas y temporales commiteadas

### [POD-173] _tmp_footer_component.html
- Salidas generadas y temporales commiteadas · `raíz:_tmp_footer_component.html` · 9 LOC · Nodo(s): lib.plataforma.tmp-footer-component-html · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-174] _tmp_grid_feature_cards.html
- Salidas generadas y temporales commiteadas · `raíz:_tmp_grid_feature_cards.html` · 9 LOC · Nodo(s): lib.plataforma.tmp-grid-feature-cards-html · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-175] logic-core-v3/.eslint_output.txt
- Salidas generadas y temporales commiteadas · `.eslint_output.txt` · 0 LOC · Nodo(s): lib.plataforma.eslint-output-txt · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-176] logic-core-v3/audit.txt
- Salidas generadas y temporales commiteadas · `audit.txt` · 0 LOC · Nodo(s): lib.plataforma.audit-txt · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-177] logic-core-v3/prisma_err.txt
- Salidas generadas y temporales commiteadas · `prisma_err.txt` · 0 LOC · Nodo(s): lib.plataforma.prisma-err-txt · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-178] logic-core-v3/prisma/migrations/__diff_check.sql
- Salidas generadas y temporales commiteadas · `prisma/migrations/__diff_check.sql` · 0 LOC · Nodo(s): lib.prisma · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-179] logic-core-v3/scripts/_b13-dev.log
- Salidas generadas y temporales commiteadas · `scripts/_b13-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-180] logic-core-v3/scripts/_b13-latency-b13-1779420902364.json
- Salidas generadas y temporales commiteadas · `scripts/_b13-latency-b13-1779420902364.json` · 398 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-181] logic-core-v3/scripts/_b13-latency-stdout.log
- Salidas generadas y temporales commiteadas · `scripts/_b13-latency-stdout.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-182] logic-core-v3/scripts/_b14-2-pages-b14-2-pages-1779840621756.json
- Salidas generadas y temporales commiteadas · `scripts/_b14-2-pages-b14-2-pages-1779840621756.json` · 419 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-183] logic-core-v3/scripts/_b14-dev.log
- Salidas generadas y temporales commiteadas · `scripts/_b14-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-184] logic-core-v3/scripts/_b32-baseline-run.log
- Salidas generadas y temporales commiteadas · `scripts/_b32-baseline-run.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-185] logic-core-v3/scripts/_b32-dev.log
- Salidas generadas y temporales commiteadas · `scripts/_b32-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-186] logic-core-v3/scripts/_b33-dev.log
- Salidas generadas y temporales commiteadas · `scripts/_b33-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-187] logic-core-v3/scripts/_b35-dev.log
- Salidas generadas y temporales commiteadas · `scripts/_b35-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-188] logic-core-v3/scripts/_b36-dev.log
- Salidas generadas y temporales commiteadas · `scripts/_b36-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-189] logic-core-v3/scripts/_b53-baseline-run.log
- Salidas generadas y temporales commiteadas · `scripts/_b53-baseline-run.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-190] logic-core-v3/scripts/_b53-baseline-run2.log
- Salidas generadas y temporales commiteadas · `scripts/_b53-baseline-run2.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-191] logic-core-v3/scripts/_ms1-dev.log
- Salidas generadas y temporales commiteadas · `scripts/_ms1-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-192] logic-core-v3/scripts/_ms4-dev.log
- Salidas generadas y temporales commiteadas · `scripts/_ms4-dev.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-193] logic-core-v3/scripts/_ms4-full-run.log
- Salidas generadas y temporales commiteadas · `scripts/_ms4-full-run.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-194] logic-core-v3/scripts/_ms4-full-run2.log
- Salidas generadas y temporales commiteadas · `scripts/_ms4-full-run2.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-195] logic-core-v3/scripts/_ms4-smoke-run.log
- Salidas generadas y temporales commiteadas · `scripts/_ms4-smoke-run.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-196] logic-core-v3/scripts/_ms4-smoke-run2.log
- Salidas generadas y temporales commiteadas · `scripts/_ms4-smoke-run2.log` · 0 LOC · Nodo(s): lib.scripts · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-197] logic-core-v3/tests/full-run.log
- Salidas generadas y temporales commiteadas · `tests/full-run.log` · 0 LOC · Nodo(s): lib.tests · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-198] logic-core-v3/ts_errors.log
- Salidas generadas y temporales commiteadas · `ts_errors.log` · 0 LOC · Nodo(s): lib.plataforma.ts-errors-log · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-199] logic-core-v3/ts_errors.txt
- Salidas generadas y temporales commiteadas · `ts_errors.txt` · 0 LOC · Nodo(s): lib.plataforma.ts-errors-txt · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-200] logic-core-v3/ts_prune_output.txt
- Salidas generadas y temporales commiteadas · `ts_prune_output.txt` · 0 LOC · Nodo(s): lib.plataforma.ts-prune-output-txt · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-201] logic-core-v3/unused_report_utf8.txt
- Salidas generadas y temporales commiteadas · `unused_report_utf8.txt` · 0 LOC · Nodo(s): lib.plataforma.unused-report-utf8-txt · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

### [POD-202] logic-core-v3/unused_report.txt
- Salidas generadas y temporales commiteadas · `unused_report.txt` · 0 LOC · Nodo(s): lib.plataforma.unused-report-txt · Señales: salida generada o temporal commiteada (clasificación del ledger)
- Qué rompe si se borra: nada: no es código que se importe
- Confianza de poda: ALTA
- Propuesta: borrar
- Zona: libre

## Valores de enum sin uso

### [POD-203] enum AuditActionType: QUOTA_CHANGED, USER_INVITED, USER_REMOVED
- Valores de enum sin uso · `prisma/schema.prisma` · 0 LOC · Nodo(s): lib.prisma · Señales: ninguna mención de la palabra en src/
- Qué rompe si se borra: borrarlo exige migración (y schema.prisma es congelado en esta corrida)
- Confianza de poda: BAJA
- Propuesta: decidir (Valentino): está congelado en esta corrida
- Zona: congelado

### [POD-204] enum ChatbotEventLevel: DEBUG
- Valores de enum sin uso · `prisma/schema.prisma` · 0 LOC · Nodo(s): lib.prisma · Señales: ninguna mención de la palabra en src/
- Qué rompe si se borra: borrarlo exige migración (y schema.prisma es congelado en esta corrida)
- Confianza de poda: BAJA
- Propuesta: decidir (Valentino): está congelado en esta corrida
- Zona: congelado

## Ramas

### [POD-205] b1-s2-bsp-outbound (mergeada, último commit 2026-07-15)
- Ramas · sin archivos · Nodo(s): rama.b1-s2-bsp-outbound · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-206] chore/dead-code-sweep (mergeada, último commit 2026-06-11)
- Ramas · sin archivos · Nodo(s): rama.chore-dead-code-sweep · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-207] claude/festive-ptolemy-d98e1c (mergeada, último commit 2026-07-06)
- Ramas · sin archivos · Nodo(s): rama.claude-festive-ptolemy-d98e1c · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-208] claude/funny-williams-001d41 (mergeada, último commit 2026-06-21)
- Ramas · sin archivos · Nodo(s): rama.claude-funny-williams-001d41 · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-209] claude/peaceful-swirles-a97e56 (mergeada, último commit 2026-08-18)
- Ramas · sin archivos · Nodo(s): rama.claude-peaceful-swirles-a97e56 · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-210] corrida/recorrido-2 (mergeada, último commit 2026-09-04)
- Ramas · sin archivos · Nodo(s): rama.corrida-recorrido-2 · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-211] corrida/recorrido-completo (mergeada, último commit 2026-08-31)
- Ramas · sin archivos · Nodo(s): rama.corrida-recorrido-completo · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-212] f0/reconciliacion (mergeada, último commit 2026-08-12)
- Ramas · sin archivos · Nodo(s): rama.f0-reconciliacion · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-213] f1/datos-fecha-contador (mergeada, último commit 2026-08-12)
- Ramas · sin archivos · Nodo(s): rama.f1-datos-fecha-contador · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-214] f2/motivo-rechazo (mergeada, último commit 2026-08-12)
- Ramas · sin archivos · Nodo(s): rama.f2-motivo-rechazo · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-215] f3/acuse-recibo (mergeada, último commit 2026-08-18)
- Ramas · sin archivos · Nodo(s): rama.f3-acuse-recibo · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-216] fix/accion-a-la-vista (mergeada, último commit 2026-09-02)
- Ramas · sin archivos · Nodo(s): rama.fix-accion-a-la-vista · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-217] fix/callejones (mergeada, último commit 2026-08-26)
- Ramas · sin archivos · Nodo(s): rama.fix-callejones · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-218] fix/cartera-para-que (mergeada, último commit 2026-09-04)
- Ramas · sin archivos · Nodo(s): rama.fix-cartera-para-que · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-219] fix/cola-de-trabajo (mergeada, último commit 2026-09-03)
- Ramas · sin archivos · Nodo(s): rama.fix-cola-de-trabajo · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-220] fix/config-faltante (mergeada, último commit 2026-08-31)
- Ramas · sin archivos · Nodo(s): rama.fix-config-faltante · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-221] fix/cromo-primer-pliegue (mergeada, último commit 2026-09-01)
- Ramas · sin archivos · Nodo(s): rama.fix-cromo-primer-pliegue · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-222] fix/datos-viajan (mergeada, último commit 2026-08-27)
- Ramas · sin archivos · Nodo(s): rama.fix-datos-viajan · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-223] fix/destinos-alcanzables (mergeada, último commit 2026-08-30)
- Ramas · sin archivos · Nodo(s): rama.fix-destinos-alcanzables · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-224] fix/ficha-por-fuentes (mergeada, último commit 2026-09-01)
- Ramas · sin archivos · Nodo(s): rama.fix-ficha-por-fuentes · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-225] fix/fonts-geist-scope (mergeada, último commit 2026-07-30)
- Ramas · sin archivos · Nodo(s): rama.fix-fonts-geist-scope · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-226] fix/franja-recorrido (mergeada, último commit 2026-09-03)
- Ramas · sin archivos · Nodo(s): rama.fix-franja-recorrido · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-227] fix/fusion-m1-m2 (mergeada, último commit 2026-09-01)
- Ramas · sin archivos · Nodo(s): rama.fix-fusion-m1-m2 · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-228] fix/helpers-que-prueban (mergeada, último commit 2026-08-31)
- Ramas · sin archivos · Nodo(s): rama.fix-helpers-que-prueban · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-229] fix/home-sanidad (mergeada, último commit 2026-07-29)
- Ramas · sin archivos · Nodo(s): rama.fix-home-sanidad · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-230] fix/motion-sanidad-mobile (mergeada, último commit 2026-07-30)
- Ramas · sin archivos · Nodo(s): rama.fix-motion-sanidad-mobile · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-231] fix/municiones (mergeada, último commit 2026-08-26)
- Ramas · sin archivos · Nodo(s): rama.fix-municiones · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-232] fix/paso-que-corresponde (mergeada, último commit 2026-09-02)
- Ramas · sin archivos · Nodo(s): rama.fix-paso-que-corresponde · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-233] fix/quinta-superficie (mergeada, último commit 2026-08-27)
- Ramas · sin archivos · Nodo(s): rama.fix-quinta-superficie · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-234] fix/una-sola-fuente (mergeada, último commit 2026-08-29)
- Ramas · sin archivos · Nodo(s): rama.fix-una-sola-fuente · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-235] fix/veredicto-y-ciclo (mergeada, último commit 2026-09-04)
- Ramas · sin archivos · Nodo(s): rama.fix-veredicto-y-ciclo · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-236] fix/vocabulario (mergeada, último commit 2026-08-27)
- Ramas · sin archivos · Nodo(s): rama.fix-vocabulario · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-237] home-clasico-referencia (mergeada, último commit 2026-07-31)
- Ramas · sin archivos · Nodo(s): rama.home-clasico-referencia · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-238] leados/b8a-hardening (mergeada, último commit 2026-06-13)
- Ramas · sin archivos · Nodo(s): rama.leados-b8a-hardening · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-239] leados/b8a-ii (mergeada, último commit 2026-06-13)
- Ramas · sin archivos · Nodo(s): rama.leados-b8a-ii · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-240] leados/p11-turno (mergeada, último commit 2026-08-12)
- Ramas · sin archivos · Nodo(s): rama.leados-p11-turno · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-241] leados/v1-a-main (mergeada, último commit 2026-08-26)
- Ramas · sin archivos · Nodo(s): rama.leados-v1-a-main · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-242] leados/v1-integracion (mergeada, último commit 2026-08-26)
- Ramas · sin archivos · Nodo(s): rama.leados-v1-integracion · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-243] leados/v2-a-main (mergeada, último commit 2026-09-06)
- Ramas · sin archivos · Nodo(s): rama.leados-v2-a-main · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-244] main-backup-pre-b8a (mergeada, último commit 2026-06-11)
- Ramas · sin archivos · Nodo(s): rama.main-backup-pre-b8a · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-245] recon-origin-main (mergeada, último commit 2026-06-05)
- Ramas · sin archivos · Nodo(s): rama.recon-origin-main · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-246] redisign/home (mergeada, último commit 2026-08-03)
- Ramas · sin archivos · Nodo(s): rama.redisign-home · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-247] runtime/mejoras (mergeada, último commit 2026-07-11)
- Ramas · sin archivos · Nodo(s): rama.runtime-mejoras · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: nada: todo su contenido está en main
- Confianza de poda: ALTA
- Propuesta: borrar la rama (su contenido ya está en main)
- Zona: libre

### [POD-248] b1-s1-bsp-inbound (+1/-231, último commit propio 2026-07-09)
- Ramas · sin archivos · Nodo(s): rama.b1-s1-bsp-inbound · Señales: abandonada: 95 días sin commits propios
- Qué rompe si se borra: 0 archivos solo existen ahí (revisar antes de borrar)
- Confianza de poda: MEDIA
- Propuesta: archivar (tag) y borrar la rama, después de revisar lo que solo existe ahí
- Zona: libre

### [POD-249] chore/auditoria-seguridad (+2/-208, último commit propio 2026-07-29)
- Ramas · sin archivos · Nodo(s): rama.chore-auditoria-seguridad · Señales: abandonada: 76 días sin commits propios
- Qué rompe si se borra: 0 archivos solo existen ahí (revisar antes de borrar)
- Confianza de poda: MEDIA
- Propuesta: archivar (tag) y borrar la rama, después de revisar lo que solo existe ahí
- Zona: libre

### [POD-250] claude/priceless-nobel-ed8d02 (+1/-324, último commit propio 2026-08-12)
- Ramas · sin archivos · Nodo(s): rama.claude-priceless-nobel-ed8d02 · Señales: abandonada: 62 días sin commits propios
- Qué rompe si se borra: 0 archivos solo existen ahí (revisar antes de borrar)
- Confianza de poda: MEDIA
- Propuesta: archivar (tag) y borrar la rama, después de revisar lo que solo existe ahí
- Zona: libre

### [POD-251] claude/sad-burnell-2f5e2d (+1/-323, último commit propio 2026-08-12)
- Ramas · sin archivos · Nodo(s): rama.claude-sad-burnell-2f5e2d · Señales: abandonada: 62 días sin commits propios
- Qué rompe si se borra: 0 archivos solo existen ahí (revisar antes de borrar)
- Confianza de poda: MEDIA
- Propuesta: archivar (tag) y borrar la rama, después de revisar lo que solo existe ahí
- Zona: libre

### [POD-252] redesign/home (mergeada, último commit 2026-08-10)
- Ramas · sin archivos · Nodo(s): rama.redesign-home · Señales: sin commits propios fuera de origin/main
- Qué rompe si se borra: tiene worktree en C:/PorfolioDevelOP
- Confianza de poda: MEDIA
- Propuesta: archivar (tag) y borrar la rama, después de revisar lo que solo existe ahí
- Zona: libre

### [POD-253] b0-isolation-motor-chatbot (+8/-211, último commit propio 2026-07-16)
- Ramas · sin archivos · Nodo(s): rama.b0-isolation-motor-chatbot · Señales: abandonada: 89 días sin commits propios
- Qué rompe si se borra: 9 archivos solo existen ahí (revisar antes de borrar)
- Confianza de poda: BAJA
- Propuesta: archivar (tag) y borrar la rama, después de revisar lo que solo existe ahí
- Zona: libre

### [POD-254] b2-s1-bot-sync-surface (+1/-213, último commit propio 2026-07-17)
- Ramas · sin archivos · Nodo(s): rama.b2-s1-bot-sync-surface · Señales: abandonada: 88 días sin commits propios
- Qué rompe si se borra: 7 archivos solo existen ahí (revisar antes de borrar)
- Confianza de poda: BAJA
- Propuesta: archivar (tag) y borrar la rama, después de revisar lo que solo existe ahí
- Zona: libre

### [POD-255] chore/auditoria-maestra (+1/-235, último commit propio 2026-07-10)
- Ramas · sin archivos · Nodo(s): rama.chore-auditoria-maestra · Señales: abandonada: 94 días sin commits propios
- Qué rompe si se borra: 1 archivos solo existen ahí (revisar antes de borrar)
- Confianza de poda: BAJA
- Propuesta: archivar (tag) y borrar la rama, después de revisar lo que solo existe ahí
- Zona: libre

### [POD-256] chore/gs-aislamiento (+2/-235, último commit propio 2026-07-11)
- Ramas · sin archivos · Nodo(s): rama.chore-gs-aislamiento · Señales: abandonada: 94 días sin commits propios
- Qué rompe si se borra: 6 archivos solo existen ahí (revisar antes de borrar)
- Confianza de poda: BAJA
- Propuesta: archivar (tag) y borrar la rama, después de revisar lo que solo existe ahí
- Zona: libre

### [POD-257] chore/security-quick-wins (+3/-208, último commit propio 2026-07-22)
- Ramas · sin archivos · Nodo(s): rama.chore-security-quick-wins · Señales: abandonada: 83 días sin commits propios
- Qué rompe si se borra: 2 archivos solo existen ahí (revisar antes de borrar)
- Confianza de poda: BAJA
- Propuesta: archivar (tag) y borrar la rama, después de revisar lo que solo existe ahí
- Zona: libre

### [POD-258] chore/wf-home (+1/-904, último commit propio 2026-06-08)
- Ramas · sin archivos · Nodo(s): rama.chore-wf-home · Señales: abandonada: 127 días sin commits propios
- Qué rompe si se borra: 2 archivos solo existen ahí (revisar antes de borrar)
- Confianza de poda: BAJA
- Propuesta: archivar (tag) y borrar la rama, después de revisar lo que solo existe ahí
- Zona: libre

### [POD-259] experimento/estetica-goal (+15/-904, último commit propio 2026-06-02)
- Ramas · sin archivos · Nodo(s): rama.experimento-estetica-goal · Señales: abandonada: 133 días sin commits propios
- Qué rompe si se borra: 1 archivos solo existen ahí (revisar antes de borrar)
- Confianza de poda: BAJA
- Propuesta: archivar (tag) y borrar la rama, después de revisar lo que solo existe ahí
- Zona: libre

### [POD-260] leados/b8a-iii (+3/-867, último commit propio 2026-06-13)
- Ramas · sin archivos · Nodo(s): rama.leados-b8a-iii · Señales: abandonada: 122 días sin commits propios
- Qué rompe si se borra: 2 archivos solo existen ahí (revisar antes de borrar)
- Confianza de poda: BAJA
- Propuesta: archivar (tag) y borrar la rama, después de revisar lo que solo existe ahí
- Zona: libre

### [POD-266] revert-home-abortado (+3/-95, último commit propio 2026-08-12)
- Ramas · sin archivos · Nodo(s): rama.revert-home-abortado · Señales: abandonada: 62 días sin commits propios
- Qué rompe si se borra: 3 archivos solo existen ahí (revisar antes de borrar)
- Confianza de poda: BAJA
- Propuesta: archivar (tag) y borrar la rama, después de revisar lo que solo existe ahí
- Zona: libre

## Esperar merge de `rediseno/home`

Candidatos que `rediseno/home` modifica o borra (`git diff --name-status origin/main...origin/rediseno/home`), que pertenecen al home viejo que v3 reemplaza, o que son ramas intermedias del rediseño. **No se proponen para borrar ahora**: esta sección es el insumo de la poda post-merge.

### [POD-006] src/components/automation/ComparativaAutomation.tsx
- Archivos · `src/components/automation/ComparativaAutomation.tsx` · 316 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre
- Qué rompe si se borra: nada encontrado (nombre base «ComparativaAutomation» y specifier «@/components/automation/ComparativaAutomation» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-007] src/components/automation/SocialProofAutomation.tsx
- Archivos · `src/components/automation/SocialProofAutomation.tsx` · 500 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre
- Qué rompe si se borra: nada encontrado (nombre base «SocialProofAutomation» y specifier «@/components/automation/SocialProofAutomation» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-008] src/components/canvas/AuroraBackground.tsx
- Archivos · `src/components/canvas/AuroraBackground.tsx` · 29 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 221 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «AuroraBackground» y specifier «@/components/canvas/AuroraBackground» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-009] src/components/canvas/Interactive3DNetwork.tsx
- Archivos · `src/components/canvas/Interactive3DNetwork.tsx` · 623 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «Interactive3DNetwork» y specifier «@/components/canvas/Interactive3DNetwork» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-010] src/components/canvas/LiquidProject.tsx
- Archivos · `src/components/canvas/LiquidProject.tsx` · 62 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 252 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «LiquidProject» y specifier «@/components/canvas/LiquidProject» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-011] src/components/canvas/NeuralNetwork.tsx
- Archivos · `src/components/canvas/NeuralNetwork.tsx` · 98 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 222 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «NeuralNetwork» y specifier «@/components/canvas/NeuralNetwork» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-012] src/components/canvas/ReactiveBackground.tsx
- Archivos · `src/components/canvas/ReactiveBackground.tsx` · 145 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 222 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «ReactiveBackground» y specifier «@/components/canvas/ReactiveBackground» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-020] src/components/ia/BentoIA.tsx
- Archivos · `src/components/ia/BentoIA.tsx` · 719 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 192 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «BentoIA» y specifier «@/components/ia/BentoIA» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-021] src/components/ia/VaultIA.tsx
- Archivos · `src/components/ia/VaultIA.tsx` · 490 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre
- Qué rompe si se borra: nada encontrado (nombre base «VaultIA» y specifier «@/components/ia/VaultIA» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-022] src/components/layout/HeroArtifactLayer.tsx
- Archivos · `src/components/layout/HeroArtifactLayer.tsx` · 172 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre
- Qué rompe si se borra: nada encontrado (nombre base «HeroArtifactLayer» y specifier «@/components/layout/HeroArtifactLayer» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-024] src/components/sections/AILargeCta.tsx
- Archivos · `src/components/sections/AILargeCta.tsx` · 61 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «AILargeCta» y specifier «@/components/sections/AILargeCta» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-025] src/components/sections/AIPipelineSection.tsx
- Archivos · `src/components/sections/AIPipelineSection.tsx` · 151 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «AIPipelineSection» y specifier «@/components/sections/AIPipelineSection» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-026] src/components/sections/AITechMarquee.tsx
- Archivos · `src/components/sections/AITechMarquee.tsx` · 81 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 175 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «AITechMarquee» y specifier «@/components/sections/AITechMarquee» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-027] src/components/sections/cierre/Cierre.tsx
- Archivos · `src/components/sections/cierre/Cierre.tsx` · 87 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre
- Qué rompe si se borra: nada encontrado (nombre base «Cierre» y specifier «@/components/sections/cierre/Cierre» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-028] src/components/sections/EnterpriseStandards.tsx
- Archivos · `src/components/sections/EnterpriseStandards.tsx` · 75 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «EnterpriseStandards» y specifier «@/components/sections/EnterpriseStandards» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-029] src/components/sections/FeedbackLoop.tsx
- Archivos · `src/components/sections/FeedbackLoop.tsx` · 60 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 139 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «FeedbackLoop» y specifier «@/components/sections/FeedbackLoop» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-030] src/components/sections/nosotros/Nosotros.tsx
- Archivos · `src/components/sections/nosotros/Nosotros.tsx` · 162 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre
- Qué rompe si se borra: nada encontrado (nombre base «Nosotros» y specifier «@/components/sections/nosotros/Nosotros» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-031] src/components/sections/portal-demo/useEscenaCycle.ts
- Archivos · `src/components/sections/portal-demo/useEscenaCycle.ts` · 85 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre
- Qué rompe si se borra: nada encontrado (nombre base «useEscenaCycle» y specifier «@/components/sections/portal-demo/useEscenaCycle» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-032] src/components/sections/ProcessAutomationCta.tsx
- Archivos · `src/components/sections/ProcessAutomationCta.tsx` · 41 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «ProcessAutomationCta» y specifier «@/components/sections/ProcessAutomationCta» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-033] src/components/sections/ProcessAutomationMetrics.tsx
- Archivos · `src/components/sections/ProcessAutomationMetrics.tsx` · 75 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «ProcessAutomationMetrics» y specifier «@/components/sections/ProcessAutomationMetrics» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-034] src/components/sections/ROICalculator.tsx
- Archivos · `src/components/sections/ROICalculator.tsx` · 424 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «ROICalculator» y specifier «@/components/sections/ROICalculator» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-035] src/components/sections/servicios/Servicios.tsx
- Archivos · `src/components/sections/servicios/Servicios.tsx` · 119 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre
- Qué rompe si se borra: nada encontrado (nombre base «Servicios» y specifier «@/components/sections/servicios/Servicios» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-036] src/components/sections/SoftwareArchitecture.tsx
- Archivos · `src/components/sections/SoftwareArchitecture.tsx` · 83 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «SoftwareArchitecture» y specifier «@/components/sections/SoftwareArchitecture» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-037] src/components/sections/TeamSection.tsx
- Archivos · `src/components/sections/TeamSection.tsx` · 65 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «TeamSection» y specifier «@/components/sections/TeamSection» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-038] src/components/sections/TemplateWarehouse.tsx
- Archivos · `src/components/sections/TemplateWarehouse.tsx` · 70 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «TemplateWarehouse» y specifier «@/components/sections/TemplateWarehouse» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-039] src/components/sections/web-development/ShowcaseSection.tsx
- Archivos · `src/components/sections/web-development/ShowcaseSection.tsx` · 602 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «ShowcaseSection» y specifier «@/components/sections/web-development/ShowcaseSection» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-040] src/components/sections/web-development/WebDevelopmentObjections.tsx
- Archivos · `src/components/sections/web-development/WebDevelopmentObjections.tsx` · 172 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre
- Qué rompe si se borra: nada encontrado (nombre base «WebDevelopmentObjections» y specifier «@/components/sections/web-development/WebDevelopmentObjections» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-041] src/components/sections/web-development/WebDevelopmentSensory.tsx
- Archivos · `src/components/sections/web-development/WebDevelopmentSensory.tsx` · 178 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «WebDevelopmentSensory» y specifier «@/components/sections/web-development/WebDevelopmentSensory» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-042] src/components/software/ProcesoSoftware.tsx
- Archivos · `src/components/software/ProcesoSoftware.tsx` · 594 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre
- Qué rompe si se borra: nada encontrado (nombre base «ProcesoSoftware» y specifier «@/components/software/ProcesoSoftware» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-043] src/components/software/ShowcaseSoftware.tsx
- Archivos · `src/components/software/ShowcaseSoftware.tsx` · 851 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre
- Qué rompe si se borra: nada encontrado (nombre base «ShowcaseSoftware» y specifier «@/components/software/ShowcaseSoftware» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-044] src/components/software/VaultSoftware.tsx
- Archivos · `src/components/software/VaultSoftware.tsx` · 348 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise; sin referencias por nombre; último commit hace 154 días y sin importadores
- Qué rompe si se borra: nada encontrado (nombre base «VaultSoftware» y specifier «@/components/software/VaultSoftware» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: ALTA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-055] src/components/design-system/SectionShell.tsx
- Archivos · `src/components/design-system/SectionShell.tsx` · 101 LOC · Nodo(s): lib.sitio-publico · Señales: marcado en el código (« * tercero, `SectionTransition.tsx`, era código muerto»)
- Qué rompe si se borra: referencias: src/components/design-system/index.ts (nombre base «SectionShell» y specifier «@/components/design-system/SectionShell» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-056] src/components/ia/CalculadorIA.tsx
- Archivos · `src/components/ia/CalculadorIA.tsx` · 341 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise
- Qué rompe si se borra: referencias: src/lib/whatsapp.ts (nombre base «CalculadorIA» y specifier «@/components/ia/CalculadorIA» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-057] src/components/sections/web-development/PortfolioWebCases.tsx
- Archivos · `src/components/sections/web-development/PortfolioWebCases.tsx` · 370 LOC · Nodo(s): lib.sitio-publico · Señales: huérfano de depcruise
- Qué rompe si se borra: referencias: src/app/web-development/page.tsx (nombre base «PortfolioWebCases» y specifier «@/components/sections/web-development/PortfolioWebCases» entre comillas (descartando imports que resuelven a otro archivo) en 1624 archivos de código, config, tests y scripts de origin/main (sin docs))
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-261] rediseno/chrome (dormida, +23/-50)
- Ramas · sin archivos · Nodo(s): rama.rediseno-chrome · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 263 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-262] rediseno/cimientos (dormida, +18/-52)
- Ramas · sin archivos · Nodo(s): rama.rediseno-cimientos · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 197 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-263] rediseno/motion (dormida, +23/-50)
- Ramas · sin archivos · Nodo(s): rama.rediseno-motion · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 249 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-264] rediseno/secciones-a (dormida, +29/-50)
- Ramas · sin archivos · Nodo(s): rama.rediseno-secciones-a · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 369 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-265] rediseno/secciones-b (dormida, +29/-50)
- Ramas · sin archivos · Nodo(s): rama.rediseno-secciones-b · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 374 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-267] v3/acomodamiento (dormida, +68/-0)
- Ramas · sin archivos · Nodo(s): rama.v3-acomodamiento · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 1266 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-268] v3/cierre-etapa (dormida, +70/-0)
- Ramas · sin archivos · Nodo(s): rama.v3-cierre-etapa · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 1363 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-269] v3/contenido (dormida, +40/-50)
- Ramas · sin archivos · Nodo(s): rama.v3-contenido · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 528 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-270] v3/costura (dormida, +52/-50)
- Ramas · sin archivos · Nodo(s): rama.v3-costura · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 669 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-271] v3/defectos (dormida, +57/-0)
- Ramas · sin archivos · Nodo(s): rama.v3-defectos · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 894 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-272] v3/emite (dormida, +71/-0)
- Ramas · sin archivos · Nodo(s): rama.v3-emite · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 1466 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-273] v3/escena (dormida, +40/-50)
- Ramas · sin archivos · Nodo(s): rama.v3-escena · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 533 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-274] v3/escena-premium (dormida, +49/-50)
- Ramas · sin archivos · Nodo(s): rama.v3-escena-premium · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 621 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-275] v3/escena-viva (dormida, +57/-0)
- Ramas · sin archivos · Nodo(s): rama.v3-escena-viva · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 907 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-276] v3/luz (dormida, +62/-0)
- Ramas · sin archivos · Nodo(s): rama.v3-luz · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 1072 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-277] v3/medicion (dormida, +52/-50)
- Ramas · sin archivos · Nodo(s): rama.v3-medicion · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 780 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-278] v3/momentos (dormida, +49/-50)
- Ramas · sin archivos · Nodo(s): rama.v3-momentos · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 641 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-279] v3/preloader (dormida, +40/-50)
- Ramas · sin archivos · Nodo(s): rama.v3-preloader · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 533 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-280] v3/sincronia (dormida, +58/-0)
- Ramas · sin archivos · Nodo(s): rama.v3-sincronia · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 941 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

### [POD-281] v3/tipo (dormida, +40/-50)
- Ramas · sin archivos · Nodo(s): rama.v3-tipo · Señales: rama intermedia del rediseño del home
- Qué rompe si se borra: 529 archivos solo existen ahí
- Confianza de poda: BAJA
- Propuesta: esperar merge de rediseno/home
- Zona: libre

## Candidatos de F2 (lectores y cazadores)

> Señales que encontraron los lectores de cada dominio al leer el código completo. Confianza MEDIA salvo que el dominio la confirme; la propuesta queda para Valentino (o para Franco en su zona). «Alcance» dice si el candidato es el archivo entero, unos exports o una fusión.

### [POD-282] src/proxy.ts (D1-c1)
- Hallado en F2 (D1-L1) · `src/proxy.ts` · Nodo(s): lib.proxy · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — getLegacyAdminRedirectPath (:22-65), su llamada (:81, :92-96) y las entradas muertas de ALWAYS_ALLOWED (:68) · Señales: getLegacyAdminRedirectPath (:22-65) siempre devuelve null: ADMIN_OS_PATH === ADMIN_PATH === '/admin' (:8-9) y el primer if (:23) corta todo /admin, ninguna otra rama puede cumplirse; ALWAYS_ALLOWED (:68) incluye '/logout' (ruta inexistente: git ls-tree vacio) y '/api/auth/', '/api/' que el matcher (:172) nunca deja entrar; IMPERSONATION_COOKIE duplicado (:16) en vez de importar impersonation-constants.ts:1
- Qué rompe si se borra: Nada: el bloque :92-96 nunca redirige; borrar tambien la llamada de :81
- Confianza de poda: MEDIA
- Propuesta: borrar ese código muerto (SEC-017) — lo decide Valentino
- Zona: libre

### [POD-283] src/auth.ts (D1-c1)
- Hallado en F2 (D1-L1) · `src/auth.ts` · Nodo(s): lib.auth · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — getPostLoginPath (:65-74), sus constantes (:15-17) y userExists (:61) · Señales: getPostLoginPath (:65-74) sin callers (git grep -> solo la definicion); ADMIN_PATH/DASHBOARD_PATH/ONBOARDING_PATH (:15-17) solo usados por esa funcion; userExists (:61) calculado y nunca leido
- Qué rompe si se borra: Nada funcional; FROZEN + ZONA-FRANCO -> decision para Valentino
- Confianza de poda: MEDIA
- Propuesta: borrar ese código muerto (DEU-002) (decidir (Valentino): archivo congelado)
- Zona: FROZEN + ZONA-FRANCO

### [POD-284] src/app/accept-invite/ (D1-c1)
- Hallado en F2 (D1-L1) · `src/app/accept-invite/` · Nodo(s): h1.auth-invite · Alcance: el archivo entero — la carpeta entera · Señales: Sin emisor vivo: inviteClientAction (invitations.ts:43) e inviteTeamMemberAction (settings.ts:148) no tienen callers; settings.ts no tiene importadores (git grep "lib/actions/settings'" vacio); Solo seria alcanzable con un token de forgot-password de un usuario sin contrasena
- Qué rompe si se borra: Nada del producto actual; robots.ts:21 y el comentario de sitemap.ts:4 lo mencionan, DotMatrix.tsx:21,49 en comentarios. Decidir: borrar o reconectar
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino): borrar la invitación o reconectarla a un emisor vivo (DEU-001)
- Zona: libre

### [POD-285] src/app/login/actions.ts (D1-c1)
- Hallado en F2 (D1-L1) · `src/app/login/actions.ts` · Nodo(s): h1.auth-login · Alcance: fusión con otra implementación (no se borra sin consolidar) — el limiter en memoria (:8-48) duplica el limiter en base de src/lib/rate-limit/limiter.ts:37-84; la rama EMAIL_NOT_VERIFIED (:119-121) es inalcanzable · Señales: Limiter en memoria (:8-48) duplicado del limiter compartido en DB (src/lib/rate-limit/limiter.ts:37-84); Rama EMAIL_NOT_VERIFIED (:119-121) inalcanzable: Auth.js envuelve el error en CallbackRouteError con cause {err} (node_modules/@auth/core/lib/actions/callback/index.js:388)
- Qué rompe si se borra: Reemplazar, no solo borrar: sin el Map el login queda sin ningun limite
- Confianza de poda: MEDIA
- Propuesta: fusionar con el limiter compartido (SEC-007) y borrar la rama muerta
- Zona: libre

### [POD-286] prisma/migrate-os-to-unified.ts (D6-c1)
- Hallado en F2 (D6-L1) · `prisma/migrate-os-to-unified.ts` · Nodo(s): lib.prisma.seeds · Alcance: el archivo entero · Señales: Solo cuenta filas de Project, Task y OsLead (líneas 6-10) y declara la migración 'finalizada' (14-15); Último commit 3cdcc55e del 2026-04-06; Lo invoca package.json:19 (migrate:os-v2) con ts-node
- Qué rompe si se borra: Nada: es de solo lectura. Quitar también el script migrate:os-v2 de package.json.
- Confianza de poda: MEDIA
- Propuesta: borrar junto con el script migrate:os-v2 de package.json — lo decide Valentino
- Zona: libre

### [POD-287] prisma/backups/backup.js (D6-c1)
- Hallado en F2 (D6-L1) · `prisma/backups/backup.js` · Nodo(s): lib.prisma.seeds · Alcance: el archivo entero · Señales: Usa prisma.modulePricing (línea 6), modelo que ya no existe en el schema: fallaría al correr; Último commit c8478587 del 2026-04-27; Sin referencias desde package.json ni scripts
- Qué rompe si se borra: Nada.
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-288] prisma/backups/module-pricing-legacy.json, organization-module-pre-push.json, premium-module-pre-push.json (D6-c1)
- Hallado en F2 (D6-L1) · `prisma/backups/module-pricing-legacy.json, organization-module-pre-push.json, premium-module-pre-push.json` · Nodo(s): lib.prisma.seeds · Alcance: el archivo entero — los tres volcados · Señales: Dumps de datos de abril commiteados en un repo público (11, 1 y 9 filas; una con organizationId); Generados por backup.js, que ya no puede correr
- Qué rompe si se borra: Nada salvo la referencia histórica (sigue en git).
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-289] package.json (D6-c1)
- Hallado en F2 (D6-L1) · `package.json` · Nodo(s): lib.plataforma.package · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — el script duplicado de seed:agency-os (línea 17) · Señales: Duplicado exacto de seed:agency-os (línea 17)
- Qué rompe si se borra: Nada.
- Confianza de poda: MEDIA
- Propuesta: borrar la línea duplicada — lo decide Valentino
- Zona: libre

### [POD-290] prisma/seed-agency-os.ts (D6-c1)
- Hallado en F2 (D6-L1) · `prisma/seed-agency-os.ts` · Nodo(s): lib.prisma.seeds · Alcance: fusión con otra implementación (no se borra sin consolidar) — duplica src/lib/agency-settings.ts:1-19 · Señales: Duplica src/lib/agency-settings.ts:1-19, que seed.ts:19 ya importa; Valores idénticos hoy; pueden divergir
- Qué rompe si se borra: Nada si se reemplaza por el import.
- Confianza de poda: MEDIA
- Propuesta: fusionar con src/lib/agency-settings.ts (importarlo en vez de copiarlo)
- Zona: libre

### [POD-291] prisma/seeds/init-data-connections.ts (D6-c1)
- Hallado en F2 (D6-L2) · `prisma/seeds/init-data-connections.ts` · Nodo(s): lib.prisma.seeds · Alcance: el archivo entero · Señales: git grep 'init-data-connections|initDataConnections' solo lo encuentra a sí mismo; backfill one-shot de abril: la columna tiene DEFAULT desde 20260427194426:7; único error de eslint del lote (no-explicit-any en :18); fabrica connected/lastSync (:34-45)
- Qué rompe si se borra: Nada en runtime; solo se pierde un backfill que ya no aplica a orgs nuevas.
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-292] src/lib/data/onboarding-tasks.ts (D6-c1)
- Hallado en F2 (D6-L2) · `src/lib/data/onboarding-tasks.ts` · Nodo(s): lib.data · Alcance: el archivo entero · Señales: solo lo consume src/lib/onboarding/seed-tasks-for-org.ts:2; esa siembra solo se llama desde src/lib/actions/clients.ts e invitations.ts, sin importadores (git grep = 0); las actions de admin src/actions/admin/onboarding-tasks.ts tampoco tienen importadores; el alta vigente no siembra (createClientOnly.ts:85)
- Qué rompe si se borra: OnboardingStatusCard (dashboard/page.tsx:61) quedaría sin catálogo; hoy ya devuelve null para orgs sin tareas. Decidir antes: retirar la feature completa o reconectarla.
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino): retirar la feature del checklist completa o reconectarla (DEU-018)
- Zona: libre

### [POD-293] prisma/seeds/backfill-vertical-pack.ts (D6-c1)
- Hallado en F2 (D6-L2) · `prisma/seeds/backfill-vertical-pack.ts` · Nodo(s): lib.prisma.seeds · Alcance: el archivo entero · Señales: backfill one-shot D.1 para 3 slugs fijos (:71-75); idempotente: después de correr en prod es no-op; sin referencias desde package.json ni otros scripts
- Qué rompe si se borra: Nada si ya corrió en prod (verificar verticalPack de develop/sanmiguel/matsu).
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-294] prisma/seeds/add-contact-tool.ts (D6-c1)
- Hallado en F2 (D6-L2) · `prisma/seeds/add-contact-tool.ts` · Nodo(s): lib.prisma.seeds · Alcance: el archivo entero · Señales: one-shot CONTACT-PATH (:2-3); el catálogo ya incluye el slug (sync-plans.ts:57, :63); sin referencias desde package.json
- Qué rompe si se borra: Nada si Plan.tools en prod ya tiene confirm_contact_request (PLAN-1145).
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-295] prisma/seeds/premium-modules.ts (D6-c1)
- Hallado en F2 (D6-L2) · `prisma/seeds/premium-modules.ts` · Nodo(s): lib.prisma.seeds · Alcance: el archivo entero · Señales: 3 líneas que solo llaman runSyncPremiumModules; sync-premium-modules.ts:180-182 ya se auto-ejecuta al invocarse directo; segundo punto de entrada del mismo script destructivo
- Qué rompe si se borra: Nada; quien lo use debe invocar sync-premium-modules.ts. (Adyacente al lote.)
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-296] src/actions/onboarding-actions.ts (D2-c1)
- Hallado en F2 (D2-L1, D2-L3) · `src/actions/onboarding-actions.ts` · Nodo(s): lib.actions · Alcance: el archivo entero · Señales: git grep -n onboarding-actions origin/main -- src -> unico importador src/components/onboarding/OnboardingWizard.tsx:6; git grep -n components/onboarding origin/main -- src -> vacio (el wizard legacy no lo importa nadie); completeOnboardingAction sin llamadores: el onboarding real usa src/app/bienvenida/_actions/complete-onboarding.ts; registro PD1 seccion 6: 'completeOnboardingAction sin caller'; sin referencias en tests ni scripts; completeOnboardingAction (:79) sin importadores; saveOnboardingProfile solo lo importa src/components/onboarding/OnboardingWizard.tsx, que a su vez no tiene importadores; escribe credenciales en claro con url 'ENCRIPTADO_EN_TEXTO' (:111-131); el onboarding vivo es src/app/bienvenida/_actions/complete-onboarding.ts
- Qué rompe si se borra: Nada en runtime. Borrar junto con src/components/onboarding/OnboardingWizard.tsx; actualizar baselines de knip/depcruise. / Nada del flujo vivo; elimina un write-path de credenciales en claro.
- Confianza de poda: MEDIA
- Propuesta: borrar junto con src/components/onboarding/OnboardingWizard.tsx, su único importador, también sin importadores (DEU-022) — lo decide Valentino
- Zona: libre

### [POD-297] src/app/(protected)/dashboard/cuenta/loading.tsx (D2-c1)
- Hallado en F2 (D2-L1) · `src/app/(protected)/dashboard/cuenta/loading.tsx` · Nodo(s): h2.cli-cuenta · Alcance: el archivo entero · Señales: cuenta/page.tsx:3-5 solo redirige a /perfil; perfil, facturacion y boveda tienen su propio loading.tsx; max-w-5xl pb-20 desalineados con el layout full-width (registro Mi Cuenta, pendiente 8)
- Qué rompe si se borra: Nada; a lo sumo un instante sin skeleton durante el redirect de /dashboard/cuenta.
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-298] src/app/(protected)/dashboard/modules/email-marketing/campaigns/[id]/loading.tsx (D2-c1)
- Hallado en F2 (D2-L1) · `src/app/(protected)/dashboard/modules/email-marketing/campaigns/[id]/loading.tsx` · Nodo(s): h2.cli-email-mkt · Alcance: el archivo entero · Señales: no existe campaigns/[id]/page.tsx (git ls-tree: solo [id]/send/page.tsx); el skeleton CampaignDetailLoading (card + 3 stats + lista) no corresponde a la pantalla de confirmacion de /send
- Qué rompe si se borra: Nada; /send quedaria cubierto por campaigns/loading.tsx.
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino)
- Zona: libre

### [POD-299] src/app/api/dashboard/leads/recent/route.ts (D2-c1)
- Hallado en F2 (D2-L2) · `src/app/api/dashboard/leads/recent/route.ts` · Nodo(s): h2.cli-inicio · Alcance: el archivo entero · Señales: Sin llamadores en src: git grep -n "leads/recent" origin/main -- logic-core-v3 ':!logic-core-v3/docs' → solo tests/e2e/40-lead-capture-e2e.spec.ts:49-50 y :60-61; Devuelve la fila completa de ChatbotLead (...lead, :50), incluido convertedToOsLeadId de LeadOS; La rama de classification null (:35-37) es inalcanzable porque excludeDqWhere (:25) descarta los null
- Qué rompe si se borra: tests/e2e/40-lead-capture-e2e.spec.ts:49-50 y :60-63 (dos asserts contra la ruta); nada en src.
- Confianza de poda: MEDIA
- Propuesta: borrar junto con sus dos asserts de tests/e2e/40-lead-capture-e2e.spec.ts (DEU-027) — lo decide Valentino
- Zona: libre

### [POD-300] src/app/api/reports/monthly/route.ts (D2-c1)
- Hallado en F2 (D2-L2) · `src/app/api/reports/monthly/route.ts` · Nodo(s): h2.cli-resultados · Alcance: el archivo entero · Señales: Sin llamadores: solo la mencionan el comentario de client-monthly/route.ts:6-7 y tests/e2e/43:9; Única importadora de src/lib/reports/MonthlyReport.tsx (:8); PLAN-133 pide borrarla; mezclaría datos mock de GA/GSC en el PDF sin marcarlos (:106-107)
- Qué rompe si se borra: Nada en src; borrar también MonthlyReport.tsx (ClientMonthlyReportPdf.tsx:6 solo lo nombra en un comentario).
- Confianza de poda: MEDIA
- Propuesta: borrar junto con src/lib/reports/MonthlyReport.tsx; lo reemplazó /api/reports/client-monthly (DEU-027) — lo decide Valentino
- Zona: libre

### [POD-301] src/app/bienvenida/ (D2-c1)
- Hallado en F2 (D2-L2) · `src/app/bienvenida/` · Nodo(s): h2.cli-bienvenida · Alcance: el archivo entero — la carpeta entera · Señales: Ninguna alta viva deja onboardingCompleted=false: core.ts:85, createClientOnly.ts:85 y createClientWithBot.ts:135 lo crean en true; clients.ts:124 e invitations.ts:86 no tienen importadores; Duplica el onboarding legacy muerto: src/components/onboarding/OnboardingWizard.tsx (sin importadores) + src/actions/onboarding-actions.ts; Escribe targetAudience, que nadie lee (git grep "targetAudience" → solo escrituras), y el GA ID que analytics.ts:66-69 rechaza
- Qué rompe si se borra: Redirects a /bienvenida en proxy.ts:130, :144, :150, :158-166, login/actions.ts:101-107, (protected)/dashboard/layout.tsx:123-129 y robots.ts:25 (orgs seed/QA con onboardingCompleted=false irían a 404); auth.ts:17 y :73 (getPostLoginPath, FROZEN + ZONA-FRANCO) → decisión para Valentino.
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino): borrar el onboarding de /bienvenida o reactivarlo corregido; hoy ninguna alta viva lo usa (DEU-023, SEC-045, BUG-035)
- Zona: libre

### [POD-302] src/components/dashboard/ExecutiveReportTemplate.tsx (D2-c1)
- Hallado en F2 (D2-L3) · `src/components/dashboard/ExecutiveReportTemplate.tsx` · Nodo(s): lib.componentes-dashboard · Alcance: el archivo entero · Señales: unico importador: src/components/dashboard/DownloadReportButton.tsx:5; DownloadReportButtons (DownloadReportButton.tsx:129) sin importadores: git grep -n -E 'DownloadReportButtons|DownloadReportButton\b' origin/main -- src ':!src/components/dashboard/DownloadReportButton.tsx' → vacio; alimentado con mockData hardcodeado (DownloadReportButton.tsx:82-89, :122); dominio legacy www.develop-agency.com (ExecutiveReportTemplate.tsx:120)
- Qué rompe si se borra: Nada en runtime. Borrarlo junto a DownloadReportButton.tsx permite quitar html2canvas y jspdf (package.json:148-149; solo usados en DownloadReportButton.tsx:44-45).
- Confianza de poda: MEDIA
- Propuesta: borrar junto con DownloadReportButton.tsx y evaluar quitar html2canvas y jspdf (DEU-027) — lo decide Valentino
- Zona: libre

### [POD-303] src/lib/premium-modules.ts (D2-c1)
- Hallado en F2 (D2-L4) · `src/lib/premium-modules.ts` · Nodo(s): lib.premium-modules · Alcance: exports sueltos (el archivo sigue vivo) — getModulesForOrganization, hasModuleActive, getMonthlyRecurringRevenue, isModuleValidForRubro, activateModule y cancelModule; solo getActiveModuleSlugs tiene uso · Señales: getModulesForOrganization, hasModuleActive, getMonthlyRecurringRevenue, isModuleValidForRubro, activateModule y cancelModule sin importadores (git grep -n -w <nombre> origin/main -- . → solo la definición; activateModule además en un doc); hasModuleActive (:46-58) duplica isModuleActive de src/lib/modules/check-activation.ts:3-15; nombre igual a src/lib/data/premium-modules.ts (catálogo del seed)
- Qué rompe si se borra: Nada hoy (solo getActiveModuleSlugs se usa, get-recommendations-for-org.ts:12). Conservar activateModule/cancelModule si se construye el alta de módulos.
- Confianza de poda: MEDIA
- Propuesta: borrar los exports sin uso salvo activateModule y cancelModule si se construye el alta de módulos (FAL-005, DEU-030) — lo decide Valentino
- Zona: libre

### [POD-304] src/components/dashboard/home/WeekResultsGrid.tsx (D2-c1)
- Hallado en F2 (D2-L4) · `src/components/dashboard/home/WeekResultsGrid.tsx` · Nodo(s): h2.cli-inicio · Alcance: el archivo entero — la tarjeta del Inicio; src/lib/dashboard/week-results.ts sigue alimentando el brief y el email · Señales: duplica 'Leads' del hero con otra fuente (global); visitas hardcodeadas en 0; page.tsx:82-84 la relegó a 'Tu cuenta'
- Qué rompe si se borra: El componente se puede quitar del home, pero getWeekResults (src/lib/dashboard/week-results.ts) alimenta executive-brief.ts:279 y build.ts:133: hay que reapuntar brief y email antes de borrar la lib.
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino): quitar la tarjeta (duplica los leads del hero con una fuente global, SEC-048) o corregir su fuente
- Zona: libre

### [POD-305] src/components/dashboard/results/PageSpeedCard.tsx (D2-c1)
- Hallado en F2 (D2-L4) · `src/components/dashboard/results/PageSpeedCard.tsx` · Nodo(s): h2.cli-resultados · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — la rama vacía de :179-197, inalcanzable porque trafico/page.tsx devuelve null antes · Señales: rama vacía :179-197 inalcanzable: trafico/page.tsx:133 devuelve null cuando ambos reportes son null
- Qué rompe si se borra: Nada; o mover el vacío a la página.
- Confianza de poda: MEDIA
- Propuesta: borrar la rama (o mover el vacío a la página) — lo decide Valentino
- Zona: libre

### [POD-306] src/lib/health-score.ts (D2-c1)
- Hallado en F2 (D2-L4) · `src/lib/health-score.ts` · Nodo(s): lib.health-score · Alcance: exports sueltos (el archivo sigue vivo) — los campos computedAt y cachedFrom de HealthScoreResult (sin lectores; cachedFrom siempre null); el archivo sigue vivo (Inicio, brief, reporte) · Señales: HealthScoreResult.computedAt y cachedFrom sin lectores fuera del archivo (git grep → 0); cachedFrom siempre null
- Qué rompe si se borra: Nada.
- Confianza de poda: MEDIA
- Propuesta: borrar los dos campos — lo decide Valentino
- Zona: libre

### [POD-307] src/lib/reports/MonthlyReport.tsx (D2-c1)
- Hallado en F2 (D2-L5) · `src/lib/reports/MonthlyReport.tsx` · Nodo(s): h2.cli-resultados · Alcance: el archivo entero · Señales: único importador: src/app/api/reports/monthly/route.ts:8-9; git grep 'reports/monthly' en src: solo comentarios (client-monthly/route.ts:6) y la propia ruta; ninguna pantalla la llama; reemplazado por ClientMonthlyReportPdf (P2.C), según ClientMonthlyReportPdf.tsx:6-8; no mira isMockData y presenta datos de demo como reales
- Qué rompe si se borra: Nada visible para el cliente. Borrarlo junto con src/app/api/reports/monthly/route.ts (y src/components/dashboard/DownloadReportButton.tsx, también sin importadores).
- Confianza de poda: MEDIA
- Propuesta: borrar junto con src/app/api/reports/monthly/route.ts (DEU-027) — lo decide Valentino
- Zona: libre

### [POD-308] src/lib/onboarding/seed-tasks-for-org.ts (D2-c1)
- Hallado en F2 (D2-L5) · `src/lib/onboarding/seed-tasks-for-org.ts` · Nodo(s): lib.onboarding · Alcance: el archivo entero · Señales: solo lo importan src/lib/actions/clients.ts:9 y src/lib/actions/invitations.ts:8, módulos 'use server' sin importadores; las altas vivas (createClientOnly, createClientWithBot, onboarding/core) no lo llaman
- Qué rompe si se borra: Nada hoy. La recomendación es cablearlo en las altas vivas en lugar de podarlo (checklist de onboarding).
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino): cablearlo en las altas vivas en vez de podarlo (DEU-018)
- Zona: libre

### [POD-309] src/lib/reports/executive-weekly/send-manual.ts (D2-c1)
- Hallado en F2 (D2-L5) · `src/lib/reports/executive-weekly/send-manual.ts` · Nodo(s): h2.cli-reportes-email · Alcance: fusión con otra implementación (no se borra sin consolidar) — reimplementa la secuencia de send.ts · Señales: reimplementa la secuencia de send.ts, como dice su propio comentario (:26-31)
- Qué rompe si se borra: El botón 'Enviar ahora' del admin (api/admin/clients/[organizationId]/send-executive-report/route.ts:7,57) si se borra sin extraer un sendForOrg común.
- Confianza de poda: MEDIA
- Propuesta: fusionar con send.ts en un sendForOrg común (DEU-033)
- Zona: libre

### [POD-310] src/lib/reports/executive-weekly/report-eligible-plan.ts (D2-c1)
- Hallado en F2 (D2-L5) · `src/lib/reports/executive-weekly/report-eligible-plan.ts` · Nodo(s): h2.cli-reportes-email · Alcance: fusión con otra implementación (no se borra sin consolidar) — duplica el gate de plan de build.ts:91 · Señales: duplica el gate de build.ts:91 (comentario :3-8); su invariante no compara contra build.ts
- Qué rompe si se borra: La tarjeta de preferencias de perfil/page.tsx:31,194-195 si se borra sin que build.ts exponga el gate.
- Confianza de poda: MEDIA
- Propuesta: fusionar con build.ts: que el motor exponga el gate y la tarjeta de perfil lo use (DEU-032)
- Zona: libre

### [POD-311] src/lib/plan/plan-presentation.ts (D2-c1)
- Hallado en F2 (D2-L5) · `src/lib/plan/plan-presentation.ts` · Nodo(s): lib.plan · Alcance: fusión con otra implementación (no se borra sin consolidar) — precios y cupos copiados a mano de prisma/seeds/sync-plans.ts · Señales: precios y cupos copiados a mano de prisma/seeds/sync-plans.ts (comentario :9-10); fallback.ts repite los valores de STARTER
- Qué rompe si se borra: Vitrina de planes y medidor si se elimina. Propuesta: leer precio y cupo del Plan y dejar aquí solo el copy.
- Confianza de poda: MEDIA
- Propuesta: fusionar con el catálogo de Plan: leer precio y cupo de la base y dejar acá solo el copy
- Zona: libre

### [POD-312] src/lib/modules/check-activation.ts (D2-c1)
- Hallado en F2 (D2-L5) · `src/lib/modules/check-activation.ts` · Nodo(s): h2.cli-servicios · Alcance: fusión con otra implementación (no se borra sin consolidar) — isModuleActive duplica getActiveModuleSlugs (src/lib/premium-modules.ts:76-84) · Señales: duplica la noción 'módulo activo' con getActiveModuleSlugs (src/lib/premium-modules.ts:76-84); slugs como string suelto sin tipo compartido con el catálogo
- Qué rompe si se borra: 5 importadores (módulos y motor-resenas/_actions.ts). Consolidar en un helper tipado, no borrar.
- Confianza de poda: MEDIA
- Propuesta: fusionar con getActiveModuleSlugs en un helper con slugs tipados desde el catálogo (BUG-012)
- Zona: libre

### [POD-313] src/app/api/admin/chatbot/insights/generate/route.ts (D5-c1)
- Hallado en F2 (D5-L1) · `src/app/api/admin/chatbot/insights/generate/route.ts` · Nodo(s): h3.adm-chatbots · Alcance: el archivo entero — la ruta entera: sin consumidores en src, tests ni scripts; llama al LLM sin try/catch ni rate limit · Señales: git grep 'insights/generate' en origin/main fuera de docs → sin consumidores en src, tests ni scripts; Llama al LLM (generateInsightsForBot) sin try/catch ni rate limit; La generación diaria la cubre el cron generate-insights
- Qué rompe si se borra: Nada en la UI; solo se pierde la invocación manual por HTTP
- Confianza de poda: MEDIA
- Propuesta: borrar la ruta (la generación diaria la hace el cron generate-insights)
- Zona: libre

### [POD-314] src/app/api/admin/chatbot/demo-chat/[slug]/route.ts (D5-c1)
- Hallado en F2 (D5-L1) · `src/app/api/admin/chatbot/demo-chat/[slug]/route.ts` · Nodo(s): h3.adm-chatbots · Alcance: el archivo entero — la ruta, su invariante demo-chat-model-resolution.invariant.ts y el script test:cost2b de package.json · Señales: Sin consumidores en src: solo su invariant y el script test:cost2b (package.json:70); Usa bot.llmModel/temperature/maxOutputTokens, que no son los de producción (route.ts:57,112-113)
- Qué rompe si se borra: El invariant demo-chat-model-resolution.invariant.ts y el script test:cost2b
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino): borrarla, o conectarla como preview del admin con la misma config que producción (BUG-024)
- Zona: libre

### [POD-315] src/modules/chatbot/index.ts (D5-c1)
- Hallado en F2 (D5-L2) · `src/modules/chatbot/index.ts` · Nodo(s): lib.chatbot · Alcance: exports sueltos (el archivo sigue vivo) — los re-exports sin consumidores (ChatMessages, ChatMessage, ChatInput, QuickReplyChips, saveClientSettings y los tipos de shared/types.ts); quedan los 3 que se importan · Señales: Solo 3 de 52 exports se consumen via el barrel (LogicCompanion en ChatWidgetMount.tsx:13; ChatbotUpsellLanding y ChatbotOverview en dashboard/chatbot/page.tsx:9); Reexporta ChatMessages, ChatMessage, ChatInput y QuickReplyChips (index.ts:40-43), que no importa nadie (git grep de su uso -> solo los barrels y ChatMessages.tsx:4); Reexporta saveClientSettings (index.ts:89), cuya unica UI (ClientSettingsForm) no se monta; Arrastra editores admin, tablas y server actions al chunk del widget publico (index.ts:74-89)
- Qué rompe si se borra: ChatWidgetMount.tsx:13 y dashboard/chatbot/page.tsx:9 deben pasar a imports directos; el README del modulo documenta el barrel.
- Confianza de poda: MEDIA
- Propuesta: podar el barrel o pasar los 2 importadores (ChatWidgetMount.tsx:13, dashboard/chatbot/page.tsx:9) a imports directos (DEU-036)
- Zona: libre

### [POD-316] src/modules/chatbot/index.server.ts (D5-c1)
- Hallado en F2 (D5-L2) · `src/modules/chatbot/index.server.ts` · Nodo(s): lib.chatbot · Alcance: exports sueltos (el archivo sigue vivo) — los nombres sin consumidores por el barrel (5 server actions de admin, getLLMProvider, resetProviderCache, calculateCost, getTools, requireChatbotEnv y otros); quedan los 20 que se importan · Señales: 85 nombres exportados, 20 importados via '@/modules/chatbot/index.server'; Reexporta 5 server actions de admin (index.server.ts:80-86) que nadie importa por esta via; getLLMProvider, resetProviderCache, calculateCost, getTools y otros sin consumidores por el barrel
- Qué rompe si se borra: Los importadores actuales (dashboard/chatbot/*, api/chatbot/*, cron e insights, tests/integration/fix-origin-same-origin-config.spec.ts) usan 20 nombres: hay que conservarlos o pasar a imports directos.
- Confianza de poda: MEDIA
- Propuesta: podar los re-exports sin uso (DEU-036)
- Zona: libre

### [POD-317] src/modules/chatbot/lead-detail-presentation.ts (D5-c1)
- Hallado en F2 (D5-L2) · `src/modules/chatbot/lead-detail-presentation.ts` · Nodo(s): lib.chatbot · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — channelLabel y su mapa CHANNEL_LABELS: ChatbotLead.channel nunca se escribe · Señales: ChatbotLead.channel no se escribe en el unico create (captureLead.ts:381-413); channelLabel siempre devuelve null en LeadDetail.tsx:162
- Qué rompe si se borra: lead-detail-presentation.invariant.ts:16 y :65 testean channelLabel; LeadDetail.tsx:162 lo usa.
- Confianza de poda: MEDIA
- Propuesta: decidir: escribir channel al capturar el lead o borrar channelLabel y sus casos del invariante (DEU-037)
- Zona: libre

### [POD-318] src/modules/chatbot/components/admin/index.ts (D5-c1)
- Hallado en F2 (D5-L3) · `src/modules/chatbot/components/admin/index.ts` · Nodo(s): h3.adm-chatbots · Alcance: el archivo entero — el barrel entero (su único importador es el re-export de modules/chatbot/index.ts:75-77) · Señales: Su único importador es src/modules/chatbot/index.ts:75-77 (re-export); Ningún archivo importa KnowledgeBaseEditor/BotConfigEditor/ActivityLog/OnboardingWizard desde '@/modules/chatbot': el único import del barrel es dashboard/chatbot/page.tsx:9 (ChatbotUpsellLanding, ChatbotOverview); ARQ-02 de la auditoría maestra: barrel cliente con 1 consumidor
- Qué rompe si se borra: Nada en runtime; hay que borrar también las 3 líneas de re-export de src/modules/chatbot/index.ts:75-77.
- Confianza de poda: MEDIA
- Propuesta: borrarlo junto con las 3 líneas de re-export (DEU-036)
- Zona: libre

### [POD-319] src/modules/chatbot/components/admin/config/Field.tsx (D5-c1)
- Hallado en F2 (D5-L3) · `src/modules/chatbot/components/admin/config/Field.tsx` · Nodo(s): h3.adm-chatbots · Alcance: fusión con otra implementación (no se borra sin consolidar) — duplica src/components/ui/Field.tsx sin asociar label y control · Señales: Duplica src/components/ui/Field.tsx sin asociar label y control (sin htmlFor ni FieldControlProvider); Sólo lo usan los 5 tabs de config/tabs
- Qué rompe si se borra: Nada funcional si los tabs pasan al Field del kit; gana la asociación accesible.
- Confianza de poda: MEDIA
- Propuesta: pasar los 5 tabs de config al Field del kit y borrar este (A11Y-010)
- Zona: libre

### [POD-320] src/modules/chatbot/components/admin/config/Input.tsx (D5-c1)
- Hallado en F2 (D5-L3) · `src/modules/chatbot/components/admin/config/Input.tsx` · Nodo(s): h3.adm-chatbots · Alcance: fusión con otra implementación (no se borra sin consolidar) — duplica src/components/ui/Input.tsx sin leer el contexto de Field · Señales: Duplica src/components/ui/Input.tsx (mismos estilos) sin leer el contexto de Field; Usado sólo por AdvancedTab, BehaviorTab e IdentityTab
- Qué rompe si se borra: Nada funcional; cambian ids/aria a los del kit.
- Confianza de poda: MEDIA
- Propuesta: pasar AdvancedTab, BehaviorTab e IdentityTab al Input del kit y borrar este (A11Y-010)
- Zona: libre

### [POD-321] src/modules/chatbot/components/chat/QuickReplyChips.tsx (D5-c1)
- Hallado en F2 (D5-L4) · `src/modules/chatbot/components/chat/QuickReplyChips.tsx` · Nodo(s): h3.vis-widget-cliente · Alcance: el archivo entero — el archivo y sus re-exports en chat/index.ts:6 y modules/chatbot/index.ts:43 · Señales: Sin importadores fuera de los barrels chat/index.ts:6 y modules/chatbot/index.ts:43 (git grep -w); El changelog de Valentino lo declara muerto; Duplica los chips inline de ChatWindow.tsx:467-489
- Qué rompe si se borra: Solo los exports de los dos barrels.
- Confianza de poda: MEDIA
- Propuesta: borrar (DEU-036)
- Zona: libre

### [POD-322] src/modules/chatbot/components/chat/ChatMessages.tsx (D5-c1)
- Hallado en F2 (D5-L4) · `src/modules/chatbot/components/chat/ChatMessages.tsx` · Nodo(s): h3.vis-widget-cliente · Alcance: el archivo entero — el archivo y sus re-exports en chat/index.ts:3 y modules/chatbot/index.ts:40 · Señales: Sin consumidores fuera de los barrels; ChatWindow implementa su propia lista (ChatWindow.tsx:326-403)
- Qué rompe si se borra: Exports en chat/index.ts:3 y modules/chatbot/index.ts:40.
- Confianza de poda: MEDIA
- Propuesta: borrar junto con ChatMessage.tsx (DEU-036)
- Zona: libre

### [POD-323] src/modules/chatbot/components/chat/ChatMessage.tsx (D5-c1)
- Hallado en F2 (D5-L4) · `src/modules/chatbot/components/chat/ChatMessage.tsx` · Nodo(s): h3.vis-widget-cliente · Alcance: el archivo entero — el archivo (solo lo importa ChatMessages.tsx, también muerto) y sus re-exports · Señales: Solo lo importa ChatMessages.tsx (tambien muerto) y los barrels; Sin markdown ni streaming, no se usa en ninguna superficie
- Qué rompe si se borra: Exports en chat/index.ts:4 y modules/chatbot/index.ts:41.
- Confianza de poda: MEDIA
- Propuesta: borrar junto con ChatMessages.tsx (DEU-036)
- Zona: libre

### [POD-324] src/modules/chatbot/components/chat/ChatInput.tsx (D5-c1)
- Hallado en F2 (D5-L4) · `src/modules/chatbot/components/chat/ChatInput.tsx` · Nodo(s): h3.vis-widget-cliente · Alcance: el archivo entero — el archivo y sus re-exports en chat/index.ts:5 y modules/chatbot/index.ts:42 · Señales: Sin consumidores fuera de los barrels; ChatWindow y ChatbotEmbed tienen input propio
- Qué rompe si se borra: Exports en chat/index.ts:5 y modules/chatbot/index.ts:42.
- Confianza de poda: MEDIA
- Propuesta: borrar (DEU-036)
- Zona: libre

### [POD-325] src/modules/chatbot/components/chat/types.ts (D5-c1)
- Hallado en F2 (D5-L4) · `src/modules/chatbot/components/chat/types.ts` · Nodo(s): h3.vis-widget-cliente · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — solo ChatWindowProps (:22-35), que contradice al real de ChatWindow.tsx:71-93; UIChatMessage y ToolCallInUIMessage siguen en uso · Señales: ChatWindowProps (:22-35) duplica y contradice al real de ChatWindow.tsx:71-93 (degradedMode inexistente); El barrel exporta el desfasado (chat/index.ts:8)
- Qué rompe si se borra: Quitar solo ChatWindowProps; UIChatMessage y ToolCallInUIMessage se siguen usando.
- Confianza de poda: MEDIA
- Propuesta: borrar ChatWindowProps y que el barrel exporte el de ChatWindow (DEU-036)
- Zona: libre

### [POD-326] src/modules/chatbot/components/admin/useIsClient.ts (D5-c1)
- Hallado en F2 (D5-L4) · `src/modules/chatbot/components/admin/useIsClient.ts` · Nodo(s): h3.adm-chatbots · Alcance: fusión con otra implementación (no se borra sin consolidar) — copia 1:1 de src/lib/use-is-client.ts (FROZEN-inferido) · Señales: Copia 1:1 de src/lib/use-is-client.ts (git diff solo difiere en el comentario); El propio lib lo documenta como copia
- Qué rompe si se borra: 4 imports: BotConfigEditor.tsx:7, ActivationModal.tsx:6, BotConfigDiffModal.tsx:6, EmojiPickerField.tsx:9 (repuntar a @/lib/use-is-client).
- Confianza de poda: MEDIA
- Propuesta: repuntar los 4 imports a @/lib/use-is-client y borrar la copia
- Zona: libre

### [POD-327] src/modules/chatbot/components/dashboard/ClientSettingsForm.tsx (D5-c1)
- Hallado en F2 (D5-L5) · `src/modules/chatbot/components/dashboard/ClientSettingsForm.tsx` · Nodo(s): h3.cli-chatbot · Alcance: el archivo entero — el archivo entero y su re-export en components/dashboard/index.ts:3; arrastra saveClientSettings.ts · Señales: git grep -l ClientSettingsForm origin/main -- src tests: solo el archivo y components/dashboard/index.ts:3; modules/chatbot/index.ts:85 re-exporta del barrel solo ClientDashboardTabs, ClientLeadsTable, ChatbotUpsellLanding y ChatbotOverview; settings/page.tsx:8 usa BotPersonalization (reemplazo); 3 errores no-explicit-any y 1 warning en el baseline de eslint (lineas 26, 36, 37, 51)
- Qué rompe si se borra: Nada en runtime. Arrastra la server action saveClientSettings (server/admin/saveClientSettings.ts, re-export modules/chatbot/index.ts:89), que tambien queda sin consumidor y conviene borrar junto.
- Confianza de poda: MEDIA
- Propuesta: borrar junto con saveClientSettings.ts (DEU-046)
- Zona: libre

### [POD-328] src/modules/chatbot/server/admin/saveClientSettings.ts (D5-c1)
- Hallado en F2 (D5-L5, D5-L6) · `src/modules/chatbot/server/admin/saveClientSettings.ts` · Nodo(s): lib.chatbot.admin · Alcance: el archivo entero — el archivo entero: su único importador es ClientSettingsForm.tsx:5, también muerto; acepta isActive y lo descarta · Señales: fuera del lote; unico importador ClientSettingsForm.tsx:5 (muerto); acepta isActive (:21) y lo descarta (:40-47); Unico importador: components/dashboard/ClientSettingsForm.tsx:5; git grep -n '<ClientSettingsForm' origin/main -- src vacio (control: '<ChatbotOverview' en dashboard/chatbot/page.tsx:46); Acepta isActive (:21) y no lo pasa a updateBotAppearance (:40-47): toggle falso; Re-export en modules/chatbot/index.ts:89 y components/dashboard/index.ts:3
- Qué rompe si se borra: Nada; quitar tambien el re-export de modules/chatbot/index.ts:89. / Nada en runtime; borrar tambien ClientSettingsForm.tsx y los dos re-exports
- Confianza de poda: MEDIA
- Propuesta: borrar junto con ClientSettingsForm.tsx y el re-export de modules/chatbot/index.ts:89 (DEU-046)
- Zona: libre

### [POD-329] src/modules/chatbot/server/admin/integrations/getCrmSyncHistory.ts (D5-c1)
- Hallado en F2 (D5-L6) · `src/modules/chatbot/server/admin/integrations/getCrmSyncHistory.ts` · Nodo(s): lib.chatbot.admin · Alcance: exports sueltos (el archivo sigue vivo) — solo getLeadSyncHistory (:59-76), sin llamadores; getOrgSyncHistory sigue en uso · Señales: getLeadSyncHistory (:59-76) sin llamadores: git grep -n getLeadSyncHistory origin/main -- src solo la definicion; Control: getOrgSyncHistory se usa en CrmIntegrationAdminCard.tsx:72
- Qué rompe si se borra: Nada; borrar solo getLeadSyncHistory
- Confianza de poda: MEDIA
- Propuesta: borrar getLeadSyncHistory
- Zona: libre

### [POD-330] src/modules/chatbot/server/admin/preflightChecks.ts (D5-c1)
- Hallado en F2 (D5-L6) · `src/modules/chatbot/server/admin/preflightChecks.ts` · Nodo(s): lib.chatbot.admin · Alcance: exports sueltos (el archivo sigue vivo) — solo canActivate (:170-172), exportada en un módulo «use server» sin importadores · Señales: canActivate (:170-172) exportada en modulo 'use server' sin importadores (git grep 'canActivate(' fuera del archivo vacio); ActivationModal.tsx:30 calcula su propia variable canActivate
- Qué rompe si se borra: Nada; reduce la superficie de server actions
- Confianza de poda: MEDIA
- Propuesta: borrarla: reduce la superficie de server actions (SEC-065)
- Zona: libre

### [POD-331] src/modules/chatbot/server/admin/createClientWithBot.ts (D5-c1)
- Hallado en F2 (D5-L6) · `src/modules/chatbot/server/admin/createClientWithBot.ts` · Nodo(s): lib.chatbot.admin · Alcance: fusión con otra implementación (no se borra sin consolidar) — slugify local (:70-78) y findUniqueSlug duplican @/lib/slugify y los de createClientOnly.ts y lib/onboarding/core.ts · Señales: slugify local (:70-78) duplica @/lib/slugify que usa createClientOnly.ts:12; findUniqueSlug duplicado en createClientOnly.ts:31-45 y lib/onboarding/core.ts
- Qué rompe si se borra: Podria cambiar los slugs generados si @/lib/slugify difiere; verificar con los mismos casos antes de unificar
- Confianza de poda: MEDIA
- Propuesta: unificar en @/lib/slugify después de comparar los slugs generados con los mismos casos
- Zona: libre

### [POD-332] src/modules/chatbot/server/insights/manageInsight.ts (D5-c1)
- Hallado en F2 (D5-L7) · `src/modules/chatbot/server/insights/manageInsight.ts` · Nodo(s): lib.chatbot.insights · Alcance: el archivo entero — el módulo entero no tiene importadores, pero es la única transición de estado de ChatbotInsight · Señales: Módulo 'use server' sin importadores: git grep actOnInsight -> solo insights/index.ts:2 e index.server.ts:73; Es la única transición de estado de ChatbotInsight (BUG-023)
- Qué rompe si se borra: Nada hoy. Conviene cablearlo, no borrarlo: sin él los insights quedan PENDING para siempre y el cron deja de generar.
- Confianza de poda: MEDIA
- Propuesta: NO podar: cablearlo a una pantalla (BUG-023)
- Zona: libre

### [POD-333] src/modules/chatbot/server/insights/queries.ts (D5-c1)
- Hallado en F2 (D5-L7) · `src/modules/chatbot/server/insights/queries.ts` · Nodo(s): lib.chatbot.insights · Alcance: exports sueltos (el archivo sigue vivo) — getPendingInsightsByOrgSlug y getInsightHistoryByOrgSlug, sin consumidores; getInsightsCountForBot la usa el cron · Señales: getPendingInsightsByOrgSlug y getInsightHistoryByOrgSlug sin consumidores (solo index.server.ts:74-75); getInsightsCountForBot sí lo usa el cron (api/cron/generate-insights/route.ts:36)
- Qué rompe si se borra: Borrar las dos funciones sin uso no rompe nada; getInsightsCountForBot debe quedar.
- Confianza de poda: MEDIA
- Propuesta: borrar las dos funciones sin uso (o usarlas al cablear BUG-023)
- Zona: libre

### [POD-334] src/modules/chatbot/server/config/envValidator.ts (D5-c1)
- Hallado en F2 (D5-L7) · `src/modules/chatbot/server/config/envValidator.ts` · Nodo(s): lib.chatbot.config · Alcance: exports sueltos (el archivo sigue vivo) — requireChatbotEnv, sin consumidores; checkChatbotEnv lo usa el health (y exige una variable que prod no usa, BUG-063) · Señales: requireChatbotEnv sin consumidores (git grep: solo la definición e index.server.ts:104); GOOGLE_APPLICATION_CREDENTIALS marcado required aunque prod usa GOOGLE_VERTEX_CREDENTIALS_JSON (google.ts:62-68)
- Qué rompe si se borra: Borrar requireChatbotEnv no rompe nada; checkChatbotEnv lo usa el health.
- Confianza de poda: MEDIA
- Propuesta: borrar requireChatbotEnv y corregir la variable requerida al arreglar BUG-063
- Zona: libre

### [POD-335] src/modules/chatbot/server/chat/reconcile.ts (D5-c1)
- Hallado en F2 (D5-L7) · `src/modules/chatbot/server/chat/reconcile.ts` · Nodo(s): lib.chatbot.chat · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — INFRA3_CONNECTION_RETRY (:547-551), definido y sin uso, con su TODO(INFRA.3) · Señales: INFRA3_CONNECTION_RETRY (:547-551) definido y sin uso (git grep: 1 archivo); TODO(INFRA.3) en :540
- Qué rompe si se borra: Nada; es un placeholder documentado de INFRA.3.
- Confianza de poda: MEDIA
- Propuesta: borrarlo o resolver INFRA.3
- Zona: libre

### [POD-336] src/modules/chatbot/server/chat/handleChatRequest.ts (D5-c1)
- Hallado en F2 (D5-L7) · `src/modules/chatbot/server/chat/handleChatRequest.ts` · Nodo(s): lib.chatbot.chat · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — la rama «Bot misconfigured» (:166-169), inalcanzable porque resolveBotBySlug ya devuelve null sin KB · Señales: Rama 'Bot misconfigured' (:166-169) inalcanzable: resolveBotBySlug ya devuelve null sin KB (resolver.ts:38)
- Qué rompe si se borra: Nada; quitar la rama o mover el chequeo de KB acá para devolver un error más claro.
- Confianza de poda: MEDIA
- Propuesta: quitarla o mover el chequeo de KB acá para devolver un error más claro
- Zona: libre

### [POD-337] src/modules/chatbot/server/notifications/sendLeadNotification.ts (D5-c1)
- Hallado en F2 (D5-L8) · `src/modules/chatbot/server/notifications/sendLeadNotification.ts` · Nodo(s): lib.chatbot.notifications · Alcance: fusión con otra implementación (no se borra sin consolidar) — segunda plantilla del aviso de lead que solo usa el botón de prueba del admin; producción usa renderLeadEmail de lib/client-notifications/templates.ts · Señales: Unico consumidor: el boton admin sendTestNotification.ts:46 (y su invariante); Produccion avisa leads con lib/client-notifications/templates.ts (renderLeadEmail), otra plantilla; Fecha sin timeZone en :74
- Qué rompe si se borra: sendTestNotification.ts y notifications-brevo.invariant.ts: hay que migrarlos a renderLeadEmail antes de borrar
- Confianza de poda: MEDIA
- Propuesta: migrar sendTestNotification y su invariante a renderLeadEmail y borrar esta
- Zona: libre

### [POD-338] src/modules/chatbot/shared/types.ts (D5-c1)
- Hallado en F2 (D5-L8) · `src/modules/chatbot/shared/types.ts` · Nodo(s): lib.chatbot.shared · Alcance: exports sueltos (el archivo sigue vivo) — ChatbotOrganization, AvatarStyle, ChatbotLeadStatus, BotTone y BotIndustry: solo re-exportados, sin consumidores, y dos contradicen el enum de Prisma · Señales: ChatbotOrganization, AvatarStyle, ChatbotLeadStatus, BotTone y BotIndustry solo se reexportan en src/modules/chatbot/index.ts:14-24, sin consumidores; ChatbotLeadStatus y AvatarStyle contradicen el enum Prisma y CLIENT_AVATAR_STYLES
- Qué rompe si se borra: Nada en runtime; ajustar el barrel index.ts (QuickReply, ProactivePromptsMap, RouteColorMap y LLMProviderName si se usan)
- Confianza de poda: MEDIA
- Propuesta: borrarlos y ajustar el barrel (DEU-050)
- Zona: libre

### [POD-339] src/modules/chatbot/server/scoring/calculateLeadScore.ts (D5-c1)
- Hallado en F2 (D5-L8) · `src/modules/chatbot/server/scoring/calculateLeadScore.ts` · Nodo(s): lib.chatbot.scoring · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — el scoring v1 que el motor ya no consume (comentario :146-150); lo usan el invariante de paridad ev3 y scripts de prueba B5 · Señales: El propio comentario :146-150 dice que el motor ya no los consume; Consumidores: scripts/_b52/_b53/_b54-test-scoring.ts y ev3.invariant.ts
- Qué rompe si se borra: Invariante de paridad ev3 y scripts de prueba B5; getEffectiveScore usa classifyScore con umbrales fijos (habria que pasarle los del pack)
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino): conservarlo como referencia de paridad o borrarlo con ev3 y los scripts _b52/_b53/_b54
- Zona: libre

### [POD-340] src/modules/chatbot/server/llm/providers/anthropic.ts y openai.ts (D5-c1)
- Hallado en F2 (D5-L8) · `src/modules/chatbot/server/llm/providers/anthropic.ts y openai.ts` · Nodo(s): lib.chatbot.llm · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — getModel siempre lanza ProviderNotImplementedError; solo sirven de tabla de precios y para el switch exhaustivo de factory.ts · Señales: getModel lanza ProviderNotImplementedError siempre; Solo sirven de tabla de precios y para el switch exhaustivo de factory.ts
- Qué rompe si se borra: factory.ts:32-37 y el mapping LlmProvider (providerMapper.ts); conservar si se mantiene el enum de 3 providers
- Confianza de poda: MEDIA
- Propuesta: decidir (Valentino): mantener el enum de 3 proveedores o reducirlo a GOOGLE y borrar los stubs (TEC-003)
- Zona: libre

### [POD-341] src/modules/motor/domain/prisma-errors.ts (D5-c1)
- Hallado en F2 (D5-L9) · `src/modules/motor/domain/prisma-errors.ts` · Nodo(s): h3.vis-whatsapp · Alcance: fusión con otra implementación (no se borra sin consolidar) — isUniqueViolation duplica isUniqueConstraintError de src/lib/isolation/scoped-model.ts:60-62 (PLAN-483) · Señales: Duplica isUniqueConstraintError de src/lib/isolation/scoped-model.ts:60-62; El propio isolation lo anota como deuda de consolidacion (scoped-model.ts:56-58); PLAN-483 pendiente
- Qué rompe si se borra: 3 importadores: handle-message.ts:18, identity.ts:24 y sendMessage.ts:24. Hay que mover la variante con field a isolation antes de borrarlo.
- Confianza de poda: MEDIA
- Propuesta: mover la variante con field a isolation y repuntar los 3 importadores
- Zona: libre

### [POD-342] src/app/(protected)/admin/audit-log/_components/audit-period-filter.tsx (D3-c1)
- Hallado en F2 (D3-L1) · `src/app/(protected)/admin/audit-log/_components/audit-period-filter.tsx` · Nodo(s): h4.adm-audit · Alcance: fusión con otra implementación (no se borra sin consolidar) — réplica local del dropdown de período de Proyectos (projects-period-dropdown.tsx:73), según su propio comentario de :26 · Señales: Comentario :26 'Réplica LOCAL del look del dropdown de proyectos (NO se importa nada de projects/)'; projects/_components/projects-period-dropdown.tsx:73 implementa el mismo dropdown; PLAN-548 pendiente de unificar
- Qué rompe si se borra: AuditLogClient.tsx:13 lo importa; unificar en un componente compartido de admin y adaptar projects-filter-bar.tsx:96, :106
- Confianza de poda: MEDIA
- Propuesta: unificar en un selector de período compartido del admin (PLAN-548) y borrar las réplicas
- Zona: libre

### [POD-343] src/app/(protected)/admin/alerts/_components/alerts-filters.ts (D3-c1)
- Hallado en F2 (D3-L1) · `src/app/(protected)/admin/alerts/_components/alerts-filters.ts` · Nodo(s): h4.adm-alertas · Alcance: fusión con otra implementación (no se borra sin consolidar) — tercera variante del cálculo de presets de período (la de audit-filters.ts:21-54 resuelve la misma ventana con date-fns) · Señales: Comentario :5 'Patrón de presets replicado de Proyectos/Leads'; audit-filters.ts:21-54 periodToRange resuelve la misma ventana hacia atrás con date-fns; Tercera variante del filtro de período (con alerts-date-filter.tsx)
- Qué rompe si se borra: AlertsClient.tsx:9-10 importa ambos; extraer un helper de período compartido
- Confianza de poda: MEDIA
- Propuesta: extraer un helper de período compartido junto con el selector de audit-period-filter.tsx
- Zona: libre

### [POD-344] src/app/(protected)/admin/_components/AdminErrorBoundary.tsx (D3-c1)
- Hallado en F2 (D3-L1) · `src/app/(protected)/admin/_components/AdminErrorBoundary.tsx` · Nodo(s): h4.adm-shell · Alcance: fusión con otra implementación (no se borra sin consolidar) — wrapper de una sola llamada sobre SectionErrorBoundary con un TODO de Sentry obsoleto (SectionErrorBoundary.tsx:64 ya captura) · Señales: Wrapper de una sola llamada sobre SectionErrorBoundary (:16-24); Comentario :13 'para no romper los 10 imports existentes'; Comentario :15 'TODO Sentry' obsoleto (SectionErrorBoundary.tsx:64 ya captura)
- Qué rompe si se borra: Los error.tsx de admin (admin/error.tsx:3, alerts/error.tsx:3, audit-log/error.tsx:3 y los de chatbots, clients, leados, leads, messages, projects, settings, team, tickets) cambiarían el import
- Confianza de poda: MEDIA
- Propuesta: decidir: re-apuntar los error.tsx del admin a SectionErrorBoundary y borrar el wrapper, o dejarlo y borrar el TODO
- Zona: libre

### [POD-345] src/app/(protected)/admin/_components/PageTransition.tsx (D3-c1)
- Hallado en F2 (D3-L1) · `src/app/(protected)/admin/_components/PageTransition.tsx` · Nodo(s): h4.adm-shell · Alcance: el archivo entero — en el layout persistente solo anima el primer montaje (DEU-057) · Señales: Único consumidor: layout.tsx:65; En un layout persistente solo anima el primer montaje, no cada navegación
- Qué rompe si se borra: layout.tsx:6 y :65; si se quiere la transición por página, moverla a template.tsx
- Confianza de poda: MEDIA
- Propuesta: decidir: moverlo a admin/template.tsx si se quiere la transición por página, o borrarlo con su uso en layout.tsx:65
- Zona: libre

### [POD-346] src/app/(protected)/admin/_components/dashboard-history-charts.tsx (D3-c1)
- Hallado en F2 (D3-L1) · `src/app/(protected)/admin/_components/dashboard-history-charts.tsx` · Nodo(s): h4.adm-shell · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — formatCurrency de :69-74, idéntico a admin/page.tsx:120-125 · Señales: formatCurrency duplicado: dashboard-history-charts.tsx:69-74 idéntico a page.tsx:120-125
- Qué rompe si se borra: Nada si se extrae a un util compartido; solo el duplicado, no el archivo
- Confianza de poda: MEDIA
- Propuesta: extraer formatCurrency a un util compartido; el archivo queda
- Zona: libre

### [POD-347] src/app/(protected)/admin/clients/_actions/client.actions.ts (D3-c1)
- Hallado en F2 (D3-L2) · `src/app/(protected)/admin/clients/_actions/client.actions.ts` · Nodo(s): h4.adm-clientes · Alcance: exports sueltos (el archivo sigue vivo) — stopImpersonationAction (:12-14) sin importadores; el módulo es un re-export de lib/actions/impersonation · Señales: stopImpersonationAction (:12-14) sin importadores: git grep -n stopImpersonationAction origin/main -- logic-core-v3/src solo devuelve la definicion, la base impersonation.ts:50 y ImpersonationBanner.tsx:2 (que importa la base); el modulo entero es un re-export de lib/actions/impersonation; su unico consumidor es ImpersonateButton.tsx:6
- Qué rompe si se borra: Nada si se borra stopImpersonationAction; si se borra el archivo, ImpersonateButton.tsx:6 debe importar startImpersonationAction desde @/lib/actions/impersonation
- Confianza de poda: MEDIA
- Propuesta: borrar stopImpersonationAction; opcional: que ImpersonateButton.tsx:6 importe de lib/actions/impersonation y borrar el archivo
- Zona: libre

### [POD-348] src/app/(protected)/admin/clients/_components/HoverScaleCard.tsx (D3-c1)
- Hallado en F2 (D3-L2) · `src/app/(protected)/admin/clients/_components/HoverScaleCard.tsx` · Nodo(s): h4.adm-clientes · Alcance: fusión con otra implementación (no se borra sin consolidar) — duplica hover-scale.tsx de Tickets y adminHoverCls de lib/hover (8 importadores); su comentario deja la unificación para después del merge · Señales: Duplica el patron de hover de admin/tickets/_components/hover-scale.tsx y de adminHoverCls (lib/hover, usado en AlertsClient.tsx:8); Su propio comentario dice 'LOCAL al worktree de clientes... unificacion queda para post-merge' (:8-17); PLAN-555 pendiente
- Qué rompe si se borra: 8 importadores (BillingOverrideCard, ClientHeader, ChatbotTab, OverviewTab, ProjectsTab, SupportTab, VaultTab, ChatbotManager) a re-apuntar; mover a src/components/ui es zona FROZEN
- Confianza de poda: MEDIA
- Propuesta: unificar después del merge de rediseno/home (PLAN-555); lib/hover.ts es FROZEN-inferido: decisión para Valentino
- Zona: libre

### [POD-349] src/app/(protected)/admin/clients/[clientId]/chatbot/[[...tab]]/page.tsx (D3-c1)
- Hallado en F2 (D3-L2) · `src/app/(protected)/admin/clients/[clientId]/chatbot/[[...tab]]/page.tsx` · Nodo(s): h4.adm-clientes · Alcance: el archivo entero — redirect deprecado solo para bookmarks viejos, roto con ids y sin install ni integrations (BUG-124); ningún link interno lo genera · Señales: Ruta deprecada (STATUS.md:216) solo para bookmarks viejos; Solo funciona con slug mientras toda la UI genera cuids; Ningun link interno la genera (git grep '/chatbot' en admin/clients solo encuentra links a /admin/chatbots)
- Qué rompe si se borra: Bookmarks viejos de /admin/clients/<slug>/chatbot/* darian 404
- Confianza de poda: MEDIA
- Propuesta: decidir: arreglarlo (id o slug y las 8 tabs) o borrarlo si no quedan bookmarks
- Zona: libre

### [POD-350] src/app/(protected)/admin/messages/_components/emoji-popover.tsx (D3-c1)
- Hallado en F2 (D3-L3) · `src/app/(protected)/admin/messages/_components/emoji-popover.tsx` · Nodo(s): h4.adm-mensajes · Alcance: fusión con otra implementación (no se borra sin consolidar) — duplica el wrapper de tickets/_components/emoji-picker-button.tsx (mismo dynamic import de EmojiPickerPanel) con posicionamiento propio · Señales: Duplica el wrapper de admin/tickets/_components/emoji-picker-button.tsx:12-13: ambos hacen dynamic(import('@/modules/chatbot/components/admin/config/EmojiPickerPanel')); Lógica de posicionamiento/portal propia (calcPosition :34-42) en vez de compartida
- Qué rompe si se borra: Nada si se unifica en un componente compartido usado por Mensajes y Tickets
- Confianza de poda: MEDIA
- Propuesta: unificar en un componente compartido de Mensajes y Tickets
- Zona: libre

### [POD-351] src/app/(protected)/admin/leads/_components/lead-card.helpers.ts (D3-c1)
- Hallado en F2 (D3-L3) · `src/app/(protected)/admin/leads/_components/lead-card.helpers.ts` · Nodo(s): h4.adm-leads · Alcance: fusión con otra implementación (no se borra sin consolidar) — serviceBadgeTone y serviceLabel copiados en [leadId]/page.tsx:64-92 y demo-form.tsx:48-76; formatRelativeTime duplica relativeTime de lead-activity.helpers.ts:50 con otra salida · Señales: serviceBadgeTone/serviceLabel repetidos en [leadId]/page.tsx:64-92 y demo-form.tsx:48-76; formatRelativeTime duplica relativeTime de lead-activity.helpers.ts:50 con salida distinta
- Qué rompe si se borra: Nada: es consolidar, no borrar; las copias locales de page.tsx y demo-form.tsx son las que sobran
- Confianza de poda: MEDIA
- Propuesta: dejar este archivo como única fuente y borrar las copias locales
- Zona: libre

### [POD-352] src/app/(protected)/admin/leads/_components/demo-form.tsx (D3-c1)
- Hallado en F2 (D3-L3) · `src/app/(protected)/admin/leads/_components/demo-form.tsx` · Nodo(s): h4.adm-leads · Alcance: exports sueltos (el archivo sigue vivo) — export DemoForm sin importadores externos; redefine DemoServiceType (:11) y SERVICE_OPTIONS (:38) · Señales: `export function DemoForm` sin importadores externos (git grep: sólo demo-form.tsx:267); Redefine DemoServiceType (:11) y SERVICE_OPTIONS (:38) que ya existen en lead-pipeline.shared.ts:75 y lead-form.tsx:53
- Qué rompe si se borra: Nada al quitar el export y reusar los tipos compartidos
- Confianza de poda: MEDIA
- Propuesta: quitar el export y reusar los tipos de lead-pipeline.shared.ts y lead-form.tsx
- Zona: libre

### [POD-353] src/app/(protected)/admin/leads/_components/lead-pipeline.shared.ts (D3-c1)
- Hallado en F2 (D3-L3) · `src/app/(protected)/admin/leads/_components/lead-pipeline.shared.ts` · Nodo(s): h4.adm-leads · Alcance: exports sueltos (el archivo sigue vivo) — emptyGroupedLeads (:103) y PipelineGroupId (:22) exportados pero usados solo dentro del archivo · Señales: emptyGroupedLeads (:103) y PipelineGroupId (:22) exportados pero sólo usados dentro del mismo archivo (git grep)
- Qué rompe si se borra: Nada (sólo reducir superficie exportada)
- Confianza de poda: MEDIA
- Propuesta: dejar de exportarlos
- Zona: libre

### [POD-354] src/app/(protected)/admin/projects/_actions/project.schemas.ts (D3-c1)
- Hallado en F2 (D3-L4) · `src/app/(protected)/admin/projects/_actions/project.schemas.ts` · Nodo(s): h4.adm-proyectos · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — campos legacy businessName, contactName, contactPhone y contactEmail (:61-65): ninguna action los lee y el formulario no los envía · Señales: Campos legacy businessName, contactName, contactPhone y contactEmail (:61-65): ninguna action los lee (git grep 'parsed.businessName|parsed.contactEmail|data.businessName' da 0) y el form no los envía (project-form.tsx:156-165)
- Qué rompe si se borra: Nada.
- Confianza de poda: MEDIA
- Propuesta: borrar los 4 campos
- Zona: libre

### [POD-355] src/app/(protected)/admin/projects/_components/overlay-modal.tsx (D3-c1)
- Hallado en F2 (D3-L4) · `src/app/(protected)/admin/projects/_components/overlay-modal.tsx` · Nodo(s): h4.adm-proyectos · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — useIsClient local (:14-23) duplica src/lib/use-is-client.ts · Señales: useIsClient local (:14-23) duplica src/lib/use-is-client.ts:15, que ya usan projects-board.tsx:20 y projects-period-dropdown.tsx:6; Es un modal propio del lane, paralelo a src/components/ui/Modal.tsx:26 (decisión documentada por el trap de backdrop-filter)
- Qué rompe si se borra: Nada si se importa el hook compartido; el modal propio se mantiene por decisión del lane.
- Confianza de poda: MEDIA
- Propuesta: importar el hook compartido; el modal propio se queda (decisión documentada del lane)
- Zona: libre

### [POD-356] src/lib/premium-features.ts (D3-c1)
- Hallado en F2 (D3-L5) · `src/lib/premium-features.ts` · Nodo(s): lib.premium-features · Alcance: el archivo entero — catálogo legacy: su runtime solo lo usa lib/actions/settings.ts (POD-062, sin importadores) y sus claves no coinciden con los slugs de PremiumModule (DEU-065) · Señales: El catálogo en runtime (PREMIUM_FEATURE_KEYS/LABELS) solo lo importa src/lib/actions/settings.ts:12-16, que no tiene importadores; PREMIUM_FEATURE_OPTIONS y PREMIUM_FEATURE_DEFAULTS sin usos (git grep -w); Sus claves no coinciden con los slugs de PremiumModule (premium-features.ts:51 'motor-resenias' vs premium-modules.ts:24 'motor-resenas')
- Qué rompe si se borra: Solo el import de tipo PremiumFeatureKey en settings.actions.ts:10 y settings-console.tsx:16 (reemplazar por string) y el módulo muerto lib/actions/settings.ts
- Confianza de poda: MEDIA
- Propuesta: borrar junto con lib/actions/settings.ts y tipar los precios con el slug de PremiumModule
- Zona: libre

### [POD-357] src/lib/alerts.ts#sendTestAgencyAlert (D3-c1)
- Hallado en F2 (D3-L5) · `src/lib/alerts.ts#sendTestAgencyAlert` · Nodo(s): lib.alerts · Alcance: exports sueltos (el archivo sigue vivo) — su único llamador es lib/actions/settings.ts (POD-062); la consola nueva no tiene botón de prueba · Señales: Único llamador: src/lib/actions/settings.ts:8, módulo sin importadores; La consola nueva no tiene botón de prueba
- Qué rompe si se borra: Nada vivo; conviene reutilizarlo para un 'Probar webhook' antes de podar
- Confianza de poda: MEDIA
- Propuesta: reusarla para un «Probar webhook» en Configuración antes de podarla (decidir (Valentino): archivo congelado)
- Zona: congelado

### [POD-358] src/lib/agency-settings.ts#AGENCY_TIMEZONE (D3-c1)
- Hallado en F2 (D3-L5) · `src/lib/agency-settings.ts#AGENCY_TIMEZONE` · Nodo(s): lib.agency-settings · Alcance: exports sueltos (el archivo sigue vivo) — constante sin usos (solo la definición de :20) · Señales: git grep -w AGENCY_TIMEZONE: solo la definición (agency-settings.ts:20)
- Qué rompe si se borra: Nada
- Confianza de poda: MEDIA
- Propuesta: borrar
- Zona: libre

### [POD-359] src/lib/actions/leads-constants.ts (D3-c1)
- Hallado en F2 (D3-L6) · `src/lib/actions/leads-constants.ts` · Nodo(s): h4.adm-leads · Alcance: el archivo entero — solo lo importa lib/actions/leads.ts (POD-060, sin importadores); LEAD_STATUS_VALUES está duplicado en admin/leads/_actions/lead.schemas.ts:4 · Señales: solo lo importa leads.ts (muerto); LEAD_STATUS_VALUES duplicado en admin/leads/_actions/lead.schemas.ts:4
- Qué rompe si se borra: Nada si se borra junto con leads.ts.
- Confianza de poda: MEDIA
- Propuesta: borrar junto con lib/actions/leads.ts
- Zona: libre

### [POD-360] instrumentation.ts (D7-c1)
- Hallado en F2 (D7-L1) · `instrumentation.ts` · Nodo(s): lib.plataforma.instrumentation · Alcance: el archivo entero — la instrumentation de la raíz: Next 16 solo ejecuta src/instrumentation.ts porque la app vive en src/; sin importadores; solo importa los sentry.*.config legacy · Señales: Next 16.2.9 busca instrumentation en join(appDir, '..') = src (node_modules/next/dist/build/index.js:615-616) y existe src/instrumentation.ts; sin importadores; solo importa los sentry.*.config legacy
- Qué rompe si se borra: nada en runtime; corregir docs que piden SENTRY_DSN
- Confianza de poda: MEDIA
- Propuesta: borrar junto con sentry.server.config.ts y sentry.edge.config.ts, y corregir los docs que piden SENTRY_DSN (FAL-030)
- Zona: libre

### [POD-361] sentry.server.config.ts (D7-c1)
- Hallado en F2 (D7-L1) · `sentry.server.config.ts` · Nodo(s): lib.plataforma.sentry-server-config · Alcance: el archivo entero — solo lo importa la instrumentation de la raíz, que no corre; lee SENTRY_DSN · Señales: solo lo importa instrumentation.ts de la raíz (muerto); @sentry/nextjs 10.62 no lo autocarga: solo advierte (build/cjs/config/webpack.js:318-329); lee SENTRY_DSN, que nadie más usa
- Qué rompe si se borra: nada
- Confianza de poda: MEDIA
- Propuesta: borrar con instrumentation.ts de la raíz
- Zona: libre

### [POD-362] sentry.edge.config.ts (D7-c1)
- Hallado en F2 (D7-L1) · `sentry.edge.config.ts` · Nodo(s): lib.plataforma.sentry-edge-config · Alcance: el archivo entero — igual que sentry.server.config.ts · Señales: idem sentry.server.config.ts
- Qué rompe si se borra: nada
- Confianza de poda: MEDIA
- Propuesta: borrar con instrumentation.ts de la raíz
- Zona: libre

### [POD-363] src/app/api/test-sentry/route.ts (D7-c1)
- Hallado en F2 (D7-L1) · `src/app/api/test-sentry/route.ts` · Nodo(s): int.sentry · Alcance: el archivo entero — ruta de prueba pública, sin referencias (SEC-093) · Señales: sin referencias (git grep test-sentry vacío); 500 público permanente
- Qué rompe si se borra: la prueba manual de Sentry (reemplazable por una acción solo SUPER_ADMIN)
- Confianza de poda: MEDIA
- Propuesta: borrar, o reemplazarla por una acción solo SUPER_ADMIN
- Zona: libre

### [POD-364] src/lib/integrations/brevo.ts (D7-c1)
- Hallado en F2 (D7-L1) · `src/lib/integrations/brevo.ts` · Nodo(s): int.brevo · Alcance: exports sueltos (el archivo sigue vivo) — getCampaignStats (:143-166) sin llamadores; cuenta las listas como destinatarios y solo los softBounces · Señales: sin llamadores (git grep -l solo brevo.ts); cuenta listas como destinatarios (:157) y solo softBounces (:160)
- Qué rompe si se borra: nada
- Confianza de poda: MEDIA
- Propuesta: borrarla, o corregirla cuando haya métricas de campañas (BUG-025)
- Zona: libre

### [POD-365] src/lib/n8n.ts (D7-c1)
- Hallado en F2 (D7-L1) · `src/lib/n8n.ts` · Nodo(s): int.n8n · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — getN8nMetrics (:259) con sus tipos y constantes de métricas, sin llamadores; N8N_API_URL y N8N_API_KEY solo los lee ese bloque · Señales: sin llamadores; N8N_API_URL/KEY solo los usa esto y settings.ts (módulo sin importadores según D1)
- Qué rompe si se borra: nada; mantener sendLeadToN8n (:18-35)
- Confianza de poda: MEDIA
- Propuesta: borrar el bloque de métricas; sendLeadToN8n (:18-35) se queda
- Zona: libre

### [POD-366] src/app/api/track/route.ts (D7-c1)
- Hallado en F2 (D7-L1) · `src/app/api/track/route.ts` · Nodo(s): int.tracking · Alcance: el archivo entero — ruta sin consumidores (SEC-042) · Señales: sin consumidores (git grep api/track fuera de la ruta -> vacío; control: api/chatbot en useChatbot.ts); SEC-042
- Qué rompe si se borra: nada
- Confianza de poda: MEDIA
- Propuesta: borrar
- Zona: libre

### [POD-367] src/app/(protected)/admin/leados/setter/[setterId]/_components/setter-evaluaciones.tsx (D4-c1)
- Hallado en F2 (D4-L1) · `src/app/(protected)/admin/leados/setter/[setterId]/_components/setter-evaluaciones.tsx` · Nodo(s): h5.adm-revision-demos · Alcance: fusión con otra implementación (no se borra sin consolidar) — copia deliberada de dossier-panels.tsx:55-59 (PLAN-677) y el mapa STAGE_PILL duplicado en [leadId]/page.tsx:36-44 y pipeline-board.tsx:25-33 · Señales: Copia deliberada de dossier-panels.tsx:55-59 (PLAN-677); Mapa STAGE_PILL también duplicado entre [leadId]/page.tsx:36-44 y pipeline-board.tsx:25-33
- Qué rompe si se borra: Nada si se extraen a src/lib/leados-ui.ts junto a STAGE_TONE.
- Confianza de poda: MEDIA
- Propuesta: extraer a un helper compartido de LeadOS junto a STAGE_TONE (decidir (Franco))
- Zona: ZONA-FRANCO

### [POD-368] src/lib/leados/herramientas.ts (D4-c1)
- Hallado en F2 (D4-L2, D4-L5, D4-L6) · `src/lib/leados/herramientas.ts` · Nodo(s): lib.leados · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — la entrada «evaluador» (:53-64), sin pantalla desde D15-bis y todavía en HERRAMIENTAS_ORDEN (:123) · Señales: url null con TODO (herramientas.ts:63); ningún ToolGuide ni HerramientaLauncher con id evaluador en src (git grep); el paso Evaluación se fusionó con la ficha (bitácora D15-bis), así que la fila anuncia una fase retirada; Entrada 'evaluador' (herramientas.ts:53-64) sin pantalla desde D15-bis; solo la usa el rail genérico; url null con TODO: URL (herramientas.ts:63); sigue en HERRAMIENTAS_ORDEN (:123) y lo pinta tools-rail.tsx:26; ninguna pantalla del manual lo usa desde D15-bis (manual.ts:157-162)
- Qué rompe si se borra: tests/setter/16-municiones-salida.spec.ts:132, que espera ['evaluador','gemDiseno','claudeDesign','gemOutreach'] como herramientas sin URL; y el tipo HerramientaId si algo lo referencia. / tests/setter/16-municiones-salida.spec.ts:132, que afirma la lista de herramientas sin URL / Si se borra del union HerramientaId: revisar tool-guide.tsx y cualquier dondeSeUsa que lo nombre; sacarlo solo de HERRAMIENTAS_ORDEN no rompe tipos.
- Confianza de poda: MEDIA
- Propuesta: sacarla del orden y del union HerramientaId, actualizando tests/setter/16-municiones-salida.spec.ts:132 (FAL-033) (decidir (Franco))
- Zona: ZONA-FRANCO

### [POD-369] src/app/(protected)/setter/leads/[leadId]/_components/ficha-step.tsx (D4-c1)
- Hallado en F2 (D4-L3) · `src/app/(protected)/setter/leads/[leadId]/_components/ficha-step.tsx` · Nodo(s): h5.set-lead · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — la rama editable (:53-90): el único consumidor (m1-ficha.tsx:212) pasa siempre editable={false} · Señales: Su único consumidor es m1-ficha.tsx:212 y siempre pasa editable={false} (git grep '<FichaStep').; La rama editable (ficha-step.tsx:53-90) monta FichaForm sin cierre y un CopyBlock para el Evaluador externo, que desde D15-bis no tiene pantalla.; El header 'Paso' duplicado que señaló auditoria-consistencia-setter.md:125 vive solo en esta rama muerta.
- Qué rompe si se borra: Nada en runtime. Quitar la rama editable reduce el archivo a la vista congelada; hay que revisar la referencia en comentario de guidance-content.ts:307.
- Confianza de poda: MEDIA
- Propuesta: quitar la rama editable y su CopyBlock del evaluador externo (decidir (Franco))
- Zona: ZONA-FRANCO

### [POD-370] src/app/(protected)/setter/leads/[leadId]/_components/evaluacion-form.tsx (D4-c1)
- Hallado en F2 (D4-L3) · `src/app/(protected)/setter/leads/[leadId]/_components/evaluacion-form.tsx` · Nodo(s): h5.set-lead · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — TEXTOS_WIZARD (:55-59) y VEREDICTO_LABELS (:42-46), restos del wizard: el único consumidor pasa TEXTOS_M1 · Señales: TEXTOS_WIZARD (evaluacion-form.tsx:55-59) es el default de textos, pero el único consumidor (m1-ficha.tsx:196-201) siempre pasa TEXTOS_M1.; VEREDICTO_LABELS (:42-46) está copiado tal cual en TEXTOS_M1.veredictoLabels (m1-ficha.tsx:137-141).; Los comentarios hablan del 'wizard' y de 'm2', que ya no existen.
- Qué rompe si se borra: Nada. Es una limpieza parcial (el componente está vivo); tests/qa-persona/corrida-1-novato-frio.spec.ts lo nombra solo en una captura.
- Confianza de poda: MEDIA
- Propuesta: borrarlos y dejar TEXTOS_M1 como única fuente (decidir (Franco))
- Zona: ZONA-FRANCO

### [POD-371] src/lib/leados/guidance-content.ts (D4-c1)
- Hallado en F2 (D4-L5) · `src/lib/leados/guidance-content.ts` · Nodo(s): lib.leados · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — GUIA_CONSTRUCCION (:643), GUIA_TRASPASO (:887), GUIA_REVISION.aprobada (:958), GUIA_EVALUACION.porque y .ejemplos (:519-538) y el tipo SelfCheckRazon (:167-170), sin lectores · Señales: GUIA_CONSTRUCCION (:643), GUIA_TRASPASO (:887) y GUIA_REVISION.aprobada (:958) sin lectores; TeachPanel solo usa 'objeciones' y 'selfCheck'; GUIA_EVALUACION.porque/ejemplos (:519-538) no se renderizan y contradicen el gate; Tipo SelfCheckRazon y campo selfCheckRazones sin uso (:167-170, :276)
- Qué rompe si se borra: Nada si solo se quitan esas claves y sus entradas en GUIA_PASOS (:1201, :1208); el resto del archivo está vivo
- Confianza de poda: MEDIA
- Propuesta: quitar esas claves y sus entradas en GUIA_PASOS; el resto del archivo está vivo (decidir (Franco))
- Zona: ZONA-FRANCO

### [POD-372] src/lib/leados/flow.ts (D4-c1)
- Hallado en F2 (D4-L5) · `src/lib/leados/flow.ts` · Nodo(s): lib.leados · Alcance: exports sueltos (el archivo sigue vivo) — agruparParaHome (:653-667) sin consumidores en src, tests ni scripts · Señales: agruparParaHome (flow.ts:653-667) sin consumidores en src, tests ni scripts (git grep -w)
- Qué rompe si se borra: Nada (verificar invariantes que la importen: git grep no encontró ninguno)
- Confianza de poda: MEDIA
- Propuesta: borrar (decidir (Franco))
- Zona: ZONA-FRANCO

### [POD-373] src/lib/leados/paso.ts (D4-c1)
- Hallado en F2 (D4-L6) · `src/lib/leados/paso.ts` · Nodo(s): lib.leados · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — derivarPasoDelLead: manual.ts:552-578 solo lee anchor «opener» y foco.tono; el resto de la derivación no tiene lector · Señales: derivarPasoDelLead tiene un único consumidor: manual.ts:552 (git grep); manual.ts lee solo paso.anchor==='opener' y paso.foco.tono en la rama EVALUADA (:574-578); indice y las ramas de foco/anchor de otros stages no tienen lector; los consumidores que cita la cabecera (DossierStepper, PasoActualBanner, StepAnchor) solo aparecen en paso.ts (git grep); conserva la trampa APROBADA sin finalUrl (paso.ts:169-192) y el copy «Seguimiento» (:184)
- Qué rompe si se borra: Reducirlo (no borrarlo) toca manual.ts:552-578; aprobada-sin-link.invariant.ts:369 lista el archivo y habría que actualizar la lista.
- Confianza de poda: MEDIA
- Propuesta: reducirlo a lo que lee manual.ts y actualizar la lista de aprobada-sin-link.invariant.ts:369 (decidir (Franco))
- Zona: ZONA-FRANCO

### [POD-374] src/lib/leados/paso-admitido.ts (D4-c1)
- Hallado en F2 (D4-L6) · `src/lib/leados/paso-admitido.ts` · Nodo(s): lib.leados · Alcance: el archivo entero — generador del barrido y fixtures de test (con la ficha de forma vieja) viviendo en src/lib; solo lo importan dos invariantes · Señales: solo lo importan paso-admitido.invariant.ts y aprobada-sin-link.invariant.ts (git grep); contiene el generador del barrido y fixtures de test con 'as unknown as' (:189-192, :200-214); la fixture FICHA tiene la forma vieja de la ficha (contracts.ts:52)
- Qué rompe si se borra: Moverlo junto a los invariantes rompe los imports relativos de esos dos invariantes; no lo usa ningún código de producción.
- Confianza de poda: MEDIA
- Propuesta: moverlo junto a los invariantes, fuera de src/lib, con la ficha de la forma nueva (decidir (Franco))
- Zona: ZONA-FRANCO

### [POD-375] tailwind.config.ts (D8-c1)
- Hallado en F2 (D8-L1) · `tailwind.config.ts` · Nodo(s): lib.plataforma.tailwind-config · Alcance: el archivo entero — Tailwind 4 no lo carga (globals.css no tiene @config) y su plugin typography ya está en globals.css:2; ninguna clase develop-* en src (DEU-091) · Señales: Tailwind 4 no lo carga: git grep '@config\|@source' en src/*.css = 0; plugin typography duplicado en globals.css:2; ninguna clase develop-* en src (git grep = 0); warning de eslint import/no-anonymous-default-export (tailwind.config.ts:19); ningún archivo lo referencia (git grep 'tailwind.config' fuera de docs y lock = 0)
- Qué rompe si se borra: Nada en el build. Deja de importar design-tokens.ts, que sigue en uso por Modal, setter-shell y DashboardLayoutClient y NO se borra.
- Confianza de poda: MEDIA
- Propuesta: borrar; design-tokens.ts sigue en uso por otros importadores y se queda
- Zona: libre

### [POD-376] netlify.toml (D8-c1)
- Hallado en F2 (D8-L1) · `netlify.toml` · Nodo(s): lib.plataforma.netlify · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — el rewrite forzado de /api/chatbot/* a sí mismo (nació en b4a2a8a3 «sin funcionar»); el proxy no cubre /api/chatbot, así que no saltea nada · Señales: rewrite 200 forzado de /api/chatbot/* a sí mismo; nació en b4a2a8a3 'Commit roadmap chatbot finalizado - sin funcionar'; src/proxy.ts:172 no incluye /api/chatbot, así que no sirve para saltear el proxy
- Qué rompe si se borra: HIPÓTESIS: nada. Verificar en un deploy preview que el chat y la config del widget siguen respondiendo.
- Confianza de poda: MEDIA
- Propuesta: borrar el rewrite y probar en un deploy preview que el chat y la config del widget siguen respondiendo
- Zona: libre

### [POD-377] package.json (D8-c1)
- Hallado en F2 (D8-L1) · `package.json` · Nodo(s): lib.plataforma.package · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — dependencias sin uso: @next/bundle-analyzer instalado sin cablear en next.config.ts; html2canvas y jspdf solo los usa DownloadReportButton.tsx (POD-016, huérfano) (DEU-094) · Señales: @next/bundle-analyzer (package.json:182) no lo importa nadie; html2canvas y jspdf (package.json:148-149) solo los usa src/components/dashboard/DownloadReportButton.tsx:44-45; depcruise marca DownloadReportButton.tsx como huérfano (_crudo/depcruise-resumen.json)
- Qué rompe si se borra: DownloadReportButton.tsx deja de compilar: se borra junto. Mejor cablear el analyzer que quitarlo.
- Confianza de poda: MEDIA
- Propuesta: quitar html2canvas y jspdf al borrar POD-016; cablear el analyzer detrás de ANALYZE=true o quitarlo
- Zona: libre

### [POD-378] next.config.ts (D8-c1)
- Hallado en F2 (D8-L1) · `next.config.ts` · Nodo(s): lib.plataforma.next-config · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — placehold.co en images.remotePatterns sin ningún <Image> que lo use (solo un comentario de ShowcaseSection.tsx, POD-039) y su preconnect en layout.tsx:79 (PERF-017) · Señales: placehold.co solo aparece en un comentario de src/components/sections/web-development/ShowcaseSection.tsx:8, componente huérfano; preconnect sin uso en src/app/layout.tsx:79
- Qué rompe si se borra: Nada. Un <Image> remoto de placehold.co dejaría de optimizarse, pero no hay ninguno.
- Confianza de poda: MEDIA
- Propuesta: quitar el remotePattern y el preconnect
- Zona: libre

### [POD-379] src/app/api/version/route.ts (D8-c1)
- Hallado en F2 (D8-L1) · `src/app/api/version/route.ts` · Nodo(s): lib.plataforma.version · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — la ruta tiene un consumidor (scripts/_b14-4-smoke-prod.mjs:82); lo muerto es el valor: version fija 1.0.0 y builtAt con la hora del pedido (BUG-172) · Señales: devuelve una versión fija y una fecha de build falsa (route.ts:5-6); único consumidor: scripts/_b14-4-smoke-prod.mjs:82
- Qué rompe si se borra: El smoke de prod. Conviene arreglarlo (SHA del commit) en vez de borrarlo.
- Confianza de poda: MEDIA
- Propuesta: no borrar la ruta: devolver el SHA y la fecha del commit del deploy
- Zona: libre

### [POD-380] scripts/admin-1a-backfill-caliente.ts (D9-c1)
- Hallado en F2 (D9-L1) · `scripts/admin-1a-backfill-caliente.ts` · Nodo(s): lib.scripts · Alcance: el archivo entero — one-shot ya aplicado; re-correrlo pisa las marcas manuales de caliente (ZONA-FRANCO) · Señales: One-shot ya aplicado: admin-1b escribe caliente a mano (lead.actions.ts:165); Re-correrlo es dañino (pisa marcas manuales); Sin importadores ni entrada en package.json (git grep 'admin-1a' -> 0)
- Qué rompe si se borra: Nada; coordinar con Franco (ZONA-FRANCO)
- Confianza de poda: MEDIA
- Propuesta: borrar, con el visto bueno de Franco
- Zona: libre

### [POD-381] src/components/ui/ErrorState.tsx (D9-c1)
- Hallado en F2 (D9-L2) · `src/components/ui/ErrorState.tsx` · Nodo(s): lib.ui · Alcance: el archivo entero — congelado (ui/*): su única referencia es el barrel index.ts:6; nadie lo mantiene · Señales: Unica referencia fuera de su archivo: export en src/components/ui/index.ts:6; git grep -n ErrorState en src y tests: solo definicion + barrel; Copy sin tildes (:24-25) y strokeWidth 1.75 (:41,:58): nadie lo mantiene
- Qué rompe si se borra: Nada en runtime; quitar tambien la linea 6 de index.ts (FROZEN: decision para Valentino).
- Confianza de poda: MEDIA
- Propuesta: decisión para Valentino (11-CONGELADOS.md): borrar con su línea del barrel (decidir (Valentino): archivo congelado)
- Zona: congelado

### [POD-382] src/components/ui/HyperText.tsx (D9-c1)
- Hallado en F2 (D9-L2) · `src/components/ui/HyperText.tsx` · Nodo(s): lib.ui · Alcance: el archivo entero — congelado (ui/*): su único importador es Interactive3DNetwork.tsx, que no tiene importadores · Señales: Unico importador: src/components/canvas/Interactive3DNetwork.tsx:7; Interactive3DNetwork no tiene importadores (git grep solo encuentra docs y su propio archivo; ya marcado muerto en auditoria-total-pre-deploy.md:56); Comentarios de agente sin resolver (:140-142) y limpieza de intervalos rota (:121-137)
- Qué rompe si se borra: Nada en runtime si se borra junto con Interactive3DNetwork.
- Confianza de poda: MEDIA
- Propuesta: decisión para Valentino (11-CONGELADOS.md): borrar junto con Interactive3DNetwork.tsx (decidir (Valentino): archivo congelado)
- Zona: congelado

### [POD-383] src/lib/design-tokens.ts (D9-c1)
- Hallado en F2 (D9-L2) · `src/lib/design-tokens.ts` · Nodo(s): lib.design-tokens · Alcance: exports sueltos (el archivo sigue vivo) — congelado inferido (DEC-10): solo zIndex tiene consumidores (Modal, DashboardLayoutClient y tres del setter); colors, spacing, radii, typography, shadows, motion y breakpoints no tienen ninguno (DEU-100) · Señales: 5 importadores, todos import { zIndex }; colors, spacing, radii, typography, shadows, motion y breakpoints sin consumidores; colors.service contradice CLAUDE.md:101-103
- Qué rompe si se borra: Borrar el archivo entero rompe Modal.tsx:7 (FROZEN), DashboardLayoutClient.tsx:12 y tres archivos del setter; solo las exportaciones distintas de zIndex son podables.
- Confianza de poda: MEDIA
- Propuesta: decisión para Valentino (11-CONGELADOS.md): dejar solo zIndex o moverlo a un token de globals.css (decidir (Valentino): archivo congelado)
- Zona: congelado

### [POD-384] src/lib/hover.ts (D9-c1)
- Hallado en F2 (D9-L2) · `src/lib/hover.ts` · Nodo(s): lib.hover · Alcance: exports sueltos (el archivo sigue vivo) — congelado inferido (DEC-10): adminHoverAmplifiedCls sin consumidores; adminHoverCls se usa en 41 archivos · Señales: adminHoverAmplifiedCls: 0 consumidores (git grep); adminHoverCls si se usa (41 archivos)
- Qué rompe si se borra: Solo el export adminHoverAmplifiedCls; nada.
- Confianza de poda: MEDIA
- Propuesta: decisión para Valentino (11-CONGELADOS.md): quitar el export sin uso (decidir (Valentino): archivo congelado)
- Zona: congelado

### [POD-385] src/lib/logger.ts (D9-c1)
- Hallado en F2 (D9-L2) · `src/lib/logger.ts` · Nodo(s): lib.logger · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — congelado inferido (DEC-10): el método ai() (:69-72) no tiene usos · Señales: Metodo ai() (:69-72) con 0 usos (git grep 'logger.ai(' -> 0)
- Qué rompe si se borra: Nada.
- Confianza de poda: MEDIA
- Propuesta: decisión para Valentino (11-CONGELADOS.md): quitarlo al tocar el logger por su bug de meta (BUG-183) (decidir (Valentino): archivo congelado)
- Zona: congelado

### [POD-386] src/components/ui/buttons/MagneticCta.tsx (D9-c1)
- Hallado en F2 (D9-L2) · `src/components/ui/buttons/MagneticCta.tsx` · Nodo(s): lib.ui · Alcance: código muerto dentro del archivo (el archivo sigue vivo) — congelado (ui/*): la rama href con Link legacyBehavior (:176-191) no tiene usos y hay un cn local duplicado (:9-11) · Señales: Rama href con <Link legacyBehavior passHref> (:176-191) sin usos: el unico consumidor (Hero.tsx:731,734) no pasa href; cn local duplicado (:9-11)
- Qué rompe si se borra: Nada si se quita la rama href; conviene reemplazarla por <Link> moderno en vez de borrarla, porque el hero la necesita (hallazgo de CTA inerte).
- Confianza de poda: MEDIA
- Propuesta: no borrar la rama: el hero la necesita para que sus CTA naveguen (BUG-179); reemplazarla por un Link moderno y usar el cn de lib/utils (decidir (Valentino): archivo congelado)
- Zona: congelado

### Refuerzos de F2 sobre fichas de F1

- [POD-046] `src/lib/actions/invitations.ts` (D1-c1): inviteClientAction sin callers (git grep inviteClient -> solo :43); Construye inviteUrl (:110) y no la usa ni la envia; el mensaje dice 'impreso en la consola' (:116). Qué rompe: Nada; confirmar con D4 junto a settings.ts y clients.ts (tambien sin importadores)
- [POD-178] `prisma/migrations/__diff_check.sql` (D6-c1): 0 bytes; Está suelto en la raíz de migrations (Prisma solo lee carpetas); Commit 7fe804db del 2026-04-28; commit 7fe804db (2026-04-28) sin uso posterior; sin referencias fuera de los docs de esta auditoría; archivo suelto dentro de prisma/migrations (Prisma solo lee subcarpetas). Qué rompe: Nada. / Nada. (Adyacente al lote: no figura en la lista, se reporta por estar en la carpeta de migraciones.)
- [POD-203] `prisma/schema.prisma` (D6-c1): Sin lectores en src; Único escritor src/lib/actions/clients.ts:164,199, módulo sin importadores (D1); Seeds lo siguen llenando (seed.ts:204,219). Qué rompe: Requiere migración DROP COLUMN sobre schema FROZEN: decisión para Valentino.
- [POD-016] `src/components/dashboard/DownloadReportButton.tsx` (D2-c1): fuera del lote; export DownloadReportButtons sin importadores; usa mockData y deps html2canvas/jspdf exclusivas. Qué rompe: Nada en runtime.
- [POD-078] `src/lib/actions/notifications.ts` (D2-c1): la funcion exportada markNotificationReadAction (:19) no tiene importadores (git grep markNotificationReadAction → solo su definicion); duplica markNotificationAsRead de src/actions/dashboard-actions.ts:188 (FROZEN); markNotificationReadAction sin importadores; revalidateAll repite revalidatePath('/dashboard') dos veces (:15-16). Qué rompe: Nada; es una server action publica sin uso (el resto del archivo si se usa). / Nada.
- [POD-077] `src/lib/actions/messages.ts` (D2-c1): sendMessageAction, markAdminMessagesAsReadAction y markMessagesAsReadAction sin importadores; la vía viva del admin es src/app/(protected)/admin/messages/_actions/message.actions.ts:177. Qué rompe: Nada si se borran esas tres; sendClientMessageAction sigue usada por MessageThread.tsx, VaultRequestModal.tsx y OportunidadSEO.tsx.
- [POD-023] `src/components/onboarding/OnboardingWizard.tsx` (D2-c1): no lo importa ningún archivo (git grep 'components/onboarding' origin/main -- src → 0); única vía a saveOnboardingProfile (src/actions/onboarding-actions.ts), que escribe credenciales en claro con url 'ENCRIPTADO_EN_TEXTO'; el onboarding vivo es src/app/bienvenida. Qué rompe: Nada (fuera del lote; ligado a D2-A5).
- [POD-050] `src/modules/chatbot/components/admin/config/Toggle.tsx` (D5-c1): Fuera del lote listado pero en la misma carpeta; 0 importadores: git grep "Toggle['\"]" sólo muestra el import del kit en CrmConfigForm.tsx:9 y el export de components/ui/index.ts:20. Qué rompe: Nada.
- [POD-069] `src/modules/motor/services/sendMessage.ts` (D5-c1): Sin llamadores en src/ ni scripts/: git grep sendMotorMessage solo encuentra la definicion (sendMessage.ts:204); Solo lo ejercitan tests/integration/motor-outbound.spec.ts y motor-window.spec.ts. Qué rompe: Esas dos specs de integracion. NO podar: es una base pasiva planificada para B2 (PLAN-482). Solo seria candidato si Valentino abandona el motor.
- [POD-004] `src/app/(protected)/admin/clients/_actions/client.schemas.ts` (D3-c1): git grep -n 'client.schemas' origin/main -- logic-core-v3/src sin resultados; el registro de cambios dice que se borraron exports muertos de client.actions.ts; el schema quedo huerfano. Qué rompe: Nada por lectura (sin importadores)
- [POD-073] `src/app/(protected)/admin/projects/_actions/project.actions.ts` (D3-c1): getProjectById (:1020-1115), serializeProjectDetail (:505-591) y el tipo ProjectDetailRecord (:95-170): unas 270 líneas sin consumidores (git grep -w getProjectById origin/main -- src devuelve solo la definición); isInternal fijo en false (:524) y texto distinto al resto (:510); deriveProjectLastActivityAt (:408-423) y lastActivityAt (:480): se serializan pero nadie los lee (en admin/projects solo aparecen en el tipo de project-card.tsx:28). Qué rompe: Nada en origin/main. Borrar getProjectById también quita una server action pública sin uso.
- [POD-072] `src/app/(protected)/admin/projects/_actions/milestone.actions.ts` (D3-c1): unmarkMilestonePaid (:49-77) no tiene consumidores (git grep -w). Qué rompe: Nada. Mejor alternativa: conectarla como 'Deshacer' en Pagos en vez de borrarla.
- [POD-071] `src/app/(protected)/admin/projects/_actions/maintenance.actions.ts` (D3-c1): createMaintenancePayment (:31-58) no tiene consumidores (git grep -w); CreateMaintenancePaymentSchema (maintenance.schemas.ts:19-24) solo lo usa esa función. Qué rompe: Nada.
- [POD-075] `src/app/(protected)/admin/team/_actions/time-entry.actions.ts#updateTimeEntry,listTimeEntriesByUser` (D3-c1): git grep -w en src y tests: solo las definiciones (:195, :310); updateTimeEntry además sin guard de pertenencia. Qué rompe: Nada vivo
- [POD-074] `src/app/(protected)/admin/team/_actions/task.actions.ts#listTasksByUser,reorderTasks` (D3-c1): git grep -w en src y tests: solo las definiciones (:264, :377). Qué rompe: Nada vivo; reorderTasks puede servir si se agrega drag & drop
- [POD-081] `src/app/(protected)/admin/settings/alerts/page.tsx` (D3-c1): Ningún link a /admin/settings/alerts (git grep fuera de su carpeta → 0); Hay otra sección /admin/alerts en el sidebar (admin-sidebar.tsx, entrada 'Alertas'). Qué rompe: Es la única UI que llama a /api/admin/alerts/trigger-detector: enlazarla o mover el botón a /admin/alerts, no borrarla sin reemplazo
- [POD-082] `src/app/(protected)/admin/settings/reports/page.tsx` (D3-c1): Ningún link a /admin/settings/reports (git grep → 0). Qué rompe: Es la única UI de /api/admin/reports/send-now y del historial de envíos semanales
- [POD-058] `src/lib/actions/clients.ts` (D3-c1): 0 importadores: git grep -E "lib/actions/clients['\"]|createClientAction|updateClientAction" origin/main -- src tests scripts → solo definiciones; duplica el alta y la edición vivas (createClientOnly / updateClient.ts); el registro de Clientes §6 da por limpiado el código muerto del sector. Qué rompe: Nada (sin consumidores).
- [POD-061] `src/lib/actions/services.ts` (D3-c1): 0 importadores (git grep createServiceAction|updateServiceStatusAction|deleteServiceAction); Service se escribe en vivo desde admin/projects/_actions/project.actions.ts:280 y :291. Qué rompe: Nada.
- [POD-062] `src/lib/actions/settings.ts` (D3-c1): 0 importadores (git grep de las 6 actions); reemplazado por admin/settings/_actions/settings.actions.ts (updateSettings :127, updateModulePricing :175); contiene un requireSuperAdmin reimplementado (:20-28). Qué rompe: Nada; también desaparece uno de los dos generadores de links /accept-invite (el otro, invitations.ts, también está muerto).
- [POD-060] `src/lib/actions/leads.ts` (D3-c1): 0 importadores (git grep updateLeadStatusAction|updateLeadNotesAction); la versión viva está en admin/leads/_actions (ZONA-FRANCO); guard reimplementado ensureAdmin (:14-17). Qué rompe: Nada.
- [POD-079] `src/lib/actions/projects.ts` (D3-c1): 5 de 7 exports sin importadores (createProjectAction, updateProjectAction, createTaskAction, updateTaskStatusAction, deleteTaskAction); duplica admin/projects/_actions/project.actions.ts (bitacora:6491 ya lo marcaba). Qué rompe: delete-project-button.tsx:6 (deleteProjectAction) y task-list.tsx:22 (sendTaskForApprovalAction): hay que migrarlos antes de borrar.
- [POD-076] `src/lib/actions/contact.ts` (D3-c1): markLeadAsRead (:110) sin importadores; contactFormAction exportada solo para el wrapper submitContactForm (:100-105). Qué rompe: Nada si se quita markLeadAsRead; contact/page.tsx:6 usa submitContactForm.
- [POD-059] `src/lib/actions/gbp-connection.ts` (D7-c1): 'use server' sin importadores (acciones públicas latentes, SEC-053). Qué rompe: el futuro selector de sucursal P3-A.2
- [POD-084] `vercel.json` (D7-c1): el hosting es Netlify (netlify.toml:1-10, AGENTS.md:21); sus 3 crons no corren. Qué rompe: nada, si los crons se migran a functions de Netlify
- [POD-080] `src/app/(protected)/admin/fg2-lab/page.tsx` (D4-c1): Encabezado 'EXPERIMENTAL / DESCARTABLE ... Borrar tras la decisión del experimento' (page.tsx:2-8, fg2-lab-client.tsx:3-8, medicion-panel.tsx:3-7); git grep fg2-lab fuera de su carpeta: 0 enlaces (control: /admin/leados sí está en admin-sidebar.tsx); Último cambio 629fe016 del 2026-06-29; docs/experimentos/fg2-brief-experimento.md:3-4: gate abierto, experimento no corrido. Qué rompe: Nada de producción; quedarían huérfanos src/lib/leados/_experimental/fg2-*.ts y scripts/_experimental/fg2-gen-prompts.ts. Requiere decisión de Franco sobre el experimento.
- [POD-070] `src/app/(protected)/admin/leads/_actions/lead.actions.ts` (D4-c1): git grep -w listLeads|getLeadById: solo las definiciones (control: assignLeadSetter tiene 2 importadores); Devuelven error.message crudo y en inglés. Qué rompe: Nada; los tipos LeadListItem/SerializedLeadDetail (:22-50) quedarían sin uso.
- [POD-063] `src/lib/leados/_experimental/fg2-brief-lab.ts` (D4-c1): Encabezado 'EXPERIMENTAL / DESCARTABLE … BORRAR tras la decisión del experimento' (fg2-brief-lab.ts:2-8); No está conectado al flujo del setter; consumidores: solo admin/fg2-lab (page.tsx:17, fg2-lab-client.tsx:28, medicion-panel.tsx:19) y scripts/_experimental/fg2-gen-prompts.ts:12. Qué rompe: La ruta /admin/fg2-lab y el script de generación de prompts: hay que borrarlos juntos
- [POD-064] `src/lib/leados/_experimental/fg2-casos-gastro.ts` (D4-c1): 'BORRAR junto con el resto del prototipo tras la decisión' (fg2-casos-gastro.ts:9); Datos representativos y WhatsApp de ejemplo (fg2-casos-gastro.ts:43-44). Qué rompe: fg2-lab-client.tsx:29 y scripts/_experimental/fg2-gen-prompts.ts:13
- [POD-160] `scripts/_b14-2-seed-bench-prod.ts` (D9-c1): Cabecera :19 'Throwaway — borrar después del sprint B14.2'; Sin importadores ni entrada en package.json; Crea un bot activo en PROD (:139-180). Qué rompe: _b14-4-smoke-prod.mjs:20 y _b14-2-prod-bot-latency.mjs:22 usan bench-matsu por defecto (el smoke saltea el bloque si el bot no existe, bitacora-roadmap.md:9692)
- [POD-159] `scripts/_b14-2-cleanup-bench-prod.ts` (D9-c1): Cabecera :20 'Throwaway — borrar después del sprint B14.2'; Roto: :102 usa prisma.message con conversationId (Message no lo tiene); Sin importadores ni entrada en package.json. Qué rompe: Nada en código; si bench-matsu sigue en prod, la limpieza tiene que hacerse por otra vía (hard-delete del admin)
- [POD-164] `scripts/cleanup-messages-demo.ts` (D9-c1): Fuera de package.json; Par de scripts/seed-messages-demo.ts (existe); Borra en todas las orgs con solo --confirm (:50). Qué rompe: El camino de reversión de seed-messages-demo.ts: podar los dos juntos o ninguno

## §docs

Se completa en F6 junto con `14-DOCS-CONSOLIDADOS/` (DEC-44): qué doc se borra, qué consolidado lo reemplaza y qué se pierde, si algo.
