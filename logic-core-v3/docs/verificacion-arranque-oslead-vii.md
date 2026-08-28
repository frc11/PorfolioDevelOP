# Verificación de arranque — OSLead VII

**Fecha:** 2026-08-18 · **Commit de arranque:** `05ae1a87` (`main`) · **Alcance:** relevamiento read-only del Panel del Setter (LeadOS).
**Esta corrida releva; no diseña.** Cero propuestas, cero roadmap, cero sprints. Lo que pide arreglo va a §Hallazgos, sin plan y sin priorizar.

**Convención:** cada afirmación va marcada **VISTO** (ejecutada o leída, con evidencia), **INFERENCIA** (deducida, con el razonamiento) o **NO VERIFICABLE** (con el motivo).

---

## Veredicto

### 1 · ¿El trabajo del chat anterior está íntegro y en un solo lugar?

**NO. Está en cuatro lugares, y nada de F1–F3 está pusheado.** El handoff dice «todo estaba en una rama y pusheado»: las dos mitades son falsas.

- **F1** (`34e15156`) y **F2** (`2d456390`): commiteados, pero **solo en ramas locales**. `git branch -r --contains` devuelve vacío para los dos. No están en `main` ni en `origin/main`.
- **F3**: **nunca llegó a commit.** La rama `f3/acuse-recibo` apunta al commit de F2. Su trabajo está sin commitear en el working tree de `C:/tmp/wt-f3-acuse`.
- **F4**: **no existe.** Ni rama, ni commit, ni worktree.
- En el checkout principal, **sin commitear**: el reporte de F0, su entrada de bitácora (+164 líneas) y **un fix de seguridad en `next.config.ts`**.

Un `git clean` o un checkout distraído borra F3 y el fix de seguridad. No hay copia en ningún remoto.

### 2 · ¿Las cuatro suites están verdes hoy?

**SÍ, las cuatro, exit 0** — medidas sobre F1+F2+F3, el punto más avanzado del trabajo.

| Suite | Comando | Exit | Resultado |
|---|---|---|---|
| tipos | `npx tsc --noEmit` | **0** | 0 líneas de salida |
| invariantes | `npm run check:invariants` | **0** | **22/22** |
| motor | `npm run test:leados` | **0** | **25 passed** (41.8s) |
| panel | `npm run test:setter` | **0** | **62 passed** (3.1m) |

Sobre `main` (`05ae1a87`) por separado: `tsc` exit **0**; `check:invariants` exit **0**, **19/19**.

### 3 · ¿Los invariantes son 22?

**Sí, pero en un árbol que no existe en ningún commit.** Los 22 solo se juntan sumándole a `main` los dos de F1 y el de F3, que está sin commitear.

| Árbol | Invariantes |
|---|---|
| `main` = `05ae1a87` | **19** |
| + F1 (`34e15156`) | 21 (`postergacion`, `contador-dms`) |
| + F3 (sin commitear) | **22** (`acuse`) |

**No faltan tres: nunca llegaron.** No hay commit donde se hayan borrado.

### 4 · ¿Cuántas pantallas tiene el recorrido hoy, y cuántas difieren del censo documentado?

**15 pasos** (`PANTALLA_IDS`) sobre **6 rutas**. Contra el censo documentado (`probe-poda-terreno.md` §10 R9, del 2026-07-31, que declara 20 pasos): **7 censadas ya no existen** (`m3`, `m7`–`m12`), **2 existen sin censar** (`mc1`, `mc2`), **13 coinciden** — y de esas 13, **3 cambiaron su encabezado** (`m2`, `m6`, `m14`). El censo cierra: 20 − 7 + 2 = 15.

### 5 · ¿Cuánto están desactualizados la galería y el manual?

- **Galería: 50 capturas, 12 desfasadas confirmadas + 3 por inferencia.** Última generación **2026-08-10 12:30**.
- **Manual: 13 capítulos, 9 desfasados** (7 solo por P11, +2 si entran F1/F2). Intactos: 02, 03, 06, 12, 13.
- **La causa no es ninguna F: es P11** (`513f38b4`), que **sí está en `main`** y reescribió el vocabulario de las tres esperas.
- **Regenerar hoy no alcanza:** P11 actualizó el spec de captura pero **no** el catálogo de textos del índice.

### 6 · De los 22 baches

| Cubo | Cantidad |
|---|---|
| MUERTO POR CONSTRUCCIÓN | **0** |
| RESOLUBLE POR LECTURA | **19** — 18 VIVO + 1 parcial |
| EXIGE MANEJAR LA APP | **3** |

**La expectativa del prompt no se cumplió: ningún bache murió con la poda.** Las pantallas murieron, pero los controles **migraron** de archivo o de parámetro y el defecto viajó con ellos.

### 7 · ¿El entorno está en condiciones de que un humano verifique lo perceptual?

**NO sin limpiarlo antes.** Tres bloqueos, todos medidos:

1. **Las 4 URLs de herramientas siguen en `null`** y **no hay pantalla que las cargue** — hay que editar un `.ts` y redeployar.
2. **Cal.com está NULL en las 16 organizaciones**, incluida `develop`. **Nadie escribe esos campos en todo el código.** La pantalla `m16` no bloquea: falla recién al hacer clic, con jerga cruda.
3. **El panel de novedades del setter de trabajo tiene 80 avisos sin leer, y 77 son huérfanos** (su lead fue borrado). Es 96% residuo de tests.

Lo que **sí** está sano: los fixtures del wizard. **`QA-W Rechazada` sigue en `RECHAZADA`** con su rechazo intacto — la pantalla de reentrada reproduce.

---

## Bloque A · Dónde vive el trabajo

### A.0 — Terreno (Fase 0)

**El criterio de frenada se disparó.** El working tree tenía cambios sin commitear que **no son míos**, incluido un archivo de **configuración**. No hay servidor ajeno contra este checkout, pero la regla es explícita: **monté worktrees propios fuera del repo** y medí ahí.

```
$ git status --porcelain
 M logic-core-v3/docs/bitacora-beta-3.md
 M logic-core-v3/next.config.ts
?? logic-core-v3/docs/auditorias/A1-CENSO-SUPERFICIES-2026-08.md
?? logic-core-v3/docs/auditorias/A2-SETTER-DOCS-VIABILIDAD-2026-08.md
?? logic-core-v3/docs/auditorias/A3-ESTADO-ECC-SKILLS-2026-08.md
?? logic-core-v3/docs/manual-usuario/BACHES-RE-VERIFICADOS.md

$ git status -sb
## main...origin/main [behind 6]
```

**VISTO — qué es cada cosa sin commitear.** No es basura: es trabajo cerrado que nadie guardó.

| Archivo | Qué es |
|---|---|
| `docs/bitacora-beta-3.md` | **+164 líneas**: la entrada entera del **Sprint F0** (reconciliación de ramas + re-verificación de baches) |
| `next.config.ts` | **Un fix de seguridad**: suma `/setter` al `X-Frame-Options: DENY` y le agrega una CSP propia con `frame-ancestors` cerrado |
| `docs/manual-usuario/BACHES-RE-VERIFICADOS.md` | El reporte de salida de F0 — el que lista los 22 pendientes (mtime 2026-08-12 13:32) |
| `docs/auditorias/A1·A2·A3` | Tres auditorías de otra sesión (mtime 2026-08-13 01:19–01:24) |

**VISTO — stashes (2, ninguno tocado):**
```
stash@{0}: On redesign/home: epitaxy: pre-switch from redesign/home
stash@{1}: On fix/home-sanidad: epitaxy: pre-switch from fix/home-sanidad
```

**VISTO — procesos y puertos.** Un solo listener en 3000-3020, y **no es de este proyecto**:
```
TCP 0.0.0.0:3000 LISTENING 34976
PID 34976 → "node" "C:\Users\franc\Desktop\RG-CRM\node_modules\...\next" start -p 3000
```
`RG-CRM` es otro proyecto del Desktop. **Cero servidores contra este checkout.** No maté nada ajeno.

**VISTO — 11 worktrees registrados.** Cuatro de la ola LeadOS (`wt-f0-p11`, `wt-f1-datos`, `wt-f2-motivo`, `wt-f3-acuse`), cuatro de auditorías de julio, tres del harness. Ninguno tocado.

**Worktrees propios de esta corrida (declarados):**

| Ruta | HEAD | Para qué |
|---|---|---|
| `C:/tmp/wt-verif-vii` | `2d456390` + el diff sin commitear de F3 | Las cuatro suites |
| `C:/tmp/wt-verif-main` | `05ae1a87` | Tipos + invariantes de `main` |

Los dos con `node_modules` por *junction* al del checkout principal, `.env`/`.env.local` copiados, build propio y **puerto 3013** — nunca el 3003 de nadie.

### A.1 — Rama actual y relación con origin

**VISTO.** Rama `main`, en `05ae1a87`.

```
$ git rev-list --left-right --count main...origin/main
0	6
```

**0 adelante, 6 atrás.** Los 6 que faltan son de otro carril (chatbot + home), ninguno del setter:
```
1e5b7fbb fix(chatbot): commit 4 carreras — freeze de la lambda
02a2f812 chore(chatbot): commit 3 carreras — deprecar endpoint smoke
59e01cc9 fix(chatbot): commit 2 carreras — provider-close
80b0c2c9 fix(chatbot): R3 — botones de handoff respetan botBusy
41a80cc0 feat(chatbot): carrera P2002
78b510ac feat(home): restaura la home clasica pre-rediseno
```

### A.2 — Estado de F1, F2, F3 y F4

**Probado con `git branch --contains` y `git merge-base`, no leyendo la bitácora.**

```
$ git branch --contains 34e15156          # F1
  f1/datos-fecha-contador  f2/motivo-rechazo  f3/acuse-recibo
$ git branch -r --contains 34e15156       # F1 en remotas
  (vacío)
$ git merge-base --is-ancestor 34e15156 main         → NO
$ git merge-base --is-ancestor 34e15156 origin/main  → NO

$ git branch --contains 2d456390          # F2
  f2/motivo-rechazo  f3/acuse-recibo
$ git branch -r --contains 2d456390       # F2 en remotas
  (vacío)
$ git merge-base --is-ancestor 2d456390 main         → NO
$ git merge-base --is-ancestor 2d456390 origin/main  → NO
```

| Sprint | Estado real |
|---|---|
| **F1** `34e15156` | Sin mergear y **sin pushear**. Solo ramas locales. |
| **F2** `2d456390` | Sin mergear y **sin pushear**. |
| **F3** | **No tiene commit.** `f3/acuse-recibo` apunta a `2d456390`, el commit de F2. Su trabajo está sin commitear en `C:/tmp/wt-f3-acuse`. |
| **F4** | **No existe.** `git log --all --grep=F4 -i` solo trae `c19f7dba` (sprint 3.4d, «F4-mobile-drawer»), sin relación. |

El trabajo sin commitear de F3:
```
$ git -C C:/tmp/wt-f3-acuse status --porcelain
 M logic-core-v3/docs/bitacora-beta-3.md
 M logic-core-v3/package.json
 M logic-core-v3/src/app/(protected)/setter/_components/foco-surface.tsx   (+6 líneas)
?? logic-core-v3/src/lib/leados/acuse-recibo.invariant.ts                  (271 líneas, nuevo)
```

### A.3 — Commits fuera de la rama principal

**VISTO.** Tomando `origin/main` como principal (es la que está adelante):

```
RAMA                                   commits fuera de origin/main
origin/experimento/estetica-goal        15
origin/b0-isolation-motor-chatbot        8
origin/leados/b8a-iii                    3
origin/chore/security-quick-wins         3
origin/chore/gs-aislamiento              2
origin/chore/auditoria-seguridad         2
f3/acuse-recibo                          2   ← SOLO LOCAL
f2/motivo-rechazo                        2   ← SOLO LOCAL
f1/datos-fecha-contador                  1   ← SOLO LOCAL
origin/chore/wf-home                     1
origin/chore/auditoria-{maestra,clean}   1 c/u
origin/b1-s1-bsp-inbound                 1
origin/b2-s1-bot-sync-surface            1
origin/claude/{sad-burnell,priceless}    1 c/u
```

**Del carril LeadOS/setter, lo único fuera de `origin/main` son F1 y F2** (más el WIP de F3). El resto son carriles ajenos ya pusheados.

### A.4 — Cierre del bloque

> **El trabajo del chat anterior no está íntegro ni en un solo lugar.** `main` tiene P1–P11 y la reconciliación F0, verde. F1 y F2 viven solo en ramas locales sin pushear. F3 no llegó a commit. F4 nunca existió. Y en el checkout principal quedaron sin commitear el reporte de F0, su bitácora y un fix de seguridad.

---

## Bloque B · Las cuatro suites

### B.1 — El mapeo (VISTO, no asumido)

El nombre está en la bitácora, con los cuatro comandos:

```
$ sed -n '2023p' docs/bitacora-beta-3.md
**Las cuatro suites están verdes hoy, sin deuda:** `tsc --noEmit` exit 0 (salida de 0 bytes),
`check:invariants` **17/17**, `test:leados` **25/25**, `test:setter` **60/60** en 3.4 min
```

| Suite | Comando exacto | ¿Existe? |
|---|---|---|
| tipos | `npx tsc --noEmit` | sí (no es script de npm) |
| invariantes | `npm run check:invariants` | sí |
| **motor** | **`npm run test:leados`** → `playwright.leados.config.ts` | sí |
| **panel** | **`npm run test:setter`** → `playwright.setter.config.ts` | sí |

**Ningún script murió.** `start:setter` — el que se perdió una vez — existe y funciona (`package.json:12`).

> **Corrección al prompt.** El prompt afirma que `next.config.ts` tiene «`ignoreBuildErrors` e `ignoreDuringBuilds` en true». **Solo la primera es cierta.** `ignoreBuildErrors: true` está en `next.config.ts:31-33`; **no existe ningún bloque `eslint` en el archivo** (`grep -n eslint next.config.ts` → sin salida). La conclusión operativa se sostiene igual: el build no es gate de tipos, y por eso medí con `tsc --noEmit`.

### B.2 — Las cuatro corridas

**Una por vez, secuenciales, en el agente padre**, sobre `C:/tmp/wt-verif-vii` = **F1 + F2 + F3**.

```
$ npx tsc --noEmit
EXIT CODE: 0
--- lineas de salida: 0 ---

$ npm run check:invariants
EXIT CODE: 0
$ grep -c '^✓' → 22

$ npm run test:leados
  25 passed (41.8s)
EXIT CODE: 0

$ SETTER_EXTERNAL_SERVER=1 SETTER_PORT=3013 npx playwright test --config=playwright.setter.config.ts
  62 passed (3.1m)
EXIT CODE: 0
```

**`test:setter` da 62, no 60.** Las dos de más son de F2: `tests/setter/14-motivo-rechazo.spec.ts`. El build de producción previo también dio exit 0, en `.next-setter/` dentro de mi worktree.

### B.3 — Y sobre `main`, que es lo que está pusheado

| Suite | `main` = `05ae1a87` |
|---|---|
| `npx tsc --noEmit` | exit **0**, 0 líneas |
| `npm run check:invariants` | exit **0**, **19/19** |

### B.4 — Los invariantes: 22, en un árbol que no existe en ningún commit

| Árbol | Invariantes | Los que suma |
|---|---|---|
| `main` = `05ae1a87` | **19** | — |
| F1 `34e15156` | 21 | `postergacion`, `contador-dms` |
| F2 `2d456390` | 21 | (no toca `package.json`) |
| **F3, sin commitear** | **22** | `acuse` |

**Los 22, por nombre, en orden de ejecución:**
```
 1 check:invariant                  12 check:invariant:gate-envio
 2 check:invariant:setter-meta      13 check:invariant:self-check
 3 check:invariant:escalamiento     14 check:invariant:progreso
 4 check:invariant:novedades        15 check:invariant:reloop-selfcheck
 5 check:invariant:mis-numeros      16 check:invariant:manual
 6 check:invariant:timeline         17 check:invariant:pantallas
 7 check:invariant:foco             18 check:invariant:turno
 8 check:invariant:particion        19 check:invariant:postergacion    ← F1
 9 check:invariant:flow             20 check:invariant:contador-dms    ← F1
10 check:invariant:alta-propia      21 check:invariant:acuse           ← F3 (sin commitear)
11 check:invariant:prospecto-import 22 check:invariant:security
```

**Los 3 que le faltan a `main` no desaparecieron: nunca llegaron.** No hay commit donde buscarlos borrados — `git log -S` sobre `package.json` los ubica naciendo en `34e15156` y en el working tree de `wt-f3-acuse`, en ningún lado más.

> **Nota para el futuro.** Los tres nuevos se invocan con `npx tsx`, y **`tsx` no es dependencia de este repo** (ver Bloque F.4). En esta máquina resuelven por un binario global; en un checkout limpio, los tres fallan.

---

## Bloque C · Censo real de pantallas

### C.1 — El árbol de rutas (VISTO, del filesystem y del build)

**6 rutas** bajo `src/app/(protected)/setter/`. Confirmado además por la salida del `next build`:

| Ruta | Archivo | Qué hace |
|---|---|---|
| `/setter` | `setter/page.tsx` | Cartera / home del setter |
| `/setter/nuevo` | `nuevo/page.tsx` | Cargar prospecto |
| `/setter/nuevo/importar` | `nuevo/importar/page.tsx` | Importar prospectos |
| `/setter/leads/[leadId]` | `leads/[leadId]/page.tsx` | **No renderiza** — `redirect(...)` (`:23`) |
| `/setter/leads/[leadId]/manual` | `manual/page.tsx` | **No renderiza** — `redirect(...)` (`:21`) |
| `/setter/leads/[leadId]/manual/[paso]` | `manual/[paso]/page.tsx` | **La única pantalla real del recorrido** |

Cero `route.ts` bajo `setter/`.

### C.2 — Los 15 pasos que existen hoy

**La fuente única NO es `_data.ts`** (ese archivo es solo el loader owned). Es **`src/lib/leados/manual.ts`**: `PANTALLA_IDS` (`:45-61`), `PANTALLAS` (`:158-299`).

| # | id | tipo | Encabezado que ve el setter |
|---|---|---|---|
| 1 | `m1` | manual | Cargá los datos del negocio |
| 2 | `m2` | manual | Llevá la ficha a evaluar y registrá el veredicto |
| 3 | `m4` | manual | Mandá el opener |
| 4 | `m5` | manual | Registrá lo que pasó |
| 5 | `m6` | manual | Decidí cómo va a ser la demo |
| 6 | `mc1` | manual | Construí la demo en Claude Design |
| 7 | `mc2` | manual | Refiná la demo antes de publicarla |
| 8 | `m13` | manual | Publicá y registrá el link del borrador |
| 9 | `m14` | manual | Chequeá la demo antes de mandarla |
| 10 | `m15` | manual | Mandá el link al negocio |
| 11 | `m16` | manual | Agendá la reunión |
| 12 | `mr` | reentrada | Aplicá las correcciones de Franco |
| 13 | `espera` | estado | Esperando respuesta |
| 14 | `revision` | estado | Franco está revisando tu demo |
| 15 | `archivo` | estado | Este negocio quedó cerrado |

> **Trampa registrada.** Los encabezados de `espera` y `revision` en `PANTALLAS` son **código muerto en pantalla**: esas rutas salen por `EstadoManual`, cuyo título es `TEXTO_TURNO[turno]` («Le toca al negocio» / «Le toca a Franco» / «Te toca a vos»), no el del registro. Y `archivo` hardcodea el suyo en `archivo-manual.tsx:43`. **Auditar el copy de esas tres contra `PANTALLAS` da un resultado falso.**

> **Segunda trampa.** El id de la reentrada es **`mr`**, no `m-r`: el literal `m-r` tiene 0 hits en `src/`.

### C.3 — Las tres listas, contra el censo documentado

Censo documentado tomado de **`docs/probe-poda-terreno.md` §10 R9** (2026-07-31), el más completo y explícito: declara «6 patrones de URL · 23 pantallas renderizadas · 2 redirects puros» y **los 20 valores de `[paso]`**.

**a) Existen y están censadas — 13**
`m1` · `m2` · `m4` · `m5` · `m6` · `m13` · `m14` · `m15` · `m16` · `mr` · `espera` · `revision` · `archivo`

De esas 13, **3 cambiaron su encabezado** desde el censo:

| id | Censado (31/7) | Hoy |
|---|---|---|
| `m2` | Llevá la ficha al Evaluador | Llevá la ficha a evaluar y registrá el veredicto |
| `m6` | Armá el brief | Decidí cómo va a ser la demo |
| `m14` | Pasá los checks duros | Chequeá la demo antes de mandarla |

**b) Existen y NO están censadas — 2**
`mc1` · `mc2`. Nacieron con **P6-B** (`42c6edc9`), posterior al censo.

**c) Censadas que ya no existen — 7**
`m3` (lo mató **P4** `5d844bb6`, que fusionó su registro dentro de `m2`) · `m7` `m8` `m9` `m10` `m11` `m12` (los mató **P6-B** `42c6edc9`).

**El censo cierra exacto:** 20 − 7 + 2 = **15**. Las rutas también: 6 patrones censados = 6 patrones hoy.

### C.4 — Correcciones al «estado conocido» del prompt

| Afirmación del prompt | Veredicto |
|---|---|
| «m7–m12 no existen, quedaron mc1 y mc2» | **CONFIRMADO.** Precisión: el corte es **3+3 por criterio** (mirar el brief vs. mirar la demo ya construida), no por índice. Las 6 fases del checklist persistido (`FASE_IDS`) quedaron intactas: el colapso es de presentación. |
| «m3 cambió» | **IMPRECISO.** `m3` no cambió: **desapareció**. |
| «m5 cambió» | **REFUTADO en el registro.** El bloque `m5` de `PANTALLAS` es byte-idéntico al commit fundacional. Lo que cambió fue su **componente** (`m5-seguimiento.tsx`), no su id ni su encabezado. |

### C.5 — Hay siete censos documentados y no coinciden

**VISTO.** No existe *un* censo. Los relevantes:

| Fuente | Declara | Estado |
|---|---|---|
| `probe-poda-terreno.md` §10 R9 | 23 pantallas / 20 pasos | **stale** (previo a la poda) |
| `docs/metodo/MAPA-LEADOS.md` | 20 (16 + mr + 3 estados) | **stale** |
| `manual-usuario/galeria/INDICE.md` | 16 pantallas (15 + home) | **al día** — es generado |
| `manual-usuario/00-INDICE.md` | 11 pantallas de trabajo, 13 capítulos | **al día** |
| `docs/auditorias/A2-…-2026-08.md` (untracked, 13/8) | «las 16 pantallas del manual» | **stale y POSTERIOR a la poda** |

**Ningún invariante codifica la lista de las 15.** `pantallas-construccion.invariant.ts` solo ata `mc1`/`mc2` ↔ `FASE_IDS` y enumera las retiradas. **Agregar o quitar una pantalla que no sea de Construcción no lo detecta nadie.**

---

## Bloque D · Frescura de galería y manual

### D.1 — Los dos artefactos (contados de forma independiente)

```
$ ls docs/manual-usuario/galeria/png/*.png | wc -l
50
$ ls docs/manual-usuario/galeria/png/ | grep -c '^M-'
7                                    # → 43 desktop + 7 mobile
$ ls docs/manual-usuario/[0-9][0-9]-*.md | wc -l
14                                   # → 13 capítulos + 00-INDICE.md
```

**Los números del prompt son exactos: 50 capturas y 13 capítulos.**

### D.2 — Fecha real de generación

| Artefacto | Generación | Cómo se sabe |
|---|---|---|
| Galería (PNG) | **2026-08-10 12:30–12:31** | mtime **es** la fecha: los PNG **no están versionados** (`galeria/.gitignore` ignora `png/`) |
| Índice + scripts | commit `c138ae4c`, 2026-08-10 15:58 | `git log -1` |
| Manual (13 capítulos) | commits 2026-08-10 13:21–13:44 | `git log` |

> **El mtime de los `.md` miente.** Los 14 archivos del manual tienen **todos** mtime `2026-08-12 13:04:36` — el mismo segundo: es el checkout que siguió al merge `05ae1a87`, no una edición. La fecha real de autoría es la de git (10/8).

### D.3 — Qué los desactualizó (y no es ninguna F)

**El commit que más desactualiza es P11 (`513f38b4`), y está en `main`.** Introdujo `turno.ts` con `TEXTO_TURNO` y **borró del producto** las cadenas viejas: «Esperando respuesta del negocio», «Franco está revisando tu demo», «Te está esperando a vos», el chip «esperando respuesta», entre otras.

F1 y F2 (fuera de `main`) suman poco: F1 desfasa **datos**, no textos, y no cambia ninguna captura de layout.

### D.4 — Tamaño de la desactualización

**Capturas: 12 confirmadas + 3 por inferencia, de 50.**

| Superficie | Capturas |
|---|---|
| Pantalla `espera` | `08-espera-post-opener`, `28-m15-espera-sin-respuesta`, `29-m15-espera-sin-final-url` |
| Pantalla `revision` | `23-revision-franco` |
| Detalle de `m15` | `27-m15-envio-abierto` |
| Foco del home | `38-home-foco-espera-accion` |
| Home en espera | `40-home-nada-para-trabajar` |
| Opción «Respondió» de m5 | `09-m5-toque-vencido`, `10-m5-cadencia-agotada`, `11-m5-charla-poblada`, `33-m5-post-envio`, `M-09-m5-toque-vencido` |
| *Por inferencia* | `35-home-foco`, `36-home-cartera`, `M-35-home-foco` |

**Capítulos: 9 de 14.** Por P11 (ya en `main`): **00-INDICE, 01-tu-dia, 04-el-primer-mensaje, 05-los-toques, 09-el-chequeo-final, 10-correcciones-de-franco, 11-mandar-el-link**. Si entran F1/F2, se suman **07-construir-la-demo** y **08-publicar-el-borrador**.
**Sin desfase (5):** 02-la-ficha, 03-la-evaluacion, 06-decidir-la-demo, 12-agendar-la-reunion, 13-cierres.

### D.5 — Dos hallazgos colaterales

1. **Regenerar hoy no alcanza.** P11 actualizó el spec de captura (`tests/galeria/captura.spec.ts`) pero **no** el catálogo de textos (`scripts/dev/m0-galeria-indice.ts`), que sigue diciendo «Franco la está revisando» (`:283`) y «te está esperando a vos» (`:422`) — frases que P11 borró del producto. **Corregir el catálogo es prerrequisito de la regeneración, no consecuencia.**
2. **`35-home-foco.png` y `36-home-cartera.png` son byte-idénticos** (md5 `c1171c24045f96d55b92d41385c4db0c`, verificado). La galería declara «0 residuos, 0 huecos», pero uno de sus 50 archivos es una copia: **la cartera nunca se fotografió.**

---

## Bloque E · Triage estático de los 22 baches

**Método.** Dos pasadas: una de clasificación y una **adversarial** que intentó refutarla (los cubos «0 muertos / 0 exige-app» de la primera pasada eran sospechosamente limpios). La segunda **cambió 4 dictámenes**. Lo que sigue es el resultado después de la refutación.

### E.1 — Conteo final

| Cubo | Cantidad | Cuáles |
|---|---|---|
| **MUERTO POR CONSTRUCCIÓN** | **0** | — |
| **RESOLUBLE POR LECTURA** | **19** | 18 VIVO + 1 parcial |
| **EXIGE MANEJAR LA APP** | **3** | `B-B11` · `B-C3/C4/C5` · `B-C8` |

### E.2 — Por qué el cubo «muerto» quedó vacío

**La expectativa del prompt no se cumplió, y la razón es concreta: las pantallas murieron pero los controles migraron.**

- **`B-A5`** es el caso más limpio: se reportó «en m7», y `m7` no existe. Pero el control **no cambió de archivo**: `m-construccion.tsx` se re-parametrizó de `m7…m12` a `mc1/mc2`. La cadena «Primero arrancá la construcción — el botón está arriba.» está hoy en `m-construccion.tsx:197`, con la misma condición rota. `git grep` sobre el commit que midió la corrida la encuentra en **el mismo archivo**, línea 146.
- **`B-C3/C4/C5`**: el «Veredicto» y el score salieron de `m3` (borrada) y hoy viven dentro de `m2`.
- **`B-C8`**: los 6 chips de fases se agruparon en 2, pero `NavConstruccion` sigue existiendo.

**Poda de pantalla ≠ muerte de bache.**

### E.3 — Los 3 que exigen manejar la app

Los tres comparten un patrón: **el código fuente dice una cosa y la corrida midió la contraria, en el mismo commit.** Ninguna lectura arbitra eso.

| id | Por qué no se cierra leyendo | Qué haría falta |
|---|---|---|
| **`B-C8`** (chips de fases) | `aria-label="Fase marcada como hecha"` **ya estaba** en el commit que midió la corrida (`manual-nav.tsx:253` de `4dadd274`), con los 6 chips renderizados y las fases tildadas marcadas — y la corrida igual midió «mismo nombre accesible». Es un cómputo de nombre accesible (un `aria-label` sobre un `svg` sin `role`, dentro de un `a` con name-from-content). | Un lead en CONSTRUCCIÓN con 1–2 de 3 fases tildadas, en `mc1`, leyendo el nombre accesible real de los chips con un lector de pantalla. **Residuo legible aparte:** con P6-B la marca es todo-o-nada por pantalla, así que 1 o 2 de 3 tildadas renderizan idéntico a 0. |
| **`B-C3/C4/C5`** (selects) | Bache compuesto. La pata `B-C4` afirma que el listbox «nunca recibe foco»; el fuente **lo enfoca** con un `requestAnimationFrame` al abrir (`Select.tsx:186-191`), y esa línea es **byte-idéntica** en el commit medido. Leer dice «se enfoca»; el runtime dijo que no. | Abrir cualquiera de los 4 selects y mirar `document.activeElement`. Las otras dos patas (el `aria-label` pisa el contenido; el score sin roving/flechas) **sí** son legibles y siguen vivas. |
| **`B-B11`** (esperas del negocio) | La línea que el bache pedía **existe hoy** — P11 la agregó — pero vive en una rama **mutuamente excluyente** con la superficie donde se midió: el panel elige en runtime entre `FocoSurface` y `HomeEnEspera`, y los chips por turno salen **solo** cuando la cola «trabajar» quedó vacía. La corrida midió el panel **con** foco. | Fijar cuál de las dos ramas renderiza — es decir, el foco calculado en runtime. **Residuo legible aparte:** la segunda mitad (las novedades no avisan «hoy te toca un toque» ni «se venció una postergación») sigue VIVA — el enum tiene solo 4 kinds, todos de handoff. |

### E.4 — Los 19 resolubles por lectura

**18 VIVO.** Uno por uno, con la línea exacta:

| id | Dictamen | Evidencia |
|---|---|---|
| `B-P1/B-C2` | **VIVO** | `dossier.schemas.ts:75-77` tiene el mensaje **en español**, pero Zod v3 lo **descarta** para el issue `invalid_literal` (`zod/v3/types.js:63-64`) y sale el default en inglés. Además el error cuelga del campo equivocado: el `Toggle` queda fuera del `Field`. **Traducir de nuevo no arregla nada.** |
| `B-A6` | **VIVO** | `m13-borrador.tsx:79-95`: con RECHAZADA + draftUrl, m13 devuelve un resumen sin ningún control. La instrucción real («Reabrí la construcción») vive solo en `mr`. F2 le suma el pedido de Franco, pero sigue sin decir que hay que reabrir. |
| `B-A5` | **VIVO** | `m-construccion.tsx:197` (el motivo) vs `:171-179` (el botón, solo si stage=BRIEF). En RECHAZADA se cumple la primera y no la segunda. El botón real se llama «Reabrir construcción» y vive en `mr`. |
| `B-A3` | **VIVO** | `[paso]/page.tsx:133-142`: copy **incondicional**, nunca consulta `manual.progreso`. |
| `B-A10` | **VIVO** | `guia-retrabajo.tsx:6-30` y `home-sections.tsx:149-171`: solo Qué/Dónde/Arreglo, cero fecha. F2 lo arregla **parcialmente** (vueltas anteriores); el rechazo vigente sigue sin fecha. |
| `B-A11` | **VIVO** | `[paso]/page.tsx:248-259` + `m-construccion.tsx:64-69`: `mr` tiene el bloque copiable pero **no** la tarjeta de herramienta. |
| `B-B4/B-B10` | **VIVO** | `manual.ts:500-502`: `derivarPantalla` tiene una sola rama por status (PERDIDO); **POSTERGADO no tiene rama.** |
| `B-B5` | **VIVO** | `reactivateAt` se renderiza en **una sola** superficie: `m5-seguimiento.tsx:87-91`. |
| `B-B6` | **VIVO** | La mitad fuerte está **refutada** (`flow.ts:442-444` emite dos frases distintas). Queda vivo el residuo: sin fecha en pantalla, el rótulo no es verificable. |
| `B-B7` | **VIVO** | Cinco cadenas «Pausar» (`cartera-toolbar.tsx:25`, `foco-surface.tsx:215` y `:51`, …) contra «Postergar» en `seguimiento-form.tsx:50`. Son **dos conceptos distintos**: `snoozedUntil` vs `status POSTERGADO + reactivateAt`. |
| `B-B8` | **VIVO** | Asimetría **estructural**: `m5-seguimiento.tsx:189-192` usa el lanzador pelado; `m4` usa el componente con aclaración. |
| `B-B9` | **VIVO** | El contador «Toques: N de 3» solo vive en `m5`; la pantalla `espera` no lo tiene. |
| `B-C9` | **VIVO** | `chequeo-form.tsx:285-292`: `disabled` nativo sin `aria-describedby` ni `title`. |
| `B-C10` | **VIVO** | Los 4 botones de resultado de `m5` en un contenedor sin `role` ni `aria-label`. |
| `B-C12` | **VIVO** | `copy-block.tsx`: 74 líneas, **cero** `aria-live` y **cero** `role="status"`. |
| `B-P4` | **VIVO** | `setter-nav.tsx:29-31`: el único ítem se llama «Cartera» y apunta a `/setter`, que es «Tu día». Además es un `button`, no un `a`. |
| `B-P5` | **VIVO** | 3 call-sites de `anclarFoco`, **0** de `soltarFoco`, un solo `maxAge`, una sola invalidación por pertenencia (`foco.ts:51-52`). Los dos remedios pedidos no existen. |
| `B-P8` | **VIVO** | `estado-manual.tsx`: con `tipo='revision'` renderiza header + texto de turno + volver. **Sin link al borrador** y sin referencia a cuánto tarda. |

**1 parcial — corregido por la refutación:**

| id | Dictamen |
|---|---|
| `B-P9/A12/B12` | **MITAD MUERTA / MITAD VIVA.** El titular («la más vieja **hace hace** N días») **ya está arreglado en `main`** por `c2160792` (31/7) — anterior a la corrida, que midió `4dadd274` y no lo tenía. Lo que sigue VIVO es la segunda mitad: «Las ves en tu cartera → filtro Esperando revisión» sigue siendo texto plano, no link. **Un dictamen «VIVO» sin matizar manda a arreglar un string que ya no existe.** |

### E.5 — Dos discrepancias que quedan anotadas

1. **`B-B8` estaba mal clasificado en el documento de origen.** `BACHES-RE-VERIFICADOS.md:258-261` lo da como «no verificable — depende de configuración». Es corregible: el `url: null` está **en el código fuente** (`herramientas.ts:117`), y la asimetría que denuncia es independiente del valor de la URL.
2. **El techo del invariante de F3.** `acuse-recibo.invariant.ts` barre **solo** call-sites de funciones exportadas desde `_actions/*.actions.ts`. Un acuse ausente que no pase por una server action — el caso exacto de **`B-C12`**, que es un `navigator.clipboard.writeText` — **pasa en verde**.

---

## Bloque F · Superficie de configuración y aptitud del entorno

### F.1 — Las cuatro URLs de herramientas

**VISTO — no viven en Prisma.** Son literales en `src/lib/leados/herramientas.ts`:

```
:63    url: null, // TODO: URL — chat de evaluación en Sonnet (pedir a Franco)
:78    url: null, // TODO: URL — Gem privado de diseño/brief (pedir a Franco)
:90    url: null, // TODO: URL — acceso a Claude Design que usa el equipo (pedir a Franco)
:105   url: 'https://app.netlify.com/drop',        ← la única cargada
:117   url: null, // TODO: URL — Gem privado de outreach (pedir a Franco)
```

| Pregunta | Respuesta |
|---|---|
| ¿Modelo y campos de Prisma? | **Ninguno.** No están en la base. |
| ¿Pantalla de `/admin` que las edite? | **No existe.** El registro solo lo importan dos componentes del setter, ambos read-only. |
| ¿Variable de entorno? | **No.** |
| **Camino real para cargarlas** | **Editar el `.ts` y redeployar.** |
| Qué ve el setter mientras tanto | «pendiente» en el rail y **«Link pendiente»** dentro de `m2`, `m6`, construcción, `m4` y `m5`. |

### F.2 — Cal.com

**VISTO — sí viven en Prisma**, en `model Organization` (`schema.prisma:375-377`): `calComApiKey` (`String? @db.Text`), `calComUsername` (`String?`), `calComEmbedUrl` (`String?`).

| Pregunta | Respuesta |
|---|---|
| ¿Pantalla de `/admin` que los edite? | **No existe.** Barrido repo-wide: **cero writes** de esos campos en todo el código — ninguna action, API route, seed ni script. El único form de admin que toca `Organization` escribe otros seis campos. |
| **Camino real** | **Escritura directa a la base.** |
| Pantalla del setter que se destraba | **`m16` «Agendá la reunión»**. |
| ¿Hay estado vacío o bloqueo? | **No.** La pantalla renderiza el form completo y la falla aparece **recién al apretar «Buscar horarios libres de Franco»**, como texto rojo con la jerga cruda del SETUP_B7. |

> **Trampa registrada.** `getCalConfigLeadOS` exige que exista **una sola** organización con `calComUsername` en toda la base (`agenda.ts:44-55`). El campo es **compartido** con el módulo cliente `agenda-inteligente`: cargarlo en un cliente rompe el agendado de LeadOS con «Config Cal.com ambigua».

**Estado en la base de desarrollo (VISTO):** las **16 organizaciones** tienen `calComUsername = NULL`, `calComEmbedUrl = NULL` y `calComApiKey = NULL`. Incluida `develop`.

### F.3 — Aptitud de la base de desarrollo

**Censado ANTES de correr cualquier suite** (para no destruir la evidencia).

**El setter de trabajo** es `setter-qa@develop.test` (`cmq9zt64w00009f54psdq8wc8`), con **78 leads** de los 113 de la base.

| Origen | Leads |
|---|---|
| `M0-GAL …` (seed de galería) | **36** |
| `QA-W …` (seed wizard V-1) | **13** |
| `QA-B3/B4/B6/B7 …` | 8 |
| `SMOKE-SETTER …` | 8 |
| `DEMO Web · …` | 6 |
| `QA-M5 / QA-M16` | 4 |
| Sin prefijo | **3** (`F3-PROBE Brief`, `F3-PROBE Opener`, `Gimnasio Nova Fit`) |

**Prácticamente todo es fixture.** Los dos `F3-PROBE` son residuo del sprint F3.

**Novedades — el problema más grande para una verificación perceptual:**

| Métrica | Valor |
|---|---|
| Total del setter de trabajo | **80** |
| **Sin leer** | **80** (el 100%) |
| **Huérfanas** (su lead fue borrado) | **77** |
| Con lead vivo | **3** |
| Rango | 2026-06-30 → 2026-08-18 |

**77 de 80 son huérfanas.** Son residuo de corridas de test: los specs crean un lead, lo reasignan, y al borrarlo la novedad queda con `leadId = null` (`onDelete: SetNull`). El panel de novedades es **96% basura de tests**.

**Demos en revisión: 13**, la más vieja hace **66,5 días** (`QA-B4 Barbería El Faro`, `updatedAt = 2026-06-12`).

**Fixtures del wizard — la buena noticia:** los 13 `QA-W` están **completos y en su estado canónico**.

```
QA-W Rechazada    status=RESPONDIO  stage=RECHAZADA  rechazos=1  draft=SI  selfCheck=SI  progreso=SI
```

> **Respuesta directa a la pregunta del prompt: `QA-W Rechazada` SIGUE reproduciendo la pantalla de reentrada.** El barrido A **no** lo dejó en CONSTRUCCIÓN. Su rechazo está íntegro, con `motivo`, `donde`, `arreglo` y `detalle`, sin tocar desde `2026-08-12`.

**Declaración honesta sobre mi propia contaminación.** Correr `test:leados` y `test:setter` era parte del encargo y toca la base. Medí exactamente qué dejaron:

| Efecto | Cantidad |
|---|---|
| Leads creados | **0** |
| Usuarios creados | **0** |
| **Novedades creadas** | **1** (huérfana, `2026-08-18T04:55:04Z`) |
| Fixtures QA-W alterados | **0** |

El censo de novedades **anterior** a las suites daba **79**; el posterior, 80. La diferencia es mía y está identificada. **No re-seedeé nada.**

### F.4 — Procedimiento para levantar la app en un entorno limpio (documentado, NO ejecutado)

**Tres bloqueos reales que hay que conocer antes de empezar:**

1. **`tsx` no es dependencia del repo.** No está en `package.json`, ni en `package-lock.json`, ni en `node_modules/`. En esta máquina resuelve por un binario **global** de pnpm (`C:/Users/franc/AppData/Local/pnpm/tsx`). De él dependen `npm run seed:galeria`, `prisma db seed`, los seeds QA y ~60 invariantes — incluidos los tres nuevos de F1/F3. **En un checkout limpio, nada de eso corre.**
2. **Los seeds QA tienen el host de la branch Neon dev hardcodeado** (`ep-quiet-waterfall-acv0fpll`) y abortan contra cualquier otro destino, **sin override**. Afecta a 9 scripts. No se puede aislar la base en un Postgres local.
3. **El build de QA SÍ comparte directorio con el de desarrollo.** `distDir` = `E2E_DIST_DIR ?? '.next'`. `start:qa` escribe en `.next`, el mismo que `dev`. Solo `start:setter` (`.next-setter`) y `start:galeria` (`.next-galeria`) están aislados.

**Puertos:** `dev` 3000 · `dev:qa` 3002 · `start:qa` 3001 · `start:setter` 3003 · `start:galeria` 3004.

**Variables de entorno — 8 críticas** (si falta una, `check-env` sale con 1): `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `IMPERSONATION_SECRET`, `CHATBOT_GCP_PROJECT_ID`, `DEVELOP_ALERTS_EMAIL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`. Además, **`check-env` no conoce** `QA_ALLOW_LOCALHOST`, `E2E_DIST_DIR`, `SETTER_PORT`, `SETTER_EXTERNAL_SERVER` ni las 4 `SEED_*_PASSWORD`, que igual hacen falta.

**Seeds del setter (existen, pero sin script de npm y hay que invocarlos por ruta):**
- `npx tsx scripts/v1-qa-wizard-states.ts` — 13 leads `QA-W`, uno por estado del wizard. *(Ojo: vive en `scripts/`, no en `scripts/dev/`.)*
- `npx tsx scripts/dev/qa-manual-m5-m16.ts` — 4 leads para Seguimiento y Agenda.

**Procedimiento:**

```bash
# 0. Dependencias
npm ci
npm i -D tsx                       # el repo NO lo declara; sin esto fallan los seeds y ~60 invariantes

# 1. Entorno
cp .env.example .env               # completar las 8 críticas + las 4 SEED_*_PASSWORD
                                   # NEXTAUTH_URL y NEXT_PUBLIC_APP_URL con el puerto elegido, ANTES del build
                                   # DATABASE_URL DEBE contener ep-quiet-waterfall-acv0fpll o los seeds abortan
npm run check-env

# 2. Base — read-only primero. Si reporta drift: FRENAR. Nunca migrate reset ni migrate dev.
npx prisma migrate status
npx prisma migrate deploy

# 3. Seeds
npx prisma db seed                 # crea los 4 usuarios que todo lo demás asume
npx tsx scripts/v1-qa-wizard-states.ts
npx tsx scripts/dev/qa-manual-m5-m16.ts

# 4. Build + server aislados (directorio propio, puerto propio)
npx cross-env E2E_DIST_DIR=.next-setter npm run build
npx cross-env E2E_DIST_DIR=.next-setter QA_ALLOW_LOCALHOST=1 npx next start -p 3013

# 5. Sesión QA sin pasar por la UI
curl -i -X POST http://127.0.0.1:3013/api/qa/login \
  -H "Content-Type: application/json" -d '{"persona":"setter"}'
```

**Sobre el login QA:** `/api/qa/login` existe con triple guard, los tres obligatorios: `QA_ALLOW_LOCALHOST=1`, host localhost, y no estar hosteado. Personas: `setter`, `super-admin`, `client-a`, `client-b`. Como el server corre con `NODE_ENV=production`, la cookie se llama `__Secure-authjs.session-token` y viene con `Secure`: hay que reenviarla como **header crudo**, porque un cookie-jar que respete `Secure` no la manda sobre http.

**Qué NO hacer:** no usar `start:qa` para un entorno «aislado» (escribe en `.next` y le reconstruye el build por debajo a cualquier `next dev` vivo); no apuntar `DATABASE_URL` a un Postgres local esperando correr los seeds QA; nunca `prisma migrate reset` ni `migrate dev`.

---

## Hallazgos

Sin plan y sin priorizar, como pide el encargo.

1. **F1, F2 y F3 no existen fuera de esta máquina.** F1 y F2 sin pushear; F3 sin commitear. Sin copia en ningún remoto.
2. **Un fix de seguridad quedó sin commitear.** En `main`, `/setter` **no** tiene `X-Frame-Options` (`next.config.ts:85` cubre solo `admin|dashboard`) y la CSP global está en **Report-Only**, así que su `frame-ancestors` no aplica. **La zona del setter es hoy embebible en un iframe ajeno.** El fix ya está escrito en el working tree, sin commitear.
3. **`tsx` no es dependencia declarada** y de él dependen ~60 invariantes, `prisma db seed` y todos los seeds QA. Hoy funciona por un binario global de esta máquina.
4. **El panel de novedades del setter es 96% residuo de tests** (77 huérfanas de 80). Las suites siguen sumando: mi propia corrida agregó una.
5. **Ningún invariante codifica la lista de pantallas del manual.** Agregar o quitar una que no sea de Construcción no lo detecta nadie.
6. **El invariante de acuse de F3 tiene un techo conocido:** mide solo call-sites de `_actions/*.actions.ts`, así que `B-C12` (un `clipboard.writeText`) pasa en verde.
7. **Dos capturas de la galería son el mismo archivo** (`35-home-foco.png` = `36-home-cartera.png`). La cartera nunca se fotografió, y el índice declara «0 huecos».
8. **El catálogo de textos de la galería quedó atrás del producto.** Regenerar hoy da PNG frescos con un índice que usa vocabulario que P11 borró.
9. **Dos documentos posteriores a la poda siguen diciendo «las 16 pantallas del manual»**, incluida la auditoría A2 del 13/8 — un texto que P9 ya había barrido del código.
10. **`B-P1` no se arregla traduciendo.** El mensaje en español ya está escrito; Zod v3 lo descarta para ese código de issue. Hay que salir de `z.literal(true, {message})`.
11. **`main` local está 6 commits atrás de `origin/main`**, y F1/F2 están construidos sobre esa base vieja.

---

## Método, y lo que esta corrida NO puede afirmar

**Cómo se midió.** Todo lo que ejecuta corrió **secuencial, en un solo carril**, en worktrees propios fuera del repo. La paralelización fue **solo de lectura**. Todo se afirmó contra el **código fuente**, nunca contra HTML crudo ni payload RSC.

**El triage pasó por una segunda pasada adversarial** que intentó refutar la primera. Cambió 4 dictámenes de 22. Sin esa pasada, este reporte habría dicho «0 exige manejar la app», que es falso.

**NO VERIFICABLE en esta corrida, declarado y no estimado:**

- **Todo lo perceptual.** No se manejó la aplicación ni se sacaron capturas. Ningún test ni agente valida eso.
- **El comportamiento real de anuncio** de los 4 selects, del radiogroup y de los chips de fases en un lector de pantalla — es justo lo que pone a `B-C8` y `B-C3/C4/C5` en el cubo de runtime.
- **Cuál de las dos ramas del home renderiza** en un caso dado (`B-B11`).
- **Las 3 capturas «por inferencia»** del §D.4: dependen de la cartera sembrada, y no las verifiqué en el píxel.
- **`test:setter` y `test:leados` sobre `main`**: corrí las cuatro suites sobre F1+F2+F3; sobre `main` solo tipos e invariantes.

**Lo que queda para la verificación humana:** todo lo perceptual del panel; la decisión de qué se arregla primero y si los 3 baches de runtime los maneja Franco o una corrida dedicada; y la carga de las 4 URLs y de los campos de Cal.com.

---

## Anexo · Verificación de no contaminación

`git diff` contra el commit de arranque `05ae1a87`, confirmando **cero `src/`, cero tests, cero configuración**. Se pega al final del cierre.
