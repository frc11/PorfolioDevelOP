# B10 — Cerrar el merge

Dos archivos que crecieron al resolver conflictos a mano, y un peso que hay que re-medir.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **NO `ultracode`.** Son tres cosas chicas y acopladas: la tercera depende de que las dos primeras no muevan el peso.
- **Worktree:** `C:\rediseno-home`, rama **`rediseno/home`**. Sesión en `C:\rediseno-home\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar.

⚠️ **El árbol tiene un merge sin commitear.** `verificar` da **28 pasos con 2 en falla** y ésas son exactamente las tres cosas de este sprint. **No commitees el merge hasta que estén.**

⚠️ **El build en primer plano**, `CIRCLE_NODE_TOTAL=2` y `--max-old-space-size=6144`, con Chrome y los dev servers cerrados. El chequeo de procesos **por ruta de worktree**.

⚠️ **Nunca `git stash`, `checkout`, `restore` ni ninguna escritura de git en el árbol** — con `core.autocrlf` lo pasa a CRLF. Para leer `HEAD`: `git show HEAD:<ruta>`.

---

## Por qué existe

Cuatro ramas se mergearon a `rediseno/home` y **los conflictos los resolvió el humano a mano**, conservando los dos lados en cada uno. Funcionó, pero **dos archivos cruzaron el techo de 300 líneas** y el presupuesto quedó con seis montajes que **no son sumables**.

**Ninguna de las tres fallas es de código.** Las tres son del merge.

---

# §1 · `s5-presupuesto.ts` — 356 líneas

**Es casi todo docblock:** seis recibos de presupuesto acumulados de B4-A, B7, B6-A, B9 y B8, cada uno con su medición, su alternativa descartada y su reparto por dueño.

**El texto se muda, las constantes se quedan.**

- **Creá `src/app/v3/_lib/__tests__/s5-presupuesto-recibos.ts`** con los recibos completos, uno por dueño.
- **En `s5-presupuesto.ts` quedan las siete constantes**, cada una con un docblock corto —qué es, cuánto, quién lo decidió— y **un puntero al recibo completo.**
- ⚠️ **Ni una palabra del recibo se pierde.** Es lo que hace que cada línea sea revocable, y es la razón por la que se partió en constantes con nombre en vez de un número único. **Si algo no entra, entra igual en el archivo nuevo.**

⚠️ **Y verificá que el archivo nuevo no quede él mismo arriba de 300.** Si pasa, se parte por dueño en dos, no se recorta.

## Lo que hay que revisar de paso

**Yo hice la cirugía de los conflictos y pude haber roto algo.** Verificá contra `git show HEAD:<ruta>` de cada rama:

- **Que las siete constantes tengan el valor de su rama de origen**, no el de otra.
- **Que `MONTAJES_DECLARADOS_KIB` sume los seis montajes más el heredado**, sin repetir ni faltar.
- ⚠️ **`MONTAJE_DE_B8_KIB` es negativo (−0,09) a propósito**: el velo pesaba más que la noche. Si lo ves y te parece un error, no lo es.

---

# §2 · `coreografia.tsx` — 305 líneas

Se pasa **por cinco**. Es el contrato que consumen las ocho secciones y **su cabecera es un docblock de unas cincuenta líneas.**

- **Mudá el docblock de cabecera** a `coreografia.doc.md`, en la misma carpeta.
- **En el `.tsx` queda un resumen de tres o cuatro líneas** que diga qué es el contrato y apunte al `.md`.
- ⚠️ **Ni una línea de código se toca.** El archivo compila igual antes y después: lo único que cambia es dónde vive la prosa.

⚠️ **Verificá que no quede otro docblock largo adentro** que sirva mejor mudar. Los de `lente` y `rango` explican decisiones de dos sprints distintos y **conviene que queden donde están**, al lado de su campo.

---

# §3 · El peso: no se arregla, se re-mide 🔴

**`s5-peso` falla con 62,4 KiB reales contra 62,03 declarados.** Y la causa está escrita en el propio archivo:

> Los seis montajes se midieron sobre **árboles distintos**. B7 y B6-A corrieron en paralelo sobre el mismo commit y **publicaron 0,15 y 1,35 de heredado porque midieron en dos entornos que dieron 1,16 KiB de diferencia sin atribuir**. B9 midió sobre el suyo. B8 re-midió sobre el árbol mergeado **pero sin B9 adentro**.

**Sumar esos números es aritmética sobre cifras no comparables.**

## Qué hacer

**Re-medí el heredado sobre este árbol**, con el mismo instrumento que B8 usó — `scripts-b8/peso.ts`, los mismos chunks propios, la misma resta del preámbulo de Sentry.

- **Un build aislado** con su `distDir` propio, agregado a `.gitignore` **antes** de construir.
- **El reparto completo:** chunks propios, crudo, preámbulo restado, escrito por el lane.
- **Y la resta:** lo escrito menos las seis líneas con nombre. **Eso es el heredado real de este árbol.**

⚠️ **NO toques el techo.** Los 60 KiB del lane siguen siendo el techo viejo y **cada montaje se resta de él**. Si al re-medir el heredado la afirmación cierra, cierra sola. **Si no cierra, frená y reportá con el número** — puede que el merge haya sumado peso que nadie declaró, y eso es un hallazgo, no un ajuste.

⚠️ **Y las cifras viejas no se borran: se marcan como medidas en otro árbol**, con la razón. Es lo que impide que alguien las vuelva a sumar.

## Lo que puede pasar y hay que reportar

**Si el heredado real es mucho mayor que los 0,07 de B8**, significa que **el merge trajo peso sin dueño**. Reportalo con el número y **no lo escondas adentro del heredado**: un heredado que crece cada merge deja de ser una cifra y pasa a ser un cajón.

---

## Reglas absolutas

1. **Rama `rediseno/home`, con el merge sin commitear.** ⚠️ **No commitees hasta que `verificar` cierre** salvo las fallas que yo autorice.
2. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`**. **Nunca `git add .`**
3. **Ni una línea de código de producto se toca.** Este sprint mueve prosa y re-mide un número.
4. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
5. **No toques la escena, ni el preloader, ni las secciones, ni el contenido, ni el home actual, ni `/probe-escena`.**
6. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
7. **No sumar dependencias.** **Cero `any`.** **Nada de base de datos.**
8. **Ninguna afirmación se afloja.** **Ninguna comprobación verde por vacío, ni verde por arnés.**
9. **Regla 11:** toda cifra con su instrumento. **13:** se afirma lo propio, se publica lo heredado. **15:** se afirma la propiedad, no el literal.
10. **PowerShell:** no hay `&&`, no hay heredoc.
11. Archivos de más de 300 líneas se parten. **Los heredados exceptuados siguen exceptuados** — este sprint no los toca.

## 🛑 PARADA ÚNICA — al cerrar

- (a) `verificar` **en cero**, `tsc`, el build en primer plano, y `test:frontera`.
- (b) **Los dos archivos**, con su cuenta de líneas antes y después, y **la del archivo nuevo.**
- (c) **Que ni una palabra de los recibos se perdió**, y cómo lo verificaste.
- (d) **Las siete constantes con su valor de origen**, verificadas contra `git show` de cada rama.
- (e) **El peso re-medido**: el reparto completo, el heredado real de este árbol, y si la afirmación cierra.
- (f) **Si el heredado creció**, cuánto y de dónde puede venir.
- (g) Archivos y `git status`.
- (h) **Todo lo que frenó.**

Esperá el OK. **Yo commiteo el merge, no vos.**

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/B10-cerrar-el-merge.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\rediseno-home, rama rediseno/home. ⚠️ EL ÁRBOL TIENE UN MERGE
  SIN COMMITEAR de cuatro ramas, y los conflictos los resolví YO a mano. Las
  tres fallas de verificar son consecuencia de eso, no de código.
- NO uses subagentes: son tres cosas chicas y acopladas.
- NO COMMITEES NADA. Yo commiteo el merge cuando vos cierres.
- Este sprint MUEVE PROSA y RE-MIDE UN NÚMERO. Ni una línea de código de
  producto se toca.
- s5-presupuesto.ts (356 líneas) y coreografia.tsx (305) cruzaron el techo
  porque yo conservé los dos lados de cada conflicto. Se parten mudando el
  TEXTO, no las constantes ni el código.
- ⚠️ NI UNA PALABRA DE LOS RECIBOS SE PIERDE: son lo que hace que cada línea
  del presupuesto sea revocable. Si algo no entra, entra en el archivo nuevo.
- Verificá contra `git show HEAD:<ruta>` de cada rama que las siete
  constantes tengan el valor de SU rama de origen: hice cirugía a mano y
  pude haber roto algo. MONTAJE_DE_B8_KIB es negativo (−0,09) a propósito.
- ⚠️ EL PESO NO SE ARREGLA, SE RE-MIDE. Los seis montajes se midieron sobre
  ÁRBOLES DISTINTOS —B7 y B6-A en dos entornos con 1,16 KiB de diferencia
  sin atribuir, B9 en el suyo, B8 en el mergeado sin B9— y sumarlos es
  aritmética sobre cifras no comparables. Re-medí el heredado sobre ESTE
  árbol con el instrumento de B8 (scripts-b8/peso.ts), con un distDir
  aislado agregado a .gitignore ANTES del build.
- NO toques el techo de 60. Si al re-medir la afirmación no cierra, FRENÁ Y
  REPORTÁ con el número: puede que el merge haya sumado peso sin dueño, y
  eso es un hallazgo, no un ajuste. Un heredado que crece cada merge deja de
  ser una cifra y pasa a ser un cajón.
- Las cifras viejas NO se borran: se marcan como medidas en otro árbol, con
  su razón, para que nadie las vuelva a sumar.
- El build en primer plano, con Chrome y los dev servers cerrados, y el
  chequeo de procesos por RUTA DE WORKTREE.
- NUNCA git stash, checkout, restore ni ninguna escritura de git en el
  árbol. Para leer HEAD: git show HEAD:<ruta>.
- Ninguna afirmación se afloja. Ninguna comprobación verde por vacío ni
  verde por arnés. Toda cifra con su instrumento.
- Cero any. Sin dependencias nuevas. PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.

Arrancá. No me confirmes el entendimiento.
```
