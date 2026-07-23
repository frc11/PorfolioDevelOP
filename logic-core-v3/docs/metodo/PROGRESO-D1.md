# PROGRESO — Corrida D1 (destilar el método real de develOP)

> Archivo de progreso de la corrida. Se lee al arrancar (si existe, se retoma donde quedó)
> y se actualiza al cerrar cada parte.

**Arranque:** 2026-07-23 05:52 (tras fase de espera de 50').
**Alcance:** solo lectura del repo + escritura de documentos nuevos en `docs/metodo/`.
**Prohibido:** tocar `src/`, tests o configuración. Verificado con `git diff --stat` antes del último commit.

---

## Estado del terreno al arrancar (FASE 0)

- Worktree principal `C:/Users/franc/Desktop/PorfolioDevelOP`, rama **`main`**, HEAD **`6a88cbe`** (sprint 6.2).
- **Cambió respecto del snapshot inicial de la sesión:** el snapshot mostraba HEAD `7d323ea` (6.1) con
  `agenda-form.tsx` / `m16-agenda.tsx` modificados y `tests/setter/13-m16-memoria.spec.ts` untracked.
  Al despertar, todo eso ya estaba commiteado en `6a88cbe`. No se frenó: se anotó y se siguió.
- Sucio permitido al arrancar: `?? logic-core-v3/docs/probe-01-censo-cosecha.md` (WIP ajeno, no tocado).
- Otras 5 worktrees vivas (`.claude/worktrees/*` ×3, `wt-auditoria-maestra`, `wt-gs-aislamiento`) — solo se listaron.
- `docs/metodo/` **no existía**: corrida fresca, sin progreso previo que retomar.

---

## Partes

| Parte | Estado | Salida |
|---|---|---|
| 1 — Recuperar la evidencia | ✅ | (insumo, sin archivo propio) |
| 2 — Lecciones con evidencia | ✅ | `docs/metodo/LECCIONES-LEADOS.md` |
| 3 — Propuesta de cambios al método | ✅ | `docs/metodo/PROPUESTA-CIMIENTO.md` |
| 4 — Mapa del sistema | ✅ | `docs/metodo/MAPA-LEADOS.md` |
| Cierre | ✅ | append en `docs/bitacora-beta-3.md` |

---

## Parte 1 — fuentes leídas (cerrada)

1. **`docs/bitacora-beta-3.md` entera** (1.748 líneas): de Sprint 3.1 (2026-06-29, shell del wizard) a
   Sprint 6.2 (2026-07-23, m16 con memoria). ~45 entradas de sprint + 3 auditorías + Sprint R + Sprint T.
2. **`git log`** completo del período de remediación (`62994be`..`6a88cbe`, 21 commits) + los dos
   forenses previos (`612c4ee` sprint 1.1, `5068d88` Sprint R). `git show --stat` de los 7 commits
   no-sprint (reconciliaciones, micro-fixes, recuperaciones).
3. **`docs/auditorias/AUDITORIA-CIERRE-2026-07.md`** (333 líneas): backlog de 40 ítems, fichas
   ejecutables, sección 9 de límites declarados y el anexo de prueba de inocuidad por `git status`.
4. **`CLAUDE.md`** (raíz) — reglas no-negociables, quality baseline, anti-vibecode, frozen files,
   lessons learned, sprint protocol, subagentes.
5. **Los 17 invariantes de `check:invariants`** (cabeceras completas de los 6 más cargados de decisión:
   `particion`, `manual`, `gate-envio-demo`, `reloop-selfcheck-reset`, `self-check-gate`, `progreso-isolation`).
6. **Comentarios de decisión en el código**: greps de `§`, `a propósito`, `deliberad`, `intencional`,
   `precedente`, `decisión`, `NO se toca`, `línea roja`, `no confía en la UI`, `anti-regres` sobre
   `src/lib/leados/` y `src/app/(protected)/setter/` — ~60 hits, leídos en contexto los 12 más densos.

---

## Reporte final

**(1) Partes completadas:** las cuatro (1, 2, 3, 4) + cierre.

**(2) Lecciones nuevas fuera de la lista semilla: 11.** De las 8 semilla: 6 confirmadas, 1 confirmada
con matiz (la del exit code: la práctica está datada en el repo, el incidente original no) y 1 **no
confirmada en su forma literal** (la de "cuando un sprint frena, los siguientes del bloque no deben
correrse igual" — el repo muestra lo contrario: dependencias declaradas y respetadas; se reformuló).
Las 3 nuevas más importantes:

- **L-09 · La suite verde mide lo que cubre, no lo que importa.** `test:setter` estuvo verde 39/39
  durante todo el proyecto con `marcarAgendandoOwned` (claim atómico de agenda) sin **una sola**
  línea de cobertura; el único test que rozaba agenda sembraba `agendaJson` en AGENDADA directo,
  salteando el claim entero. El verde no mentía: nunca había prometido eso.
- **L-11 · Arreglar una trampa puede fabricar otra, y el segundo bug es más difícil de ver.**
  `178c4d7` encadenó `npm run build` a `start:qa` (mata el falso-rojo de 2.2/3.2/3.3) y con eso el
  `webServer` de Playwright empezó a caducar a los 120s — hizo falta `fccbeb7` para subirlo a 300s.
- **L-14 · El ruido recurrente anotado no es un pendiente: es una tarea de una línea.**
  `.last-run.json` se anotó "fuera del commit" **16 veces** en la bitácora a lo largo de 12 días
  antes de que una línea de `.gitignore` (`b717014`) lo resolviera — y la puso otro lane.

**(3) ¿Cimiento / Manual en el repo?** **No.** Grep global: no existen como archivos versionados
(ni el Cimiento de Chat, ni el Manual de Flujo, ni el `docs/brief-vision-flujo-setter.md` que tres
sprints y dos auditorías ya habían reportado ausente). `PROPUESTA-CIMIENTO.md` se escribió como
**documento autónomo**, con cada cambio etiquetado por la parte del método a la que corresponde, para
que Franco lo mapee. No se reconstruyó ninguno de los dos.

**(4) Cambios de método propuestos: 21** (6 ejes + un eje 7 descubierto). El más urgente:
**M-01 · un worktree por sesión, y la exclusividad de commit es del que tiene la rama chequeada** —
es el único que ya costó trabajo *perdido* (no demorado): el fix de `01-flow.spec.ts` se perdió dos
veces y hubo que reconstruirlo desde un commit huérfano (`44e25be`) y después re-hacerlo (`b468ec6`).

**(5) Contradicciones y decisiones tomadas dos veces:** 7 documentadas en LECCIONES §3. Las tres duras:
el **pin** (2.1a lo excluía del foco → 6.1 lo hace ordenar; flagueada 3 veces antes de resolverse);
la **costura `posicionDe`→`derivarPasoDelLead`** (anotada como pendiente en 4.1, 3.2 y 4.2 antes de
ejecutarse en 5.0); y el **vocabulario "caliente"** (barrido en 1.1, re-barrido en 3.1, cerrado en
3.4a — tres pasadas sobre la misma palabra). Contradicción viva sin resolver:
`setter-nav.tsx:38` afirma "Navegación SOLO por `triggerTransition` (decisión cerrada · CLAUDE.md)"
mientras `CLAUDE.md` dice que `triggerTransition()` **no aplica en portales** y no clasifica `/setter/*`.

**(6) Lo que no se pudo establecer:**
- **El incidente original del exit code pipeado.** La *práctica* correctiva está datada en el repo
  (desde el sprint 5.2, 2026-07-03: «corrido con `cd` explícito y leyendo el exit real, no la
  notificación»), pero el falso verde que la originó no quedó escrito en ninguna fuente del repo.
- **Si los sprints 5.2 y 6.x del último bloque frenaron o simplemente no se numeraron.** El propio
  Sprint 6.0 reporta que «no existe commit "sprint 5.2" en `main`» y decide reportarlo en vez de
  inventarlo. No hay fuente que diga qué pasó con ese hueco.
- **Nada de lo verificado en runtime.** Esta corrida es read-only y no ejecutó `build`, `test:setter`,
  `test:leados` ni `check:invariants`: los verdes citados son los que la bitácora reporta, no
  re-corridos acá. El MAPA marca explícitamente qué está leído del código y qué está inferido.
- **El brief de visión v2.1** sigue sin existir en el repo — la vara de tres auditorías es reconstruida.
