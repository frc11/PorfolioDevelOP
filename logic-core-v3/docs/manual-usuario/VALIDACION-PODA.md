# VALIDACIÓN DE LA PODA — lo que la bitácora dice contra lo que la aplicación hace

**Cómo se hizo.** Escribiendo el manual, no auditando código. Cada afirmación de
abajo se verificó **en la aplicación viva** —carril aislado de la galería,
`.next-galeria/` en `:3004`, el mismo build con el que se sacaron las 50 capturas
que el manual cita— o contra la base de datos cuando hacía falta distinguir «no
se muestra» de «no existe».

**Contra qué se valida.** Las entradas de [`docs/bitacora-beta-3.md`](../bitacora-beta-3.md)
de los nueve bloques de la poda. No contra ningún brief.

**La regla de desempate.** Si la bitácora y la aplicación no coinciden, **gana lo
que se ve**, y queda anotado como hallazgo.

---

## Veredicto

| | |
|---|---|
| **Bloques verificados** | 9 de 9 |
| **Afirmaciones que se cumplen** | Todas las que se pudieron verificar desde la interfaz del setter |
| **Desvíos entre bitácora y aplicación** | **0** |
| **Los cuatro arreglos de fondo** | 4 de 4 en pie |
| **Hallazgos anteriores resueltos** | 5 de 18 · **vivos:** 12 · **medio resuelto:** 1 |
| **Principios de diseño que se cumplen** | 5 de 8 |

**La poda hizo lo que dijo que hizo.** El matiz importante no está en lo que se
ejecutó sino en lo que se dejó explícitamente fuera de alcance: todos los
hallazgos vivos de la corrida anterior estaban anotados como *fuera de scope* en
alguna entrada de la bitácora. La poda no falló en cumplirlos — nunca los
prometió.

---

## B.1 · Bloque por bloque

### 1 · P1 — seis correcciones de copy, y el perfil del canal

> Es el bloque que la consigna nombra como dos («copy y contenido» y «canal por
> toque»): la bitácora los cerró juntos, en un solo commit.

| Lo que la bitácora afirma | Verificado en la aplicación |
|---|---|
| Se arregla el «hace **hace** N días» del panel | ✅ Hoy dice *«la más vieja hace 59 días»*. Una sola vez |
| El filtro «Perdidos (post-reunión)» pasa a «Perdidos (cerrados por Franco)» | ✅ Es el nombre que aparece hoy en el desplegable de la cartera |
| El checkbox del dueño gana nombre accesible propio | ✅ Su nombre accesible es *«Estoy hablando con el dueño o quien decide»* |
| Los límites de Instagram bajan a un perfil conservador y el cartel explica el ramp-up | ✅ La pantalla dice *«10 / 10 DMs»* y *«El tope de hoy no es para siempre: sube a medida que la cuenta acumula historial»* |
| La opción «toque 4» ya estaba resuelta y se saltea | ✅ Con la cadencia agotada esa opción **no se ofrece**: en su lugar dice *«Los 3 toques ya se cumplieron — si no respondió, se enfría solo»* |

**Sin desvíos.**

> **Lo que no se pudo verificar desde la interfaz del setter:** el canal con el
> que se registra cada toque. El formulario de registro **no ofrece un selector
> de canal** — se verificó que no hay ningún `<select>` en el bloque de registro,
> ni antes ni después de elegir una opción. El canal sí aparece en el historial,
> ya por su nombre unificado (ver bloque 9).

### 2 · P4 — las dos pantallas de evaluación son una

| Lo que la bitácora afirma | Verificado |
|---|---|
| Sobrevive una sola pantalla, con el título «Llevá la ficha a evaluar y registrá el veredicto» | ✅ Textual |
| La pantalla del veredicto **desaparece del registro** | ✅ Su dirección vieja no existe: entrar a `.../manual/m3` deja al setter en la pantalla actual del negocio |
| La ficha se sirve como un bloque copiable único, que además queda abierto para transcribir contra él | ✅ Un solo bloque, con botón **Copiar bloque**, visible entero |
| La herramienta pasa a llamarse «Chat de evaluación (Sonnet)» y su acceso queda pendiente por el mecanismo que ya existía | ✅ Ese es el nombre, y el acceso dice **Link pendiente** — no un link roto |
| Quedan cero referencias a la pantalla retirada | ✅ Barrido sobre las siete pantallas de trabajo: ninguna la nombra |

**Sin desvíos.**

### 3 · P5-A — la ficha recibe el material de la demo

| Lo que la bitácora afirma | Verificado |
|---|---|
| Cinco campos nuevos, agrupados, bajo el título «Material para construir la demo» | ✅ Los cinco están, agrupados, con ese título |
| Todos opcionales, y **no** entran en el gate de señal mínima | ✅ La lista de faltantes del semáforo nombra sólo identidad, presencia digital y reseñas/contenido |
| Las direcciones se validan sin tirar abajo el formulario | ✅ Se probó con una dirección a medias: el campo se marca en rojo (*«Link inválido — pegá la dirección completa (https://…)»*), **lo demás se sigue guardando solo**, y el guardado explícito se frena con *«Revisá los links marcados: pegá la dirección completa (https://…) o dejalos vacíos.»* |
| El material viaja al bloque de construcción | ✅ El bloque que se copia en Construcción trae **DE DÓNDE BAJAR EL LOGO Y LAS FOTOS REALES** y las reseñas con su link |
| Degradación honesta: un campo sin cargar se omite, sin placeholder ni hueco | ✅ En los leads sembrados sin material, esas secciones simplemente no están en el bloque |

**Sin desvíos.**

### 4 · P5-B — la pantalla del brief deja de pedir lo que la ficha ya tiene

| Lo que la bitácora afirma | Verificado |
|---|---|
| Título nuevo: «Decidí cómo va a ser la demo» | ✅ Textual |
| **«Notas de marca» se retira de la pregunta** | ✅ La cadena «Notas de marca» **no aparece** en la pantalla, y quedan **5** campos en el registro |
| El valor viejo sigue viajando invisible, para no borrar briefs ya guardados | ⚠️ **No verificable desde la interfaz del setter**, por diseño: el campo es invisible. La bitácora lo verificó en su momento con un lead pre-P5-B |
| Se corrige el texto de la herramienta, que prometía un campo inexistente | ✅ El desplegable del Gem de diseño no menciona notas de marca |
| El rail sigue diciendo «Brief» — anotado como fuera de scope | ✅ Sigue diciendo «Brief». Es lo que alimenta [H-11](HALLAZGOS-MANUAL-v3.md) |

**Sin desvíos.** La única fila que no se pudo cerrar es una que la propia
bitácora define como invisible.

### 5 y 6 · P6-B — las seis pantallas de Construcción son dos

| Lo que la bitácora afirma | Verificado |
|---|---|
| Dos pantallas: «Construí la demo en Claude Design» y «Refiná la demo antes de publicarla» | ✅ Textual, con los chips **1 Construir** y **2 Refinar** |
| Corte 3+3: estructura·personalización·assets / cta·calidad·mobile | ✅ Exacto, y cada trío tiene su propia sección con nombre |
| **Los seis tildes se conservan**, uno por fase | ✅ Tres tildes en cada pantalla, con su nombre propio |
| Los prompts van **dentro** del bloque de la fase que los usa, no al pie | ✅ *Calidad y motion* tiene dos bloques copiables adentro; *Mobile*, uno; *CTA de WhatsApp*, ninguno |
| Completada = **todas** sus fases | ✅ Con una de tres tildada la pantalla no figura completada; con las tres, sí |
| El indicador dice «paso 1 de 2» / «paso 2 de 2» | ✅ Textual, en mayúsculas |
| Las direcciones viejas no rompen | ✅ Ver B.2 punto 4 |
| **El aviso del tilde deshabilitado miente en la reentrada** — anotado como pre-existente, no introducido por el colapso | ✅ Confirmado: en la reentrada los tildes dicen *«Primero arrancá la construcción — el botón está arriba»* y ese botón no está ahí (se llama **Reabrir construcción** y vive en la pantalla de correcciones). Documentado como excepción en el capítulo 07 |

**Sin desvíos.**

### 7 · P7 — el chequeo final deja de perder trabajo, y dice la verdad

| Lo que la bitácora afirma | Verificado |
|---|---|
| Los tildes se guardan solos | ✅ Ver B.2 punto 1 |
| **El botón «Guardar el chequeo» desaparece** | ✅ Barrido de todos los botones de la pantalla: **ninguno** dice «Guardar» |
| De 6 obligatorios se pasa a 10 | ✅ Diez interruptores obligatorios, contados |
| Dos grupos con rótulo propio: «Esto lo revisás vos» / «Esto lo mira Franco» | ✅ Son dos secciones con nombre propio: 7 puntos en la primera, 3 en la segunda |
| Los cuatro delatores de diseño se mudan **adentro** del grupo de Franco, como sub-bloque, y siguen sin bloquear | ✅ La sección de Franco contiene 7 interruptores: sus 3 obligatorios + los 4 delatores, bajo el subtítulo *«Delatores de siempre — no bloquean, pero Franco los ve»* |
| El gate no cambió de forma: los diez bloquean | ✅ Con 7 de 10 el botón está apagado y dice *«Quedan 3 obligatorios en rojo»*; con 10, encendido y *«Todos los obligatorios en verde»* |
| Ningún nombre existente se renombró | ✅ Los siete nombres heredados están literales |

**Sin desvíos.**

### 8 · P8 — el foco prioriza construir, no contactar

| Lo que la bitácora afirma | Verificado |
|---|---|
| Cinco rótulos nuevos, en orden de prioridad | ✅ Los cinco existen y se leyeron todos en una misma cartera: *construila* (20 negocios), *Te está esperando a vos* (11), *La demo está lista para mandar* (5), *Todavía no sabés si sirve — evalualo* (6), *Todavía no hay demo que mostrar* (5) |
| Construir va primero | ✅ En un setter con dos negocios —uno en construcción y uno en ficha—, el foco pone adelante el de construcción |
| **El foco nunca sugiere construir para un lead sin veredicto** | ✅ Ver B.2 punto 2 |
| El pin le gana a todo | ✅ Existe el rótulo *«Fijado por vos — va primero»*, y en el foco aparece la marca *«Fijado mientras lo trabajás»* |
| El vacío se conserva tal cual, sin inventar tarea | ✅ *«No hay nada para trabajar ahora mismo… ¿Querés adelantar? Cargá un prospecto nuevo»* |
| `gateBriefAbierto` es el techo: un lead evaluado pero frío no puede construir | ✅ Confirmado por conducta: la pantalla de decidir la demo sólo se abre con el negocio respondiendo. Documentado en el capítulo 06 como «se destraba con dos condiciones a la vez» |

**Sin desvíos.**

### 9 · P9 — una sola lengua

| Lo que la bitácora afirma | Verificado |
|---|---|
| El título del chequeo pasa a «Chequeá la demo antes de mandarla» | ✅ Textual. La expresión del motor ya no aparece en ninguna pantalla |
| El contador de paso sólo aparece cuando la fase tiene más de una pantalla | ✅ Barrido de 7 pantallas: **cero** apariciones de «paso 1 de 1». Y sobrevive donde informa: «PASO 1 DE 2» y «PASO 2 DE 2» |
| La sugerencia del panel pierde los paréntesis con nombre de pantalla | ✅ Ninguno de los cinco rótulos ni ninguna sugerencia los tiene |
| Los nombres de herramienta apuntan a pantallas que existen | ✅ Netlify Drop dice «Borrador»; el Gem de outreach, «Opener y Seguimiento» |
| «Instagram DM» se unifica a «Instagram» | ✅ El historial de un negocio con dos toques reales dice **Instagram** las dos veces; «Instagram DM» no aparece |
| Los diez nombres del chequeo quedan literales (son llave de lo guardado) | ✅ Los diez están palabra por palabra, incluidos los dos con jerga («lorem ipsum», «assets») |

**Un residuo, no un desvío.** El barrido dejó **un** paréntesis con nombre de
pantalla en todo el recorrido: *«Abre la producción de la demo (Brief)»*, en la
opción **Respondió** de la pantalla de toques. La bitácora no lo declara
cubierto ni lo declara fuera de scope: simplemente no lo nombra. Registrado como
[H-12](HALLAZGOS-MANUAL-v3.md).

---

## B.2 · Los cuatro arreglos que más importan

### 1 · Los tildes del chequeo ya no se pierden ✅

**Era el hallazgo más grave del proyecto.** Probado en vivo, dos veces y de dos
formas distintas:

| Prueba | Resultado |
|---|---|
| Tildar tres obligatorios y **salir navegando por el manual** (chip *Borrador* de la tira de completadas, que es navegación interna — exactamente el caso que rompía antes), volver | **Los tres siguen tildados** |
| Tildar tres obligatorios y **cerrar el navegador entero**, entrar de nuevo en otra sesión | **Los tres siguen tildados** |

La segunda prueba es más hostil que la que pedía la consigna, y también pasa.

Además, el acuse está donde se hizo el clic: al tildar aparece **«Guardando»**
junto al botón, y la leyenda permanente dice *«Se guarda solo a medida que
tildás. Podés cerrar y seguir después.»*

### 2 · El foco prioriza construir, y nunca manda a construir sin evaluar ✅

Las dos mitades, verificadas por separado:

| | Verificación |
|---|---|
| **Prioriza construir** | Un setter con dos negocios (uno en CONSTRUCCIÓN, uno en FICHA): el foco pone adelante el de construcción, con el rótulo *«Pasó el filtro y le falta la demo — construila»* |
| **Nunca construir sin veredicto** | El mismo negocio en FICHA, leído en la cartera: su sugerencia es *«Completá la ficha»* con el rótulo *«Todavía no sabés si sirve — evalualo»*. Nunca «construila» |

### 3 · Ningún texto nombra pantallas que ya no existen, y ninguna numeración miente ✅

Barrido sobre siete pantallas del recorrido (toques, decidir la demo, construir,
refinar, borrador, chequeo, envío, primer contacto), buscando doce expresiones
prohibidas: los ids retirados, «paso 1 de 1», el título viejo del chequeo, los
tres paréntesis de pantalla, «Generá el brief», «(paso anterior)», «Instagram
DM», «Publicar el borrador» y «Primer contacto».

**Resultado: una sola aparición en todo el recorrido** — el «(Brief)» del bloque
9. Ninguna numeración miente: «paso 1 de 1» no existe, y el contador que sí
informa («PASO 1 DE 2» / «PASO 2 DE 2») está donde tiene que estar.

### 4 · Las direcciones viejas redirigen, sin bucle ✅

Probadas siete direcciones, sobre negocios en tres puntos distintos del
recorrido:

| Dirección vieja | Negocio | Dónde aterriza |
|---|---|---|
| `m3` (evaluación separada) | en construcción | `mc1` |
| `m7` | en construcción | `mc1` |
| `m9` | en construcción | `mc1` |
| `m12` | en construcción | `mc1` |
| `m7` | rechazado | `mr` |
| `m12` | en ficha | `m1` |
| una dirección inventada | en ficha | `m1` |

**Siempre a la pantalla donde está parado ese negocio hoy. Cero bucles, cero
pantallas fantasma, cero errores de consola.**

---

## B.3 · Los 18 hallazgos de la corrida anterior

Verificados **en la aplicación**, no en el código.

| # | Hallazgo | Hoy |
|---|---|---|
| H-01 | 4 de 5 herramientas sin acceso cargado | 🔴 **Vivo.** Cambió el conteo (6 de 11 pantallas en vez de 10 de 16) sólo porque hay menos pantallas |
| H-02 | «la más vieja hace **hace** 45 días» | 🟢 **Resuelto** |
| H-03 | «Saltar» sin acuse | 🔴 **Vivo.** Verificado dos veces, con latencia distinta cada vez |
| H-04 | Novedades sin techo ni resumen | 🔴 **Vivo.** 73 novedades, doce idénticas |
| H-05 | La galería no fotografió la cartera desplegada | 🔴 **Vivo.** Las dos capturas siguen siendo el mismo archivo (mismo md5), incluso después de regenerar la galería |
| H-06 | «Se guarda solo» junto a un botón «Guardar ficha» | 🔴 **Vivo** |
| H-07 | El razonamiento sembrado contradice el veredicto en la foto del descarte | 🔴 **Vivo** |
| H-08 | Dos numeraciones de toque a la vez | 🔴 **Vivo** |
| H-09 | La opción bloqueada se llamaba «toque 4» | ⚪ **Desapareció.** Con la cadencia agotada la opción ya no se ofrece |
| H-10 | La tira COMPLETADAS no muestra la construcción | 🔴 **Vivo**, más chico: faltan dos casilleros en vez de seis |
| H-11 | El tilde de fase no se anuncia como tilde | 🟢 **Resuelto.** Al tildar aparece «Fase marcada como hecha» en el lugar del clic, y el control tiene estado accesible |
| H-12 | Los seis tildes del chequeo se perdían | 🟢 **Resuelto.** Ver B.2 punto 1 |
| H-13 | Tres controles distintos para tildar | 🟡 **Medio.** Siguen siendo tres formas distintas, pero la que no tenía nombre accesible ahora lo tiene |
| H-14 | El historial de rechazos no se ve | 🔴 **Vivo.** Reproducido sobre un negocio con dos rechazos: se ve uno |
| H-15 | Dos esperas opuestas con el mismo texto | 🔴 **Vivo y ampliado.** La pantalla de envío tampoco nombra la causa real |
| H-16 | Error de configuración crudo al setter en la agenda | 🔴 **Vivo, textualmente idéntico** |
| H-17 | Tramo no documentado (la agenda real) | 🔴 **Vivo.** Sigue sin poder documentarse |
| H-18 | El filtro «Perdidos (post-reunión)» mentía | 🟢 **Resuelto** |

**Resumen: 4 resueltos · 1 desaparecido · 1 a medias · 12 vivos.**

Los doce vivos **estaban todos anotados como fuera de scope** en alguna entrada
de la bitácora de la poda. Ninguno es una regresión.

---

## B.4 · Los ocho principios de diseño

Tres ejemplos por principio, buscados recorriendo el producto.

### 1 · Toda acción da acuse donde se hizo el clic — ⚠️ **casi**

| Dónde | Cómo |
|---|---|
| Tildar un obligatorio del chequeo | ✅ Aparece **«Guardando»** al lado del botón, y el contador de rojos baja |
| Tildar una fase de construcción | ✅ El texto de abajo cambia a **«Fase marcada como hecha»**, en el mismo lugar |
| Guardar la ficha | ✅ Cartelito de estado pegado al botón: **Guardando… / Sin guardar** |
| **Saltar**, en el panel de inicio | ❌ **Nada.** Ni spinner, ni cambio de color. En una prueba el recuadro seguía igual 5,5 s después |

**Se cumple en tres de cuatro.** El que falla es el más visible del producto.

### 2 · Ningún formulario pierde trabajo en silencio — ✅ **se cumple**

| Dónde | Cómo |
|---|---|
| El chequeo final | ✅ Autoguardado, probado saliendo por el manual y cerrando el navegador |
| La ficha | ✅ *«Se guarda solo mientras escribís»*, y con un link roto **lo demás se sigue guardando** |
| Los horarios ofrecidos en la agenda | ✅ Quedan guardados con su fecha: *«son los que el prospecto tiene en la mano»* |

**Era el principio más roto del producto y hoy se cumple.**

### 3 · La pantalla no promete lo que no muestra — ❌ **no se cumple**

| Dónde | Qué |
|---|---|
| Reentrada por rechazo | ❌ *«el historial de rechazos se conserva»* — se conserva y no se muestra |
| Espera del tramo de envío | ❌ *«si el negocio responde, registralo»* cuando el negocio ya respondió |
| La tira COMPLETADAS | ❌ Se llama «completadas» y muestra lo tildado |
| El chequeo final | ✅ Contraejemplo limpio: *«Se guarda solo a medida que tildás»* y es cierto |

### 4 · Dos situaciones distintas no muestran el mismo texto — ❌ **no se cumple**

| Dónde | Qué |
|---|---|
| Las dos esperas del envío | ❌ **Palabra por palabra idénticas**, con causas opuestas |
| Primer y segundo rechazo | ❌ Idénticas, con 1791 caracteres las dos |
| «esperando respuesta» en el panel | ❌ Cuenta como espera al negocio lo que espera a Franco |
| Las tres esperas del recorrido | ✅ Contraejemplo: la de revisión sí se distingue («Franco está revisando tu demo») |

### 5 · Nada habla en jerga de sistema — ⚠️ **casi**

| Dónde | Qué |
|---|---|
| Buscar horarios sin configurar | ❌ *«Setup B7.0 pendiente: cargá… el username… el slug del event type…»* con dos nombres de variable |
| Los dos nombres del chequeo con «lorem ipsum» y «assets» | ⚠️ Quedan literales a propósito: son la llave de lo guardado |
| El resto del recorrido | ✅ Barrido de siete pantallas: cero jerga, cero ids internos, cero numeraciones falsas |

**El barrido de vocabulario cumplió.** Lo que queda es un mensaje de error que
nunca pasó por él.

### 6 · Un control que el servidor va a rechazar no se ofrece — ⚠️ **casi**

| Dónde | Qué |
|---|---|
| **Enviar a revisión** con obligatorios en rojo | ✅ Apagado, y dice cuántos faltan |
| **Buscar horarios** sin confirmar el dueño | ✅ Apagado hasta tildar la casilla |
| **Guardar ficha** con un link roto | ⚠️ Se ofrece encendido; el rechazo llega al apretarlo, con un mensaje claro que queda fijo |
| **Enviar a revisión** cuando el negocio se movió por detrás | ⚠️ Inevitable: es una carrera. El rechazo llega con el motivo en criollo y **queda fijo**, que es lo correcto |

### 7 · Una sola forma de tildar — ❌ **no se cumple**

Tres controles distintos para la misma idea:

| Dónde | Qué es |
|---|---|
| Los seis tildes de construcción | Un botón que cambia su texto a «Fase marcada como hecha» |
| El «Confirmo que abrí el link» del borrador, y los 14 del chequeo | Interruptores |
| El «Estoy hablando con el dueño» de la agenda | Una casilla clásica |

Nada se rompe, pero cada pantalla se aprende de nuevo. El manual terminó
llamándolos *tilde*, *interruptor* y *casilla*.

### 8 · Todo control tiene nombre accesible — ✅ **se cumple**

Barrido sobre **once pantallas** —panel de inicio, ficha, evaluación, primer
contacto, toques, decidir la demo, refinar, borrador, chequeo, reentrada, envío y
agenda— buscando controles sin nombre accesible.

**Resultado: cero.**

> **Nota de método, porque acá es fácil equivocarse.** La primera pasada devolvió
> un control «mudo» en la pantalla de toques. Al inspeccionarlo resultó ser un
> **«Copiar bloque» adentro de un desplegable cerrado**: su texto no se lee
> porque no está renderizado, no porque le falte. Un barrido que se quede en la
> primera lectura reporta un problema que no existe — el mismo error que la
> corrida anterior cometió al revés.

---

## Lo que esta validación no pudo cerrar

| Qué | Por qué |
|---|---|
| Que el valor viejo de «Notas de marca» siga viajando invisible | Es invisible por diseño: no hay forma de verlo desde la interfaz del setter |
| El canal con el que se registra cada toque | El formulario no ofrece selector de canal; sólo se ve el resultado en el historial |
| La búsqueda real de horarios y la confirmación de la reunión | La búsqueda no está configurada; la confirmación no se dispara (toca un calendario real). Ver [H-17](HALLAZGOS-MANUAL-v3.md) |
| Que este veredicto sea reproducible commit por commit | El bloque de vocabulario **no está commiteado**. Ver [H-00](HALLAZGOS-MANUAL-v3.md) |

---

*Cerrado con los trece capítulos escritos y el recorrido entero navegado.*
