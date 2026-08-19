# S3-HERO — Reporte de cierre

- **Fecha:** 2026-08-18 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/S3-hero.md` (Bloques 0-3)
- **Verificación:** `tsc --noEmit` exit 0 · `eslint` exit 0 sobre los archivos tocados. **No autoconfirma que funciona porque compila — la verificación visual la hace el humano en localhost.**

---

## Bloque 0 — El enganche de scroll: causa raíz y fix

### La primitiva no estaba rota

Verificado en vivo (dev server + Chrome real, no razonamiento estático): `useScrollProgress` entrega progreso correcto en cada frame que el navegador produce, con Lenis activo. Trayectoria medida sobre la vitrina (`Parallax intensityPx=160` → rango `y` de −80 a +80):

| Momento | `scrollY` | `transform` del mover | |
|---|---|---|---|
| Página arriba (progreso 0) | 0 | `translateY(-80px)` | exacto |
| Bloque a mitad de viewport | 10314 | `translateY(-4.75px)` | exacto |
| 500px más abajo | 10814 | `translateY(39.2px)` | exacto |

**La hipótesis principal del sprint queda descartada con evidencia.** Lenis 1.3.25 **sí** mueve el scroll nativo de la ventana: `window.scrollY` cambia y los contadores de eventos `scroll` (bubble y capture) avanzan con cada gesto. Y `useScroll` de motion 12.42, leído en `node_modules`, toma el camino JS (`scrollInfo`) porque su callback interno tiene 2 argumentos — un listener pasivo sobre `window` más medición por `offsetTop`. El puente que la hipótesis pedía ya existe: es el scroll nativo. Corroboración independiente: `About.tsx:394` usa el mismo mecanismo y lleva meses vivo en producción bajo Lenis.

### Qué explicaba el síntoma

Dos causas compatibles, ninguna de física:

1. **Legibilidad, no movimiento.** Con `intensityPx=160` sobre ~2 viewports de recorrido, la tarjeta viaja al ~92% de la velocidad de página. El diferencial es de 10-25px por gesto y la vitrina no tenía ninguna referencia fija contra la cual leerlo. Un 8% de diferencia contra 0% (reduced-motion) se ven genuinamente iguales.
2. **La trampa de la pestaña oculta** (ver sección propia más abajo). Invalidó la primera medición de este mismo diagnóstico.

### El fix que sí hacía falta: la mina de ViewTimeline

`useScroll` en motion 12.42 marca `scrollYProgress` como **acelerable** cuando el `offset` mapea a un rango nombrado de ViewTimeline — y el default de `useScrollProgress` (`['start end','end start']`) mapea al preset `cover`. Con esa marca puesta, cualquier consumidor que derive el valor con `useTransform` y lo alimente a `style` en las keys **`opacity`, `clipPath`, `filter` o `transform`** es promovido en silencio a una animación WAAPI nativa con `ViewTimeline`.

Verificado en el código instalado: `use-transform.mjs` hereda el config de aceleración, y `VisualElement.bindToMotionValue` lo consume contra el set `acceleratedValues`.

El modo de fallo: una `ViewTimeline` trackea al sujeto contra su **scroll container ancestro más cercano**, no contra la ventana. Un `overflow: hidden`/`auto` en cualquier ancestro —patrón omnipresente en heros, y presente en la propia caja de la vitrina— la congela sin error, solo en navegadores con ViewTimeline. Además bifurca la física: dos consumidores del mismo `MotionValue` correrían con relojes y geometrías distintas (compositor vs JS).

`y` (lo único que usaba `Parallax`) **no** está en el set de keys aceleradas — por eso la vitrina funcionaba y la mina estaba latente.

**Fix:** `scrollYProgress.accelerate = undefined` en `useScrollProgress.ts`, con su justificación en el docblock. Es una mutación en render, no en un efecto, y tiene que serlo: `useScroll` la re-asigna en cada render y `useTransform` hereda el config en el momento en que se lo llama (también en render) — un efecto llegaría después del primer binding del consumidor, con la animación nativa ya creada. Lleva un `eslint-disable` puntual de `react-hooks/immutability` con esa explicación.

**El Bloque 3 de este mismo sprint es el primer consumidor que la habría pisado** (opacidad ligada a progreso de scroll).

### Instrumentación permanente de la vitrina

`MotionBlock.tsx` gana un readout numérico del progreso en vivo (`useMotionValueEvent` → `textContent` directo, cero setState por frame) y una línea de referencia fija en el centro de la caja. No es debug temporal: cualquier sprint que consuma progreso de scroll necesita poder comprobar que el hook entrega valores **sin depender de percibir un desplazamiento del 8%**.

---

## Bloque 1 — Preloader nuevo

### Arquitectura

Un solo archivo: `src/components/layout/HomeIntro.tsx`, con dos exports.

- **`HomeIntroBoot`** — script pre-paint inyectado al `<head>` por `useServerInsertedHTML` (mismo mecanismo que el viejo `EarlyScrollLock`, cuyo docblock documenta por qué NO se migra a `next/script beforeInteractive`). Decide si el intro corre **antes del primer paint** y lo comunica marcando `data-home-intro` en el `<html>`. Gates: pathname `/` + `navigator.webdriver !== true` + sin `prefers-reduced-motion` + sesión sin intro previo. **La diferencia de fondo con el script viejo: aquel bloqueaba el scroll; este solo marca un atributo.**
- **`HomeIntro`** — el overlay, montado en `page.tsx`.

**Cómo se evita el flash sin romper la hidratación:** el overlay viaja SIEMPRE en el HTML del server (el server no conoce `sessionStorage`), y una regla de `globals.css` (`html:not([data-home-intro]) [data-home-intro-overlay] { display: none }`) lo esconde desde el primer paint cuando la marca no está. El primer render de cliente es idéntico al del server; el estado cambia recién en un efecto.

**Tres capas, no una** (reestructurado para que el logo pueda quedarse mientras la cortina se levanta) — ⚠ **REVERTIDO en S3b: volvió a UNA sola capa.** Ver la sección de cierre de S3b, al final de este documento.

1. **Cortina** — color de fondo + levantada.
2. **Lockup** — layout centrado + inversión de la tinta. No se mueve.
3. **Logo** (se queda o vuela) y **texto** (se levanta con la cortina), que deciden por separado.

**Condiciones no negociables, todas cumplidas:** nunca bloquea el scroll (`pointer-events-none`, no toca `overflow`, no llama `lenis.stop()`, no gatea el render) · solo la primera visita de la sesión (`sessionStorage`) · sin secuencia bajo `prefers-reduced-motion` · el contenido del hero se renderiza en servidor y existe detrás desde el primer paint · sin 3D (el logo acá es el SVG 2D).

**Contrato con el contexto frozen:** `PreloaderContext` se consume, nunca se edita. La fase salta a `'done'` **al montar** — el mismo salto directo que el contexto ya hace bajo automation y que el orquestador viejo hacía en client-nav. Nada queda retenido por el intro.

**Preloader viejo:** sigue montado con `isHomePage={false}` — su rama home no corre ni renderiza; la rama marketing (Route B / `MarketingIntro`) queda intacta. Ningún archivo del intro viejo se editó ni se borró.

### Bug encontrado y corregido durante la verificación

Con la fase saltando a `done` al montar, **el teaser del chatbot flotaba ENCIMA del velo negro** (capturado en screenshot). `useChromeRevealed` daba `true` apenas la fase era `done`, y el widget montaba durante la secuencia apilándose sobre el overlay.

**Fix:** en home, `useChromeRevealed` ahora exige `phase === 'done'` **y** overlay levantado, vía el evento `home-intro:finished` — espejo exacto del patrón `chrome:revealed` que ese mismo archivo ya usaba para marketing. La verdad viva es el atributo del `<html>`; el evento solo notifica.

### Constantes de la coreografía — dónde viven

**`HOME_INTRO_PHASES` en `HomeIntro.tsx`.** Tres números editables, cada uno con su comentario:

| Fase | Default | Qué hace |
|---|---|---|
| `darkS` | 2.5s | Pantalla negra; entran escalonados logo, "develOP" y slogan, y quedan quietos para leerse |
| `invertS` | 1.0s | El fondo invierte de negro a blanco; la tinta invierte con él |
| `lightS` | 2.5s | El lockup invertido se sostiene y sobre el final se levanta revelando el hero |

**Total: 6.0s.** Tocar cualquiera reacomoda todo lo de adentro **proporcionalmente** — no hay que recalcular un solo delay a mano. La coreografía interna se declara en fracciones de su fase (`ENTRANCE_START_FRAC`, `ENTRANCE_DURATION_FRAC`, `LIFT_DURATION_FRAC`), nunca en segundos.

Con los defaults, el timeline resuelto es: entradas en 0 / 0.45 / 0.9s (0.6s cada una) · hold oscuro 1.0s · inversión 2.5→3.5s · hold claro 1.3s · levantada 4.8→6.0s.

**Las fracciones se derivan de los tokens de S2, no son literales sueltos:** `ENTRANCE_DURATION_FRAC = MOTION_DURATION.elemento / REFERENCE_PHASES.darkS` y `LIFT_DURATION_FRAC = MOTION_DURATION.pagina / REFERENCE_PHASES.lightS`. Así, en su default el intro usa **exactamente** la física del sistema (0.6s la entrada — la de `Reveal`; 1.2s la levantada — la escala que S2 documentó como "momento autoral de una sola vez", reservada justamente a esto), y esa relación la sostiene el compilador en vez de un comentario que se pudre. La curva nunca se escala: es `MOTION_EASE.arrive` en los tres momentos.

`REFERENCE_PHASES` es el ancla de calibración y **no** es editable; el ritmo se edita en `HOME_INTRO_PHASES`.

### ⚠ Recomendación de duración: 4s o menos

El default de 6.0s **excede a propósito** esa recomendación, para poder calibrarlo a ojo. Bajarlo es cambiar un número.

El overlay es opaco y tapa el hero: mientras corre, el visitante no ve ni una palabra del producto. Y corre exactamente en la visita que importa — la **primera de la sesión**, que es la de tráfico frío (alguien que toca el link en WhatsApp y nunca vio el sitio). Esa visita es también la que alimenta el dato de campo de Core Web Vitals: el LCP cae dentro de la ventana del intro. *(No está medido a qué elemento lo atribuye Chrome exactamente — el wordmark del overlay es el candidato grande y opaco —, pero en cualquiera de los dos casos el hero real está tapado hasta el final.)*

---

## Bloque 2 — Hero de dos capas

### Qué se recuperó de la historia y qué se adaptó

`HeroArtifactLayer.tsx` y `HeroCanvas.tsx` **ya estaban en el árbol**, huérfanos y byte-idénticos a los de `78b510ac^` — no hubo que extraerlos. La base tipográfica sí se recuperó con `git show "78b510ac^:logic-core-v3/src/components/layout/Hero.tsx"`.

| Pieza | Qué se conservó | Qué se adaptó |
|---|---|---|
| Base tipográfica | La arquitectura completa: Server Component sin `'use client'`, reveal por animación CSS del sistema (no Framer, que emitiría `opacity:0` en SSR), `animate-ds-rise` en el titular por la lección de LCP ya medida, `id="inicio"` | Contenido nuevo (ver abajo). Tema `light` (tabla de S1) en vez de `dark`. **Reserva de chrome invertida:** el hero viejo reservaba arriba para una barra fija que en `main` no existe; el chrome de desktop acá es `DynamicDock`, anclado abajo — la reserva va toda al pie, expresada con tokens (`--spacing-ds-section` + `--spacing-ds-nav`) |
| `HeroArtifactLayer` | Carga diferida por `requestIdleCallback`, gate desktop, `CanvasErrorBoundary`, red de seguridad de 6s, `frameloop='demand'` fuera de viewport | Pasa a ser **capa superpuesta** (`absolute inset-0`) dentro del slot en vez de ser la caja. Curva y duración del fade desde los tokens de S2 (era el literal `[0.25,0.46,0.45,0.94]`, que es `MOTION_EASE.arrive`). Prop nueva `onArtifactReady` |
| `HeroCanvas` | Todo el rig de luz y su razonamiento, el HDRI **self-hosteado** (`/hdri/studio_small_03_1k.hdr` — se cumple el pedido de no bajarlo de la CDN), la ausencia de `EffectComposer` | La escala del logo sale de la calibración compartida en vez de una fórmula propia; la cámara también, para que no puedan divergir. `position` al origen exacto (era `y: 0.02`) |

**Archivo nuevo `HeroSection.tsx`.** El hero legacy (`Hero.tsx`, 826 líneas) **queda en disco sin uso**, como manda la regla de no borrar. El hero vivo es `HeroSection`.

### Contenido

- Titular: **"Tu negocio vendiendo en piloto automático"**
- Apoyo: *"Sitios web, automatizaciones e inteligencia artificial para empresas de cualquier rubro."* (la segunda oración del párrafo actual, acortada — no inventada)
- Eyebrow: `( 01 )` + "Agencia digital — Tucumán, Argentina", en grafía natural (el `uppercase` lo pone el token, así el lector de pantalla no deletrea)
- **Sin CTA de WhatsApp.** Un enlace discreto hacia abajo: "Ver nuestros trabajos ↓"
- **Sin máquina de escribir.** `TypewriterText` muere con el hero viejo (verificado: no aparece en el HTML servido)

### El ancla que no resolvía

`#trabajos` **no existe en ninguna parte del código** — no hay ni un `href` que apunte ahí. "Trabajos" es como la tabla de S1 llama a la fila; el id real de la sección es `portfolio` (`Portfolio.tsx:726`).

**El enlace del hero apunta a `#portfolio`**, que es el id que existe y el que ya consumen el menú (`MAIN_NAV_ITEMS`) y el tool `navigateToPage` del chatbot (`/#portfolio` en `VALID_PATHS`). No se renombró la sección —rompería el enum del chatbot y el menú— ni se agregó un segundo id al mismo destino, que repetiría el bug de `#nosotros` duplicado.

### La entrega del logo al hero (requisito nuevo, aprobado tras parada)

> ⚠ **TODA ESTA SUBSECCIÓN QUEDÓ SIN EFECTO.** S3b eliminó el handoff por completo: fue un malentendido de la capa de planificación, no un pedido del dueño del proyecto. Se conserva como registro de por qué se intentó y qué se aprendió del componente frozen. **Lo vigente está en la sección de cierre de S3b, al final.**

**Por qué el 3D no podía ser el destino.** `HeroArtifact.tsx` está frozen y le impone al mesh: flotado perpetuo `sin(t·0.65)·0.08` amortiguado en cada frame (**no existe posición de reposo**), escala amortiguada hacia su target, rotación atada al puntero, y un auto-cull propio que congela el objeto cuando `scrollY > innerHeight + 200`. Además puede no existir al levantarse el velo (chunk diferido + HDRI de 1,7 MB + red de seguridad que revela la caja vacía + boundary que renderiza `null`), y en mobile no existe nunca. No se calza contra un blanco que nunca se detiene.

**La solución.** `HeroLogoSlot.tsx`: el hero renderiza **su propio logo SVG 2D, server-rendered, en todos los viewports**, y el 3D hace crossfade encima cuando está listo. El destino de la entrega es un nodo del DOM que existe desde el primer paint, es medible, no flota y no se auto-congela.

**Beneficio propio, más allá del handoff:** antes esa columna quedaba **vacía** hasta que el 3D cargaba —hasta 6 segundos, o para siempre en mobile, con reduced-motion o si el canvas fallaba— así que la marca simplemente no estaba.

**Mobile lleva el logo**, arriba del texto y chico (80px): la entrada tipográfica con su marca al frente, no la columna del desktop encogida.

**Mecánica del vuelo** (`HomeIntro.tsx`): al arrancar la levantada, el logo del intro vuela hasta el rect del slot y aterriza exactamente encima. Los colores calzan **por construcción**: `INTRO_COLORS.inkOnLight` = `#111111` = `--color-ds-ink` = el `text-ds-fg` de una sección clara. Cuando el overlay se desmonta, abajo quedó la misma marca, del mismo tamaño, en el mismo lugar y del mismo color.

- **El destino se re-mide en CADA frame del vuelo**, no una vez al empezar: el scroll está libre durante el intro, así que el slot puede moverse mientras el logo viaja.
- **Si el destino no está en pantalla al levantar, no hay vuelo:** el logo se levanta con el texto (regla aprobada).
- Cero `setState` por frame: `animate()` sobre un número + escritura directa de `transform`. Dos nodos, no uno — el externo lleva el transform de la entrega, el interno el de la entrada.

**El crossfade 2D↔3D enmascara, no elimina, la diferencia** (decisión aprobada). El flotado del componente frozen hace que la coincidencia sea *en promedio*: el 3D oscila alrededor del centro del 2D (±0.08 unidades de mundo ≈ 1% de la caja). Por eso `HeroCanvas` pasó a `position` en el origen exacto.

Y **el 2D manda**: el SVG se dibuja a tamaño completo de su caja cuadrada y el 3D se escala para calzar contra él, no al revés — porque el 2D es el que existe siempre.

**Importante:** el fade del 2D se dispara con `onArtifactReady`, que sale del ready **real** del canvas y **nunca** de la red de seguridad de 6s. Hacerlo por la red dejaría el hero sin logo: el 2D desaparecido y el 3D que nunca llegó.

### Las dos calibraciones de `logo-footprint.ts`

El archivo ahora abre documentando que hay **dos**, cuál es cuál y cuál manda:

- **Calibración A · canvas full-screen** (histórica): `logoHvis()` + `computeLogoOuterScale()`. Supone canvas del tamaño de la ventana, logo centrado, y hardcodea la cámara por layout. Consumidores: `LogoStrokeOverlay`, `IntroLockupText`, `BrandedIntroCanvas`. **Diverge del Hero legacy en dos puntos ya conocidos** (le falta el clamp de width-fit; usa Y 0.08 contra el 0.02 de mobile). No se tocó: es deuda del camino viejo, que muere con él.
- **Calibración B · canvas in-box** (S3, nueva): `HERO_INBOX_CAMERA` + `heroInboxLogoScale()` + `HERO_LOGO_BOX_FRACTION`. Supone un canvas que llena una caja cuadrada del layout. La usan `HeroCanvas` y `HeroLogoSlot`.

Elegir la equivocada no rompe el build: desalinea el logo en runtime. **En el hero nuevo manda el 2D**, y la coincidencia es en promedio (ver arriba).

Una mejora de B sobre A: la cámara del canvas y la escala del logo salen de **la misma constante**, así que no pueden divergir — que es exactamente la fragilidad de A.

---

## Bloque 3 — Logo con el scroll, versión mínima

Al scrollear fuera del hero, el logo **se aleja y se desvanece**. Mecanismo montado, coreografía deliberadamente mínima.

**Constantes:** `HERO_LOGO_SCROLL` en `HeroLogoSlot.tsx`, todas juntas y comentadas.

| Constante | Default | Qué es |
|---|---|---|
| `offset` | `['start start', 'end start']` | Ventana de medición: quieto en 0 mientras el hero está arriba; empieza cuando el borde superior del logo toca el techo del viewport |
| `fadeStart` / `fadeEnd` | 0 / 0.7 | Tramo del progreso en el que ocurre todo |
| `exitOpacity` | 0 | Opacidad final |
| `exitScale` | 0.86 | Escala final (<1 = se aleja). **Solo desktop** |

**En mobile el logo no se acerca ni se aleja** (pedido del sprint): solo queda el desvanecido. Lo mismo bajo `prefers-reduced-motion` — `useScrollProgress` no resuelve movimiento reducido por diseño (es una medición), y el consumidor que la convierte en movimiento visible es el responsable.

**Dos nodos, no uno:** el que se mide nunca recibe transform. Misma disciplina que `Parallax`.

El breakpoint se lee con `useSyncExternalStore` sobre `matchMedia` — no `useState` + efecto: matchMedia *es* un store externo, así no hay setState en un efecto ni desincronización si el viewport cambia.

---

## Objetivo medible: scroll disponible

**Antes: ~9,8 s** (documentado en B0b §B2 — suma awaited del peor caso desktop: `LOGO_READY_TIMEOUT_MS` 2.5 + velo 1.4 + 0.15 + (0.85+0.45+0.4+1.5+1.5) + 0.78 + 0.24).

**Después: no queda ningún camino de código que bloquee el scroll.**

Evidencia (determinística, no perceptual):

- `EarlyScrollLock` **desmontado** del layout — el HTML servido no contiene el script de lock: `grep -c "style.overflow" home.html` → **0**.
- El hero legacy, dueño del lock (`Hero.tsx:483-495`, `overflow:hidden` + `lenis.stop()`), **ya no se monta**: cero importadores.
- Grep sobre todo el camino del home (`HeroSection`, `HomeIntro`, `HeroLogoSlot`, `HeroArtifactLayer`, `HeroCanvas`, `page.tsx`, `layout.tsx`) por `style.overflow` / `lenis.stop()`: **sin un solo hit de código** (solo comentarios).
- El overlay del intro es `pointer-events-none` y no toca `overflow`.

**Y el contenido existe detrás desde el primer paint** — verificado sobre el HTML servido: el titular, la línea de apoyo, el `href="#portfolio"` y el `data-hero-logo-mark` están todos en el markup del server.

> **Lo que NO se midió:** un cronómetro real en navegador. Ver la sección de verificación pendiente.

---

## ⚠ La trampa de la pestaña oculta

**Con la pestaña de Chrome oculta, minimizada u ocluida, el navegador saltea los rendering steps: no despacha eventos `scroll`, no corre `requestAnimationFrame`, y `window.innerWidth` reporta 0.**

Consecuencias, las tres verificadas en carne propia en este sprint:

1. **Cualquier medición de scroll da cero.** `scrollY` cambia pero el parallax queda clavado. La primera medición del Bloque 0 cayó justo ahí y "confirmaba" que la primitiva estaba rota.
2. **Cualquier medición de layout da cero.** Los media queries evalúan contra un viewport de 0px, así que el layout responsive se reporta en su rama mobile aunque la ventana sea de 1440px.
3. **Los screenshots fallan** (`clip` degenerado).

**Cualquier verificación automatizada de scroll o de layout necesita la pestaña visible, o mide cero.** Aplica a `visual-qa` cuando se lo use. Es la clase de cosa que hace perder una tarde persiguiendo un bug que no existe.

**Regla de método derivada:** si un fix es correcto en estático pero "falla" en runtime, buscar primero un discriminador empírico del ENTORNO de medición antes de re-tocar el código. (Hermana de la lección del EffectComposer ya documentada en `CLAUDE.md`.)

---

## El intro no es verificable por automatización

El gate pre-paint incluye **`navigator.webdriver !== true`**, así que el preloader **no corre bajo automatización** — ni `visual-qa`, ni Playwright, ni ninguna herramienta headless lo va a ver nunca.

Es deliberado y se hereda del `EarlyScrollLock` viejo (que también se apagaba bajo webdriver, precisamente porque el intro dejaba a visual-qa varado en una pantalla negra). El efecto colateral es que **la única verificación posible del intro es a ojo, en un navegador real.**

Lo bueno del reverso: como el intro no corre bajo automatización, `visual-qa` **sí** puede verificar el hero directamente, sin esperar ninguna secuencia.

---

## Pendientes y deuda

**Verificación visual pendiente — nada de esto se pudo ver en pantalla en esta sesión:**

- **El hero completo** (desktop y mobile): layout, contraste, el logo 2D, el crossfade al 3D.
- **La secuencia del intro** a 60fps y la sensación de sus timings.
- **El vuelo del logo** y el aterrizaje sin salto — el requisito central del Bloque 2.
- Motivo: el Chrome disponible dejó de renderizar la pestaña (viewport 0×0, ver la trampa de arriba) y el subagente `visual-qa` volvió **sin sus herramientas de preview** — falla de configuración ya conocida en este entorno.

**Deuda anotada, no tocada:**

- **Key duplicada `ia` en el styleguide** — error de consola "Encountered two children with the same key, `ia`". Es fallout de la fusión automation→ia de S1, no de este sprint.
- **`heroCanvasRect` en `PreloaderContext` es API muerta** — declarada y provista, cero lectores en todo `src`. El contexto es frozen: no se tocó.
- **Calibración A de `logo-footprint.ts`** conserva sus dos divergencias con el Hero legacy (clamp de width-fit ausente, Y 0.08 vs 0.02). Muere con el camino viejo; documentado en el archivo.
- **Lock residual de un ciclo de render, ya resuelto:** mientras el hero legacy siguió montado (Bloque 1, antes del Bloque 2), su efecto aplicaba `overflow:hidden` con la fase default `'drawing'` y lo liberaba en el re-render que disparaba `setPhase('done')`. Con el hero nuevo desapareció por completo: `HeroSection` no importa `PreloaderContext`.
- **`DisplayHeading` hardcodea `font-medium`** — pendiente preexistente de S1 (confirmar si la clase explícita pisa el `--font-weight` del token). No se tocó.
- **Archivos que salieron de uso y quedan en disco** (regla de no borrar): `Hero.tsx` (legacy, 826 líneas), `EarlyScrollLock.tsx`, y las piezas del intro viejo (`IntroLockupText`, `LogoStrokeOverlay`) que solo consume ya la rama de marketing.

---

## Verificación

```
.\node_modules\.bin\tsc.cmd --noEmit                 → exit 0, sin errores
.\node_modules\.bin\eslint.cmd <archivos tocados>    → exit 0, sin errores ni warnings
```

**Archivos nuevos:** `src/components/layout/{HomeIntro,HeroSection,HeroLogoSlot}.tsx`, `src/components/ui/LogoMark.tsx`, este reporte.

**Archivos modificados:** `src/app/{globals.css,layout.tsx,page.tsx}`, `src/app/styleguide/_components/MotionBlock.tsx`, `src/components/design-system/motion/useScrollProgress.ts`, `src/components/layout/{HeroArtifactLayer,HeroCanvas,useChromeRevealed}.tsx|.ts`, `src/lib/logo-footprint.ts`.

**El sprint compila y pasa tsc. La verificación visual la hace el humano en localhost.**

---
---

# S3b — Desacople del preloader y el hero (cierre)

- **Fecha:** 2026-08-19 · **Sprint:** `docs/rediseno/sprints/S3b-desacople.md`
- Se aplica **encima de S3 sin commitear**: todo se commitea junto.

## Qué se revirtió y por qué

El requisito de "entrega del logo sin discontinuidad" agregado al Bloque 2 de S3 **fue un malentendido de la capa de planificación**, no un pedido del dueño del proyecto. Se eliminó por completo.

La intención real: **el preloader es un momento cerrado** —tiene su propio logo, sube con el resto de la secuencia y desaparece, no le entrega nada a nadie— y **el hero tiene su propia animación**, que se construye aparte: el logo 3D reaccionando al progreso del scroll, al estilo de nk.studio, sin mouse-follow. Las dos cosas no comparten estado, ni medición, ni coreografía.

### El acople eliminado

| Qué se sacó | Dónde vivía |
|---|---|
| El vuelo del logo hacia el hero (`animate()` + escritura de `transform` por frame) | `HomeIntro.tsx` |
| La medición del slot por `getBoundingClientRect()` en cada frame | `HomeIntro.tsx` |
| La regla "si el destino no está en pantalla, no hay vuelo" | `HomeIntro.tsx` |
| El atributo-contrato `data-hero-logo-mark` y su export | `HeroLogoSlot.tsx` |
| El import cruzado `HomeIntro` → `HeroLogoSlot` | `HomeIntro.tsx` |
| La estructura de tres capas que existía solo para que el logo pudiera quedarse | `HomeIntro.tsx` |

**El preloader volvió a una sola capa**, como estaba aprobado en la Parada 2 de S3: fondo, tinta y levantada sobre el mismo nodo, con el lockup entero adentro. Todo sube junto y desaparece.

**Los tres parámetros de `HOME_INTRO_PHASES` (2.5 / 1.0 / 2.5) quedaron intactos**, con su derivación proporcional y su anclaje a los tokens de S2 sin cambios.

**Verificado sobre el HTML servido:** `data-hero-logo-mark` aparece **0 veces**; el overlay del intro y el logo 2D del hero siguen presentes; sigue sin haber lock de scroll.

## El nuevo rol del logo 2D

Deja de ser "el logo del hero al que hay que calzarle el 3D" y pasa a ser **estado de carga y red de seguridad**:

- Visible desde el primer paint, server-rendered, en ambos breakpoints.
- Se ve mientras el 3D baja (la cadena completa puede tardar hasta 6 s).
- Queda como **único contenido** si el 3D falla, si el dispositivo no lo soporta, o con `prefers-reduced-motion`.
- **El reemplazo es un cambio simple**: el 2D se desvanece, el 3D aparece. Sin crossfade calibrado ni coincidencia de posición — **el 2D no tiene que calzar con nada**.

Se conserva el detalle que sí importa: el desvanecido se dispara con `onArtifactReady`, que es el ready **real** del canvas y **nunca** la red de seguridad de 6 s. Disparar por la red dejaría el hero sin logo: el 2D desaparecido y el 3D que nunca llegó.

## `logo-footprint.ts`: la calibración B se conserva, con otro rol

**No se revirtió.** No existía solo para sostener el vuelo: sirve al **encuadre del 3D dentro de su caja** —qué fracción de la caja ocupa el logo— y reemplazó a una fórmula ad-hoc (`clamp(1.02, aspect·0.78, 1.28)`) que además suponía una cámara declarada en otro archivo. En la versión nueva la cámara y la escala salen de la **misma constante** (`HERO_INBOX_CAMERA`), así que no pueden divergir — que es justamente lo frágil de la calibración A.

Lo que sí cambió es la documentación del contrato, porque **el contrato murió**:

- **A · canvas full-screen** (histórica): overlay 2D sobre canvas del tamaño de la ventana. Consumidores: `LogoStrokeOverlay`, `IntroLockupText`, `BrandedIntroCanvas`. Conserva sus dos divergencias conocidas con el hero legacy.
- **B · canvas in-box** (S3/S3b): encuadre del 3D en su caja cuadrada. La usa `HeroCanvas`.
- **Quién manda: ya no hay un "quién manda"**, porque ya no hay coincidencia exacta 2D↔3D que respetar. Si el 3D se encuadra distinto que el SVG, **no es un bug**. Lo único que sigue valiendo es no mezclar las dos calibraciones: elegir la equivocada no rompe el build, desencuadra el logo en runtime.

`HERO_LOGO_BOX_FRACTION = 1` se conserva porque sigue siendo un encuadre razonable (el logo llena su columna), no porque haya un contrato detrás. Moverlo ya no descalza nada.

## 3D habilitado en mobile — costo y riesgo

Se eliminó el gate `(min-width: 1024px)` de `HeroArtifactLayer`, en sus **dos** lugares: el `matchMedia` que impedía montar (y con eso, pedir el chunk) y el `hidden lg:block` del contenedor.

### Qué protegía el gate, además del breakpoint

**Protegía algo real, y queda escrito:** el docblock del propio componente registraba que *"la primera auditoría registró este canvas WebGL crasheando en emulación mobile"*.

Contrapeso que baja el riesgo: **el home que hoy está en producción ya monta un canvas WebGL en mobile.** El hero legacy (`Hero.tsx`, breakpoint 768) lo hace desde siempre. La diferencia es el HDRI: el legacy usa el preset de drei (CDN), el nuevo el self-hosteado de 1,6 MiB.

Contención: `CanvasErrorBoundary` atrapa cualquier error del árbol de r3f y deja el 2D como único contenido. **No** atrapa una pérdida de contexto WebGL ni una pestaña que el sistema mata por memoria.

### Cuánto se descarga en mobile

Medido sobre un build de producción real (`next build`, chunks minificados, gzip calculado sobre el archivo emitido):

| Qué | Minificado | Gzip |
|---|---|---|
| `three` (core) | 342 KiB | 83 KiB |
| `three` + `@react-three/fiber` | 144 KiB | 46 KiB |
| `three-stdlib`/SVGLoader + drei/RGBELoader | 73 KiB | 26 KiB |
| **Total JS del canvas** | **557 KiB** | **154 KiB** |
| HDRI `studio_small_03_1k.hdr` | 1.640 KiB (1,60 MiB) | 1.302 KiB (1,27 MiB) |
| **TOTAL sobre la red** | | **≈ 1,42 MiB** |

Todo eso es **diferido**: se pide en el primer hueco de idle después del primer paint, nunca durante la hidratación, y el `import()` sigue viviendo dentro del gate de `prefers-reduced-motion` (con eso activo no se descarga nada). Se mantienen `dpr={[1, 1.5]}` y `frameloop='demand'` fuera de viewport.

### ⚠ El costo que hay que mirar

**Hoy, en mobile, el slot del logo mide 80 px** (`w-20` en `HeroSection`). Se descargan ~1,42 MiB para renderizar una miniatura de 80 px. Es un mal negocio tal como está.

Si la coreografía quiere el logo como protagonista en mobile —como en la referencia—, **el tamaño del slot tiene que crecer**. Es una decisión de diseño y no se tomó acá; queda anotada en el propio `HeroSection.tsx`.

## Mouse-follow: desactivado sin tocar el frozen

`PointerSync` —el feed que escuchaba `pointermove` en toda la ventana y escribía `state.pointer` de r3f— se eliminó de `HeroCanvas.tsx`, que **no** es frozen.

Dónde quedó cada mitad:

- **La rotación por puntero vive dentro de `HeroArtifact.tsx`, que está FROZEN.** Sigue ahí, leyendo `state.pointer` en cada frame. No se tocó.
- **Su entrada vivía en `HeroCanvas`.** Sin el feed, `state.pointer` se queda en `(0,0)` y el componente frozen amortigua la rotación hacia 0: el logo queda de frente y quieto.

O sea: **el follow quedó neutralizado sin editar el archivo frozen**, y de paso se fueron tres listeners de ventana.

## Qué queda listo para el sprint de coreografía

**Dónde vive el logo y qué lo monta:**

```
HeroSection.tsx  (server component, columna derecha en lg / arriba del texto en mobile)
└─ HeroLogoSlot.tsx  (client — caja cuadrada, dueña del nodo que se mide)
   ├─ LogoMark  (SVG 2D, server-rendered: estado de carga + red de seguridad)
   └─ HeroArtifactLayer.tsx  (client, diferido por requestIdleCallback)
      └─ HeroCanvas.tsx  (dynamic, ssr:false)
         └─ <HeroArtifact phase="done" />   ← FROZEN
```

**Constantes que lo gobiernan:**

| Constante | Archivo | Qué controla |
|---|---|---|
| `HERO_LOGO_SCROLL` | `HeroLogoSlot.tsx` | Ventana de medición (`offset`), tramo del fade, opacidad y escala finales |
| `HERO_INBOX_CAMERA` | `logo-footprint.ts` | Cámara del canvas; la comparte con el cálculo de escala |
| `HERO_LOGO_BOX_FRACTION` | `logo-footprint.ts` | Qué fracción de su caja ocupa el logo |
| `heroInboxLogoScale()` | `logo-footprint.ts` | La escala derivada de las dos anteriores |

**Tres cosas que el sprint de coreografía necesita saber antes de escribir una línea:**

1. **🔴 El componente frozen se auto-congela con el scroll.** `HeroArtifact.tsx` tiene `isVisibleRef.current = window.scrollY <= window.innerHeight + 200` y su `useFrame` **sale temprano** si eso es falso. Pasado ~1 viewport de scroll, el objeto deja de actualizarse por completo. Para una coreografía manejada por scroll esto es el obstáculo principal: cualquier animación que deba seguir viva más allá de un viewport no va a correr, y no se puede cambiar desde adentro del archivo.
2. **La única entrada de rotación que el frozen expone es `state.pointer`.** Dos caminos: escribirlo desde el progreso de scroll (usa la entrada que ya existe, pero pelea con la amortiguación interna), o rotar el `<group>` padre desde afuera (no pelea con nada). El segundo es el que no toca el frozen.
3. **El carve-out de mobile en `HERO_LOGO_SCROLL` quedó superado pero sin tocar.** S3 pedía que el logo no se acercara ni alejara en mobile; S3b decidió que la animación va a ser la misma en ambos. No se cambió acá porque S3b desacopla y habilita, y dice explícitamente que la coreografía se construye en su propio sprint — es ese sprint el que lo resuelve, con las referencias delante. El `useMediaQuery(DESKTOP_QUERY)` de `HeroLogoSlot` existe solo para eso.

## Trampa de método nueva (costó tiempo real en este sprint)

**Un directorio de build fuera de `.gitignore` envenena la compilación entera.** Para medir el peso real del canvas corrí un build de producción aislado con `E2E_DIST_DIR=.next-s3b`. Ese nombre **no** está en `.gitignore` —que ancla `/.next/` de forma exacta y por eso lista `/.next-setter/` y `/.next-galeria/` una por una— así que Tailwind 4, que auto-detecta fuentes respetando `.gitignore`, se puso a escanear megabytes de JS minificado. Resultado: `./src/app/globals.css:4:1 — Module not found: Can't resolve './&'` y el home entero en 500, con el CSS intacto.

Dos síntomas que despistan: el error apunta a un archivo que está perfecto, y **borrar `.next` no lo arregla** mientras el directorio intruso siga existiendo. La cura es borrar el directorio intruso y recién ahí limpiar el caché.

Regla: si se usa `E2E_DIST_DIR`, usar uno de los nombres ya ignorados, o agregar el nuevo a `.gitignore` **antes** de correr el build.

## Verificación de S3b

```
.\node_modules\.bin\tsc.cmd --noEmit      → exit 0
.\node_modules\.bin\eslint.cmd <tocados>  → exit 0
```

Comprobado sobre el HTML que sirve el server: `data-hero-logo-mark` **0 veces** · overlay del intro presente · logo 2D presente · **0** ocurrencias de lock de scroll · titular correcto.

**Archivos tocados en S3b:** `HomeIntro.tsx`, `HeroLogoSlot.tsx`, `HeroArtifactLayer.tsx`, `HeroCanvas.tsx`, `HeroSection.tsx`, `LogoMark.tsx`, `logo-footprint.ts`, este reporte. **Ningún archivo borrado. Ningún frozen tocado.**

**Ningún archivo quedó huérfano por este desacople** — todos los tocados siguen teniendo consumidor.

**Compila y pasa tsc. La verificación visual la hace el humano en localhost.**

---

## Pendientes verificados EN NAVEGADOR por el humano (post-Parada de S3b)

Dos hallazgos de la verificación visual, **anotados a propósito sin arreglar**: los resuelve el sprint de coreografía.

### 1. 🔴 El mouse-follow SIGUE VIVO — cortar `PointerSync` no alcanzó

**Verificado en navegador: el logo 3D todavía sigue al puntero.** La afirmación de S3b de que quitar el feed lo neutralizaba **era incorrecta**, y la causa está identificada.

**Dónde busqué y qué descarté:**

| Candidato | Veredicto |
|---|---|
| `PointerSync` en `HeroCanvas.tsx` (feed propio sobre `window`) | **Descartado** — eliminado en S3b, y el follow persiste |
| `HeroArtifact.tsx:75-76` (frozen) | **Confirmado como LECTOR, no escritor.** Lee `state.pointer.x/y` en cada frame para `rotation`. No se toca |
| `Hero.tsx:81-91,150-151` (`MobileInputHandler`, `DesktopPointerSync`) | **Descartado** — pertenecen al hero LEGACY, que ya no se monta |
| `BrandedLogoWhite.tsx:53-54` | **Descartado** — es de Route B (marketing), otro canvas |

**La causa real: el sistema de eventos propio de r3f.** En `@react-three/fiber` v9, `<Canvas>` conecta sus eventos a su **propio div contenedor** cuando no se le pasa `eventSource`, y —el detalle decisivo— le pone `pointerEvents: 'auto'` a ese contenedor:

```js
// node_modules/@react-three/fiber/.../react-three-fiber.cjs.dev.js
:113  state.events.connect(eventSource ? ... : divRef.current)
:151  const pointerEvents = eventSource ? 'none' : 'auto'
```

O sea que **r3f venía actualizando `state.pointer` por su cuenta todo el tiempo.** El `pointer-events: none` que `HeroArtifactLayer` pone en su raíz no lo frena: un descendiente puede reactivar `pointer-events`, y r3f hace exactamente eso en su propio wrapper. La premisa del docblock original de `PointerSync` —*"el canvas va con pointer-events:none, así que r3f no actualiza state.pointer por su cuenta"*— **es falsa para esta versión**.

Diferencia observable respecto de antes: `PointerSync` escuchaba en `window` (el logo seguía al cursor por toda la pantalla); ahora r3f solo recibe eventos cuando el cursor está **sobre la caja del canvas**. El follow quedó más acotado, pero vivo.

**Camino recomendado para el próximo sprint (el repo ya tiene el patrón):** forzar `state.pointer` a cero en un `useFrame`, que es exactamente lo que hacen `Hero.tsx:164-165` y `BrandedLogoWhite.tsx:53-54` para dejar el logo head-on. Es la única forma de ganarle a un escritor que vive dentro de la librería, y no toca el archivo frozen. Alternativa: pasarle `eventSource` al `<Canvas>` (según la línea 151, eso pone su contenedor en `pointerEvents: 'none'`), pero hay que verificar qué implica para el resto del árbol.

### 2. El logo 2D no llega a verse en desktop local

**Síntoma:** en desktop, con caché caliente, el 3D aparece desde el primer frame y el 2D no se alcanza a percibir. **Puede ser correcto** (el 3D carga instantáneo) **o puede ser que el 2D nunca se monte.** Cómo distinguirlos, en orden de costo:

1. **¿Está en el HTML del servidor?** — `curl -s http://localhost:3000/ | grep -c 'M532 700v-67'`. Si da ≥ 2 (el intro y el hero), el 2D **se monta sí o sí en el primer paint**; es marcado del server, no depende de JS. *Ya medido en S3b: da 4.* Esto por sí solo descarta "nunca se monta".
2. **¿Cuándo se desvanece?** — en Elements, el div del 2D es `absolute inset-0` con `opacity` inline. Arranca en `1` y pasa a `0` **solo** cuando `onArtifactReady` dispara. Si se lo ve en `1` aunque sea un instante, el camino funciona.
3. **Prueba decisiva, que es la que importa** — DevTools → Network → tildar **Disable cache** + throttling **Slow 4G**, borrar `sessionStorage`, recargar. Hay que bajar ~1,42 MiB (154 KiB de JS + 1,27 MiB de HDRI): el 2D tiene que quedar visible varios segundos.

**El escenario que importa es mobile con red lenta, no desktop cacheado.** En desktop con caché caliente el reemplazo ocurre en un par de frames (`requestIdleCallback` + dos `requestAnimationFrame` ≈ 33 ms a 60 fps): **no verlo ahí es el resultado esperado, no un bug.** El 2D existe para el visitante con red mala, para el que el canvas le falla y para el que pidió movimiento reducido — ninguno de esos tres es un desktop local con todo cacheado.
