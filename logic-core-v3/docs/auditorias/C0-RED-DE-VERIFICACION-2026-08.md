# C0 · La red de verificación, sometida a sabotaje — 2026-08-25

**Base:** `leados/v1-integracion` @ `5ed0c24a`. Worktree de sabotaje descartable
`C:/tmp/wt-c0-sabotaje` (detached), `node_modules` por junction al checkout principal,
`.env`/`.env.local` copiados. Cero operaciones sobre la base de datos. Cero arreglos.

Esta corrida **mide**. No arregla el workflow, ni `ignoreBuildErrors`, ni un invariante,
ni un error de tipos. Los arreglos que aparecieron de una línea están anotados en el §5
y **no se hicieron**.

---

## Veredicto

**¿Existe algún gate automático hoy?** **No.** VERIFICADO. GitHub Actions solo lee
`<repo_root>/.github/workflows/`, y ahí hay un único archivo —`db-backup.yml`— que corre
por `schedule` y `workflow_dispatch`, nunca por `push` ni `pull_request`. El workflow que
sí es un gate (`e2e.yml`, con los invariantes y los tests) vive en
`logic-core-v3/.github/workflows/`, que Actions no descubre. No hay hooks de git, no hay
husky, no hay lint-staged, no hay script de `tsc`.

**¿Cuántos errores de tipos hay bajo el gate ausente?** **Cero.** VERIFICADO, y esto
**refuta una premisa del encargo**. `npx tsc --noEmit` devuelve exit 0 sin una sola línea
de salida, en los dos estados: en frío (1.466 archivos) y con los artefactos generados
presentes (1.604 archivos, 137 de ellos tipos de ruta de `.next/types`). En
`src/app/(protected)/` —los 425 archivos que el rediseño propone tocar— **cero**. No hay
deuda de tipos que escalonar porque no hay deuda de tipos.

La deuda existe, pero está en otro eje: **`npm run lint` sale en 1 con 102 errores y 110
warnings**, de los cuales **21 errores caen dentro de `src/app/(protected)/`** (20 en
`admin`, 1 en `setter`). Y el build **no** corre eslint —probado: el build pasa en verde
con esos 102 errores encima—, así que ese eje no lo tapa `ignoreBuildErrors`: no lo mira
nadie, ni siquiera con el gate encendido.

**De los seis sabotajes, ¿cuántos dieron verde?** **Dos dieron verde, tres dieron rojo, y
uno resultó no ser un sabotaje.** Uno por uno en el §3.

**¿Cuál es el falso verde más peligroso?** El de **`self-check-gate`**. Se le agregó un
hard-check inventado a `HARD_CHECKS` y se le renombró uno existente, y la suite completa
—los 22 invariantes— salió en **verde, exit 0**. Detrás de ese verde se rompe esto: el
gate del envío a revisión une el blob guardado con la lista vigente **por el texto visible
del ítem** (`item.nombre === check.nombre`), no por su `id`. Un self-check que el setter
completó 10 de 10 ayer deja de aprobar hoy —medido: `selfCheckAprobado(...)` pasa a
`false`— y su demo queda trabada sin que nada lo anuncie.

**¿Qué mecanismo crítico no tiene ningún invariante?** **`LEGAL_TRANSITIONS` —la máquina
de estados del dossier, la única puerta del `stage`.** VERIFICADO: ningún invariante de la
cadena la importa. Es estructuralmente inalcanzable desde la capa: es `const` sin
`export`, y vive en `dossier.ts`, que importa `@/lib/prisma`. Los tres invariantes que la
nombran (`escalamiento`, `progreso-isolation`, `reloop-selfcheck-reset`) la mencionan
**solo en comentarios**; ninguno importa `dossier.ts`.

**¿Encender la red se puede hacer de una?** **El chequeo de tipos, sí: de una.** Cero
errores, y sacar `ignoreBuildErrors` deja el build en verde —medido, exit 0— a cambio de
+84 s. **El workflow, no tal cual:** movido verbatim a la raíz falla en el primer paso de
los tres jobs. El detalle del costo está en el §5; el orden lo decide Franco.

---

## 1 · El estado real del gate

### 1.1 Qué archivos de workflow existen, y cuál lee GitHub Actions

Dos, y solo dos. VERIFICADO con `git ls-files`:

```
.github/workflows/db-backup.yml              ← RAÍZ. Actions LO LEE.
logic-core-v3/.github/workflows/e2e.yml      ← ANIDADO. Actions NO lo lee.
```

`git rev-parse --show-toplevel` confirma que la raíz del repositorio es el directorio que
contiene `.github/` y `logic-core-v3/`. GitHub Actions descubre workflows únicamente en
`<repo_root>/.github/workflows/`, así que `e2e.yml` nunca se ejecutó.

El reporte anterior acertó, y hay una confirmación más fuerte que la mía: **el propio
`db-backup.yml` lo documenta en su encabezado**, líneas 3-6:

> "GitHub Actions solo descubre workflows en `<repo_root>/.github/workflows/`. El archivo
> `logic-core-v3/.github/workflows/e2e.yml` está MAL ubicado y nunca corrió — pendiente
> moverlo (fuera de scope de B14.3)."

`e2e.yml` está trackeado desde `7d9548e6` (`checkpoint: pre-cleanup S21`).

### 1.2 Qué contiene el workflow anidado

Tres jobs, todos `on: [push, pull_request]`:

| Job | Qué corre | Necesita |
|---|---|---|
| `invariants` | `npm ci` → `npx prisma generate` → `npm run check:invariants` | nada más |
| `leados-integration` | idem + `prisma migrate deploy` → `npm run test:leados` | `secrets.DATABASE_URL_TEST` |
| `test` | idem + `playwright install` → `npm run test:e2e` | `DATABASE_URL_TEST`, `AUTH_SECRET`, `CHATBOT_GCP_PROJECT_ID`, `GOOGLE_VERTEX_CREDENTIALS_JSON`, `CHATBOT_IP_HASH_SALT`, `CRON_SECRET` |

**Qué pasaría si estuviera en la raíz: fallaría, y en el primer paso de los tres jobs.**
VERIFICADO. El archivo tiene **cero** directivas `working-directory` y **cero** bloque
`defaults` —medido: `grep -cE "working-directory|defaults:"` devuelve `0`—, así que cada
paso correría desde la raíz del repositorio. Y en la raíz no hay `package.json`
(`git ls-files` encuentra uno solo, `logic-core-v3/package.json`) ni directorio `prisma/`.
Simulado desde la raíz del worktree:

```
$ npm ci
npm error code EUSAGE
npm error The `npm ci` command can only install with an existing package-lock.json or
npm error npm-shrinkwrap.json with lockfileVersion >= 1.
EXIT: 1
```

Mover el archivo no alcanza. Ver §5.1.

### 1.3 Qué gates hay en `package.json`

**100 scripts. Ninguno corre `tsc`.** VERIFICADO: cero coincidencias de `tsc`,
`typecheck` o `type-check` en nombre o cuerpo de cualquier script.

`check:invariants` encadena **22** invariantes con `&&`. Pero en el archivo existen **42**
scripts `check:invariant:*` — o sea que **21 quedan huérfanos**: existen, tienen su
archivo, y ningún agregado los corre.

```
check:invariant:lead-scoring          check:invariant:announcements
check:invariant:dates-ar              check:invariant:referrals
check:invariant:lead-status           check:invariant:client-notifications
check:invariant:home-metrics          check:invariant:executive-report-plan
check:invariant:lead-detail           check:invariant:executive-report-prefs
check:invariant:recommendations       check:invariant:brief-input
check:invariant:gbp-connection        check:invariant:client-monthly-report
check:invariant:modules               check:invariant:client-monthly-report-pdf
check:invariant:motor-resenas-view    check:invariant:notifications-brevo
check:invariant:upsell-dedup          check:invariant:mask-secret
                                      check:invariant:cron-secret
```

A eso se suman ~30 scripts `test:*` del chatbot (`test:ev1`…`test:p2002`) que tampoco
están en ningún agregado.

Los otros gates que sí existen como script: `lint` (`eslint`, no encadenado a nada),
`build`, y las suites de Playwright (`test:e2e`, `test:setter`, `test:leados`,
`test:integration`). Ninguno se dispara solo.

### 1.4 Qué ignora `next.config.ts`

```ts
  typescript: {
    ignoreBuildErrors: true,
  },
```

`next.config.ts:31-33`. **No hay bloque `eslint`** —cero ocurrencias de
`ignoreDuringBuilds`—, pero eso no significa que el lint corra: VERIFICADO empíricamente
que **el build no ejecuta eslint**, porque el build sale en verde (exit 0) mientras
`npm run lint` sale en 1 con 102 errores.

El otro knob del archivo, `distDir: process.env.E2E_DIST_DIR ?? '.next'`, sigue presente
en esta rama (a diferencia de lo que valía para `main` en agosto).

### 1.5 Hooks de git

**Ninguno.** VERIFICADO en las cuatro superficies:

- `.husky/` — no existe, y no hay nada trackeado que matchee `husky`.
- `husky` / `lint-staged` en `devDependencies` — **false** en los dos casos.
- campo `lint-staged` o `husky` en `package.json`, script `prepare` — **no** en los tres.
- `.git/hooks/` — solo archivos `.sample`; cero hooks activos.

---

## 2 · Cuánta deuda de tipos hay debajo del gate ausente

### 2.1 El número

```
$ npx tsc --noEmit --incremental false --pretty false
EXIT CODE: 0
total líneas de salida: 0
```

**Cero errores.** No hay desglose por directorio que dar, ni diez errores más frecuentes
que listar: no hay ninguno. Esto contradice la premisa del encargo, y hay que decirlo:
el encargo afirma que "todo `src/app/(protected)/**` está sin chequeo de tipos". La
primera mitad es cierta —nadie lo chequea— pero la conclusión que se le colgaba (que hay
deuda acumulada que decide si el gate se enciende de golpe o escalonado) es falsa.

Que `tsc` efectivamente miró el árbol está verificado, no asumido:

| | archivos que ve `tsc` | de esos, en `src/app/(protected)/` | tipos de ruta (`.next/types`) |
|---|---|---|---|
| **A · en frío** (worktree recién creado) | 1.466 | **425** | 0 (no existen) |
| **B · con artefactos** (tras `next build`) | 1.604 | **425** | 137 |

### 2.2 ¿Errores reales o de artefactos generados?

La pregunta se contesta corriendo las dos veces, y la respuesta es **ninguna de las dos**:
son cero en los dos estados.

Vale la pena decir en qué dirección apuntaría el sesgo si lo hubiera. El worktree recién
creado **no** tiene `next-env.d.ts` (no está trackeado, lo genera Next) ni `.next/types/`.
El `include` del `tsconfig.json` los lista igual, y TypeScript ignora en silencio las
entradas que no matchean. Con lo cual el estado A no *oculta* errores: **omite chequeos**.
El estado B agrega 138 archivos —`next-env.d.ts` más 137 de tipos de ruta— y sigue en
cero. Así que los artefactos generados **suman** verificación y no aportan ruido.

`skipLibCheck: true` está activo en el `tsconfig.json`, igual que estaría en CI: no es una
diferencia entre esta medición y la que correría el gate.

### 2.3 La deuda que sí existe: lint

```
$ npm run lint
EXIT: 1
✖ 212 problems (102 errors, 110 warnings)
```

Desglose exacto (obtenido con el formateador JSON de eslint, no con regex sobre el texto):

| Directorio | errores | | Directorio | warnings |
|---|---:|---|---|---:|
| `src/components` | 29 | | `scripts/_b5*-test-scoring.ts` | 43 |
| `src/app` | 23 | | `src/modules` | 18 |
| `src/modules` | 15 | | `src/components` | 17 |
| `src/lib` | 8 | | `src/lib` | 7 |
| `src/emails` | 4 | | `src/app` | 6 |
| scripts y `.js` sueltos de la raíz | 22 | | resto | 19 |
| `src/context` | 1 | | | |

**Dentro de `src/app/(protected)/`: 21 errores** (20 en `admin/`, 1 en `setter/`) y 2
warnings.

Las diez reglas más frecuentes:

```
  57  [warning] @typescript-eslint/no-unused-vars
  47  [warning] (sin regla — directivas eslint-disable sin uso)
  37  [error]   react-hooks/set-state-in-effect
  16  [error]   @typescript-eslint/no-require-imports
  14  [error]   react-hooks/purity
  13  [error]   @typescript-eslint/no-explicit-any
   8  [error]   react/no-unescaped-entities
   4  [error]   react-hooks/refs
   3  [error]   @next/next/no-assign-module-variable
   3  [warning] react-hooks/exhaustive-deps
```

Se anota sin proponer nada: los 13 de `@typescript-eslint/no-explicit-any` contradicen la
regla no-negociable del `CLAUDE.md` ("Never use `any` in TypeScript. Zero exceptions.").

---

## 3 · Los invariantes, sometidos a sabotaje

**Línea de base:** `npm run check:invariants` → exit 0, 22/22 en verde, **117 s**.

### 3.0 El hallazgo que condiciona la lectura de todos los demás

Antes del primer sabotaje hizo falta establecer una cosa: **19 de los 22 invariantes
corren con `ts-node`, que type-chequea, y 3 corren con `tsx`, que no.** Probado con un
archivo con un error de tipos deliberado:

```
$ npx ts-node  src/lib/leados/__probe-typecheck.ts   → diagnosticCodes: [ 2322 ]   EXIT 1
$ npx tsx      src/lib/leados/__probe-typecheck.ts   → LLEGUE AL RUNTIME           EXIT 0
```

Los tres que corren sin chequeo de tipos son `check:invariant:postergacion`,
`check:invariant:contador-dms` y `check:invariant:acuse`. Importa porque —como se ve en el
sabotaje 1— buena parte de lo que estos invariantes efectivamente protegen **lo protege el
compilador, no una aserción**. Donde no hay compilador, esa mitad no existe.

Segundo hallazgo de método: la cadena usa `&&`, así que **corta en el primer fallo**. La
suite nunca reporta el cuadro completo; el primer rojo esconde el resultado de todos los
que vienen después.

---

### Sabotaje 1

```
INVARIANTE   pantallas-construccion — src/lib/leados/pantallas-construccion.invariant.ts
             (check:invariant:pantallas, ts-node)

PROMESA      «el eslabón pantalla↔fase está atado en las DOS direcciones — las N fases de
             FASE_IDS tienen su pantalla de Construcción y ninguna de las pantallas queda
             sin fase; la inversa es exacta (sin duplicados ni sobrantes) […] y `actual`
             nunca es undefined.»

SABOTAJE     contracts.ts:142-149 — los seis ids de FASE_IDS reemplazados por seis
             distintos:
                - 'estructura', 'personalizacion', 'assets', 'cta', 'calidad', 'mobile'
                + 'sab1', 'sab2', 'sab3', 'sab4', 'sab5', 'sab6'

RESULTADO    ROJO (protege)
```

`check:invariant:pantallas` sale en 1, pero **no por una aserción: por el compilador**.

```
src/lib/leados/pantallas-construccion.invariant.ts(61,20): error TS7053: Element implicitly
has an 'any' type because expression of type '"sab1" | … | "sab6"' can't be used to index
type '{ readonly estructura: "mc1"; … readonly mobile: "mc2"; }'.
diagnosticCodes: [ 7053, 7053 ]
```

**Suite completa:** exit 1, muere en el 14.º —`check:invariant:progreso`, ver sabotaje 2—
con 13 en verde antes. O sea que `pantallas` ni llega a correr: el corte del `&&` lo tapa.

Se anota: la protección real de este invariante ante este sabotaje **depende de que el
script use `ts-node`**. Si migrara a `tsx` —como ya pasó con otros tres— el TS7053
desaparece y quedaría solo lo que las aserciones vean por su cuenta.

---

### Sabotaje 2

```
INVARIANTE   progreso-isolation — src/lib/leados/progreso-isolation.invariant.ts
             (check:invariant:progreso, ts-node)

PROMESA      «saveOwnedProgreso aísla por (id + dueño) y su write es solo `{ progresoJson }`
             sin tocar `stage`; ProgresoSchema valida contra FASE_IDS y el default es un
             checklist fresco; los ids del shell son exactamente FASE_IDS.»

SABOTAJE     (a) el mismo de FASE_IDS del sabotaje 1
             (b) un progresoJson persistido con los ids VIEJOS, leído por el camino real

RESULTADO    (a) ROJO (protege)   ·   (b) VERDE — el invariante no lo ve
```

**(a)** `check:invariant:progreso` sale en 1 por aserción, no por el compilador:

```
AssertionError [ERR_ASSERTION]: el set de ids del shell es EXACTAMENTE FASE_IDS
  actual:   [ 'assets','calidad','cta','estructura','mobile','personalizacion' ]
  expected: [ 'sab1','sab2','sab3','sab4','sab5','sab6' ]
```

Ata `SHELL_CONSTRUCCION` contra `FASE_IDS` y lo hace bien.

**(b) Lo que no ve.** El invariante afirma que un shape inválido *no parsea* —y es cierto—
pero nunca pregunta **qué le pasa a un progreso ya guardado** cuando la lista cambia. El
camino real de lectura es `flow.ts:133 parseProgreso`, que **se traga cualquier blob
inválido y devuelve un checklist fresco**:

```ts
export function parseProgreso(json: unknown): Progreso {
  const parsed = ProgresoSchema.safeParse(json)
  return parsed.success ? parsed.data : { completadas: [] }
}
```

Medido bajo el sabotaje, con el blob de un setter que tildó cinco fases:

```
FASE_IDS vigente        : ["sab1","sab2","sab3","sab4","sab5","sab6"]
progresoJson persistido : ["estructura","personalizacion","assets","cta","calidad"]
parseProgreso devuelve  : {"completadas":[]}

>>> LOS 5 TILDES SE PERDIERON, EN SILENCIO. Sin throw, sin log, sin señal.
```

Es todo-o-nada: no se pierde la fase renombrada, se pierde el checklist entero.

---

### Sabotaje 3 — el falso verde más peligroso

```
INVARIANTE   self-check-gate — src/lib/leados/self-check-gate.invariant.ts
             (check:invariant:self-check, ts-node)

PROMESA      «selfCheckAprobado exige TODOS los hard-blocks VIGENTES (HARD_CHECKS) en verde
             — valida contra la lista, no contra lo que el blob afirme; cada hard es
             dealbreaker y un hard faltante no aprueba (dientes ante el drift de FG-2).»

SABOTAJE     flow-content.ts:171 — un hard-check inventado agregado a la lista, y el
             `nombre` de uno existente renombrado:
                + { id: 'sabotajeNuevo', nombre: 'SABOTAJE: chequeo nuevo agregado por C0', … }
                - nombre: 'La demo carga',
                + nombre: 'SABOTAJE: la demo abre sin error',

RESULTADO    VERDE — falso verde
```

```
$ npm run check:invariant:self-check
✓ invariante OK: selfCheckAprobado exige TODOS los hard-blocks VIGENTES […]
EXIT: 0

$ npm run check:invariants
EXIT SUITE: 0    verdes: 22/22    fallos: 0
```

**CAUSA.** Todos los fixtures del archivo se derivan de `HARD_CHECKS` en vivo:

```ts
function selfCheckTodoOk(): SelfCheck {
  return { itemsDuros: HARD_CHECKS.map((c) => ({ nombre: c.nombre, ok: true })), softFlags: [] }
}
```

Lo mismo en los checks 3, 4b y 5. El archivo **no tiene un solo fixture congelado**. Si la
lista crece, el fixture crece con ella; si un nombre cambia, el fixture cambia con él. Lo
que el invariante prueba es la lógica de `selfCheckAprobado` —que es correcta y está bien
probada—, no que la lista siga siendo la que era. Su propio encabezado lo declara como
virtud ("los fixtures se DERIVAN de `HARD_CHECKS` en vivo, sin acoplarse a etiquetas
concretas"), y esa decisión es exactamente la que lo vuelve ciego al drift que dice cuidar.

**Qué se rompe en silencio detrás del verde.** El gate une el blob guardado con la lista
vigente **por el texto visible**, no por el `id`:

```ts
export function selfCheckAprobado(selfCheck: SelfCheck | null): boolean {
  if (!selfCheck) return false
  return HARD_CHECKS.every((check) =>
    selfCheck.itemsDuros.some((item) => item.nombre === check.nombre && item.ok),
  )
}
```

Con un blob **congelado a mano** —los 10 nombres vigentes antes del cambio, los 10
tildados— medido bajo el sabotaje:

```
self-check guardado ayer: 10/10 tildados por el setter
selfCheckAprobado(...)  : false

>>> DEJO DE APROBAR. El envio a revision queda bloqueado y el invariante no lo ve.
```

`HardCheck.nombre` es simultáneamente el texto que lee el setter y la llave del gate. Una
corrección de redacción —una coma, una tilde— desaprueba todos los self-checks guardados,
y los 22 invariantes salen en verde.

---

### Sabotaje 4 — la premisa del encargo resultó falsa

```
INVARIANTE   particion — src/lib/leados/particion.invariant.ts
             (check:invariant:particion, ts-node)

PROMESA      «un lead SIN VEREDICTO jamás se sugiere para construir (barrido de todo el eje:
             caliente, respondió, fijado, gate abierto)».

SABOTAJE     el encargo pide: «hacé que un lead sin evaluacionJson reciba el rótulo de
             construir».

RESULTADO    NO CONCLUYENTE — el sabotaje no es un sabotaje: ya es el estado del código.
```

**El encargo viene de un reporte, y en este punto el reporte está equivocado.** Con el
código **intacto**, cero cambios:

```
=== CODIGO INTACTO (0 cambios) ===
stage=CONSTRUCCION  evaluacion=null -> "Pasó el filtro y le falta la demo — construila"  SI
stage=BRIEF         evaluacion=null -> "Pasó el filtro y le falta la demo — construila"  SI
stage=EVALUADA      evaluacion=null -> "Pasó el filtro y le falta la demo — construila"  SI
```

La razón está en `flow.ts:666`: **`trabajoTier` nunca lee `lead.evaluacion`.** Despacha
por `lead.stage` (más `gateAbierto`, `followUpVencido`, `postergadoVencido`). El
invariante no solo no lo prohíbe: lo **afirma como correcto**. Su fixture `construir`
(`particion.invariant.ts:126`) tiene `evaluacion: null` por default, y la línea 187 exige
que reciba ese rótulo.

El "veredicto" que el invariante custodia es **el `stage`**, no `evaluacionJson`.

**Sabotaje 4b — contra lo que el invariante sí promete.**

```
SABOTAJE     flow.ts:671 — un lead con solo ficha (sin veredicto) cae en el tier CONSTRUIR:
             - if (lead.stage === 'BRIEF' || lead.stage === 'CONSTRUCCION')
             + if (lead.stage === 'BRIEF' || lead.stage === 'CONSTRUCCION' || lead.stage === 'FICHA')

RESULTADO    ROJO (protege)
```

```
AssertionError: el orden del foco es construir → espera tu acción → contactar con demo →
                evaluar → contacto sin demo
  actual:   [ 'evaluar','construir','espera','con-demo','sin-demo' ]
  expected: [ 'construir','espera','con-demo','evaluar','sin-demo' ]
```

Suite completa: exit 1, muere en `check:invariant:particion` con 7 en verde antes.

Se anota como hueco, no como falso verde: **nada ata `evaluacionJson` a la sugerencia de
construir.** Si el `stage` avanzara sin que exista evaluación, el foco mandaría a construir
y ningún invariante lo vería.

---

### Sabotaje 5 — la aserción que no puede fallar

```
INVARIANTE   pantallas-construccion, aserción de las líneas 97-101
PROMESA      «FASES_MANUAL.construccion.pantallas divergió de PANTALLAS_CONSTRUCCION
             (el "paso N de M" contaría otra cosa)»
```

**Primero, verificar la lectura del reporte.** El reporte la describe como "compara por
referencia". Eso es impreciso: la aserción es `assert.deepEqual` sobre dos copias
(`[...A]` y `[...B]`), no un `===`. El defecto es otro y es real: **los dos operandos
salen del mismo array**. `manual.ts:310`:

```ts
construccion: { titulo: 'Construcción', pantallas: PANTALLAS_CONSTRUCCION },
```

Medido:

```
FASES_MANUAL.construccion.pantallas === PANTALLAS_CONSTRUCCION  ->  true
```

**Demostración de que no puede fallar.** Reproduciendo la topología exacta (un único array
fuente, leído por los dos lados) contra seis valores arbitrarios:

```
  PANTALLAS_CONSTRUCCION = ["mc1","mc2"]                -> asercion PASA
  PANTALLAS_CONSTRUCCION = ["mc1"]                      -> asercion PASA
  PANTALLAS_CONSTRUCCION = []                           -> asercion PASA
  PANTALLAS_CONSTRUCCION = ["zzz","yyy"]                -> asercion PASA
  PANTALLAS_CONSTRUCCION = ["mc2","mc1"]                -> asercion PASA
  PANTALLAS_CONSTRUCCION = ["a","b","c","d","e","f"]    -> asercion PASA

fallos sobre 6 valores arbitrarios: 0
>>> LA ASERCION NO PUEDE FALLAR. Es una tautologia mientras exista el alias.
```

**Pero no es código muerto, y hay que decirlo.** Rompiendo el alias —que es exactamente la
regresión contra la que la aserción está puesta— la aserción **sí** dispara:

```
SABOTAJE 5b  manual.ts:310
             - pantallas: PANTALLAS_CONSTRUCCION
             + pantallas: ['mc1']

RESULTADO    ROJO (protege)
             AssertionError: FASES_MANUAL.construccion.pantallas divergió de
                             PANTALLAS_CONSTRUCCION
               actual: [ 'mc1' ]   expected: [ 'mc1','mc2' ]
             Suite completa: exit 1, muere en check:invariant:pantallas, 16 verdes antes.
```

**Veredicto matizado:** la aserción es **vacua hoy** —imposible de fallar mientras el alias
esté— pero es un guard **latente** correcto: se vuelve viva en el instante en que alguien
hardcodea la lista, que es el único camino por el que las dos podrían divergir. No es un
falso verde peligroso; es una aserción que hoy no aporta señal y que cuesta cero mantener.
La caracterización del reporte anterior queda **parcialmente refutada**.

---

### Sabotaje 6

```
INVARIANTES  contador-dms — src/lib/leados/contador-dms.invariant.ts   (tsx)
             timeline     — src/lib/leados/timeline.invariant.ts       (ts-node)

PROMESAS     contador-dms: «el contador de DMs cuenta MENSAJES MANDADOS (SIN_RESPUESTA) […]
             y el número coincide con la definición de «toque mandado» de la cadencia.»
             timeline: «SISTEMA se MUESTRA pero NO cuenta.»

SABOTAJE     prisma/schema.prisma:1090 — un valor nuevo en el enum ActivityChannel:
                enum ActivityChannel {
                  INSTAGRAM_DM
             +    SABOTAJE_TIKTOK_DM
                  WHATSAPP
             … más una actividad con ese canal, por los caminos que cuentan.

RESULTADO    VERDE — falso verde
```

```
$ npm run check:invariant:contador-dms   → ✓ invariante OK    EXIT: 0
$ npm run check:invariant:timeline       → ✓ invariante OK    EXIT: 0
$ npm run check:invariants               → EXIT: 0   verdes: 22/22   fallos: 0
```

**CAUSA, en tres capas.**

*Primera:* **no existe ningún guard exhaustivo sobre `ActivityChannel` en todo `src/`** —
cero ocurrencias de `Record<ActivityChannel, …>`. El eje de canal se prueba con un único
caso puntual (`contarDms([whatsapp]) === 0`), que un valor nuevo no toca.

*Segunda:* el único guard de compilador del archivo es un `Record<ActivityResult, boolean>`
(línea 35) sobre el **otro** enum — y **es inerte, porque el script corre con `tsx`**.
Probado con un `Record` deliberadamente incompleto, la misma forma exacta:

```
$ npx tsx     __probe-s6b.ts  → llegó al runtime, 3 claves de 5              EXIT 0
$ npx ts-node __probe-s6b.ts  → error TS2739: … is missing … CALL_AGENDADA,
                                RECHAZADO                                    EXIT 1
```

*Tercera:* el "puente" que el invariante presume atar entre el contador de canal y la
cadencia se calcula **filtrando primero por `INSTAGRAM_DM`**
(`jornada.filter(f => f.channel === ActivityChannel.INSTAGRAM_DM)`), así que un canal nuevo
queda fuera del puente por construcción.

**Qué pasa con una actividad real de ese canal** (medido; ver §6 sobre el método):

```
SOLO_CONTACTOS_COMERCIALES = {"channel":{"not":"SISTEMA"}}
esContactoComercial(SABOTAJE_TIKTOK_DM) -> true      ← entra al conteo comercial sin que
                                                       nadie lo haya decidido
contarDmsHoy (tope de Instagram)  -> 0   (NO suma: el tope no la ve)
countFollowUps (cadencia +2/+2/+3)-> 1   (SI suma: gasta un toque)
```

Las dos definiciones que el invariante existe para mantener unidas **divergen**, y la suite
sale en verde. Un canal nuevo cuenta como contacto comercial y consume cadencia, pero no
aparece en el tope que cuida la cuenta de Instagram.

---

### Tabla de resultados

| # | Invariante | Sabotaje | Resultado |
|---|---|---|---|
| 1 | `pantallas-construccion` | `FASE_IDS` × 6 ids nuevos | **ROJO** (compilador TS7053) |
| 2 | `progreso-isolation` | ídem + `progresoJson` con ids viejos | **ROJO** en (a) · **ciego** en (b) |
| 3 | `self-check-gate` | +1 hard-check, 1 renombrado | **VERDE** ← falso verde |
| 4 | `particion` | «lead sin `evaluacionJson` → construir» | **NO CONCLUYENTE** (premisa falsa) |
| 4b | `particion` | `FICHA` → tier CONSTRUIR | **ROJO** |
| 5 | `pantallas` líneas 97-101 | — (análisis) + romper el alias | **vacua hoy** · **ROJO** al romper el alias |
| 6 | `contador-dms` + `timeline` | +1 valor en `ActivityChannel` | **VERDE** ← falso verde |

---

## 4 · Qué queda sin vigilar

### 4.1 Los tres huecos que nombró el reporte anterior

**`LEGAL_TRANSITIONS` — CONFIRMADO, y es el más grave.** Ningún invariante de la cadena lo
importa. Es estructuralmente inalcanzable: `dossier.ts:50` lo declara `const` sin
`export`, y el archivo importa `@/lib/prisma` en la línea 18, así que el harness de
`ts-node` —que carga módulos puros, sin `tsconfig-paths` ni Neon— no puede tocarlo. Los
tres invariantes que lo nombran (`escalamiento`, `progreso-isolation`,
`reloop-selfcheck-reset`) lo hacen **solo en comentarios**; ninguno importa `dossier.ts`.
La máquina de estados —`FICHA → EVALUADA → BRIEF → CONSTRUCCION → EN_REVISION → APROBADA`,
con sus ramas a `RECHAZADA` y `DESCARTADA`— solo está cubierta por `test:leados`, que es
uno de los dos jobs que nunca corrieron.

**El gate del check del dueño — CONFIRMADO parcialmente, y el defecto real es otro.**
`GRUPOS_CHEQUEO` parte los checks en dos: `setter` ("Esto lo revisás vos", 7 checks) y
`franco` ("Esto lo mira Franco", 3 checks). `selfCheckAprobado` exige **los diez**,
incluidos los tres que el copy declara que mira otro. **Ningún invariante afirma nada
sobre el eje `grupo`** — `self-check-gate.invariant.ts` no menciona ni `grupo` ni `franco`.
Y el defecto de fondo, ya medido en el sabotaje 3, es que la unión es por `nombre` (texto
visible) y no por `id`.

**El `checkId` del rechazo — REFUTADO como está enunciado.** `RechazoSchema`
(`contracts.ts:169`) **no tiene campo `checkId`**: lleva `fecha`, `motivo`, `detalle`,
`donde` y `arreglo`, y los tres últimos son texto libre. El `checkId` que sí existe está en
otro lado —`guidance-content.ts:121`, dentro de `SelfCheckRazon`—, está tipado como `string`
plano, su vínculo con `HARD_CHECKS`/`SOFT_CHECKS` es una convención escrita en un comentario,
y **`selfCheckRazones` no está poblado en ningún archivo del árbol**: cero ocurrencias de
`selfCheckRazones:`. O sea: no hay invariante porque todavía no hay mecanismo.

### 4.2 Los que se encontraron en esta corrida

1. **3 de los 22 invariantes corren sin chequeo de tipos** (`postergacion`, `contador-dms`,
   `acuse`, todos con `tsx`). Para ellos, todo guard que dependa del compilador —`Record`
   exhaustivo, `satisfies`, `Record<FaseId, …>`— es decoración. Probado en el sabotaje 6.
2. **21 scripts `check:invariant:*` huérfanos**, más ~30 `test:*` del chatbot: existen, no
   están en ningún agregado, no los corre nadie. Listados en el §1.3.
3. **La cadena `&&` corta en el primer fallo.** Medido en los cuatro sabotajes que dieron
   rojo: la suite reportó 13, 7, 16 y 7 verdes respectivamente y nunca llegó al resto. Un
   invariante roto esconde el estado de todos los que vienen detrás.
4. **Nada afirma la unicidad de `HARD_CHECKS[].nombre` ni de `[].id`.** Cero aserciones con
   `Set(`, `unic` o `duplic` sobre `HARD_CHECKS` en los invariantes. Dos checks con el
   mismo `nombre` colapsarían el gate en silencio, porque la unión es por ese campo.
5. **Nada ata `evaluacionJson` al tier de construir** (sabotaje 4). El único discriminador
   es `stage`.
6. **Nada ata el `progresoJson` persistido a la lista vigente** (sabotaje 2b).
   `parseProgreso` degrada a checklist vacío sin señal.
7. **El eslint no lo corre nadie**: no está en el build (probado), no está encadenado a
   ningún script agregado, y no hay hook. 102 errores en el árbol.

---

## 5 · El costo de encender la red

Enumerado, sin orden ni recomendación.

### 5.1 Mover el workflow a la raíz

**Qué corre hoy:** nada. Los tres jobs (`invariants`, `leados-integration`, `test`) nunca
se ejecutaron.

**¿Funcionaría tal cual?** **No.** VERIFICADO en el §1.2: cero directivas
`working-directory`, cero `defaults`, y no hay `package.json` ni `prisma/` en la raíz. Los
tres jobs mueren en su primer `npm ci` con `EUSAGE`. Lo que faltaría además del `git mv`:
un bloque `defaults.run.working-directory` apuntando a `logic-core-v3` (o un
`working-directory` por paso), y —si se quisiera cachear— la ruta del lockfile en
`actions/setup-node`.

**Cuánto tarda:**

| Job | Pasos medibles localmente | Medido | No medible acá |
|---|---|---|---|
| `invariants` | `check:invariants` | **117 s** | `npm ci` + `prisma generate` en runner limpio |
| `leados-integration` | — | — | necesita `secrets.DATABASE_URL_TEST` y `migrate deploy` |
| `test` | — | — | necesita 6 secrets + `playwright install` |

**NO VERIFICADO:** si los secrets que los jobs 2 y 3 requieren existen en el repositorio.
No se consultó la configuración de GitHub. Y los jobs 2 y 3 no se corrieron porque exigen
operaciones sobre una base de datos, excluidas por el encargo.

`invariants` es el único de los tres que no necesita ni base ni secrets.

### 5.2 Encender el chequeo de tipos

**Se puede de una. No hay nada que escalonar.** Con el número del §2: cero errores, en
frío y con artefactos. Un job de `tsc --noEmit`, o un script en `package.json`, sale verde
desde el primer día sobre los 1.466–1.604 archivos, incluidos los 425 de
`src/app/(protected)/`.

Costo medido: **`npx tsc --noEmit` en frío, sin `.tsbuildinfo`: 76 s.**

### 5.3 Sacar `ignoreBuildErrors`

**No se rompe nada.** VERIFICADO removiendo el bloque en el worktree descartable y
buildeando de cero:

```
$ npx next build --webpack
✓ Compiled successfully in 3.7min
  Running TypeScript ...
  Finished TypeScript in 84s ...
✓ Generating static pages using 15 workers (34/34) in 5.2s
BUILD EXIT: 0
```

Costo: **+84 s de build**. Cero errores emergentes. (El bloque quedó restaurado
byte-idéntico; ver §7.)

Se anota, sin proponerlo: sacarlo **no** enciende el lint. El build no lo corre.

### 5.4 Arreglar cada falso verde

| Falso verde | Qué aserción habría que escribir | ¿El dato está disponible? |
|---|---|---|
| **`self-check-gate`** (sabotaje 3) | Un fixture **congelado** —los `nombre` literales de los 10 hard-checks vigentes, escritos a mano— afirmado contra `HARD_CHECKS`. Cambiar la lista rompería el invariante, que es el punto. | **Sí.** Los 10 nombres están en `flow-content.ts:171+`. No hace falta nada nuevo. |
| **`self-check-gate` · unicidad** (hueco 4.2.4) | `assert.equal(new Set(HARD_CHECKS.map(c => c.nombre)).size, HARD_CHECKS.length)`, e ídem con `id`. | **Sí.** Una línea, con lo que ya está importado. |
| **`contador-dms` · canal** (sabotaje 6) | Un `Record<ActivityChannel, boolean>` exhaustivo —"¿este canal cuenta para el tope de Instagram?"— y otro para `esContactoComercial`. | **Sí**, pero **inerte mientras el script corra con `tsx`**: probado en el §3.6. Requiere además migrar el runner o escribir la exhaustividad como aserción de runtime sobre `Object.keys(ActivityChannel)`. |
| **`pantallas` líneas 97-101** (sabotaje 5) | Ninguna. La aserción es correcta y latente; lo que sobra es la creencia de que hoy aporta señal. | n/a |
| **`particion` · evaluación** (sabotaje 4) | Una aserción de que un `stage` de construcción **implica** `evaluacion !== null` — o la constatación de que el acoplamiento no existe y el rótulo se decide solo por `stage`. | **Parcialmente.** `HomeLead.evaluacion` está en el fixture; lo que no existe es la regla que lo ate. Es una decisión de producto, no un dato faltante. |
| **`progreso-isolation` · blob viejo** (sabotaje 2b) | Un fixture con ids literales congelados afirmado contra `parseProgreso`, y una aserción de que la degradación a `{ completadas: [] }` es intencional y no un accidente. | **Sí.** `parseProgreso` es puro y ya está importable. |
| **`LEGAL_TRANSITIONS`** (§4.1) | La tabla completa: qué transición es legal y cuál no, en las dos direcciones. | **No, no como está.** Requiere primero exportarla o extraerla a un módulo puro: hoy es `const` sin `export` en un archivo que importa `@/lib/prisma`. |

---

## 6 · Desvíos de protocolo, declarados

**1. El worktree de sabotaje se creó `--detach`, no sobre una rama descartable.** El
encargo pedía un worktree propio y descartable; se hizo exactamente eso, en
`C:/tmp/wt-c0-sabotaje` sobre `5ed0c24a` en detached HEAD. El checkout principal nunca
cambió de rama ni de HEAD.

**2. Se usó `.next` como directorio de build del worktree, no un `E2E_DIST_DIR` propio.**
El aislamiento que `E2E_DIST_DIR` provee es entre builds del **mismo árbol**; un worktree
en otra ruta del sistema de archivos ya tiene su `.next` separado, que es estrictamente
más fuerte. Además, un `distDir` alternativo no listado en `.gitignore` hace que Tailwind
escanee el HTML prerenderizado y el build muera — y `.git/info/exclude` es estado
compartido entre worktrees, así que tocarlo estaba fuera de mesa.

**3. La mitad de runtime del sabotaje 6 se midió por inyección, no regenerando el cliente
de Prisma.** `prisma generate` escribe en `node_modules/.prisma` (50 MB) y
`node_modules/@prisma/client` (74 MB), que en este worktree son una **junction al
`node_modules` del checkout principal**: regenerar habría mutado estado compartido. El
sabotaje del schema se aplicó de verdad (diff real, suite corrida encima), y el valor nuevo
del enum se inyectó en runtime con la misma forma que emitiría `prisma generate` (los enums
de Prisma son objetos planos en runtime). Lo que **no** se pudo medir así: qué haría el
compilador con el enum regenerado — aunque el §3.6 ya demuestra que para `contador-dms`
daría igual, porque corre con `tsx`.

**4. Se comprobó que el schema de esta rama es byte-idéntico al del checkout principal**
(`git rev-parse 5ed0c24a:…/schema.prisma` == `17727117:…/schema.prisma` ==
`01cd3747`) antes de reutilizar el cliente ya generado. No se corrió `prisma generate`.

**5. El commit se hizo desde `C:/tmp/wt-v1-integracion`, no desde el checkout principal.**
El encargo pedía commitear "desde el checkout principal" sobre `leados/v1-integracion`,
pero esa rama **ya está chequeada** en ese otro worktree, y el checkout principal está en
`main`. Mover el ref de una rama con checkout activo desde afuera desincroniza a la sesión
que la tiene. Se commiteó en el worktree que legítimamente es dueño de la rama, por rutas
explícitas, sin pushear. El checkout principal quedó intacto: la prueba está en el §7.

**6. Sondas temporales.** Se escribieron seis archivos `__probe-*.ts` dentro de
`src/lib/leados/` del worktree de sabotaje para medir comportamiento de runtime. Todos
borrados; el `git status --porcelain` del worktree quedó vacío tras cada uno.

---

## 7 · Prueba de inocuidad

**Los seis sabotajes, revertidos y verificados byte a byte** comparando el blob del archivo
contra el de `HEAD` (`git hash-object` vs `git rev-parse HEAD:<path>`), no por
`git checkout --` (prohibido en esta máquina: la conversión de fin de línea marca archivos
como modificados sin cambio real):

| Archivo sabotado | blob restaurado | == HEAD |
|---|---|---|
| `src/lib/leados/contracts.ts` | `7ddfc162` | ✓ |
| `src/lib/leados/flow-content.ts` | `6ba88e57` | ✓ |
| `src/lib/leados/flow.ts` | `bc4d60e5` | ✓ |
| `src/lib/leados/manual.ts` | (idéntico) | ✓ |
| `prisma/schema.prisma` | `01cd3747` | ✓ |
| `next.config.ts` | (idéntico) | ✓ |

Tras revertir todo: `npm run check:invariants` → **exit 0, 22/22 en verde**, y
`git status --porcelain` del worktree de sabotaje **vacío**.

El worktree de sabotaje se destruyó con la junction de `node_modules` desarmada **primero**
(`cmd /c rmdir`, que borra el enlace y no el destino), verificando el conteo de entradas
del `node_modules` real antes y después. El detalle está en la entrada de bitácora.

**Ningún sabotaje sobrevivió a la corrida.**
