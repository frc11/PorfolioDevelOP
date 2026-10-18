# ESCENA-CONTRATO — lo que el home le expone a las páginas nuevas

Versión 1 · 2026-10-17 · Dueño: chat del home. Solo este chat edita este archivo; los demás lo leen. Convenciones entre chats: `claude/SERVICIOS-SPEC.md` §1.

Cada dato lleva su estado:
- **[CONFIRMADO · fuente]:** salió de un reporte de CC sobre el código del home, que se cita;
- **[NO CONFIRMADO]:** no hay certeza y no se supone.

Los [NO CONFIRMADO] los responde el S0 de servicios **leyendo el código**, sin correr nada. Las respuestas van a `LOG-SERVICIOS.md`, sección "Respuestas al contrato"; el chat del home las lee ahí y publica la versión 2.

**Docs viejos del proyecto que NO son fuente:** `HANDOFF-1` a `HANDOFF-4`, `theme.css`, `WEBGL.md`, `SCROLL.md`, `DIRECCION-ESCENA.md`, `LAYOUT.md`, `COMPONENTS.md`, `OBSERVACION.md`, `B13-emite.md`. Son de agosto y septiembre (medición de la referencia o de un home anterior). Se citan acá solo cuando un reporte posterior los confirma.

---

## 1. La escena en una subruta de `/v3`

### 1.1 Lo que se sabe hoy
- La escena vive en `src/app/v3/_lib/escena/`. Piezas: `EscenaDelHome.tsx`, `OrbitRig.tsx`, `entorno.ts` (las banderas de prueba en `Pruebas`), `tramoEstirado.ts`, `camaraDeEntonces.ts`. [CONFIRMADO · Fase 0 de B1 y commits de A-ter]
- **Cómo se mapea el scroll:**
  - el scroll se mapea al progreso de la escena con nudos proporcionales a la tabla de alturas de las secciones del home (`anclaje.ts`, `recorrido.ts`, `secciones.ts`);
  - la noche la dispara un IntersectionObserver sobre el DOM de Quiénes somos (`CapaDeLaGota`, `nocheDisparada.ts`);
  - el pie 3D se ancla a Por qué develOP.
  - Todo eso supone el DOM del home. [CONFIRMADO · Fase 0 de B1, §4.2]
- Servicios del home abre su propio contexto WebGL (`_lib/nanobots/enjambre.ts`). [CONFIRMADO · Fase 0 de B1, §6]

### 1.2 Lo que no se sabe
- Dónde se monta el `<Canvas>`: en el layout de `/v3` o en la página del home. [NO CONFIRMADO]
- Si está en el layout: qué hace en una subruta (si corre la pista del home, si el scroll de la subruta la mueve, si da errores o `NaN` sin el DOM del home) y cuánto cuesta. [NO CONFIRMADO]
- Si `ScrollSuaveDeV3` (Lenis), el preloader y el cursor propio corren en una subruta. [NO CONFIRMADO]
- Si existe una bandera de producto (no de prueba) que apague la escena. Las de `entorno.ts` son de prueba: una página no puede depender de ellas. [NO CONFIRMADO]
- El fondo del layout de `/v3` en una subruta: papel u oscuro. [NO CONFIRMADO]

### 1.3 Qué hace una página nueva mientras no exista B12
- **Si la escena NO se monta en subrutas:** la página pone su propio fondo oscuro, de los tokens, y nada más.
- **Si la escena SÍ se monta:** la página pone encima un fondo opaco propio en DOM (fijo, a pantalla completa, por encima del lienzo), sin tocar ningún archivo de escena.
- **Medición en runtime:** va en el S1 de servicios, cuando la página exista, y solo si el home no está corriendo nada pesado (§6, O-3). Se mide:
  - errores de consola;
  - `NaN`;
  - FPS y memoria con la página encima.
- **Si hay errores o el costo es alto:** se abre **P-H4** (§5). Servicios nunca parchea la escena ni la apaga con una bandera de prueba.

## 2. Componentes, datos y assets compartidos (se importan o referencian, no se copian ni se modifican)

| Pieza | Dónde | Estado | Uso desde servicios |
|---|---|---|---|
| Modal de contacto | `src/app/v3/_chrome/contacto/`; se abre con un elemento que lleva `data-abre-contacto="panel"`, manejado por `apertura.ts` | [CONFIRMADO · Fase 0 de B1, §5.9] | Un `<button>` o `<a>` con `data-abre-contacto="panel"`. Si el modal se monta en una subruta: [NO CONFIRMADO] |
| Servicio preseleccionado en el modal | — | Hoy no está [NO CONFIRMADO, se asume que no] → **P-H1** | Servicios pone ya `data-servicio="<slug>"` en el mismo elemento. Mientras no esté P-H1 se ignora y el modal abre sin preselección. Cuando esté, funciona sin que servicios cambie nada |
| Navbar | `src/app/v3/_chrome/` (ruta exacta [NO CONFIRMADO]); sus enlaces viajan a las secciones del home con el sistema de viajes (`_componentes/destinosDelViaje.ts`) | Comportamiento en una subruta [NO CONFIRMADO] | Se monta tal cual. Si en una subruta rompe o no lleva a `/v3#ancla` → **P-H3** |
| Pie | El pie del home es 3D (`pie3d/PieDeVolumen.tsx`), es parte de la escena | [CONFIRMADO · commits de A-ter] | **No se importa.** Servicios usa su cierre provisorio (CTA simple + links) hasta B13 |
| Tokens de diseño | `src/app/theme-develop.css` (`@theme`, nunca `@theme inline`) | Ruta [CONFIRMADO · HANDOFF-1]; nombres actuales [NO CONFIRMADO] | Se consumen por clase o `var()`. No se edita el archivo |
| Tipografía | Chivo + Chivo Mono, auto-hospedadas | [CONFIRMADO · HANDOFF-1]; vigencia [NO CONFIRMADO] | La que ya carga el layout; no se suma otra |
| **Datos de los proyectos** | `src/app/v3/_secciones/trabajos/proyectos.ts` (`PROYECTOS`: nombre, url, rubro, fecha, problemas, reseña, medios), creado en B1.1a | [CONFIRMADO · plan aprobado de B1, §5.2]; llega a servicios cuando trae el home después de B1.1a | **Fuente única** de los casos de Páginas web: se importa (nombre, rubro, url, póster) y servicios agrega solo su texto propio. Hasta que llegue, datos provisorios en un solo lugar, marcados para reemplazar |
| **Pósters y videos de los sitios** | `public/portfolio/<slug>/escritorio.webp`, `movil.webp` (y los `.mp4`), creados en B1.1a | [CONFIRMADO · plan aprobado de B1, §5.6] | Las capturas de la sección Prueba se referencian de ahí. Servicios no graba ni copia las suyas |
| Llave de contenido falso | `src/app/v3/_secciones/_contrato/llave.ts` (`CONTENIDO_INVENTADO`) | [CONFIRMADO · HANDOFF-1 y A-ter] | Se puede importar para mostrar relleno solo con la llave prendida. No se modifica |
| Sonido | `src/app/v3/_lib/sonido/` (bus `sonar`) | [CONFIRMADO · Fase 0 de B1] | No hace falta |

## 3. Colores de servicio

**La fuente es una sola: los tokens de `src/app/theme-develop.css`.** Las tres paletas que conviven hoy:

| Paleta | Web | Software | IA | Para qué | Estado |
|---|---|---|---|---|---|
| **Oscuros** (sobre papel) | `#1D5B8F` | `#57429E` | `#1B6B4C` | Texto y rellenos de acento sobre fondo claro | Son los tokens de acento del home [CONFIRMADO · HANDOFF-1]; nombres exactos [NO CONFIRMADO] |
| **Claros** (sobre oscuro) | `#8FC0E8` | `#AFA0E8` | `#7FCBA4` | Texto y acentos sobre fondo oscuro; luz de la escena en B12 | Si son tokens o viven en código: [NO CONFIRMADO] |
| Cian / verde / ámbar / violeta (`#06B6D4`, `#10B981`, `#F59E0B`, `#8B5CF6`) | | | | **No se usan.** Es el borrador de diseño de agosto (`theme.css` del proyecto), no el del sitio | — |

Reglas:
- **Las páginas de servicio son de noche:** en fondo oscuro, los acentos son los claros; los oscuros solo sobre papel.
- **Contraste:** 4,5:1 medido en cada combinación de texto.
- **Una sola voz de acento por página.**
- **Si los claros no existen como tokens:** se abre **P-H2** y el home los agrega. Mientras tanto, servicios los escribe en **un solo lugar** (el campo `acento` de sus datos) con un comentario `P-H2`, para reemplazarlos en una línea.

## 4. Lo que el worktree de servicios NO toca

Rama `paginas/servicios`, `C:\paginas-servicios\logic-core-v3`. Además de lo de `SERVICIOS-SPEC.md` §3:

- **Escena y motor:** `src/app/v3/_lib/**` entero (escena, energía, nanobots, motion —incluido `lente.ts`—, sonido, diagnóstico, fuentes, `anclaje.ts`, `recorrido.ts`, `lenisDelSitio.ts`).
- **Secciones del home:** `src/app/v3/_secciones/**` entero, incluido `_contrato/` (`llave.ts`, `pedido.ts`, `escaneo.ts`) y `trabajos/proyectos.ts`. Se importa; no se edita.
- **Chrome y componentes del home:** `src/app/v3/_chrome/**`, `src/app/v3/_componentes/**`, `src/app/v3/_archivo/**`.
- **Layouts y página del home:** `src/app/v3/layout.tsx`, `src/app/v3/page.tsx`, `src/app/layout.tsx`.
- **Estilos globales:** `src/app/globals.css`, `src/app/theme-develop.css`.
- **Frozen:** `HeroArtifact.tsx`, `TransitionContext.tsx`, `PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`, `src/components/ui/*`.
- **Compartidos con el sitio vivo:** `src/lib/`, `chrome/`, `scene-camera.ts`.
- **Zonas de Franco:** `src/lib/leados/`, `src/app/(protected)/setter/`, `admin/leados/`, `admin/leads/_actions/`, `src/lib/auth-cookies.ts`, `api/qa/login/route.ts`, los modelos `OsLead*`, el enum `ActivityChannel`.
- **Assets y docs del home:** `public/v3/**` y `public/portfolio/**` (se referencian, no se escriben), `docs/rediseno/**`, `scripts-carga/**`, `scripts-portfolio/**`.
- **Tests del home:** los archivos existentes de `src/app/v3/_lib/__tests__/`. Los tests de servicios van en su propia carpeta.
- **Dependencias y scripts:** `package.json` y el lockfile, sin dependencias nuevas. Si hace falta sumar un script de test, es un pedido.
- **Datos:** ninguna escritura a la Neon compartida. Ninguna llamada real a `/api/contacto` ni a `/api/newsletter` desde tests.

Lo que sí crea: las rutas de las 3 páginas, el template, sus componentes, tipos, datos, SEO, tests y docs propios (`docs/servicios/`), en las carpetas que proponga su S0.

## 5. Compromisos del home (pedidos al home)

| Id | Qué | Estado | Cuándo |
|---|---|---|---|
| **P-H1** | El modal de contacto acepta un servicio preseleccionado: un elemento con `data-abre-contacto="panel"` y `data-servicio="paginas-web\|software-a-medida\|ia-y-automatizaciones"` abre el modal con ese servicio elegido. Si el formulario no tiene campo de servicio, se agrega sin enviar nada nuevo a la API hasta D2 | Abierto (lo usan servicios y el recomendador de B4) | Sprint chico apenas cierre B1 |
| P-H2 | Los acentos claros como tokens en `theme-develop.css` | Condicional: lo abre el S0 de servicios si no existen | Junto con P-H1 |
| P-H3 | La navbar en una subruta: enlaces a `/v3#ancla` con `<a href>` y recarga, sin viajes | Condicional: si el S0 reporta que rompe | Junto con P-H1 |
| P-H4 | La escena se pausa o no se monta fuera del home hasta B12 | Condicional: si el S0 lo anticipa leyendo el código, o el S1 lo mide | Junto con P-H1, o apenas se abra |

Los pedidos nuevos de servicios al home van en `LOG-SERVICIOS.md`, sección "Pedidos al home", desde **P-H5**.

## 6. Observaciones al spec (para el chat PÁGINAS NUEVAS; el spec no lo edita este chat)

- **O-1 · Rebase contra la regla dura.** El spec dice que servicios hace `git rebase rediseno/home`.
  - CC tiene prohibido `merge`, `reset`, `rebase`, `push --force` y `git stash`.
  - Un rebase de una rama ya pusheada obliga a `push --force`.
  - **Regla mientras el spec no se corrija:** traer el home lo hace Valentino a mano, nunca CC, con `git merge rediseno/home` dentro de `paginas/servicios`.
- **O-2 · Los padrones del home pueden marcar archivos nuevos.** Algunos invariantes recorren `/v3`: `s5-archivos`, `s3-tokens`, `s10-acceso`, `s7-contrato`. El S0 lista cuáles alcanzan a las carpetas de servicios y propone quedar fuera de su alcance por ubicación. Si no se puede, es un pedido al home. Ningún test del home se edita desde servicios.
- **O-3 · Memoria.** La máquina tiene 16 GB, con una fuga conocida del pool no paginado con WebGL, y el home corre B1 en paralelo (videos, builds, banco). Reglas:
  - un solo proceso pesado a la vez entre los dos worktrees (dev server, build, `verificar`);
  - antes de algo pesado, CC de servicios mira la memoria libre y, con menos de 3 GB, no corre nada;
  - el S0 de servicios no corre nada pesado: es lectura de código;
  - servicios no corre el banco del home.
- **O-4 · La ruta dinámica.** Si es `src/app/v3/[servicio]/`, el S0 lista las subrutas que ya existen bajo `/v3` y confirma que ninguna queda tapada ni se cuela: `dynamicParams = false` y 404 para un slug desconocido.
- **O-5 · Los grupos rojos de la base esconden fallas nuevas.** `verificar` tiene 8 grupos rojos de base (s1, s2, s3, s4, s5, s7, s8, s17). Una falla nueva dentro de un grupo que ya estaba rojo no cambia el color. **El gate compara la lista de fallas, no los grupos**: se guarda la salida de `verificar` de la base en el S0 y cada sprint muestra que no hay ninguna falla nueva, ni siquiera dentro de un grupo rojo.
- **O-6 · Una sola fuente para precios y casos.** Los precios "desde" viven en los datos de servicios; la sección Servicios del home (B4) los importa después del merge, sin copiarlos. Los casos del portfolio viven en `trabajos/proyectos.ts` (§2); servicios los importa, sin copiarlos.

## 7. Pedidos a servicios

(vacío)

## 8. Lo que el S0 de servicios responde leyendo el código (para la versión 2)

Va a `LOG-SERVICIOS.md`, sección "Respuestas al contrato", con archivo y línea en cada respuesta:

1. Dónde se monta el `<Canvas>`, y qué haría la escena en `/v3/<subruta>` según el código: si corre, si el scroll la mueve, si hay lecturas del DOM del home que fallarían.
2. Si Lenis, el preloader y el cursor propio corren en una subruta.
3. Si el modal de contacto se monta en una subruta y abre con `data-abre-contacto="panel"`; si su formulario tiene campo de servicio.
4. Cómo se comporta la navbar en una subruta.
5. Los nombres actuales de los tokens de acento, y si existen los claros. El fondo del layout en una subruta.
6. Qué padrones o invariantes del home recorren las carpetas nuevas (O-2).
7. Qué subrutas existen hoy bajo `/v3` (O-4).
