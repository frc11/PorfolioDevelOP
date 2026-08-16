# PROBE-SERVICIOS — ¿Se puede conservar las 16 demos con otro marco?

## Cómo correr esta instrucción

- **Modelo:** Fable 5. **Esfuerzo:** `xhigh`. **Modo rápido: OFF.** Modo NO autónomo.
- Worktree `C:\rediseno-home`, branch `rediseno/home`. PowerShell (no `&&`, rutas con paréntesis entre comillas, `tsc` siempre solo).
- **Probe de decisión, no de ejecución.** Es corto: no releves de más.

## La pregunta que tenés que contestar

El home de develOP se rediseña. La sección de servicios pasa a **scroll horizontal** (estilo oddcommon.com), con **wash de color por servicio**, **menos texto** y **sin glassmorphism**. La identidad va de oscura a clara.

El dueño del proyecto invirtió mucho trabajo en las **16 simulaciones** de `OurServices.tsx` y preferiría conservarlas cambiándoles el marco. La auditoría B0b encontró tres cosas que ponen eso en duda:

- 9.898 líneas; **64 `backdrop-filter` inline**
- sims con **rAF + `setState` a 60fps**, definidas dentro del render e invocadas como funciones planas
- **dos fuentes de verdad** del "servicio activo"

**Tu trabajo: medir qué tan viable es conservarlas y costear tres opciones.** No decidís vos: entregás evidencia para que decida un humano.

## Reglas absolutas

1. **Solo lectura.** No modificás ni creás ningún archivo salvo el reporte. No corrés el dev server ni ejecutás la app.
2. **Git solo lectura** + el commit/push final del reporte. PROHIBIDO `reset`, `rebase`, `merge`, `push --force`, `checkout` que descarte cambios, y todo lo que toque `main` u otros worktrees.
3. Nada de base de datos, nada de `npm install`.
4. **No arreglás ni refactorizás nada.**
5. No afirmes comportamiento en runtime que no puedas sostener leyendo el código: marcalo `[REQUIERE VERIFICACIÓN HUMANA]`.

## Los 6 puntos

**1 · Anatomía.** Estructura de `src/components/sections/home/OurServices.tsx`: bloques principales y en qué líneas viven. Distinguí **marco** (layout de la sección, navegación entre servicios, títulos, copy, riel de progreso, wash de acento) de **contenido** (las 16 sims). ¿Cuántas líneas pesa cada parte, aproximadamente?

**2 · Acoplamiento del glass.** De los 64 `backdrop-filter`: ¿cuántos están en el marco y cuántos **dentro** de las sims? De los que están dentro: ¿son cosméticos (una clase que se cambia y listo) o participan de la composición visual de la simulación (capas, profundidad, legibilidad sobre fondo)? Esto define si "sacar el glass" es una pasada de estilos o una reescritura.

**3 · Separabilidad.** ¿Se pueden extraer las 16 sims a componentes propios y consumirlas desde un marco nuevo? Reportá los obstáculos concretos: closures sobre estado del padre, props implícitas, hooks imposibles por ser funciones planas, dependencia del `activeAccent`, dependencia del layout del contenedor. **Estimá cuántas de las 16 son extraíbles con poco esfuerzo, cuántas con esfuerzo medio, y cuántas requieren reescritura.**

**4 · Riesgo bajo scroll horizontal.** Hoy las sims se pausan por `IntersectionObserver` cuando salen del viewport (`useServiceDemoCycle`, la lógica de `activeAccent` en :8719-8729 y el riel de :8818). En un contenedor de scroll horizontal con transform, **¿ese observer sigue funcionando?** Analizá el riesgo concreto de que queden varias sims corriendo a la vez (rAF + setState a 60fps) y qué pasaría en un dispositivo móvil de gama media. Reportá qué habría que garantizar para que no ocurra.

**5 · El reemplazo huérfano.** El árbol tiene `src/components/sections/servicios/` (del rediseño abandonado, sin importadores). Reportá: qué contiene, qué resuelve, **qué muestra en lugar de las sims**, y si su marco serviría como base para el scroll horizontal nuevo. Sin adoptarlo: solo describir.

**6 · Tres opciones costeadas.** Cerrá con una tabla comparando:
- **A — Restyling in situ:** conservar las 16 sims y el marco actual, sacar el glass y aligerar el texto.
- **B — Marco nuevo, sims intactas:** extraer las 16 sims y montarlas en un scroll horizontal nuevo.
- **C — Reemplazo:** una demo nueva por servicio (4 en total), marco nuevo.

Por cada una: **esfuerzo relativo** (bajo/medio/alto, con la razón), **riesgo técnico principal**, **qué se pierde**, **qué se gana**, y **si permite el ritmo cromático buscado**. Sin recomendar una: la decisión es del humano. Terminá con la pregunta o el dato que más le convendría tener antes de decidir.

## Cierre

1. Reporte en `docs/rediseno/outputs/PROBE-SERVICIOS.md`. Verificá con `git status` que es el único cambio.

🛑 **PARADA:** mostrá la tabla del punto 6 y `git status`. Esperá el OK.

2. Con el OK: `git add docs/rediseno/outputs/PROBE-SERVICIOS.md` → `git commit -m "probe: viabilidad de conservar las 16 demos de servicios"` → `git push`.
