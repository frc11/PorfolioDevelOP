# S7 — Sol, moiré, curvatura y variantes de recorrido

## Cómo correr esta instrucción

- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- **DOS PARADAS 🛑** bloqueantes.
- **NO corras el dev server, NO tomes capturas, NO abras navegador, NO despaches `visual-qa`.** Verificación: `tsc --noEmit` exit 0 y lint limpio.

## Lecturas obligatorias

1. `docs/rediseno/outputs/S6-LUZ.md`, `S5-EDITOR.md`, `S4-RIG.md`.
2. `src/app/probe-escena/_components/` — el módulo entero.

---

# Parte 0 · El documento de dirección

**Antes que nada**, escribí `docs/rediseno/DIRECCION-ESCENA.md`. Es el documento de decisiones consolidadas: hoy están dispersas en seis reportes y en una conversación larga, y hace falta una sola fuente de verdad.

Contenido, tal cual lo decidido con el dueño del proyecto:

## El preloader (se construye en un sprint posterior — dejarlo registrado con precisión)

Secuencia acordada:

1. Pantalla **oscura**.
2. El logo **se dibuja con un trazo** (recuperando el gesto del preloader clásico de `main`, pero más corto y más limpio).
3. **Antes de que el trazo se complete**, aparecen **"develOP"** arriba e **"Ingeniería para negocios reales"** abajo, con **efecto de aparición** — no de escritura, no de máquina de escribir.
4. **En el instante exacto en que el trazo cierra: corte seco de color.** Sin fundido. Fondo claro, logo negro, letras negras. El corte tiene que caer en el frame preciso del cierre del trazo; un cuadro antes o después se lee como error.
5. En ese mismo momento, **el logo y las letras se alejan levemente** — el gesto de "presentación de empresa".
6. Las letras **desaparecen con el mismo efecto con que aparecieron**.
7. La capa del preloader **se desvanece** y aparece la escena 3D detrás.
8. El **logo 3D** (el de extrusión gruesa) toma el lugar, va a su **pose inicial** de la coreografía, y de ahí **baja al hero**.

Reglas: **sin sonido** (los navegadores bloquean audio antes de la primera interacción, y no suena en la primera visita, que es la que importa). **Sin bloqueo de scroll en ningún momento.** Solo en la primera visita de la sesión. Honra `prefers-reduced-motion`.

## La animación principal

Escena 3D persistente con el logo en un espacio arquitectónico abstracto. La cámara lo orbita a lo largo de **8 pantallas de scroll** en seis tramos: hero · quiénes somos (2) · números · portfolio · demos · movimiento final y cierre. Scroll con inercia, offset de mouse, vira en reposo.

Después del cierre la escena **se apaga** (no se tapa con un bloque, no queda una franja asomando) y entran las secciones de servicios y panel. Vuelve para el diferencial.

Paleta **blanco y negro**, sin luces de color. Base clara `#F7F7F5`, tinta `#111111`.

## Decisiones registradas para sprints posteriores

- **Efecto "Star Wars"** para la sección de trabajos: espacio profundo con estrellas, y los proyectos emergiendo desde el fondo hacia la cámara uno por uno, cada uno con su nombre. Reemplaza a una grilla de portfolio.
- **Logo con el acento de cada servicio** en las páginas internas: azul en web, verde en IA+automatización, violeta en software. Mismo objeto, distinta piel según dónde estás. Convierte el código de color en estructura, no en decoración.
- **Menú de posición variable** según la sección, con la condición de que el cambio responda a la composición (si el logo ocupa un lado, el menú va al otro) y no sea arbitrario.
- **Plan de lanzamiento:** se lanza con el home solo. Las páginas internas se desarrollan después, respetando el patrón pero con movimientos y escenas propias.

---

# Parte 1 · El sol

**Un sol, visible solo en los tramos donde la cámara mira hacia arriba.** Un elemento cotidiano dentro de una escena imaginada: es lo que le da realismo espacial a un espacio abstracto.

Cómo resolverlo: **el sol es la luz principal hecha visible.** La key ya existe e ilumina desde arriba; darle cuerpo significa que la luz de la escena tiene una fuente identificable, y eso es lo que produce el realismo. No agregues una luz nueva: dale forma a la que ya está.

- **Parcial, nunca completo.** Asomando por el borde del cuadro. Un sol entero compite con el logo.
- Aparece solo cuando la geometría de la cámara lo pone en cuadro — no lo fuerces por tramo. Con las alturas negativas del recorrido (`demos`, hasta −3,90) debería entrar solo.
- Coherente con el blanco y negro: es luz, no color.
- Que **respete la niebla y el arco de luz**: cuando la sala se apaga hacia el cierre, el sol se apaga con ella.

Reportá en qué tramos del recorrido real queda visible, calculado contra las poses.

---

# Parte 2 · Rendijas, moiré y patrones propios

La escena necesita fondo con vida. **La fuente son los propios patrones de develOP**, no referencias externas: el sitio actual ya tiene un vocabulario visual propio —retículas curvas, líneas de circuito, tramas diagonales, campos de puntos— que nadie más tiene.

**El efecto principal: moiré por dos capas de rendijas.** Una trama fija y otra que se desplaza lentamente sobre ella. La interferencia entre las dos genera un patrón que se mueve solo, y con la cámara orbitando el efecto se multiplica sin costo adicional. Es hipnótico, es barato, y no se parece a nada de la referencia.

Dónde vive: en el ciclorama, en los planos suspendidos, o en una capa propia — decidilo vos según qué se lea mejor con la cámara en movimiento.

Sumale, con criterio y sin saturar, uno o dos patrones más del vocabulario existente. **Menos y bien es mejor que muchos.**

Cuidado con el aliasing: las tramas finas en movimiento son el caso clásico de titileo. Elegí la frecuencia con eso en mente y decí qué hiciste para evitarlo.

---

# Parte 3 · Curvatura de los tramos

Hoy los tramos van **en línea recta entre dos poses**. La referencia no: su cámara curva, acelera y se demora dentro de cada tramo. No es que le falten keyframes para moverse —la interpolación ya es continua— es que le falta **forma al camino**.

**Agregá keyframes intermedios que le den curvatura a cada tramo**, respetando la intención y las poses que el humano compuso.

Reglas duras:

- **Las poses del humano no se tocan.** Son las paradas que importan. Los intermedios van *entre* ellas.
- **Todos los nuevos van marcados `derived: true`**, para que se puedan revisar y borrar.
- **Curvatura, no ruido.** Un intermedio que solo interpola linealmente lo que ya pasaba no aporta nada. Cada uno tiene que hacer que el camino se desvíe de la recta: un arco, una demora, una anticipación.
- **No agregues en los tramos que ya funcionan bien.** El giro de demos ya tiene cuatro waypoints y velocidad pareja: dejalo.
- Documentá cada uno: qué forma le da al tramo y por qué.

Usá la unidad que ya estableciste —alturas de cuadro por unidad de progreso— para verificar que ningún intermedio introduzca un tirón.

---

# Parte 4 · Variantes de recorrido

**La coreografía calibrada por el humano se guarda intacta.** Es la base y no se pierde.

Además, creá **tres variantes completas** para comparar, cada una con una tesis distinta:

1. **Íntima** — distancias menores, el logo llena más el cuadro, la escena se intuye más que se ve. Más peso al objeto.
2. **Arquitectónica** — más distancia y más aire, el espacio como protagonista. El logo pequeño en un lugar grande.
3. **Dramática** — contrastes de altura mayores, picados y contrapicados marcados, cambios más audaces entre tramos.

Cada variante: recorrido completo, mismos seis tramos, misma cantidad de pantallas. **No son ajustes de la base: son propuestas.** Poné criterio propio — es la oportunidad de proponer ángulos y encuadres que el humano no compuso.

El panel tiene que permitir **cambiar de variante en vivo** y que el editor opere sobre la activa. La base sigue siendo la que se carga por defecto.

---

## Reglas absolutas

1. **No toques el home.** Todo vive en `probe-escena`.
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **No construyas el preloader, ni el efecto Star Wars, ni el logo por servicio, ni el menú.** Son de sprints posteriores: en este sprint solo se documentan.
4. **No sumar dependencias.**
5. **Nada de iconografía de tecnología ni elementos orgánicos.** Sin color: blanco y negro.
6. **Cero `any`.** **Cero `setState` por frame** en el loop.
7. **Nada de base de datos.**
8. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
9. **No corras el dev server ni verifiques en pantalla.**
10. **No auto-confirmás que se ve bien.**
11. Archivos de más de 300 líneas se parten.

## Paradas

🛑 **PARADA 1** — antes de construir: mostrá (a) el índice de `DIRECCION-ESCENA.md`, (b) cómo pensás resolver el sol y en qué tramos calculaste que queda visible, (c) el enfoque del moiré y qué hacés con el aliasing, y (d) cuántos intermedios vas a agregar y en qué tramos. Esperá el OK.

🛑 **PARADA 2** — al cerrar: (a) `tsc`, (b) archivos, (c) `git status`, (d) cómo probar las variantes en el panel, y (e) el costo medido contra el baseline de S6. Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S7: sol, moire, curvatura de tramos y variantes de recorrido"` → `git push`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S7-escena.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Es un sprint de ESCRITURA de código, aislado en /probe-escena.
- NO corras el dev server, NO tomes capturas, NO abras navegador, NO
  despaches visual-qa. Verificación: tsc exit 0 y lint limpio, nada más.
- No tocás el home ni ningún archivo frozen.
- No construís el preloader ni las secciones: solo se documentan.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any. Cero setState
  por frame en el loop.
- Blanco y negro. Sin iconografía de tecnología ni elementos orgánicos.
- Las poses compuestas por el humano no se tocan: los intermedios van
  entre ellas y marcados como derivados.
- Las paradas 🛑 son bloqueantes: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo en pantalla.

Arrancá con la Parte 0. No me confirmes el entendimiento.
```
