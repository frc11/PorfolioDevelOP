# P38 · La premisa de casualidad — el censo, y las que dejaron de depender de la cartera

2026-09-13. Rama `p25/rafaga-tildes`, HEAD `4f8c00a2` (sin commitear, igual que P29–P37). Base: branch Neon de
desarrollo (`ep-quiet-waterfall-acv0fpll`), el único host que aceptan los instrumentos que escriben.

**Cero líneas de producto.** Todo lo que cambió son pruebas (siete specs) e instrumentos nuevos en `scripts/`.

---

## 0 · Terreno

| | |
|---|---|
| Git | HEAD `4f8c00a2` · `main` = `origin/main` = `57c421bc` · 46 entradas en `status` · 28 worktrees y 2 stashes, no tocados |
| WIP ajeno | `git diff --numstat` anotado al arrancar y copia de todo lo modificado y lo no rastreado (109 archivos de texto) fuera del repo; al cerrar, byte a byte igual (§9) |
| Procesos | 12 `node` ajenos (cuatro `chrome-devtools-mcp` con su watchdog), ningún servidor en 3000–3099 · servidores propios bajados por PID del socket |
| Disco | 28,9 GB libres |
| `tsc` | exit 0 |
| Invariantes | 57/57 (58 descubiertos, 1 excluido) |
| Suites | `test:setter` **194/194** · `test:leados` **43/43** · `test:helpers` **28/28** |
| Mediciones fijas | franja **224/224** · pliegue **1062/1062** celdas iguales a P36 |
| Cartera de referencia | 105 `OsLead` · `setter-qa` **73 leads, 42 accionables** · 80 avisos sin leer · 4 metas (3 fijados) |

`test:setter` corrió contra un `next start` propio y tibio (`.next-setter`, puerto 3003, `SETTER_EXTERNAL_SERVER=1`):
el mismo build sirvió a las tres suites, a las mediciones y a todos los experimentos, porque este sprint no toca
producto. Las suites **no dejan leads** (105 → 105), pero sí dejan un aviso por corrida (ver §7).

Universo: **265 pruebas** (194 + 43 + 28), no 263.

---

## 1 · El censo — cómo se buscó

El discriminador fue el del encargo: **¿la prueba prepara el estado del que depende, o lo encuentra?** Las tres vías:

- **Por forma** — lectura dirigida: todo aserto sobre superficies AGREGADAS (el panel `/setter`, las listas del admin,
  consultas a la base sin acotar a un lead), todo `.first()`/`firstVisible` sobre la página, toda ausencia medida
  sobre la página, todo conteo, toda lectura de configuración global, todo `if` que decide si se verifica.
- **Por experimento** — las tres suites contra tres carteras distintas de `setter-qa` (§3).
- **Por dependencia** — lectura de las pruebas que usan lo que dejó otra, y **cada prueba corrida sola**
  (`archivo:línea`), sin las que la preceden (§3.2).

Lo que el censo descartó con fundamento, en bloque:

| Grupo | Pruebas | Por qué no depende de estado que no prepara |
|---|---|---|
| `test:helpers` | 28 | `page.setContent`: sin servidor y sin base. Verdes también con la cartera vacía |
| `test:leados` | 43 | cada spec crea su propio setter y sus leads con stamp, y borra por id. La única lectura global (`alta-import` A.2, `nombresEnSistema`) afirma sólo sobre nombres con stamp. 43/43 en los tres experimentos y **43/43 corridas de a una** |
| `test:setter` con setter propio | 20 (06, 12, 26, 27) | su cartera es la que siembran |
| `test:setter` sobre pantallas de UN lead | 145 | la pantalla del manual y el detalle del admin dibujan un lead: el suyo, sembrado por el test. Además **cada una corrió sola** (§3.2) |

Quedan **29 pruebas** que tocan algo que no prepararon —el panel compartido de `setter-qa`, las listas globales del
admin, la bandeja entera de avisos, la configuración de la base, o lo que dejó otra prueba—:

| | Pruebas |
|---|---|
| **Premisa operante** (puede tirarlas o dejarlas ciegas) | **12** — 11 independizadas, 1 declarada |
| Premisa presente, sin modo de falla práctico | 11 |
| Visitan la superficie compartida sin afirmar nada de su contenido | 6 |

---

## 2 · El censo completo

Las líneas (`archivo:línea`) son las de la versión con la que se hizo el censo, antes de los arreglos.

### 2.1 · Premisa operante — 12

| # | Prueba | De qué estado depende sin prepararlo | Qué la tira sin que nada se rompa | Qué verificaba de verdad | ¿Independizable? | Vía |
|---|---|---|---|---|---|---|
| 1 | `01-flow.spec.ts:365` B7 | Que la bandeja de `setter-qa` no tenga avisos `DEMO_APROBADA` de otros leads — tiene 3 | Nada la tira: al revés, **la deja ciega**. `>= 1` sobre todo el setter ya se cumplía antes de aprobar | La transición a APROBADA; **el aviso al setter, no** | Sí — **arreglada** | forma |
| 2 | `01-flow.spec.ts:474` B10 | Ídem con `DEMO_RECHAZADA` — 3 | Ídem | La transición a RECHAZADA; el aviso, no | Sí — **arreglada** | forma |
| 3 | `28-veredicto-y-ciclo.spec.ts:238` N6 | Que su lead (RESPONDIO, el más nuevo) quede fuera de la cola visible — hacen falta 3+ RESPONDIO más viejos delante — y que ningún aviso ajeno con la misma frase aparezca antes que el suyo | **Menos datos**: con la cartera vacía su lead es el foco y sus avisos se deduplican. Y un aviso ajeno antes que el suyo (P37, intento 1) | Lo que dice, con la cartera de hoy | Sí — **arreglada** | experimento + forma |
| 4 | `18-quinta-superficie.spec.ts:158` 1b | Que «mandá el link» lo diga SU tarjeta (hoy lo dice también la fila 4 de la cola, `QA-W Aprobada Gate Abierto`) y que ninguna superficie muestre «todavía no cargó su link permanente» | **Más datos**: un aviso caducado de un aprobado sin link → Novedades dice esa frase | Que la **página** dice «mandá el link» — no la tarjeta | Sí — **arreglada** | forma |
| 5 | `18-quinta-superficie.spec.ts:244` 2a | Que ninguna superficie diga «Le toca al negocio — la demo está aprobada» y que «Le toca a Franco — …» venga de su tarjeta | **Más datos**: un aviso caducado de un aprobado que espera al negocio | Lo que dice (hoy ninguna otra superficie tiene esas frases) | Sí — **arreglada** | forma |
| 6 | `03-cabina.spec.ts:52` D1 | Que el lead acentuado NO esté en la cola visible | **Menos datos** no la tira: **la ciega**. Con la cartera vacía el lead es el foco y el nombre está en la página aunque la búsqueda no lo encuentre | La búsqueda sin tildes, mientras el lead no llegue a la cola | Sí — **arreglada** | forma |
| 7 | `03-cabina.spec.ts:65` D2 | Que no haya otro «Palancas Target» en la cartera | **Más datos del mismo test**: el sobrante de una corrida matada; el primer «Fijar arriba» de la página es el suyo | Lo que dice | Sí — **arreglada** | forma |
| 8 | `03-cabina.spec.ts:92` D3 | Un `if (await saltar.isEnabled())` con la nota «depende de cuántos accionables tenga la cartera» (P37 lo marcó). No depende: el archivo siembra cinco | Nada la tira; cualquier defecto que deshabilite «Saltar» **se saltea en verde** | «Ir a trabajarlo»; «Saltar» sólo si ya andaba | Sí — **arreglada** | forma |
| 9 | `19-config-que-falta.spec.ts:167` B1c | El brief que **B1b** guardó sin el pegado, sobre el lead de B1b | **Correrla sola**, o B1b en rojo | Lo que dice, si B1b corrió antes y en verde | Sí — **arreglada** | dependencia |
| 10 | `19-config-que-falta.spec.ts:190` B2 | **Cero** `Organization` con `calComUsername` — un dato global que comparte el módulo agenda-inteligente de los clientes | **Más datos**: que alguien conecte una agenda en desarrollo. Con dos, el aviso es otro | Lo que dice, mientras nadie conecte una | **No — intrínseca. Declarada** | forma |
| 11 | `17-datos-que-viajan.spec.ts:149` 1a | Que ninguna superficie diga «se retoma cuando se reactive» | **Más datos**: un aviso caducado de un postergado sin fecha | Lo que dice (hoy no hay tal lead con aviso) | Sí — **arreglada** | forma |
| 12 | `02-isolation.spec.ts:123` C4 | Que la página de A (`setter-qa`) no tenga pedidos en vuelo cuando el test le cambia la cookie por la de B **en la misma página**: el proxy re-firma la sesión en cada respuesta y una tardía reinstala la de A | **Menos datos**: con la cartera vacía el panel de A precarga dos enlaces justo en ese momento — 2 de 3 corridas completas rojas, y la navegación «de B» dibuja a `setter-qa`. (Aparte, el pliegue «Te reasignaron un lead» del lado A lo pintan también los avisos que filtra 07-G1: mismo render, sin modo de falla) | Lo que dice, mientras el panel de A no tuviera nada que precargar | Sí — **arreglada** | experimento |

### 2.2 · Premisa presente, sin modo de falla práctico — 11 (anotadas, no tocadas)

| Prueba | De qué depende sin prepararlo | Por qué no se tocó |
|---|---|---|
| `17-datos-que-viajan.spec.ts:167` 1b | Presencias medidas sobre la página | La frase lleva la fecha calculada en la corrida: ninguna otra superficie la repite |
| `18-quinta-superficie.spec.ts:176` 1c | Que el primer `h3` que contiene el nombre base sea el suyo | Un sobrante de 18-quinta (la siembra de P37 trae 4) está en el mismo estado y da el mismo acento: verde con la cartera sucia |
| `05-empty-mobile-a11y.spec.ts:72` F4 | El nombre del lead que hoy es el foco (desborde a 390) | Si un nombre desbordara, el defecto sería real |
| `04-admin.spec.ts:46` E1 · `:67` E2 · `:76` E3 | Paneles y badge que también encienden datos ajenos; E3 toma el primer setter de la lista | Afirman que renderizan; con más datos siguen renderizando |
| `00-surfaces.spec.ts:59` A1 · `:93` A3 · `:112` A4 | El panel de `setter-qa` entero | Lo que afirman lo siembran; verdes con la cartera vacía, espejada y sucia |
| `02-isolation.spec.ts:52` C1 | La cartera de `setter-qa` abierta entera | La ausencia es de un lead de OTRO setter: ningún dato de esta cartera la satisface |
| `05-empty-mobile-a11y.spec.ts:53` F2 | Que ningún lead contenga `zzz-no-existe-este-lead-qqq` | — |

### 2.3 · Visitan lo compartido sin afirmar nada de su contenido — 6

`00-surfaces.spec.ts:73` A2 (navegación) · `03-cabina.spec.ts:124` D4 (el diálogo de atajos) · `05-empty-mobile-a11y.spec.ts:108`
F6 (landmarks) · `07-admin-assign-caliente.spec.ts:62` G1 (elige al setter B por su nombre con stamp; el resto es la
cartera de B) · `28-veredicto-y-ciclo.spec.ts:165` N1 (sólo la URL de vuelta) · `18-quinta-superficie.spec.ts:123` 1a
(ya acotada a su tarjeta por P37).

---

## 3 · Los experimentos, antes de arreglar

Tres carteras distintas de la de hoy, con las pruebas originales y el mismo build.

| Experimento | Qué cambia | `test:setter` | `test:leados` | Caen por la cartera | Ruido, discriminado |
|---|---|---|---|---|---|
| **Menos** — cartera vacía | los 73 leads, 80 avisos y 4 metas de `setter-qa` pasan a un usuario de estacionamiento (una columna cada uno) | 191/194 y **193/194** (dos corridas) | 43/43 | **N6** — 2 de 2 corridas y aislada · **C4** — 1 de 2 (y 1 de 1 más en la repetición del Paso 3: **2 de 3**) | B3 (1 de 2; la firma del defecto de P33, 3/3 verde aislada) |
| **Otro orden** — `createdAt` espejado | los mismos 73 leads, la antigüedad invertida dentro de su rango: la cola cambia 3 de 5 | 193/194 | 43/43 | **ninguna** | `26 P21-4` (1 de 1; 1/3 aislado): *strict mode* por la copia del streaming, con setter propio — fuera de la clase (§7) |
| **Más** — la siembra de P37 de vuelta | +154 leads (259; `setter-qa` 224/179) | **194/194** | 43/43 | **ninguna** | — |
| `test:helpers` | (con la cartera vacía) | — | — | 28/28 | — |

**C4, dicho como pasó.** En el antes la anoté como «no reproducida»: cayó una de dos corridas completas con la
cartera vacía y pasó aislada y en secuencia. En la repetición del experimento volvió a caer, y esta vez la captura
quedó guardada: la navegación que el test hace **como B** muestra el panel de `setter-qa`. De ahí salió el mecanismo
(§4), confirmado forzándolo.

**Lo que el experimento no ve.** De las 12 premisas operantes, la vía del experimento encontró **dos** (N6, C4). Las
otras diez no se caen con la cartera cambiada: o la cartera de hoy no trae el dato que las rompe (1b, 2a, 1a, D2,
B2), o la premisa no decide si pasan sino **si ven** (B7, B10, D1, D3) — y un aserto ciego sigue en verde. Esas se
demostraron sembrando el dato (§4) o cruzando sabotaje con cartera.

### 3.1 · Vueltas atrás probadas

| Escritura | Protocolo | Resultado |
|---|---|---|
| Menos | aplicar → restaurar → **VUELTA EXACTA** (157 filas, columna por columna) → aplicar → respaldos 1 y 2 **idénticos** → corridas → restaurar → exacta | Control del verificador: con el experimento aplicado dice **157 diferencias**, sólo la columna movida (ni `updatedAt`) |
| Otro orden | aplicar → control (73 diferencias, sólo `createdAt`) → restaurar exacto → aplicar → respaldos idénticos → corrida → restaurar exacto | La cola vuelve a la de Fase 0, fila por fila |
| Más | restaurar D (P37) → borrar con respaldo nuevo (**= D**, 295 filas) → restaurar D → corridas → borrar con respaldo (**= D**) | 105 leads, **las mismas 105 ids** que en Fase 0 |
| Demostraciones | sembrar por id → correr → borrar por id | 0 filas remanentes en las cinco siembras (cuatro escenarios) |

Respaldos fuera del repo: `C:\tmp\p38-experimentos\`.

### 3.2 · Por dependencia: cada prueba sola

Cada prueba por su `archivo:línea`, con el `beforeAll` de su archivo y sin ninguna de las que la preceden. Corrido
con las pruebas ya arregladas (B1c, la dependencia que encontró la lectura, está demostrada aparte: la original,
sola, cae).

| Suite | Corridas | Verdes solas | Rojas solas |
|---|---|---|---|
| `test:leados` | 43 | **43** | 0 |
| `test:setter` | 136 (las 194; las que un bucle genera en la misma línea corren juntas) | **136** | 0 |

Tres cosas del camino, dichas: los siete ids de `17-datos` corrieron con líneas viejas («No tests found»: el archivo
se editó después de listar) y se repitieron con las actuales, 7/7 verdes. **La máquina se suspendió dos veces** a
mitad de la corrida (una prueba registró 4,6 h): `01-flow` B8 y B9 cayeron ahí —B8 con la base inalcanzable en su
teardown— y repetidas dieron 2/2 verdes cada una. Ese teardown fallido dejó **un lead huérfano** (`SMOKE-SETTER B8
Envio`): se borró con la herramienta de P37, con respaldo (`C:\tmp\p38-experimentos\huerfano-b8\`), y la base volvió a 105.

---

## 4 · Paso 1 — las once independizadas

Orden de peso (lo que se pierde si pasa por la razón equivocada): el aviso de la decisión de Franco al setter (B7,
B10) · el aislamiento de las novedades entre setters (C4) · el calibre conocido que ya hizo culpar dos cambios (N6) ·
la tarjeta que invita a mandar el link (1b) y la que no cuenta como espera del negocio (2a) · la búsqueda, las
palancas privadas y «Saltar» del panel (D1, D2, D3) · la revisión de Franco (B1c) · copy de la tarjeta de un
postergado (1a de 17-datos). C4 se arregló última porque su mecanismo apareció última (§3).

Controles contra builds de producción saboteados aparte (`.next-perf`, puerto 3006): **diez sabotajes** reales en
tres builds (s1–s8 juntos, disjuntos; s9 y s10 solos), aplicados por reemplazo literal con una ocurrencia exacta,
fuente restaurada con **md5 idéntico** apenas terminó cada build, servidores bajados por PID y build borrado. En cada
roja se verificó que cae **en el aserto que corresponde**, y las pruebas del mismo archivo que no miran ese sabotaje
siguieron verdes. Cada arreglada, además, se corrió antes contra el build limpio: todas verdes.

```
PRUEBA       02-isolation.spec.ts:123 C4
PREMISA      la página de A sin pedidos en vuelo en el instante en que el test le cambia la cookie a la de B
VERIFICABA   lo que dice, mientras el panel de A no tuviera nada que precargar al hidratar
MECANISMO    el proxy (Auth.js, estrategia JWT) re-firma la cookie de sesión en CADA respuesta
             (`@auth/core/lib/actions/session.js:45-51`); una respuesta que salió con la cookie de A y llega
             después de `clearCookies()` la reinstala. Con la cartera vacía el panel de A es «Tu cartera está
             vacía» y precarga sus dos enlaces justo entonces
AHORA        B entra en su propio contexto de navegador (frasco de cookies propio); los asertos son los mismos
DEMOSTRACIÓN natural: con la cartera vacía la ORIGINAL cayó 2 de 3 corridas completas (captura: la navegación «de B»
             con el banner de setter-qa). Forzada, demorando 2,5 s las respuestas de la página de A: en la
             MISMA página la sesión de B se pierde siempre (cartera vacía: 5 pedidos demorados; llena: 1),
             en CONTEXTO PROPIO nunca. La arreglada, en las corridas completas con la cartera vacía del Paso 3: §8
CONTROL      s10 (el feed de novedades deja de filtrar por destinatario) → roja en «B no ve la novedad de A»
             («Expected 0 · Received 1»); C1–C3 verdes
```

```
PRUEBA       01-flow.spec.ts:365 B7 · :474 B10
PREMISA      la bandeja de setter-qa sin avisos DEMO_APROBADA / DEMO_RECHAZADA de otros leads (trae 3 y 3)
VERIFICABA   la transición; el aviso no: `countNoticesFor(setterId, kind) >= 1` estaba satisfecho antes de decidir
AHORA        cuenta los avisos de ESE lead (`avisosDelLead(setterId, leadId, kind)`); mismo `>= 1`, sujeto correcto
DEMOSTRACIÓN sabotaje s2 (Franco decide y el aviso no se emite): ORIGINAL verde con la cartera de hoy, roja con la
             cartera vacía — el veredicto sobre el mismo defecto lo decidía la cartera. ARREGLADA roja en las dos
CONTROL      s2 → roja en «novedad … emitida para ESTE lead» (B7 y B10)
```

```
PRUEBA       28-veredicto-y-ciclo.spec.ts:238 N6
PREMISA      su lead fuera de la cola visible (3+ RESPONDIO más viejos delante) · la primera fila con la frase era la suya
VERIFICABA   lo que dice, mientras la cartera compartida pusiera leads delante
AHORA        su lead está PAUSADO por el setter (fuera de la cola por construcción; `vigenciaDeAviso` no mira la
             pausa, el texto afirmado es el mismo) · las filas se toman por su nombre con stamp · control positivo:
             los dos avisos del lead están, con el mensaje que dice dónde mirar si faltan
DEMOSTRACIÓN cartera vacía: ORIGINAL roja (el lead es el foco y el panel no tiene sus avisos), ARREGLADA verde
CONTROL      s1 (ninguna orden caduca) → roja en «tiene que decir qué pide el lead HOY»; el control positivo pasó antes
```

```
PRUEBA       18-quinta-superficie.spec.ts:158 1b · :244 2a
PREMISA      las frases de la tarjeta no aparecen en otra superficie de la página
VERIFICABA   1b: que la PÁGINA dice «mandá el link» — con s3 la tarjeta no lo dice y la original pasa por la fila 4 de la
             cola · 2a: lo que dice
AHORA        los asertos sobre la tarjeta de su lead (nombre exacto), con control positivo de que es única y visible —
             la forma con la que P37 acotó 1a
DEMOSTRACIÓN dos avisos caducos sembrados (un aprobado esperando al negocio, uno sin link): ORIGINALES rojas
             («Expected 0 · Received 1», la frase la dibuja Novedades), ARREGLADAS verdes
CONTROL      s3 (la tarjeta de un APROBADA no dice su próxima acción) → las dos rojas en el aserto de la tarjeta.
             Original de 1b con s3: VERDE — el falso verde, medido
```

```
PRUEBA       03-cabina.spec.ts:52 D1
PREMISA      el lead acentuado fuera de la cola visible
VERIFICABA   la búsqueda sin tildes, mientras la cartera compartida ocupara la cola
AHORA        la tarjeta de ese lead en la cartera, que es donde la búsqueda filtra
DEMOSTRACIÓN s4 (búsqueda sensible a tildes) × cartera vacía: ORIGINAL VERDE (el foco muestra el nombre),
             ARREGLADA roja. Sin sabotaje, las dos verdes
CONTROL      s4 → roja con la cartera de hoy y con la vacía
```

```
PRUEBA       03-cabina.spec.ts:65 D2
PREMISA      ningún otro «Palancas Target» en la cartera
VERIFICABA   lo que dice, mientras ninguna corrida matada dejara uno
AHORA        pin, nota y guardado accionados sobre la tarjeta de ese lead, con control de que es una sola
DEMOSTRACIÓN sobrante sembrado (mismo nombre base, otro stamp, tres días más viejo): ORIGINAL roja en «pin persistido»
             (fijó el sobrante), ARREGLADA verde
CONTROL      s5 (el pin no persiste) → roja en «pin persistido»
```

```
PRUEBA       03-cabina.spec.ts:92 D3
PREMISA      (declarada por el test, falsa) «Saltar» habilitado según la cartera
VERIFICABA   «Ir a trabajarlo»; «Saltar» sólo cuando ya estaba habilitado
AHORA        afirma que está habilitado — el archivo siembra cinco accionables propios — y lo usa
DEMOSTRACIÓN s6 (nunca hay próximo): ORIGINAL VERDE (el `if` se saltea «Saltar»), ARREGLADA roja
CONTROL      s6 → roja en «con cinco accionables propios sembrados siempre hay próximo»
```

```
PRUEBA       19-config-que-falta.spec.ts:167 B1c
PREMISA      el brief que dejó B1b
VERIFICABA   lo que dice, si B1b corrió antes y en verde
AHORA        su propio lead: brief sin el pegado (la forma que B1b afirma en la base), sembrado en BRIEF y llevado
             a revisión por la base — el mismo estado que heredaba, sin el borrador que traería una semilla en revisión
DEMOSTRACIÓN corrida sola: ORIGINAL roja (no hay brief que revisar), ARREGLADA verde
CONTROL      s7 (la revisión no nombra el faltante) → roja en «sin esto la revisión no distingue…»
```

```
PRUEBA       17-datos-que-viajan.spec.ts:149 1a
PREMISA      ninguna superficie dice «se retoma cuando se reactive»
VERIFICABA   lo que dice, mientras ningún postergado sin fecha tuviera un aviso a la vista
AHORA        los dos asertos sobre la tarjeta de su lead, con control positivo
DEMOSTRACIÓN un postergado sin fecha con un aviso caducado sembrado: ORIGINAL roja («Expected 0 · Received 1»,
             Novedades dice «Ahora: Postergado — se retoma cuando se reactive»), ARREGLADA verde
CONTROL      s9 (la fecha de vuelta no viaja a la próxima acción; build aparte) → roja en la tarjeta. Las pruebas
             del archivo que leen la fecha en la pantalla del lead (1c, 2a, 2b, 3a, 3b) siguieron verdes
```

---

## 5 · Paso 2 — la declarada

```
PRUEBA       19-config-que-falta.spec.ts:190 B2
PREMISA      la agenda de Franco sin conectar: `getCalConfigLeadOS` lee TODAS las Organization con calComUsername
POR QUÉ      es un dato global, compartido con los clientes: garantizar «cero» exigiría borrarle la configuración a
             organizaciones que no son del test
ESCRITA      comentario ⚠ PREMISA INTRÍNSECA sobre el test + la premisa y el conteo leído de la base en el mensaje de
             los dos asertos del aviso. Sin aserto propio a propósito: una sola org a medio cargar da el mismo aviso,
             y exigir cero pondría rojo un caso que el producto resuelve bien
LA TIRA      conectar una agenda en desarrollo. Sembradas dos: roja en «nombra la agenda de Franco [PREMISA: …
             organizaciones con calComUsername: 2 …]». La original, roja igual pero sin la pista
CONTROL      s8 (vuelve la jerga «Setup B7.0 pendiente: cargá calComUsername…») → roja en «ningún código de sprint interno»
```

---

## 6 · 🔴 ¿Alguna tapaba un defecto de producto?

**No.** Cada arreglada se corrió primero contra el build **sin** sabotaje, y todas pasaron: el aviso de la decisión
de Franco se emite para el lead (B7/B10), la tarjeta de un aprobado con link sí invita a mandarlo (1b), la búsqueda
sí ignora las tildes (D1), «Saltar» sí se habilita (D3), la revisión sí nombra el faltante (B1c), B no ve las
novedades de A (C4). Lo que estaba tapado era la **capacidad de detectarlo**, no un defecto presente.

C4 merecía la pregunta dos veces, porque su síntoma —una página «de B» con los datos de A— es literalmente el de un
defecto de aislamiento. No lo es: el servidor recibió la cookie de A (la captura muestra la identidad de A en el
banner, no datos de A bajo la identidad de B), y con un frasco de cookies propio B nunca ve a A.

---

## 7 · Fuera de la clase, encontrado en el camino (anotado, no hecho)

- **La fuga de avisos de `07-admin-assign-caliente` G1.** La reasignación real emite `LEAD_REASIGNADO_SALIENTE` al
  dueño previo (`setter-qa`) con `leadId: null` por diseño (`lead.actions.ts:200-201`), y el teardown borra por lead o
  por usuario creado: ese aviso no lo alcanza nadie. **Uno por corrida que incluye G1**: 73 antes de la primera corrida
  de este sprint, **85 al cerrar** (doce corridas). Ya dejaron fuera del tope de lectura (`AVISOS_LEIDOS = 50`,
  `novedades.ts:58`) cuatro de los seis avisos de semilla —puestos 66, 67, 84 y 85— y los dos que quedan dentro están
  en los puestos 44 y 45: en unas pocas corridas más, el panel de `setter-qa` va a mostrar sólo el pliegue. Es una
  quinta fuga de la siembra; no se tocó (fuera de objetivo).
- **`26-cola-de-trabajo` P21-4** (`:295`): `page.locator('section[aria-label="Nada para trabajar ahora"]')` sin
  acotar a `main` → *strict mode* intermitente contra la copia del contenedor de streaming. Setter propio: no es de
  cartera. Arreglo de una línea, otro sprint.
- **La misma forma que C4, sin disparador de cartera**: `07-admin-assign-caliente` G1 (`:99`, `:118`) y
  `26-cola-de-trabajo` P21-3 (`:244`) también cambian de sesión con `clearCookies()` en la misma página. Ninguna cayó
  en ninguna corrida: la página de la que salen no depende de la cartera compartida (el admin después de esperar la
  base; el panel de un setter propio). Si alguna vez cae ahí, el mecanismo es el de §4 y el arreglo, el mismo.
- **`01-flow` B3**, una vez con la cartera vacía: la firma exacta del defecto de P33/P34 (cartel que no llega en una
  entrada por la raíz), verde 3/3 aislada.
- La revisión del admin enmarca el borrador de un lead EN_REVISION y la CSP *report-only* lo registra como
  `console.error`. Lo destapó la primera versión de la semilla de B1c; la definitiva no trae borrador.

---

## 8 · Paso 3 — el experimento, después

Las mismas tres carteras, con las pruebas arregladas, las suites enteras y el mismo build.

| Cartera | ANTES · `test:setter` | DESPUÉS · `test:setter` | `test:leados` después | Caen ahora |
|---|---|---|---|---|
| Menos (vacía) | 191/194 · 193/194 · 193/194 (N6 2/2 · C4 2/3 · B3 flake) | **194/194 · 194/194** | 43/43 | **ninguna** |
| Otro orden (espejada) | 193/194 (P21-4, fuera de clase) | **194/194** | 43/43 | **ninguna** |
| Más (sucia, 259) | 194/194 | **194/194** | 43/43 | **ninguna** |

**Las declaradas, por nombre:** `19-config-que-falta` **B2** — verde en las tres, porque su premisa no vive en la
cartera sino en `Organization`; lo que la tira (dos agendas conectadas) está demostrado aparte en §5, y con esa
condición cae diciendo su premisa.

Las tres vueltas, exactas: menos (73 leads · 86 avisos · 4 metas, columna por columna), orden (73), más (respaldo
**= D**, 295 filas). Al terminar: 105 leads, **las mismas 105 ids** que en Fase 0, `setter-qa` 73 / 42.

Límite dicho: dos corridas completas con la cartera vacía no prueban que C4 no pueda volver a caer; lo que lo prueba
es el control forzado de §4, donde la misma demora que tira la forma vieja siempre no toca la nueva nunca.

---

## 9 · Cierre

| Gate | Resultado |
|---|---|
| `tsc` | exit **0** |
| Invariantes | **57/57** (ninguno tocado ni debilitado) |
| `test:leados` | **43/43** |
| `test:helpers` | **28/28** |
| `test:setter` | **194/194** (cartera limpia, mismo build y servidor tibio que todo el sprint: sin cambio de producto) |
| `npm run build` | exit **0** |
| `prisma migrate status` | 86 migraciones, **sin drift** |
| Franja | **224/224** celdas iguales a P36 (y a Fase 0) |
| Pliegue | **1062/1062** celdas iguales a P36 (y a Fase 0) |
| Cartera | 105 leads, **las mismas 105 ids** de Fase 0 · `setter-qa` 73 / 42 |
| WIP ajeno | los 109 archivos de texto copiados en Fase 0, **byte a byte iguales** salvo los tres que P38 toca (`01-flow`, `18-quinta`, la bitácora) |

**Qué cambió:** siete specs (`01-flow` +16 −4 · `02-isolation` +29 −14 · `03-cabina` +46 −15 · `17-datos` +14 −2 ·
`18-quinta` +40 −7 · `19-config` +70 −9 · `28-veredicto` +23 −2, casi todo comentario que dice por qué) y tres
instrumentos nuevos. **Ninguna prueba borrada, salteada ni aflojada; ningún archivo de producto; ningún invariante;
las dos superficies fijas sin tocar.** Nada se agregó a `git` (ni `add` ni commit ni push).

Qué queda para la verificación humana: nada visual. Que el próximo rojo de estas doce no aparezca cuando alguien
limpia la base o arregla un orden — y, si aparece B2, que el mensaje ya diga dónde mirar.

---

## 10 · Instrumentos

| Archivo | Qué hace |
|---|---|
| `scripts/p38-cartera-experimento.mts` | Menos / otro orden sobre la cartera de `setter-qa`: respaldo de filas completas, UPDATE parametrizado con compare-and-swap, `--restaurar` con comparación columna por columna, `--verificar`, `--comparar-respaldos` |
| `scripts/p38-sonda-cartera.mts` | Solo lectura: cola, novedades DIBUJADAS (la llamada del page), avisos por tipo, metas, cola simulada bajo los reordenamientos |
| `scripts/p38-demostraciones.mts` | Siembra por id el dato que tira cada prueba (avisos caducos, postergado sin fecha, sobrante de corrida, agenda ambigua), anotando el registro después de cada fila, y lo borra verificando |
| `scripts/dev/limpiar-siembra-corridas.mts` (P37) | «Más»: restaurar y volver a borrar la siembra. También borró el huérfano del sueño de la máquina |
| `docs/p38-premisas/sabotajes.mjs.txt` | El arnés de los diez sabotajes (reemplazo literal, una ocurrencia, md5 al restaurar). Corrió desde fuera del repo |
| `docs/p38-premisas/diagnostico-c4.spec.ts.txt` | El control forzado del mecanismo de C4 (misma página vs. contexto propio, respuestas demoradas). Corrió como spec temporal y se borró |

La revisión de código de los cambios (subagente, solo lectura) no encontró CRITICAL ni HIGH; marcó un MEDIUM en
`p38-demostraciones.mts` —el registro se escribía al final, y un proceso muerto a mitad de un escenario dejaba filas
que `--limpiar` no alcanzaba—. Se corrigió; las siembras de este sprint ya habían terminado completas y limpias.
