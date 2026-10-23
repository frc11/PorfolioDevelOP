# Reglas comunes · cola 2 (2026-10-23)

Rigen para el orquestador y para cada subagente. Cada archivo de tarea las da por leídas: el orquestador se las pasa **literal** a cada subagente junto con su tarea y `05-TEXTOS.md`.

## Antes de escribir
- Leé la skill `.claude/skills/pagina-home-based/` (SKILL.md, GUSTO.md, METODO.md) y `docs/rediseno/B12a-API.md`.
- **Leé el código existente antes de crear.** Las rutas de cada tarea son pistas, no verdades: buscá en el código dónde vive cada cosa. No dupliques lógica: si una pieza ya existe (un efecto, un loader, un gatillo), importala.
- **Las piezas compartidas de la cola 2** (las crea la tarea 20 y las usan las demás): `EstadoDeEnvio`, `AvisoDeScroll`, `Reluciente` y el arreglo del autocompletado. Si tu tarea las usa y todavía no existen en tu rama, esperá a que el orquestador te dé la rama con la tarea 20 integrada. No las reescribas.
- **Los textos** salen de `05-TEXTOS.md`, tal cual. No inventes textos de cara al usuario. Si falta uno, escribilo corto, en español rioplatense, y anotalo en el reporte.

## Reglas de Valentino que valen para todo
- **REGLA GENERAL:** todo lo que hoy parece "no terminado" (el panel de prueba, etc.) se supone terminado para el lanzamiento. No diseñes estados de "muy pronto".
- **Tablet (768–1023) hace lo mismo que el teléfono** en todo lo de esta cola, salvo que la tarea diga otra cosa.
- **Los efectos de los títulos NO se desactivan en mobile.** Solo se simplifican con `prefers-reduced-motion`.
- **El estándar de los formularios** (salvo el form del pie, que queda como está): el envío usa `EstadoDeEnvio`; el autocompletado del navegador no se ve feo (el mismo arreglo que tiene el pie); los errores van en el formato de siempre del sitio.
- **Las banderas** que dejes: documentadas en el reporte, con su valor por defecto.
- Nada se da por hecho porque compila: lo verifica el orquestador en el navegador y, la coreografía, Valentino.

## Reglas duras
- Nunca `git add .` (siempre por nombre). Nunca `merge`, `reset`, `rebase`, `push --force`, `stash`, ni `checkout`/`switch`/`restore` que descarte (el único que mergea es el orquestador, solo dentro de `nocturno/2026-10-23`).
- **Frozen, intactos:** `HeroArtifact.tsx`, `TransitionContext.tsx`, `PreloaderContext.tsx`, `schema.prisma`, `auth.ts`, `lib/prisma.ts`, `src/components/ui/*`.
- Cero `any`. Nunca `router.push` directo (navegación con `<Link>`). Nunca `prisma migrate reset`. Nunca secretos escritos en el código.
- **"Se cambia CÓMO se importa, nunca QUÉ renderiza"** en lo que comparte el sitio vivo. Las zonas de Franco, intactas. `src/modules/chatbot/**` es del sitio vivo: solo se usa por su prop `overrides`, nunca se cambia su estilo de fábrica.
- **Las APIs (`src/app/api/**`) no se tocan.** Las pruebas y el arnés **nunca** llaman a `/api/contacto`, `/api/newsletter` ni a ningún `/api/` real (la base Neon es compartida con Franco): se interceptan con `page.route`.
- No debilites pruebas. `lente.ts` queda fuera de los commits. Nada de `next build` salvo en la tarea 90.
- No toques `C:\paginas-servicios` ni el puerto 3001.

## El trabajo en el worktree
- Tu worktree está en `C:\nocturno\2026-10-23\<id>`, con `node_modules` enlazado (junction) al del principal. **No corras `npm install`.** Si necesitás una dependencia nueva, NO la instales: anotalo en el reporte y buscá otra forma.
- Trabajá solo en tu worktree y tu rama (`nocturno/2026-10-23-<id>`). Commiteá por nombre, en commits chicos con mensaje claro.
- **No levantes dev ni Chrome.** La verificación en el navegador la hace el orquestador.
- **El turno pesado:** `tsc` (con `NODE_OPTIONS=--max-old-space-size=4096`), ESLint de muchos archivos y las suites de tests se corren DE A UNO en toda la máquina:
  - tomarlo: `mkdir C:\nocturno\2026-10-23\.turno` (si falla, está tomado: esperá 20 s y reintentá);
  - adentro, un `dueno.txt` con quién lo tiene y desde cuándo;
  - al terminar, borrá la carpeta. Antes de tomarlo, ≥ 3 GB libres en C:.
- **Si el modo de permisos te niega un comando, NO lo reintentes igual:** tres negaciones seguidas frenan la corrida. Cambiá de camino en el acto o anotalo y seguí.

## Gate antes de entregar
1. Lint limpio en los archivos tocados.
2. `tsc --noEmit` sin errores nuevos (la base conocida no cuenta).
3. Tus pruebas, cada una con su control positivo (en rojo sin el arreglo, en verde con él).

## Reporte final del subagente
- Qué hiciste y qué no (con el porqué).
- Los archivos tocados (y los que tocaste fuera de lo esperado, con el porqué).
- Las banderas, con su valor por defecto.
- **Qué tiene que verificar el orquestador en el navegador:** URL, ancho, acción y qué debería verse, para 1440, 1024, 768 y 390.
