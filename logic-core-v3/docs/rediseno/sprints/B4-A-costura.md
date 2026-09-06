# B4-A — La costura

Los cinco cabos que quedaron colgando entre B2 y B3.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **NO `ultracode`.** Son cinco arreglos chicos sobre superficies que se tocan entre sí: los subagentes se pisarían.
- **Worktree:** `C:\v3-costura`, rama **`v3/costura`**. Sesión en `C:\v3-costura\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar.
- **Corre en paralelo con B4-B (la medición), en otro worktree.**

## ⚠️ El puerto es 3001

```powershell
npm run dev -- -p 3001
```

La otra sesión usa el 3002. **Si medís en otro puerto, medís el sitio de otro.**

Chrome al frente, y la receta de `docs/rediseno/MEDICION-NAVEGADOR.md`.

⚠️ **El build va en primer plano.** Y el chequeo de procesos filtra **por línea de comando**, no por conteo: hay tres `node` permanentes que son `chrome-devtools-mcp` y **no se matan**. Ventana de **horas**, no de día — la del día falla después de medianoche.

⚠️ **Y una regla que B2 descubrió:** una tarea mandada a fondo **sí deja salida si redirigís a un archivo**. Es lo que le faltó a B1 cuando tres tareas murieron sin dejar rastro.

---

## Por qué existe este lane

B2 y B3 corrieron en paralelo con zonas disjuntas. Funcionó — **pero cada uno dejó trabajo que caía en la zona del otro.** Esto lo junta.

**Ninguno de los cinco es construcción nueva.** Son montaje y cierre.

---

## 1 · Montar la marca 🔴

B3 construyó la marca en **tres registros** —logotipo, separador y prefijo— con su galería, sus invariantes y todo verificado. **Y no la montó**, porque el rótulo, el pie y la pastilla caen en `_secciones/` y en la geometría de la pastilla, que eran de B2.

Cierra el diagnóstico de Franco:

> *Lo que lo haría funcionar es el sistema, no el objeto — logotipo, separador, prefijo y objeto operando como conjunto.*

- **Montá las piezas donde ya hay marca**: el rótulo de sección, el pie y la pastilla. **No inventes lugares nuevos** — si el sistema pide una aparición que no existe, **frená y reportá**.
- ⚠️ **La geometría de la pastilla arriba de 1025 está aprobada por grabación.** Si el separador o el prefijo la mueven un píxel, **reportalo con el número.**
- ⚠️ **Instrument Serif tiene UNA sola aparición en todo el sitio y todavía no está decidida.** B3 dejó una propuesta. **Si la montás, es la única**: verificalo con una comprobación que cuente sus apariciones en el árbol renderizado.
- **Sobre fondo oscuro el acento va como relleno o subrayado, nunca como texto** — 2,71 · 2,99 · 2,46.
- **Captura de antes y después** del rótulo, el pie y la pastilla, a 1920.

## 2 · La meseta de Trabajos 🔴

**Es el único defecto visible de los cinco.** B2 lo midió: **en `scrollY` 8640 y 9720 los tres planos quedan invisibles a la vez un instante.** El visitante ve la sección oscura vacía en medio del pin.

La causa: el contrato **no expone el corte llegada/salida de P7** —3 y 3,5— y `s7-contrato §3` prohíbe que una sección importe un valor de `_lib/motion/`. B2 frenó bien.

- **Exponé el corte en el contrato**, que es donde va: `s7-contrato §3` protege que una sección no lea de motion, y la salida correcta es que el contrato lo intermedie, no que se afloje la regla.
- **Construí la meseta:** cada proyecto llega, **se queda**, y sale. **Ningún instante con los tres invisibles.**
- **Verificalo con scroll real**, y con una comprobación que barra el pin entero y afirme que **siempre hay al menos un plano visible.** Con control positivo.
- ⚠️ **B2 midió que el primer proyecto se ve la mitad de tiempo que los otros** —~540 px contra ~800— y eligió dejarlo porque igualarlos abría el hueco de 0,78 a 1,44 pantallas y el gate es el máximo. **Esa decisión se respeta.** Si la meseta la cambia, **reportá el hueco nuevo antes de dejarla.**
- **`trabajos/contenido.ts` declara `PATRONES_DE_LA_SECCION = ['P7']` y la sección consume dos.** Sincronizalo: el invariante publica la desincronización a propósito y ahora se puede cerrar.

## 3 · Los 24 px de Por qué develOP

La sección se pasa **24 px de su alto declarado a 1440**. Y B2 encontró algo peor: **el modelo de P5 de su invariante subestima el defecto en un 50%.**

- **Arreglá el modelo primero.** Un instrumento que subestima no puede ser el árbitro del arreglo. Con control positivo.
- **Después el desborde**, con el número real.
- ⚠️ **El ancla del diferencial está en 0,8525 y el contraste del titular en 4,98:1.** Los dos costaron tres sprints. **Verificá que no se muevan.**

## 4 · `s5-peso`: 61,3 KiB contra 60

Es lo único que impide que `verificar` cierre en cero.

- **Averiguá de dónde salen los 1,3 KiB de más** antes de decidir nada.
- **Si es peso propio del lane, achicalo.** Si es heredado, **la regla 13 dice que se publica, no se afirma**: re-fijá el techo con el número real y su dueño.
- **No aflojes el techo sin la causa.** Un presupuesto que se sube cada vez que se pasa no es un presupuesto.

## 5 · Los dos contadores que no coinciden

`s5-codigo §8` cuenta uno de más que `s6-lane §7` y `s7-contrato §7`.

**Uno de los tres está mal.** Averiguá cuál, arreglalo, y **escribí por qué difería** — es la clase de cosa que hace que dos cifras publicadas del mismo repo no se puedan comparar.

---

## Reglas absolutas

1. **Rama `v3/costura`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`** — cualquier escritura de git en el árbol lo pasa a CRLF. Para leer `HEAD`: `git show HEAD:<ruta>`. **Nunca `git add .`**
2. **No toques `_lib/escena/`, ni `anclaje.ts`, ni `recorrido.ts`, ni las alturas de `secciones.ts`.** B2 y B3 acaban de calibrarlas. Si necesitás una, **frená y reportá.**
3. **No toques el preloader, el contenido, el home actual, `/probe-escena`, `scene-camera.ts` ni los frozen** (`3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`).
4. **No escribas instrumentos de medición nuevos que no sean de tus cinco puntos.** La otra sesión está midiendo: si duplicás, van a chocar al mergear.
5. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
6. **No sumar dependencias.** **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
7. **Ninguna afirmación se afloja.** **Ninguna comprobación verde por vacío.**
8. **Regla 11:** toda cifra con su instrumento, y la captura es evidencia. **13:** se afirma lo propio, se publica lo heredado. **15:** se afirma la propiedad, no el literal.
9. **PowerShell:** no hay `&&`, no hay heredoc.
10. **No auto-confirmás que se ve bien.**
11. Archivos de más de 300 líneas se parten. Los heredados exceptuados, no.
12. ⚠️ **Si morís por cuota, no des por hecho tu trabajo:** reportá qué quedó incompleto.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `verificar` **en cero**, build en primer plano, y `frontera`.
- (b) **La marca montada**: dónde, con capturas de antes y después, y si movió la pastilla.
- (c) **Instrument Serif**: si la montaste, dónde, y la comprobación de que es única.
- (d) **La meseta**: la comprobación que barre el pin, el hueco resultante, y el reparto de los tres proyectos.
- (e) **Los 24 px**: el modelo arreglado, el defecto real, y que el ancla y el contraste no se movieron.
- (f) **`s5-peso`**: de dónde salían los 1,3 KiB y qué hiciste.
- (g) **Los contadores**: cuál estaba mal y por qué difería.
- (h) Archivos y `git status`.
- (i) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "B4-A: la costura"` → `git push -u origin v3/costura`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/B4-A-costura.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\v3-costura, rama v3/costura. Corre EN PARALELO con otra
  sesión de MEDICIÓN en C:\v3-medicion.
- ⚠️ TU PUERTO ES EL 3001. La otra sesión usa el 3002. Si medís en otro
  puerto estás midiendo el sitio de otro y no te vas a enterar.
- NO uses subagentes: son cinco arreglos chicos sobre superficies que se
  tocan, y se pisarían.
- Ninguno de los cinco es construcción nueva: son MONTAJE y CIERRE. Las
  piezas de la marca ya están construidas y verificadas por otro sprint;
  vos las enchufás.
- NO toques _lib/escena/, anclaje.ts, recorrido.ts ni las alturas de
  secciones.ts: dos sprints acaban de calibrarlas. Tampoco el preloader, el
  contenido, el home actual, /probe-escena, scene-camera.ts ni los frozen.
- NO escribas instrumentos de medición que no sean de tus cinco puntos: la
  otra sesión está midiendo y van a chocar al mergear.
- La meseta de Trabajos es el único defecto visible: hoy en scrollY 8640 y
  9720 los tres planos quedan invisibles a la vez. La salida NO es aflojar
  s7-contrato §3 —que protege que una sección no lea de motion— sino que el
  CONTRATO intermedie el corte de P7.
- El primer proyecto se ve la mitad de tiempo que los otros y eso fue una
  DECISIÓN medida: se respeta. Si la meseta la cambia, reportá el hueco
  nuevo antes de dejarla.
- En los 24 px: arreglá primero el MODELO del invariante, que subestima el
  defecto un 50%. Un instrumento que subestima no puede ser el árbitro.
- s5-peso: averiguá de dónde salen los 1,3 KiB ANTES de decidir. No aflojes
  el techo sin la causa: un presupuesto que se sube cada vez que se pasa no
  es un presupuesto.
- El build va EN PRIMER PLANO. El chequeo de procesos filtra por LÍNEA DE
  COMANDO y con ventana de HORAS: hay tres node permanentes que son
  chrome-devtools-mcp y no se matan.
- Ninguna afirmación se afloja. Ninguna comprobación verde por vacío. Toda
  cifra con su instrumento, y la captura es evidencia.
- Git: commit y push en v3/costura. PROHIBIDO merge, reset, rebase, push
  --force, checkout que descarte, y git stash. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- Si morís por cuota, no des por hecho tu trabajo: reportá qué falta.

Arrancá. No me confirmes el entendimiento.
```
