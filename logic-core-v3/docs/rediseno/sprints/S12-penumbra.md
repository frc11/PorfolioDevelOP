# S12 — La penumbra

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`. El working tree está limpio.
- **DOS PARADAS 🛑** bloqueantes.
- **NO corras el dev server, NO tomes capturas, NO abras navegador, NO despaches `visual-qa`.** Verificación: `tsc --noEmit` exit 0, eslint limpio, comprobaciones estáticas con `npx tsx`, `npm run build` (necesita `NODE_OPTIONS=--max-old-space-size=8192`; el OOM es preexistente, no lo investigues).

## Lecturas obligatorias

1. `docs/rediseno/outputs/S11-LUZ.md` — entero. Sobre todo §3.2 (la creciente de sol abierto), §5.4.1 (la corrección de las dos raíces) y los seis valores medios.
2. `src/app/probe-escena/_components/probeCelosia.ts`, `celosiaGeometry.ts`, `celosiaShader.ts` — el modelo de proyección completo.
3. `__tests__/celosia.ts` — el gemelo TS del shader. Es el instrumento con el que se mide todo en este sprint.
4. `__tests__/shading.ts` y `frameProbe.ts`.

---

## El diagnóstico

S11 puso la celosía a proyectar y el humano lo grabó. **La forma es correcta** — la proyección, el alargamiento ×3,6, el barrido, el moiré derramándose sobre el piso. Todo lo que S11 midió se ve.

**El material está mal.** Las bandas se leen como piso embaldosado, no como luz. En Quiénes somos el piso es un damero de rectángulos blancos de borde duro; en el cierre, una senda peatonal.

La causa es física: **el sol no tiene tamaño angular.** Hoy el borde de la sombra lo define solo el filtro de huella de píxel, o sea que es tan filoso como el render lo permita. Un sol real mide medio grado, y eso produce una penumbra cuyo ancho crece con la distancia entre el objeto que tapa y la superficie donde cae la sombra.

Eso explica las dos cosas a la vez:

- **El borde duro** hace que la banda parezca material pintado en vez de luz.
- **La penumbra uniforme** hace que el patrón se lea repetido, como baldosas. Con tamaño angular, cada pedazo de piso se ablanda según su propia distancia a la celosía — y esa variación es lo que distingue una sombra de una textura.

Y hay un tercer efecto que sale gratis: la distancia del rayo crece con `1/tan(elevación)`, igual que el largo de la celda. **Al atardecer la penumbra se ensancha sola**, así que la senda peatonal del cierre se ablanda sin que nadie la toque.

---

## Parte 1 · El sol gana diámetro angular

- **Un parámetro nuevo**: el radio angular del sol. Elegí el valor inicial con criterio —el sol real tiene un radio angular de ~0,266°— y **dejalo como perilla del panel**, porque esto es un estudio estilizado y el valor definitivo se calibra mirando.
- **El ancho de la penumbra se deriva por fragmento**, de la distancia entre el punto del piso y **el punto donde el rayo cruza cada capa**. No es una constante global.
- **Las dos capas tienen penumbras distintas.** La fina está a 38 y la gruesa a 44: la sombra de la gruesa tiene que ser visiblemente más blanda que la de la fina. **Esa diferencia es la mitad del efecto** — es lo que le da profundidad a la sombra y lo que impide que se lea como una sola trama estampada.
- **Se combina con el filtro de huella de píxel que ya existe, no lo reemplaza.** El borde efectivo es el mayor de los dos, no la suma: cerca de la cámara manda la penumbra física, en la lonja rasante manda el filtro. Si los sumás, el piso lejano se lava.

Reportá, con números:

- **El ancho de la penumbra en unidades de mundo**, para cada capa, en las seis poses, y qué fracción de la celda representa.
- **Cómo varía a lo largo del piso** en una misma pose: el ancho en el punto más cercano a la celosía contra el más lejano. Ese contraste es lo que rompe la lectura de baldosa, y quiero el número.
- **Cuánto se ensancha entre `p = 0` y `p = 1`** por el `1/tan(elevación)`.

---

## Parte 2 · Las tres cosas que compiten ⚠️

Este sprint tiene una tensión real y hay que resolverla con mediciones, no con gusto. Ablandar el borde **quita contraste**, y S11 acaba de comprar contraste con mucho trabajo.

**(1) El contraste que S11 compró.** El rango del papel pasó de 12,5 a 29,6 puntos y los seis valores medios quedaron en **201 / 166 / 213 / 185 / 129 / 104**. Una penumbra ancha promedia luz y sombra y sube esos valores de vuelta. **Medí los seis con el sol ya con tamaño, y reportalos contra esos.** Si Hero vuelve a subir de 210, el sprint está deshaciendo el anterior y hay que decirlo antes de construir.

**(2) El batido en el piso.** S11 midió amplitudes de 10,8 · 7,1 · 13,1 · 6,5 puntos. El batido vive de la interferencia entre dos tramas de borde definido: si la penumbra se come el borde, el moiré del piso desaparece y queda una degradé. **Reportá la amplitud del batido con penumbra, contra esos cuatro números.**

**(3) La lectura de baldosa, que es lo que vinimos a arreglar.** Necesita penumbra suficiente y sobre todo **variable**.

Las tres tiran para lados distintos. **En la Parada 1 quiero las tres medidas contra el mismo barrido del parámetro** —al menos cuatro valores del radio angular, incluido 0 como control— para poder elegir mirando la tabla. Si no existe un valor que las satisfaga a las tres, decilo: la salida sería que la penumbra la ponga solo la capa gruesa.

---

## Parte 3 · Lo que NO cambia

- **El arco del sol**: azimut, elevación, nivel, kelvin. Intactos.
- **`CELOSIA_SKY_SHARE` y el factor de cielo.** El sol gana tamaño para la sombra; la oclusión del cielo es otra cuenta y no se toca.
- **`CELOSIA_BAR` = 0,29** y las tramas de la rendija: radios, celdas, desajuste, velocidad. Nada.
- **La coreografía de S9.**
- **La creciente de sol abierto** de §3.2 es física correcta y se queda. Con penumbra su borde se ablanda solo — reportá cuánto, no lo toques.

## 🚫 Prohibido

- **Lens flare** en cualquier forma. **Bloom global.** Cualquier cosa que agregue **color**.
- **Sombras suaves falsas**: nada de desenfocar el resultado ni de aplicar un blur al piso. La penumbra sale del modelo o no sale.

---

## Reglas absolutas

1. **Solo el modelo de borde del gobo.** Si necesitás tocar algo que no sea eso, **frená y reportá**.
2. **No toques `home-intro/`** — el preloader acaba de cerrarse y está commiteado.
3. **No toques el home.**
4. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
5. **No sumar dependencias.** **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.**
6. **Ninguna comprobación queda verde por vacío.** Control positivo obligatorio, con el criterio que ya usaron S10, S11 y S8e — y que en los tres encontró algo real.
7. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
8. **No corras el dev server ni verifiques en pantalla.**
9. **No auto-confirmás que se ve bien.** El juicio es del humano, por grabación.
10. Archivos de más de 300 líneas se parten. La deuda de §7.13 no se toca acá.

## Paradas

🛑 **PARADA 1** — antes de construir:

- (a) El modelo de penumbra: de dónde sale el ancho por fragmento y cómo se combina con el filtro de píxel.
- (b) **La tabla de la tensión**: al menos cuatro valores del radio angular más el control en 0, y para cada uno los seis valores medios, la amplitud del batido en las cuatro poses, y el ancho de penumbra cerca y lejos.
- (c) Cuál valor proponés y por qué.
- (d) El ancho de penumbra de cada capa y su variación a lo largo del piso.
- (e) El costo: ops por fragmento contra las ~200 de S11.
- (f) Si ningún valor satisface las tres, la alternativa.

Esperá el OK.

🛑 **PARADA 2** — al cerrar: (a) los tres gates, (b) todas las comprobaciones con los controles positivos declarados, (c) archivos, (d) `git status`, (e) los seis valores medios finales contra 201/166/213/185/129/104, (f) la amplitud del batido final contra 10,8/7,1/13,1/6,5, (g) las cifras de S11 que este sprint invalida. Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S12: penumbra angular del sol"` → `git push`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S12-penumbra.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Es un sprint chico y quirúrgico: cambia el modelo de BORDE de la sombra
  de la celosía. Nada más.
- NO corras el dev server, NO tomes capturas, NO abras navegador, NO
  despaches visual-qa. Verificación: tsc exit 0, eslint, comprobaciones
  estáticas con tsx y npm run build. El OOM del build es preexistente:
  usá NODE_OPTIONS=--max-old-space-size=8192 y no lo investigues.
- NO toques home-intro/, ni el home, ni ningún archivo frozen, ni la
  coreografía, ni el arco del sol, ni el factor de cielo, ni CELOSIA_BAR,
  ni las tramas de la rendija.
- La penumbra sale del MODELO: del tamaño angular del sol y de la
  distancia a cada capa, por fragmento. PROHIBIDO desenfocar el resultado
  o aplicar un blur: eso no es penumbra, es maquillaje.
- PROHIBIDO lens flare, bloom global y cualquier cosa que agregue color.
- Ablandar el borde quita contraste, y S11 lo compró con trabajo. En la
  Parada 1 quiero los seis valores medios y la amplitud del batido para
  varios valores del parámetro, con el control en 0. Si ningún valor
  satisface las tres cosas a la vez, decilo en vez de elegir uno.
- Ninguna comprobación queda verde por vacío: control positivo obligatorio.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any. Cero setState
  por frame en el loop.
- Las paradas 🛑 son bloqueantes: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá por la Parada 1. No me confirmes el entendimiento.
```
