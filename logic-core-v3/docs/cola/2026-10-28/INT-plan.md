# INT · plan de la integración de la cola 3

Rama `cola3/2026-10-28` (L1–L4, `b2205e74`) + `cola3b/2026-10-28` (L6, L5, `6d9c38ad`), base común `e7fcd80d` (`rediseno/home`). Presupuesto ~3 h. Excepción de esta sesión: `git merge --no-ff cola3b/2026-10-28` dentro de `cola3/2026-10-28`. Nada en `rediseno/home`, `main`, `paginas/servicios`; nada de `--force`.

## 0 · La base para comparar
`C:\nocturno\cola3-fotos\base\` está vacía. La armo: worktree temporal desprendido en `e7fcd80d` (`cola3-fotos\base\arbol`), `node_modules` por junction al de cola3 (el `package.json` sólo difiere en scripts), su `.next` con un build (las suites de peso piden build: sin él fallan todas por «0 archivos», lección de la cola 2), y `npm run verificar` ahí → `base\verificar.log`. Al terminar: se borra el worktree (`git worktree remove`) y la copia del `.env.local`.

## 1 · El merge
- `git merge --no-ff cola3b/2026-10-28`. Previsto por `merge-tree`: un solo conflicto, `titulos3d/TituloDePagina.tsx` (L1 sacó el gancho de las grietas; L6 fijó título/composición/legibilidad). Se resuelve con las dos intenciones: sin grietas, título 1, composición 3, legibilidad peso, sin banderas.
- Hecho cuando: 0 marcadores (`verificar` paso 1b), `grep` sin `grietas` vivo en el código de la página, `tsc --noEmit` 0, las suites de los seis lotes verdes: L1 (s25, s62, s73, s76, s77, s78-c2-81, s87, s10-acceso, s3-tokens), L2 (s76-portfolio-*, s84-*), L3 (s81*, s6-servicios, s78-b12b, s78-c2-51, s6-lane), L4 (s6-tu-panel, s6-cta-del-panel, s45, s47, s48), L5 (s83-resenas*, s88-l5, s78-c2-71, s78-b10, s71-faq-telefono, s49, s50, s51, s70, s72, s38), L6 (s78-b12a, s78-preloader*, s79-ingreso*, s17-marca). Se corren dentro de `verificar` (paso 5) y antes, sueltas, las que tocan las dos ramas a la vez (s78-c2-81, s78-b12a, s83, s17-marca, s3-tokens).
- ESTADO: `ESTADO.md` (carril a) y `ESTADO-b.md` (carril b) no chocan; agrego la fila de L5/L6 en `ESTADO.md` apuntando al carril b.

## 2 · Alturas
L2 (Demos una pantalla, Portfolio del teléfono), L3 (entrada de Servicios), L4 (recomendador), L5 (FAQ antes del pie en el teléfono, bloque del FAQ) cambiaron alturas. Medir en el sitio (dev :3002) a 1440, 1366, 1280, 1024, 820, 768, 390, 360: el desvío de la escena (progreso esperado contra el real en el comienzo de cada sección) y `TRAMO_ESTIRADO`. Recalibrar sólo si el desvío sale de lo que s76 §48 admite. Teléfono: la velocidad de la escena de Demos a Servicios (k ≈ 0,2 de L2) en px de scroll por unidad de progreso; si hay un salto (discontinuidad) o un pico de velocidad visible, suavizarlo en la regla del tramo.
- Hecho cuando: una tabla de 8 anchos con el desvío por sección, ≤ el tope del invariante; la curva del teléfono sin escalón.

## 3 · Restos
- L3: a 320 el aro de Servicios roza «Deslizá…». Arreglo en la caja del aro del teléfono; medido con `l3-servicios MODO=medidas` agregando 320 (0 píxeles del aro sobre el aviso) y control.
- L4: el recomendador a 768 y 1024 (banco `recomendador.ts` a esos anchos) y el caso nuevo «Enter en el último campo» en el banco del salto (desvío ≤ 40 px) con su control `salto-al-enviar`.
- L6: los cinco bancos que barren banderas que ya no existen (`titulo-familias`, `titulo`, `composicion`, `titulo-3d`, `contraste-de-la-intro`): se borran los que sólo comparan variantes; el que mida algo que sigue valiendo se reescribe sin barrido. `compilar.ts:6` sin `?composicion=1`.
- s8-montaje: leer la falla; si la causa es de la cola 3, arreglarla; si es anterior (`e7fcd80d`), anotarla.

## 4 · Build y medición
Dev parado. `NODE_OPTIONS=--max-old-space-size=6144 npx next build --webpack` una vez, log a archivo; `next start -p 3002` en segundo plano. Medir contra el build: la pausa del primer paso de Servicios (L3, ~370 ms en dev), la velocidad de la píldora (`velo.ts`, tope 3,96 px/ms), el viaje sin destello (`viaje.ts`), el fundido del login a 390 (`ingreso-real`/`preloader`), fps y p95 de la escena en reposo. Las tres páginas de servicio en 404: esperado.

## 5 · verificar y matrices
`npm run verificar` completo sobre el árbol integrado (con su build), comparado afirmación por afirmación con `base\verificar.log`: 0 fallas nuevas. Matrices de escritorio (`matriz.ts`) y teléfono (`l2-telefono.ts MODO=recorrido`, `humo-l6`) contra el build.

## 6 · Fotos para Valentino
`C:\nocturno\cola3-fotos\INT\`: cada sección del home en reposo a 1440 y 390, y `/v3/pagina-base` a 1440 y 390.

## Cierre
Revisión independiente (Sonnet) del diff de la integración (merge + lo que agregue esta sesión), push simple, `INT-resultado.md` en castellano, `INT-TERMINADO`, server parado por su PID.

## Premortem
«La integración falló»: (a) el merge compila pero una suite que leía como texto un archivo tocado por las dos ramas (`ControlDelSonido.tsx`, `PisoVivo.tsx`, `s78-c2-81`) queda roja: se corre suelta antes de seguir. (b) La memoria: base build + build + dos `verificar` con 4,9 GB libres y otras sesiones vivas (un `next start` en :3010): todo pesado de a uno, lanzado desacoplado y esperado en primer plano; si el vigilante corta, por grupos (`s4-agregado.ts <grupo>`). (c) Un `distDir` o carpeta nueva no ignorada envenena Tailwind: el worktree base vive fuera del repo; las salidas de bancos van a `cola3-fotos`. (d) Medir con la pestaña oculta: cada banco con Chrome visible propio, verificando `visibilityState`. (e) El presupuesto: si a las 2 h 30 no terminó el paso 5, se cierra con lo medido y lo demás queda «no verificado».
