# Auditoría perceptual — Recorrido completo del setter novato (lead asignado → reunión agendada)

> **Tipo:** recorrido perceptual READ-ONLY con screenshots reales (Playwright/Chromium sobre build de producción). No es un test de CI ni un diagnóstico estructural de código — es la mirada de un setter sin experiencia técnica, operando la app tal cual la ve.
> **Fecha:** 2026-07-01 · **Alcance:** el camino central completo `/setter` → `/setter/leads/[id]` desde lead recién asignado hasta reunión agendada, las 9 secciones del wizard (Ficha, Evaluación, Opener, Seguimiento, Agenda, Brief, Construcción, Draft, Self-check).
> **Evidencia:** `docs/proof-screenshots/corrida-2-lead-asignado-a-agendado/` — 32 capturas numeradas en el orden del recorrido (incluye 3 spot-checks mobile).
> **Método:** script de captura propio (`tests/qa-walkthrough/corrida-1.spec.ts` + `playwright.qa-walkthrough.config.ts`), NO parte de la suite de CI — reusa `mintSessionCookie`/helpers ya existentes de `tests/setter/`. Un setter aislado recién creado (no `setter-qa`, que ya carga 13 leads del seed V-1 — hubiera contaminado la elección del "foco") con un único lead asignado, exactamente como sería el primer día real de alguien nuevo. Cada acción real del setter se hizo por la UI real; ver **Límites metodológicos** abajo por las 2 excepciones deliberadas (Cal.com y el lado admin).
> **Qué NO es:** no es juicio sobre el código ni propone fixes. Es el mapa de dónde un novato real dudaría, se trabaría, o necesitaría preguntarle a alguien.

---

## Veredicto en una línea

**Sí, un setter no-técnico llega solo de punta a punta — con una excepción real que lo trabaría de verdad:** las herramientas externas que el propio wizard le pide usar ("el Evaluador", "Gem de diseño", "Claude Design", "Gem de outreach") no tienen todavía un link real (badge ámbar "Link pendiente"). Sin ese link, un novato sin contexto previo no tiene forma de saber *dónde* está "el Evaluador" del que habla la pantalla. Esa es la única fricción que **bloquea del todo**; todo lo demás que se encontró es de severidad baja-media y no impide avanzar.

El **flujo invertido (§3) se cumplió sin excepción**: en ningún estado intermedio del recorrido se vio el link final de la demo ni un botón para enviarlo — apareció recién cuando se cumplieron **ambas** condiciones (Franco aprobó **y** el negocio respondió), con el texto exacto *"el link sale acá y solo acá — nunca en el opener, antes de que Franco lo apruebe"* (captura `26-listo-para-enviar-link.png`).

La **Construcción explotada (§8, el "corazón")** cumple genuinamente el criterio "una cosa a la vez": de las 6 fases, solo la actual muestra sus 3 sub-pasos; el resto queda como título + una línea, visualmente atenuado. Confirmado en desktop y en mobile.

---

## El camino, paso a paso

| # | Paso del recorrido | Screenshot(s) | Qué vio el setter |
|---|---|---|---|
| 1 | Entra al Panel | `01-home-foco-desktop.png`, `01m-home-foco-mobile.png` | Panel de onboarding "Cómo funciona tu día" + debajo "Tu foco ahora" con el único lead asignado y el botón "Ir a trabajarlo" |
| 2 | Abre el lead | `02-detalle-lead-inicial.png` | (cayó en el esqueleto de carga — ver Límites) |
| 3 | Ficha | `03-ficha-nudge-campo-flojo.png`, `04-ficha-senal-completa.png`, `05-ficha-guardada.png` | Formulario con placeholders-ejemplo y preguntas-guía bajo cada campo; nudge de calidad en vivo; banner de "señal mínima lista" |
| 4 | Evaluación | `06-evaluacion-completada-preenvio.png`, `07-evaluacion-registrada.png` | "Qué mira el Evaluador y por qué" explicado en criollo; score 1-5 con su significado al lado |
| 4b | Opener — gate del link | `08-opener-gate-link-bloqueado.png`, `09-opener-registrado.png` | Poner un link bloquea el botón; texto fijo explica por qué el link nunca va en el opener |
| 4c | El negocio responde (evento externo simulado) | `10-lead-respondio-brief-abierto.png` | El gate del brief se abre solo al refrescar |
| 5 | Brief | `11-brief-guardado.png` | Campos con ejemplos concretos de qué pegar del "Gem de diseño" |
| 6 | Construcción (el corazón) | `12` a `18`, `12m` mobile | Checklist de 6 fases, una resaltada a la vez con sus 3 sub-pasos; el resto atenuado |
| 6b | Draft | `19-draft-guardado.png` | Guía paso a paso de Netlify Drop + confirmación de carga antes de guardar |
| 7 | Self-check | `20` a `22`, `21m` mobile | Gate de 6 obligatorios con arreglo concreto al lado de cada uno en rojo; uno de ellos trae directamente el prompt de Claude Design para corregirlo |
| 8 | Demo aprobada (transición de datos, ver Límites) | `25-demo-aprobada-notificacion-setter.png` | Novedad "Franco aprobó tu demo" en el home |
| 9 | Envío del link — el momento del flujo invertido | `26-listo-para-enviar-link.png`, `27-demo-enviada-registrada.png` | Mensaje con el link ya armado para copiar; texto explícito de que este es el único momento correcto |
| 10 | Agenda | `28-agendar-reunion-decisor.png`, `29-reunion-agendada-final.png` | Checkbox de "hablás con el decisor" antes de ofrecer horarios; resumen final con el traspaso a Franco |
| 11 | Cierre | `30-home-final.png` | "No hay nada para trabajar ahora mismo" + resumen de la semana (1 contacto · 1 demo enviada · 1 reunión agendada) |

---

## Marcas de fricción

### 1. 🔴 CRÍTICO — "Link pendiente" en 4 de 5 herramientas externas
- **Screenshots:** visible de forma consistente en `06`, `07`, `08`, `09`, `10`, `11` y en el rail izquierdo de **todas** las capturas (`Evaluador`, `Gem de diseño`, `Claude Design`, `Gem de outreach` — todos con badge ámbar "PENDIENTE"/"Link pendiente"; solo `Netlify Drop` tiene un link real).
- **Dónde:** rail "Tus herramientas" + la caja de herramienta inline dentro de cada paso del wizard (Evaluación, Opener, Brief, Construcción).
- **Qué esperaba:** que "el Evaluador", "Gem de diseño", "Claude Design" y "Gem de outreach" fueran links reales — la pantalla los nombra como si existieran ("pegalo en el Evaluador", "abrí Claude Design").
- **Qué faltó:** la URL real de cada herramienta (configuración pendiente de Franco).
- **Tipo:** DIRECCIÓN.
- **Severidad:** te traba del todo — sin ese link, un novato 100% sin contexto no tiene forma de saber a dónde ir. No es un problema de copy: es la única pieza de este recorrido donde "afuera" (una URL que no está en la app) es estrictamente necesaria para avanzar.

### 2. 🟠 ALTO — El onboarding empuja el CTA real fuera de la vista inicial
- **Screenshot:** `01-home-foco-desktop.png`.
- **Dónde:** home del setter, primera carga.
- **Qué esperaba:** ver el lead asignado y el botón de acción apenas entra.
- **Qué faltó:** nada que adivinar, pero en un viewport típico (~900px) el panel "Cómo funciona tu día" ocupa toda la pantalla inicial — el encabezado "Tu foco ahora" queda justo al borde inferior y el botón "Ir a trabajarlo" quedaría recién al hacer scroll.
- **Tipo:** VISUAL / DIRECCIÓN.
- **Severidad:** te hace dudar (no bloquea — el panel es descartable y no hay nada más arriba compitiendo — pero el primer vistazo no confirma "tenés algo para hacer ahora" sin bajar).

### 3. 🟡 MEDIO — Acumulación de secciones ya completadas/bloqueadas por encima del paso activo
- **Screenshots:** comparar `04` (recién arrancando, ya con 8 tarjetas futuras debajo) contra `18`/`20` (Construcción/Self-check, con Ficha+Evaluación+Opener+Seguimiento+Agenda+Brief ya apiladas arriba, todas colapsadas a resumen).
- **Dónde:** toda la página del wizard — es la MISMA página de principio a fin (nunca colapsa a un acordeón), por diseño (§8, confirmado positivo abajo).
- **Qué esperaba:** llegar al paso activo sin demasiado scroll.
- **Qué faltó:** nada roto — cada tarjeta pasada está bien atenuada y resumida en una línea — pero el volumen acumulado es real: para llegar a Construcción hay que pasar 6 secciones ya resueltas.
- **Tipo:** VISUAL.
- **Severidad:** cosmético — no traba, pero es la clase de fricción que la auditoría estructural previa (`auditoria-ux-setter.md`) ya había marcado por conteo de líneas ("Construcción 22 líneas, Ficha 18, Self-check 16, Opener 14" = sobrecargadas); esta corrida lo confirma en vivo, con capturas.

### 4. 🟢 BAJO — Badge "LISTO PARA AGENDAR" aparece antes de que el negocio acepte la reunión
- **Screenshot:** `11-brief-guardado.png` (sección "Agendar la reunión", visible ya con status RESPONDIO, no con un "sí" explícito del negocio).
- **Dónde:** encabezado de la sección Agenda.
- **Qué esperaba:** que el badge implicara "el negocio ya aceptó reunirse".
- **Qué faltó:** nada — el texto inmediato debajo aclara bien ("Cuando la charla llegue a «sí, reunámonos»...") — pero el badge leído aislado, por una fracción de segundo, podría sugerir que ya toca agendar.
- **Tipo:** VISUAL.
- **Severidad:** cosmético — el texto de la misma tarjeta lo corrige de inmediato.

### 5. 🟢 BAJO / no-hallazgo del producto — Nombres del arnés de QA visibles en las capturas
- **Screenshots:** todas — el nombre del negocio aparece como `SMOKE-SETTER Pizzería Doña Clara 1782916...` y el topbar muestra `smoke-setter-novato-corrida1-...@develop.test`.
- **Aclaración:** esto es artefacto de **mi** arnés de test (namespacing + timestamp de los helpers `createSetter`/`createLead`), no algo que un setter real vería. Un negocio real y un setter real no llevan ese prefijo.

---

## Confirmaciones positivas (no fricción — vale documentarlas igual)

- **§3 (flujo invertido) — cumplido sin excepción.** El link final nunca apareció antes de que se cumplieran ambas condiciones. En cada estado intermedio la sección de Seguimiento mostró una tarjeta de espera con el motivo exacto ("El link se envía cuando Franco apruebe la demo...", más adelante "...nunca en el opener, antes de que Franco lo apruebe."), y recién en `26-listo-para-enviar-link.png` aparece el mensaje con el link + el botón de envío.
- **§4 (gates auto-explicados) — cumplido en los 9 pasos.** Desde la primerísima captura (`04`), cada paso bloqueado explica en criollo cuándo se abre y por qué — nunca un candado mudo.
- **§8 (la estructura guía, no tapa) — cumplido en Construcción.** El checklist de 6 fases resalta solo la actual con sus 3 sub-pasos; el resto queda atenuado. Confirmado en desktop y mobile (`12`, `12m`, `13`-`18`).
- **Opener — el gate del link se comporta correctamente** (verificado también por aserción automática): pegar un link deshabilita el botón; un opener válido lo habilita.
- **Cierre satisfactorio.** La pantalla final (`30-home-final.png`) resume la semana ("1 contacto · 1 demo enviada · 1 reunión agendada") y dice explícitamente "no hay nada para trabajar ahora" — el setter sabe que terminó.

---

## Los 3 peores momentos de confusión

1. **Los "Link pendiente" en las herramientas externas** (`06`–`11` y el rail en todas) — el único bloqueo real de todo el recorrido.
2. **El CTA de "Tu foco ahora" empujado fuera de la vista inicial** por el panel de onboarding (`01`).
3. **El peso acumulado de secciones ya resueltas** por encima del paso activo al llegar a Construcción/Self-check (`18`, `20`).

---

## Límites metodológicos de esta corrida (no son hallazgos del producto)

- **No se ejecutó la reserva real de horario vía Cal.com** ("Buscar horarios libres de Franco") — pega contra un sistema externo real y podría tocar el calendario real de Franco. Para llegar al estado final "Reunión agendada" (`29`) se sembró el mismo dato que ya usa el smoke test existente (B11 en `01-flow.spec.ts`), no se inventó nada nuevo.
- **La aprobación del admin se hizo como transición de datos directa, no manejando `/admin/leados` con un segundo actor.** Se intentó primero manejar el admin real (login → Aprobar → volver a mintear la sesión del setter en el mismo browser) y el swap de actor disparó `ERR_CONNECTION_REFUSED` sostenido en Chromium — confirmado que el server seguía respondiendo 200 a `curl` en paralelo durante el mismo lapso, así que es un problema del lado del contexto de Chromium al alternar sesiones sobre la misma página, no un bug de producto. No se profundizó más porque el lado admin explícitamente no es lo que esta corrida evalúa.
- **`02-detalle-lead-inicial.png` cayó en el esqueleto de carga**, no en el contenido asentado — la espera de red de mi script no cubrió la hidratación completa. El contenido real de esa pantalla se ve en `03`/`04` (mismo layout, ya cargado). Vale la pena que alguien mida en un ambiente real cuánto tarda esa carga inicial.
- **El spot-check mobile de Self-check (`21m`) no llega a mostrar la lista de obligatorios** — la página en mobile es más larga en píxeles que en desktop (todo se apila en una columna) y ni un viewport de 5000px de alto alcanzó a cubrirla. El spot-check de Construcción (`12m`) sí llega y confirma el mismo patrón "una fase a la vez" en mobile.
- **Colisión de carpetas:** otra sesión de Claude Code corrió en paralelo la misma clase de auditoría sobre este mismo repo, escribiendo en `docs/proof-screenshots/corrida-1/` (con una variante que incluye rechazo/retrabajo del admin). No se tocó ni se borró nada de esa carpeta — esta corrida quedó en `corrida-2-lead-asignado-a-agendado/`, seteando el nombre de puerto/carpeta de forma que no colisionan.

---

*Script de captura: `tests/qa-walkthrough/corrida-1.spec.ts` + `playwright.qa-walkthrough.config.ts` (no forma parte de `npm run test:setter` — es un script de un solo uso). Corré con: `SETTER_EXTERNAL_SERVER=1 npx playwright test --config=playwright.qa-walkthrough.config.ts` contra un `next start` de producción.*
