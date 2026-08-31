# SITIO-S7 — La integración

El home entero en `/v3`, y la deuda que dejaron seis sprints en paralelo.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **NO `ultracode`.** Esto es una integración coherente, no unidades paralelas: los subagentes serían overhead y encima el riesgo es que dos toquen el mismo archivo.
- **Worktree:** `C:\rediseno-home`, rama **`rediseno/home`**. Sesión en `C:\rediseno-home\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar. Sprint largo y autónomo.
- **NO corras el dev server, NO tomes capturas, NO abras navegador.**

⚠️ **El build necesita LAS DOS variables**, y la documentación de §6.1 está incompleta:

```powershell
$env:CIRCLE_NODE_TOTAL=3
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm run build
```

Con solo los workers acotados **muere igual** en 2 GB — está medido hoy. Acotar los workers evita que se pisen; el heap evita que cada uno reviente. **Corregí §6.1 con esto**, es una corrección a lo que el propio proyecto escribió.

Y **no corras nada al lado del build**: tarda entre 6 y 9 minutos y con otro proceso encima se cae por memoria.

---

## Dónde estamos

Seis sprints construyeron el sitio en paralelo y están mergeados en `rediseno/home`:

| | qué dejó |
|---|---|
| **S1** | tokens, fuentes, esqueleto de canvas + paneles, compuerta de 1025 |
| **S2** | los nueve patrones de motion, el divisor de líneas |
| **S3** | layout, tipografía, CTA, navegación, cursor, pie, imagen |
| **S4** | `npm run verificar` y la higiene de instrumentos |
| **S5** | Hero · Quiénes somos · Números · Trabajos |
| **S6** | Servicios · Tu panel · Por qué develOP · Cierre |

**2.014 afirmaciones y 386 controles positivos**, con dos rojos conocidos.

**Lo que falta es que sea una página.** Hoy son dos rutas de demostración separadas y `/v3` sigue mostrando el esqueleto vacío de S1.

**Después de este sprint el trabajo cambia de naturaleza:** deja de ser construcción y pasa a ser poblar contenido y corregir composición. Por eso este sprint también tiene que dejar **fácil de poblar** lo que construyó.

---

## Parte 1 · El home entero

### `/v3/page.tsx` monta las ocho

- **Un solo registro unificado**, no dos. Hoy hay uno por lane. La página recorre el registro; **no lista secciones a mano.**
- **El orden y las superficies salen de `secciones.ts`**, que ya es la única fuente y ya tiene las ocho.
- **Un solo contrato.** `secciones-a/_contrato/` y `secciones-b/_contrato/` son dos versiones de lo mismo, escritas en paralelo sin verse. Unificalos en uno, en `_lib/` o donde corresponda, y que las ocho secciones lo consuman.

⚠️ **Al unificar los contratos vas a encontrar divergencias.** Los dos resolvieron los mismos problemas de formas distintas. **Elegí la mejor de cada par y escribí por qué** — no promedies ni conserves las dos.

### Las tres correcciones de la tabla

S6 las pidió y no las pudo escribir porque `secciones.ts` era del lane A:

1. **Servicios va pinneada.** Está construida como secuencia pinneada —un `sticky` largo, un progreso, tres canales— y la tabla no lo declara. Es el hallazgo que dejó `s6-contrato` en rojo antes del merge.
2. **`tu-panel` declara 200svh, no 100.** Son dos tiempos y el alto de hoy subestima el recorrido. **Confirmado mirando:** la sección se queda quieta varias pantallas con el mismo contenido.
3. **El alto del cierre**: pasa de una pantalla con el titular en `titulo-xl` más el pie entero. Medí y declaralo.

### Las dos rutas de sección se borran

Con `/v3` montando las ocho, `/v3/secciones-a` y `/v3/secciones-b` no tienen sentido. **Borralas**, y sacalas del padrón de rutas de demo.

⚠️ **Y medí el efecto**, porque es una prueba parcial de la predicción del mapa de S4: el padrón pasa de 7 a 5 rutas y el heredado de `/v3` tiene que **bajar**. Si baja, la predicción va en la dirección correcta; si no se mueve, el diagnóstico estaba mal. **Reportalo en los dos casos.** No cierra la predicción —quedan cinco rutas— pero es evidencia gratis.

**`/v3/motion`, `/v3/componentes` y `/v3/tipografia` se quedan**: son herramientas de calibración y todavía se usan.

---

## Parte 2 · La compuerta, arriba

⚠️ **Es el hallazgo más importante que dejaron los dos lanes**, y los dos lo reportaron por separado:

> La coreografía viaja en la carga inicial **en todos los anchos**. Abajo de 1025 el comportamiento está gateado —no se monta el motor, no se parte el texto, no se escribe una transformada— pero **el código baja igual.**

Eso contradice una decisión cerrada del proyecto: *"el bundle no se importa abajo del umbral. No es una clase de CSS que esconde."*

**Se resuelve una sola vez, arriba, en la composición.** No por sección: hacerlo ocho veces son ocho implementaciones que divergen.

- Cada sección expone **su árbol quieto y su árbol animado**, y el contenedor elige cuál monta.
- **El árbol animado entra por import dinámico**, con el mismo mecanismo de S1. No inventes otro.
- **Abajo de 1025 el árbol animado no se descarga.** Verificalo **sobre la salida del build**, con marca y control positivo, igual que S1 y S2.
- **Reportá el peso** de `/v3` arriba y abajo del umbral, y contra los 424,0 KiB gzip de hoy.

⚠️ **El contenido tiene que ser idéntico en los dos árboles.** Es el riesgo real de partir en dos: que uno diga algo que el otro no. **Comprobación que compare el texto renderizado de los dos y exija que sea el mismo**, con control positivo.

---

## Parte 3 · Los dos rojos y el bug de `cn()`

### `test:s2-bundle` — opción A, una línea

Su control positivo asume que las huellas del sistema de motion viven en el chunk marcado. **Dejó de ser cierto cuando apareció un segundo consumidor**: webpack lo factorizó a un chunk compartido.

**Que busque las huellas en todos los chunks, no solo en el marcado.** Sigue probando lo que existe para probar —que el buscador no está ciego— y deja de afirmar un reparto de chunks que ya no es cierto.

⚠️ **Y hay que hacerlo más robusto que eso:** ese control cambió de resultado tres veces en tres builds distintos según cuántas rutas había. **Un control que depende del reparto de chunks es frágil por diseño.** Escribí cómo lo hacés independiente de ese reparto.

### `test:s5-integracion` — la cardinalidad

Afirma cuántas rutas de demo hay, escrito a mano, y S6 sumó una. **Es el mismo error de diseño que este proyecto ya corrigió dos veces: afirmar una cardinalidad literal.**

**Que se derive del padrón.** Y revisá si hay otras cardinalidades escritas a mano en los seis sprints — si las hay, listalas aunque no las arregles.

### `cn()` borra clases del sistema v3, en silencio

**Los dos lanes lo encontraron por separado**, con las mismas dos formas:

- `text-<tamaño>` + `text-<color>` → **se pierde el tamaño**
- `font-<familia>` + `font-<peso>` → **se pierde la familia**

Sin error de build, sin error de tipos, sin nada en consola. `src/lib/utils.ts` tiene la lista para los tokens del sistema viejo, **advierte por escrito de este mismo defecto**, y nunca se extendió a `/v3`.

- **Arreglalo en la raíz**: agregá los tokens de `/v3` a esa lista.
- ⚠️ **Es código compartido con el sitio vivo.** Verificá que ninguna clase del sistema viejo cambie de comportamiento, con control positivo.
- **Y sacá los dos rodeos locales** que los lanes dejaron. Un arreglo de raíz que deja los parches es código muerto que oculta el arreglo.

---

## Parte 4 · Que quede fácil de poblar

Después de este sprint viene el contenido. **Dejalo listo para eso.**

- **Un solo documento** —`docs/rediseno/CONTENIDO-PENDIENTE.md`— con **los 23 marcadores**, agrupados por sección, cada uno con: qué dato es, en qué archivo se edita, y qué formato espera. Es el pedido a Franco y tiene que poder leerse sin abrir el código.
- **Que el escáner de contenido inventado siga corriendo** sobre las ocho. Es lo que impide que la primera cifra falsa entre cuando empiecen a poblar.
- **Reportá el ritmo del home completo**: pantallas y momentos reales de las ocho juntas, contra los 20,5 en 23,47 de la referencia. **Es la primera vez que el número es comparable**, porque hasta ahora eran cuatro contra ocho.

---

## Parte 5 · Dos cosas de higiene

**El chequeo de marcadores de conflicto entra a `verificar`.** El merge dejó marcadores adentro de `package.json` y `tsc` dio verde dos veces sobre un árbol roto. `verificar` ya valida el JSON del `package.json`, pero **no busca marcadores en el resto del repo**.

⚠️ **Tiene que excluir `s4-fixtures/`**, que contiene marcadores a propósito como control positivo. **Es un instrumento que se mediría a sí mismo** — el mismo modo de falla que ya apareció tres veces en este proyecto.

**Y el tipo compartido que rompió el merge**: S5 cambió `pinneada` de `boolean` a una unión de strings y S6 no podía saberlo. `tsc` lo agarró recién al mergear. **Anotá la regla**: dos lanes en paralelo no se protegen solo repartiendo archivos — cambiar el **tipo** de un dato compartido viaja igual. Con siete lanes va a volver a pasar.

---

## Reglas absolutas

1. **Rama `rediseno/home`.** No toques `main` ni otros worktrees. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte. **Nunca `git add .`**
2. **No toques el home actual, `/probe-escena`, `home-intro/`, ni los frozen.**
3. **`src/lib/utils.ts` SÍ se toca** — es la única excepción de código compartido, y solo para el arreglo de `cn()`, con control positivo de que el sistema viejo no cambia.
4. **No cambies el comportamiento de ninguna sección.** Este sprint compone, unifica y arregla instrumentos. Si una sección necesita un cambio de contenido o de composición, **anotalo, no lo hagas**: eso es la etapa que sigue.
5. **Ninguna afirmación se afloja para que pase.**
6. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
7. **No sumar dependencias.** **Cero `any`.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
8. **Ninguna comprobación verde por vacío.** Control positivo obligatorio.
9. **Regla 11:** toda cifra con su instrumento. **Regla 12:** frontera declara ventana. **Regla 13:** se afirma lo propio, se publica lo heredado. **Regla 14:** los agregados se derivan, no se listan.
10. **PowerShell:** no hay `&&`, no hay heredoc.
11. **No corras el dev server. No auto-confirmás que se ve bien.**
12. Archivos de más de 300 líneas se parten.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `npm run verificar` completo. **Cero rojos** — los dos conocidos se arreglan en este sprint.
- (b) `npm run build` con las dos variables, y `/v3` prerenderizada.
- (c) **La compuerta arriba**: peso de `/v3` arriba y abajo de 1025, contra los 424,0 gzip de hoy, con la verificación sobre el build y su control.
- (d) **Que los dos árboles digan lo mismo**, con su control.
- (e) **El efecto de borrar las dos rutas** sobre el heredado, y si va en la dirección de la predicción de S4.
- (f) **Las divergencias entre los dos contratos** y cuál elegiste de cada par, con la razón.
- (g) **El arreglo de `cn()`**: las dos formas verificadas, que el sistema viejo no cambió, y que los dos rodeos locales se sacaron.
- (h) **El ritmo del home completo**: pantallas y momentos reales de las ocho, contra 20,5 en 23,47.
- (i) **`CONTENIDO-PENDIENTE.md`**, con los 23 marcadores.
- (j) Archivos y `git status`.
- (k) Qué queda abierto para la etapa de contenido.

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "SITIO-S7: integracion del home"` → `git push origin rediseno/home`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/SITIO-S7-integracion.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\rediseno-home, rama rediseno/home, con los seis sprints ya
  mergeados. Sprint LARGO y AUTÓNOMO, con una sola parada al final.
- NO uses subagentes: esto es una integración coherente, no unidades
  paralelas, y dos subagentes tocarían el mismo archivo.
- El build necesita LAS DOS variables: CIRCLE_NODE_TOTAL=3 Y
  NODE_OPTIONS=--max-old-space-size=8192. Con solo los workers acotados
  muere igual en 2 GB, medido hoy. Corregí §6.1 de DIRECCION-ESCENA.md con
  esto. Y no corras nada al lado del build.
- NO corras el dev server, NO tomes capturas, NO abras navegador.
- NO cambies el comportamiento de ninguna sección. Este sprint compone,
  unifica y arregla instrumentos. Si una sección necesita un cambio de
  composición o de contenido, ANOTALO, no lo hagas.
- src/lib/utils.ts SÍ se toca, y es la única excepción de código
  compartido: solo para el arreglo de cn(), con control positivo de que el
  sistema viejo no cambia de comportamiento. Y se sacan los dos rodeos
  locales que dejaron los lanes.
- La compuerta se resuelve UNA VEZ arriba, en la composición, no ocho veces
  por sección. Los dos árboles tienen que decir lo MISMO: comprobación que
  compare el texto renderizado, con control positivo.
- Al unificar los dos contratos vas a encontrar divergencias: elegí la
  mejor de cada par y escribí por qué. No promedies ni conserves las dos.
- El chequeo de marcadores de conflicto tiene que EXCLUIR s4-fixtures/, que
  los tiene a propósito como control. Un instrumento que se mide a sí mismo
  ya apareció tres veces en este proyecto.
- Ninguna afirmación se afloja para que pase. Ninguna comprobación verde
  por vacío. Toda cifra con su instrumento.
- NO toques el home actual, /probe-escena, home-intro/ ni los frozen.
- Git: commit y push en rediseno/home. PROHIBIDO merge, reset, rebase,
  push --force, checkout que descarte. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá. No me confirmes el entendimiento.
```
