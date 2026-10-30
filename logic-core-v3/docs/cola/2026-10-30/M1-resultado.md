# M1 · resultado — PARCIAL (la sesión se cortó por el límite de uso)

Rama `m/1`. Todo lo construido está commiteado. **Nada se vio en el navegador**: el candado lo tuvieron L7g (10:05–12:34) y M3 (12:34–12:53); cuando M1 lo tomó (12:53) sólo alcanzó a correr `tsc` (0 errores) antes del corte. Lo soltó al cortar.

## Por ítem
- **0 · El ancho — no hecho.** El contenedor compartido (`Envoltorio`) ya es a sangre con tope de 1920 en el home y en las páginas: no es el contenedor. Falta mirar a 1440 y 2560 qué hace que las páginas se lean centradas (probable: columnas angostas y texto chico en el cuerpo). Banco listo: `BASE=http://localhost:3003 ANCHOS=1440x900,2560x1440 npx tsx scripts-carga/m1-anchos.ts` (fotos y cajas de cada sección contra el home). **M2 y M3: el contenedor no cambió.**
- **1 · La intro de día — construido, no verificado en el navegador.** De día (Nosotros, Portfolio y el blog, por `noche: 'dia'` del preset: el blog lo toma solo en el merge) la intro mide 3,4 pantallas: el tramo del título (1,4) y el giro del home hacia Quiénes somos (2 pantallas, pose 130° / −3,6 / 14, vuelta literal) con «de qué se trata» fijo del lado contrario al logo (marco del giro con su propio hueco; el encuadre pasa de un hueco al otro con el giro). Las de noche (servicios) siguen en 1,8, sin cambios. Archivos: `pistaDeLaIntro.ts`, `composicion.ts`, `composicionEnLaEscena.ts`, `ataduraAlScroll.ts` (una línea), `IntroDeLaPagina.tsx`, `ComposicionDeLaIntro.tsx`. Sin ver: si el título 3D caído molesta durante el giro y cómo queda el logo en 390.
- **2 · El equipo — construido, no verificado.** Prototipo 2 tal cual; abajo de 1024 la segunda toma se abre al cruzar la mitad y se cierra al volver (aprieta el botón del marco). Facultad: `public/v3/nosotros/facultad.webp` (500×298, desde `l7-assets`), a 500 px como mucho, que se abre desde una rendija, con «FACET · Universidad Nacional de Tucumán».
- **3 · La historia — construido, no verificado.** Cada párrafo sube desde abajo; sólo «calidad excepcional», «Esto no es un proyecto aislado» y «No tenemos límites» se pintan.
- **4 · Cómo trabajamos — construido, no verificado.** Prototipo 7: la línea que baja y subraya cada paso; los cinco pasos del prototipo.
- **5 · Los casos — construido, no verificado.** Papel, lados alternados (izq/der/izq), medio y texto clavados desde 1024, ritmo de la ficha; título propio + 3 párrafos (163/153/162 palabras, sólo hechos de `PROYECTOS` y del home) + rubro y fecha + «Visitar sitio». Reseña: ninguna es real, no se muestra.
- **6 · Las demos — construido, no verificado.** Texto corrido; estante sin cruces (el apilado no cambia nunca, las vecinas se abren antes de que la elegida suba y esperan a que la anterior baje); desde 1024 abre `VentanaDeDemo` (el Genie del home) en la página; abajo de 1024, pestaña nueva como el home.

## Verificación que sí corrió
- `npx tsc --noEmit`: 0 errores.
- `npx tsx src/app/v3/_lib/__tests__/s92-m1.invariant.tsx`: 43 afirmaciones, 0 fallas, con controles. La simulación cuadro a cuadro de las tapas cazó un cruce real (pasar directo de una tapa a la siguiente) que se arregló.
- **No corrió:** ESLint (la sesión se cortó), `s78-b12a`, `verificar`, el build, el navegador en ningún ancho, la revisión independiente. **390 no está verificado.**

## Decisiones tomadas solo
- **M1-1** La intro de día se decide por `noche === 'dia'` del preset (no por página): así el blog y sus notas la heredan sin tocar archivos de M2. La 404 (de día, sin scroll) no cambia porque la pista de día arranca en la misma composición.
- **M1-2** Los colores de marca de los tokens están medidos para la noche; sobre el papel fallaban AA (Esquina, blanco: invisible). En `portfolio/contenido.ts`: El Garage `#9A5400` (5,38:1), Banú `#654324` (su marrón del póster, 8,22:1), Esquina la tinta. Los tokens no se tocaron.
- **M1-3** Abajo de 1024 la demo abre en otra pestaña (la rama del teléfono del home); la ventana sólo desde 1024.
- **M1-4** `s92-m1` no se sumó a `package.json` para no chocar en el merge con M2/M3: propuesta, agregar `"test:s92-m1": "npx tsx src/app/v3/_lib/__tests__/s92-m1.invariant.tsx"`.

## Para la próxima sesión (en este orden)
1. Candado → dev :3003 → `m1-anchos.ts` a 1440 y 2560 → arreglar el ancho → `m1-banco.ts` a 1440 y 390 → el humo `BASE=http://localhost:3003 FOTOS=C:\nocturno\cola3-fotos\M1 ANCHOS=1440x900,1024x768,768x1024,390x844 npx tsx scripts-carga/l7-int-humo.ts`.
2. ESLint en los archivos tocados, `npm run test:s78-b12a`, s92-m1.
3. Revisión independiente sobre `git diff 3d89b628..m/1`, resultado final, push.
