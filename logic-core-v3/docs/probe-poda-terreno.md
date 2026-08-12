# PROBE · Terreno para la poda del Panel del Setter (LeadOS)

**Corrida de relevamiento — solo lectura.** No se planifica, no se propone, no se diseña. Lo que se le ocurrió al relevador va al bloque final, aparte.

---

## 1 · Encabezado de terreno

| Campo | Valor |
|---|---|
| Fecha de la corrida | 2026-07-31, 01:45 → 02:40 (-03:00) |
| Repo | `C:\Users\franc\Desktop\PorfolioDevelOP` (raíz git) · app en `logic-core-v3/` |
| Rama checkeada | `redesign/home` |
| Upstream | `origin/redesign/home` — **en sync** (0 ahead / 0 behind) |
| HEAD **al arrancar** | `e06e3c4697427cce1cc7b4a6a28447d0fafc0c1a` |
| HEAD **al cerrar** | `11eee1b49d774b885a50f54ea0b52beb043ea772` |
| Working tree | **limpio** al arrancar, limpio al cerrar, limpio en cada chequeo intermedio |

### FRENO evaluado: NO se activó, pero el terreno cambió a mitad de corrida

La condición de freno del encargo era *"working tree con cambios sin commitear que no sean tuyos"*. **Nunca se cumplió**: `git status --porcelain` salió vacío en todos los chequeos. R4 era ejecutable.

**Pero apareció otra cosa que el encargo no anticipó — VISTO:** el HEAD se movió durante la corrida. Otra sesión commiteó en paralelo sobre este mismo checkout.

```
$ git log --format='%H%n  autor: %an <%ae>%n  fecha: %ci%n  msg:   %s' e06e3c4..HEAD
11eee1b49d774b885a50f54ea0b52beb043ea772
  autor: Franco <francopizzi2003@gmail.com>
  fecha: 2026-07-31 01:54:37 -0300
  msg:   docs: probe de hero y navegación para B2

$ git diff --stat e06e3c4..HEAD
 logic-core-v3/docs/probe-b2-hero-nav.md | 555 ++++++++++++++++++++++++++++++++
 1 file changed, 555 insertions(+)
```

**Impacto sobre este PROBE: nulo en cuanto a contenido.** Es un commit de un solo archivo de docs, cero código. Todo lo relevado sigue vigente.

**Impacto sobre el protocolo de R4: decisivo.** Ver §5.

Evidencia corroborante de la concurrencia (VISTO):
- `git worktree list` devuelve **8 worktrees** sobre el mismo `.git`, tres de ellos de sesiones de agente vivas: `.claude/worktrees/priceless-nobel-ed8d02`, `.../sad-burnell-2f5e2d`, `.../funny-williams-001d41`.
- El directorio `.next` fue **vaciado a las 01:53** durante la corrida: a las 01:47 tenía `app-path-routes-manifest.json`, `routes-manifest.json` y `BUILD_ID` de un build de producción; a las 01:53 quedaban solo `cache/ dev/ diagnostics/ types/ lock package.json trace` (observado por el relevador de R9).

### Nota de ubicación del reporte

El encargo pedía `docs/probe-poda-terreno.md`. **No existe `docs/` en la raíz del repo** (`ls docs/` → sin resultados). Todos los probes previos y la bitácora viven en `logic-core-v3/docs/` (`probe-monolito-censo.md`, `probe-motion-sitio.md`, `bitacora-beta-3.md`). Este archivo se escribió ahí.

### Estado de cierre de los diez ítems

| Ítem | Estado | Qué quedó afuera |
|---|---|---|
| R1 Rama y divergencia | ✅ cerrado | refs de `origin/*` son una foto del 2026-07-30 19:07 (no se hizo `fetch`) |
| R2 Suites hoy | ✅ cerrado | — |
| R3 Regla anti-link | ✅ cerrado | no se verificó en runtime (sin browser) |
| R4 Achicar `FASE_IDS` | ✅ cerrado | protocolo cumplido con **desvío documentado** (§5) |
| R5 Leads con progreso | 🟡 parcial | el número de **producción** no se pudo medir |
| R6 Contador anti-spam IG | ✅ cerrado | — |
| R7 Subida de archivos | ✅ cerrado | — |
| R8 Bypass de auth de QA | 🟡 parcial | el panel de env vars de Netlify/Vercel está fuera del repo |
| R9 Censo de pantallas | ✅ cerrado | el "inventario de 16 pantallas" del brief **no existe en el repo** |
| R10 Drift de Prisma | ✅ cerrado | no se probó el replay de las 86 migraciones (escribe) |

**8 cerrados · 2 parciales · 0 sin relevar.** Los dos parciales lo son por falta de acceso externo al repo, no por fallo de la corrida.

### Método

Nueve ítems se repartieron en agentes paralelos read-only; los tres de mayor costo-si-me-equivoco (R3, R8, R9) pasaron por un verificador adversarial independiente cuya consigna era **refutar**, no confirmar. Los tres volvieron **CONFIRMADO_CON_CORRECCIONES**: conclusión central en pie, con errores puntuales de evidencia que están plegados abajo y marcados. R4 lo corrió el agente padre en serie, después de que todo lo demás terminara.

---

## 2 · R1 · Rama y divergencia

**Qué se preguntó.** Un recon anterior leyó `redesign/home`; los sprints de LeadOS reportaron aterrizar en `main`. ¿Siguen valiendo los veredictos de ese recon sobre la rama donde se va a trabajar?

### VISTO

**No divergen. `redesign/home` contiene entera a `main`.**

```
$ git rev-list --count main..redesign/home   → 16
$ git rev-list --count redesign/home..main   → 0
$ git merge-base main redesign/home          → 4dadd274681b5e38455963318af2f6a94277b59f
$ git rev-parse main                         → 4dadd274681b5e38455963318af2f6a94277b59f
```

El merge-base **es** `main`: fast-forward estricto, no divergencia.

**Contra `origin/main` sí hay divergencia técnica, y es de un solo commit:**

```
$ git rev-list --count origin/main..redesign/home → 16
$ git rev-list --count redesign/home..origin/main → 1
$ git log --oneline main..origin/main
d5cd4d7 fix(chatbot): reloj de pared por step y persistencia del turno desde el abort
```

`d5cd4d7` (Valentino Olmedo, 2026-07-30 18:21) toca 5 archivos, todos bajo `src/modules/chatbot` + `docs/bitacora-roadmap.md`. **Cero superposición con LeadOS.**

**Las cuatro zonas sensibles: intactas.** `git diff --name-only main...redesign/home` → 79 archivos. Filtrado:

| Zona | Patrón | Resultado |
|---|---|---|
| Shell de construcción / fases | `construccion\|fase\|manual\|wizard` | 1 hit, y es doc: `docs/SPRINT-M1-MANUAL-v2.md` |
| Gates del dossier | `dossier\|gate\|self-?check` | sin coincidencias |
| Schema de Prisma | `prisma` | sin coincidencias |
| Outreach | `outreach` | sin coincidencias |

Refuerzo por contenido (8.484 líneas de diff volcadas y grepeadas): `FASE_IDS` 0 · `dossier` 0 · `outreach` 0 · `self-check` 0 · `schema.prisma` 0.

Refuerzo definitivo — **diff de 2 puntos** (estado a estado) restringido a las rutas de LeadOS:

```
$ git diff --stat main redesign/home -- \
    'logic-core-v3/src/app/(protected)/setter' \
    'logic-core-v3/src/app/(protected)/admin/leados' \
    'logic-core-v3/src/lib/leados' \
    'logic-core-v3/prisma'
(salida vacía)

$ git diff --stat origin/main redesign/home -- <mismas rutas>
(salida vacía)
```

Los árboles de LeadOS en `main`, `origin/main` y `redesign/home` son **byte a byte idénticos**.

Lo que sí tocan los 16 commits (+5.189/−1.023): `CLAUDE.md`, 6 docs nuevos, `globals.css`, `layout.tsx`, `robots.ts`, `sitemap.ts`, todo `src/app/styleguide/**` y `src/components/design-system/**` (nuevos), las 4 landings, `Hero.tsx`+`HeroCanvas.tsx`, `Button.tsx`, `MarketingIntro.tsx`. **Todo sitio público / design system.**

**Ramas relevantes para LeadOS (VISTO, `git branch -a -vv`):**

| Rama | Upstream | Estado |
|---|---|---|
| `redesign/home` | `origin/redesign/home` | en sync — **la que se trabaja** |
| `main` | `origin/main` | behind 1 (`d5cd4d7`) |
| `leados/b8a-hardening`, `leados/b8a-ii` | solo local | ancestros de `main`, ya integrados |
| `leados/b8a-iii` | solo local | ahead 3 / behind 714 — **nunca integrado** |
| `chore/gs-aislamiento` (GS.1) | `origin/main` | ahead 2 / behind 83 — **sin mergear** |

### VEREDICTO: SÍ, siguen valiendo

Sobre el perímetro LeadOS/setter/Prisma/outreach, que es lo que se preguntó.

**Matiz, no invalidación (INFERIDO):** si el recon anterior también cubrió el *sitio público* o `CLAUDE.md`, esa parte caducó — `redesign/home` reescribió esas superficies y corrigió la tabla de accent colors de `CLAUDE.md`.

### No se pudo establecer

- **Si `origin/main` avanzó en las últimas ~30 h.** `.git/FETCH_HEAD` está fechado **2026-07-30 19:07:51 -0300**. No se corrió `git fetch` porque escribe refs. Toda afirmación sobre `origin/*` es válida a esa foto.
- **Si el recon anterior cubría más que LeadOS.** No se tuvo acceso a ese documento.

---

## 3 · R2 · Estado real de las suites, hoy

**Qué se preguntó.** ¿El punto de partida de la poda es verde o ya viene con deuda?

### VISTO

Todo con `cd` explícito a `logic-core-v3` en la misma invocación, salida a archivo (no a pipe), exit code leído del proceso. Puertos 3000/3001/3002 verificados libres antes de arrancar.

| Suite | Comando exacto | Esperado | Real | Exit |
|---|---|---|---|---|
| TypeScript | `npx tsc --noEmit` | 0 errores | **0 errores** (salida de 0 bytes) | `0` |
| Invariantes | `npm run check:invariants` | 17 | **17/17** | `0` |
| Motor | `npm run test:leados` | 25 | **25/25** (37.4 s) | `0` |
| E2E del panel | `npm run test:setter` | 60 | **60/60** (3.4 min) | `0` |

**Las cuatro suites verdes. Cero deuda. El punto de partida de la poda está limpio.**

**Identificación de las suites (era parte del ítem):**

- **Invariantes = `check:invariants`** (`package.json:18`), cadena de exactamente 17 sub-scripts con `&&`. Exit 0 prueba que los 17 corrieron y pasaron; corroborado por conteo directo de 17 líneas `✓ invariante … OK`.
- **Motor = `npm run test:leados`** (`package.json:83`), no los scripts del chatbot. Se descartó por conteo, no por intuición: los `test:ev*`/`test:infra*`/`test:cost*` del módulo chatbot son **19 scripts / 20 archivos**, ni 19 ni 20 es 25; no existe script agregador que los corra juntos. `--list` sobre `playwright.leados.config.ts` → `Total: 25 tests in 6 files`. Corroborado documentalmente: `docs/bitacora-beta-3.md:1933` registra el cierre del bloque anterior como `tsc exit 0 · check:invariants 17/17 · test:leados 25/25 · test:setter 60/60` — de esa línea salen los tres números esperados.
- **E2E del panel = `npm run test:setter`** (`package.json:82`). `--list` → `Total: 60 tests in 14 files`.

**Los conteos no están inflados por skips (VISTO):** `grep -rnE "test\.(skip|fixme|only)\(|describe\.(skip|only)\(" tests/setter tests/leados --include=*.ts` → **cero coincidencias**.

**La DB sobre la que corren está al día (VISTO):** `npx prisma migrate status` → exit `0`, `86 migrations found`, `Database schema is up to date!`.

### El cierre de `test:setter`

El relevador paralelo cortó con la suite todavía corriendo (12/12 ok observados, 0 fallos). **El agente padre la re-corrió completa** para cerrar el ítem, con puertos 3000/3001/3002 verificados libres y cero procesos `node` vivos de antemano (para descartar el reuse de un build viejo — ver hallazgo 30):

```
$ cd logic-core-v3 && npx playwright test --config=playwright.setter.config.ts --reporter=list \
    > r2-setter-full.txt 2>&1; echo "EXIT_SETTER=$?" >> r2-setter-full.txt

Running 60 tests using 1 worker
  60 passed (3.4m)
EXIT_SETTER=0
```

Conteo directo sobre la salida: `ok: 60 · x: 0`. **Cero fallos, cero flaky, cero skipped.** Este `webServer` corre `npm run start:qa` = `npm run build && next start -p 3001`, así que el resultado incluye un `next build` de producción exitoso.

### INFERIDO

- El punto de partida de la poda **es verde y no trae deuda**: las cuatro suites cerraron en el número exacto que la bitácora registró en el último cierre (`docs/bitacora-beta-3.md:1933`). *Esto es VISTO, no inferido — la parte inferida es que ese número siga valiendo mañana.*
- El `check:invariants` encadenado con `&&` **tapa el detalle cuando falla**: frena en el primero. Acá no importó (dio 0), pero es una propiedad a tener presente — R4 la usó y tuvo que correr a mano los que la cadena no alcanzó.
- `test:setter` es la única suite con **flakes históricos documentados** (`docs/bitacora-beta-3.md:935` y `:1087`, ambos con causa confirmada y fix). Corre con `retries: 0` y `workers: 1`, así que un flake se presenta como fallo duro.

### No se pudo establecer

- No se corrieron `npm run test:e2e`, `npm run test:integration`, ni los 19 scripts del módulo chatbot. Quedaron fuera del alcance de las 4 suites pedidas.

---

## 4 · R3 · La regla que prohíbe links en el opener

**Qué se preguntó.** Dónde vive la validación, todos sus call-sites, el comentario de decisión, si hay otra anti-link con otro nombre, y **el precio real** de permitir links en el primer contacto.

### VISTO — la definición

`logic-core-v3/src/lib/leados/flow.ts:195-207`, transcripción literal:

```ts
// ── B6: hard-block de links en el opener ─────────────────────────────────────
// (los parámetros INFORMATIVOS del canal, CANAL_INSTAGRAM, viven en flow-content.ts)

/**
 * B6 — Hard-block de links en el opener (acá la UI sí hace imposible): el
 * link viaja recién con la demo aprobada, en el segundo mensaje.
 */
const LINK_PATTERN =
  /(https?:\/\/|www\.|wa\.me\/|bit\.ly\/|linktr\.ee\/|\S+\.(com|com\.ar|ar|net|org|io|app|dev|shop|online|site|me)\b)/i

export function contieneLink(texto: string): boolean {
  return LINK_PATTERN.test(texto)
}
```

> **Las pistas del encargo, verificadas y corregidas:** `LINK_PATTERN` arranca en la **202**, `contieneLink` en la **205** (la pista decía "~202"). En `outreach.schemas.ts` el `.refine(` abre en la **39** y el predicado `!contieneLink(texto)` está en la **40** (la pista decía "~39").

### VISTO — todos los call-sites de `contieneLink`

Comando: `git grep -n "contieneLink"` desde la raíz. (Se usó `git grep` a propósito: un `grep -r` de filesystem levanta los 3 worktrees no trackeados de `.claude/worktrees/` y devuelve **números de línea falsos** — ver bloque final.)

| Archivo:línea | Qué hace |
|---|---|
| `src/lib/leados/flow.ts:205` | **La definición. Fuente única.** |
| `src/app/(protected)/setter/_actions/outreach.schemas.ts:8` | import |
| `src/app/(protected)/setter/_actions/outreach.schemas.ts:40` | el `.refine` del `OpenerInputSchema` — hard-block server-side |
| `src/app/(protected)/setter/leads/[leadId]/_components/opener-form.tsx:8` | import |
| `src/app/(protected)/setter/leads/[leadId]/_components/opener-form.tsx:36` | `const tieneLink = contieneLink(mensaje)` — bloqueo en vivo de la UI |

Derivados de `tieneLink` en el mismo archivo: `:37` `listoParaCopiar`, `:82` `invalid`, `:87` abre la caja rosa del gate, `:109` `disabled` del botón.

Re-validación server-side (donde el hard-block muerde, sin nombrar la función): `outreach.actions.ts:98-101`. Menciones sin ejecución: `flow-content.ts:14` (comentario), `tests/setter/01-flow.spec.ts:130` (comentario), y bitácoras.

Único consumidor vivo de `OpenerForm`: `manual/_components/m4-opener.tsx:6, 96`. **`opener-step.tsx` y el wizard ya no existen** (corte del sprint 5.6).

### VISTO — el comentario de decisión, en tres capas

**a) En el código** (`flow.ts:198-201`), textual:
> *B6 — Hard-block de links en el opener (acá la UI sí hace imposible): el link viaja recién con la demo aprobada, en el segundo mensaje.*

**b) En el schema** (`outreach.schemas.ts:27-32`), textual:
> *Paso 7 — El opener que el setter va a pegar en Instagram. SIN link, sin excepciones (el link viaja recién con la demo, segundo mensaje). El largo recomendado es aviso (capa informativa), no bloqueo — acá solo un techo de sanidad.*

**c) El porqué, en idioma del setter** (`guidance-content.ts:594-603`, `GUIA_OPENER.gate`), textual:
> **titulo:** *El link NO va en el opener — sacalo*
> **detalle:** *El opener **abre una conversación, no vende**: un link en el primer mensaje se lee como publicidad y el dueño lo ignora (o Instagram lo manda a spam). El link viaja recién en el **segundo mensaje, con la demo ya aprobada** — eso lo registrás desde «Seguimiento», cuando el negocio respondió.*

Y `guidance-content.ts:610-614` (`GUIA_OPENER.porque[1]`), textual:
> *Sin link y sin precio a propósito: el link viaja recién con la demo y el precio lo maneja Franco. **Meter cualquiera de los dos mata la respuesta**.*

### VISTO — la decisión ya está marcada como pendiente de Franco

`docs/HANDOFF-LEADOS-CIERRE.md:75`, textual:
> **La regla que prohíbe links en el opener.** El código la rechaza del lado del servidor, a propósito: *"el link viaja recién con la demo aprobada"*. El v3 dice que el primer contacto lleva el link. **Sin esta decisión, la etapa 5 del recorrido no se puede construir.** *El argumento a favor de cambiarla: esa regla protegía contra mandar una demo no aprobada; en demo-first, la demo ya pasó por la revisión de Franco antes del primer mensaje.*

Y el brief v3 ya dice lo contrario — `docs/BRIEF-VISION-FLUJO-SETTER-v3.md:82`: *"Etapa 5 — Contactar con la demo hecha / **El primer contacto ya lleva el link.**"*; `:144`: *"El envío del link como pantalla propia | Con la inversión, el primer contacto ya lleva el link. Se funde con el contacto."*

El protocolo de piloto lo pone como prueba a correr — `docs/PILOTO-DEMO-FIRST.md:47`: *"abrí la pantalla del opener e intentá pegar el link … **Confirmá que te rebota** — es la contradicción que hay que decidir."*

### VISTO — ¿otra validación anti-link con otro nombre? NO. Exactamente una en todo el repo

- `git grep -nE "LINK_PATTERN|urlRegex|hasLink|sinLink|noLink|tieneLink|contieneUrl|isUrl|URL_REGEX|linkRegex"` → 24 líneas, **todas** son la regla B6 o menciones en docs.
- `git grep -nE "\.refine\(|\.superRefine\(|\.regex\(|z\.url\(|\.url\(\)"` sobre `src/**` → 54 hits, revisados uno por uno. **Ninguno bloquea links.** Los relacionados con URLs van en **dirección contraria** (exigen link): `dossier.schemas.ts:73-74` y `admin/leados/_actions/revision.schemas.ts:18` exigen `https://` en `draftUrl`.
- **Corroboración fuerte aportada por el verificador:** `src/modules/chatbot/server/safety/validateOutput.ts` es el **único otro validador por regex sobre texto de salida** del repo (7 patrones, líneas 30-76). Leído entero: **no tiene ninguna regla anti-link**.
- Falso positivo semántico descartado explícitamente: `src/modules/chatbot/server/crm/validateWebhookUrl.ts:84` es un guard anti-SSRF de URLs de webhook, no una regla anti-link del opener.

### VISTO — qué ve el setter cuando la regla se dispara

1. `tieneLink → true` (`opener-form.tsx:36`) dispara cuatro efectos simultáneos: `<TextArea>` en estado `invalid` (`:82`), caja rosa con `role="alert"` (`:87-94`) que muestra `GUIA_OPENER.gate.titulo` + `.detalle`, botón «Ya lo mandé en Instagram — registrar» `disabled` (`:109`), y desaparece el bloque «Tu opener, listo para pegar» (`:96-102`).
2. **El mensaje de Zod del `.refine` es inalcanzable por click.** `registrar()` (`:44-65`) es el único llamador de `OpenerInputSchema.safeParse`, y solo se dispara desde el `onClick` de un botón que está `disabled` justo cuando hay link.
   *Verificado estructuralmente por el verificador (el relevamiento lo había dejado en "no se pudo establecer"):* `src/components/ui/Button.tsx` renderiza un `<motion.button disabled={disabled || loading}>` — elemento nativo, semántica de `disabled` real — y **no hay `<form onSubmit>` en `opener-form.tsx`**, así que tampoco hay submit por teclado. Además `tieneLink` corre sobre el string **crudo** mientras el schema hace `.trim()` antes del `.refine`, y trim solo puede quitar coincidencias, nunca crearlas ⇒ `tieneLink === false` implica que el refine pasa. **El claim se sostiene por construcción.**
3. Resultado: hay **dos textos distintos para el mismo gate** — el que se ve (`GUIA_OPENER.gate`) y el que solo puede llegar por respuesta del server (`outreach.schemas.ts:41`). El propio test documenta que ya driftó una vez (`01-flow.spec.ts:126`).

### VISTO — comportamiento empírico del regex

`LINK_PATTERN` copiado literal y ejecutado con node contra 22 cadenas (exit 0). Reproducido de cero por el verificador: **las 17 filas originales se reproducen exactas, una por una.**

```
BLOQUEA | Mira esta demo: https://ejemplo.com      pasa    | Hola! Vi que no contestan los DMs...
BLOQUEA | www.ejemplo.com                          pasa    | Vi tu perfil @panaderia.ok y me gusto
BLOQUEA | entra a bit.ly/abc                       pasa    | Te escribo por lo de la web.Armamos algo
BLOQUEA | te paso el t.me/canal                    pasa    | La direccion es Av. Corrientes 1234
BLOQUEA | mi whatsapp wa.me/549111                 pasa    | Presupuesto 3.500 pesos
BLOQUEA | Segui.me y te muestro                    pasa    | hxxps://ejemplo[.]com
BLOQUEA | Vi que venden en Mercado Libre.ar        pasa    | ejemplo (punto) com
BLOQUEA | ejemplo.com sin protocolo
BLOQUEA | HTTPS://EJEMPLO.COM                      — casos que sumó el verificador —
BLOQUEA | instagram.com/negocio                    BLOQUEA | Vi tu local.Me parecio buenisimo
                                                   BLOQUEA | Vi el menu.Online no lo tienen
                                                   BLOQUEA | te muestro algo.ar
                                                   pasa    | Hola.Armamos algo para vos
```

> **Corrección del verificador:** `t.me` **no** está en `LINK_PATTERN` (`flow.ts:203` solo tiene `wa.me/`, `bit.ly/`, `linktr.ee/`). El caso `t.me/canal` bloquea por la rama genérica `\S+\.(…|me)\b`, no por una regla de Telegram.

Consecuencias medidas: **falsos positivos en castellano** (`Segui.me`, `Mercado Libre.ar`, y un typo sin espacio como `local.Me` o `menu.Online`) y **evasión trivial** (`hxxps://ejemplo[.]com` y `ejemplo (punto) com` pasan).

### VISTO — tests que asertan la regla: 2 e2e de comportamiento, cero unitarios

- `tests/setter/01-flow.spec.ts:114-153` — test `B3 · OPENER: rechaza link (hard-block) + registra + idempotencia`. Asserta **comportamiento** (botón deshabilitado + alerta visible), no la frase, precisamente porque el texto ya driftó.
- `tests/qa-walkthrough/corrida-1.spec.ts:157-177` — step `4b`, mismo par de asserts + 2 screenshots. **Ancla en `[data-lead-wizard]`, selector que ya no existe en `src`.**

> **Corrección del verificador a la evidencia, no a la conclusión:** el relevamiento afirmó *"`git ls-files tests` (74 archivos) no contiene ningún spec de `flow.ts`"*. Son **78** archivos, y **sí existe** `src/lib/leados/flow.invariant.ts`, un test unitario ejecutable de `flow.ts` cableado como `npm run check:invariant:flow`. El método era inválido: buscó solo en `tests/` y se le escapó entera la convención `*.invariant.ts` que vive bajo `src/` (19 archivos). **La conclusión estrecha sobrevive, re-verificada:** `grep -rn 'contieneLink|LINK_PATTERN' src/lib/leados/*.invariant.ts` → **0 hits**. Ningún invariante toca la regla anti-link.

### INFERIDO — el precio real de permitir links en el primer contacto

*(Enumeración de qué habría que tocar. No se propone cómo.)*

**Capa 1 — Lógica de bloqueo (3 archivos, el cambio "chico"):** `flow.ts:195-207` · `outreach.schemas.ts:8,27-43` · `opener-form.tsx:8,36,37,82,87-94,109`.

**Capa 2 — Copy que AFIRMA la regla en prosa (8 archivos; si no se toca, la app se contradice a sí misma):**
`guidance-content.ts:587-624` (`GUIA_OPENER` entero) · `guidance-content.ts:758-852` (`GUIA_REVISION` y `GUIA_ENVIO`) · `flow-content.ts:223` (`CANAL_INSTAGRAM.disciplina[2]`: *"El link va SIEMPRE en el segundo mensaje… Nunca en el opener."*) y `:248` · `copy-blocks.ts:100` (**el prompt que se le pega al Gem de outreach**: *"SIN link, SIN precio, SIN vender"*) y `:122` (builder del segundo mensaje) · `paso.ts:166-181,209` — **más los 3 que sumó el verificador:** `manual.ts:167` (*"El primer mensaje sale SIN link — registrá acá que lo mandaste."*), `herramientas.ts:105`, `m5-seguimiento.tsx:27,125,165`.

> Correcciones de rango del verificador: `GUIA_ENVIO` arranca en la **813** (781-784 es el JSDoc del tipo `EnvioGuia`); el bloque `espera:` va de **836 a 852**; el builder `buildDemoMensajeBlock` está en la **122** (118-120 es su JSDoc).

**Capa 3 — El gate estructural del segundo mensaje (`gateEnvioDemo`).** Pide DOS condiciones (Franco aprobó ∧ el negocio enganchó). El brief v3 (`:144`) dice que esa pantalla *"se funde con el contacto"*.

> **Corrección importante del verificador — la lista de call-sites estaba incompleta y el hueco es grave.** Además de `outreach.actions.ts:27,234`, `m15-envio.tsx:5,97,105` y `envio-form.tsx:16`, `git grep -n gateEnvioDemo -- src tests` devuelve: **`src/lib/leados/manual.ts:29,475,578,590`** (consumidor de lógica real: **deriva qué pantalla del manual ve el setter**), `manual/_data.ts:73`, `manual.invariant.ts:99`, `gate-envio-demo.invariant.ts` (archivo entero, 12 asserts) y `tests/leados/envio-demo-rechazo.spec.ts:14,17,22,59,134,138`. **Omitir `manual.ts` era el hueco: es el módulo que decide la posición del setter.**

**Capa 4 — Tests: 4+ artefactos, no 2.** `tests/setter/01-flow.spec.ts:114-153` · `tests/qa-walkthrough/corrida-1.spec.ts:157-177` · **y, si se toca el gate del segundo mensaje:** `src/lib/leados/gate-envio-demo.invariant.ts` (su assert de `:62` dice literalmente *"sin link publicado el envío NO se habilita"*) y `tests/leados/envio-demo-rechazo.spec.ts`.

**Capa 5 — Documentación (6+ archivos con afirmaciones incompatibles):** `docs/manual-usuario/03-opener-y-seguimiento.md:34,41,64,71,183` · `docs/metodo/MAPA-LEADOS.md:21` · `docs/HANDOFF-LEADOS-CIERRE.md:75` · `docs/PILOTO-DEMO-FIRST.md:47` · `docs/auditoria-recorrido-completo-novato.md:15,29,84,87` · `docs/auditoria-ux-setter.md:127`.

**Dimensionamiento (INFERIDO):** el bloqueo técnico es trivial — una función y dos consumidores. Lo caro es la **coherencia narrativa**: la prohibición está tejida en el copy de guía, en el prompt que se le da a la IA para redactar el opener, en el gate del segundo mensaje y en el manual de usuario. Tocar solo la Capa 1 deja la app diciéndole al setter que no ponga link mientras se lo permite.

### No se pudo establecer

- **Verificación en runtime.** No se levantó servidor ni se abrió M4: el ítem 7 sale de leer código (reforzado estructuralmente por el verificador), no de una captura.
- **Cuándo y por quién se introdujo la regla.** No se corrió `git log -S` sobre `LINK_PATTERN`.
- **Si hay superficies de opener fuera del setter** (ej. `src/modules/motor/`). Los greps no devolvieron nada ahí, pero no se auditó ese módulo pantalla por pantalla.

---

## 5 · R4 · Qué se rompe si se achican los identificadores de fase

**Qué se preguntó.** Si el camino barato de colapsar las fases (conservar los identificadores) es el único aceptable, o si el caro también lo es.

### DESVÍO DEL PROTOCOLO — declarado, con su motivo

El protocolo pedía: crear la rama `probe/fase-ids-descartable` **en el checkout**, mutar, correr, y restaurar con `git checkout .` → volver a la rama original → `git branch -D`.

**Se ejecutaron los 8 pasos, pero la rama descartable se materializó en un `git worktree` aislado en el scratchpad, no en el checkout compartido.** Motivo, con la evidencia del §1:

1. **Hay otra sesión viva commiteando en este mismo checkout** (`11eee1b` apareció a las 01:54, a mitad de corrida; hay 3 worktrees de agente activos sobre el mismo `.git`).
2. `git checkout probe/fase-ids-descartable` en un índice compartido **mueve el HEAD de la otra sesión también**. Si esa sesión commitea durante la ventana, su commit aterriza en mi rama descartable — y el `git branch -D` del paso 7 lo borra. Eso no es un riesgo de contaminación de archivos: es **pérdida del trabajo ajeno**.
3. El objetivo declarado del protocolo es la inocuidad, y su prueba pedida es `git status --porcelain` vacío + `git rev-parse HEAD` idéntico al del paso 2. El worktree **cumple esa prueba de forma más fuerte**: el checkout compartido nunca cambió de rama, nunca tuvo un archivo modificado, y su HEAD nunca se movió por mi mano.

Nada del protocolo se salteó: se creó la rama descartable, se mutó `FASE_IDS` a 4 y después a 2, se corrieron la suite de invariantes y los dos specs, se midió el efecto sobre el progreso guardado, se restauró y se borró la rama. **No se commiteó ni se pusheó nada en ningún momento.**

*(Detalle operativo: el worktree recibió `node_modules` por directory junction y copias de `.env`/`.env.local`, ambos eliminados antes de desmontarlo. La junction se removió con `cmd /c rmdir` — que borra el enlace sin seguirlo — y se verificó que el `node_modules` real quedara intacto: 764 entradas antes y 764 después.)*

### VISTO — control (FASE_IDS con las 6 originales, en el worktree)

```
### CONTROL A: check:invariants ###        EXIT_INVARIANTS=0
### CONTROL B: los 2 specs ###             EXIT_SPECS=0
  12 passed (21.7s)
```

Baseline verde: el worktree es un banco de pruebas válido.

### VISTO — con `FASE_IDS` reducido a 4 (`estructura, personalizacion, assets, cta`)

**`npx tsc --noEmit` → EXIT 2, 4 errores:**
```
src/lib/leados/flow-content.ts(92,5): error TS2322: Type '"calidad"' is not assignable to type '"cta" | "estructura" | "personalizacion" | "assets"'.
src/lib/leados/flow-content.ts(102,5): error TS2322: Type '"mobile"' is not assignable to type '"cta" | "estructura" | "personalizacion" | "assets"'.
src/lib/leados/manual.ts(218,16): error TS2345: Argument of type '"calidad"' is not assignable to parameter of type '"cta" | ...'.
src/lib/leados/manual.ts(225,16): error TS2345: Argument of type '"mobile"' is not assignable to parameter of type '"cta" | ...'.
```

**`npm run check:invariants` → EXIT 1.** Falla en el 14º de la cadena, `check:invariant:progreso`:
```
AssertionError [ERR_ASSERTION]: hay una fase del shell por cada FASE_ID (sin faltantes ni de más)
6 !== 4
    at .../src/lib/leados/progreso-isolation.invariant.ts:124:8
  actual: 6, expected: 4, operator: 'strictEqual'
```

Como la cadena `&&` frena ahí, se corrieron a mano los que no alcanzó: **`check:invariant:reloop-selfcheck` EXIT 0, `check:invariant:manual` EXIT 0, `check:invariant:flow` EXIT 0.**

**Los dos specs → EXIT 0. `12 passed (22.2s)`. NINGUNO falla.**

### VISTO — con `FASE_IDS` reducido a 2 (`estructura, personalizacion`)

**`npx tsc --noEmit` → EXIT 2, 16 errores.** Los mismos de antes escalados (`flow-content.ts:72,82,92,102`; `manual.ts:204,211,218,225`) **más los propios specs, que ahora tampoco tipan:**
```
tests/leados/dossier-gates.spec.ts(240,43): error TS2493: Tuple type 'readonly ["estructura", "personalizacion"]' of length '2' has no element at index '2'.
tests/leados/progreso-construccion.spec.ts(119,43): error TS2493: ... has no element at index '2'.
tests/leados/progreso-construccion.spec.ts(119,56): error TS2493: ... has no element at index '3'.
```

**`check:invariant:progreso` → EXIT 1**, `6 !== 2`, misma assertion, mismo `progreso-isolation.invariant.ts:124`.

**Los dos specs → EXIT 1. `2 failed / 10 passed`:**
- `dossier-gates.spec.ts:231 › B6.2 · el re-loop RECHAZADA→CONSTRUCCION resetea el self-check (GATE) y preserva fases + draft` → `PrismaClientValidationError`
- `progreso-construccion.spec.ts:111 › el re-loop RECHAZADA→CONSTRUCCION preserva el progreso (no se resetea)` → `ZodError: expected: "'estructura' | 'personalizacion'"`

**Y los dos fallan por sus PROPIOS fixtures, no porque la lógica de producción detecte nada.** Los specs derivan sus datos de `FASE_IDS` en vivo (`progreso-construccion.spec.ts:36`: *"los fixtures se DERIVAN de `FASE_IDS` en vivo"*) e indexan `FASE_IDS[2]`/`FASE_IDS[3]` (`:119`, `dossier-gates.spec.ts:240`), que con 2 elementos son `undefined`. El error es "escribí `[undefined]` en Prisma", no "el sistema se dio cuenta".

### VISTO — paso 6: qué le pasa al progreso YA GUARDADO

**Éste es el hallazgo del ítem.** Se ejecutó `parseProgreso` (`src/lib/leados/flow.ts:131-134`) con `FASE_IDS` en 2 elementos, sobre payloads como los que hoy están en la columna `progresoJson`:

```
FASE_IDS vigente: ["estructura","personalizacion"]

A · lead a mitad de camino (3 de 6, ninguna fase sobreviviente perdida)
  guardado en DB : {"completadas":["estructura","personalizacion","assets"]}
  zod safeParse  : FALLA        parseProgreso : {"completadas":[]}
  ¿tiró error?   : NO           fases: 3 guardadas -> 0 leídas  *** SE PERDIERON 3 EN SILENCIO ***

B · lead con UNA fase que ya no existe
  guardado en DB : {"completadas":["estructura","calidad"]}
  ¿tiró error?   : NO           fases: 2 -> 0                   *** SE PERDIERON 2 EN SILENCIO ***

C · lead con la construcción TERMINADA (las 6, + faseActual + marcadas)
  ¿tiró error?   : NO           fases: 6 -> 0                   *** SE PERDIERON 6 EN SILENCIO ***

D · solo faseActual apunta a una fase muerta
  guardado en DB : {"completadas":["estructura"],"faseActual":"mobile"}
  ¿tiró error?   : NO           fases: 1 -> 0                   *** SE PERDIERON 1 EN SILENCIO ***

E · solo marcadas tiene una llave muerta
  guardado en DB : {"completadas":["estructura"],"marcadas":{"mobile":"2026-07-03T10:00:00.000Z"}}
  ¿tiró error?   : NO           fases: 1 -> 0                   *** SE PERDIERON 1 EN SILENCIO ***
```

**Es TODO-O-NADA y es SILENCIOSO.** La causa está a la vista en `src/lib/leados/flow.ts:131-134`:

```ts
export function parseProgreso(json: unknown): Progreso {
  const parsed = ProgresoSchema.safeParse(json)
  return parsed.success ? parsed.data : { completadas: [] }
}
```

`ProgresoSchema` (`contracts.ts:123-127`) valida los tres campos contra `z.enum(FASE_IDS)`. **Una sola llave muerta —en `completadas`, en `faseActual` o en `marcadas`— invalida el objeto entero**, y el `safeParse` fallido cae al default `{ completadas: [] }`. El caso A es el más elocuente: sus tres fases (`estructura`, `personalizacion`, `assets`) incluyen dos que **siguen existiendo**, y se pierden igual.

**Aguas abajo (VISTO):** `_data.ts:159` hace `const progreso = parseProgreso(dossier?.progresoJson ?? null)` y lo pasa a la derivación. `manual.ts:450-452`:

```ts
for (const fase of input.progreso.completadas) {
  done.add(pantallaDeFaseConstruccion(fase))
}
```

Con `completadas: []`, **ninguna** pantalla m7–m12 se marca completada en `completadasDe` (`manual.ts:425`), y `posicionDe` (`manual.ts:482`) devuelve al setter al principio de la Construcción. Sin un error, sin un aviso, sin una entrada de log.

### VEREDICTO del ítem

| Guardián | ¿Detecta el achique de `FASE_IDS`? |
|---|---|
| `npx tsc --noEmit` | **SÍ** — 4 errores con 4 fases, 16 con 2 |
| `check:invariant:progreso` | **SÍ** — assertion `6 !== N`, `progreso-isolation.invariant.ts:124` |
| `tests/leados/progreso-construccion.spec.ts` | **NO con 4 fases.** Con 2 falla, pero por sus propios fixtures |
| `tests/leados/dossier-gates.spec.ts` | ídem |
| El progreso ya guardado | **NO detecta nada — se vacía en silencio, todo-o-nada** |

**INFERIDO:** conservar los identificadores no es una preferencia de estilo, es lo que separa un bug visible de una pérdida de datos invisible. El camino "caro" (renombrar/achicar los ids) no falla ruidoso en runtime: falla en el tipo y en un invariante — ambos apagables — y después vacía checklists sin dejar rastro. Con `next.config.ts:10-15` poniendo `typescript.ignoreBuildErrors: true`, **el guardián de tsc no frena el build de producción** (ver bloque final).

### No se pudo establecer

- **Si el fallo silencioso ya ocurrió alguna vez en esta base.** Requeriría un histórico de `progresoJson` que no existe: el campo se sobreescribe, no se versiona.

---

## 6 · R5 · Cuántos leads tienen progreso de fases guardado

**Qué se preguntó.** ¿El argumento "se vacía el progreso de los leads en vuelo" tiene peso real o es teórico?

### VISTO — dónde vive

`prisma/schema.prisma:1001`, modelo `OsLeadDossier` (`:988-1016`), campo **`progresoJson Json?`** — único campo, único modelo, relación 1:1 con `OsLead` vía `leadId @unique`. Creado por `prisma/migrations/20260630000000_add_dossier_progreso/migration.sql:7`. Único write-path de producción: `src/lib/leados/dossier.ts:384-398` (`saveOwnedProgreso`), invocado por `dossier.actions.ts:284-303`.

### VISTO — los números (base de DESARROLLO, consultas `count`/`findMany`/`SELECT`)

| Métrica | Valor |
|---|---|
| `OsLead` totales | **101** |
| `OsLeadDossier` totales | **82** |
| Dossiers con `progresoJson` NOT NULL | **9** |
| Dossiers con `progresoJson` NULL | **73** |
| De los 9, con ≥1 fase completada | **9** |

Contra-chequeo con SQL crudo, coincidente:
```sql
SELECT COUNT(*) AS total,
       COUNT(*) FILTER (WHERE "progresoJson" IS NOT NULL) AS no_null,
       COUNT(*) FILTER (WHERE jsonb_array_length(("progresoJson"->'completadas')::jsonb) > 0) AS con_fases
FROM "OsLeadDossier";
-- → total=82, no_null=9, con_fases=9
```

**Histograma:** 1 fase → 2 dossiers · 2 → 1 · 3 → 1 · 4 → 1 · 5 → 1 · 6 → 3. Una escalera perfecta 1,2,3,4,5,6.

### VISTO — origen de los 9: **9 de 9 son sembrados**

Los 9 llevan el prefijo `M0-GAL `, el namespace declarado del seed de la galería (`scripts/dev/m0-galeria-seed.ts:45`, `GAL_TAG = 'M0-GAL'`, con limpieza idempotente por prefijo en `:70-79`). Todos asignados a `setter-qa@develop.test`.

**8 de los 9 salen literalmente del código del seed** (`m0-galeria-seed.ts:182-231`): `16-m8-personalizacion` (1 fase), `17-m9-assets` (2), `18-m10-cta` (3), `19-m11-calidad` (4), `20-m12-mobile-fases-hechas` (5), y `21-m13`, `22-m14`, `24-error-chequeo` con `TODAS_LAS_FASES` (6).

**El 9º (`M0-GAL 14-m7-tilde-deshabilitado`) es un click de QA sobre un lead sembrado:** el seed lo crea en `:180` como `{ setterId, stage: 'BRIEF' }` sin progreso, y en la DB está en `CONSTRUCCION` con 1 fase y `updatedAt` 28 minutos posterior a su `createdAt`.

**Cero registros con progreso fuera de los namespaces de seed/test.** Los 101 leads se reparten: `M0-GAL ` 34 (9 con progreso) · `QA-W ` 13 (0) · `SMOKE-SETTER` 11 (0) · `QA…` otros 12 (0) · sin prefijo 34 (**0**). Y los 34 "sin prefijo" tampoco son reales: sus nombres están hardcodeados en `prisma/seed-agency-os.ts:459,777,855` y `scripts/demos-seed-review-queue.ts:120`, más `"Playwright Test"` y `"Juan Pérez"`.

**Los "leads en vuelo" (stage CONSTRUCCION) son 12 dossiers, y los 4 que no son de la galería tienen `progresoJson` NULL.** La base de dev tiene **un solo usuario con `role = SETTER`**, y es la persona de QA (`setter-qa@develop.test`, 73 leads asignados). No hay setters humanos operando contra esta base.

### INFERIDO

- **En dev, el argumento no tiene peso material.** Las 9 filas son 100 % material descartable: 8 las regenera `npx tsx scripts/dev/m0-galeria-seed.ts` (idempotente, borra y resiembra su namespace) y la 9ª es residuo de una corrida de capturas.
- **La forma del histograma** (escalera 1→6 sin ningún 0) refuerza que ninguno viene de uso orgánico.
- **El costo de perder progreso está acotado por diseño**, aun si existieran filas reales: `schema.prisma:996-1000` y el write-path declaran que `progresoJson` es un checklist auto-reportado y **nunca un gate** — el pasaje CONSTRUCCION→EN_REVISION cuelga de `draftUrl` + `selfCheckAprobado`. Perderlo devuelve el checklist a "fresco"; no bloquea ni retrocede el lead. *(Ojo: eso es el costo de **flujo**. El costo de **confianza** de que un checklist se vacíe solo, medido en R4, es otra cosa.)*

### No se pudo establecer

- **El número en PRODUCCIÓN.** En `logic-core-v3` solo existe `DATABASE_URL`, definida en `.env` y `.env.local`, y **ambas apuntan al mismo host de la branch Neon de dev** (verificado extrayendo solo host/db, sin credenciales; es el host que los propios seeds reconocen como dev en `m0-galeria-seed.ts:37-42`). No hay `DATABASE_URL_PROD`, `DATABASE_URL_TEST` ni `DIRECT_DATABASE_URL` cargadas localmente. **La variable que haría falta es `DATABASE_URL` apuntada al branch Neon `main`, o `DIRECT_DATABASE_URL_PROD`** (`docs/operations/b14-deploy-checklist.md:117,127`). Sin ella el número no se mide, y no se inventa acá.
- **Si hay setters humanos usando el sistema en producción.** No es observable desde esta base. Es la pregunta que decide si el argumento pasa de "teórico en dev" a "real en prod".

---

## 7 · R6 · El contador anti-spam de Instagram

**Qué se preguntó.** El recorrido nuevo va a registrar el canal de cada toque. ¿Sumar canal por toque arrastra un cambio de comportamiento con test detrás?

### VISTO — la función

`src/lib/leados/outreach.ts:55-68` (la pista "~59" es **correcta**: la firma arranca en la 59):

```ts
export async function contarDmsHoy(userId: string): Promise<number> {
  const { desde, hasta } = limitesDelDiaArgentino(new Date())
  return prisma.osLeadActivity.count({
    where: {
      performedById: userId,
      channel: 'INSTAGRAM_DM',
      createdAt: { gte: desde, lte: hasta },
    },
  })
}
```

Ventana en `outreach.ts:21-33`: la fecha se deriva con `timeZone: 'America/Argentina/Buenos_Aires'`, los bordes se arman con el literal `-03:00`.

**Call-sites: exactamente dos.** `outreach.actions.ts:73` (dentro de `estadoToque()`) y `manual/_data.ts:141` (dentro de `cargarManualDelLead()`), más sus imports (`:28` y `:19`).

### VISTO — tests que lo asserteen: NINGUNO

```
$ grep -rn "contarDmsHoy\|dmsHoy\|CANAL_INSTAGRAM\|topeDiarioDms\|canal-seguridad\|CanalSeguridad" \
    --include="*.spec.ts" --include="*.invariant.ts" --include="*.test.ts" .
EXIT=1
```

Exit 1 = cero coincidencias (leído del proceso, sin pipe). No hay assertion que transcribir porque no existe ninguna. Superficie verificada vacía: los 14 specs de `tests/setter/`, los 6 de `tests/leados/`, y los invariantes de `src/lib/leados/`.

### VISTO — no es un gate: es lógica suelta, 100 % presentacional

`estadoToque()` (`outreach.actions.ts:70-79`) computa el conteo y lo mete en el payload de retorno, **siempre DESPUÉS** de que la escritura ya ocurrió (`registrarContactoComercial` en `:123` y `:185`). No hay ningún `if (dmsHoy >= …) return fail(…)`. El barrido de guardas server-side de `registrarOpener`/`registrarResultado` (`:95-121` y `:154-183`) valida schema, ownership, `leadRespondio`, stage, `leadActivo`, actividades previas y `CALL_AGENDADA` — **cero menciones al conteo**.

**Además, el `dmsHoy` que la action devuelve no lo lee nadie:** `opener-form.tsx:52-64` usa solo `proximoToque`; `seguimiento-form.tsx:114-122` pasa solo `resultado` + `proximoToque`.

El único punto de decisión es `setter/_components/canal-seguridad.tsx:11-27`:

```tsx
const pasado = dmsHoy >= topeDiarioDms
const cerca = !pasado && dmsHoy >= avisoDesdeDms
```

`pasado` y `cerca` **solo eligen clases CSS y el string del aviso**. No hay `disabled`, ni `return null`, ni redirect, ni throw. La decisión está documentada en `canal-seguridad.tsx:4-10`: *"Capa de seguridad de canal: INFORMATIVA por decisión registrada … avisa al acercarse/pasar el tope, pero NUNCA bloquea: el setter está capacitado y decide."*

### VISTO — qué ve el setter (copy exacto, con `topeDiarioDms = 30` resuelto)

Se renderiza en la zona "Munición" de M4 (`m4-opener.tsx:64`) y M5 (`m5-seguimiento.tsx:174`), zona que **no está plegada** (`pantalla-manual.tsx:20-30` es un `<section>` plano).

- Encabezado siempre: **`Canal Instagram — hoy`** + contador **`N / 30 DMs`**.
- Normal (`< 24`): *"Ritmo recomendado: hasta 6 por hora, máximo 30 por día."*
- Cerca (`24–29`, ámbar): *"Te estás acercando al tope diario recomendado (30). Dosificá lo que queda del día."*
- Pasado (`≥ 30`, rosa): *"Pasaste el tope diario recomendado (30). Podés seguir — vos decidís — pero el canal se cuida espaciando."*

**Cuando el "freno" se dispara, el cartel se pone rosa y avisa. Nada se deshabilita.**

### VISTO — el canal en el modelo de datos, y el hallazgo que importa

**El canal SÍ se guarda:** `prisma/schema.prisma:959`, `OsLeadActivity.channel ActivityChannel`, con índice `@@index([performedById, createdAt])` que sirve justo a este conteo. Enum (`:1090-1102`): `INSTAGRAM_DM | WHATSAPP | EMAIL | LLAMADA | LOOM_VIDEO | OTRO | SISTEMA`.

**PERO el setter nunca elige canal.** Los tres write-paths del setter hardcodean el mismo literal:
- `setter/_actions/outreach.actions.ts:125` (opener)
- `setter/_actions/outreach.actions.ts:187` (resultado de toque)
- `setter/_actions/agenda.actions.ts:241` (confirmación de reunión)

El único camino con canal variable es el del admin (`admin/leads/_actions/activity.actions.ts:18-24`), pero ahí `performedById` es el **admin**, así que esas filas jamás entran en el `contarDmsHoy` de un setter.

**Consecuencia (VISTO):** hoy, para las filas que un setter escribe, `channel: 'INSTAGRAM_DM'` es un filtro **funcionalmente vacuo** — filtrar por Instagram y no filtrar dan exactamente el mismo número.

### VISTO — el límite hardcodeado

`src/lib/leados/flow-content.ts:210-213`: `topeDiarioDms: 30`, `avisoDesdeDms: 24`, `ritmoPorHora: 6`. (Más `openerMaxCaracteres: 300`, usado como aviso de largo en `opener-form.tsx:35`, también sin bloquear.)

### VEREDICTO: NO

| Mitad de la pregunta | Respuesta | Evidencia |
|---|---|---|
| ¿Hay test/invariante detrás? | **NO — cero** | grep sobre `*.spec.ts` + `*.invariant.ts` + `*.test.ts` → `EXIT=1` |
| ¿Hay cambio de comportamiento? | **Solo cosmético** | el único consumidor que decide algo (`canal-seguridad.tsx:14-27`) decide color y texto |

El contador es una **etiqueta, no un freno**. Sumar canal por toque cambiaría el número dibujado (los toques no-Instagram dejarían de contar), sin que nada se bloquee ni se rompa.

**INFERIDO — el corolario incómodo:** tampoco hay red que detecte una regresión si el conteo se rompe, en ninguna dirección.

---

## 8 · R7 · Subida de archivos en la superficie del setter

**Qué se preguntó.** ¿El "material recolectado" en v1 son URLs pegadas, o hay infraestructura de subida reutilizable?

### VEREDICTO: son URLs pegadas. NO hay infraestructura de subida reutilizable.

### VISTO

**1 · Inputs de archivo: existen 3 en todo `src`, y ninguno transmite un archivo.**

| Archivo:línea | Superficie | Qué hace realmente |
|---|---|---|
| `setter/nuevo/importar/importar-prospectos-form.tsx:122` | setter | CSV → `FileReader` (`:69,76`) → `FormData` con el **texto** (`:82-85`) |
| `modules/chatbot/components/admin/config/tabs/AvatarUploader.tsx:72` | admin + dashboard | imagen → recorte en canvas → **data URL base64** (`:35`) |
| `dashboard/.../ImportCSVButton.tsx:37` | dashboard | CSV → `FileReader` (`:18`) → texto (`:21`) |

El comentario de `AvatarUploader.tsx:6-8` lo declara: *"Sin servicio externo: la imagen se recorta/comprime EN EL NAVEGADOR … y se devuelve como data URL base64 … Así no inflamos la DB ni dependemos de infra."*

**2 · Endpoints de upload: NO existen.**
- `grep -rn "formData()" src` → **0 resultados, exit 1**.
- `grep -rniE "formData\(\)|multipart|upload" src/app/api` → **0 resultados**, sobre **37 archivos `route.ts`**.
- `grep -rn "multipart/form-data" src` → **0 resultados**.

**3 · Object storage: NO existe.** `grep -rniE "aws-sdk|@vercel/blob|cloudinary|uploadthing|supabase|@google-cloud/storage|presigned|putObject|S3Client"` sobre `logic-core-v3` (sin `node_modules`) → **0 resultados**. `bucket` aparece solo como sustantivo de dominio (`OriginBucket`, `CampaignBucket`, rate-limit).

**4 · `package.json`: ninguna dependencia de subida ni de storage.** Ni un cliente de S3, blob store, CDN de imágenes ni servicio de upload. Corolario en env vars (solo nombres): `.env.example` y `scripts/check-env.js` declaran DB, auth, Brevo/Resend, Anthropic/Vertex, Google, Sentry, Telegram, n8n, Tiendanube. **Ningún nombre relacionado con storage/blob/bucket/CDN.**

**5 · `next.config.ts:16-23`:** el único host remoto autorizado para `next/image` es **`placehold.co`** (imágenes de relleno). No hay dominio de CDN ni de bucket propio.

**6 · Por superficie:** `/setter` **NO** (solo el importador CSV, que manda texto) · `/admin` **NO** (`AvatarUploader` base64 + `VaultManager.tsx:69-71`, que es un `<input type="url">`) · `/dashboard` **NO** (CSV texto + avatar base64; el logo de la organización se captura como URL escrita a mano en `OnboardingWizard.tsx:416-419`) · chatbot público **NO**.
*Falso positivo descartado:* `admin/projects/_components/task-list.tsx:296` `onDrop` es drag-and-drop de tarjetas kanban, no de archivos. No hay `useDropzone` en ningún lado.

**7 · Prisma: todo el material es `String` de URL. Cero campos binarios.** `ClientAsset.url String` (`:737`) — el "archivo" del cliente **es** una URL · `Organization.logoUrl` (`:336`) · `OsLead.instagramUrl/currentWebUrl/googleMapsUrl` (`:871-873`) · `OsDemo.demoUrl/loomUrl` (`:976-977`) · `OsLeadDossier.draftUrl/finalUrl` (`:1002,:1004`). **No existe ningún campo `Bytes`, blob, adjunto ni `attachment` en las 2.247 líneas del schema.**

**8 · El copy del setter ya pide pegar links — es el diseño vigente, no una omisión:**
- `dossier.schemas.ts:67-78`: *"Pegá la URL del borrador que te dio Netlify Drop"*, con `.url()` + `.refine(url => url.startsWith('https://'))`.
- `copy-blocks.ts:159-165,195`: el bloque que el setter pega en Claude Design arma una sección literalmente titulada **`DE DÓNDE BAJAR EL LOGO Y LAS FOTOS REALES`** con las tres URLs del lead. El logo y las fotos ya viajan como *"de dónde bajarlos"*, no como archivos.
- `guidance-content.ts:285-291`: el campo *"Contenido real (logo / fotos / tono)"* es un **textarea descriptivo** (`ficha-form.tsx:189-198`), no un adjunto.

### INFERIDO

1. Si la ficha absorbe la recolección de material hoy, **tiene que hacerlo con URLs**. Construir subida implicaría net-new completo: elegir y agregar dependencia/servicio de storage, crear el primer endpoint del repo que reciba multipart, y agregar campos al schema.
2. Existe un **tercer camino ya probado**, aunque no es "infraestructura de subida": el patrón `AvatarUploader` (comprimir en el navegador → data URL base64 → columna `TEXT`). Sirve para imágenes chicas y acotadas (~200×200). No escala a screenshots de página completa ni a múltiples archivos por lead.
3. **La ausencia parece deliberada, no un olvido**: el comentario de `AvatarUploader` y el flujo de Netlify Drop apuntan a una decisión consciente de no depender de storage.

### No se pudo establecer

- Si hay un **plan escrito** de agregar storage a futuro (el relevamiento se limitó a código, schema, `package.json`, `next.config.ts` y nombres de env vars).
- Si alguna imagen sirve hoy desde `public/` (no se relevó ese directorio).

---

## 9 · R8 · El bypass de autenticación de QA

**Qué se preguntó.** ¿Hay un agujero de aislamiento latente antes de tocar nada?

### VEREDICTO

> **Alcanzable en producción: DEPENDE-DE-`QA_ALLOW_LOCALHOST`.**
>
> Con la configuración **presente y verificable en el repo: NO.** La variable no está en `netlify.toml`, no está en ningún `.env` trackeado, y sin ella **todos** los verbos devuelven `403 {"error":"forbidden","reason":"qa_flag_off"}` antes de tocar la DB o el JWT.
>
> Con la variable definida en el entorno del deploy: quedan **dos** guardas efectivas, y la única que depende del atacante es el header `Host`.
>
> **El código sí viaja al bundle de producción**, la ruta está **fuera** del matcher del proxy, y **no hay ningún test ni invariante que cubra el guard.**

### VISTO — el guard

Un único archivo: `src/app/api/qa/login/route.ts` (227 líneas), trackeado por git, con tres handlers (`POST`, `GET`, `DELETE`) detrás del mismo guard:

```ts
// route.ts:49-73
function tripleGuardCheck(request: NextRequest): GuardResult {
  if (process.env.QA_ALLOW_LOCALHOST !== '1') return { allowed: false, reason: 'qa_flag_off' }

  const host = request.headers.get('host') ?? ''
  const hostname = host.split(':')[0]?.toLowerCase() ?? ''
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
                   || hostname === '[::1]' || hostname === '::1'
  if (!isLocalhost) return { allowed: false, reason: 'host_not_localhost' }

  if (process.env.NETLIFY === 'true') return { allowed: false, reason: 'hosted_netlify' }
  if (process.env.VERCEL_ENV === 'production') return { allowed: false, reason: 'hosted_vercel_prod' }
  return { allowed: true }
}
```

**Variables involucradas (nombres, nunca valores):** `QA_ALLOW_LOCALHOST` (`route.ts:50`, gate primario, debe valer exactamente `'1'`) · `NETLIFY` (`:65`) · `VERCEL_ENV` (`:68`) · `AUTH_SECRET` (`:102`, **no es un gate**: se lee después del guard) · `NODE_ENV` (indirecto, vía `src/lib/auth-cookies.ts:19`).

`netlify.toml:5-7` (`[build.environment]`) declara solo `NODE_VERSION` y `NODE_OPTIONS` — **no setea `QA_ALLOW_LOCALHOST`**. El único `.env` trackeado por git es `.env.example`, donde la variable está **comentada y sin valor** (`.env.example:69`) y documentada como *"DEV/QA ONLY · NUNCA setear en prod"*.

### VISTO — el guard corre en REQUEST TIME, y eso es lo que importa

Extraído del **bundle compilado de producción** (`.next/server/app/api/qa/login/route.js`):

```js
function E(a){
  if("1"!==process.env.QA_ALLOW_LOCALHOST)return{allowed:!1,reason:"qa_flag_off"};
  let b=a.headers.get("host")??"",c=b.split(":")[0]?.toLowerCase()??"";
  return"localhost"!==c&&"127.0.0.1"!==c&&"[::1]"!==c&&"::1"!==c
    ?{allowed:!1,reason:"host_not_localhost"}
    :"true"===process.env.NETLIFY?{allowed:!1,reason:"hosted_netlify"}
    :"production"===process.env.VERCEL_ENV?{allowed:!1,reason:"hosted_vercel_prod"}
    :{allowed:!0}
}
```

Las tres lecturas siguen siendo `process.env.X` en runtime: **no fueron inlineadas ni tree-shakeadas.**

> **Consecuencia dura: basta con setear `QA_ALLOW_LOCALHOST=1` en el entorno de runtime de un deploy ya construido para que la pata 1 caiga. No hace falta rebuildear.**

**Contraste que prueba que la distinción es real, aportado por el verificador — y es la evidencia más fuerte del ítem.** En el mismo repo hay otra ruta dev-only, `src/app/api/dev/email-preview/executive-weekly/route.ts:106-108`, gateada con `if (process.env.NODE_ENV === 'production') return 404`. Enumerando los `process.env` sobrevivientes del bundle:

```
$ grep -o 'process\.env\.[A-Za-z_0-9]*' .next/server/app/api/qa/login/route.js | sort | uniq -c
   AUTH_SECRET · NETLIFY · NEXT_PHASE · QA_ALLOW_LOCALHOST · VERCEL_ENV
```

**`NODE_ENV` no aparece** — Next lo inlinea en build. O sea: **dos rutas dev-only en el mismo repo, una gateada con una constante congelada en build (inflippable en runtime) y la otra con una variable de runtime (flippable sin rebuild).**

### VISTO — el resto de la cadena

- **La ruta está compilada y registrada:** `.next/server/app/api/qa/login/route.js` existe; `.next/app-path-routes-manifest.json` contiene `"/api/qa/login/route"` y `"/api/qa/login"`.
- **Está FUERA del matcher del proxy.** No existe `src/middleware.ts`; el equivalente Next 16 es `src/proxy.ts:171-173`, y el matcher compilado en `.next/server/middleware.js` es `["/admin/:path*","/dashboard/:path*","/setter/:path*","/login","/bienvenida","/cambiar-password"]`. **`/api` no aparece.** El endpoint se auto-protege: no hay capa por encima.
- **Modo de fallo: `403`, no `404`,** y además dice qué pata falló (`reason` ∈ `qa_flag_off` | `host_not_localhost` | `hosted_netlify` | `hosted_vercel_prod`).
- **`next.config.ts` no tiene bloque `env: {}`** (leído completo, 217 líneas).

### VISTO — la cookie y la sesión

Nombre y `secure` los decide `NODE_ENV` vía `src/lib/auth-cookies.ts:19-30`, **congelado en build**. En producción: `__Secure-authjs.session-token`, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age=28800` (8 h). Verificado contra el bundle: el literal con prefijo está presente **1 vez**; el literal sin prefijo, **0 veces**.

**No puede montar un usuario arbitrario.** El body solo acepta 4 strings literales (`route.ts:75-82`) que mapean a 4 emails hardcodeados (`:36-43`); el email no viene del request, se usa como `where` de un `findUnique`. Si el usuario no existe → `404 persona_not_seeded`. El callback `jwt` de `src/auth.ts:205-231` re-deriva `role` desde la DB en cada request, así que el claim inyectado **no escala privilegios por sí solo**.

**La superficie real es "sesión completa de cualquiera de esas 4 cuentas seedeadas", incluida la de `SUPER_ADMIN`.**

> **Corrección del verificador:** el reporte marcaba `passwordResetRequired: false` (`route.ts:165`) como "forzado", presentándolo como propiedad durable de la sesión. **No sobrevive**: `src/auth.ts:230` hace `token.passwordResetRequired = accessState.passwordResetRequired`, re-derivado de la DB en el mismo bloque `shouldRefreshFromDb`. El valor forzado dura hasta la primera lectura de sesión.

### VISTO — dos huecos que el barrido inicial no tenía

**a) Un endpoint SIN NINGÚN guard que viaja a producción.** `src/app/api/test-sentry/route.ts`, archivo completo (5 líneas):

```ts
export async function GET() {
  throw new Error('Test Sentry — esto debería aparecer en el dashboard de Sentry')
}
```

Cero autenticación, cero gate de entorno, cero rate-limit. Trackeado por git, **compilado en el bundle de producción** (`.next/server/app/api/test-sentry/route.js`), y **fuera** del matcher del proxy. Es un generador de 500 no autenticado alcanzable por cualquiera.

**b) La segunda superficie de `QA_ALLOW_LOCALHOST` está PEOR guardada que la analizada.** `src/lib/security/validate-origin.ts:49`:

```ts
if (process.env.QA_ALLOW_LOCALHOST === '1' && (isLocalhost || !origin)) {
  return { allowed: true, reason: 'qa_allow_localhost' }
}
```

Sin chequeo de `Host`, sin chequeo de plataforma, y la condición `!origin` **la satisface un curl plano sin header `Origin`**. Si `QA_ALLOW_LOCALHOST=1` llegara al entorno de producción, la validación de origin del chatbot cae abierta de forma incondicional para todo el mundo, mientras que el endpoint de login todavía exigiría un `Host` spoofeado. **La variable de la que depende todo el veredicto abre una segunda puerta con una sola pata en vez de tres.**

### VISTO — cobertura de tests: NINGUNA

El invariante de seguridad declarado es `check:invariant:security` → `src/lib/security/idor-tokens.invariant.ts`. `grep -ic 'qa_allow|localhost'` sobre ese archivo → **0**, exit 1. Los strings `qa_flag_off|host_not_localhost|hosted_netlify|tripleGuardCheck` aparecen **solo** en `route.ts` en todo el repo. Los 3 hits de `api/qa/login` en `tests/`+`scripts/` son **comentarios**, ninguno un assert.

### INFERIDO

- **La pata 2 (`Host`) es la única controlable por el atacante**, y su fuerza depende del ruteo de la plataforma, no del código. Es *plausible* que el edge lo rechace antes, pero no está verificado y no es una propiedad del repo.
- **La pata 3 puede estar fallando abierta en Netlify.** `NETLIFY=true` es metadata de **build**; que esté en el runtime de la función serverless no se puede verificar desde el repo. El verificador agregó que `@netlify/plugin-nextjs` **ni siquiera está instalado localmente** (`netlify.toml:9-10` lo declara y Netlify lo resuelve en build), así que **no hay artefacto local que auditar**. Si Netlify no la propaga al runtime, el modelo real es de **dos** guardas, no tres.
- **El token QA omite `sessionVersion`** (`route.ts:155-166`), y `src/auth.ts:213-222` solo invalida si `typeof token.sessionVersion === 'number'`. En su **primer uso** el token es estructuralmente exento del chequeo de revocación: una cookie QA sobrevive a un reset de password que sí mata todas las sesiones reales del mismo usuario.
- **Las ramas IPv6 del guard son código muerto** (falla cerrada, sin impacto): `route.ts:55` hace `host.split(':')[0]`, así que con `Host: [::1]:3000` el split devuelve `'['` y con `Host: ::1` devuelve `''`. Ninguno iguala `'[::1]'` ni `'::1'`. El header del archivo (`route.ts:16`) promete los tres; funcionan dos.

### No se pudo establecer

1. **Si `QA_ALLOW_LOCALHOST` está definida en el entorno de producción real.** Vive en el panel de Netlify/Vercel, fuera del repo. Se verificó todo lo verificable: no está en `netlify.toml`, no está en `vercel.json`, no está en ningún `.env` trackeado.
2. **Si `NETLIFY` está presente en el runtime de la función.** Requiere un deploy de prueba.
3. **Comportamiento real del edge ante un `Host: localhost` spoofeado.** Requiere probar contra el deploy vivo.
4. **Cuál de los dos targets es el deploy real.** *Corrección del verificador:* el reporte decía "nada en el repo desambigua", y es demasiado fuerte. `netlify.toml:1-3` y `:9-10` declaran comando de build, directorio de publicación y el plugin de runtime de Next; `vercel.json` (16 líneas, leído completo) declara **únicamente tres `crons`**, sin build/framework/output. No prueba dónde corre prod, pero **el repo está configurado para buildear en Netlify y solo agenda crons en Vercel.** Importa porque la pata 3 no cubre Vercel *preview*.

---

## 10 · R9 · El censo real de pantallas de la superficie del setter

**Qué se preguntó.** El inventario verdadero contra el cual decidir la poda.

### VISTO — los archivos de convención: 14

La superficie es `src/app/(protected)/setter/`. **No existe** `src/app/(protected)/layout.tsx`: el grupo agrupa `admin/`, `dashboard/` y `setter/`, cada uno con su layout.

```
$ find "src/app/(protected)/setter" -type f \( -name page.tsx -o -name layout.tsx \
    -o -name loading.tsx -o -name error.tsx -o -name not-found.tsx \
    -o -name default.tsx -o -name template.tsx -o -name route.ts \) | sort | nl
 1  setter/error.tsx                          8  setter/leads/[leadId]/manual/page.tsx
 2  setter/layout.tsx                         9  setter/leads/[leadId]/page.tsx
 3  setter/leads/[leadId]/error.tsx          10  setter/loading.tsx
 4  setter/leads/[leadId]/loading.tsx        11  setter/not-found.tsx
 5  setter/leads/[leadId]/manual/[paso]/page.tsx   12  setter/nuevo/importar/page.tsx
 6  setter/leads/[leadId]/manual/error.tsx   13  setter/nuevo/page.tsx
 7  setter/leads/[leadId]/manual/loading.tsx 14  setter/page.tsx
```

**Cero `default.tsx`, cero `template.tsx`, cero `route.ts`.**

> *Precisión del verificador:* "el setter no tiene API propia" es cierto **dentro de `(protected)/setter/`**. La maquinaria LeadOS sí tiene endpoint: `src/app/api/cron/os-follow-up/route.ts`. No es pantalla del setter, pero la frase generalizaba de más.

### VISTO — tabla completa de rutas

Grupo `(protected)` no aparece en la URL; `[leadId]` y `[paso]` resueltos. Todas bajo el route-guard de `src/proxy.ts:117` / `:125` y bloqueadas en `src/app/robots.ts:15`.

| URL | archivo:línea | tipo | m-id | link entrante |
|---|---|---|---|---|
| *(sin URL — shell)* | `setter/layout.tsx:19` | utilitaria (gate de rol `:32`, badge `:39`) | — | n/a |
| `/setter` | `setter/page.tsx:27` | superficie del panel | — | `layout.tsx:45,62`, `setter-nav.tsx:30`, `not-found.tsx:15`, `leads/[leadId]/error.tsx:53`, `manual/error.tsx:48`, `manual-nav.tsx:70`, `archivo-manual.tsx:61`, `login/actions.ts:105`, `proxy.ts:124` |
| `/setter` *(loading/error/not-found)* | `loading.tsx:11`, `error.tsx:19`, `not-found.tsx:8` | estado ×3 | — | `notFound()` desde `manual/page.tsx:20` y `manual/[paso]/page.tsx:55` |
| `/setter/nuevo` | `nuevo/page.tsx:16` | **recorrido — entrada: alta individual** | **NO** | `setter-nav.tsx:58`, `home-empty.tsx:19`, `home-en-espera.tsx:92`, `nuevo/importar/page.tsx:30` |
| `/setter/nuevo/importar` | `nuevo/importar/page.tsx:14` | **recorrido — entrada: importación CSV** | **NO** | `nuevo/page.tsx:39`, `home-empty.tsx:22` |
| `/setter/leads/<leadId>` | `leads/[leadId]/page.tsx:21` | **utilitaria (redirect puro)** → `/manual` (`:23`) | — | `home-sections.tsx:68`, `foco-surface.tsx:85`, `novedades-abrir-foco.tsx:30`, `nuevo-prospecto-form.tsx:98` (los 4 por template string) |
| `/setter/leads/<leadId>` *(loading/error)* | `loading.tsx:9`, `error.tsx:22` | estado ×2 | — | n/a |
| `/setter/leads/<leadId>/manual` | `manual/page.tsx:16` | **utilitaria (redirect derivado)** → `rutaManual(leadId, posicion.actual)` (`:21`) | — | **SOLO** el `redirect()` de `leads/[leadId]/page.tsx:23` |
| `/setter/leads/<leadId>/manual` *(loading/error)* | `loading.tsx:8`, `error.tsx:17` | estado ×2 | — | n/a |
| `/setter/leads/<leadId>/manual/<paso>` | `manual/[paso]/page.tsx:52` (**373 líneas**) | **20 pantallas en 1 archivo** | m1–m16 + mr + 3 estados | ver abajo |

**6 patrones de URL · 23 pantallas renderizadas distintas · 2 redirects puros · 7 boundaries de estado · 1 layout.**

### VISTO — los 20 valores de `[paso]`

Fuente única: `src/lib/leados/manual.ts`. `PANTALLA_IDS` (`:41-62`) declara los 20; `PANTALLAS` (`:137-292`) les da tipo, título y fase. **`guidance-content.ts` no contiene el registro** — está indexado por fase, no por m-id.

| paso | archivo:línea | tipo | título (copy real) |
|---|---|---|---|
| `m1` | `manual.ts:142` | manual · `ficha` | Cargá los datos del negocio |
| `m2` | `:150` | manual · `evaluacion` | Llevá la ficha al Evaluador |
| `m3` | `:158` | manual · `evaluacion` | Registrá el veredicto |
| `m4` | `:166` | manual · `opener` | Mandá el opener |
| `m5` | `:174` | manual · `seguimiento` | Registrá lo que pasó |
| `m6` | `:182` | manual · `brief` | Armá el brief |
| `m7`–`m12` | `:190-225` → `flow-content.ts:53-103` | manual · `construccion` | Estructura · Personalización · Assets reales · CTA de WhatsApp · Calidad y motion · Mobile |
| `m13` | `:232` | manual · `borrador` | Publicá y registrá el link del borrador |
| `m14` | `:240` | manual · `chequeo` | Pasá los checks duros |
| `m15` | `:248` | manual · `envio` | Mandá el link al negocio |
| `m16` | `:256` | manual · `agenda` | Agendá la reunión |
| `mr` | `:264` | **reentrada** · `construccion` | Aplicá las correcciones de Franco |
| `espera` | `:272` | **estado** | Esperando respuesta |
| `revision` | `:280` | **estado** | Franco está revisando tu demo |
| `archivo` | `:288` | **estado** | Este negocio quedó cerrado |

**Los 20 comparten un único archivo de ruta.** `manual/[paso]/page.tsx:144-358` es una cadena de ternarios anidados de ~215 líneas que elige los tres slots (`contexto`/`municion`/`captura`) por `pantalla.id`.

### VISTO — qué corresponde a `m1`–`m16` y qué NO

**Corresponde:** los 16 valores `m1`…`m16`. Nada más.

**NO aparece en el esquema:** `/setter` (hub) · `/setter/nuevo` (entrada previa a m1) · `/setter/nuevo/importar` · `mr` (`tipo: 'reentrada'`) · `espera`/`revision`/`archivo` (`tipo: 'estado'`, `fase: null`) · los 7 boundaries · los 2 redirects puros · **el historial/timeline del lead**.

### VISTO — rutas alcanzables solo por navegación directa

**No hay ninguna huérfana en sentido estricto** — las 6 URLs tienen origen. Matices que importan para la poda:

1. **`/setter/leads/<id>/manual` (el índice) tiene CERO links de UI.** Su único origen en todo `src/` es el `redirect()` de `leads/[leadId]/page.tsx:23`.
   > *Corrección del verificador:* el relevamiento sostenía esto con *"`grep -rn "/manual"` → 1 sola ocurrencia"*. Son **19**. La conclusión se sostiene (la única que produce la URL cruda es ese redirect; las demás son imports o internals), pero la evidencia como estaba escrita era falsa.
2. **`mr`, `espera`, `revision` y `archivo` no tienen ningún link ESTÁTICAMENTE NOMBRADO.** Se alcanzan porque `derivarPantalla` (`manual.ts:609`) los devuelve como `posicion.actual` y el índice redirige ahí.
   > *Corrección del verificador:* decir "CERO links" a secas es demasiado fuerte. `pantalla-manual.tsx:146-162` renderiza un `<Link href={rutaManual(leadId, posicion.actual)}>` («Ir a tu paso actual») bajo la guarda `!esActual`, y `posicion.actual` puede ser cualquiera de los cuatro. **Redacción correcta: cero links estáticamente nombrados; un link dinámico que resuelve a los cuatro.**
3. **Escribir la URL a mano no sirve como puerta de atrás.** La guardia es del servidor (`manual/[paso]/page.tsx:55-63`): lead ajeno/inexistente → `notFound()`; id desconocido → redirect a la actual; pantalla ni completada ni habilitada → redirect a la actual.
4. **Todos los links a un lead apuntan a la raíz** `/setter/leads/<id>`, **nunca a un `[paso]` concreto**. Patrón: una sola puerta; la pantalla la elige el servidor.

### VISTO — el inventario de 16 pantallas del brief NO EXISTE en el repo

**Éste es el hallazgo que más pesa sobre lo que sigue.**

- El brief commiteado es `docs/BRIEF-VISION-FLUJO-SETTER-v3.md` (commit `e06e3c4`). **Tiene 193 líneas y 11 secciones**: §1 Para qué existe · §2 Quién la usa · §3 El recorrido · §4 Reglas inviolables · §5 Qué hace que una demo se rechace · §6 Restricciones de diseño · §7 Qué se elimina del v2 · §8 Qué se agrega · §9 Qué queda fuera · §10 Números de realidad · §11 Cómo se adopta. **No contiene ninguna tabla de pantallas.**
- `docs/HANDOFF-LEADOS-CIERRE.md:56` afirma que el brief contiene *"inventario de las 16 pantallas con su destino"* en su §9, y `:81` pide validar *"§9 — la columna «destino» de las 16 pantallas"*. **El §9 del brief commiteado es "Qué queda fuera · DIFERIDO".** El handoff también cita §12, §18, §20.1, §21, §22 y §23 — **ninguna existe en el archivo.**

**DIFF explícito · en el código y en NINGÚN inventario documental:** `/setter/nuevo` · `/setter/nuevo/importar` · el historial/timeline · `archivo` como pantalla (está en el código y en `MAPA-LEADOS.md`, no en el smoke-test) · los 7 boundaries y los 2 redirects.
**En algún inventario documental y NO en el código:** nada.

### VISTO — las tres ausencias conocidas: confirmadas

| Ausencia | ¿Existe en el código? | Ruta / archivo |
|---|---|---|
| **Alta de lead** | **SÍ** | `/setter/nuevo` — `setter/nuevo/page.tsx:16` + `nuevo-prospecto-form.tsx` |
| **Importación masiva** | **SÍ** | `/setter/nuevo/importar` — `nuevo/importar/page.tsx:14` + `importar-prospectos-form.tsx` |
| **Historial / timeline** | **Componente, NO ruta** | `manual/_components/historial-lead.tsx:14` (`<details>` colapsable) → `_components/lead-timeline.tsx:62`. Se renderiza al pie de **todas** las pantallas de `[paso]` (`manual/[paso]/page.tsx:84,100,113,370`) |

Las dos primeras son rutas reales y navegables; la tercera **nunca fue una pantalla** — es una sección plegable sin URL propia, imposible de deep-linkear.

### INFERIDO

- La poda que se apoye en "las 16 pantallas" **va a subestimar la superficie en 7 pantallas renderizadas** (home, alta, importar, `mr`, y los 3 estados) más 9 archivos de infraestructura de ruta.
- **Partir** una pantalla del manual es barato a nivel routing (un `case` más en el ternario + una entrada en `PANTALLAS`); **eliminar** una obliga a tocar también `completadasDe` (`manual.ts:425`) y `posicionDe` (`manual.ts:482`), que son exhaustivos con never-guard.
- El "inventario de 16 pantallas con destino" que el handoff cita **vive fuera del repo**; lo que se commiteó es una versión recortada. No se pudo verificar el original: no está en el historial (`git log --all` sobre `docs/BRIEF*` no muestra otra versión).

### No se pudo establecer

- **No se corrió `npm run build`** durante el censo (escribe en `.next/` y otra sesión estaba activa). El censo se apoya en la convención de archivos del App Router, que es determinista.
- **Nada en runtime.** Ninguna URL fue abierta.
- **Los estados internos de cada pantalla** (variaciones por `stage`/`status`). La galería los cifra en 37; verificarlo exige `npm run galeria`.
  > *Corrección del verificador:* `docs/manual-usuario/galeria/INDICE.md:8` y `:169` declaran "37 estados", pero la tabla numera filas 01–36 y solo 35 matchean el patrón de fila. El número citado no cuadra con el propio archivo.
- **La superficie de admin no se censó** (`/admin/leados`, `/admin/leados/[leadId]`, `/admin/leados/setter/[setterId]`, `/admin/fg2-lab`). Opera sobre los mismos leads, fuera del alcance de R9.
- *Fuera de scope pero relevante (verificador):* `/cambiar-password` es alcanzable por un setter (`proxy.ts:172` la incluye en el matcher y la rama SETTER de `proxy.ts:117-121` la deja pasar), aunque `login/actions.ts:102-108` manda al setter a `/setter` sin mirar `passwordResetRequired`. Y `src/app/(protected)/setter/leads/` **no tiene `page.tsx`**: `/setter/leads` es un segmento pelado que cae en `setter/not-found.tsx`.

---

## 11 · R10 · Drift de schema de Prisma

**Qué se preguntó.** Se detectó que habría columnas en la base que el schema ya no declara, con `migrate status` verde igual. ¿El drift bloquea alguna migración futura del recorrido nuevo?

### VISTO — `migrate status`: verde, exit 0

```
$ npx prisma migrate status          EXIT_CODE=0
Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech"
86 migrations found in prisma/migrations
Database schema is up to date!
```

### VISTO — `migrate diff` en ambas direcciones: VACÍO

```
$ npx prisma migrate diff --from-schema-datasource prisma/schema.prisma \
    --to-schema-datamodel prisma/schema.prisma --script        EXIT_CODE=0
-- This is an empty migration.

$ npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma \
    --to-schema-datasource prisma/schema.prisma --script        EXIT_CODE=0
-- This is an empty migration.
```

*(La combinación de flags del encargo funciona tal cual en Prisma 6.19.3. `--script` **imprime** SQL, no lo aplica.)*

**Test de control — el diff no está mintiendo.** Se diffeó la base real contra una copia de `schema.prisma` en el scratchpad con una columna inventada:

```sql
-- AlterTable
ALTER TABLE "OsLead" ADD COLUMN     "zzControlProbe" TEXT;
```

El diff sí llega a la base y sí detecta diferencias ⇒ **los dos "empty migration" son reales.**

### VISTO — inventario base vs schema

| Dimensión | En la base (`public`) | En el schema | Diferencia |
|---|---|---|---|
| Tablas base (sin `_prisma_migrations`) | 63 | 63 | **0** |
| Vistas | 0 | 0 | 0 |
| Enums | 62 | 62 | **0** (y 0 con labels distintos) |

**Tabla de objetos desalineados dentro de `public`: ninguna fila.** Ambas listas salieron vacías.

Verificación columna por columna de las 6 tablas del recorrido setter (ninguna usa `@@map`, nombre físico = nombre de modelo): `OsLead` 20/20 · `OsLeadSetterMeta` 8/8 · `OsSetterNotice` 8/8 · `OsLeadActivity` 7/7 · `OsDemo` 9/9 · `OsLeadDossier` 18/18. **Todas coinciden.**

También se descartó drift en objetos que `migrate diff` no modela: **0 triggers, 0 funciones, 0 tablas con RLS, 0 check constraints** en `public`; única extensión: `plpgsql`.

### VISTO — DÓNDE ESTÁ EL DRIFT REALMENTE: el schema `prisma_shadow`

La base `neondb` tiene **dos** schemas Postgres: `public` y **`prisma_shadow`**.

`prisma_shadow` es una **shadow database fosilizada**: 32 tablas base, 21 enums, 100 objetos en `pg_class`, con su propio `_prisma_migrations` congelado en **12 filas**, la última terminada el **2026-04-03**. Se quedó en la migración 12 de 86 y nunca más se tocó.

Tablas que existen ahí y que el datamodel ya no declara:

| Objeto | Dónde vive | Quién lo dropeó de `public` |
|---|---|---|
| `OsProject` | `prisma_shadow` únicamente | `migrations/20260406040000_v2-cleanup-deprecated-models/migration.sql:2` |
| `OsTask` | `prisma_shadow` únicamente | ídem `:1` |
| `ModulePricing` | `prisma_shadow` únicamente | `migrations/20260420000000_baseline_premium_modules/migration.sql:4` |

Verificado que las tres **no** existen en `public` y que no aparecen en `prisma/schema.prisma`.

**Por qué `migrate status` da verde igual:** el bloque datasource (`schema.prisma:5-8`) es solo `provider` + `url = env("DATABASE_URL")`, **sin `schemas`, sin `directUrl`, sin `shadowDatabaseUrl`**. Prisma gestiona únicamente `public` (así lo declara su propia salida). Todo lo que vive en `prisma_shadow` le es invisible.

### VISTO — el historial de migraciones

- **86 directorios = 86 filas.** Última aplicada: `20260710203413_add_portal_indexes` (2026-07-16).
- **0 fallidas** (`finished_at IS NULL`) y **0 rolled back**.
- **PERO: 8 migraciones tienen `applied_steps_count = 0` con `started_at == finished_at`** — firma de `migrate resolve --applied` (marcadas como aplicadas **sin ejecutar su SQL**). No son migraciones vacías: sus archivos tienen SQL real.

| Migración marcada aplicada sin ejecutar | bytes | líneas SQL |
|---|---|---|
| `20260327013000_add_lead_status_notes` | 107 | 3 |
| `20260327120000_add_agency_settings_and_module_pricing` | 1012 | 26 |
| `20260403170000_reconcile_existing_schema` | 6310 | 109 |
| `20260406113000_allow_internal_projects_without_organization` | 1728 | 68 |
| `20260420000000_baseline_premium_modules` | 2426 | 45 |
| **`20260619160000_add_os_lead_setter_meta`** | 1476 | 16 |
| **`20260620180000_add_dossier_escalado`** | 454 | 2 |
| **`20260620190000_add_setter_novedades`** | 1558 | 16 |

**Las tres en negrita son del recorrido del setter.** Sus objetos existen físicamente en `public` — se crearon fuera de la migración y después se resolvió el registro. Su SQL **no es idempotente**: `CREATE TABLE`, `CREATE TYPE`, `ALTER TABLE ADD COLUMN` sin `IF NOT EXISTS`.

### VEREDICTO: el drift NO toca tablas de la poda y NO bloquea `migrate deploy`

| Pregunta | Respuesta |
|---|---|
| ¿Objetos desalineados en las 6 tablas del setter? | **NO** — 0 diferencias, verificado columna por columna |
| ¿Los fósiles de `prisma_shadow` son tablas del setter? | **NO** — `OsProject`/`OsTask` eran los modelos pre-v2 unificados en `Project`/`Task`; `ModulePricing` es pricing de módulos |

### INFERIDO

- **Por el camino de `migrate deploy`, el drift no bloquea nada.** `public` coincide exactamente con el datamodel, no hay pendientes ni fallidas ni rolled back. Una migración nueva se aplicaría limpia.
- **El riesgo residual está en `migrate dev`, no en el drift.** `migrate dev` replica las 86 migraciones sobre una shadow desde cero; las 8 marcadas sin ejecutar nunca demostraron replicar, y las 3 del setter no son idempotentes. **`migrate dev` está prohibido por regla del repo.**
- **`prisma_shadow` solo mordería si alguien apuntara un `shadowDatabaseUrl` ahí** (Prisma exige shadow vacía). Hoy el datasource no lo declara.
- **El origen probable del reporte "hay columnas que el schema ya no declara" es justamente `prisma_shadow`**: quien mire la base con un cliente SQL genérico ve `OsProject`/`OsTask`/`ModulePricing` sin notar que están en otro schema Postgres.

### No se pudo establecer

- **Si las 86 migraciones replican limpio desde cero.** Exige `migrate diff --from-migrations … --shadow-database-url …`, que **escribe** en la base. Fuera del alcance read-only.
- **Si existe drift en OTRA base** (producción u otro lane). Solo se relevó el único `DATABASE_URL` resuelto.
- **Por qué las 8 quedaron con 0 steps.** El registro guarda el hecho, no la intención.

---

## 12 · Prueba de inocuidad de R4

Las dos salidas de git pedidas por el paso 7, tomadas en el checkout principal después de restaurar:

```
$ git status --porcelain
[fin de porcelain — sin una sola línea]

$ git rev-parse HEAD
11eee1b49d774b885a50f54ea0b52beb043ea772

--- commit anotado en el paso 2 ---
11eee1b49d774b885a50f54ea0b52beb043ea772
```

**Coinciden.** Verificaciones adicionales de la misma corrida:

```
$ git rev-parse --abbrev-ref HEAD
redesign/home                                    ← nunca cambió de rama

$ git hash-object logic-core-v3/src/lib/leados/contracts.ts
22aba75447744ea0107bfff9dd0b73e100f96866
$ git rev-parse HEAD:logic-core-v3/src/lib/leados/contracts.ts
22aba75447744ea0107bfff9dd0b73e100f96866         ← blob idéntico, byte a byte

$ sed -n '104,112p' logic-core-v3/src/lib/leados/contracts.ts
export const FASE_IDS = [
  'estructura', 'personalizacion', 'assets', 'cta', 'calidad', 'mobile',
] as const                                       ← las 6 originales

$ git branch --list 'probe/*'
(vacío)                                          ← rama descartable borrada

$ git worktree list | grep fase-ids
(sin coincidencias)                              ← worktree desmontado
```

Salidas del desmontaje:
```
Updated 1 path from the index                    ← git checkout . en el worktree
remove exit=0
Deleted branch probe/fase-ids-descartable (was 11eee1b).
branch -D exit=0
node_modules real ANTES: 764 entradas
node_modules real DESPUES: 764 entradas
INTACTO                                          ← la junction se removió sin seguirla
```

**No se commiteó nada en la rama descartable. No se pusheó nada, en ninguna rama, en ningún momento.**

### `git diff --stat` final

```
$ git diff --cached --stat
 logic-core-v3/docs/bitacora-beta-3.md    |   68 ++
 logic-core-v3/docs/probe-poda-terreno.md | 1172 ++++++++++++++++++++++++++++++
 2 files changed, 1240 insertions(+)

$ git status --porcelain
M  logic-core-v3/docs/bitacora-beta-3.md
A  logic-core-v3/docs/probe-poda-terreno.md
```

**Cero código, cero tests, cero configuración.** Son dos archivos y ambos son docs: este reporte más la
entrada de bitácora que el DoD pide por separado. El DoD pedía literalmente *"solo
`docs/probe-poda-terreno.md`"* y, en el mismo párrafo, una entrada en `docs/bitacora-beta-3.md`; se
resolvió con **un solo commit** que contiene exactamente esos dos, y se declara acá para que no haya
que deducirlo del log. El único archivo de código tocado en toda la corrida (`contracts.ts`) vivió y
murió dentro del worktree descartable — su blob en el checkout principal es idéntico al de HEAD.

---

## 13 · Lo que encontré y nadie preguntó

Hallazgo y ubicación. Sin proponer soluciones.

### Del terreno y la concurrencia

1. **Otra sesión trabaja sobre este mismo checkout, en paralelo.** HEAD se movió `e06e3c4` → `11eee1b` durante la corrida; `.next` fue vaciado a las 01:53; hay **8 worktrees** activos sobre el mismo `.git` (`git worktree list`), tres de ellos de sesiones de agente: `.claude/worktrees/priceless-nobel-ed8d02`, `sad-burnell-2f5e2d`, `funny-williams-001d41`.
2. **Los tres worktrees de `.claude/worktrees/` contaminan cualquier `grep -r` de filesystem.** Contienen copias completas y **viejas** del árbol: `contieneLink` aparece ahí en `flow.ts:192` (dos de ellos) y `flow.ts:205` (uno), `opener-form.tsx:35` en vez de `:36`, y hasta un `opener-step.tsx:13,128` que **ya no existe en `src`**. `git grep` los ignora; un `rg` crudo devuelve **números de línea falsos**. Un grep de `'sin link'` devolvió 212 líneas, ~100 de ellas duplicados de esos worktrees.
3. **Los remote-tracking refs están congelados.** `.git/FETCH_HEAD` fechado 2026-07-30 19:07:51 -0300, ~30 h atrás.
4. **10 ramas locales nunca se pushearon** — su contenido existe solo en este disco: `b2-s1-bot-sync-surface`, `chore/wf-home`, las 4 `claude/*`, `experimento/estetica-goal`, `leados/b8a-hardening`, `leados/b8a-ii`, `leados/b8a-iii`, `main-backup-pre-b8a`.
5. **`b1-s1-bsp-inbound` trackea un upstream con otro nombre:** `origin/b0-isolation-motor-chatbot`. El branch remoto `origin/b1-s1-bsp-inbound` no existe.
6. **`redesign/home` agrega un binario de 1,68 MB al repo:** `logic-core-v3/public/hdri/studio_small_03_1k.hdr` (1.680.234 bytes).
7. **`redesign/home` cambia la tabla de accent colors de `CLAUDE.md`** (AI Violet→Emerald, Automation Green→Amber, Software Amber→Violet, con la nota "verificado contra globals.css y las landings"). Quien lea `CLAUDE.md` desde `main` u `origin/main` tiene la asignación vieja, marcada como "do not change".

### De la vara de la poda

8. **La vara no está en el repo.** `docs/HANDOFF-LEADOS-CIERRE.md:56` y `:81` afirman que `BRIEF-VISION-FLUJO-SETTER-v3.md` contiene el *"inventario de las 16 pantallas con su destino"* en su §9. El archivo commiteado tiene 11 secciones y su §9 es *"Qué queda fuera · DIFERIDO"*. El handoff cita además §12, §18, §20.1, §21, §22 y §23 — **ninguna existe**. El commit `e06e3c4` se hizo justamente *"para que el agente que ejecute la poda pueda leer su propia vara"*, y la vara que llegó es otra.
9. **`AUDITORIA-VS-BRIEF-2026-07.md` (raíz del repo, 393 líneas) está obsoleta y sin marca.** Audita el brief **v2** contra el wizard de página larga (`lead-wizard.tsx`, 9 steps) retirado en el corte 5.6. Todas sus referencias a `*-step.tsx` apuntan a archivos que ya no existen (ej. `:259` cita `opener-step.tsx:128` y `:230-237`).
10. **`docs/metodo/MAPA-LEADOS.md:404-405` afirma que el brief de visión "no existe en el repo".** Quedó obsoleto con `e06e3c4`.
11. **Cero cobertura visual y documental de las dos pantallas de alta.** La galería de estados (`docs/manual-usuario/galeria/INDICE.md`) no tiene ninguna fila para `/setter/nuevo` ni `/setter/nuevo/importar`; el manual de usuario tampoco les dedica capítulo (solo menciona el botón del rail en `01-tu-panel.md:114`).
12. **A-27 sigue abierto:** `/setter/nuevo` y `/setter/nuevo/importar` **no tienen `error.tsx` ni `loading.tsx` propios**. Levantado el 2026-07-02 en `AUDITORIA-VS-BRIEF-2026-07.md:269-272`.
13. **Inconsistencia de conteo en la galería:** `INDICE.md:8` y `:169` declaran "37 estados" pero la tabla numera filas 01–36 y solo 35 matchean el patrón de fila.
14. **Monolito de ruta:** las 20 pantallas viven en `manual/[paso]/page.tsx` (373 líneas), cuyo cuerpo `:144-358` es una cadena de ternarios anidados de ~215 líneas.
15. **Contradicción con `CLAUDE.md`:** `setter/_components/setter-nav.tsx:38` declara *"Navegación SOLO por triggerTransition (decisión cerrada · CLAUDE.md)"* y navega el portal con `triggerTransition()` (`:42,:58,:90`). `CLAUDE.md` dice lo contrario: `triggerTransition` es del sitio público y *"no aplica en portales (el Shutter no existe ahí)"*. Ya anotado en `MAPA-LEADOS.md:413-414`.

### De seguridad

16. **`src/app/api/test-sentry/route.ts` — endpoint sin ningún guard, en producción.** 5 líneas, `export async function GET() { throw new Error(...) }`. Cero auth, cero gate de entorno, cero rate-limit. Trackeado, compilado al bundle de prod, fuera del matcher del proxy. Generador de 500 no autenticado.
17. **`src/lib/security/validate-origin.ts:49` — la segunda superficie de `QA_ALLOW_LOCALHOST`, con una sola pata.** Sin chequeo de `Host`, sin chequeo de plataforma, y la condición `!origin` la satisface un curl plano sin header `Origin`.
18. **`src/lib/impersonation.ts:14-22` — `getSecret()` cae a un string literal hardcodeado en el código fuente** cuando `IMPERSONATION_SECRET`, `AUTH_SECRET` y `NEXTAUTH_SECRET` están las tres ausentes. Ese fallback firma y verifica los tokens de impersonation. No lanza ni falla ruidoso.
19. **El token QA es exento del chequeo de revocación en su primer uso** (`route.ts:155-166` no incluye `sessionVersion`; `src/auth.ts:213-222` solo invalida si el claim es `number`).
20. **El 403 del guard filtra qué pata falló** (`route.ts:87`, `reason` ∈ 4 valores). Un escaneo externo distingue "endpoint existe pero flag apagado" de "flag prendido, host mal". Y el `GET`, una vez pasado el guard, **enumera los 4 emails de las personas seedeadas**.
21. **`.next/server/middleware-manifest.json` está vacío** (`{"version":3,"middleware":{},...}`) aunque el proxy SÍ está compilado en `.next/server/middleware.js`. Cualquier herramienta que lea ese manifest para afirmar el matcher concluirá, falsamente, que no hay middleware.
22. **`'/api/'` dentro de `ALWAYS_ALLOWED` (`src/proxy.ts:68`) es código muerto** — el matcher nunca envía un `/api/*` a ese handler.
23. **`src/actions/agency-actions.ts:94-110` (`createClientAssetAction`) no valida inputs con Zod.** Recibe `{ name, url, type, description }` y los escribe directo a `prisma.clientAsset.create`. Único control: `session?.user?.role !== 'SUPER_ADMIN'`. Contrasta con el resto del repo.
24. **La CSP global está en modo report-only** (`next.config.ts:47-48`), con un comentario que dice endurecerla tras 1-2 semanas de auditoría.

### De build y suites

25. **`next.config.ts:10-15` — `typescript.ignoreBuildErrors: true` y `eslint.ignoreDuringBuilds: true`.** El build de producción no falla ante errores de tipo ni de lint. **Esto es lo que desarma el guardián de R4**: los 4/16 errores de tsc que detectan el achique de `FASE_IDS` no frenan un deploy.
26. **`next.config.ts` conserva una clave `eslint` que Next 16 ya no soporta.** Cada build emite `⚠ 'eslint' configuration in next.config.ts is no longer supported` + `⚠ Unrecognized key(s) in object: 'eslint'`.
27. **~20 scripts `check:invariant:*` existen y ningún agregador los corre** (`package.json:59-78`): lead-scoring, dates-ar, lead-status, home-metrics, lead-detail, recommendations, gbp-connection, modules, motor-resenas-view, upsell-dedup, announcements, referrals, client-notifications, executive-report-plan, executive-report-prefs, brief-input, client-monthly-report, client-monthly-report-pdf, notifications-brevo, mask-secret.
28. **Los 19 scripts de invariantes del módulo chatbot/motor tampoco tienen agregador** (`package.json:35-53`). Correrlos exige invocar los 19 a mano.
29. **Los invariantes corren bajo type-stripping de Node, sin type-check.** Medido en R4: con `FASE_IDS` en 4, `tsc` reporta errores en `manual.ts:218,225` y `check:invariant:manual` **pasa igual (exit 0)**. La salida lo delata: *"Module type of file … is not specified and it doesn't parse as CommonJS. Reparsing as ES module"*. La suite de invariantes **no da ninguna señal de tipos**.
30. **`playwright.setter.config.ts:60` usa `reuseExistingServer: !process.env.CI`.** Si queda un `next start` huérfano en `:3001`, la suite lo reutiliza **en silencio** y los 60 tests corren contra un build viejo, sin aviso en el reporte.
31. **La suite del panel no es re-ejecutable barata:** su `webServer` corre `npm run start:qa` = `npm run build && next start -p 3001` (`package.json:11`). Cada corrida incluye un `next build` completo.
32. **Selectores muertos en dos specs:** `tests/qa-walkthrough/corrida-1.spec.ts:163` ancla en `page.locator('[data-lead-wizard]')` y `tests/qa-persona/corrida-1-novato-frio.spec.ts:138` en `[data-step="opener"]`. `git grep` de ambos sobre `src` → **cero hits**. Esos specs no pueden estar pasando contra el UI actual.
33. **El comentario de `playwright.setter.config.ts:14-15` afirma "no hay `.env`", pero sí existe y se carga.** `prisma migrate status` imprime `injected env (9) from .env.local` seguido de `injected env (8) from .env`.
34. **Comentario stale en `tests/helpers/setter-auth.ts:8-17`:** afirma que `/api/qa/login` *"nombra el cookie por el PROTOCOLO del request"* y lo llama "bug del route para prod-sobre-http". Falso contra el código actual (`route.ts:148` usa `SESSION_COOKIE_NAME`, que decide por `NODE_ENV`). El helper mantiene una copia paralela del minteo de JWT justificada por un bug que ya no existe.

### De datos y contratos

35. **`contieneLink` no tiene test unitario.** El regex —la pieza con más superficie de falso positivo— se ejerce solo indirectamente vía 2 tests e2e de UI.
36. **Dos schemas del mismo flujo con reglas opuestas sobre URLs:** el link está **prohibido** en el opener (`outreach.schemas.ts:40`) y es **obligatorio** en el borrador (`dossier.schemas.ts:73-74` y `admin/leados/_actions/revision.schemas.ts:18`, ambos exigen `https://`).
37. **El campo `marcadas` del contrato de progreso no tiene ningún productor.** `contracts.ts:126` lo define (timestamp ISO por fase); `grep -rn 'marcadas' src/` solo lo encuentra en el schema, en el invariante y en un homónimo no relacionado. El helper de siembra escribe solo `{ completadas }`. **El dato de diagnóstico que el contrato define nunca se está guardando.**
38. **Lectura muerta con costo de DB en cada escritura:** `estadoToque()` (`outreach.actions.ts:70-79`) ejecuta `contarDmsHoy` en **toda** llamada a `registrarOpener` (`:133`) y `registrarResultado` (`:199`) y devuelve `dmsHoy` en el payload — **y ningún cliente lo lee**. Es un `COUNT` extra por cada toque registrado cuyo resultado se descarta.
39. **Offset de timezone hardcodeado junto a la IANA zone:** `limitesDelDiaArgentino` (`outreach.ts:21-33`) deriva la fecha con `America/Argentina/Buenos_Aires` pero arma los bordes con el literal `-03:00`. Dos fuentes de verdad que divergen si Argentina reinstaura horario de verano.
40. **Ventana casi-cerrada:** `lte` sobre `23:59:59.999` (`outreach.ts:31,65`). Postgres guarda microsegundos; una fila creada a las 23:59:59.9995 cae fuera del conteo.
41. **Drift de comentario sobre el criterio del contador:** `outreach.ts:56-57` lo describe correcto ("DMs de Instagram"), pero `manual/_data.ts:113` lo anota como "DMs **comerciales** de hoy del setter" — conjunto más amplio. Hoy coinciden por accidente porque el setter solo escribe `INSTAGRAM_DM`.
42. **El `channel` del setter está hardcodeado en tres write-paths con el mismo literal, sin constante compartida:** `outreach.actions.ts:125`, `:187`, `agenda.actions.ts:241`.
43. **La DB de dev no refleja el estado canónico del seed.** `M0-GAL 14-m7-tilde-deshabilitado` está en `CONSTRUCCION` con 1 fase, pero el seed lo siembra en `BRIEF` sin progreso (`m0-galeria-seed.ts:180`). Mismo patrón en `M0-GAL 21-m13-borrador-vacio` (seed lo pone en CONSTRUCCION, la DB lo tiene en EN_REVISION).
44. **101 `OsLead` pero solo 82 `OsLeadDossier`:** 19 leads sin dossier, todos del bucket sin prefijo de seed.
45. **`.env` y `.env.local` definen ambos `DATABASE_URL` con el mismo host.** Como dotenv no pisa por defecto y `.env.local` carga primero, la de `.env` queda muerta y **nada lo señala**. Cualquier divergencia futura entre los dos archivos sería silenciosa.
46. **`prisma/migrations/__diff_check.sql` es un archivo de 0 bytes trackeado en git** dentro de la carpeta de migraciones (commiteado en `7fe804d`). No es un directorio de migración: es un `.sql` suelto en la raíz de `prisma/migrations/`.
47. **El schema `prisma_shadow` (32 tablas, 21 enums, 100 objetos) sigue ocupando espacio en `neondb`**, congelado desde 2026-04-03.
48. **`prisma.config.ts` dice en su cabecera "los 49 archivos en prisma/migrations/"; hoy hay 86.**
49. **El comentario de `20260621120000_reconcile_dev_drift_schema_align` no coincide con esta base:** afirma que `20260619140100` *"quedó RESUELTA SIN EJECUTAR"*, pero acá figura con `applied_steps_count = 1` y `finished_at = 2026-06-19T14:14:44Z`.
50. **`ClientBrandProfile` (`schema.prisma:749-760`), el modelo de identidad de marca, no tiene campo de logo ni de imagen** — solo `primaryColor`, `secondaryColor`, `toneOfVoice`, `targetAudience`. El logo vive suelto en `Organization.logoUrl` (`:336`).
51. **`avatarImageUrlSchema.ts` acepta data URLs base64 de hasta 600.000 caracteres en una columna `TEXT` de Postgres** (`schema.prisma:414` y `:1289`). Es el único mecanismo del repo que persiste bytes de imagen, y lo hace dentro de la fila de la DB.
52. **Dos mecanismos de drag-and-drop conviviendo:** `admin/projects/_components/task-list.tsx:296` usa `onDrop` nativo de HTML5, en un repo que también instala `@dnd-kit/core` como dependencia.
53. **`leados/b8a-iii` está funcionalmente muerta:** sus 3 commits editan `lead-wizard.tsx`, `construccion-step.tsx` y `self-check-step.tsx`, archivos que ya no existen en `main`. Incluye un commit marcado como sensible: `458dfa3 fix(b8a-iii/sensible): guard de CALL_AGENDADA en el Paso 9`.
54. **`recon-origin-main` está 743 commits detrás de `origin/main` y `chore/dead-code-sweep` 733.** Ambas apuntan a `origin/main` como upstream; son ramas fósiles.
55. **`main` tiene 3 archivos `.bak` commiteados** que `redesign/home` borra: `web-development/page.tsx.bak` (171 líneas), `software-development/page.tsx.bak` (49), `process-automation/page.tsx.bak` (31).

---

*Corrida de PROBE — relevamiento, no plan. Nada de lo de arriba propone qué hacer.*
