# P40 · El brief en cuatro vueltas — el contrato del encabezado, y la dirección visual que viaja

2026-09-14. Rama `p25/rafaga-tildes`, HEAD `4f8c00a2` (sin commitear, igual que P29–P39). Nada pusheado, nada agregado a git.

Base: la branch Neon de desarrollo (`ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech`). Ningún script de este
sprint escribe en la base salvo por la siembra de las pruebas y de las capturas, que borran por id lo suyo.

---

## 0 · Terreno

| | |
|---|---|
| Git | HEAD `4f8c00a2` · `main` = `origin/main` = `57c421bc` · 28 worktrees y 2 stashes, no tocados |
| WIP ajeno | 180 archivos modificados/no rastreados copiados con md5 en `C:\tmp\p40-brief\wip-copia` (manifiesto `wip-manifiesto.json`) |
| Procesos | 21 `node` ajenos al arrancar (18 de `chrome-devtools-mcp`, un `npm test` y un `vitest` de `CodenoaPili`); ningún servidor en 3000–3099 |
| Disco | 28,7 GB libres al arrancar |
| `tsc` | exit **0** |
| Invariantes | **57/57** (58 descubiertos, 1 excluido) |
| Suites | `test:leados` **43/43** · `test:helpers` **28/28** · `test:setter` **194/194** (build propio `.next-setter`, `next start` en 3003, `SETTER_EXTERNAL_SERVER=1`) |
| Base | 105 `OsLead` · 21 `User` · 6 `OsSetterNotice` · 63 tablas · `setter-qa` con 73 leads y **42 accionables** |
| Ida y vuelta, código de partida | antes de leados → tras leados → tras helpers → tras setter: **ninguna tabla con delta** en las tres |
| Mediciones fijas | franja **224/224** · pliegue **1062/1062** celdas iguales a P36 |

El rojo de servidor frío anunciado (`01-flow` B1) no apareció: 194/194 en la primera corrida.

---

## 1 · Fase 1 — las tres decisiones, medidas antes de construir

### 1.1 · Dónde vive el documento → **campo propio, `documento`, con techo propio de 15.000**

**Lo medido.**

| Pregunta | Respuesta |
|---|---|
| El campo donde iba a vivir | `pegadoGem` (`contracts.ts:119`), `textoLibre` = 5.000. El documento apunta a ~7.000: no entra |
| Qué lo usa hoy y quién lo lee | **cinco lugares del producto**: el formulario (`brief-form.tsx`), `BriefResumen` (m6 de consulta, el re-pegado, m13 y m14), el bloque de construcción (`copy-blocks.ts`, con su «faltante»), la revisión de Franco (`dossier-panels.tsx`), y la **regla del guardado**: el `superRefine` de `briefInputSchemaPara` lo exige cuando el Gem tenga link. Más dos pruebas (`19-config-que-falta`, `campo-sin-herramienta`), los datos de semilla y dos scripts |
| A quién afecta subir el techo general | `TEXTO_LIBRE_MAX` lo comparten **19 campos de 5 blobs**: 8 de la ficha, 1 de la evaluación, 5 del brief, 3 de los rechazos y 2 de la agenda, y todos se leen enteros-o-nada (`parseBrief`, `parseFicha`…) |
| Qué pasa hoy con un pegado de más de 5.000 | el input no tiene techo; `BriefSchema.parse` revienta en el servidor y el setter lee «No se pudo guardar el brief» |
| Costo del campo propio | una clave opcional en `BriefSchema` y en el input (con su techo y su mensaje), estado + payload del formulario (la trampa de P5-B), y tres lectores (bloque, resumen, revisión). Sin migración: vive dentro de `briefJson` |

**Fundamento.** Reusar `pegadoGem` con techo propio era tocar un campo del que depende la regla del guardado (condición de
frenada) y que tiene otros cuatro lectores; subir el techo general movía la cota de diecinueve campos para darle lugar a uno.
El campo propio es el único camino que no toca nada de lo que ya estaba. `TEXTO_DOCUMENTO_MAX = 15_000`: el doble del largo
esperado, con el mismo criterio de sanidad que el techo general.

### 1.2 · Qué guarda cada fase → **la lectura, las decisiones, el documento y las cuatro correcciones; el borrador, solo mientras no llegó el documento**

**Lo medido** (`scripts/p40-peso-brief.mts`, solo lectura; `C:\tmp\p40-brief\fase1\peso.json`).

| | |
|---|---|
| Hoy | 49 de 86 dossiers con brief · promedio **291 B** · máximo 1.106 B |
| Quién arrastra el brief | la home del setter: `listOwnedLeads` hace `include: { dossier: true }` — **el dossier entero de cada lead, en cada carga**. `setter-qa`: 73 leads, 43 con brief, 140,7 KB por carga (11,8 KB de briefs), 182 ms |
| Texto real | 5,64 bytes por palabra (el documento de ejemplo) |

| Un brief, con el largo del contrato | 800 palabras | 1.200 palabras |
|---|---|---|
| A · las cuatro vueltas enteras | 13,0 KB | **17,4 KB** |
| B · solo el documento | 6,5 KB | **8,7 KB** |
| C · lectura + decisiones + documento | 8,1 KB | **10,3 KB** |

| Home de `setter-qa` proyectada (43 briefs a 1.200) | Transferencia desde la base (43 filas de ese tamaño, mediana de 7) |
|---|---|
| hoy 140,7 KB | 60 ms |
| B · 501 KB | 65 ms |
| C · 572 KB | 67 ms |
| A · 875 KB | 72 ms |

**Fundamento.** Guardar las cuatro enteras **multiplica el blob por dos** (17,4 contra 8,7 KB): por el criterio del encargo,
no. Pero quedarse solo con la última pierde justo lo que motivaba guardar: la **lectura estética** (la única fuente real de
diferenciación, y la que permite medir S-20 —si dos negocios del mismo rubro salen iguales—) y las **decisiones** (donde vive
el chequeo de genérico). Esas dos cuestan 1,6 KB juntas: +18 %, no multiplican. Lo que duplicaba era el **borrador** de la 3,
que pesa lo mismo que el documento y que el propio contrato del Gem descarta apenas existe el definitivo. Por eso:

- se guardan la vuelta 1, la vuelta 2 y las correcciones de las cuatro;
- el documento de la vuelta 4 vive en su campo (`documento`);
- el borrador de la 3 se guarda **solo mientras no hay documento**: si el setter guarda sin haber hecho la cuarta, es lo único
  escrito y tirarlo sería perder trabajo.

La regla vive en un solo lugar (`vueltasParaGuardar`, `brief-vueltas.ts`). Si Franco prefiere «solo la última», es cambiar esa
función: lo declaro como decisión que va un paso más allá del sí/no del encargo.

### 1.3 · Qué tan estricto es el lector → **obligatorias SECCIONES, PALETA y TIPOGRAFIA; nada frena; lo que no matchea se conserva**

| | |
|---|---|
| Obligatorias | **SECCIONES** — sin ellas la demo no se construye, y es el único dato del brief que el guardado exige · **PALETA** y **TIPOGRAFIA** — sin ellas Claude Design elige colores y fuente por su cuenta: el defecto que motiva el sprint |
| Opcionales | **ANGULO** (va al concepto, que ya es opcional), **CTA** (ya opcional) y **TONO** (el bloque ya lleva «cómo habla el negocio», desde la ficha). Si faltan, el bloque queda como el brief de hoy ya lo permite |
| Si falta una obligatoria | no frena nada: la lectura queda «incompleta», la pantalla dice cuál falta, por qué importa y qué hacer, y que **el brief se guarda igual**; el campo queda para que el setter lo escriba. Frenar sería un gate nuevo |
| Lo que no matchea | **se conserva**: el documento se guarda y viaja a la construcción entero, tal cual se pegó. Además se cuenta y se muestra: renglones antes del encabezado, etiquetas que el contrato no define, etiquetas repetidas (vale la primera) |
| Un encabezado es | al menos **dos** etiquetas del contrato seguidas. Una sola suelta en el medio del texto no |

---

## 2 · El contrato del encabezado — lo que el Gem tiene que cumplir

El documento definitivo de la vuelta 4 empieza con estas seis líneas, en este orden, una etiqueta por línea, en mayúsculas,
seguida de dos puntos y del valor en la misma línea; después, una línea en blanco y el resto del documento en texto libre:

```
ANGULO: <qué le mostramos al dueño para que piense «esto es lo que necesito», en una línea>
SECCIONES: <las secciones de la página, en orden, separadas por · >
CTA: <el texto exacto del botón principal>
TONO: <cómo escribe la demo, en una línea>
PALETA: <neutro / acento / apoyo, con hex>
TIPOGRAFIA: <títulos / cuerpo>
```

| Etiqueta | Campo del brief | Obligatoria | Quién la lee después |
|---|---|---|---|
| `ANGULO` | `concepto` | no | bloque de construcción, «El brief pedía» (m13/m14), revisión |
| `SECCIONES` | `secciones` | **sí** | bloque (en orden), «El brief pedía», revisión |
| `CTA` | `cta` | no | bloque, «El brief pedía», revisión |
| `TONO` | `tono` | no | bloque, «El brief pedía», revisión |
| `PALETA` | `paleta` | **sí** | bloque, «El brief pedía», revisión |
| `TIPOGRAFIA` | `tipografia` | **sí** | bloque, «El brief pedía», revisión |

**Lo que el producto tolera** (el Gem no escribe perfecto; el contrato se le pide exacto, la lectura es tolerante):

- mayúsculas o minúsculas, con o sin tilde (`Ángulo:`, `TIPOGRAFÍA:`);
- adornos de formato alrededor de la etiqueta (`**PALETA:**`, `- CTA:`, `## TONO:`, `1. SECCIONES:`, sangría);
- espacio antes de los dos puntos y dos puntos de más (`CTA:: Reservá`); el valor puede tener sus propios dos puntos;
- dos nombres de uso común: `ÁNGULO WOW` y `LLAMADO A LA ACCIÓN`;
- SECCIONES separadas por `·`, `•`, `|`, `;` o ` / `, por comas si no hay otro separador, o en lista (una por renglón) si la
  línea `SECCIONES:` quedó sin valor;
- comillas o corchetes que envuelven el valor entero;
- el encabezado en otro orden, o después de otro texto (la caza de huecos pegada antes).

La fuente de verdad es el encabezado de `src/lib/leados/encabezado-documento.ts`. Los mensajes del Gem que arma la pantalla
(`prompts-gem-diseno.ts`) enseñan exactamente esas seis etiquetas en la vuelta 3 y las piden en la 4; una prueba lee el propio
molde de la vuelta 3 con el lector y exige las seis.

---

## 3 · Frenadas y condiciones

### 3.1 · ⚠️ FRENÉ en un punto: «el paso no se cierra hasta que la cuarta esté», en su forma fuerte

**Lo medido.** Cerrar m6 es `guardarBrief` (EVALUADA→BRIEF), el único camino a BRIEF, que es lo que exige arrancar la
construcción. Un guardado que exija la cuarta vuelta es **un campo nuevo que gatea la construcción** — la regla 2 del encargo
dice que eso es una decisión aparte. Y hay dos hechos que lo vuelven más que una formalidad:

- **El Gem de diseño no tiene link** (`herramientas.ts:78`, `url: null`). Exigir su cuarta vuelta hoy solo se cumple
  inventando lo que devuelve — exactamente lo que el sprint «LA CONFIGURACIÓN QUE FALTA» sacó para `pegadoGem`, y que
  `19-config-que-falta` B1b fija: «el paso se completa sin el pegado».
- `01-flow` B4 cierra m6 con los campos de siempre.

**Lo que se construyó en su lugar.** El recorrido: las cuatro vueltas en orden; la cabecera de la cuarta dice «Falta el
documento definitivo» hasta que se pega; el avance nunca pasa por encima de una vuelta sin pegar; y «Guardar brief» guarda con
lo que se exige hoy, ni más ni menos. En el sentido de «el recorrido no llega al final sin la cuarta», es verdad; en el de
«no se puede guardar sin la cuarta», **no lo es, a propósito**.

**Propuesta para Franco.** Atarlo al registro de herramientas como ya está `pegadoGem`: cuando el Gem tenga link, el
documento pasa a exigirse para cerrar el paso (cliente y servidor, en el mismo `superRefine`). Hoy quedaría dormido. Es una
decisión de gate: no la tomé.

### 3.2 · Las tres condiciones de frenada, medidas

| Condición | Resultado |
|---|---|
| Agregar los campos exige cambiar la validación de forma que un brief guardado deje de parsear | **No.** Todos opcionales. Los **49 briefs** de la base (7 formas distintas) parsean con el código nuevo y devuelven **el mismo objeto** que con el de partida (`p40-briefs-parsean.mts --comparar`: 49/49, 0 roturas; control con una fila alterada → 2 roturas detectadas) |
| El gate que habilita construir depende de un campo que se toca | **No.** BRIEF→CONSTRUCCION mira solo el stage (`dossier.actions.ts:232-238`; `transitionDossier` sin caso para CONSTRUCCION). Lo que exige el guardado (`titulo`, `secciones`, `pegadoGem` con link) vive en campos cuya definición y validación no se tocaron — por eso el documento fue a un campo propio. `git diff` vacío en `dossier.ts`, `dossier.actions.ts`, `dossier-stage.ts`, `manual.ts`, `flow-content.ts` y `schema.prisma` |
| Hay más de un consumidor del bloque de construcción y agregarle secciones rompe alguno | **No.** Un solo consumidor de producto (`m-construccion.tsx`: mc1, mc2, mr) y una prueba (`campo-sin-herramienta`, 8/8). Los **49 bloques** reales salen **idénticos byte por byte** con el código nuevo (`p40-bloque-golden.mts --comparar`; control con un byte agregado → detectado) |

**Una premisa del encargo que no se cumple, dicha:** no hay ningún invariante que vigile la forma del bloque de construcción
(censo sobre los 58 invariantes). La red más cercana es `tests/leados/campo-sin-herramienta` 2b–2d, que siguió verde sin
tocarse. El sprint le suma una propia (§5).

---

## 4 · Lo que se construyó

### Paso 1 · Las cuatro vueltas en la pantalla

`vueltas-gem.tsx` monta las cuatro vueltas sobre el MISMO acordeón de la ficha por fuentes (`BloquesSecuenciales`, sin
tocarlo): cabeceras siempre visibles, una desplegada, la siguiente se abre sola cuando la abierta quedó completa y el foco sale
de ella —esperando al `pointerup`—, y ningún botón de «siguiente». La lógica pura (qué es completa, a cuál avanza, qué se
guarda) vive en `brief-vueltas.ts`, con el mismo reparto que `ficha-bloques.ts`.

| Lo que tenía que quedar verdadero | Cómo |
|---|---|
| Cuatro bloques, uno por vuelta, en orden | `1 · Lectura estética` · `2 · Decisiones` · `3 · Especificación` · `4 · Caza de huecos` |
| Cada uno tiene lo que se copia y dónde se pega | el mensaje de la vuelta (botón «Copiar bloque») y el campo «Lo que devolvió el Gem — vuelta N» (en la 4, «El documento definitivo») |
| El setter pega de vuelta la fase aprobada | el mensaje de la vuelta 2 **trae** la lectura que se pegó en la 1, con su corrección; el de la 3 trae las decisiones; el de la 4, la corrección al borrador. La 1 lleva la ficha y la evaluación |
| Un campo libre por bloque para lo corregido | «Lo que corregiste — vuelta N»; viaja en el mensaje siguiente (y el de la 4, con el documento a la construcción) |
| Volver atrás sin perder lo cargado | el estado vive en el formulario, no en los campos: plegar no desmonta lo escrito |
| El paso no se cierra hasta la cuarta | ver §3.1 — recorrido sí, gate no |

Los mensajes (`prompts-gem-diseno.ts`) son los cuatro prompts del paquete del Gem de Franco con tres ajustes, declarados en el
encabezado del archivo: el encabezado de la vuelta 3 con las etiquetas exactas del contrato; la vuelta 4 pidiendo que el
documento definitivo empiece con ese encabezado; y «la línea de abajo» → «la línea que va debajo del título» (una frase con
ubicación no puede vivir en el código del setter).

### Paso 2 · Los tres campos que faltaban

`tono`, `paleta` y `tipografia`: opcionales en el contrato y en el input, en el formulario («Lo que viaja a la construcción»),
y en el bloque de construcción, juntos a las decisiones de la demo:

```
… CONCEPTO · SECCIONES (en este orden) · LLAMADO A LA ACCIÓN
  TONO (así escriben los textos de la demo)
  PALETA (usá estos colores y ningún otro; el acento, solo en el botón principal)
  TIPOGRAFÍA (usá estas fuentes, nunca la del sistema)
  NOTAS DE MARCA · RESEÑAS REALES · … · BRIEF COMPLETO DEL GEM DE DISEÑO
  [CORRECCIONES DEL SETTER AL DOCUMENTO — solo con documento]
```

Vacías, se omiten (la regla del builder). La sección del Gem lleva el **documento** si lo hay (tal cual se pegó) y, si no, el
pegado viejo o el faltante de siempre; con documento, el faltante ya no se anuncia. **El bloque sigue armándose entero y sus
otras secciones no se movieron**: 49/49 bloques reales idénticos, y una prueba que saca las tres secciones nuevas y exige el
bloque de siempre.

### Paso 3 · El encabezado que el producto lee

- `leerEncabezado` lee el contrato (§2) y conserva lo que no matchea (§1.3). Nunca lanza.
- Al pegar el documento, lo leído **completa los campos del brief** (`autollenar`): los vacíos, y los que el propio lector
  llenó antes y el setter no tocó — así un documento corregido actualiza solo. Lo que el setter escribió a mano no se pisa
  nunca; la diferencia se muestra.
- `LecturaDocumento`, debajo del documento, lo dice en idioma del setter: qué leyó y qué completó; qué falta, por qué importa
  y qué hacer; que un documento sin encabezado no pierde nada; y en cada aviso, que **el brief se guarda igual**. La cabecera
  de la vuelta 4 lo resume plegada («Documento pegado · falta PALETA»). Lo vigilan `copy-sin-jerga` y `copy-sin-ubicacion`,
  verdes, y una prueba propia (6d).
- **Lo leído se muestra donde se usa**: en el bloque de construcción (mc1/mc2, sin tocar esas pantallas), en «El brief pedía»
  de m13/m14 (`BriefResumen`, compartido) y en la revisión de Franco.
- **Un documento sin encabezado degrada**: se guarda y viaja entero, la pantalla lo dice, nada se completa solo, y el setter
  sigue escribiendo los campos. Los briefs viejos no tienen documento: no muestran nada nuevo.

### Tocado fuera de m6, y por qué

| Archivo | Por qué |
|---|---|
| `admin/leados/[leadId]/_components/dossier-panels.tsx` (`BriefPanel`) | Sin tocarlo, la revisión de Franco decía «Sin la respuesta del Gem de diseño…» sobre **todo** brief de cuatro vueltas (no traen `pegadoGem`): una mentira nueva causada por este sprint. Suma también tono, paleta, tipografía, el documento y las vueltas guardadas — la visibilidad que justifica la decisión 2 |
| `herramientas.ts` (copia del Gem de diseño) | la munición de m6 prometía «lo pegás y completás los campos del formulario», que era la forma de antes |
| `manual/[paso]/page.tsx` | solo tres props nuevas a `M6Registro` (la ficha y la evaluación para el mensaje de la vuelta 1) |

Las dos superficies fijas (la franja y el layout-tipo de `PantallaManual` con su barra) y las otras dos pantallas de
construcción (mc1, mc2) no se tocaron.

---

## 5 · Las pruebas, demostradas fallando

| Archivo | Suite | Casos | Qué fija |
|---|---|---|---|
| `tests/leados/encabezado-documento.spec.ts` | `test:leados` | **27** | el contrato; lo que falta; lo que degrada; lo que se tolera; lo que no matchea se conserva; lo que el setter lee (sin jerga) |
| `tests/leados/brief-cuatro-vueltas.spec.ts` | `test:leados` | **25** | las 7 formas de brief que hay en la base siguen parseando igual; el guardado exige lo mismo; el bloque lleva los tres campos, en su lugar, sin mover los demás; el documento viaja entero; la decisión 2; los techos; el recorrido, el autollenado y los mensajes |
| `tests/setter/32-brief-cuatro-vueltas.spec.ts` | `test:setter` | **8** | A · las cuatro vueltas operadas · B · el click no se pierde · C · sin encabezado · D · falta PALETA · E · brief viejo abre y guarda · F · el bloque en mc1 · G1 · «El brief pedía» en m14 · G2 · la revisión de Franco |

Todas siembran su estado (ninguna encuentra un lead ya hecho), afirman por visibilidad y esperan por condición. Las del setter
borran por id lo suyo (tracker + registro de siembra de P39).

### Contra el código de partida

| Prueba | Cómo se corrió | Resultado |
|---|---|---|
| `32-brief-cuatro-vueltas` (8) | contra el build de partida (`.next-setter` de la Fase 0, en 3003) | **8 de 8 rojas**, cada una en su primera aserción propia (no hay «1 · Lectura estética», el bloque no trae «TONO (», «El brief pedía» no trae la paleta…). Base sin delta |
| `encabezado-documento` (27) | sin el módulo del lector (movido y restaurado, md5 idéntico) | **no carga**: «Cannot find module …/encabezado-documento» |
| `brief-cuatro-vueltas` (25) | con `contracts.ts`, `dossier.schemas.ts` y `copy-blocks.ts` de partida (restaurados, md5 idéntico) | **6 rojas** en su aserto — 2a, 2b, 2d, 2e (el builder viejo ignora los campos nuevos y el documento), 3d, 3e (el contrato viejo descarta las vueltas y no tiene techo propio) · **19 verdes**: las guardias (§1, 2c, 2f) y la lógica de módulos nuevos que siguió presente |

### Sabotajes (reemplazo literal de una ocurrencia, originales restaurados con md5 idéntico)

| Sabotaje | Sobre | Resultado |
|---|---|---|
| S1 · `tono` obligatorio en `BriefSchema` | la guardia «ningún brief deja de parsear» | **7 de 7 rojas** (una por forma de la base): «la lectura del producto no lo pierde — Received: null» |
| S2 · la paleta metida adentro de CONCEPTO | «las otras secciones no se mueven» (2c) | **roja** |
| S3 · el lector deja de sacar los adornos de formato | 4b | **roja**: `completo` → `incompleto` |
| S4 · una sola etiqueta ya es encabezado | 3c | **roja**: `sin-encabezado` → `incompleto` |
| S5 · una etiqueta del cuerpo, después del blanco, entra al encabezado | 5c | **roja** |
| S6 · el borrador se guarda siempre | la decisión 2 (3a) | **roja** |
| S7 · el autollenado pisa lo del setter | 4c | **roja**: «lo que escribió el setter queda — Expected: "Escribime"» |

**Un falso rojo propio, medido y cerrado.** La primera corrida de `32` dio B en rojo: la vuelta no avanzaba. Sola, 3 de 3
verdes; con un observador de eventos, el avance ocurría. Causa: el `fill` llegaba antes de la hidratación y el texto quedaba en
el DOM pero no en el estado. Ahora cada pegado espera a que la cabecera diga «Pegada» (reintenta si no), y los clicks en
cabeceras esperan a que la vuelta abra. En la misma corrida G2 cayó por la consola: la semilla de EN_REVISION trae un
borrador que la revisión enmarca en un iframe, y ese iframe loguea un aviso de CSP ajeno a esto; ahora el lead se siembra en
BRIEF y se mueve a revisión sin borrador, la forma de `19` B1c. Tras los dos arreglos: 8/8, dos veces.

---

## 6 · Verificación operando la aplicación, a 1440 y 390

Instrumento: `scripts/p40-capturas.mts` contra un build de producción del código nuevo. Siembra sus leads y los borra por id
en `finally` (14 por corrida; la base, **sin delta** en las 63 tablas antes/después). Capturas en `docs/p40-brief/capturas/`
(los mismos nombres a 1440 y a 390); lo leído del DOM en `capturas/hallazgos.json`.

| # | Verificación | Capturas | Lo que se leyó de la pantalla (igual a 1440 y a 390) |
|---|---|---|---|
| 1 | El recorrido de las cuatro vueltas | `01`…`06` | entra con la vuelta 1 abierta; la 2 se abre sola y su mensaje trae la lectura y «Mis correcciones»; la 3 y la 4 igual; volver a la 1 conserva lo pegado; el bloque de trabajo entero en `06` |
| 2 | Un documento completo: lo leído, mostrado | `03`, `04` | «Leí el encabezado del documento — Están las líneas que la construcción necesita. Completé con lo que leí: «Concepto», «Secciones de la demo», «Llamado a la acción (CTA)», «Tono», «Paleta» y «Tipografía».» · cabecera «Documento pegado · encabezado leído» · los cinco campos con el valor exacto del encabezado |
| 3 | Un documento sin encabezado | `08` | «Este documento no trae el encabezado — No encontré las seis líneas del principio… No se pierde nada: el documento se guarda y viaja entero a la construcción. Qué hacer: Escribí vos las secciones, la paleta y la tipografía en sus campos, o pedile al Gem… El brief se guarda igual.» · cabecera «Documento pegado · no trae el encabezado» |
| 4 | Un documento al que le falta una obligatoria | `09` | «Al principio del documento falta algo — Falta la línea PALETA: sin la paleta, Claude Design elige los colores por su cuenta. Completé con lo que leí: … Qué hacer: Pedile al Gem que te mande el documento de nuevo… o escribí lo que falta en su campo. El brief se guarda igual.» · cabecera «Documento pegado · falta PALETA» |
| 5 | Un brief viejo sigue abriendo y guardando | `10`, `11` | abre en su resumen; «re-pegar» abre el formulario con lo guardado en su lugar; el autoguardado guarda el CTA y el brief queda con `concepto, cta, pegadoGem, secciones, titulo` — las cuatro de antes más la editada, ninguna nueva |
| 6 | El bloque de construcción con los tres campos | `12` | «TONO (», «PALETA (», «TIPOGRAFÍA (» presentes en el bloque de mc1, con el documento |
| — | Lo leído en las pantallas que siguen | `13`, `14` | m14 «El brief pedía» con tono, paleta y tipografía; la revisión de Franco con la dirección visual, «Ver el documento de construcción» y **sin** el «Sin la respuesta del Gem» falso |
| 7 | Las dos mediciones fijas | — | §7 |
| 8 | La ida y vuelta de la base con las tres suites | — | §8 |

Además, con la base real (solo lectura): los **49 briefs** guardados parsean igual (0 roturas) y sus **49 bloques** de
construcción salen idénticos byte por byte.

**Subagente `visual-qa`**, despachado sobre las 28 capturas: sin ❌ ni ❓ — vueltas, avisos, compatibilidad del brief viejo,
mc1, m14 y la revisión, a los dos anchos, sin desborde a 390 y con la barra de acción visible. Revisó las imágenes; no hizo un
recorrido propio en el navegador, así que su «sin errores de consola» no vale como medición (la consola la miden las pruebas
de `32`, con `attachConsoleGuard`).

**Dos correcciones que salieron de mirar las capturas**, no de las pruebas: tono, paleta y tipografía pasaron de input de
una línea a área de dos renglones (la paleta que devuelve el Gem se cortaba justo en lo que hay que revisar), y la instrucción
del bloque de contexto de m6 se acortó (la primera versión sumaba un renglón a 390 y corría 16 px el primer accionable — lo
midió `medir-pliegue-manual`).

---

## 7 · Las dos mediciones fijas

Corridas contra el build final (el mismo de las suites), comparadas celda por celda con la Fase 0 (que era igual a P36).
Nuevas líneas de base: `docs/p40-brief/franja.json` y `docs/p40-brief/pliegue.json`.

| | Fase 0 | Cierre |
|---|---|---|
| franja | 28 filas | **224/224** celdas iguales |
| pliegue | 28 filas | **1048/1062** — las 14 distintas son **todas de m6**, la pantalla que el sprint rehace; las otras trece pantallas, a los dos anchos, idénticas |

**m6, lo que no se movió** (a 1440 y a 390): pliegue (788/688), barra (57), pliegue efectivo (731/631), **primer accionable
(371/459)**, arranque del bloque de trabajo (626/730), **acción principal a la vista arriba y abajo**, su posición (710/610),
«entra algo accionable en el pliegue» (sí a 1440, no a 390, igual que antes), cromo del layout-tipo (408/436), superficies (2),
rótulos (1), links externos, internos, pasos de la franja y píldoras «Link pendiente».

**m6, lo que se movió, y por qué no es empeorar:**

| Celda | 1440 | 390 | Por qué |
|---|---|---|---|
| `captura` (primer control del bloque de trabajo) | 697 → **672** | 798 → **773** | **mejoró**: el primer control ahora es la cabecera de la vuelta 1, 25 px más arriba que el textarea de antes |
| `capturaEtiqueta` | textarea → «1 · Lectura estética…» | ídem | el primer control es otro |
| `alturas.registro` | 782 → 1801 | 972 → 2461 | las cuatro vueltas (con la 1 abierta) y los tres campos nuevos |
| `altoTotal` | 1550 → 2570 | 1845 → 3334 | ídem |
| `censo.copiar` | 1 → 2 | 1 → 2 | el mensaje de la vuelta abierta |
| `censo.controles` | 7 → 17 | 7 → 17 | cuatro cabeceras, copiar, dos campos de la vuelta abierta, tres campos nuevos |
| `censo.plegables` | 3 → 4 | 3 → 4 | el «Ver el texto que vas a copiar» del mensaje |

La primera medición del código nuevo dio además **+16 px en el primer accionable a 390**: la instrucción nueva del bloque de
contexto ocupaba un renglón más. Se acortó y la segunda medición volvió a 459 — por eso no figura en la tabla.

---

## 8 · La base vuelve a su estado

Con el código final (`scripts/p39-censo-base.mts`, 63 tablas contadas + leads, usuarios y avisos por id):

| Foto | OsLead | User | OsSetterNotice | Suite | Tablas con delta contra la foto anterior |
|---|---|---|---|---|---|
| antes | 105 | 21 | 6 | — | — |
| tras `test:leados` | 105 | 21 | 6 | **95/95** (43 + 52 nuevas) | **ninguna** |
| tras `test:helpers` | 105 | 21 | 6 | **28/28** | **ninguna** |
| tras `test:setter` | 105 | 21 | 6 | **202/202** (194 + 8 nuevas) | **ninguna** |
| **antes → después** | | | | | **ninguna** |

**Delta cero.** Las ocho pruebas nuevas del setter siembran un lead cada una y lo borran por id. Cada corrida suelta de
este sprint (la spec nueva contra el código nuevo y contra el de partida, las capturas dos veces) también se midió antes y
después: ninguna dejó filas. El rojo de servidor frío anunciado no apareció en ninguna de las dos corridas completas.

---

## 9 · Cierre

| Gate | Resultado |
|---|---|
| `tsc --noEmit` | exit **0** |
| Invariantes | **57/57** (58 descubiertos, 1 excluido; ninguno tocado) |
| `test:leados` · `test:helpers` · `test:setter` | **95/95 · 28/28 · 202/202** (build final `.next-setter`, 3003) |
| `npm run build` | exit **0** |
| `npx prisma migrate status` | 86 migraciones · **«Database schema is up to date!»** — sin drift |
| Franja · pliegue | **224/224** · **1048/1062** (las 14 de m6, §7) |
| Base | 105 leads · 21 usuarios · 6 avisos · **delta cero** en las tres suites |
| Revisión de código (subagente) | **APROBADO**: 0 CRITICAL, 0 HIGH, 0 MEDIUM. Un LOW corregido (el pegado del documento usaba `setForm` no funcional: ahora solo mezcla los campos que el lector cambió) y un LOW teórico declarado (§10) |
| WIP ajeno | **180 de 180 idénticos** por md5 antes de escribir la bitácora |
| Entorno | servidores propios bajados por PID (3003 y 3040); build temporal `.next-p40` borrado; `tsconfig.json` (ruido del build) restaurado por ruta explícita; 27,7 GB libres |

**Qué cambió.** Producto, modificados: `contracts.ts`, `dossier.schemas.ts`, `copy-blocks.ts`, `guidance-content.ts`,
`herramientas.ts`, `brief-form.tsx`, `m6-brief.tsx`, `brief-sanity.tsx`, `manual/[paso]/page.tsx` (props de m6),
`dossier-panels.tsx` (revisión). Producto, nuevos: `encabezado-documento.ts`, `brief-vueltas.ts`, `prompts-gem-diseno.ts`,
`vueltas-gem.tsx`, `lectura-documento.tsx`, `resumen-vueltas.tsx`. Pruebas, nuevas: `encabezado-documento.spec.ts`,
`brief-cuatro-vueltas.spec.ts`, `32-brief-cuatro-vueltas.spec.ts`, `documento-construccion-fixtures.ts`. Instrumentos, nuevos:
`p40-peso-brief.mts`, `p40-briefs-parsean.mts`, `p40-bloque-golden.mts`, `p40-capturas.mts`.

**Confirmado:** ningún brief guardado dejó de parsear (49/49 de la base, y un brief viejo abierto y re-guardado en la
pantalla: mismas claves + la editada); el gate de construcción no se aflojó ni se endureció (`git diff` vacío en los
archivos de gate, transición y llaves; las pruebas que cierran m6 sin el Gem siguen verdes); ninguna llave de datos, ninguna
transición, ningún campo sacado (`pegadoGem` sigue, con su regla); ninguna prueba borrada ni salteada; ningún invariante
tocado; las dos superficies fijas y mc1/mc2 sin tocar; nada agregado a git, nada commiteado ni pusheado.

---

## 10 · Anotado, no hecho

- **La decisión de gate de §3.1** (la cuarta vuelta para cerrar el paso, atada al link del Gem). Es de Franco.
- **La home del setter carga el dossier entero de cada lead** (`listOwnedLeads`, `include: { dossier: true }`), y la home no
  lee el brief. Con documentos de cuatro vueltas, `setter-qa` pasaría de 141 a ~570 KB por carga (+7 ms medidos de
  transferencia). Arreglo natural: un `select` sin los blobs. Toca el censo congelado de consultas: sprint aparte (queda
  sugerido como tarea).
- **Un `vueltas: {}` vacío puede persistirse** si alguien le manda a la acción un payload a mano (la pantalla nunca lo
  arma): el contrato no poda objetos vacíos como poda textos vacíos. Sin pérdida de datos; LOW de la revisión de código.
- **`concepto`, `cta` y `notasMarca` siguen sin techo en el input**: un pegado de más de 5.000 ahí muere igual que moría el
  pegado del Gem («No se pudo guardar el brief»). Anterior a este sprint.
- **El contexto de m6 repite la ficha y la evaluación** que ya viajan en el mensaje de la vuelta 1. Queda para consulta; se
  puede retirar en la pasada de la pantalla.
- **Del documento de decisiones de m6, lo que NO entró** (cada uno es otra decisión): se va «Título del brief»; el CTA pasa a
  obligatorio; «Concepto» pasa a «Ángulo wow»; el vocabulario «Brief» de la pantalla; la lista completa de material a juntar
  antes de empezar (hoy va resumida en la intro de la vuelta 1); el piso anti-slop y el prompt base de mc1 (el sprint de mc1).
- **Los prompts del Gem ahora viven en el producto** (`prompts-gem-diseno.ts`). Cuando Franco corrija el paquete del Gem, el
  texto del producto tiene que seguirlo: la prueba 4e ata las etiquetas del molde al lector, no el resto del texto.
- **Galería**: los estados `12-m6-brief-abierto` y `13-m6-brief-guardado` van a fotografiar la pantalla nueva; no se
  regeneró.

---

## 11 · Para la verificación humana

- **Que las cuatro vueltas se sientan como una conversación y no como cuatro formularios.** Lo que hay: cada vuelta trae la
  anterior adentro de su mensaje, la siguiente se abre sola, y la cuarta llena el brief. Si al usarla pesa, el lugar para
  mirar es la densidad de cada vuelta (intro + mensaje + dos campos) — capturas `01`, `02`, `06`.
- **El contrato del encabezado (§2).** Es lo que Franco va a tener que pedirle al Gem. La prueba de fuego es correr el Gem de
  verdad con un negocio real y pegar lo que devuelve: si la lectura sale «incompleta» o «sin encabezado» con un documento que
  a ojo está bien, el contrato o la tolerancia están mal — y conviene saberlo antes de armar el Gem.
- **La decisión 2** (§1.2): guardar lectura + decisiones y no las cuatro enteras. Si Franco quiere solo la última, es cambiar
  `vueltasParaGuardar`.
- **La decisión de gate de §3.1.**
