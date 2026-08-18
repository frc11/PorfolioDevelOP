# A3 — Estado de ECC, skills y comandos

**Fecha:** 2026-08-13 · **Modo:** read-only, nada instalado ni modificado

---

## 1. Inventario completo con ubicaciones

### 1.1 Nivel repo — `PorfolioDevelOP/.claude/`

| Ruta | Contenido |
|---|---|
| `.claude/agents/visual-qa.md` | 1 subagente propio (verificación visual post-sprint) |
| `.claude/skills/` | **9 skills** — 8 de `emilkowalski/skills` + `impeccable` |
| `.claude/launch.json` | 3 configs de preview: `next-dev` (:3000), `next-dev-qa` (:3002), `next-prod-qa` (:3001) |
| `.claude/settings.local.json` | **Hooks** — ver §1.4 |
| `.claude/worktrees/` | 3 worktrees (`funny-williams-001d41`, `priceless-nobel-ed8d02`, `sad-burnell-2f5e2d`), cada uno con su `CLAUDE.md` |
| `skills-lock.json` (raíz del repo) | lockfile de 8 skills de `emilkowalski/skills` |

Skills del repo: `animation-vocabulary`, `apple-design`, `emil-design-eng`, `find-animation-opportunities`, `impeccable`, `improve-animations`, `pick-ui-library`, `prototype`, `review-animations`.

### 1.2 Nivel repo — `logic-core-v3/.claude/`

| Ruta | Contenido |
|---|---|
| `.claude/launch.json` | idem raíz |
| `.claude/settings.local.json` | un solo permiso: PowerShell para barrer el puerto 3001 |

Sin agentes, sin skills, sin hooks propios.

### 1.3 Nivel global — `~/.claude/`

| Ruta | Contenido |
|---|---|
| `~/.claude/settings.json` | 126 entradas en `permissions.allow`, `additionalDirectories` (Desktop, `\tmp`, `\mnt\user-data`), `effortLevel: "high"`, `autoUpdatesChannel: "latest"`, `skipWorkflowUsageWarning: true`. **Sin `hooks`. Sin `env`. Sin `mcpServers`.** |
| `~/.claude/agents/` | **63 subagentes** |
| `~/.claude/commands/` | **79 slash-commands** |
| `~/.claude/skills/ecc/` | **21 skills ECC** |
| `~/.claude/rules/ecc/` | rulesets por lenguaje (`common/`, `react/`, `typescript/`, `web/`, `python/`, `golang/`, `arkts/`, `zh/`, …) — se inyectan como instrucciones globales |
| `~/.claude/ecc/install-state.json` | manifiesto de instalación ECC |
| `~/.claude/mcp-configs/mcp-servers.json` | **catálogo/plantilla** de 28 servidores MCP con placeholders `YOUR_*_HERE`. No es configuración activa |
| `~/.claude/scripts/` | `auto-update.js`, `setup-package-manager.js` |
| `~/.claude/plugins/marketplaces/claude-plugins-official/` | marketplace oficial (incluye `skill-creator`) |
| `~/.claude/.agents/skills/` | **33 skills** del repo fuente ECC, staged pero NO instaladas |
| `~/.claude/.agents/plugins/marketplace.json` | marketplace local `ecc` v2.0.0-rc.1, `installation: AVAILABLE` |
| `~/.claude/AGENTS.md`, `README.md`, `PLUGIN_SCHEMA_NOTES.md`, `marketplace.json`, `plugin.json` | docs del harness |

### 1.4 Hooks — dónde están y qué hacen

**Solo hay hooks en un lugar: `PorfolioDevelOP/.claude/settings.local.json`.**

| Evento | Matcher | Comando |
|---|---|---|
| `PostToolUse` | `Edit|Write|MultiEdit` | `node "${CLAUDE_PROJECT_DIR}/.claude/skills/impeccable/scripts/hook.mjs"` — timeout 5s, guardado con `[ ! -f … ] ||` |
| `Stop` | (todos) | mismo script — timeout 30s |

**Estado: activos.** `.claude/skills/impeccable/scripts/hook.mjs` **existe** (junto a `hook-admin.mjs`, `hook-before-edit.mjs`, `hook-lib.mjs`, y ~35 scripts más del paquete Impeccable v4.0.4). El guard `[ ! -f … ] ||` es una red de seguridad para checkouts donde la skill no esté, no un síntoma de que falte.

**Dos observaciones:**
- Los hooks corren **sintaxis POSIX** (`[ ! -f … ] || node …`). El shell primario de este entorno es PowerShell; el harness los ejecuta con `sh`, pero es una dependencia implícita a tener presente.
- El `Stop` hook con timeout 30s dispara un "deep pass" de diseño al final de **cada** sesión de este repo, incluidas las que no tocan UI (esta auditoría, por ejemplo).

### 1.5 MCP servers

- `~/.claude.json` → `mcpServers` global: **vacío** (`[]`).
- Los 6 registros del proyecto en `~/.claude.json` (`C:/Users/…`, `C:\Users\…`, `c:/Users/…` y los 3 worktrees) tienen `mcpServers: []`, `enabledMcpjsonServers: []`, `enabledPlugins: null`.
- No hay `.mcp.json` en el repo.
- `~/.claude/mcp-configs/mcp-servers.json` es un catálogo de referencia con 28 entradas (jira, github, firecrawl, supabase, memory, context7, playwright, exa, vercel, cloudflare×4, etc.), todas con placeholders. Su propio `_comments.usage` dice: *"Copy the servers you need to your `~/.claude.json` mcpServers section"*.

**Conclusión:** no hay ningún MCP configurado a nivel repo ni a nivel usuario. Los servidores MCP disponibles en sesión vienen de la aplicación, no de esta configuración.

---

## 2. Estado de ECC

### 2.1 Instalación

De `~/.claude/ecc/install-state.json`:

```
schemaVersion : ecc.install.v1
installedAt   : 2026-06-17T15:09:06Z
target        : claude-home  (C:\Users\franc\.claude)
profile       : minimal
repoVersion   : 2.0.0-rc.1
repoCommit    : 64cd1ba248e77e377e76f70fc4e6434bfdddd511
sourcePath    : C:\Users\franc\Desktop\ECC\everything-claude-code
```

Módulos seleccionados: `rules-core`, `agents-core`, `commands-core`, `platform-configs`, `workflow-quality`. Ninguno saltado.

**371 operaciones de copia**, por módulo: `agents-core` 133 · `rules-core` 115 · `commands-core` 79 · `workflow-quality` 37 · `platform-configs` 7.
Por destino: `skills\` 105 · `rules\` 116 · `commands\` 79 · `scripts\` 10.

**Nota:** el perfil se pidió `minimal` con `modules: []`, y aun así el resolver seleccionó 5 módulos y copió 105 archivos hacia `skills/` — pese a que ningún módulo se llama "skills". Las 21 skills de `~/.claude/skills/ecc/` entraron por `workflow-quality` / `agents-core`, no por una selección explícita.

### 2.2 Comandos ECC — verificación uno por uno

`CLAUDE.md:121-126` promete 6 comandos del ciclo de calidad. **Los 6 existen:**

| Comando | Archivo | Estado |
|---|---|---|
| `/harness-audit` | `~/.claude/commands/harness-audit.md` | ✅ existe |
| `/quality-gate` | `~/.claude/commands/quality-gate.md` | ✅ existe |
| `/code-review` | `~/.claude/commands/code-review.md` | ✅ existe |
| `/security-scan` | `~/.claude/commands/security-scan.md` | ✅ existe |
| `/build-fix` | `~/.claude/commands/build-fix.md` | ✅ existe |
| `/test-coverage` | `~/.claude/commands/test-coverage.md` | ✅ existe |

**Ningún comando referenciado por la documentación del repo falta.** El riesgo conocido no se materializó.

### 2.3 Los otros 73 comandos instalados

`aside`, `auto-update`, `checkpoint`, `cost-report`, `cpp-{build,review,test}`, `ecc-guide`, `evolve`, `fastapi-review`, `feature-dev`, `flutter-{build,review,test}`, `gan-{build,design}`, `go-{build,review,test}`, `gradle-build`, `hookify{,-configure,-help,-list}`, `instinct-{export,import,status}`, `jira`, `kotlin-{build,review,test}`, `learn`, `learn-eval`, `loop-{start,status}`, `marketing-campaign`, `model-route`, `multi-{backend,execute,frontend,plan,workflow}`, `plan`, `plan-prd`, `pm2`, `pr`, `project-init`, `projects`, `promote`, `prp-{commit,implement,plan,pr,prd}`, `prune`, `python-review`, `react-{build,review,test}`, `refactor-clean`, `resume-session`, `review-pr`, `rust-{build,review,test}`, `santa-loop`, `save-session`, `sessions`, `setup-pm`, `skill-create`, `skill-health`, `update-codemaps`, `update-docs`.

De estos, los relevantes para el stack del repo (TS/React/Next): `/react-review`, `/react-build`, `/react-test`, `/python-review` (no aplica), `/refactor-clean`, `/update-docs`, `/update-codemaps`, `/skill-create`, `/skill-health`, `/plan`, `/pr`.

### 2.4 Skills ECC instaladas (21)

`agent-introspection-debugging`, `agent-sort`, `ai-regression-testing`, `code-tour`, `configure-ecc`, `continuous-learning`, `continuous-learning-v2`, `council`, `e2e-testing`, `error-handling`, `eval-harness`, `hookify-rules`, `iterative-retrieval`, `plankton-code-quality`, `production-audit`, `skill-scout`, `skill-stocktake`, `strategic-compact`, `tdd-workflow`, `verification-loop`, `windows-desktop-e2e`.

Las 21 tienen `SKILL.md`. **17 de 21** llevan `origin: ECC` en el frontmatter; 4 no.

### 2.5 Catálogo disponible pero NO instalado

`~/.claude/.agents/skills/` tiene 33 skills staged. Sin instalar (entre otras): `api-design`, `backend-patterns`, `coding-standards`, `deep-research`, `documentation-lookup`, `frontend-patterns`, `mcp-server-patterns`, `nextjs-turbopack`, `security-review`, `everything-claude-code`, `exa-search`, `product-capability`.

---

## 3. `CLAUDE.md`: contenido, largo y la convención "apuntar a `WF/`"

### 3.1 Qué contiene

`PorfolioDevelOP/CLAUDE.md` — **196 líneas**, 10.059 bytes. Doce secciones:

1. Non-negotiable rules · 2. Quality baseline · 3. Architecture before code (anti-vibecode) · 4. Security · 5. Performance · 6. Stack conventions · 7. Auth and multi-tenancy · 8. Workflow (WF + ECC) · 9. Sprint protocol · 10. Subagentes · 11. Frozen files · 12. Lessons learned.

Documentos hermanos en la raíz: `DESIGN.md` (300 líneas), `PRODUCT.md` (87), y `logic-core-v3/AGENTS.md` (186).
Los 3 worktrees tienen cada uno su copia de `CLAUDE.md`.

### 3.2 Sobre `WF/`

**No existe ninguna carpeta `WF/` en el repo.** `find . -maxdepth 3 -type d -iname "WF*"` → vacío.

`CLAUDE.md` menciona "WF" tres veces, todas en `§Workflow (WF + ECC)` (`:115`, `:117`, `:119`), y siempre como **nombre de un método**, no como ruta a un directorio:

> `:117` — "Este repo opera bajo el **método WF de develOP** con el **harness ECC** (instalado global, perfil minimal)."
> `:119` — "**Método WF.** Planificación con ritual antes de tocar código… Detalle operativo del sprint abajo en **Sprint protocol**."

**Veredicto sobre la convención declarada:** `CLAUDE.md` **no apunta a `WF/`** — porque `WF/` no existe. Lo que sí hace es **describir el método inline** (`:119`) y **remitir a otro archivo del repo** para las convenciones de app:

> `:130` — "las convenciones de app detalladas en **`logic-core-v3/AGENTS.md`**"

Es decir: la convención de "apuntar en vez de copiar" **se cumple parcialmente** — hay un puntero real a `AGENTS.md`, pero el método WF está escrito adentro de `CLAUDE.md`, no referenciado. Y el archivo al que apunta (`AGENTS.md`) tiene contenido desactualizado y contradictorio (ver A1 §7, ítems 3-5).

---

## 4. Formato correcto de un `SKILL.md` — verificado, no recordado

### 4.1 Fuente de verdad

`~/.claude/plugins/marketplaces/claude-plugins-official/plugins/skill-creator/skills/skill-creator/scripts/quick_validate.py` — el validador oficial. Estas son sus reglas, tal cual las aplica:

**Estructura del archivo**
- Debe llamarse `SKILL.md` y estar en la raíz del directorio de la skill.
- Debe **empezar** con `---` (frontmatter YAML delimitado por `---` … `---`).
- El frontmatter debe parsear como diccionario YAML.

**Propiedades permitidas** (cualquier otra clave hace fallar la validación):
```
name  ·  description  ·  license  ·  allowed-tools  ·  metadata  ·  compatibility
```

**Obligatorias:** `name`, `description`.

**Reglas de `name`:**
- string, kebab-case estricto: `^[a-z0-9-]+$`
- no puede empezar ni terminar con `-`, ni tener `--`
- máximo **64** caracteres

**Reglas de `description`:**
- string
- **prohibidos los signos `<` y `>`**
- máximo **1024** caracteres

**Reglas de `compatibility`** (opcional): string, máximo 500 caracteres.

### 4.2 Cómo se declara la descripción que dispara la carga

De `skill-creator/SKILL.md:67`, textual:

> **description**: When to trigger, what it does. This is the primary triggering mechanism — include both what the skill does AND specific contexts for when to use it. **All "when to use" info goes here, not in the body.** … Claude has a tendency to "undertrigger" skills. To combat this, make the skill descriptions a little bit "pushy".

Ejemplo que da el propio documento: en vez de *"How to build a simple fast dashboard…"*, escribir *"How to build a simple fast dashboard… Make sure to use this skill whenever the user mentions dashboards, data visualization, internal metrics, or wants to display any kind of company data, even if they don't explicitly ask for a 'dashboard.'"*

### 4.3 Anatomía del directorio (`skill-creator/SKILL.md:76-86`)

```
skill-name/
├── SKILL.md              (obligatorio)
│   ├── frontmatter YAML  (name, description obligatorias)
│   └── instrucciones markdown
└── recursos opcionales
    ├── scripts/          código ejecutable para tareas deterministas
    ├── references/       docs que se cargan al contexto cuando hacen falta
    └── assets/           archivos usados en el output (plantillas, iconos, fuentes)
```

**Carga en tres niveles (progressive disclosure):**
1. **Metadata** (`name` + `description`) — siempre en contexto, ~100 palabras
2. **Cuerpo de `SKILL.md`** — entra cuando la skill dispara. Ideal **< 500 líneas**
3. **Recursos bundleados** — bajo demanda, sin límite. Los scripts pueden ejecutarse sin cargarse

Si el cuerpo se acerca a 500 líneas: agregar una capa de jerarquía y punteros claros a `references/`. Para archivos de referencia > 300 líneas, incluir índice.

### 4.4 Ejemplo verificado (mínimo válido)

```markdown
---
name: cierre-de-sprint
description: Ejecuta el protocolo de cierre de sprint de develOP. Usar SIEMPRE que el usuario diga que terminó un sprint, pida cerrar trabajo, mencione "post-sprint", "verificación", "listo para commitear", o pregunte qué falta antes de dar un cambio por terminado — aunque no nombre la palabra "sprint".
---

# Cierre de sprint

## Cuándo aplica
...

## Pasos
1. ...
```

### 4.5 Nota importante: dos validadores distintos

El validador oficial de empaquetado rechaza claves fuera de las 6 permitidas. Pero **Claude Code acepta claves adicionales propias**, y hay ejemplos vivos en este mismo repo:

`.claude/skills/impeccable/SKILL.md:1-12` usa `version`, `user-invocable`, `argument-hint` y `allowed-tools` con sintaxis de lista:

```yaml
name: impeccable
description: …
version: 4.0.4
user-invocable: true
argument-hint: "[shape · audit|critique · …] [target]"
license: Apache 2.0
allowed-tools:
  - Bash(npx impeccable *)
  - Bash(node .claude/skills/impeccable/scripts/*)
```

Y `.claude/skills/prototype/SKILL.md:4` usa `disable-model-invocation: true` (skill que solo corre si se la invoca explícitamente).

**En la práctica:** para una skill que solo va a vivir en `~/.claude/skills/` o `.claude/skills/` del repo, esas claves extra funcionan. Si alguna vez se empaqueta para distribuir, `quick_validate.py` las rechazará.

### 4.6 Skills de referencia por formato

| Skill | Ruta | Qué mirar |
|---|---|---|
| `tdd-workflow` | `~/.claude/skills/ecc/tdd-workflow/SKILL.md` | frontmatter ECC mínimo (`name`, `description`, `origin`); cuerpo con "When to Activate" |
| `apple-design` | `.claude/skills/apple-design/SKILL.md` | frontmatter de 2 campos, cuerpo largo de conocimiento |
| `prototype` | `.claude/skills/prototype/SKILL.md` | `disable-model-invocation`; postura operativa explícita |
| `impeccable` | `.claude/skills/impeccable/SKILL.md` | el más completo: `allowed-tools`, `argument-hint`, `scripts/` + `reference/` |

---

## 5. Discrepancias documentación vs. realidad instalada

| # | Afirmación | Realidad |
|---|---|---|
| 1 | `CLAUDE.md:121-126` — 6 comandos ECC del ciclo de calidad | **Correcto.** Los 6 existen en `~/.claude/commands/` |
| 2 | `CLAUDE.md:117` — "harness ECC (instalado global, perfil minimal)" | **Correcto en la ubicación, matizable en el perfil.** `target: claude-home`, `profile: minimal` — pero el resolver activó 5 módulos y copió 371 archivos, incluyendo 105 hacia `skills/` |
| 3 | Convención declarada: `CLAUDE.md` apunta a `WF/` en vez de copiar contenido | **`WF/` no existe.** El método WF está escrito inline en `CLAUDE.md:119`. Sí hay un puntero real a `logic-core-v3/AGENTS.md` (`:130`) |
| 4 | `.claude/settings.local.json` — 2 hooks del detector Impeccable | **Activos y funcionales.** `hook.mjs` existe. Sin discrepancia; se anota que el `Stop` hook corre un deep pass de 30s en toda sesión del repo, toque UI o no |
| 5 | `skills-lock.json` — 8 skills | **`.claude/skills/` tiene 9 directorios.** `impeccable` está instalada pero **no** figura en el lockfile |
| 6 | `CLAUDE.md:129` — "Los comandos se detectan al iniciar sesión. Tras instalar… abrir una sesión nueva" | Consistente con lo observado; los 79 comandos globales están disponibles |
| 7 | `CLAUDE.md:153-161` §Subagentes — "usar el subagente built-in `Explore`", "despachar el subagente `visual-qa`", "cuando exista el subagente `regression-runner`" | `visual-qa` existe (`.claude/agents/visual-qa.md`). **`regression-runner` no existe** — el propio `CLAUDE.md` lo marca como condicional, así que no es una promesa rota |
| 8 | ECC `repoVersion: 2.0.0-rc.1`, instalado 2026-06-17 | La fuente (`C:\Users\franc\Desktop\ECC\everything-claude-code`) sigue existiendo, pero **no se verificó si avanzó desde el commit `64cd1ba`** — la instalación no se re-sincronizó en ~2 meses |
| 9 | `~/.claude/mcp-configs/mcp-servers.json` describe 28 servidores MCP | **Ninguno está activo.** Es una plantilla; `~/.claude.json` tiene `mcpServers: []` a nivel global y en los 6 registros del proyecto |
| 10 | `~/.claude/settings.json` | **Sin `hooks`, sin `env`, sin `mcpServers`.** Todo el harness automático del repo depende del único `settings.local.json` de la raíz — que hoy no ejecuta nada (ver #4) |

---

## 6. Lo que hace falta saber para escribir la primera skill

1. **Ubicación:** `PorfolioDevelOP/.claude/skills/<nombre>/SKILL.md` (por-repo, versionable) o `~/.claude/skills/<nombre>/SKILL.md` (global, todos los proyectos). El repo ya tiene 9 skills en `.claude/skills/`, así que el patrón está establecido.
2. **Frontmatter mínimo válido:** `name` (kebab-case, ≤64) + `description` (≤1024, sin `<` ni `>`). Nada más es obligatorio.
3. **La `description` es el único disparador.** Todo el "cuándo usar esto" va ahí, no en el cuerpo, y conviene que sea insistente.
4. **Cuerpo bajo 500 líneas.** Lo que exceda va a `references/`, con puntero explícito desde `SKILL.md`.
5. **`scripts/`** para lo determinista y repetible (se ejecuta sin cargarse al contexto). **`assets/`** para plantillas.
6. **Si la skill no debe auto-dispararse:** `disable-model-invocation: true` (precedente vivo: `.claude/skills/prototype/SKILL.md:4`).
7. **`/skill-create` y `/skill-health` ya están instalados** como slash-commands globales, y el `skill-creator` oficial está en el marketplace local.
