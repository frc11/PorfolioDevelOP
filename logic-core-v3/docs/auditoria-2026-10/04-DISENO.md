# 04 — Diseño: llevar el lenguaje del home v3 a las pantallas internas

> F3 del PROMPT. Fuente: rediseno/home @ `bead847c` (2026-10-15 16:36), leída con `git show`; **esa rama se mueve y sus tokens pueden cambiar hasta el merge**. Destino: las 79 pantallas internas de `origin/main` @ `57c421bc` (admin, portal del cliente, setter, auth y el widget). Fuentes de este documento: el censo léxico (`scripts/auditoria/censo-diseno.mjs` → `_crudo/censo-diseno.json`, con control positivo) y cuatro agentes de solo lectura (run `wf_e8d81676-d17`, `_crudo/f3-resultado.json`): dirección de escena (§7 completo de `DIRECCION-ESCENA.md`), tokens y motion de v3, destino y ruta en main, y el cruce de los 57 PLAN del sitio público (en `12-PLANEADO.md`). Las decisiones cerradas del home (sin dark mode, CTA siempre tinta, papel y tinta) **no se asumen** para el portal: van como preguntas en §4.

## Resumen

- **El sistema v3 no existe en main.** `theme-develop.css`, `/v3` y Chivo viven solo en rediseno/home. Al mergear, sus tokens `@theme` llegan a toda ruta y la familia del sitio pasa a Chivo también en el portal ([DIS-004]).
- **El destino casi no usa tokens.** En el cierre de las 79 pantallas hay 919 colores literales (hex 460, rgb 413 y 46 arbitrarios de Tailwind) contra **9 usos de `var(--…)`**, 8.120 clases de paleta (zinc 2.648, white 2.024, cyan 1.141), 673 tamaños de texto arbitrarios y 308 estilos inline.
- **El kit congelado no es re-tematizable de forma limpia** ([DIS-001], CNG-022). Hay una ruta sin tocarlo (capa de roles, puente de paleta, wrappers, migración por pantalla, §3), pero el tema claro limpio y el CTA tinta por defecto exigen editar `ui/*`: eso es decisión para Valentino.
- **Lo que se lleva tal cual** es el mecanismo, no la piel: foco visible único (con el anillo de dos tonos, [DIS-005]), salto al contenido y landmarks, las tres tintas por superficie, una sola política de movimiento reducido ([DIS-007]), `cn()` que conoce los tokens, el piso de 10 px, los breakpoints como bandas y el contraste re-derivado de los tokens con alfa.
- **Lo que no se lleva**: la escena 3D, la luz y el recorrido atado al scroll, el cursor propio, el scroll suave y la coreografía (14 de los 28 patrones de motion revisados).
- **Colores por servicio** (§10 #12 del plan): para main es correcto `raíz:CLAUDE.md:99-103`; `AGENTS.md:54-58` está mal y su permutación vive en código; v3 trae tres acentos nuevos ([DIS-008]).
- **Un bug probable del setter** salió de leer los shells: su lienzo lee `--color-void`, que el home deja en `light` ([DIS-003], VH-174).
- **Prioridad**: primero las decisiones (§4) y el banco visual ([DIS-006]); después shells y la capa de roles; las pantallas del cliente (portal, auth, widget) van antes que admin y setter (§5).

## 1. Censo del destino

Conteo léxico sobre la base, por página interna y el cierre de archivos que importa (los compartidos se repiten entre páginas a propósito: miden cuánto pesa cada pantalla). Total de archivos únicos: 1.007.

| Área | Páginas | Colores literales | Clases de paleta | Tamaños arbitrarios | Estilos inline |
|---|---|---|---|---|---|
| admin | 34 | 2.374 | 18.205 | 924 | 392 |
| portal | 32 | 6.509 | 21.587 | 1.535 | 1.641 |
| setter | 6 | 336 | 3.492 | 242 | 57 |
| auth | 6 | 131 | 355 | 34 | 37 |
| widget | 1 | 137 | 61 | 8 | 77 |

Archivos con más color literal: `src/modules/chatbot/components/embed/ChatbotEmbed.tsx` (49), `src/lib/design-tokens.ts` (47), `src/modules/chatbot/components/chat/ChatWindow.tsx` (42), `src/lib/client-notifications/templates.ts` (36), `src/app/(protected)/dashboard/modules/tienda-conectada/page.tsx` (32), `src/lib/email/templates/welcome-client.ts` (27), `src/modules/chatbot/components/avatar/LegacyNeuroAvatar.tsx` (24), `src/lib/email/templates/bot-activated.ts` (24). Varios son plantillas de email, donde el literal es obligatorio.

## 2. Tabla de transferencia

### Se lleva tal cual
- **Regla única de foco visible (el mecanismo, no el color).** Una sola regla `:focus-visible` emitida antes que los componentes, con tres tokens (`--color-foco`, `--foco-grosor: 2px`, `--foco-desplazamiento: 2px`). No hay ningún `outline: none` en el árbol, y `s3-foco` lo afirma. Hay un anillo forzado para la galería. En el home mide ≥3:1 en las 15 paradas. (v3:docs/rediseno/DIRECCION-ESCENA.md:1349; v3:src/app/theme-develop.css:1466-1478, 1500-1503, 1282-1283; v3:src/app/v3/_estilos/foco.css:22-31). *Por qué:* No depende de la paleta y el portal necesita foco visible igual (CLAUDE.md:35). El propio tema dice que una regla única sólo es barata si existe antes que los componentes (theme-develop.css:1475-1478). El valor del color se trata aparte, en se_adapta.
- **Enlace de salto, landmarks y orden de foco.** El salto es la parada 1 y se ve al enfocarlo (17,60:1). Se oculta con `clip-path`, no con `display:none`. `banner` es el propio envoltorio sticky, sin caja nueva. `navigation` queda fuera de `main` y cada sección lleva `aria-labelledby`, lo que la hace `region`. Hay un solo `h1`, ningún `tabindex` positivo y el `contentinfo` va fuera del `main`. (v3:docs/rediseno/DIRECCION-ESCENA.md:1356-1361, 1482-1483, 1611-1623; v3:src/app/v3/_estilos/foco.css:33-62). *Por qué:* En el home bastaron cinco paradas de navegación antes del contenido para justificar el salto (DE:1358). Un portal con sidebar tiene muchas más.
- **Toda superficie que redefine el fondo redefine las tres tintas.** Es «la trampa del tema». La sección invertida redefinía `--color-tinta` pero no `-media` ni `-tenue`, y eso daba 2,80:1 (el único fallo de AA del home) y 2,51:1. Con el arreglo pasan a 7,21:1 y 6,44:1. (v3:docs/rediseno/DIRECCION-ESCENA.md:1360, 1484; v3:src/app/theme-develop.css:1386-1400). *Por qué:* El portal va a tener más superficies que el home (tarjetas, modales, sidebar, toasts). Una superficie que redefine sólo la tinta primaria falla en silencio.
- **Una sola política de movimiento reducido.** Hay un único hook, `usePrefiereMenosMovimiento`, sobre `useSyncExternalStore`, con snapshot de servidor `true`. `ProveedorDeMovimiento` lo traduce a `MotionConfig` en el layout. Sin proveedor, `useReducedMotionConfig` cae al default `never` y la preferencia no se lee nunca. Con la preferencia puesta quedan 0 transformadas y el contenido entero sigue visible. (v3:docs/rediseno/DIRECCION-ESCENA.md:1854-1858, 1349; v3:src/app/v3/_lib/usePrefiereMenosMovimiento.ts:32, 51-52; v3:src/app/v3/layout.tsx:6). *Por qué:* El portal usa Framer Motion con las convenciones de CLAUDE.md:80-96, y CLAUDE.md no menciona reduced-motion. Si el layout del portal no monta el proveedor, aparece el mismo defecto.
- **`cn()` (tailwind-merge) tiene que conocer los tokens propios.** `cn()` descartaba en silencio un `text-<tamaño>` frente a un `text-<color>`, y un `font-<familia>` frente a los pesos `medio`, `semi` y `fuerte`. El arreglo está en `src/lib/utils.ts`: `extendTailwindMerge` con los 14 `--text-*` en el grupo font-size y los 3 pesos en font-weight, verificado sobre un corpus de 5.775 cadenas. (v3:docs/rediseno/DIRECCION-ESCENA.md:876-899). *Por qué:* `cn()` es compartido con el portal. Ya pasó dos veces, con el sistema viejo y con v3 (DE:889). Todo nivel o peso nuevo del portal tiene que entrar a esas listas.
- **Piso tipográfico de 10 px.** Ningún nivel fluido baja de `--text-micro` = 10 px. `--text-fluido-micro` caía a 8 px a 375 y se subió a 10 px, a costa de dejar de ser fluido. (v3:docs/rediseno/DIRECCION-ESCENA.md:1323, 1485, 1529; v3:src/app/theme-develop.css:550). *Por qué:* La densidad de tablas, badges y metadatos del portal empuja a bajar el tamaño. El piso vale igual.
- **Breakpoints como bandas, y decisiones de ancho en CSS.** Una clase que vale en una banda se escribe en par (`medio:x escritorio:x-neutro`). Un breakpoint es una pregunta con banda medida: si dos consumidores contestan bandas distintas, son dos cortes. Una celda de grilla vacía reserva ancho. La superficie por ancho va en media query y no en un hook de JS, porque `useAnchoMinimo` da `false` en el servidor y en la hidratación, y eso parpadea. (v3:docs/rediseno/DIRECCION-ESCENA.md:2200, 2223, 2157, 2124). *Por qué:* El portal colapsa sidebars, tablas y grillas por ancho, y tiene las mismas trampas.
- **Tokens con alfa: se transfiere la razón de contraste, no el alfa.** Copiar el alfa 0,38 de `--color-borde-fuerte` daba 2,37:1. Re-derivado a 0,47, da 3,01:1 sobre la peor superficie clara. (v3:src/app/theme-develop.css:268-286). *Por qué:* El glass actual del portal es todo alfa (`bg-white/[0.04]`, `border-white/[0.08]`, CLAUDE.md:97). Su contraste depende del fondo y hay que derivarlo para cada superficie.

### Se adapta
- **Color del anillo de foco.** En v3, `--color-foco` es `var(--color-tinta)` (#111111): 13,62:1 sobre claro y 18,00:1 en la invertida, donde se invierte solo. El propio tema acota la regla a `[data-v3]` porque sobre el zinc-950 del portal daría 1,0611:1, invisible. Deja escrito un disparador: «el día que el sistema gobierne el portal o exista un `--color-foco` del tema oscuro». (v3:src/app/theme-develop.css:296-305, 1485-1494). *Por qué:* Que el foco sea la tinta por referencia sirve tal cual. El valor depende de la base del portal (pregunta 1). Volver global la regla sin un foco del tema oscuro deja el portal sin foco visible.
- **Acentos por servicio: se lleva el mecanismo contextual, los valores no están decididos.** v3 tiene TRES acentos oscuros: web `#1D5B8F`, IA+automatización `#1B6B4C` y software `#57429E`. Sobre claro pasan AA como texto (peor 4,65:1). Sobre la invertida dan 2,71, 2,99 y 2,46: sirven como relleno o subrayado, nunca como texto ni como único límite. Todo consume `--color-acento` y lo resuelve un ancestro con `[data-servicio]`. El §5.2 se contradice: la línea 299 dice azul, verde y violeta (tres), y la 301 dice que los valores son los cuatro de CLAUDE.md (cian, esmeralda, ámbar, violeta). Además, «páginas internas» en el doc quiere decir las landings de servicio, no el portal. (v3:docs/rediseno/DIRECCION-ESCENA.md:283, 297-301; v3:src/app/theme-develop.css:306-344, 1326-1359; CLAUDE.md:100-103). *Por qué:* El mecanismo es lo más transferible: tres reglas en vez de tres copias del sistema. El set y los valores dependen de la base clara u oscura (preguntas 1, 3 y 4).
- **Un solo acento por cuadro.** «Lo que no puede haber son dos acentos en el mismo cuadro». Servicios pinta un servicio por vez. (v3:docs/rediseno/DIRECCION-ESCENA.md:1531). *Por qué:* En el home el contexto es la página. En el portal un cliente puede tener varios servicios en la misma vista (resumen, vitrina), así que hay que decidir a qué se ata el acento (pregunta 4).
- **Familias tipográficas.** Chivo para títulos y cuerpo, Chivo Mono en `--font-codigo` y Archivo en `--font-display`, auto-hospedadas con next/font/local en el envoltorio `[data-v3]`. §7.52: declarados en `:root`, los tokens resolvían vacíos y `/v3` pintaba con la Chivo de Google. La causa es que una custom property se resuelve donde se declara. Se arregló re-declarándolos en `[data-v3]`. Ningún instrumento afirma la familia computada. Archivo es un subset de sólo mayúsculas. El docblock de v3/layout.tsx todavía repite la premisa falsa. (v3:docs/rediseno/DIRECCION-ESCENA.md:1920-1926, 1930; v3:src/app/theme-develop.css:419-421, 443, 1506-1528, 1570-1575; v3:src/app/v3/layout.tsx:132-142). *Por qué:* Si el portal adopta estas familias, las variables de next/font tienen que existir en un ancestro del portal o en `:root`. Si no, hereda la Chivo de Google sin que nada lo marque. Archivo no sirve para texto en mayúsculas y minúsculas.
- **Escala tipográfica fluida.** Los niveles son `clamp()` entre `--fluido-piso` 375 y `--fluido-techo` 1440. Deuda sin ejecutar: el techo se evalúa en 1920 pero la caja se congela en 1984 (+1,26 px). Además, el piso de un `clamp()` no manda donde la recta pasa por arriba. (v3:docs/rediseno/DIRECCION-ESCENA.md:1942-1946, 2159-2168; v3:src/app/theme-develop.css:1215, 1327-1328). *Por qué:* Un portal de datos pide una escala densa y predecible. Conviene tomar los niveles chicos (micro, cuerpo) y dejar los display y su deuda (pregunta 6).
- **Vocabulario cerrado de curvas.** Hay seis curvas con nombre en `curvas.ts` (principal, entrada, simetrica, salida-fuerte, lineal, simetrica-suave) y se importan, no se copian. El gesto y el viaje son dos curvas a propósito: `expoOut` arranca a velocidad máxima y `power1.inOut` arranca en cero. (v3:docs/rediseno/DIRECCION-ESCENA.md:2265-2284; v3:src/app/v3/_lib/motion/curvas.ts:50-57, 151-157). *Por qué:* Se lleva el principio: vocabulario nombrado, importado y medido. Los valores chocan con el ease y los springs de CLAUDE.md:80-91 (pregunta 7).
- **Compuerta de motion: el contenido se escribe una vez.** `_contrato/coreografia.tsx` implementa las primitivas quietas y `coreografia-animada.tsx`, que es perezoso, las instala por contexto. Instala en vez de envolver, para no dejar la página en blanco mientras llega el chunk. (v3:docs/rediseno/DIRECCION-ESCENA.md:921-933). *Por qué:* El patrón sirve si el portal quiere animación sólo en escritorio sin escribir dos árboles. La coreografía de scroll no aplica.
- **Colores de estado.** El sistema es monocromo con una única excepción funcional: `--color-error` #E5484D y `--color-error-texto` #FF9592, siempre sobre tarjeta oscura. El semáforo (#FF5F57, #FEBC2E, #28C840) no es paleta del sistema: no tiene par de contraste y no se usa en texto. (v3:src/app/theme-develop.css:288-294, 346-358; v3:docs/rediseno/DIRECCION-ESCENA.md:234). *Por qué:* El portal necesita estados (tickets, pipeline, éxito, advertencia, info) que el home no tiene. Hay que derivarlos con el mismo método, por razón de contraste en cada superficie, y no sacarlos del semáforo.

### No se lleva
- **Escena 3D, luz y recorrido atado al scroll.** Incluye la celosía, el arco de luz con noche, las partículas, el anclaje de tramos a secciones y el apagado por visibilidad. (v3:docs/rediseno/DIRECCION-ESCENA.md:313, 695-728, 1158-1199, 1898-1916, 2292-2303). *Por qué:* El propio doc dice que las internas van «con movimientos y escenas propias». Además, una luz que cambia detrás del texto produjo 10 deudas de AA que hoy ningún instrumento cuenta.
- **Paleta de escena y excepción del cielo celeste.** Envolvente #3E3E40, niebla #EFEFEC, marcas de piso, partículas y el cielo #C8D5DF. (v3:docs/rediseno/DIRECCION-ESCENA.md:226-236). *Por qué:* Son colores de render, no de interfaz.
- **Composición del logo contra el texto y superficies papel-transparente/papel-opaco.** Incluye `travelX`, la superposición a 1,11:1, `superficieAngosta` y las anclas de progreso. (v3:docs/rediseno/DIRECCION-ESCENA.md:1376-1416, 1661-1705, 2111-2128). *Por qué:* En el portal no hay logo detrás del texto, así que el problema no existe.
- **«Nunca un velo ni una superficie intermedia detrás del texto».** Es una regla del home para preservar la escena. (v3:docs/rediseno/DIRECCION-ESCENA.md:1041). *Por qué:* En el portal las superficies (tarjetas, glass) son la interfaz misma. Lo que sí se lleva es medir el contraste contra la superficie real.
- **Pastilla de navegación flotante y menú de posición variable.** Es un envoltorio sticky de alto 0, nace a `100svh − 72px` y cambia de lado según la composición. (v3:docs/rediseno/DIRECCION-ESCENA.md:305-309, 935-937, 1305-1309, 1611-1621). *Por qué:* El portal tiene navegación persistente (sidebar o dock). Un menú que se mueve sirve a un recorrido narrativo, no a una herramienta.
- **Cursor propio.** `CURSOR_PROPIO_EN_EL_HOME` está en `false`. (v3:docs/rediseno/DIRECCION-ESCENA.md:937). *Por qué:* Está apagado incluso en el home, y en una herramienta no tiene lugar.
- **Scroll suave, viaje programático y scroll-padding de la pastilla.** `scroll-padding-top` de 72 px derivado de la pastilla, viaje de 4,0 s (4,6 s desde el clic) y una luz al aterrizar que depende del alto de la ventana. El doc se contradice sobre si /v3 tiene Lenis: «construye Lenis» en la línea 1882 contra «no tiene Lenis» en la 2319. (v3:docs/rediseno/DIRECCION-ESCENA.md:1201-1220, 2237-2256, 2284, 1882, 2319). *Por qué:* La navegación de un portal es instantánea, y 4,6 s no se puede aceptar ahí.
- **Bajadas que se encienden palabra por palabra, túnel de zoom y perspective/preserve-3d.** Bajada encendida palabra por palabra, túnel de capturas medido contra heatbureau y salida en z. (v3:docs/rediseno/DIRECCION-ESCENA.md:2307-2321). *Por qué:* Son ornamento de narrativa y tienen costo de render (CLAUDE.md:68-72).
- **Marcadores de contenido inventado leídos en voz alta.** `[CIFRA]`, `[CAPTURA]` y similares, deliberadamente con cara de inventados. (v3:docs/rediseno/DIRECCION-ESCENA.md:1364-1374). *Por qué:* En el portal los datos son reales: un dato ausente es un estado vacío con su texto (CLAUDE.md:31-34).

### Motion
- **Reutilizables en el portal** (14): Política única de movimiento reducido: usePrefiereMenosMovimiento (matchMedia, snapshot de servidor true) traducido a MotionConfigContext 'always'/'never' (`v3:src/app/v3/_lib/motion/ProveedorDeMovimiento.tsx:111-142`): Montar <ProveedorDeMovimiento> en el layout de /admin, /dashboard y /setter. Así todo motion.* y useReducedMotionConfig leen la misma preferencia. Hay que traer v3:src/app/v3/_lib/usePrefiereMenosMovimiento.ts:32-52. El archivo explica por qué no usa reducedMotion='user' (líneas 68-85). · politicaDeMovimiento + useMovimientoReducido: con la preferencia no se monta el motor ni se escribe transform (`v3:src/app/v3/_lib/motion/reducido.ts:55-126`): Con `const r = useMovimientoReducido()`, en toasts, paneles y cambios de estado: transition r ? {duration:0} (o sólo opacity) : normal. Es el patrón que ya usan TarjetaDeResultado.tsx:94 y volteo.ts:51. · Seis curvas power de GSAP como funciones JS (principal = power1.out, salida-fuerte = quíntica, etc.) (`v3:src/app/v3/_lib/motion/curvas.ts:107-120`): transition={{ ease: CURVAS.principal, duration: 0.2 }} para feedback en JS; en CSS, --ease-salida y --ease-principal. Hay que decidir UNA familia: CLAUDE.md fija [0.25,0.46,0.45,0.94] para reveals y el v3 mezcla tres vocabularios. · Cronograma: duracionAplicada, ventanaDeHijo, transicionEnTiempoReal (delay = i·escalonado) (`v3:src/app/v3/_lib/motion/cronograma.ts:65-131`): Escalonado de filas o tarjetas al montar: transition={transicionEnTiempoReal(i, {duracionDeclarada: 0.2, escalonado: 0.03, cantidad: n})} con opacity 0→1 e y 8→0, animando sólo las primeras ~10 filas. · Progreso 0→1 por reloj disparado por useInView (once:false, vuelve a 0 al salir) (`v3:src/app/v3/_lib/motion/useProgresoEnTiempoReal.ts:61-91`): Contadores de KPI que entran a pantalla: animate(motionValue, valorFinal, {duration: 0.6}) con useInView({once: true}); con reducido, valor final directo. · Invariante cero color, tamaño o duración fuera de tokens (`v3:src/app/v3/_lib/motion/__tests__/tokens-de-uso.invariant.ts:1-15`): Reutilizable como lint del dashboard: correr la misma regla sobre components/dashboard y las rutas de los portales. · «Verde por arnés»: afirmar que el camino de producción produce la preferencia, no sólo que el árbol la obedece (`v3:src/app/v3/_lib/motion/__tests__/reducido-produccion.tsx:1-15; v3:src/app/v3/_lib/motion/__tests__/reducido.invariant.tsx`): Método reutilizable al montar el proveedor en los portales. · [fuera de la carpeta] Rollover del CTA: dos copias (la B aria-hidden), ventana que crece 4 px, subrayado de dos capas, :hover y :focus-visible juntos; intercambio de 1,3 s (`v3:src/app/v3/_estilos/cta.css:55-319`): Hover y foco de acciones de texto. Se conserva la estructura (CtaEnlace, segunda copia aria-hidden). El intercambio de 1,3 s (cta.css:71) es narrativo: bajarlo a ≤ 250 ms o quedarse sólo con el subrayado scaleX 0→1 (whileHover/whileFocus en motion o transition CSS con --ease-principal). · [fuera de la carpeta] DosCopias: el mismo rollover en em para cualquier link (`v3:src/app/v3/_componentes/rollover/DosCopias.tsx:1-24; v3:src/app/v3/_estilos/rollover.css:4-50`): Items de navegación lateral, con la misma corrección de duración. · [fuera de la carpeta] Estado apretado: :active a opacity 0,6 sin transición (`v3:src/app/v3/_estilos/foco.css:142-147`): Tal cual en CSS, o whileTap={{ opacity: 0.6 }} con transition {duration: 0}. · [fuera de la carpeta] Volteo de estado con AnimatePresence mode='wait' (rotateX −90→0→90; reducido: opacity) (`v3:src/app/v3/_lib/formularios/volteo.ts:35-54; v3:src/app/v3/_chrome/contacto/FormularioDeContacto.tsx:274-281`): Transiciones de estado (formulario → enviando → resultado, vacío → datos): AnimatePresence mode='wait' con key por estado y opacity + y 4–8 px en 150–200 ms. El rotateX es teatral para un dashboard. · [fuera de la carpeta] Hoja modal: velo de opacidad 400 ms + hoja en y 700 ms con [0.77,0,0.175,1]; foco atrapado, Esc, foco devuelto en onExitComplete (`v3:src/app/v3/_chrome/contacto/FormularioDeContacto.tsx:42-44,65,204-240; v3:src/app/v3/_secciones/trabajos/demos/dialogo.ts:44-76; v3:src/app/v3/_chrome/contacto/apertura.ts:53-60`): Apertura de paneles y drawers con la misma estructura, en ~150 ms (velo) y ~250 ms (panel); reducido duration 0 (FormularioDeContacto.tsx:204-205). La curva hoy es un literal duplicado de --ease-principal. · [fuera de la carpeta] Tarjeta de resultado: texto con opacity + y 8 en 0,4 s [0.25,0.46,0.45,0.94]; barra de vida width 100→0 lineal; foco a Reintentar sólo si seguía en la tarjeta (`v3:src/app/v3/_componentes/formularios/TarjetaDeResultado.tsx:62-70,94,109-112`): Toasts (sonner ya está en las dependencias de main): misma entrada, barra de vida para el autocierre, y la regla de no robar el foco. · [fuera de la carpeta] Carga: logo girando en CSS 3D (2,4 s por vuelta), textos que rotan cada 900 ms en role=status, mínimo de 1400 ms (`v3:src/app/v3/_componentes/carga/Carga.tsx:34-37,80-96`): Espera de mutaciones. El mínimo de 1400 ms es largo para un panel (pregunta abierta). Depende de @/components/ui/LogoMark, que no existe en main..
- **Atados al scroll o a la escena** (14, no se llevan): Motor de progreso por scroll (scrollY → rango por anclas → useSpring sin rebote) · Anclas de ScrollTrigger → rango en píxeles · Escenografía de la ruta de demostración /v3/motion (svh por patrón) · Fotograma: progreso global → cronograma → tramo → curva → traducción por pieza · Traducción de claves GSAP (autoAlpha, yPercent, translateZ) a transform en orden GSAP · Patrones de tipografía P1 (línea por línea yPercent 120), P2 (bloque yPercent 60, 0,5 s), P3 (encendido palabra por palabra 0,3→1), P6 (cruce x 140→−140) · Patrones de piezas P4 (li y 100→0 + opacity, quíntica, escalonado 0,2), P5 (scale 0,8 lineal), P7/P8 (planos 3D translateZ −3000), P9 (grilla scale 0,4) · Familia de texto título, párrafo y etiqueta por línea o palabra con máscara · Divisor de líneas con copia sr-only y piezas aria-hidden; medición en dos fases con offsetTop · Época de medición (fuentes, resize con reposo de 150 ms, guardia de visibilityState) · Lente: perspective CSS igual al FOV 35° de la cámara 3D · Inercia: skewY de títulos según la velocidad de Lenis, con resorte exacto subamortiguado · Marca del chunk de coreografía · Resto de __tests__ (curvas, epoca, galeria, lineas, motion-bundle, motion-css, s19-lente, traduccion).

### Tipografía, foco, acentos y fuentes (v3)
- **Tipografía.** Familias: Chivo (títulos y cuerpo) y Chivo Mono (código), de Omnibus-Type, OFL 1.1, variables con un solo eje wght 100–900, métricas idénticas entre sí (x-height 511, cap 686) (v3:src/app/theme-develop.css:360-394,419-421). Cuarta familia Archivo wdth 62 sólo para el display del hero y sólo mayúsculas (68 puntos de código: cualquier minúscula cae al fallback) (v3:src/app/theme-develop.css:423-443); la itálica de Chivo también es un subset de mayúsculas, así que un `italic` con minúsculas cae al fallback (v3:src/app/v3/layout.tsx:234-237). Pesos: 300/400/500/600/700 como font-liviano…font-fuerte (v3:src/app/theme-develop.css:460-464). Escala fija de ocho niveles: micro 10, caption 12, cuerpo 15, base 1rem, titulo-s 20, titulo-m 32, titulo-l 44, titulo-xl 56 (v3:src/app/theme-develop.css:550-557), más seis fluidas con piso a 375, ancla a 1440 y techo a 1920 (v3:src/app/theme-develop.css:908-913). Ojo: arriba de 1440 el fluido supera al fijo (titulo-xl 65 contra 56) (v3:src/app/theme-develop.css:888-897). micro ya no es fluido (v3:src/app/theme-develop.css:843-852). Los niveles display/display-xl y sus variantes son del titular del hero, medidos contra su caja y el logo: no se transfieren. Interlineado: texto 1.6, titulo 1.09, micro 1.1, cartel 0.9 (sólo póster) (v3:src/app/theme-develop.css:972-980). Interletrado: titulo −0.03em, display −0.02em, texto −0.01em, micro +0.025em, el único positivo (v3:src/app/theme-develop.css:988-991). Cada nivel tiene interlineado e interletrado fijos en NIVELES_TIPOGRAFICOS (v3:src/app/v3/_lib/tipografia.ts:150-244), y lo consumen los componentes Titular y Textos (v3:src/app/v3/_componentes/tipografia/Titular.tsx:131-164; v3:src/app/v3/_componentes/tipografia/Textos.tsx:54-149). Requisito para transferirlo: el `cn()` de main no conoce estas clases, y `cn('text-fluido-micro','text-tinta-media')` se come el tamaño. En la rama, la lista de tamaños v3 está agregada a twMerge (v3:src/lib/utils.ts:40-87); en main no (src/lib/utils.ts:20-41). Queda abierta la compensación de cap height (720/686 = 1,0496) para los niveles de display (v3:src/app/theme-develop.css:497-523). Preguntas para el dashboard: (a) ¿tipografía fluida o fija? Fluida es coherente con el home; fija da densidad estable en tablas. Titular usa `fluido=true` por defecto (v3:src/app/v3/_componentes/tipografia/Titular.tsx:135). (b) ¿Cuerpo de 15 px o 14 px (text-sm) para tablas densas? 15 px es el token medido; 14 px obliga a agregar un nivel.
- **Foco.** Tokens: --color-foco = var(--color-tinta), --foco-grosor 2px y --foco-desplazamiento 2px (v3:src/app/theme-develop.css:305,1282-1283). La regla es `[data-v3] :focus-visible { outline: var(--foco-grosor) solid var(--color-foco); outline-offset: var(--foco-desplazamiento) }`, sin @layer (v3:src/app/theme-develop.css:1500-1504). Está acotada a /v3 a propósito: el anillo #111111 sobre el zinc-950 del portal da 1,0611:1 (v3:src/app/theme-develop.css:1484-1494). DEFECTO DOCUMENTADO: el tema y el Panel dicen que el anillo se invierte solo en la sección invertida (v3:src/app/theme-develop.css:296-305,1374-1377; v3:src/app/v3/_componentes/Panel.tsx:110-112). Es falso. --color-foco se resuelve una vez en :root a #111 y se hereda ya resuelto; medido: 1,0:1 sobre la noche de Trabajos y 1,16:1 dentro de `difference` (v3:src/app/v3/_estilos/foco.css:117-120). Es el mismo mecanismo que dejaba vacías las familias (v3:src/app/theme-develop.css:1517-1523). El arreglo vigente es un anillo de dos tonos, técnica C40: outline con var(--color-tinta) resuelto en el elemento, más un box-shadow de papel de desplazamiento + 2×grosor (v3:src/app/v3/_estilos/foco.css:122-132). Se ve sobre claro, sobre oscuro y sobre mezcla, así que es la pieza que más transfiere al dashboard, sea claro u oscuro. Piezas reutilizables: (1) estado forzado `data-forzado~=foco` para galerías y capturas (v3:src/app/v3/_estilos/foco.css:28-31); (2) salto al contenido con píldora, sombra flotante y z-cabecera (v3:src/app/v3/_estilos/foco.css:90-112; v3:src/app/v3/_chrome/SaltarAlContenido.tsx:80-90); (3) chip con checkbox sr-only que pinta el anillo con :has(:focus-visible) (v3:src/app/v3/_estilos/foco.css:136-140); (4) campo cuyo foco dibuja la caja (`data-foco=pastilla`); el foco es borde liso y el error borde punteado, para que no se confundan (v3:src/app/v3/_chrome/contacto/CamposDelContacto.tsx:56,81-82); (5) :active a opacity-casi sin transición (v3:src/app/v3/_estilos/foco.css:142-147); (6) el rollover del CTA se dispara también con :focus-visible (v3:src/app/v3/_estilos/cta.css:241-249); (7) un invariante prohíbe outline:none en todo el árbol (v3:src/app/v3/_estilos/foco.css:22-25). Para sacar el alcance [data-v3] en el portal hay dos caminos: declarar el foco donde cambia la tinta, o usar directamente la regla de dos tonos.
- **Acentos por servicio.** El v3 tiene TRES acentos: web #1D5B8F azul, ia-automatizacion #1B6B4C verde, software #57429E violeta. El ámbar está muerto: Automatización se pliega sobre IA (v3:src/app/theme-develop.css:51-52,326-328). Se consumen siempre por el alias --color-acento, con override por [data-servicio] en un ancestro (v3:src/app/theme-develop.css:344,1350-1360). El contrato de uso es relleno bg-acento, texto text-acento sólo sobre claro, y borde decorativo que nunca es el único límite (v3:src/app/v3/_secciones/_contrato/acento.ts:67-89). Reglas: una sola voz por vista y acento plano, sin gradiente, glow ni sombra de color (v3:src/app/theme-develop.css:159-167). Sobre claro los tres pasan AA como texto (peor 4,65:1). Sobre #0E0E0E dan 2,71, 2,99 y 2,46: no llegan ni a 3:1 de componente (v3:src/app/theme-develop.css:307-324,1446-1462). CONFLICTO A RESOLVER POR EL HUMANO: CLAUDE.md fija cuatro acentos (cyan #06b6d4, emerald #10b981, amber #f59e0b, violet #8b5cf6, "do not change"). main usa --color-accent #06b6d4 (main src/app/globals.css:301-319). Las demos del panel en el home copian ese look: fondo #080a0c, brillos cyan y emerald, ítem activo cyan, rótulo ámbar (v3:src/app/v3/_panel-vivo/MarcoDelPanel.tsx:11-15,22,65-76,128). Preguntas con trade-off: (1) ¿Paleta v3 o la de CLAUDE.md en el dashboard? La v3 está medida AA sobre claro y es coherente con el home, pero es otra marca que la de CLAUDE.md y que la que el home muestra en sus demos del panel. La de CLAUDE.md se ve más en oscuro, pero sus valores no tienen medición de contraste en el repo (estimo que cyan-500 sobre papel ronda 2,3:1 como texto; no medido). (2) Si el dashboard es oscuro, hay que emitir tres variantes claras con Y ≥ 0,19476 (el disparador [pendiente] escrito) (v3:src/app/theme-develop.css:1460-1464). (3) ¿"Un acento por vista" en un dashboard que lista los tres servicios? Opciones: un acento por pantalla (identifica, pero obliga a otra señal no cromática en vistas mixtas) o tinta + acento sólo como relleno de chips.
- **Fuentes.** La rama v3 (bead847c) carga las fuentes en dos capas. (1) Layout raíz: next/font/google con Chivo y Chivo_Mono, subset latin, variables --font-chivo-sans y --font-chivo-mono en el <html> (v3:src/app/layout.tsx:2-13,94-104). globals.css las mapea a --font-sans, --font-mono y --font-ds-sans/mono para TODO el sitio, portales incluidos (v3:src/app/globals.css:15-17,374-391). (2) Layout de /v3: next/font/local con los binarios auto-hospedados en v3/_fuentes/. Son tres familias en cuatro archivos: chivo-latin.woff2 (33.252 B) + chivo-italic-latin.woff2 (11.172 B, subset de mayúsculas) en una familia, chivo-mono-latin.woff2 (26.380 B) y archivo-display-latin.woff2 (10.180 B), todas con weight '100 900' y display swap (v3:src/app/v3/layout.tsx:102-142,239-277). Las variables --font-v3-* van en el <div data-v3>, no en <html> (v3:src/app/v3/layout.tsx:132-138,284). Por eso los tokens --font-* del @theme, que se resuelven en :root, quedaban vacíos y /v3 pintaba con la Chivo de Google. El arreglo es redeclarar las cuatro familias en [data-v3] (v3:src/app/theme-develop.css:1506-1575), y el mismo archivo anota que /v3 baja las dos Chivo, la de Google y la local (v3:src/app/v3/layout.tsx:139-142). Los .json de _fuentes son datos de glifos para el texto 3D de la escena (v3:src/app/v3/_lib/escena/ctaDelFinal/armadoDelCta.ts:4-5; v3:src/app/v3/_lib/escena/pie3d/armadas.ts:4) y no hacen falta en el dashboard. Licencia OFL 1.1 verificada (v3:src/app/theme-develop.css:366-377; v3:src/app/v3/_fuentes/OFL-chivo.txt, OFL-archivo.txt). EN MAIN (57c421bc) NO ESTÁ NADA DE ESTO: el layout raíz carga Geist y Geist_Mono por next/font/google (src/app/layout.tsx:2-11) y globals mapea --font-sans/--font-mono/--font-ds-* a Geist (src/app/globals.css:5-6,266-267); no existen src/app/theme-develop.css ni src/app/v3/. Para el dashboard, lo más limpio es servir Chivo y Chivo Mono con next/font/local desde el layout raíz, con las variables en <html>. Eso hace resolver los tokens en :root y convierte el bloque [data-v3] de familias en peso muerto, que es su disparador de borrado escrito (v3:src/app/theme-develop.css:1563-1565). Archivo no hace falta salvo que el dashboard use display en mayúsculas.

### Componentes de v3 reutilizables
- **Botón / CTA (Cta y CtaEnlace).** <button> y <a> separados, nunca anidados. Variantes medidas 'linea' y 'bloque'; registro 'cuerpo' (15 px semi) o 'rotulo' (mayúsculas + tracking-micro); deshabilitado con opacity-alta. Es texto con subrayado, sin relleno: no hay botón primario relleno ni destructivo. (v3:src/app/v3/_componentes/chrome/Cta.tsx:97-217; v3:src/app/v3/_lib/cta.ts:47-123; v3:src/app/v3/_estilos/cta.css:55-126,362-365). *Por qué:* Reutilizable como acción secundaria o enlace de acción. Para el dashboard faltan variantes primaria rellena, destructiva y de ícono, y los selectores están atados a [data-v3]. «CTA siempre tinta» (cta.ts:26-27) es decisión del home: queda como pregunta.
- **Botón de pastilla de la tarjeta de resultado.** «Reintentar»: rounded pastilla-s, border-current, px-5 py-2, hover y focus-visible invierten fondo y tinta. «Enviar otro»: micro subrayado. (v3:src/app/v3/_componentes/formularios/TarjetaDeResultado.tsx:97-105). *Por qué:* Es el único botón con borde y estado invertido del v3, la base más cercana a un botón secundario de dashboard. Hoy es inline, no es componente.
- **Tipografía (Titular, Cuerpo, Caption, Micro, TextoBase, EtiquetaDeSeccion).** Prop `como` obligatoria en Titular; niveles con interlineado e interletrado del sistema; prop `fluido`; data-nivel para invariantes. (v3:src/app/v3/_componentes/tipografia/Titular.tsx:102-164; v3:src/app/v3/_componentes/tipografia/Textos.tsx:54-149; v3:src/app/v3/_lib/tipografia.ts:150-255). *Por qué:* Reutilizable directo, siempre que se lleve la configuración de twMerge (v3:src/lib/utils.ts:40-87) y se defina el defecto de `fluido` para el dashboard.
- **Layout (Grilla y Envoltorio).** Grilla de 1–5 columnas o 'lateral' (140 px + 1fr), canales de 12/16 px; Envoltorio a sangre con padding de 32 px y contenido topado en 1920. (v3:src/app/v3/_componentes/layout/Grilla.tsx:37-85; v3:src/app/v3/_componentes/layout/Envoltorio.tsx:55-79). *Por qué:* Reutilizable. La columna 'lateral' es composición del home.
- **Campos de formulario (Pildora, chips, textarea).** label que envuelve el input; aria-invalid y aria-describedby al error; error con borde punteado y foco liso; maxLength igual al del servidor (MAXIMOS); chips como checkbox sr-only dentro de fieldset con legend sr-only; textarea con field-sizing de 2 a 8 líneas; scrollIntoView del campo con foco en móvil. (v3:src/app/v3/_chrome/contacto/CamposDelContacto.tsx:26-187). *Por qué:* El patrón es muy reutilizable. La forma de pastilla de 80 px y el layout de «preguntas numeradas» son del home (pregunta: densidad en formularios largos del admin).
- **Flujo de formulario con validación.** noValidate; validación pura al lado; corrige mientras escribe tras el primer intento; foco al primer inválido; UNA región role=alert (no una por campo); fases formulario/enviando/exito/error; conDuracionMinima. (v3:src/app/v3/_chrome/contacto/FormularioDeContacto.tsx:92-191,291,308-312; v3:src/app/v3/_chrome/contacto/enviarContacto.ts:30-48). *Por qué:* Reutilizable como patrón. El envío es fetch a /api (v3:src/app/v3/_lib/formularios/enviar.ts:27-46); en los portales, CLAUDE.md pide Server Actions con Zod.
- **Formulario de un campo (FormularioDeNovedades y NewsletterDelPanel).** Input email + botón de ícono con aria-label; aria-busy y Loader2 con motion-reduce mientras envía; dos regiones vivas (alert y status) que existen desde el principio. (v3:src/app/v3/_componentes/chrome/Novedades.tsx:48-104; v3:src/app/v3/_secciones/tu-panel/NewsletterDelPanel.tsx:18-80). *Por qué:* Reutilizable para búsquedas, invitaciones y filtros rápidos.
- **Tarjeta de resultado (éxito o error).** Ocupa el alto del formulario; foco a Reintentar; título en font-display mayúsculas; barra de cuenta para el autocierre. (v3:src/app/v3/_componentes/formularios/TarjetaDeResultado.tsx:28-116; v3:src/app/v3/_estilos/resultado.css:14-31). *Por qué:* Reutilizable si se desacopla de EncajeDelLogo (animación del logo) y de font-display (subset sólo mayúsculas). El rojo de error está pensado sobre tinta, no sobre papel.
- **Loader (Carga).** Tres tamaños, tinta o filo, role=status, textos que rotan, reducido = logo quieto. (v3:src/app/v3/_componentes/carga/Carga.tsx:11-96). *Por qué:* Reutilizable. Requiere traer LogoMark (no está en main) y decidir el mínimo de 1400 ms.
- **Cifra (KPI).** Valor (Titular) y rótulo (Micro en text-tinta-media, mayúsculas) en un solo <p>; el rótulo no se atenúa con opacidad. (v3:src/app/v3/_secciones/numeros/Cifra.tsx:12-71). *Por qué:* Es la base de una stat tile del dashboard. Hay que sacar el envoltorio Bloque P2 atado al scroll (Cifra.tsx:118-137).
- **Marco de tarjeta flotante.** overflow-hidden, rounded radius-fuerte×1,6, sombra de dos capas con la tinta al 25 %, contain-layout y contain-paint. (v3:src/app/v3/_secciones/tu-panel/Tarjeta.tsx:58-63). *Por qué:* La receta del marco es reutilizable. El componente no: se posiciona con TABLA_DEL_CAOS y P2 por scroll. Además la sombra se sale de los tokens (sólo existe --shadow-flotante).
- **Diálogo (useDialogo y VentanaDeDemo).** role=dialog y aria-modal en un portal; foco al primer control; Tab y Shift+Tab dan la vuelta; foco que se escapa vuelve; Esc cierra; html con overflow hidden; selector de focalizables que incluye campos. (v3:src/app/v3/_secciones/trabajos/demos/dialogo.ts:30-76; v3:src/app/v3/_secciones/trabajos/demos/VentanaDeDemo.tsx:17-24,196-205). *Por qué:* El hook es reutilizable para modales y confirmaciones destructivas. La ventana con Genie es del home.
- **Salto al contenido.** Enlace oculto con clip-path que aparece fijo en :focus-visible, en píldora con sombra flotante. (v3:src/app/v3/_chrome/SaltarAlContenido.tsx:78-90; v3:src/app/v3/_estilos/foco.css:90-112). *Por qué:* Reutilizable directo en los layouts de los portales.
- **Contrato de acento.** CLASES_DE_ACENTO (relleno, texto, borde), FORMAS_PERMITIDAS_SOBRE_OSCURO = sólo relleno, CLASE_TINTA_SOBRE_ACENTO = text-fondo. (v3:src/app/v3/_secciones/_contrato/acento.ts:47-89). *Por qué:* La regla es reutilizable para badges y chips de servicio. El valor de los acentos está en conflicto con CLAUDE.md.
- **Tablas.** No hay ninguna tabla en _secciones ni en el sistema v3. La única <table> es la demo TablaDeConversaciones, con zinc-800/zinc-500 y estilo del dashboard viejo. (v3:src/app/v3/_panel-vivo/demos/chatbot/TablaDeConversaciones.tsx:41-57). *Por qué:* No reutilizable como sistema v3: la tabla del dashboard hay que diseñarla con los tokens.
- **Marco del panel en el home (_panel-vivo).** Carcasa del dashboard COPIADA, no importada, de components/dashboard/DashboardLayoutClient y SidebarNav: fondo #080a0c, cyan y emerald, rounded 28px. (v3:src/app/v3/_panel-vivo/MarcoDelPanel.tsx:11-22,65-76,86-131). *Por qué:* No es v3. Consecuencia: si F3 cambia el look del dashboard, estas copias quedan desfasadas y el home sigue mostrando el panel viejo.
- **Secciones (Panel, Seccion, CabeceraDeSeccion, MarcaDeSeccion).** <section> con aria-labelledby, superficies papel u oscuro, opaca o transparente, pinneo sticky y solape en svh. (v3:src/app/v3/_componentes/Panel.tsx:61-145; v3:src/app/v3/_secciones/_contrato/Seccion.tsx:184-239; v3:src/app/v3/_secciones/_contrato/Rotulo.tsx:71-103). *Por qué:* No reutilizable: atado al registro SECCIONES, al scroll y a la escena (superficies transparentes). Sí transfiere el mecanismo data-seccion=invertida para paneles oscuros.
- **Piezas de coreografía (GraficoDeTorta, RodilloDeEstados, CtaQueRota, CtaTransformado, CtaDelFinal).** Torta experimental con números a mano; rodillo de cuatro estados disparado por scroll; CTA cuyo rótulo rota con el servicio; CTA dibujado por la escena WebGL. (v3:src/app/v3/_secciones/servicios/GraficoDeTorta.tsx:10-16; v3:src/app/v3/_secciones/servicios/RodilloDeEstados.tsx:16-25; v3:src/app/v3/_secciones/servicios/CtaQueRota.tsx:18-30; v3:src/app/v3/_componentes/ctaDelFinal/CtaDelFinal.tsx:12-17). *Por qué:* Atados al scroll o a la escena; no reutilizables.
- **Lector de tokens en JS.** leerToken, pixelesDe (rem → px) y milisegundosDe. (v3:src/app/v3/_secciones/tu-panel/tokens.ts:7-26). *Por qué:* Utilidad mínima reutilizable para animaciones JS que leen duraciones y espacios del tema.

## 3. Ruta de implementación sin tocar `src/components/ui/*`

Conclusión: el kit src/components/ui/* (43 archivos en main 57c421bc) casi no tiene capa semántica. Lo cuenté con grep sin comentarios, mirando solo referencias de color: de 469, 12 son semánticas (var(--…) o tokens ds-* de @theme), el 2,6 %; 395 son clases de paleta de Tailwind (zinc/white/black/cyan/emerald/amber/rose/red/violet/blue/indigo), el 84,2 %; y 62 son literales hex/rgba en clases arbitrarias o en style, el 13,2 %. Las 12 semánticas están todas en Button.tsx, en las variantes ds-primary/ds-secondary y los tamaños ds/ds-compact (Button.tsx:53-70, :91-97). Esas variantes son del sitio público y el portal no las usa (Button.tsx:10-13). En lo que el portal pinta, la capa semántica es 0 %.

Sí hay un camino sin editar ui/*. Tailwind 4.3.1 declara su paleta, radios, sombras y blur en `@theme default`, sin inline (node_modules/tailwindcss/theme.css:1, :248, :322-323, :400-412, :476-482). Así, `bg-zinc-950` y `bg-white/[0.02]` consumen var(--color-zinc-950) y var(--color-white), y redefinir esas variables en un ancestro retiñe la utilidad. Está medido en v3:src/app/theme-develop.css:80-89.

El kit de portal son 27 archivos: los 26 con estilos que exporta el barrel más EmptyStateMuted. Con un "puente de paleta" de ese tipo se alcanza mecánicamente el 99,2 % de sus referencias de color (389 de 392). Lo único fuera de alcance son los 3 rgba cian de Card.tsx:31 y :57. Los radios de escala (rounded-lg/xl/2xl/3xl/full), shadow-lg/2xl y backdrop-blur-xl/2xl también son variables. No lo son el `rounded`, `shadow` y `backdrop-blur` sin sufijo, que son inline (theme.css:503-509), ni los valores arbitrarios (rounded-[28px], text-[10px], tracking-[0.2em], backdrop-blur-[20px]).

El problema es que el remapeo no es semántico. El mismo paso de paleta cumple roles opuestos: zinc-950 es texto sobre acento en Button.tsx:36, Badge.tsx:20 y Tabs.tsx:80, y es superficie en Modal.tsx:47, Card.tsx:32 y Toggle.tsx:40. Invertir los neutros obliga también a oscurecer los acentos, o se rompe el contraste.

Tipografía: ningún componente del kit de portal fija familia, salvo font-mono en SectionErrorBoundary.tsx:82 y :93. Heredan --font-sans, que es Geist en globals.css:5. Los tamaños son de escala más micro-tamaños arbitrarios.

Fuera del kit de portal quedan 13 archivos de marketing, casi todos literales, y 3 que no pintan nada (index.ts, skeletons/index.ts, field-context.ts). El barrel lo usan ~160 imports: admin 50, setter 43, dashboard 42, components/dashboard 14 y el módulo chatbot ~13. Ojo con la proporción: el kit es una porción chica del portal. Las pantallas fuera de ui/* suman ~7.600 referencias de paleta: admin 3.143, components/dashboard 1.571, chatbot 1.141, setter 928, dashboard 760 y components/admin 88. El 0,8 % de literales es solo del kit.

- **0. Decisiones de Valentino antes de cualquier token. Las cerradas del home NO se trasladan al portal. Preguntas con trade-off: (a) ¿oscuro, claro papel/tinta o ambos? El kit es solo oscuro; el claro obliga a invertir neutros Y oscurecer acentos; ambos duplica el QA. (b) ¿CTA siempre tinta? Ya existe sin editar ui/* vía ds-primary, pero pierde la señal cian de 'acción', que hoy comparten foco, tabs y selección. (c) ¿Voz única de acento? Choca con los estados semánticos que un dashboard necesita (éxito/atención/error/info, design-tokens.ts:6-16); v3 solo trae error y semáforo. (d) ¿Glass o plano? CLAUDE.md:97 lo prescribe; DESIGN.md:211 lo prohíbe en el sitio público. (e) ¿Chivo también en el portal? v3 lo da por aprobado (v3:src/app/globals.css:376-383); hay tablas densas (globals.css:478-482) y micro-textos de 9-11px. (f) ¿Radios 0/9 o los 16-28 actuales?**
  - Archivos: Ninguno: solo decisiones.
  - Riesgo: Sin estas respuestas la capa no tiene valores; asumir las del home repite el error que la consigna prohíbe.
- **1. Capa de roles del portal: `@theme static` con prefijo propio (canvas, panel, fg, fg-muted, rule, control-stroke, accent, on-accent, success, warning, danger, info, foco, radios y sombras), en dos capas paleta→rol como hace B1, con scopes `[data-portal-theme='…']` sin @layer. Si v3 se mergea, los valores pueden apuntar a sus tokens de función (fondo, superficie, tinta, borde).**
  - Archivos: Nuevo src/app/portal-theme.css importado desde src/app/globals.css justo después de tailwindcss (el mismo patrón que v3:src/app/globals.css:2-12), o un bloque en globals.css. src/lib/utils.ts (DS_FONT_SIZE_CLASSES, :20) si se agregan tamaños --text-*.
  - Riesgo: Con `@theme` a secas se podan los tokens leídos por var() (globals.css:29-34). Con `@theme inline` el override no llega (v3:src/app/theme-develop.css:80-89). Un text-<nombre> nuevo colisiona en twMerge si no se registra (globals.css:135-138).
- **2. Puente de paleta, la única palanca que re-tematiza ui/* sin editarlo: dentro del scope, redefinir las variables de Tailwind que usa el kit (--color-white/black, --color-zinc-50…950, --color-cyan-100…500 y, si cambian los estados, red/rose/emerald/amber/blue/violet/indigo, más --radius-lg…3xl, --shadow-lg/2xl y --blur-xl/2xl) para que apunten a los roles.**
  - Archivos: El mismo CSS del paso 1.
  - Riesgo: No es semántico. zinc-950 es texto sobre acento (Button.tsx:36, Badge.tsx:20, Tabs.tsx:80) y a la vez superficie (Modal.tsx:47, Card.tsx:32, Toggle.tsx:40). Un tema claro exige oscurecer los acentos o rompe el contraste. Retiñe también las ~7.600 referencias de las pantallas (deseable pero masivo). No alcanza los literales: Card.tsx:31 y :57, rounded-[28px] de los skeletons, y `rounded`, `shadow` y `backdrop-blur` sin sufijo, que son inline (theme.css:503-509). Remapear --radius-2xl cambia Card y Button juntos.
- **3. Dónde vive el atributo: en <html>, puesto por un componente cliente que lo limpia al desmontar y que se monta en los 3 shells. El atributo se repite en la raíz del shell para el primer pintado SSR.**
  - Archivos: Nuevo src/components/portal/PortalThemeScope.tsx. Montaje en src/app/(protected)/admin/_components/AdminLayoutClient.tsx, src/components/dashboard/DashboardLayoutClient.tsx y src/app/(protected)/setter/_components/setter-shell.tsx.
  - Riesgo: Modal y Select portalean a document.body (Modal.tsx:57,109; Select.tsx:353,418), igual que otros 24 archivos del portal con createPortal: un scope en el div del shell no los cubre. El ThemeProvider del home escribe data-theme en <html> sin limpiarlo (src/hooks/useThemeObserver.tsx:15-21); no repetir ese patrón. :has() en la raíz recalcula todo, así que no conviene. Tampoco importar overrides de :root por layout: posible fuga del CSS al volver al sitio público (no verificado acá).
- **4. Shells: reemplazar literales por roles (lienzo, velo de gradientes, panel glass, header, footer) y revisar el Toaster.**
  - Archivos: AdminLayoutClient.tsx:30-41, :46, :97, :104; DashboardLayoutClient.tsx:51-62, :109, :124-127, :171, :179; setter-shell.tsx:28, :35, :69; src/app/(protected)/setter/layout.tsx:44-75; setter/_components/shortcuts-help.tsx:37, :80; admin-sidebar.tsx y admin-topbar.tsx (no leídos acá); src/app/layout.tsx:125-134 (Toaster con theme="dark" y background #090a0f).
  - Riesgo: El Toaster es global y cualquier cambio afecta al sitio público (hay que condicionarlo). El setter depende hoy de --color-void legacy. El footer text-zinc-700 sobre #080a0c da ≈1,9:1 (calculado, no medido) y no pasa AA.
- **5. Wrappers fuera de ui/ para lo que el puente no resuelve bien. Ejemplos: CTA tinta = buttonClasses({variant:'ds-primary', size:'ds-compact'}) (Button.tsx:53-58, :97, :110-120), como hace design-system/CtaButton.tsx:5 y :80-81. Card, Input, Textarea, Skeleton y Badge aceptan className y cn() resuelve los conflictos de la raíz.**
  - Archivos: Nuevos src/components/portal/*, importados por ruta directa (el barrel ui/index.ts está congelado: docs/client-portal/lane-portal-pulido-log.md:106).
  - Riesgo: Solo se sobrescribe la raíz. Modal no tiene className (Modal.tsx:10-24) y Toggle tampoco (Toggle.tsx:38-40). Los internos (header del Modal :82-93, dropdown del Select :370, badge de Tabs :78-80, valores de Stat y StatCard) quedan con su paleta. Además duplica APIs.
- **6. Aprovechar el precedente de EmptyStateMuted: su implementación está fuera de ui/.**
  - Archivos: src/components/dashboard/results/_shared/ResultEmptyState.tsx:39-47, :61-66 (38 consumidores, 30 de portal).
  - Riesgo: Bajo: es editable y tiene una sola fuente.
- **7. Migración por pantalla: pasar las clases de paleta a roles a medida que cada pantalla se rediseña, con visual-qa en desktop y mobile por pantalla (CLAUDE.md, Subagentes). Orden sugerido: setter (81 tsx, 928 refs, el shell ya lee una variable) → dashboard (81 tsx de app con 760 refs + 84 de components/dashboard con 1.571) → admin (191 tsx, 3.143) + módulo chatbot (96 tsx, 1.141).**
  - Archivos: src/app/(protected)/{setter,dashboard,admin}/**, src/components/{dashboard,admin}/**, src/modules/chatbot/components/**.
  - Riesgo: Volumen alto. Durante la transición conviven pantallas con rol y con paleta. Sin un banco, cada remapeo es una regresión a ciegas. La zona setter/LeadOS es de Franco.
- **8. Banco visual del kit: una página que renderice ui/* y los wrappers bajo cada tema, con chequeo de contraste por token.**
  - Archivos: Nueva ruta, con auth, dentro de src/app/(protected)/admin/ o como extensión de src/app/styleguide/.
  - Riesgo: /styleguide es pública y sin auth (page.tsx:19-27) y hoy no renderiza ui/*. /admin/_design se borró (c3b150ab).
- **9. Higiene que bloquea decisiones (fuera de F3, para anotar).**
  - Archivos: logic-core-v3/AGENTS.md:54-58 y :60-62; src/lib/design-tokens.ts:94-98; src/modules/chatbot/prisma/seed.ts:222-226; comentario de globals.css:56-58; docs/design-system.md; tailwind.config.ts (muerto: no hay @config).
  - Riesgo: Si no se corrigen, la capa nueva hereda la permutación equivocada y la falsa creencia de que design-tokens ya llega a Tailwind.

### Lo que solo se logra editando `ui/*` (decisión para Valentino)
- **Kit semántico de verdad.** Migrar los internos de ui/* de clases de paleta a clases de rol: ~25 archivos, 377 referencias del kit de portal. Es el único camino para que claro/oscuro sea solo CSS y no dependa del puente de paleta. (Conteo: 12 de 469 referencias son semánticas, todas en Button.tsx:53-70 (variantes ds-*); ui/* es read-only según docs/client-portal/relevamiento-6-secciones.md:34). *Por qué:* Descongelar ui/* es decisión de Valentino. Sin descongelarlo, el tema del portal queda atado a reinterpretar zinc, white y cyan.
- **Separar 'texto sobre acento' de 'superficie'.** zinc-950 cumple los dos roles. Un tema claro limpio necesita un rol on-accent propio. (Button.tsx:36; Badge.tsx:20, :25, :30; Tabs.tsx:80 (texto) contra Modal.tsx:47, Card.tsx:32, Toggle.tsx:40 (superficie)). *Por qué:* El puente de paleta no puede mandar el mismo paso a dos valores distintos según el uso.
- **CTA primario por defecto.** variant 'primary' fija bg-cyan-400 text-zinc-950. Hacer tinta el default exige editar. La alternativa sin editar es usar ds-primary con un wrapper. (Button.tsx:36 contra :53-58). *Por qué:* Si 'CTA siempre tinta' se adopta para el portal, conviene que sea el default del kit y no un wrapper paralelo (sus 32 imports seguirían en cian).
- **Formas por componente.** Radios arbitrarios en los skeletons. Card y Button comparten rounded-2xl, así que remapear --radius-2xl los mueve juntos; un radio distinto por tipo (superficie contra control, como en B1) exige editar. (skeletons/CardSkeleton.tsx:11, ListSkeleton.tsx:13, TableSkeleton.tsx:10 (rounded-[28px]); StatCardSkeleton.tsx:5 (rounded-[26px]); Card.tsx:23; Button.tsx:88). *Por qué:* Separar superficie de control es una decisión de forma, no de color.
- **Glow y brillo cian literal.** Las sombras rgba(6,182,212,…) de Card highlighted y glow no se alcanzan por variables. (Card.tsx:31, :57). *Por qué:* Si el portal adopta 'acento plano, sin glow' (DESIGN.md:137), solo se logra editando.
- **Glass.** El blur de -xl/-2xl se puede anular remapeando --blur-*, pero no el `backdrop-blur` sin sufijo (inline en Tailwind) ni backdrop-blur-[20px]. (Card.tsx:28-31; Modal.tsx:46; Select.tsx:370; node_modules/tailwindcss/theme.css:503-504). *Por qué:* Si el portal pasa a plano, quedan restos de vidrio que no se pueden apagar desde fuera.
- **API de tematización.** Agregar className o surface a Modal y Toggle, y slots o className para los internos de Select y Tabs. (Modal.tsx:10-24; Toggle.tsx:5-17, :38-40; Select.tsx:330-335, :370). *Por qué:* Sin esto, esos componentes no se pueden envolver: solo remapear o editar.
- **Escala tipográfica micro.** text-[9px], text-[10px] y text-[11px] más tracking-[…] arbitrarios, sin token. (Badge.tsx:66-68; Stat.tsx:41-44; Typography.tsx:11; Card.tsx:82; PageHeader.tsx:59; Tabs.tsx:78; SectionErrorBoundary.tsx:82, :93). *Por qué:* Una escala de portal por tokens (o el cambio a Chivo con otras métricas) no corrige esos tamaños sin editar.
- **Título con gradiente.** La variante gradient de PageHeader pinta white→cyan con bg-clip-text. (PageHeader.tsx:64-68). *Por qué:* Choca con 'no bg-clip-text con gradiente' (DESIGN.md:292) si esa regla se extiende al portal.

### Shells de los portales
Base común (layout raíz):
- <html> lleva las variables de Geist (src/app/layout.tsx:72-74) y <body> solo `antialiased` (:82).
- globals.css:321-328 pinta el body con var(--color-void) y var(--color-obsidian).
- La familia llega por el preflight: --default-font-family → --font-sans → Geist (globals.css:5).
- Ningún shell fija familia, ninguno usa ds-* ni data-ds-theme, y los tres se montan `fixed inset-0` encima.
- v3 cambia --font-sans a Chivo para todo el sitio, portal incluido (v3:src/app/globals.css:16-17, :376-383).

ADMIN:
- src/app/(protected)/admin/layout.tsx es server: auth SUPER_ADMIN (:41-49), cuenta alertas y revisión (:52-55) y monta AdminLayoutClient + PageTransition (:57-66).
- AdminLayoutClient.tsx:
  - Lienzo: `fixed inset-0 z-[80] bg-[#080a0c] text-zinc-100` (:30). z-index literal, aunque design-tokens.ts:240 define appShell=80.
  - Velo inline de 3 gradientes rgba, cian 0,08 y esmeralda 0,05 (:34-40).
  - Hamburguesa glass bg-zinc-900/90 backdrop-blur (:46).
  - Aside de 240px (:62).
  - Panel principal glass en capa hermana: rounded-[28px], border-white/10, bg-white/[0.03], shadow rgba, backdrop-blur-md (:97); main con p-4/sm:p-6 (:99).
  - Footer text-xs text-zinc-700 (:104): ≈1,9:1 sobre #080a0c, calculado; no pasa AA.
- Impone: lienzo #080a0c literal, texto base zinc-100, lenguaje glass y radio 28px. Ninguna variable.

DASHBOARD:
- src/app/(protected)/dashboard/layout.tsx es server: org, preview, banners y onboarding (:65-129) y monta DashboardLayoutClient (:131-158).
- src/components/dashboard/DashboardLayoutClient.tsx es copia del admin:
  - Lienzo `bg-[#080a0c] text-zinc-100 selection:bg-cyan-500/30` (:51), con zIndex.appShell por style (:52).
  - El mismo velo (:60-62).
  - Header glass h-16, rounded-2xl, border-white/10, bg-white/5, backdrop-blur-xl (:109).
  - Avatar cian con rgba inline (:124-127).
  - Panel glass rounded-[28px] (:171).
  - Footer text-zinc-700 (:179).
- Impone lo mismo que el admin, todo literal.

SETTER:
- src/app/(protected)/setter/layout.tsx es server: solo rol SETTER (:32-34). El topbar se arma en el server: glass rounded-2xl, bg-white/5, backdrop-blur-xl (:44); marca cian (:46); 'LeadOS' text-white (:50-52); eyebrow text-[10px] tracking-[0.24em] zinc-600 (:53); badge bg-cyan-500 text-black (:68).
- setter-shell.tsx:
  - Lienzo `fixed inset-0 bg-[var(--color-void)] text-zinc-100` (:28). Es el ÚNICO shell que lee una variable, y es la legacy del sitio.
  - Rail de 240px glass: border-r, bg-white/5, backdrop-blur-xl (:69).
  - Contenido sin panel glass, max-w-6xl, py-8 (:75-78).
  - shortcuts-help.tsx:37 y :80 también usan var(--color-void).
- Riesgo PLAUSIBLE, a confirmar en runtime: --color-void cambia con [data-theme] en <html> (globals.css:301-319; light = #fafafa). El ThemeProvider del home lo escribe con 'light' por defecto y nunca lo limpia (src/hooks/useThemeObserver.tsx:15-21). El login redirige por server action (src/app/login/actions.ts:111), o sea con navegación blanda. Si se llega al setter desde el home sin recarga, el lienzo podría salir #fafafa con texto zinc-100.

Común a los tres: modales y selects portaleados a <body> con zIndex.modal 10000 (design-tokens.ts:245; Modal.tsx:65), fuera de cualquier scope que se ponga en el shell.

### `src/components/design-system/` y `/styleguide`
Qué es src/components/design-system/ (13 archivos): las primitivas editoriales del sitio público B1. Son SectionShell, Eyebrow, ChapterLabel, DisplayHeading, Subhead, Lead, CtaButton, Surface, DataStat, MonoLabel, RuleDivider y accent.ts, más index.ts.
- SectionShell escribe data-ds-theme en su <section> (SectionShell.tsx:84) y llama useThemeSectionOptional (:78).
- CtaButton envuelve las variantes ds-* de ui/Button: importa en CtaButton.tsx:5, mapea en :80-81 y usa buttonClasses() en :105 y Button en :113.
- accent.ts mapea text/bg/border-ds-accent-* (accent.ts:23-42).

Tokens que usa: solo los ds-* del @theme static de globals.css (:36-268). Son 52 usos, con 0 clases de paleta y 0 literales. Usa:
- color de rol: bg-ds-canvas/panel, text-ds-fg/fg-muted, border-ds-rule, ds-control-stroke;
- escala tipográfica editorial con clamp() (globals.css:154-182);
- radio 0 en superficie y 9px en control (:69-70);
- py-ds-section, px-ds-gutter, max-w-ds-page/lead.

index.ts:9 dice que no lo consume ninguna sección. En main lo importan sections/cierre/{Cierre,ContactoCta}.tsx, sections/nosotros/Nosotros.tsx y sections/servicios/{data.ts,Servicios.tsx}, pero ninguna está montada (src/app/page.tsx:1-46 no las importa). En la práctica solo se renderiza en /styleguide.

src/app/styleguide/ (10 archivos):
- Es una página interna noindex, sin auth y sin links entrantes (page.tsx:19-27), con data-ds-theme="dark" en :39.
- Muestra paleta, la decisión de acentos (AccentPermutations), tipografía, ComponentStates y esqueletos del home.
- Son 220 usos ds-*, 0 paleta y 0 literales.
- No importa ningún archivo de ui/*: ComponentStates solo usa design-system.

¿Sirven como capa nueva sin tocar ui/*?
- Como mecanismo, sí:
  - dos capas, paleta literal → rol semántico (globals.css:222-235);
  - inversión por atributo, con reglas sin @layer para ganarle al @layer theme (:270-298);
  - `@theme static` contra el tree-shaking (:29-34);
  - el patrón de wrapper fuera de ui/ que reusa una receta de ui (CtaButton);
  - el aviso de registrar tamaños nuevos en twMerge (globals.css:135-138, src/lib/utils.ts:20-44).
- Como inventario, no:
  - no tiene input, select, textarea, toggle, tabla, badge, modal, tabs, toast ni estados vacío/carga/error;
  - su escala es de display (clamp 3,25-7rem) y sus reglas son del sitio público (DESIGN.md:2), no de pantallas densas.
- El styleguide tampoco sirve de banco del portal, porque no renderiza ui/*. El playground que sí lo hacía (/admin/_design) se borró en c3b150ab (2026-06-28).

En v3 (bead847c) cambian los valores:
- base papel por defecto, Chivo y 3 acentos (v3:src/app/globals.css:30-117, :376-383);
- se agregan design-system/motion/*;
- aparece un archivo de 89 tokens aparte con roles de función: fondo, superficie-1..3, tinta, tinta-media, borde, borde-fuerte, error, foco y acento-* (v3:src/app/theme-develop.css:150-344).

Hoy lo consume solo /v3 (v3:src/app/globals.css:2-11), pero al ser @theme static emite en :root para todo el sitio. Es el candidato natural a fuente de valores de una capa de portal si se mergea v3.

## 4. Decisiones abiertas (preguntas con trade-off, no tomadas)

1. **¿Qué base de color tiene el portal, y tiene dark mode?**
   - Opciones: (a) Claro, papel #F7F7F5 con tinta #111111, como el home. (b) Oscuro, usando la sección invertida como base (#0E0E0E y #F7F7F5). (c) Los dos, con `prefers-color-scheme` o un toggle.
   - Trade-off: (a) Unifica la marca, y el foco y los acentos de v3 andan tal cual. A cambio cambia la piel de todo lo existente: el glass es blanco sobre oscuro, y hay usuarios que pasan horas en el panel. (b) Conserva la continuidad con el zinc-950 actual y el foco se invierte solo (18:1). A cambio, los tres acentos de v3 caen a 2,46–2,99:1 y sólo sirven de relleno. (c) Duplica la verificación de contraste en cada superficie, y hoy no hay instrumento que la haga: Modo pulido sacó la verificación de composición (DE:2286-2290). theme-develop.css no tiene ningún `prefers-color-scheme`.
   - Fuente: v3:docs/rediseno/DIRECCION-ESCENA.md:226-234; v3:src/app/theme-develop.css:176-179, 1386-1388, 1488-1489; CLAUDE.md:97
2. **¿El CTA primario del portal es siempre tinta?**
   - Opciones: (a) Tinta, como en el home. (b) Relleno con el acento del servicio. (c) Color semántico según la acción (primaria, destructiva).
   - Trade-off: Tinta da jerarquía sin color y AA garantizado, pero en un portal con varias acciones por pantalla cuesta separar primaria, secundaria y destructiva (CLAUDE.md:33 exige confirmación en las destructivas). El acento ayuda a orientarse, pero en base oscura no llega a 3:1 cuando es el único límite. El semántico exige crear tokens de estado que hoy no existen.
   - Fuente: v3:src/app/v3/_estilos/cta.css:211-213; v3:src/app/theme-develop.css:314-323; CLAUDE.md:33
3. **¿Qué set de acentos usa el portal?**
   - Opciones: (a) Los tres de v3: azul, verde y violeta oscuros, con IA y automatización fusionadas. (b) Los cuatro de CLAUDE.md: cian, esmeralda, ámbar y violeta. (c) Un juego por cada base.
   - Trade-off: Cálculo propio con la fórmula WCAG, no publicado en el repo: sobre papel #F7F7F5, los cuatro de CLAUDE.md dan ≈2,3 (cian), 2,4 (esmeralda), 2,0 (ámbar) y 4,0 (violeta), así que fallan AA como texto en base clara. Sobre zinc-950 #09090B dan ≈8,2, 7,8, 9,3 y 4,7, y pasan. Los tres de v3 son el espejo: pasan en claro y fallan en oscuro. El set depende de la pregunta 1. Además hay que decidir si el portal separa Automatización (ámbar) de IA o adopta la fusión de v3. El doc mismo no lo resuelve: DE:299 contra DE:301.
   - Fuente: v3:docs/rediseno/DIRECCION-ESCENA.md:299-301; v3:src/app/theme-develop.css:326-328; CLAUDE.md:100-103
4. **¿A qué se ata el acento: a la página, al módulo o al objeto?**
   - Opciones: (a) Al servicio activo de la ruta, con `[data-servicio]` en un ancestro. (b) Portal neutro, con el acento sólo como etiqueta de servicio en las tarjetas. (c) Un único acento de marca, el azul por defecto.
   - Trade-off: (a) Hace del color una estructura, como pide §5.2, pero las vistas de resumen con varios servicios rompen «un acento por cuadro». (b) Respeta esa regla y el monocromo, pero pierde el «mundo por servicio». (c) Es simple, pero borra la estructura que §5.2 quiere.
   - Fuente: v3:docs/rediseno/DIRECCION-ESCENA.md:297-303, 1531; v3:src/app/theme-develop.css:1329-1340
5. **¿Qué tipografía usa el portal: Chivo, Chivo Mono y Archivo auto-hospedadas, o la Chivo de Google que ya baja en el layout raíz?**
   - Opciones: (a) Pasar next/font/local al layout raíz, que es el disparador que el propio tema deja escrito. (b) Re-declarar las familias en el envoltorio del portal. (c) Quedarse con Google.
   - Trade-off: (a) Hay una sola carga y los tokens resuelven en `:root`, pero toca el layout raíz del sitio vivo. (b) Queda aislado, pero si alguien se olvida repite el defecto de §7.52 sin que nada lo marque. (c) No cuesta trabajo, pero /v3 ya sirve dos familias casi iguales (doble peso). En los tres casos Archivo, que sólo trae mayúsculas, no sirve para tablas ni formularios.
   - Fuente: v3:src/app/v3/layout.tsx:132-142; v3:src/app/theme-develop.css:1555-1575; v3:docs/rediseno/DIRECCION-ESCENA.md:1920-1930
6. **¿La escala tipográfica del portal es fluida o fija?**
   - Opciones: (a) Los mismos `clamp()` del home. (b) Niveles fijos y densos, tomando micro, cuerpo y caption.
   - Trade-off: La fluida es el mismo sistema que el home, pero en tablas un tamaño que cambia con el viewport mueve columnas y cortes de línea, y además arrastra la deuda del techo (1920 contra 1984). La fija es predecible, pero son dos escalas que mantener, y `cn()` tiene que conocer las dos.
   - Fuente: v3:docs/rediseno/DIRECCION-ESCENA.md:1942-1946, 1323, 893; v3:src/app/theme-develop.css:550, 1327-1328
7. **¿El motion del portal usa las curvas de v3 o los springs de CLAUDE.md?**
   - Opciones: (a) Las seis curvas de `curvas.ts`. (b) El ease [0.25,0.46,0.45,0.94] y los springs de CLAUDE.md. (c) Curvas de v3 para transiciones y springs sólo para la UI.
   - Trade-off: Unificar da un solo lenguaje de producto, pero las curvas de v3 se calibraron para un recorrido de scroll. Los springs de CLAUDE.md son de UI, y `AnimatePresence mode="wait"` agrega latencia percibida en una herramienta. Cualquiera sea la opción, aplica la política única de reduced-motion.
   - Fuente: v3:docs/rediseno/DIRECCION-ESCENA.md:2265-2284; v3:src/app/v3/_lib/motion/curvas.ts:50-57; CLAUDE.md:80-96
8. **¿Sobrevive el glassmorphism?**
   - Opciones: (a) Se mantiene el glass actual. (b) Superficies opacas con tokens. (c) Se adopta el vidrio de v3 (`_estilos/vidrio.css` existe en bead847c; no lo leí).
   - Trade-off: El glass sobre zinc oscuro es la identidad actual del portal. Sobre papel claro, `bg-white/[0.04]` no se ve. Con alfa, el contraste de bordes y texto hay que re-derivarlo en cada superficie.
   - Fuente: CLAUDE.md:97; v3:src/app/theme-develop.css:268-286

## 5. Priorización por pantalla

Impacto para el cliente: portal, auth y widget 3; admin 2; setter 1 (herramienta interna y zona de Franco). Esfuerzo por volumen de estilo literal en el cierre de la pantalla (colores literales + clases de paleta + tamaños arbitrarios + inline), en tercios: S ≤ 633, M ≤ 897, L > 897. Puntaje = impacto ÷ esfuerzo (S=1, M=2, L=3); a igual puntaje va primero la de menos volumen. La prioridad real depende de las decisiones de §4 y de tener el banco visual ([DIS-006]).

| # | Pantalla | Área | Archivos | Congelados que usa | Colores literales | Paleta | Tamaños arbitrarios | Inline | Impacto | Esfuerzo | Puntaje |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `reset-password` | auth | 12 | 0 | 21 | 43 | 5 | 9 | 3 | S | 3.00 |
| 2 | `accept-invite` | auth | 8 | 0 | 23 | 44 | 5 | 10 | 3 | S | 3.00 |
| 3 | `cambiar-password` | auth | 18 | 5 | 9 | 70 | 6 | 0 | 3 | S | 3.00 |
| 4 | `forgot-password` | auth | 13 | 0 | 39 | 39 | 5 | 8 | 3 | S | 3.00 |
| 5 | `bienvenida` | auth | 16 | 0 | 7 | 95 | 7 | 0 | 3 | S | 3.00 |
| 6 | `login` | auth | 9 | 0 | 32 | 64 | 6 | 10 | 3 | S | 3.00 |
| 7 | `embed/[slug]` | widget | 44 | 0 | 137 | 61 | 8 | 77 | 3 | S | 3.00 |
| 8 | `(protected)/admin/clients/[clientId]/chatbot/[[...tab]]` | admin | 33 | 7 | 13 | 101 | 10 | 4 | 2 | S | 2.00 |
| 9 | `(protected)/admin/referrals` | admin | 32 | 7 | 13 | 132 | 12 | 4 | 2 | S | 2.00 |
| 10 | `(protected)/admin/messages` | admin | 44 | 8 | 28 | 147 | 13 | 5 | 2 | S | 2.00 |
| 11 | `(protected)/admin/messages/[orgId]` | admin | 51 | 8 | 38 | 192 | 15 | 6 | 2 | S | 2.00 |
| 12 | `(protected)/admin/chatbots/new` | admin | 86 | 14 | 89 | 215 | 17 | 32 | 2 | S | 2.00 |
| 13 | `(protected)/admin/chatbots` | admin | 63 | 16 | 19 | 348 | 16 | 8 | 2 | S | 2.00 |
| 14 | `(protected)/admin/fg2-lab` | admin | 62 | 29 | 63 | 469 | 26 | 8 | 2 | S | 2.00 |
| 15 | `(protected)/admin/settings/reports` | admin | 56 | 29 | 62 | 480 | 25 | 8 | 2 | S | 2.00 |
| 16 | `(protected)/admin/leados/setter/[setterId]` | admin | 62 | 29 | 62 | 485 | 25 | 8 | 2 | S | 2.00 |
| 17 | `(protected)/admin/settings/alerts` | admin | 56 | 29 | 62 | 501 | 25 | 8 | 2 | S | 2.00 |
| 18 | `(protected)/admin/clients/[clientId]/edit` | admin | 74 | 29 | 72 | 500 | 21 | 12 | 2 | S | 2.00 |
| 19 | `(protected)/admin/chatbot/activity` | admin | 63 | 29 | 74 | 494 | 30 | 8 | 2 | S | 2.00 |
| 20 | `(protected)/admin/announcements` | admin | 58 | 29 | 62 | 521 | 23 | 8 | 2 | S | 2.00 |
| 21 | `(protected)/admin/team` | admin | 58 | 30 | 62 | 522 | 23 | 8 | 2 | S | 2.00 |
| 22 | `(protected)/admin` | admin | 55 | 29 | 92 | 496 | 23 | 13 | 2 | S | 2.00 |
| 23 | `(protected)/admin/tickets` | admin | 62 | 30 | 62 | 535 | 27 | 9 | 2 | S | 2.00 |
| 24 | `(protected)/dashboard/cuenta` | portal | 209 | 24 | 184 | 549 | 38 | 45 | 3 | M | 1.50 |
| 25 | `(protected)/dashboard/resultados` | portal | 209 | 24 | 184 | 549 | 38 | 45 | 3 | M | 1.50 |
| 26 | `(protected)/dashboard/modules/email-marketing` | portal | 210 | 24 | 188 | 552 | 38 | 46 | 3 | M | 1.50 |
| 27 | `(protected)/dashboard/modules/email-marketing/campaigns/[id]/send` | portal | 215 | 24 | 195 | 567 | 38 | 48 | 3 | M | 1.50 |
| 28 | `(protected)/dashboard/chatbot/knowledge` | portal | 212 | 24 | 190 | 578 | 39 | 46 | 3 | M | 1.50 |
| 29 | `(protected)/dashboard/modules/email-marketing/campaigns/new` | portal | 214 | 24 | 198 | 572 | 39 | 48 | 3 | M | 1.50 |
| 30 | `(protected)/dashboard/resultados/reputacion` | portal | 216 | 24 | 184 | 600 | 44 | 45 | 3 | M | 1.50 |
| 31 | `(protected)/dashboard/chatbot/conversations` | portal | 214 | 25 | 190 | 603 | 40 | 46 | 3 | M | 1.50 |
| 32 | `(protected)/dashboard/referidos` | portal | 212 | 25 | 184 | 620 | 43 | 45 | 3 | M | 1.50 |
| 33 | `(protected)/dashboard/chatbot/install` | portal | 215 | 24 | 190 | 619 | 41 | 46 | 3 | M | 1.50 |
| 34 | `(protected)/dashboard/modules/email-marketing/campaigns` | portal | 213 | 25 | 205 | 599 | 45 | 48 | 3 | M | 1.50 |
| 35 | `(protected)/setter/leads/[leadId]` | setter | 59 | 24 | 56 | 433 | 22 | 9 | 1 | S | 1.00 |
| 36 | `(protected)/setter/nuevo` | setter | 62 | 24 | 56 | 438 | 23 | 9 | 1 | S | 1.00 |
| 37 | `(protected)/setter/leads/[leadId]/manual` | setter | 76 | 24 | 56 | 457 | 25 | 9 | 1 | S | 1.00 |
| 38 | `(protected)/setter/nuevo/importar` | setter | 63 | 24 | 56 | 467 | 23 | 9 | 1 | S | 1.00 |
| 39 | `(protected)/admin/chatbot/health` | admin | 75 | 29 | 75 | 525 | 28 | 8 | 2 | M | 1.00 |
| 40 | `(protected)/admin/tickets/[ticketId]` | admin | 73 | 29 | 84 | 532 | 24 | 9 | 2 | M | 1.00 |
| 41 | `(protected)/admin/audit-log` | admin | 62 | 30 | 62 | 555 | 29 | 9 | 2 | M | 1.00 |
| 42 | `(protected)/admin/alerts` | admin | 70 | 30 | 72 | 545 | 31 | 10 | 2 | M | 1.00 |
| 43 | `(protected)/admin/settings` | admin | 63 | 29 | 64 | 569 | 25 | 8 | 2 | M | 1.00 |
| 44 | `(protected)/admin/clients` | admin | 68 | 30 | 70 | 594 | 27 | 11 | 2 | M | 1.00 |
| 45 | `(protected)/admin/projects/[projectId]/payments` | admin | 77 | 29 | 66 | 605 | 25 | 8 | 2 | M | 1.00 |
| 46 | `(protected)/admin/leados` | admin | 67 | 29 | 62 | 603 | 35 | 8 | 2 | M | 1.00 |
| 47 | `(protected)/admin/leados/[leadId]` | admin | 82 | 29 | 66 | 616 | 27 | 10 | 2 | M | 1.00 |
| 48 | `(protected)/admin/projects/[projectId]` | admin | 75 | 29 | 66 | 622 | 34 | 8 | 2 | M | 1.00 |
| 49 | `(protected)/admin/projects` | admin | 69 | 29 | 71 | 637 | 31 | 11 | 2 | M | 1.00 |
| 50 | `(protected)/admin/projects/[projectId]/hours` | admin | 78 | 30 | 66 | 657 | 27 | 8 | 2 | M | 1.00 |
| 51 | `(protected)/admin/projects/[projectId]/tasks` | admin | 79 | 30 | 66 | 678 | 29 | 8 | 2 | M | 1.00 |
| 52 | `(protected)/admin/leads` | admin | 96 | 30 | 75 | 764 | 40 | 12 | 2 | M | 1.00 |
| 53 | `(protected)/dashboard/modules/email-marketing/contactos` | portal | 217 | 25 | 212 | 592 | 42 | 54 | 3 | L | 1.00 |
| 54 | `(protected)/dashboard/modules/agenda-inteligente` | portal | 212 | 25 | 207 | 597 | 40 | 58 | 3 | L | 1.00 |
| 55 | `(protected)/dashboard/messages` | portal | 219 | 24 | 206 | 613 | 45 | 46 | 3 | L | 1.00 |
| 56 | `(protected)/dashboard/modules/tienda-conectada` | portal | 214 | 25 | 225 | 591 | 45 | 63 | 3 | L | 1.00 |
| 57 | `(protected)/dashboard/resultados/analisis` | portal | 228 | 29 | 198 | 659 | 51 | 48 | 3 | L | 1.00 |
| 58 | `(protected)/dashboard/cuenta/boveda` | portal | 220 | 24 | 196 | 671 | 57 | 45 | 3 | L | 1.00 |
| 59 | `(protected)/dashboard/cuenta/facturacion` | portal | 214 | 24 | 184 | 680 | 63 | 45 | 3 | L | 1.00 |
| 60 | `(protected)/dashboard/plan` | portal | 214 | 24 | 184 | 699 | 49 | 46 | 3 | L | 1.00 |
| 61 | `(protected)/dashboard/soporte` | portal | 224 | 30 | 208 | 678 | 46 | 48 | 3 | L | 1.00 |
| 62 | `(protected)/dashboard/soporte/[ticketId]` | portal | 227 | 29 | 208 | 669 | 57 | 48 | 3 | L | 1.00 |
| 63 | `(protected)/dashboard/chatbot/leads` | portal | 224 | 25 | 195 | 696 | 47 | 47 | 3 | L | 1.00 |
| 64 | `(protected)/dashboard/modules/motor-resenas` | portal | 224 | 25 | 227 | 653 | 45 | 61 | 3 | L | 1.00 |
| 65 | `(protected)/dashboard/chatbot/leads/[id]` | portal | 223 | 25 | 190 | 710 | 51 | 46 | 3 | L | 1.00 |
| 66 | `(protected)/dashboard/project` | portal | 220 | 30 | 188 | 727 | 47 | 49 | 3 | L | 1.00 |
| 67 | `(protected)/dashboard/chatbot/settings` | portal | 225 | 25 | 231 | 688 | 42 | 55 | 3 | L | 1.00 |
| 68 | `(protected)/dashboard/services` | portal | 216 | 25 | 191 | 716 | 61 | 53 | 3 | L | 1.00 |
| 69 | `(protected)/dashboard/cuenta/perfil` | portal | 225 | 24 | 202 | 727 | 49 | 52 | 3 | L | 1.00 |
| 70 | `(protected)/dashboard/resultados/seo` | portal | 231 | 24 | 209 | 727 | 52 | 46 | 3 | L | 1.00 |
| 71 | `(protected)/dashboard/resultados/trafico` | portal | 234 | 29 | 200 | 754 | 57 | 49 | 3 | L | 1.00 |
| 72 | `(protected)/dashboard` | portal | 247 | 25 | 187 | 893 | 60 | 51 | 3 | L | 1.00 |
| 73 | `(protected)/dashboard/chatbot` | portal | 338 | 25 | 369 | 1439 | 86 | 123 | 3 | L | 1.00 |
| 74 | `(protected)/admin/clients/new` | admin | 128 | 29 | 159 | 723 | 36 | 48 | 2 | L | 0.67 |
| 75 | `(protected)/admin/leads/[leadId]` | admin | 96 | 30 | 72 | 851 | 40 | 9 | 2 | L | 0.67 |
| 76 | `(protected)/admin/clients/[clientId]` | admin | 112 | 30 | 79 | 857 | 50 | 12 | 2 | L | 0.67 |
| 77 | `(protected)/admin/chatbots/[botId]` | admin | 272 | 30 | 226 | 1134 | 55 | 46 | 2 | L | 0.67 |
| 78 | `(protected)/setter` | setter | 89 | 24 | 56 | 679 | 63 | 11 | 1 | M | 0.50 |
| 79 | `(protected)/setter/leads/[leadId]/manual/[paso]` | setter | 145 | 24 | 56 | 1018 | 86 | 10 | 1 | L | 0.33 |

## 6. Colores por servicio (resuelve el punto 12 de §10 del plan)

- **Correcto para main:** Para main es correcto raíz:CLAUDE.md:99-103: Web = cian #06b6d4, IA = verde/esmeralda #10b981, Automatización = ámbar #f59e0b, Software = violeta #8b5cf6. Coincide con globals.css, con el home y con las cuatro landings, y es la 'permutación A' del Gate 1, ya cerrado (DESIGN.md:120-125; src/components/design-system/accent.ts:8-11). Matiz: la landing de Software usa sobre todo índigo #6366f1 y no el violeta #8b5cf6, y DESIGN.md:125 lo anota.
- **Equivocado:** Está mal logic-core-v3/AGENTS.md:54-58, que da IA = violeta #8b5cf6, Automatizaciones = esmeralda #10b981 y Software = ámbar #f59e0b. La misma permutación equivocada vive en código:
- src/lib/design-tokens.ts:94-98 (colors.service, que solo lee zIndex);
- src/modules/chatbot/prisma/seed.ts:222-226 (routeColorMap del bot: /ai-implementations → #8b5cf6, /process-automation → #10b981, /software-development → #f59e0b). Afecta al color del widget por landing.

Hay además un comentario viejo en globals.css:56-58 ('PENDIENTE GATE 1 … NO resolver acá') que contradice accent.ts:8-11.

En v3 (bead847c) quedan viejos los DOS docs. v3 mata el ámbar, junta IA y Automatización en verde y cambia todos los hex (v3:src/app/globals.css:96-117: web #1D5B8F, ia #1B6B4C, software #57429E; v3:src/app/theme-develop.css:326-328; v3:src/components/design-system/accent.ts). Sin embargo v3:CLAUDE.md:99-103 sigue con los 4 hex de main, y v3:accent.ts dice que los valores están 'congelados en CLAUDE.md'.
- **Citas:** globals.css:60-63 (ds-accent-web #06b6d4, ia #10b981, automation #f59e0b, software #8b5cf6).

src/components/sections/home/OurServices.tsx: :76-77 (/web-development #06b6d4), :94-95 (/ai-implementations #10b981), :112-113 (/process-automation #f59e0b), :130-131 (/software-development #8b5cf6).

Landings (recuento con grep):
- src/components/ia/*: verde (#00ff88 ×38, #34d399 ×22, emerald-300 ×20, #10b981 ×9; por ejemplo HeroIA.tsx:613 y :700). Cero violeta.
- src/components/automation/*: ámbar (amber-500 ×83, #f59e0b ×63; HeroAutomation.tsx:44 y :1282). Esmeralda solo como 'ROI positivo' (CalculadoraAutomation.tsx:889).
- src/components/software/*: índigo/violeta (#6366f1 ×53, #7b2fff ×30; HeroSoftware.tsx:346 y :378).
- web: cian (src/app/web-development/page.tsx:118-120; sections/web-development cyan-300 ×49).

Docs: DESIGN.md:17-20 y :120-125; accent.ts:8-11.

## 7. Docs previos del sistema

- **raíz:DESIGN.md: qué decidió.** Su alcance es 'develOP — sitio público'. Decidió: monocromo cálido con inversión oscuro↔crema por sección; radio 0 en superficies y 9px en controles; sin glassmorphism ni backdrop-blur; CTA primario = tinta invertida con relieve de 2 capas; acento de servicio solo sobre oscuro y una sola voz por vista; Gate 1 cerrado con la permutación A; Geist + Geist Mono. (DESIGN.md:2, :97-101, :109, :125, :135-150, :211, :233, :242, :291-300). *Por qué:* Es el único DESIGN.md y no menciona admin, dashboard ni setter. Sus reglas chocan con el lenguaje glass y de radios grandes que el portal declara (CLAUDE.md:97; logic-core-v3/AGENTS.md:45-51) y usa. En v3 el archivo no cambió (idéntico en bead847c), aunque v3 pasó a papel, Chivo y 3 acentos, así que quedó viejo también para el home.
- **raíz:DESIGN.md: qué sigue pidiendo.** Deja abierta la observación del violeta (4,64:1 sobre oscuro, desparejo contra 7,7-9,1). Pide 'agregar el token, no un valor suelto'. (DESIGN.md:158, :287). *Por qué:* El portal no tiene ni un token de rol: todo es paleta o literal. Esa regla, aplicada al portal, es exactamente la capa que falta.
- **docs/design-system.md (v1.0, 2026-05-18): qué decidió.** Dark mode nativo con glass sutil, un único acento cian #06b6d4, radios de 16-24px (rounded-2xl/3xl), border-white/10. Tokens desde @/lib/design-tokens, componentes desde @/components/ui, patterns desde @/lib/design-patterns. Regla 'NO hardcodear colores'. Playground en /admin/_design. (logic-core-v3/docs/design-system.md:8-14, :18-22, :51-55, :156-175, :218-247). *Por qué:* Es el único doc de diseño del portal y está desactualizado: el playground se borró (c3b150ab, 2026-06-28); design-patterns.ts no tiene consumidores; tailwind.config.ts, que mapea design-tokens a Tailwind, no se carga en Tailwind 4 porque no hay @config en ningún .css de src; el radio sm 8px (:44) choca con design-tokens.ts (0.375rem). La regla 'NO hardcodear colores' (:170) se incumple en ~8.000 referencias.
- **docs/design-system-audit.md (2026-05-18).** Fija los valores canónicos: p-5 en cards, p-6 en secciones, rounded-2xl por defecto, rounded-3xl en hero, space-y-6/3, border-white/10 (énfasis /20), bg-white/[0.02] (hover /[0.04]). Lista duplicados de StatCard, Section y EmptyState. (logic-core-v3/docs/design-system-audit.md:36-52, :88-97). *Por qué:* Es la gramática actual del kit oscuro. Sigue pendiente: los StatCard locales de dashboard/modules/agenda-inteligente/page.tsx y tienda-conectada/page.tsx siguen vivos (:41-42); los de admin ya no existen.
- **docs/admin-design-system-audit.md (2026-06-28).** Auditó el playground /admin/_design: self-contained, solo para SUPER_ADMIN, consumidor de ui/*. Recomendó sacarlo del nav (Fase 2) y borrarlo con OK de Valentino (Fase 3). (logic-core-v3/docs/admin-design-system-audit.md:9-26, :65-78). *Por qué:* La Fase 3 se ejecutó (c3b150ab). No queda nada abierto, pero la consecuencia para F3 es que hoy no existe ningún banco visual que renderice ui/*.
- **docs/diagnostico-visual-admin-2026-08/.** Es una corrida de capturas del admin, del lado de Franco (32 de 34 rutas). No opina. Deja el juicio visual a los humanos: 'El diseño del admin se decide mirando, con el mismo método que el del setter'. Cierra la evidencia de 3 decisiones: el check falsamente verde, dónde cargar las URLs de herramientas y Cal.com, y la forma de la cola (8.662 px, de los que se ven 756). (REPORTE.md:8-9, :384-391; MANIFIESTO.md:52-57; .gitignore:1-4 (los PNG no están en el repo)). *Por qué:* No decidió nada de paleta ni de tokens. Pide una revisión visual humana del admin y aporta problemas de layout y densidad que un retema no resuelve.
- **logic-core-v3/AGENTS.md: convenciones del portal.** Toma glass como lenguaje base, fija como fondo del portal y del admin zinc-950/zinc-900 y lista una paleta por servicio. (logic-core-v3/AGENTS.md:45-51, :54-58, :60-62). *Por qué:* El fondo real de los shells es bg-[#080a0c] (admin y dashboard) o var(--color-void) (setter), no zinc-950. La paleta por servicio está mal (ver colores_servicio).

## 8. Hallazgos de diseño

### [DIS-001] El kit `ui/*` no tiene capa semántica: 12 de 469 referencias de color son tokens, y ninguna en lo que pinta el portal
- Dominio: D9  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/components/ui/Button.tsx:36` (primary fija bg-cyan-400 text-zinc-950) · `src/components/ui/Button.tsx:53-58` (las únicas variantes con tokens, ds-*, son del sitio público) · `src/components/ui/Modal.tsx:47` (zinc-950 como superficie) · `src/components/ui/Card.tsx:31` (glow cian rgba literal)
- Impacto: Bloqueante para la renovación visual del portal: con el kit así, cambiar la piel exige un «puente de paleta» que redefine las variables de Tailwind (alcanza el 99,2 % del kit del portal, 389 de 392 referencias) pero no es semántico: zinc-950 es a la vez texto sobre acento y superficie, así que un tema claro limpio rompe el contraste sin editar el kit.
- Propuesta: Decisión para Valentino (`ui/*` está congelado; ver CNG-022 en `11-CONGELADOS.md`): o se acepta el puente de paleta como transición (ruta §3) o se migra el kit a roles (≈ 25 archivos, 377 referencias) con su gate.
- Esfuerzo: L  ·  Zona: congelado
- Nodo(s): lib.ui

### [DIS-002] Los tres shells de portal imponen lienzo, velo, vidrio y radio con literales: ninguna variable que una capa de tema pueda mover
- Dominio: D9  ·  Severidad: MEDIA  ·  Tipo: deuda
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/(protected)/admin/_components/AdminLayoutClient.tsx:30` (bg-[#080a0c] y z-[80] literales) · `src/app/(protected)/admin/_components/AdminLayoutClient.tsx:97` (panel rounded-[28px] con vidrio) · `src/components/dashboard/DashboardLayoutClient.tsx:51` (copia del lienzo del admin) · `src/app/(protected)/setter/_components/setter-shell.tsx:28` (el único que lee una variable, la legacy del sitio)
- Impacto: Cualquier cambio de piel del portal empieza por los shells, que hoy repiten a mano el mismo lienzo, velo y vidrio en admin y dashboard; además el pie de los dos portales usa text-zinc-700 sobre #080a0c (≈ 1,9:1 por cálculo, no medido), debajo de AA.
- Propuesta: Reemplazar los literales de los tres shells por los roles de la capa del portal (ruta §3, paso 4), en un sprint propio con visual-qa por shell. El del setter es zona de Franco.
- Esfuerzo: M  ·  Zona: libre
- Nodo(s): h4.adm-shell, h2.cli-shell

### [DIS-003] El lienzo del setter lee `--color-void`, que el ThemeProvider del home deja en `light` sin limpiarlo: llegar al setter desde el home sin recargar puede pintar el panel casi blanco con texto claro
- Dominio: D9  ·  Severidad: MEDIA  ·  Tipo: bug
- Confianza: PROBABLE
- Evidencia: `src/app/(protected)/setter/_components/setter-shell.tsx:28` (bg-[var(--color-void)] text-zinc-100) · `src/hooks/useThemeObserver.tsx:15-21` (escribe data-theme en el html; no hay limpieza al desmontar) · `src/app/globals.css:308-309` ([data-theme=light] pone --color-void en #fafafa) · `src/app/page.tsx:23` (el ThemeProvider solo se monta en el home)
- Impacto: Bloqueante para el uso diario del setter si se reproduce: el contenido queda con texto zinc-100 sobre #fafafa, casi ilegible, hasta recargar. El login redirige por server action (navegación blanda) y el Navbar entra a /login con triggerTransition, así que el html conserva el atributo del home. Es runtime: lo cierra la VH.
- Propuesta: Que el shell del setter use un rol propio del portal (o el literal del lienzo de los otros shells) en vez de --color-void, y que el ThemeProvider del home quite data-theme al desmontar.
- Esfuerzo: S  ·  Zona: ZONA-FRANCO
- Nodo(s): h5.set-dia
- REQUIERE-VERIFICACIÓN-HUMANA: VH-174

### [DIS-004] Al mergear rediseno/home el portal cambia de Geist a Chivo sin que nadie lo haya decidido para el portal
- Dominio: D9  ·  Severidad: MEDIA  ·  Tipo: ux
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `rama:bead847c:src/app/globals.css:15-17` (--font-sans y --font-mono pasan a Chivo en el @theme global) · `src/app/layout.tsx:2-11` (main carga Geist en el layout raíz) · `src/app/globals.css:5` (main mapea --font-sans a Geist)
- Impacto: El merge de la home cambia la tipografía de todas las pantallas internas (tablas densas, micro-textos de 9 a 11 px) como efecto lateral; la decisión del home («Chivo») no se tomó para el portal.
- Propuesta: Decidir antes del merge (pregunta 5 de §4): adoptar Chivo en el portal servida con next/font/local desde el layout raíz, o acotar el cambio de familia al home.
- Esfuerzo: S  ·  Zona: libre
- Nodo(s): lib.ui, rama.rediseno-home

### [DIS-005] La regla única de foco visible de v3 está acotada al home: si se vuelve global sin un foco del tema oscuro, el portal queda sin foco visible
- Dominio: D9  ·  Severidad: MEDIA  ·  Tipo: a11y
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `rama:bead847c:src/app/theme-develop.css:296-305` (--color-foco es la tinta #111 por referencia) · `rama:bead847c:src/app/theme-develop.css:1485-1494` (la regla se acota a [data-v3] porque sobre el zinc-950 del portal da 1,06:1) · `rama:bead847c:src/app/v3/_estilos/foco.css:118-128` (el anillo de dos tonos que sí funciona sobre oscuro)
- Impacto: El foco visible es criterio AA del portal (CLAUDE.md: quality baseline). El comentario del tema dice que el anillo «se invierte solo»; el propio foco.css mide que no (1,0:1 contra la sala de noche) y usa dos tonos: lo transferible es el anillo de dos tonos, no el comentario.
- Propuesta: Llevar al portal el mecanismo (una regla :focus-visible emitida antes que los componentes, con el anillo de dos tonos) con un color de foco que pase 3:1 sobre la base que se decida.
- Esfuerzo: S  ·  Zona: libre
- Nodo(s): lib.ui

### [DIS-006] No hay ningún banco visual del kit: el playground del admin se borró y /styleguide no renderiza `ui/*` y es público sin auth
- Dominio: D9  ·  Severidad: MEDIA  ·  Tipo: faltante
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/styleguide/page.tsx:19-27` (noindex, sin auth ni links entrantes; no importa ui/*) · `tests/e2e/22-visual-regression.spec.ts:75` (la única prueba de tokens apunta a /admin/_design, borrada en c3b150ab)
- Impacto: Cualquier re-tematizado del portal (puente de paleta, capa de roles o migración del kit) va a ciegas: no hay dónde ver el kit bajo cada tema ni medir contraste por token.
- Propuesta: Una página con auth que renderice ui/* y los wrappers bajo cada tema, con chequeo de contraste por token, antes del primer cambio de piel (ruta §3, paso 8).
- Esfuerzo: M  ·  Zona: libre
- Nodo(s): lib.ui

### [DIS-007] El motion de v3 es casi todo coreografía de scroll: de sus módulos solo cinco sirven al portal, y el portal no tiene política de movimiento reducido
- Dominio: D9  ·  Severidad: BAJA  ·  Tipo: a11y
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `rama:bead847c:src/app/v3/_lib/usePrefiereMenosMovimiento.ts:32` (useSyncExternalStore con snapshot de servidor true) · `src/lib/use-reduced-motion.ts:6` (main arranca en false y corrige en un efecto)
- Impacto: Llevar el motion del home tal cual mete recorridos atados al scroll en una herramienta; no llevar su política de movimiento reducido deja el defecto de A11Y-040 (las entradas animan igual para quien pidió menos movimiento).
- Propuesta: Adoptar en los layouts del portal el proveedor de movimiento de v3 (MotionConfig reducedMotion desde el hook con snapshot de servidor) y las curvas para micro-interacciones; dejar fuera la coreografía (ver §2).
- Esfuerzo: S  ·  Zona: libre
- Nodo(s): lib.ui

### [DIS-008] Los colores por servicio tienen tres versiones: CLAUDE.md (correcta para main), AGENTS.md con la permutación equivocada que también viven en código, y v3 con tres acentos nuevos
- Dominio: D9  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `raíz:CLAUDE.md:99-103` (cian, esmeralda, ámbar, violeta; coincide con globals.css y las landings) · `AGENTS.md:54-58` (IA violeta, Automatización esmeralda, Software ámbar) · `src/lib/design-tokens.ts:94-98` (la misma permutación) · `rama:bead847c:src/app/theme-develop.css:326-328` (v3: tres acentos oscuros)
- Impacto: Quien siga AGENTS.md pinta los servicios cruzados, y la permutación ya está en el seed del bot (UX-031); la capa nueva del portal heredaría la confusión. Resuelve el punto 12 de §10 del plan: para main manda `raíz:CLAUDE.md:99-103`.
- Propuesta: Corregir AGENTS.md y design-tokens (o borrar sus colores, DEU-100), y decidir el set de acentos del portal (pregunta 3 de §4) antes de la capa de roles.
- Esfuerzo: S  ·  Zona: libre
- Nodo(s): lib.ui

### [DIS-009] El Toaster es global y está fijado en oscuro con un fondo literal: cualquier tema del portal lo tiene que condicionar sin tocar el sitio público
- Dominio: D9  ·  Severidad: BAJA  ·  Tipo: deuda
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `src/app/layout.tsx:125-134` (Toaster con theme dark y background #090a0f en el layout raíz)
- Impacto: Los toasts son la respuesta de casi toda action del portal; con un tema claro quedarían oscuros, y cambiarlos en el layout raíz cambia también el sitio público.
- Propuesta: Que el Toaster lea los roles de la capa del portal dentro de su scope (o montar uno por shell).
- Esfuerzo: S  ·  Zona: libre
- Nodo(s): lib.ui

## 9. Verificación y lo que queda abierto

- **Verificado por el padre en git:** el lienzo del setter con `var(--color-void)` y el ThemeProvider sin limpieza ([DIS-003]); el lienzo literal del admin; que el kit solo tiene `var(--` en tres archivos (Button, IntroLockupText, MagneticCta); el Toaster oscuro con fondo literal; el mapeo de `--font-sans` a Chivo en rediseno/home; y la discrepancia del foco (el comentario de `theme-develop.css:296-305` dice que se invierte solo, `foco.css:118-128` mide que no).
- **Corrección de los agentes:** el encabezado de `theme-develop.css` dice 89 tokens; el bloque `@theme static` tiene 111 declaraciones. Las duraciones de v3 son «narrativas» (300 a 700 ms): las de feedback de un dashboard son una decisión aparte.
- **Sin verificar (runtime):** el lienzo claro del setter (VH-174); los contrastes calculados y no medidos (pie de los portales ≈ 1,9:1, acentos de CLAUDE.md sobre papel); que el puente de paleta no se filtre al volver al sitio público.
