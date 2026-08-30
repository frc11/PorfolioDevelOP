# SITIO-S6 — Secciones 5 a 8

Servicios · Tu panel · Por qué develOP · Cierre

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `ultracode`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\v3-seccB`, rama **`rediseno/secciones-b`**. Sesión en `C:\v3-seccB\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar. Sprint largo y autónomo: puede durar horas. Construí todo y frená al final.
- **Corre en paralelo con SITIO-S5 (secciones 1 a 4), en otro worktree.**
- **NO corras el dev server, NO tomes capturas, NO abras navegador.** Verificación: `npm run verificar`, más los invariantes propios.
- ⚠️ **El OOM del build no se arregla con `--max-old-space-size`.** Es la máquina: 13,9 GB con Next lanzando 15 workers. El remedio es **acotar los workers** — está en `DIRECCION-ESCENA.md` §6.1 con el comando exacto.

---

## Por qué `ultracode` acá

Las cuatro secciones son **cuatro unidades independientes**: cada una tiene su componente, su contenido y su comprobación, y ninguna importa de otra. Es el caso que justifica subagentes.

**Pero solo funciona si el reparto es estricto.** De ahí las tres fases.

---

# FASE 0 — El contrato (el agente principal, sin subagentes)

**Nada se despacha hasta que esta fase esté cerrada.**

## 0.1 Leer

- `docs/rediseno/outputs/S1-ESQUELETO.md`, `SITIO-S2-MOTION.md`, `S3-CHROME.md`.
- `docs/rediseno/s0/theme-develop.css` — los 90 tokens.
- `src/app/v3/_lib/motion/` — los nueve patrones.
- `src/app/v3/_componentes/` — layout, tipografía, chrome, medios. **El pie ya existe entero.**
- `docs/rediseno/s0/COMPONENTS.md`, `LAYOUT.md`, `SCROLL.md`, `OBSERVACION.md`.

## 0.2 Las superficies — las escribe el otro lane

| # | sección | superficie |
|---|---|---|
| 5 | Servicios | `papel-opaco` |
| 6 | Tu panel | `papel-opaco` |
| 7 | Por qué develOP | **`papel-transparente`** |
| 8 | Cierre | **`oscuro-opaco`** |

⚠️ **`secciones.ts` lo escribe el lane A, con las ocho.** Vos las **consumís**. **No lo toques** — es el único archivo que produciría un conflicto real entre los dos lanes.

## 0.3 El contrato de sección

Un módulo compartido que fija: la forma de una sección, el contenido como **dato** en un archivo aparte, las convenciones de relleno de §0.4, y cómo se consume un patrón de motion con su variante sin motion.

## 0.4 ⚠️ El contenido inventado tiene que PARECER inventado

**Regla dura, no se negocia.** develOP tiene deuda registrada por esto: sus cuatro landings llevan cifras y testimonios fabricados. **No se duplica.**

| va | no va |
|---|---|
| `[MÉTRICA]`, `[CIFRA]`, `[TESTIMONIO]`, `[PRECIO]` | `+340%`, `desde $99.000` |
| `[CAPTURA DEL PANEL]`, `[VIDEO]` | una imagen de banco |
| Nombres reales: **Esquina · El Garage · Matsu Automotores** | clientes inventados |
| Relleno con la longitud y la estructura retórica correctas | copy que suene a definitivo |

**Ningún número que se pueda leer como un hecho puede ser inventado.** Los **precios no están cerrados** y no se inventan ni de ejemplo.

**Comprobación transversal con control positivo:** un escáner que rechace dígitos con `%`, `+`, `×` o `$` en el contenido, salvo lista blanca declarada.

## 0.5 El andamiaje

- Una carpeta por sección; nadie escribe fuera de la suya.
- La ruta **`/v3/secciones-b`** con las cuatro en orden, `noindex`, con fecha de baja.
- Los scripts de invariantes, derivados como ya hace `verificar`.

⚠️ **Ni este lane ni S5 tocan `/v3/page.tsx`.** La composición del home es una integración posterior.

---

# FASE 1 — Las cuatro secciones (un subagente cada una)

## Reglas para todo subagente

1. **Escribís SOLO dentro de tu carpeta.** Si necesitás algo de afuera, **reportalo**, no lo escribas.
2. **No modificás ningún archivo compartido.** Ni `secciones.ts`, ni el contrato, ni `package.json`, ni la ruta, ni nada de `_lib/`, `_componentes/` o `_estilos/`.
3. **Consumís lo que existe.** Patrones, componentes, primitivas, tokens. **No reimplementás nada.**
4. **Cero valores fuera de los tokens.**
5. **Tu sección funciona abajo de 1025**, sin una sola animación. **Verificalo.**
6. **Foco visible** en todo lo interactivo.
7. **Tu invariante propio**, con controles positivos.
8. **Reportás al principal** en formato fijo: qué construiste, qué patrones consumís, pantallas, si va pinneada, qué marcadores dejaste, y qué te faltó.

---

## Subagente 5 · Servicios — la sección más coreografiada del sitio

**Superficie: `papel-opaco`.** Es la más pesada de las ocho, y la única cuyo mecanismo estuvo sin resolver hasta que apareció en la observación humana:

> **Es una secuencia sincronizada:** al scrollear cambian **a la vez** el nombre del servicio, el video del panel y el párrafo con resaltado progresivo. **No son tres animaciones: es una.**

**Un solo `sticky` largo, un solo progreso, tres cosas colgando de él.** Es el mismo patrón que el proyecto ya usa en la escena: un número alimentando varios canales.

- **Tres servicios**, con su acento contextual: **web `#1D5B8F` · IA y Automatización `#1B6B4C` · software `#57429E`**.
- **El acento entra por `data-servicio`** en un ancestro, que retiñe `--color-acento`. Está verificado en un build real y **depende de `@theme static`** — con `@theme inline` no funciona. **No escribas el acento concreto: usá el alias.**
- **El resaltado progresivo es P3**: `opacity` 0,3 → 1, palabra por palabra, sin desplazamiento.
- **La lista de cada servicio entra ítem por ítem con P4** — los once `li` que suben 100px reales, muy frenados. Es el único uso de `power4.out` del corpus.
- **Las filas usan P2.** En la referencia, 60 de sus 77 instancias están en esta página.
- **`[VIDEO]`** en el panel de medios. Está medido que es video, no imagen fija. Dejá el hueco con su relación de aspecto y su póster; **no metas un `<video>` sin fuente.**
- **Pinneada.** Declará pantallas y contá la secuencia como **un** momento.

⚠️ **Un acento por contexto, nunca los tres a la vez.** Es regla cerrada de la paleta.

## Subagente 6 · Tu panel

**Superficie: `papel-opaco`.** El producto propio: el panel que reciben los clientes.

- Qué es y qué se ve adentro. **`[CAPTURA DEL PANEL]`** con el componente de imagen y su `sizes` real.
- **Sin precios.** No están cerrados y no se inventan.
- **Patrones: P1** para el titular, **P2** para los bloques. Si la sección muestra una lista de capacidades, **P4**.
- **Una o dos pantallas.** Decidilo por composición y reportalo.

## Subagente 7 · Por qué develOP

**Superficie: `papel-transparente`.** La escena vuelve a verse — es el segundo de los tres momentos de escena del recorrido, y el único en medio de la página.

- El diferencial contra una agencia cualquiera. **Estructura correcta, marcadores donde haga falta una prueba.**
- **Patrones: P1** para el titular. **P5** o **P9** si hay piezas que aparecen — son de los pocos usos que el sistema tiene y este es su lugar natural.
- **Una pantalla.** No pinneada.

⚠️ **El texto va sobre la escena.** Reportá el contraste de la tinta contra el peor fondo del canvas en esa pose del recorrido. Si no pasa AA, **no lo resuelvas inventando una capa**: reportalo.

## Subagente 8 · Cierre

**Superficie: `oscuro-opaco`.** El último cuadro del sitio.

Está observado cómo cierra la referencia, y coincide con lo que la coreografía de develOP ya hace sola:

> En el pie, la cámara se aleja y la marca retrocede hacia el horizonte mientras las columnas de enlaces suben. **Abre con la marca cerca, cierra con la marca lejos.**

- **Un titular de cierre grande** — `titulo-xl` — y **el CTA**, que ya existe. **Tinta, nunca acento.**
- **El pie ya está construido entero** en chrome: enlaces con icono, botones sociales, contacto, formulario de novedades. **Consumilo, no lo rehagas.**
- **Patrón: P1** para el titular. **P2** para las columnas del pie, con escalonado.
- **Una o dos pantallas.**

⚠️ **Sobre fondo oscuro el acento no puede ser texto** — 2,71 · 2,99 · 2,46. Relleno o subrayado, y nunca como único indicador de un límite.

⚠️ **El formulario de novedades no puede tener éxito falso.** Es deuda conocida del pie actual del sitio vivo y no se repite. Si no manda a ningún lado, **que lo diga o que quede deshabilitado con su motivo.**

---

# FASE 2 — Integración (el agente principal)

1. **Montar las cuatro** en `/v3/secciones-b`, en orden, con sus superficies leídas de `secciones.ts`.
2. **Los invariantes transversales:**
   - **El escáner de contenido inventado** (§0.4), con control positivo, **incluidos los precios**.
   - **Que el acento contextual se consuma por alias** y nunca por su valor concreto, con control.
   - **Que ninguna sección importe de otra.**
   - **Cero valores fuera de los tokens.**
   - **Foco visible** en todo lo interactivo.
   - **Que las cuatro rindan abajo de 1025** sin coreografía.
   - **Que la secuencia de Servicios sea UN progreso**, no tres animaciones sueltas. Es la propiedad que define la sección y merece su comprobación.
3. **Peso**: propio afirmado, heredado publicado, según la regla §3.13.
4. **El ritmo**: pantallas y **momentos reales**. La referencia tiene 20,5 en 23,5.
5. **El reporte**, con lo que cada subagente informó y lo que faltó.

---

## Reglas absolutas

1. **Rama `rediseno/secciones-b`.** No toques `main`, ni `rediseno/home`, ni otros worktrees. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte. **Nunca `git add .`**
2. **No toques `secciones.ts`** — lo escribe el lane A. Es el único conflicto real posible.
3. **No toques `/v3/page.tsx`.**
4. **No toques el sistema de motion, ni chrome, ni layout, ni tipografía, ni `theme-develop.css`.** Si falta algo, **frená y reportá**.
5. **No toques el home actual, `/probe-escena`, `home-intro/`, ni los frozen.**
6. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
7. **No sumar dependencias.** **Cero `any`.** **Nunca `router.push` directo.** **Nada de base de datos.**
8. **Ninguna cifra inventada, y ningún precio.**
9. **Ninguna comprobación verde por vacío.** Control positivo obligatorio.
10. **Regla 11:** toda cifra con su instrumento. **Regla 12:** frontera declara ventana. **Regla 13:** se afirma lo propio, se publica lo heredado.
11. **PowerShell:** no hay `&&`, no hay heredoc. `tsc` es `.\node_modules\.bin\tsc.cmd --noEmit`.
12. **No corras el dev server. No auto-confirmás que se ve bien.**
13. Archivos de más de 300 líneas se parten.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `npm run verificar` completo.
- (b) Los invariantes nuevos, con sus controles positivos.
- (c) **El informe de cada subagente**, los cuatro.
- (d) **Los marcadores de contenido**, la lista completa. Es el pedido a Franco.
- (e) **Pantallas y momentos reales**, contra los 20,5 en 23,5 de la referencia.
- (f) **Peso**: propio afirmado, heredado publicado.
- (g) **Abajo de 1025**: que las cuatro se leen enteras sin coreografía, y que Servicios sigue teniendo sentido sin la secuencia.
- (h) El contraste de la tinta sobre el canvas en Por qué develOP.
- (i) **Que la secuencia de Servicios sea un progreso**, con su comprobación.
- (j) Archivos y `git status`.
- (k) Qué le falta a la integración con S5.

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "SITIO-S6: secciones 5 a 8"` → `git push -u origin rediseno/secciones-b`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/SITIO-S6-secciones-b.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\v3-seccB, rama rediseno/secciones-b. Corre EN PARALELO con
  el lane de las secciones 1 a 4 en otro worktree.
- Sprint LARGO y AUTÓNOMO, en TRES FASES. La fase 0 la hacés vos solo y
  NADA se despacha a subagentes hasta que el contrato esté cerrado. La
  fase 1 son cuatro subagentes, uno por sección. La fase 2 la integrás vos.
- Cada subagente escribe SOLO dentro de su carpeta. No toca archivos
  compartidos. Si necesita algo de afuera, lo REPORTA, no lo escribe.
- NO toques secciones.ts: lo escribe el otro lane con las ocho superficies.
  Vos las consumís. Es el único conflicto real posible entre los dos.
- NO corras el dev server, NO tomes capturas, NO abras navegador. El OOM
  del build NO se arregla con --max-old-space-size: es la máquina. Acotá
  los workers, está en DIRECCION-ESCENA.md §6.1.
- NO toques /v3/page.tsx, ni motion, ni chrome, ni layout, ni tipografía,
  ni theme-develop.css. Si falta algo, FRENÁ Y REPORTÁ. Tampoco el home,
  /probe-escena, home-intro/ ni los frozen.
- El contenido inventado tiene que PARECER inventado: [MÉTRICA], [CIFRA],
  [CAPTURA], [VIDEO]. NINGÚN número que se pueda leer como un hecho, y
  NINGÚN PRECIO: no están cerrados. Con escáner y control positivo.
- Servicios es UNA secuencia sincronizada, no tres animaciones: un sticky
  largo, un progreso, tres canales colgando. Con su comprobación.
- El acento entra por data-servicio y se consume por ALIAS, nunca por su
  valor concreto. Un acento por contexto, nunca los tres.
- El pie YA ESTÁ CONSTRUIDO en chrome: consumilo, no lo rehagas. Y su
  formulario no puede tener éxito falso.
- Las cuatro secciones funcionan ABAJO DE 1025 sin una sola animación.
- Sobre fondo oscuro el acento no puede ser texto: relleno o subrayado.
- Ninguna comprobación verde por vacío. Regla 11: toda cifra con su
  instrumento. Regla 13: se afirma lo propio, se publica lo heredado.
- Git: commit y push en rediseno/secciones-b. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte. Nunca git add .
- Cero any. Sin dependencias nuevas. Nada de base de datos.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá por la Fase 0. No me confirmes el entendimiento.
```
