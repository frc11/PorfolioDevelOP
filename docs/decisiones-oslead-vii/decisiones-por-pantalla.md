# DECISIONES POR PANTALLA — LeadOS
### Lo que se cierra en la pasada de calidad · archivo vivo

> **Qué es.** A medida que Franco y la capa de planificación cierran una pantalla, acá queda **lo que se construye**, con su porqué. Es lo que después se convierte en sprints.
>
> **Cómo se usa.** Una sección por pantalla. Append-only: lo cerrado no se reabre sin razón nueva. Cuando estén las cinco de la cadena de calidad, se derivan los sprints de una.
>
> **Orden de la cadena de calidad:** `m6` → `mc2` → `m1` → `mc1` → `m14`.

---

## `m6` · "Decidí cómo va a ser la demo" — **CERRADA**

### El diagnóstico

Es la bisagra del recorrido: lo que sale de acá determina la demo entera. Tenía tres problemas.

**El setter hacía de parser.** Pegaba la respuesta completa del Gem y después transcribía a mano cuatro campos que ese texto ya traía. Trabajo puro sin criterio, en cada demo.

**La dirección visual se perdía.** La capacitación dice que el asistente del plan devuelve *"posicionamiento, paleta de colores sugerida, tipografía, tono de comunicación"*. `m6` no tenía campo para ninguno, y el bloque que llegaba a Claude Design contenía solo `CONCEPTO` y `SECCIONES`. **Claude Design elegía fuente y paleta por su cuenta** — el mecanismo exacto de "se nota que salió de un prompt".

**El chequeo de genérico llegaba tarde**, después de que el setter ya había cerrado el paso mentalmente.

### Lo que se construye

**1 · El ciclo pasa a ser de cuatro vueltas con el Gem, en la misma pantalla.**

| Fase | Qué produce |
|---|---|
| 1 · Lectura estética | Cómo se ve el negocio hoy, en 15 líneas. **Es la única fuente real de diferenciación** |
| 2 · Decisiones | Ángulo wow · secciones · CTA · tono · paleta · tipografía |
| 3 · Especificación | Borrador del documento de construcción |
| 4 · Caza de huecos | El documento definitivo, con los defaults tapados |

**Revelado progresivo, no pantallas nuevas.** Un prompt visible por vez; el siguiente aparece cuando el anterior se completó; los anteriores quedan colapsados y consultables. Da la sensación de paso a paso sin deshacer la poda de P6-B.

**2 · El pegado de cada fase es un gate de calidad.** El setter pega de vuelta la fase aprobada. Técnicamente no hace falta —el Gem recuerda— pero **para pegarla tiene que haberla leído**, y si corrigió algo la corrección viaja.

**3 · El encabezado etiquetado mata la doble transcripción.** El documento de la fase 4 arranca con `ANGULO:` `SECCIONES:` `CTA:` `TONO:` `PALETA:` `TIPOGRAFIA:` y después sigue en texto libre. **El setter pega una sola cosa y el producto lee el encabezado** para mostrar *"El brief pedía: Hero · Qué ofrecen…"* en `m13` y `m14`.

**4 · La lista de material a juntar, antes de todo.** Tres a cinco capturas del Instagram, el logo, dos o tres fotos del local, y una captura de la web si tiene. **Las imágenes se arrastran al chat del Gem, no a LeadOS** — resuelve la tensión con la restricción de subida de archivos sin infraestructura nueva.

**5 · El chequeo de genérico se muda a la fase 2.** Sobre seis campos, no sobre un documento entero.

**6 · El piso anti-slop lo inyecta el producto**, no el Gem. Va al final del documento, con un puntero al principio porque un agente pesa más lo que lee primero. Sale del módulo de *Ojo de diseño*, traducido a instrucción; si el módulo cambia, el piso cambia con él.

**7 · Se va "Título del brief".** Venía prellenado con el nombre del lead y no aportaba nada.

**8 · El CTA pasa a obligatorio.** Hoy es opcional mientras el título es obligatorio, y está al revés: el CTA es lo único que decide si la demo convierte. Con la Fricción de Prestigio explicada al lado.

**9 · "Concepto" → "Ángulo wow"**, con su definición. Es vocabulario que Toba ya aprendió y es accionable.

**10 · Se unifica el vocabulario.** La pantalla se llama "Decidí cómo va a ser la demo" y adentro todo dice `BRIEF`, "Guardar brief", "Título del brief". El retítulo quedó a medias.

### Lo que se sumó en la pasada de mejora

- **El contacto real es obligatorio en el documento**: el `wa.me` completo con número real y mensaje pre-cargado. Sin esto, Claude Design pone un placeholder y el chequeo *"los links y el botón de WhatsApp funcionan"* falla en cada demo.
- **"Lo primero que se ve"** entra como decisión explícita: qué entra en la primera pantalla de un celular sin scrollear. **Si eso no convence, no hay scroll** — y no estaba especificado en ningún lado.
- **"Lo que se deja afuera a propósito"**: para que la pasada posterior en Claude Code no "arregle" decisiones intencionales.
- **Tope de largo del documento**: 800 a 1.200 palabras. Más corto no alcanza; más largo pierde instrucciones en el medio.
- **La fase 3 es borrador; la fase 4 produce el definitivo.** Elimina la ambigüedad de tener dos documentos largos y no saber cuál se usa.
- **Idioma rioplatense con voseo** en el piso: el negocio es argentino y su cliente también.
- **Sin logo → nombre tipografiado, nunca un logo inventado.** Es lo primero que el dueño detecta.

### Lo que queda para el uso real

Los prompts del Gem son **texto redactado, no procedimiento validado**. Se ajustan cuando Franco corra el flujo. Los supuestos están registrados como **S-19 a S-24**, y el más importante es **S-20**: si la lectura estética sale igual para dos negocios del mismo rubro, la fase 1 no sirve y todas las demos se van a parecer.

### Dependencias

- El Gem de diseño **no existe**: hay que crearlo con este paquete.
- El bloque que `m6` le pasa al Gem tiene que incluir **la ficha entera** — reseñas crudas, qué vende y a qué precio, cómo habla el negocio de sí mismo. Sin eso el Gem no puede escribir textos reales. **A verificar contra el código.**
- Lo que `m6` produce alimenta a `mc1`, `m13` y `m14`. Los tres leen el encabezado etiquetado.

---

## `mc2` · "Refiná la demo antes de publicarla" — **CERRADA**

### El encuadre, corregido por Franco

`mc2` **no es una pasada de ojo: es una corrida automática.** El setter pega cinco prompts en orden, uno tras otro, sin evaluar en el medio. El bucle de detección-y-corrección del módulo *Dominar la IA* sigue vigente, pero **entra después** — en el chequeo previo al envío, no acá.

La función de esta pantalla es **subir el piso antes de que el ojo humano mire**, para que después haya menos que corregir.

### Lo que se construye

**Cinco prompts en vez de cuatro, y en este orden:**

| # | Prompt | Fundamento del lugar |
|---|---|---|
| 1 | **El texto** | Cambia el largo de los textos, y el largo cambia el layout |
| 2 | **La estética** | Responde al contenido definitivo. Máxima libertad creativa |
| 3 | **Motion y estados** | Se anima un layout que ya no se mueve |
| 4 | **Celular** | Es donde el prospecto la abre: lo último que se toca |
| 5 | **Verificación** | Después de celular, que es lo más probable que rompa algo |

**Dos prompts nuevos respecto de los tres actuales:**
- **El texto**, porque un copy derivado de una spec sale correcto pero plano, y *"suena como habla el negocio"* es uno de los tres criterios que mira Franco.
- **Verificación**, idea de Franco: prueba links y botones, caza rellenos, y **le pregunta al modelo qué le faltó** — lo único del recorrido que hace declarar el hueco en vez de esperar a que el setter lo descubra.

**Corrección al orden propuesto por Franco:** el copy va **antes** que la estética. Acomodar jerarquía y espaciado y después reescribir los textos desacomoda lo recién pulido. El resto del orden —motion, y celular al final— queda como él lo pidió.

**En la pantalla:**
- **Cinco fases, cinco tildes.** Hoy hay tres fases y cuatro prompts: el setter tilda "Calidad y motion" habiendo aplicado uno solo.
- **El bloque de arriba deja de ser copiable** y pasa a referencia plegada de solo lectura. El setter está en la misma conversación de Claude Design; ofrecerle el bloque de nuevo invita a empezar de cero. Con salida explícita si perdió el chat.
- **Se va el badge "GUÍA PRELIMINAR — EN VALIDACIÓN"**, que le dice al setter que desconfíe de sus propias instrucciones.
- **Se va la explicación duplicada del auto-reporte.**
- **Línea nueva arriba:** *"Estos cinco van seguidos, sin evaluar nada en el medio. Tu ojo entra después, en el chequeo final."*

**El preloader queda excluido del prompt de motion**, a propósito: es de la pasada de Franco en Claude Code.

### La frontera con la pasada de Franco — **DECIDIDA**

`mc2` se ocupa de **que esté bien**: contenido real, jerarquía, aire, celular, links que funcionan, motion sutil.
La pasada en Claude Code se ocupa de **que impacte**: preloader, micro-interacciones, el detalle que la hace sentir cara.

El motion sutil de entrada se queda en `mc2` porque una página sin nada de movimiento se lee estática, **y Franco aprueba la versión del setter, no la suya**.

### Anotado para cuando lleguemos a `m14`

El paso donde el setter usa su ojo entrenado **ya existe: es el chequeo final.** Ahí van los dos tests del módulo de ojo de diseño —entrecerrar los ojos, cinco segundos— y ahí tiene sentido la idea de Franco de que **al marcar un defecto aparezca el prompt que lo arregla**.

### Costo — abierto

Cinco corridas por demo más la construcción. **Es la parte más cara del pipeline y no está medida.** La hipótesis del brief (construcción con el modelo más capaz, refinamiento con el intermedio) es razonable por criterio —inventar pide más que ejecutar— pero **no se sabe qué modelos ofrece Claude Design**. Se mira junto con S-01 en la demo de prueba.

**Cinco es el techo.** Cada prompt más es tiempo y costo, y a partir de cierto punto el modelo deshace lo que hizo antes.

### Supuestos que suma

**S-25** a **S-29**, en el archivo de supuestos. El de mayor varianza es **S-27**: el prompt de estética con libertad creativa puede mejorar o empeorar, y es el único de los cinco donde el resultado no es predecible.

---

## `m1` · La ficha — **CERRADA, con una decisión pendiente de OK**

### El encuadre

**Es la pantalla más importante del recorrido.** Acá se produce el insumo del que sale todo lo demás: la lectura estética, las decisiones de la demo, el documento de construcción y los textos de la página. Si acá entra genérico, sale genérico por bueno que sea el Gem.

Por eso el criterio es el opuesto al del resto: **acá la fricción es deseable.** No se puede llenar de un renglón. El resto de las pantallas buscan fluidez; esta busca exhaustividad.

### Lo que no se toca

Los textos de ayuda son lo mejor escrito del producto: no etiquetan campos, **enseñan**. *"El dueño suele hablar en primera persona y responder él mismo; un CM postea prolijo y genérico."* · *"La misma queja 2+ veces vale oro; las de 5 estrellas vacías no suman."* Y el *"no los inventes"* aparece en los dos lugares donde el setter estaría tentado. Eso es capacitación puesta donde se usa y se conserva entero.

### El cambio grande: reorganizar por fuente, no por categoría

Hoy los campos se agrupan por tema —identidad, presencia digital, reseñas, contenido, señales operativas—. Pero el setter trabaja **por pestaña abierta**, y cada fuente alimenta campos que hoy están en lugares distintos: termina saltando entre pestañas cinco o seis veces.

**Cuatro bloques, uno por fuente, solo el activo desplegado:**

| Bloque | Qué se saca | Qué se descarga **antes de salir de ahí** |
|---|---|---|
| **1 · Instagram** | Quién lo maneja · cómo habla el negocio de sí mismo · cada cuánto publica y si responde · qué vende y a qué precio · nombre del dueño y antigüedad | Logo · 3-5 fotos de las mejores publicaciones · captura del perfil |
| **2 · Google / Maps** | Reseñas crudas textuales · **dirección física** · **horarios reales** · **el contacto exacto del botón** | Captura de la ficha · 1-2 fotos del local |
| **3 · La web actual** *(si tiene)* | **Cómo se ve hoy**, en una línea | Captura |
| **4 · Cierre** | Otras redes · otras observaciones · el veredicto | — |

**Esto resuelve el doble viaje.** Hoy el setter junta material en la ficha (como URLs para volver después) y **vuelve a juntarlo** en `m6` para pegárselo al Gem — con el contexto ya perdido. Bajar tres capturas mientras ya estás mirando cuesta un minuto; volver a entrar, encontrar el perfil y elegir cuáles cuesta cinco y sale peor.

**La carpeta de material** cierra el bloque 4: una lista de lo que tiene que estar descargado, con tildes. Los archivos viven en el disco del setter, **no en LeadOS** — respeta la restricción de subida de archivos sin infraestructura nueva, y la lista es el gate.

### Cuatro campos nuevos, todos porque el Gem los necesita

- **Dirección física** — para una sección de cómo llegar, y para el pie de página.
- **Horarios reales** — hoy están sueltos dentro de "señales operativas".
- **El contacto exacto al que apunta el botón.** Decidimos que el documento del Gem lleve el `wa.me` completo. La ficha no lo pide, y ya se vio una pantalla diciendo *"Sin teléfono cargado en la ficha"*. **Sin ese dato el CTA de la demo no funciona y revienta en el chequeo final, cuatro pantallas después.**
- **Cómo se ve la web actual** — una línea. Es material de lectura estética y de argumento comercial.

### Dos umbrales, no uno

El gate de hoy pregunta *"¿alcanza para que el Evaluador puntúe?"*. Con el Evaluador afuera, las preguntas son otras y son dos:

- **¿Alcanza para decidir?** Hay un dolor identificable, un dueño identificable, y el negocio está vivo.
- **¿Alcanza para diseñar?** Hay logo o nombre, al menos tres imágenes usables, colores inferibles, tono legible, y un contacto real.

Un lead puede pasar el primero y fallar el segundo: dolor clarísimo y cero material visual. **Hoy eso se descubre cuatro pasos después, con la evaluación y las decisiones ya invertidas.**

**Y el gate sube de lugar.** Hoy está al final, después de ~2.000 px de formulario: el setter descubre qué le falta recién cuando terminó de scrollear. Con la reorganización por fuente, **cada bloque declara lo que le falta a él** — el gate deja de ser una caja al final y se vuelve el estado de cada tramo.

### El corte de los diez minutos, con salida

De la capacitación: *"si en ~10 minutos no hay información suficiente para personalizar, el lead pasa al final de la lista. **No producimos demos genéricas.**"* No está en el producto.

Entra arriba de todo, y **con su salida**: un botón de *"no hay material acá — al final de la lista"* con motivo.

**Un gate sin salida produce cumplimiento falso.** El setter que no puede llenar la ficha y no tiene otra opción va a escribir cualquier cosa con tal de avanzar, y eso es peor que no tener gate: convierte el filtro en un trámite.

### Lo chico

- **"Guardar ficha" con "se guarda solo mientras escribís" al lado.** Es la única pantalla que quedó así en todo el producto.
- **"CONTEXTO DEL LEAD"** ocupa una tarjeta entera para repetir dos palabras que ya están en el encabezado.
- **"Material para construir la demo" es una sub-tarjeta dentro de REGISTRO.** Conceptualmente es otra cosa —alimenta a Claude Design, no a la decisión— y con la reorganización por fuente deja de existir como bloque aparte: su contenido se reparte donde se consigue.

---

### ⚠️ DECISIÓN PENDIENTE DE OK — sacar el Evaluador

**Propuesta:** eliminar la pantalla de evaluación como paso con IA. El veredicto se queda; lo registra el setter en el cierre de la ficha.

**El fundamento, del propio brief (§3, Etapa 1):**

> *"La herramienta acompaña ese juicio con la munición (qué mirar, qué preguntas hacerse) y registra el veredicto. **No lo automatiza: es criterio, y el criterio es del setter.**"*

Un chat de IA que decide si el negocio avanza **es** automatizar el criterio. Y hay dos evidencias:

1. **La complacencia es estructural**, no un defecto de este Gem: es la trampa que el módulo *Dominar la IA* enseña a evitar. Preguntarle a un modelo "¿procedo?" tiende a devolver que sí.
2. **4% de descarte, 96% de avance.** El paso que el brief llama *"el más valioso de todo el flujo"* hoy no filtra.

**Lo que reemplaza al Evaluador:** los dos umbrales de la ficha, que son **estructurales** —el producto los verifica— en vez de consultivos.

**Lo que arrastra:**
- El bloque de evaluación deja de ser insumo del Gem. Su contenido ya está en la ficha.
- *"Mi criterio · descarte vs avance"* del panel pasa a medir decisiones del setter, **que es lo que debería medir**.
- Es una etapa menos del recorrido: menos pantallas, menos copiar y pegar, menos ida y vuelta con una herramienta.

**Por qué necesita premortem y OK explícito:** toca transiciones de estado y elimina una etapa. Cae bajo la regla del §11 del brief — *"el motor no se toca sin premortem: transiciones, gates, claims de concurrencia, schema"*.

---

## `mc1` · "Construí la demo en Claude Design" — **CERRADA**

### Es la pantalla que más cambia

Con el Gem produciendo un documento de 800-1.200 palabras, `mc1` deja de ser *"seguí esta guía de nueve puntos"* y pasa a ser **un solo paso: pegá esto y esperá**.

Los nueve bullets de hoy —Estructura, Personalización, Assets reales— **son instrucciones que ya están adentro del documento**, mejor dichas y más específicas. Explicárselas al setter no lo ayuda: lo hace dudar de si tiene que pedirlas aparte.

### El bloque deja de ser contexto y pasa a ser la carga

Hoy vive dentro de `CONTEXTO DEL LEAD`, en una tarjeta chica que **se corta con degradado a las ocho líneas**. Con mil palabras adentro, eso significa que el setter pega algo que no puede leer.

**Pasa a ser el centro de la pantalla**, legible entero, con un solo botón de copiar. El rótulo `CONTEXTO DEL LEAD` es falso acá: no es contexto, es lo único que se manda.

### Tres capas, dos fijas y una variable

```
[1 · PROMPT BASE]      fijo, lo pone el producto
[2 · EL DOCUMENTO]     variable, lo produjo el Gem en su fase 4
[3 · PISO DE CALIDAD]  fijo, lo pone el producto
```

El setter copia **una sola cosa**. Las tres partes se ven rotuladas adentro del bloque para que entienda qué está mandando, pero el botón copia todo junto.

### El prompt base

```
Construí una página web de una sola pantalla (one-page) siguiendo el
documento que va abajo. El documento es la especificación completa: tiene
todo lo que necesitás.

CÓMO TRABAJAR

Construí la página entera de una sola vez, completa y funcionando. No la
armes por partes ni me vayas mostrando avances parciales.

No me hagas preguntas. Quien te está pegando esto no es diseñador ni
programador y no va a poder contestarlas. Si algo del documento te queda
ambiguo, tomá la decisión más conservadora, seguí adelante, y anotala al
final.

Todo va en una sola página. El menú lleva a secciones de esta misma
página y funciona; nunca lleva a otra página.

No inventes datos. Si el documento no trae un dato, no lo completes:
dejalo afuera y anotalo al final. Un precio, un horario o una reseña
inventada es lo primero que el dueño detecta.

Al final de este mensaje hay un PISO DE CALIDAD no negociable. Leelo
antes de escribir una línea. Si algo del documento lo contradice, gana
el piso.

CUANDO TERMINES

Devolveme, en una lista corta:
  - Las secciones que construiste, en orden.
  - Lo que el documento pedía y no pudiste hacer, con el motivo.
  - Los datos que te faltaron.
  - Las decisiones que tomaste vos porque el documento no las definía.
```

**La prohibición de preguntar es la parte más importante.** Si Claude Design devuelve *"¿preferís un carrusel o una grilla?"*, el setter se traba —no es diseñador— o contesta cualquier cosa. Obligarlo a decidir por el camino conservador y declararlo lo destraba sin pedirle criterio que no tiene.

**La lista de cierre convierte la verificación en comparación.** El setter no juzga si la demo está bien: **compara la lista de secciones que devolvió el modelo contra la línea `SECCIONES:` del documento.** Es mecánico y no necesita ojo.

### Lo que queda en la pantalla

1. **El bloque de tres capas**, legible entero, un botón.
2. **Qué hacer mientras espera:** no tocar nada, no agregar instrucciones sueltas, dejar que termine.
3. **Qué mirar cuando termine:** comparar la lista devuelta contra `SECCIONES:`. Si falta alguna, **una sola instrucción para agregarla** — y ahí va la regla del módulo: *"si le pedís cinco cambios juntos, hace tres mal"*. **Refinar una página incompleta es pulir algo que va a cambiar.**
4. **Un tilde, no tres.** Las tres fases eran de cuando construir era artesanal. Con un prompt único hay una sola cosa que marcar.

### Lo que se va

- Los nueve bullets de guía: ya viajan adentro del documento.
- El badge **"GUÍA PRELIMINAR — EN VALIDACIÓN"**.
- La explicación duplicada del auto-reporte.
- Las tres filas que dicen *"Marcá esta fase cuando la termines"* en el texto más grande de la fila, con el nombre de la fase chico y gris arriba — jerarquía invertida que desaparece con el tilde único.

### Abierto

- **Qué configuración de Claude Design usar.** El brief dice que *"se elige la configuración correcta antes de abrir el proyecto (no es indistinta)"* y nadie sabe cuál es. → **S-29**, junto con qué modelos ofrece.
- **S-30** · Que Claude Design acepte prompt base + documento + piso en un solo mensaje sin cortar. Si hay tope de largo, hay que recortar el documento o partir el envío — y partirlo contradice el diseño entero.

---

## `m14` · El chequeo final — **CERRADA**

### Lo que no se toca

Es la pantalla mejor construida del producto. La partición en criollo —**"ESTO LO REVISÁS VOS"** / **"ESTO LO MIRA FRANCO"**— implementa los seis criterios validados, repartidos por quién puede juzgarlos, y **es la frontera de delegación futura ya escrita**. Cada obligatorio trae su arreglo nombrando la fase exacta a la que volver. Y el texto del gate explica la consecuencia, no la regla: *"un check falso vuelve como rechazo y enfría al negocio que espera"*.

### El cambio de fondo: ver y verificar son modos opuestos

Un checklist entrena obediencia, no percepción: se tilda sin mirar. **Verificar es cerrado e ítem por ítem; ver es abierto.** La pantalla hoy pide juzgar y no enseña a mirar.

**Entra "LA PRIMERA MIRADA", antes del checklist, y no es un checklist.**

Tres gestos, sacados del módulo de ojo de diseño y hoy ausentes de todo el producto:

| Gesto | Qué revela |
|---|---|
| **Entrecerrá los ojos** y mirala borrosa | Si aun así se entiende qué manda en cada sección, hay jerarquía. Si es una masa pareja, no la hay |
| **Cinco segundos** en el inicio, y cerrá los ojos | ¿Sabés qué ofrece y qué tenés que hacer? Si no, el hero no está claro |
| **Leela como si fueras el dueño** | ¿Te sentirías representado, o es una plantilla con tu nombre encima? |

**Y un campo libre:** *"¿Qué es lo primero que te llamó la atención, para bien o para mal?"*

**Por qué el campo libre y no otro tilde:**
- No se puede completar sin mirar.
- Obliga a **nombrar** lo que ve, que es como se entrena el criterio.
- Le da a Franco una señal directa: si escribe "nada" todas las veces, no está mirando.
- Lo que anote lo va a encontrar en la lista de abajo, **así que el checklist se vuelve confirmación en vez de descubrimiento**.

**Los delatores dejan de ser interruptores.** Pasan a ser la lista de caza de esta primera mirada: *"mientras mirás, cazá estos cuatro"*. Resuelve de paso la polaridad invertida — hoy conviven catorce interruptores idénticos donde encendido significa "está bien" en diez y "vi este defecto" en cuatro.

### Tres estados por punto, no dos

**Sin revisar → lo revisé y está bien → lo revisé y está mal.**

Hoy la instrucción de arreglo aparece **para todo lo que no está tildado**: un chequeo recién abierto muestra diez arreglos para problemas que el setter todavía no buscó. **"Sin verificar" se presenta como "roto".**

Con tres estados:
- La pantalla inicial queda limpia.
- Se distingue lo no mirado de lo fallado.
- **El arreglo y su prompt aparecen solo en el tercer estado.**

**Esto convierte `m14` en el bucle de detección-y-corrección del módulo *Dominar la IA*:** el setter detecta con el ojo, el producto le da la instrucción precisa, vuelve a Claude Design y arregla. *"Detección más instrucción precisa: ese es el bucle."*

### Los cuatro criterios que faltaban — y bloquean

**Decisión de Franco: lo más importante es que no se vean genéricas.** Por lo tanto entran como obligatorios, no como delatores:

| Criterio | Cómo se verifica | El arreglo |
|---|---|---|
| **Hay jerarquía** | El test de entrecerrar los ojos | Prompt de estética en Claude Design |
| **Hay aire** | ¿Está todo apretado contra los bordes y entre sí? | Prompt de estética |
| **La tipografía tiene carácter** | ¿Parece la fuente que viene por defecto? | Prompt de estética, nombrando la del documento |
| **El botón invita** | ¿Dice "Reservá tu lugar" o dice "Contactanos"? | Prompt de CTA, con el texto del documento |

**El límite que se impone:** bloquea lo que el setter puede arreglar. Los cuatro tienen prompt ejecutable, así que bloquean. **Un obligatorio sin arreglo ejecutable solo produce checks falsos** — el daño que el propio texto del gate advierte.

*(Máximo tres colores sube de delator a obligatorio por el mismo motivo. Alineación y consistencia se queda como caza de la primera mirada: es lo más difícil de nombrar para alguien sin ojo entrenado.)*

**Consecuencia comercial, para tenerla presente:** cuantos más bloqueen, más demos vuelven a Claude Design antes de llegar a Franco. Menos trabajo suyo, más tiempo del setter.

### La estructura final

```
LA PRIMERA MIRADA          ← sin tildes. Tres gestos + caza de delatores
                             + el campo libre
─────────────────────────
ESTO LO REVISÁS VOS        ← tres estados cada uno
  ¿Funciona?               carga · links y botón · celular
  ¿Es de este negocio?     datos y assets reales · sin relleno ·
                           dice lo que el documento pedía
  ¿Se ve profesional?      jerarquía · aire · tipografía · tres colores ·
                           el botón invita · se entiende qué hacer
─────────────────────────
ESTO LO MIRA FRANCO        ← tres estados cada uno
                           no se nota que la hizo una IA ·
                           el texto es de este negocio ·
                           suena como habla el negocio
```

**La partición de dos grupos se conserva** —es la frontera de delegación— pero el primero se subdivide por **qué mirás**, no por quién juzga. Y crece: con los gestos, el setter puede juzgar más de lo que se suponía, y **Franco tiene menos que cazar**.

### Lo chico

- **Decir que enviar también guarda.** Hoy no se dice.
- **Agrupación con nombre para lectores de pantalla:** hoy ninguno de los catorce controles la tiene.

---

## Regla transversal · Las municiones

**Hay tres tipos mezclados bajo el mismo tratamiento plegado:**

| Tipo | Qué es | Regla |
|---|---|---|
| **Salida** | Qué hacer cuando algo falta o falla | **Nunca se pliega.** Es lo que destraba |
| **Ejemplo** | Cómo se ve bien hecho | Se pliega. El título dice de qué es el ejemplo |
| **Fundamento** | Por qué importa | Se pliega. El título dice qué vas a entender |

**Y la regla madre: el título de un plegable tiene que prometer lo que hay adentro.**

Hoy la salida de *"pedíselo a Franco y lo vas a poder abrir desde acá"* —lo único que destraba el primer punto de frenada del recorrido— vive plegada bajo **"Qué es y cómo se usa"**, un título que no promete nada. **Por eso nadie la abre.**

Aplicar esta regla es barato y toca todas las pantallas.

---
---

# PARTE 2 · La pasada de gestión

> Ocho superficies que no deciden la calidad de la demo pero deciden si el setter puede trabajar sin trabarse.

## El panel · "Tu día" — **CERRADA**

**El hallazgo grande: la lista de novedades contiene trabajo, no noticias.**

*"Franco aprobó tu demo — Enviá el link ya, recién aprobada"* y *"Franco pidió cambios — Reabrí la construcción y rehacé"* **no son avisos: son tareas**, y de las más urgentes del embudo. Están en un bloque pasivo mientras el foco apunta a otro lead.

**Se resuelve moviendo, no rediseñando:** una demo aprobada y un rechazo **entran a la cola de trabajo**, no a novedades. Novedades queda para lo que de verdad es noticia (te reasignaron un lead, se venció una postergación) y baja al final de la pantalla.

Eso arregla de un saque tres hallazgos: el rechazo que no aparecía en ninguna parte del panel, el bloque de novedades que ocupaba más que el foco y la cartera juntos, y el momento más caliente del embudo sentado en una lista pasiva.

**Lo demás:**

- **El foco arranca arriba.** Hoy se gastan ~250 de 900 px en el eyebrow `LEADOS` —que ya está en la barra lateral y en el header, **tres veces en una pantalla**— y un subtítulo que le explica el producto a alguien que lo usa todos los días.
- **La fila de próximo paso deja de parecer un botón.** Hoy ocupa todo el ancho, tiene borde y flecha, y está arriba del botón real, que mide un tercio. **La etiqueta parece más un botón que el botón.**
- **Dos números, no cuatro.** *Para trabajar* (accionable) y *en cartera* (total). "74 activos de 76" no habilita ninguna acción.
- **"Mi criterio · descarte vs avance" dice para qué sirve.** Un número sin referencia decora. Con el Evaluador afuera pasa a medir decisiones del setter — que es lo que debería medir — y **se espera que suba**: hoy 96% avanza porque una IA complaciente dice que sí.
- **La navegación:** una sección "Trabajo" con un solo ítem, llamado "Cartera", que lleva a "Tu día", y **resaltado como activo en todas las pantallas**. O el ítem abre la cartera, o no existe.
- **El foco se suelta.** Hoy hay tres call-sites para anclarlo y **ninguno para soltarlo**: queda clavado en un negocio que no estás trabajando. Y conviven dos chips con nombres parecidos — *"Fijado por vos"* y *"Fijado mientras lo trabajás"*.

---

## La cartera — **CERRADA**

**76 tarjetas idénticas, 10.000 px, sin agrupación.** Un lead que hay que trabajar hoy se ve igual que uno pausado tres semanas.

**Se agrupa por turno**, que es un concepto que el producto ya tiene y no usa acá:

```
TE TOCA A VOS          ← abierto por defecto
LE TOCA AL NEGOCIO     ← plegado, con la fecha de vuelta
LE TOCA A FRANCO       ← plegado
CERRADOS               ← plegado
```

Es el "divide and conquer" con el vocabulario que P11 ya introdujo, y **convierte el filtro por defecto en la respuesta a "¿qué hago ahora?"**.

**En cada tarjeta:** se va el badge de estado —dice lo mismo que la fila de próximo paso, en jerga— y **los tres botones de ícono sin rótulo se rotulan**. Uno de ellos es el único control sin nombre accesible de todo el producto.

---

## `m4` · El opener — **CERRADA**

- **El ángulo wow viaja hasta acá.** Ver el hueco G8 abajo: es el cambio de más impacto comercial de esta pasada.
- **Un lead postergado muestra su fecha de vuelta.** Hoy "Postergado Vencido" y "Postergado Futuro" son **visualmente idénticos**, sin una sola fecha en pantalla.
- **Un postergado no abre en `m4` diciendo "TU PASO AHORA".** `derivarPantalla` no tiene rama para POSTERGADO.
- **El bloque rojo de "nunca cotizás" deja de ser rojo de error.** Es la regla más importante del rol, no un error, y aparece repetida en `m4` y `m5`. Tratamiento propio, y una vez por lead, no por pantalla.

## `m5` · El seguimiento — **CERRADA**

- **Una sola numeración de toques.** Hoy dice "Toques: 1 de 3" arriba y "Mensaje base del toque 2 de 3" ciento cincuenta píxeles más abajo.
- **Los cuatro resultados dejan de pesar igual.** *Rechazó* y *Respondió* tienen consecuencias opuestas y hoy son cuatro tarjetas idénticas en una grilla.
- **La fecha de postergación se guarda como el día elegido**, no el anterior, y **viaja fuera de esta pantalla**.
- **El contador de DMs cuenta mensajes, no registros.**
- **Una sola palabra para pausar/postergar** — hoy son dos conceptos distintos en la base con cuatro nombres en pantalla.

## `m13` · El borrador — **CERRADA**

- **El error en español, colgado del interruptor que falla**, no del campo de URL que está bien. Y **no se arregla traduciendo**: el mensaje en español ya existe y Zod lo descarta para ese tipo de issue.
- **El interruptor lleva asterisco**; hoy lo obligatorio se marca como opcional y lo opcional como obligatorio.
- **Con el lead en RECHAZADA aparece "Cambiar el link del borrador".** El control **ya existe en esta misma pantalla en estado CONSTRUCCIÓN**: no hay que construir nada, hay que dejarlo visible. Hoy la guía de rechazo dice *"re-publicá el draft"*, te manda acá, y acá no hay un solo botón.
- **NUEVO — un chequeo antes de guardar:** *"¿Exportaste después del último refinamiento?"* Ver hueco G4.

## `m15` · El envío — **CERRADA**

Es de las mejores pantallas. Dos cambios:
- **El mensaje incorpora el ángulo wow** (G8).
- **La pantalla de espera dice qué está haciendo Franco.** Ver `espera`/`revision`.

*(El Loom queda como decisión abierta de Franco: si entra, cambia esta pantalla y cambia lo que él hace al aprobar.)*

## `m16` · La agenda — **CERRADA**

- **El check del dueño gatea de verdad la búsqueda de horarios.** Hoy se ofrecieron tres turnos con el check apagado, y el paso 1 de la munición dice que *"agendar con alguien que no decide quema un turno de Franco"*.
- **El error de Cal.com sale traducido**, con qué hacer y a quién avisar.
- **Con la reunión ya agendada, la munición se pliega.** Una pantalla cerrada no necesita el instructivo de cómo hacerla.

## Los estados terminales — **CERRADA**

- **`espera` y `revision` dicen qué está haciendo Franco.** Hoy las dos dicen "Le toca a Franco" con el mismo cuerpo palabra por palabra. Que las dos digan eso es correcto —el turno es de él— pero en una revisa la demo y en la otra tiene que cargar el link permanente. **El dato existe en `m15` y no viaja.**
- **Las dos muestran el link del borrador y una referencia de plazo.**
- **`archivo` recupera la tira de completadas**, que es la única pantalla que no la tiene.

---
---

# PARTE 3 · La pasada de síntesis — lo que solo se ve mirando el conjunto

## G1 · El material se baja y después no se encuentra

`m1` le dice al setter que descargue logo, fotos y capturas. **Nadie le dice dónde.** Con los nombres por defecto en la carpeta de descargas, cuando llegue a `m6` no va a saber cuáles eran.

**Una carpeta por negocio, con el nombre del negocio**, dicha en `m1` y nombrada en `m6`: *"abrí la carpeta de Barbería El Faro"*. Cuesta una línea de copy y salva el paso más caro de la ficha.

## G2 · El ángulo wow se decide y nunca se usa · **el de más impacto comercial**

Se define en `m6` como *"qué le mostramos para que piense «esto es exactamente lo que necesito»"*, viaja a Claude Design, y **desaparece del recorrido**.

Pero el ángulo wow **es el gancho de la conversación**, no solo de la página:
- El **opener** tendría que rozarlo sin mostrar el link.
- El **segundo mensaje**, el que lleva la demo, tendría que nombrarlo: *"te armé algo pensando en esto que vi"* pega distinto que *"te armé algo para que veas cómo podría verse"*.
- El **toque** después de silencio puede insistir por ahí.

Hoy los tres mensajes son plantillas que no saben nada de la demo que acompañan. **El mismo dato, ya producido, sirve tres veces más.**

## G3 · Nadie verifica que lo publicado sea lo refinado

Entre `mc2` y `m13` el setter exporta y sube. **Si exportó antes del último prompt de refinamiento, publica una versión vieja y nada lo detecta.** El chequeo final se hace sobre el borrador publicado, así que verifica la versión equivocada sin saberlo.

Un chequeo de una línea en `m13`, antes de guardar. Es la clase de falla silenciosa que aparece tres demos después y nadie entiende por qué.

## G4 · El rechazo no dice qué check estaba falsamente en verde · **el de más impacto a largo plazo**

Cuando Franco rechaza, escribe Qué/Dónde/Arreglo. Pero el setter ya había marcado catorce puntos en verde. **Si Franco rechaza por algo que estaba tildado, eso es un check falso — y es la señal más valiosa que existe sobre la calibración del setter.**

Hoy no se registra en ningún lado.

**Que el rechazo pueda apuntar al check que falló** hace tres cosas: le enseña al setter exactamente dónde su ojo no coincide con el de Franco, le da a Franco el dato de cuándo puede delegar la revisión, y convierte la frontera del §12 en algo medible en vez de una intuición.

**Es el mecanismo que hace posible que Franco algún día suelte la revisión.**

## G5 · No hay una sola demo buena para mirar

La munición tiene *"Ver ejemplo de una ficha bien hecha"*. **No hay ningún ejemplo de una demo bien hecha.**

El producto le pide al setter que produzca calidad y nunca le muestra la vara. Franco tiene páginas hechas. **Tres links en la munición de `mc1` y `m14` son la librería del brief en su forma más barata**, y valen más que cualquier descripción de criterio.

## G6 · El setter no ve su propia calidad

"Mis números" muestra leads activos y descarte vs avance. **Nada sobre cuántas demos volvieron rechazadas, ni por qué, ni cuál es el defecto que más se le repite.**

Es su único ciclo de mejora y no existe. Y con G4 resuelto, el dato ya estaría ahí.

## G7 · El tiempo no se mide

El brief dice 20-30 minutos por demo. **Nunca se cronometró con este pipeline**, y ese número calibra el modelo de negocio entero. Dos marcas de tiempo —cuándo se abre la ficha, cuándo se envía— lo dan gratis.

## G8 · La munición no distingue al novato del experto

Un setter en su demo veinte no necesita *"por qué importa"*. Hoy todo se pliega igual y para siempre.

**Versión barata: los bloques de fundamento recuerdan si los cerraste.** Las salidas nunca se pliegan (regla ya decidida).

## G9 · La demo enfriada no queda disponible para nadie

El brief dice que las demos de quienes no contestaron son material para Peter, presencialmente. El producto no marca ninguna demo como *hecha y disponible*. Está diferido y se registra acá para que no se pierda.

---
---

# PARTE 4 · El sistema de interacción

> Aplica a las catorce superficies. No es una pasada estética: es lo que hace que el producto se lea como una aplicación y no como un formulario largo.
>
> **Y se mide con nuestra propia vara.** El piso de calidad que le exigimos a las demos —jerarquía, aire, un solo acento, superficies planas— hoy el producto lo incumple.

## S1 · Un solo nivel de superficie

Hoy hay hasta cuatro: página → tarjeta de sección → sub-tarjeta → campos. En `m5`, la munición contiene un bloque rojo que contiene una tarjeta con su propio botón de copiar.

**Las secciones dejan de ser tarjetas y pasan a ser bandas:** rótulo, contenido, aire. Separadas por espacio, no por borde y fondo.

**Una sola cosa lleva tarjeta: el paso activo.** Eso la convierte en la única superficie elevada de la pantalla, y por lo tanto en la que el ojo busca primero.

## S2 · Avance por completitud, no por clic

Cada pantalla larga se parte en bloques secuenciales. **El siguiente se abre solo cuando el anterior se completa.** Los anteriores quedan plegados y consultables; el siguiente no aparece hasta que le toque.

**Nunca hay un botón "siguiente".** Un asistente de siguiente-siguiente agrega clics que no aportan información, y eso contradice el principio de fluidez.

Se aplica a: `m1` (cuatro fuentes), `m6` (cuatro fases del Gem), `mc2` (cinco prompts), `m14` (primera mirada → checklist).

## S3 · La acción principal es fija

**Una acción primaria por pantalla, en el mismo lugar, siempre alcanzable** — barra inferior fija.

Hoy el botón está al final de todo el contenido: en `m1` a 2.700 px del tope, en `m14` después de catorce controles. **Es el cambio que más rápido convierte la lectura de "documento" en "aplicación".**

La barra además muestra por qué la acción está bloqueada, cuando lo está. Eso resuelve el botón deshabilitado sin motivo adyacente.

## S4 · Orientación permanente

Una franja fina y persistente con **el recorrido entero**: lo hecho, lo actual y lo que falta.

Hoy el producto muestra el pasado —`COMPLETADAS`— y nunca el futuro. **El valor número dos del brief es "no tener que pensar qué sigue", y la única pregunta que la pantalla contesta hoy es "qué hiciste".**

Reemplaza a la tira de completadas, que pasa a ser la mitad izquierda de la franja.

## S5 · Un acento, reservado a la acción

Hoy el cian está en la navegación, los links, los bordes, los badges, los botones, los chips y los rótulos activos.

**El acento se reserva para la acción principal.** Todo lo demás: neutros con tres niveles de tinta. Es la misma regla del piso anti-slop, aplicada al producto que la exige.

## S6 · Jerarquía por consecuencia

Lo que decide más, pesa más.

Hoy pasa al revés en varios lugares: la etiqueta del próximo paso parece más un botón que el botón; las tres filas de fase dicen *"Marcá esta fase cuando la termines"* en el texto más grande mientras el nombre de la fase va chico y gris; los cuatro resultados de `m5` —con consecuencias opuestas— son cuatro tarjetas idénticas.

## S7 · Menos rótulos, más contraste entre ellos

`CONTEXTO DEL LEAD` · `MUNICIÓN` · `REGISTRO` · `COMPLETADAS`, los cuatro en mayúsculas espaciadas del mismo peso, aunque solo uno pide acción.

**`REGISTRO` es lo único que exige hacer algo: se distingue.** El resto baja de peso o desaparece cuando su contenido ya se explica solo.

Y `CONTEXTO DEL LEAD` se elimina como rótulo: significa dos cosas distintas según la pantalla —la ficha del negocio en una, el bloque copiable en otra— y en `mc1` es directamente falso, porque ahí **es la carga, no el contexto**.

## S8 · Densidad calibrada al momento

El paso activo respira; lo consultable se comprime; lo cerrado se pliega.

Hoy la densidad es pareja de arriba a abajo, y por eso una pantalla de trabajo y una pantalla ya terminada se ven igual de cargadas.

---

**Orden de construcción:** S1, S5 y S7 son transversales y baratos — se hacen una vez y aplican a las catorce. S2, S3 y S4 tocan estructura y van con las pantallas. S6 y S8 son la pasada final.
