# Catálogo de avatares del chatbot — capturas de prueba

Corrida de captura de las 5 variantes de avatar del widget embebible (`/embed/[slug]`)
en sus 3 estados (`idle` / `thinking` / `speaking`) × 2 viewports, más un recorte de
detalle y una verificación en página anfitriona real (`widget.js`). Instrumento de
solo-lectura sobre código de producto: cero cambios bajo `src/`, `prisma/`, `public/`.
Toda decisión de curación (qué variante conservar) queda para verificación humana —
este documento no recomienda nada.

## 1. Inventario

29 archivos, agrupados por variante. **No hay archivos `*__speaking__*`** — ver
sección 2 para el motivo (no es un estado que no se alcanzó por timing; es
estructuralmente inalcanzable en este entorno, causa raíz abajo).

| Variante | idle | thinking | detalle |
|---|---|---|---|
| `neuro` | `neuro__idle__desktop.png`, `neuro__idle__mobile.png` | `neuro__thinking__desktop.png`, `neuro__thinking__mobile.png` | `neuro__detalle.png` (86×86, dpr2) |
| `legacy_neuro` | `legacy_neuro__idle__desktop.png`, `legacy_neuro__idle__mobile.png` | `legacy_neuro__thinking__desktop.png`, `legacy_neuro__thinking__mobile.png` | `legacy_neuro__detalle.png` (94×94, dpr2) |
| `monograma` | `monograma__idle__desktop.png`, `monograma__idle__mobile.png` | `monograma__thinking__desktop.png`, `monograma__thinking__mobile.png` | `monograma__detalle.png` (72×74, dpr2) |
| `onda` | `onda__idle__desktop.png`, `onda__idle__mobile.png` | `onda__thinking__desktop.png`, `onda__thinking__mobile.png` | `onda__detalle.png` (72×74, dpr2) |
| `geometrico` | `geometrico__idle__desktop.png`, `geometrico__idle__mobile.png` | `geometrico__thinking__desktop.png`, `geometrico__thinking__mobile.png` | `geometrico__detalle.png` (72×74, dpr2) |

Página anfitriona (`widget.js` real, servido por HTTP — no `file://`, ver sección 3):

| Estado | Desktop | Mobile |
|---|---|---|
| Burbuja cerrada | `host__cerrado__desktop.png` | `host__cerrado__mobile.png` |
| Widget abierto | `host__abierto__desktop.png` | `host__abierto__mobile.png` |

Variante activa durante la captura de host: `geometrico` (la última del recorrido).

Todas las capturas de widget completo son exactamente `1280×800` (desktop) o
`390×844` (mobile) — verificado leyendo el header IHDR de cada PNG antes de dar la
corrida por buena. `document.documentElement.scrollWidth/Height` coincidía con el
viewport en todos los casos (el root de `ChatbotEmbed` fija `height:100dvh` +
`overflow:hidden`; solo el panel de mensajes interno scrollea) — el problema de
`fullPage` cortado por un shell con scroll propio, señalado en el encargo, **no se
reprodujo** para este componente. No usé `fullPage:true` en ningún caso.

## 2. Qué se alcanzó y qué no

**Alcanzado, para las 5 variantes × 2 viewports:** `idle`, `thinking`, recorte de
detalle en `idle`, y las 4 capturas de página anfitriona.

**No alcanzado: `speaking`, en ninguna variante.** No es un problema de timing ni de
una variante puntual — es un bloqueo estructural del entorno, confirmado con
evidencia directa del log del servidor:

```
errorName: "AI_APICallError"
errorMessage: "This API method requires billing to be enabled. Please enable
billing on project #my-project-22901-harto-estoy by visiting
https://console.developers.google.com/billing/enable?project=my-project-22901-harto-estoy
then retry."
```

Este error ocurrió en **el primer mensaje enviado y en todos los siguientes** (23
ocurrencias registradas), contra **dos bots distintos** (`qaseed-evals-base` y,
antes, `matsu`), bajo **los dos modos de servidor probados** (`next start` prod y
`next dev`). El proyecto de GCP que resuelve el LLM (Gemini vía Vertex, provider
`GOOGLE`) no tiene billing habilitado en este entorno — no es algo que este
instrumento pueda ni deba arreglar.

Encadenado a esto: cuando el stream falla así, `useChatbot`/`ChatHeader` nunca
transicionan `avatarState` a `'speaking'` (ese estado depende de
`status === 'streaming'`, que requiere un stream real que nunca arranca — ver
`useChatbot.ts:531-535`). El servidor sí arma, ~12s después, un mensaje "canned" de
fallback (`finishReason:"watchdog_idle"`, `source:"watchdog_canned"`), pero eso pasa
por el mismo camino de degradado — no por `'streaming'`. Aunque se lograra
capturar esa ventana, el avatar del header mostraría su pose `idle`, no una pose de
"hablando" real. Por eso no tiene sentido forzar una espera más larga: no hay un
estado visualmente distinto de `idle`/`thinking` esperando al final de ese camino.

Un primer intento de capturar `speaking` (con la detección de "2do `.prose`" mal
calibrada — ver nota abajo) generó 10 archivos `*__speaking__*.png` que en
realidad mostraban el frame de `thinking` (puntitos + burbuja propia, sin
respuesta), no una degradación real ni un "speaking" genuino. Se **eliminaron**
esos 10 archivos en vez de dejarlos con una etiqueta engañosa.

## 3. Observaciones factuales (sin juicio estético)

- **`thinking` es visualmente indistinguible de `idle` en el avatar del header,
  en las 5 variantes.** `ChatbotEmbed.tsx` no pasa `isTyping` a `ChatHeader`, y sin
  ese prop, `ChatHeader.tsx:46-53` resuelve `headerAvatarState` a `'idle'` salvo
  que `avatarState==='speaking'`. El "pensando" real solo se ve en los 3 puntitos
  animados debajo del avatar (`ChatbotEmbed.tsx:428-450`) y en el texto del header
  ("Escribiendo…" + punto de color). Es comportamiento de producto tal como está
  hoy, no un bug de esta corrida — lo señalo porque afecta directamente lo que se
  puede juzgar comparando las capturas `idle` vs `thinking` de este catálogo.
- **GCP billing deshabilitado** (sección 2) — bloquea `speaking` para cualquier bot
  en este entorno de forma determinística, no intermitente.
- **CSP bloqueaba el embed en la página anfitriona la primera vez.** Server
  con `Content-Security-Policy: frame-ancestors *` (enforced). Al servir la página
  de host desde `file://`, Chromium bloqueó el framing porque `*` en
  `frame-ancestors` no matchea esquemas no-network (`file:` queda afuera por spec).
  Se corrigió sirviendo `host-test.html` por un server HTTP mínimo en
  `127.0.0.1:8532` (scheme `http:`, como sería un sitio cliente real) — el
  problema era del harness de prueba, no del producto.
- **Hay una segunda política CSP en modo *report-only*: `frame-ancestors 'none'`**,
  corriendo en paralelo a la enforced `frame-ancestors *`. Visible en la consola
  del navegador como violación reportada (no bloqueante) en cada carga de la
  página anfitriona. Si esa política pasara de report-only a enforced en algún
  momento, bloquearía el embed del widget en **cualquier** sitio cliente — vale la
  pena que alguien del equipo lo tenga presente, sin que este documento recomiende
  una acción sobre eso.
- **Advertencia de consola en los avatares 3D** (`neuro`, `legacy_neuro`): GPU
  driver warning de WebGL (`GL_CLOSE_PATH_NV`, "GPU stall due to ReadPixels"),
  nivel Chromium/ANGLE, no de la aplicación. Aparece una vez por sesión de
  navegador y luego se silencia sola ("this message will no longer repeat").
- **Tiempo hasta que el 3D queda visible:** el placeholder (`HeavyAvatarsLazy`,
  un `<div aria-hidden>` sin `<canvas>`) se reemplaza por el `<canvas>` real de
  Three.js en **~100–250ms** después de que el header es visible, en ambas
  variantes pesadas (`neuro`, `legacy_neuro`) — chunk ya estaba compilado/cacheado
  por el build de producción, no hubo espera perceptible.
- **Tamaño del recorte de detalle:** el avatar del header renderiza a un tamaño
  fijo pequeño — `getAvatarRenderSize(style, 36)` da 36px base, escalado por
  `fillScale` a ~43px (`neuro`) y ~47px (`legacy_neuro`); las 3 variantes livianas
  quedan en 36px. Con `deviceScaleFactor:2` esto da recortes de 72–94px de lado —
  suficiente para distinguir forma y color, poco margen para juzgar textura o
  trazos finos. Dato factual sobre la resolución disponible, no una queja.
- **Diferencia de 2px entre ancho y alto del recorte** en `monograma`/`onda`/
  `geometrico` (72×74 en vez de 72×72): el elemento raíz que devuelve
  `AvatarRenderer` para esas 3 variantes mide 2px más de alto que de ancho en el
  layout real del header — no lo investigué más a fondo, es una nota de medición,
  no un bug reportado.
- **Sin diferencias notorias entre desktop y mobile** más allá del propio
  viewport: el avatar, el header y el estado de los puntitos se ven consistentes
  en ambos anchos.
- **Warning de Next.js dev** (`allowedDevOrigins`) apareció solo durante la fase de
  diagnóstico con `next dev` (puerto 3002) al navegar por `127.0.0.1` en vez de
  `localhost` — no aplica a la corrida final, que corrió contra `next start`
  (prod, puerto 3001) según lo pedido originalmente.

## 4. Decisiones tomadas durante la corrida (no eran obvias de antemano)

- **El bot de QA esperado (`sanmiguel`) no existe** en la base dev actual.
  Encontré 10 `BotConfig` candidatos y te consulté cuál usar; elegiste delegarlo.
  Usé **`qaseed-evals-base`** ("Asistente QA (base)") — es el único bot cuyo
  `allowedDomains` incluye literalmalmente `localhost` y `127.0.0.1`, y cuyo plan
  (`BUSINESS`, `maxDomains: null`) no aplica ningún cap de dominios — es decir, es
  el bot que realmente está aprovisionado para pegarle directo desde un harness
  local, a diferencia de los demás.
- **Encontré y descarté un camino alternativo (`matsu`)** por indicación de una
  memoria previa del repo que lo documenta como "el bot de testing" para `/chat`
  — pero `matsu` no tiene `127.0.0.1`/`localhost` en su `allowedDomains`, así que
  bajo `next start` (prod) cae en un gate de "dominio fuera del cap del plan"
  (`degradedResponse.ts:89-96`, el bypass de localhost ahí solo aplica con
  `NODE_ENV=development`). Te consulté cómo seguir; elegiste probar `next dev`.
  Bajo `next dev` ese gate específico sí se sortea, pero **`matsu` igual falla**
  por el mismo bloqueo de billing de GCP descripto en la sección 2 — así que el
  cambio de servidor no habría resuelto nada para ese bot tampoco. Terminé
  volviendo a `next start` (puerto 3001, tal como pedía el encargo original) una
  vez confirmado que `qaseed-evals-base` no tiene el problema de dominio y que
  cambiar de modo de servidor no cambiaba el resultado de `speaking`.
- Mensaje de prueba enviado en cada captura de `thinking`: *"Hola, ¿qué servicios
  ofrecen?"*. Tema visual: `dark` (default del embed) en todas las capturas — el
  encargo no pidió `light` como dimensión adicional de la grilla.

## 5. Estado de los datos

- `avatarStyle` original de `qaseed-evals-base`: **`neuro`**.
- Valor al cierre, releído de la base: **`neuro`**.
- Coinciden: **sí** (verificado con una lectura fresca después de restaurar, no
  solo con el valor que la propia corrida dice haber escrito).
- Único campo de `BotConfig` mutado intencionalmente: `avatarStyle`. No se tocó
  `allowedDomains`, `accentColor`, ni ningún otro campo.
- **Efecto colateral no evitable, y esperado:** enviar mensajes reales para
  capturar `thinking` (y los intentos de `speaking`) crea filas reales de
  `Conversation`/`Message`/`ChatbotEvent` contra `qaseed-evals-base` (y, durante el
  diagnóstico, un puñado contra `matsu`) en la rama `dev` de Neon. Es justamente
  para lo que existe un bot "QA Evals" — no se purgó porque no hay un mecanismo de
  purga equivalente al `regression-test-*` de otras suites, y el encargo no pidió
  limpiar conversaciones, solo revertir `avatarStyle`.
- Ninguna migración corrió. Ninguna escritura tocó producción — `DATABASE_URL`
  verificado contra el host de la branch Neon `dev` (`ep-quiet-waterfall-acv0fpll`)
  antes de la primera escritura, con el mismo guard que usa
  `scripts/dev/m0-galeria-seed.ts`.

## 6. Cierre — `git status`

```
?? docs/
```

`docs/` ya aparecía como no trackeado antes de esta corrida (contiene además
`docs/decisiones-oslead-vii/`, preexistente). Lo único agregado por esta corrida es
`docs/proof-screenshots/catalogo-avatares-20260904-1548/` — confirmado con
`git status --porcelain -- logic-core-v3/src logic-core-v3/prisma logic-core-v3/public`
(sin salida) y `git diff --stat` sobre archivos trackeados (sin salida): **cero
cambios bajo `src/`, `prisma/` o `public/`.**

Todo el instrumento (scripts de Playwright, mutación de `avatarStyle`, server HTTP
para la página anfitriona) vivió en el scratchpad de la sesión, fuera del repo, y
no se commiteó nada de eso.

---

*Queda para verificación humana: toda la decisión de curación (qué avatares
conservar). Este documento no recomienda conservar ni eliminar ninguna variante.*
