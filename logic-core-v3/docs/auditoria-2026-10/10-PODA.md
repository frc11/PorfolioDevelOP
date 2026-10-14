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

## §docs

Se completa en F6 junto con `14-DOCS-CONSOLIDADOS/` (DEC-44): qué doc se borra, qué consolidado lo reemplaza y qué se pierde, si algo.
