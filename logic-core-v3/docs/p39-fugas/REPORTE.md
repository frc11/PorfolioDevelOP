# P39 · Las fugas — cinco cerradas, y la base que vuelve a su estado

2026-09-14. Rama `p25/rafaga-tildes`, HEAD `4f8c00a2` (sin commitear, igual que P29–P38). Nada pusheado, nada agregado a git.

**Base: la branch Neon de desarrollo, `ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech`** (base `neondb`) — el único
host en `.env.local`; todo script que escribe aborta si no es ese.

**Cero líneas de producto.** Cambiaron pruebas, tres configs de Playwright, un script de medición, dos helpers nuevos y
cuatro instrumentos nuevos.

---

## 0 · Terreno

| | |
|---|---|
| Git | HEAD `4f8c00a2` · `main` = `origin/main` = `57c421bc` · 28 worktrees y 2 stashes, no tocados |
| WIP ajeno | `numstat` + copia de los 162 archivos modificados/no rastreados en `C:\tmp\p39-fugas\wip-copia` (md5). Al cerrar: **161 idénticos**; distinto solo `28-veredicto-y-ciclo.spec.ts` (lo toca P39) y la bitácora |
| Procesos | 21 `node` ajenos (siete `chrome-devtools-mcp` con su watchdog), ningún servidor en 3000–3099. Servidores propios bajados por el PID del socket |
| Disco | 31 GB libres al arrancar, 30 GB al cerrar |
| `tsc` | exit 0 |
| Invariantes | 57/57 (58 descubiertos, 1 excluido) |
| Suites | `test:leados` **43/43** · `test:helpers` **28/28** · `test:setter` **194/194** (build propio `.next-setter`, `next start` en 3003, `SETTER_EXTERNAL_SERVER=1`) |
| Mediciones fijas | franja **224/224** · pliegue **1062/1062** celdas iguales a P36 |

### El instrumento

`scripts/p39-censo-base.mts` (solo lectura) fotografía **las 63 tablas del schema contadas**, los leads, usuarios y avisos con
su id y su categoría, y el panel de Novedades de `setter-qa` con **la misma llamada que el page**. `--comparar=a,b` nombra
por id toda fila que apareció o desapareció. Toda afirmación «deja / no deja filas» de este reporte es una comparación de
dos fotos, no una deducción.

### La base al arrancar

105 `OsLead` · 21 `User` · **91 `OsSetterNotice`**: 6 de semilla con lead (3 `DEMO_APROBADA` + 3 `DEMO_RECHAZADA`) y **85
de la fuga de 07-G1**. De los 6 de semilla, **1** entraba en los 50 que lee el panel.

### Qué dejan hoy las tres suites (Fase 0, código original)

| Tramo | Tablas con delta |
|---|---|
| `test:leados` | ninguna |
| `test:helpers` | ninguna |
| `test:setter` | **`OsSetterNotice` +1** — `LEAD_REASIGNADO_SALIENTE` → setter-qa, «SMOKE-SETTER AsignaCaliente 1789351998545 pasó a otro setter…» |

Con ese aviso, 86: el panel de `setter-qa` pasó a leer **0 de 6** avisos de semilla y dibujar una sola fila, la de la fuga.

---

## 1 · La fuga que degradaba el panel — `07-admin-assign-caliente` G1

**Causa.** La reasignación real (`assignLeadSetter`) emite `LEAD_REASIGNADO_SALIENTE` al dueño previo con `leadId: null`,
por diseño (`lead.actions.ts:200`). El teardown borraba avisos por lead y por setter creado; ese aviso va a `setter-qa`, que
la prueba no crea.

**Arreglo** (`07-admin-assign-caliente.spec.ts`, +32). Antes del clic en «Guardar asignación» se anotan los ids de los
avisos salientes que `setter-qa` ya tenía. Después de la acción, con poll: el aviso nuevo es el que **no existía antes**,
va a `setter-qa`, es `LEAD_REASIGNADO_SALIENTE` sin lead y **nombra al lead de esta corrida** (su nombre lleva el stamp). Se
exige exactamente uno y su id entra al tracker (`avisoIds`, campo nuevo); el teardown lo borra por id. Una corrida en
paralelo que reasigne otro lead no entra (otro nombre, y otro id).

El producto no cambió: el aviso sin lead sigue siendo el diseño.

| 07 sola, build propio | Tablas con delta |
|---|---|
| **antes** | `OsSetterNotice` **+1** (92 → 93) |
| **después** | **ninguna** (93 → 93) |

Y en las dos corridas completas posteriores de `test:setter` (Paso 2 y Paso 5): ninguna tabla con delta.

---

## 2 · Los acumulados

### 2.1 · Censo

| | |
|---|---|
| Cuántos | **87** — los 85 del arranque + 2 de mis corridas «antes» (Fase 0 y 07 sola) |
| De qué corridas | 15 días distintos por el stamp del lead: 26-ago → 14-sep (el más poblado, 13-sep con 16) |
| Firma | los 87: cuerpo idéntico a `copyNovedad('LEAD_REASIGNADO_SALIENTE', 'SMOKE-SETTER AsignaCaliente <13 dígitos>')`, a `setter-qa`, sin lead, **emitidos 1,9–4,2 s después del stamp** de su lead (lo que tarda G1 entre sembrar y asignar) |
| ¿Corrida viva? | **ninguno** conserva su lead en la base (su teardown ya corrió); ninguno leído |
| ¿Alguna prueba los necesita? | **No.** Leen avisos salientes: `02-isolation` C4 (siembra el suyo en `setter-qa`), `26` (setter propio), `leados/aislamiento-superficies` (setter propio). Ninguna lee los de otra corrida. Al revés: con la fuga en la bandeja, el aserto del lado A de C4 («Te reasignaron un lead» visible) se cumplía aunque su propio aviso no se dibujara |
| Qué no se borra | lo que no se puede determinar: un aviso fuera de la firma exacta, uno leído, o uno cuyo lead siga existiendo. Hoy: **cero** en esa condición |

La lista de ids quedó escrita (`C:\tmp\p39-fugas\paso2\ids.json`) antes de borrar. La herramienta borra **esa lista**, no un
criterio; la firma se re-verifica al borrar como control (`--esperar-aviso-fuga-g1`): si un solo aviso dejó de coincidir,
no se borra ninguno.

### 2.2 · Respaldo y vuelta atrás, probada

Herramienta nueva: `scripts/dev/borrar-por-identidad.mts` (ensayo por defecto, host dev obligatorio, respaldo releído
antes de borrar, `--restaurar` que compara la base contra el respaldo columna por columna, `--comparar-respaldos`).

Primero se probó con los 7 leads que dejaron las demostraciones «antes» (§3): borrar (A) → restaurar → **VUELTA EXACTA** →
borrar (B) → **A = B idénticos** columna por columna.

Con los 87:

| Paso | Resultado |
|---|---|
| ensayo | 87 pedidos, 87 encontrados, los 87 con la firma |
| borrar (A) | 87 borrados · base: 6 avisos |
| restaurar A | **VUELTA EXACTA** (87 filas, columna por columna) · base: 93 |
| borrar (B) | 87 borrados |
| A vs B | **IDÉNTICOS** columna por columna |
| control del comparador | B con **una** columna alterada (`read`) → «DISTINTOS: 1 diferencias» |
| restaurar A (para medir el DOM con la fuga) → borrar (C) | VUELTA EXACTA · **A = C** idénticos |

Respaldos fuera del repo: `C:\tmp\p39-fugas\paso2\{A,B,C}\`.

### 2.3 · Conteos por categoría

| | antes | después |
|---|---|---|
| `OsSetterNotice` `FUGA_07_G1` | 87 | **0** |
| `OsSetterNotice` con lead (semilla) | 6 | 6 |
| `OsLead` (las seis categorías) | 105 | 105 |
| `User` | 21 | 21 |
| Las otras 61 tablas | — | sin delta |

### 2.4 · El panel — el número que prueba que sirvió

| `setter-qa` | con la fuga | sin la fuga |
|---|---|---|
| Avisos sin leer | 93 | 6 |
| Semillas dentro de los 50 leídos | **0 de 6** (1 de 6 al arrancar el sprint) | **6 de 6** |
| Panel dibujado (navegador real, `main`) | **1 fila**: «Te reasignaron un lead ×50 …» · **0 semillas** | **4 filas, las 4 de semilla** · 0 de la fuga |

Por qué 4 y no 6: los otros dos son de `QA-W Construccion`, que está en la cola visible — su aviso se deduplica contra la
cola por diseño (P21), igual que antes de la fuga. Instrumento: `scripts/p39-panel-dibujado.mts`.

### 2.5 · Las tres suites después de borrar

`test:leados` **43/43** · `test:helpers` **28/28** · `test:setter` **194/194**. Ninguna se cayó; no hubo que restaurar.
Ninguna tabla con delta en toda la corrida.

---

## 3 · Las otras cuatro fugas

### 3.1 · El caso `alta` de perf, que nunca registraba el lead que crea

**Causa.** El lead lo crea el formulario (`/setter/nuevo`); el caso no sembraba nada y nadie registraba el id.

**Arreglo.** `Caso.adoptarCreado?` (`tests/perf/_casos.ts`): el caso `alta` espera la URL destino y registra en el tracker
el id que trae. El runner (`recorrido-latencia.spec.ts`, +1) lo llama **después** de cosechar la medición: no la toca.

| `recorrido-latencia`, `PERF_PASADAS=1`, build propio | Tablas con delta |
|---|---|
| **antes** | `OsLead` **+1** — «SMOKE-SETTER P28 alta 1789391397796» (uno por pasada) |
| **después** | **ninguna** · la fila `alta` sigue «registrado sí» |

### 3.2 · La ráfaga, con la limpieza fuera del bloque que siempre corre

**Arreglo.** `scripts/qa-corridas/medir-rafaga-progreso.ts`: el cuerpo de la medición dentro de `try`; el teardown y el
cierre del navegador en el `finally` (este último lo pidió la revisión de código, ver §8).

| Error inducido (`RAFAGA_BASE_URL` a un puerto cerrado) | Salida | Tablas con delta |
|---|---|---|
| **antes** | exit 1, sin línea de limpieza | `OsLead` **+1** · `OsLeadDossier` **+1** |
| **después** | exit 1 (el error sigue saliendo) + «limpieza: 1 leads borrados por id exacto» | **ninguna** |

La medición real contra 3003 sigue andando: ventana 0 ms (la de después de P25), «limpieza: 18 leads borrados», base en 105.
Repetido después de mover el cierre del navegador al `finally`: error inducido y medición real, los dos sin delta.

Límite, dicho: el script corre con `tsx`, fuera de Playwright, así que el registro de siembra (§3.3) no está activo ahí. Un
error queda cubierto por el `finally`; un Ctrl+C a mitad de la medición todavía deja sus leads, como antes.

### 3.3 · Las corridas matadas — una limpieza al arrancar

**Por qué no la herramienta de P37 en un `globalSetup`.** Borra por criterio (stamp de 13 dígitos + edad): se llevaría lo
de una corrida viva en otro checkout que comparte la base y cualquier fila con el mismo formato. La regla del sprint es
identidad exacta.

**Arreglo: anotar, no buscar.**

- `tests/helpers/siembra-registro.ts` (nuevo): cada lista del tracker (`leadIds`, `userIds`, `avisoIds`) es un array común
  cuyo `push` **escribe el id** en un archivo del proceso (`<tmp>/develop-siembra-en-curso/<host>/<pid>-<inicio>.jsonl`)
  antes de agregarlo; el teardown anota las bajas; cuando no queda nada pendiente, el archivo se borra.
- `tests/helpers/limpieza-al-arrancar.ts` (nuevo), `globalSetup` de `playwright.setter`, `.leados` y `.perf`: lee los
  registros de **procesos que ya no existen** y borra por id exactamente lo que quedó sin baja; los de procesos vivos no
  se tocan. Después activa el registro para su corrida (los workers heredan la variable).
- `setter-db.ts`: `borrarPorIdentidad` es ahora el borrado único del teardown y de la limpieza al arrancar.
- **Solo anota cuando la corrida lo activa**: `scripts/dev/m0-galeria-seed.ts` usa el mismo tracker y NO borra a propósito;
  si anotara siempre, la próxima suite se llevaría la galería.

| Demostración (`03-cabina`, muerto por PID con `taskkill /T` apenas pasa D1) | Resultado |
|---|---|
| **antes** · al matar | `OsLead` **+5** · `OsLeadDossier` **+5** · `OsLeadActivity` **+1** |
| **antes** · la corrida siguiente (`11-fase-disabled`) | **112 → 112**: los 5 siguen ahí |
| **después** · al matar | +5 / +5 / +1, y el registro del worker (pid 64012) con las **5 altas** |
| **después** · la corrida siguiente | «[siembra] corrida interrumpida (pid 64012): pendientes 5 leads → borrados 5» · ida y vuelta **sin delta** · registro vacío |
| **control** · corrida viva en paralelo | con `03-cabina` en curso, otra corrida arrancó: «1 registro(s) de procesos vivos — no se tocan»; `03-cabina` terminó **5/5** |

**Un hueco que apareció en el camino, cerrado.** En la corrida de suites del Paso 2 la limpieza al arrancar encontró un
registro muerto con 1 lead pendiente que ya no existía (0 borrados). Era `leados/dossier-gates.spec.ts:284`: borra el lead
a mano y lo **saca del tracker con `splice`**, sin pasar por el teardown. Arreglado en la lista anotada, sin tocar la spec:
lo que sale por `splice` se da de baja. La corrida de leados siguiente terminó con el registro vacío.

**Límites, dichos.** Un proceso matado entre el INSERT y el `push` (milisegundos) deja una fila sin anotar. Si el sistema
reusa el PID de un muerto antes de la próxima corrida, su registro se toma por vivo y queda para la siguiente. Los dos
fallan por el lado seguro: queda una fila, no se borra una ajena. `escrituraSola` del caso `alta` crea y borra en la misma
línea sin tracker (ventana de milisegundos, sin cambio).

### 3.4 · La prueba que dependía de la bandeja ajena — `28` N6, setter propio

P38 ya había sacado la premisa operante (su lead fuera de la cola, pausado). Quedaba la bandeja: el panel lee los 50 avisos
sin leer **más nuevos** del setter, y N6 afirmaba sobre los suyos en la de `setter-qa`.

**Arreglo** (`28-veredicto-y-ciclo.spec.ts`): el lead de los dos avisos y sus avisos van a un setter creado por el test
(`createSetter`); N6 entra con esa sesión (`mintSessionCookie`, página nueva). Los asertos no cambiaron.

| N6 sola, build propio | Bandeja de `setter-qa` como hoy | + 50 avisos sin leer más nuevos en `setter-qa`* |
|---|---|---|
| **antes** | verde | **roja** — «los DOS avisos de este lead tienen que estar en el panel… Expected: 2 · Received: 0» |
| **después** | verde | **verde** |

\* Sembrados por id con fecha dos horas adelante — lo que dejaría otra corrida sobre la misma persona mientras N6 corre, o
la fuga acumulada — y borrados por id (50 de 50, 0 quedan). `scripts/p39-demo-bandeja-llena.mts`.

**Control**: s1 de P38 (ninguna orden caduca) en un build aparte → N6 **roja** en «tiene que decir qué pide el lead HOY»,
después de pasar su control positivo de los dos avisos. No quedó ciega.

---

## 4 · El selector intermitente — `26-cola-de-trabajo`

**Arreglo.** `main section[aria-label="Nada para trabajar ahora"]` (P21-4). Revisado el archivo entero con el mismo riesgo
—todo locator suelto que pase por *strict mode* (`toBeVisible`, `evaluate`) o por un conteo positivo—: también el helper
`cola` (P21-1/2/3: `toBeVisible`, `toHaveCount(2)`, `toHaveCount(1)`, `evaluate`) y `novedades` (P21-2: `evaluate`). Los
`page.getByText(…)` con `toHaveCount(0)` quedan sobre la página a propósito: la copia del streaming no puede volver rojo un
cero, y mirar la página entera es más estricto para una ausencia. Lo que se afirma no cambió.

**Las diez corridas.**

| `26` completo (4 pruebas), build propio | antes | después |
|---|---|---|
| servidor tibio | **10/10 verdes** | **10/10 verdes** |
| servidor frío (reiniciado antes de cada una) | **10/10 verdes** | **10/10 verdes** |

**El flake no se reprodujo en 20 corridas antes** — P38 lo vio caer una vez en corrida completa y una de tres aislada. No lo
redondeo: el antes/después por conteo no discrimina acá. Lo que sí discrimina es el mecanismo, medido:

| Diagnóstico temporal (`docs/p39-fugas/diagnostico-streaming.spec.ts.txt`, corrió y se borró) | |
|---|---|
| Cargas de `/setter` con un observador de mutaciones sobre la sección | 40 |
| Con **dos copias a la vez** en el documento (una fuera de `main`, en el contenedor del streaming) | **4** |
| Con más de una **dentro de `main`** | **0** |
| Última doble, en las que la hubo | ~0,5 ms **antes** de `DOMContentLoaded` |

Dos copias simultáneas son exactamente la condición de la violación de *strict mode*; como se cierran medio milisegundo
antes del evento que espera el `goto`, el aserto casi nunca cae adentro — de ahí lo raro del flake. Dentro de `main` la
condición no ocurrió nunca.

**Control** (build aparte, `.next-perf`, puerto 3006; fuentes restauradas con md5 idéntico apenas terminó el build; servidor
bajado por PID; build borrado):

| Sabotaje | Prueba | Resultado |
|---|---|---|
| sE — el bloque de espera ya no es «Nada para trabajar ahora» | P21-4 | **roja** en `main section[aria-label="Nada para trabajar ahora"]` |
| sC — la cola ya no es «Tu cola de hoy» | P21-1 · P21-2 · P21-3 | **rojas** en la cola acotada |

---

## 5 · La base vuelve a su estado

**Primer intento.** Conteo → tres suites → conteo: la base **sin delta en las 63 tablas**, pero `test:setter` **193/194**:
cayó `01-flow` B1 esperando el cartel «Ficha guardada — ya tenés señal». El propio test lo tiene marcado
(`01-flow.spec.ts:121`: «en la primera visita en frío la acción persiste y el cartel no se monta») — la firma del defecto
de P33/P34 — y el servidor venía recién levantado por la tanda en frío de `26`. Discriminador con el mismo build y los mismos
datos, tibio: `01-flow` completo **3 de 3 verde** (11/11). Con estos mismos datos la corrida del Paso 2 había dado 194/194.
No es de este sprint; no se restauró nada porque no fue un borrado lo que la tiró.

**Repetición, la que cierra:**

| Foto | OsLead | User | OsSetterNotice | Tablas con delta vs. la anterior |
|---|---|---|---|---|
| antes | 105 | 21 | 6 | — |
| tras `test:leados` (**43/43**) | 105 | 21 | 6 | ninguna |
| tras `test:helpers` (**28/28**) | 105 | 21 | 6 | ninguna |
| tras `test:setter` (**194/194**) | 105 | 21 | 6 | ninguna |

**Cierra: delta cero en las 63 tablas.** No queda una fuga sin identificar en las tres suites.

---

## 6 · Cierre

| Gate | Resultado |
|---|---|
| `tsc` | exit **0** (y los scripts nuevos, que están fuera del `include`, con un tsconfig temporal: exit **0**) |
| Invariantes | **57/57** (ninguno tocado) |
| `test:leados` · `test:helpers` · `test:setter` | **43/43 · 28/28 · 194/194** |
| `npm run build` | exit **0** |
| `prisma migrate status` | 86 migraciones, **sin drift** |
| Franja | **224/224** celdas iguales a P36 (y a Fase 0) |
| Pliegue | **1062/1062** celdas iguales a P36 (y a Fase 0) |
| Base | 105 leads · 21 usuarios · 6 avisos · registro de siembra vacío |

**Qué cambió.** `setter-db.ts` (+46 −11) · tres configs (+3 cada una) · `07` (+32) · `26` (+16 −4) · `28` (hunks de P39
sobre el WIP de P38) · `_casos.ts` (+13) · `recorrido-latencia.spec.ts` (+1) · `medir-rafaga-progreso.ts` (+11 −3 con `-w`).
Nuevos: `tests/helpers/siembra-registro.ts`, `tests/helpers/limpieza-al-arrancar.ts`, `scripts/dev/borrar-por-identidad.mts`,
`scripts/p39-censo-base.mts`, `scripts/p39-demo-bandeja-llena.mts`, `scripts/p39-panel-dibujado.mts`.

**Confirmado:** ningún archivo de producto; ninguna prueba borrada, salteada ni aflojada (una sola suma: 07-G1 exige
encontrar su aviso para poder borrarlo); ningún invariante; las dos superficies fijas sin tocar; ninguna suite se cayó al
borrar.

**Para la verificación humana:** nada visual. Lo que cambia es que la próxima medición se hace sobre datos reales.

---

## 7 · Anotado, no hecho

- **Advertencia para más adelante — `19-config-que-falta` B2.** Su premisa es que **ninguna** `Organization` tenga
  `calComUsername`, y `getCalConfigLeadOS` la resuelve globalmente: ninguna prueba puede aislarla. El día que Cal.com se
  conecte en desarrollo, B2 se pone roja. **No va a ser una regresión: va a ser su premisa cumpliéndose al revés.** P38 ya
  dejó la premisa y el conteo en el mensaje del aserto.
- **Un usuario huérfano de otra clase**: `smoke-setter-EXP-1786459764476@develop.test` (corrida matada del 11-ago; P37 borró
  sus 3 leads, el usuario quedó). No es de las cinco fugas; no se tocó.
- Con la fuga en la bandeja, el aserto del lado A de `02-isolation` C4 se cumplía aunque su propio aviso no se dibujara. Con
  la bandeja limpia vuelve a mirar el suyo (194/194). No se le agregó nada.
- `07` G1 y `26` P21-3 siguen cambiando de sesión en la misma página (la forma de C4 en P38); ninguna cayó en este sprint.

---

## 8 · Instrumentos y rastro

| Archivo | Qué hace |
|---|---|
| `scripts/p39-censo-base.mts` | Foto de la base (63 tablas, ids por categoría, panel de `setter-qa`) y comparación de dos fotos |
| `scripts/dev/borrar-por-identidad.mts` | Borrado por lista de ids con respaldo, restauración verificada y comparación columna por columna |
| `scripts/p39-panel-dibujado.mts` | El panel de Novedades de `setter-qa` contado en un navegador real |
| `scripts/p39-demo-bandeja-llena.mts` | Siembra y limpia por id los 50 avisos de la demostración de N6 |
| `docs/p39-fugas/diagnostico-streaming.spec.ts.txt` | El observador de las copias del streaming (corrió como spec temporal y se borró) |
| Arnés de sabotajes | Reemplazo literal de una ocurrencia, originales con md5 (en el scratchpad de la sesión, fuera del repo) |

Logs, fotos y respaldos: `C:\tmp\p39-fugas\`.

**Revisión de código** (subagente, solo lectura): APROBADO, sin CRITICAL ni HIGH. Trazó el ciclo del registro contra reuso de
PID, líneas cortadas, herencia de la variable a los workers, corridas concurrentes y la siembra de la galería: todo cae del
lado seguro. Un MEDIUM — en la ráfaga, el navegador quedaba dentro del `try` y no se cerraba ante un error — corregido y
re-verificado (no había quedado ningún Chromium huérfano: el `process.exit` del `catch` lo bajaba). Un LOW — el Ctrl+C sobre
la ráfaga no está cubierto por el registro — declarado en §3.2.
