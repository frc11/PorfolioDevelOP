# B9 — Plan de refresh visual de LeadOS

**Estado:** PROPUESTA — Fase 1. Esperando luz verde de Franco antes de tocar componentes.
**Rama:** `leados/b9-refresh-visual`
**Fecha:** 2026-06-13
**Alcance:** refresh visual y de experiencia (REFRESH MEDIO). Cero lógica, cero schema.

---

## 0. Cómo recorrí esto (no es solo lectura de código)

Mapa de código de las 5 superficies + kit UI (fan-out de subagentes read-only) **más** recorrido en vivo sobre `dev:qa` (3002) como setter y como super-admin:

- **`/setter` (home-hub):** recorrido completo, sesión `setter`. 4 leads "Para trabajar", 3 "Esperando revisión", 1 "Agendada", onboarding visible, descartados colapsados.
- **`/setter/leads/[id]` (wizard):** recorrido sobre *QA-B7 Estética Bella Vista* (RESPONDIÓ / EVALUADA). Confirmé en vivo el problema central (ver §3).
- **`/admin/leados` y `/admin/leads`:** shell admin confirmado en vivo; el contenido se renderiza server-side OK (`GET /admin/leados/… 200 in 557ms`, `migrate status` = *Database schema is up to date!*), pero **la instancia de preview se trabó** para capturar/hidratar `/admin/*` (Suspense no completa + pipeline de screenshot colgado a 30s). Es un problema de la instancia del browser de preview, **no del código ni de la DB** (lo diagnostiqué: `prefersReducedMotion:false`, server 200, DB arriba). Para esas dos superficies el plan se apoya en el mapa de código exhaustivo + las capturas que sacaré con un preview limpio al arrancar Fase 2.

> **Nota de evidencia:** el screenshot del preview cuelga en esta instancia. **Antes de ejecutar Fase 2 reinicio el preview en limpio** para tener el antes/después por superficie (es lo único que valida un refresh). Si no se recupera, lo flagueo y las capturas las hacés vos. No cierro ninguna superficie a ciegas.

---

## 1. ADN actual (de dónde parto — no invento identidad)

LeadOS **ya** tiene un lenguaje propio y coherente; no está roto ni feo. Vive en `src/lib/design-tokens.ts`, `src/lib/design-patterns.ts`, `globals.css` y `src/components/ui/*`.

- **Dark nativo:** `--color-void` `#09090b` (zinc-950). Glass de white-alpha 2/4/6%. Borders `white/10`.
- **Acento único de marca:** cyan `#06b6d4`. (La marca primaria del portal es cyan, **no** amber — ver memoria `project_two_design_languages`.)
- **Semántico con regla escrita** (`design-tokens.ts`): verde=bueno/hecho, ámbar=atención/pendiente, rojo=problema, azul=info. *"Si no comunica estado, acción o servicio, es neutro. No hay color decorativo."*
- **Tipografía sobria** (`patterns.text`): eyebrow 10px/`0.24em`, h1 3xl, h2 2xl, h3 lg, body sm, caption xs, mono.
- **Motion suave:** easing `[0.25,0.46,0.45,0.94]`, durations 0.15–0.4s; reduced-motion ya respetado en varios componentes.

**El refresh eleva este ADN; no lo reemplaza.** El resultado es "el mismo producto, más pro y más cómodo".

---

## 2. Tesis del refresh: **alinear y jerarquizar, no agregar**

El recorrido en vivo + el mapa muestran que los problemas **no son de identidad** sino de **jerarquía de información** y **consistencia**. Tres diagnósticos:

1. **La "próxima acción" del setter se susurra.** En el home es `text-xs` cyan-300 — del mismo tamaño que la meta pasiva, perdida entre 15+ cards. En el wizard se apilan 6+ cards de paso con numeración no secuencial (vi en vivo: Paso 2, 7, 9, 10, 3) y la card que pide acción se ve igual que todas. El setter tiene que *leer y pensar* para encontrar "qué hago ahora" — lo opuesto al objetivo.
2. **La cola de Franco no rankea visualmente.** Los "Calientes" ordenan primero por código, pero cada fila pesa visualmente igual (mismo glass card). "Revisá esto primero" se comunica solo por posición. Y el panel de reunión —el resultado del negocio— lleva borde **ámbar** (warning), codificando la acción más importante como "precaución".
3. **"Siete bloques pegados" = inconsistencia por hardcodeo.** Existen `tokens` + `patterns`, pero las superficies los esquivan: radios custom (`rounded-[28px]/[26px]/[24px]` en vez de la escala 12/16/24), **8+ funciones de color duplicadas** (statusTone/serviceTone/resultTone…), inputs que no coinciden (`bg-black/20` vs `bg-white/5`), el `Modal` hardcodeado `bg-zinc-950` que rompe el glass, y las clases `.admin-*` definidas-pero-sin-usar. Cada superficie derivó por su cuenta → sensación de "kits distintos pegados".

Por eso el refresh **no inventa nada nuevo**: hace que la estructura cargue información (urgencia, qué sigue, estado) y unifica las tres zonas sobre los tokens/patterns que ya existen. El movimiento es mínimo y solo donde aclara estado.

---

## 3. Sistema de tokens: actual → propuesto (afino, no redefino)

### 3.1 Color — 6 roles, hexes ya existentes, **disciplina reforzada**

No cambio ningún hue. Lo que propongo es **enforcar la regla de color** donde las superficies la rompieron.

| Rol | Hex (token) | Significa | Hoy se rompe en… |
|---|---|---|---|
| **Acción / siguiente paso / activo** | cyan `#06b6d4` (hover `#22d3ee`) | "hacé esto" | diluido en links de navegación ("Siguiente en la cola") y en el panel estático de Materiales |
| **Atención / pendiente / caliente** | amber `#f59e0b` | "mirá esto" | usado como color del panel de Reunión (debería ser resultado, no warning) |
| **Hecho / ganado / éxito** | emerald `#10b981` | "resuelto" | sub-usado; el cierre/reunión no lo reclama |
| **Problema / rechazo / error** | red `#ef4444` | "algo falla" | OK, pero conviven 2 intensidades de rosa para la misma severidad |
| **Info / estado de workflow** | blue `#3b82f6` + neutros zinc | "dato, no acción" | stages a veces en cyan → compiten con lo accionable |
| **Superficie / texto** | void `#09090b`, glass `white/2–6%`, texto zinc-50/200/400/500 | base | OK |

**Regla operativa del refresh:** cyan se reserva para lo accionable y el estado activo; los stages/estados informativos pasan a azul/neutro para no diluir el cyan. (Es la regla que ya está escrita en `design-tokens.ts`, aplicada con disciplina.)

### 3.2 Tipografía — adoptar `patterns.text` en todas las superficies

Roles existentes (eyebrow / h1–h4 / body / caption / mono) aplicados consistentes. **Una sola adición que hoy falta y se necesita:** un rol **"acción"** para la próxima-acción del setter — `text-sm font-medium` cyan con icono, **promovido fuera del tier "caption"** para que pese más que la meta.

### 3.3 Espaciado y radios — una sola escala

Colapsar los px custom a 3 niveles tomados de los tokens (`radii`):

- **Panel / sección** → `rounded-3xl` (24px) — reemplaza `[28px]`/`[26px]`.
- **Card / tile** → `rounded-2xl` (16px) — reemplaza `[24px]`.
- **Control (input, chip, botón)** → `rounded-xl` (12px).

Espaciado por `patterns.section` (`p-4/5/6/8`) y `space-y-6`. Mismos valores en las tres zonas.

---

## 4. Principios de jerarquía

### 4.1 Setter — "qué hago ahora" salta solo

- **Home:** la próxima-acción deja de ser caption y pasa a **fila/pill accionable** (verbo primero, icono, cyan) arriba del nombre del negocio. Cards accionables con **borde-acento izquierdo** (cyan = accionable / zinc = esperando). El grupo **"Para trabajar ahora"** gana un *lane* sutil (acento izquierdo o tinte de fondo bajísimo) que lo separa de los grupos de espera.
- **Rechazo:** hoy el callout rosa está enterrado dentro de la card. El "Arreglo" de Franco sube a señal de nivel-card (banda/acento), porque es un punto de decisión de alta atención.
- **Wizard:** 3 estados de card claramente distintos → **activa** (superficie elevada + ring cyan, la más visible), **hecha** (colapsada a una línea-resumen con check emerald), **bloqueada** (dim + candado). Así "¿dónde estoy / qué sigue?" es instantáneo aunque haya 6 cards apiladas.

### 4.2 Franco — juzga rápido y certero

- **Cola:** las filas **rankean** — los Calientes ganan acento ámbar en el borde y peso visual (no solo posición). De un vistazo: "esto primero".
- **Pantalla de 2 minutos:** se mantiene el layout (demo a la izquierda, paneles + veredicto a la derecha). Se unifica el ritmo de los paneles en **un solo componente de panel** (hoy cada uno tiene su intensidad de borde/fondo) y se le da al veredicto una señal de "listo para tu decisión".
- **Detalle de lead / `/admin/leads`:** el **panel de Reunión pasa a ser el héroe** de la columna derecha (emerald/cyan, más grande, arriba) en vez de un par ámbar entre demos y actividad. El cross-link a `/admin/leados` (hoy texto chico cyan, fácil de perder) se hace descubrible (chip + icono).

---

## 5. Ritmo del wizard

- **Stepper (5 fases):** se conserva. Mejoro estética de estados (hecho/actual/pendiente/bloqueado) y en desktop **labels sin truncar** ("Const…" → "Construcción"); en mobile, abreviaturas legibles en vez de corte.
- **Avanzar de paso se siente:** **una** microinteracción deliberada — cuando un paso se desbloquea, entra con un fade-up corto (easing del token); el resto, quieto. Nada de animación por todos lados.
- **Bloques copiables** (el control que el setter más usa): tratamiento de "zona de acción" más claro (borde cyan que destaca) + **flash de confirmación** al copiar (hoy solo cambia el icono del botón).
- **Self-check:** separación visual fuerte entre checks **duros** (obligatorios, bloquean envío) y **blandos** (opcionales). Y como el copy le pide al setter *"abrila en tu celular"*, **el panel self-check tiene que ser impecable en mobile** (calidad floor, §8).

---

## 6. Tratamiento de estados (vacío / carga / error = dirección, no adorno)

El kit ya tiene `EmptyState`/`ErrorState`/`LoadingState`/skeletons. El refresh los usa como **momentos de dirección** y afina el **copy** (voz de la interfaz: activa, específica, "vos"):

| Estado | Hoy | Propuesto (copy de ejemplo) |
|---|---|---|
| Home sin leads | "Todavía no tenés leads asignados" | + qué pasa después: *"Cuando Franco te asigne uno, aparece acá y te digo el primer paso."* |
| Grupo vacío ("En seguimiento") | "Nadie en seguimiento." | mantener — es correcto y seco, está bien. |
| Carga | skeletons (OK) | skeletons que **calcan el layout final** (ya casi); sin cambios de copy. |
| Error | "algo salió mal" + retry | causa en lenguaje plano + retry: *"No pude traer tus leads. Reintentá; si sigue, avisá a Franco."* |
| Demo sin URL (revisión) | placeholder dashed | dirección: *"La demo todavía no tiene link publicado. Revisá la ficha y el brief mientras tanto."* |

El copy que cambie **sigue siendo verdadero al flujo** (no renombro acciones que mientan; "publicar ≠ enviar", los gates y el guardrail de rol conservan su significado, solo ganan claridad).

---

## 7. El "más pro": 3 unificaciones que matan el "siete bloques pegados"

1. **Un solo lenguaje de contenedor.** Rutear radios/espaciado/glass por `tokens` + `patterns` en las tres zonas; eliminar los `rounded-[Npx]` custom. Mismo borde, mismo radio, mismo padding en setter, leados y leads.
2. **Una sola fuente de color de estado.** Extraer las ~8 funciones `*Tone()` duplicadas a un único mapa `leadosTone` (stage/result/service) y aplicar la regla "cyan = solo acción". Cambiar un color = un lugar.
3. **Tres primitivas que faltan / hay que unificar:** `Callout`/`FormAlert` (reemplaza 30+ cajitas inline amber/emerald/rose), input de formulario unificado (hoy `bg-black/20` vs `bg-white/5`), y `Modal` en glass (hoy hardcodeado `bg-zinc-950`, rompe el lenguaje). Reduce código y unifica el look.

---

## 8. Calidad floor (sin anunciarla, pero la cumplo)

- **Responsive hasta mobile** en todas las superficies; el self-check del setter en celular es prioridad explícita.
- **Foco de teclado visible** (hoy varios controles dependen solo del default del browser; varios `<input>` sin `id`/`label` asociado — lo corrijo donde toque estética).
- **`prefers-reduced-motion` respetado** en toda microinteracción nueva.
- **Aria-labels** en elementos icon-only; contraste AA.
- **Movimiento deliberado y poco** — una microinteracción que ayuda a entender el estado, no efectos por todos lados.

---

## 9. Lo que NO toco (y por qué)

- **Lógica/comportamiento:** server actions, gates, `transitionDossier`, `os-commercial.ts`, Cal.com, cron, idempotencia, aislamiento por `assignedToId`, flujo invertido, orden de activities. Si un cambio visual necesita un dato que la action no expone → lo pido como **propuesta**, no reescribo la action.
- **Schema / migraciones:** cero. `migrate status` debe seguir diciendo "sin cambios de schema".
- **Frozen files:** `HeroArtifact.tsx` (no se toca), `TransitionContext` (siempre `triggerTransition()`, nunca `router.push`), `PreloaderContext` (no romper el flujo de fases), `schema.prisma`.
- **Identidad de color del token:** no cambio hues/saturación ni renombro tokens de marca/servicio (es ADN).
- **RESERVADO PARA FRANCO (H2/H4/H6):** si el refresh roza el stepper (H4) mejoro su **estética actual**, pero la decisión *journey-aware* sigue siendo **propuesta**, no la implemento.
- **Sin librería de UI nueva.** El ADN es propio; mejoro `src/components/ui/*`, no meto component libs ni plugins exóticos.

---

## 10. SEGURO vs SENSIBLE (clasificación de commits)

- **SEGURO (presentación, solo archivos de LeadOS):** todo lo de `(protected)/setter/**`, `(protected)/admin/leados/**`, y las partes LeadOS de `(protected)/admin/leads/**` (panel de reunión, cross-links). Commits por superficie.
- **SENSIBLE (componente compartido — afecta pantallas fuera de LeadOS):** cualquier cambio a `src/components/ui/*` (Card, Button, Badge, **Modal**, Input, Select, Field, StatCard, Tabs, PageHeader, Section), a `src/lib/design-patterns.ts`/`motion-variants.ts`, o a las `.admin-*` de `globals.css`. **Estos los usan también dashboard/admin/marketing.** Van en **commit aparte, marcado**, con la advertencia de revisar esas otras pantallas. Estrategia: preferir **componer/extender** (variantes nuevas, primitivas nuevas como `Callout`) por sobre **mutar** el comportamiento default de un componente compartido, para minimizar el blast-radius.

---

## 11. Plan por superficie (qué cambia, anclado al diagnóstico)

1. **`/setter` home-hub** — próxima-acción a pill accionable; borde-acento por accionabilidad; lane sutil en "Para trabajar ahora"; rechazo más visible; quitar el gradiente "promo" del onboarding (que hoy se ve como CTA) y alinearlo al glass con acento izquierdo; separar stats "colas" vs "métrica de resultado".
2. **`/setter/leads/[id]` wizard** — 3 estados de card (activa/hecha/bloqueada); stepper con labels legibles; copy-block con zona-de-acción + flash de copiado; self-check duros vs blandos + mobile impecable; panel de materiales (NII-1) a tono neutro (hoy cyan = parece accionable y es referencia).
3. **`/admin/leados` cola + revisión** — filas que rankean (acento Caliente); un componente de panel unificado; `Modal` en glass; señal "listo para veredicto"; contador de caracteres en el modal de rechazo.
4. **`/admin/leads` reunión + cross-links** — panel de Reunión como héroe (emerald/cyan, arriba); cross-link a LeadOS descubrible; inputs/botones unificados con el resto.
5. **Kit UI + fundaciones (SENSIBLE)** — `Callout`/`FormAlert`, `Modal` glass, input unificado, mapa `leadosTone`, radios por token. Commit aparte + revisión de zonas externas.

---

## 12. Autocrítica contra defaults de IA (antes de presentar)

Revisé el plan buscando lo que haría "para cualquier panel". Lo que **descarté a propósito**:

- ❌ **Paleta nueva de moda** (cream+serif, negro+verde ácido, broadsheet de hairlines): NO. Mantengo el ADN cyan/zinc/glass.
- ❌ **Gradientes/glows/glassmorphism como decoración**: NO. De hecho **quito** el gradiente promo del onboarding y el cyan decorativo del panel de materiales. (Regla Chanel: saco un adorno que no sirve.)
- ❌ **Animación en todo**: NO. Una sola microinteracción deliberada (unlock de paso) + flash de copiado. Reduced-motion respetado.
- ❌ **"Dashboardificar"** al setter con charts/KPIs que no necesita: NO. El setter necesita "qué sigue", no analítica.
- ❌ **Renombrar acciones para que suenen lindas**: NO. El copy se aclara, no cambia de significado (gates, "publicar ≠ enviar", guardrail de rol intactos).

Lo que queda es estructural: **lo visual codifica algo verdadero** (urgencia, estado, qué sigue), unificado sobre la identidad que ya existe.

---

## 13. Disciplina de ejecución (Fase 2, tras tu OK)

- Depth-first: subo el **piso** de todas las superficies antes que el **techo** de una. Coherencia entre zonas = objetivo.
- **Build verde + `tsc` limpio** en cada tanda. Commits por superficie/tanda, mensajes claros, SEGURO vs SENSIBLE separados.
- **Changelog** en `docs/b9-changelog.md` por superficie (qué cambió y por qué, ref. a este plan) + **antes/después en capturas** (reinicio preview limpio para esto).
- Crítica con capturas mientras construyo: screenshot → miro → ajusto.
- Nada entra a `main` sin tu verificación visual.

---

## 14. Preguntas para Franco antes de ejecutar

1. ¿Rama `leados/b9-refresh-visual` (ya creada) o preferís `main`?
2. ¿OK con la **disciplina de color** (cyan = solo accionable; stages/info a azul/neutro; reunión a emerald)? Es el cambio conceptual más visible.
3. Las primitivas compartidas (`Modal` glass, input unificado, `Callout`) tocan **fuera de LeadOS**. ¿Avanzo con commit SENSIBLE marcado, o preferís que las contenga dentro de LeadOS (más duplicación, cero blast-radius)?
