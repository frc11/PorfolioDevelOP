# SITIO-S5 — Secciones 1 a 4

Hero · Quiénes somos · Números · Trabajos

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `ultracode`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\v3-seccA`, rama **`rediseno/secciones-a`**. Sesión en `C:\v3-seccA\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar. Sprint largo y autónomo: puede durar horas. Construí todo y frená al final.
- **Corre en paralelo con SITIO-S6 (secciones 5 a 8), en otro worktree.**
- **NO corras el dev server, NO tomes capturas, NO abras navegador.** Verificación: `npm run verificar`, más los invariantes propios.
- ⚠️ **El OOM del build no se arregla con `--max-old-space-size`.** Es la máquina: 13,9 GB con Next lanzando 15 workers. El remedio es **acotar los workers** — está documentado en `DIRECCION-ESCENA.md` §6.1 con el comando exacto. Usalo.

---

## Por qué `ultracode` acá

Las cuatro secciones son **cuatro unidades independientes**: cada una tiene su componente, su contenido y su comprobación, y ninguna importa de otra. Es el caso que justifica subagentes — a diferencia de los sprints de motion y de chrome, que eran sistemas únicos.

**Pero solo funciona si el reparto es estricto.** De ahí las tres fases.

---

# FASE 0 — El contrato (el agente principal, sin subagentes)

**Nada se despacha hasta que esta fase esté cerrada.** Si cuatro subagentes arrancan sin contrato, inventan cuatro convenciones y la integración es un sprint aparte.

## 0.1 Leer

- `docs/rediseno/outputs/S1-ESQUELETO.md`, `SITIO-S2-MOTION.md`, `S3-CHROME.md` — qué existe y cómo se consume.
- `docs/rediseno/s0/theme-develop.css` — los 90 tokens.
- `src/app/v3/_lib/motion/` — los nueve patrones, sus anclas y sus curvas.
- `src/app/v3/_componentes/` — layout, tipografía, chrome, medios.
- `docs/rediseno/s0/COMPONENTS.md`, `LAYOUT.md`, `SCROLL.md` — la medición.

## 0.2 El recorrido de superficies — decidido, se aplica entero

`secciones.ts` dejó las ocho en `papel-opaco`. **Este lane las escribe todas**, incluidas las de S6, porque el archivo es uno solo y la decisión ya está tomada:

| # | sección | superficie |
|---|---|---|
| 1 | Hero | **`papel-transparente`** |
| 2 | Quiénes somos | `papel-opaco` |
| 3 | Números | `papel-opaco` |
| 4 | Trabajos | **`oscuro-opaco`** |
| 5 | Servicios | `papel-opaco` |
| 6 | Tu panel | `papel-opaco` |
| 7 | Por qué develOP | **`papel-transparente`** |
| 8 | Cierre | **`oscuro-opaco`** |

**Tres momentos de escena, no ocho.** Aparece, desaparece y vuelve: eso es lo que la hace valer.

⚠️ **`secciones.ts` es del lane A. S6 no lo toca.**

## 0.3 El contrato de sección — lo escribís vos, no los subagentes

Un módulo compartido que fija:

- **La forma de una sección**: qué recibe, qué expone, cómo declara su alto en pantallas y si va pinneada.
- **El contenido como DATO**, separado del componente, en un archivo por sección. Reemplazar contenido tiene que ser editar una tabla, no tocar un componente.
- **Las convenciones de relleno** (§0.4).
- **Cómo se consume un patrón de motion** y cómo se declara la variante sin motion.

## 0.4 ⚠️ El contenido inventado tiene que PARECER inventado

**Regla dura del sprint, y no se negocia.**

develOP tiene deuda registrada por esto: sus cuatro landings actuales llevan cifras y testimonios fabricados. **No se duplica.**

| va | no va |
|---|---|
| `[MÉTRICA]`, `[CIFRA]`, `[TESTIMONIO]` | `+340%`, `+50 clientes`, `3× más ventas` |
| `[FOTO DEL EQUIPO]` | una foto de banco de imágenes |
| Nombres reales donde son verdad: **Esquina · El Garage · Matsu Automotores** | clientes inventados |
| Textos de relleno con la longitud y la estructura retórica correctas | copy que suene a definitivo |

**Ningún número que se pueda leer como un hecho puede ser inventado.** Un marcador visible es un pedido a Franco que no se puede ignorar; una cifra falsa se publica sin que nadie se acuerde.

**Comprobación transversal, con control positivo:** un escáner que rechace dígitos con `%`, `+` o `×` en el contenido de las secciones, salvo los que estén en una lista blanca declarada.

## 0.5 El andamiaje

- La estructura de carpetas: **una por sección**, y nadie escribe fuera de la suya.
- La ruta de demostración **`/v3/secciones-a`**, con las cuatro en orden. Con `noindex` y su fecha de baja.
- Los scripts de invariantes, derivados como ya hace `verificar`.

⚠️ **Ni este lane ni S6 tocan `/v3/page.tsx`.** La composición del home completo es una integración posterior, de diez minutos, después de mergear los dos.

---

# FASE 1 — Las cuatro secciones (un subagente cada una)

## Reglas para todo subagente

1. **Escribís SOLO dentro de tu carpeta.** Si necesitás algo de afuera, no lo escribas: **reportalo al principal.**
2. **No modificás ningún archivo compartido.** Ni `secciones.ts`, ni el contrato, ni `package.json`, ni la ruta de demostración, ni nada de `_lib/`, `_componentes/` o `_estilos/`.
3. **Consumís lo que existe.** Los patrones de motion, los componentes de chrome, las primitivas de layout, los tokens. **No reimplementás nada** — si algo parece faltar, se reporta.
4. **Cero valores fuera de los tokens.** Ni un hex, ni un px.
5. **Tu sección funciona abajo de 1025**, donde no hay coreografía. El contenido está completo y legible sin una sola animación. **Verificalo.**
6. **Foco visible** en todo lo interactivo.
7. **Tu invariante propio**, con controles positivos. Ninguna afirmación verde por vacío.
8. **Reportás al principal** en formato fijo: qué construiste, qué patrones consumís, cuántas pantallas ocupa, si va pinneada, qué marcadores de contenido dejaste, y qué te faltó.

---

## Subagente 1 · Hero

**Superficie: `papel-transparente`.** La escena se ve. Es donde el preloader deja el logo y donde el visitante llega.

- **Titular:** "Tu negocio vendiendo en piloto automático."
- **Slogan:** "Ingeniería para negocios reales."
- Una bajada corta y **el CTA**, que ya existe en chrome. **Tinta, nunca acento.**
- **Patrón ancla: P1**, línea por línea. Es el más usado del corpus y su lugar natural es un titular de varias líneas.
- **Una pantalla.** No pinneada.

⚠️ **El texto va sobre la escena.** Reportá el contraste de la tinta contra el peor fondo del canvas en esa pose. Si no pasa AA, **no lo resuelvas inventando una capa**: reportalo.

⚠️ **La navegación es una pastilla que nace cerca del pie de esta pantalla y viaja al tope.** Ya existe. Dejale su espacio y no la reimplementes.

## Subagente 2 · Quiénes somos

**Superficie: `papel-opaco`.** Dos pantallas — es el tramo más largo del recorrido de la escena.

- Quiénes son: dos personas, una agencia en Tucumán. **Sin inventar biografías**: estructura correcta y marcadores.
- **`[FOTO DEL EQUIPO]`** con la relación de aspecto declarada, usando el componente de imagen que ya existe — **con `sizes` real**, que es obligatorio por construcción.
- **Patrones: P2** para los bloques, **P1** para el titular.
- **Dos pantallas.** No pinneada.

## Subagente 3 · Números

**Superficie: `papel-opaco`.** Una pantalla.

⚠️ **Los números NO van en grilla.** Está medido y observado:

> Están dispersos en posiciones asimétricas y tamaños distintos. Reproducirlos como una barra de cuatro columnas pierde el efecto entero.

- **Composición dispersa**, con tamaños distintos por dato. Usá los ocho niveles de la escala: los números grandes en display, sus rótulos en micro.
- **Cada cifra es un marcador**: `[CIFRA]` con su rótulo real al lado. El rótulo sí se escribe — es lo que le dice a Franco qué dato falta.
- **Patrón: P2** por bloque, con escalonado. **No** entren todos juntos.
- **La composición dispersa tiene que sobrevivir abajo de 1025**, donde no hay animación. Ahí es donde una composición asimétrica se rompe más fácil: verificalo.

## Subagente 4 · Trabajos

**Superficie: `oscuro-opaco`.** La sección más pesada del lane.

⚠️ **El efecto de los proyectos es HTML con `perspective`, NO geometría 3D.** Está medido y confirmado por observación: 44 targets, los 44 `Element`, cero objetos de escena. **No importes nada de three.**

- **Patrón: P7** — `translateZ` de −3000 a +1000, con sus dos tramos contiguos. Ya está construido en motion.
- **Tres proyectos reales: Esquina · El Garage · Matsu Automotores.** Los nombres son verdad y se usan.
- **La métrica va pegada al nombre y se revela en hover.** Está medido que es estructura, no adorno. Como el dato no existe todavía: **`[MÉTRICA]`**, visible, al lado de cada nombre.
- **`[CAPTURA]`** por proyecto, con el componente de imagen y su `sizes`.
- **Pinneada.** Declará cuántas pantallas consume y **contá el tramo como UN momento**, no como N pantallas — es la métrica de ritmo del proyecto.

⚠️ **Sobre fondo oscuro el acento NO puede ser texto.** Está medido: los tres dan 2,71 · 2,99 · 2,46. Va como relleno o subrayado, nunca como texto y nunca como único indicador de un límite.

---

# FASE 2 — Integración (el agente principal)

1. **Montar las cuatro** en `/v3/secciones-a`, en orden, con sus superficies.
2. **Los invariantes transversales**, que ningún subagente puede escribir:
   - **El escáner de contenido inventado** (§0.4), con control positivo.
   - **Que las cuatro superficies coincidan** con la tabla de §0.2.
   - **Que ninguna sección importe de otra.**
   - **Que ninguna escriba un valor fuera de los tokens.**
   - **Foco visible** en todo lo interactivo de las cuatro.
   - **Que las cuatro rindan abajo de 1025** sin coreografía.
3. **Peso**: cuánto agrega este lane a la carga inicial, propio y heredado por separado, con la disciplina de la regla §3.13 — **se afirma lo propio, se publica lo heredado.**
4. **El ritmo**: pantallas totales y **momentos reales** (pantallas − pinneadas + secuencias). La referencia tiene 20,5 momentos en 23,5 pantallas. **Reportá el nuestro.**
5. **El reporte**, con lo que cada subagente informó y lo que faltó.

---

## Reglas absolutas

1. **Rama `rediseno/secciones-a`.** No toques `main`, ni `rediseno/home`, ni otros worktrees. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte. **Nunca `git add .`**
2. **No toques `/v3/page.tsx`.** Es de la integración posterior.
3. **No toques el sistema de motion, ni chrome, ni layout, ni tipografía, ni `theme-develop.css`.** Si falta algo, **frená y reportá**: son sistemas cerrados y agregarles algo es una decisión.
4. **No toques el home actual, `/probe-escena`, `home-intro/`, ni los frozen.**
5. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
6. **No sumar dependencias.** **Cero `any`.** **Nunca `router.push` directo.** **Nada de base de datos.**
7. **Ninguna cifra inventada que se pueda leer como un hecho.**
8. **Ninguna comprobación verde por vacío.** Control positivo obligatorio.
9. **Regla 11:** toda cifra del reporte con su instrumento. **Regla 12:** un check de frontera declara cuando está fuera de ventana. **Regla 13:** se afirma lo propio, se publica lo heredado.
10. **PowerShell:** no hay `&&`, no hay heredoc. `tsc` es `.\node_modules\.bin\tsc.cmd --noEmit`.
11. **No corras el dev server. No auto-confirmás que se ve bien.**
12. Archivos de más de 300 líneas se parten.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `npm run verificar` completo.
- (b) Los invariantes nuevos, con sus controles positivos.
- (c) **El informe de cada subagente**, los cuatro.
- (d) **Los marcadores de contenido**, la lista completa: qué falta y de quién es. Es el pedido a Franco.
- (e) **Pantallas y momentos reales**, contra los 20,5 en 23,5 de la referencia.
- (f) **Peso**: propio afirmado, heredado publicado.
- (g) **Abajo de 1025**: que las cuatro se leen enteras sin coreografía.
- (h) El contraste de la tinta sobre el canvas en el Hero.
- (i) Archivos y `git status`.
- (j) Qué le falta a la integración con S6.

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "SITIO-S5: secciones 1 a 4"` → `git push -u origin rediseno/secciones-a`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/SITIO-S5-secciones-a.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\v3-seccA, rama rediseno/secciones-a. Corre EN PARALELO con
  el lane de las secciones 5 a 8 en otro worktree.
- Sprint LARGO y AUTÓNOMO, en TRES FASES. La fase 0 la hacés vos solo y
  NADA se despacha a subagentes hasta que el contrato esté cerrado. La
  fase 1 son cuatro subagentes, uno por sección. La fase 2 la integrás vos.
- Cada subagente escribe SOLO dentro de su carpeta. No toca archivos
  compartidos. Si necesita algo de afuera, lo REPORTA, no lo escribe.
- NO corras el dev server, NO tomes capturas, NO abras navegador. El OOM
  del build NO se arregla con --max-old-space-size: es la máquina. Acotá
  los workers, está en DIRECCION-ESCENA.md §6.1.
- NO toques /v3/page.tsx, ni el sistema de motion, ni chrome, ni layout,
  ni tipografía, ni theme-develop.css. Si falta algo, FRENÁ Y REPORTÁ.
  Tampoco el home, /probe-escena, home-intro/ ni los frozen.
- El contenido inventado tiene que PARECER inventado: [MÉTRICA], [CIFRA],
  [FOTO]. NINGÚN número que se pueda leer como un hecho. develOP ya tiene
  deuda registrada por cifras fabricadas y no se duplica. Con escáner y
  control positivo.
- Los nombres reales SÍ se usan: Esquina, El Garage, Matsu Automotores.
- Los números de la sección 3 NO van en grilla: dispersos, asimétricos,
  tamaños distintos. Está medido.
- El efecto de Trabajos es HTML con perspective, NO geometría 3D. No
  importes nada de three.
- Las cuatro secciones funcionan ABAJO DE 1025 sin una sola animación:
  ahí no hay coreografía y el contenido tiene que estar completo.
- Sobre fondo oscuro el acento no puede ser texto: relleno o subrayado.
- Ninguna comprobación verde por vacío. Regla 11: toda cifra con su
  instrumento. Regla 13: se afirma lo propio, se publica lo heredado.
- Git: commit y push en rediseno/secciones-a. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte. Nunca git add .
- Cero any. Sin dependencias nuevas. Nada de base de datos.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá por la Fase 0. No me confirmes el entendimiento.
```
