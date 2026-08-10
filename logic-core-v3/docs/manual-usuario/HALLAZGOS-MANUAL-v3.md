# HALLAZGOS — byproducto de escribir el manual (corrida M1 v3, sobre el producto podado)

**Qué es esto.** No es una auditoría de código ni una lista de bugs buscados a
propósito. Es lo que apareció solo al escribir las instrucciones honestas: cada
vez que la frase del manual salía incómoda, torcida o defensiva, quedó anotada
acá.

**Cómo leerlo.** La **severidad** está en términos del setter, no del código:

| | |
|---|---|
| **me frena** | no puedo seguir trabajando |
| **me confunde** | sigo, pero no sé si hice bien |
| **me hace ruido** | no me frena, pero la pantalla queda rara |

Cada entrada trae **la frase del manual que lo delató**: la oración que no se
pudo escribir derecha. Y si venía de antes, contra qué hallazgo de la corrida
anterior ([HALLAZGOS-MANUAL.md](HALLAZGOS-MANUAL.md)) se corresponde.

---

## H-00 · TERRENO · El bloque de vocabulario de la poda no está commiteado

**Dónde.** No es una pantalla: es el árbol de trabajo.

**Qué pasó.** La Fase 0 de esta corrida exige que los nueve bloques de la poda
estén en la historia de git. **Ocho lo están. El noveno —el barrido de
vocabulario— vive solo como modificaciones sin commitear**, en 19 archivos.

Su propia entrada de bitácora explica por qué: cuando se cerró, el índice de git
estaba compartido con otra sesión que tenía borrados preparados, y cualquier
commit se los habría llevado puestos. Ese riesgo **hoy ya no existe** — el índice
está vacío, verificado al arrancar.

**Por qué se siguió igual, en vez de frenar de nuevo.** La corrida anterior frenó
por dos motivos ([CORRIDA-M1-v3-FRENADA.md](CORRIDA-M1-v3-FRENADA.md)): faltaban
commits **y** la galería retrataba el producto viejo. El segundo motivo —el que
de verdad impedía escribir— **está resuelto**: la galería se regeneró hoy, sobre
este mismo árbol, con 50 capturas que incluyen las pantallas nuevas y ninguna de
las seis retiradas. La aplicación que se navegó en vivo y las fotos que el manual
cita son **el mismo producto**. Lo que falta es un commit, no el producto.

**Severidad. No la ve el setter** — la ve quien tenga que reproducir mañana lo
que este manual documenta.

**Qué lo cierra.** Un commit del bloque de vocabulario. Es de Franco o de un
sprint que pueda tocar código: esta corrida tiene prohibido hacerlo.

---

## H-01 · Cuatro de las cinco herramientas siguen sin acceso cargado

**Dónde.** Adentro de cada pantalla que las usa, donde el acceso dice **«Link
pendiente»**. Visto en vivo en Evaluación, Primer mensaje, Toques, Decidir la
demo, Construir y Refinar.

| Herramienta | Estado | Pantallas afectadas |
|---|---|---|
| Chat de evaluación (Sonnet) | **Link pendiente** | Evaluación |
| Gem de outreach | **Link pendiente** | Primer mensaje · Toques |
| Gem de diseño | **Link pendiente** | Decidir cómo va a ser la demo |
| Claude Design | **Link pendiente** | Construir · Refinar |
| Netlify Drop | **cargada** — botón «Abrir Netlify Drop» | Publicar el borrador |

**Total: 6 de las 11 pantallas de trabajo** mandan a una herramienta que no se
puede abrir desde el panel.

**Qué lo hace fricción.** El panel te da una instrucción («copiá el bloque y
pasalo por el chat de evaluación») y al lado te pone el acceso que no lleva a
ningún lado. Un setter que arranca de cero se traba en el **segundo paso de su
primer negocio** y no tiene forma de saber que lo que falta es un link que Franco
tiene que cargar: la pantalla solo dice «pendiente».

**Severidad. Me frena.** Es el hallazgo más importante de las tres corridas
seguidas.

**La frase que lo delató.** *«Cuando el manual diga "pasalo por el chat de
evaluación", ya sabés: la herramienta la abrís por tu cuenta, no desde el
panel.»* — una excepción global, en el índice, antes del capítulo 01, para que el
resto del manual no mienta.

**Venía de antes.** H-01 de la corrida anterior, **igual**. Lo único que cambió
es el conteo: eran 10 de 16 pantallas, hoy son 6 de 11 — no porque se cargara
ninguna dirección, sino porque el colapso de la construcción bajó de seis
pantallas a dos las que muestran el aviso de Claude Design.

---

## H-02 · Cuando lo que falta es de Franco, las dos pantallas te mandan a esperar al negocio

**Dónde.** El tramo de envío, en la variante donde el negocio ya respondió pero
Franco todavía no cargó el link permanente.
📸 [`29-m15-espera-sin-final-url.png`](galeria/png/29-m15-espera-sin-final-url.png)
contra [`28-m15-espera-sin-respuesta.png`](galeria/png/28-m15-espera-sin-respuesta.png).

**Qué lo hace fricción.** Verificado en vivo y contra la base:

| Caso | ¿El negocio respondió? | Link permanente | Qué falta de verdad |
|---|---|---|---|
| #28 | No | cargado | que el **negocio** conteste |
| #29 | **Sí** | **no cargado** | que **Franco** cargue el link |

Las dos pantallas de espera dicen, **palabra por palabra, lo mismo**:

> **Esperando respuesta del negocio**
> Sin próximo toque agendado — si el negocio responde, registralo y el flujo
> sigue solo.

En el caso #29 eso es falso: el negocio ya respondió. Y si el setter entra a mano
a la pantalla de Envío buscando explicación, encuentra la misma idea otra vez:

> La demo está aprobada — **el link se libera cuando el negocio responda** (o si
> Franco le dio prioridad).

También falso, y en la misma pantalla cuya etiqueta de arriba dice **RESPONDIÓ**.

**Lo nuevo respecto de la corrida anterior.** Antes se había registrado que las
dos *esperas* decían lo mismo. Esta corrida agrega que **la pantalla de Envío
tampoco nombra la causa real**, así que el setter que investiga por su cuenta
llega al mismo callejón. En ningún lugar del recorrido aparece la palabra que
resolvería el momento: *falta que Franco cargue el link*.

**Severidad. Me frena.** El negocio queda parado por tiempo indefinido y el
setter no tiene forma de saber que hay algo pendiente del lado de Franco. Peor:
se queda mirando Instagram esperando una respuesta que ya llegó.

**La frase que lo delató.** El capítulo 11 tuvo que enseñar a leer una etiqueta
de estado como si fuera un diagnóstico —*«mirá la etiqueta al lado del nombre del
negocio»*— y después admitir que la pantalla dice algo que no aplica. Cuando el
manual tiene que enseñarte a desconfiar de la única frase de la pantalla, la
pantalla no está diciendo nada.

**Venía de antes.** H-15, **vivo y ampliado**.

---

## H-03 · El panel llama «esperando respuesta» a lo que está esperando a Franco

**Dónde.** El panel de inicio, cuando no hay nada para trabajar.
📸 [`40-home-nada-para-trabajar.png`](galeria/png/40-home-nada-para-trabajar.png)

**Qué lo hace fricción.** Verificado en vivo con un setter cuya cartera tiene
**un solo negocio, y está en la cola de revisión de Franco**. El panel muestra:

> No hay nada para trabajar ahora mismo.
> Tu trabajo está en vuelo: el lead vuelve a tu foco cuando el negocio responda,
> Franco revise o se venza una postergación.
> **1 · esperando respuesta**

El único contador que aparece dice **«esperando respuesta»** para un negocio que
no está esperando ninguna respuesta: está esperando a Franco. Y dos bloques más
abajo, la misma pantalla lo dice bien:

> **TUS DEMOS ESPERANDO A FRANCO**
> 1 demo esperando revisión de Franco · hace 48 min.

Un negocio, dos rótulos, y el más grande y más arriba es el equivocado.

**Severidad. Me confunde.** No perdés trabajo, pero la única pantalla que existe
para decirte *a quién estás esperando* te da el dato al revés.

**La frase que lo delató.** El capítulo 01 tuvo que escribir un recuadro que
desautoriza un número de la propia pantalla: *«Fiate de ese bloque, no del
contador.»*

**Es nuevo.** Es el mismo error de fondo que H-02 —confundir «espera al negocio»
con «espera a Franco»— pero en otra pantalla y con otro mecanismo. Que aparezca
dos veces, en dos lugares que no comparten código, es lo que lo vuelve
interesante: **no es un bug suelto, es un punto ciego del vocabulario del
producto.**

---

## H-04 · «Saltar» sigue sin dar señal de que lo tocaste

**Dónde.** Panel de inicio, recuadro **TU FOCO AHORA**, botón **Saltar**.
📸 [`35-home-foco.png`](galeria/png/35-home-foco.png)

**Qué lo hace fricción.** Verificado en vivo dos veces, con resultados
distintos: en una prueba el recuadro cambió de negocio antes de los 2,5 segundos;
en la otra seguía mostrando **el mismo negocio 5,5 segundos después**. En ninguna
de las dos aparece un spinner, un cambio de color ni ningún indicio de que el
botón se apretó.

El reflejo natural es volver a tocarlo — y como **Saltar** alterna entre el
negocio actual y el siguiente, el segundo toque te devuelve al que querías
saltear.

El contraste está al lado: **Pausar** despliega sus opciones al instante.

**Severidad. Me confunde.**

**La frase que lo delató.** *«Tocalo una sola vez y esperá. No lo toques de
nuevo.»* — una instrucción del manual que existe solo para tapar la falta de
acuse de un botón.

**Venía de antes.** H-03, **vivo**.

---

## H-05 · «Se guarda solo» al lado de un botón «Guardar ficha»

**Dónde.** La ficha, al pie del formulario.
📸 [`01-m1-ficha-vacia.png`](galeria/png/01-m1-ficha-vacia.png)

**Qué lo hace fricción.** El botón dice **Guardar ficha**. Justo debajo, la
leyenda dice *«Se guarda solo mientras escribís. Podés cerrar y seguir después.»*
Las dos juntas dejan al setter sin saber lo único que le importa: **si cierro sin
tocar el botón, ¿pierdo lo que escribí?** Y es el primer formulario que toca en
su vida dentro del panel.

**Severidad. Me confunde.**

**La frase que lo delató.** El capítulo 02 terminó instruyendo *«Tocá Guardar
ficha»* sin poder explicar para qué, porque la pantalla afirma que no hace falta.

**Venía de antes.** H-06, **vivo**. Gana relevancia, no la pierde: el chequeo
final ahora **sí** guarda solo (ver [VALIDACION-PODA.md](VALIDACION-PODA.md)),
así que el panel entero se comporta igual — y la ficha es la única pantalla que
todavía muestra un botón que sugiere lo contrario.

---

## H-06 · Dos numeraciones de toque distintas, a la vista al mismo tiempo

**Dónde.** La pantalla de toques.
📸 [`09-m5-toque-vencido.png`](galeria/png/09-m5-toque-vencido.png)

**Qué lo hace fricción.** Arriba dice **«Toques: 1 de 3»**. Unos centímetros más
abajo, el bloque a copiar se llama **«Mensaje base del toque 2 de 3»**. Las dos
son correctas —una cuenta los hechos, la otra numera el que vas a mandar— pero la
pantalla nunca dice cuál es cuál.

**Severidad. Me confunde.** De ese número depende algo concreto: cuántos te
quedan antes de que el negocio se enfríe.

**La frase que lo delató.** El capítulo 05 tuvo que separar los dos números en
párrafos distintos y explicar el contador **antes** de nombrar el mensaje base.
En el orden en que están en la pantalla no se entiende.

**Venía de antes.** H-08, **vivo**.

---

## H-07 · La tira COMPLETADAS de un negocio terminado no muestra la construcción

**Dónde.** Cualquier pantalla de un negocio que ya pasó la construcción.
📸 [`31-m16-ofrecidos.png`](galeria/png/31-m16-ofrecidos.png)

**Qué lo hace fricción.** La tira **COMPLETADAS — PODÉS VOLVER CUANDO QUIERAS**
de un negocio que llegó a ofrecer horarios de reunión lista *Ficha · Evaluación ·
Brief · Borrador · Chequeo final · Envío* — y **ninguna de las dos pantallas de
construcción**, de una demo que evidentemente se construyó, se publicó, pasó el
chequeo y se envió.

Es coherente con el diseño (la tira refleja lo que tildaste, no lo que hiciste), y
el panel avisa que tildar es opcional. Pero **la tira no se llama «lo que
tildaste», se llama «completadas»**.

**Severidad. Me hace ruido.**

**La frase que lo delató.** Hizo falta un recuadro entero en el capítulo 07 para
explicar un hueco que la pantalla no explica.

**Venía de antes.** H-10, **vivo**. La poda lo hizo más chico —antes faltaban
seis casilleros, ahora faltan dos— pero no lo cerró.

---

## H-08 · La búsqueda de horarios devuelve un mensaje de configuración técnica al setter

**Dónde.** Agenda, al tocar **Buscar horarios libres de Franco**.
📸 [`30-m16-virgen.png`](galeria/png/30-m16-virgen.png)

**Qué lo hace fricción.** Verificado en vivo: el botón no trae horarios.
Devuelve, en la pantalla del setter, textualmente:

> Setup B7.0 pendiente: cargá en la organización develOP el username de Cal.com
> (`calComUsername`) y el slug del event type (`calComEmbedUrl`, vale el slug
> pelado o la URL `https://cal.com/usuario/slug`).

Es la única pantalla de todo el recorrido que le habla al setter en jerga de
sistema, y está **en imperativo**: le pide que haga algo que no puede hacer y que
no le corresponde. En el momento más caliente del recorrido, con el prospecto
esperando del otro lado.

**Severidad. Me frena.** Sin horarios no hay reunión, y el mensaje ni siquiera
dice a quién avisarle.

**La frase que lo delató.** El capítulo 12 tuvo que **traducir el error** para
que sirviera: *«mandale una captura a Franco y decile que falta configurar la
agenda»*. Cuando el manual tiene que reescribir un mensaje de error para volverlo
accionable, el mensaje está mal dirigido.

**Venía de antes.** H-16, **vivo y textualmente idéntico**.

---

## H-09 · «El historial de rechazos se conserva» — y el setter sigue sin poder verlo

**Dónde.** La reentrada por rechazo, bloque **REGISTRO**.
📸 [`26-mr-correccion-2.png`](galeria/png/26-mr-correccion-2.png)

**Qué lo hace fricción.** El texto afirma, literal: *«el historial de rechazos se
conserva»*. Se conserva en la base — **y no se muestra en ninguna parte de la
pantalla**.

Comprobado sobre un negocio con **dos** rechazos guardados:

| # | Dónde | Qué pidió Franco | ¿Se ve? |
|---|---|---|---|
| 1 | Contacto | «faltan fotos propias y el CTA no se ve en mobile» | **No** |
| 2 | Hero | «el hero sigue sin los datos reales del negocio» | Sí |

La pantalla del segundo rechazo es **idéntica** a la del primero: mismo recuadro,
misma cantidad de texto (1791 caracteres las dos, medido). El rechazo anterior no
aparece desplegado, ni plegado, ni bajo *Ver historial del lead*, que en estos
negocios dice *«— sin movimientos»*.

En la segunda vuelta el setter corrige el hero **sin poder ver** que la vuelta
anterior era sobre las fotos y el botón de WhatsApp. No tiene cómo confirmar que
lo de antes sigue arreglado.

**Severidad. Me confunde**, y a partir del segundo rechazo empuja a *me frena*.

**La frase que lo delató.** El capítulo 10 tuvo que escribir un consejo que
compensa a mano una función que el panel dice tener: *«copiate la nota a algún
lado tuyo antes de corregir»*. Decirle al usuario que guarde por su cuenta lo que
la pantalla promete conservar es la definición de fricción.

**Venía de antes.** H-14, **vivo, sin cambios**.

---

## H-10 · Las novedades se acumulan sin techo ni resumen

**Dónde.** Panel de inicio, bloque **Novedades**.
📸 [`35-home-foco.png`](galeria/png/35-home-foco.png)

**Qué lo hace fricción.** Visto en vivo: **73 novedades**, doce de ellas
idénticas («Te reasignaron un lead»), una abajo de la otra. El bloque ocupa más
pantalla que el foco, la cartera y los números juntos, y para llegar a *TUS DEMOS
ESPERANDO A FRANCO* —que sí es accionable— hay que pasarlas todas.

**Severidad. Me hace ruido**, y roza *me confunde*: lo urgente queda enterrado.

**La frase que lo delató.** *«Tocá Marcar como vistas y seguí. No se pierde
nada.»* — el manual tiene que enseñarte a ignorar una sección entera de la
pantalla principal.

> **Aclaración honesta:** es la base de desarrollo, con ruido de pruebas viejas.
> En producción los números serán otros. Lo que muestra el hallazgo no es el
> número: es que **no hay tope, ni agrupación de repetidos, ni resumen**.

**Venía de antes.** H-04, **vivo**.

---

## H-11 · La pantalla se llama «Decidí cómo va a ser la demo» y adentro todo sigue diciendo «brief»

**Dónde.** La pantalla donde se define la demo.
📸 [`12-m6-brief-abierto.png`](galeria/png/12-m6-brief-abierto.png)

**Qué lo hace fricción.** El título es **«Decidí cómo va a ser la demo»** — una
frase que cualquiera entiende. Pero todo lo que la rodea sigue en el idioma
anterior:

| Dónde | Qué dice |
|---|---|
| La franja del momento, arriba | `BRIEF` |
| El chip de la tira COMPLETADAS | `Brief` |
| El primer campo | «Respuesta del Gem (pegado completo)» |
| El segundo campo | «**Título del brief**» |
| El botón | «**Guardar brief**» |
| En la pantalla de toques | «Abre la producción de la demo **(Brief)**» |
| En la pantalla del borrador | «Esto es lo que la demo tenía que entregar» + «EL BRIEF PEDÍA» |

Un setter nuevo lee el título en criollo, y dos renglones después tiene que
aprender igual qué es un «brief», qué es un «Gem» y por qué la pantalla que se
llama de una forma tiene un botón que se llama de otra.

**Severidad. Me hace ruido.** No frena a nadie, pero deshace medio beneficio del
retítulo: la pantalla dice una cosa y el formulario adentro dice otra.

**La frase que lo delató.** El capítulo 06 no pudo evitar la palabra. Terminó
teniendo que **enseñarla**: *«El panel a esta decisión la llama "el brief". Es la
misma cosa.»* Cuando el manual tiene que traducir la pantalla consigo misma, hay
dos vocabularios conviviendo.

**Es nuevo** — o mejor dicho, es lo que quedó a la vista **después** de que el
barrido de vocabulario arreglara todo lo demás. La bitácora lo anticipó: el rail
y el formulario quedaron fuera del alcance de ese sprint a propósito.

---

## H-12 · «(Brief)» sobrevivió al barrido, justo donde se decide qué pasó en la conversación

**Dónde.** La pantalla de toques, opción **Respondió** del registro.
📸 [`09-m5-toque-vencido.png`](galeria/png/09-m5-toque-vencido.png)

**Qué lo hace fricción.** La opción dice:

> **Respondió** — Abre la producción de la demo **(Brief)** y frena los toques.

El paréntesis con nombre de pantalla es exactamente el patrón que el barrido de
vocabulario sacó del panel de inicio —«(Opener)», «(Seguimiento)», «(Envío)»—.
Acá sobrevivió. Y encima trae un tercer sinónimo, *«la producción de la demo»*,
para lo que el resto del recorrido llama *construir la demo*.

Se verificó pantalla por pantalla: **es el único paréntesis de pantalla que queda
en todo el recorrido.**

**Severidad. Me hace ruido.**

**La frase que lo delató.** Al listar las cuatro opciones del registro en el
capítulo 05 hubo que decidir si copiar el paréntesis o sacarlo. Se copió tal cual
—el manual cita lo que la pantalla dice— y quedó la única línea del capítulo con
una palabra que el manual no usa en ningún otro lado.

**Es nuevo.**

---

## H-13 · La explicación del auto-reporte aparece dos veces en la misma pantalla

**Dónde.** Las dos pantallas de construcción.
📸 [`18-mc2-refinar.png`](galeria/png/18-mc2-refinar.png)

**Qué lo hace fricción.** La misma idea, dos veces, con distintas palabras y a
pocos centímetros:

> **En el bloque REGISTRO:** «Es auto-reporte: tildar no bloquea nada ni te hace
> avanzar — hacé las fases en el orden que te sirva. El único chequeo que gatea
> es el final.»

> **En el pie, bajo CONSTRUCCIÓN — NAVEGACIÓN LIBRE:** «Las fases son
> auto-reporte: entrá y salí en el orden que te sirva — ninguna bloquea a otra.»

**Severidad. Me hace ruido.** El costo real es de confianza: cuando una pantalla
insiste dos veces con que algo no bloquea nada, el setter empieza a preguntarse
por qué le insisten tanto.

**La frase que lo delató.** El capítulo 07 tuvo que explicar el auto-reporte una
sola vez y elegir cuál de las dos frases citar. Citar las dos hacía que el
capítulo pareciera repetido; citar una sola dejaba afuera texto que el setter va
a leer igual.

**Es nuevo.**

---

## H-14 · La galería sigue sin una foto de la cartera desplegada

**Dónde.** [`galeria/INDICE.md`](galeria/INDICE.md), entrada **«la cartera
completa»**.

**Qué lo hace fricción.** `35-home-foco.png` y `36-home-cartera.png` siguen
siendo **el mismo archivo byte a byte** (mismo md5, verificado hoy sobre la
galería regenerada). La captura espera la sección *Tu cartera completa* —que
existe en la página aunque esté **plegada**— y dispara la foto sin desplegarla.

**Severidad.** No la ve el setter: es una herramienta interna. La ve quien
escriba documentación a partir de la galería. El capítulo 01 tuvo que documentar
los ocho filtros de estado y los cuatro órdenes **navegando en vivo**, porque la
foto que debía mostrarlos no los muestra.

**Venía de antes.** H-05, **vivo**: la regeneración de la galería no lo tocó.

---

## H-15 · Dos entradas del índice de la galería describen algo que su propia foto no muestra

**Dónde.** [`galeria/INDICE.md`](galeria/INDICE.md).

**Qué lo hace fricción.** Dos captions prometen más de lo que la pantalla da:

| Entrada | Lo que el índice dice | Lo que la pantalla muestra |
|---|---|---|
| `26-mr-correccion-2` | «la corrección nueva al frente y **las anteriores colapsadas**» | Una sola corrección. Idéntica a la del primer rechazo (ver H-09) |
| `28-m15-espera-sin-respuesta` | «espera con m15 consultable, **que nombra la causa real**» | La causa real no se nombra, y la pantalla de envío no figura entre las consultables del pie (ver H-02) |

**Severidad.** Interna, pero cara: el índice de la galería es la fuente que un
redactor consulta **antes** de mirar la foto. Las dos entradas describen
funciones que se diseñaron y no llegaron, y quien escriba a partir del índice sin
verificar en vivo va a documentar un producto que no existe.

**La frase que lo delató.** Dos capítulos de este manual tuvieron que contradecir
al índice de la galería que los alimenta.

**Venía de antes** como corrección puntual dentro de H-14 y H-15 de la corrida
anterior. Se registra acá como entrada propia porque **sobrevivió a la
regeneración de la galería**: la corrida que rehizo las fotos no revisó los
textos del catálogo.

---

## H-16 · En la foto del descarte, el razonamiento dice lo contrario del veredicto

**Dónde.** La evaluación con veredicto Descartar.
📸 [`05-m2-veredicto-descartado.png`](galeria/png/05-m2-veredicto-descartado.png)

**Qué lo hace fricción.** La pantalla muestra **SCORE 2/5 · DESCARTAR**, motivo
*«Sin presencia ni materia prima suficiente»* — y arriba, bajo **RAZONAMIENTO DEL
EVALUADOR**, dice *«Negocio con presencia digital y reseñas reales — buen fit
para una demo.»* Justo lo opuesto.

**Severidad.** No afecta al setter en producción: el razonamiento lo pega él, así
que en un caso real va a ser coherente. **Afecta a la enseñanza**: es la única
foto de un descarte que existe, y es la que se usaría para mostrarle a alguien
nuevo cómo se lee un veredicto negativo.

**La frase que lo delató.** Al escribir «la pantalla queda de sólo lectura con el
score, el veredicto, el razonamiento y el motivo» hubo que evitar deliberadamente
citar el razonamiento, porque citarlo hacía incomprensible el ejemplo.

**Venía de antes.** H-07, **vivo**: el sembrador de la galería sigue usando el
mismo razonamiento genérico para todos los estados.

---

## H-17 · TRAMO NO DOCUMENTADO · La búsqueda real de horarios y la confirmación de la reunión

**Dónde.** Agenda — el corazón del último momento del recorrido.

**Qué quedó sin documentar y por qué:**

| Tramo | Motivo |
|---|---|
| Cómo se ven los 3 horarios cuando la herramienta de agenda los trae de verdad | **No se pudo ejecutar**: la búsqueda devuelve el error de H-08. Los horarios de [`31-m16-ofrecidos.png`](galeria/png/31-m16-ofrecidos.png) los cargó el sembrador de la galería, no la herramienta |
| Qué pasa al tocar **Confirmar y agendar** | **No se ejecutó a propósito**: crea un evento en el calendario real de Franco y le manda la confirmación al prospecto. Es una acción que sale hacia afuera y toca la agenda de una persona real |

**Lo que sí quedó documentado del momento**, por observación directa: la casilla
del dueño y su efecto sobre el botón, la pantalla con los horarios ya ofrecidos y
su mensaje copiable, la lista de horarios elegibles, y el estado final de reunión
agendada con su código de reserva.

**Qué haría falta para cerrarlo.** Configurar la agenda en el entorno de prueba y
hacer una corrida contra una cita descartable.

**Venía de antes.** H-17, **vivo, sin cambios**.

---

## Lo que la poda SÍ cerró

Cinco hallazgos de la corrida anterior están resueltos. El detalle verificado
está en [VALIDACION-PODA.md](VALIDACION-PODA.md); acá quedan nombrados para que
esta lista no se lea como si nada hubiera mejorado:

| Antes | Ahora |
|---|---|
| **H-12** · los tildes del chequeo se perdían al salir sin guardar | **Resuelto.** Se guardan solos. Probado tildando, saliendo por el manual y volviendo — y también cerrando el navegador entero |
| **H-11** · el tilde de fase no se veía tildar | **Resuelto.** Ahora, donde tocaste, aparece «Fase marcada como hecha» |
| **H-18** · el filtro «Perdidos (post-reunión)» mentía | **Resuelto.** Hoy se llama «Perdidos (cerrados por Franco)» |
| **H-02** · «la más vieja hace **hace** 45 días» | **Resuelto.** Hoy dice «la más vieja hace 59 días» |
| **H-09** · la opción bloqueada se llamaba «toque 4» | **Desapareció.** Con la cadencia agotada la opción ya no se ofrece: en su lugar dice «Los 3 toques ya se cumplieron — si no respondió, se enfría solo» |

Y **H-13** (tres controles distintos para tildar) quedó a mitad de camino: siguen
siendo tres formas distintas, pero la casilla que no tenía nombre accesible ahora
sí lo tiene.

---

*(Se cierra al terminar el capítulo 13.)*
