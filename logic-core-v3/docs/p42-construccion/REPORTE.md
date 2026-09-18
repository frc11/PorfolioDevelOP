# P42 · «Construir» en un paso — el bloque de tres capas, el piso de calidad y un tilde

2026-09-15. Rama `p25/rafaga-tildes`, HEAD `4f8c00a2` (sin commitear, igual que P29–P41). Nada pusheado, nada agregado a git.

Base: la branch Neon de desarrollo (`ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech`). Además de las suites, escriben en la base solo los instrumentos que siembran (capturas, sonda) y las pruebas nuevas; todos borran por id lo suyo con el registro de siembra de P39 activado, y todos se midieron con la foto de 63 tablas antes y después.

---

## 0 · Terreno

| | |
|---|---|
| Git | HEAD `4f8c00a2` · `main` = `origin/main` = `57c421bc` · 28 worktrees y 2 stashes, no tocados |
| WIP ajeno | 306 archivos modificados/no rastreados copiados con md5 en `C:\tmp\p42-construccion\wip-copia` (manifiesto `wip-manifiesto.json`) |
| Procesos | 9 `node` ajenos, los de `chrome-devtools-mcp` (PIDs 53580, 36264, 44212, 59768, 75932, 55492, 29488, 44572, 66264); ningún servidor en 3000–3005 |
| Disco | 30,3 GiB libres al arrancar |
| `tsc` | exit **0** |
| Invariantes | **57/57** (58 descubiertos, 1 excluido) |
| Suites | `test:leados` **99/99** · `test:helpers` **28/28** · `test:setter` **201/202** en frío: el rojo es `01-flow` B3, uno de los cuatro que el archivo marca como flake de servidor frío («la acción persiste y el cartel no se monta»). **Repetido en caliente: 3 de 3 verdes** |
| Base | 105 `OsLead` · 21 `User` · 6 `OsSetterNotice` · 63 tablas; **sin delta** antes → leados → helpers → setter → B3 → mediciones |
| Mediciones fijas | franja **224/224** · pliegue **1062/1062** contra las líneas de base de P40 |
| La llave del progreso, serializada | `scripts/p42-llave-progreso.mts` → `llave-f0.json`, md5 `9968d31050b38c8120dc22add52ec566` |
| Build de partida | `.next-perf-base` (ignorado por `.git/info/exclude` y ya en el `include` de `tsconfig.json`), en 3003: Fase 0, capturas del antes y las pruebas nuevas contra la partida |

---

## 1 · Paso 1 — el censo del bloque, antes de rearmarlo

Referencias contra el código de partida: `git show HEAD` para lo commiteado, la copia md5 de la Fase 0 para el WIP.

### 1.1 · Qué secciones lleva hoy el bloque, en orden, y de dónde sale cada una

El bloque es `buildConstruccionBlock(lead, brief, ficha)` (`copy-blocks.ts:184-284`). Toda sección vacía se omite (`seccion`, `:27-31`), salvo el faltante del Gem.

| # | Sección (título literal) | Sale de | copy-blocks.ts |
|---|---|---|---|
| 1 | `BRIEF DE DEMO — {nombre}` | `lead.businessName` | :215 |
| 2 | `Rubro: … · Zona: …` | `lead.industry`, `lead.zone` | :216-221 |
| 3 | `CONCEPTO` | `brief.concepto` (lo completa `ANGULO`) | :222 |
| 4 | `SECCIONES (en este orden)` | `brief.secciones` (`SECCIONES`) | :223-225 |
| 5 | `LLAMADO A LA ACCIÓN` | `brief.cta` (`CTA`) | :226 |
| 6 | `TONO (así escriben los textos de la demo)` | `brief.tono` (`TONO`) | :230 |
| 7 | `PALETA (usá estos colores y ningún otro; …)` | `brief.paleta` (`PALETA`) | :231 |
| 8 | `TIPOGRAFÍA (usá estas fuentes, nunca la del sistema)` | `brief.tipografia` (`TIPOGRAFIA`) | :232 |
| 9 | `NOTAS DE MARCA` | `brief.notasMarca` | :233 |
| 10 | `RESEÑAS REALES (usalas textuales como prueba social)` | `ficha.resenas` + `materiales.resenasUrl` | :207-212, :234 |
| 11 | `CONTENIDO Y TONO REAL (logo / fotos / estilo)` | `ficha.contenidoReal` | :235 |
| 12 | `QUÉ VENDE Y A QUÉ PRECIO (…no inventes)` | `materiales.queVende` | :238 |
| 13 | `CÓMO HABLA EL NEGOCIO DE SÍ MISMO (…)` | `materiales.comoSePresenta` | :239-242 |
| 14 | `SEÑALES OPERATIVAS (horarios, delivery, turnos — …)` | `ficha.senalesOperativas` | :251-254 |
| 15 | `DE DÓNDE BAJAR EL LOGO Y LAS FOTOS REALES` | `materiales.imagenesUrl`, `lead.instagramUrl`, `googleMapsUrl`, `currentWebUrl`, `materiales.otraRedUrl` | :194-202, :255 |
| 16 | `BRIEF COMPLETO DEL GEM DE DISEÑO` | `brief.documento` (vuelta 4, tal cual) → si no, `brief.pegadoGem` → si no y el Gem no tiene link, el faltante de `GUIA_BRIEF` | :269-274 |
| 17 | `CORRECCIONES DEL SETTER AL DOCUMENTO (mandan sobre …)` | `vueltas.huecos.correccion`, solo con documento | :277-280 |

### 1.2 · Quién más lo consume, además de «Construir»

| Consumidor | Dónde | Qué recibe |
|---|---|---|
| mc1 «Construir» | `page.tsx:280-303` (rama `esConstruccion`) → `ConstruccionContexto` (`m-construccion.tsx:54-79`) → `CopyBlock` | el bloque, plegado |
| **mc2 «Refinar»** | la MISMA rama de `page.tsx:280-303` | el mismo bloque, plegado |
| **mr «Correcciones»** | `page.tsx:304-320` → `ConstruccionContexto` | el mismo bloque, plegado |
| `tests/leados/campo-sin-herramienta.spec.ts` | :110, :116, :127 | el builder puro |
| `tests/leados/brief-cuatro-vueltas.spec.ts` | §2a-2f (:169-228) | el builder puro |
| `scripts/p40-bloque-golden.mts` | :81 | el builder puro, contra la base |

Nadie más en `src/`: ni la revisión de Franco (`BriefPanel`) ni «El brief pedía» de m13/m14 (`BriefResumen`), que leen los campos del brief.

**Consecuencia para el diseño:** el builder tiene otros dos consumidores de producto, y uno es la pantalla que este sprint no toca. **No se lo modificó**: el bloque de tres capas lo envuelve.

### 1.3 · Cuánto mide hoy, en caracteres

`scripts/p42-tamano-bloque.mts` (solo lectura), con la misma función y los mismos datos que la pantalla.

| Escenario | Bloque de hoy |
|---|---|
| Los **49 briefs de la base** (29 con el pegado viejo del Gem, 20 sin nada; **ninguno con documento**) | mín 529 · **mediana 543** · p90 1.135 · máx 2.270 caracteres |
| Documento de ejemplo del contrato (780 palabras) con ficha completa | **6.236** caracteres · 1.111 palabras |
| Documento llevado al tope del contrato del Gem (1.200 palabras) | **8.551** caracteres · 1.531 palabras |
| Documento en su techo de validación (15.000) | 16.961 caracteres |
| Techo teórico (todo campo en su tope, 12 secciones) | 79.018 caracteres |

### 1.4 · Qué instrucciones muestra la pantalla, y cuáles viajan dentro del bloque

Inventario de «Construir» en la partida (capturas `antes/`; lo leído del DOM en `antes/hallazgos.json`):

| Superficie | Texto | Destino |
|---|---|---|
| Instrucción | «Construí la demo en Claude Design» / «Con el brief y los materiales del negocio a la vista, armá la demo.» | título igual; la bajada cambia |
| Contexto del lead | «Bloque para Claude Design» / «El brief + los materiales reales, listos para pegar como primer mensaje.» + botón + plegable «Ver el texto que vas a copiar (108 líneas)» — abierto, 224 px con scroll propio | la zona se va; el bloque pasa al bloque de trabajo, entero |
| Munición | badge «Guía preliminar — en validación» | se va |
| Munición | «Estructura», «Personalización con datos del negocio», «Assets reales» + **nueve puntos** | se van (tabla de abajo) |
| Munición | guía «Claude Design» (Link pendiente + «pedíselo a Franco») | queda, pegada al botón de copiar |
| Registro | «Es auto-reporte: tildar no bloquea nada ni te hace avanzar — hacé las fases en el orden que te sirva. El único chequeo que gatea es el chequeo final.» | reescrita para un tilde, con el mismo enlace |
| Registro | tres tildes («Estructura / Marcá esta fase cuando la termines», ×3) | un tilde |
| Registro | «¿Algo no sale como la guía dice?» + «Me trabé — avisar a Franco» | queda |

**Los nueve puntos, uno por uno, y dónde viajan ahora.** El censo encontró que **dos no viajaban**: «No agregues secciones que el brief no pide» y «Nombre, rubro y zona reales en el hero y el pie» no estaban dichos en ninguna capa. Se agregaron (una frase en el prompt base, una línea en el piso) y la prueba `bloque-construccion` 1f fija los nueve, con un brief nuevo y con uno viejo.

| # | Punto que mostraba la pantalla (`SHELL_CONSTRUCCION`) | Dónde viaja ahora |
|---|---|---|
| 1 | Copiá el bloque «para Claude Design» y pegalo ahí como primer mensaje. | No es instrucción para la herramienta: es la acción del paso. La dice la pantalla — la bajada («Pegale el bloque entero y esperá…») y el encabezado del bloque («Pegalo entero como primer mensaje de un proyecto nuevo…») |
| 2 | Pedile una landing de una sola página con las secciones del brief, en ese orden. | Capa 1: «Construí una página web de una sola página (one-page) siguiendo el documento…» y «Construí las secciones que pide el documento, en ese orden…». Capa 2: `SECCIONES (en este orden)` |
| 3 | No agregues secciones que el brief no pide — el brief es el plano. | Capa 1: «…en ese orden, y ninguna más.» (**agregada**) |
| 4 | Nombre, rubro y zona reales en el hero y el pie. | Capa 2: `BRIEF DE DEMO — {nombre}` y `Rubro · Zona`. Piso, CONTENIDO: «El nombre del negocio va en la primera pantalla y en el pie, con su rubro y su zona.» (**agregada**) |
| 5 | Usá frases de las reseñas reales como prueba social (las tenés en la ficha). | Capa 2: `RESEÑAS REALES (usalas textuales como prueba social)`. Piso, CONTENIDO: «frases de sus reseñas reales» |
| 6 | Horarios, dirección y servicios tal como los publica el negocio. | Capa 2: `SEÑALES OPERATIVAS (…reflejalos en la demo)`, `QUÉ VENDE Y A QUÉ PRECIO (usá estos datos reales, no inventes)`, Google Maps. Capa 1: «No inventes datos… Un precio, un horario o una reseña inventada…» |
| 7 | Bajá el logo y 3–5 fotos del Instagram o Google Maps del negocio. | Capa 2: `DE DÓNDE BAJAR EL LOGO Y LAS FOTOS REALES`. Piso, IMÁGENES: «Primero las fotos reales del negocio, de las direcciones que trae el documento.»; si no puede usarlas, sin foto y declarado |
| 8 | Insertalas donde Claude Design puso imágenes genéricas o de stock. | Piso, IMÁGENES: «Nunca fotos de banco, ilustraciones genéricas ni imágenes generadas.» |
| 9 | Si el negocio no tiene logo, usá el nombre tipografiado — nunca un logo inventado. | Piso, IMÁGENES: «Si el negocio no tiene logo, va el nombre del negocio escrito con la fuente de los títulos. Nunca un logo inventado.» |

### 1.5 · Dónde vivían los tres tildes y qué marcaba cada uno

`ConstruccionRegistro` (`m-construccion.tsx:250-330`) → `RegistroFases` (`registro-fases.tsx`, el dueño del conjunto desde P25: `useState` + updater funcional + `useAutosave` con `delayMs: 0` → `guardarProgreso(leadId, { completadas })` → `saveOwnedProgreso`, que escribe `progresoJson` entero, solo en CONSTRUCCION) → tres `FaseAutoReporte` (`fase-auto-reporte.tsx`), uno por fase:

| Tilde | Marca | Nombre accesible |
|---|---|---|
| «Estructura» | `estructura` | «Marcar «Estructura» como hecha» |
| «Personalización con datos del negocio» | `personalizacion` | «Marcar «Personalización con datos del negocio» como hecha» |
| «Assets reales» | `assets` | «Marcar «Assets reales» como hecha» |

La derivación da «Construir» por completa cuando las tres lo están (`manual.ts:475-479`), y el paso destacado es la pantalla de la primera fase sin tildar (`:600`). **Medido que el tilde único es gratis**: en la base hay 15 `progresoJson`; 13 tienen las tres de «Construir» o ninguna; uno solo está a medias (`["estructura"]`).

---

## 2 · Paso 2 — las tres capas

| Capa | Rótulo adentro del texto | De dónde sale | |
|---|---|---|---|
| 1 · El prompt base | `═══ 1 de 3 · INSTRUCCIONES ═══` | `PROMPT_BASE` (`src/lib/leados/prompt-construccion.ts`): el texto cerrado de mc1 (`docs/decisiones-oslead-vii/decisiones-por-pantalla.md`) con cinco ajustes declarados | **fija** |
| 2 · El documento de construcción | `═══ 2 de 3 · EL DOCUMENTO ═══` | `buildConstruccionBlock` **entero, sin tocar** (el documento de la vuelta 4 viaja adentro tal cual), con un `AVISO SOBRE ESTE DOCUMENTO` adelante solo si al documento le falta algo | **variable** |
| 3 · El piso de calidad | `═══ 3 de 3 · PISO DE CALIDAD ═══` | `PISO_DE_CALIDAD` (`prompt-construccion.ts`) | **fija** |

Lo arma `armarBloqueConstruccion` (`src/lib/leados/bloque-construccion.ts`): el `texto` que se copia (las tres capas separadas por una línea en blanco), las `capas`, el estado del documento, las decisiones obligatorias que no están en ningún lado, y el aviso.

**Por qué la capa 2 es el bloque de siempre y no solo el documento del Gem.** Porque «lo que produjo el brief» es eso: las decisiones que el setter confirmó, el material real de la ficha y el documento de la vuelta 4. Los 49 briefs de la base no tienen documento y tienen que seguir armando su bloque. Y así «Refinar» y «Correcciones» siguen recibiendo exactamente lo mismo.

### 2.1 · Lo que tenía que quedar verdadero

| Requisito | Cómo | Dónde se prueba |
|---|---|---|
| Un solo botón de copiar, y lo que copia es lo que la pantalla muestra | un botón; copia `bloque.texto`; el `<pre>` dibuja esas capas con los mismos separadores | `33` A: portapapeles = texto del `<pre>` = `armarBloqueConstruccion`; capturas `despues/01-*` y `02-*` (`-copiado.png` y `-bloque-copiado.txt`) |
| Las tres capas en orden, con el documento en el medio | `capas` = [instrucciones, documento, piso] | `bloque-construccion` 1a, 1b · `33` A |
| Si el documento trae encabezado, sus campos viajan — tono, paleta y tipografía incluidos | dos veces: como decisiones del brief (el lector del encabezado las completó al pegar) y adentro del documento, tal cual | `bloque-construccion` 2a, y 2b aunque el brief no las tenga cargadas · `33` B |
| Si no trae encabezado, el bloque se arma igual y lo dice | aviso adentro de la capa 2 (para la herramienta) y aviso ámbar en la pantalla (para el setter): qué falta y, si la decisión no está en ningún lado, que la tome por el camino conservador y la declare | `bloque-construccion` 2c, 2d · `33` C · capturas `02`, `03`, `04` |
| Los briefs viejos no lo tienen | «Este brief no trae el documento de construcción del Gem de diseño…» | `bloque-construccion` 3a (cuatro formas de la base) |
| Legible entero en la pantalla, no solo copiable | `<pre>` sin tope de alto, sin plegable, sin scroll propio, en una columna de lectura | `33` A (`maxHeight: none`, fuera de `details`, `scrollHeight <= clientHeight`) · capturas `*-entera` |

### 2.2 · Los cuatro estados del documento

| Estado (lector del contrato de P40) | Aviso para la herramienta (capa 2) | Aviso para el setter |
|---|---|---|
| encabezado completo | ninguno | ninguno |
| encabezado incompleto (sin `PALETA`) | «Al encabezado del documento de construcción le falta la línea PALETA.» + si el brief la tiene: «La paleta está entre las decisiones que siguen: vale esa.»; si no: «Entre las decisiones no está la paleta: elegila por el camino más conservador, respetando el piso de calidad, y anotala al final, entre las decisiones que tomaste vos.» | «Al encabezado del documento le falta PALETA. El bloque va igual, y le avisa a Claude Design que decida solo la paleta.» |
| documento sin encabezado | «El documento de construcción del Gem de diseño no trae el encabezado de decisiones (las líneas SECCIONES, PALETA y TIPOGRAFIA del principio). Las decisiones que valen son las que siguen.» + lo que falte | «El documento del Gem no trae el encabezado de decisiones. El bloque va igual, entero, y le avisa a Claude Design que decida solo …» |
| sin documento (brief viejo) | «Este brief no trae el documento de construcción del Gem de diseño, con su encabezado de decisiones. Construí con las decisiones y el material que siguen.» + «Entre las decisiones no están la paleta y la tipografía: elegilas…» | «Este brief no trae el documento del Gem de diseño. El bloque se arma igual, con lo que guardaste en el brief, y le avisa a Claude Design que decida solo la paleta y la tipografía.» |

Nada de esto frena nada: el bloque se copia igual y el tilde se marca igual.

### 2.3 · Los ajustes al prompt base de Franco

1. «de una sola pantalla (one-page)» → «de una sola página (one-page)»: una herramienta puede leer «una sola pantalla» como «que entre en el alto de la ventana».
2. «el documento que va abajo» → «el documento que viene a continuación».
3. **Un párrafo nuevo**: el documento trae primero las decisiones confirmadas y, si la sección `BRIEF COMPLETO DEL GEM DE DISEÑO` dice otra cosa sobre una de ellas, manda la decisión. Sin esa regla las dos versiones viajan juntas (el setter puede corregir a mano un campo que el lector llenó) y la herramienta, que no puede preguntar, elegiría una.
4. Viñetas de la lista de cierre con guion simple.
5. **Una frase nueva**: «Construí las secciones que pide el documento, en ese orden, y ninguna más.» (el punto 3 del censo).

### 2.4 · El bloque nuevo, entero — el contrato con la herramienta

Es el bloque del documento de ejemplo del contrato (Barbería El Faro, con ficha completa), armado con `armarBloqueConstruccion`: la misma función que la pantalla, verificada idéntica al portapapeles en `33` A. **12.563 caracteres · 2.262 palabras · 12.971 bytes · 217 renglones.** Archivo: `docs/p42-construccion/bloque-ejemplo-con-encabezado.txt`. Lo copiado de verdad desde la pantalla, en `capturas/despues/01-con-encabezado-1440-bloque-copiado.txt` (misma forma, con los datos del lead sembrado).

````text
═══ 1 de 3 · INSTRUCCIONES ═══

Construí una página web de una sola página (one-page) siguiendo el documento que viene a continuación. El documento es la especificación completa: tiene todo lo que necesitás.

CÓMO TRABAJAR

Construí la página entera de una sola vez, completa y funcionando. No la armes por partes ni me vayas mostrando avances parciales.

Construí las secciones que pide el documento, en ese orden, y ninguna más.

No me hagas preguntas. Quien te está pegando esto no es diseñador ni programador y no va a poder contestarlas. Si algo del documento te queda ambiguo, tomá la decisión más conservadora, seguí adelante y anotala al final.

Todo va en una sola página. El menú lleva a secciones de esta misma página y funciona; nunca lleva a otra página.

No inventes datos. Si el documento no trae un dato, no lo completes: dejalo afuera y anotalo al final. Un precio, un horario o una reseña inventada es lo primero que el dueño detecta.

El documento trae primero las decisiones de la demo que ya se confirmaron (secciones, llamado a la acción, tono, paleta y tipografía) y después el material real del negocio. Si la sección BRIEF COMPLETO DEL GEM DE DISEÑO dice otra cosa sobre una de esas decisiones, manda la decisión.

Al final de este mensaje hay un PISO DE CALIDAD no negociable. Leelo antes de escribir una línea. Si algo del documento lo contradice, gana el piso.

CUANDO TERMINES

Devolveme, en una lista corta:
- Las secciones que construiste, en orden.
- Lo que el documento pedía y no pudiste hacer, con el motivo.
- Los datos que te faltaron.
- Las decisiones que tomaste vos porque el documento no las definía.

═══ 2 de 3 · EL DOCUMENTO ═══

BRIEF DE DEMO — Barbería El Faro

Rubro: Barbería · Zona: Yerba Buena, Tucumán

CONCEPTO
Turno sin esperar en la vereda: la agenda del día a la vista y el botón para reservar por WhatsApp.

SECCIONES (en este orden)
1. Hero
2. Cortes y precios
3. El local
4. Lo que dicen los clientes
5. Cómo llegar

LLAMADO A LA ACCIÓN
Reservá tu turno

TONO (así escriben los textos de la demo)
Cercano y de barrio, tuteo, frases cortas y directas, sin emojis de más.

PALETA (usá estos colores y ningún otro; el acento, solo en el botón principal)
neutro #F4EFE6 (arena) / acento #C2410C (naranja faro, solo en el botón) / apoyo #111111 (negro mate)

TIPOGRAFÍA (usá estas fuentes, nunca la del sistema)
títulos Bebas Neue / cuerpo Inter

RESEÑAS REALES (usalas textuales como prueba social)
★★★★★ "Marcos es un crack, te deja el corte como te gusta sin que se lo expliques dos veces." — Julián R.
★★★★★ "El mejor degradé de Yerba Buena. Lo único: reservá antes porque se llena." — Santiago M.
★★★★★ "Llevo a mi hijo desde los 4 años, ya es parte de la familia." — Pablo G.

Se leen acá: https://maps.google.com/?cid=123456789&reviews

CONTENIDO Y TONO REAL (logo / fotos / estilo)
Logo: faro blanco sobre negro. Fotos de cortes con luz cálida. Flyers de Canva.

QUÉ VENDE Y A QUÉ PRECIO (usá estos datos reales, no inventes)
Corte clásico $9.000 · Corte y barba $12.500 · Barba $5.000 · Corte infantil $7.000

CÓMO HABLA EL NEGOCIO DE SÍ MISMO (escribí los textos en ESTA voz, no en una genérica)
"Barbería de barrio desde 2016. Te conocemos por el nombre." (bio de Instagram)

SEÑALES OPERATIVAS (horarios, delivery, turnos — reflejalos en la demo)
Martes a sábados de 10 a 20 h. Turnos por WhatsApp. Promo 2x1 padre e hijo martes y miércoles.

DE DÓNDE BAJAR EL LOGO Y LAS FOTOS REALES
Logo y fotos: https://instagram.com/barberiaelfaro
Instagram: https://instagram.com/barberiaelfaro
Google Maps: https://maps.google.com/?cid=123456789

BRIEF COMPLETO DEL GEM DE DISEÑO
ANGULO: Turno sin esperar en la vereda: la agenda del día a la vista y el botón para reservar por WhatsApp.
SECCIONES: Hero · Cortes y precios · El local · Lo que dicen los clientes · Cómo llegar
CTA: Reservá tu turno
TONO: Cercano y de barrio, tuteo, frases cortas y directas, sin emojis de más.
PALETA: neutro #F4EFE6 (arena) / acento #C2410C (naranja faro, solo en el botón) / apoyo #111111 (negro mate)
TIPOGRAFIA: títulos Bebas Neue / cuerpo Inter

EL NEGOCIO
Barbería El Faro es una barbería de barrio en Yerba Buena, Tucumán, abierta desde 2016 por Marcos Díaz. Le corta el pelo a hombres de 25 a 60 años del barrio y a sus hijos: el 2x1 de padre e hijo de martes y miércoles es su promo más conocida. Lo que la hace distinta es el oficio y el trato: los clientes vuelven porque Marcos se acuerda de cómo les gusta el corte. El problema que se repite en las reseñas es otro: "venís y está lleno, esperás media hora en la vereda".

CONTACTO REAL
El botón principal lleva a WhatsApp: https://wa.me/5493815550000?text=Hola%20Marcos%2C%20quiero%20reservar%20un%20turno
El número es el que figura en el Instagram del negocio. No hay formulario ni sistema de reservas: el turno se confirma por WhatsApp.

LO PRIMERO QUE SE VE
En la primera pantalla de un celular, sin scrollear:
- Título: "Tu corte, sin esperar en la vereda."
- La línea que va debajo del título: "Reservá por WhatsApp y te esperamos con el sillón libre."
- El botón "Reservá tu turno", grande, en naranja faro.
- De fondo, la foto real de la vidriera con el faro pintado, oscurecida para que el texto se lea.

SECCIÓN POR SECCIÓN

1. Hero
Muestra la vidriera real y el título. Texto: "Tu corte, sin esperar en la vereda." / "Reservá por WhatsApp y te esperamos con el sillón libre." Imagen: la foto de la vidriera del perfil de Instagram (publicación del 12 de marzo). Tiene que sentir: "esta es mi barbería, pero más fácil".

2. Cortes y precios
Muestra los seis servicios con su precio real, en dos columnas en escritorio y una en celular.
- Corte clásico — $9.000
- Corte y barba — $12.500
- Barba — $5.000
- Corte infantil — $7.000
- Padre e hijo (martes y miércoles) — $14.000
- Diseño con navaja — $3.000 extra
Texto de apertura: "Precios claros, sin sorpresas." Tiene que sentir que no hay letra chica.

3. El local
Muestra tres fotos reales: el sillón de cuero, la pared de madera con el faro y Marcos cortando. Texto: "Desde 2016 en la misma esquina de Yerba Buena. El mismo sillón, el mismo oficio." Tiene que sentir confianza de barrio.

4. Lo que dicen los clientes
Tres reseñas reales de Google, textuales, con nombre y estrellas:
- "Marcos es un crack, te deja el corte como te gusta sin que se lo expliques dos veces." — Julián R. ★★★★★
- "El mejor degradé de Yerba Buena. Lo único: reservá antes porque se llena." — Santiago M. ★★★★★
- "Llevo a mi hijo desde los 4 años, ya es parte de la familia." — Pablo G. ★★★★★
Tiene que sentir que otros como él ya confían.

5. Cómo llegar
Dirección, horario y el botón de WhatsApp repetido. Texto: "Av. Aconquija 1450, Yerba Buena. Martes a sábados de 10 a 20 h." Mapa: el link de Google Maps del negocio. Botón final: "Reservá tu turno".

DIRECCIÓN VISUAL
Fondo arena (#F4EFE6) en toda la página, con el hero y el pie en negro mate (#111111). El naranja faro (#C2410C) va solamente en los botones de reservar: en ningún título, ningún ícono, ningún borde. Títulos en Bebas Neue, grandes y en mayúsculas, como el cartel pintado de la vidriera. Todo el cuerpo en Inter, 16 px en celular, con buen interlineado. Mucho aire entre secciones. En cada sección manda una sola cosa: en precios, la lista; en el local, las fotos.

LO QUE NO VA
- Fotos de stock de barberías con tatuajes y barbas enormes: no es su cliente. Van las fotos reales del perfil.
- Barra de navegación con efecto vidrio: la barra es sólida, negra.
- Un logo inventado: el negocio tiene logo (el faro blanco) y se usa ese.
- "Contactanos" o "Más información": el botón dice "Reservá tu turno".

LO QUE SE DEJA AFUERA A PROPÓSITO
- No hay sistema de turnos online: el turno se confirma por WhatsApp, como hoy.
- No hay galería de treinta cortes: tres fotos del local alcanzan para la demo.
- No hay tienda: Marcos vende pomadas en el local, pero no es lo que la demo tiene que mostrar.

═══ 3 de 3 · PISO DE CALIDAD ═══

No negociable. Aplica siempre, aunque el documento no lo mencione, y si el documento dice otra cosa, gana esto.

IDIOMA
- Todo el texto en español rioplatense, con voseo: «reservá», «escribinos», «vení». Nada de «tú» ni de español neutro: es un negocio argentino y su cliente también.

JERARQUÍA
- En cada sección manda una sola cosa: un único elemento con el tamaño más grande, su título. Nada más de la sección llega a ese tamaño.
- El título de la primera pantalla es el texto más grande de toda la página.
- Tres tamaños de texto bien separados: título, subtítulo y cuerpo. El título mide por lo menos el doble que el cuerpo.
- El botón principal resalta del resto: es lo único que lleva el color de acento, también donde se repite.
- Nunca todo centrado y del mismo tamaño: el cuerpo de texto va alineado a la izquierda.

AIRE
- La misma separación vertical entre todas las secciones: por lo menos 80 px en computadora y 56 px en el celular.
- Márgenes laterales de por lo menos 24 px en el celular. En computadora, el contenido en una columna de 1200 px como máximo, centrada.
- Ningún texto, botón o imagen pegado al borde de la pantalla ni a otro elemento.
- Si algo no entra con ese aire, sacá contenido: no achiques los espacios.

TIPOGRAFÍA
- Dos familias como máximo: una con carácter para los títulos y una neutra y legible para el cuerpo. Si el documento las nombra, usá esas.
- Cargalas de verdad (por ejemplo, desde Google Fonts). Nunca la fuente por defecto del sistema: si una fuente no carga, elegí otra que sí.
- Cuerpo de 16 px como mínimo, con interlineado de 1,5 y renglones de 75 caracteres como máximo.

COLOR
- Tres colores como máximo: un neutro dominante para los fondos, un acento y un apoyo. Si el documento trae la paleta, usá esos colores y ningún otro.
- El acento va solo en el botón principal y en sus repeticiones.
- Contraste alto entre texto y fondo: 4,5 a 1 como mínimo en el cuerpo. Nunca gris claro sobre blanco.

ALINEACIÓN Y CONSISTENCIA
- Todo alineado a una misma grilla, con los mismos márgenes en todas las secciones.
- Todos los botones con el mismo estilo, el mismo radio de esquina y la misma altura.

IMÁGENES
- Primero las fotos reales del negocio, de las direcciones que trae el documento. Nunca fotos de banco, ilustraciones genéricas ni imágenes generadas.
- Si no podés usar las fotos reales, no pongas otras: armá la sección sin foto y anotalo entre los datos que te faltaron.
- Nunca deformes ni estires una imagen: recortala manteniendo la proporción.
- Si el negocio no tiene logo, va el nombre del negocio escrito con la fuente de los títulos. Nunca un logo inventado.

CONTENIDO
- El nombre del negocio va en la primera pantalla y en el pie, con su rubro y su zona.
- Todo el texto habla de este negocio: su nombre, lo que vende, sus precios si están, frases de sus reseñas reales.
- Cero texto de relleno, cero lorem ipsum, cero frases que le servirían igual a cualquier otro negocio del rubro.

BOTÓN PRINCIPAL
- El texto nombra la acción y lo que la persona consigue: «Reservá tu turno», «Pedí tu presupuesto». Si el documento trae el texto del botón, usá ese.
- Nunca «Contactanos», «Más información», «Enviar» ni «Click acá».
- Visible sin bajar, en el celular y en la computadora, y repetido al final de la página.
- Si el documento trae el link de WhatsApp, el botón lo abre. Si no lo trae, no inventes un número: dejá el botón sin link y anotalo entre los datos que te faltaron.

MENÚ
- Si hay menú, cada link lleva a una sección de esta misma página, y esa sección existe. Ninguno lleva a otra página, a un «#» vacío ni a una dirección inventada.
- Tocar un link lleva a su sección; en el celular, además, cierra el menú.
- Sólido: sin efecto vidrio ni desenfoque detrás.
- Un menú que no funciona es lo primero que delata que la página salió de un prompt. Si la página no lo necesita, mejor sin menú.

CELULAR
- Diseñala primero para un celular de 390 px de ancho: nada cortado, nada que se salga de costado, textos legibles sin agrandar.
- El botón principal, alcanzable con el pulgar.

MOVIMIENTO
- Solo animaciones sutiles de entrada, de menos de medio segundo. Nada que maree, parpadee o haga esperar para leer.

PROHIBIDO — lo que delata que salió de un prompt
- Efecto vidrio o desenfoque en la barra de navegación.
- Sombras, degradados y brillos repartidos por toda la página.
- Todo centrado y del mismo tamaño.
- Más de dos fuentes, o la fuente por defecto del sistema.
- Cuatro o más colores fuertes.
- Imágenes pixeladas, deformadas o de banco.
- Muros de texto sin aire ni jerarquía.
- Un menú con links que no llevan a ningún lado.
````

Con un brief viejo, las capas 1 y 3 son las mismas y la capa 2 arranca así (`docs/p42-construccion/bloque-ejemplo-brief-viejo.txt`, 7.326 bytes):

````text
═══ 2 de 3 · EL DOCUMENTO ═══

AVISO SOBRE ESTE DOCUMENTO
Este brief no trae el documento de construcción del Gem de diseño, con su encabezado de decisiones. Construí con las decisiones y el material que siguen.
Entre las decisiones no están la paleta y la tipografía: elegilas por el camino más conservador, respetando el piso de calidad, y anotalas al final, entre las decisiones que tomaste vos.

BRIEF DE DEMO — Negocio viejo

Rubro: Barbería · Zona: Yerba Buena, Tucumán

CONCEPTO
One-page mobile-first con CTA de WhatsApp

SECCIONES (en este orden)
1. Hero
2. Servicios
3. Reseñas
4. Contacto

DE DÓNDE BAJAR EL LOGO Y LAS FOTOS REALES
Instagram: https://instagram.com/barberiaelfaro
Google Maps: https://maps.google.com/?cid=123456789

BRIEF COMPLETO DEL GEM DE DISEÑO
Respuesta cruda del Gem de diseño (seed).
````

---

## 3 · Paso 3 — el piso de calidad, entero

Lo inyecta el producto, no el setter. Sale del piso anti-slop del paquete del Gem de diseño (`docs/decisiones-oslead-vii/gem-de-diseno-paquete.md` §6, que traduce el módulo «Ojo de diseño») y del criterio de rechazo que el chequeo final ya aplica (`HARD_CHECKS`/`SOFT_CHECKS`): jerarquía, aire, tipografía con carácter, tres colores como máximo, el botón que invita y que no se note que salió de un prompt. Más la regla propia del sprint —el menú funciona y lleva a secciones de la misma página— y la línea del nombre del negocio que venía de los nueve puntos.

Escrito como instrucciones para la herramienta: «un único elemento con el tamaño más grande» en vez de «que tenga jerarquía»; «por lo menos 80 px» en vez de «espacio generoso»; «cargalas de verdad… si una fuente no carga, elegí otra» en vez de «tipografía con carácter». Siempre como piso: mínimos y máximos, nunca un estilo — el estilo lo pone el documento.

````text
No negociable. Aplica siempre, aunque el documento no lo mencione, y si el documento dice otra cosa, gana esto.

IDIOMA
- Todo el texto en español rioplatense, con voseo: «reservá», «escribinos», «vení». Nada de «tú» ni de español neutro: es un negocio argentino y su cliente también.

JERARQUÍA
- En cada sección manda una sola cosa: un único elemento con el tamaño más grande, su título. Nada más de la sección llega a ese tamaño.
- El título de la primera pantalla es el texto más grande de toda la página.
- Tres tamaños de texto bien separados: título, subtítulo y cuerpo. El título mide por lo menos el doble que el cuerpo.
- El botón principal resalta del resto: es lo único que lleva el color de acento, también donde se repite.
- Nunca todo centrado y del mismo tamaño: el cuerpo de texto va alineado a la izquierda.

AIRE
- La misma separación vertical entre todas las secciones: por lo menos 80 px en computadora y 56 px en el celular.
- Márgenes laterales de por lo menos 24 px en el celular. En computadora, el contenido en una columna de 1200 px como máximo, centrada.
- Ningún texto, botón o imagen pegado al borde de la pantalla ni a otro elemento.
- Si algo no entra con ese aire, sacá contenido: no achiques los espacios.

TIPOGRAFÍA
- Dos familias como máximo: una con carácter para los títulos y una neutra y legible para el cuerpo. Si el documento las nombra, usá esas.
- Cargalas de verdad (por ejemplo, desde Google Fonts). Nunca la fuente por defecto del sistema: si una fuente no carga, elegí otra que sí.
- Cuerpo de 16 px como mínimo, con interlineado de 1,5 y renglones de 75 caracteres como máximo.

COLOR
- Tres colores como máximo: un neutro dominante para los fondos, un acento y un apoyo. Si el documento trae la paleta, usá esos colores y ningún otro.
- El acento va solo en el botón principal y en sus repeticiones.
- Contraste alto entre texto y fondo: 4,5 a 1 como mínimo en el cuerpo. Nunca gris claro sobre blanco.

ALINEACIÓN Y CONSISTENCIA
- Todo alineado a una misma grilla, con los mismos márgenes en todas las secciones.
- Todos los botones con el mismo estilo, el mismo radio de esquina y la misma altura.

IMÁGENES
- Primero las fotos reales del negocio, de las direcciones que trae el documento. Nunca fotos de banco, ilustraciones genéricas ni imágenes generadas.
- Si no podés usar las fotos reales, no pongas otras: armá la sección sin foto y anotalo entre los datos que te faltaron.
- Nunca deformes ni estires una imagen: recortala manteniendo la proporción.
- Si el negocio no tiene logo, va el nombre del negocio escrito con la fuente de los títulos. Nunca un logo inventado.

CONTENIDO
- El nombre del negocio va en la primera pantalla y en el pie, con su rubro y su zona.
- Todo el texto habla de este negocio: su nombre, lo que vende, sus precios si están, frases de sus reseñas reales.
- Cero texto de relleno, cero lorem ipsum, cero frases que le servirían igual a cualquier otro negocio del rubro.

BOTÓN PRINCIPAL
- El texto nombra la acción y lo que la persona consigue: «Reservá tu turno», «Pedí tu presupuesto». Si el documento trae el texto del botón, usá ese.
- Nunca «Contactanos», «Más información», «Enviar» ni «Click acá».
- Visible sin bajar, en el celular y en la computadora, y repetido al final de la página.
- Si el documento trae el link de WhatsApp, el botón lo abre. Si no lo trae, no inventes un número: dejá el botón sin link y anotalo entre los datos que te faltaron.

MENÚ
- Si hay menú, cada link lleva a una sección de esta misma página, y esa sección existe. Ninguno lleva a otra página, a un «#» vacío ni a una dirección inventada.
- Tocar un link lleva a su sección; en el celular, además, cierra el menú.
- Sólido: sin efecto vidrio ni desenfoque detrás.
- Un menú que no funciona es lo primero que delata que la página salió de un prompt. Si la página no lo necesita, mejor sin menú.

CELULAR
- Diseñala primero para un celular de 390 px de ancho: nada cortado, nada que se salga de costado, textos legibles sin agrandar.
- El botón principal, alcanzable con el pulgar.

MOVIMIENTO
- Solo animaciones sutiles de entrada, de menos de medio segundo. Nada que maree, parpadee o haga esperar para leer.

PROHIBIDO — lo que delata que salió de un prompt
- Efecto vidrio o desenfoque en la barra de navegación.
- Sombras, degradados y brillos repartidos por toda la página.
- Todo centrado y del mismo tamaño.
- Más de dos fuentes, o la fuente por defecto del sistema.
- Cuatro o más colores fuertes.
- Imágenes pixeladas, deformadas o de banco.
- Muros de texto sin aire ni jerarquía.
- Un menú con links que no llevan a ningún lado.
````

**Una contradicción que encontró la revisión de código, corregida:** la primera versión decía en JERARQUÍA «El botón principal es el único elemento con el color de acento» y en COLOR «el acento va solo en el botón principal y en sus repeticiones», con el botón repetido al pie. Una herramienta que no puede preguntar tenía que elegir cuál obedecer. Ahora las dos dicen lo mismo, y `bloque-construccion` 1e lo fija (sabotaje S12).

---

## 4 · Paso 4 — la pantalla

### 4.1 · Lo que queda, en el orden en que se usa

Todo en el bloque de trabajo (la única tarjeta), en una columna de lectura:

1. **«Bloque para Claude Design»** — «Pegalo entero como primer mensaje de un proyecto nuevo y esperá a que termine. Son tres partes: las instrucciones, el documento de este negocio y el piso de calidad.» — y **un** botón «Copiar bloque».
2. **La herramienta** (`ToolGuide`, sin tocar): Claude Design · «Link pendiente» · «Todavía no tenés el link cargado — pedíselo a Franco y lo vas a poder abrir desde acá.»
3. **El aviso** del documento, si le falta algo (ámbar, `role="note"`).
4. **El bloque, entero**: monoespaciado, rótulos resaltados, la capa del medio más clara que las fijas.
5. **Qué esperar** — «Mientras trabaja: No le escribas ni le sumes pedidos: dejalo terminar. Arma la página entera de una vez.» · «Cuando termine: Te devuelve una lista: las secciones que construyó, lo que no pudo hacer, los datos que le faltaron y lo que decidió solo. Compará sus secciones con las que pediste:» + la lista del brief + «Si falta alguna, pedile esa sola, en un mensaje: si le pedís varios cambios juntos, hace algunos mal.»
6. **El tilde** y «Marcarla no bloquea nada ni te hace avanzar: lo único que frena el envío es el chequeo final» (enlazado a m14, o a m13 sin borrador).
7. «¿Algo no sale como la guía dice?» + «Me trabé — avisar a Franco».

La bajada de la instrucción: «Pegale el bloque entero y esperá a que termine: la demo sale de ahí, de una vez.»

### 4.2 · Por qué la herramienta va pegada al botón y no en su zona, medido

La primera versión dejó la guía en Munición (la convención) y el bloque en Registro. El instrumento del pliegue contra ese build (`mediciones/pliegue-herramienta-en-municion.json`):

| mc1 | Partida | Herramienta en Munición | **Final: herramienta pegada al botón** |
|---|---|---|---|
| primer accionable 1440 · 390 | 413 · 488 | 573 · **694** | **415 · 518** |
| primer control de trabajo 1440 · 390 | 1209 · 1452 | 573 · 694 | **415 · 518** |
| pliegue efectivo 1440 · 390 | 731 · 631 | 731 · 631 | 731 · 631 |
| ¿entra en el pliegue? 1440 · 390 | no · no | sí · **no** | **sí · sí** |

Con la guía en su zona, a 390 el botón de copiar arrancaba 63 px debajo del pliegue. Pegada al botón, copiar y «pedíselo a Franco» entran juntos y la pared del link se lee antes del texto largo.

### 4.3 · El tilde único

`TildeConstruccion` (presentación) adentro del MISMO dueño del progreso de P25 (`RegistroFases`, prop `tildeUnico`): mismo autoguardado con `delayMs: 0`, mismo updater funcional, mismo `<AutosaveStatus>`, misma action, mismo write. Un clic hace `alternarPantalla(actual, fases)` (`src/lib/leados/progreso-pantalla.ts`):

- marcado = las tres fases de «Construir» están, **el mismo criterio con el que la derivación da la pantalla por completa**; `bloque-construccion` 4a lo ata a `derivarPantalla` en los 64 subconjuntos;
- sin completar → suma las que faltan y conserva lo que había; completo → saca las tres;
- las fases de «Refinar» no se tocan (4b, 64 de 64; `33` E contra la base).

Nombre accesible fijo «La demo quedó construida» (`aria-labelledby`), el estado en `aria-pressed`, cuándo marcarlo en `aria-describedby`. Arriba y grande, lo que afirma; abajo y chico, cuándo marcarlo.

| Stage | El registro dice |
|---|---|
| BRIEF | «El brief está listo — arrancá la construcción para habilitar el registro del borrador. Marcar la demo como construida no la arranca sola.» · «El tilde se abre cuando arranques la construcción, con el botón «Arrancar construcción».» |
| CONSTRUCCION | el tilde vivo · «Marcarla no bloquea nada ni te hace avanzar…» |
| RECHAZADA | «El tilde se abre cuando reabrís la construcción — el botón «Reabrir construcción» está en Correcciones.» (enlazada) |

**Un límite, dicho:** un «Construir» a medias de antes (en la base hay uno) no se puede mostrar con un tilde. Se lee sin marcar —lo que la derivación ya decía: la pantalla no estaba completa— y abrir la pantalla no lo reescribe (`33` E lo relee de la base). Marcar suma las dos que faltan; recién marcar y desmarcar lo lleva a cero.

### 4.4 · Lo que se fue

| Qué | Dónde está ahora |
|---|---|
| Los nueve puntos | adentro del bloque (§1.4) |
| La zona «Contexto del lead» | no se monta: el bloque no es contexto, es la carga |
| La zona «Munición» | no se monta: la guía de la herramienta va pegada al botón |
| El badge «Guía preliminar — en validación» | no se monta en mc1 (sigue en mc2) |
| «Es auto-reporte: … hacé las fases en el orden que te sirva» | reescrita para un tilde |
| Los tres tildes con la jerarquía invertida | un tilde |
| «Ver el texto que vas a copiar (108 líneas)» con tope de 224 px | el bloque entero |

### 4.5 · Tocado fuera de mc1, y por qué

| Archivo | Qué | Por qué | Cómo se sabe que lo ajeno no cambió |
|---|---|---|---|
| `m-construccion.tsx` | prop opcional `tildeUnico` en `ConstruccionRegistro` y `MotivoDelTilde` (default `false`) | resuelve BRIEF/RECHAZADA/CONSTRUCCION para las dos pantallas: duplicarla era duplicar cuándo se puede marcar | revisión de código, carácter por carácter; pliegue de mc2 y mr **idéntico** a los dos anchos; `11`, `29` y `30` sobre mc2 |
| `registro-fases.tsx` | prop opcional `tildeUnico` y un callback | el dueño del progreso es uno solo (P25): un segundo componente con su propio autoguardado eran dos escritores | `acuse-recibo` verde; `29` verde; sabotaje E2 |
| `flow-content.ts` | los `items` de estructura, personalización y assets, vacíos (ids y títulos iguales); dos `arreglo` de `HARD_CHECKS` sin «, fase Personalización» / «, fase Assets reales» | nadie más mostraba esos nueve textos: dejarlos era contenido muerto que parece editable; los dos arreglos de m14 mandaban a una «fase» que la pantalla ya no muestra (el `arreglo` no se persiste; el `nombre`, la llave, no se tocó) | `git diff` sin ninguna línea de `id` ni de `nombre`; llave idéntica |
| `manual.ts` | solo `PANTALLAS.mc1.detalle` | «armá la demo con el brief a la vista» describía la construcción artesanal | llave idéntica; una línea + comentario |
| `[paso]/page.tsx` | la rama de mc1, anidada adentro de la de Construcción | mc1 deja de usar los slots de contexto y munición | mc2 y mr, misma rama y mismos slots; pliegue idéntico |

---

## 5 · Paso 5 — verificación operando la aplicación, a 1440 y 390

Instrumento: `scripts/p42-capturas.mts`, el mismo contra el build de partida (`CAPT_FASE=antes`) y contra el final (`CAPT_FASE=despues`). Siembra siete leads (uno por estado), los borra por id; base **sin delta** en cada corrida. Lo leído del DOM, en `capturas/{antes,despues}/hallazgos.json`.

| # | Verificación | Capturas | Lo leído de la pantalla (igual a 1440 y a 390 salvo alturas) |
|---|---|---|---|
| 1 | La pantalla antes y después | `antes/NN-*` · `despues/NN-*` (`-pliegue` y `-entera`) | antes: zonas Contexto + Munición + Registro, **3 tildes**, bloque **plegado** (224 px, scroll propio), **9 puntos** a la vista, badge · después: solo Registro, **1 tilde**, bloque **abierto y entero** (sin scroll propio), **0 puntos**, sin badge |
| 2 | El bloque copiable, entero, con las tres capas y su tamaño | `despues/01-*-copiado.png`, `01-*-bloque-copiado.txt`, `02-*` | **un** botón de copiar; portapapeles **= pantalla = producto** (los dos anchos, los dos briefs); rótulos en orden (posiciones 0 · 1.643 · 7.503); 12.154 caracteres con el lead sembrado |
| 3 | Brief con encabezado: los campos nuevos adentro | `despues/01-*` | TONO/PALETA/TIPOGRAFÍA con sus valores y las seis líneas del encabezado en la capa 2; sin aviso |
| 4 | Brief viejo: se arma igual y lo dice | `despues/02-*` | aviso ámbar «Este brief no trae el documento del Gem de diseño…» y `AVISO SOBRE ESTE DOCUMENTO` adentro; 7.247 caracteres; y los otros dos estados: `03` sin encabezado, `04` falta PALETA, cada uno con su aviso |
| 5 | Sin link en la herramienta: qué ve el setter | `despues/*-pliegue` | «Claude Design · Link pendiente · Todavía no tenés el link cargado — pedíselo a Franco…», pegado al botón de copiar y dentro del pliegue a los dos anchos; copiar y tildar habilitados; ningún «Abrir Claude Design» inventado |
| 6 | El tilde, y que el progreso guardado se respete | `despues/05-*` (apagado en BRIEF), `06-*` y `06-a-medias-1440-tildado.png`, `07-*` | a medias: sin marcar y la base **igual** al cargar (`calidad, cta, estructura`) → tildar: `assets, calidad, cta, estructura, personalizacion` → recargar: marcado → destildar: `calidad, cta` (las de «Refinar» quedan); `07` con las seis: marcado al entrar |
| 7 | Las dos mediciones fijas, sin empeorar | §8 | franja 224/224; pliegue: solo cambia mc1, y lo que cambia no empeora |
| 8 | El conteo de ida y vuelta de la base | §9 | delta cero |

**`visual-qa`** sobre las capturas: sin ❌ ni ❓ (la primera pasada sobre el build previo a las dos frases nuevas y a la corrección del acento; la segunda, sobre las capturas finales: sin ❌ ni ❓ en los siete estados a los dos anchos, con el color ámbar de los avisos y la columna alineada confirmados mirando las imágenes).

---

## 6 · Las pruebas, demostradas fallando

### 6.1 · Las nuevas

| Archivo | Suite | Casos | Qué fija |
|---|---|---|---|
| `tests/leados/bloque-construccion.spec.ts` | `test:leados` | **19** | §1 tres capas en orden, el documento en el medio (= el bloque de siempre), las fijas iguales para todo lead, el prompt base (no preguntar, decidir por lo conservador, declararse), el piso (criterio de rechazo, menú, una sola regla del acento), **los nueve puntos adentro del bloque** con un brief nuevo y uno viejo · §2 el encabezado: sus campos viajan aunque el brief no los tenga; falta una línea; no hay encabezado · §3 cuatro formas de brief viejo arman el bloque y lo dicen · §4 el tilde = la derivación (64 subconjuntos); marcar/desmarcar no toca «Refinar»; a medias se lee sin marcar; las formas de `progresoJson` de la base se leen igual |
| `tests/setter/33-construir-un-paso.spec.ts` | `test:setter` | **8** | A un botón, el bloque entero, portapapeles = pantalla = producto · B con encabezado, los campos y el encabezado adentro, sin aviso · C brief viejo: tres capas y el aviso · D sin link: qué falta y a quién; copiar y tildar habilitados; ningún acceso inventado · E el tilde: a medias sin marcar y sin reescribir, marcar suma dos, recargar lo muestra, desmarcar deja «Refinar», mc2 con sus tres · F lo construido se lee marcado; ráfaga de tres clics compone · G los nueve puntos fuera, sin badge ni «Contexto del lead»; qué esperar con las secciones · H en BRIEF el tilde apagado dice por qué; copiar habilitado |

Todas siembran su estado y lo borran por id; las ausencias van después de una presencia del mismo render; los clics esperan la hidratación del control (las props de React en el nodo), no un tiempo. **Un falso rojo propio, medido y cerrado:** la primera corrida de `33` A comparaba el portapapeles tal cual y salió roja por un carácter de más al final de cada renglón. Sondeado sin la app (Chromium escribe «uno\ndos», `readText()` devuelve «uno\r\ndos»): es el portapapeles de Windows. Se normaliza solo `\r\n`; cualquier otra diferencia sigue siendo roja (sabotaje E1).

### 6.2 · Contra el código de partida

| Prueba | Cómo | Resultado |
|---|---|---|
| `bloque-construccion` | contra el árbol de partida | **no carga**: `Cannot find module '../../src/lib/leados/bloque-construccion'` |
| `33-construir-un-paso` | contra el build de partida (`.next-perf-base`) | **8 de 8 rojas**, en su primer aserto: «el bloque de «Construir» está a la vista» — no hay `pre[data-bloque]`: el bloque vivía plegado en «Contexto del lead». Base sin delta |

### 6.3 · Sabotajes

Reemplazo literal de una sola ocurrencia, corrida, restauración con **md5 idéntico** en los catorce. S1–S12 sobre `bloque-construccion`; E1 y E2 en un build aparte (`.next-perf-a`, borrado) contra `33`.

| # | Sabotaje | Rojo en |
|---|---|---|
| S1 | las capas unidas sin la línea en blanco | 1a |
| S2 | la capa del medio lleva solo el documento del Gem | 1b · 1f · 2a · 3a |
| S3 | el piso antes que el documento | 1a · 1b · 1c · 1f · 2a · 2b · 2c · 3a |
| S4 | un encabezado incompleto se lee como completo | 2c |
| S5 | lo que falta se decide mirando solo el brief | 2b |
| S6 | el tilde escribe solo sus fases y pisa «Refinar» | 4b · 4c |
| S7 | la pantalla se da por marcada con UNA fase | 4a · 4c · 4d |
| S8 | el aviso al setter no dice nada nunca | 2d · 3a |
| S9 | el prompt base deja de prohibir preguntas | 1d |
| S10 | el piso pierde la regla del menú | 1e |
| S11 | el prompt base deja de decir «ninguna sección más» | 1f |
| S12 | vuelve la contradicción del acento | 1e |
| E1 | el botón copia el bloque sin el piso | `33` A, en «lo que se copia es lo que la pantalla muestra» |
| E2 | el tilde pisa las fases de «Refinar» | `33` E, en «marcar suma las dos que faltaban de «Construir»» |

### 6.4 · Pruebas existentes cambiadas, una por una

Ninguna borrada ni salteada. Cada cambio conserva lo que la prueba protegía, en la pantalla donde sigue siendo verdad.

| Prueba | Qué fijaba | Qué cambió |
|---|---|---|
| `11-fase-disabled` B-07 | mc1 en BRIEF: tilde apagado, su motivo, **tres tildes** (P6-B) | mc1: **un** tilde, mismo motivo; los tres por fase se afirman en **mc2**, apagados en BRIEF (aserto nuevo) |
| `11-fase-disabled` C-08 | mc1: el tilde funciona; **tildar uno no arrastra a los otros dos** | mc1: el tilde único funciona y se guarda; «tildar uno no arrastra» se afirma en **mc2**, con sus textos de siempre |
| `17-destinos-alcanzables` clase 2 | el bloque que la munición nombra está donde dice (mc1) | ahora sobre **mc1 y mc2**: en mc1 bloque y nombre en el bloque de trabajo; en mc2, Contexto y Munición con el orden de siempre |
| `29-rafaga-progreso` (P25) | ráfagas de tres y de diez en los tres tildes de mc1; mc1 y mc2 conviven | las dos ráfagas en **mc2** (mismo dueño, tres tildes por fase, aserto idéntico); «conviven»: mc1 con su tilde único + ráfaga de tres en mc2 → seis. La ráfaga sobre el tilde único la fija `33` F |
| `30-un-solo-viaje` (P28) | «Arrancar» y «tildar una fase» hacen un viaje | «Arrancar» en mc1, contando **un** tilde; «tildar una fase» en **mc2**, donde la fase sigue siendo una (aserto exacto) |
| `31-reflejo-del-arbol` (P31) | el tilde de mc1 pasa de apagado a vivo al arrancar | el locator pasa al nombre del tilde único; el aserto no cambia |
| `32-brief-cuatro-vueltas` F (P40) | el bloque de mc1 lleva tono, paleta, tipografía y el documento | el bloque se busca donde vive (bloque de trabajo, abierto); los mismos asertos de texto |

### 6.5 · Un rojo intermitente que no es de este sprint: `32-brief-cuatro-vueltas` B

Apareció en una corrida dirigida («exactamente una vuelta desplegada — Received: ["1 · Lectura estética", "2 · Decisiones"]», a 1,1 s, adentro de un `expect.poll`). Medido antes de atribuirlo:

- **contra la partida también**: 3 rojas de 8 en el build de partida, 4 de 8 en el nuevo;
- **el mecanismo** (`scripts/p42-sonda-vueltas.mts`): un `MutationObserver` dentro de la página contó las cabeceras desplegadas después de cada cambio, en una sola lectura, con la lectura en serie del helper corriendo al lado. **El DOM nunca tuvo dos vueltas abiertas (0 de 12 en la partida, 0 de 12 en el nuevo); la lectura en serie «vio» dos en 3 y en 4 de 12.** `vueltaAbierta` lee los cuatro `aria-expanded` con cuatro viajes y cruza el instante del avance. El rojo lo fabrica el instrumento de P40.

No lo toqué (m6, fuera del objetivo). El arreglo es leer las cuatro cabeceras en un solo `evaluate`. En la corrida de cierre salió verde.

---

## 7 · El tamaño del bloque — medido, no verificado contra la herramienta

`scripts/p42-tamano-bloque.mts` contra la partida (`mediciones/tamano-partida.json`) y el final (`mediciones/tamano-final.json`). Caracteres (lo que cuenta un campo de texto), palabras y bytes UTF-8. No estima tokens: depende de la herramienta.

| Escenario | Antes (el bloque de hoy) | **Después (tres capas)** |
|---|---|---|
| Los 49 briefs de la base (ninguno con documento) | mediana 543 · máx 2.270 | **mediana 7.239 · máx 8.966** (mediana 1.295 palabras) |
| Documento de ejemplo (780 palabras) + ficha completa | 6.236 · 1.111 palabras | **12.563 · 2.262 palabras · 12.971 B** |
| Documento al tope del contrato del Gem (1.200 palabras) | 8.551 · 1.531 palabras | **14.878 · 2.682 palabras · 15.350 B** |
| Documento en su techo de validación (15.000) | 16.961 | **23.288 · 23.696 B** |
| Techo teórico (todo campo en su tope) | 79.018 | 85.560 |

Por capa, en el ejemplo: **instrucciones 1.641** caracteres (286 palabras) · **documento 6.267** (1.119) · **piso 4.651** (857). Las dos capas fijas, con rótulos y separadores, suman **6.327 caracteres a cada bloque**.

**El supuesto sin probar (S-30):** que Claude Design acepte todo eso en un solo mensaje. El caso realista es ~15.000 caracteres / ~2.700 palabras; el peor que el producto deja guardar con datos realistas, ~23.000. **No se verificó contra la herramienta.**

---

## 8 · Las dos mediciones fijas

Corridas contra el build final, comparadas celda por celda con la Fase 0. Nuevas líneas de base: `docs/p42-construccion/franja.json` y `pliegue.json`.

| | Fase 0 | Cierre |
|---|---|---|
| franja | 28 filas | **224/224** celdas iguales |
| pliegue | 28 filas | **1034/1062** — las 28 distintas son **todas de mc1**; las otras trece pantallas, mc2 y mr incluidas, idénticas a los dos anchos |

**mc1, lo que no se movió** (1440 y 390): pliegue (788/688), barra (57), pliegue efectivo (731/631), acción principal a la vista arriba y abajo y su posición, superficies anidadas (2), rótulos, copiar (1), links externos e internos, pasos de la franja, píldoras «Link pendiente».

**mc1, lo que se movió:**

| Celda | 1440 | 390 | Por qué, y por qué no es empeorar |
|---|---|---|---|
| `captura` (primer control de trabajo) | 1209 → **415** | 1452 → **518** | **mejoró**: era el primer tilde, después de dos zonas; ahora es «Copiar bloque», arriba de todo |
| `entra` | no → **sí** | no → **sí** | **mejoró**: el trabajo empieza dentro del primer pliegue a los dos anchos (antes, en ninguno) |
| `registro` (arranque del bloque de trabajo) | 1073 → 369 | 1301 → 384 | mejoró: no hay contexto ni munición antes |
| `cromoLayout` | 404 → 323 | 400 → 319 | mejoró: ídem |
| `accionable` (primer accionable) | 413 → 415 | 488 → **518** | el mismo control («Copiar bloque») 2 y 30 px más abajo: antes vivía en una banda sin tarjeta, ahora adentro de la tarjeta (su padding y su rótulo). Sigue dentro del pliegue |
| `alturas.contexto` / `municion` | 125 / 548 → — | 183 / 702 → — | las zonas no se montan |
| `alturas.registro` | 391 → 4.177 | 402 → 6.308 | el bloque entero vive en el bloque de trabajo |
| `altoTotal` | 1.739 → 4.822 | 1.998 → 6.987 | **el costo de «legible entero»**: el texto que antes estaba plegado ahora se lee |
| `censo.controles` | 5 → 3 | 5 → 3 | tres tildes → uno |
| `censo.plegables` | 3 → 2 | 3 → 2 | el «Ver el texto que vas a copiar» ya no existe |
| `capturaEtiqueta` | «Marcar «Estructura» como hecha» → «Copiar bloque» | ídem | el primer control es otro |

---

## 9 · La base vuelve a su estado

Con el código final (`scripts/p39-censo-base.mts`, 63 tablas + leads, usuarios y avisos por id):

| Foto | OsLead | User | OsSetterNotice | Suite | Tablas con delta contra la anterior |
|---|---|---|---|---|---|
| antes | 105 | 21 | 6 | — | — |
| tras `test:leados` | 105 | 21 | 6 | **118/118** (99 + 19 nuevas) | **ninguna** |
| tras `test:helpers` | 105 | 21 | 6 | **28/28** | **ninguna** |
| tras `test:setter` | 105 | 21 | 6 | **210/210** (202 + 8 nuevas) | **ninguna** |
| **antes → después** | | | | | **ninguna** |

**Delta cero.** Cada corrida suelta del sprint también se midió antes y después y ninguna dejó filas: las capturas (cuatro veces), la sonda (dos), las pruebas nuevas contra la partida, las corridas dirigidas, los sabotajes de pantalla, las mediciones fijas.

---

## 10 · Cierre

| Gate | Resultado |
|---|---|
| `tsc --noEmit` | exit **0** |
| Invariantes | **57/57** (58 descubiertos, 1 excluido; ninguno tocado — `pantallas-construccion` y `progreso-isolation`, los dos que vigilan la llave, verdes todo el sprint) |
| `test:leados` · `test:helpers` · `test:setter` | **118/118 · 28/28 · 210/210** (build final `.next-setter`, 3003, servidor en frío) |
| `npm run build` | exit **0** |
| `npx prisma migrate status` | 86 migraciones · **«Database schema is up to date!»** |
| Franja · pliegue | **224/224** · **1034/1062** (las 28 de mc1, §8) |
| Base | 105 · 21 · 6 · **delta cero** |
| La llave del progreso | serializada al cierre: **md5 `9968d31050b38c8120dc22add52ec566`, idéntico a la Fase 0**; `contracts.ts` con **diff vacío** contra la copia de la Fase 0; `flow-content.ts` sin ninguna línea de `id` ni de `nombre` en el diff; `manual.ts`, solo la bajada de mc1 |
| Revisión de código (subagente) | **APROBADO**: 0 CRITICAL · 0 HIGH · 1 MEDIUM corregido (la contradicción del acento, §3) · 1 LOW corregido (el botón copia el `texto` del producto en vez de recomponerlo) |
| `visual-qa` | sin ❌ ni ❓ |
| WIP ajeno | **303 de 306 idénticos** por md5; los 3 distintos son los previstos (`page.tsx`, `31-reflejo-del-arbol`, `32-brief-cuatro-vueltas` F) |
| Entorno | servidores propios bajados por PID (74336, 19064, 97992, 110316, 37704, 13672, 109068, 19452); builds temporales `.next-perf-base` y `.next-perf-a` borrados; `tsconfig.json` y `next-env.d.ts` idénticos por md5 a la Fase 0; 26,3 GiB libres |

**Qué cambió.** Producto, nuevos: `prompt-construccion.ts`, `bloque-construccion.ts`, `progreso-pantalla.ts`, `mc1-construir.tsx`, `bloque-tres-capas.tsx`, `tilde-construccion.tsx`. Producto, modificados: `[paso]/page.tsx`, `m-construccion.tsx`, `registro-fases.tsx`, `flow-content.ts`, `manual.ts`. Pruebas nuevas: `bloque-construccion.spec.ts`, `33-construir-un-paso.spec.ts`. Pruebas cambiadas: `11`, `17`, `29`, `30`, `31`, `32` (§6.4). Instrumentos nuevos: `p42-tamano-bloque.mts`, `p42-llave-progreso.mts`, `p42-capturas.mts`, `p42-sonda-vueltas.mts`.

**Confirmado:** la llave del progreso no cambió (§10); ninguna llave de datos (ids de fase, ids de pantalla, nombres de checks); ninguna transición; el gate del envío intacto (`selfCheckAprobado`, `guardarDraftUrl` y las transiciones sin tocar); ningún invariante debilitado; ninguna prueba borrada ni salteada; las dos superficies fijas (la franja y el layout-tipo de `PantallaManual` con su barra) sin tocar; «Refinar» y «Correcciones» con el mismo render; nada agregado a git, nada commiteado ni pusheado.

---

## 11 · Anotado, no hecho

- **S-30 no está en el registro de supuestos.** `decisiones-por-pantalla.md` cita S-25 a S-30 como anotados en `supuestos-a-probar.md`, que termina en S-18. Los documentos de Franco no se tocaron.
- **La copia de Claude Design en `herramientas.ts`** («El panel te guía fase por fase»; «Qué te devuelve: la demo lista para exportar…») quedó a medias para mc1. Se muestra plegada también en mc2 y mr: corregirla es tocar «Refinar». Va con el sprint de mc2.
- **`NavConstruccion`** (layout de Construcción) dice «Las fases son auto-reporte: entrá y salí en el orden que te sirva». Con un tilde en mc1 habla de las pantallas. Para el sprint de mc2.
- **«¿Algo no sale como la guía dice?»** (escalamiento compartido): en mc1 la «guía» es ahora el bloque y «Qué esperar». Se entiende; anotado.
- **El caso de perf «Tildar una fase (mc1)»** sigue funcionando (marca con el tilde único; verifica «al menos una fase»), pero su título quedó viejo. La suite de perf no es del cierre.
- **Galería** (`tests/galeria/captura.spec.ts`): los estados 14–17 van a fotografiar la pantalla nueva y `16-mc1-parcial` ya no puede mostrar un parcial. No se regeneró.
- **`32-brief-cuatro-vueltas` B**: el helper lee en serie (§6.5). Arreglo: un solo `evaluate`.
- **El bloque es largo en el celular** (~7.000 px de pantalla a 390 con el documento de ejemplo): el costo de «legible entero». Si pesa, la palanca es tipográfica, no plegar.

---

## 12 · Para la verificación humana

- **El piso de calidad (§3), entero.** Es lo único de todo el producto que decide si una demo se ve bien, y ninguna prueba lo valida: las pruebas fijan que las reglas estén y no se contradigan, no que sean las correctas. Leelo como lo va a leer una herramienta que no puede preguntar. Lo que va más allá del texto de Franco, para mirar primero: los números (80/56 px entre secciones, 24 px de margen, cuerpo de 16 px con interlineado 1,5 y renglones de 75 caracteres, contraste 4,5 a 1, columna de 1200 px, animaciones de menos de medio segundo, diseño a 390 px); «el cuerpo de texto va alineado a la izquierda»; «si no podés usar las fotos reales, armá la sección sin foto y declaralo»; «si el documento no trae el link de WhatsApp, dejá el botón sin link y declaralo»; «si la página no necesita menú, mejor sin menú».
- **El bloque completo (§2.4).** Es lo que la herramienta va a recibir. Si no se entiende leyéndolo de corrido, la herramienta tampoco. Mirá el párrafo que agregué al prompt base («manda la decisión») y el aviso de los briefs viejos, que hoy son los 49 de la base.
- **El tamaño (§7).** Con un documento en el tope del contrato, **~14.900 caracteres (~2.700 palabras)**. Si Claude Design tiene un tope por mensaje por debajo de eso, conviene saberlo antes de que el setter lo descubra pegando. La prueba: pegar `bloque-ejemplo-con-encabezado.txt` y ver si llega entero (la última línea es «- Un menú con links que no llevan a ningún lado.») y si la lista de cierre vuelve con sus cuatro partes.
- **La decisión del «Construir» a medias** (§4.3): se lee sin marcar y el primer clic completa.
