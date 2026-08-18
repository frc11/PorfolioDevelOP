# S1-cont — Continuación del Cimiento (tras corte por cuota)

## Cómo correr esta instrucción

- **Modelo:** Sonnet 5. **Esfuerzo:** `xhigh`. **Modo rápido: OFF.** Modo NO autónomo.
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- PowerShell: no encadenar con `&&`; rutas con paréntesis entre comillas; `tsc` siempre solo.
- La skill `impeccable` está instalada. Usala en **modo brand**, subordinada a este documento.

## Estado: qué pasó y qué falta

La sesión anterior corrió `S1-cimiento.md`, entregó el análisis de la Parada 1, recibió las tres aprobaciones, y **murió por límite de gasto antes de escribir una sola línea de código**. El working tree está intacto: no hay nada a medias, no hay nada que deshacer. Verificalo con `git status` antes de empezar.

**Este documento reemplaza al Bloque 1 de `S1-cimiento.md`.** Los bloques 2, 3 y 4 de aquel documento siguen vigentes tal cual están escritos: leelos.

## Lecturas obligatorias

1. `docs/rediseno/sprints/S1-cimiento.md` — el sprint completo. **Su marco manda**, con una corrección: es un sprint de **escritura de código**, no de solo lectura. Escribís `globals.css`, `layout.tsx`, `SectionShell.tsx` y `page.tsx`.
2. `docs/rediseno/outputs/B0b-DELTA-MAIN.md` — auditoría de estado real.

## Decisiones ya tomadas y aprobadas — no se rediscuten

1. **Extender el sistema `ds-*` en su lugar, reasignando valores.** Sin prefijo nuevo. La advertencia del B0b sobre `ui/Button.tsx` quedó acotada por evidencia: ningún consumidor del portal renderiza variantes `ds-*` (`grep 'variant="ds-|size="ds'` → cero hits); las claves las selecciona solo `CtaButton`, que vive dentro de la isla. El portal depende de que `Button.tsx` compile, no de los valores.
2. **Chivo global: reemplaza a Geist en el layout raíz.** Alcanza al sitio público, a las 5 landings y al portal. Aceptado.
3. **Matar el rol `automation` ahora**, incluido sacarlo de la unión `ServiceAccent` en `design-system/accent.ts`, y arreglar el fallout en los ~5 archivos consumidores (`sections/servicios/data.ts`, `ServiceRow.tsx`, `ComponentStates.tsx`, `AccentPermutations.tsx`). `AccentPermutations.tsx` existía solo para comparar las dos permutaciones del ámbar: si su razón de ser desaparece, se puede eliminar su contenido o el archivo — decidilo y reportalo.

## Valores derivados — ya calculados, no los recalcules

Estos son los tokens que faltaban en la tabla original. Contrastes verificados por cálculo WCAG:

| Token | Tema claro | Ratio vs fondo | Tema oscuro | Ratio vs fondo |
|---|---|---|---|---|
| `fg-muted` | `#616161` | 5.77 sobre papel | `#A5A5A4` | 7.83 sobre oscuro |
| `rule` | `#D7D7D5` | 1.34 (decorativo) | `#333333` | 1.53 (decorativo) |

`fg-muted` supera AA con margen en ambos temas. `rule` es divisoria decorativa: no le aplica el mínimo de texto.

**`--shadow-ds-control`:** conservá la geometría de dos capas y re-derivá las opacidades para tinta sólida `#111111` sobre papel `#F7F7F5`. Es la única pieza de la capa semántica que queda a tu criterio; reportá los valores que elijas.

**Colisión de nombre a documentar:** `--color-ds-ink` existe hoy valiendo `#EDE9E1` (el fg del tema oscuro viejo). Se reusa el nombre con significado nuevo (`#111111`). Dejá un comentario en `globals.css` advirtiéndolo, para que nadie lea la documentación vieja y asuma el valor viejo.

## Escala tipográfica

Conservá los nombres y la arquitectura de `clamp()` existentes (`display-xl`, `display-lg`, `subhead`, `lead`, `body`, `eyebrow`, `data`, `control`) con su recalibración de piso móvil documentada. No re-elijas números desde cero.

Lo que sí cambia:
- Re-verificá el `letter-spacing` de los display: Chivo tiene x-height mayor y tracking más cerrado que Geist.
- **El peso tiene que ser un eje real de los tokens.** Hoy solo `--text-ds-data--font-weight: 500` existe. Como la jerarquía es por peso y no por familia, cada token de la escala necesita su peso definido.

## Fuentes

Chivo y Chivo_Mono son variables (eje `wght` 100–900, subset latin) — verificado contra `font-data.json` del worktree. **Sin array de `weight`**: una sola cara por familia con el rango completo. `Instrument_Serif` no se carga en este sprint.

Apuntá `--font-sans` y `--font-mono` (`globals.css:5-6`) a las variables nuevas y sacá Geist si queda sin uso.

## Trabajo por tandas (la sesión anterior murió por cuota)

Cerrá y guardá tanda por tanda. Si la sesión muere, lo hecho se conserva.

- **Tanda A** — `globals.css`: capa literal, capa semántica, escala con pesos. Al terminar: reportá en 3 líneas y seguí.
- **Tanda B** — `layout.tsx` (fuentes) + muerte de `automation` en `accent.ts` y sus consumidores. Corré `tsc` acá: es donde aparece el fallout de tipos. Reportá en 3 líneas y seguí.
- **Tanda C** — `SectionShell.tsx` (Bloque 2 de `S1-cimiento.md`, con su Parada). 🛑
- **Tanda D** — `page.tsx` (Bloque 3) + verificación y cierre (Bloque 4). 🛑

Eficiencia: no leas archivos completos si un grep con contexto alcanza; no expliques lo que vas a hacer antes de hacerlo; sin resúmenes intermedios más allá de las 3 líneas por tanda.

## Reglas absolutas

1. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`. `src/components/ui/*` se consume, no se edita (excepción explícita: `accent.ts` y los consumidores del punto 3, ya aprobados).
2. **No tocar `OurServices.tsx`.**
3. **No borrar archivos** salvo la excepción de `AccentPermutations.tsx`, si lo justificás.
4. **Cero `any`.** TypeScript strict.
5. **No sumar dependencias.** `motion/react` (nunca `framer-motion` directo), Tailwind 4, Next 16.
6. **Nada de base de datos.**
7. **Git:** podés commitear y pushear en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`** — staging archivo por archivo.
8. **No auto-confirmás que funciona porque compila.** La verificación visual la hace el humano.
9. **DOS PARADAS de criterio:** cambios de permisos/autorización, o decisiones de lógica de negocio, contratos de datos o máquinas de estado → frenás y reportás. Lo cosmético y de UX lo resolvés vos.

## Cierre

Vale el Bloque 4 de `S1-cimiento.md`: `tsc --noEmit` EXIT 0, lint limpio en lo tocado, reporte en `docs/rediseno/outputs/S1-CIMIENTO.md`, `git status` limpio, y la parada final antes del commit.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S1-cont.md.
Leela ENTERA antes de empezar, junto con S1-cimiento.md que ella referencia,
y tratalas como si te las hubiera escrito directamente.

Marco no negociable:
- Es un sprint de ESCRITURA de código. Escribís los archivos que indica.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any.
- No tocás archivos frozen ni OurServices.tsx.
- Las paradas 🛑 son bloqueantes: frenás y esperás mi confirmación.
- No auto-confirmás que algo funciona porque compila.

Arrancá con la Tanda A. No me confirmes el entendimiento.
```
