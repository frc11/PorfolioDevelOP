# B9 — Cada cosa a su tiempo

Que los elementos entren cuando el visitante los está mirando, no antes ni después.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `ultracode`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\v3-sincronia`, rama **`v3/sincronia`**. Sesión en `C:\v3-sincronia\logic-core-v3`.
- **DOS PARADAS 🛑.** La primera es bloqueante: la medición antes de tocar un rango.
- **Corre en paralelo con B8 (la luz), en otro worktree.**

## ⚠️ El puerto es 3002

```powershell
npm run dev -- -p 3002
```

La otra sesión usa el 3001. Chrome **al frente** — con `visibilityState: "hidden"` no corre `requestAnimationFrame` y **toda medición de scroll da cero**.

## ⚠️ La zona prohibida, y es lo que hace posible el paralelo

**La otra sesión está trabajando en la luz de la escena y en el efecto de Trabajos.**

**No toques, por ninguna razón:**

- **`_secciones/trabajos/`** — es de ella, incluida su instancia de P7
- **`_lib/escena/`**, el arco del sol, las partículas, las superficies
- **`superficies.ts`** y `theme-develop.css`

**Si un defecto de sincronía cae en Trabajos, NO lo arregles: dejalo anotado como diferido con su número.** Chocar acá cuesta más que el defecto.

⚠️ **El build en primer plano**, `CIRCLE_NODE_TOTAL=2` y `--max-old-space-size=6144`, con el chequeo de procesos **por ruta de worktree**. ⚠️ **Nunca `git stash`, `checkout`, `restore` ni ninguna escritura de git en el árbol.** Para leer `HEAD`: `git show HEAD:<ruta>`.

---

# El diagnóstico

El humano lo describió así:

> *"Hay varias cosas que aparecen o antes de que estén en pantalla, o cuando ya se está yendo la pantalla. Todas las cosas deberían aparecer coordinadas cuando está pasando la pantalla por ellas. Un ejemplo serían los datos del Por qué develOP: mirá dónde recién empiezan a aparecer."*

**Y está capturado.** En Por qué develOP, los cuatro bloques del diferencial —"Software propio", "Un panel, no un informe", "Clientes con nombre", "Entrega medida"— están en **opacidad baja cuando la sección ya está saliendo de pantalla**. Terminan de entrar cuando nadie los mira.

## La hipótesis, que hay que confirmar midiendo

**El rango de scroll de cada instancia de patrón está anclado a la SECCIÓN, no al ELEMENTO.**

Si es así, en una sección de dos pantallas un bloque que vive abajo **empieza a entrar cuando la sección entra** —mucho antes de estar en cuadro— y termina cuando la sección termina, que puede ser después de que salió.

⚠️ **Confirmá la hipótesis antes de actuar sobre ella.** Puede ser otra cosa: un `offset` mal elegido, un `stagger` que corre el último elemento demasiado, o una sección cuyo alto declarado no coincide con lo que renderiza.

---

# §1 · La medición 🔴

## 1.1 El instrumento

**Para cada instancia de patrón del sitio**, con scroll real en el navegador:

| dato | por qué |
|---|---|
| **La ventana visible del elemento**: en qué `scrollY` su caja entra en el viewport y en cuál sale | Es la vara |
| **La ventana de su animación**: en qué `scrollY` empieza a moverse y en cuál llega a su estado final | Lo que hace hoy |
| **El desfase entre las dos**, en píxeles y en fracción de pantalla | El defecto, cuantificado |
| **Qué fracción de su animación ocurre fuera de cuadro** | Lo que el visitante se pierde |
| **Y el peor caso por sección** | Para ordenar |

⚠️ **Medí el elemento renderizado, no lo declarado.** Un `getBoundingClientRect` sobre el elemento real, no el alto que `secciones.ts` dice que tiene.

## 1.2 Contra la referencia

**Se mide, no se copia. Una navegación, una medición.**

| medición | por qué |
|---|---|
| **Cuándo dispara una entrada en nk**: a qué distancia del borde inferior del viewport el elemento empieza a moverse | El anclaje que usan |
| **Cuándo termina**: si llega a su estado final al centro, al tercio, o antes de salir | |
| **Cuánto dura en píxeles de scroll**, no en segundos | Los nueve patrones son `scrub`, así que la duración real es distancia |
| **Si el escalonado corre el disparo del último elemento** y cuánto | Es la causa más probable de que el último bloque llegue tarde |

## 1.3 La lista

**Ordenada por desfase, no por sección.** Con el peor caso arriba, y marcando cuáles caen en Trabajos —que se difieren.

## 🛑 PARADA 1 — bloqueante

- (a) **La hipótesis confirmada o refutada**, con el número. Si es otra cosa, decí cuál.
- (b) **La tabla de desfases**, ordenada.
- (c) **La medición contra la referencia.**
- (d) **La regla que proponés** para derivar el rango, y qué instancias no la cumplen hoy.

Esperá el OK.

---

# §2 · La regla

**El rango de una animación se deriva de la ventana visible del elemento, no de la sección que lo contiene.**

Y con dos condiciones que salen de lo que el humano pidió — *"coordinadas cuando está pasando la pantalla por ellas"*:

- **Empieza cuando el elemento entra en cuadro**, no antes.
- **Termina antes de que salga**, no después.

## 2.1 Lo que hay que respetar

⚠️ **B2 calibró el ritmo del sitio y el gate era el hueco máximo entre acontecimientos: 1,11 pantallas, mejor que las 1,56 de la referencia.** Mover los rangos **mueve los acontecimientos.**

- **Corré el censo de B2 antes y después.** Si el hueco máximo empeora, **frená y reportá**: puede que sincronizar bien abra un pozo, y eso es una decisión.
- ⚠️ **El progreso tiene que seguir siendo monótono y exactamente reversible.** Los nueve patrones lo asumen.
- **Los nueve patrones no se rediseñan.** Cambia **cuándo** se disparan, no **qué** hacen.
- **La secuencia sincronizada de Servicios** —un `sticky`, un progreso, tres canales— **es un caso aparte**: ahí el disparo es el progreso del pin y está bien. **Verificá que siga bien, no la conviertas en otra cosa.**

## 2.2 El escalonado

Si el escalonado es la causa —el último elemento de un grupo llega tarde porque su retardo lo corre—, hay dos salidas y **elegí con el número**:

- **Que el grupo entero entre adentro de la ventana**, comprimiendo el escalonado.
- **Que cada elemento tenga su propia ventana**, y el escalonado sea una consecuencia de que están a distinta altura.

⚠️ **La segunda es más fiel a lo que el humano pidió**, pero cambia el carácter del gesto: un escalonado deja de leerse como un grupo. **Medí las dos y proponé.**

---

# §3 · Aplicarla

**Sección por sección, con Trabajos excluida.**

Y una en particular, que es la que el humano señaló:

**Por qué develOP.** Cuatro bloques que hoy terminan de entrar cuando la sección ya está saliendo. Es el peor caso conocido y el que se juzga primero.

⚠️ **No cambies el contenido ni la composición.** Solo **cuándo** entra cada cosa.

---

## Reglas absolutas

1. **Rama `v3/sincronia`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`**. **Nunca `git add .`**
2. ⚠️ **La zona prohibida**: `_secciones/trabajos/`, `_lib/escena/`, `superficies.ts`, `theme-develop.css`. **Son de la sesión vecina.**
3. **No toques el contenido, ni la composición, ni el anclaje de la escena, ni el preloader, ni el home actual, ni `/probe-escena`, ni los frozen** (`3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`).
4. **No rediseñes ningún patrón.** Los nueve están medidos: cambia **cuándo** disparan.
5. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
6. **De la referencia se MIDE, no se copia.** Una navegación, una medición.
7. **No sumar dependencias.** **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
8. **Ninguna afirmación se afloja.** Si describe una decisión que cambió, **se reescribe contra la propiedad nueva** — regla 15.
9. **Ninguna comprobación verde por vacío, ni verde por arnés.**
10. **Regla 11:** toda cifra con su instrumento, y la captura es evidencia.
11. **PowerShell:** no hay `&&`, no hay heredoc.
12. **No auto-confirmás que se ve bien.** Podés decir *"el desfase del peor bloque pasó de 1,8 pantallas a 0,05"*. **No podés decir "ahora entra bien": eso lo juzga el humano grabando.**
13. Archivos de más de 300 líneas se parten. Los heredados exceptuados, no.
14. ⚠️ **Si morís por cuota, no des por hecho tu trabajo:** reportá qué quedó incompleto. Y un `workflow` que devuelve `completed` en pocos segundos **no terminó.**

## 🛑 PARADA 2 — al cerrar

- (a) `verificar` **en cero**, build en primer plano, y `frontera`.
- (b) **La tabla de desfases, antes y después**, instancia por instancia. **Es el gate del bloque.**
- (c) **Qué fracción de cada animación ocurre fuera de cuadro**, antes y después.
- (d) **El censo de acontecimientos de B2**, antes y después, con el hueco máximo contra 1,11.
- (e) **Por qué develOP**, con capturas de antes y después en el mismo `scrollY`.
- (f) **Qué pasó con el escalonado** y cuál de las dos salidas elegiste.
- (g) **Que Servicios sigue siendo una secuencia sincronizada** y no se convirtió en otra cosa.
- (h) **Lo diferido de Trabajos**, con su número.
- (i) Capturas, archivos y `git status`.
- (j) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "B9: cada cosa a su tiempo"` → `git push -u origin v3/sincronia`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/B9-sincronia.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Worktree C:\v3-sincronia, rama v3/sincronia. Corre EN PARALELO con otra
  sesión en C:\v3-luz que está trabajando la luz de la escena y el efecto
  de Trabajos.
- ⚠️ TU PUERTO ES EL 3002. La otra usa el 3001. Chrome AL FRENTE: con la
  pestaña oculta toda medición de scroll da cero.
- ⚠️ ZONA PROHIBIDA: _secciones/trabajos/ —incluida su instancia de P7—,
  _lib/escena/, superficies.ts y theme-develop.css. Si un defecto cae ahí,
  DEJALO DIFERIDO con su número.
- EL DEFECTO: las cosas entran antes de estar en pantalla o terminan de
  entrar cuando ya se fueron. El caso capturado son los cuatro bloques del
  diferencial, en opacidad baja cuando la sección ya sale.
- LA HIPÓTESIS es que el rango de cada patrón está anclado a la SECCIÓN y no
  al ELEMENTO. CONFIRMALA MIDIENDO antes de actuar: puede ser un offset, un
  escalonado que corre el último, o un alto declarado que no coincide con lo
  que se renderiza.
- Medí el elemento RENDERIZADO, no lo declarado.
- La regla: el rango se deriva de la ventana visible del elemento. Empieza
  cuando entra en cuadro, termina antes de que salga.
- ⚠️ B2 calibró el ritmo y su gate era el hueco máximo entre
  acontecimientos: 1,11 pantallas, mejor que las 1,56 de la referencia.
  Mover los rangos mueve los acontecimientos: corré su censo antes y
  después, y si el hueco empeora FRENÁ Y REPORTÁ.
- NO rediseñes ningún patrón: los nueve están medidos. Cambia CUÁNDO
  disparan, no QUÉ hacen. Y la secuencia sincronizada de Servicios es un
  caso aparte: verificá que siga bien, no la conviertas en otra cosa.
- NO toques el contenido, la composición, el anclaje de la escena, el
  preloader, el home actual, /probe-escena ni los frozen.
- De la referencia se MIDE, no se copia. Una navegación, una medición.
- El build en primer plano, con el chequeo de procesos por RUTA DE
  WORKTREE. NUNCA git stash, checkout ni restore.
- Git: commit y push en v3/sincronia. PROHIBIDO merge, reset, rebase, push
  --force. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- PowerShell: no hay &&, no hay heredoc.
- EL GATE DEL BLOQUE es la tabla de desfases antes y después, instancia por
  instancia.

Arrancá por la §1. No me confirmes el entendimiento.
```
