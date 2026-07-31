# LA MUNICIÓN DEL PROCESO — cadena completa de prompts
### develOP · construcción de demos · borradores para curar

> **Qué es esto.** Toda la cadena de prompts del proceso de hacer una demo (brief v3, §6), con **qué modelo corre cada uno, con qué esfuerzo, y por qué**. Es la munición de la herramienta: lo que el setter copia y pega.
>
> **Por qué se puede trabajar ahora.** Esta cadena pertenece al proceso de construir, no a las pantallas del panel. La poda no la afecta: cualquiera sea el resultado del recon de factibilidad, estos prompts se necesitan igual.
>
> **La limitación honesta.** Están escritos sin haber visto ninguna página de develOP. La artesanía general es transferible; **la estética de ustedes no**. Todo lo que dependa del gusto propio está marcado `[FRANCO]`.
>
> **La regla que gobierna toda la munición.** La herramienta **guarda el texto del prompt y recibe el link que vuelve. Nada más.** No replica la interfaz de Claude Design, no asume sus modos internos, no modela su estado. Si Claude Design cambia mañana, se actualiza un texto, no una pantalla. *(Brief v3, §19.2 — es la lección que ya les costó seis pantallas.)*

---

## Parte 0 · La plomería, que hay que confirmar antes

**SUPUESTO A VERIFICAR — de esto depende que el paso final exista.** Para que Claude Code pueda correr sobre la demo, la página tiene que estar en archivos locales:

1. **Claude Design** construye la demo.
2. Los archivos se **exportan a una carpeta local**.
3. **Claude Code** corre el skill sobre esa carpeta.
4. La carpeta se **arrastra a Netlify Drop** (que toma carpetas) y queda el link.

Si esa exportación no existe o es engorrosa, la corrida unificadora no puede vivir en Claude Code y hay que replantearla como un último prompt dentro del propio chat de Design — **más débil, porque ahí no puede verificar que la página no perdió secciones**, que es justamente lo que protege a un setter que no va a notar una regresión.

**Pregunta concreta:** ¿se puede bajar el proyecto de Claude Design como archivos?

---

## Parte 1 · El mapa de la cadena

| # | Paso | Dónde corre | Modelo | Esfuerzo | Por qué ese nivel |
|---|---|---|---|---|---|
| **P0** | Dirección: leer el material y decidir la página | Chat de Claude | **Opus 5** | alto | **El paso que más se beneficia del modelo caro.** Es juicio estético y comercial sobre material desordenado (screenshots, reseñas, logo). Una dirección equivocada no la arregla ningún constructor; una buena dirección sobrevive a un constructor mediano. |
| **P1** | Creación: la primera versión completa | Claude Design | **Opus 5** | alto | Construye estructura y estética de una sola vez, y todo lo que sigue parte de acá. Pero **ojo**: su calidad depende más de que P0 le haya dado contenido real que del modelo. |
| **P2** | Secciones: el roadmap prompt por prompt | Claude Design | **Sonnet 5** | alto | Ejecuta una dirección ya decidida sobre contenido ya provisto. Es artesanía dirigida, no invención. |
| **R1** | Mobile | Claude Design | **Sonnet 5** | medio | Mecánico y con reglas claras. Gastar Opus acá es tirar plata. |
| **R2** | Movimiento | Claude Design | **Sonnet 5** | alto | Roza el gusto, pero las reglas de contención son explícitas y verificables. |
| **R3** | Detalles premium | Claude Design | **Sonnet 5** | medio | Lista cerrada de cosas concretas. |
| **R4** | Que venda | Claude Design | **Opus 5** | alto | **Juicio de copy y de conversión** — ataca la razón de rechazo nº2 de Franco ("no apunta al marketing"). Sonnet escribe copy correcto; Opus escribe copy que suena a alguien. La diferencia se paga sola. |
| **R5** | Diagnóstico | Claude Design | **Opus 5** | alto | Es el crítico. Un crítico flojo devuelve obviedades. **Es el prompt que le forma el ojo a Toba**, así que la calidad de la crítica es la calidad del aprendizaje. |
| **U** | Corrida unificadora | Claude Code (skill) | **Opus 5** | alto | Multi-archivo, tiene que verificar que no rompió nada, y define el nivel final. Una sola corrida por demo: es el mejor lugar del proceso para gastar. |

**Cuentas de la asignación:** cuatro pasos en Opus (P0, P1, R4, R5) y la corrida final. Cinco en Sonnet. Los de Sonnet son los que se repiten más veces por demo (P2 son varios prompts), así que en volumen de tokens la mayor parte del proceso corre barato.

**Regla de escalado — DECIDIDO:** si un prompto de Sonnet devuelve algo flojo **dos veces seguidas**, se sube a Opus en vez de insistir. Insistir con el modelo chico en algo que no le sale es el gasto invisible.

---

# P0 · El prompt de dirección

**Dónde:** un chat de Claude (no Claude Design todavía). **Opus 5, esfuerzo alto.**
**Reemplaza al Gem Evaluador** (brief v3, §6.2).

**Qué hace, y por qué es el prompt más importante de la cadena:** recibe el material crudo del negocio y devuelve **dos cosas** — una ficha de dirección para el setter, y **el prompt de creación ya escrito**, cargado con el contenido real. Ese segundo entregable es la clave de todo: una demo no es genérica porque el modelo sea bueno, es específica **porque el prompt de creación lleva adentro las reseñas reales, los precios reales y la paleta real del negocio.**

### Qué pega el setter

Junto con el material: screenshots del Instagram, el logo, las reseñas copiadas, y lo que sepa del negocio.

> Sos el director de arte y estratega de develOP, una agencia que le hace páginas web premium a PyMEs de Tucumán, Argentina. Te voy a pasar el material que junté de un negocio y necesito que definas cómo va a ser su página, y que después me escribas el prompt para construirla.
>
> **El material que te paso:** screenshots de su Instagram, su logo, reseñas de Google copiadas tal cual, y los datos que averigüé del negocio.
>
> **Contexto de para qué es:** esta página es una **demo** — se construye antes de que el dueño nos contrate, para mostrársela y abrir la conversación. Tiene que impresionar en los primeros cinco segundos, en el celular, porque se la vamos a mandar por Instagram o WhatsApp. El dueño no es técnico: no le importa la tecnología, le importa verse mejor que su competencia.
>
> **Primero decime, en dos líneas, qué tipo de negocio es y a quién le vende.** Si el material no alcanza para saberlo, decímelo y pedime lo que falte en vez de suponer.
>
> **Después devolveme estas dos cosas, separadas y en este orden:**
>
> ### 1 · FICHA DE DIRECCIÓN
>
> Escribila para que la lea una persona, corta y concreta:
>
> - **La idea en una frase:** qué va a sentir alguien que abre esta página.
> - **Paleta:** tres o cuatro colores con su código, **sacados del material del negocio** (el logo, sus fotos, su feed). Si el material es un desastre de colores, elegí una paleta que le quede y explicá por qué.
> - **Tipografía:** una para títulos y una para texto, disponibles en Google Fonts, con una línea de por qué le van a este rubro.
> - **Tono del texto:** cómo habla este negocio. Si las reseñas o el Instagram muestran cómo habla, imitalo.
> - **Secciones, en orden**, con qué va en cada una.
> - **La acción principal:** qué queremos que haga el visitante (escribir por WhatsApp, llamar, reservar). Una sola.
> - **Los tres activos más fuertes que tiene este negocio** y dónde los vamos a usar. Ejemplo: 38 reseñas con 4,2 → van arriba, cerca del encabezado.
> - **Lo que falta y hace falta:** qué dato o material tendría que conseguir para que la página quede bien.
>
> ### 2 · EL PROMPT DE CREACIÓN
>
> Un prompt listo para pegar en **Claude Design**, en un bloque de código para que lo pueda copiar de una. Reglas de cómo escribirlo:
>
> - **Va cargado con el contenido real, no con instrucciones genéricas.** Los textos de cada sección escritos ya, con las palabras que va a leer el visitante. Las reseñas transcriptas. Los precios si los hay. Nada de "poné un texto sobre los servicios".
> - Especifica la paleta con sus códigos y las tipografías por nombre.
> - Especifica las secciones en orden, con qué va en cada una.
> - Dice explícitamente que tiene que verse bien en celular **y** en escritorio.
> - **No pide imágenes que no tenemos.** Si hay que usar un espacio para una foto que el negocio nos tiene que dar, que lo deje resuelto de forma elegante y decime en la ficha que ese lugar espera una foto.
> - Es un prompt de **construcción inicial completa**, no de iteración: pide la página entera de una.
>
> **Cerrá con una línea:** qué es lo más riesgoso de esta página, lo que más probablemente salga mal.

### Lo que el setter tiene que ver después

Que la ficha nombre **activos concretos del negocio** (esas reseñas, ese dato, esa foto). Si la ficha podría servir para cualquier negocio del mismo rubro, **P0 falló**: hay que volver a pegarlo con más material.

`[FRANCO]` — dos cosas para completar: la dirección estética de la casa (si existe una), y si querés que P0 tenga acceso a las páginas de la librería como referencia de nivel.

---

# P1 · El prompt de creación

**Dónde:** Claude Design, proyecto nuevo. **Opus 5, esfuerzo alto.**

**No es un prompt fijo: es el que generó P0.** Lo que la herramienta guarda es la plantilla de abajo, para que el setter pueda verificar que lo que P0 le dio está completo antes de pegarlo — y para que pueda arreglarlo a mano si le falta algo.

### Antes de pegar: elegir el modo de Claude Design

`[FRANCO]` — **este campo no lo puedo llenar yo.** Claude Design tiene configuraciones distintas antes de abrir un proyecto y no son indistintas. Cuál corresponde para una demo de página comercial de una sola vista es dato tuyo, y va acá, porque es el paso donde el setter se puede equivocar sin darse cuenta y arruinar todo lo que sigue.

### La plantilla de verificación

El prompt que P0 entregó tiene que tener, sí o sí:

| Tiene que estar | Cómo se verifica |
|---|---|
| Los textos reales de cada sección, escritos | Leelo: si dice "un texto sobre X", falta |
| La paleta con códigos | Buscá los `#` |
| Las tipografías por nombre | Buscá los nombres |
| Las secciones en orden | Contalas contra la ficha |
| La acción principal, una sola | Si hay tres botones distintos, falta decidir |
| Que pida mobile y escritorio | Buscá la palabra |

Si falta algo, **se completa antes de pegar**. Un prompt de creación incompleto se paga en cinco iteraciones después.

### Qué tiene que ver el setter después

- **La página entera existe**, con todas las secciones de la ficha.
- **Los textos son los del prompt**, no inventados.
- **En celular, el encabezado y la acción principal entran juntos** en la primera pantalla.

Si la primera versión sale genérica, **el problema casi siempre es el prompt, no el modelo**. Volver a P0 con más material sale más barato que pelear con iteraciones.

---

# P2 · El roadmap de secciones

**Dónde:** el mismo chat de Claude Design. **Sonnet 5, esfuerzo alto.**

**Qué hace:** convierte la ficha en una lista de prompts cortos, uno por sección o por tanda, para que el setter avance de a poco en vez de pedir todo de nuevo cada vez que algo no le gusta.

### Qué pega el setter (una sola vez, después de la primera versión)

> Ya tenemos la primera versión de la página. Antes de seguir, armame un plan de mejoras **de a una**, en orden de impacto: qué conviene ajustar primero y qué después, con un prompt corto y listo para pegar por cada paso.
>
> Reglas del plan:
> - Máximo seis pasos. Si se te ocurren más, quedate con los seis que más mueven la aguja.
> - Cada paso toca **una** cosa: una sección, o un aspecto transversal. Nunca "arreglá todo".
> - Cada prompt dice **qué no tocar**, para que no me rehagas lo que ya está bien.
> - No incluyas mobile, animaciones ni detalles finales: eso lo hago después con prompts propios.
>
> Devolveme el plan como una lista numerada, cada paso con su prompt en un bloque de código aparte.

### Qué tiene que ver el setter después

Que ningún paso del plan diga "mejorá la estética" o "hacelo más lindo". Un paso sin objeto concreto es un paso que va a salir mal. Si aparece uno así, pedirle que lo reformule.

---

# R1 · Mobile

**Sonnet 5, esfuerzo medio.** Se corre **antes** de animaciones — al revés, las animaciones se rehacen.

> Revisá la página entera en mobile (375px de ancho) y arreglá lo que esté roto o incómodo:
>
> - Nada se desborda horizontalmente. Cero scroll lateral.
> - Los textos largos cortan bien: sin palabras partidas raro, sin líneas de una sola palabra huérfana.
> - **Lo primero que se ve, sin scrollear, comunica qué es el negocio y qué puede hacer el visitante.** Si el título y la acción principal no entran juntos, comprimí el encabezado hasta que entren: menos alto, menos padding, título más corto si hace falta.
> - Todos los botones y links se tocan con el pulgar: alto cómodo, separados entre sí, nada pegado al borde.
> - Las imágenes no deforman, no tapan texto, no empujan el contenido al cargar.
> - Menús, acordeones y cualquier cosa que se abra funcionan con el dedo, no solo con mouse.
> - Los tamaños de texto siguen siendo legibles sin hacer zoom.
>
> **No toques** el contenido, los colores ni la estética general: esto es adaptación, no rediseño. Al terminar, listame qué arreglaste.

**Verificación:** abrir en el ancho de un celular y confirmar dos cosas — **encabezado y acción principal juntos en la primera pantalla**, y cero scroll horizontal en cualquier sección.

---

# R2 · Movimiento

**Sonnet 5, esfuerzo alto.**

> Agregá movimiento a la página, con criterio de página premium y no de plantilla:
>
> - Las secciones aparecen suavemente al entrar en pantalla, **una sola vez**, sin rebotes ni exageraciones.
> - Los botones y las tarjetas responden al mouse con un cambio mínimo y rápido.
> - Las transiciones son cortas. Nada hace esperar al visitante.
> - **Respetá la preferencia de movimiento reducido**: si el sistema del visitante lo pide, todo aparece sin animar.
> - El movimiento en mobile es más discreto que en escritorio: menos desplazamiento, menos duración.
>
> **Reglas duras:** nada parpadea. Nada se mueve en loop infinito. Nada aparece, desaparece o se mueve **mientras el visitante está leyendo**. Nada empuja el contenido al animarse. Si una animación llama más la atención que el contenido que anima, está mal y la saco.
>
> Al terminar, decime qué animaste y con qué duración.

**Verificación:** recargar y bajar una vez, despacio. **Nada tiene que distraer de la lectura.** Si algo te llama la atención dos veces, se saca.

---

# R3 · Los detalles que la hacen sentir cara

**Sonnet 5, esfuerzo medio.**

> Agregá los detalles que distinguen una página trabajada de una generada:
>
> - **Pantalla de carga breve** con el logo o la marca, que desaparezca sola. Corta: no puede hacer esperar.
> - **Estados completos de todo lo que se toca**: reposo, mouse encima, presionado, y foco visible para quien navegue con teclado.
> - **Marca en los bordes del navegador**: icono de pestaña, título de pestaña con el nombre del negocio, color de la barra del navegador en mobile.
> - **La vista previa al compartir el link**: imagen, título y descripción, para cuando alguien lo manda por WhatsApp o Instagram.
> - **Nada roto ni vacío**: ninguna imagen que no cargue, ningún espacio en blanco donde falte contenido, ningún link que no vaya a ningún lado. Si algo espera un dato que no tenemos, resolvelo de forma elegante y decímelo.
>
> `[FRANCO]` — acá van los detalles marca de la casa de develOP, cuando estén definidos.

**Verificación, y es la más importante de todo el refinamiento:** **mandate el link a vos mismo por WhatsApp y mirá la vista previa.** Eso —la tarjetita con imagen y título— es literalmente lo primero que ve el prospecto, antes de decidir si abre. Si sale sin imagen o con el título vacío, la demo perdió antes de empezar.

---

# R4 · Que venda, no solo que se vea

**Opus 5, esfuerzo alto.** Es el prompt que ataca la razón de rechazo nº2.

> Mirá la página como si fueras el dueño de este negocio viéndola por primera vez, y arreglá lo que no le vende:
>
> - **El visitante entiende en cinco segundos qué es este negocio y qué gana con él.** Si no, reescribí el encabezado. Nada de frases que podrían ser de cualquier rubro.
> - **Hay una sola acción principal**, clara, y repetida a lo largo de la página en los momentos donde el visitante ya está convencido. No cinco acciones compitiendo.
> - **El texto habla como habla el negocio, no como una agencia.** Prohibido: "soluciones integrales", "excelencia", "compromiso con la calidad", "más de X años de experiencia" como frase suelta sin dato. Si una frase podría estar en la página de cualquier otro negocio del país, no sirve.
> - **Las pruebas están a la vista y arriba**: reseñas reales transcriptas, cantidad y promedio, años de trabajo, fotos propias. Lo que haya, cerca del encabezado y no enterrado al final.
> - **Los datos de contacto se encuentran sin buscar**, y todo lo que se pueda tocar es tocable: el teléfono llama, la dirección abre el mapa, WhatsApp abre el chat con un mensaje ya escrito.
> - **Sacá lo que no aporta.** Si una sección no ayuda a que el visitante actúe, decime por qué la dejarías antes de dejarla.
>
> **No agregues información que no tengas.** Si falta un dato importante, decímelo en vez de inventarlo — una demo con datos inventados es peor que una incompleta.
>
> Al terminar, decime qué cambiaste y qué frase te parece la más débil que quedó.

**Verificación:** leer **solo el encabezado y el primer llamado a la acción, en voz alta**. Si suena a agencia y no al negocio, volver a pegar con la corrección.

---

# R5 · El diagnóstico

**Opus 5, esfuerzo alto.** No arregla nada: enseña a ver.

> Mirá la página con ojo crítico de director de arte y decime **las tres cosas que más la delatan como generada por IA**, en orden de gravedad.
>
> Para cada una: **qué está mal**, **por qué se nota** (qué es lo que el ojo registra aunque no lo sepa nombrar), y **qué harías**. Sé concreto: nombrá la sección y el elemento.
>
> **No la arregles todavía** — quiero elegir. Y no me digas que está bien si no está: prefiero que seas duro acá que descubrirlo cuando el cliente no contesta.

**Para qué existe, además de lo obvio:** `[FRANCO]` — este es el prompt que más se parece a tus audios de corrección, y es el que más rápido le va a formar el ojo a Toba. Vale la pena que devuelva la crítica en el mismo idioma que usás vos: si le hablás de "que se sienta premium" y el prompt le habla de "jerarquía tipográfica", va a aprender dos vocabularios en vez de uno.

---

# U · El skill de la corrida unificadora

**Claude Code, Opus 5, esfuerzo alto.** Una sola corrida por demo.

## Su descripción — la parte que decide si se dispara

```
name: pulir-demo
description: >
  Eleva una demo web ya construida al nivel de una página trabajada
  profesionalmente. Úsalo cuando exista una carpeta con una demo
  generada (HTML/CSS/JS) que haya que pulir antes de publicarla y
  mostrarla a un prospecto. Unifica el trabajo de prompts previos,
  corrige inconsistencias visuales y agrega los detalles que
  distinguen una página artesanal de una generada. NO lo uses para
  construir una página de cero ni para rediseñarla.
```

## Las reglas, adentro del skill y no en la cabeza de quien lo corre

1. **Aditivo, nunca refundación.** Se agregan capas sobre lo que existe. **Prohibido** reescribir un archivo de cero, cambiar la estructura de secciones o reemplazar el contenido. Si la única forma de mejorar algo es rehacerlo, **no se hace: se reporta.**
2. **Inventario antes de tocar.** Primero se listan las secciones en orden con su contenido principal, y se guarda. **Ese inventario es el contrato:** al terminar tiene que estar completo e idéntico.
3. **Verificación obligatoria al cierre.** La razón de ser de esta regla es concreta: **Toba no va a poder detectar una regresión.** Se comprueba y se reporta:
   - La página abre sin errores de consola.
   - **Todas las secciones del inventario siguen ahí, en el mismo orden.**
   - Ningún texto del contenido original desapareció.
   - Todos los links y botones apuntan a donde apuntaban.
   - Todas las imágenes cargan.
   - Responde bien en 375px y en escritorio.
4. **Si algo se rompe, se revierte y se reporta.** No se deja una página a medio arreglar: es peor que la original, porque nadie sabe qué quedó tocado.
5. **Reporte final en criollo**, para el setter: qué se mejoró, qué no se pudo, y qué conviene que mire un humano antes de mandarla.

## Qué hace, en orden

1. **Inventario** (regla 2).
2. **Unificar lo que quedó inconsistente** entre prompts — es el trabajo principal, porque cada prompt anterior tocó la página sin ver a los otros: que los espaciados entre secciones sigan una misma escala; que los tamaños de texto sean un sistema y no valores sueltos; que los colores salgan de la paleta, sin variantes casi iguales; que redondeos y sombras sean coherentes.
3. **Pulir la jerarquía**: que el ojo caiga primero en lo que importa, que ninguna sección compita con el encabezado.
4. **Cerrar los detalles a medias** que R3 pueda haber dejado: estados de interacción completos, foco visible, vista previa al compartir, icono de pestaña.
5. **Rendimiento básico**: imágenes que no pesen de más, carga que no se trabe. **Una demo lenta en el celular del dueño no cierra**, por linda que sea.
6. **Accesibilidad mínima**: contraste legible, imágenes con descripción, todo alcanzable con teclado. `[FRANCO]` — decidí si entra. **Mi recomendación es que sí**, y no por corrección: el contraste flojo se lee como descuido, y descuido es exactamente lo que hay que evitar.
7. **Verificar** (regla 3) y **reportar** (regla 5).

## Lo que el skill NO hace

- No cambia el contenido ni los textos de venta. Eso es R4, y lo decide una persona.
- No agrega secciones nuevas.
- No cambia la dirección estética. `[FRANCO]` — si querés que sí pueda, primero hay que definir cuál es la dirección de develOP; sin eso, "mejorá la estética" es una instrucción vacía y va a devolver cualquier cosa.
- No publica. Publicar es un paso del setter.

---

# Parte 7 · Modos de falla y cómo se recupera el setter

Esto es lo que evita que Toba quede trabado con una página peor que la que tenía. **Va en la herramienta, no en un manual aparte.**

| Qué pasó | Qué hacer |
|---|---|
| **Un prompt empeoró la página** | Volver atrás en Claude Design y **no repetir el mismo prompt**: reformularlo diciendo qué NO tocar. Repetir lo mismo suele dar el mismo resultado. |
| **La primera versión salió genérica** | El problema es P0, no el modelo. Volver a P0 con más material. Cinco iteraciones no arreglan un prompt de creación vacío. |
| **Un prompt de Sonnet salió flojo dos veces** | Subirlo a Opus. No insistir: insistir con el modelo chico es el gasto invisible. |
| **La página perdió una sección** | Volver atrás inmediatamente. Si ya se publicó, no mandarla. |
| **El modelo pide un dato que no tenemos** | **No inventarlo.** Anotarlo como material faltante y resolver el espacio de forma elegante. Una demo con datos falsos es peor que una incompleta: el dueño lo va a notar en el primer segundo. |
| **La corrida unificadora reporta que rompió algo** | Está diseñada para revertir sola. Si el reporte dice que no pudo, la demo va como estaba antes de U. |
| **El setter no sabe qué está mal** | R5. Para eso existe. |

---

# Parte 8 · Economía de tokens

Franco lo planteó como preocupación, así que queda explícito:

- **Los pasos caros son pocos y están elegidos**: P0, P1, R4, R5 y U. Todo lo demás corre en Sonnet.
- **El paso que más se repite (P2) es el barato.** Eso es a propósito.
- **Iterar sale más caro que dirigir bien.** Cada iteración que se ahorra en P1 vale más que cualquier optimización de modelo, y las iteraciones se ahorran cargando el prompt de creación con contenido real.
- **U gasta más que el resto junto, y se acepta**: es una sola corrida y es la que define el nivel de la página.
- **Contra-regla, para que la economía no se coma la calidad:** ahorrar en R4 o R5 es falso ahorro. Son los dos que deciden si el negocio contesta.

---

# Parte 9 · Lo que necesito de vos para que esto deje de ser borrador

1. **Dos o tres páginas de la librería** — links alcanzan. Es lo que convierte todos estos prompts de genéricos a específicos de develOP, y lo que le da a P0 una vara de nivel.
2. **La respuesta de la plomería** (Parte 0): ¿se puede exportar el proyecto de Claude Design como archivos? De eso depende que U exista.
3. **El modo de Claude Design** que corresponde para esto (P1). No lo puedo saber y es donde el setter se puede equivocar sin darse cuenta.
4. **Los `[FRANCO]`**: la dirección estética de la casa, los detalles marca de la casa, si la accesibilidad entra en U, y si U puede tocar estética.
5. **Los prompts que ya tengas escritos**, si existe alguno. Prefiero corregir los tuyos que reemplazarlos por los míos: los tuyos tienen tu ojo adentro.
