# B8A-II — Changelog de ejecución

**Branch:** `leados/b8a-ii` · **Base:** `leados/b8a-hardening` (sesión 1, sin reescribir) · **Fecha:** 13/jun/2026

Cambios agrupados por **clase de riesgo**:
- **SEGURO** — UI / copy / presentación de datos existentes. Mergeable de una pasada.
- **SENSIBLE** — auth, ownership, puertas, maquinaria comercial, Cal.com, migraciones. *(Esta sesión no produjo ninguno.)*

Cada cambio referencia su hallazgo en [`b8a-ii-auditoria.md`](./b8a-ii-auditoria.md).
Verificación transversal: `npx tsc --noEmit` → exit 0; recorrido de runtime en `dev:qa` (3002) con sesión setter minteada para los cambios observables; `npm run build` → ver pie.

---

## SEGURO

### S1 — NII-1: la construcción de la demo recibe la materia prima real, en el paso donde se construye
**Archivos:**
- `src/lib/leados/copy-blocks.ts` (`buildConstruccionBlock`: nueva firma `(lead, brief, ficha)`).
- `src/app/(protected)/setter/leads/[leadId]/_components/construccion-step.tsx` (nuevo sub-componente `MaterialesNegocio` + prop `ficha`).
- `src/app/(protected)/setter/leads/[leadId]/_components/lead-wizard.tsx` (pasa `ficha` a `ConstruccionStep`).

**Qué:**
1. **Bloque pegable auto-suficiente.** `buildConstruccionBlock` ahora suma, después del brief: `RESEÑAS REALES (usalas textuales como prueba social)`, `CONTENIDO Y TONO REAL (logo / fotos / estilo)` y `DE DÓNDE BAJAR EL LOGO Y LAS FOTOS REALES` (Instagram / Google Maps / Web actual). Todo guardado contra `ficha = null` y contra campos vacíos (reusa el helper `seccion`).
2. **Panel "Materiales reales del negocio"** en el Paso 4 (stage CONSTRUCCION): links clickeables al origen de los assets (para bajar logo + fotos, que no se pueden pegar como texto) + las reseñas y el tono a la vista. Aparece sólo si hay algo que mostrar; estética alineada al kit (card cian tenue, pills de link como el header, Lucide `strokeWidth={1.5}`).

**Por qué:** el shell de construcción pide usar reseñas reales y assets del negocio, pero esos materiales vivían lejos del paso y no viajaban en el bloque que se pega en Claude Design — mientras que el OPENER sí armaba su input con la ficha completa. Se cerró la asimetría: el setter tiene, en un solo lugar y en el bloque pegable, todo lo necesario para que la demo no salga genérica. (Detalle y evidencia en `b8a-ii-auditoria.md` → NII-1.)

**Riesgo:** nulo. Sólo presenta datos que ya existían (ficha + links del lead); no toca `transitionDossier`, status, gates ni el self-check. Prop `ficha` aditiva. `tsc` limpio.

**Verificado en runtime:** lead descartable forzado a CONSTRUCCION vía `transitionDossier` (creado y borrado en la verificación, cero fixtures tocadas). El panel renderiza links + reseñas + tono; el bloque pegable incluye `RESEÑAS REALES` y `DE DÓNDE BAJAR…`. Sin errores de consola. Captura tomada.

### S2 — NII-2: el Paso 10 ya no afirma "Aceptó reunirse" en todo lead que respondió
**Archivos:** `src/app/(protected)/setter/leads/[leadId]/_components/agenda-step.tsx` (badge del estado activo).
**Qué:** el badge del Paso 10 activo pasó de **"Aceptó reunirse"** (afirmación de un hecho no verificado) a **"Listo para agendar"** (disponibilidad del paso). El gate (`status === 'RESPONDIO'`) y el guard del decisor no cambian.
**Por qué:** el paso se abre con RESPONDIO, no con un "aceptó" confirmado; la etiqueta vieja podía empujar a agendar antes de tiempo. Menor, pero hace la herramienta un poco más difícil de leer mal.
**Riesgo:** nulo. Copy de un badge. `tsc` limpio.
**Verificado en runtime:** sobre un lead RESPONDIO sin reunión acordada, el badge ahora lee "Listo para agendar".

---

## SENSIBLE

Ninguno. Esta sesión no tocó auth, ownership, puertas, la maquinaria de booking/comercial, Cal.com ni migraciones. Nada que requiera revisión con lupa.

---

## Propuestas NO ejecutadas (decisiones de Franco / invariantes)

Las tres reservadas de la sesión 1 siguen reservadas. Refinamientos en `b8a-ii-auditoria.md` → sección 3:
- **H4** — re-rotular el stepper a "Progreso de la demo" (versión barata recomendada). Toca un componente que Franco marcó como su decisión → no ejecutado.
- **H2** — RE_SEGUIMIENTO / re-agendar: `agendaJson` como historial, bloque propio con migración aditiva, post-piloto.
- **H6** — numeración en zigzag: baja prioridad; alternativa de copy ("qué desbloquea cada tarjeta") si alguna vez se aborda.

---

## Estado al cierre
- `npx tsc --noEmit` → **exit 0**.
- `npm run build` → ver reporte final.
- Migraciones: **sin cambios** (ningún fix tocó `schema.prisma`).
- Líneas rojas: **ninguna degradada**. Ambos cambios son presentación/copy sobre datos existentes.
