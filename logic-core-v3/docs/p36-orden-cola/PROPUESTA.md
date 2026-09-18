# P36 · Paso 1 y 2 — El orden propuesto y la decisión sobre el tope

> Nada de esto está implementado. El orden es criterio comercial y el mecanismo
> cambia qué ve el setter al abrir el día: las dos decisiones son de Franco.

---

## Paso 1 · El orden, propuesto con la medición

### Distancia a la reunión, contada en pasos de producto

No es intuición: son los pasos que el recorrido exige desde cada estado hasta que
hay reunión agendada.

| Hoy | Tier | Qué falta | Pasos | Costo de lo que falta |
|---|---|---|---|---|
| 2 | `CONTACTAR_CON_DEMO` | mandar el link | **1** | minutos |
| 1 | `ESPERA` · rama *demo enviada, toque vencido* | el toque | **1** | minutos |
| 1 | `ESPERA` · rama `RECHAZADA` | rehacer → revisión → aprobar → mandar | 4 | 30 min + espera de Franco |
| 0 | `CONSTRUIR` | construir → revisión → aprobar → mandar | 4 | 30 min + espera de Franco |
| 3 | `EVALUAR` | veredicto → (puede morir en el filtro) | 5+ | minutos, sin garantía |
| 4 | `CONTACTO_SIN_DEMO` | que conteste | indefinido | no depende del setter |

### El orden propuesto

| Posición | Tier | Fundamento **medido** |
|---|---|---|
| 0 | `CONTACTAR_CON_DEMO` ⬆ *(sube de 2)* | Único tier a **un paso** de la reunión con la demo ya pagada (30 min ya gastados) y el negocio ya respondiendo. Y **escaso por naturaleza**: 6 en todo el sistema. Un tier escaso arriba no puede monopolizar. |
| 1 | `ESPERA_TU_ACCION` = | Su rama más cara también está a un paso (demo enviada + toque vencido). Las otras ramas son retrabajo sobre demo existente. 19 leads. |
| 2 | `CONSTRUIR` ⬇ *(baja de 0)* | **Lo que baja.** Sigue siendo el trabajo que produce valor, pero está a 4 pasos y es el tier **más poblado del embudo: 67 contra 6, 11,2×**. Arriba monopoliza la cola por construcción. |
| 3 | `EVALUAR` = | Sin veredicto no hay nada pago todavía; puede morir en el filtro. |
| 4 | `CONTACTO_SIN_DEMO` = | El paso no depende del setter. |

**Qué baja: `CONSTRUIR`, de la posición 0 a la 2.** Ordenar es elegir, y esto
revierte parcialmente una decisión deliberada de P8 (`flow.ts:709-723`), que lo
puso primero porque "es el trabajo que produce valor y el que antes no se
sugería". Ese razonamiento sigue siendo cierto — lo que P8 no contemplaba es que
el tier más poblado en la cima vuelve inalcanzable a todo lo demás.

### Pero el reorden solo NO alcanza — y está medido

Simulación con `CONTACTAR_CON_DEMO` movido a la cima, misma cartera:

| | fila 1 | 2 | 3 | 4 | 5 | Resultado |
|---|---|---|---|---|---|---|
| hoy | PIN | PIN | T0 | T0 | T0 | T1·T2·T3·T4 inalcanzables |
| reordenado | PIN | PIN | T2 | T2 | T2 | **`CONSTRUIR` inalcanzable** |

Se cambia quién monopoliza, no la monopolización. Con la cartera sin artefactos
pasa lo mismo. **Reordenar mueve el problema de lugar.**

---

## Paso 2 · El tope

### El número

| | accionables | tope | ocultos |
|---|---|---|---|
| cartera completa (224) | 179 | 5 | 174 |
| sin artefactos de suites (28) | 12 | 5 | 7 |

El 179 **no sirve para decidir**: 165 de esos leads son semillas que dejaron las
corridas de test. El número honesto de esta cartera es **12**, y ni siquiera ese
es "el ritmo de Franco" — es una cartera de QA, no de producción. No existe hoy
una cartera real de producción contra la cual fijar el tope.

### Cuál de las tres salidas

Según la tabla del sprint, la respuesta es la tercera, pero por un motivo que la
tabla no anticipaba:

> **Un tope fijo es el mecanismo equivocado.**

No porque los accionables varíen mucho por día, sino porque **un orden total
estricto cortado en N hace que el primer nivel con N o más leads consuma la cola
entera**. Con 12 accionables y 7 ocultos ya pasa. El tope no es la variable que
decide quién se pierde: la decide la forma del orden.

### Qué lo reemplaza — a decidir

**Representación por nivel en vez de orden total.** La cola deja de ser "los 5
mejores de una lista" y pasa a ser "lo mejor de cada clase de trabajo":

1. Reservar **una fila por nivel poblado**, recorriendo los niveles en el orden
   propuesto arriba.
2. Repartir las filas sobrantes por ese mismo orden.

Con las 5 filas de hoy y los 6 niveles poblados quedaría: PIN · CONTACTAR ·
ESPERA · CONSTRUIR · EVALUAR — y `CONTACTO_SIN_DEMO`, el que menos rinde, es el
único que no entra. **Ningún nivel queda inalcanzable**, que es el defecto medido.

Con esto el tope vuelve a significar lo que decía el comentario de `cola.ts:29-37`
—cuánto trabajo se lee de un vistazo— en vez de decidir en silencio qué clases de
trabajo no existen.

---

## Las tres decisiones que quedan para Franco

1. **El orden.** ¿Mandar el link rinde más que construir? La medición dice que
   está más cerca de la reunión y que el tier es escaso; la plata es suya.
2. **El mecanismo.** ¿Representación por nivel, o se acepta que un nivel
   monopolice?
3. **El tope**, si se adopta representación: 5 deja afuera a
   `CONTACTO_SIN_DEMO`; 6 entra todo.

---

## Dónde se implementaría, y qué lo condiciona

Leído del invariante vigente (`cola.invariant.ts`), dos cosas acotan cualquier cambio:

### 1. `armarCola` no puede reordenar — y no debe

El invariante lo fija explícitamente:

```
// 4. El orden es el que le entregan: foco + resto, en ese orden.
assert.deepEqual(ids, esperado, 'la cola concatena foco + resto sin reordenar')
```

`cola.ts` es posicional a propósito: recibe el orden hecho y lo corta. La
representación por nivel **no va ahí**. Va antes — en cómo se arma `resto`, entre
`seleccionarFoco` y `armarCola`, o como un paso propio. Eso preserva la
separación que hoy existe (criterio en `flow.ts`, selección en `foco.ts`,
presentación en `cola.ts`) en vez de romperla.

### 2. El tope tiene un guard congelado que se pone rojo a propósito

```
const TOPE_COLA_CONGELADO = 5
assert.equal(TOPE_COLA, TOPE_COLA_CONGELADO, ...)
```

Si se cambia `TOPE_COLA`, el invariante **falla a propósito** — para obligar a
mirar el número nuevo y decidir si sigue siendo una cola. No es un obstáculo: es
el mecanismo funcionando. Un cambio de tope se acompaña de actualizar
`TOPE_COLA_CONGELADO` en el mismo commit.

### 3. Lo que habría que demostrar fallando

- **Que los estados caros llegan**: un test que arme una cartera con los seis
  niveles poblados y afirme que ninguno queda sin representación. Hoy falla — es
  el defecto medido.
- **Aislamiento**: la cola de un setter no muestra leads de otro. Con el aserto
  correcto: si el rojo sale por el tope en vez de por el `assignedToId`, el test
  no prueba aislamiento. Un tope chico puede tapar una fuga — ya pasó.

---

## Lo que esta propuesta puede estar errando

**El ratio 11,2× es una cota inferior, no el número.** Se midió `BRIEF +
CONSTRUCCION` (67) contra `APROBADA + finalUrl + sin enviar` (6). Pero el tier
`CONSTRUIR` también recoge `EVALUADA && gateAbierto` (`flow.ts:741`), que no está
contado. El tier real es más grande y la desproporción mayor. El argumento se
fortalece; el número exacto no está medido.

**La representación por nivel tiene un costo, y hay que nombrarlo.** Garantiza
que ningún nivel desaparezca, pero eso significa que un nivel con un solo lead
flojo ocupa una fila que un nivel urgente podría usar mejor. Con 20 demos para
construir y 1 lead sin evaluar, la cola gastaría una de sus cinco filas en el
lead sin evaluar. Si Franco prefiere que la cola sea "las cinco cosas más
urgentes" aunque eso entierre clases enteras de trabajo, **la propuesta es
equivocada y el orden actual está bien** — solo habría que mover
`CONTACTAR_CON_DEMO` arriba y aceptar que `CONSTRUIR` pase a ser el enterrado.
Esa es una decisión de negocio, no de código.

**"Cartera real" quiere decir cartera real de QA.** No hay producción contra la
cual medir. Los 224 leads son semillas: 165 dejadas por corridas automáticas y
~14 curadas a mano para los estados del manual. El corte señal/ruido que se usó
para el control es una línea trazada por prefijo de nombre, no una distinción
ontológica — sirve para probar que el defecto no depende del volumen, no para
fijar un tope. **El tope sigue sin poder decidirse con datos.**
