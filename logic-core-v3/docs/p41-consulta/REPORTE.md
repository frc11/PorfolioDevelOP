# P41 · La consulta de la pantalla del día — el dossier que el panel lee, y nada más

2026-09-14. Rama `p25/rafaga-tildes`, HEAD `4f8c00a2` (sin commitear, igual que P29–P40). Nada pusheado, nada agregado a git.

Base: la branch Neon de desarrollo (`ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech`). Lo único que escribe en la
base, además de las suites, es la proyección del Paso 3 (un setter y 73 leads temporales, borrados por id en `finally`) y la
prueba nueva (tres leads, borrados por id): las dos medidas con la foto de 63 tablas antes y después.

---

## 0 · Terreno

| | |
|---|---|
| Git | HEAD `4f8c00a2` · `main` = `origin/main` = `57c421bc` · 28 worktrees y 2 stashes, no tocados |
| WIP ajeno | 236 archivos modificados/no rastreados copiados con md5 en `C:\tmp\p41-consulta\wip-copia` (manifiesto `wip-manifiesto.json`) |
| Procesos | 21 `node` ajenos al arrancar (los 21 de `chrome-devtools-mcp`: siete `npx` + siete `node` + siete de telemetría); ningún servidor en 3000–3099 |
| Disco | 27,5 GB libres al arrancar |
| `tsc` | exit **0** |
| Invariantes | **57/57** (58 descubiertos, 1 excluido) |
| Suites | `test:leados` **95/95** · `test:helpers` **28/28** · `test:setter` **202/202** (build propio `.next-setter`, `next start` en 3003, `SETTER_EXTERNAL_SERVER=1`) |
| Base | 105 `OsLead` · 21 `User` · 6 `OsSetterNotice` · 63 tablas; las tres suites **sin delta** (antes → leados → helpers → setter) |
| Mediciones fijas | franja **224/224** · pliegue **1062/1062** celdas iguales a las líneas de base de P40 |
| Peso, con el instrumento de P40 (`p40-peso-brief.mts`) | `setter-qa`: 73 leads, 43 con brief · **140,7 KB por carga** (11,8 KB de briefs) · `listOwnedLeads` 173 ms (mediana de 7) · proyectado con el documento: **571,7 KB** |

El rojo de servidor frío anunciado (`01-flow` B1) no apareció: 202/202 en la primera corrida.

---

## 1 · Fase 1 — el censo

Seguí el resultado de `listOwnedLeads` desde `setter/page.tsx` hasta cada superficie. Lo reciben **cuatro funciones** y nadie más
en `src/` (el tipo `OwnedLeadWithDossier` lo importan `home.ts`, `novedades.ts` y `progreso.ts`; `mis-numeros.ts` usa uno
estructural propio). Un subagente `Explore` barrió en paralelo los 26 archivos de la cadena (lib + componentes); lo crucé con
`grep` y con `tsc` sobre el tipo recortado.

**De las 18 columnas del dossier, la cadena del panel lee 8. Las otras 10 no las lee nadie.**

### 1.1 · Las ocho que se leen

| Campo | Quién lo consume | Para qué | ¿Entero o una parte? | ¿Qué se rompe si falta? |
|---|---|---|---|---|
| `stage` | `home.ts:37` → `HomeLead.stage` → grupo (`flow.ts` `grupoPara`), próxima acción, nivel de urgencia (`flow.ts:750`), turno (`turno.ts:136-142`), vigencia de avisos (`novedades-vigencia.ts:133`) · `novedades.ts:198` (`derivarColaRevision`) · `progreso.ts:81` | decisión de grupo y de orden, rótulo, conteo de revisión y de descartados | escalar | todo lead se lee como «sin dossier» (`stage ?? null`): cae a «para trabajar», «Completá la ficha», nivel EVALUAR; el resumen de revisión y los descartados de la semana dan 0 |
| `fichaJson` | `home.ts:38` → `parseFicha` → `flow.ts:587` `fichaTieneSenal` → `fichaFaltantes` (`flow.ts:295-310`: `identidad.notas/igManejadoPor`, `presenciaDigital`, `resenas`, `contenidoReal`) | rótulo: «Dejá tu veredicto» o «Completá la ficha» en FICHA | lee 4 claves (y 2 adentro de `identidad`), pero **la validez del blob entero** (zod, `flow.ts:107-110`) decide si hay ficha o `null` | todo lead en FICHA dice «Completá la ficha» aunque tenga señal (control C2, §3) |
| `evaluacionJson` | `home.ts:39` → `score` (`flow.ts:631`) y `motivoDescarte` (`flow.ts:1021` → «Motivo:» en la tarjeta archivada, `home-sections.tsx:99`) · `mis-numeros.ts:76` → `revision.ts:116` `veredicto`, `:121` `fecha` · `progreso.ts:82-83` `fecha` | rótulo del archivo, conteo de «Mis números» (descarte vs avance, 30 días), descartados de la semana | 4 claves (`score`, `motivoDescarte`, `veredicto`, `fecha`); zod valida el blob entero | «Mis números» desaparece (`mis-numeros.tsx:25`: sin criterio no se dibuja); el motivo del descarte y los descartados de la semana, también |
| `rechazos` | `home.ts:40` → `ultimoRechazo` (`flow.ts:159` → `partirRechazos`, zod sobre el array entero) → `home-sections.tsx:151-167` | gate y rótulo del cartel «Franco pidió cambios» (qué, dónde, arreglo) | el último elemento; el array entero se valida (un elemento inválido anula el último) | la tarjeta RECHAZADA pierde qué corregir |
| `agendaJson` | `home.ts:43` → `agenda.resultado.nota` (`flow.ts:1022`, «Nota del cierre») · `progreso.ts:74-76` `estado`/`agendadaAt`, `:88-91` `resultado.tipo`/`fecha` | rótulo del archivo, conteo de reuniones y perdidos de la semana | 3 claves (`estado`, `agendadaAt`, `resultado.{nota,tipo,fecha}`); zod valida el blob entero | reuniones y perdidos de la semana en 0; la nota del cierre desaparece |
| `finalUrl` | `home.ts:65` → grupo (`flow.ts:438`), rótulo `linkPendiente` (`flow.ts:534`), turno `linkPermanente` (`turno.ts:142` → `contarEnVueloPorTurno`, el «todo en espera»), gate del envío en la vigencia del aviso (`novedades-vigencia.ts:125` → `flow.ts:100`) | decisión de grupo, rótulo, turno, gate | escalar — **su nulidad es el dato** | toda aprobada parece «sin link»: sale de la cola y el contador la pone a esperar a Franco (el bug de las cinco superficies, `aprobada-sin-link`) |
| `enviadaAt` | `home.ts:66` `Boolean(…)` → grupo (`flow.ts:438-440`), rótulo (`:536-539`), vigencia (`novedades-vigencia.ts:120`) · `progreso.ts:70` | decisión de grupo, rótulo, vigencia, demos de la semana | escalar — **su existencia es el dato** | toda demo enviada vuelve a pedir «mandá el link»; el avance pierde las demos |
| `updatedAt` | `novedades.ts:200-201` → «hace cuánto» de la demo más vieja en revisión (`novedades-panel.tsx:195`) | rótulo, y **por existencia**, si el resumen se muestra (`novedades.ts:205`) | escalar | el resumen «10 demos esperando revisión de Franco» desaparece entero (control C1, §3) |

### 1.2 · Las diez que no lee nadie

`briefJson` (12,2 KB en `setter-qa`) · `selfCheckJson` (16,8 KB) · `progresoJson` · `draftUrl` · `aprobadaAt` · `escaladoAt` ·
`escaladoNota` · y del dossier `id`, `leadId`, `createdAt`. **Qué se rompe si faltan: nada.** Cero lecturas en los 26 archivos de
la cadena (la única mención es un comentario de `parseProgreso`, `flow.ts:129`, que no se llama en este camino), y la prueba
dura: con el tipo recortado, `tsc` compila las cuatro funciones sin tocarlas.

### 1.3 · El consumo indirecto

| Forma | Dónde | Qué pasa con el recorte |
|---|---|---|
| Una función recibe el objeto entero y lo pasa | `derivarMisNumeros(leads)` → `filasCriterioPropio` (tipo estructural `LeadParaNumeros`: `dossier: { evaluacionJson: unknown } \| null`) · `getNovedadesSetter(userId, leads)` → `derivarColaRevision` · `getProgresoSemana(userId, leads)` → `derivarProgresoSemana` · `buildHomeLeads` → `HomeLead` (copia por nombre; `clasificarLead` esparce `...input`, que ya no tiene el dossier crudo) | cada una lee sus campos por nombre — todos en el censo |
| Algo lee una clave adentro de un blob | los cuatro blobs que quedan (ficha, evaluación, rechazos, agenda), leídos por `safeParse` **entero** | viajan enteros: no solo porque Prisma no selecciona claves de una columna Json, sino porque recortar claves cambiaría si el blob vale o es `null` |
| Una derivación mira si algo existe sin leerlo | `progreso.ts:68` `if (!dossier) continue` (la FILA) · `home.ts:66` `Boolean(enviadaAt)` · `finalUrl === null` (`flow.ts:438`, `:534`, `turno.ts:142`) · `novedades.ts:200/205` `!esperaMasVieja` (`updatedAt`) · `stage ?? null` | **todas sobre campos que quedan.** La fila: `dossier: { select }` sigue devolviendo `null` sin fila (la prueba nueva lo afirma con un lead sin dossier) |
| Serialización genérica (`JSON.stringify`, `Object.keys`, spread del lead crudo) | ninguna en los archivos de la cadena | — |
| Al navegador | los `HomeLead` enteros van a `CarteraView` y `FocoSurface` (cliente) | no cambian: el recorte es antes de `buildHomeLeads`. Anotado en §7 |

### 1.4 · Las tres condiciones de frenada, medidas

| Condición | Resultado |
|---|---|
| Algún consumidor necesita el objeto entero | **No.** Los cuatro leen campos por nombre. Los blobs que quedan se traen enteros y se dice por qué (§1.3). |
| Alguna derivación depende de que un blob exista, no de su contenido | **No, sobre lo que se va.** Hay cinco derivaciones por existencia (§1.3) y **todas miran campos que quedan**: `enviadaAt`, `finalUrl`, `updatedAt`, `stage` y la fila del dossier. Los controles C1 y C2 (§3) muestran lo que habría pasado si alguna se recortara. |
| Recortar exige cambiar el tipo de forma que rompa código fuera de la pantalla del día | **No.** El tipo lo importan tres módulos de la pantalla del día; `tsc` exit 0 sin tocar ninguno. Las tres pruebas que llaman a `listOwnedLeads` (`foco-no-miente`, `cola-urgencia`, `aislamiento-superficies`) leen solo campos del censo. Fuera de `tsc` (scripts de desarrollo): `p40-peso-brief.mts` lee `briefJson` del resultado y ahora cuenta 0 briefs en la carga — que es la respuesta correcta para la consulta nueva (§4). |

No frené.

---

## 2 · Paso 1 — el recorte

`src/lib/leados/ownership.ts`, el diff entero de producto:

```diff
+export const DOSSIER_DEL_PANEL = {
+  stage: true,
+  fichaJson: true,
+  evaluacionJson: true,
+  rechazos: true,
+  agendaJson: true,
+  finalUrl: true,
+  enviadaAt: true,
+  updatedAt: true,
+} as const satisfies Prisma.OsLeadDossierSelect
+
 export type OwnedLeadWithDossier = Prisma.OsLeadGetPayload<{
   include: {
-    dossier: true
+    dossier: { select: typeof DOSSIER_DEL_PANEL }
     _count: { select: { activities: true } }
     setterMetas: true
   }
@@ listOwnedLeads
   return prisma.osLead.findMany({
     where: ownedListWhere(userId),
     include: {
-      dossier: true,
+      dossier: { select: DOSSIER_DEL_PANEL },
       _count: { select: { activities: { where: SOLO_CONTACTOS_COMERCIALES } } },
       setterMetas: { where: ownSetterMetaWhere(userId) },
     },
     orderBy: { createdAt: 'asc' },
```

(más el comentario de la constante). Lo que quedó verdadero:

- **Solo los campos del censo llegan.** Medido en la base: el dossier de la cartera trae 8 claves, antes 18 (§3 y la prueba 1).
- **El tipo refleja exactamente eso.** Sale del mismo objeto (`typeof DOSSIER_DEL_PANEL`): no puede prometer un campo que la
  consulta no trae. La prueba lo fija además con `TIPO_HONESTO` (§5).
- **El filtro de pertenencia, idéntico.** El diff no toca `where: ownedListWhere(userId)`, ni el `_count` con
  `SOLO_CONTACTOS_COMERCIALES`, ni `setterMetas: { where: ownSetterMetaWhere(userId) }`. Los tres invariantes que leen ese
  cuerpo (`setter-meta`, `assignment-trail`, `aislamiento-consultas`) siguieron verdes sin tocarse.
- **Campos que se traen enteros, y por qué:** los cuatro blobs Json del censo — sus lectores los validan enteros con zod.
- Las columnas del **lead** no se recortaron: el encargo es el dossier (`assignedToId`, que el panel no lee, lo usa la prueba de
  aislamiento). Pesan 23,9 KB en `setter-qa`; anotado en §7.

**El censo congelado de consultas** (`aislamiento-consultas.invariant.ts`) no pidió cambio: censa `archivo · función · modelo.operación`
y la fila de `listOwnedLeads` sigue siendo `osLead.findMany` con clase `HELPER` (la relación anidada no es una consulta aparte
para el censo). Verde antes y después, sin editarlo.

**Otro invariante sí se puso rojo, y es información.** `aprobada-sin-link` tiene un guard de descubrimiento que congela los
archivos que contienen la señal `finalUrl`. `ownership.ts` entró al conjunto porque ahora **nombra** `finalUrl` en su select —
antes lo traía sin nombrarlo, dentro de `dossier: true`. Seguí la instrucción del propio invariante («verificá que distinga…; si
deriva una acción, sumale su entrada»): `ownership.ts` no deriva nada del aprobado, **transporta** el campo que `home.ts`
necesita para distinguir, así que no lleva entrada en el censo de derivaciones; sumé el archivo a `ARCHIVOS_CENSADOS` con ese
motivo. No lo debilita: el guard sigue fallando en las dos direcciones, y ahora además cubre el recorte — el sabotaje S8 (§5) saca
`finalUrl` del select y el invariante lo marca como «desaparecido: la distinción se PERDIÓ ahí». Sin el alta, ese sabotaje no lo
veía.

---

## 3 · Paso 2 — nada cambió, lead por lead

### 3.1 · Lo que cada superficie recibe — `scripts/p41-superficies.mts`

Arma, con la misma cadena de llamadas que `setter/page.tsx`, lo que recibe cada superficie: el foco (sin cookie y con cada
accionable como sticky), la cola (cada ítem con su lead, su motivo y su próximo paso), la cartera (los `HomeLead` que recibe
`CarteraView`, y los grupos con sus conteos en los cuatro órdenes), los avisos (`getNovedadesSetter` completo: filas, ocultos,
resumen de revisión, sin leer) y los contadores (`derivarMisNumeros`, `getProgresoSemana`, el desglose por turno, pausados,
fijados). **Para todos los setters con leads: 6 setters, 98 leads.**

El reloj se congela antes de importar la app (la cadena lee la hora: vencimientos, «hace 3 h», la ventana de 7 días). La foto de
partida anotó su instante (`2026-09-15T00:02:20.040Z`) y la de después se sacó con ese mismo reloj. Cada foto guarda también lo que
la cadena lee de cada fila, para afirmar que los datos no se movieron entre las dos.

| Setter | Leads | Datos | Foco | Cola | Cartera | Avisos | Contadores |
|---|---|---|---|---|---|---|---|
| `setter-qa` | 73 → 73 | iguales | 0 dif. | 0 | 0 | 0 | 0 |
| `franco@develop.com` | 15 → 15 | iguales | 0 | 0 | 0 | 0 | 0 |
| `valentino@develop.com` (sin dossiers) | 6 → 6 | iguales | 0 | 0 | 0 | 0 | 0 |
| `m0-gal-foco-construir` | 2 → 2 | iguales | 0 | 0 | 0 | 0 | 0 |
| `m0-gal-foco-espera-accion` | 1 → 1 | iguales | 0 | 0 | 0 | 0 | 0 |
| `m0-gal-nada-para-trabajar` | 1 → 1 | iguales | 0 | 0 | 0 | 0 | 0 |
| **Total** | **98** | | | | | | **CERO diferencias** |

Claves del dossier: 18 → 8. Se fueron: `aprobadaAt briefJson createdAt draftUrl escaladoAt escaladoNota id leadId progresoJson
selfCheckJson`. No llegó ninguna.

**Controles — la comparación ve un recorte de más.** Un cero necesita su control positivo. Con el mismo instrumento y el mismo
reloj, sacando del select un campo que el censo dice que se lee (restaurado con md5 idéntico):

| Control | Lo que la comparación marcó |
|---|---|
| C1 · sin `updatedAt` | `avisos.revision: {"total":10,"hace":"hace 94 días"} → null` en `setter-qa` (y en otros dos setters): **el resumen de revisión desaparece** — la derivación por existencia de §1.3 |
| C2 · sin `fichaJson` | `cartera.homeLeads[…].ficha → null` y diferencias en la cola en cinco setters: el rótulo de FICHA se da vuelta |

### 3.2 · Lo que el navegador dibuja — `scripts/p41-panel.mts`

`/setter` como `setter-qa`, a 1440 y 390, contra el build de partida (Fase 0) y contra el build nuevo: la cola entera (total,
foco, filas, «Quedan N más»), la cartera abierta con **los siete grupos desplegados** (rótulo, conteo y el texto de las 73
tarjetas), los avisos, «Mis números» y el avance.

| | 1440 | 390 |
|---|---|---|
| Cola | foco + 4 filas, igual | igual |
| Grupos | Para trabajar 42 · En seguimiento 11 · Esperando revisión 10 · Agendadas 2 · Postergados por el negocio 1 · Descartados 5 · Perdidos 2 — iguales | iguales |
| Tarjetas | 73, texto idéntico una por una | 73, idéntico |
| Avisos | 4, idénticos | 4, idénticos |
| **Diferencias en lo dibujado** | **cero** | **cero** |

**Capturas, byte por byte:** 17 de 19 idénticas por md5 — el panel entero a los dos anchos y la primera tarjeta de cada grupo a
los dos anchos. Las otras 2 (la cartera desplegada a 1440, y la segunda parte a 390) difieren en 192 y 340 píxeles: la máscara
de diferencias muestra que son **solo los puntos animados de los badges «CALIENTE»** (`animate-ping`, `Badge.tsx:113`), fotografiados
en otra fase de la animación.

Un hueco del lector, dicho: el lector de avisos leía las filas y no el resumen «N demos esperando a Franco» (no es una fila). Para
esta comparación lo cubren las capturas del panel entero, idénticas byte por byte; el lector ya lo lee (`novedadesSeccion`).

---

## 4 · Paso 3 — lo ganado

### 4.1 · Hoy, con la cartera de pruebas

| `setter-qa` (73 leads, 43 con brief) | Partida | Recortada | |
|---|---|---|---|
| Bytes por carga (JSON, la vara de P40) | 144.091 B · **140,7 KB** | 95.774 B · **93,5 KB** | **−48,3 KB (−33,5 %)** |
| Tiempo de `listOwnedLeads` (mediana de 21, intercaladas partida/recortada) | 170 ms (p25–p75 169–172) | 170 ms (168–172) | **0 ms** |
| Instrumento de P40, tal cual | 140,7 KB · 173 ms (mediana de 7) | 93,5 KB · 178 ms | el tiempo, dentro del ruido |

**El tiempo no se mueve, y no lo maquillo.** 48 KB no son el costo de esta carga: lo son los cuatro viajes a Neon en São Paulo
(la fila, el dossier, el meta y el conteo), que el recorte no toca. La consulta de partida y la copia usada para medir contra ella
salen **idénticas byte por byte** a la función real (verificado en la Fase 0).

**De qué está hecho lo que queda** (dossier, `setter-qa`): `fichaJson` 22,6 KB · `evaluacionJson` 13,1 KB · `rechazos` 1,6 KB ·
`agendaJson` 1,5 KB · escalares 3,8 KB. Lo que se fue: `selfCheckJson` 16,8 KB · `briefJson` 12,2 KB · ids y fechas 5,8 KB ·
`draftUrl` 1,5 KB · `progresoJson` 1,3 KB · el resto 1,2 KB. Las columnas del lead, 23,9 KB.

### 4.2 · El proyectado, con el documento de las cuatro vueltas lleno — medido en la base, no en una cuenta

`--proyectar` sembró un setter temporal con una **copia de la cartera de `setter-qa`** (los mismos blobs, lead por lead) donde
cada uno de los 43 briefs se reemplazó por uno con el documento de la vuelta 4 a 1.200 palabras + lectura + decisiones — la
opción que P40 eligió —, construido con `vueltasParaGuardar` y validado con `BriefSchema`: **11,3 KB por brief** (P40 estimaba
10,3 KB en texto crudo; la diferencia es el escapado JSON). Midió las dos consultas y borró todo por id.

| Copia de `setter-qa` con 43 briefs llenos | Partida (`dossier: true`) | Recortada |
|---|---|---|
| Bytes por carga | 615.155 B · **600,7 KB** | 92.294 B · **90,1 KB** (−85 %) |
| Tiempo (mediana de 21, intercaladas) | 182 ms (p25–p75 179–184) | 169 ms (167–170) · **−13 ms** |

Contra los ~570 KB de P40 (su cuenta), la medición da 600,7 KB sin el recorte y 90,1 KB con él. La copia no lleva actividades ni
meta: por eso 90,1 y no 93,5. Base: **sin delta** en las 63 tablas antes y después de la proyección. Repetida al cierre (con la
limpieza corregida, abajo): los mismos 600,7 / 90,1 KB, y 190 / 176 ms (−14 ms).

**La limpieza de la proyección, a prueba de un proceso matado.** La revisión de código marcó que los ids creados vivían solo en
memoria: un `kill` antes del `finally` dejaba el setter y sus leads. Ahora cada alta se anota en el registro de siembra de P39
al crearse. Verificado matándola: con 24 leads sembrados, `taskkill` por PID → la base con `User +1 · OsLead +24 · OsLeadDossier +24`
→ la corrida siguiente de una suite, en su `globalSetup`: «corrida interrumpida (pid 98148): pendientes 24 leads · 1 usuarios →
borrados 24 leads · 1 usuarios» → **sin delta** contra la foto de antes.

**La decisión de P40 que esto destraba:** con el recorte, el brief no viaja en la carga del panel. Guardar las cuatro vueltas cuesta
lo que pesa en la base y en las pantallas del lead que lo leen, no en cada carga de la cartera.

---

## 5 · Paso 4 — las pruebas, demostradas fallando

`tests/leados/consulta-cartera.spec.ts` (`test:leados`, 4 casos). Siembra un setter A con un lead APROBADA con **las 18 columnas del
dossier llenas** (control afirmado: la fila no tiene ninguna `null`), un lead sin dossier, y un setter B con un lead; borra por id.

| Caso | Qué fija |
|---|---|
| 1 · la cartera trae del dossier los campos del censo, con el valor de la fila, y ninguno más | claves del dossier = el CENSO (con quién lee cada una); cada valor = el de la fila; del lead, sus columnas + `dossier`, `_count`, `setterMetas`; sin fila de dossier sigue siendo `null` |
| 2 · la cartera de un setter no muestra los leads de otro | ni A ve el de B ni B los de A, y cada cartera es exactamente la suya |
| 3 · un consumidor que lea un campo recortado no compila — y hoy leería `undefined` | **en `tsc`**: `TIPO_HONESTO` exige que las claves del tipo sean las del censo, y `leerRecortados` lee los 10 campos recortados con `@ts-expect-error` en cada lectura. **En ejecución**: el peligro que eso ataja — la fila los tiene, la cartera los devuelve `undefined`; y cada columna del dossier está o en el censo o entre las recortadas |
| 4 · cada campo del censo tiene quién lo lea en la cadena del panel | el cuerpo de cada lector declarado (`cuerpoDeFuncion`) lee `dossier.<campo>`: el censo no puede quedarse con un campo que ya nadie lee |

**Contra el código de partida** (antes de tocar `ownership.ts`): el caso 1 rojo en su aserto — «sobran: aprobadaAt, briefJson,
createdAt, draftUrl, escaladoAt, escaladoNota, id, leadId, progresoJson, selfCheckJson» —; el 3 rojo — «aprobadaAt no llega a la
cartera… Received: 2026-09-15T00:09:09.649Z» —; y `tsc` rojo en la prueba: `TIPO_HONESTO` (`Type 'true' is not assignable to type
'false'`) y las diez `Unused '@ts-expect-error' directive`. Los casos 2 y 4 pasaban: se demuestran con sabotaje.

### Sabotajes (reemplazo literal de una ocurrencia, bytes originales restaurados, md5 idéntico)

| Sabotaje | Lo que falló, y dónde |
|---|---|
| S1 · la consulta vuelve a `dossier: true` (el tipo sigue recortado) | caso 1 «sobran: …10 campos» y caso 3 «aprobadaAt… Received»; **`tsc` verde** — solo la prueba en ejecución lo ve |
| S2 · sin `where: ownedListWhere(userId)` | **las dos pruebas de aislamiento, por su aserto**: `aislamiento-superficies.spec.ts:105` y `consulta-cartera.spec.ts:219`, `expect(…).not.toContain(leadDeB)` con la cartera entera de la base como recibido. Ni un tope ni el recorte |
| S3 · un consumidor nuevo en `home.ts` lee `lead.dossier?.draftUrl` | `tsc`: `home.ts(66,78) TS2339 Property 'draftUrl' does not exist on type '{ stage…; updatedAt }'` |
| S4 · el tipo se ensancha a `dossier: true` con la consulta recortada (el arreglo tentador) | `tsc`: `ownership.ts(82,3) TS2322` (la consulta ya no cumple su propio tipo) + `TIPO_HONESTO` + las diez directivas sin error; **la prueba en ejecución, 4/4 verde** — solo `tsc` lo ve |
| S5 · se recorta `updatedAt` (un campo que se lee) | `tsc`: `novedades.ts(200,38)` y `(201,34) TS2339` + `TIPO_HONESTO`; caso 1 «faltan: updatedAt» |
| S6 · se trae `draftUrl` sin lector | `tsc`: `TIPO_HONESTO` + la directiva de `draftUrl` sin error; caso 1 «sobran: draftUrl», caso 3 «draftUrl… Received: https://smoke-draft.netlify.app» |
| S7 · el censo declara un lector falso (`rechazos` en `derivarProgresoSemana`) | caso 4: «el censo dice que `derivarProgresoSemana` lee «rechazos» del dossier y su cuerpo ya no lo lee» |
| S8 · se saca `finalUrl` del select | `aprobada-sin-link`: «Archivos censados que ya no tocan la derivación… · src/lib/leados/ownership.ts … la distinción se PERDIÓ»; `tsc`: `home.ts(65,31) TS2339` + `TIPO_HONESTO` |

### La que protege a futuro — qué se puede afirmar y qué no

**Se puede, y está:** un consumidor nuevo que lea un campo recortado **no compila** (S3), y el arreglo tentador —ensanchar el tipo
para que compile— tampoco (S4: rompe la propia consulta y `TIPO_HONESTO`). El que quiera el campo tiene un solo camino: sumarlo al
select, y entonces la prueba le pide el renglón del censo con su lector (S6).

**No se puede, y no lo forcé:** `tsc` no ve a un consumidor que declare el campo **opcional** en un tipo estructural propio
(`{ dossier: { briefJson?: unknown } | null }` recibe la cartera sin quejarse) ni a uno que lo lea por clave dinámica. Ése leería
`undefined` sin avisar, y ninguna prueba de acá puede afirmar lo contrario sin volverse vacua. Está escrito en el encabezado de la
prueba.

---

## 6 · Verificación operando la aplicación

Capturas en `docs/p41-consulta/capturas/` (`antes/` y `despues/`, mismos nombres; `galeria/` para los otros estados del panel).

| # | Verificación | Resultado |
|---|---|---|
| 1 | El panel entero, antes y después, 1440 y 390 | `panel-1440.png` y `panel-390.png` **idénticas byte por byte** |
| 2 | La cartera con sus grupos | los siete grupos desplegados, 73 tarjetas con texto idéntico; capturas iguales salvo los `animate-ping` (§3.2) |
| 3 | Un lead en cada estado que el panel muestra distinto | la primera tarjeta de cada grupo (para trabajar, seguimiento, revisión, agendada, postergada, descartada, perdida), a los dos anchos: **14 de 14 idénticas byte por byte**. Y los otros tres estados del panel, con los setters de la galería (después; su lado de datos, cero diferencias en §3.1): foco en construcción, foco con «Franco pidió correcciones», y «No hay nada para trabajar ahora mismo» con «1 esperando a Franco» |
| 4 | Las dos mediciones fijas, sin empeorar | §8 |
| 5 | La ida y vuelta de la base con las tres suites | §8 |

**Subagente `visual-qa`**, sobre las capturas: ✅ en todas, sin ❌ ni ❓ — panel plegado, cartera abierta, los siete estados y los tres
de la galería, sin desbordes a 390. Revisó imágenes: no recorrió la app ni miró consola (la consola la leyó `p41-panel.mts`: 0
errores en las cargas).

---

## 7 · Anotado, fuera de alcance

- **Otras consultas con el mismo patrón: ninguna.** Las otras ocho lecturas de listas de dossiers (`admin/leados/page.tsx` ×3,
  `admin/leados/setter/[setterId]`, `admin/leados/[leadId]` la cola, `admin/layout.tsx`, `setter-carga.ts`, `fg2-lab`) ya usan
  `select` con lo suyo. Las lecturas de UN dossier (`getOwnedDossier`, la revisión) lo traen entero y lo usan: no son el patrón.
- **El siguiente peso del panel no está en la consulta, está en lo que viaja al navegador.** `CarteraView` y `FocoSurface` son
  componentes de cliente y reciben los `HomeLead` enteros: con ellos viajan la ficha y la evaluación parseadas de cada lead
  (`setter-qa`: 83,5 KB de `HomeLead` en JSON, de los que 22,6 KB son fichas y 13,1 KB evaluaciones), cuando en el navegador se
  leen `evaluacion.motivoDescarte`, `agenda.resultado.nota` y `ultimoRechazo.{motivo,donde,arreglo}`; `score` no lo lee nadie.
  Otro sprint, con otra forma de medir (el payload RSC, no la consulta).
- **Las columnas del lead** que el panel no lee (`notes` 3,2 KB, `instagramUrl` 2,1 KB, teléfono, mail…): 23,9 KB en total. No es
  el dossier; y `assignedToId` lo usa la prueba de aislamiento.
- **`p40-peso-brief.mts` después del recorte** cuenta 0 briefs en la carga —cierto, porque el brief ya no viaja, pero no porque
  pese cero— y su bloque de «transferencia» mide sobre 0 filas (`generate_series(1, 0)`): esa sección deja de decir algo. No lo
  toqué (es el instrumento de P40, y se corrió tal cual antes y después); lo dice el encabezado de `p41-peso-consulta.mts`, que es
  la vara que mide contra la consulta de partida. MEDIUM de la revisión de código, declarado.

---

## 8 · Cierre

### 8.1 · Las dos mediciones fijas y la base

Contra el build final (el mismo de las suites), comparadas celda por celda con las líneas de base de P40:

| | Fase 0 | Cierre |
|---|---|---|
| franja | 224/224 | **224/224** |
| pliegue | 1062/1062 | **1062/1062** |

Ninguna pantalla del manual consume la cartera: que no se movieran es lo esperado, y está medido.

Con el código final (`scripts/p39-censo-base.mts`, 63 tablas + leads, usuarios y avisos por id):

| Foto | OsLead | User | OsSetterNotice | Suite | Tablas con delta contra la anterior |
|---|---|---|---|---|---|
| antes | 105 | 21 | 6 | — | — |
| tras `test:leados` | 105 | 21 | 6 | **99/99** (95 + 4 nuevas) | **ninguna** |
| tras `test:helpers` | 105 | 21 | 6 | **28/28** | **ninguna** |
| tras `test:setter` | 105 | 21 | 6 | **202/202** | **ninguna** |
| **antes → después** | | | | | **ninguna** |

**Delta cero.** Cada corrida suelta del sprint también se fotografió antes y después: la prueba nueva contra el código de partida y
contra el nuevo, la proyección (dos veces), las dos baterías de sabotajes y la corrida matada con su limpieza — ninguna dejó filas.

### 8.2 · Gates

| Gate | Resultado |
|---|---|
| `tsc --noEmit` | exit **0** (también después de sumar `ownership.ts` al censo de `aprobada-sin-link`) |
| Invariantes | **57/57** (58 descubiertos, 1 excluido) — tras sumar `ownership.ts` a `ARCHIVOS_CENSADOS` de `aprobada-sin-link` (§2) |
| `test:leados` · `test:helpers` · `test:setter` | **99/99 · 28/28 · 202/202** (build final `.next-setter`, 3003) |
| `npm run build` | exit **0** |
| `npx prisma migrate status` | 86 migraciones · **«Database schema is up to date!»** — sin drift |
| Franja · pliegue | **224/224** · **1062/1062** |
| Base | 105 leads · 21 usuarios · 6 avisos · **delta cero** |
| Revisión de código (subagente) | **APROBADO**: 0 CRITICAL, 0 HIGH. Dos MEDIUM: la limpieza de `--proyectar` a prueba de crash — **corregida y verificada matando el proceso** (§4.2) —; y `p40-peso-brief.mts` que lee 0 briefs por construcción — declarado (§7) |
| `visual-qa` | ✅ en todas las capturas, sin ❌ ni ❓ |
| WIP ajeno | **236 de 236 idénticos** por md5 antes de escribir la bitácora |
| Entorno | servidores propios bajados por PID (86248 partida, 87460 final); ningún distDir temporal; `tsconfig.json` intacto (md5 igual al de la Fase 0); 25,9 GB libres. Al cerrar hay procesos ajenos nuevos de otra sesión (RG-CRM: `next start -p 3200` y un `custodio.mjs`), no tocados |

### 8.3 · Qué cambió

| Archivo | Qué |
|---|---|
| `src/lib/leados/ownership.ts` | **el único cambio de producto**: `DOSSIER_DEL_PANEL`, el tipo derivado de esa constante, y `dossier: { select: DOSSIER_DEL_PANEL }` |
| `src/lib/leados/aprobada-sin-link.invariant.ts` | `ownership.ts` sumado a `ARCHIVOS_CENSADOS`, con su motivo (§2). Ninguna aserción tocada |
| `tests/leados/consulta-cartera.spec.ts` | nueva, 4 casos (§5) |
| `scripts/p41-superficies.mts`, `scripts/p41-panel.mts`, `scripts/p41-peso-consulta.mts` | instrumentos nuevos (§3, §4) |
| `docs/p41-consulta/` | este reporte y las capturas (`antes/`, `despues/`, `galeria/`, `mascaras/`) |

Evidencia cruda en `C:\tmp\p41-consulta\` (`fase0/`, `paso2/`, `paso3/`, `sabotajes/`, `cierre/`).

**Confirmado:** el filtro de pertenencia no cambió (diff en §2 y S2 en §5); ningún campo que el panel lee se fue (censo, tsc, y
cero diferencias en 98 leads); ningún schema, transición ni llave de datos tocada (`git diff` vacío en `schema.prisma`,
`dossier.ts`, `dossier.actions.ts`, `home.ts`, `novedades.ts`, `progreso.ts`, `mis-numeros.ts` y `setter/page.tsx`; `flow.ts`, con
WIP de sprints anteriores, idéntico por md5 a la Fase 0); ninguna prueba borrada ni salteada; ningún invariante debilitado; las dos
superficies fijas sin tocar; nada agregado a git, nada commiteado ni pusheado.

---

## 9 · Para la verificación humana

- **Que el panel se vea igual.** Es el criterio de éxito. `docs/p41-consulta/capturas/antes/panel-1440.png` y
  `despues/panel-1440.png` (y los de 390) son el mismo archivo byte por byte; la cartera desplegada y un lead por estado, al lado.
  Mirarlo en la app con tu cartera real es lo que ninguna medición de acá reemplaza.
- **La decisión que esto destraba** (P40, decisión 2): guardar las cuatro vueltas del brief costaba un 18 % más sobre una carga que
  arrastraba todos los briefs de la cartera. Con el recorte, el brief no viaja en la carga del panel — medido: con los 43 briefs
  llenos, 90,1 KB en vez de 600,7. Si querés guardar las cuatro enteras, este sprint ya no es el argumento en contra.
- **El alta en `aprobada-sin-link`** (§2): se puso rojo por el cambio y lo actualicé siguiendo su propio comentario. Si preferías que
  un censo de ese tipo frenara el sprint en vez de actualizarse, es la única decisión de este sprint que conviene mirar.
