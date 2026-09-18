# Reporte upstream — PREPARADO, NO PUBLICADO

**Nada de esto se publicó.** Queda listo para que Franco decida si va, y a dónde.

---

## Para Franco: dónde va, y por qué

**Recomendación: primero la discusión que ya existe en Next.js, no un issue nuevo.**

[vercel/next.js#88767](https://github.com/vercel/next.js/discussions/88767) ya describe el
síntoma —incluido *«la UI se actualiza cuando ocurre una segunda interacción no
relacionada»*— pero sin mecanismo ni medición. Lo que aportamos es exactamente lo que le
falta: **el lane concreto, por qué no vuelve a despertarse, el caso mínimo y el
discriminador Alt+T / Alt+Y**. Sumarlo ahí llega a la gente que ya está mirando el problema
y no abre una superficie nueva.

**Un issue en `facebook/react` es defendible pero más discutible**, y conviene decidirlo
sabiendo esto: la transición no la pone producto ni React — la pone Next
(`callServer` envuelve el despacho en `React.startTransition` incondicionalmente). Que un
lane suspendido + «warm» no se vuelva a elegir sin una actualización ajena puede ser el
comportamiento *diseñado* de `getNextLanes`; lo que es discutible es que un `use()` sobre una
promesa que YA resolvió quede sin reintento. No lo afirmo: no leí la intención de diseño, y
un issue que afirma un bug de React sin eso se cierra rápido.

**Qué NO va en el reporte:** nada del producto. Ni nombres de pantallas, ni copy, ni rutas,
ni el dominio del negocio. El caso reducido es una app de Next pelada.

**Lo que falta antes de publicar** (decisión de Franco, no la hice):
- Reproducirlo en una app **nueva y mínima** creada con `create-next-app`. Lo de acá está
  medido sobre este repo; el reporte de abajo describe el caso reducido, pero **no lo
  construí ni lo corrí** — decirlo así o construirlo antes de mandar.
- Confirmar si pasa también en `next dev`. **Está sin medir** (§ «Lo que no sé»).

---

## Cuerpo del reporte (en inglés, listo para pegar)

### Title

`After a Server Action that revalidates, the router transition stays suspended forever until an unrelated state update occurs`

### Environment

```
next          16.2.9
react         19.2.3   (also reproduced on 19.2.8)
react-dom     19.2.3   (also reproduced on 19.2.8)
sonner        2.0.7    (only as the accidental "unblocker" — see below)
Build         production (`next build` + `next start`), Windows 11, Chromium via Playwright
```

Not measured in `next dev` — see "What I don't know".

### Summary

In a production build, calling a Server Action that calls `revalidatePath()` from a client
component leaves the router transition **permanently suspended**. The action completes, the
revalidated RSC tree arrives (~0.9 s), and the UI keeps rendering the **old** state
indefinitely — measured over a 75-second window with the new data already committed to the
database.

The tree commits as soon as **any** unrelated non-idle state update happens anywhere in the
same root. It does not matter what that update is.

This is easy to miss because most apps show a toast after a mutation, and the toast's own
mount/auto-dismiss `setState` is what unsticks the screen. The UI appears to "just be slow"
by exactly the toast's duration.

### Reduced case

```
1. Client component calls a Server Action inside a transition.
2. The Server Action writes something and calls revalidatePath(currentPath).
3. Nothing else on the page produces a state update.
   → The screen never shows the new data.

4. Now make anything call setState (press a key that a global listener handles,
   focus something with a listener, mount a toast — anything).
   → The screen commits within ~20-40 ms, with no additional network request.
```

### What I measured

Sampled the `FiberRoot` fields every animation frame **and** every ~4 ms (a ping can be set
and consumed inside one frame, so rAF alone misses it). The field names survive production
minification in react-dom 19.2.3.

Lanes: `0x200` = a transition.

**Stuck condition, 75-second window:**

```
  23 ms   pendingLanes=0x200  suspendedLanes=0x200  warmLanes=0x200
 973 ms   pingedLanes=0x200        ← the promise resolved, React wakes the lane
 989 ms   pingedLanes=0x0     suspendedLanes=0x200  warmLanes=0x200
          ← it retried, re-suspended, and that is the last event.
          … 74 seconds of nothing.
```

**Exactly one ping in the lifetime of the page.** It is not slow, it is never.

**The tree is complete and usable from ~0.9 s.** An unrelated state update at 6000 ms commits
the correct final screen in 18–43 ms **with zero additional network traffic** (last fetch
finished at ~977 ms).

**It is not a suspended commit waiting on resources.** `cancelPendingCommit === null` in 100 %
of samples across ~45 runs; stylesheet count constant and none pending. The 75 s window
exceeds `SUSPENSEY_STYLESHEET_TIMEOUT` (60 000 ms) and nothing happened.

### What unblocks it — and what does not

The discriminator, same keyboard event, same focus, same machinery, one build:

| poke at 6000 ms | has a `setState`? | commits? |
| --- | --- | --- |
| `Alt+T` — a hotkey a mounted global listener handles | **yes** | **3/3**, in 18–43 ms |
| `Alt+Y` — not the hotkey, listener ignores it | **no** | **0/3**, still frozen |

So it is not `flushSync`, not the event, not focus. It is any call to `markRootUpdated`, which
for every non-idle lane does:

```js
root.pendingLanes |= updateLane;
268435456 !== updateLane &&
  ((root.suspendedLanes = 0), (root.pingedLanes = 0), (root.warmLanes = 0));
```

`warmLanes` is the part that makes it permanent: once React has rendered the whole lane and
suspended, it marks it warm and `getNextLanes` stops selecting it.

### It is a race, not a deterministic hang

Sweeping *when* the poke happens brackets it:

| poke at | 200 ms | 500 ms | 800 ms | 1100 ms | 1500 ms | 2500 ms | 6000 ms |
| --- | --- | --- | --- | --- | --- | --- | --- |
| commits? | no | no | no | **yes** | **yes** | **yes** | **yes** |

The threshold sits just above when the action's POST completes (~0.9–1.0 s). Before that, the
poke clears the lane, React retries, the revalidated tree still is not ready, and it
re-suspends — into the state it cannot leave.

Consistent with that, across 17 different actions × 3 passes on a build with the toast
removed: **7 of 17 stick every time, 11 of 17 stick at least once in three.** The 4 actions
that also navigate came out clean 3/3 — a router dispatch is itself an update.

### The chain, as far as I traced it

```
callServer          startTransition(() => dispatchAppRouterAction(ACTION_SERVER_ACTION))
  └─ dispatchAction   const deferredPromise = new Promise(...)
                      startTransition(() => setState(deferredPromise))
       └─ useActionQueue   return isThenable(state) ? use(state) : state
```

The router state is put in a promise consumed with `use()`, so the transition render
suspends. When `action.resolve(nextState)` runs, React delivers one ping and retries; if the
revalidated RSC tree has not finished resolving at that instant, it suspends again — and no
further ping is delivered for that second suspension.

### Ruled out, with evidence

| Hypothesis | Result |
| --- | --- |
| Commit suspended on resources (stylesheets/images) | **Refuted** — `cancelPendingCommit === null` in 100 % of samples; 75 s > the 60 s stylesheet timeout |
| The tree needs another round trip | **Refuted** — poke at 6000 ms commits in 18–43 ms with zero extra network |
| It is `flushSync` specifically that unblocks it | **Refuted** — a plain `useState` with no `flushSync` unblocks it; the same event without a `setState` does not |
| First visit / cold client cache | **Refuted** — cold 4/5 stuck, warm 5/5 stuck. Warming does not help |
| The app's own `startTransition` wrapper | **Refuted** — removing it changes nothing; Next wraps the dispatch unconditionally |
| **Upgrading React fixes it** | **Refuted — `react`/`react-dom` 19.2.8 sticks 6/6**, same lanes. Surgical two-package swap on the same lockfile tree. The poke still commits |

### Why this is worth fixing even though there is a workaround

The workaround is invisible and accidental. In our app the screen updates because a toast
auto-dismisses 4000 ms after it mounts. Nothing in the codebase says so. Removing the toast
component, shortening its duration, or dropping the toast from one action freezes the screen —
with no error, no warning, and a fully green test suite, because tests wait on conditions and
the condition is met *by the toast*.

We measured the duration cliff directly: `duration=4000` commits at ~4.65 s, `duration=800`
commits at ~1.43 s, and `duration=150` **never commits** — the dismiss lands inside the race
window.

### What I don't know

- **`next dev` is unmeasured.** Chromium got `ERR_CONNECTION_REFUSED` against `next dev` on
  two different ports while `curl` and a bare Chromium reached the same server and the server
  logged no request. I did not diagnose it and I make no claim about dev. `markRootUpdated` is
  byte-identical in the development bundle, which is a reason to expect no difference — not a
  measurement.
- Whether this is intended `getNextLanes` behavior, or a missing retry for a `use()` promise
  that has already resolved.
