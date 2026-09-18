# P30 — Por qué el árbol del servidor no se commitea, y qué lo destraba

**No se arregló nada.** Cero líneas de producto. El entregable es la causa, medida, y las
opciones con su costo. La decisión entre ellas es de Franco.

---

## 0 · Terreno

| | |
|---|---|
| HEAD | `4f8c00a2b5008add2b4224059aba54f95dc96690` — *P28: un render de servidor por acción* |
| Rama | `p25/rafaga-tildes` |
| Worktrees al arrancar | 28 (ninguno propio) · **28 al cerrar** |
| Stashes | 2 (`redesign/home`, `fix/home-sanidad`) — **no tocados** |
| Disco | 33 GB libres de 925 GB (97 % usado) al arrancar · **33 GB al cerrar** |
| Procesos node ajenos | 21, ninguno escuchando en 3000-3100 (PIDs censados) |
| Worktree de la corrida | `C:\tmp\wt-p30-commit` @ `4f8c00a2` detached · `E2E_DIST_DIR=.next-p30` · puerto 3006 · `node_modules` por junction |
| Stack medido | next 16.2.9 · react / react-dom 19.2.3 · sonner 2.0.7 |

**Presupuesto: 3 variantes de 12.** Todo lo demás se midió sin recompilar — el instrumento
alcanzó.

---

## 1 · Las dos condiciones, reproducidas

- **A (con cartel)** = HEAD tal cual.
- **B (sin cartel)** = HEAD menos la llamada a `toast.success` en `use-step-action.ts` (dos
  líneas; parche en `variante-B-sin-cartel.patch`). Más ajustada que la de P29, que usaba
  el parche completo de 78 KB: acá la única variable que se mueve es el cartel.

El instrumento (`p30-mecanismo.spec.ts.txt`) es el de P29 **más la máquina de estados de
React**: los campos del FiberRoot (`pendingLanes`, `suspendedLanes`, `pingedLanes`,
`warmLanes`, `finishedWork`, `cancelPendingCommit`) sobreviven a la minificación del build
de producción de react-dom 19.2.3 — verificado por grep sobre el bundle instalado. Se
muestrea por cuadro **y** a ~4 ms, porque el ping se pone y se consume dentro de un mismo
cuadro y rAF lo pierde.

Lanes: `0x200` = una transición · `0x20` = Default · `0x8` = InputContinuous.

### A · con cartel — 3 pasadas

```
p1     5ms  pend=0x220 susp=0x0                 ← se agenda la transición
      23ms  pend=0x200 susp=0x200               ← SUSPENDIDA
     639ms  toast=1
    4649ms  frase=false tildeOk=3               ← la pantalla cambia
    4855ms  toast=0                             ← el cartel se va DESPUÉS

p2    22ms  susp=0x200
     629ms  toast=1  susp=0x0                   ← el cartel limpia la suspensión…
     639ms  susp=0x200                          ← …React reintenta y se RE-SUSPENDE
    4644ms  frase=false tildeOk=3
    4839ms  toast=0

p3    23ms  susp=0x200
     627ms  toast=1  susp=0x0
     639ms  susp=0x200
    4655ms  frase=false tildeOk=3
    4856ms  toast=0
```

**Δ cartel → pantalla: 4010 / 4015 / 4028 ms.** Los 4000 ms son el `duration` por defecto
de sonner: el `<Toaster>` de `app/layout.tsx:125` no pasa la prop. La pantalla no cambia
*mientras* el cartel está: cambia **cuando el cartel se auto-cierra**.

### B · sin cartel — 3 pasadas

```
p1    25ms  pend=0x200 susp=0x200   …y nada más en 12 s.   POST termina a  895 ms
p2    23ms  pend=0x200 susp=0x200   …y nada más en 12 s.   POST termina a  895 ms
p3    24ms  pend=0x200 susp=0x200   …y nada más en 12 s.   POST termina a 1005 ms
```

`frase=true`, `tildeOk=0`, dossier ya en `CONSTRUCCION` en la base. Reproduce a P29.

### B · ventana de 75 segundos

```
      23ms  susp=0x200
     973ms  ping=0x200                ← la promesa resolvió: React despierta el lane
     989ms  ping=0x0  susp=0x200      ← reintentó y se RE-SUSPENDIÓ
             … 74 segundos de nada.
```

**Un solo ping en toda la vida de la pantalla.** No es «tarda»: es **nunca**.

---

## 2 · Las cinco respuestas del Paso 1

### 2.1 · ¿Qué queda pendiente, exactamente?

**Un lane de transición marcado suspendido y «warm» en el FiberRoot** — `susp=0x200`,
`warm=0x200` — sostenido 75 segundos.

Lo que **no** es, medido y no leído:

- **No es un commit suspendido por recursos.** `cancelPendingCommit === null` en el 100 %
  de las muestras de todas las corridas; `cssPend=0` y `css=3` constantes. Y
  `SUSPENSEY_STYLESHEET_TIMEOUT` vale **60 000 ms**
  (`react-dom-client.development.js:27760`): una ventana de 75 s lo habría destapado. No
  pasó nada.
- **No es la caché del router.** El árbol se aplica en cuanto algo despierta el lane.

`warmLanes` es la pieza que explica el «para siempre»: React lo marca cuando ya intentó
renderizar el lane entero y quedó suspendido, y `getNextLanes` no vuelve a elegirlo.

### 2.2 · ¿Al árbol del POST le falta algo?

**No. Está completo y sirve tal cual.** Un empujón a los 6000 ms commitea la pantalla final
correcta (`frase=false`, `tildeOk=3`) **sin un solo viaje de red más** — el último fetch
termina a ~977 ms. Lo que llegó a los ~0,9 s es exactamente lo que la pantalla necesita; se
queda esperando del lado de React, no del lado de los datos.

### 2.3 · ¿Qué hace el `flushSync` de sonner que lo destraba?

**Nada propio de sonner, y nada propio de `flushSync`.** Lo que destraba es
`markRootUpdated`, que ante **cualquier** actualización de lane no-idle hace
(`react-dom-client.development.js:1141-1147`, idéntico en 19.2.3 y 19.2.8):

```js
function markRootUpdated(root, updateLane) {
  root.pendingLanes |= updateLane;
  268435456 !== updateLane &&
    ((root.suspendedLanes = 0), (root.pingedLanes = 0), (root.warmLanes = 0));
}
```

Probado por sustitución, sin tocar producto: el `<Toaster>` de sonner tiene un listener
global de teclado que hace `setExpanded(true)` (`sonner/dist/index.mjs:1049-1052`) — un
`useState` pelado, **sin `flushSync`**, invisible cuando no hay carteles montados.

| | resultado |
|---|---|
| **Alt+T** (el hotkey → hay `setState`) a los 6000 ms | **commitea 3/3**, a 18-43 ms del tecleo |
| **Alt+Y** (no es el hotkey → no hay `setState`) a los 6000 ms | **no commitea 0/3**; la pantalla sigue congelada |

Mismo evento de teclado, mismo foco, misma maquinaria de Playwright. Lo único que los
separa es si hubo una actualización de estado. **Eso corrige la inferencia de P29:** el
cartel no destraba *por* su `flushSync`, destraba *por ser una actualización*. Y explica
por qué el cuarto empujón de P29 —replicar la receta exacta de sonner— falló: replicaba la
mitad equivocada, y encima disparaba dentro de la ventana de la carrera (§4).

### 2.4 · ¿Pasa en todas, o sólo en las que no navegan?

**Ni una cosa ni la otra: es una carrera, y cae distinto en cada acción.**

Primero, un falso verde propio que hay que declarar: el barrido de los 17 casos de P28,
corrido **una vez**, dijo que `mc-arrancar` reflejaba a los 960 ms. Repetido, el mismo caso
se atascó 2 de 3. Una sola pasada publica la suerte de esa corrida. Además el criterio de
P28 (`cambioTexto` sobre `main`) **cuenta el estado local optimista**: en `m14-tilde` el
texto cambia 3/3 y el lane queda sucio 3/3. La señal honesta es el lane.

17 casos × 3 pasadas, sobre el build **sin cartel** (con cartel todos reflejarían a los 4 s
y el barrido mediría el cartel):

| caso | navega | lane limpio solo | tras el poke |
|---|---|---|---|
| m1-veredicto · m14-enviar · m14-tilde · m15-envio · m5-postergar · **mc-arrancar** · mc1-tilde | no | **0/3** | 3/3 |
| m6-brief · mc2-tilde | no | 1/3 | 3/3 |
| m1-ficha · m4-opener | no | 2/3 | 3/3 |
| m13-borrador · mc-escalar | no | 3/3 | 3/3 |
| alta · foco · m5-respondio · mr-reabrir | **SÍ** | 3/3 | 3/3 |

- **7 de 17 se atascan siempre. 11 de 17 se atascan al menos una vez de tres.**
- **Los 4 que navegan salieron limpios 3/3.** La navegación es un despacho nuevo al router
  — otra actualización, y por lo tanto un empujón natural.
- `mc-escalar` sale limpio y es el único con `router.refresh()` explícito; su action además
  **no revalida el path** (`escalar-modal.tsx:47-51`), así que no hay árbol nuevo que
  decodificar. Consistente con que la carrera sea contra el árbol revalidado — **no lo
  aislé con una variante.**
- **Los 17 commitean tras el empujón, 3/3.** Sin excepción.

Al margen, un dato de vocabulario: los call-sites de `useStepAction.run(` son **9**, no 17.
El 17 de P28 es 9 `run(` + 4 `startTransition(` + 4 `useAutosave({save})`.

### 2.5 · ¿Desarrollo vs producción? ¿Primera visita a la ruta?

- **Primera visita: NO es el factor. Medido y refutado.** Contexto frío (caché vacía):
  **4/5 atascadas**. Con la misma ruta cargada antes (caché caliente): **5/5 atascadas**.
  Calentar no ayuda; si algo, empeora.
- **Desarrollo: NO MEDIDO.** Chromium recibe `ERR_CONNECTION_REFUSED` contra `next dev` en
  dos puertos distintos (3006 y 3007), mientras `curl` y un Chromium pelado alcanzan ese
  mismo servidor y el server no registra el pedido. No lo diagnostiqué y **no afirmo nada
  sobre dev**. Lo que sí consta: el mecanismo vive en la contabilidad de lanes de react-dom,
  y `markRootUpdated` es idéntico byte a byte en el bundle de desarrollo. Eso es una razón
  para esperar que no difiera — no una medición.

---

## 3 · Hipótesis probadas

Formato pedido. Las cuatro de P29 se listan y no se repiten.

```
HIPÓTESIS   H1 · El commit está suspendido esperando recursos (hojas de estilo, imágenes).
VARIANTE    Ninguna — sólo instrumento (leer cancelPendingCommit y el estado de los <link>).
MEDICIÓN    cancelPendingCommit === null en el 100 % de las muestras de ~45 corridas.
            cssPend=0, css=3 constantes. Ventana de 75 s > SUSPENSEY_STYLESHEET_TIMEOUT
            (60 000 ms): cero transiciones.
RESULTADO   REFUTA.

HIPÓTESIS   H2 · Al árbol del POST le falta un viaje para poder aplicarse.
VARIANTE    Ninguna — instrumento (PerformanceObserver + poke tardío).
MEDICIÓN    Último fetch a ~977 ms. Poke a 6000 ms → pantalla final correcta en 18-43 ms,
            cero red adicional.
RESULTADO   REFUTA. El árbol está entero desde ~0,9 s.

HIPÓTESIS   H3 · Lo que destraba es el flushSync de sonner.
VARIANTE    B (sin cartel) — 1 build.
MEDICIÓN    Alt+T (setState sin flushSync) → commitea 3/3. Alt+Y (sin setState) → 0/3.
RESULTADO   REFUTA. Destraba markRootUpdated, no flushSync.

HIPÓTESIS   H4 · Es la primera visita a la ruta / la caché fría del cliente.
VARIANTE    Ninguna — instrumento (previsita).
MEDICIÓN    Frío 4/5 atascadas · caliente 5/5 atascadas.
RESULTADO   REFUTA.

HIPÓTESIS   H5 · El lane de transición queda suspendido y «warm», y React no vuelve a
            mirarlo hasta que otra actualización limpie ambos.
VARIANTE    Ninguna — instrumento.
MEDICIÓN    susp=0x200 + warm=0x200 sostenidos 75 s, con UN solo ping (973 ms) que
            reintenta y se re-suspende (989 ms). Cualquier actualización ajena
            → commitea en 18-43 ms, 3/3, en las 17 acciones.
RESULTADO   CONFIRMA.

HIPÓTESIS   H6 · La culpa es del startTransition externo de useStepAction.
VARIANTE    C = B + el hook sin transición (pending por useState, action fuera de toda
            transición propia) — 1 build.
MEDICIÓN    4/5 atascadas. Mismo lane 0x200, mismo susp, mismo warm.
RESULTADO   REFUTA. La transición la pone Next: callServer envuelve el despacho en
            React.startTransition incondicionalmente
            (next/dist/client/app-call-server.js:17-24). Producto no puede evitarla.

HIPÓTESIS   H7 · Lo arregla subir React.
VARIANTE    D = B + react/react-dom 19.2.8 (la última 19.x publicada; swap quirúrgico de
            los dos paquetes sobre el árbol exacto del lockfile) — 1 build.
MEDICIÓN    6/6 atascadas, mismo susp=0x200 / warm=0x200 / ent=0x200.
            Control: el poke sigue commiteando 3/3 (~35 ms).
RESULTADO   REFUTA. 19.2.8 no lo arregla.
```

**Refutadas por P29, no repetidas** (evidencia: `tests/perf/commit-del-arbol.spec.ts`, un
build cada una): `flushSync` alrededor del acuse dentro de la transición ·
`router.refresh()` restaurado en `useStepAction` · el acuse fuera de la transición
(`setTimeout(…, 0)`) · la receta exacta de sonner. **Las cuatro disparaban entre ~0,6 y
~1,0 s** — adentro de la ventana donde el reintento pierde la carrera (§4).

---

## 4 · La causa

```
useStepAction              startTransition(async () => await action())
  └─ callServer            startTransition(() => dispatchAppRouterAction(ACTION_SERVER_ACTION))
       └─ dispatchAction   const deferredPromise = new Promise(...)
                           startTransition(() => setState(deferredPromise))
            └─ useActionQueue   return isThenable(state) ? use(state) : state
```

1. El estado del router **se pone en una promesa** y el `AppRouter` la consume con `use()`
   → el render de la transición **suspende**. `root.suspendedLanes |= 0x200`,
   `root.warmLanes |= 0x200`. *(t ≈ 23 ms)*
2. La action responde, `action.resolve(nextState)` resuelve la promesa → React entrega
   **exactamente un ping** y reintenta. *(t ≈ 973 ms)*
3. En ese reintento, si el árbol RSC revalidado todavía no terminó de resolverse, el render
   **se vuelve a suspender** — y **de esa segunda suspensión no llega ningún ping más**. El
   lane queda suspendido + warm, y `getNextLanes` no lo vuelve a elegir.
   *(t ≈ 989 ms → para siempre)*
4. Cualquier actualización de estado no-idle en el mismo root llama `markRootUpdated`, que
   pone `suspendedLanes = 0` y `warmLanes = 0`. React reintenta y —con los datos ya listos—
   **commitea**.
5. En producción, la primera actualización así es **el auto-cierre del cartel de sonner, a
   los 4000 ms exactos**.

**Es una carrera, no un cuelgue determinista.** El barrido del momento del empujón la acota:

| empujón a los | 200 ms | 500 ms | 800 ms | 1100 ms | 1500 ms | 2500 ms | 6000 ms |
|---|---|---|---|---|---|---|---|
| ¿commitea? | no | no | no | **sí** | **sí** | **sí** | **sí** |

El umbral cae entre 800 y 1100 ms — encima de cuándo termina el POST (~0,9-1,0 s). Antes de
eso, el empujón limpia el lane, React reintenta, los datos no están, y se re-suspende.

**Reporte externo que coincide.** La discusión
[vercel/next.js#88767](https://github.com/vercel/next.js/discussions/88767) describe el
mismo síntoma en Next 16 + React 19 en builds de producción, incluido *«la UI se actualiza
cuando ocurre una segunda interacción no relacionada»*. Su atribución de causa raíz es de
quien la abrió, no de un mantenedor de React, y no la verifiqué: lo que vale acá es la
medición propia. Lo que **sí** verifiqué es que 19.2.8 sigue roto.

---

## 5 · Opciones, con su costo

Sin recomendación. La decisión es de Franco.

| # | Qué haría | Archivos | ¿Qué ve o cuándo lo ve? | De qué depende | Qué la rompería | ¿Verificable? |
|---|---|---|---|---|---|---|
| **1** | **Aceptar el mecanismo y documentarlo**, con un invariante que lo vigile. Nada en runtime. | 1 doc + 1 invariante + 1 prueba | No cambia nada. El setter sigue viendo el reflejo a ~4,0-4,7 s | El `<Toaster>` montado en el root layout · `duration` por defecto = 4000 (hoy no se pasa la prop) · que **toda** acción emita `successToast` · `markRootUpdated` de react-dom | Sacar el `<Toaster>`; pasarle `duration`; quitarle el `successToast` a una acción (`ofrecerHorarios` **ya no lo tiene**); migrar de sonner. Todo en silencio y con los gates en verde | **Sí, y es obligatorio.** (a) invariante estático: `successToast` presente en cada call-site de `run(`; (b) prueba de conducta con la sonda sin cartel — es la única que lo distingue |
| **2** | **Empujón deliberado y tardío** en el hook: un `setState` propio después de que la action resuelve | 1 (`use-step-action.ts`) | No cambia **qué** ve. Lo ve **~3 s antes** (≈1,1 s en vez de ≈4,7 s) | `markRootUpdated` · y un umbral que es una **carrera**, no una constante | Una red o un servidor más lentos corren el umbral y el retardo fijo vuelve a perder. Un empujón repetido lo evita, pero es un sondeo | Sí, con la sonda sin cartel. Un invariante de forma **no alcanza**: es conducta |
| **3** | **Subir React** | 2 (`package.json`, lock) | Nada | Que el arreglo llegue upstream | — | **Ya medida: 19.2.8 se atasca 6/6.** Hoy no existe |
| **4** | **Volver a `router.refresh()`** en el hook | 1 | Nada | — | — | **Refutada por P29** (medida, dentro de la transición). Y costaría el render de servidor que P28 sacó (~290 ms por acción) |
| **5** | **Reflejar con estado local optimista** en vez de esperar el árbol | 1 por pantalla (~7) | **Cambia QUÉ ve**: la pantalla pasa a mostrar lo que el cliente cree, no lo que el servidor devolvió. Puede divergir | Que cada pantalla derive bien su próximo estado | Cualquier regla de dominio que el servidor aplique y el cliente no replique | Sí, pero hay que probar la **equivalencia** cliente/servidor, que es más caro que el bug |
| **6** | **Reportarlo upstream** con la sonda como reproducción | 0 en el repo | Nada hoy | Los tiempos de React/Next | — | La sonda ya es el caso mínimo |

**La opción 1 es legítima y puede ser la más barata — pero entonces el invariante no es
opcional**, porque hoy no hay absolutamente nada que proteja el reflejo de las nueve
acciones. Ni un invariante ni una prueba lo verían caer: las pruebas esperan por condición,
y la condición se cumple porque el cartel está.

---

## 6 · ¿Explica el flake del primer render de cada ruta (P26)?

**Parcialmente, y no lo afirmo.** Coincide en que es una **carrera** con la misma firma (cae
distinto corrida a corrida, sin tocar nada). Pero P26 afinó su flake a *«sólo con server
frío»*, y acá el atasco ocurre **con el server caliente** y **no** mejora al calentar la
caché del cliente (§2.5). Comparten la forma; no probé que sean el mismo. Lo que sí queda
medido y sirve para el que retome P26: **calentar no es el eje**.

---

## 7 · Qué se tocó

- **Producto: nada.** `git diff` sobre `logic-core-v3/src`, `prisma`, `package.json` y
  `package-lock.json` del árbol real: **vacío**.
- El árbol real quedó con los mismos 4 items con los que arrancó la sesión, más
  `logic-core-v3/docs/perf-p30/` (este reporte + el instrumento + el parche de la variante B).
- Worktree `C:\tmp\wt-p30-commit` **destruido**; junction desarmada antes de borrar, sin
  recursión ciega; el `node_modules` del repo real verificado intacto (760 entradas,
  react-dom 19.2.3) después de cada paso riesgoso.
- Servidores levantados y bajados **por PID**. Ninguno escuchando en 3006/3007 al cerrar.
- Nada pusheado.

**Para la verificación humana:** la elección entre las opciones. Si la elegida es la 1, es
una decisión legítima — pero se toma sabiendo que el reflejo de la pantalla depende hoy de
que un cartel de avisos se auto-cierre a los cuatro segundos, y que nada lo vigila.
