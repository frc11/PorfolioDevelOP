# S11 — El sol se apaga, entra la luz

## Cómo correr esta instrucción

- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- **DOS PARADAS 🛑** bloqueantes.
- **NO corras el dev server, NO tomes capturas, NO abras navegador, NO despaches `visual-qa`.** Verificación: `tsc --noEmit` exit 0, eslint limpio, comprobaciones estáticas con `npx tsx`, `npm run build` (necesita `NODE_OPTIONS=--max-old-space-size=8192`; el OOM es preexistente y conocido, no lo investigues).

## Lecturas obligatorias

1. `docs/rediseno/outputs/S10-FONDO.md` — sobre todo el balance de negro, §4.1 y §7.9 (el piso como pendiente, con los seis valores medios ya medidos), y §2.6 (el 2:1 coplanar).
2. `docs/rediseno/outputs/S9-COREOGRAFIA.md` y `DIRECCION-ESCENA.md`.
3. `src/app/probe-escena/_components/` — el módulo entero, con foco en `probeSun.ts`, `SunBody.tsx`, `SunWashout.tsx`, `lightRig.ts`, `probeMoire.ts`, `MoireScreen.tsx`, `StudioFloor.tsx`, `floorMarks.ts`.
4. `__tests__/shading.ts` y `frameProbe.ts` — los instrumentos con los que S10 midió el valor medio del cuadro. Este sprint se juzga con los mismos.

---

## El diagnóstico

S10 hizo visible al sol: de 13–36% de disco tapado a 28–71%, con 109 y 157 puntos de contraste. El humano lo grabó y el veredicto fue que **no se lee como un sol.** Se lee como una mancha clara difusa. El problema no era la visibilidad: era que un sol no es un círculo en el cielo, es una dirección de la que viene la luz.

Y quedó abierto lo del piso: en Hero y Números el cuadro es 65% y 73% de piso liso, el fondo no llega ahí, y el valor medio quedó en 216 y 222.

**Los dos problemas tienen la misma solución y por eso van juntos en un sprint.**

## La idea

Hay un sol afuera y una celosía en el medio. **La luz entra por los huecos.**

El sol deja de ser un objeto que se mira y pasa a ser una dirección que proyecta. Lo que se ve no es el disco: son las bandas de luz y sombra que la celosía dibuja sobre el piso y sobre el logo, barriendo a medida que el sol baja.

Tres cosas que hay que entender antes de construir:

**1. Sobre papel blanco no se puede agregar luz, solo sacarla.** Un haz claro sobre `#F7F7F5` es invisible — es exactamente por qué el disco no se veía. La sombra de la celosía sobre el piso blanco, en cambio, se lee fortísimo. **El elemento visible de este sprint es la sombra, no el rayo.**

**2. La sombra atraviesa las dos capas de la rendija, así que lleva el moiré adentro.** El batido que hoy vive solo en la pared se derrama sobre el piso. Ése es el premio del sprint y es lo que hay que proteger.

**3. El barrido es el reloj.** A medida que el arco avanza y el sol baja, las bandas se corren y se alargan sobre el piso. Ésa es la señal de "está pasando el día", y es la que reemplaza a mirar el sol.

---

## Parte 1 · Se va el disco

- **Eliminá el cuerpo del sol** (`SunBody.tsx` y lo que lo dibuje) y **el washout** (`SunWashout.tsx`).
- **El arco NO se toca.** Azimut, elevación, nivel y kelvin quedan exactos, y `level = sin(elevación)/sin(36°)` sigue valiendo. El arco deja de ser la posición de un objeto y pasa a ser **la fuente de la proyección**. Es el mismo dato con otro consumidor.
- Las comprobaciones que verifican la visibilidad del disco, la ventana en cuadro y el contraste del núcleo se borran o se reemplazan. **Ninguna se deja verde por vacío**: si un check pasa a verificar "el disco nunca está en cuadro" en una escena sin disco, no puede fallar. Aplicá el mismo criterio de control positivo que S10 aplicó a la oclusión.

---

## Parte 2 · La celosía proyecta

El piso, el logo y lo que reciba luz llevan las bandas de la celosía.

### Cómo resolverlo

**Evaluá las dos vías y elegí, con el número:**

**(a) Analítica, en el shader del piso.** Para cada fragmento, dada la dirección al sol, calcular si el rayo pasa por un hueco de cada uno de los dos cilindros. Es exacto, no tiene resolución de mapa de sombras, y **lleva el moiré de las dos capas gratis** porque evalúa las dos. El costo es por fragmento sobre una superficie que ocupa hasta el 78% del cuadro.

**(b) Mapa de sombras con los cilindros como emisores.** Reutiliza el rig existente. Pero: las capas son superficies con alfa, y este repo ya se comió que `<Canvas shadows>` en three 0.182 pide PCFSoft y cae en silencio a sombra sin filtrar. La resolución del mapa puede no alcanzar para el batido, que es lo único que importa acá.

**Mi apuesta es (a), pero decidilo vos con la medición.** Lo que no acepto es elegir por comodidad: reportá el costo de las dos.

### Lo que la proyección tiene que cumplir

- **Se ve el batido en el piso.** Si el moiré no sobrevive a la proyección, el sprint falló. Reportá el período del batido proyectado sobre el piso, en unidades de mundo y en píxeles.
- **Barre con el arco.** Reportá cuánto se desplazan las bandas sobre el piso entre `p = 0` y `p = 1`, en unidades de mundo, y cuánto se alargan. Tiene que ser un movimiento evidente, no una deriva.
- **El logo también la recibe.** Es lo que lo integra al espacio en vez de dejarlo pegado encima.
- **Aliasing.** Mismo método que S7 y S10. Las bandas proyectadas son mucho más grandes que las de la pared vista de frente, pero en incidencia rasante se comprimen. Reportá el peor caso en los cinco recorridos.

### Rayos: solo donde el fondo es oscuro

Los haces de luz visibles —el volumen entre la celosía y el piso— **solo se leen contra fondo oscuro**. Según S10 eso es Quiénes somos, Demos y el cierre; en Hero, Números y Trabajos el cuadro es claro y un haz claro es invisible.

Si los agregás, que sea **modulado por el contraste local**, apagándose donde no se leen, y **medido**: reportá el contraste del haz contra el fondo en cada pose. Si el número dice que en tres poses no aportan nada, ponelos solo en las otras tres o no los pongas. **No los agregues por decoración.**

### 🚫 Prohibido explícitamente

- **Lens flare** en cualquier forma: anillos, hexágonos, destellos, estrías anamórficas.
- **Bloom global** o cualquier resplandor que lave el cuadro entero.
- Cualquier cosa que agregue color. **Blanco y negro.**

Son los tres tells que convertirían esto en un shader de demo. La escena es un lugar con luz entrando, no un efecto.

---

## Parte 3 · El piso

Este sprint absorbe el pendiente que S10 dejó anotado en §4.1 y §7.9. **La proyección es la herramienta principal**, pero el piso puede necesitar más.

Lo que tenés que reportar, con los mismos instrumentos de S10:

- **El valor medio del cuadro en las seis poses**, contra los 216 / 172 / 222 / 208 / 136 / 120 que dejó S10. **Las dos que importan son Hero (216) y Números (222)**: son las que el fondo no puede tocar.
- **Qué fracción del piso queda en sombra** en cada pose.

Si la proyección sola no alcanza, **proponé qué más**, con esta restricción: el piso es una superficie de papel y sigue siéndolo. Se le puede dar textura, grano, o más marcas de replanteo. **No se convierte en otro material ni recibe geometría nueva.** Y las 48 marcas actuales se conservan.

---

## Reglas absolutas

1. **No toques el home.** Todo vive en `probe-escena`.
2. **No toques el preloader ni ningún archivo de `home-intro/`.** Hay trabajo sin commitear ahí que no es tuyo.
3. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
4. **No toques la coreografía de S9** ni los números del arco del sol.
5. **No toques las tramas de la rendija** — ni los radios, ni el desajuste, ni la velocidad. Este sprint las consume, no las cambia.
6. **No construyas el efecto Star Wars.**
7. **No sumar dependencias.** Si necesitás un pase de postprocesado, usá lo que ya está en el proyecto.
8. **Blanco y negro.** Sin lens flare, sin bloom global, sin iconografía de tecnología.
9. **Cero `any`.** **Cero `setState` por frame** en el loop.
10. **Nada de base de datos.**
11. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
12. **No corras el dev server ni verifiques en pantalla.**
13. **No auto-confirmás que se ve bien.** El juicio es del humano, por grabación.
14. **Ninguna comprobación queda verde por vacío.** Control positivo obligatorio en todo check que pase a verificar la ausencia de algo.
15. Archivos de más de 300 líneas se parten.

## Paradas

🛑 **PARADA 1** — antes de construir:

- (a) Qué se borra del sol, archivo por archivo, y qué pasa con sus comprobaciones.
- (b) **Analítica o mapa de sombras**: las dos evaluadas, con el costo de cada una, y cuál elegís.
- (c) **El batido proyectado sobre el piso**: período en mundo y en píxeles, y el peor caso de aliasing en los cinco recorridos.
- (d) **El barrido**: cuánto se corren y se alargan las bandas entre `p = 0` y `p = 1`.
- (e) **El valor medio del cuadro esperado en las seis poses**, contra los seis de S10. Si Hero y Números no bajan, decilo antes de construir.
- (f) Si proponés haces visibles: en qué poses, con qué contraste medido, y por qué no en las otras.
- (g) El costo: draw calls, pases, y qué se apaga primero si mobile no rinde.

Esperá el OK.

🛑 **PARADA 2** — al cerrar: (a) los tres gates, (b) todas las comprobaciones estáticas con los controles positivos declarados, (c) archivos, (d) `git status`, (e) los seis valores medios finales contra los de S10, (f) las cifras de S10 que este sprint invalida. Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S11: el sol como luz, celosia proyectada, piso"` → `git push`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S11-luz.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Es un sprint de luz y piso, aislado en /probe-escena.
- NO corras el dev server, NO tomes capturas, NO abras navegador, NO
  despaches visual-qa. Verificación: tsc exit 0, eslint, comprobaciones
  estáticas con tsx y npm run build. Nada más. El OOM del build es
  preexistente: usá NODE_OPTIONS=--max-old-space-size=8192 y no lo
  investigues.
- NO toques nada de home-intro/: hay trabajo sin commitear que no es tuyo.
  Tampoco el home ni ningún archivo frozen.
- NO toques la coreografía de S9, ni los números del arco del sol, ni las
  tramas de la rendija. Este sprint las consume, no las cambia.
- El elemento visible es la SOMBRA, no el rayo: sobre papel blanco no se
  puede agregar luz, solo sacarla. Si no entendés por qué, releé la
  sección "La idea" antes de empezar.
- PROHIBIDO lens flare en cualquier forma, bloom global, y cualquier cosa
  que agregue color.
- Ninguna comprobación queda verde por vacío: control positivo obligatorio
  en todo check que pase a verificar la ausencia de algo.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any. Cero setState
  por frame en el loop.
- Las paradas 🛑 son bloqueantes: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá por la Parada 1. No me confirmes el entendimiento.
```
