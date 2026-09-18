# P36 · Fase 1 — La opción barata, medida. Y por qué el sprint frena.

Medido el 2026-09-12 contra la cartera de `setter-qa@develop.test` (224 leads),
rama Neon dev. Instrumentos: `scripts/p36-fase1-urgencia.mts` y
`scripts/p36-fase1-representacion.mts`.

**Ninguna línea de producción fue modificada.** Este documento es medición y
diagnóstico; el sprint frena antes de construir por dos de sus tres condiciones.

---

## Cómo se midió (y por qué no re-deriva nada)

Las dos colas se arman con **las mismas funciones que el panel usa**:

| Cola | Cadena real |
|---|---|
| ACTUAL | `particionarCartera` (aplica `ordenFoco`, `flow.ts:842`) → `seleccionarFoco` → `armarCola` |
| URGENCIA | `filtrarYOrdenarCartera(…, 'urgencia')` (`flow.ts:1054`) → `seleccionarFoco` → `armarCola` |

`filtrarYOrdenarCartera` con orden `'urgencia'` **es** el criterio de la cartera:
`Number(b.pinned) - Number(a.pinned) || ordenUrgencia(a,b)` — la misma función,
con el mismo default que `cartera-view.tsx:45`. No se escribió una copia.

El nivel se lee por `motivoOrden` (`flow.ts:611`), traducción 1:1 de
`trabajoTier` con `switch` exhaustivo.

---

## 0 · El censo — reales contra artefactos, con el criterio escrito

Dos cortes, los dos declarados, porque ninguno es obvio:

| Corte | Criterio | Sembrados | Quedan | Accionables |
|---|---|---|---|---|
| **CORRIDA** | timestamp de 13 dígitos en el nombre (las suites nombran con `Date.now()`) | 151 | 73 | **42** |
| **ESTRICTO** | cualquier prefijo de siembra: `SMOKE-SETTER`, `M0-GAL`, `CORRIDA`, `QA-W`, `QA-B`, `SEED-` | 213 | 11 | **3** |

De los **179 accionables** de la cartera completa, **3 son leads reales**. El
resto es siembra: 151 de corridas automáticas y ~62 semillas de QA curadas a mano
para los estados del manual.

El corte CORRIDA es el discriminador objetivo (no una lista de nombres) y
reproduce el control de la medición anterior.

---

## 1 · Las cinco respuestas de la opción barata

### 1.1 · Qué cola produciría el criterio de urgencia, lead por lead

| # | Cola HOY (`ordenFoco`) | Cola con URGENCIA |
|---|---|---|
| 1 | QA-W Evaluada Gate Abierto · **PIN** | QA-W Evaluada Gate Abierto · **PIN** |
| 2 | QA-W Brief · **PIN** | QA-W Brief · **PIN** |
| 3 | QA-W Construccion · *construila* | QA-W Construccion · *construila* |
| 4 | SMOKE-SETTER B4 Brief · *construila* | **QA-W Aprobada Gate Abierto · _demo lista para mandar_** |
| 5 | SMOKE-SETTER B5 Construccion · *construila* | **QA-W Rechazada · _te toca a vos_** |

Ninguno de los 5 es un lead real — en las dos colas.

### 1.2 · ¿Entran los siete caros? ¿En qué posición?

Criterio de «caro», por dato y no por nombre: `stage === 'APROBADA'` **o**
`demoEnviada && (followUpVencido || postergadoVencido)`. Da exactamente los 7 de
la medición anterior.

| Lead | pos. HOY | pos. URGENCIA | ¿entra? |
|---|---|---|---|
| QA-W Aprobada Gate Abierto | 97 | **4** | **SÍ** |
| SMOKE-SETTER B7 Aprobar | 98 | 8 | no |
| M0-GAL 27-m15-envio-abierto | 99 | 10 | no |
| M0-GAL 33-m5-post-envio | 79 | 11 | no |
| SMOKE-SETTER Q5 Taller Con Link | 100 | 12 | no |
| QA-B6 Gimnasio Atlas | 101 | 33 | no |
| SMOKE-SETTER Q5 Postergado M5 | 92 | 68 | no |

**1 de 7.** Sube a todos (de ~97 a ~10), pero solo uno cruza el tope.

### 1.3 · ¿Cuántos niveles quedan representados?

| | Niveles que llegan | Inalcanzables |
|---|---|---|
| HOY | **2 de 6** | ESPERA (78) · CONTACTAR (97) · EVALUAR (102) · SIN-DEMO (170) |
| URGENCIA | **4 de 6** | EVALUAR (37) · SIN-DEMO (40) |

Duplica la representación. El nivel caro pasa de la fila 97 a la **4**.

### 1.4 · ¿Qué queda afuera que hoy entra?

Exactamente **dos**, los dos del mismo nivel:

- `SMOKE-SETTER B4 Brief` — *construila*
- `SMOKE-SETTER B5 Construccion` — *construila*

`CONSTRUIR` pasa de ocupar 3 filas a ocupar 1. No desaparece: queda en la fila 3.

### 1.5 · ¿Usa un dato que la cola no tiene hoy?

**No.** `ordenUrgencia` (`flow.ts:687-690`) lee `status` (vía `leadRespondio`),
`caliente` y `createdAt` — los tres ya están en el `HomeLead` que la cola recibe.
Y `ordenFoco` **ya lo invoca** como tercer nivel de desempate. El cambio sería
sacar `trabajoTier` de la comparación, no agregar nada: **una línea**.

---

## 2 · Las dos respuestas de la representación por nivel

Simulada (`p36-fase1-representacion.mts`) con round-robin: una vuelta reparte una
fila a cada nivel poblado en orden de prioridad; las vueltas siguientes reparten
lo que sobra.

### 2.1 · Cuántos por nivel, y qué pasa con un nivel vacío

Uno por nivel en la primera vuelta. **El lugar de un nivel vacío se reparte, no
se pierde:** vaciando `EVALUAR` la cola sigue devolviendo 5 filas y 5 niveles —
el nivel ausente simplemente no participa del reparto y el siguiente toma su
lugar. Medido.

### 2.2 · ¿Sigue teniendo sentido el tope de 5 con seis niveles?

| Tope | Niveles representados | Caros que entran |
|---|---|---|
| 5 | 5 de 6 — queda afuera `CONTACTO_SIN_DEMO` | 1 de 7 |
| **6** | **6 de 6** | 1 de 7 |
| 7 | 6 de 6 (+ el 2º fijado, en la fila 7) | 1 de 7 |

**Tope propuesto: 6.** Fundamento: con seis niveles poblados, 6 es el número
mínimo que garantiza que ninguna clase de trabajo desaparezca — que es el defecto
que el sprint vino a arreglar. Con 5, el reparto sigue dejando un nivel
estructuralmente inalcanzable; con 7 no entra ningún nivel nuevo.

---

## 3 · Por qué el sprint frena

### 3.1 · Condición de frenada: «Ninguna de las dos deja entrar a los siete caros»

Se cumple, y ahora se sabe por qué con precisión:

| Camino | Niveles | Caros |
|---|---|---|
| HOY | 2 de 6 | **0 de 7** |
| URGENCIA (la barata) | 4 de 6 | **1 de 7** |
| REPARTO, tope 5 | 5 de 6 | **1 de 7** |
| REPARTO, tope 6 | 6 de 6 | **1 de 7** |

**La aritmética del cupo:**

```
tope de la cola ............ 5
filas que toman los fijados  2
filas libres ............... 3
leads caros ................ 7
tope necesario ............. 9  (7 caros + 2 fijados)
```

**Siete caros no entran en tres filas con ningún orden ni ningún reparto.** El
límite no es el criterio: es el cupo. El sprint dice que si ninguna de las dos
los mete «el problema no es el orden ni el reparto, y hay que volver a
diagnosticar» — el diagnóstico nuevo es ese, y es aritmético.

Y la representación **no puede** mejorarlo por construcción: reparte *una* fila
por nivel, y los 7 caros se concentran en 1-2 niveles. Garantiza que el **nivel**
caro esté presente; nunca que estén los siete leads.

### 3.2 · El hallazgo que da vuelta la premisa: los siete caros son siembra

| | |
|---|---|
| caros en la cartera completa | 7 |
| caros sin siembra de corridas | 4 |
| **caros que son leads reales** | **0** |

Los siete son artefactos de suites (`QA-W`, `SMOKE-SETTER`, `M0-GAL`, `QA-B6`).
La premisa del sprint —«seis leads con la demo aprobada valen más que sesenta y
siete sin brief», «la demo ya está pagada, media hora cada una»— describe leads
que **no existen comercialmente**. Nadie gastó esas horas.

Esto **no invalida el defecto estructural**: que 4 de 6 niveles sean
inalcanzables está medido, y el control sin siembra de corridas (42 accionables)
lo reproduce igual. Lo que invalida es el **cálculo de valor** que decide el
orden — y el orden es, por regla del sprint, criterio comercial.

### 3.3 · Un costo del mecanismo nuevo que no estaba anticipado

**La representación por nivel degrada el pin.** Hoy los 2 fijados ocupan las
filas 1 y 2. Con reparto y tope 5, el segundo fijado **no entra**: aparece recién
en la fila 7, después de que cada nivel cobró su fila.

El pin es preferencia explícita del setter y el producto se lo promete por
escrito («Fijado por vos — va primero», `flow.ts:613`). El reparto rompe esa
promesa. Tiene arreglo —tratar PIN como nivel que cobra todas sus filas antes del
reparto— pero es una decisión de diseño más, no un detalle.

---

## 4 · Lo que esta medición puede estar errando

**El control sigue siendo de QA, no de producción.** Con el corte estricto quedan
3 accionables reales y ningún caro; con tope 5 la cola los muestra a los tres y
no hay nada que ordenar. Ninguno de los dos cortes es una cartera de trabajo
real, así que **el tope sigue sin poder fijarse con datos** — el 6 que se propone
sale de la cantidad de niveles, no del ritmo de nadie.

**Los 2 fijados también son siembra** (`QA-W Evaluada Gate Abierto`, `QA-W
Brief`). La aritmética del cupo (2 filas tomadas) es real hoy, pero en una
cartera real el número de fijados lo elige el setter y puede ser 0.

**El criterio de «caro» puede estar sobre-contando.** Incluye `stage ===
'APROBADA'` sin exigir `finalUrl`, así que podría alcanzar a un lead aprobado sin
link listo. El conjunto coincide con el de la medición anterior (7), pero la
etiqueta de clase A/B de este instrumento difiere: dos leads con demo ya enviada
se rotulan «A» porque la condición de `stage` se evalúa primero.
