# ENMIENDA 01 — Auditoría de renovación

> Vive en `docs/auditoria-2026-10/ENMIENDA-01.md`. **Gana sobre `PROMPT.md` y sobre `00-PLAN-Y-LOG.md` donde choquen.** Después de cualquier compactación se releen, en este orden: `PROMPT.md` → `ENMIENDA-01.md` → `00-PLAN-Y-LOG.md`.

---

## 0. Por qué cambia el plan y qué sabemos ahora

El objetivo se precisó. La auditoría deja de ser solo «encontrar problemas» y pasa a ser la **línea de base de una renovación**. Después vamos a borrar lo que no sirve, terminar lo planeado y medir el progreso en una **herramienta propia, un mapa web de nodos**, alimentada por los datos que genere esta corrida.

**Hechos que da Valentino (registralos como contexto en §1 del plan):**

- **No hay clientes reales.** Todo el sistema es de prueba o ficticio, y las credenciales del repo son de prueba. La severidad se sigue midiendo con la rúbrica DEC-23, pero el impacto se escribe como **«bloqueante para el primer cliente real»**, no como incidente activo.
- **La credencial de Vertex está vencida.** El chatbot funcionaba, pero hoy no responde en ningún entorno que use esa credencial. Va como hecho conocido en D5/D7 (ver E10).
- **El bot de WhatsApp del repo** (`/api/motor/webhook`) es la implementación que se le vende a negocios como solución de IA por WhatsApp. **BotZ es otro producto con su propio repo** y queda fuera de alcance.
- **`rediseno/home` sigue en desarrollo en paralelo** con esta corrida, en otra sesión de CC. **Su poda y su merge se tratan después**, en una sesión aparte. Esta corrida no propone borrar nada que esa rama modifique (ver E2).
- **Valentino cree** que el admin y el portal del cliente están muy desarrollados y que les faltan sobre todo módulos. **Es una hipótesis a medir, no una premisa:** 02 lo confirma o lo desmiente con evidencia.

**Lo que esto cambia en el plan:**

- **De la prosa a los datos.** El Atlas pasa a ser un **modelo de datos estable y portable**. Los `.md` se vuelven vistas generadas desde esos datos.
- **De auditar todo a auditar lo que sobrevive.** Los candidatos a poda se detectan temprano, para no leer línea por línea código que se va a borrar.
- **De respetar lo congelado a evaluarlo.**
- **Presupuesto de verificación según el riesgo.**

**Lo que NO cambia:** la corrida sigue siendo de solo lectura sobre el código de la app. No se toca nada fuera de `docs/auditoria-2026-10/` y `scripts/auditoria/`. Siguen iguales el formato de hallazgo (§5.1), los dominios, el orden y las reglas de git.

---

## 1. Respuestas a la parada de F0

- **P1 — Credenciales: son de prueba y no hay producción con clientes.** Las cuatro (a–d) van como **BAJA**, tipo seguridad, por higiene. La propuesta es sacarlas del repo antes del primer cliente real y sembrar la base de producción limpia (con un `VH` de prioridad baja).
  - **DEC-33 se reemplaza:** un secret nuevo **solo frena la corrida** si tiene formato de credencial de proveedor (API key con formato reconocible, URL de Postgres con contraseña, clave privada PEM, token de GitHub, Meta, Telegram o similar) y no es demostrablemente inactivo. Cualquier otro se registra sin el valor y la corrida sigue.
- **P2 — Congelados.** La lista se mantiene **solo como restricción de escritura de esta corrida**. Pasa a ser **objeto de análisis** (E5).
- **P3 — knip: sí** (E1).
- **P4 — Push: permitido** al cierre de cada fase (F1, cada dominio cerrado, F3, F4, F5, F6, F7), como respaldo ante un corte. Siempre con `[skip ci]` y la forma literal de DEC-02. DEC-34 queda sin efecto.
- **P5 — `DATABASE_URL_TEST`:** Valentino cree que apunta a una base de test, sin confirmar. Se mantiene `[skip ci]` y se agrega un `VH` para confirmarlo.

---

## 2. Cambios

### E1 — knip en F1
- Va como paso **F1.7b**, después de depcruise y uno por vez. Usa la config del repo (`knip.ts`, sin modificarla) y reporter JSON. La salida va a `_crudo/knip.json`.
- **El resultado de knip es una lista de candidatos, no la verdad.** En Next.js da falsos positivos: archivos de ruta (`page`, `layout`, `route`, `loading`, `error`, `not-found`), `'use server'` que se invocan desde formularios, archivos referenciados por string (`public/widget.js`, crons, `netlify/functions`), scripts de CLI e imports dinámicos.
- **Control por candidato:** `git grep` del nombre base y de la ruta del import sobre `origin/main`, más un chequeo contra las convenciones de Next. Lo que sobrevive pasa a `10-PODA.md`.
- Si knip muere por memoria o por config, queda «no disponible» y la detección se hace con los huérfanos de depcruise y `git grep`.

### E2 — Triage de poda (F1.11, nuevo) → `10-PODA.md`
Se hace al final de F1, antes de D1. **No hay parada:** se escribe el documento, se aplica la regla por defecto y la corrida sigue.

**Categorías:** archivos · exports · dependencias de `package.json` · rutas (pages y handlers) · roles y enums sin uso · server actions sin llamador · scripts one-off (`scripts/_b*`, `b1-verify-*`, seeds de sprint…) · experimentos y labs (`fg2-lab`, `styleguide`, `probe-*`, rutas de QA) · implementaciones duplicadas (por ejemplo dos sistemas de diseño: `components/design-system/` sin consumidores según su `index.ts:9`) · configuraciones muertas (`vercel.json` si Netlify es la plataforma, `DEPLOY.md`) · ramas (desde `ramas.json`) · documentos.

**Señales objetivas** (cada candidato lleva las que aplican, nunca solo una opinión): knip · huérfano de depcruise · ruta sin ningún link, `redirect` ni `href` que apunte a ella · último commit con más de 90 días y sin importadores · marcado como «experimento», «temporal» o «borrar» en código o docs · duplicado de otra implementación viva.

**Interacción con `rediseno/home`:** todo candidato que esté en la lista de archivos que esa rama modifica o borra (`git diff --name-status origin/main...rediseno/home`), o que pertenezca al home viejo que v3 reemplaza, **NO se propone para borrar ahora**. Lleva la propuesta `esperar merge de rediseno/home` y va en una sección propia de `10-PODA.md`. Esa sección es el insumo de la poda post-merge.

**Ficha por candidato:**

```
### [POD-NNN] Título
- Categoría · Archivos/LOC · Nodo(s) del Atlas · Señales: [...]
- Qué rompe si se borra (evidencia, o «nada encontrado» + la búsqueda que lo prueba)
- Confianza de poda: ALTA | MEDIA | BAJA
- Propuesta: borrar | archivar | fusionar con <x> | esperar merge de rediseno/home | decidir (Valentino/Franco)
- Zona: libre | ZONA-FRANCO | congelado
```

**Regla por defecto para F2:** los archivos con **confianza de poda ALTA** se leen en forma **superficial** (estado `superficial` en el ledger, nota `PODA-ALTA`). El resto se lee en profundidad como estaba previsto. `10-PODA.md` informa cuántas LOC quedaron fuera de la lectura profunda por esta regla. Si Valentino decide conservar algo de eso, se audita en ese momento.

### E3 — Presupuesto de verificación
- **El verificador adversarial por lote corre solo para CRÍTICA y ALTA.** DEC-31 se mantiene.
- **MEDIA y BAJA** quedan como `PROBABLE` con `ruta:línea` del lector. El padre **muestrea 1 de cada 5 por lote** (mínimo 1). Si más de 1 de cada 5 muestreados no se sostiene, el padre verifica el lote entero y lo anota en el log.
- Los hallazgos `ZONA-FRANCO` siguen la misma regla.

### E4 — Ciclos
- **D1, D2 y D5:** hasta **3** ciclos (ciclo 2 con lente de seguridad y aislamiento; ciclo 3 con lente de errores, carreras y límites de plan).
- **Resto de dominios:** hasta **2** ciclos.
- La regla de cierre de §7 no cambia. Al tope, se cierra con `[DOMINIO-ABIERTO]`.
- **F6.1, la auditoría ciega, se mantiene.**

### E5 — Congelados → `11-CONGELADOS.md`
Se analiza cada archivo congelado: los 6 explícitos del PROMPT, `src/components/ui/*` como grupo, `dashboard-actions.ts` y los 14 inferidos en DEC-10. Por cada uno:

- **Origen:** por qué y cuándo se congeló (`git log` del archivo, docs, `CLAUDE.md`).
- **¿La razón sigue vigente?** Con evidencia de hoy.
- **Qué bloquea mantenerlo congelado.** Por ejemplo: `ui/*` bloquea la renovación visual de F3; `PreloaderContext` envuelve todas las rutas y hace fallar el QA visual de `/dashboard`; `schema.prisma` congelado impide borrar modelos muertos; `HeroArtifact` y `TransitionContext` pueden morir con el home viejo cuando entre v3.
- **Riesgo de soltarlo:** importadores, qué cubren los tests, qué zonas toca.
- **Recomendación:** mantener · descongelar · reemplazar · borrar (o «después del merge de rediseno/home» si depende de esa rama). Siempre con su razón.

Al final, una **propuesta de política que reemplace «congelado»** por niveles, por ejemplo *protegido* (se cambia con plan aprobado más un gate específico) y *libre*, con el gate concreto de cada archivo protegido. La propuesta tiene que salir de lo medido, no ser genérica.

### E6 — Lo planeado contra lo real → `12-PLANEADO.md`
**Fuentes:** `docs/roadmap-pendientes.md`, `docs/bitacora-roadmap.md` y las demás `bitacora-*.md` (por extracción de pendientes, promesas y decisiones, no línea a línea), todas las auditorías previas de §1 del plan, `STATUS.md`, `PRODUCT.md`, `DESIGN.md`, `raíz:lane-*.md`, `AUDITORIA-VS-BRIEF-2026-07.md`, `docs/sprints/`, los TODO/FIXME del código, y **`_insumos/drive/`** (registros de cambios de Drive que Valentino va a exportar).

**Insumos de Drive:** `_insumos/` **no se commitea nunca** (no se stagea; queda local). Se revisa **al inicio de F1 y al inicio de cada dominio**: si apareció contenido nuevo, se procesa ahí y se anota en el log. Si llegan en `.docx` y no hay con qué leerlos sin instalar nada, se anota y se le pide a Valentino la exportación en Markdown.

**Por cada ítem planeado:** fuente (`doc:línea`) · nodo del Atlas al que pertenece · estado en código: `hecho` | `parcial` | `no empezado` | `abandonado` | `contradicho`, con evidencia `ruta:línea` o la búsqueda que prueba la ausencia · ¿sigue teniendo sentido? (sí / no / decidir).

Agrupado por herramienta de §6. Alimenta `02-PENDIENTE.md`, el campo `alcance` del Atlas (E7) y el backlog.

### E7 — El Atlas es datos portables (cambia F5)
El Atlas se emite **como datos**, y los `.md` de `06-ATLAS/` se **generan** desde ellos. **El visor web no se construye en esta corrida:** es un sprint aparte. **Requisito de diseño:** los datos y los generadores tienen que poder mudarse a otro repo sin cambios. El contrato son los archivos JSON y su schema, no el código de la app.

**Jerarquía:** `area` → `herramienta` → **`funcionalidad`** (el nodo mínimo que se mide). Los archivos son atributos del nodo, no nodos. La funcionalidad es la unidad de madurez: los lectores de F2 emiten, por herramienta, la lista de funcionalidades con nombre, una línea de descripción, archivos, entradas, madurez y los criterios L3 que faltan. La madurez de herramientas y áreas es un **cálculo agregado**, nunca se carga a mano.

**Archivos** (en `06-ATLAS/`):

- **`atlas.schema.json`** — JSON Schema del contrato, con `schemaVersion: 1`. Todo JSON del Atlas declara su `schemaVersion` y valida contra él.
- **`atlas.json` — GENERADO,** se pisa en cada regeneración.
  ```
  { "schemaVersion": 1, "generado": { "repo", "ref", "sha", "fecha" },
    "nodos": [ { "id", "tipo", "nombre", "padre", "area", "descripcion",
                 "archivos": [], "loc", "rutas": [], "modelos": [], "entradas": [],
                 "dueno", "zona", "ultimo_commit", "ramas": [] } ],
    "aristas": [ { "de", "a", "tipo" } ] }
  ```
  - `tipo` de nodo: `area` | `herramienta` | `funcionalidad` | `lib` | `modelo` | `integracion` | `rama` | `doc`.
  - `tipo` de arista: `contiene` | `importa` | `usa-modelo` | `llama-api` | `dispara` | `depende`.
  - `zona`: `libre` | `franco` | `congelado`.
  - **IDs estables** (`h2.cli-inicio`, `h2.cli-inicio.resumen-semanal`…), nunca reutilizados.
- **`atlas.curado.json` — CURADO.** Lo escribe esta corrida y después lo mantienen los humanos o CC. **Ningún generador lo pisa jamás.**
  ```
  { "schemaVersion": 1, "nodos": { "<id>": {
      "madurez": "L0..L4|L?", "madurez_evidencia": "", "criterios_l3_faltantes": [],
      "veredicto": "mantener|mejorar|fusionar|borrar|decidir",
      "alcance": "1.0|despues|descartado|sin-decidir", "alcance_propuesto": "1.0|despues|descartado",
      "notas": "", "decisiones": [ { "fecha", "texto", "quien" } ] } } }
  ```
  `alcance` arranca en `sin-decidir` para todos: **lo deciden Valentino y Franco.** La corrida solo llena `alcance_propuesto`, con su razón en `notas`.
- **`hallazgos.json` — GENERADO** por el parser de `validar.mjs` desde 02/03/04/05/10: `{id, severidad, tipo, confianza, nodo, archivo, linea, zona, estado}`. La fuente siguen siendo los `.md`.
- **`backlog.json` — GENERADO desde `07-BACKLOG.md`:** `{id, titulo, nodos[], hallazgos[], bloque, nivel_proceso: S|M|L, tamano, riesgo, prereqs[], modelo, esfuerzo, ultracode, criterio, estado}`.
- **`historial.jsonl` — GENERADO.** Cada corrida del generador agrega una línea, sin pisar las anteriores, con `{fecha, sha, por_madurez, por_veredicto, por_alcance, hallazgos_abiertos_por_severidad, loc_total, tarjetas_por_estado}`. Es la curva de progreso.

**Métrica de progreso** (la calcula el visor; el generador deja los datos crudos):
1. **Avance 1.0** = funcionalidades con `alcance: 1.0` y madurez ≥ L3, dividido por el total de funcionalidades con `alcance: 1.0`. Por área, por herramienta y global.
2. **Trabajo restante** = suma de tamaños (S=1, M=3, L=8) de las tarjetas abiertas vinculadas a nodos `1.0`.
3. **Barrera de 1.0:** cero hallazgos CRÍTICA o ALTA abiertos en nodos `1.0`.
4. **De contexto, no de avance:** LOC netas (la poda baja el número) y la distribución por madurez.

**Reglas:**
1. **Todo hallazgo, ficha de poda, ítem planeado y tarjeta referencia al menos un id de nodo.** `validar.mjs` lo controla, y también la validación contra `atlas.schema.json`.
2. **Generadores portables** en `scripts/auditoria/atlas/`, con un `README.md` propio:
   - Solo módulos nativos de Node, más lo que ya está instalado en el repo, declarado explícitamente.
   - **Ningún import de `src/`.**
   - Parámetros `--repo <ruta>` y `--ref <ref|HEAD|worktree>`.
   - Tienen que funcionar sobre cualquier commit futuro, no solo sobre `57c421bc`.
3. Los `.md` de `06-ATLAS/` (`rutas`, `datos`, `dependencias`, `ramas`, `modulos/*`) se generan desde `atlas.json` + `atlas.curado.json`. `regenerar.md` documenta los comandos PowerShell exactos.
4. **Control positivo:** los conteos de rutas coinciden con §3 del plan (86 `page.tsx`, 36 handlers…) y los nodos `modelo` con los 63 modelos.
5. `scripts/auditoria/README.md` dice qué script es herramienta permanente y cuál fue de un solo uso.

### E8 — Propuesta de `CLAUDE.md` y del ciclo de actualización del mapa → `13-CLAUDE-MD-PROPUESTO.md`
**No se aplica nada.** Solo se propone, con evidencia.

**Insumos:** las 26 contradicciones de §10 del plan, lo que salga de F2, `raíz:CLAUDE.md`, `AGENTS.md`, `.claude/` (settings, hooks, comandos y agentes existentes), `.impeccable/` y `.github/skills/impeccable/` (evaluar si se usan y si chocan con el stack), y la estructura de docs de E11.

**Contenido:**
1. **Auditoría del `CLAUDE.md` actual:** cada afirmación clasificada como vigente · falsa (con evidencia) · vieja · duplicada con `AGENTS.md`.
2. **Borrador nuevo de `raíz:CLAUDE.md`, de no más de 200 líneas,** solo con lo que siempre es cierto. Los `CLAUDE.md` anidados por área (zona Franco en `setter/`, `src/modules/chatbot/`, `prisma/` con el protocolo de migraciones) con su borrador corto.
3. **Reglas candidatas a pasar de prosa a mecanismo,** con el mecanismo concreto:
   - Regla de eslint: `no-explicit-any`, `no-restricted-imports` para `framer-motion`.
   - Hook `PreToolUse` de Claude Code: bloquear Edit/Write en archivos protegidos; bloquear `git add .`, `stash`, `reset`, `migrate dev|reset`, `npm run build`.
   - Chequeo de CI.
4. **Ciclo de actualización del mapa** (el mapa no puede depender de que alguien se acuerde). Diseño concreto de tres piezas:
   - **(a)** La definición de terminado de cada sprint en `CLAUDE.md`.
   - **(b)** Una skill de proyecto `atlas-actualizar` (qué lee, qué escribe en `atlas.curado.json`, qué regenera).
   - **(c)** Un hook `Stop` que, si el sprint tocó `src/` o `prisma/` y no actualizó `atlas.curado.json`, bloquea el cierre con el mensaje de qué falta.
   - Más un chequeo de CI que valida el Atlas contra el schema y contra los archivos que existen. Es un aviso, no rompe el CI.
5. **Qué hacer con `AGENTS.md`** (fusionar, importar o borrar) y con `STATUS.md` y `DEPLOY.md`.

### E9 — Coordinación con la sesión paralela de `rediseno/home`
- **Antes de cada comando pesado** (tsc, eslint, knip, depcruise, generadores sobre todo el repo), leé la memoria libre con `Get-CimInstance Win32_OperatingSystem` (`FreePhysicalMemory`).
  - Si hay **menos de 4 GB libres**, esperá 10 minutos y repetí, hasta 3 veces.
  - Si sigue bajo, el paso queda «no disponible por memoria» con `[TIMEBOX]` y seguís.
  - **Nunca matás procesos de otro worktree.**
- **F3 lee `rediseno/home` en un commit fijo:** el `HEAD` de esa rama al empezar F3, anotado en `04-DISENO.md`. Esa rama se mueve, y 04 avisa que los tokens pueden cambiar hasta el merge.

### E10 — Credenciales y dependencias externas que vencen
En D7, una tabla de **toda credencial o cuenta externa de la que depende el sistema** (Vertex, Brevo, Resend, Google OAuth, Sentry, Search Console/GA4, GBP, Tiendanube, cal.com, Telegram, Meta/WhatsApp, n8n, Neon, Netlify).

**Por cada una:**
- Dónde se lee (`ruta:línea`).
- Qué funcionalidades se caen si vence.
- **Si el sistema se entera:** ¿error capturado en Sentry?, ¿alerta?, ¿fallback?, ¿mensaje útil al usuario?
- Cómo se renueva (`VH` en 08).

**El vencimiento de Vertex es un hecho conocido:** registralo como hallazgo (sin el valor) y usalo como **control positivo** de la tabla. Si el código no tiene forma de enterarse de que la credencial venció, eso es en sí un hallazgo.

### E11 — Esquema general y docs consolidados → `14-DOCS-CONSOLIDADOS/`
Valentino quiere que todo lo conversado y craneado (auditorías, roadmaps, planes, bitácoras, registros de Drive) quede **resumido en pocos documentos vivos**, y que el resto se borre.

- **En esta corrida solo se redacta. No se borra ni se edita ningún doc existente.**
- **`14-DOCS-CONSOLIDADOS/`** contiene los **borradores completos** de la estructura de docs propuesta, **no más de 10 documentos vivos**. Por ejemplo: `VISION.md` (qué es develOP y qué vende el sistema) · `ARQUITECTURA.md` (generado desde el Atlas) · `ROADMAP.md` (generado desde `alcance` + backlog) · `DECISIONES.md` (registro de decisiones vigentes con fecha y fuente, deduplicadas de bitácoras y auditorías) · `OPERACIONES.md` (deploy, crons, credenciales de E10, backups) · `LECCIONES.md` (solo las vigentes) · `CONVENCIONES` (va a `CLAUDE.md`, E8).
- La estructura final la propone la corrida con su razón. Cada afirmación lleva su fuente (`doc:línea` o `ruta:línea`), y **las decisiones contradictorias entre fuentes se listan aparte como «a decidir»**, sin resolverlas.
- **`10-PODA.md` §docs** queda como la lista de borrado: qué doc se borra, qué consolidado lo reemplaza y qué se pierde, si algo. Borrar y reemplazar es un sprint S posterior.

### E12 — Entregables, orden y backlog
**Se suman a §5 del PROMPT:** `10-PODA.md`, `11-CONGELADOS.md`, `12-PLANEADO.md`, `13-CLAUDE-MD-PROPUESTO.md`, `14-DOCS-CONSOLIDADOS/` y los JSON de `06-ATLAS/` de E7.

**Orden:**
- `10-PODA.md`: en F1.11.
- `12-PLANEADO.md`: extracción en F1; el cruce con el código se completa en cada dominio.
- `11-CONGELADOS.md`: después de D9.
- `13` y `14`: en F6, antes del backlog.

**Backlog (F6.4):**
- Suma tarjetas de poda, congelados, credenciales y consolidación de docs.
- Cada tarjeta lleva `nivel_proceso`: **S** (prompt corto, sin plan) · **M** (plan corto) · **L** (ritual completo).
- Modelo, esfuerzo y ultracode según esta tabla:

| Tipo de tarjeta | Modelo · esfuerzo · ultracode |
|---|---|
| S mecánica (borrar con lista cerrada, renombrar, regenerar, docs) | Sonnet 5.5 · medium · OFF |
| M con spec clara (feature, bug, refactor acotado) | Sonnet 5.5 · high · OFF (si falla → Opus 5.5 · medium) |
| L ambigua, seguridad, arquitectura, multi-área | Opus 5.5 · high · OFF (ON solo si cruza muchas áreas) |
| Visual fino, 3D, timing | Opus 5.5 · xhigh · OFF |
| Poda masiva o migración que cruza el repo | Opus 5.5 · high · ON |

**`RESUMEN.md` suma:** LOC candidatas a poda por confianza, congelados recomendados para soltar, planeado hecho / parcial / no empezado, la tabla de credenciales en una línea por servicio, y el Avance 1.0 propuesto (con `alcance_propuesto`).

### E13 — Re-estimación
Antes de arrancar F1, recalculá en §8 del plan la estimación con E2–E4 aplicados. Al cierre de F1, recalculala de nuevo con la poda real. Registrá las dos.

---

## 3. Qué hacés ahora

1. Integrá esta enmienda en `00-PLAN-Y-LOG.md`: DECs nuevas o modificadas, contexto de §0 en §1, §7, §8, §11 con las respuestas, y una línea en §13 «C00b · enmienda 01».
2. Commit archivo por archivo (`ENMIENDA-01.md` y el plan), `[skip ci]`, push.
3. Mostrame el diff conceptual del plan en ≤20 líneas y **arrancá F1 sin esperar**: esta enmienda es el `Aceptar`.
