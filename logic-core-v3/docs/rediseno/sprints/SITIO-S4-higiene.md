# SITIO-S4 — Higiene de invariantes tras el merge

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\rediseno-home`, rama **`rediseno/home`**. Sesión en `C:\rediseno-home\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar.
- **Es un sprint corto.** No construye nada del sitio: arregla instrumentos.
- **NO corras el dev server, NO tomes capturas, NO abras navegador.** Verificación: `tsc --noEmit`, eslint, comprobaciones estáticas con `npx tsx`, `npm run build` (con `NODE_OPTIONS=--max-old-space-size=8192`; el OOM es preexistente).

---

## La situación

`rediseno/cimientos`, `rediseno/chrome` y `rediseno/motion` se mergearon a `rediseno/home`. Los tres sprints pasaron sus invariantes **aislados**. Corriéndolos juntos aparecen ocho fallas.

**Ninguna es una regresión de código.** Son tres clases de defecto de instrumento, y las tres importan más que las fallas en sí.

---

## Problema 0 · El encadenado oculta lo que viene después

Los scripts `test:s1`, `test:s2` y `test:s3` encadenan con `&&`. Una falla corta la cadena.

En la corrida real eso significó que **`test:s1-fuentes`, `test:s1-compuerta`, `test:s1-superficies`, `test:s1-bundle`, `test:s2-galeria`, `test:s2-bundle` y `test:s2-css` nunca corrieron.** Y `test:s2-bundle` es el que verifica que la coreografía no cruza la compuerta.

**Arreglo:** los tres agregados corren **todos** los invariantes, acumulan resultados, imprimen el resumen completo, y **salen con código distinto de cero si alguno falló**. Nunca más una falla temprana escondiendo siete invariantes.

**Control positivo:** con dos invariantes fallando a propósito, el agregado tiene que reportar los dos, no el primero.

---

## Problema 1 · El testigo de la poda desapareció

`tokens.invariant.ts` afirma que la poda de Tailwind es real, y lo demuestra señalando tokens que se podan cuando el bloque es `@theme` a secas.

**Ese testigo se agotó.** S1 midió 21 podados. S3 dio consumidor a las seis expresiones fluidas y movió el testigo a `--radius-medio` y `--radius-fuerte`. **S2 les dio consumidor también, y ahora se podan 0 de 89.**

El sistema quedó **enteramente consumido**. Es un buen resultado y hay que publicarlo. Pero deja el check sin forma de demostrar el fenómeno que custodia.

**Arreglo, y es el punto del problema:** el testigo **no puede ser un token real del sistema**, porque cualquier sprint futuro puede darle consumidor y volver a romper el check. Tiene que ser **sintético**: un token inventado en el fixture, que nadie consume por construcción, y que se verifica que se poda con `@theme` y sobrevive con `@theme static`.

Y además:

- **Afirmá el hecho nuevo como propiedad**: hoy se podan 0 de 90 con `@theme` a secas, o sea que el sistema está enteramente consumido. Publicalo con el número.
- **Escribí por qué `@theme static` sigue siendo necesario** aunque hoy no se pode nada: la poda es por uso, y el primer token que quede sin consumidor se va a podar. Sin eso, alguien va a leer "0 podados" y va a proponer volver a `@theme` a secas.
- **Dejá escrito que el testigo real se agotó dos veces en dos sprints**, y que por eso pasó a ser sintético.

---

## Problema 2 · Una cifra vieja en S2

`tokens-de-uso.invariant.ts` afirma que el tema declara 89 tokens. Son 90, desde la corrección aprobada de S3 — `--color-superficie-translucida`, el papel translúcido que le dio superficie a `--blur-panel`.

**Arreglo:** que el conteo **se derive del archivo**, no de un literal. Un instrumento que afirma una cardinalidad escrita a mano se rompe cada vez que el sistema crece legítimamente, y entrena a que se lo actualice sin pensar.

Si el conteo tiene que estar fijado, que salga del mismo padrón declarado que ya usa `tokens.invariant.ts`, con su lista de excepciones nombradas.

---

## Problema 3 · Los checks de frontera vencen al mergear ⚠️

**Es el más importante de los tres.**

Cinco afirmaciones de `s3-frontera.invariant.ts` fallan:

```
git status ve 0 de los 35 archivos del sprint
y ve 0 rutas tocadas en total
el único token nuevo es la corrección declarada — obtenido []
0 scripts nuevos
0 instrumentos incluidos en la cuenta
```

Las cinco comparan **el working tree contra `HEAD`**. Durante el sprint, con todo sin commitear, eran verdaderas. **Commiteado y mergeado, `HEAD` ya contiene los cambios y el diff es vacío por construcción.**

No están rotas: **tienen fecha de vencimiento y nadie la declaró.**

Y es una clase, no un caso: **todo check que compare contra el estado de git mide el momento del sprint, no una propiedad del código.** Con siete lanes por venir, cada uno va a dejar los suyos.

### Arreglo

**Separá las dos naturalezas, explícitamente:**

- **Invariantes permanentes** — propiedades del código. Corren siempre y entran en el agregado.
- **Checks de frontera** — propiedades del *momento*. Corren **antes del commit**, en su propio script, y **no entran en el agregado**.

Cada check de frontera tiene que **declarar su naturaleza en su propia salida**: cuando detecta que su base ya está en `HEAD`, no falla — **informa que está fuera de su ventana de validez y por qué**, y sale en cero.

⚠️ **Un check de frontera que "no aplica" NO puede pasar en verde silencioso.** Tiene que imprimir que no corrió y la razón. Un verde indistinguible entre "verifiqué" y "no había nada que verificar" es exactamente el modo de falla que este proyecto viene cazando desde S10.

**Y escribí la regla general** en `DIRECCION-ESCENA.md`, para que los lanes que vienen la hereden desde el prompt: *un check que compara contra git mide el momento del sprint, no el código; va en un script aparte, corre antes del commit, y declara cuando está fuera de su ventana.*

---

## Problema 4 · El gate no cubre `package.json`

El merge de `rediseno/motion` dejó marcadores de conflicto adentro de `package.json`. **`tsc --noEmit` dio exit 0 dos veces sobre ese árbol roto** — no lee `package.json`. Recién `npm run` lo destapó.

Con siete lanes por venir, cada uno agrega scripts y cada merge va a tocar ese archivo.

**Arreglo: un `npm run verificar`** que corra, en orden y sin `&&`:

1. **`package.json` es JSON válido** y no tiene claves de script duplicadas. Una clave duplicada es peor que un error de sintaxis: no rompe nada y pisa un script en silencio.
2. **`tsc --noEmit`**.
3. **Los tres agregados de invariantes.**
4. **Resumen y código de salida distinto de cero si algo falló.**

**Con control positivo**: un `package.json` con un marcador de conflicto y otro con una clave duplicada tienen que hacerlo fallar, cada uno con su mensaje.

---

## Reglas absolutas

1. **Este sprint arregla instrumentos. No toca ni una línea de comportamiento.** Si para hacer pasar un invariante hace falta cambiar código de componente, de motion o de tokens: **frená y reportá**. Un instrumento que se arregla cambiando el sujeto no arregla nada.
2. **Ninguna afirmación se afloja para que pase.** Si una es genuinamente incorrecta, se reemplaza por la correcta y se explica el cambio. **No se borra ni se relaja.**
3. **Rama `rediseno/home`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte. **Nunca `git add .`**
4. **No toques `main` ni otros worktrees.** Hay ramas de Franco en el remoto que no son tuyas.
5. **No toques el home actual, `/probe-escena`, `home-intro/`, ni los frozen.**
6. **Cero `any`.** **Nada de base de datos.** **Sin dependencias nuevas.**
7. **Ninguna comprobación queda verde por vacío.** Control positivo obligatorio en cada arreglo.
8. **Regla 11:** toda cifra del reporte tiene que tener un instrumento que la produzca.
9. **PowerShell:** no hay `&&`, no hay heredoc. `tsc` es `.\node_modules\.bin\tsc.cmd --noEmit`.
10. Archivos de más de 300 líneas se parten.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `npm run verificar` completo, con su salida.
- (b) **Los tres agregados corriendo enteros**, con el conteo total de afirmaciones y de controles positivos. Es la primera vez que S1, S2 y S3 se verifican conviviendo.
- (c) **Los siete invariantes que nunca habían corrido** por el encadenado: `s1-fuentes`, `s1-compuerta`, `s1-superficies`, `s1-bundle`, `s2-galeria`, `s2-bundle`, `s2-css`. **Si alguno falla, es un hallazgo real y no un defecto de instrumento** — reportalo aparte.
- (d) El testigo sintético de la poda, y el número de tokens consumidos hoy.
- (e) Los checks de frontera: cómo declaran estar fuera de ventana, con su control.
- (f) `npm run verificar` fallando con un `package.json` roto y con uno con clave duplicada.
- (g) Archivos y `git status`.

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "SITIO-S4: higiene de invariantes tras el merge"` → `git push origin rediseno/home`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/SITIO-S4-higiene.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Estás en C:\rediseno-home, rama rediseno/home, con los tres sprints ya
  mergeados. Este sprint ARREGLA INSTRUMENTOS y no toca ni una línea de
  comportamiento. Si para hacer pasar un invariante hace falta cambiar
  código de componente, motion o tokens: FRENÁ Y REPORTÁ.
- NINGUNA afirmación se afloja para que pase. Si una es genuinamente
  incorrecta, se reemplaza por la correcta y se explica. No se borra ni se
  relaja.
- NO corras el dev server, NO tomes capturas, NO abras navegador.
  Verificación: tsc, eslint, tsx y npm run build con
  NODE_OPTIONS=--max-old-space-size=8192.
- NO toques main ni otros worktrees: hay ramas ajenas en el remoto.
  Tampoco el home, /probe-escena, home-intro/ ni los frozen.
- Los agregados de invariantes NO pueden encadenar con &&: una falla
  temprana escondió siete invariantes, incluido el que verifica la
  compuerta. Corren todos, reportan todos, y salen distinto de cero si
  alguno falló.
- El testigo de la poda tiene que ser SINTÉTICO, no un token real: se
  agotó dos veces en dos sprints porque los sprints le dan consumidor.
- Un check de frontera que está fuera de su ventana NO pasa en verde
  silencioso: informa que no corrió y por qué.
- Ninguna comprobación queda verde por vacío. Control positivo obligatorio
  en cada arreglo. Regla 11: toda cifra con su instrumento.
- Git: commit y push en rediseno/home. PROHIBIDO merge, reset, rebase,
  push --force, checkout que descarte. Nunca git add . — archivo por archivo.
- Cero any. Sin dependencias nuevas. Nada de base de datos.
- PowerShell: no hay &&, no hay heredoc. tsc es
  .\node_modules\.bin\tsc.cmd --noEmit
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.

Arrancá. No me confirmes el entendimiento.
```
