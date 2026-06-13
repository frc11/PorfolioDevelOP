# B8A-II — Segunda auditoría de LeadOS (hallazgos NUEVOS)

**Sesión:** B8A-II — segundo perfeccionamiento · **Branch:** `leados/b8a-ii` (ramificada de `leados/b8a-hardening`) · **Fecha:** 13/jun/2026
**Método:** recorrido de uso real con sesión viva (setter + super-admin minteados vía `/api/qa/login` en `dev:qa` 3002), enfocado en lo que la sesión 1 quizá no exprimió: el tramo de construcción de la demo (Paso 4) y el self-check, los caminos menos transitados, la superficie de revisión de Franco, y los estados de borde. Lectura cruzada de `flow.ts`, `copy-blocks.ts`, contratos y los componentes del wizard. Cada hallazgo trae evidencia `archivo:línea` o el estado observado en runtime.

> **Advertencia honesta de arranque (confirmada al cierre):** la nafta fácil ya se quemó en la sesión 1. Esta pasada NO encontró una pila de mejoras. Encontró **una** mejora de impacto real, en el lugar exacto que el brief señaló (la calidad del entregable), **un** ajuste menor de coherencia, y la confirmación de que el resto del sistema está en su techo razonable pre-piloto — lo que queda son las decisiones reservadas a Franco (H2/H4/H6 de la sesión 1). Eso es lo que el recorrido arrojó; no se inventó trabajo para justificar la sesión.

---

## 0. Lo que se re-verificó sólido (no son hallazgos)

Recorrido en vivo, no lectura a ciegas:

- **Superficie de revisión de Franco (`/admin/leados/[leadId]`)** = una sola pantalla con la demo embebida (iframe + "abrir en pestaña nueva") y, a la derecha, Veredicto + Evaluación + Brief + Self-check + Ficha. Aprobar exige `finalUrl`; rechazar exige qué/dónde/arreglo (todos requeridos, con placeholders que modelan buen feedback) y salta al siguiente de la cola. Es, de verdad, una revisión de ~2 minutos. Los fixes de la sesión 1 (H5 cross-link, H7 aviso de self-check ausente) están presentes y funcionando en runtime.
- **Flujo invertido + idempotencia:** el opener nunca ofrece link; el envío del link sólo con APROBADA + finalUrl + (respondió o caliente); claims atómicos de envío y de booking intactos. Verificado en Gimnasio Atlas (camino preventivo caliente) y en el opener de leads fríos.
- **Aislamiento por `assignedToId`, puertas únicas (`transitionDossier` / `os-commercial.ts`), guards admin-only** — sin grietas nuevas.
- **Cadencia templada del seguimiento** (toques X/3, próximo toque, corte automático, plantillas por toque) y la **capa de canal Instagram** (tope informativo, nunca bloquea) — completas y coherentes.

Las **líneas rojas siguen firmes**. Ningún hallazgo de abajo las toca.

---

## 1. Hallazgo de impacto real (ejecutado)

### NII-1 — El Paso 4 construye la demo con MENOS materia prima que el opener *(SEGURO — ejecutado)*

**Qué:** En el paso donde se crea la calidad de la demo (Construcción), el bloque que el setter pega en Claude Design (`buildConstruccionBlock`) sólo llevaba el **brief** (concepto, secciones, CTA, notas de marca, pegado del Gem). NO llevaba la materia prima real que el propio shell pide usar: las **reseñas textuales** (prueba social), el **tono/contenido real** y **de dónde bajar el logo y las fotos**. Esos materiales viven en la ficha del Paso 1 y en el header del lead — a un scroll largo del paso de construcción, y fuera del bloque pegable.

**La asimetría que lo delata:** el **opener** (Paso 7) sí arma su bloque con la ficha COMPLETA, reseñas incluidas (`buildOpenerInputBlock` → `buildBriefInputBlock` → `buildFichaCopyBlock`). Verificado en runtime: el bloque del opener de Gimnasio Atlas incluye `RESEÑAS (copiadas tal cual)`. El de construcción, no. Es decir: el setter tenía más insumo para *escribir un DM* que para *construir la demo*.

**Evidencia:**
- `src/lib/leados/copy-blocks.ts:143-162` (versión previa): `buildConstruccionBlock(lead, brief)` — sin ficha, sin reseñas, sin links de assets.
- `src/lib/leados/flow.ts:147` (shell, fase Personalización): "Usá frases de las reseñas reales como prueba social (las tenés en la ficha)."
- `src/lib/leados/flow.ts:155` (shell, fase Assets reales): "Bajá el logo y 3–5 fotos del Instagram o Google Maps del negocio."
- `construccion-step.tsx` (versión previa): renderizaba shell + copy-block, pero NO los links del negocio ni las reseñas. Los links sólo en el header (`setter/leads/[leadId]/page.tsx:147-162`).
- Peor caso confirmado: el brief sembrado por QA (`b4-qa-construccion.ts`) no tiene `pegadoGem`, así que para ese lead el bloque de construcción no llevaba **ninguna** reseña.

**Por qué importa (vara de la promesa):** es exactamente "¿el setter no-técnico tiene de verdad lo que necesita para producir algo impecable, o se las arregla solo?". Antes: se las arreglaba (scroll + buscar la ficha + acordarse de copiar las reseñas). Resultado probable: demos más genéricas, que rebotan contra el HARD_CHECK `datosReales`/`fielAlBrief` o, peor, contra Franco. Saca fricción **sin** bajar calidad, y de hecho la sube.

**Qué se hizo:** ver `b8a-ii-changelog.md` → NII-1. Resumen: el bloque pegable ahora es auto-suficiente (suma reseñas + tono + links de assets), y el paso muestra un panel "Materiales reales del negocio" con los links clickeables (logo/fotos) y las reseñas/tono a mano. SEGURO: pura presentación de datos que ya existen; no toca gates, status ni invariantes.

---

## 2. Ajuste menor de coherencia (ejecutado)

### NII-2 — El Paso 10 afirmaba "Aceptó reunirse" en todo lead que respondió *(SEGURO, menor — ejecutado)*

**Qué:** El paso de agenda se abre con `status === 'RESPONDIO'` y mostraba el badge **"Aceptó reunirse"** como un hecho. Pero un lead RESPONDIO sólo respondió — no necesariamente aceptó una reunión. Verificado en runtime sobre Estética Bella Vista (RESPONDIO, sin reunión acordada): Paso 10 activo con badge "ACEPTÓ REUNIRSE".

**Evidencia:** `agenda-step.tsx:124` (gate `status !== 'RESPONDIO'`) y `:191-193` (badge "Aceptó reunirse").

**Por qué (vara):** "más difícil de usar mal". El badge afirmaba un estado que el sistema no verifica; para un no-técnico, podía empujar a ofrecer horarios antes de que el prospecto dijera que sí. Bajo impacto, pero el arreglo es de una palabra y elimina una micro-afirmación falsa.

**Qué se hizo:** badge → **"Listo para agendar"** (disponibilidad del paso, no un hecho). El guard real (checkbox "estoy hablando con quien decide" + criterio del setter) no cambia. SEGURO: copy.

---

## 3. Confirmaciones que refinan propuestas reservadas a Franco (NO ejecutadas)

El recorrido reforzó tres análisis de la sesión 1. **No se implementan** (son decisiones de Franco / tocan invariantes). Recomendaciones afinadas:

### H4 (refinada) — El stepper miente para leads en outreach/agenda
Confirmado en vivo: Estética Bella Vista está RESPONDIO con opener enviado y Paso 10 disponible, pero el `DossierStepper` marca **"3 BRIEF"** como paso actual (`pasoActual(EVALUADA)=2`). El stepper es de PRODUCCIÓN de la demo (Ficha→Revisión); no representa la conversación (Pasos 7/9/10). **Recomendación afinada:** la versión barata sigue siendo la correcta para pre-piloto — re-rotular el stepper como "Progreso de la demo" (un título/leyenda), dejando que el "próximo paso" lo gobiernen el home-hub y la tarjeta activa del wizard (que ya lo hacen bien). NO renumerar ni hacerlo journey-aware ahora. Es chico y de bajo riesgo, pero **toca un componente que Franco marcó como su decisión** → queda como propuesta, no ejecutada.

### H2 (sin cambios) — RE_SEGUIMIENTO deja al lead sin re-agendar
No reapareció evidencia nueva (no se forzó el camino admin post-reunión en esta pasada). El análisis y la recomendación de la sesión 1 siguen vigentes: convertir `agendaJson` en historial (array) en su propio bloque con migración aditiva, post-piloto. NO tocar acá.

### H6 (sin cambios) — Numeración en zigzag
Sigue mitigada por el diseño (tarjeta activa domina). Baja prioridad. La alternativa barata (cada tarjeta colapsada explica "qué desbloquea" en vez del número) sigue siendo la salida si alguna vez se aborda.

---

## 4. Lectura honesta de cierre

¿Qué tan cerca de la promesa? **Cerca, y más cerca tras NII-1.** El cuello real que quedaba en "el setter produce algo impecable con mínima fricción" era que la materia prima no estaba donde se construye; eso se cerró. El otro lado de la promesa ("Franco revisa en ~2 min") ya estaba resuelto y se re-confirmó en vivo.

¿Encontró esta segunda sesión mejoras reales de impacto, o el sistema ya estaba en su techo? **Mayormente lo segundo, con una excepción que valía la pena.** Honestamente: una mejora sustancial (NII-1), un ajuste menor (NII-2), y el resto es techo razonable pre-piloto. Lo que de verdad mueve la aguja de acá en adelante son decisiones de producto de Franco (H4 barato, H2 con migración) y, sobre todo, **el dato del piloto**: el shell de construcción y el self-check están marcados `PROVISORIO` a propósito — se afinan con las primeras demos reales, no a ciegas en una tercera pasada de auditoría. Forzar más cambios ahora sería pulir un rincón mientras se espera el insumo que de verdad los va a calibrar.

**El próximo paso de mayor valor no es código:** correr el piloto y dejar que las primeras demos reales digan qué fase del shell y qué check del self-check hay que endurecer. Después de eso, H4 (barato) y H2 (con su bloque) son las piezas con nombre y apellido.
