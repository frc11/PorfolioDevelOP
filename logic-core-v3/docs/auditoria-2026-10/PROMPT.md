# AUDITORÍA DE RENOVACIÓN — develOP / Logic Core v3

> **Corrida:** Opus 5.5 · esfuerzo `max` · **ultracode ON** · modo rápido OFF
> **Este archivo vive en** `docs/auditoria-2026-10/PROMPT.md`. Es tu instrucción madre: **después de cualquier compactación de contexto, lo releés entero junto con `00-PLAN-Y-LOG.md` antes de seguir.**

---

## /goal

Auditar el repositorio completo de develOP con foco en **lo interno** (herramienta del setter, chatbot centralizado, login de cliente, login de admin, dashboard multi-tenant, panel de admin y todo lo que los sostiene) y entregar, como documentos versionados:

1. **Qué hay** — inventario completo.
2. **Qué falta** para que cada herramienta esté lista y funcional para un cliente real.
3. **Qué mejorar** — tecnología vieja, bugs latentes, seguridad, rendimiento, deuda.
4. **Diseño** — qué del sistema de diseño de `rediseno/home` se puede llevar a las pantallas internas y cómo.
5. **Ideas nuevas** factibles sobre el stack actual.
6. **El Atlas** — un mapa navegable y regenerable de todo el repo (ramas, módulos, rutas, datos, dependencias) para poder sentarse y decir *"hoy quiero hacer esto"*.

Y como cierre, un **backlog de tarjetas de sprint** priorizado que traduce todo lo anterior en trabajo concreto.

**Esto es una auditoría, no un refactor. No se modifica una sola línea de código de la aplicación.**

---

## 1. Modo de corrida

- **Una sola parada obligatoria:** al final de la Fase 0 (plan). Ahí esperás `Aceptar` o `Revisar…`.
- **Después de `Aceptar` corrés desatendido** y tardás lo que haga falta (horas está bien). En ambigüedad tomás la decisión determinista más conservadora, la anotás en el log con `[DECISIÓN]` y seguís. Solo te detenés ante un bloqueo genuino (ver §9), y lo hacés limpio: log + commit de lo hecho + reporte.
- **Iterás en ciclos** (§7) hasta cobertura total del alcance, no hasta "parece suficiente".

---

## 2. Reglas duras (literales, no se reinterpretan)

- **Cero `any`.** Nunca `router.push` directo. **Nunca `prisma migrate reset`.** Nunca secrets hardcodeados.
- **Archivos congelados — se leen, jamás se editan:** `3d/HeroArtifact.tsx` · `context/TransitionContext.tsx` · `context/PreloaderContext.tsx` · `prisma/schema.prisma` · `auth.ts` · `lib/prisma.ts` · `src/components/ui/*` · `dashboard-actions.ts` · utilidades core de `src/lib/` · primitivas de animación compartidas.
- **Zonas de Franco — solo lectura, sin coordinación no se toca nada:** `src/lib/leados/` · `src/app/(protected)/setter/` · `admin/leados/` · `admin/leads/_actions/` · `src/auth.ts` · `src/lib/auth-cookies.ts` · `api/qa/login/route.ts` · modelos `OsLead*` / `OsLeadSetterMeta` · enum `ActivityChannel`. **Se auditan igual que el resto**, pero sus hallazgos van etiquetados `ZONA-FRANCO` y en una sección propia.
- **Protocolo SEC:** toda server action y toda route handler debe tomar la organización de la **sesión**, nunca de un parámetro de URL/body. Cualquier desvío es hallazgo de seguridad.
- **Nunca afirmes que algo funciona porque compila o porque el código "parece correcto".** Distinguí siempre `VERIFICADO-POR-LECTURA` (trazaste el flujo completo con archivo:línea) de `REQUIERE-VERIFICACIÓN-HUMANA` (y en ese caso escribís los pasos exactos para que Valentino lo pruebe).
- **"No existe X" exige prueba de búsqueda:** decís qué buscaste, con qué patrones y dónde. Un check de ausencia sin control positivo es *verde por vacío*.
- **Secrets:** si encontrás uno, reportás `ruta:línea` y tipo de credencial. **Jamás copiás el valor** en ningún archivo, log ni mensaje. Severidad CRÍTICA + recomendación de rotación.

---

## 3. Qué podés ejecutar y qué no

**Entorno:** Windows + PowerShell. Sin `&&`, sin heredoc, rutas con paréntesis entre comillas. **16 GB de RAM: un solo proceso pesado a la vez.**

### Permitido
- Git de solo lectura: `git log`, `git show <rama>:<ruta>`, `git diff`, `git ls-files`, `git ls-tree`, `git branch -a`, `git worktree list`, `git grep`, `git for-each-ref`.
- Git de escritura **solo** para esto: `git switch -c auditoria/renovacion-2026-10` (una vez, en F0), `git add <ruta-explícita>` archivo por archivo, `git commit`, `git push -u origin auditoria/renovacion-2026-10`.
- Typecheck **una vez** para baseline: `.\node_modules\.bin\tsc.cmd --noEmit` (salida a archivo). Nunca `npx tsc`.
- Lint **una vez** para baseline: `.\node_modules\.bin\eslint.cmd` con `--format json` a archivo.
- `npm outdated --json`, `npm ls --depth=0`, `npm audit --json` (**sin** `fix`).
- `npx prisma migrate status` — **una sola vez**, es lectura (Neon puede tardar 14–30 s en despertar; no es un error).
- `npx -y dependency-cruiser` y scripts propios de lectura para el Atlas (§6, F5).
- WebSearch/WebFetch **solo** para verificar vigencia de versiones, deprecaciones y guías oficiales de migración. Citás la fuente en el hallazgo.
- Escribir archivos **únicamente** dentro de `docs/auditoria-2026-10/` y `scripts/auditoria/`.

### Prohibido
- Editar cualquier archivo fuera de esas dos carpetas. Ni un typo, ni un import.
- `git add .` / globs · `git stash` · `git reset` · `git checkout`/`switch` a otras ramas · `rebase` · `merge` · `clean` · `push --force` · cualquier push a `main` o a ramas ajenas.
- Para leer otra rama: **siempre** `git show <rama>:<ruta>`, nunca cambiar de rama.
- `npm install` / `update` / `audit fix` · tocar `package.json` o el lockfile.
- `prisma migrate dev|deploy|reset`, `db push`, `db execute`, o cualquier escritura a la base (es Neon compartida con Franco).
- `npm run build` (OOM conocido) · `npm run dev` · automatización de navegador (Chrome DevTools MCP incluido). Esta auditoría se hace **leyendo código y midiendo con aritmética**.

---

## 4. Alcance

**Profundo (cada archivo se lee):** todo lo interno — auth de cliente y de admin, middleware/proxy, `(protected)/`, dashboard, admin y todas sus secciones, setter, chatbot (UI, API, prompts, proveedores de IA), server actions, route handlers, `src/lib/` (lectura), modelo de datos, migraciones, integraciones (Brevo, Sentry, Vertex AI, Anthropic SDK, Search Console, Netlify functions/crons), configuración (`next.config`, `netlify.toml`, `tsconfig`, eslint, env de ejemplo).

**Superficial (inventario + Atlas, sin auditoría línea a línea):** el sitio público y `src/app/v3/` — tiene su propio gate de 133 invariantes. Excepción: `rediseno/home` es **fuente** para el punto de Diseño (F3).

**Fuera:** `node_modules`, `.next`, artefactos generados, binarios, fuentes y assets (solo se cuentan).

**Ramas:** todas. Las ramas que no son `main` se inventarían por diff contra `main` y se leen con `git show`.

**Insumos opcionales:** si existe `docs/auditoria-2026-10/_insumos/` (registros de cambios exportados de Drive), leelo en F0 antes de planificar.

---

## 5. Entregables

Todo en `docs/auditoria-2026-10/`:

| Archivo | Contenido |
|---|---|
| `00-PLAN-Y-LOG.md` | **Fuente de verdad.** Plan, decisiones `[DECISIÓN]`, log de ciclos, estado por dominio, baseline (tsc/lint/audit). |
| `_cobertura.csv` | Ledger: `ruta,dominio,alcance,estado,ciclo,notas`. Estados: `pendiente` · `leído` · `superficial` · `excluido-generado`. |
| `01-INVENTARIO.md` | Qué hay: módulos, rutas, modelos, integraciones, ramas, scripts, tests, docs. |
| `02-PENDIENTE.md` | Qué falta por herramienta, con nivel de madurez (§5.2) y lo que la separa del siguiente. |
| `03-MEJORAS.md` | Seguridad · bugs latentes · tecnología vieja · rendimiento · deuda · calidad · observabilidad · accesibilidad. |
| `04-DISENO.md` | Puente entre el sistema de diseño de `rediseno/home` y las pantallas internas (F3). |
| `05-IDEAS.md` | Ideas nuevas factibles (F4). |
| `06-ATLAS/` | El mapa (F5). |
| `07-BACKLOG.md` | Tarjetas de sprint priorizadas (F6). |
| `08-VERIFICACION-HUMANA.md` | Checklist de lo que Valentino tiene que probar a mano, con pasos exactos. |
| `09-PARA-FRANCO.md` | Hallazgos `ZONA-FRANCO`, redactados para que él los pueda tomar sin contexto. |
| `RESUMEN.md` | Una página: estado general, top 10 riesgos, top 10 oportunidades, qué hacer primero. |

Salidas crudas (tsc, eslint, outdated, audit, depcruise) en `docs/auditoria-2026-10/_crudo/` — se commitean solo si pesan menos de 300 KB cada una; si no, se resumen y se anotan como locales.

### 5.1 Formato de hallazgo (obligatorio, sin excepciones)

```
### [ID] Título corto
- Dominio: D?  ·  Severidad: CRÍTICA | ALTA | MEDIA | BAJA  ·  Tipo: seguridad | bug | deuda | tech-vieja | perf | a11y | ux | faltante
- Confianza: VERIFICADO-POR-LECTURA | PROBABLE | HIPÓTESIS
- Evidencia: ruta:línea (y ruta:línea…) — fragmento mínimo, nunca un secret
- Impacto: qué le pasa a un cliente real o a develOP si no se arregla
- Propuesta: qué hacer (sin escribir el código)
- Esfuerzo: S (<2 h) | M (½–1 día) | L (varios días)  ·  Zona: libre | ZONA-FRANCO | FROZEN
- Relacionado: [IDs]
```

IDs: `SEC-`, `BUG-`, `TEC-`, `PERF-`, `DEU-`, `A11Y-`, `UX-`, `FAL-`, `DIS-`, `IDEA-`. Un hallazgo sin evidencia `ruta:línea` **no se escribe**. Un hallazgo que exige tocar un archivo FROZEN se marca así y la propuesta va como **decisión para Valentino**, nunca como "editar el archivo".

### 5.2 Escala de madurez (para `02-PENDIENTE.md`)

- **L0** no existe · **L1** esqueleto/maqueta · **L2** funciona en el camino feliz · **L3 listo para cliente** · **L4** pulido.
- **L3 exige los nueve:** permisos y aislamiento por tenant correctos · estados vacíos · estados de error con mensaje útil · estados de carga · validación de entrada en servidor · funciona en mobile (por lectura de layout) · errores capturados en Sentry · sin datos de mentira ni TODOs en el camino del cliente · el cliente puede completar la tarea sin ayuda de develOP.
- Para cada herramienta: nivel actual, cuáles de los nueve faltan, y la lista concreta de lo que la lleva a L3.

---

## 6. Fases

### F0 — Arranque y plan → **PARADA**
1. `git worktree list` · `git branch -a` · `git status`. Ubicá la raíz del repo y la de la app (`logic-core-v3/`). Si el árbol tiene cambios **fuera de** `docs/auditoria-2026-10/`, **detenete y reportá** (no stashees nada).
2. `git switch -c auditoria/renovacion-2026-10` desde `main` actualizado.
3. Leé: este prompt, `CLAUDE.md` si existe, `docs/` (índice; en especial `docs/rediseno/DIRECCION-ESCENA.md` §7 desde `rediseno/home`), `_insumos/` si existe, `package.json`, `schema.prisma`, el árbol de `src/app/`.
4. Generá `_cobertura.csv` con `git ls-files` sobre `main` clasificado por dominio y alcance. Contá archivos por dominio.
5. Escribí `00-PLAN-Y-LOG.md`: dominios con su conteo, orden de ataque y por qué, estrategia de subagentes, estimación de ciclos, riesgos de la corrida, y cualquier premisa de este prompt que el repo contradiga.
6. Commit (`PROMPT.md`, `00-PLAN-Y-LOG.md`, `_cobertura.csv`) archivo por archivo, push.
7. **PARADA.** Mostrá un resumen del plan en ≤25 líneas y esperá `Aceptar` o `Revisar…`.

### F1 — Inventario y baseline
- Corré **uno por vez**: tsc, eslint, `npm outdated`, `npm ls --depth=0`, `npm audit`, `prisma migrate status`. Volcá a `_crudo/` y resumí en el log. **Errores baseline conocidos a ignorar** (anotarlos, no reportarlos como hallazgo): `@googleapis/webmasters` faltante · `react-hooks/set-state-in-effect` en `PreloaderContext` · `searchconsole.ts:119`.
- Ramas: para cada una, último commit, autor, distancia a `main` (`ahead/behind`), archivos que solo existen ahí, y si parece viva, mergeada o abandonada.
- Escribí `01-INVENTARIO.md`.

### F2 — Ciclos de auditoría por dominio
Dominios:

| | Dominio | Qué mirar especialmente |
|---|---|---|
| D1 | Auth cliente + admin | Magic link (Brevo), sesión, roles, middleware/proxy, rutas protegidas sin guard, `api/qa/login` (que no quede expuesto en prod), expiración, cookies |
| D2 | Dashboard cliente multi-tenant | Aislamiento por tenant en **cada** lectura y escritura, IDOR, onboarding, estados L3 |
| D3 | Admin | Cada sección (operación, clientes, proyectos, leads, equipo, demos, inteligencia, configuración): qué hace, qué falta, permisos |
| D4 | Setter (`ZONA-FRANCO`) | Flujo completo, estados, integración con leados y admin, consistencia de datos |
| D5 | Chatbot centralizado | Proveedores (Vertex Gemini / Anthropic), streaming vs límite de 10 s de Netlify, aislamiento del conocimiento por tenant, prompt injection, rate limiting, costo por conversación, persistencia, fallbacks, versión de modelo |
| D6 | Datos | Modelos, índices faltantes, N+1, migraciones vs schema (drift), soft-deletes, cascadas peligrosas, cold start de Neon |
| D7 | Integraciones | Brevo, Sentry (`flush` en catch), Search Console, Vertex (credenciales vía `GOOGLE_VERTEX_CREDENTIALS_JSON`), crons, webhooks; restos de Resend |
| D8 | Plataforma | Next 16 (convenciones actuales, APIs deprecadas), React 19, Tailwind 4, NextAuth v5, Prisma, dependencias viejas o abandonadas, `maxDuration` inefectivo en Netlify free, bundle |
| D9 | Transversal | `any`, `router.push`, `framer-motion` directo, lógica duplicada, código muerto, exports sin uso, TODO/FIXME, a11y en pantallas internas, logs, tests existentes y cobertura real |

**Por cada dominio, el ciclo es:**
1. **Leer** todos los archivos `pendiente` del dominio (actualizás `_cobertura.csv`).
2. **Trazar** los flujos principales de punta a punta (UI → action/route → lib → DB) con `ruta:línea`.
3. **Escribir hallazgos** en `02`/`03` y casos de prueba manual en `08`.
4. **Cruzar:** buscá en el resto del repo cada patrón defectuoso encontrado (si un handler no valida tenant, revisá **todos** los handlers con el mismo patrón).
5. **Registrar el ciclo** en el log: archivos leídos, hallazgos nuevos por severidad, cobertura del dominio.
6. Commit de los archivos tocados, archivo por archivo.

**Subagentes:** usalos para leer en paralelo, **máximo 3 a la vez**. Inventario mecánico → `Explore`. Análisis de un dominio → `general-purpose` con este §2, §3 y §5.1 pegados en su prompt. **Los subagentes no escriben en `docs/`: te devuelven hallazgos y vos los verificás contra el código antes de volcarlos.** Un hallazgo de subagente que no reproducís leyendo el archivo se descarta o baja a `HIPÓTESIS`.

### F3 — Diseño (`04-DISENO.md`)
Fuente: rama `rediseno/home`, leída con `git show` — `src/app/theme-develop.css` (tokens), `src/app/v3/_lib/motion/`, `src/app/v3/_secciones/`, `docs/rediseno/DIRECCION-ESCENA.md`. Destino: todas las pantallas internas.
1. **Censo del destino:** qué tokens, tipografías, colores hardcodeados, radios, sombras, espaciados y librerías de componentes usa hoy cada pantalla interna. Incluí cuántos colores literales hay fuera de tokens.
2. **Tabla de transferencia** con tres columnas: *se lleva tal cual* (tokens, escala tipográfica, Chivo/Chivo Mono, foco visible, acentos por línea de servicio) · *se adapta* (motion: los patrones atados al scroll del home **no** sirven en un dashboard; proponé equivalentes de micro-interacción con `motion/react`) · *no se lleva* (escena 3D, preloader, coreografía de scroll).
3. **Ruta de implementación sin tocar `src/components/ui/*`** (está congelado): capa de tokens/variables CSS que lo re-tematice, wrappers, o lo que el código permita. Si la única ruta exige editar `ui/*`, va como decisión para Valentino.
4. **Decisiones abiertas, no tomadas por vos:** las decisiones cerradas del home (sin dark mode, CTA siempre tinta, paleta papel/tinta) **no se asumen** para el dashboard; listalas como preguntas con trade-off.
5. Priorizá por pantalla: impacto visual para el cliente vs esfuerzo.

### F4 — Ideas (`05-IDEAS.md`)
Entre 10 y 15, rankeadas. Cada una: problema del cliente PyME que resuelve · **qué ya existe en el repo que la habilita** (con rutas) · qué falta construir · esfuerzo · costo operativo contra los free tiers (Netlify 10 s, Neon, Vertex) · riesgo · si toca `ZONA-FRANCO` o FROZEN. **Nada que exija cambiar de stack.** Nada genérico tipo "agregar IA": cada idea se apoya en algo concreto que ya está.

### F5 — El Atlas (`06-ATLAS/`)
**Herramienta decidida:** Markdown + Mermaid (versionado en el repo, se ve en VS Code y GitHub, sin servicio externo) + **dependency-cruiser** vía `npx -y` para el grafo de imports (salida `mermaid`, sin tocar `package.json`) + un script propio para el diagrama de datos. **No uses generadores de Prisma que agreguen un bloque `generator` al schema: `schema.prisma` está congelado.** Para el ERD, script en `scripts/auditoria/` que lea el schema (p. ej. con `getDMMF` de `@prisma/internals` si ya está instalado, o parseo directo) y emita Mermaid.

Estructura:
- `README.md` — **la puerta de entrada:** "quiero hacer X → andá a tal tarjeta". Índice de todo.
- `arquitectura.md` — diagrama de alto nivel (clientes, admin, setter, chatbot, DB, integraciones externas) y cómo fluyen los datos.
- `rutas.md` — tabla de **cada** ruta: path · archivo · tipo (page / route handler / server action) · auth requerida · rol · scoping por tenant (sí/no/N.A. con evidencia).
- `datos.md` — ERD Mermaid + qué módulo lee/escribe cada modelo.
- `dependencias.md` — grafo por módulo (no por archivo; legible), con las zonas FROZEN y `ZONA-FRANCO` marcadas.
- `ramas.md` — mapa de ramas y worktrees: qué tiene cada una que `main` no, estado, recomendación (mergear / revisar / archivar) — **solo recomendación**.
- `modulos/<modulo>.md` — una ficha por módulo: propósito · archivos clave · depende de · lo usan · rama(s) donde vive · dueño (Valentino / Franco / FROZEN) · madurez L0–L4 · hallazgos vinculados · **"por dónde empezar si querés tocarlo"**.
- `regenerar.md` — comandos exactos (PowerShell) para regenerar los diagramas cuando el repo cambie.

Los scripts generadores van en `scripts/auditoria/` y tienen que ser re-ejecutables.

### F6 — Pasada adversarial y consolidación
1. **Auditoría ciega:** lanzá un subagente nuevo, **sin acceso a tus hallazgos**, con la consigna de encontrar problemas de seguridad y de aislamiento multi-tenant en D1, D2, D5. Compará: lo que encontró y vos no → hallazgo nuevo + anotá en el log por qué se te pasó.
2. **Verificación de los tuyos:** releé la evidencia de cada CRÍTICA y ALTA contra el código actual. Las que no se sostienen, se bajan o se borran con nota.
3. **Deduplicá** y enlazá relacionados.
4. **`07-BACKLOG.md`** — tarjetas de sprint, cada una lista para convertirse en prompt:
   ```
   ## [B-##] Título
   - Objetivo (una frase) · Hallazgos que cierra: [IDs]
   - Archivos a tocar · Archivos que NO se tocan
   - Zona: libre | ZONA-FRANCO | requiere decisión FROZEN
   - Tamaño: S/M/L · Riesgo · Prerrequisitos [B-##]
   - Modelo sugerido: Sonnet 5.5 (mecánico) | Opus 5.5 xhigh (complejo/visual)
   - Criterio de aceptación verificable
   ```
   Ordenadas en tres bloques: **Ahora** (seguridad crítica y bloqueantes de L3) · **Próximo** (lo que lleva herramientas a L3) · **Después** (mejoras, diseño, ideas). Agrupá las que conviene hacer juntas en un mismo worktree.
5. `RESUMEN.md` y `09-PARA-FRANCO.md`.

### F7 — Cierre
Releé todos los entregables de punta a punta buscando contradicciones entre ellos. Commit final, push. Mensaje final en el chat: ≤20 líneas — cobertura alcanzada, hallazgos por severidad, las 5 tarjetas de "Ahora", y cualquier dominio que no llegó a cobertura total con su razón.

---

## 7. El ciclo, el corte y el anti-loop

- **Un dominio se cierra** cuando: cobertura del dominio = 100% de su alcance en `_cobertura.csv` **y** un ciclo completo no produjo hallazgos nuevos de severidad MEDIA o más.
- **Máximo 4 ciclos por dominio.** Si al cuarto sigue apareciendo material, cerrás igual, anotás `[DOMINIO-ABIERTO]` con qué quedó sin agotar, y seguís.
- **Un mismo comando que falla 3 veces** se abandona, se anota y se sigue sin él.
- **Si un paso no converge en ~60 min,** commiteás lo que hay, anotás `[TIMEBOX]` y seguís con el siguiente.
- **La auditoría termina** cuando todos los dominios están cerrados (o `[DOMINIO-ABIERTO]` con razón), F3–F6 completas y cobertura global = 100% de lo marcado profundo.

---

## 8. Contexto y memoria de la corrida

- `00-PLAN-Y-LOG.md` se actualiza al final de **cada** ciclo, antes del commit. Si la sesión se compacta o se corta, ese archivo + `_cobertura.csv` tienen que alcanzar para retomar exactamente donde quedó.
- **Después de cada compactación:** releé `PROMPT.md` y `00-PLAN-Y-LOG.md`, buscá el último ciclo registrado y retomá desde ahí. No re-audites lo que el ledger marca `leído`.
- Logs del ciclo breves: qué se leyó, qué salió, qué sigue. El detalle va en los entregables, no en el log.

---

## 9. Bloqueos genuinos (los únicos que te frenan)

- El árbol de trabajo está sucio fuera de `docs/auditoria-2026-10/` al arrancar.
- Para continuar habría que ejecutar algo de la lista prohibida.
- Encontrás un secret **activo** expuesto en un archivo commiteado y público → lo registrás (sin el valor), commiteás, **y frenás** para que Valentino rote antes de seguir.

En cualquiera: log + commit de lo hecho + mensaje claro de qué necesitás.

---

## 10. Autorrevisión adversarial antes de cada commit

Antes de commitear un entregable, respondé en el log (una línea cada una):
1. ¿Hay algún hallazgo sin `ruta:línea`?
2. ¿Alguna afirmación de "funciona" o "no existe" sin la prueba que la sostiene?
3. ¿Algún valor de secret en el texto?
4. ¿Alguna propuesta que edite un archivo FROZEN o `ZONA-FRANCO` sin estar marcada como decisión/coordinación?
5. ¿Toqué algún archivo fuera de `docs/auditoria-2026-10/` y `scripts/auditoria/`? (`git status` lo prueba)

Si alguna da sí, se corrige antes del commit.
