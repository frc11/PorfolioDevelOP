# SPRINT B11 (nocturno 2026-10-22) · El chatbot en /v3

Tarea: `docs/cola/2026-10-22/63-B11-chatbot.md`. Decisión de Valentino (CIERRE-HOME-V3): el chatbot abajo a la derecha, en su posición
anterior, sin 3D por ahora; convive con el FAQ (chico y alejado).

## Plan

**Lo que había.** /v3 nunca tuvo el chat: `git log -S` sobre `src/app/v3` no encuentra `LogicCompanion` ni `ChatWidgetMount`. El sitio
vivo lo monta desde el layout raíz (`components/layout/ChatWidgetMount.tsx`: `LogicCompanion` con el slug `develop`, perezoso), y ese
montaje se apaga en /v3 porque `/v3` está en `CHROME_FREE_PREFIXES` (`publicRoute.ts`). Su lugar de siempre: fijo, a 24 px del borde de
abajo y del de la derecha (o la zona segura), 56 px con un avatar liviano. En /v3, [CIERRE A] A6 sacó el infinito del recorrido de esa
esquina y la dejó libre «para el chatbot» (commit 62d29c85). `DynamicDock.tsx` ya no existe (lo dice `B0-AUDITORIA.md` §10).

**El 3D.** El avatar sale de la config del bot en la base (`avatarStyle`, por defecto `neuro`: el orbe 3D, R3F). Para «sin 3D» hay que
fijarlo desde /v3. No hay cómo sin tocar el widget (la config llega de la API; inyectarla en la caché o mutarla ensucia al sitio vivo;
copiar el widget duplica 300 líneas). Se suma UNA prop opcional a `LogicCompanion` (`overrides`: el avatar y la esquina, sobre la config,
para el botón y la ventana). Sin ella (el sitio vivo y los embeds) la config es el mismo objeto de siempre.

**Archivos.**
- nuevos: `src/app/v3/_chrome/chat/compuerta.ts` (las reglas, puras), `ChatDelSitio.tsx` (el cableado), `s87-cajas.ts` (el modelo de las
  cajas con los tokens) y `s87-chat.invariant.tsx` (la prueba);
- tocados: `_chrome/ChromeDelHome.tsx` (el montaje, una línea), `src/modules/chatbot/components/LogicCompanion.tsx` (la prop),
  `package.json` (s87), `scripts-carga/chrome-en-los-anchos.ts` (el chat como pieza, con la config simulada).

**Criterios.**
1. Diferido: el módulo del widget no viaja en la carga de /v3 (`lazy`); se pide después de la escena (preparada o caída), sin el velo
   de carga y sin el preloader, en un momento ocioso. En el servidor no emite nada.
2. Sin 3D: los avatares de /v3 son los livianos del registro (SVG). Ningún canvas en el chat.
3. El lugar: abajo a la derecha; no pisa el parlante (y su cartel), el menú, la píldora (arriba y al pie), Contacto y Login, en 360, 390,
   768, 1024, 1440 y 1920 (modelo con los tokens; y en el navegador, el banco).
4. El apilado: encima de la página y del velo de la navegación; debajo del login (B7), el contacto, el menú del teléfono, una demo, el
   velo de carga y el preloader (B12c).
5. Las pruebas no llaman a la API del chat.

## Log

- La compuerta (`compuerta.ts`, `ChatDelSitio.tsx`): la entrada abierta (B12c), sin el velo de carga del home, la escena preparada
  (`marcarLaEscenaPreparada`) o caída, o el plazo (el doble del seguro del velo, 10,4 s). Abierta, en un `requestIdleCallback` (tope 2 s),
  se piden juntos el módulo y la config (`prefetchBotConfig`, la caché del widget: la misma promesa que usa él después). Sin config (la
  API caída) no se monta: el aviso de reintento del sitio vivo (240 px de ancho, en la misma esquina) pisaría la píldora al pie entre
  860 y ~1130 px. Una vez por documento: el chrome del layout no se vuelve a montar entre rutas.
- Las pruebas: bajo automatización (`navigator.webdriver`) o con la siembra de los bancos (`home:intro`, la del preloader) el chat no se
  pide; un banco lo pide con `window.__chatDelBanco = true` y simula la config.
- Las rutas: el home y las páginas sí; los laboratorios (`componentes`, `tipografia`, `motion`, `control-estatico`,
  `titulos-de-pagina`) no: `/v3/motion` tiene sus controles en la misma esquina.
- El apilado: el widget trae capas propias cerca del máximo entero (para pisar cualquier sitio que lo embeba). Un envoltorio fijo y sin
  tamaño, en el alto del chrome (`--z-cabecera`, 100), las encierra: queda encima del velo de la navegación (99) y debajo de todo lo que
  está en `--z-overlay` (10000) o más.
- El avatar: la onda por defecto (el pariente plano del orbe: un punto con anillos). `?chat=onda|monograma|geometrico` para mirar los
  tres; un 3D por la URL cae a la onda.
- La posición en el modelo: la píldora sólo se muestra si entra con la esquina de Contacto y Login a 16 px (`BarraDelHome`), así que su
  borde derecho queda a 32 + esquina + 16 px del borde; el botón del chat empieza a 80 px. Con la esquina más angosta posible (sin su
  texto: 46 px), la holgura mínima es 14 px a lo ancho; con el texto, bastante más. Al pie de la primera pantalla los dos apoyan en la
  misma línea (24 px del borde de abajo).
- s87-chat: 40 afirmaciones con 18 controles positivos, 0 fallas.
- Gate: eslint limpio en los siete archivos tocados; tsc 0 errores; s87 40 de 0; s8-chrome 34 de 0 (1 fuera de ventana, de antes);
  s79-ingreso-url 35 de 0; s10, s38, s39, s40, s41, s61, s73 y s78 sin fallas. De la base, sin relación con esto: s4-cobertura (las
  suites s23 a s39 sin su `test:<suite>`) y s47 (el control del recorte del Portfolio, que ya no encuentra su clase en
  `EscenarioDelPortfolio.tsx`). REGLA DE ALTURAS: no aplica (el chat es fijo y sin tamaño en el flujo: ningún alto cambia).

## Qué mirar (el orquestador, en el navegador)

1. `http://localhost:3000/v3` a 1440: el chat aparece abajo a la derecha después de que la página se destapa (el velo de carga y, la
   primera vez del día, el preloader), con su animación (sube y aparece). Sin canvas: un punto con anillos.
2. El mismo, a 1024 y 860 (al cargar, con la píldora al pie): el chat a la derecha de la píldora, sin tocarla.
3. A 390 y 360: abajo a la derecha; el parlante y el menú arriba, intactos.
4. `http://localhost:3000/v3?ingresar` (el login de B7): la hoja negra tapa el chat.
5. El contacto («Contacto» de la barra): la hoja tapa el chat.
6. `http://localhost:3000/v3/pagina-base?composicion=2`: el chat no pisa el título de la intro.
7. Abrir el chat y scrollear sus mensajes con la rueda: se mueven los mensajes, no la página (en el pie, con el final del pie).
8. Banco: `RUTAS=/v3,/v3/pagina-base?composicion=1 BASE=http://localhost:3000 npx tsx scripts-carga/chrome-en-los-anchos.ts`
   (simula la config del bot; nunca la API). Control: `CONTROL=chat-al-centro` tiene que dar «chat pisa píldora» desde 860 en `/v3`.
