# P31 — Las mediciones, crudas

Instrumento: `p31-agenda.spec.ts.txt` (la sonda de P30 con la máquina de lanes de React
adentro), corrida contra un worktree descartable en `C:\tmp\wt-p31-reflejo`, build propia
(`E2E_DIST_DIR=.next-p31`), puerto 3008, servidor tibio.

Cal.com queda stubeado (`stubs-cal-com.patch`) para poder llegar al camino de ÉXITO de
`ofrecerHorarios` **sin tocar la base compartida**: la config sale de `Organization`, y
sembrarle un `calComUsername` a una org real le cambiaría la conducta a la app de verdad.

Lanes: `0x200` = una transición · `susp` = `suspendedLanes` · `warm` = `warmLanes`.

---

## 1 · El sujeto: `ofrecerHorarios` (m16), la acción SIN cartel

**Refleja igual. 4 de 4 pasadas, con cero carteles en pantalla.**

| pasada | susp aparece | la pantalla muestra los horarios | toast |
|---|---|---|---|
| 1 | 13 ms | **1429 ms** (`slots=3`, `susp=0x0`, `warm=0x0`) | 0 en todo momento |
| 2 | 12 ms | **696 ms** | 0 |
| 3 | 14 ms | **698 ms** | 0 |
| 4 | 13 ms | **681 ms** | 0 |

El lane se limpia en la misma muestra en la que aparecen los horarios: lo destraba el
`setState` de su propio `onSuccess` (`setOferta(...)`). Y no hay árbol de servidor esperando
— `ofrecerHorarios` es **la única de las nueve que no llama `revalidatePath`**.

## 2 · El control: `iniciarConstruccion` (mc1), en el MISMO build

Sirve de discriminador: si el sujeto reflejara rápido y el control también, «refleja» no
probaría nada.

| pasada | cartel monta | la pantalla commitea | Δ cartel → pantalla |
|---|---|---|---|
| 1 | 821 ms | **4831 ms** | 4010 ms |
| 2 | 623 ms | 958 ms | — *(le ganó a la carrera)* |
| 3 | 632 ms | **4645 ms** | 4013 ms |
| 4 | 617 ms | **4626 ms** | 4009 ms |

**3 de 4 esperan al auto-cierre del cartel**, a los 4000 ms exactos de montarse. La cuarta
ganó la carrera: el montaje del cartel a los 623 ms limpió el lane y el reintento —a los
~958 ms— encontró el árbol ya resuelto. Reproduce a P30, incluida su condición de carrera.

## 3 · El acantilado del `duration` — tres builds

Lo que decide no es cuándo APARECE el cartel sino cuándo SE CIERRA.

| `duration` | monta | cierra / commitea | ¿commitea? |
|---|---|---|---|
| **4000** (default de hoy) | ~0,63 s | ~4,65 s | **sí**, 4/4 |
| **800** | ~0,62 s | ~1,43 s | **sí**, 3/3 |
| **150** | ~1,45 s | — | **NO. Nunca.** |

Con 150 ms, la traza completa:

```
  14ms  susp=0x200 warm=0x200
1441ms  ping=0x200                     ← el árbol resolvió
1451ms  toast=1  susp=0x0              ← el cartel monta y limpia
1456ms  susp=0x200 warm=0x200          ← reintenta y SE RE-SUSPENDE
1625ms  susp=0x0                       ← otro respiro…
1627ms  susp=0x200 warm=0x200          ← …y otra vez adentro
1807ms  toast=0   susp=0x200           ← el cartel se fue y el lane SIGUE sucio
        … nada más en lo que queda de la ventana de 12 s.
        frase=true · tildeOk=0 — la pantalla quedó en el estado viejo.
```

**El acantilado está entre 150 y 800 ms en esta máquina.** No es una constante: depende de
cuándo resuelve el árbol, que se movió entre **0,62 s y 1,44 s** entre corridas de la misma
máquina. Por eso el piso del invariante (3000 ms) es margen declarado, no el acantilado.

## 4 · Qué demostró qué

| | sin `successToast` | `duration=150` | `duration=800` | intacto |
|---|---|---|---|---|
| `check:invariant:reflejo` | 🔴 | 🔴 | 🔴 | ✅ |
| `test:setter -- 31-reflejo` | 🔴 | 🔴 | ✅ | ✅ 3/3 |

La columna de `duration=800` es la que le da valor a la prueba de conducta: con el **mismo
cartel presente**, da verde cuando el mecanismo anda y rojo cuando no. Eso es lo que dice que
mira el MECANISMO y no la presencia del cartel — que era el riesgo declarado del sprint.

El invariante estático sí la pone en rojo, y a propósito: su piso es una política de margen,
no el acantilado. Las dos herramientas responden preguntas distintas y por eso hacen falta
las dos.

## 5 · Censo de las nueve acciones de `run(`

| call-site | acción | ¿revalida? | ¿cartel? |
|---|---|---|---|
| `manual/_components/agenda-form.tsx` | `ofrecerHorarios` | **no** | **no** |
| `manual/_components/agenda-form.tsx` | `confirmarReunion` | sí | sí |
| `manual/_components/chequeo-form.tsx` | `guardarSelfCheck` + `enviarARevision` | sí | sí |
| `manual/_components/construccion-ctas.tsx` | `iniciarConstruccion` | sí | sí |
| `manual/_components/construccion-ctas.tsx` | `reabrirConstruccion` | sí | sí |
| `manual/_components/envio-form.tsx` | `enviarDemoAprobada` | sí | sí |
| `manual/_components/seguimiento-form.tsx` | `registrarResultado` | sí | sí |
| `_components/brief-form.tsx` | `guardarBrief` | sí | sí |
| `_components/evaluacion-form.tsx` | `registrarEvaluacion` | sí | sí |

**La correspondencia es exacta: la única sin cartel es la única que no revalida.** No es
casualidad — es la misma razón las dos veces.
