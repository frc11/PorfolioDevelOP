# P43 · «Refinar» (mc2) — FRENÉ en la reconciliación

2026-09-15. Rama `p25/rafaga-tildes`, HEAD `4f8c00a2` (sin commitear, igual que P29–P42). Nada pusheado, nada agregado a git.

**Frené en la Fase 1 por la primera condición del encargo: los dos pisos divergen en tres cosas que cambian qué demo sale** (§2): qué manda en cada sección (D1), qué pasa sin fotos reales (D5) y si hay menú (D6). La decisión es de Franco.

Dos cosas más van a la misma decisión, pero **solas no hubieran frenado**, y lo digo así:

- cuatro divergencias más débiles (D2, D3, D4, D7) y cinco menores (D8–D12);
- el prompt 1 reescribe los textos que el documento del Gem dicta: coincide al pie de la letra con la segunda condición, pero el choque es de diseño y tiene una adaptación que le conserva el propósito (§4).

La tercera condición **no** se cumple: un tilde alcanza sin tocar la llave del progreso (§5.5).

No se escribió ningún prompt final ni se tocó la pantalla (pasos 2 a 4). El paso 1, el censo, está hecho porque es de solo lectura y es la evidencia de la reconciliación (§6). Todo el análisis pasó por una verificación adversarial independiente que corrigió la primera versión de este reporte (§7).

Los documentos fuente ya estaban en `docs/decisiones-oslead-vii/`, byte por byte los que subiste (`mc2-prompts-refinamiento.md` md5 `c3ccd5eb…`, `gem-de-diseno-paquete.md` md5 `5761f6a9…`, iguales a los de Descargas). No hubo nada que subir.

---

## 0 · Terreno

| | |
|---|---|
| Git | HEAD `4f8c00a2` · `main` = `origin/main` = `57c421bc` · 28 worktrees (con el checkout principal) y 2 stashes, no tocados |
| WIP ajeno | 402 archivos modificados o no rastreados, copiados con md5 en `C:\tmp\p43-refinar\wip-f0` (manifiesto + `git diff --numstat`) |
| Procesos ajenos | 21 `node`: 18 de `chrome-devtools-mcp` (PIDs 57328, 18764, 81308, 22020, 98572, 67500, 92440, 108828, 29504, 4132, 45976, 15156, 16476, 3380, 50124, 104508, 6164, 95128) y 3 de un `vitest` de otro proyecto, `Desktop\CodenoaPili` (57160, 6720, 84756). Ningún servidor en 3000–3019. No se tocó ninguno |
| Disco | 26,3 GB libres (24,5 GiB) |
| `tsc --noEmit` | exit **0** |
| Invariantes | **57/57** (58 descubiertos, 1 excluido) |
| `test:leados` | **118/118** |
| `test:helpers` | **28/28** |
| `test:setter` | **208/210** en frío (build `.next-setter` en 3003, `SETTER_EXTERNAL_SERVER=1`). Los dos rojos son los dos conocidos, repetidos antes de atribuir (§0.1) |
| Base | 63 tablas · 105 `OsLead` · 21 `User` · 6 `OsSetterNotice` · 86 `OsLeadDossier` — **sin delta** en toda la ida y vuelta |
| Mediciones fijas | franja **224/224** · pliegue **1054/1054** contra las líneas de base de P42 (`docs/p42-construccion/{franja,pliegue}.json`; en esa línea de base mc1 ya no tiene las alturas de contexto y munición, por eso son 1054 celdas y no 1062) |
| La llave del progreso | `scripts/p42-llave-progreso.mts` → md5 **`9968d31050b38c8120dc22add52ec566`**, idéntico al de P42 |
| `prisma migrate status` | 86 migraciones · «Database schema is up to date!» |
| Briefs en la base | 56 `briefJson`, los 56 parsean, **0 con documento del Gem**, 0 con vueltas, 36 con el pegado viejo (`scripts/p40-briefs-parsean.mts`) |

### 0.1 · Los dos rojos, repetidos contra la misma partida

| Prueba | En la corrida en frío | Repetida | Mecanismo |
|---|---|---|---|
| `01-flow` B3 · OPENER | roja: no aparece el cartel «Opener registrado» | **3 de 3 verdes** en caliente | el flake marcado en el archivo: «en la primera visita en frío la acción persiste y el cartel no se monta» |
| `32-brief-cuatro-vueltas` B | roja: «exactamente una vuelta desplegada — Received: ["1 · Lectura estética", "2 · Decisiones"]» | **3 de 8 rojas**, las tres con ese mismo mensaje | el helper lee los `aria-expanded` en serie (`32-brief-cuatro-vueltas.spec.ts:61`); P42 midió 3 de 8 contra la partida y probó con un `MutationObserver` que el DOM nunca tuvo dos abiertas |

Ninguno de los dos es de este sprint: no cambió una línea de producto.

### 0.2 · La base, foto por foto

`scripts/p39-censo-base.mts` (63 tablas + leads, usuarios y avisos por id). **Tablas con delta: ninguna** en cada comparación: f0 → f0 sin invariantes corriendo → tras `test:leados` → tras `test:helpers` → tras `test:setter` → tras las repeticiones de los dos rojos → tras las mediciones fijas → tras el censo de la pantalla → antes y después de la segunda corrida del censo (§7). **105 / 21 / 6 en todas.**

---

## 1 · Por qué frené, en corto

| Condición de frenada del encargo | ¿Se cumple? | Dónde |
|---|---|---|
| Los dos pisos divergen en algo que cambia qué demo sale | **Sí — D1, D5 y D6** | §2.2 |
| Un prompt pide algo que el bloque de construcción ya hace, y aplicarlo lo desharía | **al pie de la letra, sí (prompt 1); como frenada propia, no**: el choque es de diseño | §4 |
| Aplicar el documento exige tocar la llave del progreso más allá del tilde | No | §5.5 |

**Por qué la divergencia de los pisos frena mc2 y no solo mc1.** El prompt 2 del documento fuente dice «respetá el piso de calidad», y el piso que la herramienta tiene en la conversación es el que construyó P42, no el escrito contra el que se redactaron los prompts. Con uno o con otro, el prompt 2 (qué manda en cada sección), el 3 (el menú) y el 4 y el 5 (el menú, las imágenes) se adaptan distinto (§3).

---

## 2 · Los dos pisos, línea por línea

- **Escrito** = el piso anti-slop del paquete del Gem, `docs/decisiones-oslead-vii/gem-de-diseno-paquete.md` §6 (líneas **G383–G467**).
- **Construido** = `PISO_DE_CALIDAD` de P42, `src/lib/leados/prompt-construccion.ts` (líneas **P101–P171**), lo que hoy viaja como capa 3 del bloque de «Construir». Verificado contra el código.

Columna «Qué pasó»: **igual** (mismo criterio y mismo efecto) · **afilada** (mismo criterio, con número o precisión) · **cambiada** (otro criterio) · **agregada** (no está en el escrito) · **sacada** (está en el escrito y no en el construido).

### 2.1 · La tabla entera

| # | Sección | Escrito (§6) | Construido (P42) | Qué pasó | ¿Cambia qué demo sale? |
|---|---|---|---|---|---|
| 1 | Encabezado | G393–394 «PISO DE CALIDAD — NO NEGOCIABLE / Esto aplica siempre, aunque no se mencione arriba.» | P101 «No negociable. Aplica siempre, aunque el documento no lo mencione, y si el documento dice otra cosa, gana esto.» | igual (el «gana esto» está en el escrito en la línea puntero) | No |
| 2 | Puntero | G384–386 «…al final de este documento hay un PISO DE CALIDAD no negociable. Leelo entero antes de escribir una línea de código. Si algo de arriba lo contradice, gana el piso.» | P91 (prompt base) «Al final de este mensaje hay un PISO DE CALIDAD no negociable. Leelo antes de escribir una línea. Si algo del documento lo contradice, gana el piso.» | igual (viene del prompt base cerrado de mc1, `decisiones-por-pantalla.md:270-272`) | No |
| 3 | IDIOMA | G398–399 rioplatense, voseo, nada de «tú» ni neutro | P104 lo mismo + ejemplos «reservá», «escribinos», «vení» | igual | No |
| 4 | JERARQUÍA | G402 «En cada sección manda UNA sola cosa.» | P107 «…manda una sola cosa: **un único elemento con el tamaño más grande, su título**. Nada más de la sección llega a ese tamaño.» | **cambiada**: el escrito no dice qué manda; el construido decide que manda el título | **Sí — D1** |
| 5 | JERARQUÍA | G402–403 «El título del hero es lo más grande y fuerte de la página.» | P108 «El título de la primera pantalla es el texto más grande de toda la página.» | afilada | No |
| 6 | JERARQUÍA | G403 «El botón principal resalta del resto.» | P110 «…resalta del resto: es lo único que lleva el color de acento, también donde se repite.» | igual + agrega la regla del acento (que el escrito tiene en COLOR) | No |
| 7 | JERARQUÍA | G403–404 «Lo secundario es más chico y más discreto.» (+ G417 «Diferencia de tamaño evidente entre título, subtítulo y cuerpo.») | P109 «**Tres tamaños** de texto bien separados: título, subtítulo y cuerpo. El título mide **por lo menos el doble** que el cuerpo.» | afilada, con número nuevo (2×); «tres tamaños» admite leerse como «solo tres» | Poco — D8, D12 |
| 8 | JERARQUÍA | G404 «Si tres cosas compiten, ninguna gana.» | — | sacada (fundamento) | No |
| 9 | JERARQUÍA | G405–406 «Prueba: mirando la pantalla borrosa, tiene que entenderse qué es lo importante.» | — | sacada (criterio de persona; traducido a la fila 4) | No por sí sola |
| 10 | JERARQUÍA | G462 (prohibido) «Todo centrado y del mismo tamaño» | P111 «Nunca todo centrado y del mismo tamaño: **el cuerpo de texto va alineado a la izquierda**.» | **agregada** la segunda mitad | Poco — D2 |
| 11 | AIRE | G409 «Espacio generoso entre secciones y alrededor de cada bloque.» (+ G430 «El mismo espaciado entre secciones en toda la página.») | P114 «La misma separación vertical entre todas las secciones: **por lo menos 80 px** en computadora y **56 px** en el celular.» | afilada, con números nuevos | Poco — D8 |
| 12 | AIRE | G409–410 «Márgenes laterales amplios.» | P115 «Márgenes laterales de **por lo menos 24 px** en el celular. En computadora, **el contenido en una columna de 1200 px como máximo, centrada**.» | afilada (24 px) + agrega la columna | Poco — D4, D8 |
| 13 | AIRE | G410 «Nada pegado al borde.» | P116 «Ningún texto, botón **o imagen** pegado al borde de la pantalla **ni a otro elemento**.» | afilada + agrega «ni a otro elemento» (las imágenes ya las cubría «nada») | Poco — D4 |
| 14 | AIRE | G410–412 «**Ante la duda** entre más aire y más contenido, va más aire…» | P117 «Si algo no entra con ese aire, **sacá contenido**: no achiques los espacios.» | **cambiada**: el mismo sentido, de desempate a orden | Poco — D3 |
| 15 | TIPOGRAFÍA | G415–416 «Dos fuentes, nunca más: una con carácter para títulos, una neutra y legible para el cuerpo.» | P120 lo mismo + «Si el documento las nombra, usá esas.» | igual + agrega la precedencia del documento | No |
| 16 | TIPOGRAFÍA | G416 «NUNCA la fuente por defecto del sistema.» | P121 «Cargalas de verdad (por ejemplo, desde Google Fonts). Nunca la fuente por defecto del sistema: **si una fuente no carga, elegí otra que sí**.» | afilada + agrega la salida | Poco — D12 |
| 17 | TIPOGRAFÍA | G418–419 «Líneas de cuerpo que no crucen toda la pantalla, con espacio entre renglones.» | P122 «Cuerpo de **16 px** como mínimo, con interlineado de **1,5** y renglones de **75 caracteres** como máximo.» | afilada, con números nuevos | Poco — D8 |
| 18 | COLOR | G422 «Un neutro dominante, un acento, un apoyo como techo. Tres colores máximo.» | P125 «Tres colores como máximo: un neutro dominante **para los fondos**, un acento y un apoyo. Si el documento trae la paleta, usá esos colores y ningún otro.» | igual + agrega «para los fondos» y la precedencia de la paleta | Poco — D12 |
| 19 | COLOR | G423–424 «El acento se reserva para el botón principal…» | P126 «El acento va solo en el botón principal y en sus repeticiones.» | igual (coherente con G449, «repetido al final») | No |
| 20 | COLOR | G424–425 «Contraste real entre texto y fondo — nunca gris claro sobre blanco.» | P127 «Contraste alto…: **4,5 a 1** como mínimo en el cuerpo. Nunca gris claro sobre blanco.» | afilada | Poco — D8 |
| 21 | ALINEACIÓN | G428 «Todo alineado a una grilla, con márgenes iguales entre secciones.» | P130 | igual | No |
| 22 | ALINEACIÓN | G429 «…el mismo radio y el mismo **tamaño**.» | P131 «…el mismo radio de esquina y la misma **altura**.» | afilada (permite anchos distintos) | No |
| 23 | ALINEACIÓN | G430–431 «Lo desprolijo se nota aunque nadie sepa explicar por qué.» | — | sacada (fundamento) | No |
| 24 | IMÁGENES | G434 «Nítidas, **coherentes con el rubro**, y NUNCA deformadas ni estiradas.» | P136 «Nunca deformes ni estires una imagen: recortala manteniendo la proporción.» + P169 «pixeladas» | igual, pero saca «coherentes con el rubro», que da por hecho que hay imágenes | No por sí sola — es parte de D5 |
| 25 | IMÁGENES | G435–436 «Cuando hay fotos reales del negocio, van esas antes que cualquier otra cosa. Prohibido el stock genérico.» | P134 «Primero las fotos reales… Nunca fotos de banco, **ilustraciones genéricas ni imágenes generadas**.» + P135 «**Si no podés usar las fotos reales, no pongas otras: armá la sección sin foto** y anotalo…» | **cambiada** + agrega qué pasa sin fotos | **Sí — D5** |
| 26 | IMÁGENES | G437–439 sin logo → nombre con la fuente de títulos, nunca un logo inventado | P137 | igual | No |
| 27 | CONTENIDO | G442–443 «Todo el texto habla de ESTE negocio…» | P141 | igual | No |
| 28 | CONTENIDO | G443–444 «…cero frases que le servirían igual a cualquier otro.» | P142 «…a cualquier otro **negocio del rubro**.» | afilada (más estrecha) | No |
| 29 | CONTENIDO | — | P140 «El nombre del negocio va en la primera pantalla y en el pie, con su rubro y su zona.» | **agregada** (fuente escrita: los nueve puntos del shell de mc1) | Poco — D10 |
| 30 | BOTÓN | G447–448 «El texto **invita, no ruega**. "Reservá tu lugar", "Pedí tu turno", "Solicitá tu presupuesto". Nunca "Contactanos" ni "Más información".» | P145 «El texto **nombra la acción y lo que la persona consigue**: «Reservá tu turno», «Pedí tu presupuesto». Si el documento trae el texto del botón, usá ese.» + P146 «Nunca «Contactanos», «Más información», «Enviar» ni «Click acá».» | **cambiada** (otro criterio y otros ejemplos) | Poco — D9 (el CTA es obligatorio en el brief y el piso manda usar el del documento) |
| 31 | BOTÓN | G449 «Visible sin scrollear, y repetido al final de la página.» | P147 lo mismo, «en el celular y en la computadora» | igual | No |
| 32 | BOTÓN | — | P148 «Si el documento trae el link de WhatsApp, el botón lo abre. Si no lo trae, no inventes un número: **dejá el botón sin link** y anotalo…» | **agregada** (fuente escrita: CONTACTO REAL del prompt 3 del Gem) | Poco — D11 |
| 33 | MENÚ | G452 «Sólido, sin efecto vidrio ni blur.» | P153 | igual | No |
| 34 | MENÚ | G452–453 «Los links llevan a secciones de esta misma página y funcionan todos. Ninguno lleva a una página que no existe.» | P151 «**Si hay menú**, cada link lleva a una sección de esta misma página, y esa sección existe…» + P152 «…en el celular, además, cierra el menú.» | afilada + agrega el **condicional** | **Sí — D6** |
| 35 | MENÚ | — | P154 «Un menú que no funciona es lo primero que delata… **Si la página no lo necesita, mejor sin menú**.» | **agregada** | **Sí — D6** |
| 36 | CELULAR | G456–457 «Nada cortado, nada desbordado, textos legibles sin agrandar, y el botón de contacto alcanzable con el pulgar.» | P157–158 lo mismo + «Diseñala primero para un celular de **390 px**» | afilada | No |
| 37 | MOVIMIENTO | G467 (prohibido) «Animaciones que mareen o tarden» | P161 «**Solo animaciones sutiles de entrada, de menos de medio segundo.** Nada que maree, parpadee o haga esperar para leer.» | **cambiada**: de prohibir lo que marea a permitir solo entradas | Poco — D7 |
| 38 | PROHIBIDO | G460 vidrio en la barra | P164 | igual | No |
| 39 | PROHIBIDO | G461 «Sombras y efectos repartidos **sin criterio**» | P165 «Sombras, **degradados y brillos** repartidos **por toda la página**.» | cambiada | Poco — D12 |
| 40 | PROHIBIDO | G462–466 centrado y del mismo tamaño · más de dos fuentes · cuatro o más colores · imágenes pixeladas o de banco · muros de texto | P166–170 | igual | No |
| 41 | PROHIBIDO | — | P171 «Un menú con links que no llevan a ningún lado.» | agregada (coherente con MENÚ) | No |

**Cuenta.** Clasificación principal: **15 iguales, 12 afiladas, 6 cambiadas, 5 agregadas y 3 sacadas**. Además agregan algo las filas 6, 12, 13, 15, 16, 18, 25, 34 y 37; la 24 además saca «coherentes con el rubro».

**Cambian qué demo sale: D1, D5 y D6** (filas 4, 25 y 34–35). Más débiles: D2, D3, D4 y D7. Menores: D8–D12.

**De dónde sale cada divergencia.** El piso construido **no salió de cero**: sale del escrito, y varios agregados tienen fuente escrita en otro lado.

| | Fuente escrita, si la hay |
|---|---|
| D1 | parcial: la pantalla de mc2 ya decía «jerarquía clara (un solo título grande por sección)» (`flow-content.ts:95`) y el prompt «Pulí la estética» también (`prompts-disenio.ts:69`) — semilla del Bloque 4·A, no un texto de Franco. «Un solo título grande» no es «el título es lo más grande de la sección» |
| D2 · D4 (la columna) · D6 | ninguna. D6 contradice una decisión escrita |
| D3 | reescribe como orden el desempate del escrito (G410–412) |
| D5 | parcial: la regla de imágenes del prompt 3 del Gem pide declarar el faltante en vez de proponer stock (`prompts-gem-diseno.ts:160-162`); la prohibición de ilustraciones e imágenes generadas y la sección sin foto no tienen fuente |
| D7 | ninguna; el escrito solo prohíbe lo que marea o tarda |
| D8 | ninguna (los 16 px coinciden con el prompt 4 de mc2) |
| D10 · D11 | el shell de mc1 · CONTACTO REAL del prompt 3 del Gem |

P42 ya había puesto varios de estos puntos para la verificación humana (§12 de su reporte: los números, el cuerpo a la izquierda, la sección sin foto, el botón sin link, «mejor sin menú»). **No encontré una respuesta registrada** en la bitácora ni en los documentos de decisiones; como este encargo pide compararlos, los trato como abiertos.

### 2.2 · Las tres que cambian qué demo sale

**D1 · Qué manda en cada sección.** Escrito: «manda UNA sola cosa» (G402), sin decir cuál. Construido: manda «su título» (P107). Y el documento del Gem **decide** qué manda: la vuelta 3 pide «DIRECCIÓN VISUAL — … Qué manda en cada sección» (`prompts-gem-diseno.ts:146-148`); el documento de ejemplo de P42 dice «en precios, la lista; en el local, las fotos» (`docs/p42-construccion/bloque-ejemplo-con-encabezado.txt`). Ante una contradicción gana el piso (`prompt-construccion.ts:91`, `:101`). **Con el escrito**, en una sección mandan las fotos si el documento lo decide. **Con el construido**, manda el título; y leído al pie de la letra («Nada más de la sección llega a ese tamaño») ningún otro elemento llega a su tamaño — es ambiguo si eso alcanza a las fotos, porque el resto de JERARQUÍA habla de tamaños de texto.

**D5 · Qué pasa sin fotos reales.** Escrito: prioridad a las fotos reales y prohibido el stock (G435–436), y da por hecho que hay imágenes («Nítidas, coherentes con el rubro», G434); no dice qué hacer sin fotos. Construido: prohíbe también ilustraciones e imágenes generadas y manda armar la sección sin foto (P134–135). Tres hechos lo vuelven decisivo:

1. las imágenes del negocio se arrastran **al chat del Gem** (`gem-de-diseno-paquete.md:366`, `:371` «el setter arrastra al chat del Gem, no a LeadOS»); a Claude Design le llegan **direcciones** (Instagram, Maps) en «DE DÓNDE BAJAR EL LOGO Y LAS FOTOS REALES», no archivos;
2. que Claude Design pueda bajar fotos desde esas direcciones **no está en ningún supuesto registrado** (S-12 es el setter juntando material; S-24, el Gem leyendo imágenes): sería uno nuevo;
3. P42 sacó el paso del setter «Insertalas donde Claude Design puso imágenes genéricas o de stock» y lo convirtió en la prohibición del piso (reporte de P42, §1.4, fila 8). **Ningún prompt de mc2 lo repone.**

**Con el construido**, si la herramienta no puede bajar las fotos, la demo sale sin imágenes y nadie inserta las reales. **Con el escrito**, sale con imágenes que no son de banco.

**D6 · El menú.** Escrito: el menú existe y funciona (G452–453). Construido: «si hay menú…», «si la página no lo necesita, mejor sin menú» (P151, P154). El formato está marcado **DECIDIDO** en el brief v4 §5: «**One-page**, con menú que **funciona** y scrollea a secciones de esta misma página» y «un menú muerto es exactamente "se nota que salió de un prompt" — el criterio de rechazo número uno» (`BRIEF-VISION-FLUJO-SETTER-v4 (1).md:129-135`); el encuadre del paquete dice lo mismo (`gem-de-diseno-paquete.md:77-78`); y el propio prompt base del bloque, sin condicional: «El menú lleva a secciones de esta misma página y funciona» (`prompt-construccion.ts:85`). **Con el construido salen demos sin menú.**

### 2.3 · Las cuatro más débiles

| | Qué | Por qué es más débil de lo que parece |
|---|---|---|
| D2 | El cuerpo siempre a la izquierda (P111) | Solo toca el cuerpo: un título o un bloque centrado siguen permitidos, y «otra centrada y angosta» del prompt 2 (`mc2-prompts-refinamiento.md:94`) se puede leer como una columna angosta centrada con el cuerpo a la izquierda. Diferencia visible, pero cosmética |
| D3 | «Si algo no entra con ese aire, sacá contenido» (P117) | El escrito ya prefiere el aire al contenido (G410–412); el construido lo dice como orden. En una página que scrollea, 56 px entre secciones no obliga a sacar nada. El choque con los prompts 2 y 4 existe con los dos pisos (§5.3) |
| D4 | Columna de 1200 px; nada pegado al borde, imágenes incluidas (P115–116) | «Nada pegado al borde» (G410) ya alcanzaba a las imágenes. Lo que tensa «una a ancho completo» del prompt 2 son los márgenes iguales en todas las secciones, que piden **los dos** pisos (G428 / P130). La columna limita «el contenido»: un fondo a ancho completo sigue pudiendo |
| D7 | Solo animaciones de entrada, de menos de medio segundo (P161) | El escrito también deja animar en la construcción: solo prohíbe lo que marea o tarda (G467). El construido es más estricto: los estados que responden al mouse y al toque y el desplazamiento suave del menú, que pide el prompt 3 (`:131-138`), no son animaciones de entrada. Se arregla redactando el prompt 3 —cambio de estado sin transición, salto sin desplazamiento suave— o admitiéndolos en el piso: la diferencia en la demo es chica |

### 2.4 · Las cinco menores

| | Qué | Por qué la anoto |
|---|---|---|
| D8 | Los números: 80/56 px entre secciones, 24 px de margen, 1200 px de columna, título ≥ 2× el cuerpo, cuerpo 16 px / 1,5 / 75 caracteres, contraste 4,5:1, 390 px | Son la clase de instrucción ejecutable que el encargo pide («ningún texto por debajo de 16px»), pero ningún documento escrito fija estos valores. El prompt 4 los necesita: «ajustá los espaciados verticales» (`:193-195`) solo es ejecutable sabiendo si el mínimo de 56 px existe |
| D9 | El criterio del botón: «invita, no ruega» (Fricción de Prestigio) → «nombra la acción y lo que la persona consigue» | Cambia un principio con nombre propio de la capacitación. Impacto acotado: el CTA es obligatorio en el brief y el piso manda usar el del documento |
| D10 | Nombre, rubro y zona en la primera pantalla y en el pie | Tiene fuente escrita (el shell de mc1), no está en §6 |
| D11 | Sin número de WhatsApp, botón sin link | Tiene fuente escrita (prompt 3 del Gem), no está en §6 |
| D12 | «Tres tamaños de texto» · «neutro dominante **para los fondos**» · «si una fuente no carga, elegí otra» · «degradados y brillos… por toda la página» | Ambigüedades que la herramienta resuelve distinto cada vez |

---

## 3 · Dónde cada prompt depende del piso que quede

Solo las instrucciones que **no se pueden adaptar sin saber qué piso gana**. Las que se corrigen igual con cualquiera de los dos están en §5.3.

| Prompt (línea del fuente) | Con el piso escrito | Con el piso construido |
|---|---|---|
| 2 · JERARQUÍA «En cada sección manda una sola cosa» (`:80`) | coincide; qué manda lo decide el documento | tiene que decir que manda el título, o choca con la dirección visual del documento (D1) |
| 3 · MENÚ «Los links del menú llevan suavemente a su sección» (`:136-138`) | aplica siempre: hay menú | puede no haber menú (D6); y el desplazamiento suave no es de entrada (D7) |
| 4 · TOQUE «El menú de celular abre y cierra bien y no tapa el contenido» (`:185-186`) | aplica siempre | puede no aplicar (D6) |
| 5 · IMÁGENES «Ninguna deformada, estirada ni pixelada. Ninguna rota. Todas con texto alternativo» (`:225-226`) — y ningún prompt inserta las fotos reales | hay imágenes para revisar | puede no haber ninguna, y nadie inserta las reales (D5): hay que decidir si mc2 suma un paso para las fotos |
| 3 · ESTADOS «Los botones cambian al pasar el mouse y al tocarlos» (`:131-134`) | compatible | sin transición animada, o el piso admite los estados (D7, débil) |
| 3 · ENTRADAS «transiciones suaves y cortas… Nada que tarde» (`:126-129`) | hay que ponerle número | el piso ya dice < 0,5 s (D8) |
| 4 · ESPACIO «Ajustá los espaciados verticales… sin apretar el contenido» (`:192-195`) | ejecutable con cualquier valor «generoso» | no puede bajar de 56 px (D8) |

---

## 4 · El prompt 1 y los textos que el documento del Gem ya dicta

**Lo que ya dicta el documento, antes de mc2:** la vuelta 3 le pide al Gem **escribir los textos** — «LO PRIMERO QUE SE VE — …qué dice el título, qué dice la línea que va debajo del título… Es la decisión más importante de la página» y «SECCIÓN POR SECCIÓN — … qué texto va (escribilo vos, no describas que "va un texto")» (`prompts-gem-diseno.ts:134-144`). El bloque de «Construir» los lleva enteros y el prompt base manda construir «siguiendo el documento» (`prompt-construccion.ts:75`).

**Lo que pide el prompt 1:** «Reescribí el texto de toda la página» (`mc2-prompts-refinamiento.md:36`), con una sola excepción: «El botón principal mantiene el texto exacto que dice el documento» (`:51-52`).

**Aplicado tal cual, reescribe el título y la línea de la primera pantalla que el documento fijó, y los textos de cada sección.** Eso coincide al pie de la letra con la segunda condición del encargo.

**Por qué no la sostengo como frenada por sí sola:**

- **el choque es de diseño, no un efecto de P40 o P42.** La cadena de calidad cerró m6 antes que mc2 (`decisiones-por-pantalla.md:8`, «`m6` → `mc2` → …», en un archivo de solo agregar), y mc2 justifica el prompt 1 justamente contra el copy derivado de la especificación: «un copy derivado de una spec sale correcto pero plano» (`:98`); el prompt lo dice: «suenen a especificación» (`mc2-prompts-refinamiento.md:33-34`);
- **hay una adaptación que le conserva el propósito** (opción c de §9.2): reescribir para que suene al negocio, dejando exactos el título y la línea de la primera pantalla, como ya deja el botón;
- «manda la decisión» (`prompt-construccion.ts:89`) protege las decisiones del encabezado (secciones, llamado a la acción, tono, paleta, tipografía), **no** los textos: no sirve de evidencia acá.

**Matiz medido:** hoy **ningún** brief de la base tiene documento (0 de 56). El choque es del flujo diseñado, el que va a usar el setter.

**Por qué igual va a la decisión:** elegir entre (a), (b) y (c) decide qué textos llegan a Franco, y es producto. Lo mismo para el prompt 2: su «libertad para proponer» protege paleta y tipografía (`:73-75`), pero no el resto de la «DIRECCIÓN VISUAL» ni «LO QUE NO VA» del documento (`prompts-gem-diseno.ts:146-153`). El documento fuente ya lo nombra como el supuesto de mayor varianza (S-27).

---

## 5 · La reconciliación del documento fuente, completa

### 5.1 · Lo que asume de la pantalla, y qué ya no es cierto

| Lo que dice el documento | Qué hay hoy (medido, §6) | Estado |
|---|---|---|
| «Hoy hay tres fases y cuatro prompts» (`:23`) | tres fases (`flow-content.ts:79-108`) y **tres** prompts (`prompts-disenio.ts:59-108`); con el bloque de arriba son **cuatro copiables** | casi cierto: los cuatro son copiables, no prompts |
| «Hoy `mc2` ofrece el mismo `BRIEF DE DEMO` con "Copiar bloque" que `mc1`» (`:252`) | **ya no.** Desde P42, mc1 copia las tres capas y mc2 sigue copiando el bloque de siempre. Medido con el mismo lead (QA-W Construccion): **mc1 copia 7.426 caracteres con INSTRUCCIONES y PISO; mc2 copia 730, sin ninguno de los dos** | la razón del documento («ofrecerlo de nuevo invita a empezar de cero») pesa **más** que cuando se escribió: pegado en un chat nuevo, construye sin piso ni prompt base |
| El bloque «pasa a ser una referencia plegada de solo lectura» (`:252`) | lo arma `ConstruccionContexto` (`m-construccion.tsx:54-79`), que **también usa «Correcciones» (mr)** (`page.tsx:334-340`) | aplicable, sin tocar `ConstruccionContexto`: mr sigue necesitando el bloque copiable |
| La salida «¿Perdiste el chat de Claude Design? Volvé a Construir.» (`:252`) | «Construir» existe y es alcanzable desde mc2 (navegación de Construcción) y ahora da el bloque completo, con piso | aplicable: volver a Construir es empezar con el bloque bueno; los cinco prompts se repiten después |
| «Se va el badge "GUÍA PRELIMINAR — EN VALIDACIÓN"» (`:256`) | está (`m-construccion.tsx:133`, `badge-provisorio.tsx:4-10`); mc2 es su único consumidor | cierto, aplicable |
| «Se va la explicación duplicada del auto-reporte, que hoy aparece dos veces» (`:258`) | dos veces en CONSTRUCCION: en Registro «Es auto-reporte: tildar no bloquea nada… hacé las fases en el orden que te sirva» (`m-construccion.tsx:325-336`) y en la navegación de Construcción «Las fases son auto-reporte: entrá y salí en el orden que te sirva…» (`manual-nav.tsx:207-210`). En BRIEF, una sola | cierto. **La segunda vive en el layout-tipo** (`pantalla-manual.tsx:240-242`, superficie fija): la que se puede sacar es la de Registro |
| «Cinco fases, cinco tildes» (`:23`, `:254`) | tres tildes, un dueño (`registro-fases.tsx:157-172`) | resuelto por el encargo: **un tilde** |
| La línea nueva «Estos cinco van seguidos, sin evaluar nada en el medio…» (`:260`) | la bajada de mc2 dice lo contrario: «**verificá** lo que hiciste y pulí el detalle» (`manual.ts:222`) | aplicable; la bajada también cambia (P42 cambió la de mc1) |

**Lo que el documento no contempla, y la pantalla o el flujo tienen:**

- **Los nueve puntos de las tres fases** (`flow-content.ts:83-107`), a la vista en Munición. Uno contradice al Gem: «Mensaje pre-cargado simple: "Hola! Vi la página y quiero hacer una consulta"» (`:85`), cuando el mensaje lo escribe el Gem en CONTACTO REAL (`prompts-gem-diseno.ts:129-132`). Hace falta el mismo censo que P42 hizo con los nueve de mc1: dónde viaja cada uno.
- **La guía de Claude Design**, leída en la pantalla: «El panel te guía fase por fase» y «Qué le das: El bloque «para Claude Design» (el brief + los materiales reales del negocio), como primer mensaje» (`herramientas.ts:86-89`). En mc2, con el bloque de solo lectura, eso es falso. La guía es compartida con mc1 y mr.
- **El chequeo final usa uno de los prompts viejos**: con «Se ve bien en tu celular» en rojo, m14 ofrece «Adaptá a mobile» de `PROMPTS_DISENIO` (`chequeo-form.tsx:84` → `prompts-disenio.ts:139-154`). Si mc2 pasa a los cinco, el producto tendría dos prompts de celular distintos.
- **Tres arreglos del chequeo final nombran fases de mc2 que ya no se van a ver**: «(«Refinar», fase Mobile)» y dos «(«Refinar», fase CTA)» (`flow-content.ts:182`, `:198`, `:209`). El `arreglo` no se persiste; el `nombre` (la llave) no se toca — mismo criterio que P42.
- **Exportar antes del último prompt** (G3, `decisiones-por-pantalla.md:523-527`): con cinco prompts y un solo tilde el riesgo crece, y el chequeo de una línea que G3 propone para m13 no está construido.
- **El avance por completitud** (S2, `decisiones-por-pantalla.md:582-588`, que nombra mc2): «el siguiente se abre solo cuando el anterior se completa». Con un tilde no hay señal de completitud por prompt, y el encargo pide los cinco copiables y legibles enteros. **No aplica**, dicho.

### 5.2 · Lo que asume de lo que viaja desde la construcción, prompt por prompt

«Ya llega» = ya lo pide el bloque de «Construir» (prompt base, documento o piso). Según el encargo, se saca y se dice.

| Prompt | Instrucción (línea del fuente) | ¿Ya llega? | Nota |
|---|---|---|---|
| 1 | «Reescribí el texto de toda la página» (`:36`) | lo dicta el documento | §4 |
| 1 | «El título principal dice qué gana el visitante» (`:42-43`) | lo decide el documento (LO PRIMERO QUE SE VE) | §4 |
| 1 | «Sacá todo lo que le serviría igual a cualquier otro negocio del rubro» (`:44-46`) | sí — piso P142 | choca con «sin cambiar el contenido» (§5.3) |
| 1 | «Usá los datos reales que están en el documento…» (`:47-49`) | sí — piso P141 + capa 2 (reseñas, precios) | |
| 1 | «Español rioplatense, voseo… Nada de "tú"» (`:50`) | sí — piso P104 («frases cortas» no) | |
| 1 | «El botón principal mantiene el texto exacto que dice el documento» (`:51-52`) | sí — piso P145 | |
| 1 | «Prohibido inventar» (`:57-58`) | sí — prompt base P87 | |
| 2 | JERARQUÍA / AIRE / TIPOGRAFÍA / COLOR / DETALLE (`:79-107`) | sí, casi todo — piso JERARQUÍA, AIRE, TIPOGRAFÍA, COLOR, ALINEACIÓN | no «se saca»: en un prompt de elevar sobre lo construido, repetir el piso es la lista de qué revisar; lo que no puede es decirlo distinto (§5.3) |
| 2 | «no pongas efecto vidrio… no repartas sombras sin criterio» (`:110-111`) | sí — piso P153, P164–165 | |
| 3 | «Los links del menú llevan… a su sección de esta misma página» (`:137-138`) | sí, salvo «suavemente» — piso P151–152 | D6, D7 |
| 3 | «Respetá la preferencia del sistema de reducir movimiento» (`:143-144`) | **no** | ejecutable: `prefers-reduced-motion: reduce` |
| 4 | «ancho de 390» (`:170`) | sí — piso P157 (360 no) | |
| 4 | «el cuerpo no baja de 16px» (`:180`) | sí — piso P122 | |
| 4 | «mide al menos 44 por 44 píxeles» (`:184`) | **no** | ya ejecutable |
| 4 | «Que no empujen el layout mientras cargan» (`:189-190`) | **no** | criterio → «cada imagen con ancho y alto (o proporción) declarados» |
| 5 | «El botón principal tiene que llevar al link real… Si no tenés el link real de algo, decímelo» (`:214-217`) | sí — piso P148, P151 | como verificación sirve |
| 5 | «Buscá… cualquier "lorem ipsum"» (`:220-222`) | sí — piso P142 | como verificación sirve |
| 5 | «Todas con texto alternativo» (`:225-226`) | **no** | |
| 5 | «Revisá que no queden errores en la consola del navegador» (`:233-234`) | **no** | supuesto nuevo, sin verificar: que Claude Design tenga consola |
| 5 | Cierre: arreglado · no pudo · datos que faltan (`:240-243`) | la construcción cierra con **cuatro**: secciones · no pudo · datos · decisiones propias (P93–99) | el encargo pide que el quinto declare igual que el de construcción |

**El orden, verificado contra lo que hace la construcción ahora:**

| Salto | Fundamento escrito (`:17-21`) | ¿Sigue en pie? |
|---|---|---|
| 1 → 2 | el texto cambia el largo, y el largo el layout | sí, **si** el prompt 1 reescribe; con la opción (b) de §9.2 el fundamento se debilita |
| 2 → 3 | se anima un layout que ya no se mueve | sí, con los dos pisos: la construcción puede animar (el escrito solo prohíbe lo que marea o tarda) y el prompt 3 igual corre sobre el layout final |
| 3 → 4 | celular al final, donde se abre | sí; la construcción ya es mobile-first (P157), el 4 es una segunda pasada |
| 4 → 5 | celular es lo más probable que rompa algo | sí |

### 5.3 · Contradicciones que hay que corregir con cualquiera de los dos pisos

Encontradas y **no aplicadas**. Listas para cuando se destrabe.

1. **Prompt 2 contra el piso (los dos):** «El acento se reserva para el botón principal y **para nada más**» (`:102`) contra «repetido al final de la página» (G449 / P147). Es la contradicción que la revisión de código de P42 encontró en el piso.
2. **Prompt 2 contra sí mismo y contra el piso (los dos):** RITMO «Alterná: una a ancho completo, otra con dos columnas, otra centrada y angosta» (`:93-94`) contra «Márgenes iguales entre secciones» del mismo prompt (`:106`) y «márgenes iguales» de los dos pisos (G428 / P130).
3. **Prompt 5 contra el piso (los dos):** «**La misma tipografía** en toda la página» (`:230`) contra «dos fuentes» (G415 / P120).
4. **Prompt 1 contra sí mismo y contra el piso (los dos):** «Si es formal, es formal» (`:40-41`) contra «Español rioplatense, voseo» (`:50`) y el voseo de los dos pisos (G398 / P104). Y aguas arriba: el Gem lee «Tuteo o usted» (`prompts-gem-diseno.ts:46`) y el TONO viaja como decisión; un negocio que trata de usted recibe una página con voseo porque gana el piso. Eso ya pasa en la construcción, con cualquier piso.
5. **Prompt 1 contra sí mismo:** «Sacá todo lo que le serviría igual a cualquier otro negocio del rubro» (`:44`) contra «sin cambiar el contenido ni las secciones» (`:36-37`).
6. **Prompt 3 contra sí mismo:** «Animá solo **desplazamiento** y transparencia, nunca el tamaño ni la **posición** de los bloques» (`:141-142`): para quien lee, desplazamiento y posición son lo mismo. Ejecutable: `transform` y `opacity`; nunca `width`, `height`, `top`, `left`, `margin` ni `padding`.
7. **Prompt 2 contra sí mismo:** «Ante la duda entre más contenido y más aire, va el aire» (`:89-90`) contra «no cambies los textos, no agregues ni saques secciones» (`:109`); y con los dos pisos, que también prefieren el aire (G410–412 / P117).
8. **Prompt 4 contra sí mismo:** «Si el botón queda abajo del corte, subilo» (`:174-175`) sin decir cómo, con «no cambies el contenido… no saques nada» (`:197-198`) y «sin apretar el contenido» (`:194-195`); y con los dos pisos, que ante la falta de lugar prefieren el aire.
9. **Prompt 5, cierre de tres contra cuatro** (§5.2).
10. **Prompt 2, una palabra:** «el piso de calidad **del documento**» (`:74-75`). En el diseño escrito es correcto —el piso va al final del documento de construcción (`gem-de-diseno-paquete.md:377`)—; en lo construido es la tercera parte del primer mensaje.
11. **Prompt 1, premisa:** «Los textos que escribiste» (`:33`). Desde la herramienta es cierto (los puso en la página); los redactó el Gem. Detalle de redacción, no frenada (§4).

### 5.4 · Lo que dice del piso

Lo compara el §2. En corto: el documento fuente asume el piso escrito, y en la conversación de Claude Design está el construido.

### 5.5 · La llave del progreso (la condición que no se cumple)

El documento pide «cinco fases, cinco tildes» (`:23`, `:254`): eso sí tocaba la llave — sumar ids a `FASE_IDS` (`contracts.ts:206-213`) y partir `calidad`, que `parseProgreso` lee todo-o-nada. El encargo lo resuelve con **un tilde**, y un tilde no la toca: `pantallaMarcada` y `alternarPantalla` (`progreso-pantalla.ts:27-41`) funcionan para cualquier lista de fases; `RegistroFases` ya acepta `tildeUnico` con cualquier lista (`registro-fases.tsx:142-156`); la derivación da mc2 por completa con el mismo criterio (`manual.ts:478-482`); `PANTALLA_DE_FASE` (`manual.ts:135-137`) y `ProgresoSchema` quedan iguales.

**Costos que no tocan la llave, para cuando se construya:** el nombre fijo del tilde, «La demo quedó construida» (`tilde-construccion.tsx:80`); dos textos de mc1 en piezas compartidas, «La demo se marca como construida…» y «Marcar la demo como construida no la arranca sola» (`m-construccion.tsx:233`, `:297`); y las pruebas de P42 que afirman los tres tildes de mc2 (`11` B-07 y C-08, `17` clase 2, `29`, `30`, `33` E).

### 5.6 · Los supuestos del documento fuente, y cuáles se midieron

| Supuesto (`:278-282`) | ¿Medido? |
|---|---|
| S-25 · Que aplique cinco prompts seguidos sin degradar lo anterior | no — Claude Design sin link (`herramientas.ts:93`) |
| S-26 · Que el ajuste de celular no rompa el motion | no |
| S-27 · Que la estética con libertad mejore y no empeore | no |
| S-28 · Que cinco corridas entren en tiempo y costo | no. Lo único medido: los cinco del fuente suman **7.236 caracteres** (1.464 · 1.849 · 1.270 · 1.363 · 1.290) |
| S-29 · Qué modelos ofrece Claude Design | no |

- **S-19 a S-30 no están en `supuestos-a-probar.md`**, que termina en S-18 (`:105`). P42 lo anotó; sigue igual. No toqué el archivo: es de Franco.
- Supuestos nuevos que salen de esta reconciliación, sin registrar: que Claude Design pueda bajar fotos desde las direcciones que le llegan (D5) y que tenga consola (prompt 5).
- Lo medido desde agosto que toca a mc2: el tamaño del bloque de construcción (P42, S-30, sin verificar contra la herramienta) y que **0 de 56** briefs tienen documento (esta corrida).

---

## 6 · Paso 1 — el censo de la pantalla (hecho, solo lectura)

Instrumento: `scripts/p43-censo-refinar.mts`. No siembra ni toca controles: abre mc2 con dos leads de la seed (QA-W Construccion, en CONSTRUCCION; QA-W Brief, en BRIEF, el del instrumento del pliegue) a 1440 y 390, y lee la pantalla en **un** `evaluate`. Base sin delta. Capturas y lectura en `capturas/antes/` (`hallazgos.json`).

### 6.1 · Qué muestra hoy, en orden

| Zona | Qué | Dónde |
|---|---|---|
| Instrucción | «Refiná la demo antes de publicarla» / «Con la demo ya en pantalla: verificá lo que hiciste y pulí el detalle.» | `manual.ts:217-224` |
| Contexto del lead | **copiable 1**: «Bloque para Claude Design» · «El brief + los materiales reales, listos para pegar como primer mensaje.» · plegable «Ver el texto que vas a copiar (28 líneas)» · 730 caracteres, **sin INSTRUCCIONES ni PISO** | `page.tsx:307-313` → `m-construccion.tsx:54-79` → `copy-block.tsx:31-100` |
| Munición | badge «Guía preliminar — en validación» | `m-construccion.tsx:133` |
| Munición | «CTA de WhatsApp»: 3 puntos, sin prompt | `m-construccion.tsx:83-124`, `flow-content.ts:79-88` |
| Munición | «Calidad y motion»: 3 puntos + **copiable 2** «Pulí la estética» (525 car.) + **copiable 3** «Mejorá el motion y los estados» (543) | `flow-content.ts:89-98`, `prompts-disenio.ts:60-75`, `:92-107`, `:179-182` |
| Munición | «Mobile»: 3 puntos + **copiable 4** «Adaptá a mobile» (457) | `flow-content.ts:99-108`, `prompts-disenio.ts:76-91` |
| Munición | guía «Claude Design» · «Link pendiente» · «Todavía no tenés el link cargado — pedíselo a Franco…» + plegable con «El panel te guía fase por fase…» | `m-construccion.tsx:141`, `herramientas.ts:83-94` |
| Registro | «Es auto-reporte: …hacé las fases en el orden que te sirva. El único chequeo que gatea es el chequeo final.» | `m-construccion.tsx:325-336` |
| Registro | **tres tildes**: «Marcar «CTA de WhatsApp» como hecha», «Marcar «Calidad y motion» como hecha», «Marcar «Mobile» como hecha» (apagados en BRIEF) | `registro-fases.tsx:157-172` → `fase-auto-reporte.tsx:40-104` |
| Registro | «¿Algo no sale como la guía dice?» + «Me trabé — avisar a Franco» | montado en `m-construccion.tsx:352-358` |
| Layout (fijo) | «Construcción — navegación libre» · «Las fases son auto-reporte: entrá y salí en el orden que te sirva — ninguna bloquea a otra.» | `pantalla-manual.tsx:240-242` → `manual-nav.tsx:190-249` |

**Copiables: 4** (el bloque y tres prompts) — igual que `censo.copiar` del pliegue; ninguno trae INSTRUCCIONES ni PISO. La captura entera mide 2.259 px de alto a 1440 y 2.840 a 390.

**Lo primero que se puede tocar en mc2, a los dos anchos, es «Copiar bloque» del bloque de arriba** — el que el documento quiere de solo lectura. Medido en esta corrida con el instrumento del pliegue, sobre su lead (QA-W Brief): primer accionable «Copiar bloque» a 413 px en 1440 y 488 en 390, con el pliegue efectivo en 731 y 631; el primer tilde, a 1545 y 1943, fuera del primer pliegue. La captura `mc2-construccion-390-pliegue.png` (QA-W Construccion) muestra lo mismo.

### 6.2 · Dónde viven los tres tildes

Un solo dueño del conjunto, `RegistroFases` (P25): `useState` + updater funcional + `useAutosave` con `delayMs: 0` → `guardarProgreso(leadId, { completadas })` → escribe `progresoJson` entero, solo en CONSTRUCCION. mc2 queda completa cuando `cta`, `calidad` y `mobile` lo están (`manual.ts:478-482`); el paso destacado es la pantalla de la primera fase sin tildar (`manual.ts:603-605`, `:626-627`).

### 6.3 · Qué consume el bloque de arriba, y quién más lo usa

`ConstruccionContexto` → `buildConstruccionBlock(lead, brief, ficha)` (`copy-blocks.ts:184`). Lo usan:

| Consumidor | Dónde |
|---|---|
| mc2 «Refinar» | `page.tsx:308` |
| mr «Correcciones» | `page.tsx:335` — el mismo componente |
| mc1 «Construir», envuelto como capa 2 | `bloque-construccion.ts:192` |
| pruebas | `campo-sin-herramienta.spec.ts:110,116,127` · `brief-cuatro-vueltas.spec.ts:169-228` · `bloque-construccion.spec.ts:141,301` |
| instrumentos | `p40-bloque-golden.mts:81` · `p42-tamano-bloque.mts` |

Y los prompts de la munición: `PROMPTS_DISENIO` lo lee mc2 (`promptsParaFase`) **y el chequeo final** (`promptParaHardCheck`, `chequeo-form.tsx:84`).

---

## 7 · La verificación adversarial, y qué corrigió

Un subagente de solo lectura intentó refutar la frenada: cada divergencia, la del prompt 1, la de la llave, unas 150 citas de este reporte y el instrumento. Todo lo que marcó lo verifiqué contra los archivos antes de aceptarlo. **La frenada queda en pie por la primera condición**, con estas correcciones sobre la primera versión:

| Qué decía la primera versión | Qué quedó | Por qué |
|---|---|---|
| **Siete** divergencias cambian qué demo sale | **tres** (D1, D5, D6); D2, D3, D4 y D7, más débiles | §2.3 |
| D7: el construido «mueve el motion a la construcción» y contradice `decisiones-por-pantalla.md:114-117` | D7 más débil: el escrito también deja animar en la construcción | esas líneas marcan la frontera entre mc2 y la pasada de Franco, no entre mc1 y mc2 |
| El orden 2 → 3 no se sostiene con el piso construido | se sostiene con los dos | ídem |
| Frenada 2 como segunda razón de la frenada | coincide al pie de la letra, pero sola no frena | choque de diseño (`decisiones-por-pantalla.md:8`, `:98`); la opción (c) conserva el propósito; «manda la decisión» no protege textos |
| D5: «las imágenes se arrastran al chat del Gem, no a Claude Design» y «sin medir, S-12 y S-24» | cita literal de `:371` («no a LeadOS»); ningún supuesto registrado cubre que Claude Design baje fotos | S-12 es el setter juntando material; S-24, el Gem leyendo imágenes |
| — | agregado: P42 convirtió «Insertalas donde Claude Design puso imágenes genéricas» en una prohibición y ningún prompt de mc2 lo repone | es lo que vuelve decisiva a D5 |
| Ocho contradicciones de prompts | once (§5.3): suman RITMO contra márgenes iguales, «si es formal, es formal» contra el voseo, «sacá todo…» contra «sin cambiar el contenido»; «del documento» pasó a ser una palabra, no un error | |
| Citas `:175-176`, `:190`; §1f «fija D5» | `:174-175`, `:189-190`; §1f fija la prohibición de D5 (`:206`), no la sección sin foto | |
| — | agregados a §5.1: la salida «Volvé a Construir» y el riesgo de exportar antes del último prompt (G3) | |
| — | agregados a §5.5: los costos que no tocan la llave (nombre del tilde, textos de mc1 en piezas compartidas, pruebas de P42 sobre los tres tildes de mc2) | |
| Instrumento: `guiaHerramienta` | salía `null` en las cuatro lecturas (el selector no existía en `ToolGuide`); corregido | |
| «mc2 copia sin INSTRUCCIONES ni PISO» | medido, no deducido: el instrumento ahora lo lee de cada copiable | segunda corrida del censo con el mismo build, base sin delta antes y después |

---

## 8 · Lo que no se hizo, y cómo queda todo

**No hecho:** los cinco prompts adaptados (paso 2), la pantalla (paso 3), la verificación operando la app sobre la pantalla nueva (paso 4) y sus pruebas. Todo depende de las decisiones de §9.

**Creado:** `scripts/p43-censo-refinar.mts` (instrumento de solo lectura) · `docs/p43-refinar/` (este reporte, `capturas/antes/`, `mediciones/`) · una entrada en `docs/bitacora-beta-3.md`. **Ningún archivo de producto ni de pruebas.**

| Confirmación | |
|---|---|
| La llave del progreso | serializada al cierre: md5 **`9968d31050b38c8120dc22add52ec566`**, idéntico a la Fase 0 y a P42; `contracts.ts` con **diff vacío** contra la copia de la Fase 0 |
| `tsc` · invariantes al cierre | exit **0** · **57/57**, corridos después del último cambio del instrumento |
| Base | **delta cero** en todas las fotos |
| Servidores propios | dos arranques del mismo build en 3003, los dos bajados por PID (72680 y 13644), verificado antes que eran `next start -p 3003`; puerto libre; ningún proceso propio vivo |
| `tsconfig.json` · `next-env.d.ts` | md5 iguales a la Fase 0 (`next-env.d.ts` lo reescribió el build; restaurado al contenido original y verificado por md5) |
| WIP ajeno | **402 de 402 idénticos** por md5 a la copia de la Fase 0; nuevos, solo los de este sprint y, después de esa comparación, la entrada de la bitácora |
| Git | nada agregado, nada commiteado, nada pusheado |

---

## 9 · Para decidir (Franco)

### 9.1 · Qué piso queda

Una decisión por fila. «Contradice algo decidido» es un dato, no una elección: si cambiaste de idea, vale el construido.

| | Divergencia | Si queda el escrito | Si queda el construido | Lo que ya está decidido por escrito |
|---|---|---|---|---|
| **D1** | Qué manda en cada sección | lo decide el documento (lista, fotos o título) | manda el título, siempre | — |
| **D5** | Sin fotos reales | otra imagen que no sea de banco | sección sin imagen — y hay que decidir si mc2 suma un paso para insertar las fotos reales, que P42 sacó | — |
| **D6** | El menú | siempre hay menú | puede no haber | **contradice** el brief v4 §5 (DECIDIDO) y el prompt base del mismo bloque |
| D2 | Cuerpo a la izquierda | secciones centradas, sí | cuerpo siempre a la izquierda | — |
| D3 | Sacar contenido para conservar el aire | desempate | orden | — |
| D4 | Columna de 1200 px | sin tope | tope para el contenido (los fondos pueden ir a ancho completo) | — |
| D7 | Movimiento | nada que maree o tarde | solo entradas < 0,5 s; el prompt 3 pierde las transiciones de estado y el desplazamiento suave, o el piso los admite | — |
| D8–D12 | Números y criterios menores (§2.4) | sin número | con número | — |

**Qué arrastra cada camino:** quedarse con el construido no toca código hoy, pero obliga a adaptar los prompts 2, 3, 4 y 5 a sus límites (§3). Volver al escrito, o mezclar por fila, es cambiar la capa 3 de «Construir» (`prompt-construccion.ts:101-171`) y las pruebas de P42 que fijan esas frases a propósito (`bloque-construccion.spec.ts`: §1e fija la de D1, `:217`; §1f la prohibición de D5, `:206`, y la línea de D10, `:197-199`): un sprint chico, anterior a mc2.

### 9.2 · Qué textos mandan después de construir

| Opción | Qué hace el prompt 1 |
|---|---|
| a · la del fuente | reescribe todo menos el botón, aunque el documento haya dictado los textos |
| b · manda el documento | no toca lo que el documento dictó (la primera pantalla y los textos de cada sección); reescribe lo que la herramienta puso sola. Con los briefs viejos, sin documento, reescribe todo |
| c · intermedio | reescribe para que suene al negocio, pero deja exactos el título y la línea de la primera pantalla, como el botón |

Y la misma pregunta para el prompt 2: ¿su libertad alcanza a la «DIRECCIÓN VISUAL» y a «LO QUE NO VA» del documento, o las protege como protege paleta y tipografía?

### 9.3 · Lo que queda listo para cuando decidas

- El censo de la pantalla (§6) y las capturas del antes.
- Las once contradicciones que se corrigen con cualquier piso (§5.3).
- Lo que el documento no contempla y el sprint va a tener que resolver (§5.1): los nueve puntos, la guía de Claude Design compartida, el prompt de celular del chequeo final, los tres arreglos que nombran fases, la bajada, el riesgo de exportar antes del último prompt.
- Los costos del tilde único que no tocan la llave (§5.5).
- Los dos rojos de la suite, caracterizados y ajenos (§0.1).
